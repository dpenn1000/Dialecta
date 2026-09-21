# A tsconfig.base.json for the eight keys that already agree

**Source:** the three checked-in tsconfig files in this repository, read directly, 2026-09-21.
`tsconfig/bases` via the GitHub REST API and `raw.githubusercontent.com`, plus the npm registry for
`@tsconfig/strictest`, fetched 2026-09-21. TypeScript's own handbook, "Project References,"
`typescriptlang.org`. Next.js's TypeScript config page (serving v16.3.5, `lastUpdated: 2026-08-25`)
and, because that mismatches this repo's pinned 15.5.25, the actual
`writeConfigurationDefaults.ts` source at the `v15.5.25` tag and at `canary`, both fetched
2026-09-21. typescript-eslint's docs and its generated `configs/flat/strict-type-checked.ts`
source. **Lead state:** filed, lead 11.

## The three files, key by key

Method: every `compilerOptions` key present in either `apps/web/tsconfig.json` or
`packages/core/tsconfig.json`, read directly rather than summarized, 19 keys in the union.
`packages/core/tsconfig.build.json` only adds four keys on top via its own `extends`
(`noEmit: false`, `declaration: true`, `rootDir`, `outDir`) and is covered separately below rather
than folded into the table, since nothing in `apps/web` has an equivalent second config.

| Option | `apps/web` | `packages/core` | Same? |
| --- | --- | --- | --- |
| `strict` | `true` | `true` | Same |
| `noUncheckedIndexedAccess` | `true` | `true` | Same |
| `exactOptionalPropertyTypes` | `true` | `true` | Same |
| `isolatedModules` | `true` | `true` | Same |
| `skipLibCheck` | `true` | `true` | Same |
| `noEmit` | `true` | `true` | Same |
| `module` | `esnext` | `ESNext` | Same value, cased differently |
| `moduleResolution` | `bundler` | `Bundler` | Same value, cased differently |
| `target` | `ES2017` | `ES2022` | Different |
| `lib` | `["dom", "dom.iterable", "esnext"]` | `["ES2022"]` | Different |
| `allowJs` | `true` | absent | Different |
| `esModuleInterop` | `true` | absent | Different |
| `resolveJsonModule` | `true` | absent | Different |
| `verbatimModuleSyntax` | absent | `true` | Different |
| `jsx` | `preserve` | absent (no JSX in this package) | Different |
| `incremental` | `true` | absent | Different |
| `plugins` | `[{ "name": "next" }]` | absent | Different |
| `paths` | `{ "@/*": ["./src/*"] }` | absent | Different |
| `types` | absent | `[]` | Different |

Eight of nineteen already agree byte for byte. Neither file has a root to `extend`; both were
written from scratch, which is exactly how `module` and `moduleResolution` ended up matching in
value but not in case, the smallest possible sign of two files drifting independently rather than
by decision.

## `tsconfig/bases`, `@tsconfig/strictest`, and `@tsconfig/next`

The repo: 7,879 stars, pushed 2026-08-14, not archived, 54 open issues, MIT, created 2020-05-13.
It has no repository-level GitHub Releases (`/releases/latest` returns 404); it is a monorepo
publishing many independently versioned `@tsconfig/*` packages, so npm is the right place to check
a release date. `@tsconfig/strictest` is at `2.0.8`, published 2025-11-13, about ten months old as
of this note. The README states bases deploy on every push that changes one ("Every morning there
is a GitHub Action which deploys any changed bases"), which reads as "TypeScript has not added a
new strictness flag worth a bump" rather than neglect, though this note cannot confirm which from
the outside.

`@tsconfig/strictest`'s actual JSON, fetched rather than assumed:

```json
{
  "compilerOptions": {
    "strict": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    "exactOptionalPropertyTypes": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

Six of its fourteen flags are already on in both Dialecta workspaces. The other eight
(`allowUnusedLabels: false`, `allowUnreachableCode: false`, `noFallthroughCasesInSwitch`,
`noImplicitOverride`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`,
`noUnusedParameters`) are not evaluated here; adopting them would be a separate proposal, scoped and
costed on its own.

A `@tsconfig/next` base exists too, matching the recommended defaults `create-next-app` writes:
`allowJs`, `strict`, `jsx: preserve`, `plugins: [{ name: 'next' }]`, the same `include` array
`apps/web/tsconfig.json` already carries. It suits a fresh app. This one is already configured
stricter than that base and would override half of it on the first extend.

