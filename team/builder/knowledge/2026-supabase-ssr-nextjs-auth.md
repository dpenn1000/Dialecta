# Supabase server-side auth for Next.js

**Source:** Supabase Docs, "Setting up Server-Side Auth for Next.js", https://supabase.com/docs/guides/auth/server-side/nextjs (read 2026-09-19)

## Summary

The guide recommends `@supabase/ssr` for any framework that stores the session in a cookie. The cookie interface the client is given is `getAll` and `setAll` only; the page shows no `get`, `set` or `remove` methods. `setAll` now receives two arguments, the array of cookies to set and a `headers` object carrying `Cache-Control`, `Expires` and `Pragma`. Server Components cannot write cookies, so the guide wraps the `setAll` call in a try/catch and ignores the error there, and it puts token refresh in a separate request-level hook that can write. That hook refreshes the session and then writes the refreshed tokens twice, once onto `request.cookies` so Server Components in the same pass see them and once onto `response.cookies` so the browser gets them. The guide is direct about which auth call to trust: it says never to trust `supabase.auth.getSession()` in server code, because it reads the session out of the cookie without revalidating it, and it directs server code to `supabase.auth.getClaims()`, which verifies the token signature on every call. Correction to the lead: the reading list framed this as `getUser` versus `getSession`, and the current guidance is `getClaims`. Second correction: the page names the refresh hook "Proxy", which is the Next.js 16 name for what 15 calls Middleware, and `apps/web` pins `next` at 15.5.25, so the file in this repo is `middleware.ts`.

## Implies for Dialecta

- P0-4 needs three Supabase clients, not one: a browser client, a server client whose `setAll` tolerates the Server Component write failure, and a middleware client that performs the refresh and writes both cookie jars.
- Any server code in `apps/web` that decides whether a write is allowed calls `getClaims()`. A route handler that gates on `getSession()` is trusting an unverified cookie, which is exactly the hole `reviewer.md` check 2 looks for.
- The `setAll` two-argument signature is a version tripwire. `apps/web` pins `@supabase/ssr` at `^0.12.7`, and the installed signature has to be read from the package before the client helpers are written, because a one-argument `setAll` silently drops the cache headers.
- The magic link and Google flows in P0-4 both land on a callback route handler, which is a place cookies can be written, so the session exchange belongs there rather than in a Server Component.

*Filed 2026-09-19*
