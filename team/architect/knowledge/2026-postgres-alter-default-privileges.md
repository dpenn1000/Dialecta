# ALTER DEFAULT PRIVILEGES, and the four functions anon can still execute

**Source:** PostgreSQL, "ALTER DEFAULT PRIVILEGES",
https://www.postgresql.org/docs/current/sql-alterdefaultprivileges.html, fetched 2026-09-20.
Corroborated against the live Dialecta database (`mguulnibvzusfvyuowwh`) through the Supabase MCP
`execute_sql`, read-only, same date.

**Lead state:** filed, lead 1. The lead's premise is right and its tense is wrong: the three
functions it names were fixed last night, and four others were never in scope.

## What the documentation actually says

Three sentences carry the whole rule.

> "ALTER DEFAULT PRIVILEGES allows you to set the privileges that will be applied to objects
> created in the future. (It does not affect privileges assigned to already-existing objects.)"

So it is not a repair tool. It changes the next object, never the last one.

> "the default privileges for any object type normally grant all grantable permissions to the
> object owner, and may grant some privileges to PUBLIC as well."

For functions, that PUBLIC grant is EXECUTE, and it is applied at creation with no statement
anywhere recording it. This is the mechanism behind the 2026-09-20 finding in this repository:
nobody granted anon anything. PUBLIC holds EXECUTE by default, anon is a member of PUBLIC, and
the grant exists because the function exists.

The third sentence is the trap, and it is the one that makes a plausible fix fail silently:

> "This command has no effect, unless it is undoing a matching GRANT... That's because per-schema
> default privileges can only add privileges to the global setting, not remove privileges granted
> by it."

A per-schema `ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC`
is accepted, returns success, and does nothing. The form that works omits `IN SCHEMA`.

## What is true on live right now

Method: `has_function_privilege('anon', p.oid, 'EXECUTE')` over every function in `public`, read
from `pg_proc`, with `proacl` printed alongside. Not `information_schema`, for the reason in
`2026-information-schema-vs-pg-catalog.md`.

Migration `20260921004527_revoke_anon_execute_on_session_scoped_functions` is applied and it
worked. Four functions are now closed to anon and their ACLs carry no PUBLIC entry at all:
`claim_profile`, `current_ghost_member_id`, `get_own_profile_for_comment`,
`check_handle_not_reserved`.

**Four other functions still hold both the PUBLIC default and an explicit anon grant.** Their ACL
reads `{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}`,
where the leading `=X` is the PUBLIC EXECUTE the documentation describes:

| Function | Shape | Reachable harm |
| --- | --- | --- |
| `set_updated_at()` | trigger | None. A trigger function called directly errors without trigger context |
| `quotes_set_updated_at()` | trigger | Same |
| `profiles_subscription_tier_touch()` | trigger | Same |
| `initialise_contributor_axes(p_member_id text)` | plain function, returns void, writes two tables | Gated, see below |

**The fourth one is not a trigger and I checked it rather than assuming.** `prosecdef` is false, so
it is SECURITY INVOKER: an anon caller executes it as anon and still meets RLS on `axis_scores` and
`archetypes`. The grant is untidy and inconsistent with the four that were closed. It is not an
open door, and I nearly filed it as one. Reading `pg_get_functiondef` is what stopped that.

## What this implies for Dialecta

- **The revoke migration was scoped to session functions and the trigger functions were left.**
  That is defensible and it is not written down anywhere, which is how it becomes a surprise later.
  A follow-up revoking PUBLIC and anon EXECUTE on the remaining four costs one migration and closes
  the class rather than the instance.
- **The durable fix is the global form, applied once**, so newly created functions do not
  reintroduce the grant one at a time:
  `ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;` with no `IN SCHEMA`. Without
  it, every future function ships with PUBLIC EXECUTE and the audit has to be re-run forever.
- **The check that catches it** is a single query over `pg_proc` asserting
  `has_function_privilege('anon', oid, 'EXECUTE') = false` for everything in `public`. It belongs in
  the same harness as the RLS tests, because it is the identical failure shape: a default nobody
  wrote down.

## Implies for

Practice: "a grant is read from `pg_catalog` and a default is revoked globally, never per schema."
Related: `2026-information-schema-vs-pg-catalog.md`, which is how the audit above was run.
`security` holds the supply-chain and privilege position and should see the four open functions.

*Filed 2026-09-20*
