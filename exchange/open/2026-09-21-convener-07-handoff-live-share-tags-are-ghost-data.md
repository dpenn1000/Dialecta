---
id: 2026-09-21-convener-07
type: handoff
from: convener
to: [circulation]
subject: Live's share descriptions are Ghost data, not theme code; three excerpts to edit, and the card type cannot be fixed on Ghost
backlog: C0
state: open
opened: 2026-09-21
closed:
outcome:
---

## What was asked

`circulation` found that live's `og:description` and `twitter:description` carry article prose and
that live still sends `twitter:card` as `summary_large_image`, where `apps/web` already sends a short
written description and `summary`. The ask: find where live generates them, bring it in line, and
confirm which repo deploys to dialecta.org before editing anything.

## What deploys to dialecta.org

Nothing in this repository. The page is served by Ghost 6.64 (the `generator` meta tag, and an
`x-ghost-analytics` header) on Magic Pages, behind Cloudflare. Root `CLAUDE.md` lists "Ghost on Magic
Pages (`dialecta.mymagic.page`)" as the home of articles, members, pages and theme;
`.github/workflows/ci.yml` has no theme or Ghost step; and ADR-001 describes the theme as a zip
uploaded by hand. `_theme/` is a quarantined snapshot, not a deploy source. `dialecta-next.vercel.app`
serves only the share images.

So a fix on live is an edit in Ghost Admin, made by Dan. Nothing here was edited or uploaded.

## Where each tag comes from

| Tags | Source |
| --- | --- |
| `og:description`, `twitter:description`, `<meta name="description">`, the JSON-LD `description` | Ghost's `{{ghost_head}}`, from each post's `custom_excerpt`. The publish pipeline writes that field as "By {Name}. " plus the author's excerpt, so previews name the writer instead of the house staff user: `_recovered/api/article/submit.js:449-465` and `_recovered/api/_byline-excerpt.js`, with a one-time pass in `scripts/backfill-og-bylines.mjs`. The helper caps the result at 290 characters, cuts at a word boundary with an ellipsis, and falls back to the article's opening text when the author wrote no excerpt |
| `twitter:card`, twice | The theme, `_theme/default.hbs:56`, inside `{{#post}}` (Ghost matches static pages there too), and Ghost's own `{{ghost_head}}` at `:58` |
| `og:image` and `twitter:image`, twice each | The theme, `default.hbs:52-55`, pointing at `dialecta-next.vercel.app/article/<slug>/opengraph-image`, and Ghost's feature image from `{{ghost_head}}` |

The prefix is deliberate. The prose in the description is the fallback.

## What live serves now

Measured 2026-09-21 with `scripts/check-live-share-tags.py`, which reads the public pages.

| Article | `og:description` | Result |
| --- | --- | --- |
| On the Far Shore of Fear | 289 characters | The subtitle, a paragraph break, then the opening paragraphs, cut with an ellipsis |
| On Doubt and Devotion | 217 | A written summary that ends on a full sentence |
| Knowledge Without Borders | 283 | The opening text, cut mid-sentence with an ellipsis |
| The solar piece | 222 | A written summary that ends on a full sentence |
| The Moment You Stop Waiting | 282 | The opening paragraph, cut mid-sentence with an ellipsis |

`twitter:description` and the meta description match `og:description` on all five. `twitter:card` is
`summary_large_image` twice on all five. `apps/web` serves the Far Shore piece as 78 characters,
"A meditation on what humanity might become when survival stops being the point", with `summary`.

## The description: three excerpts in Ghost Admin

This is a data edit, not a deploy: the post, its settings (the gear), Excerpt. The same field is the
lede printed above the byline on live, so the edit also fixes the cut-off ledes. The publish
pipeline leaves any excerpt that already starts "By {Name}" alone on re-runs, so the edits hold and the
byline still reaches share previews.

Candidates, each from the article's own words. The copy is Dan's and the authors'.

- **Far Shore:** "By Daniel Pennington. A meditation on what humanity might become when survival stops being the point" (100 characters; the piece's own lede, the same line as `articles.excerpt`).
- **Knowledge Without Borders:** "By Rylie Pennington. Education should be free worldwide because everyone should have access to the same resources, regardless of money, to create equal opportunities." (169; the piece's first sentence).
- **The Moment You Stop Waiting:** this one wants a one-line summary from Kathryn. The stopgap is the opening lines on full sentences: "By Kathryn Pennington. I am not a spontaneous person. I follow the calendar. I live by structure and schedules."

Doubt and the solar piece need nothing.

## The card type cannot be fixed on Ghost

Every page checked carries `summary_large_image` from Ghost's own tag, including the home page, where
the theme adds none. Changing `default.hbs:56` to `summary` would leave Ghost's tag beside it, and which
one X reads is unknown; X retired its Card Validator, so the only test is posting. The remaining
levers are a Cloudflare rewrite rule or dropping every image from every post, and neither belongs on a
site that C0 replaces.

Recommendation: leave the card type until cutover, where `apps/web` already sends `summary`. If a theme
zip is uploaded for another reason, change line 56 in the same upload.

## Verification

```
python scripts/check-live-share-tags.py
python scripts/check-live-share-tags.py --app --host http://localhost:3050 on-the-far-shore-of-fear
```

The first reads live, the second the new app. Each prints the description's length and problems and the
card values, and exits 0 only when every article passes. Cloudflare caches these pages
(`cf-cache-status: HIT`), so an edited excerpt may take a while to show, or needs a purge. Facebook's
Sharing Debugger ("Scrape Again") refreshes its own copy.

## Not done

No Ghost Admin edit and no theme upload, both production and Dan's. `_theme/` is untouched.
`apps/web` is unchanged; it already meets the recommendation.

## For circulation

The standing recommendation should say the card type cannot be met on Ghost and is met at cutover.
It also needs a number for "short": this check uses 250, because the two summaries the authors wrote
run 217 and 222 characters.
