# Dialecta — Codebase Audit Session Brief

*Phase 1 Launch Readiness Pass*
*Original: April 2026 · Amended: 2026-04-26 (environment-setup learnings folded in)*

---

## Purpose

Before final pre-launch builds, run a comprehensive audit to reach an **optimized, non-redundant, scale-ready foundation**. The goal is twofold:

1. **Phase 1 readiness** — clear stale code, resolve drift, and confirm every live data path is sound enough to ship.
2. **Scale readiness** — establish conventions and canonical-file authority so that Growth Layer, Delta Mechanic, and the rest of the deferred build stack can be added without refactoring underneath them.

A successful audit produces confidence that the foundation is right, not just a backlog of fixes.

---

## When to Run This

After all three conditions are met:

1. Comment submission flow wired (`POST /api/classify` and `POST /api/comment` connected to `dialecta-discourse-layer.jsx`)
2. Ghost Content API key set and Live Feed pulling real articles
3. Ghost tags created with canonical 12-topic slugs

At that point every major data path has real data flowing through it and the audit has a stable target.

---

## Pre-Audit Work Already Completed (2026-04-26)

The environment-setup session resolved the structural prerequisites for the audit. **Do not re-do these.** They are baseline state when the audit runs:

- **Theme `CLAUDE.md` migrated** from stale `content\themes\dialecta-theme\` to the active dir at `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`. Folder name, entry points (`dialecta-profile-mount.jsx`), and src/ file list are accurate.
- **API `CLAUDE.md` cross-references corrected** — theme path, profile entry-point name, deploy commands, repo locations table, and footer specs reference all updated.
- **Stale `content\themes\dialecta-theme\` folder fully deleted** — was a frozen Apr 18 snapshot with `profile-bootstrap.jsx` and a dead (zero-commit, no-remote) git repo. **It no longer exists.** Do not look for it during the audit.
- **Stale `content\themes\dialecta-theme.zip` deleted** — built from the now-removed folder.
- **Duplicate `Dialecta_Contributor_Identity.md` resolved** — root-level OneDrive copy was older + smaller than the `Fundamentals/` version. Root copy deleted; Fundamentals copy is canonical.
- **OneDrive read access wired** in both `.claude/settings.local.json` files (theme + API) for `C:\Users\dan\OneDrive\Websites\Dialecta\**` — Claude can grep and reference specs but cannot modify them.
- **Supabase MCP installed** in `C:\dialecta-api\.mcp.json` (HTTP, read-only, browser OAuth). Auto-loads when sessions open in the API repo. First connection prompts Supabase login.
- **Stray Claude project entry deleted** — `~/.claude/projects/C--dialecta-local-versions-6-28-0-content-themes/` (orphan, one stale session).
- **Permissions evolved** — theme `.claude/settings.local.json` now allows npm scripts, npx esbuild, Compress-Archive, and cross-repo Read into the API + OneDrive + Ghost root.

---

## Setup

Open Claude Code (Windows App or PowerShell `claude` CLI) in the theme directory:

```powershell
# Theme audit
cd "C:\dialecta-local\versions\6.28.0\content\themes\dialecta"

# Or via the Ghost-version-agnostic symlink (auto-tracks current Ghost version)
cd "C:\dialecta-local\current\content\themes\dialecta"
```

Add `C:\dialecta-api` as an additional working directory so Claude can read both repos in one session.

---

## The Theme Audit Prompt

Paste this verbatim:

```
Conduct a full codebase audit of this Ghost theme. Read every file in src/, 
all .hbs templates, and package.json. Produce a structured markdown report 
covering:

1. Component ownership conflicts -- which files claim to mount or render the 
same UI surface (profile root, fingerprint, settings drawer, etc.)

2. Data shape mismatches -- every place a user/profile object is constructed 
or consumed with differing field names (avatarUrl vs avatar_url, initials 
computed vs passed, axis names specificity/charity/originality vs 
acuity/magnanimity/reach, etc.)

3. TOPICS constant divergence -- every file that defines or imports topic 
colors and whether the slugs match the canonical 12-topic set 
(politics_governance, law_justice, history, economics, environment_energy, 
health_medicine, psychology_behavior, science_technology, philosophy_ethics, 
arts_humanities, theology_spirituality, society_culture)

4. Dead code -- files or functions that exist in src/ but are never imported 
or called from any bundle that default.hbs or page-profile.hbs actually loads

5. Bundle architecture -- confirm which bundles are loaded on which pages, 
what each entry point compiles, and whether any compiled output is orphaned 
(built but never loaded)

6. Structural gaps for remaining build -- anything the Growth Layer, comment 
submission flow, or Declaration Layer will need that the current data 
architecture does not yet support

7. Retired-term scrub -- every occurrence of "steelman", "Static" (as a tier 
name), "specificity"/"charity"/"originality" (old axis names), and "openground" 
in code, comments, or string literals

