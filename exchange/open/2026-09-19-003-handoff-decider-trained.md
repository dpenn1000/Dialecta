---
id: 2026-09-19-003
type: handoff
from: decider
to: [lead]
subject: decider trained; P0-D2 framed, council composition and mandates waiting on Dan
backlog: P0-D2
state: open
opened: 2026-09-19
closed:
outcome:
---

## Done

Branch `claude/recursing-yalow-ed3460`, off `chore/monorepo-foundation` which is already on
`origin/main`. `git log --oneline origin/main..HEAD` is the authoritative commit list.

- Research sprint. All five seeded leads verified against primary sources and filed to
  `team/decider/knowledge/`. Four new leads added. `practices.md` from five rows to sixteen.
- P0-D2 framed at `council/log/2026-09-19-p0-d2-login-methods.md`.
- First `vote` opened at `exchange/open/2026-09-19-002-vote-council-guard-hook.md`.
- `exchange/open/2026-09-19-001` answered and moved to `answered`.
- Two council frames: `council/log/2026-09-19-advisor-mandates.md` and
  `council/log/2026-09-19-council-composition.md`.
- `docs/handoffs/current.md`: six auto-stub lines from the Stop hook replaced with one real
  entry in the established style. The seven prior entries are untouched.
- Gates green on the branch: `npm run typecheck` clean, `npm test` 25 passed,
  `voice_check.py --strict` zero hard hits under CI's own file selection.

Four findings the lead needs:

1. **The ADR template is missing one field.** Nygard's Context, Tyree and Akerman's
   Assumptions, MADR's Decision Drivers and the Azure guidance all name the same thing: the
   condition a decision rests on. Recommend one section, `## Holds while`, from ADR-004
   forward, never retrofitted. Template is in `.claude/skills/dialecta-decide/SKILL.md`.
2. **Five backlog decisions are Open, not four.** B-D1 was missing from every count.
3. **ADR-002 already chose magic link plus Google**, so half of P0-D2 is settled and the live
   question is the sign-up gate alone. The frame says so.
4. **The Project Brief's monetization question is number 7, not 8.** Miscited in both
   `.claude/skills/dialecta-council/SKILL.md` and `council/treasurer/charter.md`.

## Not done

- No ADR written. Nothing was decided; that is Dan's.
- `2026-09-19-002` has zero of six ballots. The named agents are untrained and a ballot now
  would be argument from priors.
- The advisors were not run on P0-D2, by instruction, for the same reason.
- Brief items for the council skill's step 2 change and the charter edits are not written.
  Both files are outside every agent's write scope.

## Governing spec

`.claude/agents/decider.md`, the mandate. `team/decider/brief.md` was the agenda and its
`## Where it is now` and `## Next three` are current as of this handoff.

## Acceptance

`npm run typecheck && npm test` on this branch: clean, 25 tests passed.
`python scripts/voice_check.py --strict` over CI's exact file selection
(`origin/main...HEAD`, markdown, minus `.voiceignore`): 13 files, zero hard hits, exit 0.

## Traps

- **`treasurer` was reported unavailable as an agent type mid-session.** The file
  `.claude/agents/treasurer.md` is still on disk. If it is genuinely off the roster,
  `/dialecta-council` cannot run as written and `2026-09-19-002` names a balloter that cannot
  file. Unresolved, and the lead should check before the first council run.
- **`dialecta-local-research` MCP is down (CONNECTION_CLOSED), but Ollama is not.** `npm test`
  shows Ollama up on 127.0.0.1:11434 with five models and the server's own test passing. This
  is a Claude Code MCP wiring fault, not a missing Ollama. The embedding index has never been
  built. Research fell back to WebFetch, which the skill allows.
- **`research_file` refuses team agents.** It only accepts `treasurer`, `designer`,
  `philosopher`, so `team/*/knowledge/` notes must be written by hand in the same template.
  Every later team sprint hits this.
- **`council-guard` does not exist** and the council skill says it does. That is the subject
  of `2026-09-19-002`, not a bug to fix silently.
- **The `## Question` in the P0-D2 frame deliberately narrows the backlog row.** That looks
  like scope reduction and is not. ADR-002 already decided the login methods.
- **The Stop hook appends a stub to `docs/handoffs/current.md` every time a session ends.**
  Six had accumulated before this one was written. They are not entries; they say "fill in".
  Strip them when you write the real entry, or the file rolls past 60 lines on noise.

## Do not touch

- `.claude/skills/dialecta-decide/SKILL.md` and `.claude/skills/dialecta-council/SKILL.md`.
  Both have named pending edits and both are Dan's.
- `council/treasurer/charter.md`, `council/designer/charter.md`,
  `council/philosopher/charter.md`. Paste-ready drafts sit in
  `council/log/2026-09-19-advisor-mandates.md`; `guard-docs.mjs` blocks agents from applying
  them, and that block is correct.
- `exchange/open/2026-09-19-001` and `-002`. `decider` holds both.
- `docs/plans/backlog.md`. B-D1's count correction and a monetization `-D` row are both
  proposed and neither is made.

## Waiting on Dan

| What | Where |
| --- | --- |
| Does "evaluating can be essential" mean the advisor's register, or the locked product rule | `council/log/2026-09-19-advisor-mandates.md` |
| Apply or reject the three charter drafts | same file |
| Pick the roster rules | `council/log/2026-09-19-council-composition.md` |
| The `## Holds while` ADR field | finding 1 above |
| Were the September migrations meant to replace the April schema | `exchange/open/2026-09-19-001` |

Settled by Dan already: `philosopher` and `designer` both own whether contributors come back
and finish what they start. The overlap is deliberate and the difference is the evidence each
brings. Recorded in the mandates frame; `decider` had proposed a boundary and was overruled.

When the roster rules and the charters settle, both frames become ADR-004 together.
