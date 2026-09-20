import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';
import { createNotification } from '../_notifications.js';
import {
  isAllowedSignatureFont,
  DEFAULT_SIGNATURE_FONT,
} from '../_signature-fonts.js';
import { curateSnapshots } from '../_fp-snapshot.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Canonical archetype "Pattern" lines, taken verbatim from
// Dialecta_Contributor_Identity.md (v1.1) — single source of truth.
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

// Allowlist for the aspirational_archetype column on profiles. Same eight
// canonical IDs as ARCHETYPE_NOTES; the PATCH handler validates against
// this set so a malformed PATCH can't smuggle in a non-canonical value.
// Null is allowed (clears the aspiration).
const ALLOWED_ASPIRATIONAL_ARCHETYPES = new Set(Object.keys(ARCHETYPE_NOTES));

const AXIS_DEFAULTS = {
  acuity: 0, calibration: 0, magnanimity: 0,
  discourse: 0, consistency: 0, reach: 0,
};

const TIER_DEFAULTS = {
  forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0,
};

// Six Pillars palette — same hex values as the Fingerprint engine's AXES.
// Each connection chip is colored by the dominant pillar of its contributor's
// fingerprint, with a gradient blending into the second-strongest pillar.
// The chip becomes a visual signal of "what kind of thinker this person is"
// at a glance — Maya's blue-green chip carries the same colors that dominate
// her fingerprint petals (Calibration + Magnanimity).
const AXIS_COLORS = {
  acuity:      '#d49415',
  calibration: '#2674d4',
  magnanimity: '#3aa564',
  discourse:   '#dc5418',
  consistency: '#b8429a',
  reach:       '#a8a020',
};

// Canonical pillar order — used as the tie-breaker when two axes have the
// same graduation count, so chip colors are stable across queries.
const CANONICAL_AXIS_ORDER = [
  'acuity', 'calibration', 'magnanimity',
  'discourse', 'consistency', 'reach',
];

// Fallback for contributors who haven't earned any graduations yet.
// Reads as "this person doesn't have a fingerprint yet" — honest, not broken.
const NEUTRAL_COLOR = '#7a7068';

function computeInitials(displayName) {
  if (!displayName) return '?';
  const parts = displayName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';
}

