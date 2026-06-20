@echo off
setlocal
title Broker MX - Probar SMS
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Instala Node.js primero.
  pause
  exit /b 1
)

echo ============================================
echo   PROBAR SMS - Twilio
echo ============================================
echo.
echo Escribe solo 10 digitos (ej. 5618606409). Tambien acepta +52...
echo.
set /p CEL="Celular de prueba: "
echo.
echo Enviando SMS de prueba...
echo.

cd backend
call npm run sms:verify -- %CEL%
set ERR=%ERRORLEVEL%
cd ..

if %ERR% neq 0 (
  echo.
  echo Revisa backend\.env y CONFIGURAR_SMS.bat
  pause
  exit /b 1
)

echo Si recibiste el SMS, ya puedes usar /registro en la app.
echo Reinicia INICIAR.bat si el servidor ya estaba abierto.
echo.
pause
