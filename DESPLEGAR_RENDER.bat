@echo off
setlocal EnableExtensions
title SMS 24/7 - Desplegar en Render

if /i not "%~1"=="_run" (
  start "Render SMS permanente" cmd /k ""%~f0" _run"
  exit /b 0
)

cd /d "%~dp0"
set "PATH=%ProgramFiles%\nodejs;%APPDATA%\npm;%LOCALAPPDATA%\npm;%PATH%"

echo ============================================
echo   SMS 24/7 - Render (sin PC encendida)
echo ============================================
echo.
echo   Vercel = paginas web (Broker.mx + admin)
echo   Render = API + SMS (siempre en la nube)
echo.
echo   Despues de esto NO necesitas:
echo   - LANZAR_WEB.bat
echo   - Túnel Cloudflare
echo   - PC encendida
echo.

where node >nul 2>&1 || (echo Instala Node.js & goto :fin)
where git >nul 2>&1 || (echo Instala Git: INSTALAR_GIT.bat & goto :fin)

if not exist "backend\.env" (
  echo [AVISO] Falta backend\.env con Twilio.
  echo Ejecuta CONFIGURAR_SMS.bat primero.
  goto :fin
)

findstr /B /C:"TWILIO_ACCOUNT_SID=" "backend\.env" | findstr /V "=$" >nul 2>&1
if errorlevel 1 (
  echo [AVISO] Twilio no configurado en backend\.env
  echo Ejecuta CONFIGURAR_SMS.bat
  goto :fin
)

echo --- Paso 1: Subir codigo a GitHub ---
echo.
set /p PUSH="Subir cambios a GitHub ahora? (S/N): "
if /i "%PUSH%"=="S" (
  git add .
  git commit -m "Render API permanente SMS 24/7" 2>nul
  git push -u origin main
  if errorlevel 1 (
    echo Si falla el push, ejecuta CONECTAR_GITHUB.bat o ARREGLAR_GITHUB.bat
  ) else (
    echo Codigo subido.
  )
)

echo.
echo --- Paso 2: Crear servicio en Render ---
echo.
echo   1) Inicia sesion en Render
echo   2) New + Blueprint
echo   3) Conecta: luisak316-debug/broker-mx
echo   4) Apply
echo.
start "" https://dashboard.render.com/blueprints
timeout /t 3 /nobreak >nul

echo.
echo --- Paso 3: Variables Twilio en Render ---
echo.
echo   En el servicio broker-mx-api ^> Environment:
echo   Copia desde backend\.env:
echo.
echo     TWILIO_ACCOUNT_SID
echo     TWILIO_AUTH_TOKEN
echo     TWILIO_FROM_NUMBER
echo.
echo   (Usa credenciales LIVE de Twilio, no Test)
echo.
notepad backend\.env
echo.
echo Cuando Render termine de desplegar, copia la URL publica.
echo Ejemplo: https://broker-mx-api.onrender.com
echo.

echo --- Paso 4: Conectar Vercel a Render ---
echo.
set /p RENDER_URL="Pega la URL de Render (sin /api): "
if "%RENDER_URL%"=="" (
  echo Cuando tengas la URL, ejecuta CONFIGURAR_API_VERCEL.bat
  goto :fin
)

echo.
echo Publicando Broker.mx y admin con API permanente...
pushd "%~dp0frontend"
call npx --yes vercel link --yes --project brokermx 2>nul
call npx --yes vercel --prod --yes -e VITE_API_URL=%RENDER_URL%
popd

pushd "%~dp0admin"
call npx --yes vercel link --yes --project brokermx.admin 2>nul
call npx --yes vercel --prod --yes -e VITE_API_URL=%RENDER_URL%
popd

echo.
echo ============================================
echo   LISTO - SMS sin PC encendida
echo.
echo   API:  %RENDER_URL%
echo   Web:  https://brokermx-alpha.vercel.app/
echo   Admin: https://brokermxadmin-khaki.vercel.app/
echo.
echo   Prueba registro con SMS. La primera vez
echo   Render puede tardar ~1 min (plan gratis).
echo ============================================

:fin
echo.
pause
