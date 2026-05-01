# Dialecta — Project Context for Claude Code

> **Read this first, every session.** This file is the persistent memory across chats. It captures architecture, wiring status, what work has already been done, and what comes next. Update it when state changes.

---

## What Dialecta is

A discourse platform that classifies comments into a 7-tier "brightness ladder" (Forum, Spark, Echo, Fog, Heat, Stance, Breach) using a hybrid AI + community-voting + self-declaration engine. Editorial mission: redirect social-media reward loops toward clarity and honest disagreement instead of outrage.

Production URL: **https://www.dialecta.org**
Status: **Live, post-launch.** Invited contributors at first; broader rollout staged.

Core philosophy details, tier definitions, classification spec, design tokens: see the OneDrive concept folder (path below). The README in this repo is a high-level summary, not the source of truth for product decisions.

---

## Stack (final — Next.js phase deferred indefinitely)

| Layer | Tech | Where it lives | Notes |
|---|---|---|---|
| **CMS / canonical pages** | Ghost (self-hosted via Ghost-CLI) | `C:\dialecta-local\` | Renders home, articles, Pact, Stewards, profile pages server-side via Handlebars |
| **Theme** | Custom Ghost theme `dialecta` | `C:\dialecta-local\content\themes\dialecta` | **Use this stable path, not the version-bound `versions\6.28.0\...` symlink** — the versioned path breaks on `ghost update` |
| **Interactive widgets** | React (hydrated into Ghost templates) | This repo (`dpenn1000/dialecta`) — partial; profile widget only | Widgets read `data-*` attrs from Ghost Handlebars helpers and call `/api/*` |
| **API** | Vercel serverless functions | This repo `/api/*` | CORS-locked to `https://www.dialecta.org` (see `api/profile/[id].js:47`) |
| **Database / auth** | Supabase | Project `Dialecta`, ID `mguulnibvzusfvyuowwh` | Org: Pennington Media Group (`bivgjuosqiupglntinpy`). Postgres 17.6, us-east-1 |
| **Transactional email** | Resend | — | Domain reputation matters; verify SPF/DKIM/DMARC on `dialecta.org` |
| **Hosting (API)** | Vercel | — | Personal account, no team — see Vercel MCP wiring note below |
| **AI classification** | Anthropic Claude API | `api/classify.js` | Server-side only; key in Vercel env |

### Architectural pattern that drives everything

**Ghost server-renders the page shell. React hydrates into mount divs inside the shell.**

Example from `dialecta-profile-mount.jsx`:
```html
<div id="dialecta-profile-root" data-user='{{member-profile-json}}'></div>
<script src="{{asset "built/dialecta-profile.js"}}" defer></script>
```

This pattern repeats for comments, opinion-mapping tools, and any other interactive widget. It has direct SEO consequences (see audit below).

---

## Repo / folder map

### What's in `dpenn1000/dialecta` (the GitHub repo I have access to)

```
/api/
  classify.js          POST: AI tier suggestion for new comments
  comment.js           POST: persist comment with classification
  profile/[id].js      GET/PATCH: merged profile (Ghost member + Supabase data)
dialecta-profile-data.js
dialecta-profile-edit.jsx
dialecta-profile-mount.jsx    (React mount entry point)
package.json           (only @supabase/supabase-js — minimal)
vercel.json            ({"version": 2})
.gitignore             (added on branch claude/defer-seo-optimization-mzyTG)
CLAUDE.md              (this file)
README.md              (project description)
```

### Folders the web sandbox cannot reach but matter for this work

| Path | What it holds | Reachability |
|---|---|---|
| `C:\dialecta-local\content\themes\dialecta` | The Ghost theme — `.hbs` templates, theme assets, the React mount targets | **Not in this repo. Sandbox cannot see it.** May or may not be a separate Git repo (verify with `git status` in that folder). To reach it from the web sandbox, push it to GitHub and request scope expansion to that repo. |
| `C:\dialecta-api` | Local clone of `dpenn1000/dialecta` | Reachable via the GitHub MCP — it's the same repo as this one |
| `C:\Users\dan\OneDrive\Websites\Dialecta` | Original concept folder. Foundational MDs, briefs, data schemas, design specs, classification engine spec, tier psychology, AI prompt architecture, growth layer principles | Reference material. To use in a session, paste relevant excerpts into chat or push selected docs into a `/docs` folder in this repo. |

---

## Wiring status (MCP integrations)

Run a quick sanity check at session start by asking Claude to call `mcp__github__get_me`, `mcp__c15a8921-...__list_organizations`, etc., or just list projects. See the verification commands at the bottom of this file.

### ✅ Working

| Integration | Auth state | Scope |
|---|---|---|
| **GitHub** | Authenticated as `dpenn1000` | Restricted to `dpenn1000/dialecta` only. Other repos (theme, anything else) will fail with a scope error — request expansion when needed. |
| **Supabase** | Authenticated, sees Pennington Media Group org | Two projects exist: `Dialecta` (production, `mguulnibvzusfvyuowwh`) and `dpenn1000's Project` (older scratch, `kqsmprkeavuchcpnixfx` — consider deleting if unused) |

### ⚠ Partially wired

| Integration | Issue | Workaround |
|---|---|---|
| **Vercel MCP** | Personal account → `list_teams` returns `[]` → `list_projects` requires a `teamId` and fails. `web_fetch_vercel_url` may still work directly with full URLs. | Either (a) move Dialecta into a free Vercel team and re-auth, or (b) call `web_fetch_vercel_url` directly with deployment URLs. For now, treat Vercel MCP as effectively read-broken. |
| **Live-site crawl** | The web sandbox blocks all outbound HTTP to `dialecta.org` (`x-deny-reason: host_not_allowed` from sandbox edge, not from your server). | Have the human paste curl outputs from their local terminal, or run audits from local Claude Code. Do not waste turns retrying WebFetch against `dialecta.org`. |

### ❌ Not yet wired

| Integration | Why it matters | How to wire |
|---|---|---|
| **Ghost Content API** | Read posts, tags, authors, settings, theme info via HTTP. Read-only and low-risk. | Ghost Admin → Settings → Advanced → Integrations → "+ Add custom integration" → name it `Claude SEO` → copy the **Content API Key**. Add to `.claude/settings.local.json` env block as `GHOST_CONTENT_API_KEY`. URL is already known: `GHOST_API_URL=https://www.dialecta.org`. |
| **Ghost Admin API** | Create/update posts, upload theme, manage members. Higher risk — defer until needed. | Same integration page exposes the Admin Key (format `id:secret`). Prefer Git-based theme deploys over Admin API uploads when possible. |
| **Google Search Console** | Real indexation status, query data, crawl errors. | No MCP. Either export CSVs into `/docs/seo-data/` periodically, or grant a service account and wire it via a custom MCP later. |
| **Bing Webmaster Tools** | Same as GSC for Bing/Copilot. | Lower priority; same approach. |

### Where secrets go

Two locations, both gitignored:

1. `.claude/settings.local.json` — `env` block. Loaded by Claude Code as env vars for every tool call. **Use this for keys Claude needs to call APIs.**
2. `.env` / `.env.local` (if/when added) — for local dev or build-time tooling.

`.gitignore` (in this repo, branch `claude/defer-seo-optimization-mzyTG`) already protects:
- `.env`, `.env.*` (except `.env.example`)
- `.claude/settings.local.json`

**Never paste API keys into chat.** Write them directly to the file. Chat transcripts are logged.

Template for `.claude/settings.local.json`:
```json
{
  "permissions": { "allow": [] },
  "env": {
    "GHOST_API_URL": "https://www.dialecta.org",
    "GHOST_CONTENT_API_KEY": "<paste here>",
    "GHOST_ADMIN_API_KEY": "<paste later if needed>"
  }
}
```

---

## SEO audit — already done. Do not redo.

A full audit was completed on branch `claude/defer-seo-optimization-mzyTG`. Findings below are the conclusion, not the starting point.

### The single biggest finding

**React widgets render `Loading...` placeholders in the initial HTML.** Crawlers and AI search engines (Googlebot, GPTBot, ClaudeBot, PerplexityBot, Google-Extended) see those placeholders, not the real content. This means:

- Comment threads — your highest-signal, most distinctive content — are invisible to search.
- Profile pages render `Loading profile...` to crawlers (see `dialecta-profile-mount.jsx:31-47`).
- Opinion-mapping tools are interactive D3, not indexable.

In an AI-synthesis search world, the tier-classified comment threads are arguably *more* citable than the articles themselves. Fixing this is the single highest-leverage SEO move.

### Priority-ordered recommendation list

#### P0 — Highest impact, mostly in the theme

1. **Server-render fallback content inside every React mount div.** In each `.hbs` template, populate the mount target with the same data the React widget will eventually show. React hydrates over existing DOM rather than wiping it.
   - **Profile** (`profile.hbs` or equivalent): inside `<div id="dialecta-profile-root">`, render `display_name`, `bio`, `location`, headline tier stat (e.g. "Forum tier: 38%") as plain HTML. Build a Handlebars partial that pulls from Ghost member helpers + a build-time or edge-time fetch to Supabase.
   - **Comments**: server-render the top 5 Forum/Spark tier comments per article in the initial HTML, with `<article>` tags and tier metadata. Heat/Stance/Breach tiers can stay client-rendered behind a "show all" expansion.
   - **Opinion maps**: render a static SVG snapshot of the current aggregate as fallback. Crawlers can't read interactive D3, but they can index a captioned image.

2. **Verify `/robots.txt` does not block AI crawlers.** Check the live file at `https://www.dialecta.org/robots.txt`. Decide whether to allow or block: `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`. Default Ghost robots.txt allows all. Decision impacts: AI Overviews citation, training-set inclusion (`Google-Extended` is training-only), Perplexity/ChatGPT citation. Recommendation given Dialecta's editorial mission: **allow all** — you want to be cited as the canonical source for tier-system discourse.

3. **Confirm canonical host.** `dialecta.org` and `www.dialecta.org` should not both serve content. Check:
   ```bash
   curl -sI https://dialecta.org | grep -i location
   ```
   The CORS in `api/profile/[id].js:47` is locked to `https://www.dialecta.org`, so `www` should be canonical and apex should 301 to it.

4. **Confirm sitemap.xml is reachable and indexed.** Ghost auto-generates `/sitemap.xml` (referencing `/sitemap-pages.xml`, `/sitemap-posts.xml`, `/sitemap-authors.xml`, `/sitemap-tags.xml`). Verify all four resolve and submit the index to Google Search Console + Bing Webmaster Tools.

#### P1 — High-leverage, distinctive to Dialecta

5. **Schema.org markup for the tier system.** Genuinely novel content; mark it up.
   - Article pages: extend Ghost's `Article` schema with `commentSection` referencing a `DiscussionForumPosting` graph for the thread.
   - Each comment: emit `Comment` with `additionalType` referencing the tier definition page (e.g. `"additionalType": "https://www.dialecta.org/pact#forum-tier"`).
   - Pact / Stewards / Tier definitions: emit `DefinedTermSet` with each tier as a `DefinedTerm`.

6. **Build canonical-source pages for distinctive concepts.** Dialecta owns terminology nobody else uses: *Forum tier, Spark tier, Stance tier, ternary opinion plot, Steward Order, Satirist's Charter, Thinking Fingerprint, petal engine.* Each deserves a dedicated, long-form, FAQ-marked page. Goal: when someone searches "what is a ternary opinion plot" or "Dialecta tier system", you are the only canonical source. Source content: pull from the OneDrive concept folder.

7. **Add `/llms.txt` at the root.** Emerging convention for AI agents. List your most citable pages in a structured Markdown index. Cheap to ship, helps with AI-search citation accuracy.

8. **Internal linking from tier badges.** Every tier badge displayed on a comment should link to (a) that tier's definition page and (b) the contributor's profile. Builds topical authority graph.

9. **Profile URL strategy.** Decide: are profiles public? If yes, clean URL (`/contributors/<slug>` not `/members/<uuid>`), `Person` schema, included in sitemap.

#### P2 — Performance and polish

10. **Hydration cost on LCP.** Defer below-the-fold widgets, hydrate-on-interaction for opinion maps, set explicit dimensions on avatars to prevent CLS.
11. **Image optimization.** Route Supabase-hosted avatars through an image proxy with far-future cache headers.
12. **OG fallbacks for any client-routed pages.**
13. **DMARC/SPF/DKIM** verified for `dialecta.org` (Resend domain auth → domain reputation → trust signals).

---

## Current branch state

**Branch:** `claude/defer-seo-optimization-mzyTG`
**Status:** Has uncommitted/unpushed work from the SEO planning session.

**Files added on this branch (not yet on `main`):**
- `.gitignore` (protects `.env*` and `.claude/settings.local.json`)
- `.claude/settings.local.json` (gitignored — local-only env template)
- `CLAUDE.md` (this file)

**Files changed on this branch from earlier work:**
- `api/profile/[id].js` — CORS support added (this was committed: `060dede`)

**Action for human:** review the diff, then commit + push. The web session can do this if instructed; otherwise pull locally and review there.

---

## Open questions the next session should resolve

Treat these as the queue. Do not spin on them silently — ask the human if blocked.

1. **Is `C:\dialecta-local\content\themes\dialecta` a Git repo?** Run `git status` and `git remote -v` in that folder. If yes, where is the remote? If no, initialize it and push to a new `dpenn1000/dialecta-theme` repo, then request MCP scope expansion.
2. **Decision on AI-crawler robots.txt policy.** Allow all (default Ghost behavior, recommended) or selectively block? This is a values call, not a tech call.
3. **Are member profiles public-by-default or member-gated?** Drives URL structure and whether profile pages go in the sitemap.
4. **Vercel team migration?** Personal account → team would unblock the Vercel MCP. Worth ~10 min if logs/env access matters.
5. **Ghost Content API key** — when this lands in `.claude/settings.local.json`, the next session can begin live audits via curl against the Ghost API.

---

## Next-action queue (priority order)

1. **Ghost Content API key wiring.** Human pastes key into `.claude/settings.local.json`. Verify with `curl "$GHOST_API_URL/ghost/api/content/posts/?key=$GHOST_CONTENT_API_KEY&limit=1"`.
2. **Theme repo decision.** Resolve open question #1 above. Path forks here:
   - If theme is in a Git repo → request MCP scope expansion → start writing SSR fallback partials
   - If not → initialize theme repo, push, then proceed
3. **First SSR partial: comments widget.** Highest-leverage P0 fix. Convert every article from "one indexable post" into "one post + N indexable high-signal discussion turns."
4. **Second SSR partial: profile widget.** Same pattern, applied to `dialecta-profile-mount.jsx`'s mount target.
5. **`llms.txt` + canonical concept pages.** Pact, Tier definitions, Ternary explainer. Source from OneDrive concept folder.
6. **Schema.org additions.** Article + DiscussionForumPosting + Comment + DefinedTerm.
7. **GSC + Bing submission, robots/sitemap verification.**

---

## Conventions

- **Branching:** Claude work goes on `claude/<short-slug>` branches. PRs to `main`. Never push directly to `main`.
- **Commits:** Conventional message style. Reference SEO findings by P0/P1/P2 number when relevant.
- **Don't touch the philosophy doctrine.** The Pact, the tier system, the Growth Frame, the AI-as-mirror-not-judge principle — these are editorial commitments, not implementation choices. If a technical change would alter user-facing wording around any of them, flag it and ask first.
- **Don't propose Next.js migration.** It's been deferred indefinitely. The Ghost + React + Supabase stack is final.
- **Don't redo the SEO audit.** It's documented above. If new evidence changes a finding, append to this file rather than starting over.

---

## Verification one-liners (paste into a new session to confirm wiring)

```
List my GitHub identity.
List my Supabase organizations and projects.
Check if Ghost API keys are in .claude/settings.local.json env.
Show the current branch and git status.
```

If any of those return errors that contradict this file, update the relevant section.

---

*Last updated: SEO planning session, branch `claude/defer-seo-optimization-mzyTG`. Update this stamp on substantive changes.*
