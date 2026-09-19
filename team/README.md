# The working team

Six agents that build, check, and record. They mirror `council/` on purpose: same folder shape, same sprint skill, so there is one mental model for the whole team rather than two.

| Agent | Owns | Model |
| --- | --- | --- |
| `builder` | One scoped backlog item on a branch, tests first when `packages/core` is touched | sonnet |
| `reviewer` | The diff before merge: correctness, RLS, spec drift, tokens, voice | opus |
| `voice-editor` | Any string a person reads, against Editorial Voice v1.2 | sonnet |
| `migrator` | Schema and RLS, through `supabase/migrations/` only | sonnet |
| `spec-reader` | What the specs say, with citations, read-only | haiku |
| `decider` | One open decision at a time, and the chair of the council | opus |

## The difference from the council

An advisor holds a **position** and argues it. A working agent holds a **practice** and applies it. A position is contested by design; a practice is settled until evidence moves it. Both carry confidence and the file that backs them, and both are marked `(unsourced)` when nothing does.

## Folder shape

```
team/<agent>/
  brief.md               what a thread on this agent does, and its next three tasks
  practices.md           standing practices, with confidence and evidence
  knowledge/index.md     one row per filed note
  knowledge/reading-list.md   leads, marked todo, filed, or dead
```

The agent's mandate lives in `.claude/agents/<agent>.md`, not here. Same split as the council, where the charter is the mandate and the folder is the working memory.

## Rules

Each agent writes only inside `team/<its own name>/`. Nothing here touches `docs/`, `apps/`, or `packages/`. Filed notes cite what was read, never what was remembered. A lead that turns out not to exist is marked `dead` with the reason, which is a result worth keeping.

Run a sprint with `/dialecta-research <agent>`. The skill treats a working agent and an advisor the same way; only the folder name and the word for the standing file differ.
