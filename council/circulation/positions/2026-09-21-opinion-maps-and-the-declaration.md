## Brief

The maps' specificity problem is an arrival problem. This seat's strategy is that a shared article
carries its own proof, not an ad asking a stranger to trust an unfamiliar homepage. A binary map,
"Fixed tradition" against "Open inquiry," or a ternary pole ("Drift to excess") that never answers
its own question, is the first proof of platform difference a share-driven stranger meets, and it
reads like a stock quiz. The wordiness half is smaller than the raw count suggests: on both live and
localhost, three quarters of Declare sits behind one click, collapsed by default. Strongest
evidence: opinion_map_positions holds 9 rows, share_events holds 7, all from May 1 to May 6, 2026,
nothing since.

## Specificity is an arrival problem

My charter's founding sentence is Dan's own: a shared article carries its own proof. That only
holds if what a stranger finds after clicking through proves something. I opened Declare on
"On the Far Shore of Fear" on both `localhost:3050` and `dialecta.org` and found identical content.
The binary map answers "Where does meaning come from?" with poles "Fixed tradition" and "Open
inquiry." Neither passes the opinion mapper skill's own tests (`_recovered/api/_skills/opinion-mapper.js`:
"the 18-year-old test," "the 'I think...' test"): they are the two words anyone would already guess
from a philosophy-adjacent site, not a stance a reader recognizes as specifically theirs. The
ternary map's "Drift to excess" pole fails a different rule in the same file for the reason the
convener already named: the question is what humans need to find meaning, and drifting to excess is
not a need anyone would claim, it is a prediction about other people's failure.

A reader meeting this arrived, overwhelmingly, from Facebook: currently 100 percent of Dialecta's
non-direct arrival by this seat's own measurement (`research/2014-metafilter-acquisition-concentration.md`).
They meet the platform's signature feature at its least specific, during the one shot at a first
impression Dan has already locked as a launch condition.

This is fixable in the engine, not the mission. Two of five published articles never got a
confident top pick at all: `recommended_maps` empty, the author choosing from three or four
candidates instead. That is the model telling the system it was not sure. `classify.js` already
enforces rules like this mechanically for synthesis poles and label length (`checkPoleSynthesis`,
`checkTopicShape` inside `validateAnalysis`); a matching check for whether a pole answers the stated
question in the first person would have caught Far Shore's ternary the same way the existing nine
catch a stretched shape. The platform has already applied this exact standard one field over: live
hardcodes a fake "12 voices" on every article regardless of truth (`article-spine/discourse-count.ts`'s
own comment calls it "exactly the made-up data the port-or-rewrite ruling keeps out"), and the
rebuild replaced it with a real count for the same reason a fabricated-looking number breaks a proof
the reader is meant to check. Map specificity is that principle applied one level up.

## Binary is the weakest thing to share

Whether a binary map serves the platform's anti-binary mission is philosopher's question. Mine is
narrower: of the three shapes, binary is also the least distinctive thing to screenshot.
`Dialecta_Social_UX_Architecture.md`'s own viral mechanics, the Fingerprint reveal, an interesting
shape, bet on unusual shapes being what a reader shares unprompted. A two-pole slider is the most
familiar shape on the internet; a sharp ternary triangle is not. The skill itself ranks ternary
above cartesian above binary as "the platform's strongest tool against tribal polarization"
(`opinion-mapper.js`, "Shape preference order"). Circulation's own reason to want that order held is
that it is also the platform's strongest tool against looking like every other site's poll.

## The wordiness, measured

The convener's 685 to 813 words are real, but on both hosts the AI's reading, the largest share of
every total, sits inside a native `<details>` element in `declaration.tsx`'s `AiDisclosure`
component, closed by default, no JavaScript required. Across all five articles that hidden share
runs 65 to 95 percent of the total, averaging about three quarters. What reaches a reader
who opens Declare, unclicked, is Core Claim, Scope Boundary, and Strongest Objection: 239 words on
Far Shore, as few as 24 on "Knowledge Without Borders." That is real cost at exactly the moment my
charter prices highest, the first ninety seconds after finishing a piece, and it sits inside a modal
that dims the article rather than an inline block a reader can skim past.

