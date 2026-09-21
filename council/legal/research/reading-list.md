# Reading list

**Verified, not seeded.** Every source below was fetched and read on 2026-09-20 before it was
listed. That is unusual for a first sprint: read these rather than re-finding them, and spend the
sprint on what they mean for Dialecta. Mark a row `dead` if it has moved or no longer says this.

Sources marked `(vendor)` have a commercial interest in the topic. Sources marked `(archived)` are
from the Digital Media Law Project at Harvard's Berkman Klein Center, which stopped updating in
2014; the mechanisms hold, the dollar figures do not.

Nothing here is legal advice and neither is anything this advisor writes from it.

States: `todo`, `filed`, `dead`.

## Correction, 2026-09-20

**Dialecta is operated from Arizona.** This list was built assuming Connecticut, as was
`.claude/agents/legal.md` line 30 and two notes in `council/security/research/`. Nothing in the
repository ever said Connecticut. The Connecticut rows below stay `filed` because they are
accurate about Connecticut and because most of the twenty state privacy statutes are drafted from
the same model, which makes them comparative. They are not this platform's home-state law.
Arizona has none. See `2026-az-no-comprehensive-privacy-law.md`.

Two consequences for how this list is read. The forum is the Ninth Circuit, not the Second, so
Dyroff, Roommates.com and Doe 1 v. Meta displace Force v. Facebook as the authorities that
matter. The privacy question becomes the states where readers live rather than the state where
the operator lives, which is a wider question than this list was built for.

**Stale-lead sweep, 2026-09-20, after Dan pointed out the correction had not reached the `todo`
rows.** The first pass marked the Connecticut rows it had *read* as `filed` and left the
Connecticut rows it had *not yet read* as `todo`, including two leads this advisor added itself
at the end of the first sprint. Three are now `dead` with reasons, and two more had descriptions
that were false rather than stale: Force v. Facebook was labelled the controlling forum
authority, and the IAPP tracker was labelled background when it is now the whole privacy
question. **The practice: when a premise changes, sweep the unread rows in the same pass as the
read ones.** A correction that only reaches the work already done leaves the error waiting for
the next session.

## Arizona, the home jurisdiction

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | A.R.S. Section 12-751, anti-SLAPP, https://www.azleg.gov/ars/12/00751.htm | The motive test that decides whether the platform has any early exit from a defamation suit at all |
| filed | A.R.S. Section 18-552, breach notification, https://www.azleg.gov/ars/18/00552.htm | The real breach clock and the substantial economic loss trigger. `security` has Connecticut filed |
| filed | MultiState, 20 state privacy laws in effect in 2026, https://www.multistate.us/insider/2026/2/4/all-of-the-comprehensive-privacy-laws-that-take-effect-in-2026 | Establishes the negative: Arizona is not on the list |
| todo | Arizona State Law Journal, "SLAPPing Down Meritless Claims: Arizona's Anti-SLAPP Expansion", 2025-11-09, https://arizonastatelawjournal.org/2025/11/09/slapping-down-meritless-claims-arizonas-anti-slapp-expansion-questionable-constitutionality-and-the-continued-need-for-judicial-interpretation/ | Whether any Arizona court has applied the amended statute to a publisher. Moves the anti-SLAPP note from statutory reading to prediction |
| todo | Turner v. Devlin, 174 Ariz. 201 (1993), and Yetman v. English, 168 Ariz. 71 (1991), https://law.justia.com/cases/arizona/supreme-court/1993/cv-91-0365-pr-2.html | Arizona's opinion doctrine in the original. The disclosed-basis defence for the tier badge is state law and currently rests on a Supreme Court case plus a search summary |
| todo | State Bar of Arizona civil jury instructions, defamation, https://www.azbar.org/media/p0onmoso/defamation-2015.pdf | The elements as Arizona actually charges them, including whether Arizona follows Restatement Section 583 on consent |
| todo | Doe 1 v. Meta Platforms, Inc., 2026 WL 1144707 (9th Cir. Apr. 28, 2026), slip opinion | Read at second hand through Eric Goldman. The single highest value unread item in this tree, because it is the home circuit five months ago |
| todo | Dyroff v. Ultimate Software Grp., 934 F.3d 1093 (9th Cir. 2019) | Binding here. Cited this sprint only through two CRS reports |

