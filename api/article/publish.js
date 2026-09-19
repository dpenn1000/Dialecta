/**
 * api/article/publish.js
 *
 * Publish endpoint. Called after Stage 2.5 when the author chooses 'respond'
 * or 'as_is'. Updates the Supabase row with the choice and any author note,
 * then flips the Ghost post from draft to published.
 *
 * 'amend' does NOT call this endpoint; the editor calls /submit again with
 * revised content (which creates a new Ghost draft and Supabase row, or
 * could update the existing one in a future enhancement).
 *
 * If the article has a wait_until set in the future, this returns 425
 * (Too Early) and does not publish. The wait window field is in place
 * for v2; not enforced beyond the check here.
 *
 * POST body:
 *   {
 *     ghost_post_id:    text,
 *     stage_2_5_choice: 'respond' | 'as_is',
 *     author_note?:     text,    // required when choice is 'respond'
 *   }
 *
 * Response:
 *   {
 *     ghost_post_id:    text,
 *     ghost_post_url:   text,
 *     status:           'published',
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';
import {
  deriveArticleAxisEvents,
  recomputeAxisScores,
  getMemberTopicHistory,
} from '../_axis-mapping.js';
import {
  captureSnapshot,
  detectPillarMilestones,
  isFirstActivity,
} from '../_fp-snapshot.js';
import { createNotification } from '../_notifications.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const VALID_CHOICES = ['respond', 'as_is'];

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ghost_post_id, stage_2_5_choice, author_note } = req.body || {};

  if (!ghost_post_id) {
    return res.status(400).json({ error: 'ghost_post_id is required' });
  }
  if (!VALID_CHOICES.includes(stage_2_5_choice)) {
    return res.status(400).json({
      error: 'stage_2_5_choice must be one of: ' + VALID_CHOICES.join(', ') +
             ' (use /submit again for "amend")',
    });
  }
  if (stage_2_5_choice === 'respond' && (!author_note || typeof author_note !== 'string')) {
    return res.status(400).json({ error: 'author_note is required when stage_2_5_choice is "respond"' });
  }

  try {
    // Step 1: fetch Supabase row to verify it exists and check wait window.
    // Also pull the fields needed by the axis_events derivation in Step 5
    // so we don't have to round-trip the row twice.
    const { data: row, error: fetchErr } = await supabase
      .from('articles')
      .select('id, status, wait_until, author_member_id, ai_analysis, declared_tier, ai_suggested_tier, final_tier')
      .eq('ghost_post_id', ghost_post_id)
      .maybeSingle();

    // Capture the pre-publish status so we can decide whether to fan out
    // follow_new_article notifications below. We only fire on the first
    // transition to 'published'; a republish (status already 'published')
    // is a no-op for the social feed.
    const wasUnpublished = row && row.status !== 'published';

    if (fetchErr) throw fetchErr;
    if (!row) {
      return res.status(404).json({ error: 'Article not found in Supabase. Was it submitted via /api/article/submit?' });
    }

    if (row.wait_until && new Date(row.wait_until) > new Date()) {
      return res.status(425).json({
        error: 'Wait window not yet elapsed',
        wait_until: row.wait_until,
      });
    }

    // Step 2: fetch Ghost post for updated_at (optimistic locking).
    const ghostGetResp = await ghostAdminFetch('/posts/' + ghost_post_id + '/?formats=html');
    const ghostPost = ghostGetResp.posts[0];

    // Step 3: flip Ghost post to published.
    const ghostPutResp = await ghostAdminFetch('/posts/' + ghost_post_id + '/?source=html', {
      method: 'PUT',
      body: JSON.stringify({
        posts: [
          {
            status:     'published',
            updated_at: ghostPost.updated_at,
          },
        ],
      }),
    });

    const publishedPost = ghostPutResp.posts[0];

    // Step 4: update Supabase row.
    const { error: updateErr } = await supabase
      .from('articles')
      .update({
        status:           'published',
        stage_2_5_choice,
        author_note:      author_note || null,
      })
      .eq('ghost_post_id', ghost_post_id);

    if (updateErr) {
      console.error('Supabase update error after Ghost publish:', updateErr);
      return res.status(200).json({
        ghost_post_id,
        ghost_post_url: publishedPost.url,
        status: 'published',
        warning: 'Ghost post published but Supabase row update failed',
        detail:  updateErr.message,
      });
    }

    // Step 5: derive axis_events for the author and refresh their
    // axis_scores. Per Dialecta_Axis_Mapping_v1.1, articles shape the
    // author's Fingerprint with the same triggers as comments minus
    // Discourse. articleTopic comes from Ghost's primary_tag.slug if
    // present; absent → Reach silently does not fire (which is correct
    // for articles with no topic tag). Wrapped defensively so a derive
    // failure never blocks a successful publish from completing.
    let axisEventsCount = 0;
    try {
      const finalTier   = row.final_tier || row.ai_suggested_tier;
      const authorId    = row.author_member_id;
      if (finalTier && authorId) {
        const articleTopic = ghostPost?.primary_tag?.slug || null;
        const priorTopics  = await getMemberTopicHistory(supabase, authorId);
        const articleEvents = deriveArticleAxisEvents({
          aiAnalysis:     row.ai_analysis || {},
          finalTier,
          authorMemberId: authorId,
          articleId:      ghost_post_id,
          articleTopic,
          priorTopics,
        });
        if (articleEvents.length > 0) {
          const { error: axisErr } = await supabase.from('axis_events').insert(articleEvents);
          if (axisErr) throw axisErr;
          await recomputeAxisScores(supabase, authorId);
          axisEventsCount = articleEvents.length;
        }
      }
    } catch (axisErr) {
      console.warn('Article axis_events derivation failed (publish still succeeded):', axisErr.message);
    }

    // Step 5b: capture fp_snapshots when trigger conditions fire. Two checks:
    //   - first_entry: this contributor's first comment OR first non-draft
    //     article. excludeArticleId so we don't count this just-published one.
    //     Idempotent — captureSnapshot internally guards against duplicates.
    //   - pillar_milestone: any axis whose graduation_count just crossed a
    //     threshold from PILLAR_MILESTONE_THRESHOLDS. Only checked if axis
    //     events fired (otherwise axis_scores didn't change).
    //
    // Wrapped so a snapshot failure never blocks publish — same defensive
    // posture as the axis_events block above. Spec:
    // project_growth_engine_scroll_scope memory.
    if (row.author_member_id) {
      try {
        const isFirst = await isFirstActivity(supabase, row.author_member_id, {
          excludeArticleId: row.id,
        });
        if (isFirst) {
          await captureSnapshot(supabase, row.author_member_id, 'first_entry');
        }
        if (axisEventsCount > 0) {
          const milestones = await detectPillarMilestones(supabase, row.author_member_id);
          for (const { pillar, threshold } of milestones) {
            await captureSnapshot(supabase, row.author_member_id, 'pillar_milestone', {
              pillar, threshold,
            });
          }
        }
      } catch (snapshotErr) {
        console.warn('article/publish.js fp_snapshot capture failed:', snapshotErr.message);
      }
    }

    // Step 6: follow_new_article fan-out. One notification per follower of
    // the author. Only fires on the first transition to 'published' so a
    // republish doesn't re-notify everyone. Wrapped so a fan-out failure
    // never blocks a successful publish from completing. For an author
    // with hundreds of followers this is sequential; revisit with a queue
    // if/when fan-out latency becomes user-visible.
    let notifiedFollowers = 0;
    if (wasUnpublished && row.author_member_id) {
      try {
        const [{ data: followerRows }, { data: authorProfile }] = await Promise.all([
          supabase.from('follows').select('follower_id').eq('followee_id', row.author_member_id),
          supabase.from('profiles').select('display_name').eq('ghost_member_id', row.author_member_id).maybeSingle(),
        ]);
        const actorName = authorProfile?.display_name || 'A contributor';
        const articleTitle = publishedPost.title || ghostPost.title || '';

        for (const f of followerRows || []) {
          try {
            const result = await createNotification(supabase, {
              recipient_member_id: f.follower_id,
              actor_member_id:     row.author_member_id,
              type:                'follow_new_article',
              target_type:         'article',
              target_id:           ghost_post_id,
              target_url:          publishedPost.url,
              payload: {
                actor_name:    actorName,
                article_title: articleTitle,
              },
            });
            if (result.written) notifiedFollowers += 1;
          } catch (perFollowerErr) {
            console.warn('follow_new_article notification failed for', f.follower_id, perFollowerErr.message);
          }
        }
      } catch (fanoutErr) {
        console.warn('follow_new_article fan-out failed:', fanoutErr.message);
      }
    }

    return res.status(200).json({
      ghost_post_id,
      ghost_post_url:     publishedPost.url,
      status:             'published',
      axis_events_count:  axisEventsCount,
      notified_followers: notifiedFollowers,
    });
  } catch (error) {
    console.error('Article publish error:', error);
    return res.status(500).json({
      error: 'Article publish failed',
      detail: error.message,
    });
  }
}
