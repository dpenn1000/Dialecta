# Dialecta: working context for Claude Code

Dialecta is a live publication and discourse platform at https://dialecta.org: an editorial blog plus a comment system that sorts comments into visible tiers instead of hiding them, contributor profiles with a "Thinking Fingerprint", and opinion-mapping tools in progress. The founding thesis: environments shape behavior more than stated values do, so redirect social media's reward loops toward specificity and honest disagreement.

Read `docs/Dialecta_Project_Index.md` (v0.16, May 2026) first when orienting. It is the map of every spec, which design layer it belongs to, and the open tensions. Do not read every spec end to end unless the task needs it.

## Where things live (Sept 2026)

| Place | What | Status |
|---|---|---|
| `C:\Dialecta` (this repo, `dpenn1000/Dialecta` on GitHub) | Vercel API functions in `api/`, docs, design, prototypes | Source of truth for code and docs from now on |
| `C:\Users\dan\OneDrive\Websites\Dialecta` | The concept archive: hand-tended specs in `Fundamentals/`, session handoffs, logos, marketing, article drafts | Read-only reference. `docs/` here mirrors it as of 2026-09-08. When the two disagree, the OneDrive copy is older or the same; edit here, then copy back if Dan wants the archive current |
| `C:\dialecta-api`, `C:\dialecta-local`, `C:\dialecta-next` | Named in older handoffs as the API repo, the Ghost theme (`versions/6.28.0/content/themes/dialecta`), and the OG-image sidecar | Not present on studio-pc as of 2026-09-08. The theme source is not in this repo. If a theme task comes up, find the checkout first |
| Ghost on Magic Pages (`dialecta.mymagic.page`) | Articles, members, pages, theme | Live |
| Vercel (`dialecta.vercel.app`) | Serves a 2026-05-08 build from a DIFFERENT repo, `dpenn1000/dialecta-api` at commit `53364fa`. The project's Git connection now points at this repo, so this repo's pushes build previews there, but production has not been redeployed since May | Live, from `dialecta-api` |
| Supabase project `mguulnibvzusfvyuowwh`, org Pennington Media Group | 32 tables, 20 applied migrations dated 2026-04-29 to 2026-05-07, numbered to `035_growth_engine_schema`. Far ahead of this repo: articles, follows, sparring partners, opinion maps, notifications, a roles and capabilities admin system, handle history, share and celebration events, self descriptions | Live. `supabase/types.ts` is generated from it |
| claude.ai project "Dialecta Platform Development" | Copies of the April docs | Stale except `Dialecta_Editorial_Voice.md` (v1.2 written back 2026-09-08) |

## Stack

- **Content + members (legacy, until cutover):** Ghost. `author_id` and `article_id` in the legacy API are Ghost member/post IDs, stored as `text`. Per ADR-001 nothing new is built on Ghost.
- **API:** Vercel serverless functions in `api/` (Node, ESM). `classify.js` (Claude Haiku classification), `comment.js` (submit + classify + write), `profile/[id].js` (CORS-enabled). Handoffs also reference `api/_axis-mapping.js`; it is not in this repo. Check the deployed Vercel project before assuming the repo is the whole API.
- **UI:** React 19 + esbuild widgets injected into Ghost pages. `dialecta-profile-mount.jsx` and `dialecta-profile-edit.jsx` at the root; prototypes in `components/`.
- **AI:** Anthropic API. The live classification system prompt is inline in `api/classify.js`.

