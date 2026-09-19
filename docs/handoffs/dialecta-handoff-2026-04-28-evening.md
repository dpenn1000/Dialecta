# Dialecta — Session Handoff (2026-04-28 Evening)

*Continuation from `dialecta-handoff-2026-04-27-evening.md`. Today went deep on article-display polish + Polish-engine refinement + design system formalization rather than the lettered audit queue. This doc reconciles both — what shipped, what remains, and a clear launch roadmap.*

*For the next session: paste path or contents to resume cleanly.*

---

## Where we ended up, in one paragraph

Phase 1 articles are now **publishable AND beautiful**. Yesterday closed having Phase 1A/1B/1C functionally complete — the editor, the API, the auth model, the data path — but the article display surface was vanilla. Today closed that gap: Polish engine produces real long-form rhythm (paragraph breaks + thematic `⁂` rules + extracted pullquotes + auto-detected pseudo-headers + sources styling); the article hero renders in canonical Dialecta brass on a cream card with proper editorial typography (drop cap, justified columns with hyphenation, hanging punctuation, paragraph indents); existing articles got retroactively polished via a `--apply` migration script; and the design system was formalized into reusable tokens (`--brass-gradient`, `--brass-shadow`, `.dialecta-brass`). The reading surface now matches what the editor was already promising. **Article-side launch readiness is real.**

The lettered audit queue (`a-b9`–`a-b16`, `a-d2`, `p4-4`, plus debt items) remains largely intact — that's the launch path forward.

---

## 🎯 The launch roadmap (the audit queue, as it stands tonight)

> **This is the focused To-Do list to launch.** Items below are derived from the coherence audit's triaged build queue + items deferred yesterday + items deferred today. Ordered by value-to-launch.

### Phase 2: Discourse Layer (THE remaining pillar)

The second pillar of Dialecta. Without it, we have a publication, not a community.

| ID | What | Estimate | Note |
|---|---|---|---|
| `a-b9` | Tier Badge component on post.hbs | small | uses existing classification data |
| `a-b10` | AI Disclosure UI ("how the engine read this") | small-med | transparency-as-feature |
| `a-b11` | Reclassification nomination UI | medium | community voting Stage 3 |
| `a-b12` | Stage 2.5 Amendment Window for comments | medium | mirrors article ritual |
| `a-b13` | Wait Window UI / Breach handling | small | the held-pending-review path |
| (debt) | `api/comment.js` bug fix (`author_id` → `member_id`) + member-uuid auth refactor | small | mirrors article submit's Path C-lite pattern |
| (new) | Comment submission UI in `dialecta-discourse-layer.jsx` mounted on post.hbs | medium-large | the actual write-a-comment surface |
| (new) | Comment private-draft mode (uses shared `ReflectionBar` with `size="comment"` — already wired for this) | medium | comment ritual flow |
| (new) | Opinion mapping rendered in `#dialecta-sidebar` (axes from article, reader places dot, aggregate as heat map) | large | the Opinion Map promise made real |
| (new) | Connection / relationship tracking when users engage | small-med | populates `follows`/`sparring_partners` from real activity |

### Phase 1D / 2.5: Reader-facing chrome

Items that polish the article surface beyond what shipped today.

| ID | What | Estimate | Note |
|---|---|---|---|
| Phase 1D | post.hbs byline override (Supabase author identity, not Ghost house user) | half-day | unblocks multi-author content cleanly |
| (new) | Author bio at article bottom (avatar + name + bio + profile link from Supabase) | small | editorial close, every Atlantic-class site has it |
| (new) | Related articles section | small-med | "more from this author / topic" |
| (new) | Footnote / citation system (numbered refs inline + jump-to-notes section) | medium | long-form accuracy without breaking the read |
| (new) | Sticky TOC for long articles | small | navigability for 3000+ word essays |
| (new) | Per-card Polish selection (schema change so each suggestion is individually applicable) | medium | needs `original_html` + `replacement_html` per suggestion in tool schema |
| (new) | Subtitle hierarchy fix — Polish prompt rule: don't promote first body paragraph to `<h2>` if `custom_excerpt` exists; OR theme-side render-time fallback | small | currently the "subtitle" lives inside body, fights byline ordering |
| (new) | Share / save affordances (sticky bar) | small-med | standard editorial chrome |

