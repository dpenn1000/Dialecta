-- Comment write path: session-verified identity, not a client-supplied member_uuid.
--
-- security's 2026-09-20 path-to-launch position (council/security/positions/2026-09-20-path-to-launch.md):
-- "Write-time identity is session-verified, not a client-supplied member_uuid
-- matched against a column anon can already read... The durable version, a
-- session-verified caller instead of a lookup, is already the biggest line
-- in builder's 6 to 10 weeks." This migration is the RLS half of that fix;
-- the route handler half is apps/web/src/app/api/comment/route.ts.
--
-- supabase/CLAUDE.md's own rule: "insert and update of own rows through
-- auth.uid(). Pipeline writes use the service role from server code only."
-- A comment is the commenter's own row (auth.uid()-scoped here). Its
-- classification is a system-computed judgment about that row, not the
-- commenter's own content, so it stays a pipeline write on the service role
-- (see the route handler) and gets no policy here, the same closed-by-
-- default posture classifications already has (baseline migration,
-- "classifications_service_only").
--
-- profiles.user_id (added by 20260920000200_profile_claim_tokens.sql) is not
-- in the anon/authenticated column grant list
-- (20260920192954_close_ghost_member_id_as_public_credential.sql), and
-- ghost_member_id was deliberately removed from that same list. A plain
-- `select ... from profiles where user_id = auth.uid()` run as the
-- authenticated role would fail on a column permission before it ever
-- reached a policy. The two functions below sidestep that the same way
-- claim_profile() already does in the same file: SECURITY DEFINER, fixed
-- search_path, scoped internally to auth.uid() so the privilege elevation
-- never returns or matches more than the caller's own row. Neither function
-- touches profiles' general column-grant gap (root CLAUDE.md, "The fix is
-- column grants or a public-profile view, and it waits on the decision
-- below"); that stays exactly where it was, not freelanced here.

begin;

-- ---------------------------------------------------------------------------
-- current_ghost_member_id(): the caller's own member_id, or null.
-- ---------------------------------------------------------------------------
--
-- Scalar, because a policy predicate needs a value to compare against, not
-- a row. Null when auth.uid() is null (anon) or the session has no claimed
-- profile yet; both cases simply match no policy row rather than raising,
-- so a signed-out or unclaimed caller gets a clean RLS denial on the
-- policies below, not a function error.

create or replace function public.current_ghost_member_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.ghost_member_id
  from public.profiles p
  where p.user_id = auth.uid()
  limit 1;
$$;

revoke all on function public.current_ghost_member_id() from public;
grant execute on function public.current_ghost_member_id() to authenticated;

comment on function public.current_ghost_member_id() is
  'The calling session''s own profiles.ghost_member_id, or null if signed out or unclaimed. SECURITY DEFINER so it can read profiles.user_id and .ghost_member_id, neither of which is in the anon/authenticated column grant. Used only to scope RLS policies to a caller''s own rows; never trust a client-supplied member id against this.';

-- ---------------------------------------------------------------------------
-- get_own_profile_for_comment(): the fields the route handler needs to
-- attribute a comment, read through the verified session rather than a
-- client-supplied id.
-- ---------------------------------------------------------------------------

create or replace function public.get_own_profile_for_comment()
returns table (
  profile_id uuid,
  member_id text,
  member_name text,
  member_handle text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.ghost_member_id, p.display_name, p.handle
  from public.profiles p
  where p.user_id = auth.uid();
$$;

revoke all on function public.get_own_profile_for_comment() from public;
grant execute on function public.get_own_profile_for_comment() to authenticated;

comment on function public.get_own_profile_for_comment() is
  'The caller''s own profile, resolved from the verified session (auth.uid()), for the comment write path. Returns zero rows for a signed-in session with no claimed profile. member_name is profiles.display_name; the route treats a null/blank value as an incomplete profile, same shape as the recovered requireCompleteProfile() helper (_recovered/api/_profile-validation.js), not ported verbatim because it also handled an HTTP response shape this function has no business owning.';

-- ---------------------------------------------------------------------------
-- comments: insert and select of the caller's own rows only.
-- ---------------------------------------------------------------------------
--
-- Both checks pin member_id to the verified session via
-- current_ghost_member_id(), never to anything the request body supplies.
-- The insert check also pins status and final_tier so the one write path
-- this policy allows cannot promote or pre-tier its own comment even by
-- accident: status must be the same 'pending_review' the column already
-- defaults to (belt and suspenders, not a second source of truth), and
-- final_tier must be null (classification, and therefore final_tier, is a
-- pipeline write the route makes separately on the service role; see its
-- own comment there). This is the PR-3 review's blocker two closed by
-- construction for the insert path: there is no update policy at all here,
-- so an owner cannot later PATCH final_tier or status on their own row
-- either, on purpose. Add update in whatever increment actually needs
-- editing, with its own column-scoped check.

create policy "members insert their own comments"
  on public.comments for insert
  to authenticated
  with check (
    member_id = public.current_ghost_member_id()
    and status = 'pending_review'
  );

-- CORRECTED ON APPLY, 2026-09-20. This check originally also read
-- `and final_tier is null`, and Postgres rejected the migration: comments has
-- no final_tier column. Tier lives on classifications (ai_suggested_tier,
-- self_declared_tier, final_tier), which is service-role only. So the
-- guarantee that check was reaching for holds by construction and more
-- strongly than the check would have: a commenter cannot set a tier on their
-- own comment because the row has nowhere to put one. Written from the
-- baseline schema rather than from the live table, which is the same class of
-- error the baseline's own LIVE UNVERIFIED markers exist to flag.

create policy "members select their own comments"
  on public.comments for select
  to authenticated
  using (member_id = public.current_ghost_member_id());

commit;
