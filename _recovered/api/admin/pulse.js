/**
 * /api/admin/pulse
 *
 * GET platform pulse for the /dev-admin/ Tuning tab. Gated by `tuning.read`.
 *
 * Two payloads in one response:
 *
 * 1. `pulse` — live counts you want to watch as activity ramps up:
 *      members      total / active 7d / active 30d / pact-signed
 *      comments     total / last 24h / last 7d / by tier
 *      articles     total / published / by tier / tier mismatches
 *      axis_events  total / last 7d / by axis
 *      feedback     by status (passthrough so the Tuning tab can show
 *                   queue depth without re-hitting /api/admin/feedback)
 *
 * 2. `knobs` — curated inventory of the platform's tunable constants.
 *    Sourced from the `// TUNING:` markers in the codebase plus any DB-
 *    backed thresholds. Hardcoded for now; a future build can grep the
 *    repo at deploy time and emit this as a JSON manifest.
 *
 * Service role bypasses RLS so all counts are accurate.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { verifyCapability } from '../_capabilities.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const KNOBS = [
  {
    id:           'feedback.sla_hours',
    label:        'Feedback SLA (acknowledgment)',
    current:      48,
    unit:         'hours',
    location:     'src/dialecta-dev-admin.jsx · FEEDBACK_SLA_HOURS',
    description:  'Hours from feedback submission to admin acknowledgment before items surface as overdue. Halfway = approaching.',
  },
  {
    id:           'wait.reflection',
    label:        'Comment reflection wait',
    current:      8,
    unit:         'seconds',
    location:     'spec: project_wait_windows memory',
    description:  'How long the reflection bar runs while /api/classify is thinking. Increase if AI calls regularly time out.',
  },
  {
    id:           'wait.stage_2_5_lock',
    label:        'Stage 2.5 lock window',
    current:      12,
    unit:         'seconds',
    location:     'spec: project_wait_windows memory',
    description:  'How long the author has to confirm or override the AI tier before publish.',
  },
  {
    id:           'wait.malleability',
    label:        'Comment malleability window',
    current:      60,
    unit:         'minutes',
    location:     'migration 011_comment_malleability',
    description:  'Edit window after a comment hardens. Shorten if abuse appears, lengthen if authors complain.',
  },
  {
    id:           'sparring.threshold',
    label:        'Sparring partners threshold',
    current:      5,
    unit:         'articles',
    location:     'sparring_partners table comment',
    description:  'Distinct articles required for mutual reply chains to surface a sparring relationship.',
  },
  {
    id:           'opinion_map.aggregate_floor',
    label:        'Opinion-map aggregate floor',
    current:      20,
    unit:         'completed pairs',
    location:     'opinion_map_positions table comment',
    description:  'Pre/post pairs required before opinion-map aggregates are published. Keeps small-n maps private.',
  },
  {
    id:           'profile_list.autocomplete_limit',
    label:        '@-mention autocomplete cap',
    current:      10,
    unit:         'matches',
    location:     'api/profile/[id].js · _list q-mode',
    description:  'Max contributors returned to the comment composer for @-mention picker.',
  },
  {
    id:           'admin.list_members.ghost_chunk',
    label:        'Members bulk-Ghost chunk size',
    current:      80,
    unit:         'ids',
    location:     'api/admin/members.js · chunkArray(realMemberIds, 80)',
    description:  'Ghost Admin filter chunk size when bulk-fetching email + last_seen for the Members tab.',
  },
];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await verifyCapability(req, 'tuning.read');
  if (!auth.ok) {
    return res.status(auth.statusCode).json({ error: auth.error });
  }

  try {
    const now = Date.now();
    const sevenDaysAgo  = new Date(now - 7  * 24 * 3600 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 3600 * 1000).toISOString();
    const oneDayAgo     = new Date(now - 24 * 3600 * 1000).toISOString();

    const [
      profilesAllResult,
      profilesPactResult,
      commentsAllResult,
      commentsRecentResult,
      classificationsResult,
      articlesResult,
      axisEventsAllResult,
      axisEventsRecentResult,
      axisEventsByAxisResult,
      followsResult,
      feedbackResult,
    ] = await Promise.all([
      supabase.from('profiles').select('updated_at, is_seed'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).not('pact_agreed_at', 'is', null),
      supabase.from('comments').select('id', { count: 'exact', head: true }),
      supabase.from('comments').select('id, created_at').gte('created_at', sevenDaysAgo),
      supabase.from('classifications').select('comment_id, final_tier'),
      supabase.from('articles').select('status, declared_tier, final_tier'),
      supabase.from('axis_events').select('id', { count: 'exact', head: true }),
      supabase.from('axis_events').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabase.from('axis_events').select('axis'),
      supabase.from('follows').select('id', { count: 'exact', head: true }),
      supabase.from('feedback_items').select('status'),
    ]);

    // Members.
    const profiles = profilesAllResult.data || [];
    const realProfiles = profiles.filter((p) => !p.is_seed);
    let active_7d = 0, active_30d = 0;
    for (const p of realProfiles) {
      if (!p.updated_at) continue;
      if (p.updated_at >= sevenDaysAgo)  active_7d  += 1;
      if (p.updated_at >= thirtyDaysAgo) active_30d += 1;
    }

    // Comments.
    const commentsRecent = commentsRecentResult.data || [];
    let comments_24h = 0;
    for (const c of commentsRecent) {
      if (c.created_at >= oneDayAgo) comments_24h += 1;
    }

    // Tier mix from classifications. One row per comment_id with the
    // resolved final_tier (per the schema: ai_suggested_tier,
    // self_declared_tier, and final_tier are all on the same row).
    const comment_tier_mix = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 };
    for (const row of classificationsResult.data || []) {
      const t = row.final_tier;
      if (t && comment_tier_mix[t] !== undefined) comment_tier_mix[t] += 1;
    }

    // Articles.
    const articles = articlesResult.data || [];
    const article_tier_mix = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0, breach: 0 };
    let published = 0, draft = 0, mismatched = 0;
    for (const a of articles) {
      if (a.status === 'published') published += 1;
      else if (a.status === 'draft') draft += 1;
      if (a.final_tier && article_tier_mix[a.final_tier] !== undefined) {
        article_tier_mix[a.final_tier] += 1;
      }
      if (a.declared_tier && a.final_tier && a.declared_tier !== a.final_tier) {
        mismatched += 1;
      }
    }

    // Axis events by axis.
    const axis_mix = { acuity: 0, calibration: 0, magnanimity: 0, discourse: 0, consistency: 0, reach: 0 };
    for (const row of axisEventsByAxisResult.data || []) {
      if (axis_mix[row.axis] !== undefined) axis_mix[row.axis] += 1;
    }

    // Feedback by status.
    const feedback_by_status = {};
    for (const row of feedbackResult.data || []) {
      feedback_by_status[row.status] = (feedback_by_status[row.status] || 0) + 1;
    }

    return res.status(200).json({
      pulse: {
        generated_at: new Date().toISOString(),
        members: {
          total:       profiles.length,
          real:        realProfiles.length,
          seeds:       profiles.length - realProfiles.length,
          active_7d,
          active_30d,
          pact_signed: profilesPactResult.count || 0,
        },
        comments: {
          total:        commentsAllResult.count || 0,
          last_24h:     comments_24h,
          last_7d:      commentsRecent.length,
          tier_mix:     comment_tier_mix,
        },
        articles: {
          total: articles.length,
          published,
          draft,
          mismatched,
          tier_mix: article_tier_mix,
        },
        axis_events: {
          total:    axisEventsAllResult.count || 0,
          last_7d:  axisEventsRecentResult.count || 0,
          axis_mix,
        },
        follows: {
          total: followsResult.count || 0,
        },
        feedback: {
          by_status: feedback_by_status,
        },
      },
      knobs: KNOBS,
    });
  } catch (err) {
    console.error('admin/pulse error:', err);
    return res.status(500).json({ error: 'Failed to fetch pulse', detail: err.message });
  }
}
