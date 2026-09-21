// architect: module boundary rules for apps/web, dependency-cruiser 18.4.0.
// Why the rules exist: team/architect/knowledge/2026-module-boundaries-and-structural-rules.md
//
// Run from INSIDE apps/web, with TypeScript installed beside dependency-cruiser (see README.md):
//   cd apps/web
//   <toolbox>/node_modules/.bin/depcruise --config ../../team/architect/tools/dependency-cruiser.web.cjs src
//
// Why per workspace: from the repository root, dependency-cruiser either rejected
// apps/web/tsconfig.json outright (TS18003, "No inputs were found") or left every @/ alias
// unresolved (60 of 125 dependencies on 2026-09-21) while still reporting "no violations".
// From inside apps/web the aliases resolve. A clean result from the root run meant nothing.

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'web-through-core-entrypoint-only',
      comment:
        "apps/web reaches @dialecta/core through its barrel only. A deep import bypasses the package's declared contract.",
      severity: 'error',
      from: { path: '^src/' },
      to: {
        path: '(^|/)packages/core/src/',
        pathNot: '(^|/)packages/core/src/index\\.ts$',
      },
    },
    {
      name: 'no-circular',
      comment: "dependency-cruiser's shipped default, unmodified.",
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-unresolvable',
      comment:
        'An import the tool cannot resolve is a hole in every other rule. Fail loudly instead of reporting a clean graph.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '(^|/)(\\.next|node_modules)/' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default', 'types'],
      mainFields: ['module', 'main', 'types', 'typings'],
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css'],
    },
  },
};
