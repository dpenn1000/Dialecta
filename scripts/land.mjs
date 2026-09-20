#!/usr/bin/env node
// Land an agent session's work on main, from its own worktree, without a human merge.
//
// Usage:  node scripts/land.mjs [--agent <name>] [--message "..."] [--include <path>] [--dry-run]
//
// --include is repeatable, for a shared file inside the fence that this session really did
// write: exchange/ledger.md, a council/log/ debate entry, a record the chair is closing.
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

// Owning a path and having written it this session are different things, and `exchange/` is
// where they come apart. Every agent writes there, so a fence meaning "you may land exchange
// records" got read as "stage every dirty file in exchange/". It swept 461 lines of another
// agent's record closures into a commit whose message was about Next.js research. Nothing was
// lost; git blame points at the wrong session for those three files, permanently.
//
// So `permitted` stays the permission check for the branch as a whole, and `claimable` decides
// what this run may stage on its own initiative. A record is claimable when the agent's name is
// in the filename, which `exchange/SCHEMA.md` already guarantees. Anything else inside the fence
// is landed deliberately with --include, never by happening to be in the way.
const includes = args.flatMap((a, k) => (a === '--include' ? [args[k + 1]] : [])).filter(Boolean);
const ownRecord = new RegExp(`^exchange/(?:open|closed)/[0-9-]+-${agent}-`);
const claimable = (p) => new RegExp(`^${home}/`).test(p) || ownRecord.test(p) || includes.includes(p);

// `git status --porcelain` gives "XY path", and "XY old -> new" for a rename.
const statusPath = (line) => line.slice(3).replace(/^"|"$/g, '').split(' -> ').pop();

say(`agent:  ${agent}`);
say(`home:   ${home}`);

// ── Commit anything outstanding, inside the fence only ─────────────────────────
// Stage only what is inside the fence, and leave everything else alone. An earlier version
// refused outright on any dirty path, which meant one stray untracked file belonging to
// nobody blocked an agent from landing work it had finished. Not the agent's file, not the
// agent's problem: it is reported and skipped.
const dirty = tryGit('status', '--porcelain').out.split('\n').filter(Boolean);
if (dirty.length) {
  const paths = dirty.map(statusPath);
  const mine = paths.filter(claimable);
  const stray = paths.filter((p) => !claimable(p));
  if (stray.length) {
    say(`skipped: ${stray.length} dirty file(s) this run does not claim`);
    stray.forEach((p) =>
      say(
        `  ${p}` +
          (permitted(p)
            ? '   (inside the fence, not yours; --include to land it)'
            : '   (outside the fence)'),
      ),
    );
  }
  if (mine.length) {
    if (DRY) {
      say(`would commit ${mine.length} file(s)`);
    } else {
      git('add', '--', ...mine);
      git('commit', '-q', '-m', String(flag('message') || `${agent}: land working changes`));
      say(`commit: ${mine.length} file(s)`);
    }
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
  // Only rebase when there is something to rebase onto. Zero behind means a plain push is
  // correct, and rebasing anyway turns a clean land into a chance to fail for nothing.
  const behind = Number(tryGit('rev-list', '--count', 'HEAD..origin/main').out.trim() || '0');
  if (behind) {
    const rb = tryGit('rebase', 'origin/main');
    if (!rb.ok) {
      // Two unrelated failures share one exit code. "cannot rebase: You have unstaged changes"
      // means another agent is working in this tree. There is no conflict, and telling the reader
      // to resolve one sends them hunting for something that does not exist.
      const blocked = /cannot rebase|unstaged changes|uncommitted changes|commit or stash/i.test(
        rb.out,
      );
      const dirtyNow = tryGit('status', '--porcelain').out.split('\n').filter(Boolean);
      tryGit('rebase', '--abort');
      if (blocked) {
        die(
          'git refused the rebase because the working tree is dirty. This is not a conflict.\n' +
            `${dirtyNow.length} uncommitted path(s), most likely another agent mid-session here:\n` +
            dirtyNow.map((l) => `  ${l}`).join('\n') +
            '\nWait for them to finish, or land from your own worktree.',
        );
      }
      die(
        'rebase onto origin/main hit a real conflict: another agent changed a file you changed.\n' +
          `Resolve by hand in this worktree, then run land again.\n${rb.out}`,
      );
    }
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
