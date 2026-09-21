# architect: reading list

*Seed written by the convener on 2026-09-21. Every entry is a lead to verify, not a fact. If a
source does not exist or says something different, say so in the note and correct this list. Add at
least one new lead per sprint, so the list grows as fast as it shrinks.*

| # | Lead | Why it bears on Dialecta | Status |
| --- | --- | --- | --- |
| 1 | Postgres `ALTER DEFAULT PRIVILEGES` and how Supabase applies it to `public` | A `revoke ... from public` left `anon` holding EXECUTE on three functions in this repository on 2026-09-20. Establish the general rule and the check that catches it | todo |
| 2 | Supabase row level security performance: `select auth.uid()` wrapping, policy plan caching, indexing policy predicates | Every table the rebuild adds gets policies. Find out what makes them slow before there are rows | todo |
| 3 | `information_schema` against `pg_catalog` for grant and column questions | `information_schema` reported a grant that `has_column_privilege` contradicted here on 2026-09-20. Decide which this seat trusts, and why | todo |
| 4 | Next.js 15 App Router: server component boundaries, `"use client"` cost, and what actually ships to the browser | `apps/web` is the destination and the port decision turns partly on what a ported component costs once it crosses that boundary | todo |
| 5 | TypeScript `noUncheckedIndexedAccess` and exact optional property types as codebase-wide constraints | Already on in this repository and it has caught real bugs. Find out what else in that family is worth turning on before the codebase is large | todo |
| 6 | Detecting duplicate logic: `jscpd`, `ts-prune`, `knip`, `madge` for cycles and dead exports | "Defined twice" is half this seat's mandate and it should not be done by eye. Judge each on last release, issues and whether one person can abandon it | todo |
| 7 | Constant and magic-number detection, and the argument for deriving over declaring | Dan's standing concern, stated 2026-09-21: dynamic functions over hardcoding. Find the current practice and what it costs | todo |
| 8 | Schema drift detection between a migration tree and a live database | `20260920000000_baseline_live_schema.sql` carries 27 `LIVE UNVERIFIED` markers and one of its assumptions already failed at runtime. There should be a tool for this | todo |
| 9 | Postgres enum against check constraint against lookup table, and what each costs to change later | `opposing_view_engaged` folds a three-valued enum to a boolean in `packages/core` while the live column is three-valued. Settle the general rule | todo |
| 10 | Fan-out and grain errors in analytical SQL | Named in the mandate. A query whose joins multiply rows is the data-layer version of the same mistake as a duplicated channel | todo |
