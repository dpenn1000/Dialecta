# Fingerprint architecture

*architect position, 2026-09-20, for `council/log/2026-09-20-fingerprint-legibility-and-model.md`.
Live figures were read tonight from project `mguulnibvzusfvyuowwh`, confirmed by its own table
names before anything else, with read-only SQL: constraints, policies and grants from
`pg_catalog`, everything else as counts. No member identifier and no member's text left the
database.*

## Brief

The fingerprint is one fold over the ledger: defined once in `packages/core`, run on the server,
stored, and served alike to profile, card and byline. No renderer should read `axis_scores`,
because a tier count and a set of topics cannot say when anything happened, and time is what Dan
asked for. The ledger the frame calls ready is not. Read live tonight: 22 of 27 `axis_events`
carry no territory, and all 5 that do are Reach, because the writer stamps a topic on Reach alone
(`_recovered/api/_axis-mapping.js:87-116`). Neither the ledger render nor designer's earned arcs
has its input. Fix the writer first. The territory already sits in `articles.topic`, so the
backfill is 27 rows.

## Events or summaries

**The renderer should read a fold of the events, and nothing that draws a fingerprint should read `axis_scores`.**

The summary cannot hold the story. Live, `tier_mix` is a per-tier count with no order, and
`topic_history` is a list of distinct topic strings present on 3 of 36 `axis_scores` rows, all of
them Reach. Two people with the same totals whose Heat fell in opposite halves of their time here
write the same summary, so any function of `axis_scores` draws Dolores Vance and her mirror image the
same, whatever `designer` rules. The spec asks the summary for something it cannot hold:
`docs/Dialecta_Data_Architecture.md:131` has the renderer read `tier_mix` for Heat that was
"early" and has "since resolved." A count carries neither word.

Every item `designer` has ruled reads per-event data, so the ring model and the ledger are two
renderers of one input:

| Ruled item | What it reads per event |
| --- | --- |
| Earned arcs, `where-a-season-stops.md` section 5 | A topic per comment, in order. The ruling's own table says "store one topic per comment" |
| The Breach curve, 62 percent on the day decaying to a 7 percent floor | The date of each Breach |
| Heat drawn where it happened, the Dolores failure | A tier per event, with its date |

The seasons position says the ring model needs "much less" than the ledger. Built with
`designer`'s own rulings, it needs the same stream. That separates the data decision from the
design decision, and the data decision is forced: whichever mark the council picks reads the same
fold.

The people who built the live system reached this conclusion and wrote it down. The theme's
profile mapper hands the engine `tierMix: {}` and `topicPhases: []` for every real person, under
the comment "tierMix and topicPhases require an axis_events query, not yet fetched"
(`_recovered-next/lib/theme/dialecta-profile-data-pure.js:95-104`). The carousel does the same at
`_recovered-next/lib/theme/fingerprint-page-mount.jsx:23-33`. In the theme source this
repository holds (synced 2026-05-04), summaries are the input, and under them no real
contributor's mark carries texture or territory.

### The ledger as written

The frame holds that the data the ledger needs already exists. The columns exist; the values are
missing.

| Measured tonight | Count | Cause |
| --- | --- | --- |
| `axis_events` rows with a `topic` | 5 of 27, every one on Reach | The writer sets `topic: articleTopic` on Reach and `topic: null` on the other five axes (`_recovered/api/_axis-mapping.js:87, 94, 101, 106, 111, 116`; articles at `:168-192`) |
| Breaches with a ledger row | none, by construction | `_axis-mapping.js:70` and `packages/core/src/axis-mapping.ts:105-107` return nothing for a Breach, and `axis_events.axis` is `not null` |
| Rows sourced from articles | 20 of 27 | `deriveArticleAxisEvents`, `_axis-mapping.js:140-195`. "One mark per comment" has to decide what an essay is |
| Live rows `replayAxisScores` accepts | none: it throws on the first | `AxisEvent` (`axis-mapping.ts:156-160`) takes the spec's numeric `delta` and `tier_at_contribution`, and the check at `:189-191` throws without a `delta`. Live has `tier` and no `delta`, and the type ignores `topic` and `created_at` |

