# Dialecta — Contributor Identity
*The Six Pillars of Intellectual Character, the Fingerprint, and the Eight Archetypes*
*Version 1.1 — April 2026*

---

## Purpose

This document specifies Dialecta's **contributor identity layer** — the system by which the platform represents *who a contributor is becoming* across many comments over time. It is a sibling document to the Classification Engine Specification (which judges a single comment) and the Tier Psychology document (which explains the tier names and their behavioral logic).

The unit of analysis is different here. The classification engine answers *what is this comment doing?* The contributor identity layer answers *what pattern of thinking does this person consistently produce?* The tier system operates per-comment; this layer aggregates across the contributor's full history.

This split matters because the two layers must be able to evolve independently. The tier names may change as the platform learns; the axes and archetypes may change for entirely different reasons. Bundling them creates a spec that has to be edited in two places every time either system moves.

---

## The Foundational Insight

The platform's source essay establishes that incentives shape behavior more than stated values do. The tier system applies that insight at the moment of comment submission. The contributor identity layer applies it at the *career* scale: by giving contributors a recognizable pattern they can see in themselves and aspire to refine, the platform creates a long-term feedback loop pulling toward the kinds of thinking it most wants to cultivate.

The critical move is that contributor identity is **descriptive, not declarative**. A user does not pick what kind of thinker they are. The platform observes the pattern and reflects it back. This is the inverse of every social platform's bio field, where users assert an identity that the system never tests. Here, the system never lets the user assert; it only ever shows them what is actually there.

---

## The Six Pillars of Intellectual Character

*"We are what we repeatedly do."*
— Will Durant, summarizing Aristotle's Nicomachean Ethics

A contributor's pattern is measured along six pillars, grouped into three pairs. Each pair captures a different dimension of intellectual contribution. Together they do not measure what someone believes — they measure how someone does the work of thinking in public. The pattern those six things produce, accumulated across hundreds of comments over months and years, is what classical philosophers and rhetoricians have always called intellectual character.

The system is known in full as **The Six Pillars of Intellectual Character**. On the profile it is labeled **Intellectual Character** or shortened to **Character** where space requires.

| Pair | Pillar | What it measures |
|---|---|---|
| **Substance** | Acuity | How precise and claimable the contributor's points tend to be. |
| **Substance** | Reach | How many distinct topic areas the contributor has engaged across. |
| **Intellectual Honesty** | Calibration | How well the contributor's confidence matches the strength of their evidence. |
| **Intellectual Honesty** | Magnanimity | How faithfully the contributor represents views they disagree with before engaging with them. |
| **Engagement** | Discourse | How often the contributor engages in sustained back-and-forth rather than hit-and-run. |
| **Engagement** | Consistency | How regularly the contributor shows up over time. |

### On Magnanimity

*"The magnanimous man is not unable to make his life revolve around another, unless it be a friend."*
— Aristotle, Nicomachean Ethics, Book IV

Magnanimity is the virtue of greatness of soul: rising above pettiness, engaging with the strongest version of opposing arguments because anything less is beneath serious discourse. This axis measures the philosophical Principle of Charity — the instruction to interpret any opposing argument in its most coherent, strongest form before responding. A contributor with high Magnanimity does not strawman; they steelman. They engage with the best version of what the other side actually believes.

This is the rarest axis to earn at high levels and the most consequential for discourse quality. The Advocate archetype is its fullest expression.

### Why Six, Why These

Each pillar names a behavior the classification engine can detect from a single comment, which means each can be earned incrementally and tracked rigorously. None require self-report. None are gameable through volume alone — quality is encoded in the tier-mix history behind each pillar, not the raw count.

### The Trade-Offs Are Intentional

Certain pillars compete for the same cognitive budget:

- **Acuity trades against Reach.** Going deep on one topic and going wide across many topics draw on different kinds of attention. A contributor who earns high marks on both is not impossible but is rare and visible.
- **Discourse trades against Calibration and Magnanimity.** High-volume back-and-forth tends to outrun a person's ability to hold every position carefully. The contributor who replies to everything will accumulate some Heat in their Discourse history.
- **Consistency trades against the quality pillars early on.** Showing up regularly while still developing one's voice produces a noisier history than showing up rarely with polished thoughts.

These trade-offs are not bugs. They are the reason every contributor produces a *shape* rather than a uniform circle. A platform where everyone could max every pillar would be a platform where the pillars meant nothing.