## Section 230, and the question that makes this seat exist

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | 47 U.S.C. § 230, Cornell LII, https://www.law.cornell.edu/uscode/text/47/230 | The operative text, including the 230(f)(3) test: responsible "in whole or in part, for the creation or development of" information. That clause is where a tier label lands or does not |
| filed | Section 230: An Overview, CRS Report R46751, updated 2024-01-04, https://www.everycrsreport.com/files/2024-01-04_R46751_9fa55d4913ef4d0ce4a81cb34dedf3333782a277.html | **Start here.** It states directly that a claim based on the content of a label a website adds to third-party content is not barred by 230(c)(1). That is Dialecta's tier badge, described by a nonpartisan federal source |
| filed | Anderson v. TikTok, 3rd Cir. No. 22-3061, decided 2024-08-27, https://en.wikipedia.org/wiki/Anderson_v._TikTok | The closest appellate reasoning to Dialecta's classifier: a platform's own algorithmic output treated as first-party expressive activity outside 230. Slip opinion read in full on 2026-09-20 from https://www2.ca3.uscourts.gov/opinarch/223061p.pdf. Footnote 13 lists seven circuits that went the other way, the Second among them |
| filed | Liability for Algorithmic Recommendations, CRS Report R47753, 2023-10-12, https://www.everycrsreport.com/reports/R47753.html | Where courts have treated algorithmic sorting as protected publisher activity. The case for the other side of the question above |
| filed | Section 230 issue page, EFF, https://www.eff.org/issues/cda230 | The argument that 230 covers moderation choices on small comment sections, not only large platforms |

## Defamation, and labelling as the platform's own speech

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Publishing the Statements and Content of Others, DMLP Harvard (archived), https://www.dmlp.org/legal-guide/publishing-statements-and-content-others | States the mechanism plainly: add your own commentary to user content and you are shielded only for the user's material, not your own. Written for exactly this structure |
| filed | Immunity for Online Publishers Under the CDA, DMLP Harvard (archived), https://www.dmlp.org/legal-guide/immunity-online-publishers-under-communications-decency-act | The information content provider test, and how courts handle jointly created content |

## Harassment, threats, and duty to act

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Counterman v. Colorado, 600 U.S. 66, decided 2023-06-27, https://www.law.cornell.edu/supremecourt/text/22-138 | The current constitutional line for a true threat. Bears on what the Breach tier is actually naming |
| filed | Closing the Reporting Gap, Minnesota Journal of Law Science and Technology, Van Dort, 2026-03-24, https://journals.law.umn.edu/mjlst/2026/03/24/closing-the-reporting-gap-building-a-legal-framework-for-reporting-serious-online-threats | States plainly that no US law requires a platform operator to report a credible threat, and walks the voluntary emergency-disclosure route if Dialecta chose to |
| filed | 18 U.S.C. § 2258A, Cornell LII, https://www.law.cornell.edu/uscode/text/18/2258A | The one mandatory reporting duty regardless of platform size, for apparent CSAM. Relevant the day comments accept images |

