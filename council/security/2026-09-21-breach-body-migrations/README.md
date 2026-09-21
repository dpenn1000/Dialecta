# Breach bodies: reader inventory, switches, verification

Continues `exchange/open/2026-09-21-security-01`. Two migrations sit in this folder, both DRAFT,
neither applied: `20260921183000_comment_bodies_breach_withheld.sql` (safe alone, adds only a
function) and `20260921184500_close_comments_body_and_mentions_to_public.sql` (apply only after
both reader switches below land; applied early, it 42501s both readers). Written under
`council/security/`, per `security.md`: this seat reports, the convener applies, a builder switches
the readers.

## The two decisions

- **No classification yet: withheld.** `comment_bodies()` drops the row entirely; a tierless
  comment returns no body, matching `toComment()`'s `'unread'` state in
  `apps/web/src/components/discourse/data.ts`.
- **Suppressed: withheld, even from the author.** `comment_bodies()` excludes
  `status = 'suppressed'` unconditionally. `toComment()` checks that branch before its own-comment
  check, so a suppressed comment shows no body to anyone, including the person who wrote it.

Still open, not decided here, both still legal's per the original handoff: whether an author should
see their own Breach text, and whether `specificity_score` on a Breach comment should also be
withheld.

## The column set anon and authenticated keep

Twelve columns, after the second migration lands: `id, member_id, member_name, article_id,
article_slug, article_title, status, created_at, published_at, delta_acknowledged, hardened_at,
parent_id`. The table holds fifteen columns total (measured against `information_schema.columns`
for `public.comments`, 2026-09-21), minus `member_email` (closed already, `20260921044120`), minus
`body` and `mentions` (closed by the second migration here).

## Every reader of comments.body and comments.mentions

Measured 2026-09-21: `apps/web` by grep and read; `_recovered/`, `_recovered-next/`, `_theme/` by
grep for `ANON_KEY`, `SUPABASE_ANON`, `NEXT_PUBLIC_SUPABASE`, `createClient(`, and by reading every
file a broader sweep turned up; database functions and views by `pg_proc`/`pg_views`/`pg_matviews`
directly; edge functions by `list_edge_functions` (zero deployed, no local `supabase/functions/`
either).

| Reader | Key it reads with | Revoke breaks it | Replacement |
| --- | --- | --- | --- |
| `apps/web/src/components/discourse/data.ts` `readComments()`, article-page feed | session (anon or authenticated) | Yes. Whole query 42501s; `loadDiscourse()` falls to `unavailable: true`, empty feed | `comment_bodies()`, switch below |
| `apps/web/src/app/profile/_lib/data.ts` `loadKeyed()` comments query, via `rows.ts` `COMMENT_COLUMNS` | session (anon or authenticated) | Yes. Whole query 42501s; `comments` section goes empty | `comment_bodies()`, switch below |
| `apps/web/src/app/analytics/_lib/rows.ts` `COMMENT_COLUMNS` (own, narrower) | session | No. Never selects `body`/`mentions` | none needed |
| `apps/web/src/app/api/comment/route.ts` rate-limit count and insert-returning | session | No. Selects `id`/`id, status` only | none needed |
| `discourse/data.ts` `commentIdsWithShowableBodies()`, `readLatest()` | session, via `comment_tiers`/`own_comment_readings` RPC | No. Already routes through a function | none needed; see recommendation below |
| `_recovered/api/comments.js`, GET `/api/comments`, live, byte-identical to production (`council/security/hotfix-2026-09-21-api-comments/README.md`) | `SUPABASE_SERVICE_KEY` | No. Service role holds its own table grant (`arwdDxtm`), untouched by either migration | none from this migration. Same leak the hotfix folder already drafted A/B for; still Dan's to deploy |
| `_recovered/api/comment.js`, `comment/[id].js`, `comment/[id]/nominate.js`, `admin/*.js` | `SUPABASE_SERVICE_KEY` | No | none needed. `nominate.js`'s own comments read is `id, member_id, article_id`, no body |
| `_recovered-next/lib/get-comment.js`, used by `app/comment/[id]/opengraph-image.js` | `SUPABASE_SERVICE_KEY` | No | none from this migration. Gates only on `status <> 'suppressed'`, no tier check at all; renders any pending or published comment's body into a public PNG. Not previously drafted into a hotfix; flagged here |
| `_theme/assets/js/post.js` and every other theme bundle | none. No `createClient(`, no `ANON_KEY`, no `NEXT_PUBLIC_SUPABASE` anywhere under `_theme/` | No, trivially | none needed |
| `public.profile_effective_capabilities` (the one view in `public`) | n/a | No. Full definition read; joins `profile_admin_roles`, `admin_role_capabilities`, `profile_admin_capability_grants`; no reference to `comments` | none needed |
| Every function in `public` (`prokind = 'f'`) | n/a | No. Regex sweep of every function definition for `\ybody\y` / `\ymentions\y` returns zero besides the one this migration adds | none needed |
| Edge functions | n/a | No. `list_edge_functions` on `mguulnibvzusfvyuowwh` returns zero; no local `supabase/functions/` | none needed |
| `scripts/check-env.mjs` | session, generic table sweep, `comments` named at line 123 | No column-specific body/mentions selection found | none needed; a diagnostic tool reporting the narrower grant afterward is its job |
| `packages/core` | n/a | No. Pure logic, no Supabase import | none needed |

