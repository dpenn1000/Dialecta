# A fingerprint without a radar chart

*designer position, 2026-09-20, second pass, filed at Dan's request for the version with no frame
on it. Separate from `2026-09-20-fingerprint-legibility.md`, which stands and which the convener is
implementing. Sketches and the scripts that made them are under `council/designer/research/`.*

## Brief

I took the radar chart out and rebuilt the mark by replaying the ledger: one mark per comment,
angle is the pillar it moved, radius is when, hue is the territory, form is the tier. The
silhouette is the outer level set of what those marks deposit, so nobody draws it. Five things I
have spent the day patching disappear rather than improve, and the notch does so by a measured
order of magnitude. The mark survives at 24px and in one colour, where the current one dies at
both. Thirty-one contributors rendered. I would prototype this and ship the legibility ruling
meanwhile, because it needs the ledger rather than the summary and that is a product decision
before it is a design one.

## What was wrong

Radar was the primitive, and every finding I filed this morning sits downstream of it.

The notch is what interpolation does to a low spoke when no baseline sits underneath. The
trade-off penalty exists because six independently computed radii do not compete on their own, so
competition had to be bolted on, which is also why Consistency needed an exemption Dan had to rule
on by hand. The potential ring argues with the shape because the shape is computed as a fraction of
it. The Breach residual has nowhere to go because every channel is already spoken for by an
aggregate, and aggregates are what you get when the render starts from six numbers instead of from
the events that made them.

Six numbers is a score. The brief says record.

## What I built instead

Replay the ledger and put one mark on the page per comment.

| | |
| --- | --- |
| where it sits, angular | which pillar the comment moved, spread across a sector wider than the sector |
| where it sits, radial | when it happened |
| its hue | the territory |
| its form | the tier: a dot, a dot with a core, a hollow ring, a smudge, a radial stroke, a tangential bar |
| the silhouette | the outer level set of what all of them deposited |

Nobody draws the outline. `SKETCH-1-THE-FIELD.png` is seven contributors rendered this way, and
Dolores Vance's line on the page, "arrived angry and learned," is legible in her mark without the
caption: rust-coloured heat strokes packed at the centre, clean blue-violet at the rim. The current
engine cannot show that, which is what my own legibility pass was working around.

## The notch, measured rather than described

Signed curvature of the closed boundary, `k = (r² + 2r'² - r r'') / (r² + r'²)^1.5`, reported as
`kR` so the number is scale free. A circle is `+1`. Negative turns into the shape. Both boundaries
low-passed at the same angular width first, because the radar boundary carries its own texture in
the same array and without that step the comparison measures noise.

| | worst kR | share of boundary turning inward |
| --- | --- | --- |
| radar, the seven gallery profiles | -19.42 | 15.3% mean |
| ledger render, the same seven | -1.95 | 2.9% mean |
| ledger render, 24 generated contributors | -2.77 | 3.1% mean |

Four of the seven come out fully convex. `kR` of -1.95 is Tom Reilly, the one-territory contributor
with three graduations of Reach, and it describes a lobe. `kR` of -19 describes a cusp. No floor was
raised and nothing was clamped: a pillar with little history deposits little, and the envelope over
that sector is held up by its neighbours' kernels. Absence reads as a narrow place.

`curvature_audit.py` prints all of it.

## Four more things that stop being problems

**The trade-off penalty goes, and I would delete it rather than port it.** A person who writes
broadly already shows as dispersed. Subtracting radius from their Acuity because they are also
broad is the record editorialising about a person, which is the one thing it is not for. Deleting it
also retires the Consistency asymmetry, which was awkward enough that Dan had to reserve it.

**The potential ring goes.** Size is tenure on a saturating curve, so a three-week contributor is
small and a five-year one is large and neither arrives anywhere. Philosopher's horizon survives as a
property of the shape rather than an object drawn beside it, and my wall at graduation 29 never
forms.

**Growth past the horizon is carried by density**, which is unbounded. A prolific month packs marks
into the same band rather than pushing the boundary out, so rate reads as darkness and tenure reads
as size. The two stop competing for one channel.

**Hue stops being asked to do the silhouette's job**, because the silhouette now varies on its own.

## A Breach is a circle

Universal Rule 1 says a Breach earns nothing on any pillar. So it has no sector, which rules out a
point. It has a date, and in this geometry a date belonging to no pillar is a full circle.

It subtracts. The field thins all the way round at that radius and the later record grows outward
past it. Nothing is added, nothing is coloured, and nothing collides with a territory that happens
to be red. `SKETCH-4-THE-BREACH.png` is the same contributor with and without one, at five months,
one year, two and a half years and five. At one year the void is the most visible thing in the mark.
At five years it sits deep in the core and you have to look.

That is the mechanic ADR-004 asked for, arrived at from the geometry rather than from the palette,
and it agrees with where my first pass landed from the other direction.

## The two ends where identity marks die

`SKETCH-2-SCALES.png` is one contributor at 24, 40, 64, 112 and 208px, in four treatments.

