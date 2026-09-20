---
name: dialecta-council
description: Convene the advisory bench on a decision so they argue it with each other before Dan decides. Use for any -D backlog row, any "should we", or any feature that touches money, retention, exposure, craft, audience, or what the platform asks of a person.
---

The council is the advisory bench: seats with fixed mandates who disagree on purpose, chaired by `decider`. The roster is whatever `tools/roster.mjs` reports, because it derives from disk; do not hardcode a list here or anywhere else. Run it whenever a decision would benefit from being argued by people who want different things. The convener runs the protocol; advisors never talk to each other directly, they read each other's written work.

## Scaling, and the silent failure it prevents

This skill said "three advisors" until 2026-09-20 and step 3 said "read the other two positions". The bench is now six. Two things break at that size and both fail quietly:

**Reading cost is N squared.** Six seats reading five positions each is thirty reads per round, against six at three seats. That is the cheap problem.

**The expensive one is the chair's word budget.** `council/log/2026-09-19-council-composition.md` measured it: past about five seats a 700-word synthesis starts dropping arguments to fit, which is leaving a seat out of the room, moved downstream to where nobody sees it happen. A seat can argue, be read, and still have its case never reach Dan.

The fix is two rules, and neither gives the chair more power.

**Every position carries its own one-paragraph brief, written by its author.** Not by the chair. The composition log worried that a chair-written digest is the chair choosing what each advisor gets to rebut, which is real influence for a seat that is supposed to have no mandate of its own. A self-written brief removes that entirely: the chair assembles, it does not author. Under 120 words, stating the claim and the single strongest piece of evidence behind it.

**Coverage is mandatory and separate from argument.** The chair's synthesis must roll-call every seat by name with its disposition: carried, lost, conceded, or unresolved. That roll-call has no word cap and may not be compressed. The cap applies to the argument the chair develops on top of it. Nothing can now be dropped by running out of room, because running out of room truncates the argument rather than the record.

## Protocol

1. **Frame.** The lead writes the question in one sentence plus the constraints already locked (root `CLAUDE.md`, the ADRs). Save it as `council/log/YYYY-MM-DD-<slug>.md` with a `## Question` section.
2. **Positions, in parallel.** Launch every advisory seat at the same time with the same prompt: the question, the constraints, and "write your position to `council/<you>/positions/<slug>.md` and return it." Each reads its own `charter.md` and `positions.md` first. **Every position opens with a `## Brief` of under 120 words: the claim, and the single strongest piece of evidence behind it.** That brief is what the other seats rebut against, so a seat that writes a vague one has disarmed itself.
3. **Rebuttals, in parallel.** The convener concatenates every `## Brief` into the log, verbatim and unedited, in seat order. Launch every seat again: "here are the other seats' briefs; read in full any position whose brief you intend to engage; write a rebuttal under 300 words engaging the strongest opposing point; concede anything the evidence forces; return it." Append rebuttals to the log. Reading a full position is a choice a seat makes from the briefs, which is what keeps the cost linear without anyone deciding for it what deserves reading.
4. **Chair.** Launch `decider` with the log. It writes two things, in this order.

   **The roll-call, which has no word limit and may not be compressed.** Every seat by name, one line each: what it argued, and its disposition as carried, lost, conceded or unresolved. A seat that filed nothing is listed as silent. This exists so no case can vanish into a word budget.

   **Then the synthesis**, capped: the options with their costs (now, later, foreclosed), where the seats converged, where the disagreement is real, and one recommendation with the reason that carried it. It may run one more rebuttal round if two seats are talking past each other, never more.
5. **Dan decides.** In the session, or in Cowork. `decider` writes the ADR (`/dialecta-decide` template), links the log, marks the backlog row Decided.
6. **Positions update.** Each advisor updates its `positions.md` to reflect the outcome, including "lost this one, because".

Cost: one council run is roughly two calls per advisory seat plus two for the chair, and a few web fetches. At six seats that is fourteen. The brief-then-read-on-demand rule in step 3 is what stops it being N squared. Use it for decisions that deserve it; a builder's spec gap that has one obvious answer goes to `decider` alone.

## Files

```
council/
  log/                       one file per debate, the full record
  <seat>/                    one per advisory seat, per tools/roster.mjs
    charter.md               mandate, what they fight for, what they would veto
    positions.md             standing positions table: position, confidence, evidence, last changed
    positions/<slug>.md      per-debate positions and rebuttals
    research/                one file per source: citation, summary, what it implies here
    research/index.md        the list, kept by the advisor
```

Advisors write only inside their own folder and `council/log/`, and never touch `docs/`, `apps/`
or `packages/`. **That is a rule they follow, not one anything enforces.** This line claimed a
`council-guard` hook enforced it; no such hook exists and none ever did. All six advisory
seats voted independently on 2026-09-20 to drop the claim rather than build the hook, on the
grounds that no violation has ever been observed and a fourth hook is standing cost against a
hypothetical. `scripts/land.mjs` is the real backstop: its fence refuses to land a commit
touching anything outside the seat's own paths.

## Standing questions the council should take first

- P0-D2: login methods and open vs. invite-only sign-up.
- A-D3: who may publish at launch; whether articles get a pre-publish reflection.
- A-D1: community re-review threshold; whether community alone may outweigh the AI.
- The monetization model itself (Project Brief, open question 8). No ADR exists.
