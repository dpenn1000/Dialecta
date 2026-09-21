# Delta mechanic port

*The architect seat's port plan for designer's finding 3
(`council/designer/research/2026-09-21-live-vs-localhost/REPORT.md:128` to `149`): the reading-stage
spine and the Declare opinion-mapping modal, live on every article at dialecta.org and absent from
`apps/web`. A plan, not code; `builder` implements.*

## What live does

Live is the `dialecta-api` deployment described in root `CLAUDE.md:15`: what runs at
`https://www.dialecta.org` today. Its source is preserved, read-only, in `_theme/` (Ghost theme
templates) and `_recovered/` (the Vercel API functions and the React components the theme mounts).
Confirmed against the running site 2026-09-21: `/on-the-far-shore-of-fear/` renders the six-segment
spine sticky under the nav, with the tier row ("AUTHOR DECLARED The Spark, ENGINE READ The Forum,
FINAL The Forum") and the "12 VOICES" Discourse chip matching the code below exactly.

**The script that matters is inline, not the asset it shares a name with.** `_theme/assets/js/post.js`
is an esbuild bundle (206KB, 69 lines, minified) with no readable connection to the spine. The spine
markup, the two overlay shells, and every line of their open/close/auto-open logic live inline in a
`<script>` block inside `_theme/post.hbs:893` to `1174`. The bundle is the compiled output of the
React mounts `_theme/post.hbs` renders into (`post-page-mount.jsx` and its imports); read the source,
not the bundle.

### The six stages

| Spine segment | `data-stage` | Spec stage | What live does |
| --- | --- | --- | --- |
| Reflect | `reflect` | A, pre-read | Tap-and-commit on the article's first opinion map only. Members only (`_theme/post.hbs:806`, `{{#if @member}}`). Auto-opens once per article, 1.5s after load, if the reader has not scrolled past 200px (`:979` to `994`) |
| Read | `read` | B, reading | Chrome only. `data-state="active"` is a hardcoded literal (`:21`), not scroll-driven; the template's own header comment admits it (`:10` to `11`, "Future stages will wire scroll-progress for Read") |
| Declare | `declare` | C, post-read, plus the author's declaration | Tap-and-commit on every map the article has (one or two), for anyone signed in. Auto-opens once per article when `#post-content-end-sentinel` is 50% visible (`:995` to `1010`, sentinel div at `:231`) |
| Discourse | `discourse` | not in spec | Anchor jump to `#dialecta-comments`. "12 voices" is a hardcoded literal in two places (`:36` spine meta, `:188` byline chip), both commented "placeholder voice count for now" (`:184`) |
| Bio | `bio` | not in spec | Anchor jump to `#post-author-bio` |
| Share | `share` | not in spec | `navigator.share` where available, else a popover; both fire `/api/share/track` (`:1147`) |

### What opens the modal

Two overlays, `.post-overlay[data-overlay="reflect"]` and `="declare"` (`_theme/post.hbs:806` to
`874`), reparented to `document.body` on load to escape a stacking context (`:895` to `903`, the
comment explains the z-index bug this works around). Four ways in: click the matching spine
segment (`:938` to `945`), the two auto-opens above, or (Declare only) it stays reachable any time
the reader wants it back. Scrim, Escape, the close button, or the pre-read overlay's "Skip for now"
all dismiss and mark a `localStorage` seen-flag (`dialecta-reflect-seen-<post-id>` /
`dialecta-declare-seen-<post-id>`, `:885` to `886`) so the auto-open does not repeat.

### What a reader enters

Not a drag. Despite the spec's "draggable dot" (`docs/Dialecta_Delta_Mechanic_Spec.md:56`), live's
built interaction is discrete: tap the map to stage a `pending` placement locally (no network call),
tap again to move it, then press an explicit **Commit position** button
(`_recovered-next/lib/theme/dialecta-opinion-map-placement.jsx:50` to `54` for the tap handler,
`:223` to `248` for the button). Coordinates are normalized to the map's own shape: `{x, y}` in
[0,1] for a cartesian map, `{a, b, c}` summing to ~1 for a ternary map, `{x}` in [0,1] for a binary
map (`_recovered/api/opinion-map/place.js:43` to `70`, the validator). Reflect places only
`opinion_maps[0]`, with the author's own position withheld so the reader's first mark is not
anchored (`dialecta-opinion-map-placement.jsx:14` to `15`); Declare places every map the article
declares, with the author's position shown as a labeled brass dot for comparison
(`dialecta-article-classification.jsx:409`, `showAuthorPosition={true}`).

### What is written, where

`POST /api/opinion-map/place` (`_recovered/api/opinion-map/place.js`), server-side only, using the
Supabase **service role** key (`:34` to `36`). Upserts one row into `opinion_map_positions` on the
unique key `(reader_id, article_id, map_index, stage)` (`:106` to `115`;
`_recovered/supabase/migrations/024_opinion_map_positions_multi.sql:32` to `37` for the constraint,
misnamed `023_` in its own header comment, `:2`).
Columns: `reader_id` (the Ghost member UUID, sent by the client, trusted as-is), `article_id` (the
24-hex Ghost post id), `map_index` (0 or 1), `stage` (`pre_read` / `post_read`), `map_type`,
`coordinates` (jsonb), `recorded_at`. No AI call, no rate limit, nothing priced.

### What is read back

Almost nothing of the reader's own. `GET /api/article/<id>` (`_recovered/api/article/[id].js`) is
the only read the front end makes for this surface, and it selects from `articles`, never from
`opinion_map_positions`. It returns `declaration.opinion_maps` (the axes/poles/topic and the
**author's** position, authored content) and `ai_analysis` (the engine's disclosed reading), which
is what Reflect and Declare render. A reader's own committed placement lives only in
`usePlacement`'s React state (`dialecta-opinion-map-placement.jsx:45` to `48`): it resets to blank
on every remount, including a page reload. Nothing computes or displays a delta, a comparison, or an
aggregate. Confirmed by exhaustive search, not absence of looking: `TopologyChangeCard` on the
profile page is checked-in as a "v1 stub... never renders anything in practice" because "v1 returns
no items from the API" (`dialecta-profile.jsx:977` to `980`), and the community feed's
`delta_acknowledged_published` card (`dialecta-community-feed.jsx:304` to `307`) has no producer
anywhere in the code that could ever fire it.

## Where live departs from the spec

The spec (`docs/Dialecta_Delta_Mechanic_Spec.md`) defines six stages, A through F. Live built A and
C, as capture only, and stopped. Every departure below is a fact checked against the code, not an
inference from absence.

| Spec says | Live does | Evidence |
| --- | --- | --- |
| A draggable dot, with a movement arrow that "updates in real time" at Stage C (`:52`, `:78`) | Tap, then a separate explicit Commit button. No live drag feedback, no arrow, ever | `dialecta-opinion-map-placement.jsx:50` to `54`, `:223` to `248` |
| Stage C shows "the before position... as a faded reference point (dashed ring)" for comparison (`:78`) | Post-read starts blank. The reader's own Stage A placement is never fetched or passed in; only the **author's** position is shown | No caller anywhere passes a prior placement into `InteractiveMap`; confirmed by `opinion_map_positions` having no reader anywhere (see above) |
| Stage A's reassurance line, verbatim: "Private until you choose to share. Never used to filter what you see." (`:58`) | Never appears. Live's actual copy is instructional per map type ("Tap once on the plane to mark where you stand on both at once. You can re-place after reading.") | `dialecta-opinion-map-placement.jsx:660`, inside `buildPreReadPrompt()` (`:647`) |
| Stage D: delta computed on Stage C completion, magnitude, direction, a 0.08 threshold (`:89` to `96`) | No `delta_of`, no magnitude, no threshold, anywhere in `_recovered/` or `_recovered-next/` | Exhaustive grep for `delta_vector`, `magnitude`, `movement vector`, `Stage E`, `Stage F`: zero matches outside this spec file and `docs/plans/backlog.md`'s own D-3 row |
| Stage D: community aggregate, "X% of readers shifted," gated on a 20-pair minimum (`:104` to `108`) | No aggregate query, view, or minimum-n check exists | Same search; `opinion_map_positions` has one SELECT policy and no service-side aggregate reader |
| Stage E: the delta reveal screen, before/after plot, axis-specific "+22% toward Policy-driven" copy | Not built | Same search |
| Stage F: public choice, a seeded draft, the DELTA ACKNOWLEDGED chip on the comment | Schema exists (`comments.delta_acknowledged boolean default false`), UI does not. Every one of the 3 live comments has it `false` | DB: `select count(*) filter (where delta_acknowledged) from comments` = 0 of 3, checked 2026-09-21 |
| The Reviser archetype's primary signal: 3 qualifying DELTA ACKNOWLEDGED comments across 2 articles (`:168`) | Cannot fire; the marker is never set | Same as above |
| The Reviser archetype's secondary signal: a classification-prompt heuristic for "I changed my mind because..." (`:170`) | Not in the live classification prompt | `grep` for `reconsidered`, `changed my`, `revised my`, `DELTA` in `_recovered/api/classify.js`: zero matches |

Net: live is a faithful, if simplified (tap not drag), build of Stage A and Stage C's **capture**
half. Everything the spec says those captures are *for*, the comparison, the reveal, the public
choice, the Reviser signal, is entirely unbuilt, live or local. Porting live gets the app to parity
with what a reader sees today. It does not get the app to what the spec specifies. That gap is
larger than the port and is not this plan's job to close; it is named here so nobody mistakes "port
live" for "build the Delta Mechanic."

## What the database holds

Project `mguulnibvzusfvyuowwh` ("Dialecta"), confirmed by table listing (`articles`, `comments`,
`profiles`, `opinion_map_positions` all present) before every query below. Reads only.

**`opinion_map_positions`**: `id uuid`, `reader_id text`, `article_id text`, `stage text`,
`coordinates jsonb`, `map_type text`, `recorded_at timestamptz`, `map_index integer default 0`. No
foreign key on `reader_id` or `article_id`, by original design: the April migration's own comment
says "Phase 1 uses Ghost member_id (text) injected via API"
(`_recovered/supabase/migrations/001_v1_1_schema.sql:228` to `230`). 9 rows total: 4 `pre_read`, 5
`post_read`, 3 distinct readers, 3 distinct articles, dated 2026-05-01 to 2026-05-06. `reader_id`
values are Ghost member UUIDs (e.g. `2f0d5ff2-570e-405a-8b40-ef5552660eb8`); `article_id` values are
24-hex Ghost post ids (e.g. `69eff72be5eec200010d5310`), not `articles.id`.

**RLS**: enabled (`pg_class.relrowsecurity = true`). One policy, `opinion_map_self_read`, SELECT
only, `reader_id = (request.jwt.claims->>'sub')`. That policy is stale: it compares against the
JWT's `sub`, which under today's Supabase Auth is `auth.users.id`, not the Ghost member UUID stored
in `reader_id`. The migration that wrote it said so in advance: "if Phase 2 migrates to Supabase
auth, this clause needs revision" (`001_v1_1_schema.sql:228`). Phase 2 happened; the clause was
never revised. It costs nothing today because nothing calls it (see "What is read back," above), but
it would silently return zero rows for every real session if something did.

**No INSERT or UPDATE policy exists on `opinion_map_positions`, on either client role.** Table
grants say otherwise: `anon` and `authenticated` both hold `INSERT, SELECT, UPDATE, DELETE, TRUNCATE,
REFERENCES, TRIGGER, MAINTAIN` at the table level (`pg_class.relacl`, exploded). But with RLS
enabled and no permissive policy for those commands, Postgres denies them by default regardless of
the grant. This is not drift, it is the original design working as intended: the table comment
records that writes were always meant to go through the service role from server code ("Aggregates
are computed server-side via service role," `001_v1_1_schema.sql:224` to `227`), which is exactly
what `api/opinion-map/place.js` does. It matters for the port because the port is not allowed to
reuse that design: `supabase/CLAUDE.md:9`, "insert and update of own rows through `auth.uid()`.
Pipeline writes use the service role from server code only," and `apps/web/CLAUDE.md:17`, "Add no
other [service-role path]: the rebuild map's rule 2 keeps the service key in pipeline code only." A
reader's own placement is the reader's own row, not a pipeline write, so live's write path is
exactly the shape the port must not copy.

**`comments.delta_acknowledged`**: `boolean not null default false`. 0 of 3 live comments have it
true.

**`articles.declaration` and `articles.ai_analysis`**: both `jsonb not null`, both readable by `anon`
and `authenticated` (`has_column_privilege`, checked directly, both `true`; no column-level revoke
exists for either, unlike `comments.member_email`, which is closed). All 5 live articles have
`declaration ? 'opinion_maps'` true. `articles.declared_claims`, the column `apps/web/src/lib/articles.ts`
already selects, is `[]` on every one of the 5; it is a different, unrelated field (the Discourse
Layer's claim-matching input), not a synonym for `declaration`.

**A usable identity primitive already exists, shipped today.** `public.current_profile_id()`
(`select p.id from public.profiles p where p.user_id = auth.uid()`, `security definer`,
`search_path = ''`) was created by `supabase/migrations/20260921053807_articles_author_write_policy.sql`,
citing this seat's own rebuild map by name (`:34`), granted to `authenticated`, revoked from
`public` and `anon` by name, and already load-bearing on `articles`' own author-write policies
(`:122`, `:137`, `:142`). It resolves only for a profile with `user_id` set, the same limitation
`current_ghost_member_id()` (the comment path's older equivalent, `supabase/migrations/20260921004459_comment_write_identity.sql:48`
to `59`) carries: neither resolves any of the 14 legacy, unclaimed profiles. This is new information
against the rebuild map, filed the same day: the map's own identity row (`team/architect/architecture/2026-09-21-rebuild-map.md:47`)
describes `current_profile_id()` as something step 2 (`:124`) will create. It already exists and is
already live, ahead of the map's own sequencing, built for `articles` alone so far.

## The backlog rows already reserved for this, and why they are stale

This is not unbacklogged. `docs/plans/backlog.md:96` to `98` carries D-1 (2-axis opinion map island),
D-2 (ternary map), D-3 (delta mechanic, before/after placement, `delta_of`), all in Phase D, week
11+, gated behind Cutover (`docs/plans/build-plan.md:63`, `:65`). Three problems with those rows as
written, found by checking each cited source: D-1 cites `components/dialecta-opinion-maps.jsx`
(plural, root-level prototypes folder) as its spec; the shipped engine is
`_recovered-next/lib/theme/dialecta-opinion-map.jsx` (singular), a different, later file. D-1 names
the target table `opinion_positions`; the live table is `opinion_map_positions` (root `CLAUDE.md:81`
already flagged this exact mismatch generally; this is its concrete instance). D-1's "aggregate heat
cloud" and D-3's "`delta_of`" both describe Stage D work that, per the section above, was never
built, so the rows overclaim relative to what a port would restore, while understating what live
already has (three working map types, tap-commit-replace, member gating), which a port restores in
full.

The sequencing is the real question. Phase D sits after Cutover
(`docs/plans/build-plan.md:63`, "Cutover, week 7" then `:65`, "D Mapping and Growth, week 11+"). Taken at
face value, that means: the day `apps/web` becomes dialecta.org, real readers lose Reflect and
Declare, and do not get them back for four more weeks. Whether that is acceptable is Dan's call, not
this plan's; it is flagged under Decisions below because the designer's "High" severity rating is
about exactly this gap.

## The port

### Server components and islands

**No seventh island.** `docs/plans/build-plan.md:50` already names the six: composer, editor,
classification card, votes and nominations, fingerprint, **opinion maps**. The Reflect/Declare
placement UI, the only stateful, drag-and-fetch part of this feature, is that sixth island,
already budgeted. It needs building, not a new slot.

The spine nav and the two overlay shells are chrome: open, close, auto-open-once, a localStorage
flag. `apps/web/CLAUDE.md:9` already names two "recorded exception[s] rather than a precedent" for
exactly this class of thing: the shell's nav/drawer (`nav-client.tsx`, for its focus trap) and the
comment feed (`feed.tsx`, so filter/sort stay instant). The spine controller is the same shape: a
small client component with no Supabase import, wired to server-rendered markup. Recommend it as a
**third recorded exception**, not a formal island: it owns no data, it toggles visibility.
`ArticleDeclaration`'s non-map content (Core Claim, Scope Boundary, Strongest Objection, the "How
the engine read this" disclosure) is plain server-rendered text; the expand/collapse can be a native
`<details>`/`<summary>` element, needing no client JS at all, where live spent a `useState` on it
(`dialecta-article-classification.jsx:309`).

Proposed layout:

```
apps/web/src/components/article-spine/
  spine.tsx           server component: the nav + both overlay shells, static per article
  spine-client.tsx     'use client': open/close, the two auto-opens, localStorage seen-flags
                        (third recorded exception, apps/web/CLAUDE.md:9)
apps/web/src/components/opinion-map/
  engine.tsx           server-renderable: CartesianMap/TernaryMap/BinaryMap, ported from
                        dialecta-opinion-map.jsx, read-only rendering (axes/poles + a position)
  placement-client.tsx 'use client': the island. Tap-stage, commit, re-place. Port of
                        usePlacement + PlacementCard/InteractiveMap
  data.ts              server-only: reads articles.declaration for the maps + author positions
  actions.ts           the server action (below)
apps/web/src/components/article-declaration/
  declaration.tsx       server component: Core Claim/Scope/Objection, native <details> AI
                        disclosure, renders one <PlacementClient> per post-read map
```

### The lib/data module

`apps/web/src/lib/articles.ts` does not select `declaration` or `ai_analysis` today (only
`declared_claims`, confirmed empty on all 5 articles). Per the architect's own rule already in force
elsewhere in this app ("Each surface's queries live in one server-only module that names every
column it reads," `apps/web/CLAUDE.md:15`, citing this seat's rebuild map rule 1), the new read
belongs in `components/opinion-map/data.ts`, not folded into `lib/articles.ts`'s existing
`SUMMARY_COLUMNS`, since the article summary list (`/`, `/articles`) never needs opinion-map data and
should not pay for it. Follow `components/discourse/data.ts`'s own pattern exactly: named columns,
`server-only`, one function, rows validated at the boundary rather than trusted from a generic
client. No new Supabase client, no `Database` typing available yet (none of the four clients carry
it; that is the rebuild map's own open item, fitness function "ast-grep typed-client rule").

### The write path

A server action calling one database function, as asked. The function, provisionally
`public.place_opinion_map_position(p_article_id uuid, p_map_index int, p_stage text, p_map_type
text, p_coordinates jsonb)`, `security definer`, `search_path = ''`, matching the pattern
`20260921053807_articles_author_write_policy.sql` just shipped, not the older
`search_path = public, pg_temp` form. Inside: resolve `public.current_profile_id()`; if null, return
no rows (the same "signed in, unclaimed" shape `get_own_profile_for_comment()` already uses); re-run
the same validation live's JS does today (`stage` in `pre_read`/`post_read`, `map_type` in
`cartesian`/`ternary`/`binary`, coordinate shape and range per type), since a client-supplied shape
is never trusted twice, only once, and the function is that once; upsert on the existing unique key,
substituting `reader_id`/`profile_id`. `reader_id` is never a function argument; it comes from the
session, the same reason `comment/route.ts` never reads `member_uuid` from the request body
(`apps/web/src/app/api/comment/route.ts:9` to `19`).

Grants: revoke `insert, update` on `opinion_map_positions` from `anon, authenticated` outright
(closing the over-broad table grant this plan found above), and let the function be the only writer,
`security definer` carrying the privilege. Revoke `execute` on the new function from `public` and
`anon` by name, matching the fix `architect-03` already had to make once this week after a bare
revoke left `anon` holding it through `PUBLIC`. Fix the stale `opinion_map_self_read` SELECT policy
to read `reader_id = (select public.current_profile_id())`, once `reader_id` is uuid-typed (next
paragraph); until then it stays broken exactly as found, since nothing reads through it.

**Re-key this one table now, not at the big re-key.** `supabase/CLAUDE.md:11`: "Everything Dialecta
owns keys on `uuid`. Do not cast one into the other." `opinion_map_positions` is Dialecta's own data,
not a Ghost import artifact, and unlike `articles.author_member_id` (which the fresh migration had
to keep "until that column is retired" because `/write`, the revise link, and analytics still read
it), nothing anywhere reads `opinion_map_positions.reader_id` or `.article_id` today. No downstream
consumer exists to keep faith with. Alter `reader_id` to `uuid references profiles(id)` and
`article_id` to `uuid references articles(id)`, backfill the 9 existing rows by joining
`profiles.ghost_member_id` and `articles.ghost_post_id` (both already unique columns carrying
exactly these values), and the table never needs touching again when the app-wide identity ADR
lands. This is a small, low-risk, independently reversible slice of the re-key `migrator` and
`decider` are still ruling on for the rest of the app; it does not pre-empt that ruling, it agrees
with the direction every seat already recommended (`council/log/2026-09-21-identity-forming-and-the-runner.md:637`,
"nobody argued for `user_id` itself").

### What waits on the identity re-key, and what does not

**Nothing in this port waits on Dan's app-wide identity-key ruling**
(`docs/MORNING-AUDIT-2026-09-21.md:119`, item 2.10; question 1 of
`council/log/2026-09-21-identity-forming-and-the-runner.md`). The read side (spine chrome, the
map engine, `ArticleDeclaration`'s text, `articles.declaration`/`ai_analysis`) touches no identity at
all; it is public, already-open data. The write side needs an identity primitive, but
`current_profile_id()` already exists, already resolves `profiles.id`, and is already load-bearing
in production for `articles`. Building the placement write against it, with the one-table re-key
above, rides the same bet the `articles` author-write policy placed this morning: not yet formally
ratified as the new ADR that supersedes ADR-002 in part, but the only option any seat argued for, and the direction
the codebase is already shipping in. The one real limitation, inherited, not introduced: a member
whose `profiles.user_id` is null, which is all 14 legacy profiles today
(`team/architect/architecture/2026-09-21-rebuild-map.md:47`;
`council/log/2026-09-21-identity-forming-and-the-runner.md:41`, "null on all 14 rows") cannot place
a position until they claim their profile through the existing claim-token flow, same as they cannot
comment today. That same log independently confirms this plan's `opinion_map_self_read` finding: "All
9 rows hold Ghost ids, so no Supabase Auth reader can read their own rows through it" (`:42`).

### Build order

Ordered for value first: the zero-schema, zero-risk read side lands complete before the write side
needs any decision at all.

| # | Step | Acceptance test |
| --- | --- | --- |
| 1 | `components/opinion-map/data.ts`: read `declaration`, `ai_analysis` for a published article | For each of the 5 live articles, the module returns a non-null `opinion_maps` array matching what `GET /api/article/<id>` returns live today, checked by hand against one ternary and one binary article |
| 2 | `article-spine/spine.tsx` + `spine-client.tsx`: the six-segment nav, sticky on desktop / fixed-bottom on mobile (port `_theme/assets/css/style.css:1024` to `1046` and `:1136` to `1166` into tokens), click-to-open on Reflect/Declare, anchor-jump on the rest | Visiting any article shows all six segments; clicking Declare opens a modal; Escape, the scrim, and the close button all dismiss it; reloading after a dismiss does not reopen it (localStorage flag) |
| 3 | `article-declaration/declaration.tsx`: Core Claim, Scope Boundary, Strongest Objection, native `<details>` AI disclosure, inside the Declare overlay | For an article with `ai_analysis` populated, the disclosure is collapsed by default and its content matches `ai_analysis.tier_reason` etc.; for one with `declaration` but no `ai_analysis`, no disclosure control renders |
| 4 | `opinion-map/engine.tsx`: render-only Cartesian, Ternary, and Binary from `declaration.opinion_maps`, author position shown | All 5 live articles' maps render inside Declare with the author's position in the right place (spot-check coordinates against the DB rows read in this plan) |
| 5 | The one-table re-key migration (`reader_id`, `article_id` to uuid, backfilled) plus `place_opinion_map_position()`, its grants, and the fixed SELECT policy | On a branch: the 9 legacy rows survive the backfill with the same `(reader, article)` pairs; a signed-in test profile can call the function and see exactly one row upserted, not duplicated, on a second call with different coordinates |
| 6 | `placement-client.tsx` wired into Reflect (map 0 only, member-gated, author position hidden, commit closes to "Begin reading") and into Declare (every map, author position shown) | A claimed test profile can tap, commit, and re-place on both overlays; a signed-out visitor sees Declare's maps read-only and never sees Reflect at all; the written row's `reader_id`/`article_id` match the signed-in profile and the viewed article |
| 7, optional | Read back the caller's own committed placement on mount, so it survives a reload (beyond live's own behavior, which does not do this) | Placing, reloading, and reopening the overlay shows the same committed position, not a blank map |

Steps 1 to 4 need no decision below to start. Step 5 needs the identity-key and delete-rule shape
Dan is already ruling on for the rest of the app (Decisions, below) only in the loose sense that it
is the same direction; it does not block on that ruling landing first, per the section above.

## Decisions

| # | Decision | Recommendation | Who decides |
| --- | --- | --- | --- |
| 1 | A seventh island for this feature | No: the existing "opinion maps" island (`docs/plans/build-plan.md:50`) already covers it; the spine/overlay chrome is a third recorded exception, not an island | This seat, as stated above; open to Dan's override the same way the first two exceptions are |
| 2 | Re-key `opinion_map_positions` to uuid now, ahead of the app-wide identity ADR | Yes, on its own migration, independent of the identity-key ADR (item 2.10) landing first, for the reasons in "The write path" | `migrator`, with Dan's approval per `supabase/CLAUDE.md:8`'s "never edit a shipped migration, fix forward" and the general rule that a migration to the history table needs his sign-off |
| 3 | Whether the port lands before Cutover or waits for Phase D as the backlog currently sequences it | Before Cutover. Phase D as written would let real readers lose a live feature for four weeks after cutover; steps 1 to 4 above cost nothing to land early and have no dependency on Cutover itself | Dan, since it is a resequencing of `docs/plans/backlog.md`'s own phase table, not an architecture call |
| 4 | Rewrite backlog rows D-1/D-2/D-3 to cite the real files (`dialecta-opinion-map.jsx`, singular) and the real table (`opinion_map_positions`), and split D-3 into "the port" (this plan) versus "Stage D through F" (unbuilt everywhere, a separate, larger effort) | Yes, in the same change that resequences them | `convener`, since `docs/plans/backlog.md` is outside this seat's folder |
| 5 | Step 7 (read back a committed placement across reloads): in scope for this port, or explicitly deferred as a first improvement over live | Deferred, since it goes beyond live's own behavior rather than matching it; shipping parity first keeps the port's acceptance criteria honest | Dan, low stakes either way |
| 6 | Whether Stage D through F (the delta calculation, the reveal, the public choice, Reviser detection) get their own plan now or stay backlogged | Their own plan, later, once the port above ships and the identity re-key (`profiles.id` everywhere) is ruled on, since Reviser detection needs a stable person key to count "across at least 2 different articles" (`docs/Dialecta_Delta_Mechanic_Spec.md:175`) | Dan, on `decider`'s recommendation once asked |

## Sources

- `council/designer/research/2026-09-21-live-vs-localhost/REPORT.md:128` to `149`, the finding this
  plan answers.
- `docs/Dialecta_Delta_Mechanic_Spec.md`, v1.0, April 2026, in full.
- `_theme/post.hbs`, `_theme/assets/css/style.css`; `_recovered/api/opinion-map/place.js`,
  `_recovered/api/article/[id].js`; `_recovered-next/lib/theme/dialecta-opinion-map-placement.jsx`,
  `dialecta-article-classification.jsx`, `post-page-mount.jsx`.
- `_recovered/supabase/migrations/001_v1_1_schema.sql`, `024_opinion_map_positions_multi.sql`,
  `022_opinion_map_overrides.sql`.
- `supabase/migrations/20260921004459_comment_write_identity.sql`,
  `20260921053807_articles_author_write_policy.sql`.
- Live Supabase project `mguulnibvzusfvyuowwh`, read via the Supabase MCP, 2026-09-21: table and
  column listings, row counts on `opinion_map_positions`/`comments`/`articles`, `pg_policies`,
  `pg_class.relacl`, `has_column_privilege`, `pg_get_functiondef` on `current_ghost_member_id`,
  `get_own_profile_for_comment`, `current_profile_id`.
- `docs/plans/build-plan.md`, `docs/plans/backlog.md`; `apps/web/CLAUDE.md`; `supabase/CLAUDE.md`;
  root `CLAUDE.md`; `team/architect/architecture/2026-09-21-rebuild-map.md`;
  `council/log/2026-09-21-identity-forming-and-the-runner.md`.
- Live site, `https://www.dialecta.org/on-the-far-shore-of-fear/`, viewed read-only 2026-09-21 to
  confirm the spine and tier row against the code.
