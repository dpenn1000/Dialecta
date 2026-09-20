# Knowledge index

Leads live in `reading-list.md`; a sprint files them here, one file per source,
named `YYYY-<author>-<slug>.md` with citation, summary, and what it implies for a
named Dialecta surface or a named practice.

| File | Source | Implies for |
| --- | --- | --- |
| [2026-nextjs-server-client-components.md](2026-nextjs-server-client-components.md) | Next.js Docs, "Server and Client Components", v16.3.5 | The island list is a mechanism now: each island costs its own module graph, so the boundary sits at the smallest interactive unit |
| [2026-react19-actions-optimistic.md](2026-react19-actions-optimistic.md) | React Docs, "React v19" (2024-12-05) and "useOptimistic" | A-1 submits through a server action and gets pending state free; `useOptimistic` covers the insert, not the tier |
| [2026-supabase-ssr-nextjs-auth.md](2026-supabase-ssr-nextjs-auth.md) | Supabase Docs, "Setting up Server-Side Auth for Next.js" | P0-4 needs three clients, and server code gates on `getClaims()` rather than `getSession()` |
| [2026-tiptap-html-utility.md](2026-tiptap-html-utility.md) | Tiptap Docs, "HTML Utility" | A-11 needs `@tiptap/html`, which `apps/web` does not yet depend on, and one shared extension list with A-10 |
| [2026-nextjs-caching-revalidation.md](2026-nextjs-caching-revalidation.md) | Next.js Docs, "Caching and Revalidating (Previous Model)" and the Next.js 15 release post | A-5 and A-6 need no cache config at all on 15; A-7 calls `revalidatePath` from the action, never during render |
| [2026-supabase-storage-access-control.md](2026-supabase-storage-access-control.md) | Supabase Docs, "Storage Access Control" and "Standard Uploads" | `article-media` has a select policy and no insert policy, so A-10 needs a migration before a route handler |
| [2026-dialecta-a1-composer-requirements.md](2026-dialecta-a1-composer-requirements.md) | `docs/Dialecta_Discourse_Layer_UX.md` Stage 1, against backlog A-1, tokens.css, strings.ts | The spec blocks on the model and the backlog enqueues; four gaps A-1 hits before a line is written |
| [2026-dialecta-discourse-stage-2-5-gap.md](2026-dialecta-discourse-stage-2-5-gap.md) | `docs/Dialecta_Discourse_Layer_UX.md` against `docs/Dialecta_Article_Editorial_Template.md` | A-3's citation names a section absent from the document it cites; comment Stage 2.5 needs its own design, not inheritance |
| [2026-nextjs-cache-components.md](2026-nextjs-cache-components.md) | Next.js Docs, "cacheComponents", v16.3.5 | Not live on 15.5.25 yet; the "nothing cached by default" discipline already matches what 16 defaults to |
| [2026-supabase-jwt-signing-keys.md](2026-supabase-jwt-signing-keys.md) | Supabase Docs, "JWT Signing Keys" | `getClaims()` verifies locally against a cached JWKS with no per-request network call; confirm the project is on asymmetric keys before P0-4 |
| [2026-supabase-ssr-setall-signature.md](2026-supabase-ssr-setall-signature.md) | `node_modules/@supabase/ssr` v0.12.7 source | `setAll` takes two arguments; a one-argument helper compiles and silently drops the cache headers |
| [2026-react-useactionstate.md](2026-react-useactionstate.md) | React Docs, "useActionState" | A-1's action signature is `(previousState, formData)`; a double submit is already serialized, not a data race to guard by hand |
| [2026-supabase-resumable-uploads.md](2026-supabase-resumable-uploads.md) | Supabase Docs, "Resumable Uploads" | A-10 needs a branch to `tus-js-client`/Uppy above 6MB; standard uploads are a different API, not a flag |
| [2026-html-sanitizer-body-html.md](2026-html-sanitizer-body-html.md) | GitHub Search API, cross-referenced against `_recovered/` and `team/reviewer/knowledge/` | `isomorphic-dompurify` at both write and read time; `body_html` is live and unsanitized today, not only a future risk |
| [2026-auth-starters-and-rls-harnesses.md](2026-auth-starters-and-rls-harnesses.md) | GitHub Search API | No starter worth adopting for P0-4; pgTAP is the established pick for RLS testing |
