# Fingerprint render cost

## Brief

The render has nowhere to land. `apps/web/src/app/profile/[id]/page.tsx` is sixteen lines and a
placeholder; no Fingerprint component exists anywhere in the app that will ship. Every ruling
tonight, legibility, the Breach curve, seasons, is a fully specified patch against a quarantined
Pages-era engine or a Python research script, neither of which is production code. The ledger
those rulings assume real data from is unwritten too: `strings.ts` names it as a known fault, and
`api/comment/route.ts` has the write commented out on purpose, gated behind a pipeline that does
not exist yet. Build the writer and the renderer before spending more sessions tuning pixels no
data will reach. The pure math can, and should, proceed in parallel.

## What a session costs here

A session is one scoped, tested change sized like the three files already shipped today:
`fingerprint-geometry.ts` (Soft horizon), `fingerprint-texture.ts` (the noise field), and the
`axis-mapping.ts` rewrite, each landed same-day with a failing test shown first, per this agent's
own mandate. That is the unit below.

## The renderer has no home yet

Nothing in tonight's build-state table names this, because the debate has been about what the
render should look like, not about whether it exists. It does not. `packages/core` holds pure
functions (extents, ring counts, texture offsets, colour math): no SVG, no canvas, no JSX.
`_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` is quarantined, cited and not
promoted. `apps/web` has zero fingerprint component code anywhere (checked by name and by content:
no file, no inline `<svg>`, no `ImageResponse` call outside the two article/site Open Graph
cards, which explicitly exclude any fingerprint-derived descriptor by design). The profile page is
a placeholder string.

Three pieces, roughly 2.5 to 3 sessions:

- A pure paint-plan module beside `fingerprint-geometry.ts`, turning `AxisTotals` plus texture
  offsets and colour into drawable arcs, opacities and colours as data. One session, tested the
  same way its neighbours are.
- A client island, `apps/web/src/components/Fingerprint.tsx`, consuming that plan and drawing
  inline SVG. `apps/web/CLAUDE.md` already names the Thinking Fingerprint as one of the few
  standing islands, so the shape is not in question, only the build. One session.
- A server-side loader assembling one member's `AxisTotals`, `tierMix` and topic history, on the
  pattern `apps/web/src/app/analytics/_lib/load.ts` already establishes for `axis_scores` against
  the anon-key session client. 0.5 to 1 session.

This item is a precondition for every ruling below, and for the carousel fix. None of it is
mentioned as its own line in tonight's frame.

## Legibility

`council/designer/positions/2026-09-20-fingerprint-legibility.md`. Six changes plus one
prerequisite designer already resequenced to first: the radius floor, because removing the halo
flood exposes the centre notch as the most salient artifact on three of seven gallery profiles.

| Change | Cost | Portable before the renderer exists |
| --- | --- | --- |
| Radius floor for near-zero graduations | 0.25 to 0.5 session | Yes, `fingerprint-geometry.ts` |
| Halo mask (subtract, not flood) plus cut centre glow | 0.5 session | No, needs a paint layer |
| Flat opacity, radial value ramp, era-boundary 1.75x weight | 0.5 session | No, needs a paint layer |
| Palette respace, five of twelve colours, halo pulled 60% neutral | 0.25 session | Yes, a colour table |
| Ring count formula and resample across full history | 0.25 session | Half; resampling needs real per-comment history, see below |

Total roughly 1.75 to 2 sessions once the renderer exists. Of that, the radius floor and the
palette table (about 0.75 session) are pure data and can land in `packages/core` today, tested
against synthetic totals exactly as `fingerprint-geometry.ts` and `fingerprint-texture.ts` already
were.

## The Breach curve

