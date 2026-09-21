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

## Second sprint, 2026-09-21: arming

| File | Source | Implies for |
| --- | --- | --- |
| [2026-live-forming-three-against-one.md](2026-live-forming-three-against-one.md) | Live catalog, 24 hours of logs, every code copy on disk | `initialise_contributor_axes` is dead code; "forming" is an archetype in the spec, `packages/core` and the dead function, and a confidence level in live. Corrects the first sprint's option ranking |
| [2026-enum-and-check-lists-against-unions.md](2026-enum-and-check-lists-against-unions.md) | `pg_enum`, `pg_constraint`, generated `Constants` | 10 enums, 20 CHECK lists; 5 enums restated by hand in `packages/core`; a test against `Constants` holds them |
| [2026-migration-history-against-live.md](2026-migration-history-against-live.md) | `schema_migrations` against the tracked tree, by version and content | 2 of 31 live migrations have a tracked file under the live version; the unapplied baseline reads as pending to the CLI |
| [2026-live-schema-hygiene-census.md](2026-live-schema-hygiene-census.md) | Seven catalog checks and the Supabase advisors | Types clean; a person keyed three ways, Ghost ids 4 of 18 enforced; a policy already keyed to the wrong identity |
| [2026-postgres-table-design-standards.md](2026-postgres-table-design-standards.md) | Postgres wiki "Don't Do This", PG 18 release notes, Supabase SQL style guide | The standard every table is held to; uuid v7 is built in from PG 18, and live runs 17.6 |
| [2026-append-only-tables-at-scale.md](2026-append-only-tables-at-scale.md) | PG partitioning, BRIN and vacuum docs; pg_partman | All seven event tables are orders of magnitude below any partitioning threshold; decide key type and retention on a number |
| [2026-migration-safety-and-plpgsql-checks.md](2026-migration-safety-and-plpgsql-checks.md) | squawk and plpgsql_check docs and health | squawk as a lock-safety gate that cannot see live; plpgsql_check 2.8 is available and would read function bodies against the schema |
| [2026-postgres-query-cost-on-live.md](2026-postgres-query-cost-on-live.md) | pg_stat_statements, index_advisor, HypoPG, Supabase `inspect db` | `pg_stat_statements` is already installed and collecting; cost findings need traffic, shape findings do not |
| [2026-module-boundaries-and-structural-rules.md](2026-module-boundaries-and-structural-rules.md) | dependency-cruiser and ast-grep docs and health | Replace madge; enforce core never importing web and the barrel as core's only entrance |
| [2026-shared-tsconfig-base.md](2026-shared-tsconfig-base.md) | tsconfig/bases, TS project references, Next.js 15.5 source | A shared base for the 8 options that agree; version-enforced keys stay local; project references not yet |
| [2026-vendor-agent-rulebooks.md](2026-vendor-agent-rulebooks.md) | `supabase/agent-skills`, `vercel-labs/agent-skills` | Supabase's Postgres rules pinned at v1.6.0; Vercel's cited only, having no licence |
| [2026-architectural-fitness-functions.md](2026-architectural-fitness-functions.md) | Ford, Parsons, Kua, Sadalage; Thoughtworks Radar; Hunt and Thomas | The industry name for this seat's standing checks, and the dimensions that decide where each lives |

Instruments filed the same sprint: `../checks/` (seven catalog queries), `../tools/` (five pinned
code tools with configs and a known-answer control), `../references/` (the pinned library).