---

## The Fingerprint

The six pillars are rendered visually as a contributor's **fingerprint** — a six-petal shape where each petal's growth represents the contributor's earned standing on that pillar.

A petal is built from two pieces of information:

1. **Graduations** — how many rings the petal has earned. A function of how many comments have contributed to that pillar at sufficient quality.
2. **Tier history** — the mix of tiers (Forum, Spark, Echo, Fog, Heat, Stance) that produced those graduations. High-purity histories render as smooth, confident curves. Histories that include earlier Heat or Stance render with visible wave texture in the inner rings.

The fingerprint is therefore not a score. It is a *record*. A contributor with a tall, smooth Acuity petal has demonstrably written many highly specific Forum-tier comments. A contributor whose Magnanimity petal carries wave texture in the inner rings is someone whose history shows earlier Stance behavior that has since resolved into Forum. The shape itself is unfakeable — it cannot be produced except by actually doing the work it represents.

This is the first feature of the contributor identity layer: **the visual representation makes the contributor's history legible to themselves**, including the parts they have grown out of. Earned growth is visible. So is recent regression.

---

## The Eight Archetypes

Above the fingerprint sits a second representation: the **archetype**. Where the fingerprint shows the full shape of a contributor's history, the archetype names the *recognizable pattern* that shape produces. Archetypes are platform-assigned, never user-declared. A user can declare an *aspirational* archetype, and the platform will tell them exactly which behaviors move them toward it — but the assigned archetype is always derived from observed pattern.

| Archetype | Icon | Pattern | Primary Axis Signature |
|---|---|---|---|
| **The Skeptic** | 🔎 | Questions premises before accepting conclusions. | High Calibration, high Acuity. |
| **The Synthesizer** | 🌀 | Finds unexpected connections across domains. | High Reach, high Acuity. |
| **The Advocate** | ⚖ | Argues the strongest version of views they disagree with. The fullest expression of the Magnanimity pillar. The rarest and most valued archetype because it directly attacks the tribal default of strawmanning opposition. | High Magnanimity, high Acuity. |
| **The Builder** | 🏗 | Extends ideas into practical frameworks. | High Acuity, high Discourse. |
| **The Empiricist** | 🔬 | Grounds every claim in evidence and data. | Maxed Acuity, high Calibration. |
| **The Contextualist** | 🗺 | Situates ideas in their historical and cultural frame. | High Reach, high Calibration. |
| **The Illuminator** | 💡 | Makes complex ideas accessible without losing nuance. | High Acuity, high Magnanimity, high Discourse. |
| **The Reviser** | ↻ | Publicly updates their position when given good reasons. | High Calibration, high Consistency, with visible wave texture from earlier tiers resolving into Forum. |

Per-archetype user-facing guidance text is implemented in the profile component and is intentionally not duplicated here. The spec documents *what each archetype is and how it is detected*; the implementation owns *how it is explained to the user* and is expected to iterate.

### Why These Eight

The eight resolve into a clean taxonomy: **three epistemic stances, three constructive moves, one magnanimous engagement archetype, one temporal change archetype.** Each archetype names a distinct cognitive move that the classification engine can detect from accumulated comment history. Together they cover the space without redundancy:

- **Skeptic, Empiricist, Contextualist** are epistemic stances — different theories of what makes a claim trustworthy.
- **Builder, Illuminator, Synthesizer** are constructive moves — different ways of adding to what already exists.
- **Advocate** is the charitable-engagement move — the rarest and most valued, because it directly attacks the tribal default of strawmanning opposition. The Advocate Engine is the feature that supports this archetype's growth. The Magnanimity pillar is its primary data source.
- **Reviser** is the temporal move — the only archetype defined by *change* rather than a static pattern. The Delta mechanic is the feature that supports this archetype's growth.

The Advocate and the Reviser exist specifically because the platform's two highest-leverage roadmap features (Advocate Engine, Delta mechanic) need cultural backing to actually work. A feature without an associated identity is a feature people use once and forget. An identity without an associated feature is an aspiration with no path. Pairing them is deliberate.

---

## Naming Principles

The archetype names follow the same three principles as the tier names, plus one additional principle unique to this layer.

### 1. Describe the pattern, not the person.
"You are showing a Skeptic pattern" describes a behavior signature. "You are a skeptic" labels a person. The distinction matters for the same reason it matters at the tier level: the platform must always leave the door open for a contributor to grow into a different pattern.

