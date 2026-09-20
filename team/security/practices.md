# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Read the deployed source, not this repo's copy of it, and say which one you read | high | `.claude/agents/security.md`; the 2026-09-20 profile API finding, where the repo's GET was read-only and the deployed GET was not | 2026-09-20 |
| Never exploit against production. Where a live check is the only way to settle it, state what the request would write and ask first | high | The 2026-09-20 probe that created a row in the live `profiles` table | 2026-09-20 |
| A clean Supabase security advisor means the database is configured, not that the application is safe | high | `get_advisors` returned zero lints on the same project and day the profile endpoint was found wide open | 2026-09-20 |
| A policy is not a control until you know what `anon` and `authenticated` are granted on the table | high | `team/reviewer/knowledge/review-checklist.md`; the grants assumption the reviewer had to go back and confirm | 2026-09-20 |
| Rank by what is reachable today, not by what a planned feature would expose | high | `.claude/agents/security.md` | 2026-09-20 |
| Every finding carries a reproduction and a blast radius, or it is a category rather than a finding | high | `.claude/agents/security.md` | 2026-09-20 |
| Name whose account a fix needs. A production redeploy of another repository is a different item from a change here | high | The profile endpoint lives in `dpenn1000/dialecta-api` | 2026-09-20 |
