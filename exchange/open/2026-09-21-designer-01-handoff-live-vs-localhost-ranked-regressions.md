---
id: 2026-09-21-designer-01
type: handoff
from: designer
to: [convener]
subject: Live vs localhost, ranked. Six port regressions, one of them a critical rendering bug the codebase already half-diagnosed
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## What this is

Dan asked for a direct comparison of `https://www.dialecta.org/` against `http://localhost:3050/`,
pair by pair, to check his standing instruction: port as much as possible. Full write-up, every
pair, every difference, classed and given a severity, is
`council/designer/research/2026-09-21-live-vs-localhost/REPORT.md`. This record is the short list
for routing: six real regressions, ranked, each with a file and a fix. `builder` implements; I do
not.

## The six, in order

1. **Critical. Long sections go blank past the first screenful**, on the article page and on
   `/pact`. Confirmed on real content, confirmed not a background-tab artifact (survived an
   explicit click and a fresh reload), confirmed absent on live at equal or greater scroll depth.
   The codebase already half-fixed this once: `pact.module.css:74` to `92` documents the exact
   Chromium hazard (a full-height offscreen surface, from an expensive paint property on an
   unbounded-height element, stalling Chrome's renderer) and the fix applied to `.parchment::before`
   alone. The same hazard is still live on `.parchment` itself (`overflow: hidden` plus
   `border-radius` plus a four-layer `box-shadow`, `pact.module.css:56` to `71`) and independently
   on `.dialecta-sheet` (an SVG-filter `background-image` plus a four-layer `box-shadow`,
   `apps/web/src/styles/dialecta-surfaces.css:269` to `284`). Both carry the same decorative chrome
   onto a card whose height is unbounded content, one of them 9254px tall on the piece tested. Fix:
   the same principle already used for the grain layer, move the expensive paint off the unbounded
   element, onto a bounded decorative layer, or drop it from the outer element and carry it on a
   wrapper sized to a screenful.

2. **High, desktop only. The persistent site-rail is missing everywhere.** Live's own stylesheet
   says it explicitly, `_theme/assets/css/style.css:1773` to `1787`: "the DialectaSidebar moved out
   of post.hbs and into the default shell so it persists across every page." Confirmed present on
   nine different live pages and absent from all nine on local, by DOM query, zero matches for any
   rail or sidebar element. `apps/web/src/app/layout.tsx` claims in its own comment to port "the
   frame every page renders inside... the specification for the site as it looks today," and is
   missing half of that specification. Hides under 1100px on live, so this is not a mobile finding.
   Fix: add the two-column shell (`1fr 320px`, sticky, same 1100px breakpoint, exempt `/write` the
   way live exempts it) to the root layout, seeded with what needs no new data, the static quote and
   "Recently Published", with the presence-based widgets stubbed the way live itself currently ships
   them.

3. **High, and a feature, not a style fix. The reading-stage bar and the Declare mechanic are
   unported.** Live's article pages carry a five-tab stage bar (Reflect, Read, Declare, Discourse,
   Bio, Share) and, once you scroll past the article, a "Declare" opinion-mapping modal. This is the
   front end of a named, specified mechanic, `docs/Dialecta_Delta_Mechanic_Spec.md`, the
   infrastructure the Reviser archetype is built on. No trace of it anywhere in `apps/web/src`.
   Not a quick patch, flagging for the backlog.

4. **Medium-high. The article's featured image is dropped.** Not a rendering bug, a modelling gap:
   `ArticleSummary`/`Article` (`apps/web/src/lib/articles.ts:7` to `20`) never name a
   `feature_image` field, so the query never asks for one. Fix: add the field, select it, render it
   above the title on `apps/web/src/app/articles/[slug]/page.tsx`.

5. **Medium. Three small rough edges on the profile page.** The fourth tab reads "Articles" where
   live reads "Growth". The join date is missing under the handle. And Dan, looking at his own
   profile, reads "SEE THEIR WRITING" instead of "SEE MY WRITING", a direct symptom of item 2.1 (the
   session is not yet linked to the profile) rather than an independent bug, but worth fixing
   alongside the other two since it is the same file.
   `apps/web/src/app/profile/_components/ProfileView.tsx` and `panes.tsx`.

6. **Low. Comment timestamps read as absolute dates locally and relative dates on live** ("Apr 30,
   2026" against "20w ago"). `apps/web/src/components/discourse/feed.tsx`. Small, possibly nobody's
   considered choice either way, worth one line so the convention gets picked deliberately rather
   than by accident.

## What did not make this list

Everything else this audit found is either already recorded as intended (the scrolling header, the
single sign-in link, Community's missing archetypes, the fingerprint's concentric rings), already
tracked as a data gap blocked on identity work (the signed-in homepage's dashboard, item covered by
`apps/web/src/app/page.tsx`'s own comment; the profile fingerprint, item 2.4), or an improvement
the port should keep (the 404 page is genuinely better than live's, which has no theme applied to
it at all; D-27's brass-to-ink substitution held on every one of six pages checked). Full detail,
every pair, in the report.

## What I could not verify

390x844 as a real resized window was not achievable in this session; see the report's Method
section. Deep scroll at mobile width, the Pact's middle six sections, the Pact's tier-reading
exercise, whether local's comment cards carry Reply and Nominate-for-reclassification controls, and
the article's own tier badges (author declared / engine read / final) are each unconfirmed either
way, not claimed as findings.
