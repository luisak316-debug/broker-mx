@echo off
setlocal EnableExtensions
title INVERMAX - Pegar contrasena SIP
cd /d "%~dp0"

echo ============================================
echo   Contrasena SIP (linea 21011)
echo ============================================
echo.
echo Escribe la contrasena y pulsa ENTER.
echo (No se muestra mientras escribes en PowerShell)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0PEGAR_SIP_PASSWORD.ps1"

echo.
pause
