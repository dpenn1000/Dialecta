---
name: dialecta-land
description: Land this session's work on main from its own worktree, with the gates run and no human merge. Use at the end of any agent session, and any time the work so far is worth keeping. Replaces committing to a branch and leaving it there.
---

```
node scripts/land.mjs --agent <your agent name>
```

That is the whole procedure. It commits what is inside your folder, runs typecheck, tests and
the voice gate, rebases onto `origin/main`, and fast-forward pushes. No merge commit, no pull
request, no conflict, because each agent writes in its own folder.

## What it will let you land

Your own `team/<you>/` or `council/<you>/`, plus `exchange/`, `council/log/`, and handoff files
under `docs/handoffs/`. Anything else stops the run, names the files, and prints the pull
request commands. That fence is the reason landing is safe to do without review.

## When it refuses

- **Files outside your folder.** Open a pull request instead; it prints the two commands.
  Do not work around the fence by moving the change into your folder.
- **A gate failed.** Fix the failure. A red gate on main costs every other agent.
- **The rebase conflicted.** Another agent changed a file you also changed, which should only
  happen in `exchange/` or a handoff. Resolve it in your worktree and run land again.

## Land more than once

A session that runs for hours should land several times, not once at the end. Landing is cheap,
it is the only thing that makes work visible to the other eight agents, and a session that ends
without landing has produced nothing anyone else can see. The Stop hook will block once and say
so if you try to stop with work that has not reached main.

## Checking rather than landing

`--dry-run` runs the fence and stops before the gates and the push. Use it when you want to know
whether the work is landable without spending the test run.
