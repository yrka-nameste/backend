# patch_students.ps1
# Run in PowerShell from: C:\Projects\school-crm\apps\backend
# powershell -ExecutionPolicy Bypass -File .\patch_students.ps1

$ErrorActionPreference = "Stop"

$backend = (Get-Location).Path
$srcDir = Join-Path $backend "src\modules"
$studentsDir = Join-Path $srcDir "students"
$authDir = Join-Path $srcDir "auth"

Write-Host "Backend: $backend" -ForegroundColor Green

# ----------------------------
# 0) Ensure deps
# ----------------------------
if (!(Test-Path (Join-Path $backend "package.json"))) {
  throw "package.json not found. Run this script inside apps\backend"
}

Write-Host "Installing deps..." -ForegroundColor Cyan
npm i bcrypt class-validator class-transformer | Out-Host
npm i -D @types/bcrypt | Out-Host

# ----------------------------
# 1) Patch AUTH: include branchId in JWT + me()
# ----------------------------
$authServicePath = Join-Path $authDir "auth.service.ts"
$jwtStrategyPath = Join-Path $authDir "jwt.strategy.ts"

if (!(Test-Path $authServicePath)) { throw "Missing: $authServicePath" }
if (!(Test-Path $jwtStrategyPath)) { throw "Missing: $jwtStrategyPath" }

$authService = @"
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // ✅ include branchId in token
    const payload = { sub: user.id, role: user.role, email: user.email, branchId: user.branchId };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role, branchId: user.branchId },
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, branchId: true, fullName: true, phone: true, isActive: true },
    });
    return user ?? null;
  }
}
"@

Set-Content -Path $authServicePath -Value $authService -Encoding UTF8
Write-Host "Patched: auth.service.ts" -ForegroundColor Green

$jwtStrategy = @"
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtUser } from './auth.types';

type JwtPayload = {
  sub: string;
  role: JwtUser['role'];
  email: string | null;
  branchId?: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET ?? 'super_secret_key',
    });
  }

  validate(payload: JwtPayload): JwtUser {
    // ✅ now includes branchId
    return { userId: payload.sub, role: payload.role, email: payload.email, branchId: payload.branchId ?? null } as any;
  }
}
"@

Set-Content -Path $jwtStrategyPath -Value $jwtStrategy -Encoding UTF8
Write-Host "Patched: jwt.strategy.ts" -ForegroundColor Green

# ----------------------------
# 2) Students DTOs
# ----------------------------
$dtoDir = Join-Path $studentsDir "dto"
New-Item -ItemType Directory -Force -Path $dtoDir | Out-Null

$createDtoPath = Join-Path $dtoDir "create-student.dto.ts"
$updateDtoPath = Join-Path $dtoDir "update-student.dto.ts"
$addParentDtoPath = Join-Path $dtoDir "add-parent.dto.ts"

