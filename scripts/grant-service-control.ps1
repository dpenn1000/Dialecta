<#
.SYNOPSIS
  Let Dan's own account start and stop DialectaCommittee without elevating every time.

.DESCRIPTION
  Controlling a Windows service normally needs an elevated shell. That means every roster change,
  every server edit, every restart has to wait for Dan to be at the machine with an admin prompt,
  which is the wrong dependency for a service whose whole point is being callable at any time.

  This grants ONE account the right to start, stop and query ONE service. It touches nothing else.
  It does not grant the right to reconfigure the service, change its binary path, or delete it,
  so a compromised session cannot repoint the service at something else. That distinction is the
  reason this is narrower than the obvious alternative, a scheduled task registered to run
  elevated, which any process running as the user could trigger to run an arbitrary elevated
  command.

  Run it once, elevated. Everything after that is an ordinary `nssm restart`.

    scripts\grant-service-control.ps1                  grant, after printing what will change
    scripts\grant-service-control.ps1 -WhatIf          show the change and write nothing
    scripts\grant-service-control.ps1 -Revoke          put the saved descriptor back

  The previous descriptor is saved to scripts\.service-sd-backup.txt, which is gitignored,
  before anything is written. -Revoke reads it back.
#>
[CmdletBinding()]
param(
  [string]$ServiceName = 'DialectaCommittee',
  [switch]$Revoke,
  [switch]$WhatIf
)

$ErrorActionPreference = 'Stop'
function Ok($m) { Write-Host "   OK   $m" -ForegroundColor Green }
function Info($m) { Write-Host "        $m" -ForegroundColor DarkGray }
function Warn($m) { Write-Host "   WARN $m" -ForegroundColor Yellow }
function Fail($m) { Write-Host "   FAIL $m" -ForegroundColor Red; exit 1 }

$backup = Join-Path $PSScriptRoot '.service-sd-backup.txt'

$elevated = (New-Object Security.Principal.WindowsPrincipal(
    [Security.Principal.WindowsIdentity]::GetCurrent())).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $elevated -and -not $WhatIf) { Fail 'this needs an elevated PowerShell. Right-click, Run as administrator.' }

if (-not (Get-Service -Name $ServiceName -ErrorAction SilentlyContinue)) {
  Fail "service $ServiceName is not installed. Run committee-service.ps1 -Action install first."
}

# sc.exe sdshow prints a blank line then the descriptor. Take the line that looks like one.
$current = ((& sc.exe sdshow $ServiceName) | Where-Object { $_ -match '^D:' }) -join ''
if (-not $current) { Fail 'could not read the current security descriptor. Nothing was changed.' }

if ($Revoke) {
  if (-not (Test-Path $backup)) { Fail "no backup at $backup, so there is nothing to restore." }
  $saved = (Get-Content $backup -Raw).Trim()
  if ($saved -notmatch '^D:') { Fail 'the backup file does not look like a descriptor. Refusing to write it.' }
  Info "restoring: $saved"
  if ($WhatIf) { Ok 'WhatIf: nothing written'; exit 0 }
  & sc.exe sdset $ServiceName $saved | Out-Null
  Ok "restored the original descriptor on $ServiceName"
  exit 0
}

$sid = ([Security.Principal.WindowsIdentity]::GetCurrent()).User.Value
Info "account: $([Security.Principal.WindowsIdentity]::GetCurrent().Name)"
Info "sid:     $sid"

if ($current -match [regex]::Escape($sid)) {
  Ok 'that account already appears in the descriptor; nothing to do'
  Info 'if a restart still fails, the existing entry may grant something other than start/stop.'
  exit 0
}

# RP start, WP stop, DT pause/continue, RC read the descriptor. Deliberately NOT: WD/WO, which
# would let the holder rewrite this descriptor, and not CC/DC, which cover reconfiguring.
$ace = "(A;;RPWPDTRC;;;$sid)"

# Append to the end of the DACL, before the SACL if one is present.
#
# Not a regex. The obvious one, ^(D:[^S]*)(S:.*)$, is wrong and was tried on 2026-09-20: `S`
# appears inside the rights strings and the SIDs themselves (CCLC*S*W, *S*Y, *S*U, *S*D), so
# [^S]* stops in the middle of the first ACE and builds malformed SDDL. sc.exe rejected it with
# 1804 and changed nothing, which is the only reason that attempt was harmless.
#
# The SACL always begins immediately after the last DACL ACE's closing paren, so the literal
# ")S:(" is an unambiguous split point. SDDL ACEs never nest parens and "S:" appears nowhere else
# as a section marker.
$split = $current.IndexOf(')S:(')
if ($split -ge 0) { $new = $current.Substring(0, $split + 1) + $ace + $current.Substring($split + 1) }
else { $new = $current + $ace }

# Refuse to write anything that is not longer than what we read by exactly the ACE we added.
if ($new.Length -ne $current.Length + $ace.Length) {
  Fail "built a descriptor of an unexpected length. Nothing was written.`n  current: $current`n  built:   $new"
}

Info ''
Info "current: $current"
Info "new:     $new"
Info ''

if ($WhatIf) { Ok 'WhatIf: nothing written'; exit 0 }

Set-Content -Path $backup -Value $current -Encoding utf8
Ok "saved the current descriptor to $backup"

& sc.exe sdset $ServiceName $new | Out-Null
if ($LASTEXITCODE -ne 0) { Fail "sdset returned $LASTEXITCODE. The descriptor is unchanged; the backup is at $backup." }

$after = ((& sc.exe sdshow $ServiceName) | Where-Object { $_ -match '^D:' }) -join ''
if ($after -match [regex]::Escape($sid)) {
  Ok "granted start and stop on $ServiceName to this account"
  Info 'verify from a NON-elevated shell:  nssm restart DialectaCommittee'
  Info "undo at any time:                  scripts\grant-service-control.ps1 -Revoke"
}
else {
  Warn 'sdset reported success but the entry is not visible. Check with: sc.exe sdshow ' + $ServiceName
}
