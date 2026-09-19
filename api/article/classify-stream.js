/**
 * api/article/classify-stream.js
 *
 * Server-Sent Events (SSE) variant of /api/article/classify. Streams the
 * Anthropic response back to the client as it's generated, so the picker
 * UI can render candidates as they become parseable and the loading UX
 * can show real model reasoning instead of a fake timeline.
 *
 * Why a separate endpoint: keeping classify.js unchanged means the editor
 * (which still uses fetch().json()) is not affected. The admin re-setup
 * modal is the first SSE consumer; the editor can migrate later.
 *
 * Skill v2.4.0 reordered candidate_maps to be the FIRST field in the
 * response JSON precisely so this stream can detect complete candidate
 * objects as they appear, before the rest of the analysis arrives.
 *
 * SSE event protocol:
 *   event: phase            { phase: 'thinking' | 'writing-output' | 'candidates-streaming' | 'candidates-complete' | 'complete' }
 *   event: thinking         { text }                  // sampled, ~80 char chunks
 *   event: candidate        { index, candidate }      // one per complete candidate
 *   event: result           { analysis }              // final parsed full JSON
 *   event: error            { error, detail?, raw_preview? }
 *
 * The client should listen for `result` to get the canonical analysis,
 * and use `candidate` events for incremental UI updates only.
 *
 * POST body: same shape as classify.js (article_text, declaration, declared_tier).
 * Headers: text/event-stream; the response is held open until message_stop.
 */

import Anthropic from '@anthropic-ai/sdk';
import { applyCors } from '../_cors.js';
import { OPINION_MAPPER_SKILL } from '../_skills/opinion-mapper.js';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const TIERS = ['forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach'];
const ARTICLE_CHAR_CAP = 25000;
const THINKING_FLUSH_BYTES = 80;  // emit a thinking SSE event roughly every 80 chars