$createDto = @"
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParentDto {
  @ApiProperty({ example: 'Иванова Мария Сергеевна' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '+37377798654' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'MOTHER' })
  @IsOptional()
  @IsString()
  relationType?: string;

  @ApiPropertyOptional({ example: 'mom@example.com' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateStudentDto {
  @ApiProperty({ example: 'Иванов Иван' })
  @IsString()
  fullName!: string;

  // ✅ branchId НЕ передаем — берём из req.user.branchId

  @ApiPropertyOptional({ example: '+37377798654' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Тирасполь' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'ex.example@ex.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://portfolio.link' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiPropertyOptional({ example: '2018-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startStudyDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: '95015d10-3629-4e97-b23f-4110699c1810' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ example: 'FIXED_DAY', description: 'WINDOW_1_8 | FIXED_DAY' })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiPropertyOptional({ example: 1, description: '1..31 если FIXED_DAY' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  initialLessonBalance?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  initialKiberons?: number;

  @ApiPropertyOptional({ type: [ParentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParentDto)
  parents?: ParentDto[];
}
"@

Set-Content -Path $createDtoPath -Value $createDto -Encoding UTF8
Write-Host "Patched: create-student.dto.ts" -ForegroundColor Green

$updateDto = @"
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Иванов Иван' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: '+37377798654' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'Тирасполь' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'ex.example@ex.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://portfolio.link' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiPropertyOptional({ example: '2018-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startStudyDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'FIXED_DAY' })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;
}
"@

Set-Content -Path $updateDtoPath -Value $updateDto -Encoding UTF8
Write-Host "Patched: update-student.dto.ts" -ForegroundColor Green

$addParentDto = @"
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddParentDto {
  @ApiProperty({ example: 'Иванова Мария Сергеевна' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '+37377798654' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'mom@example.com', description: 'Если не передали — логин будет p<digits>@parent.local' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'MOTHER' })
  @IsOptional()
  @IsString()
  relationType?: string;

  @ApiPropertyOptional({ example: 'P@ssw0rd123', description: 'Если не передали — сгенерируем и вернём один раз' })
  @IsOptional()
  @IsString()
  password?: string;
}
"@

Set-Content -Path $addParentDtoPath -Value $addParentDto -Encoding UTF8
Write-Host "Patched: add-parent.dto.ts" -ForegroundColor Green

# ----------------------------
# 3) Students Controller (JWT guard + fixed constructor property)
# ----------------------------
$studentsControllerPath = Join-Path $studentsDir "students.controller.ts"
if (!(Test-Path $studentsControllerPath)) { throw "Missing: $studentsControllerPath" }

$controller = @"
import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddParentDto } from './dto/add-parent.dto';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  list(@Req() req: any, @Query('branchId') branchId?: string) {
    const effectiveBranchId = branchId ?? req.user?.branchId ?? undefined;
    return this.students.list(effectiveBranchId);
  }

  @Get(':id')
  getCard(@Param('id') id: string) {
    return this.students.getCard(id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: any) {
    return this.students.createWithParents(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto, @Req() req: any) {
    return this.students.update(id, dto, req.user);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.students.archive(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.students.restore(id);
  }

  @Post(':id/parents')
  addParent(@Param('id') id: string, @Body() dto: AddParentDto, @Req() req: any) {
    return this.students.addParent(id, dto, req.user);
  }
}
"@

Set-Content -Path $studentsControllerPath -Value $controller -Encoding UTF8
Write-Host "Patched: students.controller.ts" -ForegroundColor Green

# ----------------------------
# 4) Students Service (clean + createWithParents)
# ----------------------------
$studentsServicePath = Join-Path $studentsDir "students.service.ts"
if (!(Test-Path $studentsServicePath)) { throw "Missing: $studentsServicePath" }

$service = @"
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddParentDto } from './dto/add-parent.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string | null; role?: string; email?: string | null };

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------------------
  // helpers
  // ---------------------------
  private genPassword(len = 10) {
    return crypto.randomBytes(32).toString('base64url').slice(0, len);
  }

  private normPhone(phone: string) {
    return (phone || '').replace(/[^\d+]/g, '');
  }

  private makeParentEmail(phone: string) {
    const p = this.normPhone(phone).replace('+', '');
    return \`p\${p}@parent.local\`;
  }

  private getAuthIds(authUser: AuthUser) {
    const branchId = authUser?.branchId ?? null;
    const userId = (authUser?.userId ?? authUser?.id ?? null) as string | null;
    return { branchId, userId };
  }

  // ---------------------------
  // list / card
  // ---------------------------
  async list(branchId?: string) {
    return this.prisma.student.findMany({
      where: { ...(branchId ? { branchId } : {}) },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: true,
        parentLinks: { include: { parentUser: true } },
        enrollments: { include: { group: true } },
        lessonBalance: true,
      },
    });
  }

  async getCard(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        branch: true,
        lessonBalance: true,
        parentLinks: { include: { parentUser: true } },
        enrollments: {
          orderBy: { createdAt: 'desc' },
          include: { group: true },
        },
        attendances: {
          orderBy: { lesson: { startsAt: 'desc' } },
          take: 300,
          include: { lesson: { include: { group: true } } },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 60,
          include: { payments: { orderBy: { paidAt: 'desc' } } },
        },
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 200,
          include: { invoice: true },
        },
        kiberonTx: { orderBy: { createdAt: 'desc' }, take: 200 },
      },
    });

    if (!student) return null;

    const kiberAgg = await this.prisma.kiberonTransaction.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });
    const kiberBalance = kiberAgg._sum.amount ?? 0;

    const invAgg = await this.prisma.invoice.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });
    const payAgg = await this.prisma.payment.aggregate({
      where: { studentId },
      _sum: { amount: true },
    });

    const totalInvoiced = invAgg._sum.amount ?? 0;
    const totalPaid = payAgg._sum.amount ?? 0;
    const debt = totalInvoiced - totalPaid;

    const attendanceStats = student.attendances.reduce(
      (acc, a) => {
        acc.total++;
        acc[a.status] = (acc[a.status] ?? 0) + 1;
        return acc;
      },
      { total: 0 } as Record<string, number>,
    );

    return {
      student,
      totals: {
        kiberBalance,
        totalInvoiced,
        totalPaid,
        debt,
        availableLessons: student.lessonBalance?.availableLessons ?? 0,
      },
      attendanceStats,
    };
  }

  // ---------------------------
  // createWithParents
  // ---------------------------
  async createWithParents(dto: CreateStudentDto, authUser: AuthUser) {
    const { branchId, userId } = this.getAuthIds(authUser);

    if (!branchId) throw new BadRequestException('User has no branchId (login with branch account)');
    if (!userId) throw new BadRequestException('User id missing in token');

    if (dto.groupId) {
      const g = await this.prisma.group.findUnique({
        where: { id: dto.groupId },
        select: { id: true, branchId: true },
      });
      if (!g) throw new BadRequestException('groupId not found');
      if (g.branchId !== branchId) throw new BadRequestException('groupId belongs to another branch');
    }

    return this.prisma.\$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          branchId,
          fullName: dto.fullName,

          phone: dto.phone ?? null,
          city: dto.city ?? null,
          email: dto.email ?? null,
          portfolio: dto.portfolio ?? null,

          birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
          startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : null,
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,

          paymentMode: dto.paymentMode ?? null,
          paymentDueDay: dto.paymentDueDay ?? null,
        },
        include: { branch: true },
      });

      if (dto.groupId) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            groupId: dto.groupId,
            fromDate: new Date(),
          },
        });
      }

      if ((dto.initialLessonBalance ?? 0) !== 0) {
        await tx.lessonBalance.upsert({
          where: { studentId: student.id },
          create: { studentId: student.id, availableLessons: dto.initialLessonBalance ?? 0 },
          update: { availableLessons: dto.initialLessonBalance ?? 0 },
        });
      }

      if ((dto.initialKiberons ?? 0) !== 0) {
        await tx.kiberonTransaction.create({
          data: {
            studentId: student.id,
            amount: dto.initialKiberons ?? 0,
            reason: 'MANUAL',
            createdByUserId: userId,
          },
        });
      }

      const parentsOut: Array<{ userId: string; fullName: string; phone: string; login: string; password: string }> = [];

      for (const p of dto.parents ?? []) {
        const login =
          (p.email && String(p.email).trim().length > 0)
            ? String(p.email).trim()
            : this.makeParentEmail(String(p.phone));

        const password = this.genPassword(10);
        const passwordHash = await bcrypt.hash(password, 10);

        const parentUser = await tx.user.upsert({
          where: { email: login },
          update: {
            role: 'PARENT',
            branchId,
            fullName: p.fullName ?? undefined,
            phone: p.phone ?? undefined,
            isActive: true,
          },
          create: {
            email: login,
            passwordHash,
            role: 'PARENT',
            branchId,
            fullName: p.fullName,
            phone: p.phone,
            isActive: true,
          },
        });

        await tx.parentStudent.upsert({
          where: { parentUserId_studentId: { parentUserId: parentUser.id, studentId: student.id } },
          update: { relationType: (p as any).relationType ?? null },
          create: { parentUserId: parentUser.id, studentId: student.id, relationType: (p as any).relationType ?? null },
        });

        parentsOut.push({
          userId: parentUser.id,
          fullName: p.fullName,
          phone: p.phone,
          login,
          password,
        });
      }

      return { student, parents: parentsOut };
    });
  }

  // ---------------------------
  // update
  // ---------------------------
  async update(id: string, dto: UpdateStudentDto, authUser?: AuthUser) {
    const { branchId } = this.getAuthIds(authUser ?? {});
    const existing = await this.prisma.student.findUnique({ where: { id }, select: { id: true, branchId: true } });
    if (!existing) throw new NotFoundException('Student not found');
    if (branchId && existing.branchId !== branchId) throw new BadRequestException('Forbidden: another branch');

    return this.prisma.student.update({
      where: { id },
      data: {
        fullName: dto.fullName ?? undefined,
        phone: dto.phone ?? undefined,
        city: dto.city ?? undefined,
        email: dto.email ?? undefined,
        portfolio: dto.portfolio ?? undefined,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        startStudyDate: dto.startStudyDate ? new Date(dto.startStudyDate) : undefined,
        paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : undefined,
        status: dto.status as any,
        paymentMode: dto.paymentMode ?? undefined,
        paymentDueDay: dto.paymentDueDay ?? undefined,
      },
      include: { branch: true },
    });
  }

  // ---------------------------
  // archive/restore
  // ---------------------------
  async archive(id: string) {
    return this.prisma.student.update({ where: { id }, data: { status: 'LEFT' } });
  }

  async restore(id: string) {
    return this.prisma.student.update({ where: { id }, data: { status: 'ACTIVE' } });
  }

  // ---------------------------
  // addParent (existing student)
  // ---------------------------
  async addParent(studentId: string, dto: AddParentDto, authUser?: AuthUser) {
    const { branchId } = this.getAuthIds(authUser ?? {});
    const student = await this.prisma.student.findUnique({ where: { id: studentId }, select: { id: true, branchId: true } });
    if (!student) throw new NotFoundException('Student not found');
    if (branchId && student.branchId !== branchId) throw new BadRequestException('Forbidden: another branch');

    const login = dto.email?.trim() ? dto.email.trim() : this.makeParentEmail(dto.phone);
    const tempPass = dto.password?.trim() || this.genPassword(10);
    const hash = await bcrypt.hash(tempPass, 10);

    const parent = await this.prisma.user.upsert({
      where: { email: login },
      update: {
        role: 'PARENT',
        branchId: student.branchId,
        fullName: dto.fullName ?? undefined,
        phone: dto.phone ?? undefined,
        isActive: true,
      },
      create: {
        email: login,
        passwordHash: hash,
        role: 'PARENT',
        branchId: student.branchId,
        fullName: dto.fullName ?? login,
        phone: dto.phone,
        isActive: true,
      },
    });

    const link = await this.prisma.parentStudent.upsert({
      where: { parentUserId_studentId: { parentUserId: parent.id, studentId } },
      update: { relationType: dto.relationType ?? null },
      create: { parentUserId: parent.id, studentId, relationType: dto.relationType ?? null },
      include: { parentUser: true, student: true },
    });

    return {
      link,
      tempPassword: dto.password ? undefined : tempPass,
    };
  }
}
"@

Set-Content -Path $studentsServicePath -Value $service -Encoding UTF8
Write-Host "Patched: students.service.ts" -ForegroundColor Green

# ----------------------------
# 5) Prisma generate
# ----------------------------
$schema = Join-Path $backend "prisma\schema.prisma"
if (Test-Path $schema) {
  Write-Host "Prisma generate..." -ForegroundColor Cyan
  npx prisma generate --schema "$schema" | Out-Host
} else {
  Write-Host "WARN: schema not found at $schema (skip prisma generate)" -ForegroundColor Yellow
}

Write-Host "`n✅ DONE. Now restart backend: npm run dev" -ForegroundColor Green
Write-Host "`nSwagger auth:" -ForegroundColor Cyan
Write-Host "1) POST /api/auth/login  { email, password }"
Write-Host "2) Copy accessToken"
Write-Host "3) Swagger Authorize:  Bearer <accessToken>"
Write-Host "`nIMPORTANT: POST /api/students теперь НЕ принимает branchId. Он берётся из токена (branch account)." -ForegroundColor Yellow
