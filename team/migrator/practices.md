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
| A diff engine is named explicitly (`--diff-engine pg-delta` on `db pull`, `--use-pg-delta` on `db diff`), never left to default. The Supabase CLI's default is still `migra`, and upstream `migra` is self-described deprecated with no commits in over a year | high | `2026-supabase-db-pull-diff-engines.md` | 2026-09-20 |
| A populated column's type is never changed with a bare `ALTER COLUMN ... TYPE`. Add the new column, backfill in batches, dual-write from the app, cut reads over, then drop the old column. A naive cast also fails outright wherever the value is not castable, which this schema has by design (Ghost-sourced text ids) | high | `2026-postgresql-column-type-remap.md` | 2026-09-20 |
| A ledger table's rows are corrected by appending a compensating row, never by patching the total in place. This is `supabase/CLAUDE.md`'s replay lock; this is the sourced reason for it | high | `2026-event-sourcing-ledger-replay.md` | 2026-09-20 |
| A Supabase branch used for staging is created with data explicitly included. The default branch flow clones configuration and Edge Functions automatically but starts with no data or storage objects | high | `2026-supabase-branching.md` | 2026-09-20 |
| RLS policy shape gets a `policies_are()` / `policy_roles_are()` / `policy_cmd_is()` pgTAP assertion once Docker is available, run via `supabase test db`, in addition to the hand-written migration. Not yet run locally; Docker is not installed on studio-pc | medium | `2026-supabase-pgtap-rls-testing.md` | 2026-09-20 |
| A third-party schema-diff tool (Atlas, sqldef, sqitch) is not adopted to replace the Supabase CLI for authoring: each tracks its own applied-state separately from `supabase_migrations.schema_migrations`, which this repo already depends on. Atlas is a live candidate for drift detection specifically, as a supplement, pending a price/fit check not yet done | medium | `2026-schema-diff-tool-landscape.md` | 2026-09-20 |
| A grant revoke (removing `anon`/`authenticated`'s default full CRUD on a `public` table) lands in the same migration as, or strictly before, the first write policy added for that table, never after. Live carries open grants and zero write policies today, safe only by omission; the instant a policy like "owner may update their own row" is added the way the repo's own foundation migration does it, the self-tier-escalation path (B2) becomes live-exploitable. The remedy is revoke the table-level grant, then grant back an explicit column list, on every write verb a policy will cover, not update alone | high | `exchange/open/2026-09-20-security-03-handoff-grants-measured-b2-holds.md`; `team/reviewer/knowledge/2026-postgresql-column-privileges.md` | 2026-09-20 |
| A column-grant fix is ordered by what the column can do, not alphabetically or by how sensitive it sounds. `profiles.ghost_member_id` is revoked from `anon`/`authenticated` ahead of `is_admin` and `subscription_tier`, because it was confirmed to double as the entire auth check on a write path (`/api/comment`, no session verification behind it), not merely disclosure like the other two | high | `exchange/open/2026-09-20-security-02-blindspot-comment-credential-may-be-public.md` (security and reviewer's confirmation) | 2026-09-20 |

## Note on the fourth row

The identity practice dropped from high to medium on 2026-09-19. It is still the
right rule for what this repo writes, and the live database does not follow it: live
keys every child table on `member_id` with no foreign key to `profiles`, and
`profiles.ghost_member_id` is not null. Whether those columns are `text` or `uuid`
cannot be read from `supabase/types.ts`. The rule holds for new work and does not
describe the database as it stands. See `2026-live-schema-diff.md`, "The one
structural fact under all of it".

**Added 2026-09-20.** The mechanical path for closing this gap, whenever it is
opened, is now costed: expand-contract, not a single `ALTER COLUMN TYPE`, and the
backfill step needs `profiles.ghost_member_id` to resolve every live `member_id` to a
real `profiles.user_id` before it can run cleanly. Whether it resolves all of them is
unmeasured and is now an open reading-list lead. See
`2026-postgresql-column-type-remap.md`.
