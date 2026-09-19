# Handoff: studio-pc install and council training
*2026-09-19. For Dan at the machine, and for the first Claude Code session that opens in `C:\Dialecta`.*

## For Dan: the install

1. Download `dialecta-scaffold.zip` from the Cowork chat to `C:\Users\dan\Downloads`.
2. In PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File C:\Dialecta\scripts\install-studio-pc.ps1 -Zip C:\Users\dan\Downloads\dialecta-scaffold.zip -Push
```

If `C:\Dialecta\scripts\install-studio-pc.ps1` does not exist yet (the script is inside the zip), unzip first with Explorer, then run the same command without `-Zip`.

The script verifies git, node, npm, python, and the `claude` CLI; unzips over `C:\Dialecta`; runs `npm install`, typecheck, and tests; installs Ollama through winget if missing, pulls `nomic-embed-text` and `qwen2.5:14b`, sets the two `OLLAMA_*` user env vars, builds the research index; creates `chore/monorepo-foundation`, commits, and pushes. Every step prints OK or FAIL. Pass `-ChatModel qwen2.5:32b` to use a larger local model on that GPU. Delete `C:\Dialecta\_to_delete\` afterwards.

Then, by hand: merge the PR; create the `dialecta-staging` Supabase project and run `npx supabase link` and `db push`; create the Vercel project with root directory `apps/web`. Those three are backlog P0-1 to P0-3 and need your logins.

## For Dan: training the council

Two ways to run it. Interactive, in Claude Code:

```
cd C:\Dialecta
claude
> /dialecta-research all
```

Headless, which is what to schedule:

```powershell
C:\Dialecta\scripts\research-sprint.ps1 -Advisor all -MaxSources 6
```

Each sprint takes the next six leads from `council/<advisor>/research/reading-list.md`, fetches and summarizes them on the local model, files one note per source with `research_file`, marks the lead filed or dead, adds new leads it found, and updates `positions.md`. Three sprints per advisor (about a week nightly) gets each of them to roughly fifteen sourced notes and a real positions table. The reading lists are seeds I wrote from memory; the sprint's first job is to verify them, and it is told so.

Watch the first run interactively before scheduling it. Cost per run is one Claude session per advisor plus local GPU time; the `schtasks` line in `research-sprint.ps1` schedules nightly at 02:00.

After three sprints, the first debates: `/dialecta-council P0-D2`, then `A-D3`.

## For the first Claude Code session

Read `CLAUDE.md` (Start here), `docs/plans/backlog.md`, `docs/handoffs/current.md`. The state on 2026-09-19:

| Area | State |
| --- | --- |
| Repo | Monorepo scaffold, verified: typecheck clean, 25 core tests, Next.js build green, local-research smoke test green |
| Decisions | ADR-001 leave Ghost, ADR-002 Supabase Auth, ADR-003 own editor. Open: P0-D2, A-D3, A-D1, A-D2, B-D1, the business model |
| Council | `treasurer`, `designer`, `philosopher` with charters, empty positions, seed reading lists. `decider` chairs. Nothing filed yet |
| Local compute | `tools/local-research` MCP server in `.mcp.json`. Needs Ollama running with the two models; `local_status` tells you |
| Legacy | `api/` frozen and live on Vercel; Ghost serves dialecta.org until cutover; nothing new touches either |
| Not in repo | Ghost theme source, `api/_axis-mapping.js`, 19 cloud-only OneDrive files (listed in CLAUDE.md) |

First build item after P0-3 is P0-4 (Supabase Auth). Brief `builder` with `/dialecta-brief`; run `reviewer` before handing back.

## Known limits, said once

- Claude Code's agents run on Claude models. The local GPU handles reading, summarizing, embedding, and search through the MCP server, not the agents' reasoning.
- The `guard-docs` hook infers the repo root from the path containing `Dialecta/`; if the repo is ever cloned under a different folder name, update the regex in `.claude/hooks/guard-docs.mjs`.
- Hooks are Node scripts so they run on Windows without Git Bash. The voice hook looks for `python3`, `python`, then `py`.
- `research-sprint.ps1` uses `claude -p` with `--permission-mode acceptEdits` so it can write under `council/` unattended. It cannot edit `docs/` or charters; the hook blocks that regardless of mode.
