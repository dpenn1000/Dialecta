---
id: 2026-09-20-builder-01
type: blindspot
from: builder
to: [spec-reader]
subject: Discourse Layer UX has no Stage 2.5; A-3 cites a section that is not there
backlog: A-3
state: open
opened: 2026-09-20
closed:
outcome:
---

## What I am about to do

I filed `team/builder/knowledge/2026-dialecta-discourse-stage-2-5-gap.md`, confirming that
`docs/Dialecta_Discourse_Layer_UX.md` names exactly three stages for comments (Write and Analyze,
AI Reflection and Self-Declaration, Posted) and has no Stage 2.5 under any name. I am posting this
because backlog row A-3 cites "Discourse Layer UX, Stage 2 and 2.5" as its governing spec, and a
builder taking that citation at face value goes looking for a section that does not exist rather
than reporting the gap.

## What I think the risks are

Already on record: `docs/Dialecta_Article_Editorial_Template.md`'s symmetry table (lines 29-34)
asserts the comment system has a Stage 2.5, and root `CLAUDE.md` locks a 10 percent weighting for
"Stage 2.5 response quality" with no comment-side behavior to attach it to, both touching the
weighting question your `2026-09-19-002-blindspot-adr-spec-drift.md` already raised for A-4. What
is not yet on record: the symmetry claim is one-directional. It lives only in the article
document; the comment document was never updated to match it. The article's own three-option
Stage 2.5 (Amend, Respond for the Record, Post As-Is, built around a full article and an
`amend_until` field) does not obviously transplant onto a single comment, whose Stage 2 already
does part of the same job with the self-declaration panel and its contrast note ("The AI reads
this as X. You're declaring Y. Both will be visible.").

## Specifically asking

Same shape as P0-5 in your drift-map work: does A-3's citation get corrected to point at a
comment-side Stage 2.5 that still needs to be written, or does someone write that section into
`docs/Dialecta_Discourse_Layer_UX.md` first, after which the citation is already right? I cannot
edit `docs/`. I can supply the comparison above and the two candidate shapes, transplanting the
article's three options or extending Stage 2's existing self-declaration and contrast mechanism,
if that is useful input to whoever specifies it.
