# architect: practices

*A practice is a rule this seat follows while working. Applied, not argued. Marked `(unsourced)`
until a filed note backs it.*

First training sprint filed 2026-09-20: eight notes, six leads worked, two live examples settled.
Second sprint, 2026-09-21: twelve notes, eight catalog checks, six calibrated tools, one pinned
library.

## From the charter

| Practice | Confidence | Evidence |
| --- | --- | --- |
| Every finding names the file, the line and the fix, and the list is ranked | Settled | `.claude/agents/architect.md`, the seat's founding constraint. An unranked list of possible problems is the documented failure mode of a quality seat |
| State the method on every count, and re-derive by a different method before filing | Settled | Three line counts were wrong in this repository on 2026-09-20, each from a method nobody stated. `.claude/skills/dialecta-research/SKILL.md`, "question your own finding" |

## From research

| Practice | Confidence | Evidence |
| --- | --- | --- |
| Read schema, type, constraint and grant facts from `pg_catalog`. Never from `information_schema` or `supabase/types.ts` when the answer decides something | Settled | `2026-information-schema-vs-pg-catalog.md`. One query, both methods: `information_schema` reported no anon grant on four functions the catalog says anon can execute |
| Verify a schema claim at the point of use even when a filed note already asserts it | Settled | `2026-live-baseline-unverified-markers.md`. `migrator` stated that `types.ts` cannot show check constraints, then concluded `feed_events.event_type` was unconstrained; live has a 12-value CHECK, and the baseline migration inherited the error by citing the note |
| Never adopt another seat's count. Re-derive it, or name the difference and leave both standing | Settled | `2026-live-baseline-unverified-markers.md`: 26 markers by my rule against 27 in the brief, unreconciled and both recorded. Also 90 tests by grep against 95 by `vitest run`, where the run was right |
| A type that narrows a domain is checked where it is written back, not only where it is read | Settled | `2026-live-opposing-view-fold.md`. The boolean fold in `packages/core` is harmless; the widening at `apps/web/src/app/api/comment/route.ts:260` is what destroys `partially` |
| Measure the cost of a standards change before proposing it. A probe config and a dry run turn an opinion into a number | Settled | `2026-typescript-strict-family.md`. Two stricter flags in `apps/web` produce zero errors across 28 files, which is what makes the proposal actionable rather than arguable |
| A setting that is on in one workspace is on in all of them, or the difference is written down | High | `2026-typescript-strict-family.md`. No root config and no `extends`, so `packages/core` and `apps/web` diverge on four options with nothing recording why |
| Judge a dependency on last push, open issues, licence and bus factor before reading its description, and check a remembered claim about it against its own README | Settled | `2026-duplicate-logic-tool-landscape.md`. `madge` has 10k stars and no push in eight months; I was about to assert a `ts-prune` deprecation notice that does not exist |
| Revoke a Postgres default globally. The per-schema form is accepted, returns success, and does nothing | Settled | `2026-postgres-alter-default-privileges.md`, quoting the documentation: per-schema default privileges "can only add privileges to the global setting, not remove privileges granted by it" |
| A new RLS policy names its role and wraps every function call in a subselect, and any column it filters on gets an index in the same migration | High | `2026-supabase-rls-performance.md`. Four of the six mechanisms are text-only changes, free while a policy is being written and a rewrite afterwards |
| Search the notes index before searching the web | Settled | `2026-nextjs-boundary-crossref.md`. `builder` had already filed the primary source for lead 4; re-fetching it would have produced a duplicate note and a fake second data point |
| When a control depends on a function's behaviour, read `pg_get_functiondef` rather than its name or its comment | Settled | `2026-postgres-alter-default-privileges.md`: `initialise_contributor_axes` looked like an open door until `prosecdef` showed SECURITY INVOKER, and I nearly filed a false alarm. The same read found the enum bug in `2026-live-baseline-unverified-markers.md` |
| Cost a finding as now against later, with the row count that makes the difference concrete | High | `2026-live-opposing-view-fold.md`. Three rows live means the fix is free today; the cost is one irreversibly flattened row per comment from here on |

## From the second sprint, 2026-09-21

