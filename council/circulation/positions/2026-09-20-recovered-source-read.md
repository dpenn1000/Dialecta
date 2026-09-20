## Brief

Four OG image routes, a sitemap, a robots file, and three unnamed surfaces (contributor, moment,
quote) are real code in `_recovered-next/app`, deployed to Vercel in May 2026. The comment card
renders a bare tier word (Breach included) beside a named commenter's full text, off-platform,
with no basis shown: what legal and philosopher ruled out, though nothing wires it live yet. The
contributor card renders an archetype and two pillar names on every profile share, also ruled out,
and this one is wired. Moments and quotes are clean. X's card format splits three ways across the
routes read here: one matches my recommendation, two contradict it for a defensible reason. The
shareable unit is at least four units, not one.

## 1. What the four OG routes actually render

Read directly from each file.

**Article** (`_recovered-next/app/article/[slug]/opengraph-image.js`). A full-bleed photo, nothing
else. No headline, no overlay, no tier, no name. The file's own header comment states why:
"Editorial-publication style... Following the convention used by WaPo, NYT, and every major
news/magazine publisher... Facebook (and X, LinkedIn, etc.) renders the title and source line from
og:title + og:url meta tags BELOW the image, so duplicating that on the image itself only crowds
the share preview." Photo priority is Ghost's `feature_image`, then a curated fallback, then a
brand card of last resort. This is the one route with an explicit, documented reason in the code
itself, not an inference.

I could not confirm this route's `twitter:card` setting. No `article/[slug]/page.js` was recovered,
only the image route, so the metadata block that would set it does not exist in this tree. The
root `layout.js` sets `openGraph` sitewide (siteName, type, locale) but no `twitter` object at all,
so there is no sitewide default either.

**Contributor** (`.../contributor/[handle]/opengraph-image.js`, wired from
`contributor/[handle]/page.js`). Renders the contributor's display name, handle, avatar-less
initials disc, **archetype label**, and a caption built from their **top two pillars**
(`acuity, calibration, magnanimity, discourse, consistency, reach`, read from `PILLAR_LABELS` and
`topTwoPillars(axisScores)`). `page.js`'s `generateMetadata` sets `twitter: { card: 'summary', ... }`
explicitly. This is the one surface that matches my own recommendation in
`research/2026-opengraph-and-x-card-share-surface.md`.

Whether this image route is the one Facebook and X actually fetch is not fully settled by this
read. `page.js` also sets an explicit `openGraph.images` array, populated with the contributor's
`avatar_url` when one exists and empty when it does not. I did not run the app to see how Next.js
resolves an explicit-but-empty `images` array against a sibling file-convention route. Inferred,
not confirmed: contributors without an avatar are the likelier case to actually surface the
archetype card, and a platform this size (6 real people, per `brief.md`) plausibly has several.
Either way, the archetype card was built with real engineering depth (~300 lines, a documented
four-attempt font-loading history) for exactly this rendering, so the intent is not in question
even where the routing precedence is.

**Comment** (`.../comment/[id]/opengraph-image.js`). Covered on its own below.

**Quote** (`.../quote/[slug]/opengraph-image.js`, wired from `quote/[slug]/page.js`). Renders quote
text and an author/source/year attribution line, nothing about any Dialecta member. `page.js` sets
`twitter: { card: 'summary_large_image', ... }`.

**So production did not choose one answer.** Contributor uses `summary`. Quote and Moment (below)
both use `summary_large_image`, the opposite of my defensive default. No code comment in either
file states why, so the following is my inference, not a read: both of those cards bake their full
text (the quote, the celebration line) directly into the rendered image via Satori, the same way
the comment card does. A card whose entire message already exists as pixels does not depend on the
platform separately rendering an `og:title` headline the way the article card does, so the specific
failure mode my research flagged, X dropping headline text on the large-image format, does not
threaten these two the way it would threaten a card that relies on text-below-image. That is a
real, legible counter-argument to a blanket `summary` default, and I did not have it when I filed
the original recommendation. It does not extend to a future comment-sharing UI on the same
reasoning, since that card also bakes in full text (see below), and it does not touch the article
card, which carries no baked-in text at all and is the one case my original reasoning was written
for.

## 2. The comment card against the legal and philosopher ruling

**Yes. The code that exists already does what `legal` and `philosopher` ruled out, in the one
surface built for it.** Read directly from `.../comment/[id]/opengraph-image.js`.

