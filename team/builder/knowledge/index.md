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
