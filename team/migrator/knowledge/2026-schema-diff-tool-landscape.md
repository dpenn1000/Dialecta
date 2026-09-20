# Schema diffing and drift-detection tools outside the Supabase CLI

**Source:** GitHub Search API (`api.github.com/search/repositories`) and direct repo
lookups (`api.github.com/repos/<owner>/<repo>`), fetched 2026-09-20, for `djrobstep/migra`,
`ariga/atlas`, `sqldef/sqldef`, `sqitchers/sqitch`, and `supabase/cli`. Corroborated
against atlasgo.io/monitoring/drift-detection, fetched 2026-09-20. Verified: all five
repositories exist and the figures below are read directly from each API response, not
estimated.

**Lead state:** not a reading-list entry; this is the dedicated tool search the skill's
"Finding tools and repositories" section asks for, run alongside the five leads above.

## Summary

| Tool | Stars | Last push | Archived | Open issues | Licence | What it is |
| --- | --- | --- | --- | --- | --- | --- |
| `djrobstep/migra` | 3,048 | 2025-08-25 | No | 88 | The Unlicense | Postgres schema diff. Self-described **DEPRECATED** in its own GitHub description |
| `ariga/atlas` | 8,733 | 2026-09-20 (today) | No | 274 | Apache 2.0 | Schema-as-code migrations, HCL or SQL, plus a hosted drift-detection/monitoring product |
| `sqldef/sqldef` | 3,167 | 2026-09-20 (today) | No | 20 | "Other" (verify text before adopting) | Idempotent apply: run the desired `CREATE TABLE` against a live DB and it computes and runs the diff |
| `sqitchers/sqitch` | 3,162 | 2026-09-14 | No | 84 | MIT | Deploy/revert/verify change management, Perl-native, dependency-graph between changes rather than timestamp order |
| `supabase/cli` (for reference) | 2,419 | 2026-09-19 | No | 71 | none listed on GitHub API | Bundles its own `pg-delta` engine; see `2026-supabase-db-pull-diff-engines.md` |

`pg-delta` itself is not a standalone repository. It is Supabase's in-house engine,
shipped inside `supabase/cli` and reachable only through that CLI's flags. There is
nothing to independently evaluate as a separate dependency; evaluating it means
evaluating `supabase/cli`, which this repo already depends on.

Atlas's drift detection is real and specific: "Before applying any migration files,
Atlas makes sure your database wasn't silently changed outside of migrations... If it
was, the deploy is aborted and the exact diff is shown." It runs as a pre-apply gate
and as continuous monitoring, via either an agent in the database's VPC or a GitHub
Action reporting to an Atlas Cloud control plane. The core diff/migration engine is
open source (Apache 2.0); the hosted monitoring, alerting, and auto-generated ER
diagrams described on the fetched page read as an Atlas Cloud product, and this note
did not confirm pricing or a free tier before writing it up. Confirm before adopting
anything beyond the CLI.

## What this implies for Dialecta

**None of these replace the Supabase CLI for this repo's actual job.** `db push` reads
and writes `supabase_migrations.schema_migrations`; that table is what makes "has this
already run against live" answerable at all, and it is Supabase-specific. Atlas,
sqldef, and sqitch all have their own, different notions of applied-state tracking, and
adopting any of them as the primary tool means either running two migration histories
against the same database or abandoning the one Supabase already maintains with 20
real entries in it. That cost is not worth paying for a repo already committed to
`supabase/cli`.

**Where a second, independent tool earns its place: drift detection as a standing
check, not as the migration mechanism.** Atlas's pre-apply "was this database silently
changed outside of migrations" gate is exactly the failure this project already lived
through. Had something like it existed against `mguulnibvzusfvyuowwh` before the
September scaffold was written, it would have flagged 32 tables the incoming migration
did not expect, mechanically, instead of the fact surfacing 35 minutes into a session by
accident (`2026-09-19-001`'s appended correction). This is a plausible future practice,
not a today action: it requires either a hosted Atlas account or the self-hosted
agent, and this sprint did not evaluate either against Dialecta's own compliance or
cost posture.

**migra should not be reached for.** It is the default engine inside the Supabase CLI
today (per `2026-supabase-db-pull-diff-engines.md`) and that dependency is inherited,
not chosen. But nothing in this repo should add a *direct* dependency on
`djrobstep/migra` itself: no recent commits, 88 open issues, and the maintainer's own
description says deprecated. Prefer `--diff-engine pg-delta` wherever the CLI allows
choosing.

**sqldef and sqitch are both credible, actively maintained tools with no clear opening
here.** sqldef's idempotent-apply model is a genuinely different mechanism (converge to
a declared `CREATE TABLE`, not track a migration sequence) that could suit a from-scratch
project; it is a worse fit for a database that already has 20 applied migrations to
respect. sqitch is mature and dependency-graph-based rather than timestamp-based,
which is a real answer to "what if two migrations need to apply in a specific order
that is not their filenames," a problem this repo does not currently have.

## Judged, per the mandate's own bar (last release, open issues, licence, bus factor)

- **migra**: fails on last release and momentum. Inherited-only, do not add directly.
- **Atlas**: passes. Company-backed (Ariga), daily commits, large issue count is a
  function of scale and visible triage, not neglect. Apache 2.0 core. Worth a future,
  separate evaluation specifically for drift monitoring, not for migration authoring.
- **sqldef**: passes on activity and licence signal, "Other" licence needs a manual
  read before anything depends on it. No opening for this repo's shape of problem.
- **sqitch**: passes on maturity (est. 2012, MIT, still committed to this month), but
  solves an ordering problem this repo does not have. Its Python reimplementation
  (`Ovid/sqlitch-v2`) is real but immature (4 stars); do not substitute it for the
  Perl original if sqitch is ever adopted.

## Implies for

Practice: "drift detection is a candidate standing practice, evaluated separately from
migration authoring; Atlas is the lead if it is pursued." No backlog id yet; this is a
tool-adoption question for `decider`, not a migration to write. Related:
`2026-supabase-db-pull-diff-engines.md`.