The route fetches a comment by id, then renders, in order: the comment body (clamped to 520
characters), the author's display name, the parent article title, and, in the footer, the
**discourse tier label** read straight off `TIER_LABELS`: `forum, spark, echo, fog, heat, stance,
breach`. That list matches the seven tiers in `.claude/skills/dialecta-voice/SKILL.md`'s reference
table exactly, so this is the same tier system legal and philosopher were ruling on, not an
unrelated or stale one. The footer format is literally `BY [NAME] · ON [ARTICLE] · [TIER]`, in
capitals. No rubric, no reasoning, no AI Classification Card, nothing a stranger could check the
label against.

This is precisely what legal's exchange answer named: "a tier word or an archetype name on it,
cached by Facebook at render time and effectively unpatchable after... is the collapsed-into-a-
bare-badge move this seat already flagged as trading the strongest merits argument for tidiness...
Off-platform it is worse still: no rubric, no Pact, no Editorial Voice framing for a stranger to
read it against, only a word about a named person"
(`exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md`). The
comment card is that description, already written, already runnable.

**Qualification, also read rather than assumed: nothing serves this today.** No
`comment/[id]/page.js` exists in the recovered tree, and the file's own header says so: "Theme
integration is deferred: comment-sharing UI doesn't exist in the discourse layer yet. The route is
ready for the day it does." Whoever built this built the pipe before the tap. The violation is real
in what was written, not yet real in what a stranger has seen.

**One more finding here, flagged as inferred risk rather than a confirmed bug.** `lib/get-comment.js`
gates visibility on exactly one field: `if (data.status === 'suppressed') return null`. Its own
comment explains why it is not stricter: real production comments have `hardened_at` populated but
`published_at` is never set, and the promotion pipeline does not move rows out of
`pending_review`, so any gate stricter than "not suppressed" would 404 every real comment. The
tier (`final_tier: 'breach'`) is fetched separately, from a different table (`classifications`),
purely for display. I did not find, in anything recovered here, a guarantee that a
`final_tier: 'breach'` comment's `status` is always also `'suppressed'`. Legal's own note describes
Breach on the discourse layer as a UI treatment, original text withheld, a notice shown in its
place, which is a different mechanism than a status flag. If tier and status can diverge even
briefly, this route as written would serve the original suppressed-worthy text next to the word
"Breach" to a stranger on Facebook. I read the gate; I did not read the classification pipeline
that would confirm or rule out the divergence, so this is a question to put to whoever owns that
pipeline, not a finding I can close myself.

## 3. What a moment is

Read from `lib/get-moment.js`, `contributor/[handle]/moment/[id]/page.js`,
`.../moment/[id]/opengraph-image.js`, and `MomentShareButtons.js`.

A moment is a row in a `celebration_events` table, one of eight event types: `first_comment,
first_article, first_quote, delta_acknowledged, tier_promoted, follower_milestone, became_steward`,
plus an unlabeled default. Each maps to a "kicker" (the small label), a "primary" (the actual
content snippet rendered large: the comment text, the article title, the quote, a follower count),
and an optional secondary line. The OG card bakes the real content into a 1200x630 editorial image,
with the contributor's own name rendered in one of nine hand-chosen script fonts (their
`signature_font`), an event-appropriate photo background (`BACKGROUND_MAP`), and a real Dialecta
logo. The landing page at `/contributor/<handle>/moment/<id>` embeds that same image as its hero,
so the click-through matches the share preview exactly.

The page carries a deliberate bot/human split I have not seen described elsewhere in this repo: a
user-agent allowlist (Facebook, Twitter, Slack, Discord, the major search crawlers, and more) sees
the celebration page so it can scrape the OG tags; anyone else, a real person who clicked the
share, is redirected server-side straight to the actual article on `www.dialecta.org`. `og:url` is
set to the apex article URL specifically so Facebook's displayed source line reads "DIALECTA.ORG"
rather than the Vercel preview domain, while the image itself still comes from the `dialecta-next`
deployment. Read plainly, not assessed: this is a real technical mechanism, worth someone besides
this seat forming a view on, since it means the domain a stranger sees on the card and the domain
that actually serves the request are not the same one.

