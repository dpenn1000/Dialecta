# Schema squash runbook

The command sequence for landing the adopt-live decision as one baseline migration, with
the expected output at each step, what to check, and how to undo it.

Written 2026-09-20. Every command below was checked against Supabase CLI **2.117.0** by
running its own `--help` locally on studio-pc, then cross-read against the CLI's official
reference pages (`supabase.com/docs/reference/cli/...` and `supabase.com/llms/cli.txt`,
fetched the same day) and one matching community report
(GitHub discussion `supabase/discussions/40721`, "Migration History Mismatch - Cannot
Create Baseline for Existing Production Database", fetched 2026-09-20). No command in
this file has been run against any database. Login, link, and every write step are
Dan's or a later session's to run, not this one's.

## Read this before running anything

**This runbook supersedes Part 2 of `p0-2-runbook.md`.** That file's Part 1
(reconnaissance) is still correct and still the right place to start; its Part 2
(Branch A / B / C) was written before the decision closed and is now moot except for the
"whichever branch, these are needed regardless" section at its foot, which still stands.
`2026-09-19-001` closed 2026-09-20 on option 1 (adopt live) paired with option 2 (branch
for staging). This file is what "adopt live" actually executes as, once the convener's
squash recommendation is tested against the real CLI rather than assumed.

**The short verdict, argued in full below:** squashing the intent is right. The literal
`supabase migration squash` command is the wrong tool for it. Use `db pull` /
`migration fetch` to recover real schema text, author the baseline by hand from it (the
same way every RLS policy in this repo is already required to be hand-written, never
generated), then use `migration repair` to retire the 20-row remote history. No step in
that real path needs Docker, which matters because **Docker is not installed on
studio-pc** (`practices.md`, `2026-supabase-migration-workflow.md`).

**The one command that must not be run.** `supabase db push`. Not against the live
project, not against a branch, not with a flag, until the remote history table has been
repaired to match the single baseline file. Pushing before that repair would attempt to
`create table public.profiles` and collide with the live table that already has 14 rows,
the exact failure `p0-2-runbook.md` was written to prevent. It appears nowhere below
except inside the one step that explicitly depends on the repair having already
succeeded.

## Why `supabase migration squash` is not the mechanism, tested rather than assumed

The convener's recommendation was to "pull the live schema as a single baseline
migration, retire both histories, start clean." That goal is right and is argued for
below. But `migration squash` specifically, tested against its own `--help` and the
official reference, does not do that.

Its own reference text, fetched 2026-09-20 and quoted here verbatim: "Squashes **local**
schema migrations to a single migration file. The squashed migration is equivalent to a
schema only dump of **the local database after applying existing migration files**...
**If your `supabase/migrations` directory is empty, running `supabase squash` will do
nothing.**"

Three consequences follow directly from that sentence, not from inference:

1. **It cannot reach live's current schema at all.** It only ever compresses whatever is
   already sitting in `supabase/migrations/`. Today that is the two September files,
   which `2026-live-schema-diff.md` has already shown do not describe this database on
   nine of thirteen compared tables. Squashing them would produce one file that is still
   wrong, not a baseline of live.
2. **It needs a real Postgres to compute the result**, because "schema only dump of the
   local database after applying existing migration files" means the CLI has to actually
   run those files against something before it can dump the result. That something is
   the local Docker stack, the same one `2026-supabase-migration-workflow.md` already
   flagged as unavailable for `db reset`. `db dump`'s own reference page says the same of
   itself in different words: "Runs `pg_dump` in a container." One community response in
   the GitHub discussion above claimed no Docker was needed for `db dump`; the CLI's own
   docs page contradicts that claim directly, and this runbook trusts the primary source.
3. **Emptying `supabase/migrations/` first does not fix it.** The quoted sentence is
   explicit that an empty directory makes the command a no-op, not a full pull.

None of this is a strike against the underlying goal. It is a strike against reaching for
`migration squash` by name to get there.

## What actually gets you one baseline file, tool by tool

Six subcommands matter here, each checked against its own `--help` locally and its own
reference page on the web. The load-bearing distinction is which ones touch a live
Postgres connection directly (no Docker) and which ones need a local shadow database to
compute a diff (Docker, unavailable today).

| Command | What it touches | Needs Docker | Touches remote history |
| --- | --- | --- | --- |
| `migration list --linked` | Remote connection + local files, timestamps only | No | Read only |
| `migration fetch --linked` | Remote connection | No | Read only |
| `migration repair <version> --status ... --linked` | Remote `schema_migrations` table only | No | Writes tracking rows, never runs SQL |
| `db pull --declarative --schema public` | Remote connection, direct extraction | Unconfirmed either way (see below) | Explicitly does not touch it, per its own `--help` |
| `db pull` (migration mode, bare) | Remote connection + local shadow replay | **Yes** | May insert a row |
| `db dump --linked` | Remote connection, `pg_dump` | **Yes**, per official docs | No |
| `migration squash` | Local files + local shadow replay | **Yes** | No, and cannot reach live regardless |

**`migration fetch` is the one new finding this session adds to the team's knowledge.**
Its own `--help` and reference page are both thin ("Fetch migration files from history
table"), but the Supabase Management API's own documented schema for a migration record
lists the columns directly: `version`, `name`, **`statements`** (an array of the actual
SQL text), `rollback`, `created_by`, `idempotency_key`. The remote history table does not
just remember that migration `035_growth_engine_schema` ran; it stores what it ran. That
means the 20 live migration names in `2026-live-migration-history.md`, filed there as
"reconstructed, not authoritative" from handoff prose, do not have to stay reconstructed.
`migration fetch --linked` can pull the real SQL text of all 20, verbatim, with no Docker
and no diff engine involved, which is a strictly better source than `types.ts` for
anything `types.ts` cannot show: check constraints, RLS policy text, index definitions.
Run this before trusting any hand-authored baseline as final.

**`db pull --declarative` stays the right no-Docker extraction path for a first look**,
exactly as `p0-2-runbook.md` step 6 already established and `2026-supabase-db-pull-diff-engines.md`
already confirmed against the CLI's own `--help`. What is still genuinely unconfirmed,
flagged here rather than glossed over: whether its output captures RLS policy text. The
team's own `2026-supabase-declarative-schemas.md` found that the *diff engine* (the
`schemas/` to `migrations/` authoring direction, i.e. `db diff`) cannot capture RLS
policies, grants, or check constraints. Whether that same gap applies to the *pull*
direction (remote database to `schemas/` files, no diff involved) is a different
question this session could not settle from documentation alone. Read the actual output
when Part 1 below is run. If policies are missing from it, `migration fetch`'s verbatim
statement text is the fallback that cannot have the same gap, because it is not going
through any diff engine at all.

**`migration repair` is the mechanism that actually retires the 20-row history**, and it
is the piece the convener's recommendation did not name. Its reference text, quoted
verbatim: "If your local and remote migration history goes out of sync, you can repair
the remote history by marking specific migrations as `--status applied` or
`--status reverted`. Marking as `reverted` will **delete an existing record** from the
migration history table while marking as `applied` will **insert a new record**." It
never runs SQL against the schema itself, only against the tracking table. That is what
makes it safe to use here: the 20 old migrations already ran, years ago, and marking them
`reverted` does not undo a single column, it only stops the CLI from believing they are
still the current history. This is the step that makes "retire both histories" literally
true of the remote project, not just true of this repo's own `supabase/migrations/`
folder.

## The verdict

**Squash the intent, not by that command.** One baseline file, hand-authored from real
sources, checked with `db lint`, is the right target and matches everything already on
record: Dan's own reframe ("there really is almost no real data... what is the right way
to just simplify"), `2026-supabase-declarative-schemas.md`'s finding that RLS has to be
hand-written regardless of tooling, and the measured fact that 91 rows total is not a
reconciliation problem. The path there is `db pull --declarative` plus
`migration fetch` for ground truth, hand-authored SQL for the file itself (already done
this session, see Part 3), `db lint` to check it, and `migration repair` to retire the
20-row remote history once the file is trusted. `migration squash` itself never runs.

## Part 1: reconnaissance, extends `p0-2-runbook.md` Part 1

Steps 1 through 8 of `p0-2-runbook.md` Part 1 are unchanged and still the starting point:
confirm the CLI, log in (Dan), confirm the project is visible, link, read
`migration list --linked`, run `db pull --declarative`, confirm `types.ts` still matches,
lint. Add one step at the end, new to this runbook:

### Step 9. Recover the real SQL of the 20 applied migrations

```bash
npx --yes supabase migration fetch --linked
```

**Expected:** local migration files appear, one per applied remote migration, with real
names and real SQL bodies rather than the prose reconstruction in
`2026-live-migration-history.md`.
**Writes:** local files only. Confirmed read-only against the remote by its own
reference text ("Fetch migration files from history table"); it is listed alongside
`migration list` as a read operation, not alongside `db push`.

**This is the artifact that upgrades the baseline from inferred to verified.** Diff what
it produces against `team/migrator/knowledge/2026-live-schema-diff.md`'s table-by-table
comparison and against the hand-authored baseline in Part 3 below. Where they disagree,
the fetched SQL wins; it is the actual history, not a reading of `types.ts`.

## Part 2: what the baseline in this repo is, and is not, built from

`supabase/migrations/20260920000000_baseline_live_schema.sql`, written this session, is
built from three sources, in this order of trust:

1. `supabase/types.ts`, committed 2026-09-19, generated directly from the live project.
   Reliable for table names, column names, nullability, enum membership, and declared
   foreign keys. Read in full this session (1,595 lines, all 30 public tables).
2. `team/migrator/knowledge/2026-live-rls-surface.md`, measured 2026-09-19 against the
   live project with `scripts/check-env.mjs --rls` (read-only, counts only). Reliable
   for which tables are open or closed to the anonymous key.
3. `team/migrator/knowledge/2026-live-schema-diff.md` and the Data Architecture spec, for
   naming and intent where the first two sources are silent.

**What it is not built from, and therefore does not claim to know:** RLS policy text
(none of the three sources above can show it), check constraint expressions, index
definitions, exact column defaults beyond what "optional in `Insert`" implies, and
whether `storage.buckets` already has the `article-media` row the September migration
created by hand. Every one of these is called out inline in the file with a `-- LIVE
UNVERIFIED:` comment, and the file's own header repeats the list once at the top so
nobody has to hunt for it.

**Before this file is trusted as canonical**, run Part 1 Step 9 above and diff its output
against this file, table by table. Where `migration fetch`'s real SQL disagrees with a
`-- LIVE UNVERIFIED:` guess here, fix the guess with a follow-up migration (never edit
this file once it has shipped anywhere) and update the practice this implies for.

## Part 3: land the baseline

Gated on Part 1 Step 9 and the diff it enables. Do not run any of this against the
project from a guess; run it after the verification above, or after Dan says the
baseline is close enough that the remaining `LIVE UNVERIFIED` gaps can be closed with
follow-up migrations instead of blocking this landing.

### Step 1. Confirm which 20 versions are live

From Part 1 Step 5's `migration list --linked` output (already captured if
`p0-2-runbook.md` Part 1 has been run), read the **remote** column. It is a list of
14-digit timestamps, e.g. `20260427000000`. This runbook cannot hardcode them: no
session has read them yet, and `2026-live-migration-history.md` is explicit that its 19
reconstructed names are "not authoritative." Copy the real list from that output before
the next step.

