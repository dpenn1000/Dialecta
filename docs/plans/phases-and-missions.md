# Phases and missions

*Written 2026-09-20. Four phases of setup, build and training. Nothing in M1 to M4 starts until the Phase 4 gate passes. Each mission then reaches the seats as one handoff to the chair, who dispatches it.*

## What was checked rather than assumed

| Checked | Found |
| --- | --- |
| The lost monetization research | **Not lost.** 20 filed sources on `main` under `council/treasurer/research/`, plus a standing position at `council/treasurer/positions/monetization.md`. The earlier search that concluded "no plan anywhere" is itself filed, with its own miss recorded |
| Auth | **Half done.** `ADR-002` decided Supabase Auth, magic link plus Google, `profiles.user_id` referencing `auth.users`. `apps/web` contains no auth code. The decision exists, the build does not |
| `apps/web` | Six pages, one API route: `/`, `/articles/[slug]`, `/community`, `/guidebook`, `/pact`, `/profile/[id]`, `/api/health` |
| Repo hygiene | Solved. All eleven worktrees clean, zero commits ahead of `origin/main` |
| The Council's output | **21 open exchange records. Zero closed.** Eleven position files. No position has been contested by another seat |

The last row is the problem. `exchange/SCHEMA.md` already defines `state`, `closed` and `outcome`. The mechanic exists and has never been used once. That is a discipline gap, not a design gap, and it is what "trained" has to mean here: a claim that survived a rebuttal, and a finding that reached an outcome.

---

## Phase 1: Close the loop

*A finding can reach a resolution. Blocks everything else.*

| Item | Owner | Detail |
| --- | --- | --- |
| Install the council service | **Dan** | `scripts\committee-service.ps1 -Action token`, then `-Action install`, from an elevated PowerShell |
| Add `VERCEL_TOKEN` to `.env` | **Dan** | Read scope. Without it `scripts/recover-deployment.mjs` cannot run and Phase 2 stalls |
| Answer the roster question | **Dan** | `council/log/2026-09-19-council-composition.md`. Legal is built. Three candidate seats remain open: the reader who never comments, Dan's own hours as a constrained resource, accessibility |
| Enforce the close step | Claude | A record sitting in `open/` with no reply has no cost today. Give the chair a standing duty to triage the queue and a seat a duty to answer or concede what is addressed to it |
| Drain the existing 21 | chair (`decider`) | Oldest first. Some will close as answered, some as abandoned. Both are outcomes |

**Done when:** the open count falls, and `exchange/closed/` is not empty.

---

## Phase 2: Ground truth

*The agents stop reasoning about a codebase nobody has read.*

| Item | Owner | Detail |
| --- | --- | --- |
| Recover the deployment artifact | Claude | `node scripts/recover-deployment.mjs`. About 40 API handlers against 11 in `dialecta-api` main, all 46 migrations, the `opinion-mapper` skill. Lands in gitignored `_recovered/`, promoted nowhere |
| Settle the Supabase collision | **Dan decides**, `migrator` drafts the options | The live project has 32 tables and 20 applied migrations. 10 of the 13 tables this repo's migrations create already exist with rows. Blocks P0-2 through P0-7 |
| Reviewer blocker 1 | `builder` | Stored XSS through `body_html`, no sanitizer |
| Reviewer blocker 2 | `builder` | Comment owners can set their own `final_tier` |
| Reviewer blocker 3 | `builder` | Axis mapping wrong on all six axes. `_recovered/api/_axis-mapping.js` is the spec-faithful implementation, so this is a comparison rather than a rewrite |
| Two zero-cost items | `security` | Make feedback screenshots private. Set a retention number for fingerprint inputs |
| Operation logs in a production artifact | `security` | Dozens of `*.log.json` shipped into the deployment. Not web-reachable, readable by anyone with dashboard access |

**Done when:** the schema question has a decision record, and the three blockers are closed records rather than open ones.

---

## Phase 3: Train by contest

*Positions that have survived something.*

Three debates, chaired by `decider`, in this order.

