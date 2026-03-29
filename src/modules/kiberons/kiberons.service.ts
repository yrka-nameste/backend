import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class KiberonsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async create(dto: any, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const createdByUserId = this.getUserId(user);

    const studentId = (dto?.studentId ?? '').toString();
    const reason = (dto?.reason ?? 'MANUAL').toString();
    const comment = dto?.comment != null ? dto.comment.toString() : null;

    const amount = Number(dto?.amount);
    if (!studentId) throw new BadRequestException('studentId is required');
    if (!Number.isFinite(amount) || amount === 0) {
      throw new BadRequestException('amount must be a non-zero number');
    }

    const st = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const tx = await this.prisma.kiberonTransaction.create({
      data: {
        studentId,
        amount,
        reason,
        comment,
        createdByUserId: createdByUserId ?? undefined,
      } as any,
    });

    const agg = await this.prisma.kiberonTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    return { tx, balance: agg._sum.amount ?? 0 };
  }

  async getStudentKiberons(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const st = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    return this.prisma.kiberonTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async getStudentKiberonsBalance(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const st = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const agg = await this.prisma.kiberonTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    return { studentId, balance: agg._sum.amount ?? 0 };
  }
}