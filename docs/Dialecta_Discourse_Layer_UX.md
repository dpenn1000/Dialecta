\# Dialecta — Discourse Layer UX Specification

\*Comment Submission, Classification Display, Feed Mechanics, and Community Reclassification\*

\*Version 1.0 — April 2026\*



\---



\## Purpose



This document specifies the complete Discourse Layer UX as built in `dialecta-discourse-layer.jsx`. It covers the three-stage comment submission flow, the comment card and its variants, the feed display and sorting mechanics, and the community reclassification nomination panel. It is a companion to the Classification Engine Specification (which defines the AI pipeline and prompt architecture) and the Design Specification v1.3 (which defines all visual tokens and component patterns).



The Discourse Layer is the most user-facing expression of Dialecta's founding principle: that the quality of discourse is shaped by the incentives around it. Every interaction in this layer is designed to make specificity and honest engagement the path of least resistance.



\---



\## The Three-Stage Flow



Comment submission passes through three sequential stages. The stages are symmetric with the Article Editorial Template's author submission flow by design — the same rules apply to authors and commenters, which is a core philosophical integrity point.



\### Stage 1 — Write and Analyze



The composer opens inline at the top of the discussion section when the reader clicks "Add a comment." It does not navigate away from the article.



The composer shows a single-line nudge bar above the textarea: \*"Forum-level — identify a specific claim and engage with it directly."\* This is the platform's standard in plain language, shown at the moment it's relevant rather than in a sidebar no one reads. The nudge bar uses the `--gold-pale` surface so it reads as a system voice without being intrusive.



The textarea uses the canonical `.textarea-field` treatment: `--border-medium` border, `--radius-sm`, amber border and `0 0 0 3px rgba(184,115,42,0.08)` focus ring. Font is Source Serif 4 at 0.92rem — the reading face, because a comment is a piece of writing.



"Analyze my comment" is disabled until the text reaches 12 characters. Once clicked, the button is replaced by a "Reading..." loading indicator and the comment is sent to the Claude API using the canonical two-stage prompt from the Classification Engine Specification. The analysis fires in the same API call as the classification — the engine reasons before it classifies, not after.



\### Stage 2 — AI Reflection and Self-Declaration



On return from the API, two panels appear in sequence.



\*\*The AI Classification Card\*\* uses the canonical Section 10 pattern: `--gold-pale` background, `3px solid --amber` left bar, `0 --radius-md --radius-md 0` border radius. The label reads "Classification Engine" in DM Mono. The suggested tier badge, the plain-language commenter message, and the structured analysis grid (specificity dots, emotional register, tribal signals, article engagement, opposing view) are all shown. The tone is observational throughout — the message describes what the comment is doing, not what the commenter should feel about it.



\*\*The self-declaration panel\*\* presents all seven tiers as a grid. The AI-suggested tier is marked with a `--dark-card` pip labeled "AI suggestion" in gold DM Mono. If the commenter selects a different tier, a contrast note appears: \*"The AI reads this as X. You're declaring Y. Both will be visible. That contrast is part of the record."\* This is not a warning — it is a statement of fact about how the system works.



The "Post comment" button uses `btn-primary` (Cormorant Garamond, `--bg-dark` surface). It is disabled until a tier is selected.



\### Stage 3 — Posted



On post, the compose area closes and the new comment appears in the feed. It carries a gold border glow and a "New" pill for six seconds before settling into the list as a standard card. The topology bar updates immediately to reflect the new comment's tier in the distribution.



\---



\## Comment Card Anatomy



The canonical comment card (`.comment-card`) uses `--bg-white` surface, `1px solid --border-light` border, `--radius-md`, and `--shadow-sm` with a `--shadow-md` hover state.



\*\*Header row\*\* contains: declared tier badge, AI tier badge (if different, with "AI" label and "self-declared" italic note), author name in DM Sans 500, archetype tag in DM Mono amber (if assigned), and timestamp in DM Mono tertiary.



\*\*Body\*\* is Source Serif 4 at 0.92rem, 1.75 line height, `--text-body` color.



\*\*Footer row\*\* contains: vote controls (up/down triangles with live state, amber on active vote), specificity dots (8px, amber filled / border-medium unfilled), reply count (if present), and the reclassification nomination control.



