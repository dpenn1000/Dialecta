# Moment-in-time sign-offs: which ship, at which phase, and what gets recorded

*2026-09-20. Council frame, step 1 of `/dialecta-council`. Called by Dan in session.*

## Question

Which moment-in-time sign-offs ship, at which launch phase, and what does the platform record
when a contributor gives one?

## Where this came from

Dan asked whether the platform can take incremental, transparent sign-offs at the points where
something is about to be published about a contributor, rather than burying everything in one
agreement at sign-up. `legal` answered at
`council/legal/positions/2026-09-20-consent-at-the-moment.md` and Dan has now called the council
on it.

**This is the first position any seat has put up to be contested.**
`docs/plans/phases-and-missions.md` records the gap: twenty-one open exchange records, zero
closed, eleven position files, and no position contested by another seat. The mechanic exists in
`exchange/SCHEMA.md` and has never been used. The output of this debate matters twice over, once
for the decision and once because it is the loop running for the first time.

## What `legal` has already filed, so no seat repeats the work

| Claim | Where |
| --- | --- |
| The moments mostly already exist, specced for philosophical reasons | `council/legal/positions/2026-09-20-consent-at-the-moment.md` |
| Consent to publication is a complete defence, and its limit is scope | `council/legal/research/1977-restatement-583-consent-to-defamation.md` |
| A disclaimer is worth close to nothing; a disclosed basis is worth a great deal | `council/legal/research/1990-scotus-milkovich-v-lorain-journal.md` |
| A suggestion sign-off records authorship, not consent, and is governed by Roommates.com | `council/legal/research/2008-ca9-roommates-material-contribution.md` |
| Section 230 does not shield the tier badge, the commenter message or the Breach notice | `council/legal/positions/2026-09-20-tier-label-first-party-speech.md` |
| Breach admits no sign-off and never will | same |

`legal` is not neutral here and should not be read as the chair. It wrote the proposal.

## The options

| | Option | What ships |
| --- | --- | --- |
| **A** | Nothing new | The Pact plus the copy already in the specs. Argue that the existing surfaces are sufficient and the rest is ceremony |
| **B** | Two lines, no new moments | One line of copy added to Stage 2 and to the article pre-publish pause, both of which already exist as blocking choices. Plus the record |
| **C** | Four moments | B, plus a one-time disclosure before a contributor's first comment, plus a line when a contributor applies an AI suggestion. Plus the record. This is what `legal` proposed |
| **D** | Every relevant moment | C, plus nomination, plus anything later that publishes about a person |

Each option also carries a phasing question, and the two are not the same decision. A seat may
back C on substance and still argue that none of it is pre-launch work.

## Proposed copy, for seats to argue with rather than accept

All four pass `python scripts/voice_check.py --strict` at zero hard and zero soft. Passing the
regex is not the same as landing.

> **First comment, once.** This is your first comment, so here is what happens next. The engine
> reads it, names a tier, and both its reading and yours stay on the comment.

> **Stage 2, replacing the existing contrast note.** The engine reads this as [X] and you are
> declaring [Y]. Both stay on this comment for as long as it is posted, and that contrast is part
> of the record.

> **Article pre-publish, beneath the three existing choices.** Publishing puts the engine's
> reading beside your article, in your name. You can amend first, answer it for the record, or
> let it stand.

> **Applying a suggestion.** These are formatting suggestions and they do not change your words.
> Applying one is recorded as your edit rather than the engine's.

## The record

Whatever ships, `legal` argues one append-only table written at each moment: the profile, which
moment, what was chosen, **which version of the shown text was seen**, the timestamp, and the
comment or article it attached to. The fourth column is the one usually omitted and the only one
that cannot be reconstructed afterwards.

Cost, build effort and whether this is pre-launch work are open, and belong to `treasurer` and
`migrator` rather than to `legal`.

## Constraints already locked

| Constraint | Source | What it rules out |
| --- | --- | --- |
| Editorial Voice v1.2 governs every string a contributor reads. Observational, never evaluative, two sentences, no dashes, and every message below Breach ends with the door open | root `CLAUDE.md` | Any sign-off written in legal register. A consent notice that reads as a warning |
| Stage 2 already blocks posting until a tier is selected, and the self-declaration panel already shows the AI Classification Card | `docs/Dialecta_Discourse_Layer_UX.md`, Stage 2 | Arguing that an affirmative act has to be invented. It exists; what is at issue is what is disclosed beside it and what is stored |
| The article flow already offers amend, respond for the record, or post as-is, and the AI analysis is "disclosed alongside the published article, never used to gate publication" | `docs/Dialecta_Article_Editorial_Template.md` | Any option that gates publication on a sign-off |
| `aesthetic-suggest` is explicitly forbidden from touching content | `exchange/open/2026-09-19-005` | Treating the suggestion moment as urgent today. It is cheap insurance against a feature that does not exist yet |
| Advisors write only in their own folder and `council/log/`. Specs are Dan's | `exchange/README.md`, `.claude/hooks/guard-docs.mjs` | Any position that proposes to edit `docs/` directly. Spec changes are proposals to Dan |
| The spec wins over the code. Surface drift, propose a fix, do not amend the spec silently | root `CLAUDE.md` | Settling the Stage 2 copy in a component and backfilling the document |

## What the measurement says, because it bears on every option

From `docs/plans/phases-and-missions.md`, M2: 269 visitors all time, 6 real people, 0 paying, 3
comments. Any argument that this is urgent pre-launch work has to survive that number, and any
argument that it is premature has to say what changes when a stranger who is not a friend of Dan's
gets a tier applied to their first comment.

## An open question from another seat that this debate touches

`philosopher` has an open blindspot at
`exchange/open/2026-09-19-002-blindspot-contrast-strip-self-declaration.md` arguing that the
permanent public Contrast Strip may push contributors to declare low, so that self-declaration
measures caution rather than calibration. **Option C tells the contributor the strip is permanent
at the exact moment they choose their tier.** If that position is right, the proposed Stage 2 copy
makes the effect worse by naming it. That is the sharpest collision in this debate and
`philosopher` should take it head on rather than restate the blindspot.

## Positions

Not yet run. Step 2. Each seat writes to
`council/<you>/positions/2026-09-20-consent-moments.md` and the results are appended here.

## Rebuttals

Not yet run. Step 3.

## Chair synthesis

Not yet written. Step 4.

## Outcome

Open. Dan decides.
