# Opinion maps and the declaration

*Council review, convened 2026-09-21 at Dan's request. Chair: `decider`. Protocol:
`.claude/skills/dialecta-council/SKILL.md`.*

## Question

Dan, 2026-09-21: "I would like the council to review this essential function of the site."

1. **The opinion maps.** Do they do their job? In particular the binary map, set against the
   platform's aim of moving readers past binary thinking; the options the AI chooses for each map,
   which Dan says need "a level of specificity and relevance" he doesn't feel the current ones have;
   and how the maps look in the context of the platform design spec.
2. **Wordiness.** "How likely is a reader to actually read all of this": the Declare overlay, the
   author's declaration followed by the engine's reading, which Dan pasted in full for "On the Far
   Shore of Fear" (about 690 words, measured below).

The outcome is a recommendation for Dan, with concrete changes a builder can take: rules for the
options the AI proposes, what happens to the binary map, word budgets or structure for the overlay,
and what the maps should look like.

## Constraints already locked

- **The engine's reading is disclosed, never a gate.** The overlay closes on "The engine's reading
  is disclosed alongside the article, never used to gate publication. The author's voice is the
  published one." Whatever changes, that stays true.
- **The design spec is locked** (root `CLAUDE.md`: "Concept vs. code: the spec wins"). A seat may
  recommend changing the spec; that is Dan's call, and it is named as such.
- **Brass never letters on paper** (D-27).
- **The copy is Dan's.** Seats propose; Dan decides. Same rule as the Pact review.
- **The tier scheme and the classifier's weighting are locked** (40/35/15/10).
- **The maps capture positions only.** The delta, the reveal and Reviser detection (Stages D to F)
  were never built, live or here (backlog D-3). Reflect and Declare placement ship today
  (`670faa4`).

## Evidence

Measured by the convener on 2026-09-21 from `articles.declaration` and `articles.ai_analysis` on
project `mguulnibvzusfvyuowwh`. Words are whitespace-separated tokens.

**The maps: seven across the five published articles, six ternary and one binary, no cartesian.**

| Article | Type | Question | Options |
| --- | --- | --- | --- |
| On the Far Shore of Fear | ternary | What do humans need to find meaning? | Reach for beauty · Drift to excess · Need the struggle |
| On the Far Shore of Fear | binary | Where does meaning come from? | Fixed tradition · Open inquiry |
| On Doubt and Devotion | ternary | What do you do with religious doubt? | Settle the doubt · Leave the faith · Stay with doubt |
| Knowledge Without Borders | ternary | How should education be funded? | Free for all · Pay your way · Help if needed |
| Knowledge Without Borders | ternary | What actually ends poverty? | Schools first · Jobs first · Direct aid |
| The Conversation Communities Keep Having (solar) | ternary | How should communities judge solar projects? | Trust the data · Stay skeptical · Local matters most |
| The Moment You Stop Waiting | ternary | What jolts you out of autopilot? | A new place · Fresh attention · A close call |

In three articles the declared maps equal the AI's `recommended_maps` verbatim; in the other two
`recommended_maps` is empty and the author chose from `candidate_maps` (3 and 4 candidates).

**The overlay's length, in words.**

| Article | Core claim | Scope boundary | Strongest objection | Engine's reading* | Total |
| --- | --- | --- | --- | --- | --- |
| On the Far Shore of Fear | 77 | 74 | 88 | 446 | 685 |
| The solar piece | 46 | 62 | 117 | 588 | 813 |
| On Doubt and Devotion | 40 | 51 | 94 | 347 | 532 |
| The Moment You Stop Waiting | 30 | 48 | 57 | 403 | 538 |
| Knowledge Without Borders | 5 | 14 | 5 | 421 | 445 |

\* Tier reasoning, alignment note, detected core claim, note to the author, the marked passages
(quote and reason) and the tensions. Map labels and static headings are extra.

At 238 words a minute, the average silent reading rate for non-fiction in Brysbaert's 2019
meta-analysis (*Journal of Memory and Language* 109), 685 words is about three minutes, asked of a
reader who has just finished the article.

