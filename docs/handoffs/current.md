# Current state

*Rolling note. Each session appends; the Stop hook adds a stub line automatically. Trim when it passes 60 lines and roll the history into a dated handoff.*

- 2026-09-19, branch `main` (not yet pushed): monorepo scaffold landed (`apps/web`, `packages/core` with 25 tests, `supabase/migrations/20260919000000_foundation.sql`, `.claude/` agents, skills, hooks, `docs/plans/`). Next: commit, push, create `dialecta-staging` Supabase project, apply the foundation migration, set Vercel root to `apps/web`. See `docs/plans/backlog.md` P0.

- 2026-09-19 (later): Dan decided ADR-001 (leave Ghost), ADR-002 (Supabase Auth), ADR-003 (own editor). App no longer reads Ghost; migration 0002 adds native article columns and the `article-media` bucket; `scripts/import-ghost.mjs` imports the five posts once; TipTap installed, editor lands in A-10. New agent `decider` and skill `/dialecta-decide`. Next open decisions: P0-D2, A-D3.

- 2026-09-19 (council): added advisors `treasurer`, `designer`, `philosopher` with charters and research trees under `council/`, `/dialecta-council` protocol, `decider` as chair, `tools/local-research` MCP server (Ollama) wired in `.mcp.json`. First council question to run: P0-D2. Setup for local research: `ollama pull nomic-embed-text` and `ollama pull qwen2.5:14b`, then `npm run index -w tools/local-research`.

- 2026-09-19 (install): `scripts/install-studio-pc.ps1` (one-shot: unzip, npm, tests, Ollama, index, branch, commit, push), `scripts/research-sprint.ps1` (headless `/dialecta-research`), `/dialecta-research` skill, seed reading lists per advisor (verify before filing). Full handoff: `docs/handoffs/dialecta-handoff-2026-09-19-studio-pc.md`.

- 2026-09-19 (agent team): PR #3 merged as `47fab54`, closing P0-1. Added `team/` for the six working agents, mirroring `council/`: `brief.md`, `practices.md`, `knowledge/`. Added `exchange/`, the shared record for handoffs, blind spots, advice and votes, with `SCHEMA.md`, a worked example and an append-only ledger. `/dialecta-research` and `research-sprint.ps1` now take any of the nine agents, plus `council`, `team` or `all`. `.voiceignore` scopes the CI voice gate off the April to May import, 1,667 hard hits across 43 files, none of them in code this project authored. Nine training sessions were started, one per agent, each in its own worktree. Corrected: `dialecta.vercel.app` serves a May 2026 build from `dpenn1000/dialecta-api`, not this repo. Next: Supabase `dialecta-staging` and P0-3, both Dan's.
