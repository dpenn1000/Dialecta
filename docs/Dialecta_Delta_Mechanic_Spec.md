# Dialecta — Delta Mechanic Specification
*Session 6 — Article-level position tracking and the Reviser pathway*
*Version 1.0 — April 2026*

---

## Purpose

This document specifies the Delta mechanic: the system by which Dialecta tracks whether a reader's position on an article's central question shifts between their first encounter with the piece and their engagement after reading it. The delta is the gap between those two positions, and making that gap visible — privately first, publicly by choice — is the mechanic's core function.

The Delta mechanic exists for two reasons:

1. **It gives the Reviser archetype a foundation.** The Reviser is the only archetype in the Contributor Identity system defined by change over time rather than a static behavioral pattern. Without the delta mechanic to detect and record position shifts, the Reviser archetype has no signal to observe. The mechanic is the infrastructure the archetype is built on.

2. **It models intellectual honesty as a visible act.** Most platforms treat opinion change as a liability — something to conceal. Dialecta treats it as a demonstration of engagement. Making that act noticeably opt-in, and rewarding it specifically, creates the cultural norm the platform is built around.

---

## Founding Principles

**Private by default, public by choice.** The delta is computed privately and shown only to the reader. Nothing is published unless the reader explicitly initiates it. This is not a technicality — it is the reason the mechanic can exist at all. A system that published position changes without consent would destroy the conditions for honest engagement.

**The mechanic reflects, it does not evaluate.** The platform does not score deltas or assign moral weight to direction. Moving toward Policy-driven is not better than moving toward Market-driven. A large delta is not better than a small one. The delta is a direction and a distance, not a verdict. The copy throughout this flow must maintain this posture.

**An unchanged position is valid data.** Consistency after engaging seriously with a strong argument is itself a considered position. The platform should frame stability warmly, not as absence or failure. The Reviser archetype is not the only valuable archetype.

**The tool must not feel invasive.** The pre-read position capture is the riskiest moment in this flow. A reader who feels surveilled will not engage honestly. The framing must be curious and lightweight: this is the platform being interested in you, not the platform building a file on you.

---

## System Overview

The delta mechanic operates across six sequential stages that mirror the comment classification system's Stage 1 / Stage 2 / Stage 2.5 / Stage 3 structure. The symmetry is structural, not cosmetic: the same logic that governs comment reflection governs position reflection.

| Stage | Name | Description |
|---|---|---|
| **A** | Pre-read snapshot | Reader places position on the article's opinion map axes before engaging with the content |
| **B** | Reading | Article content delivered; position locked in background |
| **C** | Post-read snapshot | Same axes presented again; reader places position where they actually are now |
| **D** | Delta calculation | Private. Platform computes direction and magnitude of movement |
| **E** | Delta reveal | Reader sees their before and after positions, the movement vector, and a plain-language description |
| **F** | Public choice | Reader decides: acknowledge publicly (→ Reviser pathway), or keep private (→ contributor history only) |

---

## Stage A — Pre-Read Snapshot

**Trigger:** Article page load. The pre-read widget appears before article content is fully accessible — not hidden behind a paywall, but positioned as a threshold moment before reading begins.

**The axes:** Article-specific. The same axes used in the article's opinion mapping tool (defined by the editor with AI refinement from the Declaration Layer). The pre-read snapshot uses exactly the same coordinate space as the post-read snapshot so comparison is valid.

**Interaction model:** A draggable dot on a 2D Cartesian plot (standard launch tool from Session 2). The reader places the dot and confirms. The plot labels the four quadrant directions — two pairs of poles on perpendicular axes.

**Copy standard:** The pre-read prompt is framed as curiosity, not registration.
> *"Before you read — where do you currently stand on this? Place your position on the map. You can move it as much as you like."*

The reassurance line beneath the confirm button:
> *"Private until you choose to share. Never used to filter what you see."*

**What is stored:** The `(x, y)` coordinates in the opinion map space, timestamped, associated with the reader's session. Not published. Not surfaced in any aggregate until the reader completes Stage C.

**Edge cases:**
- Reader skips the pre-read step: delta mechanic does not activate for that article. No partial data is stored.
- Reader places the dot at center (0.5, 0.5): valid position, treated as-is. The platform does not interpret a centered position as "undecided" or "neutral" unless that's how the editor labeled the center.

---

## Stage B — Reading

No mechanic activity during reading. The pre-read position is locked. A reading progress indicator is present (visual only) to signal when the article is complete.

---

## Stage C — Post-Read Snapshot

**Trigger:** Article fully read (progress bar complete). The post-read widget appears at the bottom of the article content, before the comment section.

**Interaction model:** Same 2D plot. The before position is shown as a faded reference point (dashed ring, no label beyond "before"). The reader places their current position. The movement arrow updates in real time as they drag, showing direction.