Env vars (see `.env.example`): `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Never commit real values.

## Start here (every session)

1. `docs/plans/backlog.md`: the ordered work. Pick the top unblocked item.
2. `docs/handoffs/current.md`: what the last session left.
3. `exchange/ledger.md`: what agents have open with each other. An open record on your question means answering that one.
4. `docs/plans/build-plan.md`: the architecture.

**End every session with `node scripts/land.mjs --agent <you>`.** It commits inside your folder, runs the gates, rebases and pushes to main. Work that stays on a branch is work nobody else can see; on 2026-09-19 nine sessions left nine branches and all of them had to be merged by hand. `docs/decisions/`: the ADRs it rests on (001 leave Ghost, 002 Supabase Auth, 003 own editor).
Delegate with `/dialecta-brief` to `builder`; review with `reviewer`; prose with `voice-editor`; schema with `migrator`; spec questions to `spec-reader`; anything already deployed and reachable to `security`; any `-D` backlog row or "should we" question to `decider` (`/dialecta-decide`), or to the full council (`/dialecta-council`: `treasurer`, `designer`, `philosopher` argue it, `decider` chairs, Dan decides). Hooks in `.claude/settings.json` block spec edits and voice hard-rule failures.

## Repo layout

```
apps/web/         Next.js 15 App Router, the product (see apps/web/CLAUDE.md)
packages/core/    engine logic, pure and tested (see packages/core/CLAUDE.md)
supabase/         migrations, config, generated types (see supabase/CLAUDE.md)
.claude/          agents, skills, hooks, settings (the agentic team)
docs/plans/       backlog and build plan
docs/decisions/   ADRs, numbered, never edited after Decided
council/          advisor charters, standing positions, research trees, debate log
team/             the six working agents: briefs, standing practices, knowledge trees
exchange/         handoffs, blind spots, advice and votes between agents (see exchange/README.md)
scripts/land.mjs  how an agent session lands its own work on main, gates and all
tools/            local-research MCP server: Ollama-backed search, summarize, index (see tools/local-research/README.md)
api/              legacy Vercel functions, frozen until apps/web replaces them
components/       React/HTML prototypes (pact, stewards, guidebook, profile, fingerprint, opinion maps, delta, growth scroll)
design/           Design spec v1.3 (canonical style guide), icon preview, quote library, system reference, logos/
docs/             Canonical specs (mirror of the OneDrive Fundamentals/ as of 2026-09-08)
docs/articles/    Source essays and welcome articles
docs/drafts/      Voice Master DRAFT, Theme System Phase 0 DRAFT
docs/handoffs/    Session handoffs and audits, April-May 2026
docs/reviews/     Site reviews and the text snapshots they were run on
scripts/          voice_check.py, extract-tokens.mjs, import-ghost.mjs, install-studio-pc.ps1, research-sprint.ps1
```

## Locked decisions (do not re-open without Dan asking)

- **Tier names:** Forum, Spark, Echo, Fog, Heat, Stance, Breach. Older docs may say "Static" or "Off the Air"; superseded. Tier keys in code are lowercase.
- **Classification weighting:** AI 40%, community voting 35%, self-declaration 15%, Stage 2.5 response quality 10%.
- **Six pillars:** Acuity, Reach, Calibration, Magnanimity, Discourse, Consistency. **Eight archetypes:** Skeptic, Synthesizer, Advocate, Builder, Empiricist, Contextualist, Illuminator, Reviser. "Advocate", never "steelman".
- **Visual language:** `design/dialecta-design-spec.html` is canonical (v1.3). Copy token values from it; do not iterate on the nav gradient, page background, or grain. Gold family per tokens.css (`--gold` `#d4a84a`, `--gold-bright`, `--gold-muted`, `--gold-pale`).
- **Logo:** `design/dialecta-logo-datauri.txt` or `design/logos/`; never reconstruct from fragments.
- **Voice:** `docs/Dialecta_Editorial_Voice.md` (v1.2) governs every string the platform says to a contributor and the prose in these docs. Non-negotiables: observational, never evaluative ("this reads as Heat"); name what is present before what is missing; one concrete suggestion; never moralize; every message below Breach ends with the door open; two sentences per commenter message. No em dashes, en dashes, or `--` in anything a person reads; code comments are exempt. The rules descend from the Trinity Platform `_meta/voice/Voice-Guide.md`, adapted; the two are kept separate on purpose. `python scripts/voice_check.py FILE` runs the regex-decidable subset.
- **Concept vs. code:** the spec wins. Surface drift, propose a code fix, don't amend the spec silently.

## Known drift and open work

- **`vercel.json` sets `git.deploymentEnabled: false` as of 2026-09-20, and P0-3 must flip it.** The `dialecta` Vercel project is connected to this repo but was configured for `dpenn1000/dialecta-api`, so every push to `main` fired a production build that compiled the Next.js app and then failed on a missing `public` output directory, mailing a failure notice each time. Disabling Git deployments stops the builds from the repo side and leaves the aliased May 2026 deployment serving, so the live API is unaffected. A new Vercel project on `apps/web` will read this same file, so P0-3 has to remove or scope this key before previews will build.

- **Live RLS is measured, and `profiles` leaks.** `node scripts/check-env.mjs --rls` maps it (read-only, counts only; full map in `team/migrator/knowledge/2026-live-rls-surface.md`). Nine tables are closed to the anonymous key (`comments`, `classifications`, `axis_events`, `reserved_handles`, `notifications`, `admin_roles`, `fp_snapshots`, `share_events`, and `quotes` filtered), so `028_pre_launch_security_hardening` did real work. Six are fully public: `profiles`, `articles`, `axis_scores`, `archetypes`, `feed_events`, `follows`. **Every column on `profiles` is readable without authentication**, including `is_admin`, `subscription_tier`, `pact_signed_name`, `order_negotiation_log` and `ghost_member_id`, because RLS is row-level and no column grants narrow it. The fix is column grants or a public-profile view, and it waits on the decision below. Also: backlog A-5 renders empty for logged-out visitors, since anon reads zero of three comments.

- **The two September migrations were written without knowledge of the live database.** Answered 2026-09-19 from the record on studio-pc and appended to `exchange/open/2026-09-19-001`: the scaffold arrived from a Cowork chat as `dialecta-scaffold.zip`, its own install handoff tells Dan to create `dialecta-staging` and `db push` into it, no session on this machine wrote the SQL, and the live project was first read 35 minutes after the scaffold was committed. Dan has not confirmed it, so the record is still open and `decider` closes it. Detail in `docs/handoffs/dialecta-handoff-2026-09-19-env-and-rls.md`.

