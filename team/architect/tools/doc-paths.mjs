#!/usr/bin/env node
// doc-paths.mjs
//
// Why this exists: the architect seat's founding failure is "a definition exists in one
// place and the code does something else." The case that provoked this check:
// WoodFrameProgressBar.jsx was renamed on promotion and three independent searches
// concluded it was lost, because the living docs still named the old file and nobody
// checked that name against the tree. This script never trusts a path a document
// asserts. It reads the docs meant to stay true, pulls every path-shaped reference out
// of them, and checks each one against git's own tracked file list and rename history.
// It is a report, not a gate: it always exits 0. Turning any of this into a blocking
// check is a decision for the seat to make once it has seen what a real run surfaces.
//
// Usage: node team/architect/tools/doc-paths.mjs [repoRoot] [--json]
//   repoRoot defaults to process.cwd(). No writes, no dependencies, read-only.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const repoRootArg = args.find((a) => !a.startsWith('--'));
const repoRoot = path.resolve(repoRootArg || process.cwd());

// ---------------------------------------------------------------------------
// Living-document selection
//
// This is a closed allowlist, not a general docs/ scan. Anything not named here
// (a positions file, a council log, an audit snapshot) is left alone even if it
// lives next to a doc that IS scanned. The exclude patterns are a second net for
// the specific write-once shapes called out in the brief; most of them can never
// fire given how narrow the include list already is, but they say in code what
// the brief says in prose, so a future widening of the include list does not
// silently start reading write-once records.
// ---------------------------------------------------------------------------

const DOC_INCLUDE_EXACT = new Set([
  'CLAUDE.md',
  'docs/handoffs/current.md',
  'docs/OPEN-ITEMS.md',
  'docs/handoffs/ARCHITECT-THREAD.md',
  'docs/Dialecta_Project_Index.md',
  'exchange/README.md',
  'exchange/SCHEMA.md',
]);

const DOC_INCLUDE_PATTERNS = [
  // */CLAUDE.md: any non-root CLAUDE.md, at any depth. A strict single-star glob
  // (one path segment only) would miss apps/web/CLAUDE.md and packages/core/CLAUDE.md,
  // which are two segments deep and which root CLAUDE.md itself names as the living
  // per-workspace companion docs ("see apps/web/CLAUDE.md"). Root CLAUDE.md is handled
  // by the exact-match set above, so this only needs to exclude the no-slash case.
  /\/CLAUDE\.md$/,
  /^docs\/plans\/[^/]+\.md$/, // docs/plans/*.md
  /^team\/[^/]+\/brief\.md$/, // team/*/brief.md
  /^team\/[^/]+\/practices\.md$/, // team/*/practices.md
  /^council\/[^/]+\/charter\.md$/, // council/*/charter.md
  /^\.claude\/agents\/[^/]+\.md$/, // .claude/agents/*.md
  /^\.claude\/skills\/[^/]+\/SKILL\.md$/, // .claude/skills/*/SKILL.md
];

const DOC_EXCLUDE_PATTERNS = [
  /^docs\/handoffs\/dialecta-handoff-.*\.md$/, // write-once handoffs
  /^exchange\/(open|closed)\//, // write-once exchange records
  /(^|\/)knowledge\//, // write-once knowledge captures, any team
  /(^|\/)research\//, // write-once research captures, any council seat
  /^council\/log\//, // write-once council debate log
  /^_(recovered|recovered-next|theme|to_delete)\//, // quarantine: evidence about another repository
];

function selectLivingDocs(trackedFiles) {
  const docs = [];
  for (const f of trackedFiles) {
    const included = DOC_INCLUDE_EXACT.has(f) || DOC_INCLUDE_PATTERNS.some((re) => re.test(f));
    if (!included) continue;
    if (DOC_EXCLUDE_PATTERNS.some((re) => re.test(f))) continue;
    docs.push(f);
  }
  return docs;
}

// ---------------------------------------------------------------------------
// git (read-only)
// ---------------------------------------------------------------------------

function git(gitArgs) {
  return execFileSync('git', gitArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 64,
  });
}

function getTrackedFiles() {
  return git(['ls-files'])
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

// old -> new, chased across multiple hops (A renamed to B, B later renamed to C).
// git log --all is newest-first, so the first time we see a given "old" path is its
// most recent rename; earlier renames of the same path are older news and ignored.
function buildRenameMap() {
  const out = git(['log', '--all', '--format=', '--name-status', '--diff-filter=R']);
  const map = new Map();
  for (const rawLine of out.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line) continue;
    const m = /^R\d+\t(.+)\t(.+)$/.exec(line);
    if (!m) continue;
    const [, oldPath, newPath] = m;
    if (!map.has(oldPath)) map.set(oldPath, newPath);
  }
  return map;
}

function chaseRename(startPath, renameMap) {
  if (!renameMap.has(startPath)) return null;
  let current = startPath;
  const seen = new Set([current]);
  while (renameMap.has(current)) {
    const next = renameMap.get(current);
    if (seen.has(next)) break; // guard against a rename cycle
    current = next;
    seen.add(current);
  }
  return current;
}

