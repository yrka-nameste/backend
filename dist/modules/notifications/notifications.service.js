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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getBranchId(user) {
        const branchId = user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId');
        return branchId;
    }
    ensureAdmin(user) {
        if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTOR') {
            throw new common_1.ForbiddenException('Notifications are available only for admin panel users');
        }
    }
    async createPaymentNotification(client, args) {
        return client.adminNotification.create({
            data: {
                branchId: args.branchId,
                type: 'PAYMENT_CREATED',
                title: 'Новая оплата из мобильного приложения',
                message: `${args.studentName} отправил оплату на сумму ${args.amount}`,
                entity: 'Payment',
                entityId: args.paymentId,
                meta: {
                    paymentId: args.paymentId,
                    studentName: args.studentName,
                    amount: args.amount,
                    method: args.method ?? null,
                    receiptUrl: args.receiptUrl ?? null,
                },
            },
        });
    }
    async createShopOrderNotification(client, args) {
        return client.adminNotification.create({
            data: {
                branchId: args.branchId,
                type: 'SHOP_ORDER_CREATED',
                title: 'Новая заявка в магазине',
                message: `${args.studentName} заказал «${args.itemTitle}» за ${args.priceKiber} киберонов`,
                entity: 'ShopOrder',
                entityId: args.orderId,
                meta: {
                    orderId: args.orderId,
                    studentName: args.studentName,
                    itemTitle: args.itemTitle,
                    priceKiber: args.priceKiber,
                },
            },
        });
    }
    async summary(user) {
        this.ensureAdmin(user);
        const branchId = this.getBranchId(user);
        const [unreadTotal, unreadPayments, unreadShopOrders, pendingShopOrders, latest,] = await Promise.all([
            this.prisma.adminNotification.count({
                where: { branchId, status: 'UNREAD' },
            }),
            this.prisma.adminNotification.count({
                where: {
                    branchId,
                    status: 'UNREAD',
                    type: 'PAYMENT_CREATED',
                },
            }),
            this.prisma.adminNotification.count({
                where: {
                    branchId,
                    status: 'UNREAD',
                    type: 'SHOP_ORDER_CREATED',
                },
            }),
            this.prisma.shopOrder.count({
                where: { branchId, status: 'REQUESTED' },
            }),
            this.prisma.adminNotification.findMany({
                where: { branchId, status: 'UNREAD' },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
        ]);
        return {
            unreadTotal,
            unreadPayments,
            unreadShopOrders,
            pendingShopOrders,
            latest,
        };
    }
    async list(user, status, take) {
        this.ensureAdmin(user);
        const branchId = this.getBranchId(user);
        const normalizedStatus = status === 'READ' ? 'READ' : status === 'ALL' ? undefined : 'UNREAD';
        const limit = Math.min(Math.max(Number(take ?? 20) || 20, 1), 100);
        return this.prisma.adminNotification.findMany({
            where: {
                branchId,
                ...(normalizedStatus ? { status: normalizedStatus } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async markRead(user, ids) {
        this.ensureAdmin(user);
        const branchId = this.getBranchId(user);
        const where = {
            branchId,
            status: 'UNREAD',
        };
        if (ids && ids.length > 0) {
            where.id = { in: ids };
        }
        const result = await this.prisma.adminNotification.updateMany({
            where,
            data: {
                status: 'READ',
                readAt: new Date(),
            },
        });
        const summary = await this.summary(user);
        return {
            ok: true,
            updated: result.count,
            summary,
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map