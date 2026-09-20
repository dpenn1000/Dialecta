# Are the six pillars and the archetype sensitive data under the amended CTDPA?

*`legal` standing position, 2026-09-20. Not counsel. Nothing here is legal advice. The statutory
text quoted below was read from the enrolled Public Act and is filed at
`council/legal/research/2025-ct-public-act-25-113.md`.*

## Correction, 2026-09-20, later the same day

**Dialecta is operated from Arizona, not Connecticut, and the CTDPA does not apply to it.** Dan
said so in session. Nothing in the repository ever said Connecticut; the premise came from
`.claude/agents/legal.md` line 30 and from this advisor's reading list, and `security` built two
notes on the same bad premise. Filed at
`council/legal/research/2026-az-no-comprehensive-privacy-law.md`.

What that changes and what it does not:

- **Gone.** The applicability chain below, the "live at fourteen users" framing, and the claim
  that Dialecta is probably already in scope. The CTDPA reaches persons who conduct business in
  Connecticut or target services to Connecticut residents, and a publicly readable website is not
  targeting a state.
- **Gone.** The idea that there is a home-state privacy statute at all. Arizona has never enacted
  one, and two 2026 bills died. The only home-state obligation is breach notification under
  A.R.S. Section 18-552, filed separately, and whatever a published privacy policy promises under
  FTC Act Section 5.
- **Kept, and this is most of the file.** The reading of the sensitive data definition, and the
  conclusion that the six pillars and the archetype are on none of the enumerated categories.
  Connecticut's list is the common template that most of the twenty state statutes copy, so that
  finding travels to the states Dialecta's readers actually live in.
- **Kept.** The profiling analysis, and the finding that the narrowing of "legal or similarly
  significant effect" takes a tier badge outside the impact assessment and the right to contest.
  Same reason: other states drafted from the same model.
- **Changed in kind.** The live privacy question is no longer "does my state's law reach me". It
  is "do any of the twenty states where readers live reach a site that does not target them".
  That is the next sprint's work and it is a different question.

The analysis below is left standing rather than deleted, because it is the most detailed
statutory reading in this tree and it is accurate about Connecticut. Read it as comparative.

## Why this is live rather than theoretical

Public Act 25-113 rewrote the CTDPA's applicability test with effect from July 1, 2026, and it
has been in force since. The old volume thresholds are gone. A person conducting business in
Connecticut is covered if it "control[s] or process[es] consumers' sensitive data", with no
consumer count attached at all. Dan operates from Connecticut. Dialecta has fourteen members. If
the fingerprint is sensitive data, the statute applies today; if it is not, the 35,000 threshold
keeps the platform out.

No source in the reading list evaluates this, and `council/security/research/2023-ct-data-privacy-act.md`
correctly declined to guess. This is the answer from the statute.

## The answer: no, and the question was pointed at the wrong data

**The six pillars are not sensitive data.** Section 42-515(39) is a closed list of nine lettered
categories: race or ethnicity, religious belief, health condition or diagnosis or disability or
treatment, sex life or sexual orientation or transgender or nonbinary status, citizenship or
immigration status, consumer health data, genetic or biometric data, data from a child, crime
victim status, precise geolocation, neural data, financial account credentials, and
government-issued identification numbers. Acuity, Reach, Calibration, Magnanimity, Discourse and
Consistency are on none of them. `docs/Dialecta_Contributor_Identity.md` line 30 says the pillars
"do not measure what someone believes", and Naming Principle 3 at line 123 bars tribal coding.
Taken at its word, the spec designed the fingerprint out of category (A) before the amendment
existed.

**The archetype is not sensitive data either.** Skeptic, Synthesizer, Advocate, Builder,
Empiricist, Contextualist, Illuminator and Reviser name cognitive moves. None reveals a protected
category.

**The Thinking Fingerprint is not biometric data.** Section 42-515(4) requires "automatic
measurements of an individual's biological characteristics". A petal shape computed from comment
history measures nothing biological. The name is a metaphor and the statute is not fooled by it.
The name is still the first thing a demand letter would quote, and
`docs/Dialecta_Contributor_Identity.md` line 77 calling the shape "unfakeable" reads at a glance
like a claim of unique identification. Worth knowing before it is read back to us.

**It is not neural data.** Section 42-515(24) requires measuring central nervous system activity.
Not close.

## Where CTDPA actually reaches Dialecta

The pillars were never the exposure. The comment text is.

