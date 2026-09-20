# What the anon key can read on the live project

**Source:** measured against live project `mguulnibvzusfvyuowwh` on 2026-09-19 with
`scripts/check-env.mjs --rls`. Read-only GETs, counts and HTTP statuses only.
Anon column is the publishable key with RLS in force; service column is the secret
key with RLS bypassed.

**Status:** this is measurement, not inference. It replaces the gap named in
`2026-supabase-type-generation-drift.md`, where `supabase/types.ts` cannot show
policies.

## The map

| Table | Anon | Service | Reading |
| --- | --- | --- | --- |
| `profiles` | 14 | 14 | fully public |
| `articles` | 5 | 5 | fully public |
| `axis_scores` | 36 | 36 | fully public |
| `archetypes` | 3 | 3 | fully public |
| `feed_events` | 6 | 6 | fully public |
| `follows` | 14 | 14 | fully public |
| `quotes` | 70 | 72 | filtered, 2 rows withheld |
| `comments` | 0 | 3 | closed to anon |
| `classifications` | 0 | 3 | closed to anon |
| `axis_events` | 0 | 27 | closed to anon |
| `reserved_handles` | 0 | 89 | closed to anon |
| `notifications` | 0 | 6 | closed to anon |
| `admin_roles` | 0 | 4 | closed to anon |
| `fp_snapshots` | 0 | 4 | closed to anon |
| `share_events` | 0 | 7 | closed to anon |
| `tier_nominations` | 0 | 0 | empty, cannot tell |
| `aspirations` | 0 | 0 | empty, cannot tell |
| `self_descriptions` | 0 | 0 | empty, cannot tell |

Every table returned a 2xx to anon. None returned 401 or 403, so the pattern is
policies that filter rows rather than grants that refuse the query. A table showing
0 against a non-zero service count has RLS returning an empty set.

## `028_pre_launch_security_hardening` did real work

The migration named in `team/migrator/brief.md` and absent from `docs/` now has
evidence behind it. Nine tables are closed to anonymous readers, including every
one that would matter: the comment bodies, the classification reasoning, the axis
ledger, the admin role table, the notification queue and the reserved handle list.
`quotes` is filtered rather than all-or-nothing, which means a policy with a
predicate on it rather than a blanket rule.

Whoever hardened this thought about it. That raises the cost of the "adopt the live
schema" option discarding anything, and it is a point in favour of option 1 in
`docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`.

## The finding: `profiles` exposes every column to anonymous readers

RLS is row-level. All 14 profile rows are visible to anon, so every column on them
is visible too, unless column grants narrow it. They do not. Five columns probed,
five readable without authentication:

| Column | Anon | Why it matters |
| --- | --- | --- |
| `is_admin` | READABLE | Anyone can enumerate which accounts hold admin. Reconnaissance for a targeted attack |
| `subscription_tier` | READABLE | Billing standing of every member, public |
| `pact_signed_name` | READABLE | The name a contributor signed the Pact with, which need not be their display name |
| `order_negotiation_log` | READABLE | A jsonb log whose contents are unexamined |
| `ghost_member_id` | READABLE | The legacy identity key, so the profile to Ghost member mapping is public |

Live `profiles` carries roughly 30 columns beyond the repo's version, per
`2026-live-schema-diff.md`. Five were probed. The rest are presumed exposed on the
same reasoning and have not been checked.

The fix is either column grants (`revoke select (is_admin, ...) on profiles from
anon`) or a view for public profile reads. Both are migrations, so both wait on the
P0-2 decision. Worth noting the repo's own `profiles` table would not have this
problem, because it defines six columns and none of them are admin flags.

## Two consequences for the backlog

**A-5 renders empty for logged-out visitors.** The public comment thread reads
`comments`, and anon sees zero of three rows. The repo migration intends otherwise:
`create policy "published and suppressed comments are public to read" using (status
in ('published','suppressed') or auth.uid() = author_id)`. Live does not do that.
Whether live is wrong or the three rows are simply unpublished cannot be told from
counts alone, and needs the policy text from a `db pull`.

**The repo and live disagree on `axis_events` too.** The repo declares
`create policy "axis events are public to read" using (true)`. Live returns 0 of 27
to anon. Opposite intentions on the same table.

## Implies for

Exchange record 2026-09-19-001. Backlog A-5, B-1, B-3, B-5. `p0-2-runbook.md` step 6,
which should read the pulled policy text against this table. Practice: measure RLS
rather than reading it off a migration, because the migration in this repo is not
the policy on the database.
