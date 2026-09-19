# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

The last two rows are not sources. They are artifacts this agent compiled from files
already in the repo, filed here because they are what the next thread needs to read.

| File | Source | Implies for |
| --- | --- | --- |
| `2026-supabase-migration-workflow.md` | Supabase, "Database Migrations" docs, fetched 2026-09-19 | Why `db push` would collide with live; `db pull` is the command this situation calls for. P0-2 |
| `2026-postgresql-enum-evolution.md` | PostgreSQL, "ALTER TYPE" docs, fetched 2026-09-19 | `tier` is safe; `fp_snapshot_reason`, `comment_status` and `archetype_id` are not. Removal unsupported, rename is one statement. P0-2, A-1, D-4 |
| `2026-supabase-declarative-schemas.md` | Supabase, "Declarative database schemas" docs, fetched 2026-09-19 | Does not fit: the diff engine skips RLS policies. Keep hand-written migrations |
| `2026-postgresql-domains-vs-checks.md` | PostgreSQL, "CREATE DOMAIN" docs, fetched 2026-09-19 | Keep `specificity` and `graduation_count` as column checks. A-2, B-1 |
| `2026-supabase-type-generation-drift.md` | Supabase, "Generating TypeScript Types" docs, fetched 2026-09-19 | `types.ts` is evidence about live, and cannot distinguish `text` from `uuid`. Bounds every claim in the schema diff. P0-2, P0-6 |
| `2026-live-schema-diff.md` | Compiled from `supabase/migrations/`, `supabase/types.ts`, `docs/Dialecta_Data_Architecture.md` v1.2 | The table by table comparison the decision in exchange 2026-09-19-001 needs. P0-2 through P0-7, A-2, A-7, A-D3, D-1, D-3 |
| `2026-live-migration-history.md` | Compiled from `docs/handoffs/` and `docs/Dialecta_Project_Index.md` | What the 20 live migration names imply. Live carries seeded personas and an `is_seed` flag. B-5, B-D1 |
