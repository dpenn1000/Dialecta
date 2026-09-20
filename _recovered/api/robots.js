/**
 * api/robots.js
 *
 * Robots.txt for Dialecta's SSR public surfaces. Reachable at `/robots.txt`
 * via the rewrite rule in vercel.json.
 *
 * Until Cloudflare path routing is in place, this file lives at
 * `dialecta.vercel.app/robots.txt`. Ghost's own robots.txt continues to
 * serve at `dialecta.org/robots.txt` via Magic Pages. When Cloudflare
 * fronts the apex, we route `/robots.txt` to this endpoint so all
 * surfaces share one consolidated robots policy that references both
 * sitemaps.
 */

export default function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).end();
  }

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Admin and machine surfaces',
    'Disallow: /api/',
    'Disallow: /dev-admin/',
    'Disallow: /quotes/',
    'Disallow: /write/',
    'Disallow: /signin',
    'Disallow: /signup',
    '',
    '# Sitemaps',
    'Sitemap: https://dialecta.org/sitemap.xml',
    'Sitemap: https://dialecta.org/sitemap-public.xml',
    '',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).send(body);
}