## TypeScript project references, and why not yet

From the handbook: `composite` plus `references` lets `tsc -b` find referenced projects, check
whether they are up to date, and rebuild only what changed, which is the fix for "there's no
built-in up-to-date checking, so you end up always running `tsc` twice." Editors gain cross-project
"go to definition" through `declarationMap`. The cost: every referenced project must set
`declaration: true`, must list every implementation file in `include` or `files`, and `tsc -b`
"effectively acts as if `noEmitOnError` is enabled for all projects," so a broken dependency blocks
the whole build rather than failing only where the error lives.

That benefit does not apply to how this repo already wires the two workspaces together.
`packages/core/package.json` sets `"main": "./src/index.ts"` and `"types": "./src/index.ts"`, so
`apps/web` resolves `@dialecta/core` straight to core's TypeScript **source**. Next.js's own
bundler typechecks and compiles that source directly; `dist/index.js` never enters the build. Project
references exist to make a prebuilt `.d.ts` boundary fast and incremental; this repo has no such
boundary today; `packages/core/tsconfig.build.json` producing `dist/` matters only if something
someday consumes the published package instead of the workspace source. Adding `composite` and
`references` now would add the `declaration`/`include` discipline and the fail-together build
without a consumer that benefits from either. Verdict: no, not yet. Revisit if `apps/web` ever stops
importing core's source directly, which is the one condition that would make the tradeoff worth
paying for.

## What Next.js requires, verified against the version this repo runs

The current docs (`nextjs.org/docs/app/api-reference/config/typescript`) serve `16.3.5`. This
repo pins `15.5.25` (`apps/web/package.json:19`). Rather than trust the docs' version banner, I
read `writeConfigurationDefaults.ts` at both the `v15.5.25` tag and `canary`, the file that
enforces or suggests every value.

**Two categories, not one.** `target`, `lib`, `allowJs`, `skipLibCheck`, `strict`, `noEmit`,
`incremental` are `suggested`: written only when the key is absent from the fully resolved config.
`module`, `moduleResolution`, `esModuleInterop`, `resolveJsonModule`, `isolatedModules`, and `jsx`
are `required`: checked against the resolved value on every run and overwritten on a mismatch,
regardless of where that value came from.

**`jsx` is the one that changed, and it is the clearest version-specific fact in this note.** At
`v15.5.25`:

```
jsx: { parsedValue: ts.JsxEmit.Preserve, value: 'preserve', reason: 'next.js implements its own optimized jsx transform' }
```

At `canary`:

```
jsx: { parsedValue: jsxEmitReactJSX, value: 'react-jsx', reason: 'next.js uses the React automatic runtime' }
```

`apps/web/tsconfig.json` currently has `"jsx": "preserve"`, matching 15.5.25 exactly. A future
upgrade past whatever version ships this canary change flips the required value entirely, not just
its spelling. `jsx` cannot live in a shared base for that reason alone: it is Next's to require, and
Next's answer already changed once.

