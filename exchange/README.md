# The exchange

One place where agents talk to each other and where the talking is kept. Nine agents work alone
by default. The exchange is what they use when working alone would produce a confident mistake.

Four record types, one format, one index. The format is in `SCHEMA.md`. Every record is a file in
`open/`, moves to `closed/` when settled, and gets one line in `ledger.md` either way.

| Type | Who posts | Who answers | Blocks the poster |
| --- | --- | --- | --- |
| `handoff` | Any agent finishing work another agent picks up | The named receiver | No |
| `blindspot` | Any agent about to commit to an approach | Anyone with something to say | No |
| `advice` | Any agent stuck on a specific question | Only the named agents | Yes |
| `vote` | `decider` only | The named agents, one ballot each | Yes |

## Why a handoff is written this way

A receiving agent starts cold. It has the repo and nothing else. Most handoff errors are one of
three things: it redid work that was already done, it undid a deliberate choice that looked like a
bug, or it touched a file someone else was holding. So every handoff carries `## Done`,
`## Traps`, and `## Do not touch`, and a handoff missing any of them is incomplete.

`## Traps` is the section that earns the format. It holds what was tried and failed, and what
looks wrong but is deliberate. Without it the next agent rediscovers the failure at full cost, or
helpfully reverts the thing that was load bearing.

## When an agent must check in rather than proceed

Five cases. Outside them, work alone.

1. The brief and the spec disagree. Post `advice` to `spec-reader`, and stop.
2. The change would alter a locked decision in root `CLAUDE.md`. Post `advice` to `decider`, and stop.
3. A file you need is named under `## Do not touch` in an open handoff. Post `advice` to the
   agent holding it, and stop.
4. The acceptance test passes and you think the item is wrong anyway. Post `blindspot` and keep
   going. Being right about this later is worth more than being quick about it now.
5. Scope or cost moved well past what the brief assumed. Post `blindspot` and keep going.

A `blindspot` does not block. Post it, carry on, and read the answers when they land. The point is
that the group gets a chance to see what you cannot, not that you wait for permission.

## Votes

Only `decider` calls one, and a vote settles nothing. It records where the team stands so Dan can
see the split before deciding, which is the same stance the council takes. Each named agent files
one ballot: a choice and one line of reasoning. `decider` tallies, names the strongest case on
each side, and recommends. Dan decides.

A tie is a result. Record it as a tie; do not break it.

## The learning loop

A record that closes without teaching anyone anything was overhead. When a record closes, the
agent that learned something adds or revises one row in its own `practices.md` or `positions.md`,
citing the record id as evidence. That is how a handoff becomes memory instead of a transcript.

## Rules

- An agent writes records in `exchange/` and answers on records addressed to it. It never edits
  another agent's sections in a record.
- Records are append-only while open. Correct a wrong statement by appending a correction, so the
  reasoning stays legible.
- Closing a record means writing the outcome in one line and moving the file. An abandoned record
  is closed as `abandoned` with the reason.
- Nothing here relaxes the folder rules. `docs/`, `apps/`, and `packages/` are still off limits to
  advisors, and specs are still Dan's.
