# Fingerprint legibility

*designer position, 2026-09-20. Answers Dan's note on the six-profile gallery, and the convener's
five questions. Reads `docs/FINGERPRINT.md`, `packages/core/src/fingerprint-geometry.ts` and
`fingerprint-texture.ts`, `scripts/profile_gallery.py`, and my own
`2026-09-20-fingerprint-review.md`. Every number below came from a script under
`council/designer/research/`, listed at the end, and every claim has a render behind it.*

## Brief

Dan's blob is one layer. The resonance halo composites a blurred fill of the silhouette, so up to
0.68 of the topic hue floods the interior and the rings lose the light ground they are drawn on.
Mask it to the exterior and the same data reads as strata. Everything else follows from that. The
palette's crowding is real but second order: politics and law sit 9.8 degrees apart where even
spacing would be 30. Oxblood `#6A1818` is politics_governance's own deep colour at 0.1 degrees of
hue, so the Breach residual gets no hue at all. Ring count goes from 29 to 14, which is where
strokes stop merging. Three channels come out, one goes in.

## 1. The blob is the halo, and the fix is a mask

`profile_gallery.py:243` fills the silhouette polygon, blurs it, and composites the whole blurred
mask. A blurred fill is a fill with soft edges, so the interior receives the full tint and only the
fringe reads as a glow. Measured on Dolores Vance: mask alpha 212 of 255, composite multiplier 0.82,
peak tint **0.68 of the full topic hue over the entire interior**, blur sigma 15.9px at final scale.

`research/LAYER-PROBE.png` renders her four ways with identical rings. Rings alone read as a history:
rust core, violet rim, countable strata. Add the halo and the ground goes mid-dark in the same hue as
half the rings, and figure and ground collapse into each other. No other layer does this, and nothing
else needed changing to see it.

**Specified.** Subtract the silhouette from the blurred mask and composite only the difference. Peak
**0.40** of the topic hue, blur sigma **0.356 x ringRadius** scaled by `resonance ** 0.7`. Resonance
then means what the word says, which is what the work throws past its own boundary.

**Cut the centre glow entirely.** A 48 of 255 cream flood at `0.5 x ringRadius` lowers contrast in
the core, which is where the oldest history lives and where the value ramp below needs its darkest
value to land.

## 2. What carries the story when hue cannot

Value, and the count of eras. Both were already in the file and neither was being spent.

The engine ramps **opacity** inward, 0.95 at the silhouette down to 0.22 in the interior
(`profile_gallery.py:264-270`). That fades the oldest history into the background, so the part of the
story a reader most needs is the faintest thing in the picture. The ramp runs backwards.

**Specified.** Flat opacity **0.84** on every ring, **0.95** on the silhouette. Replace the opacity
ramp with a radial value ramp on the colour itself, `mix(color, colorDeep, depth * 0.60)`, where
`depth` is 0 at the rim and 1 at the core. Oldest material renders deepest, which is what a cut
surface looks like and what the rings already claim to be.

**Mark the era boundaries.** The outermost ring of each topic phase draws in `colorDeep` at **1.75x**
weight. On Dolores this converts an invisible gradient into three countable events, and on Wen Zhao
it separates her science years from her philosophy years at a glance. `research/RING-LAYER-TUNING.png`
columns C against D is that change alone.

**Rejecting purity on opacity.** Purity already drives saturation and base noise amplitude. A third
job would render low-purity contributors faint, and a faint person is a shame-read that
`Dialecta_Tier_Psychology.md` spent real effort avoiding at the naming layer.

## 3. The palette, and what to do about it

Application first, and then a repair worth doing.

Measured in OKLCH, the twelve topic colours occupy a lightness band of 0.239 and a chroma band of
0.087, and every one of them is chromatic. Three pairs sit inside 18 degrees of hue where even
spacing would be 30, and one 67 degree arc is empty:

| pair | gap now |
| --- | --- |
| politics_governance to law_justice | 9.8 |
| history to economics | 12.8 |
| science_technology to philosophy_ethics | 17.9 |
| economics to environment_energy | 67.1 |

