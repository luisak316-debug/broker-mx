# Restaura landing — registro portal, términos y auth (9 jul 2026).
# Uso: powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-registro-portal\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\frontend\src\App.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\frontend\src\App.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$tag = 'backup/landing-ok-2026-07-09-registro-portal'
Write-Host "Restaurando desde tag $tag ..."

git -C $root checkout $tag -- `
  frontend/src/pages/Register.tsx `
  frontend/src/pages/LoginClient.tsx `
  frontend/src/pages/ForgotPassword.tsx `
  frontend/src/components/auth `
  frontend/src/data/termsContent.ts `
  frontend/src/styles/portal-theme.css `
  frontend/src/styles/index.css `
  frontend/src/api/client.ts `
  frontend/src/auth/ClientAuthContext.tsx `
  frontend/src/components/common/PasswordField.tsx `
  backend/src/controllers/auth.controller.ts `
  docs/BACKUP-LANDING.md

Write-Host "Restaurado. Revisa con: git status"
