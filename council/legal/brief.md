# legal: session brief

A thread on this advisor trains it. It does not build the site and it decides nothing. Read
`council/legal/charter.md` for the mandate; this file is the state of the training and what
comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `council/legal/charter.md` |
| Memory | `council/legal/positions.md` |
| Research | `council/legal/research/` |
| Leads | `council/legal/research/reading-list.md` |
| Per debate | `council/legal/positions/` |
| Skills | `/dialecta-research` to fill the tree, `/dialecta-council` to argue |

## Where it is now

**First sprint run 2026-09-20.** Fourteen sources read and filed in `research/`, thirteen from
the reading list plus the enrolled text of Connecticut Public Act 25-113, which the list did not
carry. Seventeen standing positions in `positions.md`. Three per-debate positions in
`positions/`. Three records posted to the exchange and one block appended to `philosopher`'s open
blindspot on the Contrast Strip. Still has not argued anything in council; every position is a
starting point rather than a tested one.

What the sprint settled:

- **Section 230 does not shield the tier badge, the commenter message or the Breach notice.** Not
  a close question on the statute, and the Congressional Research Service states it outright. The
  useful refinement is that losing the shield is a defence-cost exposure rather than a judgment
  exposure, which points the money at insurance rather than at redesigning the mechanic.
- **The six pillars and the archetype are not sensitive data under the amended CTDPA.** The list
  at Section 42-515(39) is closed and they are on none of it. The door into Connecticut is the
  comment text, not the fingerprint, and it has no volume floor.
- **No CTDPA impact assessment is owed for the classification engine and no statutory right to
  contest a tier exists,** because the 2026 act narrowed "legal or similarly significant effect"
  to seven enumerated denials and struck "access to essential goods or services". That risk
  should be accepted rather than spent on.
- **Human review of a label does not recover Section 230; it aggravates it.** Opposite to the
  GDPR Article 22 instinct, and the seat expects to have to defend that.

What it still cannot answer, and will not guess at: whether a tier name is capable of defamatory
meaning under Connecticut law, whether the opinion privilege carries where the basis is published
beside the label, and whether a media liability policy reaches statements the insured's own model
generated. All three are at `exchange/open/2026-09-20-legal-02-advice-one-hour-of-counsel.md`.

It exists because the roster had nobody holding exposure. `decider` named the gap on 2026-09-19
in `council/log/2026-09-19-council-composition.md`, and the day's findings made it concrete: a
live endpoint creating rows for anyone, a stored XSS path into every reader's browser, and a
classifier that publishes a judgment about a named person's argument.

## The question it started on, now answered

*Answered 2026-09-20 at `positions/2026-09-20-tier-label-first-party-speech.md`. The framing
below is kept because it is the reason the seat exists, and because the answer turned out to be
two answers rather than one: Section 230 does not cover the label, and that matters less than it
sounds, because the label is probably not actionable in the first place.*

**Does publishing an AI-assigned tier next to a named person's comment make that label the
platform's own speech?**

Section 230 protects an interactive computer service from liability for what its users say. It
is a weaker shield for what the service says itself. Dialecta attaches "Heat" or "Breach" to a
contributor's post, publicly and durably, and publishes a fingerprint describing how that person
argues. Whether a court treats that as hosting or as authorship is the difference between the
core mechanic being ordinary and being the platform's largest exposure.

This is not a question the specs have asked. It is not in the 47 row backlog. It bears on the
locked tier names, the classification engine, the Contrast Strip and the whole Identity phase,
which makes it worth answering before more is built on top of it.

## Next three

*The first three are done. These are the next.*

1. **List the documents Dialecta owes before money changes hands, with what each one costs.**
   This is the half of the charter the first sprint did not touch, and `## Done looks like`
   below names it. The reading list still carries `todo` rows for FTC privacy guidance, the DMLP
   terms of use guide, both insurance sources, and all three DMCA sources. The DMCA designated
   agent registration is six dollars and is the cheapest item this seat will ever propose.
2. **Read Force v. Facebook and Moody v. NetChoice in the original.** Both are now on the reading
   list as leads found while reading. Force is the controlling Second Circuit authority for
   Dialecta's own forum and is more load bearing here than Anderson, which the first sprint read
   in full and which binds nobody in Connecticut. The tier label position's confidence on the
   forum question cannot move until both are read.
3. **Write the Breach routing rule.** No US law requires reporting a credible threat, so this is
   owed to the person being threatened rather than to a regulator, and the charter says the
   response to a credible threat is decided before one arrives rather than during one. Write it
   against the Stored Communications Act emergency disclosure wording, which is now a `todo` row,
   rather than against a summary of it.

## What this advisor posts to the exchange

An `advice` record when a feature already built or already specced carries exposure nobody has
priced. A `blindspot` before arguing a position where `security` or `philosopher` holds evidence
it does not. Its records frequently need Dan, because a legal question that matters ends in a
decision only he can make or in counsel only he can retain.

## Done looks like

The tier label question has a position with both cases argued and the facts that would settle
it. The documents Dialecta owes before taking money are listed, with what each one costs. At
least one position says plainly that a risk should be accepted rather than mitigated, because a
seat that only ever says "be careful" is not earning its place in the room.
