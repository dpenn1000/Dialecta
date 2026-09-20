# The installed @supabase/ssr setAll signature, read from source

**Source:** `node_modules/@supabase/ssr/src/types.ts` and `src/cookies.ts`, package version
0.12.7, matching `apps/web/package.json`'s `^0.12.7` pin. Read 2026-09-20. Primary source is the
installed package itself, not documentation.

## Summary

`SetAllCookies` in `types.ts` takes two required arguments: `cookies: { name; value; options }[]`
and `headers: Record<string, string>`, a plain object, not a `Headers` instance. The type's own
doc comment states the contract precisely: `headers` carries `Cache-Control: private, no-cache,
no-store, must-revalidate, max-age=0`, `Expires: 0`, and `Pragma: no-cache`, delivered "only with
the first cookie write" for a given client instance, because "a new server client must be created
for each request; reusing one across requests would leave later responses without the required
cache headers." A `setAll` implementation that ignores the second parameter compiles cleanly,
JavaScript does not enforce arity, and raises no runtime error; it simply never writes those
headers, which is the silent failure the reading list flagged. `CookieMethodsServer.setAll` is
typed optional (`setAll?:`), so a read-only server client can omit cookie writing entirely, but
where it is implemented, the library's own comment on that field states the actual hazard:
without `Cache-Control: private, no-store` upstream of a CDN or reverse proxy, "one user's session
token can be served to a different user."

This confirms and sharpens the existing note (`2026-supabase-ssr-nextjs-auth.md`) rather than
changing it. That note read the current docs page; this one reads the shipped 0.12.7 source
directly, which matters because a docs page can drift ahead of a pinned dependency, the same gap
`2026-nextjs-caching-revalidation.md` found in the Next.js caching guide.

## Implies for Dialecta

- P0-4's middleware or server-client helper must destructure and forward both `setAll` arguments.
  A helper copied from an older one-argument example, or written from memory, passes typecheck
  and compiles, then silently drops the cache headers rather than failing loud.
- "One client per request" is not a style preference here; it is what makes the header delivery
  correct at all. A server client reused across requests would emit the cache headers only on its
  first use and go silent after.
- Whatever fronts `apps/web` in production (a CDN, Vercel's own edge caching) needs to respect
  those exact three headers on any response path that can set auth cookies, which in this repo is
  the middleware/proxy layer per the existing SSR note, not Server Components.

*Filed 2026-09-20*
