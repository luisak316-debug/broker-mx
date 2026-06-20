@echo off
setlocal
title broker.mx - Vercel
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Desplegar en Vercel
echo ============================================
echo.
echo Tu cuenta Vercel (inicia sesion con tu correo).
echo.
echo IMPORTANTE - Arquitectura:
echo   1) API + SMS (backend)  - Render.com  (render.yaml)
echo   broker.mx
echo   admin
echo.
echo Vercel NO puede correr el backend con SMS y WebSocket.
echo Primero despliega la API en Render, luego pega aqui la URL.
echo.

where vercel >nul 2>&1
if errorlevel 1 (
  echo Instalando Vercel CLI...
  call npm install -g vercel
)

echo.
echo --- Paso 1: Iniciar sesion en Vercel ---
echo Se abrira el navegador. Inicia sesion con tu cuenta Vercel.
echo.
call vercel login
if errorlevel 1 (
  echo Fallo el login.
  pause
  exit /b 1
)

echo.
set /p API_URL="URL de la API en Render: "
if "%API_URL%"=="" (
  echo Necesitas la URL del backend en Render primero.
  pause
  exit /b 1
)

echo.
echo --- broker.mx ---
cd frontend
call vercel --prod --yes --name broker-dot-mx -e VITE_API_URL=%API_URL%
cd ..

echo.
echo --- admin ---
cd admin
call vercel --prod --yes --name admin -e VITE_API_URL=%API_URL%
cd ..

echo.
echo ============================================
echo   Listo. Guarda las URLs que mostro Vercel.
echo   broker.mx
echo   admin
echo ============================================
echo.
pause
