# Trigger EXECUTE, the default privilege gap, and articles' missing updated_at trigger

Three items from the "still open, deliberately" section of `docs/MORNING-AUDIT-2026-09-21.md`,
each drafted, none applied. Written under `council/security/`, per `security.md`: this seat
reports, the convener applies. All three are independently safe and independently reversible;
none depends on either of the others landing first, in any order.

## Method

Read-only throughout. `mguulnibvzusfvyuowwh` confirmed as the target project on every call by the
presence of `articles`, `comments`, and `profiles` in `list_tables`. Grants read with
`has_function_privilege` / `has_table_privilege` / `has_column_privilege`, not
`information_schema`, per this seat's own standing practice: that view under-reports for a role
the querying session does not hold. Nothing was written, updated, or applied against production;
no `apply_migration` call was made. One external source was fetched and quoted verbatim
(PostgreSQL's own "ALTER DEFAULT PRIVILEGES" page), because the second item turns entirely on a
combination rule this repository had only ever tested in one direction.

## 1. The three trigger functions

`20260921190500_revoke_execute_on_remaining_trigger_functions.sql`.

`set_updated_at()`, `quotes_set_updated_at()`, `profiles_subscription_tier_touch()` each still
hold EXECUTE for public, anon, and authenticated. None is SECURITY DEFINER, none reads or writes
anything beyond the row already in flight, and none is called directly anywhere in this
repository: grepped for each name and for `.rpc('<name>'` across `apps/web`, `api/`, `components/`,
`packages/`, `_recovered/`, `_recovered-next/`, `_theme/`. Every hit is the function's own
definition or a document describing this same gap. A trigger function needs no EXECUTE grant to
fire; Postgres checks the invoking role's table or column privilege on the write instead, the
fact `opinion_map_positions_resolve_identity`'s own migration already states and relies on.

Closes all three roles, not the two the audit's own shorthand names, matching this schema's
already-shipped precedent for the identical shape: `check_handle_not_reserved`, closed earlier
tonight to `{postgres=X, service_role=X}` with none of public, anon, or authenticated holding
anything. Flagged in the file itself as a judgment call.

`opinion_map_positions_resolve_identity` is deliberately not a fourth target. Its own migration
already explains why no grant decision was made for it either way, and it is the precedent the
other two items in this folder follow.

## 2. The default privilege gap for anon

`20260921191500_default_privileges_public_and_anon_on_functions.sql`.

`team/architect/architecture/2026-09-21-rebuild-map.md`'s "Functions" row proposes one statement,
a global revoke of PUBLIC's EXECUTE default. `pg_default_acl` on `mguulnibvzusfvyuowwh` holds no
global (schema-independent) entry for anything; every customization on this project, for every
role, was made per schema. The one covering functions in `public` grants EXECUTE to anon,
authenticated, and service_role by name, set up by Supabase's own project bootstrap before this
repository existed.

PostgreSQL's own documentation, fetched and quoted in the migration file, settles which form each
half needs, and the two halves need opposite forms:

- PUBLIC's EXECUTE is PostgreSQL's built-in default for a new function, never written to
  `pg_default_acl` by anything in this project's history. Only the global form (no `IN SCHEMA`)
  can revoke it; a per-schema attempt is accepted, succeeds, and does nothing.
- anon's EXECUTE was added by an explicit per-schema grant. The documentation's own words: "A
  global REVOKE also cannot undo privileges added via a per-schema GRANT; you must use a
  per-schema REVOKE in the same schema where the grant was made." Only `alter default privileges
  in schema public revoke execute on functions from anon;` closes it. The global form for anon
  would be accepted, would succeed, and would do nothing for schema `public`, the mirror image of
  the trap the architect's own note already names for PUBLIC.

Confirmed not retroactive, for the seven functions the brief named as already relied on
(`comment_bodies`, `comment_tiers`, `own_comment_readings`, `current_profile_id`,
`place_opinion_map_position`, `claim_profile`, `get_own_profile_for_comment`): each already
carries its own explicit ACL with no PUBLIC entry, built by the by-name revoke-then-grant pattern
this repository has used since `20260921004527`. A default only governs a function that does not
yet exist.

`authenticated` carries the same by-name shape in the same ACL and is not touched here; the brief
scoped this to anon, and every SECURITY DEFINER function shipped tonight that needs a client role
at all ends up granting authenticated, so leaving its default alone tracks the schema's own
observed shape rather than closing past what was asked. Noted in the file as the one remaining
one-line, same-form option if the convener wants it: `alter default privileges in schema public
revoke execute on functions from authenticated;`.

## 3. articles.updated_at

`20260921192500_articles_updated_at_trigger.sql`.

`articles` carries `updated_at` (`timestamptz not null default now()`) and zero triggers. Nothing
has ever advanced it past a row's insert time. The fix reuses `public.set_updated_at()`, the same
function already firing on `profiles` and `aspirations`, rather than writing a fourth trigger
function for the first item in this folder to have missed. SECURITY DEFINER is not used and is
not needed: the function only ever touches the row already being written by the statement that
fired it, so there is no privilege gap between what the invoking role can already do and what the
trigger body does.

`authenticated` cannot set `updated_at` directly (excluded from the column grant
`20260921053807_articles_author_write_policy.sql` gave back after narrowing the table-level
grant), and that stays true after this migration: a BEFORE ROW trigger's own write to `NEW` is
not subject to a fresh column-privilege check, which is standard PostgreSQL trigger behavior and
is what makes this pattern usable for an audit column a client is deliberately not allowed to set
by hand, the same shape `published_at`'s five-minute check already relies on in that same
migration.

## Verification

Run each after its own migration lands.

**Item 1.**

```sql
select
  x.fn,
  has_function_privilege('public', x.fn, 'EXECUTE') as public_execute,
  has_function_privilege('anon', x.fn, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', x.fn, 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', x.fn, 'EXECUTE') as service_role_execute
from (values
  ('public.set_updated_at()'::regprocedure),
  ('public.quotes_set_updated_at()'::regprocedure),
  ('public.profiles_subscription_tier_touch()'::regprocedure)
) as x(fn);
```

Expect `public_execute` and `anon_execute` and `authenticated_execute` false, `service_role_execute`
true, on all three rows.

```sql
select proacl::text from pg_proc where oid = 'public.set_updated_at()'::regprocedure;
select proacl::text from pg_proc where oid = 'public.quotes_set_updated_at()'::regprocedure;
select proacl::text from pg_proc where oid = 'public.profiles_subscription_tier_touch()'::regprocedure;
```

Expect `{postgres=X/postgres,service_role=X/postgres}` on all three, matching
`check_handle_not_reserved`'s own ACL today.

Functional, a live write, the convener's call: an ordinary UPDATE against `profiles` or `quotes`
through the app still succeeds and `updated_at` still advances. Nothing about this migration
changes whether the trigger fires, only whether it can be called outside trigger context; a green
functional check confirms the reasoning rather than settling it for the first time.

**Item 2.**

```sql
select
  pg_get_userbyid(d.defaclrole) as role,
  n.nspname as schema_scope,
  d.defaclobjtype,
  d.defaclacl::text
from pg_default_acl d
left join pg_namespace n on n.oid = d.defaclnamespace
where d.defaclobjtype = 'f'
order by schema_scope nulls first, role;
```

Expect a new row with `schema_scope` null, role postgres, acl with no bare `=X` (PUBLIC) entry.
Expect the existing `public` schema row's acl to have lost its `anon=X` entry and kept
`authenticated=X` and `service_role=X`.

The proof that matters, since a default only governs an object that does not exist yet:
create one, inside a transaction, and roll it back. This is a write, run at the convener's
discretion:

```sql
begin;
create function public._default_privilege_probe() returns void language sql as $$ select 1 $$;
select
  has_function_privilege('public', '_default_privilege_probe()'::regprocedure, 'EXECUTE') as public_execute,
  has_function_privilege('anon', '_default_privilege_probe()'::regprocedure, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', '_default_privilege_probe()'::regprocedure, 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', '_default_privilege_probe()'::regprocedure, 'EXECUTE') as service_role_execute;
rollback;
```

Expect `public_execute` and `anon_execute` false, `authenticated_execute` and
`service_role_execute` true. The rollback leaves nothing behind either way.

**Item 3.**

```sql
select tgname, pg_get_triggerdef(oid) as def, tgenabled
from pg_trigger
where tgrelid = 'public.articles'::regclass and not tgisinternal;
```

Expect one row: `articles_updated_at`, `BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE
FUNCTION set_updated_at()`, enabled.

Functional, a live write, the convener's call: update one article's own row through the author
path or service role, touching a column already writable there, and confirm `updated_at` advances
while `created_at` does not.

## Rollback

**Item 1.** Restores the exact pre-migration ACL (public, anon, and authenticated all present,
matching the measured state at the top of that file):

```sql
grant execute on function public.set_updated_at() to public;
grant execute on function public.set_updated_at() to anon;
grant execute on function public.set_updated_at() to authenticated;

grant execute on function public.quotes_set_updated_at() to public;
grant execute on function public.quotes_set_updated_at() to anon;
grant execute on function public.quotes_set_updated_at() to authenticated;

grant execute on function public.profiles_subscription_tier_touch() to public;
grant execute on function public.profiles_subscription_tier_touch() to anon;
grant execute on function public.profiles_subscription_tier_touch() to authenticated;

notify pgrst, 'reload schema';
```

**Item 2.** Restores the behavior (a new function inherits PUBLIC and anon EXECUTE again), not
byte-identical rows in `pg_default_acl`; PostgreSQL does not offer a way to delete a default-acl
customization back to "was never set," only to grant back what was revoked:

```sql
alter default privileges
  grant execute on functions to public;

alter default privileges in schema public
  grant execute on functions to anon;
```

**Item 3.** Drop the trigger only. `set_updated_at()` stays: `profiles` and `aspirations` still
call it.

```sql
drop trigger articles_updated_at on public.articles;
```

## Traps

- **Item 2's two statements are not interchangeable in form**, even though they read almost the
  same. The global form works for PUBLIC and does nothing for anon; the per-schema form works for
  anon and does nothing for PUBLIC (that half is the architect's own finding). Do not simplify
  these to two lines of the same shape.
- **Item 2 does not touch `authenticated`.** A function created after this migration lands still
  inherits `authenticated` EXECUTE by default, deliberately, per "WHY AUTHENTICATED IS NOT A
  THIRD STATEMENT HERE" in that file.
- **Item 1 leaves `opinion_map_positions_resolve_identity` open on purpose,** as the precedent the
  other two files here follow. A future pass closing it should read that function's own migration
  comment first; nothing here duplicates that reasoning.
- **Item 3 depends on nothing in item 1 or item 2, and neither of those depends on item 3.** Apply
  any subset, in any order.
- **None of the three functional checks above were run.** Each is a write against production and
  this session was reads only. The reasoning in each migration file is PostgreSQL's documented
  behavior, stated as such and not dressed up as a measurement; the queries above are what would
  turn it into one.

## Do not touch

- `check_handle_not_reserved`: already closed, cited here only as precedent.
- `opinion_map_positions_resolve_identity`: deliberately out of scope, see above.
- The seven functions confirmed unaffected by item 2 (`comment_bodies`, `comment_tiers`,
  `own_comment_readings`, `current_profile_id`, `place_opinion_map_position`, `claim_profile`,
  `get_own_profile_for_comment`): each already holds its own explicit ACL and needs nothing from
  this folder.