// ---------------------------------------------------------------------------
// Tree indexes built once from the tracked file list
// ---------------------------------------------------------------------------

function buildDirSet(trackedFiles) {
  const dirs = new Set();
  for (const f of trackedFiles) {
    const parts = f.split('/');
    let cur = '';
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur ? `${cur}/${parts[i]}` : parts[i];
      dirs.add(cur);
    }
  }
  return dirs;
}

function buildBasenameMap(trackedFiles) {
  const map = new Map();
  for (const f of trackedFiles) {
    const base = f.split('/').pop();
    if (!map.has(base)) map.set(base, []);
    map.get(base).push(f);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Candidate extraction: backticked spans and markdown link targets
// ---------------------------------------------------------------------------

const BACKTICK_RE = /`([^`]+)`/g;
const MDLINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

const KNOWN_EXTENSIONS = [
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.md', '.sql', '.json',
  '.css', '.html', '.py', '.ps1', '.yml', '.yaml', '.toml', '.txt',
];

const GLOB_OR_PLACEHOLDER_RE = /[*?{}<>$|]/;

function looksLikePath(raw) {
  if (raw.includes('/')) return true;
  const lower = raw.toLowerCase();
  return KNOWN_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function shouldSkip(candidate) {
  if (/^https?:\/\//i.test(candidate)) return true;
  if (/^mailto:/i.test(candidate)) return true;
  if (GLOB_OR_PLACEHOLDER_RE.test(candidate)) return true;
  if (/\s/.test(candidate)) return true;
  if (/(^|\/)node_modules(\/|$)/.test(candidate)) return true;
  return false;
}

// Calibration, 2026-09-21: the first run reported 252 MISSING, and two classes of them were
// never paths. A leading "/" with no file extension is a route (`/pact`, `/write`,
// `/api/comment`), and an "@scope/name" token is an npm package (`@dialecta/core`). Both are
// skipped on the raw token, before normalize() strips the leading slash that marks a route.
function isRouteOrPackage(raw) {
  const t = raw.trim();
  if (/^@[a-z0-9._-]+\/[a-z0-9._-]+(\/[^\s]*)?$/i.test(t)) return true;
  if (t.startsWith('/') && !KNOWN_EXTENSIONS.some((ext) => t.toLowerCase().endsWith(ext))) return true;
  return false;
}

function normalize(raw) {
  let s = raw.trim();
  s = s.replace(/:\d+(:\d+)?$/, ''); // trailing :line or :line:col
  // Trailing prose punctuation. Deliberately excludes "]": this repo's Next.js
  // routes use literal `[slug]`-style segments, and stripping a trailing "]"
  // turned a real path (articles/[slug]) into a broken one (articles/[slug).
  s = s.replace(/[.,;:!?'")]+$/, '');
  if (s.startsWith('./')) s = s.slice(2);
  while (s.startsWith('/')) s = s.slice(1);
  if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1); // directory reference
  return s;
}

function extractCandidates(line) {
  const raws = [];
  let m;
  BACKTICK_RE.lastIndex = 0;
  while ((m = BACKTICK_RE.exec(line))) raws.push(m[1]);
  MDLINK_RE.lastIndex = 0;
  while ((m = MDLINK_RE.exec(line))) raws.push(m[1]);

  const out = [];
  for (const raw of raws) {
    if (shouldSkip(raw)) continue;
    if (isRouteOrPackage(raw)) continue;
    if (!looksLikePath(raw)) continue;
    const norm = normalize(raw);
    if (!norm) continue;
    if (shouldSkip(norm)) continue;
    out.push(norm);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Classification
// ---------------------------------------------------------------------------

// A doc may write a path relative to its own directory (a doc in team/architect/
// writing "knowledge/index.md") or relative to a known workspace root (apps/web/
// CLAUDE.md's own convention of writing "src/..." for "apps/web/src/..."). Try the
// reference as given first, then each of those bases, before calling it missing.
const KNOWN_WORKSPACE_ROOTS = ['apps/web', 'packages/core', 'supabase'];

function joinPosix(base, rel) {
  const parts = base.split('/').concat(rel.split('/'));
  const stack = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') stack.pop();
    else stack.push(part);
  }
  return stack.join('/');
}

function buildCandidatePaths(ref, docDir) {
  const bases = ['', docDir, ...KNOWN_WORKSPACE_ROOTS];
  const seen = new Set();
  const out = [];
  for (const base of bases) {
    const candidate = base ? joinPosix(base, ref) : ref;
    if (!seen.has(candidate)) {
      seen.add(candidate);
      out.push(candidate);
    }
  }
  return out;
}

function classifyReference(ref, docDir, ctx) {
  const { trackedSet, dirSet, renameMap, basenameMap } = ctx;
  const candidates = buildCandidatePaths(ref, docDir);

  for (const c of candidates) {
    if (trackedSet.has(c) || dirSet.has(c)) return { status: 'OK' };
  }

  for (const c of candidates) {
    const renamed = chaseRename(c, renameMap);
    if (renamed) return { status: 'RENAMED', to: renamed };
  }

  // Calibration, 2026-09-21: a reference with a directory part that is the tail of exactly one
  // tracked path is written relative to a root the doc left unnamed (`articles/[slug]/page.tsx`
  // for `apps/web/src/app/articles/[slug]/page.tsx`). That resolves; it is not a moved file.
  if (ref.includes('/')) {
    const tails = ctx.trackedFiles.filter((f) => f.endsWith(`/${ref}`));
    if (tails.length === 1) return { status: 'OK' };
    if (tails.length > 1) return { status: 'AMBIGUOUS', candidates: tails.slice(0, 3) };
  }

  // A bare filename names a file, not a place. One tracked file with that name resolves it;
  // two or more is ambiguous; none is missing. Nothing "moved", because no directory was claimed.
  const base = ref.split('/').pop();
  const moved = (basenameMap.get(base) || []).slice().sort();
  if (!ref.includes('/')) {
    if (moved.length === 1) return { status: 'OK' };
    if (moved.length > 1) return { status: 'AMBIGUOUS', candidates: moved.slice(0, 3) };
    return { status: 'MISSING' };
  }

  // MOVED means the doc names a directory the file is no longer in, and one to three tracked
  // files carry its name. More than three (page.tsx, brief.md, charter.md) is a guess, not a
  // finding, and is reported as AMBIGUOUS.
  if (moved.length > 3) return { status: 'AMBIGUOUS', candidates: moved.slice(0, 3) };
  if (moved.length > 0) return { status: 'MOVED', candidates: moved };

  return { status: 'MISSING' };
}

// ---------------------------------------------------------------------------
// Scan
// ---------------------------------------------------------------------------

function scanDocs(docs, ctx) {
  const rows = [];
  for (const doc of docs) {
    const fullPath = path.join(repoRoot, doc);
    let content;
    try {
      content = readFileSync(fullPath, 'utf8');
    } catch (err) {
      rows.push({ doc, line: 0, ref: '(unreadable)', status: 'MISSING', detail: String(err.message || err) });
      continue;
    }
    const dirname = path.posix.dirname(doc);
    const docDir = dirname === '.' ? '' : dirname;
    const lines = content.split(/\r\n|\r|\n/);
    lines.forEach((lineText, idx) => {
      const lineNo = idx + 1;
      for (const ref of extractCandidates(lineText)) {
        const result = classifyReference(ref, docDir, ctx);
        rows.push({ doc, line: lineNo, ref, ...result });
      }
    });
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const STATUS_ORDER = ['OK', 'RENAMED', 'MOVED', 'MISSING', 'AMBIGUOUS'];

function candidateSuffix(row) {
  if (row.status === 'RENAMED') return `  [${row.to}]`;
  if (row.status === 'MOVED' || row.status === 'AMBIGUOUS') return `  [${row.candidates.join(', ')}]`;
  return '';
}

function printReport(rows, docCount) {
  const counts = { OK: 0, RENAMED: 0, MOVED: 0, MISSING: 0, AMBIGUOUS: 0 };
  for (const r of rows) counts[r.status] = (counts[r.status] || 0) + 1;

  if (jsonMode) {
    console.log(JSON.stringify({ repoRoot, docCount, counts, rows: rows.filter((r) => r.status !== 'OK') }, null, 2));
    return;
  }

  console.log(`doc-paths report: ${repoRoot} (${docCount} living docs scanned)`);
  for (const status of STATUS_ORDER) console.log(`  ${status}: ${counts[status] || 0}`);
  console.log('');

  const nonOk = rows
    .filter((r) => r.status !== 'OK')
    .sort((a, b) => {
      const rankDiff = STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
      if (rankDiff !== 0) return rankDiff;
      if (a.doc !== b.doc) return a.doc < b.doc ? -1 : 1;
      return a.line - b.line;
    });

  for (const r of nonOk) {
    console.log(`${r.doc}:${r.line}  ${r.ref}  ${r.status}${candidateSuffix(r)}`);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  let trackedFiles;
  let renameMap;
  try {
    trackedFiles = getTrackedFiles();
    renameMap = buildRenameMap();
  } catch (err) {
    console.error(`doc-paths: could not read git state at ${repoRoot}: ${err.message}`);
    process.exit(1);
  }

  const ctx = {
    trackedFiles,
    trackedSet: new Set(trackedFiles),
    dirSet: buildDirSet(trackedFiles),
    renameMap,
    basenameMap: buildBasenameMap(trackedFiles),
  };

  const docs = selectLivingDocs(trackedFiles);
  const rows = scanDocs(docs, ctx);
  printReport(rows, docs.length);
  process.exit(0); // a report, not a gate
}

main();