## Privacy, and whether a fingerprint is sensitive data

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Public Act 25-113 (Substitute S.B. 1295), enrolled text, Connecticut General Assembly, https://www.cga.ct.gov/2025/act/pa/pdf/2025PA-00113-R00SB-01295-PA.pdf | Added during the 2026-09-20 sprint. The primary text the two secondary Connecticut sources summarise. Holds the closed sensitive data list, the profiling definition, and the narrowed "legal or similarly significant effect" that decides whether a tier badge carries any duty |
| filed | The Connecticut Data Privacy Act, CT Office of the Attorney General, https://portal.ct.gov/ag/sections/privacy/the-connecticut-data-privacy-act | ~~The home-state statute.~~ **Not the home state.** Kept as the best-read example of the model most of the twenty state statutes follow |
| filed | Major Changes to Connecticut's Consumer Privacy Law Effective 2026-07-01, Wiley Rein LLP, 2026-04-27, https://www.wiley.law/alert-Major-Changes-to-Connecticut-Consumer-Privacy-Law-Will-Take-Effect-July-1-2026 | **Read second.** The 2026 amendment drops the volume threshold entirely for anyone processing a Connecticut resident's sensitive data. It is already in force. Whether the six pillars and the archetype are sensitive data decides whether Dialecta is in scope at 14 users |
| todo | CCPA and CPRA FAQ, California Privacy Protection Agency, https://cppa.ca.gov/faq.html | The regulator's own thresholds, and its definition of inferences about a consumer's characteristics |
| todo | CCPA updates: cybersecurity audits, risk assessments, ADMT, approved 2025-09-22, effective 2026-01-01, https://cppa.ca.gov/regulations/ccpa_updates.html | California's profiling and automated decisionmaking rules, the closest US regulatory analogue to a public per-user fingerprint |
| todo | GDPR Art. 3, territorial scope, https://gdpr-info.eu/art-3-gdpr/ | The two tests that decide whether EU readers pull Dialecta in. A practitioner mirror, so cross-check anything load bearing against EUR-Lex |
| todo | GDPR Art. 9, special categories, https://gdpr-info.eu/art-9-gdpr/ | The exhaustive list, to check an argument-style fingerprint against rather than assuming the higher bar applies |
| todo | GDPR Art. 22, automated decision-making and profiling, https://gdpr-info.eu/art-22-gdpr/ | The right to contest a solely automated classification, and the human-review safeguard. Stage 2.5 may already be that safeguard, or may not |
| todo | US State Privacy Legislation Tracker, IAPP, https://iapp.org/resources/article/us-state-privacy-legislation-tracker | **Promoted 2026-09-20.** Twenty states, per MultiState. With no home-state statute this is no longer background: it is the whole privacy question. Which of the twenty reaches a site that does not target its residents |
| dead | Reporting a Data Breach, CT Office of the Attorney General, https://portal.ct.gov/ag/sections/privacy/reporting-a-data-breach | **Dead 2026-09-20: wrong state.** Conn. Gen. Stat. Section 36a-701b does not reach an Arizona operator. Superseded by `2022-az-ars-18-552-breach-notification.md`, which is a shorter clock (45 days from determination, not 60 from discovery) and a higher AG threshold |

## Terms and privacy policy

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Nguyen v. Barnes & Noble, 763 F.3d 1171 (9th Cir. 2014), https://en.wikipedia.org/wiki/Nguyen_v._Barnes_%26_Noble,_Inc. | Why a terms link alone, without an affirmative click, may not be enforceable. Bears on the sign-up flow in P0-D2 |
| filed | Privacy and Security business guidance, FTC, https://www.ftc.gov/business-guidance/privacy-security | Whatever a privacy policy promises must be honoured under FTC Act Section 5. The baseline risk of posting one at all. `2026-ftc-privacy-security-guidance.md`, 2026-09-21 |
| filed | Terms of Use, DMLP Harvard (archived), http://www.dmlp.org/legal-guide/terms-use | What a small site's terms should cover, written for this scale of operator. Thinner than the row promised: no browsewrap, liability, forum or modification guidance. `2014-dmlp-terms-of-use.md`, 2026-09-21 |

