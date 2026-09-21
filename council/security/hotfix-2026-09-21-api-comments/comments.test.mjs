// Tests for the narrowed GET /api/comments.
//
// Run from the repository root:
//   node --test council/security/hotfix-2026-09-21-api-comments/comments.test.mjs
//
// The test assembles a throwaway tree in the OS temp directory holding the hotfix
// comments.js unmodified, the deployed _cors.js (checked against its Vercel uid), and a
// stub @supabase/supabase-js. The stub returns every column of every fixture row
// whatever the query selects, so these tests prove the response is shaped by the
// handler and not merely by its select lists. Fixtures are synthetic; no member data.

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

const MEMBER_A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const MEMBER_B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const MEMBER_C = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const ARTICLE = '69f0c0ffee0000000000abcd';
const OTHER_ARTICLE = '69f0c0ffee0000000000ffff';

const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const C_PUB = id(1);
const C_BREACH = id(2);
const C_OVERRIDE = id(3);
const C_PENDING = id(4);
const C_SUPPRESSED = id(5);
const C_REPLY = id(6);
const C_ORPHAN = id(7);
const C_SEED = id(8);
const C_OTHER = id(9);

const PAST = '2026-09-01T00:00:00.000Z';
const at = (day) => `2026-09-${String(day).padStart(2, '0')}T12:00:00.000Z`;
const mentionOfC = [{ member_id: MEMBER_C, handle: 'cee', display_name: 'Cee' }];

function comment(n, fields) {
  return {
    id: id(n),
    article_id: ARTICLE,
    member_id: MEMBER_A,
    member_name: 'Alpha Member',
    member_email: 'PRIVATE-email@example.invalid',
    body: `Body ${n}`,
    status: 'published',
    published_at: null,
    hardened_at: PAST,
    created_at: at(n),
    parent_id: null,
    mentions: [],
    ...fields,
  };
}

function classification(n, tiers) {
  return {
    comment_id: id(n),
    ai_suggested_tier: 'forum',
    self_declared_tier: null,
    final_tier: 'forum',
    commenter_message: `PRIVATE-commenter-message-${n}`,
    specificity_score: 2,
    emotion: 'high',
    article_engagement: 'specific',
    opposing_view_engaged: 'no',
    borderline_flag: true,
    borderline_other_tier: 'spark',
    claim_text: `PRIVATE-claim-${n}`,
    strength: `PRIVATE-strength-${n}`,
    tribal_markers: true,
    tribal_example: `PRIVATE-tribal-${n}`,
    ...tiers,
  };
}

function fixtures() {
  return {
    comments: [
      comment(1, { body: 'A published comment for @cee', mentions: mentionOfC }),
      comment(2, { member_id: MEMBER_B, member_name: 'Beta Member', body: 'PRIVATE-breach-body about @cee', mentions: mentionOfC }),
      comment(3, { body: 'PRIVATE-override-body' }),
      comment(4, { member_id: MEMBER_B, member_name: 'Beta Member', status: 'pending_review', body: 'PRIVATE-pending-body' }),
      comment(5, { member_id: MEMBER_B, member_name: 'Beta Member', status: 'suppressed', body: 'PRIVATE-suppressed-body' }),
      comment(6, { member_id: MEMBER_B, member_name: 'Beta Member', parent_id: C_PUB, body: 'A published reply' }),
      comment(7, { parent_id: C_PENDING, body: 'PRIVATE-orphan-reply-body' }),
      comment(8, { member_id: 'seed:maya', member_name: 'Maya', body: 'Seed fixture' }),
      comment(9, { article_id: OTHER_ARTICLE, body: 'PRIVATE-other-article' }),
    ],
    classifications: [
      classification(1, {}),
      classification(2, { ai_suggested_tier: 'breach', final_tier: 'breach' }),
      classification(3, { ai_suggested_tier: 'breach', self_declared_tier: 'forum', final_tier: 'forum' }),
      classification(4, { ai_suggested_tier: 'heat', final_tier: 'heat' }),
      classification(5, { ai_suggested_tier: 'breach', final_tier: 'breach' }),
      classification(6, { ai_suggested_tier: 'spark', final_tier: 'spark', specificity_score: 3 }),
      classification(7, {}),
      classification(8, {}),
      classification(9, {}),
    ],
    tier_nominations: [
      { comment_id: C_PUB, member_id: MEMBER_B, target_tier: 'heat', reason_key: 'x_reason', note: 'PRIVATE-nomination-note' },
      { comment_id: C_PENDING, member_id: MEMBER_A, target_tier: 'fog', reason_key: 'x_reason', note: 'PRIVATE-nomination-note-2' },
    ],
    profiles: [
      { ghost_member_id: MEMBER_A, display_name: 'Alpha', subscription_tier: 'pro', is_charter: true, is_gifted: false, is_admin: true, pact_signed_name: 'PRIVATE-signed-name' },
      { ghost_member_id: MEMBER_B, display_name: 'Beta', subscription_tier: 'free', is_charter: false, is_gifted: false, is_admin: false },
    ],
  };
}

