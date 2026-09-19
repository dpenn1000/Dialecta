# Dialecta — Self-Snapshot Engine
*The Three-Voice Composition: User Self-Description, Engine Indicators, Community Reflection*
*Version 1.0 — April 2026*

---

## Purpose

This document specifies the **Self-Snapshot Engine** — Dialecta's foundational instrument for representing who a contributor is as a communicator at a given moment in time. Per `Dialecta_Growth_Layer_Principles.md` Principle 6, the Self-Snapshot is *"the foundational instrument of the Growth Layer — and arguably one of the most consequential engines on Dialecta as a whole."*

The Self-Snapshot is upstream of every other Growth Layer feature. A contributor cannot meaningfully name an Aspiration until they have a defensible, multi-voiced sense of where they currently are. This document specifies how that multi-voiced sense gets composed, displayed, and revisited over time.

---

## The Foundational Principle

A contributor's sense of who they are as a communicator cannot be drawn from self-perception alone — people are wrong about themselves precisely where growth happens. People who interrupt often believe they listen well. People who lecture believe they explain.

But the snapshot also cannot be drawn from engine measurements alone, because that would make the platform the issuer of verdicts about the contributor — exactly what Dialecta exists to refuse. The trustee framing collapses the moment a number feels like a grade.

The Self-Snapshot is therefore a **composition of three voices**, with the user holding the pen. The educational power of the engine lies not in any single voice but in the contributor's ongoing reconciliation of all three over time.

---

## The Three Voices

### Voice 1 — The Contributor's Own (canonical)

Captured in the contributor's own words through structured self-assessment scaffolds. **Preserved verbatim. Never overwritten by the platform.** This is the canonical record of what the contributor believes about themselves at this moment, and it remains canonical even when the other voices diverge from it.

The right to be wrong about yourself, with the data visible alongside, is part of what makes eventual self-recognition meaningful when it comes. Forced recognition is not recognition — it is compliance.

**Capture mechanism:** structured prompts the contributor answers in their own language. Possible prompt families:
- *"How would you describe how you tend to engage in difficult conversations?"*
- *"When you disagree with someone, what is your first move?"*
- *"What do you think your strengths and blind spots are as a communicator?"*

Prompts are scaffolds, not closed-taxonomy questions. Free-text responses, not Likert scales.

**Storage:** verbatim text + timestamp + the prompt that elicited it. Multiple Voice-1 entries accumulate over time as the contributor revises their self-description.

### Voice 2 — The Engine's Observation (signal, never verdict)

Drawn from the same Stage A classification data that already feeds the Contributor Identity fingerprint — specificity patterns, emotional register, opposing-view engagement, tribal markers, article engagement.

**Grammar matters absolutely.** The engine may say:

> *"Across your last forty comments, you've engaged directly with an opposing view in eight of them — one signal among many about where you currently are as a listener."*

The engine may **not** say:

> *"You are a poor listener."*

The first is observational, with the limit of what the data can see explicitly named. The second is a verdict. The grammatical difference is the entire ethical difference.

**Indicators sourced from `axis_scores` and `axis_events`:**
- Pillar standings (relative — never as scores or grades)
- Recent tier-mix patterns
- Topic distribution
- Engagement cadence

Each indicator framed as *one signal among many*. Limits of what the data can see made visible.

### Voice 3 — The Community's Reflection (signal, never verdict)

Drawn from reclassification activity, voting patterns, and any explicit feedback the platform allows. Also offered as signal, never verdict.

> *"Your comments have been reclassified upward by readers more often than downward — whatever else that means, it suggests something about how you land with the people you're talking to."*

**Indicators sourced from `comment_votes` and `classifications`:**
- Reclassification direction balance (up vs down nominations)
- Self-declaration vs community-resolution alignment (feeds Calibration pillar)
- Sparring Partner engagement patterns (per `Dialecta_Relationship_Types.md`)
- Read-through rates on the contributor's Forum-tier comments

The community voice is what the platform overheard about you, framed as overheard rather than measured.

---

## The Composition View

All three voices are visible in the same view. The contributor's self-description sits at the center. The engine's indicators and the community's reflection sit alongside.

**Layout principle:** the contributor's voice is visually anchored as the canonical center. Voices 2 and 3 are visually equal to each other but secondary to Voice 1. The contributor reads their own words first.

The contributor is invited — never required — to:
1. Notice where the three voices diverge
2. Sit with the divergence
3. Update their self-description if they choose

The platform never updates Voice 1 for them. It records the divergence honestly, and then it waits.

---

## The Living Record

The Self-Snapshot is not a single moment. It is a **living record.** Every time a contributor returns to it:
- Their self-description may have evolved (new Voice-1 entries layered chronologically)
- The engine's indicators reflect more recent data
- The community's reflection has accumulated

The contributor sees not just where they are now but how the three voices have moved relative to each other over time. The view shows:
- Current Voice 1 + history of Voice-1 revisions
- Voice 2 indicators at this moment + their trajectory
- Voice 3 reflection at this moment + its trajectory