The real cost is smaller than 685 words, and none of it reaches a reader who never opens Declare.
Both hosts' share buttons carry only a title and a URL. Localhost's Open Graph card is a clean,
static title card; live's current card differs (it spills article prose into `og:description`
rather than a written summary, a live-only gap outside today's question and flagged separately), but
even it carries no map or engine content. The wordiness risk stays confined to readers who already
finished the article and chose to go deeper, precisely the population circulation most needs to get
right, but not the mass-audience problem the raw total suggests.

## What the data forecloses

`opinion_map_positions` holds 9 rows, May 1 to May 6, 2026. `share_events` holds 7, May 3 to May 6.
Both sit inside the same personal-network window my standing positions already price as spent, and
nothing in either table since. No measured reader behavior on the maps exists to design against,
warm or cold. Any recommendation that assumes readers engage, ignore, or share because of the maps
as they exist today, including some of what follows, is a considered guess, not a finding.

## Recommendations

1. Add a tenth honesty check to the opinion-mapper skill, and a matching mechanical validator, for
   whether a pole answers the stated question in the first person. Costs one skill edit plus roughly
   fifteen lines in `classify.js`'s `validateAnalysis`, no schema or migration change. Forecloses
   nothing; it raises the bar the same way the existing nine already do.
2. Log when an author picks a candidate other than the top-confidence one, alongside formal
   overrides. Every candidate already carries a confidence score by the skill's own schema, so this
   is a small write against data the picker already has.
   `opinion_map_overrides` sits at 0 rows despite two of five articles showing exactly this signal.
3. Collapse Core Claim, Scope Boundary, and Strongest Objection into their own disclosures, matching
   the pattern already built for the AI's reading. Costs a small change to the shared `Field`
   component, no content change, no new client JavaScript. Forecloses some immediate density: a
   reader who opens Declare today sees the author's own words first, unfolded; this trades that for
   less forced reading. Name it as a real tradeoff, not a free win.
4. Do not force a third pole onto an article that is honestly binary. When a published map set is
   all-binary, log it for an editor's attention rather than blocking or restructuring; the skill's
   own honesty checks already guard against a forced ternary, and this seat's shareability
   preference should not override that guard. Costs one warning line. Forecloses nothing.
5. Do not build a map-specific or dynamic share card yet. The current static title card already
   matches what `legal` and I settled in
   `exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md`: a
   dynamic per-article card multiplies legal's review surface, and there is no organic sharing yet
   to amplify it. Revisit once Facebook-driven cold arrivals are measured, the threshold
   already standing in `positions.md`. The cost of waiting is that the maps stay invisible
   off-platform a while longer; the cost of not waiting is engineering and legal review spent on an
   audience that does not exist yet.

## Where I would touch the design spec

`design/dialecta-design-spec.html` has no section describing what a share-driven stranger sees
first, or why specificity matters there; its opinion-map material predates the current three-shape
system. I would add a short passage naming the map as the platform's first proof point beyond its
own walls, so future design passes weigh shareability alongside mission fit instead of treating the
map as a purely on-platform engagement feature. That is a content addition, not a redesign, and it
is Dan's call.

## Rebuttal

Legal's screenshot-verified finding is the strongest opposing point. The fold behind my wordiness finding cuts the forced read and also hides the locked line, "never used to gate publication." I priced only the first and concede the second: a reader who never clicks meets the tier word without its basis. The finding survives on designer's count, 307 to 314 words before any click, about 80 seconds. I back legal's row 4 (the closing line beside the tier badge); it costs my argument nothing.

Rec 3, folding the author's three fields behind disclosures, is withdrawn. Legal's row 1 rests on the author's dot being "shown beside their own basis," and unclicked, those three fields are the only basis on screen. Philosopher's row 6 also puts the Strongest Objection first, and the voice demo's budgets reach 98 words without a fold.

Rec 1 changes twice. `validateAnalysis` checks structure only, so the fifteen-line validator I priced can't decide whether "Drift to excess" answers "What do humans need to find meaning?" Philosopher's row 2 gives the code something checkable, a `pole_statements` field with one sentence per pole, and deletes the skill's example list. I missed that list; SKILL.md lines 92 to 101 hold "Free for all," "Pay your way" and "Trust the data," all shipped verbatim.

Rec 4 loses its carve-out. The skill has no binary-specific honesty check. Philosopher shows both binaries on record hid a richer shape, and row 1 falls back to a cartesian, which forces no third pole. My case for ternary first was a shareability guess. I no longer resist retiring the binary or ranking by fit to the tensions (philosopher's rows 1 and 3).

Recs 2 and 5 stand; my spec passage joins designer's proposed opinion-map section.
