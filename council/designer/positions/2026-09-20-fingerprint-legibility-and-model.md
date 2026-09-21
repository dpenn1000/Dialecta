# Fingerprint legibility and model, ruled

*designer position, 2026-09-20, fifth pass, answering the convener's frame. Reads all four of my
own positions filed today, `docs/FINGERPRINT.md`, `ADR-004`, the reading test's full evidence
folder (`answers.json`, every script, every sheet) and the four live-page captures. New renders and
one new script under `council/designer/research/`: `model_fixes.py`, `MODEL-FIXES-TRIO.png`,
`MODEL-FIXES-CANDIDATE2.png`.*

## Brief

My legibility ruling does not stand as specified. The reading test scored it below the unfixed
original, 17 of 21 against 19 of 21, and two readers confused Marcus Aurel with Tom Reilly and with
Dolores Vance under the dark, densely ringed condition I proposed. Rendering it myself shows why:
opacity 0.84 and a ramp of 0.60 toward colorDeep bury Marcus's one discriminator, a territory band,
in clutter, nowhere near the carousel's measured luminosity, L 0.725 against my 0.551. Lightening it
recovers both. The heat false positive is separate, fixed: ratio-capping the noise floor against
each axis's extent flattens 9 to 19 percent of radius at the core to 1 to 5 percent, unchanged where
the render already worked.

## 1. The legibility ruling, reversed

It does not stand at the settings I filed. `answers.json` has it: `specified_ring_legend_330px`
scored 5, 5, 7 of 7 (17 of 21, 81%) against `shipped_ring_legend_330px`'s 7, 7, 5 (19 of 21, 90%).
The one reader who measured the image with code got SPECIFIED right; the two who eyeballed it, the
realistic case, both got it wrong, and both wrong the same way: `key.json` puts Marcus Aurel at B,
and reader two swapped B with F, Tom Reilly (`A=7 B=4 ... F=1`, key `B=1 F=4`); reader three swapped
B with E, Dolores Vance (`B=6 ... E=1`, key `B=1 E=6`). Two independent misses, one shared mark.

I rendered the accusation to check it. `MODEL-FIXES-TRIO.png`, row two: under SPECIFIED, Marcus
Aurel and Tom Reilly are close to the same shape, the same dense red, the same heavy concentric
ringing. Marcus's actual discriminator, per `final_gallery.py`'s own note on Tom Reilly, "hue cannot
tell his story," is real: Marcus wrote economics before politics, Tom never left politics, and that
should show as a colour band. At opacity 0.84 and ramp 0.60 it is there but faint, one shade lost in
fourteen dark rings. `live_palette.py` explains the size of the miss: the carousel Dan pointed to
measures median stroke lightness **L 0.725**. My own script measures SPECIFIED's Marcus Aurel at
**L 0.567**, Dolores Vance at 0.551, matching the darkness the reading test's readers were looking
at.

