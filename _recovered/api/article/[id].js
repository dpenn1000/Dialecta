/**
 * api/article/[id].js
 *
 * Article reader endpoint. Returns combined Ghost post + Dialecta-side
 * metadata for an article. Consumed by post.hbs (via a React mount) to
 * render the declared/AI tier badges, the Stage 2.5 author note, and the
 * declaration block (Core Claim, Scope Boundary, Strongest Objection)
 * alongside the article body.
 *
 * The :id parameter is the Ghost post ID (24-char Mongo ObjectID style).
 * That is the natural URL key since Ghost owns the post-page routing.
 *
 * Response:
 *   {
 *     ghost_post: {
 *       id, title, slug, html, plaintext, custom_excerpt,
 *       published_at, updated_at, status,
 *       tags: [...], authors: [...]
 *     },
 *     dialecta: {
 *       article_id:        uuid,
 *       status:            text,
 *       declared_tier:     tier,
 *       ai_suggested_tier: tier,
 *       final_tier:        tier,
 *       declaration:       jsonb,
 *       ai_analysis:       jsonb,
 *       stage_2_5_choice:  text,
 *       author_note:       text
 *     } | null    // null for legacy articles with no Supabase row
 *   }
 *
 * Legacy articles (Maya On Doubt and Devotion, Daniel solar piece) do NOT
 * have a Supabase row. The endpoint returns dialecta: null for those, and
 * the front-end renders the article without tier badges or the
 * declaration block.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Article ID is required' });

  // ── Bulk author lookup branch ──────────────────────────────────────────
  // GET /api/article/_authors?ids=postId1,postId2,...
  // Returns { authors: { postId1: {member_id, display_name, avatar_url}, ... } }
  // Used by the article-feed cards (page-articles.hbs, index.hbs) to render
  // real author bylines without firing N round-trips. Pure Supabase lookup,
  // no Ghost call. Articles with no Supabase row are absent from the map
  // (caller falls back to the Ghost byline).
  if (id === '_authors') {
    const idsParam = typeof req.query.ids === 'string' ? req.query.ids : '';
    const ids = idsParam.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 100);
    if (ids.length === 0) return res.status(200).json({ authors: {} });
    try {
      const { data: rows, error: rowsErr } = await supabase
        .from('articles')
        .select('ghost_post_id, author_member_id')
        .in('ghost_post_id', ids);
      if (rowsErr) throw rowsErr;
      const memberIds = [...new Set((rows || []).map((r) => r.author_member_id).filter(Boolean))];
      let profileByMember = new Map();
      if (memberIds.length > 0) {
        const { data: profiles, error: profilesErr } = await supabase
          .from('profiles')
          .select('ghost_member_id, display_name, avatar_url')
          .in('ghost_member_id', memberIds);
        if (profilesErr) throw profilesErr;
        for (const p of profiles || []) profileByMember.set(p.ghost_member_id, p);
      }
      const authors = {};
      for (const row of rows || []) {
        const profile = profileByMember.get(row.author_member_id);
        if (!profile) continue;
        authors[row.ghost_post_id] = {
          member_id:    profile.ghost_member_id,
          display_name: profile.display_name,
          avatar_url:   profile.avatar_url,
        };
      }
      return res.status(200).json({ authors });
    } catch (error) {
      console.error('Bulk author lookup error:', error);
      return res.status(500).json({ error: 'Bulk author lookup failed', detail: error.message });
    }
  }

  try {
    // Fetch Ghost post and Supabase row in parallel.
    const [ghostResult, supabaseResult] = await Promise.allSettled([
      ghostAdminFetch('/posts/' + id + '/?formats=html,plaintext&include=tags,authors'),
      supabase
        .from('articles')
        .select('*')
        .eq('ghost_post_id', id)
        .maybeSingle(),
    ]);

    // Ghost result handling.
    if (ghostResult.status === 'rejected') {
      const err = ghostResult.reason;
      const status = err && err.statusCode === 404 ? 404 : 500;
      return res.status(status).json({
        error: status === 404 ? 'Ghost post not found' : 'Ghost API failure',
        detail: err && err.message ? err.message : String(err),
      });
    }

    const ghostResp = ghostResult.value;
    const ghostPost = ghostResp.posts && ghostResp.posts[0];
    if (!ghostPost) return res.status(404).json({ error: 'Ghost post not found' });

    // Supabase row handling. May not exist for legacy articles; that is
    // intentional, surface as dialecta: null rather than an error.
    let dialecta = null;
    let author = null;
    if (supabaseResult.status === 'fulfilled' && !supabaseResult.value.error && supabaseResult.value.data) {
      const row = supabaseResult.value.data;
      dialecta = {
        article_id:        row.id,
        author_member_id:  row.author_member_id,
        status:            row.status,
        declared_tier:     row.declared_tier,
        ai_suggested_tier: row.ai_suggested_tier,
        final_tier:        row.final_tier,
        declaration:       row.declaration,
        ai_analysis:       row.ai_analysis,
        stage_2_5_choice:  row.stage_2_5_choice,
        author_note:       row.author_note,
      };

      // Real-author byline lookup (Path C-lite override). All member-
      // written articles attribute to a single house Ghost staff user
      // server-side; the real author lives in articles.author_member_id
      // and is rendered on post.hbs by replacing Ghost's primary_author
      // name with this profile's display_name. The bio is included so
      // the article-bottom author block can show a short editorial bio
      // alongside name + avatar + a profile link. Legacy articles (no
      // Supabase row) keep Ghost's native byline + Ghost's bio.
      if (row.author_member_id) {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('ghost_member_id, display_name, avatar_url, bio, pact_signed_name, signature_font, subscription_tier, is_charter, is_gifted, gifted_by_member_id')
          .eq('ghost_member_id', row.author_member_id)
          .maybeSingle();
        if (profileErr) {
          console.error('Author profile fetch error for article ' + id + ':', profileErr);
        } else if (profile) {
          author = {
            member_id:        profile.ghost_member_id,
            display_name:     profile.display_name,
            avatar_url:       profile.avatar_url,
            bio:              profile.bio,
            // Pact signature surfaces as a sign-off at the end of the
            // article body. Empty when the author hasn't signed yet
            // (legacy articles, or seed authors without a Pact row).
            pact_signed_name: profile.pact_signed_name,
            signature_font:   profile.signature_font,
            // Underwriter tier surfaces the brass seal + wordmark beside
            // the byline name (post.hbs byline-override script reads
            // these). Charter swaps in the founding-cohort ring + star.
            // Honored swaps the wordmark for gifted members. See memory
            // project_underwriter_tier.
            subscription_tier:    profile.subscription_tier || 'free',
            is_charter:           profile.is_charter === true,
            is_gifted:            profile.is_gifted === true,
            gifted_by_member_id:  profile.gifted_by_member_id || null,
          };
        }
      }
    } else if (supabaseResult.status === 'fulfilled' && supabaseResult.value.error) {
      console.error('Supabase fetch error for article ' + id + ':', supabaseResult.value.error);
      // Don't fail the request; just return dialecta: null.
    }

    return res.status(200).json({
      ghost_post: ghostPost,
      dialecta,
      author,
    });
  } catch (error) {
    console.error('Article fetch error:', error);
    return res.status(500).json({
      error: 'Article fetch failed',
      detail: error.message,
    });
  }
}
