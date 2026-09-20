# Standing positions

*First sprint filed 2026-09-20: twenty-one sources read, twenty-one notes in `research/`, five positions
in `positions/`. Nothing here has been argued in council yet, so every row is a starting point
rather than a tested one.*

**Corrected 2026-09-20, later the same day.** Dan said in session "We live in Arizona". The first
pass of this file assumed a Connecticut operator, which came from `.claude/agents/legal.md` line
30 and from this advisor's reading list rather than from anything in the repository. Every row
that turned on the state or the circuit is corrected below, and the corrections are marked. The
Connecticut research is kept as comparative rather than deleted, because most of the twenty state
privacy statutes are drafted from the same model.

**Second-pass note, same day, on how this file's own correction got written.** This seat returned
to file the same correction independently, using its own research
(`research/2026-az-no-comprehensive-privacy-law.md`, `research/2026-az-breach-notification-18-552.md`,
`research/1991-az-yetman-v-english-opinion-privilege.md`, `research/2026-az-anti-slapp-12-751.md`,
`research/2008-ca9-roommates-com-material-contribution.md`), and found this file, every position
file, and five research notes above already corrected by a process this seat cannot identify from
inside the repository. Before extending it, this seat independently verified the load-bearing new
citations rather than assume good faith: Turner v. Devlin, 174 Ariz. 201 (1993), Doe 1 v. Meta,
2026 WL 1144707 (9th Cir. Apr. 28, 2026), and Restatement Section 583's consent rule are all real
and accurately characterised. Arizona SB 1815 is confirmed dead in committee rather than merely
unpassed. Two things were not: `positions/2026-09-20-tier-label-first-party-speech.md`'s framing
that Dialecta's Ninth Circuit establishment settles which circuit's law governs a future suit, and
its anti-SLAPP finding's silence on a live constitutional challenge to the 2022 amendment. Both
are corrected in that file's own addendum rather than here. Treat this file's confidence as
real but layered: independently reached and independently checked, not merely inherited twice.
This collision, not only the original Connecticut premise, is what this seat's systemic finding
is about; see `exchange/open/2026-09-20-legal-05-blindspot-a-second-tree-corrected-itself.md`, and
its companion from the other tree's own side,
`exchange/open/2026-09-20-legal-04-blindspot-wrong-jurisdiction-in-three-trees.md`.

*This advisor is not counsel and nothing in this file is legal advice. Every row cites a source
that was read, and a row that needs a lawyer says so rather than guessing.*

## Section 230 and what the platform publishes

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Section 230 does not shield the tier badge, the commenter message, or the Breach notice. They are Dialecta's own words, and 230(f)(3) reaches anyone responsible "in whole or in part" for creating information | High | `research/2026-usc-section-230-text.md`, `research/2024-crs-section-230-overview.md`, `research/2014-dmlp-publishing-others-content.md` | 2026-09-20 |
| Losing that shield is a defence-cost exposure, not a judgment exposure. Section 230 ends a case at the pleadings; without it an ordinary claim survives to discovery and has to be won on the merits | Medium | `positions/2026-09-20-tier-label-first-party-speech.md` | 2026-09-20 |
| **Corrected.** The theory that running the classifier is itself first-party expressive activity is weak in Dialecta's actual forum. Doe 1 v. Meta (9th Cir. Apr. 2026) upheld 230 for algorithmic recommendation, distinguished Anderson and cited Dyroff approvingly | Medium-high | `research/2026-ca9-doe-v-meta.md`. Read at second hand through Eric Goldman; the slip opinion is the top reading-list item | 2026-09-20 |
| The theory that the *authored label* is outside 230 survives that correction untouched, and it was always the stronger one. Doe 1 v. Meta is about arranging others' content, not about publishing a sentence the platform wrote | High | `research/2024-crs-section-230-overview.md`, `research/2026-ca9-doe-v-meta.md` | 2026-09-20 |
| Roommates.com is binding Ninth Circuit law, en banc, and its material contribution test bears on Stage 2 self-declaration and the Contrast Strip, where the platform structures what a contributor says about themselves | Medium | `research/2024-crs-section-230-overview.md`, `research/2014-dmlp-cda-immunity.md`. Roommates itself is a `todo` lead | 2026-09-20 |
| Human review of a label does not recover Section 230. It is more authorship, not less. Under GDPR Article 22 it is a safeguard; here it is an aggravator | High | `research/2026-usc-section-230-text.md`, `council/security/research/2016-gdpr-automated-decision-making.md` | 2026-09-20 |

