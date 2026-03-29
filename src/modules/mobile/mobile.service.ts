import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AuthUser = {
  userId?: string;
  id?: string;
  branchId?: string;
  role?: string;
  email?: string | null;
};

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string {
    const userId = (user?.userId ?? user?.id ?? '').toString();
    if (!userId) throw new BadRequestException('User id missing');
    return userId;
  }

  async parentHome(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        branch: true,
        lessonBalance: true,
        enrollments: {
          include: {
            group: {
              include: {
                teachers: {
                  include: {
                    teacher: {
                      select: { id: true, fullName: true, phone: true, email: true },
                    },
                  },
                },
                scheduleRule: true,
              },
            },
          },
        },
      },
    });

    if (!student) throw new BadRequestException('studentId not found');
    if (student.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const kiberAgg = await this.prisma.kiberonTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    const nextPayments = await this.prisma.invoice.findMany({
      where: {
        studentId,
        status: { in: ['ISSUED', 'OVERDUE'] as any },
      },
      orderBy: { dueDate: 'asc' },
      take: 1,
    });

    const recentAttendances = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        lesson: {
          include: { group: true },
        },
      },
      orderBy: { lesson: { startsAt: 'desc' } },
      take: 10,
    });

    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1, 0, 0, 0, 0);

    const monthInvoiced = await this.prisma.invoice.aggregate({
      where: {
        studentId,
        dueDate: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    });

    const monthPaid = await this.prisma.payment.aggregate({
      where: {
        studentId,
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amount: true },
    });

    const totalInvoicedThisMonth = monthInvoiced._sum.amount ?? 0;
    const totalPaidThisMonth = monthPaid._sum.amount ?? 0;

    let paymentStatusThisMonth = 'NO_INVOICE';
    if (totalInvoicedThisMonth > 0 && totalPaidThisMonth <= 0) paymentStatusThisMonth = 'UNPAID';
    if (totalInvoicedThisMonth > 0 && totalPaidThisMonth > 0 && totalPaidThisMonth < totalInvoicedThisMonth) {
      paymentStatusThisMonth = 'PARTIAL';
    }
    if (totalInvoicedThisMonth > 0 && totalPaidThisMonth >= totalInvoicedThisMonth) {
      paymentStatusThisMonth = 'PAID';
    }

    return {
      student,
      kiberBalance: kiberAgg._sum.amount ?? 0,
      availableLessons: student.lessonBalance?.availableLessons ?? 0,
      nextPayment: nextPayments[0] ?? null,
      recentAttendances,
      paymentStatusThisMonth,
      totalInvoicedThisMonth,
      totalPaidThisMonth,
    };
  }

  async parentKiberons(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new BadRequestException('studentId not found');
    if (student.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const tx = await this.prisma.kiberonTransaction.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const orders = await this.prisma.shopOrder.findMany({
      where: { studentId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { tx, orders };
  }

  async parentShop(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new BadRequestException('studentId not found');
    if (student.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const items = await this.prisma.shopItem.findMany({
      where: { branchId, isVisible: true },
      orderBy: { createdAt: 'desc' },
    });

    const orders = await this.prisma.shopOrder.findMany({
      where: { studentId },
      include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return { items, orders };
  }

  async parentPayments(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new BadRequestException('studentId not found');
    if (student.branchId !== branchId) {
      throw new BadRequestException('student belongs to another branch');
    }

    const payments = await this.prisma.payment.findMany({
      where: { studentId },
      orderBy: { paidAt: 'desc' },
      take: 100,
    });

    const invoices = await this.prisma.invoice.findMany({
      where: { studentId },
      include: { payments: true },
      orderBy: { dueDate: 'desc' },
      take: 50,
    });

    return { payments, invoices };
  }

  async teacherHome(user: AuthUser) {
    const userId = this.getUserId(user);
    const branchId = this.getBranchId(user);

    const groups = await this.prisma.groupTeacher.findMany({
      where: { teacherUserId: userId },
      include: { group: true },
    });

    const upcomingLessons = await this.prisma.lesson.findMany({
      where: {
        teacherUserId: userId,
        group: { branchId },
      },
      include: { group: true },
      orderBy: { startsAt: 'asc' },
      take: 10,
    });

    return { groups, upcomingLessons };
  }

  async teacherLessonsToday(user: AuthUser) {
    const userId = this.getUserId(user);
    const branchId = this.getBranchId(user);

    const now = new Date();
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(now);
    dayEnd.setHours(23, 59, 59, 999);

    return this.prisma.lesson.findMany({
      where: {
        teacherUserId: userId,
        startsAt: { gte: dayStart, lte: dayEnd },
        group: { branchId },
      },
      include: { group: true },
      orderBy: { startsAt: 'asc' },
    });
  }

  async teacherGroups(user: AuthUser) {
    const userId = this.getUserId(user);

    return this.prisma.groupTeacher.findMany({
      where: { teacherUserId: userId },
      include: {
        group: {
          include: {
            enrollments: { include: { student: true } },
            scheduleRule: true,
          },
        },
      },
      orderBy: { group: { name: 'asc' } },
    });
  }

  async teacherGroup(groupId: string, user: AuthUser) {
    const userId = this.getUserId(user);

    const link = await this.prisma.groupTeacher.findFirst({
      where: { groupId, teacherUserId: userId },
    });

    if (!link) throw new BadRequestException('Teacher is not assigned to this group');

    return this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        teachers: {
          include: {
            teacher: {
              select: { id: true, fullName: true, email: true, phone: true },
            },
          },
        },
        enrollments: { include: { student: true } },
        scheduleRule: true,
        lessons: {
          orderBy: { startsAt: 'asc' },
          take: 50,
        },
        programs: true,
      },
    });
  }

  async birthdays(user: AuthUser) {
    const branchId = this.getBranchId(user);

    const now = new Date();
    const month = now.getMonth() + 1;

    const students = await this.prisma.student.findMany({
      where: {
        branchId,
        birthDate: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        birthDate: true,
        phone: true,
        city: true,
      },
      orderBy: { fullName: 'asc' },
    });

    return students.filter((s) => {
      if (!s.birthDate) return false;
      return s.birthDate.getMonth() + 1 === month;
    });
  }

  async absentThisWeek(user: AuthUser) {
    const branchId = this.getBranchId(user);

    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return this.prisma.attendance.findMany({
      where: {
        status: 'ABSENT' as any,
        lesson: {
          startsAt: { gte: weekStart, lt: weekEnd },
          group: { branchId },
        },
      },
      include: {
        student: true,
        lesson: {
          include: { group: true },
        },
      },
      orderBy: {
        lesson: { startsAt: 'desc' },
      },
    });
  }
}
