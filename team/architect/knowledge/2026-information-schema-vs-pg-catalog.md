# information_schema against pg_catalog, settled on live data

**Source:** the live Dialecta database (`mguulnibvzusfvyuowwh`), read-only through the Supabase MCP
`execute_sql`, 2026-09-20. One query, both methods, same functions, same transaction.

**Lead state:** filed, lead 3. The lead asks which this seat trusts. The answer is `pg_catalog`, and
this note has the disagreement on record rather than the reasoning for it.

## The experiment

One query over every function in `public`, asking the same question two ways:

- `has_function_privilege('anon', p.oid, 'EXECUTE')`, which asks the privilege system directly.
- an existence check against `information_schema.routine_privileges` for grantee `anon`.

## The result

They disagree, on four functions, in the same query.

| Function | `has_function_privilege` | `information_schema` | `proacl` |
| --- | --- | --- | --- |
| `initialise_contributor_axes` | true | false | `{=X/postgres,...,anon=X/postgres,...}` |
| `set_updated_at` | true | false | same shape |
| `quotes_set_updated_at` | true | false | same shape |
| `profiles_subscription_tier_touch` | true | false | same shape |

The raw ACL settles which is right. `anon=X/postgres` is an explicit EXECUTE grant to anon, written
in the catalog, and `=X/postgres` is the PUBLIC grant on top of it. anon can execute all four.
`information_schema` reported no grant for any of them.

## Why, and it is not a bug

The SQL standard defines the `information_schema` views to show only what the current user has
access to. PostgreSQL implements that faithfully: the privilege views filter to rows where the
current role is the grantor, the grantee, or a member of a grantee role. A role auditing a third
role's privileges is exactly the case that filter removes.

That makes `information_schema` structurally wrong for the job an audit does. It is not returning a
stale answer or a subtly different one. It is returning the answer to a different question, "what
can I see," when the question asked was "what can anon do." The two coincide often enough that the
mistake survives testing.

This is the same shape as the 2026-09-20 finding the lead was written from, and it generalises past
grants: `information_schema` also collapses types (`text` and `uuid` both read as `character
varying` or `uuid` depending on the view) and cannot show check constraints at all in a usable form.

## What this implies for Dialecta

- **Any control that decides whether a check passes reads `pg_catalog`.** Grants through
  `has_*_privilege` or `proacl` and `relacl`. Columns and types through `pg_attribute` and
  `format_type`. Constraints through `pg_constraint` and `pg_get_constraintdef`. Function bodies
  through `pg_get_functiondef`.
- **`information_schema` stays useful for one thing: a quick existence check on a table or column
  name while exploring.** It is convenient and it is portable. It is not evidence.
- **This retires a whole class of near-miss.** Every schema claim in
  `2026-live-baseline-unverified-markers.md` was read through `pg_catalog` because of this note, and
  three of the findings there (two column types and a check constraint that was reported absent and
  is present) are invisible to `information_schema` and to `supabase/types.ts` alike.

## Implies for

Practice: "read schema and grant facts from `pg_catalog`, never from `information_schema` or
`types.ts`, whenever the answer decides something." Related:
`2026-postgres-alter-default-privileges.md` (the audit this method was built for),
`2026-live-baseline-unverified-markers.md` (where it paid), and `migrator`'s
`2026-supabase-type-generation-drift.md`, which reaches the same conclusion about `types.ts` by a
different route and should be read as agreeing with this.

*Filed 2026-09-20*
