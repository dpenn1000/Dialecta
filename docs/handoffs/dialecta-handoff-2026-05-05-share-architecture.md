# Dialecta Share Architecture: Session Handoff

**Date:** 2026-05-05
**Thread topic:** OG-card system, First Comment celebration, share infrastructure
**Origin:** This thread started with the Cloudflare front-end question and grew through a full launch of OG-1 through OG-5, plus the share landing architecture. Closing it down with this handoff so future work happens in focused threads.

---

## What Got Shipped In This Session

### Core OG card system (all five surfaces deployed)

| Surface | Status | Notes |
|---|---|---|
| **OG-1** Contributor card | Live | Renders profile name, handle, archetype, top pillar caption. Cream + brass aesthetic. |
| **OG-2** Quote card | Live | Quote text, attribution, optional photo background. Plus full SSR page at `/quote/<slug>` with JSON-LD Quotation schema. |
| **OG-3** Article card | Live, redesigned twice | First was cream + text overlay. **Final design: pure feature_image, no overlays** (matches WaPo/NYT publication standard). Falls back to `article-fallback.jpg` if no feature_image set in Ghost. |
| **OG-4** Comment card | Live | Comment body, member name, article context, tier badge. |
| **OG-5** Celebration card | Live | The most elaborate: photo background with warm-ink curtain, bright gold italic kicker top-left, dark Dialecta logo silhouette top-right with white-and-gold sun-glow halo, hero focal content (per event type), author signature in their chosen hand-script font, dateline, footer rule with handle. |

### Underlying infrastructure

- **Migration 033_celebration_events** applied. Append-only event log with `member_id`, `event_type` (7 enum values), `context jsonb`, `occurred_at`, `modal_dismissed_at`, `shared_at`. Service-role RLS policy.
- **First-comment trigger** in `dialecta-api/api/comment.js` inserts a celebration row when this is the user's first comment, and returns the celebration object inline in the response so the modal can pop immediately.
- **Celebration modal** in `dialecta-local/.../src/dialecta-celebration-modal.jsx`. Listens for `dialecta:celebration` window events, renders editorial card with share buttons and signature. Mounted sitewide via `shell.jsx`.
- **Private draft submit handler** in `dialecta-private-draft.jsx` dispatches the `dialecta:celebration` event after a successful comment post.
- **Theme ZIP** built at `C:\dialecta-local\current\content\themes\dialecta-theme.zip`. Awaits upload to Magic Pages dashboard.

### Asset infrastructure

