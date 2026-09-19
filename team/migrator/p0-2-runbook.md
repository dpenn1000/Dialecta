# P0-2 runbook

The command sequence for the first real Supabase session, with the expected output
at each step, so the run is checking boxes rather than improvising.

Written 2026-09-19. Every command below was checked against Supabase CLI **2.117.0**
on studio-pc by running its `--help`. No command in this file has been run against
any database.

## Read this before running anything

**P0-2 as the backlog words it cannot be executed.** The backlog says "Create
`dialecta-staging` Supabase project; apply foundation migration; `npm run types`;
commit `supabase/types.ts`". That was written as greenfield setup. The live project
`mguulnibvzusfvyuowwh` already holds 32 tables and 20 applied migrations, and
`supabase db push` against it would fail on `create table public.profiles`, which
exists with 14 rows. Creating `dialecta-staging` from the repo's two files would
produce a staging schema behind production. See
`docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`.

So this runbook has two parts. **Part 1 is reconnaissance and is safe to run today**,
before any decision. It answers the questions the decision in
`exchange/open/2026-09-19-001-advice-supabase-schema-collision.md` needs answered.
**Part 2 is gated on that decision** and has three branches, one per option in the
handoff.

**The CLI does not need installing.** `npx --yes supabase` resolves 2.117.0 on this
machine, verified 2026-09-19. Every command below uses that form, which is what
`npm run types` in `package.json` already does. A global install is optional.

**Docker is not installed on studio-pc**, so nothing here uses `--local`,
`supabase start` or `supabase db reset`. The reconnaissance path does not need them.

### The one command that must not be run

```
supabase db push
```

Not against the live project, not against a new one, not with a flag. It is the
command the whole situation exists to prevent. It appears nowhere in Part 1, and in
Part 2 only inside a branch that a decision has to unlock first.

## Part 1: reconnaissance, safe to run now

### Step 1. Confirm the CLI

```bash
npx --yes supabase --version
```

**Expected:** `2.117.0` or later, on its own line, exit 0.
**Verified:** this exact output on studio-pc, 2026-09-19.
**Writes:** nothing. Downloads the CLI into the npx cache on first run, which can
take a minute.

### Step 2. Log in

```bash
npx --yes supabase login
```

**Expected:** opens a browser to authorize, then prints a success line naming the
account. If the browser does not open, the CLI prints a URL and waits.
**Writes:** an access token into the per-user CLI config on this machine. Nothing
remote.
**Dan runs this one.** It is interactive and it is a credential step.
**Not verified:** this session did not log in, so the exact success wording is
unconfirmed.

**Check the account.** The organization matters. Root `CLAUDE.md` records the live
project in **Pennington Media Group**, and the previous session found that the
Supabase MCP connection saw only **Trinity Solar**. If the login lands on an account
that cannot see `mguulnibvzusfvyuowwh`, stop: it is the wrong account, not a missing
project.

### Step 3. Confirm the project is visible

```bash
npx --yes supabase projects list
```

**Expected:** a table of projects including a row whose reference is
`mguulnibvzusfvyuowwh`, in the Pennington Media Group organization.
**Writes:** nothing.

**If that row is absent**, everything downstream is pointed at the wrong account.
Do not create a project to fill the gap. That is the failure mode this whole file
exists to avoid.

### Step 4. Link the repo to the live project

```bash
npx --yes supabase link --project-ref mguulnibvzusfvyuowwh
```

**Expected:** a prompt for the database password, then a line confirming the project
is linked. The CLI may also report that local and remote `config.toml` differ, which
is informational.
**Writes locally:** `supabase/.temp/`, which `.gitignore` already covers per
`supabase/CLAUDE.md`.
**Writes remotely:** treat this as the first command that touches the remote. Linking
reads the project and, depending on version, can initialize the
`supabase_migrations.schema_migrations` table if it is absent. It is not absent here
(20 migrations are recorded), so no initialization should occur. Flagged because
this is the boundary between local-only and remote.

The password is the database password, not the account password. It is in the
Supabase dashboard under project settings. Do not paste it into a file in this repo.

### Step 5. Read the remote migration history. This is the point of Part 1.

```bash
npx --yes supabase migration list --linked
```

**Expected:** two columns, local against remote. The remote column should list **20
entries**. The local column should show the repo's two files,
`20260919000000` and `20260919000100`, as present locally and absent remotely.

**This output is the artifact.** Capture it verbatim into
`docs/handoffs/` or paste it into the exchange record. It settles three things the
repo currently cannot:

1. **The authoritative list of the 20 names.**
   `team/migrator/knowledge/2026-live-migration-history.md` reconstructs 19 of them
   from handoff prose and flags the reconstruction as unverified. This command
   replaces the guess with the fact.
2. **Whether `028_pre_launch_security_hardening` exists.** It appears only in
   `team/migrator/brief.md` and nowhere in `docs/`. If it is real, live RLS was
   hardened deliberately before launch, which is the highest-value unknown in the
   live schema.
3. **That the repo's two files are unapplied**, which confirms the collision is
   still ahead rather than behind.

**If the remote column is empty**, stop and re-check the project reference. An empty
history against a 32-table database would mean the migrations were applied outside
the CLI, which changes the options.

### Step 6. Recover the live schema, without writing to the remote