So the carousel will not change "the first time a contributor has a comment with a territory," as
the frame expects. Its mapper discards topics unconditionally, and the writer never gives a
non-Reach event one. The ledger render has not met a date either. `ledger_render.py:218` places
each event by its rank in a synthetic chronology, `(gi + 0.5) / n`, so a prolific month takes more
radius, where the file's own comment at `:119-121` promises a denser band. Real dates will change
the look: gaps become empty bands and bursts become dense ones.

The territory is in the database. All 5 live articles carry `articles.topic`, and all 3 comments
reach theirs through `article_slug`. The backfill needs nothing from Ghost: 23 of the 27 rows can
copy a topic from a Reach row in the same contribution, and the 4 rows on the other 2 comments copy
it from their article.

### Cost

Reading events costs nothing worth pricing. The real `replayAxisScores` from `packages/core`,
timed on STUDIO-PC (method below):

| Ledger | Events | `replayAxisScores` | Season-grain fold | Events as JSON | Season model as JSON |
| --- | --- | --- | --- | --- | --- |
| 5 contributions (the largest live ledger holds 11 events) | 14 | 0.002 ms | 0.006 ms | 1.4 KB | 0.7 KB |
| 1,000 contributions | 3,473 | 0.07 ms | 0.9 ms | 341 KB | 19.7 KB |
| 5,000 contributions | 17,435 | 0.38 ms | 4.4 ms | 1.71 MB | 21.0 KB |

The spec justifies snapshots as the answer to "expensive ledger replay at render time"
(`Dialecta_Data_Architecture.md:137`). Replay is cheap at any size the platform will reach. The
costs that remain are the row fetch and the SVG, and both leave the request path once the fold's
output is stored at write time. For `treasurer`: a renderer that reads events leaves unit cost
where it is, and adds one stored model and a few kilobytes of SVG per member per visibility scope.

## One definition

**A fingerprint is the as-of fold of one person's append-only record, on six axes, into what they
earned, where, in which tier and when, drawn at one of three levels of detail.** That is the data
half of the one model the debate owes; `designer` owns the drawing half.

It lives in `packages/core` as two pure functions and one constant:

| Export | Owns | Replaces |
| --- | --- | --- |
| `foldFingerprint(rows, { asOf, scope })` | What the mark says: uncapped totals, extents from `fingerprint-geometry.ts`, purity, turbulence and clarity, eras with their topics and tiers, Breach residuals with dates, tenure, prior topics for Reach | The engine's `deriveAxisMetrics` (`dialecta-fingerprint-engine.jsx:180-207`), its second copy at `apps/web/src/app/analytics/_lib/derive.ts:229`, its third at `scripts/profile_gallery.py:88-95`, and `getMemberTopicHistory` (`_axis-mapping.js:272-282`) |
| `renderFingerprint(model, lod)` | What it looks like at `profile`, `card` and `byline`, the smaller two derived from the first by rule | Every hand-written renderer listed below |
| `FINGERPRINT_VERSION` | Which fold and which drawing produced a picture | Nothing: no version exists anywhere today |

It also takes in three things held elsewhere today: a `LedgerRow` type written from the live
table; the axis angles, which live only in the quarantined engine's `AXES` (`:67-86`) and in
Python; and the topic palette, whose port at `apps/web/src/lib/topics.ts:9-13` says in its own
header that it belongs in core. And it adds the salt. `ringFields` defaults `salt` to 0
(`packages/core/src/fingerprint-texture.ts:129`) and nothing maps a person to one, so "no two the
same" currently depends on each caller remembering. Derive it from `profiles.id`, the uuid primary
key, which survives the move off Ghost. A salt taken from `ghost_member_id` would repaint every
texture on the day the Phase 2 identity lands.

