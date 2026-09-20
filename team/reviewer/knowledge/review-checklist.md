# Review checklist

Check 2 of `.claude/agents/reviewer.md` is one paragraph. This file is the same check as a list
of named failure modes, so a review either hits a named row or records a new one.

Every row names the failure, the question that finds it, and the evidence behind the question.
A row with no evidence file is marked `(unsourced)` and is a first-principles guess until a
sprint backs it.

## How to use it

Run the rows in order on any diff that touches `supabase/migrations/`, `apps/web/src/lib/`,
`apps/web/src/app/api/`, or a server action. Rows 1 to 9b are the database, 10 to 13b are the
application, 14 to 16 are the render. A row that does not apply is skipped out loud in the
report rather than silently.

Read the grant layer before the policy layer. Grants decide whether a role reaches the table at
all; policies decide which rows. A reviewer who starts at the policy has already assumed the
answer to the first question. See [2026-supabase-default-grants](2026-supabase-default-grants.md).

Severity convention used below: a **blocker** is reachable by a signed-up user with no special
role, through the published anon key, today. A **should-fix** needs a second condition that is
not yet true.

## Database, the grant layer

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 1 | Table relies on Supabase's default grants, which are being removed | Does the migration revoke or narrow the defaults, or is it silent. Silence is correct only until 2026-10-30 for this project, and a table created before then keeps its grants permanently | [2026-supabase-default-grants](2026-supabase-default-grants.md); [2026-postgresql-public-default-privileges](2026-postgresql-public-default-privileges.md) confirms `PUBLIC` itself grants nothing extra on a table, so the `anon`/`authenticated`/`service_role` grants are the whole picture here. Existing tables "keep their current grants and stay reachable", so waiting is not a remedy |
| 2 | Pipeline-only table left reachable by `authenticated` | Does a role that should never write this table still hold a table-level grant on it. `axis_events`, `classifications` and `fp_snapshots` are pipeline only, and a revoke is a stronger position than a policy | [2026-supabase-default-grants](2026-supabase-default-grants.md): new tables in `public` get insert, update and delete for `anon` and `authenticated` by default |
| 3 | **Column-level revoke that is a silent no-op** | Does a fix write `revoke update (column)` against a role that holds the table-level grant. If so it changes nothing and raises nothing | [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md): "the table-level grant is unaffected by a column-level operation". This is a finding on its own and an easy one to approve by mistake |

