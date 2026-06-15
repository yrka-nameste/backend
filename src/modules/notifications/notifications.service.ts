import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AuthUser = {
  userId?: string;
  id?: string;
  branchId?: string;
  role?: string;
};

type PrismaLike = PrismaService | any;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private ensureAdmin(user: AuthUser) {
    if (user?.role !== 'ADMIN' && user?.role !== 'DIRECTOR') {
      throw new ForbiddenException('Notifications are available only for admin panel users');
    }
  }

  async createPaymentNotification(
    client: PrismaLike,
    args: {
      branchId: string;
      paymentId: string;
      studentName: string;
      amount: number;
      method?: string | null;
      receiptUrl?: string | null;
    },
  ) {
    return client.adminNotification.create({
      data: {
        branchId: args.branchId,
        type: 'PAYMENT_CREATED' as any,
        title: 'Новая оплата из мобильного приложения',
        message: `${args.studentName} отправил оплату на сумму ${args.amount}`,
        entity: 'Payment',
        entityId: args.paymentId,
        meta: {
          paymentId: args.paymentId,
          studentName: args.studentName,
          amount: args.amount,
          method: args.method ?? null,
          receiptUrl: args.receiptUrl ?? null,
        },
      } as any,
    });
  }

  async createShopOrderNotification(
    client: PrismaLike,
    args: {
      branchId: string;
      orderId: string;
      studentName: string;
      itemTitle: string;
      priceKiber: number;
    },
  ) {
    return client.adminNotification.create({
      data: {
        branchId: args.branchId,
        type: 'SHOP_ORDER_CREATED' as any,
        title: 'Новая заявка в магазине',
        message: `${args.studentName} заказал «${args.itemTitle}» за ${args.priceKiber} киберонов`,
        entity: 'ShopOrder',
        entityId: args.orderId,
        meta: {
          orderId: args.orderId,
          studentName: args.studentName,
          itemTitle: args.itemTitle,
          priceKiber: args.priceKiber,
        },
      } as any,
    });
  }

  async summary(user: AuthUser) {
    this.ensureAdmin(user);
    const branchId = this.getBranchId(user);

    const [
      unreadTotal,
      unreadPayments,
      unreadShopOrders,
      pendingShopOrders,
      latest,
    ] = await Promise.all([
      this.prisma.adminNotification.count({
        where: { branchId, status: 'UNREAD' as any },
      }),
      this.prisma.adminNotification.count({
        where: {
          branchId,
          status: 'UNREAD' as any,
          type: 'PAYMENT_CREATED' as any,
        },
      }),
      this.prisma.adminNotification.count({
        where: {
          branchId,
          status: 'UNREAD' as any,
          type: 'SHOP_ORDER_CREATED' as any,
        },
      }),
      this.prisma.shopOrder.count({
        where: { branchId, status: 'REQUESTED' as any },
      }),
      this.prisma.adminNotification.findMany({
        where: { branchId, status: 'UNREAD' as any },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      unreadTotal,
      unreadPayments,
      unreadShopOrders,
      pendingShopOrders,
      latest,
    };
  }

  async list(user: AuthUser, status?: string, take?: string) {
    this.ensureAdmin(user);
    const branchId = this.getBranchId(user);

    const normalizedStatus =
      status === 'READ' ? 'READ' : status === 'ALL' ? undefined : 'UNREAD';

    const limit = Math.min(Math.max(Number(take ?? 20) || 20, 1), 100);

    return this.prisma.adminNotification.findMany({
      where: {
        branchId,
        ...(normalizedStatus ? { status: normalizedStatus as any } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async markRead(user: AuthUser, ids?: string[]) {
    this.ensureAdmin(user);
    const branchId = this.getBranchId(user);

    const where: any = {
      branchId,
      status: 'UNREAD',
    };

    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    const result = await this.prisma.adminNotification.updateMany({
      where,
      data: {
        status: 'READ' as any,
        readAt: new Date(),
      },
    });

    const summary = await this.summary(user);

    return {
      ok: true,
      updated: result.count,
      summary,
    };
  }
}