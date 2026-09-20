#!/usr/bin/env node
// Prove the Council API's HTTP contract without spending a single agent turn.
//
//   node scripts/council-smoke.mjs            contract only, seconds
//   node scripts/council-smoke.mjs --live     also runs one real agent job, minutes
//
// Why the split. A job spawns `claude -p` and takes minutes, so a smoke test that always runs
// one is a smoke test nobody runs. Everything except the spawn is checkable in about a second:
// auth, validation, the roster, job lookup. That part should run every time the service is
// touched. `--live` is for after a change to the spawn path itself.
//
// What this exists to catch. The service starting is not the same as the service working. It
// started fine on 2026-09-20 with a .env it could not read, because the parser split on \n and
// the file had CRLF line endings, so every key read as absent and the token check compared
// against undefined. A health probe said OK. Nothing else would have.

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL } from '../tools/roster.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

for (const line of existsSync(join(ROOT, '.env'))
  ? readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const TOKEN = process.env.COMMITTEE_API_TOKEN || process.env.COUNCIL_API_TOKEN;
const PORT = Number(process.env.COMMITTEE_PORT || process.env.COUNCIL_PORT || 8787);
const BASE = `http://127.0.0.1:${PORT}`;
const LIVE = process.argv.includes('--live');

if (!TOKEN) {
  process.stderr.write('smoke: no token in .env. Run council-service.ps1 -Action token.\n');
  process.exit(1);
}

let pass = 0;
let fail = 0;

/** Assert a request's status code. Never prints the token or any header. */
async function expect(name, path, { method = 'GET', token, body } = {}, want) {
  // `connection: close` on purpose. With keep-alive, undici holds the socket open past the last
  // assertion, and exiting then trips a libuv assertion on Windows that looks like a test failure
  // and returns a non-zero code from a run where everything passed.
  const headers = { connection: 'close' };
  if (token) headers.authorization = `Bearer ${token}`;
  if (body) headers['content-type'] = 'application/json';
  let got;
  let payload = null;
  try {
    const r = await fetch(`${BASE}${path}`, { method, headers, body });
    got = r.status;
    payload = await r.json().catch(() => null);
  } catch (e) {
    process.stdout.write(`  FAIL  ${name}: ${e.message}\n`);
    fail++;
    return null;
  }
  if (got === want) {
    process.stdout.write(`  pass  ${name} -> ${got}\n`);
    pass++;
  } else {
    process.stdout.write(`  FAIL  ${name} -> ${got}, wanted ${want}\n`);
    fail++;
  }
  return payload;
}

process.stdout.write(`council-smoke against ${BASE}\n\n`);

const health = await expect('health, no token', '/health', {}, 200);
if (health) {
  const n = health.agents?.length ?? 0;
  // Compared against the derived roster, so adding a seat cannot leave this assertion stale.
  const ok = n === ALL.length;
  process.stdout.write(`  ${ok ? 'pass' : 'FAIL'}  roster matches the repo -> ${n}\n`);
  ok ? pass++ : fail++;
  process.stdout.write(`        ${(health.agents ?? []).join(', ')}\n`);
}

// Auth. A 401 here is the whole reason the service binds localhost and still wants a token.
await expect('ask with no token', '/ask', { method: 'POST', body: '{"question":"x"}' }, 401);
await expect('ask with wrong token', '/ask', { method: 'POST', token: 'wrong', body: '{"question":"x"}' }, 401);

// Validation, with a good token. None of these should reach a spawn.
await expect('empty question', '/ask', { method: 'POST', token: TOKEN, body: '{"question":""}' }, 400);
await expect('malformed body', '/ask', { method: 'POST', token: TOKEN, body: 'not json' }, 400);
await expect(
  'unknown seat',
  '/ask',
  { method: 'POST', token: TOKEN, body: '{"question":"x","agents":["nosuchseat"]}' },
  400,
);

// Job lookup.
await expect('unknown job id', '/jobs/00000000-0000-0000-0000-000000000000', { token: TOKEN }, 404);
await expect('job list', '/jobs', { token: TOKEN }, 200);
await expect('unrouted path', '/nope', { token: TOKEN }, 404);

if (LIVE) {
  process.stdout.write('\n  live: asking one seat one question, this takes minutes\n');
  const started = await expect(
    'ask accepted',
    '/ask',
    {
      method: 'POST',
      token: TOKEN,
      body: JSON.stringify({
        question:
          'Reply with one sentence naming the file that holds your mandate, and stop. Write nothing to disk.',
        agents: ['spec-reader'],
      }),
    },
    202,
  );
  if (started?.id) {
    const deadline = Date.now() + 10 * 60 * 1000;
    let job;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      const r = await fetch(`${BASE}/jobs/${started.id}`, {
        headers: { authorization: `Bearer ${TOKEN}` },
      });
      job = await r.json();
      if (job.state !== 'queued' && job.state !== 'running') break;
    }
    const ok = job?.state === 'done';
    process.stdout.write(`  ${ok ? 'pass' : 'FAIL'}  job finished -> ${job?.state}\n`);
    ok ? pass++ : fail++;
    const answer = job?.answers?.['spec-reader']?.output ?? '';
    if (answer) process.stdout.write(`        answer: ${answer.slice(0, 200).replace(/\s+/g, ' ')}\n`);
  }
}

process.stdout.write(`\n${pass} passed, ${fail} failed\n`);
// exitCode rather than exit(), so the loop drains instead of being torn down mid-socket.
process.exitCode = fail ? 1 : 0;
