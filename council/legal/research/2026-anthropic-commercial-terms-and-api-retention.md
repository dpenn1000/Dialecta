# Anthropic's commercial terms and API retention (vendor)

**Source:** Two Anthropic pages, read 2026-09-21 through the fetch tool's extraction. **Vendor
sources:** Anthropic is the processor they describe, and what they say binds Anthropic to its
customers, not to Dialecta's members. Commercial Terms of Service, effective June 17, 2025:
https://www.anthropic.com/legal/commercial-terms. Privacy Center, "How long do you store my
organization's data?", last updated July 1, 2026:
https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data

## Summary

Commercial Terms, Section B: "Anthropic may not train models on Customer Content from Services."
"Customer (a) retains all rights to its Inputs, and (b) owns its Outputs."

Retention: "For Anthropic API users, we automatically delete inputs and outputs on our backend
within 30 days of receipt or generation." If a request is flagged under the usage policy, Anthropic
retains inputs and outputs "for up to 2 years" and classification scores for up to seven years.
Separate retention applies to "Covered Models", and retention may differ where the law requires it
or a contract says otherwise.

## Implies for Dialecta

- **The Processors paragraph in `drafts/privacy-notice.md` is drafted to these three facts:** 30
  days, up to two years if flagged, no training.
- **What goes to Anthropic was read from the code, not assumed.** `apps/web/src/lib/classify.ts`
  sends `buildSystemPrompt()` and `buildUserMessage(body, articleClaims)`; `packages/core/src/classification.ts`
  line 256 builds that message from the comment text and the article's key claims only. The route
  that calls it, `apps/web/src/app/api/comment/route.ts`, reads the member's name and email from the
  session and never passes either to the classifier. The legacy API does the same for comments
  (`api/comment.js`), and sends article text to a second model for articles
  (`_recovered/api/article/classify.js` line 279), which `apps/web` does not connect.
- **Outputs belong to Dialecta under these terms,** which fits the draft's statement that a tier is
  Dialecta's own statement: the words are the platform's by contract as well as by authorship.
- **These terms cover the API key. They may not cover the AI coding sessions** that read the
  production database while building the platform. Which terms govern those depends on the plan
  and its training setting, which this seat cannot see (B19 in `drafts/README.md`).
- **Covered Models are not identified here.** Whether the model in use is one, and what that
  changes, was not read.

*Filed 2026-09-21*