## Insurance

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| todo | Cyber Insurance for small business, FTC, https://www.ftc.gov/business-guidance/small-businesses/cybersecurity/cyber-insurance | Unbiased first-party against third-party breakdown, and the questions to put to an agent |
| todo | Media Liability Insurance, DMLP Harvard (archived), https://www.dmlp.org/legal-guide/media-liability-insurance | What a media policy defends: defamation, privacy invasion, IP. Terms worth negotiating. Dollar figures are 2014 and dead |
| todo | Media and Advertising Liability cost (vendor), Insureon, https://www.insureon.com/media-business-insurance/cost | One indicative number, around $180 a month for a small publisher. A first budget line, not a rate card, from a broker with an interest in the sale |

## DMCA

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | DMCA Directory FAQs, US Copyright Office, https://www.copyright.gov/dmca-directory/faq.html | Designated agent registration is six dollars, expires every three years, and each legal entity needs its own. The cheapest item on any list this advisor will ever write. **It also publishes the provider's street address**, which the row never said. `2026-usco-dmca-directory-faq.md`, 2026-09-21 |
| filed | Section 512 resources, US Copyright Office, https://www.copyright.gov/512/ | The official notice and takedown walkthrough, including the reinstatement window. `2020-usco-section-512-resources.md`, 2026-09-21 |
| filed | DMCA Safe Harbor, Copyright Alliance, https://copyrightalliance.org/education/copyright-law-explained/the-digital-millennium-copyright-act-dmca/dmca-safe-harbor/ | A second summary to cross-check the Copyright Office's own language. A rightsholder trade association, so its framing leans away from platforms. `2026-copyright-alliance-dmca-safe-harbor.md`, 2026-09-21 |

## Terms drafting, added and filed 2026-09-21

Read while drafting `drafts/`. Each came from a clause that turned on it.

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Berman v. Freedom Financial Network, 30 F.4th 849 (9th Cir. 2022), slip opinion, https://cdn.ca9.uscourts.gov/datastore/opinions/2022/04/05/20-16900.pdf | The act must say it accepts, and the link must be set apart by more than an underline. `2022-ca9-berman-v-freedom-financial.md` |
| filed | Cal. Bus. and Prof. Code 22575 and 22577 (CalOPPA), primary | A privacy policy owed at any size, with a Do Not Track answer. `2026-ca-bpc-22575-caloppa.md` |
| filed | Cal. Bus. and Prof. Code 17602, primary | The renewal consent, from the code text rather than a firm's alert. Addendum to `2025-ca-auto-renewal-law-ab-2863.md` |
| filed | FTC, Complying with COPPA: FAQs, updated 2025-04-22, https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions | The under-13 duty and why a terms clause is no defence. `2025-ftc-coppa-faq.md` |
| filed | AAA Consumer Arbitration Rules, effective 2025-05-01, and the consumer fee schedule at second hand | What an arbitration clause would cost the business. `2025-aaa-consumer-arbitration-rules.md` |
| filed | Blair v. Rent-A-Center, 928 F.3d 819 (9th Cir. 2019), at second hand | California's public-injunction rule and arbitration. `2019-ca9-blair-v-rent-a-center.md` |
| filed | Anthropic Commercial Terms and API retention page (vendor) | What the classifier's provider keeps, and may not train on. `2026-anthropic-commercial-terms-and-api-retention.md` |
| filed | BillTrack50 on Arizona HB 2991 (a tracking service) | No Arizona minors' social media law in force. `2026-az-hb-2991-minors-social-media.md` |
| todo | Blair v. Rent-A-Center, slip opinion, https://cdn.ca9.uscourts.gov/datastore/opinions/2019/06/28/17-17221.pdf | Read at second hand only. Matters only if arbitration is ever added |
| todo | The AAA 2025 Consumer Fee Schedule itself, at adr.org | The fee figures in the arbitration note came from search summaries and need checking against the schedule |
| todo | Asset Marketing Systems v. Gagnon, 542 F.3d 748 (9th Cir. 2008) | Whether an implied or express licence can be revoked. The permanence licence rests on the answer |
| todo | 17 U.S.C. 512, statute text, Cornell LII, https://www.law.cornell.edu/uscode/text/17/512 | The Copyright section was drafted from the Copyright Office's summary; check it against the statute |
| todo | Anthropic, data retention for Covered Models, https://support.claude.com/en/articles/15425996-data-retention-practices-for-covered-models | Whether the model the classifier uses is one, and what that changes in the notice |

