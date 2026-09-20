# Server and Client Components

**Source:** Next.js Docs, "Server and Client Components", App Router. Version 16.3.5, last updated 2026-08-25. https://nextjs.org/docs/app/getting-started/server-and-client-components

## Summary

Layouts and pages are Server Components by default. The `use client` directive does not mark one component as interactive; the page calls it a boundary between the server and client module graphs, and once a file carries it, all of its imports and the components it directly renders are included in the client bundle. The boundary is transitive through imports, so the cost is paid by everything the island pulls in rather than by the island alone. The boundary does not extend through children: a Server Component passed as `children` or as another prop is rendered on the server and handed to the client component as rendered output, so it never enters the client module graph. Props that cross the boundary must be serializable by React. The recommended shape is to put `use client` on the smallest interactive unit and to use a `children` slot when server-rendered content has to appear visually inside a client component. React context is unavailable in Server Components, so any provider is itself a client component that accepts `children` and is rendered as deep in the tree as possible. Correction to the lead: nothing in the source contradicted it, but this page now serves Next.js 16.3.5 while `apps/web/package.json` pins `next` at 15.5.25, so any version-sensitive detail read here needs checking against 15 before it becomes a rule.

## Implies for Dialecta

- The island list in `.claude/agents/builder.md` has a mechanism behind it now: each island costs its own module graph, so the boundary belongs at the smallest interactive unit rather than at the card or the page.
- A-5 renders the comment thread as a server component even though A-7 votes are interactive. The vote control is the island and the card is passed through it as `children`, which keeps the card body out of the client bundle.
- Anything handed to the composer island in A-1 has to be serializable, so a Supabase client, a live `Date` with methods, or a callback cannot be a prop. The island receives plain data and calls a server action.
- A session or theme provider, if one is added for P0-4, wraps `{children}` low in the tree instead of the whole document, so the static parts of the server tree stay optimizable.

*Filed 2026-09-19*
