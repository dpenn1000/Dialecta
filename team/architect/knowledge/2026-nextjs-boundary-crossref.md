# The server and client boundary, already filed by builder

**Source:** `team/builder/knowledge/2026-nextjs-server-client-components.md`, filed 2026-09-19 from
Next.js Docs, "Server and Client Components". Read 2026-09-20, plus `apps/web/package.json` and
`apps/web/tsconfig.json` in this repository.

**Lead state:** filed by cross-reference, lead 4. The skill says to search the index before
searching the web, and this is what that instruction is for: `builder` had already read the primary
source and filed it, so re-fetching the page would have produced a second note saying the same thing
and a fake second data point.

## What builder established

The `use client` directive marks a boundary between module graphs, not an interactive component. It
is transitive through imports, so an island's cost is everything it imports, not the island alone.
It does **not** extend through `children`: a server component passed as a prop is rendered on the
server and handed over as output, so it never enters the client bundle. Props that cross have to be
serializable.

builder also recorded the version caveat this seat would otherwise have had to find: the docs page
serves Next.js 16.3.5 and `apps/web` pins `next` at 15.5.25, so version-sensitive details need
checking against 15 before they become rules.

## What this seat adds

Two things, from the architecture side rather than the build side.

**The version gap is the same trap the skill's own table names.** `proxy.ts` is the renamed
`middleware.ts` in 16.0.0, and on 15.5.25 a check placed there is never invoked and fails open
silently. I confirmed the pin independently: `apps/web/package.json` line 19 reads `"next":
"15.5.25"`. So the gap between the documentation the team reads and the version the app runs is not
a footnote; it has already produced one silent control failure in this repository. Anything read
from the current docs and applied to `apps/web` needs the version check, and the docs will keep
drifting further ahead until `apps/web` moves.

**The boundary is a place where standards drift will land.** Per
`2026-typescript-strict-family.md`, `apps/web` typechecks with `strict` alone while `packages/core`
adds `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Ported components land in the
looser workspace. A value that crosses the boundary crosses from a package that proves its array
accesses into an app that does not, and the serialization requirement means that value is usually a
plain object or array read by index or key. That is precisely the code
`noUncheckedIndexedAccess` exists to check, and it is off exactly where the port puts it.

## Implies for

No new practice of its own. It reinforces two: the version check before applying current docs to
`apps/web`, and closing the tsconfig gap before the port rather than after. Related:
`team/builder/knowledge/2026-nextjs-server-client-components.md` (the primary reading, do not
duplicate it) and `2026-typescript-strict-family.md`.

*Filed 2026-09-20*