**Copy standard:**
> *"Has your sense of it shifted? You don't have to move the dot. A consistent position is worth knowing too. Place it where you actually are now."*

The emphasis on "you don't have to move" is deliberate and mandatory. The platform must not create any social pressure toward visible change. The framing must make stability feel as valid as movement.

**What is stored:** The `(x, y)` coordinates after reading, paired with Stage A coordinates in the reader's session record.

---

## Stage D — Delta Calculation

Computed immediately on Stage C completion. Private. Not surfaced until Stage E.

**Calculation:**
- Direction vector: `(after.x - before.x, after.y - before.y)`
- Magnitude: Euclidean distance in opinion-map coordinate space (normalized to [0,1] on each axis)
- Threshold for "meaningful shift": magnitude > 0.08 (tunable). Below this threshold, the platform treats the position as stable and frames accordingly.

**What is computed:**
- Movement direction (toward which poles)
- Movement magnitude (raw, not presented as a score)
- Axis-specific descriptions ("more Policy-driven," "more Planet-first") for the copy layer

**Aggregate computation (community delta):** Once the reader completes Stage C, their delta is added to the article's anonymous community aggregate. Community-level data is visible on the article page:
- "X% of readers shifted toward [pole]"
- "X% of readers held their position"
- Breakdown by axis direction

This aggregate is privacy-safe: the reader's individual coordinates are never exposed. The aggregate requires a minimum of 20 completed pairs before being shown (to prevent small-sample inference).

---

## Stage E — Delta Reveal

**What the reader sees:**

The delta visualization shows both positions on the same plot: the before position (faded, dashed ring, labeled "before") and the after position (current gold dot, labeled "after"), connected by a directional arrow if movement was meaningful.

Below the plot, axis-specific descriptions appear in monospace:
> *"+22% toward Policy-driven"*
> *"+14% toward Planet-first"*

If movement was below the threshold, the description is:
> *"Your position was consistent before and after reading."*

**Framing copy for meaningful shift:**
> *"This is private. Only you see it, unless you choose to share it. The platform doesn't score this — it notices it."*

**Framing copy for stable position:**
> *"Consistency is data too. A position unchanged after engaging with a serious argument is a considered one."*

**Reviser pathway indicator:** If movement is meaningful, a small contextual note surfaces:
> *"When a contributor publicly acknowledges a position shift with a reasoned explanation, it counts toward the Reviser archetype. Changing your mind well is a recognized cognitive move here."*

This note is informational, not a call to action. It should not feel like a reward prompt.

---

## Stage F — Public Choice

**If movement was meaningful:**

Two options, presented as equal:

| Option | Label | Description | Outcome |
|---|---|---|---|
| A | Note the shift in a comment | Platform drafts a starting point. Reader edits freely. | Comment enters classification engine with DELTA ACKNOWLEDGED marker attached |
| B | Keep it private | Nothing published. | Delta stored in contributor history only |

**If no meaningful movement:** Reader proceeds directly to the comment section without the choice prompt. No mention of the delta is made unless the reader asks.

**The draft (Option A):** The platform generates a seeded draft based on the movement vector. The seed is a starting point, never a finished statement. The reader must be able to tell it is a draft, not a pre-written response.

Example seed for movement toward Policy-driven and Planet-first:
> *"Reading this moved me more policy-driven and more focused on planetary costs. The argument about subsidy cascades insulating incumbents from efficiency pressure was the specific point that shifted my thinking — I hadn't traced the second-order effects that far before."*

The reader edits, shortens, rewrites, or discards any part of the draft. The DELTA ACKNOWLEDGED chip is attached to the submitted comment automatically.

**The DELTA ACKNOWLEDGED marker:** Visible to other readers on the comment. Plain text chip in monospace. It is not a badge or a tier signal — it is a factual annotation that the commenter's position shifted between pre- and post-read. The chip does not specify direction (that is private) unless the reader chooses to include it in their comment text.

**Classification:** The comment from Option A passes through the normal classification engine (Stage 1 → Stage 2 → Stage 2.5). A DELTA ACKNOWLEDGED comment is not automatically boosted. Its tier is determined the same way as any other comment. However, within the engine's existing logic, a comment that names what specifically changed the writer's mind will naturally score high on the Specificity axis and will tend toward Forum-tier.

---

## The Reviser Archetype — Requirements and Detection

The Reviser archetype (↻, from the Contributor Identity specification) is earned by contributors who publicly update their positions when given good reasons. The delta mechanic is the primary signal for Reviser detection, but it is not the only one.

**Primary signal:** Completing Option A (public acknowledgment with DELTA ACKNOWLEDGED marker) at least three times across different articles, where each acknowledgment comment is classified at Forum-tier.

