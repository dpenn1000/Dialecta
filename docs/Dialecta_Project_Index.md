# Dialecta — Project Index
*A map of what's in the project, where it lives, and how the pieces relate.*
*Version 0.7 — April 2026*

---

## Purpose

This is a navigational document, not a specification. It exists so that anyone walking into the Dialecta project, a new contributor, a future Claude instance, Dan returning after a break, can understand the shape of the project without reading every file. It answers three questions:

1. **What documents and artifacts exist?**
2. **Which design layer does each one belong to?**
3. **Where are the known seams and harmonization tensions between layers?**

When a new spec is added, when an artifact graduates from prototype to canonical, or when a layer's structure shifts, this index should be updated. It is the one document in the project whose job is to know about all the others.

**A note on the Cleanup Items section.** As of v0.6, cleanup tracking is reinstated as a permanent section rather than treated as a transient to-do list. Production is messy. Files drift from their canonical names, renames get announced before they happen, and scope discoveries happen in real time. Keeping a living cleanup list under the Index means discrepancies between the Index and the filesystem are captured where they will actually be seen, rather than scattered across chat history.

---

## The Six Design Layers

Dialecta's design has organized itself into six distinct layers. Each layer answers a different question and operates on a different unit of analysis. Keeping them separate lets each one evolve without forcing edits across the others.

| Layer | Question it answers | Unit of analysis |
|---|---|---|
| **Foundation** | What is this platform and why does it exist? | The platform |
| **Discourse** | What is *this single comment* doing? | One comment |
| **Contributor Identity** | What pattern of thinking does *this person* produce over time? | One contributor's full history |
| **Article** | How are articles structured to feed the engine? | One article |
| **Growth** | Who is this contributor trying to become, and how does the platform serve that on their terms? | One contributor's chosen development arc |
| **Visual Language** | How does all of this look, feel, and render? | The interface |

The Growth Layer is the newest and most ethically delicate of the six. It operates at a different timescale than the others, months and years rather than the moment of a comment or the arc of a profile, and it is the only layer that requires explicit, renewable user consent to operate. Its full philosophical foundation lives in `Dialecta_Growth_Layer_Principles.md` and should be read before any work in this layer is committed.

