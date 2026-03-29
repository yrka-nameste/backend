# fix_students_service_syntax.ps1
# Запуск: powershell -ExecutionPolicy Bypass -File .\fix_students_service_syntax.ps1

$ErrorActionPreference = "Stop"

$svcPath = "C:\Projects\school-crm\apps\backend\src\modules\students\students.service.ts"
if (!(Test-Path $svcPath)) { throw "Not found: $svcPath" }

# backup
$bak = "$svcPath.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $svcPath $bak -Force
Write-Host "Backup: $bak" -ForegroundColor Cyan

$svc = Get-Content $svcPath -Raw

# 1) Удаляем лишнюю закрывающую скобку класса перед private genPassword
# Было:
#   }
# }
#
#   private genPassword...
$svc = [regex]::Replace(
  $svc,
  "(?s)\r?\n\}\r?\n\}\r?\n(\s*private\s+genPassword\s*\()",
  "`r`n}`r`n`$1",
  1
)

# 2) Фиксим случай, когда замена превратила метод в "private this.makeParentEmail"
$svc = $svc -replace "private\s+this\.makeParentEmail", "private makeParentEmail"

# 3) Восстанавливаем template-string для email (если сломало)
# заменяем "return p@parent.local;" на "return `p${p}@parent.local`;"
$svc = $svc -replace "return\s+p@parent\.local;", "return ``p`${p}@parent.local``;"

# 4) Возвращаем prisma.$transaction если стало prisma.(...)
$svc = $svc -replace "return\s+this\.prisma\.\(\s*async\s*\(tx\)\s*=>", "return this.prisma.`$transaction(async (tx) =>"

# 5) На всякий случай: если где-то появилось "this.makeParentEmail(" в определении, но уже пофиксили выше

Set-Content -Path $svcPath -Value $svc -Encoding UTF8
Write-Host "Patched ✅: $svcPath" -ForegroundColor Green

Write-Host "`n--- Preview (lines 190..240) ---" -ForegroundColor Magenta
(Get-Content $svcPath) | Select-Object -Skip 189 -First 51 | ForEach-Object { $_ }