Profile, card and byline cannot drift because none of them computes. Each calls
`renderFingerprint` on the same stored model. The render stamps `data-fp-version` and a hash of the
model on its root element, and one test asserts that the three surfaces emit the same hash for the
same member.

### Implementations today

Nine hand-written files restate the three trade-off pairs, eight of them distinct:

- `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx:150`, the engine the live page runs
- `components/dialecta-fingerprint-engine.jsx:221`, `components/dialecta-fingerprint.jsx:172`,
  `components/dialecta-growth-scroll-v5.jsx:113`, `components/dialecta-profile.jsx:158` and
  `components/dialecta-profile-mobile.jsx:158`
- `packages/core/src/fingerprint-geometry.ts:110`, where Dan's rulings landed
- `scripts/profile_gallery.py:26` and `council/designer/research/gallery_probe.py:26`,
  byte-identical, md5 `b761b523` for both

A second signature, the 0.85 radius exponent, finds the same nine plus `scripts/turbulence_lab.py:32`,
which ports the radius and texture without the pairs, after one false positive is dropped: an
`rgba(0,0,0,0.85)` shadow in a recovered share card that draws no fingerprint. Five compiled
bundles carry further copies.

The reading test ran on none of the code a person will see. Its "shipped" sheet calls
`gallery_probe.render_one` (`council/log/2026-09-20-fingerprint-legibility-and-model/sheets.py:58-60`).
Production runs the recovered engine. The core port renders nowhere:
`apps/web/src/app/profile/[id]/page.tsx` is a 16-line placeholder, and nothing in `apps/` imports a
geometry or texture function. The Python texture also disagrees with core for the same person,
because it hashes with `sin(k * 127.1 + ...) * 43758.5453` (`scripts/turbulence_lab.py:106-108`),
the idiom `fingerprint-texture.ts:101-104` rejects for banding; one salt gives different ring
rotations and phases in the two languages. The failures the test found, the noise floor read as
Heat, Heat drawn as recent and the penalty, come from formulas every copy shares, so they stand.
The conditions also ran on two palettes: the ledger sheet on `designer`'s respaced
`palette_check.FIXED` (`ledger_render.py:43`), the shipped rings on the palette as it stands
(`sheets.py:59, 73`).

Research keeps its speed and loses its fork with one change: a small CLI in `packages/core` that
reads a ledger as JSON and writes the model or the SVG. Python rasterises and measures, and stops
re-deriving. Any number reported to Dan then comes from the shipping code.

## Where it runs

**On the server, beside the ledger write, on the service role. The browser receives an SVG.**

The spec's layering stays: Compute writes the Store, and Render reads it without computing
(`Dialecta_Data_Architecture.md:29`). The payload changes. The writer that appends ledger rows
refolds that member and stores one model per visibility scope, with its renders. The profile page
serves the stored SVG inline, the card goes through `next/og` as the article card already does
(`apps/web/src/app/articles/[slug]/opengraph-image.tsx:1`), and the byline takes the small render.
A page view never touches the closed ledger.

The browser is ruled out on two counts:

- `axis_events` is closed to anon by one policy, `axis_events_service_only`, `using (false)`. The
  anon table grant is still in place (`has_table_privilege` returns true), so that policy is the
  only lock, and a browser renderer would need it lifted.
- ADR-004 adopted `legal`'s rule that every level except self-visible ships disabled until the
  predicate policy exists (ADR-004:142-144). A browser holding the model cannot un-show a residual
  it was sent. Scope is applied in the fold, before anything leaves the server.

Running on the server is necessary and not sufficient. The recovered snapshots endpoint runs on the
service role, states that it "does not enforce visibility," and has nothing but CORS in front of it
(`_recovered/api/profile/[id].js:91, 1005-1030`). It also returns `aspiration_at_capture`, copied
from a table closed by policy. `security` should confirm whether that route still deploys. Gating
belongs in the query that builds the model.

