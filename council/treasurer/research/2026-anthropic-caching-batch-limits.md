# Anthropic: prompt caching minimums and Batch API limits

**Source:** Anthropic, "Prompt caching" and "Batch processing", platform.claude.com docs, fetched 2026-09-19. https://platform.claude.com/docs/en/build-with-claude/prompt-caching and https://platform.claude.com/docs/en/build-with-claude/batch-processing

## Summary

Prompt caching has a minimum cacheable prefix that varies by model. For **Claude Haiku 4.5 the minimum is 4,096 tokens**. Below the minimum, caching is skipped silently: no error is returned, and `cache_creation_input_tokens` and `cache_read_input_tokens` come back showing it did not happen. Cache reads cost 0.1x base input. Cache writes cost 1.25x base input at the default five-minute TTL, or 2x at the one-hour TTL.

The Batch API cuts cost by 50 percent. Most batches finish within an hour. Results are available when all messages complete or after 24 hours, whichever comes first, and a batch that has not finished in 24 hours expires. A batch holds up to 100,000 requests or 256 MB.

Both findings collide with the live design, and in opposite directions:

1. Dialecta's system prompt is about 670 tokens. That is one sixth of Haiku 4.5's 4,096-token minimum, so **the classifier gets no caching discount today and is not being billed for one either**. Nothing is broken; the discount is not available.
2. Padding the prompt to 4,096 tokens to unlock caching would cost more, not less, at Dialecta's volume. A cache write is 4,096 x $1.25/MTok = $0.00512. The whole current call costs about $0.002. With a five-minute TTL and comments arriving hours apart, nearly every call pays the write premium. Caching becomes worth it only when comments arrive faster than the TTL expires, sustained.
3. The Batch API's 50 percent discount cannot be used for Stage 1. The Project Brief specifies AI pre-analysis as "instant, on submit" with a reflection prompt shown before the comment posts. A path that may take an hour cannot serve it.

## Implies for Dialecta

- Do not plan a caching discount into any cost model for the classifier. At 670 tokens it does not apply, and engineering the prompt up to 4,096 tokens to claim it loses money until sustained comment volume exceeds roughly one comment every five minutes.
- The 50 percent batch discount is real but unreachable for Stage 1. It is reachable for anything that can wait: backfill classification of imported Ghost comments, re-scoring the corpus after a `prompt_version` change, and the Tier 3 fine-tuning data preparation named in the Project Brief. Backlog P0-7 (Ghost import) is the first candidate.
- If A-2 is ever rewritten to classify asynchronously after posting, the 50 percent discount comes with it. That is a monetization-relevant tradeoff and belongs in the A-2 decision, not in a cost spreadsheet: it trades the pre-publish reflection moment, which the Project Brief calls the place behavior change happens, for a fifth of a cent.
- Whoever builds A-2 should assert on `cache_read_input_tokens` in a test, so a future prompt that crosses 4,096 tokens is noticed as a pricing event rather than discovered on a bill.

*Filed 2026-09-19*
