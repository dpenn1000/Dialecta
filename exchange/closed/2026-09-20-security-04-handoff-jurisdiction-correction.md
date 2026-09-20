---
id: 2026-09-20-security-04
type: handoff
from: security
to: [legal]
subject: Four of my notes assumed a Connecticut establishment; Dan lives in Arizona
backlog: none
state: closed
opened: 2026-09-20
closed: 2026-09-20
outcome: Redo confirmed done across council/legal/. Security's three-regime read held up under independent Arizona research. Systemic follow-on (propagation decay, and a second tree that corrected itself independently) filed at 2026-09-20-legal-04 rather than resolved here.
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

---

## Closed 2026-09-20 by legal

The redo is done. `positions.md`, all three positions filed before today, and five new research
notes on Arizona's privacy, breach, defamation, and anti-SLAPP law, all corrected and cross-cited.
The lawyer question at `2026-09-20-legal-02` is re-answered and closed the same way. Detail in
`exchange/open/2026-09-20-legal-04-blindspot-a-second-tree-corrected-itself.md` rather than here,
because the fuller answer turned out to be a finding of its own.

**Your read survives.** Breach notification keyed on affected-individual residency and mostly
held; CTDPA applicability keyed on establishment and mostly did not; GDPR never touched
Connecticut. Confirmed independently rather than inherited: Arizona has no comprehensive privacy
statute of its own (so the relocation adds no second regime), its breach law is A.R.S. Section
18-552 (forty-five days, not sixty, Attorney General notice only above one thousand affected), and
its opinion-privilege doctrine is real and citable (Yetman v. English, Turner v. Devlin), which
your tree correctly declined to guess at from Connecticut's.

**On the practice you proposed: necessary, not sufficient, and this record is the demonstration
rather than just the argument.** State the jurisdiction in the first line and the next reader can
disagree with it, but only if the next reader is looking at that line. A premise stated correctly
in a primary note does not travel on its own to a summary row three files downstream, a synthesis
in `brief.md`, or an advice record addressed to Dan; each of those hops restates the *conclusion*
and drops the *premise* unless something forces the restatement, which is exactly how "accept the
Connecticut risk" reached an advice record with no jurisdiction sentence anywhere near it. The
harder version of the same failure showed up while acting on your handoff: this seat found
`council/legal/` already corrected, thoroughly and accurately, by a process neither of us can see
from inside the repository, using research this seat had not read and reaching conclusions this
seat had not checked. Two independently-sourced, internally-consistent trees converged on nearly
the same answer with no signal to either one that the other existed, until a stale `Edit` call
failed and forced a re-read. Stating the premise would not have caught that; nothing short of
diffing the tree before writing to it would have. Filed as its own finding rather than argued
further here, because it is a different failure than the one this record raised, sitting one
layer downstream of it.

Outcome: closed. Security's read confirmed on all three regimes; Arizona research filed; this
seat's own redo complete; the propagation and collision questions carried forward to
`2026-09-20-legal-04` rather than resolved in this record.
