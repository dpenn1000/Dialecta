/**
 * api/_fp-snapshot.js
 *
 * Helper for capturing fp_snapshots at trigger events. Reads current state
 * from axis_scores, archetypes, and aspirations; composes the
 * fingerprint_data jsonb; inserts the snapshot row; returns it.
 *
 * Each call site decides WHEN to fire and WHICH reason; this helper just
 * executes the capture given those inputs. Idempotent for first_entry and
 * pillar_milestone (won't double-fire); aspiration_declaration,
 * recommitment, and archetype_shift insert unconditionally.
 *
 * PNG rendering is handled separately. The snapshot row is created with
 * png_url=NULL; the client-side renderer paints it later via canvas and
 * calls setSnapshotPngUrl().
 *
 * Spec: memory project_growth_engine_scroll_scope.md
 * Schema: migration 035_growth_engine_schema.sql
 *
 * Every threshold or weight that's a candidate for the future Tuning
 * Engine page is annotated with `// TUNING:` so the page can grep them.
 */

// ─── TUNING knobs ─────────────────────────────────────────────────────────

// TUNING: pillar_milestone thresholds. Each (pillar × threshold) fires
// at most once over a contributor's lifetime. Lower thresholds = more
// frequent captures early in tenure (matches the "frequent early, key
// benchmarks later" curation goal). Locked 2026-05-06.
export const PILLAR_MILESTONE_THRESHOLDS = [5, 10, 20, 50, 100];

// Canonical pillar names — must match the Postgres `axis` enum and the
// Fingerprint engine's FINGERPRINT_AXES keys.
const PILLAR_KEYS = ['acuity', 'calibration', 'magnanimity', 'discourse', 'consistency', 'reach'];

// Default tier_mix used when a pillar has no axis_scores row yet.
const ZERO_TIER_MIX = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 };

// ─── composeFingerprintData ───────────────────────────────────────────────

/**
 * Given axis_scores rows for a contributor, produce the fingerprint_data
 * jsonb payload that fp_snapshots.fingerprint_data stores. Shape matches
 * what the production Fingerprint engine consumes (theme/src/dialecta-
 * fingerprint-engine.jsx FINGERPRINT_AXES).
 *
 * Output:
 *   {
 *     [pillar]: {
 *       graduations:  number,
 *       tier_mix:     { forum, spark, echo, fog, heat, stance },
 *       topic_phases: Array<{topic, count}>,
 *     }
 *   }
 *
 * @param {Array<object>} axisScoresRows  rows from axis_scores for one member
 * @returns {object} fingerprint_data
 */
export function composeFingerprintData(axisScoresRows) {
  const data = {};
  for (const pillar of PILLAR_KEYS) {
    const row = (axisScoresRows || []).find(r => r.axis === pillar);
    data[pillar] = {
      graduations:  row?.graduation_count || 0,
      tier_mix:     row?.tier_mix || { ...ZERO_TIER_MIX },
      topic_phases: row?.topic_history || [],
    };
  }
  return data;
}

// ─── captureSnapshot ──────────────────────────────────────────────────────

/**
 * Capture a fingerprint snapshot for a contributor at a trigger event.
 *
 * Idempotent for first_entry (one per contributor lifetime) and
 * pillar_milestone (one per (pillar × threshold) per contributor).
 * Always inserts for aspiration_declaration / recommitment /
 * archetype_shift — caller is responsible for not firing duplicates.
 *
 * @param {object} supabase   - service-role Supabase client
 * @param {string} memberId   - ghost_member_id
 * @param {string} reason     - one of fp_snapshot_reason enum values
 * @param {object} [options]
 * @param {number} options.threshold  - REQUIRED for pillar_milestone
 * @param {string} options.pillar     - REQUIRED for pillar_milestone
 *
 * @returns {Promise<{snapshot, alreadyExisted}>}
 */