**A shared base is extends-aware, confirmed by the source rather than assumed.** The same file reads
`tsOptions` from `getTypeScriptConfiguration()`, and its own comment describes that call as
resolving "all extends and include paths (ex: `tsconfig.json`, `tsconfig.base.json`, etc.)" before
any check runs. A value set only in a base that `apps/web/tsconfig.json` extends is seen exactly as
if it were local, so a required key hoisted to the base still satisfies Next's check, so long as
its value keeps matching what Next requires. That "so long as" is the actual risk: if Next's
required value for a hoisted key ever changes and Next decides to write a fix, it always writes into
`tsConfigPath` (`apps/web`'s own file), never into whatever it extends. A future auto-write would
land locally and silently shadow the base from then on, for exactly the six required keys, and
`jsx` is proof this is not hypothetical. `module`, `moduleResolution` carry the same version-branch
risk (their required value depends on the installed TypeScript's semver). `esModuleInterop`,
`resolveJsonModule`, `isolatedModules` do not: every version of this file hardcodes them to a plain
`true`, so hoisting those three cannot produce a silent local override later, only the day-one
question of whether the value is already right, which it is in `apps/web` today.

**`plugins` cannot be hoisted at all, and the source says so explicitly:** "If the TS config extends
on another config, we can't add the `plugin` field because that will override the parent config's
plugins. Instead we have to show a message to the user to add the plugin manually." Putting
`plugins: [{ name: 'next' }]` in a base that `apps/web` extends does not just fail to help, it
removes Next's own ability to notice the plugin is missing and say so.

## typescript-eslint's `strict-type-checked`, and the rule this repo doesn't need yet but will

`strict-type-checked` "contains all of `recommended`, `recommended-type-checked`, and `strict`,
along with additional strict rules that require type information," confirmed against the generated
`configs/flat/strict-type-checked.ts` (not a doc summary: the actual rule list). That same file
confirms `@typescript-eslint/switch-exhaustiveness-check` is **not** in it, and it is not in `strict`
or any type-checked preset; it is opt-in only.

The rule needs `languageOptions.parserOptions.project` (typed linting) and, confirmed from its own
docs, applies to "union types or enums," not `enum` alone, which matters here because
`packages/core/src/classification.ts` restates three Postgres enums as plain string-literal unions,
never TypeScript's `enum` keyword: `Emotion` (line 19), `ArticleEngagement` (line 20),
`OpposingViewEngagement` (line 38). No file under `packages/core/src` has a `switch` over any of the
three today, confirmed by grep, so the rule has nothing to flag yet. Its value is the day a fourth
value is added to one of these unions and a switch written against it does not get updated to
match: with the rule on, that is a compile-time error; without it, a silent fallthrough, which is
this seat's founding sentence at the type layer. One configuration detail matters more than turning
the rule on: its default, confirmed from the docs, is `considerDefaultExhaustiveForUnions: false`,
meaning a stray `default:` clause does **not** count as covering an unhandled member. Leave that
default alone. Setting it to `true` would let a catch-all `default` silently absorb a forgotten
fourth value, which defeats the one thing this rule is being adopted for.

## Recommendation

Ship `tsconfig.base.json` at the repo root with the eight keys already identical in both
workspaces, all of them either already `suggested`-only in Next's eyes or a plain boolean Next
hardcodes to `true` in every version checked:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

`apps/web/tsconfig.json` extends it and keeps `target`, `lib`, `allowJs`, `module`,
`moduleResolution`, `jsx`, `incremental`, `plugins`, `paths`, `include`, `exclude` local: everything
Next.js actively manages by version or that only means something inside `apps/web` (`paths`, the
Next plugin, the App Router `include` list). `packages/core/tsconfig.json` extends the same base
and keeps `target`, `module`, `moduleResolution`, `lib`, `verbatimModuleSyntax`, `types: []`,
`include` local: its own Node-22 target, its stricter ESM-only posture, and the empty `types` array
that keeps ambient `@types` packages out of a library that should assume nothing about its runtime.
`packages/core/tsconfig.build.json` is untouched; it already extends `packages/core/tsconfig.json`
and is the existing, working precedent for "a deliberate local override on top of a shared file,"
the same pattern this proposal asks the rest of the repo to adopt one level up.

**Cost:** eight of nineteen keys move, all eight already identical in both files today, so the
resolved compiler options for both workspaces are unchanged the moment this ships. This note did
not run a probe build to prove that (creating a config file, even a scratch one, was out of scope
for this sprint); the claim rests on the eight values being byte-identical in the two checked-in
files already, which is a read, not a measurement that needed a compiler. Nothing else moves:
`module` and `moduleResolution` stay local despite matching today, on purpose, because their
required value is version-branched and Next's fix-on-mismatch always writes to the local file, never
the base; a future TypeScript upgrade should show up as a local, reviewable diff in one workspace,
not a silent divergence from a base nobody meant to leave behind.

## Implies for

Practice: a value that is `required` by an external tool (Next.js, here) belongs in the workspace
that tool manages, never in a shared base, even on the day its value happens to match its sibling.
Practice: when a doc site's version doesn't match the pinned dependency, read the pinned version's
own source rather than the docs, and diff it against the version the docs describe rather than
assume they still agree. Related: `2026-typescript-strict-family.md`, which measured that turning
on two of these eight flags in `apps/web` cost zero errors; this note is what makes that already-paid
cost permanent instead of re-discoverable per file.

*Filed 2026-09-21*
