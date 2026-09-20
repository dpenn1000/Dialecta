/**
 * api/library.js
 *
 * Server-side rendered single-quote page for the public quote library.
 * Reachable at `/library/<quote_id>` via the rewrite rule in vercel.json.
 *
 * Phase 1.2 of the Cloudflare frontend rollout
 * (project_public_seo_architecture.md). The /quotes/ admin tool stays
 * private; /library/ is the indexable public surface. Pulls fresh from
 * Supabase per request, edge-cached for an hour with 24h stale-while-
 * revalidate.
 *
 * Output: minimal-payload HTML with SEO meta (canonical, Open Graph,
 * Twitter card, JSON-LD Quotation schema). Lightweight inline CSS in
 * Dialecta's brass-on-cream palette; no React bundle, no JS.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SITE_URL = 'https://dialecta.org';

// ── Helpers ──────────────────────────────────────────────────────────────

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonAttr(obj) {
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

function trim(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

function attrTitle(quote) {
  const head = trim(quote.text, 80);
  return quote.author ? `${quote.author}: ${head}` : head;
}

function shortDescription(quote) {
  const lead = quote.author ? `${quote.author} on Dialecta. ` : '';
  return lead + trim(quote.text, 220);
}

// ── 404 ──────────────────────────────────────────────────────────────────

function send404(res, slug) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Quote not found · Dialecta</title>
  <style>
    body { font-family: 'Source Serif 4', Georgia, serif; background: #f7f2e8; color: #2c2620; padding: 80px 20px; text-align: center; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-style: italic; color: #7a4a10; font-size: 32px; }
    a { color: #b8862e; text-decoration: none; border-bottom: 1px dotted rgba(184,134,46,0.4); }
    a:hover { color: #7a4a10; }
  </style>
</head>
<body>
  <h1>This quote isn't in the library.</h1>
  <p><a href="${SITE_URL}">Return to Dialecta</a></p>
</body>
</html>`);
}

// ── Page render ──────────────────────────────────────────────────────────

function renderPage({ quote, related }) {
  const url = SITE_URL + '/library/' + encodeURIComponent(quote.quote_id);
  const title = attrTitle(quote) + ' · Dialecta';
  const description = shortDescription(quote);
  const ogImage = SITE_URL + '/assets/img/dialecta-og-default.png';

  const quotationLd = {
    '@context': 'https://schema.org',
    '@type': 'Quotation',
    text: quote.text,
    url,
  };
  if (quote.author) {
    quotationLd.creator = { '@type': 'Person', name: quote.author };
  }
  if (quote.source) {
    quotationLd.isPartOf = {
      '@type': 'CreativeWork',
      name: quote.source,
      ...(quote.year ? { datePublished: String(quote.year) } : {}),
    };
  }

  const themeTags = (quote.tags || []).filter((t) => t.startsWith('theme-')).map((t) => t.slice(6));
  const traditionTags = (quote.tags || []).filter((t) => t.startsWith('tradition-')).map((t) => t.slice(10));

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">

  <link rel="canonical" href="${esc(url)}">

  <meta property="og:type" content="article">
  <meta property="og:title" content="${esc(attrTitle(quote))}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:site_name" content="Dialecta">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(attrTitle(quote))}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">

  <script type="application/ld+json">${jsonAttr(quotationLd)}</script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,500&family=DM+Mono&family=Source+Serif+4:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet">

  <style>
    :root {
      --cream: #f7f2e8;
      --paper: #fefcf5;
      --ink: #2c2620;
      --body: #3a342c;
      --soft: #5a5248;
      --tertiary: #8c8780;
      --brass-deep: #7a4a10;
      --brass-mid: #b8862e;
      --brass-pale: #f5dfa0;
      --border: #e0dbd2;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--cream);
      color: var(--body);
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 16px;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }
    a { color: var(--brass-mid); text-decoration: none; border-bottom: 1px dotted rgba(184,134,46,0.4); }
    a:hover { color: var(--brass-deep); }
    .site-nav {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      background: var(--cream);
    }
    .site-nav a { font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic; font-size: 22px; color: var(--brass-deep); border: 0; }
    .glyph { color: var(--brass-mid); letter-spacing: 0.3em; margin-right: 6px; }
    main { max-width: 720px; margin: 0 auto; padding: 64px 24px 96px; }
    .quote-block {
      position: relative;
      padding: 48px 32px;
      background: var(--paper);
      border-left: 3px solid var(--brass-mid);
      margin-bottom: 32px;
    }
    .quote-mark {
      position: absolute;
      top: 4px; left: 16px;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 96px;
      line-height: 1;
      color: var(--brass-pale);
      pointer-events: none;
      user-select: none;
    }
    .quote-text {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic; font-weight: 500;
      font-size: 28px; line-height: 1.45;
      color: var(--brass-deep);
      margin: 0 0 24px;
      position: relative; z-index: 1;
    }
    .quote-attribution {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 12px; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--soft);
      margin: 0;
    }
    .quote-source {
      font-family: 'Source Serif 4', Georgia, serif;
      font-style: italic; font-size: 14px;
      color: var(--tertiary); margin: 6px 0 0;
    }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 32px; }
    .tag {
      padding: 4px 10px; border: 1px solid var(--border); border-radius: 12px;
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--soft); background: var(--paper);
    }
    section h2 {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 11px; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--brass-mid);
      margin: 32px 0 16px; font-weight: 400;
    }
    .related-list { list-style: none; padding: 0; margin: 0; }
    .related-list li {
      padding: 12px 0; border-bottom: 1px solid var(--border);
    }
    .related-list li:last-child { border-bottom: 0; }
    .related-text {
      font-family: 'Source Serif 4', Georgia, serif; font-style: italic;
      font-size: 15px; color: var(--ink); display: block;
      border: 0;
    }
    .related-attr {
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--tertiary); margin-top: 4px; display: block;
    }
    footer {
      max-width: 720px; margin: 64px auto 0; padding: 24px;
      border-top: 1px solid var(--border);
      font-size: 13px; color: var(--tertiary);
      text-align: center;
    }
    footer a { color: var(--soft); }
    @media (max-width: 540px) {
      main { padding: 24px 16px 64px; }
      .quote-block { padding: 36px 20px; }
      .quote-text { font-size: 22px; }
      .quote-mark { font-size: 64px; }
    }
  </style>
</head>
<body>
  <header class="site-nav">
    <a href="${SITE_URL}"><span class="glyph">⁂</span>Dialecta</a>
  </header>

  <main>
    <article class="quote-block">
      <span class="quote-mark" aria-hidden="true">&ldquo;</span>
      <blockquote class="quote-text">${esc(quote.text)}</blockquote>
      ${quote.author ? `<p class="quote-attribution">— ${esc(quote.author)}</p>` : ''}
      ${quote.source ? `<p class="quote-source">${esc(quote.source)}${quote.year ? `, ${quote.year}` : ''}</p>` : ''}
    </article>

    ${(themeTags.length || traditionTags.length) ? `
    <div class="tags">
      ${themeTags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
      ${traditionTags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}
    </div>
    ` : ''}

    ${related && related.length > 0 ? `
    <section>
      <h2>${quote.author ? 'More from ' + esc(quote.author) : 'Related'}</h2>
      <ul class="related-list">
        ${related.map((r) => `
          <li>
            <a class="related-text" href="${SITE_URL}/library/${esc(encodeURIComponent(r.quote_id))}">${esc(trim(r.text, 160))}</a>
            ${r.source ? `<span class="related-attr">${esc(r.source)}${r.year ? `, ${r.year}` : ''}</span>` : ''}
          </li>
        `).join('')}
      </ul>
    </section>
    ` : ''}
  </main>

  <footer>
    <p><a href="${SITE_URL}/about/">About Dialecta</a> · <a href="${SITE_URL}/pact/">The Pact</a> · <a href="${SITE_URL}/guidebook/">Guidebook</a></p>
  </footer>
</body>
</html>`;
}

// ── Handler ──────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slugParam = typeof req.query.slug === 'string' ? req.query.slug.trim() : '';
  if (!slugParam || !/^[a-z0-9_-]+$/i.test(slugParam)) {
    return send404(res, slugParam || '');
  }

  try {
    const { data: quote } = await supabase
      .from('quotes')
      .select('quote_id, text, author, source, year, tags, status')
      .eq('quote_id', slugParam)
      .eq('status', 'live')
      .maybeSingle();

    if (!quote) return send404(res, slugParam);

    // "More from this author" - up to 5 other live quotes by the same author.
    let related = [];
    if (quote.author) {
      const { data } = await supabase
        .from('quotes')
        .select('quote_id, text, source, year')
        .eq('author', quote.author)
        .eq('status', 'live')
        .neq('quote_id', quote.quote_id)
        .order('created_at', { ascending: false })
        .limit(5);
      related = data || [];
    }

    const html = renderPage({ quote, related });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('library SSR error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h1>Internal server error</h1>');
  }
}
