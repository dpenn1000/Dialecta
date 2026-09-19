# Dialecta — Article Editorial Template
*The Author Submission, Declaration Layer, and Symmetric Stage Flow*
*Version 1.0 — April 2026*

---

## Purpose

This document specifies how articles are submitted to Dialecta. It defines the structural template authors fill out, the AI analysis applied to their submission, the amendment window, and the post-publication community influence loop. It is a sibling document to the Classification Engine Specification (which judges per-comment outputs), the Tier Psychology document (which explains the tier names), and the Contributor Identity Specification (which aggregates patterns across many contributions).

The Article Editorial Template is the **input shape** the entire classification engine consumes. The classification prompt cannot be designed in isolation from this document, because the engine's behavior depends on what an article looks like when it enters the system.

---

## The Founding Principle

Dialecta does not try to alter an author's voice, passion, focus, or intent. The platform's job is to *understand* what an author is doing and *reflect it back accurately* — never to rewrite, sanitize, or shape the article toward a house style. This is the same commitment the classification engine makes to commenters, and the symmetry is structural, not coincidental.

The author writes freely. After writing, they pass through a structured self-reflection layer — not to edit the article, but to declare their intent so the engine has something real to work with. The AI then performs its own independent analysis. The author sees both, and decides what to do with the gap.

This is a **post-writing declaration layer**, not a pre-writing scaffold. The distinction matters. The moment the template shapes how someone writes, the platform has introduced conformity pressure — the exact thing Dialecta exists to counteract.

---

## Symmetric Stage Flow

The article submission flow mirrors the comment submission flow stage-for-stage. Symmetry between authors and commenters is a trust signal: the same rules apply to everyone, which is a core philosophical integrity point.

| Stage | Comment System | Article System |
|---|---|---|
| 1 | Write → AI pre-analysis | Write → Submit → AI analysis |
| 2 | Commenter self-declares tier | Author self-declares intent + suggested tier |
| **2.5** | **Amendment Window** | **Amendment Window** |
| 3 | Community votes / reclassifies | Community engages / nominates reclassification |

The presence of Stage 2.5 is the platform's most distinctive editorial commitment: there is always a moment, between AI feedback and publication, where the contributor can grow rather than be judged.

---

## The Declaration Layer — Five Questions

Five questions. No more. The constraint is intentional: lightweight enough that real contributors actually complete it, substantive enough that the AI has genuine signal to work with.

### 1. Core Claim *(author's own words, required)*
> *"In one or two sentences — what is this article actually arguing?"*

The author's declaration of intent. The AI will identify the core claim independently and compare. The gap between author-declared and AI-detected is valuable data — not a red flag, but a useful tension the community can engage with.

### 2. Scope Boundary *(what this is not, required)*
> *"What is this article not arguing? What common misreading do you want to preempt?"*

This question is dramatically underused in public discourse. It elevates commentary quality immediately because readers know what is in and out of scope before they respond. It also surfaces the author's awareness of their own argument's edges.

### 3. Strongest Objection *(Advocate prompt, required)*
> *"What's the strongest case against your position? You don't have to agree with it — just name it."*

This is the Advocate prompt embedded at the source. It signals intellectual honesty, gives the AI a real counterargument structure to work with, and sets the tone for the comments that follow. An author who argues the strongest objection well establishes the floor of the discussion.

### 4. Suggested Tier *(same system as comments, required)*
> *"Using the same tier system as comments — where do you think this article lands, and why?"*

Authors are subject to the same classification logic as commenters. This is consistency, not punishment. If an author submits something that reads as 🔥 Heat, they can declare it as 🥇 Forum, but the AI will note the gap and the community can engage with the contrast. The author's self-perception is itself interesting signal.

### 5. Opinion Mapping Suggestion *(optional but powerful)*
> *"What are the real dimensions of disagreement this article opens up? Suggest 2–3 axes or poles you think readers will actually split on."*

