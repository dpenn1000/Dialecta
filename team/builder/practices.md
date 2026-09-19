# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Server components by default; a client island only for the composer, classification card, votes and nominations, the fingerprint, and the opinion maps | high | `.claude/agents/builder.md` | 2026-09-19 |
| Never type a hex value; tokens come from `apps/web/src/styles/tokens.css`, and a missing token is reported rather than invented | high | `.claude/agents/builder.md` | 2026-09-19 |
| Every string a person reads lives in `apps/web/src/strings.ts` | high | `.claude/agents/builder.md` | 2026-09-19 |
| `packages/core` never imports Supabase, and a change there lands with a failing test shown first | high | `.claude/agents/builder.md` | 2026-09-19 |
| Classification never blocks the comment insert in the request path | high | `.claude/agents/reviewer.md` check 1; backlog A-1 | 2026-09-19 |
