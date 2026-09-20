/**
 * api/article/classify.js
 *
 * Article classification endpoint. Mirrors /api/classify (per-comment) but
 * tuned for article-length submissions and the 5-question declaration
 * layer from Dialecta_Article_Editorial_Template.md.
 *
 * POST body:
 *   {
 *     article_text:  string,         // plaintext (or HTML; the prompt copes with either)
 *     declaration: {                 // 5 author-declaration questions
 *       core_claim:           string,
 *       scope_boundary:       string,
 *       strongest_objection:  string,
 *       opinion_axes?:        [{ axis_a, axis_b, type }]
 *     },
 *     declared_tier: 'forum'|'spark'|'echo'|'fog'|'heat'|'stance'|'breach'
 *   }
 *
 * Response: structured analysis JSON (matches articles.ai_analysis jsonb shape):
 *   {
 *     core_claim_detected, alignment, alignment_note, ai_suggested_tier,
 *     tier_reason, specificity_score, emotion, tribal_markers,
 *     tribal_example, opposing_view_engaged, flagged_passages: [...],
 *     tensions: [...], candidate_maps: [...],   // 2-4 candidates, ranked
 *     borderline_flag, borderline_other_tier, author_message
 *   }
 *
 * candidate_maps is a ranked list of 2-4 framings of the article's
 * central question. The author selects one via the editor's picker UI
 * (or builds their own); the chosen framing becomes the reader-facing
 * map. Each candidate carries a `confidence` field; the array is
 * ordered highest-confidence first.
 *
 * The endpoint is stateless: it does not write to Supabase. The submit
 * endpoint (a-future-task) will call this and persist the result.
 *
 * ─── Engine configuration ─────────────────────────────────────────────
 * Model:        claude-opus-4-7 (parity with classify-order.js)
 * Thinking:     adaptive, effort=high (the skill demands a sequence of
 *               honesty checks the model must run on its own draft;
 *               Haiku without thinking did not reliably hold them)
 * Skill home:   sent in `system` with cache_control ephemeral, so the
 *               ~3K-token skill is paid once per 5-minute window rather
 *               than once per call
 * Retry path:   on validator failure (length contract or shape), one
 *               retry with a structured retry_hint built from the
 *               specific issues. Capped at 1 retry to bound cost.
 *
 * On structured output: an earlier iteration used
 * output_config.format.json_schema to server-enforce the response
 * shape. Anthropic's grammar compiler timed out on the polymorphic
 * recommended_maps array (ternary vs cartesian vs binary alternates),
 * returning a 400 after 137s of compilation. The validator below
 * catches the same structural rules at near-zero cost, so we skip
 * server-side schema enforcement and rely on prompt + validator +
 * retry instead.
 */

import Anthropic from '@anthropic-ai/sdk';
import { applyCors } from '../_cors.js';
import { OPINION_MAPPER_SKILL } from '../_skills/opinion-mapper.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];

// Article truncation cap. Bumped from 12K to 25K so longer pieces
// (e.g. 15K-char essays) reach the model in full. Most opinion essays
// land 6K-15K chars; 25K accommodates the long tail without bloating
// the typical call.
const ARTICLE_CHAR_CAP = 25000;

// Retry budget. Total attempts = MAX_VALIDATION_RETRIES + 1.
const MAX_VALIDATION_RETRIES = 1;

// ─── Validator ─────────────────────────────────────────────────────────
// Enforces the conditional shape and length contract that the JSON
// schema above does not express. On failure, returns an array of
// concrete issues that becomes the retry_hint for the next attempt.