function buildUserMessage({ article_text, declaration, declared_tier, max_candidates }) {
  const truncated = article_text.length > ARTICLE_CHAR_CAP
    ? article_text.slice(0, ARTICLE_CHAR_CAP) + '\n\n[truncated for length]'
    : article_text;

  // Optional candidate-count cap. Used by the editor to enforce the
  // tier-aware quota (Free: 2, Underwriter: skill default = 3). When
  // absent, the skill's default applies (target 3, allow 2-4).
  const candidateOverride = (typeof max_candidates === 'number' && max_candidates >= 1 && max_candidates <= 4)
    ? `CANDIDATE COUNT OVERRIDE: produce no more than ${max_candidates} candidate framing${max_candidates === 1 ? '' : 's'}. The skill's default target is 3; this request caps the count at ${max_candidates}. Quality over count still applies; if you cannot honestly produce ${max_candidates}, produce fewer (minimum 2 unless 1 was requested).\n\n`
    : '';

  return `${candidateOverride}Apply the opinion-mapper skill (in the system prompt) to the article below.

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

  const { article_text, declaration, declared_tier, max_candidates } = req.body || {};

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

  // SSE headers. X-Accel-Buffering disables proxy buffering on nginx-style
  // intermediaries; Vercel's edge layer already streams text/event-stream
  // responses without explicit opt-in.
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  function send(event, data) {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    } catch (e) {
      // Connection probably closed; nothing to do
    }
  }

  // Bail early if the client disconnects so we don't keep writing.
  let clientGone = false;
  req.on('close', () => { clientGone = true; });

  send('phase', { phase: 'starting' });

  // Incremental candidate-detection state machine. Walks the accumulated
  // text output, tracks string vs. structure context, and emits a
  // `candidate` event each time a top-level object inside the
  // candidate_maps array closes.
  let buf = '';
  let inCandidateArray = false;
  let stringMode = false;
  let escaped = false;
  let braceDepth = 0;
  let candidateStartIdx = -1;
  let emittedCount = 0;
  let thinkingBuffer = '';
  let lastThinkingFlush = 0;
  let thinkingPhaseEmitted = false;
  let outputPhaseEmitted = false;

  function scanChar(i) {
    const ch = buf[i];
    if (escaped) { escaped = false; return; }
    if (ch === '\\') { escaped = true; return; }
    if (stringMode) {
      if (ch === '"') stringMode = false;
      return;
    }
    if (ch === '"') { stringMode = true; return; }
    if (ch === '{') {
      if (braceDepth === 0) candidateStartIdx = i;
      braceDepth++;
      return;
    }
    if (ch === '}') {
      braceDepth--;
      if (braceDepth === 0 && candidateStartIdx >= 0) {
        const cj = buf.slice(candidateStartIdx, i + 1);
        try {
          const candidate = JSON.parse(cj);
          send('candidate', { index: emittedCount, candidate });
          emittedCount++;
        } catch (_e) {
          // Brace-balanced but not parseable JSON; will be caught at the
          // final parse step.
        }
        candidateStartIdx = -1;
      }
      return;
    }
    if (ch === ']' && braceDepth === 0 && inCandidateArray) {
      inCandidateArray = false;
      send('phase', { phase: 'candidates-complete', count: emittedCount });
    }
  }

  function processOutputText(newText) {
    const startIdx = buf.length;
    buf += newText;

    if (!inCandidateArray) {
      const marker = '"candidate_maps":';
      // Scan from a little before startIdx to handle markers that span
      // chunk boundaries.
      const searchFrom = Math.max(0, startIdx - marker.length);
      const markerIdx = buf.indexOf(marker, searchFrom);
      if (markerIdx < 0) return;
      const bracketIdx = buf.indexOf('[', markerIdx + marker.length);
      if (bracketIdx < 0) return;
      inCandidateArray = true;
      send('phase', { phase: 'candidates-streaming' });
      for (let i = bracketIdx + 1; i < buf.length; i++) scanChar(i);
      return;
    }

    for (let i = startIdx; i < buf.length; i++) scanChar(i);
  }

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 8192,
      thinking: { type: 'adaptive', display: 'summarized' },
      output_config: { effort: 'high' },
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
          content: buildUserMessage({ article_text, declaration, declared_tier, max_candidates }),
        },
      ],
    });

    for await (const event of stream) {
      if (clientGone) {
        // Best-effort abort: stop iterating. Anthropic call continues
        // server-side but we stop writing to a closed socket.
        break;
      }

      if (event.type === 'content_block_start') {
        const blockType = event.content_block?.type;
        if (blockType === 'thinking' && !thinkingPhaseEmitted) {
          send('phase', { phase: 'thinking' });
          thinkingPhaseEmitted = true;
        } else if (blockType === 'text' && !outputPhaseEmitted) {
          send('phase', { phase: 'writing-output' });
          outputPhaseEmitted = true;
        }
      } else if (event.type === 'content_block_delta') {
        const dt = event.delta?.type;
        if (dt === 'thinking_delta' && event.delta.thinking) {
          thinkingBuffer += event.delta.thinking;
          if (thinkingBuffer.length - lastThinkingFlush >= THINKING_FLUSH_BYTES) {
            const chunk = thinkingBuffer.slice(lastThinkingFlush);
            send('thinking', { text: chunk });
            lastThinkingFlush = thinkingBuffer.length;
          }
        } else if (dt === 'text_delta' && event.delta.text) {
          processOutputText(event.delta.text);
        }
      } else if (event.type === 'message_stop') {
        // Flush any pending thinking text.
        if (thinkingBuffer.length > lastThinkingFlush) {
          send('thinking', { text: thinkingBuffer.slice(lastThinkingFlush) });
          lastThinkingFlush = thinkingBuffer.length;
        }
        // Parse the final accumulated text and emit the canonical result.
        const cleaned = buf
          .trim()
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/```\s*$/i, '')
          .trim();
        try {
          const analysis = JSON.parse(cleaned);
          send('result', { analysis });
          send('phase', { phase: 'complete' });
        } catch (parseErr) {
          send('error', {
            error: 'Failed to parse final JSON',
            detail: parseErr.message,
            raw_preview: buf.slice(0, 500),
          });
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('classify-stream error:', err);
    send('error', { error: 'Stream failed', detail: err.message });
    try { res.end(); } catch (_) { /* already ended */ }
  }
}
