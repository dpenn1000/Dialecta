# Dialecta — Session Handoff
*End of session 2026-04-27 → next session ready-to-resume briefing*
*Paste the entire contents of this file (or its path) into the next Claude Code chat*

---

## What this project is, in two sentences

Dialecta is a blog and community platform built on the principle that ideas, not identities, should be the protagonist of public discourse. Tier-based comment classification + contributor identity (Six Pillars + Eight Archetypes + Fingerprint visualization) + behavioral-science-grounded design, deployed live at `dialecta.mymagic.page` (custom domain `dialecta.org`) on Ghost CMS + Vercel API + Supabase.

---

## Where you (the next session) are picking up

**Just finished a multi-day coherence audit + post-audit build kickoff.** The audit is closed. Schema migration v1.1 is applied to production. Three seed contributors live in Supabase. A six-milestone "First Quills" launch roadmap is locked. The dashboard tracks all of it.

**Your immediate task:** start building `a-b6` (Profile API joined returns), the first action of M1 in the First Quills roadmap. Details below.

---

## Current state — facts the next session needs

### Live infrastructure
- **Theme:** `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` — deploys via ZIP upload to Magic Pages dashboard. Build with `npm run build`, then `Compress-Archive -Path dialecta\* -DestinationPath dialecta-theme.zip -Force` from the parent dir, then upload. **There is no local Ghost server** — explicitly deprecated, do not propose `ghost start` or `localhost:2368`. CLAUDE.md in this dir is canonical for workflow.
- **API:** `C:\dialecta-api\` — deploys via `vercel --prod` from that dir. Three live routes: `/api/classify`, `/api/comment`, `/api/profile/:id`. CORS configured.
- **Database:** Supabase (URL + service key in `C:\dialecta-api\.env.local`). Service-role key bypasses RLS, used by API.

### Phase 1 identity convention (easy-to-forget critical context)
**Phase 1 uses `member_id text` everywhere, NOT `contributor_id uuid`.** Ghost member IDs are 24-character hex strings (Mongo ObjectID style), not UUIDs. The Data Architecture spec (now v1.2) clarifies this in its "Identity Types: Phase 1 vs Phase 2" section. **Internal Supabase PKs and FKs are uuid in both phases**; only Ghost-sourced refs (member_id, article_id) are text in Phase 1.

### Production schema (live as of 2026-04-27)
- `profiles` (existed pre-migration, ~7 columns including new `is_seed boolean`)
- `comments` (existed; new `delta_acknowledged boolean` column added by 001)
- `classifications` (existed; matches spec almost perfectly except `specificity_score` not `specificity`)
- `axis_scores` (existed; uses `member_id text` + canonical 6-axis enum + bonus `topic_history jsonb` + `comment_count integer`)
- `archetypes` (existed; uses `member_id text` + `archetype_id` enum + `archetype_label` + `confidence` enum + `axis_pattern` + `history`)
- `feed_events` (created by 001; full 12-value enum text + CHECK)
- `follows` (created by 001; v1.1 follow graph)
- `sparring_partners` (created by 001; v1.1 engagement-derived)
- `opinion_map_positions` (created by 001; v1.1 Delta + Opinion Maps)

### Seed contributors (live in production)
| display_name | ghost_member_id | profile.id | archetype | confidence |
|---|---|---|---|---|
| Maya Reiss | `seed:maya` | `11111111-1111-4111-8111-111111111111` | reviser | established |
| Wen Zhao | `seed:wen` | `22222222-2222-4222-8222-222222222222` | synthesizer | established |
| Father Anselm Okafor | `seed:anselm` | `33333333-3333-4333-8333-333333333333` | contextualist | established |

All three flagged `is_seed = true`. Each has 6 `axis_scores` rows. Public-facing queries should always filter `WHERE is_seed = false` once we go live; for now seeds are the only profile data besides the user's own real profile.

### Canonical archetype enum state
The `archetype_id` PostgreSQL enum has **14 values total**: the canonical 8 (skeptic, synthesizer, advocate, builder, empiricist, contextualist, illuminator, reviser) PLUS 6 stale legacy values pending cleanup (specialist, generalist, sparring_partner, cartographer, witness, forming). The canonical 8 were added 2026-04-27 by migration 001. **Spawned task: `a-d2` retire the 6 legacy values via type-swap migration** when convenient.

### MCP availability
**Supabase MCP is now configured at user scope** (`C:\Users\dan\.claude.json`), so it loads from any cwd. Read-only mode (`https://mcp.supabase.com/mcp?read_only=true`). Auth is OAuth — first MCP call in the new session will trigger OAuth handshake; user authenticates once, persists. Use it to query schema, verify migration state, inspect seed data, etc. Do NOT use it to apply migrations — those still go through Supabase dashboard SQL editor for transparency.

