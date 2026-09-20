# Fingerprint review

*designer position, 2026-09-20. Reads the live page, `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx`
in full, the dated `components/dialecta-fingerprint.jsx` + `dialecta-fingerprint-engine.jsx` pair,
Contributor Identity, Axis Mapping, ADR-004, this morning's own recovered-source read, all 17
rendered examples (3 live, 14 baked at `docs/fingerprint-examples/`), and `philosopher`'s
`2026-09-20-fingerprint-review.md`. Revised once against the fourteen baked examples and the
engine's own axis-table comment, at the coordinator's direction, before filing.*

## Brief

Revised after new evidence: fourteen baked examples, plus the engine's own comment settling colour
exactly as I'd already found it: hue is topic first, axis colour a documented fallback. Two things
move. The notch is real and recurring, visible in the Emerging stage and the Illuminator archetype,
and philosopher is right that no spec chose it: it's the geometry's uncorrected default, not a
decision. That default now sits directly under ADR-004's own residual. Fix the notch before the
residual ships, or a deliberate wound lands beside an accidental one and both read as damage. Two
more from the contact sheet: Builder and Empiricist collide on hue, and Calm/Turbulent's texture is
a full-size signal, not an avatar one.

## Which file is live

`_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` (910 lines), not the 2,595-line dated
pair, and the engine's own comments now settle it outright rather than leaving it to cross-file
inference. Line 48 carries `breach: { gradTop: "#6A1818", gradBot: "#380808", border: "#200404",
text: "#F0C8C8" }`. Lines 56-58, directly above the axis table: "color, fallback hue (used for seed
dots, legends, and as fallback when topic history is missing; NOT used for active ring rendering
since rings now color by topic history instead)." Lines 62-66 name the rename outright: "Axis names
follow the canonical Six Pillars... Renamed in engine v2.0.0: specificity → acuity, charity →
magnanimity, originality → reach." That last one is the same conclusion I reached this morning by
comparing this file's axis keys against the dated pair's `specificity`/`charity`/`originality`; the
engine just says it directly. Citations below are to this file unless marked dated.

## 1. Legibility

Legible where the page built scaffolding for it, confirmed now by the renders themselves. Degraded
in two ways the code predicts and the images show.

**What works, visually confirmed.** The Mature stage example (`fp-stage-mature.png`) is the clearest
evidence in this review that the design does what Contributor Identity claims: a visible rust-orange
band at the outer rings gives way to teal-blue at the core, exactly "inner rings show old topic
history, outer rings show recent" rendered, not just specified. That is real data flowing through
the real mechanism, and it is good. I would not have been able to assert this from code alone;
seeing it is what makes it a fact rather than a hope.

**The legend teaches a mapping that expires**, now citable directly rather than inferred: `color` is
"fallback hue... NOT used for active ring rendering since rings now color by topic history instead"
(`:56-58`). The Six Axes legend's colored dot next to "Acuity" teaches gold-means-Acuity as a fixed
key. The first real comment a contributor writes on that axis recolors its rings to whatever topic
they wrote about. A reader who studied the legend and then looks at a mature fingerprint is holding
a key that no longer opens the lock.

**The Hero Carousel can't demonstrate the thing the page is about.** `fingerprint-page-mount.jsx:23-33`
builds every axis as `{ graduations, tierMix: {}, topicPhases: [] }` regardless of what the real
profile contains. Zero turbulence, zero topic color, by construction, in the first fingerprint every
visitor sees.

**New, from the archetype grid: two of eight collide on hue.** `fp-arch-builder.png` and
`fp-arch-empiricist.png`, viewed at their full 400px bake, both glow the same green halo. Shape
differs (Builder reads as a tighter kidney bend, Empiricist rounder) but the archetype grid's own
job is letting someone place themselves among eight distinct patterns, and its most salient property,
the halo hue that reads before anyone studies the contour, doesn't separate these two. That is a
real legibility failure in the one section built specifically to teach "eight different shapes."
Fix is either in the engine's topic-to-color assignment or in the two archetypes' underlying demo
data (`dialecta-archetype-grid.jsx`) landing them on adjacent-hue topics; either way it needs a
re-bake through `build-archetype-svgs.jsx` once resolved.

