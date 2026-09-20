# ADR-004: Breach leaves a residual on the fingerprint, and earns nothing

*2026-09-20. Status: Decided by Dan.*

## Question

Universal Rule 1 says a Breach comment earns nothing on any axis. Until today only Discourse
enforced it, by accident, because its lookup table happened to zero out; the other five axes could
fire on a breach-tier comment. That is fixed, which surfaced the question the rule had been hiding:
if a Breach earns nothing, the fingerprint says nothing about it. Someone who breached fifty times
would render identically to someone who never commented.

Should a Breach be visible in the fingerprint, and if so, how?

## What the specs already said

`docs/Dialecta_Contributor_Identity.md` line 70 defines the fingerprint as a six-petal shape, each
petal's growth being earned standing. Line 77 already establishes that texture carries history: a
tall smooth Acuity petal means many specific Forum comments, and wave texture in the inner rings
of Magnanimity means earlier Stance behaviour that has since resolved.

`docs/Dialecta_Tier_Psychology.md` on the Breach tier: the word "carries consequence without
permanence", and the framing exists to convert shame, which triggers defensiveness and
disengagement, into accountability, which can trigger reflection.

Those two pull against each other, and that tension is what this decides.

## Decision

**A Breach earns nothing, and leaves a residual.** Both, and they are not in conflict because they
live in different layers.

| | |
| --- | --- |
| **Scoring** | Unchanged. Universal Rule 1 stands: a Breach comment produces no axis event on any of the six pillars. `packages/core/src/axis-mapping.ts` enforces this as a cross-cutting guard as of 2026-09-20 |
| **Visual** | The fingerprint carries a residual: **oxblood colouring plus spiked variation in the line** |
| **Proportion** | Dan: "One or two breach days doesn't completely turn a fingerprint red but it leaves residuals." A residual is proportionate to what happened, never a flag |
| **Decay** | None, and none is needed. The residual shrinks by dilution as the fingerprint grows, which is a property of the shape rather than a timer anyone has to tune |
| **Visibility** | Public on the user page by default, **with user-selected levels in settings**: public, connections only, and so on |

Dan's reasoning, in his own words: "a fingerprint is a fingerprint. It is a unique identifier, and
the goal is not to be ashamed of our past. This is a growth platform, and we are all entitled to a
bad day."

## Why `tier_mix` is not the mechanism

`Dialecta_Axis_Mapping_v1.md` line 32 says tier_mix tells the visual story, and Forum-heavy
fingerprints render differently from Spark-heavy ones. That is the same instinct as a residual and
it cannot carry this one.

Every entry in tier_mix comes from a comment that earned an axis point. A Breach earns nothing, so
it never enters the mix. The residual has to record something the mix is defined to exclude, which
is why it needs its own channel rather than a wider reading of an existing one.

## The texture vocabulary this completes

Three states, each meaning something different, and no two reusing a channel:

| Reads as | Means |
| --- | --- |
| Smooth petal | A clean history of specific, Forum-tier work |
| Wave texture in the inner rings | Earlier Stance behaviour that resolved into Forum |
| **Spiked variation, oxblood** | **A Breach in the history, diluting as the shape grows** |

## Consequences

- **No rework.** The axis mapping landed on 2026-09-20 is correct as built. Rule 1 stands.
- **Corrected 2026-09-20 by the site sweep.** This read that the fingerprint has no visual language
  and that this ADR would be the first thing to define one. Wrong, and wrong the same way the Pact
  claim was: true of `design/dialecta-design-spec.html`, which does mention the fingerprint zero
  times, and false of the project. `components/dialecta-fingerprint.jsx` is **2,595 lines** and
  already carries petals, per-axis ring counts, the wave texture the Contributor Identity doc
  describes, smoothing, and a palette including `#200404`, which is `--tier-breach-bot`.
  `components/dialecta-fingerprint-engine.jsx` is another 780 lines holding the compute half.
  **The Breach residual is an addition to an existing visual language, not the founding of one**,
  and `designer` should start from that prototype rather than from this ADR. Full map:
  `docs/SITE-INVENTORY.md`.
- **Oxblood is already spoken for.** `--tier-breach-top: #6A1818` and `--tier-breach-bot: #380808`
  are the Breach comment card. Reusing the exact values on a petal risks reading as "this is a
  breach" rather than "this history contains one." `designer` owns resolving that.
- **The visibility levels are a new surface.** Nothing in the platform has per-user visibility
  settings today, and `profiles` has no column for one.
- **It settles a Council disagreement in neither seat's direction.** `philosopher` and `legal` both
  concluded on 2026-09-20 that Archetype visibility needs gating, and both proposed a platform
  gate. Dan's answer is user control instead. That is a real difference and both seats should
  answer it rather than have it smoothed over.

## Open, and owned by `designer`

What spiked variation means geometrically, how a residual scales against petal growth so that
dilution is visible rather than merely true, and whether oxblood on a petal needs its own value
distinct from the card's.

---

## Amendment, 2026-09-20: the visibility choice belongs in the Pact

