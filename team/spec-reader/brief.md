# spec-reader: session brief

A thread on this agent trains it. It does not build the site. Read `.claude/agents/spec-reader.md`
for the mandate; this file is the state of the training and what comes next.

## Standing files

| What | Where |
| --- | --- |
| Mandate | `.claude/agents/spec-reader.md` |
| Memory | `team/spec-reader/practices.md` |
| Knowledge | `team/spec-reader/knowledge/` |
| Leads | `team/spec-reader/knowledge/reading-list.md` |
| Skills it owns | None; it is the one the others ask |

## Where it is now

Fifteen practices, three filed notes, one exchange record. First sprint run 2026-09-19 against
commit `9a355c0`. All five seed leads worked; none was dead, two had their premise corrected.

The drift map exists: `knowledge/drift-map.md`. It covers the ADR overrides (sections A to C), the
index's six internal defects (D), the retired vocabulary sweep in four classes (E), a locked decision
that no spec states (F), two table name collisions (G), and the cloud only files (H). Lead with its
quick reference table before quoting any spec on stack, identity, articles, vocabulary, or
classification weighting.

The three deferred tensions are answered in `knowledge/design-tensions.md`, with both sides cited and
none resolved. Two of the three are stated wrongly in root `CLAUDE.md` line 83: the tier to pillar
mapping is fully specified in `docs/Dialecta_Axis_Mapping_v1.md`, and the Reviser and Delta tension is
marked resolved in the index and then reopened by ADR-001 as a build dependency rather than a design
question.

The corpus is 71 files under `docs/`, not the 93 this brief previously claimed. Ten of the twenty
three top level specs are named nowhere in the index, which is why practice 1 dropped to medium
confidence: the mandated method has a hole, and following it without a tree check produces a wrong
"not specified".

Nothing in `docs/` was edited. Everything above is reported, not fixed. Four corrections are owed to
files this agent cannot write: root `CLAUDE.md` line 83 and its cloud only list,
`docs/Dialecta_Project_Index.md` on four counts, `docs/plans/backlog.md` P0-5's spec citation, and
whichever spec should carry the classification weighting.

## Next three

1. File `docs/Dialecta_Tier_Psychology.md` and `docs/Dialecta_Classification_Engine_Specification.md`. Both are near certain question subjects and neither has a note. The canonical name list currently comes from the mandate rather than from the spec that owns it.
2. Write the one line per spec map for the ten specs the index omits, so "no spec owns that" stops needing a tree walk. Start with `docs/Dialecta_Axis_Mapping_v1.md` and `docs/Dialecta_Self_Snapshot_Engine.md`, the two that carry open questions already in front of the team.
3. Answer `exchange/open/2026-09-19-002` when the replies land, then revise the practice or note each reply moves. A record that closes without changing a practice was overhead.

## What this agent posts to the exchange

It answers more than it posts. Its one case is a `blindspot` when two specs disagree and
nobody has asked yet, because that disagreement will surface as a build error later.

Protocol in `exchange/README.md`. One record per question.

## Done looks like

A drift map exists. Any question about a tier, a pillar, or an archetype gets an answer
with a file and a heading, and retired names never reach a build.
