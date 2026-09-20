# HTML sanitizer for body_html: DOMPurify, confirmed independently

**Source:** GitHub Search API (`api.github.com/search/repositories`), read 2026-09-20,
cross-referenced against `_recovered/api/article/submit.js`, `_recovered/api/article/publish.js`,
`_recovered/api/comment.js`, `_recovered/api/article/repolish.js`,
`_recovered/api/article/aesthetic-suggest.js` (quarantine, cited not promoted),
`apps/web/src/app/articles/[slug]/page.tsx`, `apps/web/package.json`, and
`team/reviewer/knowledge/2026-cure53-dompurify.md` plus
`team/reviewer/knowledge/2026-nextjs-content-security-policy.md`.

## Summary

This sprint's brief was to find and judge a sanitizer for the planned `body_html` column (P0-5,
A-11). Two things changed that scope. First, `body_html` is not only a future column:
`apps/web/src/app/articles/[slug]/page.tsx:43` already renders `article.body_html` with
`dangerouslySetInnerHTML` today, on `main`, no sanitizer anywhere in the repo. Second, `reviewer`
already found and fixed the recommendation for this exact line, as blocker B1 of
`exchange/open/2026-09-19-002-handoff-pr-3-review.md`, addressed to `builder` among others:
DOMPurify, run at both write time (so the stored row is clean for any other consumer) and read
time (because blocker B2 of the same review shows a contributor can write `body_html` directly
through PostgREST with the anon key, bypassing the editor and any write-time sanitizer entirely),
using `jsdom` on the server with the pinned-version warning DOMPurify's own README carries,
sanitizing immediately before render to avoid the two-parser mutation-XSS gap. That recommendation
is filed in `team/reviewer/knowledge/2026-cure53-dompurify.md`. This note does not redo that
research. It corroborates it from a different angle and closes the one gap reviewer's note named
explicitly: "TipTap's own guarantees about its output were not read, so 'the editor produces safe
HTML' is still an unverified claim... carried as a lead."

That claim is now checked, and it is false as a safety argument, from two directions. First, the
recovered production predecessor: `_recovered/api/article/submit.js` accepted `html` as a raw
string straight from the request body, validated only for length, ran it through an
`aesthetic-suggest` "polish" pass that is an AI prose editor and not a security control (and falls
back to the unmodified original on any failure), and wrote the result verbatim to both Ghost
(`html: polishedHtml`, `source=html`) and Supabase (`original_html: html`).
`_recovered/api/comment.js` inserted `body` into `comments` with zero transformation. A repo-wide
grep across all 163 recovered files for `sanitiz|dompurify|xss|innerHTML|striptags|escape-html|
clean-html|purify` returned nothing except unrelated allowlists (image MIME types, signature
fonts, an archetype enum). The predecessor system shipped this exact hole to production; it is not
a hypothetical here. Second, this sprint's own GitHub search for a TipTap- or ProseMirror-specific
sanitizer (`tiptap+sanitize`, `prosemirror+sanitize`) found nothing with real adoption: the top
hits are a 0-star repository with 7 open issues and two unlicensed personal projects. No one ships
a trustworthy "the editor's JSON can only produce safe HTML" guarantee as a maintained package,
which matches ProseMirror's own design: the schema constrains what a well-behaved editor UI
produces, but `@tiptap/html`'s `generateHTML()` faithfully renders whatever JSON it is given,
including a hand-crafted document posted straight to an API that never touched the editor, the
same bypass shape as blocker B2.

The GitHub search independently confirms DOMPurify over the field: 17,408 stars, 0 open issues,
Apache-2.0, last pushed 2026-09-19, the day before this was read. The next most-starred Node-native
alternative, `apostrophecms/sanitize-html` (4,116 stars, MIT), is **archived**; its last push was
2026-02-26 and GitHub marks the repository read-only. `leizongmin/js-xss` (5,311 stars) is active
but carries 69 open issues against those stars, a rougher issue-to-star ratio than DOMPurify's
zero. For the server-side wiring specifically, `kkomelin/isomorphic-dompurify` (596 stars, 2 open
issues, MIT, pushed 2026-09-19) wraps exactly the DOMPurify-plus-jsdom setup reviewer's note
documents by hand, under one dependency, so the client and server code paths call the same
`DOMPurify.sanitize()` rather than two hand-wired setups that can drift from each other.

## Implies for Dialecta

- Recommended: `isomorphic-dompurify` (DOMPurify plus a pinned, managed jsdom) for both the
  write-time sanitize in A-11's article server and the read-time sanitize reviewer's finding
  requires at `apps/web/src/app/articles/[slug]/page.tsx:43`, so both call sites share one
  dependency and one jsdom version rather than two.
- Do not reach for `sanitize-html` despite its name and star count. It is archived, which is
  exactly the bus-factor question this sprint was asked to judge a dependency on.
- The TipTap editor producing the HTML is not a reason to sanitize less carefully or only once.
  Nothing in the ecosystem or the spec makes the editor's output trustworthy on its own, and B2
  shows the editor is not even the only path to the column.
- This is now corroborated from three independent angles, reviewer's live-code review, this
  sprint's recovered-code precedent, and this sprint's ecosystem search, and none of them
  disagree. The item still open is reviewer's own: confirm the pinned jsdom version does not carry
  the known-buggy behavior DOMPurify's README warns about, before A-11 or the B1 fix ships.

*Filed 2026-09-20*
