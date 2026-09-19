# Dialecta — Foundation State

*Snapshot as of 2026-04-26. Read this first to orient any new session.*

---

## What This Is

A one-page snapshot of the Dialecta development foundation: where things live, what's set up, what's next. Pair this with the canonical `CLAUDE.md` files for full operational context.

---

## Active Repos & Paths

| Concern | Path | Status |
|---|---|---|
| Theme (Ghost) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` | Active, has `CLAUDE.md`, **not** in git |
| Theme symlink (version-agnostic) | `C:\dialecta-local\current\content\themes\dialecta\` | Resolves via `C:\dialecta-local\current` symlink |
| API (Vercel) | `C:\dialecta-api\` | Active, in git, has `CLAUDE.md`, has `.mcp.json` |
| Conceptual archive | `C:\Users\dan\OneDrive\Websites\Dialecta\` | Read-only reference; canonical specs live in `Fundamentals\` |
| Ghost root | `C:\dialecta-local\` | Run `ghost start/stop/status/log` from here |

---

## Canonical CLAUDE.md Files

| File | Covers |
|---|---|
| `C:\dialecta-api\CLAUDE.md` | Full system reference: stack, schema, design tokens, system constants, behavioral rules, dev commands for both repos |
| `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\CLAUDE.md` | Theme-specific: build commands, Ghost integration, entry points, deploy steps |

Both auto-load when their dir is the cwd or an additional working dir. Open Claude Code with the theme as primary and the API as additional working directory to get both.

---

## Current Entry Points (Theme)

| Source | Compiled to | Loaded by |
|---|---|---|
| `src/index.jsx` | `assets/js/bundle.js` | `default.hbs` (sitewide) |
| `src/dialecta-profile-mount.jsx` | `assets/js/profile.js` | `page-profile.hbs` only |

**`profile-bootstrap.jsx` is fully retired.** Any reference to it is stale.

---

## Tooling

- **Claude Code:** Windows App. Opens both repos via primary cwd + additional working directory. OneDrive reachable via Read permissions in both `.claude/settings.local.json` files.
- **Supabase MCP:** Configured at `C:\dialecta-api\.mcp.json` — HTTP transport, read-only, browser OAuth. Auto-loads in API sessions. First connection prompts Supabase login. To scope to one project later, append `&project_ref=<id>` to the URL.
- **Already attached at user level (any session):** Vercel MCP, Chrome MCP, Computer-Use, Gmail, Canva, scheduled-tasks.

---

## What's Next

When all three conditions are met, kick off the optimization pass:

1. Comment submission flow wired (`POST /api/classify` and `POST /api/comment` connected to `dialecta-discourse-layer.jsx`)
2. Ghost Content API key set, Live Feed pulling real articles
3. Ghost tags created with canonical 12-topic slugs

The launch doc for that session: **`Fundamentals\Claude Integration\Dialecta_Codebase_Audit_Brief.md`**.

---

## Tier 2 Deferred — Will Be Addressed in Optimization Pass

- "Steelman" terminology in 5 OneDrive `Fundamentals\` specs and in active theme code/copy
- TOPICS constant divergence — old 9-topic version still lives in `dialecta-profile.jsx` (canonical is 12-topic v2)
- Fingerprint engine drift — `dialecta-fingerprint-engine.jsx` (canonical) vs duplicate inside `dialecta-profile.jsx`; OneDrive `The Living Fingerprint\dialecta-fingerprint.jsx` is the older variant
- Axis name drift — `specificity/charity/originality` (old) vs `acuity/magnanimity/reach` (canonical, matches `axis_events.axis` enum)
- `Dialecta-Private-Draft-Mode.jsx` (54KB, OneDrive root) — status unknown, needs decision
- Dual-mount risk: `index.jsx` and `dialecta-profile-mount.jsx` both mount into `#dialecta-profile-root` — confirm `page-profile.hbs` doesn't load both bundles

Full triage list and audit prompts: `Dialecta_Codebase_Audit_Brief.md`.

---

## Phase 1 Launch Lens

When triaging audit findings:

| Status | Action |
|---|---|
| **Live + clean** (e.g. `/api/classify`, profile reads) | Confirm hardened, nothing else |
| **Live + drift** (e.g. TOPICS, axis names, fingerprint) | Resolve before launch |
| **Live + stale terminology** (e.g. "steelman" in copy) | Scrub before launch |
| **In progress** (e.g. Growth Layer) | Ship if time, or defer |
| **Deferred** (Next.js, custom domain, Delta, Practice Layer, Feed) | Do not start |

The optimization pass surfaces the first three rows. Resist expanding into row four during cleanup.

---

*Last verified: 2026-04-26*
*See also: `CLAUDE.md` (both repos), `Dialecta_Codebase_Audit_Brief.md` (forward plan), `dialecta-workflow-reference.md` (daily commands), `dialecta-session-context.md` (Claude.ai-side framing)*
