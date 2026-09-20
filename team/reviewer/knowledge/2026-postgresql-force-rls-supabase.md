# FORCE ROW LEVEL SECURITY: what it does, and why it would not help on Supabase specifically

**Source:** PostgreSQL Global Development Group, "ALTER TABLE", PostgreSQL 18.6 documentation, read 2026-09-20. https://www.postgresql.org/docs/current/sql-altertable.html
Cross-referenced against `2026-postgresql-create-policy.md` section 5.9 (already filed) and a secondary check of Supabase-focused discussion of table ownership, read 2026-09-20.

## Summary

Primary source on the mechanism: "These forms control the application of row security policies belonging to the table when the user is the table owner... If disabled (the default) then row-level security will not be applied when the user is the table owner." `FORCE ROW LEVEL SECURITY` flips that default so policies apply to the owner too.

**The question this was filed to answer: whether it belongs on Dialecta's tables. It does not, and the reason is specific to how Supabase assigns ownership, not a general Postgres fact.** Every table `supabase/migrations/` creates is owned by `postgres`, the role migrations run as. On a Supabase project, that same `postgres` role also carries the `bypassrls` attribute. Postgres section 5.9, already filed, states the rule that makes this decisive: "Superusers and roles with the `BYPASSRLS` attribute always bypass the row security system when accessing a table," and this is stated as independent of, and unaffected by, the owner-specific `FORCE` setting. `FORCE ROW LEVEL SECURITY` only removes the owner's *ownership-based* bypass; it does nothing to a bypass granted by the `BYPASSRLS` attribute itself. Since `postgres` on Supabase holds both, setting `FORCE ROW LEVEL SECURITY` on a Dialecta table would not change what a `postgres`-authenticated connection, or the `service_role` (which `2026-supabase-row-level-security.md` already confirms carries `bypassrls` directly), can do to that table.

This resolves the checklist's row 9b as a caution that was already correctly scoped, rather than one that needed `FORCE` added to it. The real control was never a table setting; it is which connections are allowed to authenticate as `postgres` or `service_role` at all, which is exactly what row 9's four-part `SECURITY DEFINER` checklist already polices for functions, and what "the Data API connects as `anon` or `authenticated`, never as the owner" already covers for ordinary requests.

## Implies for Dialecta

- **Closes the open question as a "no," not as still-open.** Revise checklist row 9b: the caution stands, but not because `FORCE ROW LEVEL SECURITY` is a pending hardening step. It stands because the exposure is scoped to whatever is allowed to connect as `postgres` or `service_role`, and `FORCE` cannot narrow that. See the edit to `review-checklist.md`.
- No action item follows for `supabase/migrations/`. Adding `FORCE ROW LEVEL SECURITY` there would be a no-op finding, reviewing as a hardening step while changing nothing reachable through the Data API or through a `service_role` connection, which are the only two ways this repo's own code reaches these tables today.
- The residual risk this row 9b was gesturing at is entirely a `SECURITY DEFINER` question, already covered at the depth this checklist can reach by `2026-postgresql-security-definer.md` and row 9. No new row is needed; the existing one just stops citing `FORCE ROW LEVEL SECURITY` as a live option.

*Filed 2026-09-20*