That third row is the Builder and Empiricist collision from my item 6, arriving from the other
direction. A blanket respace rotates colours out of family, which I tried and rejected
(`research/palette_respace.py` prints it). Five of the twelve move instead, none out of family, and
every base lands at L 0.500 with every deep at L 0.295 so the value ramp is the same 0.205 drop on
every topic rather than varying from 0.139 to 0.245. Contrast against the page then clusters 5.09:1
to 5.84:1 instead of spanning 3.23:1 to 8.96:1.

```
"politics_governance":   ("#ad302c", "#521212")    H  26.5  unmoved
"law_justice":           ("#a43f00", "#4d1b00")    H  45.0  moved +8.8
"history":               ("#8d5400", "#412600")    H  68.0  moved +9.0
"economics":             ("#766200", "#362c00")    H  95.0  moved +23.3
"environment_energy":    ("#4c7100", "#213300")    H 128.0  moved -10.8
"health_medicine":       ("#227454", "#093525")    H 163.1  unmoved
"psychology_behavior":   ("#236e7e", "#0b323a")    H 214.9  unmoved
"science_technology":    ("#0066ad", "#00304a")    H 248.0  moved -13.7
"philosophy_ethics":     ("#5658ab", "#262750")    H 279.6  unmoved
"arts_humanities":       ("#7747a8", "#3a1d4d")    H 304.0  unmoved
"theology_spirituality": ("#8d3d93", "#411945")    H 324.9  unmoved
"society_culture":       ("#9d3a68", "#491930")    H 354.3  unmoved
```

Smallest gap 9.8 to 18.5, largest 67.1 to 51.8. `research/PALETTE-CHECK.png` shows what it buys:
Wen Zhao's two eras separate, where the current palette renders both as the same navy.

**The halo hue is the second shared channel.** It reads `dominantTopic`, the same input as most of
the rings, and it covers the larger area, so a one-territory contributor gets the same hue twice.
Pull it **60% toward `#c8b89e`**. `research/HALO-HUE.png` compares all three settings with ring
colour held identical: full topic hue leaves the halo the loudest thing in the tile, fully neutral
throws away the only hue that survives downscaling. At 60% the halo separates warm territories from
cool ones at avatar size and stops competing at profile size, which revises my item 7 rather than
contradicting it. Twelve territories were never going to survive that scale.

## 4. The Breach residual has no colour

ADR-004's oxblood is measurably politics_governance's own deep colour.

| | L | C | H |
| --- | --- | --- | --- |
| Breach badge `#6A1818` | 0.350 | 0.115 | 25.5 |
| politics_governance deep `#501010` | 0.288 | 0.095 | 25.4 |

**0.1 degrees of hue apart.** Nine values now live in the arc from 25.4 to 37.9: both politics
colours, both law_justice colours, both Stance badge colours, Stance's halo tint, and both Breach
badge colours. Marcus Aurel renders red in the gallery with no breach behind him, and Tom Reilly
would render red for twenty years of writing about one subject. Painting a breach in that arc marks
the innocent case and the guilty one the same way.

Ink does not rescue it either. `#1C1814` against philosophy_ethics deep `#1c1c44` is 1.09:1, so an
achromatic residual disappears on a philosopher and shouts on an economist.

**So the residual carries no hue.** A Breach earns nothing on any axis (Universal Rule 1, zero events
on all six), so it has no angle, which rules out a sector. It has a date, and ring index is the date
channel. **The residual is one ring, and it is the only ring in the system that does not close.**

`fingerprint-texture.ts` made every noise frequency a whole number so the field closes exactly, worst
residual 6.6e-14. That work is what makes a deliberately open ring read as a signal rather than the
seam it replaced. Values: the breach ring draws in its own ring colour at the era-boundary weight of
1.75x, broken into arcs with a gap fraction starting at **0.55** of the perimeter and closing as
`max(0.10, 0.55 * (1 - ringsOutside / 14))`, with the `outward` wave mode already in
`turbulence_lab.py` applied to that ring alone at **0.034 x ringRadius**, so the arc ends flare out
rather than oscillating through the centreline. It heals to a hairline and never to nothing, which is
the dilution the ADR asked for with a defined floor.