// Synthesis-pole detector. Per skill v2.3.0, a pole that names "a bit of
// both" / "both matter" / "in between" / etc. collapses the ternary tool's
// central affordance — the tool ITSELF is how a reader expresses synthesis
// by allocating weight across the corners. Conservative pattern list: the
// listed phrases are unambiguously synthesis; subtler hedges are left to
// the model's own judgment per the skill's prohibition.
const SYNTHESIS_POLE_PATTERNS = [
  /^both\b/i,
  /^neither\b/i,
  /\bboth\s+(matter|count|are|apply|work)\b/i,
  /\ba\s+bit\s+of\s+both\b/i,
  /\bin\s+between\b/i,
  /\beither\s+way\b/i,
  /\bit\s+depends\b/i,
  /\bmix\s+of\b/i,
  /\bbalance\s+(of|between)\b/i,
];

function checkPoleSynthesis(pole, label, issues) {
  if (typeof pole !== 'string') return;
  const trimmed = pole.trim();
  for (const pat of SYNTHESIS_POLE_PATTERNS) {
    if (pat.test(trimmed)) {
      issues.push(`${label} "${pole}" reads as a synthesis pole. The ternary tool itself is how a reader expresses "a bit of both" by allocating weight across the three corners; a pole that names the synthesis collapses that affordance. Either find a third stance genuinely distinct from the other two, or drop this candidate to a binary or cartesian shape.`);
      return;
    }
  }
}

// Topic must be a question (the article's central question to the reader),
// 15-60 chars, ending in `?`. See "What a good topic looks like" in the
// skill for the full principle.
function checkTopicShape(topic, label, issues) {
  if (typeof topic !== 'string') return;
  const trimmed = topic.trim();
  if (trimmed.length < 15) {
    issues.push(`${label} "${topic}" is too short (${trimmed.length} chars; questions need at least 15)`);
  }
  if (trimmed.length > 60) {
    issues.push(`${label} "${topic}" exceeds 60-char cap (currently ${trimmed.length}); rewrite as a shorter question`);
  }
  if (!trimmed.endsWith('?')) {
    issues.push(`${label} "${topic}" must be a question ending in "?" (the article's central question to the reader, not a noun phrase or thematic label)`);
  }
}

