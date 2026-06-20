@echo off
setlocal
title Broker MX - Configurar SMS (Twilio)
cd /d "%~dp0"

echo ============================================
echo   CONFIGURAR SMS REAL - Twilio
echo ============================================
echo.
echo IMPORTANTE: No compartas tu Auth Token con nadie
echo (ni en chats, ni fotos, ni correos).
echo Solo pegalo en backend\.env en TU computadora.
echo.
echo Ya tienes cuenta con saldo - sigue estos pasos:
echo.
echo   1. Abre https://console.twilio.com
echo   2. En el Dashboard, caja "Account Info" (credenciales LIVE):
echo        Account SID  (Live, empieza con AC...)
echo        Auth Token   (Live - Show - Copy)
echo      NO uses "Test Account Credentials" (no envian SMS real).
echo   3. Compra 1 numero con SMS:
echo        Phone Numbers - Manage - Buy a number
echo        (elige uno de EE.UU. +1 con capacidad SMS)
echo   4. Copia ese numero en formato +1XXXXXXXXXX
echo   5. Activa Mexico:
echo        Messaging - Settings - Geo permissions
echo        - habilita Mexico
echo.
echo Se abrira backend\.env — pega SOLO estas 3 lineas:
echo.
echo   TWILIO_ACCOUNT_SID=ACxxxxxxxx
echo   TWILIO_AUTH_TOKEN=tu_token_aqui
echo   TWILIO_FROM_NUMBER=+1XXXXXXXXXX
echo.
echo Guarda el archivo. Luego ejecuta PROBAR_SMS.bat
echo.
pause

start "" https://console.twilio.com/us1/develop/phone-numbers/manage/search
notepad "%~dp0backend\.env"

echo.
echo Cuando guardes .env, ejecuta PROBAR_SMS.bat para confirmar.
echo.
pause
