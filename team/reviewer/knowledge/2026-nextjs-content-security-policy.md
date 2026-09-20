# Next.js, Content Security Policy

**Source:** Vercel, "How to set a Content Security Policy (CSP) for your Next.js application", Next.js 16.3.5 documentation, page last updated 2026-03-20, read 2026-09-19. https://nextjs.org/docs/app/guides/content-security-policy

## Summary

Three ways to ship a policy, and they are not interchangeable. The difference decides whether a
CSP does anything about blocker B1 of the PR 3 review.

**Nonces, set in a proxy.** The documented header is
`script-src 'self' 'nonce-{value}' 'strict-dynamic'`, with `object-src 'none'`,
`base-uri 'self'`, `form-action 'self'` and `frame-ancestors 'none'`. Next.js parses the header
during render and attaches the nonce to framework scripts, page bundles and its own inline
tags, so tags do not have to be annotated by hand. The cost is stated plainly: "you **must use
dynamic rendering** to add nonces", because "Static pages are generated at build time, when no
request or response headers exist, so no nonce can be injected". The consequences the page
lists are static optimization and ISR disabled, no CDN caching by default, Partial Prerendering
"incompatible", slower first loads and higher hosting cost.

**No nonces, set in `next.config.js` `headers()`.** The documented value here is
`script-src 'self' 'unsafe-inline'`. It keeps static rendering and costs nothing.

**Subresource Integrity, experimental.** `experimental.sri` with a hash algorithm puts
`integrity` attributes on script tags at build time, which allows `script-src 'self'` with no
`'unsafe-inline'` and no nonce. The page lists the benefits as "Static generation", "CDN
compatibility" and "Better performance", and the limitations as experimental, App Router only,
and "Cannot handle dynamically generated scripts".

`'unsafe-eval'` is needed in development only, because React uses `eval` for debugging.
"Neither React nor Next.js use `eval` in production by default."

## Implies for Dialecta

- **The cheap option does not stop B1.** The payload in that finding is an inline event
  handler, `<img src=x onerror=...>`, and `'unsafe-inline'` in `script-src` is exactly what
  permits inline handlers to run. The `next.config.js` recipe on this page is the one a reader
  reaches for first, and against this specific attack it is worth nothing. Finding S7 of
  `exchange/open/2026-09-19-002-handoff-pr-3-review.md` said a CSP "turns the first blocker
  from a stolen session into a broken image". That is true of the nonce and SRI forms and false
  of the `headers()` form. Recorded as a correction to my own claim.
- `connect-src 'self'` is the directive that matters second, and neither the finding nor the
  usual advice mentions it. The B1 payload exfiltrates with `fetch` to an outside origin. A
  policy with `connect-src 'self'` breaks that leg even where the script itself runs.
- For a publication that wants CDN caching on article pages, nonces are the expensive answer
  and SRI is the interesting one, because it is the only form here that keeps static generation
  and still refuses inline script. It is experimental, so recommending it carries that caveat.
- None of this is the fix. A CSP is the second layer. The first is not rendering attacker HTML,
  which is [2026-cure53-dompurify](2026-cure53-dompurify.md). A review that accepts a CSP as
  the remedy for an unsanitized `dangerouslySetInnerHTML` has accepted defense in depth in
  place of the defense.
- Row 15 of [review-checklist](review-checklist.md) was `(unsourced)` and can now ask the
  sharper question: not whether `headers()` exists, but whether `script-src` carries
  `'unsafe-inline'`, which makes the policy decorative against injected markup.

*Filed 2026-09-19*
