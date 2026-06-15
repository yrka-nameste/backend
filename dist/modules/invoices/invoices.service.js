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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_service_1 = require("../audit/audit.service");
const MONTHLY_PRICE = 750;
function parseDateOnlyUTC(dateStr) {
    const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}
function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function normalizePeriod(period) {
    if (!period)
        return getCurrentPeriod();
    if (!/^\d{4}-\d{2}$/.test(period)) {
        throw new common_1.BadRequestException('period must be in YYYY-MM format');
    }
    return period;
}
function getMonthRange(period) {
    const [year, month] = period.split('-').map((x) => parseInt(x, 10));
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    return { start, end };
}
let InvoicesService = class InvoicesService {
    prisma;
    audit;
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    getBranchId(user) {
        const branchId = user?.branchId;
        if (!branchId)
            throw new common_1.BadRequestException('User has no branchId');
        return branchId;
    }
    async generateForBranch(dto, user) {
        const branchId = this.getBranchId(user);
        const students = await this.prisma.student.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
            },
            select: {
                id: true,
            },
        });
        const dueDate = parseDateOnlyUTC(dto.dueDate);
        let created = 0;
        for (const st of students) {
            const exists = await this.prisma.invoice.findFirst({
                where: {
                    branchId,
                    studentId: st.id,
                    period: dto.period,
                },
            });
            if (exists)
                continue;
            await this.prisma.invoice.create({
                data: {
                    branchId,
                    studentId: st.id,
                    period: dto.period,
                    dueDate,
                    amount: dto.amount,
                    status: 'ISSUED',
                },
            });
            created++;
        }
        await this.audit.log(user, 'INVOICE_CREATED', 'Invoice', undefined, {
            period: dto.period,
            created,
        });
        return {
            created,
            period: dto.period,
        };
    }
    async listStudent(studentId, user, period) {
        const branchId = this.getBranchId(user);
        const normalizedPeriod = normalizePeriod(period);
        const { start, end } = getMonthRange(normalizedPeriod);
        const st = await this.prisma.student.findUnique({
            where: {
                id: studentId,
            },
        });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const [invoices, monthPayments] = await Promise.all([
            this.prisma.invoice.findMany({
                where: {
                    studentId,
                },
                orderBy: {
                    dueDate: 'desc',
                },
                include: {
                    payments: true,
                },
            }),
            this.prisma.payment.findMany({
                where: {
                    studentId,
                    paidAt: {
                        gte: start,
                        lt: end,
                    },
                },
                orderBy: {
                    paidAt: 'desc',
                },
            }),
        ]);
        const totalInvoiced = invoices.reduce((sum, invoice) => {
            return sum + invoice.amount;
        }, 0);
        const totalPaidByInvoices = invoices.reduce((sum, invoice) => {
            const paid = invoice.payments?.reduce((paymentSum, payment) => {
                return paymentSum + payment.amount;
            }, 0);
            return sum + (paid ?? 0);
        }, 0);
        const monthPaid = monthPayments.reduce((sum, payment) => {
            return sum + payment.amount;
        }, 0);
        const hasMonthPayment = monthPaid > 0;
        const currentMonthDebt = st.status === 'ACTIVE' && !hasMonthPayment ? MONTHLY_PRICE : 0;
        return {
            student: {
                id: st.id,
                fullName: st.fullName,
                status: st.status,
            },
            period: normalizedPeriod,
            monthlyPrice: MONTHLY_PRICE,
            invoices,
            monthPayments,
            totals: {
                totalInvoiced,
                totalPaidByInvoices,
                monthPaid,
                hasMonthPayment,
                currentMonthDebt,
            },
        };
    }
    async debtors(user, onlyNegative, period) {
        const branchId = this.getBranchId(user);
        const normalizedPeriod = normalizePeriod(period);
        const { start, end } = getMonthRange(normalizedPeriod);
        const students = await this.prisma.student.findMany({
            where: {
                branchId,
                status: 'ACTIVE',
            },
            select: {
                id: true,
                fullName: true,
                status: true,
                phone: true,
                email: true,
            },
            orderBy: {
                fullName: 'asc',
            },
        });
        const payments = await this.prisma.payment.findMany({
            where: {
                student: {
                    branchId,
                },
                paidAt: {
                    gte: start,
                    lt: end,
                },
            },
            select: {
                id: true,
                studentId: true,
                amount: true,
                paidAt: true,
                method: true,
                comment: true,
                receiptUrl: true,
            },
            orderBy: {
                paidAt: 'desc',
            },
        });
        const paidByStudent = new Map();
        for (const payment of payments) {
            const current = paidByStudent.get(payment.studentId) ?? 0;
            paidByStudent.set(payment.studentId, current + payment.amount);
        }
        const out = [];
        for (const st of students) {
            const monthPaid = paidByStudent.get(st.id) ?? 0;
            const hasMonthPayment = monthPaid > 0;
            const debt = hasMonthPayment ? 0 : MONTHLY_PRICE;
            if (onlyNegative && debt <= 0)
                continue;
            out.push({
                studentId: st.id,
                fullName: st.fullName,
                status: st.status,
                phone: st.phone,
                email: st.email,
                period: normalizedPeriod,
                monthlyPrice: MONTHLY_PRICE,
                monthPaid,
                hasMonthPayment,
                debt,
            });
        }
        out.sort((a, b) => b.debt - a.debt || a.fullName.localeCompare(b.fullName));
        return out;
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_service_1.AuditService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map