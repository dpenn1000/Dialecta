# Google OAuth in Supabase Auth

**Source:** Supabase, "Sign in with Google", Supabase Docs (Auth guides, Social Login), read 2026-09-20. https://supabase.com/docs/guides/auth/social-login/auth-google

## Summary

Two integration shapes are documented. In the client-side (implicit) shape, `signInWithOAuth()` redirects the browser straight to Google and back. In the server-side (PKCE) shape, the same call returns a URL for the app to redirect to itself, and a callback route exchanges the returned code for a session with `exchangeCodeForSession(code)`. Google "does not send out a refresh token by default." Getting one, needed only if Dialecta calls Google's own APIs later and not for Supabase's own session refresh, requires passing `access_type: 'offline'` and `prompt: 'consent'` as query params into `signInWithOAuth()`. Nonce validation is on by default during the flow; the docs describe it as extra security that "can be disabled in production," without recommending that anyone do so. Separately, the docs recommend a custom auth domain: the default `<project-id>.supabase.co` "does not inspire trust and can make your application more susceptible to successful phishing attempts."

Account linking across providers lives on a companion page: https://supabase.com/docs/guides/auth/auth-identity-linking. It states that "Supabase Auth automatically links identities with the same email address to a single user," and that on a successful link, "Supabase Auth will remove any other unconfirmed identities linked to an existing user." Linking identities that do not share an email requires turning on manual linking (`GOTRUE_SECURITY_MANUAL_LINKING_ENABLED`) and calling `linkIdentity()` from an already-authenticated session.

Neither page states whether a Google identity's email has to carry Google's own `email_verified: true` before Supabase Auth treats it as eligible for automatic linking. That check matters elsewhere in the industry: a backend that trusts a signed OAuth ID token's email claim without checking `email_verified` separately is a known pre-account-takeover pattern, since a Google Workspace admin can mint a token carrying an email address the requesting user does not own. This sprint's reading found no Supabase-authored statement either confirming or ruling out that check for Supabase Auth specifically.

## Implies for Dialecta

- P0-D2 needs a decision on automatic linking, not only on which providers to offer. If Google is added alongside a password option, a contributor who signs up by password with an address and later signs in with Google using the same address is merged into one account by default, without a confirmation step.
- Whether that merge can happen with an unverified Google email is unconfirmed by the docs read this sprint. Test it directly against `mguulnibvzusfvyuowwh` with a Workspace test alias before shipping Google as a P0-D2 option.
- Pass `access_type: 'offline'` and `prompt: 'consent'` only if Dialecta ends up calling a Google API on a contributor's behalf. The current stack classifies comments through Anthropic, not Google, and does not need it.
- Put a custom domain in front of Auth before launch. Contributor-facing login on the raw `mguulnibvzusfvyuowwh.supabase.co` origin is the pattern the docs name as phishing-susceptible.

*Filed 2026-09-20*
