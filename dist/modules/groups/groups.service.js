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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
function parseDateOnly(dateStr) {
    const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}
function setTimeUTC(dateOnlyUTC, timeHHmm) {
    const [hh, mm] = timeHHmm.split(':').map((x) => parseInt(x, 10));
    const dt = new Date(dateOnlyUTC);
    dt.setUTCHours(hh, mm, 0, 0);
    return dt;
}
function addMinutes(dt, minutes) {
    return new Date(dt.getTime() + minutes * 60_000);
}
function weekday1to7(dateUTC) {
    const d = dateUTC.getUTCDay();
    return d === 0 ? 7 : d;
}
function diffWeeksUTC(startUTC, currentUTC) {
    const ms = currentUTC.getTime() - startUTC.getTime();
    return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}
let GroupsService = class GroupsService {
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
    async assertGroupInBranch(groupId, branchId) {
        const g = await this.prisma.group.findUnique({ where: { id: groupId } });
        if (!g)
            throw new common_1.NotFoundException('Group not found');
        if (g.branchId !== branchId)
            throw new common_1.BadRequestException('Group belongs to another branch');
        return g;
    }
    findAll(user) {
        const branchId = this.getBranchId(user);
        return this.prisma.group.findMany({
            where: { branchId },
            include: {
                teachers: {
                    include: {
                        teacher: { select: { id: true, email: true, fullName: true, role: true } },
                    },
                },
                enrollments: { include: { student: true } },
                scheduleRule: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    create(dto, user) {
        const branchId = this.getBranchId(user);
        return this.prisma.group.create({
            data: {
                branchId,
                name: dto.name,
                ageCategory: dto.ageCategory ?? null,
                year: dto.year ?? null,
                isActive: dto.isActive ?? true,
            },
        });
    }
    async update(groupId, dto, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        return this.prisma.group.update({
            where: { id: groupId },
            data: {
                ...(dto.name !== undefined ? { name: dto.name } : {}),
                ...(dto.ageCategory !== undefined ? { ageCategory: dto.ageCategory } : {}),
                ...(dto.year !== undefined ? { year: dto.year } : {}),
                ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            },
        });
    }
    async archive(groupId, user) {
        return this.update(groupId, { isActive: false }, user);
    }
    async restore(groupId, user) {
        return this.update(groupId, { isActive: true }, user);
    }
    async assignTeacher(groupId, dto, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        return this.prisma.groupTeacher.upsert({
            where: {
                groupId_teacherUserId: {
                    groupId,
                    teacherUserId: dto.teacherUserId,
                },
            },
            update: { roleInGroup: dto.roleInGroup },
            create: {
                groupId,
                teacherUserId: dto.teacherUserId,
                roleInGroup: dto.roleInGroup,
            },
        });
    }
    async getStudents(groupId, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        return this.prisma.enrollment.findMany({
            where: { groupId },
            include: { student: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async addStudent(groupId, dto, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
        if (!st)
            throw new common_1.BadRequestException('studentId not found');
        if (st.branchId !== branchId)
            throw new common_1.BadRequestException('studentId belongs to another branch');
        return this.prisma.enrollment.create({
            data: { groupId, studentId: dto.studentId, fromDate: new Date() },
            include: { student: true },
        });
    }
    async removeStudent(groupId, studentId, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        const enrollment = await this.prisma.enrollment.findFirst({ where: { groupId, studentId } });
        if (!enrollment)
            throw new common_1.NotFoundException('Enrollment not found');
        return this.prisma.enrollment.delete({ where: { id: enrollment.id } });
    }
    async setScheduleRule(groupId, dto, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        if (!dto.weekdays?.length)
            throw new common_1.BadRequestException('weekdays is required');
        const startUTC = parseDateOnly(dto.startDate);
        const endUTC = parseDateOnly(dto.endDate);
        if (endUTC < startUTC)
            throw new common_1.BadRequestException('endDate must be >= startDate');
        const weekdaysStr = dto.weekdays.join(',');
        return this.prisma.scheduleRule.upsert({
            where: { groupId },
            update: {
                startDate: startUTC,
                endDate: endUTC,
                weekdays: weekdaysStr,
                timeStart: dto.timeStart,
                durationMin: dto.durationMin ?? 90,
                repeatEveryWeeks: dto.repeatEveryWeeks ?? 1,
                timezone: dto.timezone ?? 'Europe/Chisinau',
            },
            create: {
                groupId,
                startDate: startUTC,
                endDate: endUTC,
                weekdays: weekdaysStr,
                timeStart: dto.timeStart,
                durationMin: dto.durationMin ?? 90,
                repeatEveryWeeks: dto.repeatEveryWeeks ?? 1,
                timezone: dto.timezone ?? 'Europe/Chisinau',
            },
        });
    }
    async getLessons(groupId, from, to, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        const where = { groupId };
        if (from || to) {
            where.startsAt = {};
            if (from)
                where.startsAt.gte = parseDateOnly(from);
            if (to) {
                const toUTC = parseDateOnly(to);
                where.startsAt.lte = new Date(toUTC.getTime() + 24 * 60 * 60 * 1000 - 1);
            }
        }
        return this.prisma.lesson.findMany({
            where,
            orderBy: { startsAt: 'asc' },
        });
    }
    async getOne(groupId, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        return this.prisma.group.findUnique({
            where: { id: groupId },
            include: {
                teachers: {
                    include: {
                        teacher: { select: { id: true, email: true, fullName: true, role: true } },
                    },
                },
                enrollments: { include: { student: true } },
                scheduleRule: true,
            },
        });
    }
    async generateLessons(groupId, dto, user) {
        const branchId = this.getBranchId(user);
        await this.assertGroupInBranch(groupId, branchId);
        const rule = await this.prisma.scheduleRule.findUnique({ where: { groupId } });
        if (!rule)
            throw new common_1.NotFoundException('ScheduleRule not found for group');
        const ruleStart = rule.startDate;
        const ruleEnd = rule.endDate;
        const fromUTC = dto.from ? parseDateOnly(dto.from) : ruleStart;
        const toUTC = dto.to ? parseDateOnly(dto.to) : ruleEnd;
        if (toUTC < fromUTC)
            throw new common_1.BadRequestException('to must be >= from');
        const weekdaysSet = new Set(rule.weekdays
            .split(',')
            .map((x) => parseInt(x, 10))
            .filter((x) => !Number.isNaN(x)));
        const duration = rule.durationMin ?? 90;
        const everyWeeks = rule.repeatEveryWeeks ?? 1;
        const lessonsToCreate = [];
        for (let d = new Date(fromUTC); d.getTime() <= toUTC.getTime(); d = new Date(d.getTime() + 24 * 60 * 60 * 1000)) {
            const wd = weekday1to7(d);
            if (!weekdaysSet.has(wd))
                continue;
            const weeksFromStart = diffWeeksUTC(ruleStart, d);
            if (weeksFromStart % everyWeeks !== 0)
                continue;
            const startsAt = setTimeUTC(d, rule.timeStart);
            const endsAt = addMinutes(startsAt, duration);
            lessonsToCreate.push({ groupId, startsAt, endsAt });
        }
        if (lessonsToCreate.length === 0) {
            return { created: 0, message: 'No lessons to create for given range' };
        }
        const result = await this.prisma.lesson.createMany({
            data: lessonsToCreate,
            skipDuplicates: true,
        });
        return { created: result.count };
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map