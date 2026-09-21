# Pricing fingerprint legibility and the model

*Filed 2026-09-20, in response to `council/log/2026-09-20-fingerprint-legibility-and-model.md`.
Reads `designer`'s `2026-09-20-fingerprint-legibility.md`, `-colour-and-the-breach-curve.md` and
`-where-a-season-stops.md`, and `packages/core/src/fingerprint-geometry.ts` and `-texture.ts` as
shipped. Dollar figures are fetched or read tonight and sourced below. Evening figures are size
comparisons against work already shipped, not an invented hourly rate: this seat declined to
price Dan's own labor in dollars in `positions/2026-09-20-port-or-rewrite.md` and holds that line
here too.*

**Confidence: high on every dollar figure. Medium on the build-order ranking, which follows
designer's own sequencing and sizing where a number was given, and says so plainly where one was
not.**

## Brief

Fund the geometry fixes, veto the events renderer until the study earns it. Every ruled item in
the three designer briefs is a formula already prototyped in Python, touching no table, so it
costs Dan's evenings, not the floor. A renderer that reads `axis_events` live is the identical
replay pattern `Dialecta_Supabase_Scaling.md` already measured and rejected for `axis_scores`,
walled at 800 to 1,200 lifetime comments before Supabase's compute buckles, and it forces open
either the anonymous key or a paid render per view. The ledger's edge tonight is one AI reader
repeated three times, not people. Price the human study at $274 to $411 on Prolific's own rates.
Spend a third of that.

---

## The build order

Every ruled item in designer's three briefs is a formula already tuned and rendered in Python,
filed under `council/designer/research/`, before it reached this debate. None of tonight's
rulings need a new column, a new table or a new API call. That makes the live question not what
each costs in isolation, which is `builder`'s to size exactly, but what shape each cost takes:
a solo operator's evenings and a recurring bill are not the same currency, and I won't collapse
them into one.

**Tier 1: rendering only, zero recurring cost, Dan's evenings.** Nothing here reads a new input
or writes a new row. `fingerprint-geometry.ts` (239 lines) and `fingerprint-texture.ts` (259
lines), both shipped today, are the size of work this tier resembles: a specified formula,
ported, with the reasoning kept in comments. Every item below is smaller than either file.

| Item | Buys | Specified in |
| --- | --- | --- |
| Mask the halo to the exterior, cut the centre glow | Stops flooding the interior at up to 0.68 of the topic hue. Direct fix to the first thing designer's brief names | `-fingerprint-legibility.md` |
| Flat opacity 0.84, radial value ramp, era boundaries at 1.75x | "A colour change from core to rim" and a countable number of eras, two of the three channels the no-legend reading test decoded correctly with no teaching at all | same |
| Ring count `clamp(round(maxGraduations*0.6)+2, 3, 14)` | Retires the 29-ring field where the wobble (5.5px) already exceeds the gap between rings (2.5px) | same |
| Cut stroke-weight-by-localStrength, flat 1.15px | Removes a channel measured at 0.9465 rank correlation with petal extent: paying twice for one signal | same |
| Breach: attenuate not subtract, fixed width, `0.07 + 0.55*exp(-t/0.50)` decay, compounding | Turns Dan's "massive glow" and "taking over the centre" complaint, both artifacts of a kernel that went negative, into a floor that never reaches zero | `-colour-and-the-breach-curve.md` |
| Breach residual as one open, non-closing ring | Stops painting a Breach the same hue as `politics_governance`'s own deep colour, 0.1 degrees apart, which today paints Marcus Aurel red though his record holds no breach | same |
| Season: earned angular extent, minimum arc, 1.6-degree blend, 0.28 radial bleed, 0.13 core | Designer's own estimate: "about thirty lines, and no product decision." Takes one colour's hold on a ring from 231 degrees to 27, the direct answer to Dan's note about seasons that shouldn't envelop an axis | `-where-a-season-stops.md` |
| Halo hue, 60% toward neutral; retire or reselect the six axis hues | Stops the halo repeating the hue the rings already carry, over a larger area | `-fingerprint-legibility.md` |

