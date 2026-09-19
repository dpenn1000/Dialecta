# Community Page + Live Feed — Build Kickoff

*Written 2026-04-28 mid-build. This effort is split off from the Mobile B.3 work so the two streams can move in parallel.*

---

## What this effort delivers

Two related features. Both touch member-discovery and content surfacing. They can ship together (recommended) or independently.

### 1. `/community/` page — contributors directory

Replaces the empty "Community" nav link. A page listing every real Dialecta member with avatar, archetype, Steward Order, bio, location, and an inline Follow button. Client-side search filter (no backend search needed at our scale).

This is the **find-someone surface** that's currently missing. Without it, members have no way to locate each other except via shared profile URLs.

### 2. Real Live Feed in profiles

Replaces the hardcoded `LIVE_FEED_INTERSECTION` and `LIVE_FEED_TERRITORY` arrays in `dialecta-profile.jsx` (lines 304 and 338). These arrays contain ~9 fake items with imaginary contributors ("Aaron Singh", "Tara Nguyen", "Jordan Liu") and fictional articles. They were demo data from the layout phase that never got swapped out.

The `liveFeedPosts` prop is already plumbed in via `useGhostPosts(20)` in `index.jsx` and passed all the way down to the profile component, **but never consumed**. Wiring it up replaces the fake feed with real article data from the Ghost Content API.

The `COMMENTS` array (line 246) is similarly fake. Empty-state the Comments tab until a real comment classification pipeline writes to `comment_classifications` consistently.

---

## Status — work already in flight

About **70% started** but **nothing is built or deployed yet**. The next session can pick up from this state.

### Files modified

**API** — `C:\dialecta-api\api\profile\[id].js`
Added a `_list` branch in the GET handler. When `id === '_list'`, returns:
```json
{
  "contributors": [
    {
      "ghost_member_id": "...",
      "display_name":    "...",
      "bio":             "...",
      "location":        "...",
      "avatar_url":      "...",
      "is_author":       true,
      "archetype":       { "id": "...", "label": "..." },
      "order":           { "id": "...", "label": "...", "family": "..." } | null,
      "color":           "#...",
      "secondaryColor":  "#..."
    }
  ]
}
```
Color and secondaryColor come from the existing `topTwoAxes` helper applied to each member's `axis_scores`. Falls back to `NEUTRAL_COLOR` (#7a7068) when no axes have graduated.

This branch lives inside `[id].js` instead of getting its own file because we're at the **Vercel Hobby 12-function ceiling**. Adding a new endpoint would push us over.

**Theme** — `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\index.jsx`
- Added `useMemo` import from React
- Added `setFollow` import from `dialecta-profile-data.js`
- Added `ContributorCard` component (single member card with avatar gradient, name, archetype, Steward Order, bio, location, follow button)
- Added `ContributorsList` component (fetches `/api/profile/_list`, renders search input + cards, client-side filter via useMemo)

**Theme template** — `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\page-community.hbs` (new)
Mount target: `<div id="dialecta-community-root" data-viewer-uuid="{{@member.uuid}}">`

### What's NOT yet done

1. **Wire the mount** — in `index.jsx` `mountAll()`, after the profile mount block, add:
   ```jsx
   const communityRoot = document.getElementById('dialecta-community-root');
   if (communityRoot) {
     const viewerGhostId = communityRoot.dataset.viewerUuid || '';
     createRoot(communityRoot).render(<ContributorsList viewerGhostId={viewerGhostId} />);
   }
   ```

2. **Build + ZIP + deploy theme** — standard flow:
   ```powershell
   npm run build
   # ZIP per CLAUDE.md exclusion list
   # Upload via Magic Pages dashboard
   ```

3. **Deploy API** — `cd C:\dialecta-api && vercel --prod --yes` to ship the `_list` branch.

4. **Ghost admin** — two manual steps:
   - **Create a Ghost page** with slug `community` (any title; body empty) so Ghost serves `/community/`.
   - **Update navigation**: change the "Community" link from `/` to `/community/`.

5. **Verify** — visit `/community/`, confirm contributors load, try search, click a card to land on a profile, click Follow.

---

## Then: replace the hardcoded Live Feed

After Community ships, swap the fake feed:

### Steps