export async function captureSnapshot(supabase, memberId, reason, options = {}) {
  // ─── Idempotency for first_entry ────────────────────────────────────────
  if (reason === 'first_entry') {
    const { data: existing, error } = await supabase
      .from('fp_snapshots')
      .select('*')
      .eq('member_id', memberId)
      .eq('reason', 'first_entry')
      .maybeSingle();
    if (error) throw error;
    if (existing) return { snapshot: existing, alreadyExisted: true };
  }

  // ─── Idempotency for pillar_milestone ───────────────────────────────────
  if (reason === 'pillar_milestone') {
    const { threshold, pillar } = options;
    if (!threshold || !pillar) {
      throw new Error("captureSnapshot('pillar_milestone') requires options.threshold and options.pillar");
    }
    const { data: existingMilestones, error } = await supabase
      .from('fp_snapshots')
      .select('id, fingerprint_data')
      .eq('member_id', memberId)
      .eq('reason', 'pillar_milestone');
    if (error) throw error;
    const matching = (existingMilestones || []).find(s =>
      s.fingerprint_data?.[pillar]?.crossing_threshold === threshold);
    if (matching) {
      // Re-fetch the full row for consistent return shape
      const { data: full } = await supabase
        .from('fp_snapshots').select('*').eq('id', matching.id).single();
      return { snapshot: full || matching, alreadyExisted: true };
    }
  }

  // ─── Fetch current state ────────────────────────────────────────────────
  const [axisRes, archetypeRes, profileRes] = await Promise.all([
    supabase.from('axis_scores')
      .select('axis, graduation_count, tier_mix, topic_history')
      .eq('member_id', memberId),
    supabase.from('archetypes')
      .select('archetype_id')
      .eq('member_id', memberId)
      .maybeSingle(),
    supabase.from('profiles')
      .select('current_aspiration_id')
      .eq('ghost_member_id', memberId)
      .maybeSingle(),
  ]);

  if (axisRes.error)      throw axisRes.error;
  if (archetypeRes.error) throw archetypeRes.error;
  if (profileRes.error)   throw profileRes.error;

  const fingerprint_data = composeFingerprintData(axisRes.data);

  // For pillar_milestone, bake the crossed threshold into the per-axis
  // payload so future detectPillarMilestones() calls can identify which
  // (pillar × threshold) pairs have already been captured without needing
  // a separate index.
  if (reason === 'pillar_milestone') {
    fingerprint_data[options.pillar] = {
      ...fingerprint_data[options.pillar],
      crossing_threshold: options.threshold,
    };
  }

  const archetype_at_capture = archetypeRes.data?.archetype_id || null;

  // ─── Freeze the active aspiration (if any) ──────────────────────────────
  let aspiration_at_capture = null;
  const currentAspId = profileRes.data?.current_aspiration_id;
  if (currentAspId) {
    const { data: aspRow, error: aspErr } = await supabase
      .from('aspirations')
      .select('*')
      .eq('id', currentAspId)
      .maybeSingle();
    if (aspErr) throw aspErr;
    if (aspRow) aspiration_at_capture = aspRow;
  }

  // ─── Insert ─────────────────────────────────────────────────────────────
  const { data: inserted, error: insertErr } = await supabase
    .from('fp_snapshots')
    .insert({
      member_id: memberId,
      reason,
      fingerprint_data,
      archetype_at_capture,
      aspiration_at_capture,
      // captured_at, png_url, annotation, annotation_generated_at,
      // created_at all default
    })
    .select()
    .single();

  if (insertErr) throw insertErr;
  return { snapshot: inserted, alreadyExisted: false };
}

// ─── detectPillarMilestones ───────────────────────────────────────────────

/**
 * Detect newly-crossed pillar_milestone events for a contributor based on
 * current axis_scores. Returns the (pillar, threshold) pairs that should
 * fire snapshots — caller invokes captureSnapshot() for each.
 *
 * Algorithm: for each pillar's current graduation_count, surface every
 * threshold T such that graduation_count >= T AND no fp_snapshots row
 * exists with (member_id, reason='pillar_milestone', and
 * fingerprint_data[pillar].crossing_threshold = T).
 *
 * @param {object} supabase   - service-role Supabase client
 * @param {string} memberId   - ghost_member_id
 * @returns {Promise<Array<{pillar: string, threshold: number}>>}
 */
export async function detectPillarMilestones(supabase, memberId) {
  const [axisRes, milestoneRes] = await Promise.all([
    supabase.from('axis_scores')
      .select('axis, graduation_count')
      .eq('member_id', memberId),
    supabase.from('fp_snapshots')
      .select('fingerprint_data')
      .eq('member_id', memberId)
      .eq('reason', 'pillar_milestone'),
  ]);

  if (axisRes.error)      throw axisRes.error;
  if (milestoneRes.error) throw milestoneRes.error;

  // Set of already-captured pairs as "pillar:threshold"
  const captured = new Set();
  for (const ms of milestoneRes.data || []) {
    for (const pillar of PILLAR_KEYS) {
      const xt = ms.fingerprint_data?.[pillar]?.crossing_threshold;
      if (typeof xt === 'number') captured.add(`${pillar}:${xt}`);
    }
  }

  const fires = [];
  for (const row of axisRes.data || []) {
    const pillar = row.axis;
    if (!PILLAR_KEYS.includes(pillar)) continue;
    const grad = row.graduation_count || 0;
    for (const t of PILLAR_MILESTONE_THRESHOLDS) {
      if (grad >= t && !captured.has(`${pillar}:${t}`)) {
        fires.push({ pillar, threshold: t });
      }
    }
  }
  return fires;
}

