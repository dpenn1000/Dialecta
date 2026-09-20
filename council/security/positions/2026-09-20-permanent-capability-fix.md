# Permanent fix for the capability defect

**Seat:** security. **Written:** 2026-09-20. **Status:** recommendation, with migration SQL for
review. Not run against any database and not written into `supabase/migrations/`, per this task's
own hard rules.

## Brief

The convener's diagnosis holds: there is no session to verify, so patching `_capabilities.js`
cannot be the permanent fix, and `auth.uid()` is the right anchor. The literal mechanism does not
survive contact with this schema unchanged. A bare RLS policy on `profile_admin_roles` hits two
real traps: self-referential recursion, and a column-grant wall `claim_profile` never had to
cross. The fix is a small set of `SECURITY DEFINER` functions anchored on `auth.uid()`, not table
policies. `admin_roles`, `admin_capabilities`, `profile_admin_roles`, `admin_audit_log` keep their
shape and their current closure; nothing is replaced. The migration below is complete. The audit
log becomes evidence by construction, not by repair. Two more surfaces share the shape; only one
is confirmed to share the defect.

---

## 1. Is the RLS design right

**The anchor is right. The mechanism as stated is not, and it fails in a shape this project has
already been burned by twice today: a control that looks like it closes something, read against
source, does not.**

The reasoning for the anchor itself is sound and it is not new to this document. Today's own
`apps/web/src/lib/supabase/middleware.ts` already states it, unprompted, in its own comment on why
it calls `getClaims()` and not `getSession()`: `getSession` "reads the session out of the cookie
without verifying it, the same class of trust-the-client mistake as `api/comment.js` trusting a
body-supplied `member_uuid`." Whoever wrote today's session plumbing had already generalized this
finding before the convener's brief existed. `auth.uid()` is the one value in this stack that a
client cannot assert; it exists only after Supabase's own infrastructure verifies a JWT signature.
Nothing else in `profiles`, `profile_admin_roles`, or any request parameter has that property. The
north star is right.

**Where the literal proposal breaks, tested point by point:**

**A. Self-referential RLS on the table that grants the capability is a documented recursion trap,
not a style preference.** A policy on `profile_admin_roles` that reads "you may see a row if you
hold `members.view`," where holding `members.view` is itself determined by reading
`profile_admin_roles`, is the exact shape Postgres's RLS documentation and Supabase's own guidance
warn produces "infinite recursion detected in policy for relation" or, where it doesn't outright
error, a per-row correlated subquery with none of the caching a function gets. `council/security/
research/2026-supabase-rls-testing.md` and `2026-supabase-column-level-security.md`, both filed by
this seat today, are about the two mechanisms (grants, views) this project already leans on; neither
covers this specific trap because nobody had written a self-referential admin policy yet to trigger
it. The fix Supabase's own docs recommend, and the one below uses, is a `SECURITY DEFINER`,
`STABLE` helper function the policy calls instead of a raw subquery on the same table. The function
runs as its owner, never re-enters RLS on the table it is answering for, and the "recursion" simply
does not exist inside it.

