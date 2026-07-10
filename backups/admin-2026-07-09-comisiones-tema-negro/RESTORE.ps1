# Restaura admin + supervisores — tema negro, comisiones, bonos (9 jul 2026).
# Uso: powershell -ExecutionPolicy Bypass -File backups\admin-2026-07-09-comisiones-tema-negro\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\admin\src\App.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\admin\src\App.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$tag = 'backup/admin-ok-2026-07-09-comisiones-tema-negro'
Write-Host "Restaurando desde tag $tag ..."

git -C $root checkout $tag -- `
  admin `
  supervisors `
  backend/src/controllers/admin `
  backend/src/lib/bonusCalc.ts `
  backend/src/lib/commissionCalc.ts `
  backend/src/routes/admin.ts `
  backend/src/services/portfolio.service.ts `
  docs/BACKUP-ADMIN.md

Write-Host "Restaurado. Revisa con: git status"