\*\*The Contrast Strip\*\* appears beneath the footer when the declared tier and AI tier differ. It uses the `--gold-pale` surface with a `2px solid --amber` left bar — the same visual family as the AI Classification Card, signaling a system observation. Copy: \*"Commenter declared \[Tier]. Engine read \[Tier]. Community voting will settle it."\* This is displayed publicly on every comment with a contrast, permanently.



\*\*The Breach variant\*\* renders at 0.65 opacity with the body replaced by an italic suppression notice: \*"Content suppressed — targets a person, not an idea. Visible here with explanation per platform transparency policy."\* The original text is never shown. The explanation is always shown.



\*\*New comment variant\*\* gets a `0 0 0 2px --gold + --shadow-md` box-shadow and a gold "New" pill in the header, both expiring after six seconds.



\---



\## Feed Mechanics



\### Topology Bar



The topology bar sits at the top of the discussion section, above the control bar. It renders a proportional horizontal strip segmented by tier, using each tier's `180deg` gradient and border color. Each segment is clickable and filters the feed to that tier. Below the strip, tier labels with comment counts provide a text legend. Segments and labels dim when another tier is active as a filter.



The topology bar is a transparency feature as much as a navigation feature. It shows the shape of the conversation before the reader reads a single comment — how much Forum discourse exists, whether Heat or Stance dominate, whether the discussion is polarized or mixed.



\### Control Bar



The control bar is sticky below the two-bar nav (top: 86px, accounting for the 52px logo bar and 34px sub-nav). It uses the canonical metallic sub-nav gradient: `linear-gradient(to bottom, #eceae4 0%, #d8d4cc 48%, #eceae4 100%)`.



Left side: "All" button plus one filter button per tier. Active filter uses the tier's gradient and border. Inactive tiers dim to 50% opacity when a filter is active.



Right side: three sort modes. Quality (default), Newest, Most discussed.



\### Sort Modes



\*\*Quality\*\* sorts by tier rank first (Forum before Spark before Echo, and so on), then by vote count within tier. This is the default and the most important design decision in the feed: it makes high-quality commentary the first thing a new reader sees, which directly shapes their model of what the platform values.



\*\*Newest\*\* sorts by post time, most recent first. Used when the reader wants to follow an active conversation as it develops.



\*\*Most discussed\*\* scores each comment by votes plus replies (weighted 2x) plus nominations, and sorts descending. It surfaces the most contested or engaged-with comments regardless of tier.



\---



\## Stage 3 — Reclassification Nomination



The nomination control appears in every comment footer (except Breach, which cannot be escalated further). If no nominations exist, it renders as a subtle underlined link: "Nominate for reclassification." If nominations exist, it shows the count instead: "3 nominations."



Clicking opens the nomination panel inline, directly beneath the comment's footer. The panel does not use a modal — the nominator stays in visual contact with the comment they are judging.



\### Step 1 — Suggest a Tier



All seven tiers are shown as a single-column list. Each row has three zones: a 44×44 icon chip carrying the tier's full gradient and a 20px icon, a text zone with the tier name and a one-sentence description, and a right zone showing either a selection indicator or the "Declared" pill.



The currently declared tier is shown at full opacity with the gradient background, a tier-colored border, and a colored glow shadow (`0 0 0 2px {border}38, 0 4px 16px {border}22`). It lifts 1px from the stack. The right zone shows a "Declared" pill in `--gold-pale` with amber text. The row is not selectable.



