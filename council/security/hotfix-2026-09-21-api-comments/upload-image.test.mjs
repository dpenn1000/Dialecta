// Tests for the disabled POST /api/article/upload-image.
//
// Run from the repository root:
//   node --test council/security/hotfix-2026-09-21-api-comments/upload-image.test.mjs
//
// The throwaway tree holds the hotfix upload-image.js at api/article/ and the deployed
// _cors.js at api/. It holds no @supabase/supabase-js, no sharp and no _ghost-admin.js,
// so the import itself fails if the disabled handler ever reaches for any of them.

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..', '..');
const DEPLOYED_CORS = path.join(REPO, '_recovered', 'api', '_cors.js');
const DEPLOYED_CORS_UID = 'b2336f52b256a16101097e69cd0b32b44c0ada03';
const HOTFIX = path.join(HERE, 'upload-image.js');

let tmp;
let mod;

before(async () => {
  const corsBytes = fs.readFileSync(DEPLOYED_CORS);
  assert.equal(crypto.createHash('sha1').update(corsBytes).digest('hex'), DEPLOYED_CORS_UID,
    '_recovered/api/_cors.js no longer matches the deployed uid');
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dialecta-upload-hotfix-'));
  fs.mkdirSync(path.join(tmp, 'api', 'article'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ type: 'module' }));
  fs.writeFileSync(path.join(tmp, 'api', '_cors.js'), corsBytes);
  fs.copyFileSync(HOTFIX, path.join(tmp, 'api', 'article', 'upload-image.js'));
  mod = await import(pathToFileURL(path.join(tmp, 'api', 'article', 'upload-image.js')).href);
});

after(() => {
  if (tmp) fs.rmSync(tmp, { recursive: true, force: true });
});

function mockRes() {
  const res = { statusCode: 200, headers: {}, body: undefined, ended: false };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; res.ended = true; return res; };
  res.setHeader = (k, v) => { res.headers[String(k).toLowerCase()] = v; };
  res.end = () => { res.ended = true; return res; };
  return res;
}

// A request whose body cannot be read without throwing.
function request(method, origin) {
  const req = { method, headers: origin ? { origin } : {}, query: {} };
  Object.defineProperty(req, 'body', {
    get() { throw new Error('the disabled handler read the request body'); },
  });
  return req;
}

test('imports nothing but the deployed CORS helper', () => {
  const source = fs.readFileSync(HOTFIX, 'utf8');
  const specifiers = [...source.matchAll(/^\s*import\s[^;]*?from\s+['"]([^'"]+)['"]/gm)].map((m) => m[1]);
  assert.deepEqual(specifiers, ['../_cors.js']);
  assert.ok(!/\bimport\s*\(/.test(source), 'dynamic import present');
  assert.ok(!/\brequire\s*\(/.test(source), 'require present');
});

test('refuses an upload that names a member, without reading the body', () => {
  const res = mockRes();
  mod.default(request('POST', 'https://dialecta.org'), res);
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { error: mod.UPLOADS_PAUSED_MESSAGE });
});

test('the refusal carries CORS headers, so the live callers can show its message', () => {
  for (const origin of ['https://dialecta.org', 'https://www.dialecta.org', 'https://dialecta.mymagic.page']) {
    const res = mockRes();
    mod.default(request('POST', origin), res);
    assert.equal(res.headers['access-control-allow-origin'], origin);
    assert.equal(res.statusCode, 503);
  }
});

test('answers the CORS preflight and nothing else changes for other methods', () => {
  const pre = mockRes();
  mod.default(request('OPTIONS', 'https://dialecta.org'), pre);
  assert.equal(pre.statusCode, 200);
  assert.ok(pre.ended);
  assert.equal(pre.body, undefined);

  const get = mockRes();
  mod.default(request('GET', 'https://dialecta.org'), get);
  assert.equal(get.statusCode, 405);
});

test('the message a member sees follows the Editorial Voice hard rules', () => {
  const msg = mod.UPLOADS_PAUSED_MESSAGE;
  const dashes = new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']');
  assert.ok(!dashes.test(msg), 'en or em dash');
  assert.ok(!/--/.test(msg), 'double hyphen');
  assert.ok((msg.match(/[.!?](\s|$)/g) || []).length <= 2, 'more than two sentences');
});