**The grain of the model is the privacy boundary, and the render is the disclosure.** Tonight's
readers matched ledger marks to their people 21 times in 21 at 330px. A mark with one glyph per
comment and form by tier publishes a per-comment tier history wherever it was drawn. Location
protects the rows; grain decides what the picture publishes. So the fold takes a scope, and the
public scope folds to a coarser grain than the owner's: season cells of tier and topic counts, for
instance, 21 KB for a 5,000-contribution veteran against 1.71 MB of events. Choosing the grain
belongs to `security` and `designer`. Placing it in the fold, once, is the architecture.

One proposal on the table would route around that boundary. The seasons fix stores `topicPhases`
"at per-comment granularity" in the summary, and the summary is `axis_scores.topic_history`, under
the live policy "Axis scores are publicly readable": `using (true)` for every role, with column
SELECT granted to anon on `topic_history` and `tier_mix`. That change would publish every
contributor's per-comment topic sequence to every visitor. The same arcs drawn from the fold on the
server cost the same and publish only the picture.

## Snapshots and permanence

**A snapshot today cannot reproduce what the person saw, and the ledger under it is not
append-only.**

The 4 live snapshots are all `first_entry`, none has a PNG, and each stores a copy of the summary:
`graduations`, `tier_mix` and `topic_phases` per pillar (`_recovered/api/_fp-snapshot.js:59-70`).
The `topic_phases` hold strings where the engine expects `{topic, count}` objects, under
snake_case keys where the engine reads `tierMix` and `topicPhases`. No version records which
renderer the person saw. No code renders a snapshot yet. The first that does, handed
`fingerprint_data` as stored, takes the engine's legacy branch at
`dialecta-fingerprint-engine.jsx:186-198` and synthesises a tier mix from a default purity of 0.8.
Run in Node with the engine's own expressions, every axis with 11 or more graduations acquires one
Heat: turbulence 0.091 at 11, 0.045 at 22. Father Anselm's 22-graduation axes would render hotter
than Wen Zhao's real 0.025, and the shaming error the test found through a noise floor would return
through a key name.

The ledger breaks "never changed" three ways. Each is a different answer to what deletion means,
and none was chosen:

| Path | What happens | Evidence |
| --- | --- | --- |
| A comment is deleted | Its classifications and ledger rows cascade away, and every past render changes silently | `pg_constraint`: `ON DELETE CASCADE` on `axis_events.comment_id`, `axis_events.classification_id` and `classifications.comment_id` |
| A comment is reclassified inside its 60-minute window | Its ledger rows are deleted and re-appended on the service role | `_axis-mapping.js:296-302`, rule 6, per `team/reviewer/knowledge/2026-axis-mapping-malleability-window.md` |
| A member deletes their profile | Snapshots cascade away; the ledger and the public `axis_scores` rows stay, keyed on an id nothing resolves | `fp_snapshots.member_id` cascades from `profiles`; `axis_events` and `axis_scores` carry no foreign key to it |

"Grows with you but can never be changed" is a property of the record before it is a property of
the picture. Current practice gives it three rules:

1. **The record only grows.** A correction or a reclassification appends a row that supersedes an
   earlier one, and the original stays. The Azure Architecture Center's event sourcing guidance
   names this as the only way to update or undo: append a compensating event. A deletion appends a
   tombstone, and the person's words go wherever the platform keeps text. Verraes calls that a
   forgettable payload: the event keeps a reference, the payload lives apart, and erasure removes
   the payload while the log stays whole. What a deleted comment leaves on the mark is for `legal`
   and Dan; the structure supports either answer.
2. **The fold is as of a moment.** `foldFingerprint` over the rows recorded up to T draws the same
   picture of T for good, however the record grows afterwards. Fowler's bitemporal history
   separates actual history from record history; the fold reads record history, so a nomination
   that resolves next month cannot repaint last month.
3. **A snapshot is a pointer and a frozen picture:** member, as-of row id, `FINGERPRINT_VERSION`,
   model and SVG. The SVG freezes what the person saw. The pointer lets any later renderer
   reproduce the moment or redraw it on purpose. In the Azure guidance's words, snapshots are "an
   optimization, not a replacement for the eventstream."