**Tier 2: one data shape change, still zero recurring cost.** `topicPhases`, stored per comment
instead of summarised into blocks. Same array, finer rows, written once when a comment is
classified, the same pass that already prices at $0.002. Topic is recorded alongside axis and
tier on the same `axis_events` row per comment, which reads as the same classification call
already in the floor, not a second one; if that turns out wrong, builder should say so. Two named
gaps come with it and are small: a Breach earns no axis event, so its date lives only on
`classifications` and `comments`, and `comment_id` cascades on delete, so a deleted comment takes
its history with it. Still Dan's evenings, not a new bill.

**Not priced here, and sequence first anyway.** Designer's radius floor fix, the notch the halo
mask exposed, is specified in `2026-09-20-fingerprint-review.md`, which sat outside what I was
pointed to read tonight. I won't invent its cost. Ask `builder` for a number before the build
order is final, and put it first regardless of what the number is: designer already ranked it
there, twice, for a reason that has nothing to do with price.

**Also not priced, because it is not yet specified.** The heat false positive, three of seven
profiles reading as heated when they hold none, is the single highest-value line missing from
this table. `fingerprint-texture.ts`'s own `BASE_NOISE_FLOOR` (1.8, read directly tonight) is the
mechanism the frame names. No ruling fixes it yet. It has no row here because designer owes the
fix before anyone can price it.

---

## The events question

Yes, and the direction is a choice, not a fact about the data.

`Dialecta_Supabase_Scaling.md`, already in this seat's research tree, priced this exact failure
shape once: replaying `axis_events` on every read "does not scale past roughly 800 to 1,200
lifetime comments per contributor on a small Supabase compute instance," and its own fix is
incremental update on write, "which keeps writes O(1)." A renderer that reads per-comment events
live, at request time, is `axis_scores`'s wall wearing a new name. Below it, nothing changes.
At it, every profile view becomes a recompute over a growing list, and the frame's own warning to
`security`, that a browser-side ledger render "would ship every contributor's per-comment tier
history to every visitor," stops being hypothetical: the browser is exactly where a client-side
renderer would need those rows.

Two ways to build it, two different unit costs:

| Path | Unit cost | What it needs |
| --- | --- | --- |
| Precompute on write, same pattern as `axis_scores`'s own fix | Flat. One row read per view, same as today | The Tier 2 data change above, nothing else |
| Replay `axis_events` live, at render time | Rises with a contributor's lifetime comment count, walled at 800 to 1,200 the same way `axis_scores` already was | `axis_events` opened past the anonymous key, or every render moved server-side, which forecloses the CDN caching a static mark gets for free |

The second path is also the one chasing an unsettled lead. Tonight's ledger render won its
reading test at profile size, 21 of 21 against the shipped ring's 19. But its field mode, the one
small sizes would use, holds one colour for 212 degrees, statistically indistinguishable
from the 230-degree over-spread Dan is already objecting to in the shipped render, by designer's
own measurement two positions later the same day. Paying the second path's cost buys a renderer
that is still failing the test the ring model was just ruled to fix.

**Build against the first path. Do not fund the second until the study below says the ledger's
edge survives real readers.**

---

## The human study

Priced from Prolific's own pricing page, fetched tonight: `research/2026-prolific-pricing.md`.
Minimum pay $8/hour, recommended "at least" $12/hour, platform fee 42.8% for a standard account,
added on top of whichever reward is set.

| | Per session (10 min) | 144 sessions, six conditions | 48 sessions, two conditions, a third |
| --- | --- | --- | --- |
| Recommended rate | $2.86 | $411 | $137 |
| Minimum rate | $1.90 | $274 | $91 |

Pay the recommended rate. The task asks a stranger to write two or three sentences about what a
person is like to argue with; a minimum-wage rate on a free-text task is exactly where satisficing
shows up, and a low-effort note is the failure mode this whole test exists to catch, not a saving.

