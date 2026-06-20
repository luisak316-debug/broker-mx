@echo off
setlocal
title broker.mx - GitHub
cd /d "%~dp0"

echo ============================================
echo   Subir a GitHub
echo   Repo: broker.mx
echo ============================================
echo.

where git >nul 2>&1
if errorlevel 1 (
  echo Instala Git: INSTALAR_GIT.bat
  pause
  exit /b 1
)

if not exist ".git" git init

echo [1/3] Archivos (backend\.env NO se sube)...
git add .
git diff --cached --quiet 2>nul
if not errorlevel 1 (
  echo Sin cambios nuevos.
) else (
  git commit -m "broker.mx y admin"
)
echo.

echo [2/3] Conectar repo broker.mx
echo.
echo En GitHub crea repo VACIO llamado:  broker.mx
echo   https://github.com/new
echo.
echo Copia la URL que te da GitHub y pegala aqui.
echo (solo la URL, nada mas)
echo.
set /p REPO_URL="URL del repo: "
if "%REPO_URL%"=="" (
  echo Falta la URL.
  pause
  exit /b 1
)

git branch -M main
git remote remove origin 2>nul
git remote add origin "%REPO_URL%"
echo.

echo [3/3] Subiendo...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Revisa que el repo broker.mx exista en GitHub y vuelve a intentar.
  pause
  exit /b 1
)

echo.
echo Listo. Repo: broker.mx
echo Siguiente: Render.com con el mismo repo.
echo.
pause
