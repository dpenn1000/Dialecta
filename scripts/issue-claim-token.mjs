#!/usr/bin/env node
/**
 * Issues one profile claim token: the out-of-band half of the flow
 * apps/web/src/app/claim/ redeems
 * (supabase/migrations/20260921004417_profile_claim_tokens.sql). Not run as
 * part of this change; see the builder report.
 *
 * Talks to no database and needs no env. It only generates a random token,
 * hashes it, and prints text: the claim link (dev and production) and the
 * SQL insert to run by hand in Supabase Studio. Nothing this script does
 * can be pointed at the wrong project, because it never connects to one.
 *
 * The raw token appears exactly once, in the two links this prints to this
 * terminal. Copy it straight into whatever out-of-band channel reaches the
 * member. Nothing else, and no file this script writes, sees it again: the
 * SQL below carries only its hash, the same posture the table's own comment
 * states ("Never the raw token, same reasoning as a password column").
 *
 * Hashing matches claim_profile() byte for byte
 * (supabase/migrations/20260921004417_profile_claim_tokens.sql):
 *
 *   v_hash := encode(digest(token, 'sha256'), 'hex');
 *
 * pgcrypto's digest(data text, type text) hashes the text argument's byte
 * representation under the database's encoding. Every Supabase project is
 * UTF8, and every character this script's tokens can contain (base64url:
 * A-Z a-z 0-9 - _) is a single, identical byte in UTF-8, ASCII and Latin-1
 * alike, so there is no encoding this could disagree with Postgres about.
 * Node's createHash('sha256').update(token, 'utf8').digest('hex') is the
 * same computation on the same bytes.
 *
 * Usage, from the repo root:
 *
 *   node scripts/issue-claim-token.mjs <profile-id-or-handle> [--days N] [--created-by <uuid>] [--prod-url URL]
 *
 *   <profile-id-or-handle>  A profiles.id (uuid) or a profiles.handle. A
 *                           handle is never looked up here (this script
 *                           makes no database connection); it is embedded
 *                           in the printed SQL as a subquery, case-folded
 *                           the same way apps/web/src/app/profile/_lib/data.ts
 *                           resolves /profile/<handle> (.eq('handle',
 *                           key.toLowerCase())). A typo or an unknown handle
 *                           fails loudly at insert time, on
 *                           profile_claim_tokens.profile_id's NOT NULL, not
 *                           silently.
 *   --days N                Token lifetime in days. Default 14: long enough
 *                           that Dan is not racing 14 people to sign in,
 *                           short enough to bound a leaked link. No lifetime
 *                           is specified anywhere else in this change; this
 *                           default is this script's own choice, printed on
 *                           every run so it is never a silent guess.
 *   --created-by <uuid>     profiles.id of the admin issuing it, for the
 *                           audit column. Optional; omitted leaves it null.
 *   --prod-url URL          Override the production origin. Default
 *                           https://dialecta.org, apps/web/src/lib/site.ts's
 *                           own default for NEXT_PUBLIC_SITE_URL.
 *
 * After it prints:
 *   1. Run the SQL in Supabase Studio, against mguulnibvzusfvyuowwh or
 *      wherever this claim belongs.
 *   2. Send ONE of the two links to the member, out of band. Both carry the
 *      same token; only the origin differs.
 */
