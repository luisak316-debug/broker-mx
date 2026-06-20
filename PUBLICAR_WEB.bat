@echo off
setlocal
title broker.mx - solo publicar web
cd /d "%~dp0"

echo ============================================
echo   PUBLICAR WEB (sin tocar GitHub)
echo ============================================
echo.
echo Tu codigo YA esta en GitHub.
echo   https://github.com/luisak316-debug/broker-mx
echo.
echo Este script NO pide login. Solo abre la web publica.
echo.

call npm run build:prod
if errorlevel 1 pause & exit /b 1

start "broker.mx" cmd /k "cd /d "%~dp0" && set NODE_ENV=production&& npm run start:prod"
timeout /t 8 /nobreak >nul

echo.
echo   broker.mx:  TU-ENLACE/
echo   admin:      TU-ENLACE/admin847/
echo.
echo Copia el https que salga abajo. Deja esta ventana abierta.
echo.
npx --yes cloudflared tunnel --url http://localhost:4000
pause
