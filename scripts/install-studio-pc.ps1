<#
.SYNOPSIS
  One-shot installer for the Dialecta repo on studio-pc.

.DESCRIPTION
  Run from anywhere in PowerShell 5.1 or 7:
    powershell -ExecutionPolicy Bypass -File C:\Dialecta\scripts\install-studio-pc.ps1
  Optional:
    -Zip C:\Users\dan\Downloads\dialecta-scaffold.zip   unzip the scaffold over C:\Dialecta first
    -Push                                                push the foundation branch to GitHub
    -ChatModel qwen2.5:32b                               pick the local chat model (default qwen2.5:14b)
    -SkipOllama                                          skip the local model setup

  What it does, in order: verify tools, unzip (optional), npm install, typecheck and tests,
  Ollama install and model pulls, build the local research index, create the foundation branch
  and commit, print the next steps. Every step prints OK or FAIL; nothing is silent.
#>
[CmdletBinding()]
param(
  [string]$Root = 'C:\Dialecta',
  [string]$Zip = '',
  [switch]$Push,
  [string]$ChatModel = 'qwen2.5:14b',
  [string]$EmbedModel = 'nomic-embed-text',
  [switch]$SkipOllama
)

$ErrorActionPreference = 'Stop'
function Step($name) { Write-Host "`n== $name" -ForegroundColor Cyan }
function Ok($msg)    { Write-Host "   OK   $msg" -ForegroundColor Green }
function Fail($msg)  { Write-Host "   FAIL $msg" -ForegroundColor Red; exit 1 }
function Warn($msg)  { Write-Host "   WARN $msg" -ForegroundColor Yellow }
function Have($cmd)  { $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue) }

Step 'Tools'
foreach ($t in 'git', 'node', 'npm') { if (Have $t) { Ok "$t $((& $t --version 2>$null | Select-Object -First 1))" } else { Fail "$t not on PATH" } }
$nodeMajor = [int]((node -v).TrimStart('v').Split('.')[0]); if ($nodeMajor -lt 20) { Fail "Node 20+ required, found $(node -v)" }
$py = if (Have 'python') { 'python' } elseif (Have 'py') { 'py' } elseif (Have 'python3') { 'python3' } else { '' }
if ($py) { Ok "python: $py" } else { Warn 'python not on PATH; the voice-check hook will be skipped until it is' }
if (Have 'claude') { Ok "claude $((claude --version 2>$null | Select-Object -First 1))" } else { Warn 'claude (Claude Code CLI) not on PATH; install with: npm install -g @anthropic-ai/claude-code' }

if ($Zip) {
  Step "Unzip $Zip over $Root"
  if (-not (Test-Path $Zip)) { Fail "zip not found: $Zip" }
  $tmp = Join-Path $env:TEMP ("dialecta-unzip-" + [guid]::NewGuid().ToString('N'))
  Expand-Archive -Path $Zip -DestinationPath $tmp -Force
  $src = Join-Path $tmp 'Dialecta'; if (-not (Test-Path $src)) { $src = $tmp }
  New-Item -ItemType Directory -Force -Path $Root | Out-Null
  Copy-Item -Path (Join-Path $src '*') -Destination $Root -Recurse -Force
  Remove-Item $tmp -Recurse -Force
  Ok 'scaffold in place'
}

if (-not (Test-Path (Join-Path $Root 'package.json'))) { Fail "$Root has no package.json; pass -Zip <path to dialecta-scaffold.zip>" }
Set-Location $Root

Step 'Git sanity'
if (-not (Test-Path '.git')) { Fail 'not a git repo; clone dpenn1000/Dialecta into C:\Dialecta first, then rerun with -Zip' }
git config core.filemode false; git config core.autocrlf true
Ok "branch: $(git branch --show-current)"

Step 'npm install'
npm install --no-audit --no-fund; if ($LASTEXITCODE -ne 0) { Fail 'npm install' }; Ok 'dependencies installed'

Step 'Typecheck and tests'
npm run typecheck; if ($LASTEXITCODE -ne 0) { Fail 'typecheck' }; Ok 'typecheck'
npm test; if ($LASTEXITCODE -ne 0) { Fail 'tests' }; Ok 'tests'

if (-not $SkipOllama) {
  Step 'Ollama (local research models)'
  if (-not (Have 'ollama')) {
    if (Have 'winget') { winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements; $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path', 'User') }
    if (-not (Have 'ollama')) { Warn 'Ollama not installed; get it from https://ollama.com/download, then rerun with -SkipOllama:$false'; $SkipOllama = $true }
  }
  if (-not $SkipOllama) {
    Ok "ollama $((ollama --version 2>$null | Select-Object -First 1))"
    $up = $false; try { Invoke-WebRequest -Uri 'http://127.0.0.1:11434/api/tags' -UseBasicParsing -TimeoutSec 3 | Out-Null; $up = $true } catch { }
    if (-not $up) { Start-Process ollama -ArgumentList 'serve' -WindowStyle Hidden; Start-Sleep -Seconds 4 }
    foreach ($m in $EmbedModel, $ChatModel) { ollama pull $m; if ($LASTEXITCODE -ne 0) { Warn "pull $m failed" } else { Ok "model $m" } }
    [System.Environment]::SetEnvironmentVariable('OLLAMA_CHAT_MODEL', $ChatModel, 'User')
    [System.Environment]::SetEnvironmentVariable('OLLAMA_EMBED_MODEL', $EmbedModel, 'User')
    Ok "OLLAMA_CHAT_MODEL=$ChatModel, OLLAMA_EMBED_MODEL=$EmbedModel (user env)"
    Step 'Local research index'
    $env:OLLAMA_CHAT_MODEL = $ChatModel; $env:OLLAMA_EMBED_MODEL = $EmbedModel
    npm run index -w tools/local-research; if ($LASTEXITCODE -ne 0) { Warn 'index build failed (empty research trees are fine; rerun after the first sprint)' } else { Ok 'index built' }
  }
}

Step 'Branch and commit'
$branch = 'chore/monorepo-foundation'
if ((git branch --show-current) -ne $branch) { git checkout -B $branch }
git add -A
if ((git status --porcelain | Measure-Object).Count -gt 0) {
  git commit -m "Monorepo foundation: apps/web, packages/core, supabase, agent team, council, local research, build plan"
  Ok "committed on $branch"
} else { Ok 'nothing to commit' }
if ($Push) { git push -u origin $branch; if ($LASTEXITCODE -ne 0) { Fail 'push' }; Ok 'pushed; open the PR on GitHub' }

Step 'Next'
Write-Host @"
   1. Open the PR for $branch and merge it (CI runs typecheck, tests, voice check).
   2. Supabase: create dialecta-staging, then: npx supabase login; npx supabase link --project-ref <ref>; npx supabase db push; npm run types
   3. Vercel: new project, root directory apps/web, env vars from apps/web/.env.example
   4. Start the research sprint (this trains the council):
        cd $Root; claude
        > /dialecta-research all
      Or headless, one advisor at a time:  scripts\research-sprint.ps1 -Advisor philosopher
   5. First decision:  > /dialecta-council P0-D2
"@