import { randomBytes, createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

export const DEFAULT_DAYS = 14;
export const DEFAULT_PROD_URL = 'https://dialecta.org';
export const DEV_URL = 'http://localhost:3050';
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function usage() {
  return 'Usage: node scripts/issue-claim-token.mjs <profile-id-or-handle> [--days N] [--created-by <uuid>] [--prod-url URL]';
}

/** Exported for the test file; no I/O, just argv in, options out. */
export function parseArgs(argv) {
  const positional = [];
  const flags = { days: DEFAULT_DAYS, createdBy: null, prodUrl: DEFAULT_PROD_URL, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') {
      flags.help = true;
    } else if (a === '--days') {
      flags.days = Number(argv[++i]);
    } else if (a === '--created-by') {
      flags.createdBy = argv[++i] ?? null;
    } else if (a === '--prod-url') {
      flags.prodUrl = argv[++i] ?? null;
    } else if (a.startsWith('--')) {
      throw new Error(`Unknown flag: ${a}\n${usage()}`);
    } else {
      positional.push(a);
    }
  }
  if (!flags.help) {
    if (positional.length !== 1) {
      throw new Error(`Exactly one profile id or handle is required.\n${usage()}`);
    }
    if (!Number.isFinite(flags.days) || flags.days <= 0) {
      throw new Error('--days must be a positive number.');
    }
    if (flags.createdBy !== null && !UUID_RE.test(flags.createdBy)) {
      throw new Error('--created-by must be a profiles.id (a uuid).');
    }
    if (!flags.prodUrl) {
      throw new Error('--prod-url needs a value.');
    }
  }
  return { ...flags, subject: positional[0] };
}

/** A cryptographically random raw token. base64url so no percent-encoding is ever needed to place it in a URL. */
export function generateRawToken() {
  return randomBytes(32).toString('base64url');
}

/** claim_profile()'s own hash: sha256 of the token's UTF-8 bytes, hex encoded. See the header comment for why this matches byte for byte. */
export function hashToken(rawToken) {
  return createHash('sha256').update(rawToken, 'utf8').digest('hex');
}

/** Doubles embedded single quotes. The only escaping this script's printed SQL needs: every other value it interpolates is either this-checked or a uuid. */
export function escapeSqlLiteral(value) {
  return value.replace(/'/g, "''");
}

/** profiles.id inline if the subject is already a uuid, otherwise a handle subquery, case-folded to match the app's own handle lookup. */
export function profileIdSql(subject) {
  if (UUID_RE.test(subject)) return `'${subject}'`;
  return `(select id from public.profiles where handle = lower('${escapeSqlLiteral(subject)}'))`;
}

/** The insert this script exists to print. Carries the hash only, never the raw token. */
export function buildInsertSql({ subject, tokenHash, expiresAt, createdBy }) {
  const columns = ['profile_id', 'token_hash', 'expires_at'];
  const values = [profileIdSql(subject), `'${tokenHash}'`, `'${expiresAt}'`];
  if (createdBy) {
    columns.push('created_by');
    values.push(`'${createdBy}'`);
  }
  return `insert into public.profile_claim_tokens (${columns.join(', ')})\nvalues (\n  ${values.join(',\n  ')}\n);`;
}

/** The link a member clicks. encodeURIComponent is defensive; this script's own tokens (base64url) never need it. */
export function claimLink(baseUrl, rawToken) {
  return `${baseUrl.replace(/\/$/, '')}/claim?token=${encodeURIComponent(rawToken)}`;
}

function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
    return;
  }
  if (args.help) {
    console.log(usage());
    return;
  }

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + args.days * 24 * 60 * 60 * 1000).toISOString();
  const sql = buildInsertSql({ subject: args.subject, tokenHash, expiresAt, createdBy: args.createdBy });

  console.log(`Claim token for: ${args.subject}`);
  console.log(`Expires: ${expiresAt} (${args.days} day${args.days === 1 ? '' : 's'})`);
  console.log('');
  console.log('Claim link, local dev:');
  console.log(`  ${claimLink(DEV_URL, rawToken)}`);
  console.log('Claim link, production:');
  console.log(`  ${claimLink(args.prodUrl, rawToken)}`);
  console.log('');
  console.log('SQL insert, hash only, safe to paste anywhere this terminal output is not:');
  console.log('');
  console.log(sql);
  console.log('');
  console.log('Run that SQL in Supabase Studio, then send ONE of the two links above to the');
  console.log('member out of band. The raw token above will not be shown again.');
}

// Runs only when invoked directly (node scripts/issue-claim-token.mjs ...), not when
// issue-claim-token.test.mjs imports this file's exports. pathToFileURL, not a raw
// `file://${...}` template, so a Windows path (backslashes, drive letter) compares equal.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main();
}
