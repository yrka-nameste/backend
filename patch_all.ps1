# patch_all.ps1
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-FileUtf8($path, $content) {
  $dir = Split-Path $path -Parent
  if (!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  Set-Content -Path $path -Value $content -Encoding utf8
  Write-Host "WROTE: $path"
}

function Backup-File($path) {
  if (Test-Path $path) {
    $stamp = (Get-Date).ToString("yyyyMMdd_HHmmss")
    Copy-Item $path "$path.bak_$stamp" -Force
    Write-Host "BACKUP: $path.bak_$stamp"
  }
}

function Require-InFile($path, $needle) {
  $txt = Get-Content $path -Raw
  if ($txt -notmatch [regex]::Escape($needle)) {
    throw "Expected marker not found in $path : $needle"
  }
}

$root = (Get-Location).Path
if (!(Test-Path (Join-Path $root "package.json"))) {
  throw "Run inside apps/backend (where package.json exists). Current: $root"
}

Write-Host "`n=== PATCH_ALL START ===`n"

# deps
npm i class-validator class-transformer | Out-Null

# -----------------------------
# 1) CreateGroupDto: no branchId in request
# -----------------------------
$createGroupDtoPath = Join-Path $root "src\modules\groups\dto\create-group.dto.ts"
Backup-File $createGroupDtoPath
Write-FileUtf8 $createGroupDtoPath @'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Группа A (сб 16:00)' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '14-16' })
  @IsOptional()
  @IsString()
  ageCategory?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;
}
'@

# -----------------------------
# 2) GroupsController: ensure GET /groups/:id exists and uses JWT
# -----------------------------
$groupsControllerPath = Join-Path $root "src\modules\groups\groups.controller.ts"
Backup-File $groupsControllerPath
Write-FileUtf8 $groupsControllerPath @'
import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateScheduleRuleDto } from './dto/create-schedule-rule.dto';
import { GenerateLessonsDto } from './dto/generate-lessons.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: any) {
    return this.groupsService.create(dto, req.user);
  }

  @Post(':id/update')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: any) {
    return this.groupsService.update(id, dto, req.user);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.archive(id, req.user);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.restore(id, req.user);
  }

  @Post(':id/teacher')
  assignTeacher(@Param('id') id: string, @Body() dto: AssignTeacherDto, @Req() req: any) {
    return this.groupsService.assignTeacher(id, dto, req.user);
  }

  @Get(':id/students')
  getStudents(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getStudents(id, req.user);
  }

  @Post(':id/students')
  addStudent(@Param('id') id: string, @Body() dto: AddStudentDto, @Req() req: any) {
    return this.groupsService.addStudent(id, dto, req.user);
  }

  @Delete(':id/students/:studentId')
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @Req() req: any) {
    return this.groupsService.removeStudent(id, studentId, req.user);
  }

  @Post(':id/schedule-rule')
  setScheduleRule(@Param('id') id: string, @Body() dto: CreateScheduleRuleDto, @Req() req: any) {
    return this.groupsService.setScheduleRule(id, dto, req.user);
  }

  @Get(':id/lessons')
  getLessons(
    @Param('id') id: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.groupsService.getLessons(id, from, to, req.user);
  }

  @Post(':id/generate-lessons')
  generateLessons(@Param('id') id: string, @Body() dto: GenerateLessonsDto, @Req() req: any) {
    return this.groupsService.generateLessons(id, dto, req.user);
  }
}
'@

# -----------------------------
# 3) Payments: DTO + controller + service (JWT, receiptUrl, addLessons)
# -----------------------------
$createPaymentDtoPath = Join-Path $root "src\modules\payments\dto\create-payment.dto.ts"
Backup-File $createPaymentDtoPath
Write-FileUtf8 $createPaymentDtoPath @'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'cash/card/transfer' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ example: 'Комментарий' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'Ссылка на фото чека (позже сделаем upload)' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ description: 'Сколько уроков добавить к балансу после оплаты', example: 4 })
  @IsOptional()
  @IsInt()
  addLessons?: number;
}
'@

$paymentsControllerPath = Join-Path $root "src\modules\payments\payments.controller.ts"
Backup-File $paymentsControllerPath
Write-FileUtf8 $paymentsControllerPath @'
import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto, @Req() req: any) {
    return this.paymentsService.create(dto, req.user);
  }

  @Get('student/:studentId')
  getStudentPayments(@Param('studentId') studentId: string, @Req() req: any) {
    return this.paymentsService.getStudentPayments(studentId, req.user);
  }
}
'@

