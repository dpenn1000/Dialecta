# CLAUDE.md

Guidance for AI assistants working in the Dialecta repository. Read this first;
it captures architecture, conventions, and the gaps that are easy to trip over.

## What Dialecta is

Dialecta is a discourse platform that points social-media reward loops toward
clarity instead of outrage. Comments are never hidden — they are **classified**
into a visible "brightness ladder" of tiers, with every decision explained in
plain language. See `README.md` for the full product vision; this file covers
the code.

The single most load-bearing product rule, which constrains how you write
prompts, copy, and interaction logic: **the AI is a mirror, never a gatekeeper.**
It reflects and describes; it never coerces, moralizes, or alters a contributor's
intent. When editing classification prompts or user-facing messages, the test is
always "does this reflect, or does this coerce?"

## Repository layout

This repo is a **collection of prototype source files**, not a fully wired build.
There is no bundler config, test suite, or framework scaffold checked in yet.

```
api/                      Vercel serverless functions (ESM, Node runtime)
  _classify.js            Shared classification prompt + Anthropic call (helper, not an endpoint)
  classify.js             POST /api/classify        — classify a comment, return structured data
  comment.js              POST /api/comment         — classify + persist a comment to Supabase
  profile/[id].js         GET/PATCH /api/profile/:id — read/update a contributor profile
dialecta-profile-data.js  Client data layer: useProfileData hook, updateProfile, shape merger
dialecta-profile-mount.jsx Ghost injection entry point that mounts the profile React tree
dialecta-profile-edit.jsx  EditProfilePanel — inline profile editor
package.json              Declares only @supabase/supabase-js; no scripts
vercel.json               { "version": 2 }
README.md                 Product vision and roadmap
```

### Vercel `/api` convention

Files in `api/` are deployed as serverless functions, **except** files whose
name starts with `_` — those are treated as shared helpers and are not routed.
`api/_classify.js` exists for exactly this reason. Put shared backend code in
underscore-prefixed files; do not create a sibling endpoint by accident.

## Architecture at a glance

```
Ghost (CMS + auth + theme)
  └─ profile.hbs mounts <div id="dialecta-profile-root" data-user="{ghost member json}">
       └─ dialecta-profile-mount.jsx  (React, createRoot)
            ├─ useProfileData(id)  ──HTTP──▶  Vercel /api/profile/:id  ──▶ Supabase
            └─ EditProfilePanel    ──HTTP──▶  PATCH /api/profile/:id   ──▶ Supabase

Comment flow:
  client ──▶ POST /api/comment ──▶ classifyComment() ──▶ Anthropic (Claude Haiku)
                                └─▶ Supabase (comments + classifications)
```

- **Front end:** React rendered into a Ghost-served page. Identity comes from
  Ghost (the `data-user` attribute and `window.Ghost.member`); platform data
  (axis scores, archetype, stats) comes from the Vercel API backed by Supabase.
- **Back end:** stateless Vercel serverless functions. Supabase is accessed with
  the **service key** (server-side only — never ship it to the client).
- **AI:** Anthropic Messages API, model `claude-haiku-4-5-20251001`, called over
  raw `fetch` (no SDK). Classification prompts demand JSON-only output.

## Domain model: the tier system

The seven tiers are the core vocabulary — keep these exact lowercase strings
consistent across prompts, DB writes, and UI. `ai_suggested_tier` is always
normalized to lowercase before it is stored.

| Tier   | Meaning |
|--------|---------|
| `forum`  | Specific claim, engages content, reasoning present. Sharp disagreement is welcome here. |
| `spark`  | Interesting but underdeveloped idea. |
| `echo`   | Restates the article or a prior comment without adding to it. |
| `fog`    | Unclear; reader cannot tell what the commenter believes. |
| `heat`   | Emotionally charged with no specific claim. |
| `stance` | Tribal framing / identity signaling dominates. |
| `breach` | Personal attack on a person, not an idea. Suppressed from default view (never deleted). |

Critical edge case baked into the prompt: a comment can be **angry and still be
`forum`** as long as it is anchored to a specific, arguable proposition.
Emotional register is never the disqualifier; the absence of a claim is.

### Classification pipeline (per `README.md`)

1. **Stage 1 — AI pre-analysis** (implemented): on submit, classify and show a
   non-blocking reflection message. Comment is stored `pending_review`.
2. **Stage 2 — self-declaration** (client-driven, endpoint not yet built): the
   commenter accepts or overrides the suggested tier. The README/code anticipate
   a `PATCH /api/comment/:id` to finalize — **this endpoint does not exist yet.**
3. **Stage 3 — community voting** (not built): a votes table is referenced in
   comments but not implemented.

Final weighting (product spec): AI 40%, community 35%, self-declaration 15%,
response quality 10%.

## API endpoints

