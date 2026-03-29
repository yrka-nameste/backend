# patch_students_parents.ps1
# Запуск: powershell -ExecutionPolicy Bypass -File .\patch_students_parents.ps1

$ErrorActionPreference = "Stop"

$backend = "C:\Projects\school-crm\apps\backend"
$dtoPath = Join-Path $backend "src\modules\students\dto\create-student.dto.ts"
$svcPath = Join-Path $backend "src\modules\students\students.service.ts"
$ctlPath = Join-Path $backend "src\modules\students\students.controller.ts"

function Backup-File($path) {
  if (!(Test-Path $path)) { throw "File not found: $path" }
  $bak = "$path.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
  Copy-Item $path $bak -Force
  Write-Host "Backup created: $bak" -ForegroundColor Cyan
}

function Ensure-Npm-Package($pkg) {
  $pkgJson = Join-Path $backend "package.json"
  $json = Get-Content $pkgJson -Raw | ConvertFrom-Json
  $deps = @{}
  if ($json.dependencies) { $json.dependencies.psobject.properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
  if ($json.devDependencies) { $json.devDependencies.psobject.properties | ForEach-Object { $deps[$_.Name] = $_.Value } }
  return $deps.ContainsKey($pkg)
}

Write-Host "`n== PATCH START ==" -ForegroundColor Green
Write-Host "Backend: $backend" -ForegroundColor Green

# --- backups ---
Backup-File $dtoPath
Backup-File $svcPath
Backup-File $ctlPath

# --- ensure deps (bcrypt, class-validator, class-transformer) ---
Push-Location $backend
try {
  if (-not (Ensure-Npm-Package "bcrypt")) {
    Write-Host "Installing bcrypt..." -ForegroundColor Yellow
    npm i bcrypt | Out-Host
    npm i -D @types/bcrypt | Out-Host
  }
  if (-not (Ensure-Npm-Package "class-validator")) {
    Write-Host "Installing class-validator..." -ForegroundColor Yellow
    npm i class-validator | Out-Host
  }
  if (-not (Ensure-Npm-Package "class-transformer")) {
    Write-Host "Installing class-transformer..." -ForegroundColor Yellow
    npm i class-transformer | Out-Host
  }
} finally {
  Pop-Location
}

# -----------------------------
# 1) PATCH DTO: branchId optional
# -----------------------------
$dto = Get-Content $dtoPath -Raw

# Если branchId вообще нет — вставим после fullName
if ($dto -notmatch "\bbranchId\b") {
  $dto = [regex]::Replace(
    $dto,
    "(@IsString\(\)\s*fullName:\s*string;\s*)",
@"
`$1

  // branchId НЕ обязателен — берем из req.user.branchId
  @IsOptional()
  @IsString()
  branchId?: string;
"@,
    1
  )
} else {
  # Если branchId есть, убедимся что он optional и имеет ?
  # 1) добавим ? в тип
  $dto = [regex]::Replace($dto, "branchId:\s*string\s*;", "branchId?: string;", 1)

  # 2) добавим @IsOptional() перед декоратором branchId (если его нет рядом)
  if ($dto -notmatch "(@IsOptional\(\)\s*)@IsString\(\)\s*branchId\?\:") {
    $dto = [regex]::Replace(
      $dto,
      "@IsString\(\)\s*branchId\?\:\s*string;",
@"
@IsOptional()
  @IsString() branchId?: string;
"@,
      1
    )
  }
}

# гарантируем импорт IsOptional
if ($dto -notmatch "\bIsOptional\b") {
  $dto = [regex]::Replace(
    $dto,
    "from 'class-validator';",
    "from 'class-validator';",
    1
  )
  # добавим IsOptional в import { ... }
  $dto = [regex]::Replace(
    $dto,
    "import\s*\{\s*([^}]*)\s*\}\s*from 'class-validator';",
    { param($m)
      $list = $m.Groups[1].Value
      if ($list -match "\bIsOptional\b") { return $m.Value }
      return "import { $list, IsOptional } from 'class-validator';"
    },
    1
  )
}

Set-Content -Path $dtoPath -Value $dto -Encoding UTF8
Write-Host "DTO patched ✅ ($dtoPath)" -ForegroundColor Green

# -----------------------------
# 2) PATCH CONTROLLER: POST -> createWithParents(dto, req.user)
# -----------------------------
$ctl = Get-Content $ctlPath -Raw

# ensure Req import
$ctl = [regex]::Replace(
  $ctl,
  "import\s*\{\s*([^}]*)\s*\}\s*from '@nestjs/common';",
  { param($m)
    $list = $m.Groups[1].Value
    if ($list -match "\bReq\b") { return $m.Value }
    return "import { $list, Req } from '@nestjs/common';"
  },
  1
)

# ensure CreateStudentDto import exists
if ($ctl -notmatch "create-student\.dto") {
  $ctl = [regex]::Replace(
    $ctl,
    "(import[\s\S]*?\r?\n)",
    "`$1import { CreateStudentDto } from './dto/create-student.dto';`r`n",
    1
  )
}

# replace/create POST handler
if ($ctl -match "@Post\(\)[\s\S]*?create\(") {
  $ctl = [regex]::Replace(
    $ctl,
    "@Post\(\)[\s\S]*?create\([\s\S]*?\)\s*\{[\s\S]*?\}",
@"
@Post()
create(@Body() dto: CreateStudentDto, @Req() req: any) {
  return this.studentsService.createWithParents(dto, req.user);
}
"@,
    1
  )
} else {
  # append method near end of class (before last })
  $ctl = [regex]::Replace(
    $ctl,
    "\}\s*$",
@"

  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: any) {
    return this.studentsService.createWithParents(dto, req.user);
  }
}
"@,
    1
  )
}

