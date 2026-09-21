# apps/web, working context for Claude Code

The Next.js 15 (App Router, TypeScript) front end. Root `CLAUDE.md` holds the locked decisions; this file is the conventions for this app only.

## Conventions

- **Server components by default.** A file is a client component only when it needs state, effects or browser APIs. Client islands, and only these until a spec says otherwise: the comment composer, the classification card, votes, the Thinking Fingerprint, the opinion maps, the article editor (TipTap, `src/components/editor/`, backlog A-10). Keep each island small and pass it data from a server component.
  The fingerprint is an island only where its data changes after load (`components/fingerprint/FingerprintClient.tsx`, today only the `/fingerprint` carousel). Every other figure is the server component `Fingerprint`, which is `server-only` and hydrates nothing; both draw through `renderFingerprintSvg` in core.
  The opinion maps island is `src/components/opinion-map/placement-client.tsx`, `PlacementClient`: tap to stage a position, tap again to move it, Commit to persist it, for Reflect (map 0 only, author position hidden, member-gated) and Declare (every map, author position shown). It owns no data itself; each caller (`article-declaration/declaration.tsx`, both `ArticleDeclaration` and `ArticleReflectPlacement`) passes it one already-loaded map. Its write path is a Server Action beside it, `opinion-map/actions.ts`, calling `place_opinion_map_position()` on the session client (never the service key); the function resolves the caller itself from `current_profile_id()`, so no reader id crosses the wire in either direction, and an empty result (signed out, or signed in with no claimed profile) reads as one plain "sign in" message, the same single case live's own placement hook collapses both into. `engine.tsx` stays the read-only figure every reader sees, unchanged by this; the island draws a separate, parallel figure for the tap surface, reusing `engine.tsx`'s exported pure math (`axisColor`, `ternaryColor`, `binaryBlend`, the barycentric helpers) and its four landscape-palette constants rather than the JSX or a second copy of the colors. Landed 2026-09-21: step 6 of the architect's 2026-09-21 delta-mechanic port plan (`team/architect/architecture/2026-09-21-delta-mechanic-port.md`). Step 5, the `opinion_map_positions` uuid re-key and `place_opinion_map_position()` itself, shipped the same day on its own migration, `supabase/migrations/20260921152637_opinion_map_positions_identity_expand.sql`. Step 7 (reading a committed placement back after a reload, so it survives a refresh) is deferred, per the plan's own Decision 5; this island's state resets on remount, same as live's does today.
  Two more exist as of 2026-09-21, each a recorded exception rather than a precedent: the shell's nav and drawer (`src/components/shell/nav-client.tsx`, for the drawer's focus trap), and the comment feed (`src/components/discourse/feed.tsx`, so filter and sort stay instant as in the original). The feed's place on this list is the architect's to rule on; filter and sort can become plain links if it is refused. A third landed the same day: the article reading spine and its Reflect/Declare overlay shells (`src/components/article-spine/spine-client.tsx`). It owns no data and no Supabase import, same as the other two; it toggles which overlay is open, the two auto-opens, and a localStorage seen-flag per overlay, wrapping server-rendered markup (`spine.tsx`) the way NavDrawer wraps the shell's, and its focus trap and inert-while-closed treatment are copied from NavDrawer rather than reinvented. This is steps 1 to 4 of the architect's 2026-09-21 delta-mechanic port plan (`team/architect/architecture/2026-09-21-delta-mechanic-port.md`), read and render only; reflectOverlay is null for a reader spine.tsx resolves as not canPlace, the same "nothing to open" shape it always had, and populated otherwise, since step 6 gave it real content (see the opinion maps island entry above). A fourth landed the same day: `src/components/article-share/share-actions.tsx`, the two `#post-share` buttons that need the browser, Copy link (`navigator.clipboard`) and the native share sheet (`navigator.share`). It owns no data and no Supabase import, same as the other three; the five platform links (X, Facebook, LinkedIn, Reddit, email) stay server-rendered `<a>` tags in `share-row.tsx`, since their hrefs are computable from the article's own title and canonical URL with no browser API at all. `navigator.share`'s availability can only be read in the browser, so the native-share button starts unrendered and appears after mount, the same condition live hides it on from an inline script.
