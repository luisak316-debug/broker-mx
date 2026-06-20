@echo off
setlocal
title Broker MX - Instalar Git
cd /d "%~dp0"

echo ============================================
echo   INSTALAR GIT (necesario para GitHub)
echo ============================================
echo.
echo El error "git no se reconoce" significa que Git
echo no esta instalado o no esta en el PATH de Windows.
echo.

where git >nul 2>&1
if not errorlevel 1 (
  echo Git ya esta instalado:
  git --version
  echo.
  echo Ejecuta CONECTAR_GITHUB.bat para subir broker-mx.
  pause
  exit /b 0
)

echo Intentando instalar con winget (Windows)...
where winget >nul 2>&1
if not errorlevel 1 (
  echo.
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  if not errorlevel 1 (
    echo.
    echo Git instalado. CIERRA esta ventana CMD y abre una NUEVA.
    echo Luego ejecuta:  CONECTAR_GITHUB.bat
    pause
    exit /b 0
  )
)

echo.
echo Instalacion manual:
echo   1. Se abrira https://git-scm.com/download/win
echo   2. Descarga y ejecuta el instalador
echo   3. IMPORTANTE: en el paso PATH elige:
echo      "Git from the command line and also from 3rd-party software"
echo   4. Siguiente - Siguiente - Instalar
echo   5. CIERRA esta ventana CMD y abre una NUEVA
echo   6. Ejecuta CONECTAR_GITHUB.bat
echo.
start "" https://git-scm.com/download/win
pause
