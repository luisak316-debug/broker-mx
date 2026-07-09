# Restaura la landing Broker.mx al respaldo aprobado (leyenda blanco sólido) del 8 jul 2026.
# Uso: powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-08-leyenda-solid\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$src = Join-Path $PSScriptRoot
$capDest = Join-Path $root 'frontend\src\components\landing\capital-scroll'
$videoDest = Join-Path $root 'frontend\public\video-esfera'
New-Item -ItemType Directory -Force -Path $capDest | Out-Null
New-Item -ItemType Directory -Force -Path $videoDest | Out-Null

Copy-Item (Join-Path $src 'Landing.tsx') (Join-Path $root 'frontend\src\pages\Landing.tsx') -Force
Copy-Item (Join-Path $src 'MarketNewsSection.tsx') (Join-Path $root 'frontend\src\components\landing\MarketNewsSection.tsx') -Force
Copy-Item (Join-Path $src 'marketNews.default.ts') (Join-Path $root 'frontend\src\data\marketNews.default.ts') -Force
Copy-Item (Join-Path $src 'LandingConfianzaScroll.tsx') (Join-Path $root 'frontend\src\components\landing\LandingConfianzaScroll.tsx') -Force
Copy-Item (Join-Path $src 'index.css') (Join-Path $root 'frontend\src\styles\index.css') -Force
Copy-Item (Join-Path $src 'package.json') (Join-Path $root 'frontend\package.json') -Force
Copy-Item (Join-Path $src 'capital-scroll\*') $capDest -Force
Copy-Item (Join-Path $src 'video-esfera\video-esfera.mp4') (Join-Path $videoDest 'video-esfera.mp4') -Force

Write-Host "Landing restaurada desde $src"
