# Next.js caching and revalidation in the App Router

**Source:** Next.js Docs, "Caching and Revalidating (Previous Model)", version 16.3.5, last updated 2026-08-25, https://nextjs.org/docs/app/guides/caching-without-cache-components and Next.js Blog, "Next.js 15", October 21 2024, https://nextjs.org/blog/next-15

## Summary

The Next.js 15 release post lists caching semantics as a breaking change and states that `fetch` requests, `GET` Route Handlers and client navigations are no longer cached by default. The Client Router Cache keeps a stale time of zero for Page segments, so a navigation reflects the latest data from the page, while shared layout data is still not refetched and `loading.js` stays cached for five minutes. Opting in is explicit: `cache: 'force-cache'` on a `fetch`, `unstable_cache` around a non-fetch query such as a Supabase call, or a route segment `revalidate` export. On-demand invalidation is `revalidateTag` and `revalidatePath`, and the 15 release notes record that calling either one during render now throws, so both belong in a Server Action or a Route Handler. React's `cache` function deduplicates a non-fetch query within a single render pass, which is the tool for calling the same Supabase query from a layout and a page without running it twice. Correction to the lead: the documentation URL for this topic has moved. Next.js 16 introduced Cache Components behind a `cacheComponents` flag and split the docs, so the old caching guide now redirects to a page titled "Previous Model", which is the one that matches the pinned 15.5.25. Second correction: the lead assumed a stale thread after a vote is a caching question. Under the 15 defaults an uncached server render is already the default, so a stale thread is more likely a missing revalidate call after a mutation than a cache that needs turning off.

## Implies for Dialecta

- A-5 and A-6 render threads on the server and get no caching by default, so the first version needs no cache configuration at all. Reaching for `force-dynamic` to fix staleness would be treating a symptom that is not there.
- A-7 writes a vote through a Server Action, and that action calls `revalidatePath` on the article route. Calling it anywhere in the render path throws.
- If a thread query is ever wrapped in `unstable_cache` for cost, it needs a tag, and every mutation that touches comments has to call `revalidateTag` with it. Untagged caching of a discussion surface is the stale thread the reading list was worried about.
- The second argument shown for `revalidateTag` on the current docs page belongs to the Next.js 16 cache profiles. On 15.5.25 it takes the tag alone, and copying the current example verbatim is a version trap.

*Filed 2026-09-19*
