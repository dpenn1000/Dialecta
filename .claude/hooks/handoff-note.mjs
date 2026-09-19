#!/usr/bin/env node
// Stop hook: append a timestamped stub to docs/handoffs/current.md so the next
// session can see what the last one touched, even if nobody wrote a handoff.
import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const file = resolve(root, 'docs/handoffs/current.md');
if (!existsSync(dirname(file))) mkdirSync(dirname(file), { recursive: true });

const git = (args) => {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
};
const branch = git(['branch', '--show-current']) || '(no branch)';
const changed = git(['status', '--short']).split('\n').filter(Boolean).length;
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');

appendFileSync(
  file,
  `\n- ${stamp} UTC, branch \`${branch}\`, ${changed} uncommitted change(s). Session ended; fill in: item, state, next.\n`,
);
process.exit(0);