**Where the options come from.** The engine proposes maps when an article is classified
(`_recovered/api/article/classify.js`, fields `recommended_maps` and `candidate_maps`); the author
picks or accepts them in the editor (`_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx`,
`dialecta-editor.jsx`); `_recovered/api/article/admin-resetup-maps.js` re-runs the setup. The new
app renders them from `components/opinion-map/` and `components/article-declaration/`.

**What a reader sees.** `http://localhost:3050/articles/on-the-far-shore-of-fear`, Declare in the
reading spine (signed out it shows the read-only maps), and live's same piece at
`https://www.dialecta.org/on-the-far-shore-of-fear/`.

**Three things the convener noticed, stated as facts, for the seats to weigh:**

- In "On the Far Shore of Fear" the Scope Boundary argues a critic's case ("A critic could argue
  that...") rather than bounding the claim, and the Strongest Objection makes much the same case.
- The overlay prints the author's Core Claim and then, further down, the engine's "Core Claim the
  Engine Detected", which restates it at 57 words.
- The ternary options on that piece don't answer their own question in parallel: "Drift to excess"
  is a prediction of what people do, not something humans "need to find meaning".

**Checked by the convener after the positions came in** (database read, 2026-09-21), for two
claims that seats made and others cited without checking:

| Article | Tier column | Final tier | Tier inside `ai_analysis` | Alignment | Published | Row last updated |
| --- | --- | --- | --- | --- | --- | --- |
| On the Far Shore of Fear | forum | forum | **spark** | aligned | 2026-04-27 | 2026-05-03 |
| On Doubt and Devotion | forum | forum | forum | aligned | 2026-04-27 | 2026-05-03 |
| The solar piece | forum | forum | forum | aligned | 2026-04-08 | 2026-05-03 |
| The Moment You Stop Waiting | forum | forum | forum | aligned | 2026-04-29 | 2026-05-04 |
| Knowledge Without Borders | spark | spark | spark | aligned | 2026-04-29 | 2026-05-04 |

The two-readings split is real and belongs to one article: Far Shore's page badge says Forum and its
overlay says Spark. All five readings are `aligned`, so the detected core claim restates the author's
on every article today. Every reading was rewritten after publication.

## Seats

Convened: `philosopher`, `designer`, `circulation`, `legal`. Not convened, with no stake in the
question: `security`, `treasurer`. Evidence, not a seat: `voice-editor` writes a demonstration of
the overlay at target lengths, attached as
`council/log/2026-09-21-opinion-maps-and-the-declaration-voice-demo.md`.

## Briefs

*Each seat's own brief, verbatim, in seat order. Full positions: `council/<seat>/positions/2026-09-21-opinion-maps-and-the-declaration.md`.*

### circulation

The maps' specificity problem is an arrival problem. This seat's strategy is that a shared article
carries its own proof, not an ad asking a stranger to trust an unfamiliar homepage. A binary map,
"Fixed tradition" against "Open inquiry," or a ternary pole ("Drift to excess") that never answers
its own question, is the first proof of platform difference a share-driven stranger meets, and it
reads like a stock quiz. The wordiness half is smaller than the raw count suggests: on both live and
localhost, three quarters of Declare sits behind one click, collapsed by default. Strongest
evidence: opinion_map_positions holds 9 rows, share_events holds 7, all from May 1 to May 6, 2026,
nothing since.

### designer

The overlay reads shorter than the Question assumes. The engine's roughly 446-word reading sits
behind a `<details>` disclosure, closed by default on both localhost:3050 and dialecta.org: a
reader sees about 300 words unless they open it. The surface that needs attention has no spec
section at all. The maps render three pole-marker colors, gold `#f0a018`, blue `#1a6ff0`, red
`#e83516`, as hardcoded hex with no token behind them, off a private "paper/brass/wood" palette
that exists nowhere in `design/dialecta-design-spec.html`. The gold marker measures 2.12:1 against
its own card, under the 3:1 floor for a graphical object.

### legal

