# The classification system prompt exists in three copies

## Citation

`api/classify.js` line 20, `api/comment.js` line 44, and
`packages/core/src/classification.ts` line 170, read 2026-09-19 at commit `060dede`.
Counts from `PYTHONIOENCODING=utf-8 python scripts/voice_check.py` the same day.
Plan of record from `docs/plans/backlog.md` row A-2.

## Summary

The lead named one file. Three exist, and the third already holds the fix.

| Copy | Hard hits | State |
| --- | --- | --- |
| `api/classify.js` line 20 | 16 (14 em, 2 en) | Predates v1.2 |
| `api/comment.js` line 44 | 19 (17 em, 2 en) | Predates v1.2, and this one is the hot path |
| `packages/core/src/classification.ts` line 170 | 0 | Rewritten to v1.2, versioned, tested |

`api/comment.js` is the endpoint the comment flow uses: it classifies, writes the
`comments` and `classifications` rows, and returns `commenter_message` to the client.
`api/classify.js` is a standalone endpoint. **A change to `classify.js` alone would fix the
endpoint the flow does not call and leave the live message generator untouched.**

Line 42 of `comment.js` says "Keep the two prompts in sync." They are already out of sync in
four places: the Correct and Wrong exemplar exists only in `classify.js`, its tone paragraph
carries two clauses the other drops, and three JSON field descriptions differ.

### What the core copy already does

`packages/core/src/classification.ts` carries `CLASSIFIER_PROMPT_VERSION = '2026-09-19.1'`, a
`buildSystemPrompt()` export, a `parseClassification()` validator, and a test at
`packages/core/test/classification.test.ts` line 81 asserting the prompt contains no U+2014 and
no U+2013. Its header states it descends from the live one and lists the differences. Its
COMMENTER MESSAGE TONE section states the two-sentence rule, the "reads as" construction, the
open door for every tier except breach, and a ban on dashes and exclamation points inside the
message.

Backlog A-2 says the replacement classification job calls `buildSystemPrompt()`. Root
`CLAUDE.md` lists `api/` as "legacy Vercel functions, frozen until apps/web replaces them."
**The fix is written and scheduled; the question is only whether the frozen copies get it too.**

### The v1.2 failures that are not dashes

- **"1-2 sentences maximum"** (both `api/` copies) contradicts the two-sentence rule. A
  one-sentence message drops either the observation or the move.
- **Nothing requires the open door.** Root `CLAUDE.md` lists "every message below Breach ends
  with the door open" among the non-negotiables. Neither `api/` prompt mentions it, and the
  `classify.js` exemplar at line 47 ends without one. Live sub-Forum messages are shipping
  without the door.
- **The exemplar teaches the fault.** Line 47 models a commenter message whose label separator
  is an em dash, which is the exact case v1.2 line 112 names. The model is being shown the
  banned pattern as the house style.
- Soft, left in place: the tier definitions carry flourishes ("Potential not yet realized",
  "Passion without a point", "A position planted, not a conversation joined"). They sit in the
  model's input and shape its register. The core copy keeps them too.

### What "live" means here

Root `CLAUDE.md` records that `dialecta.vercel.app` serves a 2026-05-08 build from a different
repo, `dpenn1000/dialecta-api` at commit `53364fa`, verified against the Vercel API on
2026-09-19. Editing `api/classify.js` in this repo therefore changes nothing a contributor sees
until backlog P0-3 repoints the project. The change still needs its own commit and Dan's call,
and the copy in `dialecta-api` needs the same edit or the same retirement.

## Implies

- **Any proposal touching `classify.js` must name `comment.js` in the same breath**, or it fixes
  the quieter of the two.
- **Adopt, do not rewrite.** `buildSystemPrompt()` is the v1.2 text, under test, with a version
  string that `classifications.prompt_version` can record. A fourth hand-written prompt would
  add a fourth thing to keep in sync.
- **`api/` cannot import `@dialecta/core`** without a build step for the Vercel functions, which
  is the real cost of the adopt option and belongs in the proposal.
- **No gate protects any of the three.** See [[2026-dialecta-voice-check-gate]].
- Proposal filed at `team/voice-editor/proposals/2026-09-19-classify-prompt-v1.2.md`.

## Leads this raised

- `docs/Dialecta_Editorial_Voice.md` line 364 says the prompt "should defer to this document
  rather than restate it." All three copies restate it. Whether a runtime read is wanted, or the
  restatement is accepted as the practical form, is a decision nobody has recorded.
- The copy in `dpenn1000/dialecta-api` at `53364fa` is the one serving contributors and
  has never been read in this repo.
