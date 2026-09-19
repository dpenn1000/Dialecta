# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

| File | Source | Implies for |
| --- | --- | --- |
| [2026-supabase-default-grants.md](2026-supabase-default-grants.md) | Supabase, "Securing your API"; changelog 45329 | Check 2, the grant layer. New tables in `public` get insert, update and delete for `anon` and `authenticated` by default. Being removed, but existing tables keep their grants |
| [2026-postgresql-column-privileges.md](2026-postgresql-column-privileges.md) | PostgreSQL 18.6, "GRANT" | Check 2. Column privileges are additive, so a column-level revoke against a table-level grant is a silent no-op. Carries the worked remedy for blocker B2 |
| [2026-postgresql-create-policy.md](2026-postgresql-create-policy.md) | PostgreSQL 18.6, "CREATE POLICY" | Check 2. RLS is row level only, so an owner-writes-own-row policy says nothing about columns. A read failure is silent, a write failure raises |
| [2026-supabase-row-level-security.md](2026-supabase-row-level-security.md) | Supabase, "Row Level Security" | Check 2. `service_role` carries `bypassrls`, and only when the request has no user token. Policy shape: one per operation, `to` clause, `(select auth.uid())` |
| [2026-postgresql-security-definer.md](2026-postgresql-security-definer.md) | PostgreSQL 18.6, "CREATE FUNCTION", writing SECURITY DEFINER safely | Check 2. A definer function needs `pg_temp` last in `search_path` and an explicit revoke from `PUBLIC`, both in one transaction |
| [2026-nextjs-environment-variables.md](2026-nextjs-environment-variables.md) | Next.js 16.3.5, "How to use environment variables" | Check 2. `NEXT_PUBLIC_` is a build-time inline and the prefix is the entire check. Dynamic lookups do not inline |
| [2025-owasp-asvs-authorization.md](2025-owasp-asvs-authorization.md) | OWASP ASVS 5.0.0 (May 2025), "V8 Authorization", full chapter | Check 2. Object level (8.2.2) and field level (8.2.3) are separate requirements at separate levels. 8.1.1 and 8.1.2 ask for documentation Dialecta does not have |
| [review-checklist.md](review-checklist.md) | This agent, from the mandate and the seven notes above | The named failure modes behind check 2, so it is a list rather than a category. Sixteen rows, grant layer first |

*Note: `review-checklist.md` is written by this agent rather than filed from a source. It is listed here so the index is the whole folder.*