Three grammars, three meanings, none borrowing another's shape: inward dent for an undeveloped axis,
symmetric swell for Heat and Stance, an open ring for a Breach.

## 5. Ring count

29 is wrong, and the reason is arithmetic rather than taste. Measured on Dolores at a 122px radius:

| rings | nominal spacing | worst gap on the perimeter | perimeter under 1.5px |
| --- | --- | --- | --- |
| 29, as shipped | 3.70px | 0.21px | 4.7% |
| 22 | 4.93px | 1.10px | 0.5% |
| 18 | 6.09px | 1.90px | 0% |
| 14 | 7.97px | 3.18px | 0% |
| 12 | 9.42px | 4.16px | 0% |

Base noise runs to plus or minus 5.53px on her Discourse axis and the turbulence wave to plus or
minus 9.82px, against a 2.48px gap. The perturbation is larger than the space it has to move in, so
29 strokes at 0.22 to 0.55 opacity accumulate into a field.

**Specified.** `ringCount = clamp(round(maxGraduations * 0.6) + 2, 3, 14)`. A newcomer at 4
graduations gets 4 rings instead of 9, which is more honest, and a veteran gets 14 with 2.03px of
clear ground at the worst point on the perimeter once the stroke is flat at 1.15px.

Rings then resample the whole history rather than taking the last 22 of it: ring `k` reads phase
`round((1 - depth) * (len(phases) - 1))`. Band width becomes share of history, which holds its
meaning at every age and is a better answer to FINGERPRINT.md's open question about growth past
graduation 29 than any exponent would be. Ring count stops pretending to carry volume, and the
proportions of a career carry instead.

## 6. What comes out

Three channels leave, one arrives.

**Stroke weight by `localStrength` duplicates petal extent.** Both are monotone functions of
graduations at that angle, separated only by the trade-off factor, which spans 0.70 to 1.00. Spearman
rank correlation across the 42 axis instances in the gallery: **0.9465**. FINGERPRINT.md lists them as
two of seven channels "none of them sharing," and they share. Cutting it to a flat 1.15px buys back
the ring separability the table above needs.

**The interior opacity ramp.** Covered in section 2. It fades the oldest history.

**The centre glow.** Covered in section 1.

**The halo's hue, 60% of it.** Covered in section 3, and the same redundancy as the first cut.

The arrival is the era boundary, which costs one stroke weight and one colour lookup per ring.

## What this does not fix, and now shows more

Removing the flood raised the notch from a visible feature to the most salient one on three of the
seven profiles. Wen Zhao, Tom Reilly and Marcus Aurel each read as two lobes joined at a cleft in
`research/SPECIFIED-GALLERY.png`. The flood was hiding an uncorrected default, so **my item 2, the
radius floor, moves from second to first** and has to land before any of this ships to a contributor.
Nothing here changes my ordering otherwise, and item 4's residual still sequences after it.

Two things to check before landing rather than after. Calm, broad profiles like Father Anselm and
Priya Raman read paler than the turbulent ones at flat 0.84; render them at 0.90 and pick. And the
whole specification is tuned at a 118 to 122px ring radius, so every pixel value above is also given
as a fraction of `ringRadius` and should be carried that way into the port.

## Scripts

`council/designer/research/`: `layer_probe.py` (which layer is the blob),
`palette_and_spacing.py` (OKLCH audit, ring crossings), `legibility_variants.py` (one change at a
time), `ring_layer_tuning.py` (five ring-layer settings), `halo_hue.py` (three halo treatments),
`palette_respace.py` (the blanket respace I rejected), `final_gallery.py` (before and after, plus the
redundancy measurement), `palette_check.py` and `specified_gallery.py`. Renders sit beside them.
`gallery_probe.py` is an untouched copy of `scripts/profile_gallery.py`, imported for its palette and
profiles.
