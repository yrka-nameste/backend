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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const MONTHLY_PRICE = 750;
const LESSONS_PER_MONTH = 4;
function getPeriodFromDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
function getDueDateForPeriod(period) {
    const [year, month] = period.split('-').map((x) => parseInt(x, 10));
    return new Date(Date.UTC(year, month - 1, 10, 0, 0, 0));
}
let PaymentsService = class PaymentsService {
    prisma;
    notifications;
    constructor(prisma, notifications) {
        this.prisma = prisma;
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
    calculateLessonsFromAmount(amount) {
        if (!amount || amount <= 0)
            return 0;
        return Math.floor((amount * LESSONS_PER_MONTH) / MONTHLY_PRICE);
    }
    async create(dto, user) {
        const branchId = this.getBranchId(user);
        const createdByUserId = this.getUserId(user);
        const st = await this.prisma.student.findUnique({
            where: {
                id: dto.studentId,
            },
        });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const source = dto.source ?? (user?.role === 'PARENT' ? 'MOBILE_APP' : 'ADMIN_PANEL');
        const paidAt = new Date();
        const period = getPeriodFromDate(paidAt);
        const dueDate = getDueDateForPeriod(period);
        return this.prisma.$transaction(async (tx) => {
            let invoice = await tx.invoice.findFirst({
                where: {
                    branchId,
                    studentId: dto.studentId,
                    period,
                },
            });
            if (!invoice) {
                invoice = await tx.invoice.create({
                    data: {
                        branchId,
                        studentId: dto.studentId,
                        period,
                        dueDate,
                        amount: MONTHLY_PRICE,
                        status: 'ISSUED',
                    },
                });
            }
            const payment = await tx.payment.create({
                data: {
                    studentId: dto.studentId,
                    amount: dto.amount,
                    method: dto.method ?? 'cash',
                    comment: dto.comment ?? null,
                    receiptUrl: dto.receiptUrl ?? null,
                    source,
                    invoiceId: invoice.id,
                    createdByUserId: createdByUserId ?? undefined,
                },
            });
            const invoicePayments = await tx.payment.findMany({
                where: {
                    invoiceId: invoice.id,
                },
                select: {
                    amount: true,
                },
            });
            const paidForInvoice = invoicePayments.reduce((sum, item) => {
                return sum + item.amount;
            }, 0);
            if (paidForInvoice >= invoice.amount) {
                await tx.invoice.update({
                    where: {
                        id: invoice.id,
                    },
                    data: {
                        status: 'PAID',
                    },
                });
            }
            const add = source === 'MOBILE_APP'
                ? this.calculateLessonsFromAmount(dto.amount)
                : dto.addLessons ?? this.calculateLessonsFromAmount(dto.amount);
            if (add > 0) {
                await tx.lessonBalance.upsert({
                    where: {
                        studentId: dto.studentId,
                    },
                    create: {
                        studentId: dto.studentId,
                        availableLessons: add,
                    },
                    update: {
                        availableLessons: {
                            increment: add,
                        },
                    },
                });
            }
            if (source === 'MOBILE_APP') {
                await this.notifications.createPaymentNotification(tx, {
                    branchId,
                    paymentId: payment.id,
                    studentName: st.fullName,
                    amount: payment.amount,
                    method: payment.method,
                    receiptUrl: payment.receiptUrl,
                });
            }
            return {
                payment,
                invoiceId: invoice.id,
                period,
                addedLessons: add,
                notificationCreated: source === 'MOBILE_APP',
            };
        });
    }
    async getStudentPayments(studentId, user) {
        const branchId = this.getBranchId(user);
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
        return this.prisma.payment.findMany({
            where: {
                studentId,
            },
            orderBy: {
                paidAt: 'desc',
            },
            include: {
                invoice: true,
            },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map