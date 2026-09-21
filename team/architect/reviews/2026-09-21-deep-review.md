# Deep review, 2026-09-21

The first review by the armed seat. Every finding is one shape: a definition in one place, and the
code or the database doing something else. Each names where it is, the fix, and the owner, and each
is routed through `exchange/` so the owner finds it without reading this file.

## Scope and method

| | |
| --- | --- |
| Code | Tracked files on local `main` in `C:\Dialecta`, read overnight. Three builder sessions were changing `supabase/`, `apps/web/src/lib/articles.ts`, `/write`, `/api/article` and `/analytics` at the time, so findings there are provisional and go through the convener |
| Database | Live `mguulnibvzusfvyuowwh`, PostgreSQL 17.6, read only through `pg_catalog`, `supabase_migrations` and the unified logs |
| Instruments | The seven checks in `../checks/`, the five tools in `../tools/`, the Supabase advisors, and two read-only sweeps run for this review: the schema the code assumes against the live schema, and the paths the instruction documents name against the tree |
| Not reviewed | Query cost, which needs traffic this database does not have; security posture, which is `security`'s; the legacy `api/` folder, frozen while production serves the `dialecta-api` build |

## First move

**The identity decision** (`exchange/open/2026-09-21-architect-05`). Every table built before it is
settled adds another Ghost-keyed column, one policy already compares the wrong key, and the rows that
would have to move are counted in dozens today.

## Ranked

| # | Finding | Where | Fix | Owner | Record |
| --- | --- | --- | --- | --- | --- |
| 1 | A person is keyed three ways and an article two. 14 of 18 Ghost-keyed person references have no foreign key; `opinion_map_self_read` compares Ghost ids with the JWT `sub`, so no Supabase Auth reader can see their own rows | `checks/identity-columns.sql`; policy on `opinion_map_positions` | Key on `profiles.id` and `articles.id`; Ghost ids become attributes; foreign keys; policies through `profiles.user_id` | `decider`, then `migrator`, `security` | `architect-05` |
| 2 | The migration tree and the live history disagree: 5 files renamed, 3 missing, 2 whose SQL is not what ran, and the unapplied baseline read as pending by the CLI. It recurred two hours after it was first reported | `supabase/migrations/`; `checks/migration-history.sql` | Move the baseline out; rename; recover; reconcile; run the check after every apply | `migrator` | `architect-04` |
| 3 | "forming" is an archetype in the spec, `packages/core` and a dead function, and a confidence level in live | `packages/core/src/archetypes.ts:20-22`; `docs/Dialecta_Data_Architecture.md:157` | Decide the model; drop `initialise_contributor_axes`; make core match | `decider`, then `migrator`, `builder` | `architect-03` |
| 4 | Generated types are two days stale and imported by nothing; four clients carry no `<Database>` | `supabase/types.ts`; `apps/web/src/lib/supabase/{client,middleware,server,service}.ts` | Regenerate, then wire, then fix what `tsc` surfaces. The ast-grep rule is the acceptance | `builder` | `architect-06` |
| 5 | Classification rows cannot say which prompt produced them, though `packages/core/CLAUDE.md:10` requires it, and two classifiers are about to run side by side | `packages/core/src/classification.ts:11-16`; live `classifications` | `prompt_version` and `model` columns, nullable; the comment route writes both | `migrator`, `builder` | `architect-07` |
| 6 | `apps/web` has no tests and no test script; every write path is untested | `apps/web/src/app/api/*`, `auth/callback`, `login/actions.ts`, `middleware.ts` | vitest; the comment route first | `builder` | `architect-06` |
| 7 | CI does not run lint, which passes today | `.github/workflows/ci.yml` | Add lint and dependency-cruiser now; the ast-grep rule after #4 | `builder` | `architect-06` |
| 8 | A free hygiene set: 12 unindexed foreign keys, a CHECK restating the `tier` enum, two spellings of one share channel, six core tables with no comment | `checks/table-hygiene.sql`, `check-value-lists.sql` | One migration, every table under 18 rows | `migrator` | `architect-07` |
| 9 | No shared tsconfig; 8 of 19 options already agree | `apps/web/tsconfig.json`, `packages/core/tsconfig.json` | A root base for the 8; version-enforced keys stay local | `builder` | `architect-06` |
| 10 | Env templates lag the code: 2 names missing from `apps/web`'s, 13 from the root's | `apps/web/.env.example`, `.env.example` | Add them | `builder` | `architect-06` |
| 11 | Dead code: an unused, untyped browser client and an unused root dependency | `apps/web/src/lib/supabase/client.ts`; root `package.json` | Delete or wire; drop | `builder` | `architect-06` |

## Clean, measured

A result is worth as much when it comes back clean, so these are stated with their method:

- 0 legacy column types across 313 columns; row security on 31 of 31 tables.
- 0 dependency violations: no cycles, core never imports web, web reaches core through its barrel
  only. Trustworthy because an unresolvable import now fails the run.
- 0.10% textual duplication. This repository's duplication is semantic, restated value lists and a
  spec against an engine, which is why the catalog checks carry the weight.
- 0 enum drift between the generated types and `pg_enum`.
- Lint passes on every tracked `apps/web` file.
- The two author keys on `articles` agree on 5 of 5 rows; the slug and title copied onto `comments`
  agree on 3 of 3. Both agree by construction and nothing enforces it.

## Decided within this seat's mandate

- The seat's instruments: the seven checks and five tools, pinned, in this folder.
- The order for typed clients, the CI gate ladder, and a root tsconfig base scoped to the options that
  already agree, with project references deferred (`architect-06`).
- Three corrections to this seat's own first sprint, recorded where they were made.

## For Dan

Sent to the convener for `docs/MORNING-AUDIT-2026-09-21.md`: the seat's name; five minutes to give
the seat a read-only, project-scoped database server
(`docs/handoffs/dialecta-handoff-2026-09-21-architect-access.md`); and the two decisions that block
the most, identity and "forming".
