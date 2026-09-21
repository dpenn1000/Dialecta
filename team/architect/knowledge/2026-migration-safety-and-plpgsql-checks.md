# Two migration checks, judged before either ran

**Source:** GitHub REST API, `api.github.com/repos/sbdchd/squawk` and `.../repos/okbob/plpgsql_check`,
plus each repo's `/releases/latest`, fetched 2026-09-21. Rule names and text from
`squawkhq.com/docs/rules` and the individual rule pages under `squawkhq.com/docs/<rule-name>`,
fetched the same day. Tool mechanics from each project's own README
(`raw.githubusercontent.com/sbdchd/squawk/master/README.md` and
`.../okbob/plpgsql_check/master/README.md`). Supabase availability from
`supabase.com/docs/guides/database/extensions/plpgsql_check`. The literal-to-enum coercion
mechanism from PostgreSQL's own docs, "Enumerated Types" and "Type Conversion: Overview"
(`postgresql.org/docs/current/`). The two migration files read directly:
`supabase/migrations/_archived_2026-09-19/20260919000100_articles_native.sql` and
`_recovered/supabase/migrations/028_pre_launch_security_hardening.sql`. The live enum value lists
from `supabase/migrations/20260920000000_baseline_live_schema.sql:105-114`, read in full (I read
the entire 1,029-line file for this note and the companion one). The function's confirmed failure
mechanism is `team/architect/knowledge/2026-live-baseline-unverified-markers.md`'s finding,
cited here, not re-derived.

**Lead state:** new. No entry in `reading-list.md` covers migration linting or PL/pgSQL static
analysis. Proposed at the end of this note.

## Health first

| Tool | Stars | Last push | Archived | Open issues | Licence | Age |
| --- | --- | --- | --- | --- | --- | --- |
| `sbdchd/squawk` | 1,182 | 2026-09-20 | No | 46 | Apache-2.0 | 2020 (6 years) |
| `okbob/plpgsql_check` | 779 | 2026-09-20 | No | 0 | MIT | 2013 (13 years) |

Latest releases: squawk `v2.65.0`, published 2026-09-10. plpgsql_check `v2.10.10`, published
2026-09-16. Both shipped inside the two weeks before this fetch.

The GitHub API reported plpgsql_check's licence as `NOASSERTION`, which is the detector giving up,
not an unlicensed project. `raw.githubusercontent.com/okbob/plpgsql_check/master/LICENSE` opens
with the standard MIT grant; I read the file rather than repeat the API's blank. The companion
note on query-cost tooling hits the same gap on HypoPG.

Both projects are single-name accounts, not orgs: `sbdchd` and `okbob`. Squawk's subscriber count
is 3 against 1,182 stars, the same thin bus-factor shape the duplicate-logic note flagged on
`ts-prune`. Squawk is more than a script, though: its own README lists a GitHub Action, a pre-commit
hook, a Docker image, a VS Code extension, and a WASM playground at `play.squawkhq.com`, more
surrounding investment than one person walking away would erase overnight. plpgsql_check's 0 open
issues after 13 years, 779 stars, and 24 subscribers reads as the opposite shape: not neglect (it
pushed the day of this fetch and cut a release four days before it), but a narrow, expert-run tool
with one name behind it the whole time. `okbob` is Pavel Stehule, a long-standing PL/pgSQL
contributor; that is a name check against the commit history's own thirteen years, not a claim I
verified beyond it.

## What each would let this seat do that it cannot do today

**Squawk lints migration SQL text for lock and safety hazards. It never touches a live database.**
Its own README says so in one line: it "performs no live database connectivity or state
inspection," building a parse tree from the SQL text and running rules against that structure
alone. That sentence decides most of what follows.

The rule index at `squawkhq.com/docs/rules` lists 40 rules. The ones that bear on Dialecta's two
files: `adding-not-nullable-field`, `adding-required-field`, `adding-field-with-default`,
`constraint-missing-not-valid`, `disallowed-unique-constraint`, `require-concurrent-index-creation`,
`require-concurrent-index-deletion`, `changing-column-type`, `prefer-text-field`,
`prefer-timestamptz`, `prefer-bigint-over-int`, `prefer-bigint-over-smallint`, `prefer-identity`,
and `require-table-schema`.

**On `_archived_2026-09-19/20260919000100_articles_native.sql`:** its only DDL is one
`alter table public.articles add column` with four `not null default` columns (`body_json`,
`body_html`, `status`, `declared_claims`) and three plain adds. Every default is a constant
(`'{}'::jsonb`, `''`, `'draft'`, `'[]'::jsonb`), not a volatile expression. `adding-field-with-default`
draws exactly this line itself: on Postgres 11 and later, "a field with a non-VOLATILE DEFAULT will
not require a table rewrite," and gives that as its own safe example. Supabase's platform default is
Postgres 17 now, 14 the oldest still supported, so the fast path applies to a real Dialecta project.
Squawk only applies it if told to, through `--pg-version`, and neither the docs nor my search of
them state what the linter assumes when the flag is absent. I did not find that answer. A Dialecta
config should set `--pg-version` explicitly rather than trust an unstated default. Flag set
correctly, squawk waves this file through clean on the lock-safety axis.

