# getClaims, getUser, getSession, and the cookie handoff

**Source:** Supabase, "Setting up Server-Side Auth for Next.js", Supabase Docs, read 2026-09-20, together with the JavaScript reference pages for `auth.getClaims` and `auth.getUser`. https://supabase.com/docs/guides/auth/server-side/nextjs ; https://supabase.com/docs/reference/javascript/auth-getclaims ; https://supabase.com/docs/reference/javascript/auth-getuser

## Summary

This extends `2026-supabase-session-cookies.md`, which already filed the getClaims-over-getSession warning and the cookie chunking behavior. What that note did not cover is getUser as a third option, and the getAll/setAll cookie mechanics themselves.

All three methods are named and ranked directly in the current guide, in one line: "use getClaims to verify identity (typically for protecting pages and data), getUser when you need an up-to-date user record from the Auth server, and getSession when you need the access or refresh token directly." Only getClaims and getUser verify anything; getSession does not, the same warning the earlier note already filed. The two verifying methods differ in cost. getClaims, per its reference page, verifies "by first verifying the JWT against the server's JSON Web Key Set endpoint," and with an asymmetric signing key that check runs locally against a cached key set, no network call, "significantly faster responses." Against a legacy symmetric secret it still calls the Auth server every time. getUser always calls the Auth server, on every invocation, by design: it "performs a network request to the Supabase Auth server, so the returned value is authentic and can be used to base authorization rules on." The practical read: getClaims for the common case of gating a page or a query, getUser when the live Auth server record itself is what is needed, not only the claims already in the token.

The getAll/setAll pattern exists because a server-side Supabase client has to read and rewrite the session cookie on almost every request, and different Next.js contexts can do different halves of that. The guide states the Server Component limit directly: "In Server Components, the headers cannot be set, which is why the setAll call is wrapped in a try/catch and the error is ignored. The Proxy handles writing cookies and headers on every request." That is not a workaround, it is the intended division of labor: Proxy, or middleware on Dialecta's version, is the one place guaranteed to run on every request and actually able to write response headers, so it owns refreshing the cookie. A Server Component can read the already-current session but cannot itself extend it.

## Implies for Dialecta

- `apps/web/src/lib/supabase/server.ts` already has this right, read against the primary source rather than assumed. Its `createClient` wraps `createServerClient` with `getAll` returning `cookieStore.getAll()` and `setAll` writing through a try that swallows the error, with a comment naming the exact reason: "Called from a Server Component, where cookies are read only." That matches the guide's own explanation of the same pattern almost word for word. Nothing to fix in this file.
- The gap is upstream of that file, not in it: there is no `middleware.ts` (or `proxy.ts`) in `apps/web` at all, so nothing is actually refreshing the session on every request yet. Per the guide's own division of labor, that is the one piece a Server Component's try/catch cannot substitute for. Building auth for the first time needs this file before `server.ts`'s existing pattern does anything beyond read a cookie nobody is renewing.
- Wherever `apps/web` reads who the current contributor is, a page, a Server Action, a Route Handler, call `getClaims`, not `getSession` and not `getUser`, by default. Reach for `getUser` specifically when the check needs the live Auth server record itself, for example confirming an account has not been banned or deleted since the token was issued, not as the default read.
- **Versions resolved 2026-09-20, after this note was drafted.** `npm ls` and `package-lock.json`
  agree: `@supabase/ssr` is 0.12.7 and `@supabase/supabase-js` is 2.116.0, deduped to one copy
  across the workspace. The `^2.0.0` floor in `apps/web/package.json` is therefore misleading about
  what is actually installed, and reading the manifest alone would have understated it by a hundred
  minor versions. 2.116.0 clears the 2.105.0 minimum that `2026-supabase-passkeys.md` names for
  passkey support, so passkeys are a live option for P0-D2 rather than a version upgrade.
- What that does not settle is the minimum version for getClaims's fast local verification path. The
  installed version is now known; the required version is not, because no source read so far states
  it. Do not infer that 2.116.0 is sufficient from the fact that it is recent. Either find the
  version note that states the minimum, or call getClaims and observe whether it verifies locally or
  round trips to the Auth server.

*Filed 2026-09-20*
