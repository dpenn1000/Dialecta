# Opinion maps and the declaration

## Brief

The overlay reads shorter than the Question assumes. The engine's roughly 446-word reading sits
behind a `<details>` disclosure, closed by default on both localhost:3050 and dialecta.org: a
reader sees about 300 words unless they open it. The surface that needs attention has no spec
section at all. The maps render three pole-marker colors, gold `#f0a018`, blue `#1a6ff0`, red
`#e83516`, as hardcoded hex with no token behind them, off a private "paper/brass/wood" palette
that exists nowhere in `design/dialecta-design-spec.html`. The gold marker measures 2.12:1 against
its own card, under the 3:1 floor for a graphical object.

## The maps have no home in the spec

`design/dialecta-design-spec.html` v1.3 runs Sections 01 through 12, color through component
library. None is the opinion map. What ships instead is a second token set I found in the live
stylesheet, not the spec: `--paper`, `--brass-mid`, `--wood-warm`, and eight more. `--brass-warm`
equals `--gold` (`#d4a84a`) today, but it is a different variable: the next retune of `--gold` will
not reach this surface, unnoticed until a screenshot looks wrong. My charter calls this drift mine
to raise.

The three marker dots go further: literal fill attributes, no token at all. Section 01 calls the
palette warm neutrals with gold as the only chromatic accent; the map adds a saturated blue nothing
else on the platform uses. Against `--paper-bright` (`#fffdf8`, WCAG relative luminance): gold
2.12:1, red `#e83516` 4.17:1, blue `#1a6ff0` 4.51:1. Pole label text is fine, built from the muted
siblings of the same hues (4.80 to 7.99:1), so the fix already exists two lines away: swap the fill.

Verified on two articles (this piece's binary map, Knowledge Without Borders' second ternary):
"Where the author lands" appears only under a multi-map article's last map. Every earlier map
carries the identical gold target icon, uncaptioned. On "specificity and relevance": the 3 to 20
character pole budget (`skills/opinion-mapper/SKILL.md`) renders cleanly at every width I tested,
desktop through 380px; what fills that budget is the prompt's call, not the component's.

## The wordiness question, corrected

Dan's 685 words are real in `articles.declaration` and `ai_analysis`, not in the render. I measured
the overlay at 307 words on dev and 314 on live before opening "How the engine read this," both
under the reading Dan flagged. Reasoning, alignment, detected claim, note to the author, three
passages, three tensions: all one click away, never forced. The open question is whether a reader
finds the click, not whether 685 words get forced on them. The disclosure's only affordance is a
13px label and a small caret (live) or the browser default (dev), neither reading as clickable as a
button should.

A sharper problem sits in live's own copy: it tells every signed-out reader to tap each map and
place themselves. Tested: cursor stays default, nothing fires, no sign-in prompt appears. The copy
promises an action the surface cannot complete for the reader holding it, the same failure my D-2
already logged against the composer's disabled button.

## Recommendations

| Do | Costs | Forecloses |
|---|---|---|
| Give opinion maps a spec section; retire paper/brass/wood for the canonical tokens, or document the mapping on purpose | An afternoon, a five-article check | Drift from the next palette pass, D-24's fixes included |
| Swap the three bright marker fills for their already-built muted twins | Three hex values | Nothing |
| Caption every map's marker at first use, not only the last | One repeated string | The explain-once pattern |
| Keep the disclosure closed by default; strengthen its affordance and gate the "tap to place yourself" line behind sign-in | A conditional string, an auth check already on the page | Nothing |

The spec change in row one is Dan's call, per the charter.

## Rebuttal

The strongest point against me is legal's, and it lands on row four. The fold I cited to shrink the overlay also holds the locked sentence. Legal's check of both builds finds it inside the collapsed toggle, which my account omitted. A reader who never clicks sees the tier without the line saying the reading never gates publication. "Closed by default" keeps the constraint true in markup only. I concede that.

Legal's recommendation 4 is the fix, and it leaves the reading folded. Row four becomes: move the sentence into the summary row, beside the tier it captions, and make the whole row the control. That adds 20 words, about five seconds at 238 words a minute, and settles the affordance and the constraint together.

I oppose circulation's recommendation 3, folding the author's three fields. The fold belongs to the engine's reading; hiding the declaration while the tier stays visible inverts "the author's voice is the published one." The voice demonstration shows those fields at 98 words instead of 239. Only 141 of its 485 saved words reach a reader today; the other 344 sit behind the fold.

The other rows:

- Row one grows. Legal's sentence placement, philosopher's field order and circulation's spec passage all land on a surface with no section, so the section takes whichever Dan adopts, alongside the palette.
- Row three keeps its rule, and its string waits on Dan. Philosopher finds all seven author marks equal the engine's proposed coordinate; legal reads the author's Save as consent. "Author's position" or "Engine's estimate" follows his ruling.
- Row two stands. No other seat touches the 3:1 floor, and a contrast ratio needs no reader data.
