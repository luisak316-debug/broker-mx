@echo off
setlocal EnableExtensions
title INVERMAX - Configurar llamadas web (asesores)
cd /d "%~dp0"

echo ============================================
echo   LLAMADAS WEB - Portal Asesores
echo ============================================
echo.
echo El proveedor SIP ya tiene WebRTC en:
echo   wss://rdx.narayana.im:8089/ws
echo.
echo Solo necesitas la MISMA contrasena SIP que MicroSIP
echo (usuario 21011). NO la pegues en chats.
echo.
echo Se abrira backend\.env — agrega o actualiza:
echo.
echo   SIP_DOMAIN=rdx.narayana.im
echo   SIP_USERNAME=21011
echo   SIP_PASSWORD=tu_contrasena_sip_aqui
echo   SIP_WSS_URL=wss://rdx.narayana.im:8089/ws
echo   SIP_BRIDGE_ENABLED=false
echo   PUBLIC_API_URL=https://broker-mx-api.onrender.com
echo.
echo Luego en Render (broker-mx-api ^> Environment) las mismas
echo variables SIP_* y PUBLIC_API_URL.
echo.
pause

if not exist "backend\.env" (
  echo PORT=4000>backend\.env
  echo JWT_SECRET=dev-secret>>backend\.env
)

findstr /B /C:"SIP_DOMAIN=" "backend\.env" >nul 2>&1 || echo SIP_DOMAIN=rdx.narayana.im>>backend\.env
findstr /B /C:"SIP_USERNAME=" "backend\.env" >nul 2>&1 || echo SIP_USERNAME=21011>>backend\.env
findstr /B /C:"SIP_WSS_URL=" "backend\.env" >nul 2>&1 || echo SIP_WSS_URL=wss://rdx.narayana.im:8089/ws>>backend\.env
findstr /B /C:"SIP_BRIDGE_ENABLED=" "backend\.env" >nul 2>&1 || echo SIP_BRIDGE_ENABLED=false>>backend\.env
findstr /B /C:"PUBLIC_API_URL=" "backend\.env" >nul 2>&1 || echo PUBLIC_API_URL=https://broker-mx-api.onrender.com>>backend\.env

notepad "%~dp0backend\.env"

echo.
echo Cuando guardes .env con SIP_PASSWORD, ejecuta:
echo   DESPLEGAR_LLAMADAS.bat
echo.
pause
