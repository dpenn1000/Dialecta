---
id: 2026-09-20-legal-06
type: handoff
from: legal
to: [decider]
subject: Consent moments, framed and ready for the chair to dispatch to three seats
backlog: A-1, A-10, M3
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Dan called the Council on a question in session and it is framed at
`council/log/2026-09-20-consent-moments.md`, step 1 of `/dialecta-council` complete.

**The question.** Which moment-in-time sign-offs ship, at which launch phase, and what does the
platform record when a contributor gives one?

**Where it came from.** Dan asked whether the platform can take incremental, transparent sign-offs
at the points where something is about to be published about a contributor, rather than burying
everything in one agreement at sign-up. `legal` answered at
`council/legal/positions/2026-09-20-consent-at-the-moment.md`. Dan then called the Council on that
answer.

**The seats, and what each is being asked.** Named in the frame with a specific question each,
because a seat handed a general question returns a general answer.

| Seat | The question only it can answer |
| --- | --- |
| `philosopher` | Its standing position P-4 says the permanent Contrast Strip may push contributors to declare low. Option C tells them the strip is permanent at the exact moment they choose. Does that sink C, sharpen it, or mean the permanence is what should change? Separately: is disclosure-at-the-moment the honest version of what the platform believes, or the platform asking consent for something it should not do? |
| `designer` | Does a one-time disclosure before a contributor's first comment cost first comments? `legal` has said on the record it will drop that moment if the funnel judgment says yes. Also: is "sign-off" even the right pattern where Stage 2 and the article flow already require an act? |
| `treasurer` | Opportunity cost against 269 visitors, 6 real people, 3 comments. Build cost and carry cost priced separately, since the shown-text-version column implies copy versioning forever. And the counter-argument nobody has made: a consent record is an asset, not only a cost |

**What is already filed, so no seat repeats work.** Six rows in the frame's table, pointing at
four `legal` research notes and two `legal` positions. The frame also names `philosopher`'s open
blindspot `2026-09-19-002` as the sharpest collision in the debate.

**The options.** A, nothing new. B, two lines of copy on moments that already exist plus the
record. C, four moments, which is what `legal` proposed. D, every relevant moment. The frame
notes that phasing is a second decision: a seat may back C on substance and still argue none of
it is pre-launch work.

## Not done

**Step 2 has not run.** No seat has written a position. The chair dispatches.

**`legal` is not neutral and must not chair this.** It wrote the proposal. Its position is already
on the record and it should be treated as one of the arguments rather than as the frame.

**The record's design is unresolved and belongs to `migrator`, not to this debate.**
`exchange/open/2026-09-20-legal-05` asks whether the live project already has somewhere to write
consent events before anyone proposes a table. That answer should land before or alongside the
chair's synthesis, because option B and option C both depend on it and `treasurer` cannot price
what nobody has scoped.

**Nothing here proposes a spec edit.** The Stage 2 copy in `docs/Dialecta_Discourse_Layer_UX.md`
and the article flow in `docs/Dialecta_Article_Editorial_Template.md` are Dan's. Any copy that
survives the debate reaches him as a proposal.

## Governing spec

`.claude/skills/dialecta-council/SKILL.md`, the six step protocol, read together with
`docs/plans/phases-and-missions.md`, "The mission handoffs": each mission reaches the Council as
one record to the chair, and the chair dispatches to seats, runs rebuttal where seats disagree,
and writes the outcome.

Where the two differ, the phases document governs and this record follows it. The skill's step 2
says the lead launches the three seats itself. The phases document routes everything through the
chair. Dan confirmed the second in session on 2026-09-20: seats are not called directly.

## Acceptance

Three positions at `council/<seat>/positions/2026-09-20-consent-moments.md`, each passing
`python scripts/voice_check.py --strict` at zero hard hits. Rebuttals where seats disagree. A
chair synthesis naming the option that carried and why, appended to
`council/log/2026-09-20-consent-moments.md`. Dan decides.

**This would be the first position any seat has contested.**
`docs/plans/phases-and-missions.md` records eleven position files and no position contested by
another seat. That makes the debate worth running even if the answer turns out to be option A.

## Traps

- **`legal` called the three seats directly before filing this, and Dan corrected it.** Three
  subagents were launched and stopped. None wrote a file, so there is nothing to clean up and no
  partial position to mistake for a real one. Recorded because the mistake is easy to repeat: the
  council skill's own step 2 tells the lead to launch seats, and it is superseded.
- **`designer` and `treasurer` are not registered agent types in this session.** Only
  `philosopher`, `legal`, `decider`, `security`, `builder`, `reviewer`, `spec-reader`, `migrator`
  and `voice-editor` resolve. The charters, positions and research trees for both seats exist as
  files and are complete, so a seat can be run from its charter. The chair should know this before
  dispatching rather than discover it mid-run.
- **The four proposed strings pass the voice regex at zero hard and zero soft.** That is not the
  same as landing, and `designer` is asked to rewrite any that read as a warning. Nobody should
  treat a clean `voice_check` as `voice-editor`'s approval.
- **The convenient-conclusion flag is deliberate.** `legal` argues that plain language is
  simultaneously more ethical and more defensible, and has flagged in its own position that
  convenient convergences deserve more scrutiny. `philosopher` is asked to press on exactly that.
  A rebuttal that accepts it is worth less than one that tests it.
- **Breach is out of scope and saying so is part of the answer.** No sign-off is possible where the
  platform suppresses text and publishes a characterisation of it. Every other surface gains from
  this approach and that one gains nothing. A seat that proposes a Breach sign-off has missed it.

## Do not touch

- `council/legal/` and `exchange/open/2026-09-20-legal-*`. This session is holding them and lands
  its own work.
- `docs/Dialecta_Discourse_Layer_UX.md` and `docs/Dialecta_Article_Editorial_Template.md`. Specs
  are Dan's, and `.claude/hooks/guard-docs.mjs` enforces it. Copy changes are proposals.
- `council/log/2026-09-20-consent-moments.md` below the `## Positions` heading. The frame is
  written; positions, rebuttals and synthesis are the chair's to append.
