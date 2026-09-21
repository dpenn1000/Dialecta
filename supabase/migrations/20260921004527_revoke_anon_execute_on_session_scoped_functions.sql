-- Close anon out of the three session-scoped functions, which the two
-- migrations that created them believed they had already done.
--
-- Supabase grants EXECUTE on every new function in public to anon and
-- authenticated through ALTER DEFAULT PRIVILEGES. `revoke all on function ...
-- from public` does not remove those: they are explicit grants to named roles,
-- not the PUBLIC pseudo-role. Measured after applying both migrations,
-- has_function_privilege('anon', ...) was true for all three.
--
-- Nothing leaked. All three scope internally to auth.uid(), which is null for
-- anon: current_ghost_member_id() returns null, get_own_profile_for_comment()
-- returns zero rows, and claim_profile() raises before it looks at the token.
-- The grant contradicted what those migrations say they do, and any later edit
-- to a body would have been one line from making it matter.
--
-- The standing lesson, which this project has hit before: on Supabase, pair
-- every `revoke ... from public` with an explicit `revoke ... from anon`.

revoke execute on function public.claim_profile(text) from anon;
revoke execute on function public.current_ghost_member_id() from anon;
revoke execute on function public.get_own_profile_for_comment() from anon;
