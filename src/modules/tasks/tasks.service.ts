import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTaskDto } from './dto/create-task.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

function startOfDayUTC(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0));
}
function addDaysUTC(d: Date, days: number) {
  return new Date(d.getTime() + days * 86400000);
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async list(scope: string, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const now = new Date();
    const today0 = startOfDayUTC(now);

    const where: any = { branchId };

    if (scope === 'today') {
      where.dueDate = { gte: today0, lt: addDaysUTC(today0, 1) };
    } else if (scope === 'week') {
      where.dueDate = { gte: today0, lt: addDaysUTC(today0, 7) };
    } else if (scope === 'month') {
      where.dueDate = { gte: today0, lt: addDaysUTC(today0, 31) };
    } else if (scope === 'overdue') {
      where.dueDate = { lt: today0 };
      where.status = { notIn: ['DONE', 'CANCELED'] };
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async create(dto: CreateTaskDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const createdByUserId = this.getUserId(user);

    const t = await this.prisma.task.create({
      data: {
        branchId,
        title: dto.title,
        description: dto.description ?? null,
        status: (dto.status as any) ?? 'TODO',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        assignedToUserId: dto.assignedToUserId ?? null,
        createdByUserId: createdByUserId ?? null,
      } as any,
    });

    await this.audit.log(user, 'STUDENT_UPDATED', 'Task', t.id, { title: t.title });
    return t;
  }

  async update(id: string, dto: CreateTaskDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const t = await this.prisma.task.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Task not found');
    if (t.branchId !== branchId) throw new BadRequestException('Task belongs to another branch');

    const upd = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.status !== undefined ? { status: dto.status as any } : {}),
        ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
        ...(dto.assignedToUserId !== undefined ? { assignedToUserId: dto.assignedToUserId } : {}),
      } as any,
    });

    await this.audit.log(user, 'STUDENT_UPDATED', 'Task', id, { updated: true });
    return upd;
  }
}