# The fingerprint, read by a stranger

*Framed by the convener 2026-09-20 for six advisory seats and three working seats, at Dan's
instruction. Protocol: `.claude/skills/dialecta-council/SKILL.md`. Chaired by `decider`. Every
script, sheet, legend, answer key and raw reader answer behind the numbers below is in
`council/log/2026-09-20-fingerprint-legibility-and-model/`, and every number reproduces from it.*

## Question

**Can a stranger who knows the basic mechanics read a fingerprint back into a description of the
person, and what one model of the fingerprint should Dialecta build so that the answer is yes for
the right reasons?**

## Dan's statement of intent, which is the frame

> "For the fingerprint. What am I missing? What does the council suggest? How do we make this land.
> I want the fingerprint to tell the story. It is a fingerprint. No two are the same. It is a
> personal identity. The good, bad, and ugly. Like a real fingerprint it grows with you but can
> never be changed. It is organic, but I want a person to get a feel for this users communication
> style quickly if they look at it and understand the basics about fingerprint mechanics. I am open
> to suggestions."

And tonight, on the four captures of the live page now at
`docs/fingerprint-examples/live-page/live-1.webp` to `live-4.webp`:

> "These are the current models that are live on the Dialecta Fingerprint page. There was something
> to the overall color halo and organic color structure that landed fairly nicely here."

## The state

| | |
| --- | --- |
| **Implemented and tested** in `packages/core` | Soft horizon replacing the clamp. Walked ring phase replacing the spiral. A noise field that closes. Purity driving saturation |
| **Ruled by `designer`, not implemented** | Legibility: flat 0.84 opacity, a radial value ramp, era boundaries in `colorDeep` at 1.75x, ring count 3 to 14, three channels cut. The Breach curve: attenuate rather than subtract, 62 percent on the day decaying to a 7 percent floor, several compounding. Seasons: arc width earned per comment, radial bleed only, mean angular hold from 230 degrees down to 27 |
| **Open, and Dan's** | Colour by territory or by axis. `designer` measured territory on hue as 44 percent better at separating the closest pair of people, and recommends against Dan's stated intent because angle already carries the pillar |
| **Contested** | `designer`'s ledger render, one mark per comment, which it then argued against when its field rendering held one colour for 212 degrees |

`designer` filed four positions today, each answering a different question:
`2026-09-20-fingerprint-review.md`, `-fingerprint-legibility.md`,
`-fingerprint-without-a-radar-chart.md`, `-colour-and-the-breach-curve.md`, and
`-where-a-season-stops.md`. `philosopher` filed `2026-09-20-fingerprint-review.md`. `ADR-004`
decides the Breach residual. `docs/FINGERPRINT.md` captures the system.

## The reading test

Nothing filed before tonight tested reading. `designer` measured whether two people are
distinguishable, which is a property of the set. This measures whether one mark decodes into one
person, which is a property of the individual.

### Design

**Seven people.** The six in `scripts/profile_gallery.py` and Tom Reilly from
`council/designer/research/final_gallery.py`. Each got one description in plain words, written from
the same profile data the render reads, with no mechanism words in it:

| | Description | Who |
| --- | --- | --- |
| 1 | Argues constantly and well, and concedes almost nothing | Marcus Aurel |
| 2 | Shows up every week without fail and states the other side better than the other side does. Never heated | Father Anselm |
| 3 | Brand new. Writing about one subject, and already getting into arguments | Ivy Chen |
| 4 | Has only ever written about one thing and argues about it often, for years | Tom Reilly |
| 5 | Precise, careful about how much certainty a claim can carry, and narrow on purpose. Started in science and moved to the philosophy underneath it | Wen Zhao |
| 6 | Arrived angry and learned. The heat is all in the early years and the recent work is calm | Dolores Vance |
| 7 | Five subjects and counting. Broad rather than deep, and generous with opposing views | Priya Raman |

**Readers.** Fresh agents with vision, each given only the named image and a legend and told to open
nothing else. Two legends: `LEGEND-RING.md` gives the six angles and what extent, ring colour,
wobble, saturation, glow and size mean; `LEGEND-LEDGER.md` gives angle, radius as time, colour, form
as tier, density and size. Marks rendered unlabelled and shuffled with a different seed per sheet.

**Two tasks.** Seven-way matching of marks to descriptions, three readers per condition. And a single
mark shown alone, with nothing to compare it against, where the reader writes two or three sentences
on what the person is like to argue with; three blind scorers then matched those seven notes to the
seven true descriptions from the text alone.

### Results

| Condition | Correct | Rate |
| --- | --- | --- |
| Shipped ring render, legend, 330px | 19 of 21 | 90% |
| `designer`'s legibility ruling applied, legend, 330px | 17 of 21 | 81% |
| `designer`'s ledger render, its legend, 330px | 21 of 21 | 100% |
| Shipped ring render, **no legend**, 330px | 15 of 21 | 71% |
| Shipped ring render, legend, **64px** | 5 of 21 | 24% |
| Ledger field, its legend, **64px** | 21 of 21 | 100%, every reader at confidence 3 of 10 |
| **One mark alone**, shipped ring, legend, 330px, notes blind-matched | 21 of 21 | 100% |

Chance on a seven-way matching is one correct per reader, 14 percent. Five or more correct happens
by chance 22 times in 5,040, 0.4 percent, so every reader in every 330px condition beat chance on
their own. At 64px the ring readers scored 2, 1 and 2, and two or more correct happens by chance
26 percent of the time.

**Without a legend** readers failed exactly where a pillar decides: Wen Zhao against Father Anselm,
which is precise against generous, and Marcus Aurel against Tom Reilly. Size, the count of colours
and a colour change from core to rim carried the other five with no teaching at all.

### What the readers got wrong

**Heat, everywhere.** All seven single-mark notes describe a heated person. Three of the seven have
none: Father Anselm's record holds zero Heat and zero Stance, Priya Raman's turbulence is 0.011,
Wen Zhao's 0.025. Anselm's true description ends "Never heated"; his stranger's note ends "lately
their arguments have been getting heated." One blind scorer noticed it unprompted: every note
reports heat, so whichever is matched to Anselm has to contradict him.

