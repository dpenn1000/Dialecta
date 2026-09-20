# The Pact, reviewed

*Framed by the convener 2026-09-20 for the full advisory bench, at Dan's instruction. Protocol:
`.claude/skills/dialecta-council/SKILL.md`, amended today for six seats. Chaired by `decider`.*

## Question

**Is the Pact the document Dialecta needs it to be, and what has to change in it?**

## What the Pact is, measured

| | |
| --- | --- |
| Prototype | `components/dialecta-pact.html`, **1,411 lines** |
| Live page, as snapshotted 2026-09-08 | `docs/reviews/site-snapshot-2026-09-08/pact.txt`, **1,204 words** |
| Structure | Eight numbered sections, § I through § VIII, plus a tier-reading exercise |
| Schema | `_recovered/supabase/migrations/010_pact_agreement.sql` and `014_pact_signed_name.sql` |
| Stored on a profile | `pact_agreed_at`, `pact_version`, `pact_path`, `pact_signed_name` |
| **Signed** | **3 of 14 profiles.** Eleven carry a null `pact_version` |
| In `apps/web` | An 11-line stub naming the prototype. The Next.js build has not implemented it |

**This is a review, not a rewrite.** The prose is finished and good. Say what should change and
why, not what you would have written instead.

## What it says about itself

§ I: "Not terms and conditions. Not rules imposed from above. A mutual agreement between you and a
place that intends to take your thinking seriously."

§ VIII, The Commitment, where the signature happens: "I am here to engage with ideas, not to signal
my team. I understand that my words carry weight and that the platform will hold them accountable,
not to punish me, but to take me seriously. **I welcome the mirror.** I am willing to be surprised
by what I find in my own thinking."

## Why it is being reviewed now

Three things landed on it today and none of them was aimed at it.

**1. Dan's visibility decision belongs in it.** `ADR-004` puts the choice of who may see a
contributor's Archetype and Breach residual into the Pact rather than into settings, because in
the Pact there is no default to inherit. § VIII already commits a person to welcoming the mirror
without asking who else may look at it. That is the seam.

**2. `legal`'s consent analysis lands here.** It argued that Restatement 583 consent never ran to
the aggregate characterisation, and that an affirmative at-the-moment choice would be real consent
in a way blanket signup never was. The Pact is that moment, or it is not, and legal owns which.

**3. `philosopher` found the contest gap.** The Archetype has no contest path. The Pact tells a
person the platform will describe them. It does not tell them what to do when the description is
wrong.

## What the seats should not re-derive

- `ADR-004` and its two amendments, including the correction that the Pact is finished.
- `council/legal/positions/2026-09-20-visibility-control.md` and
  `council/philosopher/positions/2026-09-20-visibility-control.md`, today's recommendations.
- `council/legal/positions/2026-09-20-consent-waiver-and-the-pact.md`, which already exists.
- `docs/Dialecta_Tier_Psychology.md` on what each tier name is meant to communicate.

## Three questions inside the question

**One. Does the Pact do what it claims?** It says it is a mutual agreement rather than terms
imposed from above. Is that true of the document as written, or is it terms and conditions in a
better voice? The answer matters because the claim is load-bearing for everything else in it.

**Two. Where does the visibility choice go, and in what words?** § VIII is the convener's reading.
Argue it or improve it. The prose is of a quality where a clumsy insertion would show.

**Three. Three of fourteen have signed.** Is that a conversion problem, a plumbing problem, or
evidence nobody has ever been asked? It is the gate in front of every comment and nobody has
established which.

## Positions

## Rebuttals

## Chair roll-call

## Chair synthesis

## Outcome
