/**
 * scripts/backfill-opinion-axes.mjs
 *
 * One-shot maintenance: rewrite each published article's
 * `declaration.opinion_axes` so it satisfies the engine's render contract
 * (exactly 2 cartesian axes; topic 4-28 chars; pole labels 3-20 chars each).
 *
 * Strategy: feed each article's existing ai_analysis.axis_suggestions and
 * declaration to Claude as raw material, ask for exactly 2 cleaned axes.
 * Dry-run by default. Pass --apply to actually write.
 *
 * Usage:
 *   node scripts/backfill-opinion-axes.mjs                     # dry-run all
 *   node scripts/backfill-opinion-axes.mjs --apply             # WRITE all
 *   node scripts/backfill-opinion-axes.mjs --post=<24-hex>     # one article
 *   node scripts/backfill-opinion-axes.mjs --post=<24-hex> --apply
 *
 * Env (read from .env.local):
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_KEY
 *   ANTHROPIC_API_KEY
 *
 * Writes a JSON log next to the script for review.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Load .env.local (no dep on dotenv) ────────────────────────────────────
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
const ANTHROPIC_API_KEY    = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !ANTHROPIC_API_KEY) {
  console.error('Missing env: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_API_KEY');
  process.exit(1);
}

const supabase  = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

// ── Limits MUST match theme/src/dialecta-editor.jsx and api/article/submit.js ──
const AXIS_LIMITS = {
  topic: { min: 4, max: 28 },
  pole:  { min: 3, max: 20 },
  count: 2,
};

// Pipeline-test article: skip. Not a real piece of writing; the AI's only
// suggestion was the meta "procedural artifact vs substantive argument".
const SKIP_GHOST_IDS = new Set([
  '69efd2e3e5eec200010d5302',
]);

// ── Args ──────────────────────────────────────────────────────────────────
const args  = process.argv.slice(2);
const apply = args.includes('--apply');
const postArg = args.find((a) => a.startsWith('--post='));
const onlyPostId = postArg ? postArg.slice('--post='.length) : null;

// ── Validation ────────────────────────────────────────────────────────────
function validateAxes(axes) {
  if (!Array.isArray(axes)) return `expected array, got ${typeof axes}`;
  if (axes.length !== AXIS_LIMITS.count) return `expected ${AXIS_LIMITS.count} axes, got ${axes.length}`;
  for (let i = 0; i < axes.length; i++) {
    const a = axes[i];
    if (!a || typeof a !== 'object') return `axes[${i}] not an object`;
    if (a.type && a.type !== 'cartesian') return `axes[${i}].type must be 'cartesian'`;
    const t  = (a.topic  || '').trim();
    const aa = (a.axis_a || '').trim();
    const ab = (a.axis_b || '').trim();
    if (t.length  < AXIS_LIMITS.topic.min || t.length  > AXIS_LIMITS.topic.max)
      return `axes[${i}].topic length ${t.length} out of [${AXIS_LIMITS.topic.min}, ${AXIS_LIMITS.topic.max}]`;
    if (aa.length < AXIS_LIMITS.pole.min  || aa.length > AXIS_LIMITS.pole.max)
      return `axes[${i}].axis_a length ${aa.length} out of [${AXIS_LIMITS.pole.min}, ${AXIS_LIMITS.pole.max}]`;
    if (ab.length < AXIS_LIMITS.pole.min  || ab.length > AXIS_LIMITS.pole.max)
      return `axes[${i}].axis_b length ${ab.length} out of [${AXIS_LIMITS.pole.min}, ${AXIS_LIMITS.pole.max}]`;
  }
  return null;
}

// ── AI prompt ─────────────────────────────────────────────────────────────
function buildPrompt(article, prevAttempt = null, prevError = null) {
  const decl = article.declaration || {};
  const ai   = article.ai_analysis || {};
  const retryNote = prevAttempt
    ? `

PREVIOUS ATTEMPT FAILED VALIDATION:
${JSON.stringify(prevAttempt, null, 2)}
Error: ${prevError}

Count the characters of every label this time. If a label is at the cap, prefer shorter. The cap is the cap.`
    : '';
  return `You are tightening a Dialecta article's opinion-axis declaration so it fits the engine's render contract.

ARTICLE CORE CLAIM:
${decl.core_claim || '(none declared)'}

SCOPE BOUNDARY:
${decl.scope_boundary || '(none declared)'}

STRONGEST OBJECTION:
${decl.strongest_objection || '(none declared)'}

AUTHOR'S CURRENTLY-DECLARED AXES (may be empty, malformed, or imperfect):
${JSON.stringify(decl.opinion_axes || [], null, 2)}

PRIOR AI-SUGGESTED AXES (probably with over-long pole labels you should shrink):
${JSON.stringify(ai.axis_suggestions || [], null, 2)}

YOUR TASK:
Produce EXACTLY 2 cartesian axes that together draw a 2D landscape readers can place themselves in. Use the article's claims and the prior suggestions as raw material; pick the two strongest splits, shrink the pole labels to fit, ensure the topics are concise noun phrases.

LENGTH CONTRACT (HARD LIMITS, COUNT CHARACTERS BEFORE RESPONDING):
- topic: ${AXIS_LIMITS.topic.min} to ${AXIS_LIMITS.topic.max} characters. A concise noun phrase. NOT a sentence.
- axis_a, axis_b: ${AXIS_LIMITS.pole.min} to ${AXIS_LIMITS.pole.max} characters each. A NAME for the position, not a sentence. NEVER include the topic name inside the pole label. NEVER write a position statement.

QUALITY CONTRACT:
- The two axes must be GENUINELY INDEPENDENT (moving on one must not predict position on the other).
- Both axes must be CONTINUOUS spectra, not yes/no.
- Pole labels must be the two genuine opposites on a single continuum, not a position vs. a counterargument.

GOOD POLE LABELS WITH CHAR COUNTS (treat these as your style target):
- "Individual"           (10)
- "Systemic"             (8)
- "Inner awakening"      (15)
- "Open to evidence"     (16)
- "Skeptic"              (7)
- "Free for all"         (12)
- "Public investment"    (17)
- "Market-based"         (12)
- "Burden manageable"    (17)

BAD POLE LABELS (DO NOT IMITATE):
- "Education should be free"          (24, sentence)
- "Aliveness comes from external"     (29, clause)
- "Human Nature, Optimistic"          (24, topic baked in)
- "Vendor timelines reliable"         (25, three words and over cap)
- "Requires intellectual closure"     (29, three words and over cap)
- "Constitutive condition"            (22, over cap)
- "Yes" / "No"                        (binary, not spectrum)

GOOD TOPIC EXAMPLES WITH CHAR COUNTS:
- "Cause"                 (5)
- "Outlook"               (7)
- "Funding model"         (13)
- "Doubt and faith"       (15)
- "Source of aliveness"   (19)

BAD TOPIC EXAMPLES (DO NOT IMITATE):
- "How we should think about meaning under scarcity"  (sentence)
- "Human nature without constraint"                   (31, over cap)
- "Practice under uncertainty"                        (26, almost over)
${retryNote}
Respond with ONLY a JSON object in this exact shape (no preamble, no code fences, no trailing commentary):
{
  "axes": [
    { "type": "cartesian", "topic": "...", "axis_a": "...", "axis_b": "..." },
    { "type": "cartesian", "topic": "...", "axis_a": "...", "axis_b": "..." }
  ]
}`;
}

async function callAnthropic(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    temperature: 0.2,
    messages: [{ role: 'user', content: prompt }],
  });
  const raw = message.content[0].text.trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`JSON parse failed: ${err.message}\n\nRaw: ${raw.slice(0, 500)}`);
  }
  if (!parsed || !Array.isArray(parsed.axes)) {
    throw new Error(`Response missing axes array: ${JSON.stringify(parsed).slice(0, 200)}`);
  }
  return parsed.axes.map((a) => ({
    type:   'cartesian',
    topic:  (a.topic  || '').trim(),
    axis_a: (a.axis_a || '').trim(),
    axis_b: (a.axis_b || '').trim(),
  }));
}

async function generateAxes(article) {
  const MAX_ATTEMPTS = 3;
  let prevAttempt = null;
  let prevError   = null;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const prompt = buildPrompt(article, prevAttempt, prevError);
    const axes = await callAnthropic(prompt);
    const validateErr = validateAxes(axes);
    if (!validateErr) return { axes, attempts: i + 1 };
    prevAttempt = axes;
    prevError   = validateErr;
    console.log(`  retry ${i + 1}/${MAX_ATTEMPTS - 1}: ${validateErr}`);
  }
  return { axes: prevAttempt, attempts: MAX_ATTEMPTS, finalError: prevError };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  console.log('Mode:', apply ? 'APPLY (will write to Supabase)' : 'DRY RUN');
  if (onlyPostId) console.log('Filter:', `--post=${onlyPostId}`);
  console.log();

  let query = supabase
    .from('articles')
    .select('id, ghost_post_id, status, declaration, ai_analysis')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (onlyPostId) query = query.eq('ghost_post_id', onlyPostId);

  const { data: articles, error } = await query;

  if (error) {
    console.error('Supabase fetch error:', error);
    process.exit(1);
  }

  const targets = (articles || []).filter((a) => !SKIP_GHOST_IDS.has(a.ghost_post_id));
  console.log(`Found ${articles?.length || 0} published articles, ${targets.length} after skip list.`);
  console.log();

  const results = [];

  for (const article of targets) {
    const before = article.declaration?.opinion_axes || [];
    const summary = {
      ghost_post_id: article.ghost_post_id,
      core_claim_preview: (article.declaration?.core_claim || '').slice(0, 120),
      before,
      after: null,
      validation_error: null,
      written: false,
      error: null,
    };

    console.log('─'.repeat(72));
    console.log(`Article: ${article.ghost_post_id}`);
    console.log(`Core claim: ${summary.core_claim_preview}${(article.declaration?.core_claim || '').length > 120 ? '...' : ''}`);
    console.log('Before:');
    console.log(JSON.stringify(before, null, 2));

    let after;
    let attempts = 0;
    try {
      const result = await generateAxes(article);
      after = result.axes;
      attempts = result.attempts;
      summary.attempts = attempts;
      if (result.finalError) {
        summary.validation_error = result.finalError;
        console.error(`✗ All ${attempts} attempts failed validation. Last error: ${result.finalError}`);
        console.error(`  Last AI output:`, JSON.stringify(after, null, 2));
        results.push(summary);
        continue;
      }
    } catch (err) {
      summary.error = err.message;
      console.error(`✗ Generation failed: ${err.message}`);
      results.push(summary);
      continue;
    }

    summary.after = after;
    console.log(`After (${attempts} attempt${attempts === 1 ? '' : 's'}):`);
    console.log(JSON.stringify(after, null, 2));

    if (apply) {
      const newDeclaration = {
        ...(article.declaration || {}),
        opinion_axes: after,
      };
      const { error: updateErr } = await supabase
        .from('articles')
        .update({
          declaration: newDeclaration,
          updated_at:  new Date().toISOString(),
        })
        .eq('id', article.id);
      if (updateErr) {
        summary.error = updateErr.message;
        console.error(`✗ Write failed: ${updateErr.message}`);
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
    const skipped = results.filter((r) => !r.written).length;
    console.log(`APPLY complete. ${written} written, ${skipped} skipped or failed.`);
  } else {
    console.log(`DRY RUN complete. Re-run with --apply to commit.`);
  }

  // Persist log next to the script.
  const stamp   = new Date().toISOString().replace(/[:.]/g, '-');
  const logName = `backfill-opinion-axes-${stamp}${apply ? '-apply' : '-dryrun'}.log.json`;
  const logPath = path.resolve(__dirname, logName);
  fs.writeFileSync(logPath, JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    only_post_id: onlyPostId,
    limits: AXIS_LIMITS,
    results,
  }, null, 2));
  console.log(`Log: ${logPath}`);
}

main().catch((err) => {
  console.error('Script failed:', err);
  process.exit(1);
});
