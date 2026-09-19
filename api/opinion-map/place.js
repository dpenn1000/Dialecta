/**
 * api/opinion-map/place.js
 *
 * Records a reader's placement on an opinion map. Writes to
 * opinion_map_positions, upserting on (reader_id, article_id, map_index,
 * stage) so a reader can revise their placement by tapping again.
 *
 * Pre-read placements are captured at the top of an article (before the
 * body) and post-read placements at the bottom (after). The Delta Mechanic
 * eventually compares the two for paired records.
 *
 * Authenticated members only. Anonymous placements are not supported in
 * this version (the schema requires reader_id).
 *
 * POST body:
 *   {
 *     ghost_post_id: string,                      // 24-hex Ghost post ID
 *     member_uuid:   string,                      // Ghost member UUID
 *     map_index:     0 | 1,                       // which map on the article
 *     stage:         'pre_read' | 'post_read',
 *     map_type:      'cartesian' | 'ternary' | 'binary',
 *     coordinates:   { x, y } | { a, b, c } | { x }    // shape per map_type
 *   }
 *
 * Response:
 *   200 { ok: true, recorded_at }
 *   400 with detail on validation failure
 *   500 on Supabase write failure
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
);

const VALID_STAGES = new Set(['pre_read', 'post_read']);
const VALID_TYPES  = new Set(['cartesian', 'ternary', 'binary']);

const inUnit = (n) =>
  typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;

function validateCoordinates(coords, mapType) {
  if (!coords || typeof coords !== 'object') {
    return 'coordinates must be an object';
  }
  if (mapType === 'cartesian') {
    if (!inUnit(coords.x) || !inUnit(coords.y)) {
      return 'cartesian coordinates require {x, y} numbers in [0, 1]';
    }
    return null;
  }
  if (mapType === 'ternary') {
    if (!inUnit(coords.a) || !inUnit(coords.b) || !inUnit(coords.c)) {
      return 'ternary coordinates require {a, b, c} numbers in [0, 1]';
    }
    if (Math.abs(coords.a + coords.b + coords.c - 1) > 0.05) {
      return `ternary coordinates {a, b, c} must sum to ~1 (got ${(coords.a + coords.b + coords.c).toFixed(3)})`;
    }
    return null;
  }
  if (mapType === 'binary') {
    if (!inUnit(coords.x)) {
      return 'binary coordinates require {x} number in [0, 1]';
    }
    return null;
  }
  return `unrecognized map_type: ${mapType}`;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ghost_post_id, member_uuid, map_index, stage, map_type, coordinates } = req.body || {};

  // Validation
  if (typeof ghost_post_id !== 'string' || !ghost_post_id.trim()) {
    return res.status(400).json({ error: 'ghost_post_id is required' });
  }
  if (typeof member_uuid !== 'string' || !member_uuid.trim()) {
    return res.status(400).json({ error: 'member_uuid is required (Ghost member UUID)' });
  }
  if (!Number.isInteger(map_index) || map_index < 0 || map_index > 1) {
    return res.status(400).json({ error: 'map_index must be 0 or 1' });
  }
  if (!VALID_STAGES.has(stage)) {
    return res.status(400).json({ error: `stage must be one of ${[...VALID_STAGES].join(', ')}` });
  }
  if (!VALID_TYPES.has(map_type)) {
    return res.status(400).json({ error: `map_type must be one of ${[...VALID_TYPES].join(', ')}` });
  }
  const coordsErr = validateCoordinates(coordinates, map_type);
  if (coordsErr) {
    return res.status(400).json({ error: 'invalid coordinates', detail: coordsErr });
  }

  try {
    // Upsert: revising a placement at the same (reader, article, map_index,
    // stage) overwrites the prior coordinates and timestamp.
    const { data, error } = await supabase
      .from('opinion_map_positions')
      .upsert({
        reader_id:   member_uuid,
        article_id:  ghost_post_id,
        map_index,
        stage,
        map_type,
        coordinates,
        recorded_at: new Date().toISOString(),
      }, {
        onConflict: 'reader_id,article_id,map_index,stage',
      })
      .select('id, recorded_at')
      .single();

    if (error) {
      console.error('opinion_map_positions upsert error:', error);
      return res.status(500).json({
        error: 'Failed to record placement',
        detail: error.message,
      });
    }

    return res.status(200).json({
      ok: true,
      id: data.id,
      recorded_at: data.recorded_at,
    });
  } catch (err) {
    console.error('opinion-map/place exception:', err);
    return res.status(500).json({
      error: 'Failed to record placement',
      detail: err.message,
    });
  }
}
