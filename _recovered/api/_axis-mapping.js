/**
 * api/_axis-mapping.js
 *
 * Implements Dialecta_Axis_Mapping_v1.md — the canonical function from a
 * comment's Stage A/B classification to the axis_events records that
 * shape the contributor's Fingerprint.
 *
 * Pure data → data; no Supabase calls inside deriveAxisEvents. Side
 * effects (insert into axis_events, recompute axis_scores) live on
 * the writers below (recomputeAxisScores, getMemberTopicHistory).
 *
 * Every threshold or weight that's a candidate for the future Tuning
 * Engine page is annotated with `// TUNING:` so the page can grep them.
 *
 * Spec: Dialecta_Axis_Mapping_v1.md
 * Charter for the tuning page: Dialecta_Tuning_Engine_Spec_v1.md
 */

// ─── TUNING knobs ─────────────────────────────────────────────────────────

// TUNING: Acuity specificity threshold (Dialecta_Axis_Mapping_v1)
const ACUITY_SPECIFICITY_MIN = 1;

// TUNING: Acuity tier eligibility — only Forum and Spark have meaningful claims
const ACUITY_ELIGIBLE_TIERS = new Set(['forum', 'spark']);

// TUNING: Calibration specificity threshold
const CALIBRATION_SPECIFICITY_MIN = 1;

// TUNING: Magnanimity opposing-view engagement levels (both treated equal in v1)
const MAGNANIMITY_ELIGIBLE = new Set(['yes', 'partially']);

// TUNING: Discourse engagement level — currently 'specific' only; 'general' could earn partial
const DISCOURSE_ELIGIBLE_ENGAGEMENT = new Set(['specific']);

// Tiers that produce no axis_events at all (suppressed; don't shape identity).
// Per spec: Breach is the only one. Echo/Fog/Heat/Stance still earn Consistency.
const SUPPRESSED_TIERS = new Set(['breach']);

// Canonical pillar names — must match the Postgres `axis` enum.
const ALL_AXES = ['acuity', 'reach', 'calibration', 'magnanimity', 'discourse', 'consistency'];

// Canonical tier keys — must match the Postgres `tier` enum.
const ALL_TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// ─── deriveAxisEvents — pure mapping function ─────────────────────────────

/**
 * Apply the v1 axis mapping to one comment's classification.
 *
 * @param {object} args
 * @param {object} args.classification        - The Stage A/B classification fields
 * @param {string} args.memberId              - ghost_member_id of the commenter
 * @param {string} args.commentId             - id of the comments row
 * @param {string} args.classificationId      - id of the classifications row
 * @param {string|null} args.articleTopic     - Article's primary_tag slug (Reach signal)
 * @param {Set<string>} args.priorTopics      - Topics this member has already engaged
 * @returns {Array<object>} Array of axis_events rows, ready for insert
 */
