@echo off
setlocal enabledelayedexpansion
title Broker MX - Subir a GitHub
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Subir proyecto a GitHub
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Git no esta instalado.
  echo.
  echo Descargalo desde: https://git-scm.com/download/win
  echo Instala, CIERRA esta ventana y vuelve a ejecutar SUBIR_GIT.bat
  echo.
  start "" https://git-scm.com/download/win
  pause
  exit /b 1
)

where gh >nul 2>&1
set HAS_GH=%ERRORLEVEL%

echo [1/4] Inicializando repositorio (si hace falta)...
if not exist ".git" git init
echo.

echo [2/4] Verificando que NO se suban secretos...
findstr /I "TWILIO_AUTH_TOKEN" .gitignore >nul
if errorlevel 1 (
  echo [AVISO] Revisa .gitignore
) else (
  echo       OK: backend\.env esta en .gitignore
)
echo.

echo [3/4] Preparando commit...
git add .
git status --short
echo.

git diff --cached --quiet 2>nul
if not errorlevel 1 (
  echo No hay cambios nuevos para commitear.
) else (
  git commit -m "Broker MX: plataforma web, admin, SMS Twilio y despliegue"
  if errorlevel 1 (
    echo.
    echo Si es el primer commit, configura tu nombre en Git:
    echo   git config user.email "luisak316@gmail.com"
    echo   git config user.name "Luis"
    echo   Luego ejecuta SUBIR_GIT.bat otra vez.
    pause
    exit /b 1
  )
  echo       Commit creado.
)
echo.

echo [4/4] Subir a GitHub...
if %HAS_GH% equ 0 (
  gh auth status >nul 2>&1
  if errorlevel 1 (
    echo Inicia sesion en GitHub CLI...
    gh auth login
  )
  gh repo view >nul 2>&1
  if errorlevel 1 (
    echo Creando repositorio privado broker-mx en tu cuenta...
    gh repo create broker-mx --private --source=. --remote=origin --push
  ) else (
    git push -u origin HEAD
  )
) else (
  echo GitHub CLI no instalado. Opcion manual:
  echo   1. Crea repo en https://github.com/new  nombre: broker-mx
  echo   2. Ejecuta:
  echo      git remote add origin https://github.com/TU_USUARIO/broker-mx.git
  echo      git branch -M main
  echo      git push -u origin main
  echo.
  echo Instala GitHub CLI: https://cli.github.com
)

echo.
echo ============================================
echo   DONDE ESTAN LAS CREDENCIALES (no en Git)
echo ============================================
echo.
echo   Twilio SMS     - backend\.env  (solo tu PC)
echo   Vercel token   - vercel.com -^> Settings -^> Tokens
echo   Render vars    - dashboard.render.com -^> tu servicio -^> Environment
echo   GitHub token   - github.com -^> Settings -^> Developer settings
echo.
echo   Ver archivo: DONDE_CREDENCIALES.txt
echo.
pause