### Migration files (in repo, applied)
- `C:\dialecta-api\supabase\migrations\000_baseline_documentation.sql` — comment-only marker for pre-migration baseline tables (profiles, comments, classifications). TODO at the top: back-fill authoritative DDL via Supabase CLI `db pull` someday.
- `C:\dialecta-api\supabase\migrations\001_v1_1_schema.sql` — APPLIED 2026-04-27. Additive only. Idempotent guards throughout.
- `C:\dialecta-api\supabase\migrations\002_seed_dev_users.sql` — APPLIED 2026-04-27. Maya/Wen/Anselm + 18 axis_scores + 3 archetype rows. Idempotent.

---

## Your immediate task: `a-b6` Profile API joined returns

### What it is
Expand `C:\dialecta-api\api\profile\[id].js` to return a joined entity bundle instead of just the `profiles` row.

### Why it's first
- It's M1 of the First Quills launch roadmap.
- It unblocks `a-b7` (HERO_PROFILES → API-fetched seeds wire), the first end-to-end "real data" path on the live site.
- Without it, the front-end profile page can't display fingerprint, archetype, comment stats, or any of the data the React components expect.

### Expected response shape
The next session should build the response to match what `dialecta-profile-data.js mergeProfileWithGhost()` already expects (read it at `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\dialecta-profile-data.js`):

```js
{
  // Existing profile fields at top level (already returned today)
  id: '...',
  ghost_member_id: 'seed:maya',
  display_name: 'Maya Reiss',
  bio: '...',
  avatar_url: null,
  location: null,
  is_seed: true,
  updated_at: '...',
  
  // NEW — joined data
  axisScores: {
    acuity:      14,
    calibration: 17,
    magnanimity: 15,
    discourse:   5,
    consistency: 11,
    reach:       9
  },
  archetype: {
    id:    'reviser',
    label: 'The Reviser',
    note:  'Updates positions when evidence shifts.'  // can derive from confidence + label
  },
  stats: {
    totalComments:   0,  // count from comments table where member_id matches
    articlesEngaged: 0,  // count distinct article_id from same
    nominatedUp:     0,  // future when comment_votes table exists
    nominatedDown:   0,
    tierCounts:      {}, // aggregated from classifications joined to comments
    forumPct:        0,  // derived
  },
}
```

