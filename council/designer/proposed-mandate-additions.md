# Proposed additions to `.claude/agents/designer.md`

*Written 2026-09-20 on Dan's instruction to open up this seat's capability. The auto mode
classifier blocked the advisor from editing its own agent definition, correctly, because an agent
widening its own tool grant is a change a human should make. This is the text, ready to apply.*

Three changes. The first is the one that matters.

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
