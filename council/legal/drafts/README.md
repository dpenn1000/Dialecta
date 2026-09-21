# The documents beside the Pact

*Cover note for Dan and the convener, 2026-09-21: `legal` is not counsel, nothing here is legal advice, and the drafts want a lawyer's review before anyone pays.*

Dan asked, 2026-09-21: "Can we get legal to draft up the more legal terms and conditions to go
alongside the pact?" Four drafts are in this folder:

| File | What it is |
| --- | --- |
| `terms-of-service.md` | The contract beside the Pact |
| `privacy-notice.md` | What is collected, who processes it, what is public |
| `membership-terms.md` | Price, ladder, renewal, cancellation, refunds, cohorts, gifts, and the checkout copy with the separate renewal consent |
| `README.md` | This note |

**Three decisions make the drafts complete:** who the operator legally is, with an address and a
monitored contact email; the founding price terms (the price, the trigger, and whether the lock is
absolute); and what closing an account does to a person's record. Everything else drops in.

**Free sign-up doesn't have to wait for the lawyer; money does.** Once the first group of build
items below exists and every bracket is resolved, the terms and the notice can go live for free
accounts as drafted. Unreviewed terms taken by an affirmative act beat the alternative, which is no
terms, and the exposure from publishing labels about members exists with or without them. The review is owed before the first dollar, because a
payment turns every promise in the Membership Terms into one Douglas v. Talk America holds Dan to.

Every bracket in the drafts is one of three things: a value Dan hasn't set (`[CONTACT EMAIL]`), a
choice between drop-in texts (`[CHOICE 2.5: ...]`), or a clause that stays out until a build item
exists (`[CONDITIONAL B5: ...]`). The drafts are written to be true of `apps/web` on the day they
take effect, not of the legacy Ghost site, which does things they don't describe (see What the site
cannot say today).

## The documents

| Document | Carries | Governs in a conflict | Accepted when | Record the acceptance writes |
| --- | --- | --- | --- | --- |
| The Pact | Informed consent to classification: the seven tiers, the process, the three practice classifications, and the ADR-004 visibility choice | Nothing legal. It describes how the platform works | At signing, § VIII | `pact_agreed_at`, `pact_version`, `pact_signed_name`, `signature_font`, plus one consent row (B2) |
| Terms of Service | The contract: permanence, joining, the licence, Dialecta's statements, conduct, removal, copyright, closure, liability, disputes, changes | Over the Pact, where the two cover the same ground | The same signing act, through one sentence beside it (`exchange/open/2026-09-21-legal-01`, item 2) | A consent row with the terms version (B2) |
| Privacy Notice | Disclosure, not a contract. Every sentence binds anyway, under FTC Act Section 5 as A.R.S. 44-1522(C) imports it | Nothing. It has to match the others | Never accepted. Linked from the signing sentence, the sign-in page and the footer, and dated | None needed. California requires the effective date on its face |
| Membership Terms | Everything about a membership | Over the Terms of Service, on a membership | At checkout, by "Agree and continue to payment" | A consent row with the membership version, the price and the term shown |
| Renewal consent | Express consent to automatic renewal, as its own act | Not applicable | The checkout checkbox, unticked by default, before any card field | A consent row with the exact text shown, kept at least three years and at least one year after the membership ends |

The Pact teaches, and the terms' licence is the same permission in contract form: to send what a
member writes to the classifier and publish the reading. One act accepts both, and it is the Pact's
signature, as the filed position on Nguyen has it. Berman v. Freedom Financial (9th Cir. 2022) adds
two build rules the filed position didn't have: the act has to say that it accepts the terms, and
the link has to be set apart by more than an underline (`research/2022-ca9-berman-v-freedom-financial.md`).
The Pact's current button, "I Understand · Enter", says neither, and the house style for links on
paper, ink with a brass underline, is the style Berman found insufficient.

**The Terms govern over the Pact, and the Pact gets fixed instead.** This is a new position. The
alternative, letting the Pact govern, would turn its broadest lines into contract terms: "Comments
are never hidden" would then override a valid copyright notice. The honest fix is seven sentences in
the Pact (`exchange/open/2026-09-21-legal-01`), after which the two documents don't disagree.

**Money needs two acts of its own.** The Pact cannot carry the renewal consent (standing position,
from California AB 2863), and the code text, read this session, now says so outright: Cal. Bus. and
Prof. Code 17602(a)(4) wants "express affirmative consent to the automatic renewal ... offer terms",
separately from consent to the agreement containing them.

## Choices for Dan