## Known gaps opened by the 2026-09-20 jurisdiction correction

1. **The Yetman v. English slip opinion, read in full.** `1991-az-yetman-v-english-opinion-privilege.md`
   relies on secondary summaries because Justia returned a 403 and CourtListener served only a
   truncated extract on this attempt. The State Bar of Arizona's RAJI defamation instructions PDF
   was fetched and saved but arrived as unparsed binary; a PDF-capable read, not WebFetch, would
   close this.
2. **Whether Connecticut has an anti-SLAPP statute of its own, and how it compares.** It does,
   Conn. Gen. Stat. Section 52-196a, and this tree never researched it even while every position
   was framed around Connecticut. That gap predates and is independent of the jurisdiction error;
   naming it here rather than quietly filing it away is the point.
3. **Personal jurisdiction and venue for a hypothetical suit against Dan or Dialecta.** Neither
   Arizona's forum nor Connecticut's follows automatically from where Dan lives or where a
   contributor lives; defamation venue can follow the plaintiff's domicile under an effects-based
   theory. Nothing in this tree resolves which circuit's law would actually govern a given future
   suit, and the correction to `positions/2026-09-20-tier-label-first-party-speech.md` says so
   directly rather than picking a circuit by default.
4. **SB 1815, if it moves.** Unenacted as of this reading. A docket check belongs in whichever
   sprint next touches Arizona privacy law, not a guess now.

## Known gaps in this list

These were searched for and not found. Do not assume they do not exist; assume one pass failed.

1. **A platform's exposure once it knows about an ongoing harassment campaign** against a named
   person. The baseline and the CSAM exception are sourced; the distributor-liability question
   between them is not. The FBI Threat and Intimidation Guide and PEN America's Online Harassment
   Field Manual both refused the fetch, so neither is listed.
2. **A non-vendor terms of service template** for a comment-hosting platform. Everything findable
   at this scale is generator marketing.
3. **A neutral current insurance cost figure.** The one number here comes from a broker, and the
   neutral source is eleven years stale.
4. **GDPR text from EUR-Lex itself** rather than a practitioner mirror.
5. ~~**Anything evaluating a six-pillar argument-style profile** against the sensitive data
   definitions.~~ Closed 2026-09-20. Done from the enrolled Public Act rather than found in a
   source, as this row predicted. The answer is at
   `council/legal/positions/2026-09-20-ctdpa-sensitive-data.md`.

## Arizona, added and filed 2026-09-20 after the jurisdiction correction

Dan lives in Arizona, not Connecticut, since roughly July 2026; record `2026-09-20-security-04`
from `security` named the gap this seat owed. Sourced the same day, same discipline as the rest of
this list: primary text where it was reachable, secondary convergence marked as such where it was
not.

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| filed | Four 2026 state privacy-law trackers (vendor, marked as such), cross-checked against the Arizona Legislature's bill tracker | Confirms Arizona has no comprehensive consumer privacy act in force and no second regime rides in on the relocation. `2026-az-no-comprehensive-privacy-law.md` |
| filed | A.R.S. Section 18-552, primary, https://www.azleg.gov/ars/18/00552.htm; AZ Attorney General Data Breach FAQ, https://www.azag.gov/consumer/data-breach/faq | Arizona's own breach notification law, now owed in its own right rather than by comparison to Connecticut's. `2026-az-breach-notification-18-552.md` |
| filed | Yetman v. English, 168 Ariz. 71 (1991) | Arizona's controlling fact/opinion line for defamation, the state-law question legal-02's question one turns on. Read via secondary summaries only; upgrade to primary text is a named gap below. `1991-az-yetman-v-english-opinion-privilege.md` |
| filed | A.R.S. Sections 12-751 and 12-752, primary for 12-751, https://www.azleg.gov/ars/12/00751.htm; secondary convergence for 12-752 | Arizona's 2022-expanded anti-SLAPP statute, a faster and previously unresearched early-dismissal route for the tier-badge exposure. `2026-az-anti-slapp-12-751.md` |