**When the three voices converge** — when the contributor's self-description and the indicators around it begin to point at the same person — that convergence is the most powerful possible evidence that growth was real.

**When they don't converge** — divergence is the most honest possible invitation to keep working.

Either outcome is data the contributor owns.

---

## The Three Operating Constraints

Three things must be true simultaneously for the Self-Snapshot Engine to honor the foundational principle. Any one failing breaks it:

1. **Objective data must be presented with radical humility.** Every engine indicator framed as one signal among many. Every limit of what the data can see made visible. The moment the engine speaks with confidence, the contributor is being judged.
2. **The contributor's self-perception must be honored even when it diverges from the data.** Recorded divergence is not overridden self-description. The platform holds both, side by side, and lets the contributor decide what to do with the gap.
3. **The whole engine must be educational by structure, not by lecture.** The contributor learns to read themselves more accurately not because the platform tells them what they are, but because they spend time with the gap between their self-description and the signals around it. The engine is not teaching. It is providing the conditions in which teaching-oneself becomes possible.

---

## Data Model

The Self-Snapshot does not require new entities — it composes from existing data:

| Voice | Data Source | Notes |
|---|---|---|
| Voice 1 (contributor self-description) | New entity: `self_descriptions` (contributor_id, prompt_id, statement_verbatim, recorded_at) | Multiple entries over time, never overwritten |
| Voice 2 (engine indicators) | `axis_scores` + `axis_events` + `classifications` | Read-only composition; no new storage |
| Voice 3 (community reflection) | `comment_votes` + `classifications` (delta between ai_suggested_tier and final_tier) + `sparring_partners` | Read-only composition; no new storage |

The composition view itself is a computed render, not a stored snapshot. Point-in-time captures of the snapshot are stored in `fp_snapshots` (per `Dialecta_Data_Architecture.md` entity 5) at trigger events — aspiration declaration, recommitment, archetype shift, milestone.

**One new entity required for Phase 1:** `self_descriptions`.

| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| contributor_id | uuid | |
| prompt_id | text or enum | Which prompt elicited this entry |
| statement_verbatim | text | Never modified after write |
| recorded_at | timestamp | |

---

## Integration with Other Growth Layer Features

- **Upstream of Aspiration Tool:** the Aspiration Tool requires a defensible Self-Snapshot before declaration. UX flow: contributor opens Self-Snapshot, sits with the three voices, then has the option to declare an Aspiration anchored against this snapshot.
- **Paired with Activity Rhythm View:** the Rhythm View answers *when and how you show up*; the Self-Snapshot answers *who you are becoming*. Both are "Seeing" features, surfaced together.
- **Feeds the Growth Scroll:** snapshots taken at trigger events are stored in `fp_snapshots` and become the entries the Growth Scroll renders over time.
- **Voice 3 reads from the Relationship Types layer:** Sparring Partner engagement is one community-reflection indicator.

---

## Open Questions

1. **Voice 1 prompt library.** What set of prompts elicits the most defensible self-descriptions? Likely 6–10 prompts covering different facets (engagement style, conflict response, blind spots). Needs design + iteration.
2. **Frequency of Voice 1 re-prompting.** Does the platform proactively invite the contributor to revise their self-description on a cadence, or only when they open the Self-Snapshot themselves? Trustee framing suggests opt-in only.
3. **Visual treatment of divergence.** When Voice 1 says one thing and Voice 2 indicates another, how is the gap displayed? A literal side-by-side comparison risks feeling like a verdict. A subtle layout that makes both readable without forcing comparison may be better. Needs design exploration.
4. **Public visibility of Self-Snapshot.** Like Aspirations, should the snapshot be optionally public? Default proposal: private by default. Public would mean exposing Voice 2 and Voice 3 indicators publicly, which may conflict with the trustee framing. Likely never publicly shareable beyond the Aspiration that derives from it.
5. **Bootstrap state.** A new contributor with no comment history has no Voice 2 or Voice 3 data. The Self-Snapshot must be graceful in this state — perhaps showing only Voice 1 with explanatory text about when the other voices will come online.

---

## Relationship to Other Documents

- **`Dialecta_Growth_Layer_Principles.md`** — Principle 6 establishes the three-voice composition principle that this engine implements. Constraining reference.
- **`Dialecta_Aspiration_Tool` (in Growth Layer Principles addendum)** — downstream of this engine. Aspiration is anchored against a Self-Snapshot.
- **`Dialecta_Activity_Rhythm_View.md`** — paired Seeing feature.
- **`Dialecta_Contributor_Identity.md`** — Voice 2 sources its data from the same pillar/archetype computation pipeline.
- **`Dialecta_Data_Architecture.md`** — one new entity (`self_descriptions`) needs to be added to the canonical schema.
- **`Dialecta_Relationship_Types.md`** — Voice 3 reads from Sparring Partner data.

---

*Version 1.0 — April 2026*
*Companion documents: `Dialecta_Growth_Layer_Principles.md`, `Dialecta_Activity_Rhythm_View.md`, `Dialecta_Contributor_Identity.md`*
