# Platform analytics

*`builder`, night of 2026-09-20. Route: `apps/web/src/app/analytics/`. Reader: Dan. Every count
below was measured on `mguulnibvzusfvyuowwh`, confirmed as Dialecta by its own table names
(`axis_events`, `tier_nominations`, `sparring_partners`, `reserved_handles`), through the Supabase
MCP as `supabase_read_only_user`, between 04:00 and 04:30 UTC on 2026-09-21. The page re-derives
each one through the anon client on every request; this document does not.*

Web analytics stays with Plausible (`apps/web/src/lib/analytics.ts`). This is what happens inside
the platform. Screenshots: `2026-09-20-analytics-desktop.png` (1280 wide) and
`2026-09-20-analytics-380.png`, both in this folder.

## The access model decides the page

| Table | Rows | The anon or session client sees | Why |
| --- | --- | --- | --- |
| `comments` | 3 | all 3 | policy `status = 'published'` |
| `articles` | 5 | all 5 | policy `status = 'published'` |
| `axis_scores` | 36 | all 36 | policy `true` |
| `archetypes` | 3 | all 3 | policy `true` |
| `follows` | 14 | all 14 | policy `true` |
| `profiles` | 14 | all 14, on 39 of 42 columns | no table grant; column grants on everything but `ghost_member_id`, `gifted_by_member_id`, `user_id` (migration `20260920192954`) |
| `classifications` | 3 | 0, no error | policy `USING (false)` |
| `axis_events` | 27 | 0, no error | policy `USING (false)` |
| `share_events` | 7 | 0, no error | policy `USING (false)` |
| `celebration_events` | 1 | 0, no error | policy for `service_role` only |
| `tier_nominations`, `fp_snapshots`, `aspirations` | 0, 4, 0 | 0, no error | policy `USING (false)` |

Method: `has_table_privilege` and `has_column_privilege` for grants, `pg_get_expr` over `pg_policy`
for policies, exact `count(*)` for rows.

**The first version of this table was wrong about `profiles`, and the page caught it.** I listed it
as closed outright, from `has_table_privilege` (false) plus a read of
`information_schema.column_privileges` that came back empty. That view only shows grants the reading
role is party to, and the MCP reads as `supabase_read_only_user`, so it saw none of the column
grants. On its first load the page's own probe reported that `profiles` returned 14 rows to anon.
`has_column_privilege` showed why. The probe exists for exactly this: the access map is a copy of a
database fact the anon role cannot read, so every load checks the copy against behaviour. Method
lesson for anyone measuring grants from the MCP: use `has_column_privilege`, never
`information_schema`.

It also means root `CLAUDE.md` is half right. It says every `profiles` column is public, including
`is_admin`, `subscription_tier`, `pact_signed_name`, `order_negotiation_log` and `ghost_member_id`.
All of those are still anon-readable except `ghost_member_id`.

**Decision: the page reads through `createClient()` only, never the service role.**
`SUPABASE_SERVICE_ROLE_KEY` is not set in `apps/web/.env.local`, so the service client throws in dev
today. More important, `auth.users` holds 0 rows, so no gate can be keyed to a real identity yet. A
weak gate in front of a key that bypasses RLS leaks every table the moment it fails. A weak gate in
front of the anon client leaks nothing the public anon key does not already expose.

## Gate

`_lib/gate.ts`. In production: a session whose JWT verifies through `getClaims()`, and whose `sub`
is listed in `ANALYTICS_ADMIN_UIDS` (comma separated). No session goes to `/login`; a session whose
`sub` is not listed gets a 404; an unset list admits nobody. Under `next dev` the gate
is open and the page says so in an amber banner on every render. `next build`, `next start` and
Vercel all force `NODE_ENV` to production.

What it protects: the assembled page. What it does not: the rows, which any holder of the anon key
reads directly. Because `auth.users` is empty, nobody can open the production page yet, Dan
included. That is the correct failure.

Verified on a production build served on a spare port: no session and a forged session cookie both
return `307` to `/login` with `Cache-Control: private, no-store`. Not verifiable tonight: a valid
session that is not on the list, because no account exists to test with.

## Metrics

"At 3" and "at 3,000" describe the same component at today's volume and at the volume the brief asks
it to survive. Grain is what one counted unit is.

### Activity

| Metric | Query | Decision it changes | At 3 | At 3,000 |
| --- | --- | --- | --- | --- |
| Last comment, article, follow, engine write | newest `created_at` on published `comments` and `articles` and on `follows`; newest `last_updated` on `axis_scores`; fixtures excluded | Whether anything below is a trend or an April baseline | Apr 29 to May 1, all stopped; "the newest row on the platform is from May 1, 143 days ago" | four recent dates, all live |

Live means within 7 days. That threshold is an assumption; no spec sets one.

### Contribution

