# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| filed | Next.js App Router: server and client components, and the cost of the `use client` boundary | Filed 2026-09-19. Source held. The cost is the module graph, not the component, and it does not follow `children` |
| filed | React 19: Actions, `useOptimistic`, `useFormStatus` | Filed 2026-09-19. Source held, reasoning corrected: the Action is the insert, so optimistic state cannot cover a tier that arrives later |
| filed | `@supabase/ssr`: server-side auth for the Next.js App Router, and cookie handling | Filed 2026-09-19. Source held, guidance moved: `getClaims()` replaces the `getUser` and `getSession` framing, and `setAll` now takes two arguments |
| filed | TipTap 3 and ProseMirror: schema, the JSON document model, server-side HTML generation | Filed 2026-09-19. Source held and named a missing dependency: server generation needs `@tiptap/html`, which `apps/web` does not have |
| filed | Next.js caching and revalidation semantics in the App Router | Filed 2026-09-19. Source held, premise corrected: on 15 nothing is cached by default, so a stale thread is a missing revalidate rather than a cache |
| filed | Supabase Storage from a Next.js route handler, and the bucket policy for `article-media` | Filed 2026-09-19. Source held, pointer corrected: there is no migration 0002. The bucket is in `20260919000100_articles_native.sql` with a select policy only |
| todo | `docs/Dialecta_Discourse_Layer_UX.md` has no Stage 2.5 section, though A-3, the Delta Mechanic spec and the locked 10 percent weighting all assume one | A-3 cites a section that does not exist. Read the Article Editorial Template's Stage 2.5 and establish whether the comment flow inherits it or needs its own |
| todo | Next.js 16 Cache Components and the `cacheComponents` flag | The caching docs split in two for 16 and `apps/web` is on 15.5.25. Worth knowing which model the repo is committing to before A-5 and A-6 add cache config |
| todo | Supabase `getClaims()`, asymmetric JWT signing keys, and what verifying locally costs per request | Found while reading the SSR guide. It replaces the `getSession` advice P0-4 was going to follow, and every gated route handler will call it |
| todo | `@supabase/ssr` 0.12.x source: the installed `setAll` signature and whether it takes the `headers` argument | The docs show a two-argument `setAll`. `apps/web` pins `^0.12.7`, and a mismatch drops cache headers silently rather than failing |
| todo | React `useActionState` | Named in the React 19 post and absent from this list. It is the hook that carries a server action's return value back into the composer island for A-1 |
| todo | Supabase resumable TUS uploads above 6MB | Standard uploads are recommended only to 6MB and A-10 accepts article images, so the ceiling decides whether one upload path is enough |