| Debate | Seats | Why this one, and why here |
| --- | --- | --- |
| **P0-D2, login methods** | full council | Already framed in `council/log/2026-09-19-p0-d2-login-methods.md`, and it is the direct input to M1. Narrow, so it is the cheapest first exercise of the debate machinery |
| **Monetization** | `treasurer`, `philosopher`, `designer`, `legal` | The prerequisite for M2, and there is a real disagreement to resolve rather than a gap to fill |
| **What the platform owes a person it labels** | `philosopher`, `legal`, `security`, `designer` | The fingerprint and the AI-assigned tier are the platform's own speech about a named person. `legal` holds two sources that cut opposite ways. The outcome bounds what M3 and M4 may build |

One cheap check belongs before the monetization debate: **Ghost Admin, Settings, Tiers.** The treasurer flagged it as the highest-probability unchecked location and could not reach it. If tiers are already configured with prices, the council would spend a debate arguing against a decision Dan already made.

**Done when:** each debate has a chair synthesis and an outcome, and at least one seat has marked a position conceded. A debate where nobody loses anything did not happen.

---

## Phase 4: The readiness gate

| Condition | Why it gates |
| --- | --- |
| Council service answers `/health` | Otherwise the Council convenes only from this machine |
| `exchange/closed/` is not empty | Proves the loop works before four missions start filling the queue |
| Supabase schema question decided | Every mission writes to that database |
| Three reviewer blockers closed | M1 would otherwise build auth on a comment table whose owner can set their own tier |
| P0-D2 decided | M1 cannot start without knowing which login methods ship |

---

## The mission handoffs

Each mission reaches the Council as one record to the chair, in `exchange/SCHEMA.md` format, filed at mission start rather than now. The chair dispatches to seats, runs rebuttal where seats disagree, and writes the outcome.

What each handoff carries: the question, the seats, what is already filed so no seat repeats work, the entry criteria, and the done test. What it does not carry is an answer. The seats are the specialists.

**Sequencing:** M1 and M2 share no files and can run together. M3 needs M1's login pages to exist. M4 absorbs all three.

### M1: Assess and build the auth system

| | |
| --- | --- |
| **To** | chair, dispatching to `builder` (build), `security` and `reviewer` (assess), `legal` (one scoped question) |
| **Entry** | Supabase schema settled, three blockers closed. **P0-D2 gates the provider half only**, not the whole mission: the claim-token work below is owed whatever P0-D2 decides and starts first |
| **Already filed, read first** | `docs/decisions/ADR-002-supabase-auth-identity.md` decides the shape: Supabase Auth, magic link plus Google, `profiles.user_id` referencing `auth.users`, login UI ours. `council/security/research/2026-supabase-auth-mfa.md`, `2026-supabase-rls-testing.md`, `2026-live-grant-and-policy-surface.md`, `2026-dialecta-comment-credential-chain.md`. Backlog Phase B |
| **The assess half** | Every public table grants select, insert, update and delete to `anon` with RLS as the only control, and an unauthenticated `GET /api/profile/:id` creates production rows. Auth layered on that is decoration. `security` owns the finding, `reviewer` owns whether the fix holds |
| **The claim is ours, the link is Supabase's** | `security` named the boundary on 2026-09-20 and it is the first requirement of this mission. Supabase decides whether two identities are the same user. **P0-6 decides whether a user is one of the fourteen and hands them an existing profile with existing comments**, and only that second decision is in this repository. It runs later, separately, and it can refuse. Two decisions made six weeks apart had never been read as a pair: Supabase links identities by email automatically, and ADR-002 makes email the claim on a pre-existing account. Together that is an account takeover path against all fourteen legacy members, Dan included, and it does not depend on which providers ship |
| **The control, ranked first of three** | Issue each of the fourteen a **one-time claim token out of band** and require it to take over a legacy profile. A token is a secret Dan issues; an email address is a fact an attacker asserts. It is the only control still correct if a provider's own verification is compromised, and it is one table and one check. Second, as defence in depth: gate the claim on the provider's verification read here rather than trusted upstream, using `auth.identities.provider` and `identity_data`, both measured present and populated. Third, holding a second provider until the fourteen have claimed, is a hedge rather than a control and does nothing for whoever never claims, who are exactly the people nobody is watching |
| **The one legal question** | **Reframed 2026-09-20.** The original asked whether the six pillars and the archetype are sensitive data under the amended CTDPA. That rested on Dan living in Connecticut and he lives in Arizona. The question splits: establishment follows Dan, affected-individual residency does not move, and reader location never touched Connecticut. `legal` is establishing Arizona from primary sources and settling which test carries each claim |
| **Done** | A contributor signs in with the agreed providers. **A legacy profile is taken over only against a valid claim token**, never on a bare email match. `reviewer` confirms no path writes a row without `auth.uid()`, and no path links an identity to one of the fourteen without the claim succeeding |

