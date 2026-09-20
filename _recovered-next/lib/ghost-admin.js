/**
 * Ghost Admin API helper for dialecta-next.
 *
 * Mirrors C:\dialecta-api\api\_ghost-admin.js verbatim. Generates
 * short-lived (5-min) HMAC-SHA256 JWTs for the configured Ghost admin
 * integration and exposes a single ghostAdminFetch() function that
 * server-side data fetchers (get-article.js, future sitemap/feed
 * builders) can call.
 *
 * Reads from process.env (must be set in Vercel + .env.local):
 *   GHOST_ADMIN_API_URL   e.g. https://www.dialecta.org
 *   GHOST_ADMIN_API_KEY   <24-hex-id>:<64-hex-secret>
 */

import crypto from 'node:crypto';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function makeToken() {
  const adminKey = process.env.GHOST_ADMIN_API_KEY;
  const [keyId, keySecret] = (adminKey || '').split(':');
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
  const ghostUrl = process.env.GHOST_ADMIN_API_URL;
  if (!ghostUrl) {
    throw new Error('GHOST_ADMIN_API_URL not configured');
  }
  const url = ghostUrl.replace(/\/$/, '') + '/ghost/api/admin' + pathSuffix;
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
