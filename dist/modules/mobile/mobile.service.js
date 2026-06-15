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
exports.MobileService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MobileService = class MobileService {
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
        const userId = (user?.userId ?? user?.id ?? '').toString();
        if (!userId)
            throw new common_1.BadRequestException('User id missing');
        return userId;
    }
    async parentHome(studentId, user) {
        const branchId = this.getBranchId(user);
        const student = await this.prisma.student.findUnique({
            where: { id: studentId },
            include: {
                branch: true,
                lessonBalance: true,
                enrollments: {
                    include: {
                        group: {
                            include: {
                                teachers: {
                                    include: {
                                        teacher: {
                                            select: { id: true, fullName: true, phone: true, email: true },
                                        },
                                    },
                                },
                                scheduleRule: true,
                            },
                        },
                    },
                },
            },
        });
        if (!student)
            throw new common_1.BadRequestException('studentId not found');
        if (student.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const kiberAgg = await this.prisma.kiberonTransaction.aggregate({
            where: { studentId },
            _sum: { amount: true },
        });
        const nextPayments = await this.prisma.invoice.findMany({
            where: {
                studentId,
                status: { in: ['ISSUED', 'OVERDUE'] },
            },
            orderBy: { dueDate: 'asc' },
            take: 1,
        });
        const recentAttendances = await this.prisma.attendance.findMany({
            where: { studentId },
            include: {
                lesson: {
                    include: { group: true },
                },
            },
            orderBy: { lesson: { startsAt: 'desc' } },
            take: 10,
        });
        const currentMonth = new Date();
        const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, 0);
        const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1, 0, 0, 0, 0);
        const monthInvoiced = await this.prisma.invoice.aggregate({
            where: {
                studentId,
                dueDate: { gte: monthStart, lt: monthEnd },
            },
            _sum: { amount: true },
        });
        const monthPaid = await this.prisma.payment.aggregate({
            where: {
                studentId,
                paidAt: { gte: monthStart, lt: monthEnd },
            },
            _sum: { amount: true },
        });
        const totalInvoicedThisMonth = monthInvoiced._sum.amount ?? 0;
        const totalPaidThisMonth = monthPaid._sum.amount ?? 0;
        let paymentStatusThisMonth = 'NO_INVOICE';
        if (totalInvoicedThisMonth > 0 && totalPaidThisMonth <= 0)
            paymentStatusThisMonth = 'UNPAID';
        if (totalInvoicedThisMonth > 0 && totalPaidThisMonth > 0 && totalPaidThisMonth < totalInvoicedThisMonth) {
            paymentStatusThisMonth = 'PARTIAL';
        }
        if (totalInvoicedThisMonth > 0 && totalPaidThisMonth >= totalInvoicedThisMonth) {
            paymentStatusThisMonth = 'PAID';
        }
        return {
            student,
            kiberBalance: kiberAgg._sum.amount ?? 0,
            availableLessons: student.lessonBalance?.availableLessons ?? 0,
            nextPayment: nextPayments[0] ?? null,
            recentAttendances,
            paymentStatusThisMonth,
            totalInvoicedThisMonth,
            totalPaidThisMonth,
        };
    }
    async parentKiberons(studentId, user) {
        const branchId = this.getBranchId(user);
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.BadRequestException('studentId not found');
        if (student.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const tx = await this.prisma.kiberonTransaction.findMany({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        const orders = await this.prisma.shopOrder.findMany({
            where: { studentId },
            include: { item: true },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return { tx, orders };
    }
    async parentShop(studentId, user) {
        const branchId = this.getBranchId(user);
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.BadRequestException('studentId not found');
        if (student.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const items = await this.prisma.shopItem.findMany({
            where: { branchId, isVisible: true },
            orderBy: { createdAt: 'desc' },
        });
        const orders = await this.prisma.shopOrder.findMany({
            where: { studentId },
            include: { item: true },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        return { items, orders };
    }
    async parentPayments(studentId, user) {
        const branchId = this.getBranchId(user);
        const student = await this.prisma.student.findUnique({ where: { id: studentId } });
        if (!student)
            throw new common_1.BadRequestException('studentId not found');
        if (student.branchId !== branchId) {
            throw new common_1.BadRequestException('student belongs to another branch');
        }
        const payments = await this.prisma.payment.findMany({
            where: { studentId },
            orderBy: { paidAt: 'desc' },
            take: 100,
        });
        const invoices = await this.prisma.invoice.findMany({
            where: { studentId },
            include: { payments: true },
            orderBy: { dueDate: 'desc' },
            take: 50,
        });
        return { payments, invoices };
    }
    async teacherHome(user) {
        const userId = this.getUserId(user);
        const branchId = this.getBranchId(user);
        const groups = await this.prisma.groupTeacher.findMany({
            where: { teacherUserId: userId },
            include: { group: true },
        });
        const upcomingLessons = await this.prisma.lesson.findMany({
            where: {
                teacherUserId: userId,
                group: { branchId },
            },
            include: { group: true },
            orderBy: { startsAt: 'asc' },
            take: 10,
        });
        return { groups, upcomingLessons };
    }
    async teacherLessonsToday(user) {
        const userId = this.getUserId(user);
        const branchId = this.getBranchId(user);
        const now = new Date();
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(now);
        dayEnd.setHours(23, 59, 59, 999);
        return this.prisma.lesson.findMany({
            where: {
                teacherUserId: userId,
                startsAt: { gte: dayStart, lte: dayEnd },
                group: { branchId },
            },
            include: { group: true },
            orderBy: { startsAt: 'asc' },
        });
    }
    async teacherGroups(user) {
        const userId = this.getUserId(user);
        return this.prisma.groupTeacher.findMany({
            where: { teacherUserId: userId },
            include: {
                group: {
                    include: {
                        enrollments: { include: { student: true } },
                        scheduleRule: true,
                    },
                },
            },
            orderBy: { group: { name: 'asc' } },
        });
    }
    async teacherGroup(groupId, user) {
        const userId = this.getUserId(user);
        const link = await this.prisma.groupTeacher.findFirst({
            where: { groupId, teacherUserId: userId },
        });
        if (!link)
            throw new common_1.BadRequestException('Teacher is not assigned to this group');
        return this.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                teachers: {
                    include: {
                        teacher: {
                            select: { id: true, fullName: true, email: true, phone: true },
                        },
                    },
                },
                enrollments: { include: { student: true } },
                scheduleRule: true,
                lessons: {
                    orderBy: { startsAt: 'asc' },
                    take: 50,
                },
                programs: true,
            },
        });
    }
    async birthdays(user) {
        const branchId = this.getBranchId(user);
        const now = new Date();
        const month = now.getMonth() + 1;
        const students = await this.prisma.student.findMany({
            where: {
                branchId,
                birthDate: { not: null },
            },
            select: {
                id: true,
                fullName: true,
                birthDate: true,
                phone: true,
                city: true,
            },
            orderBy: { fullName: 'asc' },
        });
        return students.filter((s) => {
            if (!s.birthDate)
                return false;
            return s.birthDate.getMonth() + 1 === month;
        });
    }
    async absentThisWeek(user) {
        const branchId = this.getBranchId(user);
        const now = new Date();
        const day = now.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() + mondayOffset);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return this.prisma.attendance.findMany({
            where: {
                status: 'ABSENT',
                lesson: {
                    startsAt: { gte: weekStart, lt: weekEnd },
                    group: { branchId },
                },
            },
            include: {
                student: true,
                lesson: {
                    include: { group: true },
                },
            },
            orderBy: {
                lesson: { startsAt: 'desc' },
            },
        });
    }
};
exports.MobileService = MobileService;
exports.MobileService = MobileService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MobileService);
//# sourceMappingURL=mobile.service.js.map