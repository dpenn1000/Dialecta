# Dialecta — Project Brief
*A platform for constructive dialogue, informed debate, and idea-first discourse*

---

## Vision

A blog and community platform where **ideas are the protagonist**, not identities or political teams. The goal is not to make people agree — it is to make disagreement more honest, more specific, and more interesting. Ideas are stripped of tribal labels and evaluated on their own merits. Where most platforms engineer dopamine around outrage and conformity, this one engineers it around clarity and discovery — making independent, well-reasoned thought the most rewarded behavior on the platform.

Expanded Philosophical Description: Social media platforms have proven that reward loops are extraordinarily powerful shapers of human behavior. This platform does not reject that insight — it redirects it. The mechanics that elsewhere reward reflexive anger and group conformity are here reoriented toward curiosity, independent reasoning, and honest engagement. The goal is to make thinking well the most satisfying thing you can do here.

Started as a family blog, designed to scale into a public platform that models a better way to engage with complex topics.

**Topics:** Renewable Energy, Mental Health, Music, Economics, Humanity, Society, Political Science, Psychology, Acoustics, Theology, and more.

---

## Core Rules & Philosophy

- No name-calling, slander, or targeted personal attacks
- No binary left/right labeling of ideas — ideas stand on their own
- Empty polarized statements are discouraged, not by censorship, but by classification
- Passionate disagreement is welcome — vague outrage is not
- Full platform transparency: how the engine works is always visible to users
- User-submitted improvement ideas are welcome and publicly voteable

---

## Platform Name

**Dialecta** *(chosen)*

Other names considered during development:
- The Forum — classical civic discourse
- The Commons — shared intellectual space
- Signal — signal vs. noise
- The Agora — Greek marketplace of ideas
- Considered — the act of thinking carefully
- The Well — depth, community resource

---

## Comment Classification System

Comments are never hidden outright — they are **sorted into visible tiers**. The default view surfaces the highest-quality commentary. Every tier is browseable. Classification is a combination of AI pre-analysis, commenter self-declaration, and community voting.

### The Tiers

| Tier | Name | Description |
|---|---|---|
| 🥇 | **The Forum** | Constructive, specific, fact-referenced or clearly reasoned. Engages with actual content. Strong disagreement is welcome here — if it's about *something specific*. |
| 💡 | **The Spark** | A genuinely interesting idea, but underdeveloped. Invites expansion. The seed of something good. |
| 🪞 | **The Echo** | Restates the article or a prior comment without adding to it. Not harmful — just not propulsive. |
| 🌫️ | **The Fog** | Vague, unclear, or disconnected. The reader can't tell what the person believes or what point they're making. |
| 🔥 | **The Heat** | Emotionally charged without constructive specificity. Passion without a point. More heat than light. |
| ⚡ | **The Stance** | Heavy rhetoric, tribal framing, or coded language signaling team membership over idea engagement. A position planted rather than a conversation joined. |
| 🚫 | **The Breach** | Name-calling, slander, targeted personal attacks. A boundary crossed — the Pact broken. Content suppressed from default view, not deleted, with transparent reason shown. |

---

## The Hybrid Classification Engine

Classification works in three sequential stages:

### Stage 1 — AI Pre-Analysis (instant, on submit)
Before a comment is published, the AI engine:
- Identifies the **core claim** being made
- Flags any **named counter-arguments** present or absent
- Detects **rhetorical patterns** (tribal signaling, ad hominem, specificity level)
- Assigns a **suggested tier** with a plain-language reason shown to the commenter

The commenter sees a non-blocking reflection prompt, for example:
> *"This reads as The Heat — it expresses strong feeling but doesn't identify a specific claim to support or challenge. Want to add one before posting? Or post as-is."*

This moment of friction — not blocking, just reflecting — is where behavior change happens.

### Stage 2 — Commenter Self-Declaration
The commenter can accept the AI's suggestion or override it with their own declared tier. That declaration is visible on the comment. If they claim Forum-level and the community disagrees, that contrast itself becomes interesting data.

### Stage 3 — Community Voting
Readers can:
- Upvote or downvote comments **within** their current tier
- **Nominate a comment for reclassification** (up or down)
- Enough nominations trigger a re-review event

This creates a living, self-correcting system. The virality angle: because tier placement is public and contestable, people want to land in The Forum. Accountability without censorship.

**AI Stack:** Anthropic Claude API — preferred for nuanced language analysis, especially distinguishing passionate-but-constructive from tribal-but-empty, which requires genuine reasoning rather than keyword matching.

---

## Onboarding & In-Context Education

### First Login: The Pact Page
A single beautifully designed page — not a wall of terms. Elements:
- Platform mission in plain language
- Tier system explained with real example comments
- One active commitment: *"I understand and want to participate"*
- Optional: short interactive quiz — classify 3 sample comments to learn by doing

### In-Context Nudges (non-intrusive)
Rules appear where they're relevant, not in a sidebar people ignore:
- Hovering the comment box shows a one-line reminder of Forum-level standards
- First-time posting triggers a soft tooltip about the classification system
- If the AI flags a comment pre-publish, the specific relevant principle is shown — not a lecture

### The Living Guidebook
Always accessible from any page. Covers:
- Full philosophy and mission
- Complete tier definitions with examples
- How the AI engine works (transparency builds trust)
- How the opinion mapping tools work
- How to submit improvement ideas

### User-Submitted Improvements
A dedicated lightweight submission form — possibly a special comment category on a meta page — where users propose platform changes. Proposals are publicly visible and community-voteable, making the platform's own governance a demonstration of its values.

