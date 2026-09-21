# Port or rewrite: circulation's file-level ruling

*Phase 2, 2026-09-20. Extends `positions/2026-09-20-recovered-source-read.md` rather than
restating it. Every claim below is against a file read today, cited by path.*

## Brief

The four-surface split from Phase 1 holds, but a new finding cuts under all of it: three of the
four data fetchers behind these cards fail on a wiring violation before their card design is even
worth judging. `get-article.js` imports `ghostAdminFetch`, a live Ghost Admin API call ADR-001
already forbids. `get-profile.js` is an admitted "spike" that hits a separate, unported legacy
Vercel deployment (`dialecta.vercel.app`) for the contributor bundle. Only `get-quote.js` and
`get-moment.js` are Supabase-native with zero external coupling. Distribution value and data-layer
legality are different questions, and for this tree, the second one decides most of the first.

## Data layer coupling

Every card question below sits on top of one of these seven fetchers. Read directly, not
inferred:

| Fetcher | Coupling | Verdict |
| --- | --- | --- |
| `get-article.js` (161) | Calls `ghostAdminFetch()`, a live Ghost Admin API JWT fetch. ADR-001: "Nothing new is built on Ghost." | Drop. Rewrite against `apps/web/src/lib/articles.ts`, which already exists and is Supabase-native |
| `ghost-admin.js` (65) | Pure Ghost Admin HMAC-JWT helper, its own header says it "mirrors `C:\dialecta-api\api\_ghost-admin.js` verbatim." Used only by `get-article.js` | Drop. Nothing else imports it, and once `get-article.js` is gone it has no caller |
| `get-profile.js` (73) | Its own header calls itself a "spike implementation." Hits `LEGACY_API_BASE = 'https://dialecta.vercel.app'`, a separate, still-deployed Vercel project nobody is porting, for "axisScores, archetype, stats, connections, chip arrays" | Drop. Rewrite from a direct Supabase query, scoped to what a stripped contributor card needs, not the full bundle |
| `get-comment.js` (123) | Direct Supabase query on `comments`, `classifications`, `profiles`. No Ghost, no legacy API | Fetcher logic is clean and adaptable, but see the comment card section: the route it feeds does not ship |
| `get-quote.js` (60) | Direct Supabase query on `quotes`, primary key is the slug. No Ghost, no legacy API | Port close to as-is |
| `get-moment.js` (197) | Direct Supabase query on `celebration_events` and `profiles`, plus a handle/id ownership check that stops a stranger's handle guess from rendering someone else's moment. No Ghost, no legacy API | Port close to as-is |
| `og-background-config.js` (46) | Pure config, maps celebration event type to a photo filename. No network calls, no database, no Ghost | Port as-is, once the moment surface ships |

## Article card

`apps/web/src/app/articles/[slug]/opengraph-image.tsx` already exists, already reads
`getPublishedArticle` from Supabase, and already carries the same no-tier-badge citation
(`exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md`) this
review keeps landing on independently. It bakes title and byline into the image itself via
`ImageResponse`.

`article/[slug]/opengraph-image.js` (195) takes the opposite approach: a full-bleed photo, no text
anywhere in the image, on the stated theory that Facebook and X render `og:title`/`og:url` as text
below the image, so the card should not compete with that. The reasoning is real and it is the
only file in this whole set with a documented editorial rationale in its own comments. It still
does not port, for three separate reasons, any one of which is enough on its own:

1. It imports `getArticleBySlug` from `@/lib/get-article`, which is Ghost-coupled. Dropped above.
2. Its photo priority (`feature_image`, then a curated fallback, then a brand card) has nothing to
   read from today. `apps/web/src/lib/articles.ts`'s `SUMMARY_COLUMNS` carries no image column at
   all, so this is not a rewire, it is a new schema field with nobody yet asking for it.
