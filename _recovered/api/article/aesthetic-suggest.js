/**
 * api/article/aesthetic-suggest.js
 *
 * Polish engine v2. Conservative dress-up with author-chosen level.
 *
 * Three levels:
 *   light       Floor only — punctuation/em-dash/smart-quotes hygiene plus
 *               recognition of structure the author already created
 *               (sources sections, pseudo-headers).
 *   standard    Light + conservative thematic breaks (only at clear pivots).
 *   editorial   Standard + active rhythm tools (pullquotes, list conversion,
 *               emphasis additions, more aggressive thematic breaks).
 *   custom      Use the polish_options object as a feature-toggle map.
 *
 * The output contract is intentionally simpler than v1: just polished_html
 * plus a change_log array (brief one-line descriptions of what changed). No
 * suggestion cards anymore — the engine runs server-side at submit-time, so
 * authors don't need to review per-suggestion. Admins can re-run polish at
 * a different level via /api/article/repolish.
 *
 * POST body:
 *   {
 *     article_html:    string,                                       // required
 *     polish_level:    'light' | 'standard' | 'editorial' | 'custom', // default: 'light'
 *     polish_options?: {                                              // when level=custom
 *       thematic_breaks_conservative: boolean,
 *       thematic_breaks_aggressive:   boolean,
 *       pullquotes:                   boolean,
 *       list_conversions:             boolean,
 *       emphasis_additions:           boolean,
 *     },
 *   }
 *
 * Response:
 *   {
 *     polished_html: string,
 *     change_log:    string[],
 *   }
 */

import Anthropic from '@anthropic-ai/sdk';
import { applyCors } from '../_cors.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const VALID_LEVELS = new Set(['light', 'standard', 'editorial', 'custom']);

const POLISH_TOOL = {
  name: 'submit_polish',
  description:
    'Submit the polished article HTML plus a brief change log. Author content remains byte-for-byte identical except where punctuation policy or platform tag-recognition rules apply.',
  input_schema: {
    type: 'object',
    properties: {
      polished_html: {
        type: 'string',
        description:
          "The full article HTML with the polish operations applied. Author's prose remains byte-for-byte identical except: punctuation hygiene (spaces, smart quotes, em-dash policy, ellipsis), tag-promotion of recognized structure (pseudo-headers to <h2>, sources sections), and any level-gated rhythm tools the caller enabled. Allowed tags: p, h2, h3, ul, ol, li, strong, em, blockquote, hr. No HTML attributes.",
      },
      change_log: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Brief one-line descriptions of what was changed. Examples: "Replaced 3 em-dashes with commas", "Tagged \'The Cost Question\' as <h2>", "Stripped 5 empty spacer paragraphs". One entry per category of change, not per individual edit.',
      },
    },
    required: ['polished_html', 'change_log'],
  },
};

// ── Feature gating ─────────────────────────────────────────────────────────
//
// The floor (always applied) lives in the prompt's base section. Levels and
// custom options enable additional tool sections to be appended.

function resolveFeatures(level, options) {
  // Base floor — never optional
  const features = {
    punctuation_hygiene:        true,  // floor
    em_dash_policy:             true,  // floor
    smart_quotes:               true,  // floor
    layout_cruft:               true,  // floor
    sources_recognition:        true,  // floor
    pseudo_header_recognition:  true,  // floor
    // Configurable additions
    thematic_breaks_conservative: false,
    thematic_breaks_aggressive:   false,
    pullquotes:                   false,
    list_conversions:             false,
    emphasis_additions:           false,
  };

  if (level === 'custom' && options && typeof options === 'object') {
    return { ...features, ...options };
  }

  if (level === 'standard' || level === 'editorial') {
    features.thematic_breaks_conservative = true;
  }
  if (level === 'editorial') {
    features.thematic_breaks_aggressive = true;
    features.pullquotes                 = true;
    features.list_conversions           = true;
    features.emphasis_additions         = true;
  }
  return features;
}

// ── Prompt builder ─────────────────────────────────────────────────────────

