# Query cost tools, judged for fourteen rows and for later

**Source:** GitHub REST API, `api.github.com/repos/supabase/index_advisor` and
`.../repos/HypoPG/hypopg`, plus each repo's `/releases/latest`, fetched 2026-09-21.
`supabase/index_advisor`'s own README (`raw.githubusercontent.com`). PostgreSQL's official docs,
"pg_stat_statements" (`postgresql.org/docs/current/pgstatstatements.html`). Supabase Docs pages:
`guides/database/extensions/index_advisor`, `guides/database/extensions/hypopg`,
`guides/database/extensions/pg_stat_statements`, `guides/database/query-optimization`,
`guides/troubleshooting/steps-to-improve-query-performance-with-indexes-q8PoC9`,
`guides/observability/inspect`, `reference/cli/supabase-inspect-db` (and its `index-stats` and
`unused-indexes` sub-pages), and `guides/database/database-linter`, all fetched 2026-09-21.
`use-the-index-luke.com`, fetched the same day. Dialecta's own
`supabase/migrations/20260920000000_baseline_live_schema.sql`, read in full (1,029 lines) for the
foreign-key inventory below. `team/reviewer/knowledge/2026-supabase-database-linter.md` and the
rest of `team/reviewer/`, checked directly for a cross-reference, see the note on that below.

**Lead state:** new. No entry in `reading-list.md` covers query-cost tooling. Proposed at the end
of this note.

## Health first

| Tool | Stars | Last push | Archived | Open issues | Licence | Age |
| --- | --- | --- | --- | --- | --- | --- |
| `supabase/index_advisor` | 1,706 | 2024-04-14 | No | 3 | PostgreSQL | 2023 (3 years) |
| `HypoPG/hypopg` | 1,716 | 2026-09-06 | No | 7 | PostgreSQL | 2015 (11 years) |

Latest releases: index_advisor `v0.2.0`, published 2024-04-03, over two years before this fetch.
HypoPG `v1.4.3`, published 2026-06-19, about three months before it. The GitHub API reported
HypoPG's licence as `NOASSERTION`; its `LICENSE` file opens "Portions Copyright (c) 2015-2018,
PostgreSQL Global Development Group... Portions Copyright (c) 1994, The Regents of the University
of California," the same PostgreSQL-license family index_advisor's own SPDX field names correctly.
Read the file rather than repeat the API's blank, the same correction the companion note makes for
plpgsql_check.

**index_advisor's push date is the most stale figure in either of this seat's two tool notes so
far**, more stale than `madge`'s eight months in the duplicate-logic note, which the mandate already
treats as disqualifying. But index_advisor is not a dependency Dialecta would vendor: it is a
Postgres extension Supabase compiles into its own platform image, documented at
`supabase.com/docs/guides/database/extensions/index_advisor` (fetched 2026-09-21, dated through the
current year) and surfaced directly in Studio's Query Performance report. The bus-factor question
this seat asks everywhere else, "does one person walking away strand this," does not transfer
cleanly: Dialecta's exposure is to Supabase continuing to ship the extension, not to the GitHub
repo taking more commits. A frozen algorithm for a narrowly scoped tool, single-column B-tree
suggestions only by its own docs, is a plausible reason for two years of quiet rather than neglect.
I am naming the figure rather than assuming the benign reading for it.

HypoPG is current by push date and is index_advisor's own dependency: its README describes
index_advisor as using hypopg to test index recommendations without building them, so the cost
comparison happens before anything real exists. HypoPG is also independently listed as a Supabase
extension (`supabase.com/docs/guides/database/extensions/hypopg`), so the same platform-shipped
argument applies to it too.

`pg_stat_statements` gets no row of its own: it ships in Postgres core, not as a separate GitHub
project, so "last push" and "open issues" do not apply to it the way they do to the two extensions
above. What matters instead is availability, and the two Supabase sources I read do not fully
agree on it. The extension's own doc page only says how to switch it on ("Search for
'pg_stat_statements' and enable the extension"), without stating whether that is already done.
A separate description of the same page states plainly that Supabase projects "come with the
pg_stat_statements extension installed" and that it is "enabled by default." I did not resolve
that disagreement by querying Dialecta's own project, because this sprint does not use the
Supabase MCP or any database tool. `select * from pg_extension where extname =
'pg_stat_statements';` is the one query that would settle it, read-only, and it is the first thing
worth running once someone can.

**Settled by the lead the same night**, read only on `mguulnibvzusfvyuowwh` through
`pg_available_extensions`: `pg_stat_statements` 1.11 is **installed**, so query statistics are
already accumulating. `hypopg` 1.4.1, `index_advisor` 0.2.0, `plpgsql_check` 2.8 and `pgtap` 1.3.3
are available and not installed. The "enabled by default" source was right for this project.
Enabling any of the four is a `create extension`, a write to live, and goes through `migrator`.

## What each would let this seat do that it cannot do today

