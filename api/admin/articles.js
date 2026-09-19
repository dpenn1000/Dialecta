/**
 * /api/admin/articles
 *
 * GET full article directory for the /dev-admin/ Articles tab. Gated by
 * `articles.repolish` (held by Editor + Publisher). The Articles tab gives
 * a triage view across all articles with key metadata so admins can spot
 * mis-tiered or dormant pieces and trigger re-polish from the dashboard
 * (the per-post floating button on post.hbs covers single-article
 * re-polish; this is the cross-article surface).
 *
 * Response shape:
 *   {
 *     articles: [
 *       {
 *         id, ghost_post_id, status,
 *         title, slug, url, excerpt,         // from Ghost
 *         feature_image,                       // from Ghost
 *         author_member_id, author_display_name, author_avatar_url,
 *         declared_tier, ai_suggested_tier, final_tier,
 *         polish_level,
 *         created_at, updated_at,
 *         published_at,                        // from Ghost
 *         comment_count,                       // from comments table
 *         tier_mismatch,                       // declared !== final
 *       },
 *       ...
 *     ],
 *     summary: { total, published, draft, by_tier: { forum, spark, ... }, mismatched }
 *   }
 *
 * Title and slug live in Ghost (the articles table doesn't store them).
 * One bulk Ghost /posts call resolves the lot.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { verifyCapability } from '../_capabilities.js';
import { ghostAdminFetch } from '../_ghost-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyCapability(req, 'articles.repolish');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  try {
    const [articlesResult, profilesResult, commentsResult] = await Promise.all([
      supabase
        .from('articles')
        .select('id, ghost_post_id, author_member_id, status, declared_tier, ai_suggested_tier, final_tier, polish_level, created_at, updated_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('ghost_member_id, display_name, avatar_url'),
      supabase
        .from('comments')
        .select('article_id'),
    ]);

    if (articlesResult.error) throw articlesResult.error;
    if (profilesResult.error) throw profilesResult.error;

    const articles = articlesResult.data || [];

    if (articles.length === 0) {
      return res.status(200).json({ articles: [], summary: emptySummary() });
    }

    const profileByMemberId = new Map(
      (profilesResult.data || []).map((p) => [p.ghost_member_id, p]),
    );

    // Comment counts keyed by Ghost post id (comments.article_id stores the
    // Ghost post id, per the schema).
    const commentCountByPost = new Map();
    for (const row of commentsResult.data || []) {
      if (!row.article_id) continue;
      commentCountByPost.set(
        row.article_id,
        (commentCountByPost.get(row.article_id) || 0) + 1,
      );
    }

    // Bulk Ghost fetch for titles/slugs/excerpts/published_at/feature_image.
    const ghostByPostId = new Map();
    const postIds = [...new Set(articles.map((a) => a.ghost_post_id).filter(Boolean))];
    if (postIds.length > 0) {
      const chunks = chunkArray(postIds, 50);
      for (const chunk of chunks) {
        try {
          const filter = chunk.map((pid) => `id:${pid}`).join(',');
          const ghostResp = await ghostAdminFetch(
            '/posts/?filter=' + encodeURIComponent(filter) +
            '&fields=id,title,slug,url,custom_excerpt,excerpt,feature_image,published_at,status' +
            '&limit=' + Math.max(chunk.length, 1)
          );
          for (const p of ghostResp.posts || []) {
            ghostByPostId.set(p.id, p);
          }
        } catch (e) {
          console.warn('admin/articles: ghost backfill failed for chunk:', e.message);
        }
      }
    }

    const decorated = articles.map((a) => {
      const ghost  = ghostByPostId.get(a.ghost_post_id) || {};
      const author = profileByMemberId.get(a.author_member_id) || {};

      const tier_mismatch =
        a.declared_tier && a.final_tier && a.declared_tier !== a.final_tier;

      return {
        id:                  a.id,
        ghost_post_id:       a.ghost_post_id,
        status:              a.status,
        title:               ghost.title || '(untitled)',
        slug:                ghost.slug || null,
        url:                 ghost.url || null,
        excerpt:             ghost.custom_excerpt || ghost.excerpt || null,
        feature_image:       ghost.feature_image || null,
        ghost_status:        ghost.status || null,
        author_member_id:    a.author_member_id,
        author_display_name: author.display_name || null,
        author_avatar_url:   author.avatar_url || null,
        declared_tier:       a.declared_tier,
        ai_suggested_tier:   a.ai_suggested_tier,
        final_tier:          a.final_tier,
        polish_level:        a.polish_level,
        created_at:          a.created_at,
        updated_at:          a.updated_at,
        published_at:        ghost.published_at || null,
        comment_count:       commentCountByPost.get(a.ghost_post_id) || 0,
        tier_mismatch:       !!tier_mismatch,
      };
    });

    // Summary stats for the section header.
    const summary = {
      total:      decorated.length,
      published:  0,
      draft:      0,
      mismatched: 0,
      by_tier:    { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 },
    };
    for (const a of decorated) {
      if (a.status === 'published') summary.published += 1;
      else                          summary.draft += 1;
      if (a.tier_mismatch) summary.mismatched += 1;
      if (a.final_tier && summary.by_tier[a.final_tier] !== undefined) {
        summary.by_tier[a.final_tier] += 1;
      }
    }

    return res.status(200).json({ articles: decorated, summary });
  } catch (err) {
    console.error('admin/articles list error:', err);
    return res.status(500).json({ error: 'Failed to list articles', detail: err.message });
  }
}

function chunkArray(arr, n) {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function emptySummary() {
  return {
    total: 0,
    published: 0,
    draft: 0,
    mismatched: 0,
    by_tier: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 },
  };
}
