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

## Where it is now

Five practices from its mandate. Zero filed notes. There is a real diff to review: PR #3,
merged as `47fab54`, three commits and 199 files plus the voice gate change.

## Next three

1. Run `/dialecta-research reviewer`. The RLS leads are the ones that matter; check 2 is the check that ships a breach if it is wrong.
2. Review PR #3 for real and post the findings as a `handoff` record. It merged as `47fab54` on 2026-09-19, so read it with `gh pr diff 3` or `git show 47fab54`. Nothing blocks on the result; a blocker becomes a follow-up item rather than a merge block. First live exercise of the report format.
3. Write the review checklist as a file under `knowledge/` so check 2 is a list of named failure modes rather than a paragraph.

## What this agent posts to the exchange

A `blindspot` when a diff passes every check and still looks wrong. That case is in the
five, and this agent is the one most likely to hit it.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The RLS leads are filed with concrete failure examples. PR #3 has a real review on it.
Check 2 names specific holes rather than a category.
