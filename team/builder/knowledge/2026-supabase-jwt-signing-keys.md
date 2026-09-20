# Supabase asymmetric JWT signing keys and what getClaims() actually costs

**Source:** Supabase Docs, "JWT Signing Keys", https://supabase.com/docs/guides/auth/signing-keys
(read 2026-09-20), cross-checked against Supabase's "Introducing JWT Signing Keys" blog post and
GitHub discussion supabase/discussions#29289.

## Summary

Asymmetric signing keys (RSA or Elliptic Curve) replace the legacy single shared HS256 secret. A
private key, held only by Supabase Auth and never exposed, signs tokens; a public key, served from
a per-project JWKS endpoint (`https://<project-id>.supabase.co/auth/v1/.well-known/jwks.json`),
verifies them. Verification runs locally against that public key, with no call to the Auth server
on the verification path, which is the property that makes `getClaims()` cheap enough to call on
every gated request rather than something to ration. Supabase's edge servers cache the JWKS
response for 10 minutes, and client libraries cache it for another 10 minutes on top of that, so a
steady-state deployment pays for the JWKS fetch roughly once every 10 to 20 minutes per edge
location, not once per request. Legacy symmetric HS256 still requires the Auth server for
validation, and Supabase's own guidance calls it not recommended for production. Migration from
symmetric to asymmetric is a dashboard flow: "Migrate JWT secret" imports the legacy secret, a new
asymmetric standby key generates automatically, "Rotate keys" activates it, and the legacy secret
can be revoked once tokens signed under it have expired (the documented example window is 1 hour
15 minutes). Keys carry a lifecycle state, Active, Standby, Previously used, or Revoked, which is
what supports rotation without an availability gap.

## Implies for Dialecta

- The existing practice, "server code decides authorization on `getClaims()`," now has a
  performance argument behind it and not only a correctness one: local verification against a
  cached JWKS is not a network call on the hot path, so there is no cost reason to fall back to
  the unverified `getSession()` read for anything gate-worthy.
- Whether the Dialecta Supabase project (`mguulnibvzusfvyuowwh`, per the `types` script in root
  `package.json`) is already on asymmetric keys or still on the legacy shared secret is a
  dashboard fact, not a docs fact. P0-4 should confirm this before writing the auth wiring;
  `getClaims()` reads the same code path either way, but the "no network call" property only holds
  under the asymmetric path.
- The 10-plus-10-minute JWKS cache window means a just-rotated key can take close to 20 minutes to
  be honored everywhere. A "revoke immediately" incident response has a real propagation delay to
  plan around, not an instant cutover.

*Filed 2026-09-20*
