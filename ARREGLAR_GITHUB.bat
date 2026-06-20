@echo off
setlocal
title Arreglar GitHub (deja de pedir login)
cd /d "%~dp0"

echo ============================================
echo   ARREGLAR LOGIN GITHUB - UNA SOLA VEZ
echo ============================================
echo.
echo El navegador no guarda la sesion. Usaremos TOKEN.
echo Asi deja de salir la ventana una y otra vez.
echo.
echo PASO 1: Se abrira GitHub para crear un token.
echo   - Note: broker-mx-pc
echo   - Expiration: 90 days (o No expiration)
echo   - Marca SOLO: repo
echo   - Generate token - COPIA el token (ghp_...)
echo.
pause
start "" https://github.com/settings/tokens/new?scopes=repo&description=broker-mx-pc

echo.
echo PASO 2: Pega el token aqui (no se muestra al escribir):
set /p GHTOKEN="Token ghp_...: "

if "%GHTOKEN%"=="" (
  echo No pegaste token.
  pause
  exit /b 1
)

echo.
echo Guardando credencial en Windows...
(echo protocol=https& echo host=github.com& echo username=luisak316-debug& echo password=%GHTOKEN%) | git credential approve

echo.
echo Subiendo codigo...
git add .
git diff --cached --quiet 2>nul || git commit -m "broker.mx y admin"
git remote remove origin 2>nul
git remote add origin https://github.com/luisak316-debug/broker-mx.git
git branch -M main
git push -u origin main

if errorlevel 1 (
  echo Push fallo. Verifica que el token tenga permiso repo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   LISTO. Ya no deberia pedir login otra vez.
echo   https://github.com/luisak316-debug/broker-mx
echo ============================================
pause