```bash
npx --yes supabase db pull --declarative --schema public
```

**Expected:** a `supabase/schemas/` tree containing the live DDL for the public
schema.
**Writes:** local files only.

**Use `--declarative`, and read this before considering the plain form.** The CLI's
own help for 2.117.0 says migration-mode `db pull` "compares supabase/migrations
with the selected live database, writes the complete difference as migration files,
and **may record them in that database's migration history**". Two problems with
that here. It writes to the remote history table, which is the thing being protected.
And it diffs against `supabase/migrations/`, which currently holds the two September
files that do not describe this database, so the "difference" would be computed
against a schema that never existed and would be unusable.

`--declarative` avoids both: the help states it "does not create migrations or
update migration history".

**What to read in the output.** The live RLS policies and check constraints, neither
of which `supabase/types.ts` can show, per
`team/migrator/knowledge/2026-supabase-type-generation-drift.md`. Those two gaps
bound every claim in `team/migrator/knowledge/2026-live-schema-diff.md`, and this
step closes them.

### Step 7. Confirm the committed types still match live

```bash
npm run types
git diff --stat supabase/types.ts
```

**Expected:** an empty diff. `supabase/types.ts` was generated from this project on
2026-09-19, so an unchanged file means nothing has moved since.
**Writes:** overwrites `supabase/types.ts` locally. Nothing remote.

**A non-empty diff means the live schema changed after 2026-09-19.** Read the diff
before committing it, and re-check
`team/migrator/knowledge/2026-live-schema-diff.md` against whatever moved.

### Step 8. Lint the live schema, read-only

```bash
npx --yes supabase db lint --linked --schema public --level warning
```

**Expected:** a list of typing and schema warnings, or a clean run.
**Writes:** nothing.

This is diagnostic, not a gate. The mandate's "run `supabase db lint`" assumes a
schema this repo authored. Warnings on a schema written elsewhere are information
about the inheritance, not a defect list to fix.

### End of Part 1

At this point the following are known and none of them were known before: the real
20 migration names, whether `028` exists, the live RLS policies, the live check
constraints, and whether the types are current. Nothing has been written to the live
database.

**Post the results to `exchange/open/2026-09-19-001-advice-supabase-schema-collision.md`
as an appended block.** The record is append-only while open.

## Part 2: gated on the decision

Do not start any branch until `2026-09-19-001` is answered and closed with an
outcome. The question it asks is whether the two September migrations were written
knowing the live database existed.

### Branch A, adopt the live schema

Chosen if the September files were written without knowing. Then live is the truth
and the repo should carry its history.

1. Move `supabase/migrations/20260919000000_foundation.sql` and
   `20260919000100_articles_native.sql` out of `migrations/`. Do not delete them in
   the same commit that adds the pulled history; they are the record of a design.
2. Bring the live history into `supabase/migrations/` with the real names and
   timestamps from step 5.
3. `npm run types`, expect no diff.
4. Rewrite backlog P0-2 through P0-7, and audit the rows named in
   `team/migrator/knowledge/2026-live-migration-history.md` section 5, which is more
   than six rows. A-7 and D-3 in particular describe shipped work.
5. `dialecta-staging` is not created. Branch B is the staging answer.

### Branch B, branch from live

Chosen if a staging environment is wanted and live is the baseline. This is the only
branch where a second project appears, and it is a copy of production rather than a
build from the repo's files.

1. Use Supabase branching, or restore a copy of the live project.
2. Point `apps/web/.env.local` at the branch.
3. `npm run types` against the branch, expect the same shape as live.
4. `supabase db push` becomes available **against the branch only**, once the
   history in step 5 matches.

Branch B composes with A or C. It is not an alternative to them.

### Branch C, keep both and reconcile

Chosen only if Dan confirms the September files were a deliberate rebuild.

1. Read `team/migrator/knowledge/2026-live-schema-diff.md` end to end. It is the
   scope of this branch.
2. The expensive items, in order: `axis_events.delta` (live has no delta column and
   27 rows carry no way to recover one), the identity model across nine tables
   (`member_id` against `user_id uuid`), and three enum narrowings that Postgres does
   not support directly, per
   `team/migrator/knowledge/2026-postgresql-enum-evolution.md`.
3. Write the reconciliation as numbered migrations against live, one concern per
   file, never editing a shipped one.
4. Every one of them runs against a database with real rows. Branch B first.

### Whichever branch, these are needed regardless

Three findings in the diff are true under all three options:

- `classifications` needs `model` and `prompt_version`. Backlog A-2 requires them,
  the spec has no line for them, and live does not have them.
- `comments` needs `delta_acknowledged`. The spec lists it in entity 1, live has it,
  the repo omits it.
- `aspirations` needs `visibility` and `research_consent_at`. The spec requires both
  and live has neither, so the Growth Engine's public-or-private branch cannot run
  live today.

These are the smallest real migrations available and they do not wait on the
decision, except that they must be written against whichever schema wins.

## What this runbook does not cover

Creating a Supabase project. No step here creates one, because no option in the
handoff calls for a project built from the repo's two migration files, and that is
the only thing a new empty project could be built from today.

If the decision comes back as "create `dialecta-staging` from the repo files
anyway", that is a fourth option not in the handoff, and the consequence is on
record: a staging environment whose schema is behind production and which shares no
migration history with it.
