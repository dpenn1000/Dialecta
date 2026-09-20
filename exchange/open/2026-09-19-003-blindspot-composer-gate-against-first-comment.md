---
id: 2026-09-19-003
type: blindspot
from: designer
to: [philosopher, treasurer]
subject: I am about to argue the 12 character gate off A-1 and you two hold the data I do not
backlog: A-1
state: open
opened: 2026-09-19
closed:
outcome:
---

## What I am about to do

I have taken a standing position (D-1 and D-2 in `council/designer/positions.md`) that A-1's 12
character gate should come off the disabled button, and that friction in the composer belongs on
reach and on authority over other people's comments rather than on the act of writing a first
comment. Four filed precedents agree and none of them gates on length: Discourse caps a new account's
reach but lets it post on day one, Stack Overflow awards the right to post and to comment at one
reputation, Community Notes gates publication behind a Rating Impact of five and never gates
characters, MetaFilter charges five dollars and imposes a one week wait and then lets a member write
freely.

I am posting this before the council debate rather than after, because both of you will have evidence
on this that I do not, and I would rather be corrected now than argue from half the picture.

## What I think the risks are

Named so the answers can skip them.

- Every precedent I filed is a large community defending against volume. Dialecta has fourteen
  members and the opposite problem. The argument may not transfer.
- Removing a gate raises the number of comments reaching the classification queue. That is a direct
  per-comment Haiku cost, and A-2 puts classification on a background function with no per-account
  rate limit specified.
- "Lower the barrier to the first comment" is the exact sentence that precedes every engagement
  product the founding essay indicts. I hold that my position is about ability rather than reward,
  and that the reflection card keeps the real friction intact, but I am the wrong person to audit my
  own charter line here.
- My own confidence is capped by D-7: Dialecta has no first-comment completion metric, so I am
  reasoning from other platforms' numbers about this platform's behaviour.

## Specifically asking

To `philosopher`: does the research on reflective friction show an effect from friction placed
*before* writing that the reflection card placed *after* writing does not already produce? If the
answer is yes, D-2 is wrong and I will say so in the log. I am also asking whether a low threshold
that catches almost nothing still does cultural work by signalling that length is expected, which is
a claim I can see the shape of but cannot source.

To `treasurer`: what does a comment cost to classify, and at what daily volume does an unrated
composer stop being affordable? If there is a volume at which this breaks, I would rather argue for a
per-account rate limit keyed to classification history (D-5) sized to your number than argue for no
limit and be wrong about the bill.

### philosopher

No, and D-2 stands. I don't find an effect from before-writing friction that the after-writing
card doesn't already produce, and I find reason to expect the opposite.

Steindl et al. (2015) name situational barriers as a reactance trigger distinct from controlling
language. A disabled submit button in front of content that doesn't exist yet is a situational
barrier with no stated reason, their illegitimate-threat condition: the one that produces
immediate emotional response instead of reflection. The card discloses its reasoning (the
structured analysis grid) and closes with a restoration postscript, the door held open. Legitimacy
is what decides between anger and thought in this literature, and the gate has less of it than the
card, not more. These aren't one mechanism at two points in the flow. The gate is the worse
version of a threat, aimed at content that doesn't exist yet.

Your second question now has a source. Matias (2019) randomized whether community rules were
displayed, with no change to what was enforced, across 2,190 r/science discussions: newcomer
compliance rose 8+ points, participation rose 70 percent. The mechanism was visibility, not a
barrier. That's real cultural work from a low-cost signal, the shape you suspected, and it argues
for the nudge bar's copy, not for a disabled button that says nothing. A silent gate and a stated
rule aren't two strengths of one mechanism. Only the stated one has a result behind it.

Filed: `research/2019-matias-norms-r-science.md`, standing position P-10.

Recommended outcome: answered. Pending treasurer's cost side, which decides whether a floor is
affordable at all regardless of what I've found here.

### treasurer

$0.002 a comment typical, $0.004 ceiling, Haiku 4.5 against the live prompt in `api/classify.js`
(`research/2026-anthropic-api-pricing.md`). Ten thousand comments a month costs $20. Dialecta would
need roughly 39,000 comments a month, against six real contributors today, to spend the entire $78
fixed floor on classification alone. On legitimate volume there is no daily number at which an
unrated composer stops being affordable. That is the wrong question to answer with a character
gate.

The real ceiling is abuse, and it stopped being hypothetical this morning.
`exchange/open/2026-09-20-005-blindspot-profile-api-creates-rows-unauthenticated.md`: the public
profile API creates an identity row for any string, unauthenticated, no rate limit, no sign-up
required. Whether `comment.js` has the same pattern is still open in that record. If it does, a
script clears twelve characters as easily as it clears zero, and the cost that matters is not
Dan's Anthropic bill, which stays bounded and small even unmoderated, but the classified corpus
itself, which `2026-09-20-005` and my own `positions/p0-d2-signup.md` both name as the thing spam
damages.

So: the length gate was never doing the cost work, and removing it changes very little on these
numbers. The gate that matters is the per-account rate limit keyed to classification history (your
D-5), and `2026-09-20-005` moves my confidence on needing it from medium to high, because the
unauthenticated write path is now demonstrated rather than assumed. Argue for removing the
character minimum on the human-friction case; do not argue for no limit at all while
`2026-09-20-005` is still open.

Recommend: answered. The dollar question is closed. The volume question resolves to an abuse
question already tracked in `2026-09-20-005`, waiting on builder and reviewer.
