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
