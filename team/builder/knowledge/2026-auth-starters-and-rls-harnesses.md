# Supabase-auth Next.js starters and RLS test harnesses: thin ecosystems, judged

**Source:** GitHub Search API (`api.github.com/search/repositories`), read 2026-09-20.

## Summary

Two separate searches, both come back thin.

Supabase Auth plus Next.js App Router starters: the highest-starred results
(`mryechkin/nextjs-supabase-auth`, 283 stars, MIT, last pushed 2025-12-30;
`dabit3/supabase-nextjs-auth`, 152 stars, no license file, last pushed 2021-07-30) are either stale
(dabit3's has not moved in five years) or thin sample projects rather than production-grade
starters. None of the results are owned by the `supabase` or `vercel` GitHub orgs. Most carry no
LICENSE file at all, which defaults to full copyright reservation rather than permission to reuse
the code even as reference. None target the exact combination this repo needs: `@supabase/ssr`
(not the older auth-helpers package many of these predate), App Router, and magic link plus Google
per ADR-002.

RLS test harnesses: every result is under 30 stars. `constructive-io/supabase-test-suite` (23
stars, MIT, pushed 2026-09-15) and `pgrls/pgrls` (26 stars, MIT, pushed 2026-09-17, a static
analyzer with 67 lint rules rather than a runtime test harness) are the freshest and most
Supabase-specific. Neither has the adoption yet to trust as a dependency. The one mature, widely
adopted option in this space predates the "Supabase RLS" framing entirely: `theory/pgtap` (1,166
stars, 56 open issues, no declared license, last pushed 2026-08-23), a general Postgres
unit-testing framework that has been the de facto standard for testing Postgres functions and
policies for years. `usebasejump/supabase-test-helpers` (131 stars, MIT, last pushed 2024-05-15) is
a thin convenience layer of Supabase-specific assertions on top of pgTAP, not a competing
framework.

## Implies for Dialecta

- Do not adopt a third-party starter for P0-4. The existing `2026-supabase-ssr-nextjs-auth.md`
  note, sourced from Supabase's own current docs, is a better and more current base than anything
  this search found; none of the community starters beat reading the official guide and writing it
  for this repo's own shape.
- For RLS testing, pgTAP is the safer default despite its age and open-issue count, because it is
  the only option here with real, sustained adoption. `supabase-test-helpers` is worth pulling in
  alongside it for the Supabase-specific assertion helpers, but its own last push, 2024-05-15, is
  over two years stale relative to today, so treat it as a convenience layer to vendor selectively
  rather than a dependency to trust blindly.
- `pgrls` and `constructive-io/supabase-test-suite` are worth a second look in another sprint or
  two. Both were pushed within the last week, but a two-week-old tool with under 30 stars is
  exactly the bus-factor risk this sprint was told to weigh, not yet a recommendation.

*Filed 2026-09-20*