**It says nothing about the file's two real defects.** `status text not null default 'draft'`
collides with a `status` column the baseline confirms already exists live
(`20260920000000_baseline_live_schema.sql:429`), and the file's policies read
`auth.uid() = author_id` against a table whose live column is `author_member_id`. Both are
catalog-truth errors, true only once you check what the target already holds. Squawk has no rule
that reads a target catalog, and none of the 40 touch `create policy`, `using`, or `with check`. It
parses the policy clause as syntactically valid SQL and stops there. **The class line to hold:
squawk catches a statement that is unsafe in general; it cannot catch a statement that is wrong
about this specific database**, because it never reads this specific database.

**On the baseline (`20260920000000_baseline_live_schema.sql`):** every table in it is `create
table`, not `alter table`. The lock-hazard rules reason from harm to existing rows and concurrent
readers, which a brand-new, empty table cannot have, and `require-concurrent-index-creation` says
the parallel exemption outright: "this rule ignores indexes added to tables created in the same
transaction." Every `create index` in the file, twenty-four by my count (twenty-three plus one
`create unique index`), follows a `create table` earlier in the same file, so none would fire.
I could not find the same exemption written down for `constraint-missing-not-valid`. The baseline
adds eight `check` constraints and one foreign key by separate `alter table ... add constraint`
after each table's own `create table`, none `not valid`: `profiles_subscription_tier_check`,
`axis_events_source_check`, `tier_nominations_target_tier_check`, `tier_nominations_reason_key_check`,
`share_events_surface_type_check`, `share_events_channel_check`, `celebration_events_event_type_check`,
`aspirations_status_check`, and the deferred `profiles_current_aspiration_id_fkey`. Read literally,
the rule's trigger (a constraint added without `not valid`) is present nine times. Two more
statements, `axis_scores_member_axis_unique` and `tier_nominations_comment_id_member_id_key`, are
`unique` constraints added the same way; Postgres has no `not valid` option for `unique` at all, and
squawk has a separate rule for exactly this shape, `disallowed-unique-constraint`, whose own example
is the identical pattern. Whether squawk's engine extends the same-transaction exemption from the
index rule to either constraint rule is not settled by anything I read. The one-line test is running
squawk against this file once a binary exists in this environment, which is not mine to install this
sprint.

**One real, present-tense hit, of a different kind than the lock rules.**
`prefer-bigint-over-int` is a foresight rule, not a lock rule: it argues for `bigint` at
table-creation time so the type never needs changing later, and nothing about a fresh table exempts
it. The baseline declares four plain `integer` columns: `classifications.specificity_score`,
`opinion_map_positions.map_index`, `sparring_partners.article_count`, `quotes.year`. All four would
trigger, live rows or not.

**Checked and clean, by the same method** (grep for the trigger shape across both files, then read
the rule that would apply): no `varchar(n)` or `char(n)` anywhere (`prefer-text-field` silent), no
bare `timestamp` without a zone, every timestamp column in the schema is already `timestamptz`
(`prefer-timestamptz` silent), no `serial` or `bigserial` anywhere, every primary key is
`uuid default gen_random_uuid()` or a natural text key (`prefer-identity` silent), no
`alter ... alter column ... type` anywhere (`changing-column-type` silent), and every table
reference in both files is schema-qualified `public.x` (`require-table-schema` silent). A sweep
that reports only hits misrepresents a tool; these are the rule firing correctly on code that does
not need it.

**plpgsql_check reads a function's body without running it**: active mode via
`select * from plpgsql_check_function('fn()')`, or passive mode preloaded so every call gets
checked as it executes. Its README lists what it looks for: unused variables and arguments, dead
code after `return`, a missing `return`, a reference to a field that does not exist on a row or
record (including `new`/`old` inside a trigger), "checks fields of referenced database objects and
types inside embedded SQL," hidden casts that would silently block an index, and unsafe `execute`
usage. Its stated reason for existing is one line: you "see exactly the errors [that] would occur at
runtime" without waiting for runtime.

