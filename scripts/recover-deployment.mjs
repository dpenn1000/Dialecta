#!/usr/bin/env node
// Recover the source tree from a Vercel deployment artifact.
//
//   node scripts/recover-deployment.mjs --deployment dpl_... [--out _recovered] [--dry-run]
//
// Why this exists: the code serving dialecta.vercel.app is in no repository. Deployment
// dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7 records commit 53364fa, and GitHub answers 422 for that
// SHA in dpenn1000/dialecta-api. That repo's main has 11 files under api/; the deployment has
// about 40. The artifact is the only surviving copy, and Vercel keeps the whole source tree
// inside it, so it is recoverable file by file.
//
// What it writes is NOT this repository's code and must not be merged into it blind. It lands
// in a quarantine folder for reading and comparison. Two things in there are worth the trip:
// api/_axis-mapping.js, the canonical implementation of Dialecta_Axis_Mapping_v1.md, and the
// 46 supabase/migrations that are the live database's actual history.
//
// Needs VERCEL_TOKEN in .env, from https://vercel.com/account/tokens with read scope.

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');

for (const line of existsSync(join(ROOT, '.env'))
  ? readFileSync(join(ROOT, '.env'), 'utf8').split(/\r?\n/)
  : []) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
}

const args = process.argv.slice(2);
const flag = (n, d = null) => {
  const i = args.indexOf(`--${n}`);
  return i === -1 ? d : (args[i + 1] ?? true);
};
const DRY = args.includes('--dry-run');
const DEPLOYMENT = flag('deployment', 'dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7');
const OUT = resolve(ROOT, String(flag('out', '_recovered')));
const TEAM = flag('team', 'team_mflrdhbcpv10z1RtMO6QZSaU');
const TOKEN = process.env.VERCEL_TOKEN;

if (!TOKEN) {
  process.stderr.write(
    'recover: set VERCEL_TOKEN in .env.\n' +
      '  Create one at https://vercel.com/account/tokens with read scope.\n',
  );
  process.exit(1);
}

const api = async (path) => {
  const url = `https://api.vercel.com${path}${path.includes('?') ? '&' : '?'}teamId=${TEAM}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${path}`);
  return r.json();
};

/** Depth-first walk of the file tree Vercel returns, yielding every file with its full path. */
function* walk(nodes, prefix = '') {
  for (const n of nodes ?? []) {
    const p = prefix ? `${prefix}/${n.name}` : n.name;
    if (n.type === 'directory') yield* walk(n.children, p);
    // "lambda" entries are built output, not source, and have no retrievable content.
    else if (n.type === 'file' && n.uid) yield { path: p, uid: n.uid };
  }
}

const tree = await api(`/v6/deployments/${DEPLOYMENT}/files`);
const files = [...walk(tree)].filter((f) => f.path.startsWith('src/'));

process.stdout.write(`deployment: ${DEPLOYMENT}\n`);
process.stdout.write(`source files: ${files.length}\n`);
process.stdout.write(`out: ${OUT}\n\n`);

if (DRY) {
  for (const f of files) process.stdout.write(`  ${f.path}\n`);
  process.stdout.write('\ndry run: nothing written\n');
  process.exit(0);
}

let written = 0;
let failed = 0;
for (const f of files) {
  try {
    const body = await api(`/v7/deployments/${DEPLOYMENT}/files/${f.uid}`);
    // The API returns base64 in `data`, occasionally already-decoded text.
    const raw = typeof body === 'string' ? body : (body.data ?? '');
    const buf = Buffer.from(raw, 'base64');
    const dest = join(OUT, f.path.replace(/^src\//, ''));
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    written++;
    if (written % 20 === 0) process.stdout.write(`  ${written} written\n`);
  } catch (e) {
    failed++;
    process.stderr.write(`  FAILED ${f.path}: ${e.message}\n`);
  }
}

process.stdout.write(`\nwrote ${written} file(s), ${failed} failed, into ${OUT}\n`);
process.stdout.write('This is not this repository\'s code. Read it, compare it, promote nothing blind.\n');
