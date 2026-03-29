import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  async summary(user: AuthUser) {
    const branchId = this.getBranchId(user);

    // диапазон текущего месяца (UTC)
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));

    // активные ученики
    const activeStudents = await this.prisma.student.count({
      where: { branchId, status: 'ACTIVE' as any },
    });

    // оплаты за месяц
    const payAggMonth = await this.prisma.payment.aggregate({
      where: {
        student: { branchId },
        paidAt: { gte: start, lt: end },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const revenueMonth = payAggMonth._sum.amount ?? 0;
    const paymentsCountMonth = payAggMonth._count.id ?? 0;

    // начислено всего по филиалу
    const invAgg = await this.prisma.invoice.aggregate({
      where: { branchId },
      _sum: { amount: true },
    });
    const totalInvoiced = invAgg._sum.amount ?? 0;

    // оплачено всего по филиалу
    const payAggAll = await this.prisma.payment.aggregate({
      where: { student: { branchId } },
      _sum: { amount: true },
    });
    const totalPaid = payAggAll._sum.amount ?? 0;

    // долг (не отрицательный)
    const debt = Math.max(0, totalInvoiced - totalPaid);

    return {
      activeStudents,
      revenueMonth,
      debt,
      paymentsCountMonth,

      // ✅ для кругов/графиков
      totalInvoiced,
      totalPaid,

      monthStart: start.toISOString(),
      monthEnd: end.toISOString(),
    };
  }
}
