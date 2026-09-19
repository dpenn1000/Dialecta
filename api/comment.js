/**
 * api/comment.js
 *
 * Comment submission endpoint. Mirrors api/article/submit.js Path C-lite
 * auth model: receives member_uuid from {{@member.uuid}} on post.hbs,
 * verifies a Dialecta profile exists, runs classification via
 * /api/classify, then writes comments + classifications rows in a
 * server-trusted shape.
 *
 * Auth model:
 *   - The endpoint receives member_uuid (Ghost's session-derived UUID)
 *     and looks up the corresponding profiles row by ghost_member_id.
 *   - member_id and member_name on the comment are taken from the profile,
 *     not the request, so a caller cannot spoof identity.
 *   - member_email is accepted from the request body since it is not
 *     stored on profiles. It is provided by Ghost via {{@member.email}}
 *     in the .hbs template.
 *
 * Status flow:
 *   - All comments insert with the comments table default,
 *     status = 'pending_review'. Promotion to 'published' or 'suppressed'
 *     is the responsibility of the Wait Window / Stage 2.5 amendment
 *     pipeline (Phase 2 Discourse Layer), not this endpoint.
 *
 * POST body:
 *   {
 *     member_uuid:        string,    // from {{@member.uuid}}
 *     member_email:       string,    // from {{@member.email}}
 *     article_id:         string,    // Ghost post id
 *     article_slug:       string,
 *     article_title:      string,
 *     body:               string,
 *     article_claims?:    string[],  // optional context for the classifier
 *     self_declared_tier?: tier,     // optional Stage 2 self-classification
 *   }
 *
 * Response:
 *   {
 *     comment_id:        uuid,
 *     status:            comment_status,
 *     ai_suggested_tier: tier,
 *     final_tier:        tier,
 *     commenter_message: string,
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from './_cors.js';
import { requireCompleteProfile } from './_profile-validation.js';
import {
  deriveAxisEvents,
  recomputeAxisScores,
  getMemberTopicHistory,
} from './_axis-mapping.js';
import {
  captureSnapshot,
  detectPillarMilestones,
  isFirstActivity,
} from './_fp-snapshot.js';
import { createNotification } from './_notifications.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// UUID regex for parent_id validation. Loose (any case hex), tight enough
// to catch obvious garbage before we hand it to Supabase.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse free-text @mentions out of a comment body. Returns the lowercased,
 * deduplicated list of tokens (without the @ prefix). The trigger then looks
 * each up against profiles.display_name with a starts-with ILIKE and only
 * fires a notification when the match is unambiguous (exactly one profile).
 *
 * Limitation: display_names with spaces (e.g. "Daniel Penn") only resolve
 * when the writer types the first token (`@Daniel`). A future structured
 * @-picker in the composer (with a comment_mentions join table) replaces
 * this entirely; until then, false-negative skips are preferred over
 * false-positive notifications.
 */