### Step 2. Mark the 20 old versions reverted

```bash
npx --yes supabase migration repair 20260427000000 20260427000001 ... --status reverted --linked
```

Substitute the real 20 timestamps from Step 1 for the placeholder list above. The CLI
accepts multiple versions in one call (`migration repair [<version...>]`).

**Expected:** a line per version confirming the tracking row was deleted.
**Writes:** deletes 20 rows from `supabase_migrations.schema_migrations` on the live
project. **Runs no SQL against any table.** The columns, rows, and constraints those 20
migrations created are untouched; only the CLI's memory of having run them is cleared.
**Undo:** `migration repair <version> --status applied --linked` re-inserts the row for
any version this step removed by mistake. Keep the exact list from Step 1 until this
whole runbook is confirmed complete, specifically so this undo is possible.

### Step 3. Mark the new baseline applied, without running it

```bash
npx --yes supabase migration repair 20260920000000 --status applied --linked
```

**Expected:** confirms the row was inserted for `20260920000000_baseline_live_schema`.
**Writes:** inserts one row into `supabase_migrations.schema_migrations`, marking this
version as applied. **This does not execute the migration file.** That is the point:
the baseline's `create table` statements describe tables that already exist on the live
project, so running them for real would fail on the first statement exactly the way the
original September collision did. `repair --status applied` tells the CLI "this already
happened," which is true, since the baseline is a transcription of what live already is,
not a change to it.
**Undo:** `migration repair 20260920000000 --status reverted --linked`.

