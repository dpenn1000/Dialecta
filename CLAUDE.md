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
| Vercel (`dialecta.vercel.app`) | The `api/` functions | Live |
| Supabase | `profiles`, comments, classifications, votes | Live |
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
4. `docs/plans/build-plan.md`: the architecture. `docs/decisions/`: the ADRs it rests on (001 leave Ghost, 002 Supabase Auth, 003 own editor).
Delegate with `/dialecta-brief` to `builder`; review with `reviewer`; prose with `voice-editor`; schema with `migrator`; spec questions to `spec-reader`; any `-D` backlog row or "should we" question to `decider` (`/dialecta-decide`), or to the full council (`/dialecta-council`: `treasurer`, `designer`, `philosopher` argue it, `decider` chairs, Dan decides). Hooks in `.claude/settings.json` block spec edits and voice hard-rule failures.

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

- `.claude/skills/dialecta-council/SKILL.md` names a `council-guard` hook that enforces the advisor folder rules. No such hook exists. The hooks present are `guard-docs.mjs`, `voice-check.mjs` and `handoff-note.mjs`, and `guard-docs.mjs` covers charters but not the wider rule. Either write the hook or drop the claim.

- The April to May 2026 doc import carries 1,667 hard voice-rule hits, all of them dashes, across 43 files under `docs/`. `.voiceignore` lists them and the CI gate skips them. They are exempt rather than fixed because `guard-docs.mjs` blocks agents from editing specs, and because handoffs and reviews are write-once records. The list is paths, not patterns, so any new file is gated normally. Clean a doc's dashes and delete its line. Nothing outside `docs/` is exempt.

- `api/classify.js` system prompt uses em dashes and predates Editorial Voice v1.2. Changing it changes live output; do it as its own commit and test against sample comments.
- `docs/reviews/2026-09-08-site-review.md` lists eight visible site bugs, a restructure proposal, and per-page prose findings. Start there for any site cleanup.
- Cloud-only OneDrive files that did not copy on 2026-09-08 (open them once in Explorer to download, then re-copy): `Fundamentals/Dialecta_Stewards_Reflection.txt`, `Fundamentals/dialecta-quote-library.json`, `Data Handling/dialecta_data_architecture.svg`, `Write Layer/Articles/*.txt`, `Dialecta-Private-Draft-Mode.jsx`, `Fundamentals/dialecta-discourse-layer.jsx`, `Fundamentals/dialecta-fingerprint-engine.jsx`, `Fundamentals/Components/WoodFrameProgressBar.jsx`, `Growth Layer/dialecta-growth-scroll-v5.jsx`, `Opinion Map/dialecta-opinion-maps.jsx`, `Private Draft Mode/dialecta-s11-private-draft-mode.jsx`, `Profile Pages/dialecta-profile-responsive.jsx`, two logos. The `components/` copies of the jsx files are the older April project exports.
- Deferred design tensions (need a session, not a code edit): archetype assignment vs. the Self-Snapshot's three-voice principle; per-comment tier vs. contributor-level axes; the Reviser archetype depends on the Delta mechanic.

## Working conventions

- Small, surgical edits. Tables over prose for status reports.
- When a spec changes, update `docs/Dialecta_Project_Index.md` in the same change.
- Handoffs go in `docs/handoffs/dialecta-handoff-YYYY-MM-DD-suffix.md`, write-once.
- The Ghost theme is being replaced by `apps/web`, not maintained. If the old checkout turns up, archive it under `docs/handoffs/`, don't build on it.
- `npm run typecheck && npm test` before every PR. `npm run tokens -- --check` when the design spec changes.
