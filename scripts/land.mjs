#!/usr/bin/env node
// Land an agent session's work on main, from its own worktree, without a human merge.
//
// Usage:  node scripts/land.mjs [--agent <name>] [--message "..."] [--dry-run]
//
// Why this exists: on 2026-09-19 nine agents worked in nine worktrees and none of them
// landed. Every branch had to be merged by hand afterwards. The work was additive and in
// disjoint folders, so there was nothing to resolve; it just had no path home.
//
// The path: rebase onto origin/main, run the gates, then fast-forward push straight to
// main. No merge commit and no PR, because an agent writes only inside its own folder.
// Anything outside that set stops the run and prints a PR command instead.
//
// Two agents landing at once is expected. The push retries after a fresh rebase.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, dflt = null) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? dflt : (args[i + 1] ?? true);
};
const DRY = args.includes('--dry-run');

// trimEnd, never trim: `status --porcelain` puts a meaningful space in column 1,
// and a full trim eats it off the first line and shifts every path by one.
const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trimEnd();
const tryGit = (...a) => {
  try {
    return { ok: true, out: git(...a) };
  } catch (e) {
    return { ok: false, out: `${e.stdout ?? ''}${e.stderr ?? ''}`.trim() };
  }
};
const say = (m) => process.stdout.write(`${m}\n`);
const die = (m) => {
  process.stderr.write(`land: ${m}\n`);
  process.exit(1);
};

// ── Which agent ────────────────────────────────────────────────────────────────
let agent = flag('agent');
if (!agent) {
  const touched = tryGit('diff', '--name-only', 'origin/main...HEAD').out.split('\n');
  const owned = new Set(
    touched.map((p) => p.match(/^(?:team|council)\/([a-z-]+)\//)?.[1]).filter(Boolean),
  );
  if (owned.size === 1) agent = [...owned][0];
}
if (!agent) die('cannot tell which agent this is. Pass --agent <name>.');

const home = existsSync(`team/${agent}`)
  ? `team/${agent}`
  : existsSync(`council/${agent}`)
    ? `council/${agent}`
    : null;
if (!home) die(`no folder for agent "${agent}". Expected team/${agent}/ or council/${agent}/.`);

// Paths an agent may land without review. Everything else needs a human.
const allowed = [
  new RegExp(`^${home}/`),
  /^exchange\//,
  /^council\/log\//,
  /^docs\/handoffs\/current\.md$/,
  /^docs\/handoffs\/dialecta-handoff-[0-9a-z-]+\.md$/,
];
const permitted = (p) => allowed.some((r) => r.test(p));

// `git status --porcelain` gives "XY path", and "XY old -> new" for a rename.
const statusPath = (line) => line.slice(3).replace(/^"|"$/g, '').split(' -> ').pop();

say(`agent:  ${agent}`);
say(`home:   ${home}`);

// ── Commit anything outstanding, inside the fence only ─────────────────────────
const dirty = tryGit('status', '--porcelain').out.split('\n').filter(Boolean);
if (dirty.length) {
  const paths = dirty.map(statusPath);
  const stray = paths.filter((p) => !permitted(p));
  if (stray.length) die(`uncommitted files outside ${home}:\n  ${stray.join('\n  ')}`);
  if (DRY) {
    say(`would commit ${paths.length} file(s)`);
  } else {
    git('add', '--', ...paths);
    git('commit', '-q', '-m', String(flag('message') || `${agent}: land working changes`));
    say(`commit: ${paths.length} file(s)`);
  }
}

// ── Nothing to land is a success, not an error ─────────────────────────────────
git('fetch', '-q', 'origin');
const ahead = Number(tryGit('rev-list', '--count', 'origin/main..HEAD').out.trim() || '0');
if (!ahead) {
  say('nothing to land; already on origin/main');
  process.exit(0);
}

// ── The fence, across every commit this branch adds ────────────────────────────
const changed = git('diff', '--name-only', 'origin/main...HEAD').split('\n').filter(Boolean);
const outside = changed.filter((p) => !permitted(p));
if (outside.length) {
  say('');
  say(`This branch touches ${outside.length} file(s) outside ${home}:`);
  outside.forEach((p) => say(`  ${p}`));
  say('');
  say('That needs a human. Push the branch and open a PR instead:');
  say('  git push -u origin HEAD');
  say('  gh pr create --fill');
  process.exit(2);
}
say(`files:  ${changed.length} in ${ahead} commit(s), all inside the fence`);

// ── Gates ──────────────────────────────────────────────────────────────────────
const gate = (label, cmd, cmdArgs) => {
  try {
    execFileSync(cmd, cmdArgs, { stdio: 'pipe', shell: process.platform === 'win32' });
    say(`gate:   ${label} ok`);
  } catch (e) {
    process.stderr.write(`${e.stdout ?? ''}${e.stderr ?? ''}\n`);
    die(`${label} failed. Fix it, then run land again.`);
  }
};

if (!DRY) {
  gate('typecheck', 'npm', ['run', '--silent', 'typecheck']);
  gate('tests', 'npm', ['test', '--silent']);

  const ignored = new Set(
    existsSync('.voiceignore')
      ? readFileSync('.voiceignore', 'utf8')
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith('#'))
      : [],
  );
  const prose = changed.filter(
    (p) =>
      (/\.mdx?$/.test(p) || p === 'apps/web/src/strings.ts') && !ignored.has(p) && existsSync(p),
  );
  if (prose.length) {
    let ran = false;
    for (const py of ['python', 'python3', 'py']) {
      try {
        execFileSync(py, ['scripts/voice_check.py', '--strict', ...prose], { stdio: 'pipe' });
        say(`gate:   voice ok (${prose.length} file(s))`);
        ran = true;
        break;
      } catch (e) {
        if (e.code === 'ENOENT') continue;
        process.stderr.write(`${e.stdout ?? ''}\n`);
        die('voice gate failed. Fix the hard rules, then run land again.');
      }
    }
    if (!ran) say('gate:   voice skipped, no python on PATH');
  }
}

// ── Rebase and fast-forward push, retrying against a moving main ───────────────
if (DRY) {
  say('');
  say('dry run: would rebase onto origin/main and push HEAD:main');
  process.exit(0);
}

for (let attempt = 1; attempt <= 5; attempt++) {
  git('fetch', '-q', 'origin');
  const rb = tryGit('rebase', 'origin/main');
  if (!rb.ok) {
    tryGit('rebase', '--abort');
    die(
      'rebase onto origin/main hit a conflict, which means another agent touched your files.\n' +
        `Resolve by hand in this worktree, then run land again.\n${rb.out}`,
    );
  }
  const landing = Number(tryGit('rev-list', '--count', 'origin/main..HEAD').out.trim() || '0');
  if (tryGit('push', 'origin', 'HEAD:main').ok) {
    say('');
    say(`landed: ${landing} commit(s) on main, head ${git('rev-parse', '--short', 'HEAD').trim()}`);
    process.exit(0);
  }
  say(`push rejected (attempt ${attempt}); main moved, rebasing again`);
}
die('could not land after 5 attempts. Run it again, or land by hand.');