1. In `dialecta-profile.jsx`, add `liveFeedPosts = []` to the `DialectaProfile` props (it's already passed through from `index.jsx` via `useGhostPosts(20)`).

2. Delete the hardcoded constants:
   - `LIVE_FEED_INTERSECTION` (line 304-336)
   - `LIVE_FEED_TERRITORY` (line 338-394)

3. In the live feed section (~line 1795), replace the two hardcoded sections with a single section rendering `liveFeedPosts.map(p => <LiveFeedItem item={p} />)`.

4. Drop the "Where you and X meet" / "X's territory" headings — they imply personalization that doesn't exist yet. Use a single header: **"Recent on Dialecta"**.

5. Empty-state the Comments tab. Replace the `COMMENTS` map (line 1841) with:
   ```jsx
   <p style={emptyStateStyle}>
     No classified comments yet. The comment classification pipeline will populate this tab as discussions emerge on articles.
   </p>
   ```

6. Add author name to article cards. The `shapePostsToFeed` function in `index.jsx` (line 34) currently doesn't include author. Extend it:
   ```js
   author:        post.primary_author?.name ?? '',
   authorMemberUuid: post.primary_author?.id ?? null,  // NOTE: this is Ghost user ID, not member UUID
   ```
   For author-link clickability to a Dialecta profile, you need to map Ghost author back to `articles.author_member_id`. Two paths:
   - **A. Snapshot-on-publish**: when `submit.js` creates the row, also write `author_profile_url` so the public Ghost API doesn't need it. Add a column to `articles`.
   - **B. Live join**: new (or extended) `/api/articles/recent` endpoint that joins articles.ghost_post_id with the Ghost-fetched posts list.

   A is simpler. B is fresher. For launch, A.

### Future: real personalization

Once real follow data exists, evolve toward a personalized feed:

- **Filter to follow graph** — show articles + activity from people the viewer follows. The follow data is already in the `follows` table; the API just needs to read it.
- **Activity events** — comment replies, archetype changes, follow events. Likely backed by a new `feed_events` denormalized table populated by triggers or service-role writes.
- **Sort modes** — Recent / Top (by Forum-rate) / Following only.
- **Notifications** — in-app red dot + opt-in email digest.

These are days of work, not hours. Defer until the platform has real follow-graph data to feed.

---

## Conventions to honor

- **Vercel Hobby cap**: 12 functions max. Use the `_list` / `_action` discriminator pattern in existing endpoints rather than adding new files.
- **Design tokens**: From `style.css :root` — `--paper` (#fbf6ea), `--cream` (#f7f2e8), `--bg-white` (#fffdf8), `--amber` (#b8862e), `--gold` (#d4a84a). Card surfaces use `--paper` with brass accents.
- **Avatar gradient**: Top-2 pillar colors from `axis_scores`. Helper: `topTwoAxes(scores)` in `[id].js` line 64. Pillar colors are in `AXIS_COLORS` in the same file.
- **Follow button style**: outlined brass for "Follow", filled brass for "Following ✓". Pattern at `dialecta-profile.jsx` line ~1410.
- **No em dashes** anywhere in user-facing copy. Per project preference, use commas, periods, parens. (Code comments are fine.)
- **Profile URL pattern**: `/profile/?id=<ghost_member_id>`. URL-encode the ID.
- **Path C-lite auth**: API endpoints take `member_uuid` from the request body or URL, look up the corresponding profile, gate on whatever flag matters (`is_author`, presence of profile, etc.). No JWT.

---

## Open product questions

1. **`/fingerprint/` page** — currently shows three hardcoded seed personas. Should it be repurposed (e.g., become an explainer about the fingerprint engine itself) or retired in favor of `/community/`?

2. **Personalized feed backing store** — `feed_events` denormalized table populated by triggers, or live-computed each visit? Trade-off: write-amplification vs read-cost.

3. **Comment surfacing** — needs the comment classifier to write tier classifications consistently. Is the pipeline currently writing to `comment_classifications`? Verify before assuming.

4. **Author display name on Ghost vs Supabase** — Ghost stores author display name on the user; Dialecta stores `display_name` on `profiles`. They can diverge. Is the canonical author name on article cards from Ghost or Dialecta?

---

## Hand-off summary

Pick up from `C:\dialecta-api\api\profile\[id].js` (search for `_list`) and `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\index.jsx` (search for `ContributorsList`). The mount wire-up in `mountAll()` is the immediate next step. After that: build, ZIP, deploy theme + API, do the Ghost admin steps, verify, then move on to swapping the hardcoded feed.

Total estimated remaining work: **~1 hour for Community v1**, **~1 hour for the Live Feed swap**.
