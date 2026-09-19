# Dialecta — Coherence Audit

*Conceptual coherence pass: vision vs build, principle integrity, redundancy at the architectural level.*
*Phase A in progress. Phases B–E follow.*
*Started: 2026-04-26*

---

## Audit Method

| Phase | What it does | Read/Write |
|---|---|---|
| **A. Vision capture** | Read all conceptual material in OneDrive Dialecta. Synthesize the original intent by domain. Surface internal inconsistencies *within* the concept docs themselves. | Read-only |
| **B. Reality capture** | Read every theme `src/` file, every API route, the Supabase schema, all `.hbs` templates. Catalog current state by the same domains. | Read-only |
| **C. Coherence map** | Per domain: cohesion verdict + drift + bloat + gap. Diagnostic only — no fixes. | Read-only |
| **D. Recommendations** | Findings split four ways: spec-update / build-fix / spec-was-wrong / build-extension. Filtered through Phase 1 launch lens. | Write proposal |
| **E. Execution** | Per-item changes after explicit greenlight. | Write code/spec |

**Phase 1 launch definition (user-confirmed 2026-04-26):** the initial Ghost / Supabase / React / Vercel launch. Concepts requiring a full development team and infrastructure are explicitly **not** in Phase 1.

**Phase 1 posture (user-confirmed 2026-04-26 update):** Maximalist. *"I intend to build every part of this concept I can for the Phase 1 launch. The more engaging this launch is, the more successful it will be."* Implication: every concept the API CLAUDE.md lists as "Deferred" gets re-evaluated for Phase 1 feasibility before deferral is accepted. The audit's filtering question becomes "what *can* we build for Phase 1," not "what does the original roadmap call Phase 1."

**Audit-vs-Build separation (user-confirmed 2026-04-26 clarification):** The optimization pass does not build the Phase 1 features themselves. Its job is to make the right *decisions* about what Phase 1 will contain, then deliver an ordered build queue (Phase D output). Every audit decision assumes Phase 1 scope items will be built — which means Delta is treated as live (not deferred), Reviser is treated as earnable (not un-earnable), the pillar-score function is treated as written (not missing), and the eight-archetype set ships complete. There is no hard launch date — quality and completeness are the constraints, not time.

---

## Phase A — Vision Capture

### Domain 1: Foundation

**Read in this domain:**
- `Fundamentals\Dialecta_Project_Brief.md` (246 lines, April 2026)
- `Fundamentals\Dialecta_Project_Index.md` (v0.7, April 2026)
- `Fundamentals\Dialecta_Founding_Philosophy.md` (v1.0, April 2026)
- `Fundamentals\Dialecta_Editorial_Voice.md` (v1.1, April 2026)

#### The Source Thesis

**"Human behavior is less influenced by stated values than by environmental incentives. Whatever a system rewards, humanity will adapt toward."** This is the load-bearing claim from which every design decision derives. It is non-cynical: human beings have moral agency, but it operates inside environments that select for certain behaviors and over time shape the kinds of people who inhabit them.

The platforms that dominate public discourse have reward structures that produce outrage and tribal performance. Dialecta runs the same logic in the opposite direction: design an environment that rewards specificity, intellectual honesty, and genuine engagement, and watch what emerges.

#### The Three Anthropological Threads

1. **Post-scarcity.** Information is abundant; *evaluation capacity* is now the scarce resource. Platform bets that when outrage stops being the most-rewarded behavior, attention reaches for genuine quality.
2. **Relationism** (David Brooks). The isolated self is insufficient. Humans are formed by the discourse communities they inhabit. The platform is a relational instrument: not building better individual commenters but better ways of thinking together.
3. **Spiritual** (non-sectarian). Discourse is formative beyond informational content. Platforms either corrode or build character at scale. Dialecta's wager: the same mechanism can run in the opposite direction.

#### The Ten Articles (compressed)

