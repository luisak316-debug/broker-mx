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
echo   1) Broker.mx  - https://brokermx.vercel.app/
echo   2) admin        - https://brokermx.admin.vercel.app/
echo   API + SMS       - Render.com (render.yaml)
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
echo --- 1) Broker.mx ---
cd frontend
call vercel link --yes --project brokermx 2>nul
call vercel --prod --yes -e VITE_API_URL=%API_URL%
cd ..

echo.
echo --- 2) admin ---
cd admin
call vercel link --yes --project brokermx.admin 2>nul
call vercel --prod --yes -e VITE_API_URL=%API_URL%
cd ..

echo.
echo ============================================
echo   Listo. Tus 2 enlaces Vercel:
echo   1) https://brokermx.vercel.app/
echo   2) https://brokermx.admin.vercel.app/
echo.
echo   En Vercel Dashboard agrega VITE_API_URL=%API_URL%
echo   en AMBOS proyectos si el login no conecta.
echo ============================================
echo.
pause