### Phase 3: Cohesion pass on informational pages

Bring About, Fingerprint, Guidebook (further), Pact, Stewards into the brass token system. One page at a time.

| ID | What | Estimate | Note |
|---|---|---|---|
| `a-b14` | Stewards: Republic→Community line 861 scrub | trivial | 30-second decision |
| `a-b15` | Stewards: masthead logo decision | small | yes/no choice |
| `a-b16` | Stewards: Charter formalize-or-accept | small-med | content decision |
| (new) | About: refactor inline brass to `var(--brass-gradient)` for token consistency | small | already partly there |
| (new) | Fingerprint: cohesion pass | medium | already deeply functional, needs visual polish |
| (new) | Guidebook: full overhaul beyond today's partial pass (sticky TOC, claim-grid + map-grid card upgrades, additional shadow depth) | medium | partially started today |
| (new) | Pact: cohesion pass | small-med | brass tokens, card consistency |

### Phase 4: Responsive + member chrome

| ID | What | Estimate | Note |
|---|---|---|---|
| `p4-4` | Responsive Foundations (mobile pass across profile, post, pact, stewards, write) | substantial session | bumped from Phase 4 → Phase 2 yesterday because First Quills needs mobile |
| (new) | Profile page enhancements (some already built; need final pass) | medium | |
| (new) | Author bio editing in profile settings | small | so authors can write their own bottom-of-article bio |
| (new) | Privacy Panel + spec doc | medium | deferred from yesterday; visibility model |

### Tracked debt / loose ends

| ID | What | Estimate | Note |
|---|---|---|---|
| `a-d2` | Verify Migration 007 (archetype enum canonical-only) applied to production Supabase | trivial | in repo; dashboard application unconfirmed |
| (debt) | Archetype list scrub: Diplomat + Oracle still in `profile.jsx ARCHETYPES` after engine v2.0.0 rename | small | UI cleanup |
| (mostly shipped) | Quote Library is now live as a full page at `/quotes/` (parallel-chat work landed). Remaining piece: subtle quote placements in CONSENT and POSTED stages of the editor (the original "ritual surface" use case). | small | check `page-quotes.hbs` + `src/dialecta-quotes-mount.jsx` + `assets/js/quotes.js` for current state |
| (debt) | `vercel.json` route `/api/profile/(?<id>...) → /api/profile.js?id=$id` is stale (Vercel filename-routing handles it natively) | trivial | small cleanup |
| (housekeeping) | Maya's orphan Ghost staff account — delete or leave alone | trivial | currently has zero published posts |
| (cohesion) | Width / responsive issues on article card (deferred today) | small | minor tuning |
| (taste) | Cormorant Upright font swap for additional swash character (offered today, deferred) | small | optional aesthetic shift |

---

## What got built today (chronological)

### Morning batch — Polish engine, design tokens, editorial polish

