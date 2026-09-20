# Backlog

*Ordered. Decisions are recorded in `docs/decisions/`. Each item is one PR, one session, one reviewer pass. The lead session picks the top unblocked item, briefs a builder (`/dialecta-brief`), and moves the item to Done with the PR link. Decisions marked "Dan" are made in a Cowork session and land in `docs/` by hand before the item starts.*

## Phase 0: Foundation (week 1)

> **P0-2 onward is blocked on a decision, not on work.** The live Supabase project
> (`mguulnibvzusfvyuowwh`, Pennington Media Group) already holds 32 tables and 20 applied
> migrations from April and May 2026. Ten of the 13 tables `supabase/migrations/` creates exist
> there with rows in them. These rows were written as greenfield and several of them describe
> work that appears done. Read `docs/handoffs/dialecta-handoff-2026-09-19-supabase-reality.md`
> and `exchange/open/2026-09-19-001-advice-supabase-schema-collision.md` before starting any of
> them. Do not run `supabase db push`.
>
> **2026-09-19 update: the question in `2026-09-19-001` is answered, pending Dan's confirmation.**
> The September migrations were written without knowledge of the live database. The scaffold
> arrived from a Cowork chat as a zip whose own install handoff tells Dan to create
> `dialecta-staging` and `db push` into it, and the live project was first read 35 minutes after
> the scaffold was committed. Evidence appended to the record; detail in
> `docs/handoffs/dialecta-handoff-2026-09-19-env-and-rls.md`. On that record's logic the repo
> adopts the live schema and these rows get rewritten around what exists.
>
> **Live RLS is measured**, in `team/migrator/knowledge/2026-live-rls-surface.md`. Nine tables are
> closed to the anonymous key and six are fully public. Two consequences already visible: **A-5
> renders empty for logged-out visitors**, because anon reads zero of three comments, and **every
> column on live `profiles` is readable without authentication**, including `is_admin`. That second
> one is the first migration to write once this unblocks.
>
> The environment on studio-pc is loaded and verified: run `node scripts/check-env.mjs --rls` from
> the repo root. The Supabase CLI needs no install, since `npx --yes supabase` resolves 2.117.0.
> The read-only reconnaissance sequence is `team/migrator/p0-2-runbook.md` Part 1.

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| P0-1 | Commit scaffold, push, open PR "monorepo foundation", confirm CI green | plans/build-plan.md | | Todo |
| P0-2 | Create `dialecta-staging` Supabase project; apply foundation migration; `npm run types`; commit `supabase/types.ts` | supabase/CLAUDE.md | P0-1 | Todo |
| P0-3 | Vercel: new project on `apps/web` (root dir), env vars from `.env.example`, preview per PR. Leave `dialecta.vercel.app` (legacy api) untouched | | P0-1 | Todo |
| P0-4 | Supabase Auth: magic link + Google; `/login`, `/logout`; profile row created on first sign-in (trigger on `auth.users`) | Data Architecture: profiles | P0-2 | Todo |
| P0-5 | Native articles: migration 0002 (`body_json`, `body_html`, `status`, `declared_claims`, `suggested_axes`, `amend_until`), front page and `/articles/[slug]` render from `articles` | ADR-003; Data Architecture: articles | P0-2 | Todo |
| P0-7 | Import the five Ghost posts into `articles` (one-time script under `scripts/import-ghost.mjs`, then delete `lib/ghost.ts`) | ADR-001 | P0-5 | Todo |
| P0-6 | Legacy member mapping: one-time script that matches the 14 Ghost members to `profiles.ghost_member_id` and links `user_id` on first sign-in by email | Data Architecture v1.2 Identity Types | P0-4 | Todo |
| P0-D1 | **Dan:** identity, Ghost, editor | ADR-001, 002, 003 | | Decided 2026-09-19 |
| P0-D2 | **Dan:** login methods (magic link + Google recommended; passkeys later?) and whether sign-up is open or invite-only at cutover | ADR-002 | | Open |

