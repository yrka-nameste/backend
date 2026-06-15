import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type AuthUser = {
  userId?: string;
  id?: string;
  branchId?: string;
  role?: string;
};

const MONTHLY_PRICE = 750;
const LESSONS_PER_MONTH = 4;

function getPeriodFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getDueDateForPeriod(period: string): Date {
  const [year, month] = period.split('-').map((x) => parseInt(x, 10));

  return new Date(Date.UTC(year, month - 1, 10, 0, 0, 0));
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  private calculateLessonsFromAmount(amount: number): number {
    if (!amount || amount <= 0) return 0;

    return Math.floor((amount * LESSONS_PER_MONTH) / MONTHLY_PRICE);
  }

  async create(dto: CreatePaymentDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const createdByUserId = this.getUserId(user);

    const st = await this.prisma.student.findUnique({
      where: {
        id: dto.studentId,
      },
    });

    if (!st) throw new BadRequestException('studentId not found');

    if (st.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const source =
      dto.source ?? (user?.role === 'PARENT' ? 'MOBILE_APP' : 'ADMIN_PANEL');

    const paidAt = new Date();
    const period = getPeriodFromDate(paidAt);
    const dueDate = getDueDateForPeriod(period);

    return this.prisma.$transaction(async (tx) => {
      let invoice = await tx.invoice.findFirst({
        where: {
          branchId,
          studentId: dto.studentId,
          period,
        },
      });

      if (!invoice) {
        invoice = await tx.invoice.create({
          data: {
            branchId,
            studentId: dto.studentId,
            period,
            dueDate,
            amount: MONTHLY_PRICE,
            status: 'ISSUED' as any,
          } as any,
        });
      }

      const payment = await tx.payment.create({
        data: {
          studentId: dto.studentId,
          amount: dto.amount,
          method: dto.method ?? 'cash',
          comment: dto.comment ?? null,
          receiptUrl: dto.receiptUrl ?? null,
          source,
          invoiceId: invoice.id,
          createdByUserId: createdByUserId ?? undefined,
        } as any,
      });

      const invoicePayments = await tx.payment.findMany({
        where: {
          invoiceId: invoice.id,
        },
        select: {
          amount: true,
        },
      });

      const paidForInvoice = invoicePayments.reduce((sum, item) => {
        return sum + item.amount;
      }, 0);

      if (paidForInvoice >= invoice.amount) {
        await tx.invoice.update({
          where: {
            id: invoice.id,
          },
          data: {
            status: 'PAID' as any,
          },
        });
      }

      const add =
        source === 'MOBILE_APP'
          ? this.calculateLessonsFromAmount(dto.amount)
          : dto.addLessons ?? this.calculateLessonsFromAmount(dto.amount);

      if (add > 0) {
        await tx.lessonBalance.upsert({
          where: {
            studentId: dto.studentId,
          },
          create: {
            studentId: dto.studentId,
            availableLessons: add,
          },
          update: {
            availableLessons: {
              increment: add,
            },
          },
        });
      }

      if (source === 'MOBILE_APP') {
        await this.notifications.createPaymentNotification(tx, {
          branchId,
          paymentId: payment.id,
          studentName: st.fullName,
          amount: payment.amount,
          method: payment.method,
          receiptUrl: payment.receiptUrl,
        });
      }

      return {
        payment,
        invoiceId: invoice.id,
        period,
        addedLessons: add,
        notificationCreated: source === 'MOBILE_APP',
      };
    });
  }

  async getStudentPayments(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const st = await this.prisma.student.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!st) throw new BadRequestException('studentId not found');

    if (st.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    return this.prisma.payment.findMany({
      where: {
        studentId,
      },
      orderBy: {
        paidAt: 'desc',
      },
      include: {
        invoice: true,
      },
    });
  }
}