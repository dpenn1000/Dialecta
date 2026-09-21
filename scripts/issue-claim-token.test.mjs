// Tests for scripts/issue-claim-token.mjs.
//
// Run from the repository root:
//   node --test scripts/issue-claim-token.test.mjs
//
// No database, no network, no env: the script under test talks to none of
// those, so neither does this file. Every check is on the pure functions it
// exports (parseArgs, generateRawToken, hashToken, escapeSqlLiteral,
// profileIdSql, buildInsertSql, claimLink); main() itself, which only prints
// to stdout, is exercised indirectly by the CLI-shaped parseArgs cases.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  DEFAULT_DAYS,
  DEFAULT_PROD_URL,
  DEV_URL,
  parseArgs,
  generateRawToken,
  hashToken,
  escapeSqlLiteral,
  profileIdSql,
  buildInsertSql,
  claimLink,
} from './issue-claim-token.mjs';

const A_UUID = '10000000-0000-4000-8000-000000000001';

test('constants: the two link bases this script prints', () => {
  assert.equal(DEV_URL, 'http://localhost:3050');
  assert.equal(DEFAULT_PROD_URL, 'https://dialecta.org');
  assert.equal(DEFAULT_DAYS, 14);
});

test('generateRawToken: base64url, no padding, high entropy, never repeats', () => {
  const a = generateRawToken();
  const b = generateRawToken();
  assert.notEqual(a, b, 'two calls give two different tokens');
  assert.match(a, /^[A-Za-z0-9_-]+$/, 'base64url alphabet only, so no percent-encoding is ever required');
  assert.equal(a.length, 43, '32 random bytes, base64url, no padding');
});

