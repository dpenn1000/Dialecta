# Reading list

Leads, not facts. Every entry below is a lead to verify: confirm the source exists and says
what this line claims before filing a note on it. A lead that turns out to be wrong or missing
is marked `dead` with the reason, which is a result worth keeping.

States: `todo`, `filed`, `dead`.

| State | Lead | Why this agent needs it |
| --- | --- | --- |
| todo | Supabase local development and the migration workflow: `db push`, `db reset`, `db lint` | P0-2 runs this for real against `dialecta-staging`. The failure modes should be known before, not during |
| todo | Postgres enum evolution: `ALTER TYPE ADD VALUE`, and what it cannot do | `tier` is an enum with seven values that the specs have already renamed once. Removing a value is the trap |
| todo | Supabase declarative schemas | An alternative to a migration chain. Worth one note saying whether it fits this repo, including the case against |
| todo | Postgres check constraints and domains for bounded values | Specificity is 0 to 3 and graduation count is 0 to 22. Both are constraints today and could be domains |
| todo | Supabase type generation into `supabase/types.ts`, and how it drifts | `npm run types` is in the backlog at P0-2. Drift between the generated file and the migration is a silent failure |
