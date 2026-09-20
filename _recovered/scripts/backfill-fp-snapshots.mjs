/**
 * scripts/backfill-fp-snapshots.mjs
 *
 * One-shot backfill of fp_snapshots for existing contributors. For each
 * profile with platform activity, captures:
 *   - first_entry: timestamp of first comment OR first non-draft article,
 *                  fingerprint state computed by replaying axis_events to
 *                  that point.
 *   - pillar_milestone (×N per pillar): for each axis where the current
 *                  graduation_count crosses thresholds {5, 10, 20, 50, 100},
 *                  finds the threshold-th axis_event for that (member, axis)
 *                  and uses its created_at as the captured_at. Fingerprint
 *                  state computed by replaying axis_events to that point.
 *
 * Already-captured snapshots are detected and skipped (idempotent re-runs).
 *
 * SAFETY: dry-run by default. Pass --apply to actually write.
 *
 * Usage:
 *   node scripts/backfill-fp-snapshots.mjs                  # dry-run all members
 *   node scripts/backfill-fp-snapshots.mjs --apply          # WRITE all members
 *   node scripts/backfill-fp-snapshots.mjs --member=<uuid>  # dry-run one
 *   node scripts/backfill-fp-snapshots.mjs --member=<uuid> --apply
 *
 * Env (read from .env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *
 * Writes a JSON log next to the script for review.
 *
 * Limitations:
 *   - topic_phases on backfilled snapshots use CURRENT axis_scores.topic_history
 *     rather than replayed history. Topics that were added later will appear
 *     in earlier-dated snapshots. Acceptable inaccuracy for backfill.
 *   - aspiration_at_capture is null for all backfill snapshots since the
 *     aspirations table was empty when these events occurred.
 *   - archetype_at_capture is set to whatever archetypes.archetype_id is
 *     today (typically 'forming' for early users). archetype_shift snapshots
 *     are NOT backfilled — only the archetype-assignment writer (when built)
 *     will fire those.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── Load .env.local ──────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ─── CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const memberArg = args.find(a => a.startsWith('--member='));
const SINGLE_MEMBER = memberArg ? memberArg.slice('--member='.length) : null;

// ─── Constants ────────────────────────────────────────────────────────────
const PILLAR_KEYS = ['acuity', 'calibration', 'magnanimity', 'discourse', 'consistency', 'reach'];
const PILLAR_MILESTONE_THRESHOLDS = [5, 10, 20, 50, 100];
const ZERO_TIER_MIX = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 };

// ─── Helpers ──────────────────────────────────────────────────────────────

function fingerprintAtTimestamp(eventsByAxis, currentTopicHistoryByAxis, asOfDate) {
  const data = {};
  for (const pillar of PILLAR_KEYS) {
    const evs = (eventsByAxis[pillar] || []).filter(
      e => new Date(e.created_at) <= asOfDate
    );
    const tier_mix = { ...ZERO_TIER_MIX };
    for (const e of evs) {
      if (tier_mix[e.tier] !== undefined) tier_mix[e.tier] += 1;
    }
    data[pillar] = {
      graduations: evs.length,
      tier_mix,
      // Limitation: using CURRENT topic_history, not historical. See doc.
      topic_phases: currentTopicHistoryByAxis[pillar] || [],
    };
  }
  return data;
}

async function backfillMember(memberId, displayName) {
  const log = { memberId, displayName, actions: [] };

  // 1. Find first activity timestamp
  const [firstCommentRes, firstArticleRes] = await Promise.all([
    supabase
      .from('comments')
      .select('created_at')
      .eq('member_id', memberId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('articles')
      .select('created_at')
      .eq('author_member_id', memberId)
      .neq('status', 'draft')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  const ts = [firstCommentRes.data?.created_at, firstArticleRes.data?.created_at].filter(Boolean);
  if (ts.length === 0) {
    log.actions.push({ action: 'skip', reason: 'no comments or articles' });
    return log;
  }
  ts.sort();
  const firstActivity = new Date(ts[0]);

  // 2. Fetch all axis_events for this member, ordered ascending
  const { data: events, error: eventsErr } = await supabase
    .from('axis_events')
    .select('id, axis, tier, created_at')
    .eq('member_id', memberId)
    .order('created_at', { ascending: true });
  if (eventsErr) throw eventsErr;

  const eventsByAxis = {};
  for (const pillar of PILLAR_KEYS) eventsByAxis[pillar] = [];
  for (const e of events || []) {
    if (eventsByAxis[e.axis]) eventsByAxis[e.axis].push(e);
  }

  // 3. Fetch current axis_scores.topic_history per pillar (limitation noted)
  const { data: scoresRows, error: scoresErr } = await supabase
    .from('axis_scores')
    .select('axis, topic_history')
    .eq('member_id', memberId);
  if (scoresErr) throw scoresErr;
  const currentTopicHistoryByAxis = {};
  for (const pillar of PILLAR_KEYS) currentTopicHistoryByAxis[pillar] = [];
  for (const r of scoresRows || []) {
    if (currentTopicHistoryByAxis[r.axis] !== undefined) {
      currentTopicHistoryByAxis[r.axis] = r.topic_history || [];
    }
  }

  // 4. Fetch current archetype
  const { data: archetypeRow } = await supabase
    .from('archetypes')
    .select('archetype_id')
    .eq('member_id', memberId)
    .maybeSingle();
  const currentArchetype = archetypeRow?.archetype_id || null;

  // 5. Fetch existing fp_snapshots for idempotency
  const { data: existing, error: existingErr } = await supabase
    .from('fp_snapshots')
    .select('id, reason, fingerprint_data')
    .eq('member_id', memberId);
  if (existingErr) throw existingErr;

  const hasFirstEntry = (existing || []).some(s => s.reason === 'first_entry');
  const capturedMilestones = new Set();
  for (const s of existing || []) {
    if (s.reason !== 'pillar_milestone') continue;
    for (const pillar of PILLAR_KEYS) {
      const xt = s.fingerprint_data?.[pillar]?.crossing_threshold;
      if (typeof xt === 'number') capturedMilestones.add(`${pillar}:${xt}`);
    }
  }

  // 6. Compose first_entry insert (if not already present)
  if (!hasFirstEntry) {
    const fp = fingerprintAtTimestamp(eventsByAxis, currentTopicHistoryByAxis, firstActivity);
    const row = {
      member_id: memberId,
      captured_at: firstActivity.toISOString(),
      reason: 'first_entry',
      fingerprint_data: fp,
      archetype_at_capture: currentArchetype,
      aspiration_at_capture: null,
    };
    if (APPLY) {
      const { error } = await supabase.from('fp_snapshots').insert(row);
      if (error) throw error;
    }
    log.actions.push({
      action: APPLY ? 'inserted' : 'would-insert',
      reason: 'first_entry',
      captured_at: row.captured_at,
      total_graduations: PILLAR_KEYS.reduce((sum, p) => sum + fp[p].graduations, 0),
    });
  } else {
    log.actions.push({ action: 'skip', reason: 'first_entry already exists' });
  }

  // 7. Compose pillar_milestone inserts for any newly-crossed thresholds
  for (const pillar of PILLAR_KEYS) {
    const evs = eventsByAxis[pillar];
    for (const t of PILLAR_MILESTONE_THRESHOLDS) {
      const key = `${pillar}:${t}`;
      if (capturedMilestones.has(key)) continue;
      if (evs.length < t) continue;

      const crossingEvent = evs[t - 1]; // index t-1 = the t-th event
      const crossingTime = new Date(crossingEvent.created_at);
      const fp = fingerprintAtTimestamp(eventsByAxis, currentTopicHistoryByAxis, crossingTime);
      // Bake the threshold into this snapshot's pillar so future
      // detectPillarMilestones can identify already-captured pairs.
      fp[pillar] = { ...fp[pillar], crossing_threshold: t };

      const row = {
        member_id: memberId,
        captured_at: crossingTime.toISOString(),
        reason: 'pillar_milestone',
        fingerprint_data: fp,
        archetype_at_capture: currentArchetype,
        aspiration_at_capture: null,
      };
      if (APPLY) {
        const { error } = await supabase.from('fp_snapshots').insert(row);
        if (error) throw error;
      }
      log.actions.push({
        action: APPLY ? 'inserted' : 'would-insert',
        reason: 'pillar_milestone',
        pillar,
        threshold: t,
        captured_at: row.captured_at,
      });
    }
  }

  return log;
}

// ─── Main ─────────────────────────────────────────────────────────────────
async function main() {
  console.log(`fp_snapshots backfill — ${APPLY ? 'APPLY MODE' : 'DRY RUN'}`);
  if (SINGLE_MEMBER) console.log(`scope: single member ${SINGLE_MEMBER}`);

  let profilesQuery = supabase
    .from('profiles')
    .select('ghost_member_id, display_name')
    .order('updated_at', { ascending: true });
  if (SINGLE_MEMBER) {
    profilesQuery = profilesQuery.eq('ghost_member_id', SINGLE_MEMBER);
  }
  const { data: profiles, error: pErr } = await profilesQuery;
  if (pErr) throw pErr;

  const allLogs = [];
  for (const p of profiles || []) {
    const memberId = p.ghost_member_id;
    const name = p.display_name || '(no name)';
    console.log(`\n[${name}] ${memberId.slice(0, 8)}…`);
    try {
      const memberLog = await backfillMember(memberId, name);
      for (const action of memberLog.actions) {
        const tag = action.action === 'inserted' ? '✓'
                  : action.action === 'would-insert' ? '·'
                  : '–';
        const desc = action.reason
          + (action.pillar ? `:${action.pillar}` : '')
          + (action.threshold ? `=${action.threshold}` : '')
          + (action.captured_at ? ` @ ${action.captured_at}` : '');
        console.log(`  ${tag} ${desc}`);
      }
      allLogs.push(memberLog);
    } catch (err) {
      console.error(`  ! error:`, err.message);
      allLogs.push({ memberId, displayName: name, error: err.message });
    }
  }

  // Write log file
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = APPLY ? 'apply' : 'dryrun';
  const logPath = path.resolve(__dirname, `backfill-fp-snapshots-${ts}-${suffix}.log.json`);
  fs.writeFileSync(logPath, JSON.stringify(allLogs, null, 2));
  console.log(`\nLog written to ${logPath}`);

  // Summary
  let totalActions = 0;
  let inserts = 0;
  let skips = 0;
  for (const l of allLogs) {
    for (const a of l.actions || []) {
      totalActions += 1;
      if (a.action === 'inserted' || a.action === 'would-insert') inserts += 1;
      if (a.action === 'skip') skips += 1;
    }
  }
  console.log(`\nSummary: ${profiles?.length ?? 0} profiles, ${inserts} ${APPLY ? 'inserts' : 'would-insert'}, ${skips} skips, ${totalActions} total actions`);
  if (!APPLY) console.log(`\nRe-run with --apply to write.`);
}

main().then(() => process.exit(0)).catch(err => {
  console.error('fatal:', err);
  process.exit(1);
});