1. Human dignity > utility
2. Tech serves liberation, not control (AI reflects, never gatekeeps)
3. Isolated self insufficient (relational architecture)
4. Fear is primitive governance (describe, don't punish; transparent Breach, not silent suppression)
5. Truth requires plural paths (no dogmatic captivity; classical + Stoic + Buddhist + spec-fic all welcomed)
6. Diversity protected by specificity standard (any honest, defended position belongs)
7. Help must empower (Growth supports, doesn't classify as adequate/inadequate)
8. Systems shape souls (the thesis as doctrine)
9. Inner mastery still matters (Growth Layer is invitation, not coercion)
10. Civilization-scale moral experiment

#### Intellectual Lineage

- **Stoic:** Marcus Aurelius (observational tone), Epictetus (control distinction → non-blocking architecture), Seneca (seriousness of attention)
- **Aristotelian:** virtue as habit → the Fingerprint
- **Socratic:** examined life, Charity principle → tier system as Socratic method
- **Modern:** David Brooks (relationism)
- **Speculative fiction as moral philosophy:** Iain M. Banks (Culture series — what people choose without coercion), Ursula K. Le Guin (Dispossessed — idealism without sentimentality), Gene Roddenberry (Star Trek — post-scarcity as cultural premise)

These earn quote standing equal to classical sources when they pass three tests: precision, weight, brevity.

#### The Six Design Layers (per Project Index)

| Layer | Question it answers | Unit of analysis |
|---|---|---|
| Foundation | What is this platform and why does it exist? | The platform |
| Discourse | What is *this single comment* doing? | One comment |
| Contributor Identity | What pattern of thinking does *this person* produce over time? | One contributor's full history |
| Article | How are articles structured to feed the engine? | One article |
| Growth | Who is this contributor trying to become, and how does the platform serve that on their terms? | One contributor's chosen development arc |
| Visual Language | How does all of this look, feel, and render? | The interface |

Plus an emerging **Stewards / Governance** cluster (Session 13) — currently under Foundation, candidate to graduate to its own seventh layer.

#### Core Mechanics (Foundation-level)

- **Seven tiers, never deleted, always sorted:** Forum / Spark / Echo / Fog / Heat / Stance / Breach
- **Three-stage classification:** AI pre-analysis → commenter self-declaration → community reclassification
- **Opinion mapping:** 2-axis Cartesian (recommended for launch) / ternary plot (signature) / radar (multi-axis) / barycentric multi-pole (editorial only)
- **Living Guidebook** always accessible from any page
- **User-submitted improvements**, publicly voteable — governance as demonstration of values

#### Onboarding Architecture

- **Pact page:** mission, tiers with examples, single active commitment, optional 3-comment quiz
- **In-context nudges:** rules appear where relevant, not in sidebars
- **The Living Guidebook:** philosophy, tier definitions, AI engine transparency, mapping tools, governance

#### Editorial Voice — The Operating Principles

- **Observational, never evaluative.** "This reads as The Heat" not "You're being tribal."
- **The Growth Frame:** name something specific that is there, point toward not away, find the dopamine hit.
- **Five commenter-message rules:** name what's there / one concrete suggestion / tier name as descriptor not verdict / never moralize / always "or post as-is" except Breach.
- **Philosophical quotes earned, not decorative:** precision + weight + brevity. Spec-fic earns by doing philosophical work in original context.

#### Phased Roadmap (per Project Brief, April 2026)

| Phase | Timeline | Focus |
|---|---|---|
| 1 — Pilot | 0–3 months | Ghost CMS live, family contributors, **manual** tier classification, concept proven |
| 2 — Engine | 3–6 months | AI comment analysis, self-declaration, community voting, Pact onboarding |
| 3 — Mapping | 6–9 months | 2-axis opinion tool live, ternary plot in beta |
| 4 — Platform | 9–18 months | **Migrate to Next.js/Supabase**, full feature set, broader public |
| 5 — Scale | 18 months+ | Fine-tuned model, mobile app, governance features |

#### Internal Inconsistencies & Tensions Surfaced (Phase A — observations only, no verdicts)

These are tensions or drifts found *within or among the foundation docs themselves*, before any comparison to the build. They are noted here to revisit during Phase C.

1. **Roadmap-vs-current-stack drift.** Project Brief phases the migration to Next.js/Supabase as Phase 4 (9–18mo). The current build is **Ghost + Supabase + Vercel** with Next.js explicitly deferred per the API CLAUDE.md. The user has confirmed Phase 1 = current Ghost/Supabase/React/Vercel launch — meaning Phases 1–4 of the Brief have been compressed and partially reordered (Supabase pulled in early, Next.js dropped). The Brief's roadmap is authoritative for *intent* but no longer authoritative for *sequence*.

2. **Topics list drift.** Project Brief line 14 lists topics: "Renewable Energy, Mental Health, Music, Economics, Humanity, Society, Political Science, Psychology, Acoustics, Theology." The canonical 12-topic v2 set (per API CLAUDE.md) is `politics_governance / law_justice / history / economics / environment_energy / health_medicine / psychology_behavior / science_technology / philosophy_ethics / arts_humanities / theology_spirituality / society_culture`. Project Brief is stale on the taxonomy.

3. **Project Brief Companion Documents incomplete.** Lists Classification Engine Specification, Tier Psychology, and Contributor Identity Specification. Does not yet list **Founding Philosophy** (v1.0) or **Editorial Voice** (v1.1) — both later canonical Foundation docs. Project Brief needs forward-reference to acknowledge the Foundation layer's expansion.

4. **Project Index Cleanup item 5 outdated.** Says Project Brief still has one steelman reference in Open Design Questions. Visual scan shows Project Brief reads "Advocate Engine prompts" (line 228), already scrubbed. Cleanup item should be marked Resolved for Project Brief.

5. **Project Index inventories files not found in OneDrive.** The Index references several canonical files that do not appear in the OneDrive Dialecta tree — `Dialecta_Tier_Psychology.md`, `Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md`, `Dialecta_Stewards_Reflection.txt`, `Dialecta_Cleanup_Continuation.md`, `dialecta-design-spec.html` (Index says canonical but Cleanup item 1 says it hasn't landed in project files), `Dialecta__Hero__White.png`, `dialecta-logo-datauri.txt`. These likely live in the **Claude.ai project files** (a separate store from OneDrive). The Index is mapping the Claude.ai project, not OneDrive. Implication: **Claude.ai project files and OneDrive Fundamentals are not yet synchronized**, and the Index can't easily distinguish them.

6. **Em-dash convention split.** API CLAUDE.md "Behavioral Rules": "Do not use em dashes. Use colons, commas, or periods instead." Editorial Voice doc uses em dashes liberally throughout (including in its own quote-attribution formatting). Likely intent: the no-em-dash rule applies to UI copy / commenter messages / Growth prompts, not to internal spec writing. But this is implicit, never stated. Worth making explicit.

7. **Capitalization inconsistency.** Founding Philosophy Section VI references `Dialecta_Pact.html` (CamelCase). Actual file is `dialecta-pact.html` (kebab-case). Same file, different conventions across docs. Minor.

8. **Phase 1 definition divergence.** Project Brief Phase 1 = "Ghost CMS live, family contributors, manual tier classification, concept proven" (0–3mo). User's stated Phase 1 today = "initial Ghost/Supabase/React/Vercel launch" with AI classification live. The user's Phase 1 collapses Brief's Phases 1+2 (and pulls Supabase in from Phase 4). This is an intentional re-scoping driven by faster-than-expected progress — but the docs haven't been updated to reflect the compressed phase model.

9. **Stewards/Governance cluster status.** Project Index notes Stewards is "emerging" from Session 13 work and "candidate to graduate to its own seventh layer." `dialecta-s13-stewards.html` exists in OneDrive root (440KB — substantial). The cluster's relationship to Phase 1 is undefined: is Stewards in or out of Phase 1?

10. **Editorial Voice Section "Coaching Prompt Principles" presupposes Practice Layer.** "Coaching prompts that surface within the Practice Layer follow…" — the Practice Layer is in the API CLAUDE.md "Deferred" list. So this section of Editorial Voice is forward-looking for a layer not yet built, which is fine, but it shouldn't be conflated with current commenter-message principles.

---

#### Domain 1 Open Questions for User Confirmation

- **Stewards in Phase 1?** Treat the Session 13 Stewards/Governance work as in-scope for launch, or as deferred?
- **Project Brief authority.** Is the Project Brief still authoritative for vision, even if its roadmap is stale? Or does it need a v2 update before launch?
- **Claude.ai project file sync.** Should the audit attempt to reconcile Claude.ai project files with OneDrive, or treat them as separate authority domains?

---

#### Domain 1 Answers (User-Confirmed 2026-04-26)

1. **Stewards in Phase 1: YES.** *"Stewards is a relatively fully developed concept. Authors should have an identity, pride, and an alluring pomp and circumstance. Let's galvanize it."* Implication: Phase B will inventory Stewards-related code (`dialecta-s13-stewards.html`, any author-facing UI). Phase D will include Stewards as a Phase 1 deliverable. The "candidate to graduate to its own seventh layer" status in the Project Index is now active — Stewards becomes a first-class layer for Phase 1.

2. **Project Brief authority: UPDATE IT (v2 before launch).** The April 2026 brief is authoritative for vision but stale on: roadmap (collapsed phases), topic taxonomy (old 10-topic list vs canonical 12), companion docs (missing Founding Philosophy and Editorial Voice), phase definition (old Phase 1 = manual classification pilot vs current Phase 1 = full AI-classification launch). "Reverse engineering the fundamentals" applies — sophomoric early framing gets replaced by current understanding.

3. **Claude.ai project file sync: SELECTIVE (delegated decision).** Sync only files that are Phase 1 critical and not already covered in OneDrive. Skip historical / scratch / superseded files.

   **Sync (action item — user downloads from Claude.ai project, places in OneDrive `Fundamentals\`):**
   - `Dialecta_Tier_Psychology.md` — confirmed missing; Discourse Layer canonical, Phase 1 has tiers live
   - `Dialecta_Stewards_Reflection.txt` — confirmed missing; Stewards now Phase 1, the reasoning matters
   - `dialecta-logo-datauri.txt` — not in OneDrive `Logos\` (which has PNG/SVG only); referenced by every nav-bearing component for inline embedding

   **Verify, then sync only if needed:**
   - `dialecta-design-spec.html` v1.3 — `Fundamentals\dialecta-design-spec.html` exists in OneDrive but version unknown. Confirm whether OneDrive's copy already includes Section 12 Component Library and "Advocate Engine" Section 11. If older, replace with v1.3 from Claude.ai.
   - Hero logo PNG — OneDrive `Logos\` has multiple variants (`Dialecta - Hero - White.png`, `Dialecta - Hero Logo - White.png`). Confirm one matches the canonical "white-on-cream multiply-blend" version referenced in the design spec.

   **Skip:**
   - `Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md` — Founding Philosophy already absorbs the operational argument
   - `Dialecta_Cleanup_Continuation.md` — superseded by Project Index v0.7
   - `dialecta-subnav-fonts.html` — already a discard candidate (Project Index Cleanup item 7)

   **Cost-benefit reasoning:** Three confirmed-required syncs cover the active blast radius for Phase 1. Two need a quick user verification. Three skips are either redundant (Social Media essay → Founding Philosophy already carries the argument), superseded (Cleanup Continuation → Project Index v0.7), or already pending discard. Full Claude.ai-to-OneDrive sync would add ongoing maintenance burden for near-zero operational value. Better to keep the canonical store lean and trustworthy than complete and noisy. Going forward: any new canonical doc produced in Claude.ai is downloaded to OneDrive `Fundamentals\` immediately, not at sync passes.

---

*Domain 1 captured + answers locked.*

---

### Domain 2: Contributor Identity & Fingerprint

**Read in this domain:**
- `Fundamentals\Dialecta_Contributor_Identity.md` (v1.1, April 2026, 173 lines)
- `The Living Fingerprint\dialecta-fingerprint.jsx` (~2500+ lines, structure surveyed via grep — full read exceeds 25K-token limit)
- `Profile Pages\dialecta-profile-responsive.jsx` (115 lines, responsive wrapper)
- `Profile Pages\Profile-1.jpg`, `Profile-2.jpg`, `Profile-3.jpg` (design mockups, not read directly — visual references only)

#### The Core Move

**Contributor identity is descriptive, not declarative.** A user does not pick what kind of thinker they are. The platform observes the pattern and reflects it back. This is the inversion of every social platform's bio field: identity is *earned through the work*, never asserted upfront.

The unit of analysis differs from the tier system. Tier system: *what is this comment doing?* Contributor Identity: *what pattern of thinking does this person consistently produce, over months and years?* Different timescales, different docs, must evolve independently.

#### The Six Pillars of Intellectual Character

Three pairs, each capturing a different dimension:

| Pair | Pillar | Measures |
|---|---|---|
| **Substance** | Acuity | Precision and claimability of points |
| **Substance** | Reach | Topic breadth across distinct areas |
| **Intellectual Honesty** | Calibration | Confidence matched to evidence strength |
| **Intellectual Honesty** | Magnanimity | Faithful representation of opposing views before engaging |
| **Engagement** | Discourse | Sustained back-and-forth vs. hit-and-run |
| **Engagement** | Consistency | Regular presence over time |

Spec name: **The Six Pillars of Intellectual Character.** Display: **Intellectual Character** or **Character** where space requires.

**Quote anchor:** *"We are what we repeatedly do."* — Will Durant via Aristotle.

**Magnanimity is the rarest and most consequential:** Aristotelian "greatness of soul," the Principle of Charity in operation. The Advocate archetype is its fullest expression.

#### Why Six, Why These Trade-Offs

Each pillar names a behavior the classification engine can detect from a single comment — earnable incrementally, no self-report, not gameable through volume alone (quality is encoded in tier-mix history).

Trade-offs are **intentional**:
- Acuity vs. Reach (deep on one topic vs. wide across many)
- Discourse vs. Calibration/Magnanimity (high-volume back-and-forth outruns careful holding of every position)
- Consistency vs. quality pillars early on (showing up while still developing voice produces noisier history)

These trade-offs are why every contributor produces a *shape* rather than a uniform circle. A platform where everyone could max every pillar would mean the pillars meant nothing.

#### The Fingerprint (Visual Rendering)

Six-petal shape. Each petal built from:
1. **Graduations** — rings earned as a function of comment count at sufficient quality
2. **Tier history** — mix of Forum/Spark/Echo/Fog/Heat/Stance behind each ring. High-purity = smooth confident curves. Low-purity = visible wave texture in inner rings.

**The key property: unfakeable.** The shape can only be produced by actually doing the work. Earned growth visible. Recent regression visible. History legible to the contributor themselves — including the parts they have grown out of.

#### The Eight Archetypes (Assigned, Never Declared)

| Archetype | Icon | Pattern | Primary Pillars |
|---|---|---|---|
| Skeptic | 🔎 | Questions premises before accepting conclusions | Calibration + Acuity |
| Synthesizer | 🌀 | Finds unexpected connections across domains | Reach + Acuity |
| Advocate | ⚖ | Argues the strongest version of views they disagree with | Magnanimity + Acuity |
| Builder | 🏗 | Extends ideas into practical frameworks | Acuity + Discourse |
| Empiricist | 🔬 | Grounds every claim in evidence and data | Acuity + Calibration (maxed) |
| Contextualist | 🗺 | Situates ideas in historical/cultural frame | Reach + Calibration |
| Illuminator | 💡 | Makes complex ideas accessible without losing nuance | Acuity + Magnanimity + Discourse |
| Reviser | ↻ | Publicly updates their position when given good reasons | Calibration + Consistency, with visible wave texture from earlier tiers resolving |

**Two archetypes have feature dependencies:**
- **Advocate** — the Advocate Engine is the feature that supports its growth. Magnanimity pillar is its primary data source.
- **Reviser** — defined by *change*, not static pattern. The Delta mechanic is the feature that enables it.

Pairing archetype + supporting feature is **deliberate**: a feature without an associated identity is forgotten; an identity without an associated feature is aspirational with no path.

#### Naming Principles

Three from the tier system, plus one unique:
1. Describe the pattern, not the person
2. Observe, don't evaluate (no archetype is ranked above another)
3. No tribal coding (no political/ideological mappings)
4. **Must name a cognitive move, not an outcome or identity** (rules out Oracle, Expert, Influencer, Moderate)

Test: *Can the classification engine detect this from comment text alone, without knowing who wrote it?* If no, doesn't belong.

#### The Aspirational Mechanic

Users declare aspirational archetypes; assigned archetype stays observation-derived. Platform surfaces the specific behaviors that produce the aspirational signature, tracks progress quietly. The split — assigned identity from observed pattern, aspirational identity from declared intent — is the philosophical core of the layer.

This is the **quiet rebuttal to social media's identity model:** identity asserted upfront and never tested vs. identity earned through the work, with the gap between current and aspirational treated as something the platform helps you close rather than hides.

#### Internal Inconsistencies & Tensions Surfaced

1. **OneDrive concept fingerprint uses old axis name `specificity`.** Line ~129 of `dialecta-fingerprint.jsx`: `data: { specificity: { graduations, purity }, ... }`. Spec v1.1 (line 36) renamed Specificity → Acuity. The concept artifact is one of the known stale variants flagged in the foundation state. (Active engine `dialecta-fingerprint-engine.jsx` per API CLAUDE.md uses canonical names — Phase B will verify.)

2. **Concept fingerprint duplicates design tokens, topics palette, tier icons.** The OneDrive prototype carries its own copies of all three. Concept-era duplication. Active build presumably refactored some of this — Phase B will determine which.

3. **Spec line 48 contains "steelman" as a verb:** *"A contributor with high Magnanimity does not strawman; they steelman."* This is a known retired-term scrub item. Same paragraph already says "they engage with the best version of what the other side actually believes" — the steelman line could be deleted or rewritten as "they advocate" without losing meaning.

4. **Pillar-score computation function is unspecified.** Spec line 154 says *"the Stage A analysis fields are the raw material from which pillar scores are computed"* — but the function is not defined anywhere. Project Index flags this as Harmonization Tension #2. **Phase 1 cannot ship the Fingerprint with real data until this is specified.** Currently illustrative in prototypes only.

5. **Reviser archetype depends on Delta mechanic which is deferred.** Spec line 107: *"The Delta mechanic is the feature that supports this archetype's growth."* Project Index Harmonization Tension #3 confirms Reviser cannot be earned until Delta ships. Delta is deferred per API CLAUDE.md. **Implication: for Phase 1, Reviser is structurally un-earnable.** Either ship without it, or ship a stub Delta to enable it, or change the archetype set for Phase 1.

6. **Archetype as verdict vs. Growth Layer's three-voice principle.** Project Index Harmonization Tension #1: archetype assignment is "verdict-like." Growth Layer Principle 6 requires engine observations to be signal, never verdict. The two postures must reconcile before either layer is built against real data. Likely resolution per Index: archetype becomes the *engine voice* inside the three-voice composition. Decision still pending.

7. **Five Open Questions in the spec are still open** (line 162):
   - Pillar score computation function (same as #4 above)
   - Threshold for archetype assignment (how much history is enough?)
   - Multiple archetypes — show one or both?
   - Practitioner archetype — held back from v1, possible revisit
   - Archetype evolution display — show change without feeling like demotion
   
   For Phase 1, each needs at minimum a default decision. Threshold and Multiple-archetypes are most urgent because they affect every profile rendering.

8. **Profile responsive wrapper concept appears to have shipped intact.** OneDrive `Profile Pages\dialecta-profile-responsive.jsx` matches the structural pattern of the active wrapper (1024px breakpoint based on geometry calculation, picks DesktopProfileBody vs MobileProfileBody, useEffect with matchMedia). Phase B will verify byte-level match — but this looks like a clean concept-to-build transfer.

9. **Three Profile-N.jpg mockups exist but are not referenced anywhere.** `Profile Pages\Profile-1.jpg / Profile-2.jpg / Profile-3.jpg` — design exploration mockups. Their relationship to the canonical design spec or any spec doc is undocumented. Likely concept-era visual references that no longer drive decisions, but should be confirmed before deletion.

#### Domain 2 Open Questions for User Confirmation

- **Reviser without Delta — resolution for Phase 1?** Three options: (a) ship the eight archetypes including Reviser as un-earnable (acceptable if rare), (b) ship a minimum-viable Delta (one mechanic enabling Reviser detection), (c) drop Reviser from Phase 1 archetype set (seven archetypes for launch).
- **Pillar-score computation function — write spec now or defer?** Phase 1 cannot render real Fingerprints without it. Either: write the spec now and add to Phase 1, or accept that Phase 1 ships with placeholder/illustrative Fingerprints only.
- **Default decisions for the five open questions in the spec.** Especially threshold for archetype assignment (how many comments before "pattern still forming" → assigned archetype?) and multiple-archetype display rule.

---

#### Domain 2 Answers (User-Confirmed 2026-04-26)

1. **Reviser archetype: BUILD DELTA.** Don't drop, don't ship un-earnable. *"What is preventing us from building the Delta engines? Can we engineer a way to include this in the build."* Delta moves from Phase 5 deferred → Phase 1 active. See **Delta Feasibility Assessment** below for the full reasoning.

2. **Pillar-score computation function: BUILD ASAP.** *"This is a great catch! So many moving parts, this got missed. We need to build this ASAP."* Added to the active Phase 1 build queue. Becomes a Phase D-priority deliverable. The function is the math from Stage A classification fields → per-pillar increments per comment, gating real-data Fingerprint rendering and all archetype detection (including Reviser).

3. **Five open questions in the Contributor Identity spec: WORK THROUGH WITH NO RUSH.** *"There is no rush. The best outcome is what we are after."* Will be revisited in Phase D (Recommendations) once the full conceptual picture is in. The five: pillar-score function (resolved by #2), threshold for archetype assignment, multiple archetype display, Practitioner archetype revisit, archetype evolution display.

---

### Delta Mechanic — Phase 1 Feasibility Assessment

*Out-of-order read 2026-04-26. Delta was originally scheduled for Domain 6 (Deferred/Future Concepts), but the user's maximalist Phase 1 directive made its feasibility a gating decision. Read now for unblocking.*

**Read for this assessment:**
- `Delta Mechanic\Dialecta_Delta_Mechanic_Spec.md` (v1.0, April 2026, 242 lines)
- `Delta Mechanic\Dialecta_Session_Handoff_OpinionMaps_Delta.md` (172 lines, prepared next-session brief)
- `Delta Mechanic\dialecta-delta-mechanic.html` (referenced; not opened — full six-stage UX prototype exists per spec line 236)

#### Decision: BUILD IN PHASE 1 (confirmed 2026-04-26)

Below is verified-buildable evidence. The risk and effort sections function as build planning reference, not decision points.

#### Verdict: BUILDABLE FOR PHASE 1

The Delta mechanic is fully spec'd, not vaguely sketched. The "deferral" in the API CLAUDE.md is a **scheduling artifact**, not a capability constraint. The original roadmap placed Delta in Phase 5 because the Opinion Maps + Delta shared-component session had not been run yet. The maximalist directive reverses that scheduling.

**What's already done:**
- Comprehensive specification with all six stages defined (A: Pre-read snapshot → B: Reading → C: Post-read snapshot → D: Calculation → E: Reveal → F: Public choice)
- HTML prototype demonstrating the full UX flow
- Session handoff brief outlining the exact React port plan: four components (`<PositionPlot>` primitive, `<TernaryPlot>` primitive, `<OpinionMap>` consumer, `<DeltaCapture>` consumer) with props/callback APIs already drafted
- Founding principles locked: *private by default, public by choice; reflect not evaluate; unchanged position is valid; not invasive*
- Reviser archetype detection logic specified (primary signal: 3+ Forum-tier DELTA ACKNOWLEDGED comments across 2+ articles)
- Copy standards locked (non-coercive, non-invasive, non-evaluative)
- Data model and privacy guards specified (community aggregate requires n≥20)

#### Recommended Phase 1 Scope

| Component | In Phase 1 | Defer to | Reason |
|---|---|---|---|
| Six-stage flow (A–F) | Yes | — | Spec is complete |
| Cartesian 2D pre/post snapshot | Yes | — | Standard launch tool |
| Ternary delta variant | — | Phase 2 | Spec open question 1: needs separate Ternary UX session |
| Desktop interaction | Yes | — | Phase 1 is desktop-first |
| Mobile interaction | — | Responsive Foundations | Spec open question 4 |
| DELTA ACKNOWLEDGED comment chip | Yes | — | Simple flag on `comments` table |
| Seeded-draft generation (local template) | Yes | — | Spec gives example seed; template-based is sufficient |
| Seeded-draft generation (Claude API) | — | v2 enhancement | Spec leaves this open; local template ships |
| Community aggregate (n≥20 privacy guard) | Yes | — | SQL aggregation, straightforward |
| Reviser detection — primary signal | Yes | — | 3 Forum-tier DELTA ACKNOWLEDGED across 2+ articles |
| Reviser detection — secondary signal | — | Classification Engine prompt update (Session 7) | Heuristic NLP detection of "I changed my view because…" |

#### Effort Estimate: ~2–3 weeks in three logical batches

**Batch 1 — Components.** Build the four React components per the session handoff brief. Most of the work is porting the existing HTML prototype. The shared `<PositionPlot>` primitive eliminates duplication between Opinion Maps and Delta. Delivery: 4 new JSX source files in `src/`.

**Batch 2 — Data layer.** Add Supabase tables: `opinion_map_positions` (per-reader, per-article, with timestamps, indexed for aggregate queries), and a `delta_acknowledged` boolean column on `comments`. Add API routes: `POST /api/position`, `GET /api/position/aggregate/:articleId`, update `POST /api/comment` to accept the delta flag. Wire Reviser detection into the pillar-score pipeline (depends on pillar-score function being spec'd — see Domain 2 Answer #2).

**Batch 3 — Integration + copy + QA.** Mount components into the Ghost article template (mount pattern matches the comment system). Execute the spec's copy standards verbatim — the pre-read prompt copy is the riskiest surface and the spec's exact wording must be preserved. QA the full flow on real articles. Verify privacy guards (no individual coordinates exposed).

#### Risk Profile for Phase 1

| Risk | Level | Notes |
|---|---|---|
| Technical | **LOW** | Spec is mature, prototype exists, components well-bounded |
| Schedule | **MEDIUM** | ~3 weeks of additional work vs a Delta-less Phase 1 |
| Conceptual | **LOW** | Principles in the spec constrain implementation cleanly |
| UX | **MEDIUM** | Pre-read snapshot is risky; if readers feel surveilled, mechanic gets ignored. Spec copy standards mitigate. |
| Launch-blocking | **LOW** | Delta is fully optional per spec — skipping it doesn't break anything else |

#### Implicit Scope Expansion This Triggers

Building Delta for Phase 1 pulls these adjacent items in or forward:

1. **Opinion Maps comes for free.** The shared-component architecture means Opinion Maps and Delta build together. Opinion Maps was scheduled for Phase 3 in the original roadmap. **Phase 1 silently expands to include Opinion Maps.**

2. **Pillar-score function is now a hard prerequisite for Phase 1.** Reviser detection runs through the pillar-score pipeline. The function must be spec'd and built before Reviser can work — which is required for the eight-archetype system to be complete at launch.

3. **Classification Engine prompt update (Session 7).** The Reviser secondary signal ("I changed my view because…") needs prompt-engineering. Could be in Phase 1 (small task) or Phase 1.5.

4. **Supabase schema additions.** New tables to design — must be coordinated with Domain 4 (Data & Architecture) audit findings.

#### Phase 1 Build Queue — Forming List

As deferred concepts get re-evaluated, this list grows. Confirmed Phase 1 additions so far:

- [x] **Stewards / Governance cluster** (per Domain 1 Answer #1)
- [x] **Delta Mechanic** (this assessment)
- [x] **Opinion Maps** (implicit — comes with Delta via shared components)
- [x] **Pillar-score computation function** (per Domain 2 Answer #2)
- [x] **Reviser archetype** (enabled by Delta)
- [ ] *(More to be evaluated as remaining domains complete)*

---

*Domain 2 captured + answers locked + Delta feasibility assessed.*

---

### Domain 3: Discourse & Classification

**Read in this domain:**
- `Dialecta_Classification_Engine_Specification.md` (root, v1.0, April 2026, 240 lines)
- `Fundamentals\Dialecta_Social_UX_Architecture.md` (v1.0, April 2026, 147 lines)
- `dialecta-pact.html` (root, 248KB) — not opened; prototype-level intent already captured by Project Brief + Project Index references. Will be Phase B reality material.

#### The Operational Loop

Domain 3 is where the platform's source thesis becomes operational. Comment submission triggers classification; classification produces structured data that feeds the Contributor Identity layer; community reclassification creates the third voice. Around this loop sits the Pact contract (the cultural commitment) and the social architecture (feed, identity events, viral mechanics) that makes the loop feel alive rather than mechanical.

#### The Claim Threshold (Classification Engine v1.0)

A **claim** = a falsifiable or arguable proposition specific enough for another person to engage on substance.

A claim is **not**: feeling expression, evaluative label without content, tribal allegiance signal, restatement of article or prior comment.

A claim **is**: specific disagreement, alternative framing, empirical challenge, conceptual extension.

**Specificity spectrum (0–3):**

| Level | Name | Description |
|---|---|---|
| 0 | No claim | Pure feeling, label, or tribal signal |
| 1 | Vague claim | Assertion exists but too general |
| 2 | Specific claim | Identifiable proposition; direct agreement/disagreement possible |
| 3 | Developed claim | Specific proposition with supporting reasoning, evidence, or named counter-argument |

**Tier-by-claim-level mapping:** Forum requires Level 2+ (3 preferred). Spark = Level 1–2 underdeveloped. Echo = Level 0–1 restating. Fog = Level 0 unclear. Heat = Level 0–1 high emotion. Stance = any level, tribal-dominant. Breach = N/A (personal attack).

**Critical edge case:** A passionate Forum comment is allowed. Emotional register is never the disqualifier. Absence of a claimable proposition is.

#### The AI Prompt Architecture

**Design principle:** Reason before classifying. Single-pass classification produces inconsistent, opaque outputs. The reasoning step also generates the commenter message — the platform's primary behavior-change mechanism.

**Two-stage reasoning in one API call:**

- **Stage A — Analysis.** Extract structured observations: claim, specificity (0–3), emotional register (Low/Med/High), tribal markers (yes/no with example), article engagement (specific/general), opposing view engaged (yes/no/partially).
- **Stage B — Classification.** Assign tier, write commenter message (1–2 sentences, non-lecturing), flag borderline cases.

**Output format strict:** CLAIM / SPECIFICITY / EMOTION / TRIBAL MARKERS / ARTICLE ENGAGEMENT / OPPOSING VIEW ENGAGED / TIER / BORDERLINE / COMMENTER MESSAGE.

**Article key claims required as engine input.** The engine can't tell a "vague comment" from "vague comment given that the article made three highly specific claims it could have addressed." This downstream-implies authors submit 3–5 key claims at publication.

#### The Hardest Tier Boundaries (worth dedicated test sets)

- **Forum vs Heat:** discriminator is whether emotion is attached to specific arguable proposition
- **Stance vs Heat:** discriminator is primary function — expressing feeling (Heat) vs signaling group membership (Stance)
- **Spark vs Echo:** discriminator is whether comment adds something new
- **Fog vs Echo:** discriminator is clarity (Echo clear-but-unoriginal; Fog unclear)

#### Self-Declaration Contrast (System Integration)

When a commenter overrides the AI suggestion with their own self-declared tier, BOTH are stored and displayed. Contrast between AI-suggested and self-declared, and between either of those and community reclassification, is meaningful signal — about the comment AND about the commenter's calibration over time. This is foundational data for the Calibration pillar.

#### The Foundational Choice: Make Friction Feel Social (Social UX)

Three options were considered for holding the social-vs-quality tension:
1. Separate the surfaces (fast feed, friction-bound comments)
2. Make the friction itself feel social (community speaking, not gate blocking)
3. Lightweight parallel reactions channel

**Chosen: Option 2, with Option 3 as Phase 3 complement.** Reason: only Option 2 is consistent with the foundational thesis. Gate communicates distrust; community communicates that people here care enough to push back. Two completely different social contracts.

#### Feed Architecture

Four content types, none of them traditional algorithmic timelines:

1. **Articles (Hot + Relevant)** — hot weighted by *Forum-tier* engagement, not raw volume. Architectural decision encoding values into the surface.
2. **Thread Spotlights** — single highlighted exchange (2–3 Forum-tier comments, position refined or counterargument acknowledged). The platform's primary viral unit.
3. **Identity Events** — Dialecta's genuinely novel category. Archetype shifts, Sparring Partner recognition, first Forum comment, Fingerprint milestones, aspiration declarations, recommitments.
4. **Opinion Map Topology Changes** — when aggregate community position shifts meaningfully, surface as news.

#### Why Dialecta Identity Is Different

Identity-being-built taxonomy:
- **Instagram identity:** aesthetic, fully curatable
- **LinkedIn identity:** credential-based, claimed
- **Twitter identity:** performative, 280-character wit
- **Dialecta identity:** **demonstrated** — Fingerprint and archetype generated entirely from observed behavior

This makes identity resistant to gaming in a way follower counts and endorsements never are. "Addictive in a good way" is achievable because the engagement loop is making the user better at thinking, not worse.

#### Viral Mechanics

- **The shareable debate clip** — Forum-badged exchange, image/embed, makes quality legible to outsiders
- **The Fingerprint reveal** — interesting shape ("depth-diver with underdeveloped Charity") = self-discovery share
- **The archetype story** — organic shift narrative
- **The reclassification moment** — beginning/middle/end story unique to this platform

#### Three Active Balance Risks

1. **Volume Before Critical Mass.** Feed needs population. Don't surface as primary until Phase 4 mass exists.
2. **Pressure to Lower Quality Thresholds.** Tier thresholds and prompt architecture must be near-constitutional. Growth Frame is the primary mitigation.
3. **Recognition vs Surveillance.** Surface milestones and shifts; never activity volume.

#### Theory of Change

**Make demonstrated quality the primary social currency.** Every prior platform failed because reward mechanics weren't aligned with quality (upvotes → popularity, follows → fame, engagement algorithms → virality). The Fingerprint, tiers, and archetype system are the serious attempt to align them. Test for any design decision: *does this make thinking well feel more rewarding, or does it quietly create a shortcut around it?*

#### Internal Inconsistencies & Tensions Surfaced

Domain 3 has the most staleness of any domain so far. The vision is intact; the documents that codify it have drifted significantly.

1. **🚨 Classification Engine Spec uses OLD TIER NAMES.** Line 60: `⚡ **Static** | Any level, tribal framing dominant`. Line 61: `🚫 **Off the Air** | N/A — personal attack`. Canonical names are **Stance** and **Breach** (per Project Brief, Founding Philosophy, Pact HTML, API CLAUDE.md). The Classification Engine Spec — the OPERATIONAL BACKBONE document — is stale on tier names. This is exactly the same class of issue as the `profile-bootstrap.jsx` drift discovered in environment setup: the most-load-bearing document quietly out of date.

2. **🚨 Pact HTML is more current than the Classification Spec.** Per Project Index, Pact uses Stance/Breach (canonical). The spec MD does not. This means the prototype is leading and the spec is trailing — inverse of healthy documentation flow.

3. **Classification Engine Spec uses old field name "SPECIFICITY"** in Stage A (line 84, 128, 149, 214). Acceptable because field names are functional internal labels not user-facing — but creates mapping work when computing pillar scores (field name "SPECIFICITY" → pillar "Acuity"). Should be reconciled when the pillar-score function is spec'd.

4. **🚨 Social UX uses OLD AXIS NAMES throughout.** Line 56: `David's Magnanimity pillar` ✓ (correct here) — but line 72: `high Charity and high Calibration` (Charity = old) — and line 84: `very high Specificity but low Range` (Specificity = old, Range = old). Mixed usage suggests partial scrub. Same paragraph uses both old and new naming.

5. **🚨 Social UX references "Challenger" archetype (line 53):** *"Maria has shifted from Synthesizer toward Challenger."* **Challenger does not exist in the canonical eight-archetype set** (Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator, Reviser). Either Challenger is a retired early name or an example error. Likely retired — possibly an early version of what became Skeptic or Advocate.

6. **Social UX uses "steelman" (line 43):** *"a steelman was offered and accepted."* Steelman scrub item.

7. **Social UX phase plan stale.** Line 120 places Delta in Phase 5; per Domain 2 / Delta Feasibility, Delta is now Phase 1. Line 119 places Feed as primary in Phase 4; user's maximalist directive may pull this forward (Feed deferral re-eval needed).

8. **Social UX Phase 1 mapping conflicts with user's Phase 1 definition.** Line 116: Phase 1 = "Blog with a strong profile page; defer Pact onboarding." But the user's Phase 1 (Domain 1 Answer #2 implications + Project Brief description) includes Pact. So Social UX phase table needs reconciliation with user's compressed phase model.

9. **Sparring Partner / Correspondent are undefined elsewhere.** Line 53 introduces these as relationship/role concepts but no spec defines them. Are they roles users earn? Algorithm-detected relationships? Worth specifying or removing.

10. **Classification Engine Spec mentions Roadmap Phase 5** for fine-tuned model (line 217) — consistent with Project Brief but worth flagging for the Project Brief v2 update.

#### Domain 3 Open Questions for User Confirmation

- **Classification Engine Spec stale-tier-names update.** Spec needs Stance + Breach replacement, plus the prompt template inside (line 117-119) needs the same update. Any other text changes desired in the spec at the same time, or just the minimum tier-name correction?
- **Social UX axis-name + archetype-name + steelman scrub.** Same surgical-update style as the spec? My recommendation: yes, surgical scrub now (since we're updating the doc anyway), and add to the Project Brief v2 work.
- **"Challenger" archetype provenance.** Confirm: retired early name (delete and replace with canonical archetype in the example), or genuinely intended (add to archetype spec)?
- **"Sparring Partner" / "Correspondent" — define or remove?** If they're real platform features, they need spec coverage in Contributor Identity or Social UX. If they're just narrative flourish, replace with concrete examples.
- **Feed in Phase 1?** Per maximalist directive and the Social UX architectural argument that *"if the platform intends to be a social platform by Phase 4, there is a strong argument for building the feed stub as early as Phase 2"* — should Feed (or Feed Stub) be re-evaluated for Phase 1 inclusion the way Delta was?

---

#### Domain 3 Answers + Surgical Updates Completed (2026-04-26)

**Updates executed in-place during this audit pass** (user-greenlit "if not too much trouble, just knock it out"):

1. **`Dialecta_Classification_Engine_Specification.md`** — `Static` → `Stance` (5 occurrences across tier table, prompt template, hardest-boundaries section, body discussion). `Off the Air` → `Breach` (2 occurrences in tier table + prompt template). The operational backbone document is now synchronized with the canonical tier names. Prompt template ready to use as-is.

2. **`Fundamentals\Dialecta_Social_UX_Architecture.md`** — `Charity` → `Magnanimity` (2 occurrences). `very high Specificity but low Range` → `very high Acuity but low Reach` (1 occurrence, inside the Fingerprint reveal example). Steelman line replaced: `"a steelman was offered and accepted"` → `"the opposing case was articulated faithfully and engaged with"` (preserves the Magnanimity-virtue meaning without retired jargon).

**Pending — Challenger archetype (Q3 — full picture):**

Grep across all OneDrive Dialecta returned **exactly one reference**: `Social_UX_Architecture.md` line 53 — *"Maria has shifted from Synthesizer toward Challenger across her last 20 comments."* No spec defines Challenger. No other document references it. The naming-principles section of Contributor Identity v1.1 explicitly enumerates the eight canonical archetypes (Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator, Reviser) and lists rejected concepts (Oracle, Expert, Influencer, Moderate) — Challenger is not on either list.

**Recommendation:** Stale early naming, never tracked in any cleanup item. Replace with a canonical archetype in the example. Best fit based on the example's narrative shape ("shifted from Synthesizer toward X"): **Skeptic** — opposite epistemic move from Synthesizer (synthesize/connect → question/separate-premises), which makes the shift narratively meaningful. Second-best: **Advocate** (shift from finding-connections to making-opposing-cases). Awaiting user confirmation before swapping.

**Pending — Sparring Partner / Correspondent (Q4 — relationship types):**

User confirmed there are **four relationship types** and they are essential to the platform. None are spec'd anywhere in OneDrive Dialecta. The two named in Social UX (Sparring Partner, Correspondent) are referenced as if they are platform-level concepts but never defined. **User is providing the four names + brief descriptions — pending input. The relationship-types model becomes a new spec doc, likely a sibling to Contributor Identity, since relationships are the dyadic / interactive layer above individual identity.**

**Pending — Feed in Phase 1 (Q5):**

User confirmed Feed is **already being built as part of the profile page** — the Identity Events stream lives there. Phase 1 includes Articles + comments at minimum. Full sitewide Feed surface (per Social UX architecture) likely deferred to later phase pending complexity assessment. **Phase B (reality capture) will determine current Feed scope by reading the active code.** For audit purposes: profile-page Identity Events confirmed as Phase 1; sitewide Feed surface scope TBD.

---

#### Domain 3 — All Open Items Resolved (2026-04-26)

**Challenger → Skeptic swap completed.** Social UX line 53: *"Maria has shifted from Synthesizer toward Skeptic across her last 20 comments."* Confirmed by user as remnant of an early construct. No reference to Challenger anywhere in OneDrive Dialecta now.

**Devil's Advocate question resolved.** User confirmed: *"Magnanimity was where we landed with this."* The Advocate archetype (⚖, fully expressed Magnanimity pillar) covers the steelman / devil's-advocate cognitive move. No new archetype needed. The naming evolution (Steelman → Advocate) was deliberate; reintroducing Challenger would have been a regression toward more combative framing the platform has intentionally moved away from.

**Relationship Types spec drafted and committed.** New canonical doc at `Fundamentals\Dialecta_Relationship_Types.md` (~140 lines). Captures the four types per user definition:

| Type | Direction | Mechanism | Visibility |
|---|---|---|---|
| **Readers** | Asymmetric in | Direct follow | Public both sides |
| **Sources** | Asymmetric out | Direct follow | Public both sides |
| **Correspondents** | Symmetric | Mutual follow (derived) | Public both sides |
| **Sparring Partners** | Engagement-derived | 5+ articles with mutual reply chains | Public both sides; per-relationship opt-out |

Visibility is public by default per user direction (*"Visibility. Engagement is a core tenant of this platform."*). One designed-in concession to dignity: Sparring Partner has a per-relationship opt-out so a contributor uncomfortable with a specific pairing can suppress the public chip without erasing the underlying engagement data. Asymmetric follows do not get opt-out — transparency is constitutional.

Includes: detection rules, visibility & consent model, feed Identity Events surfacing, data model (`follows` table + `sparring_partners` materialized view), and 5 open questions (threshold tuning, naming-vs-count on public chip, decay rule, Correspondent + Sparring Partner overlap, reciprocity of opt-out).

**Forward references added in Social UX Architecture** at the Identity Events section intro and in the Companion documents footer.

**Feed in Phase 1 — confirmed direction.** Profile-page Identity Events stream is being built (already in progress per user). Sitewide Feed surface complexity ceiling for Phase 1 is open — will be assessed in Phase B (reality capture) when active code is read.

#### Phase 1 Build Queue — Updated

Confirmed Phase 1 additions after Domain 3:

- [x] **Stewards / Governance cluster** (Domain 1)
- [x] **Delta Mechanic + Opinion Maps** (Domain 2 / Delta Feasibility)
- [x] **Pillar-score computation function** (Domain 2)
- [x] **Reviser archetype** (enabled by Delta)
- [x] **Relationship Types layer** (new — Domain 3) — `follows` table, `sparring_partners` materialized view, follow/unfollow API routes, Sparring Partner detection job, profile UI for the four types
- [x] **Profile-page Identity Events stream** (Feed Stub)
- [ ] *(More to be evaluated as remaining domains complete)*

#### Tier 2 Items Resolved Through Domain 3

- ✅ Steelman scrub: Classification Engine Spec, Social UX Architecture (this domain). Five OneDrive specs still need scrubbing — slated for Phase D execution batch.
- ✅ Stale tier names (Static, Off the Air): Classification Engine Spec done.
- ✅ Stale axis names (Charity, Specificity, Range): Social UX done.
- ✅ Challenger archetype: removed.

---

*Domain 3 fully closed.*

---

#### Domain 4 Pre-Read Note (2026-04-26)

User added a new operational doc to the Fundamentals tree: `Dialecta_Supabase_Scaling.md` (v1.0, April 2026, 226 lines). Confirmed in scope for Domain 4. Initial pass shows it as the operational companion to `Dialecta_Data_Architecture.md` — addresses *how* the data layer behaves under load, where the schema doc addresses *what* the data is.

Domain 4 read inventory (locked):
- `Fundamentals\Dialecta_Data_Architecture.md` — canonical schema, 9 entities, compute pipelines
- `Fundamentals\Dialecta_Supabase_Scaling.md` — operational/scaling reference (NEW)
- `Fundamentals\dialecta-design-spec.html` — Visual Language canonical (size unknown — may need section grep)
- `Fundamentals\dialecta-system-reference.html` — architectural overview (size unknown)
- `Data Handling\dialecta_data_architecture.svg` — schema diagram (visual reference)

The Supabase Scaling doc's pre-launch checklist (5 items) and monitoring checklist (5 items) will likely add ~10 entries to the Phase 1 build queue. Will be cross-checked against Data Architecture's canonical schema during Domain 4 synthesis.

---

### Domain 4: Data & Architecture

**Read in this domain:**
- `Fundamentals\Dialecta_Data_Architecture.md` (v1.0, April 2026, 314 lines)
- `Fundamentals\Dialecta_Supabase_Scaling.md` (v1.0, April 2026, 226 lines)
- `Fundamentals\dialecta-system-reference.html` (v1.1, April 2026, 1276 lines — comprehensive single-page visual summary)
- `Fundamentals\dialecta-design-spec.html` (v1.3 confirmed — 13 sections grep'd: Color Tokens, Typography, Tier Badges, Tier Icons, Comment Cards, Buttons, Form Elements, Navigation, Page Background, Article Header, AI Classification Card, Editorial Surfaces, Component Library. Full read deferred to Phase B for line-level visual audit.)
- `Data Handling\dialecta_data_architecture.svg` (visual schema diagram — not opened, supplementary visual reference)

#### The Three-Layer Architecture (Actually Four)

The data flow has four named layers. Spec calls it "three-layer" but enumerates four — minor naming inconsistency worth flagging.

1. **Inputs** — events that trigger pipeline activity (comment posted, vote cast, aspiration declared, recommitment made). Carry structured payloads. Do not write directly.
2. **Compute** — stateless serverless/edge functions that respond to events. Call Anthropic API, perform calculations, write to Store. Read context from Store; do not hold state between calls.
3. **Store** — Supabase / PostgreSQL. The only source of truth. Compute writes; Render reads.
4. **Render** — React components that read from Store and output UI. Have no memory between renders. Whatever they receive, they draw.

**Critical constraint:** the Fingerprint renderer is a Render-layer component. It draws SVG from passed values. All computation that produces those values happens upstream and is persisted in Store before render runs.

#### The Nine Core Data Entities

| # | Entity | Purpose | Key fields |
|---|---|---|---|
| 1 | `comments` | Raw comment record | author_id (Ghost member), article_id (Ghost post), body, status (draft/pending_review/published/suppressed) |
| 2 | `classifications` | One per comment. Stage A + B output | claim_text, specificity (0–3), emotion, tribal_markers, article_engagement, opposing_view_engaged, ai_suggested_tier, self_declared_tier, final_tier, borderline_flag, commenter_message |
| 3 | `axis_events` | **Immutable append-only ledger.** One per comment per axis touched | contributor_id, axis enum (acuity / reach / calibration / magnanimity / discourse / consistency), delta, tier_at_contribution |
| 4 | `axis_scores` | Materialized current state. 6 records per contributor. Recomputed from ledger replay | graduation_count, tier_mix (jsonb) |
| 5 | `fp_snapshots` | Point-in-time fingerprint captures | snapshot_at, reason (aspiration_declaration / recommitment / archetype_shift / milestone / manual), axis_scores (jsonb full copy) |
| 6 | `archetypes` | Current archetype + history | assigned_archetype enum (8 + "forming"), axis_pattern (jsonb), confidence (0–1), history (jsonb array) |
| 7 | `aspirations` | User-authored growth record. Verbatim storage required | statement, reason, target_archetype, axis_commitments, declaration_snapshot_id, expires_at (declared_at + 90 days), visibility, research_consent |
| 8 | `feed_events` | Typed event records with **precomputed display payloads** for join-free render | event_type, primary/secondary contributor IDs, reference_id, display_payload (jsonb), visibility |
| 9 | `comment_votes` | Community voting (child of comments) | comment_id, voter_id, vote_type (upvote / downvote / nominate_up / nominate_down) |

A child table also exists for `recommitments` (child of `aspirations`).

#### The Compute Pipelines (Four)

1. **Classification Pipeline** — synchronous. Receives comment + article claims, calls Anthropic API, writes classification record, returns suggestion to UI, accepts user accept/override, sets final_tier, triggers Axis Score Updater. *The only synchronous Anthropic call in the standard flow.*

2. **Axis Score Updater** — async. On classification resolution, computes axis deltas, appends to ledger, recomputes axis_scores by replaying ledger, hands off to Archetype Monitor.

3. **Archetype Monitor** — runs at end of every Axis Score Updater. Checks updated pattern against 8 archetype signatures. Updates archetypes record + writes feed_events on archetype shift or milestone crossings. Checks recommitment trigger conditions.

4. **Growth Engine** — fires on aspiration declaration or recommitment. Takes fp_snapshot, maps axis_commitments to coaching priority list, writes feed_events if visibility=public, flags research consent if not yet asked.

#### Operational & Scaling Layer (Supabase Scaling v1.0)

The architecture is sound; the risk is operational hygiene. The doc identifies failure modes in order:

1. **Connection saturation first** — Vercel functions fan out faster than direct pool allows. Fix: Supavisor transaction pooler.
2. **`axis_scores` recompute latency** — replaying ledger on every comment for power users (1000+ comments) is O(n). Recommended fix: incremental update with nightly reconcile.
3. **Feed reads under article virality** — 500-comment article × 5000 readers. Fix: `article_feed_cache` materialized view keyed by `(article_id, final_tier)`, refresh from async pipeline.
4. **Compute tier ceiling** — Micro instance is shared CPU + ~1 GB RAM; replay pattern is RAM-sensitive. Fix: upgrade to Small before launch.

**Pre-launch checklist** (5 items): pooler enabled, all SQL indexes in place, compute upgraded Micro→Small, axis_scores strategy implemented, article_feed_cache view created with refresh trigger.

**Monitoring checklist** (5 items): p95 query time weekly, connection count alert at 80%, DB size growth monthly, Vercel function p95 per route, Anthropic rate limit headroom logged.

**Required indexes** (8 specified with SQL): axis_events(contributor, axis, time), axis_scores(contributor), fp_snapshots(contributor, time DESC), archetypes(contributor), classifications(comment), comments(article, status, published_at DESC) WHERE published, feed_events(contributor, time DESC), comment_votes(comment, vote_type).

#### Visual Language Layer (Design Spec v1.3 + System Reference v1.1)

**Design Spec v1.3** — 13 sections covering all visual primitives: Color Tokens, Typography, Tier Badges, Tier Icons, Comment Cards, Buttons, Form Elements, Navigation, Page Background, Article Header, AI Classification Card, Editorial Surfaces, Component Library. Confirmed canonical (Section 12 Component Library present per grep). Will be the line-level visual reference in Phase B.

**System Reference v1.1** — comprehensive single-page summary of the whole system: flow diagram (Comment → Stage A → Stage B → Self-Declaration/Vote → Axis Update → Fingerprint → Archetype → Growth Engine), Stage A field cards, claim spectrum, tier zones (Aspiration / Description / Boundary), seven tier cards with criteria, hardest-boundary table, six pillars with trade-offs, eight archetypes grouped (3 epistemic / 3 constructive / 1 magnanimous / 1 temporal), Growth Engine inputs table. **High-value onboarding artifact** — any drift here corrupts shared understanding fastest.

#### Ghost CMS Integration (Phase 1 Boundary)

- **Ghost owns:** articles, member auth, subscriptions, email delivery
- **Dialecta owns:** comments, classifications, axis_events, axis_scores, fp_snapshots, archetypes, aspirations, feed_events
- **Integration:** article key claims as Ghost custom field; Ghost member IDs used as author_id (no duplication); comment submission bypasses Ghost (calls Dialecta API directly)
- **Phase 2 statement (Data Architecture line 299):** "In Phase 2 (Next.js + Supabase), Ghost is replaced as the article layer. The Dialecta data layer requires no migration." **This Phase 2 framing is now stale** — Next.js explicitly deferred per current direction.

#### Internal Inconsistencies & Tensions Surfaced

Domain 4 has the most schema-relevant findings. Several gaps are direct consequences of decisions made later in this audit (Relationship Types, Delta in Phase 1).

**Schema Gaps (newly surfaced by Phase 1 maximalist directive):**

1. **Relationship Types entities are NOT in the canonical 9.** The Relationship Types spec we drafted in Domain 3 introduces `follows` (table) and `sparring_partners` (materialized view). Data Architecture v1.0 predates this. Schema needs to grow to 11 entities.

2. **Delta Mechanic entities are NOT in the canonical 9.** The Delta spec requires `opinion_map_positions` table (per-reader, per-article, with timestamps) and a `delta_acknowledged` flag column on `comments`. Schema additions needed.

3. **`feed_events.event_type` enum is incomplete for the new layers.** Current 7 types: archetype_shift / fingerprint_milestone / sparring_partner_recognized / aspiration_declared / recommitment / first_forum_comment / forum_thread_spotlight. Missing per Relationship Types spec: `new_reader`, `correspondent_established`, `sparring_partner_archetype_shift`, `source_milestone`. Missing per Delta spec: arguably `delta_acknowledged_published` (when a contributor posts an Option A comment from the Delta flow). Need enum expansion.

**Open Questions in Data Architecture (line 305) — status check:**

| Open Question | Current Status |
|---|---|
| Axis delta computation function | ⚠️ Critical for Phase 1 — user greenlit as ASAP work in Domain 2. Becomes the pillar-score computation function. Needs spec'ing. |
| Archetype confidence threshold | Still open. Same as Contributor Identity spec open Q. |
| Recommitment fingerprint delta threshold | Still open. Needs calibration against real data. |
| Practice Layer exercise storage | Still open. Practice Layer is in deferred-deferred zone. |
| Sparring Partner detection logic | ✅ Resolved by Relationship Types spec (5+ articles with mutual reply chains, nightly compute). Cross-reference back from Data Architecture. |

**Stalenesses found in Domain 4 docs:**

4. **System Reference HTML line 786:** *"Feeds the Charity axis. The Advocate archetype requires consistent 'Yes' here."* Uses the old axis name **Charity** (canonical: Magnanimity). System Reference v1.1 needs the same scrub we did on Social UX.

5. **System Reference HTML line 1196:** Reviser archetype shows *"Delta mechanic — Phase 5"*. With the maximalist directive, Delta is now Phase 1. Should read "Delta mechanic" or "Delta mechanic — Phase 1".

6. **Data Architecture line 299** stale Phase 2 Next.js framing (same as the Project Brief drift).

7. **Supabase Scaling line 43:** uses `SUPABASE_SERVICE_KEY`. Canonical: `SUPABASE_SERVICE_ROLE_KEY`. Same scrub item we hit in workflow-reference.

8. **Supabase Scaling line 203:** Phase 4 Next.js migration "already planned." Stale framing.

9. **Three-layer naming inconsistency.** Data Architecture line 17 says "three-layer architecture" but enumerates four (Inputs / Compute / Store / Render). Minor — could rename to "four-layer" or accept "three-layer" as referring to data layers (Inputs / Compute / Store) with Render as a separate concern.

10. **"comments (community voting)" entity #9 labeling.** The actual table is `comment_votes` (a child of comments). The numbered entity title is misleading — it reads as if entity #9 is "comments" rather than `comment_votes`. Worth a clean labeling pass.

11. **System Reference v1.1 introduces an archetype categorization not in the spec:** "Three epistemic, three constructive, one magnanimous, one temporal." Useful taxonomy. Worth either promoting into the Contributor Identity spec or removing from System Reference for consistency.

12. **No version history block on either HTML.** System Reference is labeled v1.1; Design Spec is v1.3. Neither has a changelog or what-changed-from-prior-version note. Minor — but the audit noticed.

13. **Project Index v0.7 Cleanup item 1 may be outdated.** It states design-spec.html v1.3 "needs to land in project files." OneDrive copy includes Section 12 Component Library — that's the v1.3 marker. So OneDrive *has* v1.3. Cleanup item 1 may have referred to the Claude.ai project file copy, which might still be missing.

#### Phase 1 Build Queue — Updated After Domain 4

| Category | Item | Source |
|---|---|---|
| Pillar layer | Pillar-score computation function spec + implementation | Domain 2 / D4 Open Q |
| Schema | `follows` table + `sparring_partners` materialized view | Relationship Types spec |
| Schema | `opinion_map_positions` table + `delta_acknowledged` column on comments | Delta spec |
| Schema | `feed_events.event_type` enum expansion (4–5 new types) | Relationship Types + Delta |
| Schema | `recommitments` child table of aspirations (already in spec; verify built) | Data Architecture |
| Operational | Supavisor transaction pooler config | Supabase Scaling |
| Operational | All 8 SQL indexes deployed | Supabase Scaling |
| Operational | Compute tier upgrade Micro → Small | Supabase Scaling |
| Operational | `axis_scores` incremental + nightly reconcile | Supabase Scaling (recommendation A) |
| Operational | `article_feed_cache` materialized view + async refresh wiring | Supabase Scaling |
| Monitoring | p95 query / connection / size / function duration / API headroom dashboards | Supabase Scaling |
| Doc updates | System Reference Charity → Magnanimity (line 786), Delta Phase 5 → Phase 1 (line 1196) | This domain |
| Doc updates | Data Architecture: add Relationship Types entities + Delta entities to canonical schema; remove stale Phase 2 framing | This domain |
| Doc updates | Supabase Scaling: SUPABASE_SERVICE_KEY → SUPABASE_SERVICE_ROLE_KEY; remove stale Phase 4 framing | This domain |
| Stewards | (carry forward from Domain 1) | Domain 1 |
| Delta + Opinion Maps | (carry forward from Domain 2) | Domain 2 |
| Reviser archetype | (enabled by Delta) | Domain 2 |
| Profile-page Identity Events stream | (carry forward from Domain 3) | Domain 3 |

#### Domain 4 Open Questions for User Confirmation

1. **Surgical updates in this pass — same logic as Domain 3?** The Domain 4 doc-update items are small mechanical fixes:
   - System Reference: Charity → Magnanimity (1 line); Delta Phase 5 → Phase 1 (1 line)
   - Supabase Scaling: SUPABASE_SERVICE_KEY → SUPABASE_SERVICE_ROLE_KEY (1 line); remove "already planned" Phase 4 framing (1 paragraph)
   - Data Architecture: remove Phase 2 Next.js framing (1 paragraph)
   - Cross-reference Sparring Partner detection from Data Architecture open Q to Relationship Types spec (resolved)
   - Add a "(see `Dialecta_Relationship_Types.md` and the Delta Mechanic spec)" forward note at the Open Questions section
   
   *Recommendation: yes, knock out now. Same surgical style.*

2. **Schema additions — write spec updates now or defer to Phase D?** The actual schema additions (Relationship Types entities, Delta entities, feed_events enum expansion) are larger — they extend the canonical 9-entity table. Two options:
   - **(a)** Update Data Architecture v1.0 → v1.1 now in this pass, adding the new entities with full field tables in the same style as the existing 9
   - **(b)** Defer to Phase D, where the Phase 1 build queue execution will create the tables and we update the doc retroactively
   
   *Recommendation: (a) — update Data Architecture to v1.1 now. The schema is the gating reference for the Phase 1 build queue execution. Having v1.1 as the authority means downstream build sessions don't need to remember "Data Architecture says 9 but actually 11+."*

3. **Three-layer vs four-layer naming.** Worth fixing to "four-layer" in Data Architecture, or accept "three-layer + Render" as the established framing? *Low priority — your call.*

4. **System Reference's archetype categorization** ("3 epistemic / 3 constructive / 1 magnanimous / 1 temporal") — promote into Contributor Identity spec or remove from System Reference? *Mild recommendation: promote — it's a useful taxonomy and the Contributor Identity spec is the right home.*

5. **Practice Layer storage spec** — Practice Layer is deferred-deferred but the open Q has been open since Data Architecture v1.0. Defer further or write a stub spec? *Recommendation: defer. Practice Layer is genuinely Phase 4+ and writing the storage spec now would be premature without the UX spec.*

---

#### Domain 4 Answers + Updates Executed (2026-04-26)

**All five questions resolved + 13 surgical edits landed.**

1. **Surgical doc updates: DONE.**
   - `dialecta-system-reference.html`: `Charity` → `Magnanimity` (line 786 Stage A field 6 description); `Delta mechanic — Phase 5` → `Delta mechanic — Phase 1` (line 1196 Reviser archetype card)
   - `Dialecta_Supabase_Scaling.md`: `SUPABASE_SERVICE_KEY` → `SUPABASE_SERVICE_ROLE_KEY` (line 43); Phase 4 trigger framing reframed from "Already planned" to "Currently deferred per platform direction"
   - `Dialecta_Data_Architecture.md`: stale Phase 2 Next.js bullet reframed to "currently deferred"

2. **Data Architecture v1.0 → v1.1: DONE.** Schema additions executed in-place:
   - **Three new entities added** (10, 11, 12): `follows`, `sparring_partners` (materialized view), `opinion_map_positions`
   - **`comments` table** got new column: `delta_acknowledged` (boolean)
   - **`feed_events.event_type` enum** expanded from 7 → 12 values: added `sparring_partner_archetype_shift`, `new_reader`, `correspondent_established`, `source_milestone`, `delta_acknowledged_published`
   - **Open Questions section** updated: Sparring Partner detection ✅ resolved (cross-references Relationship Types spec), Axis delta computation reframed as the Pillar-Score Computation Function (Phase 1 build queue), Practice Layer storage retained with explicit Phase 4+ deferral rationale
   - **Companion documents** footer now lists all 6 sibling specs (Contributor Identity, Growth Layer Principles, Classification Engine, Relationship Types, Delta Mechanic, Supabase Scaling)
   - **v1.1 changelog** appended to footer noting all changes
   - Schema is now the canonical 12-entity reference for Phase 1 build queue execution.

3. **Three-layer → four-layer naming: DONE.** Section header and body sentence updated.

4. **Archetype taxonomy summary line promoted into Contributor Identity spec: DONE.** Added at the top of the "Why These Eight" section: *"The eight resolve into a clean taxonomy: three epistemic stances, three constructive moves, one magnanimous engagement archetype, one temporal change archetype."* The expanded prose categorization that follows is unchanged. System Reference and Contributor Identity now share the taxonomy.

5. **Practice Layer: CONFIRMED DEFERRED to Phase 4+.** Reasoning captured: no standalone spec exists (unlike Delta), supporting layers must be live first (aspirations, pillar-score data, Snapshot Curation Algorithm, real engagement data), and Practice Layer carries the highest UX risk of any growth feature (active platform-to-user prompts; bad prompt damages trust in the entire Growth Layer). The deferral is a quality call, not a schedule call. Six months of real aspiration data and fingerprint movement become the substrate that lets the Practice Layer be spec'd well. Treating it as Phase 2+ is the rare instance where waiting produces a better feature, not a delayed one.

#### Tier 2 Items Resolved Through Domain 4

- ✅ Stale axis name "Charity" in System Reference scrubbed
- ✅ Stale Phase 5 / Phase 4 / Phase 2 framings reframed to current platform direction (Next.js deferred)
- ✅ Stale `SUPABASE_SERVICE_KEY` corrected to `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Three-layer / four-layer naming inconsistency resolved
- ✅ Sparring Partner detection open question (Data Architecture line 309) resolved by Relationship Types spec
- ✅ System Reference archetype taxonomy promoted into Contributor Identity spec

#### Phase 1 Build Queue — Updated After Domain 4 Execution

Doc-update items from Domain 4 are **complete**. Build queue retains the operational + schema-implementation work:

| Category | Item |
|---|---|
| Schema implementation | Migrate `follows`, `sparring_partners` (materialized view), `opinion_map_positions` to live Supabase |
| Schema implementation | Add `delta_acknowledged` column to live `comments` table |
| Schema implementation | Expand `feed_events.event_type` enum to 12 values in live DB |
| Pillar layer | Pillar-Score Computation Function spec + implementation |
| Operational | Supavisor transaction pooler config |
| Operational | All 8 SQL indexes deployed |
| Operational | Compute tier upgrade Micro → Small |
| Operational | `axis_scores` incremental + nightly reconcile |
| Operational | `article_feed_cache` materialized view + async refresh wiring |
| Monitoring | 5 dashboards (p95 query / connection count / DB size / function duration / API headroom) |
| Carry-forward | Stewards / Governance, Delta + Opinion Maps, Reviser archetype, Profile-page Identity Events stream |

---

*Domain 4 fully closed.*

---

### Domain 5: Growth Layer

**Read in this domain:**
- `Fundamentals\Dialecta_Growth_Layer_Principles.md` (v1.0, April 2026, 219 lines including Aspiration Tool addendum)
- `Growth Layer\Dialecta_Growth_Scroll.md` (April 16 2026, 199 lines — session record + locked decisions + open questions)
- `Growth Layer\dialecta-growth-scroll-v5.jsx` (1182 lines, full read — canonical prototype with embedded Fingerprint engine v1.0.0)
- `Living Guidebook\dialecta-guidebook.html` (194K tokens — not opened; per Project Brief, comprehensive user-facing reference covering philosophy, tier definitions, AI engine transparency, mapping tools, improvement submissions. Phase B reality material, not Phase A vision.)

#### The Source Thesis at Career Scale

The Growth Layer applies the platform's source thesis at the longest timescale. Where the tier system asks *what is this comment doing?* and the Identity Layer asks *what pattern of thinking does this person produce?*, the Growth Layer asks *what kind of communicator is this person trying to become?*

**The strategic claim:** *meaningful collaboration and dialogue can be made addictive in the same structural sense that shallow engagement currently is, and doing so is one of the most important things Dialecta can prove.* The bet is that depth, growth, and self-knowledge can compete with outrage and validation as reward currencies — but only when the mechanics are designed honestly, with the user as author rather than target.

This is the only platform layer that requires explicit, renewable user consent to operate.

#### The Six Principles (load-bearing — every Growth Layer feature must pass)

1. **The platform may prescribe, but only with earned consent.** Prescription is not the ethical problem; unearned prescription is. The user articulates in their own words what they are trying to become and why before the platform has standing to push.
2. **Growth is self-directed in pace, reason, and definition.** Tools and mirrors, not verdicts. Scaffolds the user uses to describe themselves *to themselves* — never closed taxonomies that label the user.
3. **The platform is the trustee of the user's better self.** Voice is not "the platform thinks you should" but "three weeks ago you said this mattered. Here's a moment to act on it. Want to?" Aspirations stored verbatim, displayed verbatim, editable anytime.
4. **The Consent Renewal Loop is non-negotiable.** Single acts of consent decay. Before any demanding prompt, surface the user's own past words back to them. Reaffirm / defer / revise — only then does the prescribed exercise appear.
5. **The right to say no must always be real.** Decline = no streak broken, no progress lost, no guilt copy, no follow-up nudge framing decline as failure. The off-ramp is what makes the on-ramp meaningful.
6. **The Self-Snapshot is a composition of three voices, and the user holds the pen.** User self-description (canonical) + engine indicators (signal, never verdict) + community reflection (signal, never verdict). All three visible in one view; user invited (never required) to notice divergence and update self-description if they choose. Platform never updates it for them.

#### The Loop (five-stage operation — gated by ongoing consent)

**See yourself → name what you want → practice it → be reminded why → see yourself again.**

Each stage corresponds to a feature cluster:
- **Seeing:** Activity Rhythm View + Self-Snapshot Engine
- **Naming:** Aspiration Tool
- **Practicing:** Practice Layer (DEFERRED — Phase 4+)
- **Being reminded:** Consent Renewal Loop
- **Seeing again:** loop closes back to rhythm view + snapshot

For Phase 1 with Practice Layer deferred, the loop becomes a four-stage loop: See → name → [practice deferred] → reminded → see again. The "practicing" stage is structurally empty by design.

#### Aspiration Tool — Locked Decisions (per the addendum, April 2026)

Five formerly-open questions resolved:

| Question | Resolution |
|---|---|
| Visibility | Optionally public, contributor-controlled. Private = no rendered section (no empty placeholder). Public lives in the **Declared** shelf below Fingerprint/archetype zone. Cultural register: ambition + intellectual courage, not remediation. |
| Aspiration vs archetype | **Clean separation.** Aspiration appears in Declared shelf, never alongside assigned archetype. Gap legible through proximity but never quantified, measured, or rendered as progress indicator. No progress bar, no percentage. Aspiration is a direction, not a verdict on the present. |
| Aspiration's mechanical effect | **Exactly one thing:** influences coaching priority order in Practice Layer. Axis commitments → ranked pillar list → Practice Layer surfaces matching exercises first. **Assigned archetype is never touched** — keeps the identity layer honest. |
| Shelf life | **90 days OR meaningful fingerprint shift, whichever first.** Dual trigger: active contributors get early recommitment when they make real movement; less-active still check in quarterly. Recommitment options: reaffirm / revise / archive (graceful close, moves to private growth history). |
| Research consent | Surfaced once at aspiration creation. Plain 4-point explanation. Declining = zero effect on Growth Layer features. Not re-asked at recommitment. Stored separately from aspiration record. |
| Practice Layer unprompted nudges | Opt-in only. No unprompted nudges. |

#### The Growth Scroll v5 — Canonical Prototype

The primary visualization for the Growth Layer. **Horizontal scrolling archival journal** showing fingerprint at key moments — first contribution to present.

**Deliberate design departure:** historical record (archive / field notebook), not dashboard. Fingerprint is shown across time as a witness, not analyzed or scored.

**Visual language departures from main spec:**
- **Cinzel** (Roman inscription letterforms) for labels/dates/event names — replaces DM Mono entirely
- **IM Fell English Italic** (1670s Oxford revival) for annotation paragraphs
- **Cormorant Garamond** for display
- **Aged paper** (`#ede0c4`) with three-layer SVG texture (fractalNoise grain + horizontal fiber striations + cross-grain fibers, all multiply-blend)
- **Dark surround** (`#1c1814`) above/below; deckle edges as dark-fill SVG overlays eating into paper
- **DM Sans and DM Mono not used anywhere** — the scroll is its own visual vocabulary

**Annotation voice:** observational, past tense, field notes register, never progress-framing ("improved/grew/achieved" forbidden), never compares to other contributors, may note direction changes/reversals/consolidations. Final entry signature: *"The record is open"* (not a terminus).

**Fingerprint engine:** uses canonical engine v1.0.0 verbatim (inline copy with sync requirement). Each snapshot at 176px (162 for seed entry).

**Five mock entries** (chronological): First Entry (1 Sep 2024, seed dot only) → Declaration (14 Oct 2024) → Recommitment (9 Jan 2025) → Archetype Shift (3 Apr 2025) → Present (16 Apr 2026, mature asymmetry).

#### Snapshot Curation Algorithm — Pending Spec for Phase 1

The Growth Scroll cannot show all `fp_snapshots` — narrative would blur into noise. The algorithm surfaces **6–8 entries maximum** as standalone, compresses quiet periods into annotations between them.

**Core principle: significance is normalized per contributor.** No universal threshold; each contributor measured against their own historical range of motion.

**Five sub-scores feeding the significance function:**
1. Fingerprint delta percentile (Euclidean distance vs personal distribution)
2. Direction change detection (axis reversals are inherently significant)
3. Event type weight (Archetype shift: 1.0; First entry: 1.0; Recommitment: variable; Milestone: variable)
4. Recency curve (recent snapshots get lower threshold; older need higher delta)
5. Temporal gap (3x normal interval surfaces regardless of delta — silence-then-engagement is meaningful)

**Bootstrap period:** fewer than 6–8 snapshots, all surface. Algorithm activates once personal distribution exists.

**Compression annotations:** *"Fourteen months of steady development. No structural shifts in this period."* Transparency mechanism — contributor knows curation is happening.

#### Internal Inconsistencies & Tensions Surfaced

Domain 5 has the most code-level drift of any domain. The vision is locked; the canonical prototype hasn't kept up.

1. **🚨 Growth Scroll v5 JSX uses RETIRED AXIS NAMES.** Lines 14–33 declare `FINGERPRINT_AXES` with: `specificity / calibration / charity / discourse / consistency / originality`. Canonical (per Contributor Identity v1.1) is `acuity / calibration / magnanimity / discourse / consistency / reach`. **Three keys are wrong:** `specificity → acuity`, `charity → magnanimity`, `originality → reach`. The inline engine self-comments as v1.0.0 with "Source of truth: dialecta-fingerprint-engine.jsx — Sync this block from the source whenever the version bumps" — implying the canonical engine file may also be at v1.0.0 with old names. Either way, the Growth Scroll is shipping with retired pillar names.

2. **🚨 Growth Scroll v5 mock data uses OLD AXIS NAMES throughout** (lines 678+). Even if the engine is renamed, every mock SNAPSHOT entry uses retired keys. The data shape is wrong everywhere it appears.

3. **🚨 Growth Scroll v5 uses the OLD 9-TOPIC TAXONOMY.** Lines 39–49: `renewable_energy, mental_health, music, economics, humanity, political_science, psychology, acoustics, theology`. Canonical is the 12-topic v2 set (per API CLAUDE.md): `politics_governance, law_justice, history, economics, environment_energy, health_medicine, psychology_behavior, science_technology, philosophy_ethics, arts_humanities, theology_spirituality, society_culture`. This compounds the known Tier 2 item — the topic divergence isn't only in `dialecta-profile.jsx`; it's in the Growth Scroll prototype too.

4. **🚨 Growth Scroll session MD also uses OLD AXIS NAMES.** Line 47: *"Axis keys: `specificity`, `calibration`, `charity`, `discourse`, `consistency`, `originality`"*. The doc itself documents the stale prototype as canonical.

5. **The Self-Snapshot Engine is "the foundational instrument" of the Growth Layer** (Principle 6 line 93) — but **it doesn't have its own spec doc.** Principle 6 describes the three-voice composition; no implementation spec exists. Phase 1 needs one to actually build the view that surfaces all three voices.

6. **The Activity Rhythm View has no spec.** Named in Growth Layer Principles as a feature cluster (line 113: *"must be user-private by default… show patterns without prescribing"*) but no dedicated design exists. Phase 1 needs one.

7. **Doc internal inconsistency in Growth Layer Principles.** The Aspiration Tool addendum (lines 209–217) explicitly says it resolves five questions from the Open Questions section. **But the Open Questions section (lines 132–139) still lists those same five questions as open.** The doc is internally contradictory — same questions appear "open" and "resolved" in different sections of the same doc. Surgical fix needed: collapse the resolved items in the Open Questions section.

8. **For Phase 1 with Practice Layer deferred, axis_commitments has no consumer.** Aspiration Tool addendum line 172–176: *"The aspiration influences exactly one thing in the system: the coaching priority order within the Practice Layer."* Without Practice Layer, the axis_commitments captured at aspiration declaration are stored but unused in Phase 1. Two options: (a) capture them anyway as part of aspiration record (data ready when Practice Layer ships), (b) defer the axis_commitments form field and reactivate when Practice Layer ships. **Recommendation: (a)** — preserve the spec, low cost, ready-when-needed.

9. **The Loop is structurally incomplete in Phase 1 by design.** "Practicing" stage = empty. Worth being honest about this in the Living Guidebook copy describing the Growth Layer to users — it's a five-stage loop where the practicing stage activates in Phase 2+.

10. **Annotation generation needs a prompt spec.** Growth Scroll session MD line 109: *"the text is static mock copy. The generation layer needs a prompt spec that reliably hits the established register. Claude Haiku at ~$0.002/snapshot."* This is a small AI-engineering task with cost commitment. Phase 1 needs the prompt spec OR a decision to defer annotation generation and ship with manually-authored annotations for the curated entries.

11. **Profile integration is unresolved** (Growth Scroll session MD line 111). The handoff between current fingerprint at top of profile and the top of the scroll is undesigned. Phase 1 design task.

12. **Empty/sparse state is unresolved** (Growth Scroll session MD line 113). A contributor with one or two snapshots needs a graceful minimal scroll, not a broken layout.

13. **The fingerprint engine version contract** (line 9–13 of v5 JSX) says "Changing any of these is a breaking change and requires a major version bump." This means renaming the axis keys is a v2.0.0 bump, not a minor patch. Worth being explicit in the upgrade plan.

14. **Living Guidebook drift risk** — implementation-level reference doc not opened (194K tokens). Likely contains the same axis-name and topic-taxonomy stalenesses given everything else does. Phase B reality material — but flag for inspection.

#### Phase 1 Build Queue — Updated After Domain 5

| Category | Item |
|---|---|
| Growth Layer specs (write) | Self-Snapshot Engine spec (the three-voice composition view) |
| Growth Layer specs (write) | Activity Rhythm View spec |
| Growth Layer specs (write) | Snapshot Curation Algorithm spec (significance scoring formula, normalization, recency curve, bootstrap rules, 6–8 cap, compression annotations) |
| Growth Layer specs (write) | Annotation generation prompt spec (Claude Haiku, ~$0.002/snapshot) — OR decision to ship with manual annotations |
| Growth Layer code (refactor) | Growth Scroll v5: axis name update (specificity→acuity, charity→magnanimity, originality→reach) — engine bump to v2.0.0 |
| Growth Layer code (refactor) | Growth Scroll v5: TOPICS palette update to canonical 12-topic v2 |
| Growth Layer code (refactor) | Growth Scroll v5: profile integration (handoff design) + empty/sparse state |
| Growth Layer code (build) | Aspiration Tool implementation (spec is locked; just build) |
| Growth Layer code (build) | Consent Renewal Loop implementation (spec is locked; just build) |
| Doc updates | Growth Layer Principles: collapse resolved items in Open Questions section (5 items moved to "resolved" with reference to addendum) |
| Doc updates | Growth Scroll session MD: axis name update + topic taxonomy update |
| Carry-forward | All Domain 1–4 build queue items |

#### Domain 5 Open Questions for User Confirmation

1. **Surgical doc updates in this pass — same logic?** The Domain 5 doc-level fixes:
   - Growth Layer Principles: collapse the 5 already-resolved Open Questions (mark as "Resolved by Aspiration Tool Addendum")
   - Growth Scroll session MD: axis name update + topic taxonomy update
   
   *Recommendation: yes, knock out now.*

2. **Growth Scroll v5 JSX axis-name + topic-taxonomy fixes — surgical now or defer to Phase E?** This is a CODE change in the active prototype (1182 lines, embedded engine). Two options:
   - **(a)** Make the surgical edits now (replace_all on `specificity`, `charity`, `originality`, plus replace the TOPICS const) — risk: may break the prototype's rendering since the renames also apply to mock data, requires coordinated replacement
   - **(b)** Defer to Phase E execution batch where it gets coordinated with the canonical engine sync and the broader topic-taxonomy migration
   
   *Recommendation: (b) — defer.* This is the kind of coordinated refactor that needs to happen against the canonical engine file, not piecemeal in the prototype copy. Phase E does it once, cleanly, across all engine consumers.

3. **axis_commitments in Phase 1 with Practice Layer deferred — capture (option a) or defer the form field (option b)?** *Recommendation: (a) capture* — preserves spec integrity, data ready when Practice Layer ships, low cost.

4. **Annotation generation — write prompt spec for Phase 1 OR ship with manual annotations?** Manual annotations would mean the platform team writes annotations for the curated entries until the AI generation is built (which is a small task with a known cost: Claude Haiku, ~$0.002/snapshot). *Mild recommendation: write the prompt spec and ship AI-generated* — it's cheap, low-risk, and the alternative (manual) doesn't scale past a handful of contributors.

5. **Self-Snapshot Engine spec — write now or in Phase E?** This is the foundational instrument of the Growth Layer per Principle 6, but no spec exists. *Recommendation: write a stub spec NOW as a sibling to Aspiration Tool addendum (in Growth Layer Principles or a new doc)* — Phase 1 cannot ship the Growth Layer without it, and writing it now lets the audit close cleanly.

6. **Activity Rhythm View spec — write now or in Phase E?** Same situation as Self-Snapshot Engine. *Recommendation: write a stub spec NOW.* Lighter than Self-Snapshot Engine (the principle constraint is just "show patterns without prescribing, user-private by default") so the spec is small.

---

#### Domain 5 Answers + Updates Executed (2026-04-26)

**All six Domain 5 questions resolved. Surgical updates landed. Two new spec docs drafted.**

1. **Surgical doc updates: DONE.**
   - `Dialecta_Growth_Layer_Principles.md`: 5 originally-open questions in the "Open Questions for the Cluster" section marked ✅ Resolved with direct cross-reference to the Aspiration Tool Addendum. Doc no longer self-contradicts.
   - `Growth Layer\Dialecta_Growth_Scroll.md`: axis keys updated to canonical (acuity / magnanimity / reach), topic phases updated to canonical 12-topic v2 (psychology_behavior / economics / politics_governance / environment_energy). Both updates include explicit footnotes that the v5 prototype JSX still uses retired keys + topics, with refactor queued for Phase E.

2. **Growth Scroll v5 JSX axis-name + topic refactor: DEFERRED to Phase E.** Will be coordinated with the canonical `dialecta-fingerprint-engine.jsx` source-of-truth sync (engine version bump to v2.0.0). Phase E does it once across all engine consumers.

3. **axis_commitments in Phase 1: CAPTURE ANYWAY.** User direction: *"I will likely try to build this into the launch before Stage 4."* Aspiration Tool captures axis_commitments as part of the aspiration record from launch. Data ready when Practice Layer ships.

4. **Annotation generation: SHIP WITH AI.** Claude Haiku at ~$0.002/snapshot. Prompt spec to be written as part of Phase 1 build queue. Manual fallback not pursued.

5. **Self-Snapshot Engine spec: WRITTEN.** New canonical doc at `Fundamentals\Dialecta_Self_Snapshot_Engine.md` (~190 lines). Specifies the three-voice composition (User / Engine / Community), the composition view, the living record, three operating constraints, data model (one new entity: `self_descriptions`), integration with Aspiration Tool / Activity Rhythm View / Growth Scroll / Relationship Types, and 5 open questions. Companion documents footer added.

6. **Activity Rhythm View spec: WRITTEN.** New canonical doc at `Fundamentals\Dialecta_Activity_Rhythm_View.md` (~165 lines). Specifies what it shows (6 dimensions), what it does NOT show (no scoring, no comparison, no prescription, no notification triggers), visual treatment (archival journal aesthetic, possibly Cinzel + IM Fell English), privacy model (private by default, granular opt-in for public sharing), data sources (all read-only against existing tables — no schema additions), integration with Self-Snapshot + Aspiration Tool + Growth Scroll, and 5 open questions. Cross-reference to Social UX Architecture Risk 3 (Recognition vs Surveillance) as the keep-out-of-feed principle.

#### Phase 1 Build Queue — Updated After Domain 5

| Category | Item | Source |
|---|---|---|
| Schema | `self_descriptions` table for Voice 1 of Self-Snapshot Engine | Domain 5 |
| Growth Layer | Self-Snapshot Engine implementation (composes 3 voices, displays divergence honestly, living record over time) | Domain 5 |
| Growth Layer | Activity Rhythm View implementation (6 patterns, no scoring, private by default) | Domain 5 |
| Growth Layer | Snapshot Curation Algorithm spec + implementation (significance scoring, 6–8 cap, compression annotations) | Domain 5 |
| Growth Layer | Annotation generation prompt spec + Claude Haiku integration | Domain 5 |
| Growth Layer | Aspiration Tool implementation (spec already locked in addendum) | Domain 5 |
| Growth Layer | Consent Renewal Loop implementation | Domain 5 |
| Growth Layer | Growth Scroll v5 → v6 refactor (axis names + 12-topic v2 + profile integration + empty/sparse state) | Domain 5 + Phase E |
| Engine | `dialecta-fingerprint-engine.jsx` v1.0.0 → v2.0.0 (canonical engine source-of-truth update) | Phase E |
| Carry-forward | All Domain 1–4 build queue items | Domains 1–4 |

#### 🚨 Phase Plan Drift — Strategic Question Surfaced by User

The user surfaced (during Domain 5 Q3 answer) that the canonical 4-phase plan from the Project Brief has been drifting. The original plan:

| Canonical Phase | Timeline | Goal | Status (per Project Brief) |
|---|---|---|---|
| Phase 1 — Pilot | 0–3 mo | Ghost CMS live, family contributors, **manual** classification | Largely in place |
| Phase 2 — Engine | 3–6 mo | AI classification, self-declaration, community voting, Pact | In active development |
| Phase 3 — Mapping | 6–9 mo | 2-axis opinion tool, ternary plot beta | Not started |
| Phase 4 — Platform | 9–18 mo | Migrate to Next.js + Supabase, public launch, **Growth Layer ships here** | Not started; blocked on Phase 2 |

User's strategic intent (paraphrased + extended through this audit):
- Defer the Next.js migration further (already deferred per platform direction); Ghost + Supabase + React + Vercel is the confirmed production stack indefinitely
- Squeeze more functionality out of the current stack before any future migration
- Ship Growth Layer foundations before canonical Phase 4 (this audit has already enrolled them in Phase 1)
- Possibly even ship Practice Layer before canonical Phase 4

**Implication:** what we have been calling "Phase 1" in this audit is actually a collapse of canonical Phases 1+2+3 plus most of Phase 4 minus the stack migration. Terminology drift in the audit itself.

**Proposed reframe (pending user confirmation):**

| Reframed Phase | Contains | Status |
|---|---|---|
| **Phase 1 — Pilot** | Ghost live, family/internal, manual classification | Complete |
| **Phase 2 — Public Launch** | All canonical Phase 2+3 + Growth Layer foundations + Stewards + Delta + Opinion Maps + Reviser, on Ghost+Supabase+React+Vercel. *Everything this audit's "Phase 1 maximalist" has been enrolling.* | In-progress (this audit's target) |
| **Phase 3 — Practice + Scale** | Practice Layer (after 6+ months of real aspiration data), full Feed surface, tuning Snapshot Curation against real data, still on current stack | Post-launch |
| **Phase 4 — Stack Migration** | Originally Next.js + Supabase migration. Currently deferred. Re-evaluate when scale demands it. | Deferred / possibly retired entirely |

This reframe collapses the canonical 4 phases into 3 functional phases that match the maximalist directive and the current stack reality.

**Pending: user confirmation of the reframe.** Once confirmed, audit doc terminology can be updated in a sweep, and the Project Brief v2 update (already in the build queue from Domain 1) carries this reframe.

---

#### Phase Plan Reframe — ADOPTED (2026-04-26)

User confirmed all three resolution questions:

1. **Reframe adopted** as proposed. Four phases, with Phase 4 explicitly flagged as deferred / possibly never.

| Phase | Contents | Status |
|---|---|---|
| **Phase 1 — Pilot** | Ghost live, family/internal contributors, manual classification | Complete |
| **Phase 2 — Public Launch** | All canonical Phase 2+3 + Growth Layer foundations + Stewards + Delta + Opinion Maps + Reviser archetype + Identity Events feed, on Ghost/Supabase/React/Vercel. Everything this audit has been enrolling under "Phase 1 maximalist." | In progress (this audit's target) |
| **Phase 3 — Practice + Scale** | Practice Layer (after 6+ months of real aspiration data), full Feed surface, Snapshot Curation tuning against real data, still on current stack | Post-launch |
| **Phase 4 — Stack Migration** | Originally Next.js + Supabase migration. Currently deferred. Re-evaluate when scale demands it; possibly retired entirely. | Deferred / possibly never |

2. **Audit terminology sweep deferred to end-of-audit** (option b). Subsequent audit content continues using the in-flight terminology. After Domain 6 closes Phase A, a single coordinated sweep aligns the entire audit doc to the reframed phases.

3. **Project Brief v2 update will carry the phase reframe** as the headline change. Existing Phase 1 build queue item (from Domain 1) now expands to include this reframe alongside the topic taxonomy update, companion docs reconciliation, and other accumulated drift.

#### End-of-Audit Deliverable Added (per user direction 2026-04-26)

User direction: *"I want to forecast the pull potential of what the current stack could offer and what a full scale solution would look like. Not necessary now."*

This becomes a **Phase D deliverable**, scheduled for end of audit:

> **Stack Pull Potential vs Full Scale Solution Forecast.** A comparative analysis of (a) maximum sustained capacity of the Ghost + Supabase + React + Vercel stack at various contributor scales (1K / 10K / 50K / 100K active users), and (b) what a Phase 4 full-scale solution would offer (likely Next.js + Supabase + dedicated comment microservice + edge deployment + fine-tuned classification model). Goal: inform the long-term decision of whether to ever pursue Phase 4 stack migration, or to keep extending the current stack indefinitely.

Inputs available for this forecast: `Dialecta_Supabase_Scaling.md` (operational ceilings + monitoring), Project Brief Tech Stack tiers, current API CLAUDE.md architecture, and the new Phase 1 build queue scope (which establishes the actual feature set Phase 2 will run on the current stack).

---

*Phase A audit terminology continues using the in-flight phrasing through Domain 6. Coordinated terminology sweep happens at Phase A close.*

---

*Domain 5 fully closed.*

---

### Domain 6: Article Layer + Comment Lifecycle + Opinion Mapping Toolkit + Stewards + Pact

**Read in this domain:**
- `Dialecta_Article_Editorial_Template.md` (root, v1.0, April 2026, 204 lines — full read)
- `Opinion Map\Spider Chart-Barycentric Multi-Pole.txt` (51 lines — full read, design rationale for two non-Phase-1 mapping tools)
- `Dialecta-Private-Draft-Mode.jsx` (root, 1235 lines — full read, comprehensive Session 11 prototype)
- `Opinion Map\dialecta-opinion-map-briefing.html` (196K tokens — not opened; vision content covered by Project Index + Spider Chart text + Project Brief)
- `dialecta-pact.html` (248KB — not opened; vision content covered by Project Brief + Project Index inventory)
- `dialecta-s13-stewards.html` (440KB — not opened; vision content covered by Project Index inventory)
- `Living Guidebook\dialecta-guidebook.html` (194K tokens — Phase B reality material, conceptual content covered by upstream specs)

#### The Article Layer Vision (Editorial Template)

**Founding principle:** Dialecta does not try to alter an author's voice, passion, focus, or intent. The platform's job is to *understand* what an author is doing and *reflect it back accurately* — never to rewrite, sanitize, or shape the article toward a house style. **Symmetric to the commenter system by design.**

**Post-writing declaration layer, not pre-writing scaffold.** The author writes freely. After writing, they pass through a structured self-reflection layer that declares intent so the engine has something real to work with. The moment a template shapes how someone writes, the platform has introduced conformity pressure — exactly what Dialecta exists to counteract.

**Symmetric stage flow** mirrors the comment system stage-for-stage:

| Stage | Comment | Article |
|---|---|---|
| 1 | Write → AI pre-analysis | Write → Submit → AI analysis |
| 2 | Commenter self-declares tier | Author self-declares intent + suggested tier |
| **2.5** | **Amendment Window** | **Amendment Window** |
| 3 | Community votes / reclassifies | Community engages / nominates reclassification |

**The Five Declaration Layer Questions** (post-writing, all required except #5):
1. **Core Claim** — *"In one or two sentences — what is this article actually arguing?"*
2. **Scope Boundary** — *"What is this article not arguing? What common misreading do you want to preempt?"*
3. **Strongest Objection (Advocate prompt)** — *"What's the strongest case against your position? You don't have to agree with it — just name it."*
4. **Suggested Tier** — same seven-tier system as comments
5. **Opinion Mapping Suggestion (optional)** — *"What are the real dimensions of disagreement this article opens up?"*

**The AI does NOT change the article.** It performs four reflective tasks: identifies core claim independently (notes agreement/divergence with author's), assigns suggested tier with reason, flags specific passages pulling toward different tiers (with explicit rationale, never *"this is problematic"*), suggests/refines opinion mapping axes. **AI analysis is disclosed alongside the published article, never used to gate publication.**

**Three calibration mechanisms** for AI quality: response quality log (track Stage 2.5 amend/disagree/post-as-is rates), user sentiment one-tap signal (Helpful / Not helpful), monthly editorial review of AI suggestion samples.

**Stage 2.5 — Amendment Window:** Three options (Amend / Respond for the Record / Post As-Is). Author's choice carries real but subordinate weight: AI suggestion = primary, community voting = primary, author self-declaration = secondary, Stage 2.5 amendment/response = secondary. **A well-reasoned disagreement nudges the tier slightly toward the author's position** — articulate self-awareness counts.

**Wait times** disclosed in Pact and Living Guidebook. Article submission has a longer wait window than comments. *"This is intentional. Publishing here carries weight. We'll be ready when you are."* **Transparency converts friction into ritual.** Specific durations live in a referenced "Wait Architecture spec" — which does not appear in OneDrive (see staleness #5 below).

**Community influence post-publication:** structured nominations with three fields (suggested new tier dropdown / primary reason single-select / optional 140-char note). Predefined reasons educate by being read. **Original author sees nominations BEFORE re-review takes effect** — another Stage 2.5 moment, the platform pulling toward growth not judgment.

#### The Comment Lifecycle Vision (Private Draft Mode prototype)

**This is a comprehensive Session 11 prototype** — not a status-unknown concept artifact. It implements the full comment submission flow end-to-end: Select preset → Compose → Consent (60-min malleability briefing) → Reflecting (8s wait) → Reflection (engine analysis displayed) → Self-declare → Stage 2.5 (Accept / Amend / Respond for record) → Final → Posted (60-min malleability window with live countdown).

**Two preset walkthroughs:** Path A (happy — AI and contributor agree on Forum) and Path B (Stage 2.5 disagreement — AI reads Heat, contributor declares Spark, writes reasoned note for the record).

**Canonical conformance:**
- ✅ Tier names: forum / spark / echo / fog / heat / stance / breach (line 74)
- ✅ Design tokens: gold #d4a84a / goldBright #e8a830 / canonical color palette
- ✅ Typography: Cormorant Garamond / DM Sans / Source Serif 4 / DM Mono
- ✅ Two-bar nav (52px logo + 34px sub-nav, max-width 1100)
- ✅ Page background gradient with 0.035 fractalNoise grain
- ✅ Observational tone throughout the AI Reflection cards ("the claim we found" / "what this does well" / "the shape of it" / "suggested tier")
- ✅ "None of these choices are wrong" — Editorial Voice Growth Frame language

**🚨 Major new design commitment surfaced ONLY in this prototype:**

> **The 60-minute malleability window.** *"Once posted, your comment is yours permanently. After you post, you have 60 minutes of free revision. During that hour you can edit, rewrite, or delete what you've written. After 60 minutes, the comment hardens. It becomes part of the public record. You can append to it — publicly, with the addition marked — but you can't remove what you said. Public refinement of your thinking is treated here as a strength."*

This is a load-bearing user-facing commitment. It does not appear in any spec doc — not Classification Engine Spec, not Project Brief, not Editorial Voice, not Article Editorial Template. **The principle:** *"Slowness is a feature. The wait is not friction — it is ritual. The moment your post becomes permanent is designed to feel earned."* Phase 1 needs this either spec'd as its own canonical doc or added to the Discourse Layer / Classification Engine spec.

**Real wait architecture** (per Private Draft Mode line 4-19):
- 8 seconds before reflection appears
- 12 seconds before Stage 2.5 options activate (sit with this)
- 60 minutes of post-publication malleability

**The Stage 2.5 disagreement note** (Path B): a reasoned author note becomes part of the record, visible to readers, "carries real weight in the final classification." The placeholder copy seeded: *"I know this reads as [tier], but…"* — Editorial Voice observational tone.

#### Opinion Mapping Toolkit (Spider Chart + Barycentric analysis)

The Spider Chart and Barycentric Multi-Pole analysis is essentially a **design rationale for why Phase 1/2 ships only Cartesian + Ternary**, not the other two tools.

**Radar/Spider Chart verdict:**
- Mechanically: polygon inside circle, multiple sliders, axes radiate from center
- Core problem: original example axes (Evidence quality, Moral weight, Practical feasibility...) measured *evaluation* not *position* — produced reviews, not opinion maps
- Visual problem: aggregate polygon CONCEALS polarization (two opposed communities can produce the same average shape as a moderate community)
- Mobile: nearly unusable
- Best use case: articles with 5+ genuinely independent dimensions (immigration policy, tax philosophy)
- **Recommendation:** kept in toolkit but not a priority. Maybe revisit for reader values surveys tied to longer editorial series.

**Barycentric Multi-Pole verdict:**
- Ternary plot extended to 4+ poles (tetrahedron and beyond)
- Cannot be rendered in 2D without distortion artifacts
- Readers cannot intuit barycentric coordinates beyond three dimensions
- **Recommendation: reconceive entirely as an editorial analytics layer, not reader-facing.** Useful question: *"how complex is the opinion landscape of our readership on this topic?"* — for editors, not readers. For 4-pole debates, run two separate ternary plots covering 3 of 4 poles each, more legible than a tetrahedron.

**Honest Phase 1/2 assessment:** the 2-axis plot and ternary plot are the right reader-facing tools. They cover the dominant structural types of debate. The other two are deferred or relegated to editorial backstage.

#### Stewards / Governance Cluster (per Project Index inventory)

`dialecta-s13-stewards.html` (440KB — not directly opened) implements: writer Orders, Cadence modifiers, Satirist's Charter. **Per Project Index:** "governance-adjacent prototype, candidate to spin out into its own seventh layer if it expands."

**Per Domain 1 user direction (2026-04-26):** *"Stewards is a relatively fully developed concept. Authors should have an identity, pride, and an alluring pomp and circumstance. Let's galvanize it."* Stewards is now confirmed as a Phase 2 (Public Launch) deliverable.

The Stewards / Governance work is a **first-class platform layer for launch.** Companion design note `Dialecta_Stewards_Reflection.txt` (per Project Index) lives in Claude.ai project files and is on the sync candidate list (per Domain 1 Q3 decision).

#### The Pact (per Project Index inventory + Project Brief description)

`dialecta-pact.html` (248KB — not directly opened) implements: hero, philosophy, tier system visual, **three-comment classification quiz**, **two-path commitment mechanic**.

**Per Project Index:** uses Dialecta branding and current tier names (Stance, Breach) — leading the Classification Engine Spec which we just fixed in Domain 3.

**Per Project Brief:** *"A single beautifully designed page — not a wall of terms. Elements: Platform mission in plain language, Tier system explained with real example comments, One active commitment: 'I understand and want to participate', Optional: short interactive quiz — classify 3 sample comments to learn by doing."*

The Pact is **the contract that gates entry to the platform** — first login moment. Per Founding Philosophy Section VI, the Pact is where Articles 4 (fear is primitive) and 10 (civilizational scope) get applied to the moment of first commitment. **Phase 1 critical** — public launch requires the Pact.

#### Internal Inconsistencies & Tensions Surfaced

1. **🚨 60-minute malleability window has no spec.** The most consequential design commitment surfaced in Domain 6, and it lives only inside the Private Draft Mode prototype. Not in Classification Engine Spec, not in Project Brief, not in Editorial Voice, not in Article Editorial Template. **Phase 1 needs this spec'd somewhere.** Recommended location: extend Classification Engine Specification with a new "Comment Lifecycle" section, OR new sibling doc `Dialecta_Comment_Lifecycle.md` covering wait architecture (8s/12s/60min) and the malleability principle. This spec is the source-of-truth for the entire post-publication user experience.

2. **🚨 Wait Architecture spec referenced but missing.** Article Editorial Template line 127: *"The exact durations are calibrated separately and live in the Wait Architecture spec."* No such doc exists in OneDrive. Either lives in Claude.ai project files (sync candidate) or has not been written. Phase 1 needs the durations specified.

3. **🚨 Tier Psychology spec referenced but missing from OneDrive.** Article Editorial Template line 9 + 186 + Project Index Discourse Layer canonical entry. Per Domain 1 Q3 decision, Tier Psychology is on the user's Claude.ai → OneDrive sync candidate list. Confirm this is being synced.

4. **Private Draft Mode status: NOT "unknown."** Foundation State doc earlier flagged this as "Status unknown: deferred concept, retired prototype, or pending merge." Reading the file confirms it's **a comprehensive canonical prototype** (Session 11) implementing the full comment submission flow with canonical design tokens, fonts, and tier names. **Recommendation: promote to canonical "Comment Composition Prototype" status.** This is the visual + interaction reference that the Phase 2 build of `/api/comment` flow should match.

5. **Private Draft Mode references Design Spec v1.2** (line 1086, 1097, 1114) but Project Index says canonical is v1.3. Likely v1.2 → v1.3 only added Section 12 Component Library; nav and page background (Sections 8 + 8b) presumably unchanged. Worth verifying when Design Spec v1.3 is opened in Phase B.

6. **Logo placeholder note in Private Draft Mode** (line 1117): the prototype uses a Cormorant Garamond fallback because *"Artifacts can't load project-bundled assets."* References the canonical `Dialecta__Hero__White.png` at 40px with mix-blend-mode: multiply. Phase 2 build needs the actual PNG embedded, not the fallback. (Already on the Claude.ai → OneDrive sync candidate list per Domain 1 Q3.)

7. **Spider Chart + Barycentric Multi-Pole analysis** is conceptually clean — but never made it into a canonical "Opinion Mapping Decisions" doc. It's a substantive design rationale that belongs alongside the Opinion Map briefing HTML. Worth consolidating into a Phase D recommendation.

8. **Article Editorial Template's Open Calibration Questions** (line 192–200) are still open: exact wait durations, nomination threshold for re-review, Stage 2.5 disagreement weight, whether Question 5 (Opinion Mapping) is required for certain article types, guest contributor onboarding. These are real Phase 1/2 design tasks but appropriately deferred to live testing.

9. **Article Editorial Template uses canonical "Advocate prompt"** (line 56) — confirmed clean of "steelman" terminology. Good.

10. **Symmetric stage flow** between articles and comments is a structural commitment. The implementation (Private Draft Mode) implements the comment side; the article side needs an analogous prototype. Phase 2 build queue.

11. **Author nominations seen before re-review** (Article Editorial Template line 163-165) — *"Another Stage 2.5 moment. The platform keeps pulling toward growth, not judgment."* This is a meaningful platform commitment that pairs with the comment-side malleability window. Worth flagging in the Comment Lifecycle / Wait Architecture spec to keep them coherent.

#### Phase 1 Build Queue — Updated After Domain 6

| Category | Item |
|---|---|
| New canonical spec | **Comment Lifecycle / Wait Architecture spec** (60-min malleability window + 8s/12s wait windows + author re-review windowing for articles) |
| Sync from Claude.ai | Tier Psychology spec → `Fundamentals\` |
| Sync from Claude.ai | Stewards Reflection design note → `Fundamentals\` |
| Sync from Claude.ai | `Dialecta__Hero__White.png` → `Fundamentals\Logos\` (if not already covered by existing Logos folder) |
| Sync from Claude.ai | `dialecta-logo-datauri.txt` → `Fundamentals\` |
| Promote to canonical | Private Draft Mode prototype as canonical Comment Composition reference |
| Article Layer | Article Editorial Template implementation (UI + AI integration) |
| Article Layer | Article submission prototype mirroring Private Draft Mode for the article side |
| Pact | Phase 2 build of dialecta-pact.html into active theme as the first-login onboarding page |
| Stewards | Phase 2 build of dialecta-s13-stewards.html into active theme as the Stewards / Governance surface |
| Opinion Mapping | Cartesian + Ternary plot components (already in Delta scope from Domain 2) |
| Doc | Consolidate Spider Chart + Barycentric Multi-Pole analysis into a canonical "Opinion Mapping Decisions" doc OR add to Project Brief v2 |
| Carry-forward | All prior domain build queue items |

#### Domain 6 Open Questions for User Confirmation

1. **The 60-minute malleability window** — is this canonical and in scope for Phase 2? The Private Draft Mode prototype treats it as canonical but no spec exists. *Recommendation: yes, canonical, write spec as part of Phase 1 build queue.* Confirm.

2. **Comment Lifecycle / Wait Architecture spec — write now or defer to Phase E?** Three pieces to spec: 8s pre-reflection wait, 12s pre-Stage-2.5 wait, 60-min post-publication malleability + appendable-after-hardening rules. Plus the article-side: longer wait window + author re-review windowing. *Recommendation: defer to Phase E build queue execution.* This is a substantive new spec doc, not a surgical edit.

3. **Private Draft Mode prototype — promote to canonical?** It's a comprehensive Session 11 prototype demonstrating the full comment submission flow with canonical design tokens, fonts, tier names. *Recommendation: yes, promote.* Update Project Index inventory accordingly.

4. **Spider Chart + Barycentric Multi-Pole analysis — give it a canonical home?** Currently lives in `Opinion Map\Spider Chart-Barycentric Multi-Pole.txt`. It's substantive design rationale. *Recommendation: rename + promote to `Fundamentals\Dialecta_Opinion_Mapping_Decisions.md` OR fold into Project Brief v2.* Your preference.

5. **Stewards Reflection + Tier Psychology + logos — confirm sync from Claude.ai is in your work queue.** Per Domain 1 Q3 we agreed on selective Claude.ai → OneDrive sync. These are the items. Confirm you'll do the manual download, then we know they're available for Phase B reality capture.

6. **Pact + Stewards HTMLs (248KB + 440KB) — Phase B reality material, no further audit action needed.** Confirm we treat these as Phase B (reality capture vs build) and do not attempt to grep them now.

7. **Living Guidebook HTML** (194K tokens) — same treatment: Phase B reality material. The conceptual content (philosophy, tier definitions, AI engine transparency, mapping tools, improvement submissions) is already covered upstream in the spec docs. Confirm.

---

#### Domain 6 Answers + Strategic Findings (2026-04-27)

All seven questions resolved + two strategic additions surfaced.

1. **60-min malleability window — CANONICAL.** Plus important refinement from user: **wait/malleability windows apply to BOTH authored posts AND comments**, with **authored posts getting the longer window**. Three founding goals of the wait architecture (per user direction):

   > 1. **Avoid the "oops I wish I hadn't sent that email" scenario** that everyone has had — a structural off-ramp from immediate regret.
   > 2. **Reduce the culture of quick dopamine hits and instant gratification** — slowness as feature, not friction.
   > 3. **Remove the heated-post-then-delete-it / anonymity culture of typical social media** — accountability through permanence after the malleability window closes; public refinement (append) preferred over public erasure.

   These three goals belong in the new spec doc as the *why* behind the wait architecture. They cannot be omitted from the canonical text because they distinguish Dialecta's wait windows from arbitrary delays on other platforms.

2. **Comment Lifecycle / Wait Architecture spec — defer to Phase E** (same logic as #1). Confirmed.

3. **Promote Private Draft Mode to canonical Comment Composition prototype.** Confirmed. Project Index inventory needs an update reflecting this status change.

4. **Spider Chart + Barycentric analysis — RENAME + PROMOTE.** Will become `Fundamentals\Dialecta_Opinion_Mapping_Decisions.md` in Phase E.

5. **Claude.ai sync automation — answered below.** See *"Claude.ai Sync Approach"* section.

6. **Pact + Stewards HTMLs as Phase B reality material — CONFIRMED.** No further audit action.

7. **Living Guidebook HTML as Phase B reality material — CONFIRMED.** No further audit action.

#### 🚨 Wooden-Frame Brass Progress Bar Component — IDENTIFICATION PENDING

User direction: *"There is a gorgeous looking progress bar that is a beautiful wooden frame with a gradient brass progress bar that was developed. We need to make sure this is identified. I believe we built it into a Reach function, but if we did not, it needs to go on the list."*

**Search results across OneDrive Dialecta:**
- **Brass styling found:** `dialecta-pact.html` lines 806–851 — `.brass` button class with gradient (`#f0cc70 → #d4a040 → #956420 → #603e12`), hover/active/disabled states. **This is a brass-look button, not a progress bar.** Likely the same visual vocabulary the wooden+brass progress bar would use.
- **Wooden frame styling:** **Not found** in any OneDrive Dialecta file. Searched on `wood`, `wooden`, `bezel`, `beveled`, `frame.*style` — no hits matching a wooden-frame component.
- **No "Reach" function or component** in OneDrive matches the description. The Reach references in OneDrive are all the canonical pillar name (Reach replaced Range in v1.1).

**Most likely locations the wooden+brass component actually lives:**
- The **active theme code** (`C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\`) — Phase B reality material
- The **Claude.ai project files** — possibly built but never downloaded to OneDrive
- A **future build** that the user remembers as having been designed but not yet implemented

**Action item for the build queue:** locate or build the wooden-frame brass progress bar component. Most natural homes for it given the wait/malleability architecture:
- The 60-minute post-publication malleability countdown (current Private Draft Mode uses a thin gold gradient bar — could be replaced)
- The pre-reflection 8s wait
- The pre-Stage-2.5 12s wait
- The pre-publication article wait window

**Phase B reality capture will surface the answer.** If the component is in the active theme, we'll find it. If it's in Claude.ai, user-confirmable. If neither, it needs to be built (added to Phase 2 build queue).

#### Tracker Tool Discovered — `dialecta-dashboard.jsx`

User uploaded a project tracker: `Fundamentals\Progress & Forecasts\dialecta-dashboard.jsx` (90KB, 62K tokens).

**Structure (via grep):**
- Design tokens sourced from `dialecta-design-spec.html` v1.3 (per top-of-file comment + user note)
- Constants: 5 STATUSES (Complete / In Progress / Specced / Not Started / Deferred), 7 LAYERS (Foundation / Discourse / Identity / Article / Growth / Visual / Cross-Layer), 5 PHASES
- LocalStorage key: `dialecta-dashboard-v2`
- DEFAULT_ITEMS array is the source of truth — patches when statuses change permanently
- Item ID convention: `p2-9` = phase 2, item 9
- Components: StatusBadge, ItemCard (with expand/edit/changeStatus/blocked), PhaseColumn (kanban-style by phase), Modal (CRUD form)

**User direction:** This is **outdated** but worth preserving. After the audit closes, the tracker becomes a Claude Code workflow tool — Claude Code reads + writes the file directly, no localStorage round-trip. Updates to the tracker happen via patches to DEFAULT_ITEMS.

**Important note from user:** *"Token object T at the top of the file is sourced from `dialecta-design-spec.html` v1.3 — do not update from memory."* This is a constraint for any future edit session.

**Audit-relevant impact:** the dashboard's PHASES + STATUSES + LAYERS structure can be **updated post-audit** to reflect:
- The phase reframe (canonical 4-phase → 4-phase with Phase 4 deferred/possibly never)
- New layers (Stewards / Governance now first-class; Relationship Types as new layer)
- New canonical specs added during audit (Self-Snapshot Engine, Activity Rhythm View, Relationship Types)
- Updated build queue items + statuses

**Build queue addition:** *Update `dialecta-dashboard.jsx` post-audit to reflect reframed phases + new specs + accumulated build queue.*

#### Claude.ai Sync Approach (Answer to Q5)

**Q: Can we automate this? What is needed from you?**

**Honest answer: not really. Manual is the right call for this specific need.**

Three options were considered:

| Option | Setup | Risk | Recommendation |
|---|---|---|---|
| **Manual download** | Open Claude.ai → Projects → Dialecta → Files → download each → save to OneDrive `Fundamentals\` | Predictable, ~5–10 minutes for 3–5 files | **Recommended** |
| **Chrome MCP automation** | Script download flow via `mcp__Claude_in_Chrome__*` tools | Setup 15–20 minutes; depends on Claude.ai web UI selectors not changing; may hit auth challenges | Skip — setup time exceeds task time |
| **Direct download URL** | Hit a Claude.ai file URL pattern with auth headers | Probably not exposed; would require reverse-engineering | Skip |

**What's needed from you:**
1. Open `https://claude.ai/projects` → find the Dialecta project → Files tab
2. Download these (confirmed missing from OneDrive):
   - `Dialecta_Tier_Psychology.md` → place in `Fundamentals\`
   - `Dialecta_Stewards_Reflection.txt` → place in `Fundamentals\`
   - `dialecta-logo-datauri.txt` → place in `Fundamentals\`
3. **Verify before downloading** (already in OneDrive — only re-download if newer):
   - `dialecta-design-spec.html` v1.3 — open existing OneDrive copy and check for Section 12 Component Library
   - Hero logo PNG — open OneDrive `Logos\` folder and confirm `Dialecta - Hero - White.png` (or similar) matches the canonical white-on-cream multiply-blend variant

5–10 minutes. Once done, Phase B reality capture will use these as references.

**Going forward:** any new canonical doc produced in Claude.ai is downloaded immediately to OneDrive — not at periodic sync passes. This keeps the canonical store lean and current without ever needing automation.

---

### Phase A — Vision Capture: COMPLETE (2026-04-27)

All six domains read, synthesized, and captured. Phase A deliverable closed.

**By the numbers:**
- **6 domains** synthesized
- **~30 source documents** read or grepped (specs, prototypes, HTMLs, JSXs)
- **3 new canonical specs drafted** during the audit: Relationship Types, Self-Snapshot Engine, Activity Rhythm View
- **2 specs updated to v1.1**: Data Architecture (3 new entities, enum expansion), Editorial Voice + Contributor Identity (taxonomy summary)
- **15+ surgical scrubs executed**: stale tier names, retired axis names, steelman → advocate, stale phase framings, stale env var names
- **Phase plan reframed** from canonical 4-phase to functional 4-phase with Phase 4 deferred / possibly never
- **Phase 1 build queue assembled** spanning all domains + operational layer + monitoring + spec writing + code refactors

**Outstanding from Phase A:**
- User manual sync of 3 confirmed-missing files from Claude.ai (5–10 min)
- User clarification on wooden-frame brass progress bar location (or accept Phase B will find it)

### Next Phases (Choice Point)

| Phase | Description | Effort |
|---|---|---|
| **Phase B — Reality Capture** | Read every theme `src/` file + every API route + Supabase schema (live). Catalog current state by the same six domains. Surface what's actually built vs. what specs claim. | Substantial — comparable to Phase A |
| **Phase C — Coherence Map** | Per domain: cohesion verdict + drift + bloat + gap. Diagnostic only — no fixes. The output is the prioritized "what's working / what's not / what's missing" view. | Moderate |
| **Phase D — Recommendation Set** | Findings split four ways (spec-update / build-fix / spec-was-wrong / build-extension). Filtered through Phase 1/2 launch lens. Plus the end-of-audit deliverable (Stack Pull Potential vs Full Scale Solution Forecast). | Moderate |
| **Phase E — Execution** | Per-item changes after explicit greenlight. Build queue execution. | Open-ended |

**Decision point for the user:** continue immediately into Phase B (substantial new reading session), or pause Phase A as a complete deliverable and resume later. The Phase A audit document is the durable artifact — it stands on its own and can be executed against without continuing.

---

*Phase A closed 2026-04-27.*

---

## Phase B — Reality Capture (in progress, started 2026-04-27)

Reading every theme `src/` file + every API route + the live Supabase schema. Cataloging what's actually built vs. what Phase A specs claim, by the same six domains.

### Domain 1: Foundation (theme shell, page templates, sitewide bundle entry, build config)

**Files read so far:**
- `package.json` — already in context from setup phase, no change
- `default.hbs` — sitewide shell (74 lines)
- `index.hbs` — article list (44 lines)
- `post.hbs` — single article (101 lines)
- `page-profile.hbs` — profile page (16 lines, minimal)
- `src/index.jsx` — sitewide bundle entry (332 lines)

**Files pending in this domain:**
- `page-about.hbs`, `page-fingerprint.hbs`, `page-guidebook.hbs` (sizes unknown — read next)
- `page-pact.hbs` (26K tokens — likely needs grep)
- `page-stewards.hbs` (202K tokens — likely needs grep)

#### What's actually built (Foundation reality)

**Theme shell (`default.hbs`):**
- ✅ Two-bar nav matching spec: 52px logo bar + sub-nav. Logo from `{{@site.logo}}` (Ghost-managed). Member area with computed initials, sign-in/join links for non-members.
- ✅ Settings hamburger button revealed by `window.__dialectaOpenSettings?.()` global function — bridge from vanilla JS to React profile component. Works, but uses global window pollution pattern.
- ✅ Logged-in members redirected from `/` to `/profile/` — nav-level routing decision, not in any spec doc but architecturally sound.
- ✅ Sitewide `bundle.js` loaded at end of body (matches spec).
- Minor: vanilla JS computes initials (no React dependency for nav), reasonable choice.

**Article list (`index.hbs`):**
- ✅ Standard Ghost post-feed loop with type:post filter
- ✅ `data-topic-slug` on tag (for topic color rendering — feeds the canonical TOPICS map in index.jsx)
- ✅ Non-member CTA at bottom in Editorial Voice register: *"Ideas are the protagonist. Join the conversation — classify arguments, map your position, track how your thinking evolves."*
- 🚨 Has `id="dialecta-forum-rate-{id}"` placeholder per post — **mount point exists, bundle.js does NOT mount anything to it.**

**Article page (`post.hbs`):** Has **FIVE React mount points** for the Discourse Layer:
1. `#dialecta-tier-badge` — tier badge for post classification
2. `#dialecta-declaration` — Declaration Strip (Article Editorial Template implementation)
3. `#dialecta-comments` — comments / Discourse Layer
4. `#dialecta-sidebar` — opinion map + community stats + delta panel
5. `.post-meta-initials` — computed by inline vanilla JS (works)

**🚨 NONE of the article-page React mount points are mounted by `bundle.js`.** `mountAll()` in src/index.jsx only mounts: `#dialecta-root` (no-op stub), `#dialecta-profile-root`, `#fp-hero-root`, `[data-fp-axes]`. **The article page renders empty placeholder divs where the entire Discourse Layer should appear.** This is the Phase 1/Phase 2 build gap — the placeholders are correctly staged in the template but the React components are not built or wired.

**Profile page (`page-profile.hbs`):**
- ✅ Clean, minimal mount pattern. Sign-in gate for non-members. Mount root with all member data passed through data attributes. Matches spec exactly.

**Sitewide bundle entry (`src/index.jsx`):**

| What it does | Status |
|---|---|
| Imports Fingerprint engine, profile components, data hooks, edit panel, settings drawer | ✅ Comprehensive composition |
| `GHOST_API_KEY = 'YOUR_CONTENT_API_KEY'` (line 11) | 🚨 **PLACEHOLDER. Not set. Live Feed cannot fetch posts.** |
| `GHOST_API_URL = 'https://dialecta.mymagic.page/ghost/api/content'` | ✅ Production URL set |
| TOPICS constant (lines 14–28) | ✅ **Canonical 12-topic v2 set, fully correct.** |
| `useGhostPosts(limit)` hook | ✅ Fetches recent posts, shapes to LiveFeedItem format. Falls back gracefully when API key missing (warns to console, returns empty). |
| `shapePostsToFeed` mapper | ✅ Sets `forumPct: null` until classification pipeline has data — graceful "New" state for unclassified posts. |
| HERO_PROFILES (Maya / Wen / Anselm) | 🚨 **Use OLD axis names** (`specificity`, `charity`, `originality`) **and OLD 9-topic taxonomy** (`theology`, `mental_health`, `political_science`, `music`, `acoustics`, `humanity`) in their topicPhases data. |
| `ProfileRoot` component | ✅ Composes `useProfileData` + `useGhostPosts` + DialectaProfileResponsive + EditProfilePanel + SettingsDrawer. Live feed posts passed as prop. |
| `mountAll()` mounts: `#dialecta-root`, `#dialecta-profile-root`, `#fp-hero-root`, `[data-fp-axes]` | ✅ for what's mounted; 🚨 **does NOT mount any of the post.hbs Discourse Layer placeholders OR the index.hbs forum-rate placeholders.** |

#### Critical Findings (Phase B Domain 1)

1. ~~**🚨 LAUNCH BLOCKER: `GHOST_API_KEY` is the placeholder string `'YOUR_CONTENT_API_KEY'`.**~~ ✅ **RESOLVED 2026-04-27.** User pulled key from Ghost Admin, updated `src/index.jsx` line 11, ran `npm run build`, ZIP-deployed to Magic Pages. Live Feed now pulling real articles. Original Codebase Audit Brief condition #2 (*"Ghost Content API key set and Live Feed pulling real articles"*) is met.

2. **🚨 LAUNCH BLOCKER: Discourse Layer not mounted.** `post.hbs` has correctly-staged React mount points for tier badge, declaration strip, comments, and sidebar (opinion map + delta panel). `bundle.js` does not mount React into any of them. The article page renders empty placeholder divs. **The entire Discourse Layer (the platform's operational core) is not yet wired into the live theme.** This is the largest chunk of Phase 2 build work surfaced by the audit.

3. **🚨 Split staleness in `src/index.jsx`.** The same file uses canonical 12-topic v2 in the top-level TOPICS map (✅) AND old 9-topic taxonomy + retired axis names in the HERO_PROFILES data (🚨). This is direct evidence that the canonical Fingerprint engine still accepts the old axis names. **Confirms the engine refactor (Growth Scroll Domain 5 finding) is across-the-board pending: the engine + every consumer needs the v2.0.0 sync.**

4. **Profile page is fully built and live.** ProfileRoot composes data hooks, profile body, edit panel, settings drawer. Loading + error states implemented. Live feed posts passed in. Settings hamburger reveal/hide tied to profile mount/unmount. This is the most complete domain-coverage in the build.

5. **The Settings/Edit panel pattern works but uses global window pollution.** `window.__dialectaOpenSettings = () => setShowSettings(true)` is a bridge from default.hbs vanilla JS to ProfileRoot React state. Functional but not idiomatic. Could be refactored later but not Phase 1 critical.

6. **Identity Events feed substrate is in place.** ProfileRoot passes `liveFeedPosts` to DialectaProfileResponsive — the profile page already renders Ghost posts (subject to API key being set). This is the Feed Stub from Domain 3 user direction, already wired.

7. **Editorial Voice intact in feed-join CTA.** *"Ideas are the protagonist. Join the conversation — classify arguments, map your position, track how your thinking evolves."* Matches Editorial Voice register.

#### Phase 2 Build Queue Items Surfaced by Domain 1 Foundation

| # | Item | Effort estimate |
|---|---|---|
| 1 | Set `GHOST_API_KEY` from Ghost Admin → bundle rebuild → deploy | ~10 min |
| 2 | Build + mount **Discourse Comments component** at `#dialecta-comments` | Substantial — the comment composition flow Private Draft Mode prototypes |
| 3 | Build + mount **Tier Badge component** at `#dialecta-tier-badge` | Small — display-only |
| 4 | Build + mount **Declaration Strip component** at `#dialecta-declaration` | Medium — shows author Declaration Layer fields |
| 5 | Build + mount **Sidebar component** at `#dialecta-sidebar` (opinion map + community stats + delta panel) | Substantial — composes Cartesian/Ternary plot + Delta capture |
| 6 | Build + mount **Forum Rate component** at `#dialecta-forum-rate-{id}` (article list cards) | Small — display-only |
| 7 | Engine refactor: bump `dialecta-fingerprint-engine.jsx` to v2.0.0 with canonical 6-pillar names + 12-topic v2 taxonomy | Medium — coordinated update + all consumers |
| 8 | HERO_PROFILES data refactor in `src/index.jsx` to canonical axis + topic names | Small — coordinated with #7 |
| 9 | Phase B Domain 1 follow-ups: read remaining `page-*.hbs` files | (audit work) |

---

#### Additional Domain 1 Reads (2026-04-27)

**`page-about.hbs` (438 lines):**
- ✅ Beautifully written user-facing implementation of the founding philosophy
- ✅ Uses canonical CSS variables (`--max-width`, `--font-mono`, `--gold`, `--amber`, `--text-primary`, etc.) — refers to a centralized `style.css` (Phase B Domain 4 will read it)
- ✅ Editorial Voice register intact throughout — *"Ideas are the protagonist"*, *"Excellence as invitation, never as gatekeeping"*, *"The door is open"*
- ✅ Sections: Hero / The Problem / The Wager / Three Threads / The Balance / Builder Note (signed *"Daniel Pennington, Founder"*) / CTA
- **Notable adaptation:** the Three Threads in page-about are labeled **Post-Scarcity / Relationism / Formation** (not "Spiritual"). Deliberate user-facing softening — keeps the load-bearing concept while removing potentially-charged language. Worth confirming this is intentional or whether it should be aligned to Founding Philosophy's "Spiritual" framing.
- Pull-quote attribution: *"Dialecta Founding Philosophy"* — explicitly cites the canonical doc. ✅ Good practice.
- CTA links to `/pact/` and `/stewards/` — both pages exist.

**`page-fingerprint.hbs` (272 lines):**
- Marketing/explanation page for the Thinking Fingerprint
- Uses static PNG images for stages and archetypes: `fp-stage-newborn.png`, `fp-stage-early.png`, `fp-stage-emerging.png`, `fp-stage-mature.png`, `fp-arch-specialist.png`, `fp-arch-generalist.png`, `fp-arch-advocate.png`, `fp-arch-reviser.png`, `fp-texture-calm.png`, `fp-texture-turbulent.png`
- React mount: `<div id="fp-hero-root">` ✅ matches `mountAll()` in `src/index.jsx`
- **🚨 USES NON-CANONICAL ARCHETYPE NAMES** (line 207–235): "The **Specialist**" and "The **Generalist**" — neither is in the canonical eight-archetype set (Skeptic / Synthesizer / Advocate / Builder / Empiricist / Contextualist / Illuminator / Reviser). The page also shows Advocate ✅ and Reviser ✅ as canonical, but Specialist and Generalist are retired-or-never-existed names. This is the same class of issue as the "Challenger" find from Domain 3 Phase A.
- **🚨 USES OLD AXIS NAMES** in copy: *"Specificity reaches the rim"* (line 211), *"heavy Calibration and Charity"* (line 227), *"Discourse trades against Calibration and Charity"* (line 202), *"Specificity trades against Originality and Discourse"* (line 202).
- **🚨 USES "STEELMANS" VERB**: *"Steelmans opposing views"* (line 227, Advocate description).
- Static PNG assets exist as artifacts of when the engine was at v1.0.0 with old axis names; would need regeneration when engine bumps to v2.0.0.

**🚨 `src/dialecta-fingerprint-engine.jsx` — CONFIRMED uses OLD axis names** (grep'd structure, full file too large for direct read):
- Line 62: `{ key: "specificity", label: "Specificity", pair: "Substance" ...`
- Line 68: `{ key: "charity", label: "Charity", pair: "Intellectual Honesty" ...`
- Line 77: `{ key: "originality", label: "Originality", pair: "Substance" ...`
- Line 145–148: TRADEOFF_PAIRS reference old axis names
- **The canonical Fingerprint engine is at v1.0.0 with the retired axis vocabulary. The v2.0.0 refactor (Phase A Domain 5 finding) is across-the-board pending and affects:**
  - The engine source itself (`dialecta-fingerprint-engine.jsx`)
  - The inline copy in Growth Scroll v5 (`Growth Layer\dialecta-growth-scroll-v5.jsx`)
  - HERO_PROFILES data in `src/index.jsx`
  - The static PNG asset library (`fp-stage-*.png`, `fp-arch-*.png`, `fp-texture-*.png`)
  - The page-fingerprint.hbs marketing copy
  - Likely the profile components too (`dialecta-profile.jsx`, `dialecta-profile-mobile.jsx` — Domain 2 will confirm)

**`page-pact.hbs` (structure via grep):**
- ✅ 8 sections (I–VIII): The Wager, The Classification, The Process, **The Wait Architecture**, The Deeper Purpose, Learn by Doing, The Commitment
- ✅ Section III: All 7 canonical tier names rendered (Forum, Spark, Echo, Fog, Heat, **Stance**, **Breach**) — confirms Pact leads the spec docs we just fixed in Domain 3
- ✅ Section IV: 4-stage process (I, II, II.5, III) — symmetric stage flow as spec'd
- ✅ Section VII: 3-comment classification quiz — matches Project Brief description
- 🚨 **MAJOR FINDING: Section V is titled "The Wait Architecture — Slowness is a feature."** The Wait Architecture spec the audit flagged as MISSING in Phase A Domain 6 (referenced in Article Editorial Template line 127 but never written) **DOES exist as user-facing copy in the Pact.** The platform's user-facing commitment to wait windows is documented; only the operational/numerical spec doc is missing.

#### Critical Findings (Phase B Domain 1 — Updated)

8. **🚨 The wooden-frame brass progress bar mystery may resolve in Phase B Domain 4** (when style.css is read) **or in page-pact.hbs Section V detail.** The Pact's "Wait Architecture" section is the most likely UI surface for a progress-bar component. Worth a targeted grep on page-pact.hbs for progress-bar markup. *(Adding to next read batch.)*

9. **🚨 The "Wait Architecture" user-facing copy exists; the operational spec does not.** Phase 1 build queue item already captures the spec gap. Now we know the user-facing commitment is in production language already (Pact Section V). Spec writing has user-facing source material to align against.

10. **🚨 Non-canonical archetypes in page-fingerprint.hbs**: Specialist + Generalist need to be replaced with two of the canonical eight. Likely substitutions based on description content:
    - "**Specialist** (theoretical acoustician, all-in on one dimension)" → **Empiricist** (closest match — Acuity-maxed, evidence-grounded)
    - "**Generalist** (balanced across every axis at moderate values)" → likely **Synthesizer** OR a "pattern still forming" treatment. Worth user input.

11. **Static PNG fingerprint assets** (`fp-stage-*.png`, `fp-arch-*.png`, `fp-texture-*.png`) need regeneration when engine refactors to v2.0.0 with canonical axis names. They visually depict fingerprints rendered with old axis configurations. New PNGs needed for the refactor.

#### Phase 2 Build Queue — Updated After Additional Domain 1 Reads

| # | Item | Effort |
|---|---|---|
| 10 | Replace non-canonical archetype names in `page-fingerprint.hbs` (Specialist + Generalist → canonical) | Small surgical edit (after user confirms substitutions) |
| 11 | Scrub old axis names + "steelmans" verb from `page-fingerprint.hbs` | Small surgical edit |
| 12 | Regenerate static fingerprint PNG library after engine v2.0.0 refactor | Medium — design + render task |
| 13 | Confirm "Three Threads" in `page-about.hbs` should stay "Formation" or align to "Spiritual" | User decision |
| 14 | Cross-reference Pact Section V wording into the new Wait Architecture spec when written | Small |

---

### Domain 2: Contributor Identity & Fingerprint (active profile components + engine)

**Files read so far:**
- `src/dialecta-profile-mount.jsx` (170 lines — orphaned profile entry)
- `src/dialecta-profile-data.js` (180 lines — data layer; the architectural keystone)
- `src/dialecta-profile-responsive.jsx` (already in context from Phase A — matches active build)
- `src/dialecta-fingerprint-engine.jsx` (grep'd — confirmed v1.0.0 with old axis names)

**Files pending:**
- `src/dialecta-profile.jsx` (~192KB — too large; will grep)
- `src/dialecta-profile-mobile.jsx` (~192KB — too large; will grep)
- `src/dialecta-profile-edit.jsx` (~10KB)
- `src/dialecta-profile-settings.jsx` (~10KB)

#### 🚨 ARCHITECTURAL FINDING #1: `dialecta-profile-mount.jsx` is orphaned

The file exists, the package.json builds it to `profile.js`, but **`profile.js` is never loaded by any active `.hbs` template.**

Evidence:
- `package.json` builds `src/dialecta-profile-mount.jsx → assets/js/profile.js`
- `default.hbs` loads only `bundle.js` (sitewide)
- `page-profile.hbs` has no `<script src="...profile.js">` tag
- The `dialecta-profile-mount.jsx` file's own header comment claims it expects `<div id="dialecta-profile-root" data-user='{{member-profile-json}}'></div>` — **but the actual `page-profile.hbs` uses `data-member-id` / `data-member-name` / `data-member-email` / etc.**, not `data-user`. The two are out of sync.
- **The active profile mount path is**: `bundle.js` → `src/index.jsx` → `mountAll()` → finds `#dialecta-profile-root` → builds ghostMember from `data-member-*` attributes → renders `ProfileRoot`

**Implication:** `dialecta-profile-mount.jsx` is a stale alternate mount approach that never made it into production. **`profile.js` build target is dead output.** Two cleanup options:
- (a) Remove `dialecta-profile-mount.jsx` + `build:profile` + `watch:profile` from `package.json` + remove `profile.js` from `assets/js/`
- (b) Reconcile the two mount approaches (decide which is canonical, retire the other)

This is the same class of issue as the Stewards/profile-bootstrap drift from environment setup — duplicate code paths invite silent divergence.

#### 🚨🚨🚨 ARCHITECTURAL FINDING #2: `dialecta-profile-data.js` contains the explicit canonical-vs-legacy axis name mapping

`mergeProfileWithGhost` (lines 103–129) has this explicit comment block:

```
// Map Supabase axis names (new) to component axis names (legacy).
// Fingerprint engine expects: specificity, calibration, charity,
// discourse, consistency, originality.
// Supabase axis_scores has: acuity, calibration, magnanimity,
// discourse, consistency, reach.
```

Followed by a 6-row mapping table that translates canonical Supabase fields into legacy engine field names. **This is THE mapping that makes the entire system work despite the engine being at v1.0.0 with retired axis names.**

The architectural state of the axis-name staleness is now fully understood:

| Layer | Axis names | Status |
|---|---|---|
| Supabase schema | acuity / calibration / magnanimity / discourse / consistency / reach | ✅ CANONICAL |
| API routes (returns axis_scores object) | acuity / calibration / magnanimity / discourse / consistency / reach | ✅ CANONICAL |
| `dialecta-profile-data.js` (`mergeProfileWithGhost`) | Translates canonical → legacy | 🚨 TECHNICAL DEBT BRIDGE |
| `dialecta-fingerprint-engine.jsx` v1.0.0 | specificity / calibration / charity / discourse / consistency / originality | 🚨 LEGACY |
| Engine consumers (Growth Scroll v5 inline engine, HERO_PROFILES in index.jsx, page-fingerprint.hbs static PNGs, profile components) | All use legacy engine vocabulary | 🚨 LEGACY |

**The Phase 2 engine v2.0.0 refactor is fully scoped now:**
1. Rename engine keys: specificity→acuity, charity→magnanimity, originality→reach
2. Remove the canonical→legacy mapping in `mergeProfileWithGhost` (becomes 1:1 pass-through)
3. Rename HERO_PROFILES keys in `src/index.jsx`
4. Rename keys in Growth Scroll v5 inline engine + mock data
5. Rename keys in profile components (`dialecta-profile.jsx`, `dialecta-profile-mobile.jsx` — confirm in pending reads)
6. Regenerate static PNG assets in `assets/png/` (`fp-stage-*.png`, `fp-arch-*.png`, `fp-texture-*.png`) with v2.0.0 axis labels
7. Scrub user-facing copy in `page-fingerprint.hbs` (Specificity/Charity/Originality references in archetype + texture descriptions)

#### 🚨 ARCHITECTURAL FINDING #3: tier_mix and topicPhases NOT wired to axis_events

Comment in `mergeProfileWithGhost` (lines 108–109): *"tier_mix and topicPhases require axis_events query — not yet fetched. **All rings will render as seed state until that is wired up.**"*

**Implication for live profiles:** The Fingerprint can only show graduation counts (petal length) but cannot show:
- Tier-mix texture (smooth vs. wave-textured rings showing Forum vs Heat history)
- Topic-phase coloring (which topics each ring represents)

So live contributor fingerprints render as gold-petaled seed shapes only — the rich texture and topic coloring that makes the Fingerprint visually meaningful are absent until the `axis_events` query is added. **HERO_PROFILES on the fingerprint marketing page show full data because they're hardcoded mock; real profiles show seed-state.**

This is a meaningful Phase 2 build gap. The API repo Phase B reads will tell us if the `/api/profile/:id` route is set up to query axis_events or only axis_scores.

#### Profile Data Shape — What's wired vs placeholder

`mergeProfileWithGhost` returns a comprehensive USER object. Status of each field:

| Field | Source | Status |
|---|---|---|
| `name`, `handle`, `initials`, `avatarUrl` | Ghost member + Supabase profile | ✅ Wired |
| `bio`, `location`, `joined` | Ghost / Supabase | ✅ Wired |
| `archetype` | Supabase | ✅ Wired with "Pattern Still Forming" fallback |
| `aspirational` | — | ⚠️ Hardcoded `null` — Growth Layer not yet wired |
| `resonance` | — | ⚠️ Hardcoded `0` — fingerprint halo computation not wired |
| `fingerprint` (per-axis graduation counts) | Supabase axis_scores | ✅ Wired (graduations only) |
| `fingerprint` tier_mix + topicPhases | — | 🚨 Empty — axis_events query not wired |
| `totals` (comments, articlesEngaged, nominatedUp/Down) | Supabase stats | ✅ Wired |
| `tierCounts`, `tierBreakdown`, `forumPct` | Supabase stats | ✅ Wired |
| `connections.readers`/`sources`/`correspondents`/`sparringPartners` | — | ⚠️ Hardcoded `0` — Relationship Types not yet wired (but the schema slots are anticipated! ✅) |
| `sparringPartners` (array) | — | ⚠️ Hardcoded `[]` |
| `authorStats` | — | ⚠️ Hardcoded zeros for authors, null for non-authors |
| `influences`, `fieldNotes`, `recentArticles` | — | ⚠️ Hardcoded `[]` |

**Good news:** the data shape ANTICIPATES Relationship Types (`connections.readers`/`sources`/`correspondents`/`sparringPartners` are already in the contract). The four-type relationship model we drafted in Phase A Domain 3 is already plumbed at the data shape level, just not wired to a real source. ✅ Confirms the Relationship Types spec was a good catch — the build was already anticipating this need.

#### Wooden-Frame Brass Progress Bar Hunt — Update

Pact grep results: `.brass` button class confirmed at line 747; no progress bar markup found in page-pact.hbs. The Wait Architecture section (V) at line 1130 references *"Every timer in this system is the platform saying: this thought is..."* but no progress-bar UI element is present in the active Pact page.

Other places to check:
- Active theme `style.css` (Phase B Domain 4 read)
- Profile components (`dialecta-profile.jsx`/`-mobile.jsx`/`-edit.jsx`/`-settings.jsx` — Domain 2 pending reads)
- Stewards page (grep run; no progress bar found in structure scan, but full file too large)
- API CSS or other CSS files in the theme

Best hypothesis: **the wooden-frame brass progress bar was designed and prototyped but never made it into the active theme.** Likely lives in a session-prototype JSX in OneDrive or Claude.ai project files that we haven't located yet. **Worth adding to the build queue as "find or build the wooden-brass progress bar component for the wait architecture UI."**

**User update (2026-04-27):** *"The brass/wood bar was built in the Comment UX. I will try to dig it up."* — Component lives in a Comment UX prototype, user is locating the source file. Once found, it can be ported into the Discourse Layer build (specifically the comment composition flow's wait/malleability UI surface).

**User update #2 (2026-04-27):** Files identified as `dialecta-s01-reflection-bar` (Session 1 reflection bar prototype) and `dialecta-s11-private-draft-mode.jsx` (Session 11 Private Draft Mode — the session-prefixed original of the OneDrive copy). **Neither is in OneDrive Dialecta or the active theme.** The OneDrive root has `Dialecta-Private-Draft-Mode.jsx` (no `s11` prefix) which is a **different/simpler iteration** — grep confirms it does not contain wood/frame/bezel/grain markup. Both files live exclusively in Claude.ai project files.

**Both files added to Claude.ai → OneDrive sync candidate list:**
- `dialecta-s01-reflection-bar` (filename extension unknown — likely `.jsx`) → likely place in `Fundamentals\` or a new `Sessions\` subfolder
- `dialecta-s11-private-draft-mode.jsx` → place alongside or replace `Dialecta-Private-Draft-Mode.jsx` (decide which is canonical)

Once synced, the wooden-frame brass progress bar component can be located, documented, and added to Phase 2 build queue as the canonical wait-architecture UI element for the Discourse Layer.

**User update #3 (2026-04-27):** User uploaded `dialecta-s11-private-draft-mode.jsx` to a new `Private Draft Mode\` folder at OneDrive root. **Bonus discovery:** the s01 reflection bar is **inlined into s11** at lines 293–476 (`// REFLECTION BAR — inlined from dialecta-s01-reflection-bar.jsx`) — so syncing s11 effectively delivered both files. The standalone s01 file remains a Claude.ai sync candidate but is no longer blocking Phase 2.

#### Comprehensive Claude.ai → OneDrive Sync — COMPLETE (2026-04-27)

After the original 3-file Tier 1 sync, the user shared the full Claude.ai project file inventory which surfaced 5 additional canonical files missing from OneDrive. All 5 successfully synced via paste-and-write workflow. Total of 8 files now synced.

**Files synced this session:**

| # | File | Location | Audit-relevant findings |
|---|---|---|---|
| 1 | `Dialecta_Tier_Psychology.md` v1.1 | `Fundamentals\` | Confirms tier-name rationale (Static→Stance, Off-the-Air→Breach); **explicitly mandates custom SVG icons over emojis**; has full visual identity section (brightness ladder, 7 icon descriptions); references "Design Specification (Letterpress)" subtitle |
| 2 | `Dialecta_Stewards_Reflection.txt` | `Fundamentals\` | Confirms Stewards recognition algorithm (no application, observed-pattern based); locks literary vocabulary (Pact, Forum, Charter, Order, Steward); explains Satirist's role as proof-of-principle |
| 3 | `dialecta-logo-datauri.txt` | `Fundamentals\` | 182KB base64 PNG. Required for inline embedding in nav-bearing components. Resolves logo placeholder note in Private Draft Mode |
| 4 | `Social_Media__Human_Behavior__and_the_Rewiring_of_Society.md` | `Fundamentals\` | The original source essay (10 sections, Daniel Pennington 2026). Anchors the entire founding thesis. Founding Philosophy doc absorbs and applies this argument; this is the original |
| 5 | `dialecta-discourse-layer.jsx` | `Fundamentals\` | **HIGH-VALUE — 693-line canonical Discourse Layer prototype.** Fully canonical: uses Stance/Breach, has full 3-stage flow, TierBadge/SpecDots/VoteControl/NominationPanel/CommentCard/ComposeFlow/DistributionBar/ControlBar all built. Reference implementation for Phase 2 build of the unmounted post.hbs placeholders |
| 6 | `Dialecta_Discourse_Layer_UX.md` v1.0 | `Fundamentals\` | Companion spec to the JSX. Locks 6 design decisions including amber-vs-terra surface convention (engine voice vs community voice). Lists 5 deferred items |
| 7 | `dialecta-profile-ghost-integration.md` | `Fundamentals\` | **CRITICAL FINDING:** explicitly identifies BOTH "Diplomat" AND "Oracle" as legacy archetypes that exist in desktop ARCHETYPES list but were replaced by Advocate + Reviser in mobile. Provides 4-file Ghost theme integration architecture (partial, profile.hbs, helper, bundle) |
| 8 | `dialecta-fingerprint-engine.jsx` (canonical) | `Fundamentals\` | **Definitive finding:** `ENGINE_VERSION = "1.0.0"` confirmed; uses retired axis keys `specificity / charity / originality` throughout. **Engine v2.0.0 refactor work has not started anywhere.** Matches active theme copy. |

#### 🚨 NEW Phase B Findings From Synced Materials

1. **Two non-canonical archetypes, not one.** Phase B Domain 2 identified "Diplomat" in `dialecta-profile.jsx` line 771. The synced ghost-integration doc reveals "Oracle" is also stale in the desktop file (mobile uses Advocate + Reviser, desktop uses Diplomat + Oracle). **Coordinated archetype-name scrub in desktop file is now scoped: Diplomat → Advocate, Oracle → Reviser.**

2. **Original mount pattern documented.** The orphaned `dialecta-profile-mount.jsx` we found in Phase B Domain 2 traces back to the ghost-integration doc's `data-user='{{member-profile-json}}'` JSON-blob pattern. The active build evolved past this to `data-member-*` attributes + separate `/api/profile/:id` fetch via `useProfileData` hook. **The active build approach is architecturally cleaner** — the orphaned mount file should be retired (already on Phase 2 cleanup list).

3. **Design Spec v1.3 doc may be out of sync with Palette A decision.** Per ghost-integration doc Section 2: spec doc may still show Palette B (`#d4a84a` / `#e8a830`) for gold tokens; canonical decision is Palette A (`#b8862e` / `#d4a84a`). Profile JSX files use Palette A correctly. **Verify when Design Spec v1.3 is opened in next Phase B Domain 4 read.**

4. **Discourse Layer build de-risked.** The canonical prototype (`dialecta-discourse-layer.jsx`) plus the canonical UX spec (`Dialecta_Discourse_Layer_UX.md`) together fully define the Phase 2 Discourse Layer build. Phase 2 work becomes "port and wire" rather than "design and build."

5. **Engine v2.0.0 refactor scope confirmed.** Canonical engine still at v1.0.0; all consumers downstream of engine use the matching legacy vocabulary. The Phase 2 engine refactor is across-the-board: engine + all consumers get bumped together. Estimated work: medium (mechanical rename plus regenerate static PNG asset library + scrub user-facing copy in page-fingerprint.hbs).

6. **Custom SVG icon library required.** Per Tier Psychology spec: emojis must be replaced with 7 custom SVG icons (Roman columns / lightning bolt / circular arrows / fluffy cloud / single flame / planted pennant / broken chain links). Active build uses emojis throughout. **New Phase 2 build queue item: design + export the 7 SVG tier icons.**

7. **The "stash" `New folder\` in Fundamentals** (created 2026-04-27 01:24) — likely accidental Windows Explorer artifact during the upload session. Worth deleting after audit closes.

#### Cumulative Audit Status After Sync

**Phase A (Vision Capture):** Closed 2026-04-26 with 6 domains, 30+ source documents, 3 new canonical specs drafted, 15+ surgical edits, phase plan reframed.

**Phase B (Reality Capture):** Substantially advanced. Domain 1 (Foundation) and Domain 2 (Contributor Identity) reads + analysis complete. Domain 3 (API/Discourse) reads complete. Discourse Layer canonical references now in OneDrive. Engine status definitively confirmed.

**Sync Operations:** Complete. 8 files synced from Claude.ai → OneDrive. No further sync work pending; ongoing per-doc sync is the user's standard operating mode going forward.

**Phase B Remaining:** Domain 4 (Supabase live schema check via MCP), Domain 5 (Growth Layer code, mostly absent in active build), Domain 6 (Article + Pact + Stewards live in active theme) still need reads. Then Phase C (coherence map), D (recommendations), E (execution).

**s11 version history finding:** File header declares *"DIALECTA — SESSION 11 · PRIVATE DRAFT MODE (Design Spec v2 rebuild)"* — built against `dialecta-design-spec-v2.html` with sections §01–§12. The §01–§12 section structure matches what Project Index calls v1.3 (Section 12 Component Library). Likely the early `v2` naming was renamed to `v1.3` when finalized — the s11 prototype precedes the rename.

**🚨 The s11 Private Draft Mode is materially different from `Dialecta-Private-Draft-Mode.jsx` (OneDrive root):**
- s11 has the wooden-frame brass progress bar (Reflection Bar component, ~180 lines)
- OneDrive root version has only thin gold gradient malleability bar (~5 lines)
- s11 uses Design Spec v2 token names (`bgPage`/`bgCard` etc.); OneDrive root version uses earlier v1.1 token naming
- s11 is more recent and more complete

**Recommendation:** s11 becomes the canonical Comment Composition prototype reference. The OneDrive root `Dialecta-Private-Draft-Mode.jsx` is superseded — can be retired or archived.

#### 🛠️ Standalone Component Extracted: WoodFrameProgressBar

User direction: *"We need to pull that progress bar and build it as a standalone React function."*

**Built and saved at:** `Fundamentals\Components\WoodFrameProgressBar.jsx` (~165 lines including comprehensive doc header)

**Component design:**
- Self-contained: injects its own `dialecta-shim` keyframe on first mount (idempotent across instances)
- Three props: `progress` (0–1, clamped), `remainingSeconds` (optional countdown), `label` (default "Analysis"), `fontMono` (typeface override)
- Default export + named export
- Documented with full provenance, design intent (the three founding goals of wait architecture), color palette commentary, and use cases for all three Discourse Layer wait surfaces (8s pre-reflection / 12s pre-Stage-2.5 / 60min malleability)

**Three intended uses (per user direction):**
1. 8-second pre-reflection wait (commenter side)
2. 12-second pre-Stage-2.5 activation wait (commenter side)
3. 60-minute post-publication malleability countdown (commenter side)
4. Article-side longer wait window (author side)

**Phase 2 build action:** when Discourse Layer Comments component is built, import this file (or copy it into `src/`) and use for all four wait surfaces.

**Phase D recommendation:** add a `Fundamentals\Components\` README documenting the canonical-component pattern (when prototypes inline a component vs when they reference a standalone) and which other components should be promoted to standalones (likely the Fingerprint engine, the TierBadge, the SectionLabel, the Card primitive).

#### Stewards Page Structure (active theme, via grep)

`page-stewards.hbs` confirmed sections:
- Opening
- **The trust between writer and reader** (#trust)
- **Cadence — the rhythm of contribution** (#cadence) — six cadence types: Daily / Serial / Periodical / Quarterly / Occasional / Magnum Opus
- **The Orders** (#orders) — first family confirmed: **Essayistic** with The Essayist, The Aphorist, The Memoirist, and likely more

Active page contains the spec'd Stewards content per Project Index inventory. ✅ Stewards page is built and live in the theme.

#### Phase 2 Build Queue — Updated After Domain 2 Partial

| # | Item |
|---|---|
| 15 | Engine v2.0.0 refactor — full scope now defined (7 sub-steps documented above) |
| 16 | Wire axis_events query into `/api/profile/:id` so tier_mix and topicPhases populate (live fingerprints render with full texture + topic color, not seed-state) |
| 17 | Wire Relationship Types data — populate `connections.readers/sources/correspondents/sparringPartners` from new tables |
| 18 | Wire Aspiration Tool data — populate `aspirational` field from aspirations table |
| 19 | Compute fingerprint resonance from real data — populate `resonance` field |
| 20 | Decide: retire `dialecta-profile-mount.jsx` + `profile.js` build target, OR reconcile against `index.jsx` ProfileRoot |
| 21 | Find or build the wooden-frame brass progress bar component for wait architecture UI |

---

#### Additional Domain 2 Reads (2026-04-27)

**`src/dialecta-profile-edit.jsx` (366 lines):**
- ✅ Clean inline edit panel: display name, bio, avatar URL, location
- ✅ Canonical design tokens (Cormorant Garamond, DM Sans, DM Mono, Source Serif 4; amber/gold/cream)
- ✅ Calls `updateProfile` from data.js → PATCH `/api/profile/:id`
- Modal overlay with proper z-index, AvatarPreview component, Field component with hint text
- Editorial Voice register intact (*"Changes apply to your Dialecta profile. Your Ghost account name remains separate."*)

**`src/dialecta-profile-settings.jsx` (323 lines):**
- ✅ Right-slide drawer with backdrop, header (avatar+name+handle), footer (*"Dialecta · Ideas are the protagonist"*)
- Three sections: Profile / Preferences / Account
- ✅ Edit Profile row → wired to `onEditProfile` callback (live)
- ✅ Sign Out row → wired to `/ghost/#/signout` (live)
- 🚨 **5 of 7 settings rows are DISABLED placeholders labeled "Soon":**
  - Aspirational Archetype (Growth Layer setter not wired)
  - Appearance (light/dark/system)
  - Notifications (comments, nominations, milestones)
  - Privacy (what others can see on your profile)
  - Email & Subscription
- The Aspirational Archetype "Soon" placeholder confirms the Growth Layer's Aspiration Tool is not yet wired into the active build — already on the Phase 2 build queue.

**`src/dialecta-profile.jsx` (grep'd structure — full file ~192KB):**
- 🚨 Engine vocabulary throughout: `key: "specificity"` (line 63), `key: "charity"` (line 69), `key: "originality"` (line 78). **Matches the engine v1.0.0 legacy vocabulary.** Component is downstream of the engine; will refactor when engine bumps to v2.0.0.
- 🚨 **NEW finding — non-canonical archetype "Diplomat":** Line 771: `archetype: { id: "diplomat", label: "The Diplomat", note: "Assigned by the platform based on your engagement patterns." }`. **Diplomat is not in the canonical eight-archetype set.** This is the THIRD non-canonical archetype name surfaced (after Challenger in Phase A Domain 3 and Specialist+Generalist in page-fingerprint.hbs). Likely also in the mock USER object the component uses for development.
- ✅ TIERS const uses canonical tier names (forum / spark / echo / fog / heat / stance / breach) — line 53–60
- ✅ Line 1037: tier order is canonical
- ✅ Line 836: tierBreakdown uses canonical names
- ✅ Line 722 references "Empiricist" archetype guidance (canonical)
- The Aspirational Archetype hover-reveal selection grid exists at lines ~1293–1481 (the comment block confirms: *"The currently-assigned archetype is shown at the top in a locked state and cannot be selected. Hovering any other archetype reveals the behavioral [profile] and clicking sets it as the contributor's declared aspiration."*) — so the UI for aspirational archetype declaration EXISTS in the component but the persistence (the Settings drawer button) is the "Soon" placeholder.

**Non-canonical archetype name inventory (cumulative across audit):**
| Found in | Non-canonical name | Likely canonical replacement |
|---|---|---|
| Phase A Domain 3 — Social UX feed example | Challenger | Skeptic (already swapped) |
| Phase B Domain 1 — page-fingerprint.hbs | Specialist | Empiricist (best match per description) |
| Phase B Domain 1 — page-fingerprint.hbs | Generalist | Synthesizer or "Pattern still forming" |
| Phase B Domain 2 — dialecta-profile.jsx | Diplomat | Likely Advocate (diplomatic = magnanimous engagement) — pending user confirmation |

Phase 2 build queue should include a single coordinated archetype-name scrub across the whole codebase using the canonical 8 from Contributor Identity v1.1.

---

### Domain 3: API Routes + Discourse Layer (Active dialecta-api repo)

**Files read so far:**
- `api/_cors.js` (17 lines) — CORS handler
- `api/classify.js` (75 lines) — Anthropic classification call
- `api/comment.js` (62 lines) — Comment submission to Supabase
- `api/profile/[id].js` (68 lines) — Profile GET/PATCH

**Files pending:**
- `package.json`, `vercel.json` (small; package summary already known per Domain 1 reads)

#### `api/classify.js` — Verdict: BEAUTIFULLY CLEAN ✅

This is the strongest piece of code in the entire audit so far. Everything matches canonical:

- ✅ Uses `claude-haiku-4-5-20251001` model (matches API CLAUDE.md AI Stack table)
- ✅ Uses CANONICAL tier names in prompt: forum / spark / echo / fog / heat / stance / breach
- ✅ Uses CANONICAL tier descriptions per Classification Engine Spec
- ✅ Uses CANONICAL claim specificity 0–3 spectrum with correct definitions
- ✅ Returns CANONICAL Stage A fields: claim_text, specificity, emotion, tribal_markers, tribal_example, article_engagement, opposing_view_engaged, ai_suggested_tier, borderline_flag, borderline_other_tier, commenter_message
- ✅ Strips ```json``` markdown wrapping if present (defensive)
- ✅ CORS handling via shared `_cors.js`
- ✅ Validates POST + body presence
- ⚠️ The route does NOT fetch article claims from Ghost — relies on caller to pass them in (`article_claims` field). This is a build gap in the comment submission orchestration, not in this route itself.

**This route is production-ready as the operational backbone.** Matches the Classification Engine Specification (which we just scrubbed in Phase A Domain 3) cleanly.

#### `api/comment.js` — Significant Gaps

🚨 **Multiple architectural gaps that explain why the Discourse Layer feels unbuilt:**

1. **Uses `process.env.SUPABASE_SERVICE_KEY`** (line 6) — should be `SUPABASE_SERVICE_ROLE_KEY` per the API CLAUDE.md / `.env.local` canonical. Either the env var name needs to be standardized, or the API CLAUDE.md was updated without updating the actual code. **Currently working** because whatever env var name is set in Vercel matches what's used here, but this is a divergence from the documented standard.
2. **Writes minimal classifications record:** only stores `comment_id`, `ai_suggested_tier`, `self_declared_tier`, `final_tier`, `classified_at`. **Does NOT store the rich Stage A fields** (claim_text, specificity, emotion, tribal_markers, article_engagement, opposing_view_engaged, borderline_flag, borderline_other_tier, commenter_message) that the classify route returns. **Implication: the data foundation for the Calibration pillar (and the entire Self-Snapshot Engine Voice 2) is not being captured.** Phase 2 critical fix.
3. **No axis_events writing.** The Axis Score Updater pipeline (Data Architecture v1.1 entity #3) is not implemented. axis_events ledger is the immutable substrate for the entire Contributor Identity layer; without it the Fingerprint cannot show real data. **Phase 2 critical fix.**
4. **No wait architecture.** Comment is written with `status: 'published'` and `published_at: new Date().toISOString()` immediately. **The 60-minute malleability window doesn't exist in the API.** No draft state, no countdown, no malleability flag.
5. **No orchestration with /api/classify.** This route does not call /api/classify itself — expects caller to pass `ai_suggested_tier` already. **Implication: the Discourse Layer comments component (when built) needs to call /api/classify first, then /api/comment with the result.** Two-step submission flow on the client side.
6. **No reflection wait, no Stage 2.5 amendment window state, no commenter message storage.** All the rich Comment Lifecycle behavior from Private Draft Mode is absent from the API.

#### `api/profile/[id].js` — Significant Gap

🚨 **Only returns the profiles table row.** GET handler queries `.from('profiles').select('*').eq('ghost_member_id', id).maybeSingle()`. **Does NOT join or query:**
- `axis_scores` (the 6-row materialized current state per contributor)
- `archetypes` (assigned archetype + history)
- `axis_events` (the immutable ledger needed for tier_mix and topicPhases)
- Stats aggregations (totalComments, articlesEngaged, nominatedUp, nominatedDown, tierCounts, forumPct)

**The data layer (`mergeProfileWithGhost`) expects all of these fields in the response** but they're never returned. This is why the Profile renders with empty Fingerprint, "Pattern Still Forming" archetype, and zero stats — the API isn't returning the data the React layer expects.

**Phase 2 critical fix:** expand `/api/profile/:id` GET to also fetch and return:
- `axis_scores` for this contributor (6 records)
- `archetypes` current assignment
- Aggregated stats from `comments` + `classifications` tables
- (Eventually) `axis_events` for tier_mix and topicPhases per axis

This is the **largest single API expansion** Phase 2 needs.

Same `SUPABASE_SERVICE_KEY` env var issue as comment.js.

#### `api/_cors.js` — Clean ✅

- ✅ Allowed origins: `dialecta.mymagic.page`, `dialecta.org`, `www.dialecta.org`
- ✅ Standard CORS preflight handling
- ✅ Proper Vary: Origin header

#### Discourse Layer Build Gap — Now Fully Scoped

Combining post.hbs (5 unmounted React placeholders), comment.js (minimal storage), profile/[id].js (minimal return), and the lack of axis_events pipeline:

**The Discourse Layer is approximately 30% built.** Foundations exist (CORS, Anthropic call, basic tables), placeholders are correctly staged, and the design language is established. **Missing:**
- Discourse React components (Comments, TierBadge, DeclarationStrip, Sidebar, ForumRate)
- Stage A fields persistence in comment.js
- Axis events pipeline (writes from comment.js, recompute jobs for axis_scores)
- Profile API expansion (axis_scores, archetypes, stats, axis_events queries)
- Wait architecture state machine (draft / pending_review / published / suppressed transitions; 60-min malleability flag)
- Stage 2.5 amendment window persistence
- Community reclassification voting (comment_votes table writes + reclassification trigger)

**This is the largest single Phase 2 build commitment.** Every other Phase 2 item is small relative to this.

#### Phase 2 Build Queue — Updated After API Reads

| # | Item |
|---|---|
| 22 | Standardize SUPABASE_SERVICE_KEY → SUPABASE_SERVICE_ROLE_KEY across all API routes (or update CLAUDE.md to match code; pick one canonical name) |
| 23 | Expand `/api/comment` to write all Stage A fields to `classifications` table (not just tier fields) |
| 24 | Implement axis_events writer in `/api/comment` (or as separate Axis Score Updater pipeline) |
| 25 | Implement axis_scores recompute job (per Supabase Scaling: incremental + nightly reconcile) |
| 26 | Expand `/api/profile/:id` GET to return axis_scores + archetypes + stats aggregations |
| 27 | Implement axis_events query in `/api/profile/:id` for tier_mix + topicPhases (resolves Phase B Domain 2 finding #3) |
| 28 | Build Discourse React components: Comments, TierBadge, DeclarationStrip, Sidebar (OpinionMap+CommunityStats+DeltaPanel), ForumRate |
| 29 | Wait architecture state machine in `/api/comment`: draft / pending_review / published / suppressed status transitions; 60-min malleability flag |
| 30 | Stage 2.5 amendment window persistence (commenter_message storage, response-for-record note storage) |
| 31 | Community voting infrastructure: comment_votes table writes + reclassification trigger |
| 32 | Coordinated archetype-name scrub: Diplomat → ?, Specialist → Empiricist, Generalist → Synthesizer (per user confirmations) |

---

*Phase B Domain 3 partial. Pending: API package.json + vercel.json. Then Domain 4 (Supabase schema reality via MCP) + Domain 5 (Growth Layer reality, mostly absent) + Domain 6 (Article + Pact + Stewards reality).*

---

### Domain 6: Article + Pact + Stewards reality (executed 2026-04-27)

**Method.** For each of the three active templates, compare structure and content against the canonical spec(s). Note: Phase B Domains 4 and 5 deferred — D4 collapses into the act of writing the schema migration (`a-b1`); D5 has no built artifacts to audit (Phase 4 work).

#### post.hbs (101 lines) ↔ Dialecta_Article_Editorial_Template.md (204 lines)

**State: Scaffolded but unwired.** The structural skeleton matches spec; React mounts are placed correctly. None of the components that populate those mounts are built yet.

**Strengths:**
- Mount points present and correctly named: `#dialecta-tier-badge`, `#dialecta-declaration`, `#dialecta-comments`, `#dialecta-sidebar`
- All mounts pass `data-post-id` and `data-post-slug` to React
- Author meta block with `profile_image` fallback and a small inline JS that derives initials from `data-author-name` when no avatar
- Topic chip renders Ghost `primary_tag`
- Reading time + date + Stoic-clean meta-bar layout
- No retired terminology; canonical throughout

**Gaps:**
- **Declaration Strip component not built** — mount exists but nothing renders the 5 author Declaration fields (Core Claim, Scope Boundary, Strongest Objection, Suggested Tier, Opinion Mapping Suggestion) or the AI's analysis. Spec'd as part of `p3-7`.
- **Tier Badge component not built** — mount exists but nothing renders the 3 visible tiers (author-declared / AI-suggested / community-voted). Spec line 140: "all publicly visible."
- **Sidebar component not built** — mount exists but nothing renders opinion map, community stats, or Position Delta panel. Spec'd as part of `p3-7`.
- **Re-classification nomination UI not built** — no UI yet for the structured nomination flow (suggested tier + predefined reason A/B + optional 140-char note). Spec lines 143–161.
- **AI analysis disclosure UI not built** — spec line 80: "The AI's analysis is disclosed alongside the published article, never used to gate publication." No mount or UI for this.
- **Stage 2.5 nomination amendment window not built** — spec lines 163–165: when nominations accumulate, author gets another Stage 2.5 moment. No UI or notification mechanism.
- **Wait window enforcement absent** — spec lines 121–131: wait times before publication are part of the architecture and "framed as intention rather than punishment." No template hook for this.
- **No Stage A data passing** — Ghost emits only post ID/slug; React mounts must fetch all classification + declaration data from API. Acceptable for now, but `data-stage-a-result` or similar attribute could reduce one round-trip per page-load if performance demands it later.

#### page-pact.hbs (1344 lines) ↔ dialecta-pact.html prototype (1411 lines after logo scrub)

**State: Live and substantially complete.**

**Strengths:**
- All 9 expected sections present in canonical order: Pact intro, "Most platforms reward the wrong thing," "Every voice finds its place" (tier system), "How your words find their tier," "Slowness is a feature," "This platform is trying to grow you," "Can you read the tier?" (3-comment quiz with score display), "I understand and want to participate" (commitment), Footer.
- All 7 canonical tier names present (27 occurrences total): Forum, Spark, Echo, Fog, Heat, Stance, Breach
- Zero retired tier names — no Static, no Off the Air
- **Custom SVG tier icons inline at lines 1032–1064** — already executes part of `a-b4` (Custom SVG Tier Icons). Hand-drawn paths for at least Forum (pediment/columns), Spark (lightning bolt), Echo (echo wave), Fog (cloud), Heat (flame), and presumably Stance + Breach below.
- Quiz mechanic with score display + commitment flow + committed state (CSS prepared at lines 794–890)
- No old terminology (no Charity, Specificity, Range, Steelman, Challenger, Diplomat, Oracle)

**Gaps / cleanup:**
- **Dashboard `p1-5` description references "Path A/B commitment flow"** — neither the prototype nor the active build implements two paths. The Pact has always been a single-commitment ritual. Dashboard description is stale; scrub the "Path A/B" reference.
- **SVG tier icons are inline per-page, not reusable** — `a-b4` is partially fulfilled by Pact, but Stewards/Profile/Article would re-define rather than re-use. The build item should be re-scoped to "extract Pact's tier-icon SVGs to a shared Handlebars partial or a React component, then consume from all 4 pages."
- (No critical content gaps. The Pact page is the most coherent of the three.)

#### page-stewards.hbs (874 lines) ↔ Dialecta_Stewards_Reflection.txt (151 lines) + dialecta-s13-stewards.html prototype (903 lines after scrub)

**State: Live and substantially complete; one stale phrasing + one logo scrub + one Charter question.**

**Strengths:**
- Masthead matches Reflection exactly (lines 467–468): "Trusted by their readers / chosen by their work" — the Reflection's canonical THE FINAL MASTHEAD (lines 126–130).
- Opening prose captures the anti-influencer premise verbatim in spirit: "no committee to impress, no credential to claim, no follower count to accrue. There is only the work, and the readers who read it, and time."
- Trust loop (lines 487–490) is a direct match to Reflection lines 44–45: "The writers' work earns the trust. The readers' trust confers the recognition."
- Cadence section (lines 494–522) implements 6 Cadence modifiers (Daily, Serial, Periodical, Quarterly, Occasional, Magnum Opus) with the canonical framing: "Frequency is not its own Order."
- The Orders section (lines 526+) implements **9 Order families** with ~30 distinct Orders: Essayistic (5), Argumentative (4), Synthetic (4), Scholarly (4), Narrative (4), Practitioner (3), Journalistic (5), Pedagogical (1), Speculative (1), Declared (1=Satirist).
- Satirist treated as its own "Declared" family with special card class; dedicated "On the Satirist" section follows at line 851.
- Doorway closes with "The work does the rest" + "The door is open" — Reflection's closing principles.
- No retired pillar/archetype/tier names anywhere.

**Gaps / cleanup:**
- **STALE NAMING ("The Republic")** at line 861: *"The Republic recognizes its Stewards the way it recognizes its best ideas..."* — "The Republic" is one of the rejected names from the Reflection's naming arc (Reflection line 83 explicitly notes "The Republic of Letters was rejected"). This phrasing post-dates the rejection. Replace with "The community recognizes its Stewards" or "Dialecta recognizes its Stewards" or "The readership recognizes its Stewards."
- **LOGO BLOAT in masthead** at line 465: ~198k-character base64 PNG embedded inline as `masthead-logo`. The Ghost nav header serves the wordmark sitewide. The Stewards page masthead may legitimately want a larger hero logo, but the current implementation embeds a full data-URI inline. Decision needed: replace with `{{@site.logo}}` (small wordmark, may not feel hero-scale), or move to a static asset path served from `/assets/img/`, or replace with a typographic masthead. Either way, do not keep the inline base64.
- **SATIRIST'S CHARTER not formalized as a sub-section.** Dashboard `p1-6` description names "Satirist's Charter" as part of the page. Active build has an "On the Satirist" prose section (lines 849–854) that captures Satirist intent but is not labeled or structured as a Charter. Either rename the section "The Satirist's Charter" and structure it as a list of clauses, or accept the prose form and update `p1-6` description to remove "Charter" framing. Worth a 30-second decision rather than letting it sit.

**No content drift detected** between active page-stewards.hbs and the spec's substantive principles. The page is in the strongest shape of the three.

---

### Phase B — Domain 6: Build Items Generated

| # | Item | Layer | Notes |
|---|------|-------|-------|
| 33 | post.hbs Tier Badge component (3-tier display) | Discourse | New |
| 34 | post.hbs Re-classification Nomination UI (structured A/B/C) | Discourse | New |
| 35 | post.hbs AI Analysis Disclosure UI | Discourse | New |
| 36 | post.hbs Stage 2.5 Amendment Window for nominations | Discourse | New — author response when nominations accumulate |
| 37 | post.hbs Wait Window enforcement (publishing wait time UI) | Discourse | New |
| 38 | Extract Pact's inline SVG tier icons → shared partial/component | Visual | Re-scope of `a-b4` — partially done in Pact |
| 39 | page-stewards.hbs: scrub "The Republic" → "The community" (line 861) | Cross-Layer | New, 1-line edit |
| 40 | page-stewards.hbs masthead: replace inline base64 logo (line 465) | Visual | Decision required: asset path vs. typographic vs. site-logo |
| 41 | page-stewards.hbs Satirist's Charter: formalize or accept prose | Cross-Layer | 30-second decision |
| 42 | Dashboard `p1-5` description: scrub "Path A/B" — never built, never spec'd | Foundation | Dashboard hygiene |

### Phase B — Status: COMPLETE (sufficient)

| Domain | Status | Notes |
|---|---|---|
| 1. Active Theme — index.jsx + profile | complete | Gaps captured in build queue |
| 2. Active Theme — fingerprint engine | complete | v2.0.0 refactor scoped (`a-b2`) |
| 3. API Repo | partial-complete | classify.js canonical; comment.js + profile/[id].js gaps captured (`a-b5`, `a-b6`) |
| 4. Data Architecture | deferred — covered by build | Writing the schema migration (`a-b1`) IS the audit |
| 5. Growth Layer | deferred — Phase 4 work | No built artifacts to audit |
| 6. Article + Pact + Stewards | complete (this section) | 10 new build items generated |

**Audit closes 2026-04-27.** Total Phase B build items: ~42 across all domains. Phase 1 build queue may begin.

---

### Phase B — Domain 4 Addendum: Schema Reality (executed 2026-04-27)

**Reframing.** Domain 4 was originally deferred on the rationale that "writing the schema migration IS the audit." That premise held — drafting `001_v1_1_schema.sql` triggered an immediate diagnostic pass against production Supabase, which surfaced two findings the original Phase B passes (Domains 1-3) had no way to see. Documenting them here so the audit doc is honest about what was actually discovered.

#### Finding 1: Spec says `contributor_id uuid`, production uses `member_id text` — production is correct

The Data Architecture spec describes contributor IDs as `uuid` across every entity (comments.author_id, axis_events.contributor_id, axis_scores.contributor_id, archetypes.contributor_id, etc.). Production Supabase consistently uses `member_id text`. Diagnostic of the live `axis_scores`, `archetypes`, and `comments` tables confirmed this unanimously.

**Why production is correct:** Ghost member IDs in Phase 1 are 24-character hex strings (Mongo ObjectID style), not UUIDs. Storing them as text is the right choice. The spec's `uuid` notation was forward-looking to Phase 2 (Supabase auth, where IDs would be UUIDs) but didn't flag the Phase 1 reality.

**Resolution:**
- Migration `001_v1_1_schema.sql` adapted: all new tables (`feed_events`, `follows`, `sparring_partners`, `opinion_map_positions`) use `text` for member IDs.
- Data Architecture spec patched (separate edit) to clarify Phase 1 vs Phase 2 ID type per entity.
- This was a **Phase B miss** — should have surfaced during Domain 3 (API Repo) when reading comment.js, but the diff between `member_id` in code and `author_id` in spec didn't register at the time.

#### Finding 2: `archetype_id` PostgreSQL enum is stale (pre-canonical-8 taxonomy)

Production has 9 enum values: `specialist, generalist, advocate, reviser, sparring_partner, cartographer, witness, builder, forming`.
Canonical 8 is: `skeptic, synthesizer, advocate, builder, empiricist, contextualist, illuminator, reviser`.

Only **3 values overlap** (advocate, builder, reviser). Five canonical values are missing; six legacy values are present (one of which — `forming` — appears to be a state, not an archetype; another — `sparring_partner` — collides with the relationship type concept).

**Resolution:**
- Migration `001` ALTERed the enum to add the 5 missing canonical values. Legacy values left in place (no data uses them; archetypes table was empty).
- Spawned background task: "Retire legacy archetype_id enum values" — a follow-up migration that removes the 6 stale values via type-swap (CREATE new enum, ALTER COLUMN, DROP old enum), once we've confirmed no future code references them.
- This is the same family of finding as `a-b3` (Diplomat + Oracle in desktop profile JSX) but at the enum level — even more foundational. Both should be tracked together as "canonical archetype taxonomy enforcement."

#### Finding 3 (incidental): production schemas are richer than spec in some places

Diagnostic also surfaced that:
- `axis_scores` has `topic_history jsonb` and `comment_count integer` columns not in spec — useful for rendering, worth promoting back into the spec
- `archetypes` has `archetype_label text`, `confidence` enum (forming/emerging/established), `axis_pattern jsonb`, `history jsonb` — substantially richer than spec's "current + history" framing
- `classifications` matches spec essentially perfectly except `specificity` → `specificity_score` (minor)

These are positive divergences. The spec should be updated to reflect these production decisions rather than the implementation reverting to a thinner spec. Tracked as a separate doc-patch item.

---

### Phase B — Closing Note

The audit is now closed in two senses:
- **Vision capture (Phase A):** complete across 6 domains, 30+ canonical docs
- **Reality capture (Phase B):** complete across the domains that surface gaps requiring decisions (1, 2, 3, 6) + Domain 4 addendum from migration drafting + Domain 5 deferred-with-reason (no built artifacts to audit)

**Schema migration v1.1 (`a-b1`) applied to production Supabase 2026-04-27** — `001_v1_1_schema.sql` (additive: 4 new tables, 2 column adds, archetype enum expansion) and `002_seed_dev_users.sql` (Maya/Wen/Anselm + 18 axis_scores + 3 archetype rows) both succeeded cleanly on retry after diagnostic-driven adaptation.

The Phase 1 build queue is unblocked. First downstream item: `a-b7` (HERO_PROFILES → API-fetched seed data wire) is now technically possible since the seeds exist.