function validateAnalysis(analysis) {
  const issues = [];

  if (!Array.isArray(analysis.candidate_maps)) {
    return ['candidate_maps must be an array'];
  }

  // Per skill v2.2.0: target 4 candidates, allow 2-4. Empty array is valid
  // only for genuine no-map articles (rare). The skill self-polices the
  // no-map case in its rationale; we accept the empty array here.
  if (analysis.candidate_maps.length > 4) {
    issues.push(`candidate_maps has ${analysis.candidate_maps.length} entries; max is 4`);
  }
  if (analysis.candidate_maps.length === 1) {
    issues.push(`candidate_maps has only 1 entry; the picker needs at least 2 candidates (or 0 for a genuine no-map article)`);
  }

  // Confidence ranking: highest first. Mild check; we don't reject if
  // slightly out of order, but we flag obvious inversions.
  const confs = analysis.candidate_maps.map((m) => typeof m?.confidence === 'number' ? m.confidence : null);
  for (let i = 1; i < confs.length; i++) {
    if (confs[i - 1] != null && confs[i] != null && confs[i] > confs[i - 1] + 0.05) {
      issues.push(`candidate_maps[${i}] (confidence ${confs[i]}) is meaningfully higher than candidate_maps[${i - 1}] (${confs[i - 1]}); order array by descending confidence`);
      break;
    }
  }

  for (const [i, map] of analysis.candidate_maps.entries()) {
    const prefix = `candidate_maps[${i}]`;

    if (typeof map.confidence !== 'number' || map.confidence < 0 || map.confidence > 1) {
      issues.push(`${prefix}.confidence must be a number in [0, 1]`);
    }

    checkTopicShape(map.topic, `${prefix}.topic`, issues);

    if (map.type === 'ternary') {
      if (!Array.isArray(map.poles) || map.poles.length !== 3) {
        issues.push(`${prefix}: ternary requires exactly 3 poles, got ${Array.isArray(map.poles) ? map.poles.length : 'none'}`);
      } else {
        for (const [j, pole] of map.poles.entries()) {
          if (typeof pole === 'string' && pole.length > 20) {
            issues.push(`${prefix}.poles[${j}] "${pole}" exceeds 20-char cap (currently ${pole.length})`);
          }
          checkPoleSynthesis(pole, `${prefix}.poles[${j}]`, issues);
        }
      }
    } else if (map.type === 'cartesian') {
      if (!Array.isArray(map.axes) || map.axes.length !== 2) {
        issues.push(`${prefix}: cartesian requires exactly 2 axes, got ${Array.isArray(map.axes) ? map.axes.length : 'none'}`);
      } else {
        for (const [j, ax] of map.axes.entries()) {
          if (typeof ax.axis_a === 'string' && ax.axis_a.length > 20) {
            issues.push(`${prefix}.axes[${j}].axis_a "${ax.axis_a}" exceeds 20-char cap (currently ${ax.axis_a.length})`);
          }
          if (typeof ax.axis_b === 'string' && ax.axis_b.length > 20) {
            issues.push(`${prefix}.axes[${j}].axis_b "${ax.axis_b}" exceeds 20-char cap (currently ${ax.axis_b.length})`);
          }
          checkPoleSynthesis(ax.axis_a, `${prefix}.axes[${j}].axis_a`, issues);
          checkPoleSynthesis(ax.axis_b, `${prefix}.axes[${j}].axis_b`, issues);
          checkTopicShape(ax.topic, `${prefix}.axes[${j}].topic`, issues);
        }
      }
    } else if (map.type === 'binary') {
      if (typeof map.axis_a !== 'string' || typeof map.axis_b !== 'string') {
        issues.push(`${prefix}: binary requires axis_a and axis_b as strings`);
      }
      if (typeof map.axis_a === 'string' && map.axis_a.length > 20) {
        issues.push(`${prefix}.axis_a "${map.axis_a}" exceeds 20-char cap (currently ${map.axis_a.length})`);
      }
      if (typeof map.axis_b === 'string' && map.axis_b.length > 20) {
        issues.push(`${prefix}.axis_b "${map.axis_b}" exceeds 20-char cap (currently ${map.axis_b.length})`);
      }
      checkPoleSynthesis(map.axis_a, `${prefix}.axis_a`, issues);
      checkPoleSynthesis(map.axis_b, `${prefix}.axis_b`, issues);
    } else if (map.type) {
      issues.push(`${prefix}: unknown map type "${map.type}" (expected ternary, cartesian, or binary)`);
    }
  }

  return issues;
}

