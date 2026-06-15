"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const notifications_service_1 = require("../notifications/notifications.service");
let ShopService = class ShopService {
    prisma;
    audit;
    notifications;
    constructor(prisma, audit, notifications) {
        this.prisma = prisma;
        this.audit = audit;
        this.notifications = notifications;
    }
    getBranchId(user) {
        const branchId = user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId');
        return branchId;
    }
    getUserId(user) {
        return (user?.userId ?? user?.id ?? null);
    }
    async listItems(visible, user) {
        const branchId = this.getBranchId(user);
        const where = { branchId };
        if (visible === 'true')
            where.isVisible = true;
        if (visible === 'false')
            where.isVisible = false;
        return this.prisma.shopItem.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async createItem(dto, user) {
        const branchId = this.getBranchId(user);
        const it = await this.prisma.shopItem.create({
            data: {
                branchId,
                title: dto.title,
                description: dto.description ?? null,
                imageUrl: dto.imageUrl ?? null,
                priceKiber: dto.priceKiber,
                isVisible: dto.isVisible ?? true,
            },
        });
        await this.audit.log(user, 'SHOP_ORDER_CREATED', 'ShopItem', it.id, {
            title: it.title,
        });
        return it;
    }
    async updateItem(id, dto, user) {
        const branchId = this.getBranchId(user);
        const it = await this.prisma.shopItem.findUnique({
            where: { id },
        });
        if (!it)
            throw new common_1.NotFoundException('ShopItem not found');
        if (it.branchId !== branchId) {
            throw new common_1.BadRequestException('Item belongs to another branch');
        }
        return this.prisma.shopItem.update({
            where: { id },
            data: {
                ...(dto.title !== undefined ? { title: dto.title } : {}),
                ...(dto.description !== undefined ? { description: dto.description } : {}),
                ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
                ...(dto.priceKiber !== undefined ? { priceKiber: dto.priceKiber } : {}),
                ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
            },
        });
    }
    async listOrders(status, user) {
        const branchId = this.getBranchId(user);
        const where = { branchId };
        if (status)
            where.status = status;
        if (user?.role === 'PARENT') {
            const parentUserId = user.userId ?? user.id;
            where.student = {
                parentLinks: {
                    some: {
                        parentUserId,
                    },
                },
            };
        }
        return this.prisma.shopOrder.findMany({
            where,
            include: {
                item: true,
                student: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createOrder(dto, user) {
        const branchId = this.getBranchId(user);
        const it = await this.prisma.shopItem.findUnique({
            where: { id: dto.itemId },
        });
        if (!it)
            throw new common_1.BadRequestException('itemId not found');
        if (it.branchId !== branchId) {
            throw new common_1.BadRequestException('item belongs to another branch');
        }
        const st = await this.prisma.student.findUnique({
            where: { id: dto.studentId },
        });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const o = await this.prisma.$transaction(async (tx) => {
            const order = await tx.shopOrder.create({
                data: {
                    branchId,
                    itemId: dto.itemId,
                    studentId: dto.studentId,
                    comment: dto.comment ?? null,
                    status: 'REQUESTED',
                },
            });
            await this.notifications.createShopOrderNotification(tx, {
                branchId,
                orderId: order.id,
                studentName: st.fullName,
                itemTitle: it.title,
                priceKiber: it.priceKiber,
            });
            return order;
        });
        await this.audit.log(user, 'SHOP_ORDER_CREATED', 'ShopOrder', o.id, {
            itemId: dto.itemId,
            studentId: dto.studentId,
        });
        return o;
    }
    async approve(orderId, user) {
        const branchId = this.getBranchId(user);
        const decidedByUserId = this.getUserId(user);
        const o = await this.prisma.shopOrder.findUnique({
            where: { id: orderId },
            include: { item: true },
        });
        if (!o)
            throw new common_1.NotFoundException('Order not found');
        if (o.branchId !== branchId) {
            throw new common_1.BadRequestException('Order belongs to another branch');
        }
        if (o.status !== 'REQUESTED') {
            throw new common_1.BadRequestException('Order is not REQUESTED');
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.shopOrder.update({
                where: { id: orderId },
                data: {
                    status: 'APPROVED',
                    decidedByUserId: decidedByUserId ?? null,
                },
            });
            await tx.kiberonTransaction.create({
                data: {
                    studentId: o.studentId,
                    amount: -o.item.priceKiber,
                    reason: 'SPEND',
                    createdByUserId: decidedByUserId ?? undefined,
                },
            });
        });
        await this.audit.log(user, 'SHOP_ORDER_APPROVED', 'ShopOrder', orderId, {
            spend: o.item.priceKiber,
        });
        return { ok: true };
    }
    async reject(orderId, user) {
        const branchId = this.getBranchId(user);
        const decidedByUserId = this.getUserId(user);
        const o = await this.prisma.shopOrder.findUnique({
            where: { id: orderId },
        });
        if (!o)
            throw new common_1.NotFoundException('Order not found');
        if (o.branchId !== branchId) {
            throw new common_1.BadRequestException('Order belongs to another branch');
        }
        await this.prisma.shopOrder.update({
            where: { id: orderId },
            data: {
                status: 'REJECTED',
                decidedByUserId: decidedByUserId ?? null,
            },
        });
        await this.audit.log(user, 'SHOP_ORDER_REJECTED', 'ShopOrder', orderId, {});
        return { ok: true };
    }
};
exports.ShopService = ShopService;
exports.ShopService = ShopService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService,
        notifications_service_1.NotificationsService])
], ShopService);
//# sourceMappingURL=shop.service.js.map