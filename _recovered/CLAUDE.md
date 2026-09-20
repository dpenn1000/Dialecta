# CLAUDE.md — Dialecta
*Operational ground truth for Claude Code sessions. Read this before touching any file.*

---

## What This Project Is

Dialecta is a blog and community platform where ideas — not identities — are the protagonist of public discourse. The classification engine, the contributor fingerprint, and the growth layer are all downstream of one founding principle: **human behavior changes through environmental design, not moral instruction.** Every mechanic on this platform is designed to make clear, specific, honest thinking the most rewarding thing a contributor can do here.

When working in this codebase, that principle is load-bearing. Design decisions that look arbitrary usually trace back to it. If something seems overly complicated, read `Dialecta_Data_Architecture.md` or `Dialecta_Founding_Philosophy.md` before simplifying it.

---

## Cross-References

The Dialecta codebase has three load-bearing CLAUDE.md files plus one small sidecar. They are intentionally scoped, not duplicates:

| File | Scope |
|---|---|
| `C:\Users\dan\OneDrive\Websites\Dialecta\CLAUDE.md` | Concept entry point. Philosophy, design spec, data architecture, all canonical Fundamentals/ docs. The "grandfather" folder. |
| `C:\dialecta-api\CLAUDE.md` (this file) | API repo operational. Stack, schema, migrations, API routes, behavioral rules. **All new API work goes here.** |
| `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\CLAUDE.md` | Theme operational. Theme structure, build commands, JSX/Handlebars conventions. |
| `C:\dialecta-next\CLAUDE.md` | Share-card sidecar. OG image rendering + celebration moment landing page. Narrowly scoped; not a successor to this repo. |

Bird's-eye nav across all four: `OneDrive\Websites\Dialecta\Fundamentals\Dialecta_Project_Index.md` (living doc, Claude-editable). Session handoffs: `OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-YYYY-MM-DD-suffix.md`.

---

## Live Stack

| Layer | Service | URL |
|---|---|---|
| CMS / hosting | Magic Pages (Ghost) | `dialecta.mymagic.page` (also accessible as `dialecta.org` via 301 redirect to `www.dialecta.org`) |
| API (serverless) | Vercel | `dialecta.vercel.app` |
| Share-card sidecar | Vercel (Next.js 15) | `dialecta-next.vercel.app` (OG cards + celebration moment landing only; not a general SEO surface as of 2026-05-06 rollback) |
| Database | Supabase (PostgreSQL) | Supabase dashboard |
| Custom domain | **Live** | `dialecta.org` → 301 → `www.dialecta.org` (verified 2026-05-01) |

**Ghost is the confirmed production stack. Next.js migration is explicitly deferred.** Do not propose migrating to Next.js. Ghost owns articles, routing, member auth, email, and the shell. Dialecta's API and React components are injected into Ghost as islands — they do not replace it. The `dialecta-next` Vercel project is a narrowly-scoped sidecar for OG share cards; see `C:\dialecta-next\CLAUDE.md` for its bounded scope.

---

## Vercel API Routes

Routes below exist in tree under `api/`. Production deployment may lag uncommitted work; check `git status` and Vercel dashboard for what is currently live.

### Discourse

| Method | Route | Purpose |
|---|---|---|
| `POST`   | `/api/classify` | Comment classification pipeline. Calls Anthropic API (Haiku). Returns tier, commenter message, full Stage A fields including `strength` (Reflection card "What this does well" slot). |
| `POST`   | `/api/comment` | Comment submission (Path C-lite auth). Verifies profile, runs classification, writes `comments` + `classifications` rows. Status defaults to `pending_review`. |
| `GET`    | `/api/comments` | Feed listing for the Discourse Layer. Query: `?article_id=...&viewer=...&seed=&limit=`. Joins comments + classifications in JS. Filters seed contributors from public results unless `seed=1`. (Added in the 2026-04-29 engines build.) |
| `PATCH`  | `/api/comment/:id` | Edit comment body within the malleability window. Re-classifies. 409 if `now() >= comments.hardened_at`. Member_uuid auth: only the original author can mutate. (Added 2026-04-29.) |
| `DELETE` | `/api/comment/:id` | Hard delete during the malleable window only. Same auth + window constraints as PATCH. (Added 2026-04-29.) |

### Profile / Identity

| Method | Route | Purpose |
|---|---|---|
| `GET`   | `/api/profile/:id` | Fetch contributor profile from Supabase. |
| `PATCH` | `/api/profile/:id` | Update contributor profile in Supabase. |
| `POST`  | `/api/profile/order` | Commit the author's chosen Steward Order (referenced by `dialecta-profile-order.jsx`; verify endpoint file before relying on it). |

### Article pipeline (Phase 1A-1C, shipped 2026-04-27)

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/article/classify` | Article AI classification (Phase 1A). |
| `POST` | `/api/article/submit` | Article draft submission with member-uuid auth (Phase 1B / 1C step 7). |
| `POST` | `/api/article/publish` | Publish a submitted article (Phase 1B). |
| `GET`  | `/api/article/:id` | Article reader endpoint (Phase 1B). |
| `POST` | `/api/article/aesthetic-suggest` | **Polish v2 engine** (redesigned 2026-05-01). Floor + level-gated tools. Accepts `polish_level: 'light' \| 'standard' \| 'editorial' \| 'custom'` and optional `polish_options` for granular feature toggles. Output: `{ polished_html, change_log }` — no more suggestion cards. Floor (always-on): punctuation hygiene, em-dash policy, smart quotes, layout cruft removal, sources tagging, pseudo-header recognition. Levels add: thematic breaks (Standard), pullquote extraction + list conversion + emphasis (Editorial). |
| `POST` | `/api/article/suggest-topics` | Topic suggestions for the editor (Phase 1C). |
| `POST` | `/api/article/classify-order` | Steward Order proposal for the author (in tree, uncommitted). |
| `POST` | `/api/article/upload-image` | Image upload — purpose-discriminated. `purpose='article'` requires `is_author`; `purpose ∈ {avatar, field_note, book_cover}` is open to any signed-in member with a profile. Backed by Ghost Admin `/images/upload`. |
| `POST` | `/api/article/repolish` | **Admin-only re-polish** (added 2026-05-01). Auth: `profiles.is_admin = true` required. Always operates on `articles.original_html` (not current Ghost HTML), so re-polish is non-destructive and idempotent — running Light then Editorial then Light returns to a clean Light state. Falls back to fetching current Ghost HTML + back-filling `original_html` for pre-Polish-v2 articles. |

### Quotes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/quotes` | Quotes endpoint backing the quotes-app surface (in tree, uncommitted). |

