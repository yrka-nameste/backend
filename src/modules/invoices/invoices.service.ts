import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

function parseDateOnlyUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map((x) => parseInt(x, 10));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  async generateForBranch(dto: GenerateInvoicesDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const students = await this.prisma.student.findMany({
      where: { branchId, status: 'ACTIVE' as any },
      select: { id: true },
    });

    const dueDate = parseDateOnlyUTC(dto.dueDate);

    let created = 0;
    for (const st of students) {
      const exists = await this.prisma.invoice.findFirst({
        where: { branchId, studentId: st.id, period: dto.period },
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

    await this.audit.log(user, 'INVOICE_CREATED', 'Invoice', null, {
      period: dto.period,
      created,
    });

    return { created, period: dto.period };
  }

  async listStudent(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const st = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const invoices = await this.prisma.invoice.findMany({
      where: { studentId },
      orderBy: { dueDate: 'desc' },
      include: { payments: true },
    });

    const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
    const totalPaid = invoices.reduce(
      (s, i) => s + (i.payments?.reduce((p, x) => p + x.amount, 0) ?? 0),
      0,
    );

    // ✅ минимальный фикс: долг не уходит в минус
    const debt = Math.max(0, totalInvoiced - totalPaid);

    return { invoices, totals: { totalInvoiced, totalPaid, debt } };
  }

  async debtors(user: AuthUser, onlyNegative: boolean) {
    const branchId = this.getBranchId(user);

    const students = await this.prisma.student.findMany({
      where: { branchId },
      select: { id: true, fullName: true, status: true },
    });

    const out: any[] = [];
    for (const st of students) {
      const invoices = await this.prisma.invoice.findMany({
        where: { studentId: st.id },
        include: { payments: true },
      });

      const totalInvoiced = invoices.reduce((s, i) => s + i.amount, 0);
      const totalPaid = invoices.reduce(
        (s, i) => s + (i.payments?.reduce((p, x) => p + x.amount, 0) ?? 0),
        0,
      );

      // ✅ минимальный фикс: долг не уходит в минус
      const debt = Math.max(0, totalInvoiced - totalPaid);

      if (onlyNegative && debt <= 0) continue;

      out.push({
        studentId: st.id,
        fullName: st.fullName,
        status: st.status,
        totalInvoiced,
        totalPaid,
        debt,
      });
    }

    out.sort((a, b) => b.debt - a.debt);
    return out;
  }
}