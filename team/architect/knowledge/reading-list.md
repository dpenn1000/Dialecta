# architect: reading list

*Seed written by the convener on 2026-09-21. Every entry is a lead to verify, not a fact. If a
source does not exist or says something different, say so in the note and correct this list. Add at
least one new lead per sprint, so the list grows as fast as it shrinks.*

| # | Lead | Why it bears on Dialecta | Status |
| --- | --- | --- | --- |
| 1 | Postgres `ALTER DEFAULT PRIVILEGES` and how Supabase applies it to `public` | A `revoke ... from public` left `anon` holding EXECUTE on three functions in this repository on 2026-09-20. Establish the general rule and the check that catches it | filed |
| 2 | Supabase row level security performance: `select auth.uid()` wrapping, policy plan caching, indexing policy predicates | Every table the rebuild adds gets policies. Find out what makes them slow before there are rows | filed |
| 3 | `information_schema` against `pg_catalog` for grant and column questions | `information_schema` reported a grant that `has_column_privilege` contradicted here on 2026-09-20. Decide which this seat trusts, and why | filed |
| 4 | Next.js 15 App Router: server component boundaries, `"use client"` cost, and what actually ships to the browser | `apps/web` is the destination and the port decision turns partly on what a ported component costs once it crosses that boundary | filed (cross-reference: `builder` had already read the primary source) |
| 5 | TypeScript `noUncheckedIndexedAccess` and exact optional property types as codebase-wide constraints | Already on in this repository and it has caught real bugs. Find out what else in that family is worth turning on before the codebase is large | filed, **premise corrected**: on in `packages/core`, absent in `apps/web` |
| 6 | Detecting duplicate logic: `jscpd`, `ts-prune`, `knip`, `madge` for cycles and dead exports | "Defined twice" is half this seat's mandate and it should not be done by eye. Judge each on last release, issues and whether one person can abandon it | filed |
| 7 | Constant and magic-number detection, and the argument for deriving over declaring | Dan's standing concern, stated 2026-09-21: dynamic functions over hardcoding. Find the current practice and what it costs | todo |
| 8 | Schema drift detection between a migration tree and a live database | `20260920000000_baseline_live_schema.sql` carries 27 `LIVE UNVERIFIED` markers and one of its assumptions already failed at runtime. There should be a tool for this | todo, but read `migrator`'s `2026-schema-diff-tool-landscape.md` first; it judged migra, Atlas, sqldef, sqitch and the Supabase CLI already and landed on Atlas as the only candidate |
| 9 | Postgres enum against check constraint against lookup table, and what each costs to change later | `opposing_view_engaged` folds a three-valued enum to a boolean in `packages/core` while the live column is three-valued. Settle the general rule | todo. The specific case is settled in `2026-live-opposing-view-fold.md`; what remains is the general rule, and `migrator`'s `2026-postgresql-enum-evolution.md` covers the "removal is unsupported" half |
| 10 | Fan-out and grain errors in analytical SQL | Named in the mandate. A query whose joins multiply rows is the data-layer version of the same mistake as a duplicated channel | todo |

## Added 2026-09-20, first sprint

| # | Lead | Why it bears on Dialecta | Status |
| --- | --- | --- | --- |
| 11 | TypeScript project references and a shared `tsconfig.base.json` across an npm workspaces monorepo | `packages/core` and `apps/web` each declare compiler options from scratch with no `extends` between them, and have already diverged on four. Find the current practice for a two-workspace repo and what it costs to introduce once code exists | todo |
| 12 | `pgTAP` or plain SQL assertions as a standing schema and grant contract in CI | Three findings this sprint (anon EXECUTE on four functions, nine wrong markers in the baseline, a function that cannot complete) are each decidable by one query. They were found by hand and nothing would catch them again. `migrator` already filed `2026-supabase-pgtap-rls-testing.md` on the RLS half; the schema and grant half is open | todo |
| 13 | Postgres enum values in a `CHECK` constraint against the application's own union type, and how to keep them from drifting | Live has ten enums and at least fourteen `CHECK` constraints carrying value lists. `packages/core` restates several as TypeScript unions. Nothing checks that they agree, which is this seat's core sentence at the type layer | todo |
| 14 | What `knip` and `jscpd` actually report on this repository | `2026-duplicate-logic-tool-landscape.md` judged both worth adopting and deliberately did not run them. The numbers are the next sprint's work; `packages/core/src/index.ts` is a 103-line barrel and the obvious first target | todo |