## 2. The notch, and where it meets the residual

Mechanically settled first, unchanged from this morning. Each axis gets its own ceiling
(`maxR * (min(graduations,22)/22)^0.85`, `RADIUS_POWER = 0.85` at `:132`), floored near zero
(`maxR * 0.04`, `MIN_AXIS_RADIUS_FACTOR` at `:133`, applied at `:451`). Six of these independent
radii are woven into one closed Catmull-Rom path with `smoothstep` blending between neighbors, with
no shared baseline circle underneath. A low axis doesn't grow a shorter petal, it pulls the boundary
in past where a neutral circle would sit.

This is no longer a claim read out of the interpolation math alone. `fp-stage-emerging.png` (~50
comments) shows one clear inward bite low on the shape. `fp-arch-illuminator.png` shows the same
thing more strongly: a heart-shaped cleft at its weak axis deep enough that the silhouette reads as
two lobes rather than one blob with a soft spot. The notch is real, recurring, and visible at
ordinary, non-extreme graduation counts, not a hypothetical from reading the code.

**philosopher's read of this** (`council/philosopher/positions/2026-09-20-fingerprint-review.md`,
position 2) is the missing half of my own: "no spec chose concavity as meaningful, it's what a
radar chart does to a low value by default." That's exactly what the code confirms: nobody wrote
`if (weak) renderAsWound()`. It's an uncorrected side effect of an interpolation choice made for
other reasons (the organic, non-radar-chart silhouette I still think is right, see below). Agreed
without reservation. Where I'd add the mechanical half philosopher didn't have: the specific place
the curve is steepest, `RADIUS_POWER = 0.85` off a `0.04` floor, is the low-but-nonzero range, not
true zero. The render is gentlest exactly where a wound reading costs nothing (never touched, where
flatness is fine) and sharpest exactly where "developing" is the honest word and "wound" isn't.

**philosopher also asked, position 5, that I resolve this alongside ADR-004's residual in one pass
rather than shipping both separately.** Here's why that's not just tidy sequencing but load-bearing.
ADR-004 wants a *deliberate* wound-signal: spiked variation plus oxblood, meaning "this history
contains a breach." The notch is an *accidental* one already sitting on the shape: any low axis, no
breach required. Ship the residual onto the current geometry and a viewer has no way to tell an
ordinary low-Discourse notch from a breach-flavored one. Both are "the boundary caves in here."
philosopher's phrase is exact: a shape hurt twice, only once on purpose.

