#!/usr/bin/env node
// Stop hook: catch work that is about to be left unlanded.
//
// The previous version appended a stub to docs/handoffs/current.md on every stop.
// On 2026-09-19 that produced 25 identical "fill in: item, state, next" lines that
// nobody filled in, and it dirtied a tracked file in all nine worktrees, so every
// one of them had an uncommitted change before it had done anything.
//
// This version writes nothing to the repo. It checks whether the session is about
// to end with work that has not reached main, and if so it blocks once, naming the
// command. A second stop is always allowed, so a failing land cannot trap a session.

import { spawnSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const git = (args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trimEnd() : null;
};

// Somewhere git never tracks, and per-worktree so two sessions do not share a marker.
const gitDir = git(['rev-parse', '--absolute-git-dir']);
if (!gitDir) process.exit(0);
const marker = join(gitDir, 'land-reminded');

const dirty = (git(['status', '--porcelain']) ?? '').split('\n').filter(Boolean);
git(['fetch', '-q', 'origin']);
const ahead = Number(git(['rev-list', '--count', 'origin/main..HEAD']) ?? '0');

if (!dirty.length && !ahead) process.exit(0); // everything is on main; nothing to say
if (existsSync(marker)) process.exit(0); // already said it once this session

writeFileSync(marker, new Date().toISOString());

const parts = [];
if (dirty.length) parts.push(`${dirty.length} uncommitted file(s)`);
if (ahead) parts.push(`${ahead} commit(s) not on main`);

process.stdout.write(
  JSON.stringify({
    decision: 'block',
    reason:
      `This session has ${parts.join(' and ')}. Land it before stopping:\n\n` +
      `    node scripts/land.mjs --agent <your agent name>\n\n` +
      `That commits what is inside your folder, runs typecheck, tests and the voice gate, ` +
      `rebases onto origin/main and pushes. If it reports files outside your folder, those ` +
      `need a pull request instead and it prints the commands.\n\n` +
      `If the work genuinely should not land, say why and stop again; this will not ask twice.`,
  }),
);
process.exit(0);
