# Dialecta — Classification Engine Specification
*AI Prompt Architecture & Claim Threshold Definition*
*Version 1.0 — April 2026*

---

## Purpose

This document defines the operational logic of Dialecta's AI comment classification engine. It covers two interdependent components:

1. **The Claim Threshold** — the precise definition of what constitutes a "claim," and how claim specificity maps to tier placement.
2. **The Prompt Architecture** — how the AI engine is structured to analyze and classify comments consistently, fairly, and at scale.

This spec is intended for use by developers building the classification pipeline, editors calibrating the system, and as a reference when evaluating classification outputs.

---

## Component 1: The Claim Threshold

### Definition

A **claim**, for classification purposes, is a falsifiable or arguable proposition specific enough that another person could engage with it on substance.

A claim is **not**:
- An expression of feeling (*"This made me angry"*)
- An evaluative label without content (*"This is wrong / brilliant / dangerous"*)
- A tribal allegiance signal (*"Anyone who believes this has never lived in the real world"*)
- A restatement of the article or a prior comment

A claim **is**:
- A specific disagreement (*"The author conflates correlation with causation in Section II"*)
- An alternative framing (*"The better variable isn't engagement — it's asymmetric engagement between producers and consumers"*)
- An empirical challenge (*"MIT Media Lab's 2023 data showed the opposite pattern for users over 35"*)
- A conceptual extension (*"This argument applies even more strongly to recommendation engines than to social feeds, which the author doesn't address"*)

---

### The Claim Specificity Spectrum (0–3)

Claim presence is not binary. The engine assesses **specificity level**, which is the primary discriminator between tiers — particularly between Spark and Forum.

| Level | Name | Description | Example |
|---|---|---|---|
| **0** | No claim | Pure feeling, label, or tribal signal. Nothing to engage with on substance. | *"This is exactly the kind of thinking that's destroying discourse."* |
| **1** | Vague claim | An assertion exists but is too general to engage specifically. You know which side they're on, not what they think. | *"The author way overstates how much algorithms control us."* |
| **2** | Specific claim | An identifiable proposition. Someone could directly agree or disagree with it on substance. | *"The author overstates algorithmic control because he ignores that heavy users actively seek out the content they receive — it's not imposed on them."* |
| **3** | Developed claim | A specific proposition with supporting reasoning, evidence, or a named counter-argument. Full engagement. | *"The behavioral conditioning argument in Section II assumes users are passive recipients, but Pew Research (2024) shows the top 20% of social media users by time spent are also the heaviest active posters — suggesting the conditioning runs both ways, not one-directionally."* |

---

### Claim Threshold by Tier

| Tier | Claim Level Required | Notes |
|---|---|---|
| 🥇 **Forum** | Level 2 minimum | Level 3 preferred. Strong emotion is acceptable here — the claim is what elevates the comment, not the tone. |
| 💡 **Spark** | Level 1–2, underdeveloped | The idea has potential but stops short. The comment invites "say more." |
| 🪞 **Echo** | Level 0–1, restating | May contain a claim, but it mirrors what's already in the article or a prior comment without adding to it. |
| 🌫️ **Fog** | Level 0, unclear | The reader cannot determine what the person believes or what point they're making. |
| 🔥 **Heat** | Level 0–1, high emotion | Emotion is present and dominant; claim is absent or buried. Passion without a point. |
| ⚡ **Stance** | Any level, tribal framing dominant | Tribal, rhetorical, or identity-signaling markers overshadow whatever claim may exist. |
| 🚫 **Breach** | N/A — personal attack | Content targets a person, not an idea. |

### Critical Edge Case — The Passionate Forum Comment

A comment can be angry, sharp, or contemptuous of the ideas in the article and still qualify for Forum tier, **provided it is anchored to a specific, substantive claim**. The emotional register is never the disqualifier. The absence of a claimable proposition is.

---

## Component 2: The AI Prompt Architecture

### Design Principle: Reason Before Classifying

The engine must analyze a comment before assigning it a tier — in the same API call. This is not optional.

A single-pass "classify this comment" prompt will produce inconsistent, opaque outputs that users will not trust and cannot learn from. The analysis stage also produces the plain-language reason shown to the commenter, which is the primary behavior-change mechanism of the platform.

### Two-Stage Reasoning Within One API Call

The prompt requires the model to work through two explicit stages:

**Stage A — Analysis**
The model extracts structured observations:
- What claim is being made, if any?
- What is the specificity level (0–3)?
- What is the emotional register?
- Are tribal or rhetorical markers present?
- Does the comment engage with something specific in the article, or with a general impression of it?
- Does the commenter acknowledge or engage with an opposing view?

**Stage B — Classification**
Using the Stage A observations, the model:
- Assigns a tier
- Writes a plain-language commenter message (1–2 sentences, non-lecturing)
- Flags if the comment is borderline between two tiers

---

### The Prompt Template

