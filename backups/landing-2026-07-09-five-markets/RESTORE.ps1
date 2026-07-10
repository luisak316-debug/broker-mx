# Restaura la landing Broker.mx — 5 categorías + Investing.com + simuladores USD (9 jul 2026).
# Uso: powershell -ExecutionPolicy Bypass -File backups\landing-2026-07-09-five-markets\RESTORE.ps1

$ErrorActionPreference = 'Stop'
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
  $root = Split-Path $PSScriptRoot -Parent
  if (-not (Test-Path "$root\frontend\src\pages\Landing.tsx")) {
    Write-Error "No se encontró el proyecto TRADING. Ejecuta desde la raíz del repo."
  }
}

$src = $PSScriptRoot
$landing = Join-Path $root 'frontend\src\components\landing'
$data = Join-Path $root 'frontend\src\data'
$hooks = Join-Path $root 'frontend\src\hooks'
$lib = Join-Path $root 'frontend\src\lib'
New-Item -ItemType Directory -Force -Path $landing, $data, $hooks, $lib | Out-Null

Copy-Item (Join-Path $src 'Landing.tsx') (Join-Path $root 'frontend\src\pages\Landing.tsx') -Force
Copy-Item (Join-Path $src 'index.css') (Join-Path $root 'frontend\src\styles\index.css') -Force
Copy-Item (Join-Path $src 'FeaturedDailyNews.tsx') (Join-Path $landing 'FeaturedDailyNews.tsx') -Force
Copy-Item (Join-Path $src 'MarketNewsSection.tsx') (Join-Path $landing 'MarketNewsSection.tsx') -Force
Copy-Item (Join-Path $src 'MarketCategoryModal.tsx') (Join-Path $landing 'MarketCategoryModal.tsx') -Force
Copy-Item (Join-Path $src 'LandingTraderScroll.tsx') (Join-Path $landing 'LandingTraderScroll.tsx') -Force
Copy-Item (Join-Path $src 'LandingMarketsShowcase.tsx') (Join-Path $landing 'LandingMarketsShowcase.tsx') -Force
Copy-Item (Join-Path $src 'MarketCategoryCard.tsx') (Join-Path $landing 'MarketCategoryCard.tsx') -Force
Copy-Item (Join-Path $src 'MarketCategoryIcon.tsx') (Join-Path $landing 'MarketCategoryIcon.tsx') -Force
Copy-Item (Join-Path $src 'data\marketCategories.ts') (Join-Path $data 'marketCategories.ts') -Force
Copy-Item (Join-Path $src 'data\landingMarketScroll.ts') (Join-Path $data 'landingMarketScroll.ts') -Force
Copy-Item (Join-Path $src 'data\landingInstruments.ts') (Join-Path $data 'landingInstruments.ts') -Force
Copy-Item (Join-Path $src 'hooks\useDailyMarketNews.ts') (Join-Path $hooks 'useDailyMarketNews.ts') -Force
Copy-Item (Join-Path $src 'format.ts') (Join-Path $lib 'format.ts') -Force

Write-Host "Landing restaurada desde $src"
