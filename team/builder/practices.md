# Standing practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Server components by default. A client island only where state, effects or browser APIs are needed, and scoped to the smallest interactive unit, because `use client` bounds a module graph rather than a component | high | `knowledge/2026-nextjs-server-client-components.md`; `apps/web/CLAUDE.md` | 2026-09-19 |
| Server-rendered content reaches inside an island through `children` or another prop, never through an import, and anything crossing the boundary is serializable | high | `knowledge/2026-nextjs-server-client-components.md` | 2026-09-19 |
| The island list in `.claude/agents/builder.md` is behind `apps/web/CLAUDE.md`, which adds the article editor and says votes rather than votes and nominations. Follow the app file and report the drift | medium | `apps/web/CLAUDE.md`; `.claude/agents/builder.md` | 2026-09-19 |
| Never type a hex value. `tokens.css` is generated from `design/dialecta-design-spec.html`, so a missing token is reported and fixed upstream in the design spec or the extractor, never hand-added | high | `apps/web/CLAUDE.md`; `apps/web/src/styles/tokens.css` header; `knowledge/2026-dialecta-a1-composer-requirements.md` | 2026-09-19 |
| Every string a person reads lives in `apps/web/src/strings.ts`, and copy lifted from a spec gets a voice pass first. `.voiceignore` exempts `docs/` and nothing outside it, so spec prose that reads fine in place will be blocked on the way in | high | `apps/web/CLAUDE.md`; root `CLAUDE.md`; `knowledge/2026-dialecta-a1-composer-requirements.md` | 2026-09-19 |
| `packages/core` does no I/O at all, not only no Supabase, and a change there lands with a failing test shown first | high | `packages/core/CLAUDE.md`; `.claude/agents/builder.md` | 2026-09-19 |
| Classification never blocks the comment insert in the request path | contested, was high | `.claude/agents/reviewer.md` check 1; contradicted by `docs/Dialecta_Discourse_Layer_UX.md` Stage 1; open on `exchange/open/2026-09-19-002` | 2026-09-19 |
| Server code decides authorization on `supabase.auth.getClaims()`. `getSession()` reads an unverified cookie and is not a gate | high | `knowledge/2026-supabase-ssr-nextjs-auth.md` | 2026-09-19 |
| Server components cannot write cookies. Session refresh belongs in middleware, which writes the refreshed tokens to both the request and the response | high | `knowledge/2026-supabase-ssr-nextjs-auth.md` | 2026-09-19 |
| On Next 15 nothing is cached by default, so caching is opted into deliberately. `revalidatePath` and `revalidateTag` run in a server action or a route handler and throw if called during render | high | `knowledge/2026-nextjs-caching-revalidation.md` | 2026-09-19 |
| A `useOptimistic` setter is called inside an Action, and optimistic state can only cover what that Action itself resolves | high | `knowledge/2026-react19-actions-optimistic.md` | 2026-09-19 |
| Server-side Tiptap HTML comes from `@tiptap/html`, never `@tiptap/core`, using the same extension list the editor is built with, held in one shared module | high | `knowledge/2026-tiptap-html-utility.md` | 2026-09-19 |
| A Supabase Storage write needs an explicit insert policy or a signed upload URL. A public bucket is readable and still closed to writes | high | `knowledge/2026-supabase-storage-access-control.md` | 2026-09-19 |
| A backlog row's governing-spec citation is verified against the actual document before treating it as settled. A citation to a stage or section that does not exist is a spec gap to report, not a section to infer or build around | high | `knowledge/2026-dialecta-discourse-stage-2-5-gap.md`; `exchange/open/2026-09-19-002-blindspot-adr-spec-drift.md` | 2026-09-20 |
| `apps/web` is pinned to Next 15.5.25, where nothing is cached by default already. That discipline, write every fetch and query as uncached and revalidate explicitly, is already forward-compatible with Next 16's `cacheComponents` default, so no code here needs to anticipate a future cache-model migration | high | `knowledge/2026-nextjs-cache-components.md`; `knowledge/2026-nextjs-caching-revalidation.md` | 2026-09-20 |
| `getClaims()` verifies a JWT locally against a cached JWKS with no per-request network call once keys are warm (a 10 minute edge cache plus a 10 minute client cache, under asymmetric signing keys). It is cheap enough to call on every gated request and is not an optimization to defer | high | `knowledge/2026-supabase-jwt-signing-keys.md` | 2026-09-20 |
| The installed `@supabase/ssr@0.12.7` `setAll` callback takes two arguments, the cookie array and a plain `headers: Record<string,string>` object, not a `Headers` instance, carrying the auth-response cache-control headers. A one-argument `setAll` compiles and passes typecheck but silently drops those headers, which is the CDN cross-user-session-caching risk the library's own source warns about | high | `knowledge/2026-supabase-ssr-setall-signature.md`, read directly from the installed package source | 2026-09-20 |
| A composer or form action passed to `useActionState` has the signature `(previousState, formData) => nextState`. Dispatched actions queue and run sequentially, so a double submit is already serialized and needs no hand-written race guard, only a UI disable on `isPending` | high | `knowledge/2026-react-useactionstate.md` | 2026-09-20 |
| Supabase Storage standard uploads are recommended only to 6MB. Above that, uploads need the separate TUS client API (`tus-js-client` or Uppy), not a flag on the standard upload call, so any upload surface that can plausibly exceed 6MB needs a branch to a second code path and a new dependency | high | `knowledge/2026-supabase-resumable-uploads.md` | 2026-09-20 |
| `body_html` is rendered with `dangerouslySetInnerHTML` today with no sanitizer anywhere in the repo (`apps/web/src/app/articles/[slug]/page.tsx:43`), confirmed by `reviewer` as blocker B1 of the PR 3 review and independently corroborated here against the recovered production predecessor, which shipped the same hole live. Sanitize with `isomorphic-dompurify` at both write time and read time; do not trust the editor as a safety boundary, since RLS blocker B2 shows the column is reachable without it | very high | `knowledge/2026-html-sanitizer-body-html.md`; `team/reviewer/knowledge/2026-cure53-dompurify.md`; `exchange/open/2026-09-19-002-handoff-pr-3-review.md` | 2026-09-20 |
| No third-party Supabase-Auth-plus-Next.js-App-Router starter is worth adopting for P0-4; the official Supabase server-side auth guide is the better base. For RLS testing, pgTAP is the established choice, with `supabase-test-helpers` as a convenience layer on top of it, ahead of newer sub-30-star alternatives | medium | `knowledge/2026-auth-starters-and-rls-harnesses.md` | 2026-09-20 |
| A type that narrows a domain is checked where it is written back, not only where it is read. `ClassificationResult.opposing_view_engaged` folded the model's three answers to a boolean, and the widening at the write site could only produce two of them, so every `partially` was stored as `yes`. Narrowing in memory costs nothing. Narrowing on the way into a column that holds the wider domain is permanent, one row at a time, and biased in a single direction | high | `team/architect/knowledge/2026-live-opposing-view-fold.md`; `docs/Dialecta_Axis_Mapping_v1.md`, Magnanimity row and the "Tuning knobs" table; fixed 2026-09-20 in `packages/core/src/classification.ts`, `packages/core/src/axis-mapping.ts` and `apps/web/src/app/api/comment/route.ts` | 2026-09-20 |
| `apps/web`'s typecheck compiles `packages/core/src` too, because the workspace package exports TypeScript source rather than built output. Core's files are read twice under two option sets, so a strictness flag on in one workspace and off in the other changes how core itself is checked, not only how app code is checked | high | measured 2026-09-20 with `tsc --noEmit --listFiles` in `apps/web`: 53 non-library files, 9 of them under `packages/core/src`; `packages/core/package.json` exports `./src/index.ts` | 2026-09-20 |
| `apps/web/tsconfig.json` and `packages/core/tsconfig.json` share no `extends` and no root config, so every option is duplicated by hand and drifts silently. `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` were on in core and missing in the app until 2026-09-20; turning them on cost zero errors across all 53 checked files | high | both files read 2026-09-20; `npm -w apps/web run typecheck` and `next build` clean with both flags set | 2026-09-20 |

