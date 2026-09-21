---
id: 2026-09-21-security-01
type: handoff
from: security
to: [convener, legal, builder]
subject: Comment tiers now read without the service key; Breach bodies wait on two readers
backlog: A-5
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Applied to `mguulnibvzusfvyuowwh` as version `20260921063139`, filed as
`supabase/migrations/20260921063139_comment_tier_and_reading_functions.sql`. The file's md5 equals
`md5(array_to_string(statements, ''))` for that version in `supabase_migrations.schema_migrations`:
`a51290d9bbb922785ab06bbbc829e4db`, 7859 bytes.

| Function | Returns | EXECUTE |
| --- | --- | --- |
| `public.comment_tiers(comment_ids uuid[])` | `comment_id uuid`, `ai_suggested_tier tier`, `self_declared_tier tier`, `final_tier tier`, `specificity_score integer`, `classified_at timestamptz` | anon, authenticated |
| `public.own_comment_readings(comment_ids uuid[])` | `comment_id uuid`, `claim_text text`, `strength text`, `commenter_message text`, `specificity_score integer`, `emotion emotion_level`, `article_engagement article_engagement_level`, `borderline_flag boolean`, `borderline_other_tier tier`, `classified_at timestamptz` | authenticated |

Both are SECURITY DEFINER, STABLE, `search_path ''`, owned by postgres, and return the newest
classification per comment. `comment_tiers` answers for an id when the comment is published or
`member_id = current_ghost_member_id()`, which is the pair of SELECT policies on `comments` as
`pg_policies` held them tonight. `own_comment_readings` answers on the second clause only.
`classifications` is untouched: same grants, same `classifications_service_only`.

For the convener's switch in `apps/web/src/components/discourse/data.ts`:

- `readLatest(TIER_COLUMNS, ids)` becomes `supabase.rpc('comment_tiers', { comment_ids: ids })` on
  the session client. Rows come back one per comment, keyed `comment_id`, so the Map loop still
  works.
- `readLatest(READING_COLUMNS, ownIds)` becomes
  `supabase.rpc('own_comment_readings', { comment_ids: ownIds })`.
- `createServiceClient`, the `SUPABASE_SERVICE_ROLE_KEY` check and the `tierless` branch then have
  nothing left to do in this file, and the comment above `readLatest` describes a migration that
  has now landed.

## Not done

**Breach bodies at the database. Not closed tonight, by decision.**

The control that fits the spec is a column one: revoke SELECT on `comments.body` and
`comments.mentions` from anon and authenticated, and release both through a definer function that
returns them only for a readable comment whose newest classification is not Breach. The row stays
readable, so the page still learns from `comment_tiers` that a comment is Breach and shows the
notice. A restrictive row policy hides the row, and then the page has nothing to hang the notice on
and a reply loses its parent. A view either needs the caller's own SELECT on `body`, which defeats
it, or runs as its owner, which restates the predicate the way a function does and draws an
advisor error besides.

Three reasons it waits:

1. **Two readers select `body` on the session client, and neither is mine to move.**
   `components/discourse/data.ts` (`COMMENT_COLUMNS`, with `mentions`) and
   `app/profile/_lib/data.ts` through `profile/_lib/rows.ts` `COMMENT_COLUMNS`. The revoke turns
   both into 42501: the feed falls to its unavailable notice and the profile loses its recent
   comments. Both pages would still return 200, so a status check would pass over the break.
2. **Nothing reachable needs it tonight.** Measured: 3 comments, all published, tiers echo, forum
   and forum, 0 Breach, 0 mentions. No path can publish one: the deployed endpoint and
   `apps/web/src/app/api/comment/route.ts` both insert `pending_review`, and no promotion pipeline
   exists. The three published rows got there by migration `20260920193044`.
3. **The order is fixed, and tonight is the wrong end of it.** The function exists, both readers
   read `body` and `mentions` through it, then the revoke, and all three before anything can set a
   comment to published. A revoke first breaks two surfaces. A revoke after the first publish
   leaves a Breach body public for as long as the gap lasts.

