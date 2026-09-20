# voice-editor: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/voice-editor.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/voice-editor.md` |
| Memory | `team/voice-editor/practices.md` |
| Knowledge | `team/voice-editor/knowledge/` |
| Leads | `team/voice-editor/knowledge/reading-list.md` |
| Proposals | `team/voice-editor/proposals/` |
| Skills it owns | `/dialecta-voice` |

## Where it is now

Sixteen practices, eleven filed notes, three open leads. Two sprints have run. The first
(2026-09-19) cleared all five seeded leads with no citations, because the seat had no WebSearch
or WebFetch yet. The second (2026-09-20) cleared the next six, all with primary-source
citations, since this sprint is the first with both tools live.

What the second sprint established:

- **The hook's ignore-marker claim is false, and the fix is five lines, already written,
  upstream.** `voice-check.mjs` line 14 says the checker honors `voice-check: ignore-file`.
  Nothing in this repo's `scripts/voice_check.py` implements it. Trinity's `_OPT_OUT` (its
  `voice_check.py` line 105) is the exact fix, and it needs to land in the script, not just the
  hook, since CI calls the script directly and never runs the hook.
- **The `strings.ts` fallback cannot fire. It was never wired, not just under-validated.**
  `parseClassification` checks only that `commenter_message` is a non-empty string. Separately,
  and worse, `commenterMessages` is imported nowhere in the repository. There is no validator
  and no call site.
- **The Breach `[name]` placeholder has no substitution code anywhere**, confirmed by a
  repo-wide grep rather than assumed. Not urgent until backlog A-3 renders a Breach message for
  real.
- **"Defer to this document rather than restate it" cannot describe any implementation an LLM
  prompt could have.** A model call sends a string; there is no runtime point where a markdown
  file resolves into the request. Restatement, kept in sync at authoring time and pinned by
  `CLASSIFIER_PROMPT_VERSION`, is the only form this can take. The doc's own wording overclaims.
- **The coherence-audit handoff's 540 hard hits are an afternoon of mechanical find-and-replace,
  not a week.** 471 em dashes and 69 en dashes, both dense but patterned. The 67 soft hits are
  the part that would actually take a week, and the file is still not this agent's to touch.
- **`dpenn1000/dialecta-api` is unreachable from this seat, unauthenticated, and that was the
  smaller problem.** `security`'s same-day finding (`2026-09-20-security-01`) shows the deployed
  artifact at `dialecta.vercel.app` matches no commit in that repo at all. This agent's own
  classify-prompt proposal now needs a caveat: the live prompt may be a third, unread copy.
- **Tool search (new this sprint):** `errata-ai/vale` (6,121 stars, active, MIT) is the credible
  upstream fix for the gate's fence and front-matter stripping gap, but the Trinity port is
  cheaper and already proven. `textlint` is a plausible Node-native alternative given this is
  already a Node/TS monorepo. `write-good` is stale (thirteen months since a push despite 5,089
  stars). The AI-text-detection search turned up mostly humanizers mislabeled as detectors,
  which is the opposite of what a voice gate needs, and nothing credible for readability
  scoring specifically.

Open on the exchange: `2026-09-19-002` (the cleaning target, still open). `2026-09-19-003` (the
gate never reads the prompts) got an addendum today with the `parseClassification` and
`commenterMessages` findings above; still open, still addressed to builder, reviewer and
decider, since the actual call (generate the message or render it from `strings.ts`) is theirs
to make, not this agent's to assume.

Not done: nothing was cleaned this sprint either. `docs/Dialecta_Project_Index.md` is still the
only cleanable exempt file and still needs `SPEC_EDIT=1` or Dan.

## Next three

1. Take the answer on `2026-09-19-003`. Today's addendum sharpens it: the fallback `strings.ts`
   promises does not exist in any form, so the architecture question (generate the message, or
   render the six fixed ones and reserve generation for Forum and above) is no longer
   theoretical. It decides whether this agent can ever gate engine output.
2. Clean `docs/Dialecta_Project_Index.md` (16 hard hits, 7,996 words) and delete its
   `.voiceignore` line. Needs `SPEC_EDIT=1` or Dan, since `guard-docs.mjs` allows the path but
   this agent's write scope does not reach `docs/`.
3. Once `2026-09-19-003` is answered: if messages stay model-generated, add the missing voice
   validator to `parseClassification` and wire `strings.ts` `commenterMessages` as the real
   fallback it currently is not. If messages move to `strings.ts` rendering instead, delete the
   fallback claim from that file's header, since it would no longer be a fallback but the only
   path.

## What this agent posts to the exchange

An `advice` record to `spec-reader` when a string makes a claim the spec does not support.
Its mandate says flag rather than rewrite, and the flag needs somewhere to land. A `blindspot`
when the brief and the evidence disagree, which is what happened to task three in the first
sprint. An addendum to this agent's own open records when a later sprint's primary-source read
sharpens rather than reverses them, as happened to `2026-09-19-003` today.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

The gate's blind spots are written down. A proposal exists for `classify.js` with sample output
before and after. One exempt file is cleaned and its line is gone from `.voiceignore`.

The first two are done. The third needs a write scope this agent does not have.