3. A card with zero text of its own is the one design in this entire review that fully depends on
   the platform to render the headline, which is exactly the behavior my own research
   (`research/2026-opengraph-and-x-card-share-surface.md`) found X has repeatedly dropped on the
   large-image format. Facebook is verified safe for this (Sharing Debugger confirms it before
   posting); X is not, and per the convener's live check below, cannot be verified at all anymore.

Verdict: **rewritten**. `apps/web`'s existing text-baked card stays authoritative; it already
complies with the ruling this whole review keeps re-finding and it is immune to the one named risk
by construction. The photo-priority idea is worth a second look once `articles` carries a hero
image, but that is a schema decision for whoever owns the Supabase migration, not a today-port, and
the visual reconciliation between a photo card and a text card is `designer`'s call, not mine.

## Contributor card

`contributor/[handle]/opengraph-image.js` (442) and `page.js` (91) both fail before the archetype
question even needs answering: `page.js`'s own comment says it depends on "the legacy dialecta-api
during the migration window," and `get-profile.js` behind it is the spike-and-legacy-fetch file
ruled on above. Both drop as delivered.

Once the archetype label and the two pillar names are stripped, per `legal` and `philosopher`'s
ruling, what remains is a display name, a handle, and an avatar or initials disc. That is thin
next to quote or moment: this platform has six real people on it (`brief.md`), and a bare identity
card is not the kind of thing a stranger reshares the way they reshare a good quote or a
celebration. But it is not nothing. It matches `apps/web/src/app/profile/[id]/page.tsx`, a route
that already exists as a placeholder ("Profile placeholder for contributor") with nowhere yet to
point a share card at, and it is the front door for the side of growth this seat's charter names
directly: author recruitment as an audience question. A name and a handle, offered by the person
themselves, is proof of identity in a way an anonymous platform cannot manufacture.

Verdict: **rewritten**. The card survives in stripped form, the fetcher is rebuilt against
Supabase directly with no legacy hop, and `page.js`'s own `twitter: { card: 'summary' }` choice was
right (see the card type ruling below). Not a priority for the first slice: the page it would sit
on is still an empty placeholder, and building a share card for a page with nothing on it repeats
the mistake this seat's own charter opens with, measuring or building for an empty surface.

## Comment card

`comment/[id]/opengraph-image.js` (346), read directly, renders the comment body, the commenter's
display name, the parent article title, and a footer reading `BY [NAME] · ON [ARTICLE] ·
[TIER]`, where `TIER_LABELS` is the same seven-tier vocabulary (`forum, spark, echo, fog, heat,
stance, breach`) `legal` and `philosopher` already ruled a bare tier word may never carry off
platform. No rubric, no Pact language, nothing a stranger could check the label against. This is
the exact shape `legal`'s exchange note described before this seat had read the code behind it.

Nothing serves it today. No `comment/[id]/page.js` was recovered, and the file's own header says
sharing UI "doesn't exist in the discourse layer yet." The pipe was built before the tap.

Unlike the contributor card, there is no useful stripped remainder here. Take the tier out and
what is left is a screenshot of a named person's comment, verbatim, permanent, off platform,
which is a different and separate consent question this seat is not positioned to settle alone.
`get-comment.js`'s own visibility gate is also narrower than it should be: it returns any comment
where `status !== 'suppressed'`, explicitly not checking `published_at` (never set by the current
pipeline) or `status === 'published'` (the promotion pipeline does not move rows out of
`pending_review`). Whether a `final_tier: 'breach'` row can have a `status` other than
`'suppressed'` is a question for whoever owns the classification pipeline; this read could not
close it.

Verdict: **dropped**, the rendering file. `get-comment.js`, the fetcher, is clean Supabase logic
with no rendering decision baked in, and can be kept on ice for a future on-platform comment share
feature if one is ever scoped, but the opengraph-image route as built does not ship, adapted or
otherwise.

## Quote surface

