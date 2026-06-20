@echo off
setlocal EnableExtensions
title Login Vercel - cuenta correcta

if /i not "%~1"=="_run" (
  start "Login Vercel" cmd /k ""%~f0" _run"
  exit /b 0
)

cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\npm;%PATH%"

echo ============================================
echo   LOGIN VERCEL - cuenta correcta
echo ============================================
echo.
echo IMPORTANTE:
echo   1) Cierra sesion de la cuenta equivocada
echo   2) Abre el enlace en el navegador con TU cuenta Vercel
echo   3) Si usas varios perfiles, abre ventana de incognito
echo      o el navegador donde tienes la cuenta buena.
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Instala Node.js desde https://nodejs.org
  goto :fin
)

echo Cerrando sesion anterior...
call npx --yes vercel logout
echo.

echo Abre este enlace con TU cuenta Vercel:
echo   https://vercel.com/oauth/device
echo.
echo El codigo aparece abajo. Copialo y pegalo en esa pagina.
echo.
call npx --yes vercel login
if errorlevel 1 (
  echo.
  echo Fallo el login. Ejecuta de nuevo este archivo.
  goto :fin
)

echo.
echo Cuenta conectada:
call npx --yes vercel whoami
echo.
echo Listo. Ahora ejecuta ARREGLAR_VERCEL.bat

:fin
echo.
pause
