# Dialecta — Community Page Author View Handoff
*Author Profile View as a function of the Community page. Driven by the need for "click author → see all their work" without changing the profile.*
*2026-04-29*

---

## Purpose of this doc

Carry the Author Profile View design forward to the chat that owns Community / feed work. Decision made 2026-04-29 in the theme-build chat: the profile page stays as the identity surface (consistent for every viewer, never a feed). The "see what this contributor has made" experience moves to the Community page as a new mode alongside the feed and the contributors directory.

This doc defines what the Author View is, what's available to build with, and what design questions remain.

---

## Context — read first

Required:
- `dialecta-handoff-2026-04-29-feed-architecture.md` — three-surface model; Community page's four content types; existing infrastructure (follows, sparring_partners, feed_events)
- `dialecta-handoff-2026-04-29-engines-build.md` — engines build; byline override pattern; `articles.author_member_id` lookups

Three-surface model (locked 2026-04-29):
- **Article comments** (post.hbs): depth on *this* argument
- **Profile page**: identity layer + private mirror. Public: Fingerprint, archetype, relationships, Declared shelf. Private: Activity Rhythm View. **Not a feed surface**, by user direction
- **Community page**: the platform's social feed (four content types) AND the Author Profile View (this work)

The profile stays clean and consistent. The Author View is where "what this writer has made" lives.

---

## What the Author View is

A landing on `/community/` (probably `/community/?author=<member_id>` or a tab/mode within the page) that shows:

- Avatar, italic Cormorant name, short bio
- A link to the contributor's full profile (the identity surface)
- A feed of every article they've authored
- "Key comments" — comments by this author worth surfacing (curation question, see below)

It's editorial, not algorithmic. A reader who liked one piece by Rylie can come here to see what else she's written and how she's argued in other threads.

---

## Routing decision — confirm with user before building

When a reader clicks an author byline (post.hbs meta bar, post-card on /articles/, anywhere bylines render), where do they go today?

**Today: bylines route to `/profile/?id=<member_id>`.** That's the identity surface — Fingerprint, archetype, relationships. No article list.

Three options for byline behavior with the Author View live:

