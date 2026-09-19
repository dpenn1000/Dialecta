# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

## Filed 2026-09-19

All five seeded leads pointed at sources that exist and say what they claim, so none
are `dead`. Two carried a rationale that the same sprint falsified. The source and the
reason for reading it are marked separately below, because a good source reached for a
wrong reason is still worth recording as both.

| State | Lead | Why this agent needs it | Verified |
| --- | --- | --- | --- |
| filed | Supabase local development and the migration workflow: `db push`, `db reset`, `db lint` | Original reason **falsified**: P0-2 does not run this against `dialecta-staging`, which does not exist and may never. The failure modes still mattered, and one of them is now the central fact: `db push` reads the remote history table, so the repo's two files would run against live and collide | `2026-supabase-migration-workflow.md` |
| filed | Postgres enum evolution: `ALTER TYPE ADD VALUE`, and what it cannot do | Half **falsified**. "Removing a value is the trap" is correct and removal is unsupported. "`tier` is the enum at risk" is wrong: the live `tier` enum is identical to the repo's seven values. The real traps are `fp_snapshot_reason`, `comment_status` and `archetype_id`. Also learned: `RENAME VALUE` is supported | `2026-postgresql-enum-evolution.md` |
| filed | Supabase declarative schemas | Confirmed as asked, including the case against. The answer is no: the diff engine does not capture RLS policies, which is the invariant this repo cares about most | `2026-supabase-declarative-schemas.md` |
| filed | Postgres check constraints and domains for bounded values | Confirmed. The answer is to keep both as column checks. Neither bound is reused, and a domain constraint is not revalidated when it changes, which is a live hazard for `graduation_count` | `2026-postgresql-domains-vs-checks.md` |
| filed | Supabase type generation into `supabase/types.ts`, and how it drifts | Confirmed, and it found a worse drift than the lead anticipated: the generator maps `text` and `uuid` both to `string`, so the file cannot settle the Phase 1 against Phase 2 identity question | `2026-supabase-type-generation-drift.md` |

## Open

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | `supabase db pull` in migration mode against `--declarative`, and the `migra` against `pg-delta` diff engines | The 2.117.0 help says migration mode "may record them in that database's migration history", which makes the obvious command unsafe against live. `p0-2-runbook.md` step 6 depends on `--declarative` behaving as documented, and that is read from help text rather than tested |
| todo | Testing RLS policies: `pgTAP`, `supabase test db`, or a query against `pg_policies` | `supabase/types.ts` cannot show policies, so the mandate's central invariant is the one thing this agent currently cannot verify on any database. Needed before any claim that live RLS is or is not sound, and `028_pre_launch_security_hardening` is unread |
| todo | Supabase branching: what a branch copies, what it costs, and whether it carries data | Option 2 in `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md` is "branch from live", and nobody has checked whether it does what that option assumes. Branch B of `p0-2-runbook.md` rests on it |
| todo | Event sourcing: replaying a ledger against incrementally accumulating, and what each costs to correct | `axis_events` has `delta` in the spec and the repo and no delta live, so live counts where the spec sums. `supabase/CLAUDE.md` locks replay. The tradeoff should be understood before the reconciliation in branch C prices it |
| todo | `ALTER TABLE ... ALTER COLUMN TYPE uuid USING ...` on a populated column, and the coordinated remap | The spec's Identity Types section promises exactly this migration for Phase 2, and nine of the thirteen tables in the diff turn on it. It is the single largest piece of work in branch C and no one has costed it |
