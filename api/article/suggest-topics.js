/**
 * api/article/suggest-topics.js
 *
 * Topic suggestion endpoint. Author hits a "Suggest topics" button in
 * the editor; the article HTML comes here; Claude returns a recommended
 * primary topic (from the canonical 12) and 1-3 suggested secondary
 * tags (open-form). The author can accept, edit, or ignore.
 *
 * The endpoint is opinion, not gate. The author has final say.
 *
 * POST body:
 *   { article_html: string, title?: string }
 *
 * Response:
 *   {
 *     primary: { slug: string, label: string },
 *     secondary: [string, ...],   // open free-form, 1-3 entries
 *     rationale: string           // 1 sentence on why this fits
 *   }
 */

import Anthropic from '@anthropic-ai/sdk';
import { applyCors } from '../_cors.js';
import { CANONICAL_TOPICS, TOPIC_SLUG_SET } from '../_topics.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

function buildPrompt({ article_text, title }) {
  const truncated = article_text.length > 8000
    ? article_text.slice(0, 8000) + '\n\n[truncated]'
    : article_text;

  const topicList = CANONICAL_TOPICS.map(t => `- ${t.slug} (${t.label})`).join('\n');

  return `You are Dialecta's topic suggestion assistant. You read an article and recommend the best primary topic from a fixed list, plus 1 to 3 secondary tags (open free-form) that would help readers find it.

CANONICAL PRIMARY TOPICS (pick exactly one slug):
${topicList}

PRIMARY TOPIC RULES:
- Choose the slug that best matches the article's main subject area.
- The primary topic is the dominant subject, not a tangential one.
- Pick exactly one. The author will pick a different one if they disagree.

SECONDARY TAGS:
- Free-form text. 1 to 3 tags. Lowercase phrases, hyphenated.
- Examples: "renewable-policy", "stoicism", "ai-safety", "mental-health-stigma".
- Useful for cross-cutting themes the canonical 12 do not capture precisely.
- Avoid duplicating the primary topic's label.

PUNCTUATION CONSTRAINT: do not use em dashes (—) or en dashes (–) anywhere in your output. Use commas, periods, colons, or parentheses.

ARTICLE TITLE: ${title || '(no title provided)'}

ARTICLE TEXT:
"""
${truncated}
"""

Respond with ONLY a valid JSON object in this exact shape (no preamble, no code fences):
{
  "primary": "<one slug from the canonical list above>",
  "secondary": ["tag-one", "tag-two"],
  "rationale": "one sentence explaining why this primary fits and what the secondary tags add"
}`;
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { article_html, title } = req.body || {};
  if (!article_html || typeof article_html !== 'string' || article_html.length < 100) {
    return res.status(400).json({
      error: 'article_html is required and must be at least 100 characters',
    });
  }

  const article_text = htmlToPlaintext(article_html);

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      temperature: 0.3,
      messages: [{ role: 'user', content: buildPrompt({ article_text, title }) }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let result;
    try {
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Topic-suggest JSON parse failed:', parseErr, '\nRaw:', raw);
      return res.status(502).json({
        error: 'Topic suggestion engine returned non-JSON output',
        detail: parseErr.message,
        raw_preview: raw.slice(0, 400),
      });
    }

    // Validate primary slug is in our canonical set; if not, fall back to society_culture
    // (the broadest catch-all) and surface in rationale.
    let primarySlug = result.primary;
    let validatedPrimary;
    if (typeof primarySlug === 'string' && TOPIC_SLUG_SET.has(primarySlug)) {
      validatedPrimary = CANONICAL_TOPICS.find(t => t.slug === primarySlug);
    } else {
      console.warn('Topic suggestion returned non-canonical slug:', primarySlug, 'falling back to society_culture');
      validatedPrimary = CANONICAL_TOPICS.find(t => t.slug === 'society_culture');
    }

    const secondary = Array.isArray(result.secondary)
      ? result.secondary.filter(s => typeof s === 'string' && s.trim()).slice(0, 3)
      : [];

    return res.status(200).json({
      primary: validatedPrimary,
      secondary,
      rationale: typeof result.rationale === 'string' ? result.rationale : '',
    });
  } catch (error) {
    console.error('Topic suggest error:', error);
    return res.status(500).json({
      error: 'Topic suggestion failed',
      detail: error.message,
    });
  }
}
