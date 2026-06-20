@echo off
setlocal enabledelayedexpansion
title Broker MX - Dashboard de Inversion
cd /d "%~dp0"

set "LOG=%~dp0_inicio.log"
echo ============================================ > "%LOG%"
echo   BROKER MX - Log de inicio %date% %time% >> "%LOG%"
echo ============================================ >> "%LOG%"

echo ============================================
echo   BROKER MX - Iniciando entorno completo
echo ============================================
echo.
echo (Si algo falla, se guarda un registro en: _inicio.log)
echo.

echo --- Buscando Node.js ---
where node >> "%LOG%" 2>&1
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] No se encontro Node.js en este equipo.
  echo.
  echo Node.js es necesario para ejecutar la aplicacion.
  echo Descargalo (version LTS^) desde:  https://nodejs.org/es
  echo Instala, CIERRA esta ventana y vuelve a dar doble clic en INICIAR.bat
  echo.
  echo No se encontro Node.js >> "%LOG%"
  start "" https://nodejs.org/es
  echo Presiona una tecla para salir...
  pause >nul
  exit /b 1
)

for /f "delims=" %%v in ('node -v 2^>nul') do set "NODEV=%%v"
for /f "delims=" %%v in ('npm -v 2^>nul') do set "NPMV=%%v"
echo Node: !NODEV!   npm: !NPMV!
echo Node: !NODEV!   npm: !NPMV! >> "%LOG%"
echo.

if not exist "node_modules" goto :install
if not exist "frontend\node_modules" goto :install
if not exist "admin\node_modules" goto :install
echo [1/2] Dependencias ya instaladas.
goto :run

:install
echo [1/2] Instalando dependencias (puede tardar unos minutos la primera vez)...
echo       Espera a que termine; veras mucho texto, es normal.
echo.
call npm install >> "%LOG%" 2>&1
if errorlevel 1 (
  echo.
  echo [ERROR] Fallo la instalacion de dependencias.
  echo Abre el archivo _inicio.log para ver el detalle.
  echo.
  start "" notepad "%LOG%"
  echo Presiona una tecla para salir...
  pause >nul
  exit /b 1
)
echo Instalacion completada.
echo.

:run
echo [2/2] Levantando servidores...
echo.
findstr /B /C:"TWILIO_ACCOUNT_SID=$" "backend\.env" >nul 2>&1
if not errorlevel 1 (
  echo   [AVISO] SMS no configurado. Ejecuta CONFIGURAR_SMS.bat
  echo.
)
echo   API:           http://localhost:4000/api
echo   App clientes:  http://localhost:5173
echo   Backoffice:    http://localhost:5174   (admin@brokermx.com / Admin1234)
echo.
echo   Para DETENER todo: cierra esta ventana o presiona Ctrl+C
echo.

timeout /t 6 /nobreak >nul
start "" http://localhost:5173
start "" http://localhost:5174

call npm run dev

echo.
echo La aplicacion se detuvo. Presiona una tecla para salir...
pause >nul
endlocal
