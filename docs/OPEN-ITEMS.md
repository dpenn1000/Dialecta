# Open items

*Assembled 2026-09-21 from `exchange/open/`, the port-or-rewrite debate log, the Council's filed
positions, and direct queries against the live database. Every claim about live state in this
document was measured today rather than read from a doc, because six things in this repository were
wrong about live state this week and each one was cheap to check.*

**Read the first section if you read nothing else.** Everything in it is free to decide, and other
work is stopped because it has not been.

---

## 1. Yours to decide, and blocking other work

| | What | Why it blocks | Where the evidence is |
| --- | --- | --- | --- |
| 1.1 | **The Underwriter price**, $50 a year against $100 | Vercel's Hobby licence and the gifting rebuild both need a number to exist. Deciding costs nothing and only charging waits on the missing documents | `treasurer`, `legal`, port debate "What is Dan's to decide" |
| 1.2 | **Two forked token values**, `--amber` and `--border-light` | Two hex values disagree between the design spec and the live site with no record of which was intended, or whether both should exist for different uses. Neither is live in `apps/web`, so nothing breaks by naming the answer and nothing resolves without it | `designer`, port debate |
| 1.3 | **Colour: territory or axis** | Your stated intent is that colour applies along the most relevant axis. Nothing built honours it, and `designer` measured against it and recommends against it. See section 5 | `council/designer/positions/2026-09-20-colour-and-the-breach-curve.md` |
| 1.4 | **`stage` against `delta_of`** | Evidence leans `stage`: already live, matches the spec, and a recovered file assumes it. Whether the Delta mechanic should ever support more than one revision is a product question | `migrator`, port debate |
| 1.5 | **Whether comment-side Stage 2.5 exists at all** | Ships flagged off either way. This decides whether it is ever turned on, and it needs a written spec the day it is | `builder`, `2026-09-20-builder-01` |
| 1.6 | **The 40-Order taxonomy** | No document anywhere describes what the 40 Orders are. `spec-reader` wants the port of `dialecta-profile-order.jsx` held until someone writes it down | port debate |
| 1.7 | ~~**The lost wood**~~ **FOUND 2026-09-21.** It was renamed, not lost: `WoodFrameProgressBar.jsx` became `_recovered-next/lib/theme/dialecta-reflection-bar.jsx`, 306 lines against the 165 the audit recorded, and the Council had already ruled it ports as-is. Three searches missed it because all three searched the old name. `--wood-grain` the CSS token is still unpainted, which is a separate and much smaller question | closed |
| 1.8 | **A CVD-safe twelve-colour palette costs resemblance** | Optimised, twelve territory hues reach seventeen times better separation under colour blindness. The cost is that politics stops being red and history stops being brown | `designer`, section 5 |

---

## 2. Broken on live right now

| | What | Evidence | Fix |
| --- | --- | --- | --- |
| 2.1 | **`opposing_view_engaged` loses data on every comment.** `route.ts:260` widens a boolean back to the enum as `'yes' : 'no'`, so a model answer of `partially` stores as `yes`, permanently, biased one way | `architect`, measured against `pg_catalog`. Live already holds a `partially` row, so the model does emit it | Three files, no migration. `classification.ts:33` to a three-valued union, `axis-mapping.ts:128` to `!== 'no'`, delete the ternary at `route.ts:237-260` |
| 2.2 | **`initialise_contributor_axes()` cannot complete.** It inserts `'forming'` into `archetypes.archetype_id`, an enum with no such member, so the call aborts and rolls back the `axis_scores` insert with it | `architect`, confirmed from the live function body. `migrator` had flagged it as "may" | `migrator`'s proposed fix also fails: `archetype_id` is NOT NULL with no default. Needs a real answer |
| 2.3 | **Three trigger functions still hold `anon` EXECUTE.** (`initialise_contributor_axes` was recorded as closed and was not; closed properly and measured 2026-09-21, see ARCHITECT-THREAD.md) `set_updated_at`, `quotes_set_updated_at`, `profiles_subscription_tier_touch` | `architect`. The per-schema `REVOKE ... FROM PUBLIC` form is accepted, succeeds, and does nothing; only the global form works | PostgreSQL does not check EXECUTE when a trigger fires, so revoking should be safe. Left open rather than tested against production without a test |
| 2.4 | **Magic link sign-in cannot work at cutover.** Supabase's built-in email sends 2 per hour and refuses addresses outside the project team | `designer`, `2026-09-19-002`. Lands on `apps/web/src/app/login/actions.ts:56`, which was built 2026-09-20 | Custom SMTP. Not in the backlog and not in ADR-002 |
| 2.5 | **The legacy deployed API creates a `profiles` row on an unauthenticated GET** | `treasurer`, `2026-09-20-005` | Dies with the Ghost cutover. Under the no-half-measures rule it is not patched |
| 2.6 | ~~`apps/web` is missing `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`~~ | **Fixed 2026-09-21** by `builder`, re-measured first | Done |
| 2.7 | **The service key may be named differently in your env than in the code.** `apps/web/src/lib/supabase/service.ts:30` reads `SUPABASE_SERVICE_ROLE_KEY`. `builder` reports the root `.env` names it `SUPABASE_SERVICE_KEY` | Neither session could read the env files, correctly: the guard on them held. **Yours to check, about a minute** | If the names differ, the comment route's classification insert throws on every comment. Rename in the env file, not in the code: `SERVICE_ROLE_KEY` is the name the coherence audit settled on |
| 2.8 | **The Phase 0 credential is still public on two other tables.** `ghost_member_id` is closed on `profiles` and the same values are anon-readable on `comments.member_id` and `articles.author_member_id` | Measured with `has_column_privilege`. The legacy API that trusts those values is still the production API | `security`'s call. Not closed overnight, for reasons in `2026-09-21-convener-05` |

