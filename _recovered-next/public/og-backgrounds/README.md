# OG Background Library

Curated background photos that the OG-card generator can render under
the brass-and-cream text overlay. Currently used by celebration cards
(`/contributor/<handle>/moment/<id>/opengraph-image`); architecture
ready to extend to other OG card types if/when wanted.

## How it works

When the celebration OG card route renders for a given event type, it
looks for a matching JPG in `celebration/<event_type>.jpg`. If
present, the image is drawn as the card's background layer, with a
subtle dark vertical gradient overlay for text legibility. If absent,
the card falls back to the flat cream background that OG-1..OG-4 use.

This means you can drop in photos one at a time, ship each immediately,
and never break a card by deploying without art assets.

## Asset specs

- **Format:** JPG (smaller files than PNG for photographic content)
- **Dimensions:** 1200x630 (matches OG card size, 1.91:1 aspect)
- **File size:** ~150 KB max per image (Vercel function bundle stays
  small; OG endpoint stays fast). Use `mozjpeg` quality 75-82 for the
  sweet spot of size vs. quality.
- **Color palette:** brass / amber / cream tones work best; cool
  blues and greens fight the brand. Aim for natural light, soft
  shadows, low-saturation. Think editorial photography, not stock.
- **Composition:** allow a left-aligned 800x500 "safe zone" where text
  will overlay; keep faces and high-detail subjects toward the right
  third. The text gradient darkens the left side.
- **No people unless deliberately abstract** (back-of-head, silhouette,
  hands). Specific identifiable individuals create attribution issues.

## Naming convention

```
celebration/
  first-comment.jpg        # warm welcome tone
  first-article.jpg        # writing / composition
  first-quote.jpg          # library / curation
  delta-acknowledged.jpg   # connection / shift
  tier-promoted.jpg        # ascent / unfolding
  follower-1.jpg           # one (single subject)
  follower-10.jpg          # gathering (small group)
  follower-100.jpg         # community (larger gathering)
  became-steward.jpg       # gold / ceremony / weight
```

The card route uses `<event_type>.jpg` directly. For
`follower_milestone` events specifically, the route picks the closest
threshold below the count (1, 10, or 100).

## Status

Empty as of OG-5 Push 1. Backgrounds will be curated and dropped in
during Push 2 or after launch as taste settles.
