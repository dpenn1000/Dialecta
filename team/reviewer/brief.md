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

Two sprints on 2026-09-19. Six next-three tasks set and all six done.

Seventeen practices, fifteen backed by a filed note or by a finding rather than by the mandate
alone. Eight files in `knowledge/`: seven sprint notes and the review checklist, which now runs
to sixteen rows and puts the grant layer before the policy layer.

Eight leads filed, none dead. Two needed correction rather than killing. The OWASP chapter is
`V8 Authorization` in ASVS 5.0.0, not `V4 Access Control`, which was its name in 4.0. The
Next.js lead bundled two claims and was filed on the half that was read, with the other half
carried back as its own row. Eight leads open, so the list has grown as fast as it has shrunk.

PR 3 has a real review on it: `exchange/open/2026-09-19-002-handoff-pr-3-review.md`, thirteen
findings, three blockers, plus an appended correction. The two that matter are a stored XSS at
`apps/web/src/app/articles/[slug]/page.tsx:43` and row level update policies that let a
contributor set their own `final_tier` and `status`. Both are the same underlying gap: Postgres
RLS cannot restrict columns, which OWASP calls BOPLA and puts at 8.2.3, a separate requirement
at a separate level from the object-level one the policies do satisfy.

The corrected shape of that PR, for anyone reading the old line here: four commits and 235
files, not three and 199. The fourth is `116dc60`, the voice gate.

Three things the second sprint changed about the review rather than adding to it. The grants
assumption under B2 was flagged as reasoned and is now read and confirmed, and it does not
expire, because Supabase's retirement of the default grants on 2026-10-30 reaches future
objects only. B2 now has a worked remedy, which it did not before. And a fourth reachable path
was found while writing that remedy: every column named in B2 is also settable at insert time,
so a fix covering `UPDATE` alone leaves the hole open.

Every check the repo runs before a merge is green on that diff. Typecheck clean, 25 tests
passing, the voice gate reporting zero hard hits. None of them reads a policy or a grant.

The known weakness, recorded because nothing on the checklist fixes it: ASVS 8.1.1 and 8.1.2
ask for documented field-level authorization rules and Dialecta has none. The row policies are
the only record of who may write what, and they are the artifact under review, so every row of
the checklist is this agent reconstructing intent from the code it is checking.

## Next three

1. Close the two citation gaps both database notes lean on. The Postgres `ddl-rowsecurity` page for whether RLS and the privilege system are genuinely independent checks, which is currently sourced from Supabase rather than from the primary text, and PostgREST's behavior when a role lacks a column privilege, since Supabase has a troubleshooting page on `42501` that suggests the failure is not always legible. A remedy that turns a breach into a confusing 500 is half a remedy.
2. Take the sanitizer and CSP leads together and write the remedy for blocker B1, which is the one blocker still named without a fix. Needs to answer where sanitizing belongs, at write time in the editor, at read time in the page, or both, and what a Next.js `headers()` policy costs. That closes row 15 of the checklist, which is `(unsourced)` today.
3. Take the malleability window lead. Universal rule 6 of `docs/Dialecta_Axis_Mapping_v1.md` requires deleting prior `axis_events` on re-classification, which sits against the append-only mandate; `comments.hardened_at` exists for that window and nothing in the code reads it. Check 2 cannot rule on any edit path until this is settled, and the tension may be an `advice` record rather than a note.

## What this agent posts to the exchange

A `blindspot` when a diff passes every check and still looks wrong. That case is in the
five, and this agent is the one most likely to hit it.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The RLS leads are filed with concrete failure examples. PR #3 has a real review on it.
Check 2 names specific holes rather than a category.
