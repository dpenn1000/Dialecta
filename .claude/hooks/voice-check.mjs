#!/usr/bin/env node
// PostToolUse hook (Edit|Write|MultiEdit): run the voice checker on prose files.
// Blocks on hard-rule hits (em dashes, en dashes, --, stacked exclamation points).
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8'));
const p = (input.tool_input?.file_path || '').replace(/\\/g, '/');
if (!p) process.exit(0);

const isProse = /\.(md|mdx)$/i.test(p) || /apps\/web\/src\/strings\.ts$/.test(p);
if (!isProse || !existsSync(p)) process.exit(0);
// The voice doc prints the patterns it bans; the checker honors its ignore marker.
if (/Dialecta_Editorial_Voice\.md$/.test(p)) process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const script = resolve(root, 'scripts/voice_check.py');
for (const py of ['python3', 'python', 'py']) {
  const r = spawnSync(py, [script, '--strict', p], { encoding: 'utf8' });
  if (r.error) continue;
  if (r.status !== 0) {
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason: `voice_check hard-rule failure in ${p}. Fix the dashes or exclamation points, then retry.\n${r.stdout.slice(0, 1500)}`,
      }),
    );
  }
  process.exit(0);
}
process.exit(0);