Do not make any changes. Output only the report as markdown.
```

---

## Known Issues to Expect in the Theme Report

These are already documented and will likely surface (most flagged in the API CLAUDE.md "Pending Cleanup" and "Known Landmines" sections):

- `src/index.jsx` and `src/dialecta-profile-mount.jsx` both mount into `#dialecta-profile-root` but only `bundle.js` (from `index.jsx`) is loaded sitewide; `profile.js` is loaded only by `page-profile.hbs`. Confirm there is no dual-mount on the profile page.
- TOPICS constant defined in at least three places with different slug sets — the old 9-topic version in `dialecta-profile.jsx` is the most-cited source of drift. Canonical is the 12-topic v2 list.
- Fingerprint engine drift: `dialecta-fingerprint-engine.jsx` (canonical) vs an embedded copy inside `dialecta-profile.jsx`. Per API CLAUDE.md landmine #1, these must stay in sync or one must be retired.
- Axis names drift: `specificity/charity/originality` (old) vs `acuity/magnanimity/reach` (canonical, per `axis_events.axis` enum)
- `mergeProfileWithGhost`, `buildStubUser`, and `useProfileData` construct user objects with different field shapes
- "Steelman" terminology in component code (the term, the concept, and the feature are all called "Advocate")

---

## OneDrive Specs to Audit (Separate Pass)

These specs contain known-stale terminology that the audit should flag but cannot fix from Claude Code (OneDrive specs are edited directly by the human):

- **Files containing "steelman"** in `Fundamentals/`:
  - `Dialecta_Contributor_Identity.md`
  - `Dialecta_Editorial_Voice.md`
  - `Dialecta_Project_Index.md`
  - `Dialecta_Social_UX_Architecture.md`
  - `Claude Integration\dialecta-session-context.md`
- **`Fundamentals\Claude Integration\dialecta-session-context.md`** — references stale `C:\dialecta-local\content\themes\dialecta-theme` path
- **`Fundamentals\Claude Integration\dialecta-workflow-reference.md`** — references stale path AND `profile-bootstrap.jsx` entry point throughout. Also lists `SUPABASE_SERVICE_KEY` (should be `SUPABASE_SERVICE_ROLE_KEY` per API `.env.local`).
- **`The Living Fingerprint\dialecta-fingerprint.jsx`** — older variant of the fingerprint engine. Decide: archive or merge into canonical `dialecta-fingerprint-engine.jsx`.
- **`Dialecta-Private-Draft-Mode.jsx`** at OneDrive root (54KB) — not in active theme src/. Status unknown: deferred concept, retired prototype, or pending merge. Confirm and either archive, retire, or promote.

---

## API Repo Audit (Separate Session)

Run this in `C:\dialecta-api` after the theme audit:

```
Audit the Vercel API. Read every file in api/. Report:

1. Route inventory -- what routes exist, what methods they support, what 
they return
2. CORS coverage -- confirm api/_cors.js is imported in every route handler
3. Error handling consistency -- which routes have try/catch and which don't
4. Supabase query patterns -- any queries that could fail silently or return 
unexpected shapes (cross-check against the eight-table schema in CLAUDE.md)
5. Missing routes -- anything the frontend currently calls that doesn't have 
a corresponding api/ file
6. Immutability guards -- confirm no UPDATE or DELETE statements target 
axis_events (the immutable append-only ledger)
7. Env-var consistency -- confirm route files read SUPABASE_URL and 
SUPABASE_SERVICE_ROLE_KEY (the canonical names) and not legacy aliases

Do not make any changes. Output only the report as markdown.
```

---

## Phase 1 Launch Lens

When triaging audit findings, use this filter:

| Status | Examples | Phase 1 action |
|---|---|---|
| **Live + clean** | `/api/classify`, profiles table reads, design tokens | Confirm hardened (error handling, CORS, immutability), nothing else |
| **Live + drift** | TOPICS constant, axis names, fingerprint duplication | Resolve before launch — these are public-facing and bug-prone |
| **Live + stale terminology** | "Steelman" in copy/UI | Scrub before launch (Pact page, contributor copy) |
| **In progress** | Growth Layer (`dialecta-growth-scroll-v5.jsx`), Snapshot Curation Algorithm | Ship if time permits; otherwise launch without and add post-launch |
| **Deferred** | Next.js migration, custom domain, Delta mechanic, Practice Layer, Feed | Do **not** start; do not let audit findings expand scope here |

The audit's job is to surface the first three rows. Resist the temptation to address row four during cleanup.

---

## Scale Readiness Checklist

After Phase 1 cleanup is done, verify before final build:

- [ ] Single canonical file per UI surface (profile, fingerprint, growth scroll, opinion map)
- [ ] Single canonical TOPICS constant, imported everywhere it's used
- [ ] Single source for axis enum, matching `axis_events.axis` exactly
- [ ] All `.hbs` pages load only the bundle(s) they need (no orphan `<script>` tags)
- [ ] All API routes share one CORS module and one error-response shape
- [ ] `axis_events` insert path has no UPDATE/DELETE anywhere in code
- [ ] No retired terms in user-facing copy (steelman, static, openground, old axis names)
- [ ] OneDrive specs match codebase ground truth (no stale entry-point names or paths)

When all eight check, Phase 1 foundation is launch-ready and the deferred build queue can be ordered without refactor risk.

---

## What Comes Back from the Audit

A structured markdown report. Paste it into Claude.ai (or open as a Claude Code session) and:

1. Triage each finding — delete, consolidate, or promote to canonical
2. Produce a prioritized cleanup list, grouped by Phase 1 Launch Lens row
3. Execute each cleanup as a discrete Claude Code task with no ambiguity
4. Re-run the Scale Readiness Checklist before declaring complete

---

*Document created: April 2026*
*Last amended: 2026-04-26 (post environment-setup pass)*
*Execute after: comment submission flow live, Live Feed pulling, canonical Ghost tags created*
