# Supabase, default grants to anon and authenticated

**Source:** Supabase, "Securing your API", Data API guides, read 2026-09-19. https://supabase.com/docs/guides/api/securing-your-api
Supabase changelog 45329, "Breaking Change: Tables not exposed to Data and GraphQL API automatically", read 2026-09-19. https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically

## Summary

This note exists to settle one assumption that the PR 3 review rested a blocker on and had
only reasoned, not read.

The Data API has two layers, and the guide names them in order: "1. **Grants** determine which
Postgres roles can reach a table, view, or function over the Data API... 2. **Row Level
Security (RLS) policies** determine which rows those roles can read or modify." The
instruction is to use both: "Grants control whether a role can access an object. RLS controls
which rows the role can access. Use both controls for every exposed object."

The default is the part that mattered. "tables created in `public` receive `SELECT`, `INSERT`,
`UPDATE`, and `DELETE` privileges for `anon`, `authenticated`, and `service_role` by default."
So on a project with that default in force, a new table in `public` is reachable by every
signed-up user at the table level the moment it is created, and RLS is the only thing deciding
which rows. The assumption holds.

Supabase is removing that default, on a schedule that matters for reading this repo:

- 2026-04-28: new projects get an "Automatically expose new tables" checkbox at creation.
  Unchecking it runs `alter default privileges for role postgres in schema public revoke
  select, insert, update, delete on tables from anon, authenticated, service_role`.
- 2026-05-30: unchecked becomes the default for all new projects.
- 2026-10-30: enforcement reaches existing projects.

The sentence that decides how much of that rescues anything: "Existing tables are not affected
in your project, they keep their current grants and stay reachable." The change is about
future objects only.

## Implies for Dialecta

- Blocker B2 of `exchange/open/2026-09-19-002-handoff-pr-3-review.md` is confirmed rather than
  assumed. `authenticated` holds table-level `UPDATE` on `public.comments` by default, so the
  row policy is the entire gate and an owner may write `final_tier` and `status`.
- The Dialecta project `mguulnibvzusfvyuowwh` carries 20 migrations dated 2026-04-29 to
  2026-05-07 (root `CLAUDE.md`), so it predates both the 2026-04-28 checkbox and the
  2026-05-30 default. It is an existing project with the old behavior, in force until
  2026-10-30.
- The October date does not fix anything here, and this is the part worth carrying. Any table
  the foundation migration creates before 2026-10-30 keeps its grants permanently, because
  the change touches future objects and "Existing tables are not affected". Waiting is not a
  remedy. An explicit revoke is.
- New standing question for check 2, in addition to "is RLS enabled": does this migration
  revoke or narrow the default grants, or is it relying on a default that Supabase has
  scheduled for removal. A migration written after 2026-10-30 against a project created after
  2026-05-30 will need explicit grants or the table is unreachable, which is the opposite
  failure and reads as a broken page rather than a breach.
- The guide's framing, grants then rows, is the right order to review a migration in. Read the
  grant situation first, then the policies. A reviewer who starts at the policy has already
  assumed the answer to the first question. See [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md)
  for what the grant layer can express that the policy layer cannot.

*Filed 2026-09-19*
