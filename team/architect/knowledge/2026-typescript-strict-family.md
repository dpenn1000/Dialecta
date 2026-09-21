# The strict family, and the two flags apps/web is missing for free

**Source:** TypeScript, "TSConfig Reference", https://www.typescriptlang.org/tsconfig/, fetched
2026-09-20. Measured against this repository the same day.

**Lead state:** filed, lead 5, **and the lead's premise is wrong**. It says
`noUncheckedIndexedAccess` is "already on in this repository". It is on in `packages/core` and off
in `apps/web`, which is the destination for every ported component. The reading list is corrected.

## What strict does and does not include

`strict` turns on nine flags: `alwaysStrict`, `strictNullChecks`, `strictBindCallApply`,
`strictBuiltinIteratorReturn`, `strictFunctionTypes`, `strictPropertyInitialization`,
`noImplicitAny`, `noImplicitThis`, `useUnknownInCatchVariables`.

It does **not** include `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` or
`verbatimModuleSyntax`. Each is a separate option, documented as outside the strict family, and each
has to be named.

- `noUncheckedIndexedAccess` adds `undefined` to any access through an index signature, so
  `arr[0]` and `record[key]` become `T | undefined` and have to be narrowed. This is the flag that
  catches the off-by-one and the missing-key read.
- `exactOptionalPropertyTypes` stops `undefined` being assigned to an optional property unless the
  type says so, which is what makes `{ a?: string }` mean absent rather than present-and-undefined.
- `verbatimModuleSyntax` keeps import elision from silently dropping a side-effecting import.

## The drift, read from the files

There is no root `tsconfig.json` and no `extends` between the two workspaces. Each declares its
compiler options from scratch, so they are free to diverge and they have.

| Option | `packages/core/tsconfig.json` | `apps/web/tsconfig.json` |
| --- | --- | --- |
| `strict` | true | true |
| `noUncheckedIndexedAccess` | **true** | absent |
| `exactOptionalPropertyTypes` | **true** | absent |
| `verbatimModuleSyntax` | **true** | absent |
| `allowJs` | absent | **true** |
| `target` | ES2022 | ES2017 |

The stricter workspace is the 1,332-line library behind 95 tests. The looser one is the application
that the port is about to pour code into. That is the wrong way round.

## What it costs to close, measured

Method, stated so it can be re-run or contradicted. I did not edit any repo file. I wrote a probe
tsconfig into the session scratchpad that `extends` `C:/Dialecta/apps/web/tsconfig.json` by absolute
path and adds only `noUncheckedIndexedAccess: true` and `exactOptionalPropertyTypes: true`.
TypeScript resolves `include` and `paths` relative to the file they originated in, so the probe
inherits `apps/web`'s file set unchanged. Then `npx tsc --noEmit -p <probe>` from `apps/web`.

Control: `npx tsc --noEmit -p tsconfig.json` in `apps/web` exits 0 today.

Probe: exits 0. Zero errors.

Sanity check that the probe was not typechecking an empty set:
`npx tsc --noEmit --listFiles -p <probe> | grep -c "apps/web/src"` returns 28.

**Turning both flags on in `apps/web` costs nothing today, across 28 source files.**

## What this implies for Dialecta

- **This is a two-line edit to `apps/web/tsconfig.json` with a measured cost of zero**, and it is
  the cheapest finding in this sprint by a wide margin. It only gets more expensive: every file the
  port adds is another file that has to be fixed rather than merely checked.
- **The absence of a shared base config is the actual defect**, and the two missing flags are its
  first symptom. Two configs written independently will keep diverging on `target`, on `lib`, and on
  anything else nobody is comparing. A root `tsconfig.base.json` that both workspaces extend makes
  the next divergence a deliberate override rather than an accident.
- **`allowJs: true` in `apps/web` is worth a separate look.** It is a Next.js scaffold default. If
  the workspace has no `.js` sources it buys nothing and widens what typechecks.

## Implies for

Practice: "a compiler or lint setting that is on in one workspace is on in all of them, or the
difference is written down." Practice: "measure the cost of a standards change before proposing it;
a probe config and `tsc --noEmit` turn an opinion into a number." No backlog id; this is a
pre-port action and belongs before the port, not after.

*Filed 2026-09-20*
