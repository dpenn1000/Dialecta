# Security headers and CSP for Next.js

**Source:** Next.js (Vercel), "Content Security Policy" guide, official documentation, read 2026-09-20, alongside the OWASP Secure Headers Project (`OWASP/www-project-secure-headers`) as the underlying standard. https://nextjs.org/docs/app/guides/content-security-policy ; https://github.com/OWASP/www-project-secure-headers

## Summary

Two things, kept separate on purpose: what headers to send, and a way to check what is being sent.

The standard is the OWASP Secure Headers Project (217 stars, Apache-2.0, active workflow runs visible on the repo). Its main deliverable is a maintained reference of every security-relevant response header (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` and its CSP replacement `frame-ancestors`) and what each does, published at owasp.github.io/www-project-secure-headers. It also holds a Validator sub-project, a test suite that checks a live site's headers against its own recommendations, which is the verification half of this note's ask.

The implementation half is Next.js's own official guide, current as of its 2026-03-20 update. For the App Router, it recommends generating a CSP nonce in Proxy (the file that used to be called Middleware), setting it in both a custom `x-nonce` request header and the `Content-Security-Policy` response header, then reading it back in a Server Component through `headers()` for any inline or third-party script. Using a nonce forces dynamic rendering on every page it touches, since a nonce that does not change per request is not a nonce. The guide gives a second, simpler path for a site with no inline scripts to allow: set the CSP directly in `next.config.js`'s `headers()` function, no proxy or nonce needed, at the cost of allowing `'unsafe-inline'` or listing every script origin explicitly.

Dialecta currently sends neither path. `apps/web/next.config.ts` has no `headers()` function, and `vercel.json` sets only `git.deploymentEnabled`. No CSP, no `Strict-Transport-Security`, no `X-Content-Type-Options` reaches a browser from `apps/web` today.

## Implies for Dialecta

- `apps/web` has no inline third-party scripts today, as read (no analytics, no tag manager in the codebase), which points at the simpler `next.config.js` `headers()` path first, not the nonce-and-proxy path. Nonces are the right move later if something like an analytics tag gets added and needs to stay inline.
- Concrete first step: add a `headers()` function to `apps/web/next.config.ts` returning `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `frame-ancestors 'none'` for all routes. This is a same-file change, no new dependency, no new workflow.
- The Tiptap editor (`@tiptap/react`, `@tiptap/starter-kit` in `apps/web/package.json`) is exactly the kind of surface a CSP's `script-src` and `style-src` need checking against once article content starts rendering from stored HTML, alongside the sanitization question `team/reviewer/knowledge/2026-cure53-dompurify.md` already covers. A CSP is a second layer behind sanitization, not a replacement for it.
- Verification belongs in CI, not as a one-time manual check: once headers ship, the OWASP Validator, or an equivalent scripted check against a preview deployment URL, confirms the header reaches the actual response rather than only existing in source. No such check exists yet, and none can usefully exist before the headers themselves ship.

*Filed 2026-09-20*
