# The share-card and sitemap tools this sprint went looking for already ship inside Next.js

**Source:** Next.js official documentation, nextjs.org/docs (primary, version 16.3.5 at fetch
time; apps/web runs 15.5.25 per `apps/web/package.json`, checked directly 2026-09-20), cross-checked
against two GitHub API searches: `q=og-image+open-graph+card+generator` and
`q=nextjs+sitemap+structured-data`, both `sort=stars&order=desc&per_page=10`, fetched 2026-09-20.

## Summary

**The GitHub searches came back thin.** The top OG-image-generator result had 17 stars; most had
0, several read as single-purpose or AI-generated side projects with no adoption signal. The
sitemap/structured-data search topped out at 134 stars for a tool aimed at AI answer-engine
optimisation rather than sitemaps as such, with sitemap-specific tools in the single digits to low
dozens of stars. Neither category has a tool worth adopting, and the reason turns out to be
structural rather than a gap in the search.

**Next.js already ships both features as first-party, file-convention APIs**, confirmed directly
against Next's own docs: `ImageResponse` (`next/og`), for generating share-card images from JSX
and CSS at request or build time, shipped since v13.0.0 (moved from `next/server` to `next/og` in
v14.0.0); and the `sitemap.(xml|js|ts)` file convention, shipped since v13.3.0. Both predate
apps/web's current Next.js version (15.5.25) by several majors. `ImageResponse`'s own default
output size is 1200x630, the same convention the Open Graph spec itself declines to mandate (see
`2026-opengraph-and-x-card-share-surface.md`).

A direct check of `apps/web/src` on 2026-09-20 found no `sitemap`, `robots`, or `opengraph-image`
file anywhere in the tree.

## Implies for Dialecta

The finding is not "adopt a tool." It is that the job does not need one: both capabilities already
exist in the framework Dialecta runs, unused, at zero new dependency cost. This is a
`builder`/`spec-reader` scheduling item, not a research gap, and it is filed here so the next
person who runs this exact GitHub search does not spend the round trip again. Outside this seat's
folders to build; naming it is as far as this note goes.

*Filed 2026-09-20*
