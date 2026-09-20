# Moment-in-time sign-offs: which ones exist, which are missing, and what has to be stored

*`legal` standing position, 2026-09-20, written in answer to Dan's question in session about
incremental sign-offs at relevant UI moments rather than one buried agreement. Not counsel.
Nothing here is legal advice. Companion to
`council/legal/positions/2026-09-20-consent-waiver-and-the-pact.md`.*

## The finding that should come first

**Dialecta already has almost every moment, and it built them for philosophical reasons rather
than legal ones.** The work is not to add ceremony. It is to name what the existing moments
already carry, close two gaps, and store the artifact so it can be proved a year later.

This is worth saying plainly because the instinct behind the question was that the platform needs
new consent gates. It mostly does not. The Article Editorial Template already specifies, at the
exact moment Dan named, a structured pause offering three choices: *"Here's what the engine
noticed. You can amend your submission, respond to the suggestion for the record, or post as-is.
None of these choices are wrong."* That is a moment-in-time sign-off written in the platform's
own voice, and it is better than anything this seat would have proposed.

## Why the instinct is legally right, and unusually so

Normally the defensible move and the transparent move pull apart. Dense terms protect the
operator; plain language serves the reader; an operator picks one. **Here they are the same
artifact,** and that is the reason to do it.

Two doctrines converge on it. Consent to publication is a complete defence to defamation, and its
limit is scope: consent runs to a publication, judged by the surrounding circumstances, not to a
subject in the abstract (`research/1977-restatement-583-consent-to-defamation.md`). A sign-off
standing next to the actual publication, describing what is about to be published, is consent to
that publication in a way a sign-up agreement months earlier is not. And Milkovich protects a
characterisation whose factual basis is disclosed, because the danger it names is an opinion
implying facts the reader cannot see (`research/1990-scotus-milkovich-v-lorain-journal.md`).

So the thing that makes these moments ethical is the same thing that makes them defensible: what
was actually shown, at the moment it mattered, in words a person read. Legalese would be worth
less, not more.

## The ladder, ranked by what each moment is actually for

Not all of these protect against the same thing. Collapsing them into "consent" is the mistake.

| Moment | Exists? | What it is actually for | Gap |
| --- | --- | --- | --- |
| Pact, at sign-up | Yes, and it is strong | General framing, and proof the seven tiers were taught | Nothing legal. Protect the practice classifications if the flow is ever shortened |
| First comment ever | **No** | The first time a label is applied to this person | The whole moment is missing |
| Stage 2 self-declaration | Yes | Consent to the badge and to the Contrast Strip | Copy does not say the strip is permanent |
| Article pre-publish | Yes, and it is the best one | Consent to the engine's reading appearing beside the author's name | Nothing is stored |
| Accepting an AI suggestion | Partly | **Not consent. Evidence of authorship** | Discussed below |
| Nomination | Yes | The contributor becomes a speaker about someone else | Unclear who is named; a question rather than a finding |
| Breach | **Impossible** | Nothing. No sign-off can exist here | Discussed below |

## The AI suggestion moment protects something different, and this is the important part

Dan grouped it with the others. It does not belong with them.

A tier sign-off is the contributor consenting to be described. A suggestion sign-off is the record
of **who wrote the words**, and that question is governed by Fair Housing Council v.
Roommates.com, 521 F.3d 1157 (9th Cir. 2008) (en banc), which is binding here
(`research/2008-ca9-roommates-material-contribution.md`). If Dialecta proposes wording and a
contributor adopts it, and the resulting sentence defames a third party, the question is whether
the platform materially contributed to it.

**Today the answer is comfortably no,** because `aesthetic-suggest` is recorded in
`exchange/open/2026-09-19-005` as explicitly forbidden from touching content. A tool that cannot
alter words cannot contribute to what the words do. The moment that protection matters is the day
an editor gains a suggestion that proposes phrasing, and on that day the stored record of "the
author applied this" is the artifact that answers the question. Building the record now, while
the feature is harmless, costs nothing and is the only time it can be built cheaply.

