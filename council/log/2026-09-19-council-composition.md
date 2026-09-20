# How many advisors, and who is in the room

*2026-09-19. Framed by `decider` for Dan directly, not for the advisors. The council cannot
argue its own governance; charters and roster are Dan's. Nothing here is decided.*

## Question

Whether the council is fixed at three seats, and whether every seat argues every question or
the chair picks the ones that look relevant.

## What Dan said

Two things, and they pull in opposite directions.

> I don't think we need a limit on council members. The number of council members should be
> dependent on the ask and the scope of what is needed.

> We also need to be careful not to overly leave council members out, because we may make
> changes to the design or finance plan without realizing there is a psychology concern.

The first asks for a roster that flexes per question. The second asks for nobody to be missing.
Sizing per question means leaving someone out, by a guess about who is relevant, which is
exactly the guess the second sentence says will be wrong. They resolve once the roster and the
per-debate rule are treated as separate questions.

## What is already true

Step 2 of `.claude/skills/dialecta-council/SKILL.md` launches all three at once with the same
prompt. There is no subset selection anywhere in the protocol, so a finance decision cannot
ship without `philosopher` having argued it. The scenario in the second quote is already
prevented, and three is not what prevents it.

## The real defect

Not skipped seats. Missing ones. Four gaps in the current roster:

| Not represented | What goes unargued |
| --- | --- |
| The reader who never comments | Most of a publication's audience. Nav, tiers and cards are all argued from the contributor's side |
| Legal and safety exposure | Defamation, harassment, a Breach comment that is a real threat, liability when the classifier is wrong |
| Dan's hours | `treasurer` counts dollars. A feature can be cheap in money and expensive in evenings |
| Accessibility | Contrast on the gold family, screen readers on the classification card |

P0-D2 is a live instance. Open sign-up on a discourse platform is a moderation and safety
question at least as much as a design one, and no seat holds that today.

## What constrains size, honestly

Two things, and neither is the roster.

Step 3 says each advisor reads "the other two positions." At N seats that is N-1 reads each,
so a debate costs on the order of N squared: six position reads at three seats, thirty at six.

And the chair compresses N positions into two to four options under a 700 word cap. Past about
five seats it starts dropping arguments to fit, which is the same leaving out, moved downstream
where nobody sees it happen.

## Recommendation

| | Rule | Why |
| --- | --- | --- |
| Roster | No cap. A seat is added when a mandate gap is named, not when a question arrives | One charter and one folder, about two Sonnet calls per debate. Cheap |
| Per debate | Every seat runs. Never pick a subset | Picking requires guessing who cares, and that guess is the failure mode Dan named |
| Spending less | Council or no council, which the skill already has: a spec gap with one obvious answer goes to `decider` alone | That is the dial. A partial council costs most of a full one and hides what it dropped |
| Past five seats | Change step 3 so each advisor reads a chair written digest of the others instead of all N positions | Keeps cost linear and keeps the cap from being enforced silently by the chair's word budget |

The uncertainty worth naming: the digest rule is untested. A digest written by the chair is the
chair choosing what each advisor gets to rebut, which is real influence for a seat that is
supposed to have no mandate. If it is adopted, the digest belongs in the log verbatim so the
choosing is visible.

## What it blocks

Nothing in `docs/plans/backlog.md` directly. It gates the first real council run, because
P0-D2 is framed and waiting and the roster question decides who is in the room for it.

## Outcome

Open. Dan decides. When he does, this and
`council/log/2026-09-19-advisor-mandates.md` become ADR-004 together, since a roster rule and
a mandate rewrite are one decision about what the council is.
