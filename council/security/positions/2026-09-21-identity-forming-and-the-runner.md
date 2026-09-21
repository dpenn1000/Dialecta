## Brief

Key every person on `profiles.id` and resolve the caller once per statement through
`(select current_profile_id())`. Claiming then moves no reference: `claim_profile()` sets
`profiles.user_id` on one row inside one hardened function (`supabase/migrations/20260920000200_profile_claim_tokens.sql`,
lines 113-165). Keyed on the auth uuid, a claim has to rewrite the 18 Ghost-keyed person columns on
16 tables inside a definer function every later table must join, or the 14 get auth users
pre-created by email, which reopens the email match the claim token replaced. The same column cuts
off a stolen session without deleting a word: Supabase says access tokens of revoked sessions
"remain valid until their expiry time", and nulling `user_id` fails them at every policy on the
next statement.

**Seat:** security. **Written:** 2026-09-21. **Question:** 1. Nothing was sent to a database
tonight.

## The identity key

### Evidence

| Kind | What |
| --- | --- |
| Measured by others, filed | The key census: `team/architect/knowledge/2026-live-schema-hygiene-census.md`, "Identity". Column privileges: `exchange/open/2026-09-21-convener-05`. `articles.author_member_id` NOT NULL: `exchange/open/2026-09-21-architect-06`, item 7. Grants on all 30 tables: `council/security/research/2026-live-grant-and-policy-surface.md`, 2026-09-20 |
| Read from files | The migrations, cited by line; `apps/web/src/app/api/comment/route.ts` and `api/article/route.ts`; the archived foundation migration |
| Fetched tonight | PostgreSQL 17 row security and SQL functions, two PostgreSQL wiki pages; Supabase RLS, advisors, sessions, signing out and user data; the OWASP IDOR cheat sheet |
| Reasoned, not measured | The lookup's cost, the stolen-session row, the claim rewrite |
| Unmeasured | Whether `20260921053807` is live. Whether anything fires on insert into `auth.users` |

### Recommendation

Every person reference becomes `profiles.id` under a foreign key. One definer function,
`current_profile_id()`, reads `profiles.user_id`, the column that binds an account to a profile, and
every owner policy calls it as `(select current_profile_id())` and names `TO authenticated`. Ghost
ids stay on `profiles` as nullable attributes.

### The two keys