// Stub @supabase/supabase-js. Filters are applied faithfully unless ignoreFilters is
// set; select lists are recorded and deliberately not applied.
const STUB_SOURCE = String.raw`
function likeToRegExp(pattern) {
  const esc = pattern.replace(/[.*+?^${'$'}{}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.');
  return new RegExp('^' + esc + '$');
}
class Query {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderBy = null;
    this.max = null;
    this.record = { table, ops: [] };
    (globalThis.__SUPABASE_CALLS__ ||= []).push(this.record);
  }
  select(cols) { this.record.ops.push(['select', cols]); return this; }
  eq(col, val) { this.record.ops.push(['eq', col, val]); this.filters.push((r) => r[col] === val); return this; }
  in(col, vals) { this.record.ops.push(['in', col, vals]); this.filters.push((r) => vals.includes(r[col])); return this; }
  not(col, op, val) {
    this.record.ops.push(['not', col, op, val]);
    if (op === 'like') {
      const re = likeToRegExp(val);
      this.filters.push((r) => !(typeof r[col] === 'string' && re.test(r[col])));
    }
    return this;
  }
  order(col, opts) { this.record.ops.push(['order', col, opts]); this.orderBy = [col, !opts || opts.ascending !== false]; return this; }
  limit(n) { this.record.ops.push(['limit', n]); this.max = n; return this; }
  run() {
    const stub = globalThis.__SUPABASE_STUB__ || {};
    if (stub.errorOn === this.table) {
      return { data: null, error: { message: 'relation "' + this.table + '" SECRET-DETAIL from the database' } };
    }
    let rows = JSON.parse(JSON.stringify((stub.tables || {})[this.table] || []));
    if (!stub.ignoreFilters) rows = rows.filter((r) => this.filters.every((f) => f(r)));
    if (this.orderBy) {
      const [col, asc] = this.orderBy;
      rows.sort((a, b) => (a[col] < b[col] ? -1 : a[col] > b[col] ? 1 : 0) * (asc ? 1 : -1));
    }
    if (this.max != null) rows = rows.slice(0, this.max);
    return { data: rows, error: null };
  }
  then(resolve, reject) {
    try { resolve(this.run()); } catch (e) { reject(e); }
  }
}
export function createClient() {
  globalThis.__SUPABASE_CREATED__ = (globalThis.__SUPABASE_CREATED__ || 0) + 1;
  return { from: (table) => new Query(table) };
}
`;

let tmp;
let handler;

before(async () => {
  const corsBytes = fs.readFileSync(DEPLOYED_CORS);
  const corsSha = crypto.createHash('sha1').update(corsBytes).digest('hex');
  assert.equal(corsSha, DEPLOYED_CORS_UID, '_recovered/api/_cors.js no longer matches the deployed uid');

  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dialecta-comments-hotfix-'));
  const stubDir = path.join(tmp, 'node_modules', '@supabase', 'supabase-js');
  fs.mkdirSync(stubDir, { recursive: true });
  fs.mkdirSync(path.join(tmp, 'api'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ type: 'module' }));
  fs.writeFileSync(path.join(stubDir, 'package.json'), JSON.stringify({
    name: '@supabase/supabase-js', type: 'module', main: 'index.js', exports: { '.': './index.js' },
  }));
  fs.writeFileSync(path.join(stubDir, 'index.js'), STUB_SOURCE);
  fs.writeFileSync(path.join(tmp, 'api', '_cors.js'), corsBytes);
  fs.copyFileSync(path.join(HERE, 'comments.js'), path.join(tmp, 'api', 'comments.js'));

  ({ default: handler } = await import(pathToFileURL(path.join(tmp, 'api', 'comments.js')).href));
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

async function get(query, stub = {}) {
  globalThis.__SUPABASE_STUB__ = { tables: fixtures(), ...stub };
  globalThis.__SUPABASE_CALLS__ = [];
  const res = mockRes();
  await handler({ method: 'GET', headers: { origin: 'https://dialecta.org' }, query }, res);
  return res;
}

function allKeys(value, out = new Set()) {
  if (Array.isArray(value)) value.forEach((v) => allKeys(v, out));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) { out.add(k); allKeys(v, out); }
  }
  return out;
}

