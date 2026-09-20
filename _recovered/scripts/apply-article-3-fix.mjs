/**
 * scripts/apply-article-3-fix.mjs
 *
 * Article 3 (solar) hit the AI retry ceiling on topic length. Hand-crafted
 * axes pulled from the first dry-run that produced clean output. Writes to
 * declaration.opinion_axes only; ai_analysis stays whatever the latest
 * reclassify left it (which has tensions + recommended_map present).
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
}

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

const GHOST_POST_ID = '69d5c5c083cd72000193f0cd';
const NEW_AXES = [{
  type: 'ternary',
  topic: 'Evidence weight',
  poles: ['Current data', 'Precaution', 'Local context'],
}];

const { data: row, error: fetchErr } = await sb
  .from('articles')
  .select('id, declaration')
  .eq('ghost_post_id', GHOST_POST_ID)
  .maybeSingle();

if (fetchErr || !row) {
  console.error('fetch failed:', fetchErr?.message || 'not found');
  process.exit(1);
}

const newDecl = { ...(row.declaration || {}), opinion_axes: NEW_AXES };
const { error: upErr } = await sb
  .from('articles')
  .update({ declaration: newDecl, updated_at: new Date().toISOString() })
  .eq('id', row.id);

if (upErr) {
  console.error('write failed:', upErr.message);
  process.exit(1);
}
console.log('Article 3 (solar) updated with hand-crafted ternary axes:');
console.log(JSON.stringify(NEW_AXES, null, 2));