| | `profiles.id`, through `(select current_profile_id())` | The auth uuid, against `auth.uid()` |
| --- | --- | --- |
| Claiming a legacy profile | Sets `profiles.user_id` on one row and spends the token, already built and hardened (`20260920000200`, lines 113-165). No reference moves | Every legacy row's person column rewritten at claim, 18 columns on 16 tables today (census, "Identity"), or auth users pre-created by email |
| Definer functions | One at request time. `get_own_profile_for_comment()` and `current_member_is_author()` become plain reads once nothing writes a Ghost id, since `id`, `display_name`, `handle` and `is_author` are granted to both roles (`20260920192954`, lines 22-32) | None at request time. The claim function carries the width instead |
| Cost per statement | One probe of the unique index on `user_id`, when wrapped (reasoned) | Reading the JWT |
| An unclaimed session | Null, so every `=` comparison fails closed: PostgreSQL skips rows "for which the expression does not return true" ([row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)) | No such state for a native member. A legacy member's rows carry no key they could match until the claim rewrites them |
| What public rows publish | `profiles.id`, public already by grant, so the byline can embed it (`20260921041813`, lines 11-12) | The auth uuid, private today: `user_id` is in neither role's column grant (`20260920200500`, lines 19-22; `20260921053807`, lines 7-8), and "For security, the Auth schema is not exposed in the auto-generated API" ([Supabase, user data](https://supabase.com/docs/guides/auth/managing-user-data)). Keying public rows on it publishes that value for no reader. The `sub` alone authenticates nothing; the cost is in the stolen-session row |
| A stolen session | Setting `user_id` to null fails it at every policy on the next statement, and nothing is deleted (reasoned). The same function is where a `session_id` check against `auth.sessions` would go, which Supabase describes ([sessions](https://supabase.com/docs/guides/auth/sessions)) | "Access Tokens of revoked sessions remain valid until their expiry time" ([signing out](https://supabase.com/docs/guides/auth/signout)), one hour by default ([sessions](https://supabase.com/docs/guides/auth/sessions)). The faster levers orphan or delete the member's rows |
| Deleting the account | `on delete set null` (`20260920000200`, line 46) unlinks it and keeps the profile. Each table's own foreign key decides the rest | As drawn, a cascade from `auth.users` through `profiles` into comments, replies and `axis_events` (`supabase/migrations/_archived_2026-09-19/20260919000000_foundation.sql`, lines 48, 117-118, 236) |

### Rules for the key

| Rule | Why | Check |
| --- | --- | --- |
| Wrap every call in a subselect | A definer with a `SET` clause is never inlined: inlining needs a function that "is not SECURITY DEFINER" and "has no SET clauses" ([wiki](https://wiki.postgresql.org/wiki/Inlining_of_SQL_functions)). Wrapping caches it per statement "rather than calling the function on each row" ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)); Supabase measured a definer helper at 11,000 ms unwrapped and 7 ms wrapped (`team/architect/knowledge/2026-supabase-rls-performance.md`, row 3). Both `comments` owner policies call `current_ghost_member_id()` unwrapped (`20260920200500`, lines 115 and 132), and lint 0003 matches only `auth.*()` and `current_setting()` ([advisors](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0003_auth_rls_initplan)), so the census's advisor run flagged `opinion_map_self_read` and neither of these | A test over `pg_policies`: every helper call sits inside a subselect |
| Move it out of `public` | "Never create one in a schema listed under 'Exposed schemas'" ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)). `public` is exposed here: the routes call `get_own_profile_for_comment` through it (`comment/route.ts`, line 139). `claim_profile()` stays exposed on purpose, because a client is meant to call it | Every definer in an exposed schema is on a named allowlist; `anon` executes none |
| Owner policies are `TO authenticated`; a published-or-own policy is written as two | Policy expressions run "with the privileges of the user running the query" ([row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)), and `20260921053807` line 91 revoked `anon`, so a `TO public` policy calling the helper errors for every visitor | `policy_roles_are` in pgTAP (`team/migrator/knowledge/2026-supabase-pgtap-rls-testing.md`) |
| Compare with `=`; a person key is NOT NULL wherever every row has an owner | `is not distinct from` or `coalesce` against a nullable key matches every ownerless row for an unclaimed session. `articles.author_profile_id` is nullable (`20260921041813`, line 29) | No null-safe comparison against the helper in `pg_policies` |
| `profiles.user_id` takes no update grant for either role, and an insert may bind only the caller's own `auth.uid()` | Every owner policy rests on it. The table-level write grants on `profiles` were open on 2026-09-20, and no migration file since revokes them (two live migrations, `035036` and `035136`, have no file: `architect-04`). Only the absence of a write policy stands between `authenticated` and that column, so the first owner-update policy for a settings page would open it, with `is_admin` beside it | `has_column_privilege('authenticated', 'public.profiles', 'user_id', 'UPDATE')` is false |
| Test the helper before any policy uses it | A wrong answer hands one member another's rights on every table. A SQL function returns "the first row of the last query's result" ([SQL functions](https://www.postgresql.org/docs/17/xfunc-sql.html)), so the unique index on `user_id` is load-bearing | Two claimed subs get their own ids, an unclaimed sub gets null, and the unique index exists |
| No route or server action reads a person id from a body, form or search parameter | The way the Ghost id became a credential, below. Service-key code has no row security behind a mistake, and question 3's runner is service-key code, so it takes its member from the publish action's verified session, never from the request | A CI rule over route handlers and server actions |
| Close the Ghost columns on public rows to `anon` once nothing a visitor loads reads them | `comments.member_id` and `articles.author_member_id` still publish the legacy credential (`convener-05`). No handler in `_recovered/api` names an anon key, and the comment handlers build their client on the service key (`comment.js`, line 64; `comments.js`, line 67), which no grant reaches, so the revoke waits only on `apps/web`. Dropping the columns waits for cutover: the legacy comment handler still writes `member_id`, and the map puts the re-key (step 2) before cutover (step 8) | `has_column_privilege('anon', ...)` is false on both columns |

### Publication

Publication didn't make the Ghost id a credential. `api/comment.js` looking up a body-supplied copy
on the service key did (`council/security/research/2026-dialecta-comment-credential-chain.md`, lines
46-54). `profiles.id` goes the same way the day a port renames `member_uuid` to `profile_id` instead
of deleting it. OWASP: "determine the currently authenticated user from session information" ([IDOR cheat sheet](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html)).

Keep the `gen_random_uuid()` default on `profiles.id` and never pass the auth id into it. Supabase's
samples key profiles on the auth id ([user data](https://supabase.com/docs/guides/auth/managing-user-data)),
so a policy copied from them (`= auth.uid()`) then fails for everyone on its first test, instead of
passing on native accounts and shutting out the 14.
`opinion_map_self_read` shows the silent version already: it compares the JWT `sub` with Ghost ids
and matches none of its 9 rows (census, "Identity").

### The claim flow

Under the auth uuid, the spec's Phase 2 remap ("after a coordinated remap pass",
`docs/Dialecta_Data_Architecture.md`, line 39) needs an auth uuid for each of the 14 when it runs,
which for anyone not yet signed in means one pre-created by email. Whoever first proves that address
then owns the rows, which the landed M1 rule forbids: "A legacy profile is taken over
only against a valid claim token, never on a bare email match" (`docs/plans/phases-and-missions.md`,
line 112).

Under `profiles.id` the claim needs three things. `ghost_member_id` becomes nullable, since a native
member has none. Something issues tokens, and nothing in the repository does. And ADR-002's
"profile trigger" must not fire on `auth.users`: `claim_profile()` refuses a session already bound
to a profile (`20260920000200`, lines 148-161), so a profile made at first sign-in blocks the claim
until someone deletes it. Morning audit item 2.1 signs Dan in before he claims.

### The `articles` author policy

The frame has `security` designing it; `docs/MORNING-AUDIT-2026-09-21.md` line 38 now says done.
The policy is drawn and, per its header, applied (`20260921053807`; unmeasured tonight). It
keys on `author_profile_id` through `current_profile_id()` and pins `author_member_id` through
`current_ghost_member_id()` beside it (lines 118-145). That pin shuts out every native author: a
native member has no Ghost id to match, and `author_member_id` is NOT NULL (`architect-06`, item 7).
The re-key drops it and turns `current_member_is_author()` into a subquery on `is_author`. The
column grants stay; they stop self-tiering.

### Veto

ADR-002's drawn shape: `user_id` as primary key, cascading from `auth.users` into every person table
(foundation migration, lines 48 and 236). One account deletion removes that member's ledger and
other members' replies, and no policy is consulted. Foreign key references "always bypass row
security" ([row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html)), and cascades
"allow users to modify rows in RS-protected tables that they should not be able to"
([wiki](https://wiki.postgresql.org/wiki/Row-security)). That makes the append-only ledger
(`supabase/CLAUDE.md`, line 10) a convention. Whatever key wins, the ledger's foreign keys are
`restrict`, including the `comment_id` cascade live has now (fingerprint debate log, line 178). Drop
the cascade and the auth uuid is only the worse key. What deletion owes is `legal`'s.

### What would change my mind

Dan retiring the 14 legacy profiles, with `legal` ruling that closing an account erases what it
wrote. The claim ground goes, and the auth uuid costs only the stolen-session row, which a
suspension lookup could restore. Or a staging measurement where the wrapped lookup adds more than a
millisecond per statement over a direct comparison at 100,000 profiles.

## Rebuttal

**The form, conceded to `spec-reader`.** Changing ADR-002's column is a reversal in writing, and a
note leaves standing the lines agents build from: `.claude/agents/migrator.md:13` ("Supabase
identities are `uuid` referencing `profiles.user_id`") and `docs/plans/build-plan.md:8`
("`profiles.user_id` is the key"). An agent obeying the ADR over the database is then the only
guard, and `council/security/charter.md:31` vetoes "a control that is only a convention". The
superseding ADR should name `current_profile_id()` as the one resolver and correct those files in
the same change.

**The substance survives.** ADR-002 states its own reason for the column: "`auth.uid()` in RLS is
what lets every engine feature ship without a service-role key in the request path" (line 15).
`current_profile_id()` reads `auth.uid()` inside RLS, and no service key enters the request path.
The comparison gains one lookup, the one that makes revocation a single statement.

**Momentum, conceded.** `migrator` is right that the form now trails the database, and this seat
put it there: `20260921053807` keys a policy on a function no decision names, applied per its
header (unmeasured). If Dan rules `user_id`, it's the first policy to rewrite, and it matches nobody
until a claim lands (`docs/MORNING-AUDIT-2026-09-21.md:38`).

**The convener's count is right.** The section under `## Brief` runs 128 words. The brief is the
paragraph, 114; the metadata line belonged below the section, and the file stays as filed.

**My runner rule, corrected.** It gives the runner its member from the publish action's session.
Under `builder`'s resolution action that can name the wrong person: a final tier takes 35% from
community votes, and the threshold "that triggers a re-review event" is still open
(`packages/core/src/resolution.ts`, lines 4-8 and 18-19). One member's vote can re-resolve
another's comment. The member comes from the comment row the action reads, never from the request
or the voter's session.
