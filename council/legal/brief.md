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

## Correction, 2026-09-20

**Dialecta is operated from Arizona.** Dan said so in session, after the first sprint had landed.
Everything below that says Connecticut was written on a premise that came from
`.claude/agents/legal.md` line 30 and from this advisor's reading list, not from anything in the
repository. `security` built two notes on the same premise. Posted to the exchange at
`exchange/open/2026-09-20-legal-04-blindspot-wrong-jurisdiction-in-three-trees.md`.

The practice this seat takes from it, now a standing position: **state the operator's
jurisdiction as a citable fact in the first note of any sprint, and treat an inherited one as a
lead to verify.** A carefully read statute that does not apply is worse than a vague answer,
because it is more persuasive.

## Where it is now

**First sprint run 2026-09-20, then corrected the same day.** Twenty sources read and filed in
`research/`. Twenty-five standing positions in `positions.md`, grouped into four sections. Four
per-debate positions in `positions/`. Four records posted to the exchange and one block appended
to `philosopher`'s open blindspot on the Contrast Strip. Still has not argued anything in
council; every position is a starting point rather than a tested one.

The Arizona correction reshaped the tree. What the two halves of the day found:

From the first pass, and surviving the correction:

- **Section 230 does not shield the tier badge, the commenter message or the Breach notice.** Not
  a close question on the statute, and the Congressional Research Service states it outright. The
  useful refinement is that losing the shield is a defence-cost exposure rather than a judgment
  exposure, which points the money at insurance rather than at redesigning the mechanic.
- **The six pillars and the archetype are not sensitive data.** The Connecticut list is closed
  and they are on none of it. Read as comparative now rather than as home-state law, and it
  travels because most of the twenty state statutes copy that list.
- **A tier badge is not a decision producing a legal or similarly significant effect,** so no
  impact assessment and no statutory right to contest attaches. Same caveat, same reason.
- **Human review of a label does not recover Section 230; it aggravates it.** Opposite to the
  GDPR Article 22 instinct, and the seat expects to have to defend that.

What the correction added:

- **Arizona has no comprehensive privacy law and never has.** No home-state controller duty. The
  live privacy question changes in kind, from "does my state's law reach me" to "do any of the
  twenty states where readers live reach a site that does not target them".
- **The forum is the Ninth Circuit, and it is friendlier.** Doe 1 v. Meta (9th Cir. Apr. 2026)
  upheld Section 230 for algorithmic recommendation and distinguished Anderson. The theory that
  running the classifier is expressive activity is weak here. The theory that the authored label
  is outside 230 is untouched, and it was always the stronger one.
- **Arizona's anti-SLAPP does not fill the gap,** although it looked at first as though it would.
  A.R.S. Section 12-751 kept a motive test most states dropped.
- **A disclaimer is worth close to nothing, and consent is worth a great deal.** Milkovich closed
  the opinion-label route in 1990. Consent to publication is a complete defence and fits this
  platform unusually well, because a contributor submits a comment knowing the result will be
  published. The Pact is the best consent artifact on the platform and almost none of it was
  designed for legal reasons.

What it still cannot answer, and will not guess at: whether a tier name is capable of defamatory
meaning under Arizona law and whether the opinion privilege carries where the basis is published
beside the label; whether a media liability policy reaches statements the insured's own model
generated; and whether Arizona follows Restatement Section 583 on consent, and whether the Pact
can carry that effect when nothing in it is drafted as a contract. All three, with the
recommendation on which to buy now, are at
`exchange/open/2026-09-20-legal-02-advice-one-hour-of-counsel.md`.

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
2. **Read the Ninth Circuit in the original: Doe 1 v. Meta, Dyroff, and Roommates.com.** All
   three are binding here and all three were read this sprint at second hand, through two CRS
   reports and a law professor's blog. That is the same standard of sourcing that produced the
   jurisdiction error. Doe 1 v. Meta is the highest value of the three because it is five months
   old and it is the decision that makes the forum friendly.
3. **Answer the privacy question that replaced the Connecticut one:** whether any of the twenty
   states with comprehensive laws reaches a site that does not target its residents. The IAPP
   tracker is already a `todo` row. This is the question the first sprint would have asked if it
   had known where the operator lives.

4. **Write the Breach routing rule.** No US law requires reporting a credible threat, so this is
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
