# Supabase Passkey Authentication

**Source:** Supabase, "Passkey authentication", Supabase Docs (Auth guides), read 2026-09-20. https://supabase.com/docs/guides/auth/passkeys

## Summary

Supabase Auth does now natively support passkeys, built on WebAuthn, as of a beta announced in a changelog entry dated 2026-05-28 (https://supabase.com/changelog/46458-passkeys-for-supabase-auth-beta). Earlier Supabase documentation and community discussion described passkeys as unsupported; that is no longer accurate as of this sprint's read.

Support is explicit about not being a stable default: "Passkey support is experimental. The API may change without notice. You must explicitly opt-in when creating the Supabase client," set through an `experimental.passkey` flag. It requires a minimum SDK version: `@supabase/supabase-js` v2.105.0 or later (Flutter v2.15.0+, Swift v2.48.0+). It uses the platform's own WebAuthn implementation underneath: the browser's `navigator.credentials.create()` for registration and `navigator.credentials.get()` for sign-in, against a three-step server flow (Options, Ceremony, Verify). Supabase Auth stores only the public key returned by that ceremony; private key material stays with the user's authenticator (Face ID, Touch ID, Windows Hello, or a hardware key), and discovery-based credentials mean a user does not have to type an email or username first.

Two population limits are stated directly: "SSO users cannot register passkeys," and "Anonymous users cannot register passkeys," the latter because "registering a passkey requires an existing, confirmed, non-anonymous user." The Relying Party ID (RP ID) is bound to the domain at registration time: "Changing the RP ID makes every existing passkey unusable for sign-in, and users will need to register a new one."

The documentation read this sprint does not state whether a passkey-based sign-in is reported as `aal1` or `aal2` in the session JWT. That was specifically checked for and not found.

## Implies for Dialecta

- Passkeys are a legitimate option to name in the P0-D2 decision, alongside Google and password/email, but they shipped in beta only months before this read. Treat them as new for a launch, not as the default recommendation over the other two.
- Using them requires pinning `apps/web`'s `@supabase/supabase-js` to at least v2.105.0 and setting the `experimental.passkey` opt-in flag. Check the version currently pinned before assuming passkeys are available to turn on.
- Decide the production RP ID (`dialecta.org`, not a Vercel preview domain) before any contributor registers a passkey. Registering against a preview URL and cutting over later invalidates every credential already registered.
- If Dialecta adds anonymous or preview contributor accounts, passkeys cannot be their only credential option; both SSO and anonymous users are excluded from registering one.
- Whether a passkey grants `aal2` is unconfirmed. Do not write an RLS policy that assumes a passkey sign-in satisfies a second-factor requirement until that is checked directly against the project.

*Filed 2026-09-20*