const byId = (res) => Object.fromEntries(res.body.comments.map((c) => [c.id, c]));

test('serves only published comments of the article, without seeds or replies to hidden parents', async () => {
  const res = await get({ article_id: ARTICLE });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.comments.map((c) => c.id), [C_REPLY, C_OVERRIDE, C_BREACH, C_PUB]);
});

test('no Breach, pending, suppressed or private classifier text appears anywhere', async () => {
  for (const viewer of [undefined, MEMBER_A, MEMBER_B]) {
    const res = await get({ article_id: ARTICLE, viewer });
    const text = JSON.stringify(res.body);
    assert.ok(!text.includes('PRIVATE-'), `private text leaked with viewer=${viewer}: ${text}`);
  }
});

test('no member id appears anywhere, and no key named member_id', async () => {
  for (const viewer of [undefined, MEMBER_A, MEMBER_B]) {
    const res = await get({ article_id: ARTICLE, viewer });
    const text = JSON.stringify(res.body);
    for (const mid of [MEMBER_A, MEMBER_B, MEMBER_C]) {
      assert.ok(!text.includes(mid), `member id ${mid} leaked with viewer=${viewer}`);
    }
    assert.ok(!allKeys(res.body).has('member_id'), 'a member_id key is present');
    assert.ok(!text.includes(C_PENDING), 'the id of a pending comment leaked');
  }
});

test('a Breach comment carries no body, no mentions and no specificity, and renders as Breach', async () => {
  const c = byId(await get({ article_id: ARTICLE }));
  assert.equal(c[C_BREACH].body, null);
  assert.deepEqual(c[C_BREACH].mentions, []);
  assert.deepEqual(c[C_BREACH].classification, {
    ai_suggested_tier: 'breach', self_declared_tier: null, final_tier: 'breach', specificity_score: null,
  });
});

test('an engine Breach read stays Breach when a self-declaration overrode it', async () => {
  const c = byId(await get({ article_id: ARTICLE }));
  assert.equal(c[C_OVERRIDE].body, null);
  assert.deepEqual(c[C_OVERRIDE].classification, {
    ai_suggested_tier: 'breach', self_declared_tier: 'forum', final_tier: 'breach', specificity_score: null,
  });
});

test('classification carries exactly the four fields the live card reads', async () => {
  const res = await get({ article_id: ARTICLE });
  for (const c of res.body.comments) {
    assert.deepEqual(Object.keys(c.classification).sort(),
      ['ai_suggested_tier', 'final_tier', 'self_declared_tier', 'specificity_score']);
  }
  assert.equal(byId(res)[C_PUB].classification.specificity_score, 2);
  const keys = allKeys(res.body);
  for (const k of ['commenter_message', 'claim_text', 'strength', 'emotion', 'article_engagement',
    'opposing_view_engaged', 'borderline_flag', 'borderline_other_tier', 'tribal_markers', 'tribal_example',
    'comment_id', 'published_at', 'status', 'member_email']) {
    assert.ok(!keys.has(k), `${k} is present in the response`);
  }
});

test('naming a member as viewer never returns that member\'s nomination', async () => {
  const c = byId(await get({ article_id: ARTICLE, viewer: MEMBER_B }));
  assert.deepEqual(c[C_PUB].nominations, { total: 1, tallies: { heat: 1 }, viewer_nomination: null });
  for (const row of Object.values(c)) assert.equal(row.nominations.viewer_nomination, null);
});

test('is_own is a boolean from viewer, and false without one', async () => {
  const asB = byId(await get({ article_id: ARTICLE, viewer: MEMBER_B }));
  assert.equal(asB[C_REPLY].is_own, true);
  assert.equal(asB[C_BREACH].is_own, true);
  assert.equal(asB[C_PUB].is_own, false);
  assert.equal(asB[C_OVERRIDE].is_own, false);
  const anon = await get({ article_id: ARTICLE });
  for (const row of anon.body.comments) assert.equal(row.is_own, false);
});