Two cheap rules make permanence something a person can check:

- **The public scope folds only hardened rows.** `comments.hardened_at` exists, and the recovered
  edit route already uses it to refuse late edits (`_recovered/api/comment/[id].js:126`). Nothing
  that builds a fingerprint reads it. With it in the public fold, nothing a stranger has seen can
  vanish inside the window; the only thing that can disappear is what no stranger saw.
- **Growth is a test.** `render(as of T)` must be a rescaled interior of `render(as of T + d)`.
  Placed by date, the ledger's marks pass: each keeps its angle, and the disc rescales around it.
  Placed by rank, as `ledger_render.py:218` does, they pass only approximately, because the jitter
  at `:223` scales with tenure and the rank with count. The ledger's outline fails, because its
  threshold is the 92nd percentile of the whole field and falls with resonance
  (`ledger_render.py:259-260`), so new marks move the line over old sectors. The ring model fails
  by construction: a graduation on the strongest axis re-spaces every ring
  (`dialecta-fingerprint-engine.jsx:426, 431`), and the penalty pulls a partner petal inward, which
  the frame measured at up to 4.5px on a 118px horizon. Whichever mark ships should pass this as a
  property test in `packages/core`.

## What Dan is missing

1. **No fingerprint exists yet in the sense he means.** Nine implementations exist, with no data
   for any of them. In the theme source this repository holds, the one strangers see draws every real
   contributor on the seed fallback. The one the council read tonight is a Python copy. The one his
   rulings landed in renders nowhere.
2. **It grows only where a writer writes, and nothing in this repository writes the ledger**
   (`apps/web/src/strings.ts:292-296`). The new comment route leaves that hook unwired on purpose
   (`apps/web/src/app/api/comment/route.ts:278-293`), and the new article route has no ledger code
   at all. The day writing moves to `apps/web`, every fingerprint stops growing, and nothing
   reports it.
3. **"Can never be changed" is a promise about the record.** The picture can be organic only on top
   of a record that is append-only in fact, and this one is not yet.
4. **Legibility and disclosure are one quantity.** Each gain in how well a stranger reads the mark
   is a gain in what the platform publishes about a named person. The grain of the fold is where
   that dial sits. Set it once, in core, and no surface can turn it on its own.

## Findings, ranked