| Metric | Query | Decision it changes | At 3 | At 3,000 |
| --- | --- | --- | --- | --- |
| Published comments | exact count, published, fixtures excluded | Whether community voting, 35% of a final tier, has anything to vote on | 3 | a number |
| Commenters and top share | distinct `member_id`; largest commenter's share | Recruit commenters or writers next | 2, top 67% | a number and a share |
| Replies | `parent_id is not null` | Whether threading ships before anything that reads the Discourse pillar | 0 | a number |
| Articles and authors | published, distinct `author_member_id`, fixtures apart | Whether publishing cadence is the constraint | 4 by 3, plus 1 fixture by `seed:maya` | a number |
| Comments by week | `created_at` in 26 Monday weeks, UTC | Rising, flat or stopped | one bar in the week of April 27, then 21 empty weeks | a trend |
| Commenters in arrival order | first `created_at` per `member_id`, first 10 | Who the Founding Voices cohort would be | 2 rows | 10 rows and "N more" |

Arrivals use `created_at`. `published_at` was set to one instant on all three rows by
`20260920193044_publish_the_three_existing_comments.sql`; a chart on it would show every comment
arriving on 2026-09-20.

### Membership

| Metric | Query | Decision it changes | At 3 | At 3,000 |
| --- | --- | --- | --- | --- |
| Underwriters | `subscription_tier = 'pro'`, fixtures excluded, labelled Underwriter as the subscription model requires | Whether the price decision is due | 1 of 11; set by a member 1, by a payment 0 | a count, and how many a payment set |
| Founding cohorts | the column combinations in `docs/SUBSCRIPTION-MODEL.md` | When each cohort closes | Charter Underwriters 1, Charter Writers 0, Founding Voices 0 | three counts |
| Signed the Pact | `pact_agreed_at is not null` over non-fixture profiles | Whether commenting can require a signed Pact without shutting most members out | 3 of 11, all authors | a share |

The one Charter member reads as a Charter Underwriter by the documented columns (`is_charter`
without `is_gifted`), a cohort defined as the first 100 paying members, and no payment path exists.
Either the flags or the cohort definition is off. `subscription_tier_set_by` holds a member id, so
the tier was set by hand.

A standalone profile count was cut: without a `created_at` it cannot become a rate, and a count
names no decision. It appears as the base of the shares instead.

### Discourse

| Metric | Query | Decision it changes | At 3 | At 3,000 |
| --- | --- | --- | --- | --- |
| Tier mix, live | sum of `axis_scores.tier_mix`, non-fixture rows | Whether the classifier has met enough Heat, Stance and Breach on real traffic to trust those boundaries | Forum 21, Spark 5, Echo 1; none of the other four | shares and n |
| Tier mix, fixtures | the same over fixture rows | Whether fixtures come off before a public surface quotes a platform figure | 225 units, holding every Heat (7) and Stance (2) on the platform | fades as live grows |
| Turbulence and clarity, live | the engine's `deriveAxisMetrics`, pooled | Whether a real fingerprint can show texture yet | 0.00 and 0.95 | two ratios |
| Article tiers | `final_tier`, one per live article | Whether essays hold the tier they ask of commenters | Forum 3, Spark 1 | shares |

**Grain.** `tier_mix` counts once per axis an item reached. On the service role each article reached
five axes, each Forum comment three and the one Echo comment one, so axis grain weights every item by
how many axes its tier touches and under-weights the lower tiers by construction. At item grain the
same 7 live items are Forum 5, Spark 1, Echo 1: Echo is 14%, not 3.7%. Those 7 are exactly the items
the ledger holds. Item grain for comments needs `classifications`, which this client cannot read.
Shares are withheld below 20 units.

The formulas live only in the recovered engine, `deriveAxisMetrics`
(`_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx`, lines 199 to 205). `docs/FINGERPRINT.md`
cites lines 175 to 177, which is the comment describing them. The engine returns clarity 1 when
Forum, Echo and Fog are all zero and the page matches it. `packages/core` exports the functions that
consume these ratios but not the derivation, so the page defines it a second time and says so.

### Engine

| Metric | Query | Decision it changes | At 3 | At 3,000 |
| --- | --- | --- | --- | --- |
| Axis events recorded | sum of `axis_scores.comment_count`, live rows | Whether the fingerprint has any input to render from | 27, against 3 published comments | a number |
| Graduations | sum of `graduation_count`, live and fixture | Whether any platform-wide fingerprint figure is safe to show | 27 live, 225 fixture, 89% fixture | fixture share near 0 |
| Topic history coverage | live rows whose `topic_history->0` is not null | Whether restoring `topicPhases` in the carousel changes what real profiles show | 3 of 18, Reach only | a share and the axes |
| Archetypes assigned | live contributors with an `archetypes` row | Whether `initialise_contributor_axes()` is fixed before the next contributor | 0 of 3 | a share |
| Profiles with a fingerprint | live contributors over non-fixture profiles | How many members that function has left without axis rows | 3 of 11 | a share |

`axis_events` is closed, and `comment_count` stands in for it. It counts axis events from articles
and comments alike, which is why it reads 27 against 3 comments. On the service role it reconciles
exactly: 20 article events and 7 comment events, 27 rows, and the live rows sum to 27.

Profiles with a fingerprint is a difference of counts, because `ghost_member_id`, the join between a
profile and its fingerprint, is withheld from the anon client. On the service role every fingerprint
matched a profile, so it was exact tonight.