export function deriveAxisEvents({
  classification,
  memberId,
  commentId,
  classificationId,
  articleTopic,
  priorTopics,
}) {
  const finalTier = classification.final_tier || classification.ai_suggested_tier;
  if (!finalTier)                  return [];
  if (SUPPRESSED_TIERS.has(finalTier)) return [];

  const events = [];
  const baseFields = {
    member_id:         memberId,
    classification_id: classificationId,
    comment_id:        commentId,
    tier:              finalTier,
  };

  const specificity   = typeof classification.specificity_score === 'number' ? classification.specificity_score : 0;
  const tribalMarkers = Boolean(classification.tribal_markers);
  const opposingView  = classification.opposing_view_engaged || 'no';
  const engagement    = classification.article_engagement    || 'none';

  // Acuity — specific claim AND tier ∈ {forum, spark}.
  if (specificity >= ACUITY_SPECIFICITY_MIN && ACUITY_ELIGIBLE_TIERS.has(finalTier)) {
    events.push({ ...baseFields, axis: 'acuity', topic: null });
  }

  // Reach — NEW topic for this member. Only fires when articleTopic is
  // known and not in priorTopics. priorTopics comes from the member's
  // existing axis_scores.topic_history (queried via getMemberTopicHistory).
  if (articleTopic && !priorTopics.has(articleTopic)) {
    events.push({ ...baseFields, axis: 'reach', topic: articleTopic });
  }

  // Calibration — specific claim AND not tribal. Emotion is intentionally
  // NOT gated; passion-with-substance is calibrated. The anti-signal is
  // tribal framing.
  if (specificity >= CALIBRATION_SPECIFICITY_MIN && !tribalMarkers) {
    events.push({ ...baseFields, axis: 'calibration', topic: null });
  }

  // Magnanimity — opposing view engaged (yes or partially, equal weight in v1).
  if (MAGNANIMITY_ELIGIBLE.has(opposingView)) {
    events.push({ ...baseFields, axis: 'magnanimity', topic: null });
  }

  // Discourse — specific engagement with the article.
  if (DISCOURSE_ELIGIBLE_ENGAGEMENT.has(engagement)) {
    events.push({ ...baseFields, axis: 'discourse', topic: null });
  }

  // Consistency — every non-Breach comment counts. Returning to the
  // conversation IS the signal.
  events.push({ ...baseFields, axis: 'consistency', topic: null });

  return events;
}

// ─── deriveArticleAxisEvents — same pattern, applied to a published article ───

/**
 * Apply the v1.1 axis mapping to one published article. Per spec: same
 * triggers as comments EXCEPT Discourse is not fired by articles
 * (Discourse measures sustained back-and-forth — a comment-specific
 * concept; articles START conversations).
 *
 * @param {object} args
 * @param {object} args.aiAnalysis         - The article's ai_analysis jsonb
 *                                            (specificity_score, tribal_markers,
 *                                             opposing_view_engaged, etc.)
 * @param {string} args.finalTier          - Article's final_tier
 * @param {string} args.authorMemberId     - ghost_member_id of the author
 * @param {string} args.articleId          - ghost_post_id of the article
 * @param {string|null} args.articleTopic  - Article's primary_tag slug (Reach signal)
 * @param {Set<string>} args.priorTopics   - Topics the author has already engaged
 * @returns {Array<object>} Array of axis_events rows ready for insert
 */
export function deriveArticleAxisEvents({
  aiAnalysis,
  finalTier,
  authorMemberId,
  articleId,
  articleTopic,
  priorTopics,
}) {
  if (!finalTier)                     return [];
  if (SUPPRESSED_TIERS.has(finalTier)) return [];

  const events = [];
  const baseFields = {
    member_id:         authorMemberId,
    classification_id: null,
    comment_id:        null,
    article_id:        articleId,
    source:            'article',
    tier:              finalTier,
  };

  const a              = aiAnalysis || {};
  const specificity    = typeof a.specificity_score === 'number' ? a.specificity_score : 0;
  const tribalMarkers  = Boolean(a.tribal_markers);
  const opposingView   = a.opposing_view_engaged || 'no';

  // Acuity — same trigger as comments
  if (specificity >= ACUITY_SPECIFICITY_MIN && ACUITY_ELIGIBLE_TIERS.has(finalTier)) {
    events.push({ ...baseFields, axis: 'acuity', topic: null });
  }

  // Reach — same trigger: NEW topic for this author
  if (articleTopic && !priorTopics.has(articleTopic)) {
    events.push({ ...baseFields, axis: 'reach', topic: articleTopic });
  }

  // Calibration — same trigger
  if (specificity >= CALIBRATION_SPECIFICITY_MIN && !tribalMarkers) {
    events.push({ ...baseFields, axis: 'calibration', topic: null });
  }

  // Magnanimity — same trigger; the "Strongest Objection" declaration is
  // exactly this signal at the article level
  if (MAGNANIMITY_ELIGIBLE.has(opposingView)) {
    events.push({ ...baseFields, axis: 'magnanimity', topic: null });
  }

  // Discourse — INTENTIONALLY OMITTED for articles. Articles start
  // conversations rather than continuing them; Discourse is comment-
  // specific. See Dialecta_Axis_Mapping_v1.1 for rationale.

  // Consistency — publishing IS showing up
  events.push({ ...baseFields, axis: 'consistency', topic: null });

  return events;
}

