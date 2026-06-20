@echo off
setlocal
title Broker MX - Conectar con GitHub
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Ya tienes repo local
echo   Conectar y subir a GitHub
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no encontrado en PATH.
  pause
  exit /b 1
)

if not exist ".git" (
  echo [AVISO] No hay carpeta .git en:
  echo   %~dp0
  echo.
  echo Si creaste broker-mx en otra ruta, abre ESA carpeta en Git
  echo o ejecuta aqui:  git init
  echo.
  pause
  exit /b 1
)

echo Carpeta del repo: %~dp0
echo.
git status -sb
echo.

echo [1/3] Agregando archivos (backend\.env NO se sube)...
git add .
git status --short
echo.

echo [2/3] Commit...
git diff --cached --quiet 2>nul
if errorlevel 1 (
  git commit -m "Broker MX: web clientes, admin, SMS Twilio y despliegue"
) else (
  echo Sin cambios nuevos para commit.
)
echo.

echo [3/3] Subir a GitHub...
git remote -v 2>nul | findstr origin >nul
if errorlevel 1 (
  echo.
  set /p GH_USER="Tu usuario de GitHub (ej. luisak316): "
  echo.
  echo Conectando con https://github.com/%GH_USER%/broker-mx.git
  git branch -M main
  git remote add origin https://github.com/%GH_USER%/broker-mx.git
  echo.
  echo ANTES del push: crea el repo vacio en GitHub:
  echo   https://github.com/new  -  nombre: broker-mx  -  SIN README
  echo.
  pause
  git push -u origin main
) else (
  git push -u origin HEAD
)

if errorlevel 1 (
  echo.
  echo Si fallo el push:
  echo   - Crea el repo broker-mx en github.com/new
  echo   - O revisa usuario/token de GitHub
  pause
  exit /b 1
)

echo.
echo ============================================
echo   Listo en GitHub: broker-mx
echo.
echo   Siguiente paso: Render.com
echo   New - Blueprint - conecta el repo broker-mx
echo   Agrega variables Twilio en Environment
echo ============================================
echo.
pause