Set-Content -Path $ctlPath -Value $ctl -Encoding UTF8
Write-Host "Controller patched ✅ ($ctlPath)" -ForegroundColor Green

# -----------------------------
# 3) PATCH SERVICE: add createWithParents
# -----------------------------
$svc = Get-Content $svcPath -Raw

# ensure imports crypto + bcrypt
if ($svc -notmatch "from 'crypto'") {
  $svc = [regex]::Replace($svc, "(import[\s\S]*?\r?\n)", "`$1import * as crypto from 'crypto';`r`n", 1)
}
if ($svc -notmatch "from 'bcrypt'") {
  $svc = [regex]::Replace($svc, "(import[\s\S]*?\r?\n)", "`$1import * as bcrypt from 'bcrypt';`r`n", 1)
}
# ensure CreateStudentDto import exists
if ($svc -notmatch "create-student\.dto") {
  $svc = [regex]::Replace(
    $svc,
    "(import[\s\S]*?\r?\n)",
    "`$1import { CreateStudentDto } from './dto/create-student.dto';`r`n",
    1
  )
}

# helper functions once (place near bottom, outside class is ok, but better inside file end)
if ($svc -notmatch "function genPassword") {
  $svc = $svc + @"

function genPassword(len = 10) {
  return crypto.randomBytes(32).toString('base64url').slice(0, len);
}

function normPhone(phone: string) {
  return (phone || '').replace(/[^\d+]/g, '');
}

function makeParentEmail(phone: string) {
  const p = normPhone(phone).replace('+', '');
  return `p${p}@parent.local`;
}
"@
}

# add createWithParents if not exists
if ($svc -notmatch "createWithParents\(") {
  # вставим перед последней "}" класса сервиса — найдем последнюю закрывающую скобку файла не идеально,
  # поэтому проще: вставим перед "}" последнего класса StudentsService
  $svc = [regex]::Replace(
    $svc,
    "\}\s*$",
@"

  /**
   * Создание ученика + branchId из authUser + создание родителей (role=PARENT)
   * Возвращает логин/пароль родителей ОДИН РАЗ.
   */
  async createWithParents(dto: CreateStudentDto, authUser: { id: string; branchId: string }) {
    if (!authUser?.branchId) {
      throw new Error('User has no branchId');
    }

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          branchId: authUser.branchId,
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
      });

      // привязка к группе (если передали)
      if (dto.groupId) {
        await tx.enrollment.create({
          data: {
            studentId: student.id,
            groupId: dto.groupId,
            fromDate: new Date(),
          },
        });
      }

      // баланс уроков (если передали)
      if ((dto.initialLessonBalance ?? 0) !== 0) {
        await tx.lessonBalance.upsert({
          where: { studentId: student.id },
          create: { studentId: student.id, availableLessons: dto.initialLessonBalance ?? 0 },
          update: { availableLessons: dto.initialLessonBalance ?? 0 },
        });
      }

      // kiberons (если передали)
      if ((dto.initialKiberons ?? 0) !== 0) {
        await tx.kiberonTransaction.create({
          data: {
            studentId: student.id,
            amount: dto.initialKiberons ?? 0,
            reason: 'MANUAL',
            createdByUserId: authUser.id,
          },
        });
      }

      const parentsOut: Array<{ userId: string; fullName: string; phone: string; login: string; password: string }> = [];

      for (const p of (dto.parents ?? [])) {
        const password = genPassword(10);
        const passwordHash = await bcrypt.hash(password, 10);

        const login =
          (p.email && String(p.email).trim().length > 0)
            ? String(p.email).trim()
            : makeParentEmail(String(p.phone));

        const parentUser = await tx.user.create({
          data: {
            email: login,
            passwordHash,
            role: 'PARENT',
            branchId: authUser.branchId,
            fullName: p.fullName,
            phone: p.phone,
            isActive: true,
          },
        });

        await tx.parentStudent.create({
          data: {
            parentUserId: parentUser.id,
            studentId: student.id,
            relationType: p.relationType ?? null,
          },
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
}
"@,
    1
  )
}

Set-Content -Path $svcPath -Value $svc -Encoding UTF8
Write-Host "Service patched ✅ ($svcPath)" -ForegroundColor Green

Write-Host "`n== PATCH DONE ✅ ==" -ForegroundColor Green
Write-Host "Now restart backend (npm run start:dev) and retry POST /students." -ForegroundColor Yellow
