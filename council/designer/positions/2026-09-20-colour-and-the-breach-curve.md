# Colour and the Breach curve

*designer position, 2026-09-20, third pass. Answers Dan's two notes. Scripts and renders under
`council/designer/research/`: `axis_hue_audit.py`, `six_hue_search.py`, `sketch_7_colour.py`,
`sketch_8_breach_tuned.py`.*

## Brief

Dan's colour intent is right about what has to be legible and wrong about which channel carries it.
Angle already encodes the pillar in both the shipped engine and my proposal, so putting hue there
too makes every person's mark the same pinwheel: measured across twenty-four people at 26px,
axis-on-hue is the least distinguishable of the three schemes in normal vision and under
deuteranopia. The drift to territory was correct and nobody wrote it down. I also owe a correction:
I said twelve hues cannot survive dichromacy, and what I had measured was that *these* twelve
cannot. On the Breach, he is right and the numbers are mine to fix. Curve below.

---

# 1. Colour

## The drift

Somebody built axis colour, looked at it, and moved hue to territory. The engine's own comment
records the demotion without the reason. I think I know what they saw, because I rendered it.

`SKETCH-7-COLOUR.png` is the same three records under all three schemes. In the axis rows, Wen
Zhao, Dolores Vance and Priya Raman have magenta on the left, teal at the upper right, olive at the
right and violet at the bottom. Same wheel, same order, three different people. **Angle already
carries the pillar, so hue on the pillar is the same channel twice**, and the colour layout becomes
a constant of the design rather than a property of the person.

## The measurement

Twenty-four generated contributors rendered at 26px, the size a mark sits beside a comment. Pairwise
distance in OKLab over the rendered pixels, so it measures how far apart two people look rather than
how far apart two swatches sit.

| scheme | closest pair | mean | closest, deuteranopia | mean, deuteranopia |
| --- | --- | --- | --- | --- |
| territory on hue | **0.0144** | 0.0668 | **0.0112** | 0.0651 |
| axis on hue | 0.0100 | 0.0634 | 0.0095 | 0.0617 |
| axis on hue, territory on lightness | 0.0113 | 0.0655 | 0.0108 | 0.0638 |

Territory on hue is 44% better on the closest pair in normal vision and 18% better under
deuteranopia. **Axis on hue loses on the ground it was supposed to win.** I expected the opposite,
because six categories beat twelve on a swatch test, and the swatch test turned out to be the wrong
test: the question at 26px is whether two people are distinguishable, and whether six categories are
is a different question.

The third scheme, territory carried as a lightness offset on the axis hue, is a real option and it
does show era changes as bands. It lands between the other two and buys nothing the first does not.

## Where the intent belongs

Dan's sentence is about legibility of the pillar, and the pillar is already the most legible thing
in the mark. Angle carries it, the six sectors never move, and a legend for them never expires,
which is the defect I filed this morning against the current axis-colour legend. Angle is also
immune to colour vision deficiency, which no hue is.

**So: pillar on angle, territory on hue.** The intent is honoured by a better channel than the one
it was written for, and the two signals stop competing. If Dan wants the pillar more strongly
marked than a sector boundary gives it, that is a labelling and interaction question rather than a
colour one, and I would answer it with six quiet tick marks at the sector edges before I would
answer it with six hues.

## The correction I owe on the twelve

My second position said twelve territories do not survive dichromacy. What I measured was that the
twelve now in the file do not.

Searching sRGB for twelve equal-lightness colours, scoring the worst pair across normal vision and
all three dichromacies at once:

| | worst pair |
| --- | --- |
| the twelve as respaced in my legibility ruling | 0.0018 |
| the six axis hues the engine carries | 0.0065 |
| twelve, selected against the dichromacies | **0.0304** |
| six, selected the same way, equal lightness | 0.0573 |

Seventeen times better for the same number of categories. The floor by category count, all at equal
lightness so no territory renders heavier than another: three 0.1386, five 0.0672, six 0.0573,
eight 0.0385, ten 0.0363, twelve 0.0243. No cliff, a slope.

**And it costs something I will not hide.** A dichromacy-safe twelve is mostly cool, because the
warm half of the wheel collapses along the confusion line. In the optimised set, `law_justice` moves
80 degrees into purple and `society_culture` 155 degrees into teal. Politics stops being red and
history stops being brown. Whether resemblance is worth 17x separability is Dan's call.

