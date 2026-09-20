# Record format

One file per record. Front matter is the machine half and every field is required.
The body is the reading half, with fixed headings so an agent and a parser find the same thing.

Filename: `exchange/open/<YYYY-MM-DD>-<agent>-<nn>-<type>-<slug>.md`, and `id` matches it.
`nn` counts that agent's own records that day, starting at `01`. Moving a record to `closed/`
keeps the filename.

The agent name is in the id because a counter is not safe here. Nine agents worked in nine
worktrees on 2026-09-19, each read the ledger, each saw the next free number was 002, and five
of them used it. The filenames differed by slug so nothing collided on disk and the merge was
clean, but five records share an id. Those are left as they are. Everything from 2026-09-20
uses the agent form, which cannot collide however many agents run at once.

## Front matter

```yaml
---
id: 2026-09-20-builder-01
type: handoff          # handoff | blindspot | advice | vote
from: builder
to: [reviewer]         # agent names, or [group]
subject: One line, under 90 characters, no trailing period
backlog: A-1           # backlog id, or none
state: open            # open | answered | closed | abandoned
opened: 2026-09-19
closed:                # date, or blank while open
outcome:               # one line, written when closing
---
```

Keep `subject` specific enough to pick the record out of `ledger.md` without opening it.
"Composer island handed to review" beats "composer work".

## handoff

```markdown
## Done
Facts only. File paths, and the commit if there is one. What a reader can verify.

## Not done
What the brief asked for that is still open, and why. An empty section is a lie here;
write "nothing" only when it is true.

## Governing spec
docs/<file>.md, section "<heading>". One citation. If two specs govern and they disagree,
that is an advice record, not a handoff.

## Acceptance
The test, the command, and its result on the handing agent's machine.

## Traps
What was tried and failed, and what looks wrong but is deliberate. This is the section that
saves the next agent from rediscovering a dead end at full cost, or from reverting something
load bearing. One line each.

## Do not touch
Files another agent is holding, and files that look adjacent but belong to a different item.
```

## blindspot

```markdown
## What I am about to do
Two sentences. The approach, not the ticket.

## What I think the risks are
The ones already seen. Naming them stops answers that repeat them back.

## Specifically asking
The question. "Anything I am missing" gets nothing useful; "does the composer need its own
rate limit, or does the classification queue absorb that" gets an answer.
```

Answers append as `### <agent name>` blocks. An agent with nothing to add stays silent rather
than posting agreement.

## advice

```markdown
## Question
One question. Two questions are two records.

## What I already checked
Paths and what they said. This is what keeps the answer from being a pointer to something
already read.

## Why I am stuck
The specific fork, and what each branch would cost.
```

The named agent answers in a `### <agent name>` block and nobody else does.

## vote

```markdown
## Question
The decision, in one sentence, with what it blocks.

## Options
| Option | What it costs now | What it costs later | What it forecloses |

## Ballots
| Agent | Choice | Reason, one line |

## Tally
Counts, then the strongest case on each side in a sentence each. A tie is recorded as a tie.
```

`decider` writes the question, the options and the tally. Each named agent writes only its own
ballot row. Nothing here decides anything; Dan reads the tally and decides.

## Worked example

`EXAMPLE.md` in this folder is a filled handoff. It is an example and is not in `open/`,
so nothing is waiting on it.

## Ledger

Every record gets one appended line in `ledger.md`:

```
2026-09-20-builder-01 | handoff | builder -> reviewer | A-1 | open | Composer island, 12 char gate and nudge bar
```

Append on open, and rewrite that one line on close to carry the state and the outcome.
The ledger is the index; the record is the content. An agent reads the ledger first.