## Defamation, and why the badge is probably not actionable

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| The badge is unlikely to be actionable, and two independent defences sit under it: the basis is published beside it, so no undisclosed fact is implied, and the contributor consented to the publication after being shown what it would be | Medium-high, raised from Medium | `research/1990-scotus-milkovich-v-lorain-journal.md`, `research/1977-restatement-583-consent-to-defamation.md`, `positions/2026-09-20-consent-waiver-and-the-pact.md` | 2026-09-20 |
| **A disclaimer is worth close to nothing.** Milkovich holds there is no privilege for anything labelled opinion, because the label does not dispel the factual implication. What works is publishing the basis, which is a build constraint rather than a sentence | High | `research/1990-scotus-milkovich-v-lorain-journal.md` | 2026-09-20 |
| **Consent to publication is a complete defence and fits this platform unusually well.** A contributor who submits a comment knowing it will be analysed and the result published has consented on the doctrine's own example | Medium-high | `research/1977-restatement-583-consent-to-defamation.md`. Read through a California jury instruction; needs an Arizona source | 2026-09-20 |
| Consent scales with how predictable the published statement is. The tier badge is highly consentable; the model-authored commenter message is the least consentable thing on the platform, because nobody can describe it in advance | Medium | `positions/2026-09-20-consent-waiver-and-the-pact.md` | 2026-09-20 |
| **The Pact is a better consent instrument than terms of service, and it already exists.** Affirmative act, recorded name in `pact_signed_name`, and it teaches all seven tiers and makes the reader classify three comments before asking for the commitment | Medium-high | `components/dialecta-pact.html` section VIII, `research/2014-ca9-nguyen-v-barnes-noble.md` | 2026-09-20 |
| **Do not draft a waiver of defamation claims.** A prospective release adds little where consent already works, fails where consent fails, and says the opposite of what the platform says it is | Medium | `positions/2026-09-20-consent-waiver-and-the-pact.md` | 2026-09-20 |
| **The consent moments mostly already exist, and were built for philosophical reasons.** The article pre-publish pause, Stage 2's blocking tier selection, and the Pact's practice classifications are moment-in-time sign-offs already specced. What is missing is four sentences and one append-only table | Medium-high | `positions/2026-09-20-consent-at-the-moment.md`, `docs/Dialecta_Article_Editorial_Template.md`, `docs/Dialecta_Discourse_Layer_UX.md` | 2026-09-20 |
| **Transparency and defensibility point the same way here, which is unusual.** Consent turns on what was shown at the moment it mattered and Milkovich turns on the basis being disclosed, so plain language beats legal register on both counts | Medium-high | `research/1977-restatement-583-consent-to-defamation.md`, `research/1990-scotus-milkovich-v-lorain-journal.md` | 2026-09-20 |
| **A sign-off when a contributor applies an AI suggestion protects a different thing: authorship, not consent.** Governed by Roommates.com, binding here. Harmless today because `aesthetic-suggest` cannot touch content, and the record is only cheap to build while that is still true | Medium-high | `research/2008-ca9-roommates-material-contribution.md`, `exchange/open/2026-09-19-005` | 2026-09-20 |
| Stage 2 is structurally the Roommates questionnaire, a mandatory choice from a platform-authored menu as a condition of posting, and it survives because the test is material contribution to *unlawfulness* and selecting a tier is not unlawful. Opinion mapping is where that could stop being true | Medium | `research/2008-ca9-roommates-material-contribution.md`, `docs/Dialecta_Discourse_Layer_UX.md` Stage 2 | 2026-09-20 |
| **A consent that cannot be proved is one the platform does not have.** Each sign-off must store which version of the shown text the person saw, and that column is the one usually omitted and the only one that cannot be reconstructed | High | `positions/2026-09-20-consent-at-the-moment.md` | 2026-09-20 |
| **Breach admits no sign-off and never will.** Every other surface gets stronger from moment-in-time consent and that one gets nothing, because the contributor did not choose | High | `positions/2026-09-20-consent-at-the-moment.md`, `docs/Dialecta_Discourse_Layer_UX.md` line 113 | 2026-09-20 |
| The permanent Contrast Strip and the Breach notice are the two surfaces where the disclosed-basis defence stops holding. The strip says something about a person that no reader can verify; the Breach notice characterises text it withholds | Medium | `docs/Dialecta_Discourse_Layer_UX.md` lines 109 and 113, `research/1990-scotus-milkovich-v-lorain-journal.md` | 2026-09-20 |
| **Corrected.** Arizona's anti-SLAPP does not restore the cheap early exit, although it looked as though it would. A.R.S. Section 12-751 kept a motive test most states dropped, and a plaintiff who wants damages is not substantially motivated by a desire to deter speech | Medium-high | `research/2022-az-ars-12-751-anti-slapp.md` | 2026-09-20 |

