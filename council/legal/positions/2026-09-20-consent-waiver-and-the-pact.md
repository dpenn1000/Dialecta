# Does acceptance of the Pact defeat a defamation claim over a published tier?

*`legal` standing position, 2026-09-20, written in answer to Dan's question in session. Not
counsel. Nothing here is legal advice.*

## The short answer

Three different things are being folded together, and they are worth very different amounts.

| Instrument | What it is | What it is worth here |
| --- | --- | --- |
| **Disclaimer** | "This is the system's opinion, not a statement of fact" | Close to nothing |
| **Consent** | The contributor agreed to the publication that happened | A complete defence, and it fits Dialecta unusually well |
| **Waiver or release** | The contributor gave up a claim in advance | Weak, disfavoured, and not where the effort should go |

The order matters because the instinct behind "every platform has disclaimers" points at the
first one, which is the one that does not work.

## Why the disclaimer is worth close to nothing

Milkovich v. Lorain Journal Co., 497 U.S. 1 (1990), closed this route. There is no separate
privilege for anything labelled opinion, because the label does not remove the factual
implication: "Simply couching such statements in terms of opinion does not dispel these
implications; and the statement, 'In my opinion Jones is a liar,' can cause as much damage to
reputation as the statement, 'Jones is a liar.'"
(`council/legal/research/1990-scotus-milkovich-v-lorain-journal.md`.)

So a footer saying the tiers are the platform's opinion buys nothing. What Milkovich says does
work is that a statement must be "provable as false" to be actionable, and that the danger is an
opinion implying facts the reader cannot see. **Dialecta's protection is that the facts are on
the page.** The AI Classification Card publishes the reasoning beside the badge, and the comment
is right there. That is not a disclaimer, it is a design decision, and it is worth more than any
sentence of legal boilerplate the platform could write.

## Why consent is worth a great deal, and fits this platform better than most

Consent to publication is a complete defence to defamation, treated as an absolute privilege:
"the consent of another to the publication of defamatory matter concerning him is a complete
defense to his action for defamation", Restatement (Second) of Torts Section 583
(`council/legal/research/1977-restatement-583-consent-to-defamation.md`).

It does not require a signature. The Restatement's own example is a person "who submits his or
her conduct to investigation, knowing the results of the investigation will be published". That
describes Dialecta's comment flow almost exactly. A contributor writes, knowing the engine will
analyse the comment and knowing the tier will be published. On the doctrine's own example, that
is consent to the publication of the result, and it operates whether or not the Pact exists.

The Pact makes it better rather than making it exist. Its value is evidentiary and it is real:

- It is an affirmative act, not a link. Nguyen v. Barnes and Noble, 763 F.3d 1171 (9th Cir. 2014),
  is binding in Arizona's circuit, and it is about the failure of passive notice
  (`council/legal/research/2014-ca9-nguyen-v-barnes-noble.md`). The Pact is the opposite of
  passive notice by construction.
- The name is recorded. The live `profiles` table already carries `pact_signed_name`.
- It teaches the tiers before it asks for agreement. `components/dialecta-pact.html` walks all
  seven tiers and makes the reader classify three real comments before Section VIII asks for the
  commitment. A consent given after being shown exactly what will be published is the strongest
  kind there is.

Almost nothing about that was designed for legal reasons, and it is nonetheless the best
consent artifact on the platform.

## The limit that decides how far consent actually reaches

**Consent is to a publication, not to a subject, and it scales with how predictable the published
statement is.** That single sentence resolves most of the question, and it produces an ordering
that runs opposite to intuition.

| Surface | How predictable at the moment of consent | How far consent reaches |
| --- | --- | --- |
| Tier badge | One of seven names, every one published and taught in the Pact | Very far |
| Contrast Strip | A pair of those same seven names | Far, except for its permanence |
| AI Classification Card fields | Fixed schema, values bounded | Far |
| Commenter message | Free text a model writes, unknown to both parties | Least far of anything on the platform |
| Breach notice | A fixed sentence, but published about a person with the text withheld | Narrow, for a different reason |

