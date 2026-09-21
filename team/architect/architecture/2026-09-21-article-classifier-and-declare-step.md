# Article classifier and the declare step

*The architect seat's plan for Dan's decisions on
`council/log/2026-09-21-opinion-maps-and-the-declaration.md`: item 1 (the classifier gets a home
with a named deploy target), item 4 (the author selects and builds out the options), and items 2,
5, 7, 8, 9 and 10. A plan, not code; `builder` and `migrator` implement. Every claim carries a file
and line, or a query run read-only against project `mguulnibvzusfvyuowwh` on 2026-09-21, confirmed
as Dialecta by its own table list (`articles`, `comments`, `profiles`).*

## The deploy target

**A route handler at `apps/web/src/app/api/article/classify/route.ts`, on the `apps/web` Vercel
project that backlog P0-3 stands up.** The skill text and the validator move into
`packages/core`; the Anthropic call sits in `apps/web/src/lib/classify-article.ts`, beside the
comment classifier it copies.

That is the default in the brief, and the evidence supports it rather than only permitting it.

1. **The pattern already runs.** `apps/web/src/lib/classify.ts` holds the Anthropic call for
   comments and nothing else; `apps/web/src/app/api/comment/route.ts:122` gates on
   `getClaims()`, `:153` rate limits before the priced call fires, `:177` classifies, `:197`
   resolves the tier through core. The article path needs all four of those and differs only in
   the prompt and the model. A second classifier on the same pattern is one file each.
2. **The caller is already here.** `apps/web/src/components/editor/publish-client.ts:81`,
   `requestArticleReading()`, returns `null` and its own header comment names what it waits on:
   a route "session gated and rate limited the way api/comment/route.ts is, and a decision on the
   model and the spend cap". The seam is drawn; this fills it.
3. **The columns are already written from here.** `apps/web/src/app/api/article/route.ts:272-286`
   writes `declaration`, and `apps/web/src/components/opinion-map/data.ts` reads `declaration`
   and `ai_analysis`. Putting the classifier anywhere else puts a second writer on two columns one
   app already owns, which is the drift this seat exists to catch.
4. **P0-3 already says it.** `docs/plans/backlog.md:37`: "Vercel: new project on `apps/web` (root
   dir), env vars from `.env.example`, preview per PR. Leave `dialecta.vercel.app` (legacy api)
   untouched." The classifier adds no deploy work beyond that row.

