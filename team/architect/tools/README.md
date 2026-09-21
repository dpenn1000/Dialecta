# architect: tools

The seat's instruments for code. Each is pinned, runs through `npx` or a scratch toolbox folder,
and adds nothing to any `package.json`: adopting one into CI or a workspace is `builder`'s change,
not this seat's. The database instruments are in `../checks/`.

Calibrated 2026-09-21 against tracked files on local `main`, with a known-answer control wherever
a clean result could mean the tool saw nothing. **Three of the first runs reported clean and were
wrong.** The numbers below are the ones that survived a second method.

## The five

| Tool | Version, licence | Catches | Cannot catch |
| --- | --- | --- | --- |
| dependency-cruiser | 18.4.0, MIT | Import cycles; `packages/core` importing `apps/web`; `apps/web` reaching past the core barrel; any import it cannot resolve | Anything below the module level |
| ast-grep | 0.45.3, MIT | Code shapes by syntax tree. One rule today: a Supabase client created without `<Database>` | What a value resolves to at runtime; calls through a wrapper function |
| knip | 6.37.0, ISC | Unused files, exports, types and dependencies across the workspaces | Code that is used and wrong |
| jscpd | 5.3.0, MIT | Copy and paste, including near-miss clones with `--similarity` | The same knowledge written two different ways. This repository's real duplication is that kind |
| squawk | 2.65.0, Apache-2.0 or MIT | Lock and safety hazards in migration SQL | Whether a migration fits the live database. It never reads the catalog |

## How to run each

From the repository root unless the row says otherwise. `<toolbox>` is any folder holding
`dependency-cruiser@18.4.0` and `typescript@5.9.3` installed side by side (`npm i` both there).
Pass tracked files (`git ls-files`) so another session's uncommitted work is not measured.

| Tool | Command |
| --- | --- |
| dependency-cruiser, web | `cd apps/web` then `<toolbox>/node_modules/.bin/depcruise --config ../../team/architect/tools/dependency-cruiser.web.cjs $(git ls-files src \| grep -E '\.(ts\|tsx)$')` |
| dependency-cruiser, core | `cd packages/core` then the same with `dependency-cruiser.core.cjs` and `\.ts$` |
| ast-grep | `npx -p @ast-grep/cli@0.45.3 ast-grep scan --config team/architect/tools/sgconfig.yml $(git ls-files 'apps/web/src/**' \| grep -E '\.ts$')` |
| knip | `npx knip@6.37.0 --config team/architect/tools/knip.json --reporter json --no-exit-code`, then keep only tracked paths |
| jscpd | `npx jscpd@5.3.0 --min-tokens 50 --reporters console $(git ls-files 'apps/web/src/**' 'packages/core/src/**' \| grep -E '\.(ts\|tsx)$')` |
| squawk | `npx squawk-cli@2.65.0 --pg-version=17.6 --reporter gcc $(git ls-files 'supabase/migrations/*.sql' \| grep -v _archived)` |

## Baseline, 2026-09-21

| Tool | Result | Method note |
| --- | --- | --- |
| dependency-cruiser | 0 violations. `apps/web`: 67 modules, 125 dependencies. `packages/core`: 9 modules, 14 dependencies | Trustworthy only because `no-unresolvable` is an error: any import it cannot follow now fails the run |
| ast-grep | 4 sites: `apps/web/src/lib/supabase/client.ts:15`, `middleware.ts:31`, `server.ts:21`, `service.ts:34` | Control `controls/supabase-client.ts` flags lines 6 and 7 and nothing else |
| knip | 1 unused file (`apps/web/src/lib/supabase/client.ts`), 1 unused dependency (root `@supabase/supabase-js`), 1 unused devDependency (`eslint-config-next`), 16 unused exports, 7 unused types | Filtered to tracked files |
| jscpd | 1 clone, 8 lines, 0.10% of 8,001 lines in 55 files, inside `stages-publish.tsx` | Tracked `.ts` and `.tsx` in both workspaces |
| squawk | 168 issues; 143 in the unapplied baseline, 25 across four applied migrations | `prefer-robust-stmts`, `require-concurrent-index-creation` and the two timeout rules lead |

## Three false cleans, and what now prevents each

1. **dependency-cruiser without TypeScript.** Run through `npx -p dependency-cruiser -p typescript`,
   it still found no compiler, printed "no dependency violations found", and warned below the verdict
   that it had likely missed TypeScript sources. `npm exec` appears to skip installing a package the
   project already has, where the tool cannot see it. Fix: the toolbox folder, and `depcruise --info`
   before trusting a run.
2. **dependency-cruiser from the root.** With TypeScript visible it resolved none of `apps/web`'s
   `@/` aliases (60 of 125 dependencies unresolved) and still reported no violations. `apps/web`
   declares `paths` without `baseUrl`, which TypeScript accepts. Fix: run per workspace, and the
   `no-unresolvable` rule, so an unresolved import is a failure and not a silent gap.
3. **ast-grep by name.** The first rule flagged 14 sites; 10 were calls to the app's own wrapper,
   also named `createClient`. Fix: bind the callee to an import from `@supabase/*` in the same
   file. The rebuilt rule also catches aliased imports, which removed a second rule.

The lesson is the same all three times, and it is the seat's founding sentence applied to its own
tools: **a tool's verdict is a claim, and its coverage is the evidence.**
