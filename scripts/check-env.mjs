#!/usr/bin/env node
// Verify the Dialecta environment files and map what the anon key can read.
//
// Usage, from the repo root:
//   node scripts/check-env.mjs           presence plus one auth probe per service
//   node scripts/check-env.mjs --rls     also map anon reads across the live tables
//
// SAFETY CONTRACT. This script never prints a credential and never writes
// anything, locally or remotely. It emits variable names, HTTP statuses, and
// row counts. Every request is a GET. Keep it that way: it exists so the live
// project can be checked without a human reading secrets off a screen.
//
// Reads C:/Dialecta/.env (api/ and scripts/) and
// C:/Dialecta/apps/web/.env.local (the Next.js app). Falls back to the repo
// root it is run from, so it also works inside a worktree.

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const WANT_RLS = process.argv.includes('--rls');
const MAIN = 'C:/Dialecta';

function pick(...candidates) {
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

const ROOT_ENV = pick(resolve(process.cwd(), '.env'), `${MAIN}/.env`);
const WEB_ENV = pick(resolve(process.cwd(), 'apps/web/.env.local'), `${MAIN}/apps/web/.env.local`);

function loadEnv(path) {
  const out = {};
  try {
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (m && m[2].trim()) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    out.__error = e.code || String(e);
  }
  return out;
}

const root = loadEnv(ROOT_ENV);
const web = loadEnv(WEB_ENV);

function report(env, path, keys) {
  console.log(`\n--- ${path} ---`);
  if (env.__error) {
    console.log(`  FILE NOT READ (${env.__error})`);
    return;
  }
  for (const k of keys) console.log(`  ${env[k] ? 'set    ' : 'MISSING'}  ${k}`);
  const dupes = [];
  try {
    const seen = new Set();
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=/);
      if (!m) continue;
      if (seen.has(m[1])) dupes.push(m[1]);
      seen.add(m[1]);
    }
  } catch {}
  if (dupes.length) console.log(`  WARNING duplicate assignments: ${[...new Set(dupes)].join(', ')}`);
}

report(root, ROOT_ENV, ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'ANTHROPIC_API_KEY']);
report(web, WEB_ENV, ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']);

const URL_ = (root.SUPABASE_URL || web.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const ANON = web.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SVC = root.SUPABASE_SERVICE_KEY;

async function count(key, table, select = '*') {
  const r = await fetch(`${URL_}/rest/v1/${table}?select=${select}&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
  });
  const cr = r.headers.get('content-range');
  return { status: r.status, total: cr ? cr.split('/')[1] : null };
}

// Probe a real table rather than /rest/v1/. The introspection root rejects
// publishable keys with a 401 even when the key is good, which reads as a
// broken key and is not one.
async function probe(label, key, table) {
  if (!URL_ || !key) {
    console.log(`  ${label}: skipped, url or key missing`);
    return;
  }
  try {
    const { status } = await count(key, table);
    const verdict = status < 400 ? 'OK, key accepted' : status === 401 ? 'REJECTED, bad key' : '';
    console.log(`  ${label}: HTTP ${status} ${verdict}`);
  } catch (e) {
    console.log(`  ${label}: network error ${e.cause?.code || e.message}`);
  }
}

async function probeAnthropic(key) {
  if (!key) {
    console.log('  anthropic           : skipped, key missing');
    return;
  }
  try {
    const r = await fetch('https://api.anthropic.com/v1/models?limit=1', {
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    });
    console.log(`  anthropic           : HTTP ${r.status} ${r.status === 200 ? 'OK, key accepted' : r.status === 401 ? 'REJECTED, bad key' : ''}`);
  } catch (e) {
    console.log(`  anthropic           : network error ${e.cause?.code || e.message}`);
  }
}

console.log('\n--- live probes (auth only, nothing printed but status) ---');
await probe('supabase service key', SVC, 'profiles');
await probe('supabase anon key   ', ANON, 'profiles');
await probeAnthropic(root.ANTHROPIC_API_KEY || web.ANTHROPIC_API_KEY);

if (WANT_RLS) {
  if (!ANON || !SVC) {
    console.log('\n--rls needs both keys. Skipped.');
  } else {
    const TABLES = [
      'profiles', 'articles', 'comments', 'classifications', 'axis_scores',
      'axis_events', 'archetypes', 'feed_events', 'tier_nominations',
      'aspirations', 'follows', 'quotes', 'reserved_handles', 'notifications',
      'admin_roles', 'fp_snapshots', 'self_descriptions', 'share_events',
    ];
    console.log('\n--- anon reads under live RLS (counts only) ---');
    console.log('table                  anon            service');
    console.log('-'.repeat(52));
    for (const t of TABLES) {
      const a = await count(ANON, t).catch(() => ({ status: 0 }));
      const s = await count(SVC, t).catch(() => ({ status: 0 }));
      const aTxt = a.status >= 400 ? `HTTP ${a.status}` : `${String(a.total).padStart(5)} rows`;
      const sTxt = s.status >= 400 ? `HTTP ${s.status}` : `${String(s.total).padStart(5)} rows`;
      const leak = a.status < 400 && s.status < 400 && Number(a.total) > 0 && a.total === s.total;
      console.log(t.padEnd(22) + aTxt.padEnd(16) + sTxt + (leak ? '   <-- fully public' : ''));
    }

    console.log('\n--- column exposure on profiles to anon (status only) ---');
    for (const col of ['is_admin', 'subscription_tier', 'pact_signed_name', 'order_negotiation_log', 'ghost_member_id']) {
      const r = await count(ANON, 'profiles', col).catch(() => ({ status: 0 }));
      console.log(`  ${col.padEnd(24)} HTTP ${r.status}${r.status >= 400 ? ' blocked' : ' READABLE'}`);
    }
  }
}
console.log('');
