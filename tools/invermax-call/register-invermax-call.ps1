# Registra invermax-call: para abrir MicroSIP desde el navegador (HKCU, sin admin).
$ErrorActionPreference = 'Stop'

$handlerBat = Join-Path $PSScriptRoot 'INVERMAX_LLAMAR.bat'
if (-not (Test-Path $handlerBat)) {
  Write-Error "No se encontro INVERMAX_LLAMAR.bat en $PSScriptRoot"
}

$microsip = Join-Path $PSScriptRoot '..\MicroSIP\MicroSIP.exe'
if (-not (Test-Path $microsip)) {
  Write-Warning "MicroSIP no esta en tools\MicroSIP. Instala MicroSIP antes de llamar."
}

$root = 'HKCU:\Software\Classes\invermax-call'
New-Item -Path $root -Force | Out-Null
Set-ItemProperty -Path $root -Name '(Default)' -Value 'URL:INVERMAX MicroSIP Call'
New-ItemProperty -Path $root -Name 'URL Protocol' -Value '' -PropertyType String -Force | Out-Null

$cmdKey = Join-Path $root 'shell\open\command'
New-Item -Path $cmdKey -Force | Out-Null
$command = "`"$handlerBat`" `"%1`""
Set-ItemProperty -Path $cmdKey -Name '(Default)' -Value $command

Write-Host 'Listo: protocolo invermax-call: registrado para esta cuenta de Windows.'
Write-Host "Handler: $handlerBat"
Write-Host "MicroSIP: $microsip"