$paymentsServicePath = Join-Path $root "src\modules\payments\payments.service.ts"
Backup-File $paymentsServicePath
Write-FileUtf8 $paymentsServicePath @'
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async create(dto: CreatePaymentDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const createdByUserId = this.getUserId(user);

    const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    return this.prisma.\$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          studentId: dto.studentId,
          amount: dto.amount,
          method: dto.method ?? 'cash',
          comment: dto.comment ?? null,
          receiptUrl: dto.receiptUrl ?? null,
          createdByUserId: createdByUserId ?? undefined,
        } as any,
      });

      const add = dto.addLessons ?? 0;
      if (add !== 0) {
        await tx.lessonBalance.upsert({
          where: { studentId: dto.studentId },
          create: { studentId: dto.studentId, availableLessons: add },
          update: { availableLessons: { increment: add } },
        });
      }

      return { payment, addedLessons: add };
    });
  }

  async getStudentPayments(studentId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const st = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    return this.prisma.payment.findMany({
      where: { studentId },
      orderBy: { paidAt: 'desc' },
    });
  }
}
'@

# -----------------------------
# 4) Attendance (lesson attendance endpoints)
# -----------------------------
$attendanceControllerPath = Join-Path $root "src\modules\attendance\attendance.controller.ts"
Backup-File $attendanceControllerPath
Write-FileUtf8 $attendanceControllerPath @'
import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('lessons')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get(':lessonId/attendance')
  getLessonAttendance(@Param('lessonId') lessonId: string, @Req() req: any) {
    return this.attendance.getLessonAttendance(lessonId, req.user);
  }

  @Put(':lessonId/attendance')
  setAttendance(@Param('lessonId') lessonId: string, @Body() dto: MarkAttendanceDto, @Req() req: any) {
    return this.attendance.setAttendance(lessonId, dto, req.user);
  }
}
'@

$markAttendanceDtoPath = Join-Path $root "src\modules\attendance\dto\mark-attendance.dto.ts"
Backup-File $markAttendanceDtoPath
Write-FileUtf8 $markAttendanceDtoPath @'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] })
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status!: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

  @ApiPropertyOptional({ default: false, description: 'Добавить 5 бонусных киберонов (если PRESENT)' })
  @IsOptional()
  @IsBoolean()
  addBonus5?: boolean;
}
'@

$attendanceServicePath = Join-Path $root "src\modules\attendance\attendance.service.ts"
Backup-File $attendanceServicePath
Write-FileUtf8 $attendanceServicePath @'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

