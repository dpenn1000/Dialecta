# Live grant and policy surface

**Source:** This agent, measuring Supabase project `mguulnibvzusfvyuowwh` on 2026-09-20 with
read-only catalog queries against `pg_class`, `pg_policies`, `pg_proc` and `has_table_privilege`.
No rows were written and no application endpoint was called.

## Method, and one trap worth keeping

The first query used `information_schema.role_table_grants` filtered to `anon` and `authenticated`.
It returned no grants on any table, which would have meant the database was closed. That reading was
wrong. PostgreSQL documents the view as showing only grants "where the grantor or grantee is a
currently enabled role", so a session that does not hold `anon` sees none of `anon`'s grants. The
view reports silence as absence.

`has_table_privilege('anon', oid, 'SELECT')` asks the question directly and is not filtered by the
current session's roles. Re-run that way, the answer inverted completely.

## What is granted

All 30 tables in `public` grant SELECT, INSERT, UPDATE and DELETE to both `anon` and
`authenticated`. There are no exceptions and no column level narrowing.

This confirms the assumption the reviewer reasoned to rather than read. The grant layer offers no
defense in depth. Row Level Security is the only control between the anonymous publishable key and
full CRUD on every table, including `profiles`, `comments`, `admin_roles` and
`profile_admin_capability_grants`.

## What RLS does with it

RLS is enabled on all 30 tables. `FORCE ROW LEVEL SECURITY` is off on all 30. There are 31 policies,
one per table except `handle_history`, which has two.

Reads resolve as follows. Five tables are readable by anyone: `archetypes`, `axis_scores`,
`follows` and `profiles` on `USING (true)`, and `handle_history` for `authenticated` only. Five more
are readable through a filter: `articles` on `status = 'published'`, `comments` on
`status = 'published'`, `quotes` on `status = 'live'`, `feed_events` on `visibility = 'public'`,
`sparring_partners` on both visibility flags, and `opinion_map_positions` on the caller's own JWT
`sub`. The remaining tables carry `USING (false)` and return nothing.

Writes are closed everywhere, and the reason matters. No table carries a permissive INSERT, UPDATE
or DELETE policy that any role other than `service_role` can satisfy. Where a policy exists at all
for writes it is `FOR ALL ... USING (false) WITH CHECK (false)`. RLS denies a command with no
applicable policy, so the open INSERT, UPDATE and DELETE grants have nothing to act through.

`celebration_events` carries a single policy scoped `TO service_role`. No policy applies to `anon` or
`authenticated`, so the table is closed to them by default deny. `service_role` holds `bypassrls`
regardless, which makes that policy inert rather than wrong.

## SECURITY DEFINER and views

One SECURITY DEFINER function exists in `public`: `check_handle_not_reserved`, owned by `postgres`,
with `search_path=""` pinned, and EXECUTE held by neither `anon` nor `authenticated`. That is the
hardened shape, and migration `028b_pin_search_path_post_replace.sql` is presumably where it came
from.

One view exists in `public`: `profile_effective_capabilities`, owned by `postgres`, with
`security_invoker = on`. Both roles hold SELECT on it. Because `security_invoker` is on, the view
evaluates the caller's RLS against `profile_admin_roles`, `admin_role_capabilities` and
`profile_admin_capability_grants`, all of which are `USING (false)` for public. An anonymous select
returns zero rows.

## Implies for Dialecta

- The reviewer's load bearing assumption is confirmed, and **blocker B2 does not drop**. Record
  2026-09-19-002 states it conditionally: "If those grants are not present, blocker B2 drops to
  should-fix." They are present, on all 30 tables, for both roles. B2 holds at blocker and B1 was
  never contingent on it.
- Keep the two schemas apart when reading that record. The reviewer reviewed
  `supabase/migrations/20260919000000_foundation.sql`, which has never been applied to this project,
  against a live database it did not read. This note measures the live database, which carries a
  different policy set. The measurement does not re-decide B1 or B2 on their own terms. What it
  settles is the premise underneath them, that Supabase hands `anon` and `authenticated` full CRUD
  on a new `public` table by default, and on this project it demonstrably did.
- The live schema and the proposed one fail in opposite directions, which is why the two must not be
  averaged. Live, writes are closed, because no table carries a write policy any public role can
  satisfy. The proposed migration adds owner writes own row policies. Applied on top of grants that
  are already open, those policies are live the moment the migration runs, which is exactly the
  reachability B2 describes. The grant layer is loaded and the migration is what fires it.
- Any remedy that revokes the grants has to happen before or with that migration, not after. Doing
  it after means a window where the policies are live and the grants are open.
- `profiles` is confirmed open. Policy `profiles_select`, `FOR SELECT TO public USING (true)`, with
  no column grants narrowing it. `is_admin`, `subscription_tier`, `pact_signed_name`,
  `order_negotiation_log` and `ghost_member_id` are all readable with the publishable key. The
  remedy is column grants or a public view, and it is the one database item that is reachable today.
- `FORCE ROW LEVEL SECURITY` being off on all 30 tables is currently harmless, because the only
  definer function is not executable by either public role and the only view is invoker scoped. It
  stops being harmless the moment a definer function is added. Treat `prosecdef = true` plus
  `forced = false` as a pair to re-measure on every migration.
- Every policy targets `{public}` rather than a named role. Supabase's own guidance is to name the
  role in a `TO` clause. For a `USING (false)` lockdown the effect is identical, so this is a
  legibility and performance note rather than a hole. It is worth fixing while the tables are small.
- Root `CLAUDE.md` describes this surface as "nine tables closed" and "six fully public". Both counts
  are close but neither is right, and `comments`, `articles`, `quotes` and `feed_events` are
  filtered rather than closed or public. Correct the block rather than leave two measurements in
  the repo that disagree.
- Add `has_table_privilege` to the standing method and strike `information_schema.role_table_grants`
  from it.
- `node scripts/check-env.mjs --rls` does not carry this trap. It probes with the real publishable
  key over PostgREST and counts rows, which measures effective read access directly. Its limits are
  different ones. It reads a hardcoded list of 18 tables against the 30 that exist, so
  `admin_audit_log`, `admin_capabilities`, `admin_role_capabilities`, `celebration_events`,
  `feedback_items`, `handle_history`, `notification_prefs`, `opinion_map_overrides`,
  `opinion_map_positions`, `profile_admin_capability_grants`, `profile_admin_roles` and
  `sparring_partners` are never probed, and a new table is never added to the list by anything. It
  also measures reads only, so it would not have seen the grant layer or the absence of write
  policies. The two methods answer different questions and both are worth keeping.

*Filed 2026-09-20*
