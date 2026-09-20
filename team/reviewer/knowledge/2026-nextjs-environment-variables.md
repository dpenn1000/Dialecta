# Next.js, environment variables and the client bundle

**Source:** Vercel, "How to use environment variables in Next.js", Next.js 16.3.5 documentation, page last updated 2026-08-25, read 2026-09-19. https://nextjs.org/docs/app/guides/environment-variables

## Summary

The boundary is a prefix and nothing else. "Non-`NEXT_PUBLIC_` environment variables are only available in the Node.js environment, meaning they aren't accessible to the browser". And the other side: "By default, environment variables are only available on the server. To expose an environment variable to the browser, it must be prefixed with `NEXT_PUBLIC_`."

What the prefix does is a build-time text substitution, not a runtime lookup. "Next.js can 'inline' a value, at build time, into the js bundle that is delivered to the client, replacing all references to `process.env.[variable]` with a hard-coded value." So the value is compiled into the JavaScript that ships. The docs spell out the consequence: "After being built, your app will no longer respond to changes to these environment variables... all `NEXT_PUBLIC_` variables will be frozen with the value evaluated at build time".

Two details that matter when reading a diff:

Inlining is literal and only matches a static property access. "dynamic lookups will not be inlined", and the docs give both failing forms: `process.env[varName]` and destructuring through `const env = process.env`. Code written that way reads as if it exposes a variable and does not, which is a bug in the other direction.

The prefix is the whole check. There is no allowlist, no per-file rule, and no warning. A secret renamed to carry the prefix is published to every visitor the next time the project builds, and the only evidence is in the bundle.

Reading a non-prefixed variable on the server is safe but opts the route into dynamic rendering when it is read at request time; the docs show `await connection()` from `next/server` as the way to make that explicit.

## Implies for Dialecta

- Check 2's "no service-role key reaches a client component or a `NEXT_PUBLIC_` var" has a sharper test than reading imports. Grep the diff for `NEXT_PUBLIC_` and read every new name, because the prefix alone decides. `SUPABASE_SERVICE_KEY` in `.env.example` is correctly unprefixed, and PR 3 adds no prefixed secret.
- `apps/web/src/lib/supabase/client.ts` and `server.ts` both read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as static property accesses, so both inline correctly. The anon key is meant to be public and RLS is the gate, which matches the Supabase guidance in [2026-supabase-row-level-security](2026-supabase-row-level-security.md).
- `isSupabaseConfigured()` in `apps/web/src/lib/articles.ts:26` reads both variables statically, so it inlines. If someone later rewrites it as a loop over a list of variable names, the guard silently becomes always-false in the browser. Worth watching in any refactor of that function.
- Build-time freezing means a preview deployment and production can carry different Supabase projects baked into otherwise identical bundles. When a reviewer is handed a "works on preview" claim about anything reading a prefixed variable, the build environment is part of the claim.

*Filed 2026-09-19*
