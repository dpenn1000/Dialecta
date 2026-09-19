# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| One migration per change, named `YYYYMMDDHHMMSS_<snake_case_intent>.sql`, and a shipped migration is never edited | high | `.claude/agents/migrator.md`; `2026-live-migration-history.md` (live followed the same rule: `026b` fixed `026` forward rather than editing it) | 2026-09-19 |
| Every table: RLS enabled, a select policy, and write policies scoped by `auth.uid()` or service role | high | `.claude/agents/migrator.md` | 2026-09-19 |
| Enums for closed sets such as `tier` and `axis`; check constraints for ranges | high | `.claude/agents/migrator.md`; `2026-postgresql-domains-vs-checks.md` | 2026-09-19 |
| Ghost-sourced ids stay `text` and legacy; Supabase identities are `uuid` referencing `profiles.user_id` | medium | `.claude/agents/migrator.md`; ADR-001; `2026-live-schema-diff.md` | 2026-09-19 |
| A spec field that will not map cleanly is a question for Dan, never an invented mapping | high | `.claude/agents/migrator.md`; exchange 2026-09-19-002 | 2026-09-19 |
| Read the remote migration history before writing anything against a database this repo did not create. `supabase migration list --linked` comes before `db push`, always | high | `2026-supabase-migration-workflow.md`; `2026-live-migration-history.md` | 2026-09-19 |
| `supabase/types.ts` is evidence about the live project, not about `supabase/migrations/`. It cannot distinguish `text` from `uuid`, and it cannot show RLS policies, check constraints, indexes or defaults | high | `2026-supabase-type-generation-drift.md` | 2026-09-19 |
| Check a locked enum against the live value list before naming it in a migration. Removing a value is unsupported and costs a type rebuild; `ALTER TYPE ... RENAME VALUE` is one statement | high | `2026-postgresql-enum-evolution.md` | 2026-09-19 |
| RLS policy changes are written by hand in the migration and never generated. Declarative schemas and `db diff` do not capture policies, and a missing policy looks identical to an intended absence | high | `2026-supabase-declarative-schemas.md` | 2026-09-19 |
| Bounded values stay column check constraints rather than domains, until the same bound appears on a second table. A domain constraint is not revalidated when it changes | medium | `2026-postgresql-domains-vs-checks.md` | 2026-09-19 |
| Before writing a migration for a spec entity, check whether the entity already exists live and under what name. Ten of the thirteen tables in `supabase/migrations/` already existed | high | `2026-live-schema-diff.md` | 2026-09-19 |

## Note on the fourth row

The identity practice dropped from high to medium on 2026-09-19. It is still the
right rule for what this repo writes, and the live database does not follow it: live
keys every child table on `member_id` with no foreign key to `profiles`, and
`profiles.ghost_member_id` is not null. Whether those columns are `text` or `uuid`
cannot be read from `supabase/types.ts`. The rule holds for new work and does not
describe the database as it stands. See `2026-live-schema-diff.md`, "The one
structural fact under all of it".
