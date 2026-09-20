# What the website actually is

*Swept 2026-09-20 by the convener, at Dan's instruction, after four separate things turned out to
already exist during one day's work: the Underwriter tier model, the canonical axis mapping, a
UNIQUE constraint added in April, and the Pact. Each time a search had stopped one pointer short.
This exists so the next search starts from a map.*

**Everything below is measured.** Word counts from the snapshot, line counts from disk, table
counts from the live database.

## The one-paragraph answer

**Rewritten 2026-09-20 after exporting the Ghost theme, which overturned most of the first
version.** Dialecta's live site is a **React application served through Ghost as mount points**,
not a Ghost blog with custom pages. The theme holds 15 Handlebars templates, a 3,286-line
stylesheet and **nine minified React bundles totalling about 2.5 MB**. The API behind it is 52
files recovered from a Vercel artifact. `apps/web` is a Next.js rebuild covering a third of the
page set. The gap is no longer the theme, which is now in hand. **The gap is the React source**,
which exists in this repository only as an unproven candidate.

## Layer 1: the live site

Snapshotted 2026-09-08 into `docs/reviews/site-snapshot-2026-09-08/`. **Text only**, no markup.

| Page | Words | Prototype in `components/` | Built in `apps/web` |
| --- | --- | --- | --- |
| `stewards` | 2,502 | `dialecta-s13-stewards.html`, 903 lines | **no** |
| `guidebook` | 2,161 | `dialecta-guidebook.html`, 495 lines | stub |
| `pact` | 1,204 | `dialecta-pact.html`, 1,411 lines | stub, 11 lines |
| `fingerprint` | 893 | `dialecta-fingerprint.jsx`, 2,595 lines | **no** |
| `about` | 732 | none | **no** |
| `home` | 346 | none | yes |
| `articles` | 346 | none | yes, `[slug]` only |
| `community` | 258 | `dialecta-discourse-layer.jsx`, 692 lines | stub |
| `write` | 22 | none | **no** |

Plus five published articles, 453 to 2,602 words each.

**`write` is 22 words.** Either it is gated behind auth and the snapshot caught the gate, or the
authoring surface never shipped. Nobody has established which.

## Layer 2: the API, recovered

`_recovered/`, 163 files pulled from Vercel deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`.
Quarantined and gitignored. **52 files under `api/`: 38 real routes, 14 shared helpers.** The 38
average 289 lines.

**It contains no page templates.** Zero `.hbs`, zero `.html`. The artifact is handlers, scripts,
migrations and config.

## Layer 3: the prototypes

`components/`, **14,714 lines**, and the least-referenced asset in the project.

| File | Lines | What it is |
| --- | --- | --- |
| `dialecta-fingerprint.jsx` | 2,595 | The fingerprint. Petals, rings, wave texture, smoothing, a full palette |
| `dialecta-profile-mobile.jsx` | 2,480 | The profile, phone |
| `dialecta-profile.jsx` | 2,463 | The profile, desktop |
| `dialecta-pact.html` | 1,411 | The Pact, eight sections and the tier-reading exercise |
| `dialecta-growth-scroll-v5.jsx` | 1,181 | The Growth Scroll, at v5 |
| `dialecta-s13-stewards.html` | 903 | Stewards |
| `dialecta-dashboard.jsx` | 787 | A dashboard |
| `dialecta-fingerprint-engine.jsx` | 780 | The fingerprint's compute half, separate from its render half |
| `dialecta-discourse-layer.jsx` | 692 | The comment and discourse surface |
| `dialecta-opinion-map-briefing.html` | 674 | Opinion maps |
| `dialecta-guidebook.html` | 495 | The guidebook |
| `dialecta-delta-mechanic.html` | 139 | The Delta mechanic |
| `dialecta-profile-responsive.jsx` | 114 | A responsive shim |

**This corrects a claim in ADR-004 and it is my error.** That ADR says the fingerprint has no
visual language, that the design spec carries no petal token, and that the ADR itself would be the
first thing to define one. The design *spec* does not. A 2,595-line prototype does, and it already
holds the wave texture the Contributor Identity doc describes, smoothing, per-axis ring counts, and
`#200404`, which is `--tier-breach-bot` from the tier palette. The Breach residual is an addition
to an existing visual language, not the founding of one.

## Layer 4: the rebuild

`apps/web`, as of 2026-09-20 after today's work.

| Route | State |
| --- | --- |
| `/` | built |
| `/articles/[slug]` | built, sanitized |
| `/login` | **built today**, magic link plus Google |
| `/auth/callback` | **built today** |
| `/community`, `/guidebook`, `/pact`, `/profile/[id]` | stubs |
| `/api/health` | built |
| `sitemap.ts`, `robots.ts`, `opengraph-image.tsx` | **built today** |
| `middleware.ts` | **built today** |

Missing entirely against the live set: **`about`, `fingerprint`, `stewards`, `write`.**

---

## What this sweep found that nobody was looking for

**1. The theme is no longer the gap. The front-end source is.** The theme is exported to `_theme/`,
gitignored, 42 files. It contains every page template, including `page-pact.hbs` at **1,854 lines**,
larger than the 1,411-line prototype. What it does not contain is the source of the nine React
bundles it loads. `assets/js/home.js` is 440 KB of minified React, and `page-profile.hbs` is a
23-line mount whose own comment points at an `index.jsx` that is in neither the theme nor this
repository. `components/*.jsx` is the obvious candidate and **is unproven**: the bundles are
minified, so a name search across them proves nothing in either direction. This is the same shape
as the lost API source, one layer up, and it should be established rather than assumed.

