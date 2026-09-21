// Compare a directory against a Vercel deployment's file list, by SHA-1 of raw bytes.
//
// A Vercel source file's uid is the SHA-1 of its bytes, so a match here means the bytes
// are the bytes Vercel holds. Read-only: it hashes files and prints a report.
//
//   node verify-tree.mjs --dir <tree> --manifest <uids.json>
//        [--expect <published path>=<local file>] ...
//
// --expect marks a file that is meant to differ from the manifest: its bytes must equal
// the named local file and must not equal the manifest uid. Exit code 0 only when every
// other listed file matches, nothing listed is missing, and every --expect holds.
// Files present locally but absent from the manifest are reported, not failed, because
// list_deployment_files truncates below a depth of four (see deployed-uids.json).

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const args = process.argv.slice(2);
let dir = null;
let manifestPath = null;
const expect = new Map();
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dir') dir = args[++i];
  else if (args[i] === '--manifest') manifestPath = args[++i];
  else if (args[i] === '--expect') {
    const [published, local] = String(args[++i]).split('=');
    expect.set(published, local);
  }
}
if (!dir || !manifestPath) {
  console.error('usage: node verify-tree.mjs --dir <tree> --manifest <uids.json> [--expect <path>=<file>] ...');
  process.exit(2);
}

const sha1 = (p) => crypto.createHash('sha1').update(fs.readFileSync(p)).digest('hex');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')).files;

function walk(d, out = []) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}
const local = walk(dir).map((p) => path.relative(dir, p).split(path.sep).join('/')).sort();

let ok = true;
let matched = 0;
const mismatched = [];
const missing = [];
const expected = [];
for (const [rel, uid] of Object.entries(manifest)) {
  const p = path.join(dir, rel);
  if (!fs.existsSync(p)) { missing.push(rel); ok = false; continue; }
  const h = sha1(p);
  if (expect.has(rel)) {
    const want = sha1(expect.get(rel));
    const holds = h === want && h !== uid;
    expected.push({ path: rel, sha1: h, equals_hotfix: h === want, differs_from_deployed: h !== uid });
    if (!holds) ok = false;
  } else if (h === uid) {
    matched++;
  } else {
    mismatched.push({ path: rel, deployed_uid: uid, local_sha1: h });
    ok = false;
  }
}
for (const rel of expect.keys()) {
  if (!(rel in manifest)) { expected.push({ path: rel, error: 'not in manifest' }); ok = false; }
}
const unlisted = local.filter((r) => !(r in manifest));

console.log(JSON.stringify({
  dir: path.resolve(dir),
  manifest_entries: Object.keys(manifest).length,
  local_files: local.length,
  matched,
  mismatched,
  missing_locally: missing,
  expected_changes: expected,
  local_not_in_manifest: unlisted,
  result: ok ? 'PASS' : 'FAIL',
}, null, 2));
process.exit(ok ? 0 : 1);
