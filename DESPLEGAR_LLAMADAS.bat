@echo off
setlocal EnableExtensions
title INVERMAX - Desplegar llamadas web asesores
cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\npm;%PATH%"

echo ============================================
echo   LLAMADAS WEB - Despliegue completo
echo ============================================
echo.

where node >nul 2>&1 || (echo Instala Node.js & goto :fin)
where git >nul 2>&1 || (echo Instala Git & goto :fin)

if not exist "backend\.env" (
  echo Ejecuta primero CONFIGURAR_LLAMADAS.bat
  goto :fin
)

findstr /B /C:"SIP_PASSWORD=" "backend\.env" | findstr /V "=$" | findstr /V "tu_contrasena" >nul 2>&1
if errorlevel 1 (
  echo [AVISO] Falta SIP_PASSWORD en backend\.env
  echo Ejecuta CONFIGURAR_LLAMADAS.bat
  goto :fin
)

echo --- Compilar backend y portal asesores ---
call npm --workspace backend run build
if errorlevel 1 goto :fin
call npm --workspace advisors run build
if errorlevel 1 goto :fin
echo OK compilacion.
echo.

echo --- Subir a GitHub (Render auto-deploy) ---
set /p PUSH="Subir cambios a GitHub? (S/N): "
if /i "%PUSH%"=="S" (
  git add backend advisors render.yaml CONFIGURAR_LLAMADAS.bat DESPLEGAR_LLAMADAS.bat DONDE_CREDENCIALES.txt tools\sip-bridge
  git commit -m "Telefonia web asesores: WSS proveedor + softphone navegador" 2>nul
  git push origin main
)

echo.
echo --- Variables SIP en Render ---
echo.
echo En https://dashboard.render.com  servicio broker-mx-api ^> Environment:
echo   Copia desde backend\.env:
echo     SIP_DOMAIN, SIP_USERNAME, SIP_PASSWORD
echo     SIP_WSS_URL=wss://rdx.narayana.im:8089/ws
echo     SIP_BRIDGE_ENABLED=false
echo     PUBLIC_API_URL=https://broker-mx-api.onrender.com
echo.
start "" https://dashboard.render.com
timeout /t 2 /nobreak >nul

echo --- Desplegar portal asesores en Vercel ---
call "%~dp0DESPLEGAR_ASESORES.bat"

echo.
echo ============================================
echo   LISTO
echo.
echo   1. Pega SIP_PASSWORD en Render y espera deploy
echo   2. Abre https://brokermxadvisors.vercel.app/
echo   3. Login asesor ^> Mis contactos ^> Llamar
echo   4. Permite micrófono — ventana INVERMAX flotante
echo   (Sin MicroSIP visible)
echo ============================================

:fin
echo.
pause
