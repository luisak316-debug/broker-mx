@echo off
title Broker MX - Configurar Android (2 apps)
cd /d "%~dp0"

echo ============================================
echo   BROKER MX - Apps Android
echo   1) Broker MX
echo   2) Admin
echo ============================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Instala Node.js desde https://nodejs.org/es
  pause
  exit /b 1
)

echo [1/4] Instalando dependencias...
call npm install
if errorlevel 1 goto :error

echo.
echo [2/4] App CLIENTES - generando proyecto Android...
cd frontend
if not exist ".env.android" (
  copy /Y ".env.android.example" ".env.android" >nul
  echo       Creado frontend\.env.android - edita TU_IP_LOCAL si usas celular fisico.
)
call npm run build:android
if not exist "android" (
  call npx cap add android
)
call npx cap sync android
cd ..

echo.
echo [3/4] App ASESORES - generando proyecto Android...
cd admin
if not exist ".env.android" (
  copy /Y ".env.android.example" ".env.android" >nul
)
call npm run build:android
if not exist "android" (
  call npx cap add android
)
call npx cap sync android
cd ..

echo.
echo [4/4] Listo. Abre Android Studio con una de estas opciones:
echo.
echo   App CLIENTES:  cd frontend  ^&  npm run android:open
echo   App ASESORES:  cd admin     ^&  npm run android:open
echo.
echo Lee ANDROID_GUIA.md para Play Store y cuentas de desarrollador.
echo.
pause
exit /b 0

:error
echo Fallo la instalacion. Revisa la conexion o Node.js.
pause
exit /b 1
