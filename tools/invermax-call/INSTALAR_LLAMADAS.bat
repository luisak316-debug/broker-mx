@echo off
setlocal
title INVERMAX - Vincular Llamar con MicroSIP
cd /d "%~dp0"

echo ============================================
echo   INVERMAX - Llamadas desde el navegador
echo ============================================
echo.
echo   Una sola vez por laptop de asesor.
echo   Despues, el boton Llamar marca directo en MicroSIP.
echo.

if not exist "..\MicroSIP\MicroSIP.exe" (
  echo [ERROR] Falta MicroSIP en tools\MicroSIP\MicroSIP.exe
  echo Copia la carpeta MicroSIP del proyecto a esta laptop.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0register-invermax-call.ps1"
if errorlevel 1 (
  echo Fallo el registro del protocolo.
  pause
  exit /b 1
)

echo.
echo Prueba: abre MicroSIP, luego en Asesores pulsa Llamar.
echo.
pause