function topTwoAxes(axisScores) {
  if (!axisScores) return null;
  const entries = CANONICAL_AXIS_ORDER
    .map(axis => [axis, axisScores[axis] ?? 0])
    .filter(([_, v]) => v > 0)
    .sort((a, b) =>
      b[1] - a[1] ||
      CANONICAL_AXIS_ORDER.indexOf(a[0]) - CANONICAL_AXIS_ORDER.indexOf(b[0])
    );
  if (entries.length === 0) return null;
  return [entries[0][0], entries[1]?.[0] ?? entries[0][0]];
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Profile ID is required' });
  }

  // GET — fetch joined profile bundle, OR if id === '_list' return the
  // full contributors directory (used by /community/). The list path is
  // routed through this endpoint instead of getting its own file so we
  // stay under the Vercel Hobby 12-function ceiling.
  if (req.method === 'GET' && id === '_list') {
    // Optional ?q= filters the directory by display_name (case-insensitive
    // substring) and caps results at 10. Used by the comment composer's
    // @-mention autocomplete; the rest of the response shape is unchanged
    // so the autocomplete picker can render avatar+archetype the same way
    // the Community page does. Empty q (or absent) returns the full
    // directory as before.
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const isAutocomplete = q.length > 0;

    try {
      // Fan out: profiles + per-axis graduation_count + archetypes.
      // Then we pivot axis_scores into a flat per-member object so the
      // frontend can compute top-two pillars for the avatar gradient
      // (same shape as buildChip below).
      let profilesQuery = supabase
        .from('profiles')
        .select('ghost_member_id, handle, display_name, bio, location, avatar_url, is_author, order_id, order_label, order_family')
        .order('display_name', { ascending: true, nullsFirst: false });
      if (isAutocomplete) {
        // Search by handle OR display_name. Pull a wider candidate pool
        // (50) so the JS-side ranking below has room to surface the
        // most useful matches in priority order, then trim to 10.
        // The handle column is lowercase by constraint (migration 029),
        // so we lowercase the query for the handle leg of the OR.
        const lc = q.toLowerCase();
        profilesQuery = profilesQuery
          .or(`handle.ilike.%${lc}%,display_name.ilike.%${q}%`)
          .not('display_name', 'is', null)
          .limit(50);
      }

      const [profilesResult, axisResult, archetypeResult] = await Promise.all([
        profilesQuery,
        supabase
          .from('axis_scores')
          .select('member_id, axis, graduation_count'),
        supabase
          .from('archetypes')
          .select('member_id, archetype_id, archetype_label'),
      ]);

      if (profilesResult.error) throw profilesResult.error;

      const axisByMember = new Map();
      for (const row of axisResult.data ?? []) {
        if (!axisByMember.has(row.member_id)) axisByMember.set(row.member_id, {});
        axisByMember.get(row.member_id)[row.axis] = row.graduation_count;
      }

      const archetypeByMember = new Map();
      for (const row of archetypeResult.data ?? []) {
        archetypeByMember.set(row.member_id, {
          id:    row.archetype_id,
          label: row.archetype_label,
        });
      }

      // Some profiles get lazy-created without name hints (e.g. the avatar
      // resolver in default.hbs hits /api/profile/<uuid> with no ?name= param)
      // and land with display_name NULL. The Community directory and the
      // /dev-admin Team grant-role picker both render those as "(no name)",
      // making members impossible to identify. Fix by consulting the Ghost
      // Admin API in bulk for any NULL-named profiles and using the Ghost
      // member name (or email local-part) as the fallback. Single round-trip.
      const ghostNamesById = new Map();
      const unnamedIds = (profilesResult.data ?? [])
        .filter((p) => !p.display_name)
        .map((p) => p.ghost_member_id);
      if (unnamedIds.length > 0) {
        try {
          const filter = unnamedIds.map((mid) => `id:${mid}`).join(',');
          const ghostResp = await ghostAdminFetch(
            '/members/?filter=' + encodeURIComponent(filter) +
            '&fields=id,name,email&limit=' + Math.max(unnamedIds.length, 1)
          );
          for (const m of ghostResp.members || []) {
            const fallback =
              (m.name && m.name.trim()) ||
              (m.email ? m.email.split('@')[0] : null);
            if (fallback) ghostNamesById.set(m.id, fallback);
          }
        } catch (e) {
          console.warn('_list display_name backfill from Ghost failed:', e.message);
        }
      }

      // Rank autocomplete results in priority order:
      //   1. handle exact match
      //   2. handle prefix
      //   3. display_name word prefix (any whitespace-separated word)
      //   4. handle contains substring
      //   5. display_name contains substring
      // Tie-break alphabetically by display_name. The full directory
      // (no q) is already alphabetical from the SQL ORDER BY above.
      let rankedProfiles = profilesResult.data ?? [];
      if (isAutocomplete) {
        const lc = q.toLowerCase();
        function score(p) {
          const h = (p.handle || '').toLowerCase();
          const n = (p.display_name || '').toLowerCase();
          if (h === lc) return 0;
          if (h && h.startsWith(lc)) return 1;
          const words = n.split(/\s+/);
          if (words.some((w) => w.startsWith(lc))) return 2;
          if (h.includes(lc)) return 3;
          if (n.includes(lc)) return 4;
          return 5;
        }
        rankedProfiles = [...rankedProfiles]
          .sort((a, b) => {
            const sa = score(a);
            const sb = score(b);
            if (sa !== sb) return sa - sb;
            return (a.display_name || '').localeCompare(b.display_name || '');
          })
          .slice(0, 10);
      }

      const contributors = rankedProfiles.map((p) => {
        const scores = axisByMember.get(p.ghost_member_id) || {};
        const top    = topTwoAxes(scores);
        return {
          ghost_member_id: p.ghost_member_id,
          handle:          p.handle ?? null,
          display_name:    p.display_name || ghostNamesById.get(p.ghost_member_id) || null,
          bio:             p.bio,
          location:        p.location,
          avatar_url:      p.avatar_url,
          is_author:       !!p.is_author,
          archetype:       archetypeByMember.get(p.ghost_member_id) || null,
          order: p.order_id
            ? { id: p.order_id, label: p.order_label, family: p.order_family }
            : null,
          color:          top ? AXIS_COLORS[top[0]] : NEUTRAL_COLOR,
          secondaryColor: top ? AXIS_COLORS[top[1]] : NEUTRAL_COLOR,
        };
      });

      return res.status(200).json({ contributors });
    } catch (error) {
      console.error('Contributors list error:', error);
      return res.status(500).json({
        error: 'Contributors list failed',
        detail: error.message,
      });
    }
  }

  // GET — Author View bundle. Returns profile + articles + Forum-tier
  // comments for a single contributor. Used by the Community page's
  // Author View mode (/community/?author=<member_id>).
  //
  // Query: ?member_id=<ghost_member_id>
  //
  // Response:
  //   {
  //     profile:     { ghost_member_id, display_name, avatar_url, bio,
  //                    location, archetype, order, color, secondaryColor,
  //                    is_author, is_seed },
  //     articles:    [{ ghost_post_id, title, slug, url, excerpt,
  //                     published_at, primary_tag, declared_tier,
  //                     ai_suggested_tier, final_tier }, ...],
  //     keyComments: [{ id, body, created_at, hardened_at,
  //                     classification, article }, ...]
  //   }
  //
  // "Key comments" v1 scope = Forum-tier only (cleanest signal, no new
  // infrastructure). Spark / Heat / etc. excluded by design. Limit 10.
  // Bumping to a scored selector lives in the future tuning engine.
  if (req.method === 'GET' && id === '_author') {
    const memberId = typeof req.query.member_id === 'string' ? req.query.member_id.trim() : '';
    if (!memberId) {
      return res.status(400).json({ error: 'member_id query param is required' });
    }

    try {
      const [profileRow, axisRows, archetypeRow, articlesRows, commentsRows] = await Promise.all([
        supabase
          .from('profiles')
          .select('ghost_member_id, display_name, bio, location, avatar_url, is_author, is_admin, is_seed, order_id, order_label, order_family, subscription_tier, is_charter, is_gifted, gifted_by_member_id')
          .eq('ghost_member_id', memberId)
          .maybeSingle(),
        supabase
          .from('axis_scores')
          .select('axis, graduation_count')
          .eq('member_id', memberId),
        supabase
          .from('archetypes')
          .select('archetype_id, archetype_label, confidence')
          .eq('member_id', memberId)
          .maybeSingle(),
        supabase
          .from('articles')
          .select('ghost_post_id, declared_tier, ai_suggested_tier, final_tier, status, created_at')
          .eq('author_member_id', memberId)
          .neq('status', 'draft')
          .order('created_at', { ascending: false }),
        supabase
          .from('comments')
          .select('id, article_id, body, created_at, hardened_at, classifications(final_tier, ai_suggested_tier, self_declared_tier, commenter_message)')
          .eq('member_id', memberId)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (profileRow.error) throw profileRow.error;
      if (!profileRow.data) {
        return res.status(404).json({ error: 'Contributor not found' });
      }

      const axisScores = {};
      for (const row of axisRows.data ?? []) {
        axisScores[row.axis] = row.graduation_count;
      }
      const top = topTwoAxes(axisScores);

      const profile = {
        ghost_member_id: profileRow.data.ghost_member_id,
        display_name:    profileRow.data.display_name,
        avatar_url:      profileRow.data.avatar_url,
        bio:             profileRow.data.bio,
        location:        profileRow.data.location,
        is_author:       !!profileRow.data.is_author,
        is_admin:        !!profileRow.data.is_admin,
        is_seed:         !!profileRow.data.is_seed,
        // Underwriter tier surfaces the brass seal + wordmark on the
        // profile h1 and gates editor capabilities (polish runs,
        // candidate count). The Charter flag swaps in the founding-cohort
        // ring + center star. The Honored flag swaps the wordmark to
        // "Honored" for members gifted a year by another member. See
        // memory project_underwriter_tier.
        subscription_tier:    profileRow.data.subscription_tier || 'free',
        is_charter:           profileRow.data.is_charter === true,
        is_gifted:            profileRow.data.is_gifted === true,
        gifted_by_member_id:  profileRow.data.gifted_by_member_id || null,
        archetype:       archetypeRow.data
          ? {
              id:    archetypeRow.data.archetype_id,
              label: archetypeRow.data.archetype_label,
              note:  ARCHETYPE_NOTES[archetypeRow.data.archetype_id] ?? null,
            }
          : null,
        order:           profileRow.data.order_id
          ? {
              id:     profileRow.data.order_id,
              label:  profileRow.data.order_label,
              family: profileRow.data.order_family,
            }
          : null,
        color:          top ? AXIS_COLORS[top[0]] : NEUTRAL_COLOR,
        secondaryColor: top ? AXIS_COLORS[top[1]] : NEUTRAL_COLOR,
      };

      // Filter to Forum-tier comments only ("their voice in the
      // conversation"). v1 scope: Forum only. Limit 10.
      const forumComments = (commentsRows.data ?? [])
        .filter((c) => {
          const cls = Array.isArray(c.classifications) ? c.classifications[0] : c.classifications;
          return cls?.final_tier === 'forum';
        })
        .slice(0, 10);

      // Bulk-fetch Ghost metadata: union of authored-article post IDs +
      // Forum-comment-parent post IDs. Single Ghost round-trip.
      const authoredPostIds = (articlesRows.data ?? []).map((a) => a.ghost_post_id);
      const commentPostIds  = forumComments.map((c) => c.article_id).filter(Boolean);
      const allPostIds      = [...new Set([...authoredPostIds, ...commentPostIds])];

      let ghostByPost = new Map();
      if (allPostIds.length > 0) {
        try {
          const ghostFilter = `id:[${allPostIds.join(',')}]`;
          const ghostResp = await ghostAdminFetch(
            '/posts/?filter=' + encodeURIComponent(ghostFilter) +
            '&include=tags&fields=id,title,slug,url,custom_excerpt,published_at&limit=100'
          );
          ghostByPost = new Map((ghostResp.posts || []).map((p) => [p.id, p]));
        } catch (e) {
          console.warn('Author View Ghost fetch failed:', e.message);
        }
      }

      // Articles. Sort by Ghost published_at (more accurate than the
      // Supabase row's created_at). Articles missing from Ghost
      // (deleted / unpublished) drop out.
      const articles = (articlesRows.data ?? [])
        .map((row) => {
          const ghost = ghostByPost.get(row.ghost_post_id);
          if (!ghost) return null;
          return {
            ghost_post_id:     row.ghost_post_id,
            title:             ghost.title,
            slug:              ghost.slug,
            url:               ghost.url,
            excerpt:           ghost.custom_excerpt || null,
            published_at:      ghost.published_at,
            primary_tag:       ghost.primary_tag
              ? { slug: ghost.primary_tag.slug, name: ghost.primary_tag.name }
              : null,
            declared_tier:     row.declared_tier,
            ai_suggested_tier: row.ai_suggested_tier,
            final_tier:        row.final_tier,
          };
        })
        .filter(Boolean)
        .sort((a, b) => (b.published_at || '').localeCompare(a.published_at || ''));

      const keyComments = forumComments
        .map((c) => {
          const ghost = ghostByPost.get(c.article_id);
          const cls = Array.isArray(c.classifications) ? c.classifications[0] : c.classifications;
          return {
            id:          c.id,
            body:        c.body,
            created_at:  c.created_at,
            hardened_at: c.hardened_at,
            classification: cls
              ? {
                  final_tier:         cls.final_tier,
                  ai_suggested_tier:  cls.ai_suggested_tier,
                  self_declared_tier: cls.self_declared_tier,
                  commenter_message:  cls.commenter_message,
                }
              : null,
            article: ghost
              ? {
                  ghost_post_id: c.article_id,
                  title:         ghost.title,
                  url:           ghost.url,
                  slug:          ghost.slug,
                }
              : null,
          };
        })
        .filter((c) => c.article);

      return res.status(200).json({ profile, articles, keyComments });
    } catch (error) {
      console.error('Author bundle error:', error);
      return res.status(500).json({
        error: 'Author bundle failed',
        detail: error.message,
      });
    }
  }

  // GET — Profile Live Feed. Returns a single mixed array of items, each
  // tagged with `type` ∈ { article | identity | spotlight | topology }.
  // Personalization comes from the optional ?viewer=<ghost_member_id>; when
  // present, items where the subject is in the viewer's follow graph are
  // tagged relationship='source' (which the renderer can promote). Empty
  // viewer = cold-start, all items are global-public only.
  //
  // The four content types per Dialecta_Social_UX_Architecture.md:
  //   Article (Hot+Relevant)         — Forum-tier-weighted score over last 30d
  //   Identity Event                  — feed_events excluding forum_thread_spotlight
  //   Thread Spotlight                — feed_events.event_type='forum_thread_spotlight'
  //   Opinion Map Topology Change    — v1: empty array (computation deferred to v1.5)
  if (req.method === 'GET' && id === '_feed') {
    const viewer = typeof req.query.viewer === 'string' ? req.query.viewer : '';
    const limit  = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

    try {
      // Step 1: viewer's follows (for relationship-tagging + future
      // followers-only event visibility). Empty array if no viewer.
      const followsResult = viewer
        ? await supabase.from('follows').select('followee_id').eq('follower_id', viewer)
        : { data: [] };
      const followedIds = new Set((followsResult.data || []).map((f) => f.followee_id));

      // Step 2: parallel-fan-out the heavy queries.
      //  - feed_events: public visibility only in v1. Followers-only filter
      //    can layer in once we have followers-only events to surface.
      //  - classifications JOIN comments: aggregate per-article tier counts
      //    over last 30 days for the Hot ranking.
      //  - profiles + archetypes + axis_scores: directory data we'll join
      //    against subject member_ids and article author_member_ids.
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();

      const [
        eventsResult,
        classificationsResult,
        profilesResult,
        archetypesResult,
        axisResult,
      ] = await Promise.all([
        supabase
          .from('feed_events')
          .select('id, event_type, primary_member_id, secondary_member_id, reference_id, display_payload, created_at')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('classifications')
          .select('final_tier, comments!inner(article_id, status, published_at)')
          .eq('comments.status', 'published')
          .gte('comments.published_at', thirtyDaysAgo)
          .limit(2000),
        supabase
          .from('profiles')
          .select('ghost_member_id, display_name, avatar_url, is_seed, order_id, order_label'),
        supabase
          .from('archetypes')
          .select('member_id, archetype_id, archetype_label'),
        supabase
          .from('axis_scores')
          .select('member_id, axis, graduation_count'),
      ]);

      if (eventsResult.error)         throw eventsResult.error;
      if (classificationsResult.error) throw classificationsResult.error;
      if (profilesResult.error)       throw profilesResult.error;

      // Step 3: index the directory data once for fast lookup.
      const profileByMember = new Map();
      for (const p of profilesResult.data || []) {
        profileByMember.set(p.ghost_member_id, p);
      }
      const archetypeByMember = new Map();
      for (const a of archetypesResult.data || []) {
        archetypeByMember.set(a.member_id, { id: a.archetype_id, label: a.archetype_label });
      }
      const axisByMember = new Map();
      for (const row of axisResult.data || []) {
        if (!axisByMember.has(row.member_id)) axisByMember.set(row.member_id, {});
        axisByMember.get(row.member_id)[row.axis] = row.graduation_count;
      }

      function authorBundle(memberId) {
        const p = profileByMember.get(memberId);
        if (!p) return null;
        const top = topTwoAxes(axisByMember.get(memberId));
        return {
          member_id:      p.ghost_member_id,
          display_name:   p.display_name,
          avatar_url:     p.avatar_url,
          archetype:      archetypeByMember.get(memberId) || null,
          color:          top ? AXIS_COLORS[top[0]] : NEUTRAL_COLOR,
          secondaryColor: top ? AXIS_COLORS[top[1]] : NEUTRAL_COLOR,
        };
      }

      // Step 4: aggregate tier counts per article and compute hot_score.
      // TUNING: tier weights below encode platform values into Hot ranking.
      // Forum=5, Spark=3, Echo=1, Fog=0, Heat=-1, Stance=-2, Breach=-100
      // (effectively disqualifying). Surface in the future tuning engine.
      const TIER_WEIGHTS = {
        forum: 5, spark: 3, echo: 1, fog: 0, heat: -1, stance: -2, breach: -100,
      };
      const ZERO_COUNTS = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 };

      const tierByArticle = new Map();
      for (const row of classificationsResult.data || []) {
        const articleId = row.comments?.article_id;
        if (!articleId || !row.final_tier) continue;
        if (!tierByArticle.has(articleId)) {
          tierByArticle.set(articleId, { ...ZERO_COUNTS });
        }
        const counts = tierByArticle.get(articleId);
        if (row.final_tier in counts) counts[row.final_tier]++;
      }

      // Pull recent published Dialecta articles. This is the cold-start
      // fallback list — without it, articles with no classified comments
      // never appear in the feed (Hot score sits at 0 with no signal).
      // We layer the per-article tier counts on top: articles with active
      // discussion sort above their cold-start peers via hot_score; ties
      // and zero-score articles fall back to recency.
      const recentArticlesResult = await supabase
        .from('articles')
        .select('ghost_post_id, author_member_id, declared_tier, final_tier, created_at')
        .neq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(20);
      const recentArticles = recentArticlesResult.data || [];

      // TUNING: small additive jitter applied to each article's hot_score
      // before sorting, so equal-score articles (especially the cold-start
      // cohort sitting at exactly 0) don't reproduce the same order on
      // every visit. Jitter magnitude is small enough that a clear hot
      // signal still wins decisively; large enough that adjacent ranks
      // shuffle naturally across visits. Per-visit randomness only —
      // server has no notion of session continuity. Surface SCORE_JITTER
      // in the future tuning engine.
      const SCORE_JITTER = 1.5;

      const hotArticleScores = recentArticles
        .map((row) => {
          const counts = tierByArticle.get(row.ghost_post_id) || { ...ZERO_COUNTS };
          let hot_score = 0;
          for (const t of Object.keys(counts)) hot_score += (TIER_WEIGHTS[t] || 0) * counts[t];
          const comment_count = Object.values(counts).reduce((s, c) => s + c, 0);
          const sort_score   = hot_score + (Math.random() - 0.5) * SCORE_JITTER;
          return {
            ghost_post_id:    row.ghost_post_id,
            article_row:      row,
            counts,
            hot_score,
            sort_score,
            comment_count,
          };
        })
        // Pure score-DESC sort. Highest hot_score wins; jitter resolves
        // ties without falling back to recency.
        .sort((a, b) => b.sort_score - a.sort_score)
        .slice(0, 8);

      // Step 5: join recent + Hot articles with Ghost-side metadata.
      let articleItems = [];
      if (hotArticleScores.length > 0) {
        const hotIds = hotArticleScores.map((a) => a.ghost_post_id);

        const articleByPost = new Map(
          hotArticleScores.map((a) => [a.ghost_post_id, a.article_row])
        );

        // Ghost titles + URL + tag come from the Admin API. Filter syntax
        // accepts a comma-separated id list. One round-trip for all hot
        // articles regardless of count.
        let ghostByPost = new Map();
        try {
          const ghostFilter = `id:[${hotIds.join(',')}]`;
          const ghostResp = await ghostAdminFetch(
            '/posts/?filter=' + encodeURIComponent(ghostFilter) + '&include=tags,authors&limit=20'
          );
          ghostByPost = new Map((ghostResp.posts || []).map((p) => [p.id, p]));
        } catch (e) {
          // Don't fail the whole feed if Ghost is down. Just skip article enrichment.
          console.warn('Ghost fetch failed for hot articles:', e.message);
        }

        articleItems = hotArticleScores
          .map((h) => {
            const ghost = ghostByPost.get(h.ghost_post_id);
            const dialecta = articleByPost.get(h.ghost_post_id);
            if (!ghost) return null;
            return {
              type:               'article',
              ghost_post_id:      h.ghost_post_id,
              title:              ghost.title,
              url:                ghost.url,
              published_at:       ghost.published_at,
              primary_tag:        ghost.primary_tag
                ? { slug: ghost.primary_tag.slug, name: ghost.primary_tag.name }
                : null,
              author:             dialecta ? authorBundle(dialecta.author_member_id) : null,
              declared_tier:      dialecta?.declared_tier ?? null,
              final_tier:         dialecta?.final_tier ?? null,
              tier_distribution:  h.counts,
              hot_score:          h.hot_score,
              comment_count:      h.comment_count,
            };
          })
          .filter(Boolean);
      }

      // Step 6: split feed_events into Identity Events and Thread Spotlights.
      // is_seed contributors stay in the feed for v1 so seed-driven dev
      // surfaces have content. TUNING: add `&& !subject?.is_seed` filter
      // once real-user volume justifies hiding seed events from public feeds.
      const identityItems = [];
      const spotlightItems = [];
      for (const ev of eventsResult.data || []) {
        const subjectProfile = profileByMember.get(ev.primary_member_id);
        const item = {
          event_id:               ev.id,
          event_type:             ev.event_type,
          subject:                subjectProfile ? authorBundle(ev.primary_member_id) : null,
          secondary_member_id:    ev.secondary_member_id,
          reference_id:           ev.reference_id,
          display_payload:        ev.display_payload || {},
          relationship_to_viewer:
            !viewer                                ? null  :
            viewer === ev.primary_member_id        ? 'self' :
            followedIds.has(ev.primary_member_id)  ? 'source' :
            null,
          created_at:             ev.created_at,
        };
        if (ev.event_type === 'forum_thread_spotlight') {
          item.type = 'spotlight';
          spotlightItems.push(item);
        } else {
          item.type = 'identity';
          identityItems.push(item);
        }
      }

      // Step 7: opinion map topology changes — deferred to v1.5. Empty
      // array preserves the four-content-type API shape for the renderer.
      const topologyItems = [];

      // Step 8: merge into a single feed. Sort by recency for v1.
      // TUNING: priority weighting (Identity-in-network > Spotlight >
      // Article > Topology) lives in the future tuning engine; v1 is
      // strict reverse-chronological, which the user signed off on.
      const merged = [...articleItems, ...identityItems, ...spotlightItems, ...topologyItems];
      merged.sort((a, b) => {
        const at = a.published_at || a.created_at || '';
        const bt = b.published_at || b.created_at || '';
        return bt.localeCompare(at);
      });

      return res.status(200).json({
        items:              merged.slice(0, limit),
        viewer_has_network: followedIds.size > 0,
      });
    } catch (error) {
      console.error('Feed error:', error);
      return res.status(500).json({
        error:  'Feed fetch failed',
        detail: error.message,
      });
    }
  }

  // GET — handle availability check.
  // Public, read-only. Used by the profile edit field and the forced
  // handle-setup modal to validate as the user types. Returns reasons
  // when not available so the UI can show specific feedback.
  //
  // Query: ?handle=<candidate>&exclude=<ghost_member_id (optional)>
  //
  // Response: { available: bool, reasons: string[], normalized: string }
  // Reason codes: too_short, too_long, invalid_format, reserved, taken, cooldown.
  if (req.method === 'GET' && id === '_check_handle') {
    const raw = typeof req.query.handle === 'string' ? req.query.handle : '';
    const exclude = typeof req.query.exclude === 'string' ? req.query.exclude : '';
    const normalized = raw.toLowerCase().trim();

    const reasons = [];
    if (normalized.length < 5) reasons.push('too_short');
    if (normalized.length > 24) reasons.push('too_long');
    if (normalized.length > 0 &&
        !/^[a-z0-9]([a-z0-9]|[_-][a-z0-9])*$/.test(normalized)) {
      reasons.push('invalid_format');
    }

    if (reasons.length === 0) {
      try {
        const { data: reserved } = await supabase
          .from('reserved_handles')
          .select('handle')
          .eq('handle', normalized)
          .maybeSingle();
        if (reserved) reasons.push('reserved');

        let takenQuery = supabase
          .from('profiles')
          .select('ghost_member_id')
          .eq('handle', normalized);
        if (exclude) takenQuery = takenQuery.neq('ghost_member_id', exclude);
        const { data: taken } = await takenQuery.maybeSingle();
        if (taken) reasons.push('taken');

        let myProfileId = null;
        if (exclude) {
          const { data: own } = await supabase
            .from('profiles')
            .select('id')
            .eq('ghost_member_id', exclude)
            .maybeSingle();
          myProfileId = own?.id ?? null;
        }
        let cooldownQuery = supabase
          .from('handle_history')
          .select('id')
          .eq('old_handle', normalized)
          .or('released_at.is.null,released_at.gt.' + new Date().toISOString())
          .limit(1);
        if (myProfileId) cooldownQuery = cooldownQuery.neq('profile_id', myProfileId);
        const { data: cooldown } = await cooldownQuery;
        if (cooldown && cooldown.length > 0) reasons.push('cooldown');
      } catch (error) {
        console.error('check_handle error:', error);
        return res.status(500).json({
          error: 'Availability check failed',
          detail: error.message,
        });
      }
    }

    return res.status(200).json({
      available: reasons.length === 0,
      reasons,
      normalized,
    });
  }

  // GET _self_snapshot — Self-Snapshot Engine three-voice composition.
  //
  // Returns the data needed to render the three voices on the contributor's
  // profile per Growth Layer Principle 6:
  //
  //   voice1_history    — Latest self_description per prompt_id.
  //                       Caller renders against the prompt library
  //                       (defined in theme/src/dialecta-self-snapshot.jsx).
  //   voice2_indicators — Per-pillar { graduation_count, tier_mix } from
  //                       axis_scores. Caller composes the "signal not
  //                       verdict" copy register at render time.
  //   voice3_signals    — Aggregate community reflection (nomination count
  //                       on this contributor's comments).
  //   current_aspiration — The contributor's active aspiration row, if any.
  //                       Drives the "Declared" surface placement.
  //
  // Query: ?member_id=<ghost_member_id>
  //
  // Service-role fetch; rendering decides what to display based on the
  // sparse states. No visibility gating yet — visibility flags are deferred
  // to Phase 5.1b.
  if (req.method === 'GET' && id === '_self_snapshot') {
    const memberId = typeof req.query.member_id === 'string' ? req.query.member_id.trim() : '';
    if (!memberId) {
      return res.status(400).json({ error: 'member_id query param is required' });
    }

    try {
      const [
        descriptionsRes,
        axisScoresRes,
        nominationsRes,
        aspirationRes,
      ] = await Promise.all([
        // Voice 1: all self-descriptions, ordered newest-first; we'll
        // dedupe to the latest per prompt_id in JS.
        supabase
          .from('self_descriptions')
          .select('prompt_id, statement_verbatim, recorded_at')
          .eq('member_id', memberId)
          .order('recorded_at', { ascending: false }),

        // Voice 2: per-pillar state.
        supabase
          .from('axis_scores')
          .select('axis, graduation_count, tier_mix, comment_count, last_updated')
          .eq('member_id', memberId),

        // Voice 3: count nominations on this contributor's comments.
        // Two-step because we need the contributor's comment ids first.
        (async () => {
          const { data: commentRows, error: commErr } = await supabase
            .from('comments')
            .select('id')
            .eq('member_id', memberId);
          if (commErr) throw commErr;
          const commentIds = (commentRows || []).map((c) => c.id);
          if (commentIds.length === 0) return { count: 0 };
          const { count, error: nomErr } = await supabase
            .from('tier_nominations')
            .select('id', { count: 'exact', head: true })
            .in('comment_id', commentIds);
          if (nomErr) throw nomErr;
          return { count: count || 0 };
        })(),

        // Active aspiration if any.
        (async () => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('current_aspiration_id')
            .eq('ghost_member_id', memberId)
            .maybeSingle();
          if (!profile?.current_aspiration_id) return null;
          const { data: asp } = await supabase
            .from('aspirations')
            .select('*')
            .eq('id', profile.current_aspiration_id)
            .maybeSingle();
          return asp || null;
        })(),
      ]);

      if (descriptionsRes.error) throw descriptionsRes.error;
      if (axisScoresRes.error)    throw axisScoresRes.error;

      // Dedupe self_descriptions to the latest per prompt_id, plus return
      // the full history per prompt for revisions display.
      const latestPerPrompt = new Map();
      const historyPerPrompt = new Map();
      for (const row of descriptionsRes.data || []) {
        if (!latestPerPrompt.has(row.prompt_id)) {
          latestPerPrompt.set(row.prompt_id, row);
        }
        if (!historyPerPrompt.has(row.prompt_id)) historyPerPrompt.set(row.prompt_id, []);
        historyPerPrompt.get(row.prompt_id).push(row);
      }
      const voice1_history = Array.from(latestPerPrompt.entries()).map(([prompt_id, latest]) => ({
        prompt_id,
        latest,
        revision_count: historyPerPrompt.get(prompt_id).length,
      }));

      // Voice 2: structure per-pillar payload, including tier_mix and
      // graduation count. Caller composes the narrative phrase.
      const voice2_indicators = (axisScoresRes.data || []).map((row) => ({
        axis: row.axis,
        graduation_count: row.graduation_count || 0,
        tier_mix: row.tier_mix || { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 },
        comment_count: row.comment_count || 0,
        last_updated: row.last_updated,
      }));

      // Voice 3: bare counts; caller phrases.
      const voice3_signals = {
        nomination_count: nominationsRes?.count || 0,
      };

      return res.status(200).json({
        voice1_history,
        voice2_indicators,
        voice3_signals,
        current_aspiration: aspirationRes,
      });
    } catch (error) {
      console.error('self_snapshot fetch error:', error);
      return res.status(500).json({
        error:  'Self-snapshot fetch failed',
        detail: error.message,
      });
    }
  }

  // POST _self_description — Add a new entry to self_descriptions.
  //
  // Voice 1 submissions never overwrite (Principle 6 — verbatim history is
  // canonical). Multiple entries per (member, prompt_id) accumulate over
  // time so the contributor sees their evolution.
  //
  // Body: { member_uuid, prompt_id, statement_verbatim }
  //
  // Auth: member_uuid must match an existing profile. Cross-member writes
  // are rejected.
  if (req.method === 'POST' && id === '_self_description') {
    const { member_uuid, prompt_id, statement_verbatim } = req.body || {};
    if (!member_uuid || typeof member_uuid !== 'string') {
      return res.status(400).json({ error: 'member_uuid is required' });
    }
    if (!prompt_id || typeof prompt_id !== 'string') {
      return res.status(400).json({ error: 'prompt_id is required' });
    }
    if (!statement_verbatim || typeof statement_verbatim !== 'string') {
      return res.status(400).json({ error: 'statement_verbatim is required' });
    }
    const trimmed = statement_verbatim.trim();
    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'statement_verbatim cannot be empty after trimming' });
    }
    if (trimmed.length > 5000) {
      return res.status(400).json({ error: 'statement_verbatim exceeds 5000 character limit' });
    }

    try {
      // Verify the member_uuid resolves to a profile.
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('ghost_member_id')
        .eq('ghost_member_id', member_uuid)
        .maybeSingle();
      if (profileErr) throw profileErr;
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found for member_uuid' });
      }

      const { data: inserted, error: insertErr } = await supabase
        .from('self_descriptions')
        .insert({
          member_id:          profile.ghost_member_id,
          prompt_id,
          statement_verbatim: trimmed,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      return res.status(201).json({ entry: inserted });
    } catch (error) {
      console.error('self_description POST error:', error);
      return res.status(500).json({
        error:  'Self-description submission failed',
        detail: error.message,
      });
    }
  }

  // GET _snapshots — Growth History Scroll data feed.
  //
  // Returns curated fp_snapshots for the contributor, plus compression
  // annotations between adjacent surfaced entries, plus a lightweight
  // timeline of every captured event (surfaced + absorbed) for the
  // synced cursor visualization. Curation algorithm v1 in
  // api/_fp-snapshot.js#curateSnapshots — captures the spirit of the
  // dynamic-timeline spec without the full 5-subscore percentile
  // normalization (refinement deferred). Cap is 8 visible entries.
  //
  // Query: ?member_id=<ghost_member_id>
  // Response: {
  //   total_captured: int,
  //   surfaced:       [snapshot, ...],            // chronological ASC
  //   gaps:           [{between, absorbed_count, annotation}],
  //   timeline:       [{id, captured_at, reason, surfaced}],
  // }
  //
  // Service-role fetch; does not enforce visibility (the caller decides
  // whether to render based on profile.snapshot_visibility once the
  // visibility flag exists; for now Phase 4 fetches own-profile data only).
  if (req.method === 'GET' && id === '_snapshots') {
    const memberId = typeof req.query.member_id === 'string' ? req.query.member_id.trim() : '';
    if (!memberId) {
      return res.status(400).json({ error: 'member_id query param is required' });
    }
    try {
      const { data: snapshots, error } = await supabase
        .from('fp_snapshots')
        .select('id, member_id, captured_at, reason, fingerprint_data, archetype_at_capture, aspiration_at_capture, png_url, annotation, annotation_generated_at, created_at')
        .eq('member_id', memberId)
        .order('captured_at', { ascending: true });
      if (error) throw error;

      const curated = curateSnapshots(snapshots || []);
      return res.status(200).json(curated);
    } catch (error) {
      console.error('snapshots fetch error:', error);
      return res.status(500).json({
        error:  'Snapshots fetch failed',
        detail: error.message,
      });
    }
  }

  // GET — fetch joined profile bundle (single member by id)
  if (req.method === 'GET') {
    try {
      // is_seed filter applies at list-level endpoints, not single-profile fetch.
      // Maya/Wen/Anselm are reachable by ID intentionally for dev access.
      let profile = null;
      {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('ghost_member_id', id)
          .maybeSingle();
        if (error) throw error;
        profile = data;
      }

      // ── Self-heal pass for incomplete profile rows ─────────────────
      // When the row exists but display_name is null (created from a
      // lazy-create path that didn't have hints, or from a code path
      // that predated the Ghost-API fallback), try to backfill from
      // Ghost on every fetch. Once filled, this branch is a no-op
      // forever. Best-effort: failures are non-fatal — the profile
      // is still served, just unhealed this round.
      //
      // Only fires when the data IS missing, so no extra cost on
      // healthy rows. Single Ghost round-trip per missing-name fetch.
      if (profile && (!profile.display_name || !profile.avatar_url)) {
        try {
          const ghostResp = await ghostAdminFetch(
            '/members/?filter=' + encodeURIComponent('uuid:' + id) +
            '&fields=id,uuid,name,email,avatar_image&limit=1'
          );
          const m = ghostResp && ghostResp.members && ghostResp.members[0];
          if (m) {
            const updates = {};
            if (!profile.display_name) {
              const nameFromGhost =
                (m.name && m.name.trim()) ||
                (m.email ? m.email.split('@')[0] : null);
              if (nameFromGhost) updates.display_name = nameFromGhost;
            }
            if (
              !profile.avatar_url &&
              m.avatar_image &&
              !m.avatar_image.includes('d=blank')
            ) {
              updates.avatar_url = m.avatar_image;
            }
            if (Object.keys(updates).length > 0) {
              const { error: healErr } = await supabase
                .from('profiles')
                .update(updates)
                .eq('ghost_member_id', id);
              if (!healErr) Object.assign(profile, updates);
            }
          }
        } catch (e) {
          console.warn('Profile self-heal failed for', id, e.message);
        }
      }

      if (!profile) {
        // Lazy-create the Supabase row on first profile-API hit. New Ghost
        // members don't have a row until something requests one. Idempotent
        // under concurrent first-hits via ON CONFLICT DO NOTHING. The theme
        // may pass ?name=, ?avatar=, ?email= hints from data-member-*
        // attributes on own-profile fetches; cross-profile views omit them.
        //
        // display_name fallback chain (so a fresh invitee never lands on
        // a NULL display_name and immediately hits the comment-compose
        // setup gate):
        //   1. ?name= hint (Ghost member name when set)
        //   2. ?email= hint local-part (`rylie@example.com` → `rylie`)
        //   3. null (rare — only when both name and email are absent)
        // The user can edit the auto-seeded name from /profile/ at any time.
        const { name, avatar, email } = req.query;
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        let display_name = trimmedName || null;
        let avatar_url   = typeof avatar === 'string' && avatar ? avatar : null;
        if (!display_name && typeof email === 'string') {
          const at = email.indexOf('@');
          if (at > 0) display_name = email.slice(0, at);
        }
        // Last-resort name fallback: ask Ghost directly. Avoids the
        // "(no name)" trail from background fetches (avatar resolver, drawer
        // populator) that lazy-create profiles without name hints. Best-effort;
        // failures are non-fatal and the profile is still created without a name.
        //
        // 2026-05-06 fix: Ghost's GET /members/<id>/ expects the legacy 24-hex
        // ObjectID. For modern UUID-keyed members (everyone signed up after
        // Ghost's UUID migration), that endpoint returns 404 silently and the
        // catch swallowed it, so display_name remained null. Switched to the
        // filter syntax `?filter=uuid:<id>` which works for both UUID and
        // ObjectID inputs (Ghost handles either format on the filter).
        if (!display_name) {
          try {
            const ghostResp = await ghostAdminFetch(
              '/members/?filter=' + encodeURIComponent('uuid:' + id) +
              '&fields=id,uuid,name,email,avatar_image&limit=1'
            );
            const m = ghostResp && ghostResp.members && ghostResp.members[0];
            if (m) {
              display_name =
                (m.name && m.name.trim()) ||
                (m.email ? m.email.split('@')[0] : null);
              // Skip d=blank gravatars — those resolve to a transparent png
              // and aren't an actual photo. The merge layer in
              // dialecta-profile-data.js falls back to ghost.avatar_image
              // at runtime for own-profile views regardless.
              if (!avatar_url && m.avatar_image && !m.avatar_image.includes('d=blank')) {
                avatar_url = m.avatar_image;
              }
            }
          } catch (e) {
            console.warn('Lazy-create Ghost lookup failed for member', id, e.message);
          }
        }
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            {
              ghost_member_id: id,
              display_name,
              avatar_url,
            },
            { onConflict: 'ghost_member_id', ignoreDuplicates: true }
          );
        if (upsertError) throw upsertError;

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('ghost_member_id', id)
          .maybeSingle();
        if (error) throw error;
        profile = data;
        if (!profile) return res.status(500).json({ error: 'Profile lazy-create failed' });
      }

      const warnings = [];

      // Fan out joined queries in parallel:
      //   - axis_scores: per-pillar graduation counts
      //   - archetypes: single canonical archetype (member_id UNIQUE)
      //   - comments + classifications: stats + tierCounts
      //   - follows (×2): inbound (readers) and outbound (sources)
      //   - sparring_partners (×2): rows where viewer is member_a vs member_b,
      //     filtered to mutual visibility opt-in (visibility_a AND visibility_b).
      //     The schema's RLS policy enforces the same constraint, but we
      //     query as service role and apply it explicitly so the API and
      //     RLS agree on what's "publicly visible."
      // tier_mix per axis intentionally omitted from axis_scores — wired
      // when the fingerprint renderer consumes it for petal texture.
      const [
        axisResult,
        archetypeResult,
        commentsResult,
        followersResult,
        followingResult,
        sparringAResult,
        sparringBResult,
        rolesResult,
        capsResult,
      ] = await Promise.all([
        supabase
          .from('axis_scores')
          .select('axis, graduation_count')
          .eq('member_id', id),

        supabase
          .from('archetypes')
          .select('archetype_id, archetype_label, confidence')
          .eq('member_id', id)
          .maybeSingle(),

        supabase
          .from('comments')
          .select('article_id, classifications(final_tier)')
          .eq('member_id', id),

        supabase
          .from('follows')
          .select('follower_id')
          .eq('followee_id', id),

        supabase
          .from('follows')
          .select('followee_id')
          .eq('follower_id', id),

        supabase
          .from('sparring_partners')
          .select('member_b, article_count')
          .eq('member_a', id)
          .eq('visibility_a', true)
          .eq('visibility_b', true),

        supabase
          .from('sparring_partners')
          .select('member_a, article_count')
          .eq('member_b', id)
          .eq('visibility_a', true)
          .eq('visibility_b', true),

        // RBAC layer (migration 017_admin_rbac):
        //   profile_admin_roles            — active role grants, expiry-filtered here
        //   profile_effective_capabilities — view; already excludes expired role
        //                                    grants and capability overrides
        supabase
          .from('profile_admin_roles')
          .select('role_id')
          .eq('profile_id', profile.id)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`),

        supabase
          .from('profile_effective_capabilities')
          .select('capability_id')
          .eq('profile_id', profile.id),
      ]);

      // axis_scores → flat object keyed by canonical pillar name. Engine
      // v2.0.0 consumes these names directly — no translation layer.
      const axisScores = { ...AXIS_DEFAULTS };
      if (axisResult.error) {
        console.error('axis_scores fetch error:', axisResult.error);
        warnings.push('axis_scores_unavailable');
      } else {
        for (const row of axisResult.data ?? []) {
          axisScores[row.axis] = row.graduation_count;
        }
      }

      // archetype → { id, label, note } or null (front-end falls back to
      // 'Pattern Still Forming' when null).
      let archetype = null;
      if (archetypeResult.error) {
        console.error('archetypes fetch error:', archetypeResult.error);
        warnings.push('archetype_unavailable');
      } else if (archetypeResult.data) {
        const row = archetypeResult.data;
        archetype = {
          id:    row.archetype_id,
          label: row.archetype_label,
          note:  ARCHETYPE_NOTES[row.archetype_id] ?? null,
        };
      }

      // stats — aggregated from comments + classifications join in JS.
      // nominatedUp/Down stay 0 until comment_votes table is added.
      const stats = {
        totalComments:   0,
        articlesEngaged: 0,
        nominatedUp:     0,
        nominatedDown:   0,
        tierCounts:      { ...TIER_DEFAULTS },
        forumPct:        0,
      };
      if (commentsResult.error) {
        console.error('comments/stats fetch error:', commentsResult.error);
        warnings.push('stats_unavailable');
      } else {
        const rows = commentsResult.data ?? [];
        const articles = new Set();
        const tierCounts = { ...TIER_DEFAULTS };
        for (const row of rows) {
          articles.add(row.article_id);
          const cls = Array.isArray(row.classifications)
            ? row.classifications
            : row.classifications ? [row.classifications] : [];
          for (const c of cls) {
            if (c?.final_tier && tierCounts[c.final_tier] !== undefined) {
              tierCounts[c.final_tier] += 1;
            }
          }
        }
        stats.totalComments   = rows.length;
        stats.articlesEngaged = articles.size;
        stats.tierCounts      = tierCounts;
        stats.forumPct        = rows.length > 0
          ? Math.round((tierCounts.forum / rows.length) * 100)
          : 0;
      }

      // Relationships — readers, sources, correspondents, sparring partners.
      // Buckets are disjoint: a mutual follow (correspondent) is NOT also
      // counted as a reader or source. Sparring partners is the exception —
      // a subset of correspondents who have opted into mutual visibility, so
      // the same person can appear in both the correspondents and sparring
      // chip rows by design.
      //   readers          = one-way inbound  (they follow me, I don't follow back)
      //   sources          = one-way outbound (I follow them, they don't follow back)
      //   correspondents   = mutual (the intersection, removed from the above)
      //   sparringPartners = correspondents with mutual visibility opt-in
      // Each category returns BOTH a count (in `connections`) and a chip list
      // (top-level array key) for UI render. Chip click → /profile/?id=...
      const connections = { readers: 0, sources: 0, correspondents: 0, sparringPartners: 0 };
      let readerIds = [];
      let sourceIds = [];
      let mutualIds = [];
      let sparringIds = [];

      if (followersResult.error || followingResult.error) {
        console.error('follows fetch error:', followersResult.error || followingResult.error);
        warnings.push('connections_unavailable');
      } else {
        const allReaderIds = (followersResult.data ?? []).map(r => r.follower_id);
        const allSourceIds = (followingResult.data ?? []).map(r => r.followee_id);
        const sourceSet = new Set(allSourceIds);
        const mutualSet = new Set(allReaderIds.filter(rid => sourceSet.has(rid)));
        readerIds = allReaderIds.filter(rid => !mutualSet.has(rid));
        sourceIds = allSourceIds.filter(sid => !mutualSet.has(sid));
        mutualIds = [...mutualSet];
        connections.readers        = readerIds.length;
        connections.sources        = sourceIds.length;
        connections.correspondents = mutualIds.length;
      }

      if (sparringAResult.error || sparringBResult.error) {
        console.error('sparring_partners fetch error:', sparringAResult.error || sparringBResult.error);
        warnings.push('sparring_partners_unavailable');
      } else {
        sparringIds = [
          ...((sparringAResult.data ?? []).map(r => r.member_b)),
          ...((sparringBResult.data ?? []).map(r => r.member_a)),
        ];
        connections.sparringPartners = sparringIds.length;
      }

      // Two parallel lookups for every unique ID across the four categories:
      //   profiles    — display_name for chip text + initials
      //   axis_scores — graduation_count per pillar, for chip color
      // Chip color = dominant pillar; chip secondaryColor = next pillar; the
      // front-end blends them as a 135° linear gradient. Contributors with no
      // axis_scores yet fall back to NEUTRAL_COLOR (monochrome gray chip).
      const allRelatedIds = [...new Set([...readerIds, ...sourceIds, ...mutualIds, ...sparringIds])];
      const profilesMap    = new Map();
      const axisScoresMap  = new Map();
      if (allRelatedIds.length > 0) {
        const [relatedProfilesResult, relatedAxisScoresResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('ghost_member_id, display_name')
            .in('ghost_member_id', allRelatedIds),
          supabase
            .from('axis_scores')
            .select('member_id, axis, graduation_count')
            .in('member_id', allRelatedIds),
        ]);

        if (relatedProfilesResult.error) {
          console.error('connection profiles fetch error:', relatedProfilesResult.error);
          warnings.push('connection_profiles_unavailable');
        } else {
          for (const p of relatedProfilesResult.data ?? []) {
            profilesMap.set(p.ghost_member_id, p);
          }
        }

        if (relatedAxisScoresResult.error) {
          console.error('connection axis_scores fetch error:', relatedAxisScoresResult.error);
          warnings.push('connection_axis_scores_unavailable');
        } else {
          for (const row of relatedAxisScoresResult.data ?? []) {
            if (!axisScoresMap.has(row.member_id)) axisScoresMap.set(row.member_id, {});
            axisScoresMap.get(row.member_id)[row.axis] = row.graduation_count;
          }
        }
      }

      function buildChip(memberId) {
        const p = profilesMap.get(memberId);
        if (!p) return null;
        const scores = axisScoresMap.get(memberId);
        const top    = topTwoAxes(scores);
        const color          = top ? AXIS_COLORS[top[0]] : NEUTRAL_COLOR;
        const secondaryColor = top ? AXIS_COLORS[top[1]] : NEUTRAL_COLOR;
        return {
          member_id: p.ghost_member_id,
          name:      p.display_name,
          initials:  computeInitials(p.display_name),
          color,
          secondaryColor,
        };
      }

      const readers          = readerIds.map(buildChip).filter(Boolean);
      const sources          = sourceIds.map(buildChip).filter(Boolean);
      const correspondents   = mutualIds.map(buildChip).filter(Boolean);
      const sparringPartners = sparringIds.map(buildChip).filter(Boolean);

      const response = {
        ...profile,
        axisScores,
        archetype,
        stats,
        connections,
        readers,
        sources,
        correspondents,
        sparringPartners,
        admin_roles:            (rolesResult.data || []).map((r) => r.role_id),
        effective_capabilities: (capsResult.data || []).map((c) => c.capability_id),
      };
      if (warnings.length > 0) response._warnings = warnings;

      return res.status(200).json(response);
    } catch (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ error: 'Profile fetch failed', detail: error.message });
    }
  }

  // POST — discriminated by body shape:
  //   { _action: 'become_author', pact_version, pact_path } → grant
  //     authorship + record Pact agreement. Refuses if already an
  //     author. Reachable from /pact/'s commit() handler.
  //   { _action: 'follow' | 'unfollow', viewer_member_id } → social
  //     graph edges. The {id} URL param is the FOLLOWEE; the body
  //     carries the FOLLOWER. Idempotent on both sides.
  //   { order_id, order_label, order_family, author_response } → Steward
  //     Order commit. Records the chosen Order, clears any pending
  //     proposal, appends a negotiation log entry. Reachable from the
  //     OrderPatternCard on the profile page.
  // All branches co-located here to stay under the Vercel Hobby
  // 12-function ceiling.
  if (req.method === 'POST') {
    const member_uuid = id;
    const body = req.body || {};

    // ── Branch: Follow / unfollow ─────────────────────────────────────
    // {id} URL param is the followee; viewer_member_id in body is the
    // follower. We do NOT use member_uuid from body for safety: the
    // path identifies the followee unambiguously.
    if (body._action === 'follow' || body._action === 'unfollow') {
      const viewer_member_id = body.viewer_member_id;
      if (!viewer_member_id || typeof viewer_member_id !== 'string') {
        return res.status(400).json({ error: 'viewer_member_id is required' });
      }
      if (viewer_member_id === member_uuid) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      try {
        // Verify both profiles exist. follows.follower_id and follows
        // .followee_id are FK to profiles.ghost_member_id; insert would
        // fail anyway, but a 4xx with a clear message is friendlier
        // than letting the FK error bubble.
        const { data: profiles, error: lookupErr } = await supabase
          .from('profiles')
          .select('ghost_member_id')
          .in('ghost_member_id', [viewer_member_id, member_uuid]);
        if (lookupErr) throw lookupErr;
        if (!profiles || profiles.length < 2) {
          return res.status(404).json({
            error: 'Both viewer and target profiles must exist before following.',
          });
        }

        if (body._action === 'follow') {
          // Check whether this is a NEW follow vs. a re-click on an existing
          // edge. The upsert below is idempotent, but we want the notification
          // to fire only on the first follow so re-clicks don't generate
          // duplicate "X started following you" notifications.
          const { data: existingFollow } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', viewer_member_id)
            .eq('followee_id', member_uuid)
            .maybeSingle();
          const wasNewFollow = !existingFollow;

          const { error: insertErr } = await supabase
            .from('follows')
            .upsert(
              { follower_id: viewer_member_id, followee_id: member_uuid },
              { onConflict: 'follower_id,followee_id', ignoreDuplicates: true }
            );
          if (insertErr) throw insertErr;

          if (wasNewFollow) {
            try {
              const { data: actorProfile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('ghost_member_id', viewer_member_id)
                .maybeSingle();
              await createNotification(supabase, {
                recipient_member_id: member_uuid,
                actor_member_id:     viewer_member_id,
                type:                'new_follower',
                target_type:         'profile',
                target_id:           viewer_member_id,
                target_url:          '/profile/?id=' + viewer_member_id,
                payload: {
                  actor_name: actorProfile?.display_name || 'A contributor',
                },
              });
            } catch (notifErr) {
              console.warn('new_follower notification failed:', notifErr.message);
            }
          }

          return res.status(200).json({ following: true });
        } else {
          const { error: deleteErr } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', viewer_member_id)
            .eq('followee_id', member_uuid);
          if (deleteErr) throw deleteErr;
          return res.status(200).json({ following: false });
        }
      } catch (error) {
        console.error('Follow/unfollow error:', error);
        return res.status(500).json({
          error: body._action + ' failed',
          detail: error.message,
        });
      }
    }

    // ── Branch 1: Pact agreement → become author ──────────────────────
    if (body._action === 'become_author') {
      const { pact_version, pact_path, signed_name, signature_font } = body;
      if (!pact_version || typeof pact_version !== 'string') {
        return res.status(400).json({ error: 'pact_version is required' });
      }
      // pact_path is now optional. The Path A / Path B choice was removed
      // from the Pact sign-on flow on 2026-04-29 — that decision lives in
      // the post composer instead. We still accept it here for backward
      // compat (older Pact versions sent it) and validate when present.
      if (pact_path != null && pact_path !== 'A' && pact_path !== 'B') {
        return res.status(400).json({ error: 'pact_path must be "A" or "B" when provided' });
      }
      // signed_name is the user's typed signature on the Pact's cursive
      // signature line. Stored on the profile as a cryptographically
      // weak but symbolically meaningful record of the agreement.
      const signedNameTrimmed =
        typeof signed_name === 'string' ? signed_name.trim() : '';
      if (signedNameTrimmed.length < 2 || signedNameTrimmed.length > 80) {
        return res.status(400).json({
          error: 'signed_name is required (2–80 characters)',
        });
      }
      // signature_font is the Google Font family chosen on the Pact form's
      // font picker. Must be on the allowlist; falls back to the default
      // if absent so older clients (pre-picker) still commit cleanly.
      let signatureFontResolved = DEFAULT_SIGNATURE_FONT;
      if (signature_font != null) {
        if (!isAllowedSignatureFont(signature_font)) {
          return res.status(400).json({
            error: 'signature_font must be one of the allowed Google Fonts',
          });
        }
        signatureFontResolved = signature_font;
      }

      try {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('id, ghost_member_id, is_author, pact_signed_name')
          .eq('ghost_member_id', member_uuid)
          .maybeSingle();
        if (profileErr) throw profileErr;
        if (!profile) {
          return res.status(403).json({
            error: 'No Dialecta profile exists for this member. Visit /profile/ first.',
          });
        }
        // "Already signed" gate is keyed on pact_signed_name, NOT the
        // is_author boolean. Some early-setup profiles were flagged
        // is_author=true outside the Pact flow (manual seeds, dev
        // bootstrapping); blocking on is_author alone prevented those
        // members from ever persisting a real signed_name + signature_font
        // when they later went through /pact/. The signature data, not the
        // flag, is the canonical record of having signed.
        if (profile.pact_signed_name) {
          return res.status(409).json({
            error: 'Already signed',
            already_author: true,
          });
        }

        const pact_agreed_at = new Date().toISOString();
        const { error: updateErr } = await supabase
          .from('profiles')
          .update({
            is_author:        true,
            pact_agreed_at,
            pact_version,
            pact_path:        pact_path ?? null,
            pact_signed_name: signedNameTrimmed,
            signature_font:   signatureFontResolved,
          })
          .eq('ghost_member_id', member_uuid);
        if (updateErr) throw updateErr;

        return res.status(200).json({
          is_author: true,
          pact_agreed_at,
          pact_version,
          pact_path:        pact_path ?? null,
          pact_signed_name: signedNameTrimmed,
          signature_font:   signatureFontResolved,
        });
      } catch (error) {
        console.error('Become-author error:', error);
        return res.status(500).json({
          error: 'Become-author failed',
          detail: error.message,
        });
      }
    }

    // ── Branch 2: Steward Order commit (existing) ─────────────────────
    const VALID_RESPONSES = new Set(['accepted', 'picked_alternative', 'chose_differently']);
    const CANONICAL_ORDER_IDS = new Set([
      'essayist', 'aphorist', 'memoirist', 'diarist', 'blogger',
      'pamphleteer', 'polemicist', 'dialectician', 'provocateur',
      'cartographer', 'anthologist', 'translator', 'theorist',
      'philologist', 'lexicographer', 'historian', 'empiricist',
      'fabulist', 'playwright', 'screenwriter', 'biographer',
      'clinician', 'diagnostician', 'naturalist',
      'correspondent', 'annalist', 'reportorial', 'critic', 'marginalia',
      'glossator', 'futurist', 'satirist',
    ]);
    const VALID_FAMILIES = new Set([
      'essayistic', 'argumentative', 'synthetic', 'scholarly',
      'narrative', 'practitioner', 'journalistic', 'pedagogical',
      'speculative', 'declared',
    ]);

    const { order_id, order_label, order_family, author_response } = body;

    if (!order_id || !CANONICAL_ORDER_IDS.has(order_id)) {
      return res.status(400).json({ error: 'order_id must be a canonical Order slug' });
    }
    if (!order_label || typeof order_label !== 'string') {
      return res.status(400).json({ error: 'order_label is required' });
    }
    if (!order_family || !VALID_FAMILIES.has(order_family)) {
      return res.status(400).json({ error: 'order_family must be a canonical Family slug' });
    }
    if (!author_response || !VALID_RESPONSES.has(author_response)) {
      return res.status(400).json({
        error: 'author_response must be one of: ' + [...VALID_RESPONSES].join(', '),
      });
    }

    try {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('id, ghost_member_id, order_pending_proposal, order_negotiation_log')
        .eq('ghost_member_id', member_uuid)
        .maybeSingle();
      if (profileErr) throw profileErr;
      if (!profile) {
        return res.status(403).json({ error: 'No Dialecta profile exists for this member.' });
      }

      const proposal = profile.order_pending_proposal || {};
      const logEntry = {
        at: new Date().toISOString(),
        article_count:        proposal.article_count        ?? null,
        proposed_order_id:    proposal.proposed_order_id    ?? null,
        proposed_order_label: proposal.proposed_order_label ?? null,
        alternative_order_id: proposal.alternative_order_id ?? null,
        rationale:            proposal.rationale            ?? null,
        confidence:           proposal.confidence           ?? null,
        author_chose:         order_id,
        author_response,
      };
      const updatedLog = Array.isArray(profile.order_negotiation_log)
        ? [...profile.order_negotiation_log, logEntry]
        : [logEntry];

      const order_assigned_at = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          order_id,
          order_label,
          order_family,
          order_assigned_at,
          order_pending_proposal: null,
          order_negotiation_log: updatedLog,
        })
        .eq('ghost_member_id', member_uuid);
      if (updateErr) throw updateErr;

      return res.status(200).json({ order_id, order_label, order_family, order_assigned_at });
    } catch (error) {
      console.error('Order commit error:', error);
      return res.status(500).json({ error: 'Order commit failed', detail: error.message });
    }
  }

  // PATCH — update profile.
  if (req.method === 'PATCH') {
    const updates = req.body;

    delete updates.id;
    delete updates.ghost_member_id;
    delete updates.created_at;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No update fields provided' });
    }

    // Validate signature_font against the allowlist when present so a
    // PATCH from /profile/ settings can't smuggle in arbitrary CSS.
    if (Object.prototype.hasOwnProperty.call(updates, 'signature_font')) {
      if (!isAllowedSignatureFont(updates.signature_font)) {
        return res.status(400).json({
          error: 'signature_font must be one of the allowed Google Fonts',
        });
      }
    }

    // Validate aspirational_archetype against the eight canonical IDs.
    // Null is allowed (clears the aspiration via the modal's "Clear
    // aspiration" affordance).
    if (Object.prototype.hasOwnProperty.call(updates, 'aspirational_archetype')) {
      const v = updates.aspirational_archetype;
      if (v !== null && !ALLOWED_ASPIRATIONAL_ARCHETYPES.has(v)) {
        return res.status(400).json({
          error: 'aspirational_archetype must be a canonical archetype id or null',
        });
      }
    }

    // Handle: format + reserved + taken + cooldown. The DB trigger also
    // enforces reserved + cooldown; we check here so the API returns a
    // specific 409 reason instead of letting the trigger error bubble as
    // a generic 500. On a user-confirmed handle change, we queue the old
    // handle for handle_history insert (1-year cooldown) so the SSR
    // /contributor/<X> route can 301-redirect old links.
    let pendingHistoryInsert = null;
    if (Object.prototype.hasOwnProperty.call(updates, 'handle')) {
      const raw = updates.handle;
      if (typeof raw !== 'string') {
        return res.status(400).json({ error: 'handle must be a string' });
      }
      const normalized = raw.toLowerCase().trim();

      if (normalized.length < 5 || normalized.length > 24 ||
          !/^[a-z0-9]([a-z0-9]|[_-][a-z0-9])*$/.test(normalized)) {
        return res.status(400).json({
          error: 'handle must be 5-24 lowercase chars: alphanumerics with single - or _ between alphanumeric runs',
          reason: 'invalid_format',
        });
      }

      try {
        const { data: reserved } = await supabase
          .from('reserved_handles')
          .select('handle')
          .eq('handle', normalized)
          .maybeSingle();
        if (reserved) {
          return res.status(409).json({ error: 'handle is reserved', reason: 'reserved' });
        }

        const { data: taken } = await supabase
          .from('profiles')
          .select('ghost_member_id')
          .eq('handle', normalized)
          .neq('ghost_member_id', id)
          .maybeSingle();
        if (taken) {
          return res.status(409).json({ error: 'handle is taken', reason: 'taken' });
        }

        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('id, handle, handle_set_by_user')
          .eq('ghost_member_id', id)
          .maybeSingle();

        if (currentProfile) {
          const { data: cooldown } = await supabase
            .from('handle_history')
            .select('id')
            .eq('old_handle', normalized)
            .neq('profile_id', currentProfile.id)
            .or('released_at.is.null,released_at.gt.' + new Date().toISOString())
            .limit(1);
          if (cooldown && cooldown.length > 0) {
            return res.status(409).json({ error: 'handle was recently used', reason: 'cooldown' });
          }

          // Log to handle_history only when changing from a user-confirmed
          // handle. Auto-generated handles never claimed by the user
          // shouldn't poison the cooldown pool.
          if (currentProfile.handle &&
              currentProfile.handle !== normalized &&
              currentProfile.handle_set_by_user) {
            const released = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
            pendingHistoryInsert = {
              profile_id: currentProfile.id,
              old_handle: currentProfile.handle,
              new_handle: normalized,
              released_at: released,
            };
          }
        }
      } catch (error) {
        console.error('handle validation error:', error);
        return res.status(500).json({
          error: 'Handle validation failed',
          detail: error.message,
        });
      }

      updates.handle = normalized;
      updates.handle_set_by_user = true;
      updates.handle_set_at = new Date().toISOString();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('ghost_member_id', id)
        .select()
        .single();

      if (error) throw error;

      if (pendingHistoryInsert) {
        const { error: historyErr } = await supabase
          .from('handle_history')
          .insert(pendingHistoryInsert);
        if (historyErr) {
          // Non-fatal: the handle change persisted. Old handle won't
          // 301-redirect, but everything else works.
          console.warn('handle_history insert failed:', historyErr.message);
        }
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ error: 'Profile update failed', detail: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
