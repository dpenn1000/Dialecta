---
name: dialecta-council
description: Convene the advisor council (treasurer, designer, philosopher) on a decision so they argue it with each other before Dan decides. Use for any -D backlog row, any "should we", or any feature that touches money, retention, or what the platform asks of a person.
---

The council is three advisors with fixed mandates who disagree on purpose, chaired by `decider`. Run it whenever a decision would benefit from being argued by people who want different things. The lead session runs the protocol; the advisors never talk to each other directly, they read each other's written positions.

## Protocol

1. **Frame.** The lead writes the question in one sentence plus the constraints already locked (root `CLAUDE.md`, the ADRs). Save it as `council/log/YYYY-MM-DD-<slug>.md` with a `## Question` section.
2. **Positions, in parallel.** Launch `treasurer`, `designer`, and `philosopher` at the same time with the same prompt: the question, the constraints, and "write your position to `council/<you>/positions/<slug>.md` and return it." Each reads its own `charter.md` and `positions.md` first.
3. **Rebuttals, in parallel.** Launch all three again: "read the other two positions at these paths; write a rebuttal under 300 words engaging the strongest opposing point; concede anything the evidence forces; return it." Append rebuttals to the log.
4. **Chair.** Launch `decider` with the log: it synthesizes the options with their costs (now, later, foreclosed), notes where the advisors converged and where the disagreement is real, and recommends one option with the reason that carried it. It may run one more rebuttal round if two advisors are talking past each other, never more.
5. **Dan decides.** In the session, or in Cowork. `decider` writes the ADR (`/dialecta-decide` template), links the log, marks the backlog row Decided.
6. **Positions update.** Each advisor updates its `positions.md` to reflect the outcome, including "lost this one, because".

Cost: one council run is roughly six Sonnet calls, two Opus calls, and a few web fetches. Use it for decisions that deserve it; a builder's spec gap that has one obvious answer goes to `decider` alone.

## Files

```
council/
  log/                       one file per debate, the full record
  treasurer/  designer/  philosopher/
    charter.md               mandate, what they fight for, what they would veto
    positions.md             standing positions table: position, confidence, evidence, last changed
    positions/<slug>.md      per-debate positions and rebuttals
    research/                one file per source: citation, summary, what it implies here
    research/index.md        the list, kept by the advisor
```

Advisors write only inside their own folder and `council/log/`; the `council-guard` hook enforces it. They never touch `docs/`, `apps/`, or `packages/`.

## Standing questions the council should take first

- P0-D2: login methods and open vs. invite-only sign-up.
- A-D3: who may publish at launch; whether articles get a pre-publish reflection.
- A-D1: community re-review threshold; whether community alone may outweigh the AI.
- The monetization model itself (Project Brief, open question 8). No ADR exists.
