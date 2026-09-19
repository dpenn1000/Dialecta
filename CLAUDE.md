# Dialecta — working context for Claude Code

Dialecta is a live discourse platform: an editorial blog plus a comment system that sorts comments into visible tiers instead of hiding them, and opinion-mapping tools that replace agree/disagree with spatial positions. The founding thesis: environments shape behavior more than stated values do, so redirect social media's reward loops toward specificity and honest disagreement.

Read `docs/Dialecta_Project_Index.md` first when orienting. It is the map of every spec, which design layer it belongs to, and the open tensions. Do not read every spec end to end unless the task needs it.

## Stack (live, Sept 2026)

- **Content + members:** Ghost, hosted on Magic Pages. Articles, subscriptions, and member auth live there. `author_id` and `article_id` in the API are Ghost member/post UUIDs.
- **API:** Vercel serverless functions in `api/` (Node, ESM). `classify.js` (Claude classification), `comment.js` (submit + classify + write), `profile/[id].js` (contributor profile, CORS-enabled).
- **Data:** Supabase (comments, classifications, votes, profiles). Schema and pipelines are specified in `docs/Dialecta_Data_Architecture.md`.
- **UI:** React/JSX widgets injected into Ghost pages. Prototypes live in `components/`; mounted widgets are `dialecta-profile-mount.jsx` and `dialecta-profile-edit.jsx` at the repo root.
- **AI:** Anthropic API. The live classification system prompt is inline in `api/classify.js`; the spec behind it is `docs/Dialecta_Classification_Engine_Specification.md`.

Env vars (see `.env.example`): `ANTHROPIC_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`. Never commit real values.

## Repo layout

```
api/            Vercel functions (the running backend)
components/     React/HTML prototypes exported from the claude.ai project
design/         Design spec (canonical style guide) + logo data URI
docs/           Specs, philosophy, editorial voice, handoff notes
docs/articles/  Source essays
```

## Locked decisions (do not re-open without Dan asking)

- **Tier names:** Forum, Spark, Echo, Fog, Heat, Stance, Breach. Older docs may say "Static" or "Off the Air"; those are superseded. Tier keys in code are lowercase (`forum` … `breach`).
- **Classification weighting:** AI 40%, community voting 35%, self-declaration 15%, Stage 2.5 response quality 10%.
- **Visual language:** `design/dialecta-design-spec.html` is canonical (v1.3). Copy token values from it exactly; do not iterate on the nav gradient, page background, or grain overlay. Sections 08 and 08b hold the background treatments. `docs/Dialecta_Cleanup_Continuation.md` lists older, darker background values; the spec's v1.3 values win.
- **Logo:** retrieve from `design/dialecta-logo-datauri.txt`; never reconstruct from fragments.
- **Voice:** `docs/Dialecta_Editorial_Voice.md` governs every string the platform says to a contributor. The non-negotiables: observational, never evaluative ("this reads as Heat", never "you're being tribal"); name what is present before what is missing; one concrete suggestion, never a list; never moralize; every message below Breach ends with the door open ("or post as-is"); two sentences per commenter message. No em dashes, en dashes, or `--` in anything a person reads (UI strings, engine output, docs, system prompts); code comments are exempt. The AI is a mirror, never a gatekeeper. The voice doc's rules descend from the Trinity Platform `_meta/voice/Voice-Guide.md`, adapted; the two are kept separate on purpose.

**Known drift:** the system prompt in `api/classify.js` still uses em dashes and predates Editorial Voice v1.2 (Sept 2026). Bringing it in line is a deliberate change to live classification output; do it as its own commit and test against sample comments first.

## Deferred (need a dedicated design session, not a code edit)

1. Archetype assignment vs. the Self-Snapshot's three-voice principle (Contributor Identity vs. Growth Layer).
2. Per-comment tier vs. contributor-level axes mapping.
3. The Reviser archetype depends on the Delta mechanic, which doesn't exist yet.
4. Steelman → Advocate terminology cleanup across older docs.
5. Responsive Foundations: profile and design spec are desktop-first; `dialecta-profile-mobile.jsx` and `-responsive.jsx` are exploratory.

## Working conventions

- Small, surgical edits. Tables over prose for status reports.
- When a spec changes, update `docs/Dialecta_Project_Index.md` in the same change.
- The claude.ai project "Dialecta Platform Development" holds the same docs as `docs/`; this repo is now the source of truth. If you change a doc here, Dan re-uploads it to the project by hand.
- No Ghost theme code lives here yet. If Magic Pages theme or code-injection snippets get pulled in, put them under `ghost/`.