**The fix is sequencing plus one shape decision, not two separate patches.** Do the notch repair
from Q2 first (raise the floor for 1+ graduations so early stops bordering on never), which clears
the accidental-wound reading off the table. Then give the residual a texture that is structurally
different from a notch rather than a more extreme version of one. Today's `turbulenceWave()` sums
three sine waves centered on zero, so heat/stance turbulence already moves the boundary both inward
and outward as it oscillates. A residual built the same way just reads as more turbulence. Bias it
instead: rectify the wave, or offset it positive, so breach's signature spikes outward predominantly
rather than oscillating through the centerline. Three grammars, three meanings, none reusing
another's shape: inward dent (still a default worth fixing, but means "undeveloped" once fixed),
symmetric wave (heat/stance, "struggled but arrived"), outward-biased spike (breach, "something was
cut out here, not merely absent"). That's a few lines against `turbulenceWave`, not new
architecture, and it only means something once the notch it sits beside stops meaning the same
thing by accident.

## 3. Colour, tier_mix, and breach

Confirmed, not revised: hue's primary job is topic, not axis, and I had this right before the
coordinator's note landed. What I'm sharpening is how crowded that channel already is, now with a
third occupant I hadn't weighed.

Purity, turbulence, and clarity (`:175-177`, `forum/total`, `(heat+stance)/total`,
`forum/(forum+echo+fog)`) are the primary carriers of tier history, and two of the three are pure
geometry. Only purity touches color, and only as saturation on a hue set by topic. tier_mix's
narrower, secondary hue claim lives entirely in the resonance halo: `dominantTopic` (`:610-627`)
sets the base, then the inner bleed is tinted toward fog-gray `#8a8680`, heat-orange `#c45818`, or
stance-red `#6a1010` by aggregate ratio (`:658-660`), with Heat and Stance weighted non-linearly
because, per the engine's own comment, "a little Heat goes a long way visually" (`:654-656`).

Three things already read reddish before breach enters the picture, and I only had one of them this
morning. Stance's live tint target, `#6a1010`. Stance's own tier badge, `#A8483C`/`#783028`
(`:47`), sitting one rung below Breach's `#6A1818`/`#380808`/`#200404` (`:48`) on a ladder that's
supposed to look adjacent rung to rung. And now a third, from topic history alone: the Advocate
archetype's halo (`fp-arch-advocate.png`, confirmed rust-red-orange at full size) runs on
`political_science`, `color: "#a01f1f"` in the topic palette, with no breach or stance behind it at
all, purely because that's the subject the contributor writes about. A viewer who's learned "red
means trouble" from one of the first two will misread the third, and a breach residual painted into
any of this family adds a fourth reddish reason with the highest stakes and the least room.

Resolve it by channel, not by hue-picking, and this is now the same recommendation as Q2's:
breach's primary signal is the outward-biased turbulence band, axis-agnostic because a breach
comment lands on no axis at all (Universal Rule 1, `Dialecta_Axis_Mapping_v1.md:30`, zero events on
all six). If a color accent is used alongside it, keep it small and local, not another wash on the
halo, and keep it outside the whole neighborhood now on the table: `#5a1010` to `#A8483C` to
`#6A1818`. That range is where Stance's tint, Stance's badge, and Breach's own badge already live;
adding a fourth value inside it relocates a confusability the codebase already has (Stance/Breach
under color-vision deficiency, flagged in my own D-13) rather than resolving it.

## 4. Texture at scale: calm versus turbulent

Ruling on it directly, since it's a real, checkable question and not a matter of taste.

At the size these are actually baked and shown, 400px for the archetype grid, 200-380px for the live
Hero Carousel (`fingerprint-page-mount.jsx:153`), the difference is genuinely visible.
`fp-texture-calm.png` and `fp-texture-turbulent.png`, viewed full-size, show an unambiguous contrast:
Calm's boundary is a gentle, rounded undulation; Turbulent's is a distinctly jagged, many-pointed
edge closer to a gear or a flower than a blob. Side by side at this scale, nobody would call these
the same shape.

Whether it survives smaller is a different question, and the mechanism answers it before any test
render would need to. `turbulenceWave()`'s frequency runs `3 + turbulence * 8`, up to eleven cycles
around the perimeter, at an amplitude of a few pixels at 400px. That's a spatial-frequency signal:
fine, repeating, small-amplitude detail, the exact category that anti-aliasing and downscaling erode
fastest, unlike a hue difference (a broad-area property that survives scaling well) or an overall
silhouette elongation (a low-frequency property that does too). Turning up amplitude to compensate
would fight Calm's own promise, "crisp lines," "confident bloom," by making the calm case spikier by
default just so the turbulent case still reads small. That's fixing a scale problem by breaking the
baseline it's being compared against.

My answer: this is not an avatar-scale signal, and it shouldn't be asked to become one. It's a
profile-page signal, which is the only scale the codebase currently renders it at. If a smaller
rendering is ever wanted (a contributor list row, a small badge), don't carry texture there at all;
carry hue, which does survive, and let texture stay something you see when you're looking at one
person's fingerprint on purpose.

## 5. The reference circle

Unchanged in substance from this morning, and worth flagging as a place where philosopher and I read
the same object two different ways from two different kinds of evidence, which the Council should
see rather than have smoothed over. philosopher's position 3 finds the ring earns its "potential"
framing: named that way from onboarding copy at zero comments, equidistant from everyone, "horizon,
not ceiling." That's a reading of the copy and the experience, and I don't dispute it as far as it
goes.

My finding is mechanical and sits underneath theirs: `showGuideRing` draws the dashed circle at
`r={maxR}` (`:702-705`, comment: "the 'potential' ring"), and `maxR` is not an arbitrary canvas
edge. Every axis is computed as `Math.min(graduations, 22)` before anything else happens to it
(`:158,163,301,310`). Past 22 on any axis, the only channel a viewer can judge by eye stops moving.
Axis Mapping's own scoring rule says graduations count forever, no ceiling stated. So the copy calls
it a horizon and the render math makes it a reachable, defined ceiling at a specific number. Both
readings are correct about what they're each looking at; they disagree because the promise and the
implementation disagree with each other. philosopher reasoned from the text a newborn sees. I
reasoned from what happens to a veteran's 23rd graduation. Dan should have both, not one smoothed
into the other.

Fix at the root: drop the `Math.min(x, 22)` clamp, let the same `Math.pow(t, RADIUS_POWER)` curve
run against an uncapped, saturating ratio instead. Then the copy and the math agree, and the ring
keeps its legitimate second job, giving a small fingerprint something to sit inside, without also
quietly capping a veteran's growth.

## 6. What's good as it is

Yes, at the level hardest to get right: the metaphor, and the renders make the case better than the
code alone did this morning.

One continuous, asymmetric, Catmull-Rom silhouette from six independently-earned petals, over six
discrete, unblended wedges. The discrete version is the obvious build and would read as
computed-at-a-glance, the opposite of "unfakeable." I wouldn't trade it, and `fp-stage-mature.png`'s
inner-to-outer topic banding is the proof this pays off: that texture is only possible because the
shape is one continuous surface with a time axis running through its depth, not six independent bar
heights.

Tier history as geometry before color: turbulence and clarity are the right carriers, confirmed at
full size in section 4. Hue spent on topic before axis: confirmed the same way, and it's a better
answer to "what does this person think about" than a fixed six-color key would be, even accounting
for the Builder/Empiricist collision, which is a data problem inside a good design decision, not a
reason to reverse the decision.

What isn't good as it is, now including what the images added: the notch is a real, recurring,
uncorrected default sitting exactly where ADR-004 wants to place a deliberate one, the reference
ring's copy and its math disagree with each other, two of eight archetypes share a hue, and breach
has three existing reasons a fingerprint already reads red before it adds a fourth. None of these
require rethinking what the fingerprint is. All of them are finishing work philosopher and I now
agree points the same direction: designer resolves the notch and the residual together, in that
order, before either ships wider.

## The changes, in order

1. `fingerprint-page-mount.jsx:23-33`, carry real `tierMix` and `topicPhases` into the Hero Carousel
   instead of hardcoding them empty.
2. Raise the radius floor for 1+ graduations above the true-zero floor, so early and never stop
   reading as the same thing. Do this before item 4.
3. Drop the `Math.min(graduations, 22)` clamp; let axis radius approach `maxR` asymptotically so the
   render agrees with the "potential" framing the copy already gives it.
4. Give breach an outward-biased turbulence band, distinct from heat/stance's symmetric wave,
   axis-agnostic per the ADR's own request. Any color accent stays outside `#5a1010`-`#A8483C`-`#6A1818`.
   Sequenced after item 2, or the residual lands on a shape that's already dented by accident.
5. Caveat or dynamize the Six Axes legend's color dots so they stop teaching a mapping the render
   itself only honors until a contributor's first comment.
6. Separate Builder and Empiricist onto distinguishable hues, in the engine's topic-color assignment
   or the two archetypes' demo data, and re-bake via `build-archetype-svgs.jsx`.
7. Treat ring texture as a profile-page signal. Don't chase Calm/Turbulent legibility at smaller
   sizes with more amplitude; carry hue instead if a smaller rendering is ever needed.
