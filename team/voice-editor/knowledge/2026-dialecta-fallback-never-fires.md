# The strings.ts fallback has nothing to fall back from

## Citation

`apps/web/src/strings.ts` lines 1-9 and 18-29, `packages/core/src/classification.ts` lines
59-63 and 150-168 (`requireString`, `parseClassification`), and a repo-wide grep for
`commenterMessages` across every `.ts`, `.tsx`, and `.js` file. All read 2026-09-20 at commit
`c4ca6406`.

## Summary

Three separate facts, each verified against the code directly rather than against the prior
note that raised the question, and each makes the claim less true, not more.

**1. The only validation is a type check.** `requireString` is:

```
function requireString(raw, obj, key) {
  const v = obj[key];
  if (typeof v !== 'string') fail(raw, `"${key}" must be a string, got ${describe(v)}`);
  return v;
}
```

`parseClassification` calls it for `commenter_message`, trims the result, and fails only if the
trimmed string is empty. No length check, no dash check, no two-sentence check, no "reads as"
check. A message that violates every hard rule in v1.2 passes.

**2. No code path could reach the fallback even if a validator existed.**
`grep -rn "commenterMessages"` across the repo returns exactly two lines, both inside
`strings.ts` itself: the header comment and the export. Nothing imports it. The object is
defined and unused.

**3. The header's claim describes a mechanism that would need both of the above to exist.**
Line 8 says the six messages are "the fallback when the classifier's own message fails
validation." A fallback needs a validator to trigger it and a call site to invoke it. Neither
exists.

## Implies

- **This is not a documentation nit, it is the gap [[2026-dialecta-platform-voices]] and the
  open exchange record `2026-09-19-003` already named, now confirmed at the two exact lines
  that would have to change.** `requireString` would need a voice-rule check added, and some
  caller would need to import `strings.commenterMessages` and use it on failure. Today, a
  `commenter_message` value that is a non-empty string of any content ships unchanged to the
  contributor.
- **`strings.ts` `commenterMessages` is not dead weight, it is unfinished wiring.** The six
  messages are correct, verbatim v1.2 text (confirmed against the doc's reference table). They
  are the right fallback content; they are not connected to anything yet.
- Sharpens the question already open in `exchange/open/2026-09-19-003`: addendum appended there
  today with this finding.

## Leads this raised

- Whether backlog A-2's classification job is the right place to add the validator and the
  fallback call, or whether it belongs in `parseClassification` itself so every caller gets it
  for free. Worth raising with builder when A-2 is scoped.