---

## 3. Built and verified, not live

`apps/web` is 28 files and 1,439 lines. `packages/core` is 1,291 lines behind 95 tests. **Nothing in
either is deployed.** The live site is still Ghost.

Landed in the database on 2026-09-20 and 2026-09-21: `profiles.user_id`, `profile_claim_tokens`,
`claim_profile()`, `current_ghost_member_id()`, `get_own_profile_for_comment()`, the two `comments`
policies, and three `anon` revokes.

Still written and not applied: `20260920000000_baseline_live_schema.sql`, which carries 27 markers
saying it has not been checked against live. `architect` found nine of them wrong, including two
type errors that would leave the database unable to hold Ghost-keyed article ids. It counts 26
markers where the file says 27, could not reconcile the difference, and refused to adopt either
number.

**The whole client write surface of the live database is one thing: `comments` INSERT, scoped to the
caller's own `member_id`.** Every other table is read-only or closed to both client roles. Measured
today across nine tables.

---

## 4. The port, decided

**Port it, file by file.** Of 75 files: 46 adapt, 16 drop, 10 are rewritten, 3 come as-is. Nothing
was found to be a design or UX surface worth throwing away.

The standing rule for Ghost coupling: **JSX adapts, identity logic is rewritten.**

Colour and paper grain live in one 149-line `:root` block in the live `style.css` and port
independently of any component. Layout does not. `tokens.css` stays generated and its source flips
from the spec to `style.css`, sequenced after the `--tier-*` tokens land there or the flip silently
deletes 28 colours.

First increment, 7 to 10 working days: two migrations (article content columns, a public read policy
on `comments`), then `--tier-*` tokens, the tier badge with the 1.96:1 Heat contrast fix in the same
commit, the private draft, the discourse layer, the article page, and the comment route that already
exists.

Full plan: `council/log/2026-09-20-port-or-rewrite.md`.

---

## 5. The fingerprint

Three things are settled, two are yours, one needs a person rather than a seat.

**Settled and implemented.** The guide ring is a horizon rather than a clamp. The ring phase walks
instead of marching, so the spiral is gone. The noise field closes, so the seam at zero degrees that
every fingerprint has carried since April is gone. Purity drives saturation, which the engine's own
comment and the live page have both promised for five months and neither delivered.

**Settled and not implemented.** `designer`'s legibility ruling: flat 0.84 opacity with a radial
value ramp instead of an opacity ramp that fades the oldest history, era boundaries marked in
`colorDeep` at 1.75x, ring count clamped to 3 to 14 rather than 29, and three channels cut including
stroke weight, which duplicates petal extent at Spearman 0.9465.

**Yours.** Colour by territory or by axis, item 1.3 above. `designer` measured all three schemes
across 24 people at 26px: territory-on-hue separates people 44% better than axis-on-hue in normal
vision and 18% better under deuteranopia, because angle already carries the pillar and hue-on-axis
spends one channel twice. Under axis-on-hue, three different people carry the same colour layout.

