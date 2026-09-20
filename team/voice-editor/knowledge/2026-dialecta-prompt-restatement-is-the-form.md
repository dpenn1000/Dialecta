# "Defer to this document" cannot mean a runtime read, for any of the three prompts

## Citation

`docs/Dialecta_Editorial_Voice.md` line 364, and `packages/core/src/classification.ts` lines
1-13 and 170-228 (`SYSTEM_PROMPT`, `buildSystemPrompt`), read 2026-09-20 at commit `c4ca6406`.

## Summary

Line 364 says: "the system prompt in `api/classify.js` should defer to this document rather
than restate it." All three copies restate it, which is the lead's premise. What was
unverified is whether that is a shortcut being taken or the only form the sentence can take.

`buildSystemPrompt()` returns a hardcoded template literal, `SYSTEM_PROMPT`, closed over at
module load. Its own header says it "descends from the live one in `api/classify.js`" and lists
three specific differences (dashes replaced, tone section rewritten, JSON contract unchanged).
That is a description of an editing relationship between two files at authoring time, not a
mechanism. Nothing in `classification.ts`, `classify.js`, or `comment.js` reads
`docs/Dialecta_Editorial_Voice.md` from disk, bundles it, or fetches it at request time.

This is not a shortcut. An Anthropic API call sends a string. No point in the request lifecycle
resolves "defer to a markdown file" into anything except "the string was written to match the
markdown file." A literal runtime read is possible to build (bundle the doc, parse
out the rules, inject them) but nothing today does it, nothing in the three prompt files
gestures at wanting it, and it would add a filesystem or bundle dependency to a model call for a
guarantee (freshness) that a version-bumped constant and a test already provide more cheaply.
`CLASSIFIER_PROMPT_VERSION` and the dash-count test at
`packages/core/test/classification.test.ts` line 81 are that cheaper mechanism, already built.

## Implies

- **The doc's wording overclaims what any implementation could do.** "Defer to... rather than
  restate" reads as a runtime instruction and no prompt can follow it literally. The practical,
  achievable version is closer to "derive from, and keep in sync with, at authoring time," which
  is exactly what the core copy's header already does in its own words.
- **This is a spec-wording question, not a code gap.** `docs/` is outside this agent's write
  scope (`guard-docs.mjs`) and specs are Dan's per `exchange/README.md`. Flagging it is this
  agent's job; changing it is not.
- Closes the lead from [[2026-dialecta-classify-prompt]] with a definite answer: restatement is
  the only practical form, not an accepted shortcut standing in for an unbuilt runtime read.

## Leads this raised

- Whether "should defer to" is worth a one-line correction to "should derive from and stay
  versioned against" next time `docs/Dialecta_Editorial_Voice.md` gets a real edit (not by this
  agent). Small enough to fold into that edit rather than open its own record.
