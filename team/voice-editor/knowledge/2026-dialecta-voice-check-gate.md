# What voice_check.py can and cannot decide

## Citation

`scripts/voice_check.py`, read 2026-09-19 at commit `060dede`. Compared against
`docs/Dialecta_Editorial_Voice.md` v1.2, section "Hard rules", and against the upstream
`scripts/voice_check.py` in the Trinity Platform repo
(`C:\Users\dan\OneDrive - Trinity Solar\Apps`), read the same day.

## Summary

The gate decides three of the seven hard rules in v1.2. Everything else in the "Hard rules"
section passes it silently.

| Hard rule (v1.2) | Gate | Note |
| --- | --- | --- |
| No em dashes (U+2014) | decided | regex |
| No `--` pause | decided | one lookahead exempts the npm flag separator |
| No en dashes (U+2013) | decided | regex |
| Name the mechanism | not checked | no pattern exists |
| Headers name the thing, and stop | not checked | no pattern exists |
| Contractions, active voice, varied length, periods over exclamation points | part | only the exclamation point has a pattern |
| "Reads as" is the standard construction | not checked | no pattern exists |

The script's own docstring names the judgement rules it skips (observational versus evaluative,
the meta move, generic-truth over-validation). It does not say that four hard rules go
unchecked, which is the more useful omission to know about.

**Two of the four are regex-decidable and absent.** "Has been classified as" is a literal
string. A header carrying a colon-plus-explainer or a question mark is one pattern. Both could
join the hard set without touching the judgement boundary.

### Measured behaviour

A probe file (14 lines, `team/voice-editor/` scratch, not committed) produced **four hard hits,
all four false positives, and zero true positives**:

- an em dash inside YAML front matter
- an em dash inside a fenced code block, in a code comment, which v1.2 exempts in writing
- an en dash inside the same fence
- `--` inside a markdown link URL

The same probe carried seven real v1.2 violations and the gate reported none of them: a
colon-plus-explainer header in question form, "The system decided your comment was Heat",
"This has been classified as Heat", "Remember that Dialecta is a place for", "you should
reconsider your framing", "Specificity matters", and two suggestions in one message.

### Three defects worth naming

1. **Code fences are not exempt.** v1.2 says code comments are exempt. The script does not
   parse fences, inline code, URLs, or front matter, so it flags all four. The upstream Trinity
   script strips every one of them before matching. The port dropped that.
2. **The personified-artifact pattern misses the past tense.** The alternation is
   `decides?|judges?|wants?|tells?|knows?|thinks?|believes?`, and the trailing `\b` fails against
   "decided", "judged", "wanted". Of four probe lines, it caught the one present-tense line.
3. **The opt-out marker is inert.** `docs/Dialecta_Editorial_Voice.md` line 2 carries
   `voice-check: ignore-file`, copied from the Trinity guide. Trinity's script implements it
   (`_OPT_OUT`, line 105). This repo's port has no handling for the string anywhere, so the
   marker does nothing. `.claude/hooks/voice-check.mjs` papers over the gap with a hardcoded
   filename skip at line 15, and its line 14 comment claims "the checker honors its ignore
   marker", which is false. CI has neither the marker nor the hardcoded skip, and relies on
   `.voiceignore` alone.

### Scope is narrower than the rule

v1.2 line 112 binds the dash rules to "UI strings, engine output, Guidebook prose, the specs,
and the system prompts that instruct the model." Both gates read a much smaller set:

- CI (`.github/workflows/ci.yml`) checks changed `*.md` and `apps/web/src/strings.ts`.
- The hook (`voice-check.mjs` line 12) checks `.md`, `.mdx`, and `strings.ts`.

Neither reads `.js` or `.ts`. The system prompts live in `api/classify.js`, `api/comment.js`,
and `packages/core/src/classification.ts`, so **the highest-stakes engine output on the platform
sits outside both gates**. That is how the `api/` prompts drifted and stayed drifted.

## Implies

- **Any file this agent touches:** a green `--strict` run is a floor. The four unchecked hard
  rules and every killer still need a read. Report the read, not just the exit code.
- **`api/classify.js`, `api/comment.js`, `packages/core/src/classification.ts`:** no gate covers
  them. Voice drift in a system prompt is found by a person or not at all.
- **Windows:** run the script with `PYTHONIOENCODING=utf-8`. Stdout defaults to cp1252 and the
  script aborts mid-run on the first character outside it, which silently truncates a multi-file
  run. Four of 43 files reported before it died on an emoji in the fourth.
- **Writing about the rules in this repo:** a note quoting a dash specimen fails the gate,
  because the opt-out marker does not work. Name the character or cite the line instead.
- **Practice added:** the gate's scope, not just its rule set, decides what it protects. See
  [[2026-dialecta-classify-prompt]].

## Leads this raised

- `.claude/hooks/voice-check.mjs` line 14 states something the code does not do. Worth a
  correction, and worth deciding whether to port `_OPT_OUT` rather than keep the hardcoded skip.
- The Trinity script strips fences, inline code, URLs and front matter. Porting that subset would
  remove the false-positive class without changing any rule. See [[2026-trinity-voice-guide]].