## Privacy

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| **Corrected. Arizona has no comprehensive consumer privacy law and never has.** Two 2026 bills died. There is no home-state controller duty, no mandated privacy notice, no profiling provision and no sensitive data trigger | High | `research/2026-az-no-comprehensive-privacy-law.md` | 2026-09-20 |
| ~~Dialecta is probably already in CTDPA scope.~~ **Void.** The CTDPA reaches persons conducting business in Connecticut or targeting its residents, and a publicly readable website does not target a state | High | `research/2026-az-no-comprehensive-privacy-law.md` | 2026-09-20 |
| The six pillars and the archetype are not sensitive data. The Connecticut list is closed and they are on none of it, and most of the twenty state statutes copy that list, so the finding travels to the states readers live in | High for Connecticut, Medium as a generalisation | `research/2025-ct-public-act-25-113.md` | 2026-09-20 |
| A tier badge is not a decision producing a legal or similarly significant effect, so no impact assessment and no statutory right to contest attaches. Same reasoning, same caveat: read from Connecticut's text, applied to a family of statutes drafted from it | High for Connecticut, Medium as a generalisation | `research/2025-ct-public-act-25-113.md` | 2026-09-20 |
| **The live privacy question has changed in kind.** It is no longer "does my state's law reach me" but "do any of the twenty states where readers live reach a site that does not target them". That is the next sprint | Unresolved | `research/2026-az-no-comprehensive-privacy-law.md` | 2026-09-20 |
| **Corrected.** Arizona breach notification is A.R.S. Section 18-552, not Connecticut's 36a-701b: forty-five days from determination, Attorney General only above a thousand individuals, and a "substantial economic loss" trigger that probably takes Dialecta's content data outside it while the credentials provision brings the auth surface back in | High | `research/2022-az-ars-18-552-breach-notification.md`. `security`'s tree has the wrong state filed | 2026-09-20 |
| **Accept the privacy risk rather than spend on it.** No home-state statute, fourteen members, no data sold. Write a privacy notice because publishing one is good practice and because FTC Act Section 5 makes it binding, then stop | High | `research/2026-az-no-comprehensive-privacy-law.md` | 2026-09-20 |

## Threats, images, sign-up

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| No US law requires Dialecta to report a credible threat. The Breach routing rule is owed to the person being threatened, not to a regulator | Medium | `research/2026-vandort-reporting-gap.md`. A student post supporting a negative claim; wants a second source | 2026-09-20 |
| Breach is not a finding of a true threat and the copy must never drift toward saying so. "Harassment", "abusive" and "threatening" are words with legal contours; "targets a person, not an idea" is not | High | `research/2023-scotus-counterman-v-colorado.md`, `docs/Dialecta_Discourse_Layer_UX.md` line 113 | 2026-09-20 |
| 18 U.S.C. Section 2258A attaches the day any surface accepts an uploaded image, with penalties that do not shrink for a one person operator. It does not attach today | High | `research/2026-usc-2258a-csam-reporting.md` | 2026-09-20 |
| **Strengthened by the correction.** A footer link to terms does not bind, and Nguyen v. Barnes and Noble is binding in Arizona's circuit rather than merely persuasive. The P0-4 sign-up screen needs an affirmative act, and the Pact is the one to use | High | `research/2014-ca9-nguyen-v-barnes-noble.md` | 2026-09-20 |
| On P0-D2: open sign-up, conditional on terms taken by affirmative act, the basis shipping beside every label in A-5, and a written Breach routing rule. Stronger than when written, because the Connecticut argument was the only one favouring invite-only and it is now void | Medium-high, raised from Medium | `positions/2026-09-19-p0-d2-login-methods.md`. Flips to invite-only if any image upload lands in the same phase | 2026-09-20 |
| The classifier prompt in `api/classify.js` is where the platform's published characterisations are actually written, and no gate reads it | High | `exchange/open/2026-09-19-003-blindspot-voice-gate-never-reads-prompts.md` | 2026-09-20 |
| **A wrong jurisdiction propagated through three agent trees before anyone checked it.** The practice this seat takes from it: state the operator's jurisdiction as a citable fact in the first note of any sprint, and treat an inherited one as a lead to verify | High | This correction, and `.claude/agents/legal.md` line 30 | 2026-09-20 |
