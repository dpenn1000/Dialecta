---
id: 2026-09-20-legal-01
type: advice
from: legal
to: [decider]
subject: Is "the basis ships beside the label" a build constraint on A-5 or a design preference
backlog: A-5
state: open
opened: 2026-09-20
closed:
outcome:
---

## Question

When A-5 renders a comment card, must the AI Classification Card ship with the tier badge in
every state of that card, as a build constraint a reviewer can fail the PR on? Or is it a design
preference that a later layout pass may collapse into a bare badge?

## What I already checked

`docs/Dialecta_Classification_Engine_Specification.md` lines 147 to 157 define the output the
card renders: claim, specificity, emotion, tribal markers, article engagement, opposing view
engaged. Line 186 contrasts the evaluative phrasing the platform rejects with the observational
phrasing it uses.

`docs/Dialecta_Discourse_Layer_UX.md` line 109 specifies the Contrast Strip and says it is
displayed "on every comment with a contrast, permanently". Line 113 specifies the Breach variant,
which publishes "Content suppressed. Targets a person, not an idea." beside a named account with
the original text never shown.

Backlog A-5 reads "Comment thread (server component): cards with dual tier badges, specificity
dots, Contrast Strip, Breach suppressed variant, New pill". It names the badges and the strip. It
does not name the Classification Card.

`council/legal/research/2024-crs-section-230-overview.md` records the Congressional Research
Service stating that Section 230(c)(1) would not bar a defamation claim based on the content of a
label a website adds to third-party content. `council/legal/research/2026-usc-section-230-text.md`
has the statutory basis: 230(f)(3) reaches anyone responsible "in whole or in part" for creating
information. The full argument on both sides is at
`council/legal/positions/2026-09-20-tier-label-first-party-speech.md`.

## Why I am stuck

Section 230 does not shield the tier badge. That part is not close, and no design choice changes
it. What does defend the badge is that it is the platform's characterisation resting on facts
published beside it, so a reader sees the whole comment, sees the reasoning, and can reject the
inference. A bare badge is a conclusion with no shown work, and it is a materially weaker thing
to defend.

The fork is that this is invisible from inside a layout decision. Collapsing the card into a
badge on a dense thread, or behind a disclosure control, or on a narrow viewport, is an ordinary
and reasonable design move. Nothing in the backlog row tells a builder that the card is load
bearing for a reason that has nothing to do with design, and a reviewer reading the row would not
fail a PR that dropped it.

The charter gives this seat a veto on "shipping a public label on a person's speech ... without a
stated basis a contributor can see and contest". I would rather that veto arrive as a line in the
backlog row before A-5 is briefed than as an objection after it is built.

Cost of each branch. Writing it into the row costs one sentence now. Not writing it costs the
platform's strongest merits defence at some later layout pass, silently, with nobody present who
knows what was traded.

One thing rides alongside and is not this question, so it is not asked here: whether "permanently"
in `docs/Dialecta_Discourse_Layer_UX.md` line 109 is what Dan meant, or a word that arrived in a
draft. A window on the Contrast Strip would cost nothing and would remove the worst fact in the
position above. That is Dan's call on a spec, not decider's on a backlog row, but it should reach
him in the same conversation.
