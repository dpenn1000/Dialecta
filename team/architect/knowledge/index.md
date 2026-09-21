# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source, with citation,
summary, and what it implies for a named Dialecta surface or a named practice.

| File | Source | Implies for |
| --- | --- | --- |
| [2026-postgres-alter-default-privileges.md](2026-postgres-alter-default-privileges.md) | PostgreSQL docs, "ALTER DEFAULT PRIVILEGES", plus a live grant audit | Revoke the PUBLIC default globally, never per schema; four functions still hold anon EXECUTE |
| [2026-supabase-rls-performance.md](2026-supabase-rls-performance.md) | Supabase Docs, "RLS Performance and Best Practices" | Four of the six rules are free now and expensive later; `(select auth.uid())` and `TO authenticated` are the default spelling |
| [2026-information-schema-vs-pg-catalog.md](2026-information-schema-vs-pg-catalog.md) | The live database, both methods in one query | `information_schema` reported no grant on four functions that `has_function_privilege` says anon can execute; read `pg_catalog` |
| [2026-nextjs-boundary-crossref.md](2026-nextjs-boundary-crossref.md) | `builder`'s filed note, plus this repo's pinned version | Do not duplicate builder's reading; the docs serve 16.x and `apps/web` pins 15.5.25, which has already failed one control |
| [2026-typescript-strict-family.md](2026-typescript-strict-family.md) | TypeScript TSConfig Reference, plus a measured probe | `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` cost zero errors in `apps/web` today; no shared base config exists |
| [2026-duplicate-logic-tool-landscape.md](2026-duplicate-logic-tool-landscape.md) | GitHub REST API on jscpd, knip, ts-prune, madge | Adopt knip and jscpd; skip ts-prune (subsumed) and madge (eight months stale, 127 open issues) |
| [2026-live-opposing-view-fold.md](2026-live-opposing-view-fold.md) | The live database against `packages/core` and the comment route | Confirmed: the write path at `route.ts:260` can never emit `partially`; 3 rows today, so the fix is free now |
| [2026-live-baseline-unverified-markers.md](2026-live-baseline-unverified-markers.md) | The baseline migration against `pg_catalog` | Nine of 26 markers wrong, two are type errors; `initialise_contributor_axes()` cannot complete |
