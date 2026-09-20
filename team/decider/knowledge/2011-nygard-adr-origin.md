# The origin of the ADR format

**Source:** Michael Nygard, "Documenting Architecture Decisions", Relevance blog, 15 November 2011 (now served by Cognitect). https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions

## Summary

Lead confirmed. The article exists, the author and date match the reading list, and it is the origin of the format the repo uses.

Nygard proposes five sections: Title, Status, Context, Decision, Consequences. Context holds the forces at play, in tension, that make the decision necessary. Decision states the response in active voice. Consequences states what becomes easier and what becomes harder afterward.

Three structural rules carry the format, and each has a stated reason rather than a convention behind it.

Short, because "Large documents are never kept up to date. Small, modular documents have at least a chance at being updated," and because "Nobody ever reads large documents."

Numbered sequentially and monotonically, never reused, so a decision has one permanent address.

Never edited once accepted. "If a decision is reversed, we will keep the old one around, but mark it as superseded." The reason is that "It's still relevant to know that it was the decision, but is no longer the decision." The record is a log of what was believed and when, not a description of the current system.

The motivating problem is stated at the top: "One of the hardest things to track during the life of a project is the motivation behind certain decisions." A team that inherits a system without that motivation either accepts every past choice blindly or reverses it blindly, and both are failures of the same missing information.

## Implies for Dialecta

- The local template in `.claude/skills/dialecta-decide/SKILL.md` keeps four of the five Nygard sections. Title, Status (folded into the date line), Decision and Consequences are all present. The one Nygard section with no local counterpart is **Context**, the forces in tension.
- The local template's `## Question` is not Context. It names what is being decided and what it blocks, which is scope, not the forces. `## Options considered` names the alternatives, which Nygard did not have and which is an improvement. Neither records the conditions that made the chosen option right.
- The two rules the repo already enforces, sequential numbering and never editing after Decided, come straight from here and have Nygard's reasons behind them. `docs/decisions/README.md` states both. They are not local invention and should not be treated as negotiable style.
- ADR-001 is a live instance of the failure Nygard describes. It reverses the May 2026 recommendation to stay on Ghost, and the reason it gives is that the earlier recommendation rested on "momentum on a solo evening cadence" which no longer holds. That reversal was possible only because someone remembered the assumption. No record held it.

*Filed 2026-09-19*