### Step 4. Confirm the repair worked

```bash
npx --yes supabase migration list --linked
```

**Expected:** local and remote columns both show exactly `20260920000000` and, once
Part 4 below lands, `20260920000100`. No stragglers from the old 20, no `20260919000000`
or `20260919000100` from the retired September files (they were moved out of
`supabase/migrations/` in this session, see Part 4's own note, so they cannot appear
here regardless).

**After this step, and only after it, `db push` becomes a normal, safe operation again**
for any future migration: the remote history has exactly the two files this repo now
carries, so a `db push` compares against a short, accurate list instead of an unrelated
20-entry one. This runbook does not run one; it only re-establishes the ground it would
run on safely.

### If this goes wrong

`migration repair` only ever touches the tracking table, never the schema, so the worst
case here is a confused `migration list` output, not damaged data. If Step 2 or Step 3
is interrupted partway (some versions reverted, others not), re-run
`migration list --linked` to see exactly which rows are still present and finish the
list from there; the command is idempotent per version (repairing an already-reverted
version again is a no-op, not an error, per its own doc text describing it as bringing
the table to a target status).

## Part 4: the two migrations this session wrote

Both are in `supabase/migrations/`, both unapplied anywhere, both waiting on Part 3.

**`20260920000000_baseline_live_schema.sql`.** Adopts live's schema wholesale: all 30
public tables read from `supabase/types.ts`, RLS enabled on every one, `select using
(true)` on the six tables `2026-live-rls-surface.md` measured as fully open plus a
flagged best-guess for `quotes` (measured as filtered, not open, not closed), no policy
at all (closed by default) on the nine measured-closed tables and on every table outside
the measured set. **No insert, update, or delete policy anywhere in this file, on
purpose.** `practices.md`'s newest, highest-confidence row (2026-09-20, from the
security seat's B2 finding) is explicit that adding an owner-writes-own-row policy
without a paired column-grant revoke makes the self-tier-escalation path
live-exploitable; live today is safe only because it has open grants and zero write
policies together. Adding zero write policies in this file cannot reintroduce that hole.
The column-grant fix and its paired write policies are already queued in `brief.md`'s
"Next three," items 1 and 2, and stay there rather than being freelanced here.

