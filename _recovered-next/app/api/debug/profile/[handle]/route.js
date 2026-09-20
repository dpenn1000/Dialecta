/**
 * GET /api/debug/profile/<handle>
 *
 * Beefed-up diagnostic. Bypasses the production code path and does
 * raw Supabase queries with full error visibility, plus a connection
 * sanity check (row count) and a sample listing of handles. Tells us
 * exactly which layer is failing.
 *
 * Delete this file once Path C is fully stable.
 */

import { createClient } from '@supabase/supabase-js';

export async function GET(request, { params }) {
  const { handle } = await params;
  const normalized = (handle || '').toLowerCase().trim();

  const env_check = {
    has_supabase_url: !!process.env.SUPABASE_URL,
    has_supabase_key: !!process.env.SUPABASE_SERVICE_KEY,
    supabase_url:     process.env.SUPABASE_URL || null,
    key_length:       process.env.SUPABASE_SERVICE_KEY?.length || 0,
    key_prefix:       process.env.SUPABASE_SERVICE_KEY?.slice(0, 12) || null,
  };

  let supabase;
  try {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  } catch (err) {
    return Response.json({
      stage: 'createClient',
      error: err.message,
      env_check,
    }, { status: 500 });
  }

  // 1. Sanity check: row count of profiles. Confirms connection + auth.
  const { count, error: countErr } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 2. List first 10 profiles to see what handles are actually in the DB
  const { data: list, error: listErr } = await supabase
    .from('profiles')
    .select('ghost_member_id, handle, display_name, is_seed')
    .order('display_name', { ascending: true })
    .limit(10);

  // 3. The actual lookup we're trying to do
  const { data: byHandle, error: handleErr } = await supabase
    .from('profiles')
    .select('ghost_member_id, handle, display_name')
    .eq('handle', normalized)
    .maybeSingle();

  // 4. Same lookup but case-insensitive via ilike (in case there's a casing issue)
  const { data: byHandleIlike, error: ilikeErr } = await supabase
    .from('profiles')
    .select('ghost_member_id, handle, display_name')
    .ilike('handle', normalized)
    .maybeSingle();

  return Response.json({
    handle: normalized,
    env_check,
    sanity_count: { count, error: countErr },
    sample_handles: { list, error: listErr },
    exact_match: { byHandle, error: handleErr },
    ilike_match: { byHandleIlike, error: ilikeErr },
  });
}