`quote/[slug]/page.js` (192) and `opengraph-image.js` (337) read exactly as clean as Phase 1 found:
Supabase-native, no Ghost, no legacy API, no tier, no fingerprint, nothing about a named
Dialecta member at all. `get-quote.js` behind it is a single-table, slug-keyed query with an
explicit non-live-rows filter (`status = 'live'`). This is the one card in the whole set with no
precondition riding on it: a quote is true and shareable the day it is entered, independent of
whether the comments section under any article has anything in it, which is the exact blocker
`philosopher`'s `path-to-launch.md` already named for the article-share strategy.

Verdict: **ported**, adapted only for import paths and for `apps/web`'s own Supabase client
convention (`src/lib/supabase/server.ts`).

This does change the launch order. My own standing position (`positions.md`) already flags
Facebook as effectively the whole non-direct channel today and cites the MetaFilter lesson that a
single channel not owned by the platform is a risk worth building a second channel against before
it is trusted as "the plan." A precondition-free, already-built share surface is exactly that
second leg. I recommend `quote/[slug]` join the first vertical slice alongside the article route,
not wait for a later phase.

## Moments

`contributor/[handle]/moment/[id]/page.js` (251), `opengraph-image.js` (491),
`MomentShareButtons.js` (80), and `get-moment.js` are a real, engineered celebration surface: a row
in `celebration_events`, a kicker and a primary content snippet rendered large (the actual comment
text, article title, or quote), the contributor's own hand-chosen signature font, and a landing
page whose hero image is the same image the share card shows. Read plainly, this is Dan's own
"the share carries its own proof" logic extended from articles to people, and it is the closest
thing in this tree to that strategy done right.

The mechanism I flagged in Phase 1 as needing someone's judgment now has mine, because reading
`layout.js` and `SiteNav.js` for this pass explains it. The moment page's bot/human split (crawlers
see the OG-scrapeable page, a real visitor is redirected server-side to the article) and its
`og:url` pointing at the apex domain instead of the one serving the request are not arbitrary.
They are built for a two-domain architecture: `layout.js` sets `metadataBase: new
URL('https://library.dialecta.org')`, and `SiteNav.js`'s own header calls itself "chrome for SSR
pages on library.dialecta.org," with every nav link pointing back at a separate "real" apex on
`dialecta.org`. `apps/web/src/lib/site.ts` already states the replacement: "dialecta.org is the
permanent domain: Ghost serves it until cutover, then this app takes over the same address." There
is no longer a separate, realer domain to redirect a human toward. `apps/web` is going to be it.

So the specific implementation does not port: a cross-domain redirect to a domain `apps/web` will
itself already be serving is a redirect to nowhere. The idea underneath it can survive as a
same-domain product decision, and on arrival grounds specifically, I would not keep the redirect at
all. The moment page's hero already matches the share card exactly, which is a stronger first
impression for a cold arrival than bouncing a real click through to a bare article. That is my
recommendation from this seat's angle; whoever owns on-site UX for moments should have the final
say, since it is also a product question, not only a distribution one.

One content point sharpens what I left open in Phase 1. Seven of the eight event types
(`first_comment, first_article, first_quote, delta_acknowledged, follower_milestone,
became_steward`, plus the unlabeled default) carry no tier content at all. The eighth,
`tier_promoted`, renders `prior_tier -> new_tier` with no rubric, the same bare-label shape the
comment card was ruled out for, just applied to a contributor's own upward move rather than a
stranger's quoted words. I do not think one event type out of eight should hold the whole feature
back. Ship the other seven; gate `tier_promoted` pending an actual ruling from `legal` or
`philosopher` on the consent difference between a stranger's quoted comment and a contributor
celebrating their own movement, which as far as I can find has not been asked yet.

Verdict: **adapted**, the family, excluding `tier_promoted` pending that ruling. `get-moment.js`
and `og-background-config.js` port close to as-is (see the data layer table). `page.js` and
`opengraph-image.js` need the same-domain rewrite above and the tier_promoted carve-out.
`MomentShareButtons.js` needs only whatever URL construction upstream changes when the domain
question resolves; nothing else in the 80 lines depends on Ghost, the legacy API, or the domain
split.

