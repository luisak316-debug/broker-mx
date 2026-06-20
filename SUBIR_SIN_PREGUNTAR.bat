@echo off
setlocal
title Subir a GitHub
cd /d "%~dp0"

echo ============================================
echo   SUBIR CODIGO A GITHUB
echo   https://github.com/luisak316-debug/broker-mx
echo ============================================
echo.
echo Si sale ventana "Connect to GitHub":
echo   Clic en "Sign in with your browser"
echo   (solo esta vez, despues ya no pide)
echo.

git add .
git diff --cached --quiet 2>nul || git commit -m "broker.mx y admin"

git remote remove origin 2>nul
git remote add origin https://github.com/luisak316-debug/broker-mx.git
git branch -M main

echo Subiendo...
git push -u origin main

if errorlevel 1 (
  echo.
  echo Si fallo, en la ventana GitHub elige "Sign in with your browser"
  echo y vuelve a ejecutar este archivo.
  pause
  exit /b 1
)

echo.
echo LISTO: https://github.com/luisak316-debug/broker-mx
pause