The fix is not a retraction, it is a correction of degree. The opacity floor was right to raise,
0.22 was too faint for the oldest history to read at all; the amount was wrong. Cutting ramp to 0.05
and opacity to 0.66, while raising `boundary_w` from 1.75 to 2.1 rather than softening it, does two
things at once: median L for the same three profiles moves to 0.63, 0.65, 0.64
(`model_fixes.py`'s sweep, and `MODEL-FIXES-CANDIDATE2.png` confirms it by eye), and Marcus's
economics band, no longer competing with a dark field, reads as a distinct pale olive streak against
Tom's uniform red. Lightening the field made the one discriminating signal louder, not weaker,
because era marking is a contrast-against-baseline effect: it was never going to win by getting
darker itself, only by the field around it getting lighter.

I do not reach L 0.725. `model_fixes.py`'s sweep tops out around 0.67 at ramp 0 before the
palette's own base lightness becomes the ceiling: the respaced twelve sit at L 0.500 even before any
depth ramp, chosen for 5.09:1 to 5.84:1 contrast against the page, and the carousel's palette is the
six axis hues at L 0.644, chosen for no such constraint. Reaching 0.725 with the territory palette
would mean giving up the contrast floor I set this morning. I would not make that trade; see
section 3.

What survives unchanged: halo masking to the exterior, ring count 14, cutting the redundant
stroke-weight channel, palette respacing as a *direction* (its specific hues are superseded by
section 3 below). What changes: the ramp and the flat opacity, specified above, and `boundary_w`,
raised rather than softened.

## 2. The heat false positive, resolved

Tested, not asserted. The mechanism the frame names is real and independently confirmed by
`ceiling.py`'s own "CAN YOU SEE HEAT" table: rendered roughness ranges only 0.48 to 1.04px across
seven people whose true turbulence ranges 0.000 to 0.265, and the middle scrambles, Wen Zhao's 0.025
rendering rougher than Dolores Vance's 0.101. `when_is_heat.py` finds the cause: the base noise's
amplitude is a fixed pixel budget, unscaled by the ring it sits on, so as a ring's own radius shrinks
toward the core, the same pixels become a larger and larger fraction of a smaller and smaller ring.
On Father Anselm, zero turbulence anywhere in his record, that ratio runs from 1.6% of radius at the
rim to **9.9% at the core**. On Dolores Vance it reaches 12.4%, on Marcus Aurel 19.4%, against real
heat signal at the same point of only 2.7% and 3.9%. The floor does not just invent heat on a calm
record, it drowns real heat on a turbulent one, by four to five times, at exactly the point, the
core, where the oldest and most-needed history lives.

The fix is one line, tested in `model_fixes.py`: scale the noise amplitude by the ring's local
radius **divided by that axis's own rim extent**, not by the canvas. At the rim this ratio is
exactly 1.0 for everyone by construction, so a new contributor's real texture is untouched; toward
the core it falls with depth, because depth is the only thing shrinking. Measured
after the fix: Anselm's core ratio falls from 9.9% to **1.3%**, Dolores's from 12.4% to 1.3% against
her real heat of 2.7% (now the larger of the two), Marcus's from 19.4% to 4.9% against his real 3.9%
(now comparable rather than swamped). I re-ran `ceiling.py`'s own rim-based ranking under the fix and
it is **unchanged**, 17 of 21 pairwise agreement both before and after, because the fix is exactly
1.0 at the rim, which is all that measurement touches. Nothing that already worked moves; the thing
that was broken, reading the core, is no longer swamped.

This is a false positive fix, not a timing fix, and I want the difference on the record.
`when_is_heat.py` shows Dolores's heat term at 0.92px at the rim and 0.26px at the core, so the
render always draws her heat as recent regardless of her true story, "arrived angry, calm now,"
because `tierMix` is one aggregate per axis with no time in it and the recency weight
(`0.3 + (1-depth)*0.7`) is the same curve for every contributor. The noise-ratio fix stops the core
from *lying about how rough it is*; it cannot make the core say *when* the roughness happened,
because that data does not exist yet. That is section 4's per-comment storage fix, and it is the
same data investment, not a second one.

## 3. Colour, against the live page

`colour-and-the-breach-curve` stands: pillar stays on angle, hue carries territory, and axis-on-hue
loses on the exact ground it was meant to win, territory 44% ahead of axis on the closest pair at
26px in normal vision. What I owe tonight is reading it against the four live captures, which I did.

`live-1` through `live-3` confirm `FINGERPRINT.md`'s own finding: the carousel runs the axis
fallback, six sectors in their own axis hue, thin, densely layered strokes, a nearly-neutral halo.
The carousel is beautiful, and not a colour target for a finished mark, because it renders no data:
`tierMix: {}` and `topicPhases: []` by construction, per the frame's own state table.
Its luminosity is bought by two things a data-carrying mark cannot fully keep: a palette picked with
no contrast floor, and a rendering density (many very thin strokes) that a legible, contrast-bearing
mark should not copy. `live-4`, the archetype cards, is the fairer comparison, because it already
runs territory colour laid down in time, exactly what I am proposing, and it looks nothing like the
carousel: richer, more saturated, core-to-rim bands 107 to 143 degrees apart. That is what a
finished, honest mark looks like, and it is closer to `MODEL-FIXES-CANDIDATE2.png` than to the
carousel.

So the ruling: territory on hue, reselected against the three dichromacies as
`colour-and-the-breach-curve` specifies (worst pair 0.0304 against my first respace's 0.0018), and
the interior treatment revised per section 1. Chase the archetype cards' honesty, not the carousel's
emptiness. The right fix for the carousel is not a colour change, it is `fingerprint-review`'s item
1, standing: give it real `tierMix` and `topicPhases`. The moment it does, it will look more like an
archetype card, and that comparison will stop being unfair in the carousel's favour.

## 4. One model

Five positions, and the throughline I did not name until tonight: **almost every failure traces to
rendering from a summary instead of from the events that produced it**, and every fix that worked
was the one that went back to the events.

The notch is what happens when six independently-computed aggregate radii get interpolated with no
floor under them. The trade-off penalty is a summary statistic editorialising, because six numbers
compete for nothing until code bolts competition on. Heat cannot say when it happened because
`tierMix` is one ratio per axis with no date in it. The season problem, 231 degrees of one colour
holding around a ring, was `topicPhases` stored as two coarse blocks instead of one row per comment;
storing it at per-comment grain and earning angular extent from the actual runs took the mean hold to
27 degrees, and that same fix is the one that would let heat carry a date too, because it is the same
missing column.

Where I tested a fix that used real per-comment grain, it won outright: the season fix, 27 degrees
against the ledger's own small-size field at 212. Where I patched the summary-level rendering without
touching the grain underneath it, the flat-opacity, deep-ramp interior, it measurably lost to doing
nothing, 81% against 90%.

That is the model. **The fingerprint is a per-comment ledger read through a polar coordinate system:
angle is the pillar a comment moved, radius is when, hue is the territory, and the texture of the
line is the shape of the engagement it was.** The container that reads it back can be a smoothed
silhouette or a literal scatter of marks; the reading test does not decisively prefer one, 21 of 21
for the ledger's dots against 19 of 21 for shipped's silhouette, a two-reader gap on 21 trials I
will not oversell. What the test does show decisively is that the silhouette **works**, holds shape
information well (94.8% of all pairwise pillar orderings survive it, `ceiling.py`), reads down to a
respectable size once level-of-detail merging is applied, and costs far less to fix than switching
containers: `where-a-season-stops`'s own fix needed "about thirty lines... no product decision,"
where the ledger needs the full event stream, closed to the anonymous key today, which is
`security`'s and `architect`'s heavier lift, not mine to spend for a container swap the evidence does
not demand.

One honest asymmetry I owe the ledger's design, because I built it and should not undersell it now
that I am recommending against switching to it wholesale: its tier-as-form vocabulary, a discrete
radial stroke for heat, placed at the comment that earned it, cannot produce a false positive the way
ambient noise can. It has no ambient channel to leak. The ring model's version of that same
problem needed a real fix, section 2, because a continuously-perturbed boundary is structurally
capable of lying in a way a scatter of real events is not. Keep the silhouette. Feed it from events,
not aggregates, the same way the scatter already is.

## 5. Dan's six properties

**No two the same.** Yes, strongly, on the geometry: 94.8% of pairwise pillar orderings survive the
render across 42 axis instances (`ceiling.py`). The honest caveat is `fingerprint-without-a-radar-chart`'s
own: six-fold symmetry is always present, so two people of similar tenure and similar spread will
resemble each other more than the metaphor promises. That is a property of any six-axis shape, ring
or ledger, and no colour or texture fix removes it.

**Personal identity.** Real, but the channel count is overstated. `FINGERPRINT.md` calls it seven
independent channels, none of them sharing. `final_gallery.py`'s own redundancy measurement puts
stroke weight and petal extent at Spearman 0.9465, the same signal twice, and section 2 shows the
base noise floor and the heat wave share a grammar closely enough that a stranger cannot tell them
apart. Five channels doing real, distinct work would serve identity better than seven claimed and two
quietly duplicated.

**The good, bad and ugly.** Good and bad render today. Ugly, Breach, has no shipped channel yet;
`colour-and-the-breach-curve` gives it one that does not collide with Stance or with
politics_governance's own red, attenuating rather than subtracting, floored at 7% rather than fading
to nothing. Standing, not re-argued here.

**Grows and can never be changed.** Mostly true, with two named violations. The trade-off penalty
makes other petals visibly retreat when a person earns on a paired axis, `monotone.py` catalogues
real shrink events from nothing but good work; that is not growth, it is the record editorialising,
and I would delete it, per `fingerprint-without-a-radar-chart`. The noise floor, before section 2's
fix, retroactively changed how *settled, unchanged* history reads, making a calm past look agitated
with no new data behind it. Both are violations of this property specifically, and both now have a
cheap fix on the table.

**Organic.** Yes, and correctly protected. The continuous asymmetric blend over six discrete wedges,
the walked ring phase instead of a spiral, the base noise texture itself: all of it stays. Section
2's fix does not remove the noise, it stops the noise from lying; rim texture is untouched by
construction, measured unchanged.

**Readable at a glance by someone who knows the mechanics.** Contested, and I want to sharpen what
"contested" means rather than average it into a single verdict. Comparative legibility, several
marks, matching, is strong everywhere at 330px, 81 to 100%. Dan's own sentence is not that task: "get
a feel for THIS user's communication style," one mark, cold. The one condition that tests
that, `single_mark_free_description`, scores 21 of 21 on being *matchable back*, and every single
free-text note reports heat, including for Father Anselm, zero heat anywhere, and Priya Raman,
turbulence 0.011. The mark passes the test that was run and fails the test Dan described, on the one
channel this section fixes. Organic and grows-but-never-changes pull against each other here: the
texture that makes a mark feel alive is the same texture that, unscaled, made stillness look like
temper.

## 6. Ranked build order

1. **Carry real data into the Hero Carousel.** `fingerprint-page-mount.jsx:23`, stop hardcoding
   `tierMix: {}` and `topicPhases: []`. Cheapest fix with the widest reach, every visitor's first
   fingerprint is currently fake.
2. **Raise the radius floor for 1+ graduations**, so an undeveloped axis reads as not-yet rather than
   wounded. Must land before item 6.
3. **Ratio-cap the noise floor** against each axis's own extent (section 2). One line per port
   (`turbulence_lab.py`, `gallery_probe.py`, `ring_layer_tuning.py`, and the `packages/core`
   equivalent), tested, does not disturb the rim ranking.
4. **Store `topicPhases` at per-comment grain; earn angular extent instead of granting it**
   (`where-a-season-stops`). The item that buys the most on this list: it is the same column
   that would let heat someday carry a date, and it is needed regardless of what happens to the
   silhouette.
5. **Give Breach its channel**: attenuating open ring, outward-biased, width fixed at the day's own
   radius, floor 7%, no hue inside the Stance to politics_governance arc
   (`colour-and-the-breach-curve`, standing).
6. **Territory on hue, reselected against the three dichromacies**; pillar stays on angle
   everywhere, carousel included, superseding this morning's first respace.
7. **Revise the interior treatment**: ramp toward colorDeep down from 0.60 to about 0.05, flat
   opacity down from 0.84 to about 0.65, `boundary_w` up from 1.75 toward 2.1 (section 1). Replaces
   the specific numbers in this morning's legibility ruling; the halo mask, ring count 14, and the
   cut stroke-weight channel from that ruling are unaffected and ship as filed.
8. **Fix the Builder and Empiricist hue collision** in the archetype grid; re-bake via
   `build-archetype-svgs.jsx`; caveat or dynamize the axis-colour legend so it stops teaching a
   mapping that expires on a contributor's first real comment.
9. **Longer term, bigger lift, prototype before committing:** compute the silhouette itself as a
   density envelope over per-comment marks, `ledger_render.py`'s own `envelope()` technique, rather
   than six interpolated, penalized radii. This is what would retire the trade-off penalty and the
   potential-ring tension structurally instead of by exemption, without giving up the container the
   evidence says is working. Sequenced last because items 1 through 8 are cheaper, already tested, and
   do not require it.

## 7. What Dan is missing

Not a channel, a question about which real use of the mark has to win first, and nobody, including
me until tonight, has asked it plainly. Dan's sentence describes one mark, cold, quickly: "get a feel
for this user's communication style." Almost every number in this debate, my own included until
section 2, answers a different question: can a mark be matched back to a description when several are
in front of you to compare. Those are not the same task, and the mark's performance is not the same
on both. At 330px, comparative reading is strong across every variant tried, 81 to 100%. Single-mark,
cold reading is where the heat false positive lives, and it lived there in every condition, because
nothing about comparing marks was ever what caused it or could have caught it: a reader alone with
one mark has no second mark to notice the wobble is universal.

If the platform's real usage is closer to a thread, several contributors' marks visible near each
other, comparative reading is already close to solved and the size problem `circulation` owns
matters more than anything in this document. If it is closer to a single profile page, a share card,
a moment where a reader meets exactly one mark with nothing beside it, section 2's fix is the one
that mattered most tonight, and it is also the one no amount of colour or spacing work would have
found, because it lives in a channel, texture, that only breaks the promise when there is nothing
else on the page to break it against. I do not know which use case is the platform's real one. Dan
does, and the ranked order in section 6 should be read against his answer, not against mine.

## Rebuttal

The rim evidence is the strongest point against me, and it holds. The ratio-cap is 1.0 at the rim
by construction, so it cannot touch a bug that lives entirely at the rim: the convener's own table
shows the floor exceeding the heat signal there for all seven people, and two of my three false
positives, Anselm and Wen Zhao, are rim reads. I built the ratio-cap for the core's balloon. The
rim never ballooned; it was loud on its own terms from the start. I mis-scoped the fix to the bug I
found first, not the bug the test found.

Tested, not asserted: the floor's flat +1.8 runs on purity, forum-share, not turbulence, so it
fires at full strength even at zero heat. Gating it to the same `turb` value the heat wave already
reads, `amp = (0.4 + turb*6.0) * depth_mult`, keeps a small constant for "never a clean curve" and
drops the rest to what a person did. `council/designer/research/rim_floor_fix.py`:
Anselm's rim floor falls from 1.31px to 0.25px, Wen Zhao's heat-to-floor ratio rises from 0.12 to
0.54, and Dolores's and Tom's real heat now exceeds its own floor for the first time, 0.56 to 1.80
and 0.42 to 1.61. Compose this with the ratio-cap; they fix different rings, and neither alone
reaches both.

Two concessions the evidence forces outright. ADR-004 bars a timer, and my Breach curve runs
`exp(-t/0.50)` on years: that is the clock it rules out. It has to become dilution against volume
earned since, not elapsed time. And builder is right on the carousel: ranking
`fingerprint-page-mount.jsx` first assumed a ship path that does not exist. Nothing in `apps/web`
imports that file, so it buys zero reach today, not the widest reach I ranked it for.
