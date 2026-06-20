@echo off
setlocal
title Subir codigo
cd /d "%~dp0"

git add .
git diff --cached --quiet 2>nul || git commit -m "broker.mx y admin"
git remote remove origin 2>nul
git remote add origin https://github.com/luisak316-debug/broker-mx.git
git branch -M main
git push -u origin main

if errorlevel 1 (echo Error en push. & pause & exit /b 1)
echo Listo: https://github.com/luisak316-debug/broker-mx
pause
