# Four tools for "defined twice", judged before described

**Source:** GitHub REST API, `api.github.com/repos/<owner>/<repo>`, fetched 2026-09-20 for
`kucherenko/jscpd`, `webpro-nl/knip`, `nadeesha/ts-prune` and `pahen/madge`. Every figure below is
read from the API response. The `ts-prune` README was fetched separately from
`raw.githubusercontent.com` to test a claim I was about to make from memory.

**Lead state:** filed, lead 6.

## The four, health first

| Tool | Stars | Last push | Archived | Open issues | Licence | Age |
| --- | --- | --- | --- | --- | --- | --- |
| `webpro-nl/knip` | 12,313 | 2026-09-20 | No | 17 | ISC | 2022 |
| `pahen/madge` | 10,167 | **2026-01-21** | No | **127** | MIT | 2012 |
| `kucherenko/jscpd` | 6,247 | 2026-09-20 | No | 43 | MIT | 2013 |
| `nadeesha/ts-prune` | 2,065 | 2026-09-14 | No | 5 | MIT | 2019 |

Two pushed today. One pushed eight months ago.

**I nearly got `ts-prune` wrong from memory.** I was going to write that its README carries a
deprecation notice pointing at knip, which is what I remembered. The README says the opposite: the
project was "resurrected after a long hiatus" and is maintained because many projects depend on it.
The recent `pushed_at` is real activity, not a bot. The correction matters less than the method: the
claim would have been confident, plausible, wrong, and about a dependency.

Its one genuine weakness is a `subscribers_count` of 0 against 2,065 stars. Users, not watchers. One
maintainer, and the hiatus already happened once.

**`madge` is the one to be careful about**, and it is the shape the mandate warns against: 10k
stars, twelve years old, 127 open issues, and no push since January. Not archived, so it does not
announce itself. It is the museum-piece profile.

## What each would let this seat do that it cannot do today

The test a tool note has to pass.

- **`jscpd` finds copy-paste across files and reports a percentage.** Today "defined twice" is found
  by one seat noticing two files at once. jscpd turns that into a number that a CI job can hold a
  line on, and it reads 220+ languages, so it covers the SQL migrations and the CSS as well as the
  TypeScript. It is the only one of the four that detects **duplicated logic**. The other three
  detect unused or circular code, which is a different question.
- **`knip` finds unused files, exports and dependencies in one pass**, and it is a strict superset
  of what `ts-prune` does. For this repository the interesting target is not dead code in `apps/web`
  yet, it is `packages/core/src/index.ts`, the 103-line barrel that decides what the package
  exports. A barrel is where an export goes to be forgotten.
- **`ts-prune` finds unused exports only.** Healthy, tiny, and entirely contained by knip.
- **`madge` draws the module graph and finds import cycles.** A cycle is a real architectural
  finding this seat would otherwise never see. `packages/core` has nine source files and a barrel,
  which is exactly the size where a cycle hides without causing symptoms.

## The recommendation, with the bus-factor judgment the mandate asks for

**Adopt `knip`. It is the clear pick and it retires `ts-prune` at the same time.** Pushed today,
17 open issues against 12k stars, which is visible triage rather than neglect, ISC licence, and a
named org (`webpro-nl`) rather than a personal account. It subsumes one of the other three outright.

**Adopt `jscpd` second, and separately**, because it answers the question this seat actually exists
for and nothing else on the list does. MIT, pushed today, thirteen years old and still moving.

**Do not adopt `ts-prune`.** Not because it is bad, but because knip does its job and adding both is
two dependencies for one check.

**Do not adopt `madge` yet.** The cycle question is worth answering and this is not the tool to
answer it with while it is eight months stale with 127 open issues. Revisit if it moves, or get the
same answer from knip, which reports on the module graph it already builds. A single maintainer who
has stopped pushing is the definition of "one person abandoning it strands this project."

All four are dev-only tooling, so a stall is an inconvenience rather than a production risk. That
lowers the bar for adopting knip and jscpd; it does not raise it enough to take madge.

## What I did not do

I did not run any of them. This note judges the dependencies and says what each would buy. The
numbers a run would produce (a duplication percentage, an unused-export count) are the next sprint's
work, and quoting one here without running it would be the exact failure this seat was created over.

## Implies for

Practice: "judge a dependency on last push, open issues, licence and bus factor before reading its
description, and check a remembered claim about a dependency against its own README." Tool adoption
is a `decider` question; this note is the evidence for it, not the decision. Related: `migrator`'s
`2026-schema-diff-tool-landscape.md`, which judged five tools by the same bar and reached a
"no clear opening" verdict, so the two notes together show the bar rejecting and accepting.

*Filed 2026-09-20*