| Option | Behavior | Tradeoff |
|---|---|---|
| (a) Status quo + new button | Bylines stay → `/profile/`. Profile gets a small "See [Name]'s work →" button that links to Author View. | Lowest disruption. Two clicks to get to articles. |
| (b) Bylines redirect | Bylines → Author View. Profile reached via a "View full profile" link from the Author View. | One click to articles. Profile becomes the deeper destination, not the default. |
| (c) Split by surface | Article-card bylines → Author View (discovery context). Article-page byline → profile (you're already reading them, deepen the relationship). | Most contextual. More complex routing. |

The user's framing in the originating message: *"There needs to be a way (probably on the profile page) so that when you click on an Author, you can see all of their Articles. I was originally thinking their feed, but perhaps there can be a button to take them to a prefiltered Community page."* That sounds like (a). Confirm before building.

If (b) or (c): byline targets need to be swapped in `post.hbs`, `page-articles.hbs`, `index.hbs`, and the bulk patcher script in `default.hbs`. Search for `'/profile/?id='` in those files; the patcher in `default.hbs` is around line 545.

---

## What's already available

### API endpoints (live)

- `GET /api/profile/:id` — full profile bundle: bio, axisScores, archetype, stats, connections, readers/sources/correspondents/sparringPartners
- `GET /api/profile/_list` — full contributors directory (currently rendered as the Community page's stub)
- `GET /api/profile/_feed?viewer=<uuid>` — personalized feed; useful as a pattern for how to fan-out fetches and join Ghost metadata
- `GET /api/article/:id` — article + Supabase author `{ member_id, display_name, avatar_url, bio }`
- `GET /api/article/_authors?ids=...` — bulk author lookup for cards

### Schema (live)

- `articles`: `ghost_post_id`, `author_member_id`, `declared_tier`, `ai_suggested_tier`, `final_tier`, `declaration jsonb`, `ai_analysis jsonb`, `author_note`, `status`, `created_at`. Author identity is `author_member_id` (text, equal to the Ghost member UUID; same key used in `comments.member_id`).
- `comments`: `member_id`, `article_id`, `body`, `status`, `hardened_at`, joined to `classifications` for tier
- `classifications`: full Stage A + B (note: `strength` is NOT a column despite handoff documentation implying it; classifier returns it but it's never persisted)

### Theme

- `page-community.hbs` — currently a mount stub (`#dialecta-community-root`); renders a contributors directory via the existing `index.jsx` mount
- `ContributorsList` is referenced in handoff docs but not yet present in `src/`; the directory render is in `index.jsx` directly
- `dialecta-tier-badge.jsx` — shared `TIERS`, `TIER_BY_KEY`, `TierBadge`, `TierIcon` primitives
- Brass + wood + paper design tokens are formalized; never inline gradient stops

---

## Suggested Author View structure (subject to design review)

```
┌─────────────────────────────────────────────────────┐
│  [Avatar circle]                                    │
│        Italic Cormorant name                        │
│        Short bio paragraph                          │
│        [↗ Visit full profile]   ← link to /profile/ │
├─────────────────────────────────────────────────────┤
│                                                     │
│  THEIR WRITING                                      │
│  ─────────────                                      │
│  • Article 1 (title)                                │
│      Topic chip · Date · Tier badge · Excerpt       │
│  • Article 2 (title)                                │
│  • ... (all articles by this author, newest first)  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  THEIR VOICE IN THE CONVERSATION                    │
│  ─────────────────────────────                      │
│  • "Comment text..." — Forum on Article X · 2d ago  │
│  • "Comment text..." — Forum on Article Y · 5d ago  │
│  • ... (curated; see Key Comments below)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Treatment guidance: paper-bright background card with brass-pale rim (matches the article-bottom author bio block). Cormorant italic for name. Source Serif for bio. DM Mono for section labels.

---

## Key comments — the curation question

What counts as "key"? Recommendations in increasing scope:

1. **v1: Forum-tier comments only.** Cleanest signal, no new infrastructure. Order by recency or by article-author-cross-reference (their comments on other contributors' articles, indicating cross-article presence).
2. **v1.5: Forum + Spark.** Broader; includes underdeveloped-but-interesting contributions.
3. **v2: Nominated comments.** Once Phase 2.5 nomination ships, surface comments other contributors have flagged as worth re-reading.
4. **v3: Scored.** Combining tier rank, recency, and engagement. Algorithmic curation; needs a scoring function and TUNING knobs.

Recommend v1 for first build. Tier filter is `final_tier = 'forum'`. Sort by `created_at DESC`. Limit ~10. Each comment links to its parent article.

---

## API additions needed

A dedicated endpoint for the Author View bundle keeps the page snappy:

```
GET /api/community/author/:member_id
→ {
    profile: { display_name, avatar_url, bio, archetype, ... },
    articles: [
      { ghost_post_id, title, url, slug, primary_tag, published_at,
        declared_tier, ai_suggested_tier, final_tier, excerpt }
    ],
    comments: [
      { id, body, created_at, hardened_at,
        classification: { final_tier, ai_suggested_tier, ... },
        article: { ghost_post_id, title, url } }
    ],
  }
```

Pattern: Promise.all the three fan-outs (profile select, articles select with Ghost-admin join for titles/URLs, comments select with classifications join + article-meta join). The `_feed` branch in `api/profile/[id].js` is the closest analog.

Stay under the Vercel function ceiling by adding this as a branch on `api/profile/[id].js` (e.g., handle when `id === '_author'` and read `member_id` from query) — same pattern as `_list` and `_feed`. Or carve out a sister file at `api/community/author.js` — your call.

---

## Open design questions for the user

1. Routing — (a), (b), or (c) above?
2. Article list pagination cap — show all, or top N with a "more" link?
3. Article list sort — newest, or grouped by tier?
4. "Key comments" v1 scope — Forum only, or Forum + Spark?
5. Empty state — what does the view show for a contributor with no articles yet? (Important for newly invited members.)
6. URL — `/community/?author=<id>` (search-param tab on existing page) or `/community/author/<id>/` (Ghost route, requires page or routes.yaml work)?
7. The contributors directory currently on `/community/` — does it stay (as a tab/mode) when the Author View ships, or move to `/contributors/`? (Decided in feed-architecture handoff: Tabs. Confirm still applies.)

---

## Where to start

1. Read this doc + the feed-architecture handoff
2. Resolve the routing decision with the user
3. Design the API endpoint shape (bundle vs. parallel calls)
4. Build the React component (probably a new file `src/dialecta-community-author.jsx`)
5. Wire it into the Community page mount (extend `index.jsx` or carve out `dialecta-community-mount.jsx`)
6. Test against existing seed contributors (Maya, Wen, Anselm have varying article + comment density)

---

## Files to read

- `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\page-community.hbs` — current stub
- `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\index.jsx` — Community mount + directory render lives here today
- `C:\dialecta-api\api\profile\[id].js` — `_list` and `_feed` branches are the closest API analogs
- `C:\dialecta-api\api\article\[id].js` — article reader + `_authors` batch
- `OneDrive\Websites\Dialecta\Fundamentals\Dialecta_Social_UX_Architecture.md` — Community feed philosophy; the four content types
- `OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-29-feed-architecture.md` — existing Community handoff with infrastructure inventory

---

*2026-04-29 — Author Profile View handoff. Companion to: `dialecta-handoff-2026-04-29-feed-architecture.md`, `dialecta-handoff-2026-04-29-engines-build.md`.*
