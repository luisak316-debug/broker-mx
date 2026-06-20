@echo off
setlocal enabledelayedexpansion
title broker.mx
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Publicar en Internet
echo ============================================
echo.
echo Esto compila la web y la expone con un enlace
echo publico HTTPS para que cualquiera pueda entrar:
echo   broker.mx:  https://TU-ENLACE/
echo   admin:      https://TU-ENLACE/admin847/
echo.
echo Requisitos: Node.js, Twilio configurado en backend\.env
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Instala Node.js desde https://nodejs.org
  pause
  exit /b 1
)

findstr /B /C:"TWILIO_ACCOUNT_SID=$" "backend\.env" >nul 2>&1
if not errorlevel 1 (
  echo [AVISO] SMS no configurado. Ejecuta CONFIGURAR_SMS.bat primero.
  echo.
)

echo [1/3] Compilando broker.mx...
call npm run build:prod
if errorlevel 1 (
  echo [ERROR] Fallo la compilacion.
  pause
  exit /b 1
)
echo       Listo.
echo.

echo [2/3] Iniciando servidor Broker MX (puerto 4000)...
start "broker.mx" cmd /k "cd /d "%~dp0" && set NODE_ENV=production&& npm run start:prod"
echo       Esperando que el servidor arranque...
timeout /t 8 /nobreak >nul
echo.

echo [3/3] Abriendo tunel publico HTTPS (Cloudflare)...
echo.
echo ============================================
echo   CUANDO APAREZCA EL ENLACE, COPIALO:
echo.
echo   broker.mx:  ENLACE/
echo   admin:      ENLACE/admin847/
echo   Login admin:   admin@brokermx.com / Admin1234
echo ============================================
echo.
echo Deja esta ventana ABIERTA mientras compartes el enlace.
echo Para detener: Ctrl+C aqui y cierra "Broker MX - Servidor"
echo.

npx --yes cloudflared tunnel --url http://localhost:4000

echo.
echo Tunel cerrado.
pause
