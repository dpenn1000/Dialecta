---
title: Theme System — Phase 0 Specification (DRAFT)
status: DRAFT — pending Daniel's review and approval
created: 2026-05-08
purpose: Approval artifact for the multi-theme + design-system unification project. Lists every keep/unify decision, every new token, and every open question that must be settled before any code begins.
---

# Theme System — Phase 0 Specification (DRAFT)

> This is the approval gate for the design-system unification + multi-theme project. Nothing in `style.css` or `src/` should change until you (Daniel) sign off on this document. Sign-off is the only thing that unblocks Phase 1.

## Why this exists

Two motivations, one project:

1. **Dark mode is on the roadmap.** The Appearance row in profile settings is intentionally disabled with a "Soon" badge until the token system is unified. Building dark mode against the current scattered color references would mean diverging the parchment palette while pages are still mid-build, then redoing the work later.
2. **Pages drifted apart while the site was being built.** Pages built earlier against early concept mockups have one-off visual treatments that diverge from later pages. Rebuilding the color system into a unified token vocabulary is a natural moment to homogenize.

The audit (2026-05-08) confirmed the scale: ~218 color literals in `style.css` outside `:root`, ~1,260 in JSX components across 44 files, 4 button implementations, 3 card-surface systems, 2 modal systems, and 5 pages each redeclaring the page-hero `--hero-brass` token independently.

About 60% of the work is mechanical (alias replacement). The interesting design decisions cluster around 8-10 unification calls.

---

## How to use this document

This is structured as a series of **decisions you need to make**, each with:

