# dependency-cruiser for boundaries, ast-grep for one Supabase rule

**Source:** GitHub REST API, `api.github.com/repos/<owner>/<repo>` and `.../releases/latest`,
fetched 2026-09-21 for `sverweij/dependency-cruiser` and `ast-grep/ast-grep`. Capability claims
verified against each project's own docs: dependency-cruiser's `README.md`, `doc/faq.md` and
`doc/options-reference.md` on the `main` branch, and ast-grep's guide at `ast-grep.github.io`
(`rule-config.html`, `rule-config/atomic-rule.html`, `introduction.html`, `reference/languages.html`).
All fetched 2026-09-21.

**Context:** lead 6 (`2026-duplicate-logic-tool-landscape.md`) judged `madge` too stale to answer
the cycle-detection question and left it open. This note answers it, and separately drafts the
missing-type-argument rule the brief for this sprint asked for, as two new leads. Neither tool is
on the reading list yet.

## Health first

| Tool | Stars | Last push | Archived | Open issues | Licence | Age | Latest release |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `sverweij/dependency-cruiser` | 7,202 | 2026-09-20 | No | 37 | MIT | 2016 | v18.4.0, 2026-09-20 |
| `ast-grep/ast-grep` | 15,977 | 2026-09-20 | No | 68 | MIT | 2022 | 0.45.3, 2026-08-31 |

Both pushed the day before this note. Both cut a release in the same window (one the same day,
one three weeks earlier). Against `madge`'s profile in the filed note (10,167 stars, no push
since 2026-01, 127 open issues), these are not close calls.

## dependency-cruiser's TypeScript, paths, and workspace support, verified

The README states it directly: "JavaScript. TypeScript. CoffeeScript. ES6, CommonJS, AMD," and
the FAQ adds "Support for .jsx, .tsx, .csx/.cjsx, .vue and .svelte." TypeScript support is native.

Path aliases go through a named option, `tsConfig`, documented in `doc/options-reference.md`:
"If dependency-cruiser encounters typescript, it compiles it to understand what it is looking at.
If you have `compilerOptions` in your `tsconfig.json` you think it should take into account, you
can use this option to make it do that... e.g. if you have `baseDir`/`paths` keys." It takes one
file: `{"tsConfig": {"fileName": "tsconfig.json"}}`, and the docs note it "understands the
`extends` configuration," so a workspace's tsconfig chain resolves the way `tsc` itself sees it.