// ─── isFirstActivity ──────────────────────────────────────────────────────

/**
 * Returns true if this contributor has no comments and no non-draft
 * articles besides the one currently being submitted. Used by call sites
 * to decide whether to fire 'first_entry' on a comment/article submission.
 *
 * @param {object} supabase
 * @param {string} memberId
 * @param {object} [options]
 * @param {string|null} [options.excludeCommentId]  - ignore this comment id
 * @param {string|null} [options.excludeArticleId]  - ignore this article id
 */
export async function isFirstActivity(supabase, memberId, options = {}) {
  const { excludeCommentId, excludeArticleId } = options;

  let commentQuery = supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('member_id', memberId);
  if (excludeCommentId) commentQuery = commentQuery.neq('id', excludeCommentId);

  let articleQuery = supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('author_member_id', memberId)
    .neq('status', 'draft');
  if (excludeArticleId) articleQuery = articleQuery.neq('id', excludeArticleId);

  const [commentRes, articleRes] = await Promise.all([commentQuery, articleQuery]);

  const commentCount = commentRes.count || 0;
  const articleCount = articleRes.count || 0;

  return commentCount === 0 && articleCount === 0;
}

// ─── setSnapshotPngUrl ────────────────────────────────────────────────────

/**
 * Set the png_url on an fp_snapshots row after the client renderer
 * uploads the PNG to storage. Returns the updated row.
 *
 * @param {object} supabase
 * @param {string} snapshotId  - fp_snapshots.id (uuid)
 * @param {string} pngUrl      - public Supabase storage URL
 */