```
You are the classification engine for Dialecta — a platform that 
rewards constructive dialogue and honest debate. Your job is to 
analyze a comment and suggest which tier it belongs in.

## THE ARTICLE (Key Claims)
[ARTICLE_CLAIMS]

## THE COMMENT
[COMMENT_TEXT]

## THE TIER SYSTEM
🥇 Forum — Specific claim, engaged with content, reasoning present. 
   Strong disagreement welcome here.
💡 Spark — Interesting idea, underdeveloped. Potential, not yet realized.
🪞 Echo — Restates article or prior comments without adding.
🌫️ Fog — Unclear. Reader can't identify what the commenter believes.
🔥 Heat — Emotional without a specific claim. Passion without a point.
⚡ Stance — Tribal framing, rhetoric, or identity signaling dominates.
🚫 Breach — Personal attack on a person, not an idea.

## INSTRUCTIONS

Work through these questions in order before classifying:

ANALYSIS:
1. What claim is the commenter making, if any? Quote or paraphrase it. 
   If none exists, say so explicitly.
2. Rate the claim's specificity: 0 (none), 1 (vague), 2 (specific), 
   3 (developed with reasoning or evidence).
3. What is the emotional register of the comment? 
   (Low / Medium / High)
4. Are tribal, rhetorical, or identity-signaling patterns present? 
   (Yes/No — if yes, give a brief example from the comment.)
5. Does the comment engage with something specific in the article, 
   or is it responding to a general impression?
6. Does the commenter acknowledge or engage with the strongest 
   version of an opposing view?

CLASSIFICATION:
Based on your analysis above, assign one tier.

Then write a COMMENTER MESSAGE — 1 to 2 sentences, non-lecturing, 
direct. Address what the comment is doing, not what it should be. 
If the tier is below Forum, include one concrete suggestion for 
what would elevate it. Do not moralize.

## OUTPUT FORMAT (strict)
CLAIM: [your answer to question 1]
SPECIFICITY: [0 / 1 / 2 / 3]
EMOTION: [Low / Medium / High]
TRIBAL MARKERS: [Yes/No + example if yes]
ARTICLE ENGAGEMENT: [Specific / General]
OPPOSING VIEW ENGAGED: [Yes / No / Partially]

TIER: [emoji + name]
BORDERLINE: [Yes/No — if yes, name the other tier and why]
COMMENTER MESSAGE: [1–2 sentences]
```

---

### Prompt Design Notes

**Why the engine needs article key claims as input**

The engine must know what there *is* to engage with. Without the article's key claims, it cannot distinguish between a comment that is vague and one that is vague *given that the article made three highly specific claims the commenter could have addressed*. Article context raises the bar appropriately.

This has a direct editorial implication: authors should be required to submit 3–5 key claims at publication. This serves the engine and clarifies the author's own thinking. (See Open Design Question 4.)

**Why the engine asks about opposing views**

A comment that acknowledges the strongest counterargument before disagreeing is categorically different from one that does not. Acknowledgment is not required for Forum tier, but it should be noted — it is the marker of the highest-quality discourse on the platform.

**Why the borderline flag exists**

Some comments will genuinely sit between Heat and Spark, or between Echo and Fog. Rather than forcing false precision, the borderline flag is more honest and creates better data for community voting to resolve. Borderline comments are the ones most worth community attention.

---

### Commenter Message Tone Standard

The commenter message is the friction moment between comment submission and publishing. Its tone must be observational, not evaluative. The difference is significant:

| ❌ Evaluative (wrong) | ✅ Observational (right) |
|---|---|
| *"Your comment doesn't make a specific point and relies on emotional language."* | *"This reads as Heat — the feeling is clear but there isn't a specific claim for others to engage with. Adding one sentence about what specifically you think is wrong would likely move this to Forum or Spark."* |

The observational version tells the commenter what is there and what one move would change. It does not make them feel graded or punished. This distinction is critical to user trust in the system.

---

### The Hardest Tier Boundaries

These are the classification calls most likely to be inconsistent and most worth building dedicated test sets for:

**Forum vs. Heat**
Both can be intense and passionate. The discriminator is whether the emotion is attached to a specific, arguable proposition. If it is: Forum. If the emotion *is* the content: Heat.

**Stance vs. Heat**
Both are emotionally charged. The discriminator is the primary function: if the comment is mainly *expressing feeling*, it is Heat. If it is mainly *signaling group membership*, it is Stance. A comment can have elements of both — assign to the dominant function.

**Spark vs. Echo**
Both lack full development. The discriminator is whether the comment adds something new. Echo restates; Spark gestures toward something that isn't yet in the article or prior comments.

**Fog vs. Echo**
Both lack substance. The discriminator is clarity: Echo is clear but unoriginal; Fog is unclear regardless of originality.

---

## System Integration Notes

### Structured Intermediate Data

The Stage A analysis fields (CLAIM, SPECIFICITY, EMOTION, TRIBAL MARKERS, ARTICLE ENGAGEMENT, OPPOSING VIEW ENGAGED) are structured data that should be logged with every classification event. This log is the foundation for:

- Auditing classification consistency over time
- Building a proprietary fine-tuned model at the Scale phase (see Roadmap Phase 5)
- Surfacing patterns in community discourse by article topic

### Community Reclassification Feed

Borderline-flagged comments should be surfaced preferentially in the community reclassification queue. These are the cases where community judgment adds the most value over AI analysis.

### Self-Declaration Contrast

When a commenter overrides the AI's suggested tier with their own self-declaration, both tiers should be stored and displayed. If a commenter claims Forum and the community subsequently downgrades the comment, that contrast is meaningful signal — both about the comment and about the commenter's calibration over time.

---

## Open Questions for Future Sessions

- **Author claim submission format** — structured field in article template, or extracted automatically by a second AI pass on article submission?
- **Claim extraction vs. claim evaluation** — at scale, these may warrant separate specialized passes rather than a single prompt.
- **Multilingual claim threshold** — the definition needs to hold across languages where rhetorical norms differ significantly.
- **Stance/Heat test set** — this boundary warrants a dedicated library of labeled examples to improve consistency.

---

*Spec compiled from Session 3 + 9 — April 2026*
*Related documents: Dialecta Project Brief, Social Media & Human Behavior (source essay)*
