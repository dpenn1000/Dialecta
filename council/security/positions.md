# Standing positions and practices

A practice is settled until evidence moves it. Confidence is the agent's own read.
Evidence names the file in `knowledge/` that backs it, or `(unsourced)` when nothing does.

## How this agent works

| Practice | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Read the deployed source, not this repo's copy of it, and say which one you read | high | `2026-vercel-deployed-api-provenance.md`: the production commit does not exist on GitHub, the repository holds 11 api files against the deployment's 38, and nothing on this machine has the difference. For this API there is no other copy to read | 2026-09-20 |
| Never exploit against production. Where a live check is the only way to settle it, state what the request would write and ask first | high | The 2026-09-20 probe that created a row in the live `profiles` table. Held again this sprint: `2026-dialecta-comment-credential-chain.md` is ranked from a docblock rather than from a test POST that would have created a comment and spent a classification | 2026-09-20 |
| A clean Supabase security advisor means the database is configured, not that the application is safe | high | `get_advisors` returned zero lints on the same project and day the profile endpoint was found wide open | 2026-09-20 |
| A policy is not a control until you know what `anon` and `authenticated` are granted on the table | high | `2026-live-grant-and-policy-surface.md`. Measured rather than assumed: all 30 tables grant full CRUD to both roles, so RLS is the only control and there is no second layer under it | 2026-09-20 |
| A measurement that returns nothing may be reporting that it cannot see, not that there is nothing there. Confirm a negative with a method that asks directly | high | `2026-live-grant-and-policy-surface.md`. `information_schema.role_table_grants` showed no grants for either role, which reads as a closed database and was exactly inverted. `has_table_privilege` is not filtered by the session's own roles | 2026-09-20 |
| A commit SHA recorded against a deployment is a claim, not provenance. Verify it against the forge before citing it | high | `2026-vercel-deployed-api-provenance.md`. A `source: cli` deployment records whatever the local checkout reported, including a commit nobody pushed. Root `CLAUDE.md` cites `53364fa` as though it were retrievable | 2026-09-20 |
| Rank by what is reachable today, not by what a planned feature would expose | high | `.claude/agents/security.md`. Applied this sprint to `2026-live-storage-surface.md`, where a public bucket holding zero objects is a note rather than a blocker | 2026-09-20 |
| Every finding carries a reproduction and a blast radius, or it is a category rather than a finding | high | `.claude/agents/security.md` | 2026-09-20 |
| Name whose account a fix needs. A production redeploy of another repository is a different item from a change here | high | `2026-vercel-deployed-api-provenance.md`; record `2026-09-20-security-01`, where the whole item is one token Dan holds and no agent can | 2026-09-20 |
| Say what a finding does not establish, in the finding | high | `2026-dialecta-comment-credential-chain.md` states that the handler body is unread and names what would settle it. A finding that hides its own gap gets believed at the wrong confidence and is harder to correct later than one that does not | 2026-09-20 |
| When a control's absence is currently harmless, record why it is harmless, because "nobody has written one yet" and "deliberately closed" look identical in a catalog | medium | `2026-live-storage-surface.md`: zero storage policies is doing the work a deliberate policy should do. `2026-live-grant-and-policy-surface.md`: `FORCE` being off on all 30 tables is harmless only because there is one definer function and it is unreachable | 2026-09-20 |
| On a question of law, insurance or liability, state the limit and name who settles it. This seat holds whether a control works, not whether it is the one owed | high | The six notes in the data protection section each carry that limit. `council/legal/` holds the other half | 2026-09-20 |

## What this agent argues for

A council seat owes a recommendation, not only a measurement. These are ranked by what they buy
against what they cost, and each names the note that backs it. None of them is decided; Dan decides.

