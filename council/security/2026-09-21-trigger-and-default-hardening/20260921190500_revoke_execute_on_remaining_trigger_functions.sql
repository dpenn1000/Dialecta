-- DRAFT. Not applied. Written by the security seat on the convener's brief, 2026-09-21, closing
-- docs/OPEN-ITEMS.md row 2.3 and the "still open, deliberately" bullet in
-- docs/MORNING-AUDIT-2026-09-21.md: "Three trigger functions still hold public execute. Revoking
-- should be safe and was not tested against production overnight."
--
-- The placeholder timestamp in this filename is not binding. apply_migration assigns its own
-- version at landing regardless of a draft's own name (20260921154615_comment_bodies_breach_
-- withheld.sql landed as 20260921154615 despite its draft copy in this same folder tree being
-- named 20260921183000; the number in a draft filename is ordering within the draft set only).
--
-- MEASURED, mguulnibvzusfvyuowwh, 2026-09-21, read-only role, before writing a line below.
-- pg_proc joined to pg_trigger for every function in public that fires as a trigger:
--
--   function                          | fires on                          | public | anon | authenticated | secdef
--   check_handle_not_reserved()       | profiles_handle_check              | false  | false | false          | true
--   opinion_map_positions_resolve_identity() | opinion_map_positions_resolve_identity | true | true | true    | true
--   profiles_subscription_tier_touch()| profiles_subscription_tier_touch   | true   | true  | true           | false
--   quotes_set_updated_at()           | quotes_updated_at                  | true   | true  | true           | false
--   set_updated_at()                  | aspirations_set_updated_at, profiles_updated_at | true | true | true | false
--
-- Three, not five, are this migration's business:
--   * check_handle_not_reserved is already closed (the four-functions revoke, exchange/open/
--     2026-09-20-architect-02, docs/OPEN-ITEMS.md row 2.3's own parenthetical). Untouched here.
--   * opinion_map_positions_resolve_identity is untouched here on purpose. It was created tonight
--     by 20260921152637_opinion_map_positions_identity_expand.sql, whose own header already
--     states the fact this migration also relies on and explains why no revoke was written for
--     it: "No EXECUTE grant is given or revoked for it: Postgres does not check EXECUTE on a
--     trigger function to fire it, only the calling role's privilege to perform the INSERT/
--     UPDATE itself." That function is the precedent this migration follows, not a fourth target;
--     closing it is the same shape as the three below and is left for whoever next touches that
--     migration's own follow-up, so this one stays scoped to the three the audit named.
--   * set_updated_at, quotes_set_updated_at, profiles_subscription_tier_touch are the three.
--     Confirmed against the live functiondefs, 2026-09-21: none is SECURITY DEFINER, none reads
--     or writes any table besides the row already in flight on NEW, and each only ever runs as a
--     BEFORE UPDATE trigger on profiles, quotes, or aspirations.
--
-- CONFIRMED NOTHING CALLS THEM DIRECTLY. Grepped apps/web, api/, components/, packages/,
-- _recovered/, _recovered-next/, _theme/, docs/ for each function name and for
-- `.rpc('set_updated_at'`, `.rpc('quotes_set_updated_at'`, `.rpc('profiles_subscription_tier_
-- touch'` by any quote style. Every hit is a CREATE FUNCTION, a CREATE TRIGGER, or a doc
-- describing the same finding this migration closes (docs/OPEN-ITEMS.md, docs/Dialecta_Project_
-- Index.md, team/architect/knowledge/2026-postgres-alter-default-privileges.md,
-- exchange/open/2026-09-20-architect-02, _recovered's own historical migrations that first
-- created these functions). No application code calls any of the three by RPC, and a call
-- outside trigger context would fail regardless (a plpgsql trigger function raises "trigger
-- functions can only be called as triggers" if invoked as a plain function; architect's own note
-- above independently reached the same reachable-harm conclusion for two of the three before
-- initialise_contributor_axes displaced it as the fourth).
--
-- WHY THE REVOKE IS SAFE. Postgres checks EXECUTE on a function only when a role calls it
-- directly (a plain SELECT/PERFORM, or PostgREST's implicit rpc/<name> exposure of anything a
-- client role can execute). Firing a trigger is not a call in that sense: it is driven by the
-- INSERT/UPDATE/DELETE on the table, and the privilege Postgres checks is the invoking role's
-- table-level (or column-level) privilege on that statement plus whatever RLS policy applies,
-- never EXECUTE on the trigger function itself. This is the same fact
-- opinion_map_positions_resolve_identity's own migration states and relies on, and it is why
-- that function fires correctly today already holding no explicit grant decision either way.
-- Revoking EXECUTE here removes an unnecessary PostgREST rpc/<name> surface (each of the three
-- was reachable as e.g. POST /rest/v1/rpc/set_updated_at and would return a plain Postgres error,
-- "trigger functions can only be called as triggers", to anon or authenticated) without touching
-- whether aspirations_set_updated_at, profiles_updated_at, profiles_subscription_tier_touch, or
-- quotes_updated_at fire on their tables.
--
-- ALL THREE ROLES, NOT TWO. The audit bullet and docs/OPEN-ITEMS.md row 2.3 each name only one of
-- public or anon in their own shorthand, but the measured ACL above shows all three of public,
-- anon and authenticated holding EXECUTE on all three functions, and nothing calls any of them
-- directly under any role. Revoking only public and anon would leave authenticated with a working
-- rpc/<name> path to a function that still only errors when called that way: a grant with no
-- caller and no purpose. This schema's own precedent for exactly this shape, a trigger function
-- with no legitimate direct caller, is check_handle_not_reserved, closed earlier tonight to
-- {postgres=X, service_role=X} only, holding none of public, anon or authenticated. This
-- migration matches that shape for all three functions rather than the narrower two-role reading,
-- flagged here as a judgment call beyond the literal wording of the request, not a silent
-- expansion of it.
--
-- service_role is untouched throughout: nothing below names it, and it is unaffected by a
-- REVOKE that does not name it.

revoke execute on function public.set_updated_at() from public;
revoke execute on function public.set_updated_at() from anon;
revoke execute on function public.set_updated_at() from authenticated;

revoke execute on function public.quotes_set_updated_at() from public;
revoke execute on function public.quotes_set_updated_at() from anon;
revoke execute on function public.quotes_set_updated_at() from authenticated;

revoke execute on function public.profiles_subscription_tier_touch() from public;
revoke execute on function public.profiles_subscription_tier_touch() from anon;
revoke execute on function public.profiles_subscription_tier_touch() from authenticated;

notify pgrst, 'reload schema';