// ─── User-message builder ──────────────────────────────────────────────
// The skill lives in `system` with cache_control ephemeral, so this
// function only assembles the article-specific user turn. The retry
// hint, when present, becomes a preamble to the user message; the
// system prompt remains stable across retries so the cache stays warm.
function buildUserMessage({ article_text, declaration, declared_tier, retry_hint }) {
  const truncated = article_text.length > ARTICLE_CHAR_CAP
    ? article_text.slice(0, ARTICLE_CHAR_CAP) + '\n\n[truncated for length]'
    : article_text;

  const retryPreamble = retry_hint
    ? `RETRY ATTEMPT. Previous output failed validation:
${retry_hint}

Apply the correction. Count characters carefully before submitting; the cap is a hard ceiling, not a target. If a label drifts close to the cap, find a shorter form. If the failure was a compressed pole (an "A or B" style label combining two stances), that is evidence the article is 2D, not 3-way: switch your recommended_map type to cartesian and split the two compressed positions into two separate axes. Re-read the honesty checks in the skill before responding.

`
    : '';

  return `${retryPreamble}Apply the opinion-mapper skill (in the system prompt) to the article below.

AUTHOR'S DECLARED INTENT:
- Core Claim: ${declaration.core_claim || '(not provided)'}
- Scope Boundary: ${declaration.scope_boundary || '(not provided)'}
- Strongest Objection: ${declaration.strongest_objection || '(not provided)'}
- Author's Suggested Tier: ${declared_tier || '(not declared)'}

ARTICLE TEXT:
"""
${truncated}
"""`;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_text, declaration, declared_tier, retry_hint } = req.body || {};

  // Input validation
  if (!article_text || typeof article_text !== 'string' || article_text.length < 200) {
    return res.status(400).json({
      error: 'article_text is required and must be at least 200 characters',
    });
  }
  if (!declaration || !declaration.core_claim || typeof declaration.core_claim !== 'string') {
    return res.status(400).json({
      error: 'declaration.core_claim is required',
    });
  }
  if (declared_tier && !TIERS.includes(declared_tier)) {
    return res.status(400).json({
      error: 'declared_tier, if provided, must be one of: ' + TIERS.join(', '),
    });
  }

  try {
    let analysis = null;
    let lastRetryHint = retry_hint || null;
    let validationIssues = [];

    for (let attempt = 0; attempt <= MAX_VALIDATION_RETRIES; attempt++) {
      const message = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 8192,
        thinking: { type: 'adaptive' },
        output_config: {
          effort: 'high',
        },
        system: [
          {
            type: 'text',
            text: OPINION_MAPPER_SKILL,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: buildUserMessage({
              article_text,
              declaration,
              declared_tier,
              retry_hint: lastRetryHint,
            }),
          },
        ],
      });

      // With thinking enabled, message.content[0] may be a thinking
      // block; the JSON answer lives in the text block. Pull it
      // explicitly rather than indexing position 0.
      const textBlock = message.content.find((b) => b.type === 'text');
      if (!textBlock?.text) {
        if (attempt >= MAX_VALIDATION_RETRIES) {
          return res.status(502).json({
            error: 'Classifier returned no text content',
            stop_reason: message.stop_reason,
          });
        }
        lastRetryHint = 'Previous response had no text content. Respond with the JSON object only.';
        continue;
      }

      // Strip optional code fences (the model occasionally wraps the
      // JSON object in ```json ... ``` despite the instruction to
      // respond with a bare object).
      const cleaned = textBlock.text
        .trim()
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      try {
        analysis = JSON.parse(cleaned);
      } catch (parseErr) {
        if (attempt >= MAX_VALIDATION_RETRIES) {
          console.error('Article classification JSON parse failed:', parseErr, '\nRaw:', textBlock.text);
          return res.status(502).json({
            error: 'Classification engine returned non-JSON output',
            detail: parseErr.message,
            raw_preview: textBlock.text.slice(0, 500),
          });
        }
        lastRetryHint = `Previous response was not valid JSON. Parse error: ${parseErr.message}. Respond with ONLY the JSON object, no code fences, no preamble.`;
        analysis = null;
        continue;
      }

      validationIssues = validateAnalysis(analysis);
      if (validationIssues.length === 0) break;

      if (attempt >= MAX_VALIDATION_RETRIES) {
        // Out of retries. Return what we have and log the unresolved
        // issues so the tuning loop has data.
        console.warn(
          'Article classification validation issues remain after retries:',
          validationIssues
        );
        break;
      }
      lastRetryHint = validationIssues.join('; ');
    }

    if (!analysis) {
      return res.status(502).json({ error: 'Classification produced no result' });
    }

    if (!TIERS.includes(analysis.ai_suggested_tier)) {
      console.warn(
        'Article classification returned unrecognized tier:',
        analysis.ai_suggested_tier
      );
    }

    return res.status(200).json(analysis);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({
        error: 'Rate limited by the classification engine; try again in a moment.',
      });
    }
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API error:', error.status, error.message);
      return res.status(502).json({
        error: 'Classification engine error',
        detail: error.message,
      });
    }
    console.error('Article classification error:', error);
    return res.status(500).json({
      error: 'Article classification failed',
      detail: error.message,
    });
  }
}