## Breach is where this approach stops, and pretending otherwise would be dishonest

There is no sign-off at Breach, and there cannot be one. The platform suppresses the text and
publishes "Content suppressed. Targets a person, not an idea." beside a named account. The
contributor consents to nothing, because the entire point is that they did not get to choose.

Every other surface on the platform gets stronger from this approach and Breach gets no benefit
at all. It remains the most exposed publication on the site, for the reason set out in
`positions/2026-09-20-tier-label-first-party-speech.md`: a characterisation published without the
text it characterises, so no reader can check it. Incremental consent is not a fix for that. A
design change might be.

## Proposed copy

Written to Editorial Voice v1.2: observational, two sentences, no dashes, and nothing that reads
as a warning. `voice-editor` owns whether these land; this seat owns whether they say enough.

**First comment, shown once.** The gap that matters most, because it is the first time the
platform describes this person.

> This is your first comment, so here is what happens next. The engine reads it, names a tier,
> and both its reading and yours stay on the comment.

**Stage 2, extending the existing contrast note.** The current copy already reads *"Both will be
visible. That contrast is part of the record."* It does not say for how long, and
`docs/Dialecta_Discourse_Layer_UX.md` line 109 says permanently.

> The engine reads this as [X] and you are declaring [Y]. Both stay on this comment for as long
> as it is posted, and that contrast is part of the record.

**Article pre-publish, beneath the three existing choices.** Adds what publishing does, without
touching a line that already works.

> Publishing puts the engine's reading beside your article, in your name. You can amend first,
> answer it for the record, or let it stand.

**Accepting a suggestion.** The authorship record, in the voice.

> These are formatting suggestions and they do not change your words. Applying one is recorded as
> your edit rather than the engine's.

## What has to be stored, or none of this counts

A consent that cannot be proved is a consent the platform does not have, and this is the part
that is genuinely missing rather than merely unwritten. One append-only table, written at each
moment above:

| Column | Why |
| --- | --- |
| who | The `profiles` row |
| what moment | First comment, Stage 2, article pre-publish, suggestion applied |
| what they chose | The tier, the amend or respond or post-as-is branch, applied or dismissed |
| **which text was shown** | The version of the copy above. Without it, nobody can say a year later what the person read |
| when | Timestamp |
| what it attached to | Comment or article id |

The fourth row is the one that is easy to leave out and the only one that is hard to reconstruct.
Copy gets revised; the question at issue is always what *this* person saw on *that* day.

This is `migrator`'s to build and it is one migration. Posted to the exchange rather than
specified here.

## What not to do

- **Do not add a gate at every moment.** Consent fatigue is real, and a court looking at fifteen
  click-throughs sees ritual rather than understanding. Four moments that a person reads beat ten
  that they clear. This is the same answer `designer` would give for a different reason.
- **Do not write any of these in legal register.** The defence is that a person understood what
  was about to be published. A sentence engineered to be enforceable is a sentence nobody reads,
  and an unread sentence proves less, not more.
- **Do not make any of them a blocking modal with an "I agree" checkbox.** Stage 2 already
  requires an affirmative act to post, and the article flow already requires a choice. The act
  exists; what is missing is the disclosure beside it and the record behind it.
- **Do not let this become a reason to keep the Contrast Strip permanent.** Telling someone a
  thing is permanent is not the same as the permanence being a good idea. The open question at
  `exchange/open/2026-09-20-legal-01` stands.

## Where this needs a lawyer, and why

1. **Does Arizona follow Restatement Section 583, and does consent obtained this way carry?**
   Already the third question at `exchange/open/2026-09-20-legal-02`. Everything above rests on
   it, and the answer shapes how much of the copy needs to change.
2. **Is a plain-language disclosure enough, or does something need contractual form?** The whole
   argument of this file is that plain language is worth more here. That is a judgment a
   non-lawyer should not make alone, and the cheapest resolution is probably a short clause
   appended to the Pact plus these disclosures, rather than either one on its own.
