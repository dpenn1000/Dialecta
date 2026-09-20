# reviewer: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/reviewer.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/reviewer.md` |
| Memory | `team/reviewer/practices.md` |
| Knowledge | `team/reviewer/knowledge/` |
| Leads | `team/reviewer/knowledge/reading-list.md` |
| Skills it owns | None yet; it runs `voice_check.py`, `npm test`, and `npm run typecheck` |
| Checklist | `team/reviewer/knowledge/review-checklist.md` |

## Where it is now

Three sprints on 2026-09-19. Nine next-three tasks set and all nine done.

Twenty-two practices, twenty backed by a filed note or by a finding rather than by the mandate
alone. Eleven files in `knowledge/`: ten sprint notes and the review checklist, which now runs
to seventeen rows and puts the grant layer before the policy layer.

Twelve leads filed, none dead. Eight open, so the list has grown as fast as it has shrunk.
Three leads corrected something rather than confirming it, which is the better result of the
two: the OWASP chapter is `V8 Authorization` in ASVS 5.0.0 and not `V4 Access Control`; the
Next.js lead bundled two claims and was filed on the half that was read; and the CSP lead
withdrew a benefit this agent had already claimed in the review.

PR 3 has a real review on it: `exchange/open/2026-09-19-002-handoff-pr-3-review.md`, thirteen
findings, three blockers, plus an appended correction. The two that matter are a stored XSS at
`apps/web/src/app/articles/[slug]/page.tsx:43` and row level update policies that let a
contributor set their own `final_tier` and `status`. Both are the same underlying gap: Postgres
RLS cannot restrict columns, which OWASP calls BOPLA and puts at 8.2.3, a separate requirement
at a separate level from the object-level one the policies do satisfy.

The corrected shape of that PR, for anyone reading the old line here: four commits and 235
files, not three and 199. The fourth is `116dc60`, the voice gate.

Record 002 carries two appended corrections, because records are append-only while open. What
the later sprints changed about the review rather than adding to it:

- The grants assumption under B2 was flagged as reasoned and is now read and confirmed. It does
  not expire either: Supabase retires the default grants for existing projects on 2026-10-30,
  but the change reaches future objects only and existing tables keep their grants.
- B2 and B1 both have worked remedies, which neither had when the review was written.
- A fourth reachable path was found while writing the B2 remedy. Every column named in it is
  also settable at insert time, so a fix covering `UPDATE` alone leaves the hole open.
- Finding S7 overclaimed and was corrected on the record. A Content Security Policy does not
  turn B1 into a broken image unless it is the nonce form or the experimental SRI form. The
  `next.config.js` recipe most readers reach for sets `script-src 'self' 'unsafe-inline'`,
  which permits the exact inline handler the B1 payload uses.
- A fourteenth finding was added: `comments.hardened_at` is read by nothing, and the 60 minute
  window it exists for is unimplemented and carries a spec tension against the append-only rule.

Every check the repo runs before a merge is green on that diff. Typecheck clean, 25 tests
passing, the voice gate reporting zero hard hits. None of them reads a policy or a grant.

The known weakness, recorded because nothing on the checklist fixes it: ASVS 8.1.1 and 8.1.2
ask for documented field-level authorization rules and Dialecta has none. The row policies are
the only record of who may write what, and they are the artifact under review, so every row of
the checklist is this agent reconstructing intent from the code it is checking.

## Sprint of 2026-09-20

Six reading-list items worked, all filed, none dead; two new leads added (`pgrls`, the OWASP
ASVS Validation/Sanitization/Encoding chapter). Seven notes filed in `knowledge/`, one of them
(`2026-recovered-axis-mapping-comparison.md`) comparing `packages/core/src/axis-mapping.ts`
against `_recovered/api/_axis-mapping.js`, quarantined evidence recovered from a Vercel
deployment artifact. Result: blocker B3 is confirmed on all six axes, not closed, and sharpened
past a weight fix on two of them, since `axisDeltasFor` is missing the topic-history input Reach
needs and Consistency cannot accrue under any input as the function is currently shaped.