- **Real Dialecta logo** baked at `dialecta-next/public/branding/dialecta-logo.png` (sharp-resized to height 80, palette-optimized PNG, 6.8 KB)
- **Article fallback photo** at `dialecta-next/public/branding/article-fallback.jpg` (Article_Background.png processed to 1200x630 at JPEG quality 92, 89 KB)
- **9 signature font TTFs** at `dialecta-next/assets/fonts/signatures/*.ttf` (Mrs Saint Delafield is default; the other 8 lazy-load per contributor's `profiles.signature_font`)
- **12 celebration background photos** at `dialecta-next/public/og-backgrounds/library/photo-NN.jpg`. Photo-01 is now Book Nook Wide (1659x948 source, downsampled at quality 92, 216 KB). The other 11 are still 1024x1024 ChatGPT outputs at quality 80; regenerate with sharper sources when you have them.
- **Asset processing scripts** at `dialecta-next/scripts/process-og-backgrounds.mjs` and `dialecta-next/scripts/fetch-branding-assets.mjs`. Re-run after dropping new sources into the OneDrive Marketing folder.

### Click-through architecture

The single biggest architectural decision this session: **how Facebook (etc.) sends people from a share preview to the right destination**.

The constraint stack:
- The OG card image must come from `dialecta-next` (we control the rendering)
- The displayed source line in social previews should read DIALECTA.ORG, not DIALECTA-NEXT.VERCEL.APP
- The click destination should land on `www.dialecta.org` (the actual article on Ghost)
- Facebook's crawler must be able to scrape the page that emits our og:image meta

The shipped solution (UA-based redirect):

```
Facebook crawler hits /contributor/<handle>/moment/<id>
  -> page renders normally, FB scrapes celebration card via og:image meta
  -> og:url meta points at www.dialecta.org/<article-slug>/
  -> source line displays as "WWW.DIALECTA.ORG"

Real human clicks the FB post
  -> browser hits /contributor/<handle>/moment/<id>
  -> page detects non-bot UA via headers().get('user-agent')
  -> 307 redirect to https://www.dialecta.org/<article-slug>/
  -> visitor lands on the article, where the celebrated comment is in context
```

The bot allowlist regex covers facebookexternalhit, Twitterbot, LinkedInBot, Slackbot, Discordbot, TelegramBot, WhatsApp, bingbot, Googlebot, plus a handful of others. Extend if a new platform shows up.

### Visual design lessons (logged here for future sessions)

| Lesson | Where it surfaced |
|---|---|
| Article OG cards should be **pure photo, no text overlays**, matching publication convention (WaPo, NYT, etc.). FB renders title and source below the image. | Final iteration on OG-3 |
| Celebration cards do the opposite: rich editorial overlays, because they have unique branded content (the comment, the signature, the kicker) that defines the moment. | OG-5 design |
| **Bright gold (#ecb438) on dark curtain** reads brilliantly. **Dark silhouette (filter: brightness(0)) with white halo + warm gold drop-shadow** simulates sunlight catching the logo. | Logo placement on celebration card |
| **Drop-shadows for elevation, not glow.** Tight 1px inner for crisp edges + offset-down 6px/12px-blur drop reads as "raised off the page". Wide diffuse shadows read as "glowing in fog", which is the wrong feeling for editorial work. | Kicker shadow tweak |
| **Satori needs explicit width and height on `<img>` tags.** `width: 'auto'` renders as 0 silently. Use the resolved pixel dimensions. | Logo invisibility bug |
| **Magic-byte verification is mandatory for any binary asset.** Two of three "TTFs" we processed were 304 KB HTML 403 pages with `.ttf` extensions. File size, readability, and trace bundling all reported success. Only the first 4 bytes told the truth. | Original OG-1 debugging |

---

## What's Pending Right Now (First Comment)

1. **Theme ZIP upload to Magic Pages** — the celebration modal goes live the moment this happens. ZIP is at `C:\dialecta-local\current\content\themes\dialecta-theme.zip`. **Worth confirming the ZIP is fresh** before upload (a couple of subsequent edits to private-draft and shell may not be in the existing ZIP; rebuild and re-zip if more than a day old).
2. **End-to-end test** with a fresh member who hasn't commented before. Submit a comment, see the modal pop, click Share on FB, verify the FB preview, click through, land on article.
3. **Cache-busting for the theme-side og:image meta tag.** `default.hbs` injects `<meta property="og:image" content="https://dialecta-next.vercel.app/article/{{slug}}/opengraph-image" />` with no query buster. When we redesign an article OG card, FB has the old version cached. For the next theme deploy, append a `?v=<deploy-counter>` and bump it whenever the article OG visual changes.
4. **`?preview=1` bypass on the moment redirect.** Right now admin viewing of a celebration page requires either bot UA, FB Debugger, or hitting the OG image URL directly. A `?preview=1` query that skips the human redirect would make iteration easier. Small change, deferred.

---

## Future Phases (Each One Should Be Its Own Thread)

The thread you should open for each is named in **bold**.

### Phase A — Wire remaining 6 celebration triggers
**Thread name:** `OG-5 Phase 3a: remaining triggers`
**Scope:** Add the celebration insertion block (mirroring the `first_comment` pattern in `api/comment.js`) to:
- `first_article` in `api/article/submit.js`
- `first_quote` in `api/quotes.js` (specifically the admin-accept-suggestion code path, OR the admin-create-for-member path)
- `delta_acknowledged` in whatever endpoint records delta acknowledgments
- `tier_promoted` in `api/article/repolish.js` (when `final_tier` changes upward)
- `follower_milestone` in the follow endpoint (cross of 1, 10, 100; idempotent per-threshold dedup)
- `became_steward` in `api/admin/team` when a role is granted

Each trigger needs:
- Idempotency check (no duplicate celebration for same member + same milestone)
- The right `event_at` written into context (the actual event timestamp, not insert time)
- Inline return of celebration object in the API response so the relevant client surface can dispatch the modal event

### Phase B — Per-event content fetches in the OG card
**Thread name:** `OG-5 Phase 3b: per-event content`
**Scope:** Right now `lib/get-moment.js` and `app/contributor/[handle]/moment/[id]/opengraph-image.js` only fully render `first_comment` content. Other event types fall through to generic kicker + name + signature. They need:
- `first_quote` -> fetch quote_text from `quotes` table via `context.quote_id`, render in italic Cormorant
- `delta_acknowledged` -> fetch the original comment body via `context.comment_id`, render as quote
- `tier_promoted` -> render article title + tier-arrow ("Speculative -> Declarative")
- `follower_milestone` -> render the count number large, no quote glyph
- `became_steward` -> render the Order designation (probably a unique visual, gold-rich)
- `first_article` -> render article title in italic Cormorant, plus excerpt

### Phase C — Admin OG-library upload UI
**Thread name:** `OG-5 Phase 3c: admin OG library`
**Scope:** `/dev-admin/?tab=og-library`
- Supabase Storage bucket `og-library` (public-read, admin-write)
- Per-event-type upload form, drag-drop image picker with preview
- Spec-validation (1200x630, 150 KB max, JPG/PNG)
- Replace/delete affordances
- API routes `/api/admin/og-library` (GET list, POST upload, DELETE)
- Wire moment OG card to read from Storage instead of `public/og-backgrounds/`. Filesystem becomes a fallback only.

This is the long-term replacement for `lib/og-background-config.js`. Filesystem mapping works for a small curated set, but once you want admins (not Daniel only) to manage the library, this UI becomes necessary.

### Phase D — OG-1 Profile richness
**Thread name:** `OG-1 Profile fingerprint + signature`
**Scope:** The contributor OG card is currently text + initials disc. Add:
- The contributor's Fingerprint SVG rendered as a focal element (Satori supports SVG). The current Fingerprint engine renders client-side; need a server-renderable variant or pre-bake to SVG/PNG per profile when `axis_scores` change.
- Display name in the contributor's chosen signature font (mirror of OG-5 treatment)
- Maybe the archetype label as a kicker

### Phase E — OG-2 / OG-4 background polish (optional)
**Thread name:** `OG-2 OG-4 photo backgrounds`
**Scope:** Quote and Comment OG cards stay text-first today (the typography carries the visual weight). Optional: same `BACKGROUND_MAP` system as celebrations, with photos chosen per quote tradition or comment tier. Lower priority since the existing cards work.

### Phase F — OG-5 Theme integration: comment-share button
**Thread name:** `OG-4 theme: comment share button`
**Scope:** Add a "Share" affordance to each comment in `dialecta-discourse-layer.jsx`. Click should open a dialog or directly invoke navigator.share with the OG-4 comment URL. Currently no UX surface to share a specific comment.

### Phase G — Phase 6 DNS: library.dialecta.org
**Thread name:** `Phase 6: library.dialecta.org subdomain`
**Scope:** Long-term cleanup of dialecta-next URLs. User adds CNAME `library.dialecta.org` -> `cname.vercel-dns.com` in DNS provider. In Vercel dashboard, add `library.dialecta.org` as custom domain on dialecta-next project. Update `NEXT_PUBLIC_SITE_URL` env var. Update hardcoded `dialecta-next.vercel.app` strings in:
- `default.hbs` (theme repo, the og:image meta and any other share-link references)
- `app/contributor/[handle]/moment/[id]/page.js` (SITE_BASE constant)
- `app/sitemap.js`
- `app/robots.js`

After this, share previews show LIBRARY.DIALECTA.ORG instead of DIALECTA-NEXT.VERCEL.APP. Click destinations are unchanged because the moment URL still redirects humans to www.dialecta.org articles.

### Phase H — OG cache-busting strategy
**Thread name:** `OG cache versioning`
**Scope:** Decide and document the strategy for invalidating cached OG images at the social-platform level after a redesign. Options:
- Theme template emits `?v=<hardcoded-counter>` in og:image meta, bumped manually on each visual update
- Per-deploy buster on the page-side embed (already done for celebration moment page)
- Vercel deployment cache purge via API on redesign deploys
- Different cache-control header (max-age=300 instead of immutable)

---

## Architectural Decisions Logged In Memory

These have memory entries (or should):
- `project_og_card_infrastructure.md` (existing) — the five lessons from the original OG-1 debugging
- `project_path_c_lite_auth.md` (existing) — Ghost house user + Supabase byline overrides; relevant to the OG cards' author display logic
- `project_public_seo_architecture.md` (existing) — the long-deferred Cloudflare + Vercel SSR strategy; this thread implemented Path C (Next.js SSR), still doesn't have Cloudflare path-routing
- **Suggested new:** an `og_share_architecture.md` covering the UA-redirect pattern, og:url canonicalization, Magic Pages www. canonicalization, and the "article OG = pure photo" convention. Worth adding when picking up Phase A.

---

## Files That Matter (Quick Index)

| Path | Purpose |
|---|---|
| `dialecta-next/app/contributor/[handle]/moment/[id]/opengraph-image.js` | OG-5 celebration card |
| `dialecta-next/app/contributor/[handle]/moment/[id]/page.js` | OG-5 SSR page (redirects humans to article) |
| `dialecta-next/app/contributor/[handle]/moment/[id]/MomentShareButtons.js` | Share controls client component |
| `dialecta-next/app/article/[slug]/opengraph-image.js` | OG-3 article card (pure photo) |
| `dialecta-next/app/contributor/[handle]/opengraph-image.js` | OG-1 contributor card |
| `dialecta-next/app/quote/[slug]/opengraph-image.js` | OG-2 quote card |
| `dialecta-next/app/quote/[slug]/page.js` | Quote SSR page |
| `dialecta-next/app/comment/[id]/opengraph-image.js` | OG-4 comment card |
| `dialecta-next/lib/get-moment.js` | Celebration data fetcher (validates handle ownership) |
| `dialecta-next/lib/get-article.js` | Ghost + Supabase article fetcher (returns feature_image, signature_font) |
| `dialecta-next/lib/get-quote.js` | Quote fetcher |
| `dialecta-next/lib/get-comment.js` | Comment fetcher |
| `dialecta-next/lib/og-background-config.js` | Per-event-type photo mapping |
| `dialecta-next/scripts/process-og-backgrounds.mjs` | One-shot photo processor (PNG -> 1200x630 JPG) |
| `dialecta-next/scripts/fetch-branding-assets.mjs` | One-shot logo + signature font fetcher |
| `dialecta-next/next.config.mjs` | `outputFileTracingIncludes` for fonts + photos + branding |
| `dialecta-api/api/comment.js` | First-comment celebration trigger |
| `dialecta-api/supabase/migrations/033_celebration_events.sql` | The schema |
| `dialecta-local/.../src/dialecta-celebration-modal.jsx` | The modal component |
| `dialecta-local/.../src/dialecta-private-draft.jsx` | Dispatches celebration event after submit |
| `dialecta-local/.../src/shell.jsx` | Mounts the celebration modal sitewide |
| `dialecta-local/.../default.hbs` | Theme. Custom og:image meta tag for article shares. |

---

## Test URLs (For Future Threads)

These all use the existing test celebration row:

```
moment id:  27949fc8-40a9-442f-b1fa-c920d2a0efc1
member:     dpenn1000 (Daniel Pennington)
event_at:   2026-04-29 (the actual comment date)
context:    first_comment on "On the Far Shore of Fear"
```

| URL | What it shows |
|---|---|
| `https://dialecta-next.vercel.app/contributor/dpenn1000/moment/27949fc8-.../opengraph-image` | Celebration OG card (PNG; bot UA bypass not needed for this route) |
| `https://dialecta-next.vercel.app/contributor/dpenn1000/moment/27949fc8-...` | Moment page (redirects humans to article; bot UA sees the SSR page) |
| `https://dialecta-next.vercel.app/article/on-the-far-shore-of-fear/opengraph-image` | Article OG card (pure photo) |
| `https://dialecta-next.vercel.app/contributor/dpenn1000/moment/_probe/opengraph-image` | Probe JSON (cwd, font dirs, photo dirs, runtime info) |
| `https://www.dialecta.org/on-the-far-shore-of-fear/` | The actual article on Ghost (where redirected humans land) |

For FB Debugger work: https://developers.facebook.com/tools/debug/

---

## Closing Note

The First Comment celebration is functionally complete. What's left is the theme upload (one click for the user) and the end-to-end test with a fresh member account. Everything else listed in the Phases section above should be its own thread. This thread is closed with this handoff.
