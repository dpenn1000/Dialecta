# Dialecta — Project Index
*A map of what's in the project, where it lives, and how the pieces relate.*
*Version 0.16, May 2026 (revised 6 May 2026: public SEO build rolled back. Original Cloudflare plan (Phases 2-6) had already been replaced by Path C SSR on `dialecta-next` 2026-05-04/05; this revision retires the Path C SEO half as well. `dialecta-next` is now narrowly scoped to OG cards + the celebration moment landing page. Public SSR pages, sitemap, robots, sync-theme, and lib/theme deleted. ALL new API work lives in `dialecta-api`. Decision rationale: SEO is a 3-6 month payoff curve; current stage (3 active contributors, 1,000-person FB invite wave) is share-driven, not search-driven. Engineering focus shifts to Growth Layer + History Scroll + usership.)*

> **Editing note (2026-04-29).** This file is a living progress tracker. It is the only document in `Fundamentals\` that Claude may edit directly; the rest are read-only. Other Fundamentals docs continue to be hand-tended in Word.

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
| `dialecta-fingerprint.jsx` | Prototype | Reference (design exploration). Production canonical is `theme/src/dialecta-fingerprint-engine.jsx`, imported by `dialecta-profile.jsx`. | OneDrive design-exploration file. The production engine no longer has any duplicate render logic; the previous drift concern was resolved when production was confirmed to import a single canonical engine (v0.12, 2026-04-30). |
| `dialecta-profile.jsx` | Prototype | Reference (design exploration). Production version is now responsive — see Production Code below. | Contributor profile page integrating fingerprint, archetype, and history. |
| `dialecta-profile-mobile.jsx` | Prototype | Superseded (Stage B.2, 2026-04-28) | The OneDrive file remains as design-exploration reference. The production split between desktop and mobile profile components has been retired; the unified `theme/src/dialecta-profile.jsx` decides desktop vs. compact via an internal `useIsDesktop` hook. Do not recreate a parallel mobile file in production. |

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

## Production Code

*Added in v0.8.* The inventory tables above describe OneDrive design-exploration artifacts. Production code (and the canonical state for any code-level question) lives in two repos. For the full canonical file registry, route table, schema table, and the live "What Is and Is Not Done" snapshot, see `C:\dialecta-api\CLAUDE.md`.

| Surface | Repo path | Notable files |
|---|---|---|
| Theme (Ghost) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` | `src/dialecta-profile.jsx` (responsive, post-Stage B.2), `src/dialecta-private-draft.jsx` (comment compose ritual, Stage 1 of Private Draft Mode shipped 2026-04-29), `src/dialecta-editor.jsx` (article composer, Phase 1C), `src/dialecta-profile-order.jsx` (Steward Order surfaces), `src/topics.js` (canonical TOPICS v2 source for the bundle), `page-articles.hbs` (feed at `/articles/`), `page-community.hbs` (mount stub), `page-write.hbs` (editor mount), `page-quotes.hbs` |
| API (Vercel) | `C:\dialecta-api\` | `api/article/*` (Phase 1A-1C: classify, submit, publish, `[id]`, aesthetic-suggest, suggest-topics, classify-order, upload-image), `api/classify`, `api/comment`, `api/profile/[id]`, `api/quotes` |

The TOPICS taxonomy v2 has three parallel copies that must move together: `theme/src/topics.js` (canonical for the bundle), `theme/post.hbs` (Handlebars inline copy), `api/_topics.js` (Vercel runtime).

---

## Source Documents

*Added in v0.9.* Living progress documents (these are faster to read than the code itself when re-orienting):

| Document | Path | Role |
|---|---|---|
| Session handoffs (chronological) | `Fundamentals\Claude Integration\dialecta-handoff-YYYY-MM-DD*.md` | End-of-session state. Multiple per day possible (`-morning`, `-evening`, topic suffixes). The most recent is always the current state of play. |
| Coherence Audit | `Fundamentals\Claude Integration\dialecta-coherence-audit.md` | Closed 2026-04-27. Five-phase audit; produced the lettered build queue. |
| Audit Brief | `Fundamentals\Claude Integration\Dialecta_Codebase_Audit_Brief.md` | The audit's charter and pre-audit-state record. |
| Foundation State | `Fundamentals\Claude Integration\dialecta-foundation-state.md` | One-page snapshot. Last verified 2026-04-26 (some specifics now stale; use handoffs for current state). |
| Dashboard | `Fundamentals\Progress & Forecasts\dialecta-dashboard.jsx` | The canonical backlog tracker. `DEFAULT_ITEMS` is the seed state; loads from localStorage first via `STORAGE_KEY = "dialecta-dashboard-v2"`. Holds the `LAUNCH_MILESTONES` array (First Quills, 6 milestones from current state to invited launch). |
| API CLAUDE.md | `C:\dialecta-api\CLAUDE.md` | Operational ground truth for production: full migrations list, route table, schema, env vars, architecture decisions. |
| Theme CLAUDE.md | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\CLAUDE.md` | Theme-specific operational notes: folder structure, build commands, deploy steps. |

The Coherence Audit is closed; what remains is execution of its build queue. The dashboard tracks that queue. The handoffs are where you go to find out what shipped most recently.

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

**Status:** Mostly landed (Stage B.2 + the 2026-04-29 evening `style.css` rewrite). The contributor profile has been unified into a single responsive component (`theme/src/dialecta-profile.jsx`); the parallel `dialecta-profile-mobile.jsx` file is retired in production. The site-wide `style.css` was rewritten externally with canonical `--bp-*` breakpoints, `--type-*` fluid type, a 7-stop `--brass-gradient`, and `--max-width: 1180px`. What remains: codifying these breakpoints and the canonical responsive treatments as a new Design Spec section, and a verification pass through the remaining prototypes (Pact page, Stewards page, Opinion Maps, Design Spec preview).

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

**Status:** Built 2026-04-30 (evening). Shipped in the same build cycle as Mention notifications. The Reviser archetype in the Contributor Identity spec is now unblocked. Calibration of the per-article axis space (the substrate the pre-read / post-read snapshots place positions on) continues over the weekend alongside the Opinion Mapping topic-analyzation pass.

---

## Harmonization Tensions

Places where two layers will eventually need to be reconciled. Flagging them here so they don't get forgotten.

1. **Archetype assignment vs. the Self-Snapshot's three-voice principle.** The Contributor Identity spec assigns one archetype per contributor based on observed pattern, closer to a verdict than to a multi-voice composition. The Growth Layer Principles (Principle 6) commit Dialecta to a three-voice snapshot in which the engine's observations are framed as *signal, never verdict*, and the user's self-description remains canonical. The two postures need to be reconciled before either layer is built against real data. The most likely resolution is that the existing archetype work becomes the *engine voice* inside the three-voice composition rather than a standalone label, but that decision should be made deliberately, not by default.
2. **Per-comment tier vs. contributor-level pillar scores.** The Classification Engine emits a tier per comment. The Contributor Identity layer aggregates comments into pillar scores. The exact mapping — which tier outcomes feed which pillars and with what weight — is implied but not specified anywhere. This will need to be written before the contributor identity layer can actually be computed from real data. See Data Architecture open questions.
3. ~~**The Reviser archetype and the Delta mechanic.**~~ *Resolved v0.12 (2026-04-30).* Delta Mechanic shipped this evening. The Reviser archetype is now unblocked.
4. **Axis name propagation across older files.** The pillar rename (Specificity→Acuity, Range→Reach, Charity→Magnanimity) was applied to Contributor Identity v1.1 but has not yet been propagated to: Classification Engine Specification (Stage A field names reference Specificity), Tier Psychology (references Specificity/Range in a few places), Project Brief (open questions section). These are low-severity since the field names are functional labels, not user-facing. Schedule a terminology pass before public launch.

---

## Cleanup Items

*Reinstated as a permanent section in v0.6. Tracked throughout production. The point of this section is to catch filesystem and naming drift the moment it happens.*

### Open

| # | Item | Severity | Notes |
|---|---|---|---|
| 1 | `dialecta-design-spec.html` v1.3 needs to land in `/mnt/project/` (Claude.ai project files) | High | OneDrive copy at `Fundamentals\dialecta-design-spec.html` is the v1.3 canonical; the Claude.ai project files area is what's stale. User-side action: upload OneDrive copy to Claude.ai Projects. |
| 2 | `dialecta-design-spec-v2.html` stub deletion in `/mnt/project/` | Medium | Same Claude.ai filesystem; user-side. To delete after item 1 lands. |
| 9 | Upload five updated documents to `/mnt/project/` (Claude.ai) | High | `Dialecta_Data_Architecture.md`, `Dialecta_Editorial_Voice.md`, `Dialecta_Contributor_Identity.md` (v1.1), `Dialecta_Growth_Layer_Principles.md`, `Dialecta_Social_UX_Architecture.md`. All exist on OneDrive; the gap is the Claude.ai Projects mirror. User-side action. |

All filesystem items above are about the Claude.ai project-files area (`/mnt/project/`), which is not Claude-Code-accessible from Windows. They need user-side upload or deletion via the Claude.ai web UI. Items 3, 4, 5, 7, 8, 10, 11 were verified resolved on 2026-05-02 and moved to Resolved below.

### Standing contributor actions (no tool)

| # | Item | Notes |
|---|---|---|
| A | Apply chat naming convention going forward: `[Layer] — [Topic]` where Layer is one of Foundation, Discourse, Identity, Article, Visual, Growth, Build, Idea, Reference | Manual sidebar rename |
| B | Delete obsolete chats from project sidebar when encountered | Per memory: `Untitled` (757b4359), `Opus project Profile page fingerprint` (6c10add6), `Private draft mode setup` (5c1c95b9), `Logo design` (871c4b5d), `OpenGround project handoff brief` (325ae3b7) |

### Resolved

*Kept short. Prune older entries as they age out.*

- **v0.16** Public SEO build rolled back 2026-05-06. The OG share infrastructure shipped 2026-05-04/05 was correct and stays live (OG-1 through OG-5 + celebration moment landing). The SEO/SSR half of `dialecta-next` was over-built relative to current stage and has been retired. Decision rationale: SEO has a 3-6 month payoff curve; current growth motion is share-driven (1,000-person FB invite wave, Charter Underwriter cohort), not search-driven. Engineering focus shifts to Growth Layer + History Scroll + usership.
  - **`dialecta-next` scope locked.** Permanent narrow sidecar: 5 OG-image routes + 1 celebration moment landing page (UA-redirect to `www.dialecta.org`). Not a successor to `dialecta-api`. Not a future SEO surface. Not a migration target. The unified Next.js migration is a future option that, when triggered (~50-100 active contributors, real auth/real-time/native-render need, or two-API-repo tax), will be a clean parallel build with DNS cutover, not an evolution of `dialecta-next`.
  - **Files retired.** `app/contributor/[handle]/page.js`, `app/quote/[slug]/page.js`, `app/sitemap.js`, `app/robots.js`, `app/api/health/`, `app/api/debug/`, `lib/theme/` (full folder of synced theme components), `scripts/sync-theme.js`. The "More from {name}" cross-link on the celebration moment page also removed (no public-web destination on dialecta.org for cross-profile views via handle).
  - **API rule pinned.** All new API endpoints go in `C:\dialecta-api\`. The `dialecta-next` package.json description and next.config header comment updated to reflect the bounded scope. The "Successor to dialecta-api" framing was aspirational and removed.
  - **CLAUDE.md system updated.** `dialecta-next/CLAUDE.md` created as the fourth (small) sidecar reference. Cross-reference tables in `dialecta-api/CLAUDE.md`, theme `CLAUDE.md`, and the OneDrive root `CLAUDE.md` updated to acknowledge the four-folder layout. The Live Stack table in `dialecta-api/CLAUDE.md` adds `dialecta-next` as a share-card sidecar row.
  - **Memory updated.** `project_public_seo_architecture.md` rewritten to document the rollback. `MEMORY.md` index entry updated to "ROLLED BACK 2026-05-06" with do-not-extend-scope guidance.
  - **What stays live.** All five OG card routes (`opengraph-image.js` files for article/contributor/quote/comment/moment), the celebration moment landing page with UA-redirect, all `lib/get-*.js` data fetchers used by OG routes, all fonts and branding assets, the `default.hbs` og:image meta tag pointing at `dialecta-next.vercel.app/article/<slug>/opengraph-image`. None of this changes; FB invite wave readiness preserved.
  - **What still needs to happen separately.** Theme ZIP upload to Magic Pages so the celebration modal goes live (carried over from the 2026-05-05 share-architecture handoff). End-to-end share test with a fresh member account. Phase A: wire remaining 6 celebration triggers (this is growth-motion work, not SEO).

- **v0.15** Phase 1.0 of the Cloudflare frontend rollout, code complete 2026-05-02 (late evening continuation). The canonical `profiles.handle` column is now live in production, with full client-side wiring through profile edit and a forced setup modal for unconfirmed members. This is the first of four Phase 1 sub-phases under `project_public_seo_architecture.md`, which is no longer "deferred"; it is in active build:
  - **Phase 1.0 (handle column substrate): DONE.** This entry.
  - **Phase 1.1 (mention system migration to handle):** next.
  - **Phase 1.2 (SSR routes for `/contributor/<handle>` and `/library/<slug>`):** pending.
  - **Phase 1.3 (share architecture: ambient share button + celebration moments):** pending.
  - Phases 2-6 (Cloudflare zone setup, staging verification, DNS cutover, post-cutover monitoring) follow once Phase 1 SSR + share ship.
  - **Migrations 029 + 029b applied.** New `profiles.handle` column (lowercase, 5-24 chars, alphanumeric with a single `-` or `_` permitted between alphanumeric runs only). Companion tables: `reserved_handles` (84 seed entries: system paths, brand, impersonation; admin-extendable) and `handle_history` (audit log + 1-year cooldown for SEO 301 redirects). Format constraint at the DB layer plus a reserved/cooldown trigger (`SECURITY DEFINER`, `search_path = ''`, `EXECUTE` revoked from anon/authenticated). `pg_trgm` extension placed in the `extensions` schema per Supabase convention. All ten existing profiles backfilled with auto-generated handles (`daniel-pennington`, `david-p`, `kathryn-pennington`, `mike-p`, `rylie-pennington`, `tom-gaetani`, `dialecta-house`, plus the three seeds), all marked `handle_set_by_user = false`. `get_advisors` returns clean.
  - **API endpoint `_check_handle` added.** New GET branch in `api/profile/[id].js` returns `{ available, reasons, normalized }` for live UI validation. Reason codes: `too_short`, `too_long`, `invalid_format`, `reserved`, `taken`, `cooldown`. PATCH branch extended to validate handle (format + reserved + taken + cooldown), normalize to lowercase, flip `handle_set_by_user` to true, and log to `handle_history` on user-confirmed change (auto-generated handles do not poison the cooldown pool).
  - **Theme: `HandleField` in profile edit.** New component in `dialecta-profile-edit.jsx` with debounced API check (400ms), status display (Checking / Available / specific error), exported for reuse. `mergeProfileWithGhost` in `dialecta-profile-data.js` now reads `profile.handle` as the primary source for the displayed `@handle` and exposes `user.handleSlug` (raw, no `@` prefix) for forms and URLs. Wired through `home-page-mount.jsx` and `shell.jsx` invocations of `EditProfilePanel`.
  - **Theme: forced handle setup modal.** New file `dialecta-handle-setup.jsx` (gate + modal). Mounts sitewide via `shell.jsx`. The gate fetches `/api/profile/<uuid>` once per browser session and blocks all interaction with a brass-titled modal if `handle_set_by_user = false`. Pre-fills with the auto-generated handle so a one-click confirm works; the field is editable. Soft note about the 1-year redirect window. Permissive failure modes: a network glitch never locks the user out; the DB trigger remains the authoritative gate.
  - **Reference memory added.** `reference_api_base_url.md`: the Vercel API project is at `https://dialecta.vercel.app`, NOT `dialecta-api.vercel.app` despite the repo name. Verified hands-on after a `DEPLOYMENT_NOT_FOUND` from the wrong subdomain.
  - **Pending deploys (user-side).** API code lives in repo, awaiting `vercel --prod` from `C:\dialecta-api\`. Theme bundles compiled clean (all 9 bundles; shell.js at 268kb), awaiting ZIP + Magic Pages upload. The DB migrations are already in production.
  - **Side notes.** (1) Theme `CLAUDE.md` is stale: it describes the older `index.jsx`-based 4-bundle build, but reality is now 9 per-page bundles plus `shell.js`, with `index.jsx` archived 2026-05-02. Refresh when convenient. (2) `project_notification_system.md` memory says "the handle-search column is the highest-impact next extension"; that extension is now built. Memory is mildly stale; update when convenient. (3) `project_public_seo_architecture.md` memory still says "currently deferred"; it should be updated to reflect Phase 1.0 in build.

- **v0.14** Pre-Growth-Engine button-up sweep 2026-05-02 (late evening). Closed every loose end on the cleanup list except the three Claude.ai-filesystem items above (which require user-side upload). Specifically:
  - **Pre-launch security hardening migration shipped (028 + 028b).** Full advisor sweep. Eighteen findings cleared: axis_events RLS enabled with service-role-only marker policy; twelve internal tables (admin_audit_log, admin_capabilities, admin_role_capabilities, admin_roles, classifications, feedback_items, notification_prefs, notifications, opinion_map_overrides, profile_admin_capability_grants, profile_admin_roles, tier_nominations) given explicit service-role-only marker policies; profile_effective_capabilities view switched to security_invoker; three trigger functions (set_updated_at, quotes_set_updated_at, initialise_contributor_axes) pinned to search_path = '' with initialise_contributor_axes rewritten to use fully-qualified references. `get_advisors` after returns `{lints: []}` for the first time since RBAC went in. The MEMORY.md `project_deferred_security` entry is now historical.
  - **Cleanup item #3 verified resolved.** `openground-pact.html` is gone from OneDrive root; `dialecta-pact.html` is the live file.
  - **Cleanup item #4 verified resolved.** `dialecta-s02-ux-opinion-maps.jsx` was renamed and moved to `OneDrive\Websites\Dialecta\Opinion Map\dialecta-opinion-maps.jsx`.
  - **Cleanup item #5 verified moot.** Steelman → Advocate scrub: zero matches in `Dialecta_Article_Editorial_Template.md`, zero in `Dialecta_Project_Brief.md`. The two residual matches in `Dialecta_Contributor_Identity.md` (line 48) and `Dialecta_Editorial_Voice.md` (line 264) are intentional verb usage ("they steelman", "Write one sentence that steelmans...") describing the intellectual practice, not the archetype. Correct as written; do not change.
  - **Cleanup item #7 verified resolved.** `dialecta-subnav-fonts.html` is gone.
  - **Cleanup item #8 verified resolved or moot.** `Dialecta__Hero__White.png` not present in OneDrive root (and the canonical logo path is now the data URI in `dialecta-logo-datauri.txt`). Cosmetic anyway.
  - **Cleanup item #10 verified moot.** Specificity / axis name propagation: every "specificity" usage in `Dialecta_Classification_Engine_Specification.md`, `Dialecta_Project_Brief.md`, and `Dialecta_Tier_Psychology.md` is the lowercase functional term ("claim specificity," "specificity level 0–3," "emotional intensity without specificity"), not the renamed pillar. Engine vocabulary versus pillar label are intentionally distinct layers; the docs preserve that distinction correctly. No edits needed.
  - **Cleanup item #11 verified resolved.** Community page wiring is complete. `/api/profile/_list`, `/api/profile/_author`, and `/api/profile/_feed` are all implemented as dispatch cases inside the catchall `api/profile/[id].js` route (lines 101, 232, 412 respectively). The earlier audit pass treated the absence of separate `_list.js` / `_feed.js` / `_author.js` files as a wiring gap; it isn't, the catchall pattern is intentional. The `/community/` page works end-to-end.
  - **Resolution method.** Direct disk-state verification, advisor re-runs, and code grep against the canonical specs and `api/profile/[id].js`. The cleanup list had drifted from disk state; this v0.14 entry is the reconciliation.

- **v0.13** Day-close 2026-05-01 (evening). Article-page consolidation: reading spine, spine-owned overlays, stage-then-commit placement. One architectural argument shipped together.
  - **Reading spine.** `post.hbs` now renders a sticky 5-segment spine pinned under the nav (Reflect / Read / Declare / Discourse / Bio). Each segment carries a state mark (pending / active / complete) and a small mono-uppercase meta line. Mobile pins the spine to the bottom of the viewport instead, with reserved scroll-room beneath the article so the last paragraph isn't covered. Companion piece: a brass-pale `.post-discourse-chip` under the meta bar announcing "Discourse · 12 voices · join the conversation" so the comment surface has visible attribution above the fold. Direct response to the recurring user question "is there a commenting section?" that motivated the whole pass.
  - **Spine-owned overlays.** Pre-read Opinion Map and Author's Declaration moved out of inline rendering on `post.hbs` into modal overlay shells anchored to the spine's Reflect and Declare segments. The React mounts (`#dialecta-pre-read-map`, `#dialecta-declaration`) live INSIDE the overlay shells now; existing components mount unchanged. Auto-open via localStorage (Reflect: 1.5s after first visit per (member, article); key `dialecta-reflect-seen-<post-id>`) and IntersectionObserver (Declare: when `#post-content-end-sentinel` reaches the viewport at end of body; key `dialecta-declare-seen-<post-id>`). Both open via spine click any time. Mobile presents as a bottom sheet with drag-handle indicator. The overlay control script reparents `.post-overlay` elements to `<body>` on init so they escape `.site-main`'s `z-index: 1` stacking context (otherwise the overlay painted below the fixed nav at z-index 100, which is exactly what the first deploy screenshot showed before the fix). Recovers ~1200-1500px of vertical real estate in the article column; the page now flows meta → chip → body → bio → comments.
  - **Stage-then-commit on opinion map.** `usePlacement` hook in `dialecta-opinion-map-placement.jsx` rewritten: tap stages a `pending` placement locally with no network call; an explicit "Commit position" button POSTs to `/api/opinion-map/place`. Re-tap moves the pending marker freely. After commit, "Re-place" clears local state for a fresh staging cycle that overwrites the API record on next commit. Same model on both the pre-read map (inside Reflect overlay) and the post-read maps (inside Declare's `InteractiveMap`). Replaces optimistic-commit-on-tap which felt rushed inside the new overlay UX. The brass-gradient Commit button is now the canonical "moment of declaration" affordance.
  - **Decision history this session.** Brainstormed four options (focus-mode toggle, spine-owned overlays, progressive-reveal pills, fullscreen reader takeover); built a side-by-side mockup at `theme/mockups/spine-options.html` to compare options 2 and 3 visually; user confirmed Option 2 because the modal blur + focus puts the pre-test "right in front of people." Three-question UX framing locked in: Reflect auto-opens on first visit; Declare auto-opens at end of body; already-declared state shows declaration with edit affordance (stage-3 work).
  - **Open after this.** Stage 3 will wire Supabase declaration state into the spine's `data-state` (already-declared shows `complete`; same data gates the auto-open so members who declared aren't re-prompted), drag-to-dismiss on the mobile bottom sheet, focus-trap inside overlays. localStorage is the stand-in for declaration state until then. ZIP shipped (`dialecta-theme.zip`, 3.4 MB at `C:\dialecta-local\versions\6.28.0\content\themes\dialecta-theme.zip`) and pending Magic Pages upload.

- **v0.13** End-of-night health check 2026-05-02. The platform crossed from "small private invited group" toward public-facing in this window. **First 1,000-person Facebook invitation wave went out today.** Twitter and Facebook pages are live. The site's own SEO surface is configured (Ghost-native via `{{ghost_head}}` plus settings; the deferred Cloudflare + Vercel SSR architecture for `/library/` and Profile SEO remains in `project_public_seo_architecture.md`).
  - **Three-input tier system fully live.** Migration `025_tier_nominations.sql` + `theme/src/dialecta-nomination-panel.jsx` shipped 2026-04-30 evening. The Community Reclassification leg, the third voice in the AI / Author / Community resolution to `final_tier`, is now producing data. Architecture documented in `project_three_input_tier.md`.
  - **All three Growth Layer prerequisites are now met.** Classification Engine live, Contributor Identity live, Community Reclassification live. The "philosophically foundational but operationally downstream" framing in v0.12 is obsolete.
  - **Aspirational Archetype shipped 2026-05-01.** Migration `027_aspirational_archetype.sql`. First Growth Layer feature in production. The "What do you want your fingerprint to become?" prompt on the profile is now wired to a real declaration the contributor can set, change, and recommit. Profile component (`dialecta-profile.jsx`, 218 KB), `profile-mount.jsx` (lifted modal state), `profile-settings.jsx` updated.
  - **Article page reading spine shipped 2026-05-01.** Memory: `project_article_page_spine.md`. Sticky 5-segment spine on post pages; Reflect (pre-read map) and Declare (declaration + post-read map) moved into modal overlays anchored to spine segments. Auto-open via localStorage + IntersectionObserver. This is the structural surface that hosts the pre-read / post-read flow originally specified in the Delta Mechanic spec; whether to call this implementation "the Delta Mechanic shipped" or "the spine that hosts it" is a vocabulary choice.
  - **Opinion map stage-then-commit shipped 2026-05-01.** Memory: `project_opinion_map_commit_model.md`. Tap stages locally; explicit Commit button POSTs. Re-place after commit clears local state. Migrations `022_opinion_map_overrides.sql` and `024_opinion_map_positions_multi.sql`.
  - **Reply threading + structured @mentions live.** Migrations `020_comments_parent_id.sql` (one-level threading; replies-of-replies normalize to top-level ancestor) and `023_comments_mentions.sql` (jsonb structured mentions). UI: `dialecta-mentions-picker.jsx`, reply state in `index.jsx` `DialectaCommentsRoot`, indented thread rendering with brass left rail in `dialecta-discourse-layer.jsx`.
  - **Notification system fully live end-to-end.** Six trigger types, 6×2 channels matrix, in-app + opt-in email digest via Resend on the verified `dialecta.org` domain. Hourly cron at `/api/notifications/digest`. All triggers wired in `comment.js`, `profile/[id].js` (follow), `article/publish.js` (follow_new_article fan-out), `article/repolish.js` (editorial). Deduplication via `notifiedRecipients` Set. The `MEMORY.md` summary line that still says "Stages 3-5 pending" is a stale auto-summary; the underlying `project_notification_system.md` reflects shipped state.
  - **Author signature fonts.** Migrations `026_signature_font.sql` + `026b_signature_font_default_fix.sql` + helper `api/_signature-fonts.js`. Nine hand-script faces loadable sitewide via Google Fonts. Per-author face stored in `profiles.signature_font`. Picker on `page-pact.hbs`, profile signature line, article sign-off all read it.
  - **Polish v2 surface change 2026-05-01.** Polish button + AestheticSuggestionsPanel removed from COMPOSE in `dialecta-editor.jsx`; new `PolishLevelPanel` lives in the FINAL stage with Light / Standard / Editorial / Custom radios + five toggleable features. Polish runs server-side at submit-time only.
  - **Admin re-parse on post pages.** New `dialecta-admin-repolish.jsx`. Floating "Re-parse" button on `post.hbs`, visible only to members with `profiles.is_admin = true`. Modal mirrors editor's PolishLevelPanel. Submits to `/api/article/repolish`.
  - **Dev Admin Tuning tab is no longer a placeholder.** `/api/admin/pulse` is wired (`api/admin/pulse.js`) and returns live counts (members, comments, articles, axis_events, feedback) plus a curated knob inventory. The Tuning surface in `dialecta-dev-admin.jsx` consumes this. Gated by `tuning.read`.
  - **New admin endpoints.** `api/admin/articles.js`, `api/admin/members.js`, `api/admin/pulse.js`. Plus `api/profile/cover-search.js` (cover image search for the article editor).
  - **Site voice spec landed.** `project_dialecta_site_voice.md` (instructional pages: about / pact / guidebook / stewards / welcome) and `project_voice_master_draft.md` (project-agnostic craft tool). Both distinct from the editor's elevated register.
  - **Migration discipline formalized.** `feedback_migration_numbering.md` (always `ls supabase/migrations/` before naming a new file; pre-existing collisions at 007/013/014 acknowledged) + `project_supabase_mcp_migrations.md` (apply via `mcp__supabase__apply_migration`, not the dashboard).
  - **Dark mode formally deferred.** `project_dark_mode_plan.md`. Appearance toggle waits for site CSS unification.
  - **Public SEO architecture (Cloudflare + Vercel SSR) formally deferred.** `project_public_seo_architecture.md`. Distinct from today's Ghost-native SEO config; the deferred work is specifically the `/library/` public quote surface and Profile SEO routes.
  - **Bundles fresh.** All four (`bundle.js`, `profile.js`, `quotes.js`, `dev-admin.js`) compiled 2026-05-02 00:24, after the latest source edits at 2026-05-01 23:50. `npm run build` was run.
  - **Pre-launch security hardening migration: SHIPPED 2026-05-02 late evening as 028 + 028b.** Full advisor sweep beyond the original `project_deferred_security` scope: in addition to axis_events RLS and three function `search_path` warnings, also closed a SECURITY DEFINER view (`profile_effective_capabilities`) and added explicit service-role-only marker policies to twelve internal tables to clear all "RLS enabled, no policy" INFO entries. `get_advisors` after returns `{lints: []}`. See v0.14 Resolved entry below.
  - **Migration list current state:** 020 parent_id (replies), 021 feedback_screenshots_bucket, 022 opinion_map_overrides, 023 mentions, 024 opinion_map_positions_multi, 025 tier_nominations, 026 + 026b signature_font, 027 aspirational_archetype, **028 + 028b pre_launch_security_hardening (added 2026-05-02 late evening)**.
- **v0.12** Day-close 2026-04-30 (evening). The roadmap stopped being a roadmap. Most of the items the original Project Brief described as Phase 4 (Platform) and Phase 5 (Scale, deferred) have either shipped, been declined, or had their substrate built into earlier phases. Phase status as of tonight:
  - **Phases 1–3 (Pilot, Engine, Mapping):** complete or near-complete. Three live users on the platform. Mention notifications shipped this evening, closing the headline notification trigger; reply / follow / new-article triggers remain as small pattern-copy work. Opinion topic analyzation calibration continues over the weekend.
  - **Phase 4 (Platform):** reframed. The original brief framed this as a stack rewrite (Next.js + Supabase + new admin + new auth). What actually happened: every Phase 4 deliverable shipped on the existing stack (Ghost + Vercel API + Supabase + esbuild + React 19), and the migration was declined. The current stack is now declared the platform. Next.js migration is no longer "deferred"; it is closed. To reopen the question, a specific concrete blocker on the current stack would need to be named.
  - **Phase 5 reframed item by item:**
    - **5A Delta Mechanic — built this evening.** The mechanic that gives the Reviser archetype a foundation. Pre-read / Reading / Post-read / Calculation / Reveal / Public-choice flow per the v1.0 spec at `OneDrive\Websites\Dialecta\Delta Mechanic\Dialecta_Delta_Mechanic_Spec.md`. Closes Harmonization Tension #3.
    - **5B Fine-tuned model — genuinely deferred.** Substrate accumulating (axis_events ledger, classifications corpus, feedback queue), but the model itself waits for corpus volume. No code expected near-term.
    - **5C Mobile app — declined.** The responsive web rebuild (Stage B.2 + the 2026-04-29 `style.css` rewrite) is the answer. PWA path may be revisited later; native app is not on the roadmap.
    - **5D Governance — substrate complete; activation is procedural.** Migration 017 (`admin_rbac`) was deliberately built wide enough to support a governance layer (capabilities, audit log, `tuning.read` / `tuning.write` already defined). Activating governance is now a charter / process exercise rather than an engineering one.
  - **Tuning tracker fully audited.** The tuning-engine memory file now lists every `// TUNING:` annotation actually present in code (14 knobs across axis classification, tier nomination, hot ranking, notifications, profile copy), the RBAC capabilities for the future engine, and the items from the original wish list still not yet flagged inline. The Tuning admin tab in `dialecta-dev-admin.jsx` remains a placeholder; building the live dashboard is a single-grep-and-render exercise when knob volume justifies it.
  - **Profile cleanup landed.** Retired `theme/src/dialecta-profile-old.jsx` (2,320 lines, no importers) and `theme/src/dialecta-profile-responsive.jsx` (passthrough shim). Consumers (`dialecta-profile-mount.jsx`, `index.jsx`) now import directly from `dialecta-profile.jsx`. Theme `CLAUDE.md` updated. `npm run build` required before next ZIP so the new import paths land in the bundle.
  - **Community components verified built.** `dialecta-community.jsx`, `-contributors.jsx`, `-author.jsx`, `-feed.jsx` total 2,363 lines. The "Cleanup Item 11 — ContributorsList pending" worry was outdated. Re-scoped to "verify wiring with real volume."
  - **Remaining work to public launch:** mention notifications shipping (in flight), reply/follow/new-article triggers (small), opinion topic calibration (weekend), Delta Mechanic compile + deploy in next build, pre-launch security hardening migration (axis_events RLS + three function search_paths), `npm run build` after the profile cleanup. Six items.
- **v0.11** Day-close 2026-04-29 (evening, first-Fingerprint night). The platform crossed from "scaffolded" to "real" — Rylie Pennington (the first non-Daniel contributor) submitted her first article, and her Fingerprint rendered with actual lit petals. Daniel's Fingerprint backfilled to match. Major work landed:
  - **axis_events ledger end-to-end.** Migrations 013 (classifications.strength), 014 (axis_events table + scores unique constraint), 015 (article-source columns + check constraint). New helper `api/_axis-mapping.js` exposes `deriveAxisEvents` / `deriveArticleAxisEvents` / `recomputeAxisScores` / `deletePriorAxisEventsForClassification`, all TUNING knobs annotated. Wired into `comment.js` (Step 4b), `comment/[id].js` (PATCH re-derives non-Reach events; Reach preserved across edits because article topic is invariant; DELETE cascades via FK), and `article/publish.js` (Step 5 fires 5 axes minus Discourse). Architecture: events are immutable append-only; axis_scores are a materialized view recomputed by replaying the ledger. See axis_events ledger memory entry.
  - **Article-side classification surface.** `dialecta-article-classification.jsx` exports `ArticleTierBadge` (3-column Author Declared / Engine Read / Final) and `ArticleDeclaration` (declaration block + expandable "How the engine read this" disclosure with FlaggedPassage + OpinionAxis sub-components, plus CartesianMap when exactly 2 axes are pure cartesian). Mounted on `post.hbs` via `#dialecta-tier-badge` (in meta bar) and `#dialecta-declaration` (above article body). Closes audit items a-b9 + a-b11.
  - **Polish v2 (external landing).** `aesthetic-suggest.js` fully rewritten: 4 levels (light / standard / editorial / custom), server-side at submit-time, replaces v1's per-suggestion review surface. `submit.js` now always invokes polish at submit; `articles.original_html` preserved alongside polished version + `polish_level` + `polish_change_log`. Admin re-polish mount added on `post.hbs`. Author's prose remains byte-for-byte identical except policy transforms. See Polish v2 memory entry.
  - **Pact Path A/B eliminated.** Single-path commitment now. `committed-sealed` state transforms the form on commit (signature hardens, button replaced with "Welcome to Dialecta — Begin →" link). API made `pact_path` optional.
  - **Compose hard-block when profile incomplete.** `requireCompleteProfile` helper; lazy-create email-local-part fallback in `/api/profile/[id]`. Private Draft Mode COMPOSE stage now replaced entirely with setup gate when status='incomplete' (no more soft banner that didn't actually block).
  - **Article-bottom author bio (editorial close).** Mirrors NYT/Atlantic pattern; populated by Ghost primary_author then patched by byline-override script when Supabase author exists.
  - **Byline override Path C-lite shipped.** Single-article patch in `post.hbs`; bulk endpoint `/api/article/_authors?ids=...` patches `.post-card-author` text + href on `default.hbs` for cards.
  - **Tier filter UX option D.** TopologyBar absorbs filtering. Empty state preamble + "What do these mean?" link; populated state shows colored proportional strip (clickable) + clickable legend chips with TierIcon. ControlBar simplified.
  - **Backfills.** Rylie's first article axis_events derived; Daniel's full article + comment history backfilled (11 axis_events); stale Discourse axis_scores row (legacy L1/L2/L3/L4 keys, comment_count=47) explicitly cleaned to canonical zero state.
  - **Ghost tag duplicates cleanup.** Idempotent script `cleanup-ghost-tag-duplicates.mjs`; 2 dupes merged (`environment_energy-2`, `psychology_behavior-2`). Companion to `seed-ghost-tags.mjs` which seeded canonical 12 topics earlier today.
  - **Stewards M5 polish.** `page-stewards.hbs` line 942: "The Republic recognizes" → "The community recognizes". Closes a-b14.
  - **External landings noted (parallel chat / linter work):** responsive `style.css` rewrite (`--bp-*` breakpoints, `--type-*` fluid type, 7-stop `--brass-gradient`, `--max-width: 1180px`), Author View bundle endpoint at `/api/profile/_author`, fingerprint perf memory (never N>2 live Fingerprints).
  - **Commits.** Two on the API repo: `f1a37bf` (axis_events ledger + article-side classification + 24 new files / 7 modified) and `53364fa` (.gitignore log pattern fix). The theme repo isn't git'd, so theme work lives on disk pending ZIP upload.
  - **Open after this.** Theme ZIP + Magic Pages upload is the only operational step between platform and the first wave of invitees. Author View on Community page handed off to a separate chat (handoff doc written).
- **v0.10** M5 polish pass 2026-04-29 (late afternoon). M2 closed: a-b3 (Diplomat/Oracle scrub) discharged retroactively, verified that the unified `dialecta-profile.jsx` ARCHETYPES const contains exactly the canonical 8. M5 partially closed: a-b14 done (page-stewards.hbs line 942: "The Republic recognizes" → "The community recognizes"), a-b16 done (prose form accepted; standalone Charter deferred to a future companion document, dashboard p1-6 description reframed). a-b15 deferred at user request — page-stewards.hbs is being reviewed by another process; revisit when complete (current intent: replace inline base64 PNG masthead with `{{@site.logo}}`). Pact cohesion survey: 13 inline `linear-gradient(...)` literals in page-pact.hbs plus a parallel `--pact-card-brass` token; zero usage of canonical `--brass-gradient`/`--wood-*`/`--paper-*` or utility classes. Brass buttons (`class="brass"`) are canonical. The deeper Pact tokenization belongs to Sprint 7 cohesion-pass per the 04-28 evening handoff; not a polish-session task. Logged here as a tracked finding, no dashboard item created (already scoped by Sprint 7).
- **v0.9** Project reconciliation pass 2026-04-29 (afternoon). Handoff docs (5 of them, 27th morning through 29th engines build) read end-to-end and incorporated. Audit Trail project mapped: 18 audit-derived queue items inventoried by current status; 5 fully done, 3 likely done with verification owed (a-b4 / a-b5 / a-d2), 3 partial (a-b8 / a-b9 / a-b13), 2 deferred to Phase 2.5 (a-b10 / a-b12 comment-side dropped), 5 open and small (a-b3 / a-b11 / a-b14 / a-b15 / a-b16). a-d2 verified Complete via Supabase MCP query (production enum returned exactly the canonical 8). API CLAUDE.md gained: full migrations table (000–007, 011, 012), Vercel Pro tier note, comment edit/delete routes, Production Architecture Decisions section (Path C-lite, three-surface model, wait windows, design token rule), updated env vars, Living Progress Documents section. Dashboard DEFAULT_ITEMS reconciled with current statuses + 7 new build items (a-b17 through a-b23) capturing the article pipeline, polish engine, article display surface, discourse engines build, Steward Order picker, mobile responsive Stage B.2, topics v2 unification, quote library page. Six new memory files seeded (design tokens, three-surface model, wait windows, Path C-lite auth, First Quills roadmap, handoff/audit/dashboard reference).
- **v0.8** Big build push 2026-04-27 → 2026-04-29. Article writing pipeline shipped end-to-end (Phase 1A through 1C: articles table + classify + submit + publish + reader + aesthetic-suggest + suggest-topics + member-uuid auth + polished_html). Article editor UI (`theme/src/dialecta-editor.jsx`) and dedicated articles feed (`page-articles.hbs` at `/articles/`) live; default route `/` now serves profile for signed-in members. Topic taxonomy v2 unified in `theme/src/topics.js` (the old 9-topic constant in `dialecta-profile.jsx` is now imported from there; the cross-repo landmine documented in API CLAUDE.md is closed). Mobile responsive rebuild Stage B.2: parallel desktop/mobile profile split retired in favor of unified responsive `dialecta-profile.jsx`. Comment compose ritual rebuilt as Private Draft Mode Stage 1 (`dialecta-private-draft.jsx`): nine stages, mobile-aware from day one, modernized from the s11 prototype with companion `dialecta-discourse-layer.jsx`, `dialecta-tier-badge.jsx`, `dialecta-reflection-bar.jsx`. Steward Order surfaces shipped (`dialecta-profile-order.jsx`, OrderBadge + OrderPatternCard, backed by `/api/article/classify-order` and `/api/profile/order`). Community page started (`page-community.hbs` mount stub). Project Index unlocked from the OneDrive read-only rule (Index only) so it can stay current.
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
