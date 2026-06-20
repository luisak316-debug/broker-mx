@echo off
setlocal
title Reiniciar API broker.mx
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%PATH%"

echo Reiniciando servidor API (puerto 4000)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4000 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

call npm run build --workspace backend
start "broker.mx API" cmd /k "cd /d "%~dp0" && set NODE_ENV=production&& npm run start:prod"

echo.
echo Listo. Cierra sesion en admin y vuelve a entrar.
pause