**B. A policy that looks right and is wrong: a raw subquery against `auth.uid()` -> `profiles.id`
cannot actually run as `authenticated`, because the column it needs is not granted.**
This is the sharpest catch, because it hides behind `claim_profile`, which makes the identical query
shape look proven. `claim_profile`'s body reads `update public.profiles set user_id = auth.uid()
... where id = v_profile_id`, and that works. But `claim_profile` is itself `SECURITY DEFINER`,
running as `postgres`, which owns `profiles` and bypasses column grants the same way it bypasses
RLS. `profiles.user_id` was added by this morning's claim-token migration and was never added to
the column allowlist the evening migration (`20260920192954_close_ghost_member_id_as_public_
credential.sql`) put in place: `grant select (id, display_name, ... current_aspiration_id) on
public.profiles to anon, authenticated` does not list `user_id`. Confirmed by reading both
migrations against each other, not assumed: `authenticated` cannot `select user_id from profiles`
today. A hand-written policy of the form `using (profile_id = (select id from profiles where
user_id = auth.uid()))`, attached directly to `profile_admin_roles` and evaluated as the querying
role the way a plain table policy is, would fail with a column permission error the first time
anyone but `postgres` hit it. This is not hypothetical inference; it is the direct, read
consequence of a migration written at 00:02 this morning assuming a grant state that a second
migration, at 19:29, closed a few lines later the same day, exactly the "two schemas, don't
average them" trap this seat's own `2026-live-grant-and-policy-surface.md` already named once
today for a different pair of files. The fix is the same as A: a `SECURITY DEFINER` function
resolves `auth.uid()` to a profile id once, and nothing downstream ever needs to read
`profiles.user_id` back from the client's own privilege level. This is worth stating plainly:
**`profiles.user_id` staying off the public column grant is correct and should stay that way.** The
claim-token migration's own comment worried it would be "as publicly readable as every other
column," written before the evening migration landed; that worry is now overtaken by a later
migration the same day and should be read as resolved, not outstanding.

**C. The one view already in front of this schema, `profile_effective_capabilities`, is already
hardened, and the naive fix would have been to leave it alone and add policies under it. That
would still return zero rows for everyone.** `council/security/research/2026-live-grant-and-
policy-surface.md` (this seat, today) measured it live: `security_invoker = on`, owned by
`postgres`, both `anon` and `authenticated` hold `SELECT`. That is the correct shape. But
`security_invoker` means the view evaluates RLS as the calling role, and `profile_admin_roles`,
`admin_role_capabilities`, and `profile_admin_capability_grants`, the three tables it joins, are
all `using (false)` for every role but `service_role`. An `authenticated` caller querying the view
directly gets zero rows today regardless of what they actually hold, which is a different failure
than the one this task opened with (spoofable identity) but would masquerade as "fixed" the moment
`auth.uid()` started resolving correctly, because a legitimate admin would ALSO see nothing and the
bug would look silent rather than loud. Selecting through the view is fine from inside a
`SECURITY DEFINER` function, because at that point the function's own explicit `where profile_id =
current_profile_id()` is what narrows the result, not the view's RLS (which, from inside a definer
function, evaluates as `postgres` and would hand back every row if the function didn't filter it
itself). That is safe, and it is why the functions below filter explicitly rather than leaning on
the view to do it.

**D. Reject, in writing, the shortcut that would quietly undermine the entire audit-log design in
section 5: do not cache capabilities into custom JWT claims for performance.** Supabase supports an
Auth Hook that stuffs role or capability data into the access token so a policy can read it without
a table lookup. Nothing in this codebase does that today, and this spec deliberately does not
introduce it. A revoked capability would keep working until that token expires, which is exactly
the "impersonated admin recorded as the actor" problem the task opened with, wearing a performance
justification instead of a client-parameter one. The functions below read `profile_admin_roles`
live, every call, on purpose.

**E. `FORCE ROW LEVEL SECURITY` is off on all 30 tables, measured live, and this migration is the
first thing that makes that fact load-bearing rather than inert.** The same research note
called this out as harmless "because the only definer function is not executable by either public
role and the only view is invoker scoped," and named the exact tripwire: "it stops being harmless
the moment a definer function is added." This migration adds six. Each one is owned by `postgres`
and therefore bypasses RLS on every table it touches regardless of FORCE, by table-owner privilege,
the same mechanism `claim_profile` already relies on. That is intentional and it is why every
function below does its own explicit `where` narrowing rather than trusting RLS to narrow anything
for it, the same discipline `claim_profile` already follows. `FORCE` staying off remains correct
for this migration; it stops being automatically correct the moment anyone adds a seventh definer
function without reading this paragraph first.

**F. `auth.uid()` proves a session; it does not by itself prove how strong the path into that
session was, and that bound is provider-dependent.** `council/security/research/2026-supabase-
automatic-identity-linking.md` (this seat) found that Supabase's own account-linking gate gives
Google and magic-link an honest verification signal, but Facebook and X hardcode `Verified: true`
regardless of what the provider actually confirmed. `docs/decisions/ADR-002` and the P0-D2 login
position limit this project to magic link and Google today, both on the honest side of that split,
so this is a watch item, not a blocker: if a future login method is added, the capability system
built here inherits whatever that method's account-linking guarantee actually is, silently, because
`auth.uid()` cannot tell the difference between a hard-verified identity and a soft one.

**G. Landing this in the database does not retire the need to check again at the call site, once
one exists.** `council/security/research/2026-nextjs-server-actions-authorization.md` (this seat):
a Next.js Server Action is a public POST endpoint the moment it is exported, reachable "even if a
[it] is not imported elsewhere in your code," regardless of which gated component renders the
button that calls it. `apps/web/src/middleware.ts`'s own comment says the same thing about itself,
citing CVE-2025-29927 directly: "do not let this file be the only place that route is gated."
Nothing in `apps/web` calls these functions yet, so nothing is at risk today, but whoever wires the
first admin Server Action to `admin_grant_role` should not read this migration as proof the action
itself can skip its own check. The function refusing an unauthorized call is the real gate; a
Server Action that never calls it because a page redirected first is not.

**Verdict.** The design survives with one amendment stated plainly: replace "RLS policies on
`profile_admin_roles` joined on `auth.uid()`" with "`SECURITY DEFINER` functions that resolve
`auth.uid()` internally, called instead of any table read." The property the convener actually
wants, that a careless handler cannot grant anything because it is not the thing deciding, is fully
preserved and arguably strengthened: even a buggy route can only call a function that refuses on
its own. What changes is which database object does the refusing.

---

## 2. The migration

**Table fates, stated once, since the scope note asked for this specifically:**

| Table | Change |
| --- | --- |
| `admin_roles` | One new policy: plain catalog read for `authenticated`. Everything else unchanged. |
| `admin_capabilities` | No change. Stays `using (false)` to every client-facing role. |
| `admin_role_capabilities` | No change. Stays `using (false)`. |
| `profile_admin_roles` | No new policy. Stays `using (false)`. Read and written only through the functions below, which run as `postgres` and do not need a policy to see it. |
| `profile_admin_capability_grants` | No change. Stays `using (false)`. No function below writes it; nothing in scope today manages per-profile overrides. |
| `admin_audit_log` | No new policy (stays `using (false)`, unreadable by any client-facing role, same as today). One new `CHECK` constraint: a `role_granted` or `role_revoked` row cannot carry a null `actor_id`. |
| `profile_effective_capabilities` (view) | No change. Already `security_invoker = on`, already correct, confirmed live. |
| `profiles` | No change beyond what already landed today (`user_id`, `claim_profile`). |

None of the six RBAC tables is replaced. Every one of them was already keyed on `profiles.id`, the
internal primary key, never on `ghost_member_id` or any client-supplied value; the trust model that
is being deleted lived entirely in `_capabilities.js` and the API handlers that called it, not in
this schema. Retiring the tables and rebuilding them would throw away a design (`017_admin_rbac.
sql`'s own header: "boolean flags can't answer who can do X, lack audit history, can't carry
time-limited grants") that was already correct and is already live, to solve a problem that lived
one layer up.

**Every function below answers the same four questions once, rather than five times over:**
`search_path` is fixed to `public, pg_temp`, with `pg_temp` last, matching `claim_profile`
(`extensions` is omitted here because none of these functions call `digest()` or any other
extension-provided routine, unlike `claim_profile`). Every `CREATE FUNCTION` is followed by its
`REVOKE`/`GRANT` in the same transaction, so there is no window where a new function is callable by
`PUBLIC`. Execute is revoked from `PUBLIC` and granted only to `authenticated`; an unauthenticated
caller gets nothing to call. Every function that touches `profile_admin_roles`, `admin_audit_log`,
or the view does so with its own explicit `where` clause narrowing to the caller, never by trusting
RLS to have already narrowed it, for the reason in section 1.C and 1.E. One more discipline applied
throughout and not in `claim_profile`, because `claim_profile` had no parameter that collided with
a column name: every parameter is prefixed `p_`. A plpgsql parameter named `role_id` next to a
column named `role_id` is a documented footgun (an unqualified `where role_id = role_id` resolves
to the column on both sides and is always true); prefixing avoids the class of bug rather than
trusting careful naming at each call site.

```sql
-- ============================================================================
-- Permanent capability fix: auth.uid()-anchored SECURITY DEFINER functions,
-- replacing every client-supplied-identity check in _capabilities.js and
-- api/admin/team.js. No RLS policy on profile_admin_roles, admin_capabilities,
-- admin_role_capabilities, profile_admin_capability_grants or admin_audit_log
-- changes. All five were already `using (false)` to anon and authenticated
-- before today (team/security/knowledge/2026-live-grant-and-policy-surface.md)
-- and stay exactly that closed. What is new is a fixed, small function surface
-- in front of them, each one resolving identity from auth.uid() rather than
-- accepting a caller-supplied id anywhere in its signature.
--
-- Suggested filename once reviewed: supabase/migrations/
-- 20260921000000_permanent_capability_fix.sql. Not written there by this seat;
-- see this file's own header.
-- ============================================================================

