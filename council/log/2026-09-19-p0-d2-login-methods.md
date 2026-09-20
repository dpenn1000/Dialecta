# P0-D2: login methods, and whether sign-up is open at cutover

*2026-09-19. Council frame, step 1 of `/dialecta-council`. Advisors not yet run.*

## Question

Which sign-in methods `/login` offers at cutover, and whether a stranger who finds
dialecta.org can create an account or only people Dan invites can.

### Half of this is already decided

ADR-002 chose "Supabase Auth, magic link plus Google" in its Decision section, and backlog
P0-4 carries that same pair as the build item. The method question is settled unless Dan
reopens it, and reopening it is a new ADR superseding 002, not a council debate.

Passkeys are the "later?" in the backlog row and are not on this question. Whatever method
creates the `auth.users` row, `profiles.user_id` still references it, so adding a method
afterwards does not re-key identity.

What is open, and what nothing in the repo has decided, is the sign-up gate. That is what
the council should argue.

## What it blocks

| Id | Item | How |
| --- | --- | --- |
| P0-4 | Supabase Auth, `/login`, `/logout`, profile row on first sign-in | Directly. An invite gate changes the trigger on `auth.users` and adds a table |
| P0-6 | Legacy member mapping for the 14 Ghost members | Sits on P0-4 |
| A-1 | Composer island | Sits on P0-4. No signed-in author, no comment |
| B-3 | Profile page on Supabase Auth | Sits on P0-4 |
| C0-4 | DNS cutover to `apps/web` | The gate has to hold before strangers can arrive |

## Constraints already locked

| Constraint | Source | What it rules out |
| --- | --- | --- |
| Supabase Auth owns identity. `profiles.user_id` references `auth.users`, and `auth.uid()` in RLS is what lets engine features ship without a service-role key in the request path | ADR-002, Decision | Any gate holding a second list of who may enter outside the database |
| The 14 Ghost members are matched by email on first sign-in and linked to their existing comments and profile rows | ADR-002, Consequences; backlog P0-6 | An invite scheme that does not seed those 14. They would be shut out of their own rows |
| The login UI is ours: `/login` in `apps/web`, styled from the design spec, no vendor widget | ADR-002, Consequences | A hosted Supabase Auth UI. Google's consent screen is the one surface we do not own |
| Editorial Voice v1.2 governs every string a contributor reads. Observational and never evaluative, two sentences, and every message below Breach ends with the door open | root `CLAUDE.md`, Locked decisions | A turned-away message that reads as a rejection. "You are not on the list" is not a sentence this platform can write |
| `design/dialecta-design-spec.html` v1.3 is canonical. Copy token values; do not iterate on the nav gradient, page background, or grain | root `CLAUDE.md`, Locked decisions | Inventing a surface for the gate rather than styling an existing one |
| The spec wins over the code. Surface drift, propose a code fix, do not amend the spec | root `CLAUDE.md`, Locked decisions | Settling this in the schema and backfilling the document later |

## One branch cannot be costed yet

Root `CLAUDE.md` records that the live Supabase project holds 32 tables, among them a roles
and capabilities admin system. An invite mechanism may already exist there. Until
`exchange/open/2026-09-19-001-advice-supabase-schema-collision.md` resolves, the build cost
of the invite-only branch is unknown, and `treasurer` should record that rather than guess
at a number.

## Positions

Not yet run. Step 2. The three advisors write to
`council/<you>/positions/2026-09-19-p0-d2-login-methods.md` in parallel and the results are
appended here.

## Rebuttals

Not yet run. Step 3.

## Chair synthesis

Not yet written. Step 4. Options, costs now and later, what each forecloses, and one
recommendation.


---

## Reframed 2026-09-20 by the convener, before running

This frame is two days old and predates everything below. Read this section as the live question;
the original frame above is the record of what was asked before any of it was known.

**Dan's actual ask, verbatim, given to the `security` session on 2026-09-20:** "I would like the
user to be able to login using familiar credentials (Google, facebook, X, etc..) Please
investigate that from your perspective." The "etc." is his. **It is sourced to a session and not
to this repository**, which is a finding in its own right: ADR-002 records magic link plus Google
and nothing else, so a decision the Council cannot see has been steering the work.

**The verification gate is real, and only as honest as each adapter.** `security` read
`DetermineAccountLinking` in supabase/auth at `2e9ce6c8`. An email joins the match pool only when
`email.Verified || config.Mailer.Autoconfirm`. But the adapters differ:

| Pass the provider's real claim through | Hardcode `Verified` true |
| --- | --- |
| Google, GitHub, GitLab, Discord, Azure, Keycloak, generic OIDC | **Facebook** (both paths), **X**, Twitter, Apple's native ID token path, about eight smaller |

Carry the caveat as `security` wrote it: hardcoded true is not the same as false. Supabase assumes
those platforms only return confirmed emails. X's adapter has a comment asserting it, Facebook's
has none, and whether it holds lives outside Supabase's source and is unestablished.

**What is already settled and is not this debate's to reopen:**

- The **claim token** protects the 14 legacy accounts whatever ships. `security` established it,
  M1 carries it as its first requirement, and it depends on no provider's behaviour. So this
  debate is about **new contributors only**.
- `auth.users` and `auth.identities` are both **0**. Nobody has ever signed in, so there is no
  migration of existing linkages to design around.
- The second control reads `auth.users.email_confirmed_at`, not `identity_data`, which `security`
  withdrew after reading the source. And `config.Mailer.Autoconfirm` bypasses the gate for every
  provider at once, Google included.

**Three things nobody has costed:**

1. **X has been pay-per-use since February 2026 with no free tier.** It is the only provider on
   Dan's list carrying a recurring bill against a $78 monthly floor. `treasurer`'s call.
2. **Reddit has never been considered as a login provider.** It appears in this repository only
   as a distribution channel in `circulation`'s work. If it is in scope, it is unresearched.
3. **Each provider is a surface, a consent screen and a set of claims handed over.** `legal` on
   what each hands over, `designer` on what each costs a first-time contributor, `philosopher` on
   what choosing a provider does to a person, `circulation` on whether familiar logins measurably
   increase arrival or are assumed to.

**The question, restated:** which login methods ship for new contributors, and what has to be true
of a provider before it is added?


## Outcome