| # | Finding | Where | Fix | Now against later |
| --- | --- | --- | --- | --- |
| 1 | The writer stamps a territory on Reach alone | `_recovered/api/_axis-mapping.js:87-116, 168-192`; its successor lands at `apps/web/src/app/api/comment/route.ts:278-293` | Stamp `topic` on every row from `articles.topic`, comments by `article_slug` and articles by `ghost_post_id`, and backfill the 27 rows | 27 rows tonight; every row after needs a join to repair |
| 2 | A Breach leaves no row, so ADR-004's residual has nothing to draw from | `packages/core/src/axis-mapping.ts:105-107`, `_axis-mapping.js:70`, `axis_events.axis not null` | One residual row per Breach, `tier` `breach` with `axis` null, allowed for that tier alone by a CHECK. The row's form is `migrator`'s; the requirement is one stream | Free before the first Breach; a reconstruction from `classifications` after |
| 3 | No rule version on any row, and the two mappings disagree on the tier they read | `final_tier` falling back to the AI tier at `_axis-mapping.js:68`; `ai_suggested_tier` alone at `axis-mapping.ts:103` | `rule_version` written on every ledger row; `FINGERPRINT_VERSION` on every model, render and snapshot | The first row core writes leaves a mixed ledger with nothing on it to say so |
| 4 | Core's ledger type is the spec's, and the wiring plan would break Reach | `axis-mapping.ts:156-160`; `route.ts:289-292` plans `replayAxisScores`, which keeps no topic history, while the legacy writer took prior topics from `axis_scores.topic_history` (`_axis-mapping.js:272-282`) | A `LedgerRow` typed from the live table, with prior topics folded from the ledger | Topics first met after the switch never enter the history Reach checks, so every comment on them earns Reach again |
| 5 | Nine implementations, and the test read a copy | Listed under Implementations today | One fold and one render in core, and a CLI for research | Every ruling is ported by hand again, and each port can drop channels, as one already did |
| 6 | The salt that makes two people differ has no definition | `fingerprint-texture.ts:129` defaults it to 0; nothing derives it from a person | `fingerprintSalt(profiles.id)` in core | Changing the source after launch repaints every texture |
| 7 | Snapshots cannot reproduce the picture, and would invent Heat if rendered as stored | `_recovered/api/_fp-snapshot.js:59-70`; engine `:186-198` | A snapshot holds the as-of row id, the version, the model and the SVG | 4 rows and no PNGs tonight |
| 8 | Deletion behaves three contradictory ways | Cascades on `axis_events` and `classifications`; delete-then-append at `_axis-mapping.js:296-302`; no member key on `axis_events` or `axis_scores` | Superseding rows and tombstones, with `legal` deciding what the mark keeps | Each cascade that fires before the fix is unrecoverable |
| 9 | The noise floor is fixed pixels: on Anselm one wobble is 1.6 percent of the rim's radius and 9.6 percent of the core's (the frame's measurement) | `fingerprint-texture.ts:89, 219`; the horizon restated as a literal `22` at `:231` | Amplitude as a fraction of the local ring radius, and the `22` derived from `GRADUATION_HORIZON`. The look is `designer`'s | A units change, the same cost whenever |
| 10 | The baseline asserts a CHECK that live does not have | `supabase/migrations/20260920000000_baseline_live_schema.sql:625`, `graduation_count between 0 and 22`. Live also names the unique constraint `axis_scores_member_id_axis_key`, against `:646-648`, and carries a `specificity_score` CHECK of 0 to 3 that `:544` omits | `migrator`: drop the invented CHECK, which contradicts the soft horizon Dan settled; correct the name; add the live CHECK | On a branch built from the baseline, the legacy writer's uncapped upsert fails at a member's 23rd non-Breach contribution; production has no such limit |

**First: 1, with 2 and 3 in the same change.** They touch one function and one set of rows, they
are the only items whose cost grows every day they wait, and everything else on every seat's list
(either render, earned arcs, the Breach curve, snapshots) reads their output.

## Build order

The architecture slice. Hours belong to `builder` and `treasurer`; the order is what I stand behind.

| Step | What | Cost | Buys |
| --- | --- | --- | --- |
| 1 | The writer: a topic on every row, a residual row per Breach and a rule version, in the route that will ship, plus the 27-row backfill | One function, one migration, one update statement | The input every ruled item reads |
| 2 | `LedgerRow` and `foldFingerprint` with scope, as-of, hardened-only public rows, prior topics and the salt | One module and its tests | One definition |
| 3 | The model and its renders stored per member and scope at write time, and SVG served | One table and a write-time hook | A request path with no service role, and snapshots almost for free |
| 4 | Snapshots as pointer and picture | A column or two while 4 rows exist | Permanence a person can check |
| 5 | The research CLI | Small | Every number reported to Dan comes from the shipping code |
| 6 | `designer`'s drawing items, in the order the council rules | Their estimates | Each lands once, in core, against the growth test |

## Method

- **Live reads.** Read-only SQL on `mguulnibvzusfvyuowwh` through the Supabase MCP, the project
  confirmed by its table names first. Constraints, delete rules, policies and grants from
  `pg_constraint`, `pg_policy`, `has_table_privilege` and `has_column_privilege`; every other
  figure as a count. Topic coverage is `count(topic)` per axis and source over all 27 rows.
  Snapshot shape is `jsonb_object_keys` and `jsonb_typeof`, no values. Backfill sizing groups rows
  by contribution, `classification_id` or `article_id`, and checks each for a Reach row with a
  topic.
- **Implementation count.** Two signatures, each a regex over `.py`, `.ts`, `.tsx`, `.js`, `.jsx`,
  `.cjs` and `.mjs`, excluding `node_modules`, `.git`, `.next` and `.claude/worktrees`, which hold
  copies. Every match was opened, and one was dropped. The identical pair was confirmed with `diff`
  and `md5sum`.
- **Benchmark.** STUDIO-PC, the build box: Node 24.15.0, `packages/core/src` bundled with esbuild,
  the median of 300 runs after 20 warm-ups, on synthetic ledgers in which each contribution earns
  Consistency and each other axis with probability one half. The season fold is a stand-in written
  to time and size a public model and nothing more. Production hardware will be slower; the order
  of magnitude is the claim.
- **Synthetic Heat.** The engine's own expressions from `dialecta-fingerprint-engine.jsx:190-197`,
  run in Node for 1 to 40 graduations. Float rounding moves the threshold from the 10 a hand
  calculation gives to 11.
- **Checked and corrected on the way.** The brief I was handed describes `graduation_count` as
  checked 0 to 22; `pg_catalog` holds no such CHECK. A reviewer note describes `hardened_at` as read
  by nothing; the recovered edit route reads it. The baseline calls live `articles` free of `topic`;
  live has the column, populated on all 5 rows.

## Where I could be wrong

- **Another writer may have produced some of the 27 rows.** The counts stand whoever wrote them; the
  cause I name is the only writer this repository holds.
- **Season cells are an example grain.** `security` and `designer` own the public grain. My claim is
  that it is set in the fold, once.
- **If Dan wants deletion to erase history,** the first permanence rule loses: tombstones become
  deletes, and snapshots taken before a deletion need an explicit invalidation instead of surviving
  it. The fold works either way.
- **Event sourcing has real cost,** and the Azure guidance says most systems do not need it. This
  platform committed to it already (`supabase/CLAUDE.md:10`), for the reason that guidance gives for
  adopting it, which is historical reconstruction. The fingerprint's whole claim is historical
  reconstruction.

## Sources

- Azure Architecture Center, "Event Sourcing pattern," updated 2026-08-15:
  https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing
- Mathias Verraes, "Eventsourcing Patterns: Forgettable Payloads," 13 May 2019:
  https://verraes.net/2019/05/eventsourcing-patterns-forgettable-payloads/
- Martin Fowler, "Bitemporal History," 7 April 2021:
  https://martinfowler.com/articles/bitemporal-history.html

## Rebuttal

`treasurer` files my fold under the path it funds, and `security` prefers it to a per-view
projection. As I filed it, the source `treasurer` cites ranks it last.
`Dialecta_Supabase_Scaling.md:47, 55` puts the 800 to 1,200 limit at replay "on every
classification event", a write, and my writer "refolds that member" on each append: the doc's
option C. My 4.4 ms timed the fold alone, and the doc states no method, so neither number measures
the fetch. I adopt option A (`:51`). Everything the fold keeps is a count, a set or an append-only
list, so a new row updates the stored state in constant time and the renders redraw from it. The
nightly replay stays as the drift check, and a property test in core asserts that replay and
increment agree. `designer`'s ring, fed from events, is one more render of that state, and moving
its Breach curve from years to volume removes the clock ADR-004 bars, so a stored render stays
true until the next row.

`builder`'s re-costed loader would read the stored model with the service key. `security`'s second
condition rules that out. By its source, the `/api/comments` handler, on the service key, served
all 3 held comments that RLS hid from anon. The loader reads as the viewer, behind an `auth.uid()`
policy on the stored table, the only lock because new tables arrive granted to anon. My step 3
promised that request path and never said how. I adopt `security`'s three conditions as written, so
the fold sets what each scope holds and an RLS policy sets who reads which. The third matches
`opengraph-image.tsx:14-16`, which holds every card to title and byline, so I withdraw my
`next/og` route for the share card.
