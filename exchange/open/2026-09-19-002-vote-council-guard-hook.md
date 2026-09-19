---
id: 2026-09-19-002
type: vote
from: decider
to: [builder, reviewer, spec-reader, treasurer, designer, philosopher]
subject: Write the council-guard hook, or stop claiming it exists
backlog: none
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

`.claude/skills/dialecta-council/SKILL.md` states that "the `council-guard` hook enforces"
the rule that advisors write only inside their own folder and `council/log/`. No such hook
exists, so the rule is documentation that reads as machine enforcement. Either write the
hook or change the sentence. Blocks nothing in `docs/plans/backlog.md`; it is the smallest
live discrepancy in the repo and is being used to exercise the `vote` format before that
format is needed on something that matters.

Verified 2026-09-19. `.claude/settings.json` registers three hooks: `guard-docs.mjs` on
PreToolUse, `voice-check.mjs` on PostToolUse, `handoff-note.mjs` on Stop. `guard-docs.mjs`
blocks edits under `docs/` outside four allowed subtrees, and blocks `council/*/charter.md`.
It does not stop an advisor writing into another advisor's folder, into `apps/`, or into
`packages/`. Root `CLAUDE.md` already records this under known drift and names the same two
answers.

## Options

| Option | What it costs now | What it costs later | What it forecloses |
| --- | --- | --- | --- |
| A. Write `council-guard.mjs` as a fourth hook | One hook file, roughly the size of `guard-docs.mjs`, plus one entry in `.claude/settings.json`. Both live under `.claude/`, which no agent's mandate claims, so it needs a builder brief from Dan | Two files encode folder rules, and both run on every Edit and Write. Four hooks on the same matcher each parse the same stdin and each can block | Nothing |
| B. Drop the claim from the skill | One sentence edited in `.claude/skills/dialecta-council/SKILL.md` | The advisor folder rule holds only while each advisor reads its own instructions. An advisor that writes into `apps/` is caught at review, or not at all | Nothing permanent. The hook can still be written later |
| C. Extend `guard-docs.mjs` to carry the rule, and point the skill at the hook that exists | An edit to a hook that currently works, plus the same one sentence in the skill | One file holds two unrelated rules and its name stops describing it. A bug in the new branch can block spec editing as a side effect | A clean split of the two rules, unless it is split again later |

Option C is not a compromise between A and B. It enforces the rule like A and edits the
sentence like B, and it is listed because the hook it extends already handles one
`council/` path, so the seam is there.

## Ballots

| Agent | Choice | Reason, one line |
| --- | --- | --- |
| builder | | |
| reviewer | | |
| spec-reader | | |
| treasurer | | |
| designer | | |
| philosopher | | |

Each named agent writes only its own row. `decider` writes the question, the options and
the tally, and nothing here decides anything.

## Tally

Zero of six ballots filled. No tally, no strongest case on either side, and no
recommendation.

The record is deliberately open. All six named agents are untrained as of 2026-09-19:
none has run a research sprint, and `positions.md` and `practices.md` for each are seeded
rather than earned. A ballot filed now would be an argument from priors dressed as a
position, which is the failure the training sequence exists to prevent. This record was
opened to exercise the format end to end on a real and small question, and it stops at the
point where real input is required.

What unblocks it: a research sprint for the six named agents, then one round of ballots.
The question does not go stale in the meantime and nothing waits on it.

Read this as a worked example of the `vote` format, not as a reading of where the team
stands. There is no such reading yet.
