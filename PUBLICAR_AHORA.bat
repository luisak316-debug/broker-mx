@echo off
setlocal
title PUBLICAR broker.mx
cd /d "%~dp0"

echo ============================================
echo   PUBLICAR broker.mx + admin  AHORA
echo ============================================
echo.

where git >nul 2>&1 || (echo Instala Git: INSTALAR_GIT.bat & pause & exit /b 1)

echo [1/4] Compilando...
call npm run build:prod
if errorlevel 1 (echo Error compilando. & pause & exit /b 1)

echo.
echo [2/4] Subiendo a GitHub (repo: broker.mx)...
git add .
git diff --cached --quiet 2>nul || git commit -m "broker.mx y admin"
where gh >nul 2>&1
if not errorlevel 1 (
  gh auth status >nul 2>&1
  if errorlevel 1 (
    echo Inicia sesion GitHub (se abre navegador)...
    gh auth login -w -p https
  )
  gh repo view >nul 2>&1
  if errorlevel 1 (
    gh repo create broker.mx --private --source=. --remote=origin --push
  ) else (
    git push -u origin main
  )
) else (
  echo GitHub CLI no listo. Ejecuta CONECTAR_GITHUB.bat despues.
)

echo.
echo [3/4] Arrancando servidor...
start "broker.mx servidor" cmd /k "cd /d "%~dp0" && set NODE_ENV=production&& npm run start:prod"
timeout /t 8 /nobreak >nul

echo.
echo [4/4] Enlace publico HTTPS...
echo.
echo   broker.mx:  TU-ENLACE/
echo   admin:      TU-ENLACE/admin/
echo.
echo COPIA el enlace https que aparezca abajo.
echo Deja esta ventana ABIERTA.
echo.
npx --yes cloudflared tunnel --url http://localhost:4000

pause
