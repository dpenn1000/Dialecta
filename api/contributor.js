/**
 * api/contributor.js
 *
 * Server-side rendered contributor profile page. Reachable at
 * `/contributor/<handle>` via the rewrite rule in vercel.json.
 *
 * Phase 1.2 of the Cloudflare frontend rollout
 * (project_public_seo_architecture.md). Pulls fresh from Supabase per
 * request; HTTP cached at the edge for an hour with 24h stale-while-
 * revalidate. Returns 404 for unknown handles, 301 for handles found
 * in handle_history (SEO link continuity), and noindex for seed
 * contributors.
 *
 * Output: minimal-payload HTML with full SEO meta tags (canonical,
 * Open Graph, Twitter Card, JSON-LD Person schema). Lightweight inline
 * CSS in Dialecta's brass-on-cream palette; no React bundle, no JS.
 * Crawlers and users alike see a fully-formed page on first byte.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';
import { ghostAdminFetch } from './_ghost-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const SITE_URL = 'https://dialecta.org';

const ARCHETYPE_NOTES = {
  skeptic:       'Questions premises before accepting conclusions.',
  synthesizer:   'Finds unexpected connections across domains.',
  advocate:      'Argues the strongest version of views they disagree with.',
  builder:       'Extends ideas into practical frameworks.',
  empiricist:    'Grounds every claim in evidence and data.',
  contextualist: 'Situates ideas in their historical and cultural frame.',
  illuminator:   'Makes complex ideas accessible without losing nuance.',
  reviser:       'Publicly updates their position when given good reasons.',
};

const PILLAR_LABELS = {
  acuity:      'Acuity',
  calibration: 'Calibration',
  magnanimity: 'Magnanimity',
  discourse:   'Discourse',
  consistency: 'Consistency',
  reach:       'Reach',
};

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
  // For embedding JSON-LD safely. JSON.stringify already escapes quotes
  // for valid JSON; we escape </ to prevent script-tag breakout.
  return JSON.stringify(obj).replace(/<\/script/gi, '<\\/script');
}

function trim(s, n) {
  if (!s) return '';
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…';
}

function shortDescription(profile) {
  const bio = (profile.bio || '').trim();
  if (bio) return trim(bio, 240);
  return profile.display_name + ' is a contributor on Dialecta.';
}

// ── 404 ──────────────────────────────────────────────────────────────────

function send404(res, handle) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Contributor not found · Dialecta</title>
  <link rel="canonical" href="${SITE_URL}/contributor/${esc(handle)}">
  <style>
    body { font-family: 'Source Serif 4', Georgia, serif; background: #f7f2e8; color: #2c2620; padding: 80px 20px; text-align: center; }
    h1 { font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500; font-style: italic; color: #7a4a10; font-size: 32px; margin-bottom: 12px; }
    p { color: #5a5248; line-height: 1.7; }
    a { color: #b8862e; text-decoration: none; border-bottom: 1px dotted rgba(184,134,46,0.4); }
    a:hover { color: #7a4a10; }
  </style>
</head>
<body>
  <h1>No contributor at @${esc(handle)}</h1>
  <p>This handle is not in use on Dialecta.</p>
  <p><a href="${SITE_URL}">Return to Dialecta</a></p>
</body>
</html>`);
}

// ── Page render ──────────────────────────────────────────────────────────

function renderPage({ profile, axis, archetype, articles, comments, ghostByPost, isSeed }) {
  const url = SITE_URL + '/contributor/' + encodeURIComponent(profile.handle);
  const title = profile.display_name + ' (@' + profile.handle + ') · Dialecta';
  const description = shortDescription(profile);
  const ogImage = profile.avatar_url || (SITE_URL + '/assets/img/dialecta-og-default.png');

  const archetypeLabel = archetype ? archetype.archetype_label : 'Pattern Still Forming';
  const archetypeNote  = archetype && archetype.archetype_id ? (ARCHETYPE_NOTES[archetype.archetype_id] || '') : '';

  // Articles: enrich with Ghost titles / URLs (already pre-fetched in handler)
  const articleItems = (articles || [])
    .map((a) => {
      const ghost = ghostByPost.get(a.ghost_post_id);
      if (!ghost) return null;
      return {
        title: ghost.title,
        url: ghost.url || (SITE_URL + '/' + ghost.slug + '/'),
        publishedAt: ghost.published_at,
      };
    })
    .filter(Boolean);

  // Forum-tier comments only ("their voice in the conversation"). Top 5.
  const forumComments = (comments || [])
    .filter((c) => {
      const cls = Array.isArray(c.classifications) ? c.classifications[0] : c.classifications;
      return cls && cls.final_tier === 'forum';
    })
    .slice(0, 5);

  // JSON-LD Person schema
  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.display_name,
    alternateName: '@' + profile.handle,
    url,
  };
  if (profile.bio) personLd.description = profile.bio;
  if (profile.avatar_url) personLd.image = profile.avatar_url;
  if (articleItems.length > 0) {
    personLd.knowsAbout = []; // Could be derived from primary tags later.
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  ${isSeed ? '<meta name="robots" content="noindex">' : ''}

  <link rel="canonical" href="${esc(url)}">

  <meta property="og:type" content="profile">
  <meta property="og:title" content="${esc(profile.display_name + ' on Dialecta')}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${esc(url)}">
  <meta property="og:image" content="${esc(ogImage)}">
  <meta property="og:site_name" content="Dialecta">
  <meta property="profile:username" content="${esc(profile.handle)}">

  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${esc(profile.display_name + ' on Dialecta')}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImage)}">

  <script type="application/ld+json">${jsonAttr(personLd)}</script>

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
    main { max-width: 720px; margin: 0 auto; padding: 48px 24px 96px; }
    .profile-header { display: flex; gap: 24px; align-items: flex-start; margin-bottom: 32px; }
    .avatar {
      width: 96px; height: 96px; border-radius: 50%;
      background: var(--paper); border: 2px solid var(--border);
      flex-shrink: 0; overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 38px; font-weight: 500; color: var(--brass-mid);
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-name {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic; font-weight: 500;
      font-size: 40px; color: var(--brass-deep);
      margin: 0 0 4px; line-height: 1.1;
    }
    .profile-handle {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 13px; color: var(--tertiary);
      letter-spacing: 0.04em; margin: 0 0 12px;
    }
    .profile-meta { color: var(--soft); font-size: 14px; margin: 0; }
    .profile-bio {
      font-size: 17px; color: var(--ink);
      margin: 0 0 32px; line-height: 1.7;
    }
    .archetype {
      padding: 16px 20px; border-left: 3px solid var(--brass-mid);
      background: var(--paper); margin: 0 0 32px;
    }
    .archetype-label {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic; font-size: 22px; color: var(--brass-deep);
      margin: 0 0 4px;
    }
    .archetype-note { color: var(--soft); font-size: 14px; margin: 0; line-height: 1.6; }
    section { margin-top: 40px; }
    section h2 {
      font-family: 'DM Mono', 'Courier New', monospace;
      font-size: 11px; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--brass-mid);
      margin: 0 0 16px; font-weight: 400;
    }
    .articles ul, .comments ul { list-style: none; padding: 0; margin: 0; }
    .articles li, .comments li {
      padding: 14px 0; border-bottom: 1px solid var(--border);
    }
    .articles li:last-child, .comments li:last-child { border-bottom: 0; }
    .article-title { font-size: 18px; color: var(--ink); }
    .article-date { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--tertiary); margin-left: 8px; }
    .comment-body { color: var(--body); font-size: 15px; line-height: 1.7; margin: 0; }
    .comment-meta { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tertiary); margin-top: 6px; }
    .pillars { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }
    .pillar {
      padding: 4px 10px; border: 1px solid var(--border); border-radius: 12px;
      font-family: 'DM Mono', monospace; font-size: 10px;
      letter-spacing: 0.08em; text-transform: uppercase;
      color: var(--soft); background: var(--paper);
    }
    .empty { color: var(--tertiary); font-style: italic; font-size: 14px; }
    footer {
      max-width: 720px; margin: 64px auto 0; padding: 24px;
      border-top: 1px solid var(--border);
      font-size: 13px; color: var(--tertiary);
      text-align: center;
    }
    footer a { color: var(--soft); }
    @media (max-width: 540px) {
      main { padding: 24px 16px 64px; }
      .profile-header { flex-direction: column; gap: 16px; }
      .profile-name { font-size: 32px; }
      .avatar { width: 72px; height: 72px; font-size: 28px; }
    }
  </style>
</head>
<body>
  <header class="site-nav">
    <a href="${SITE_URL}"><span class="glyph">⁂</span>Dialecta</a>
  </header>

  <main>
    <div class="profile-header">
      <div class="avatar">
        ${profile.avatar_url
          ? `<img src="${esc(profile.avatar_url)}" alt="${esc(profile.display_name)}">`
          : esc((profile.display_name || '?').split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase())
        }
      </div>
      <div>
        <h1 class="profile-name">${esc(profile.display_name)}</h1>
        <p class="profile-handle">@${esc(profile.handle)}</p>
        ${profile.location ? `<p class="profile-meta">${esc(profile.location)}</p>` : ''}
        ${profile.order_label ? `<p class="profile-meta">Order of the ${esc(profile.order_label)}</p>` : ''}
      </div>
    </div>

    ${profile.bio ? `<p class="profile-bio">${esc(profile.bio)}</p>` : ''}

    <div class="archetype">
      <p class="archetype-label">${esc(archetypeLabel)}</p>
      ${archetypeNote ? `<p class="archetype-note">${esc(archetypeNote)}</p>` : ''}
    </div>

    ${axis && axis.length > 0 ? `
    <div class="pillars">
      ${axis
        .filter((a) => a.graduation_count > 0)
        .sort((a, b) => b.graduation_count - a.graduation_count)
        .map((a) => `<span class="pillar">${esc(PILLAR_LABELS[a.axis] || a.axis)} · ${a.graduation_count}</span>`)
        .join('')}
    </div>
    ` : ''}

    <section class="articles">
      <h2>Articles</h2>
      ${articleItems.length === 0
        ? '<p class="empty">No articles yet.</p>'
        : `<ul>${articleItems
            .map((a) => `<li><a class="article-title" href="${esc(a.url)}">${esc(a.title)}</a>${a.publishedAt ? `<span class="article-date">${esc(new Date(a.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</span>` : ''}</li>`)
            .join('')}</ul>`
      }
    </section>

    <section class="comments">
      <h2>Recognized Comments</h2>
      ${forumComments.length === 0
        ? '<p class="empty">Forum-tier comments will appear here.</p>'
        : `<ul>${forumComments
            .map((c) => {
              const ghost = ghostByPost.get(c.article_id);
              return `<li><p class="comment-body">${esc(trim(c.body || '', 280))}</p>${ghost ? `<p class="comment-meta">on <a href="${esc(ghost.url || (SITE_URL + '/' + ghost.slug + '/'))}">${esc(ghost.title)}</a></p>` : ''}</li>`;
            })
            .join('')}</ul>`
      }
    </section>
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

  const handleParam = typeof req.query.handle === 'string'
    ? req.query.handle.toLowerCase().trim()
    : '';
  if (!handleParam || !/^[a-z0-9_-]+$/.test(handleParam)) {
    return send404(res, handleParam || '');
  }

  try {
    // 1. Look up by current handle.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, ghost_member_id, handle, display_name, bio, location, avatar_url, is_seed, order_id, order_label, order_family, aspirational_archetype')
      .eq('handle', handleParam)
      .maybeSingle();

    if (!profile) {
      // 2. Check handle_history for a 301 redirect target.
      const { data: history } = await supabase
        .from('handle_history')
        .select('profile_id')
        .eq('old_handle', handleParam)
        .or('released_at.is.null,released_at.gt.' + new Date().toISOString())
        .order('changed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (history) {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('handle')
          .eq('id', history.profile_id)
          .maybeSingle();
        if (currentProfile && currentProfile.handle) {
          res.setHeader('Location', '/contributor/' + encodeURIComponent(currentProfile.handle));
          res.setHeader('Cache-Control', 'public, s-maxage=86400');
          return res.status(301).end();
        }
      }
      return send404(res, handleParam);
    }

    const memberId = profile.ghost_member_id;

    // 3. Related data fan-out.
    const [axisRes, archRes, articlesRes, commentsRes] = await Promise.all([
      supabase.from('axis_scores').select('axis, graduation_count').eq('member_id', memberId),
      supabase.from('archetypes').select('archetype_id, archetype_label').eq('member_id', memberId).maybeSingle(),
      supabase.from('articles').select('ghost_post_id, status, created_at, final_tier').eq('author_member_id', memberId).neq('status', 'draft').order('created_at', { ascending: false }).limit(20),
      supabase.from('comments').select('id, body, article_id, classifications(final_tier)').eq('member_id', memberId).eq('status', 'published').order('created_at', { ascending: false }).limit(50),
    ]);

    // 4. Bulk-fetch Ghost metadata (titles, URLs) for articles + comment-parent posts.
    const articlePostIds = (articlesRes.data || []).map((a) => a.ghost_post_id).filter(Boolean);
    const commentPostIds = (commentsRes.data || []).map((c) => c.article_id).filter(Boolean);
    const allPostIds = [...new Set([...articlePostIds, ...commentPostIds])];

    let ghostByPost = new Map();
    if (allPostIds.length > 0) {
      try {
        const ghostFilter = 'id:[' + allPostIds.join(',') + ']';
        const ghostResp = await ghostAdminFetch(
          '/posts/?filter=' + encodeURIComponent(ghostFilter) +
          '&fields=id,title,slug,url,published_at&limit=100'
        );
        ghostByPost = new Map((ghostResp.posts || []).map((p) => [p.id, p]));
      } catch (e) {
        // Non-fatal: we'll just skip article enrichment for missing posts.
        console.warn('contributor SSR Ghost fetch failed:', e.message);
      }
    }

    const html = renderPage({
      profile,
      axis: axisRes.data || [],
      archetype: archRes.data || null,
      articles: articlesRes.data || [],
      comments: commentsRes.data || [],
      ghostByPost,
      isSeed: !!profile.is_seed,
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).send(html);
  } catch (err) {
    console.error('contributor SSR error:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h1>Internal server error</h1>');
  }
}