On launch order, moments sit behind quote, not beside it. A quote needs nothing to exist first. A
moment needs a `celebration_events` row, which needs at least a first comment or first article to
have already happened. Precondition-light, not precondition-free. A real second-slice candidate,
not a first one.

## Sitemap and robots

`apps/web/src/app/sitemap.ts` covers the static pages plus every published article. It does not
cover contributor or quote pages at all, because neither route exists in `apps/web` yet.

`sitemap.js` (76) covers exactly the gap: contributor profiles by handle and live quotes by slug,
queried directly off Supabase. It deliberately excludes articles, because under the old
architecture Ghost's own sitemap owned `/article/*`. That exclusion is backwards now that ADR-001
has articles living in Supabase and `apps/web`'s sitemap already listing them, so the file's
organizing principle, not just its details, does not carry over. It also uses a different Supabase
client pattern than `apps/web`'s own (`createClient` from `@supabase/supabase-js` directly, inline
service key, versus `apps/web`'s `src/lib/supabase/server.ts`) and a `dialecta-next.vercel.app`
domain fallback where `apps/web` already has one canonical source, `src/lib/site.ts`'s `SITE_URL`.

Verdict: **adapted, deferred**. The file does not port. The insight it encodes, that a sitemap
covering only articles is not the whole site once contributor and quote pages exist, is real and
owed, and belongs in `sitemap.ts` the same week those routes ship, not before. A sitemap entry
pointing at a route that 404s is worse than no entry, which is this seat's own charter position
restated: don't treat a plan as a fact, don't build discovery for content that isn't there.

`robots.js` (28) disallows `/api/` plus four debug `_probe` paths that trace back to the article OG
route's own debug branch, itself dropped above. Its domain handling has the same fallback weakness
as the sitemap file. `apps/web/robots.ts` already disallows the machine routes that exist
(`/api/`, `/auth/`) and points at the sitemap. Verdict: **dropped**, nothing here the existing file
lacks.

## Layout and SiteNav

`layout.js` (86) sets `openGraph` sitewide (`siteName`, `type`, `locale`) and no `twitter` object
anywhere in the file, confirmed by direct read. Under `apps/web/CLAUDE.md`'s rule, that is a
violation on its face if this metadata block ported unchanged; anything pulled from it needs `twitter:
{ card: 'summary' }` added. `apps/web/src/app/layout.tsx` already has this set correctly today, so
there is no live gap, only a warning for whatever gets merged in from this file later.

The larger problem is the same one moments exposed: `metadataBase` is pinned to
`library.dialecta.org`, and `SiteNav.js` (93) is built entirely around that split. Every nav link
points at the Ghost apex (`dialecta.org/articles/`, `/community/`, `/stewards/`, `/pact/`,
`/fingerprint/`, `/guidebook/`, `/about/`), and the sign-in and join links point at Ghost Portal
(`/#/portal/signin`, `/#/portal/signup`), which ADR-002 already replaced with Supabase auth and a
real `/login` route. `apps/web` has no nav component at all today (`src/components` holds only
`editor/README.md` and `login/login-form.tsx`), and `layout.tsx` renders nothing but `{children}`
and the Plausible script, so this is a real gap, not a duplicate. But a ported `SiteNav.js` would
make the site's own primary navigation point away from itself, into a Ghost instance ADR-001 is
leaving and an auth flow ADR-002 already retired. That is not a detail to adapt, it is the file's
central assumption, inverted.

