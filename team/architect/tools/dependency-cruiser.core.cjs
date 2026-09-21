// architect: module boundary rules for packages/core, dependency-cruiser 18.4.0.
// Why the rules exist: team/architect/knowledge/2026-module-boundaries-and-structural-rules.md
//
// Run from INSIDE packages/core, with TypeScript installed beside dependency-cruiser:
//   cd packages/core
//   <toolbox>/node_modules/.bin/depcruise --config ../../team/architect/tools/dependency-cruiser.core.cjs src

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'core-never-imports-web',
      comment: 'packages/core is the engine. It must never depend on the app that hosts it.',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '(^|/)apps/web/' },
    },
    {
      name: 'core-stays-pure',
      comment:
        'The engine takes no framework or database client. Anything under node_modules that is not a dev tool is a coupling to review.',
      severity: 'warn',
      from: { path: '^src/' },
      to: { path: 'node_modules/(next|react|react-dom|@supabase)/' },
    },
    {
      name: 'no-circular',
      comment: "dependency-cruiser's shipped default, unmodified. Nine source files and a barrel is where a cycle hides.",
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-unresolvable',
      comment: 'An import the tool cannot resolve is a hole in every other rule.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
};
