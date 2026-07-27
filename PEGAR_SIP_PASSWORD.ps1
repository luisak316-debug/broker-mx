# Actualiza SIP_PASSWORD en backend\.env sin abrir Notepad
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $root 'backend\.env'

if (-not (Test-Path $envFile)) {
    Write-Host 'No existe backend\.env — ejecuta CONFIGURAR_LLAMADAS.bat primero.' -ForegroundColor Red
    exit 1
}

$secure = Read-Host 'Contrasena SIP' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host 'Contrasena vacia. Cancelado.' -ForegroundColor Red
    exit 1
}

$content = Get-Content -LiteralPath $envFile -Raw
if ($content -match '(?m)^SIP_PASSWORD=.*$') {
    $content = [regex]::Replace($content, '(?m)^SIP_PASSWORD=.*$', "SIP_PASSWORD=$password")
} else {
    $content = $content.TrimEnd() + "`r`nSIP_PASSWORD=$password`r`n"
}

Set-Content -LiteralPath $envFile -Value $content -NoNewline -Encoding UTF8
attrib -R $envFile 2>$null

Write-Host ''
Write-Host 'Listo: SIP_PASSWORD guardada en backend\.env' -ForegroundColor Green
Write-Host 'Copia las mismas variables SIP a Render (broker-mx-api).' -ForegroundColor Yellow
