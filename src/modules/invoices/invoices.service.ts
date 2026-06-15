import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

type AuthUser = {
  userId?: string;
  id?: string;
  branchId?: string;
  role?: string;
};

const MONTHLY_PRICE = 750;

function parseDateOnlyUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function normalizePeriod(period?: string): string {
  if (!period) return getCurrentPeriod();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    throw new BadRequestException('period must be in YYYY-MM format');
  }
  return period;
}

function getMonthRange(period: string): { start: Date; end: Date } {
  const [year, month] = period.split('-').map((x) => parseInt(x, 10));

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return { start, end };
}

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  async generateForBranch(dto: GenerateInvoicesDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const students = await this.prisma.student.findMany({
      where: {
        branchId,
        status: 'ACTIVE' as any,
      },
      select: {
        id: true,
      },
    });

    const dueDate = parseDateOnlyUTC(dto.dueDate);

    let created = 0;

    for (const st of students) {
      const exists = await this.prisma.invoice.findFirst({
        where: {
          branchId,
          studentId: st.id,
          period: dto.period,
        },
      });

      if (exists) continue;

      await this.prisma.invoice.create({
        data: {
          branchId,
          studentId: st.id,
          period: dto.period,
          dueDate,
          amount: dto.amount,
          status: 'ISSUED' as any,
        } as any,
      });

      created++;
    }

    await this.audit.log(user, 'INVOICE_CREATED', 'Invoice', undefined, {
      period: dto.period,
      created,
    });

    return {
      created,
      period: dto.period,
    };
  }

  async listStudent(studentId: string, user: AuthUser, period?: string) {
    const branchId = this.getBranchId(user);
    const normalizedPeriod = normalizePeriod(period);
    const { start, end } = getMonthRange(normalizedPeriod);

    const st = await this.prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!st) throw new BadRequestException('studentId not found');

    if (st.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const [invoices, monthPayments] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          studentId,
        },
        orderBy: {
          dueDate: 'desc',
        },
        include: {
          payments: true,
        },
      }),

      this.prisma.payment.findMany({
        where: {
          studentId,
          paidAt: {
            gte: start,
            lt: end,
          },
        },
        orderBy: {
          paidAt: 'desc',
        },
      }),
    ]);

    const totalInvoiced = invoices.reduce((sum, invoice) => {
      return sum + invoice.amount;
    }, 0);

    const totalPaidByInvoices = invoices.reduce((sum, invoice) => {
      const paid = invoice.payments?.reduce((paymentSum, payment) => {
        return paymentSum + payment.amount;
      }, 0);

      return sum + (paid ?? 0);
    }, 0);

    const monthPaid = monthPayments.reduce((sum, payment) => {
      return sum + payment.amount;
    }, 0);

    const hasMonthPayment = monthPaid > 0;

    const currentMonthDebt =
      st.status === 'ACTIVE' && !hasMonthPayment ? MONTHLY_PRICE : 0;

    return {
      student: {
        id: st.id,
        fullName: st.fullName,
        status: st.status,
      },
      period: normalizedPeriod,
      monthlyPrice: MONTHLY_PRICE,
      invoices,
      monthPayments,
      totals: {
        totalInvoiced,
        totalPaidByInvoices,
        monthPaid,
        hasMonthPayment,
        currentMonthDebt,
      },
    };
  }

  async debtors(user: AuthUser, onlyNegative: boolean, period?: string) {
    const branchId = this.getBranchId(user);
    const normalizedPeriod = normalizePeriod(period);
    const { start, end } = getMonthRange(normalizedPeriod);

    const students = await this.prisma.student.findMany({
      where: {
        branchId,
        status: 'ACTIVE' as any,
      },
      select: {
        id: true,
        fullName: true,
        status: true,
        phone: true,
        email: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    const payments = await this.prisma.payment.findMany({
      where: {
        student: {
          branchId,
        },
        paidAt: {
          gte: start,
          lt: end,
        },
      },
      select: {
        id: true,
        studentId: true,
        amount: true,
        paidAt: true,
        method: true,
        comment: true,
        receiptUrl: true,
      },
      orderBy: {
        paidAt: 'desc',
      },
    });

    const paidByStudent = new Map<string, number>();

    for (const payment of payments) {
      const current = paidByStudent.get(payment.studentId) ?? 0;
      paidByStudent.set(payment.studentId, current + payment.amount);
    }

    const out: any[] = [];

    for (const st of students) {
      const monthPaid = paidByStudent.get(st.id) ?? 0;
      const hasMonthPayment = monthPaid > 0;

      const debt = hasMonthPayment ? 0 : MONTHLY_PRICE;

      if (onlyNegative && debt <= 0) continue;

      out.push({
        studentId: st.id,
        fullName: st.fullName,
        status: st.status,
        phone: st.phone,
        email: st.email,
        period: normalizedPeriod,
        monthlyPrice: MONTHLY_PRICE,
        monthPaid,
        hasMonthPayment,
        debt,
      });
    }

    out.sort((a, b) => b.debt - a.debt || a.fullName.localeCompare(b.fullName));

    return out;
  }
}