/**
 * Sitemap generator at /sitemap.xml (Next.js convention).
 *
 * Lists every public surface this project owns: contributor profiles
 * keyed by handle, and live quotes keyed by slug. Articles are NOT
 * included here — per the Public SEO architecture, /article/* stays
 * on Ghost (Magic Pages), so dialecta.org/sitemap.xml owns those.
 *
 * Cache headers are set at the route level via next.config.mjs
 * (s-maxage=3600, stale-while-revalidate=86400). Per-request execution
 * stays cheap because both queries are single-table scans on
 * indexed columns.
 */

import { createClient } from '@supabase/supabase-js';

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dialecta-next.vercel.app';

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error('sitemap: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set.');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export default async function sitemap() {
  const entries = [];

  // ── Profile surfaces (one per public handle) ──
  try {
    const { data: profiles } = await getSupabase()
      .from('profiles')
      .select('handle, updated_at')
      .not('handle', 'is', null);

    for (const p of profiles || []) {
      if (!p.handle) continue;
      entries.push({
        url:        `${SITE_BASE}/contributor/${p.handle}`,
        lastModified:    p.updated_at ? new Date(p.updated_at) : new Date(),
        changeFrequency: 'weekly',
        priority:        0.7,
      });
    }
  } catch (err) {
    console.error('sitemap: profile fetch failed:', err?.message);
  }

  // ── Quote surfaces (one per live quote) ──
  try {
    const { data: quotes } = await getSupabase()
      .from('quotes')
      .select('quote_id, updated_at')
      .eq('status', 'live');

    for (const q of quotes || []) {
      if (!q.quote_id) continue;
      entries.push({
        url:        `${SITE_BASE}/quote/${q.quote_id}`,
        lastModified:    q.updated_at ? new Date(q.updated_at) : new Date(),
        changeFrequency: 'monthly',
        priority:        0.5,
      });
    }
  } catch (err) {
    console.error('sitemap: quote fetch failed:', err?.message);
  }

  return entries;
}