**Is it worth $411 against six real people and zero paying?** Not the way it's asked. This isn't
acquisition spend, which this seat already prices at no return until a channel exists
(`positions/acquisition-cost.md`). It gates a build decision, and the decision it gates is the
expensive one above: fund a renderer with a real, scaling recurring cost and a live security
question, or don't. Measured against a week of Dan's evenings spent building the wrong renderer,
plus whatever it costs to have shipped a misreading to the first real stranger who looks, $411 is
cheap. Measured against six real people and no revenue, spending it all tonight is not: four of
the six conditions (the shipped ring at two sizes, the legibility ruling, the ledger at profile
size) already have an answer, weak as it is, from tonight's AI-proxy test. The two that don't are
the profile-size ring-with-fixes against the ledger's marks, and the byline-size ring-with-fixes
against the ledger's field, which is also the one place tonight's own proxy test flagged a likely
confound: a coin flip settled by tenure, not by anything the six pillars measure.

**Spend $137, on those two conditions, timed to land before `circulation` runs its next
acquisition push, not before.** Rerun the other four cheaply once real visitors exist to justify
them, not as a first, separate $411 charge against a platform with zero arm's-length members
paying anything, of three candidates.

---

## What Dan is missing

**The build order is ready for the expensive item first.** Designer's four "what I would hand a
builder" tables read as implementation-ready today, and every one is a Tier 1 or Tier 2 fix. The
one item that isn't ready, the events-aware renderer, is also the one with a real bill attached
and an open security question, and nothing in tonight's frame stops a builder from picking it up
first because `ledger_render.py` already has the furthest-along spec. A spec being ready
is not the same claim as an item being cheap. Sequence by cost and by what's settled, not by what
someone already prototyped furthest.

**The palette decision gets made once or it gets paid for twice.** `-fingerprint-legibility.md`
respaces five of twelve colours. `-colour-and-the-breach-curve.md`, filed later the same day,
proposes reselecting all twelve against three kinds of colour blindness, moving `law_justice` 80
degrees and `society_culture` 155. Building either costs the same, a dozen hex constants.
Building the small one now and the large one later costs it twice, plus a second pass on the
legend, `FINGERPRINT.md`'s copy, and the four `live-*.webp` captures Dan took tonight, all of
which go stale the moment the palette does. Decide the end state once, even if the build ships in
two passes.

---

## What I would veto

Funding a renderer that reads `axis_events` at request time, or opening that table past the
anonymous key to let one run client-side, before the $137 study above says the ledger's edge is
real and not an artifact of one AI reader graded three times. The wall it would hit is already
measured, in this seat's own research tree, for the identical replay pattern on a different
table. Paying to rediscover it on this one buys nothing the spec doesn't already know.

---

## Rebuttal

My position: fund the geometry fixes, veto the events renderer until the $137 study earns it. The
veto stands untouched tonight.

Philosopher's catch moves one row off my Tier 1 table. I priced designer's Breach curve,
`depth(t) = 0.07 + 0.55*exp(-t/0.50)`, as ready to fund alongside the legibility fixes: a formula,
ported, Dan's evenings. ADR-004 says decay needs no timer, "a property of the shape rather than a
timer anyone has to tune." Designer's curve is a timer. I filed it as a rendering decision because
designer's brief did. It is a policy call, and it isn't settled until Dan drops the clock or
amends the ADR. The dollar figure doesn't move, that item was never priced on its own. What moves
is order: behind that ruling, not in front of it, next to the radius floor fix I already flagged
for builder to price.

Architect and I don't disagree. My veto names two paths: replay `axis_events` live, which I
rejected on the `axis_scores` wall, or precompute on write, which I funded. Architect's fold,
stored at write time and served as SVG, 4.4ms at 17,435 events, is the second path costed, not a
third one. The number is evidence for the side I already funded, not against it. Where architect
and builder both add real cost I didn't price: the writer itself is broken, 22 of 27 rows carry no
topic, `replayAxisScores` throws on live rows, and a third of builder's 8.5 to 9 sessions is a
renderer that doesn't exist. None of that is a new bill. All of it comes due before the evenings I
already counted.
