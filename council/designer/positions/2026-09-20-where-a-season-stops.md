# Where a season's colour stops

*designer position, 2026-09-20, fourth pass. Answers Dan's note that a season should not envelop
an axis or the centre. Scripts and renders under `council/designer/research/`: `season_scope.py`,
`ring_seasons.py`, `sketch_9_seasons.py`, `sketch_10_ring_vs_ledger.py`.*

## Brief

Two thirds of what Dan is looking at is the demo data and the rest is the blend, and both are
measurable. `sharpBlend` gives one axis 34 degrees of pure colour per 60 degree sector, so one
comment holds a sixth of the ring however finely the history interleaves. The fix inside the ring
model is to stop granting angular extent and start earning it: an arc is as wide as the comments
behind it. That takes the average run of one colour from 231 degrees to 27. And the note argues
against my own ledger render, not for it: the ledger's marks are scoped, but the field I proposed
drawing from them holds one colour for 212 degrees, which is the same defect by another road.

## 1. How much is the demo data

More than the convener guessed. Wen Zhao's acuity axis, 21 graduations, coarse blocks against a
per-comment history with overlapping eras:

| | runs | mean run | longest run |
| --- | --- | --- | --- |
| coarse blocks, as `profile_gallery.py` has it | 2 | 10.5 | 12 |
| per-comment, as production would produce | 8 | 2.6 | 6 |

Rendered, on three contributors, measuring how far one colour holds around a ring before it changes:

| | mean hold | 95th percentile |
| --- | --- | --- |
| current blend, coarse demo data | 230.7 degrees | 298.1 |
| current blend, per-comment history | 75.5 degrees | 166.5 |

**The demo data is 67% of the mean over-spread.** With coarse blocks, neighbouring axes frequently
carry the same topic at the same ring, so their arcs merge and the colour is constant across most
of the circle. That is an artefact of two-block phases and it will not survive real history. Rows
one and two of `SKETCH-9-SEASONS.png` are the same three people under the two regimes.

## 2. What the blend does, and why better data cannot finish the job

`sharpBlend` is `smoothstep(smoothstep(t))`. Measured across one 60 degree sector, axis A holds 90%
or more of the colour from 0 to 17 degrees and B from 43 to 60, so each axis owns 34.1 degrees pure
and they share a 26 degree transition. Compared with the alternatives:

| blend | pure degrees per axis | transition |
| --- | --- | --- |
| linear | 12.0 | 48.0 |
| smoothstep | 23.5 | 36.5 |
| sharpBlend | 34.1 | 26.0 |

Widening the transition makes mud, which is what sharpBlend was written to avoid, and it does not
solve the problem: **one comment still holds more than 50% of a full 60 degrees, because the ring
model stores exactly one topic per axis per ring.** Angular resolution is six per ring, fixed, for
a contributor with fifty comments or five hundred. No blend curve changes that, and neither does
finer data.

## 3. The ruling

**Angular extent is earned, never granted.** An arc is as wide as the number of comments behind it.
A single comment in a cell of four gets 15 degrees. Four consecutive comments on one topic get the
whole 60, because the contributor did write four comments on it, and a run earning a wide arc is
the record rather than the rendering.

Mechanically: axis `a` owns the 60 degrees centred on its own spoke. The comments falling in that
ring's time slice are grouped into runs by topic, and the runs divide the 60 degrees in proportion
to their counts.

| | value |
| --- | --- |
| arc width | `60 * commentsInRun / commentsInCell` degrees |
| minimum arc | `max(2.5, 360 * 6 / (2 * pi * ringRadiusPx))` degrees |
| angular blend at an arc boundary | 1.6 degrees of antialiasing, and nothing beyond it |
| radial bleed, ring to ring, outward only | 0.28 |
| innermost ring radius | 0.13 of the mark's radius, up from 0.08 |

**The minimum is a level of detail rather than a constant.** Six pixels of perimeter is about where
an arc stops reading as a colour and starts reading as a speckle, so arcs merge with their nearest
neighbour in time until every one clears it. At a 256px radius that floor never binds and every
tick shows. At a 26px radius it works out to 13 degrees and a cell of four collapses to two arcs.
At 24px it works out to 34 degrees and the sector reverts to one colour, which is the right answer
at 24px. The rule degrades into the current behaviour exactly where the current behaviour is
correct.

