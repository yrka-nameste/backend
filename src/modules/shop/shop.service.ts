import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateShopItemDto } from './dto/create-item.dto';
import { CreateShopOrderDto } from './dto/create-order.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async listItems(visible: string | undefined, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const where: any = { branchId };
    if (visible === 'true') where.isVisible = true;
    if (visible === 'false') where.isVisible = false;

    return this.prisma.shopItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createItem(dto: CreateShopItemDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const it = await this.prisma.shopItem.create({
      data: {
        branchId,
        title: dto.title,
        description: dto.description ?? null,
        imageUrl: dto.imageUrl ?? null,
        priceKiber: dto.priceKiber,
        isVisible: dto.isVisible ?? true,
      } as any,
    });

    await this.audit.log(user, 'SHOP_ORDER_CREATED', 'ShopItem', it.id, { title: it.title });
    return it;
  }

  async updateItem(id: string, dto: CreateShopItemDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const it = await this.prisma.shopItem.findUnique({ where: { id } });
    if (!it) throw new NotFoundException('ShopItem not found');
    if (it.branchId !== branchId) throw new BadRequestException('Item belongs to another branch');

    return this.prisma.shopItem.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.priceKiber !== undefined ? { priceKiber: dto.priceKiber } : {}),
        ...(dto.isVisible !== undefined ? { isVisible: dto.isVisible } : {}),
      } as any,
    });
  }

  async listOrders(status: string | undefined, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const where: any = { branchId };
    if (status) where.status = status;

    return this.prisma.shopOrder.findMany({
      where,
      include: { item: true, student: true },
      orderBy: { createdAt: 'desc' },
    });
  }
  async listOrders(status: string | undefined, user: AuthUser) {
  const branchId = this.getBranchId(user);
  const where: any = { branchId };
  if (status) where.status = status;

 
  if (user?.role === 'PARENT') {
    where.student = {
      parentLinks: { some: { parentUserId: user.userId as string } },
    };
  }

  return this.prisma.shopOrder.findMany({
    where,
    include: { item: true, student: true },
    orderBy: { createdAt: 'desc' },
  });
}


  async createOrder(dto: CreateShopOrderDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const it = await this.prisma.shopItem.findUnique({ where: { id: dto.itemId } });
    if (!it) throw new BadRequestException('itemId not found');
    if (it.branchId !== branchId) throw new BadRequestException('item belongs to another branch');

    const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const o = await this.prisma.shopOrder.create({
      data: {
        branchId,
        itemId: dto.itemId,
        studentId: dto.studentId,
        comment: dto.comment ?? null,
        status: 'REQUESTED' as any,
      } as any,
    });

    await this.audit.log(user, 'SHOP_ORDER_CREATED', 'ShopOrder', o.id, { itemId: dto.itemId, studentId: dto.studentId });
    return o;
  }

  async approve(orderId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const decidedByUserId = this.getUserId(user);
    const o = await this.prisma.shopOrder.findUnique({ where: { id: orderId }, include: { item: true } });
    if (!o) throw new NotFoundException('Order not found');
    if (o.branchId !== branchId) throw new BadRequestException('Order belongs to another branch');
    if (o.status !== 'REQUESTED') throw new BadRequestException('Order is not REQUESTED');

    await this.prisma.$transaction(async (tx) => {
      await tx.shopOrder.update({
        where: { id: orderId },
        data: { status: 'APPROVED' as any, decidedByUserId: decidedByUserId ?? null },
      });

      await tx.kiberonTransaction.create({
        data: {
          studentId: o.studentId,
          amount: -o.item.priceKiber,
          reason: 'SPEND' as any,
          createdByUserId: decidedByUserId ?? undefined,
        } as any,
      });
    });

    await this.audit.log(user, 'SHOP_ORDER_APPROVED', 'ShopOrder', orderId, { spend: o.item.priceKiber });
    return { ok: true };
  }

  async reject(orderId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const decidedByUserId = this.getUserId(user);

    const o = await this.prisma.shopOrder.findUnique({ where: { id: orderId } });
    if (!o) throw new NotFoundException('Order not found');
    if (o.branchId !== branchId) throw new BadRequestException('Order belongs to another branch');

    await this.prisma.shopOrder.update({
      where: { id: orderId },
      data: { status: 'REJECTED' as any, decidedByUserId: decidedByUserId ?? null },
    });

    await this.audit.log(user, 'SHOP_ORDER_REJECTED', 'ShopOrder', orderId, {});
    return { ok: true };
  }
}