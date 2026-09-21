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

## Chair
