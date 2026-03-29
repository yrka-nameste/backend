import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(user: AuthUser, action: any, entity?: string, entityId?: string, meta?: any) {
    const branchId = user?.branchId ?? null;
    const actorUserId = (user?.userId ?? user?.id ?? null) as string | null;
    if (!branchId) return;

    await this.prisma.auditLog.create({
      data: {
        branchId,
        actorUserId: actorUserId ?? undefined,
        action,
        entity: entity ?? null,
        entityId: entityId ?? null,
        meta: meta ? JSON.stringify(meta) : null,
      } as any,
    });
  }
}