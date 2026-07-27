# Copia variables SIP al portapapeles para pegar en Render
$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot 'backend\.env'
if (-not (Test-Path $envFile)) { throw 'Falta backend\.env' }

$vars = @{}
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $i = $line.IndexOf('=')
    if ($i -lt 1) { return }
    $vars[$line.Substring(0, $i)] = $line.Substring($i + 1)
}

$keys = @(
    'PUBLIC_API_URL', 'SIP_DOMAIN', 'SIP_USERNAME', 'SIP_PASSWORD',
    'SIP_WSS_URL', 'SIP_BRIDGE_ENABLED', 'SIP_STUN_SERVERS'
)
$block = ($keys | Where-Object { $vars.ContainsKey($_) } | ForEach-Object { "$_=$($vars[$_])" }) -join "`n"
Set-Clipboard -Value $block
Write-Host 'Copiado al portapapeles. En Render -> broker-mx-api -> Environment -> Paste.' -ForegroundColor Green
Start-Process 'https://dashboard.render.com'