A **Stewards / Governance** cluster is emerging from Session 13 work (writer Orders, Cadence modifiers, Satirist's Charter). It currently lives under the Foundation layer as a governance-adjacent prototype. If it grows beyond one file, it may graduate to its own seventh layer in a future Index revision.

---

## Document & Artifact Inventory

### Foundation Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Project_Brief.md` | Spec | Canonical | The platform-level overview: vision, rules, tier system summary, mapping tools, tech stack, phased roadmap. The entry point document. |
| `Dialecta_Data_Architecture.md` | Spec | Canonical | Ground truth document for all data storage, computation, and flow. Three-layer architecture (Inputs / Compute / Store / Render), nine core data entities with field definitions, all four compute pipelines, full event pipeline walkthrough for comment submission, Ghost CMS integration notes. Every future session designs against this document. |
| `Dialecta_Editorial_Voice.md` | Spec | Canonical | The platform's writing bible. Governs tone, language, and the philosophical quote principle across all surfaces. Includes: the Stoic/classical/academic quote principle with a curated seed library, the Growth Frame doctrine, observational vs. evaluative tone standard, commenter message design principles, Growth Layer coaching prompt principles. Referenced by every session that produces copy. |
| `Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md` | Source essay | Canonical | The foundational thesis the entire platform is built on, that environments shape behavior more than stated values do. Cited by every other spec. |
| `dialecta-s13-stewards.html` | Prototype | Working artifact (desktop-only) | Session 13 Stewards page: writer Orders, Cadence modifiers, Satirist's Charter. Governance-adjacent. Candidate to spin out into its own layer if it expands. |
| `Dialecta_Stewards_Reflection.txt` | Design note | Canonical | Companion reflection document to the Stewards prototype. Captures the reasoning behind writer Orders and the Satirist's Charter. |

### Discourse Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Classification_Engine_Specification.md` | Spec | Canonical | The per-comment AI pipeline: claim threshold definition, 0-3 specificity spectrum, prompt architecture, tier boundary logic. The operational backbone. |
| `Dialecta_Tier_Psychology.md` | Spec | Canonical | The *why* behind the seven tier names: naming principles, the psychological effect each tier is designed to produce, commenter-message tone standards. |

### Contributor Identity Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Contributor_Identity.md` | Spec | Canonical (v1.1) | The pattern-level layer: The Six Pillars of Intellectual Character (Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency), the Fingerprint visualization, the eight archetypes with updated pillar signatures. Updated April 2026: all axis names revised, Magnanimity documented with Aristotle reference and philosophical grounding, aspirational mechanic updated for Q3 coaching direction decision. |
| `dialecta-fingerprint.jsx` | Prototype | Working artifact (desktop-only) | React component rendering the six-axis fingerprint visualization. Status flag: the canonical petal-engine Fingerprint also lives inside `dialecta-profile.jsx`. These two must be kept in sync or one should be retired. See Cleanup Items. |
| `dialecta-profile.jsx` | Prototype | Canonical (desktop-only) | Contributor profile page integrating fingerprint, archetype, and history. |
| `dialecta-profile-mobile.jsx` | Prototype | Working artifact (mobile-only, exploratory) | Mobile-stacked variant of the contributor profile, single-column layout with tighter padding and reordered priority. Maintained as a parallel file for on-phone development browsing until the Responsive Foundations session. |

### Article Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Article_Editorial_Template.md` | Spec | Canonical | The author submission flow: founding principle (no shaping of voice), the symmetric stage flow (mirroring the comment system), the five declaration questions, the Stage 2.5 amendment window, what the AI does (and doesn't do) with the submission, structured community reclassification reasons, wait-time architecture. Contains two pending Steelman to Advocate references, see Cleanup Items. |

### Growth Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Growth_Layer_Principles.md` | Spec | Canonical (updated) | The ethical foundation for self-directed development on the platform: the six principles, the trustee framing, the consent renewal loop, and the three-voice Self-Snapshot composition. Updated April 2026 with Aspiration Tool addendum: profile placement (Declared shelf), clean archetype separation (Q3), 90-day shelf life with dual trigger (Q4), recommitment mechanic, research consent layer (Q5). Constrains every downstream session in this layer. |
| `Dialecta_Social_UX_Architecture.md` | Spec | Canonical (updated) | Feed design, identity primitives, and the balance engineering problem. Updated April 2026: aspiration declaration and recommitment added as optionally-public identity feed events. |

The Growth Layer is foundationally committed but operationally deferred. Its execution depends on prerequisites that the platform must first establish. See *Execution Prerequisites for the Growth Layer* below.

### Visual Language Layer

| File | Type | Status | What it covers |
|---|---|---|---|
| `dialecta-design-spec.html` | Spec | Canonical (living style guide), **v1.3** | Design tokens, typography, color system, component patterns, and the canonical nav gradient + page background treatments (Sections 08 and 08b). Twelve sections including Section 12 Component Library. Section 11 uses the updated "Advocate Engine" terminology. The source of truth for visual decisions. **Desktop-only until the Responsive Foundations session.** See Cleanup Items regarding current project-file landing. |
| `Dialecta__Hero__White.png` | Asset | Canonical | Hero logo (white-variant for cream nav backgrounds). Used with `mix-blend-mode: multiply` in the canonical gradient nav. Actually a JPEG despite the `.png` extension. |
| `dialecta-logo-datauri.txt` | Asset | Canonical | Base64-encoded canonical logo data URI. This is the retrieval source for embedding the logo into any new artifact. In any new chat, retrieve with `project_knowledge_search("dialecta-logo-datauri")` rather than reconstructing from fragments. |
| `dialecta-pact.html` | Prototype | Canonical | The Pact onboarding page: hero, philosophy, tier system visual, three-comment classification quiz, two-path commitment mechanic. Uses Dialecta branding and current tier names (Stance, Breach). **Desktop-only until the Responsive Foundations session.** |

### Cross-Layer Prototypes

| File | Type | Status | What it covers |
|---|---|---|---|
| `dialecta-s02-ux-opinion-maps.jsx` | Prototype | Working artifact | Session 2 deliverable: ternary plot, 2-axis Cartesian plot, 8-archetype picker. Mobile-first React JSX. Touches Discourse, Contributor Identity, and Visual layers. Uses the canonical nav gradient and page background. **Filename still reflects its session-number origin; rename pending, see Cleanup Items.** |

### Meta

| File | Type | Status | What it covers |
|---|---|---|---|
| `Dialecta_Cleanup_Continuation.md` | Handoff doc | Canonical (reference) | Cleanup continuation instructions written to bridge a context-exhausted chat. Describes the locked canonical state and open cleanup items as of the handoff. Reference-only, superseded by this Index for current state. |

### Unsorted / Scratch

| File | Type | Status | What it covers |
|---|---|---|---|
| `dialecta-subnav-fonts.html` | Scratch | Discard candidate | Typography comparison page exploring sub-nav font choices. Does not appear canonical or referenced by any other file. Decision pending: archive or discard. See Cleanup Items. |

---

## Known Gaps

*None currently. All previously tracked conceptual gaps have been closed. Remaining open items are filesystem-level cleanup, tracked below.*

---

## Execution Prerequisites for the Growth Layer

The Growth Layer is philosophically foundational but operationally downstream. Its execution depends on three prerequisites that the platform must establish first. Capturing them here so the deferral is deliberate rather than accidental, and so early decisions in other layers can stay aware of what they're feeding into.

1. **The Classification Engine must be live and producing Stage A data per comment.** This is the raw material the Self-Snapshot Engine's *engine voice* draws from. Until classification is running on real comments, the engine has nothing to observe.
2. **The Contributor Identity layer must be live.** The Self-Snapshot Engine reuses the existing six-axis pipeline rather than building a parallel measurement system. Two independent systems on the same underlying data would be wasteful and would create the possibility of contradiction between them.
3. **The Community Reclassification mechanism must be live and producing data.** This is the *community voice* in the snapshot. Specified inside the Classification Engine doc, but the live behavior has to be running and accumulating before the third voice has anything to say.

Notably, the Growth Layer does **not** depend on the Article Editorial Template, the opinion mapping tools, the Steelman/Advocate mechanic, or the Delta mechanic. It is structurally independent of the article-side work and runs entirely off contributor-side data. Once its prerequisites are met, the Growth Layer cluster can be designed in parallel with article-side features rather than as a bottleneck.

This places the Growth Layer's natural execution window in **Phase 4 (Platform)** of the roadmap in the Project Brief, after the Engine and Contributor Identity work has proven the discourse loop, and before broader public scaling. It is, in fact, the feature set that most clearly differentiates the broader-public Dialecta from "a nicer comment section." Building it earlier risks running on too little data; building it later risks launching to a wider audience without the layer that gives a contributor reason to return.

---

## Future Sessions

Tracked here so they don't get forgotten and don't pollute the Cleanup Items list with structural work.

### Responsive Foundations

**Status:** Not started. Tracked, not blocking current cleanup.

**Why it exists.** Every prototype currently in the project was built desktop-first because the project is still in design exploration, not production. Eventually every artifact will need to render correctly on mobile and tablet. Doing this per-file as a cleanup task would mean re-deriving breakpoints, stacking rules, and component-specific adaptations eight different times across eight files. Doing it as a single dedicated session means deciding the responsive layer once and applying it mechanically afterward.

**What the session produces.**
- A canonical set of breakpoints (probably two: ~768px tablet, ~1024px desktop), documented in the Design Spec as a new section
- The canonical mobile treatment for each existing component pattern: nav gradient behavior at narrow widths, multi-column grid stacking rules, tab bar overflow handling, fingerprint visualization scaling, modal padding, comment card flex behavior
- A pattern reference in the Design Spec showing each component at each breakpoint
- A definition of done that includes verifying every existing prototype renders correctly at all breakpoints

**Then a second pass** through every existing prototype (`dialecta-profile.jsx`, `dialecta-fingerprint.jsx`, `dialecta-pact.html`, `dialecta-s02-ux-opinion-maps.jsx`, `dialecta-design-spec.html` itself, `dialecta-s13-stewards.html`) applies the canonical responsive treatment in one coordinated batch.

**When to run it.** When the platform is approaching either: (a) a real first deployment, (b) test users who will browse on phones, or (c) a collaborator demo where mobile rendering matters. Until then, desktop-first prototypes are the right cost/value tradeoff. The `dialecta-profile-mobile.jsx` file in the Contributor Identity Layer is a working exploration kept alive in the meantime so on-phone browsing during development is possible. Its existence does not change the timing of this session.

**Reference material.** When this session runs, the existing `dialecta-profile-mobile.jsx` file is useful as a *reference* for the kinds of mobile-specific decisions that come up (single-column stacking, tab bar overflow, modal padding, comment footer flex-wrap). It is not the canonical mobile build; it's prior art.

### Steelman → Advocate Terminology Scrub

**Status:** Partially complete. Design Spec v1.3 has been updated (Section 11 now reads "Advocate Engine" and "Advocate archetype"). Three other files still carry "Steelman" references. See Cleanup Items for the concrete list.

### Delta Mechanic (Session 6)

**Status:** Not started. Unblocked by Session 2 (Opinion Maps) completion. The Reviser archetype in the Contributor Identity spec depends on this mechanic existing. See Harmonization Tensions below.

---

## Harmonization Tensions

Places where two layers will eventually need to be reconciled. Flagging them here so they don't get forgotten.

1. **Archetype assignment vs. the Self-Snapshot's three-voice principle.** The Contributor Identity spec assigns one archetype per contributor based on observed pattern, closer to a verdict than to a multi-voice composition. The Growth Layer Principles (Principle 6) commit Dialecta to a three-voice snapshot in which the engine's observations are framed as *signal, never verdict*, and the user's self-description remains canonical. The two postures need to be reconciled before either layer is built against real data. The most likely resolution is that the existing archetype work becomes the *engine voice* inside the three-voice composition rather than a standalone label, but that decision should be made deliberately, not by default.
2. **Per-comment tier vs. contributor-level pillar scores.** The Classification Engine emits a tier per comment. The Contributor Identity layer aggregates comments into pillar scores. The exact mapping — which tier outcomes feed which pillars and with what weight — is implied but not specified anywhere. This will need to be written before the contributor identity layer can actually be computed from real data. See Data Architecture open questions.
3. **The Reviser archetype and the Delta mechanic.** The Reviser archetype (publicly updates position) presupposes the Delta mechanic exists to detect updates. The Delta mechanic has not been specified yet. Reviser cannot be earned until Delta ships (Phase 5).
4. **Axis name propagation across older files.** The pillar rename (Specificity→Acuity, Range→Reach, Charity→Magnanimity) was applied to Contributor Identity v1.1 but has not yet been propagated to: Classification Engine Specification (Stage A field names reference Specificity), Tier Psychology (references Specificity/Range in a few places), Project Brief (open questions section). These are low-severity since the field names are functional labels, not user-facing. Schedule a terminology pass before public launch.

---

## Cleanup Items

*Reinstated as a permanent section in v0.6. Tracked throughout production. The point of this section is to catch filesystem and naming drift the moment it happens.*

### Open

| # | Item | Severity | Notes |
|---|---|---|---|
| 1 | `dialecta-design-spec.html` v1.3 needs to land in project files | High | The canonical file has been produced and uploaded to chat. Currently `/mnt/project/` still holds only `dialecta-design-spec-v2.html`, a 168-line plain-text outline, not the real spec. Action: upload the v1.3 HTML to the project. |
| 2 | `dialecta-design-spec-v2.html` stub should be deleted once v1.3 lands | Medium | It's a 9.5 KB text extract that predates and will be superseded by the real spec. Also contains obsolete Steelman references. |
| 3 | `openground-pact.html` still present in project | Medium | The rename to `dialecta-pact.html` was announced complete in prior cleanup passes but the old file was never removed. Action: confirm `dialecta-pact.html` is the full replacement and delete the old file. |
| 4 | `dialecta-s02-ux-opinion-maps.jsx` rename to `dialecta-opinion-maps.jsx` | Low | The current filename reflects its session-number origin. The target name drops that prefix. Action: rename. |
| 5 | Steelman to Advocate terminology scrub across three files | Medium | `Dialecta_Article_Editorial_Template.md` (2 refs, Section 3), `Dialecta_Project_Brief.md` (1 ref, open questions). Design Spec v1.3 and Contributor Identity v1.1 are already done. |
| 6 | `dialecta-fingerprint.jsx` vs. the copy inside `dialecta-profile.jsx` | Medium | Two places currently hold the canonical Fingerprint engine. Decision needed: either retire the standalone file and treat the copy in profile as canonical, or retire the copy in profile and import from the standalone. Current state invites silent drift. |
| 7 | `dialecta-subnav-fonts.html` status decision | Low | Typography comparison scratch page. Not referenced by any canonical file. Decision: archive as design exploration, or discard. |
| 8 | `Dialecta__Hero__White.png` file extension mismatch | Cosmetic | File is actually a JPEG. Rename to `.jpg` or leave as-is for historical consistency. Not blocking. |
| 9 | Upload five new/updated documents from this session to project files | High | `Dialecta_Data_Architecture.md` (new), `Dialecta_Editorial_Voice.md` (new), `Dialecta_Contributor_Identity.md` (v1.1), `Dialecta_Growth_Layer_Principles.md` (updated), `Dialecta_Social_UX_Architecture.md` (updated). All produced this session and ready for upload. |
| 10 | Axis name propagation to Classification Engine Spec and Tier Psychology | Low | Stage A field names in the Classification Engine Spec still reference "Specificity" as a functional term. Tier Psychology references the old names in a few places. Low severity since these are internal spec terms, not user-facing labels. Schedule before public launch. |

### Standing contributor actions (no tool)

| # | Item | Notes |
|---|---|---|
| A | Apply chat naming convention going forward: `[Layer] — [Topic]` where Layer is one of Foundation, Discourse, Identity, Article, Visual, Growth, Build, Idea, Reference | Manual sidebar rename |
| B | Delete obsolete chats from project sidebar when encountered | Per memory: `Untitled` (757b4359), `Opus project Profile page fingerprint` (6c10add6), `Private draft mode setup` (5c1c95b9), `Logo design` (871c4b5d), `OpenGround project handoff brief` (325ae3b7) |

### Resolved

*Kept short. Prune older entries as they age out.*

- **v0.7** Six Axes renamed to The Six Pillars of Intellectual Character. All six pillar names updated: Specificity→Acuity, Range→Reach, Charity→Magnanimity (others unchanged). Magnanimity documented with Aristotle reference and philosophical grounding. Data Architecture document created. Editorial Voice document created with philosophical quote principle, Stoic/classical seed library, Growth Frame doctrine, and commenter message principles. Growth Layer Principles updated with full Aspiration Tool addendum (Q3, Q4 at 90 days, Q5 research consent). Social UX Architecture updated with aspiration and recommitment as identity feed events. Contributor Identity v1.1 delivered. Cleanup item 5 partially resolved: Contributor Identity references done; Article Template and Project Brief remain.
- **v0.6** Design Spec v1.3 completed with Section 12 Component Library and "Advocate Engine" terminology in Section 11. Landing in project files is still open (item 1 above).
- **v0.4** Pact page renamed to `dialecta-pact.html` with full content audit (tier names and branding updated). Duplicate file cleanup pending (item 3 above).
- **v0.4** Project Brief tier table updated to Stance and Breach.

---

## How to Use This Index

- **Adding a new spec?** Put it in the right layer table. If it doesn't fit any layer, that's a signal, either the layer model needs to grow, or the spec is doing too many things.
- **Promoting a prototype to canonical?** Move it from "Prototype" to "Canonical" status and note what changed.
- **Resolving a harmonization tension?** Delete the entry from the Tensions section and add a one-line note in the relevant spec about how it was resolved.
- **Closing a cleanup item?** Move it to the Resolved subsection with a version tag. Prune Resolved entries as they age.
- **Noticing file drift?** Add a cleanup item. Do not wait for a dedicated pass. The living list is the point.

---

*This index is intentionally short. If it grows past three pages, it has stopped being an index and started being a second spec. Resist that. The Cleanup Items section is allowed to be long when needed; that's the section where messy reality lives.*
