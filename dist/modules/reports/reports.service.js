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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function parseDateOnly(dateStr) {
    const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}
function parseRange(from, to) {
    const now = new Date();
    const defaultTo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const defaultFrom = new Date(defaultTo.getTime() - 29 * 24 * 60 * 60 * 1000);
    const fromUTC = from ? parseDateOnly(from) : defaultFrom;
    const toUTC = to
        ? new Date(parseDateOnly(to).getTime() + 24 * 60 * 60 * 1000 - 1)
        : defaultTo;
    if (toUTC < fromUTC)
        throw new common_1.BadRequestException('to must be >= from');
    return { fromUTC, toUTC };
}
let ReportsService = class ReportsService {
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
    async debtors(user, onlyNegative = true) {
        const branchId = this.getBranchId(user);
        const list = await this.prisma.student.findMany({
            where: { branchId, status: 'ACTIVE' },
            include: { lessonBalance: true },
            orderBy: { createdAt: 'desc' },
            take: 500,
        });
        const rows = list.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            phone: s.phone,
            city: s.city,
            availableLessons: s.lessonBalance?.availableLessons ?? 0,
        }));
        return onlyNegative ? rows.filter((x) => x.availableLessons <= 0) : rows;
    }
    async overview(user, from, to) {
        const branchId = this.getBranchId(user);
        const { fromUTC, toUTC } = parseRange(from, to);
        const paymentsAgg = await this.prisma.payment.aggregate({
            where: {
                student: { branchId },
                paidAt: { gte: fromUTC, lte: toUTC },
            },
            _sum: { amount: true },
            _count: { _all: true },
        });
        const newStudents = await this.prisma.student.count({
            where: { branchId, createdAt: { gte: fromUTC, lte: toUTC } },
        });
        const lessonsCount = await this.prisma.lesson.count({
            where: {
                group: { branchId },
                startsAt: { gte: fromUTC, lte: toUTC },
            },
        });
        const attAgg = await this.prisma.attendance.groupBy({
            by: ['status'],
            where: {
                student: { branchId },
                lesson: { startsAt: { gte: fromUTC, lte: toUTC } },
            },
            _count: { _all: true },
        });
        const attendance = {
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0,
        };
        for (const row of attAgg) {
            const k = row.status;
            attendance[k] = row._count._all;
        }
        const kibAgg = await this.prisma.kiberonTransaction.aggregate({
            where: {
                student: { branchId },
                createdAt: { gte: fromUTC, lte: toUTC },
            },
            _sum: { amount: true },
            _count: { _all: true },
        });
        const topPayers = await this.prisma.payment.groupBy({
            by: ['studentId'],
            where: {
                student: { branchId },
                paidAt: { gte: fromUTC, lte: toUTC },
            },
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
            take: 5,
        });
        const topStudents = await this.prisma.student.findMany({
            where: { id: { in: topPayers.map((x) => x.studentId) } },
            select: { id: true, fullName: true },
        });
        const nameById = new Map(topStudents.map((s) => [s.id, s.fullName]));
        return {
            period: { from: fromUTC.toISOString(), to: toUTC.toISOString() },
            payments: {
                totalAmount: paymentsAgg._sum.amount ?? 0,
                count: paymentsAgg._count._all,
            },
            newStudents,
            lessonsCount,
            attendance,
            kiberons: {
                totalAmount: kibAgg._sum.amount ?? 0,
                txCount: kibAgg._count._all,
            },
            topPayers: topPayers.map((x) => ({
                studentId: x.studentId,
                fullName: nameById.get(x.studentId) ?? 'Unknown',
                totalPaid: x._sum.amount ?? 0,
            })),
        };
    }
    async revenueDaily(user, from, to) {
        const branchId = this.getBranchId(user);
        const { fromUTC, toUTC } = parseRange(from, to);
        const payments = await this.prisma.payment.findMany({
            where: {
                student: { branchId },
                paidAt: { gte: fromUTC, lte: toUTC },
            },
            select: { amount: true, paidAt: true },
            orderBy: { paidAt: 'asc' },
            take: 5000,
        });
        const map = new Map();
        for (const p of payments) {
            const d = p.paidAt.toISOString().slice(0, 10);
            map.set(d, (map.get(d) ?? 0) + p.amount);
        }
        const days = [];
        for (let t = new Date(fromUTC).getTime(); t <= toUTC.getTime(); t += 24 * 60 * 60 * 1000) {
            const date = new Date(t).toISOString().slice(0, 10);
            days.push({ date, amount: map.get(date) ?? 0 });
        }
        return { period: { from: fromUTC.toISOString(), to: toUTC.toISOString() }, days };
    }
    async topGroups(user, from, to, limit = 10) {
        const branchId = this.getBranchId(user);
        const { fromUTC, toUTC } = parseRange(from, to);
        const rows = await this.prisma.attendance.groupBy({
            by: ['lessonId'],
            where: {
                student: { branchId },
                lesson: { startsAt: { gte: fromUTC, lte: toUTC } },
                status: 'PRESENT',
            },
            _count: { _all: true },
        });
        const lessonIds = rows.map((r) => r.lessonId);
        const lessons = await this.prisma.lesson.findMany({
            where: { id: { in: lessonIds } },
            select: { id: true, groupId: true },
        });
        const groupMap = new Map();
        const lessonToGroup = new Map(lessons.map((l) => [l.id, l.groupId]));
        for (const r of rows) {
            const gid = lessonToGroup.get(r.lessonId);
            if (!gid)
                continue;
            groupMap.set(gid, (groupMap.get(gid) ?? 0) + r._count._all);
        }
        const sorted = [...groupMap.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, Math.max(1, limit));
        const groups = await this.prisma.group.findMany({
            where: { id: { in: sorted.map((x) => x[0]) }, branchId },
            select: { id: true, name: true },
        });
        const gName = new Map(groups.map((g) => [g.id, g.name]));
        return sorted.map(([groupId, presentCount]) => ({
            groupId,
            groupName: gName.get(groupId) ?? 'Unknown',
            presentCount,
        }));
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map