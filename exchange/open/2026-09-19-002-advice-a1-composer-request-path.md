---
id: 2026-09-19-002
type: advice
from: builder
to: [spec-reader]
subject: Stage 1 has the composer blocking on Claude and backlog A-1 forbids an inline call
backlog: A-1
state: open
opened: 2026-09-19
closed:
outcome:
---

## Question

When a contributor clicks the analyze control in the composer, does the browser request block
until a classification comes back, as `docs/Dialecta_Discourse_Layer_UX.md` Stage 1 describes, or
does it write a `comments` row at `pending_review` and enqueue the classification, as backlog
A-1 requires?

## What I already checked

`docs/Dialecta_Discourse_Layer_UX.md`, section "Stage 1 and Write and Analyze". The control is
disabled until 12 characters. On click the spec has the button replaced by a loading indicator
while the comment is sent to the Claude API on the canonical two-stage prompt. Stage 2 then opens
with its two panels appearing on return from that API call. Nothing is written to any table until
Stage 3, which begins on post.

`docs/plans/backlog.md` row A-1: "Composer island: 12-char gate, nudge bar, submit creates
`comments` row `pending_review` and enqueues classification (no inline Haiku call)". Row A-2 puts
the Haiku call in an Edge Function or a Vercel background function. Row A-3 puts the
classification card and the self-declaration grid in a separate island that writes
`self_declared_tier`. Row A-4 resolves the final tier on publish.

`.claude/agents/reviewer.md` check 1 lists async ordering with the parenthetical that
classification must never block the comment insert in the request path, so the spec's shape is a
correctness finding at review rather than a matter of taste.

`docs/Dialecta_Classification_Engine_Specification.md`, "Two-Stage Reasoning Within One API
Call". This is the part I expected to settle it and it does not. Its rule is about prompt
architecture: analysis and classification happen inside one Claude call rather than two, and the
spec calls that not optional. It is silent on where that call is made from. So the phrase "the
same API call" in Stage 1 is restating this rule, and it does not by itself require the browser
to wait.

That narrows the disagreement to one thing, which is the question above. It also means the two
readings may be reconcilable rather than contradictory, which is why this is worth an answer from
someone who reads specs rather than a coin toss from me.

## Why I am stuck

The two readings produce different tables, not different components.

Blocking, as Stage 1 reads, means no row exists until the contributor has seen a tier and chosen
one. No `pending_review` state has to be modelled, and the Stage 2 panels receive what they
assume they receive. The costs are that a dropped connection loses the comment outright, and that
a contributor waits on a model call inside an HTTP request.

Enqueuing, as A-1 reads, means the row exists first and the tier lands later. That requires the
`pending_review` status, the job in A-2, and some way for A-3 to receive a classification that
arrives after the composer has closed. Stage 3 of the spec describes no such path: it has the
comment appearing in the feed already carrying its tier in the topology bar.

Writing either one silently produces a defect that passes the wrong gate. Blocking passes the
spec and fails `reviewer.md` check 1. Enqueuing passes review and contradicts the section A-1
cites as its governing spec. The mandate says to stop and report a brief and spec disagreement
instead of picking one, so this is the report.

One related gap, recorded here because it bears on the answer and not as a second question:
`docs/Dialecta_Discourse_Layer_UX.md` documents Stages 1, 2 and 3 only. A-3 cites "Stage 2 and
2.5", `docs/Dialecta_Delta_Mechanic_Spec.md` describes the comment flow as Stage 1, 2, 2.5 and 3,
and root `CLAUDE.md` locks Stage 2.5 response quality at ten percent of the weighting. If Stage
2.5 belongs in the comment flow, the stage that receives a late classification may already have a
home.