---

## Opinion Mapping Tools

The goal: replace binary agree/disagree with **dimensional, spatial representations** of where readers stand. No scores. No sides. Positions as landscapes.

### Option A: 2-Axis Plot (2D Cartesian) — *Recommended for Launch*
Two independent dimensions. Reader places a dot. Aggregate of all dots creates a heat map cloud.

**Example (Renewable Energy article):**
- X-axis: Cost-first ←——→ Planet-first
- Y-axis: Market-driven ←——→ Policy-driven

Visual, intuitive, works on mobile. Clusters reveal real community topology without collapsing to a score.

---

### Option B: Ternary Plot — *Signature Feature*
A triangular plot where a point represents a simultaneous blend of three positions. All three values sum to 100% — moving toward one pole pulls from the others.

**Example (Mental Health article):**
- Pole A: Individual responsibility
- Pole B: Community/social systems
- Pole C: Medical/institutional

The aggregate becomes a density map inside the triangle. Readers see if the community clusters near one pole, centers in balance, or splits into distinct camps. Has real academic credibility (political science, economics). Nothing in public discourse currently uses this.

---

### Option C: Radar/Spider Chart (multi-axis)
5–7 independent axes, each rated 0–10. Reader adjusts sliders and sees their "shape." Aggregate shows the community's average shape. Reader can compare their shape to the group.

**Example axes (Economics article):**
- Evidence quality
- Moral weight
- Practical feasibility
- Historical precedent
- Personal relevance

Best for rich articles with many independent dimensions.

---

### Option D: Barycentric Multi-Pole (4+ dimensions)
Extends ternary to 4+ poles (tetrahedron and beyond). Complex — best as an editorial analysis view rather than a reader-facing interactive. Power users and editorial team only.

---

### Implementation Notes
- The AI pre-analysis engine could **suggest which mapping tool to use** for a given article based on the nature of the debate it detects
- Sliders should feel like *reflection*, not polling — framing and copy matter enormously
- After reading an article, readers respond along dimensions that the AI or editors define *per article* — not a one-size-fits-all set of axes
- Consider showing readers how their position shifted *before vs. after* reading the article and comments — the delta is as interesting as the position

---

## Tech Stack Options

### Tier 1 — Launch Fast (0–6 months)
**Ghost CMS + Custom React Components**
- Ghost handles articles, subscriptions, and member management
- Custom React widgets injected for comment classifier and opinion mapping tools
- AI classification via Anthropic API on comment submit
- **Pros:** Beautiful out of the box, membership built in, fast to launch
- **Cons:** Some customization limits; comment system must be fully custom or adapted from third-party

**Recommended for:** Getting the concept live, proving community mechanics, validating the tier system with real humans.

---

### Tier 2 — Full Custom Build (6–18 months)
**Next.js + Headless CMS (Sanity or Contentful) + Supabase**
- Full control over every interaction
- Supabase handles auth, database, real-time vote updates
- Next.js for fast, SEO-friendly rendering
- D3.js or Observable Plot for ternary and 2D visualization
- Anthropic API for comment analysis pipeline
- **Pros:** Fully owned, infinitely extensible, clean architecture
- **Cons:** Significant build time; needs developer resources

**Recommended for:** The real platform, once Ghost pilot has validated the concept.

---

### Tier 3 — Scale Layer (18 months+)
Add to Tier 2:
- Dedicated comment microservice with its own database
- Fine-tuned ML model trained on platform's own classified comments (proprietary data becomes a moat)
- CDN and edge deployment for global performance
- React Native mobile app (shares most logic with web app)

---

## Recommended Phased Roadmap

| Phase | Timeline | Focus |
|---|---|---|
| **1 — Pilot** | 0–3 months | Ghost CMS live, family contributors, manual tier classification, concept proven |
| **2 — Engine** | 3–6 months | AI comment analysis integrated, self-declaration + community voting live, Pact Page onboarding |
| **3 — Mapping** | 6–9 months | 2-axis opinion tool live; ternary plot in beta for select articles |
| **4 — Platform** | 9–18 months | Migrate to Next.js/Supabase, full feature set, open to broader public |
| **5 — Scale** | 18 months+ | Fine-tuned model, mobile app, governance features |

---

## Open Design Questions (Next Brainstorm Sessions)

1. **Ternary plot UX** — how to onboard readers to a triangular interface intuitively
2. **AI prompt architecture** — how to structure the comment analysis prompt for consistent, fair tier suggestions
3. **Article structure** — should authors be required to identify their own key claims as part of the editorial template?
4. **Advocate Engine prompts** — before commenting, show the strongest version of the opposing view and ask readers to acknowledge it
5. **The delta mechanic** — tracking opinion shift before/after reading; how to implement without feeling invasive
6. **Governance model** — how user-submitted improvements are reviewed and implemented
7. **Monetization** — memberships, grants, partnerships? Must not compromise editorial independence

---

## Companion Documents

This brief is the platform-level overview. Detailed specifications live in dedicated documents:

- **Classification Engine Specification** — the per-comment AI analysis pipeline, prompt architecture, and tier boundary logic.
- **Tier Psychology** — the philosophical and psychological reasoning behind the seven tier names and the commenter-message tone standard.
- **Contributor Identity Specification** — the pattern-level layer above individual comments: the six axes, the fingerprint visualization, and the eight archetypes.

---

*Document compiled from brainstorming session — April 2026*
*Next step: Move to a Claude Project for persistent context and continued development*
