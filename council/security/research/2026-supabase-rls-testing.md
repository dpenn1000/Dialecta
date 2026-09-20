# Testing Supabase RLS with pgTAP

**Source:** Supabase, "Testing and Linting" and "Advanced pgTAP Testing", Supabase Docs, read 2026-09-20. https://supabase.com/docs/guides/local-development/testing/overview ; https://supabase.com/docs/guides/local-development/testing/pgtap-extended

## Summary

Supabase's own recommended way to assert database behavior, including RLS, is pgTAP, a unit-testing extension for Postgres. The workflow is `supabase test new <name>.test` to scaffold a file under `supabase/tests/database/`, then `supabase test db` to run every test in that folder against the local Postgres instance the CLI manages. Assertions read as SQL: `results_eq()`, `lives_ok()`, `throws_ok()`, and similar pgTAP functions compare what a query actually returns against what it should. The docs give a GitHub Actions example directly: `supabase/setup-cli@v1` to install the CLI, `supabase start` to bring up local Postgres, then `supabase test db`, runnable on every push and pull request with no external database needed.

Plain pgTAP has no concept of "run this as the anon role" on its own. `usebasejump/supabase-test-helpers` (131 stars, distributed as a `dbdev` package, `basejump-supabase_test_helpers`) fills that gap: `tests.authenticate_as(identifier)` impersonates a user, `tests.clear_authentication()` drops back to anon, and `tests.rls_enabled(schema, table)` asserts a table has RLS turned on at all. A test proving "anon cannot read this table" is `tests.clear_authentication()` followed by a `results_eq()` expecting an empty set, inside a transaction pgTAP rolls back automatically so nothing persists.

This is a different layer from `supabase db lint`, which runs `plpgsql_check` against function bodies for syntax and type errors, not RLS coverage. The thing that checks RLS presence statically, without running a query as any role, is `supabase/splinter` (275 stars, 103 forks), the linter behind the hosted Security Advisor and the `auth_users_exposed` lint specifically. Splinter states that a policy is missing or a table is exposed; a pgTAP test states that a specific request is denied. Both are needed; neither substitutes for the other.

## Implies for Dialecta

- `supabase/tests/` does not exist in this repo yet. Nothing here currently exercises RLS as code; `scripts/check-env.mjs --rls` (referenced in `team/migrator/knowledge/2026-live-rls-surface.md`) reads and counts, it does not assert.
- The highest-value first test, direct from the open finding in root `CLAUDE.md`: `profiles` is fully public with no column grants, so `is_admin`, `subscription_tier`, `pact_signed_name`, `order_negotiation_log`, and `ghost_member_id` are all anon-readable today. A pgTAP test asserting that `tests.clear_authentication()` followed by `select is_admin, ghost_member_id from profiles limit 1` returns zero rows would currently fail, on purpose, as the reproduction for that finding, and would flip to passing the day the column grants or a public-profile view fix lands.
- `security`'s own practice, "a clean Supabase security advisor means the database is configured, not that the application is safe" (`team/security/practices.md`), is exactly the Splinter versus pgTAP distinction above. Worth citing this note from that practice row instead of re-explaining the distinction there.
- CI wiring is additive to the existing `.github/workflows/ci.yml`: a step running `supabase/setup-cli@v1`, `supabase start`, `supabase test db` after `npm ci`, gated the same way typecheck and test already are.
- This only tests what the two local migration files describe. The live database carries 32 tables from 20 migrations this repo does not contain (the drift note in root `CLAUDE.md`), so a green `supabase test db` here would not yet cover the live `profiles` table's actual policy set until that drift question is resolved.

*Filed 2026-09-20*
