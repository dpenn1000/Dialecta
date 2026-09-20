# The hook's ignore-marker claim is false, and the fix is a five-line port

## Citation

`.claude/hooks/voice-check.mjs` lines 14-15, `scripts/voice_check.py` (this repo, no `_OPT_OUT`
anywhere), and the upstream `scripts/voice_check.py` lines 97-113 in the Trinity Platform repo
(`C:\Users\dan\OneDrive - Trinity Solar\Apps`), all read 2026-09-20 at commit `c4ca6406`.

## Summary

The claim is false and the fix already exists, written, in a sibling repo.

`voice-check.mjs` line 14 reads: `// The voice doc prints the patterns it bans; the checker
honors its ignore marker.` Line 15 then skips `Dialecta_Editorial_Voice.md` by filename, not by
reading any marker. This repo's `scripts/voice_check.py` has no `_OPT_OUT` pattern, no
`voice-check:` string, and nothing that inspects the file it is given beyond front matter
stripping. The marker at line 2 of the voice doc is decoration.

The upstream script's version, read directly:

```
#: A document that teaches the rules has to print the patterns it bans. The guide, its
#: archive, and any doc that quotes a killer by name opt out with this marker rather
#: than the checker guessing which quotes are specimens.
_OPT_OUT = re.compile(r"voice-check:\s*ignore-file")
...
if _OPT_OUT.search(text):
    return []
```

Five lines: the pattern, the comment, and the early return inside `check()`. Nothing about it
is Trinity-specific.

### Port into the script, not just the hook

CI never runs the hook. CI calls `scripts/voice_check.py --strict $files` directly (verified
today against `.github/workflows/ci.yml`), so a marker implemented only in `voice-check.mjs`
would still leave CI blind to any future file that wants to quote a specimen the way the voice
doc does. Porting `_OPT_OUT` into `check()` itself fixes both callers at once, and lets
`voice-check.mjs` line 15's hardcoded filename skip be deleted rather than kept as a second,
narrower mechanism doing the same job.

## Implies

- **The fix is not a design decision, it is five lines already proven correct upstream.** Any
  agent with write access to `scripts/voice_check.py` (out of this agent's fence, since it sits
  outside `team/voice-editor/`) should port `_OPT_OUT` verbatim, then delete
  `voice-check.mjs` line 15's filename check and correct line 14 to describe what actually
  happens.
- **Until then, line 14 is a claim this agent should not repeat.** Any note or proposal citing
  "the checker honors its ignore marker" is citing a comment, not a behavior.
- Confirms and closes the lead from [[2026-dialecta-voice-check-gate]]: port, do not drop the
  claim, because the marker has a real use (the voice doc's own specimens) that `.voiceignore`
  does not cover for anything written after today.

## Leads this raised

- None new. This closes the lead it was opened to check.
