# Review checklist

Check 2 of `.claude/agents/reviewer.md` is one paragraph. This file is the same check as a list
of named failure modes, so a review either hits a named row or records a new one.

Every row names the failure, the question that finds it, and the evidence behind the question.
A row with no evidence file is marked `(unsourced)` and is a first-principles guess until a
sprint backs it.

## How to use it

Run the rows in order on any diff that touches `supabase/migrations/`, `apps/web/src/lib/`,
`apps/web/src/app/api/`, or a server action. Rows 1 to 6 are the database, 7 to 10 are the
application, 11 to 13 are the render. A row that does not apply is skipped out loud in the
report rather than silently.

Severity convention used below: a **blocker** is reachable by a signed-up user with no special
role, through the published anon key, today. A **should-fix** needs a second condition that is
not yet true.

## Database

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 1 | Table added with no `enable row level security` | Does every `create table` in the diff have an `alter table ... enable row level security` next to it | `supabase/CLAUDE.md`; [2026-supabase-row-level-security](2026-supabase-row-level-security.md), "Enable RLS on every table in an exposed schema" |
| 2 | RLS enabled, no policy, table reads as empty | For each new table, which operations have a permissive policy, and is a missing one deliberate | [2026-postgresql-create-policy](2026-postgresql-create-policy.md). A missing `select` policy is silent, so no test will fail on it |
| 3 | **Column level: owner may write a column only the pipeline should set** | For each `for update` policy, list the columns of that table and ask which ones the owner may set. Tier, status, timestamps and any window column are the usual answers | [2026-postgresql-create-policy](2026-postgresql-create-policy.md); [2025-owasp-asvs-authorization](2025-owasp-asvs-authorization.md), BOPLA and requirement 8.2.2. This is blocker B2 of the PR 3 review |
| 4 | `update` policy with `using` and no `with check` | Read the `using` expression twice, as the visibility rule and as the write rule, because it serves as both | [2026-postgresql-create-policy](2026-postgresql-create-policy.md): "if no `WITH CHECK` expression is defined, then the `USING` expression will be used both" |
| 5 | Ledger table given an update or delete policy | Does `axis_events`, or any table the spec calls append-only, have `for update` or `for delete` anywhere in the diff | `.claude/agents/reviewer.md` check 2; `supabase/CLAUDE.md` |
| 6 | `security definer` function with a mutable `search_path` or no revoke | Three questions: is `pg_temp` last in `search_path`, is execute revoked from `PUBLIC`, are the create and the revoke in one transaction | [2026-postgresql-security-definer](2026-postgresql-security-definer.md). Missing revoke is a blocker, because the body looks normal |

## Application

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 7 | Secret renamed into the client bundle | Grep the diff for `NEXT_PUBLIC_`. Read every new name and ask whether the value is meant to be public | [2026-nextjs-environment-variables](2026-nextjs-environment-variables.md). The prefix is the entire check, there is no allowlist and no warning |
| 8 | Service-role client constructed where a request can reach it | Does any file importing the service key lack a server-only guard, and does any client component import it transitively | `.claude/agents/reviewer.md` check 2 |
| 9 | Route handler or server action writing an owned row without checking `auth.uid()` | For each write, name the row's owner column and find the line that proves the caller owns it. "RLS will catch it" is an answer only when the call uses the anon key, not the service key | [2026-supabase-row-level-security](2026-supabase-row-level-security.md): the secret key carries `bypassrls` |
| 10 | Rule enforced in a client island instead of the database | Is there a constraint the composer, the vote widget or the editor applies that a direct PostgREST call would skip | [2025-owasp-asvs-authorization](2025-owasp-asvs-authorization.md) requirement 8.3.1: enforce "at a trusted service layer", not in client JavaScript |

## Render

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 11 | **User-controlled HTML rendered raw** | Grep for `dangerouslySetInnerHTML`. For each hit, trace the value back to the row and the policy that lets a user write it. No sanitizer in `package.json` means no sanitizer | Blocker B1 of the PR 3 review. Chains with row 3: the policy is what makes it user controlled |
| 12 | No Content Security Policy | Does `next.config.ts` define `headers()`. Absence is not a blocker on its own, it is what turns row 11 from broken image into stolen session | S7 of the PR 3 review. `(unsourced)`, the CSP lead is still `todo` |
| 13 | Error text carrying a row or a query into the response | Does a thrown error interpolate data the caller could not otherwise read | `(unsourced)` |

## Rows this agent has not yet earned

These are the categories where a real finding would probably be missed today. Recorded so the
gap is visible rather than implied by silence.

- Multi-tenant and cross-account reads. Dialecta has one tenant, so nothing has exercised it.
- Rate limiting and cost. No row here, and the classification pipeline calls a paid model.
- Storage bucket policies beyond public read. `article-media` is the only bucket and it is read
  only from the client today.
- Realtime and broadcast channels, which have their own authorization surface and appear in none
  of the notes filed so far.

*Written 2026-09-19, first pass. Rows 3 and 11 came from PR 3 and are the two that found real
blockers; the rest are held in advance.*
