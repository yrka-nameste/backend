# fix_students_service_helpers.ps1
# Запуск: powershell -ExecutionPolicy Bypass -File .\fix_students_service_helpers.ps1

$ErrorActionPreference = "Stop"

$svcPath = "C:\Projects\school-crm\apps\backend\src\modules\students\students.service.ts"
if (!(Test-Path $svcPath)) { throw "Not found: $svcPath" }

# backup
$bak = "$svcPath.bak_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Copy-Item $svcPath $bak -Force
Write-Host "Backup: $bak" -ForegroundColor Cyan

$svc = Get-Content $svcPath -Raw

# 1) Replace helper functions block (function genPassword...makeParentEmail...) with private methods
$pattern = "(?s)\r?\nfunction\s+genPassword\([\s\S]*?\}\r?\n\r?\nfunction\s+normPhone\([\s\S]*?\}\r?\n\r?\nfunction\s+makeParentEmail\([\s\S]*?\}\r?\n"
if ($svc -match $pattern) {

$replacement = @"

  private genPassword(len = 10) {
    return crypto.randomBytes(32).toString('base64url').slice(0, len);
  }

  private normPhone(phone: string) {
    return (phone || '').replace(/[^\d+]/g, '');
  }

  private makeParentEmail(phone: string) {
    const p = this.normPhone(phone).replace('+', '');
    return `p${p}@parent.local`;
  }

"@

  $svc = [regex]::Replace($svc, $pattern, $replacement, 1)
  Write-Host "Helper functions -> private methods ✅" -ForegroundColor Green
} else {
  Write-Host "Helper functions block not found (maybe already fixed) ⚠️" -ForegroundColor Yellow
}

# 2) Fix calls inside createWithParents (and anywhere else in class)
#    (делаем точечно, чтобы не зацепить определения)
$svc = $svc -replace "const\s+password\s*=\s*genPassword\(", "const password = this.genPassword("
$svc = $svc -replace ":\s*genPassword\(", ": this.genPassword("
$svc = $svc -replace "=\s*genPassword\(", "= this.genPassword("
$svc = $svc -replace "makeParentEmail\(", "this.makeParentEmail("

Set-Content -Path $svcPath -Value $svc -Encoding UTF8
Write-Host "Patched: $svcPath ✅" -ForegroundColor Green

# Show around the area for quick visual check
Write-Host "`n--- Preview (lines 190..260) ---" -ForegroundColor Magenta
(Get-Content $svcPath) | Select-Object -Skip 189 -First 71 | ForEach-Object { $_ }
