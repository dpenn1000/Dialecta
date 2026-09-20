# Next.js, Server Action and Route Handler authorization

**Source:** Next.js Docs, "How to implement authentication in Next.js", version 16.3.5, last updated 2026-08-25, read 2026-09-20. https://nextjs.org/docs/app/guides/authentication

## Summary

The unread half of the original Next.js lead (`2026-nextjs-environment-variables.md` covered the client-bundle half). The page states plainly, for both surfaces: "Treat Server Actions with the same security considerations as public-facing API endpoints, and verify if the user is allowed to perform a mutation" and "Treat Route Handlers with the same security considerations as public-facing API endpoints, and verify if the user is allowed to access the Route Handler." Neither sentence is a caveat. It is the whole story: the framework performs no authorization anywhere by default, on either surface.

Route Handlers get a named pattern, checked session first, then role, distinct status codes: "It first checks for an active session, and then verifies if the logged-in user is an 'admin'", 401 if there is no session, 403 if there is one but the role fails.

The page rules out the two shortcuts a reviewer might otherwise credit:

- **A parent layout or a `return null`.** "A common pattern in SPAs is to return null in a layout or a top-level component if a user is not authorized. This pattern is not recommended since Next.js applications have multiple entry points, which will not prevent nested route segments and Server Actions from being accessed." A layout hiding its children does not stop the children's own code paths, including any Server Action they call, from running.
- **Proxy (the renamed middleware).** Proxy is explicitly framed as an optimistic, UI-redirect layer only: "While Proxy can be useful for initial checks, it should not be your only line of defense in protecting your data. The majority of security checks should be performed as close as possible to your data source." Proxy also only ever reads the session cookie, never the database, so it cannot make a real authorization decision even where it does run.

The recommended shape is a Data Access Layer: one `verifySession()` used by every Server Component, Server Action, and Route Handler, so the check cannot be forgotten in one call site. This is a pattern recommendation, not a guarantee; nothing enforces that every action actually calls it.

## Correction: the page's own Proxy sample would ship a dead file in this repo

The quoted sample above, `proxy.ts` exporting `async function proxy(req)`, is today's official
Next.js convention. `apps/web/package.json` pins `next` at `15.5.25`. Per
`council/security/positions/nextjs-rebuild.md` section 10, verified independently by this agent
the same day: Next.js renamed `middleware.ts` to `proxy.ts` in `16.0.0`, the rename arrived with
the major version rather than a date, so no 15.5 release carries it regardless of patch number,
and "every current official sample... is written as `proxy.ts` exporting `proxy`. Copied verbatim
into this app that file is never invoked." A file named `proxy.ts` in this repo today would build
clean, type-check clean, and simply never run, silently, with nothing in CI or a code review
saying so. On `apps/web` as it stands, the working filename is `middleware.ts` exporting
`middleware`. Re-check this the day the repo's `next` version changes; the correct name flips
with it and nothing else about this note does.

## Implies for Dialecta

- Confirms and sharpens checklist rows 11 to 13. A Server Action or Route Handler with no call to a session check at all is now a directly sourced failure mode, not a first-principles guess. Filed as checklist row 13b, see `review-checklist.md`, which also carries the filename correction above.
- Also confirmed by the same primary source and by Vercel's own postmortem on CVE-2025-29927 (both cited in `council/security/positions/nextjs-rebuild.md` section 10): Proxy or Middleware refreshing a session is not the same as Proxy or Middleware authorizing a request, independent of which filename is correct for this app's version. Row 13b's citation already carries this; restated here because it is easy to fix the filename and still get the architecture wrong.
- Backlog A-1 through A-4 (composer, classification job, classification card, resolution) and B-1 (axis ledger write) are all `Todo`. When any of them lands as a Server Action or Route Handler, the question is not "does Proxy protect this," because nothing in this repo's `apps/web` has a Proxy file yet and the doc says not to rely on one anyway. The question is whether that specific action calls something equivalent to `verifySession()` before it touches a row.
- The Server Action framing matters for A-7 (votes and nominations) and A-3 (Stage 2.5 amend). Both mutate a row a user does not fully own the columns of (a vote counts once, a nomination has a threshold), so "is the caller allowed to perform this exact mutation" is a sharper question than "is the caller logged in."
- `apps/web` has no `proxy.ts` or `middleware.ts` today (not verified by a repo-wide search in this note; worth a `find` pass when A-1 lands). If one is added later as the sole auth gate for `/dashboard`-style routes, row 13b applies to it directly: a redirect is not a check.

*Filed 2026-09-20*
