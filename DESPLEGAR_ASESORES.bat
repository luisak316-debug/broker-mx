@echo off
setlocal
title INVERMAX LATAM - Asesores (Vercel)
cd /d "%~dp0advisors"

echo ============================================
echo   INVERMAX LATAM - Desplegar Portal Asesores
echo ============================================
echo.
echo URL produccion: https://brokermxadvisors.vercel.app/
echo Proyecto Vercel: brokermx.advisors
echo.

set API_URL=https://broker-mx-api.onrender.com

call npx --yes vercel link --yes --project brokermx.advisors
if errorlevel 1 (
  echo Fallo al vincular proyecto. Creando brokermx.advisors...
  call npx --yes vercel link --yes
)

call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
if errorlevel 1 (
  echo Fallo el despliegue.
  pause
  exit /b 1
)

echo.
echo Listo: https://brokermxadvisors.vercel.app/
echo Tambien en Render: https://broker-mx-api.onrender.com/asesores847/
echo.
pause