Notes for the implementation:
- Existing front-end consumes `axisScores` as a flat object keyed by canonical axis name (acuity/calibration/magnanimity/discourse/consistency/reach). The `mergeProfileWithGhost` function then translates those to legacy component names (specificity/calibration/charity/discourse/consistency/originality) for the fingerprint engine. **Don't reshape that — just feed the canonical names from the DB and let the merger handle the legacy translation. (`a-b2` will eventually retire the legacy translation when the engine refactors to v2.0.0.)**
- For now `comments`, `classifications`, and `comment_votes` tables are empty (only the user's profile is real; no real comments yet), so `stats` will mostly be zeros for seeds. That's OK — the response shape needs to be right; data fills in later.
- Use `member_id` text (NOT `contributor_id` uuid) for the joins.

### Verification flow
1. Write the new endpoint code in `C:\dialecta-api\api\profile\[id].js`
2. Show user
3. User commits + `vercel --prod` from `C:\dialecta-api\`
4. User curls (or you can use Supabase MCP read-only to spot-check the JOINs are correct first):
   ```bash
   curl https://your-vercel-domain/api/profile/seed:maya | jq
   ```
5. Verify Maya's bio + 6 axis_scores + reviser archetype all present
6. Update dashboard: `a-b6` Specced → Complete; M1 progresses

### After a-b6 → next move is a-b7
Replace the hardcoded `HERO_PROFILES` const in `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\index.jsx` with `fetch('/api/profile/seed:maya')` etc. Carousel renders against real data. M1 complete. Move to M2 (Engine v2.0.0 axis refactor + archetype scrub).

---

## Heads-up findings to track (don't lose these)

1. **vercel.json route `/api/profile/(?<id>[^/]+) → /api/profile.js?id=$id` is stale.** Vercel's filename-based routing already handles `api/profile/[id].js` natively. The rewrite is redundant. Not blocking. Worth a small cleanup pass.

2. **`p4-4` Responsive Foundations was bumped from Phase 4 → Phase 2** because First Quills launch made mobile launch-essential. `p4-6` (Responsive Profile Page consolidation) stays Phase 4 as the longer architectural cleanup.

3. **Mojibake residue in 2 OneDrive prototypes** — `Fundamentals/dialecta-design-spec.html` and `dialecta-s13-stewards.html` have residual UTF-8 encoding garbling. Spawned task exists. Frozen reference material; not blocking.

4. **`p1-5` Pact description scrubbed** — "Path A/B" reference removed from dashboard description; Pact has always been single-path. Confirmed during D6 audit.

5. **8 D6-derived items in build queue** (`a-b9` through `a-b16`) — covering post.hbs build-out (Tier Badge, Reclassification UI, AI Disclosure, Amendment Window, Wait Window) plus Stewards page cleanup (Republic→Community scrub, masthead logo, Charter formalize-or-accept).

---

## Where to look for everything

| Need | Path |
|---|---|
| Coherence audit (full record) | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-coherence-audit.md` |
| This handoff doc | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-27.md` |
| Dashboard JSX (4 tabs incl. Launch) | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Progress & Forecasts\dialecta-dashboard.jsx` |
| Data Architecture spec (v1.2) | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Dialecta_Data_Architecture.md` |
| Theme CLAUDE.md (workflow) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\CLAUDE.md` |
| API CLAUDE.md (system reference) | `C:\dialecta-api\CLAUDE.md` |
| Theme src (React components) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\` |
| API routes | `C:\dialecta-api\api\` |
| Migrations | `C:\dialecta-api\supabase\migrations\` |
| Ground-truth specs | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\` |

---

## How the new session should start

Open Claude Code in `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`. Paste the following as the first message:

> Resuming Dialecta build after audit closure. Read the handoff briefing at `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-27.md` for full context. We're at M1 of the First Quills launch roadmap; immediate task is `a-b6` Profile API joined returns. Start by reading the briefing, the current API endpoint at `C:\dialecta-api\api\profile\[id].js`, and the front-end consumer at `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\dialecta-profile-data.js`. Then propose the new endpoint shape before writing code.

Or shorter:

> Read `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-27.md` then start `a-b6`.

---

## Thanks for picking it up

The harmony-seeking pattern that's worked best this session: every layer corrects the next as we touch it. When the schema migration surfaced the spec's stale `uuid` claim, we fixed the spec. When the dashboard described a phantom artifact, we corrected it. When a build item revealed the existing implementation was richer than expected, we updated the spec to reflect production reality rather than reverting to a thinner spec.

That pattern is the project's actual operating principle now. Carry it forward.

— Previous session, end of 2026-04-27
