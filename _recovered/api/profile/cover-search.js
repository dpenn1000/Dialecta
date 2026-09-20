/**
 * /api/profile/cover-search?q=<query>
 *
 * Open Library proxy for the Influences editor on the profile page.
 * Returns up to 8 best matches with cover thumbnails. Filters out
 * results that have no cover image so the editor never renders a
 * "pick this — there's no cover" tile.
 *
 * Why proxy and not call Open Library from the client:
 *  - Normalize response shape (the Open Library API surface is wide;
 *    the client wants exactly { title, author, cover_url, source }).
 *  - Future provider swap (Google Books) without touching the client.
 *  - One place to add caching if/when this gets hot.
 *
 * Open Library is anonymous, no API key, CORS-open. Free.
 */

import { applyCors } from '../_cors.js';

const RESULT_LIMIT = 8;

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = String(req.query?.q ?? '').trim();
  if (!q) {
    return res.status(400).json({ error: 'q is required' });
  }
  if (q.length > 200) {
    return res.status(400).json({ error: 'q is too long' });
  }

  try {
    // Open Library returns a `docs` array. We ask for only the fields we
    // need; this also keeps the response under a sensible size. `limit`
    // here is what OL returns; we may further trim after filtering for
    // covers.
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.set('q', q);
    url.searchParams.set('limit', '20');
    url.searchParams.set('fields', 'key,title,author_name,cover_i,first_publish_year,edition_count');

    const olRes = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Dialecta/1.0 (cover-search proxy)',
      },
    });
    if (!olRes.ok) {
      return res.status(502).json({
        error: 'Cover provider error',
        detail: `Open Library returned ${olRes.status}`,
      });
    }
    const json = await olRes.json();
    const docs = Array.isArray(json?.docs) ? json.docs : [];

    const results = docs
      .filter(d => Number.isFinite(d.cover_i))
      .slice(0, RESULT_LIMIT)
      .map(d => ({
        title:     d.title || '',
        author:    Array.isArray(d.author_name) && d.author_name.length > 0 ? d.author_name[0] : '',
        cover_url: `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`,
        cover_url_large: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
        source:    'openlibrary',
        first_year: d.first_publish_year ?? null,
      }));

    // Cache for an hour at the edge — these results are deterministic per
    // query and Open Library's catalog doesn't churn meaningfully on
    // human timescales.
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    return res.status(200).json({ results });
  } catch (err) {
    console.error('cover-search error:', err);
    return res.status(500).json({
      error: 'Cover search failed',
      detail: err.message,
    });
  }
}
