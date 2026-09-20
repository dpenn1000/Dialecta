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
- **The fingerprint has no visual language yet.** `design/dialecta-design-spec.html` mentions the
  fingerprint zero times and carries no petal or fingerprint token of any kind. This ADR is the
  first thing that will define one, rather than a modification to an existing surface.
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