- **Polish migration script** (`scripts/polish-articles.mjs`) — dry-run by default, `--slug=foo`, `--limit=N`, `--apply`. Throttled, logged. Polishes existing Ghost articles via the deployed engine and writes back via Ghost Admin API with optimistic locking.
- **Engine fixes (round 1)**: stripped empty-string escape from `polished_html`; bumped `max_tokens` 4096→8192; raised input cap 12000→40000 chars (truncation was chopping long articles mid-section); strengthened pseudo-header detection; added "parallel paragraph trap" rule; added spacer-paragraph removal rule.
- **Polish UI**: rebuilt `AestheticSuggestionsPanel` with "Apply polish" CTA, Preview toggle (renders `polished_html` as read-only), explicit empty-state message.
- **Visual layer landed in `style.css`** — drop cap on lede, brass `<hr>` with asterism, gold-dot bullets, gold-leader numbered lists, `<blockquote>` styled as italic Cormorant pullquote, `<strong>` weight tuned, kerning + ligatures + old-style numerals + hyphenation + hanging punctuation + justified text.
- **Background card on `.post-article`** with 3-stop layered shadow, max-width 820px, padding via CSS variables for responsive scaling.
- **Feature image inside-card** with rounded top corners, edge-to-edge via negative margins.
- **Title-subtitle JS detection** in post.hbs — splits "Main (Subtitle)" / "Main: Subtitle" / "Main — Subtitle" patterns into separate elements.
- **Sources detection** — script tags h1-h4 with matching text AND `<p><strong>Sources</strong></p>` patterns; CSS styles them as small italic Cormorant with mono uppercase heading and hairline gold rule above.
- **Topic chip color-coding** — script maps slug → canonical TOPICS color, applies to chip border + text.
- **Discourse Layer transition kicker** — "THE CONVERSATION" mono uppercase amber framed by hairlines, replaces the bare hairline rule.
- **End-of-article asterism marker** via `.post-content::after`.
- **"9 min read min read" duplication bug** in post.hbs fixed.
- **Feature image caption** rendering (`feature_image_caption` field via figure/figcaption).
- **Lede ordering** — `custom_excerpt` now renders ABOVE the meta bar (Atlantic / NYT order).
- **h2/h3 outline contrast** — h2 weight 600, h3 weight 400 italic.
- **Drop cap bumped** 4.6rem → 5.8rem (responsive scales down on tablet/phone).
- **Reading column tightened** — card padding 64px → 88px (effective line length 75 → 64 chars).

### Afternoon batch — Engine evolution + brass design tokens

- **Engine evolved further**: added thematic breaks (`<hr>`) and pullquotes to allowed tags; new suggestion types `thematic_break` and `pullquote`; length-calibrated intervention budget at top of prompt (sub-1000 / 1000-2500 / 2500+ word tiers); pullquote distribution rule (must spread early/mid/late) with minimum floor for under-structured walls; suggestion cap 12 → 20.
- **Engine outline rule (h2/h3)**: explicit guidance that h2 = top-level article sections, h3 = sub-aspects nested under h2, with concrete examples.
- **Brass design tokens formalized in `:root`**: `--brass-deep`, `--brass-mid`, `--brass-warm`, `--brass-bright`, `--brass-pale`, plus composed `--brass-gradient` and `--brass-shadow`.
- **`.dialecta-brass` utility class** — italic + background-clip:text + transparent fill + filter shadow, with print fallback. Documented in style.css comment block as the canonical "polished metal" treatment.
- **Article title** refactored to use the canonical brass tokens (one source of truth).
- **Title hero gradient iterated 3 times** — first asymmetric (didn't ground right edge), then with too-wide pale band, finally landed on symmetric 7-stop near-horizontal sweep returning to deep bronze on both ends. Single 2px-offset / zero-blur drop-shadow. Italic Cormorant 600 (catches the gradient in a way roman strokes don't).
- **Photo upload (feature image)**: extended `_ghost-admin.js` to handle FormData; new `/api/article/upload-image` endpoint accepting base64 with member-uuid auth + 3MB cap + mime validation; FeaturePhoto component in editor (click-to-upload, thumbnail with × to clear); submit.js + post.hbs threaded through.

### Evening batch — Editorial-eye review + page-level polish