Because live already has the three-value `opposing_view_level` enum on
`classifications.opposing_view_engaged`, adopting live's schema wholesale means this
file already carries the fix the task asked for. There is no separate migration for it;
see the report for why writing one anyway would be a redundant, ruleless change against
a file that already matches the rule.

**`20260920000100_axis_scores_contributor_axis_unique.sql`.** The single additive
statement from `2026-09-19-002`'s appendix, using live's real column name
(`member_id`, not the repo's `contributor_id`) since the baseline it lands on top of is
live's shape:

```sql
alter table public.axis_scores
  add constraint axis_scores_one_member_per_axis unique (member_id, axis);
```

Dan's decision names this exact constraint. `archetypes` is deliberately not given the
same treatment here: the appendix flagged it as needing a one-line confirmation first
(whether the archetype monitor should write history, in which case a uniqueness
constraint would be wrong), and no answer to that is on record.

**The two September files, `20260919000000_foundation.sql` and
`20260919000100_articles_native.sql`, move to
`supabase/migrations/_archived_2026-09-19/`** in this session, not deleted. They are the
record of a design written without knowledge of live, per `2026-09-19-001`'s closed
verdict, and stay available to read back if reconciliation is ever wanted for a specific
field. A file moved out of `supabase/migrations/` is invisible to every CLI command in
this runbook (`migration list`, `db push`, `db pull`), so their presence there does not
interfere with anything above.

## What this runbook does not cover

The 18 live tables `2026-live-schema-diff.md` scoped out of its comparison because they
have no spec entity and no repo counterpart (`admin_audit_log`, `admin_capabilities`,
`admin_role_capabilities`, `admin_roles`, `celebration_events`, `feedback_items`,
`handle_history`, `notification_prefs`, `opinion_map_overrides`,
`profile_admin_capability_grants`, `profile_admin_roles`, `quotes`, `reserved_handles`,
`self_descriptions`, `share_events`, and others) **are included in the baseline's table
shapes**, read directly from `types.ts` this session, but **their RLS policy state was
never measured** the way the 15 spec-relevant tables were. `2026-live-rls-surface.md`
only ran `check-env.mjs --rls` against the tables the spec diff already cared about.
Extending that measurement to the remaining tables is unstarted work, not covered here.

Column grants (the B2 finding), the `profiles` column-exposure fix, and
`classifications.model` / `.prompt_version` / `comments.delta_acknowledged` /
`aspirations.visibility` / `.research_consent_at` (all already-queued in `brief.md`'s
"Next three") are not in this runbook's two files. They are real, unblocked, scoped
follow-up migrations for the next thread, now that the baseline they land on top of
exists.
