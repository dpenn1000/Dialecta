/**
 * scripts/seo-pages-apply.mjs
 *
 * Applies the SEO metadata audit's locked proposal to Ghost: every page's
 * meta_title / meta_description / og_* / twitter_* / codeinjection_head
 * (for noindex), plus publication-level settings (home page + sitewide
 * defaults).
 *
 * Run from C:\dialecta-api\:
 *   node scripts/seo-pages-apply.mjs           # dry-run; prints diffs, exits 0
 *   node scripts/seo-pages-apply.mjs --apply   # writes changes
 *
 * Reads .env.local for GHOST_ADMIN_API_URL + GHOST_ADMIN_API_KEY.
 *
 * Idempotent: re-running after a successful apply prints "no changes."
 * Each page PUT includes id + updated_at for race-protection per Ghost API.
 *
 * Companion to seo-pages-audit.mjs (read-only baseline).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ───── env loader ─────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = value;
  }
}

const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;
if (!GHOST_URL || !ADMIN_KEY) {
  console.error('Missing GHOST_ADMIN_API_URL or GHOST_ADMIN_API_KEY in .env.local');
  process.exit(1);
}
const [keyId, keySecret] = ADMIN_KEY.split(':');
if (!keyId || !keySecret) {
  console.error('GHOST_ADMIN_API_KEY must be <id>:<hex-secret>');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

// ───── JWT + Ghost client ─────────────────────────────────────────────────

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function makeToken() {
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const signingInput = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', Buffer.from(keySecret, 'hex'))
    .update(signingInput).digest();
  return signingInput + '.' + base64url(signature);
}
async function ghost(method, pathSuffix, body) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  const opts = {
    method,
    headers: {
      Authorization: 'Ghost ' + makeToken(),
      'Accept-Version': 'v5.0',
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${method} ${pathSuffix} returned ${res.status}: ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : null;
}

// ───── proposed metadata (locked 2026-05-01) ──────────────────────────────

const NOINDEX_HEAD = '<meta name="robots" content="noindex,nofollow">';

// Per-page updates, keyed by slug.
// Public pages: meta_title + meta_description; og/twitter mirror automatically.
// Gated pages: codeinjection_head only (noindex/nofollow).
const PAGE_UPDATES = {
  about: {
    meta_title: "About Dialecta | the wager, the design, what's at stake",
    meta_description: "An independent publication and platform engineered for clarity over outrage. Here is the founding argument: who built it, why, and what it's trying to prove.",
  },
  articles: {
    meta_title: "Articles | every essay published on Dialecta",
    meta_description: "Every essay on Dialecta. Long-form writing on philosophy, economics, environment, theology, society, and more, engineered for clarity over outrage.",
  },
  community: {
    meta_title: "Community | Dialecta contributors and patterns of thought",
    meta_description: "The Dialecta contributor directory. Each profile shows a real pattern of thinking, not just an identity. Browse, follow, find sparring partners.",
  },
  pact: {
    meta_title: "The Pact | what commenting and writing on Dialecta means",
    meta_description: "Writing on Dialecta requires a small commitment: arguments over identities, evidence over outrage, honest disagreement over performance. Read the Pact and sign.",
  },
  stewards: {
    meta_title: "Stewards | Dialecta's invited writers",
    meta_description: "Stewards are Dialecta's invited writers. Each commits to a writing Order with its own discipline, cadence, and standards. Editorial leadership, made transparent.",
  },
  guidebook: {
    meta_title: "The Guidebook | how Dialecta works",
    meta_description: "How Dialecta works, in full: the seven tiers, the classification engine, opinion mapping, contributor identity, growth layer. The platform's reference.",
  },
  fingerprint: {
    meta_title: "The Fingerprint | a visual trace of how you actually think",
    meta_description: "The Living Fingerprint: Dialecta's pattern-of-thought visual. Six pillars drawn from your real contributions. What you actually think, made visible.",
  },
  write: {
    meta_title: "Writing on Dialecta | composer and Opinion Mapping engine",
    meta_description: "The Dialecta article composer: opinion mapping, claim specificity, aesthetic suggestions. Designed to help you write what's true, not what's easy.",
  },
  // Gated pages: noindex via codeinjection_head only. No meta updates.
  'dev-admin': { codeinjection_head: NOINDEX_HEAD },
  profile: { codeinjection_head: NOINDEX_HEAD },
  quotes: { codeinjection_head: NOINDEX_HEAD },
};

// Auto-mirror meta_* into og_* and twitter_* unless caller specified them.
function expandMeta(updates) {
  const expanded = { ...updates };
  if (updates.meta_title && !updates.og_title) expanded.og_title = updates.meta_title;
  if (updates.meta_description && !updates.og_description) expanded.og_description = updates.meta_description;
  if (updates.meta_title && !updates.twitter_title) expanded.twitter_title = updates.meta_title;
  if (updates.meta_description && !updates.twitter_description) expanded.twitter_description = updates.meta_description;
  return expanded;
}

// Publication settings (home page + sitewide defaults).
// `description` is also updated to the same line so RSS / fallback contexts use it.
// `twitter` (the publication twitter handle) cleared from the Ghost default "@ghost".
const HOME_TITLE = "Dialecta | a publication and platform where ideas come first";
const HOME_DESC = "A publication and discourse platform engineered for ideas over identities, clarity over outrage, and engagement over reflex.";
const HOME_IMAGE = "https://www.dialecta.org/content/images/2026/05/Dialecta-SEO-Photo.png";
const SETTINGS_UPDATES = {
  meta_title: HOME_TITLE,
  meta_description: HOME_DESC,
  og_title: HOME_TITLE,
  og_description: HOME_DESC,
  og_image: HOME_IMAGE,
  twitter_title: HOME_TITLE,
  twitter_description: HOME_DESC,
  twitter_image: HOME_IMAGE,
  cover_image: HOME_IMAGE,
  description: HOME_DESC,
  twitter: '',
};

// ───── diff + apply ───────────────────────────────────────────────────────

function trunc(v, n = 90) {
  if (v == null) return '(null)';
  const s = String(v);
  return s.length > n ? `"${s.slice(0, n)}…"` : `"${s}"`;
}

function diff(current, proposed) {
  const changes = [];
  for (const [key, newVal] of Object.entries(proposed)) {
    const oldVal = current[key];
    const oldNorm = oldVal == null ? '' : String(oldVal);
    const newNorm = newVal == null ? '' : String(newVal);
    if (oldNorm !== newNorm) {
      changes.push({ key, oldVal, newVal });
    }
  }
  return changes;
}

async function processPage(slug, rawUpdates) {
  const proposed = expandMeta(rawUpdates);

  const result = await ghost('GET', `/pages/?filter=slug:${slug}&limit=1`);
  const page = result.pages?.[0];
  if (!page) {
    console.log(`  /${slug}/ — SKIP (page not found)`);
    return { slug, status: 'skip' };
  }

  const changes = diff(page, proposed);
  if (changes.length === 0) {
    console.log(`  /${slug}/ — no changes`);
    return { slug, status: 'noop' };
  }

  console.log(`  /${slug}/ — ${changes.length} field(s) ${APPLY ? 'updating' : 'would update'}:`);
  for (const c of changes) {
    console.log(`      ${c.key}:`);
    console.log(`        was: ${trunc(c.oldVal)}`);
    console.log(`        new: ${trunc(c.newVal)}`);
  }

  if (!APPLY) return { slug, status: 'pending', changes: changes.length };

  const body = {
    pages: [{
      id: page.id,
      updated_at: page.updated_at,
      ...proposed,
    }],
  };
  await ghost('PUT', `/pages/${page.id}/`, body);
  console.log(`      ✓ applied`);
  return { slug, status: 'applied', changes: changes.length };
}

async function processSettings() {
  const result = await ghost('GET', '/settings/');
  const current = {};
  for (const item of (result.settings || [])) {
    current[item.key] = item.value;
  }

  const changes = diff(current, SETTINGS_UPDATES);
  if (changes.length === 0) {
    console.log('  publication settings — no changes');
    return { status: 'noop' };
  }

  console.log(`  publication settings — ${changes.length} field(s) ${APPLY ? 'updating' : 'would update'}:`);
  for (const c of changes) {
    console.log(`      ${c.key}:`);
    console.log(`        was: ${trunc(c.oldVal)}`);
    console.log(`        new: ${trunc(c.newVal)}`);
  }

  if (!APPLY) return { status: 'pending', changes: changes.length };

  const settingsArray = Object.entries(SETTINGS_UPDATES).map(([key, value]) => ({ key, value }));
  await ghost('PUT', '/settings/', { settings: settingsArray });
  console.log('      ✓ applied');
  return { status: 'applied', changes: changes.length };
}

// ───── main ───────────────────────────────────────────────────────────────

console.log(`=== Dialecta SEO metadata: ${APPLY ? 'APPLY' : 'DRY-RUN'} ===\n`);

console.log('Pages:');
const pageResults = [];
for (const [slug, updates] of Object.entries(PAGE_UPDATES)) {
  try {
    pageResults.push(await processPage(slug, updates));
  } catch (e) {
    console.error(`  /${slug}/ — ERROR: ${e.message}`);
    process.exit(1);
  }
}

console.log('\nPublication settings:');
let settingsResult;
try {
  settingsResult = await processSettings();
} catch (e) {
  console.error(`  ERROR: ${e.message}`);
  process.exit(1);
}

const totalPending = pageResults.filter((r) => r.status === 'pending').length + (settingsResult.status === 'pending' ? 1 : 0);
const totalApplied = pageResults.filter((r) => r.status === 'applied').length + (settingsResult.status === 'applied' ? 1 : 0);
const totalNoop = pageResults.filter((r) => r.status === 'noop').length + (settingsResult.status === 'noop' ? 1 : 0);

console.log('\n=== Summary ===');
console.log(`  pages with changes: ${APPLY ? totalApplied : totalPending}`);
console.log(`  pages already current: ${totalNoop}`);
if (!APPLY && totalPending > 0) {
  console.log(`\nRe-run with --apply to write changes.`);
}
