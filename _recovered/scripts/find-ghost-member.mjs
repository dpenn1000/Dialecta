#!/usr/bin/env node
/**
 * find-ghost-member.mjs
 *
 * Search Ghost members by name (case-insensitive substring) or email.
 * Quick utility for confirming whether a member signed up, and looking up
 * their uuid for direct SQL operations.
 *
 * Usage (from API repo root, Node 20+):
 *   node --env-file=.env.local scripts/find-ghost-member.mjs Tom
 *   node --env-file=.env.local scripts/find-ghost-member.mjs "tom@gaetani.com"
 *   node --env-file=.env.local scripts/find-ghost-member.mjs gaetani
 */

import { ghostAdminFetch } from '../api/_ghost-admin.js';
import { createClient } from '@supabase/supabase-js';

const query = process.argv.slice(2).join(' ').trim();
if (!query) {
  console.error('Usage: node --env-file=.env.local scripts/find-ghost-member.mjs <name-or-email>');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

// List all members and filter client-side. Ghost's NQL filter syntax for
// substring (`name:~`) varies across versions; client-side filter avoids the
// version mismatch entirely. Cohort sizes are small enough this is fine.
const allMembers = [];
let page = 1;
while (true) {
  const r = await ghostAdminFetch(
    '/members/?limit=100&page=' + page +
    '&fields=id,name,email,created_at,last_seen_at',
  );
  const batch = r.members || [];
  allMembers.push(...batch);
  if (batch.length < 100) break;
  page += 1;
  if (page > 20) break; // hard ceiling: 2000 members; bail before runaway
}

const q = query.toLowerCase();
const members = allMembers.filter(
  (m) =>
    (m.name && m.name.toLowerCase().includes(q)) ||
    (m.email && m.email.toLowerCase().includes(q)),
);

if (members.length === 0) {
  console.log(`No Ghost member matches "${query}" by name or email.`);
  process.exit(0);
}

console.log(`Found ${members.length} Ghost member(s) matching "${query}":\n`);

for (const m of members) {
  console.log(`  ${m.name || '(no name)'}`);
  console.log(`    id:         ${m.id}`);
  console.log(`    email:      ${m.email || '(none)'}`);
  console.log(`    signed up:  ${m.created_at}`);
  console.log(`    last seen:  ${m.last_seen_at || 'never'}`);

  // Check whether a Supabase profile exists for them.
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, ghost_member_id, display_name, is_author, is_admin, is_quote_admin')
    .eq('ghost_member_id', m.id)
    .maybeSingle();
  if (profile) {
    console.log(`    supabase:   profile EXISTS (display_name="${profile.display_name || 'NULL'}", is_admin=${profile.is_admin}, is_author=${profile.is_author}, is_quote_admin=${profile.is_quote_admin})`);
    // Check if they have any admin role grants
    const { data: roles } = await supabase
      .from('profile_admin_roles')
      .select('role_id, granted_at')
      .eq('profile_id', profile.id);
    if (roles && roles.length > 0) {
      console.log(`    roles:      ${roles.map(r => r.role_id).join(', ')}`);
    } else {
      console.log(`    roles:      (none)`);
    }
  } else {
    console.log(`    supabase:   no profile yet (will be lazy-created on first /api/profile/<uuid> hit)`);
  }
  console.log('');
}