| Endpoint | Methods | Notes |
|----------|---------|-------|
| `/api/classify` | POST | Body `{ body, article_claims? }`. Returns the parsed classification. 502 on upstream failure, 500 on unparseable model output, 400 if `body` missing. |
| `/api/comment`  | POST | Body `{ author_id, article_id, body, article_claims? }`. Classifies, inserts a `comments` row (`status: 'pending_review'`) and a `classifications` row, returns both. A `classifications` insert failure is non-fatal (logged; the comment is already committed). |
| `/api/profile/:id` | GET, PATCH, OPTIONS | `:id` is the **Ghost member UUID**. GET aggregates profile + axis scores + archetype + computed stats, returning partial data rather than failing if a sub-query errors. PATCH upserts only whitelisted fields. Has CORS for `https://www.dialecta.org`. |

## Supabase tables referenced by the code

No migrations are checked in, but the code reads/writes these tables and columns:

- `profiles` — keyed by `ghost_member_id`; editable: `display_name`, `bio`,
  `avatar_url`, `location`; plus `updated_at`.
- `comments` — `id`, `author_id` (= Ghost member UUID), `article_id`, `body`,
  `status` (`pending_review` | `published`), `created_at`.
- `classifications` — one per comment via `comment_id`; columns `claim_text`,
  `specificity`, `emotion`, `tribal_markers`, `tribal_example`,
  `article_engagement`, `opposing_view_engaged`, `ai_suggested_tier`,
  `self_declared_tier`, `final_tier`, `borderline_flag`,
  `borderline_other_tier`, `commenter_message`.
- `axis_scores` — keyed by `contributor_id`; the Six Pillars: `acuity`,
  `calibration`, `magnanimity`, `discourse`, `consistency`, `reach`.
- `archetypes` — keyed by `contributor_id`; `id`, `label`, `note`, `assigned_at`.
  Archetypes are **platform-assigned from observed behavior, never
  self-declared.**

## Environment variables

| Var | Used by |
|-----|---------|
| `ANTHROPIC_API_KEY`   | `api/_classify.js` (classification) |
| `SUPABASE_URL`        | `api/comment.js`, `api/profile/[id].js` |
| `SUPABASE_SERVICE_KEY`| same — server-side service role key, never exposed to the client |
| `DIALECTA_API_URL`    | build-time API base for the front end (or `window.__DIALECTA_API_URL__` for the Ghost bundle) |

## Conventions

- **ESM everywhere** (`import`/`export`, `export default async function handler`).
- **Anthropic model id:** `claude-haiku-4-5-20251001`, `anthropic-version:
  2023-06-01`, `max_tokens: 512`. Prompts require JSON-only output; the parser
  strips stray ```` ```json ```` fences before `JSON.parse`.
- **One classification source of truth:** edit the prompt and Anthropic call in
  `api/_classify.js` only. Do not re-inline a copy into an endpoint — the two
  copies that previously existed silently drifted.
- **Tier strings are lowercase** and must match the seven tiers exactly.
- **Resilient reads:** the profile GET logs sub-query errors and returns partial
  data instead of failing the whole request. Follow this pattern for aggregate
  reads; prefer `maybeSingle()` for optional rows.
- **PATCH is whitelisted:** only `EDITABLE_FIELDS` are writable; profile writes
  are an upsert keyed on `ghost_member_id`.
- **Identity vs. platform data:** Ghost is the source of identity (name, email,
  avatar, join date); Supabase `profiles` holds optional overrides. The merge
  logic lives in `mergeProfileWithGhost` in `dialecta-profile-data.js`.
- **Design tokens** are mirrored inline per component (see the `T` token object
  in `dialecta-profile-edit.jsx`) against the canonical design spec (v1.2/v1.3).

## Build, run, deploy

There is **no build tooling, lint config, or test suite in this repo yet**, and
`package.json` defines no scripts. Don't assume `npm test`/`npm run build` work;
if you add tooling, wire up `package.json` and say so.

- The API deploys as Vercel serverless functions from `api/`.
- The front end is expected to be bundled (Vite/Next-style; `react`,
  `react-dom/client`) and loaded by a Ghost theme that supplies the
  `dialecta-profile-root` mount node and `data-user` attribute.
- Target launch stack (per roadmap) is Next.js + Supabase + a headless CMS +
  D3.js — not yet present.

## Known gaps / dead ends (don't be surprised)

These are referenced by the code or README but **not present** in the repo. If a
task depends on one, confirm scope before inventing it:

- `dialecta-profile-responsive.jsx` — imported by `dialecta-profile-mount.jsx`
  (the `DialectaProfileBody` component) but missing.
- `dialecta-design-spec-v2.html` — referenced by the README; missing.
- `dialecta-profile-ghost-integration.md` — referenced in a comment; missing.
- `PATCH /api/comment/:id` (Stage 2 finalize) — described in `api/comment.js` but
  not implemented.
- **Votes / community voting table** — Stage 3. `nominatedUp`/`nominatedDown` and
  the `connections` counts in the profile path are hard-coded placeholders (`0`)
  until this exists.

## Git workflow

- Active development branch for this work: `claude/claude-md-docs-9K6gX`.
- Develop on the designated branch, commit with clear messages, push with
  `git push -u origin <branch>`, then open a **draft** PR.
- Do not push to `main` without explicit permission.