**Finding, latent: the profile page renders comment bodies with no tier check.** `rows.ts` reads
`id, article_slug, article_title, body, published_at`, and nothing on that path reads a tier. The
first published Breach comment would show its full text on its author's profile. The filter in
`data.ts` does not reach that page, which is the case for putting the control in the database.

`mentions` goes with `body`. A Breach comment "targets a person, not an idea", and its mentions
array is likely to name that person. `data.ts` already drops mentions on a withheld card.

Draft of the follow-up, not applied and not tested. One migration, applied in the same sitting as
both reader switches:

```sql
create function public.comment_bodies(comment_ids uuid[])
returns table (comment_id uuid, body text, mentions jsonb)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.body, c.mentions
  from public.comments c
  cross join lateral (
    select coalesce(x.final_tier, x.ai_suggested_tier) as effective
    from public.classifications x
    where x.comment_id = c.id
    order by x.classified_at desc, x.id desc
    limit 1
  ) t
  where c.id = any (comment_ids)
    and (
      c.status = 'published'::public.comment_status
      or c.member_id = (select public.current_ghost_member_id())
    )
    and c.status <> 'suppressed'::public.comment_status
    and t.effective <> 'breach'::public.tier;
$$;

revoke execute on function public.comment_bodies(uuid[]) from public;
revoke execute on function public.comment_bodies(uuid[]) from anon;
revoke execute on function public.comment_bodies(uuid[]) from authenticated;
grant execute on function public.comment_bodies(uuid[]) to anon;
grant execute on function public.comment_bodies(uuid[]) to authenticated;

revoke select (body, mentions) on public.comments from anon, authenticated;

notify pgrst, 'reload schema';
```

It mirrors the page's three withheld states: no classification (the lateral join drops the row),
suppressed, and Breach. `coalesce(final_tier, ai_suggested_tier)` is the page's own tier when the
only signals are AI and self: in `resolveFinalTier` the AI's 40 beats self's 15, and a tie goes to
the AI. The column revoke works on `comments` because `20260921044120` removed the table-level
SELECT; measured, `relacl` holds no `r` for either client role, and `body` and `mentions` carry
column grants. On a table that still holds a table-level grant, a column revoke does nothing.

Two decisions this leaves with `legal`: whether an author sees their own Breach text (the draft
says no, as the page does and as "never shown" reads), and whether `specificity_score` on a Breach
comment is withheld too. `comment_tiers` returns it; the page hides the dots on any withheld card.
Withholding it is one `case` in `comment_tiers`, in the same follow-up.

## Governing spec

`docs/Dialecta_Discourse_Layer_UX.md`, the comment card section, "The Breach variant": the body is
replaced by the suppression notice, and "The original text is never shown."

## Acceptance

Measured after apply, 2026-09-21:

| Check | Result |
| --- | --- |
| `has_function_privilege`, `comment_tiers` | anon true, authenticated true, PUBLIC false, service_role true |
| `has_function_privilege`, `own_comment_readings` | anon false, authenticated true, PUBLIC false, service_role true |
| `proacl`, `comment_tiers` | `{postgres=X, service_role=X, anon=X, authenticated=X}`, no PUBLIC entry |
| `proacl`, `own_comment_readings` | `{postgres=X, service_role=X, authenticated=X}` |
| `execute_sql` as `supabase_read_only_user`, either function | 42501 permission denied. That role holds no grant of its own, so this is PUBLIC holding nothing |
| PostgREST, publishable key, no session: `rpc/comment_tiers` on the 3 ids plus 1 unknown | 200, 3 rows (echo, forum, forum), none for the unknown id |
| Same, `rpc/own_comment_readings` | 401, 42501 |
| Same, `rpc/comment_tiers` with `[]` | 200, `[]` |
| Same, `comments?select=id,status` | 200, the 3 published rows, unchanged |
| Same, `classifications?select=id` | 200, `[]`: the deny holds, and `/analytics` still reports it closed |
| 20 dev server paths, before and after | 200 on every one, with identical card, notice, dev banner and withheld counts |
| `get_advisors`, security | New: 0028 on `comment_tiers` for anon, 0029 on both for authenticated. Both are the intended doors |

Not tested:

