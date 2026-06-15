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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AttendanceService = class AttendanceService {
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
    async getLessonAttendance(lessonId, user) {
        const branchId = this.getBranchId(user);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { group: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.group.branchId !== branchId)
            throw new common_1.BadRequestException('Lesson belongs to another branch');
        const enrollments = await this.prisma.enrollment.findMany({
            where: { groupId: lesson.groupId, toDate: null },
            include: { student: true },
            orderBy: { createdAt: 'asc' },
        });
        const marks = await this.prisma.attendance.findMany({ where: { lessonId } });
        const map = new Map(marks.map((m) => [m.studentId, m]));
        return enrollments.map((e) => {
            const m = map.get(e.studentId);
            return {
                studentId: e.studentId,
                student: e.student,
                status: m?.status ?? null,
                kiberonsAwarded: m?.kiberonsAwarded ?? 0,
            };
        });
    }
    async setAttendance(lessonId, dto, user) {
        const branchId = this.getBranchId(user);
        const markedByUserId = this.getUserId(user);
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { group: true },
        });
        if (!lesson)
            throw new common_1.NotFoundException('Lesson not found');
        if (lesson.group.branchId !== branchId)
            throw new common_1.BadRequestException('Lesson belongs to another branch');
        const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId)
            throw new common_1.BadRequestException('student belongs to another branch');
        const enr = await this.prisma.enrollment.findFirst({
            where: { groupId: lesson.groupId, studentId: dto.studentId, toDate: null },
        });
        if (!enr)
            throw new common_1.BadRequestException('student is not enrolled in this group');
        const prev = await this.prisma.attendance.findUnique({
            where: { lessonId_studentId: { lessonId, studentId: dto.studentId } },
        });
        const becamePresent = dto.status === 'PRESENT' && prev?.status !== 'PRESENT';
        const addBonus = dto.status === 'PRESENT' && (dto.addBonus5 ?? false);
        return this.prisma.$transaction(async (tx) => {
            const kAward = dto.status === 'PRESENT' ? (10 + (addBonus ? 5 : 0)) : 0;
            const mark = await tx.attendance.upsert({
                where: { lessonId_studentId: { lessonId, studentId: dto.studentId } },
                update: {
                    status: dto.status,
                    markedByUserId: markedByUserId ?? undefined,
                    kiberonsAwarded: kAward,
                },
                create: {
                    lessonId,
                    studentId: dto.studentId,
                    status: dto.status,
                    markedByUserId: markedByUserId ?? undefined,
                    kiberonsAwarded: kAward,
                },
            });
            if (dto.status === 'PRESENT') {
                const hasAttendTx = await tx.kiberonTransaction.findFirst({
                    where: { studentId: dto.studentId, lessonId, reason: 'ATTENDANCE' },
                });
                if (!hasAttendTx) {
                    await tx.kiberonTransaction.create({
                        data: {
                            studentId: dto.studentId,
                            lessonId,
                            amount: 10,
                            reason: 'ATTENDANCE',
                            createdByUserId: markedByUserId ?? undefined,
                        },
                    });
                }
                if (addBonus) {
                    const hasBonusTx = await tx.kiberonTransaction.findFirst({
                        where: { studentId: dto.studentId, lessonId, reason: 'BONUS' },
                    });
                    if (!hasBonusTx) {
                        await tx.kiberonTransaction.create({
                            data: {
                                studentId: dto.studentId,
                                lessonId,
                                amount: 5,
                                reason: 'BONUS',
                                createdByUserId: markedByUserId ?? undefined,
                            },
                        });
                    }
                }
            }
            if (becamePresent && (lesson.isChargeable ?? true)) {
                await tx.lessonBalance.upsert({
                    where: { studentId: dto.studentId },
                    create: { studentId: dto.studentId, availableLessons: 0 },
                    update: {},
                });
                const bal = await tx.lessonBalance.findUnique({ where: { studentId: dto.studentId } });
                if ((bal?.availableLessons ?? 0) > 0) {
                    await tx.lessonBalance.update({
                        where: { studentId: dto.studentId },
                        data: { availableLessons: { decrement: 1 } },
                    });
                }
            }
            return { ok: true, mark };
        });
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map