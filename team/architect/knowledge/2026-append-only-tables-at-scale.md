# Append-only tables at scale

**Sources, fetched 2026-09-21:** PostgreSQL docs, "Table Partitioning"
(postgresql.org/docs/current/ddl-partitioning.html), "Index Types", the BRIN
section (postgresql.org/docs/current/indexes-types.html), and "Routine Vacuuming"
(postgresql.org/docs/current/routine-vacuuming.html); GitHub REST API for
`pgpartman/pg_partman`; Supabase's `pg_partman` extension doc and CLI reference for
`supabase inspect db bloat`; Supabase's Cron guide (supabase.com/docs/guides/cron);
Tiger Data, "When to Consider Postgres Partitioning"; GitHub issue
`supabase/postgres#1586`. Local evidence: `supabase/migrations/
20260920000000_baseline_live_schema.sql` and the row counts in the brief.

The seven tables in scope: `feed_events`, `axis_events`, `share_events`,
`celebration_events`, `notifications`, `admin_audit_log`, `fp_snapshots`. All seven
are select-and-insert only in the baseline file: none carries an update or delete
policy, and `axis_events` additionally has a house rule against ever writing one
(`supabase/CLAUDE.md`: "no update or delete policy, no trigger that rewrites
rows"). Current rows, per the brief: 27 `axis_events`, 6 `feed_events`, the rest
unlisted and smaller still.

## Partitioning, and pg_partman's own gap

Declarative partitioning splits one table into range, list, or hash partitions
that the planner treats as one table for queries and as independent tables for
storage, so a bulk delete of old data can drop a partition instead of running a
row-by-row `DELETE`. The documentation is direct about when this is worth doing:
"these benefits will normally be worthwhile only when a table would otherwise be
very large," and gives one rule of thumb rather than a row count, that the table's
size should exceed the server's physical memory. The same page is equally direct
about the cost of doing it too early: too many partitions lengthen query planning and raise
memory use during planning and execution, and the planner handles "a few thousand
partitions fairly well," not an unbounded number.

Tiger Data's own guidance fills in the number the Postgres docs decline to give:
tables in the tens of millions to billions of rows are where partitioning starts
to pay, and it names three other triggers that can arrive before that row count
does, a high and growing ingestion rate, query performance degrading against a
recent-data slice of an otherwise large table, and `VACUUM` or `REINDEX` runtimes
that have started to matter operationally.

**`pg_partman` is available on this project, whatever the issue tracker says.**
Supabase's own extension guide describes what `pg_partman` automates, creating and
dropping partitions on a schedule so nobody hand-writes that maintenance. The GitHub
API reports the project itself is healthy: 2,824 stars, pushed August 21, 2026, not
archived, 50 open issues against fourteen years of history, an active dependency by
any of this seat's usual measures. Supabase's issue tracker (`supabase/postgres#1586`,
opened May 2025) reports the docs recommending `pg_partman` while `CREATE EXTENSION
pg_partman` failed, and this note first concluded from it that the extension cannot
be installed. **Corrected by the lead against the live catalog on 2026-09-21:**
`pg_available_extensions` on `mguulnibvzusfvyuowwh` lists `pg_partman` 5.3.1,
available and not installed. An issue is evidence about the platform on the day it
was written; the catalog is evidence about this database today. Enabling it is a
write to live and belongs to `migrator` and Dan. Declarative partitioning itself
needs no extension either way.

**Dialecta, by table.** All seven tables sit between five and seven orders of
magnitude below either threshold above, in row count and, at that count, certainly
in memory footprint. Partitioning any of them today would add the planning
overhead the docs warn about for no query it would speed up.

## BRIN, and what a future key change would add to it

A BRIN index stores the minimum and maximum value per block range instead of a
pointer per row, so it is far smaller than a B-tree and cheap to maintain, at the
cost of being useful only when "well-correlated with the physical order of the
table rows." A `created_at` column on an insert-only, never-updated table is close
to the canonical case: new rows append at the end of the table's physical storage
in the same order the timestamp advances.

**Where this meets the primary key question.** `2026-postgres-table-design-standards.md`
found 26 of 31 tables in the baseline file, this seat's seven included, defaulting
their primary key to a version 4 UUID (live has 24 single-column uuid primary keys,
all defaulting to `gen_random_uuid()`, per `2026-live-schema-hygiene-census.md`; the
file and the database differ, and the database is the one to quote), which by
construction has no correlation with anything and would
gain nothing from a BRIN index built on it. A version 7 UUID or a `bigint identity`
key would: both are monotonic, so the key column itself becomes a second,
additive BRIN-friendly column alongside whichever timestamp already exists.
That only matters once one of these tables is large enough for
a BRIN index's size advantage over a B-tree to be worth the correlation
assumption; it does not change what to do today.

**Dialecta, by table.** All seven already lead at least one B-tree index with
their own timestamp column: `feed_events_created_idx`, `axis_events_member_idx`
(trailing on `created_at`), `celebration_events_member_idx` on `occurred_at`,
`fp_snapshots_member_idx` on `captured_at`, and the equivalent on the rest. A
B-tree over 6 to 36 rows costs nothing to keep; BRIN would save nothing measurable
at this size and is worth revisiting at the same row count that makes partitioning
worth revisiting, since both trade on the same size signal.

## Retention and pg_cron

**`pg_cron` is available too.** Supabase's Cron guide states Jobs "can be created
via SQL or the Integrations -> Cron interface inside the Dashboard" today, backed by
the `pg_cron` extension, and the live catalog lists `pg_cron` 1.6.4, not installed.
A scheduled `DELETE ... WHERE created_at < now() - interval '...'`, or a
move-then-delete into an archive table, is one `create extension` away on any of the
seven.

Retention length is a decision this note names rather than makes: it turns
on what each table is for, a product question with no number Postgres itself measures.

**Dialecta, by table, on retention specifically.** `admin_audit_log` is the one
table here where "how long" plausibly has a compliance answer rather than an
engineering one; an audit trail is often kept deliberately longer than operational
data, and that is a decision for whoever owns that policy, independent of row count. The
other six, `feed_events`, `axis_events`, `share_events`, `celebration_events`,
`notifications`, `fp_snapshots`, are read-mostly-recent by their own design, a
feed, a replayed ledger, a notification list, a milestone log, and become retention
candidates once storage or query cost makes it worth acting on, neither of which is
true yet at current row counts.

## Autovacuum on tables that never update or delete

Autovacuum has an insert-driven trigger separate from its update/delete-driven
one, specifically for append-only tables: a table is vacuumed once accumulated
inserts cross a threshold governed by `autovacuum_vacuum_insert_scale_factor`, even
with zero updates or deletes, because rows still need freezing against transaction
ID wraparound and marking all-visible to enable index-only scans. The documentation
adds that lowering `autovacuum_freeze_min_age` on an insert-only table lets those
freezes happen earlier. `supabase inspect db bloat`, confirmed against the CLI
reference (`supabase inspect db bloat`, with `--db-url`, `--linked`, or `--local`),
reports estimated bloat and wasted space per table and index, one command, no SQL
to write by hand.

**Dialecta, by table.** Six of the seven, every one but `fp_snapshots`, either
carry no update or delete policy in the baseline or, for `axis_events`, a
contractual rule against ever writing one, so the update/delete bloat path this
tuning normally targets does not apply to them; the insert-driven path is the one
that would. Nobody has set a per-table `autovacuum_vacuum_insert_scale_factor` on
any of the seven, which is the correct amount of attention at 6 to 36 rows each.
`fp_snapshots` is the one table without an explicit house rule against updates in
`supabase/CLAUDE.md`; confirming nothing in the application ever updates it is a
one-line check outside this note's scope, worth naming rather than assuming.

## Table-by-table verdict

| Table | Partitioning | Key type (see companion note) | Other |
| --- | --- | --- | --- |
| `feed_events` | Do nothing yet; revisit at tens of millions of rows or a `created_at` query plan that stops using its own index well | Decide now: the platform's own activity feed, plausibly its highest-volume table once real usage starts | Retention candidate once volume makes it worth acting on |
| `axis_events` | Do nothing yet; same row-count trigger, and the contractual append-only rule makes it the cleanest range-on-`created_at` candidate of the seven when that day comes | Decide now, same reasoning | None beyond retention, later |
| `share_events` | Do nothing yet; smallest and lowest-signal of the seven | Decide now, low cost either way at this size | No read pattern named yet worth optimizing around |
| `celebration_events` | Do nothing yet | Decide now | Same as `share_events` |
| `notifications` | Do nothing yet | Decide now | Has a real per-user read path (`notifications_recipient_idx`) today; a retention policy on read, old notifications is worth more than partitioning before either is urgent |
| `admin_audit_log` | Do nothing yet; four columns, negligible rows | Lower priority than the other six; an audit trail's write pattern matters less than its retention policy | Decide retention now, a policy question worth settling before volume forces an answer |
| `fp_snapshots` | Do nothing yet | Decide now | Confirm its update/delete posture before assuming the insert-only autovacuum path is the only one that applies |

## What I did not do

Did not run `pg_cron`, `pg_partman`, or `supabase inspect db bloat` against the
live project, and did not query live for actual row counts, table size, or bloat;
every Dialecta number above is the brief's own count or a read of the baseline
file. Did not price Atlas or any hosted drift-monitoring tool, which is migrator's
open lead. Did not revisit enum against `CHECK` against a lookup table for
`event_type` or any other column on these seven tables, which is the lead's own
note. Did not attempt to install `pg_partman` to confirm the GitHub issue firsthand.

## Implies for

Practice: an append-only table's partition key and retention policy are questions
to answer from a row count and a query plan, not from a calendar; naming the
threshold now (tens of millions of rows, or a `VACUUM` that has started to take
operationally noticeable time) means the seven tables above get revisited on a
number, independent of whether anyone remembers to ask. Related:
`2026-postgres-table-design-standards.md`, whose primary-key-generator finding is
the one decision here worth making before any of these seven has real volume,
since it is free now and only grows more expensive; and
`team/migrator/knowledge/2026-event-sourcing-ledger-replay.md`, whose replay design
for `axis_events` is why that table in particular has no read path older than its
own replay boundary, which is what makes it the safest of the seven to partition
first once the row count warrants it.

*Filed 2026-09-21*
