import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role: role as any } : {},
    });
  }

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        role: dto.role,
        branchId: dto.branchId,
        fullName: dto.fullName,
        phone: dto.phone,
      },
    });
  }

  async getTeachers(user: any) {
  const branchId = user?.branchId;
  if (!branchId) throw new BadRequestException('User has no branchId');

  return this.prisma.user.findMany({
    where: {
      branchId,
      role: 'TEACHER' as any,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
    },
    orderBy: { fullName: 'asc' },
  });
}

}
