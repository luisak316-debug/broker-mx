@echo off
setlocal EnableExtensions
REM Handler del protocolo invermax-call: — recibe la URI y marca en MicroSIP.
set "URI=%~1"
set "DIAL=%URI:invermax-call:=%"
if "%DIAL:~0,2%"=="//" set "DIAL=%DIAL:~2%"
if "%DIAL:~0,1%"=="/" set "DIAL=%DIAL:~1%"

set "EXE=%~dp0..\MicroSIP\MicroSIP.exe"
if not exist "%EXE%" set "EXE=%~dp0MicroSIP.exe"
if not exist "%EXE%" (
  echo [INVERMAX] No se encontro MicroSIP.exe
  exit /b 1
)

start "" "%EXE%" "%DIAL%"
