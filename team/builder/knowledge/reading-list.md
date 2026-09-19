# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | Next.js App Router: server and client components, and the cost of the `use client` boundary | The island list in the brief is a rule with no reasoning behind it yet. A-1, A-3 and A-5 all hinge on where the boundary sits |
| todo | React 19: Actions, `useOptimistic`, `useFormStatus` | The composer submits and waits for classification. Optimistic state is the difference between a 12 character gate that feels alive and one that feels broken |
| todo | `@supabase/ssr`: server-side auth for the Next.js App Router, and cookie handling | P0-4 is magic link plus Google. The cookie plumbing in App Router is the part that bites |
| todo | TipTap 3 and ProseMirror: schema, the JSON document model, server-side HTML generation | A-10 stores `body_json`; A-11 renders `body_html` on the server. Both need the schema decided once |
| todo | Next.js caching and revalidation semantics in the App Router | A-5 and A-6 render threads on the server. A stale thread after a vote is a caching question, not a data question |
| todo | Supabase Storage from a Next.js route handler, and the bucket policy for `article-media` | A-10 uploads images. The bucket exists in migration 0002 and nothing has written to it yet |
