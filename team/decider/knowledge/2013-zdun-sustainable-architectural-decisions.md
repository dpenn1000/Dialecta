# The Y-statement: one sentence instead of a document

**Source:** Uwe Zdun, Rafael Capilla, Huy Tran, Olaf Zimmermann, "Sustainable Architectural Design
Decisions", IEEE Software, Vol 30 No 6, Nov/Dec 2013, pp 46-53. DOI 10.1109/MS.2013.97. Read via
Olaf Zimmermann's own practitioner summary, one of the paper's authors,
https://ozimmer.ch/practices/2020/04/27/ArchitectureDecisionMaking.html. The IEEE original was not
read directly (paywalled); gap noted below rather than papered over.

## Summary

Lead confirmed. The exact template: "In the context of [context], facing the need to [facing], we
decided for [decision] and neglected [alternatives] to achieve [benefits], accepting that
[drawbacks]." Six slots in one sentence: context, concern, chosen option, rejected alternatives,
expected benefit, accepted downside. The shape reads top to bottom as a Y, which is where the name
comes from.

The motivation was not brevity for its own sake. The format was "first applied in an industry
project setting at ABB," where sponsors wanted a decision to "fit each decision on one presentation
slide." Full-length records, kept across a multi-project or multi-team setting, became a
maintenance burden the source calls "rather high." The Y-statement is what survived cutting that
burden without dropping why a decision was made.

"Sustainable" in the paper's own framing is about the knowledge outliving the document: a decision
recorded densely enough to still be legible when reused on a different project, by people who were
not in the room, not about the environment the software runs in.

Against Nygard and Tyree/Akerman, the source frames Y-statements as leaner. Nygard's sections "can
get rather long"; the Y-statement compresses the same rationale into one sentence. It has no
separate Status field and no separate Assumptions field, which is the trade the leanness buys
(independently corroborated in `2015-zimmermann-wicsa-template-comparison.md`, filed alongside this
note).

## Implies for Dialecta

- This is the sharpest counter-evidence yet to the standing recommendation that root `CLAUDE.md`'s
  ADR template add a `## Holds while` section: the Y-statement's whole argument is that a shorter
  record travels further, and the local proposal is to add length, not cut it. The two are not
  actually in conflict, because they answer different failures. A Y-statement is lost when nobody
  re-reads it; `## Holds while` targets the case where someone did re-read it and still could not
  tell whether it was current. But the tension is real enough to name to Dan plainly, not just
  resolve quietly in this note.
- The `[alternatives]` slot in one sentence is what the local `## Options considered` table already
  does at more length, with cost broken out by now, later and foreclosed. No gap here.
- Gap confessed: read through a co-author's blog summary, not the IEEE original or a library copy.
  The quotes above are the blog's quotes from the paper, not independently checked against the
  typeset original. Flagged rather than presented as closer to the source than it is.

*Filed 2026-09-20*