| Practice | Confidence | Evidence |
| --- | --- | --- |
| A tool's verdict is a claim and its coverage is the evidence. Run a known-answer control, and make an input the tool cannot resolve a failure, never a silent gap | Settled | `../tools/README.md`: three runs reported clean and were wrong, two of them dependency-cruiser seeing half the graph |
| Re-run the check after the fix. A fix read from its own migration text is a claim | Settled | `2026-live-forming-three-against-one.md`: the first revoke read as closed in its migration and in two documents, and `anon` could still execute the function |
| Close a function to a role only when `has_function_privilege` says so. Never read the ACL for the role's own entry: PUBLIC grants to everyone | Settled | Same note. The revoke removed `anon=X` and left `=X` |
| Before recommending a schema option, cite what the spec says. "Live did it deliberately" is not a reason under the house rule that the spec wins | Settled | Same note, correcting this seat's own first-sprint ranking |
| A literal that names a stored value comes from `Constants` or sits under a test that compares it with the catalog | High | `2026-enum-and-check-lists-against-unions.md`: five enums restated by hand; the `forming` constant is what a restatement does when it goes wrong |
| A migration file is named after it is applied, from the version live records, and a check compares the tree with `schema_migrations` by version and by content | Settled | `2026-migration-history-against-live.md`: 2 of 31 matched by version; content matched for all five tracked files once comments were stripped |
| An applied migration file stays as it ran. A data backfill that must survive `db reset` is made reset-safe before it is applied, or kept out of the replayed path | High | Same note, re-run: a fix commit edited `20260921041504` after it was applied, and only the content comparison caught it. The convener showed that a follow-up migration cannot repair it, because `db reset` replays the original first |
| Identify a column by its values as well as its name | High | `2026-live-schema-hygiene-census.md`: `opinion_map_positions.reader_id` escaped the name pattern and holds Ghost ids that no Supabase Auth `sub` will ever equal |
| Judge an `unused_index` finding against traffic, never alone | High | Same note: 40 unused indexes on a database with 3 comments says nothing about need |
| A syntactic rule is bound to its import, or it matches every function that shares the name | Settled | `../tools/README.md`: 14 flagged sites became the 4 real ones |
| The live catalog, not an issue tracker or a doc, says what the platform offers | Settled | `2026-append-only-tables-at-scale.md`, corrected: an issue said `pg_partman` cannot be installed and `pg_available_extensions` lists 5.3.1 |
| A vendor rulebook is pinned by tag and commit, never by the version it states about itself, and checked against the framework versions this repository pins | High | `2026-vendor-agent-rulebooks.md`: Supabase's file said 1.1.1 at tag v1.6.0; two Vercel rules need React 19.2 against a pinned 19.1 |
| Name a check's fitness-function type before building it. Its scope and cadence decide where it lives | High | `2026-architectural-fitness-functions.md` |
| A linter that reads SQL text is judged by the defect class it cannot see. A clean squawk run means "will not lock", never "fits live" | High | `2026-migration-safety-and-plpgsql-checks.md` |
| A table's key generator and its foreign keys' indexes are decided in the migration that creates it | High | `2026-postgres-table-design-standards.md`; `2026-live-schema-hygiene-census.md` found 12 foreign keys without an index, all on tables of 17 rows or fewer |
| An append-only table's partition key and retention are set from a row count and a query plan, not a calendar | High | `2026-append-only-tables-at-scale.md` |
| A setting a build tool enforces by version stays in the workspace that tool manages, never only in a shared base | High | `2026-shared-tsconfig-base.md`: Next.js requires `jsx: preserve` on 15.5.25 and `react-jsx` on canary |
| Read another seat's note before citing it for a claim | Settled | `2026-postgres-query-cost-on-live.md`: the lead's own brief said `reviewer`'s linter note covered unindexed foreign keys, and it does not |

## Local to this repository

| Practice | Confidence | Evidence |
| --- | --- | --- |
| Pass `project_id` explicitly to the Supabase MCP and confirm the project before reading. `list_projects` misroutes from a subagent session | Settled | 2026-09-20: `list_projects` returned only `qjcozskyopetvigjhlmh`, a different organisation's project. Dialecta's `mguulnibvzusfvyuowwh` is reachable by explicit id and was confirmed by its own table names before anything was read |
| Check the Next.js version before applying anything from current documentation to `apps/web` | Settled | `2026-nextjs-boundary-crossref.md`. The docs serve 16.x, `apps/web/package.json:19` pins 15.5.25, and the `proxy.ts` rename in 16.0.0 has already caused one check to fail open silently |
| Run dependency-cruiser from inside each workspace, with TypeScript installed beside it. From the root it cannot resolve `apps/web`'s `@/` aliases, because `paths` has no `baseUrl` | Settled | `../tools/README.md` |
| Measure code in the tree by tracked files only. Three builder sessions share the main working tree, and their uncommitted files are not the code under review | Settled | `../tools/README.md`: every calibration run passes `git ls-files` |
| Read `.env` never. The service key's two names are documented in two templates, and the contract check reads the templates, not the secrets | Settled | `docs/handoffs/dialecta-handoff-2026-09-21-architect-access.md` |
