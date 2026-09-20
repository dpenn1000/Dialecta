# Supabase database linter, full rule set

**Source:** Supabase Docs, "Database Linter" (Advisors), read 2026-09-20. https://supabase.com/docs/guides/database/database-linter

## Summary

Thirty documented rules, each at level ERROR, WARN, or INFO. `supabase/CLAUDE.md` makes `supabase db lint` a gate that "must be clean" before a migration commits. This note lists what that gate actually checks, so a review can say which findings the tooling already catches automatically and which ones only a reader catches. The ERROR-level rules: `auth_users_exposed`, `security_definer_view`, `rls_disabled_in_public`, `rls_references_user_metadata`, `insecure_queue_exposed_in_api`, `fkey_to_auth_unique`, `sensitive_columns_exposed`. Everything else is WARN or INFO, meaning `db lint`'s pass/fail gate as commonly run (errors only) would not by itself block a WARN-level finding such as `function_search_path_mutable` unless the CI invocation also fails on WARN; that invocation detail was not checked here and is worth confirming when a local stack exists.

**`function_search_path_mutable` (WARN), the rule already cited against `public.set_updated_at()`:** a function with no `search_path` set inherits the caller's session `search_path`, so its unqualified object references can resolve against a schema the caller controls rather than the one the author intended. The documented fix is `set search_path = ''` on the function plus fully-qualified names inside it, not merely pinning `search_path = public`. The existing PR 3 finding cited the rule by name only; this is the first primary-source read of what it actually checks and what the fix looks like, which upgrades that finding from reasoned-from-the-name to reasoned-from-the-documented-behavior. Running the linter itself against this repo's migrations is still not done; no local Supabase stack exists in this worktree.

**What the ruleset does and does not cover, checked directly against the checklist:**

| Checklist row | Rule that covers it | Coverage |
|---|---|---|
| 4, table added with no RLS enabled | `rls_disabled_in_public` (ERROR) | Full. This is caught automatically |
| 5, RLS enabled with no policy | `rls_enabled_no_policy` / `policy_exists_rls_disabled` (INFO) | Full, at INFO not ERROR, so it would not fail a gate that only breaks on ERROR |
| 9, definer function with no revoke from `PUBLIC` | `security_definer_view` (ERROR, views only), `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable` (WARN) | Partial. The two WARN rules catch a definer function callable by `anon` or `authenticated`, which is most of row 9's concern, but nothing in the list checks `search_path`, the same-transaction requirement, or a definer function callable by neither role that still runs unsafely |
| 6, 7, owner-writable column via a row-only policy (the actual shape of blockers B1 and B2) | none | **No rule in this list inspects column-level grants at all.** The one gate the mandate treats as mandatory does not check the thing that produced both blockers on PR 3 |

That last row is the sharpest result. `supabase db lint` passing clean would have said nothing about either blocker. The checklist's own closing section already argued this in the abstract, that field-level authorization has no source of truth in this repo; the linter's rule list is now a concrete, citable confirmation rather than an inference.

## Implies for Dialecta

- Checklist rows 4, 5, and 9 get a tooling citation and a coverage note. Rows 6 and 7 get a strengthened statement: not just unsourced, but confirmed absent from the one automated gate that exists. See `review-checklist.md`.
- `multiple_permissive_policies` (WARN) and `auth_rls_initplan` (WARN) are performance rules, not access-control ones; they back the existing `(select auth.uid())` and one-policy-per-role notes in `2026-supabase-row-level-security.md` without changing severity of anything.
- Confirms part of brief `## Next three` item 3 without finishing it: the rule set is now read, but the linter has still not been run against this repo's actual migrations, so the `function_search_path_mutable` finding is better sourced, not yet observed.

*Filed 2026-09-20*