The Forum icon renders in `--text-primary` (#1c1814) rather than the tier text color, because the chip is near-white and the contrast would otherwise be insufficient. All other tier icons render in their tier text color.



A terra-colored divider with a centered "Pact violation" label separates the Breach row from the six tiers above it. This signals categorically that a Breach nomination is a different kind of action before the nominator reads the description.



\### Step 2 — Reason and Note



Seven predefined reasons are presented as styled radio options (Source Serif 4, gold-pale on selection). These are the canonical reasons from the Article Editorial Template:



1\. Contains a specific, well-supported claim

2\. Engages directly with the article or a prior comment

3\. Introduces a genuinely new idea

4\. Makes a strong emotional argument without a supporting claim

5\. Uses language that signals group membership over argument

6\. Is unclear — I can't identify the core position

7\. Other



Reading through these options while nominating is itself a brief orientation to what the platform values. The structure forces thought rather than reaction, which is its primary purpose.



An optional 140-character note field follows. No minimum length. The predefined options exist precisely so the nominator does not have to articulate everything from scratch.



\### The Breach Distinction



When Breach is selected in Step 1, a dark warning panel appears beneath the tier list before the nominator advances. It uses the Breach surface colors (#380808 background, #200404 border, terra left bar) and explains in plain language: a Breach nomination signals a personal attack; if enough readers agree, the comment will be suppressed with a visible explanation; the original commenter will see the nominations before any action is taken.



This is the only tier that receives this treatment. It is calibrated to make a Breach nomination feel like a serious, considered action without blocking it.



\### Confirmation State



After submission, the panel collapses into a receipt strip using a `3px solid --terra` left bar (distinct from the amber AI-card family, signaling community action rather than engine output). It shows the suggested tier, the selected reason, and any note. The footer nomination count increments immediately. The footnote confirms that the original commenter will see nominations before re-review takes effect.



\---



\## Design Decisions Made in This Session



These decisions are locked in the current prototype and should be carried forward in any rebuild.



\*\*AI card surface.\*\* The AI Classification Card uses `--gold-pale` + amber left bar (Section 10 of the Design Spec), not `--bg-dark`. The solid `--bg-dark` surface is retired as a page surface per the spec.



\*\*Contrast strip surface.\*\* The contrast strip on comment cards (AI vs declared tier) uses the same `--gold-pale` + amber left bar family as the AI card. This is intentional: both are system observations, so both should feel like the same kind of voice.



\*\*Nomination receipt surface.\*\* The nomination confirmation receipt uses a `--terra` left bar rather than `--amber`. The distinction is deliberate: amber means the engine is speaking; terra means the community is acting. These are different systems.



\*\*Forum icon contrast.\*\* The Forum tier icon renders in `--text-primary` (#1c1814, near-black) rather than the tier's own text color (#6A5410). The Forum chip is near-white cream, and the tier text color has insufficient contrast against it. The black icon on white chip reads as "crystal clear" — which is conceptually appropriate for the highest-quality tier.



\*\*Quality sort as default.\*\* The feed sorts by tier rank first, votes second. This is the behavioral design of the platform made visible: it ensures that the first comments a new reader sees are the best ones, which sets the norm for what good discourse looks like here.



\*\*Descriptions in nomination picker.\*\* The tier descriptions in the nomination panel Step 1 are not optional labels — they are the platform's educational mechanism. A nominator who reads through all seven descriptions while deciding has received a brief lesson in what Dialecta values. This is by design.



\---



\## Deferred to Future Sessions



\*\*Thread/reply UI.\*\* Reply counts are shown and linked, but replies do not expand. The thread view requires its own design session — the nesting depth limit, the thread sort, and how tier badges behave on replies all need to be specified before building.



\*\*Real-time vote and nomination sync.\*\* Vote and nomination counts are local state in the current prototype. Production requires WebSocket or polling infrastructure, which is a Phase 2 concern.



\*\*"Commenter sees nominations before re-review" mechanic.\*\* The receipt copy describes this behavior, but the notification surface — where a commenter actually sees the accumulated nominations and notes — has not been designed. This is a social UX session: it likely lives in the contributor profile or a notification center.



\*\*Borderline comment surfacing.\*\* The Classification Engine Specification notes that borderline-flagged comments should be preferentially surfaced in the community reclassification queue. No reclassification queue view has been designed. This is also a future session.



\*\*Responsive layout.\*\* The component is desktop-only, consistent with every other Dialecta artifact. The Responsive Foundations session will address all files simultaneously.



\---



\## Files



| File | Status | Notes |

|---|---|---|

| `dialecta-discourse-layer.jsx` | Canonical first draft | Merged artifact. Supersedes `dialecta-comment-declaration.jsx` and `dialecta-comment-feed.jsx`, both of which are now retired. Upload to project files. |

| `Dialecta\_Classification\_Engine\_Specification.md` | Canonical | Defines the AI prompt, tier boundary logic, and community reclassification architecture. The Discourse Layer UX consumes this spec. |

| `Dialecta\_Tier\_Psychology.md` | Canonical | Defines the naming rationale and commenter-message tone standard. The tier descriptions used in the nomination picker were drawn from this document. |

| `dialecta-design-spec.html` | Canonical (v1.3) | Source of truth for all visual tokens used in this layer. |



\---



\*Compiled from Discourse Layer design session — April 2026\*

\*Related documents: Dialecta Classification Engine Specification, Dialecta Tier Psychology, Dialecta Design Specification v1.3\*

\*Status: v1.0 — First draft. Locked pending upload to project files.\*