function parseMentionTokens(text) {
  if (!text) return [];
  const re = /(?:^|\s)@([\w.\-]+)/g;
  const seen = new Set();
  const tokens = [];
  let m;
  while ((m = re.exec(text))) {
    const t = m[1];
    if (t.length < 2) continue;
    const lower = t.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    tokens.push(t);
  }
  return tokens;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    member_uuid,
    member_email,
    article_id,
    article_slug,
    article_title,
    article_primary_tag,
    body,
    article_claims,
    self_declared_tier,
    parent_id,
    mentions,
  } = req.body || {};

  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({
      error: 'member_uuid is required (Ghost member UUID from the {{@member}} session)',
    });
  }
  if (!member_email || typeof member_email !== 'string') {
    return res.status(400).json({ error: 'member_email is required' });
  }
  if (!article_id || !article_slug || !article_title) {
    return res.status(400).json({
      error: 'article_id, article_slug, and article_title are all required',
    });
  }
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return res.status(400).json({ error: 'body is required' });
  }
  if (self_declared_tier && !TIERS.includes(self_declared_tier)) {
    return res.status(400).json({
      error: 'self_declared_tier must be one of: ' + TIERS.join(', '),
    });
  }
  if (parent_id != null && (typeof parent_id !== 'string' || !UUID_RE.test(parent_id))) {
    return res.status(400).json({ error: 'parent_id must be a valid uuid if provided' });
  }

  // Structured mentions validation. Optional; presence (even empty array)
  // tells the notification block downstream to use the structured list
  // instead of the conservative free-text parser. Cap at 10 to discourage
  // abuse; legit comments don't @ more people than that.
  //
  // Schema: { member_id, handle?, display_name }. handle is the canonical
  // anchor (post-migration 029); display_name is preserved for the
  // renderer's backward-compat fallback to older mentions that pre-date
  // the handle column.
  let cleanMentions = null;
  if (mentions !== undefined) {
    if (!Array.isArray(mentions)) {
      return res.status(400).json({ error: 'mentions must be an array of {member_id, handle, display_name} objects if provided' });
    }
    if (mentions.length > 10) {
      return res.status(400).json({ error: 'No more than 10 mentions per comment' });
    }
    const seen = new Set();
    cleanMentions = [];
    for (const m of mentions) {
      if (!m || typeof m !== 'object') continue;
      const mid    = typeof m.member_id    === 'string' ? m.member_id.trim() : '';
      const handle = typeof m.handle       === 'string' ? m.handle.trim().toLowerCase() : '';
      const name   = typeof m.display_name === 'string' ? m.display_name.trim() : '';
      if (!mid || !name) continue;
      if (seen.has(mid)) continue;
      seen.add(mid);
      cleanMentions.push({
        member_id:    mid,
        handle:       handle || null,
        display_name: name,
      });
    }
  }

  try {
    // Step 1: verify the member has a Dialecta profile.
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('ghost_member_id, display_name, handle')
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();

    if (profileErr) throw profileErr;

    // Validate profile completeness. Returns 403 if no profile row exists
    // (visit /profile/ to lazy-create), or 400 with an actionable response
    // payload if the profile exists but display_name is missing. The
    // Discourse Layer compose flow reads `action` and renders a CTA button.
    const incomplete = requireCompleteProfile(profile, ['display_name']);
    if (incomplete) {
      return res.status(incomplete.status).json(incomplete.body);
    }

    // Step 2: classify via internal HTTP call.
    const host  = req.headers['x-forwarded-host'] || req.headers.host || 'dialecta.vercel.app';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const classifyUrl = proto + '://' + host + '/api/classify';

    const classifyResp = await fetch(classifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body, article_claims }),
    });

    if (!classifyResp.ok) {
      const text = await classifyResp.text();
      console.error('Classification call failed:', classifyResp.status, text);
      return res.status(502).json({
        error: 'Classification engine failed',
        detail: classifyResp.status + ': ' + text.slice(0, 500),
      });
    }

    const classification = await classifyResp.json();

    if (!classification.ai_suggested_tier || !TIERS.includes(classification.ai_suggested_tier)) {
      return res.status(502).json({
        error: 'Classifier returned an invalid ai_suggested_tier',
        detail: JSON.stringify(classification).slice(0, 500),
      });
    }

    const final_tier = self_declared_tier || classification.ai_suggested_tier;

    // Step 3: write the comment row. Status defaults to 'pending_review'.
    // parent_id (migration 020) makes this a reply when non-null.
    // mentions (migration 021) is the structured @-mention list captured
    // by the composer; defaults to empty array. The notification block
    // downstream fires from this list when present, falling back to the
    // free-text parser only when callers don't include the field at all.
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        member_id:     profile.ghost_member_id,
        member_name:   profile.display_name,
        member_email,
        article_id,
        article_slug,
        article_title,
        body,
        parent_id:     parent_id || null,
        mentions:      cleanMentions || [],
      })
      .select('id, status')
      .single();

    if (commentError) throw commentError;

    // Step 4: write the classification row.
    // `strength` lands in the schema via migration 013. The classifier
    // emits it for the Reflection card; persisting it here means any
    // retrospective surface (comment card, profile, future "what this
    // does well" feed) can read the same observational note the
    // commenter saw at compose time.
    const { error: classificationError } = await supabase
      .from('classifications')
      .insert({
        comment_id:            comment.id,
        claim_text:            classification.claim_text || null,
        strength:              classification.strength || null,
        specificity_score:     typeof classification.specificity === 'number' ? classification.specificity : null,
        emotion:               classification.emotion || null,
        tribal_markers:        Boolean(classification.tribal_markers),
        tribal_example:        classification.tribal_example || null,
        article_engagement:    classification.article_engagement || null,
        opposing_view_engaged: classification.opposing_view_engaged || null,
        borderline_flag:       Boolean(classification.borderline_flag),
        borderline_other_tier: classification.borderline_other_tier || null,
        ai_suggested_tier:     classification.ai_suggested_tier,
        self_declared_tier:    self_declared_tier || null,
        final_tier,
        commenter_message:     classification.commenter_message,
      });

    if (classificationError) throw classificationError;

    // Step 4b: derive axis_events from the classification + append. Per
    // Dialecta_Axis_Mapping_v1.md, each comment produces 0-6 axis_events
    // (Breach: 0; non-Breach: at least Consistency; up to all 6 axes for
    // a Forum comment with full engagement on a new topic).
    //
    // We get the classifications row id back from the insert above so the
    // axis_events FK is satisfiable. Re-fetch the inserted row to grab
    // its uuid (Supabase doesn't return inserted ids unless we ask via
    // .select(); refactoring step 4 to .select().single() would let us
    // skip the lookup, but a small extra query keeps the diff bounded).
    const { data: classRow, error: classFetchErr } = await supabase
      .from('classifications')
      .select('id')
      .eq('comment_id', comment.id)
      .maybeSingle();
    if (classFetchErr) throw classFetchErr;
    if (!classRow) throw new Error('Classification row missing after insert');

    const priorTopics = await getMemberTopicHistory(supabase, profile.ghost_member_id);

    const axisEvents = deriveAxisEvents({
      classification: {
        ...classification,
        // The persisted final_tier should be the one we computed above
        // (self_declared_tier > ai_suggested_tier). The mapping reads
        // final_tier first; ensure it matches the stored row.
        final_tier,
      },
      memberId:          profile.ghost_member_id,
      commentId:         comment.id,
      classificationId:  classRow.id,
      articleTopic:      typeof article_primary_tag === 'string' ? article_primary_tag : null,
      priorTopics,
    });

    if (axisEvents.length > 0) {
      const { error: axisErr } = await supabase.from('axis_events').insert(axisEvents);
      if (axisErr) throw axisErr;
      // Replay the ledger to refresh axis_scores. Per spec: never
      // accumulate incrementally — always recompute from the source.
      await recomputeAxisScores(supabase, profile.ghost_member_id);
    }

    // Step 4c: capture fp_snapshots when trigger conditions fire. Two checks:
    //   - first_entry: this contributor's first comment OR first non-draft
    //     article (helper handles the cross-source check). Idempotent —
    //     captureSnapshot internally guards against double-firing.
    //   - pillar_milestone: any axis whose graduation_count just crossed a
    //     threshold from PILLAR_MILESTONE_THRESHOLDS. Only checked when
    //     axis_events fired (otherwise axis_scores didn't change so no new
    //     thresholds could have been crossed).
    //
    // Wrapped so a snapshot failure never blocks the comment response —
    // matching the same defensive posture as the notifications block below.
    // Spec: project_growth_engine_scroll_scope memory.
    try {
      const isFirst = await isFirstActivity(supabase, profile.ghost_member_id, {
        excludeCommentId: comment.id,
      });
      if (isFirst) {
        await captureSnapshot(supabase, profile.ghost_member_id, 'first_entry');
      }
      if (axisEvents.length > 0) {
        const milestones = await detectPillarMilestones(supabase, profile.ghost_member_id);
        for (const { pillar, threshold } of milestones) {
          await captureSnapshot(supabase, profile.ghost_member_id, 'pillar_milestone', {
            pillar, threshold,
          });
        }
      }
    } catch (snapshotErr) {
      console.error('comment.js fp_snapshot capture failed:', snapshotErr);
    }

    // Step 5: notification triggers. Three types can fire from one comment:
    //   - comment_on_article: article author (always, when not the commenter)
    //   - reply_to_comment:   parent comment author (when parent_id present)
    //   - mention:            members tagged via @display_name in the body
    // notifiedRecipients dedups across types so one person never receives
    // multiple notifications for the same comment. createNotification's
    // self-actor guard handles the "you commented on your own thing" case.
    // Wrapped so a notification failure never blocks the comment response.
    try {
      const notifiedRecipients = new Set([profile.ghost_member_id]);
      const excerpt = body.length > 140 ? body.slice(0, 140).trim() + '…' : body;
      const commentUrl = '/' + article_slug + '/#comment-' + comment.id;
      const sharedPayload = {
        actor_name:      profile.display_name,
        actor_handle:    profile.handle || null,
        article_title,
        article_slug,
        comment_excerpt: excerpt,
      };

      // 5a. Article author
      const { data: articleRow } = await supabase
        .from('articles')
        .select('author_member_id')
        .eq('ghost_post_id', article_id)
        .maybeSingle();
      if (articleRow?.author_member_id && !notifiedRecipients.has(articleRow.author_member_id)) {
        await createNotification(supabase, {
          recipient_member_id: articleRow.author_member_id,
          actor_member_id:     profile.ghost_member_id,
          type:                'comment_on_article',
          target_type:         'comment',
          target_id:           comment.id,
          target_url:          commentUrl,
          payload:             sharedPayload,
        });
        notifiedRecipients.add(articleRow.author_member_id);
      }

      // 5b. Parent comment author (reply)
      if (parent_id) {
        const { data: parentComment } = await supabase
          .from('comments')
          .select('member_id')
          .eq('id', parent_id)
          .maybeSingle();
        if (parentComment?.member_id && !notifiedRecipients.has(parentComment.member_id)) {
          await createNotification(supabase, {
            recipient_member_id: parentComment.member_id,
            actor_member_id:     profile.ghost_member_id,
            type:                'reply_to_comment',
            target_type:         'comment',
            target_id:           comment.id,
            target_url:          commentUrl,
            payload:             sharedPayload,
          });
          notifiedRecipients.add(parentComment.member_id);
        }
      }

      // 5c. Mentions. Two paths:
      //   - Structured (preferred): the composer sent a `mentions` array in
      //     the request body. We fire notifications by member_id directly,
      //     no parsing or guessing. Presence of the field (even empty)
      //     means "use this list."
      //   - Free-text fallback: the request body had no `mentions` field
      //     at all (older callers, scripts). We scan the body for @<word>
      //     tokens and only fire when the display_name lookup is
      //     unambiguous. This stays in place until every caller migrates
      //     to the structured field.
      if (cleanMentions !== null) {
        for (const m of cleanMentions) {
          if (notifiedRecipients.has(m.member_id)) continue;
          await createNotification(supabase, {
            recipient_member_id: m.member_id,
            actor_member_id:     profile.ghost_member_id,
            type:                'mention',
            target_type:         'comment',
            target_id:           comment.id,
            target_url:          commentUrl,
            payload:             sharedPayload,
          });
          notifiedRecipients.add(m.member_id);
        }
      } else {
        const tokens = parseMentionTokens(body);
        for (const token of tokens) {
          const { data: matches } = await supabase
            .from('profiles')
            .select('ghost_member_id, display_name')
            .ilike('display_name', token + '%')
            .limit(2);
          if (matches && matches.length === 1) {
            const target = matches[0];
            if (!notifiedRecipients.has(target.ghost_member_id)) {
              await createNotification(supabase, {
                recipient_member_id: target.ghost_member_id,
                actor_member_id:     profile.ghost_member_id,
                type:                'mention',
                target_type:         'comment',
                target_id:           comment.id,
                target_url:          commentUrl,
                payload:             sharedPayload,
              });
              notifiedRecipients.add(target.ghost_member_id);
            }
          }
        }
      }
    } catch (notifErr) {
      console.warn('Comment notification trigger failed:', notifErr.message);
    }

    // Step 6: celebration moment trigger.
    //
    // OG-5 / 1.3-bis: when this is the user's first comment, eagerly
    // log a celebration_events row and return it inline so the
    // composer can pop the celebration modal immediately. Idempotent:
    // we check for an existing 'first_comment' row before inserting,
    // so duplicate triggers (network retries, re-submits) don't
    // create duplicate celebrations. Wrapped so a celebration failure
    // never blocks the comment response — the comment is the
    // primary contract; the celebration is bonus.
    let celebration = null;
    try {
      const { data: existing } = await supabase
        .from('celebration_events')
        .select('id')
        .eq('member_id', profile.ghost_member_id)
        .eq('event_type', 'first_comment')
        .maybeSingle();

      if (!existing) {
        // Look up the comment's actual created_at so the celebration
        // displays the event's original timestamp, not the celebration
        // insert time. For triggers that fire synchronously these are
        // milliseconds apart, but for any backfill or async pipeline
        // the difference is real and meaningful.
        const { data: commentRow } = await supabase
          .from('comments')
          .select('created_at')
          .eq('id', comment.id)
          .maybeSingle();

        const { data: newEvent } = await supabase
          .from('celebration_events')
          .insert({
            member_id:  profile.ghost_member_id,
            event_type: 'first_comment',
            context: {
              comment_id:    comment.id,
              article_slug,
              article_title,
              comment_body:  body,
              event_at:      commentRow?.created_at || new Date().toISOString(),
            },
          })
          .select('id')
          .single();

        // Pull the signature font for the celebration modal to render
        // the contributor's name in their own chosen hand. Default if
        // never picked (Pact signers are auto-set to default).
        const { data: profileSig } = await supabase
          .from('profiles')
          .select('signature_font')
          .eq('ghost_member_id', profile.ghost_member_id)
          .maybeSingle();
        const signature_font = profileSig?.signature_font || 'Mrs Saint Delafield';

        if (newEvent && profile.handle) {
          celebration = {
            id:             newEvent.id,
            event_type:     'first_comment',
            handle:         profile.handle,
            display_name:   profile.display_name,
            signature_font,
            headline:       'First comment posted',
            subhead:        article_title ? 'on ' + article_title : null,
            content_snippet: body,  // the actual comment body, for the modal
            moment_path:    '/contributor/' + profile.handle + '/moment/' + newEvent.id,
          };
        }
      }
    } catch (celErr) {
      console.warn('Celebration trigger failed (non-blocking):', celErr.message);
    }

    return res.status(201).json({
      comment_id:        comment.id,
      status:            comment.status,
      ai_suggested_tier: classification.ai_suggested_tier,
      final_tier,
      commenter_message: classification.commenter_message,
      axis_events_count: axisEvents.length,
      celebration,
    });
  } catch (error) {
    console.error('Comment submission error:', error);
    return res.status(500).json({
      error: 'Comment submission failed',
      detail: error.message,
    });
  }
}
