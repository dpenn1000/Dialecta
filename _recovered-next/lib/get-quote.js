/**
 * Server-side quote fetcher for the SSR quote page and its OG card.
 *
 * Direct Supabase query: the slug IS the primary key (quotes.quote_id),
 * so there is no need for the two-hop pattern used in get-profile.js.
 *
 * Returns the slim public shape (no internal fields like id, created_at,
 * status, *_by) or null when the slug is missing, malformed, archived,
 * or simply not in the table. The OG image and SSR page use null as a
 * 404 signal.
 */

import { createClient } from '@supabase/supabase-js';

// Lazy-init mirrors get-profile.js: importing this module must not
// throw if env vars are absent (Vercel build phase, edge cold start,
// etc.). The first actual call is what surfaces the missing config.
let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'getQuoteBySlug: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in the environment.'
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Slug constraint mirrors the API handler in dialecta-api/api/quotes.js
// (lowercase letters, digits, hyphens; must start and end with
// alphanumeric). Anything else is invalid input, return null.
const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

export async function getQuoteBySlug(slug) {
  if (!slug || typeof slug !== 'string') return null;
  const normalized = slug.toLowerCase().trim();
  if (!SLUG_RE.test(normalized)) return null;

  try {
    const { data, error } = await getSupabase()
      .from('quotes')
      .select('quote_id, text, author, source, year, tags')
      .eq('quote_id', normalized)
      .eq('status', 'live')
      .maybeSingle();

    if (error) {
      console.error('getQuoteBySlug: query failed', error);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error('getQuoteBySlug: exception', err?.message);
    return null;
  }
}