## Why the island list is what it is

The mandate gave a list with no reasoning, so the list could only be obeyed, not applied. A new
surface that was not on it had no way to be judged. The reasoning is in
`knowledge/2026-nextjs-server-client-components.md` and it is one mechanism.

`use client` does not mark a component as interactive. It declares a boundary between the server
and client module graphs, and once a file carries it, everything that file imports and everything
it directly renders is included in the client bundle. So the unit of cost is the module graph,
not the component. An island that imports a date library, a Supabase client and three helpers
ships all of them, and a card marked `use client` because one button inside it needs a click
handler ships the card body too.

The exception is what makes small islands practical. The boundary does not follow `children`. A
server component passed into a client component as a child is rendered on the server and handed
over as output, so it never joins the client graph. That is why a comment card can stay a server
component while the vote control inside it is an island, and it is the shape A-5 and A-7 should
take.

Two consequences fall out of the same mechanism. Props crossing the boundary have to be
serializable, so a Supabase client, a live `Date` or a callback cannot be passed in. And React
context is unavailable in server components, so any provider is itself an island and belongs as
deep in the tree as it can sit.

That gives a test for a surface the list does not name: it is an island if it needs state,
effects or a browser API, and its boundary goes at the smallest node that needs them. The six
things the mandate names all pass that test. So does the article editor, which the mandate omits
and `apps/web/CLAUDE.md` includes, which is the drift recorded in the table above.