| Choice | Options | What it changes in the text | `legal`'s view |
| --- | --- | --- | --- |
| **2.6, the Underwriter price** | Any number, and a standard price for after the founding window | `[UNDERWRITER PRICE]` and `[STANDARD PRICE]` in Price, the checkout block, the checkbox label and three emails | No legal preference. The ladder is lawful at any number |
| **2.5, the price rise trigger** | A: a date. B: the hundredth member. C: whichever comes first | The Price paragraph; whether a hold clause ships (A and C); the ladder line at checkout; whether the page needs a live counter (B and C); whether Charter closes on the same trigger | **C, if the founding cohort keeps its cap of a hundred**, because it's the only trigger under which the founding price and the Charter badge land on the same people. A, if the cap goes. B is the weakest against New York's "how and when the price will change". Answered on `convener-04` |
| **L-15, the lock form** | A: "It will never rise." B: it holds, and if it ever has to change, notice before the renewal it applies to, and cancel with a refund of the unused part | One sentence in The founding price. Under B, the membership page's "Held at that number permanently. Ten years of membership costs $500" becomes untrue and has to change | **B.** It turns a promise Dan might one day break into one he can keep. Whether A is even enforceable as written is lawyer question 5 |
| **L-16, the Charter badge** (Dan's question) | A: granted at checkout, never removed, as the council preferred, with the second marker for underwriters who publish left unannounced and out of every document. B: granted when a Charter Underwriter has published a set number of articles within a window, never removed once granted | A: one paragraph. B: the Charter paragraph, the "includes" bullet, the checkout block (the condition must be on screen before payment), the pitch line "Underwriters keep Dialecta free to read", which must be rewritten in the same change, and two schema facts: `is_charter` set when the condition is met, and cohort membership in its own column | Both are lawful **only before the first dollar**. The council preferred A. B is the announced, completion-contingent reward that `philosopher`'s source, Deci, Koestner and Ryan (1999), puts at d = -0.36 on motivation |
| **L-4, the age line** | 18. Or 16, with three conditions | Joining, Children, the permanence exceptions, and the sign-up attestation | **18.** Argued below |
| **L-7, what closing an account does** | a: profile and fingerprint come down, permanent comments stay under the display name. b: the same, with comments shown as a former member's. c: everything stays | Closing an account, and the privacy notice's Retention and Your rights | **a**, which keeps the record whole and takes down the platform's characterisation of someone who has left. b is kinder and changes the permanence sentence, and it is `philosopher`'s to weigh |
| **B9, the reflection window** (A-D2) | Permanent at submission, as `apps/web` runs today. Or a window of set length, enforced by the database | The first paragraph of Permanence, and the Pact's § V rows | Whichever the code runs. The terms can't promise a window the database doesn't enforce |
| **L-14, EU and UK residents** | a: accept the risk until the first EU or UK member, and have counsel draft a section before one joins. b: don't offer accounts there. c: a GDPR section now | The fourth permanence exception, and Your rights | **a**, consistent with accepting the privacy risk at this size. It needs a way to know: one country question at sign-up |
| **L-17, how long Charter Writers keep it** | While the account stays open and Dialecta offers the tier. Or a fixed term | The Charter Writers paragraph | Either. An unbounded "lifetime" is the thing to avoid. Exclude the operator's and the seed accounts from the count |
| **L-20, refunds** | Full refund within a short window after any charge. None beyond what the law requires. Pro rata at any time | Refunds | **A short full-refund window.** A refund costs less than a payment dispute, and a buyer can check the rule |
| **L-18, Founding Voices** | No conversion offer. Or a named window at the founding price | One optional sentence | The standing ruling: the standard price, with an optional named window disclosed when the year is given |
| **The liability carve-out** | Keep it, or drop it | One sentence in Liability | **Keep it.** Argued below |
| **Arbitration** | None, or add a clause | Disputes | **None at launch.** Argued below |
| **B20, the fonts** | Keep loading them from Google, or serve them from Dialecta | Two sentences in the privacy notice | **Serve them from Dialecta.** It's the one third-party disclosure every visitor triggers, and it disappears with the change |

## Arbitration, argued

**No arbitration clause at launch.** The case for one is better than it looks, so it goes first.

*For:* the people most likely to sue over what Dialecta publishes are members, the subjects of their
own tiers and fingerprints, and an arbitration clause binds them. A claim under $25,000 is decided
on documents alone (AAA Consumer Rules R-1(f)), which is cheaper than any court defence, and an
arbitrator rather than a jury would decide whether a tier is opinion, the question Yetman v. English
otherwise leaves to a jury. Proceedings are private.

*Against, and why it wins at this size:*

1. **The business pays for every case.** The AAA's consumer page: the company "pays the remaining
   administrative fees and all arbitrator compensation." At second hand from its 2025 schedule: $600
   to register a clause and $600 a year to keep it registered, a $375 filing fee, $450 for the
   arbitrator's appointment, and $300 an hour for the arbitrator. A frivolous claim is the only kind
   that shifts the cost back (R-46(c)). The fixed fee buys protection against a claim nobody expects.
2. **It doesn't reach the likeliest claims.** Either side can take a small claim to small claims
   court anyway (R-9), and a refund or a renewal charge is a small claim.
3. **Its usual prize is the class waiver, and the class exposure is small.** Neither renewal statute
   gives a private right of action (Mayron v. Google; New York's is Attorney General only), and at a
   hundred members a class isn't worth a plaintiff's time.
4. **Enforceability has its own cost.** Berman's conspicuousness rules apply with extra force to an
   arbitration term; California voids any waiver of public injunctive relief, and the Ninth Circuit
   held the Federal Arbitration Act doesn't preempt that rule (Blair v. Rent-A-Center, 2019, read at
   second hand).
5. **It sits badly on this platform.** A Pact that says every stage is transparent would send
   disputes into a private room. That is `philosopher`'s point to make; this seat's is only that the
   legal gain is too small to pay for it.

**What would change it:** a membership in the thousands, a class-shaped exposure such as a breach
or a renewal defect at scale, or a lawyer's view that a clause materially lowers the defence cost of
a characterisation claim. Adding one later goes through the change procedure, with notice and a
fresh acceptance, because Douglas v. Talk America says posting it would bind nobody.

## Indemnity, argued

**No indemnity.** An indemnity makes a member pay Dialecta's costs when a claim arises from what
the member posted. Section 230 already ends most claims about what members write, at the pleadings,
so the clause mostly buys protection Dialecta has. It cannot reach the exposure Section 230 leaves
open, which is Dialecta's own statements about people: no member can be made to pay for the
platform's characterisation of them. What remains is thin, an intellectual property claim outside
the DMCA's safe harbour or a member's deliberate misconduct, and it would be owed by individuals
Dan would never sue to collect. The cost is the one clause that tells a member the platform will
come after them, in a document that otherwise says it takes them seriously. If a lawyer wants one,
narrow it to a member's own knowingly unlawful posts.

## The liability carve-out, argued

The cap in the terms excludes any claim that something Dialecta itself published about a person is
false. Without that sentence, the cap is a partial advance waiver of defamation and false light
damages, the waiver this seat declined to draft because it adds little where consent works, fails
where consent fails, and says the opposite of what the platform says it is
(`positions/2026-09-20-consent-waiver-and-the-pact.md`). With it, the cap does its ordinary work on
service and contract claims, and the platform stands behind what it says about people. The backstop
for the carved-out exposure is media liability insurance, which still hasn't been priced.

## The age line, argued

**18, for five reasons.**

1. **Contract capacity.** A minor can ordinarily disaffirm a contract (unsourced here), and the terms
   carry three things a minor could undo: the licence, the Pact signature, and a paid membership.
2. **Permanence is lawful as built only for adults.** California gives a minor who is a registered
   user a removal right the day an operator has actual knowledge of them, at any size
   (`research/2013-ca-bpc-22581-minor-content-removal.md`).
3. **COPPA** attaches on actual knowledge of anyone under 13, and a terms clause alone is no defence
   for a site that is in fact aimed at children (`research/2025-ftc-coppa-faq.md`).
4. **Consent is the fingerprint's main defence**, and a minor's consent to a permanent public
   characterisation is the weakest kind there is (unsourced).
5. **Arizona sets no line of its own.** HB 2991 died in June 2026, and HB 2112 reaches only material
   harmful to minors (`research/2026-az-hb-2991-minors-social-media.md`), so this is Dan's choice.

The cost is real: the sixteen and seventeen year olds who might gain most from a place that rewards
careful argument can read and can't post. The alternative is 16, with three conditions: honour a
removal request from anyone under 18 by hiding what they posted, keep an under-18 fingerprint
visible only to its owner, and sell no membership to anyone under 18.

## Permanence and its four exceptions

The standing finding: "can never be changed" holds for the record, fails for the drawing and the
display, and has four exceptions (`positions/2026-09-20-fingerprint-legibility-and-model.md`,
section 5). The terms state permanence first and handle each exception in the text:

| Exception | How the drafts handle it |
| --- | --- |
| EU and UK residents, under GDPR Articles 17 and 21 | The fourth listed case in Permanence, bracketed until Dan picks L-14 |
| California minors, under Bus. and Prof. Code 22581 | The age line. At 18 it can't arise without a false attestation, and the terms then close the account and hide its posts, which 22581(d) accepts as compliance |
| Copyright | A valid notice from someone else removes a permanent comment, the first listed case. An author trying to withdraw their own licence meets a licence made irrevocable once the comment is permanent, which is lawyer question 3 |
| A promise of deletion | The privacy notice makes none for permanent comments, so none binds. The closure rule, L-7, decides what comes down when someone leaves |

The drawing and the display change by design: the terms say the fingerprint is redrawn as the
drawing improves, and the visibility sentence is a choice for B5.

Two things the terms promise that the build doesn't enforce yet. "We won't" delete a permanent
comment is a promise, not a lock, until the database refuses the delete and takes the author from a
verified session (`security`'s rebuttal in the fingerprint debate, B9). And a permanent comment
comes down on a court's finding that it defames someone, never on the operator's own view of it.
That keeps Dan out of the role of judge, and Section 230 protects hosting the comment in the
meantime, because the words are the member's.

## Placeholders

The audit items named `2.5` and `2.6` are `docs/MORNING-AUDIT-2026-09-21.md`'s. Items named `L-` are
new, proposed here for the convener to number into that section. Build items are `B` rows in the
next section.

| Placeholder | In | Who decides | Item |
| --- | --- | --- | --- |
| `[OPERATOR LEGAL NAME]`, `[ENTITY TYPE]`, `[OPERATOR ADDRESS]` | All three | Dan, with the lawyer and an accountant. The Supabase organisation is named Pennington Media Group; whether that is a registered entity is unverified | L-1 |
| `[CONTACT EMAIL]` | All three | Dan. It must be monitored: ten clauses route through it | L-2, B3 |
| `[DMCA AGENT NAME]`, `[DMCA AGENT ADDRESS]`, `[DMCA AGENT EMAIL]`, `[DMCA AGENT PHONE]` | Terms | Dan. The agent's address may be a post office box; the operator's address in the filing may not | L-3, B6 |
| `[DMCA REGISTRATION NUMBER]` | Terms | Issued by the Copyright Office on filing | B6 |
| `[REPEAT INFRINGER RULE]` | Terms | Dan, for example a count of valid notices within a period | L-3 |
| `[AGE LINE]` | Terms, privacy | Dan. `legal` recommends 18 | L-4 |
| `[NAME RULE]` | Terms | Dan, only if he wants a real-name rule. None exists | L-5 |
| `[REFLECTION WINDOW]` and CHOICE B9 | Terms | Dan | A-D2 |
| `[ARTICLE WITHDRAWAL RULE]` | Terms | Dan. No article withdrawal exists in the build | L-6 |
| `[CLOSURE RULE]` | Terms | Dan | L-7 |
| `[SHUTDOWN COMMITMENT]`, `[SHUTDOWN NOTICE DAYS]` | Terms | Dan. Optional | L-8 |
| `[CONTEST RESPONSE TIME]` | Terms | Dan | L-9 |
| `[LIABILITY LOOKBACK]`, `[LIABILITY FLOOR]` | Terms | Dan, with the lawyer | L-10 |
| `[VENUE COUNTY]` | Terms | Dan: the Arizona county he lives in | L-10 |
| `[INFORMAL RESOLUTION DAYS]` | Terms | Dan | L-10 |
| `[CHANGE NOTICE DAYS]` | Terms, privacy | Dan. `legal` recommends 30 | L-11 |
| `[TERMS VERSION]`, `[PRIVACY VERSION]`, `[MEMBERSHIP VERSION]`, `[EFFECTIVE DATE]` | All three | The convener, at publication | L-11 |
| `[TERMS ARCHIVE URL]`, `[PRIVACY ARCHIVE URL]`, `[MEMBERSHIP TERMS ARCHIVE URL]`, `[MEMBERSHIP TERMS VERSION URL]` | All three | The convener | L-11 |
| `[EMAIL PROVIDER]` | Privacy | Dan and `treasurer`. Custom SMTP is required for magic links (`exchange/open/2026-09-19-002`, designer) | B13 |
| `[MAILBOX PROVIDER]` | Privacy | Dan: whoever hosts the contact mailbox | L-2 |
| `[PAYMENT PROCESSOR]` | Privacy, membership | Dan and `treasurer` | L-12, B12 |
| `[ANALYTICS PROVIDER]` | Privacy | `treasurer`, per `apps/web/CLAUDE.md`, Analytics | B21 |
| `[DATA REGION]` | Privacy | The convener reads it from the Supabase project | L-12 |
| `[WHO HAS ADMIN ACCESS]` | Privacy | Dan | L-12 |
| `[GOVERNING TERMS]` for AI coding sessions | Privacy | Dan: which Claude plan, and its training setting | B19 |
| `[PURPOSE]` for the email stored with each comment | Privacy | Dan and `migrator`, or stop storing it | B18 |
| `[RETENTION AFTER CLOSURE]`, `[PAYMENT RECORD RETENTION]`, `[MESSAGE RETENTION]` | Privacy | Dan | L-13 |
| `[RIGHTS RESPONSE DAYS]` | Privacy | Dan. `legal` recommends 30 | L-13 |
| `[BREACH NOTICE DAYS]` | Privacy | Dan. `legal` recommends 45, which is Arizona's statutory deadline applied to all personal information rather than only what A.R.S. 18-552 reaches | L-13 |
| `[EU/UK STANCE]` | Terms, privacy | Dan, with the lawyer | L-14 |
| `[UNDERWRITER PRICE]` | Membership | Dan | **2.6** |
| `[STANDARD PRICE]` | Membership | Dan | **2.6** |
| CHOICE 2.5, `[PRICE CHANGE DATE]`, `[FOUNDING COHORT SIZE]` | Membership | Dan. The subscription model says a hundred | **2.5** |
| `[HOLD CLAUSE]`, `[MILESTONE]`, `[HOLD NOTICE DAYS]` | Membership | Dan. Naming the milestone is permitted and optional; the hold clause ships either way | **2.5** |
| CHOICE L-15, `[PRICE CHANGE NOTICE DAYS]`, `[GRACE PERIOD]` | Membership | Dan. The notice must land between 7 and 30 days before a price change, for California | L-15 |
| CHOICE L-16, `[BADGE ARTICLE COUNT]`, `[BADGE WINDOW]` | Membership | Dan | L-16 |
| `[CHARTER WRITER COUNT]`, `[CHARTER WRITER TERM]`, `[CHARTER WRITER EXCLUSIONS]` | Membership | Dan. The subscription model says 25 | L-17 |
| `[FOUNDING VOICE COUNT]`, `[FOUNDING VOICE RULE]`, `[CONVERSION WINDOW]` | Membership | Dan. The subscription model says 50 "active commenters" and defines neither word | L-18 |
| `[GIFT PRICE]`, `[GIFT VISIBILITY]`, `[GIFT REFUND RULE]` | Membership | Dan | L-19 |
| `[REFUND RULE]`, `[REFUND WINDOW]`, `[REFUND ON TERMINATION]` | Membership | Dan | L-20 |
| `[REMINDER DAYS]` | Membership | Dan. Between 15 and 30 days before renewal satisfies New York's reminder window and California's price-change notice with one email | L-20 |
| `[TAX]` | Membership | An accountant | L-21 |
| `[MEMBERSHIP SETTINGS LOCATION]` | Membership | `builder` | B12 |
| `[CONFIRM]`, whether the membership mark ships | Privacy | `designer` | B12 |
| `[START DATE]`, `[RENEWAL DATE]`, `[PRICE]`, `[OLD PRICE]`, `[END DATE]`, `[LAST FOUR]`, `[RECIPIENT DISPLAY NAME]`, `[LADDER LINE]` | Membership emails and checkout | Merge fields filled at send time, not decisions | B12 |
| `[DAN TO CONFIRM]` | Terms (the drawing-yields rule), privacy (breach timing, AI sessions) | Dan: each is a commitment he has to keep | L-9, L-13, B19 |

## What the build owes first

A bracketed clause stays out until its item exists, so most of this list holds back only the clause
it names. The first group is different: until it exists, the terms bind nobody and the notice says
things that aren't true.

| Rank | Item | Makes true | Owner |
| --- | --- | --- | --- |
| **Before anyone signs** | | | |
| 1 | **B1.** The Pact's commit button records the signing, and the terms, through the sentence in `legal-01` item 2; posting waits for a current acceptance | That anyone has accepted anything | `builder` |
| 2 | **B3.** A monitored contact address, and a postal address | The contest route, copyright notices, every privacy request, closure and cancellation by email, disputes | Dan |
| 3 | **B2.** The consent record: one append-only table of who, which document, which version of the text shown, what they chose, when, and what it attached to | Proof of every acceptance, and California's three-year renewal record | `migrator` |
| 4 | **B4.** Close the columns the notice calls private: on `profiles`, at least `is_admin`, `pact_agreed_at`, `pact_version`, `subscription_tier_set_by`, `subscription_tier_updated_at`, `gift_expires_at`, `order_negotiation_log` and `polish_preferences`, and `feed_events` rows marked for followers. `pact_signed_name` stays public, because the profile shows the signature on purpose, and the notice says so | Every "only us" in the privacy notice | `security`, `migrator` |
| 5 | **B19.** Narrow what the AI coding sessions can read in production, or disclose it with the terms that govern it (`exchange/open/2026-09-21-legal-02`) | "Only us" | Dan, `security` |
| 6 | **B18.** Stop storing the account email on every comment, or state why it's there | A privacy table without an unexplained row | `migrator` |
| 7 | **B9.** The permanence rule the code runs: permanent at submission, as now, or a window the database enforces, with the author taken from a verified session | Permanence, as written | `builder`, `security` |
| 8 | **B11.** Account closure: a route, or a written manual process, that removes the profile, the fingerprint and their public copies (`axis_scores`, `archetypes`, and any `fp_snapshots` image, which the legacy code is built to put in public storage; `security` measured none there on 2026-09-20) | Closing an account, and the privacy right to close | `builder`, `migrator` |
| 9 | **B15.** The age attestation at sign-up, and a way to close a minor's account | Joining | `builder` |
| 10 | **B6.** The DMCA agent registered for six dollars, renewed every three years, and posted on the site. Decide the entity first (L-1) | Copyright | Dan |
| 11 | **B22.** A CyberTipline registration with NCMEC before any upload route is live, and the legacy upload route closed or gated now | Conduct, and the standing 2258A position | Dan, `security` |
| 12 | **B16.** The Breach routing rule, written to the Stored Communications Act's emergency wording | Moderation and removal | `legal`, Dan |
| **Before anyone pays** | | | |
| 13 | **B14.** A Vercel project on `apps/web` under a plan that allows commercial use (`council/treasurer/research/2026-vercel-pricing.md`) | That taking money is allowed by the host's own terms | Dan, `treasurer` |
| 14 | **B13.** The sign-in email provider | The processors table | Dan, `treasurer` |
| 15 | **B12.** Payment: a hosted checkout; the checkout block and checkbox before any card field; the receipt, reminder and cancellation emails; a cancel button in the account; the payment webhook setting `subscription_tier_set_by` to `'system'`; the gift-expiry cron kept | All of the Membership Terms | `builder` |
| 16 | **B17.** Port the two editor limits a membership says it lifts, enforced on the server, or drop them from the terms and the page. Neither exists in `apps/web` | Underwriter membership, what it includes | `builder` |
| **Before a fingerprint is shown to anyone but its owner** | | | |
| 17 | **B5.** Visibility per ADR-004: visible only to its owner until a level is chosen, levels enforced by a predicate policy, the choice in the Pact and again at first render | The visibility sentence, and the privacy notice's fingerprint row | `designer`, `migrator`, `builder` |
| 18 | **B8.** The comment card of A-5: the engine's reading beside the tier, and the note showing a declared and an engine tier that differ | The basis sentence, and the Contrast Strip | `builder` |
| 19 | **B7.** The contest path beyond email: nominations and re-review (A-7, A-8), and the owner's view of what the record behind their fingerprint holds | The nomination sentence, and the fingerprint's basis | `builder` |
| **Optional** | | | |
| 20 | **B10.** Append to a permanent comment, which the Pact already promises | One sentence in Permanence | `builder` |
| 21 | **B20.** Serve the fonts from Dialecta | Removes Google from every page view | `builder` |
| 22 | **B21.** Choose the analytics provider, or leave it off | One processors row | `treasurer` |
| 23 | **B23.** Serve profile pictures from Dialecta's own storage, or show initials, instead of loading them from Ghost and Gravatar | Removes a bracketed paragraph, and stops publishing a code derived from each Gravatar user's email address | `builder` |

## What needs a lawyer before these bind

Dan has no counsel on retainer, so this list is ranked by what a wrong answer could cost.

1. **Whether Dialecta's statements about people can be sued on, and whether signing carries consent
   to them.** The largest exposure: no Section 230 for the platform's own words, and Arizona's
   anti-SLAPP motive test gives no early exit, so a claim over a tier, a Breach notice, a Contrast
   Strip or a legible fingerprint costs a defence even when it fails. Ask: does Arizona follow
   Restatement Section 583, and does one act accepting the Pact and the terms operate as consent to
   publishing the tiers and the fingerprint; is the Breach notice, with its text withheld, or a
   fingerprint read through the platform's own legend, "provable as false" under Yetman v. English
   and Turner v. Devlin; does the terms' plain statement that these are Dialecta's own statements
   help, as a disclosed basis, or hurt, as an admission; and is the liability carve-out right. This
   is the Arizona hour already asked for (`exchange/closed/2026-09-20-legal-02`), widened.
2. **Who the operator is.** Without an entity, every exposure lands on Dan personally, and the DMCA
   filing publishes the service provider's street address, a post office box only with the Copyright
   Office's approval on a documented safety threat (`research/2026-usco-dmca-directory-faq.md`).
   Ask: whether to form an Arizona LLC before the first payment and the DMCA filing, and in whose
   name the terms should run. A broker, separately: whether a media liability policy covers
   statements the insured's own model writes and images its code draws.
3. **The permanence licence.** A member who wants their words gone and sues in copyright brings
   statutory damages into play, a different order of exposure from a refund. Ask: does a permanent,
   irrevocable licence for permanent comments bind a consumer and survive an attempt to revoke it
   (Asset Marketing Systems v. Gagnon, 9th Cir. 2008, unread), and are the four exceptions in
   Permanence complete.
4. **Formation and change.** If the terms don't bind, nothing in them helps. Ask: does the Pact with
   the terms incorporated, accepted by a typed signature beside the sentence in `legal-01`, form a
   contract under Nguyen and Berman; does "these terms govern" hold when the Pact is the document
   people read; does the change procedure satisfy Douglas v. Talk America.
5. **The founding price and the cohorts.** Once paid, Douglas binds the price. Ask the three open
   questions from `positions/2026-09-20-charter-badge-and-price-ladder.md`: whether "locked founding
   price, permanent" is an enforceable term or a revocable policy, which decides L-15; whether
   recurring payment from other states creates a registration or digital-goods tax duty, which is
   an accountant's question as much as a lawyer's; and whether a peer gift, paid by one person for
   another, needs anything a direct purchase doesn't. Add: the Charter Writers bound, the badge
   condition if Dan picks it, and the checkout flow against California, New York, and the renewal
   laws of other states where members live, none of which this seat has researched.
6. **Privacy scope.** Accepted risk at this size, and the answer moves with the first EU or UK
   member. Ask: does any of the twenty state comprehensive privacy laws reach Dialecta; if the GDPR
   or the UK GDPR does, which lawful basis carries a public fingerprint, and whether the right to
   object has to be stated separately in the Pact; is the notice complete for CalOPPA.
7. **Minors.** Is a self-attested age line enough, and does any other state's minors' law reach a
   site this size.
8. **Arbitration and the liability cap.** Would a clause with a small-claims carve-out lower the
   defence cost of a characterisation claim enough to justify its fees, and is the cap enforceable
   against a consumer at all.

**What a flat-fee review should cover.** Send the four drafts in this folder, the Pact as it will
ship, the checkout mock, and this list. Ask for written answers to items 1 to 5 and a markup of the
three drafts, from an Arizona lawyer who practises media or internet law, at a fixed fee quoted
before work starts. Items 6 to 8 can wait for a second review before the first EU or UK member joins
or before membership reaches the thousands. The tax question goes to an accountant and the
insurance question to a broker, neither of whom needs this folder.

## The Pact

Seven lines in the Pact say something the terms or the build don't, and the Pact is not this seat's
to change. All seven, with a proposed fix for each, are in `exchange/open/2026-09-21-legal-01`. The
three that matter most:

- **"Not terms and conditions. Not rules imposed from above."** False the day the terms exist, since
  signing the Pact accepts them. It appears in `components/dialecta-pact.html` line 1006, the live
  template `_theme/page-pact.hbs` line 1180, and the port in `apps/web/src/strings.ts` lines 1243
  and 1249.
- **The commit button** needs the sentence that says signing accepts the terms, with links that look
  like links.
- **"Slander" in the Breach definition** makes every Breach reading a statement that a named person
  defamed someone. The spec carries the same word (`docs/Dialecta_Project_Brief.md` line 57), so
  that change is Dan's.

## What the site cannot say today

| A document would need to say | What's true today | What fixes it |
| --- | --- | --- |
| "You accepted these terms when you signed the Pact" | In `apps/web` the commit button is disabled and records nothing (`pact-commitment.tsx`), and sign-in shows no terms | B1 |
| "A membership lifts two limits in the editor" | Neither the polish runs nor the opinion-map inputs exist in `apps/web` (`writer-state.ts` lines 9 to 15, `stages-draft.tsx` line 21). The designer's page says both lift the day you join. In the new build, none of the ten paid capabilities works, not eight | B17, or change the page |
| "Your gift dates, who set your membership, and your admin status are private" | The public key can read `gift_expires_at`, `subscription_tier_set_by`, `is_admin`, `order_negotiation_log` and more (`supabase/migrations/20260920192954_close_ghost_member_id_as_public_credential.sql`) | B4 |
| "You choose who sees your fingerprint" | Every visitor sees it on an `apps/web` profile, and no setting exists | B5 |
| "Only us, and our processors" | AI coding sessions read production personal data, including real email addresses | B19, `legal-02` |
| "Your email address: only us" | A profile picture hosted on Gravatar has a web address containing a code derived from the owner's email, and `profiles.avatar_url` is public (`apps/web/src/app/profile/_components/bits.tsx` line 31) | B23 |
| Nothing about images | The live API accepts image uploads from anyone who can name a member id (`_recovered/api/article/upload-image.js`) | B22, `legal-02` |
| "Breach text is never shown" | The live `/api/comments` returns Breach bodies to anyone (`council/security/research/live-surface-inventory.md`). `apps/web` drops them on the server | True after cutover |
| "Every decision is contestable" | No nomination route exists, and the fingerprint has no contest path | B7, `legal-01` item 3 |
| "Comments are never hidden" | Breach suppresses, and the terms remove on narrow legal grounds | `legal-01` item 4 |
| "A 30 minute reflection window", "append at any time" | `apps/web` makes a comment permanent at submission, with no append; the database default is 60 minutes | B9, B10, `legal-01` item 6 |
| "Your private profile tracks patterns" | The fingerprint is public | B5, `legal-01` item 7 |
| "Payment status never reaches the classifier, the vote weight or the nomination panel" (the designer's page) | True today only because nothing is wired; the wall has no phase number (`convener-04`) | The Membership Terms make it a term, so it has to stay true by construction |
| "Held at that number permanently. Ten years of membership costs $500." (the designer's page) | True only under lock form A | L-15 |
| "The rate changes when the hundredth is taken" (the designer's page) | Conflicts with the ruling to publish a date | 2.5 |
| "Charter Writers: lifetime, free" (the designer's page) | Unbounded | L-17 |
| "User-submitted improvement ideas are welcome and publicly voteable" (the Guidebook, `strings.ts` line 1489) | The proposal form says "Proposals are not collected yet" (`strings.ts` line 1661) | Build it, or drop the line |

**Do not post these drafts on the legacy Ghost site.** It runs Ghost member accounts and
newsletters on Magic Pages, sends article text to a second Claude model, searches Open Library for
book covers, takes image uploads, and is built to email digests through Resend and to put
fingerprint images in public storage. The notice describes none of that.

## Positions this drafting changed

All recorded in `council/legal/positions.md`, new section "The documents beside the Pact":

- **Corrected:** the standing row saying 18 U.S.C. 2258A "does not attach today". The live API has
  accepted images since April. The P0-D2 row's flip condition is restated to match.
- **Revised:** the capability matrix finding. Eight of ten paid rows were inert; in the new build it
  is all ten.
- **Revised:** the preferred price trigger, from a date to whichever comes first, if the cohort keeps
  its cap.
- **New:** the terms govern over the Pact and the Pact gets fixed; Berman's two build rules; the age
  line at 18; no arbitration; no indemnity; the liability carve-out as the refusal to draft a
  waiver, carried into the cap; a Breach reading is never by itself a finding of breach; a
  permanent comment comes down on a court's finding rather than on Dan's own judgement; CalOPPA
  applies at any size; the Google Fonts and Gravatar disclosures; the DMCA address trap; AI
  sessions reading personal data; the unexplained email on every comment.

## Sources

Filed this session, one note each in `council/legal/research/`:

| Note | Used for |
| --- | --- |
| `2026-usco-dmca-directory-faq.md` | The agent registration, and the address trap |
| `2020-usco-section-512-resources.md` | The notice and counter-notice elements in Copyright |
| `2026-copyright-alliance-dmca-safe-harbor.md` | Cross-check; a rightsholder trade association |
| `2026-ftc-privacy-security-guidance.md` | Why every sentence in the notice is a promise |
| `2014-dmlp-terms-of-use.md` | The shape of a user-content site's terms; archived |
| `2025-ftc-coppa-faq.md` | The under-13 sentence and the age line |
| `2022-ca9-berman-v-freedom-financial.md` | The signing sentence and the link style, read in the slip opinion |
| `2026-ca-bpc-22575-caloppa.md` | The privacy notice's required elements |
| `2025-ca-auto-renewal-law-ab-2863.md`, addendum | The renewal consent, now from the code text |
| `2025-aaa-consumer-arbitration-rules.md` | The arbitration costs; fee figures at second hand |
| `2019-ca9-blair-v-rent-a-center.md` | The McGill rule; at second hand |
| `2026-anthropic-commercial-terms-and-api-retention.md` | What Anthropic keeps and may not train on; a vendor source |
| `2026-az-hb-2991-minors-social-media.md` | No Arizona minors' law in force; a tracking service |

Relied on from earlier sprints: Nguyen, Douglas, ROSCA, New York GBL 527-a, the FTC rule status,
the Arizona Consumer Fraud Act, A.R.S. 18-552, Restatement Section 583, Milkovich, Counterman,
Section 230, 2258A, California's minor removal law, and GDPR Articles 17 and 21.

The AI processing was checked by reading the code: `apps/web/src/lib/classify.ts`
sends the system prompt and `buildUserMessage(body, articleClaims)`, which
`packages/core/src/classification.ts` line 256 builds from the comment text and the article's key
claims alone, and `apps/web/src/app/api/comment/route.ts` never passes the member's name or email to
it. The legacy `api/classify.js` and `api/comment.js` send the same two things to the same provider.

## Voice check

`python scripts/voice_check.py` accepts a path, and was run on all four files in this folder on
2026-09-21: zero hard-rule hits in any of them, and zero soft hits in the three drafts. This note
keeps one soft flag on purpose: "Disclosure, not a contract" in The documents, where a reader would
otherwise assume a privacy notice is part of the contract.
