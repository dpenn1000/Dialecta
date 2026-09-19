# Dialecta — End-of-Day Handoff (2026-04-29)

A massive day across onboarding, social graph, visual refresh, and mobile fixes. This doc summarizes what landed, what's open, and what files the next person should read.

---

## Buttoned up

### Onboarding (full self-serve flow)

- **Avatar upload from device** — file picker in `EditProfilePanel`. `/api/article/upload-image` generalized with a `purpose` discriminator (`avatar` bypasses `is_author`; `article` preserves it). JPEG/PNG/WebP up to 3 MB, hosted on Ghost CDN.
- **Welcome card** at top of profile until `display_name` + `bio` saved. Soft nudge, auto-hides on completion. "Take the Pact to write" CTA.
- **Pact → Author** — `/pact/`'s commit button now actually commits via API. New POST branch in `/api/profile/[id]` (`_action: 'become_author'`) flips `is_author=true`, records `pact_agreed_at`, `pact_version`, `pact_path`, `pact_signed_name`.
- **Signature line on the Pact** — Mrs Saint Delafield + Allura cursive, fountain-pen handwritten feel. Real ceremony. Gates the commit button until the signature has 2+ characters.
- **Sign Out fixed** — was pointing at `/ghost/#/signout` (Admin) instead of `/members/api/session DELETE` (Member). Now works. Visible in desktop nav, mobile drawer, and Settings drawer.

### Social graph primitive

- **Follow / Unfollow API** — POST branches on `/api/profile/[id]` for follow + unfollow, idempotent, with self-follow guard at API + DB level.
- **Follow button** in the profile hero (own profile hides it, viewer signed in required). Optimistic toggle + refetch on success.

### Discovery / community

