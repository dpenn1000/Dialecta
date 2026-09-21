---
id: 2026-09-21-architect-06
type: handoff
from: architect
to: [builder]
subject: Standards for apps/web, decided: typed clients, tests, CI gates, a shared tsconfig
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Measured on tracked files, 2026-09-21, with the calibrated tools in `team/architect/tools/`:

1. `supabase/types.ts` was last generated 2026-09-19. It lacks tonight's `articles` content columns,
   `profiles.user_id` and `profile_claim_tokens`, and nothing in `apps/web` imports it. Four SDK
   clients are created without `<Database>`: `apps/web/src/lib/supabase/client.ts:15`,
   `middleware.ts:31`, `server.ts:21`, `service.ts:34`.
2. `apps/web` has 0 test files and no `test` script. Every write path is untested:
   `app/api/comment/route.ts`, `app/api/article/route.ts`, `app/auth/callback/route.ts`,
   `app/login/actions.ts`, `middleware.ts`.
3. CI runs typecheck, tests and the voice gate, not lint. Lint passes today: `eslint` over the tracked
   `apps/web` files exits 0.
4. No shared tsconfig. 8 of 19 compiler options already agree between the workspaces
   (`team/architect/knowledge/2026-shared-tsconfig-base.md`).
5. `apps/web/.env.example` lacks `ANALYTICS_ADMIN_UIDS` and `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC`,
   which the code reads; the root template lacks 13 names that `api/`, `scripts/` and `tools/` read.
6. `apps/web/src/lib/supabase/client.ts` is imported by nothing, and the root `package.json`
   depends on `@supabase/supabase-js` with no root code using it.

Outside `apps/web`, from the same sweep, checked against the live catalog including column defaults:

7. **`scripts/import-ghost.mjs` cannot import an article.** `toRow()` (lines 91 to 104) never sets
   `articles.author_member_id`, which is NOT NULL with no default, and its `--author-id` flag
   (line 102) writes `author_id`, a column live `articles` does not have. Tonight's migrations lean
   on this script: `20260921040353` calls it "a drop-in" and `20260921041504` says "a real import
   later overwrites every value written here". Fix: set `author_member_id` from the Ghost author,
   and `author_profile_id` with it; drop `author_id`. The other columns it omits all have defaults,
   and a unique index backs its `onConflict: 'ghost_post_id'`.
8. **`packages/core/src/axis-mapping.ts:155-160`** shapes an axis event as
   `{ axis, delta, tier_at_contribution }`. Live `axis_events` has `tier`, not `tier_at_contribution`,
   and no `delta` column. Nothing writes `axis_events` yet, so this is latent; settle it before the
   ledger writer lands, not after.

Decided, as this seat's standards call:

- **Typed clients, in this order:** regenerate `supabase/types.ts` (`npm run types`), wire
  `<Database>` into the four clients, then fix what `tsc` surfaces.
- **Tests:** vitest in `apps/web`. First target, the comment route's identity rule and its
  classification write, where the `partially` data loss lived.
- **CI gates, in this order:** `npm run lint` now; dependency-cruiser per workspace now (passes today);
  the ast-grep rule once the clients are typed; squawk with `--pg-version=17.6` on changed
  migrations; knip and `jscpd --baseline` once a baseline is committed.
- **tsconfig:** a root `tsconfig.base.json` holding the 8 options that agree, extended by both
  workspaces. The keys Next.js enforces by version stay in `apps/web`. No project references yet.
- Delete `client.ts` or wire it with `<Database>`; drop the unused root dependency; add the two names
  to the web template.

## Not done

All implementation. Each item above is `builder`'s.

## Governing spec

None. This seat's mandate on standards.

## Acceptance

`ast-grep scan --config team/architect/tools/sgconfig.yml` over `apps/web/src` returns 0 findings;
`npm test -w apps/web` exists and passes; CI shows the lint and dependency-cruiser steps.

## Traps

- dependency-cruiser must run from inside each workspace with TypeScript installed beside it. Three
  runs reported clean and were wrong; `team/architect/tools/README.md` has the working commands.
- `exactOptionalPropertyTypes` will bite the regenerated `Insert` types (`2026-09-21-builder-01`).
- `apps/web` pins Next.js 15.5.25. Current docs describe 16.

## Do not touch

The three builder sessions' files tonight: `supabase/`, `apps/web/src/lib/articles.ts`, `/write`,
`/api/article`, `/analytics`.