// ─── recomputeAxisScores — replay the ledger for one member ───────────────

/**
 * Recompute axis_scores for a single member by replaying their axis_events.
 *
 * Per Data Architecture: "recomputed from the axis_events ledger after each
 * event — never accumulated incrementally — which eliminates floating-point
 * drift and keeps the materialized state honest." Replay-from-ledger is
 * also the right shape for the malleability-edit path: when a comment is
 * re-classified, prior axis_events for that classification are deleted
 * and new ones appended; a full replay always reconciles.
 *
 * Cost: at our scale this is bounded. A heavy contributor with thousands
 * of comments still resolves in milliseconds. If/when scale forces it,
 * incremental updates per the same TUNING knob can replace this.
 *
 * @param {object} supabase - Supabase service-role client
 * @param {string} memberId - ghost_member_id whose axis_scores to refresh
 */
export async function recomputeAxisScores(supabase, memberId) {
  const { data: events, error } = await supabase
    .from('axis_events')
    .select('axis, tier, topic')
    .eq('member_id', memberId);
  if (error) throw error;

  const perAxis = {};
  for (const a of ALL_AXES) {
    perAxis[a] = {
      graduation_count: 0,
      tier_mix:         Object.fromEntries(ALL_TIERS.map(t => [t, 0])),
      topic_history:    new Set(),
    };
  }

  for (const ev of events || []) {
    const bucket = perAxis[ev.axis];
    if (!bucket) continue;
    bucket.graduation_count += 1;
    if (ev.tier && bucket.tier_mix[ev.tier] !== undefined) {
      bucket.tier_mix[ev.tier] += 1;
    }
    if (ev.topic) bucket.topic_history.add(ev.topic);
  }

  const rows = ALL_AXES.map(axis => ({
    member_id:        memberId,
    axis,
    graduation_count: perAxis[axis].graduation_count,
    tier_mix:         perAxis[axis].tier_mix,
    topic_history:    [...perAxis[axis].topic_history],
    comment_count:    perAxis[axis].graduation_count,
    last_updated:     new Date().toISOString(),
  }));

  const { error: upsertErr } = await supabase
    .from('axis_scores')
    .upsert(rows, { onConflict: 'member_id,axis' });
  if (upsertErr) throw upsertErr;
}

// ─── getMemberTopicHistory — Reach detection prerequisite ─────────────────

/**
 * Get the set of topics this member has already engaged. Sourced from
 * axis_scores.topic_history (the Reach axis row). Returns an empty set if
 * the member has no axis_scores row yet (first-time commenter).
 *
 * Used by deriveAxisEvents to decide whether the current article's topic
 * is "new" for Reach purposes.
 *
 * @param {object} supabase
 * @param {string} memberId
 * @returns {Promise<Set<string>>}
 */
export async function getMemberTopicHistory(supabase, memberId) {
  const { data, error } = await supabase
    .from('axis_scores')
    .select('topic_history')
    .eq('member_id', memberId)
    .eq('axis', 'reach')
    .maybeSingle();
  if (error) throw error;
  const arr = Array.isArray(data?.topic_history) ? data.topic_history : [];
  return new Set(arr);
}

// ─── deletePriorAxisEventsForClassification — re-classify path ────────────

/**
 * Used by the comment edit / re-classify path (PATCH /api/comment/:id).
 * When a comment's classification is replaced (re-run during the
 * malleability window), prior axis_events tied to the old classification
 * row need to be removed before new ones are appended. Caller then runs
 * recomputeAxisScores to refresh axis_scores from the new ledger state.
 *
 * @param {object} supabase
 * @param {string} classificationId
 */
export async function deletePriorAxisEventsForClassification(supabase, classificationId) {
  const { error } = await supabase
    .from('axis_events')
    .delete()
    .eq('classification_id', classificationId);
  if (error) throw error;
}
