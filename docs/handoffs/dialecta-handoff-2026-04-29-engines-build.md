# Dialecta — Engines Build Handoff
*Commenting + Private Draft engines: shipped, what to deploy, what's deferred*
*2026-04-29*

---

## Purpose of this doc

Closes the session in which the Discourse Layer's two engines were built end to end: the Private Draft (comment compose ritual) and the Discourse Layer feed (cards, topology, filter/sort, edit/delete). Companion to `dialecta-handoff-2026-04-29-feed-architecture.md`, which carried the Community-feed conceptual work to a separate chat.

Phase 2 (Discourse Layer) of the launch roadmap is now structurally in place. Smoke test pending.

---

## What was accomplished

### Conceptual decisions locked

- **Three-surface model.** Article comments (post.hbs, depth) vs Profile page (identity layer + private mirror) vs Community page (the dopamine-for-good social feed). The Activity Rhythm View stays private; the social feed lives on Community, not Profile.
- **Dopamine-for-good as platform thesis** confirmed across founding docs (Growth Layer Principles, Social UX Architecture, Founding Philosophy, Tier Psychology). Documented in the feed-architecture handoff.
- **Borderline handling.** Engine commits to a tier publicly. At compose time, when borderline_flag fires, the alternative read surfaces as a Growth Frame coaching prompt. The flag stays internal data, drives community reclassification queue priority. Never a public label.
- **Append-after-hardening.** Article-side commitment only. Dropped from comments. If a contributor wants to refine after hardening, they post a reply (once threading lands).
- **Threading.** 2-level cap (top-level + replies, no nesting). Deferred to Phase 2.5. v1 shows reply count if present, no expansion.
- **Wait windows.** Real values, audit-confirmed: 8s pre-reflection, 12s pre-Stage-2.5 lock, 60-minute malleability.
- **Re-classify on edit.** Confirmed. Edit during malleability window calls /api/classify with the new body, updates the classification row in place.
- **Design modernization.** Wood (rim, not body) + brass (hardware) + cream paper-grain (substrate) formalized as tokens. Reflection bar's existing palette is the prototype the rest follows.

### Database (both migrations applied to production Supabase)

| Migration | Adds |
|---|---|
| `011_comment_malleability.sql` | `comments.hardened_at timestamptz NOT NULL DEFAULT (now() + interval '1 hour')` + `idx_comments_hardened_at`. Default fires on insert; existing rows backfilled to `now()` so they read as already-hardened. |
| `012_classifications_full_schema.sql` | Stage A reasoning fields on `classifications`: `claim_text`, `strength`, `specificity_score`, `emotion`, `tribal_markers`, `tribal_example`, `article_engagement`, `opposing_view_engaged`, `borderline_flag`, `borderline_other_tier`, `commenter_message`. Plus `idx_classifications_borderline` partial index for the community reclassification queue. Idempotent. |

### API endpoints

| File | Status | What |
|---|---|---|
| `api/classify.js` | Modified | Added `strength` field to the JSON shape returned by the Anthropic call. The Reflection card's "What this does well" slot reads from this field — Growth Frame doctrine ("name what is there, not what is missing"). Prompt updated with editorial principle for the strength field. |
| `api/comments.js` | New | `GET /api/comments?article_id=...&viewer=...&seed=&limit=` Returns comments + classifications joined in JS (no FK assumption), shaped for the Discourse Layer feed render. Filters `member_id LIKE 'seed:%'` from public results unless `seed=1`. |
| `api/comment/[id].js` | New | `PATCH /api/comment/:id` (edit body, re-classifies, refuses if `now() >= hardened_at`) and `DELETE /api/comment/:id` (hard delete during malleable window only). Member_uuid auth: only the original author can mutate. |

