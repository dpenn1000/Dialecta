# PostgreSQL, default privileges to PUBLIC, by object type

**Source:** PostgreSQL Global Development Group, "Privileges", section 5.8, PostgreSQL 18.6 documentation, read 2026-09-20. https://www.postgresql.org/docs/current/ddl-priv.html
Also Supabase, "Postgres Roles and Privileges" (engineering blog), read 2026-09-20. https://supabase.com/blog/postgres-roles-and-privileges

## Summary

The lead asked for the reasoning behind the role model, not just the defaults already filed in `2026-supabase-default-grants.md`. The Postgres primary source settles a question that note left open: "No privileges are granted to `PUBLIC` by default on tables, table columns, sequences, foreign data wrappers, foreign servers, large objects, schemas, tablespaces, or configuration parameters." Functions are the exception: "`EXECUTE` privilege for functions and procedures" is granted to `PUBLIC` automatically on creation. Table 5.2 in the same section carries this as data: `TABLE` has no default PUBLIC privilege, `FUNCTION`/`PROCEDURE` defaults to `X` (execute), `DATABASE` defaults to connect and temp.

The Supabase post frames the same fact as a role-composition rule rather than a table: "Privileges of a role are union of three sets of privileges: those granted to the role directly, those inherited from the roles this role is an explicit member of, and those inherited from the `public` role." Its worked gotcha is specifically about functions: revoking execute from a named role does nothing if `PUBLIC` still holds it, because the role's actual privilege is the union, and the fix has to name `PUBLIC` as the target of the revoke, not the role.

## Implies for Dialecta

- **Settles a question the B2 remedy left implicit.** `2026-postgresql-column-privileges.md`'s worked fix revokes `UPDATE` on `comments`/`articles`/`aspirations` from `authenticated` and grants back a column list. That remedy is not undermined by a hidden `PUBLIC` grant on those tables, because Postgres grants nothing to `PUBLIC` on tables by default and nothing in `supabase/migrations/` grants to `PUBLIC` explicitly. The table-level revoke-then-grant is the whole fix; there is no third role to also check for a table.
- **Confirms, from a second independent source, why the `SECURITY DEFINER` checklist item (row 9) requires an explicit `revoke execute ... from public`.** Functions are the one object type where skipping that revoke leaves the function callable by every role regardless of what is or is not granted to `anon` or `authenticated` specifically. `2026-postgresql-security-definer.md` already carried this from the `CREATE FUNCTION` docs; this is a second, independent confirmation from a different page and a different vendor's own explanation, which is worth more than either alone.
- General reading, not yet applicable: no `SECURITY DEFINER` function exists in this repo yet, so this remains, like the definer-function note itself, a checklist held in advance rather than a finding against current code.

*Filed 2026-09-20*