Dialecta publishes on contested public questions. The moment a Connecticut contributor writes "as
a Catholic" or "as an immigrant" and `api/comment.js` sends that text to Claude and writes the
structured `claim_text` into `classifications`, Dialecta is processing data revealing religious
belief or immigration status. That is category (A) on its face, and the trigger has no volume
floor. One comment is enough. The live `opinion_map_positions` table is the same exposure with a
schema around it, and self descriptions are a third.

**The best defence is the publicly available information carve-out, and it has a hole.** Section
42-515(27) excludes publicly available information from "personal data", and 42-515(34) includes
information a controller reasonably believes "a consumer has lawfully made available to the
general public". A published comment plausibly qualifies. But classification runs before
publication, on text submitted privately; a Breach comment's original text is never published at
all; and Private Draft Mode is by definition not public. At the moment of processing, the text is
not yet public, and the moment of processing is what the statute measures.

So the honest position is: Dialecta is probably already in scope, and the reason has nothing to
do with the fingerprint.

## What being in scope actually costs, which is almost nothing

This is where the alarm should stop, and this seat should say so plainly.

**Dialecta profiles. There is no argument about it.** Section 42-515(31) covers automated
processing that evaluates "personal preferences, interests, reliability, behavior". Calibration
evaluates reliability by name. Discourse and Consistency evaluate behaviour by name.

**But the profiling obligations do not attach.** Both the Section 42-518(a)(6) rights to question
a profiling result, be told the reason and review the inputs, and the Section 42-522(c) impact
assessment, fire only on profiling in furtherance of "a decision that produces any legal or
similarly significant effect". Public Act 25-113 narrowed that phrase to seven enumerated
denials: financial or lending service, housing, insurance, education enrolment or opportunity,
criminal justice, employment opportunity, health care service. The act struck the old closing
words "or access to essential goods or services", which was the only clause a tier badge could
have been argued into.

A tier denies none of the seven. **No impact assessment is owed for the classification engine
under Connecticut law, and no statutory right to contest a tier exists.** The Wiley Rein alert
describes the rights without that qualifier and reads, alone, as though any controller that
profiles owes them (`2026-wiley-ctdpa-2026-amendments.md`). The statute says otherwise.

What remains if Dialecta is in scope is the ordinary set: a privacy notice, access, correction,
deletion, portability, and honouring opt out signals. Enforcement is the Attorney General alone,
there is no private right of action, and penalties run to 5,000 dollars per violation through
CUTPA (`2026-ctag-ctdpa-enforcement.md`). At fourteen members the entire theoretical exposure is
smaller than one month of counsel.

## The recommendation

Accept this risk. Do not build a compliance function, do not commission an impact assessment, and
do not redesign the fingerprint to dodge a category it was never in.

Do three cheap things instead:

1. **Write the privacy notice before taking money or opening sign-up.** It is owed on the
   ordinary track whether or not the sensitive data trigger fires, and the FTC treats whatever it
   promises as binding.
2. **Do not add a field because it is interesting.** Every additional category collected widens
   the only door CTDPA has into this platform. Per the charter, that is a veto, and it is aimed
   at whoever proposes storing a contributor's politics, location or demographics for a future
   opinion-mapping feature.
3. **Keep the claim text scoped.** `classifications.claim_text` stores a model's paraphrase of
   what a person claimed. It is the single field most likely to capture a protected category, and
   it is stored for auditing and for a future fine-tuned model
   (`docs/Dialecta_Classification_Engine_Specification.md` line 214). That is a real purpose, so
   this is not an objection; it is the field to name in the privacy notice rather than to leave
   implicit.

## Where this needs a lawyer, and why

**One question, and it is the whole thing.** Is a comment published on Dialecta "publicly
available information" at the moment Dialecta processes it, or only at the moment it is
displayed? That single reading decides whether the platform is inside CTDPA at fourteen users or
outside it. A non-lawyer should not be the last word on it.

Two smaller ones. Whether the business nexus language in the renumbered Section 42-516 attaches
to clauses (2) and (3) as well as to (1), which is a drafting artifact of the amendment and does
not change the answer here because the operator is in Connecticut, but would matter for any
argument about out of state residents. And whether Dialecta's own published Pact and terms could
constitute the consent that Section 42-520 requires before processing sensitive data, which would
close the question a different way and is cheaper than avoiding the data.

## What this does not decide

`philosopher` owns whether a contributor should be able to contest what the platform says about
them. Connecticut does not require it. The platform's own charter and Editorial Voice arguably
do, and the fact that the law is silent is not an argument for building it or against it. This
seat's only contribution is that the obligation, if it exists, is Dialecta's own and not the
state's.