type AuthUser = { userId?: string; id?: string; branchId?: string; role?: string };

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private getBranchId(user: AuthUser): string {
    const branchId = user?.branchId;
    if (!branchId) throw new BadRequestException('User has no branchId');
    return branchId;
  }

  private getUserId(user: AuthUser): string | null {
    return (user?.userId ?? user?.id ?? null) as string | null;
  }

  async getLessonAttendance(lessonId: string, user: AuthUser) {
    const branchId = this.getBranchId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) throw new BadRequestException('Lesson belongs to another branch');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { groupId: lesson.groupId, toDate: null },
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    });

    const marks = await this.prisma.attendance.findMany({ where: { lessonId } });
    const map = new Map(marks.map((m) => [m.studentId, m]));

    return enrollments.map((e) => {
      const m = map.get(e.studentId);
      return {
        studentId: e.studentId,
        student: e.student,
        status: m?.status ?? null,
        kiberonsAwarded: m?.kiberonsAwarded ?? 0,
      };
    });
  }

  async setAttendance(lessonId: string, dto: MarkAttendanceDto, user: AuthUser) {
    const branchId = this.getBranchId(user);
    const markedByUserId = this.getUserId(user);

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { group: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.group.branchId !== branchId) throw new BadRequestException('Lesson belongs to another branch');

    const st = await this.prisma.student.findUnique({ where: { id: dto.studentId } });
    if (!st) throw new BadRequestException('studentId not found');
    if (st.branchId !== branchId) throw new BadRequestException('student belongs to another branch');

    const enr = await this.prisma.enrollment.findFirst({
      where: { groupId: lesson.groupId, studentId: dto.studentId, toDate: null },
    });
    if (!enr) throw new BadRequestException('student is not enrolled in this group');

    const prev = await this.prisma.attendance.findUnique({
      where: { lessonId_studentId: { lessonId, studentId: dto.studentId } },
    });

    const becamePresent = dto.status === 'PRESENT' -and ($null -eq $prev -or $prev.status -ne 'PRESENT');
    const addBonus = dto.status === 'PRESENT' -and ($dto.addBonus5 -eq $true);

    return this.prisma.\$transaction(async (tx) => {
      const kAward = dto.status === 'PRESENT' ? (10 + (addBonus ? 5 : 0)) : 0;

      const mark = await tx.attendance.upsert({
        where: { lessonId_studentId: { lessonId, studentId: dto.studentId } },
        update: {
          status: dto.status as any,
          markedByUserId: markedByUserId ?? undefined,
          kiberonsAwarded: kAward,
        },
        create: {
          lessonId,
          studentId: dto.studentId,
          status: dto.status as any,
          markedByUserId: markedByUserId ?? undefined,
          kiberonsAwarded: kAward,
        },
      });

      if (dto.status === 'PRESENT') {
        const hasAttendTx = await tx.kiberonTransaction.findFirst({
          where: { studentId: dto.studentId, lessonId, reason: 'ATTENDANCE' as any },
        });
        if (!hasAttendTx) {
          await tx.kiberonTransaction.create({
            data: {
              studentId: dto.studentId,
              lessonId,
              amount: 10,
              reason: 'ATTENDANCE' as any,
              createdByUserId: markedByUserId ?? undefined,
            },
          });
        }

        if (addBonus) {
          const hasBonusTx = await tx.kiberonTransaction.findFirst({
            where: { studentId: dto.studentId, lessonId, reason: 'BONUS' as any },
          });
          if (!hasBonusTx) {
            await tx.kiberonTransaction.create({
              data: {
                studentId: dto.studentId,
                lessonId,
                amount: 5,
                reason: 'BONUS' as any,
                createdByUserId: markedByUserId ?? undefined,
              },
            });
          }
        }
      }

      if (becamePresent && (lesson.isChargeable ?? true)) {
        await tx.lessonBalance.upsert({
          where: { studentId: dto.studentId },
          create: { studentId: dto.studentId, availableLessons: 0 },
          update: {},
        });

        const bal = await tx.lessonBalance.findUnique({ where: { studentId: dto.studentId } });
        if ((bal?.availableLessons ?? 0) > 0) {
          await tx.lessonBalance.update({
            where: { studentId: dto.studentId },
            data: { availableLessons: { decrement: 1 } },
          });
        }
      }

      return { ok: true, mark };
    });
  }
}
'@

$attendanceModulePath = Join-Path $root "src\modules\attendance\attendance.module.ts"
Backup-File $attendanceModulePath
Write-FileUtf8 $attendanceModulePath @'
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
})
export class AttendanceModule {}
'@

# -----------------------------
# 5) Prisma schema additions: Payment.receiptUrl, Lesson.topic + teacherUserId
# -----------------------------
$schemaPath = Join-Path $root "prisma\schema.prisma"
Backup-File $schemaPath
$schema = Get-Content $schemaPath -Raw

# add receiptUrl in Payment (after comment)
if ($schema -notmatch "receiptUrl\s+String\?") {
  Require-InFile $schemaPath "comment   String?"
  $schema = $schema.Replace("comment   String?","comment   String?`n  receiptUrl String?")
}

# add topic/teacherUserId in Lesson (after endsAt)
if ($schema -notmatch "topic\s+String\?") {
  Require-InFile $schemaPath "endsAt       DateTime"
  $schema = $schema.Replace("endsAt       DateTime","endsAt       DateTime`n  topic        String?`n  teacherUserId String?`n  teacher      User? @relation(fields: [teacherUserId], references: [id])")
}

Write-FileUtf8 $schemaPath $schema

# -----------------------------
# 6) Ensure AppModule imports AttendanceModule (если нет)
# -----------------------------
$appModulePath = Join-Path $root "src\app.module.ts"
Backup-File $appModulePath
$appModule = Get-Content $appModulePath -Raw

if ($appModule -notmatch "AttendanceModule") {
  # crude but safe: insert import + add in imports array
  $appModule = $appModule.Replace("import { Module } from '@nestjs/common';", "import { Module } from '@nestjs/common';`nimport { AttendanceModule } from './modules/attendance/attendance.module';")
  $appModule = $appModule -replace "imports:\s*\[", "imports: [`n    AttendanceModule,"
  Write-FileUtf8 $appModulePath $appModule
}

Write-Host "`nRunning Prisma migrate..."
npx prisma migrate dev --name "patch_all_mvp"

Write-Host "`nRunning Prisma generate..."
npx prisma generate

Write-Host "`n=== PATCH_ALL DONE ==="
Write-Host "Restart backend: npm run dev"