Verified by screenshot on both localhost:3050 and dialecta.org, before and after clicking: the
engine's full reading, ending in "disclosed alongside the article, never used to gate publication,"
does not render by default. It sits inside a collapsed "How the engine read this" toggle; only the
tier word shows without that click. The debate's locked constraint requires that sentence to stay
true regardless of what changes. Today it is true only where the markup is technically reachable,
not where a reader who opens Declare encounters it. Consent and the Milkovich disclosed-
basis defense both turn on what a reader was shown, not on what merely existed in the page.

### philosopher

The maps work against the thesis in two places the engine's prompt controls. The binary sorts
readers two ways: in two minimal-group experiments, a two-way split produced in-group bias and a
three-way split did not, unless competition was primed (Hartstone and Augoustinos 1995; Spielman
2000). The poles name the author's side by its hope and the other side by its failure, in the
author's own words: "Drift to excess" compresses his Strongest Objection, and "Fixed tradition"
echoes his "reverence without a fixed address." Retire the binary; name every pole as the people
who hold it would. On the overlay, lead with the Strongest Objection and take the Note to the
Author off the reader's page.

## Rebuttals

*Each seat's rebuttal, verbatim, in seat order. Under 300 words each.*

### circulation

Legal's screenshot-verified finding is the strongest opposing point. The fold behind my wordiness finding cuts the forced read and also hides the locked line, "never used to gate publication." I priced only the first and concede the second: a reader who never clicks meets the tier word without its basis. The finding survives on designer's count, 307 to 314 words before any click, about 80 seconds. I back legal's row 4 (the closing line beside the tier badge); it costs my argument nothing.

Rec 3, folding the author's three fields behind disclosures, is withdrawn. Legal's row 1 rests on the author's dot being "shown beside their own basis," and unclicked, those three fields are the only basis on screen. Philosopher's row 6 also puts the Strongest Objection first, and the voice demo's budgets reach 98 words without a fold.

Rec 1 changes twice. `validateAnalysis` checks structure only, so the fifteen-line validator I priced can't decide whether "Drift to excess" answers "What do humans need to find meaning?" Philosopher's row 2 gives the code something checkable, a `pole_statements` field with one sentence per pole, and deletes the skill's example list. I missed that list; SKILL.md lines 92 to 101 hold "Free for all," "Pay your way" and "Trust the data," all shipped verbatim.

