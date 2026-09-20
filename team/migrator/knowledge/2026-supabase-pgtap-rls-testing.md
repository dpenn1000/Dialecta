# Testing RLS policies: pgTAP, supabase test db, and pg_policies

**Source:** Supabase, "pgTAP: Unit Testing", https://supabase.com/docs/guides/database/extensions/pgtap,
section "Testing RLS policies", fetched 2026-09-20. Corroborated against PostgreSQL,
"pg_policies", https://www.postgresql.org/docs/current/view-pg-policies.html, fetched
2026-09-20. Verified: both pages exist and document what the lead named.

**Lead state:** filed.

## Summary

Two layers, not one. `pg_policies` is a read-only system view: `schemaname`,
`tablename`, `policyname`, `permissive`, `roles`, `cmd`, `qual`, `with_check`. It
answers "what policies exist and what do they say," by inspection. It is not a test
runner; nothing asserts against it automatically.

pgTAP is the test runner. Tests are `.sql` files under `supabase/tests/database/`, run
with `supabase test db`. For RLS specifically, three assertions matter:

- `policies_are(schema, table, ARRAY[...])`: the named table has exactly this policy
  set, no more, no fewer.
- `policy_roles_are(...)`: a named policy applies to exactly these roles.
- `policy_cmd_is(...)`: a named policy applies to exactly this command
  (`SELECT`/`INSERT`/`UPDATE`/`DELETE`).

These assert on policy **existence and shape**, from `pg_policies` under the hood. They
do not, on their own, prove a policy produces the right rows for a given user. That
needs a second layer: authenticate as a role inside the test (pgTAP tests run inside a
transaction, so `set_config` / `set_role` / `select auth.uid()` simulation patterns
apply) and assert on `results_eq()` against the actual query output. The fetched page
did not surface a worked example of that combination; it is implied by pgTAP's general
mechanism, not demonstrated for RLS specifically on the page read.

## What this implies for Dialecta

**This closes the gap the reading list opened it for.** `2026-supabase-type-generation-drift.md`
already established that `supabase/types.ts` cannot show policies at all. `2026-live-rls-surface.md`
measured policy **effect** (row counts visible to anon vs. service role) but not policy
**text**. pgTAP against `pg_policies` is the missing middle: it can assert the policy
text and shape once `db pull --declarative` (see `2026-supabase-db-pull-diff-engines.md`)
recovers it.

**`policies_are()` is the direct test for the mandate's central invariant.** The
migrator mandate requires `axis_events` to carry no update or delete policy at all. A
`policies_are('public', 'axis_events', ARRAY['axis_events_select', 'axis_events_insert'])`
style assertion would fail loudly, in CI, the moment an update or delete policy is
added by mistake. This is a concrete, cheap addition once P0-2 is unblocked, and it
directly guards the one rule `2026-supabase-declarative-schemas.md` already flagged as
undetectable by any diff engine.

**Requires Docker.** `supabase test db` runs against the local stack, which
`p0-2-runbook.md` already notes is unavailable on studio-pc (no Docker). This is a
practice for whenever Docker or a CI runner is available, not something runnable from
here today.

## Implies for

Practice: "RLS policy shape gets a `policies_are()` pgTAP test, not just a hand-written
migration, once local Postgres is available." Backlog: the `profiles` column-exposure
fix in `brief.md`'s "Next three" item 1 is a natural first candidate once tests exist.
Related: `2026-live-rls-surface.md`, `2026-supabase-declarative-schemas.md`.
