import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEducationProgramDto } from './dto/create-education-program.dto';
import { UpdateEducationProgramDto } from './dto/update-education-program.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class EducationProgramsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  async list(user: AuthUser) {
    const branchId = this.getBranchId(user);

    return this.prisma.educationProgram.findMany({
      where: { branchId },
      include: { group: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(id: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const item = await this.prisma.educationProgram.findUnique({
      where: { id },
      include: { group: true },
    });

    if (!item) throw new NotFoundException('EducationProgram not found');
    if (item.branchId !== branchId) {
      throw new BadRequestException('EducationProgram belongs to another branch');
    }

    return item;
  }

  async create(dto: CreateEducationProgramDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    if (dto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new BadRequestException('groupId not found');
      if (group.branchId !== branchId) {
        throw new BadRequestException('group belongs to another branch');
      }
    }

    return this.prisma.educationProgram.create({
      data: {
        branchId,
        name: dto.name,
        description: dto.description ?? null,
        groupId: dto.groupId ?? null,
        lessonsCount: dto.lessonsCount ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { group: true },
    });
  }

  async update(id: string, dto: UpdateEducationProgramDto, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const item = await this.prisma.educationProgram.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('EducationProgram not found');
    if (item.branchId !== branchId) {
      throw new BadRequestException('EducationProgram belongs to another branch');
    }

    if (dto.groupId) {
      const group = await this.prisma.group.findUnique({ where: { id: dto.groupId } });
      if (!group) throw new BadRequestException('groupId not found');
      if (group.branchId !== branchId) {
        throw new BadRequestException('group belongs to another branch');
      }
    }

    return this.prisma.educationProgram.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.groupId !== undefined ? { groupId: dto.groupId || null } : {}),
        ...(dto.lessonsCount !== undefined ? { lessonsCount: dto.lessonsCount } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: { group: true },
    });
  }
}
