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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
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
    async summary(user) {
        const branchId = this.getBranchId(user);
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
        const activeStudents = await this.prisma.student.count({
            where: { branchId, status: 'ACTIVE' },
        });
        const payAggMonth = await this.prisma.payment.aggregate({
            where: {
                student: { branchId },
                paidAt: { gte: start, lt: end },
            },
            _sum: { amount: true },
            _count: { id: true },
        });
        const revenueMonth = payAggMonth._sum.amount ?? 0;
        const paymentsCountMonth = payAggMonth._count.id ?? 0;
        const invAgg = await this.prisma.invoice.aggregate({
            where: { branchId },
            _sum: { amount: true },
        });
        const totalInvoiced = invAgg._sum.amount ?? 0;
        const payAggAll = await this.prisma.payment.aggregate({
            where: { student: { branchId } },
            _sum: { amount: true },
        });
        const totalPaid = payAggAll._sum.amount ?? 0;
        const debt = Math.max(0, totalInvoiced - totalPaid);
        return {
            activeStudents,
            revenueMonth,
            debt,
            paymentsCountMonth,
            totalInvoiced,
            totalPaid,
            monthStart: start.toISOString(),
            monthEnd: end.toISOString(),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map