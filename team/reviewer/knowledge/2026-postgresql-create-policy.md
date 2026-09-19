# PostgreSQL, CREATE POLICY

**Source:** PostgreSQL Global Development Group, "CREATE POLICY", PostgreSQL 18.6 documentation, read 2026-09-19. https://www.postgresql.org/docs/current/sql-createpolicy.html

## Summary

`USING` is checked against rows that already exist. `WITH CHECK` is checked against the row a write would produce. A `SELECT` policy takes only `USING`, a `DELETE` policy takes only `USING`, an `INSERT` policy takes only `WITH CHECK`, and `UPDATE` and `ALL` take both.

The two clauses fail differently, and this is the part that is easy to get wrong. On `USING`, the docs say: "When a `USING` expression returns true for a given row then that row is visible to the user, while if false or null is returned then the row is not visible. Typically, no error occurs when a row is not visible". On `WITH CHECK`: "When a `WITH CHECK` expression returns true for a row then that row is inserted or updated, while if false or null is returned then an error occurs." So a read failure is silent and a write failure is loud. The reference table in the page labels the first behavior "Filter" and the second "Check".

Omitting `WITH CHECK` on an `UPDATE` or `ALL` policy is not the same as having no write check. The docs: "if no `WITH CHECK` expression is defined, then the `USING` expression will be used both to determine which rows are visible (normal `USING` case) and which new rows will be allowed to be added (`WITH CHECK` case)."

Multiple policies combine by class, not by order. Permissive policies are combined with OR, restrictive policies with AND, and at least one permissive policy must grant access: "When multiple policies of the same command type apply to the same command, then there must be at least one `PERMISSIVE` policy granting access to the relation, and all of the `RESTRICTIVE` policies must pass." Where a statement needs two command types, for example an `UPDATE` with a `WHERE`, the two sets are combined with AND.

One exception worth remembering: a row returned by `RETURNING` is checked against the `SELECT` policies and raises rather than disappearing. "inserted or updated rows to be returned are never silently ignored."

The whole mechanism is row-level. Nothing in `CREATE POLICY` restricts which columns of a permitted row may be written. Column restriction is a separate grant.

## Implies for Dialecta

- Check 2 needs a column question, not just a row question. Every `for update` policy in `supabase/migrations/` is written as `auth.uid() = <owner>`, which permits the owner to write every column of their own row. `comments.final_tier`, `comments.status` and `articles.status` are all reachable that way. Filed as blockers B2 and B1 in the PR 3 review, `exchange/open/2026-09-19-002-handoff-pr-3-review.md`.
- A missing `select` policy reads as an empty table, not as an error. When reviewing a diff that adds a table, an absent policy will not show up as a failing test; it shows up as a page that renders nothing. Ask for the policy, do not wait for the failure.
- `axis_events` in `supabase/migrations/20260919000000_foundation.sql` has a permissive `select` policy and no `insert`, `update` or `delete` policy. Under the combination rule that is correct: no permissive policy for those commands means no grant, so the ledger is append-only for every role that RLS applies to. The service role bypasses RLS, so append-only is a property of clients, not of the table.
- When a policy is written with `using` only on an `update`, read the `using` expression twice, once as the visibility rule and once as the write rule. They are the same expression by default and that is rarely what the author meant.

*Filed 2026-09-19*