- **Current state** (what's there now)
- **Proposed change** (recommendation)
- **Rationale** (why)
- **Options** (where there's a real choice)
- **Your decision** (an explicit blank to fill in)

When every decision below is settled, Phase 1 (CSS foundation work) can begin. Phase 1 itself is invisible to users — just additive changes to `:root`. Visible changes start in Phase 3.

---

# PART 1 — Token Architecture

## 1.1 The semantic layer

**Today, tokens are named for what they look like:** `--cream`, `--paper`, `--ink`, `--brass-warm`. This is good for designers but bad for theming, because a dark theme needs `--cream` to no longer be cream.

**The proposal:** keep all existing palette tokens (they describe the brand vocabulary), and add a parallel **role token layer** on top. Components stop referencing palette tokens directly; they reference role tokens. Themes override only the role layer.

Example:

```css
:root {
  /* Palette layer — the Dialecta vocabulary, theme-stable */
  --cream:        #f7f2e8;
  --paper:        #fefcf5;
  --paper-bright: #fffdf8;
  --ink:          #1c1814;
  --ink-soft:     #2c2620;
  --body:         #3a342c;
  /* ... brass, wood, terra, etc. */

  /* Role layer — what a page or component actually wants */
  --surface-page:     var(--cream);
  --surface-card:     var(--paper);
  --surface-elevated: var(--paper-bright);
  --text-primary:     var(--ink);
  --text-soft:        var(--ink-soft);
  --text-body:        var(--body);
  /* ... etc. */
}

[data-theme="dark"] {
  /* Only the role layer flips. Palette tokens remain semantic constants. */
  --surface-page:     #1a1814;
  --surface-card:     #232020;
  --text-primary:     #f0ebe2;
  /* ... */
}
```

**Why this matters:** the brass-gradient italic text never changes. The Tier badge gradient never changes. The fingerprint archetype palettes never change. Those are *brand identity*. What changes between themes is the *page surface*, the *card background*, the *text on those surfaces*, the *border weights*, the *shadows*. Those are the role tokens.

**Decision 1.1.A — Approve semantic role-token layer architecture?**

- [ ] **Yes, proceed as described**
- [ ] **No, alternative approach:** _____________
- [ ] **Modify:** _____________

---

## 1.2 The proposed role-token vocabulary

These are the new tokens that would be added in Phase 1. None replace existing tokens. This is purely additive.

### Surfaces (5 tokens)

| Token | Default value | What it represents |
|---|---|---|
| `--surface-page` | `var(--cream)` | Sitewide page background (parchment) |
| `--surface-card` | `var(--paper)` | Article body, post cards (light-cream paper sheet) |
| `--surface-elevated` | `var(--paper-bright)` | Engine cards (Private Draft, Discourse Layer) |
| `--surface-overlay` | `rgba(28,24,20,0.75)` | Modal scrims |
| `--surface-deep` | `var(--dark-card)` | Existing dark-card token, surfaced as a role |

### Text (7 tokens)

| Token | Default value | What it represents |
|---|---|---|
| `--text-primary` | `var(--ink)` | Body copy, primary readable text |
| `--text-soft` | `var(--ink-soft)` | Display titles |
| `--text-body` | `var(--body)` | Long-form reading |
| `--text-secondary` | `var(--secondary)` | Meta, captions |
| `--text-tertiary` | `var(--tertiary)` | Helper text, timestamps |
| `--text-on-brass` | `var(--cream)` | Text rendered on brass surfaces |
| `--text-inverse` | `var(--cream)` | Text on dark surfaces (matches dark mode default text) |

### Borders (4 tokens — neutral)

| Token | Default value | What it represents |
|---|---|---|
| `--border-hairline` | `rgba(28,24,20,0.06)` | Almost invisible — internal divisions |
| `--border-light` | existing `rgba(180,175,165,0.28)` | Container edges |
| `--border-regular` | `rgba(28,24,20,0.16)` | Standard component edges |
| `--border-strong` | `rgba(28,24,20,0.32)` | Active states, focused elements |

### Brass borders (4 tokens — accent)

Replaces the 41 ad-hoc `rgba(184,115,42,0.X)` literals scattered through `style.css`.

| Token | Alpha | Use |
|---|---|---|
| `--brass-border-hairline` | 0.16 | Hairlines, dividers |
| `--brass-border-light` | 0.22 | Light container edges |
| `--brass-border-regular` | 0.32 | Standard interactive borders |
| `--brass-border-strong` | 0.45 | Active states, hover-pressed |

### Shadows (4 tokens — elevation scale)

Today shadows are ad-hoc; values range from no shadow to `0 32px 80px rgba(28,24,20,0.55)`.

| Token | Value (light theme) | Use |
|---|---|---|
| `--shadow-1` | none / `inset 0 0 0 1px var(--border-hairline)` | Flat cards on parchment |
| `--shadow-2` | `0 4px 12px rgba(28,24,20,0.06)` | Subtle lift (hover states) |
| `--shadow-3` | `0 18px 60px rgba(28,24,20,0.18)` | Modals, overlays |
| `--shadow-4` | `0 32px 80px rgba(28,24,20,0.30)` | Celebration / hero modal |

### Brass-on-text alphas (3 tokens)

For cream text on brass nav/header surfaces. Replaces 5 ad-hoc literals in nav rules.

| Token | Alpha | Use |
|---|---|---|
| `--brass-on-text-dim` | 0.50 | Inactive nav items |
| `--brass-on-text-medium` | 0.70 | Default state |
| `--brass-on-text-strong` | 0.95 | Active / hover |

### Modal (2 tokens)

| Token | Default value | Use |
|---|---|---|
| `--modal-scrim` | `rgba(28,24,20,0.75)` | Backdrop on all modals |
| `--modal-blur` | `4px` | Backdrop filter blur amount |

### Wood palette (3 tokens — promoted to root)

Currently defined as local tokens inside About / Guidebook / Stewards `<style>` blocks. Promote to `:root`.

| Token | Value | Use |
|---|---|---|
| `--walnut` | `#4a2810` | Deepest wood accent |
| `--cherry` | `#6e3917` | Warm mid-wood |
| `--burnt` | `#8a4a18` | Lit edge of wood |

### Topic colors (12 tokens — new family)

Currently 12 unmanaged hex literals in `style.css` (lines 2545–2556). Promote each to `:root` with explicit names.

| Token | Value |
|---|---|
| `--topic-politics-governance` | `#9e2020` |
| `--topic-law-justice` | `#b04020` |
| `--topic-history` | `#9a5818` |
| `--topic-economics` | `#b87a18` |
| `--topic-environment-energy` | `#3a7a24` |
| `--topic-health-medicine` | `#287858` |
| `--topic-psychology-behavior` | `#267080` |
| `--topic-science-technology` | `#2650a0` |
| `--topic-philosophy-ethics` | `#3a3888` |
| `--topic-arts-humanities` | `#6a3a9a` |
| `--topic-theology-spirituality` | `#7a2a80` |
| `--topic-society-culture` | `#8a2858` |

### Role tints (12 tokens — admin RBAC)

Currently baked into the `ROLE_TINTS` JS object in `dialecta-dev-admin.jsx` (248 hex literals). Each role gets bg, border, text.

| Token group | Roles |
|---|---|
| `--role-publisher-{bg,border,text}` | Publisher tier |
| `--role-editor-{bg,border,text}` | Editor tier |
| `--role-curator-{bg,border,text}` | Curator tier |
| `--role-reviewer-{bg,border,text}` | Reviewer tier |

(Specific values move from JS into CSS in Phase 5; deferring exact values to that phase.)

### Total new tokens: ~50

**Decision 1.2.A — Approve the role-token vocabulary above?**

- [ ] **Yes, all categories as proposed**
- [ ] **Modify the following:** _____________

**Decision 1.2.B — Token naming convention.** I've used `--surface-*`, `--text-*`, `--border-*`, `--shadow-*`, `--brass-border-*`, `--topic-*`, `--role-*-*`. Any rename preferences before we lock this in? (Renaming after Phase 2 is expensive.)

- [ ] **Names as above**
- [ ] **Rename:** _____________

---

## 1.3 Theme-switching mechanism

**Proposal:** `data-theme` attribute on `<html>`, set by JavaScript on page load, persisted to a member preference (Supabase column on `profiles`).

```html
<html data-theme="light">  <!-- default -->
<html data-theme="dark">
<html data-theme="system"> <!-- follows prefers-color-scheme -->
```

```css
:root              { /* light values */ }
[data-theme="dark"] { /* dark overrides */ }

@media (prefers-color-scheme: dark) {
  [data-theme="system"] { /* dark overrides via system */ }
}
```

**Loading sequence:**

1. Inline `<script>` in `default.hbs` `<head>` reads localStorage cache of theme preference (avoid FOUC)
2. Sets `data-theme` attribute before any CSS paints
3. After member auth resolves, syncs preference from server
4. Member toggle in profile settings writes both localStorage + server

**The "Soon" badge on the Appearance row** in `dialecta-profile-settings.jsx` is removed in Phase 6 when this lights up.

**Decision 1.3.A — Theme persistence model.**

- [ ] **Per-member preference, persisted server-side** (recommended — follows the contributor between devices)
- [ ] **Browser-local only** (simpler, but each device has its own preference)
- [ ] **Both, with server as canonical** (most complex but most robust)

**Decision 1.3.B — System default.**

- [ ] **New visitors get `light` until they choose** (current site identity is light parchment; first impression should match)
- [ ] **New visitors get `system`** (respects OS preference; some readers will land in dark immediately)

---

# PART 2 — The Keep/Unify Catalog

This section enumerates every distinctive treatment the audit surfaced and proposes a disposition for each. Mark each row as approved, modified, or rejected.

## 2.1 KEEP — load-bearing, semantic, intentional

These are flagged by the audit as standing out, but they should NOT be unified. Each one carries meaning.

| # | Element | Why it stays | Approval |
|---|---|---|---|
| K1 | **Brass-gradient italic display** (`.dialecta-brass`) | Canonical "protagonist" treatment per design tokens. The platform's visual signature. | [ ] |
| K2 | **TierBadge tier-specific gradients** | Color encodes Tier Psychology brightness ladder (Forum cream → Breach dark). Semantic. | [ ] |
| K3 | **Topic color values** (the 12 hexes themselves) | Each topic has a recognizable hue. Tokenize the access pattern but keep the values. | [ ] |
| K4 | **Fingerprint engine palettes** (78 literals in `dialecta-fingerprint-engine.jsx`) | 36 archetype palettes are identity data, not theme chrome. They render the contributor's fingerprint. | [ ] |
| K5 | **Opinion map pole colors** (35 literals in `dialecta-opinion-map.jsx`) | Semantic axes (orange=left, blue=right, green=top, red=bottom). | [ ] |
| K6 | **Pact `.parchment` surface** | Intentional ritual treatment for the contributor commitment. See Decision D1 below. | [ ] |
| K7 | **File input dashed brass border** | Affordance signal for "drop a screenshot." Visual distinction is functional. | [ ] |
| K8 | **Two-bar nav** (mobile drawer + desktop top nav) | Orthogonal layout needs. Documented in `style.css` "RESPONSIVE CONTRACT." | [ ] |
| K9 | **Community feed wood-frame** | Signals link-able content. Part of the "paper + frame" visual system. | [ ] |

---

## 2.2 UNIFY — accidental drift, candidates for consolidation

These were built against different concept mockups at different times and should converge.

| # | Element | Current state | Proposed unification | Approval |
|---|---|---|---|---|
| U1 | **Button primitive** | 4 implementations (mono outline / filled serif / pill serif / outline mono) across celebration-modal, handle-setup, profile-edit, nav-drawer | 3-tier system: Primary (filled), Secondary (outline brass), Ghost (transparent). New `Button` JSX primitive in Phase 4. | [ ] |
| U2 | **Card elevation scale** | 3 systems with no documented scale (flat / rimmed / heavy-shadow) | 4-token shadow scale `--shadow-1/2/3/4` (Phase 1 tokens, applied in Phase 4) | [ ] |
| U3 | **Modal system** | React fixed-overlay (celebration, handle-setup) vs CSS `.post-overlay`, different scrim opacities (82% blur vs 65% no-blur) | One JSX `Modal` primitive at z-index 10000, all reading `--modal-scrim` + `--modal-blur` | [ ] |
| U4 | **Page hero** | 5 pages each redeclare `--hero-brass` independently in their own `<style>` block (About, Guidebook, Fingerprint, Stewards, Articles) | One `.page-hero` + `.page-hero-eyebrow` + `.page-hero-title` + `.page-hero-rule` class system in `style.css` | [ ] |
| U5 | **Hero ornament** (`✦ ✦ ✦`) | 3 implementations (`::after` pseudo / explicit `<div>` / absent) | Single pseudo-element on `.page-hero` (with `aria-hidden`) | [ ] |
| U6 | **Paper-grain SVG** | Identical data URL inlined on 4 pages (~150 chars each, repeated) | One `--paper-grain` token in `:root` | [ ] |
| U7 | **Wood-tone palette** | `--walnut`, `--cherry`, `--burnt` defined locally in About, Guidebook, Stewards `<style>` blocks | Promote to `:root` (see token spec 1.2) | [ ] |
| U8 | **Page padding** | 4 different `clamp()` recipes (About `4vw`, Fingerprint `3vw`, Articles `1.5vw + 10px`, etc.) | Single `clamp(16px, 3vw, 32px)` across all `.page` wrappers | [ ] |
| U9 | **Brass-border alphas** (41 literals) | Ad-hoc `rgba(184,115,42,0.X)` at varying opacity | 4 tokens `--brass-border-hairline/light/regular/strong` | [ ] |
| U10 | **Ink-shadow alphas** (18 literals) | Ad-hoc `rgba(28,24,20,0.0X)` 0.04–0.15 | 3 tokens `--shadow-subtle/light/medium` | [ ] |
| U11 | **Cream-on-brass text alphas** (5 nav literals) | Ad-hoc 0.35/0.5/0.7/0.82 | 3 tokens `--brass-on-text-dim/medium/strong` | [ ] |
| U12 | **Topic chip vs nav-drawer pill** | Mono solid vs serif outline | One `.chip` primitive (mono solid) | [ ] |
| U13 | **TIER_GRADIENTS** | Duplicated across `dialecta-profile.jsx` AND `dialecta-sidebar.jsx` | Single source — new `src/tiers.js` constants module | [ ] |
| U14 | **Font family declarations** | Defined in 3+ places (default.hbs + page-pact + About/Guidebook/Stewards inline) | `:root` only | [ ] |
| U15 | **Auth-gating UI** | page-write does inline blue italic Cormorant; page-profile/community/quotes/dev-admin defer to React | Pick one: server-side `.callout` block, or always React | [ ] |

**Approval bulk action:** if all U-rows look right, you can write **"Approve U1–U15 as proposed"** at the end and skip the per-row checkboxes.

---

# PART 3 — The Four Open Decisions

These are real design calls where I have a recommendation but no obvious right answer. Each needs your judgment.

## D1 — Pact's `.parchment` surface

**Current state:** `page-pact.hbs` uses a `.parchment` surface with radial gradients and a feTurbulence SVG noise overlay. This is distinct from the paper-grain treatment used on About / Guidebook / Stewards.

**Question:** in the unified card-surface system, does Pact keep its parchment treatment as a deliberately-distinct "ritual surface," or do we fold it into the unified "elevated paper" treatment?

**Options:**

- **D1.a — Keep distinct (recommended).** The Pact is a contributor commitment ritual. It's supposed to feel different — older, more weighted, more deliberate. Folding it would flatten that meaning.
- **D1.b — Unify into a single "elevated paper" treatment.** Cuts CSS surface area further but loses ritual signal.
- **D1.c — Keep parchment, but rename `.parchment` to `.surface-ritual` and document its single intended use.**

**Your decision:** _____________

---

## D2 — Wood-tone palette behavior in dark mode

**Current state:** walnut / cherry / burnt accents on About / Guidebook / Stewards are warm wood tones rendered on cream parchment surfaces.

**Question:** in dark mode, do these wood tones keep their identity (warm browns), or shift?

**Options:**

- **D2.a — Keep wood identity (recommended).** In dark mode, parchment becomes a "lit document on a dark desk." The wood frame still reads as wood — maybe slightly warmer and more saturated, but recognizably the same vocabulary. The dark surround makes the wood feel even more like a craftsman's surface.
- **D2.b — Shift wood to brass-warm/copper variants.** Wood becomes more metallic to harmonize with brass on dark backgrounds.
- **D2.c — Keep light values; let wood read brighter against dark.** Probably looks bad — high-contrast warm browns will vibrate.

**Your decision:** _____________

---

## D3 — The editor `T` token object

**Current state:** `dialecta-editor.jsx` defines a JS-side `T` constant object holding ~25 colors (lifted from the s11 spec). The component reads `T.surface`, `T.text`, etc. throughout.

**Question:** how does this migrate?

**Options:**

- **D3.a — Migrate to CSS custom properties (recommended).** Each `T.foo` becomes `var(--editor-foo)`. Editor reads from CSS, themes flow naturally. Loses the closure-style theme contract, gains theme-ability.
- **D3.b — Keep `T` as a JS object that reads CSS vars at mount time.** Most flexible: `T.surface = getComputedStyle(...).getPropertyValue('--editor-surface')`. Could enable per-tier editor themes (different surface color when a Steward writes vs a Spark writes). But adds runtime cost and complexity.
- **D3.c — Defer the call.** Migrate JSX literals in Phase 5 but leave the `T` object as-is until we have a real reason to make the editor theme-able beyond light/dark.

**Your decision:** _____________

---

## D4 — Topic colors in dark mode

**Current state:** the 12 topic hex values are saturated brights tuned for cream backgrounds (e.g., `#9e2020` red on cream parchment).

**Question:** how do they behave on a dark surface?

**Options:**

- **D4.a — Each topic gets a light/dark pair (recommended).** `--topic-politics-governance` becomes one of two values depending on theme. Adds 12 more dark-mode tokens but each topic stays readable.
- **D4.b — Keep current values, add a low-opacity surface underneath the chip in dark mode.** Single chip color, but a tinted background plate. Simpler but flatter.
- **D4.c — Desaturate all topics in dark mode by a fixed amount.** Programmatic color manipulation via `color-mix()`. Cleanest CSS, but each topic loses some identity.

**Your decision:** _____________

---

# PART 4 — Dark Theme Palette Specification

**This section is a placeholder.** The actual dark-mode color values will be derived from the inspiration photos in `C:\Users\dan\OneDrive\Websites\Dialecta\Logos\` (created 2026-05-01) during a dedicated review session.

What this section will eventually contain:

- The dark-mode value for every role token (~50 entries)
- Reference screenshots from the Logos folder showing the visual target
- Notes on any role tokens that need additional variants for dark mode (per Decision D4 above)

**Decision 4.A — Schedule the dark-palette derivation session.** This is its own working block, separate from the rest of Phase 0 approval. Suggest: 30-45 minutes with the OneDrive Logos folder open, walking through each role token and picking values. Can happen any time before Phase 6.

**Your scheduled time:** _____________

---

# PART 5 — Phased Plan Recap & Launch Timing

| Phase | Deliverable | Visible to users? | Estimated lift | Recommended timing |
|---|---|---|---|---|
| 0 | This spec, approved | No | (in progress) | Now |
| 1 | New role tokens added to `:root`, `[data-theme]` mechanism wired | No | 2-3 hours | Anytime — zero risk |
| 2 | Mechanical CSS sweep (~135 of 218 literals replaced) | No (zero visual diff) | 3-4 hours | Anytime — zero risk |
| 3 | Hero unification across 5 pages | **Yes** (intentional homogenization) | 4-5 hours | Pre-launch boost OR post-launch quiet, your call |
| 4 | Primitive system (Button / Card / Modal / Chip) | **Yes** (visible coherence) | 8-10 hours | Post-launch (riskier diff) |
| 5 | JSX color migration sweep | Mostly no | 6-8 hours | Anytime after Phase 4 |
| 6 | Dark mode lights up; Appearance toggle re-enabled | **Yes** (the headline) | 7-8 hours | Once Phases 1–5 land |
| 7 | N-theme scaffolding (sepia, high-contrast, seasonal recipes) | Optional | 2-3 hours | Whenever |

**Total: ~30-40 working hours, 6-8 sessions.**

**Decision 5.A — Launch-relative timing.** Where do we sit relative to the M6 Facebook invitation wave (sent 2026-05-02)?

- [ ] **Conservative — Phases 0-2 only until launch traffic settles, then resume**
- [ ] **Moderate — Phases 0-3 (hero unification is a coherence win for new visitors)**
- [ ] **Full speed — proceed through all phases as scheduled**

---

# PART 6 — Approval Checklist

When all the boxes below are checked, Phase 1 begins.

- [ ] **Decision 1.1.A** — Semantic role-token layer architecture approved
- [ ] **Decision 1.2.A** — Role-token vocabulary approved
- [ ] **Decision 1.2.B** — Token naming convention approved
- [ ] **Decision 1.3.A** — Theme persistence model picked
- [ ] **Decision 1.3.B** — System default for new visitors picked
- [ ] **K1–K9** — Keep list approved (or modifications noted)
- [ ] **U1–U15** — Unify list approved (or modifications noted)
- [ ] **D1** — Pact `.parchment` decision recorded
- [ ] **D2** — Wood-tone behavior in dark mode decided
- [ ] **D3** — Editor `T` object migration approach decided
- [ ] **D4** — Topic colors in dark mode decided
- [ ] **Decision 4.A** — Dark-palette derivation session scheduled (or deferred to Phase 6 startup)
- [ ] **Decision 5.A** — Launch-relative timing chosen

**Daniel's signature / approval date:** _____________

---

# Appendix A — Audit Numbers Reference

Source: 2026-05-08 four-agent audit.

- **`style.css`:** 3,092 lines total. 218 color literals outside `:root` (97 hex + 121 rgba). 35% are pure aliases of existing tokens, 25% are alpha-variants, 40% are one-offs (most of which are the 12 topic colors and a few neutral grays).
- **JSX components:** ~1,260 hex/rgba literals across 44 files. Top 5 files account for 50% of literals: `dialecta-dev-admin.jsx` (248), `dialecta-profile.jsx` (191), `dialecta-editor.jsx` (146), `dialecta-sidebar.jsx` (78), `dialecta-fingerprint-engine.jsx` (78). The fingerprint engine and opinion map (~115 literals combined) are semantic palette data and stay as-is.
- **HBS templates:** 15 top-level files. 5 redeclare `--hero-brass` independently. 4 inline an identical paper-grain SVG data URL.
- **UI primitives:** 4 button impls, 3 card systems, 2 modal systems, 4 badge variants, 4 informal shadow tiers (no documented scale).

# Appendix B — Files That Will Be Touched

**Phase 1-2 (CSS only):**
- `assets/css/style.css` — extend `:root`, replace alias literals

**Phase 3 (hero unification):**
- `assets/css/style.css` — new `.page-hero` class set
- `page-about.hbs`, `page-guidebook.hbs`, `page-fingerprint.hbs`, `page-stewards.hbs`, `page-articles.hbs` — strip inline `<style>` hero blocks

**Phase 4 (primitives):**
- New: `src/dialecta-button.jsx`, `src/dialecta-modal.jsx`, `src/dialecta-chip.jsx`
- Migration: `src/dialecta-celebration-modal.jsx`, `src/dialecta-handle-setup.jsx`, `src/dialecta-profile-edit.jsx`, `src/dialecta-community-feed.jsx`, others
- `assets/css/style.css` — retire `.post-overlay` CSS in favor of JSX modal

**Phase 5 (JSX color sweep):**
- `src/dialecta-dev-admin.jsx` (ROLE_TINTS → tokens)
- `src/dialecta-editor.jsx` (T object → tokens, per Decision D3)
- New: `src/tiers.js` (consolidated TIER_GRADIENTS)
- `src/dialecta-profile.jsx`, `src/dialecta-sidebar.jsx` — read from `tiers.js`
- ~10 other files (growth-scroll, self-snapshot, community variants)

**Phase 6 (dark mode):**
- `assets/css/style.css` — `[data-theme="dark"]` block
- `default.hbs` — inline pre-paint script for theme detection
- `src/dialecta-profile-settings.jsx` — re-enable Appearance row
- API: new column on `profiles` for theme preference (separate migration)

**Phase 7 (scaffolding):**
- New documentation file
- Possibly new admin tab in `dialecta-dev-admin.jsx` for theme preview

---

*End of draft. Save your decisions inline in this file or note them separately — either way, when this is ready, we resume at Phase 1.*
