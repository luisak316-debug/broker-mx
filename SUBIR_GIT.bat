@echo off
setlocal
title broker.mx - GitHub
cd /d "%~dp0"

echo ============================================
echo   Subir a GitHub  (repo: broker.mx)
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Ejecuta INSTALAR_GIT.bat primero.
  pause
  exit /b 1
)

if not exist ".git" git init

git add .
git diff --cached --quiet 2>nul
if not errorlevel 1 (
  echo Sin cambios para commit.
) else (
  git commit -m "broker.mx y admin"
)

where gh >nul 2>&1
if not errorlevel 1 (
  gh auth status >nul 2>&1
  if errorlevel 1 gh auth login
  gh repo view >nul 2>&1
  if errorlevel 1 (
    gh repo create broker.mx --private --source=. --remote=origin --push
  ) else (
    git push -u origin main
  )
) else (
  echo Sin GitHub CLI. Usa CONECTAR_GITHUB.bat
)

echo.
echo Credenciales: DONDE_CREDENCIALES.txt
pause