| Position | Confidence | Why | Evidence |
| --- | --- | --- | --- |
| Recover the deployed API source before P0-3 flips `git.deploymentEnabled` | high | One token and one script run against roughly 29 endpoints that exist in no repository and no backup. A successful build from `Dialecta` takes the alias and they stop serving. Everything else this seat owes is behind it | `2026-vercel-deployed-api-provenance.md`, record `2026-09-20-security-01` |
| Narrow `profiles` by column grant or public view, and treat `ghost_member_id` as the first column rather than one of the set | high | `is_admin` and `subscription_tier` disclose. `ghost_member_id` may authorize, which is a different class of exposure and a different clock | `2026-dialecta-comment-credential-chain.md`, `2026-live-grant-and-policy-surface.md` |
| Revoke the write grants on `public` before or with the migration that adds write policies, never after | high | The grants are already open on all 30 tables. The proposed foundation migration adds owner writes own row policies, which go live the moment it runs. Doing the revoke afterwards leaves a window with both open | `2026-live-grant-and-policy-surface.md` |
| Constrain the classifier's output space rather than harden its prompt | high | A comment is untrusted text that reaches a model whose answer sets a tier. An `enum` schema makes a manipulated comment unable to select an untrusted value by construction. Prompt wording is not a control against injection and OWASP does not treat it as one | `2026-anthropic-structured-outputs.md`, `2025-owasp-llm01-prompt-injection.md`, `2025-willison-prompt-injection-design-patterns.md` |
| Put a length cap and a rate limit on every route that reaches Anthropic, and isolate the key in its own Anthropic workspace with a spend limit | high | Seven deployed routes call Anthropic and it is unknown for all seven whether they can be reached without credentials. Vercel Hobby has no Spend Management at any price, so the ceiling has to come from the Anthropic side and from one free rate limit rule | `2026-vercel-firewall-and-spend-management.md`, `2026-anthropic-rate-and-spend-limits.md`, `2021-kelly-denial-of-wallet.md` |
| Set `feedback-screenshots` to private and serve through signed URLs before anything is written to it | medium | The bucket is public read and empty. A screenshot is whatever was on the contributor's screen, which is the least predictable source of personal data on the platform. The change costs nothing today and costs URL invalidation later | `2026-live-storage-surface.md` |
| Wire content based secret scanning into CI, and stop relying on the filename ignore block | high | The ignore block now covers both spellings of the name that caused the incident and misses `secrets.json`, `service-key.txt` and `creds.yaml`. A denylist of names fails on the first name nobody predicted, which is what happened | `2026-dialecta-secret-and-artifact-hygiene.md`, `2026-gitleaks-secret-scanning.md` |
| Write a retention number for fingerprint inputs before launch, not after | medium | Minimisation and retention limits are statutory duties under both Connecticut law and the GDPR rather than good practice. The data set is 14 rows today, which is the cheapest it will ever be to decide | `2023-ct-data-minimization-retention.md`, `2023-ct-data-privacy-act.md` |
| Treat any MFA claim on a future insurance application as a statement about scope, and answer it from what is actually enforced | high | In Travelers v. International Control Services the insurer rescinded the policy rather than denying a claim, because the application overstated where MFA applied. Enrolment is not enforcement, and in Supabase the difference is whether a restrictive policy reads the `aal` claim | `2022-travelers-mfa-warranty-rescission.md`, `2026-supabase-auth-mfa.md` |
| Decide P0-D2 with the verification question answered rather than assumed | medium | Automatic identity linking by email is on by default in Supabase, and neither Supabase doc states whether an unverified Google email can trigger it. If it can, then Google sign in is an account takeover path for any address a contributor already used | `2026-supabase-google-oauth.md` |

### Per debate

| Debate | File | Standing |
| --- | --- | --- |
| The Next.js rebuild | [positions/nextjs-rebuild.md](positions/nextjs-rebuild.md) | Written 2026-09-20 ahead of the mission. Eleven sections. The load bearing one is the first: the two migrations the rebuild starts from carry 30 policies and zero `GRANT` or `REVOKE`, so column privileges are the thing that turns reviewer blocker B2 from a policy bug into an impossibility |

## What this agent does not hold

Defamation, harassment and the question of which obligations the platform owes at all. Those are
`council/legal/`. The line is that this seat holds whether a control works and `legal` holds
whether it is the right control to owe. Overlap with `reviewer` on diff level security is expected
and was confirmed as intended.