## Already filed by another advisor

`security` filed four sources this tree would otherwise duplicate. Read those before re-fetching:
`council/security/research/2016-eu-gdpr-territorial-scope.md`,
`2016-gdpr-automated-decision-making.md`, `2023-ct-data-privacy-act.md` and
`2023-ct-data-minimization-retention.md`. The GDPR Art. 3 and Art. 22 rows below stay `todo` only
because this seat reads them for a different question: not whether a control exists, but whether
it is owed.

## New leads, found while reading

Added 2026-09-20. Each came out of a source filed this sprint.

| State | Source | Why this advisor needs it |
| --- | --- | --- |
| todo | Moody v. NetChoice, LLC, 603 U.S. 707 (2024), https://www.supremecourt.gov/opinions/23pdf/22-277_d18f.pdf | The decision Anderson is built on, read at second hand this sprint through the Third Circuit's quotations. It is the source of "sometimes added warnings or labels", which is the closest any court has come to describing the tier badge |
| todo | Force v. Facebook, Inc., 934 F.3d 53 (2d Cir. 2019) | ~~The controlling authority for Dialecta's own forum.~~ **Corrected 2026-09-20: the forum is the Ninth Circuit.** Demoted to background on the circuit split. The rows that replaced it are Doe 1 v. Meta and Dyroff in the Arizona section above |
| todo | Maffick, LLC v. Facebook, Inc., No. 20-05222 (N.D. Cal. Sept. 3, 2020) | The only case this tree has found where a platform's own label on user content was litigated. Cited by CRS only with a "cf.", so read it before repeating what it stands for |
| filed | Fair Housing Council v. Roommates.com, LLC, 521 F.3d 1157 (9th Cir. 2008) (en banc), https://cdn.ca9.uscourts.gov/datastore/opinions/2008/04/02/0456916.pdf | The material contribution test in the original. Bears on Stage 2 self-declaration, where the platform structures what a contributor says about themselves. **Filed 2026-09-20 for a second reason found later: it is now the controlling-circuit replacement for Anderson v. TikTok**, because Arizona sits in the Ninth Circuit and Connecticut does not. `2008-ca9-roommates-com-material-contribution.md` |
| todo | 18 U.S.C. Section 2702(b)(8), the Stored Communications Act emergency disclosure exception, https://www.law.cornell.edu/uscode/text/18/2702 | The statutory text of the voluntary route Van Dort describes at second hand. The Breach routing rule should be written to this wording, not to a summary of it |
| dead | Connecticut defamation elements and the opinion privilege, from the Connecticut Bar Association or a Connecticut firm | **Dead 2026-09-20: wrong state.** Added as a lead in the first pass, before the jurisdiction was known. The live version is two rows in the Arizona section above: Turner v. Devlin and Yetman v. English, plus the State Bar of Arizona defamation instructions. Still the largest unsourced load in this tree, now pointed at the right state |
| dead | Conn. Gen. Stat. Section 42-520 as amended by P.A. 25-113, consent for sensitive data processing | **Dead 2026-09-20: the statute does not apply and the question it was asked for has moved.** Whether the Pact can supply consent is now a defamation question under Restatement Section 583, not a privacy-statute question, and it is covered by the State Bar of Arizona row above. See `positions/2026-09-20-consent-waiver-and-the-pact.md` |
