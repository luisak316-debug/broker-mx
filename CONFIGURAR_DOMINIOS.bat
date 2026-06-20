@echo off
setlocal
title brokermx.com - un solo dominio
cd /d "%~dp0"

echo ============================================
echo   UN SOLO DOMINIO: brokermx.com
echo ============================================
echo.
echo   Clientes:  https://brokermx.com/
echo   Admin:     https://brokermx.com/admin847/
echo.
echo   Todo en TU dominio. Nada de admin.com ni otros.
echo.
echo --------------------------------------------
echo   PASO 1: Comprar brokermx.com
echo --------------------------------------------
start "" https://www.namecheap.com/domains/registration/results/?domain=brokermx.com
pause

echo.
echo --------------------------------------------
echo   PASO 2: Render (todo en un servidor)
echo --------------------------------------------
echo   1. dashboard.render.com
echo   2. Repo: luisak316-debug/broker-mx
echo   3. Variables Twilio
echo   4. Custom Domain: brokermx.com
echo.
echo   Render sirve:
echo     brokermx.com/       - clientes
echo     brokermx.com/admin847/ - admin
echo     brokermx.com/api/   - SMS y datos
echo.
start "" https://dashboard.render.com
pause

echo.
echo --------------------------------------------
echo   PASO 3: DNS
echo --------------------------------------------
echo   En Namecheap/GoDaddy pega el DNS que Render te da.
echo   En 1-48 horas quedan tus enlaces cortos fijos.
echo.
pause
