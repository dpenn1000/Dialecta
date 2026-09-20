/**
 * The classification call itself. packages/core (`@dialecta/core`) owns the
 * prompt and the response contract (buildSystemPrompt, buildUserMessage,
 * parseClassification) but does no I/O by mandate (packages/core/CLAUDE.md),
 * so the actual Anthropic request lives here, in apps/web, the same
 * division the recovered predecessor used (api/classify.js built the
 * prompt and called Anthropic in one file; here the prompt half is shared
 * and tested, the call half is this file).
 *
 * Model and max_tokens match the recovered production call
 * (_recovered/api/classify.js:68-69) verbatim; nothing here tunes them.
 * Plain fetch rather than @anthropic-ai/sdk: apps/web does not depend on
 * the SDK today and one call does not earn a new dependency.
 */
import { buildSystemPrompt, buildUserMessage, parseClassification, type ClassificationResult } from '@dialecta/core';

const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';
const ANTHROPIC_MAX_TOKENS = 1024;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export class ClassificationRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'ClassificationRequestError';
  }
}

/**
 * Calls the classifier and returns its parsed, validated result.
 * Throws ClassificationRequestError on a transport/HTTP failure, or
 * ClassificationParseError (from @dialecta/core) on a malformed response body.
 * Caller decides the HTTP status to return; this function never touches `Response`.
 */
export async function classifyComment(
  body: string,
  articleClaims: readonly string[] = [],
): Promise<ClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new ClassificationRequestError('ANTHROPIC_API_KEY is not configured');
  }

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: ANTHROPIC_MAX_TOKENS,
        system: buildSystemPrompt(),
        messages: [{ role: 'user', content: buildUserMessage(body, articleClaims) }],
      }),
    });
  } catch (err) {
    throw new ClassificationRequestError(
      `Classification request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new ClassificationRequestError(
      `Classification engine returned ${response.status}: ${text.slice(0, 500)}`,
      response.status,
    );
  }

  const payload = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const textBlock = payload.content?.find((block) => block.type === 'text');
  if (!textBlock?.text) {
    throw new ClassificationRequestError('Classification engine returned no text content');
  }

  // Throws ClassificationParseError on anything that doesn't match the contract;
  // deliberately not caught here so the caller's error handling stays in one place.
  return parseClassification(textBlock.text);
}