Vercel Pro tier in effect (Hobby's 12-function cap was hit and resolved by upgrade). Both API endpoints kept as separate RESTful files since the cap was the only reason to consolidate.

### Theme: design tokens (style.css)

Added to `:root`:
- `--wood-warm` (#c48040), `--wood-mid` (#9a5c28), `--wood-deep` (#7a3e16) — accent palette matching the reflection bar's existing wood gradient
- `--wood-edge` (rgba(154, 92, 40, 0.22)) — subtle border tint, the rim around paper
- `--wood-grain` — full 3-layer SVG/gradient texture for surfaces that need to read distinctly as a wood plank (rare; reserved for the reflection bar family)
- `--paper-grain` — centralized fractalNoise SVG token (existing inline copies on `.post-card`, `.post-content`, `.nav-drawer paper` can migrate to this in a separate sweep)
- `--paper-bright` (#fefaea) — brighter cream for engine cards. The original `--paper` (#fbf6ea) was visually too close to the page background `--cream` (#f7f2e8); the new token gives engine cards visible lift without going to white.

Utility classes:
- `.dialecta-paper` — cream paper substrate with grain (now uses `--paper-bright`)
- `.dialecta-wood-frame` — wood-edge border + brass-pale inner highlight + soft layered shadow + hover state with brass-warm border tint and brass-shadow lift

### Theme: components (src/)

| File | Status | Lines | What |
|---|---|---|---|
| `dialecta-tier-badge.jsx` | New | ~280 | Shared tier badge primitive. Exports `TIERS`, `TIER_BY_KEY`, `TierBadge` default, `TierBadgePair` named (renders AI + self-declared side by side when they differ). Custom SVG icons per tier (no emojis; Tier Psychology rationale). Sizes sm/md/lg, selected/suggested ring states. Forum icon renders in `--ink` against near-white chip for contrast. |
| `dialecta-private-draft.jsx` | New | ~1000 | The compose engine. Nine stages: Compose / Consent / Reflecting / Reflection / Declare / Stage25 / Respond / Final / Posted. Real wait values. ReflectionBar consumed via `size="comment"` preset. Mobile-aware via `clamp()` and flex-wrap. Fetches `/api/classify` (Stage 1) and `/api/comment` (Final post) via the shared `apiBase()` helper. Optimistic posted card with live 60-minute countdown. |
| `dialecta-discourse-layer.jsx` | New | ~720 | The feed engine. Topology bar (proportional tier strip with click-filter), Control bar (filter chips + Quality/Newest sort, sticky below the two-bar nav), Comment cards (header with avatar initials chip + tier badges, body, footer with specificity dots + edit/delete), Contrast strip when AI ≠ self_declared, Breach variant (0.65 opacity + suppression notice), Edit overlay with re-classify on save. Optimistic prepend of newly-posted comments. Fetches `/api/comments`, calls `/api/comment/:id` for PATCH/DELETE. |
| `index.jsx` | Modified | +imports +wrapper | Added `DialectaPrivateDraft` and `DialectaDiscourseLayer` imports. New `DialectaCommentsRoot` wrapper component owns optimistic-comments state shared between the two engines. Mounted onto `#dialecta-comments`. Signed-out visitors see read-only feed with sign-in CTA in place of compose. |

### Theme: handlebars

- `post.hbs` — added `data-post-title="{{title}}"` and `data-member-email="{{@member.email}}"` to `#dialecta-comments`. The Private Draft needs `member_email` for the `/api/comment` POST (per `api/comment.js` validation) and `post_title` for `article_title` in the same call.

### Operational changes

- **Vercel Pro upgrade** unblocked the 12-function cap. Two new endpoint files (api/comments.js, api/comment/[id].js) kept as separate RESTful files because path-param `:id` is cleaner than query-param `?id=` and matches the existing `api/article/[id].js` and `api/profile/[id].js` patterns.
- **Bundle size** moved from ~1.3mb to 1.6mb with the two engine files compiled in.

### Companion handoff written

`dialecta-handoff-2026-04-29-feed-architecture.md` (same folder) carries the Community page / feed architecture conceptual work to its own chat. Covers the three-surface model, the dopamine-for-good thesis with citations, the four content types per the Social UX Architecture doc, current `follows` + `feed_events` infrastructure state, and the open decisions for that build (path of execution, tabs vs replace for the existing contributors directory, personalized-vs-global feed cut, phase staging).

---

## What needs to be updated (deploys pending on user)

### 1. Re-ZIP and upload the theme

The deployed bundle.js predates the `apiBase()` fix in Private Draft. Until the new ZIP is uploaded, Stage 1 reflection fetches resolve to `dialecta.org/api/classify` (Ghost) and 404 with HTML, producing the *"Unexpected token '<', '<!DOCTYPE'... is not valid JSON"* parse error.

```powershell
cd C:\dialecta-local\current\content\themes\dialecta
npm run build
Get-ChildItem -Exclude 'node_modules', 'src', 'CLAUDE.md', 'package-lock.json' |
  Compress-Archive -DestinationPath ..\dialecta-theme.zip -Force
```

Then Magic Pages → Design → Upload theme. The ZIP carries:
- bundle.js with the `apiBase()` helper inside `dialecta-private-draft.jsx` so fetches hit `dialecta.vercel.app/api/classify` and `dialecta.vercel.app/api/comment` correctly
- style.css with `--paper-bright` (#fefaea) and `.dialecta-paper` updated, so engine cards visibly lift off the page background

### 2. (Optional) Re-deploy the API

The latest local API has the `strength` field added to `api/classify.js`, but if the Vercel deployed version doesn't have it yet, the Reflection card's "What this does well" slot will be conditionally hidden (graceful degradation). Other three slots populate.

```powershell
cd C:\dialecta-api
vercel --prod
```

Live API was probed during the session: `/api/classify` returns 200/JSON, `/api/comments?article_id=...` returns 200/JSON. The endpoints are reachable; only the strength-field update may be missing.

### 3. Smoke test (the actual proof)

On any post page on the live site:

| Step | Expected |
|---|---|
| Type 8+ words, click Reflect | Consent card with 60-min malleability briefing |
| Click "I understand" | 8s reflection wait with the brass-on-wood ReflectionBar |
| Wait completes | Four-slot reflection card: claim found / strength / shape / suggested tier with brass-pale ring |
| Wait 12s for the lock | "Continue → self-declare" activates |
| Pick a tier (or accept the AI's) | Stage 2.5 three-way choice (or two-way if you agree) |
| Choose Accept | 60-min final briefing |
| Click Post | Live malleable card with `MM:SS` countdown plaque, brass-bright outer ring, edit/delete buttons |
| Edit during window | Re-classifies; contrast strip updates if the new read differs from your declared tier |
| Delete during window | Comment disappears from view |
| Wait past 60 min, try edit/delete | 409 "Malleability window has closed" |
| Below the compose: feed | Topology bar, control bar (filter + sort), comment cards rendering on brighter cream paper inside wood-edge frames |

If any step breaks, the error message + the network-tab response should be enough to trace.

---

## What is left unresolved

### Deferred (intentional, documented)

1. **Vote controls.** No `comment_votes` table yet. Phase 2.5. Comment cards have footer space reserved for vote UI without layout disruption when added.
2. **Nomination panel submit.** No `nominations` table yet. Phase 2.5. The OneDrive prototype's `NominationPanel` component is held; v1 ships without it on the cards. Reclassification flow architecture is documented in `Dialecta_Discourse_Layer_UX.md`.
3. **Threading / reply expansion.** 2-level cap decision made. Implementation deferred to Phase 2.5. v1 will show reply count if present, no expansion. Reply composer scope (full Private Draft ritual vs lighter) is the open design call when threading is built.
4. **Most-discussed sort.** Depends on votes + replies. Defer with threading.
5. **Append-after-hardening on comments.** Explicitly dropped (article-side commitment only).
6. **`article_claims` wiring.** Private Draft + edit endpoint pass `null`. Classifier handles missing claims gracefully but quality improves once authors submit claims at article publish time. Phase 1B follow-up.
7. **Tier badge mount on `#dialecta-tier-badge` in post hero.** That mount is for the article's classification tier (article-side classification pipeline). Not part of this engine build. Slot stays empty until the article-side classification lands.
8. **Sparring Partner detection job.** Nightly materialization from `comments` joining reply-pair detection across articles. Independent of engines, planned per Relationship Types spec. Threshold = 5 articles with mutual replies.
9. **Edit history on classifications.** Currently update-in-place. If telemetry shows it matters, refactor to a `classifications_history` append-only table.
10. **Wait Architecture canonical spec doc.** Referenced in audits but not yet written. Operational values are captured in audit + the engine code; spec doc is on the Phase 1 build queue per the coherence audit.

### Discourse Layer beyond post.hbs

The Discourse Layer (or pieces of it) eventually mount on the Community page as part of the four-content-type feed. That work belongs to the Community-feed chat (handoff: `dialecta-handoff-2026-04-29-feed-architecture.md`). The current build is post.hbs only.

### Sprint 2 (Responsive Foundations)

Engines are mobile-aware from day one (clamp paddings, flex-wrap, horizontal-scroll filter chips, single-column layouts at narrow widths). The broader Sprint 2 responsive sweep across info pages, /quotes/, etc. is still on the launch roadmap. Per the user direction in the previous handoff, the order is: editor responsive (done) → engines mobile-aware (done in this build) → defer info-pages and /quotes/ until after Community ships.

---

## Files touched in this session

### Theme (`C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`)

```
src/dialecta-tier-badge.jsx        (new)
src/dialecta-private-draft.jsx     (new)
src/dialecta-discourse-layer.jsx   (new)
src/index.jsx                       (modified — imports + wrapper + mount block)
post.hbs                            (modified — data-member-email + data-post-title)
assets/css/style.css                (modified — wood/paper tokens + utility classes + brighter cream)
assets/js/bundle.js                 (compiled output, 1.6mb — built but not yet deployed)
assets/js/profile.js                (compiled output)
assets/js/quotes.js                 (compiled output)
```

### API (`C:\dialecta-api\`)

```
api/classify.js                     (modified — strength field added)
api/comments.js                     (new — GET feed)
api/comment/[id].js                 (new — PATCH + DELETE)
supabase/migrations/011_comment_malleability.sql       (new — applied)
supabase/migrations/012_classifications_full_schema.sql (new — applied)
```

### Reference (read-only OneDrive)

```
Fundamentals/Claude Integration/dialecta-handoff-2026-04-29-feed-architecture.md  (new — written for the Community/feed chat)
Fundamentals/Claude Integration/dialecta-handoff-2026-04-29-engines-build.md       (this doc)
```

---

## How to resume in the next session

1. Read this doc + `dialecta-handoff-2026-04-29-feed-architecture.md` for state.
2. Confirm the deploys landed (re-ZIP+upload theme; optionally re-deploy API).
3. Run the smoke test sequence above on a live post page.
4. Either fix any breaks, or move to next priority. Likely candidates:
   - **Phase 1B: article_claims wiring.** Authors submit claims at publish; classifier reads them. Both Private Draft and edit endpoint already accept the param.
   - **Phase 2.5: Discourse Layer round 2.** Threading, voting, nomination submit. Each requires a migration.
   - **Sprint 2 Responsive Foundations sweep** across info pages + /quotes/.
   - **Community feed build** (separate chat, handoff already written).

---

## Closing note

What landed this session is the second pillar of Dialecta in functional form. Yesterday's handoff said *"Phase 2 (Discourse Layer) is the remaining pillar."* It now exists as code:

- The Private Draft is a writing surface that carries a contributor through the platform's signature ritual: compose, sit with the engine's reading, declare your own tier, choose how to handle agreement or disagreement, post into a 60-minute malleability window. The wait windows are real. The Stage 2.5 three-way choice is real. The reflection card with its four slots (claim / strength / shape / suggested tier) is real and reads from a live API.
- The Discourse Layer feed renders the conversation that emerges from those rituals: cards on cream paper inside wood-edge frames, with the contrast strip making AI-vs-self disagreements public, with the live malleable counter visible on every fresh comment, with the edit and delete affordances bounded by the same 60-minute window the platform commits to.
- The engine surfaces share components (TierBadge, ReflectionBar, the design tokens) and respect the same constraints: no algorithmic amplification, no streak loss, no engagement-optimizing shortcuts, no "borderline" labels surfacing as content. The platform's values are encoded into what the surfaces can and cannot do.

Smoke test will tell us whether the wiring holds. The structure is in place either way.

— End of session 2026-04-29 (engines build)
