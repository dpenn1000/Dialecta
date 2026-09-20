# Supabase declarative schemas, and the case against them here

**Source:** Supabase, "Declarative database schemas",
https://supabase.com/docs/guides/local-development/declarative-database-schemas,
fetched 2026-09-19. Verified: the page exists and carries an explicit list of what
the diff engine does not capture.

**Lead state:** filed. The lead asked for one note saying whether this fits,
including the case against. The answer is that it does not fit, and the reason is
specific rather than a preference.

## Summary

Declare the desired end state in `supabase/schemas/*.sql`; `supabase db diff`
compares the declaration against the migration history and generates the migration
for you. The generated files still land in `supabase/migrations/` and still apply
in timestamp order, so this is a way of authoring migrations, not a replacement for
them.

The docs list what the diff engine cannot capture:

- DML (insert, update, delete)
- View ownership, grants, security invoker settings, materialized views, column
  type changes on views
- **RLS policies**, `alter policy`, column privileges
- Schema privileges, comments, partitions, **domain statements**, publications,
  duplicated grants

And: "Changes made directly to the database are not picked up", because the diff
reads the schema files, not the live database.

## What this implies for Dialecta

**It does not fit, because RLS is the thing this repo is most careful about.** The
migrator mandate in `.claude/agents/migrator.md` requires, for every table, RLS
enabled plus a select policy plus write policies scoped by `auth.uid()` or the
service role, and it requires `axis_events` to have no update or delete policy at
all. `supabase/CLAUDE.md` repeats it. An authoring tool that silently omits policy
changes from the migration it generates would turn the single most important
invariant in the schema into the one thing the tool does not track. The failure is
quiet: the migration applies, the tables are right, and the policies are missing.

**The second disqualifier is the append-only rule.** A declarative tool expresses
"this is the end state". The ledger rule in `supabase/CLAUDE.md` is about what may
never be written: no update policy, no delete policy, no trigger that rewrites
rows. Absence of a policy and absence of a declaration look identical to a diff
engine.

**The third is smaller and still real.** Domain statements are on the not-captured
list, which interacts with the bounded-values question in
`2026-postgresql-domains-vs-checks.md`. Choosing domains and choosing declarative
schemas are mutually weakening choices.

**Where it would help, and does not apply yet.** The strength of the approach is
reviewing a schema as a single readable current state rather than as a chain of 20
diffs. That is exactly the problem the live project has. But the same page says
changes made directly to the database are not picked up, and part of the live
schema was built through the Dashboard, so adopting declarative schemas now would
start from a declaration that does not match the database. It could be worth
revisiting after a `db pull` establishes a true baseline.

## Implies for

Practice: "RLS policy changes are written by hand in the migration, never generated".
Backlog P0-2. Related: `2026-postgresql-domains-vs-checks.md`.
