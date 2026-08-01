# Restaura portales INVERMAX — historial asesores, marca, favicon, admin sin logo duplicado (1 ago 2026).
# Uso: powershell -ExecutionPolicy Bypass -File backups\portales-2026-08-01\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\advisors\src\App.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\advisors\src\App.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$tag = 'backup/portales-ok-2026-08-01'
Write-Host "Restaurando desde tag $tag ..."

git -C $root checkout $tag -- `
  advisors `
  admin `
  supervisors `
  frontend/index.html `
  frontend/public/favicon.svg `
  frontend/public/favicon.ico `
  frontend/src/components/brand `
  frontend/src/components/layout/Sidebar.tsx `
  frontend/src/components/layout/Topbar.tsx `
  frontend/src/styles/index.css `
  shared/brand `
  backend/src/controllers/admin/advisorContacts.controller.ts `
  backend/src/repositories/advisorContact.repository.ts `
  backend/src/routes/advisor.ts `
  DESPLEGAR_ASESORES.bat `
  docs/BACKUP-PORTALES.md `
  docs/PROJECT-BRAIN.md

Write-Host "Restaurado. Revisa con: git -C `"$root`" status"
