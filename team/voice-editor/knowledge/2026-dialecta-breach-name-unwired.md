# No code anywhere substitutes into the Breach [name] placeholder

## Citation

Repo-wide grep for `\[name\]` across `.ts`, `.tsx`, `.js`, and `.md`; `api/comment.js` lines
22, 54, 83, 86, 183, 198; `docs/plans/backlog.md` row A-3. Read 2026-09-20 at commit `c4ca6406`.

## Summary

The placeholder appears in exactly five places in the whole repository, and all five are the
same literal text, not a template:

- `docs/Dialecta_Editorial_Voice.md` line 188, the reference table
- `.claude/skills/dialecta-voice/SKILL.md` line 30, the working card copying the table
- `apps/web/src/strings.ts` line 28, the `breach` reference message
- `team/voice-editor/knowledge/2026-dialecta-platform-voices.md` and `reading-list.md`, this
  agent's own prior notes

`api/comment.js`, the hot path that returns a `commenter_message` to a contributor,
passes the model's output straight through at lines 183 and 198:

```
commenter_message: classification.commenter_message,
```

No `.replace(`, no template interpolation, no lookup of who is named. If the model's own Breach
message happens to contain literal `[name]` text (its exemplar never shows one, and the prompt
does not instruct it to emit the token), it would reach the contributor unsubstituted.

Backlog A-3 (classification card island) is still `Todo` and is the first place a rendered
Breach message would need a real name, since it is the surface where `self_declared_tier` and
the suppressed-variant display live.

## Implies

- **The reading list's own framing was right and is now confirmed rather than assumed**: no
  substitution code exists anywhere, and A-3 is where it would first be needed.
- **This is not urgent today.** Nothing currently renders a Breach message to a contributor
  outside the model's free-form `commenter_message` string, which is not instructed to produce
  the token at all. It becomes urgent the moment A-3 or any other surface starts rendering
  `strings.commenterMessages.breach` verbatim, since that string is the one place `[name]`
  reliably appears.
- **Practice for this seat:** when A-3 is scoped, flag that `[name]` needs a real substitution
  step (whose name, sourced from where, escaped how) before that string ships to a browser.

## Leads this raised

- Whether the model should be asked to name what it means (a quoted excerpt naming a person,
  which the classifier already extracts nowhere in its current JSON contract) or whether the
  UI should splice in the reported person's handle at render time. Worth a question to
  spec-reader when A-3 is scoped; `Dialecta_Classification_Engine_Specification.md` may already
  answer it and is one of the 26 canonical docs this agent cannot open by itself
  (`guard-docs.mjs`).
