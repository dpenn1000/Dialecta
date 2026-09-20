# Sign in with X: email retrieval returned, then priced by the read

**Source:** X Developer Community, "Announcing support for email address retrieval with OAuth 2.0
in the X API v2," and X, "X API pay-per-usage pricing and credits," read 2026-09-20.
https://devcommunity.x.com/t/announcing-support-for-email-address-retrieval-with-oauth-2-0-in-the-x-api-v2/240555

## Summary

For years, Twitter's OAuth flow did not return an email address at all; getting one required a
special "Request email from users" permission that Twitter approved manually and granted rarely.
That changed under X. Per the developer-community announcement (posted April 3, 2025 by the
site's own indexing; this session's direct fetch returned HTTP 403, so the announcement's content
is read from search-indexed text, corroborated across three independent queries returning the
same specifics), the X API v2 now returns email through OAuth 2.0 using a `users.email` scope,
surfaced as a `confirmed_email` field on `GET /2/users/me`. The "Request email from users"
permission still has to be turned on for the app in the developer portal first; the gate moved
from Twitter-side manual approval to a self-service dashboard toggle, but a gate remains.

The field name implies X's own position that the address is confirmed, but this session found no
X-authored sentence defining what confirmed means or how it is established, unlike Google's
explicit `email_verified` boolean with a stated definition.

Operationally, X changed the most of any provider here. As of February 6, 2026, per X's own
pricing page (docs.x.com), pay-per-use replaced subscription tiers as the only path for a new
developer; there is no free tier to prototype in. Reading a resource costs $0.005, creating a post
costs $0.015 ($0.200 with a URL), and reads are capped at 3 million per monthly billing cycle
before Enterprise is required. The legacy Basic ($200 per month) and Pro ($5,000 per month) plans
were force-migrated to pay-per-use through 2026, Basic from June 1 and Pro from September 1. The
pricing page does not state whether OAuth 2.0 sign-in calls are billed under these same per-resource
rates or exempted from them.

X's API terms and pricing have changed repeatedly across 2023 through 2026. Treat everything above
as accurate to the date read, not as a stable baseline.

## Implies for Dialecta

- Of the four providers, X carries the least defined verification guarantee: `confirmed_email` has
  no stated definition, against Google's explicit `email_verified`.
- Confirm at implementation time whether authentication-only OAuth calls are billed under the same
  per-resource pricing as data reads; docs.x.com does not say either way, and the answer changes
  what "free to operate" means for this option.
- On both the verification-clarity axis and the operational-stability axis, this seat ranks X last
  among the four researched here, pending a re-read closer to build time given how often X's terms
  have moved.

*Filed 2026-09-20*
