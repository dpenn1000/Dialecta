/**
 * api/sitemap.js
 *
 * Sitemap for Dialecta's SSR public surfaces. Reachable at
 * `/sitemap-public.xml` via the rewrite rule in vercel.json.
 *
 * Distinct from Ghost's own sitemap (which lives at /sitemap.xml on
 * Magic Pages and continues to serve articles + static pages). This
 * sitemap covers only the surfaces Vercel renders directly:
 *   - /contributor/<handle> for every user-confirmed handle (skips
 *     seeds and unconfirmed auto-generated ones).
 *   - /library/<quote_id> for every live quote.
 *
 * Both sitemaps should be submitted to Search Console.
 *
 * Cache: 1h fresh, 24h stale-while-revalidate. New profiles and quotes
 * are picked up on the next refresh; that's good enough for SEO.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SITE_URL = 'https://dialecta.org';

function escXml(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const parts = ['<url>', `<loc>${escXml(loc)}</loc>`];
  if (lastmod) parts.push(`<lastmod>${escXml(lastmod)}</lastmod>`);
  if (changefreq) parts.push(`<changefreq>${escXml(changefreq)}</changefreq>`);
  if (priority != null) parts.push(`<priority>${priority}</priority>`);
  parts.push('</url>');
  return parts.join('');
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  try {
    // Contributors: only user-confirmed handles, skip seeds.
    // Sorted by handle so the file is deterministic across revalidations.
    const { data: contributors } = await supabase
      .from('profiles')
      .select('handle, handle_set_at')
      .eq('handle_set_by_user', true)
      .eq('is_seed', false)
      .not('handle', 'is', null)
      .order('handle', { ascending: true })
      .limit(10000);

    // Quotes: every live entry.
    const { data: quotes } = await supabase
      .from('quotes')
      .select('quote_id, updated_at')
      .eq('status', 'live')
      .order('quote_id', { ascending: true })
      .limit(10000);

    const entries = [];

    for (const c of contributors || []) {
      entries.push(urlEntry({
        loc: SITE_URL + '/contributor/' + encodeURIComponent(c.handle),
        lastmod: c.handle_set_at ? c.handle_set_at.slice(0, 10) : undefined,
        changefreq: 'weekly',
        priority: 0.7,
      }));
    }

    for (const q of quotes || []) {
      entries.push(urlEntry({
        loc: SITE_URL + '/library/' + encodeURIComponent(q.quote_id),
        lastmod: q.updated_at ? q.updated_at.slice(0, 10) : undefined,
        changefreq: 'monthly',
        priority: 0.6,
      }));
    }

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + entries.join('\n')
      + '\n</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('sitemap error:', err);
    res.setHeader('Content-Type', 'text/plain');
    return res.status(500).send('Sitemap generation failed');
  }
}
