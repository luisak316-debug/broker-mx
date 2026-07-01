@echo off
setlocal
title broker.mx - Supervisores (Vercel)
cd /d "%~dp0supervisors"

echo ============================================
echo   BROKER MX - Desplegar Supervisores
echo ============================================
echo.
echo URL produccion: https://brokermxsupervisors.vercel.app/
echo Proyecto Vercel: brokermx.supervisors
echo.

set API_URL=https://broker-mx-api.onrender.com

call npx --yes vercel link --yes --project brokermx.supervisors
if errorlevel 1 (
  echo Fallo al vincular proyecto.
  pause
  exit /b 1
)

call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
if errorlevel 1 (
  echo Fallo el despliegue.
  pause
  exit /b 1
)

echo.
echo Listo: https://brokermxsupervisors.vercel.app/
echo Recarga con Ctrl+F5 si no ves cambios.
echo.
pause