**Needs a person.** Whether a Breach residual at 62% on the day is too harsh for someone looking at
their own mark that week. `designer` declined to tune it alone, on the grounds that the curve is
steepest exactly where somebody is most likely to leave.

**Also open.** Whether the residual is visible to everyone or only to its owner, which is
`philosopher`'s and `legal`'s. The geometry works either way.

---

## 6. Open records that are genuinely open

Thirty-four records sit in `exchange/open/`. These are the ones that still describe something true:

| Record | From | What |
| --- | --- | --- |
| `2026-09-19-002` | `designer` | The SMTP blocker, item 2.4 |
| `2026-09-19-002` | `migrator` | Seven repo deviations from Data Architecture v1.2: drift to revert, or design to record |
| `2026-09-19-002` | `philosopher` | A permanent public Contrast Strip may bias self-declaration downward |
| `2026-09-19-002` | `treasurer` | The membership position assumes paying does not change what a contributor does |
| `2026-09-19-002` | `decider` | Write the council-guard hook, or stop claiming it exists |
| `2026-09-19-003` | `treasurer` | Phase C retires Ghost subscriptions and no backlog row replaces them |
| `2026-09-19-003` | `voice-editor` | Neither voice gate reads `.js` or `.ts`, so all three classifier prompts are unguarded |
| `2026-09-20-004` | `treasurer` | P0-6 says 14 Ghost members, the export has 10, and 4 are not real people |
| `2026-09-20-circulation-01` | `circulation` | The share card is the whole strategy and nobody has said what it may carry |
| `2026-09-20-legal-03` | `legal` | Human review of a tier makes Section 230 worse, not better |
| `2026-09-20-legal-04` | `legal` | Dialecta is operated from Arizona and three trees were built on Connecticut |
| `2026-09-20-legal-06` | `legal` | Consent moments, framed and ready for the chair |
| `2026-09-20-security-01` | `security` | Production API serves code that exists in no repository, and P0-3 would overwrite it |
| `2026-09-20-convener-02` | `convener` | Mission Zero, drain the exchange, never run |
| `2026-09-20-architect-01` | `architect` | Item 2.2 |
| `2026-09-20-architect-02` | `architect` | Item 2.3 |

## 7. Records that today's work closed, and nobody marked

Verified against live rather than assumed. Each should be closed with its outcome written in.

| Record | Why it is closed |
| --- | --- |
| `2026-09-19-002` `reviewer`, PR-3 blocker 1 | The stored XSS. `articles/[slug]/page.tsx:100` sanitizes through `isomorphic-dompurify`. Separately, the claim that "the `articles` policies let any signed-up user write that column" is false on live: `articles` has exactly one policy, `articles_public_read`, SELECT only |
| `2026-09-19-002` `reviewer`, PR-3 blocker 2 | An owner writing their own `final_tier`. There is no UPDATE policy on `comments` on live, and no `final_tier` column on `comments` at all; tier lives on `classifications`, which is service-role only |
| `2026-09-19-002` `reviewer`, PR-3 blocker 3 | The axis mapping. Ported to spec on all six axes, Universal Rule 1 enforced as a cross-cutting guard, 54 tests |
| `2026-09-20-security-02` | `ghost_member_id` as a public credential. Revoked, and the comment write path now resolves identity from `auth.uid()` |
| `2026-09-20-migrator-01` | Superseded by `2026-09-20-architect-01`, which confirmed it from the live function body and corrected the proposed fix |
| `2026-09-20-designer-01` | The seat could not run its own audit. All five proposals reviewed, three applied to the mandate |
| `2026-09-21-convener-01` | Opened and answered the same day. The comments policies are not owner-scoped only, tested against the live anonymous path |
| The `quotes.status` predicate | `live`, not `published`. One query. The recovered migration was right and the baseline's guess was wrong |

---

## 8. Two process findings worth keeping

**`land.mjs` pushes to `origin/main` and the local checkout never pulls.** Four `designer` commits
sat on the remote, invisible to every session working locally, which is how a landed and pushed
four-session handoff came to look like it was lost in a worktree. Merged 2026-09-21. Nothing
prevents it recurring.

**A finding nobody has a reason to doubt is the one that survives a correction culture.** Six seats
conceded something in the port debate. The one finding that went unchallenged was the headline, and
it was wrong. It was settled by making one request instead of reading two policies.
