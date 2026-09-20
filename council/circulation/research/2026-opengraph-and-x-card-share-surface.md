# Open Graph is a real spec; X's card rendering currently is not stable enough to plan around alone

**Source:** Open Graph protocol, ogp.me (primary specification, Open Web Foundation Agreement
v0.9), fetched 2026-09-20. X's own Card documentation at developer.x.com returned HTTP 402
Payment Required to this session on the same date and could not be read; the X-specific claims
below come from secondary reporting and one independent commentary piece, both marked as such.

## Summary

**Open Graph, from the primary spec.** Four tags are required on any page: `og:title`, `og:type`,
`og:image`, `og:url`. Relevant optional tags for an article: `og:description`, `og:site_name`,
`article:author`, `article:published_time`, `article:section`. Structured image data is available
(`og:image:width`, `og:image:height`, `og:image:alt`), but the spec itself states no recommended
image size or aspect ratio. 1200x630 is an industry convention the spec does not mandate. The spec
does not describe how any platform renders this data into a card. That part is entirely up to each
platform and unspecified.

**X/Twitter Cards, from secondary sources only.** `twitter:card`, `twitter:title`,
`twitter:description`, `twitter:image`, `twitter:site`, `twitter:creator` are the tags. Per
multiple developer references, X falls back to a page's Open Graph tags when twitter-specific tags
are absent, so an OG-only page still gets a card. Two card shapes: `summary` (small square image,
headline and description shown) and `summary_large_image` (large rectangular image).

**The part that matters for the share strategy: X's rendering of the large-image card has not been
stable.** Multiple independent outlets (TechCrunch, 9to5Google, Social Media Today, corroborating
each other) document X removing headline text from `summary_large_image` cards in October 2023,
restoring it in November 2023, and flipping it again in January 2024, under Musk's direct,
publicly stated involvement. One independent commentator (Thomas Fine, Substack, dated within
2026, an opinion piece, marked as such and not independently confirmed by this session) states the
current behaviour is that large-image cards show only the preview image with the site name
overlaid, no headline or description text, and recommends switching to the smaller `summary` card
type specifically to guarantee the headline still renders. **This specific claim needs a live
check before anyone relies on it**, since it comes from one non-platform source, but the
instability it describes is independently well documented regardless of exactly where the toggle
sits today.

**X also retired its official Card Validator in 2022** (cards-dev.twitter.com deprecated,
confirmed via X's own developer community forum plus secondary reporting) and has not replaced
it. **Facebook's Sharing Debugger is confirmed still operational**
(developers.facebook.com/tools/debug/, first-party, free) as of 2026-09-20.

## Implies for Dialecta

- The mechanical build is simple and not in dispute: `og:title`, `og:description`, `og:image`,
  `og:url` on every article covers Facebook and, via fallback, X. That is a build task, not a
  research gap.
- **Add `twitter:card` set to `summary` rather than leaving it unset or defaulting to
  `summary_large_image`, specifically because the headline is the proof the share strategy
  depends on, and the large card format is the one X has repeatedly stopped showing a headline
  on.** This is one defensive default, not a design preference. `designer` still owns the card's
  actual look.
- Test every card on Facebook's Sharing Debugger before trusting it. There is no first-party
  equivalent for X any more, which means X is now a platform Dialecta can post to but cannot
  verify against before posting. That is a real cost of relying on it, worth naming out loud
  rather than discovering the first time a card posts wrong.
- Opened as a joint question with `designer` and `legal` in
  `exchange/open/2026-09-20-circulation-01-blindspot-share-card-off-platform-exposure.md`, since
  what the card may say about a named person is neither a spec question nor a look question.

*Filed 2026-09-20*
