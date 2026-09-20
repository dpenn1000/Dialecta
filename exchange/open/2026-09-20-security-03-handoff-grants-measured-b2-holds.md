---
id: 2026-09-20-security-03
type: handoff
from: security
to: [reviewer, migrator]
subject: Grants measured on the live project: B2 does not drop, and information_schema lied first
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Measured the grant and policy surface of Supabase project `mguulnibvzusfvyuowwh` on 2026-09-20,
read only, against `pg_class`, `pg_policies`, `pg_proc` and `has_table_privilege`. No rows written,
no endpoint called. Full note at `team/security/knowledge/2026-live-grant-and-policy-surface.md`.

The question record 2026-09-19-002 left open is answered. It states the condition as "If those
grants are not present, blocker B2 drops to should-fix." **They are present.** All 30 tables in
`public` grant SELECT, INSERT, UPDATE and DELETE to both `anon` and `authenticated`, with no
exceptions and no column level narrowing. B2 holds at blocker. B1 was never contingent on it.

The rest of the surface, for the record. RLS is enabled on all 30 tables, `FORCE` is off on all 30,
and there are 31 policies. Five tables are readable by anyone (`archetypes`, `axis_scores`,
`follows`, `profiles` on `USING (true)`, and `handle_history` for `authenticated` only). Six more
are readable through a filter (`articles`, `comments`, `quotes`, `feed_events`, `sparring_partners`,
`opinion_map_positions`). The rest carry `USING (false)`.

Writes are closed on the live schema, and the reason is narrow: no table carries a permissive
INSERT, UPDATE or DELETE policy that any role short of `service_role` can satisfy. The open write
grants have nothing to act through yet.

One SECURITY DEFINER function exists, `check_handle_not_reserved`, owned by `postgres`, with
`search_path=""` pinned and EXECUTE held by neither public role. One view exists,
`profile_effective_capabilities`, owned by `postgres`, with `security_invoker = on`. Both are the
hardened shape. That closes the third reading list lead as a clean result rather than a finding.

## Not done

I did not re-decide B1 or B2 on their own terms and could not have. You reviewed
`supabase/migrations/20260919000000_foundation.sql`, which has never been applied to this project.
I measured the live database, which carries a different policy set. What the measurement settles is
the premise underneath both blockers, that Supabase grants `anon` and `authenticated` full CRUD on
a new `public` table by default, and on this project it demonstrably did.

I did not read `api/comment.js`, `api/admin/members.js` or `api/webhooks/member-added.js`. Thirty
routes in `team/security/knowledge/live-surface-inventory.md` are marked `unread` and the reason is
in `2026-09-20-security-01`.

`supabase db lint` still has not been run. Your record carries it as not done and it stays that way.

## Governing spec

None. This is a measurement of a live system rather than a change against a spec.

## Acceptance

Four read only queries against project `mguulnibvzusfvyuowwh`, reproduced in the note. The grant
query is the one that matters:

```sql
select c.relname,
  has_table_privilege('anon', c.oid, 'INSERT') as anon_insert
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind in ('r','p');
```

Returns `true` for all 30 tables.

## Traps

**`information_schema.role_table_grants` reported the exact opposite and looked authoritative.**
The first query I ran filtered that view to `anon` and `authenticated` and returned no grants on
any table, which reads as a closed database. PostgreSQL documents the view as showing only grants
"where the grantor or grantee is a currently enabled role", so a session that does not hold `anon`
sees none of `anon`'s grants. It reports silence as absence. `has_table_privilege` asks directly
and is not filtered by the session's roles. Anything that measures grants through
`information_schema` is not measuring grants.

**`node scripts/check-env.mjs --rls` does not have this trap**, and I checked before saying so. It
probes with the real publishable key over PostgREST and counts rows, which measures effective read
access directly. Its limits are different ones: a hardcoded list of 18 tables against the 30 that
exist, so twelve are never probed and a new table is never added by anything, and it measures reads
only, so it would not have seen the grant layer or the absence of write policies. Both methods are
worth keeping; neither answers the other's question.

**The two schemas fail in opposite directions, so do not average them.** Live, writes are closed
because no write policy exists. The proposed migration adds owner writes own row policies. Applied
on top of grants that are already open, those policies are live the moment it runs. Any revoke has
to land before or with that migration, not after, or there is a window with policies live and
grants open.

## Do not touch

Nothing. I hold `team/security/` only, and that folder is moving to `council/security/` right after
this lands.
