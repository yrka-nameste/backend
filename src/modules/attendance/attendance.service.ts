import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async getLessonAttendance(lessonId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) throw new BadRequestException('Lesson belongs to another branch');

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

  async setAttendance(lessonId: string, dto: MarkAttendanceDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const markedByUserId = this.getUserId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) throw new BadRequestException('Lesson belongs to another branch');

    const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const enr = await this.prisma.enrollment.findFirst({
      where: { groupId: lesson.groupId, studentId: dto.studentId, toDate: null },
    });
    if (!enr) throw new BadRequestException('student is not enrolled in this group');

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
          status: dto.status as any,
          markedByUserId: markedByUserId ?? undefined,
          kiberonsAwarded: kAward,
        },
        create: {
          lessonId,
          studentId: dto.studentId,
          status: dto.status as any,
          markedByUserId: markedByUserId ?? undefined,
          kiberonsAwarded: kAward,
        },
      });

      if (dto.status === 'PRESENT') {
        const hasAttendTx = await tx.kiberonTransaction.findFirst({
          where: { studentId: dto.studentId, lessonId, reason: 'ATTENDANCE' as any },
        });
        if (!hasAttendTx) {
          await tx.kiberonTransaction.create({
            data: {
              studentId: dto.studentId,
              lessonId,
              amount: 10,
              reason: 'ATTENDANCE' as any,
              createdByUserId: markedByUserId ?? undefined,
            },
          });
        }

        if (addBonus) {
          const hasBonusTx = await tx.kiberonTransaction.findFirst({
            where: { studentId: dto.studentId, lessonId, reason: 'BONUS' as any },
          });
          if (!hasBonusTx) {
            await tx.kiberonTransaction.create({
              data: {
                studentId: dto.studentId,
                lessonId,
                amount: 5,
                reason: 'BONUS' as any,
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
}