## Phase A: Discourse and Publication (weeks 2 to 5)

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| A-1 | Composer island: 12-char gate, nudge bar, submit creates `comments` row `pending_review` and enqueues classification (no inline Haiku call) | Discourse Layer UX, Stage 1 | P0-4 | Todo |
| A-2 | Classification job: Supabase Edge Function or Vercel background function calling Haiku with `buildSystemPrompt()`, writes `classifications` with `model` and `prompt_version` | Classification Engine Spec | A-1 | Todo |
| A-3 | Classification card island: shows tier, message, seven-tier self-declaration grid, Stage 2.5 amend / respond / post as-is; writes `self_declared_tier` | Discourse Layer UX, Stage 2 and 2.5 | A-2 | Todo |
| A-4 | Final-tier resolution on publish: `resolveFinalTier` from core; `final_tier`, `status = published`, `published_at` | Classification Engine Spec; core/resolution.ts | A-3 | Todo |
| A-5 | Comment thread (server component): cards with dual tier badges, specificity dots, Contrast Strip, Breach suppressed variant, New pill | Discourse Layer UX, comment card | A-4 | Todo |
| A-6 | Topology bar and control bar: tier distribution, click to filter, Quality / Newest / Most discussed | Discourse Layer UX | A-5 | Todo |
| A-7 | Votes and nominations: `comment_votes` writes, nomination panel with seven reasons and 140-char note, receipt strip | Discourse Layer UX, reclassification | A-5 | Todo |
| A-8 | Re-review trigger: when nominations pass the threshold, re-run classification and resolution | Classification Engine Spec | A-7, A-D1 | Todo |
| A-9 | Article cards show Forum-tier comment count (locked decision), not total | decisions | A-4 | Todo |
| A-10 | Editor island: TipTap on ProseMirror, headings, quotes, links, images to Supabase Storage `article-media`, autosave drafts to `articles.body_json` | ADR-003; Article Editorial Template | P0-5 | Todo |
| A-11 | Article server: draft, the five declaration questions, key claims and suggested axes, publish, Stage 2.5 amendment window (`amend_until`), server-rendered `body_html` | Article Editorial Template | A-10 | Todo |
| A-12 | Author view: my drafts, my published, amend within window | Article Editorial Template | A-11 | Todo |
| A-D3 | **Dan:** who may publish at launch (family and invited Stewards only, or any member) and whether articles get a pre-publish AI reflection like comments do | Article Editorial Template | | Open |
| A-D1 | **Dan:** community re-review threshold (count and window); whether community alone may outweigh AI under 40/35/15/10 | | | Open |
| A-D2 | **Dan:** wait timers (Pact lists 8s / 12s / 30 min / 24 h): keep, change, or drop from copy | | | Open |

## Phase B: Identity (weeks 5 to 6)

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| B-1 | Axis ledger: on resolution, write `axis_events` from `axisDeltasFor`; nightly (or on-write) replay into `axis_scores` | Axis Mapping v1; core/axis-mapping.ts | A-4 | Todo |
| B-2 | Archetype monitor: assign from `axis_scores` pattern, write history, emit `feed_events` | Contributor Identity v1.1 | B-1 | Todo |
| B-3 | Profile page on Supabase Auth: hero, tier breakdown, stats (port from `api/profile/[id].js`), edit panel | Contributor Identity; components/dialecta-profile*.jsx | P0-4 | Todo |
| B-4 | Fingerprint island: port `components/dialecta-fingerprint-engine.jsx` to TypeScript, fed by `axis_scores` and tier mix | Contributor Identity | B-1, B-3 | Todo |
| B-5 | Community page: real members only, archetype filter, no seeded personas | Social UX Architecture | B-2 | Todo |
| B-D1 | **Dan:** retire or label the seeded personas (Okafor, Reiss, Zhao) and their article | site review 2026-09-08 | | Open |

## Cutover (week 7)

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| C0-1 | Site restructure from the review: front-page band, five-item nav, Pact cut to commitment + quiz, Guidebook trimmed, Stewards and Fingerprint off primary nav, `/quotes` and `/dev-admin` gone | reviews/2026-09-08-site-review.md | A-6, B-3 | Todo |
| C0-2 | Voice pass on About, Pact, Guidebook copy in `strings.ts` and MDX (voice-editor) | Editorial Voice v1.2 | C0-1 | Todo |
| C0-3 | Fix the eight visible bugs (read-time suffix, bylines, THE THE, etc.) in the new app rather than the theme | reviews/2026-09-08-site-review.md | C0-1 | Todo |
| C0-4 | DNS: dialecta.org to Vercel `apps/web`; delete `api/` and the legacy Vercel project; Ghost left running only until C-2 | ADR-001 | C0-1 to C0-3 | Todo |

## Phase C: Newsletter and Ghost shutdown (week 8)

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| C-1 | Newsletter via Resend on publish; import Ghost subscribers | | C0-4 | Todo |
| C-2 | Cancel Ghost and Magic Pages | ADR-001 | C-1 | Todo |

## Phase D: Mapping and Growth (week 11+)

| Id | Item | Spec | Blocked by | State |
| --- | --- | --- | --- | --- |
| D-1 | 2-axis opinion map island, `opinion_positions` writes, aggregate heat cloud | Project Brief, Option A; components/dialecta-opinion-maps.jsx | C0-4 | Todo |
| D-2 | Ternary map | Option B | D-1 | Todo |
| D-3 | Delta mechanic: before/after placement, `delta_of` | Delta Mechanic Spec | D-1 | Todo |
| D-4 | Aspirations and recommitment; Self-Snapshot (three voices) | Growth Layer Principles; Self-Snapshot Engine | B-2, A-8 | Todo |

## Done

| Id | Item | PR |
| --- | --- | --- |
| | Monorepo scaffold, foundation migration, `.claude/` team config, build plan (this session, 2026-09-19) | pending |
