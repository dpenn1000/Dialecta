# The open decision queue, and who cares most about each

**Source:** `docs/plans/backlog.md`, in this repo, read 2026-09-19. Cross-read with `docs/decisions/`, `council/README.md`, and root `CLAUDE.md`.

## Summary

Lead confirmed, and the count in two other places is wrong.

Six rows in the backlog end in `-D<n>`. One is Decided. Five are Open:

| Id | Phase | Decision | Blocks |
| --- | --- | --- | --- |
| P0-D2 | 0 | Login methods, and open or invite-only sign-up at cutover | P0-4, and through it A-1 and B-3 |
| A-D3 | A | Who may publish at launch, and whether articles get a pre-publish reflection | A-11, A-12 |
| A-D1 | A | Community re-review threshold, and whether community alone may outweigh the AI | A-8 |
| A-D2 | A | Pact wait timers: keep, change, or drop from copy | C0-2 |
| B-D1 | B | Retire or label the seeded personas and their article | B-5, C0-1 |

`team/decider/brief.md` says four are waiting and names P0-D2, A-D1, A-D2, A-D3. B-D1 is missing from that list. The reading list entry says "the phase B and C rows"; phase B has one row and phase C has none.

Only P0-D2 and A-D1 carry a spec or ADR in the Spec column. A-D2 and A-D1 have an empty Blocked by column and an empty Spec column both, so what governs them is not written down anywhere. Reading the rows against the items that name them is currently the only way to learn what they block, which is the gap this note closes.

One more question is live and has no backlog row at all. The council skill lists the monetization model as a standing question the council should take, citing the Project Brief. No ADR exists and no `-D` row exists, so it cannot be picked up by the normal flow.

Which advisor cares most, read from the charters in `council/README.md`:

| Id | Advisor with the strongest claim | Why |
| --- | --- | --- |
| P0-D2 | designer | Sign-up friction is the first surface a contributor meets. Treasurer has a real second claim on per-identity cost |
| A-D3 | philosopher | Who may speak is a thesis question before it is a product one |
| A-D1 | philosopher | It moves the locked 40/35/15/10 weighting, which is a founding commitment |
| A-D2 | designer | Wait timers are pacing, and pacing is retention. Philosopher has a claim on whether a timer is friction or theatre |
| B-D1 | philosopher | Seeded personas are fabricated contributors on a platform whose thesis is honest disagreement |
| Monetization | treasurer | Its charter names this exactly, and the Project Brief constrains it to not compromising editorial independence |

## Implies for Dialecta

- P0-D2 is first on merit, not only because the council skill lists it first. It is the only Open decision in Phase 0, it blocks P0-4, and P0-4 blocks A-1 and B-3. Nothing else Open blocks that much.
- A-D2 may not deserve a council run or an ADR. It is copy, it is reversible in an afternoon, and it fails the "difficult to reverse" test in `2026-microsoft-waf-adr-supersede.md`. Recommend it to Dan as a `voice-editor` item on C0-2 rather than a decision.
- B-D1 is a decision this agent should stop treating as absent. It was missing from the brief, so the brief is corrected in this sprint.
- Monetization needs a `-D` row before it can move. Proposing one is a backlog edit, and `docs/plans/` is inside `guard-docs.mjs`'s allowed list, so it is writable. It is still not this agent's file to change unprompted. Surface it to Dan.
- Every Open row except P0-D2 names a person or a behaviour rather than a mechanism, which is why they have sat. The frame is the work.

*Filed 2026-09-19*
