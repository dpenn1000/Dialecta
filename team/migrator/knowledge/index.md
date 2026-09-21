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
| `2026-live-rls-surface.md` | Measured against live project `mguulnibvzusfvyuowwh`, 2026-09-19 | What anon can read under live RLS. `028_pre_launch_security_hardening` did real work; `profiles` exposes every column to anon. A-5, B-3, B-5 |
| `2026-supabase-db-pull-diff-engines.md` | `supabase db pull --help` / `db diff --help`, CLI 2.117.0, run locally 2026-09-20 | `--declarative` confirmed correct as `p0-2-runbook.md` uses it; migra and pg-delta are engines inside one CLI, not rival tools, and migra (deprecated upstream) is still the CLI default. P0-2 |
| `2026-supabase-pgtap-rls-testing.md` | Supabase pgTAP docs + PostgreSQL `pg_policies` docs, fetched 2026-09-20 | `policies_are()` is the direct test for the mandate's no-update-no-delete-on-`axis_events` rule. Needs Docker, unavailable today. A-5, P0-2 |
| `2026-supabase-branching.md` | Supabase branching + usage docs, fetched 2026-09-20 | A branch clones config and Edge Functions automatically; data needs an explicit opt-in. ~$9.70/mo persistent, Pro plan+. Corrects an assumption in `p0-2-runbook.md` Branch B. P0-2 |
| `2026-event-sourcing-ledger-replay.md` | Synthesized from a survey of consistent sources, fetched 2026-09-20 (weak citation, flagged in the note) | Why `supabase/CLAUDE.md` locks replay, and why live's 27 `axis_events` rows cannot be reconstructed into a delta history. Branch C |
| `2026-postgresql-column-type-remap.md` | PostgreSQL `ALTER TABLE` docs + zero-downtime-migration writeups, fetched 2026-09-20 | The identity remap across nine tables needs expand-contract, not a bare `ALTER COLUMN TYPE`; a naive cast fails outright on Ghost-sourced text ids. Branch C |
| `2026-schema-diff-tool-landscape.md` | GitHub API, five repos, fetched 2026-09-20 | migra is inherited-only, do not add directly; Atlas is the lead candidate for drift detection (not migration authoring), unpriced; sqldef and sqitch have no clear opening here |
| `2026-ghost-article-images-inventory.md` | Supabase MCP against `mguulnibvzusfvyuowwh` + live `www.dialecta.org`, read 2026-09-21 | No image column exists anywhere in `public`; the five feature images live only on Ghost. `article-media` was designed (ADR-003) and never applied. `feature_image` is already coded for in `apps/web`, just unwired. A-10 |
| `2026-ghost-article-images-manifest.md` | This agent, five files downloaded and hash-verified 2026-09-21 | Source URL, local path, bytes, sha256, dimensions and article for each of the five article feature images. A-10 |
| `2026-ghost-article-images-migration-plan.md` | Compiled from the inventory above, `ADR-003`, `docs/plans/backlog.md`, `council/security/research/2026-live-storage-surface.md` | Bucket `article-media`, Ghost's own path scheme kept, a rewrite for old absolute URLs, `articles.feature_image` added and backfilled, `scripts/import-ghost.mjs` fixed to stop losing it. Not executed. A-10 |
