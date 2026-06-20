@echo off
setlocal EnableExtensions
title Conectar API a Vercel

if /i not "%~1"=="_run" (
  start "API Vercel" cmd /k ""%~f0" _run"
  exit /b 0
)

cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\npm;%PATH%"

echo ============================================
echo   CONECTAR API - arregla Error 405
echo ============================================
echo.
echo El Error 405 pasa porque Vercel solo muestra la pagina.
echo Registro, SMS y login necesitan el BACKEND conectado.
echo.
echo Pon la URL de tu API (sin /api al final):
echo   Ejemplo Render: https://broker-mx-api.onrender.com
echo   Ejemplo tunel:  https://TU-TUNEL.trycloudflare.com
echo.

set "API_URL="
set /p API_URL="URL de la API: "
if "%API_URL%"=="" (
  echo [ERROR] Debes pegar la URL de la API.
  goto :fin
)

echo.
echo --- Publicando Broker.mx con API ---
pushd "%~dp0frontend"
call npx --yes vercel link --yes --project brokermx 2>nul
call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
if errorlevel 1 (
  echo Error en Broker.mx
  popd
  goto :fin
)
popd

echo.
echo --- Publicando admin con API ---
pushd "%~dp0admin"
call npx --yes vercel link --yes --project brokermx.admin 2>nul
call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
if errorlevel 1 (
  echo Error en admin
  popd
  goto :fin
)
popd

echo.
echo ============================================
echo   LISTO - Error 405 corregido
echo   API: %API_URL%
echo.
echo   Prueba registro y admin en:
echo   https://brokermx.vercel.app/
echo   https://brokermxadmin-khaki.vercel.app/
echo ============================================

:fin
echo.
pause
