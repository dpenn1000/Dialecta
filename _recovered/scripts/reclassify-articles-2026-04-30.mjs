/**
 * scripts/reclassify-articles-2026-04-30.mjs
 *
 * Re-runs every published article through the new (tensions + recommended_map)
 * classifier and writes the result to ai_analysis + declaration.opinion_axes.
 *
 * Calls the deployed /api/article/classify endpoint so we share a single
 * source of truth for the prompt. Dry-run prints a per-article diff; pass
 * --apply to commit the writes.
 *
 * Usage:
 *   node scripts/reclassify-articles-2026-04-30.mjs                  # dry-run all
 *   node scripts/reclassify-articles-2026-04-30.mjs --apply          # commit all
 *   node scripts/reclassify-articles-2026-04-30.mjs --post=<24-hex>  # one article
 *   node scripts/reclassify-articles-2026-04-30.mjs --post=<id> --apply
 *
 * Env (read from .env.local):
 *   SUPABASE_URL, SUPABASE_SERVICE_KEY
 *   DIALECTA_API_BASE (defaults to https://dialecta.vercel.app)
 */

import fs     from 'node:fs';
import path   from 'node:path';
import crypto from 'node:crypto';
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

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const API_BASE             = process.env.DIALECTA_API_BASE || 'https://dialecta.vercel.app';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Inline Ghost Admin JWT helper (mirrors api/_ghost-admin.js but reads
//    env at call time, since import-time env wasn't loaded yet). ─────────
const GHOST_URL = process.env.GHOST_ADMIN_API_URL;
const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY;
const [ghostKeyId, ghostKeySecret] = (GHOST_ADMIN_KEY || '').split(':');

function base64url(input) {
  return Buffer.from(input).toString('base64')
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function ghostAdminToken() {
  if (!ghostKeyId || !ghostKeySecret) {
    throw new Error('GHOST_ADMIN_API_KEY not configured (need <id>:<secret>)');
  }
  const header  = { alg: 'HS256', typ: 'JWT', kid: ghostKeyId };
  const now     = Math.floor(Date.now() / 1000);
  const payload = { iat: now, exp: now + 5 * 60, aud: '/admin/' };
  const input   = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(payload));
  const sig     = crypto.createHmac('sha256', Buffer.from(ghostKeySecret, 'hex')).update(input).digest();
  return input + '.' + base64url(sig);
}

async function ghostAdminFetch(suffix) {
  if (!GHOST_URL) throw new Error('GHOST_ADMIN_API_URL not configured');
  const url = GHOST_URL.replace(/\/$/, '') + '/ghost/api/admin' + suffix;
  const resp = await fetch(url, {
    headers: {
      Authorization: 'Ghost ' + ghostAdminToken(),
      'Accept-Version': 'v5.0',
    },
  });
  if (!resp.ok) {
    throw new Error(`Ghost admin ${resp.status}: ${(await resp.text()).slice(0, 300)}`);
  }
  return resp.json();
}

// Topic format aligned with opinion-mapper SKILL v2.1.0 (2026-05-02):
// topic must be a question 15-60 chars ending in `?`. Pole caps unchanged.
const AXIS_LIMITS = {
  topic: { min: 15, max: 60 },
  pole:  { min: 3,  max: 20 },
};

function topicEndsInQuestion(topic) {
  return typeof topic === 'string' && topic.trim().endsWith('?');
}

const inUnit = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1;
const lenOk = (s, lo, hi) => {
  const v = typeof s === 'string' ? s.trim() : '';
  return v.length >= lo && v.length <= hi;
};

const SKIP_GHOST_IDS = new Set([
  '69efd2e3e5eec200010d5302',  // pipeline test
]);

const args = process.argv.slice(2);
const apply = args.includes('--apply');
const postArg = args.find((a) => a.startsWith('--post='));
const onlyPostId = postArg ? postArg.slice('--post='.length) : null;

// ── Plaintext helper (mirrors submit.js htmlToPlaintext) ──────────────────
function htmlToPlaintext(html) {
  return (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Validate one map entry (mirrors api/article/submit.js validateMapEntry) ──
function validateMapEntry(map, idx) {
  if (!map || typeof map !== 'object') return `opinion_maps[${idx}] not an object`;
  if (map.type === 'ternary') {
    if (!lenOk(map.topic, AXIS_LIMITS.topic.min, AXIS_LIMITS.topic.max))
      return `opinion_maps[${idx}] (ternary): topic length`;
    if (!topicEndsInQuestion(map.topic))
      return `opinion_maps[${idx}] (ternary): topic must be a question ending in ?`;
    if (!Array.isArray(map.poles) || map.poles.length !== 3)
      return `opinion_maps[${idx}] (ternary): poles must be 3`;
    for (let i = 0; i < 3; i++) {
      if (!lenOk(map.poles[i], AXIS_LIMITS.pole.min, AXIS_LIMITS.pole.max))
        return `opinion_maps[${idx}] (ternary): poles[${i}] length`;
    }
    if (map.author_position) {
      const ap = map.author_position;
      if (!inUnit(ap.a) || !inUnit(ap.b) || !inUnit(ap.c))
        return `opinion_maps[${idx}] (ternary): author_position {a,b,c} out of [0,1]`;
      if (Math.abs(ap.a + ap.b + ap.c - 1) > 0.05)
        return `opinion_maps[${idx}] (ternary): author_position must sum to ~1`;
    }
    return null;
  }
  if (map.type === 'cartesian') {
    if (!Array.isArray(map.axes) || map.axes.length !== 2)
      return `opinion_maps[${idx}] (cartesian): axes must be 2`;
    for (let i = 0; i < 2; i++) {
      const a = map.axes[i];
      if (!lenOk(a?.topic,  AXIS_LIMITS.topic.min, AXIS_LIMITS.topic.max))
        return `opinion_maps[${idx}] (cartesian): axes[${i}].topic length`;
      if (!topicEndsInQuestion(a?.topic))
        return `opinion_maps[${idx}] (cartesian): axes[${i}].topic must be a question ending in ?`;
      if (!lenOk(a?.axis_a, AXIS_LIMITS.pole.min,  AXIS_LIMITS.pole.max))
        return `opinion_maps[${idx}] (cartesian): axes[${i}].axis_a length`;
      if (!lenOk(a?.axis_b, AXIS_LIMITS.pole.min,  AXIS_LIMITS.pole.max))
        return `opinion_maps[${idx}] (cartesian): axes[${i}].axis_b length`;
    }
    if (map.author_position) {
      const ap = map.author_position;
      if (!inUnit(ap.x) || !inUnit(ap.y))
        return `opinion_maps[${idx}] (cartesian): author_position {x,y} out of [0,1]`;
    }
    return null;
  }
  if (map.type === 'binary') {
    if (!lenOk(map.topic,  AXIS_LIMITS.topic.min, AXIS_LIMITS.topic.max))
      return `opinion_maps[${idx}] (binary): topic length`;
    if (!topicEndsInQuestion(map.topic))
      return `opinion_maps[${idx}] (binary): topic must be a question ending in ?`;
    if (!lenOk(map.axis_a, AXIS_LIMITS.pole.min,  AXIS_LIMITS.pole.max))
      return `opinion_maps[${idx}] (binary): axis_a length`;
    if (!lenOk(map.axis_b, AXIS_LIMITS.pole.min,  AXIS_LIMITS.pole.max))
      return `opinion_maps[${idx}] (binary): axis_b length`;
    if (map.author_position) {
      const ap = map.author_position;
      if (!inUnit(ap.x))
        return `opinion_maps[${idx}] (binary): author_position {x} out of [0,1]`;
    }
    return null;
  }
  return `opinion_maps[${idx}].type unrecognized: ${JSON.stringify(map.type)}`;
}

function validateOpinionMaps(maps) {
  if (maps == null || (Array.isArray(maps) && maps.length === 0)) return null;
  if (!Array.isArray(maps)) return `expected array, got ${typeof maps}`;
  if (maps.length > 2) return `at most 2 maps (got ${maps.length})`;
  for (let i = 0; i < maps.length; i++) {
    const err = validateMapEntry(maps[i], i);
    if (err) return err;
  }
  const binCount = maps.filter((m) => m?.type === 'binary').length;
  if (binCount > 1) return 'at most one binary map';
  if (binCount === 1 && maps.length === 1) {
    return 'binary cannot be the only map';
  }
  return null;
}

function normalizeTernaryAP(ap) {
  if (!ap || !inUnit(ap.a) || !inUnit(ap.b) || !inUnit(ap.c)) return null;
  const s = ap.a + ap.b + ap.c;
  if (s <= 0) return null;
  return { a: ap.a / s, b: ap.b / s, c: ap.c / s };
}

function clampUnit(n) {
  return Math.max(0, Math.min(1, n));
}

// For backparse there is no human in the loop, so we pick the AI's
// top-confidence non-binary candidate as the final map. Binary candidates
// are skipped at the top-pick step because the platform's display layer
// expects a ternary or cartesian primary; the skill guarantees the
// candidate set includes at least one. Falls back to top binary if the
// guarantee somehow fails.
function pickPrimaryFromCandidates(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const nonBinary = candidates.filter((c) => c?.type === 'ternary' || c?.type === 'cartesian');
  const pool = nonBinary.length > 0 ? nonBinary : candidates;
  return pool[0];  // candidates already ordered by confidence in the response
}

function normalizeMap(r) {
  if (r?.type === 'ternary') {
    return {
      type: 'ternary',
      topic: (r.topic || '').trim(),
      poles: Array.isArray(r.poles) && r.poles.length === 3
        ? r.poles.map((p) => (p || '').trim())
        : ['', '', ''],
      author_position: normalizeTernaryAP(r.author_position),
    };
  }
  if (r?.type === 'cartesian') {
    return {
      type: 'cartesian',
      axes: Array.isArray(r.axes) ? r.axes.slice(0, 2).map((a) => ({
        topic:  (a.topic  || '').trim(),
        axis_a: (a.axis_a || '').trim(),
        axis_b: (a.axis_b || '').trim(),
      })) : [],
      author_position: r.author_position
        && inUnit(r.author_position.x) && inUnit(r.author_position.y)
          ? { x: clampUnit(r.author_position.x), y: clampUnit(r.author_position.y) }
          : null,
    };
  }
  if (r?.type === 'binary') {
    return {
      type: 'binary',
      topic:  (r.topic  || '').trim(),
      axis_a: (r.axis_a || '').trim(),
      axis_b: (r.axis_b || '').trim(),
      author_position: r.author_position && inUnit(r.author_position.x)
        ? { x: clampUnit(r.author_position.x) }
        : null,
    };
  }
  return null;
}

function deriveOpinionMapsFromCandidates(candidates) {
  const top = pickPrimaryFromCandidates(candidates);
  if (!top) return [];
  const normalized = normalizeMap(top);
  return normalized ? [normalized] : [];
}

async function fetchArticleBody(article) {
  // Prefer Supabase's stored original_html (from submit.js). For legacy
  // articles or seeds where it's empty, fall back to Ghost's plaintext.
  let text = htmlToPlaintext(article.original_html || '');
  if (text.length >= 200) return text;

  const resp = await ghostAdminFetch(`/posts/${article.ghost_post_id}/?formats=html,plaintext`);
  const post = resp?.posts?.[0];
  if (post?.plaintext && post.plaintext.length >= 200) return post.plaintext;
  if (post?.html) {
    text = htmlToPlaintext(post.html);
    if (text.length >= 200) return text;
  }
  throw new Error(`article body too short or missing (Supabase: ${(article.original_html || '').length} chars, Ghost: ${post?.plaintext?.length || 0} plaintext)`);
}

// Targeted retry hints. Length failures need "shorten labels, keep shape";
// shape/cardinality failures need different guidance. The previous catch-all
// "switch to cartesian on any failure" pushed the AI off ternary even when
// the only problem was wordy labels.
function buildRetryHint(error) {
  if (!error) return null;
  const lower = error.toLowerCase();
  if (lower.includes('must be a question')) {
    return `Previous attempt failed: "${error}". The topic must be the article's central question to the reader, asked plainly and ending with "?". NOT a noun phrase, NOT a thematic shorthand. Re-read "What a good topic looks like" in the skill. Examples of right shape: "What actually changes how we behave?", "Do we need struggle to matter?". Wrong shape: "Faith and Scale", "Past Scarcity". Rebuild the topic as a question.`;
  }
  if (lower.includes('length')) {
    return `Previous attempt failed: "${error}". A label was outside its character range. Topics: 15-60 chars (a question ending in ?). Poles: 3-20 chars (prefer 8-15). Count characters before responding. Do NOT switch the map type; the structure was fine, the wording was not.`;
  }
  if (lower.includes('cannot be the only map') || lower.includes('binary')) {
    return `Previous attempt failed: "${error}". A binary map needs a ternary or cartesian primary. Either pair the binary with a richer primary map on a different question, or switch to ternary/cartesian if the article's structure supports it.`;
  }
  if (lower.includes('must sum') || lower.includes('out of [0,1]')) {
    return `Previous attempt failed: "${error}". The author_position coordinates are wrong. For ternary, {a, b, c} must each be in [0, 1] and sum to ~1.0. For cartesian, {x, y} each in [0, 1]. Re-check your math.`;
  }
  if (lower.includes('must be exactly') || lower.includes('expected exactly') || lower.includes('cardinality')) {
    return `Previous attempt failed: "${error}". The number of poles or axes was wrong for the chosen type. Ternary needs exactly 3 poles, cartesian needs exactly 2 axes, binary needs axis_a + axis_b. Match the cardinality.`;
  }
  return `Previous attempt failed validation: "${error}". Re-read the relevant section of the skill, apply the correction, and submit again. Count characters carefully.`;
}

async function callClassify(article_text, declaration, declared_tier, retryNote = null) {
  const body = {
    article_text,
    declaration,
    declared_tier,
  };
  if (retryNote) body.retry_hint = retryNote;
  const resp = await fetch(`${API_BASE}/api/article/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`classify failed (${resp.status}): ${text.slice(0, 400)}`);
  }
  return resp.json();
}

async function reclassifyArticle(article) {
  const article_text = await fetchArticleBody(article);
  const decl = article.declaration || {};
  const tier = article.declared_tier;

  const MAX_ATTEMPTS = 3;
  let lastAnalysis = null;
  let lastError    = null;
  let lastMaps     = null;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const retryNote = lastError ? buildRetryHint(lastError) : null;
    const analysis = await callClassify(article_text, decl, tier, retryNote);
    const maps = deriveOpinionMapsFromCandidates(analysis.candidate_maps);
    const err  = validateOpinionMaps(maps);
    if (!err) return { analysis, maps, attempts: i + 1 };
    console.log(`  retry ${i + 1}/${MAX_ATTEMPTS - 1}: ${err}`);
    lastAnalysis = analysis;
    lastError    = err;
    lastMaps     = maps;
  }
  return {
    analysis: lastAnalysis,
    maps: lastMaps || [],
    attempts: MAX_ATTEMPTS,
    finalError: lastError,
  };
}

async function main() {
  console.log('Mode:', apply ? 'APPLY' : 'DRY RUN');
  console.log('API base:', API_BASE);
  if (onlyPostId) console.log('Filter: --post=' + onlyPostId);
  console.log();

  let q = sb.from('articles')
    .select('id, ghost_post_id, status, declared_tier, declaration, ai_analysis, original_html')
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (onlyPostId) q = q.eq('ghost_post_id', onlyPostId);

  const { data: articles, error } = await q;
  if (error) {
    console.error('Supabase fetch error:', error);
    process.exit(1);
  }

  const targets = (articles || []).filter((a) => !SKIP_GHOST_IDS.has(a.ghost_post_id));
  console.log(`Found ${articles?.length || 0} published articles, ${targets.length} after skip list.`);
  console.log();

  const results = [];

  for (const article of targets) {
    const summary = {
      ghost_post_id: article.ghost_post_id,
      core_claim_preview: (article.declaration?.core_claim || '').slice(0, 100),
      before_maps: article.declaration?.opinion_maps
                || article.declaration?.opinion_axes
                || [],
      after_maps: null,
      validation_error: null,
      written: false,
      error: null,
    };

    console.log('─'.repeat(72));
    console.log(`Article: ${article.ghost_post_id}`);
    console.log(`Core claim: ${summary.core_claim_preview}${(article.declaration?.core_claim || '').length > 100 ? '...' : ''}`);

    let analysis, newMaps, attempts;
    try {
      const result = await reclassifyArticle(article);
      analysis = result.analysis;
      newMaps  = result.maps;
      attempts = result.attempts;
      summary.attempts = attempts;
      if (result.finalError) {
        summary.validation_error = result.finalError;
        console.error(`✗ All ${attempts} attempts failed validation. Last error: ${result.finalError}`);
        console.error('  Last AI output:', JSON.stringify(newMaps, null, 2));
        results.push(summary);
        continue;
      }
    } catch (err) {
      summary.error = err.message;
      console.error(`✗ Reclassify failed: ${err.message}`);
      results.push(summary);
      continue;
    }

    summary.after_maps = newMaps;

    const types = newMaps.map((m) => m.type).join(' + ') || '(none)';
    console.log(`Recommended maps: ${types}  (${attempts} attempt${attempts === 1 ? '' : 's'}, ${newMaps.length} map${newMaps.length === 1 ? '' : 's'})`);
    newMaps.forEach((m, i) => {
      if (m.rationale) console.log(`  Map ${i + 1} rationale: ${m.rationale}`);
    });
    if (Array.isArray(analysis.tensions)) {
      console.log(`Tensions found: ${analysis.tensions.length}`);
      analysis.tensions.forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.name}`);
      });
    }
    console.log('Derived opinion_maps:');
    console.log(JSON.stringify(newMaps, null, 2));

    if (apply) {
      const newDeclaration = {
        ...(article.declaration || {}),
        opinion_maps: newMaps,
      };
      // Drop the legacy fields cleanly so the new shape is canonical
      delete newDeclaration.opinion_axes;
      delete newDeclaration.author_position;
      const { error: upErr } = await sb
        .from('articles')
        .update({
          declaration: newDeclaration,
          ai_analysis: analysis,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', article.id);
      if (upErr) {
        summary.error = upErr.message;
        console.error(`✗ Write failed: ${upErr.message}`);
      } else {
        summary.written = true;
        console.log('✓ Written.');
      }
    }
    console.log();
    results.push(summary);
  }

  console.log('─'.repeat(72));
  if (apply) {
    const written = results.filter((r) => r.written).length;
    console.log(`APPLY complete. ${written} of ${results.length} written.`);
  } else {
    console.log('DRY RUN complete. Re-run with --apply to commit.');
  }

  const stamp   = new Date().toISOString().replace(/[:.]/g, '-');
  const logName = `reclassify-articles-${stamp}${apply ? '-apply' : '-dryrun'}.log.json`;
  const logPath = path.resolve(__dirname, logName);
  fs.writeFileSync(logPath, JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    only_post_id: onlyPostId,
    api_base: API_BASE,
    results,
  }, null, 2));
  console.log(`Log: ${logPath}`);
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
