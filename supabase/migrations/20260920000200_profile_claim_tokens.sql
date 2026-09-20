-- Claim tokens: how a legacy Ghost member takes over their profiles row.
--
-- Source: council/security/positions/2026-09-20-path-to-launch.md and
-- council/security/positions/2026-09-20-social-login.md (security seat,
-- 2026-09-20), landed by the path-to-launch council decision
-- (council/log/2026-09-20-path-to-launch.md, "Outcome") as part of M1's
-- shared foundation: docs/plans/phases-and-missions.md, M1 "Done" line, "A
-- legacy profile is taken over only against a valid claim token, never on a
-- bare email match."
--
-- The problem this closes: ADR-002 matches the 14 Ghost members to their
-- existing profiles row by email on first sign-in, and Supabase Auth links
-- identities by email automatically. Whether a given provider's email is
-- genuinely verified before that link happens varies by provider and is not
-- something this project controls (council/security/research/2026-supabase-automatic-identity-linking.md).
-- An email address is a fact an attacker can assert; a token Dan hands a
-- member out of band is not. auth.users is 0 rows today (measured
-- 2026-09-20, phases-and-missions.md M1), so this lands before any of the
-- 14 have signed in and before anything needs a migration to unwind.
--
-- The shape, per security's own sizing: one table (profile_claim_tokens),
-- one column (profiles.user_id, which ADR-002 already names as the shape
-- but which phases-and-missions.md M1 confirms does not exist on the live
-- table), one check (claim_profile below).
--
-- Out of scope here, on purpose: issuing a token (generating the raw
-- value, hashing it, inserting the row, delivering it to the member out of
-- band) and the UI that calls claim_profile. Both are a small follow-up,
-- not part of today's shared-foundation build
-- (team/builder/positions-2026-09-20-path-to-launch.md).
--
-- Not touched here, and flagged rather than freelanced, matching the
-- baseline migration's own posture: profiles_select already runs
-- `using (true)`, so the new user_id column is as publicly readable as
-- every other column on profiles (is_admin, subscription_tier, ...). That
-- gap is already tracked in root CLAUDE.md ("The fix is column grants or a
-- public-profile view, and it waits on the decision below") and stays
-- there; a publicly readable user_id does not weaken claim_profile's own
-- checks below, which never trust anything read back off profiles.

-- ---------------------------------------------------------------------------
-- profiles.user_id: the column a claim actually sets.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column user_id uuid unique references auth.users (id) on delete set null;

comment on column public.profiles.user_id is
  'The Supabase Auth identity this profile belongs to. Null until claimed (the 14 legacy members, via public.claim_profile) or until a new-signup path links it. Never set directly by client code.';

-- ---------------------------------------------------------------------------
-- profile_claim_tokens
-- ---------------------------------------------------------------------------

create table public.profile_claim_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  -- Never the raw token, same reasoning as a password column: a leaked
  -- table (a backup, a misconfigured read grant) should not hand out
  -- working tokens. Hashed with pgcrypto's digest(), resolved through
  -- claim_profile()'s own fixed search_path below rather than compared in
  -- application code.
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null
);

create index profile_claim_tokens_profile_idx on public.profile_claim_tokens (profile_id);

comment on table public.profile_claim_tokens is
  'One-time tokens gating profiles.user_id takeover. Issued out of band (Supabase Studio or a future admin script, service role only); consumed only through public.claim_profile(). No select/insert/update/delete policy for anon or authenticated: closed by default, the same posture the baseline migration takes on every admin-only table.';

alter table public.profile_claim_tokens enable row level security;

-- Deliberately no policy of any kind. A token is issued by Dan (service
-- role, bypasses RLS) and consumed only through claim_profile()'s security
-- definer path below, which does not need one. Closed by default is the
-- safe state; an explicit policy is a later decision, not an oversight.

-- ---------------------------------------------------------------------------
-- claim_profile(token): the one check.
-- ---------------------------------------------------------------------------
--
-- SECURITY DEFINER hardening, all four questions from
-- team/reviewer/knowledge/2026-postgresql-security-definer.md answered:
--   1. search_path is fixed: public, extensions, pg_temp, with pg_temp last
--      so a malicious temp object can never shadow a trusted one
--      (PostgreSQL's own worked example for this hazard). extensions is
--      included because Supabase-hosted projects commonly provision
--      pgcrypto there rather than in public, and this migration has no way
--      to read the live project to confirm which; digest() resolves
--      correctly either way under this search_path, and pg_temp stays last
--      regardless. gen_random_uuid(), encode() and now() are pg_catalog
--      builtins, always searched first regardless of this setting, so they
--      are unaffected.
--   2. CREATE FUNCTION, the REVOKE and the GRANT run inside one explicit
--      transaction below, so there is no window where the function is
--      callable by every role.
--   3. Execute is revoked from PUBLIC and granted only to authenticated.
--      Claiming requires a live Supabase Auth session; auth.uid() is also
--      checked in the body besides, so a stray grant is not the only thing
--      standing between anon and this function.
--   4. The only tables this function writes are profiles and
--      profile_claim_tokens, both created or altered in this same file.
--      There is no other table's RLS policy this definer function, owned by
--      postgres, could be quietly bypassing by running as its owner.

begin;

create or replace function public.claim_profile(token text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions, pg_temp
as $$
declare
  v_profile_id uuid;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception 'claim_profile requires a signed-in Supabase Auth session';
  end if;

  if token is null or length(btrim(token)) = 0 then
    raise exception 'claim_profile requires a token';
  end if;

  v_hash := encode(digest(token, 'sha256'), 'hex');

  -- Single-use, atomically: the UPDATE's row lock is what stops two
  -- concurrent calls with the same token both passing the used_at check.
  -- Whichever loses this race simply matches zero rows below.
  update public.profile_claim_tokens
     set used_at = now(),
         used_by_user_id = auth.uid()
   where token_hash = v_hash
     and used_at is null
     and expires_at > now()
  returning profile_id into v_profile_id;

  if v_profile_id is null then
    raise exception 'claim_profile: token is invalid, expired, or already used';
  end if;

  -- Never overwrite an existing claim. If this profile already has a
  -- user_id, or if auth.uid() is already bound to a different profile (the
  -- unique constraint on profiles.user_id enforces the second case), this
  -- update matches no row and the exception below rolls back the whole
  -- transaction, including the token update above: the token is not spent
  -- on a claim that did not happen.
  update public.profiles
     set user_id = auth.uid()
   where id = v_profile_id
     and user_id is null;

  if not found then
    raise exception 'claim_profile: profile % is already claimed', v_profile_id;
  end if;

  return v_profile_id;
end;
$$;

revoke all on function public.claim_profile(text) from public;
grant execute on function public.claim_profile(text) to authenticated;

commit;