- **`/community/` page** — full contributors directory with search, brass hero, paper-grain cards with wood-spine accents, follow buttons inline. Backed by `/api/profile/_list` (consolidated into `[id].js` to stay under Vercel's 12-fn cap).

### Editor (Stage B.3)

- **Full responsive pass** — `useIsDesktop` hook, fluid `clamp()` padding/typography on all 10+ stages, ProgressRail collapses to dots-only on mobile (active stage label still shown), declaration form de-grids on phones, hero titles fluid.
- **Paper grain on every editor card** — visual cohesion with the rest of the site (`bgCard` aligned to `--paper`, fractalNoise SVG layered behind 20 card surfaces).
- **Scroll-to-top on stage transitions** — Reflection screen no longer opens at the bottom of the viewport.
- **AI hint buttons** on Strongest Objection ("Suggest a sharper opposing argument") and Opinion Mapping ("Suggest a missing axis"). Backed by `/api/article/aesthetic-suggest` with a `kind` discriminator. Sparing, prompts crafted to "make the author think, not paste."

### Visual refresh — brass + walnut + paper-grain

Applied to:

- `/about/` — full rebuild
- `/guidebook/` — section-card treatment
- `/stewards/` — masthead brass, family names brass, paper on inner cards (trust-loop, cadence-card, order-card)
- `/community/` — same family
- `/pact/` — surgical brass nods (tier kickers, path icons, committed title), asterism marks between sections, signature line, padding cuts. The parchment aesthetic was preserved.
- `/profile/` — paper-grain on hero card + all 14 internal card surfaces, container widened (1060→1240) with tighter side padding, fingerprint caption brass shimmer, Order Pattern Card paper alignment, Live Feed cards paper.
- Article cards on `/` and `/articles/` — light-cream paper + grain
- Article post body — same paper material

New design tokens shipped: `--paper` (#fbf6ea) and `--card-brass` for cream-paper text, plus `--hero-brass` for dark-stone-backdrop contexts.

### Mobile fixes

- Editor responsive pass (Stage B.3)
- Fingerprint page (Stage B.3.5) — HeroCarousel `column-reverse` on mobile, fingerprint shrunk
- Profile mobile fingerprint size 240→200 + right-column gutter
- `/articles/` edge-to-edge bug fixed (padded wrapper)
- Defensive layer: `html, body { max-width: 100vw; overflow-x: hidden }` at <1100px + `min-width: 0` on grid items

### Articles backfill

`scripts/backfill-orphan-articles.mjs` written + run. Two seed-era articles ("Solar..." and Maya's "Doubt and Devotion") backfilled with full AI tier metadata via Claude inference of the 5-question declaration. Both visible to classifier now.

### Database

- Migration **010** — Pact agreement (`pact_agreed_at`, `pact_version`, `pact_path`)
- Migration **014** — `pact_signed_name` (renumbered after triple-011 collision; user flagged this; committing to `ls migrations/` before writing new SQL)

### Bug fixes worth naming

- **Profile A vs Profile B duplicate** — Ghost ObjectID vs UUID. Root cause traced to `post.hbs` using `@member.id` instead of `@member.uuid`. Fixed.
- **Welcome Card "Set up profile" button** — was calling local dead-state `setEditing`; rewired to `onEdit` prop.
- **Steward Order classifier 405** — was missing migration 009; user ran it.
- **Live Feed showing fake hardcoded data** — moved to handoff doc (split off effort, see `COMMUNITY-FEED-HANDOFF.md`).

---

## Unresolved

1. **Article reading page on mobile — STILL snapping to desktop.** Multi-layer defensive shipped (overflow clip + max-width: 100vw + min-width: 0). My current best hypothesis: the **DialectaPrivateDraft compose** at the bottom of every article has buttons with `minWidth: 180` (lines 305, 386, 641, 847 in `src/dialecta-private-draft.jsx`). Two of them in a flex row = 360+px minimum, exceeds phone viewport, forces wide layout. **Test:** does signed-out article view work fine, signed-in snap wide? If yes, fix `minWidth: 180` → smaller value or `flex-wrap: wrap` on the parent.

2. **Pact prose proofread** — audit-only pass for em-dashes, comma splices, typos. Never run. Page is 1418 lines of copy.

3. **Mobile snap-to-desktop on "a few pages"** — user reported it broader than just the article-read view. The defensive html/body `max-width: 100vw` should catch most cases; if anything still snaps post-final-upload, source is page-specific.

4. **Stage B.5: Quotes page responsive** — deferred per roadmap.

5. **Welcome card "from time to time" reminder** — current implementation hides as soon as bio + display_name set. User said "if they don't set it up, they get a friendly reminder from time to time." If display_name is set but bio still empty, current behavior shows the card. Could be tuned (cooldown, dismiss button, etc.) — not built.

6. **Live Feed personalization + comment surfacing** — see `COMMUNITY-FEED-HANDOFF.md`. The `LIVE_FEED_INTERSECTION` + `LIVE_FEED_TERRITORY` hardcoded fake arrays were untouched (per user-modified profile.jsx, those may have been swapped out in a different session — worth verifying).

7. **`is_author` indicator visible on profile** — Steward Order appears post-publish, but no explicit "author" badge. Implicit only.

---

## Files that need future attention

### Likely needs editing soon

- **`src/dialecta-private-draft.jsx`** — `minWidth: 180` on buttons (lines 305, 386, 641, 847). Likely cause of remaining article-mobile wide-mode. Prime suspect.
- **`page-pact.hbs`** — prose proofread (em-dashes, awkward commas). Lines ~1230-1280 (the "I am here to engage with ideas..." block) and tier descriptions ~1031-1096 most likely candidates.
- **`src/dialecta-profile.jsx`** — verify the user-modified live-feed integration. The `useProfileFeed` hook + new `LiveFeedItem` shapes the user added need to match the API output. Confirm articles render with author bylines.

### Stable, no work needed unless feedback comes in

Theme (`C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`):

- `src/index.jsx` (heavily refactored, includes ContributorsList, HeroCarousel responsive, useIsDesktop, post-feed wrapping)
- `src/dialecta-editor.jsx` (full responsive + AI hints + paper grain + scroll-to-top)
- `src/dialecta-profile-data.js` (welcomeNeeded, isAuthorAccount, setFollow)
- `src/dialecta-profile-edit.jsx` (file upload)
- `src/dialecta-profile-settings.jsx` (sign out)
- `src/dialecta-profile-order.jsx` (paper grain on CardShell, commit URL)
- `assets/css/style.css` (post-card, post-article, post-layout, mobile defensive)
- `page-about.hbs`, `page-guidebook.hbs`, `page-stewards.hbs`, `page-community.hbs` (full visual refresh)
- `default.hbs` (logo, sign out paths, drawer)
- `index.hbs` (members→profile routing)
- `page-articles.hbs` (with wrapper)

API (`C:\dialecta-api\`):

- `api/profile/[id].js` — substantial. Multiple POST branches (`become_author`, `follow`/`unfollow`, order commit), GET `_list` branch, GET `_feed` branch (user added). Stable but worth a re-read for the next person.
- `api/article/upload-image.js` — purpose-discriminated.
- `api/article/aesthetic-suggest.js` — hint mode added.
- `api/article/classify-order.js` — entire endpoint built fresh.
- `api/_stewards-skill.js` — full canonical taxonomy.
- `supabase/migrations/010_pact_agreement.sql` — applied.
- `supabase/migrations/014_pact_signed_name.sql` — applied.
- `scripts/backfill-orphan-articles.mjs` — one-shot, run, can be re-run idempotently.

### Companion docs

- `C:\dialecta-local\COMMUNITY-FEED-HANDOFF.md` — kickoff doc for the Community + Feed effort that was split off mid-session.

---

## Conventions established this session

- **Always `ls supabase/migrations/` before writing new SQL.** Triple-011 collision happened today; this is the habit-fix.
- **Vercel Hobby 12-fn cap** — new endpoints consolidate via `_action` discriminators in existing files (`/api/profile/[id]` POST, `/api/article/aesthetic-suggest` POST) rather than adding new files.
- **`--paper` (#fbf6ea) + paper-grain SVG** is the canonical card surface across the site. Use `backgroundColor` + `backgroundImage` (not the `background` shorthand) so both layer.
- **`--card-brass`** (with `--brass-bright` peak) for cream-bg text shimmer; **`--hero-brass`** (high-key, all readable on dark stone) for dark-stone-backdrop hero zones.
- **No em dashes** in any user-facing copy. Site-wide preference.
- **Mobile defensive base layer** (added 2026-04-29):
  ```css
  @media (max-width: 1099px) {
    html, body { max-width: 100vw; overflow-x: hidden; }
    .post-article, .post-content, .post-layout { max-width: 100%; }
  }
  ```
  Catches inner widgets that would otherwise force the document wider than viewport on mobile.

---

End of session. Onboarding from sign-up to first published article works end-to-end. Visual language unified across six surfaces. Mobile pass on high-traffic surfaces. Real Substack-class polish on the Pact ceremony.

Open items are tracked above. The article-mobile wide-mode is the most pressing functional issue and almost certainly the private-draft button minWidth.
