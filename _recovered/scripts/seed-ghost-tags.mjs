/**
 * scripts/seed-ghost-tags.mjs
 *
 * Creates (or updates) the canonical 12 Dialecta topic tags in the live
 * Ghost instance. Idempotent: safe to re-run any time. For each canonical
 * topic, the script:
 *   - Skips it if a Ghost tag with that slug already exists AND has the
 *     correct display name AND accent color.
 *   - Updates the tag (PUT) if the slug exists but the name or color
 *     don't match canonical (the common case for tags Ghost lazy-created
 *     during article publishes — they get created with bare-bones data).
 *   - Creates the tag (POST) if no tag with that slug exists.
 *
 * Run from C:\dialecta-api\:
 *
 *   node scripts/seed-ghost-tags.mjs
 *
 * Reads from .env.local (in the API repo root):
 *   GHOST_ADMIN_API_URL — e.g. https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY — <24-hex-id>:<64-hex-secret>  (from Ghost admin
 *                          → Settings → Integrations → custom integration)
 *
 * Why this exists: when an author publishes via the editor and chooses
 * topic chips, Ghost lazy-creates the tag if it doesn't exist — but with
 * no accent color and possibly a slug-derived name. Topic chip color-
 * coding on cards (driven by the slug → color map in theme/src/topics.js
 * and post.hbs's TOPIC_COLORS inline copy) works regardless, since the
 * theme reads colors from its own constants. But Ghost's own admin views
 * and any future Ghost-side rendering of tag colors will be missing
 * unless the accent_color is set. This script makes the Ghost-side state
 * canonical so admin sees the real names and colors.
 *
 * Source of truth for the 12 topics + colors: theme/src/topics.js
 * (kept in sync with api/_topics.js and post.hbs's inline TOPIC_COLORS).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ───── env loader (.env.local) ────────────────────────────────────────────

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
  console.error('GHOST_ADMIN_API_KEY must be in <id>:<hex-secret> format');
  process.exit(1);
}

// ───── JWT signing (HS256, dep-free) ──────────────────────────────────────

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken() {
  const header = { alg: 'HS256', typ: 'JWT', kid: keyId };
  const now = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const signingInput =
    base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', Buffer.from(keySecret, 'hex'))
    .update(signingInput)
    .digest();
  return signingInput + '.' + base64url(signature);
}

// ───── Ghost Admin API helper ─────────────────────────────────────────────

async function ghostFetch(pathSuffix, options = {}) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  const headers = {
    Authorization: 'Ghost ' + makeToken(),
    'Content-Type': 'application/json',
    'Accept-Version': 'v5.0',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${pathSuffix} → ${res.status}\n${text}`);
  }
  return text ? JSON.parse(text) : {};
}

// ───── Canonical topics — kept in sync with theme/src/topics.js ──────────
// `color` is the primary chip color (used as Ghost's accent_color).
// Order here mirrors the editorial color-wheel sequence in topics.js.

const CANONICAL_TOPICS = [
  { slug: 'politics_governance',   name: 'Politics & Governance',   color: '#9e2020' },
  { slug: 'law_justice',           name: 'Law & Justice',           color: '#b04020' },
  { slug: 'history',               name: 'History',                 color: '#9a5818' },
  { slug: 'economics',             name: 'Economics',               color: '#b87a18' },
  { slug: 'environment_energy',    name: 'Environment & Energy',    color: '#3a7a24' },
  { slug: 'health_medicine',       name: 'Health & Medicine',       color: '#287858' },
  { slug: 'psychology_behavior',   name: 'Psychology & Behavior',   color: '#267080' },
  { slug: 'science_technology',    name: 'Science & Technology',    color: '#2650a0' },
  { slug: 'philosophy_ethics',     name: 'Philosophy & Ethics',     color: '#3a3888' },
  { slug: 'arts_humanities',       name: 'Arts & Humanities',       color: '#6a3a9a' },
  { slug: 'theology_spirituality', name: 'Theology & Spirituality', color: '#7a2a80' },
  { slug: 'society_culture',       name: 'Society & Culture',       color: '#8a2858' },
];

// ───── Main ───────────────────────────────────────────────────────────────

(async () => {
  console.log('Fetching existing Ghost tags…');
  // Limit=all to grab everything (Ghost defaults to 15). The instance has
  // <100 tags total even with auto-created seeds, so 'all' is fine.
  const listResp = await ghostFetch('/tags/?limit=all');
  const existingBySlug = new Map();
  for (const t of listResp.tags || []) {
    existingBySlug.set(t.slug, t);
  }
  console.log(`Found ${existingBySlug.size} existing tag(s) on the instance.`);

  let created = 0, updated = 0, skipped = 0, failed = 0;

  for (const canonical of CANONICAL_TOPICS) {
    const existing = existingBySlug.get(canonical.slug);

    if (!existing) {
      // CREATE
      try {
        await ghostFetch('/tags/', {
          method: 'POST',
          body: JSON.stringify({
            tags: [{
              slug:         canonical.slug,
              name:         canonical.name,
              accent_color: canonical.color,
              visibility:   'public',
            }],
          }),
        });
        console.log(`  + created  ${canonical.slug.padEnd(24)} ${canonical.name}`);
        created++;
      } catch (err) {
        console.error(`  × FAILED  ${canonical.slug}: ${err.message}`);
        failed++;
      }
      continue;
    }

    // EXISTS — does it match canonical?
    const nameMatch  = (existing.name  || '') === canonical.name;
    const colorMatch = (existing.accent_color || '').toLowerCase() === canonical.color.toLowerCase();

    if (nameMatch && colorMatch) {
      console.log(`  = ok       ${canonical.slug.padEnd(24)} ${canonical.name}`);
      skipped++;
      continue;
    }

    // UPDATE — PUT requires the existing updated_at as a concurrency token.
    try {
      await ghostFetch(`/tags/${existing.id}/`, {
        method: 'PUT',
        body: JSON.stringify({
          tags: [{
            name:         canonical.name,
            accent_color: canonical.color,
            updated_at:   existing.updated_at,
          }],
        }),
      });
      const reasons = [];
      if (!nameMatch)  reasons.push(`name "${existing.name}" → "${canonical.name}"`);
      if (!colorMatch) reasons.push(`color ${existing.accent_color || 'null'} → ${canonical.color}`);
      console.log(`  ↻ updated  ${canonical.slug.padEnd(24)} ${reasons.join('; ')}`);
      updated++;
    } catch (err) {
      console.error(`  × FAILED  ${canonical.slug}: ${err.message}`);
      failed++;
    }
  }

  console.log('');
  console.log('───────────────────────────────────');
  console.log(`Created : ${created}`);
  console.log(`Updated : ${updated}`);
  console.log(`Skipped : ${skipped} (already canonical)`);
  console.log(`Failed  : ${failed}`);
  console.log('───────────────────────────────────');

  if (failed > 0) process.exit(1);
})();
