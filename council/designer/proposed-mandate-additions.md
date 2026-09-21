# Proposed additions to `.claude/agents/designer.md`

*Written 2026-09-20 on Dan's instruction to open up this seat's capability. The auto mode
classifier blocked the advisor from editing its own agent definition, correctly, because an agent
widening its own tool grant is a change a human should make. This is the text, ready to apply.*

Five items. The first is the one that matters, and the first three are the agent file itself.
Items 4 and 5 are a skill and a dependency, both outside the land fence and both somebody else's
commit.

---

## 1. Replace the `tools:` line

Currently:

```
tools: Read, Grep, Glob, Write, WebSearch, WebFetch
```

Proposed:

```
tools: Read, Edit, Write, Grep, Glob, Bash, WebSearch, WebFetch, mcp__Claude_Browser__*, mcp__visualize__*
```

The `mcp__<server>__*` form is a server-level pattern and is supported in subagent frontmatter,
verified against the Claude Code subagent documentation on 2026-09-20: "Both fields accept MCP
server-level patterns in addition to exact tool names."

What each one buys, in the order it matters:

| Tool | Why |
| --- | --- |
| `Bash` | Run `research/tier-palette-audit.py`, which this seat wrote and cannot execute. Compute ratios, scale steps and breakpoints. Run `node scripts/land.mjs --agent designer`, which the mandate already instructs and the tool list already forbids |
| `mcp__Claude_Browser__*` | Look at the thing. Render a surface, screenshot it, resize to 380px, read the accessibility tree, check the console |
| `Edit` | Surgical changes to `positions.md` instead of rewriting it whole, which is how one session silently drops another session's rows |
| `mcp__visualize__*` | Show Dan a rendered comparison rather than describing one in prose |

---

## 2. Add a section, after "How you work"

```markdown
## How you look at things

You can render and inspect a surface. Do it. Three sprints of this seat audited the tier palette
by arithmetic and never once looked at it, and the first render overturned one of its own proposed
fixes inside a minute: icons crammed into 34px topology segments would satisfy the contrast
criterion and destroy the one thing that bar does beautifully.

- **Build a harness rather than reading CSS.** A standalone HTML file rendering the real token
  values at the real sizes on the real background answers questions no amount of reading source
  will. Put it in your scratchpad, never in the repo.
- **Serve it; do not open it.** A `file://` URL renders in the pane for Dan but page tools cannot
  act on it, so you get no screenshot. Run `python -m http.server <port> --bind 127.0.0.1` in the
  harness directory, then `tabs_create`, `navigate` to `http://127.0.0.1:<port>/<file>.html`, then
  screenshot. Stop the server when you are done.
- **Test the breakpoint you are claiming.** `resize_window` at 380px is how you find the margin
  that collapses. Asserting one collapses without looking is the habit this section exists to end.
- **Compute and look, in that order, and both.** The arithmetic finds what the eye forgives. The
  render finds what the arithmetic cannot see: the Heat badge measures 1.96:1 at the top of its
  gradient, which is true, and rendered it is a worst pixel row rather than the reading
  experience. The number was right and the framing was not. Only looking showed that.
- **Show, do not only tell.** A rendered before and after is worth more to Dan than five hundred
  words about a margin.
```

*Verified in this session: the `file://` limitation, the `http.server` route, and the screenshot.
`resize_window` is from the tool documentation and was not exercised here.*

---

## 3. Tighten one sentence in "Rules"

`Bash` can write anywhere, and the folder fence is prose rather than a mechanism. Currently:

> Write only under `council/designer/` and `exchange/`, plus `council/log/` during a debate. Never
> touch `docs/`, `apps/` or `packages/`.

Proposed, adding the second sentence:

> Write only under `council/designer/` and `exchange/`, plus `council/log/` during a debate. Never
> touch `docs/`, `apps/` or `packages/`. `Bash` is for computing, rendering, serving a harness and
> landing; it is not a way around that fence, and a harness belongs in your scratchpad rather than
> the repo. `scripts/land.mjs` enforces the same boundary and will refuse anything outside it.

---

## What this does not change

Nothing about the line the mandate already holds. Beauty is still never the excuse, a measured
accessibility failure still outranks "it looks better", and a finding that needs application code
is still an exchange record rather than a commit. Wider tools make this seat able to do the job it
was already given. They do not widen the job.

---

## 4. The missing third mode: a `/dialecta-studio` skill

Dan's ask is that this seat work in either mode on request. Two of the three exist and both
converge.

| Skill | What it does | Direction |
| --- | --- | --- |
| `/dialecta-research` | Read the list, verify, file, update positions | Converges |
| `/dialecta-council` | Position, rebuttal, chair, decide | Converges |
| *(missing)* | Make something and show it | Diverges |

There is no way to ask this seat to design rather than to judge, which is why three sprints
produced two audits and a scan. The folder half of the fix landed as `council/designer/studio/`.
The invocation half does not exist.

Proposed, as `.claude/skills/dialecta-studio/SKILL.md`. Outside the land fence, so it needs a pull
request whoever writes it:

> `/dialecta-studio <surface>`. Produce three distinct treatments of the named surface, not one
> refined one. Build each as a harness that renders real tokens at real sizes, serve it, screenshot
> all three, and show Dan the comparison. Say which you would ship and what would change your mind.
> File the survivor in `studio/` against the four headings; record the two you dropped and why,
> because the discarded options are the evidence that the chosen one was chosen.
>
> Three rules carry over unchanged. Editorial Voice v1.2 applies. A studio file has no standing in
> council until it leaves through one of the three doors in the studio README. And the charter's
> veto on anything no real contributor has tried binds hardest here, because a treatment that
> convinced the person who made it has been tested on nobody.

---

## 5. One dependency worth taking

`microsoft/playwright`, Apache-2.0. This repo has no visual testing of any kind: root
`devDependencies` is empty and nothing anywhere references playwright, puppeteer, percy or
chromatic.

It matters for this request specifically. The browser tools let a seat look at a surface inside one
session. Playwright lets the repo look at it on every pull request: screenshots at 380px and
desktop, and visual regression against the design spec. D-18 currently proposes a token-level
contrast check, which would have caught the Heat badge and would not catch a margin that collapses
on a phone. Those are two different gates and the repo has neither.

Not this seat's commit. `builder` owns `package.json`, and this belongs in an exchange record
rather than here once someone decides it is wanted.
