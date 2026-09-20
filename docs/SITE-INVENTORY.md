# What the website actually is

*Swept 2026-09-20 by the convener, at Dan's instruction, after four separate things turned out to
already exist during one day's work: the Underwriter tier model, the canonical axis mapping, a
UNIQUE constraint added in April, and the Pact. Each time a search had stopped one pointer short.
This exists so the next search starts from a map.*

**Everything below is measured.** Word counts from the snapshot, line counts from disk, table
counts from the live database.

## The one-paragraph answer

Dialecta exists in **four layers that do not match each other**. A live site whose pages live in a
Ghost theme that is in no repository. An API of 52 files recovered from a Vercel artifact. A
library of 14,714 lines of prototypes in `components/`. And a Next.js rebuild in `apps/web` that
covers about a third of the live page set. The gap that matters most is the theme: **page markup
and layout exist nowhere we control.**

---

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

**1. The theme is the real gap.** Page markup and layout exist in Ghost, in no repository here.
The snapshot preserves the words. `components/` preserves the design of eight surfaces. Neither
preserves the pages. Retiring Ghost without the theme means rebuilding every page's structure from
prose and prototypes, and nobody has costed that because nobody had noticed it.

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