Two smaller findings from the same read. The nine-font Google Fonts `<link>` for contributor
signature fonts is loaded sitewide in `<head>`, taxing every single page view for a feature
(moments) that does not exist in `apps/web` yet; it belongs scoped to the moment route once that
ships, not the root layout. And the "Dialecta is in active development... Tell us what you see"
build-strip banner is built for a soft launch with visible caveats, the opposite of Dan's own
stated position that a messy or visibly unfinished site risks losing a first-time reader and is
worth a week or two to avoid. It should not ship on the finished product this Council is building
toward.

Verdict: **both rewritten**. The nav vocabulary (a logo bar plus a seven-item sub-nav covering
articles, community, stewards, the Pact, the fingerprint, the guidebook, about) and the two-tier
layout shape are worth consulting when `apps/web` builds its own nav. The hrefs, the auth links,
the domain, the banner, and the font placement are not.

## Card type rule

Production shipped `summary` on the contributor card and `summary_large_image` on quote and
moment. I flagged this split as unresolved in Phase 1 and owe it a real answer now that I have read
`apps/web`'s own article card in full.

The apparent tension mostly dissolves on inspection. `apps/web`'s article card, the contributor
card, the quote card, and the moment card all bake their entire message into the rendered image
through Satori. None of them depend on a platform separately rendering `og:title` as legible text,
which is the one specific failure my research
(`research/2026-opengraph-and-x-card-share-surface.md`) documented: X repeatedly dropping headline
text from the large-image format between 2023 and 2024. A card with no separate headline to drop
cannot lose it. Only the recovered article card, pure photo with zero text of its own,
carries that exposure, and it does not port regardless, per the article card section above.

But the convener's own live check on that research (recorded in the same file) found something
stronger and worse than the original claim: X's Card documentation is not paywalled, it no longer
exists (`docs.x.com/x-for-websites/cards/overview/abouts-cards` returns 404). Nobody outside X can
read what `summary_large_image` does anymore, at all. That reasoning is not about headlines
specifically and does not discriminate by whether a card's text is baked in or platform-rendered.
It applies to every card equally.

The two findings point the same direction once stated as risk rather than mechanism.
`summary`'s worst case, if this whole concern turns out overblown, is a smaller image carrying the
same words. `summary_large_image`'s worst case is unbounded, precisely because the surface
producing it can no longer be read. A card that bakes its message into pixels is well defended
against the one named risk. Against the unnamed ones it has no defense, because nobody can
currently enumerate them.

**The rule: `summary` everywhere, including quote and moment, contra what production shipped.**
This is a correction to my own open question, not a split by content type. `apps/web/CLAUDE.md`'s
rule itself does not need to change; its stated justification does. Today it cites only the
2023 to 2024 headline-stripping reports, the narrower and now-secondary reason. I'd add the
convener's finding as the primary one: the specification is gone, not paywalled, so nothing about
the aggressive format can be verified before a real post goes out, whatever is or is not baked into
the image. The one earned exception is the empirical path the convener's check already prescribed
and this seat's own charter already commits to: publish one quote or moment card, look at it on X
directly, and only flip that specific route to `summary_large_image` once it has
been seen to render correctly. That is measurement, not a carve-out.

## Verdicts

Every file in `_recovered-next/app/` and every `lib/get-*.js` fetcher, one line each.