test('mentions keep handle and display_name only; author keeps name and badge fields only', async () => {
  const c = byId(await get({ article_id: ARTICLE }));
  assert.deepEqual(c[C_PUB].mentions, [{ handle: 'cee', display_name: 'Cee' }]);
  assert.deepEqual(c[C_PUB].author, { name: 'Alpha Member', subscription_tier: 'pro', is_charter: true, is_gifted: false });
  assert.deepEqual(c[C_REPLY].author, { name: 'Beta Member', subscription_tier: 'free', is_charter: false, is_gifted: false });
});

test('keeps every field the live comment card reads, with the types it expects', async () => {
  const pub = byId(await get({ article_id: ARTICLE }))[C_PUB];
  assert.equal(typeof pub.id, 'string');
  assert.equal(typeof pub.body, 'string');
  assert.equal(typeof pub.created_at, 'string');
  assert.equal(typeof pub.hardened_at, 'string');
  assert.equal(typeof pub.malleable, 'boolean');
  assert.equal(pub.parent_id, null);
  assert.ok(Array.isArray(pub.mentions));
  assert.equal(typeof pub.is_own, 'boolean');
  assert.equal(pub.classification.final_tier, 'forum');
  assert.equal(typeof pub.nominations.total, 'number');
  assert.equal(typeof pub.nominations.tallies, 'object');
  assert.deepEqual(Object.keys(pub).sort(), ['author', 'body', 'classification', 'created_at', 'hardened_at',
    'id', 'is_own', 'malleable', 'mentions', 'nominations', 'parent_id']);
});

test('the comments query itself asks for published rows only', async () => {
  await get({ article_id: ARTICLE });
  const q = globalThis.__SUPABASE_CALLS__.find((r) => r.table === 'comments');
  assert.ok(q.ops.some(([op, col, val]) => op === 'eq' && col === 'status' && val === 'published'));
  const select = q.ops.find(([op]) => op === 'select')[1];
  assert.ok(!/member_email/.test(select), 'member_email is selected');
  const cls = globalThis.__SUPABASE_CALLS__.find((r) => r.table === 'classifications');
  assert.equal(cls.ops.find(([op]) => op === 'select')[1],
    'comment_id, ai_suggested_tier, self_declared_tier, final_tier, specificity_score');
});

test('the code guard holds when the query builder applies no filters at all', async () => {
  const res = await get({ article_id: ARTICLE }, { ignoreFilters: true });
  const ids = res.body.comments.map((c) => c.id);
  assert.ok(!ids.includes(C_PENDING) && !ids.includes(C_SUPPRESSED) && !ids.includes(C_ORPHAN));
  const text = JSON.stringify(res.body);
  for (const marker of ['PRIVATE-pending-body', 'PRIVATE-suppressed-body', 'PRIVATE-orphan-reply-body',
    'PRIVATE-breach-body', 'PRIVATE-nomination-note', 'PRIVATE-commenter-message']) {
    assert.ok(!text.includes(marker), `${marker} leaked`);
  }
});

test('a database error returns 500 without the database message', async () => {
  const original = console.error;
  console.error = () => {};
  try {
    for (const table of ['comments', 'classifications', 'tier_nominations']) {
      const res = await get({ article_id: ARTICLE }, { errorOn: table });
      assert.equal(res.statusCode, 500);
      assert.deepEqual(res.body, { error: 'Could not load comments' });
    }
  } finally {
    console.error = original;
  }
});

test('an article with no published comments returns an empty list', async () => {
  const res = await get({ article_id: 'no-such-article' });
  assert.deepEqual(res.body, { comments: [] });
});

test('method, argument and preflight handling are unchanged', async () => {
  const post = mockRes();
  await handler({ method: 'POST', headers: {}, query: { article_id: ARTICLE } }, post);
  assert.equal(post.statusCode, 405);

  const missing = await get({});
  assert.equal(missing.statusCode, 400);

  const pre = mockRes();
  await handler({ method: 'OPTIONS', headers: { origin: 'https://dialecta.org' }, query: {} }, pre);
  assert.equal(pre.statusCode, 200);
  assert.equal(pre.headers['access-control-allow-origin'], 'https://dialecta.org');
  assert.ok(pre.ended);
});
