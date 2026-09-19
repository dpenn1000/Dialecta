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

All three of the previous next three are done, on 2026-09-19.

Twelve practices, ten of them now backed by a filed note or by a finding rather than by the
mandate alone. Six files in `knowledge/`: five sprint notes and the review checklist.

The sprint took all five seeded leads and filed all five. None turned out dead. One needed a
correction: the OWASP chapter is `V8 Authorization` in ASVS 5.0.0, not `V4 Access Control`,
which was its name in 4.0. One was filed on half its claim, the Next.js environment variable
half; the server action authorization half was not read and is carried as its own `todo`.
Seven new leads added, so the list grew from five to seven open.

PR 3 has a real review on it: `exchange/open/2026-09-19-002-handoff-pr-3-review.md`, thirteen
findings, three of them blockers. The two that matter are a stored XSS at
`apps/web/src/app/articles/[slug]/page.tsx:43` and row level update policies that let a
contributor set their own `final_tier` and `status`. Both are the same underlying gap, which
is that Postgres RLS cannot restrict columns. Neither would have been found by the check 2
paragraph as written; both came from rows 3 and 11 of the new checklist.

The corrected shape of that PR, for anyone reading the old line here: four commits and 235
files, not three and 199. The fourth is `116dc60`, the voice gate.

Every check the repo runs before a merge is green on that diff. Typecheck clean, 25 tests
passing, the voice gate reporting zero hard hits. None of them reads a policy.

## Next three

1. Confirm the load bearing assumption under blocker B2: that Supabase grants `authenticated` insert and update on every new table in the `public` schema by default, so RLS is the only gate. It is reasoned, not read. It is the first `todo` on the reading list and the severity of a blocker rests on it.
2. Read OWASP ASVS 5.0.0 chapter V8 end to end at levels 1 to 3 and turn the level 1 requirements into rows on `knowledge/review-checklist.md`. The checklist's own "Rows this agent has not yet earned" section names four gaps: multi-tenant reads, rate limiting and model cost, storage policies beyond public read, and realtime authorization.
3. Take the column-level privileges lead, `GRANT UPDATE (column)`, and write the fix this agent would recommend for `comments` and `articles` as a worked example in the note. The review named the hole twice without being able to name the remedy precisely, which is the gap to close before `migrator` picks up record 002.

## What this agent posts to the exchange

A `blindspot` when a diff passes every check and still looks wrong. That case is in the
five, and this agent is the one most likely to hit it.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The RLS leads are filed with concrete failure examples. PR #3 has a real review on it.
Check 2 names specific holes rather than a category.
