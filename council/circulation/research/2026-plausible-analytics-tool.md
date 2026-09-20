# Plausible Analytics: the measurement Dialecta loses the day it leaves Ghost

**Source:** GitHub API, unauthenticated,
`https://api.github.com/search/repositories?q=self-hosted+privacy+analytics+lightweight&sort=stars&order=desc&per_page=10`,
fetched 2026-09-20. Top result: `plausible/analytics`, 29,164 stars, last pushed 2026-09-17 (three
days before this search), not archived, AGPL-3.0 (self-hosted core; a paid Plausible Cloud tier
also exists and is not priced in this note).

## Summary

Open-source, cookie-free, first-party web analytics built as a privacy-respecting alternative to
Google Analytics. Self-hostable under AGPL-3.0, actively maintained, by a wide margin the most
starred and most recently active repository in this search category. Nothing else returned came
close on adoption or recency; the nearest competitor (`Swetrix/swetrix-js`, 175 stars) is archived.

## Implies for Dialecta

Every number in `2026-dialecta-funnel-correction.md` and
`council/treasurer/research/2026-ghost-native-analytics-all-time.md` comes from Ghost's native
analytics. Treasurer's own research (`2026-ghost-magicpages-hosting.md`, ADR-001) already commits
Dialecta to leaving Ghost. A direct check of `apps/web/src` on 2026-09-20 found no analytics
integration anywhere in the rebuild. Nobody has named what replaces arrivals-by-source measurement
once Ghost is gone, and that measurement is this seat's first standing ask under its own charter.

Plausible is a real, maintained, licence-clear candidate: self-host it for infrastructure cost
only, or use Plausible Cloud at a tier not yet priced here (flagged for `treasurer`, not decided by
this note). Either way, this is a gap worth naming before the Ghost migration ships silent, not
after arrival data goes dark a second time.

*Filed 2026-09-20*