**Would it catch `initialise_contributor_axes()`?** The function
(`_recovered/supabase/migrations/028_pre_launch_security_hardening.sql:84-86`) inserts the literal
`'forming'` into `archetypes.archetype_id`, an eight-label enum confirmed at
`20260920000000_baseline_live_schema.sql:108` (`advocate, builder, contextualist, empiricist,
illuminator, reviser, skeptic, synthesizer`). `forming` is not one of the eight; it is a label of
the neighboring `archetype_confidence` enum one line above (`forming, emerging, established`),
and the baseline's own comment at line 665 names the same confusion as the likely cause, reusing
the wrong enum's vocabulary by hand. PostgreSQL's docs settle the mechanism, if not the exact tool:
an unadorned string literal is typed `unknown` at parse time, "to be resolved in later stages" from
context ("Type Conversion: Overview"). The `insert`'s target column supplies that context, so
`'forming'` resolves against `archetype_id`'s input function, and the enum docs page shows the
resulting error verbatim for the identical shape: `ERROR: invalid input value for enum happiness:
"sad"`. That resolution and failure happen wherever the statement is parsed and planned,
which for a PL/pgSQL body is when the function runs, not when it is created, matching what was
observed: the function exists live and aborts on every call.

**I could not confirm this by name in plpgsql_check's own docs.** I searched its README for every
use of the word "enum": both hits are about testing polymorphic functions declared with
`anyelement`/`anyenum`, unrelated to a literal checked against one concrete enum's label set. The
feature that would plausibly catch it, "checks fields of referenced database objects and types
inside embedded SQL," is a general statement, not a worked example of this case. My reasoning
connects a documented general mechanism to a documented Postgres behavior; it is not a sentence in
the tool's own docs naming this scenario. **The one-line test that would settle it:** on a
disposable branch, `create extension plpgsql_check;`, then
`select * from plpgsql_check_function('public.initialise_contributor_axes(text)');`. If the tool
does what its README says, the report names the `archetype_id` line without the function having
been called for real. Enabling an extension is a write to whatever database it runs on, even a
branch; per this sprint's limits I did not do it, and per the brief, deciding to do it is a
`migrator` migration and a Dan decision, not this seat's.

**Confirmed available on Supabase**, not just in principle:
`supabase.com/docs/guides/database/extensions/plpgsql_check`, enabled with
`create extension plpgsql_check;` or Dashboard > Database > Extensions. **And on this project
specifically**, added by the lead from the live catalog the same night: `pg_available_extensions`
on `mguulnibvzusfvyuowwh` lists `plpgsql_check` at **2.8**, not installed. Upstream is `v2.10.10`, so
a test run here exercises the version Supabase ships, not the one this note's health table
describes. Supabase has no `pg_uuidv7`, and `pgtap` 1.3.3 is available for the schema-contract tests.

## The recommendation, with the bus-factor judgment the mandate asks for

**Adopt squawk as a CI gate, once `--pg-version` is pinned to Dialecta's actual server version
rather than left to an unstated default.** Pushed today, an ecosystem beyond the bare CLI,
Apache-2.0, cheap to run because it touches no database. Adopting it does not mean it would have
caught this sprint's two real findings in the archived migration: name that limit every time the
gate is cited, so a clean squawk run is read as "this will not deadlock or rewrite a populated
table," never as "this migration is correct." That distinction is the whole reason this note
exists.

**Watch plpgsql_check. Do not adopt it this sprint, for a reason that has nothing to do with its
health.** Thirteen years, MIT, pushed the day of this fetch, a release four days old: the numbers
clear the bar this seat uses everywhere else. What is missing is not evidence of quality, it is
standing: turning it on is `create extension`, a write, on a database, outside what this note or
this seat can execute this sprint. Recommend the one-line test above run the next time a
`migrator` or Dan session has a disposable branch open. Either result is worth having: confirmation
Dialecta gets a standing check against this exact class of bug, or confirmation that even static
analysis misses it, which changes what "watch" should mean next time.

## What I did not do

I did not run squawk or plpgsql_check, install either, or enable any extension on any database.
Every claim about what either tool would report on Dialecta's two files is reasoned from that
tool's own documentation, applied by hand to SQL I read directly, the same discipline the
duplicate-logic note used for jscpd and knip. I did not use the Supabase MCP or any database tool
this sprint, so the nine `constraint-missing-not-valid` candidates and the four
`prefer-bigint-over-int` candidates are read from migration text, not cross-checked against
`pg_catalog`; the baseline's own sourcing discipline treats that text as a faithful mirror of live,
and I am relying on that rather than re-verifying it myself.

## Implies for

Practice: "a linter that only reads SQL text is judged by the class of defect it structurally
cannot see, not by how many rules it has." Both halves of that sentence sit in one file here:
squawk has 40 rules and none read a catalog; plpgsql_check reads a catalog and has no rule about a
policy. Related: `2026-live-baseline-unverified-markers.md` for the confirmed mechanism this note
reasons about but does not re-derive, `2026-postgres-alter-default-privileges.md` for the same
function's `pg_get_functiondef` read that first surfaced it, and `2026-duplicate-logic-tool-landscape.md`
for the health-table method this note follows.

Proposed reading-list lead: squawk's exact behavior on a same-migration `add constraint`, whether
the same-transaction exemption confirmed for `require-concurrent-index-creation` extends to
`constraint-missing-not-valid` and `disallowed-unique-constraint`, settled by running the binary
once one exists in this environment.

*Filed 2026-09-21*
