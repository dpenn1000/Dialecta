# Supabase, Row Level Security

**Source:** Supabase, "Row Level Security", Supabase database guides, read 2026-09-19. https://supabase.com/docs/guides/database/postgres/row-level-security

## Summary

The guide starts from the exposure rule: "A table in an exposed schema without RLS is readable and writable by any role with a grant on it. Enable RLS on every table in an exposed schema." Once RLS is on, the default is closed: "Once RLS is enabled, no data is accessible through the API when using a publishable key, until you create policies."

On the secret key: "A secret key authorizes access through the `service_role` Postgres role, which has the `bypassrls` attribute. Never use a secret key in the browser or expose it to customers." The guide adds a qualifier that is easy to miss: "A secret key bypasses RLS only when the request carries no user access token."

For the `auth.uid()` pattern the guide asks for an explicit null check rather than relying on a null comparison to fail closed: "To avoid confusion and make your intention clear, we recommend explicitly checking for authentication: `USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)`".

Three performance recommendations, all of which change the plan rather than the result:

1. Wrap the call: `using ( (select auth.uid()) = user_id )`. The reason given is that "Wrapping the function causes an `initPlan` to be run by the Postgres optimizer, which allows it to 'cache' the results per-statement, rather than calling the function on each row."
2. Index the column a policy filters on, or the policy turns every query into a sequential scan.
3. Name the role: "Always name the role a policy applies to, using the `to` clause" so the policy is not evaluated for roles that could never pass it.

On policy shape the guide is explicit about not collapsing operations: "Write a separate policy for `select`, `insert`, `update`, and `delete`. Postgres does not accept multiple operations in one `for` clause, and a `for all` policy hides which operation each rule was meant to cover."

## Implies for Dialecta

- Every policy in `supabase/migrations/20260919000000_foundation.sql` calls `auth.uid()` bare rather than `(select auth.uid())`, and none carries a `to authenticated` clause. That is a performance finding rather than a hole, and it was not raised in the PR 3 review because check 2 is about correctness of access. Worth raising the next time a migration touches these tables, since a policy rewrite is cheap before the tables carry rows and expensive after.
- The migration does split policies per operation, which matches the guide. Keep that as the expected shape and treat a `for all` policy in a future diff as a finding on its own.
- The bare `auth.uid() = user_id` form is safe here for a different reason than the guide's: `auth.uid()` is null for the anon role, and `null = uuid` is null, which is not true, so anon fails closed. The guide's explicit form is about legibility. Do not report the bare form as a hole; report it as a readability and performance note.
- The `bypassrls` qualifier matters for the classification pipeline. `classifications` and `axis_events` in this repo have no insert policy and are written by the service role. If a pipeline request ever forwards a user access token, the bypass stops and those inserts fail closed. That is a runtime failure mode to look for in any route handler that both reads a user session and writes a pipeline table.

*Filed 2026-09-19*
