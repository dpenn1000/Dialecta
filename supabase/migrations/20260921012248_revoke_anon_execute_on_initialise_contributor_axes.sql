-- architect's first sweep, 2026-09-21: last night's revoke closed the three
-- functions it named and the repository-wide problem it was an instance of is
-- still open. Four more public functions hold anon EXECUTE, granted by
-- Supabase's ALTER DEFAULT PRIVILEGES rather than by anything in this tree.
--
-- This one is the one that matters. initialise_contributor_axes takes an
-- arbitrary member_id and writes, so anon can call it against any member. It is
-- SECURITY INVOKER, so RLS still applies and bounds what it can actually do,
-- and architect separately established that it aborts on every call today: it
-- inserts 'forming' into archetypes.archetype_id, an enum with no such member.
-- Neither of those is a reason to leave it callable.
--
-- The other three (set_updated_at, quotes_set_updated_at,
-- profiles_subscription_tier_touch) are trigger functions. PostgreSQL does not
-- check EXECUTE on a trigger function when the trigger fires, so revoking
-- should be safe, and "should be" is not good enough to test against a
-- production database at this hour. Recorded for architect and security to
-- rule on with a test behind it rather than closed on a belief.

revoke execute on function public.initialise_contributor_axes(text) from anon;