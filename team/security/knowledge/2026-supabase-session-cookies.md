# Supabase Session Cookies

**Source:** Supabase, "Advanced guide", Supabase Docs (Auth guides, Server-Side Rendering), read 2026-09-20. https://supabase.com/docs/guides/auth/server-side/advanced-guide

## Summary

Supabase clients default to the PKCE flow, and the `@supabase/ssr` package auto-handles saving and retrieving session state in cookies, which SSR needs because "Server-Side Rendering (SSR) with Supabase requires cookie-based session storage" (companion page: https://supabase.com/docs/guides/auth/server-side/creating-a-client). The default cookie name is `sb-<project_ref>-auth-token`. A session carries an access token (a JWT) and a refresh token (an opaque string), both stored in the same cookie-backed medium and rewritten whenever the session refreshes.

On cookie flags, the advanced guide states HttpOnly is not wanted here: "is not necessary. Both the access token and refresh token are designed to be passed around to different components in your application." SameSite `Lax` is the recommended default, with Secure expected wherever the app is served over HTTPS.

The refresh token's single-use behavior is precise, from the creating-a-client page: "A refresh token can generally be used only once, with two exceptions." Outside those two exceptions, "a reuse attempt that matches neither exception revokes the whole session," flagged as hard to diagnose because "it looks like users being signed out at random rather than an error in your code."

Separately, Supabase's Next.js guide (https://supabase.com/docs/guides/auth/server-side/nextjs) carries a sharper warning about trusting session state server-side, under a section now named "Proxy" (its current name for the middleware hook): "Anyone can forge the session cookie, so trusting it without verification lets an attacker render another user's page. Always use `supabase.auth.getClaims()` to protect pages and user data. Never trust `supabase.auth.getSession()` inside server code such as Proxy. It reads the session out of the cookie without revalidating it." `getClaims()` verifies the JWT's signature on every call; `getSession()` does not.

`@supabase/ssr`'s own design doc (https://github.com/supabase/ssr/blob/main/docs/design.md) documents cookie chunking: a value up to 3180 bytes is stored under its plain key; above that, it splits into 3180-byte chunks named `key.chunk_index`, because "individual cookies longer than 3180 bytes will not be sent to the server, or may not even be saved at all," and because cookies exclude several characters JSON needs, requiring Base64-URL encoding as well.

## Implies for Dialecta

- Wherever `apps/web` (Next.js 15) reads a contributor's identity in a Server Component, route handler, or the Proxy/middleware hook, it should call `supabase.auth.getClaims()`, not `getSession()`. Trusting an unverified cookie server-side is the same class of mistake that let the deployed `profile/[id].js` diverge from its repo copy.
- The single-use refresh token behavior explains a specific failure mode to expect: a contributor with Dialecta open in two tabs, or a retried request on a flaky network, can trigger a concurrent refresh that revokes the whole session and reads as a random logout, not a bug in Dialecta's own code.
- HttpOnly is deliberately unset on these cookies by Supabase's own design. Do not set it in `apps/web` without accounting for the client-side token handoff `@supabase/ssr` depends on.
- Any code that reads or writes the `sb-<project_ref>-auth-token` cookie directly, rather than through `@supabase/ssr`, has to handle the chunked, Base64-URL-encoded, multi-cookie form once the session payload passes 3180 bytes, a size a JWT carrying an `aal` claim and provider metadata can reach.

*Filed 2026-09-20*
