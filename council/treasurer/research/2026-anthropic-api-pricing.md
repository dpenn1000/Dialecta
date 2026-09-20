# Anthropic: Claude API pricing

**Source:** Anthropic, "Pricing", claude.com, fetched 2026-09-19. https://claude.com/pricing (www.anthropic.com/pricing redirects here with a 301)

## Summary

Published per-million-token rates on the fetch date:

| Model | Input | Output | Cache read | Cache write (5m) |
| --- | --- | --- | --- | --- |
| Haiku 4.5 | $1 | $5 | $0.10 | $1.25 |
| Sonnet 5 | $2 | $10 | $0.20 | $2.50 |
| Opus 5 | $5 | $25 | $0.50 | $6.25 |
| Fable 5.1 | $10 | $50 | $0.25 | $12.50 |

The page also states a 50 percent saving for batch processing.

The live classifier config was read from `api/classify.js` in this repo on the same day: model `claude-haiku-4-5-20251001`, `SYSTEM_PROMPT` of 2,688 characters (about 670 tokens at four characters per token), `max_tokens: 512`, and a user message that wraps the article claims block plus the comment body in 46 characters of template.

Cost of one Stage 1 classification, computed from those two facts:

| Case | Input tokens | Output tokens | Cost |
| --- | --- | --- | --- |
| Typical (110-word comment, JSON reply) | about 950 | about 200 | $0.0020 |
| Ceiling (long comment, output at the 512 cap) | about 1,300 | 512 | $0.0039 |

At $0.002 per comment: 1,000 comments a month costs $2, 10,000 costs $20, 100,000 costs $200.

The lead in `reading-list.md` asked for "Claude Haiku input and output per million tokens". Confirmed at $1 and $5. The lead did not name a Haiku version; the live code pins 4.5, so 4.5 is the rate that applies.

## Implies for Dialecta

- The classification call is the only per-comment variable cost, and it is a fifth of a cent. The charter's veto on "per-comment costs that scale linearly with the community" is satisfied at any volume Dialecta will plausibly see this decade.
- AI spend is not the budget problem. At 10,000 comments a month, Haiku costs $20 against a fixed infrastructure floor of about $45. See `../positions/monetization.md` for the combined model.
- Backlog A-2 (the classification job) should record `model` and `prompt_version` on every `classifications` row, which the spec already requires. That makes the cost per comment measurable rather than estimated, and it is the number the charter says Dan owes this advisor.
- The estimate is token-counted by character division, not by the API's own counter. Replace it with real `usage` figures from the first week of A-2 traffic before anyone plans against it.

*Filed 2026-09-19*