The full legacy tree (`_recovered/`, `_recovered-next/`) was also swept for `ANON_KEY`,
`SUPABASE_KEY` (bare), and `NEXT_PUBLIC_SUPABASE`: zero matches anywhere. Every Supabase client in
quarantine, without exception, is a service-role client. Neither migration here touches or fixes
any of them; they are a separate, already-larger problem (`council/security/hotfix-2026-09-21-api-comments/README.md`),
and the `get-comment.js` row above extends that problem's known surface by one file.

## Reader switches for the builder

Both switches share one shape: stop asking `comments` for `body`/`mentions` directly, call
`comment_bodies(comment_ids)` the same way `comment_tiers` is already called, and merge its rows
onto the comment by `comment_id`, same Map-merge as `readLatest()` already does for tiers. The one
new thing neither existing RPC needed: a comment absent from `comment_bodies`' result is not an
error, it is the withheld case, so each caller has to fail closed on a missing entry rather than
render an empty string.

### `apps/web/src/components/discourse/data.ts`

- **Line 42.** `COMMENT_COLUMNS` drops `body` and `mentions`:
  `'id, parent_id, member_id, member_name, status, created_at'`.
- **Line 50.** `type ClassificationRead = 'comment_tiers' | 'own_comment_readings';` widens to a
  third value, e.g. `type LatestRead = 'comment_tiers' | 'own_comment_readings' | 'comment_bodies';`,
  renamed since it is no longer only classification reads. `readLatest()` itself (lines 197-211)
  needs no change; it already calls `supabase.rpc(fn, { comment_ids: commentIds })` and keys the
  Map by `row.comment_id`, generic over `fn`. Only its parameter type widens.
- **Lines 220-230, `commentIdsWithShowableBodies()`.** Recommend redefining it in terms of
  `comment_bodies` rather than re-deriving the tier check in JS:
  ```ts
  export async function commentIdsWithShowableBodies(
    supabase: ServerClient,
    commentIds: string[],
  ): Promise<Set<string>> {
    return new Set((await readLatest(supabase, 'comment_bodies', commentIds)).keys());
  }
  ```
  This removes the second, independently-maintained copy of the withheld predicate; the database
  function becomes the one place it lives. Not required for correctness (both currently agree), but
  it is exactly the drift this migration's own "THE PRICE" comment warns about, and this call site
  is the cheapest place to close it.
