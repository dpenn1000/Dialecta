/**
 * api/article/classify-order.js
 *
 * Steward Order classification engine. Reads an author's recent published
 * articles, fetches their content from Ghost, asks Claude (using the
 * Stewards classification skill) to propose a canonical Order, and stores
 * the proposal as `order_pending_proposal` on the profile.
 *
 * The author always wins the public claim. This endpoint only PROPOSES.
 * Confirmation flows through /api/profile/order.
 *
 * Trigger logic (frontend pings this on profile load):
 *   - First time (order_id is null) and >= 1 article published: classify
 *   - Within first 3 articles, count advanced since last classify: classify
 *   - Periodic re-check: every 5 articles after the third
 *   - Author requested via { force: true }: always classify
 *   - Otherwise: return { classification_due: false } and any pending proposal
 *
 * Auth model mirrors api/article/submit.js Path C-lite.
 *
 * POST body:
 *   { member_uuid: string, force?: boolean }
 *
 * Response:
 *   {
 *     classification_due: boolean,
 *     reason: string,                // 'never_classified' | 'within_first_three' | 'periodic_recheck' | 'not_yet_due' | 'no_articles'
 *     article_count: number,
 *     order: { id, label, family } | null,
 *     pending_proposal: object | null,
 *     usage: object | undefined,
 *   }
 *
 * Model: claude-opus-4-7 with adaptive thinking and effort=high. The
 * Stewards skill is supplied as a cached system prompt (cache_control:
 * ephemeral) so re-classifications across many authors share the cache.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';
import { ghostAdminFetch } from '../_ghost-admin.js';
import { STEWARDS_CLASSIFICATION_SKILL } from '../_stewards-skill.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const ORDER_CLASSIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    proposed_order_id:        { type: 'string' },
    proposed_order_label:     { type: 'string' },
    proposed_order_family:    { type: 'string' },
    alternative_order_id:     { type: ['string', 'null'] },
    alternative_order_label:  { type: ['string', 'null'] },
    alternative_order_family: { type: ['string', 'null'] },
    rationale:                { type: 'string' },
    confidence:               { type: 'number' },
  },
  required: [
    'proposed_order_id',
    'proposed_order_label',
    'proposed_order_family',
    'rationale',
    'confidence',
  ],
  additionalProperties: false,
};

const CANONICAL_ORDER_IDS = new Set([
  'essayist', 'aphorist', 'memoirist', 'diarist', 'blogger',
  'pamphleteer', 'polemicist', 'dialectician', 'provocateur',
  'cartographer', 'anthologist', 'translator', 'theorist',
  'philologist', 'lexicographer', 'historian', 'empiricist',
  'fabulist', 'playwright', 'screenwriter', 'biographer',
  'clinician', 'diagnostician', 'naturalist',
  'correspondent', 'annalist', 'reportorial', 'critic', 'marginalia',
  'glossator',
  'futurist',
  'satirist',
]);

const VALID_FAMILIES = new Set([
  'essayistic', 'argumentative', 'synthetic', 'scholarly',
  'narrative', 'practitioner', 'journalistic', 'pedagogical',
  'speculative', 'declared',
]);

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

function classificationDue(profile, articleCount) {
  if (articleCount === 0) return { due: false, reason: 'no_articles' };
  if (!profile.order_id) return { due: true, reason: 'never_classified' };
  const watermark = profile.last_order_classified_count || 0;
  if (watermark < 3 && articleCount > watermark) {
    return { due: true, reason: 'within_first_three' };
  }
  if (articleCount - watermark >= 5) {
    return { due: true, reason: 'periodic_recheck' };
  }
  return { due: false, reason: 'not_yet_due' };
}

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { member_uuid, force } = req.body || {};
  if (!member_uuid || typeof member_uuid !== 'string') {
    return res.status(400).json({
      error: 'member_uuid is required (Ghost member UUID from the {{@member}} session)',
    });
  }

  try {
    // Step 1: load profile.
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select(
        'id, ghost_member_id, display_name, order_id, order_label, order_family, last_order_classified_count, order_pending_proposal'
      )
      .eq('ghost_member_id', member_uuid)
      .maybeSingle();
    if (profileErr) throw profileErr;
    if (!profile) {
      return res.status(403).json({
        error: 'No Dialecta profile exists for this member. The profile is created the first time you visit /profile/.',
      });
    }

    // Step 2: load author's published articles from Supabase.
    const { data: articles, error: articlesErr } = await supabase
      .from('articles')
      .select('id, ghost_post_id, declaration, created_at')
      .eq('author_member_id', member_uuid)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);
    if (articlesErr) throw articlesErr;

    const articleCount = articles?.length || 0;

    // Step 3: decide whether to classify.
    const { due, reason } = classificationDue(profile, articleCount);
    if (!due && !force) {
      return res.status(200).json({
        classification_due: false,
        reason,
        article_count: articleCount,
        order: profile.order_id
          ? { id: profile.order_id, label: profile.order_label, family: profile.order_family }
          : null,
        pending_proposal: profile.order_pending_proposal,
      });
    }

    // Step 4: fetch Ghost content for each article. Tolerate per-post
    // failures so a single bad ghost_post_id doesn't fail the whole call.
    const ghostPosts = await Promise.all(
      articles.map(async (a) => {
        try {
          const r = await ghostAdminFetch(
            `/posts/${a.ghost_post_id}/?formats=plaintext,html&fields=id,title,slug,custom_excerpt,plaintext,html`
          );
          return r.posts?.[0] || null;
        } catch (err) {
          console.error('Ghost post fetch failed for', a.ghost_post_id, err.message);
          return null;
        }
      })
    );

    // Step 5: assemble the article corpus for the classifier.
    const corpus = articles
      .map((a, i) => {
        const post = ghostPosts[i];
        const decl = a.declaration || {};
        const title = post?.title || '(untitled)';
        const excerpt = post?.custom_excerpt || '(no excerpt)';
        const text = post?.plaintext || htmlToPlaintext(post?.html || '');
        const trimmed = text.length > 6000 ? text.slice(0, 6000) + '\n\n[truncated]' : text;
        return [
          `### Article ${i + 1}: ${title}`,
          `Core claim (declared): ${decl.core_claim || '(not declared)'}`,
          `Excerpt: ${excerpt}`,
          '',
          trimmed,
        ].join('\n');
      })
      .join('\n\n---\n\n');

    const userMessage =
      `Classify this author into one of the canonical Steward Orders based on the following ${articleCount} article${articleCount === 1 ? '' : 's'}. Read all of them, look for cross-piece patterns, and follow the output contract.\n\n` +
      corpus;

    // Step 6: call Claude. Adaptive thinking is off by default on Opus
    // 4.7; enable it explicitly. effort=high is the floor for this kind of
    // fine-grained classification work.
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'high',
        format: {
          type: 'json_schema',
          schema: ORDER_CLASSIFICATION_SCHEMA,
        },
      },
      system: [
        {
          type: 'text',
          text: STEWARDS_CLASSIFICATION_SKILL,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        { role: 'user', content: userMessage },
      ],
    });

    // Step 7: extract the JSON output from the response. With
    // output_config.format json_schema, the response carries a single text
    // block whose body is the JSON object.
    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock?.text) {
      return res.status(502).json({
        error: 'Classifier returned no text content',
        stop_reason: message.stop_reason,
      });
    }
    let parsed;
    try {
      parsed = JSON.parse(textBlock.text);
    } catch (parseErr) {
      console.error('Classifier JSON parse failed. Raw:', textBlock.text.slice(0, 500));
      return res.status(502).json({
        error: 'Classifier returned malformed JSON',
        raw: textBlock.text.slice(0, 500),
      });
    }

    // Step 8: validate the proposal against canonical slugs. The Satirist
    // is reserved for self-declaration only; if the classifier lands there,
    // surface as an error so the operator can adjust the skill.
    if (!CANONICAL_ORDER_IDS.has(parsed.proposed_order_id)) {
      return res.status(502).json({
        error: 'Classifier returned a non-canonical Order slug',
        proposed: parsed.proposed_order_id,
      });
    }
    if (parsed.proposed_order_id === 'satirist') {
      return res.status(502).json({
        error: 'Classifier proposed The Satirist (declared-only). Re-running with adjusted prompt may be required.',
      });
    }
    if (!VALID_FAMILIES.has(parsed.proposed_order_family)) {
      return res.status(502).json({
        error: 'Classifier returned a non-canonical Family slug',
        proposed: parsed.proposed_order_family,
      });
    }

    // Step 9: compose and persist the pending proposal. Advance the
    // classified-count watermark so the trigger logic does not refire on
    // the same article count.
    const pending_proposal = {
      ...parsed,
      classified_at: new Date().toISOString(),
      article_count: articleCount,
      classification_reason: reason,
    };

    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        order_pending_proposal: pending_proposal,
        last_order_classified_count: articleCount,
      })
      .eq('ghost_member_id', member_uuid);
    if (updateErr) throw updateErr;

    return res.status(200).json({
      classification_due: true,
      reason,
      article_count: articleCount,
      order: profile.order_id
        ? { id: profile.order_id, label: profile.order_label, family: profile.order_family }
        : null,
      pending_proposal,
      usage: message.usage
        ? {
            input_tokens: message.usage.input_tokens,
            output_tokens: message.usage.output_tokens,
            cache_read_input_tokens: message.usage.cache_read_input_tokens,
            cache_creation_input_tokens: message.usage.cache_creation_input_tokens,
          }
        : undefined,
    });
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
    console.error('Order classification error:', error);
    return res.status(500).json({
      error: 'Order classification failed',
      detail: error.message,
    });
  }
}