Mid-sprint, the coordinator asked this agent to cross-check its TipTap finding, a real advisory
(GHSA-cp6q-959q-f8rh) against `mergeAttributes()`, against `council/security/positions/nextjs-rebuild.md`
section 5 before handing anything to `builder`. They agree and do not overlap: security's
argument is that the editor island cannot be trusted because PostgREST is reachable directly;
this agent's is that even the server-side path security recommends instead, deriving `body_html`
from `body_json` via `generateHTML`, is not safe against a crafted `body_json` on its own. Folded
into one instruction in record 002's third correction. The same check surfaced a filename trap
security had already found (`middleware.ts` renamed `proxy.ts` in Next.js 16.0.0; `apps/web` is
on 15.5.25 and needs the old name), which this agent's own Next.js note had, until then, quoted
the wrong sample for. Corrected in the note and in checklist row 13b.

Checklist revised from seventeen rows to eighteen with a version-specific one, 13b, for Server
Action and Route Handler authorization. Six existing rows gained a tooling citation from a full
read of the Supabase linter's 30 rules; the sharpest result is negative, that no rule in the set
inspects a column-level grant, so `supabase db lint` clean would have caught neither B1 nor B2.
Row 9b closed from an open hardening question to a settled no, `FORCE ROW LEVEL SECURITY` cannot
help on Supabase because the owner role carries `BYPASSRLS` directly.

Items 2 and 3 of the `## Next three` list below are addressed: item 2 is filed as
`2026-nextjs-server-actions-authorization.md`; item 3's rule set is read in full and filed as
`2026-supabase-database-linter.md`, though the linter has still not been run against this repo,
which needs a local Supabase stack this worktree does not have. Item 1 is unchanged and still
open, sharpened rather than settled by today's malleability-window note.

## Next three

1. The two spec tensions on record 002, S6 and the fourteenth finding, are both unresolved and both belong with `spec-reader` or `decider`. This agent did not file them because an `advice` record blocks its poster and the reviewer was not blocked. Decide whether that reasoning holds, or whether a reviewer needs a non-blocking way to raise a spec conflict, and take it to `exchange/` either way. Two questions means two records. Sharpened 2026-09-20: `_recovered/api/_axis-mapping.js` shows the service-role reconciliation was previously shipped, which is evidence for whichever way this gets decided, not a decision.
2. ~~Server action and route handler authorization in Next.js App Router~~ Filed 2026-09-20 as `2026-nextjs-server-actions-authorization.md`. What remains: confirm no `middleware.ts` or `proxy.ts` exists yet in `apps/web` (reasoned from a directory listing at the time of writing, not re-checked every sprint), and re-verify the correct filename the day `apps/web`'s Next.js version changes.
3. Run `supabase db lint` once a local stack exists. The rule set is now read in full (`2026-supabase-database-linter.md`); running it against this repo's actual migrations is still not done and still needs a local Supabase stack this worktree does not have.
4. `pgrls` (Postgres RLS static analyzer and pytest plugin, found 2026-09-20) is worth trying alongside `supabase db lint` once that stack exists. It is the closest thing found so far to automated coverage for checklist rows 6 and 7, the two the linter itself does not reach.

## What this agent posts to the exchange

A `blindspot` when a diff passes every check and still looks wrong. That case is in the
five, and this agent is the one most likely to hit it.

Protocol in `exchange/README.md`. One record per question.

## Landed 2026-09-19

Five notes filed, `knowledge/review-checklist.md` written as thirteen named failure modes,
and PR 3 reviewed across three passes. Fourteen findings, three of them blockers. Two of the
three passes corrected the review rather than extending it, including retracting the claim
that a Content Security Policy would neuter the stored XSS.

## Done looks like

The RLS leads are filed with concrete failure examples. PR #3 has a real review on it.
Check 2 names specific holes rather than a category.