The commenter message is the weak point precisely because it is the part nobody can describe in
advance. A contributor cannot consent to the content of a sentence that does not exist yet. The
Breach notice is narrow for the opposite reason: the sentence is fixed and consentable, but it is
the one surface where a reader cannot check the platform's work, because the original text is
never shown.

**Consent also never reaches three things.**

1. **A label applied outside the rubric.** Agreeing the platform may classify is not agreeing it
   may classify wrongly. Consent and engine accuracy are the same question in different clothes,
   which is why no amount of drafting substitutes for the classifier being right.
2. **Anyone who did not give it.** An article author, or a person named inside somebody else's
   comment, signed nothing. Consent protects the platform only against the person who gave it.
3. **A publication that outlives its context.** `docs/Dialecta_Discourse_Layer_UX.md` line 109
   says the Contrast Strip displays "permanently". Consent given at sign-up to a publication that
   continues indefinitely is the weakest form of the argument, and permanence is what makes it
   weak.

## Why waiver is the wrong thing to reach for

A waiver is a contributor giving up a claim in advance. Prospective releases of future tort
claims are construed narrowly and are often unenforceable against a consumer in an adhesion
contract. More to the point, a waiver is not needed if consent works and does not help if consent
fails, because both turn on the same facts about what was shown and agreed.

There is a second reason, and it is not a legal one. A platform whose founding premise is that
contributors are treated as people, and that then answers a contributor's complaint with "you
agreed we could say this about you", has said something about itself. `philosopher` owns that
question and would be right to raise it. This seat's contribution is only that the legal gain
from a waiver is small enough that the ethical cost is not worth paying.

## What this changes

The standing position that the tier label is unlikely to be actionable moves from medium
confidence to medium-high, for a reason that is not about 230 at all. Two independent defences
now sit under it: the basis is disclosed, so Milkovich's undisclosed-fact danger does not arise;
and the contributor consented to the publication after being shown what it would be.

**Do these:**

- **Name the seven tiers in whatever the sign-up flow asks the contributor to accept.** Consent
  to a named, closed set is far stronger than consent to "a classification", and the list is
  already public and already locked. This is one sentence.
- **Say that a model writes the commenter message.** It is the surface consent covers least, and
  the cheapest improvement is to make the unpredictable part of it the thing that was disclosed.
- **Keep the Pact's teaching sequence in front of the commitment.** The three practice
  classifications in `components/dialecta-pact.html` are what turn a formality into informed
  consent. If a future flow shortens the Pact for conversion reasons, that is the part to protect.
- **Route sign-up through the Pact rather than past it.** Whatever P0-4 builds, the affirmative
  act should be the one that already exists.

**Do not do these:**

- **Do not add a disclaimer and think anything has changed.** Milkovich.
- **Do not draft a waiver of defamation claims.** Small gain, real cost, and it signals the
  opposite of what the platform says it is.
- **Do not rely on consent for the Breach notice.** It is the surface where the platform publishes
  about a person while withholding what it is describing, and no agreement fixes that. If
  anything there needs work it is the design, not the paperwork.

## Where this needs a lawyer, and why

1. **Does Arizona follow Restatement Section 583, and on what terms?** The rule was read here
   through a California jury instruction and secondary summaries, not from an Arizona source.
   Everything above rests on it.
2. **Can the Pact carry legal effect when nothing in it is drafted as a contract?** It is a
   statement of shared values written in the platform's editorial voice, which is exactly why it
   works as evidence of informed agreement and exactly why it may fail as an instrument. That
   tension is worth one hour, and the answer might be a short clause appended to the Pact rather
   than a separate document, which would cost the ceremony nothing.
3. **Is the Breach notice provable as false under Turner v. Devlin, 174 Ariz. 201 (1993), when
   the text it characterises is withheld?** The sharpest question in this tree, and the one
   consent does not answer.
