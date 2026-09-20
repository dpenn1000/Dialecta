#!/usr/bin/env node
/**
 * backfill-display-names.mjs
 *
 * One-time cleanup: any `profiles` row with NULL display_name gets its name
 * resolved from the Ghost Admin API and persisted. Catches members whose
 * profiles were lazy-created without name hints (the avatar resolver in
 * default.hbs fetches /api/profile/<uuid> with only the uuid, so the
 * old lazy-create path landed display_name NULL).
 *
 * After the API redeploy that includes the Ghost-fallback in the lazy-create
 * path, future signups don't need this. Existing nulls do.
 *
 * Usage (from the API repo root, Node 20+):
 *   node --env-file=.env.local scripts/backfill-display-names.mjs --dry-run   # report only
 *   node --env-file=.env.local scripts/backfill-display-names.mjs             # apply
 *
 * Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY, plus whatever
 * _ghost-admin.js needs (GHOST_ADMIN_API_URL + GHOST_ADMIN_API_KEY).
 * Node's built-in --env-file flag loads .env.local without dotenv.
 */

import { createClient } from '@supabase/supabase-js';
import { ghostAdminFetch } from '../api/_ghost-admin.js';

const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in env. Check .env.local in the API repo root.');
    process.exit(1);
  }

  console.log(DRY_RUN ? '── DRY RUN ── (no writes)' : '── APPLYING ──');
  console.log('Querying profiles where display_name IS NULL ...');

  const { data: unnamed, error: queryErr } = await supabase
    .from('profiles')
    .select('id, ghost_member_id, display_name, avatar_url')
    .is('display_name', null);

  if (queryErr) {
    console.error('Supabase query failed:', queryErr.message);
    process.exit(1);
  }

  if (!unnamed || unnamed.length === 0) {
    console.log('No unnamed profiles. Done.');
    return;
  }

  console.log(`Found ${unnamed.length} unnamed profile(s):`);
  for (const p of unnamed) {
    console.log(`  ${p.ghost_member_id || '(no ghost_member_id)'}`);
  }

  const ids = unnamed.map((p) => p.ghost_member_id).filter(Boolean);
  if (ids.length === 0) {
    console.log('\nNone have a ghost_member_id; nothing to look up.');
    return;
  }

  console.log(`\nLooking up ${ids.length} record(s) from Ghost (per-id; tries /members/ then /users/ for staff) ...`);

  // Per-id lookups are slower than a bulk filter, but Ghost's NQL OR-of-ids
  // syntax doesn't match reliably across versions and a one-time script
  // doesn't need the optimization. Tries /members/<id>/ first; falls back to
  // /users/<id>/ for staff (e.g., the house article-attribution staff user).
  async function lookupOne(id) {
    try {
      const r = await ghostAdminFetch(
        '/members/' + encodeURIComponent(id) + '/?fields=id,name,email,avatar_image',
      );
      const m = r && r.members && r.members[0];
      if (m) return { kind: 'member', name: (m.name && m.name.trim()) || (m.email ? m.email.split('@')[0] : null), avatar_image: m.avatar_image || null };
    } catch (_) { /* try /users/ */ }
    try {
      const r = await ghostAdminFetch(
        '/users/' + encodeURIComponent(id) + '/?fields=id,name,email,profile_image',
      );
      const u = r && r.users && r.users[0];
      if (u) return { kind: 'staff', name: (u.name && u.name.trim()) || (u.email ? u.email.split('@')[0] : null), avatar_image: u.profile_image || null };
    } catch (_) { /* both failed */ }
    return null;
  }

  let updated = 0;
  let skipped = 0;
  let missing = 0;

  for (const p of unnamed) {
    if (!p.ghost_member_id) {
      console.log(`  ! (no ghost_member_id on profile id=${p.id})`);
      missing++;
      continue;
    }
    const found = await lookupOne(p.ghost_member_id);
    if (!found) {
      console.log(`  ! ${p.ghost_member_id}  not found as Ghost member or staff (data corruption or deleted)`);
      missing++;
      continue;
    }
    if (!found.name) {
      console.log(`  ! ${p.ghost_member_id}  found as ${found.kind} but no name or email`);
      skipped++;
      continue;
    }

    const updates = { display_name: found.name };
    if (!p.avatar_url && found.avatar_image) {
      updates.avatar_url = found.avatar_image;
    }
    const tag = found.kind === 'staff' ? ' [staff]' : '';

    if (DRY_RUN) {
      console.log(`  · ${p.ghost_member_id} -> ${found.name}${updates.avatar_url ? ' (+avatar)' : ''}${tag}`);
      updated++;
      continue;
    }

    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', p.id);

    if (updateErr) {
      console.log(`  X ${p.ghost_member_id}  update failed: ${updateErr.message}`);
      skipped++;
    } else {
      console.log(`  + ${p.ghost_member_id} -> ${found.name}${updates.avatar_url ? ' (+avatar)' : ''}${tag}`);
      updated++;
    }
  }

  console.log(`\nSummary: ${updated} ${DRY_RUN ? 'would-update' : 'updated'}, ${skipped} skipped, ${missing} missing-from-ghost. Total: ${unnamed.length}.`);
  if (DRY_RUN) {
    console.log('Dry run complete. Re-run without --dry-run to apply.');
  }
}

main().catch((e) => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
