# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Correctness first, and trace one concrete input through the change before judging it | high | `.claude/agents/reviewer.md` | 2026-09-19 |
| Every new table has RLS enabled and policies; ledger tables such as `axis_events` get no update or delete policy | high | `.claude/agents/reviewer.md`; `supabase/CLAUDE.md` | 2026-09-19 |
| Code that contradicts a spec is a finding even when it works | high | `.claude/agents/reviewer.md` check 3 | 2026-09-19 |
| The report is a table with severity, file and line, the claim, and the failure scenario, then one line: merge, or not yet | high | `.claude/agents/reviewer.md` | 2026-09-19 |
| Never edit. Bash is for read-only git, the test run, the typecheck, and `voice_check.py` | high | `.claude/agents/reviewer.md` | 2026-09-19 |
