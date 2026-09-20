# The Thinking Fingerprint

*Written 2026-09-20 from the live page, the engine source and the baked assets. The page footer
dates the system `THINKING FINGERPRINT · V1 · APRIL 2026` and the engine calls itself v2.0.0.*

The fingerprint is the most finished thing in this project and the least written down. Before
today the repository held two prototype files and an ADR that had to correct itself twice for
assuming the visual language did not exist. It does exist, it is documented in its own source
comments better than anywhere else, and this file is where that stops being true only in code.

## Where every piece lives

| Piece | Path | Note |
| --- | --- | --- |
| The renderer, newest | `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx` | 44,967 bytes. Quarantine: read and cite, promote nothing blind |
| The renderer, older | `components/dialecta-fingerprint-engine.jsx` | 34,906 bytes. A dated snapshot, not the source of anything |
| The prototype page | `components/dialecta-fingerprint.jsx` | 123,010 bytes |
| The live page template | `_theme/page-fingerprint.hbs` | What `dialecta.org/fingerprint/` serves today |
| The asset baker | `_theme/scripts/build-archetype-svgs.jsx` | Renders the examples at build time. Compiled output dated May 9 |
| The examples | `docs/fingerprint-examples/` | 14 PNGs plus `ALL-EXAMPLES.png`, a labelled contact sheet |
| The axis contract | `packages/core/src/axis-mapping.ts` | Ported 2026-09-20, all six axes, 54 tests |
| The Breach residual decision | `docs/decisions/ADR-004-breach-residuals-on-the-fingerprint.md` | Decided, unbuilt |

The three contributor fingerprints on the page (Maya Reiss, Wen Zhao, Father Anselm Okafor) render
live from the engine and are not baked, so they are not in `fingerprint-examples/`.

## The six axes

Angles are degrees clockwise from the top. Renamed in engine v2.0.0 to match the Six Pillars in
the v1.1 Contributor Identity spec: specificity became acuity, charity became magnanimity,
originality became reach.

| Axis | Angle | Pair | Fallback hue | Measures |
| --- | --- | --- | --- | --- |
| Acuity | 0, top | Substance | `#d49415` | How precise and claimable the points tend to be |
| Calibration | 60 | Intellectual Honesty | `#2674d4` | How well confidence matches the strength of evidence |
| Magnanimity | 120 | Intellectual Honesty | `#3aa564` | How faithfully opposing views are represented first |
| Discourse | 180, bottom | Engagement | `#dc5418` | Sustained back and forth rather than hit and run |
| Consistency | 240 | Engagement | `#b8429a` | How regularly the contributor shows up |
| Reach | 300 | Substance | `#a8a020` | How many distinct topic areas |

Each axis carries `{ graduations: 0-20, tierMix }`. Graduations are rings earned. The `tierMix` is
a per-tier comment count on that axis.

## What the render encodes, channel by channel

This is the part that was nowhere in the docs. Seven independent channels, each carrying one
signal, none of them sharing.

| Channel | Input | Source |
| --- | --- | --- |
| Petal extent | `graduations` per axis | The shape itself |
| Ring hue | Topic history, laid down outward in time | Lines 50 to 66, 212 onward |
| Saturation | `purity = forum / total` | Line 175 |
| Wave amplitude and frequency | `turbulence = (heat + stance) / total` | Line 176 |
| Line crispness | `clarity = forum / (forum + echo + fog)` | Line 177 |
| Halo throw and opacity | `resonance`, 0 to 1 | Lines 604 to 676 |
| Halo hue | `dominantTopic` | Line 626 |

**Hue is not axis identity.** The engine says so in its own comment on the axis table: `color` is a
fallback used for seed dots, legends, and when topic history is missing, and is explicitly not used
for active ring rendering. The six coloured dots on the Newborn example are that fallback showing
through, because a contributor with zero comments has no topic history to colour with.

**Rings read outward as forward in time.** The Mature example runs blue at the core through teal to
rust at the rim because its contributor wrote about anxiety first, clinical psychology next, and
philosophy last. Reading a fingerprint from the centre out is reading a career in order.

**Concavity is not a designed signal.** A petal pulled in past its neighbours is what radar geometry
does to a low value. Nothing in any spec chose it. `philosopher` holds that it reads as a wound
before a viewer parses which axis caused it, which is the shame-read `Dialecta_Tier_Psychology.md`
spent real effort avoiding at the naming layer and never examined at the shape layer.

**The dotted circle is a horizon, not a ceiling.** The code labels it "the potential ring" and the
Newborn copy calls it "the potential of who you could become." It is unreachable on purpose: the
page states that Acuity trades against Reach and Discourse trades against Calibration and
Magnanimity, so "the trade-offs make a true circle structurally impossible and force every
fingerprint into a real shape."

