# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | The deployed `dpenn1000/dialecta-api`: every endpoint, its method branches, and what each one writes | The profile GET was found by reading it. `classify.js` and `comment.js` have not been read the same way, and `comment.js` takes untrusted text and spends money on it |
| todo | Postgres default grants to `anon` and `authenticated` in the Supabase `public` schema | The reviewer's two database blockers rest on this and it was reasoned rather than read. If the grants are absent, one of them drops a severity |
| todo | `SECURITY DEFINER` functions and `FORCE ROW LEVEL SECURITY` | The reviewer found that a table owner bypasses RLS unless FORCE is set, so a definer function owned by postgres skips RLS on every table it touches. Confirm and enumerate which functions this project has |
| todo | Stored XSS and HTML sanitisation at write time against read time | Blocker B1 is live once articles are writable. The remedy on record is sanitise at both, and the reasoning for read time should be a filed note rather than a commit message |
| todo | Rate limiting on unauthenticated endpoints, and what Vercel gives for free | An unauthenticated write endpoint with no ceiling is a bill as well as a breach. The treasurer prices a classification at $0.002 |
| todo | Secret handling across this estate: `.env`, Vercel project env vars, the Supabase service role key, and what reaches a client bundle | A token was written to `C:\Dialecta\vercel.tolken` on 2026-09-19 in a directory nothing ignored. The class of mistake matters more than the instance |
| todo | Supabase Storage bucket policies, for `article-media` | Migration 0002 creates the bucket and nothing has written to it. Policy gaps are cheapest to close before the first upload |
