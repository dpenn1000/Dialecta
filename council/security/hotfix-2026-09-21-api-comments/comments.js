/**
 * api/comments.js, narrowed. Security hotfix 2026-09-21.
 *
 * GET /api/comments?article_id=...&viewer=...
 *
 * Derived from the deployed file: SHA-1 b5db0ff357e8fd179aee2aec44e06f14b174f974 in
 * Vercel deployment dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7, recovered byte for byte at
 * _recovered/api/comments.js. Same route, same query parameters, same response
 * envelope ({ comments: [...] }), fewer fields. The reasons and the field map are in
 * council/security/hotfix-2026-09-21-api-comments/README.md.
 *
 * Deploy location: api/comments.js in a copy of the recovered tree, where ./_cors.js
 * resolves to the deployed _cors.js.
 *
 * What changed against the deployed file:
 *   1. Only status = 'published' rows, filtered in the query and again in code. The
 *      deployed file had no status filter and served pending_review and suppressed
 *      rows, bodies included, to any caller.
 *   2. A reply is sent only when its parent is also in the list. The live feed renders
 *      a reply only under a listed parent, so nothing visible is lost, and a hidden
 *      parent's id is not disclosed through parent_id.
 *   3. No member id anywhere in the response: not author.member_id, not
 *      mentions[].member_id. The legacy write endpoints accept that id as proof of
 *      identity (member_uuid).
 *   4. classification carries only what the live comment card reads:
 *      ai_suggested_tier, self_declared_tier, final_tier, specificity_score.
 *      commenter_message, claim_text, strength, emotion, article_engagement,
 *      opposing_view_engaged, borderline_flag, borderline_other_tier, tribal_markers,
 *      tribal_example and comment_id are no longer fetched or sent.
 *   5. Breach: body null, mentions empty, specificity_score null, final_tier 'breach'.
 *      A comment counts as Breach when the tier the live card would show is 'breach',
 *      or when the engine read 'breach'. The second clause covers a self-declaration
 *      overriding the engine: api/comment.js writes final_tier = self || ai, while
 *      packages/core resolveFinalTier never lets a self-declaration alone outweigh the
 *      engine (AI 0.40 against at most 0.25). Returning final_tier 'breach' makes the
 *      live card render its own suppression notice rather than an empty body.
 *   6. nominations.viewer_nomination is always null. `viewer` is unverified, and the
 *      deployed file returned the named member's tier, reason and private note to
 *      anyone who sent that member's id. total and tallies are aggregate counts and
 *      stay.
 *   7. is_own stays: a boolean, computed from `viewer`, never echoing it. It tells a
 *      caller whether the id they sent wrote a comment whose author name is already
 *      on the card, and it authorizes nothing; PATCH and DELETE on /api/comment/:id
 *      check ownership themselves.
 *   8. Errors no longer return the database error message.
 *   9. published_at is not sent. Nothing in the live theme reads it.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const PUBLISHED = 'published';
const BREACH = 'breach';

// The tier the live card shows is final_tier || self_declared_tier || ai_suggested_tier
// (post.js, function Am). Breach here is that tier, or an engine Breach read.
function isBreach(cls) {
  if (!cls) return false;
  const shown = cls.final_tier || cls.self_declared_tier || cls.ai_suggested_tier;
  return shown === BREACH || cls.ai_suggested_tier === BREACH;
}

function publicClassification(cls, breach) {
  if (!cls) return null;
  return {
    ai_suggested_tier:  cls.ai_suggested_tier ?? null,
    self_declared_tier: cls.self_declared_tier ?? null,
    final_tier:         breach ? BREACH : (cls.final_tier ?? null),
    specificity_score:  breach ? null : (cls.specificity_score ?? null),
  };
}

// Mentions keep the token the renderer matches on. The live renderer links a mention
// only when it carries member_id, so without it an @mention renders as plain text.
function publicMentions(mentions) {
  if (!Array.isArray(mentions)) return [];
  const out = [];
  for (const m of mentions) {
    if (!m || typeof m !== 'object') continue;
    const handle = typeof m.handle === 'string' && m.handle ? m.handle : null;
    const display_name = typeof m.display_name === 'string' && m.display_name ? m.display_name : null;
    if (!handle && !display_name) continue;
    out.push({ handle, display_name });
  }
  return out;
}

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
  const viewerId = typeof viewer === 'string' && viewer.length > 0 ? viewer : null;

  try {
    // Step 1: published comments for this article. member_id is read so the server can
    // join tiers and compute is_own; it is never copied into the response.
    let query = supabase
      .from('comments')
      .select('id, member_id, member_name, body, status, hardened_at, created_at, parent_id, mentions')
      .eq('article_id', article_id)
      .eq('status', PUBLISHED)
      .order('created_at', { ascending: false })
      .limit(lim);

    if (!includeSeed) {
      // Seed members carry ids like 'seed:maya'. Real Ghost member UUIDs never match.
      query = query.not('member_id', 'like', 'seed:%');
    }

    const { data: rows, error: commentsErr } = await query;
    if (commentsErr) throw commentsErr;

    // Second guard, independent of the query builder.
    const published = (rows || []).filter((c) => c && c.status === PUBLISHED);
    const listed = new Set(published.map((c) => c.id));
    const comments = published.filter((c) => !c.parent_id || listed.has(c.parent_id));

    if (comments.length === 0) {
      return res.status(200).json({ comments: [] });
    }

    const ids = comments.map((c) => c.id);

    // Step 2: the public half of each classification. Nothing else is fetched.
    const { data: classifications, error: classErr } = await supabase
      .from('classifications')
      .select('comment_id, ai_suggested_tier, self_declared_tier, final_tier, specificity_score')
      .in('comment_id', ids);
    if (classErr) throw classErr;

    const classByCommentId = {};
    for (const c of classifications || []) {
      classByCommentId[c.comment_id] = c;
    }

    // Step 2b: nomination counts per comment. Who nominated, and what they wrote, stay
    // on the server.
    const { data: nominations, error: nomErr } = await supabase
      .from('tier_nominations')
      .select('comment_id, target_tier')
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
    }

    // Step 2c: comment-author subscription tier and Charter / gifted flags, for the
    // Underwriter badge beside the author's name. Unchanged from the deployed file.
    const memberIds = [...new Set(comments.map((c) => c.member_id).filter(Boolean))]
      .filter((mid) => !String(mid).startsWith('seed:'));
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

    // Step 3: shape the response. Every field is named; nothing is spread from a row.
    const now = Date.now();
    const shaped = comments.map((c) => {
      const cls = classByCommentId[c.id] || null;
      const breach = isBreach(cls);
      const tier = tierByMember.get(c.member_id);
      const hardenedMs = c.hardened_at ? new Date(c.hardened_at).getTime() : 0;
      const noms = nomsByCommentId[c.id];
      return {
        id:          c.id,
        body:        breach ? null : c.body,
        created_at:  c.created_at,
        hardened_at: c.hardened_at,
        malleable:   hardenedMs > now,
        parent_id:   c.parent_id || null,
        mentions:    breach ? [] : publicMentions(c.mentions),
        author: {
          name:              c.member_name,
          subscription_tier: tier?.subscription_tier || 'free',
          is_charter:        tier?.is_charter || false,
          is_gifted:         tier?.is_gifted || false,
        },
        is_own:         viewerId ? c.member_id === viewerId : false,
        classification: publicClassification(cls, breach),
        nominations: {
          total:             noms ? noms.total : 0,
          tallies:           noms ? noms.tallies : {},
          viewer_nomination: null,
        },
      };
    });

    return res.status(200).json({ comments: shaped });

  } catch (error) {
    console.error('GET /api/comments error:', error);
    return res.status(500).json({ error: 'Could not load comments' });
  }
}
