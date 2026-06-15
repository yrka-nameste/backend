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
exports.KiberonsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let KiberonsService = class KiberonsService {
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
    getUserId(user) {
        return (user?.userId ?? user?.id ?? null);
    }
    async create(dto, user) {
        const branchId = this.getBranchId(user);
        const createdByUserId = this.getUserId(user);
        const studentId = (dto?.studentId ?? '').toString();
        const reason = (dto?.reason ?? 'MANUAL').toString();
        const comment = dto?.comment != null ? dto.comment.toString() : null;
        const amount = Number(dto?.amount);
        if (!studentId)
            throw new common_1.BadRequestException('studentId is required');
        if (!Number.isFinite(amount) || amount === 0) {
            throw new common_1.BadRequestException('amount must be a non-zero number');
        }
        const st = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId)
            throw new common_1.BadRequestException('student belongs to another branch');
        const tx = await this.prisma.kiberonTransaction.create({
            data: {
                studentId,
                amount,
                reason,
                comment,
                createdByUserId: createdByUserId ?? undefined,
            },
        });
        const agg = await this.prisma.kiberonTransaction.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        return { tx, balance: agg._sum.amount ?? 0 };
    }
    async getStudentKiberons(studentId, user) {
        const branchId = this.getBranchId(user);
        const st = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId)
            throw new common_1.BadRequestException('student belongs to another branch');
        return this.prisma.kiberonTransaction.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 500,
        });
    }
    async getStudentKiberonsBalance(studentId, user) {
        const branchId = this.getBranchId(user);
        const st = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId)
            throw new common_1.BadRequestException('student belongs to another branch');
        const agg = await this.prisma.kiberonTransaction.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        return { studentId, balance: agg._sum.amount ?? 0 };
    }
};
exports.KiberonsService = KiberonsService;
exports.KiberonsService = KiberonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], KiberonsService);
//# sourceMappingURL=kiberons.service.js.map