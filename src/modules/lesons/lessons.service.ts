import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  async list(
    params: { groupId?: string; teacherUserId?: string; from?: string; to?: string },
    user: AuthUser,
  ) {
    const branchId = this.getBranchId(user);

    const where: any = {
      group: { branchId },
    };

    if (params.groupId) where.groupId = params.groupId;
    if (params.teacherUserId) where.teacherUserId = params.teacherUserId;

    if (params.from || params.to) {
      where.startsAt = {};
      if (params.from) where.startsAt.gte = new Date(params.from);
      if (params.to) where.startsAt.lte = new Date(params.to);
    }

    return this.prisma.lesson.findMany({
      where,
      include: {
        group: true,
        teacher: {
          select: { id: true, fullName: true, email: true, phone: true, role: true },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  async getOne(id: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        group: true,
        teacher: {
          select: { id: true, fullName: true, email: true, phone: true, role: true },
        },
        attendances: {
          include: {
            student: true,
          },
        },
      },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) {
      throw new BadRequestException('Lesson belongs to another branch');
    }

    return lesson;
  }

  async create(dto: CreateLessonDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
    if (!group) throw new BadRequestException('groupId not found');
    if (group.branchId !== branchId) {
      throw new BadRequestException('group belongs to another branch');
    }

    if (dto.teacherUserId) {
      const teacher = await this.prisma.user.findUnique({ where: { id: dto.teacherUserId } });
      if (!teacher) throw new BadRequestException('teacherUserId not found');
      if (teacher.branchId !== branchId) {
        throw new BadRequestException('teacher belongs to another branch');
      }
    }

    return this.prisma.lesson.create({
      data: {
        groupId: dto.groupId,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        topic: dto.topic ?? null,
        location: dto.location ?? null,
        teacherUserId: dto.teacherUserId ?? null,
        isChargeable: dto.isChargeable ?? true,
        lessonNote: dto.lessonNote ?? null,
        homework: dto.homework ?? null,
      } as any,
      include: {
        group: true,
        teacher: {
          select: { id: true, fullName: true, email: true, phone: true, role: true },
        },
      },
    });
  }

  async update(id: string, dto: UpdateLessonDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) {
      throw new BadRequestException('Lesson belongs to another branch');
    }

    if (dto.teacherUserId) {
      const teacher = await this.prisma.user.findUnique({ where: { id: dto.teacherUserId } });
      if (!teacher) throw new BadRequestException('teacherUserId not found');
      if (teacher.branchId !== branchId) {
        throw new BadRequestException('teacher belongs to another branch');
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        ...(dto.startsAt !== undefined ? { startsAt: new Date(dto.startsAt) } : {}),
        ...(dto.endsAt !== undefined ? { endsAt: new Date(dto.endsAt) } : {}),
        ...(dto.topic !== undefined ? { topic: dto.topic } : {}),
        ...(dto.location !== undefined ? { location: dto.location } : {}),
        ...(dto.teacherUserId !== undefined ? { teacherUserId: dto.teacherUserId || null } : {}),
        ...(dto.isChargeable !== undefined ? { isChargeable: dto.isChargeable } : {}),
        ...(dto.status !== undefined ? { status: dto.status as any } : {}),
        ...(dto.lessonNote !== undefined ? { lessonNote: dto.lessonNote } : {}),
        ...(dto.homework !== undefined ? { homework: dto.homework } : {}),
      } as any,
      include: {
        group: true,
        teacher: {
          select: { id: true, fullName: true, email: true, phone: true, role: true },
        },
      },
    });
  }
}
