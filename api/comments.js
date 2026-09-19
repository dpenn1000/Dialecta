/**
 * api/comments.js
 *
 * GET /api/comments?article_id=...&viewer=...
 *
 * Returns the comments + classifications for an article, shaped for the
 * Discourse Layer feed render. Two queries (comments + classifications),
 * merged in JS — avoids depending on FK-aware nested selects which may
 * not be present in the baseline Supabase schema.
 *
 * Filtering:
 *   - Seed contributors (member_id LIKE 'seed:%') are excluded by default.
 *     These are fictional fixtures from migration 002. To include them
 *     (for development/preview), pass &seed=1.
 *   - Breach-tier comments are returned with their body still present.
 *     The Discourse Layer card renders Breach-variant comments with the
 *     body suppressed and the suppression notice shown in its place.
 *     The body is sent so admin/audit views can inspect; the public card
 *     never displays it.
 *
 * Sort:
 *   Default order is created_at DESC. Client-side re-sorts to Quality
 *   (tier rank) or Most Discussed. Server returns in time order so the
 *   client has a stable base ordering.
 *
 * Response shape:
 *   {
 *     comments: [
 *       {
 *         id, body, created_at, hardened_at, malleable (bool),
 *         author: { name, member_id, subscription_tier, is_charter, is_gifted },
 *         is_own (bool, true if viewer === comment author),
 *         classification: {
 *           ai_suggested_tier, self_declared_tier, final_tier,
 *           commenter_message, specificity_score, emotion,
 *           article_engagement, opposing_view_engaged,
 *           borderline_flag, borderline_other_tier, claim_text, strength
 *         } | null,
 *         nominations: {
 *           total: number,
 *           tallies: { [tier_key]: count },   // omits zeroes
 *           viewer_nomination: { target_tier, reason_key, note } | null
 *         }
 *       },
 *       ...
 *     ]
 *   }
 *
 * Nominations are surfaced from the tier_nominations table (migration 025).
 * The community reclassification ledger; the third leg of the three-input
 * final-tier model. The feed displays `total` as the footer count chip
 * ("3 nominations") and uses `viewer_nomination` to render the panel as
 * already-submitted (receipt strip) when the viewer has nominated.
 *
 * Borderline note: borderline_flag is included in the response so the
 * client can route borderline-flagged comments into the community
 * reclassification queue. The flag MUST NOT be rendered as a public
 * label on a comment card per the design decision (compose-time
 * Growth Frame coaching only).
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_id, viewer, seed, limit } = req.query || {};

  if (!article_id || typeof article_id !== 'string') {
    return res.status(400).json({ error: 'article_id is required' });
  }

  const includeSeed = seed === '1' || seed === 'true';
  const lim = Math.max(1, Math.min(parseInt(limit, 10) || 200, 500));

  try {
    // Step 1: comments for this article.
    let query = supabase
      .from('comments')
      .select('id, member_id, member_name, body, status, published_at, hardened_at, created_at, parent_id, mentions')
      .eq('article_id', article_id)
      .order('created_at', { ascending: false })
      .limit(lim);

    if (!includeSeed) {
      // Seed members carry IDs like 'seed:maya'. Real Ghost member UUIDs
      // never match this prefix.
      query = query.not('member_id', 'like', 'seed:%');
    }

    const { data: comments, error: commentsErr } = await query;
    if (commentsErr) throw commentsErr;

    if (!comments || comments.length === 0) {
      return res.status(200).json({ comments: [] });
    }

    // Step 2: classifications for those comments.
    // `strength` is included as of migration 013 — the column now exists
    // and api/comment.js writes it on insert. Legacy rows from before the
    // migration land here as null; consumers should treat null strength
    // as "not captured" and gracefully hide the slot.
    const ids = comments.map(c => c.id);
    const { data: classifications, error: classErr } = await supabase
      .from('classifications')
      .select(`
        comment_id,
        ai_suggested_tier,
        self_declared_tier,
        final_tier,
        commenter_message,
        specificity_score,
        emotion,
        article_engagement,
        opposing_view_engaged,
        borderline_flag,
        borderline_other_tier,
        claim_text,
        strength,
        tribal_markers,
        tribal_example
      `)
      .in('comment_id', ids);
    if (classErr) throw classErr;

    const classByCommentId = {};
    for (const c of classifications || []) {
      classByCommentId[c.comment_id] = c;
    }

    // Step 2b: tier_nominations for those comments. Two pieces of data per
    // comment: the tally per target_tier (for the footer count and the
    // weighted-bars visualization) and the viewer's own nomination if any
    // (for rendering the panel as already-submitted vs. ready-to-fill).
    const { data: nominations, error: nomErr } = await supabase
      .from('tier_nominations')
      .select('comment_id, member_id, target_tier, reason_key, note')
      .in('comment_id', ids);
    if (nomErr) throw nomErr;

    const nomsByCommentId = {};
    for (const n of nominations || []) {
      const bucket = nomsByCommentId[n.comment_id] || (nomsByCommentId[n.comment_id] = {
        total:             0,
        tallies:           {},
        viewer_nomination: null,
      });
      bucket.total += 1;
      bucket.tallies[n.target_tier] = (bucket.tallies[n.target_tier] || 0) + 1;
      if (viewer && n.member_id === viewer) {
        bucket.viewer_nomination = {
          target_tier: n.target_tier,
          reason_key:  n.reason_key,
          note:        n.note,
        };
      }
    }

    // Step 2c: comment-author subscription tiers + Charter flags. Fetched
    // here so the discourse-layer chip can render the brass Underwriter
    // dot beside the commenter's name. One round-trip per article (deduped
    // by member_id), even with many comments. Missing-profile and seed
    // members fall through to free / non-Charter defaults.
    // Naming canonical: see memory project_underwriter_tier.
    const memberIds = [...new Set((comments || []).map(c => c.member_id).filter(Boolean))]
      .filter((mid) => !mid.startsWith('seed:'));
    const tierByMember = new Map();
    if (memberIds.length > 0) {
      const { data: tierProfiles, error: tierErr } = await supabase
        .from('profiles')
        .select('ghost_member_id, subscription_tier, is_charter, is_gifted')
        .in('ghost_member_id', memberIds);
      if (tierErr) {
        console.warn('Comment-author tier fetch failed:', tierErr.message);
      } else {
        for (const p of tierProfiles || []) {
          tierByMember.set(p.ghost_member_id, {
            subscription_tier: p.subscription_tier || 'free',
            is_charter:        p.is_charter === true,
            is_gifted:         p.is_gifted === true,
          });
        }
      }
    }

    // Step 3: shape the response.
    const now = Date.now();
    const shaped = comments.map(c => {
      const hardenedMs = c.hardened_at ? new Date(c.hardened_at).getTime() : 0;
      return {
        id:           c.id,
        body:         c.body,
        created_at:   c.created_at,
        hardened_at:  c.hardened_at,
        published_at: c.published_at,
        malleable:    hardenedMs > now,
        parent_id:    c.parent_id || null,
        mentions:     Array.isArray(c.mentions) ? c.mentions : [],
        author: {
          name:              c.member_name,
          member_id:         c.member_id,
          subscription_tier: tierByMember.get(c.member_id)?.subscription_tier || 'free',
          is_charter:        tierByMember.get(c.member_id)?.is_charter || false,
          is_gifted:         tierByMember.get(c.member_id)?.is_gifted || false,
        },
        is_own:        viewer ? c.member_id === viewer : false,
        classification: classByCommentId[c.id] || null,
        nominations:    nomsByCommentId[c.id] || { total: 0, tallies: {}, viewer_nomination: null },
      };
    });

    return res.status(200).json({ comments: shaped });

  } catch (error) {
    console.error('GET /api/comments error:', error);
    return res.status(500).json({
      error: 'Could not load comments',
      detail: error.message,
    });
  }
}