**Secondary signal:** A comment in the normal comment section that explicitly names what changed the writer's mind — even without the formal delta mechanic flow. Detection heuristic: "I [changed / updated / revised / reconsidered / moved] my [view / position / thinking / assessment] because [specific argument or evidence]."

**Requirements for Reviser assignment:**
1. At least 3 qualifying public acknowledgments (primary or secondary signal)
2. Each qualifying comment at Forum-tier (minimum Specificity: named what changed; minimum Charity: the argument that changed it must be stated fairly)
3. The shifts must occur across at least 2 different articles (not all within one piece)
4. No requirement on direction — the mechanic does not track which poles the contributor moved toward, only that they moved and said so

**Degradation:** If a contributor has not produced a qualifying acknowledgment in 6 months, the Reviser signal weakens. At 12 months with no new qualifying acknowledgment, the archetype is flagged for review. The contributor does not lose the archetype automatically — this is a signal for a human editorial review rather than an automatic demotion.

---

## Data Storage

| Data | Stored | Retention | Access |
|---|---|---|---|
| Pre-read coordinates | Yes, per-session | Indefinitely, linked to contributor account | Reader only |
| Post-read coordinates | Yes, per-session | Indefinitely, linked to contributor account | Reader only |
| Delta vector | Computed on request; stored as pair | Indefinitely | Reader only |
| Community aggregate | Derived; no individual coordinates | Per-article | Public (after 20-pair minimum) |
| DELTA ACKNOWLEDGED comments | Standard comment storage | Standard comment retention | Public |

**No resale, no targeting:** Delta data is never used for content recommendation, advertising, or behavioral targeting. If the platform ever considers third-party integrations, delta data is explicitly excluded from any data-sharing agreements.

---

## Integration with Opinion Maps (Session 2)

The delta mechanic uses the same coordinate space as the article's opinion mapping tools. The opinion map shows the community's aggregate positions; the delta mechanic shows the reader's individual movement. They are two views of the same underlying data.

**Specific integrations:**
- The pre-read snapshot can be used as the reader's baseline position on the opinion map (if the reader consents — this is a separate choice)
- The post-read snapshot becomes the reader's "current position" on the opinion map for that article
- The community delta aggregate is a distinct view from the community position aggregate: the position map shows where people are; the delta shows how they moved to get there

---

## Copy Standard — Complete

The copy throughout the delta mechanic must maintain three commitments at all times:

1. **Non-coercive.** No prompt implies that movement is better than stability, or that a larger delta is better than a smaller one. Every frame leaves both outcomes feeling legitimate.

2. **Non-invasive.** The language of curiosity ("Before you read…") rather than surveillance ("We're tracking…"). The data is described as belonging to the reader, not to the platform.

3. **Non-evaluative.** The platform observes movement; it never comments on whether the direction was correct. "You moved toward Policy-driven" is the platform's language. "You became more open-minded" is not.

---

## Open Questions (Not Resolved in This Session)

1. **Ternary plot integration.** The prototype uses the 2D Cartesian plot. If an article uses a ternary plot for its opinion map, the delta mechanic needs a triangular version. The movement vector in three-pole space is more complex to visualize but well-defined mathematically. Defer to the Ternary UX session.

2. **Return readers.** If a reader engages with an article across multiple sessions (reads some, returns later), when does Stage C trigger? Options: (a) always at article-end on first reading, (b) reader-initiated at any time, (c) timed after a minimum reading interval. Not decided.

3. **Comment-without-delta case.** A reader who skips the pre-read step can still comment. Their comment does not have a DELTA ACKNOWLEDGED path available. The comment is classified normally with no delta context.

4. **Mobile delta flow.** The 2D plot drag interaction on small screens needs dedicated UX treatment. Defer to the Responsive Foundations session.

5. **Reviser secondary signal precision.** The heuristic for detecting non-delta acknowledgments ("I changed my view because…") needs to be embedded in the classification prompt architecture. The exact phrasing list and edge cases belong in the Classification Engine specification.

---

## Session Deliverables

- This specification document (`Dialecta_Delta_Mechanic_Spec.md`)
- Interactive prototype demonstrating the complete six-stage reader flow (`dialecta-delta-mechanic.jsx`)

The prototype demonstrates the full UX of all six stages, including: draggable 2D position plot, reading progress simulation, private delta visualization with movement arrow, public choice flow, seeded draft with DELTA ACKNOWLEDGED marker, community aggregate view, and Reviser pathway progress indicator.

---

*Session 6 complete. Unblocks: Reviser archetype (Contributor Identity layer), Classification Engine prompt update for secondary Reviser signal, Ternary UX session (ternary delta variant).*