export async function setSnapshotPngUrl(supabase, snapshotId, pngUrl) {
  const { data, error } = await supabase
    .from('fp_snapshots')
    .update({ png_url: pngUrl })
    .eq('id', snapshotId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── curateSnapshots ──────────────────────────────────────────────────────

/**
 * Curate the full set of fp_snapshots for a contributor into the subset that
 * surfaces in the Growth History Scroll, plus compression annotations
 * between adjacent surfaced entries.
 *
 * v1 algorithm (simple, captures the spirit of the dynamic-timeline spec
 * without the full 5-subscore percentile normalization):
 *
 *   1. Always-surface lifecycle events: first_entry, aspiration_declaration,
 *      recommitment, archetype_shift. These are inherently meaningful.
 *   2. For pillar_milestone: surface ALL if total fits in maxVisible cap;
 *      otherwise prioritize peak-per-pillar (highest threshold reached for
 *      each axis), then most-recent until the cap is hit.
 *   3. Generate gap annotations between adjacent surfaced entries that
 *      absorb >= 1 unsurfaced snapshot. Wording graduates by gap length.
 *
 * Refinement to add later: per-contributor delta percentile, direction-
 * change detection (axis reversals), recency curve. For first launch this
 * version is enough — it ALWAYS keeps the load-bearing events visible and
 * never drops a meaningful moment.
 *
 * @param {Array<object>} snapshots  - fp_snapshots rows for one member
 * @param {object} [options]
 * @param {number} [options.maxVisible=8]  - cap on surfaced entries
 * @returns {object} { total_captured, surfaced, gaps, timeline }
 */
export function curateSnapshots(snapshots, options = {}) {
  const MAX_VISIBLE = options.maxVisible || 8;
  const ALWAYS_SURFACE = new Set([
    'first_entry',
    'aspiration_declaration',
    'recommitment',
    'archetype_shift',
  ]);

  const sorted = [...(snapshots || [])].sort(
    (a, b) => new Date(a.captured_at) - new Date(b.captured_at)
  );

  if (sorted.length === 0) {
    return { total_captured: 0, surfaced: [], gaps: [], timeline: [] };
  }

  const lifecycleSurfaced = sorted.filter(s => ALWAYS_SURFACE.has(s.reason));
  const milestones = sorted.filter(s => s.reason === 'pillar_milestone');

  // Helper: extract (pillar, threshold) from a milestone's fingerprint_data.
  function milestonePeak(snapshot) {
    const data = snapshot.fingerprint_data || {};
    let pillar = null;
    let threshold = 0;
    for (const [k, v] of Object.entries(data)) {
      if (typeof v?.crossing_threshold === 'number' && v.crossing_threshold > threshold) {
        pillar = k;
        threshold = v.crossing_threshold;
      }
    }
    return { pillar, threshold };
  }

  let surfacedSet;
  if (lifecycleSurfaced.length + milestones.length <= MAX_VISIBLE) {
    surfacedSet = new Set(sorted.map(s => s.id));
  } else {
    surfacedSet = new Set(lifecycleSurfaced.map(s => s.id));
    const remaining = MAX_VISIBLE - surfacedSet.size;

    // Step A: peak-per-pillar (highest threshold reached for each axis)
    const peakByPillar = new Map();
    for (const ms of milestones) {
      const { pillar, threshold } = milestonePeak(ms);
      if (!pillar) continue;
      const existing = peakByPillar.get(pillar);
      if (!existing || existing.threshold < threshold) {
        peakByPillar.set(pillar, { snapshot: ms, threshold });
      }
    }
    const peakIds = new Set(Array.from(peakByPillar.values()).map(p => p.snapshot.id));

    // Step B: add peaks until cap, then most-recent non-peak milestones
    let added = 0;
    for (const id of peakIds) {
      if (added >= remaining) break;
      surfacedSet.add(id);
      added += 1;
    }
    if (added < remaining) {
      const recentNonPeak = [...milestones]
        .reverse()
        .filter(m => !peakIds.has(m.id));
      for (const m of recentNonPeak) {
        if (added >= remaining) break;
        surfacedSet.add(m.id);
        added += 1;
      }
    }
  }

  const surfaced = sorted.filter(s => surfacedSet.has(s.id));

  // Compression annotations between adjacent surfaced entries
  const gaps = [];
  for (let i = 0; i < surfaced.length - 1; i++) {
    const left = surfaced[i];
    const right = surfaced[i + 1];
    const leftTs = new Date(left.captured_at);
    const rightTs = new Date(right.captured_at);
    const absorbedCount = sorted.filter(s =>
      !surfacedSet.has(s.id) &&
      new Date(s.captured_at) > leftTs &&
      new Date(s.captured_at) < rightTs
    ).length;
    if (absorbedCount > 0) {
      const days = Math.max(1, Math.round((rightTs - leftTs) / 86400000));
      gaps.push({
        between: [left.id, right.id],
        absorbed_count: absorbedCount,
        annotation: gapAnnotation(days, absorbedCount),
      });
    }
  }

  // Timeline: lightweight summary of every capture (surfaced + absorbed) so
  // the synced timeline cursor in the scroll has the full set of markers
  // to render.
  const timeline = sorted.map(s => ({
    id: s.id,
    captured_at: s.captured_at,
    reason: s.reason,
    surfaced: surfacedSet.has(s.id),
  }));

  return {
    total_captured: sorted.length,
    surfaced,
    gaps,
    timeline,
  };
}

function gapAnnotation(days, absorbedCount) {
  if (days < 14) {
    return `Continued development across ${absorbedCount} captures.`;
  }
  if (days < 60) {
    const weeks = Math.max(1, Math.round(days / 7));
    return `${weeks} weeks of steady development.`;
  }
  if (days < 365) {
    const months = Math.max(1, Math.round(days / 30));
    return `${months} months of development without structural shift.`;
  }
  const years = Math.max(1, Math.round(days / 365));
  return `${years} ${years === 1 ? 'year' : 'years'} of accumulated development.`;
}

// ─── detectArchetypeShift ─────────────────────────────────────────────────

/**
 * Returns the prior archetype_id for this contributor by inspecting the
 * archetypes.history jsonb. If the most recent assignment in history
 * differs from the current archetype_id, an archetype_shift snapshot
 * should fire.
 *
 * Returns { shifted, fromArchetype, toArchetype }:
 *   - shifted: boolean
 *   - fromArchetype: previous archetype slug (or null if no history)
 *   - toArchetype: current archetype slug
 *
 * Schema reference: archetypes table has archetype_id (current) and
 * history (jsonb array of prior assignments). The exact shape of history
 * entries depends on the archetype-assignment writer; this helper is
 * intentionally tolerant of missing/empty history.
 *
 * @param {object} supabase
 * @param {string} memberId
 */
export async function detectArchetypeShift(supabase, memberId) {
  const { data: row, error } = await supabase
    .from('archetypes')
    .select('archetype_id, history')
    .eq('member_id', memberId)
    .maybeSingle();
  if (error) throw error;
  if (!row) return { shifted: false, fromArchetype: null, toArchetype: null };

  const currentArchetype = row.archetype_id;
  const history = Array.isArray(row.history) ? row.history : [];
  // Find the most recent entry whose archetype differs from current.
  // History entries are expected to contain at least { archetype_id }.
  let priorArchetype = null;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i] || {};
    if (h.archetype_id && h.archetype_id !== currentArchetype) {
      priorArchetype = h.archetype_id;
      break;
    }
  }

  return {
    shifted: priorArchetype !== null,
    fromArchetype: priorArchetype,
    toArchetype: currentArchetype,
  };
}
