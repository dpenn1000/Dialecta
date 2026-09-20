# TipTap: a real, current XSS advisory in the exact function generateHTML depends on

**Source:** GitHub Security Advisory GHSA-cp6q-959q-f8rh, published 2026-08-26, read directly at github.com/advisories 2026-09-20, cross-checked against `apps/web/package.json` and `package-lock.json`. Builds on `team/builder/knowledge/2026-tiptap-html-utility.md`, which read the packaging half of this question and left the security half open.

## Summary

**Verify the citation first, because the lead came from a content-aggregator site of uncertain quality.** A search result attributed this advisory to "DailyCVE," a site with no track record checked here. Fetched the advisory directly from GitHub's own registry rather than trust the summary. It is real: package `@tiptap/core`, affected `>= 2.0.0-alpha.0, < 3.30.4`, patched at `3.30.4`, title "mergeAttributes() turns an own `__proto__` key into inherited executable DOM attributes," severity Moderate (CVSS 6.4), status active, not withdrawn or disputed.

The mechanism answers this reading-list item directly. `mergeAttributes()` is the ProseMirror-side helper TipTap uses internally to build an element's HTML attributes during serialization, the same serialization path `generateHTML` runs on the server. The advisory's own scoping is precise: it requires "an untrusted object boundary into `mergeAttributes()`", meaning a caller that reaches this function with attacker-shaped JSON. A `body_json` column a contributor can write directly, the exact situation blocker B2 already demonstrates for `comments` and `articles`, is exactly that boundary. The bug is a prototype pollution: an attributes object carrying its own `__proto__` key gets merged in a way that produces attributes the DOM will execute, which is a second, code-path-distinct route to the same outcome as blocker B1, and one the ProseMirror document schema does not stop, because the schema constrains node and mark shape, not the internals of an attribute-merging utility.

**Checked whether this repo is exposed: it is not, today.** `apps/web/package.json` pins `@tiptap/react` and `@tiptap/starter-kit` at `^3.31.3`. `package-lock.json` resolves `@tiptap/core` to exactly `3.31.3` throughout (verified by grep, every one of roughly twenty entries agrees), which is above the `3.30.4` patch line. This dependency was added to the manifest as part of PR 3 on 2026-09-19, three weeks after the fix shipped, so the safety here is a side effect of when the dependency arrived, not of anything in this repo that checks for advisories. Nothing here re-verifies that on a schedule; see the GitHub tool findings below.

## Implies for Dialecta

- Directly answers the original lead. `generateHTML`'s safety against a crafted `body_json` is not guaranteed by the ProseMirror schema; sanitizing only `body_html` at read time (the existing B1 remedy, `2026-cure53-dompurify.md`) covers the direct-write path but not a future A-11 path where `body_html` is server-derived from `body_json` via `generateHTML`. Whatever `generateHTML` produces needs the same DOMPurify pass at read time that a directly written `body_html` needs. Add to checklist row 14's evidence.
- This specific CVE is not exploitable in this repo today, verified rather than assumed. That is a narrower and more useful claim than "the dependency is current," because current-by-luck is not the same property as current-by-policy. The supply-chain tools found this same sprint (see the GitHub Tools finding in the sprint report) are what would turn this into a monitored property going forward.
- Worth a line in the B1 remedy on `exchange/open/2026-09-19-002-handoff-pr-3-review.md`, since it bears directly on a blocker already open there.

## Cross-checked against security's position, agrees and sharpens one step of it

`council/security/positions/nextjs-rebuild.md` section 5 reaches the same conclusion, `body_html`
must never be directly writable by `anon` or `authenticated`, by a different route: the editor is
a client island writing with the publishable key, so PostgREST is reachable directly and "a
sanitizer in the island is a sanitizer an attacker chooses not to call." That argument is about who
can skip the sanitizer entirely. This finding is about what happens when nobody skips it. The two
do not overlap and both point at the same fix, which is stronger than either alone.

Security's proposed architecture is: the editor keeps `body_json`, a Server Action derives
`body_html` server side and sanitizes it there, `body_html` sits in the never-grant column,
`body_json` stays in the user-writes-their-own-content column next to `comments.body`. That
design is exactly the scenario this advisory describes: `body_json` remains the "untrusted object
boundary" reaching `mergeAttributes()`, because it is still user-submitted, whether through the
real editor or through a crafted PostgREST call to the same column. So security's layer 1,
"sanitize at write, in that Server Action," cannot mean trust `generateHTML`'s output because it
came from the server's own call to TipTap's own serializer. It has to mean run that output through
DOMPurify before the write, the same as a directly submitted `body_html` would need. Worth naming
explicitly in the handoff to `builder`, since "the Server Action sanitizes" reads as already
specific enough to implement and, without this, would ship a Server Action that calls
`generateHTML` and trusts it.

No disagreement found. Security's section 5 does not name `generateHTML`, `mergeAttributes`, or
this advisory anywhere, so this is new material to that position rather than a restatement of it.

*Filed 2026-09-20, addendum same day after a cross-check requested against
`council/security/positions/nextjs-rebuild.md`.*
