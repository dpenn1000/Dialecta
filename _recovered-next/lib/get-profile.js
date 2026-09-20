/**
 * Server-side profile fetcher for SSR contributor pages.
 *
 * Spike implementation: looks up handle → ghost_member_id via Supabase,
 * then fetches the full profile bundle from the existing dialecta-api
 * endpoint. This avoids reimplementing the join-and-transform logic on
 * day 1; we'll port that to a direct Supabase query when Phase 4 moves
 * the API routes into this project.
 *
 * Returns the same shape the existing /api/profile/[id] GET handler
 * returns (profile + axisScores + archetype + stats + connections + chip
 * arrays), or null if the handle isn't in use (lets the page render a 404).
 */

import { createClient } from '@supabase/supabase-js';

// Lazy-init so that importing this module doesn't crash on environments
// where the env vars aren't injected yet (Vercel build phase before
// project env vars are configured, edge runtime cold starts, etc.).
let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'getProfileByHandle: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Old dialecta-api stays deployed and serves the rich profile bundle
// during the migration. Once Phase 4 ports the API routes here, switch
// to a direct Supabase query.
const LEGACY_API_BASE = 'https://dialecta.vercel.app';

export async function getProfileByHandle(handle) {
  if (!handle || typeof handle !== 'string') return null;
  const normalized = handle.toLowerCase().trim();
  if (!/^[a-z0-9_-]{3,24}$/.test(normalized)) return null;

  // 1. handle → ghost_member_id
  const { data: profile, error: profileErr } = await getSupabase()
    .from('profiles')
    .select('ghost_member_id')
    .eq('handle', normalized)
    .maybeSingle();

  if (profileErr) {
    console.error('getProfileByHandle: profile lookup failed', profileErr);
    return null;
  }
  if (!profile) {
    // TODO Phase 5: fall back to handle_history to 301-redirect old handles
    return null;
  }

  // 2. fetch the legacy bundle
  try {
    const res = await fetch(
      `${LEGACY_API_BASE}/api/profile/${encodeURIComponent(profile.ghost_member_id)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('getProfileByHandle: legacy fetch failed', err);
    return null;
  }
}