Both seats were asked for recommendations on the visibility decision and both came back wanting
the same change: do not let public be inherited. `philosopher` on default effects, that a buried
toggle will not be used by most people and opting out then becomes its own tell. `legal` on
consent, that the factory default should be self-visible so public is always chosen.

**Dan's answer is better than either and it resolves both objections.** In his words: this
decision should not be buried, it "comes up as an independent decision as part of the initial Pact
process. The user is given the choice of opting out but also encouraged to embrace the spirit of
the community to commit to constructive dialogue, transparency, and growth."

That is not a compromise between the two recommendations. It answers a question neither asked: not
*what should the default be*, but *where does this decision belong*. In the Pact, it stops being a
default at all. There is nothing to inherit, because there is no unattended state.

It also puts the question where the platform already explains itself. The Pact is Dialecta's
mutual agreement, the document that says what this place is. Visibility of a durable
characterisation is exactly that kind of question, and it reads differently in a settings pane
than beside a commitment to transparency and growth.

**Measured 2026-09-20, and it makes this cheap now:** of 14 profiles, **3 have ever signed a Pact**
and 11 carry a null `pact_version`. The process is effectively unrun. Adding this to the Pact
costs almost nothing in re-consent today, and grows more expensive with every member who signs the
version that lacks it.

### The one gap this leaves, which is real

`legal` wanted the choice made "after seeing the rendered card, residual included." **At Pact time
there is no card.** A new contributor has no comments, no axis events, no Archetype and no
residual. They are consenting to the visibility of something that does not exist yet and whose
eventual content they cannot preview.

That is not a reason to move the decision back out of the Pact. It is a reason for **two moments
rather than one**:

| Moment | What it asks | Why there |
| --- | --- | --- |
| **The Pact**, at joining | The decision, in principle, beside the commitments it belongs with | Not buried, actively chosen, framed by what the platform is rather than by a settings label |
| **First render**, when an Archetype or residual first exists | A confirmation, showing the actual artifact | Supplies the informed half that the Pact cannot, because the thing did not exist yet |

The second is not a second consent gate to click through. It is the first time the person can see
what they agreed about, and the moment their earlier answer becomes checkable.

### What stands from the two recommendations

- **`legal`, adopted:** every level except self-visible ships disabled until the predicate policy
  exists. A setting the database does not enforce is worse than none, because it tells a person
  their restriction worked when it did not.
- **`legal`, adopted:** the Breach residual, not the Breach card, is the first artifact the
  Arizona opinion-privilege hour examines. It aggregates suppressed-text classifications into a
  permanent person-level mark, which is closer to a checkable factual assertion than a tier badge.
- **Both, still open:** the contest path. `philosopher` holds it is more necessary now rather than
  less, since it sits behind a choice rather than a platform gate. `legal` frames the same fact as
  the one that reads worst: publishing about a person before giving them a way to answer back.
  Neither blocks, both want it on the same timeline as the session-verified auth.
- **`legal`, noted rather than adopted:** the factory-default flip to self-visible is superseded by
  putting the question in the Pact, where there is no factory default to flip.

### Consequences this adds

- **The Pact needs a version bump** and the new version carries the question. `profiles.pact_version`
  already exists and is already `1.0`, so the mechanism is there.
- The 3 members who signed 1.0 answered a Pact that did not ask this, and are asked at first render.
- **Correction, same day.** This line previously read that the Pact is a placeholder and not a
  built surface, on the evidence that `apps/web/src/app/pact/page.tsx` is 11 lines. That was
  wrong, and the stub itself says so in its own text: it names `components/dialecta-pact.html` as
  the prototype. The Pact is finished. The prototype is **1,411 lines**, the live page is
  **1,204 words**, and it runs to eight numbered sections with a tier-reading exercise and a
  signature. `_recovered/supabase/migrations/010_pact_agreement.sql` and `014_pact_signed_name.sql`
  are its schema. So this work is adding a question to a finished document, not writing one.

### Where the question goes, precisely

**§ VIII, The Commitment**, which is where the signature already happens. Its text today:

> I am here to engage with ideas, not to signal my team. I understand that my words carry weight
> and that the platform will hold them accountable, not to punish me, but to take me seriously.
> **I welcome the mirror.** I am willing to be surprised by what I find in my own thinking.

The seam is already cut. "I welcome the mirror" is a commitment to being described, made before
anyone is asked **who else may look at it**. Dan's visibility question is the unasked half of a
commitment the Pact already takes, which is why it belongs there and reads as belonging there
rather than as a privacy control bolted onto a manifesto.

Two things follow that a settings pane could not have given. The choice arrives in a document that
has already explained the classification system, the tiers, and what the platform is trying to do
to the reader's thinking, so a person answering it is the most informed they will ever be short of
seeing their own rendered card. And § I frames the whole document as "a mutual agreement between
you and a place that intends to take your thinking seriously", which is the correct register for
this question and the wrong one for a toggle.

`designer` and `philosopher` own the wording. The Pact is written prose of a particular quality and
a clumsy insertion would be visible.
