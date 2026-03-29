import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateScheduleRuleDto } from './dto/create-schedule-rule.dto';
import { GenerateLessonsDto } from './dto/generate-lessons.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string; email?: string | null };

// -------------------- helpers (UTC) --------------------
function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function setTimeUTC(dateOnlyUTC: Date, timeHHmm: string): Date {
  const [hh, mm] = timeHHmm.split(':').map((x) => parseInt(x, 10));
  const dt = new Date(dateOnlyUTC);
  dt.setUTCHours(hh, mm, 0, 0);
  return dt;
}

function addMinutes(dt: Date, minutes: number): Date {
  return new Date(dt.getTime() + minutes * 60_000);
}

// getUTCDay(): 0=Sun..6=Sat -> 1=Mon..7=Sun
function weekday1to7(dateUTC: Date): number {
  const d = dateUTC.getUTCDay();
  return d === 0 ? 7 : d;
}

function diffWeeksUTC(startUTC: Date, currentUTC: Date): number {
  const ms = currentUTC.getTime() - startUTC.getTime();
  return Math.floor(ms / (7 * 24 * 60 * 60 * 1000));
}

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private async assertGroupInBranch(groupId: string, branchId: string) {
    const g = await this.prisma.group.findUnique({ where: { id: groupId } });
    if (!g) throw new NotFoundException('Group not found');
    if (g.branchId !== branchId) throw new BadRequestException('Group belongs to another branch');
    return g;
  }

  // ---------------- GROUPS ----------------
  findAll(user: AuthUser) {
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

  create(dto: CreateGroupDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    // ВАЖНО: в CreateGroupDto branchId нет — берём из JWT
    return this.prisma.group.create({
      data: {
        branchId,
        name: dto.name,
        // если в dto добавишь поля — они автоматически будут доступны:
        ageCategory: (dto as any).ageCategory ?? null,
        year: (dto as any).year ?? null,
        isActive: (dto as any).isActive ?? true,
      },
    });
  }

  async update(groupId: string, dto: UpdateGroupDto, user: AuthUser) {
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

  async archive(groupId: string, user: AuthUser) {
    return this.update(groupId, { isActive: false }, user);
  }

  async restore(groupId: string, user: AuthUser) {
    return this.update(groupId, { isActive: true }, user);
  }

  // teacher assignment
  async assignTeacher(groupId: string, dto: AssignTeacherDto, user: AuthUser) {
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

  // ---------------- STUDENTS in GROUP ----------------
  async getStudents(groupId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    return this.prisma.enrollment.findMany({
      where: { groupId },
      include: { student: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStudent(groupId: string, dto: AddStudentDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('studentId belongs to another branch');

    return this.prisma.enrollment.create({
      data: { groupId, studentId: dto.studentId, fromDate: new Date() },
      include: { student: true },
    });
  }

  async removeStudent(groupId: string, studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    const enrollment = await this.prisma.enrollment.findFirst({ where: { groupId, studentId } });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    return this.prisma.enrollment.delete({ where: { id: enrollment.id } });
  }

  // ---------------- SCHEDULE RULE ----------------
  async setScheduleRule(groupId: string, dto: CreateScheduleRuleDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    if (!dto.weekdays?.length) throw new BadRequestException('weekdays is required');

    const startUTC = parseDateOnly(dto.startDate);
    const endUTC = parseDateOnly(dto.endDate);
    if (endUTC < startUTC) throw new BadRequestException('endDate must be >= startDate');

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

  // ---------------- LESSONS ----------------
  async getLessons(groupId: string, from: string | undefined, to: string | undefined, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    const where: any = { groupId };

    if (from || to) {
      where.startsAt = {};
      if (from) where.startsAt.gte = parseDateOnly(from);
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
  async getOne(groupId: string, user: AuthUser) {
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

  async generateLessons(groupId: string, dto: GenerateLessonsDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    await this.assertGroupInBranch(groupId, branchId);

    const rule = await this.prisma.scheduleRule.findUnique({ where: { groupId } });
    if (!rule) throw new NotFoundException('ScheduleRule not found for group');

    const ruleStart = rule.startDate;
    const ruleEnd = rule.endDate;
    const fromUTC = dto.from ? parseDateOnly(dto.from) : ruleStart;
    const toUTC = dto.to ? parseDateOnly(dto.to) : ruleEnd;

    if (toUTC < fromUTC) throw new BadRequestException('to must be >= from');

    const weekdaysSet = new Set(
      rule.weekdays
        .split(',')
        .map((x) => parseInt(x, 10))
        .filter((x) => !Number.isNaN(x)),
    );

    const duration = rule.durationMin ?? 90;
    const everyWeeks = rule.repeatEveryWeeks ?? 1;

    const lessonsToCreate: { groupId: string; startsAt: Date; endsAt: Date }[] = [];

    for (
      let d = new Date(fromUTC);
      d.getTime() <= toUTC.getTime();
      d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
    ) {
      const wd = weekday1to7(d);
      if (!weekdaysSet.has(wd)) continue;

      const weeksFromStart = diffWeeksUTC(ruleStart, d);
      if (weeksFromStart % everyWeeks !== 0) continue;

      const startsAt = setTimeUTC(d, rule.timeStart);
      const endsAt = addMinutes(startsAt, duration);

      lessonsToCreate.push({ groupId, startsAt, endsAt });
    }

    if (lessonsToCreate.length === 0) {
      return { created: 0, message: 'No lessons to create for given range' };
    }

    const result = await this.prisma.lesson.createMany({
      data: lessonsToCreate as any,
      skipDuplicates: true,
    });

    return { created: result.count };
  }
}