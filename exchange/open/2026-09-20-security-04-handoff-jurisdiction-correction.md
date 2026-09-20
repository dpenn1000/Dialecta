---
id: 2026-09-20-security-04
type: handoff
from: security
to: [legal]
subject: Four of my notes assumed a Connecticut establishment; Dan lives in Arizona
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Corrected every place in `council/security/` that rested on the assumption, and marked rather than
deleted, so the reasoning stays legible.

Three research notes carry a dated correction block at the top: `2023-ct-data-privacy-act.md`,
`2021-ct-breach-notification.md`, `2023-ct-data-minimization-retention.md`. Two positions were
amended: the retention row in `positions.md`, and section 4 plus the decision table in
`positions/nextjs-rebuild.md`. One practice was added, that a legal basis rests on facts about the
world and the jurisdiction has to be stated rather than inherited.

The correction came from the repository setup session relaying what Dan said today. Nothing in this
repository has ever named a jurisdiction, which is how the assumption survived a full sprint without
being checked by anyone.

My read of what survives, offered as a starting point and not as an answer, since this is yours.

**Breach notification survives best.** US state breach statutes key on the residency of the affected
individual rather than on where the business sits, so Connecticut's 60 day deadline still reaches
Dialecta for any affected Connecticut resident. What was wrong was treating it as the home state's
law and therefore as the whole picture. The whole picture is every state an affected person lives
in, and the shortest deadline among them governs. Arizona's own statute now also applies and I have
not read it.

**CTDPA is genuinely open.** It reaches entities processing Connecticut residents' data, so reader
residency rather than founder residency is the operative test, and it may still apply. The
"conducts business in Connecticut" reading was being carried by Dan's location and is now
unsupported.

**GDPR is untouched.** `2016-eu-gdpr-territorial-scope.md` turns on Article 3(2) and on where
readers are. Nothing in it referenced Connecticut. The minimisation recommendation now rests on
this half alone and still stands.

## Not done

I did not read Arizona law. Nothing in my tree should be taken to say that Arizona has a
comprehensive consumer privacy act or that it has none. That gap is deliberate: naming a second
jurisdiction from memory is the same mistake that produced the first one.

I did not touch `council/legal/`. Your highest confidence position, as relayed to me, is "accept the
Connecticut risk rather than spend on it" with enforcement numbers behind it. The enforcement
numbers are probably still true and the thing they are attached to may not be. That is yours to
redo and I have not pre-empted it.

I did not re-examine the PCI or insurance notes. `2022-pcissc-saq-a-eligibility.md` is a card brand
standard rather than a statute and is not jurisdictional in the same way.
`2022-travelers-mfa-warranty-rescission.md` turns on misrepresentation on an application, which
travels.

## Governing spec

None. This is a correction to filed research rather than a change against a spec.

## Acceptance

`grep -rl Connecticut council/security/` returns the three research notes, the two positions, the
index and the reading list. Every one of those now either carries a correction block or states the
GDPR basis instead. `python scripts/voice_check.py --strict council/security/` reports zero hard
hits.

## Traps

**An unstated premise is never the thing anyone checks.** No individual step here was wrong. Each
note cited a real statute accurately, verified the text, and even caught published law firm
summaries contradicting the primary source. The error was upstream of all of it and invisible to
every check that ran, because nothing in the repository ever asserted the premise out loud. If you
redo this, state the jurisdiction in the first line of the analysis so the next person can disagree
with it.

**Residency based reach and establishment based reach behave differently under a move.** Breach
notification mostly survived and the CTDPA applicability mostly did not, for that reason. Sort the
regimes by which test they use before assuming a relocation does or does not matter to each.

**Do not average my read above with your own.** I have marked it as a starting point because I hold
whether a control works rather than which obligations are owed. If it conflicts with what you find,
yours governs and I will correct my notes again.

## Do not touch

`council/security/` is mine. Everything in it is already corrected, so there is nothing for you to
change there. If a conclusion of yours moves one of my positions, post it and I will make the edit.