**2. `articles` has no content columns.** The live table is
`id, ghost_post_id, author_member_id, status, declared_tier, ai_suggested_tier, final_tier,
declaration, ai_analysis, stage_2_5_choice, author_note, wait_until, created_at, updated_at,
original_html, polish_level, polish_options, polish_change_log`. No `slug`, no `title`, no
`excerpt`, no `body_html`. **It is a classification sidecar for Ghost posts.** `apps/web`'s
`lib/articles.ts` queries columns that do not exist, so the article page has never worked against
live.

**3. `stage_2_5_choice` exists, on articles.** `spec-reader` found four documents citing a Stage
2.5 defined nowhere and concluded it existed in no spec. It exists in the live schema, on the
article side. The four documents assumed a comment-side one, which is why nobody could find it.

**4. The prototype and the live page have already diverged, and not only in markup.** Found by
`voice-editor` during the Pact review and verified: `components/dialecta-pact.html` line 1311 is
`<button class="brass" id="commitBtn" ...>I Understand - Enter</button>`, joined with an em dash.
That string appears **zero times** in the live snapshot. So the two artifacts differ in copy, not
merely in how much structure a text scrape flattens, and this inventory's habit of treating a
prototype as the design of a live page is only sometimes safe. Where a prototype and a snapshot
both exist, neither is authority for the other.

**5. The prototypes are the most valuable unread asset here.** 14,714 lines, referenced by nothing
in today's work until this sweep. Two of them, the fingerprint and its engine, are a complete
design for a surface the Council spent an afternoon deciding policy about.

---

## What is still unknown

- **Does Dan have the Ghost theme?** Everything about the page-rebuild cost turns on this.
- **Is `write` gated or unbuilt?** 22 words does not distinguish them.
- **Where does article content live after Ghost?** No table holds it today.
- **Are the prototypes current?** `growth-scroll-v5` implies four earlier versions. Nothing dates
  them and none is referenced by `apps/web`.

---

## Layer 0: the Ghost theme, exported 2026-09-20

Dan authorised the export from Ghost admin. `dialecta-theme v1.0.0`, 3.35 MB zipped, unpacked into
gitignored `_theme/`. 42 files: 15 `.hbs`, 9 `.js`, 14 `.png`, 1 `.css`, 1 `.jsx`, 1 `.json`,
1 `.cjs`. **This is the layer the first version of this document said existed nowhere.**

**The templates split into two kinds**, and the split is the finding.

| Server-rendered content | Lines |
| --- | --- |
| `page-pact.hbs` | **1,854** |
| `page-stewards.hbs` | 1,630 |
| `post.hbs` | 1,174 |
| `default.hbs` | 970 |
| `page-guidebook.hbs` | 686 |
| `page-about.hbs` | 593 |
| `page-fingerprint.hbs` | 393 |
| `page-articles.hbs` | 149 |
| `index.hbs` | 72 |

| React mount points | Lines | Bundle it loads |
| --- | --- | --- |
| `page-write.hbs` | 39 | `editor.js`, 327 KB |
| `page-dev-admin.hbs` | 31 | `dev-admin.js`, 241 KB |
| `page-quotes.hbs` | 27 | `quotes.js`, 215 KB |
| `page-community.hbs` | 24 | `community.js`, 239 KB |
| `page-profile.hbs` | 23 | `home.js`, 441 KB |
| `page-notifications.hbs` | 16 | `notifications.js`, 197 KB |

Plus `shell.js` at 284 KB and `post.js` at 358 KB, loaded by the content pages.

**This explains three earlier mysteries at once.**

`write` reads as 22 words in the snapshot because it is a 39-line mount; a text scrape catches the
shell and never the app. It is published, live, and had 7 visitors.

`profile` is the most-visited page on the site at 44 unique visitors, absent from the snapshot and
absent from `apps/web`, because it is a mount point rendering a React profile the scrape could not
see.

And `page-profile.hbs` carries `data-member-id="{{@member.uuid}}"`, which is the Ghost session
injection `builder` identified as the foundation of `api/comment.js`'s trust model. **It is right
there in the template, and it disappears with Ghost.**

## The design spec is not what the live site uses

`design/dialecta-design-spec.html` defines **28 `--tier-*` tokens**. The live stylesheet,
`_theme/assets/css/style.css` at 3,286 lines, defines **zero** of them.

`designer` found that the Pact prototype forks from the spec under renamed variables. The truth is
larger: **the live site does not consume the design spec at all.** The spec describes a system
production does not implement, which means the Heat and Stance ink corrections reach `apps/web` if
it adopts the spec, and reach nothing that is live today.

## What the Ghost admin says, measured 2026-09-20

| | |
| --- | --- |
| Pages | **11**, all published. The snapshot captured 9 and missed `profile`, `quotes` and `Dev-Admin` |
| Most visited | `profile`, 44 unique visitors, nearly double the next |
| Tiers | **Free $0 only. Stripe is not connected.** The Silver and Gold in the signup portal are Ghost's generic preview, not configuration |
| Staff | Dan as Owner, **1 Author, 2 Invited** |
| Newsletter | `Dialecta`, **10 subscribers, 2 delivered** |
| Analytics | **Tinybird**, cookie-free and first party. This is what vanishes at cutover |
| Active theme | `dialecta-theme v1.0.0` |
