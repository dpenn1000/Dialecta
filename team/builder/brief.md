# builder: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/builder.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/builder.md` |
| Memory | `team/builder/practices.md` |
| Knowledge | `team/builder/knowledge/` |
| Leads | `team/builder/knowledge/reading-list.md` |
| Skills it owns | `/dialecta-brief` briefs it; it owns no skill of its own |

## Where it is now

Sprint run 2026-09-20, second training sprint. All six `todo` reading-list leads worked, none
dead, all filed, plus two tool searches run past the reading list. Fifteen notes now live in
`knowledge/`. Corrections this time ran the other way from last time: three leads (Stage 2.5,
Next.js 16 caching, the `setAll` signature) resolved into confirmed gaps or confirmed-from-source
facts rather than open questions, and the other three (`getClaims`, `useActionState`, TUS uploads)
held roughly as expected with concrete numbers attached where the lead only had a shape.

The Stage 2.5 lead is now a confirmed dead end as written: `docs/Dialecta_Discourse_Layer_UX.md`
has no Stage 2.5 under any name, the symmetry claim is one-directional (asserted only in
`Dialecta_Article_Editorial_Template.md`), and A-3's citation names a section that is not in the
document it cites. Posted as `exchange/open/2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md`
to `spec-reader`, open.

The tool search turned up something bigger than a tool. `exchange/open/2026-09-19-002-handoff-pr-3-review.md`,
addressed to this agent, already carries blocker B1: `article.body_html` renders via
`dangerouslySetInnerHTML` today, on `main`, with no sanitizer anywhere in the repo, and `reviewer`
had already filed the fix (DOMPurify, write and read time, jsdom-pinned) before this sprint's own
search ran. This sprint's search reached the same answer independently, by a different route, the
recovered production predecessor (`_recovered/api/article/submit.js`, `comment.js`) shipped the
identical hole live with zero sanitization anywhere in 163 files, and a GitHub ecosystem search
confirms DOMPurify over the field (the leading Node-native alternative, `sanitize-html`, is
archived). Filed as `knowledge/2026-html-sanitizer-body-html.md`, which also closes the one gap
`reviewer`'s own note left open: whether TipTap's output can be trusted without sanitizing it
(checked; it cannot, nothing in the ecosystem makes that claim safely, and the RLS hole in
blocker B2 bypasses the editor entirely). Nothing was fixed, this sprint stayed research-only, but
the recommendation is now corroborated three independent ways rather than one.

`practices.md` goes from thirteen rows to twenty-one. Every new row cites a filed note.

Checked `exchange/open/2026-09-19-002-advice-a1-composer-request-path.md` again: still open,
`spec-reader` has not answered. Left as-is, per this file's own prior instruction.

`node_modules` is present in this worktree as of today; last sprint's note that it was absent is
stale. The `@supabase/ssr` `setAll` signature was read directly from the installed 0.12.7 source
rather than from docs: two arguments confirmed, `headers` is a plain `Record<string,string>`.

Two new leads added to the reading list, both closing gaps this sprint's own notes left open:
ProseMirror/TipTap server-side schema validation for a submitted `body_json` (distinct from
sanitizing the rendered HTML), and Next.js Route Handler body-size limits for a route that might
front a Supabase TUS upload.

Still true: this agent has built nothing. A-1 remains blocked behind P0-2 and P0-4, and behind
`2026-09-19-002-advice-a1-composer-request-path` (open, unanswered). A-3 is now confirmed blocked
at the spec level and not only the citation level.

Two tooling gaps carried forward unchanged. The `dialecta-local-research` MCP server did not
connect this session either, checked via `ToolSearch`, it does not appear even as a fuzzy match,
so every source was read through `WebFetch`/`WebSearch` and filed by hand again.
`research_file` still accepts only `treasurer`, `designer` and `philosopher`, so the team half of
`/dialecta-research` still has no tool behind it.

## Next three

1. Read `exchange/open/2026-09-19-002-advice-a1-composer-request-path.md` and
   `exchange/open/2026-09-20-builder-01-blindspot-discourse-stage-2-5-missing.md` for
   `spec-reader`'s answers. Fold whichever has landed into the contested practice row and into
   `knowledge/2026-dialecta-a1-composer-requirements.md` or
   `knowledge/2026-dialecta-discourse-stage-2-5-gap.md` respectively, then close what can be
   closed per `exchange/README.md`.
2. Take the two new reading-list leads: ProseMirror/TipTap server-side schema validation for
   `body_json`, and Next.js Route Handler body-size limits for a TUS-fronting route. Both are
   short and both close gaps this sprint's own notes left open rather than open new ground.
3. Re-run the sanitizer question once `reviewer` or `migrator` picks up
   `2026-09-19-002-handoff-pr-3-review.md`: confirm which `jsdom` version lands pinned alongside
   `isomorphic-dompurify`, the one open item every note on this topic (this agent's and
   `reviewer`'s) agrees is still unchecked.

## What this agent posts to the exchange

A `handoff` to `reviewer` on every finished item, with `## Traps` filled. An `advice`
record to `spec-reader` the moment a brief and a spec disagree, which its mandate already
tells it to stop for and which now has an address.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

Six leads filed or marked dead. Practices carry evidence from `knowledge/`, not from the
mandate. The agent can say what a client island costs and why the composer is one.