Sharing itself is two link-outs (X intent, Facebook sharer) and a copy-link button, all
client-side, in `MomentShareButtons.js`. I read the post-click landing page and its share row. I
did not find, anywhere in this recovered tree, the upstream UI that first offers a contributor the
choice to share their own moment, so whether sharing is contributor-initiated by design, versus
something anyone with the link could trigger on someone else's achievement, is inferred from the
file's own framing ("the post-click landing for a celebration share") and from `shared_at` existing
as a column, not confirmed by a read.

**Is it worth having as a distribution surface?** On what is built, yes, and it is the closest thing
in this recovered tree to Dan's own "the share carries its own proof" logic extended from articles
to people: a real achievement, framed positively, apparently chosen by the person it is about. One
event type sits closer to the tier question than the rest: `tier_promoted` renders
`prior_tier -> new_tier` with no rubric either, the same mechanical shape as the comment card's
bare label, just applied to upward movement in a moment the contributor (on the inference above)
chose to share about themselves. That is a different consent posture than a quoted commenter's, and
I did not find an existing ruling from `legal` or `philosopher` that addresses this specific case.
Flagged as open, not resolved here.

## 4. The quote surface

Read from `quote/[slug]/page.js`, `.../quote/[slug]/opengraph-image.js`, `lib/get-quote.js`,
`lib/theme/dialecta-quotes-app.jsx` (932 lines), and `_recovered/api/_quote-admin.js`.

It is a curated quotation library, not user comments and not tied to the tier or fingerprint
system. `quotes` rows carry `quote_id, text, author, source, year, tags, status`. The public page
renders the quote in the editorial brass-and-cream register with a Schema.org `Quotation` JSON-LD
block for search, and links back to the apex site. `dialecta-quotes-app.jsx` is the admin and
browse UI, with three access tiers resolved client-side: anonymous visitors browse the live
library only, a signed-in member can suggest a quote (lands as a draft), and an admin
(`is_quote_admin` in Supabase, checked server-side in `_quote-admin.js`) can add, edit, archive,
and manage other admins, with an AI-assisted suggestion path (`aiSuggestQuotes`) in the mix. This
is a real, staffed content pipeline, not a stub.

**It is a distribution channel**, and on what I read, the cleanest of the four: nothing about a
named person's discourse quality, nothing that depends on the "is anyone actually arguing here"
problem `path-to-launch.md` already named as the binding blocker on sharing an article today. A
good quotation is true and shareable on day one, independent of whether the comments section has
anything in it yet.

**A correction, since precision here is this seat's whole job.** The task framing states the quotes
page has 7 visitors. I read `docs/SITE-INVENTORY.md` directly and could not find that number
attached to `quotes`. The 7-visitor figure on line 178 is stated about the **`write`** page ("It is
published, live, and had 7 visitors"), not quotes. The same document's Ghost-admin table (line 202)
lists `quotes` as one of three pages the snapshot missed, alongside `profile` and `Dev-Admin`, with
no visitor count given for any of the three. If the convener has a quotes-specific number from
Ghost admin directly, it did not come from either file I was told to read, and this file should not
be cited as confirming it.

## 5. What this does to the recommendation I filed

I said the first hour goes to sharing articles on Facebook, on the evidence that a shared article
is Dialecta's whole strategy and Facebook is the only channel with a measured, non-personal-network
return. That evidence still holds as evidence. What it did not account for, because this seat had
not read this tree yet, is that the shareable unit was never only the article. Someone had already
built and deployed distinct, engineered share surfaces for a contributor's identity, a contributor's
achievements, and a curated quotation, each with its own OG card, its own metadata, and in the
comment card's and the moment infrastructure's own words, a documented lineage ("OG-1" through
"OG-5") of hard-won fixes. That is not a small addendum to "share the article." It is a different
shape of answer to the same question this seat exists to ask.

The part worth carrying forward, stated plainly rather than argued: `path-to-launch.md` named live
discourse as the binding precondition before a first stranger's arrival is worth anything, because
an article without visible comments cannot deliver on its own promise. A quote card carries no such
precondition. Neither, on the inferred read above, does a moment, once a contributor has something
to celebrate. If either of those is real and safe to point strangers at, they are candidates for
arrival before Phase 4 closes the comments gap, not after. I am not recommending that today. I am
saying the constraint I described as singular is not, and the next revision of this seat's plan
owes that a real look rather than a footnote.

None of this reaches the comment card or the archetype card. Both stay exactly where `legal` and
`philosopher` already put them: not fit to ship as built, regardless of what arrival math they
might otherwise offer.

*Read 2026-09-20*