test('hashToken: matches the standard SHA-256 test vector', () => {
  // NIST's own worked example. Confirms hashToken is plain, unsalted
  // sha256-hex before trusting it against claim_profile's own digest() call.
  assert.equal(hashToken('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('hashToken: matches Node crypto computed the same way claim_profile is documented to (utf8 bytes, sha256, hex)', () => {
  const token = generateRawToken();
  const expected = createHash('sha256').update(token, 'utf8').digest('hex');
  assert.equal(hashToken(token), expected);
  assert.match(hashToken(token), /^[0-9a-f]{64}$/, '32-byte digest, hex encoded, matching token_hash text');
});

test('hashToken: is not reversible in any way this script attempts, and never echoes the input', () => {
  const token = generateRawToken();
  const hash = hashToken(token);
  assert.notEqual(hash, token);
  assert.equal(hash.includes(token), false);
});

test('escapeSqlLiteral: doubles single quotes and leaves everything else alone', () => {
  assert.equal(escapeSqlLiteral("o'brien"), "o''brien");
  assert.equal(escapeSqlLiteral("''"), "''''");
  assert.equal(escapeSqlLiteral('wen-zhao'), 'wen-zhao');
});

test('profileIdSql: a uuid subject is quoted and used literally', () => {
  assert.equal(profileIdSql(A_UUID), `'${A_UUID}'`);
});

test('profileIdSql: a handle subject becomes a lowercased subquery, matching profile/_lib/data.ts\'s own lookup', () => {
  assert.equal(profileIdSql('Wen-Zhao'), "(select id from public.profiles where handle = lower('Wen-Zhao'))");
});

test('profileIdSql: a handle carrying a quote is escaped, not left to break the statement', () => {
  const sql = profileIdSql("o'connor");
  assert.equal(sql, "(select id from public.profiles where handle = lower('o''connor'))");
});

test('buildInsertSql: the three required columns, no created_by when none is given', () => {
  const sql = buildInsertSql({ subject: A_UUID, tokenHash: 'deadbeef', expiresAt: '2026-10-05T00:00:00.000Z', createdBy: null });
  assert.match(sql, /^insert into public\.profile_claim_tokens \(profile_id, token_hash, expires_at\)/);
  assert.match(sql, /values \(\s*'10000000-0000-4000-8000-000000000001',\s*'deadbeef',\s*'2026-10-05T00:00:00\.000Z'\s*\);$/);
  assert.equal(sql.includes('created_by'), false);
});

test('buildInsertSql: created_by is appended as a fourth column and value when given', () => {
  const createdBy = '20000000-0000-4000-8000-000000000002';
  const sql = buildInsertSql({ subject: A_UUID, tokenHash: 'deadbeef', expiresAt: '2026-10-05T00:00:00.000Z', createdBy });
  assert.match(sql, /^insert into public\.profile_claim_tokens \(profile_id, token_hash, expires_at, created_by\)/);
  assert.ok(sql.includes(`'${createdBy}'`));
});

test('buildInsertSql: resolves a handle subject through the same subquery profileIdSql builds', () => {
  const sql = buildInsertSql({ subject: 'wen-zhao', tokenHash: 'deadbeef', expiresAt: '2026-10-05T00:00:00.000Z', createdBy: null });
  assert.ok(sql.includes("(select id from public.profiles where handle = lower('wen-zhao'))"));
});

test('buildInsertSql: never carries the raw token, only its hash (the whole point of this script)', () => {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const sql = buildInsertSql({ subject: A_UUID, tokenHash, expiresAt: '2026-10-05T00:00:00.000Z', createdBy: null });
  assert.equal(sql.includes(rawToken), false);
  assert.ok(sql.includes(tokenHash));
});

test('claimLink: dev and production links carry the same token under each origin', () => {
  const token = 'sample-token_value123';
  assert.equal(claimLink(DEV_URL, token), 'http://localhost:3050/claim?token=sample-token_value123');
  assert.equal(claimLink(DEFAULT_PROD_URL, token), 'https://dialecta.org/claim?token=sample-token_value123');
});

test('claimLink: a trailing slash on the base is tolerated, and the token is percent-encoded defensively', () => {
  assert.equal(claimLink('https://dialecta.org/', 'a b'), 'https://dialecta.org/claim?token=a%20b');
});

test('parseArgs: a bare uuid subject, all defaults', () => {
  const args = parseArgs([A_UUID]);
  assert.equal(args.subject, A_UUID);
  assert.equal(args.days, DEFAULT_DAYS);
  assert.equal(args.createdBy, null);
  assert.equal(args.prodUrl, DEFAULT_PROD_URL);
  assert.equal(args.help, false);
});

test('parseArgs: a handle subject with every flag set', () => {
  const createdBy = '20000000-0000-4000-8000-000000000002';
  const args = parseArgs(['wen-zhao', '--days', '3', '--created-by', createdBy, '--prod-url', 'https://staging.example.com']);
  assert.equal(args.subject, 'wen-zhao');
  assert.equal(args.days, 3);
  assert.equal(args.createdBy, createdBy);
  assert.equal(args.prodUrl, 'https://staging.example.com');
});

test('parseArgs: --help short-circuits the required-subject check', () => {
  assert.equal(parseArgs(['--help']).help, true);
  assert.equal(parseArgs(['-h']).help, true);
});

test('parseArgs: rejects zero or more than one positional argument', () => {
  assert.throws(() => parseArgs([]), /Exactly one profile id or handle is required/);
  assert.throws(() => parseArgs(['a', 'b']), /Exactly one profile id or handle is required/);
});

test('parseArgs: rejects a non-positive or non-numeric --days', () => {
  assert.throws(() => parseArgs([A_UUID, '--days', '0']), /--days must be a positive number/);
  assert.throws(() => parseArgs([A_UUID, '--days', '-3']), /--days must be a positive number/);
  assert.throws(() => parseArgs([A_UUID, '--days', 'soon']), /--days must be a positive number/);
});

test('parseArgs: rejects a --created-by that is not a uuid', () => {
  assert.throws(() => parseArgs([A_UUID, '--created-by', 'dan']), /--created-by must be a profiles\.id/);
});

test('parseArgs: rejects an unknown flag', () => {
  assert.throws(() => parseArgs([A_UUID, '--verbose']), /Unknown flag: --verbose/);
});