- The published-only filter in the negative direction. Every comment in the database is
  published, so no row exists for it to withhold, and making one is a data change. The claim rests
  on the stored body and on `member_id = null` never being true.
- Anything as a signed-in session: the own-row branch of `comment_tiers`, and
  `own_comment_readings` returning rows. No session exists to test with.

## Traps

- **`own_comment_readings` refuses anon.** Called for a signed-out visitor it throws, and the feed
  fails closed for every signed-out reader. `readLatest` returns early on an empty id list today,
  and `ownIds` is empty for a signed-out visitor; keep that guard, or call only when the viewer has
  a member id.
- **Both bodies restate the SELECT policies on `comments`.** A change to those policies has to
  change these functions in the same migration. Re-keying identity to `profiles.id`, step 2 of the
  rebuild map, is that change. A check comparing `pg_policies` for `comments` against the predicate
  the functions carry would make a miss fail loudly; it is not written.
- **`execute_sql` cannot call either function**, by design. Measure the no-session path through
  PostgREST with the publishable key, which also exercises the real grants.
- **`classifications_service_only` still reads `USING (false)`, deliberately.** A permissive
  policy there would open every column, since both client roles hold table SELECT.

## Do not touch

- `classifications`: its grants and its one policy. `/analytics` probes it as a deny.
- The `comments.body` and `comments.mentions` grants, until both readers read through
  `comment_bodies`.

## Update, 2026-09-21, later the same day

The follow-up is written, not applied. Two DRAFT migrations and the full brief sit in
`council/security/2026-09-21-breach-body-migrations/`: `comment_bodies(uuid[])` finished from the
sketch above (same file, same grant shape, both decisions below made explicit in its header) and
the revoke as its own migration, sequenced to apply only after both readers below switch.

**The two decisions, now made.** No classification: withheld, the row is dropped. Suppressed:
withheld unconditionally, even from the author. Both match `toComment()` as measured today; neither
was a live judgment call, both fell out of reading the code that already exists. Still open, still
legal's: an author's own Breach text, and whether `specificity_score` withholds on Breach.

**Every reader of `comments.body` and `comments.mentions`, found and dispositioned.** Full table in
the folder's `README.md`. In `apps/web`: the two known readers (`discourse/data.ts`,
`profile/_lib`) need the switch; `analytics/_lib` and `api/comment/route.ts` never selected these
columns and need nothing. In quarantine: every Supabase client under `_recovered/` and
`_recovered-next/`, without exception, uses `SUPABASE_SERVICE_KEY`; none read the anon or
publishable key, confirmed by grep, so the revoke touches none of them and fixes none of them.
`_theme/` holds no Supabase client at all; its one comments consumer fetches the legacy `/api/comments`
route. No view, function or edge function in the project touches either column beside the one this
adds.

**New finding, live, not previously in a hotfix.** `_recovered-next/lib/get-comment.js`, read by
`app/comment/[id]/opengraph-image.js`, is a second live reader in the same family as
`council/security/hotfix-2026-09-21-api-comments/`'s `comments.js`: service role, and it gates on
`status <> 'suppressed'` only, no tier check at all. It renders a comment's stored body directly
into a public PNG at `/comment/<uuid>/opengraph-image` for any pending or published comment,
Breach included, with no card to hide it behind. Neither migration here reaches it; it needs its
own hotfix, same shape as the existing one, and is not it yet.

**Reader switches specified for the builder**, file and line, with the code shape, in the folder's
`README.md`: both readers call `comment_bodies` the way `comment_tiers` is already called, merge by
`comment_id` into a Map the same way `readLatest()` already does, and the one new rule either
switch has to hold is that an id missing from the result is the withheld case, not a fetch error.
`discourse/data.ts toComment()` loses its `body`-gates-validity check in the same change, since body
no longer arrives on the base row.

**Verification and rollback for both migrations** are in the same `README.md`: grants and `proacl`
after the function lands, a no-session PostgREST call against the 3 live ids, column grants and a
direct-select 42501 check after the revoke, and the reverse-order rollback for each.

Not run: `node scripts/land.mjs`. The brief that opened this update said write, verify and hand
over, not apply; landing this seat's own folder is the convener's call, not assumed here.
