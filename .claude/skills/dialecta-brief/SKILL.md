---
name: dialecta-brief
description: The template the lead session uses to brief a builder on one backlog item. Use when delegating implementation work to the builder agent.
---

A brief is one screen. If it needs more, the item is too big; split it in `docs/plans/backlog.md` first.

```
## Item: <backlog id and title>

**Spec:** docs/<file>.md, section "<heading>" (ask spec-reader if unsure)
**Branch:** feat/<short-name>   (worktree: ../Dialecta-<short-name>)
**Files you may touch:** <explicit list or globs>
**Out of scope:** <the adjacent thing you will be tempted to do>

**Acceptance test:**
- <one observable behavior, phrased so it can fail>
- <the test file or command that proves it>

**Constraints:**
- packages/core: test first, no I/O
- apps/web: server component unless it is one of the five islands
- strings in src/strings.ts, voice v1.2
- tokens only, no hex

**Report back:** file list, test result, spec surprises, what you left out.
```

Sizing rule: one PR, one session, one reviewer pass. Two builders in parallel only when their file lists don't intersect. Never brief a builder to edit `docs/`; spec changes are Dan's, in a Cowork session.
