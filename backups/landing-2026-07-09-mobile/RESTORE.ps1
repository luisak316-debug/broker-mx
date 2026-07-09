# Restaura la landing Broker.mx al respaldo aprobado (fixes móvil) del 9 jul 2026.
# Uso: powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-mobile\RESTORE.ps1

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
$hooksDest = Join-Path $root 'frontend\src\hooks'
$utilsDest = Join-Path $root 'frontend\src\utils'
New-Item -ItemType Directory -Force -Path $capDest, $hooksDest, $utilsDest | Out-Null

Copy-Item (Join-Path $src 'Landing.tsx') (Join-Path $root 'frontend\src\pages\Landing.tsx') -Force
Copy-Item (Join-Path $src 'index.css') (Join-Path $root 'frontend\src\styles\index.css') -Force
Copy-Item (Join-Path $src 'LandingTraderScroll.tsx') (Join-Path $root 'frontend\src\components\landing\LandingTraderScroll.tsx') -Force
Copy-Item (Join-Path $src 'LandingConfianzaScroll.tsx') (Join-Path $root 'frontend\src\components\landing\LandingConfianzaScroll.tsx') -Force
Copy-Item (Join-Path $src 'LandingScrollNarrative.tsx') (Join-Path $root 'frontend\src\components\landing\LandingScrollNarrative.tsx') -Force
Copy-Item (Join-Path $src 'LandingSectionHeader.tsx') (Join-Path $root 'frontend\src\components\landing\LandingSectionHeader.tsx') -Force
Copy-Item (Join-Path $src 'MarketCategoryModal.tsx') (Join-Path $root 'frontend\src\components\landing\MarketCategoryModal.tsx') -Force
Copy-Item (Join-Path $src 'MarketNewsSection.tsx') (Join-Path $root 'frontend\src\components\landing\MarketNewsSection.tsx') -Force
Copy-Item (Join-Path $src 'CelebrationLink.tsx') (Join-Path $root 'frontend\src\components\landing\CelebrationLink.tsx') -Force
Copy-Item (Join-Path $src 'GoldenHighlight.tsx') (Join-Path $root 'frontend\src\components\landing\GoldenHighlight.tsx') -Force
Copy-Item (Join-Path $src 'SimulatorButton.tsx') (Join-Path $root 'frontend\src\components\landing\SimulatorButton.tsx') -Force
Copy-Item (Join-Path $src 'TestimonialsCarousel.tsx') (Join-Path $root 'frontend\src\components\landing\TestimonialsCarousel.tsx') -Force
Copy-Item (Join-Path $src 'landingMarketScroll.ts') (Join-Path $root 'frontend\src\data\landingMarketScroll.ts') -Force
Copy-Item (Join-Path $src 'celebrationBurst.ts') (Join-Path $root 'frontend\src\utils\celebrationBurst.ts') -Force
Copy-Item (Join-Path $src 'package.json') (Join-Path $root 'frontend\package.json') -Force
Copy-Item (Join-Path $src 'hooks\useScrollFrame.ts') (Join-Path $hooksDest 'useScrollFrame.ts') -Force
Copy-Item (Join-Path $src 'capital-scroll\*') $capDest -Force

Write-Host "Landing restaurada desde $src"
