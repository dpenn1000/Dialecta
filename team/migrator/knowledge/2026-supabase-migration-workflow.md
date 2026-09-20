# Supabase CLI migration workflow

**Source:** Supabase, "Database Migrations", https://supabase.com/docs/guides/deployment/database-migrations,
fetched 2026-09-19. Verified: the page exists and documents every command the lead named.

**Lead state:** filed, with the rationale corrected. See "What the lead got wrong" below.

## Summary

Six commands. `supabase migration new <name>` writes an empty timestamped file.
`supabase db reset` drops the local database and reapplies every migration from
scratch, then seeds. `supabase db diff` captures changes made in the Dashboard
against the local database into a migration. `supabase link` binds the local
project to a remote one. `supabase db push` deploys local migrations to the
linked remote. `supabase db pull` does the reverse: it writes the remote's
current schema into a new local migration file.

The mechanism that matters: `db push` compares the `migrations/` folder against
the remote tracking table `supabase_migrations.schema_migrations` and runs only
the unapplied files, **in timestamp order**. The remote table is the authority on
what has run, not the folder.

The documented failure mode: changes made through the Dashboard SQL editor or
Table Editor bypass the migration history, and `db push` then fails. The docs are
blunt about it. Once a project is on migrations, every schema change goes through
a migration file.

## What this implies for Dialecta

**`db push` against the live project would fail, and the note explains why.** The
live project's history table holds the 20 names applied from the old
`C:\dialecta-api` repo (`001_v1_1_schema`, up to `035_growth_engine_schema`). This
repo's two files are timestamped `20260919000000` and `20260919000100`, which sort
after `035`. `db push` would therefore see both as unapplied and run them, and the
first statement it reaches that matters is `create table public.profiles`, which
already exists with 14 rows. This is the concrete mechanism behind the collision
described in `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`. It is
not a guess about what might happen.

**`db pull` is the command this situation actually calls for**, not `db push`. It
writes the live schema into a migration file, which is option 1 in the handoff
("adopt the live schema") and is a prerequisite for option 3 ("write the diff
against live"). It is read-only against the remote.

**`db reset` is unavailable on studio-pc.** It operates on the local stack, which
needs Docker, which is not installed. Nothing in the P0-2 sequence can rely on it
until Docker is.

## What the lead got wrong

The reading list said "P0-2 runs this for real against `dialecta-staging`". That
premise no longer holds. P0-2 is blocked on a decision about the live project, and
`dialecta-staging` does not exist and may never be created: option 2 in the handoff
is to branch from live instead. The failure modes were worth knowing before rather
than during, which was the lead's real point, and that part stands.

## Implies for

Practice: "never `db push` to a project whose history table you have not read".
Backlog P0-2. `team/migrator/p0-2-runbook.md`.
