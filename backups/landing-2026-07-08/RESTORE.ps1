# Restaura la landing Broker.mx al respaldo del 8 jul 2026.
# Uso: powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$src = Join-Path $PSScriptRoot

Copy-Item (Join-Path $src 'Landing.tsx') (Join-Path $root 'frontend\src\pages\Landing.tsx') -Force
Copy-Item (Join-Path $src 'MarketNewsSection.tsx') (Join-Path $root 'frontend\src\components\landing\MarketNewsSection.tsx') -Force
Copy-Item (Join-Path $src 'marketNews.default.ts') (Join-Path $root 'frontend\src\data\marketNews.default.ts') -Force

Write-Host "Archivos restaurados desde $src"
Write-Host ""
Write-Host "Siguiente paso (verificar y publicar):"
Write-Host "  cd `"$root\frontend`""
Write-Host "  npx tsc --noEmit"
Write-Host "  npx vercel --prod --yes -e VITE_API_URL=https://broker-mx-api.onrender.com"
