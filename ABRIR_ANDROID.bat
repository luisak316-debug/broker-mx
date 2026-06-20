@echo off
title Broker MX - Abrir en Android Studio
cd /d "%~dp0"

echo.
echo  ============================================
echo    BROKER MX - Abrir app en Android Studio
echo  ============================================
echo.
echo  Elige que app quieres abrir:
echo.
echo    [1] CLIENTES  (inversionistas - Broker MX)
echo    [2] ASESORES  (panel admin - Broker MX Asesores)
echo    [3] Salir
echo.
set /p opcion="Escribe 1 o 2 y presiona Enter: "

if "%opcion%"=="1" goto clientes
if "%opcion%"=="2" goto asesores
exit /b 0

:clientes
echo.
echo  Abriendo app CLIENTES...
echo  (Android Studio se abrira solo en la carpeta correcta)
echo.
cd frontend
if not exist "android" (
  echo  Primera vez: creando proyecto Android, espera...
  call npm run android:init
)
call npm run android:open
goto fin

:asesores
echo.
echo  Abriendo app ASESORES...
echo  (Android Studio se abrira solo en la carpeta correcta)
echo.
cd admin
if not exist "android" (
  echo  Primera vez: creando proyecto Android, espera...
  call npm run android:init
)
call npm run android:open
goto fin

:fin
echo.
echo  LISTO. En Android Studio:
echo    1) Espera que termine "Gradle Sync" (barra abajo)
echo    2) Arriba elige tu EMULADOR en el desplegable
echo    3) Pulsa el triangulo verde RUN
echo.
echo  IMPORTANTE: deja INICIAR.bat abierto en tu PC (el servidor).
echo.
pause
