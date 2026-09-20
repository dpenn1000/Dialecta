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

## Outcome

Open. Dan decides. ADR link recorded here when it is written.
