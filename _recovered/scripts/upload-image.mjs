/**
 * scripts/upload-image.mjs
 *
 * Uploads a local image file to Ghost via the Admin Images API and prints
 * the resulting public CDN URL. Reusable for og_image, cover_image, etc.
 *
 * Run from C:\dialecta-api\:
 *   node scripts/upload-image.mjs <filepath>
 *
 * Reads .env.local for GHOST_ADMIN_API_URL + GHOST_ADMIN_API_KEY.
 * Output: prints the uploaded URL to stdout (last line, easy to scrape).
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

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/upload-image.mjs <filepath>');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
const mimeMap = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
const mime = mimeMap[ext] || 'application/octet-stream';

const buffer = fs.readFileSync(filePath);
const fileName = path.basename(filePath);
const blob = new Blob([buffer], { type: mime });

const form = new FormData();
form.append('file', blob, fileName);
form.append('purpose', 'image');

const uploadUrl = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin/images/upload';
console.error(`Uploading ${fileName} (${(buffer.length / 1024).toFixed(0)}KB, ${mime}) ...`);
const res = await fetch(uploadUrl, {
  method: 'POST',
  headers: {
    Authorization: 'Ghost ' + makeToken(),
    'Accept-Version': 'v5.0',
  },
  body: form,
});
const text = await res.text();
if (!res.ok) {
  console.error(`Upload failed: ${res.status}\n${text.slice(0, 500)}`);
  process.exit(1);
}
const result = JSON.parse(text);
const url = result.images?.[0]?.url;
if (!url) {
  console.error('Upload succeeded but no URL in response:', text);
  process.exit(1);
}
console.error('Uploaded successfully.');
console.log(url);
