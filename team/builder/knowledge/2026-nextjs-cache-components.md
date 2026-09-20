# Next.js 16 Cache Components: the cacheComponents flag replaces dynamicIO and useCache

**Source:** Next.js Docs, "cacheComponents", version 16.3.5, last updated 2026-06-22,
https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents (read 2026-09-20)

## Summary

`cacheComponents: true` in `next.config.ts` is a Next.js 16 flag, introduced in 16.0.0, that turns
on component- and function-level caching through the `use cache` directive: data fetching is
dynamic by default and caching is opted into per page, component, or function. It unifies and
replaces two experimental flags, `experimental.dynamicIO` and `experimental.useCache`, into one
setting. Turning it on also makes Partial Prerendering the App Router's default behavior, which
removes the separate `experimental.ppr` config and the `experimental_ppr` route segment export
outright rather than just deprecating them. Two companion primitives ship with it: `cacheLife`
sets expiration on a `use cache` block, and `cacheTag` tags a cached result for `revalidateTag` to
invalidate. One hard constraint: Cache Components requires the Node.js runtime, so any route still
exporting `runtime = 'edge'` has to migrate off it first. A behavior change worth carrying
regardless of whether this repo adopts the flag: with `cacheComponents` on, Next.js uses React's
`<Activity>` component so client-side navigation hides rather than unmounts the previous route,
preserving component state such as form inputs or expanded sections across back and forward
navigation.

Correction to the lead: the reading list framed this as "which model the repo is committing to,"
implying a live choice between two caching models. There is not one to make yet. `cacheComponents`
is a Next.js 16 flag; `apps/web/package.json` pins `next` at `15.5.25`, and the flag does not exist
to turn on until that pin moves. The existing note `2026-nextjs-caching-revalidation.md` already
found the fact that matters for 15: nothing is cached by default there either. The two models agree
on the one behavior this repo can act on today, write every fetch and query as uncached and
revalidate explicitly, and disagree only on the opt-in vocabulary (`use cache`, `cacheLife`,
`cacheTag`) that is not available until an upgrade.

## Implies for Dialecta

- No code written against 15.5.25 needs to anticipate a `cacheComponents` migration. The "nothing
  cached by default" discipline the existing caching note already established matches what 16
  defaults to.
- If the repo upgrades to Next 16, `cacheComponents: true` is a config-and-audit change (check for
  `runtime = 'edge'` exports, remove any `experimental_ppr` segment config), not a rewrite of
  data-fetching code, since the default behavior does not change, only the vocabulary for opting
  into caching does.
- A-5, A-6, and A-7 (thread rendering, voting) should keep writing plain `revalidatePath` and
  `revalidateTag` calls from Server Actions per the existing note. `cacheLife` and `cacheTag` are
  not available to reach for until the version bumps.

*Filed 2026-09-20*