Rec 4 loses its carve-out. The skill has no binary-specific honesty check. Philosopher shows both binaries on record hid a richer shape, and row 1 falls back to a cartesian, which forces no third pole. My case for ternary first was a shareability guess. I no longer resist retiring the binary or ranking by fit to the tensions (philosopher's rows 1 and 3).

Recs 2 and 5 stand; my spec passage joins designer's proposed opinion-map section.

### designer

The strongest point against me is legal's, and it lands on row four. The fold I cited to shrink the overlay also holds the locked sentence. Legal's check of both builds finds it inside the collapsed toggle, which my account omitted. A reader who never clicks sees the tier without the line saying the reading never gates publication. "Closed by default" keeps the constraint true in markup only. I concede that.

Legal's recommendation 4 is the fix, and it leaves the reading folded. Row four becomes: move the sentence into the summary row, beside the tier it captions, and make the whole row the control. That adds 20 words, about five seconds at 238 words a minute, and settles the affordance and the constraint together.

I oppose circulation's recommendation 3, folding the author's three fields. The fold belongs to the engine's reading; hiding the declaration while the tier stays visible inverts "the author's voice is the published one." The voice demonstration shows those fields at 98 words instead of 239. Only 141 of its 485 saved words reach a reader today; the other 344 sit behind the fold.

The other rows:

- Row one grows. Legal's sentence placement, philosopher's field order and circulation's spec passage all land on a surface with no section, so the section takes whichever Dan adopts, alongside the palette.
- Row three keeps its rule, and its string waits on Dan. Philosopher finds all seven author marks equal the engine's proposed coordinate; legal reads the author's Save as consent. "Author's position" or "Engine's estimate" follows his ruling.
- Row two stands. No other seat touches the 3:1 floor, and a contrast ratio needs no reader data.

### legal

**`philosopher`'s veto is the strongest point against row 1, and it lands on the caption.** The picker passes the engine's `author_position` through and the editor only previews it (`dialecta-editor.jsx` lines 1855 to 1895), so the dot is the engine's estimate under "Where the author lands." Save accepts a placement without authoring one, and my consent theory covered only that. The architecture stands. Row 1 becomes: caption every dot as the engine's placement until, per philosopher's recommendation 4, the author sets it.

**Row 6's exposure has already happened.** The re-setup update writes `declaration`, `ai_analysis` and `updated_at`, never `ai_suggested_tier` (`admin-resetup-maps.js` lines 99 to 106). Philosopher reads Far Shore's header as Forum and its overlay as Spark after a May 3 rewrite. Two readings on one page undercut the disclosed-basis defence: the basis shown must be the basis used. Row 6 gains a step: write tier and analysis together, and reconcile Far Shore now.

**Row 5 changes twice.** Philosopher's recommendation 8 corrects my "restatement costs nothing to cut": true while alignment is `aligned`, false once it is partial or divergent, when the detected core claim must show. The voice demo's passage locators pass, since the article carries the quote; its dropped reasons do not.

**`circulation`'s fold, conceded in part.** Nine placements and seven shares, none after May 6, lower row 4's urgency. Row 4 stays: the fold cuts reading cost yet leaves the locked sentence unshown, and moving that sentence fits `designer`'s closed-by-default. Circulation's recommendation 3, folding the declared fields too, would remove the only basis shown by default (row 1's premise); the flagged passages already sit behind the toggle.

**Row 3 stands.** "On Doubt and Devotion" is a ternary with a "Leave the faith" pole, so the sensitive category outlives the binary.

### philosopher

The strongest point against me is legal's first: the author saw the dot and clicked Save, so the
mark is the author's. Save accepts a candidate. It does not place a dot. The picker offers two to
four packages, normalizes the chosen one, and offers no way to move the coordinate; all
seven live marks equal the engine's proposal exactly. Legal shows the dot is
defensible, not that "Where the author lands" is true. Legal's own Article 9 finding is the better
argument for row 4: legal calls a Save close to specific consent on a religion axis, and an author
who places the dot has given it.

Circulation would log an honestly binary article rather than restructure it. Row 1 forces no third
pole. It forecloses the yes-or-no map and takes a second tension, and the one live binary sits
beside a ternary on the same article, so retiring it costs a second map, not the only one.

Conceded to legal. Row 6 renders the closing disclosure sentence outside the fold, beside the tier
word: my reorder left the locked constraint true only in markup. Row 8 keeps all three marked
passages whole with their reasons, not the Stance one alone. Row 9 adopts versioning and a fresh
Stage 2.5 on any substantive re-run, which is why Far Shore's note answers a reading its
author never saw.

Conceded to circulation. Nine placements measure nothing, so the binary case rests on Kaplan and
the three to five tensions the skill already requires, not on transfer from minimal groups. But
circulation's collapse and legal's defence cannot both stand: that defence is the author's three
fields on screen beside the dot. Keep the Strongest Objection open.

Designer's uncaptioned target: when row 4 reveals the mark, caption it on every map.

## Chair

### The roll-call

**philosopher.** Argued that the maps work against the platform's thesis at two points the engine's
prompt controls, and that the overlay's problem is order and ownership rather than length: retire
the binary as a reader-facing shape, since a bipolar scale's midpoint confounds holding both ends
with holding neither (Kaplan 1972) and Far Shore's author holds both ends while the line plots him
at 0.82; name every pole as the people who hold it would name it, against four honesty tests; rank
candidates by fit to the article's own tensions; caption the author's dot as the engine's estimate
until an author can set it; lead the overlay with the Strongest Objection; take the Note to the
Author off every reader surface; show the detected core claim only when the alignment is partial or
divergent; write one engine tier per page. **Carried**, with two corrections. The seat conceded its
own minimal-group transfer (Hartstone and Augoustinos 1995; Spielman 2000) as unmeasured here, and
the binary case is stronger without it, resting on Kaplan plus the skill's own requirement of three
to five tensions per article, which keeps a second debate always in hand
(`_recovered/skills/opinion-mapper/SKILL.md`, "Shape preference order" and the candidate-set rules).
Its citation of the design spec's Advocate Card overreaches: that card's spec'd surfaces are the
compose flow, the pre-publish reflection and the Advocate archetype profile, never the published
overlay (`design/dialecta-design-spec.html`, Section 11). The reorder survives on Lord, Lepper and
Preston; the spec does not already authorize it, which moves it to Dan.

**designer.** Argued that the overlay reads at about 307 words on dev and 314 on live before any
click, so Dan's 685 is a database count rather than a render; that the opinion maps have no section
anywhere in the design spec's twelve; that the three pole-marker fills are hardcoded hex off a
private paper, brass and wood palette the spec never names, with the gold marker at 2.12:1 against
its own card, under the 3:1 floor for a graphical object; and that the author's marker is captioned
once, under a multi-map article's last map only. **Carried.** Checked in source: `AiDisclosure` is a
native `<details>` with no `open` attribute (`apps/web/src/components/article-declaration/declaration.tsx:93`);
`POLE_COLORS` is three literals (`apps/web/src/components/opinion-map/engine.tsx:50-53`) plus a
fourth axis set carrying a green the platform uses nowhere else (`:62`); `--brass-warm` in
`styles/dialecta-surfaces.css` and `--gold` in the generated `styles/tokens.css` are both `#d4a84a`
under two names in two files, so the next retune of one misses the other; the author legend renders
once per section after every figure (`declaration.tsx:172-179`). Half of its row 4 is already done:
the port dropped live's "tap to place yourself" line on purpose (`apps/web/src/strings.ts`, the
`opinionMap` docblock), so that broken promise belongs to live alone and dies at cutover.

**circulation.** Argued that specificity is an arrival problem, because a share-driven stranger
meets "Fixed tradition" against "Open inquiry" as the first proof the platform differs from a stock
quiz; and that the wordiness half is smaller than the raw count, because about three quarters of
Declare sits behind one click on both hosts. **Conceded.** Both findings carried, and three of five
recommendations came back changed by the seat's own hand: rec 3 (fold the author's three fields)
withdrawn, rec 1's fifteen-line validator withdrawn as undecidable by regex, rec 4's carve-out for an
honestly binary article dropped. Recs 2 and 5 stand. Its measurement is the discipline the rest of
this log runs under: `opinion_map_positions` holds 9 rows and `share_events` 7, none after
2026-05-06, so no recommendation here may claim reader behaviour as evidence, including its own.

