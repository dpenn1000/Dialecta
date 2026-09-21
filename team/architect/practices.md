# architect: practices

*A practice is a rule this seat follows while working. Applied, not argued. Marked `(unsourced)`
until a filed note backs it.*

First training sprint filed 2026-09-20: eight notes, six leads worked, two live examples settled.

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

## Local to this repository

| Practice | Confidence | Evidence |
| --- | --- | --- |
| Pass `project_id` explicitly to the Supabase MCP and confirm the project before reading. `list_projects` misroutes from a subagent session | Settled | 2026-09-20: `list_projects` returned only `qjcozskyopetvigjhlmh`, a different organisation's project. Dialecta's `mguulnibvzusfvyuowwh` is reachable by explicit id and was confirmed by its own table names before anything was read |
| Check the Next.js version before applying anything from current documentation to `apps/web` | Settled | `2026-nextjs-boundary-crossref.md`. The docs serve 16.x, `apps/web/package.json:19` pins 15.5.25, and the `proxy.ts` rename in 16.0.0 has already caused one check to fail open silently |