**Why a route handler and not a server action.** Two reasons, both measured. A server action has
no route segment of its own, so it inherits the calling page's `maxDuration`; setting the writer
page to 240 seconds to accommodate one call would give every other request on `/write` the same
ceiling. Vercel's own configuration for the App Router is a `maxDuration` export in the route file
(https://vercel.com/docs/functions/configuring-functions/duration). The second reason is streaming:
`_recovered/api/article/classify-stream.js` exists because the call takes minutes, and the skill's
v2.4 field reorder was made for it (`_recovered/skills/opinion-mapper/SKILL.md:231`). A route
handler can stream Server Sent Events later without moving; an action cannot.

**Why not a Supabase Edge Function.** Deno, a second runtime, a second home for
`ANTHROPIC_API_KEY`, and no way to import `@dialecta/core`, so the skill text and the validator
would be copied. A copied prompt is the exact failure the source-of-truth rule forbids.

**Why not the repo's own `api/` tree.** Root `CLAUDE.md:52` freezes it "until apps/web replaces
them", and production serves from a different repository at commit `53364fa` (root `CLAUDE.md:15`).
Adding to it grows the thing being retired.

**Why not `dialecta-next`.** It exists as a fourth Vercel project (`list_projects`, read
2026-09-21) and has not been deployed since May 2026; its source is
`_recovered-next/`, which is quarantine.

## The promotion list

`docs/RECOVERED.md:12` sets the rule: "Read them. Cite them. Promote nothing blind." Nothing below
is copied. Each file is read, adapted to the new boundaries, and reviewed.

| From quarantine | To | What changes, and why |
| --- | --- | --- |
| `_recovered/skills/opinion-mapper/SKILL.md` (290 lines, v2.4.0) | `packages/core/src/opinion-mapper.ts`, as an exported template literal with `OPINION_MAPPER_VERSION` beside it | The `build-skill.mjs` step disappears. Today the skill ships twice: `_recovered/scripts/build-skill.mjs` generates `_recovered/api/_skills/opinion-mapper.js` (which `classify.js:62` imports), and `_recovered/vercel.json` separately ships `skills/**` with `includeFiles`. One of those two is dead weight. A TypeScript module is the bundle, so neither is needed |
| `_recovered/api/article/classify.js:79-211`, the validator | `packages/core/src/opinion-mapper.ts`, `validateArticleAnalysis()` | Pure, so it belongs in core by that package's own rule, and becomes unit testable in vitest for the first time. Today nothing tests it |
| `_recovered/api/article/classify.js:213-244`, `buildUserMessage` | `packages/core`, beside the comment path's own `buildUserMessage` | Same split the comment path already makes (`apps/web/src/lib/classify.ts:2-8`): core builds the prompt, `apps/web` makes the call |
| `_recovered/api/article/classify.js:246-391`, the handler | `apps/web/src/lib/classify-article.ts` plus `apps/web/src/app/api/article/classify/route.ts` | Identity from `getClaims()`, a rate limit before the priced call, `strings.ts` for anything a person reads. The recovered handler has no auth of any kind |
| `_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx` (474 lines) | `apps/web/src/components/editor/map-picker.tsx` | Inline style tokens (`:35-55`) become `tokens.css` classes per `apps/web/CLAUDE.md:11`. The "Build my own" exit (`:334-336`) and the two-pick cap (`:32`) survive unchanged |
| `_recovered-next/lib/theme/dialecta-editor.jsx:1897-1947` (`MapEditor`), `:1560-1843` (`TernaryFields`, `CartesianFields`, `BinaryFields`), `:2024-2109` (`OpinionMapsInput`) | `apps/web/src/components/editor/map-editor.tsx` | The auto-seed path (`:2038-2050`) is dropped, and the topic cap is corrected. See "The declare step" |
| `_recovered-next/lib/theme/dialecta-editor.jsx:1845-1895` (`MapPreview`) | Folded into the map editor, drawing through `apps/web/src/components/opinion-map/engine.tsx` | `MapPreview` renders its own `TernaryMap`/`CartesianMap`/`BinaryMap`; `engine.tsx` is the component the reader gets. One figure, two callers |
| `_recovered/api/article/admin-resetup-maps.js` | Not promoted as a route. Its job becomes a case inside the atomic publish function | Its auth is `member_uuid` from the request body checked against `profiles.ghost_member_id` (`:62-73`), the exact forgeable shape `apps/web/src/app/api/comment/route.ts:9-19` was rebuilt to close. And its write (`:99-106`) is the mechanism behind the two readings |
| `_recovered/scripts/smoke-classify.mjs` | `scripts/smoke-classify.mjs` | `API_URL` (`:14`) becomes a `--base` flag defaulting to `http://localhost:3000`, so the run does not require a production deploy. `ARTICLE_DIR` (`:15`) points into the repo |
| The calibration set: `On_the_Far_Shore_of_Fear.txt`, `The_Conversation_Is_Doing_Something_to_You.txt`, `We_Become_What_We_Inhabit.txt`, `dialecta-article-01-machine (1).txt`, `dialecta-article-02-divided (1).txt` | `packages/core/test/fixtures/calibration/`, with the three declarations from `smoke-classify.mjs:17-57` as a JSON manifest | All five are present on this machine at `C:\Users\dan\OneDrive\Websites\Dialecta\Write Layer\Articles\`, checked 2026-09-21, and none is in the repository. `docs/RECOVERED.md:37` is explicit about what that means: leaving them there is "one laptop failure away" from losing the only thing that can test a prompt change. Committing them is Dan's call, since they are his unpublished essays |

Not promoted, and named so nobody hunts for them: `classify-stream.js` (the SSE variant, a
betterment after the plain route is measured), `classify-order.js`, `aesthetic-suggest.js`,
`repolish.js`, `suggest-topics.js`, `submit.js`, `publish.js`. The last two are replaced by
`apps/web/src/app/api/article/route.ts`, which says so in its own header (`:4-10`).

One correction to root `CLAUDE.md:91`, which still lists `Write Layer/Articles/*.txt` among the
cloud-only files "still to check". All five are on disk. That is the fourth file on that list to
turn up present, after the three this seat found on 2026-09-21.

## The promotion path

`docs/RECOVERED.md:17`: a file leaves quarantine "only by being read, adapted, and reviewed".
Concretely, per file: `builder` writes the adapted file in `apps/` or `packages/`, citing the
quarantine path and line range it came from in the file's own header, the way
`apps/web/src/components/opinion-map/data.ts:1-19` already does; `reviewer` judges the diff;
the quarantine file is never edited and never moved. The convener commits.

The one place this needs a fidelity check rather than a review is the validator. A port that
silently drops a rule is the failure `docs/RECOVERED.md:41` records against the front-end source
and that this seat's own charter lists as a founding case. The check: `validateArticleAnalysis()`
in core reproduces every issue string the recovered `validateAnalysis` produces, proven by a
vitest table that feeds it the seven live map shapes read in this plan plus one deliberate
violation per rule.

## Runtime and limits

| Setting | Value | Basis |
| --- | --- | --- |
| Route | `apps/web/src/app/api/article/classify/route.ts`, `POST` | The comment route's own shape |
| `maxDuration` | 240 | `_recovered/vercel.json` sets exactly 240 on both `api/article/classify.js` and `api/article/classify-stream.js` today. Production has therefore already run above the 60 second default on this account, so the ceiling is reachable. The team plan itself could not be read from this seat: `get_team` on `team_mflrdhbcpv10z1RtMO6QZSaU` returns 403 for this token |
| Model | `claude-opus-4-7`, `max_tokens: 8192`, `thinking: adaptive`, `effort: high` | `_recovered/api/article/classify.js:279-284`. Carried over verbatim and named as a constant, the way `apps/web/src/lib/classify.ts:17` carries the comment model. Changing it is a separate decision with a smoke run behind it |
| Prompt caching | The skill in `system` with `cache_control: ephemeral` | `classify.js:285-291`. The skill is about 27,000 characters; the cache is what makes a five article smoke run affordable |
| Article cap | 25,000 characters | `classify.js:74` |
| Retries | 1, on a validator or parse failure, with the issues as the retry hint | `classify.js:77`, `:224-229` |
| Rate limit | Per profile, per window, checked before the call fires | `apps/web/src/app/api/comment/route.ts:51-52` sets the precedent at 5 per 10 minutes. The article call is priced far higher: `publish-client.ts:71-79` carries treasurer's estimate of $300 to $1,500 per ten thousand calls. Recommend 3 per hour per profile, counted on `articles` rows plus a classify log |
| Auth | `getClaims()`, then `get_own_profile_for_comment()` | The recovered handler has no auth at all (`classify.js:246-270` validates only the body). One claimed profile exists today: 15 profiles, 1 with `user_id` set, measured 2026-09-21 |

## The author's wait

**Synchronous.** The route holds the request open for the length of the call.

The spec puts the writer in the wait: the rebuild map's own Write paths table
(`team/architect/architecture/2026-09-21-rebuild-map.md:66-67`) records that classification stays
synchronous "because the spec says the writer waits and sees the card before posting". The editor
already has the wait built: `apps/web/src/components/editor/stages-publish.tsx:52-78`, the
Reflecting stage, runs a brass ritual bar for a fixed
`ARTICLE_REFLECTION_DURATION_MS` of 55 seconds (`writer-state.ts:151`), whose own comment says it
was "rebudgeted 2026-05-02 for an Opus call that took 30 to 60 seconds".

The measured latency is wider than that budget. `_recovered/skills/opinion-mapper/TUNING_QUEUE.md:114`:
"Adaptive thinking on Opus 4.7 takes 30-180s for a 7-15K-char article." So three things follow, and
they are the whole of the sync design:

1. The ritual bar's 55 seconds is a floor, never a ceiling. `stages-publish.tsx:56-65` already
   holds the shape: the bar runs its full pause and `ready` flips when the reading lands. What it
   lacks is the other branch, a reading that has not landed when the bar fills. That branch shows
   the wait continuing rather than advancing, and it is the one new piece of UX this needs.
2. The browser fetch must outlive the call. `requestArticleReading()` returns instantly today, so
   nothing has ever set a timeout on this path.
3. A failure costs the author a retry and stores nothing. That is already the rule for comments
   (`apps/web/src/app/api/comment/route.ts:176-184` classifies before any write) and the rebuild
   map states it as the reason (`:69`).

Async is refused for now, with the condition that would change it named: a job table, a poller and
a resume path for an author who closes the tab is real machinery for a flow that has run five times
in the platform's life (5 rows in `articles`). Build it when a measured p95 latency exceeds the
route's `maxDuration`, which the smoke run below will report. Streaming is the better next step and
it is not async: `classify-stream.js` turns a three minute blank wait into a progressive render,
reusing the same route, the same prompt and the same validator.

## Provenance

The brief says `classifications` already carries `model` and `prompt_version`. **It does not.**
Read live 2026-09-21, `classifications` has eighteen columns and neither is among them:
`id, comment_id, claim_text, specificity_score, emotion, tribal_markers, tribal_example,
article_engagement, opposing_view_engaged, borderline_flag, borderline_other_tier,
ai_suggested_tier, self_declared_tier, final_tier, commenter_message, classified_at, resolved_at,
strength`. No column anywhere in `public` matches `%model%`, `%prompt%` or `%version%` except
`profiles.pact_version` and `self_descriptions.prompt_id`.

This is an open item, not a new finding: `exchange/open/2026-09-21-architect-07-handoff-classifier-provenance-and-hygiene.md:16-21`
filed it this morning, `packages/core/CLAUDE.md:10` requires it, `packages/core/src/classification.ts:16`
already exports `CLASSIFIER_PROMPT_VERSION = '2026-09-19.1'`, and the baseline migration records
the absence at line 559. Two classifiers are about to run side by side and nothing will tell their
rows apart.

What this plan adds to that record: **the article path needs the same two fields on `articles`, and
a third.** The article's provenance belongs beside the analysis it describes.

- `articles.ai_model text`, `articles.ai_prompt_version text`, both nullable so the five legacy
  rows read as legacy rather than as a backfilled guess (architect-07's own trap, `:55`).
- `ai_prompt_version` carries the skill's own version string, `OPINION_MAPPER_VERSION`, sourced
  from the frontmatter at `SKILL.md:3` (`2.4.0`). The skill already versions itself and
  `TUNING_QUEUE.md:8` treats a version bump as the unit of change; this makes the version reach the
  row.
- A version bump is the gate on every engine change in section three. `TUNING_QUEUE.md:145-147`:
  "One skill version per coherent change set." The changes below are one set, so they ship as
  v2.5.0.

## Production today, and what cutover changes

Today: `https://www.dialecta.org` serves the Ghost theme, which mounts the recovered React
components; `dialecta.vercel.app` serves the API from repository `dpenn1000/dialecta-api` at commit
`53364fa`, a May 2026 build (root `CLAUDE.md:15`). The `dialecta` Vercel project reads
`framework: null` and its most recent deployment is in state `ERROR` with `target: null`, read
2026-09-21. `vercel.json` at this repo's root sets `git.deploymentEnabled: false`, which is what
stops this repo's pushes from firing failing production builds.

So the article classifier runs today at `https://dialecta.vercel.app/api/article/classify`, from a
commit GitHub answers 422 for (`docs/RECOVERED.md:52`), with no auth and no rate limit, against a
skill file that exists in this repository only as evidence. Any prompt change made here reaches no
author. That is the fact the Council's chair named as reordering everything
(`council/log/2026-09-21-opinion-maps-and-the-declaration.md:305-312`).

Cutover changes three things and leaves one. The route moves to `apps/web` behind a session gate
and a rate limit. The skill becomes a versioned module in `packages/core` that CI compiles and
tests. The writer at `/write` calls it instead of a seam that returns null. What stays: the legacy
deployment keeps serving until C0, so nothing in this plan takes the live API down, and
`vercel.json`'s `deploymentEnabled` key has to be removed or scoped before the new project's
previews build, which root `CLAUDE.md:75` already assigns to P0-3.

## The declare step

Dan, on item 4: "The Author should be encouraged to select opinions, and build out the options
before it is published. We had an AI suggestion tool in the old model, with the Author having
control over the final axes."

The recovered editor had most of this. `dialecta-opinion-map-picker.jsx:303-474` offers the
engine's 2 to 4 candidates with an explicit Save and a "Build my own" exit at `:334`;
`dialecta-editor.jsx:1897` (`MapEditor`) lets the author change the map type, edit every pole, axis
and topic through `TernaryFields`, `CartesianFields` and `BinaryFields`, remove a map at `:1924`,
and add one up to two at `:1990`. What it never had is control of the author's own position:
`MapPreview` at `:1845` only draws `map.author_position`, which the picker copied through from the
engine untouched (`dialecta-opinion-map-picker.jsx:67`, `:83`, `:92`). Measured: all seven live
`author_position` values equal the engine's proposed coordinate, which is philosopher's finding
(`council/philosopher/positions/2026-09-21-opinion-maps-and-the-declaration.md:81-84`) and the
reason Dan's item 4 answer is conditional.

The step, in order, at `S.DECLARE` in `apps/web/src/components/editor/stages-draft.tsx:281`:

1. **Breath one.** Core Claim and Scope Boundary, with counters (below). Unchanged otherwise.
2. **Breath two.** Strongest Objection, counter, tier picker. Unchanged otherwise.
3. **The reading runs.** `stages-publish.tsx:52`, the Reflecting stage, now waiting on a real call.
4. **The tensions, then the candidates.** The engine's `tensions` array renders above the picker,
   as `OpinionMapsInput` already arranges it (`dialecta-editor.jsx:2081-2083`). Each candidate card
   carries the tensions it covers, which is the new engine field in section three.
5. **The author selects, or builds their own.** One or two candidates, or a blank map.
6. **The author edits.** Type, topic, every pole and axis.
7. **The author sets their own mark on each map kept.** New. The preview becomes the placement
   surface.
8. **Stage 2.5.** `stages-publish.tsx:136`, unchanged.
9. **Publish**, through one function (below).

`apps/web/src/components/editor/stages-draft.tsx:341-344` is the placeholder this replaces: a label
and a line of copy saying maps are deferred. `writer-state.ts:53-60` already carries
`opinion_maps` through untouched so the input can land "without a state migration", which is that
file's own stated intent.

### The topic cap contradiction

**The recovered editor caps a map topic at 28 characters. The skill and the validator allow 60.
Six of the seven live topics are longer than 28.**

- `dialecta-editor.jsx:1337-1340`: `AXIS_LIMITS = { topic: { min: 4, max: 28 }, pole: { min: 3, max: 20 } }`.
  That value is the `maxLength` attribute on every topic input (`:1707`, `:1793`, `:1614`) and the
  gate in `isValidMapEntry` (`:1372`, `:1379`, `:1385`).
- `SKILL.md:211`: "`topic`: 15 to 60 characters." `classify.js:119-127` enforces the same range.
- Measured live: "What actually ends poverty?" is 27; the other six run 29, 31, 32, 36, 36 and 44.

So an author porting `MapEditor` as written could not retype the engine's own topic on six of the
seven maps the platform has published, and `isValidMapEntry` would call them invalid. The fix is
one definition with three readers: `packages/core/src/opinion-mapper.ts` exports
`MAP_LIMITS = { topic: { min: 15, max: 60 }, pole: { min: 3, max: 20 } }`, and the validator, the
editor's counters and the publish function's own validation all read it. The pole range already
agrees across both files and needs nothing.

### Encouragement mechanisms

Dan's word is "encouraged", so each of these has to be completable by the author holding it.
Designer's rule, from the same debate: live's copy "promises an action the surface cannot complete
for the reader holding it, the same failure my D-2 already logged against the composer's disabled
button" (`council/designer/positions/2026-09-21-opinion-maps-and-the-declaration.md:44-47`). A
counter that turns red with no way to see what is over budget is that same failure pointed at the
author.

| Mechanism | What it is | Cost |
| --- | --- | --- |
| Tensions above the candidates | The engine's own most article-specific material, already rendered by `TensionsDisplay` (`dialecta-editor.jsx:2081`). With each candidate tagged by the tensions it covers, an author can see which tensions no candidate touches. That is the encouragement: coverage shown, never a nag | A prompt field and a card tag |
| No default selection | `dialecta-opinion-map-picker.jsx:310` starts with nothing selected and `:423` disables Save at zero, which is right. But `OpinionMapsInput`'s legacy auto-seed (`dialecta-editor.jsx:2038-2050`) seeds maps with no click when fewer than two candidates arrive. Drop it: with the skill's own 2 to 4 minimum it is nearly unreachable, and where it fires it is "accept the first suggestion" happening silently | Delete a `useEffect` |
| The author's mark, required per map kept | The mechanism that turns item 5 from a hope into a gate, and the thing that makes the caption honest | One tap per map |
| Build my own, kept in view | `:334-336` already returns an empty array and drops the author into a blank ternary through `NoMapsState` (`:1949`) | Nothing |
| The figure the reader will see | Draw the preview through `components/opinion-map/engine.tsx` rather than a second copy of the map components | A component swap |
| A second framing offered, never forced | `AddMapButton` (`:1990-2019`) already carries its own guidance copy at `:1994-1996` | Nothing |

### The author's mark, and the tilt it creates

Making the mark real makes the anchoring risk real, because today no author has claimed a dot.
Philosopher's recommendation 4 pairs the two: the author sets the mark, and readers see it "after
placing or on a tap"
(`council/philosopher/positions/2026-09-21-opinion-maps-and-the-declaration.md:153`). The seat's
basis: `SKILL.md:34` says the author's coordinate is "visible only to readers who choose to look at
it" while the build draws it for everyone (`engine.tsx:319`, `:412-417`, `:517`); one randomized
prior up-vote raised the next up-vote's likelihood 32 percent and final ratings 25 percent across
about 100,000 comments (Muchnik, Aral and Taylor 2013), with the seat naming its own limit, that a
vote on another's comment is not a self placement; and the Delta spec's rule that the platform
"must not create any social pressure toward visible change"
(`docs/Dialecta_Delta_Mechanic_Spec.md:83`). Recommendation 10 asks for a flag that randomizes
whether Reflect is offered and a field logging whether the author's mark was visible at placement,
before Stages D to F make a delta out of it (`:159`).

Reflect already hides it (`apps/web/src/components/article-declaration/declaration.tsx:198-202`);
Declare shows it on the figure the reader places on (`:164`). Two of those three are already true,
so what is open is Declare's reveal, and it is philosopher's to press, not this seat's to settle.
This plan builds the author's mark and carries `author_position_source` so that whichever reveal
rule Dan picks has a field to switch on.

### The word counters

35, 30 and 40 words on Core Claim, Scope Boundary and Strongest Objection, at compose time.

- Where: `stages-draft.tsx:314-337`, beside each `FocusableTextarea`. `RespondStage`
  (`stages-publish.tsx:228-239`) already renders a word count in exactly this position, so the
  component exists.
- Method: whitespace separated tokens, the same method the Council measured with
  (`council/log/2026-09-21-opinion-maps-and-the-declaration.md:39`). The counter and the
  publish function must count the same way or they will disagree at the boundary.
- Enforcement: the counter shows, the Continue gate holds. `MIN_DECLARATION_CHARS` at
  `writer-state.ts:128` is the existing floor; the budget is a ceiling beside it.
- **Legacy rows are not retro-truncated.** Measured across the five published articles, in words:
  Knowledge Without Borders 5/14/5, The Moment You Stop Waiting 30/48/57, On Doubt and Devotion
  40/51/94, the solar piece 46/62/117, On the Far Shore of Fear 77/74/88. Only the first fits all
  three budgets. Twelve of the fifteen fields are over. The budget binds new work; a revision of an
  existing article shows the counter over budget and says so without blocking, or four of five
  published articles become unrevisable.
- **The dash rule belongs on the same surface.** Four em dashes sit in author entered declaration
  data today, not one: Far Shore's Strongest Objection, which the Council named, and all three
  fields of The Moment You Stop Waiting, which it did not. `SKILL.md:225` already forbids them in
  engine output. A compose-time check costs the same as the counter and catches the author side,
  which is where all four came from.

## The data shape

Each entry of `declaration.opinion_maps`, as stored today
(`dialecta-editor.jsx:1328-1335`, confirmed against all seven live entries):

```
ternary:   { type, topic, poles: [a,b,c],                 author_position: {a,b,c} }
cartesian: { type, axes: [{topic,axis_a,axis_b}] x 2,     author_position: {x,y}   }
binary:    { type, topic, axis_a, axis_b,                 author_position: {x}     }
```

Three fields are added. The first is required by Dan's item 4 and 5; the other two are recommended
and each carries its reason.

| Field | Values | Why |
| --- | --- | --- |
| `author_position_source` | `'author'` or `'engine'` | Required. All seven live entries carry `author_position` and none carries this field, so **a reader treats absent as `'engine'`** and no data migration is needed. That one rule is what makes Dan's conditional item 4 implementable today: the caption reads "Where the author lands" (`strings.ts:2827`) only on `'author'`, and the engine's estimate otherwise |
| `covers_tensions` | array of strings, each matching a `name` in the same response's `tensions` | Recommended. The picker shows coverage from it, and a validator can check it, which is the auditable half of "rank by fit to the tensions". Without it, ranking by fit is a claim nothing can audit |
| `source` | `'engine_candidate'` or `'author_built'` | Recommended. Distinguishes a map the author edited from one they wrote. `opinion_map_overrides` exists live for exactly this tuning question and holds 0 rows; this is the cheaper version of the same signal |

`author_position` itself does not change shape. The validation of it does: the publish function
checks that the shape matches the `type` and that a ternary's three components sum to within a
tolerance of 1, which is what `_recovered/api/opinion-map/place.js:43-70` already does for a
reader's placement and which nothing does for an author's.

## The publish contract

One function, `public.save_article(...)`, `security definer`, `search_path = ''`, matching the form
`supabase/migrations/20260921152637_opinion_map_positions_identity_expand.sql` shipped for
`place_opinion_map_position()` (confirmed live: five `security definer` functions exist, including
that one and `current_profile_id()`). `apps/web/src/app/api/article/route.ts` becomes its caller
and keeps its own validation as the first gate.

The contract, in order:

1. Resolve the author from `public.current_profile_id()`. Null returns no rows, the shape
   `get_own_profile_for_comment()` already uses. Never an argument.
2. Insert derives the slug server side; update keeps the slug and the first `published_at`, and
   matches on the author.
3. **`ai_suggested_tier` and `ai_analysis` are written in the same statement, always.** This is the
   two readings defect expressed as a constraint on the function rather than a rule someone has to
   remember.
4. Validate every `opinion_maps` entry against `MAP_LIMITS`: type in the allowed set, topic length
   and question mark, pole lengths, `author_position` shape matched to type, `author_position_source`
   in the two allowed values. One transaction, so a bad map rejects the whole publish.
5. On a substantive change to a published row (any of `declaration`, `ai_analysis`, `body_json`),
   write the prior `declaration`, `ai_analysis` and `ai_suggested_tier` to a version row, and
   require a freshly set `stage_2_5_choice`. That is Dan's item 10, as a precondition rather than a
   convention.
6. Return the id and slug. The route handler calls `revalidatePath` for the article and the front
   page afterwards, per the rebuild map's caching rule (`:87`).

And one guard the function cannot enforce on rows written any other way, so it belongs on the
table:

```sql
alter table public.articles
  add constraint articles_one_engine_reading
  check (
    ai_analysis->>'ai_suggested_tier' is null
    or ai_suggested_tier::text = ai_analysis->>'ai_suggested_tier'
  ) not valid;
```

`not valid` so Far Shore's existing row survives until it is settled; `validate constraint` once it
is. This constraint would have caught the defect on the day it was made.

## The engine's changes

All six are the Council's, listed at
`council/log/2026-09-21-opinion-maps-and-the-declaration.md:400-414`. The file column is the new
home, since the quarantine file is never edited.

| # | Change | File after promotion | What a validator can decide |
| --- | --- | --- | --- |
| 1 | Delete the calibration example list | `packages/core/src/opinion-mapper.ts`, the block ported from `SKILL.md:88-103` | Nothing, and nothing is needed. Three of twenty live poles ("Free for all", "Pay your way", "Trust the data") are verbatim from a list whose own text at `:90` says "Do NOT copy any of these verbatim into your output". The list teaches generic. Deleting it also resolves the skill's own contradiction: `:287` already claims the file holds no "Specific pole-label examples" |
| 2 | Honesty check 10, each pole answers the stated question in the first person, plus a `pole_statements` output field | The honesty check list ported from `SKILL.md:185-205`; the output schema from `:227-279`; `validateArticleAnalysis()` | Presence and form only: one statement per pole, parsing as "[question] I think [pole]". A regex cannot judge whether the answer answers. Circulation conceded this and it should not be oversold (`council log:404-405`) |
| 3 | Rank candidates by fit to the article's tensions; tag each with the tensions it covers | The shape preference and candidate rules ported from `SKILL.md:115-125`, `:172-183` | That `covers_tensions` is non-empty and every entry matches a `name` in the same response's `tensions` array. That is a real check, and it is why the field exists |
| 4 | The sensitive-inference sentence in `rationale` | The output schema block, `SKILL.md:227-279` | Nothing. Legal's case rests on the sentence reaching the author before Save, which is a render, not a parse. "On Doubt and Devotion" is the live case, a ternary with a "Leave the faith" pole, and it shows the exposure outlives the binary (`council log:200`) |
| 5 | Remove binary from the shape list and the candidate rules | `SKILL.md:156-162`, `:182`; `validateArticleAnalysis()` | Yes: `type === 'binary'` becomes an issue rather than a branch. The existing branch is `classify.js:193-204` |
| 6 | Version the re-setup write | Not a skill change. It is contract items 3 and 5 above | The `articles_one_engine_reading` constraint |

One thing to fix while in the file, found in passing and not on the Council's list: `SKILL.md:287`
says the skill deliberately holds no pole-label examples, and `:88-103` is a list of ten of them.
Change 1 removes the list and makes the claim at `:287` true. `TUNING_QUEUE.md:63-77` separately
proposes a "third-stance check" before committing to binary, with four "real third positions" as
inspiration. Change 5 makes the check moot and the four examples are a list of exactly the kind
change 1 deletes; drop both from the v2.5 pass rather than carrying them.

## The smoke run

A fresh `smoke-classify.mjs` run against all five calibration articles, at the new route, on the
new prompt, before any of it reaches an author. `TUNING_QUEUE.md:149-152` sets the practice ("Test
before deploying") and the duration: 4 to 6 minutes for the three short articles, about 10 for the
full five. Ten things it has to prove:

1. **Zero verbatim poles from the deleted list.** Checked against the exact ten strings at
   `SKILL.md:92-101`. Today three of twenty live poles fail this.
2. **Every candidate carries `pole_statements`**, one per pole, each parsing as
   "[question] I think [pole]". A human reads whether the answers answer; the run proves they exist
   and parse.
3. **Every `topic` is 15 to 60 characters and ends in `?`.** The live set runs 27 to 44, so the
   range is exercised rather than assumed.
4. **Zero binary candidates**, across all five.
5. **Every candidate carries a non-empty `covers_tensions`** whose entries all appear in that
   response's own `tensions` array. A candidate covering no tension is the ranking rule failing
   silently.
6. **Confidences descend and are spread**, not bunched near 1.0. The skill's own honesty check 9
   (`SKILL.md:205`); the validator flags inversions at `classify.js:149-155`.
7. **The religion case names its category.** On "On the Far Shore of Fear", whose live map 1 is the
   one binary and whose ternary sits on meaning, and on any candidate touching faith, the
   `rationale` names the sensitive-inference category.
8. **The known failure does not recur.** `TUNING_QUEUE.md:50-68` records the 2026-05-03 education
   binary, "Free for all / Pay your way", where a means-tested middle was available. The expected
   shapes for all five are tabled at `:128-137`; each must be met.
9. **Latency recorded per article.** If any single call exceeds the route's `maxDuration` of 240,
   the synchronous decision above is refuted and the run says so rather than the architecture
   assuming it.
10. **Zero em dashes and zero en dashes** anywhere in any response. `SKILL.md:225` already forbids
    them, and four sit in live author data today, so this is the one rule with a known live miss on
    the other side of the same surface.

The run cannot happen until the calibration articles are in the repository. That is the promotion
list's last row and it is the step that turns a one machine check into a repeatable one.

## Versioning

Measured live, 2026-09-21, all five articles:

| Article | `declared_tier` | `ai_suggested_tier` | `final_tier` | Tier inside `ai_analysis` | Row updated |
| --- | --- | --- | --- | --- | --- |
| On the Far Shore of Fear | spark | **forum** | forum | **spark** | 2026-05-03 |
| On Doubt and Devotion | forum | forum | forum | forum | 2026-05-03 |
| The solar piece | forum | forum | forum | forum | 2026-05-03 |
| The Moment You Stop Waiting | forum | forum | forum | forum | 2026-05-04 |
| Knowledge Without Borders | spark | spark | spark | spark | 2026-05-04 |

One article, two readings, and the mechanism is exact: `admin-resetup-maps.js:99-106` updates
`declaration`, `ai_analysis` and `updated_at`, and never `ai_suggested_tier`. The May 3 re-run
produced a Spark reading that landed in the JSON alone; the column kept April's Forum.

### Where the prior version goes

**Not `admin_audit_log`.** That table exists and looks like the obvious home, and it will not take
an article: `admin_audit_log_target_id_fkey` is a FOREIGN KEY to `profiles(id)`, read from
`pg_constraint` 2026-09-21, so an article id cannot go in `target_id`. Its own table comment scopes
it to "every admin permission change" and all 7 rows are permission actions. Forcing an article
version into `details` jsonb with no foreign key gives up the one thing a version history needs,
which is to be queryable by article.

A purpose-built table instead:

```
article_reading_versions
  id uuid primary key default gen_random_uuid()
  article_id uuid not null references public.articles(id) on delete cascade
  declaration jsonb not null
  ai_analysis jsonb not null
  ai_suggested_tier public.tier
  ai_model text
  ai_prompt_version text
  stage_2_5_choice text
  replaced_at timestamptz not null default now()
  replaced_by uuid references public.profiles(id)
```

Written only by `save_article()`, `security definer`. No client policy, matching the posture the
baseline takes on every service-only table (`opinion_map_overrides` is the nearest precedent and is
live with 0 rows). Recommend seeding it with the current state of all five articles in the same
migration, so the first re-run has a predecessor to point at.

### Far Shore

Dan has not answered item 11. Three paths, and each has a consequence worth stating before he does.

- **Settle on Forum**, the chair's recommendation. Overwrite `ai_analysis.ai_suggested_tier` to
  `forum`. `final_tier` is already forum, so nothing else moves. But the analysis prose was written
  for a Spark reading and advises moving "from spark toward forum" (philosopher, `:134-135`).
  Overwriting the tier word alone leaves prose arguing the other reading, which is the same defect
  in a smaller font.
- **Settle on Spark.** Overwrite the `ai_suggested_tier` column to `spark`, and then `final_tier`
  has to be recomputed: under the locked 40/35/15/10 weighting, ai spark at 40 percent plus a self
  declaration of spark at 15 percent resolves to spark. So this path changes what the page badge
  says and what every reader since April has seen, and it is two writes, not one.
- **Re-run it once the classifier exists**, under the versioned path, logging both prior readings.
  One Opus call. It produces a single reading whose tier and prose agree, it needs no human to pick
  between two machine readings, and it exercises the versioning path on its first real case, which
  is the case it was built for. **Recommended**, with the note that it depends on build step 5 and
  cannot be done today.

All three need Dan's answer to item 11 first, since all three change what a published page says.

### The binary and its one placement

Far Shore map 1 is the platform's only binary: `{ type: 'binary', topic: 'Where does meaning come
from?' (29 chars), author_position: { x: 0.82 } }`. It holds **exactly one reader placement**:
`map_index 1`, `stage post_read`, `map_type binary`, `coordinates { x: 0.2769 }`, recorded
2026-05-01. One row of the nine in `opinion_map_positions`.

The data already carries a precedent for what happens when a map changes under a placement.
**Knowledge Without Borders holds two rows at `map_index 0` with
`map_type = 'cartesian'` and `{x, y}` coordinates, recorded 2026-05-02 and 2026-05-03, against a
declaration whose map 0 is a ternary today.** The row was updated 2026-05-04. Those two placements
point at a map that no longer exists. Philosopher found the same thing from the other direction and
names it in recommendation 1 (`:150`); this is the row level confirmation.

So three of nine placements are already stale, and retiring the binary makes it four unless the
retirement carries a rule. The rule: **a placement is read against the declaration it was made
under, or it is not read at all.** Two ways there:

1. **Now, at zero schema cost:** `opinion_map_positions.map_type` is already stored on every row.
   A read-side predicate that excludes any row whose `map_type` differs from the current
   declaration's type at that `map_index` catches all three stale rows today and excludes none of
   the six good ones. Measured, not assumed. Nothing reads these rows yet
   (`team/architect/architecture/2026-09-21-delta-mechanic-port.md:72-83`), so this costs nothing
   and prevents the first aggregate from being wrong.
2. **When Stage D lands and an aggregate needs a stable denominator:** a `declaration_version`
   integer stamped at write time, incremented by `save_article()` on any change to
   `declaration.opinion_maps`. That is the real fix and it is premature now.

**Do not delete Far Shore's binary placement when the binary retires.** It is one real reader's
real answer at a real time, it is the platform's entire record of what a binary placement looked
like, and the whole corpus is nine rows. Keep it, let predicate 1 exclude it, and retire the map
by replacing the entry in `declaration.opinion_maps` through the versioned path so the prior
declaration, binary included, survives in `article_reading_versions`.

What replaces it is philosopher's call and the Council settled the direction: a cartesian carrying
a second tension, not nothing, since retiring the binary "costs a second map, not the only one"
(`council log:214`) and the skill already requires three to five tensions per article, which keeps a
second debate in hand.

## Build order

Steps 1 and 2 ship value with no dependency on anything else in this plan. Nothing after step 3
should start before the smoke run in step 5 passes.

| # | Step | Owner | Waits on | Acceptance test |
| --- | --- | --- | --- | --- |
| 1 | Word counters at 35, 30 and 40 beside the three declaration fields, plus a compose-time dash check | builder | nothing | The counter's token count equals this plan's SQL method on all five published articles (5/14/5, 30/48/57, 40/51/94, 46/62/117, 77/74/88); opening one of the four over-budget articles for revision shows the counter over budget and still permits Continue; typing an em dash raises the notice |
| 2 | Overlay reorder: Strongest Objection first | builder | nothing | `declaration.tsx` renders Strongest Objection before Core Claim and Scope Boundary; the engine's reading stays inside its `<details>` |
| 3 | `packages/core/src/opinion-mapper.ts`: the skill text, `OPINION_MAPPER_VERSION`, `MAP_LIMITS`, `buildArticleUserMessage()`, `validateArticleAnalysis()` | builder | nothing | `npm test` passes a vitest table that feeds the validator the seven live map shapes in this plan plus one deliberate violation per rule, and reproduces every issue string the recovered `validateAnalysis` produces; `MAP_LIMITS.topic.max` is 60 and appears in exactly one file |
| 4 | `apps/web/src/lib/classify-article.ts` and `src/app/api/article/classify/route.ts`, session gated, rate limited, `maxDuration = 240` | builder | 3 | A signed-out POST returns 401; a signed-in POST over the limit returns 429; a valid POST returns an analysis whose `candidate_maps` passes the step 3 validator; `publish-client.ts:81` no longer returns null |
| 5 | The five calibration articles and their declarations into the repo; `scripts/smoke-classify.mjs` with a `--base` flag | builder, and Dan approves committing the essays | 4 | `node scripts/smoke-classify.mjs --base http://localhost:3000` runs all five and prints candidates and per-article latency |
| 6 | The six engine changes, shipped as skill v2.5.0 | builder, philosopher reviews the pole output | 5 | The ten proofs in "The smoke run", every one recorded in the run's output |
| 7 | Migrations: `articles_one_engine_reading` (`not valid`), `article_reading_versions` seeded from the five current rows, `articles.ai_model` and `ai_prompt_version`, and architect-07's `classifications.prompt_version` and `model` riding along | migrator, Dan approves | nothing; runs beside 3 to 6 | On a branch, an update that changes `ai_analysis` without matching `ai_suggested_tier` is rejected; `article_reading_versions` holds five rows; the four new columns exist and legacy rows read null |
| 8 | `save_article()` with map validation and the versioned re-run precondition; `api/article/route.ts` becomes its caller | migrator, builder | 3, 7 | A declaration with a 44-character topic publishes; a 61-character one fails; a ternary `author_position` that does not sum to 1 fails; a re-publish of a published article without a freshly set `stage_2_5_choice` fails and writes no row |
| 9 | The picker and map editor in `apps/web/src/components/editor/` | builder | 4, 8 | Tensions render above the candidates; nothing is selected by default; Save is disabled at zero; Build my own reaches a blank ternary; every pole, axis and topic is editable; a map removes and a second adds, capped at two |
| 10 | The author's own mark on each map, and `author_position_source` end to end | builder | 9 | Publishing with an author-set mark stores `'author'`; publishing without one stores `'engine'`; the seven legacy entries, which carry neither, read as `'engine'`; the reader-side caption follows the field |
| 11 | Far Shore re-run under the versioned path | convener | 6, 7, 8, and Dan's item 11 | The article's `ai_suggested_tier` column equals `ai_analysis->>'ai_suggested_tier'`; `articles_one_engine_reading` validates clean across all five rows; one prior version row exists |
| 12 | Retire the binary: the shape leaves the engine (step 6), and Far Shore map 1 is replaced through the versioned path | builder, migrator | 6, 8, 11 | No live declaration carries `type: 'binary'`; the prior declaration including the binary is in `article_reading_versions`; the one binary placement row still exists and is excluded by the `map_type` predicate |

## Decisions

| # | Decision | Recommendation | Who decides |
| --- | --- | --- | --- |
| 1 | The deploy target for the article classifier | A route handler in `apps/web` on the P0-3 Vercel project, with the skill and validator in `packages/core`. Argued in full above | Dan, since item 1 named the target as his |
| 2 | Synchronous or asynchronous | Synchronous, at `maxDuration = 240`, with the ritual bar as the wait and a named threshold for changing it: a measured p95 above 240 seconds. Streaming is the next step after, and it is not async | This seat, as a standard; open to Dan's override |
| 3 | Commit the five calibration articles to the repository | Yes. They are Dan's unpublished essays and they are the only thing that can test a prompt change. `docs/RECOVERED.md:37` is the argument: on one machine is not recovered | Dan, since they are his writing |
| 4 | Where a prior reading is logged | `article_reading_versions`, a new table. `admin_audit_log.target_id` is a foreign key to `profiles(id)` and cannot hold an article id, measured 2026-09-21 | migrator, with Dan's approval on the migration |
| 5 | The topic cap: 28 or 60 | 60, from `MAP_LIMITS` in `packages/core`, read by the validator, the editor and the publish function. Six of seven live topics exceed 28 | This seat, as a standard |
| 6 | Whether the author's mark is required per map before publish | Yes, required. Requiring it makes item 5 a gate rather than a hope, and makes the caption honest | Dan, since it adds a step to his own publish flow |
| 7 | Whether Declare reveals the author's mark before a reader places | Philosopher's recommendation 4 says after placing or on a tap. This plan carries the field either way and does not settle it | Dan, on philosopher's recommendation |
| 8 | Far Shore's one reading | Re-run it under the versioned path once the classifier lands, rather than picking between two machine readings by hand | Dan, item 11, still open |
| 9 | Whether the one binary placement row survives the retirement | Yes, kept and excluded by the `map_type` predicate. Nine rows exist in total and this is the only binary among them | This seat, as a standard; trivially reversible |
| 10 | The rate limit on the article classifier | 3 per hour per profile, against the comment route's 5 per 10 minutes, because the call is Opus with adaptive thinking rather than Haiku | treasurer, on this seat's recommendation |

## What this plan adds to the record

Five things measured here that no seat had named, each with the query or file behind it.

1. **`classifications` carries neither `model` nor `prompt_version`.** The brief assumed it does.
   Eighteen columns read live; neither is there. This is architect-07's open item and it now has
   an article-side twin.
2. **The editor's topic cap is 28 and the engine's is 60**, and six of the seven live topics fall
   between. `dialecta-editor.jsx:1337` against `SKILL.md:211` and `classify.js:122`.
3. **`admin_audit_log` cannot hold an article version.** `target_id` is a foreign key to
   `profiles(id)`.
4. **Two of the nine placements are already orphaned**, cartesian rows against a ternary map on
   Knowledge Without Borders, from an un-versioned re-set between 2026-05-02 and 2026-05-04.
   Philosopher found this from the other side; this is the row level confirmation, and it makes the
   binary retirement's rule a repair rather than a precaution.
5. **Four em dashes sit in author entered declaration data, not one.** Far Shore's Strongest
   Objection, and all three fields of The Moment You Stop Waiting.

And one correction to a document: root `CLAUDE.md:91` still lists `Write Layer/Articles/*.txt`
among the cloud-only files to check. All five are on disk.

## Sources

- `council/log/2026-09-21-opinion-maps-and-the-declaration.md` in full, especially the Chair's
  synthesis (`:303-356`), the two build lists (`:395-441`) and Dan's decisions (`:443-476`).
- `council/philosopher/positions/2026-09-21-opinion-maps-and-the-declaration.md:79-98` (the
  author's mark), `:146-160` (the ten recommendations).
- `council/designer/positions/2026-09-21-opinion-maps-and-the-declaration.md:44-58`.
- `_recovered/api/article/classify.js`, `admin-resetup-maps.js`, `classify-stream.js`;
  `_recovered/vercel.json`; `_recovered/scripts/smoke-classify.mjs`, `build-skill.mjs`;
  `_recovered/skills/opinion-mapper/SKILL.md`, `TUNING_QUEUE.md`.
- `_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx`, `dialecta-editor.jsx`.
- `apps/web/src/lib/classify.ts`, `src/app/api/comment/route.ts`, `src/app/api/article/route.ts`,
  `src/app/write/page.tsx`, `src/components/editor/` (`writer-state.ts`, `stages-draft.tsx`,
  `stages-publish.tsx`, `publish-client.ts`), `src/components/opinion-map/data.ts`, `actions.ts`,
  `src/components/article-declaration/declaration.tsx`.
- `packages/core/src/classification.ts`, `packages/core/CLAUDE.md`.
- `docs/plans/backlog.md:37`, `:58-63`; `docs/plans/build-plan.md:50`;
  `docs/Dialecta_Article_Editorial_Template.md:65`, `:188`, `:199`;
  `docs/Dialecta_Delta_Mechanic_Spec.md:83`; `docs/RECOVERED.md`.
- `exchange/open/2026-09-21-architect-07-handoff-classifier-provenance-and-hygiene.md`;
  `team/architect/architecture/2026-09-21-rebuild-map.md`;
  `team/architect/architecture/2026-09-21-delta-mechanic-port.md`.
- Live Supabase project `mguulnibvzusfvyuowwh`, read-only, 2026-09-21: table list, column lists for
  `articles`, `classifications` and `admin_audit_log`, `pg_constraint` on `articles` and
  `admin_audit_log`, `pg_proc` for the five `security definer` functions, every row of
  `opinion_map_positions`, per-article tier columns and declaration map shapes, declaration word
  counts and dash scan, profile counts.
- Vercel API, read-only, 2026-09-21: `list_projects` (four projects), `get_project` on `dialecta`.
  `get_team` returns 403 for this token, so the plan tier is unread and nothing here depends on it.
- Vercel docs, function duration: https://vercel.com/docs/functions/configuring-functions/duration
