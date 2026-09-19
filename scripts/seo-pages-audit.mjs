/**
 * scripts/seo-pages-audit.mjs
 *
 * Read-only probe. Lists every Ghost page (slug, title, meta_title,
 * meta_description, og_*, twitter_*, codeinjection_head) so we can see
 * the current SEO baseline before proposing updates.
 *
 * Run from C:\dialecta-api\:
 *   node scripts/seo-pages-audit.mjs
 *
 * Reads .env.local for GHOST_ADMIN_API_URL + GHOST_ADMIN_API_KEY.
 * Does not write anything. Companion to seo-pages-apply.mjs (to be added).
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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
async function ghostGet(pathSuffix) {
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  const res = await fetch(url, {
    headers: {
      Authorization: 'Ghost ' + makeToken(),
      'Accept-Version': 'v5.0',
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Ghost API ${pathSuffix} returned ${res.status}: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text);
}

function summary(p) {
  return {
    slug: p.slug,
    title: p.title,
    meta_title: p.meta_title || null,
    meta_description: p.meta_description || null,
    og_title: p.og_title || null,
    og_description: p.og_description || null,
    og_image: p.og_image || null,
    twitter_title: p.twitter_title || null,
    twitter_description: p.twitter_description || null,
    twitter_image: p.twitter_image || null,
    custom_excerpt: p.custom_excerpt || null,
    codeinjection_head_present: !!p.codeinjection_head,
    visibility: p.visibility,
    status: p.status,
    updated_at: p.updated_at,
  };
}

const data = await ghostGet('/pages/?limit=50&order=slug%20ASC');
console.log(`Found ${data.pages.length} page(s).\n`);
for (const p of data.pages) {
  console.log('--- /' + p.slug + '/ ---');
  console.log(JSON.stringify(summary(p), null, 2));
  console.log('');
}

// Also dump publication-level settings (controls home page meta).
const settings = await ghostGet('/settings/');
const wanted = [
  'title', 'description', 'cover_image',
  'og_image', 'og_title', 'og_description',
  'twitter_image', 'twitter_title', 'twitter_description',
  'meta_title', 'meta_description',
  'codeinjection_head',
];
const flat = {};
for (const item of (settings.settings || [])) {
  if (wanted.includes(item.key)) flat[item.key] = item.value;
}
console.log('=== Publication settings (controls home page + sitewide defaults) ===');
console.log(JSON.stringify(flat, null, 2));