**Fixtures.** Three tests. A `seed:` prefix on `member_id` is the operative one, because it applies to
every table and in SQL. An axis row whose `tier_mix` sums higher than its `comment_count` is a tier
mix with no events behind it, an independent check. `profiles.is_seed` gives a third at count grain.
Tonight all three find 3. If the first two disagree the page gives a count, not the member ids.

## Known faults

Each carries a live symptom the page reads on every load, and fades when the symptom clears.

| Fault | Evidence | Symptom tonight | Fix |
| --- | --- | --- | --- |
| `initialise_contributor_axes()` aborts on every call | It inserts `'forming'` into `archetypes.archetype_id`, whose enum holds only the eight archetype names; `'forming'` is an `archetype_confidence` value. One transaction, so its `axis_scores` insert rolls back too | 8 of 11 profiles have no axis rows; 3 of 3 contributors who do have no archetype | `migrator`: `archetype_id` null with `confidence = 'forming'`, or add the placeholder to the enum. `packages/core` already models it as `FORMING`, outside `ARCHETYPE_IDS` |
| Nothing in this repository writes `axis_events` or `axis_scores` | repo-wide grep; `packages/core/src/axis-mapping.ts` holds the logic and no writer | last engine write 143 days ago | `builder`: write the ledger on the service role beside the classification insert in `api/comment/route.ts` |
| Classifications are written from one route per codebase | `apps/web/src/app/api/comment/route.ts:244`, and `api/comment.js:168` in the legacy API; both service role, and only the service role can read the result | one tier per comment cannot be shown | the aggregate function below |
| `comments.published_at` is a backfill | 3 rows, 1 distinct value | checked live | none; arrivals use `created_at` |
| `axis_scores.comment_count` counts axis events | 27 against 3 comments; `packages/core` names the counter `eventCount` | checked live | `migrator`: rename or comment the column |

## For `security`, not on the page

1. **The Ghost member id is still public.** Migration `20260920192954` closed
   `profiles.ghost_member_id` because the comment route treats that value as proof of identity:
   `_recovered/api/comment.js` takes `member_uuid` from the request body, and so do recovered admin
   routes including `admin/member-tier.js` and `admin/team.js`. The same values remain anon-readable in
   `comments.member_id`, `articles.author_member_id`, `axis_scores.member_id`,
   `archetypes.member_id`, `follows.follower_id` and `followee_id`, `feed_events.primary_member_id`,
   and `profiles.subscription_tier_set_by`, which that migration re-granted. This page reads two of
   them to do its job, which proves the point. Whether the deployed `dialecta-api` still trusts a
   body-supplied id was not tested, and should not be tested against production without a decision.
   The page keeps member ids out of its view model entirely, because React's development build
   serializes server component props into the page's flight payload: before the fix, two ids were in
   the HTML.
2. **`comments.member_email` is anon-readable.** `has_column_privilege('anon', 'public.comments',
   'member_email', 'SELECT')` is true and the policy returns every published row. All three became
   published on 2026-09-20. The page never selects the column.

## Scale

1. Totals come from `count: 'exact'`, so no rows travel for a count.
2. Row reads page through `.range()` in 1,000-row pages ordered by `id`, advancing by the rows
   returned rather than the page size, to a 50,000-row ceiling, and a panel that hits the ceiling says "first 50,000 of
   N". Required at the brief's own target: 1,400 contributors is 8,400 `axis_scores` rows, and an
   unpaged select stops at PostgREST's 1,000 without an error.
3. `topic_history` travels as its first element only.
4. Shares below 20 units become counts. Lists stop at 10 and say how many more.
5. The week strip is always 26 buckets, with its scale printed.
6. Every row is shape-checked at runtime, standing in for the missing `<Database>` generic, and a row
   that fails is counted on the page rather than read as zero.

Past a prototype, aggregation moves into SQL, which is `migrator`'s.

## Wanted and not available

| Number | What blocks it |
| --- | --- |
| Member arrival rate | `profiles` has no `created_at`; nothing records when a member joined |
| Comment tiers one per comment; AI against self-declared agreement | `classifications` read policy is `false` |
| Axis events by source | `axis_events` read policy is `false` |
| Reach by channel | `share_events` read policy is `false` |
| Community voting | `tier_nominations` is closed and holds 0 rows |
| Founding Voices apart from peer gifts | same columns; `gifted_by_member_id` tells them apart and is withheld |
| Whether comment attempts fail or never happen | no attempts table or request log; zero comments since April 30 could be either |
| Signed-in activity | `auth.users` holds 0 rows |
| An exact profile-to-fingerprint join | `ghost_member_id` is withheld, correctly |
| One definition of turbulence and clarity | lives in quarantine; `packages/core` should export it |
| Typed rows | no client carries `<Database>` |

**The one migration that unblocks most of this:** a `SECURITY DEFINER` function returning aggregate
counts only (comment tiers, events by source, shares by channel, nominations), executable by an admin
identity and revoked from `anon`. It returns numbers, never rows, so it can sit behind the same simple
gate. `migrator` owns it, and it needs a real admin identity first.