### M2: Subscription model, advertising, and content

| | |
| --- | --- |
| **To** | chair, dispatching to `treasurer` (owner), contested by `philosopher`, `designer`, `legal` |
| **Entry** | Monetization debate has an outcome. Ghost Tiers checked |
| **Already filed, read first** | `council/treasurer/positions/monetization.md` and all 20 sources under `council/treasurer/research/`. The cost floor, the Kelly arithmetic, the MetaFilter ad collapse, the Medium pooled-payout objection and the INN grant-mix evidence are already sourced. `2026-search-for-the-subscription-plan.md` records where the prior plan is not, so no seat repeats that search |
| **The conflict to resolve** | Dan asks for tiers, elevated AI use as a benefit, more articles and comments, lifetime pricing and deep early-adopter discounts. The treasurer's standing position recommends one voluntary annual membership gating nothing, rules advertising out, and rules out paying contributors from a pooled subscription. Those do not reconcile themselves |
| **Three parts** | The model and what a paid tier may gate. Advertising, reopened against the filed evidence or confirmed closed. Content, which is the part that moves the number |
| **The measured position** | 269 visitors all time, 6 real people, 0 paying, 3 comments. Floor is $78 a month, or 19 annual memberships at $50. The funnel as measured needs roughly 17,000 visitors to get there |
| **Done** | An ADR on the model, a decision on advertising, and a publishing cadence with a first date |

### M3: Platform, pages and presentation review

| | |
| --- | --- |
| **To** | chair, dispatching to `designer` (owner), contested by `philosopher`, `voice-editor`, `legal` |
| **Entry** | M1 shipped, so the login pages exist to review |
| **Already filed, read first** | `docs/Dialecta_Social_UX_Architecture.md`, `Dialecta_Discourse_Layer_UX.md`, `Dialecta_Tier_Psychology.md`, `Dialecta_Editorial_Voice.md`, `Dialecta_Growth_Layer_Principles.md`. `council/designer/positions.md`, which already carries a WCAG contrast failure on Heat and Stance badges |
| **Scope** | Every page judged as a social media and journalism hybrid rather than as a blog: professionalism, cleanliness, simplicity, engagement. Six pages exist today. The recovered artifact shows what was once built and lost, including `aesthetic-suggest` and four article endpoints this repo lacks |
| **Done** | A per-page verdict, a ranked change list, and every change either built or recorded as a decision not to |

### M4: The final Next.js build

| | |
| --- | --- |
| **To** | chair, dispatching to `builder` (owner), gated by `reviewer` and `security`, with `spec-reader` on conformance |
| **Entry** | M1 shipped, M3's decisions recorded |
| **Already filed, read first** | `docs/plans/build-plan.md`, `docs/plans/backlog.md`, `docs/Dialecta_Data_Architecture.md`, `Dialecta_Classification_Engine_Specification.md`, `Dialecta_Axis_Mapping_v1.md` |
| **The promotion rule** | `_recovered/` is quarantine. Each file is reviewed and promoted individually or left. Nothing is merged wholesale, because the September migrations were written without knowledge of the live database and that is the same mistake pointed the other way |
| **Done** | The destination build serves every page, `spec-reader` confirms conformance to the specs above, and `_recovered/` is empty of anything worth keeping |

---

## What I need from Dan

| | |
| --- | --- |
| **Elevated PowerShell** | Install the council service. Two commands |
| **`VERCEL_TOKEN` in `.env`** | Read scope. Unblocks the artifact recovery |
| **Ghost Admin, Settings, Tiers** | One screenshot. Decides whether the monetization debate is arguing against a decision already made |
| **The roster question** | Three candidate seats still open |
| **The Supabase call** | Adopt the live schema, or re-migrate |
