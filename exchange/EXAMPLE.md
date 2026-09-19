---
id: EXAMPLE
type: handoff
from: builder
to: [reviewer]
subject: Example record, not live work, nothing is waiting on this
backlog: A-1
state: closed
opened: 2026-09-19
closed: 2026-09-19
outcome: Example only. Written to show the format, never worked.
---

> This file is an example of a filled `handoff`. It is not in `open/` and no agent is waiting
> on it. The content below describes backlog item A-1 as it would be handed over, so the
> sections have something concrete in them. None of it has been built.

## Done

- `apps/web/src/components/composer.tsx`, client island. Character count, the 12 character
  submit gate, and the nudge bar.
- `apps/web/src/strings.ts`, four new keys under `composer.`.
- `apps/web/src/app/api/comments/route.ts`, inserts `comments` with `status = 'pending_review'`
  and enqueues classification.
- Commit `abc1234` on `feat/composer-island`.

## Not done

The nudge bar text is placeholder in three of four states. `voice-editor` has not seen it.
Rate limiting is not built and is not in the brief.

## Governing spec

`docs/Dialecta_Discourse_Layer_UX.md`, section "Stage 1: the composer".

## Acceptance

`npm test -w packages/core` passes, 27 tests. `npm run typecheck` clean.
A comment under 12 characters cannot be submitted, verified by hand in the browser and by
`packages/core/src/__tests__/gate.test.ts`.

## Traps

- The insert has to return before classification is enqueued. An earlier version awaited the
  Haiku call inside the route and the composer hung for four seconds on every submit.
- `status = 'pending_review'` looks like it should be an enum member and is deliberately a
  string in this migration. Migration 0003 turns it into the enum once the tier list settles.
- The nudge bar reads the count from the textarea rather than from state. That looks like a
  bug and is deliberate: reading from state dropped a frame on every keystroke.

## Do not touch

- `packages/core/src/resolution.ts`, held by the A-4 work.
- `supabase/migrations/`, `migrator` owns every file there.