- **`supabase/migrations/` is not this database's history, and P0-2 through P0-7 were planned as if Supabase were empty.** The live project holds 32 tables and 20 applied migrations from April and May 2026. The two migration files here, both dated 2026-09-19, create 13 tables, and 10 of those already exist live with rows in them: `profiles` (14), `axis_scores` (36), `axis_events` (27), `articles` (5), `feed_events` (6), `fp_snapshots` (4), `archetypes` (3), `comments` (3), `classifications` (3), `aspirations` (0). Two more are named differently live (`comment_votes` against `tier_nominations`, `opinion_positions` against `opinion_map_positions`) and `recommitments` has no live counterpart. Running `db push` against the live project would collide. Creating `dialecta-staging` from these files would produce a schema behind production. This needs a decision from Dan before any Supabase work proceeds; it is not a migration to write.

- The Vercel project named `dialecta` is connected to `dpenn1000/Dialecta` and serves production from `dpenn1000/dialecta-api`. Verified against the Vercel API on 2026-09-19: all five most recent production deployments carry `githubRepo: dialecta-api`, `githubCommitSha: 53364fa`. Preview builds from this repo fail at the last step with `No Output Directory named "public"`, because the project's root directory is still the repo root from the old `api/` setup. The Next.js build itself succeeds. Backlog P0-3 owns the fix and it is Dan's to make in the dashboard. A failed production build leaves the May deployment aliased, so merging here does not take the API down.

- `.claude/skills/dialecta-council/SKILL.md` names a `council-guard` hook that enforces the advisor folder rules. No such hook exists. The hooks present are `guard-docs.mjs`, `voice-check.mjs` and `handoff-note.mjs`, and `guard-docs.mjs` covers charters but not the wider rule. Either write the hook or drop the claim.

- The April to May 2026 doc import carries 1,667 hard voice-rule hits, all of them dashes, across 43 files under `docs/`. `.voiceignore` lists them and the CI gate skips them. They are exempt rather than fixed because `guard-docs.mjs` blocks agents from editing specs, and because handoffs and reviews are write-once records. The list is paths, not patterns, so any new file is gated normally. Clean a doc's dashes and delete its line. Nothing outside `docs/` is exempt.

- `api/classify.js` system prompt uses em dashes and predates Editorial Voice v1.2. Changing it changes live output; do it as its own commit and test against sample comments.
- `docs/reviews/2026-09-08-site-review.md` lists eight visible site bugs, a restructure proposal, and per-page prose findings. Start there for any site cleanup.
- Cloud-only OneDrive files that did not copy on 2026-09-08. **Several have since arrived and are no longer missing**, found by the architect seat's document-path check 2026-09-21: `docs/Dialecta_Stewards_Reflection.txt`, `components/dialecta-discourse-layer.jsx` and `components/dialecta-fingerprint-engine.jsx` are all in the repo, and `Fundamentals/Components/WoodFrameProgressBar.jsx` was never lost but **renamed**: it is `_recovered-next/lib/theme/dialecta-reflection-bar.jsx`, and three searches for the old name concluded it was gone. Still to check before trusting this list: `Fundamentals/dialecta-quote-library.json`, `Data Handling/dialecta_data_architecture.svg`, `Write Layer/Articles/*.txt`, `Dialecta-Private-Draft-Mode.jsx`, `Growth Layer/dialecta-growth-scroll-v5.jsx`, `Opinion Map/dialecta-opinion-maps.jsx`, `Private Draft Mode/dialecta-s11-private-draft-mode.jsx`, `Profile Pages/dialecta-profile-responsive.jsx`, two logos. The `components/` copies are the older April project exports; `_recovered-next/lib/theme/` holds the newer ones.
- Deferred design tensions (need a session, not a code edit): archetype assignment vs. the Self-Snapshot's three-voice principle; per-comment tier vs. contributor-level axes; the Reviser archetype depends on the Delta mechanic.

## Working conventions

- **Seats propose; the convener changes.** Dan, 2026-09-21: "The team agents shouldn't make changes on their own without going through the channels." A seat writes inside its own folder and in `exchange/`, and nowhere else on its own initiative. A change to the database, to Vercel, to GitHub, or to any file outside the seat's folder goes to the convener as an `exchange/` record naming the file, the line and the fix. The convener writes it, or dispatches the seat that should with an explicit brief. A seat briefed by the convener to make a specific change is going through the channel; a seat deciding on its own to make one is not. The convener holds write access and is answerable for every change landing.
- Small, surgical edits. Tables over prose for status reports.
- When a spec changes, update `docs/Dialecta_Project_Index.md` in the same change.
- Handoffs go in `docs/handoffs/dialecta-handoff-YYYY-MM-DD-suffix.md`, write-once.
- The Ghost theme is being replaced by `apps/web`, not maintained. If the old checkout turns up, archive it under `docs/handoffs/`, don't build on it.
- `npm run typecheck && npm test` before every PR. `npm run tokens -- --check` when the design spec changes.
