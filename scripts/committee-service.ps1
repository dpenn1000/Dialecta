<#
.SYNOPSIS
  Install, control and inspect the committee API as a Windows service on studio-pc.

.DESCRIPTION
  The committee API answers a question by running a Dialecta agent. As a foreground process it
  dies with the terminal, so it runs under NSSM the same way TrinityLauncher and Cloudflared do.

    scripts\committee-service.ps1 -Action token      generate COMMITTEE_API_TOKEN into .env if absent
    scripts\committee-service.ps1 -Action install    register the service (needs an elevated shell)
    scripts\committee-service.ps1 -Action start
    scripts\committee-service.ps1 -Action stop
    scripts\committee-service.ps1 -Action status     service state, port, and a health probe
    scripts\committee-service.ps1 -Action remove     unregister it

  The service binds 127.0.0.1. That is deliberate and install will refuse to change it: this
  endpoint runs a coding agent with edit permission on this repository. To reach it from a phone,
  put Cloudflare Tunnel or Tailscale in front of localhost. Do not forward a port to it.
#>
[CmdletBinding()]
param(
  [ValidateSet('token', 'install', 'start', 'stop', 'status', 'remove')]
  [string]$Action = 'status',
  [string]$Root = 'C:\Dialecta',
  [string]$ServiceName = 'DialectaCommittee',
  [int]$Port = 8787
)

$ErrorActionPreference = 'Stop'
function Ok($m) { Write-Host "   OK   $m" -ForegroundColor Green }
function Warn($m) { Write-Host "   WARN $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "   FAIL $m" -ForegroundColor Red; exit 1 }

$envFile = Join-Path $Root '.env'
$entry = Join-Path $Root 'tools\committee-api\server.mjs'
$logDir = Join-Path $Root '.committee-logs'

function Get-Elevated {
  (New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
}

switch ($Action) {

  'token' {
    if (-not (Test-Path $envFile)) { New-Item -ItemType File -Path $envFile | Out-Null }
    if ((Get-Content $envFile -Raw -ErrorAction SilentlyContinue) -match '(?m)^\s*COMMITTEE_API_TOKEN\s*=\s*\S') {
      Ok 'COMMITTEE_API_TOKEN already set; leaving it alone'
    }
    else {
      $bytes = New-Object byte[] 32
      [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
      $tok = -join ($bytes | ForEach-Object { $_.ToString('x2') })
      Add-Content -Path $envFile -Value "`nCOMMITTEE_API_TOKEN=$tok" -Encoding utf8
      Ok 'COMMITTEE_API_TOKEN written to .env (64 hex characters)'
      Warn 'The value is in .env, which is gitignored. Read it from there; it is not printed.'
    }
  }

  'install' {
    if (-not (Get-Elevated)) { Fail 'installing a service needs an elevated PowerShell' }
    if (-not (Get-Command nssm -ErrorAction SilentlyContinue)) { Fail 'nssm is not on PATH' }
    if (-not (Test-Path $entry)) { Fail "entry point not found: $entry" }
    if (-not ((Get-Content $envFile -Raw -ErrorAction SilentlyContinue) -match '(?m)^\s*COMMITTEE_API_TOKEN\s*=\s*\S')) {
      Fail 'no COMMITTEE_API_TOKEN in .env; run -Action token first'
    }
    $node = (Get-Command node).Source
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    nssm install $ServiceName $node $entry
    nssm set $ServiceName AppDirectory $Root
    nssm set $ServiceName AppStdout (Join-Path $logDir 'committee.out.log')
    nssm set $ServiceName AppStderr (Join-Path $logDir 'committee.err.log')
    nssm set $ServiceName AppRotateFiles 1
    nssm set $ServiceName AppRotateBytes 10485760
    nssm set $ServiceName Start SERVICE_AUTO_START
    nssm set $ServiceName Description 'Dialecta committee API. Localhost only; runs a coding agent on request.'
    Ok "installed $ServiceName"
    Warn 'It binds 127.0.0.1. Put a tunnel in front of it rather than forwarding a port.'
  }

  'start' { nssm start $ServiceName; Ok 'started' }
  'stop' { nssm stop $ServiceName; Ok 'stopped' }

  'remove' {
    if (-not (Get-Elevated)) { Fail 'removing a service needs an elevated PowerShell' }
    nssm stop $ServiceName 2>$null | Out-Null
    nssm remove $ServiceName confirm
    Ok "removed $ServiceName"
  }

  'status' {
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc) { Ok "service $ServiceName is $($svc.Status)" } else { Warn "service $ServiceName is not installed" }

    $listening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listening) { Ok "port $Port is listening" } else { Warn "nothing is listening on $Port" }

    try {
      $h = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -TimeoutSec 4
      Ok "health: running=$($h.running) jobs=$($h.jobs) agents=$($h.agents.Count)"
    }
    catch {
      Warn 'health probe failed; the service is not answering'
    }

    if (Test-Path $logDir) {
      $err = Join-Path $logDir 'committee.err.log'
      if ((Test-Path $err) -and (Get-Item $err).Length -gt 0) {
        Warn "stderr log has content: $err"
        Get-Content $err -Tail 5 | ForEach-Object { Write-Host "        $_" -ForegroundColor DarkGray }
      }
    }
  }
}