The `/api/classify` route is the most sensitive. It is the only synchronous call to the Anthropic API in the standard flow. Everything downstream (axis scoring, archetype detection) is async and does not block publish.

---

## Supabase Schema (Ground Truth)

Eight tables in production or designed for production. Do not alter column names without checking `Dialecta_Data_Architecture.md`.

| Table | Purpose |
|---|---|
| `profiles` | **Live.** Contributor profile data. Connected to profile page. Key flags: `is_author` (Pact-granted publish access), `is_admin` (admin gate for `/api/article/repolish` and other administrative operations — added in migration 016), `polish_preferences` (jsonb stub for user-level Polish v2 defaults; UI deferred). |
| `comments` | Comment records. `status` enum: `draft / pending_review / published / suppressed`. |
| `classifications` | One record per comment. Full Stage A + Stage B output. Includes `ai_suggested_tier`, `self_declared_tier`, `final_tier`. |
| `axis_events` | **Immutable append-only ledger.** One record per comment per axis touched. Never update — only append. |
| `axis_scores` | Materialized current state. Six records per contributor (one per pillar). Recomputed from ledger after each event — never accumulated incrementally. |
| `fp_snapshots` | Point-in-time fingerprint captures. Used by Growth visualization. `reason` enum: `aspiration_declaration / recommitment / milestone / manual`. |
| `archetypes` | One record per contributor. Assigned pattern + history array of prior assignments. |
| `aspirations` | Contributor-declared growth commitments. Expires and requires recommitment, never deleted. |
| `feed_events` | Event ledger for the activity feed. Types: `archetype_shift / milestone / aspiration_declared / recommitment`. |
| `articles` | Article records authored on-platform. Backs the article pipeline (classify / submit / publish / reader endpoints). Added 2026-04-27 in the Phase 1A migration. **Polish v2 columns (migration 016, applied 2026-05-01):** `original_html` (author's submitted HTML byte-for-byte — preserved so re-polish is non-destructive), `polish_level` (enum: light/standard/editorial/custom), `polish_options` (jsonb for custom feature toggles), `polish_change_log` (jsonb array of brief change descriptions). |

**The `axis_events` table is immutable by design.** This is what makes the Fingerprint unfakeable. Do not add UPDATE or DELETE operations to this table under any circumstances.

---

## Production Migrations Applied

All migrations live in `C:\dialecta-api\supabase\migrations\` and are applied to production via the **Supabase MCP** (`mcp__supabase__apply_migration`), which writes against the live project and records to the server-side `migration_history` table. This is the canonical application path as of 2026-05-01. Earlier convention (apply via Supabase dashboard SQL editor "for transparency") was walked back: the `migrations/` folder under git plus the server-side history table provide adequate audit. Do not reinstate dashboard-only application without explicit instruction. `~/.claude/settings.json` allow-list includes the relevant Supabase MCP tools so calls do not prompt.

**Numbering rule (load-bearing).** Always `ls supabase/migrations/` before naming a new SQL migration file. Number new file = `max(existing) + 1` across the **whole list**, not just recent ones. Three pre-existing duplicate-number collisions (007, 013, 014) are acknowledged below and are NOT to be retroactively renumbered (changing applied-migration filenames would break the audit trail). Do not extend them.

Current applied range: **000 → 025** (verified on disk 2026-05-01). The earlier note about "intentional gaps" at 008-010 / 013-015 is now obsolete: those slots are filled.

| # | File(s) | What it adds |
|---|---|---|
| 000 | `000_baseline_documentation.sql` | Documentation marker for pre-migration baseline tables. |
| 001 | `001_v1_1_schema.sql` | `follows`, `sparring_partners`, `feed_events`, `opinion_map_positions`; `profiles.is_seed`; `comments.delta_acknowledged`; +5 archetype enum values. |
| 002 | `002_seed_dev_users.sql` | Maya / Wen / Anselm seed contributors + axis_scores + archetypes. |
| 003 | `003_resonance_column.sql` | `profiles.resonance numeric (0-1)` with check constraint. |
| 004 | `004_seed_relationships.sql` | Seed follows + sparring relationships (Daniel ↔ Maya / Anselm / Wen). |
| 005 | `005_articles_table.sql` | `articles` table + `ai_analysis jsonb` + RLS public-read on published. |
| 006 | `006_is_author_flag.sql` | `profiles.is_author boolean`. |
| **007** | **COLLISION:** `007_archetype_enum_canonical_only.sql` + `007_quotes_table.sql` | Archetype enum type-swap to canonical 8 values (verified applied 2026-04-29); AND `quotes` table for the quotes app. |
| 008 | `008_seed_quotes.sql` | Initial quotes seed. |
| 009 | `009_steward_orders.sql` | Steward Order taxonomy + columns. |
| 010 | `010_pact_agreement.sql` | Pact agreement columns on profiles (`pact_agreed_at`, `pact_version`, `pact_path`). |
| 011 | `011_comment_malleability.sql` | `comments.hardened_at` + `idx_comments_hardened_at` for the 60-min malleability window. |
| 012 | `012_classifications_full_schema.sql` | Stage A reasoning fields on classifications + `idx_classifications_borderline` partial index. |
| **013** | **COLLISION:** `013_classifications_strength.sql` + `013_seed_feed_events.sql` | `classifications.strength`; AND seed feed events. |
| **014** | **COLLISION:** `014_axis_events.sql` + `014_pact_signed_name.sql` | `axis_events` immutable ledger + `axis_scores` materialized; AND `profiles.pact_signed_name`. |
| 015 | `015_axis_events_article_source.sql` | Article-source attribution on axis_events. |
| 016 | `016_polish_v2_levels.sql` | Polish v2 architecture. `articles.original_html`, `articles.polish_level` (enum), `articles.polish_options` (jsonb), `articles.polish_change_log` (jsonb). `profiles.polish_preferences`, `profiles.is_admin`. Applied 2026-05-01 via Supabase MCP. |
| 017 | `017_admin_rbac.sql` | Admin RBAC: normalized roles (publisher / editor / curator / reviewer) + capabilities + audit log. Daniel bootstrapped as Publisher. Applied 2026-04-30. |
| 018 | `018_feedback_items.sql` | `feedback_items` table with type / priority / status orthogonal axes. Applied 2026-04-30. |
| 019 | `019_notifications_schema.sql` | Notifications schema (in-app + opt-in email digest). Applied 2026-04-30. |
| 020 | `020_comments_parent_id.sql` | `comments.parent_id` for threaded replies. Applied 2026-04-30. |
| 021 | `021_feedback_screenshots_bucket.sql` | Storage bucket for feedback screenshots. Applied 2026-04-30. |
| 022 | `022_opinion_map_overrides.sql` | Opinion-map override mechanism. Applied 2026-04-30. |
| 023 | `023_comments_mentions.sql` | Comment mentions. Applied 2026-04-30. |
| 024 | `024_opinion_map_positions_multi.sql` | Multi-axis opinion-map positions. Applied 2026-04-30. |
| 025 | `025_tier_nominations.sql` | Tier nomination structure. Applied 2026-04-30. |
| 026 | `026_signature_font.sql` + `026b_signature_font_default_fix.sql` | `profiles.signature_font` enum (9 hand-script options). |
| 027 | `027_aspirational_archetype.sql` | Aspirational archetype substrate for Growth Layer. Applied 2026-05-01. |
| 028 | `028_pre_launch_security_hardening.sql` + `028b_pin_search_path_post_replace.sql` | Cleared all advisor findings 2026-05-02. RLS on axis_events, function search_paths, service-role marker policies. |
| 029 | `029_profiles_handle.sql` + `029b_profiles_handle_security_hardening.sql` | `profiles.handle` column + `reserved_handles` + `handle_history` + format constraint + reserved/cooldown trigger + `pg_trgm` extension. Substrate for SSR /contributor/<handle> URLs. Applied 2026-05-02. |
| 030 | `030_share_events.sql` + `030b_share_events_channel_expand.sql` | `share_events` tracking table for Phase 1.3 share architecture. |
| 031 | `031_profiles_subscription_tier.sql` | Underwriter / paid-tier scaffolding. |
| 032 | `032_profiles_is_charter.sql` | Charter Underwriter launch-cohort flag. |
| 033 | `033_celebration_events.sql` | OG-5 / 1.3-bis: `celebration_events` table. Append-only event log with seven event_types (first_comment, first_article, first_quote, delta_acknowledged, tier_promoted, follower_milestone, became_steward), `context jsonb` for per-event payload (comment_body, article_slug, event_at, etc.), `modal_dismissed_at` and `shared_at` for tracking. Service-role RLS marker policy. Applied 2026-05-04. First trigger live in `api/comment.js`; six remaining triggers + admin OG library scoped as separate threads (see handoff `dialecta-handoff-2026-05-05-share-architecture.md`). |

**The `axis_events` table is immutable by design.** This is what makes the Fingerprint unfakeable. Do not add UPDATE or DELETE operations to this table under any circumstances.

**The `celebration_events` table is append-only conceptually.** `modal_dismissed_at` and `shared_at` are post-insert UPDATEs, but rows themselves never get deleted; celebrations become part of the contributor's permanent history (feeds the future History Scroll feature).

**Migration 007 verification (run 2026-04-29):** `SELECT enumlabel FROM pg_enum WHERE enumtypid = 'archetype_id'::regtype` returned exactly `advocate, builder, contextualist, empiricist, illuminator, reviser, skeptic, synthesizer`. Audit item `a-d2` is closed.

---

## Vercel Infrastructure

- **Vercel Pro tier** (upgraded 2026-04-29 to resolve Hobby's 12-function cap when the engines build added `api/comments.js` and `api/comment/[id].js`). Future routes can stay as separate RESTful files; consolidation for cap reasons is no longer necessary.
- **Sibling project: `dialecta-next`** (a separate Next.js project at `C:\dialecta-next\`, deployed to `dialecta-next.vercel.app`). Narrowly scoped (locked 2026-05-06): owns the OG card image generators (`/article/<slug>/opengraph-image`, `/comment/<id>/opengraph-image`, `/contributor/<handle>/opengraph-image`, `/quote/<slug>/opengraph-image`, `/contributor/<handle>/moment/<id>/opengraph-image`) and the celebration moment landing page (`/contributor/<handle>/moment/<id>` — UA-redirects humans to www.dialecta.org articles). The earlier SEO/SSR pages (`/contributor/<handle>`, `/quote/<slug>`, sitemap, robots) plus general API routes were rolled back 2026-05-06; `dialecta-next` is NOT a successor to this repo. dialecta-next reads from the SAME Supabase. The Ghost theme's `default.hbs` injects a custom `og:image` meta tag on post pages pointing at dialecta-next's article OG generator. See memory: `project_og_card_infrastructure.md`, `project_share_click_through.md`, `project_public_seo_architecture.md` (rollback rationale). `api/comment.js` returns a `celebration` object inline in its 201 response when a first-comment fires, which the theme's `dialecta-celebration-modal.jsx` reads and renders. Deployed via `vercel --prod` from `C:\dialecta-next\` (separate from this repo's deploys). For the bounded scope and "do not extend" guidance, see `C:\dialecta-next\CLAUDE.md`.
- **Supabase MCP** configured at user scope (`~/.claude.json`) plus project scope (`C:\dialecta-api\.mcp.json` with `read_only=false`); auto-loads in any session. **Read-write mode.** Apply migrations via `mcp__supabase__apply_migration` (canonical path as of 2026-05-01). Schema verification via `list_tables`, `execute_sql`, `list_migrations`. The relevant tools are in the `~/.claude/settings.json` allow-list so calls do not prompt.

---

## Monitoring & Health Checks

No automated alerting yet (Sentry is the planned next step; requires account + DSN setup). Until then, the following manual queries should be run weekly to catch the failure modes that have already bitten us in production. Run from the Supabase dashboard SQL editor.

### Partial profiles (the David case)

`api/comment.js` and `api/article/submit.js` both validate `display_name` via `_profile-validation.js` and return a 400 with an actionable CTA. But silent partials still indicate that lazy-create is failing to seed `display_name` (e.g., theme isn't passing `?name=` hints, or new sign-up flow regressed). If the count grows above zero, investigate.

```sql
-- Profiles with no display_name (will hit the 400 on comment + article submit).
SELECT count(*) AS partial_count, max(updated_at) AS most_recent
FROM profiles
WHERE display_name IS NULL OR trim(display_name) = '';

-- The actual rows, to chase down the source.
SELECT ghost_member_id, bio, is_author, updated_at
FROM profiles
WHERE display_name IS NULL OR trim(display_name) = ''
ORDER BY updated_at DESC NULLS LAST;
```

### Orphaned comments (insert succeeded, classification insert failed)

If `api/comment.js` writes a comment row but the subsequent `classifications` insert throws, the user sees a 500 and we end up with an orphaned `comments` row that has no classification — invisible to the feed but still in the table. The engines build's GET feed inner-joins on classifications, so orphans don't surface, but they're real data inconsistency.

```sql
SELECT c.id, c.member_id, c.body, c.created_at
FROM comments c
LEFT JOIN classifications cl ON cl.comment_id = c.id
WHERE cl.id IS NULL
ORDER BY c.created_at DESC
LIMIT 50;
```

### Recent 5xx-eligible failures

Pull the last 24 hours of comment + article submission attempts and check for gaps. If a member tried to comment and there's no comment row from them in the time range, they likely hit a 4xx/5xx.

```sql
SELECT count(*) AS comments_24h
FROM comments
WHERE created_at > now() - interval '24 hours';
```

For deeper failure investigation use `vercel logs https://dialecta.vercel.app` from `C:\dialecta-api\` (CLI streams; doesn't backfill old logs reliably). Sentry once installed will give the real surface here.

### Cadence

- **Weekly:** run all three. Five minutes of work; catches drift before it accumulates.
- **After any new endpoint that consumes profile fields:** add the field to the `requireCompleteProfile` call site and re-run the partials query a day later to confirm it doesn't break flows.
- **Pre-launch:** install Sentry, replace the manual cadence with alerting on 5xx > N per hour.

---

## AI Stack

| Model | Role | Approx. Cost |
|---|---|---|
| `claude-haiku-4-5-20251001` | Comment classification at `/api/classify` | ~$0.002/comment |
| Claude Sonnet (in artifacts) | Design and spec work in Claude.ai | N/A |

The classification prompt architecture is in `Dialecta_Classification_Engine_Specification.md`. The expected API output is a structured JSON object containing Stage A fields plus Stage B tier and commenter message. Do not simplify the prompt structure — the nuanced tier distinctions (especially Spark vs. Forum, Heat vs. Stance) require genuine reasoning, not keyword matching.

---

## System Constants

### Seven Tiers (comment classification)

| Tier | Name | Core signal |
|---|---|---|
| 🥇 | Forum | Claim specificity level 2+, constructive regardless of emotion |
| 💡 | Spark | Interesting but underdeveloped. Level 1-2 claim. |
| 🪞 | Echo | Restates without adding. Level 0-1. |
| 🌫️ | Fog | Vague, unclear, reader cannot determine belief. Level 0. |
| 🔥 | Heat | High emotion, absent or buried claim. |
| ⚡ | Stance | Tribal framing dominant, regardless of claim level. |
| 🚫 | Breach | Personal attack / slander. Suppressed from default view, never deleted. |

**Old tier name "Static" is retired.** The sixth tier is **Stance**. The seventh is **Breach**. Any reference to "Static" in code is stale.

### Six Pillars of Intellectual Character (fingerprint axes)

| Pillar | Pair | What it measures |
|---|---|---|
| Acuity | Substance | Precision and claimability of points |
| Reach | Substance | Topic breadth across distinct areas |
| Calibration | Intellectual Honesty | Confidence matched to evidence strength |
| Magnanimity | Intellectual Honesty | Faithful representation of opposing views before engaging |
| Discourse | Engagement | Sustained back-and-forth vs. hit-and-run |
| Consistency | Engagement | Regular presence over time |

**Old axis names are retired.** Previous names (Specificity, Range, Charity) must not appear in code. Use the names above. The enum in `axis_events.axis` is: `acuity / reach / calibration / magnanimity / discourse / consistency`.

### Eight Archetypes (contributor pattern)

Skeptic 🔎 · Synthesizer 🌀 · Advocate ⚖ · Builder 🏗 · Empiricist 🔬 · Contextualist 🗺 · Illuminator 💡 · Reviser ↻

**"Steelman" terminology is fully retired across the codebase.** The feature and the archetype it supports are called "Advocate." Any occurrence of "steelman" in code is a stale reference.

**No archetype ranks above another.** Do not write copy, comments, or UI text that implies hierarchy between archetypes.

### Twelve Topics (taxonomy v2)

```
politics_governance
law_justice
history
economics
environment_energy
health_medicine
psychology_behavior
science_technology
philosophy_ethics
arts_humanities
theology_spirituality
society_culture
```

**The old 9-topic constant in `dialecta-profile.jsx` is stale.** Do not use it as the source of truth for topic work. The canonical reference is `dialecta-topic-colors-v2.html` in the Claude.ai project files.

---

## Design Tokens (non-negotiable)

### Colors

| Token | Value | Use |
|---|---|---|
| Gold primary | `#b8862e` | Primary accent, active states |
| Gold secondary | `#d4a84a` | Hover, lighter accent |
| Page background | `linear-gradient(135deg, #a8a398 0px, #8c8780 175px, #f7f2e8 775px, #f7f2e8 100%)` | Body background |
| Cream | `#f7f2e8` | Main content area background |

Palette A (gold above) is locked. Do not substitute with a different gold value.

### Typography (four typefaces, fixed roles)

| Face | Role |
|---|---|
| Cormorant Garamond | Display / headlines |
| DM Sans | Body, UI, navigation (0.82rem in sub-nav) |
| Source Serif 4 | Long-form reading / article body |
| DM Mono | Labels, metadata, tier badges |

Growth Scroll only additionally uses: Cinzel (headers) + IM Fell English Italic (snapshot text).

### Navigation (two-bar, fixed)

- Bar 1: 52px logo bar
- Bar 2: 34px metallic sub-nav
- Max-width: 1060px
- Nav order: **Articles · Community · Stewards · About · The Pact**

---

## Canonical File Registry

When the same component exists in multiple files, this is the authority. Do not edit the non-canonical version.

| Component | Canonical File | Notes |
|---|---|---|
| Full design spec | `dialecta-design-spec.html` v1.3 | All visual tokens. Source of truth. |
| Discourse layer | `dialecta-discourse-layer.jsx` | Supersedes retired `dialecta-comment-declaration.jsx` and `dialecta-comment-feed.jsx`. |
| Fingerprint engine | `dialecta-fingerprint-engine.jsx` | **Also exists as a copy inside `dialecta-profile.jsx` -- these must stay in sync or one must be retired. Known drift risk.** |
| Contributor profile | `dialecta-profile.jsx` (desktop) + `dialecta-profile-mobile.jsx` (mobile) + `dialecta-profile-responsive.jsx` (wrapper) | Responsive wrapper is what Ghost mounts. |
| Growth scroll | `dialecta-growth-scroll-v5.jsx` | v5 is canonical. Lower-numbered versions are retired. |
| Logo | Retrieved from `dialecta-logo-datauri.txt` in Claude.ai project | Do not reconstruct from fragments. Retrieve with project_knowledge_search("dialecta-logo-datauri"). |
| Pact page | `dialecta-pact.html` | Old name `openground-pact.html` is retired. |

---

## Ghost Integration Architecture

Ghost theme + React islands pattern. Ghost owns the shell; React mounts into a `div` by ID.

```
Browser
  └─ Ghost theme HTML (Handlebars)
       ├─ <header> with Dialecta nav partial    ← Ghost owns
       ├─ <div id="dialecta-profile-root"
       │       data-user='{...}'>
       │     <ProfileBody>                       ← React mounts here
       │     </ProfileBody>
       │  </div>
       └─ <footer>                               ← Ghost owns
```

The React bundle is a `<script>` tag, finds the root element by ID, parses `data-user`, and mounts `<DialectaProfileBody user={user} />`. No hydration. No SSR. Ghost handles auth — React components receive user data as a JSON blob, they do not call auth APIs directly.

**Comment submission bypasses Ghost entirely.** The comment UI calls Dialecta's Vercel API directly. Ghost renders articles; Dialecta owns the entire comment lifecycle.

---

## Production Architecture Decisions

These cross-cutting decisions shape how new work fits into the platform. Honor them when scoping anything new.

### Path C-lite auth (Phase 1)

Members are the only login type. Ghost owns auth via `{{@member}}`. The `profiles.is_author` flag distinguishes writers; no per-author Ghost staff accounts. Articles attribute to a single house Ghost staff user (Daniel: `69d5c5be83cd72000193f037`); real bylines render from Supabase via post.hbs override (Phase 1D, pending).

Auth pattern for any new endpoint: receive `member_uuid` from `{{@member.uuid}}`, look up the corresponding `profiles` row by `ghost_member_id`, derive `member_id`/`member_name` from the profile (NOT from the request body). Identity cannot be spoofed because the server uses the verified Ghost session UUID.

Phase 1 identity convention: **`member_id text` everywhere, NOT `contributor_id uuid`.** Ghost member IDs are 24-char hex (Mongo ObjectID style). Internal Supabase PKs and FKs are uuid; only Ghost-sourced refs (member_id, article_id) are text in Phase 1. Documented in Data Architecture spec v1.2.

### Three-surface model

Dialecta has three first-class surfaces with non-overlapping purposes. Conflating them is the most common architectural mistake.

| Surface | Purpose |
|---|---|
| Article comments (post.hbs) | Depth on *this* argument: topology bar, sort, comment cards, nomination, the Private Draft compose ritual |
| Profile page | Identity layer + private mirror. Public: Fingerprint, archetype, relationships, Declared shelf. Private: Activity Rhythm View. **Not a feed surface** (Risk 3: Recognition vs. Surveillance) |
| Community page | The platform's social feed: four content types (Articles Forum-weighted Hot, Thread Spotlights, Identity Events, Opinion Map Topology Changes) per `Dialecta_Social_UX_Architecture.md` |

Decision locked 2026-04-29 (`dialecta-handoff-2026-04-29-feed-architecture.md`). Do not propose Profile feeds. Do not propose comment composition on Community.

### Wait windows (audit-confirmed)

The Private Draft Mode comment compose ritual has three real wait values, not arbitrary:

- **8s pre-reflection** (`WAIT_REFLECTION_MS`). Engine runs `/api/classify` while the brass-on-wood ReflectionBar paces three phase prompts.
- **12s pre-Stage-2.5 lock** (`WAIT_STAGE25_MS`). After the four-slot reflection card appears, "Continue → self-declare" stays disabled. *Sit with this.*
- **60-min malleability** (`MALLEABILITY_MS`). Posted comments editable / deletable for 60 minutes; `comments.hardened_at` blocks mutation server-side after.

These are encoded as module-level constants in `theme/src/dialecta-private-draft.jsx` and enforced server-side in `api/comment/[id].js`. Do not propose changing them without an explicit spec revision.

### Design token rule

Brass + wood + paper visual languages are formalized as CSS custom properties in `theme/assets/css/style.css` `:root`:

- **Brass** (formalized 2026-04-28): `--brass-deep / --brass-mid / --brass-warm / --brass-bright / --brass-pale`, plus composed `--brass-gradient` and `--brass-shadow`. Utility class `.dialecta-brass` (italic + background-clip:text + transparent fill).
- **Wood** (formalized 2026-04-29): `--wood-warm / --wood-mid / --wood-deep / --wood-edge / --wood-grain`. Utility class `.dialecta-wood-frame`.
- **Paper** (formalized 2026-04-29): `--paper-grain` (centralized fractalNoise SVG token), `--paper-bright` (#fefaea, brighter cream for engine cards). Utility class `.dialecta-paper`.

**NEVER inline gradient stops or hex values for these visual languages. Always use the tokens.** The brass title on an article must read as the same brass as the About protagonist and the Publish button. Inline stops create drift the moment a token gets refined. The brass button (full brass texture) is reserved for monumental commit moments; Publish is one. Do not overuse.

---

## What Is and Is Not Done

### Complete

- Contributor Identity layer (Fingerprint, Profile, Archetype display)
- Discourse Layer UX (3-stage comment flow, feed, tier topology, nomination)
- Vercel API: profile + comment + article + quotes route families (see Vercel API Routes above for the full list)
- Supabase: profiles + comments + classifications + axis_events + axis_scores + articles tables live; archetype/aspiration/feed_events designed
- Design Spec v1.3 (all tokens locked)
- Social UX Architecture (feed decisions, aspiration UX locked)
- **Article writing pipeline (Phase 1A through 1C, shipped 2026-04-27).** Articles table + classify + submit + publish + reader endpoints, member-uuid author auth, aesthetic-suggest with JSON parse recovery, suggest-topics, polished_html.
- **Article editor UI** (theme: `src/dialecta-editor.jsx`) and the dedicated articles feed at `/articles/` (theme: `page-articles.hbs`). Default route `/` now serves the profile for signed-in members.
- **Topic taxonomy v2 unified** in `theme/src/topics.js` as the canonical source for the bundle; consumed by `dialecta-profile.jsx` and editor surfaces. Parallel copies in `post.hbs` and `api/_topics.js` documented in the source file header.
- **Mobile responsive rebuild, Stage B.2 (2026-04-28).** The desktop/mobile parallel-component split for the profile is retired. `dialecta-profile.jsx` now renders responsively via an internal `useIsDesktop` hook; `dialecta-profile-responsive.jsx` is a backward-compat passthrough; `dialecta-profile-mobile.jsx` no longer exists in `src/`.
- **Comment compose ritual rebuild — Private Draft Mode Stage 1 (2026-04-29).** `theme/src/dialecta-private-draft.jsx`: nine-stage compose ritual modernized from the s11 prototype, mobile-aware from day one, integrated with `/api/classify` and `/api/comment`. Companion files refreshed: `dialecta-discourse-layer.jsx` (feed), `dialecta-tier-badge.jsx` (shared TIERS constants), `dialecta-reflection-bar.jsx` (AI-thinking bar).
- **Steward Order surfacing** (theme: `src/dialecta-profile-order.jsx`). OrderBadge for the public claim, OrderPatternCard for the AI-proposes / author-confirms negotiation. Backed by `/api/article/classify-order` and `/api/profile/order`.
- **Admin RBAC (live, shipped 2026-04-30).** Migration 017 normalized role tables, capabilities, and an audit log. Roles: publisher / editor / curator / reviewer. Daniel bootstrapped as Publisher. New code should use `hasCapability()` (`api/_capabilities.js`) rather than boolean flags; existing flags (`is_admin`, `is_author`) stay until Phase 2 refactor. Admin UI at `theme/src/dialecta-dev-admin.jsx` (sectioned dashboard, URL-routable tabs).
- **Feedback queue (live, shipped 2026-04-30).** Migration 018 + storage bucket 021. Sitewide submit modal in `default.hbs` (any `[data-feedback-trigger]` opens it; POSTs to `/api/feedback`). Triage in `/dev-admin/?tab=feedback` via `GET /api/admin/feedback` + `PATCH /api/admin/feedback/[id]`. Three orthogonal axes: type / priority / status. Items default `new`; require triage decision to leave (decline needs note ≥ 5 chars).
- **Notification system Stage 1 (shipped 2026-04-30).** Migration 019 + 5 API files (`_notifications.js`, `notifications.js`, `notifications/...`). In-app + opt-in email digest. Stages 3-5 pending. SMS deferred.
- **Threaded replies (shipped 2026-04-30).** Migration 020 added `comments.parent_id`.
- **Comment mentions (shipped 2026-04-30).** Migration 023.
- **Opinion-map enhancements (shipped 2026-04-30).** Migrations 022 (overrides) + 024 (multi-axis positions).
- **Tier nominations (shipped 2026-04-30).** Migration 025 added the nomination structure.

### In Progress

- **Community page** (theme: `page-community.hbs`). The page template and React mount stub (`#dialecta-community-root`) are in place, started 2026-04-28. Pending: the `ContributorsList` React component and the `/api/profile/_list` endpoint that powers it.
- **Growth Layer.** `dialecta-growth-scroll-v5.jsx` is the prototype. Next task is the Snapshot Curation Algorithm (significance scoring, 6-8 entry cap, bootstrap rules).
- **Responsive Foundations pass across the rest of the prototypes.** Profile is unified (above). Other surfaces (Stewards page, Pact page, Opinion Maps, Design Spec preview) still need the same treatment when those sessions land.
- **Uncommitted API work in tree.** Article classify-order, article upload-image, comment subroute directory, comments listing, quotes endpoint, plus a stack of polish-articles and backfill scripts. Ready to commit + deploy.

### Deferred (do not start without instruction)

- Next.js migration
- Delta mechanic (Phase 5)
- Practice Layer
- Fine-tuned classification model
- Private Draft Mode beyond Stage 1 (additional ritual iterations / refinements per Dan's roadmap)

---

## Known Landmines

1. **`dialecta-fingerprint.jsx` vs. `dialecta-fingerprint-engine.jsx`**: Two files holding versions of the same engine. Risk of silent drift. Do not edit one without checking the other.

2. **Topic taxonomy v2: now centralized in `theme/src/topics.js`**. Resolved 2026-04-28. `dialecta-profile.jsx` and the bundle now import TOPICS from this single source. Two parallel copies remain by necessity: `post.hbs` (Handlebars, runs in browser independent of the bundle) and `api/_topics.js` (Vercel runtime). When topics change, all three must be updated; the `topics.js` file header documents this.

3. **SVG defs ID collisions**: `clipPath` and `filter` IDs in fingerprint components were previously keyed only by size, causing clipping bugs when multiple instances rendered on the same page. Fixed with React's `useId()` hook for per-instance unique ID suffixes. Do not revert to static IDs.

4. **`/mnt/project/` is read-only in Claude.ai**: Claude.ai project files cannot be edited from within a Claude.ai session. All file edits must be made locally (via Claude Code) or downloaded from Claude.ai outputs and manually re-uploaded.

5. **Gravity/trajectory visual**: This was explored and abandoned. All related code was removed. Do not reintroduce it.

---

## Pending Cleanup Items (from Project Index v0.7)

These are known discrepancies. Do not treat current file state as intentional for these items.

| # | Item | Priority |
|---|---|---|
| 1 | Steelman to Advocate scrub in `Dialecta_Article_Editorial_Template.md`, `Dialecta_Contributor_Identity.md`, `Dialecta_Project_Brief.md` | Medium |
| 2 | `dialecta-s02-ux-opinion-maps.jsx` rename to `dialecta-opinion-maps.jsx` | Low |
| 3 | Fingerprint: decide canonical home (standalone engine file vs. copy in profile) and retire the other | Medium |
| 4 | `dialecta-subnav-fonts.html` -- scratch file, no canonical reference. Decide: archive or delete | Low |

---

## Dev Commands

### Repo locations

| Repo | Path | Purpose |
|---|---|---|
| Theme | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` | Ghost theme, Handlebars + compiled React (target of `C:\dialecta-local\current` symlink) |
| API | `C:\dialecta-api\` | Vercel serverless functions |
| Reference | `C:\Users\dan\OneDrive\Websites\Dialecta\` | Conceptual specs, philosophy, design archive. Read-only **except** for `Fundamentals\Dialecta_Project_Index.md`, which is a living progress tracker and is editable by Claude. |

These are two separate repos. Run commands from the correct root for each.

---

### Theme commands
*Run from: `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`*

```powershell
# Build both entry points (do this before every ZIP deploy)
npm run build

# Build profile only (src/dialecta-profile-mount.jsx → assets/js/profile.js)
npm run build:profile

# Watch index for changes during active development
npm run watch

# Watch profile for changes during active development
npm run watch:profile
```

**Entry points and their outputs:**

| Source | Compiled output | Loaded by |
|---|---|---|
| `src/index.jsx` | `assets/js/bundle.js` | `default.hbs` (sitewide) |
| `src/dialecta-profile-mount.jsx` | `assets/js/profile.js` | `page-profile.hbs` (profile page only) |

**`profile-bootstrap.jsx` is retired.** The active profile entry point is `dialecta-profile-mount.jsx`. Any reference to `profile-bootstrap` is stale.

**After any JSX edit:** run the relevant build command, then reload the local Ghost preview to verify.

---

### Ghost local server commands
*Run from: `C:\dialecta-local\` (Ghost-CLI root -- NOT the theme folder)*

```powershell
# Start Ghost locally
ghost start

# Stop Ghost
ghost stop

# Check status
ghost status

# View logs (useful when something breaks on start)
ghost log
```

Local preview URL: `http://localhost:2368`
Ghost Admin panel: `http://localhost:2368/ghost`

**Ghost must be running to preview theme changes locally.** Edit JSX in `src/`, run the build command, then refresh the browser. Ghost serves the compiled `assets/js/` files -- it does not hot-reload automatically.

---

### Theme deploy (Magic Pages)

There is no automated deploy pipeline for the theme. Deploy is a manual ZIP upload.

```powershell
# From C:\dialecta-local\versions\6.28.0\content\themes\
Compress-Archive -Path dialecta\* -DestinationPath dialecta-theme.zip -Force
```

Then: Magic Pages dashboard > Design > Upload theme > select `dialecta-theme.zip`.

**Always run `npm run build` before creating the ZIP.** Deploying without building means the compiled JS is out of date.

---

### Vercel API commands
*Run from: `C:\dialecta-api\`*

```powershell
# Install dependencies (first time only)
npm install

# Run API locally (hot reload)
vercel dev

# Deploy to production
vercel --prod
```

**Environment variables:** Store in `C:\dialecta-api\.env.local`. Required keys:

```
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GHOST_ADMIN_API_URL=https://www.dialecta.org
GHOST_ADMIN_API_KEY=
DIALECTA_HOUSE_GHOST_USER_ID=69d5c5be83cd72000193f037
```

The Ghost admin keys are required for the article submit / publish / image-upload pipeline (creates Ghost drafts, flips them to published, uploads feature images via Ghost's Admin Images API). `DIALECTA_HOUSE_GHOST_USER_ID` is Daniel's Ghost staff ID; all member-authored articles attribute to it.

Code reads `process.env.SUPABASE_SERVICE_KEY` (the canonical name in this codebase). Older docs may reference `SUPABASE_SERVICE_ROLE_KEY`; that alias is stale.

These must also be set in the Vercel dashboard under Project > Settings > Environment Variables for production to work. Local `.env.local` is for `vercel dev` only and is never committed to Git.

---

### The full local development loop

1. `ghost start` (from `C:\dialecta-local\`)
2. Edit JSX in `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\`
3. `npm run build:profile` or `npm run watch:profile` (from theme root)
4. Refresh `http://localhost:2368` to preview
5. When ready to deploy: `npm run build`, then ZIP and upload to Magic Pages

For API work:
1. `vercel dev` (from `C:\dialecta-api\`)
2. API available at `http://localhost:3000/api/...`
3. `vercel --prod` when ready to deploy

---

## Behavioral Rules for This Codebase

- **Do not propose architectural changes (Next.js, new DBs, new hosting) without being asked.** The stack is intentional and has been through explicit decision-making. Specifically: the `library.dialecta.org` / unified Next.js plan was rolled back 2026-05-06; do not propose extending `dialecta-next` beyond the OG-card + celebration-moment scope.
- **All new API endpoints go in `C:\dialecta-api\` (this repo).** The `dialecta-next` project is scoped to OG cards and the celebration moment page only. Do NOT add general API routes there. Decided 2026-05-06 to eliminate the two-API-repo drift the original "Successor to dialecta-api" framing was creating.
- **Do not simplify the classification prompt.** Tier distinctions require nuanced reasoning. Simpler prompts produce worse results for this use case.
- **Do not add ranks or hierarchy to archetype copy.** No archetype is better than another.
- **Do not use "steelman" anywhere.** The word, the concept, and the feature are all called "Advocate."
- **Do not use em dashes.** Use colons, commas, or periods instead.
- **Do not use "genuinely," "honestly," or "straightforward" in UI copy.**
- **Spec changes are targeted patches, not full rewrites.** When editing a canonical spec, change only what needs to change and verify with grep after.
- **Always `ls supabase/migrations/` before naming a new SQL migration file.** Pick `max(existing) + 1` across the whole list, not just recent ones. Three pre-existing duplicate-number collisions (007, 013, 014) exist; do not extend them. Recurring failure mode in this project (triple-011 collision happened 2026-04-29).

---

## Living Progress Documents

When picking up a session, these are faster to read than the code itself:

- **Session handoffs** (chronological): `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-YYYY-MM-DD*.md`. Multiple per day possible (`-evening`, `-morning`, topic suffixes like `-feed-architecture`, `-engines-build`). The most recent is always the current state of play.
- **Coherence Audit** (closed 2026-04-27): `Fundamentals\Claude Integration\dialecta-coherence-audit.md` (74K tokens; read in chunks). Five-phase audit; produced the lettered build queue (`a-b1` – `a-b16`, `a-d1`, `a-d2`).
- **Audit Brief** (the audit's charter): `Fundamentals\Claude Integration\Dialecta_Codebase_Audit_Brief.md`.
- **Foundation State** (one-page snapshot): `Fundamentals\Claude Integration\dialecta-foundation-state.md`.
- **Dashboard** (canonical progress tracker): `Fundamentals\Progress & Forecasts\dialecta-dashboard.jsx`. `LAUNCH_MILESTONES` array holds the First Quills 6-milestone roadmap. `DEFAULT_ITEMS` array is the seed state (loads from localStorage first; key `dialecta-dashboard-v2`).
- **Project Index** (high-level navigational map): `Fundamentals\Dialecta_Project_Index.md`.

The Project Index is editable by Claude as a living progress tracker (decision: 2026-04-29). All other Fundamentals docs are hand-tended in Word.

---

*Last updated: 1 May 2026 (organization pass: cross-references stanza added, migrations table refreshed to 000-025 with collision callouts, migration numbering rule promoted to a Behavioral Rule, RBAC + feedback queue + notifications + 2026-04-30 work added to "Complete").*
*Local canonical specs: `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\` (Project Brief, Data Architecture, Founding Philosophy, Editorial Voice, Growth Layer Principles, Social UX Architecture, Contributor Identity). Treat as read-only reference; edit in OneDrive directly. **Exception:** `Dialecta_Project_Index.md` is a living progress tracker and is Claude-editable (decision: 2026-04-29).*
*Claude integration docs: `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\` — Codebase Audit Brief (run pre-launch), session context, workflow reference. Audit Brief is the source of truth for the optimization pass.*
*Companion Claude.ai project: Dialecta (web-only, design reference and session memory)*
*Primary spec docs: `Dialecta_Data_Architecture.md` · `Dialecta_Design_Spec.html` v1.3 · `Dialecta_Project_Index.md` v0.7*