begin;

-- ---------------------------------------------------------------------------
-- current_profile_id(): the one place auth.uid() becomes a profiles.id.
-- ---------------------------------------------------------------------------
-- STABLE, not VOLATILE: no writes, safe for the planner to evaluate once per
-- statement. SECURITY DEFINER so it can read profiles.user_id despite that
-- column carrying no SELECT grant for authenticated (deliberately, per
-- 20260920192954): a client has no standing reason to read its own user_id
-- back, and this function needs no grant to do what postgres, as table
-- owner, can already do. Returns null for an unauthenticated caller or an
-- unclaimed profile; every caller below already treats null as "no access."

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select id from public.profiles where user_id = auth.uid();
$$;

revoke all on function public.current_profile_id() from public;
grant execute on function public.current_profile_id() to authenticated;

comment on function public.current_profile_id() is
  'auth.uid() resolved to the caller''s profiles.id, or null if unauthenticated or unclaimed. The only place this codebase should ever answer "who is asking."';

-- ---------------------------------------------------------------------------
-- has_capability(capability_id): the one predicate every policy and every
-- admin RPC below calls, so the recursion trap in section 1.A and the
-- column-grant trap in section 1.B both live in exactly one place.
-- ---------------------------------------------------------------------------

create or replace function public.has_capability(p_capability_id text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profile_effective_capabilities pec
    where pec.profile_id = public.current_profile_id()
      and pec.capability_id = p_capability_id
  );
