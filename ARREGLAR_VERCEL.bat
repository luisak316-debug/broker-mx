@echo off
setlocal EnableExtensions
title Arreglar Vercel - DEPLOYMENT_NOT_FOUND

rem Mantener ventana abierta al hacer doble clic
if /i not "%~1"=="_run" (
  start "ARREGLAR Vercel" cmd /k ""%~f0" _run"
  exit /b 0
)

cd /d "%~dp0"

rem Node y npm en PATH (doble clic no siempre los trae)
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\npm;%PATH%"

echo ============================================
echo   ARREGLAR 404 en Vercel
echo ============================================
echo.
echo El error DEPLOYMENT_NOT_FOUND significa:
echo   Los proyectos existen pero NO hay despliegue publicado.
echo.
echo Vamos a publicar ahora:
echo   1) https://brokermx.vercel.app/
echo   2) admin (Vercel asigna URL automatica, ej. brokermxadmin-....vercel.app)
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] No se encontro Node.js.
  echo Instala Node desde https://nodejs.org y vuelve a ejecutar.
  goto :fin
)

echo Node: 
node -v
echo.

echo --- Paso 1: Sesion Vercel ---
echo.
echo Si antes entro la cuenta equivocada, ejecuta LOGIN_VERCEL.bat primero.
echo.
call npx --yes vercel whoami >nul 2>&1
if errorlevel 1 (
  echo No hay sesion. Abre el enlace con TU cuenta Vercel:
  echo   https://vercel.com/oauth/device
  echo.
  call npx --yes vercel login
  if errorlevel 1 (
    echo Fallo el login. Ejecuta LOGIN_VERCEL.bat
    goto :fin
  )
) else (
  echo Sesion actual:
  call npx --yes vercel whoami
  echo.
  echo Es la cuenta correcta? Si NO, cierra y ejecuta LOGIN_VERCEL.bat
  echo.
  pause
)

echo.
echo --- Paso 2: URL de la API (opcional por ahora) ---
echo Si aun no tienes Render, deja vacio y Enter.
echo La pagina cargara; login/SMS funcionara cuando agregues la API.
echo.
set "API_URL="
set /p API_URL="URL API Render (opcional): "

echo.
echo --- Paso 3: Publicar Broker.mx ---
pushd "%~dp0frontend"
if not "%API_URL%"=="" (
  call npx --yes vercel link --yes --project brokermx 2>nul
  call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
) else (
  call npx --yes vercel link --yes --project brokermx 2>nul
  call npx --yes vercel --prod --yes
)
if errorlevel 1 (
  echo.
  echo Error publicando Broker.mx.
  popd
  goto :fin
)
popd

echo.
echo --- Paso 4: Publicar admin ---
pushd "%~dp0admin"
if not "%API_URL%"=="" (
  call npx --yes vercel link --yes --project brokermx.admin 2>nul
  call npx --yes vercel --prod --yes -e VITE_API_URL=%API_URL%
) else (
  call npx --yes vercel link --yes --project brokermx.admin 2>nul
  call npx --yes vercel --prod --yes
)
if errorlevel 1 (
  echo.
  echo Error publicando admin.
  popd
  goto :fin
)
popd

echo.
echo ============================================
echo   LISTO - Prueba en el navegador:
echo   1) https://brokermx.vercel.app/
echo.
echo   2) admin - copia la URL "Production" que salio arriba.
echo      La correcta ahora es:
echo      https://brokermxadmin-khaki.vercel.app/
echo.
echo   NOTA: brokermx.admin.vercel.app NO es una URL de Vercel.
echo.
if not "%API_URL%"=="" (
  echo   API configurada: %API_URL%
) else (
  echo   Sin API aun: en vercel.com agrega VITE_API_URL en ambos proyectos.
)
echo ============================================

:fin
echo.
pause
