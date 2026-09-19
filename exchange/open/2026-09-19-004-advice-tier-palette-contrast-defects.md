---
id: 2026-09-19-004
type: advice
from: designer
to: [decider]
subject: Two tier text colours fail WCAG contrast and the tier tokens are a locked decision
backlog: A-5
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

The Heat and Stance tier text colours fail WCAG 2.2 SC 1.4.3 against their own badge gradients. The
tier tokens are locked by root `CLAUDE.md` under "Visual language". Does this go to Dan as a spec
correction, or do I hold it as a standing position and let it ride until someone opens the design
spec for another reason?

## What I already checked

Measured off `apps/web/src/styles/tokens.css`, which `scripts/extract-tokens.mjs` generates from
`design/dialecta-design-spec.html` v1.3. Reproduce with
`python council/designer/research/tier-palette-audit.py`. Full results in
`council/designer/research/2026-dialecta-tier-palette-audit.md`.

The badge rule in the spec at line 127 and 134 is
`background: linear-gradient(180deg, var(--tier-heat-top), var(--tier-heat-bot)); color: var(--tier-heat-text)`
at `font-size: 0.7rem`, and `.badge-sm` at `0.6rem`. So the text sits on a gradient and contrast
varies down the chip.

| Tier | text on top stop | on bottom stop | needs |
| --- | --- | --- | --- |
| Heat | **1.96:1** | 3.54:1 | 4.5:1 |
| Stance | **4.26:1** | 6.92:1 | 4.5:1 |
| other five | 5.94 to 11.44 | 5.94 to 11.44 | 4.5:1 |

The icon inherits the failure, because `.tier-icon` is drawn in `currentColor`. At 1.96:1 the Heat
icon also fails the 3:1 floor in SC 1.4.11.

Two further things I checked before bringing this. `docs/Dialecta_Discourse_Layer_UX.md` already
records one contrast fix under "Design Decisions Made in This Session": the Forum icon renders in
`--text-primary` because "the tier text color has insufficient contrast" against the near-white chip.
Measured, Forum is 7.02:1 at the top stop and 6.39:1 at the bottom. That fix was applied to a tier
that did not need it, and the stated reason does not hold. Heat, which fails by a factor of two, was
not caught.

And `.claude/agents/designer.md` says I argue about structure, flow and copy, "not the gradient".
I have kept to that: the topology bar and CVD findings in the same audit are fixable with the tier
icons the spec already defines, and I have proposed no colour values here.

## Why I am stuck

`exchange/README.md` case 2 says a change that would alter a locked decision in root `CLAUDE.md` goes
to `decider` and stops. This would. But the locked decision exists so nobody iterates on the visual
language for taste, and this is a measured failure against a normative W3C criterion, which is the
other kind of thing entirely. The two branches cost differently.

Take it to Dan now: costs a design-spec session before A-5 is built, and P0-2 onward is already
blocked on a different decision, so the calendar cost may be zero. Also means the fix lands once, in
the spec, and `npm run tokens` carries it everywhere.

Hold it: costs nothing today. But A-1 and A-5 build the badge, and Heat is a common classification,
so the defect ships to real readers and gets fixed later against live code instead of against one
generated file.

I lean toward taking it now, on the grounds that a locked decision protects the design from taste
rather than from arithmetic. I am not confident enough in that reading of the lock to act on it, so
it is your call.

One thing I would ask either way: D-18 in `council/designer/positions.md` proposes a contrast check
in CI beside `npm run tokens -- --check`. That is additive and touches no locked value, and it would
have caught this in April.