**legal.** Argued that the locked sentence ("disclosed alongside the article, never used to gate
publication") renders only inside the collapsed toggle on both builds, so the constraint holds in
markup and not on the screen of a reader who opens Declare; that the disclosed-basis and consent
defences extend to the author's dot and the flagged passages; that a candidate map on a religion
axis is an inferred special category under GDPR Article 9 and the California definition, and should
say so in its `rationale` before the author's Save; that the quoted passages, their stated reasons
and the closing sentence are the disclosed basis and may not be trimmed away; and that
`admin-resetup-maps.js` can silently outdate a sign-off. **Carried.** Checked in source: the footer
sits inside `.ad-disclosure-body` (`declaration.tsx:128`), and the re-setup writes `declaration`,
`ai_analysis` and `updated_at` and never `ai_suggested_tier`
(`_recovered/api/article/admin-resetup-maps.js:99-106`), which is the mechanism behind Far Shore's
two readings. Row 1 conceded in part, correctly: `normalizeRecommendedMap` copies `author_position`
through untouched (`_recovered-next/lib/theme/dialecta-opinion-map-picker.jsx:67,83,92`) and the
editor only reads it for preview (`dialecta-editor.jsx:1865,1876,1889`), so the Save consents to a
placement nobody authored, and the caption has to change.

**voice-editor demonstration, evidence and not a seat.** Rewrote Far Shore's overlay at the shortest
length that keeps every claim: the author's three fields from 239 words to 98, the engine's reading
from 443 to 99, and a label-by-label audit of every static heading. Its Part A is adoptable as the
author-side budget, and it demonstrates that 34, 27 and 37 words hold every claim the originals
make. Its Part B is not adoptable as written: it compresses the three marked passages to a single
naming line, dropping the quotes and their reasons, which legal names as the disclosed basis itself
and philosopher independently keeps whole. Two findings in it stand on their own. The Scope Boundary
on that article argues a critic's case in all three sentences and duplicates the Strongest
Objection, which is the convener's first observation confirmed field by field. And the live
Strongest Objection carries an em dash, a hard-rule miss sitting in author-entered data.

### The synthesis

**One fact nobody priced, and it reorders everything.** Three seats wrote engine-side
recommendations and costed them as small edits: "roughly fifteen lines in `classify.js`", "a prompt
edit, one smoke run". The article-classification path exists in this repo only under `_recovered/`,
which is quarantine, read and never edit. Root `api/` holds comment classification alone
(`classify.js`, `comment.js`, `profile/`). No backlog row ports the article path: A-1 to A-4 are the
comment pipeline, D-1 was the render port that shipped. Production runs from a different repo at a
May commit (root `CLAUDE.md`, "Where things live"). Every map recommendation below is blocked on
where that code lives and who deploys it.

**Where the seats converged.** The pole rule: all four want a check that each pole answers the
stated question in the first person, and the skill has no such check today (its nine cover the
18-year-old test, ternary and cartesian, and nothing for binary). The fold stays: designer, circulation and philosopher all keep the engine's reading collapsed. The
locked sentence comes out of it: legal proposed, designer and circulation backed it, philosopher
conceded its reorder had left the constraint true in markup only. The quotes and their reasons stay
whole. And one measured item settles the pole complaint at its root: three of twenty live poles
("Free for all", "Pay your way", "Trust the data") are verbatim copies from a calibration list whose
own text reads "Do NOT copy any of these verbatim into your output" (`SKILL.md`, "What concise pole
labels look like"). The list teaches generic. Delete it.

**Where two seats looked opposed and were not.** Circulation priced the fold as cutting the forced
read; legal priced the same element as hiding the locked sentence. Both are true of one `<details>`,
and each conceded the other's half. Nothing needs a further round.

**The options on the maps.**

| Option | Now | Later | Forecloses |
| --- | --- | --- | --- |
| A. App only: caption, contrast, question, the closing sentence | A day in `apps/web`, no smoke run | Poles stay generic, since nothing that proposes them changed | Nothing |
| B. A, plus the engine rules, after the classifier has a home | The port, a prompt edit, a smoke run against the calibration set | New maps get specific; the seven live ones do not until a versioned re-run | Nothing |
| C. B, plus retiring the binary and re-setting Far Shore now | One published article's map set changes after publication | The Reflect binary prompt copy goes unused | The yes-or-no map; a two-sided article becomes a cartesian carrying a second tension |

**Recommendation: B now, C once versioning lands, and the overlay changes in the same pass.**

The reason that carried it is a collision the seats did not name. Philosopher's row 1 requires
re-setting Far Shore's maps. Legal's row 6 shows an un-versioned re-set is what produced Far Shore's
two readings, a page whose badge says Forum while its overlay says Spark. Retiring the binary before
the versioned path exists reproduces, on the same article, the defect this council just diagnosed.
The order is forced.

On the maps: delete the calibration list, add the answers-its-own-question check with a
`pole_statements` field so the validator has something checkable, rank candidates by fit to the
article's tensions and tag each with the tensions it covers, and name a sensitive-inference category
in the candidate's `rationale` before the author's Save. The tensions are the one artifact already
specific to the article, and the engine's own better material sits there: "Updated data versus
projection skepticism" against the shipped "Trust the data".

On the overlay: a reader sees the Strongest Objection, then the maps with their question drawn on
every figure, then the Core Claim and Scope Boundary, then one summary row carrying the tier and the
sentence that says the reading never gates publication, with the engine's reading folded behind it
and its quoted passages intact. Author-side budget: 35, 30 and 40 words, enforced by a counter at
compose time, never by the engine rewriting a declaration. That is about 150 words before a click,
roughly 40 seconds, against 307 today.

### What is Dan's

1. **Does the article-classification path get a home in this repo, with a named deploy target?**
   Recommend yes. Unlocks every map recommendation here; without it they are edits to quarantined
   files that reach no author.
2. **Retire the binary as a reader-facing shape?** Recommend yes, sequenced after item 10. Unlocks
   philosopher's row 1 and returns the prompt to the Project Brief's own launch recommendation.
3. **Do the opinion maps get a section in the design spec?** Recommend yes. Unlocks designer's
   palette fix, circulation's arrival passage and philosopher's field order, all of which currently
   land on a surface the spec does not describe.
4. **Does the author's dot get captioned as the engine's estimate?** Recommend yes; the copy is
   yours. The picker proves the claim: the coordinate passes through untouched and no editor
   affordance moves it. Unlocks designer's row 3, which is waiting on this string.
5. **Do authors set their own mark before publishing?** Recommend yes, after item 4. Unlocks the
   true version of "Where the author lands" and gives legal's specific-consent reading something
   real to rest on.
6. **Does the Note to the Author leave the reader's page?** Recommend yes. The spec calls that card
   the reflection prompt "between submission and publishing" (Section 10), and no seat argued to
   keep it. Unlocks 57 words and takes a verdict on the author off a reader surface.
7. **Does the overlay lead with the Strongest Objection?** Recommend yes, and note it as a spec
   extension rather than something the Advocate Card already covers. Unlocks the reorder.
8. **Does the engine name a sensitive-inference category in the candidate's rationale before Save?**
   Recommend yes. Cheap, and "On Doubt and Devotion" shows the exposure outlives the binary.
   Unlocks a Pact sentence later, if a candidate ever triggers it.
9. **Do the author's three fields get word budgets at compose time, at 35, 30 and 40?** Recommend
   yes. Unlocks the voice demonstration's Part A as a standard instead of a demonstration.
10. **Does a substantive re-run require a fresh Stage 2.5 sign-off and a logged prior version?**
    Recommend yes. Unlocks item 2 safely and closes the two-readings hole.
11. **Does Far Shore's page settle on Forum, the tier its author was shown and the final tier, with
    the overlay's Spark overwritten?** Recommend yes. Unlocks one reading per page today, before any
    of the above ships.
12. **Adopt the voice-editor's label corrections?** Recommend yes for "The Claim", "The Engine's
    Reading" and cutting "Two debates this article opens."; the "Author's Position" row waits on
    item 4, since the honest caption today is the engine's estimate. Copy is yours.

### What can be built now without a ruling

**Engine prompt and classification.** A different kind of change: it alters what the model proposes,
and it needs `smoke-classify.mjs` against the calibration set (4 to 10 minutes) before anything
reaches an author. All of it depends on question 1, and the smoke script is quarantined alongside
the code it tests.

- Delete the calibration example list. `_recovered/skills/opinion-mapper/SKILL.md`, "What concise
  pole labels look like", and its deployed twin `_recovered/api/_skills/opinion-mapper.js`.
- Add honesty check 10 (each pole answers the stated question in the first person) plus a
  `pole_statements` field in the output schema, and a presence-and-form case in
  `_recovered/api/article/classify.js` `validateAnalysis`. A regex cannot judge the answer, only
  that the statement exists and parses; circulation conceded this and it should not be oversold.
- Rank candidates by fit to the article's tensions, and tag each candidate with the tensions it
  covers. `SKILL.md`, "Shape preference order" and "Candidate set rules".
- Add the sensitive-inference sentence to the `rationale` instructions. `SKILL.md`, output schema
  section. Depends on question 8.
- Remove binary from the shape list and the candidate rules, plus a validator case.
  `SKILL.md`, "Binary (last resort)" and "Candidate set rules". Depends on questions 2 and 10.
- Version the re-setup write: log the prior `declaration` and `ai_analysis` into `admin_audit_log`,
  write `ai_suggested_tier` alongside `ai_analysis`, and route a substantive change through Stage
  2.5. `_recovered/api/article/admin-resetup-maps.js:86-107`. Depends on question 10.

**App only.** No engine change, no smoke run.

- Promote the closing disclosure sentence into the summary row beside the tier, and make the whole
  row the control. `declaration.tsx:93-102` and `:128`, `declaration.css`,
  `strings.ts` `opinionMap.declaration.aiDisclosure.footer`. Depends on nothing.
- Condition the detected core claim on the alignment value rather than a raw string inequality. The
  current guard at `declaration.tsx:140-143` hides the field only on a byte-identical match, which
  is why 57 restated words render on an article marked `aligned`. `declaration.tsx`,
  `components/opinion-map/data.ts`.
- Draw the question on the interactive figures. A signed-in reader placing in Declare sees no
  question; a signed-out one does, through `MapTopicCaption` (`engine.tsx:201-207`). The caption
  renders only when a `prompt` is passed (`placement-client.tsx:704-711`) and Declare passes none
  (`declaration.tsx:164`).
- Give the Declare placement a privacy line. The string already exists and renders in Reflect
  (`article-spine/spine.tsx:112`), and the post-read placement carries none.
- Caption every map's marker, not only the last. `declaration.tsx:172-179`, or move the legend into
  `OpinionMapFigure`. The string itself depends on question 4.
- Swap the three bright marker fills for their muted twins, already built two lines away.
  `engine.tsx:50-63`.
- Resolve the token drift: point the map at canonical tokens, or document the mapping on purpose.
  `engine.tsx`, `styles/dialecta-surfaces.css`, `styles/tokens.css`. Depends on question 3 for
  which direction.
- Fix the em dash in Far Shore's stored Strongest Objection. Data, not code:
  `articles.declaration` on project `mguulnibvzusfvyuowwh`.
- Reorder the fields, and remove the Note to the Author. `declaration.tsx:149-151` and `:183-193`.
  Depends on questions 6 and 7.

## Dan's decisions

Dan, 2026-09-21, in the session, against the chair's twelve questions.

| # | Question | Dan |
| --- | --- | --- |
| 1 | The article classifier gets a home in this repo, with a named deploy target | Yes |
| 2 | Retire the binary as a reader-facing shape | Yes |
| 3 | The opinion maps get a section in the design spec | Yes |
| 4 | Caption the author's dot as the engine's estimate | **Only if the author did not select one.** "The Author should be encouraged to select opinions, and build out the options before it is published. We had an AI suggestion tool in the old model, with the Author having control over the final axes." |
| 5 | Authors set their own mark before publishing | Yes |
| 6 | The Note to the Author leaves the reader's page | Asked what it is; answer pending |
| 7 | The overlay leads with the Strongest Objection | Sure |
| 8 | The engine names a sensitive-inference category in the rationale before Save | Sure |
| 9 | Word budgets of 35, 30 and 40 on the author's three fields, at compose time | Yes |
| 10 | A substantive re-run needs a fresh Stage 2.5 sign-off and a logged prior version | Yes |
| 11 | "On the Far Shore of Fear" settles on one tier | Asked for clarification; answer pending |
| 12 | Adopt the voice-editor's label corrections | Asked for an explanation; answer pending |

**How the convener read item 4.** "Select one" means the author set their own position on the map.
Today no author has: all seven live marks equal the engine's proposal exactly (philosopher, checked
against the picker). So today every dot is captioned as the engine's estimate, and a map carries the
author's caption only once its author sets the mark.

**What the old model did, checked against the recovered editor.** Dan's memory is right about the
axes. `dialecta-opinion-map-picker.jsx` offered the engine's two to four candidates and a "Build my
own" exit; `dialecta-editor.jsx` `MapEditor` (line 1897) then let the author change the map type and
edit every pole, axis and topic field (`TernaryFields`, `CartesianFields`, `BinaryFields`), remove a
map, or add a blank one, up to two. What the author never had was control of their own position:
`MapPreview` (line 1845) only draws `map.author_position`, which the engine supplied. The Template's
Question 5 ("Suggest 2 to 3 axes or poles you think readers will actually split on", author-seeded,
engine refines) never reached the build either.

**Not yet decided:** items 6, 11 and 12. The ADR and each seat's `positions.md` follow those answers.