| File | Verdict |
| --- | --- |
| `app/article/[slug]/opengraph-image.js` | Rewritten. Ghost-coupled data layer, no image column to read from yet, and the one design in this set most exposed to X's unverifiable card behavior |
| `app/comment/[id]/opengraph-image.js` | Dropped. Renders exactly what `legal`/`philosopher` ruled out; no page serves it; no useful stripped remainder |
| `app/components/SiteNav.js` | Rewritten. Points primary nav at a Ghost apex and Ghost Portal auth, both retired; nav vocabulary and layout shape worth keeping |
| `app/contributor/[handle]/moment/[id]/MomentShareButtons.js` | Adapted. Only the embedded URL needs the same-domain fix from `page.js` |
| `app/contributor/[handle]/moment/[id]/opengraph-image.js` | Adapted. Ships for 7 of 8 event types; `tier_promoted` gated pending a ruling |
| `app/contributor/[handle]/moment/[id]/page.js` | Adapted. Cross-domain bot/human redirect rewritten for a single-domain `apps/web`; recommend dropping the redirect entirely |
| `app/contributor/[handle]/opengraph-image.js` | Rewritten. Strip archetype and pillars per standing ruling; rebuild off Supabase directly |
| `app/contributor/[handle]/page.js` | Rewritten. Same fetcher problem, same standing ruling |
| `app/globals.css` | No circulation-specific finding; `designer`'s lane, see their Phase 1 read on `style.css` versus `tokens.css` |
| `app/layout.js` | Rewritten. Missing `twitter:card` if ported unchanged; `metadataBase` pinned to a satellite domain `apps/web` supersedes; sitewide signature fonts and the build-in-progress banner both premature |
| `app/page.js` | Dropped. Its own comment calls it a placeholder; `apps/web`'s real homepage already lists published articles |
| `app/quote/[slug]/opengraph-image.js` | Ported. Clean data layer, no precondition, adapt `twitter:card` per the rule above |
| `app/quote/[slug]/page.js` | Ported. Recommend first vertical slice, alongside articles |
| `app/robots.js` | Dropped. Nothing `apps/web/robots.ts` lacks; its probe-route entries trace to a file already dropped |
| `app/sitemap.js` | Adapted, deferred. Its contributor and quote entries are a real gap in `apps/web/sitemap.ts`, owed the week those routes ship, not before; its Ghost-era exclusion of articles does not carry over |
| `app/api/debug/profile/[handle]/route.js` | Dropped. `security`'s lane; leaks Supabase key metadata and raw profile rows with no auth |
| `app/api/health/route.js` | Dropped. `apps/web` already has its own, for a different stated purpose; nothing circulation-relevant either way |
| `lib/get-article.js` | Dropped. Ghost-coupled; `apps/web/src/lib/articles.ts` is the Supabase-native replacement already built |
| `lib/get-comment.js` | Fetcher logic clean and Supabase-native; held for a possible future on-platform comment share, not shipped as an OG route today |
| `lib/get-moment.js` | Ported. Supabase-native, includes a real handle/id ownership check |
| `lib/get-profile.js` | Dropped. Self-described spike, depends on an unported legacy Vercel deployment |
| `lib/get-quote.js` | Ported. Single-table, Supabase-native, slug-keyed |
| `lib/ghost-admin.js` | Dropped. Ghost-only helper with no caller once `get-article.js` is gone |
| `lib/og-background-config.js` | Ported, once moments ship. Pure config, real photography assets, zero coupling |

*Filed 2026-09-20*

## Rebuttal

Philosopher's strongest hit lands on my own verdict, not just my reasoning. I gated `tier_promoted` and shipped the other seven event types, including `follower_milestone`, because my test only checked for tier content. Philosopher's second test asks something broader: does the surface turn a relationship into a broadcastable count, rank, or badge. A follower count passes that test on construction alone; no rubric is needed to make it a status object. I was checking for the wrong failure mode.

I concede the verdict, and circulation's own lane reaches the same place independently. This platform has six real people on it, per my own contributor-card finding. A public card reading "3 followers" does not read as a milestone, it reads as evidence of smallness, on the one format built for a stranger's first impression. That is a distribution argument, not philosopher's ethical one, and it ends at the identical drop. Six of eight event types ship clean, not seven.

Dropping the bot/human redirect does not change migrator's RLS point. The exposure class migrator names, a single service-role row-read by id, meant to be public on share, is a property of the fetch, not of what happens after it renders. Removing the redirect makes every visitor hit that same read uniformly instead of two paths converging on it, which simplifies the surface rather than creating a new one.

A page a human never saw was still distribution: its job was the link preview, and the redirect only decided where the click landed after. Dropping the redirect does not remove that job, it lets the same content also serve the click.