**Seams should be crisp, and there will be more of them.** A seam is where the record changed, and
crisp is what a record looks like. sharpBlend avoided mud by giving one colour 60 degrees, and the
better way to avoid mud is to not blend angularly at all. 1.6 degrees of antialiasing, no more.

**Bleed radially.** Dan's "graduate out from there" is a radial idea and it is also
the only honest one. Two neighbouring arcs on a ring are different comments, often different
pillars, and blending them asserts a relationship that is not there. Two neighbouring rings on one
axis are the same pillar at adjacent moments, which is a real relationship, and letting the earlier
one tint the later at 0.28 is what makes a season graduate outward instead of stopping at a line.
Angular blending is the thing currently over-spreading; radial blending is the thing he asked for.
They are not the same operation and they should not get the same answer.

**The centre.** With earned extent the centre scopes itself, as long as the innermost rings have
enough perimeter to carry their arcs. At the current 0.08 they do not: a 15 degree arc at that
radius is under four pixels, the minimum-arc rule merges everything, and the core reverts to one
colour per sector. Raising the innermost ring to 0.13 gives it 8 pixels per arc and the problem
goes away without anything being erased. I tried 0.17 first and it reads as a punched hole, which
also risks being confused with a Breach, so 0.13 and no higher.

## The measurement

Same three contributors, same geometry, same palette. How far one colour holds around a ring:

| | mean hold | 95th percentile |
| --- | --- | --- |
| current blend, coarse demo data | 230.7 | 298.1 |
| current blend, per-comment history | 75.5 | 166.5 |
| **extent earned per tick** | **27.4** | **80.1** |
| earned, plus radial bleed and a wider core | 21.8 | 64.4 |
| ledger render, field sampled the same way | 212.3 | 279.7 |

A sixth of the ring is 60 degrees. The fix puts the 95th percentile at 80 and the mean at 27, so a
run wide enough to read as a season is now a run that was one.

## 4. Whether this argues for the ledger

It argues against my rendering of it, and I would rather say that than let the number sit in a
script.

**The ledger's marks are scoped.** One comment, one mark, four pixels, its own topic, no sector
painted by anything. That part of my second position survives this note intact.

**The field I proposed drawing from them is not scoped.** Each mark deposits a Gaussian of sigma 15
and the field is their weighted average, so along any circle the colour changes slowly: 212 degrees
of mean hold, worse than the current blend on the coarse data Dan is objecting to. The bottom row
of `SKETCH-10-RING-VS-LEDGER.png` shows it plainly. Wen Zhao is a blue field with a pale patch,
Dolores a rust core inside a blue rim, both in smooth zones far larger than any season. I built the
same defect by a different route and did not notice, because I was measuring the boundary's
curvature and the marks' distinctiveness, and never measured the field's angular hold.

So the level of detail has to split the other way from what I assumed. **At profile size, draw the
marks. At small size, draw the field.** The field is what survives at 24px, which is where
long-held colour is correct because nothing finer can resolve; the marks are what belong at 232px,
which is where Dan is looking.

**And the ring model wins this question outright**, at 27 degrees against the ledger field's 212,
while needing much less. The ledger needs the event stream, with a tier and a date per comment, and
a product decision to get it. The earned-arc fix needs one thing: `topicPhases` stored at
per-comment granularity instead of summarised into blocks. Same array, finer rows.

## 5. What I would hand a builder

| | |
| --- | --- |
| data | stop summarising `topicPhases` into blocks; store one topic per comment |
| colour assignment | group a cell's comments into runs by topic; divide the axis's 60 degrees in proportion |
| minimum arc | `max(2.5, 360 * 6 / (2 * pi * ringRadiusPx))`, merging by nearest neighbour in time |
| angular blend | 1.6 degrees at an arc edge; retire `sharpBlend` from the ring colour path |
| radial bleed | 0.28 outward, ring to ring |
| innermost ring | 0.13 of the mark's radius |

About thirty lines against the colour assignment, one change to how history is stored, and no
product decision. `ring_seasons.py` has all of it behind `mode="subtick"` and `mode="scoped"`, so
any value above can be rendered again with one number changed.
