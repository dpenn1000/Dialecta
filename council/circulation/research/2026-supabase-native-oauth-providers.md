# Reddit is not a native Supabase Auth provider; Facebook and X are

**Source:** supabase.com/docs/guides/auth/social-login, fetched 2026-09-20. Primary, vendor
documentation, used here for a factual provider list rather than any conversion or security claim.
Cross-checked against `council/security/positions/2026-09-20-social-login.md`, which reads the
`supabase/auth` source at commit `2e9ce6c8` for the same provider set from the identity-linking
angle and independently lists Facebook and Twitter/X among the roughly 20 built-in providers
without listing Reddit among them either.

## Summary

Supabase Auth ships 19 native social providers with dedicated setup guides: Apple, Azure, Bitbucket,
Discord, Facebook, Figma, GitHub, GitLab, Google, Kakao, Keycloak, LinkedIn, Notion, Slack, Spotify,
Twitter, Twitch, WorkOS, Zoom. Facebook and Twitter/X are both on that list. Reddit is not.

Reddit does have an OAuth2 identity flow (the `identity` scope, `GET /api/v1/me`), but it is built
and documented as API access for apps that read or act on a user's Reddit account (bots, clients,
scrapers), not packaged or marketed as a consumer "sign in with X site" button the way Google,
Facebook, Apple and X are. Adding it to Dialecta would go through Supabase's generic Custom
OAuth/OIDC path, supplying the authorization, token and userinfo endpoints by hand, rather than
checking a box in the dashboard the way the 19 native providers work.

## Implies for Dialecta

- Reddit login is not "one more provider on the same list." It is a different, heavier build than
  Google, Facebook or X, before any question of whether it is a good idea is even asked.
- This seat's own funnel data (`2026-dialecta-funnel-correction.md`) shows zero measured Dialecta
  arrivals from Reddit, against Facebook's 54. There is no "the audience is already there" case for
  Reddit the way there is arguably one for Facebook. A channel Dialecta has never received a single
  visitor from is a strange place to spend a custom OAuth integration.
- `builder` and `security` should read this before costing any Reddit option; the build line and
  the identity-linking analysis both change shape once Reddit leaves the native-provider list.

*Filed 2026-09-20*