The cause is measurable. Every mark carries a noise floor on purpose (`BASE_NOISE_FLOOR`, "which is
why nothing renders as a clean curve"), and the same pixel wobble sits on smaller and smaller rings
toward the centre. On Anselm it is 1.6 percent of the ring's radius at the rim and 9.6 percent at
the core. The legend says wobble is heat, and so does the live page. Readers seeing a set found
Anselm by comparison, "the smoothest boundary on the sheet." A stranger on a profile sees one mark.

**When the heat happened.** The ring model cannot say. `tierMix` is one aggregate per axis with no
time in it, and the engine's own comment at line 505 fixes where turbulence goes: "outer rings get
full turbulence, inner rings settled (recencyMultiplier: 0.3 innermost → 1.0 outermost)". Measured
on Dolores Vance, the heat term is 0.92px at the rim and 0.26px at the core, so the mark draws her
heat as recent. Eight of the ten ring readings of her still placed it early, from two things that
are not her heat: her first subject is politics, which the palette paints red, and every core looks
agitated for the reason above. They were right about her by coincidence. The page's Emerging copy,
"old Heat persists at the centre while the outer rings calm", describes the opposite of what the
engine draws.

**The trade-off penalty.** Dolores holds 22 graduations on Discourse, tied for her highest. The
penalty draws it at 70 percent of what she earned, fifth of six on the page, and her stranger wrote
"they don't tend to stay for a long back-and-forth; they make their case and move on." Discourse is
the most taxed axis because it has two partners, so the people it cuts hardest are those strong on
Calibration and Magnanimity: the fair and careful are drawn as people who do not engage. And 30 of
210 one-month earning events (five more graduations on one pillar) pull a different petal inward,
by up to 4.5px at a 118px horizon. The mark does not only grow.

**Small size.** At 64px the ring render carries the newcomer's size and nothing else. The field
carries more, and its readers said themselves that one pair was a coin flip settled by overall size,
which in the ledger is tenure.

### What the geometry can carry

The ceiling is high. On the silhouette, 94 of 99 pairwise pillar orderings survive the render, 94.8
percent across all 42 axis instances pooled, and 87.9 percent survive a reader who misplaces every
axis by 25 degrees. Texture moves a lobe by a median 3.4px against a median 9.3px between one
person's adjacent pillars. The shape is not what fails. Heat, time and the penalty are.

### The live page, measured

Sampled from the pixels by `live_palette.py`:

| | Rings | Halo |
| --- | --- | --- |
| **Carousel**, `live-1` to `live-3`, three contributors | The axis fallback. 13 of 18 bearings sit on their own axis hue and the other 5 on a neighbour's, which is the angular blend | Identical on all three: hue 84 to 85, one degree of spread, the gold seed colour. It carries no identity |
| **Archetype cards**, `live-4` | Territory, laid down in time: 0 to 6 degrees of hue variation across bearings, 107 to 143 degrees from core to rim | Territory, matching the rim |

The page does not run rings by axis and halo by territory together. It runs one model per section.
The carousel is on the axis fallback because it has no topic history, the condition
`FINGERPRINT.md` already found at `fingerprint-page-mount.jsx:23`, and it changes the first time a
contributor has a comment with a territory.

What the carousel has that the gallery renders lack is also measurable. Its strokes sit at a median
OKLab lightness of 0.725. The six axis hues sit at 0.644, the shipped topic palette at 0.507, and
`designer`'s respaced palette at 0.500, with its value ramp driving the core to 0.295. The luminous
quality is a property of how light the palette is and of a smooth angular blend, and neither depends
on which data the hue is mapped to. The carousel also prints the six pillar names around the mark,
which no gallery render and no reader in this test had.

### The data the ledger needs already exists

*Corrected after the positions round, by `architect`. The paragraph below is what the seats were
given, and it is wrong in the way that matters: the columns exist and the values do not. Read live
tonight, 22 of the 27 `axis_events` rows carry no territory, and all 5 that do are Reach, because
the writer stamps a topic on Reach alone (`_recovered/api/_axis-mapping.js:87-116`, confirmed by
the convener from source). `replayAxisScores` throws on the first live row, because its type is the
spec's (`delta`, `tier_at_contribution`) and live has neither. And nothing in `apps/web` writes the
ledger at all (`builder`: `api/comment/route.ts:278` leaves the hook unwired on purpose). So the
carousel will not change "the first time a contributor has a comment with a territory," as the
paragraph above it says: its mapper discards topics unconditionally.*

`designer` held that the ledger render "needs the events, ordered, with a tier, a territory and a
date each. That is a data decision before it is a design one." The live database already holds
them. `axis_events` (27 rows) is one row per earning event with `axis`, `tier`, `topic` and
`created_at`, closed to the anonymous key, and `packages/core/src/axis-mapping.ts` already replays
events into scores. Two gaps remain: a Breach earns no axis event, so its date lives only on
`classifications` and `comments`; and `comment_id` cascades on delete, so deleting a comment
removes its events.

### What this test is not

- **The readers are one vision model, not people.** Three readers of one model agree far more than
  three people would; all three small-field readers returned the identical answer. Read the table
  as a ranking of renders and an existence proof, not a human hit rate.
- **Matching lets elimination work.** The single-mark task removes it for the reader, not for the
  scorer.
- **Seven people written to differ.** Real contributors cluster. `designer`'s 24-contributor wall
  is the closer population and was not tested for reading.
- **The ledger had help the rings could not have.** Its synthetic history places Heat with a
  per-contributor bias `designer` set to fit each story (`BIAS` in `sketch_1_field.py`). Production
  takes that timing from real dates, so the advantage is real and it is also a confound here.
- **The descriptions came from the render's own inputs.** That is the most generous test possible.
  A stranger's "feel for communication style" may need things the six axes do not hold.
- **The convener wrote the legend.** The page's copy is the legend a stranger will have.

### Running it properly

People from the audience Dialecta is for, not designers, and not a model. Between subjects, 24 per
condition, unmoderated, about ten minutes each. A population of about 40 marks from realistic
ledgers that cluster the way a community does, since three Pacts do not yet cover real ones. Four
tasks: seven-way matching; one mark alone, described, blind-scored; two-alternative probes per
channel (which of these two is more heated, broader, more generous); and a five-second glance.
Three sizes: profile, card, byline. The measures that matter are accuracy against chance,
per-channel recovery, and the heat false-positive rate, which is the shaming error, with a bar for
it set before anything is run. Six conditions at 24 is 144 sessions, which `treasurer` should
price. The smaller version is `designer`'s own: four contributors, the current mark beside the
alternative.

## Constraints already locked

- Six pillars and eight archetypes by name, root `CLAUDE.md`. Tier names, root `CLAUDE.md`.
- `ADR-004`: a Breach earns nothing on any axis and leaves a residual; visibility is chosen in the
  Pact and confirmed at first render.
- Consistency's exemption from the trade-off pairs, settled by Dan.
- The soft horizon, settled by Dan.
- The Editorial Voice: observational, never evaluative; name what is present before what is missing.

## What the debate owes

1. **A verdict on whether the mark is legible**, against the test above and its limits.
2. **One coherent model.** What the fingerprint is, in one description, and whether the parts fit.
3. **Dan's six properties**, each answered against that model: no two the same; personal identity;
   the good, bad and ugly; grows and can never be changed; organic; readable at a glance by someone
   who knows the mechanics. Which it satisfies, which it fails, which pull against each other.
4. **A ranked build order** for what is ruled and unimplemented, with what each costs and buys.
5. **What Dan is missing**, answered directly.

## What each seat owes

- **`designer`.** Your legibility ruling was argued on distinguishability and on how the rings look;
  in the one decode test that exists it read no better than the shipped render. Say whether it
  stands. Resolve the heat false positive, where the noise floor and the heat channel share a
  grammar. Say what the fingerprint is in one description, reconciling your four positions. Dan's two
  notes pull apart: he liked the carousel's light, smooth, angular colour, and he asked for seasons
  that do not envelop an axis, which your seasons ruling answers with crisp seams. Rule on colour
  with the live-page numbers in hand.
- **`philosopher`.** The good, bad and ugly against not shaming, now with a measured case of the mark
  accusing someone of what he never did. Whether the trade-off penalty is the record editorialising.
  Whether a mark strangers can read is the scoreboard your charter vetoes, and what it does to P-11.
- **`legal`.** A stranger turned a mark into "lately their arguments have been getting heated" about a
  man whose record holds no heat. That is a factual-sounding claim about a named person, produced by
  the platform's own render. What legibility does to the fingerprint as the platform's
  characterisation; what the share card may carry; whether the contest path becomes a precondition;
  and whether "can never be changed" survives a person's right to delete what they wrote.
- **`circulation`.** At byline size the ring mark reads at chance, and the share card is your front
  door. What goes on a card: the field, words, both, or none. Your open record on share-card exposure.
- **`treasurer`.** Price the build order and the human study. Whether a renderer that reads events
  changes unit cost.
- **`security`.** `axis_events` is closed to the anonymous key today. A ledger render running in the
  browser would ship every contributor's per-comment tier history to every visitor. Where it runs,
  and what the least-data version is.
- **`builder`.** Cost each ruled, unimplemented item. The carousel's discard. What reading
  `axis_events` into the renderer costs and what it unblocks.
- **`spec-reader`.** Which of the specs' and the page's claims about the fingerprint are false as
  rendered, starting with the Emerging copy and "seven channels, none of them sharing." Where the
  specs stand on the trade-off penalty and on legibility to strangers.
- **`architect`.** The ring model and the ledger now need the same input. Whether the renderer reads
  events, where the render runs, and one architecture that serves profile, card and byline from one
  source.

## Positions

*Each seat's `## Brief`, verbatim, advisory bench then working bench. Full positions at the paths given.*

### circulation

*`council/circulation/positions/2026-09-20-fingerprint-legibility-and-model.md`*

The share card already excludes the fingerprint, in shipped code, citing this seat's own
blindspot memo. Tonight's numbers are the first evidence the call was right, not just cautious.
The single-mark test gave one reader a mark, a legend, and nothing to compare it against, the
closest proxy tonight has to a stranger on Facebook. All seven readers reported heat, including
for three people whose true record has none. A stranger's card view is that condition, minus the
legend and the time. A fingerprint isn't a reason anyone arrives. Nothing about arrival was
waiting on this debate.

### designer

*`council/designer/positions/2026-09-20-fingerprint-legibility-and-model.md`*

My legibility ruling does not stand as specified. The reading test scored it below the unfixed
original, 17 of 21 against 19 of 21, and two readers confused Marcus Aurel with Tom Reilly and with
Dolores Vance under the dark, densely ringed condition I proposed. Rendering it myself shows why:
opacity 0.84 and a ramp of 0.60 toward colorDeep bury Marcus's one discriminator, a territory band,
in clutter, nowhere near the carousel's measured luminosity, L 0.725 against my 0.551. Lightening it
recovers both. The heat false positive is separate, fixed: ratio-capping the noise floor against
each axis's extent flattens 9 to 19 percent of radius at the core to 1 to 5 percent, unchanged where
the render already worked.

### legal

*`council/legal/positions/2026-09-20-fingerprint-legibility-and-model.md`*

Legibility turns the fingerprint from an impression into the platform's assertion about a named
person, and tonight's test shows it can be false. Three test profiles hold almost no Heat, and all
three strangers' notes say they ran hot; Father Anselm, with none, got "lately their arguments have
been getting heated", because the page teaches that a rippling line is heat and the render ripples
every line on purpose. Milkovich does not shelter opinion that implies a fact no stranger can
check, and tonight's log makes this a known defect. The contest path on the table would not have
helped him: every classification he has is right. Nothing beyond self-visible ships until every
taught channel matches the record.

### philosopher

*`council/philosopher/positions/2026-09-20-fingerprint-legibility-and-model.md`*

The good, bad and ugly can be shown without shame if the bad is drawn as dated acts, and never as a
texture of the whole person. The ring model draws tier history as undated texture, and its noise
floor wears heat's grammar. Strongest evidence: Father Anselm's record holds zero Heat and zero
Stance, and a stranger's note on his mark ends "lately their arguments have been getting heated." The
page's showcase draws the Reviser, the archetype defined by change, with no Heat or Stance, where the
spec calls for earlier heat resolving. The renderer should read events, the trade-off penalty should
go, and no ordinal mark should sit beside a vote, where it feeds the tier it displays.

### security

*`council/security/positions/2026-09-20-fingerprint-legibility-and-model.md`*

Where the render runs does not decide what leaks. What the renderer is handed does, and the debate
is guarding a door that is already open. The production `/api/comments` returns, to any caller
with no credential, the whole classifier row for every comment on an article in any status:
`emotion`, `tribal_example`, `borderline_flag`, the compose-time `commenter_message`, and the bodies
of suppressed Breach comments (`_recovered/api/comments.js`, lines 88-93, 115-131 and 217). Keep
`axis_events` closed. Draw every mark from one database function that returns only what the mark
draws, at season grain, with the Breach residual gated to the viewer. Narrow `/api/comments`
first, because what it publishes grows with every comment.

### treasurer

*`council/treasurer/positions/2026-09-20-fingerprint-legibility-and-model.md`*

Fund the geometry fixes, veto the events renderer until the study earns it. Every ruled item in
the three designer briefs is a formula already prototyped in Python, touching no table, so it
costs Dan's evenings, not the floor. A renderer that reads `axis_events` live is the identical
replay pattern `Dialecta_Supabase_Scaling.md` already measured and rejected for `axis_scores`,
walled at 800 to 1,200 lifetime comments before Supabase's compute buckles, and it forces open
either the anonymous key or a paid render per view. The ledger's edge tonight is one AI reader
repeated three times, not people. Price the human study at $274 to $411 on Prolific's own rates.
Spend a third of that.

### architect

*`team/architect/positions-2026-09-20-fingerprint-legibility-and-model.md`*

The fingerprint is one fold over the ledger: defined once in `packages/core`, run on the server,
stored, and served alike to profile, card and byline. No renderer should read `axis_scores`,
because a tier count and a set of topics cannot say when anything happened, and time is what Dan
asked for. The ledger the frame calls ready is not. Read live tonight: 22 of 27 `axis_events`
carry no territory, and all 5 that do are Reach, because the writer stamps a topic on Reach alone
(`_recovered/api/_axis-mapping.js:87-116`). Neither the ledger render nor designer's earned arcs
has its input. Fix the writer first. The territory already sits in `articles.topic`, so the
backfill is 27 rows.

### builder

*`team/builder/positions-2026-09-20-fingerprint-legibility-and-model.md`*

The render has nowhere to land. `apps/web/src/app/profile/[id]/page.tsx` is sixteen lines and a
placeholder; no Fingerprint component exists anywhere in the app that will ship. Every ruling
tonight, legibility, the Breach curve, seasons, is a fully specified patch against a quarantined
Pages-era engine or a Python research script, neither of which is production code. The ledger
those rulings assume real data from is unwritten too: `strings.ts` names it as a known fault, and
`api/comment/route.ts` has the write commented out on purpose, gated behind a pipeline that does
not exist yet. Build the writer and the renderer before spending more sessions tuning pixels no
data will reach. The pure math can, and should, proceed in parallel.

### spec-reader

*`team/spec-reader/positions-2026-09-20-fingerprint-legibility-and-model.md`*

The page copy and specs make four false claims about how the fingerprint renders: that old Heat persists at the center while outer rings calm (the engine applies the opposite), that seven channels carry one signal each with none sharing (purity affects noise, turbulence is modulated by recency and maturity), that saturation drives color (documented but unimplemented), and that a stranger can read pillar identity from the shape alone (the reading test shows 71% without legend, 100% confusion on Calibration versus Magnanimity, Father Anselm versus Marcus Aurel, and every single mark reports heat even for calm contributors).

## Before the rebuttals

*The convener's notes, written after reading all nine positions in full. Facts and cross-references
only; no seat is told what to conclude.*

### Corrections to the frame

- **The ledger is not ready.** `architect`'s live read, corrected in place above under "The data the
  ledger needs already exists."
- **`graduation_count` is not checked 0 to 22 live.** The convener's briefs to `builder` and
  `architect` said it was, from `supabase/migrations/20260920000000_baseline_live_schema.sql:625`.
  `architect` read `pg_catalog` and the constraint does not exist live. The baseline file is wrong,
  which is `migrator`'s.
- **The reading test ran on the Python gallery port.** `architect`: the "shipped" sheet calls
  `gallery_probe.render_one`, a copy of `scripts/profile_gallery.py`; the live page runs the
  recovered engine and the `packages/core` port renders nowhere. The three failures stand because
  every copy shares the formulas that cause them.

### Where the positions meet, measured

**The heat false positive is mostly at the rim, and the fix on the table is exactly 1.0 there.**
Five of the seven single-mark notes place the heat "lately": Anselm, Wen Zhao, Ivy Chen, Marcus
Aurel, Tom Reilly. Two place it "early": Priya Raman, Dolores Vance. Of the three false positives,
two were read at the rim. At the rim the noise floor is larger than the heat signal for every one of
the seven, measured by `when_is_heat.py` (appended tonight):

| | Turbulence | Heat at the rim, RMS px | Floor at the rim, RMS px | Heat over floor |
| --- | --- | --- | --- | --- |
| Father Anselm | 0.000 | 0.00 | 1.31 | 0.00 |
| Priya Raman | 0.011 | 0.14 | 1.77 | 0.08 |
| Wen Zhao | 0.025 | 0.19 | 1.63 | 0.12 |
| Tom Reilly | 0.077 | 0.74 | 1.75 | 0.42 |
| Dolores Vance | 0.101 | 0.92 | 1.64 | 0.56 |
| Ivy Chen | 0.214 | 0.71 | 2.48 | 0.29 |
| Marcus Aurel | 0.265 | 1.24 | 2.57 | 0.48 |

`designer`'s ratio cap is 1.0 at the rim by construction, and its own `model_fixes.py` prints the
rim roughness range unchanged before and after, 0.48 to 1.04px.

**ADR-004 rules out a clock.** Its decision table: "Decay: None, and none is needed. The residual
shrinks by dilution as the fingerprint grows, which is a property of the shape rather than a timer
anyone has to tune." `designer`'s Breach curve is `depth(t) = 0.07 + 0.55 * exp(-t / 0.50)`, t in
years. `philosopher` raises it; `treasurer` and `builder` price the curve as ruled.

**"Events renderer."** `treasurer` vetoes a renderer that replays `axis_events` at request time and
funds "precompute on write." `architect` proposes a fold stored at write time and served as SVG,
with a replay benchmark of 4.4ms at 17,435 events. Whether these disagree is for the two seats.

**The trade-off penalty.** `philosopher`: delete it, and it is Dan's to delete. `designer`: retire
it structurally, last of nine items. `spec-reader` quotes Contributor Identity calling the
trade-offs intentional and "not bugs."

**Who renders at all.** `security`'s least-data rule (no cell under three comments) means a
newcomer's first two comments draw nothing; the Newcomer in this test would not render. `legal`:
nothing beyond self-visible ships until every taught channel matches the record and a contest path
reaches the drawing.

**The carousel.** `designer` ranks fixing `fingerprint-page-mount.jsx:23` first. `builder`: that
file is in quarantine and nothing in `apps/web` imports it.

**`spec-reader`'s brief against `answers.json`.** The brief cites "100% confusion on Calibration
versus Magnanimity, Father Anselm versus Marcus Aurel" and its body "21 of 21" notes describing
heat. The no-legend misses were Wen Zhao against Father Anselm and Marcus Aurel against Tom Reilly;
seven of seven notes described heat. The brief also calls purity-to-saturation unimplemented; it is
built in `packages/core/src/fingerprint-texture.ts`, as the position's own body says.

**Not the fingerprint, and raised by two seats.** `security` reads the recovered production
`/api/comments` as returning every comment's full classifier row, Breach bodies included, to any
caller, and asks before anyone sends one GET to confirm it live. The convener confirmed the handler
from source (`_recovered/api/comments.js`: no status filter at lines 88 to 93, fifteen classifier
columns at 115 to 131, the row returned whole at 217) and has not sent the request. That is Dan's.

## Rebuttals

*Each seat's rebuttal, verbatim, as appended to its own position file.*

### circulation

Legal's finding stands, and closing the record was premature. My brief's "the share card already
excludes the fingerprint" was true only of the route this seat tracks,
`apps/web/src/app/articles/[slug]/opengraph-image.tsx`. Legal found a second live project,
`dialecta-next`, carrying two routes I never checked: `contributor/[handle]/opengraph-image`, with
the archetype and "Strong on X and Y," and `comment/[id]/opengraph-image`, with the tier word
beside a name. Unlinked is not excluded. The blindspot memo I cited to close the record was scoped
to one project. It reopens until the rule covers both.

That concession does not move arrival. Nothing links to either route today, so neither has
produced a single visitor, and the contributor card's words are flattering rather than the
false-heat problem legal and philosopher measured tonight. The headline still does the work a mark
cannot: 54 of 269 Facebook visitors. What this seat owes is legal's own rule, carried to the
second project: the day any UI links either dialecta-next route, the test this seat already ran on
the apps/web card runs there first, before the link ships.

On the ledger field, checked rather than asserted against answers.json: all three 64px ledger
readers scored 7 of 7 and logged confidence 3, two flagging one pair a coin flip. A forced match
against seven known candidates, at that confidence, is not a stranger's read. The claim stands.

The thread view designer calls its strongest idea, and the ordinal mark philosopher argues against
beside a vote, both sit inside the platform, after arrival. Neither is this seat's fight.

### designer

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

### legal

**`designer`'s rim fix is the strongest point against my gate, and meets half of it.** I reran
`rim_floor_fix.py`: tying the floor to turbulence orders it by heat for all seven and cuts
Anselm's from 1.31px to 0.25px. That fixes the amount and worsens the timing. Dolores Vance's heat
is all early. The ratio cap calms her core, one of two accidents that let tonight's readers place
it early, and the rim fix lifts her heat clear of its rim floor, 1.80 to 1, where the legend puts
recent heat. By the legend, a reformed person now runs hot lately: true heat, false implication,
Godbehere's pattern. The gate stays, with a cheap exit: stop teaching when heat happened until the
renderer reads dated events, rerun the single-mark task against the one-in-five bar, and print
`philosopher`'s "Heat, none" beside a calm mark.

**Conceded to `security`.** My section 5 called the ledger append-only and hardening built. The
ledger cascades on delete, and hardening is one check in the delete handler
(`_recovered/api/comment/[id].js` lines 289-343), keyed to a `member_uuid` from the request body
that `convener-05` shows anyone can harvest. The line I offered Dan, "No one can edit the record
behind it, including us," would be false today: inside the hour a stranger can delete a member's
comment and redraw their mark. Hardening comes off my accepted risks until the database refuses
the delete and takes the author from a verified session.

**`architect`'s append-only record is how the database would hold it.** A tombstoned comment
leaves nothing on the public mark: a trace outliving its comment is an assertion without its
proof. Strangers see the current `FINGERPRINT_VERSION`; the frozen SVG stays with its owner, since
in public it keeps whatever the renderer got wrong that day.

### philosopher

`spec-reader` quotes the strongest point against me. Contributor Identity says the trade-offs
"are not bugs": they make "a shape rather than a uniform circle," and if everyone could max every
pillar, "the pillars meant nothing." My high confidence that the penalty contradicts the specs
was misplaced. It obeys that paragraph and breaks the sentence above it that calls high Acuity
with high Reach "rare and visible."

The penalty caps only the drawing; `fingerprint-geometry.test.ts` names the case
"holds when a real contributor maxes every axis." Ported, the formula draws every record with 44
or more on all six, whatever the mix, within 0.05px of one shape at a 118px horizon: 0.80 on four
pillars, 0.70 on Discourse, 1.00 on Consistency. Past the horizon the silhouette separates nobody
either way; the penalty picks the shape they share.

The document should change, by Dan's hand. Its bullets state tendencies a record will show
("tends to outrun," "will accumulate some Heat"). Its last paragraph makes them the cause of
every shape; that claim should go.

`designer` would retire the penalty too, last of nine, through an envelope. Deletion needs none.
Setting `TRADEOFF_PENALTY = 0.2` to zero and updating its tests loses nothing the six totals hold.
Ranked last, the penalty ships in the first self-visible render, so the first person shown
Discourse fifth of six on a record like Dolores's, where it ties for first, is its owner.

`legal` is right that a drawing can be contested; my "nothing to contest" was wrong. The counts it
hands me belong on the profile, Heat and Stance by season, dating acts; beside a vote they rank
people. Keep `security`'s three-comment floor on the public mark, whatever it buys privacy: drawn
from two comments, a mark makes two acts the whole person.

### security

`architect`'s placement beats mine. A Postgres projection would be a fourth copy of the metric
derivation `architect` finds in three places, and its per-view replay is what `treasurer` vetoes.
Fold in `packages/core` at write time, store per member and scope, and the least-data rules live in
one place.

Admission, which viewer reads which scope, stays in the database. `/api/comments` is why: RLS
showed anon 0 of 3 held comments while the service-key handler, by its source, served all 3. The
snapshots route `architect` asks about is in the recovered production build and checks no caller
(`_recovered/api/profile/[id].js` lines 1005-1030; read, not probed). Three testable conditions:

1. The stored table enables RLS in its creating migration, with a policy admitting a viewer to a
   scope row by `auth.uid()`. New tables here arrive granted to anon (`nextjs-rebuild.md`), so that
   policy is the only lock. A test asserts anon reads public rows only.
2. Pages read it as the viewer, never with the service key (`architect`'s own step 3).
3. Only the public render enters a shared cache, and the share card carries none (`legal`).

Rows already cut to grain need only RLS; my objection was to raw `axis_events`.

The three-comment floor comes out. A cell of three comments that all earned Acuity states it of
each, and I already accepted that a watcher learns every comment's pillars. The owner's scope never
needed it, so the Newcomer renders for its owner from the first comment. That mark goes public when
`legal`'s fidelity gate opens.

`architect`'s live read returned counts and catalog, no member's text. My GET would copy Breach
bodies and compose-time notes into a transcript, so it waits for Dan. Counts by status and populated
column would size the exposure without it.

### treasurer

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

### architect

`treasurer` files my fold under the path it funds, and `security` prefers it to a per-view
projection. As I filed it, the source `treasurer` cites ranks it last.
`Dialecta_Supabase_Scaling.md:47, 55` puts the 800 to 1,200 limit at replay "on every
classification event", a write, and my writer "refolds that member" on each append: the doc's
option C. My 4.4 ms timed the fold alone, and the doc states no method, so neither number measures
the fetch. I adopt option A (`:51`). Everything the fold keeps is a count, a set or an append-only
list, so a new row updates the stored state in constant time and the renders redraw from it. The
nightly replay stays as the drift check, and a property test in core asserts that replay and
increment agree. `designer`'s ring, fed from events, is one more render of that state, and moving
its Breach curve from years to volume removes the clock ADR-004 bars, so a stored render stays
true until the next row.

`builder`'s re-costed loader would read the stored model with the service key. `security`'s second
condition rules that out. By its source, the `/api/comments` handler, on the service key, served
all 3 held comments that RLS hid from anon. The loader reads as the viewer, behind an `auth.uid()`
policy on the stored table, the only lock because new tables arrive granted to anon. My step 3
promised that request path and never said how. I adopt `security`'s three conditions as written, so
the fold sets what each scope holds and an RLS policy sets who reads which. The third matches
`opengraph-image.tsx:14-16`, which holds every card to title and byline, so I withdraw my
`next/og` route for the share card.

### builder

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

### spec-reader

The convener's corrections stand. The brief mislabeled the no-legend pillar confusions as "Calibration versus Magnanimity, Father Anselm versus Marcus Aurel" when the test shows Wen Zhao against Father Anselm (readers 2 and 3) and Marcus Aurel against Tom Reilly (reader 1). On the heat false positive, seven of seven single-mark notes describe heat, not "21 of 21" reader responses. On saturation, the position's body correctly notes it is "shipped in packages/core/src/fingerprint-texture.ts"; the brief overstated the gap. These corrections do not change the core findings: the specs and page teach a model of wobble-as-heat that produces false positives against contributors with zero heat record, and the reading test bears that out cleanly.

Two findings from other seats compound this finding. Legal: when a reader converts a mark into a false factual claim about a named person, the fingerprint becomes the platform's assertion. Philosopher: the page's showcase of the Reviser archetype (the pillar defined by change) renders with no heat or stance, contradicting the spec's stipulation that early heat should resolve. Both turn on the same collision: the legend teaches that wobble means heat; the engine adds wobble to every mark for legibility; the specs have no way to name this gap. Designer's noise-floor fix (ratio-capping at the rim) is precise and measurable, and it fixes half the problem, but the core issue lives in what Dialecta teaches the public about how to read heat. FINGERPRINT.md (lines 77-93) assumes "a viewer parses which axis caused" concavity; Dialecta_Contributor_Identity.md assumes a reader will see the trade-off penalty as earned; the page assumes wobble tells heat. None of these state that they require the legend or that the engine adds wobble everywhere. That gap is where the false positives live.

The specs also do not state whether a stranger reading a profile fingerprint alone can use pillar knowledge at all. When Dialecta ships a mark on a social card or a byline, no ambient comparisons and no legend are present. Dan's intent ("understand the basics") is silent on that boundary. The test's single-mark condition (21 readers got 100 percent accuracy with legend, zero chance without it, on pillar distinctions) names where that boundary lies. The specs are silent on which side.

## After the rebuttals

### The fix, tested

`designer` conceded the rim and filed a second fix; `legal` predicted it would trade one error for
another. The convener reran the single-mark condition on `fixed_render.py`: the shipped render with
both of `designer`'s noise fixes composed (floor gated on turbulence, amplitude over the axis's own
rim extent) and nothing else changed. Same legend, same prompt, fresh readers and file names, three
fresh blind scorers. Raw answers are under `single_mark_fixed_render` in `answers.json`.

| | Shipped render | With both noise fixes |
| --- | --- | --- |
| Notes reporting heat | 7 of 7 | 6 of 7 |
| Calm people read as heated | 3 of 3 | 2 of 3. Wen Zhao now "keep their cool"; Anselm and Priya Raman still heated |
| Dolores Vance's heat | "ran hot early on" | "lately they've been running hot" |
| Blind scorers matching notes to people | 21 of 21 | 15 of 21. All three swapped Dolores and Wen Zhao |
| Strongest and weakest pillar named correctly | 5 and 5 of 7 | 5 and 5 of 7 |

`legal`'s prediction held exactly. The fix lifted Dolores's real heat clear of the floor at the rim,
and the legend says the rim is recent, so a reformed person now reads as running hot lately, and
her one identifying story went with it. One scorer, unprompted: "six notes say the heat is recent,
including the one matched to never heated. None of them notices early heat."

### For the chair

- `spec-reader`'s rebuttal runs 366 words against a 300 cap, and restates one point wrongly: it
  calls `designer`'s first fix "ratio-capping at the rim," which is the core fix.
- `security` has withdrawn its three-comment floor; `philosopher`'s rebuttal argues to keep it on
  the public mark, for a different reason.
- The ask from `security` to send one GET to production `/api/comments` has not been approved and
  is Dan's.
- After the chair filed, the convener added "by its source code" to item 7 of the morning section,
  because the `/api/comments` exposure is read from the recovered production build and not
  confirmed live. Nothing else in the chair's sections was changed.

## Chair roll-call

*Advisory bench, then working bench, then the seats on disk that were not convened. Numbers were
rerun from the evidence folder or read from the file named, except where attributed to a seat.*

**circulation** argued that the share card already carries no fingerprint
(`apps/web/src/app/articles/[slug]/opengraph-image.tsx`: title and byline only, `twitter:card` set
to `summary`), that tonight's numbers show the exclusion was right rather than cautious, and that
the fingerprint does no arrival work. At 64px the ring reads at chance, 5 of 21; the ledger field
reads only inside a forced seven-way match, at confidence 3 of 10; and the single-mark notes
produced a confident, wrong, unflattering sentence about a named person. The headline is what brings
people (54 of 269 Facebook visitors), so legibility work buys retention and no arrivals. It asked to
close its share-card record. In rebuttal it **conceded** that closing was premature: `legal` found
two live, unlinked card routes on the separate `dialecta-next` project,
`contributor/[handle]/opengraph-image` with the archetype and "Strong on X and Y", and
`comment/[id]/opengraph-image` with a tier word beside a name, so its brief's claim held for one
project only. The record reopens, and its rule now covers both projects: the card test it ran on
`apps/web` runs on either route before any UI links to it. It checked its ledger-field claim against
`answers.json` and the claim holds (all three 64px ledger readers scored 7 of 7 at confidence 3, two
of them flagging one pair as a coin flip). Disposition: **carried** on the card, which `legal`,
`security` and `architect` all hold to words, `architect` withdrawing its own `next/og` card route
to match; **conceded** on the record's closure. Factual error: the brief's scope, corrected by the
seat in rebuttal. Its arrival claim went uncontested and was not tested tonight.

**designer** argued five things. First, its legibility ruling does not stand as specified: the test
scored it 17 of 21 against the unfixed render's 19 of 21, and both readers who judged by eye
confused Marcus Aurel (one with Tom Reilly, one with Dolores Vance), because opacity 0.84 and a 0.60
ramp toward `colorDeep` bury his one discriminator, an economics band. It replaced the numbers (ramp
about 0.05, opacity about 0.65, boundary weight raised to 2.1), which lift median stroke lightness
to 0.63 to 0.65, short of the carousel's measured 0.725 because its respaced palette keeps a
contrast floor of 5.09:1 to 5.84:1 that it will not trade. Second, the heat false positive was fixed
by scaling the noise to the ring's radius over the axis's own rim extent. Third, territory on hue
stands, reselected against three colour-vision deficiencies; the carousel is no colour target, since
it renders no data and its light comes from a palette picked with no contrast floor, and the
archetype cards (`live-4`) are the honest comparison. Fourth, one model: "a per-comment ledger read
through a polar coordinate system: angle is the pillar a comment moved, radius is when, hue is the
territory, and the texture of the line is the shape of the engagement it was." Keep the silhouette
and feed it from events, while granting that the ledger's discrete heat stroke "cannot produce a
false positive the way ambient noise can." Fifth, what Dan is missing: whether a mark is met alone
(profile, card) or among others (a thread), since every number but the single-mark test measured
comparison. Its build order ran to nine items, the carousel first. In rebuttal it **conceded** three
points: the ratio cap is exactly 1.0 at the rim by construction and cannot reach a false positive
that lives at the rim ("I mis-scoped the fix to the bug I found first, not the bug the test found"),
so it filed a second fix gating the floor on turbulence (Father Anselm's rim floor 1.31px to 0.25px,
rerun tonight from `council/designer/research/rim_floor_fix.py` and confirmed); its Breach curve,
`0.07 + 0.55 * exp(-t / 0.50)` in years, is the clock ADR-004 bars and has to become dilution
against volume earned since; and `builder` is right that the carousel fix buys no reach, since
nothing in `apps/web` imports that file. The convener then tested both noise fixes composed: 6 of 7
notes still report heat, Father Anselm and Priya Raman still read as heated, Dolores Vance moved
from "ran hot early on" to "lately they've been running hot," and blind matching fell from 21 of 21
to 15 of 21, every scorer swapping Dolores and Wen Zhao. Disposition: **conceded** on the legibility
settings, the Breach clock and the carousel's rank; **lost** on the heat fix, which the rerun showed
to be insufficient and to worsen timing; **carried** in substance on the model, which `philosopher`
and `architect` reach independently; **unresolved** on colour, which is Dan's, and on keeping the
silhouette, against `architect`'s growth test, which it did not answer. Factual errors: the
carousel's rank assumed a ship path that does not exist, and the brief's "fixed" claimed a fix
scoped to the core; both conceded. Two further items: its section 5 says it would delete the
trade-off penalty while its build order retires it last, through an envelope, and `philosopher`
pressed that gap without reply; and the revised interior numbers have been judged by eye and by a
lightness sweep, never by a reader.

**legal** argued that legibility turns the fingerprint from an impression into the platform's
assertion about a named person, because the platform wrote the legend, stated the purpose (Dan's own
sentence is the one a plaintiff would open with) and framed the mark as fact ("fingerprint", "cannot
be edited", "unfakeable"). Section 230 never covered the mark. The basis a stranger would need to
check it is closed to the anonymous key. Consent in the Pact runs to a publication and does not
reach an error: Father Anselm agreed to a fingerprint, not to heat he never had. False light fits
better than defamation, and Dolores Vance is its case twice (real heat drawn as recent, 22
graduations on Discourse drawn at 70 percent). "Heated" is mild and probably fails both torts, but
tonight's log puts the knowledge element on the record, and a false Breach reading would plausibly
clear the bars heat does not. Its rule: nothing beyond self-visible ships until every taught channel
matches the record, every channel that can shame passes a false-positive bar set before the study
(for a record with no Heat or Stance, fewer than one reader in five reports heat), and a contest
path reaches the drawing, since re-review of classifications would not have helped Anselm, every one
of whose classifications is right. Also: the Breach residual stays owner-only until its own
false-positive test, the drawing-level contest path and the Arizona hour exist; words beside a mark
come from fixed templates filled from counts, never from a model; a card carries a characterisation
only when the person shares it having seen it; "can never be changed" holds for the record and fails
for the drawing and the display; the Pact states a 30-minute reflection window where the code
enforces 60; and `fp_snapshots` writes PNGs to public storage that no setting reaches. In rebuttal
it reran `rim_floor_fix.py` and predicted that the second fix repairs the amount of false heat and
worsens its timing, lifting Dolores's early heat clear of its floor at the rim, where the legend
puts recent heat. The convener's rerun confirmed the prediction exactly. It kept the gate with a
cheap exit: stop teaching when heat happened until the renderer reads dated events, rerun the
single-mark task against the one-in-five bar, and print "Heat, none" beside a calm mark. It
**conceded** to `security` that its section 5 was wrong to call the ledger append-only and hardening
built: the ledger cascades on delete, and hardening is one check in a handler keyed to a
body-supplied `member_uuid` that anyone can harvest, so the line it had offered Dan, "No one can
edit the record behind it, including us," would be false today. It adopted `architect`'s append-only
record: a tombstoned comment leaves nothing on the public mark, strangers see the current
`FINGERPRINT_VERSION`, and the frozen picture stays with its owner. Disposition: **carried**, on the
strongest single result of the debate; **conceded** on hardening. Factual error: append-only and
hardening, corrected in rebuttal. The seat is not counsel and lists five questions for a lawyer.

**philosopher** argued that the good, the bad and the ugly can be shown without shame only as dated
acts inside a larger record, never as a texture of the whole person (Tangney, Stuewig and Mashek,
2007: shame attaches to the global self, guilt to a specific act). The ring model draws tier history
only as undated texture, and its noise floor wears heat's grammar, so tonight's heat reading carried
no information: the ratio of heat readings on records with heat to records without was one. A
judging channel needs a zero that looks like zero, which a count has and an organic line never will.
The renderer should read events; the trade-off penalty is the record editorialising and should be
deleted, by Dan, since his Consistency exemption assumed it stays; the Breach clock "forgives by
lapse" and ADR-004 bars it; "can never be changed" borrows from the wrong object, since a
fingerprint records nothing its owner did and tree rings are what Dan describes. A readable mark is
not the scoreboard its charter vetoes, but a readable mark beside a vote is (Tomkins, Zhang and
Heavlin, 2017: reviewers who could see the authors gave a famous author's paper 1.63 times the odds
of a recommendation to accept), so in a thread every mark gets one size, subject hue at most, the
full mark a tap away. Its bar: a heat reading at least ten times likelier on a record with heat than
on one without. What Dan is missing, in its reading: the mark records what a person wrote about over
time and not how they argued over time; the stranger is a reader no spec has written for, and the
Editorial Voice needs a row for anyone else's view; and legibility raises the price of heat while
the delete cascade lets a person pay it by pruning. It filed a correction to its own morning
position: "record, not score" is true for subjects and false for character. In rebuttal it
**conceded** that its high confidence that the penalty contradicts the specs was misplaced (the
penalty obeys Contributor Identity's "these trade-offs are not bugs" and breaks that document's own
"rare and visible"), and added that the formula draws every record with 44 or more graduations on
all six as one shape within 0.05px (checked: horizon progress is 0.9995 at 44, so every such record
sits at 0.80 on four pillars, 0.70 on Discourse and 1.00 on Consistency). It **conceded** to `legal`
that a drawing can be contested. It holds that counts belong on the profile, Heat and Stance by
season, and never beside a vote, and it keeps the three-comment floor for the public mark on its own
ground, after `security` withdrew it: drawn from two comments, a mark makes two acts the whole
person. Disposition: **carried** on dated acts, on reading events, and on the Breach clock, which
`designer` conceded and `treasurer` reordered; **unresolved** on deleting the penalty (Dan's), on
marks beside votes (unanswered by `designer`, whose thread sketch it targets), and on the floor;
**conceded** on its confidence about the specs and on the contest path.

**security** argued that where the render runs does not decide what leaks; what the renderer is
handed does. From the recovered production build, read and not probed: `/api/comments` returns to
any caller the whole classifier row for every comment in any status, including `emotion`,
`tribal_example`, `borderline_flag`, the compose-time `commenter_message`, and the bodies of
suppressed Breach comments, which the convener confirmed from source; `/api/profile/<id>` returns
every column of a profile row, admin flags included, to draw six integers, with
`stats.tierCounts.breach` for any caller; the snapshots route checks no caller; and anon reads all
36 `axis_scores` rows, so two reads a comment apart would show which pillars that comment earned
(reasoned from source, not measured). Keep `axis_events` closed. Draw every mark from one database
function returning only what the mark draws, at season grain, under five least-data rules (nothing
undrawn, time as a season index, no row ids, no cell under three comments, the Breach residual
computed inside and returned only to an admitted viewer). Narrow `/api/comments` first, because what
it publishes grows with every comment. Also: the mark is an identifier and can never be offered as
anonymous; the Breach level cannot hold on the mark while three other paths publish the same fact
under the member's name; and "can never be changed" and deletion on request are both conventions
today, one a line in a handler and the other nothing. In rebuttal it **conceded** placement to
`architect`: a database projection would be a fourth copy of the derivation, and its per-view replay
is what `treasurer` vetoes, so fold in `packages/core` at write time and store per member and scope.
It kept admission in the database under three testable conditions: the stored table enables RLS with
an `auth.uid()` policy in its creating migration, since new tables arrive granted to anon; pages
read it as the viewer, never with the service key; and only the public render enters a shared cache,
with nothing on the share card. It **withdrew** the three-comment floor, since a watcher already
learns every comment's pillars, so a newcomer renders for its owner from the first comment and goes
public when `legal`'s gate opens. The confirming GET to `/api/comments` waits for Dan; counts by
status would size the exposure without copying any member's text. Disposition: **carried** on
least-data and on admission, both adopted by `architect` as written; **conceded** placement;
**withdrew** the floor. The `/api/comments` narrowing stands unchallenged and is Dan's to deploy. No
factual error found: its claims about production handlers are read from source and say so, and the
convener confirmed the `/api/comments` handler.

**treasurer** argued: fund the geometry fixes as Dan's evenings (Tier 1, rendering only, no
recurring cost; Tier 2, `topicPhases` stored per comment in the same classification pass); veto a
renderer that replays `axis_events` at request time, or opens that table past the anonymous key,
citing the 800 to 1,200 lifetime-comment wall in `docs/Dialecta_Supabase_Scaling.md`; fund
precompute on write; price the human study from Prolific's published rates at $274 to $411 for 144
sessions, and spend $137 at the recommended rate on the two conditions tonight's proxy left open
(the fixed ring against the ledger at profile size, and against the ledger field at byline size),
timed before `circulation`'s next acquisition push; and decide the palette's end state once, so it
is paid for once. The arithmetic checks: $12 an hour for ten minutes plus the 42.8 percent fee is
$2.86 a session, and 48 sessions is $137. In rebuttal it moved the Breach curve behind a ruling,
since a timer is a policy ADR-004 has already set, held its veto, read `architect`'s fold as the
precompute-on-write path it had funded, and accepted that the broken writer, the throwing replay and
the missing renderer come due before the evenings it counted. Disposition: **carried** on the veto
(no seat argues for request-time replay, and `architect` adopted the scaling doc's own
recommendation) and on the study (unopposed; its size is Dan's); **conceded** the Breach ordering.
Factual errors, not corrected by the seat: the scaling doc's 800 to 1,200 figure states no method,
and it is for pure replay "on every classification event," a write (the doc's option C), not a read
at render time; `architect` corrected this in rebuttal. Its Tier 1 table funds the legibility
settings `designer` reversed in the same round (flat opacity 0.84, era boundaries at 1.75x), which
the test read below the shipped render; the dollar figure does not move, but the row prices a
superseded ruling. Its claim that none of tonight's rulings needs a new column, table or API call
did not survive the writer finding or the fold's stored table, which its rebuttal half concedes.

**architect** argued that the fingerprint is one fold over the ledger, "the as-of fold of one
person's append-only record, on six axes, into what they earned, where, in which tier and when,
drawn at one of three levels of detail," defined once in `packages/core`, run on the server beside
the ledger write, stored per visibility scope and served as SVG alike to profile, card and byline.
No renderer should read `axis_scores`: a tier count and a topic list cannot say when anything
happened, so any function of it draws Dolores Vance and her mirror image the same. The ledger the
frame called ready is not: read live, 22 of 27 `axis_events` rows carry no territory and all 5 that
do are Reach, because the writer stamps a topic on Reach alone; a Breach writes no row;
`replayAxisScores` throws on the first live row; and no row carries a rule version. Fix the writer
first and backfill the 27 rows from `articles.topic`. Also: nine hand-written implementations
restate the trade-off pairs, and the reading test ran on a Python copy, so a research CLI in core
should make every reported number come from shipping code; the texture salt had no definition; a
snapshot rendered as stored would invent Heat through a key-name mismatch (every axis with 11 or
more graduations gains one); deletion behaves three contradictory ways (cascade on comment deletion,
delete-then-append on reclassification, an orphaned ledger on profile deletion). Three permanence
rules follow: the record only grows, by superseding rows and tombstones; the fold is as of a moment;
a snapshot is a pointer and a frozen picture. The public fold reads hardened rows only, and growth
is a property test, which the ring model fails by construction (one graduation on the strongest axis
re-spaces every ring, and the penalty pulls partners in) while ledger marks placed by date pass.
Legibility and disclosure are one quantity, set once by the fold's grain. In rebuttal it corrected
itself: a writer that "refolds that member" on each append is the scaling doc's option C, the one
the doc ranks last, and its 4.4ms timed the fold alone, not the fetch. It adopted option A (a
constant-time update per row, the nightly replay kept as the drift check, and a property test that
the two agree), adopted `security`'s three conditions as written, and withdrew its `next/og`
share-card route. Disposition: **carried**. `builder` conceded the writer order, `security` conceded
placement, and `treasurer` calls the fold its funded path. Its corrections to the frame (the ledger
not ready, no `graduation_count` CHECK live, the test run on the Python port) were entered by the
convener. Its own error, option C, it corrected. Its salt finding has since been answered in code:
`fingerprintSalt` in `packages/core/src/fingerprint-plan.ts` hashes `profiles.id`, and the new
profile hero uses it.

**builder** argued that the render had nowhere to land: `apps/web/src/app/profile/[id]/page.tsx` was
a sixteen-line placeholder, no Fingerprint component existed in the app that will ship, every ruling
was a patch against a quarantined engine or a Python script, and nothing in `apps/web` writes the
ledger (`api/comment/route.ts` leaves the hook unwired on purpose until the promotion pipeline
exists). So build the writer and the renderer before tuning more pixels, with the pure maths in
parallel. Its costs, in sessions sized like the core files shipped today: renderer 2.5 to 3 (paint
plan, client island, loader), legibility 1.75 to 2, the Breach curve with its own date query 1.25 to
1.5, seasons 1 to 1.5, the `axis_events` reader 1, the carousel discard under 0.25; 8.5 to 9 in all,
of which 2.5 to 3.25 are pure functions portable today. Also: `comment_id` cascades on delete, so
"can never be changed" is false as built until an event survives its comment. In rebuttal it
**conceded** `architect`'s writer-first order (0.25 to 0.5 session, landing first), re-costed its
loader from the anon-key pattern to service-role only, put the total at 8.75 to 9.5 sessions, and
conceded that "quarantined" oversold the recovered tree, which is what production runs; its carousel
point stands for `apps/web`. Disposition: **carried** on "nowhere to land" as filed and on the
costs, which `treasurer` priced from; **conceded** the writer order. Two later facts. Its
service-role loader is ruled out by `security`'s second condition, which `architect` adopted in the
same round, and builder has not answered. And since builder filed, a first renderer has appeared on
disk (files last modified between 22:40 and 22:57 tonight: `packages/core/src/fingerprint-plan.ts`,
`apps/web/src/components/fingerprint/Fingerprint.tsx`, and a 63-line profile page). It overtakes
"nowhere to land," reads `axis_scores` through the anon client, ports the current engine with its
noise floor and penalty intact (its own header: "The model debate is still running. None of it is
built"), and draws the mark for every viewer.

**spec-reader** argued that the page and specs make four false claims about the render: the Emerging
copy's "Old Heat persists at the center; outer rings calm" (`_theme/page-fingerprint.hbs` line 266,
where the engine weights turbulence 0.3 at the core and 1.0 at the rim, the opposite); "seven
independent channels, each carrying one signal, none of them sharing" (`docs/FINGERPRINT.md`, where
purity feeds the noise and turbulence compounds with recency and maturity); saturation driving
colour (documented, absent from the recovered engine, built in
`packages/core/src/fingerprint-texture.ts`); and that a stranger can read pillar identity from the
shape alone (71 percent with no legend). Also: the trade-off penalty is visible and no spec says so,
or in which direction; and the specs never say whether a stranger alone, with no legend, is a reader
at all. In rebuttal it accepted the convener's corrections to its brief (the no-legend misses were
Wen Zhao against Father Anselm and Marcus Aurel against Tom Reilly, not "100% confusion" and not
Anselm against Marcus; seven of seven notes described heat, not "21 of 21"; saturation is built in
core) and tied its list to `legal`'s and `philosopher`'s findings. Disposition: **carried** on the
false-claims list, which no seat disputed and which `legal` adopts as the copy fix. Factual errors:
four in its brief and body, corrected in rebuttal, and three more that were not. Its rebuttal calls
`designer`'s first fix "ratio-capping at the rim," which is the core fix; it describes the
single-mark condition as "21 readers" at "100 percent accuracy with legend, zero chance without it,"
when that condition had seven readers, three scorers and no no-legend arm; and its table repeats
`FINGERPRINT.md`'s claim that the carousel renders "perfectly smooth," when the noise floor still
waves it at turbulence zero, as `philosopher` observed. Its rebuttal ran 366 words against a 300
cap. Missing from its list: ADR-004's own texture table reads "Wave texture in the inner rings" as
"Earlier Stance behaviour that resolved into Forum," a reading the ring model cannot produce for the
same reason as the Emerging copy. `philosopher` names the same sentence in Contributor Identity; no
seat names the ADR.

**Not convened: `migrator`, `reviewer`, `voice-editor`.** None filed and none was asked. The debate
hands each of them work. `migrator`: the baseline's invented `graduation_count` CHECK and its wrong
constraint names (`architect`'s finding 10), the form of the Breach residual row, the 27-row
backfill, and revoking anon SELECT on `axis_scores` once a stored model exists. `reviewer`: the
standing check that no migration adds a select policy on `axis_events`. `voice-editor`: the copy
fixes on `spec-reader`'s list and the wording of any line about permanence.

## Chair synthesis

### Legibility

At profile size with a legend, the shape reads. The shipped ring matched 19 of 21, the ledger 21 of
21, and each reader beat chance individually (odds of 0.4 percent). Without a legend, 15 of 21,
missing where a pillar decides. At byline size the ring carries size alone, 5 of 21; the ledger
field matched 21 of 21 at confidence 3 of 10.

Heat does not read. Given one mark alone, Dan's own case, the notes matched back to their people 21
of 21, and every one described a heated person, three of them people with almost none. The composed
noise fix left two of those three heated, moved Dolores Vance's early heat to "lately," and cut
blind matching to 15 of 21. Timing cannot read: the ring draws from tier totals with no dates, so
reversing Dolores's history leaves her mark unchanged.

Limits: one vision model, not people; matching allows elimination; seven people written to differ;
ledger timing tuned per person; descriptions built from the render's inputs; a convener-written
legend; a Python copy of the engine, whose failing formulas every copy shares.

### One model

`designer`, `philosopher` and `architect` reached one object. **The fingerprint is a person's
append-only record, folded once on the server and drawn outward in time: angle is the pillar a
comment moved, distance from the centre is when, colour is the subject, and every judging mark sits
at the dated act that earned it, countable back to its comments.**

The parts do not fit yet. The noise floor gives every line heat's grammar; the penalty draws less
than was earned; the rings re-space as the strongest pillar grows; the writer records a subject for
Reach alone and nothing for a Breach. What fits: subject colour laid down in time, the soft horizon,
and the light colour Dan liked, which comes from palette lightness and blend, whatever data drives
hue.

### Dan's six properties

| Property | Verdict |
| --- | --- |
| No two the same | Holds in shape for seven people (94.9 percent of pillar orderings survive), untested on a crowd. Records with 44 or more on all six share one silhouette |
| Personal identity | Holds on a profile; the mark identifies its owner anywhere, and beside a vote becomes rank |
| The good, bad and ugly | Fails: heat on calm people; a Breach has no row and no tested channel. Holds only as dated acts with a zero that looks like zero |
| Grows, never changed | Fails: cascading deletes, the penalty, re-spacing rings. Can hold for the record; the drawing must stay correctable |
| Organic | Holds, if texture judges nothing |
| Readable at a glance | Partial: pillars and subjects at profile size with a legend; fails small, false on heat, silent on timing |

Organic and readable collide on the shared wobble; readable and the good, bad and ugly trade
directly, because legibility turns the mark into an assertion.

### Build order

| # | Item | Cost | Buys |
| --- | --- | --- | --- |
| 1 | Writer: a subject on every row, a row per Breach, a rule version, the 27-row backfill | 0.25 to 0.5 session | Every later item's input |
| 2 | Marks owner-only; copy that stops teaching timing; `spec-reader`'s list corrected | Copy, one switch | No false sentence reaches a stranger |
| 3 | Counts beside the mark ("Heat, none"); the floor gated on turbulence | Small | A zero that looks like zero |
| 4 | The penalty deleted, if Dan agrees | One constant | Petals only grow |
| 5 | The fold in core, stored per scope at write time, read as the viewer; growth test; research CLI | 3.5 to 4 sessions, less tonight's renderer | One definition, one mark everywhere |
| 6 | `designer`'s items on the fold: radius floor, season arcs, Breach by dilution, revised interior, palette once | 4 to 5 sessions | Lands once, in shipping code |
| 7 | Snapshots as pointer and picture | A column or two | Permanence the owner can check |
| 8 | The study, its bars set first (`legal`'s one in five, `philosopher`'s ten to one) | $137 | Evidence to go public, and to choose ring or ledger |

Ahead of the list, outside the fingerprint: narrow `/api/comments`. Unfunded by agreement: per-view
replay.

### What Dan is missing

"Tell the story" makes the platform the narrator. Once a stranger can read the mark, each channel is
the platform's claim about a named person, and tonight three of seven were false.

The ring holds what a person wrote about in order, never how they argued in order. "Arrived angry
and learned" needs the mark drawn from dated events, which the ledger holds and no renderer reads.

"Can never be changed" is a promise about the record, and today anyone holding a member's
harvestable id can delete that member's comment inside the hour.

Nothing draws the model yet. The carousel shows seed rows on the fallback, the ledger has no writer,
and the first real renderer, on disk since tonight, draws the old model for every visitor.

### Convergence

No mark on a share card; `axis_events` closed and never replayed per view; the writer first; the
model stored at write time and read as the viewer; the noise floor as the cause of false heat; no
clock on the Breach.

### Disagreement

The penalty: `philosopher` deletes it now, `designer` retires it last, and the spec calls the
trade-offs intentional. The container: `designer` keeps the silhouette, but only marks placed by
date pass `architect`'s growth test, and 19 against 21 of 21 does not settle it. Colour: territory
separates the closest pair 44 percent better, and Dan asked for axis; the smooth blend he liked also
pulls against `designer`'s crisp season seams.

### Options

| Option | Now | Later | Forecloses |
| --- | --- | --- | --- |
| A. Public ring now, with the noise fixes | Cheapest | Calm people read as heated, knowingly | A clean first impression |
| B. Owner-only now; writer, then fold, public after the study | 8.75 to 9.5 sessions, $137 | Public profiles wait | Nothing permanent |
| C. The ledger render now | B's cost plus an untested renderer | Best on growth and heat | The ring look Dan liked, before the study |

### Recommendation

B. The rerun carried it: the debate's one cheap drawing fix turned "ran hot early on" into "running
hot lately," the false implication `legal` predicted, so no drawing fix is safe to show a stranger
before the mark reads dated events. Holding the mark back costs weeks; publishing it wrong puts
false sentences about named people into caches no setting reaches. The study settles the container.

Dan's: colour; the penalty; what a deleted comment leaves; the gate and its bars; what the Breach
setting governs; the study's spend; which use comes first, a mark alone or a thread; the
`/api/comments` deploy and its confirming GET.

## For Dan, in the morning

Can a stranger read the fingerprint? Partly. Shown one at profile size with a key, readers could
tell which pillars are strong, what someone writes about and how long they've been here. At byline
size it reads at chance.

Heat reads wrong. Every reader of a single mark described a heated person, including three people
with little or no heat. One test profile, Father Anselm, has no heat at all, and his reader wrote
"lately their arguments have been getting heated." The cause is the wobble every mark gets so it
looks alive, which the page teaches as heat. The mark also cannot say when someone ran hot: it is
drawn from totals with no dates. The designer's best fix made a reformed person look hot lately.

Once strangers can read the mark, what it says is the platform's statement about a real person, and
today some of it is false.

The Council recommends:

- Show each fingerprint only to its owner until it passes a test with real people.
- Fix what the database records first: the subject of every comment, and a row for every Breach.
- Build the fingerprint once, from that record, for every place it appears.
- Print plain counts beside the mark ("Heat, none") so calm reads as calm.
- Keep it off share cards.

Tonight's first real fingerprint in the new app uses the old model and shows every visitor. Hold it
to owner-only before launch.

Yours to decide:

1. Colour by subject or by pillar. Either can keep most of the light, glowing look you liked,
   which comes from pale colours and smooth blending.
2. Whether to delete the trade-off rule, which draws some earned pillars shorter. On one test
   profile it drew a joint-strongest pillar fifth of six.
3. What deleting a comment does to the mark: leave nothing public, or erase the history too.
4. Whether marks stay owner-only until they pass, and the bar they must clear.
5. The small study at $137, or the full one at $411.
6. What comes first: a mark seen alone on a profile, or several together in a thread, and
   whether they sit beside vote buttons.
7. Narrowing the comments API, which by its source code sends every comment's classifier notes and
   hidden Breach text to anyone who asks. Separate from the fingerprint, and more urgent.

## Outcome

Pending Dan. `decider` writes the ADR once he rules on the numbered list above, and each seat then
updates its `positions.md`.
