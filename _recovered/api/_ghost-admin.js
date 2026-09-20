/**
 * api/_ghost-admin.js
 *
 * Ghost Admin API helper. Generates JWTs for the configured admin
 * integration and exposes a single ghostAdminFetch() function that the
 * article endpoints (submit, publish, [id]) call to manage posts.
 *
 * Mirrors the JWT logic in scripts/seed-articles.mjs and
 * scripts/cleanup-articles.mjs but lives in the API runtime so serverless
 * endpoints can call Ghost directly.
 *
 * Reads from process.env (set in Vercel + .env.local):
 *   GHOST_ADMIN_API_URL   e.g. https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY   <24-hex-id>:<64-hex-secret>
 */

import crypto from 'node:crypto';

const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;

const [keyId, keySecret] = (ADMIN_KEY || '').split(':');

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken() {
  if (!keyId || !keySecret) {
    throw new Error('GHOST_ADMIN_API_KEY missing or malformed (expected <id>:<secret>)');
  }
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

export async function ghostAdminFetch(pathSuffix, options = {}) {
  if (!GHOST_URL) {
    throw new Error('GHOST_ADMIN_API_URL not configured');
  }
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
  // FormData bodies need fetch to set Content-Type with the boundary itself.
  // For everything else (JSON), we keep the default application/json.
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = {
    Authorization: 'Ghost ' + makeToken(),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    'Accept-Version': 'v5.0',
    ...(options.headers || {}),
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  if (!res.ok) {
    const err = new Error('Ghost API ' + pathSuffix + ' returned ' + res.status + ': ' + text);
    err.statusCode = res.status;
    err.responseText = text;
    throw err;
  }
  return JSON.parse(text);
}