**The outline alone dies at every size**, which surprised me and is worth stating plainly, because
the outline is the part I have spent two positions defending. At 24px it is a pale circle.

**The field survives at 24px and looks like a fingerprint**: a warm six-armed core inside a cool
rim, at 24 pixels, still carrying the same story the 208px version tells. The identity is the field,
and the outline is what contains it.

**The print version works.** One colour, a stipple of events, no glow and no opacity ramp. The
current mark cannot be printed at all, because it is built out of a blurred fill, a gradient ramp
and a soft halo. This one is ink on paper.

## The wall, and what the platform becomes

`SKETCH-3-THE-WALL.png` is twenty-four generated contributors at 26px, at 52px, and three opened up.
They are twenty-four different marks. Size varies by tenure, hue by territory, the internal figure
by which pillars they have earned.

`SKETCH-5-THE-THREAD.png` is what that buys: five people arguing, each with their record beside what
they said, and no badge, no avatar and no count anywhere on the page. You can see that Trevelyan is
the youngest and the narrowest and that Halloran and Quill are veterans, before reading a word. The
mark becomes how you reach a person, which is the question the convener asked and which I think is
the strongest product idea in this document.

**What would make somebody post it.** Every mark on it is something they wrote, and nothing about it
can be bought or faked. Give them the file. A contributor of three years should be able to download
their own record as an SVG at any size, dated, and print it. That imports nothing from the social
playbook: no streak, no notification, no leaderboard. They own it, and nothing else in this
document is a retention mechanic.

**And it teaches itself.** The render is a replay, so the build is the mechanism: on first view of a
profile the mark draws itself from the centre outward in about a second, and nobody needs a legend
saying that the middle is the beginning. Once per profile, on the first view. The `newRingAxis`
hook nobody uses is the seam it lands on.

## Where this is weak

**Everyone is a rosette.** Six-fold symmetry is always present and the family resemblance is strong.
Good for a house style, thin for identity, and two philosophers of similar tenure will be close.

**A new contributor is a small coloured dot**, which is honest and cuts against welcome at exactly
the moment welcome matters most.

**Size is tenure, and tenure is the closest thing to a score in the whole mark.** I put it there
deliberately and somebody should argue with me about it.

**A Breach at month five dominates the mark for months.** It fades correctly and it fades from the
worst possible starting point.

**Hue collapses.** `SKETCH-6-CVD.png` simulates the three dichromacies on twelve marks: twelve
territories become about two families, blue-violet and olive. My change did not introduce that and
leans on it harder at small sizes. Healey's three controls are colour distance, linear separation
and colour category, and the twelve-territory palette controls none of them; the category control is
the one that fails outright here. What survives is size and the internal figure, so identity
degrades rather than vanishing, and the territory reading is lost. **This is a defect in the topic
palette that holds whichever render wins**, and twelve categorical hues is probably more than one
channel can carry.

**It needs the ledger.** `axisScoresToFingerprintData` currently discards `tierMix` and
`topicPhases` and hands the renderer six integers. This needs the events, ordered, with a tier, a
territory and a date each. That is a data decision before it is a design one, and it is the reason I
am not asking for this to ship.

**None of it has met real data or a real person.** Thirty-one renders is evidence about geometry and
no evidence at all about whether anybody learns these marks.

## What I looked at and did not take

**Angle as territory instead of pillar.** Sharper silhouettes, since a specialist becomes a wedge
and a generalist a full rosette. Dropped because a specialist rendering as a narrow sliver is a
shaming shape, and because it buries the six pillars the product is about.

**A deliberate spiral**, time running outward along an Archimedean curve. On a spiral both angle and
radius are time, which leaves the pillars nowhere to live, and the repository has just finished
removing an accidental one.

**A smooth union of six metaballs.** Solves the notch cleanly and keeps the six-numbers model, so
the trade-off bolt-on and the potential ring survive with it. It fixes the symptom I was already
fixing.

**Six twisted strands.** Unreadable below about 200px.

## What I would do

Ship the legibility ruling as filed, because it is real, measured and cheap, and this is not a
reason to hold it.

Then prototype this against one real ledger, at three sizes, and put it in front of four
contributors with the current mark beside it. The question that decides whether it is worth
finishing is not aesthetic: it is whether the renderer may have the events. Everything good in this
document comes from that one change.

## Scripts and sketches

`council/designer/research/`: `ledger_render.py` is the engine, `curvature_audit.py` is the notch
measurement, and `sketch_1_field.py` through `sketch_6_cvd.py` produce
`SKETCH-1-THE-FIELD.png`, `SKETCH-2-SCALES.png`, `SKETCH-3-THE-WALL.png`,
`SKETCH-4-THE-BREACH.png`, `SKETCH-5-THE-THREAD.png` and `SKETCH-6-CVD.png`. The generated
contributors come from `sketch_3_wall.make`, which is deterministic, so every number here
reproduces.
