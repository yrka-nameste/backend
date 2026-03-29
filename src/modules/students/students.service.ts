import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddParentDto } from './dto/add-parent.dto';
import { ResetParentPasswordDto } from './dto/reset-parent-password.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string | null; role?: string; email?: string | null };

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------
  // helpers
  // ---------------------------
  private genPassword(len = 10) {
    return crypto.randomBytes(32).toString('base64url').slice(0, len);
  }

  private normPhone(phone: string) {
    return (phone || '').replace(/[^\d+]/g, '');
  }

  private makeParentEmail(phone: string) {
    const p = this.normPhone(phone).replace('+', '');
    return `p${p}@parent.local`;
  }

  private getAuthIds(authUser: AuthUser) {
    const branchId = authUser?.branchId ?? null;
    const userId = (authUser?.userId ?? authUser?.id ?? null) as string | null;
    return { branchId, userId };
  }
  private getBranchId(authUser: AuthUser):string {
    const branchId = authUser?.branchId ?? null;
    if (!branchId) {
      throw new BadRequestException('User has no branchId (login with branch account)');
    }
    return branchId;

  }

  // ---------------------------
  // list / card
  // ---------------------------
  async list(branchId?: string) {
    return this.prisma.student.findMany({
      where: { ...(branchId ? { branchId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: true,
        parentLinks: { include: { parentUser: true } },
        enrollments: { include: { group: true } },
        lessonBalance: true,
      },
    });
  }

  async getCard(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        branch: true,
        lessonBalance: true,
        parentLinks: { include: { parentUser: true } },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          include: { group: true },
        },
        attendances: {
          orderBy: { lesson: { startsAt: 'desc' } },
          take: 300,
          include: { lesson: { include: { group: true } } },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 60,
          include: { payments: { orderBy: { paidAt: 'desc' } } },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 200,
          include: { invoice: true },
        },
        kiberonTx: { orderBy: { createdAt: 'desc' }, take: 200 },
      },
    });

    if (!student) return null;

    const kiberAgg = await this.prisma.kiberonTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });
    const kiberBalance = kiberAgg._sum.amount ?? 0;

    const invAgg = await this.prisma.invoice.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });
    const payAgg = await this.prisma.payment.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    const totalInvoiced = invAgg._sum.amount ?? 0;
    const totalPaid = payAgg._sum.amount ?? 0;
    const debt = totalInvoiced - totalPaid;

    const attendanceStats = student.attendances.reduce(
      (acc, a) => {
        acc.total++;
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );

    return {
      student,
      totals: {
        kiberBalance,
        totalInvoiced,
        totalPaid,
        debt,
        availableLessons: student.lessonBalance?.availableLessons ?? 0,
      },
      attendanceStats,
    };
  }

  // ---------------------------
  // createWithParents
  // ---------------------------
  async createWithParents(dto: CreateStudentDto, authUser: AuthUser) {
    const { branchId, userId } = this.getAuthIds(authUser);

    if (!branchId) throw new BadRequestException('User has no branchId (login with branch account)');
    if (!userId) throw new BadRequestException('User id missing in token');

    if (dto.groupId) {
      const g = await this.prisma.group.findUnique({
        where: { id: dto.groupId },
        select: { id: true, branchId: true },
      });
      if (!g) throw new BadRequestException('groupId not found');
      if (g.branchId !== branchId) throw new BadRequestException('groupId belongs to another branch');
    }

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          branchId,
          fullName: dto.fullName,

          phone: dto.phone ?? null,
          city: dto.city ?? null,
          email: dto.email ?? null,
          portfolio: dto.portfolio ?? null,

          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,

          paymentMode: dto.paymentMode ?? null,
          paymentDueDay: dto.paymentDueDay ?? null,
        },
        include: { branch: true },
      });

      if (dto.groupId) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            groupId: dto.groupId,
            fromDate: new Date(),
          },
        });
      }

      if ((dto.initialLessonBalance ?? 0) !== 0) {
        await tx.lessonBalance.upsert({
          where: { studentId: student.id },
          create: { studentId: student.id, availableLessons: dto.initialLessonBalance ?? 0 },
          update: { availableLessons: dto.initialLessonBalance ?? 0 },
        });
      }

      if ((dto.initialKiberons ?? 0) !== 0) {
        await tx.kiberonTransaction.create({
          data: {
            studentId: student.id,
            amount: dto.initialKiberons ?? 0,
            reason: 'MANUAL',
            createdByUserId: userId,
          },
        });
      }

      const parentsOut: Array<{ userId: string; fullName: string; phone: string; login: string; password: string }> = [];

      for (const p of dto.parents ?? []) {
        const login =
          (p.email && String(p.email).trim().length > 0)
            ? String(p.email).trim()
            : this.makeParentEmail(String(p.phone));

        const password = this.genPassword(10);
        const passwordHash = await bcrypt.hash(password, 10);

        const parentUser = await tx.user.upsert({
          where: { email: login },
          update: {
            role: 'PARENT',
            branchId,
            fullName: p.fullName ?? undefined,
            phone: p.phone ?? undefined,
            isActive: true,
          },
          create: {
            email: login,
            passwordHash,
            role: 'PARENT',
            branchId,
            fullName: p.fullName,
            phone: p.phone,
            isActive: true,
          },
        });

        await tx.parentStudent.upsert({
          where: { parentUserId_studentId: { parentUserId: parentUser.id, studentId: student.id } },
          update: { relationType: (p as any).relationType ?? null },
          create: { parentUserId: parentUser.id, studentId: student.id, relationType: (p as any).relationType ?? null },
        });

        parentsOut.push({
          userId: parentUser.id,
          fullName: p.fullName,
          phone: p.phone,
          login,
          password,
        });
      }

      return { student, parents: parentsOut };
    });
  }
  async listForParent(parentUserId: string) {
  return this.prisma.student.findMany({
    where: {
      parentLinks: {
        some: { parentUserId },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      branch: true,
      parentLinks: { include: { parentUser: true } },
      enrollments: { include: { group: true } },
      lessonBalance: true,
    },
  });
}


  // ---------------------------
  // update
  // ---------------------------
  async update(id: string, dto: UpdateStudentDto, authUser?: AuthUser) {
    const { branchId } = this.getAuthIds(authUser ?? {});
    const existing = await this.prisma.student.findUnique({ where: { id }, select: { id: true, branchId: true } });
    if (!existing) throw new NotFoundException('Student not found');
    if (branchId && existing.branchId !== branchId) throw new BadRequestException('Forbidden: another branch');

    return this.prisma.student.update({
      where: { id },
      data: {
        fullName: dto.fullName ?? undefined,
        phone: dto.phone ?? undefined,
        city: dto.city ?? undefined,
        email: dto.email ?? undefined,
        portfolio: dto.portfolio ?? undefined,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : undefined,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        status: dto.status as any,
        paymentMode: dto.paymentMode ?? undefined,
        paymentDueDay: dto.paymentDueDay ?? undefined,
      },
      include: { branch: true },
    });
  }

  // ---------------------------
  // archive/restore
  // ---------------------------
  async archive(id: string) {
    return this.prisma.student.update({ where: { id }, data: { status: 'LEFT' } });
  }

  async restore(id: string) {
    return this.prisma.student.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  // ---------------------------
  // addParent (existing student)
  // ---------------------------
  async addParent(studentId: string, dto: AddParentDto, authUser?: AuthUser) {
    const { branchId } = this.getAuthIds(authUser ?? {});
    const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { id: true, branchId: true } });
    if (!student) throw new NotFoundException('Student not found');
    if (branchId && student.branchId !== branchId) throw new BadRequestException('Forbidden: another branch');

    const login = dto.email?.trim() ? dto.email.trim() : this.makeParentEmail(dto.phone);
    const tempPass = dto.password?.trim() || this.genPassword(10);
    const hash = await bcrypt.hash(tempPass, 10);

    const parent = await this.prisma.user.upsert({
      where: { email: login },
      update: {
        role: 'PARENT',
        branchId: student.branchId,
        fullName: dto.fullName ?? undefined,
        phone: dto.phone ?? undefined,
        isActive: true,
      },
      create: {
        email: login,
        passwordHash: hash,
        role: 'PARENT',
        branchId: student.branchId,
        fullName: dto.fullName ?? login,
        phone: dto.phone,
        isActive: true,
      },
    });

    const link = await this.prisma.parentStudent.upsert({
      where: { parentUserId_studentId: { parentUserId: parent.id, studentId } },
      update: { relationType: dto.relationType ?? null },
      create: { parentUserId: parent.id, studentId, relationType: dto.relationType ?? null },
      include: { parentUser: true, student: true },
    });

    return {
      link,
      tempPassword: dto.password ? undefined : tempPass,
    };
  }
  // ---------------------------
  // resetParentPassword
  // ---------------------------
  async resetParentPassword(
    studentId: string,
    dto: ResetParentPasswordDto,
    user: AuthUser,
  ) {
    const branchId = this.getBranchId(user);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        parentLinks: {
          include: {
            parentUser: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.branchId !== branchId) {
      throw new BadRequestException('Student belongs to another branch');
    }

    const link = student.parentLinks.find(
      (x) => x.parentUserId === dto.parentUserId,
    );

    if (!link) {
      throw new BadRequestException('Parent is not linked to this student');
    }

    const parent = link.parentUser;
    if (!parent) {
      throw new NotFoundException('Parent user not found');
    }

    if (parent.branchId !== branchId) {
      throw new BadRequestException('Parent belongs to another branch');
    }

    const newPassword = this.genPassword(8);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: parent.id },
      data: {
        passwordHash,
      },
    });

    return {
      parentUserId: parent.id,
      fullName: parent.fullName,
      login: parent.email,
      password: newPassword,
    };
  }

}

