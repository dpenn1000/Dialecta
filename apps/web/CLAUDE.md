# apps/web, working context for Claude Code

The Next.js 15 (App Router, TypeScript) front end. Root `CLAUDE.md` holds the locked decisions; this file is the conventions for this app only.

## Conventions

- **Server components by default.** A file is a client component only when it needs state, effects or browser APIs. Client islands, and only these until a spec says otherwise: the comment composer, the classification card, votes, the Thinking Fingerprint, the opinion maps, the article editor (TipTap, `src/components/editor/`, backlog A-10). Keep each island small and pass it data from a server component.
- **Tokens come from `src/styles/tokens.css`.** That file is generated from `design/dialecta-design-spec.html` by `npm run tokens` (repo root). Never edit it by hand and never hard-code a color, font, radius or shadow that a token provides. `globals.css` sets the canonical page background and font stack from the tokens.
- **Strings a person reads live in `src/strings.ts`.** Page copy, notices, commenter messages, button labels. The voice hook (`scripts/voice_check.py --strict`) runs over that file in CI, so it must contain no em dashes, en dashes, `--` pauses or stacked exclamation points. Placeholder pages may keep their one-line description inline until they are built.
- **Shared logic lives in `@dialecta/core`** (`packages/core`): tiers, pillars, archetypes, classification parsing, tier resolution, axis mapping. Do not duplicate it here. Import from `@dialecta/core`; Next transpiles the package source (`transpilePackages` in `next.config.ts`).
- **Articles come from Supabase, never Ghost.** ADR-001/003 in `docs/decisions/`. `src/lib/articles.ts` reads the `articles` table (`status = 'published'`); the editor writes `body_json` and `body_html` together. Ghost appears only in `scripts/import-ghost.mjs`, a one-time import. No Ghost imports or env in this app.
- **Data access:** `src/lib/supabase/server.ts` in server code, `src/lib/supabase/client.ts` in islands. Any page that needs env is guarded and renders a notice from `strings.notices` when it is missing.
- **Ids are `uuid`.** `articles.ghost_post_id` (`text`) is legacy, only the import script touches it. See `supabase/CLAUDE.md`.
- **Route params are promises** in Next 15: `const { slug } = await params;`.
- Voice rules apply to anything a contributor sees. Observational, never evaluative. "This reads as Heat", never "classified as".

## Pages and the spec each implements

| Route | Spec |
|---|---|
| `/` | Dialecta_Social_UX_Architecture.md, Dialecta_Project_Index.md; lists published articles |
| `/articles/[slug]` | Dialecta_Article_Editorial_Template.md, Dialecta_Discourse_Layer_UX.md |
| `/pact` | Dialecta_Project_Brief.md (Pact page), components/dialecta-pact.html |
| `/guidebook` | Dialecta_Project_Brief.md (Living Guidebook), Dialecta_Tier_Psychology.md |
| `/community` | Dialecta_Social_UX_Architecture.md |
| `/profile/[id]` | Dialecta_Contributor_Identity.md, Dialecta_Growth_Scroll.md |
| `/api/health` | Proves the `@dialecta/core` workspace link |

## Run

From the repo root:

```
npm install            # once
npm run dev            # apps/web on http://localhost:3000
npm run typecheck      # all workspaces
npm test               # all workspaces (vitest in packages/core)
npm run lint
npm -w apps/web run build
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and fill it in. Never commit real values.