- **Editorial Atlantic-style critique** delivered: 12 issues identified, 8 of them fixed in the same pass.
- **Sources detection extended** to catch `<p><strong>Sources</strong></p>` markdown pattern (sources weren't styling because the markup was bold-paragraph not heading).
- **Title gradient** matched to the protagonist treatment from About page (italic, exact recipe).
- **Brass tokens promoted** as the canonical: `--brass-gradient` symmetric 7-stop, applied via `.dialecta-brass` utility.
- **Polish engine re-run** on all three articles after evolution rounds — "On the Far Shore of Fear" came back with 18 suggestions (up from earlier 4-5), engine note explicitly described what it was doing.
- **Guidebook page partial overhaul** — top spacing tightened (page padding 100→56, hero padding 48→24), brass tokens applied to hero eyebrow + italic + section labels, section dividers replaced with brass+asterism rule, tier cards upgraded (two-column grid, 56px coin-shaped icon badges with vibrant per-tier gradients, 28px icons, hover-lift, layered shadows).
- **Mixed-style paragraph rhythm** — block paragraphs (1.4em margin) AND first-line indent on subsequent paragraphs after user preference. No indent after structural breaks.

### Migrations & API deploys today

- API redeployed multiple times (`vercel --prod`) carrying engine evolution
- No new Supabase migrations applied today
- Migration 007 verification still pending from yesterday

---

## Architecture state (deltas from yesterday's evening doc)

### New API endpoints
- `/api/article/upload-image` — base64 → Ghost Admin Images API proxy with is_author auth gate

### New / modified theme files
- `src/dialecta-reflection-bar.jsx` — extracted shared component, ref-driven animation, fuse-on-init contract, `size` prop ('article' | 'comment'), ready for the comment private-draft consumer
- `src/dialecta-editor.jsx` — extensive evolution: tier confirmation panel in RespondStage, opinion-axes seed + required validation, FeaturePhoto component, Polish UI refresh, ReflectionBar refactor consumer
- `style.css` — full editorial typography vocabulary, brass design tokens, .dialecta-brass utility, sources styling, end-of-article marker, discourse transition kicker, feature image figure rules, drop cap, paragraph rhythm
- `post.hbs` — title-subtitle split JS, sources detection JS (now extended for `<p><strong>` patterns), topic chip color-code JS, discourse transition kicker, feature image caption, lede reordering, "min read" fix
- `page-guidebook.hbs` — hero tightening, brass tokens, asterism dividers, tier card overhaul (two-column, coin-shaped icon badges)
- `default.hbs` — `/write/` nav link added; auto-redirect to /profile/ for signed-in members removed (articles feed now reachable for everyone at /)
- `assets/css/style.css` — `.nav-write-link` styling

### Polished article inventory (current state in Ghost)
- **"On the Far Shore of Fear"** by Daniel — polished against the latest engine, 18 suggestions applied (thematic breaks, pullquotes, paragraph breaks, pseudo-header promotion of subtitle)
- **"On Doubt and Devotion: When Faith Pauses"** by Maya — 1.9KB short article, minimal polish needed
- **"The Conversation Communities Keep Having About Solar..."** by Daniel — re-polished across multiple rounds; has h2 sections, lists, blockquotes, sources section. **Note**: sources are in `<p><strong>Sources</strong></p>` markup — today's detection extension will style them; deploy required.

---

## Things to verify on next-session start

1. **Theme deploy state** — last build was clean but the most recent CSS changes (mixed-style paragraph indent restoration, brass-symmetric gradient, sources detection extension) require a fresh theme upload to be live. User had been deploying iteratively but final state may need confirmation.
2. **Polish-on-the-solar-article**: the 23 numbered references at the bottom should now style as small italic Cormorant once the theme deploy is current. Verify visually.
3. **Migration 007** still needs Supabase dashboard verification.
4. **CSS token usage**: About page protagonist is still inline; cohesion pass would refactor it to `var(--brass-gradient)`.

---

## Memory state (persists across sessions)

Saved during today's session: nothing new added beyond yesterday's three (`feedback_change_review.md`, `feedback_no_em_dashes.md`, `project_article_editor_aesthetic.md`).

Worth saving as a future-context cue:
- The brass design system is now formal (tokens + utility class). Future Dialecta-brass usage = `var(--brass-gradient)` + `var(--brass-shadow)` or `.dialecta-brass` class. NEVER inline gradient stops; use the tokens.

---

## Where everything is

| Concern | Path |
|---|---|
| This handoff (you are here) | `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-28-evening.md` |
| Yesterday morning handoff | `dialecta-handoff-2026-04-27.md` |
| Yesterday evening handoff | `dialecta-handoff-2026-04-27-evening.md` |
| Coherence audit (full record) | `dialecta-coherence-audit.md` |
| Audit brief (the original plan) | `Dialecta_Codebase_Audit_Brief.md` |
| Dashboard | `Fundamentals\Progress & Forecasts\dialecta-dashboard.jsx` |
| Project Index | `Fundamentals\Dialecta_Project_Index.md` |
| Theme | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\` |
| Theme CLAUDE.md | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\CLAUDE.md` |
| API repo | `C:\dialecta-api\` |
| API CLAUDE.md | `C:\dialecta-api\CLAUDE.md` |
| Migrations | `C:\dialecta-api\supabase\migrations\` (000-007 in repo; 007 needs verify) |
| Polish migration script | `C:\dialecta-api\scripts\polish-articles.mjs` |
| Editor source | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\dialecta-editor.jsx` |
| Reflection bar component (shared) | `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\src\dialecta-reflection-bar.jsx` |

---

## The integrated execution plan

> Combines the launch roadmap forward path with the audit's remaining scope. Sprint 1 is foundation hygiene that protects everything downstream. Sprints 2-4 are the substantive functional unlocks. Mobile gets pulled forward to Sprint 2 (was originally Sprint 7) because all discourse-layer surfaces need mobile-aware UX from the start — building desktop-first and retrofitting costs 2x, and most users meet Dialecta on a phone.

```
─────────────────────────────────────────────────────────────────
SPRINT 1 — Foundation Cleanup (half-day)                  ← audit
─────────────────────────────────────────────────────────────────
  1.  Verify Migration 007 applied; if not, apply
  2.  Retire 6 legacy archetype enum values (type-swap migration)
  3.  Fix api/comment.js (author_id → member_id) + member-uuid auth
  4.  Scrub Diplomat + Oracle from profile.jsx ARCHETYPES
  5.  Extract TOPICS to src/topics.js; import everywhere
  6.  Retire embedded fingerprint engine in profile.jsx (use canonical)
  7.  Retired-term scrub: steelman, Static, openground in copy

─────────────────────────────────────────────────────────────────
SPRINT 2 — Responsive Foundations (substantial)           ← audit, moved up
─────────────────────────────────────────────────────────────────
  8.  p4-4 Coordinated mobile pass across existing surfaces:
      profile, post, pact, stewards, write, /quotes/, info pages.
      Establishes mobile patterns before the discourse layer is built.
      Every component built after this sprint inherits these patterns.

─────────────────────────────────────────────────────────────────
SPRINT 3 — Discourse Layer Kickoff (the big block)        ← roadmap + audit
─────────────────────────────────────────────────────────────────
  9.  a-b9 Tier Badge component on post.hbs (mobile-aware from day 1)
  10. a-b10 AI Disclosure UI
  11. Comment submission UI (uses shared ReflectionBar size="comment")
  12. Comment classification + tier display per comment

─────────────────────────────────────────────────────────────────
SPRINT 4 — Discourse Layer Expansion                       ← audit
─────────────────────────────────────────────────────────────────
  13. a-b11 Reclassification nomination UI
  14. a-b12 Stage 2.5 Amendment Window for comments
  15. a-b13 Wait Window / Breach handling
  16. Comment threading + voting

─────────────────────────────────────────────────────────────────
SPRINT 5 — Opinion Mapping                                 ← roadmap
─────────────────────────────────────────────────────────────────
  17. Render axes from article opinion_axes
  18. Reader dot placement, aggregate heat map
  19. Connection / sparring-partner tracking from activity

─────────────────────────────────────────────────────────────────
SPRINT 6 — Reader Chrome                                   ← roadmap
─────────────────────────────────────────────────────────────────
  20. Phase 1D post.hbs byline override (Supabase author identity)
  21. Author bio at article bottom
  22. Subtitle hierarchy fix
  23. Per-card Polish selection (schema change)
  24. a-b14, a-b15, a-b16 Stewards small touches

─────────────────────────────────────────────────────────────────
SPRINT 7 — Cohesion Pass on Info Pages (one at a time)     ← roadmap + audit
─────────────────────────────────────────────────────────────────
  25. About: refactor inline brass to var(--brass-gradient)
  26. Fingerprint: visual polish pass
  27. Guidebook: complete overhaul (TOC, claim/map grid upgrades)
  28. Pact: cohesion + tier icons extraction (a-b4 final)
  29. Stewards: cohesion + completing a-b14/15/16
  30. /quotes/ page: brass-token alignment

─────────────────────────────────────────────────────────────────
SPRINT 8 — Pre-Launch QA                                   ← release
─────────────────────────────────────────────────────────────────
  31. Verify retired-term scrub completeness
  32. Dead code removal sweep
  33. Bundle orphan check
  34. Spec updates (Project Brief v2)
  35. Integration testing + mobile regression check across all flows
─────────────────────────────────────────────────────────────────
```

**The bottom line.** Most of the audit's remaining scope IS this roadmap — the lettered queue items got triaged precisely so they'd be discharged by forward motion. Only Sprint 1 is genuinely separate audit-cleanup work, and it's small (half a day) but high-value because it protects everything downstream. Sprint 2 (Responsive Foundations) is moved up so all subsequent component-building inherits mobile patterns rather than needing to be retrofitted.

---

## Where to actually start the next session

**Sprint 1, item 1**: Verify Migration 007 applied. Five minutes, clears verification debt, sets the discipline tone for the rest of the cleanup pass. Then work down the Sprint 1 list. Half a day total before anything in Sprint 2 begins.

If Sprint 1 wraps faster than a half-day, hop straight into Sprint 2 (Responsive Foundations) — that's the real time investment. Don't start Discourse Layer (Sprint 3) until the mobile patterns are established, even if it tempts you.

---

## How to start the next session

Open Claude Code in `C:\dialecta-local\versions\6.28.0\content\themes\dialecta\`. Paste the path to this doc as the first message.

Or briefer:

> Resume Dialecta build. Read `C:\Users\dan\OneDrive\Websites\Dialecta\Fundamentals\Claude Integration\dialecta-handoff-2026-04-28-evening.md` for state. Article-display surface is launch-ready; Phase 2 (Discourse Layer) is the remaining pillar. Pick the next task from the launch roadmap section.

---

## Closing note

Yesterday took Dialecta from "Ghost with a profile page" to "the platform the briefs describe, in functional form." Today took the article-display surface from functional to *editorial* — the kind of surface where a serious writer might publish their best work and feel honored by the typography. The brass title now reads with the same protagonist sheen as the About hero. The ⁂ thematic breaks and italic Cormorant pullquotes pace what was a wall. The drop cap pulls the reader in. Sources have their own register. The Guidebook tier cards no longer look like a Bootstrap demo.

What was launch-able yesterday is now invitation-worthy.

The Discourse Layer remains. That's the next mountain. But the article surface is done arguing for itself.

— End of session 2026-04-28 (evening)

---

# Continuation — 2026-05-01

*Logged retroactively. The session that followed the 2026-04-28 evening close stayed open across multiple sittings; this section captures the substantive work that landed before this session ended.*

## Polish v2 redesign — author-chosen levels + always-on at submit

Rylie's complaint surfaced the issue that pre-Polish-v2 was producing too aggressive an output (paragraph splits, content restructuring) without author awareness. The v2 architecture redesign:

**Floor + level-gated tools.** Hygiene is mandatory; rhythm tools are opt-in.

| Level | What it adds beyond the floor |
|---|---|
| **Light** *(default)* | Floor only — punctuation hygiene, em-dash policy, smart quotes, ellipsis consolidation, layout cruft removal, sources tagging, pseudo-header recognition |
| **Standard** | + Conservative thematic breaks (`<hr>`) at clear argument pivots only |
| **Editorial** | + Pullquote extraction · + List conversion from parallel paragraphs · + Emphasis additions on load-bearing phrases · + Aggressive thematic breaks |
| **Custom** | Five toggleable features for granular control |

Engine prompt completely rewritten ([api/article/aesthetic-suggest.js](api/article/aesthetic-suggest.js)). Output contract simplified: `{ polished_html, change_log }` (no more suggestion cards). Level resolution + feature gating in `resolveFeatures()`.

**Always-on at submit.** [api/article/submit.js](api/article/submit.js) calls polish inline, saves the author's submitted HTML to `articles.original_html` byte-for-byte, sends polished version to Ghost. Polish failure is non-fatal — falls back to original HTML if engine errors.

**Editor UI changed.** COMPOSE stage's "Polish formatting" button + AestheticSuggestionsPanel removed entirely. New `PolishLevelPanel` on FINAL stage above Publish button — radio group + Custom toggle expansion when selected. `polish_level` and `polish_options` threaded through to submit.

## Migration 016 — applied to production Supabase 2026-05-01

```
articles.original_html       text          (author's submitted HTML)
articles.polish_level        enum          (light | standard | editorial | custom)
articles.polish_options      jsonb         (custom feature toggles)
articles.polish_change_log   jsonb         (engine's brief change descriptions)
profiles.polish_preferences  jsonb         (user-level defaults — stub for future persistence)
profiles.is_admin            boolean       (admin gate, distinct from is_author)
```

UPDATE statement auto-flagged Daniel's profile (display_name ILIKE 'daniel%') as admin. Verified via SQL: `is_admin=true` for ghost_member_id `2f0d5ff2-570e-405a-8b40-ef5552660eb8`.

## Admin re-parse system

**[api/article/repolish.js](api/article/repolish.js)** — new admin-only endpoint. Auth: `profiles.is_admin = true` required. Always operates on `articles.original_html` (not current Ghost HTML), so re-polish is non-destructive and idempotent — running Light then Editorial then Light returns to a clean Light state. For pre-migration articles with no `original_html`, falls back to fetching current Ghost HTML and back-fills the column.

**[src/dialecta-admin-repolish.jsx](src/dialecta-admin-repolish.jsx)** — new floating "Re-parse" button (bottom-right, brass-on-cream chip) visible only to admins. Auth check: fetches `/api/profile/{member_id}` on mount, gates on `is_admin`. Click opens modal with same level radios + Custom toggles as the editor's FINAL stage. Submit calls `/api/article/repolish`, displays change_log on success, offers reload button. Modal mounts via `index.jsx` reading `dialecta-admin-repolish` div + data-* attributes from `post.hbs` (gated on `{{#if @member}}` for HBS-side cleanliness).

**Profile API extension.** `/api/profile/[id]` now returns `is_admin` in the flat response object (added to SELECT and serialization).

## Brightness + brass-tinted shadow pass

User noted the site felt "more yellow today." Diagnosed: `--paper` (#fbf6ea) was significantly warmer than profile-page cards (#fffefa) — the article card and other primary surfaces were dragging the global register warm.

Fixes ([style.css](assets/css/style.css)):
- `--paper`: `#fbf6ea` → `#fdfaf0` (first pass) → `#fefcf5` (second pass after still-too-yellow feedback)
- `--paper-bright`: `#fefaea` → `#fefcf3` → `#fffdf8` (now matches `--bg-white`)
- `.post-article` box-shadow added: `inset 0 1px 0 rgba(245,223,160,0.35)` (brass-pale top-edge highlight) + the hairline ring switched from neutral 0.04 to `rgba(184,134,46,0.18)` (amber tint)

## Header padding standardization

Page-fingerprint's `.page` correctly uses `padding: 0 clamp(...)` — no top padding. The other info pages were stacking 20-56px top padding ON TOP of `.site-main`'s global nav-clearance (`calc(var(--nav-height) + 16px)`), double-counting and creating "swimming through whitespace" before content started.

Fixed (top padding removed from each `.page` rule):
- [page-about.hbs](page-about.hbs): `clamp(20px,4vw,56px)` → `0`
- [page-guidebook.hbs](page-guidebook.hbs): `clamp(20px,4vw,56px)` → `0`
- [page-pact.hbs](page-pact.hbs): `clamp(20px,3vw+8px,40px)` → `0`
- [page-stewards.hbs](page-stewards.hbs): `clamp(20px,3vw+8px,40px)` → `0`

Horizontal and bottom padding kept per-page; heroes own their own internal vertical rhythm.

## Sources detection regex extended

User reported "Works Cited" rendering at full h2 size with no citation aesthetic. Root cause: the post.hbs sources-detection regex only recognized `Sources / References / Notes / Bibliography / Citations / Further Reading`. Polish engine had correctly tagged "Works Cited" as `<h2>`, but the JS that adds `.sources-heading` class didn't recognize it, so CSS styling didn't apply.

Updated regex to: `/^(sources|references|notes|bibliography|citations|further reading|works cited|works referenced|footnotes|endnotes)\s*:?\s*$/i`

## Byline override gap surfaced (not yet fixed)

User reported Kathryn's article showing "Daniel Pennington" as author. Verified Supabase has Kathryn correctly attributed (`articles.author_member_id` = Kathryn's UUID). The byline-override script in post.hbs DOES exist and DOES correctly fetch from `/api/article/{id}` (which returns `author.display_name = "Kathryn Pennington"`). User-side debugging via console diagnostic is the next step to pinpoint where the chain breaks. **Queued.**

## Architecture state additions

### New API endpoints
- `/api/article/repolish` (admin-only)

### New theme files
- `src/dialecta-admin-repolish.jsx` (mounted on post.hbs for admins)

### Schema deltas
- `articles`: `+original_html`, `+polish_level`, `+polish_options`, `+polish_change_log`
- `profiles`: `+polish_preferences`, `+is_admin`

### Design token deltas
- `--paper`: `#fefcf5` (post-brightening)
- `--paper-bright`: `#fffdf8` (matches `--bg-white`)
- `.post-article` shadow now includes brass-pale inset + amber-tinted ring

### File modifications by parallel chats (noted, not authored by this session)
- `api/article/submit.js` — opinion_axes shape validation added
- `api/article/upload-image.js` — extended to handle `avatar`, `field_note`, `book_cover` purposes alongside `article`
- `api/article/repolish.js` — author-notification side effect added (createNotification call)
- `post.hbs` — author bio block + opinion-map placement + mobile-only TOC + author byline-override script + post-page sidebar moved to default.hbs

## Open / queued from this session

| Item | Status |
|---|---|
| Byline override silently failing on at least one article (Kathryn's) | Diagnostic snippet given to user; awaiting Network/Console output |
| Persistent polish preferences via `profiles.polish_preferences` + "Save as default" UI | Schema column ready; UI deferred |
| Strip-v2-interventions script (heuristic recovery for pre-v2 articles) | Proposed; not built |
| `/api/strip-back` endpoint for one-click "remove pullquotes/hr from this article" | Not started |

The integrated execution plan from earlier in this handoff (Sprints 1-8, mobile pulled to Sprint 2) **still stands as the launch roadmap**. Today's continuation work was tactical polish on top of Phase 1A/1B/1C; it didn't move forward on the Discourse Layer block.

— End of 2026-05-01 continuation
