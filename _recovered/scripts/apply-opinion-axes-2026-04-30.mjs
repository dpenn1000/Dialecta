/**
 * scripts/apply-opinion-axes-2026-04-30.mjs
 *
 * One-shot writer: applies the user-approved opinion_axes pairs from the
 * 2026-04-30 backfill review session. Article 3 (solar) is hand-crafted
 * because the AI-generated "Vendor timelines" axis was incoherent against
 * the article's argument; the other four use the AI's dry-run output that
 * passed validation on first or second attempt.
 *
 * Usage:
 *   node scripts/apply-opinion-axes-2026-04-30.mjs           # dry-run
 *   node scripts/apply-opinion-axes-2026-04-30.mjs --apply   # commit
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
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

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const apply = process.argv.includes('--apply');

const UPDATES = [
  {
    ghost_post_id: '69f2937b4e51770001fb5218',  // Transformation
    axes: [
      { type: 'cartesian', topic: 'Source of aliveness',  axis_a: 'External novelty', axis_b: 'Internal presence' },
      { type: 'cartesian', topic: 'Change and avoidance', axis_a: 'Escape pattern',   axis_b: 'Intentional shift' },
    ],
  },
  {
    ghost_post_id: '69f2594b4e51770001fb51d7',  // Education free
    axes: [
      { type: 'cartesian', topic: 'Funding model',    axis_a: 'Public investment', axis_b: 'Market-based' },
      { type: 'cartesian', topic: 'Cost feasibility', axis_a: 'Burden manageable', axis_b: 'Unsustainable' },
    ],
  },
  {
    ghost_post_id: '69d5c5c083cd72000193f0cd',  // Solar (HAND-CRAFTED)
    axes: [
      { type: 'cartesian', topic: 'Evidence vintage',   axis_a: 'Current data',       axis_b: 'Received wisdom' },
      { type: 'cartesian', topic: 'Read of opposition', axis_a: 'Outdated heuristic', axis_b: 'Rational caution' },
    ],
  },
  {
    ghost_post_id: '69efc475e5eec200010d5299',  // Faith (Maya)
    axes: [
      { type: 'cartesian', topic: 'Doubt and faith', axis_a: 'Obstacle',    axis_b: 'Constitutive' },
      { type: 'cartesian', topic: 'Practice stance', axis_a: 'Provisional', axis_b: 'Settled' },
    ],
  },
  {
    ghost_post_id: '69eff72be5eec200010d5310',  // Meaning / scarcity
    axes: [
      { type: 'cartesian', topic: 'Human nature freed', axis_a: 'Toward meaning',     axis_b: 'Toward distraction' },
      { type: 'cartesian', topic: "Constraint's role",  axis_a: 'Obstacle to growth', axis_b: 'Condition for depth' },
    ],
  },
];

console.log('Mode:', apply ? 'APPLY' : 'DRY RUN');

for (const u of UPDATES) {
  const { data: row, error: fetchErr } = await sb
    .from('articles')
    .select('id, declaration')
    .eq('ghost_post_id', u.ghost_post_id)
    .maybeSingle();
  if (fetchErr || !row) {
    console.error(`✗ ${u.ghost_post_id}: ${fetchErr?.message || 'not found'}`);
    continue;
  }
  const newDecl = { ...(row.declaration || {}), opinion_axes: u.axes };
  if (apply) {
    const { error: upErr } = await sb
      .from('articles')
      .update({ declaration: newDecl, updated_at: new Date().toISOString() })
      .eq('id', row.id);
    if (upErr) {
      console.error(`✗ ${u.ghost_post_id}: write failed ${upErr.message}`);
    } else {
      console.log(`✓ ${u.ghost_post_id}: updated`);
    }
  } else {
    console.log(`would update ${u.ghost_post_id}:`, JSON.stringify(u.axes));
  }
}

console.log(apply ? 'APPLY done.' : 'DRY RUN done. Re-run with --apply to commit.');