**`pg_stat_statements`** turns "which query is expensive" from a guess into a read of one system
view: `calls`, `total_exec_time`, `mean_exec_time`, and `rows` per normalized statement, constants
folded to `$1`/`$2` so parameterized calls of the same shape group together (PostgreSQL docs). It
is the prerequisite for everything downstream of it in this note: `outliers` reads it directly, and
handing index_advisor a query pulled from it means testing a shape the application sent, not one
guessed by reading the code.

**`index_advisor`** takes one query's literal text and returns the specific `create index`
statement that would help, with the cost before and after, using HypoPG underneath so nothing is
built to find out. Supabase ships it as `create extension index_advisor;`, invoked as
`select * from index_advisor('select ...')`, and the same call backs Studio's Query Performance
report. Its own docs state the scope plainly: "index_advisor will only recommend single column,
B-tree indexes" today, and a generic parameter needs an explicit cast (`$1::int`) when it cannot be
inferred. It does not touch GIN, GiST, or extension-defined indexes (pgvector's HNSW, for one);
those stay a manual question.

**`HypoPG`** is the mechanism underneath both index_advisor and a person doing the same comparison
by hand: a hypothetical index costs the planner nothing to create and nothing to drop, so ten
candidate shapes can be tried in the time one real index takes to build.

**Supabase `inspect db`** exposes thirteen read-only reports over statistics Postgres already
collects, none of them requiring index_advisor or HypoPG: `bloat`, `blocking`, `calls`, `db-stats`,
`index-stats`, `locks`, `long-running-queries`, `outliers`, `replication-slots`, `role-stats`,
`table-stats`, `traffic-profile`, `vacuum-stats`. That list is read directly from
`supabase.com/docs/reference/cli/supabase-inspect-db`, the page generated against the CLI's actual
command tree, and it does not match a second Supabase page I read, the older
`guides/observability/inspect` guide, which still names sixteen including `unused-indexes`,
`index-usage`, `seq-scans`, and `cache-hit`. None of those four resolve to their own reference page
under `reference/cli/supabase-inspect-db-*` any more; `index-stats` and `table-stats` read like
their replacements. **The brief that set up this note named six example subcommands to verify:
`outliers`, `index-usage`, `unused-indexes`, `seq-scans`, `bloat`, `locks`. Three of the six,
`outliers`, `bloat`, `locks`, are in the current CLI reference; three, `index-usage`,
`unused-indexes`, `seq-scans`, are not, and appear to be superseded names still living in an older
guide page that was not revised when the CLI's subcommands were consolidated.** I am treating the
CLI reference as ground truth because it is the page tied to the tool's own command definitions,
not prose about them.

**Use The Index, Luke** (`use-the-index-luke.com`) is not a tool, it is the free web edition of
Markus Winand's book *SQL Performance Explained*, a vendor-agnostic explanation of what an
execution plan is doing (a sequential scan, when an index helps a range condition and when
it does not) aimed at application developers rather than DBAs. Its version-coverage table names
2026-era releases across five engines (MySQL 26.7.0, Oracle 26ai, PostgreSQL through 17, SQL Server
2025), which is the evidence of currency I could find; the homepage carries no separate
last-updated date.

## The honest timing question

With 14 profiles and 3 comments, nothing that depends on accumulated call volume has anything to
accumulate yet. `pg_stat_statements`'s `outliers`/`calls` reports, and an index_advisor run scored
against real traffic rather than a hand-written guess, are **meaningful only once there is
traffic**, not because the tools are broken at low volume but because their whole value is telling
you which of many real shapes costs something, and there are not yet many real shapes.
A `seq-scans` report at 14 rows will likely show Postgres's planner correctly preferring a
sequential scan over any index that exists, which is the planner working, not a reason to build the
index today.

What is **free and useful now**, independent of row count, because it is a property of the schema
and the policies rather than of how often either has run:

- **Every foreign key gets checked for a covering index**, which does not require a single query
  to have run. This is a static property of `create table` and `create index` statements sitting
  next to each other in the same migration file, exactly like the squawk rules in the companion
  note.
- **Every new RLS policy predicate gets an index on the column it filters**, already this seat's
  settled practice from `2026-supabase-rls-performance.md` and `practices.md`; not re-derived here.
- **`pg_stat_statements` and `hypopg` can both be enabled now**, at zero cost, so the day traffic
  exists the tools are already recording it instead of starting the clock late. Enabling either is
  a write this note does not make.

## Concrete Dialecta targets

Read every declared foreign key in the baseline by hand (`references public.` appears 28 times as
an actual constraint, not counting three comment lines that use the phrase "foreign key" in prose
without adding one), then checked each referencing column against every `create index`, `primary
key`, and `unique` in the same file, keeping only where the referencing column is not the leading
column of any index. Recounting from that same list which columns **are** covered (10 of the 28)
lands on the same 18 by subtraction, which is the second method the mandate asks for.

**Eighteen of twenty-eight declared foreign keys have no covering index**, across twelve tables:

| Table | Uncovered FK column(s) |
| --- | --- |
| `admin_role_capabilities` | `capability_id` (second column of the `(role_id, capability_id)` primary key; not a leading column anywhere) |
| `admin_audit_log` | `target_id` (no index at all; `actor_id` on the same table does have one) |
| `profile_admin_capability_grants` | `capability_id`, `granted_by` |
| `profile_admin_roles` | `role_id`, `granted_by` |
| `reserved_handles` | `added_by` |
| `opinion_map_overrides` | `article_id` |
| `classifications` | `comment_id` (not null; the table has no index at all) |
| `axis_events` | `comment_id`, `classification_id` (only `member_id` leads the table's one index) |
| `quotes` | `created_by`, `updated_by` |
| `feedback_items` | `status_changed_by`, `owner_profile_id`, `acknowledged_by` (the table has no index of any kind) |
| `aspirations` | `declaration_fingerprint_id` |
| `profiles` | `current_aspiration_id` |

`classifications` and `feedback_items` are the two worth naming first: `classifications.comment_id`
is `not null` on a table with zero indexes at all, so "the classification for this comment" is a
sequential scan on every call, and `feedback_items` carries three separate FKs to `profiles` and no
index of any kind, on a table shaped for exactly the kind of filtered lookup ("open items I own")
that a support or triage view would run constantly.

**Supabase's own database linter already names this defect class**: `unindexed_foreign_keys`,
confirmed directly at `supabase.com/docs/guides/database/database-linter`, INFO level, description
"indexing foreign key columns is a standard practice for improving query performance." Once this
schema is live and the Advisors panel runs against it, this lint would surface some or all of the
eighteen above without any additional tooling. **I was pointed at
`team/reviewer/knowledge/2026-supabase-database-linter.md` to cross-reference instead of repeating
this. I read that file and the rest of `team/reviewer/` directly and neither mentions
`unindexed_foreign_keys` anywhere.** Reviewer's note covers the linter's ERROR-level rules and a
checklist-coverage table for a different question (columns 6/7/9, definer functions and
column-level grants); it is a real, useful note that does not hold the row I was told to point at.
I am citing the primary source directly instead of a pointer that turned out empty, and
naming the gap so the lead can decide whether reviewer's note should grow a row rather than this
one duplicating it.

## Recommendation

**Adopt now, free regardless of traffic:** indexing the eighteen foreign keys above (or a
subset chosen by whoever owns the migration), and confirming `pg_stat_statements` and `hypopg` are
actually enabled on Dialecta's project rather than assumed to be. Both are schema-shape and
platform-config questions, not traffic questions.

**Adopt as a standing reference, not a dependency:** Use The Index, Luke. Free, vendor-agnostic,
and it carries no supply-chain risk because nothing about it is code Dialecta runs.

**Watch, useful later:** `index_advisor` run against real captured queries, and the `outliers`/
`calls`/`index-stats` family of `inspect db` reports. Both work mechanically today (index_advisor
can score a hand-written query at zero rows) but the value either one returns is bounded by how
representative that input is of what the application actually sends, which needs traffic to know.

**Skip evaluating on GitHub health alone:** neither index_advisor nor HypoPG should be
judged by the usual bus-factor lens, because Dialecta's dependency is on Supabase shipping the
extension, not on the upstream repo's commit cadence. Name the platform-shipped fact instead of
running the standard health check and stopping there.

## What I did not do

I did not run a query against Dialecta's live database. No Supabase MCP tool and no database tool
of any kind, per this sprint's limits. The eighteen unindexed foreign keys are read from migration
text, not cross-checked against `pg_catalog` or the live Advisors panel; the baseline's own sourcing
discipline treats that text as a faithful mirror of live, and this note relies on that rather than
re-verifying it. I did not confirm whether `pg_stat_statements` is actually enabled on Dialecta's
specific project, only that Supabase's own docs disagree about how automatic that is platform-wide.
I did not enable `index_advisor`, `hypopg`, or `pg_stat_statements` anywhere; all three calls in
this note (`create extension ...`) are writes this sprint does not make.

## Implies for

Practice: "a foreign key without a covering index is a schema-shape defect, checkable from the
migration text alone, at any row count; a query-cost defect needs traffic before a number means
anything." Practice: "when pointed at another seat's note to cross-reference, read it before citing
it; if the specific claim is not there, say so and cite the primary source instead of repeating a
pointer that turned out empty." Related: `2026-supabase-rls-performance.md` for the RLS-predicate
half of "index it now," not repeated here; `2026-migration-safety-and-plpgsql-checks.md`, filed
alongside this note, for the same baseline file read by the same method for a different defect
class; `team/reviewer/knowledge/2026-supabase-database-linter.md` for what it does cover.

Proposed reading-list lead: whether Dialecta's live project already has `pg_stat_statements` and
`hypopg` enabled, settled by the one query named above, the next time a session here can use the
Supabase MCP.

*Filed 2026-09-21*