- **Tokens come from `src/styles/tokens.css`.** That file is generated from `design/dialecta-design-spec.html` by `npm run tokens` (repo root). Never edit it by hand and never hard-code a color, font, radius or shadow that a token provides. `globals.css` sets the canonical page background and font stack from the tokens.
- **Strings a person reads live in `src/strings.ts`.** Page copy, notices, commenter messages, button labels. The voice hook (`scripts/voice_check.py --strict`) runs over that file in CI, so it must contain no em dashes, en dashes, `--` pauses or stacked exclamation points. Placeholder pages may keep their one-line description inline until they are built.
- **Shared logic lives in `@dialecta/core`** (`packages/core`): tiers, pillars, archetypes, classification parsing, tier resolution, axis mapping. Do not duplicate it here. Import from `@dialecta/core`; Next transpiles the package source (`transpilePackages` in `next.config.ts`).
- **Articles come from Supabase, never Ghost.** ADR-001/003 in `docs/decisions/`. `src/lib/articles.ts` reads the `articles` table (`status = 'published'`); the editor writes `body_json` and `body_html` together. Ghost appears only in `scripts/import-ghost.mjs`, a one-time import. No Ghost imports or env in this app.
- **Data access:** `src/lib/supabase/server.ts` in server code, `src/lib/supabase/client.ts` in islands. Any page that needs env is guarded and renders a notice from `strings.notices` when it is missing.
- **Each surface's queries live in one `server-only` module** that names every column it reads: `src/components/discourse/data.ts`, `src/app/profile/_lib/data.ts`. This is the architect's `lib/data` rule arriving one surface at a time (`team/architect/architecture/2026-09-21-rebuild-map.md`, rule 1). What leaves those modules for the browser carries no member id and no email.
- **A classification is read through `comment_tiers` and `own_comment_readings`** (migration `20260921063139`), never from `classifications` directly, which stays closed to both client roles. Whether a comment's words may show anywhere is one function, `commentIdsWithShowableBodies()` in `src/components/discourse/data.ts`: classified, and not Breach. Every surface that shows a comment's body applies it.
- **One page path still reads on the service role, a stopgap with a named exit.** The profile reads one column, the Ghost member id, to join a profile to its six Ghost-keyed tables; it retires when identity is keyed on `profiles.id` (the architect's build order, step 2). Add no other: the rebuild map's rule 2 keeps the service key in pipeline code only.
- **The shell wraps every page** (`src/app/layout.tsx`, `src/components/shell/`). Do not draw a page-level nav or site footer. A `<main>` with no class gets the paper sheet at 820px; a `<main>` with any class styles itself. The header scrolls with the page, so `--nav-height` is 0 and anything sticky uses `top: 0`.
- **Brass never letters on a light surface** (designer D-27). On paper, brass is a line, a ring, a dot or a fill under ink; text takes ink with a brass underline, or `--brass-deep` (6.69:1 on cream).
- **Ids are `uuid`.** `articles.ghost_post_id` (`text`) is legacy, only the import script touches it. See `supabase/CLAUDE.md`.
- **Route params are promises** in Next 15: `const { slug } = await params;`.
- Voice rules apply to anything a contributor sees. Observational, never evaluative. "This reads as Heat", never "classified as".
- **The site origin lives in `src/lib/site.ts`** (`SITE_URL`, from `NEXT_PUBLIC_SITE_URL`, falling back to `https://dialecta.org`). `sitemap.ts`, `robots.ts` and the article route's `generateMetadata` all need an absolute URL and none of them run with a request to read one from; do not hardcode the domain a second time anywhere else.
- **A share card carries the article, never a judgement about the person who wrote it.** No tier badge and no fingerprint-derived descriptor on any `opengraph-image`, ever. Legal and philosopher ruled on this independently and agreed: `exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md`, `council/philosopher/positions/2026-09-20-path-to-launch.md`. A card's basis cannot travel off-platform with it, so nothing that needs a basis belongs on one.
- **`twitter:card` is set explicitly to `summary` wherever `openGraph` is set**, in `layout.tsx` and in the article route's `generateMetadata`. Next infers `summary_large_image` on its own the moment any image is present (`node_modules/next/dist/lib/metadata/resolvers/resolve-opengraph.js`), which is the format X has repeatedly stopped rendering a headline on (`council/circulation/research/2026-opengraph-and-x-card-share-surface.md`). Leaving `card` unset silently reverts to the format the research argued against.

## Analytics

Plausible (self-hostable, cookie-free, captures arrivals by source out of the box) is wired as an
integration point in `src/lib/analytics.ts`, loaded from `layout.tsx` via `next/script`. It ships
inert: no script tag renders until `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set. This exists because
Ghost's own analytics disappear at the Ghost cutover with nothing named to replace them
(`council/circulation/research/2026-plausible-analytics-tool.md`), and the first strangers a
shared article reaches are the one cohort that cannot be measured retroactively.

Two ways to give it a real value, and the choice between them is treasurer's, not decided here
(priced against Plausible Cloud's tiers, which this repo does not carry):

1. **Plausible Cloud.** Dan creates an account at plausible.io, adds `dialecta.org` as a site, and
   sets `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=dialecta.org` in the deploy environment. No code change; the
   default `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` already points at Plausible Cloud's script.
2. **Self-hosted.** Someone stands up the Plausible stack (its own Postgres and ClickHouse, per
   its self-hosting docs) somewhere reachable from the browser, then `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
   is still the site's registered name and `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` points at that
   instance's own `/js/script.js`. That deployment is infrastructure outside this app and outside
   what a Claude Code session in `apps/web` can stand up.

Neither step above happens on its own; both need a person, an account, or a server this repo does
not contain. Until one of them happens, the integration point sits ready and silent.

## Pages and the spec each implements

| Route | Spec |
|---|---|
| `/` | Dialecta_Social_UX_Architecture.md, Dialecta_Project_Index.md; lists published articles |
| `/articles/[slug]` | Dialecta_Article_Editorial_Template.md, Dialecta_Discourse_Layer_UX.md |
| `/pact` | Dialecta_Project_Brief.md (Pact page), components/dialecta-pact.html |
| `/guidebook` | Dialecta_Project_Brief.md (Living Guidebook), Dialecta_Tier_Psychology.md |
| `/community` | Dialecta_Social_UX_Architecture.md |
| `/profile/[id]` | Dialecta_Contributor_Identity.md, Dialecta_Growth_Scroll.md. `[id]` is a `profiles.id` or a handle |
| `/profile/fingerprint-lab` | Development only, 404 in production: the renderer on fixture copies of real `axis_scores` rows |
| `/api/health` | Proves the `@dialecta/core` workspace link |
| `/sitemap.xml` | `sitemap.ts`; static pages plus every published article, from Supabase |
| `/robots.txt` | `robots.ts`; allows everything but `/api/` and `/auth/`, points at the sitemap |
| `/opengraph-image` | Site-wide default share card, `next/og` |
| `/articles/[slug]/opengraph-image` | Per-article share card: title and byline only, see "Conventions" above on what a card may carry |

## Run

From the repo root:

```
npm install            # once
npm run dev            # apps/web on http://localhost:3000
npm run typecheck      # all workspaces
npm test               # all workspaces (vitest in packages/core)
npm run lint
npm -w apps/web run build
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill it in. Never commit real values.
