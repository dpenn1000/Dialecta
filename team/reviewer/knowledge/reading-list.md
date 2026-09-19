# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | Postgres row-level security: `USING` against `WITH CHECK`, and how multiple policies combine | Check 2 is the one that ships a real breach if it is wrong. The two clauses guard read and write and are easy to confuse |
| todo | The Supabase RLS guide, including policy performance and the `auth.uid()` pattern | Every policy this repo writes uses it. Knowing the cost shape stops a correct policy that times out |
| todo | Postgres `SECURITY DEFINER` functions and default execute grants | A definer function with a public execute grant is a hole that reads as normal code. Worth a note with a concrete example |
| todo | Next.js: what crosses into the client bundle, `NEXT_PUBLIC_` semantics, and server action authorization | The service-role key reaching a client component is the failure this check exists to catch |
| todo | OWASP ASVS, the access control chapter | A checklist written by people who have seen the failures, against a review list written from first principles here |