## Database, the policy layer

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 4 | Table added with no `enable row level security` | Does every `create table` in the diff have an `alter table ... enable row level security` next to it | `supabase/CLAUDE.md`; [2026-supabase-row-level-security](2026-supabase-row-level-security.md), "Enable RLS on every table in an exposed schema". Caught automatically: `rls_disabled_in_public`, ERROR level, in [2026-supabase-database-linter](2026-supabase-database-linter.md) |
| 5 | RLS enabled, no policy, table reads as empty | For each new table, which operations have a permissive policy, and is a missing one deliberate | [2026-postgresql-create-policy](2026-postgresql-create-policy.md). A missing `select` policy is silent, so no test will fail on it. Caught automatically at INFO level (`rls_enabled_no_policy`) per [2026-supabase-database-linter](2026-supabase-database-linter.md), which will not fail a gate that only breaks the build on ERROR |
| 6 | **Owner may write a column only the pipeline should set** | For each `for update` policy, list the table's columns and ask which the owner may set. Tier, status, timestamps and any window column are the usual answers. The remedy is a table-level revoke followed by a column-list grant, never a column-level revoke | [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md) has the worked fix for `comments`, `articles` and `aspirations`; [2025-owasp-asvs-authorization](2025-owasp-asvs-authorization.md) requirement 8.2.3, BOPLA. Blocker B2 of the PR 3 review. **No rule in [2026-supabase-database-linter](2026-supabase-database-linter.md)'s 30-rule set inspects a column-level grant.** `supabase db lint` clean says nothing about this row |
| 7 | Owner sets a restricted column at insert time instead of update time | The insert policy usually checks only `auth.uid() = owner`. Ask the row 6 question again for `INSERT`, with its own column list. A fix that covers `UPDATE` and not `INSERT` leaves the hole open | [2026-postgresql-column-privileges](2026-postgresql-column-privileges.md), cautions. `comments.status` is reachable this way in the PR 3 schema. Same tooling gap as row 6: not in the linter |
| 8 | `update` policy with `using` and no `with check` | Read the `using` expression twice, as the visibility rule and as the write rule, because it serves as both | [2026-postgresql-create-policy](2026-postgresql-create-policy.md): "if no `WITH CHECK` expression is defined, then the `USING` expression will be used both" |
| 9 | Ledger table given an update or delete policy, or a `security definer` function with a mutable `search_path` or no revoke | Does any append-only table gain `for update` or `for delete`. For a definer function, four questions: is `pg_temp` last in `search_path`, is execute revoked from `PUBLIC`, are create and revoke in one transaction, and does the body touch a table whose RLS it now skips | `.claude/agents/reviewer.md` check 2; `supabase/CLAUDE.md`; [2026-postgresql-security-definer](2026-postgresql-security-definer.md); [2026-postgresql-public-default-privileges](2026-postgresql-public-default-privileges.md) on why `PUBLIC` needs its own revoke for a function specifically. Missing revoke is a blocker, because the body looks normal. Partly caught by tooling: `anon_security_definer_function_executable` / `authenticated_security_definer_function_executable`, WARN level, per [2026-supabase-database-linter](2026-supabase-database-linter.md), catch callability but not `search_path` or the same-transaction requirement |
| 9b | RLS treated as enforced for every connection | Which role is this connection. Table owners bypass RLS by default, so a policy can read as enforced in a migration and not apply to the role running the query | [2026-postgresql-create-policy](2026-postgresql-create-policy.md), section 5.9: "Table owners normally bypass row security as well". Not reachable through the Data API, which connects as `anon` or `authenticated`. It is what makes row 9's fourth question matter. **Settled, not open: [2026-postgresql-force-rls-supabase](2026-postgresql-force-rls-supabase.md) confirms `FORCE ROW LEVEL SECURITY` would not close this on Supabase, because the owner role `postgres` carries `BYPASSRLS` directly and `FORCE` does not affect a `BYPASSRLS` role. The only real control is which connections may authenticate as `postgres` or `service_role` at all, which is what the rest of row 9 already polices** |

## Application

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 10 | Secret renamed into the client bundle | Grep the diff for `NEXT_PUBLIC_`. Read every new name and ask whether the value is meant to be public | [2026-nextjs-environment-variables](2026-nextjs-environment-variables.md). The prefix is the entire check, there is no allowlist and no warning |
| 11 | Service-role client constructed where a request can reach it | Does any file importing the service key lack a server-only guard, and does any client component import it transitively | `.claude/agents/reviewer.md` check 2; [2026-nextjs-server-actions-authorization](2026-nextjs-server-actions-authorization.md) on why this cannot be delegated to a layout or to Proxy |
| 12 | Service-role write with no check that the originating user was permitted | For each write that borrows the service role, name the line that established the user's own permission first. The bypass is the point of the role and also the risk | [2025-owasp-asvs-authorization](2025-owasp-asvs-authorization.md) requirement 8.3.3: access "based on the originating subject's permissions, not on the permissions of any intermediary". Untested in this repo, no pipeline route exists yet |
| 13 | Rule enforced in a client island instead of the database | Is there a constraint the composer, the vote widget or the editor applies that a direct PostgREST call would skip | [2025-owasp-asvs-authorization](2025-owasp-asvs-authorization.md) requirement 8.3.1: enforce "at a trusted service layer", not in client JavaScript |
| 13b | **Server Action or Route Handler with no session check at all**, relying on a parent layout, `return null`, or Proxy/Middleware to have already gated access | Does the action or handler itself call something equivalent to `verifySession()` before it reads or writes, independent of whatever UI called it. **Separately, if a Proxy/Middleware file exists at all: is it named for this app's actual Next.js version** | [2026-nextjs-server-actions-authorization](2026-nextjs-server-actions-authorization.md): Next.js's own docs rule out both shortcuts. A layout hiding a child "will not prevent nested route segments and Server Actions from being accessed", and Proxy/Middleware "should not be your only line of defense... security checks should be performed as close as possible to your data source", true regardless of filename. **Filename trap, `council/security/positions/nextjs-rebuild.md` section 10:** Next.js renamed `middleware.ts` to `proxy.ts` in `16.0.0`. `apps/web` is on `15.5.25` today, so the correct filename is `middleware.ts` exporting `middleware`, not `proxy.ts`. Every current official sample, including the one quoted in the note above, uses the `16.0.0`+ name; copied verbatim it never runs, builds clean, and fails open with no error anywhere. No route or action exists yet in `apps/web`; held in advance like row 9's definer-function question was |

