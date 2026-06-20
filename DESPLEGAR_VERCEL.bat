@echo off
setlocal
title Broker MX - Desplegar en Vercel
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Desplegar en Vercel
echo ============================================
echo.
echo Tu cuenta Vercel (inicia sesion con tu correo).
echo.
echo IMPORTANTE - Arquitectura:
echo   1) API + SMS (backend)  - Render.com  (render.yaml)
echo   2) Web clientes         - Vercel      (este script)
echo   3) Web admin            - Vercel      (este script)
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
set /p API_URL="URL de tu API en Render (ej. https://broker-mx.onrender.com): "
if "%API_URL%"=="" (
  echo Necesitas la URL del backend en Render primero.
  pause
  exit /b 1
)

echo.
echo --- Paso 2: Desplegar web CLIENTES (Broker MX) ---
cd frontend
call vercel --prod --yes --name broker-mx -e VITE_API_URL=%API_URL%
cd ..

echo.
echo --- Paso 3: Desplegar web ADMIN (Broker MX Backoffice) ---
cd admin
call vercel --prod --yes --name broker-mx-admin -e VITE_API_URL=%API_URL%
cd ..

echo.
echo ============================================
echo   Listo. Guarda las URLs que mostro Vercel.
echo   Clientes: broker-mx.vercel.app (o similar)
echo   Admin:    broker-mx-admin.vercel.app
echo ============================================
echo.
pause
