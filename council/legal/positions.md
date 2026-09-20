# Standing positions

*First sprint filed 2026-09-20: fourteen sources read, fourteen notes in `research/`, three
positions in `positions/`. Nothing here has been argued in council yet, so every row is a
starting point rather than a tested one.*

*This advisor is not counsel and nothing in this file is legal advice. Every row cites a source
that was read, and a row that needs a lawyer says so rather than guessing.*

| Position | Confidence | Evidence | Last changed |
| --- | --- | --- | --- |
| Section 230 does not shield the tier badge, the commenter message, or the Breach notice. They are Dialecta's own words, and 230(f)(3) reaches anyone responsible "in whole or in part" for creating information | High | `research/2026-usc-section-230-text.md`, `research/2024-crs-section-230-overview.md`, `research/2014-dmlp-publishing-others-content.md` | 2026-09-20 |
| Losing that shield is a defence-cost exposure, not a judgment exposure. Section 230 ends a case at the pleadings; without it an ordinary claim survives to discovery and has to be won on the merits | Medium | `positions/2026-09-20-tier-label-first-party-speech.md` | 2026-09-20 |
| The badge is nonetheless unlikely to be actionable, because the AI Classification Card publishes its basis beside it and the reader can check the platform's work | Medium | `docs/Dialecta_Classification_Engine_Specification.md` lines 147 to 157, 186. Needs a Connecticut lawyer on the opinion privilege; currently the largest unsourced load in this tree | 2026-09-20 |
| The permanent Contrast Strip and the public archetype are the two surfaces where that stops holding, because both say something about a person that a reader cannot verify from the page | Medium | `docs/Dialecta_Discourse_Layer_UX.md` line 109, `docs/Dialecta_Contributor_Identity.md` lines 68 to 98 | 2026-09-20 |
| Human review of a label does not recover Section 230. It is more authorship, not less. Under GDPR Article 22 it is a safeguard; here it is an aggravator | High | `research/2026-usc-section-230-text.md`, `council/security/research/2016-gdpr-automated-decision-making.md` | 2026-09-20 |
| Anderson v. TikTok is the strongest case against the platform and it does not bind here. Dialecta sits in the Second Circuit, whose Force v. Facebook is on the list of decisions Anderson departs from | High | `research/2024-ca3-anderson-v-tiktok.md` footnote 13 | 2026-09-20 |
| The six pillars and the archetype are not sensitive data under the amended CTDPA. The list at Section 42-515(39) is closed and they are on none of it | High | `research/2025-ct-public-act-25-113.md` | 2026-09-20 |
| Dialecta is probably already in CTDPA scope anyway, through comment text rather than through the fingerprint, because the sensitive data trigger has no volume floor | Medium | `research/2025-ct-public-act-25-113.md`, `positions/2026-09-20-ctdpa-sensitive-data.md`. Turns on one lawyer question: whether a comment is publicly available information at the moment of processing | 2026-09-20 |
| No CTDPA impact assessment is owed for the classification engine, and no statutory right to contest a tier exists, because the 2026 act narrowed "legal or similarly significant effect" to seven enumerated denials and struck "access to essential goods or services" | High | `research/2025-ct-public-act-25-113.md` Sections 42-515(15), 42-518(a)(6), 42-522(c) | 2026-09-20 |
| **Accept the Connecticut risk rather than spend on it.** No private right of action, Attorney General enforcement only, 5,000 dollars per violation, fourteen members. Write the privacy notice and stop | High | `research/2026-ctag-ctdpa-enforcement.md` | 2026-09-20 |
| **Do not stop publishing tiers, and do not rename them.** The exposure is real, small and insurable, and the observational names are now an asset | Medium | `positions/2026-09-20-tier-label-first-party-speech.md` | 2026-09-20 |
| No US law requires Dialecta to report a credible threat. The Breach routing rule is owed to the person being threatened, not to a regulator | Medium | `research/2026-vandort-reporting-gap.md`. A student post supporting a negative claim; wants a second source | 2026-09-20 |
| Breach is not a finding of a true threat and the copy must never drift toward saying so. "Harassment", "abusive" and "threatening" are words with legal contours; "targets a person, not an idea" is not | High | `research/2023-scotus-counterman-v-colorado.md`, `docs/Dialecta_Discourse_Layer_UX.md` line 113 | 2026-09-20 |
| 18 U.S.C. Section 2258A attaches the day any surface accepts an uploaded image, with penalties that do not shrink for a one person operator. It does not attach today | High | `research/2026-usc-2258a-csam-reporting.md` | 2026-09-20 |
| A footer link to terms does not bind a user. The P0-4 sign-up screen needs an affirmative act and a stored timestamp | High | `research/2014-ca9-nguyen-v-barnes-noble.md` | 2026-09-20 |
| On P0-D2: open sign-up, conditional on terms taken by affirmative act, the basis shipping beside every label in A-5, and a written Breach routing rule. The liability case for invite-only is weaker than it looks, because 230 protects what open sign-up multiplies | Medium | `positions/2026-09-19-p0-d2-login-methods.md`. Flips to invite-only if any image upload lands in the same phase | 2026-09-20 |
| The classifier prompt in `api/classify.js` is where the platform's published characterisations are actually written, and no gate reads it | High | `exchange/open/2026-09-19-003-blindspot-voice-gate-never-reads-prompts.md` | 2026-09-20 |
