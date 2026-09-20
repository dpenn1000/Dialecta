# What a decision record needs so that reversing it is cheap

**Source:** Microsoft, "Maintain an architecture decision record (ADR)", Azure Well-Architected Framework, architect role guidance, dated 2026-04-10. https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record

## Summary

Lead partly confirmed, and the part that failed is worth keeping.

What the lead asked for was decision records that were later reversed and an account of what the record failed to capture. No published case study of a specific reversed ADR was found. What exists instead is practice guidance that names the failure in the abstract, and this is the strongest official statement of it.

The guidance repeats Nygard's append-only rule in the same terms: "Don't go back and edit accepted records. If a decision changes, write a new record that supersedes the original and link the two together. This approach preserves the history of your thinking and makes it clear when and why the direction shifted."

Two further recommendations go past Nygard, and both exist to make a later reversal legible.

First, on rationale: "Always include context and rationale. A record without justification loses its value over time as stakeholders can't evaluate whether the decision still applies when circumstances change." The test of a record is not whether it says what was chosen. It is whether a reader years later can tell whether the choice still holds.

Second, on confidence: "Record the confidence level of the decision. Sometimes an architecturally significant decision is made with relatively low confidence. Documenting that low confidence status could prove useful for future reconsideration decisions."

Two smaller rules worth carrying. Only record choices that "affect the system's structure, key quality attributes, or are difficult to reverse," so not every fork earns an ADR. And "Break one decision into multiple if an architectural decision is going to result in multiple phases," so a short-term and a long-term answer are two records.

## Implies for Dialecta

- This converges with the template variants on the same missing field. A reversal is cheap when the old record named the condition that has since broken, and expensive when it did not, because the team has to reconstruct the reasoning before it can argue with it. The Dialecta template records the choice and the reason that carried it, not the condition.
- The confidence recommendation lands on ground the repo already has. `practices.md` and `positions.md` both carry a confidence column, and the exchange records a tie as a tie rather than breaking it. An ADR written with low confidence, which P0-D2's invite-only question may well be, currently has nowhere to say so.
- The "structure, key quality attributes, or difficult to reverse" test is a filter the `-D` backlog rows have not been run through. A-D2, the wait timers in the Pact copy, is reversible in an afternoon and is a copy decision. It may not deserve an ADR at all.
- The phase rule applies directly to P0-D2. Sign-up policy at cutover and sign-up policy at scale are two decisions, and the second is not due yet. Framing them as one question invites an answer that overreaches.
- The mandate in `.claude/agents/decider.md` already says "Name the uncertainty plainly if it is real; no hedging for modesty." The template gives that sentence nowhere to go. It ends up in `## Decision` prose or it is lost.

*Filed 2026-09-19*
