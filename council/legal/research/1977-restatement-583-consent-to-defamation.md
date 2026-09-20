# Consent as a complete defence to defamation, and the limit that decides how far it goes

**Source:** Restatement (Second) of Torts Section 583 (American Law Institute, 1977), read
2026-09-20 through California Civil Jury Instruction CACI No. 1721 (Affirmative Defence, Consent)
and secondary summaries, not from the Restatement volume itself. A jury instruction is a
jurisdiction's working statement of the rule rather than the rule, so the quoted language should
be checked against an Arizona source before it is relied on.
https://www.justia.com/trials-litigation/docs/caci/1700/1721/

## Summary

The rule is broad and old: "the consent of another to the publication of defamatory matter
concerning him is a complete defense to his action for defamation." It is treated as a form of
absolute privilege, which means it defeats the claim rather than merely shifting a burden.

Two limits carry all of the practical weight.

**Scope.** Consent is to a publication, not to a subject. It depends on the surrounding
circumstances and may be limited to publication at a particular time or to particular people. A
defendant who exceeds the scope of the consent given loses the protection for the excess.

**Implication from conduct.** Consent need not be written. A party "who submits his or her
conduct to investigation, knowing the results of the investigation will be published, consents to
that publication."

## Implies for Dialecta

- **That last sentence describes Dialecta's comment flow almost exactly.** A contributor writes a
  comment knowing it will be analysed by the classification engine and knowing the resulting tier
  will be published. On the Restatement's own example that is consent to the publication of the
  result. This is the strongest thing consent does for the platform, and it operates whether or
  not anyone signs anything.
- **Consent scales with how predictable the published statement is, and that is the finding that
  should drive drafting.** A tier drawn from a closed list of seven published names is highly
  predictable, so consent to it is easy to establish. A commenter message is free text a model
  writes, whose content neither party knows in advance, so consent covers it least well. The
  ordering of exposure across the surfaces is therefore the inverse of the ordering of
  predictability.
- **Consent does not extend to a label applied outside the rubric.** Agreeing that the platform
  may classify is not agreeing that it may classify wrongly. The consent defence and the accuracy
  of the engine are the same question wearing different clothes, which is why it cannot be
  drafted around.
- **The Pact is a better instrument for this than terms of service, and the platform already
  built it.** It is an affirmative act with a recorded name; the live `profiles` table carries
  `pact_signed_name` per root `CLAUDE.md`. Nguyen v. Barnes and Noble, which is binding in the
  Ninth Circuit, is about the failure of passive notice, and the Pact is the opposite of passive
  notice by design.
- **Third parties are not bound by it, and that is the hole.** An article author, or a person
  named inside someone else's comment, never signed anything. Consent protects the platform only
  against the person who gave it.
- Not legal advice. What would need counsel: whether Arizona follows Section 583 and on what
  terms, and whether consent obtained through a Pact drafted as a statement of shared values can
  carry legal effect at all when nothing in it reads like a contract. Both questions are
  answerable in an hour and neither is answerable here.

*Filed 2026-09-20*
