# RFC 9700: the OAuth 2.0 security floor, and it is final, not a draft

**Source:** IETF, "RFC 9700: Best Current Practice for OAuth 2.0 Security," read 2026-09-20.
https://www.rfc-editor.org/rfc/rfc9700.html

## Summary

RFC 9700 reached Best Current Practice status in January 2025, filed as BCP 240, updating RFCs
6749, 6750, and 6819 with the practical attack experience gathered since OAuth 2.0's original
publication. This is a finished document rather than a draft, which settles the task's open
question directly.

On PKCE (Section 2.1.1): mandatory for public clients, "Public clients MUST use PKCE to this
end," and recommended rather than mandatory for confidential clients, "the use of PKCE is
RECOMMENDED, as it provides strong protection." A server-side app that holds its own client
secret is a confidential client, so PKCE is a strong recommendation there rather than an absolute
requirement, though using it regardless costs little and closes the gap below.

On redirect URI validation (Sections 2.1 and 4.1.3): exact string matching, full stop,
"authorization servers MUST utilize exact string matching except for port numbers in localhost
redirection URIs of native apps." No wildcard or prefix matching survives this document.

On the `state` parameter (Sections 2.1.3 and 4.7.1): its role changed rather than disappeared.
PKCE can substitute for `state` as CSRF protection, but only once the client has confirmed the
authorization server supports PKCE: "Clients MUST ensure that the authorization server
supports PKCE before using PKCE for CSRF protection. If an authorization server does not support
PKCE, state or nonce MUST be used." OpenID Connect flows can rely on `nonce` for the same purpose
instead.

The document also deprecates the Implicit grant and the Resource Owner Password Credentials grant
outright, and recommends sender-constrained tokens, DPoP or mutual TLS, where practical.

## Implies for Dialecta

- `2026-supabase-ssr-server-auth-methods.md` already confirms Supabase drives PKCE server side.
  Confirm at build time that Supabase's authorization-server integration for each P0-D2 provider
  negotiates PKCE rather than falling back silently, since RFC 9700 makes that fallback
  the exact condition under which `state` becomes mandatory again.
- Whatever redirect URI Dialecta registers in each provider's console must match the callback
  route exactly, scheme and path both, with no trailing-slash or query-string variance.
- Treat this RFC as the standard to measure any provider quickstart or library sample against, not
  as one opinion among several. Where a sample departs from it, an implicit-flow snippet, a
  client-side-only redirect check, the RFC wins.

*Filed 2026-09-20*
