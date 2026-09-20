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

## Filed 2026-09-20

Four of five confirmed as asked, several sharpening the practice past what the lead
anticipated. One was partially falsified: the branching lead's implicit assumption
(carried from `p0-2-runbook.md` Branch B) that a branch is simply "a copy of
production" holds for schema and not for data, which branches empty by default. Also
run this sprint, outside the reading list: the dedicated tool search the skill's
"Finding tools and repositories" section asks for, filed as a sixth note.

| State | Lead | Why this agent needs it | Verified |
| --- | --- | --- | --- |
| filed | `supabase db pull` in migration mode against `--declarative`, and the `migra` against `pg-delta` diff engines | Confirmed by running `--help` against the actual installed CLI (2.117.0) rather than reading docs. `--declarative` behaves exactly as `p0-2-runbook.md` step 6 assumed. New finding: migra and pg-delta are not rival tools, they are two engines inside one CLI, and migra (upstream-deprecated) is still the CLI's default for `db diff` | `2026-supabase-db-pull-diff-engines.md` |
| filed | Testing RLS policies: `pgTAP`, `supabase test db`, or a query against `pg_policies` | Confirmed. `pg_policies` is inspection only; `pgTAP`'s `policies_are()` / `policy_roles_are()` / `policy_cmd_is()` are the assertions, run via `supabase test db`. Needs Docker, unavailable on studio-pc today | `2026-supabase-pgtap-rls-testing.md` |
| filed | Supabase branching: what a branch copies, what it costs, and whether it carries data | Partially **falsified**. Config and Edge Functions clone automatically; data does not, by design ("to better protect your sensitive production data"), and needs an explicit opt-in. Cost is metered, about $9.70/month for a persistent branch, Pro plan or above | `2026-supabase-branching.md` |
| filed | Event sourcing: replaying a ledger against incrementally accumulating, and what each costs to correct | Confirmed, though sourced from a survey of consistent accounts rather than one authority (flagged in the note itself). The asymmetry that matters: live's 27 `axis_events` rows cannot be reconstructed into a delta history because the source information was never captured, only its cumulative effect | `2026-event-sourcing-ledger-replay.md` |
| filed | `ALTER TABLE ... ALTER COLUMN TYPE uuid USING ...` on a populated column, and the coordinated remap | Confirmed (ACCESS EXCLUSIVE lock, full table rewrite) and extended: a bare `::uuid` cast would fail outright on Ghost-sourced text ids, which this schema has by design. Expand-contract, not a single statement, is the only safe path | `2026-postgresql-column-type-remap.md` |
| n/a | Tool search (not a reading-list lead): schema diffing and drift detection outside the Supabase CLI | migra, Atlas, sqldef, sqitch judged on last release, open issues, licence, bus factor. Atlas is the one live candidate, for drift detection specifically, not for migration authoring | `2026-schema-diff-tool-landscape.md` |

## Open

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | Atlas Cloud drift-detection pricing, self-hosted agent requirements, and whether either fits Dialecta's data-handling posture | `2026-schema-diff-tool-landscape.md` found the diff engine free (Apache 2.0) but the monitoring/alerting/ER-diagram layer reads as a hosted product. Price and a free tier were not confirmed before naming Atlas as the lead candidate for drift detection |
| todo | Whether every live `member_id` value can resolve to a `profiles.user_id` uuid via `ghost_member_id`, or whether some rows have no Supabase identity yet | `2026-postgresql-column-type-remap.md` found the naive cast would fail on Ghost-only rows. The backfill step's actual success rate against live data is unmeasured and prices Branch C's single largest item |
| todo | Supabase CLI PR #6391's default-diff-engine flip: whether and when pg-delta becomes the default, given a companion docs PR was already reverted once in September 2026 | Determines whether `--diff-engine pg-delta` needs to stay an explicit, permanent habit or only until the next CLI upgrade. `2026-supabase-db-pull-diff-engines.md` is the note this would revise |
