# The council protocol this agent chairs

**Source:** `.claude/skills/dialecta-council/SKILL.md`, in this repo, read 2026-09-19. Cross-read with `council/README.md`, `council/log/README.md`, and `.claude/agents/decider.md`.

## Summary

Lead confirmed, with two defects in the source worth recording.

Six steps. The lead session frames the question in one sentence plus the constraints already locked, and saves it to `council/log/YYYY-MM-DD-<slug>.md` with a `## Question` section. The three advisors write positions in parallel, never talking to each other, each reading its own `charter.md` and `positions.md` first. They rebut in parallel, under 300 words, engaging the strongest opposing point and conceding what the evidence forces. The chair synthesizes. Dan decides. Each advisor then updates `positions.md`, including "lost this one, because".

The chair's constraint is the part that matters for this agent. `.claude/agents/decider.md` puts it plainly: as chair it has no mandate of its own. It names convergence, names where the disagreement is real, turns the argument into options, and says so when an advisor is wrong on the evidence. One extra rebuttal round is allowed when two advisors are talking past each other. Never more than one. The limit is in both the skill and the mandate, so it is deliberate.

Cost is stated: roughly six Sonnet calls, two Opus calls, and a few web fetches per run. A spec gap with one obvious answer goes to `decider` alone, not to the council.

Two defects in the file.

First, it states that "the `council-guard` hook enforces" the advisor folder rules. No such hook exists. `.claude/settings.json` registers three: `guard-docs.mjs`, `voice-check.mjs`, `handoff-note.mjs`. `guard-docs.mjs` blocks edits to `docs/` outside four allowed subtrees and blocks `council/*/charter.md`. It does not stop an advisor writing into another advisor's folder, into `apps/`, or into `packages/`. Root `CLAUDE.md` already records this under known drift.

Second, it cites the monetization question as "Project Brief, open question 8". It is number 7. Questions 1 to 7 are listed at `docs/Dialecta_Project_Brief.md:225` and there is no 8.

## Implies for Dialecta

- The chair writes the frame before any advisor runs. P0-D2 gets its `## Question` file first, and that file is what the three advisors are handed. Running advisors before the frame exists inverts the protocol.
- The one-extra-round cap is a chair decision that has to be made on evidence of talking past each other, not on dissatisfaction with the answer. Worth holding as a practice, because the temptation at synthesis time is another round.
- The standing questions list in the skill names P0-D2 first. That ordering matches the backlog, where P0-D2 is the only Open decision in Phase 0 and it blocks P0-4.
- The missing hook is the honest subject for the first exchange `vote`, because it is small, real, and has exactly two answers.
- Both defects are in a file this agent may not edit. The mandate restricts it to `docs/decisions/` and `council/log/`, and the training thread adds `team/decider/` and `exchange/`. Report them; do not fix them.

*Filed 2026-09-19*