Authors are often best positioned to know where their argument will fracture. This seeds the opinion mapping tool and gives the AI a starting point — though the AI and editors can override or refine the suggestion before publication.

---

## What the AI Does With the Submission

The AI does **not** try to change the article. It performs four tasks, all reflective rather than corrective.

1. **Identifies the core claim independently** — and notes agreement or divergence from the author's declaration.
2. **Assigns a suggested tier with a plain-language reason** — using the same logic as the comment engine, calibrated for article-length submissions.
3. **Flags specific passages** that pull toward a different tier, with exactly why. Not *"this is problematic"* but *"this sentence reads as tribal signaling because it uses in-group language without a supporting argument."*
4. **Suggests or refines opinion mapping axes** based on the argumentative structure it detects.

The author sees all of this before publishing. They can accept the suggestions, ignore them, or respond to them — but the article publishes as-is if they choose. **The AI's analysis is disclosed alongside the published article, never used to gate publication.**

### The Quality Standard for AI Suggestions

Suggestions must constantly be reviewed to ensure they encourage growth rather than provoke combative responses or shut people down. The dopamine architecture of the platform lives in every micro-interaction, and the AI suggestion moment is high-stakes — it is the first time the platform talks to a new contributor. That moment should feel like a smart, generous editor, never a filter.

The platform builds in three calibration mechanisms:

- **Response quality log.** Track what percentage of Stage 2.5 interactions result in amendments vs. disagreements vs. as-is posts. If amendments are rare, the suggestions may be too vague or too discouraging.
- **User sentiment signal.** A simple one-tap reaction after seeing AI feedback: *"Helpful / Not helpful."* No comment required. This data trains the refinement cycle.
- **Periodic editorial review.** Real humans read a sample of AI suggestions monthly and flag anything that feels punitive, confusing, or tone-deaf. The prompt is refined accordingly.

---

## Stage 2.5 — The Amendment Window

After the AI analysis is returned and the author has seen it, they enter a brief structured moment — not a wall of options, just three clean choices presented with care:

> *"Here's what the engine noticed. You can amend your submission, respond to the suggestion for the record, or post as-is. None of these choices are wrong."*

### Option A — Amend
The author edits and resubmits. The AI re-analyzes the new version. The original version is not shown publicly, but the *fact* that an amendment was made can be — which itself is a positive signal. *"This contributor revised before posting"* is worth something on Dialecta.

### Option B — Respond for the Record
The author does not change anything, but leaves a brief note — agree or disagree with the AI's suggestion, in their own words. This note is attached to the submission and visible to the community. A contributor who says *"I know this reads as Heat — I disagree, here's why"* is demonstrating exactly the kind of self-awareness the platform wants to reward.

### Option C — Post As-Is
No amendment, no response. The AI's analysis is still disclosed alongside the article. The community proceeds with full information.

### Weight in the Algorithm
The author's choice at Stage 2.5 carries real but subordinate weight in the final tier determination:

- AI suggested tier — **primary signal**
- Community voting — **primary signal**
- Author self-declaration — **secondary signal**
- Stage 2.5 amendment or response — **secondary signal**, with one specific behavior: a well-reasoned disagreement with the AI nudges the tier slightly toward the author's declared position. The platform is saying *articulate self-awareness counts.*

This weighting prevents gaming. An author cannot just click *"I disagree"* and earn a better tier — the disagreement has to be reasoned, and the AI and community signals remain primary.

---

## Wait Times — Reflection as Architecture

Standard wait times are imposed before any submission posts, for any reason. The purpose is to encourage reflection and stave off the culture of instant gratification — the *"oops, I shouldn't have sent that email"* effect.

Wait times are disclosed in the Pact Page and the Living Guidebook. No one is surprised by them. **Transparency converts friction into ritual.**

The article submission flow includes a longer wait window than comments, because publishing carries more weight. The exact durations are calibrated separately and live in the Wait Architecture spec; the principle here is only that *they exist*, that they are *visible*, and that they are *framed as intention rather than punishment*.

Sample copy for the article wait window:

> *"This is intentional. Publishing here carries weight. We'll be ready when you are."*

---

## Community Influence — Post-Publication

Once the article is live, the same mechanic that governs comment reclassification applies to articles, adapted for article-scale content:

- Readers can **nominate an article for tier reclassification.** Enough nominations trigger a re-review event.
- The **author's self-declared tier, the AI-suggested tier, and the community-voted tier are all publicly visible.** The gap between them is transparent and discussable.
- Opinion map data **accumulates in real time.** The article becomes a living document of where people actually stand.

### Structured Reclassification Reasons

When a reader nominates an article (or comment) for tier change, the nomination is structured rather than free-form. The structure does several things at once: it forces the nominator to think rather than react, it creates machine-readable data the algorithm can use, it gives the original author meaningful feedback rather than just a tier change, and the predefined options themselves educate — reading through them is a brief lesson in what the platform values.

A nomination requires three fields:

**A — Suggested new tier** *(dropdown, same seven tiers)*

**B — Primary reason** *(predefined, single select)*
- Contains a specific, well-supported claim
- Engages directly with the article or a prior comment
- Introduces a genuinely new idea
- Makes a strong emotional argument without a supporting claim
- Uses language that signals group membership over argument
- Is unclear — I can't identify the core position
- Other *(opens a short text field)*

**C — Optional short note** *(140 characters max)*
Not required. Available for the nominator who wants to articulate something the predefined options don't capture.

### Nominations Visible to the Original Contributor

When nominations accumulate against a published article, the original author sees them *before* the re-review takes effect. If five people nominate a reclassification and three of them leave notes, the author sees that data first. They get another Stage 2.5 moment — another amendment window. The platform keeps pulling toward growth, not judgment.

---

## Why This Works at Scale

- **Authors write freely.** No template distorts their voice or shapes their argument toward a house style.
- **Self-declaration creates accountability without censorship.** The author commits to a reading of their own work.
- **The AI is a mirror, not a gatekeeper.** This is defensible, trust-building, and consistent with the platform's transparency principle.
- **Transparency is the feature.** Showing the author's declared tier vs. the AI's reading vs. the community's verdict creates a meta-layer of engagement that no other platform offers.
- **The system is symmetric.** The same rules apply to authors and commenters. This is the platform's core philosophical integrity point.

### The One Risk and How It Resolves

The primary risk is authors who game the self-declaration to claim Forum-level when the content reads as Heat. This risk is already handled by the architecture: the AI flags the gap, the community can contest it, and the visible contrast between self-claim and reality is itself informative. The system does not need to be airtight. It needs to be **transparent.**

---

## Integration With Other Specs

- The **Classification Engine Specification** consumes the Declaration Layer fields directly. Core Claim, Scope Boundary, Strongest Objection, and Suggested Tier all appear in the prompt as `AUTHOR'S DECLARED INTENT` and `AUTHOR'S SUGGESTED TIER` slots.
- The **Tier Psychology** document governs the language used in AI suggestions and Stage 2.5 messaging. All copy in the Article submission flow must follow the tone standards defined there: observational, never evaluative; one suggestion per message; "reads as" not "is classified as."
- The **Contributor Identity Specification** treats published articles as inputs to the contributor's pattern history alongside comments. An author's full archetype and fingerprint are computed from both kinds of contribution.
- The **Opinion Mapping** tools consume the author's Question 5 suggestions as the seed for axis or pole definitions, which the AI and editors can then refine.

---

## Open Calibration Questions

These are deferred to live testing rather than specified here:

- The exact wait-window durations for article publication.
- The threshold (number of nominations) that triggers a community re-review.
- The precise weight of Stage 2.5 disagreement in the final tier algorithm.
- Whether the Opinion Mapping suggestion question (Question 5) should be required for certain article types.
- How guest contributors are onboarded to the template without overwhelming them on first submission.

---

*Source: extracted and consolidated from design session "Article editorial template as system foundation" — April 2026.*
