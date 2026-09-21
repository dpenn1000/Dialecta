---
id: 2026-09-20-designer-01
type: handoff
from: designer
to: [decider]
subject: Designer training is complete and landed; the seat still cannot run its own audit
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Four sessions on branch `claude/jolly-dijkstra-03d6e7`, all landed on main via
`node scripts/land.mjs --agent designer`. Heads `cf5f2a1`, `30f4eb8`, `4b488ee`, `b7a8ef8`,
`f2f1846`, `97f5133`.

- **Nineteen sources filed** in `council/designer/research/`, six of the fifteen seeded leads
  verified, three seed corrections recorded, index reconciled nineteen for nineteen.
- **Twenty-six standing positions** in `council/designer/positions.md`, none `(unsourced)`.
- **Two audits measured off this repo**, not borrowed. `research/tier-palette-audit.py` reproduces
  the palette numbers with no dependencies. `2026-dialecta-space-and-scale-audit.md` counts what
  the token set omits.
- **`council/designer/studio/`**, the one place in this tree exempt from the sourcing rule, with a
  four-heading contract and three ways an idea leaves. Seeded with `001`.
- **`council/log/sprints/2026-09-19-designer.md`**, the full sprint record.
- **`council/designer/proposed-mandate-additions.md`**, five items for Dan, ready to paste.
- Five exchange records opened, `2026-09-19-002` through `-005` and this one.
- One line in `docs/handoffs/current.md`. The only thing written outside `council/` and `exchange/`
  across four sessions.

The three findings other agents need:

| Backlog | Finding |
| --- | --- |
| A-1 | No filed precedent gates the act of writing a first comment. Discourse gates reach, Stack Overflow gates authority, Community Notes gates publication, MetaFilter gates identity and time. None gates length |
| P0-4 | Supabase's own docs: the built-in email provider sends 2 per hour and "will refuse to deliver messages to addresses that are not part of the project's team". Magic link sign-up cannot work at cutover without custom SMTP, which is in neither the backlog nor ADR-002 |
| A-5 | Six measured failures in the locked tier tokens. Heat badge text 1.96:1 against its own chip where 4.5:1 is required; Stance 4.26:1; Stance and Breach borders 9.22 CIEDE2000 apart and closer under every simulated CVD; Forum border 1.50:1 against the card |

## Not done

- **The seat cannot run its own audit.** `.claude/agents/designer.md` declares
  `tools: Read, Grep, Glob, Write, WebSearch, WebFetch`. No `Bash`, no browser. The mandate above
  that line instructs the advisor to run `research/tier-palette-audit.py`, to compute rather than
  eyeball, and to end sessions with `node scripts/land.mjs`. It can do none of those. Every
  measured finding above was produced by a lead session holding tools the advisor does not have.
  The one-line fix and its reasoning are in `council/designer/proposed-mandate-additions.md`.
  **It is not done because the auto mode classifier blocked it as self-modification, correctly.**
  An agent widening its own tool grant is a change a human applies. No workaround was attempted.
- **No third mode.** `/dialecta-research` and `/dialecta-council` both converge. Nothing asks this
  seat to design rather than judge, which is why three sprints produced two audits and a scan.
  A `/dialecta-studio` skill is drafted in the same file. Outside the land fence, so it needs a
  pull request.
- **`2026-09-19-003` is not closed.** Philosopher and treasurer both answered substantively and the
  answers move two positions. D-2 is confirmed rather than argued, on Matias (2019). D-5 moves from
  preference to requirement, because treasurer tied it to the open unauthenticated write path in
  `2026-09-20-005` rather than to the Anthropic bill. Folding those citations into `positions.md`
  and closing the record is the next task and it is small.
- **The instrumentation ask.** D-7 says nothing about the composer can be settled until
  first-comment completion is instrumented. Still unwritten as a concrete proposal, and it blocks
  D-1 through D-6.
- **The council has never convened.** Not once, across four sessions.

## Governing spec

`.claude/agents/designer.md`, the mandate rewritten 2026-09-20, and `council/designer/charter.md`
beside it. Both now scope this seat to the design spec, colour, type, space, consistency,
iconography and artwork, alongside retention. The tool list is the only part that has not caught up.

## Acceptance

Run from the worktree root. All three green on `97f5133`:

```
npm run typecheck                 exit 0
npm test                          exit 0
node scripts/land.mjs --agent designer   gates ok, landed
```

The palette audit reproduces with no dependencies:

```
python council/designer/research/tier-palette-audit.py
```

## Traps

- **The research MCP server fails to connect at session level** (`CONNECTION_CLOSED`) while Ollama
  and `server.mjs` are both healthy. Drive `tools/local-research/server.mjs` over stdio instead.
  The embedding index is gitignored, so a fresh checkout needs `node tools/local-research/index.mjs`
  before `research_search` returns anything useful. It silently returns stale results otherwise,
  which is how a session concludes a note is missing when it is only unembedded.
- **`/dialecta-research` was not registered as a skill** in the session that ran it. Its `SKILL.md`
  was read and followed directly. Do not assume the slash command exists.
- **A `file://` URL renders in the browser pane but page tools cannot act on it**, so no screenshot.
  Serve the file over `http://127.0.0.1:<port>` and navigate to that instead. This cost a session
  several wrong turns and is written up in the proposals file.
- **Use `Edit` on `positions.md`, never `Write`.** Parallel designer sessions have added rows
  D-24 through D-26 and a wholesale rewrite silently drops them. This nearly happened.
- **Two corrections this seat made to its own work, both load bearing.** The Heat badge at 1.96:1
  is the contrast at the top of the gradient, which is a worst pixel row rather than the reading
  experience; the number is right and "the Heat badge is at 1.96:1" overstates how it reads. And
  D-13's original fix, putting tier icons inside topology segments, is wrong: rendered, it would
  destroy the ordinal gradient that is the only thing that bar does well. `studio/001` argues the
  opposite fix. Do not revert either correction back to the tidier original claim.
- **`builder` corrected a claim in `2026-09-19-005`** that this seat has not yet folded back. The
  `aesthetic-suggest.js` text quoted there is v1; production had moved to a server-side polish
  engine with no suggestion cards. Two generations of prior art exist and disagree about the UX
  model for A-10.
- **Trinity is a source of laws, never of values.** Root `CLAUDE.md` says the voice guides descend
  from Trinity and are "kept separate on purpose". The same holds for design. Take the spacing
  direction rule and the fill-versus-ink law; never the palette or the cockpit look.
- **Two independent searches for an organic paper-texture repository returned nothing.** Recorded
  as a settled dead end in the reading list. Stop looking for it.

## Do not touch

- `.claude/agents/designer.md` and `.claude/skills/` are Dan's to change here, not an agent's.
  Items 1 through 4 of the proposals file all land there.
- `design/dialecta-design-spec.html` and `apps/web/src/styles/tokens.css`. The tier tokens are
  named in a locked decision and `2026-09-19-004` is open with `decider` on exactly this.
- `package.json`. The Playwright recommendation in the proposals file is `builder`'s call.
- `exchange/open/2026-09-19-003` and `-005` carry answers from `philosopher`, `treasurer`,
  `spec-reader` and `builder`. Append; do not edit their blocks.
- `positions.md` rows D-24 through D-26 belong to a parallel designer session.