- **Lines 246-283, `toComment()`.** Needs a fourth parameter and a restructured validity check:
  ```ts
  function toComment(
    row: Row,
    tierRow: Row | undefined,
    bodyRow: Row | undefined,
    memberId: string | null,
  ): DiscourseComment | null {
    const id = str(row.id);
    const status = statusOrNull(row.status);
    const createdAt = str(row.created_at);
    if (!id || !UUID_RE.test(id) || !status || !createdAt) return null; // rawBody check removed

    const rowMember = str(row.member_id);
    const isOwn = memberId !== null && rowMember === memberId;
    if (status !== 'published' && !isOwn) return null;

    const tier = toTier(tierRow);
    let withheld: Withheld | null = null;
    if (status === 'suppressed') withheld = 'suppressed';
    else if (!tier) withheld = 'unread';
    else if (tier?.final === 'breach') withheld = 'breach';

    const rawBody = withheld ? null : str(bodyRow?.body);
    // A non-withheld comment with no bodyRow is the two predicates disagreeing; log it and fail
    // closed rather than render an empty body.
    if (!withheld && rawBody === null) {
      console.error('discourse: comment_bodies had no row for a non-withheld comment', { id });
    }
    // ...
    return {
      id,
      parentId: /* unchanged */,
      authorName: nonBlank(row.member_name) ?? '',
      body: rawBody !== null ? decodeStoredText(rawBody) : null,
      withheld: withheld ?? (rawBody === null ? 'unread' : null),
      // ...
      mentions: withheld || rawBody === null ? [] : toMentions(bodyRow?.mentions),
    };
  }
  ```
  (Shape, not a diff to apply as written; the builder should fit it to the surrounding fields and
  add a test for the disagreement branch.)
- **Lines 327-344, inside `loadDiscourse()`.** After `const tiers = await readLatest(supabase,
  'comment_tiers', ids);`, add `const bodies = await readLatest(supabase, 'comment_bodies', ids);`
  and pass `bodies.get(id)` into `toComment(row, id ? tiers.get(id) : undefined, id ?
  bodies.get(id) : undefined, memberId)`.

### `apps/web/src/app/profile/_lib/rows.ts` and `data.ts`

- **`rows.ts` line 291.** `COMMENT_COLUMNS` drops `body`:
  `'id, article_slug, article_title, published_at'`.
- **`rows.ts` lines 301-313, `parseCommentRow()`.** Keep the interface and the `body === null`
  validity check as they are; feed the function a row that already has `body` merged onto it from
  the `comment_bodies` result, so its shape is unchanged from the caller's side.
- **`data.ts` line 35.** Import stays (`commentIdsWithShowableBodies`) only if the builder keeps the
  two-step filter; recommended instead: drop it here and merge bodies directly, one round trip
  instead of two.
- **`data.ts` lines 267-276, inside `loadKeyed()`.** Replace the showable-set-then-filter with a
  merge:
  ```ts
  const recent = comments.error ? [] : parseRows('comments', comments.data, parseCommentRowShape); // body optional at this stage
  let comments_: CommentRow[] = [];
  try {
    const bodies = await readLatest(supabase, 'comment_bodies', recent.map((c) => c.id));
    comments_ = recent
      .map((c) => {
        const b = bodies.get(c.id);
        return b ? parseCommentRow({ ...c, body: b.body }) : null;
      })
      .filter((c): c is CommentRow => c !== null);
  } catch (err) {
    warn('comment_bodies', err instanceof Error ? err.message : String(err));
  }
  ```
  `readLatest` lives in `discourse/data.ts`; export it (it is already generic and takes no
  discourse-specific state) rather than duplicating the RPC-plus-Map loop a third time.
- **`data.ts` line 283.** `comments: keyed.comments` no longer needs its own
  `.filter((c) => showable.has(c.id))`; the merge above already only produces rows for comments
  `comment_bodies` returned.

## Verification

Run after `20260921183000_comment_bodies_breach_withheld.sql`. First query: expect anon true,
authenticated true, public false, service_role true. Second: expect
`{postgres=X, service_role=X, anon=X, authenticated=X}`, no PUBLIC entry.

