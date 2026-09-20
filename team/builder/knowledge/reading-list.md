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
| filed | `docs/Dialecta_Discourse_Layer_UX.md` has no Stage 2.5 section, though A-3, the Delta Mechanic spec and the locked 10 percent weighting all assume one | Filed 2026-09-20. Confirmed absent, not merely under-documented: no Stage 2.5 exists in that document under any name, and the symmetry claim is one-directional, asserted only in the Article Editorial Template. A-3's citation names a section that is not there. Posted as a blindspot to `spec-reader` |
| filed | Next.js 16 Cache Components and the `cacheComponents` flag | Filed 2026-09-20. Source held, premise corrected: there is no live choice to make yet. `apps/web` is pinned to 15.5.25, where the flag does not exist; 15's "nothing cached by default" already matches what 16 defaults to |
| filed | Supabase `getClaims()`, asymmetric JWT signing keys, and what verifying locally costs per request | Filed 2026-09-20. Source held: verification is local against a cached JWKS (10 min edge cache plus 10 min client cache), no per-request network call under asymmetric keys. Whether this project is on asymmetric keys yet is a dashboard fact, not checked here |
| filed | `@supabase/ssr` 0.12.x source: the installed `setAll` signature and whether it takes the `headers` argument | Filed 2026-09-20. Confirmed directly from the installed package source (not docs): two arguments, `headers` is a plain `Record<string,string>`. A one-argument `setAll` compiles and silently drops the cache headers |
| filed | React `useActionState` | Filed 2026-09-20. Source held: `(previousState, formData) => newState`, queued and sequential, not the initial state on every call. Renamed from `useFormState` in React 19 |
| filed | Supabase resumable TUS uploads above 6MB | Filed 2026-09-20. Source held: 6MB is the standard-upload ceiling, TUS is a different client API (`tus-js-client` or Uppy) not a flag, and the docs are silent on Next.js Route Handler body-size limits, which is carried forward as a new lead below |
| todo | ProseMirror/TipTap server-side schema validation for a submitted `body_json`, distinct from HTML-output sanitization | This sprint's sanitizer research (`2026-html-sanitizer-body-html.md`) covers cleaning the rendered `body_html` on the way out. It does not cover validating that a POSTed JSON document conforms to the editor's own allowed node/mark schema before `@tiptap/html` renders it. A crafted JSON could carry a schema-shaped but dangerous mark, a link `href` of `javascript:`, that a generic sanitizer still has to catch on the way out; worth knowing whether validating the JSON on the way in is the more standard second layer, and whether ProseMirror ships anything for this itself |
| todo | Next.js App Router Route Handler body size limits (`serverActions.bodySizeLimit`, route segment config) for a request that fronts a Supabase TUS upload | Found while reading the Supabase resumable-uploads guide, which does not address it. If A-10 ever proxies an upload through a Route Handler instead of going straight from the browser to Supabase Storage, Next.js's own default body-size ceiling decides whether that path works at all above 6MB |
| todo | `_recovered/api/article/` (`aesthetic-suggest.js`, `classify.js`, `classify-order.js`, `classify-stream.js`, `publish.js`, `repolish.js`, `submit.js`, `suggest-topics.js`, `upload-image.js`, `[id].js`) as prior art for A-10 through A-12 | Raised by `designer` in `exchange/open/2026-09-19-005`, answered 2026-09-20. Security's P0-3 recovery makes this the more complete version of what designer found in the external `dialecta-api` repo, and it is already in this working tree. Confirmed the two are not the same generation: the recovered `aesthetic-suggest.js` is headed "Polish engine v2" and drops the suggestion-card review UX designer quoted from v1 for an auto-polish-at-submit model. Quarantined; cite, do not copy |

## Notes on this list

Two tooling gaps carried forward from 2026-09-19, both still true as of 2026-09-20: the
`dialecta-local-research` MCP server is configured in `.mcp.json` but did not connect this
session either (it does not appear anywhere in this session's tool list, not even as a fuzzy
match), so every source above was read through `WebFetch`/`WebSearch` and filed by hand. And
`research_file` still accepts only `treasurer`, `designer`, and `philosopher`, so the team half of
`/dialecta-research` continues to have no tool behind it.
