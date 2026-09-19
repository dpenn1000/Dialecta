# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| One migration per change, named `YYYYMMDDHHMMSS_<snake_case_intent>.sql`, and a shipped migration is never edited | high | `.claude/agents/migrator.md` | 2026-09-19 |
| Every table: RLS enabled, a select policy, and write policies scoped by `auth.uid()` or service role | high | `.claude/agents/migrator.md` | 2026-09-19 |
| Enums for closed sets such as `tier` and `axis`; check constraints for ranges | high | `.claude/agents/migrator.md` | 2026-09-19 |
| Ghost-sourced ids stay `text` and legacy; Supabase identities are `uuid` referencing `profiles.user_id` | high | `.claude/agents/migrator.md`; ADR-001 | 2026-09-19 |
| A spec field that will not map cleanly is a question for Dan, never an invented mapping | high | `.claude/agents/migrator.md` | 2026-09-19 |