`council/designer/positions/2026-09-20-colour-and-the-breach-curve.md`. The attenuation math,
`D *= (1 - depth * kernel)`, fixed width at 0.16 of the day's own radius, `depth(t) = 0.07 + 0.55 *
exp(-t / 0.50)`, compounding multiplicatively across several breaches, is arithmetic in the same
shape as the turbulence functions already in `fingerprint-texture.ts`. One session, portable into
`packages/core` today, tested against synthetic dates the same way.

What it cannot get from `axis_events`: a Breach earns no axis event by design (Universal Rule 1,
enforced in `axis-mapping.ts`), so the ledger this debate keeps returning to has no row to date a
Breach from. The curve's `t` has to come from a second, separate read: `comments` filtered to
`final_tier = 'breach'`, ordered by `created_at`, both columns already live on that table. Call it
0.25 to 0.5 session, and it is not the same query as the season and legibility work below, even
though all three get discussed under one "read the ledger" heading tonight.

Visibility (public, connections-only, per ADR-004's amendment) is philosopher's and legal's call,
not costed here, because it decides whether this renders at all before it decides how.

## Seasons

`council/designer/positions/2026-09-20-where-a-season-stops.md`. The arc-width math itself, run
grouping, proportional division of the 60 degree sector, the minimum-arc merge, retiring
`sharpBlend`, 0.28 radial bleed, innermost ring at 0.13, is designer's own "about thirty lines"
plus tuning constants. Call it 1 to 1.5 sessions, portable into `packages/core` today against
synthetic per-comment arrays built by hand, the same way the shipped files were tested before any
real data existed.

That estimate is for the math alone, and it is smaller than the sentence "one change to how
history is stored" suggests. Nothing today stores or derives `topicPhases` at any grain, coarse or
fine. `fingerprint-page-mount.jsx:23-33` hardcodes `topicPhases: []` on every axis regardless of
the profile handed to it, and `apps/web` has no equivalent consumer at all. The actual derivation,
reading real events in order and grouping them into phases, is the next item below.

## Reading axis_events into the renderer

Roughly one session, in two halves that do not have to land together.

- A service-role query against `axis_events`, already indexed on exactly the shape this needs
  (`axis_events_member_idx on (member_id, axis, created_at)`, no schema change required), plus a
  pure grouping function beside `replayAxisScores` turning that ordered stream into per-axis
  topic runs. 0.5 session, tested like `axis-mapping.test.ts` already tests its neighbour.
- Wiring: this cannot be a client-side fetch or run through the anon-key client
  `analytics/_lib/load.ts` uses for `axis_scores`. `axis_events` carries an explicit
  `using (false)` select policy, service role only, confirmed both in the migration and in
  `apps/web/src/app/analytics/_lib/access-map.ts`'s own closed-table probe. `apps/web/src/lib/
  supabase/service.ts` says so about itself: "deliberately no browser-safe counterpart." So this
  read happens in a server component or route handler, and only the computed geometry, never the
  raw per-comment rows, crosses into the client island as props, which is the existing island
  rule (practices.md: a prop crossing the boundary has to be serializable) applied here rather
  than a new one invented for it. 0.5 session.

What it unblocks: real per-comment-dated topic history for the season ruling and the legibility
ruling's era-boundary weighting, and the ledger-render alternative designer prototyped separately,
if that direction is ever chosen over the ring model. What it does not unblock: the Breach curve,
priced separately above, because Breach rows are excluded from this table by the same rule that
makes the residual necessary in the first place.

## The carousel's discard

`fingerprint-page-mount.jsx`'s `axisScoresToFingerprintData` throws away `tierMix` and
`topicPhases` on every axis. But that file lives in `_recovered-next`, quarantined, not part of
`apps/web`. Fixing it in place ships nothing, because nothing in the live app imports it. Once the
server-side loader above exists, not discarding what it already fetched is the default, not an
extra step: under 0.25 session, fully absorbed into that loader rather than schedulable on its
own.

## What has to be true of the data first

- **`axis_events` needs a writer.** None exists today. `strings.ts`'s own fault entry says so
  plainly ("Nothing in this repository writes axis_events or axis_scores") and
  `api/comment/route.ts:278` leaves the hook commented out on purpose, sequenced behind the Wait
  Window and Stage 2.5 promotion pipeline per security's own rule
  (`council/security/positions/2026-09-20-path-to-launch.md`, rebuttal point 4). Until that
  lands, every session costed above renders the same static rows it renders today.
- **The 27 rows' provenance is unverified here.** Nothing I read tonight says whether they are
  seed data, a migration backfill, or early production traffic. Quoting them as evidence of
  anything before that is checked is the same mistake this project has corrected itself out of
  before.
- **`comment_id` cascades on delete.** Deleting a comment deletes its `axis_events` rows with it
  (`on delete cascade`). A ledger a person can shrink by deleting what earned it is not "can
  never be changed," it is "can never be changed until you delete the thing that changed it."
  Either the write path copies the delta into an event that survives the comment, or that
  property is false as built. That is a product call, not a rendering one, but it sits upstream
  of any claim the render makes about permanence.
- **Breach dates come from `comments`, not `axis_events`,** for the structural reason above. A
  renderer that only reads the ledger will never find a Breach to draw a residual for.
- **Volume is too low to check the season math against reality.** 27 rows total, across every
  axis and every member, cannot distinguish the coarse-block demo data designer measured from the
  per-comment history production would produce. That comparison is exactly what
  `where-a-season-stops.md` ran, on synthetic data, because real data cannot yet support it.

## Totals, for treasurer

Render-side work only, not the ledger writer itself, which is bundled into an unscoped pipeline
(Wait Window, Stage 2.5) this agent has no brief for tonight:

| Item | Sessions | Needs the renderer | Needs real `axis_events` rows |
| --- | --- | --- | --- |
| Renderer (paint plan, island, loader) | 2.5 to 3 | | |
| Legibility | 1.75 to 2 | Yes | Partly (resample) |
| Breach curve, plus its own date query | 1.25 to 1.5 | Yes | No (reads `comments`) |
| Seasons | 1 to 1.5 | Yes | Yes |
| `axis_events` reader (query, grouping, wiring) | 1 | Yes | Yes |
| Carousel discard | under 0.25 | Yes | No |

Roughly 8.5 to 9 sessions to ship all three rulings against real data in the app that will ship.
About 2.5 to 3.25 sessions of that (radius floor, palette table, the Breach math, the season arc
math) are pure functions that can be written and tested against synthetic input today, in
`packages/core`, regardless of how the renderer or the ledger sequencing resolves.

## Rebuttal

Architect's strongest point: fix the writer before the renderer. I filed the 27 rows as unusable,
provenance unverified, and folded any writer work into an unscoped pipeline I have no brief for.
Architect names the writer (`_recovered/api/_axis-mapping.js:87-116`), shows it stamps topic on
Reach alone, and prices the fix as a backfill from `articles.topic`. That slice was never
unscoped: 0.25 to 0.5 session, my own band for a function, a migration and an update statement. It
should land first. Conceded.

It does not shrink the renderer. Architect's own build order still needs a fold module and a
write-time render step: the same renderer work I priced at 2.5 to 3 sessions, now reading the fold
rather than `axis_scores`. Architect rules that source out directly: a tier count and a topic list
"cannot say when anything happened." My loader assumed `analytics/_lib/load.ts`'s anon-key pattern
against `axis_scores`; wrong for the same reason the season and Breach rulings exist. Re-costed:
same 0.5 to 1 session, service-role only, no anon-key reuse.

Net change to my total: add 0.25 to 0.5 session for the writer fix, landing first; the renderer's
three pieces stay priced as filed, 2.5 to 3 sessions, reordered behind it, with the loader's data
source corrected. Roughly 8.75 to 9.5 sessions, not 8.5 to 9; the order changes more than the
total.

On `graduation_count`: I never priced against that constraint, so the correction changes nothing
in my table.

On the carousel: architect shows `_recovered-next` is what production runs today, "quarantined"
oversold it. My point stands only for `apps/web`, the app I am scoped to and the one this debate
is building toward: a fix there still ships nothing until `apps/web` imports it. Designer's "every
visitor's first fingerprint is currently fake" is about today's live site, not a claim I disputed.