## Render

| # | Failure mode | The question | Evidence |
| --- | --- | --- | --- |
| 14 | **User-controlled HTML rendered raw** | Grep for `dangerouslySetInnerHTML`. For each hit, trace the value back to the row and the policy that lets a user write it. No sanitizer in `package.json` means no sanitizer. A sanitizer that runs only in the editor does not count, because row 6 shows the column is writable without it. **A second question once A-11 lands:** is `body_html` ever server-derived from `body_json` via `generateHTML`, and if so is that output sanitized too, not just a directly written `body_html` | Blocker B1 of the PR 3 review; [2026-cure53-dompurify](2026-cure53-dompurify.md). Chains with row 6: the policy is what makes it user controlled. [2026-tiptap-mergeattributes-xss](2026-tiptap-mergeattributes-xss.md): a real advisory (GHSA-cp6q-959q-f8rh) shows `generateHTML` can produce executable attributes from a crafted `body_json` independent of ProseMirror schema validation, so `body_json` is its own route into this row, not just `body_html` |
| 15 | Content Security Policy present but decorative | Not whether `headers()` exists, but whether `script-src` carries `'unsafe-inline'`. It permits the injected `onerror` handler that row 14 is about, so the common recipe stops nothing. Check `connect-src` too: it breaks the exfiltration leg even where the script runs | [2026-nextjs-content-security-policy](2026-nextjs-content-security-policy.md). The useful forms, nonce and experimental SRI, cost static rendering or ride on a flag |
| 16 | Error text carrying a row or a query into the response | Does a thrown error interpolate data the caller could not otherwise read | `(unsourced)` |

## Rows this agent has not yet earned

Recorded so the gap is visible rather than implied by silence.

- **Function-level access, ASVS 8.2.1.** No row covers a Postgres function exposed over
  PostgREST as an RPC endpoint. None exists in this repo yet, and the execute-grant half is
  covered by row 9, but the endpoint half is not.
- **Rate limiting and model cost.** No row here, and the classification pipeline calls a paid
  model.
- **Storage bucket policies beyond public read.** `article-media` is the only bucket and it is
  read only from the client today.
- **Realtime and broadcast channels**, which have their own authorization surface and appear in
  none of the notes filed so far.
- **Multi-tenant, ASVS 8.4.1.** Not applicable. Dialecta has one tenant. Listed so the absence
  is deliberate.

## Open question this checklist cannot settle

The 60 minute malleability window. `docs/Dialecta_Axis_Mapping_v1.md:35` requires deleting
prior `axis_events` on re-classification; the mandate and `supabase/CLAUDE.md` call that table
append-only and the migration correctly gives it no delete policy. They reconcile only through
the service role, which means append-only is a property of clients rather than of the table.
Until that is settled, row 9 cannot rule on any edit path, and `comments.hardened_at` exists
with nothing reading it. Recorded as the fourteenth finding on
`exchange/open/2026-09-19-002-handoff-pr-3-review.md`.

## What is missing above the checklist

ASVS 8.1.1 and 8.1.2 ask for documented authorization rules, field level, read and write.
Dialecta has none. The row policies are the only record of who may write what, and they are the
artifact under review, so they cannot also be the specification. Until that document exists,
every row above is this agent reconstructing intent from the code it is checking. That is the
structural weakness of this checklist and no amount of rows fixes it.

*Written 2026-09-19 and revised twice the same day: once after the ASVS chapter and the grant
layer were read, once after the render layer was. Rows 6 and 14 are the two that found real
blockers on PR 3. Rows 1, 2, 3, 7 and 12 were added after and would have caught more. Row 15
was rewritten because the first version of it asked whether a CSP existed, which is the wrong
question. Revised a third time 2026-09-20: row 13b added for Server Action and Route Handler
authorization; row 9b closed from an open hardening question to a settled no; rows 1, 4, 5, 9,
6, 7 and 14 gained tooling citations, the sharpest of which is negative, that the one gate the
mandate calls mandatory, `supabase db lint`'s 30 rules, does not check a column-level grant at
all, which is the exact shape of blockers B1 and B2.*