`philosopher` and `designer` disagree about whether that is honest, and the disagreement is real
rather than an error. `philosopher` judges the ring by what it signifies, and finds it earns its
claim: it sits equidistant from every contributor and reads as horizon rather than reproach.
`designer` judges whether the copy matches the render math, and finds the engine normalises every
axis on 22 (lines 158, 163, 276, 287) while the documented data range is 0 to 20, so a contributor
with no trade-off penalty at all still falls short by construction. Both hold on their own axis.
What separates them is whether an unreachable potential reads as encouragement, which is Dan's call.

## The three live fingerprints run on the fallback

`_recovered-next/lib/theme/fingerprint-page-mount.jsx` line 23, `axisScoresToFingerprintData`, keeps
`graduations` and discards everything else: every axis is handed `tierMix: {}` and
`topicPhases: []`. An empty `tierMix` derives to purity 1, turbulence 0 and clarity 1, so the shape
renders perfectly smooth, fully saturated and crisp no matter what history sits behind it. An empty
`topicPhases` falls back to axis colour.

Its only caller is line 113, the contributor carousel. **All three fingerprints the page renders
live are therefore missing two of the system's channels**, and section 01 invites a comparison
between three examples that cannot show what the rest of the page goes on to explain. The 14 baked
examples are the only ones on the page demonstrating the real system.

This is also how the convener misread the system earlier on 2026-09-20: zoomed the hero, saw hue
varying by angle, and briefed two seats that colour was axis identity. The observation was right
and the inference was wrong, because the one fingerprint being looked at was the one running on the
fallback.

## Breach has no channel, and cannot borrow one

Breach appears exactly once in the engine, in the tier colour table at line 48, and no render path
reads it. ADR-004 reasoned that `tier_mix` could not carry a Breach residual because a Breach earns
nothing and therefore never enters the mix. The code confirms it, and adds a sharper reason.

`total` is a literal sum of six named tiers: forum, spark, echo, fog, heat, stance. Breach is not a
term in it. **Adding Breach as a seventh key would inflate the denominator of all three derived
metrics**, so every contributor with a breach in their history would silently lose saturation,
turbulence and clarity across the board. The residual has to live outside `tierMix`, as its own
input, not as an extra key inside it.

### The collision ADR-004 does not know about

ADR-004 assigns the residual two signals, spiked variation in the line and oxblood. Both are taken,
and taken by the two tiers nearest Breach in meaning.

| ADR-004 proposes | Already means |
| --- | --- |
| Spiked variation in the line | `turbulence`, which is Heat plus Stance |
| Oxblood `#6A1818` | Stance's own `#A8483C` and `#783028`. Topic history also produces rust on its own: the Advocate archetype renders that way with no breach behind it |

As specced, a Breach residual would be confusable with an ordinary heated contributor on both
channels at once, and the confusion runs both directions. `designer` owns resolving it, in one pass
with the notch, per `philosopher`'s request.

## The seventeen examples

Four growth stages of one contributor, eight archetypes, two texture states, three live
contributors. Contact sheet: `docs/fingerprint-examples/ALL-EXAMPLES.png`.

**Stages.** Newborn at 0 comments is six seed dots inside the potential ring. Early at about 5 is a
small jagged navy star with a gold core, and the page's own copy says Discourse already carries
Heat. Emerging at about 50 has softened into a lumpy contoured blob where, in the page's words, old
Heat persists at the centre while the outer rings calm. Mature at 200 or more is a full asymmetric
form carrying three eras of topic colour.

The Emerging and Mature copy describe a residual that dilutes as the shape grows, which is exactly
the mechanic ADR-004 proposes for Breach. **It is already built and already shipping, for Heat.**
The ADR is extending a working system rather than inventing one, which is a stronger position than
the ADR claims for itself.

**Archetypes.** Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator,
Reviser. Each takes a distinct global hue from its dominant territory and a distinct silhouette.
Two problems visible only when they are seen together: Builder and Empiricist are near-identical
greens, and Illuminator is the only one of the eight with the deep bottom notch, so the curated set
does not show the concavity the real renders produce.

**Texture.** Calm Waters against Turbulent Waters, described as the confident path against the
climbed path, same shape and different history. At contact-sheet size the two are nearly
indistinguishable. The pair is the page's argument that texture remembers, and at profile scale
that argument does not currently survive.

## Open

| | Owner |
| --- | --- |
| The Breach residual's channel, given that both proposed ones are taken | `designer` |
| Whether the notch reads as a wound, resolved together with the residual and before it ships | `designer` |
| The contributor carousel discarding `tierMix` and `topicPhases` | `builder` |
| The axis-colour legend teaching a mapping the engine calls a fallback | `designer` |
| Builder and Empiricist sharing a green | `designer` |
| Turbulence being a full-size signal rather than an avatar-scale one | `designer` |
| Whether an unreachable potential ring reads as encouragement | Dan |
| P-11, no contest path for a rendered characterisation | `philosopher`, `legal` |
| Re-baking the examples after any change | `build-archetype-svgs.jsx` exists for this |

`designer` filed seven ordered changes in
`council/designer/positions/2026-09-20-fingerprint-review.md`. Both seats answered Dan's question
the same way: good as it is at the level hardest to get right, and what remains is finishing work
rather than a rebuild.
