<#
.SYNOPSIS
  Run a council research sprint headless on studio-pc.

.DESCRIPTION
  Uses the Claude Code CLI in non-interactive mode to run /dialecta-research for one advisor
  (or all three, sequentially). Bulk reading and summarizing goes through the local Ollama
  server via tools/local-research; the advisor's reasoning runs on Claude.

    scripts\research-sprint.ps1 -Advisor philosopher
    scripts\research-sprint.ps1 -Advisor all -MaxSources 8

  Schedule it (Task Scheduler, nightly at 02:00):
    schtasks /Create /SC DAILY /ST 02:00 /TN "Dialecta research sprint" /TR "powershell -NoProfile -ExecutionPolicy Bypass -File C:\Dialecta\scripts\research-sprint.ps1 -Advisor all"

  Cost: roughly one Sonnet or Opus session per advisor per run, plus local GPU time.
  Logs land in council\log\sprints\.
#>
param(
  [ValidateSet('treasurer', 'designer', 'philosopher', 'builder', 'reviewer', 'voice-editor', 'migrator', 'spec-reader', 'decider', 'legal', 'council', 'team', 'all')][string]$Advisor = 'all',
  [int]$MaxSources = 6,
  [string]$Model = 'sonnet',
  [string]$Root = 'C:\Dialecta'
)
$ErrorActionPreference = 'Stop'
Set-Location $Root
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) { throw 'claude CLI not on PATH (npm install -g @anthropic-ai/claude-code)' }
$logDir = Join-Path $Root 'council\log\sprints'; New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$council = 'treasurer', 'designer', 'philosopher', 'security', 'legal'
$team = 'builder', 'reviewer', 'voice-editor', 'migrator', 'spec-reader', 'decider'
$list = switch ($Advisor) {
  'all'     { $council + $team }
  'council' { $council }
  'team'    { $team }
  default   { @($Advisor) }
}
foreach ($a in $list) {
  $stamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
  $log = Join-Path $logDir "$stamp-$a.log"
  Write-Host "== sprint: $a (model $Model, max $MaxSources sources) -> $log"
  $prompt = "/dialecta-research $a --max $MaxSources"
  claude -p $prompt --model $Model --permission-mode acceptEdits --max-turns 60 2>&1 | Tee-Object -FilePath $log
}
npm run index -w tools/local-research | Out-Null
Write-Host '== index rebuilt'
