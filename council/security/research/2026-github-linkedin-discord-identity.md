# GitHub, LinkedIn and Discord as alternative providers, a quick check

**Source:** GitHub, "REST API endpoints for emails," GitHub Docs, read 2026-09-20.
https://docs.github.com/en/rest/users/emails. Also LinkedIn, "Sign In with LinkedIn using OpenID
Connect" (Microsoft Learn), and Discord's `discord-api-docs` issue tracker, same date.

## Summary

GitHub's `/user/emails` endpoint, gated by the `user:email` scope, returns an array of
`{email, primary, verified, visibility}` objects with an explicit `verified` boolean per address,
a real verification signal in GitHub's own vocabulary. The single `email` field on plain
`GET /user` can be null for a user who keeps their address private, and GitHub's own ecosystem has
documented OAuth libraries that wrongly assume that field is always present and always verified.
An integration needs to call `/user/emails` directly rather than trust the convenience field. No
review process gates a GitHub OAuth App; it works immediately after registration.

LinkedIn's own docs (Microsoft Learn-hosted, dated 2024-08-08) offer `openid profile email`
through a product, "Sign in with LinkedIn using OpenID Connect," that must be requested for the
app via LinkedIn's Developer Portal before use, a lighter version of app review. Both `email` and
`email_verified` are documented as optional fields that "may not be included in all responses."
LinkedIn's own page adds a direct disclaimer: "Sign In with LinkedIn using OpenID Connect does not
verify user identities and should not be marketed as such." That statement runs against a
secondary claim found elsewhere this session that a LinkedIn email is always verified; LinkedIn's
own primary text is the one to trust.

Discord requires its `email` scope to return an email address at all. Discord's own issue tracker
(`discord/discord-api-docs`) carries open, acknowledged reports that its documentation is
inconsistent about which scope gates the `verified` boolean on the user object, a rare
case of a provider's own repository flagging its docs as unreliable on the exact question this
research asks.

None of the three fits the founder's "familiar credentials" framing as well as Google, Facebook,
or X for a general discourse audience.

## Implies for Dialecta

- If P0-D2 ever considers a fifth provider aimed at a technical audience, GitHub is the cleanest
  of these three on the verified-email question: an explicit boolean, well documented, no review
  gate.
- Do not describe LinkedIn sign-in as identity-verified in any Dialecta-facing copy. LinkedIn's
  own docs disclaim exactly that, and the platform's voice rules already forbid a claim the reader
  cannot verify.
- Discord's verified-field scope behavior needs a direct test against a real app before Dialecta
  relies on it; this note only establishes that Discord's own documentation disagrees with itself.

*Filed 2026-09-20*