My recommendation, and the reason I think the trade is easy: **hue does not need to name a
territory.** It needs to make two people look different and to make a change of territory visible as
a band. Both work with a varied palette, and neither needs a reader to identify a colour. The
territory has a name, and a name is better at naming than a hue is. Reselect the twelve against the
dichromacies, put the words on the profile, and stop asking the legend to be learned.

## The six axis hues are unfit anyway

Worth recording whatever is decided, because they still render the seed dots and the legend.
Acuity `#d49415` at hue 76.9 and Reach `#a8a020` at 105.7 sit 28.8 degrees apart and collapse to
0.0065 under protanopia, which is worse than the worst pair in the twelve-territory palette. Three
of the six sit in the warm arc between 40 and 106 degrees, leaving a 102.9 degree hole. Acuity
carries 2.34:1 against the page, Reach 2.44:1, Magnanimity 2.79:1, against 5.09:1 to 5.84:1 for the
respaced territories. Six equal-lightness hues that hold up exist: `#007673`, `#667900`, `#0079a8`,
`#6753dc`, `#8b34b6`, `#b70f61`, worst pair 0.0387, all at L 0.51 to 0.54 so no pillar outranks
another.

---

# 2. The Breach curve

Dan is right, the mechanic is right, my numbers were wrong, and the failure had a cause worth naming
rather than just retuning past.

## What he saw

`SKETCH-8-BREACH-TUNED.png`, top row, reproduces it. The old form **subtracted**: `D += weight *
kernel`, weight -1.7. Density went negative, the annulus punched through to nothing, and the core
inside it was cut off from the rest of the record. What reads as a massive glow is the page showing
through a hole, and what reads as taking over the centre is a moat detaching an island. Both are
artefacts of the arithmetic rather than of the idea.

## Three changes

**It attenuates instead of subtracting.** `D *= (1 - depth * kernel)`, so a Breach can thin the
record and never remove it. The floor is structural rather than a clamp.

**Its width is fixed at the size the record was on the day**, 0.16 of that day's radius, so it stays
the same number of pixels while the disc grows past it. A bad day was a certain size and the person
got bigger.

**Its depth decays.** `depth(t) = 0.07 + 0.55 * exp(-t / 0.50)`, t in years since the Breach.

## What a viewer can tell, and when

| | record thinned by | what that is |
| --- | --- | --- |
| the day | 62% | unmistakable |
| 1 month | 53% | unmistakable |
| 3 months | 40% | plain |
| 6 months | 27% | noticeable |
| 1 year | **14%** | findable if you look for it |
| 2 years | 8% | a hairline |
| 5 years and after | 7% | the floor, and it never leaves |

So yes, to the convener's question: **a single Breach should be findable rather than visible within a
year, and a hairline after two.** Not invisible. The floor is deliberate and it is the difference
between a record and a reputation.

## A pattern has to survive where a day does not

Several compound multiplicatively at the floor, so the record keeps the count even after every
individual event has faded:

| Breaches | thinned where they overlap |
| --- | --- |
| 1 | 7% |
| 2 | 13.5% |
| 3 | 19.6% |
| 5 | 30.4% |
| 10 | 51.6% |

The bottom row of the sketch is five over eighteen months. At one year that record is visibly paler
and flatter than the one above it with a single Breach, and at five years it is still paler. It
reads as a bad period rather than as five countable days, because they overlap, and I think that is
the right reading of what it was.

## Two things this does not settle

Whether a Breach residual is visible to everyone or only to the person whose record it is.
`philosopher` and `legal` own that, and the geometry works either way.

Whether 62% on the day is too much for the person looking at their own mark the week it happens.
The curve is steepest exactly where somebody is most likely to leave, and I would want that tested
on a person rather than tuned by me.

---

# What I would hand a builder

| | |
| --- | --- |
| hue | territory, reselected against the three dichromacies |
| pillar | angle, unchanged, with the territory named in words on the profile |
| axis colour | retire it from the render, or replace the six with the equal-lightness set above if the legend and seed dots keep it |
| Breach | attenuate, never subtract; width 0.16 of the day's radius; `depth(t) = 0.07 + 0.55 * exp(-t / 0.50)`; compound multiplicatively |

Everything above is in `ledger_render.py` behind `COLOUR_MODE` and the four `BREACH_*` constants, so
any of it can be rendered again with one value changed.
