# PostgreSQL, SECURITY DEFINER functions

**Source:** PostgreSQL Global Development Group, "CREATE FUNCTION", section "Writing SECURITY DEFINER Functions Safely", PostgreSQL 18.6 documentation, read 2026-09-19. https://www.postgresql.org/docs/current/sql-createfunction.html

## Summary

"SECURITY DEFINER specifies that the function is to be executed with the privileges of the user that owns it." That is the whole hazard in one line: the function is a hole punched through the owner's privileges, and every caller enters through it.

Two separate defects follow, and a definer function needs both fixed.

The first is `search_path`. The docs: "For security, `search_path` should be set to exclude any schemas writable by untrusted users. This prevents malicious users from creating objects (e.g., tables, functions, and operators) that mask objects intended to be used by the function. Particularly important in this regard is the temporary-table schema, which is searched first by default, and is normally writable by anyone." The mitigation is specific rather than general: "A secure arrangement can be obtained by forcing the temporary schema to be searched last. To do this, write `pg_temp` as the last entry in `search_path`." The worked example is `SET search_path = admin, pg_temp;`.

The second is the execute grant, and it is the one that reads as normal code. "by default, execute privilege is granted to `PUBLIC` for newly created functions... Frequently you will wish to restrict use of a security definer function to only some users. To do that, you must revoke the default `PUBLIC` privileges and then grant execute privilege selectively." The docs also say to do it atomically: "To avoid having a window where the new function is accessible to all, create it and set the privileges within a single transaction." Their example wraps `CREATE FUNCTION`, `REVOKE ALL ... FROM PUBLIC` and `GRANT EXECUTE ... TO admins` in a single `BEGIN`/`COMMIT`.

So a definer function with no revoke is callable by every role, including `anon`, and it runs as its owner. Nothing in the function body looks wrong.

## Implies for Dialecta

- This is the failure mode the reading list predicted and it does not appear in PR 3. The one function the foundation migration adds, `public.set_updated_at()` at `supabase/migrations/20260919000000_foundation.sql:33`, is a plain trigger function with no `security definer`, so it runs as invoker and the execute-grant hazard does not apply.
- It does still have a mutable `search_path`, which Supabase's own linter flags as `function_search_path_mutable`. `supabase/CLAUDE.md` requires `supabase db lint` to be clean before a migration is committed, so this is a gate failure rather than a breach. Filed as should-fix S5 in `exchange/open/2026-09-19-002-handoff-pr-3-review.md`.
- Standing rule for check 2 from here on: any migration that adds `security definer` gets three questions before anything else. Does it set `search_path` with `pg_temp` last, does it revoke execute from `PUBLIC`, and are the create and the revoke in one transaction. A definer function missing the revoke is a blocker, not a nit, because the body gives no sign of it.
- Supabase's own helper functions in `auth` are definer functions. A migration that redefines or wraps one inherits this whole checklist.

*Filed 2026-09-19*