$$;

revoke all on function public.has_capability(text) from public;
grant execute on function public.has_capability(text) to authenticated;

-- ---------------------------------------------------------------------------
-- current_capabilities(): replaces dialecta-dev-admin.jsx's
-- `fetch('/api/profile/' + memberUuid)` read of `effective_capabilities`.
-- That read stays exactly as exploitable as admin/team.js for as long as
-- anything calls it with a bare id; a ported UI calls this instead, with no
-- id in the call at all, because there is nothing to pass. The caller is the
-- argument.
-- ---------------------------------------------------------------------------

create or replace function public.current_capabilities()
returns table (capability_id text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select pec.capability_id
  from public.profile_effective_capabilities pec
  where pec.profile_id = public.current_profile_id();
$$;

revoke all on function public.current_capabilities() from public;
grant execute on function public.current_capabilities() to authenticated;

-- ---------------------------------------------------------------------------
-- admin_roles: the one direct policy this migration adds. A role catalog
-- (id, display_name, description, is_system) carries no profile id and no
-- grant record; reading it answers nothing about who can do what. Gating it
-- behind a function would buy nothing and add one more thing to audit.
-- Existing `admin_roles_service_only ... using (false)` policy is untouched;
-- Postgres OR's permissive policies together, so this one is additive.
-- ---------------------------------------------------------------------------

create policy "admin role catalog is readable by signed-in members"
  on public.admin_roles for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- admin_list_team(): replaces admin/team.js's handleList (GET half).
-- ---------------------------------------------------------------------------
-- Raises rather than returning an empty set on a missing capability, so a
-- client can distinguish "you don't have access" from "no admins exist",
-- the same distinction api/admin/team.js already drew with a 401 vs. an
-- empty admins array, preserved here in the one place that now decides it.

create or replace function public.admin_list_team()
returns table (
  profile_id      uuid,
  display_name    text,
  role_id         text,
  granted_at      timestamptz,
  granted_by_name text,
  expires_at      timestamptz,
  note            text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.has_capability('members.view') then
    raise exception 'admin_list_team requires the members.view capability';
  end if;

  return query
    select
      par.profile_id,
      p.display_name,
      par.role_id,
      par.granted_at,
      grantor.display_name as granted_by_name,
      par.expires_at,
      par.note
    from public.profile_admin_roles par
    join public.profiles p on p.id = par.profile_id
    left join public.profiles grantor on grantor.id = par.granted_by
    where par.expires_at is null or par.expires_at > now()
    order by par.granted_at desc;
end;
$$;

revoke all on function public.admin_list_team() from public;
grant execute on function public.admin_list_team() to authenticated;

-- ---------------------------------------------------------------------------
-- admin_grant_role / admin_revoke_role: replace handleGrantRevoke.
-- ---------------------------------------------------------------------------
-- team.js's own docstring already named this as its wished-for future:
-- "harden into a transactional RPC (Postgres function) before public scale."
-- That lands here as one function body, one implicit transaction, so the
-- profile_admin_roles write and the admin_audit_log write either both
-- happen or neither does, closing the "best-effort... may leave the system
-- in an inconsistent state" gap the original handler's own comment admitted.
--
-- The legacy is_admin / is_quote_admin flag sync (syncLegacyFlags in the
-- old handler) is deliberately NOT reproduced here. It exists only so the
-- old Vercel API's own endpoints, which read those booleans directly, keep
-- working, and carrying it into the permanent design would be exactly the
-- transitional shim this spec was told not to build. See section 4: that
-- old API keeps running its own flag-sync through its own code, untouched
-- by this migration, for exactly as long as it exists.

create or replace function public.admin_grant_role(
  p_target_profile_id uuid,
  p_role_id text,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid;
begin
  v_actor_id := public.current_profile_id();
  if v_actor_id is null then
    raise exception 'admin_grant_role requires a claimed profile';
  end if;
  if not public.has_capability('members.manage_roles') then
    raise exception 'admin_grant_role requires the members.manage_roles capability';
  end if;
  if not exists (select 1 from public.profiles where id = p_target_profile_id) then
    raise exception 'admin_grant_role: target profile % does not exist', p_target_profile_id;
  end if;
  if not exists (select 1 from public.admin_roles where id = p_role_id) then
    raise exception 'admin_grant_role: role % does not exist', p_role_id;
  end if;

  insert into public.profile_admin_roles (profile_id, role_id, granted_by, note)
  values (p_target_profile_id, p_role_id, v_actor_id, p_note)
  on conflict (profile_id, role_id) do update
    set granted_by = excluded.granted_by,
        note       = excluded.note;

  insert into public.admin_audit_log (actor_id, target_id, action, details)
  values (
    v_actor_id,
    p_target_profile_id,
    'role_granted',
    jsonb_build_object('role_id', p_role_id, 'note', p_note, 'via', 'rpc:admin_grant_role')
  );
end;
$$;

revoke all on function public.admin_grant_role(uuid, text, text) from public;
grant execute on function public.admin_grant_role(uuid, text, text) to authenticated;

create or replace function public.admin_revoke_role(
  p_target_profile_id uuid,
  p_role_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid;
begin
  v_actor_id := public.current_profile_id();
  if v_actor_id is null then
    raise exception 'admin_revoke_role requires a claimed profile';
  end if;
  if not public.has_capability('members.manage_roles') then
    raise exception 'admin_revoke_role requires the members.manage_roles capability';
  end if;

  if p_role_id = 'publisher' and p_target_profile_id = v_actor_id then
    raise exception 'admin_revoke_role: cannot revoke your own Publisher role; have another Publisher do it';
  end if;

  delete from public.profile_admin_roles
   where profile_id = p_target_profile_id
     and role_id = p_role_id;

  if not found then
    raise exception 'admin_revoke_role: % holds no % grant', p_target_profile_id, p_role_id;
  end if;

  insert into public.admin_audit_log (actor_id, target_id, action, details)
  values (
    v_actor_id,
    p_target_profile_id,
    'role_revoked',
    jsonb_build_object('role_id', p_role_id, 'via', 'rpc:admin_revoke_role')
  );
end;
$$;

revoke all on function public.admin_revoke_role(uuid, text) from public;
grant execute on function public.admin_revoke_role(uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- admin_audit_log: one constraint. See section 5 for why.
-- ---------------------------------------------------------------------------

alter table public.admin_audit_log
  add constraint admin_audit_log_role_actions_need_actor
  check (action not in ('role_granted', 'role_revoked') or actor_id is not null);

commit;
```

**What this does not include, on purpose.** No RPC for `profile_admin_capability_grants` (the
per-profile override table): nothing in `dialecta-dev-admin.jsx` manages overrides today, and
adding write access to a table nothing calls would be scope, not hardening. No new
`admin_capabilities` id (an `audit.read` capability for reading `admin_audit_log` back out is a
reasonable future add; this migration does not invent one, matching `profile_claim_tokens.sql`'s
own "flagged rather than freelanced" posture on the adjacent gap it left for later). No change to
`profiles` beyond what already landed this morning.

---

## 3. What breaks, and who notices

**Nothing in `apps/web` breaks, because nothing there calls any of this yet.** Per `docs/plans/
ROADMAP.md`, the clean rebuild is roughly 315 lines in and has not built a `/dev-admin` surface;
the ~30,400 recovered lines that do are a separate, abandoned codebase this migration does not
touch. There is no live caller in the destination repo for this migration to break.

**What the migration changes is what "having access" costs, going forward, and the cost is real:
every one of these functions returns null, false, or an exception for every person alive today,
because `auth.users` holds zero rows** (measured 2026-09-20, cited directly in `profile_claim_
tokens.sql`'s own header against `phases-and-missions.md` M1). That includes the one admin. Order
of return, as a dependency chain rather than a guess:

1. Daniel signs in through Supabase Auth (magic link or Google; both are wired per today's `apps/
   web/src/lib/supabase` and `middleware.ts`).
2. Daniel calls `claim_profile(token)` with a token issued out of band. **This migration does not
   issue that token.** `profile_claim_tokens.sql`'s own header scopes token issuance and the UI
   that calls `claim_profile` as "a small follow-up, not part of today's shared-foundation build."
   That follow-up is a dependency of everything below it in this list, not a detail.
3. `profiles.user_id` is now set for Daniel's profile. `current_profile_id()` resolves for him for
   the first time.
4. `has_capability()` and every function built on it now answer for him, against whatever rows
   `profile_admin_roles` already holds for his profile.

**On that fourth step, one thing worth saying plainly rather than assuming: this migration almost
certainly does not need to grant Daniel anything.** `017_admin_rbac.sql`'s own bootstrap block
(section 8 of that file, recovered verbatim) inserts a `publisher` grant for whichever profile
matches `display_name ILIKE 'daniel%'`, with `granted_by = null`, the moment that migration first
ran. The live `admin_roles` / `profile_admin_roles` shape captured in `20260920000000_baseline_
live_schema.sql` matches `017_admin_rbac.sql` column for column, which is consistent with that
migration having run against this same live project rather than only the abandoned one. I did not
confirm this by querying the live table. I loaded the Supabase MCP to check, and `list_projects`
returns exactly one reachable project, `qjcozskyopetvigjhlmh`: the Sales Resource Project, a
different Dan-owned platform entirely, not Dialecta (the same project ref root `CLAUDE.md` for
that other codebase cites for its own, unrelated sign-in). I stopped before running a single query
against it. Whatever project this session's Supabase tooling is scoped to, it is not
`mguulnibvzusfvyuowwh`, worth knowing before anyone else reaches for it from inside this repo.
Read the claim above as reasoned, not measured: if it holds, the grant is already sitting in `profile_admin_
roles` today, unreachable only because nothing before this migration could resolve `auth.uid()` to
the profile that holds it.

**One sentence on PII exposure in the meantime, since it is adjacent and cheap to say once:**
`profiles.is_admin`, a legacy boolean, is still in the public column allowlist the evening
migration wrote (`20260920192954`), so who is flagged admin by that older, narrower signal stays
readable by `anon` regardless of anything in this migration; closing that is a one-line follow-up
to that migration, not this one.

---

## 4. The interim

**Scope, amended mid-task** (the convener, relaying Dan, while section 1 was being drafted): this
section is cut to one line, and the effort it frees up went into sections 1 and 2 instead, which is
why both run longer than the original brief asked for.

The deployed Vercel admin API keeps running exactly as it does today,
untouched by this migration, since no table it reads is renamed, dropped, or given a new required
column; the traffic numbers Dan gave (20 lifetime visitors to Dev-Admin, one admin profile, six
real people, nobody ever signed in through Supabase Auth) say that surface is not worth spending
design effort on before the port replaces it outright.

---

## 5. The audit log, as evidence by construction

The task's own framing is exactly right and worth restating precisely: under the current defect,
`admin_audit_log.actor_id` is populated from `auth.memberId`, which `verifyCapability` resolved
from a request parameter, so a row saying "Daniel granted X" is only as trustworthy as whatever
string the caller put in `?member_id=`. The log records a claim, not a fact.

Four properties, each tied to a specific choice above rather than asserted in the abstract:

**Non-repudiation of the actor.** `admin_grant_role` and `admin_revoke_role` both resolve
`v_actor_id := public.current_profile_id()` themselves, inside the function, from `auth.uid()`.
Neither function has a parameter that could carry an actor id; there is nothing in the call a
caller could pass to attribute the action to someone else. This is the one property that could not
be retrofitted onto the old code without the schema change already established in section 1:
`auth.uid()` did not exist as a checkable value until `profiles.user_id` did.

**Atomicity.** The write to `profile_admin_roles` and the write to `admin_audit_log` happen inside
one function body, which Postgres treats as one implicit transaction: either both happen or,
on any raised exception, neither does. This directly closes the gap the original `team.js`
docstring already named as a known defect in its own words: "Both flag-sync and profile_admin_roles
writes are best-effort within the same handler; if one fails the others may still happen, leaving
the system in an inconsistent state." That sentence described three separate application-level
Supabase calls with no shared transaction. It no longer applies to the two calls that remain,
because they are no longer separate calls.

**Attribution to a mechanism, not just a person.** Both functions hardcode `'via': 'rpc:admin_
grant_role'` / `'rpc:admin_revoke_role'` into `details`, literally, never from a parameter. A
reader of this log five months from now can tell a row written by this path from a row written by
whatever came before it (the old handler's own `'via': '/dev-admin/team'` convention) without
needing to know the deploy history by heart. This matters concretely here: **rows written before
this migration land are not retroactively trustworthy.** If `profile_admin_roles`'s existing
Publisher grant (section 3) was itself logged by the old handler, that historical row's `actor_id`
carries exactly the "impersonatable" caveat this whole document is about, permanently. This
migration fixes the write path going forward; it does not and cannot repair what an already-written
row claims about the past.

**A structural guarantee against the one bug class most likely to slip past review.** The new
`check` constraint, `action not in ('role_granted', 'role_revoked') or actor_id is not null`,
means a future edit to either function that accidentally drops the actor resolution, or a
hypothetical third code path that inserts into `admin_audit_log` directly, cannot produce an
unattributed role-change row even silently. The database refuses it rather than logging it wrong.

**The honest limit, stated rather than left implicit.** All four properties above defend against a
compromised session or a careless handler. None of them defend against a compromised `service_role`
key or direct superuser access to Postgres, which can still write, read, or alter this table freely,
because RLS categorically does not apply to that credential. That is a different trust boundary
(infrastructure and credential handling, not application logic) and it is out of scope for a
migration; it is not out of scope for someone to know the difference before calling this log
tamper-proof rather than tamper-evident-against-the-threat-this-task-is-about.

---

## 6. What else uses the same pattern

Two surfaces, two different answers, checked against source rather than assumed identical because
they look alike.

**`dialecta-tier-capabilities.js` / `_subscription-tier.js` / `classify-stream.js`: not the same
defect. A missing-enforcement defect, confirmed by reading the call site.** My own prior filed
finding (`2026-09-20-recovered-source-read.md`) left this as a hedge: the theme-side tier table's
own docblock says a server mirror "likely" lives at `api/_subscription-tier.js`. Read directly today:
that file exists, is well-built, and defines `getTierCapabilities()` as its own stated single source
of truth. A repo-wide grep for `getTierCapabilities(` finds exactly three hits: the export, and two
lines in its own doc comment. **It is never called.** `api/article/classify-stream.js` destructures
`max_candidates` directly off `req.body` (line 75) and passes it straight into the Anthropic prompt
as an instruction (line 208), with the only bound being a hardcoded `>= 1 && <= 4` sanity check that
applies identically regardless of tier. A free-tier account gets the Underwriter-tier candidate
count for free by sending the field the server should have computed from `profile.subscription_
tier` and never does. This is not identity spoofing; no `member_uuid` or session is involved at
all, and verifying one would not fix it. The defect is that a value which should only ever come from
the server's own read of the caller's stored tier is instead taken as a plain, unchecked request
field. The fix is equally different in shape from sections 1 and 2: compute the cap server-side
from the authenticated caller's own `profile.subscription_tier`, ignore or clamp anything the
client sends for it, and delete the request field entirely rather than validate it.

**`dialecta-quotes-app.jsx` / `dialecta-quotes-data.js`: the client-side contract matches the
confirmed defect exactly; the server-side confirmation does not exist to read.** `useAdminStatus`
(`dialecta-quotes-data.js:104`) does not simply trust a boolean handed back by a profile fetch the
way dev-admin does; its own comment describes probing an admin-gated endpoint and reading the HTTP
status (200/403/404) as the signal. That is a better-looking mechanism on the client side. It does
not change what identity the mutating calls carry: the same file's own header comment states
plainly, "The memberId param is the caller's Ghost member uuid... admin and member-suggest actions
require it," and `createQuote`, `updateQuote`, `archiveQuote`, `grantAdmin` all take `memberId` as a
plain parameter, the identical calling convention `admin/team.js` uses. **I could not find `api/
quotes/` anywhere in `_recovered/api/`.** The server handlers this client code calls are not present
in what this project recovered, so whether they independently verify a session or re-trust the
parameter the way `_capabilities.js` does is genuinely unread, not read-and-safe. Same author, same
month, same calling convention, and the one thing that would settle it outright is missing. Flagging
this as a gap in the recovery rather than closing it by inference: if those handlers turn up
elsewhere, they are the next read, ahead of anything else in this family.
