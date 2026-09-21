# Builder position: port or rewrite, file by file

## Brief

Claim: of the 75 files, a clear majority (46, 61%) port adapted, not rewritten; only 16 are
dropped and 10 rewritten, and every drop is forced by an already-decided rule (ADR-001's no-Ghost
mandate, or the binding no-tier-badge rule), not a fresh judgment call against Dan's port-most
instruction. Strongest evidence: `apps/web/src/app/articles/[slug]/opengraph-image.tsx` already
ships a working, rule-compliant replacement for the single largest drop candidate,
`_recovered-next/app/article/[slug]/opengraph-image.js` (195 lines, Ghost-feature-image-primary).
The drop costs nothing: the destination already has it, built better.

## What the four verdicts cost, stated once

**As-is**: moves and compiles with import and token fixes only. **Adapted**: the logic survives,
something specific changes (usually: an identity source, an env var name, a URL, a status
literal). **Rewritten**: the surface is kept, the code under it is not. **Dropped**: the surface
does not come back in this port; I owe the argument.

Where I have read a file only for its identity coupling (my two Phase 1 positions, or security's),
not for its full content, I mark the verdict **provisional** and say so in the reason.

## Question One: `_recovered-next/lib/theme/`, all 51 files

### Dropped (6)

| File | Lines | Reason |
| --- | ---: | --- |
| `dialecta-dev-admin.jsx` | 2,367 | Every mutation carries a client-supplied `member_uuid` with no session proof (security: 11 of 12 `fetch()` calls, `dev-admin-mount.jsx:17-33` hard-gates the whole file on a DOM attribute). Dan's own scoping rule forecloses porting an interim admin trust model built for a database that is retired. Supabase Studio covers this until a real admin surface is designed against RLS. My own Phase 1 position already carved this file out; nothing in this pass moves it back. |
| `dialecta-admin-resetup-maps.jsx` | 656 | Same shape as dev-admin: `if (!isAdmin) return null` where `isAdmin` comes from an unauthenticated `GET /api/profile/${memberId}` read (security). Admin surface, same rule. |
| `dialecta-admin-repolish.jsx` | 485 | Identical shape to the two above (security: `dialecta-admin-repolish.jsx:87-99`). Admin surface, same rule. |
| `dialecta-tier-capabilities.js` | 62 | Client-only cap on a paid tier with no confirmed server mirror; the file's own docblock says the enforcement copy "likely" lives at `api/_subscription-tier.js` (security). The Underwriter has no price yet (ROADMAP, Phase 6), so porting a gate for an unpriced tier is scaffolding for a decision that has not been made. Revisit when Phase 6 prices it and a real server-side cap is designed alongside it. |
| `__DO_NOT_EDIT.md` | 16 | Not code. A sync marker for a theme-build pipeline (`scripts/sync-theme.js` against `C:/dialecta-local/...`) that apps/web does not have and will not have. Read in full; nothing in it is a decision, only a process note about a process that ends. |
| `dialecta-archetype-grid.jsx` | 176 | **Provisional.** Designer's read: "NOT imported by the runtime bundle... Reserved for the build-time SVG generator," a data table feeding a Node script, not live code. `packages/core/src/archetypes.ts` already exists. I have not diffed the two; flagging likely redundancy rather than asserting it. Whoever ports the fingerprint work should check this against `archetypes.ts` before reviving it. |

### Rewritten (9)

| File | Lines | Reason |
| --- | ---: | --- |
| `dialecta-fingerprint-engine.jsx` | 910 | `packages/core/src/fingerprint-geometry.ts` (239 lines) says it outright in its own header: "Ported and amended from `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx`... one deliberate change... the hard clamp is gone." `fingerprint-texture.ts` (259 lines) is the same move for turbulence. The compute half of this file is already superseded, today, by code that carries a considered amendment this file does not have. Porting the 910 lines wholesale would reintroduce math the platform has already decided to replace. The render half still needs building against the new functions' output shape, which is new code, not this file's SVG-painting logic carried over. |
| `shell.jsx` | 226 | The mount-point architecture itself, read the Ghost injection off `window`/`dataset`, mount children, has no Next.js App Router equivalent. My Phase 2 position already named this: "port is the wrong word" for the nine DOM-read files. `shell.jsx`'s job (gate `HandleSetupGate`, mount `DialectaSidebar`, wrap children) gets redistributed into `layout.tsx`/`page.tsx` server components and a real session read; no single file survives it. |
| `home-page-mount.jsx` | 242 | Same DOM-read mount architecture (security: total-breakage tier, degrades to visitor mode). apps/web's `page.tsx` already exists as a real server component reading Supabase directly. The live-feed content this file gates is real and wanted; the mount-point shape it is built in is not portable. |
| `post-page-mount.jsx` | 239 | Same reasoning as `home-page-mount.jsx`. apps/web's `articles/[slug]/page.tsx` already exists, already fetches, sanitizes, and renders. This file's actual job, mounting the sidebar and discourse layer onto that page, becomes new wiring inside/around the existing page, not a port of this file's structure. |
| `editor-page-mount.jsx` | 41 | Total-breakage mount (security: `editor-page-mount.jsx:17-34`, empty `memberUuid` means `DialectaEditor` never renders). apps/web/CLAUDE.md already places the editor as a proper client island under backlog A-10, not a DOM-injection mount. |
| `dev-admin-mount.jsx` | 33 | Mount for a dropped surface (`dialecta-dev-admin.jsx`, above). Nothing to mount. |
| `dialecta-quotes-mount.jsx` | 32 | Same DOM-read mount shape; its own docblock quotes `page-quotes.hbs`'s `{{@member.uuid}}` verbatim (security), confirming the pattern rather than being an exception to it. |
| `notifications-page-mount.jsx` | 28 | Same DOM-read mount shape (security, Category 1). |
| `community-page-mount.jsx` | 28 | Same DOM-read mount shape (security, Category 1). |

### As-is (1, provisional)

| File | Lines | Reason |
| --- | ---: | --- |
| `topics.js` | 44 | On the identity-agnostic list (security, my Phase 2), confirmed clean of any Ghost/member reference. I have not read its full content beyond that sweep; marking as-is provisionally rather than confidently. |

### Adapted (35)

| File | Lines | Reason |
| --- | ---: | --- |
| `dialecta-editor.jsx` | 4,727 | The ~250-line `ProseEditor` piece (contenteditable, `execCommand`) is rewritten for TipTap per ADR-003, already agreed in my Phase 1 position. The other ~4,400 lines (stage flow, tag picker, opinion-map inputs, polish panel, publish flow) adapt: 3 of 8 `fetch()` calls (upload-image, `article/submit`, own-profile fetch) carry `member_uuid` and need session re-sourcing (security: gates at lines 863, 2472, 4450), and it imports the dropped `dialecta-tier-capabilities.js`, which needs removing or replacing with a real server-enforced cap. `@tiptap/react` and `@tiptap/starter-kit` are already installed (`apps/web/package.json`), so the rewritten piece has its tooling ready. |
| `style.css` | 3,286 | Designer's finding: authoritative over the design spec, 48 of 49 referenced tokens resolve here against 10 in the spec. Not as-is: `amber` and `border-light` fork between this file and the spec with no recorded decision, it defines zero `--tier-*` tokens (the 28 tier values live as copy-pasted literals in five files instead), and `apps/web`'s token pipeline (`npm run tokens`, `scripts/extract-tokens.mjs`) currently generates FROM the spec, not this file. Adapting it means becoming the new generator source, per designer's recommendation, which I am not re-deriving, only depending on. |
| `dialecta-profile.jsx` | 2,865 | Zero own `fetch()` calls (confirmed both passes). Takes `viewerGhostId` as a prop and gates the Follow mutation on it with no other proof (security: lines 1445-1453); that gate needs a session-verified id. Already consumed by the adapted `contributor/[handle]/page.js`, below. |
| `dialecta-private-draft.jsx` | 1,796 | The compose ritual for a new comment. Its own docblock (line 29) names the flow: `POST /api/comment` with `member_uuid + body + self_declared`. `apps/web/src/app/api/comment/route.ts` already exists and reads identity from a verified session, never the body (`article_id, article_slug, article_title, article_claims, body, parent_id, self_declared_tier` is its actual contract). Adaptation: drop `member_uuid` from both call sites (own-profile GET at line 1361, comment POST at line 1440), rename POST fields to the live contract, replace the `if (!member.uuid)` gate with a real signed-in check. |
| `dialecta-sidebar.jsx` | 1,595 | Confirmed identity-agnostic on a full read, twice, independently (my correction, security's independent confirmation): `authorMemberId` is the article's author, content, not the viewer; `usePulse`'s real fetch is commented out in favor of mocked data. Nine cards on one sticky rail. Adapts because `authorMemberId`'s source (currently `shell.jsx`'s DOM read) becomes a real server-component prop, and the mocked `usePulse` needs either a real endpoint or an explicit "not built" state rather than fake data shipping quietly. |
| `dialecta-discourse-layer.jsx` | 1,251 | The read, list, edit, and delete surface (compose lives in `dialecta-private-draft.jsx`, not here). Takes `viewerMember` as a prop. 3 call sites (my Phase 2 count): `viewer` query param on the comment-list GET, `member_uuid` on edit PATCH and delete (security: lines 1018, 1054). No GET route for a comment list exists yet in apps/web; see "The first increment" for the read-path recommendation. Designer's finding also applies here: 59 inline `style={{}}` blocks against 2 `className`s, no `.comment-card` class in style.css, so the token pass on this file is "resolve inline `var()` references," not "wire a stylesheet class." |
| `dialecta-profile-identity-edit.jsx` | 1,075 | Passthrough only (`ghostMemberId` addresses three editors' PATCH calls, no local branch, security), but each PATCH needs a session-sourced id, not a threaded prop. |
| `dialecta-opinion-map.jsx` | 958 | Zero `memberUuid` references, confirmed directly (my Phase 2 read). Its own docstring: "Lifted from the OneDrive prototype... pared down to canonical, read-only-capable components," already a rebuild once. Designer flagged it as read but not fully audited against style.css's token list; I have not independently confirmed that either, so the token pass here is unverified by any seat, on top of the standard identity wiring. |
| `dialecta-quotes-app.jsx` | 932 | Zero own `fetch()` calls (my Phase 2 count), but `isAdmin`/`canSeeNonLive` (sourced from `useAdminStatus` in `dialecta-quotes-data.js`) gate which submit modal opens and which write controls render (security). The public browse and suggest path is clean; the admin gate adapts alongside `dialecta-quotes-data.js`, below. |
| `dialecta-community-feed.jsx` | 759 | Presentation gate only (network badge visibility, security), 1 call site (`viewer` query param, cosmetic). apps/web's `/community` route is currently a bare placeholder, confirmed by direct read, so this is real net-new surface for apps/web once adapted. |
| `dialecta-community-author.jsx` | 713 | Presentation gate (hides a Follow-yourself affordance, security), 1 call site (`viewer_member_id` on follow toggle) needs session re-sourcing. |
| `dialecta-profile-order.jsx` | 698 | Trust decision: `classifyOrder` and `commitOrder` are themselves the mutation, `memberUuid` the only credential (security, lines 127-148). 2 call sites, both need session-sourced identity. |
| `dialecta-community-contributors.jsx` | 687 | 2 call sites: one content-only (`/api/profile/_list`, the public directory), one viewer-identity (`/api/profile/${viewerGhostId}`, the follow graph, needs re-sourcing). Worth flagging: `/api/profile/_list` is the same unauthenticated endpoint security named as the PII source for dev-admin's role-grant picker. A legitimate public directory browse still needs this endpoint to exist in apps/web, scoped to non-sensitive fields only, a fresh build of the route, not a port of `_recovered/api/profile/_list.js` verbatim (that file is outside this port's 75, in the other quarantined tree). |
| `dialecta-article-classification.jsx` | 686 | Passthrough only (`memberUuid` destructured once, forwarded once, no branch, security), but it threads into `dialecta-opinion-map-placement.jsx`'s trust decision, so it changes because its downstream consumer's contract changes. This is apps/web/CLAUDE.md's named "classification card" island; a same-stack prior implementation exists to adapt rather than author fresh. |
| `dialecta-opinion-map-placement.jsx` | 670 | Trust decision: gates and attributes an opinion-map commit to `memberUuid` with nothing else (security, line 76). 1 call site, session re-source. This is apps/web/CLAUDE.md's named "opinion maps" island. |
| `dialecta-nomination-panel.jsx` | 658 | Trust decision, same shape as discourse-layer's edit/delete (security: line 596 gate, line 611 submit). 1 call site, session re-source. |
| `dialecta-profile-edit.jsx` | 621 | Trust decision: attributes an avatar upload and a profile PATCH to `ghostMemberId` (security, lines 393, 422). 1 call site, session re-source. |
| `dialecta-profile-settings.jsx` | 558 | `SignaturePanel` attributes a signature PATCH to `memberUuid` (security, lines 407-412). 1 call site, session re-source. |
| `dialecta-opinion-map-picker.jsx` | 474 | **Provisional.** Identity-agnostic (security's confirmed-clean list). I have not read its full content beyond that sweep. |
| `dialecta-notifications-bell.jsx` | 395 | Prop-receive only, no own network code (my Phase 2: "needs nothing of its own"). Adapts because its data source, `dialecta-notifications-data.js`, changes under it. |
| `dialecta-share.jsx` | 359 | Passthrough only, 1 call site (`memberUuid` optional on the share-track POST, security). Re-source or pass null; low stakes either way. |
| `dialecta-notifications-settings.jsx` | 352 | Same shape as the bell: prop-receive, adapts because `dialecta-notifications-data.js` changes under it. |
| `dialecta-signup-invite.jsx` | 346 | Presentation gate only (hides the signup nag for existing members, security, lines 312, 343). Cosmetic re-source. |
| `dialecta-reflection-bar.jsx` | 306 | **Provisional.** Identity-agnostic (security's confirmed-clean list). Not read beyond that sweep. |
| `dialecta-handle-setup.jsx` | 302 | DOM-read (Category 1), and a real, separate migration site: `HandleSetupGate` reads `window.__DIALECTA_MEMBER_UUID__` itself at line 237/238, independent of `shell.jsx`'s own read of the same global two lines earlier in page load (my Phase 2 finding, confirmed by security). The gate logic and the handle-status GET (1 call site) survive; only the identity read is rewritten to a session hook, so this is adapted, not rewritten wholesale like the mount files. |
| `dialecta-notifications-page.jsx` | 268 | Same shape as bell/settings: prop-receive, adapts alongside `dialecta-notifications-data.js`. |
| `dialecta-tier-badge.jsx` | 265 | Designer: "the single highest-leverage fix in the whole tree," the shared primitive both `dialecta-discourse-layer.jsx` and `dialecta-private-draft.jsx` import for tier chips. Carries the 28 tier hex values as hardcoded JS literals with a confirmed contrast defect at line 181 (Heat's icon color). Adapts to read `--tier-*` tokens once style.css carries them (above) and fixes the Heat/Stance ink contrast once, here, which then fixes every consumer at once instead of four separate times. |
| `dialecta-community.jsx` | 232 | Presentation gate only (default tab, `viewerGhostId ? 'feed' : 'contributors'`, security line 160). Straightforward once `dialecta-community-feed.jsx` and `-contributors.jsx` are adapted. |
| `dialecta-quotes-data.js` | 229 | 10 call sites, 9 unconditional `member_id`. `useAdminStatus` (lines 116-119) is a second, independently-invented instance of dev-admin's mistake: an HTTP-status probe treated as authorization (security). Not dropped, because the public browse/suggest path behind it is a real, staffed content pipeline (circulation), only the admin-probe shape is unsound and needs a real session/RLS check. |
| `dialecta-profile-data-pure.js` | 204 | `mergeProfileWithGhost`, a pure function, already consumed directly by the adapted `contributor/[handle]/page.js`. Security's specific finding: its own code comment documents an already-patched cross-profile identity leak (the `isOwnProfile` gate exists because falling back to `ghost` once printed the viewer's name on someone else's profile). Adapts: the function's own vocabulary (a `ghost` session-shaped argument) should become whatever apps/web's real profile/auth shape is, not just a rename. |
| `fingerprint-page-mount.jsx` | 199 | Zero identity dependency, confirmed twice independently (security, my Phase 2): the hero carousel is hardcoded to three seed ids. Adapts because it has to call the new `fingerprint-geometry.ts`/`fingerprint-texture.ts` functions' signature (already changed today, see `dialecta-fingerprint-engine.jsx` above), not the recovered engine's. Its `matchMedia('(min-width: 1100px)')` hook (designer confirmed this is a correct hand-copy of `--bp-lg`) survives only if that breakpoint token survives style.css's promotion. |
| `dialecta-mentions-picker.jsx` | 178 | **Provisional.** Confirmed identity-agnostic (its `ghost_member_id` hits are `@mention` candidates' own ids, not the viewer's, my Phase 2 read at lines 16, 100). Full content not read beyond that. |
| `dialecta-notifications-data.js` | 151 | 5 call sites, `member_uuid` embedded in every URL/body (`fetchNotifications`, `markRead`, `markAllRead`, `fetchPrefs`, `savePrefs`, security). One shared data file behind three UI files (bell, page, settings); fixing this fixes all three consumers, which do not change themselves. |
| `dialecta-classify-stream.js` | 143 | **Provisional.** Identity-agnostic (security's clean list). A client-side streaming helper, a different layer from apps/web's existing server-side `classify.ts`; plausibly still needed once the editor island (A-10) is built, but I have not read its full content to confirm the streaming contract matches. |
| `dialecta-profile-data.js` | 133 | Trust decisions: `setFollow` attributes to `viewerMemberId` with no proof (security, lines 83-97), `updateProfile` PATCHes whatever id it is given (lines 66-77). 3 call sites total (my Phase 2 count), each needs session-sourced identity. |

## Question One: `_recovered-next/app/`, all 17 files

### Dropped (8)

| File | Lines | Reason |
| --- | ---: | --- |
| `article/[slug]/opengraph-image.js` | 195 | Redundant, not merely Ghost-coupled: `apps/web/src/app/articles/[slug]/opengraph-image.tsx` already exists, already ships, and is already rule-compliant (title and byline only, cites the same legal/philosopher ruling in its own comment). This recovered file additionally depends on Ghost's `feature_image` and `GHOST_ADMIN_API_URL`, which ADR-001 forbids in apps/web outright ("No Ghost imports or env in this app"). Two independent reasons to drop; neither is a judgment call against Dan's position, the destination already has better-fitting code. |
| `comment/[id]/opengraph-image.js` | 346 | Footer format `BY [NAME] · ON [ARTICLE] · [TIER]` (read directly, `buildFooter`, line 73) renders a bare tier word beside a named commenter's text off-platform, exactly what apps/web/CLAUDE.md's binding rule and circulation's read confirm legal and philosopher ruled out. No Ghost coupling at all in this file (confirmed by grep, zero matches), so the drop is entirely the tier-badge rule. No `comment/[id]/page.js` exists anywhere to consume it (circulation: "the pipe before the tap"). Porting 346 lines of unconsumed, rule-violating layout code is what Dan's own "no half measures" rule forecloses. |
| `contributor/[handle]/opengraph-image.js` | 442 | Renders archetype label and top-two-pillars caption on every share (circulation confirmed this one is wired, via `contributor/[handle]/page.js`'s `generateMetadata`). Same rule as the comment card. A minimal name-and-avatar-only replacement is a small fresh build, not a port of this file. |
| `api/debug/profile/[handle]/route.js` | 74 | The clearest drop-and-argue case in the set. Security's read: unauthenticated GET returns the live Supabase URL, the service key's length and 12-character prefix, an exact row count, and 10 sample profiles with `ghost_member_id`. Its own docblock says "Delete this file once Path C is fully stable," and it shipped to production anyway. apps/web has no equivalent and should never build one shaped like this. Porting a "delete me later" file is the same mistake made twice. |
| `api/health/route.js` | 16 | Redundant. `apps/web/src/app/api/health/route.ts` already exists and does more: per apps/web/CLAUDE.md's own route table, it "proves the `@dialecta/core` workspace link," a real check this file's static JSON does not do. |
| `page.js` | 61 | A placeholder ("Path C scaffold is up... will live here as the migration progresses," read in full) with no real content. apps/web's `page.tsx` already renders a real front page against live Supabase articles. Nothing to port. |
| `robots.js` | 28 | Redundant. `apps/web/src/app/robots.ts` already exists, already correct for the Supabase-backed sitemap. This file's `disallow` list includes four `/_probe` paths apps/web has none of, and omits `/auth/`, which apps/web does block. |
| `globals.css` | 89 | **Provisional drop.** Duplicates a subset of style.css's tokens with its own drift already visible (its `--amber: #b8732a` matches the spec's value, not style.css's `#b8862e`, a third fork of the same name). Porting it would add a fourth copy of overlapping custom properties. I have read apps/web's own `globals.css` only by line count (52 lines, from the frame's own measured table), not its content, so I am not asserting it is a clean superset, only that adding a third theme-level CSS file is the wrong direction once style.css is the token source. |

### Adapted (8)

| File | Lines | Reason |
| --- | ---: | --- |
| `layout.js` | 86 | apps/web's current `layout.tsx` is thinner: no `SiteNav`, no signature-font stylesheet link, token import via `tokens.css`/`globals.css` instead of `style.css`. Adaptation is a merge, not a swap: keep apps/web's metadata/Plausible/token structure, port in the signature-font `<link>` (needed once moments or the profile ship, nine hand-script faces) and the adapted `SiteNav`, drop this file's own `metadataBase` (`library.dialecta.org`, the wrong domain; apps/web/CLAUDE.md already has `src/lib/site.ts` as the one place the domain lives). |
| `sitemap.js` | 76 | apps/web's `sitemap.ts` already exists and covers articles and static pages, in a per-section try/catch shape this file's single flat function does not share. This file's real, currently-missing coverage is two URL families, `/contributor/<handle>` and `/quote/<slug>`, that do not exist in apps/web yet. Once those pages are ported (below), this file's two query bodies merge into apps/web's existing sitemap as two more try/catch sections, matching the pattern already there. Not as-is (different structure to merge into), not dropped (real, currently-missing URL coverage). |
| `components/SiteNav.js` | 93 | Deliberately built with "no member-aware bits" (its own docblock), zero Ghost/member coupling. Adapts because every `NAV_LINKS` href points at the Ghost apex (`dialecta.org/articles/`, `/stewards/`, `/fingerprint/`, `/about/`, none of which exist in apps/web yet per SITE-INVENTORY's "missing entirely" list), sign-in/join point at Ghost's portal instead of `/login`, and `LOGO_URL` is a Ghost-hosted image that needs to move to apps/web's own asset hosting. |
| `contributor/[handle]/page.js` | 91 | Read in full. The legacy cross-project fetch (`getProfileByHandle` to `dialecta.vercel.app`, the other quarantined tree) is what changes; it becomes `get-profile.js`'s Supabase-native rewrite (below). `mergeProfileWithGhost` and `DialectaProfile` port with the adaptations already named for those files. Fills a real gap: apps/web's `/profile/[id]` is a bare placeholder today, and keyed on `id`, not `handle`, a naming mismatch someone has to resolve deliberately when this lands, not silently. |
| `contributor/[handle]/moment/[id]/page.js` | 251 | Read in full. Clean bot/human user-agent split (`BOT_UA_RE`, line 24) that redirects real visitors to the canonical article while letting Facebook/Twitter/Slack/Discord/search crawlers see the celebration page and its OG tags. Zero Ghost or member coupling. Adapts because `www.dialecta.org` is hardcoded in three places and `SITE_BASE` falls back to `dialecta-next.vercel.app`; both need apps/web's `site.ts` convention. Its `tier_promoted` share path is coordinated with the same event type in the OG route below. |
| `contributor/[handle]/moment/[id]/opengraph-image.js` | 491 | Read via grep and circulation's detailed prior read. 6 of 7 `describeMoment` event types (`first_comment`, `first_article`, `first_quote`, `delta_acknowledged`, `follower_milestone`, `became_steward`) carry no tier or archetype content and port clean. `tier_promoted` renders `prior_tier -> new_tier`, which circulation flagged as open: no legal or philosopher ruling exists yet for a contributor's own self-selected share of their own promotion, a different consent posture than a quoted stranger's. apps/web/CLAUDE.md's rule is written unconditionally ("no tier badge... ever"), so I would hold `tier_promoted` back specifically, not the whole file, until that ruling lands. |
| `quote/[slug]/page.js` | 192 | Clean Supabase-native fetch via `getQuoteBySlug`, zero Ghost coupling, a Schema.org `Quotation` JSON-LD block. Adapts alongside `get-quote.js`'s status-literal fix (below) and the `SITE_BASE` to `site.ts` swap every recovered app-tree file needs. |
| `quote/[slug]/opengraph-image.js` | 337 | Same reasoning as its page: clean, no Ghost or member coupling (confirmed by grep), adapts alongside `get-quote.js` and the domain-constant swap. |

### As-is (1)

| File | Lines | Reason |
| --- | ---: | --- |
| `contributor/[handle]/moment/[id]/MomentShareButtons.js` | 80 | Read in full. Pure client island (`'use client'`, line 1): two `<a target="_blank">` intents (X, Facebook) and a clipboard-copy button with local `useState`. Zero Ghost or member coupling, zero data fetching. Its 3 hardcoded hex values (`T.brassDeep`, `T.brassMid`, `T.brassWarm`) need swapping to `var(--brass-*)`, which is exactly the frame's own definition of as-is ("moves and compiles with import and token fixes only"). Note for apps/web/CLAUDE.md's island list: if moments ship, this is a 7th client island the mandate does not currently name, alongside the drift `practices.md` already tracks between the mandate's six and `apps/web/CLAUDE.md`'s six-plus-editor. |

## Question One: `_recovered-next/lib/*.js`, all 7 files

| File | Lines | Verdict | Reason |
| --- | ---: | --- | --- |
| `get-article.js` | 161 | **Dropped** | Ghost-primary: fetches title, excerpt, author, and `feature_image` from `ghostAdminFetch`, uses Supabase only as a tier overlay. The inverse of ADR-001's target ("Articles come from Supabase, never Ghost... No Ghost imports or env in this app"). apps/web's `src/lib/articles.ts` is the intended replacement, though I flag honestly: it queries `slug, title, excerpt, body_html`, columns the live baseline schema migration (`supabase/migrations/20260920000000_baseline_live_schema.sql`) explicitly marks "confirmed absent" on `articles` today. That gap is ADR-003's "Migration 0002," unapplied as of this read, migrator's schema work to close, not a reason to revive this file's Ghost dependency. |
| `get-comment.js` | 123 | **Adapted** | Strong match against the live schema, read directly: every column it selects (`article_id, article_slug, article_title, member_id, member_name, body, status, published_at` on `comments`; `final_tier` on `classifications`; `display_name` on `profiles`) is confirmed live in the same baseline migration, and its suppressed-status visibility gate matches the live `comment_status` enum exactly. Adaptation is narrow: env var names (`SUPABASE_URL`/`SUPABASE_SERVICE_KEY` become `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, confirmed against `apps/web/src/lib/supabase/service.ts`) and routing the client through that file's `createServiceClient()` instead of hand-rolling a new one. The live `comments` table now carries `final_tier` directly, so the separate `classifications` join this file does may be simplifiable, a cheap follow-up, not a blocker. |
| `get-profile.js` | 73 | **Rewritten** | Its own comment states the plan: "we'll port that to a direct Supabase query when Phase 4 moves the API routes into this project." That is this port. Step 1 (handle to `ghost_member_id`) is already a direct Supabase query and adapts as-is. Step 2 is a cross-project HTTP call to `dialecta.vercel.app`, the quarantined `_recovered/` API, dead on arrival for apps/web. It has to become a direct Supabase query assembling the same returned shape (profile, axis scores, archetype, stats, connections). The target shape is known; the code that builds it is new. |
| `get-quote.js` | 60 | **Adapted** | Clean Supabase-native match (`quote_id, text, author, source, year, tags` all confirmed live). One real discrepancy, read directly in the live migration's own comment on the `quotes.status` column: it calls `'published'` "the candidate guess" for what the select policy filters on, while this file filters `.eq('status', 'live')`. That literal needs confirming against the real RLS policy before this ships. Same env var and service-client swap as `get-comment.js`. |
| `get-moment.js` | 197 | **Adapted** | Strong match: `celebration_events` and `profiles` columns both confirmed live. Same env var and service-client swap. `describeMoment`'s 8-branch event-type map is pure content, no coupling, ports as-is within this otherwise-adapted file. |
| `ghost-admin.js` | 65 | **Dropped** | Signs Ghost Admin API JWTs. Its only caller among these 7 is `get-article.js`, dropped above, and ADR-001 forbids Ghost env or imports in apps/web outright. Flagged outside this port's scope: apps/web/CLAUDE.md names a one-time `scripts/import-ghost.mjs`; if that script needs equivalent JWT signing, this file is a clean reference for it there, but `scripts/` is not `apps/web` and not one of the 75 files this table rules on. |
| `og-background-config.js` | 46 | **As-is** | Pure static data (`event_type` to background-photo filename), zero I/O, zero coupling of any kind, read in full. The only dependency is the photo assets themselves existing under `public/og-backgrounds/library/`, an asset-pipeline task (`scripts/process-og-backgrounds.mjs`), not a code change and not one of the 75 files here. |

## Verdict tally

| | lib/theme (51) | app/ (17) | lib/*.js (7) | Total (75) |
| --- | ---: | ---: | ---: | ---: |
| As-is | 1 | 1 | 1 | 3 |
| Adapted | 35 | 8 | 3 | 46 |
| Rewritten | 9 | 0 | 1 | 10 |
| Dropped | 6 | 8 | 2 | 16 |

By lines: roughly 5,100 of the ~38,300 portable lines are dropped (13%), concentrated in one large
file (`dialecta-dev-admin.jsx`, 2,367) and several small ones. That is consistent with Dan's
position holding up under a file-by-file read: the exceptions are real but narrow, and every one
traces to a rule the Council had already settled before this table existed, not to a fresh call
made here.

## The two open items, settled

**TypeScript.** `apps/web/tsconfig.json` has `allowJs: true` and `jsx: "preserve"`, confirmed by
direct read. Next's own compiler transpiles `.js`/`.jsx` regardless of tsconfig `include`, so
ported files build and run with zero conversion cost. The real cost is a gap, not a blocker:
`tsconfig.json`'s `include` array is `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]`,
which does not glob `.js` or `.jsx`, so `npm run typecheck` (`tsc --noEmit`) silently skips every
ported file. Adding those globs later, under `strict: true`, would surface a real wall of implicit-
`any` errors on files with zero annotations today. My recommendation: ported files stay `.jsx`/`.js`
through this port, typecheck coverage is filed as backlog, and `apps/web/CLAUDE.md`'s conventions
gain one line saying so, rather than paying a TypeScript-conversion tax inside the port itself.

**`contributor/[handle]`, moments, `quote/[slug]`.** Placed above, file by file, not left waiting:
the contributor page adapts, its archetype-card OG image is dropped, the moment page and OG route
adapt (with `tier_promoted` held back pending a ruling), the moment share buttons are as-is, the
quote page and OG route adapt. Nothing here is deferred to "later"; every file has a verdict.

## Question Four: the first increment

**What it proves.** A signed-in contributor reads a real article (already built), writes a comment
through the real session-verified path (already built, server side), sees it rendered on the page
with a tier badge in the platform's own visual language. Not the classification card, not opinion
maps, not the editor: those are separate named islands with their own adapted files above, and
none of them gate proving the write path works end to end.

**Files, in the order they land:**

1. **`--tier-*` tokens**, a narrow slice of style.css's promotion (designer's Question Three, not
   re-litigated here): only the tier colors the badge needs, not the full `amber`/`border-light`
   reconciliation. The slice does not wait on all of Question Three's answer.
2. **`dialecta-tier-badge.jsx`** (265 lines, adapted), ported first because both remaining slice
   files import it.
3. **`dialecta-private-draft.jsx`** (1,796 lines, adapted): the compose ritual, rewired to
   `POST /api/comment`'s real contract, `member_uuid` dropped from both call sites.
4. **`dialecta-discourse-layer.jsx`** (1,251 lines, adapted): the read/list/edit/delete surface.
   The list GET has no existing target in apps/web; I recommend a direct server-component Supabase
   read (comments filtered by `article_id`, RLS already open per
   `supabase/migrations/20260920193044_publish_the_three_existing_comments.sql`) over a new client-
   fetched API route, consistent with how `get-comment.js` and `articles.ts` already read in this
   codebase. Edit and delete need a small new route handler; not a port, new code, small.
5. **`apps/web/src/app/articles/[slug]/page.tsx`**, extended (not in the recovered tree at all) to
   mount the composer and the feed beneath the already-sanitized article body.
6. **`apps/web/src/app/api/comment/route.ts`**, already done. The slice's entire write-side job is
   making a real client call the contract this file already enforces.

**Does the per-file plan move the 5 to 8 working day figure?** Holds, and for a specific reason
rather than a restated one: every file in the slice was already named inside that figure in my
Phase 2 position ("`dialecta-discourse-layer.jsx` and `dialecta-private-draft.jsx`... are exactly
the slice's own critical path"). What this pass adds nets out rather than adding on top. It
removes work: the server route is confirmed done, with a fixed contract, not still to design. It
adds work I had not named by file before: a comment-list read path does not exist yet. Small
against the two files already carrying the estimate. 5 to 8 working days stands.

**What the full port costs now.** 5 to 7 weeks still holds, leaning toward the lower end rather
than moved outside the band. Two things pull down: the fingerprint engine's compute half is
already ported today, in `packages/core`, ahead of this port needing to touch it at all, and the
16 dropped files include the single largest one in the tree (`dialecta-dev-admin.jsx`, 2,367
lines) plus two OG routes apps/web already has working replacements for. One thing pulls up, not
enough to offset the two above: style.css's promotion to token source of record is real,
uncosted-here design-system work every adapted file depends on for its final pass, even though the
slice above only needs a narrow piece of it early. Net: still 5 to 7 weeks, not a new number.

## Rebuttal

Migrator is right, and the error is mine, not a judgment call. My Question Four slice cited "RLS
already open per supabase/migrations/20260920193044_publish_the_three_existing_comments.sql" as
grounds to read comments straight from a server component. That migration flips three rows to
status='published'; it never touches policy. The only comments policies live, per migrator's read
of 20260920200500_comment_write_identity.sql, are both owner-scoped: insert and select gated on
member_id = current_ghost_member_id(), with no status branch. So the three published rows are
visible only to the member who wrote each one. My slice's proof, a contributor writes a comment and
it renders on the page, still works for that one contributor viewing their own row, but it proves a
private echo, not the shared discourse thread the increment claims, and not what ROADMAP.md's own
"visible discourse" line asserts.

Concession: the "already open" citation was wrong. Step 4, dialecta-discourse-layer.jsx's read
path, needs the public-read policy migrator names, status in published or suppressed, or member_id
matches the viewer, which is not written yet.

Cost to the plan: not the 46 of 75 tally, and not the 5 to 8 day band, migrator's own read calls
this days, not weeks, and I agree. The cost is sequencing. This migration and the articles-content
gap migrator also names belong in the slice's own file list, landing with
dialecta-discourse-layer.jsx, not assumed already done.