Workspaces get a direct answer in the FAQ: "Absolutely. For every cruised module the closest
`package.json` file is used to determine if a package was declared as dependency." That is
resolution by proximity, not a special workspaces mode, and it is honest about its own edges: three
open issues (#565, #862, #935) are people asking how to get a *root*-level tsconfig path alias
picked up when cruising a yarn/npm monorepo from the repository root rather than per package. None
of that touches this repo. Dialecta's only path alias is `apps/web`'s `@/*`, which stays inside
`apps/web` and never crosses into `packages/core`; the core boundary itself resolves as an ordinary
npm workspace symlink (`@dialecta/core` -> `packages/core`, via `main`/`exports` in
`packages/core/package.json`), which is plain Node resolution and needs no tsconfig at all. The
rules below were written with that in mind: none of them require the `tsConfig` option to work
correctly on this repo.

### Rule types, verified against `doc/rules-reference.md`

Four sections: `forbidden` (a dependency that must not exist), `allowed` (the inverse: an allowlist,
anything not matching is flagged, checked via `allowedSeverity`), and `required` (a module of a
given shape must depend on something matching). Conditions relevant to this seat's mandate:

- `circular: true` on a `to` clause matches any dependency that closes a cycle. The shipped default
  rule is exactly this shape:
  ```json
  { "name": "no-circular", "severity": "warn", "from": {}, "to": { "circular": true } }
  ```
- `orphan: true` on a `from` clause matches a module with no incoming or outgoing internal edges,
  a file nobody requires and that requires nothing itself. Different question from what `knip`
  answers: knip finds an unused *export* from a file still wired into the graph; `orphan` finds a
  file that was never wired in at all.
- `reachable` on a `to` clause, paired with a `path` on `from`, answers "can module X get to module
  Y at all," which is the shape a `required` rule uses to enforce that something is wired up rather
  than merely absent of cycles.

### The three rules this repo needs

```json
{
  "forbidden": [
    {
      "name": "core-never-imports-web",
      "comment": "packages/core is the engine. It must never depend on the app that hosts it, in either direction of a cycle.",
      "severity": "error",
      "from": { "path": "^packages/core" },
      "to": { "path": "^apps/web" }
    },
    {
      "name": "no-circular",
      "comment": "dependency-cruiser's own shipped default, unmodified. packages/core has nine source files and a barrel, small enough that a cycle hides without symptoms.",
      "severity": "error",
      "from": {},
      "to": { "circular": true }
    },
    {
      "name": "web-through-core-entrypoint-only",
      "comment": "apps/web may depend on @dialecta/core's public barrel (packages/core/src/index.ts) only. A deep import that reaches past it is a definition (the barrel's export list) being bypassed by code, which is this seat's founding sentence at the module level.",
      "severity": "error",
      "from": { "path": "^apps/web" },
      "to": {
        "path": "^packages/core/src",
        "pathNot": "^packages/core/src/index\\.ts$"
      }
    }
  ]
}
```

The third rule is the one worth justifying. `packages/core/src/index.ts` is a 104-line barrel
(measured today, `wc -l`) that exists to be the package's one public contract. Nothing today
verifies that `apps/web` goes through it rather than importing
`@dialecta/core/src/classification` or a relative path across the workspace boundary; a grep
confirms no such deep import exists yet, but nothing stops the next one. `no-orphans` was the other
candidate for this slot and was set aside: it answers whether a file is wired in at all, a different
and less specific question than whether the package's declared boundary is being respected.

**This replaces `madge` for the cycle question.** Health explains part of why; capability explains
the rest. `madge` only ever drew the graph and flagged cycles; it had no rule-enforcement layer, so
`core-never-imports-web` and the barrel rule were never questions it could answer even when it was
healthy. dependency-cruiser is a strict superset of what `madge` offered this seat, at roughly nine
times the release cadence and none of the 127-issue backlog.

## ast-grep's missing-type-argument rule

Confirmed from the guide: a rule is `id` + `language` + `rule`, with atomic matchers `pattern`
(structural), `kind` (a tree-sitter node type) and `regex`; relational matchers `inside`, `has`,
`follows`, `precedes`; composites `all`, `any`, `not`. Language values for this repo are `ts` (or
`typescript`) and `tsx`, confirmed on `reference/languages.html`, both listed under "Web
Development" as `TS(X)`.

Four call sites in `apps/web/src/lib/supabase/` create a client with no `Database` type parameter,
so every query through them is unchecked and `supabase/types.ts` (1,595 lines, 50,414 bytes,
exporting `type Database` at line 15) is read by nothing under `apps/web/src`, confirmed by grep:

- `apps/web/src/lib/supabase/client.ts:15`, `createBrowserClient(url, anonKey)`
- `apps/web/src/lib/supabase/server.ts:21`, `createServerClient(url, anonKey, {...})`
- `apps/web/src/lib/supabase/middleware.ts:31`, `createServerClient(url, anonKey, {...})`
- `apps/web/src/lib/supabase/service.ts:34`, `createSupabaseClient(url, serviceRoleKey, {...})`
  (imported as `import { createClient as createSupabaseClient } from '@supabase/supabase-js'`,
  `service.ts:26`)

```yaml
id: supabase-client-missing-database-type
language: TypeScript
severity: warning
message: >-
  Supabase client created without <Database>. createServerClient, createBrowserClient and
  createClient (or an aliased import of it) must all carry the generated Database type argument
  from supabase/types.ts, or the query it returns is unchecked.
rule:
  all:
    - any:
        - pattern: createServerClient($$$ARGS)
        - pattern: createBrowserClient($$$ARGS)
        - pattern: createClient($$$ARGS)
        - pattern: createSupabaseClient($$$ARGS)
    - not:
        has:
          kind: type_arguments
```

`has` with no `stopBy` defaults to immediate children only. That is deliberate: `stopBy: end` would
search the whole subtree, including inside `$$$ARGS`, and a generic call nested in one of the
arguments would then satisfy `has: type_arguments` and hide the very call this rule exists to catch.

**How I would test this without running it here:** ast-grep is not installed and this sprint does
not permit installing it, so the check is deferred to the hosted Playground
(`ast-grep.github.io/playground`), which needs nothing local. Paste the four real call sites above
plus one hand-written positive control, `createServerClient<Database>(url, anonKey, {...})`, set
the language to TypeScript, and confirm the four match and the control does not. That also settles
the one thing I could not verify from the docs alone: whether ast-grep's pattern matcher treats a
call written without `<...>` as structurally distinct from the same call written with it, or
matches both indiscriminately. The docs did not say either way, and I would rather test it than
assert it.

**What would make it miss, and one of them is live today.** `service.ts:34` is the proof: the SDK's
own `createClient` is imported under a local alias, `createSupabaseClient`, and the rule only
matches by literal callee name, so I added that alias as a fourth explicit pattern. That fixes the
one alias this repo has today and nothing else; a new alias introduced next month would silently
pass. A cheaper, longer-lived fix is a second rule that flags any
`import { createClient as $ALIAS } from '@supabase/supabase-js'` or the `@supabase/ssr` equivalents
regardless of what `$ALIAS` is named, which catches the pattern instead of enumerating instances of
it. Wrapper functions are the other named risk and are dormant rather than live: nothing in this
repo currently calls one of these three functions through an indirection (a variable holding the
function reference, a re-exported helper with a different name), so the rule's blind spot there is
theoretical today. Either miss is the same shape as the CodeQL-versus-Semgrep tradeoff security's
own note draws: a syntactic matcher finds the shape of a call, not what a value resolves to.

**ast-grep against Semgrep, for this seat.** Security's note (`2026-semgrep-static-analysis.md`)
picks Semgrep for a different vocabulary: an unauthenticated write, a missing auth check, the kind
of finding a community registry pack already half-covers. This rule is the opposite shape, three
named functions from two named packages, checked for one specific missing argument, so a registry
pack would never contain it either way. The real question is which one this seat can adopt without
waiting on or colliding with security's own rollout, which today runs nothing pre-commit and has
not yet added `semgrep ci`. ast-grep needs
none of that scaffolding to start (`ast-grep scan` on a single YAML rule, no server, no registry),
so this seat does not need to wait for security's Semgrep timeline to enforce a rule that is its
own, and does not need to ask security's ruleset to carry a finding that has nothing to do with
authorization.

## Verdicts

**Adopt `dependency-cruiser`.** Pushed the day before this note, released the day before this note,
37 open issues against 7,202 stars, MIT, ten years old and still cutting releases at that pace.
It answers lead 6's open cycle question and adds a boundary-enforcement capability `madge` never
had.

**Adopt `ast-grep` for this one rule.** 15,977 stars, pushed the day before this note, released
three weeks earlier, MIT, and a YAML rule format simple enough that this note could draft a working
rule from its docs alone. The four-call-site, one-live-miss finding above is the kind of result this
seat exists to produce; the tool just has to be usable enough to write the rule in, which it is.

## What I did not do

I did not install or run either tool. `dependency-cruiser apps/web/src packages/core/src` against
the drafted rules and the ast-grep Playground check are both next-sprint work, and reporting a
violation count now, before either has run against this tree, would be the exact failure this
seat exists to catch.

## Implies for

Practice: judge a dependency on last push, open issues, licence and age before its description, and
verify a capability claim (paths, workspaces, a pattern matcher's generic-call handling) against the
tool's own docs rather than carry it in from memory. New leads: run both tools against this tree and
file the actual counts; check whether ast-grep's relational rules (`has` plus a bound metavariable)
can link an aliased import to its call site in one rule, which this note could not settle from the
docs alone.

*Filed 2026-09-21*