```sql
select
  has_function_privilege('anon', 'public.comment_bodies(uuid[])', 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', 'public.comment_bodies(uuid[])', 'EXECUTE') as authenticated_execute,
  has_function_privilege('public', 'public.comment_bodies(uuid[])', 'EXECUTE') as public_execute,
  has_function_privilege('service_role', 'public.comment_bodies(uuid[])', 'EXECUTE') as service_role_execute;

select proacl from pg_proc where oid = 'public.comment_bodies(uuid[])'::regprocedure;
```

```
# Functional, no session, publishable key. Expect 200, 3 rows (the 3 live comments, all non-Breach).
curl -s "https://mguulnibvzusfvyuowwh.supabase.co/rest/v1/rpc/comment_bodies" \
  -H "apikey: $ANON_KEY" -H "content-type: application/json" \
  -d '{"comment_ids":["6eee5515-b1a2-423a-98a2-5c9fbeb7b0fd","c08e2dca-0b2a-4078-90e9-8543d2299b5d","683bd4df-45d8-4f00-b9ab-ba14651deeb4"]}'
```
($ANON_KEY from `apps/web`'s `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `get_publishable_keys`; not
recorded here.) An article page and a profile page with comments should render unchanged before the
reader switch ships (this migration alone changes nothing anyone sees, it only adds a function).

Run after the reader switch ships and again after
`20260921184500_close_comments_body_and_mentions_to_public.sql`:

Column grants. Expect anon false, authenticated false, service_role true, for both columns:

```sql
select
  has_column_privilege('anon', 'public.comments', 'body', 'SELECT') as anon_body,
  has_column_privilege('authenticated', 'public.comments', 'body', 'SELECT') as auth_body,
  has_column_privilege('service_role', 'public.comments', 'body', 'SELECT') as service_body,
  has_column_privilege('anon', 'public.comments', 'mentions', 'SELECT') as anon_mentions,
  has_column_privilege('authenticated', 'public.comments', 'mentions', 'SELECT') as auth_mentions;
```

```
# Direct select, publishable key. Expect 42501 on both.
curl -s "https://mguulnibvzusfvyuowwh.supabase.co/rest/v1/comments?select=body&limit=1" -H "apikey: $ANON_KEY"
curl -s "https://mguulnibvzusfvyuowwh.supabase.co/rest/v1/comments?select=mentions&limit=1" -H "apikey: $ANON_KEY"
```

Then: an article page with comments renders its 3 cards unchanged; a profile page with comments
renders its recent-comments section unchanged; `/analytics` still 200s and `classifications?select=id`
still returns `[]` (the `classifications_service_only` deny, untouched by either migration).

## Rollback

`20260921183000` (function): `drop function if exists public.comment_bodies(uuid[]); notify pgrst,
'reload schema';`. Safe only while the reader switch has not shipped, or after
`20260921184500` has already been rolled back first; dropping the function out from under a reader
that calls it reproduces the same break the ordering rule exists to prevent.

`20260921184500` (revoke): does not need the 044120 shape re-run. It only removed two columns from
the granted set, so undoing it only needs to add them back:
```sql
grant select (body, mentions) on public.comments to anon, authenticated;
notify pgrst, 'reload schema';
```

Rollback order is the reverse of apply order: `20260921184500` first if applied, then the reader
switch (revert the app change) if shipped, then `20260921183000` last.

## Traps

- **`comment_bodies` restates the comments SELECT predicate and the tier-resolution fallback,
  same as `comment_tiers`/`own_comment_readings` already do.** A change to either the two policies
  on `comments` or the locked 40/35/15/10 weighting has to change this function in the same
  migration. Re-keying identity to `profiles.id` (rebuild map step 2) is exactly that kind of
  change.
- **A comment absent from `comment_bodies`' result is not an error.** Both reader switches above
  have to treat "no row for this id" as withheld, not as a fetch failure. Getting this backwards
  (throwing, or rendering an empty string) either breaks the feed for every withheld comment or
  shows a blank card instead of the suppression notice.
- **`own_comment_readings` still refuses anon**, unrelated to this change; both switches only touch
  `comment_bodies`, which anon does need.
- **Do not select `comments.member_email`.** Untouched by both migrations here; stays closed since
  `20260921044120`.