### 2. Observe, don't evaluate.
No archetype is ranked above another. The Skeptic is not better than the Builder. They are different cognitive contributions, all of which the platform considers valuable. Any future archetype that implies superiority over others fails this test.

### 3. No tribal coding.
No archetype name should map to a political, ideological, or cultural team. Names are drawn from epistemic moves, not from cultural markers.

### 4. Every archetype must name a *cognitive move*, not an outcome or identity.

This is the principle unique to the archetype layer. An archetype is what a contributor *does* when they think. It is not what they conclude, not how often they post, not how respected they are. This rule is what disqualifies several tempting-but-bad archetype concepts:

- **The Oracle** (retired) — defined partly by *speaking rarely*, which is an absence rather than a move, and which created perverse incentive against participation.
- **The Expert** — defined by credentials, not behavior. Untestable and tribal.
- **The Influencer** — defined by audience, not contribution. Inverts the platform's values.
- **The Moderate** — defined by where one's conclusions land, not how one reaches them.

A useful test for any future archetype proposal: *Can the classification engine detect this from comment text alone, without knowing who wrote it?* If no, the archetype is not earnable through doing the work, and it does not belong on the platform.

---

## The Aspirational Mechanic

The platform assigns archetypes from observed pattern. But contributors can also declare an **aspirational archetype** — a target they are reaching toward. When they do, the platform does not change their assigned archetype. It does two other things:

1. **It surfaces the specific behaviors** that produce the aspirational archetype's signature. Not generic advice; the exact pillar movements required.
2. **It tracks progress quietly.** The contributor can see, over time, whether their actual fingerprint is shifting in the direction of their aspiration.

This split — assigned identity from observed pattern, aspirational identity from declared intent — is the philosophical core of the layer. It treats contributors as honestly as possible: they cannot pretend to be what they are not, but they can publicly commit to who they want to become, and the platform will help them get there.

The aspirational mechanic is also the quiet rebuttal to social media's identity model. On most platforms, identity is asserted upfront and never tested. Here, identity is *earned* through the work, and the gap between who you are and who you want to be is something the platform helps you close rather than hides.

---

## Relationship to Other Documents

- **Classification Engine Specification** — defines the per-comment analysis that produces the structured data feeding every pillar. The Stage A analysis fields (Acuity/claim specificity, emotional register, tribal markers, opposing-view engagement) are the raw material from which pillar scores are computed.
- **Data Architecture** — defines the axis_events ledger, axis_scores materialized table, and fp_snapshots that underpin the Fingerprint. The pillar scores the Fingerprint renders are read from axis_scores.
- **Editorial Voice** — governs the tone and philosophical quote selection for all pillar descriptions, archetype guidance text, and Growth Layer coaching prompts.
- **Tier Psychology** — defines the seven tiers and the behavioral logic of their names. Tiers and archetypes operate at different timescales but share the platform's foundational principle: incentives shape behavior, so every label must be designed as carefully as any other incentive.
- **Project Brief** — the platform-level description. Contributor identity is not mentioned there in detail; this document is the canonical source.

---

## Open Questions for Future Sessions

- **Pillar score computation** — defined in `Dialecta_Axis_Mapping_v1.md` as of 2026-04-29. Implemented in `api/_axis-mapping.js` and called by `api/comment.js` after each classification. Tunable thresholds and weights are tagged with `// TUNING:` annotations for the future Tuning Engine page (`Dialecta_Tuning_Engine_Spec_v1.md`).
- **Threshold for archetype assignment** — how much history is enough to assign an archetype rather than show "pattern still forming."
- **Multiple archetypes** — should a contributor whose pattern fits two archetypes equally well be shown both, or should the system always pick one? The current design picks one; the alternative is worth considering.
- **Practitioner archetype** — held back from v1 to keep the set tight. Worth revisiting if the platform finds it is systematically under-recognizing experiential knowledge in topics like mental health and theology.
- **Archetype evolution display** — how to show a contributor that their archetype has changed over time without it feeling like a demotion.

---

*Version 1.1 — April 2026. Updated: Six Axes renamed to The Six Pillars of Intellectual Character; all six pillar names updated (Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency); Magnanimity documented with Aristotle reference and philosophical grounding; archetype signatures updated throughout.*