function buildPrompt(article_html, features) {
  const truncated = article_html.length > 40000
    ? article_html.slice(0, 40000) + '\n\n[ARTICLE TRUNCATED HERE BY THE PIPELINE — DO NOT TREAT THIS AS THE END]'
    : article_html;

  const standardBlock = features.thematic_breaks_conservative ? `

LEVEL ADDITION — Conservative thematic breaks:
Insert <hr> tags between paragraphs ONLY at obvious argument pivots: paragraphs that open with framing phrases like "Now here is where", "Let me end with", "But here is the question", "I want to end with". Do not insert <hr> between paragraphs that flow continuously. Maximum 2-3 thematic breaks per article unless the article is over 2500 words and clearly structured around major pivots. Add an entry to change_log noting how many <hr> were inserted.` : '';

  const editorialBlock = features.pullquotes || features.list_conversions || features.emphasis_additions || features.thematic_breaks_aggressive ? `

LEVEL ADDITION — Active rhythm tools:${features.thematic_breaks_aggressive ? `
* AGGRESSIVE thematic breaks: insert <hr> at any argument pivot, not just framing-phrase ones. Calibrate by article length: 0-2 for sub-1000 words, 2-4 for 1000-2500, 4-7 for 2500+.` : ''}${features.pullquotes ? `
* PULLQUOTE EXTRACTION: when the article contains a self-contained sentence that crystallizes a key insight (≤30 words, declarative or aphoristic, doesn't depend on context), lift it OUT of its paragraph and emit as a standalone <blockquote>. The sentence appears ONLY in the blockquote in polished_html — it is removed from its original paragraph. The paragraph that surrounded it must still read coherently after the lift. Test: read the surrounding paragraph WITHOUT the candidate sentence; if it still flows, the lift is safe. Distribute pullquotes through the article (early/middle/late thirds), not clustered. Calibrate by length: 0-1 for sub-1000 words, 1-3 for 1000-2500, 2-5 for 2500+.` : ''}${features.list_conversions ? `
* LIST CONVERSION: when 3+ consecutive paragraphs share parallel structure (each starts the same way, each makes a parallel claim, often italicized in a row), convert to <ul><li> in polished_html. Italics across multiple sibling paragraphs is a substitute for missing list markup, not a stylistic choice — promote it to real list structure.` : ''}${features.emphasis_additions ? `
* EMPHASIS ADDITIONS: bold or italicize a load-bearing word or phrase inside one to two sentences per article. Do NOT bold whole sentences; bold the load-bearing word or phrase inside. Used sparingly, this guides the eye. Skip if the author already has emphasis throughout (consistency wins; don't double-up).` : ''}` : '';

  return `You are Dialecta's article polishing engine. Your job is to apply hygiene and (if enabled) light editorial dress-up to an article's HTML, then call the submit_polish tool with the result.

CRITICAL CONSTRAINT: The author's authored prose remains byte-for-byte identical to the original. You do not edit, paraphrase, summarize, or rewrite content. You do not change wording, claims, arguments, evidence, sentence structure, or grammar. You do not split paragraphs into multiple paragraphs. You do not add or remove sentences.

The ONLY changes permitted are described below — the FLOOR is always applied; additional LEVEL ADDITIONS are appended only when the caller enables them.

═══════════════════════════════════════════════════════════════════════
FLOOR — ALWAYS APPLIED
═══════════════════════════════════════════════════════════════════════

1. PUNCTUATION HYGIENE
   * Collapse multiple consecutive spaces inside a paragraph to a single space.
   * Ensure single space after periods, commas, semicolons, and colons.
   * Strip trailing whitespace from paragraphs.
   * Fix missing space after period when clearly accidental ("end.Next sentence" → "end. Next sentence").
   * Spacing around parentheses: ensure single space before "(" and after ")" within prose.

2. EM-DASH AND EN-DASH POLICY
   * Replace every em-dash (—) and en-dash (–) with appropriate alternative punctuation.
   * Choose based on context:
     - Aside or interruption → comma or parenthesis
     - Emphatic break → period or colon
     - Number range → "to" or "through"
     - Compound modifier → space or hyphen
   * This is a hard platform standard. No exceptions.

3. SMART QUOTES & APOSTROPHES
   * Convert straight typewriter quotes ("...") to curly quotes ("...").
   * Convert straight apostrophes (') to curly apostrophes (') in contractions and possessives.
   * Detect direction correctly based on surrounding text.

4. ELLIPSIS CONSOLIDATION
   * Replace three consecutive periods (...) with the proper ellipsis character (…).
   * Collapse spaced periods (". . .") similarly.

5. LAYOUT CRUFT REMOVAL
   * Remove <p>&nbsp;</p>, <p></p>, <p> </p>, and any <p> whose only content is whitespace, asterisk rows (***), or em-dashes.
   * Collapse 2+ consecutive empty paragraphs to nothing.
   * These are formatting artifacts from inferior editors, not authored content. Removing them does NOT violate the byte-for-byte rule.

6. SOURCES SECTION TAGGING
   * If the article contains a paragraph whose only content is "Sources" / "References" / "Notes" / "Bibliography" / "Citations" / "Further Reading" (case-insensitive, possibly bolded), re-emit as <h2>Sources</h2> (or matching heading text).
   * The display layer detects this pattern and styles the section accordingly.
   * Do NOT change the references that follow — they stay as the author wrote them, just under a proper heading tag.

7. PSEUDO-HEADER RECOGNITION
   * If the author wrote a section title as a standalone short paragraph (≤12 words, often no terminal period, naming a topic rather than making an argument, sitting alone between content paragraphs sometimes with empty <p>&nbsp;</p> spacers around it), promote it from <p> to <h2>.
   * Examples: "The Cost Question", "What the Objections Are", "On Method".
   * Build an outline: <h2> for major sections, <h3> for sub-aspects nested under an H2 (when clear).
   * This recognizes structure the author already created. The author's intent was a heading; you are correcting the markup.
   * DO NOT promote a content sentence (one inside a flowing argument that makes a claim) into a header just because it is rhetorically strong. Test: a real header NAMES a topic and could be removed without breaking the surrounding prose. A strong content sentence makes an argument and cannot be removed without leaving a hole.${standardBlock}${editorialBlock}

═══════════════════════════════════════════════════════════════════════
NEVER (regardless of level)
═══════════════════════════════════════════════════════════════════════

* Never split a single paragraph into multiple paragraphs.
* Never add or remove authored sentences.
* Never change wording, grammar, or sentence structure.
* Never add emphasis (<strong>/<em>) unless the emphasis_additions feature is enabled — and even then, only on load-bearing PHRASES inside sentences, never on whole sentences or paragraphs.
* Never add em-dashes or en-dashes in your output (the policy is one-way: remove them).

═══════════════════════════════════════════════════════════════════════
TONE FOR change_log
═══════════════════════════════════════════════════════════════════════

The change_log is observational, factual, brief. Examples of good entries:
* "Replaced 3 em-dashes with commas"
* "Tagged 'The Environmental Question' as <h2>"
* "Recognized Sources section, promoted to <h2>"
* "Stripped 5 empty spacer paragraphs"
* "Inserted 2 thematic breaks at argument pivots"
* "Lifted 'Whatever the answer is, it cannot be small.' as a pullquote"

One entry per category of change, not one per individual edit. If nothing changed, return an empty array.

═══════════════════════════════════════════════════════════════════════
OUTPUT CONSTRAINTS
═══════════════════════════════════════════════════════════════════════

* Only these HTML tags may appear in polished_html: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>, <hr>. No others.
* No HTML attributes. Tags must be bare (<p>, not <p class="lede">).
* polished_html is REQUIRED and must be non-empty. If no changes were warranted, set polished_html to the original article verbatim and return an empty change_log.
* The author's authored TEXT content must be byte-for-byte identical to the original except for: punctuation hygiene transformations, em-dash replacements, smart-quote conversions, and layout-cruft removals. (These are not "authored content" — they are policy transforms.)

═══════════════════════════════════════════════════════════════════════
ARTICLE HTML
═══════════════════════════════════════════════════════════════════════
"""
${truncated}
"""

Now call the submit_polish tool with the polished article and a change log.`;
}

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { article_html, polish_level, polish_options } = req.body || {};

  if (!article_html || typeof article_html !== 'string' || article_html.length < 200) {
    return res.status(400).json({
      error: 'article_html is required and must be at least 200 characters',
    });
  }

  const level = polish_level && VALID_LEVELS.has(polish_level) ? polish_level : 'light';
  const features = resolveFeatures(level, polish_options);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8192,
      temperature: 0.3,
      tools: [POLISH_TOOL],
      tool_choice: { type: 'tool', name: 'submit_polish' },
      messages: [{ role: 'user', content: buildPrompt(article_html, features) }],
    });

    const toolUseBlock = message.content.find(b => b.type === 'tool_use' && b.name === 'submit_polish');

    if (!toolUseBlock || !toolUseBlock.input) {
      console.error('Polish v2: no tool_use block. Raw:', JSON.stringify(message.content).slice(0, 800));
      return res.status(502).json({
        error: 'Polish engine did not return a tool call',
      });
    }

    const result = toolUseBlock.input;

    // Defensive shape coercion.
    if (typeof result.polished_html !== 'string' || result.polished_html.trim().length === 0) {
      // Engine produced no usable output; fall back to original.
      result.polished_html = article_html;
    }
    if (!Array.isArray(result.change_log)) {
      result.change_log = [];
    }

    return res.status(200).json({
      polished_html: result.polished_html,
      change_log:    result.change_log,
      level_applied: level,
      features_applied: features,
    });
  } catch (error) {
    console.error('Polish v2 error:', error);
    return res.status(500).json({
      error: 'Polish failed',
      detail: error.message,
    });
  }
}
