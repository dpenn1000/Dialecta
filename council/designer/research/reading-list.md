# Reading list: designer

*Seed written by Claude, 2026-09-19. Verify before filing; mark `dead` what does not hold up. Add leads as you read.*

*Sprint 1, 2026-09-19: nine sources filed, six of them from the seed. Corrections to seed rows are recorded in the Note column.*

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | Discourse (Jeff Atwood), trust levels, blog.discourse.org | The closest living precedent for earned trust and reading-before-posting gates; bears on Stewards and the composer | `2018-atwood-discourse-trust-levels.md`. Seed correction: "Civilized Discourse Construction Kit" is a February 2013 Coding Horror post and the company name, not a design series on blog.discourse.org. Split out as its own lead below |
| filed | Stack Overflow reputation and privilege design | Reputation that unlocks tools rather than status; what went wrong at scale; bears on the fingerprint as scoreboard risk | `2026-stackoverflow-privileges.md`. Filed from the live help centre privilege pages. The Meta Stack Exchange design history named in the seed was not read; split out below |
| todo | Slashdot moderation and meta-moderation | Community classification of comments with a second layer judging the judges; direct precedent for reclassification | Seed attributes this to Rob Malda's CmdrTaco writeups. Not verified. Check the Slashdot FAQ and the 1999 moderation documentation before crediting a person |
| todo | Hacker News moderation and ranking notes (dang's public comments, the HN guidelines) | Flat design, flag-based suppression, "assume good faith" copy; bears on the Breach tier UX | |
| todo | Kialo, product design of pro/con argument trees | Structured disagreement UI; what people abandon; bears on the Advocate mechanic | |
| todo | Polis (pol.is) participant interface | Voting on statements and seeing your cluster; the only shipped opinion-map UX; bears on D-1 and D-2 | Raised in priority by `2006-nielsen-participation-inequality.md`: a one-tap position is the only contribution most readers will ever make |
| filed | Community Notes contributor UX (X), the rating flow and the "helpfulness" copy | How a note-rating flow is made legible; bears on the nomination panel | `2026-x-community-notes-writing-ability.md`. Filed from the twitter/communitynotes repository, which is the primary documentation |
| todo | Krug (2014), Don't Make Me Think, Revisited | The one-read test for every page; bears on the site review's structure changes | |
| todo | Norman (2013), The Design of Everyday Things | Affordances and feedback; bears on the classification card's "reads as" moment | |
| todo | Nielsen Norman Group, onboarding and first-run experience research | Completion of one-sitting onboarding; bears on the Pact page cut | Still open. Sprint 1 filed a different NN/g article, listed below |
| todo | Kohavi, Tang, Xu (2020), Trustworthy Online Controlled Experiments | How to know a change worked; bears on instrumenting Pact completion and seven day return | Blocked in practice: no metric exists to experiment on. Read after first-comment completion is instrumented |
| todo | Substack Notes and Medium responses: product writeups on comment surfaces attached to long-form | Comment surfaces on editorial platforms; what they got wrong; bears on the thread design | |
| todo | Letterboxd and Goodreads review UX | Identity built from a body of work rather than a score; bears on the profile page | |
| filed | Fogg (2009), "A behavior model for persuasive design" | Motivation, ability, trigger; used to name what the composer must make easy, not to manipulate | `2009-fogg-behavior-model.md`. Citation verified against Crossref. ACM full text is paywalled and was not read; model content came from the Stanford Behavior Design Lab page |
| filed | Metafilter, the $5 signup and its effect on community quality | Friction as filter; bears on P0-D2 open vs invite-only | `2014-pileggi-metafilter-barriers.md`. Seed understated it: there is also a mandatory one week wait before a new member may post. Abstract only; full text lead below |

## Added in sprint 1

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | Nielsen (2006), "The 90-9-1 Rule for Participation Inequality" | Sizes the prize for the composer: nine readers in ten never post, and 27% of contributions are a person's only one | `2006-nielsen-participation-inequality.md` |
| filed | Roselli (2024), "Don't Disable Form Controls" | The mechanism A-1 uses for the 12 character gate is a disabled button; this is the case against that mechanism | `2024-roselli-disabled-form-controls.md`. Corroborated by the NHS digital service manual button guidance |
| filed | FIDO Alliance with Liminal (2025), "Passkey Index" | The only published cross-platform numbers on sign-in completion by method; bears on P0-D2 | `2025-fido-passkey-index.md`. Self-reported by nine member organisations; read the caveats before citing the headline |
| filed | Supabase Auth documentation: rate limits, passwordless email, custom SMTP | The email constraints that decide whether a magic link can work at cutover at all | `2026-supabase-auth-email-limits.md` |
| todo | Whittaker, Terveen, Hill and Cherny (1998), "The dynamics of mass interaction", CSCW | The Usenet study behind Nielsen's 27% single-post figure. Read the primary rather than the summary | Found while filing `2006-nielsen-participation-inequality.md` |
| todo | Pileggi, Morrison and Bruckman (2014), GT-IC-14-01, full text | The abstract says why the barriers were imposed and why users surmounted them. The second half is the part that would change a position | Promoted from the MetaFilter row. Not retrievable from the UNO or Georgia Tech repositories on 2026-09-19 |
| todo | Nunes and Dreze (2006), the endowed progress effect, Journal of Consumer Research | Progress shown toward a goal a person has already started; the alternative to a gate in the composer | Found while working A-1. Check it survives replication before citing |
| todo | Community Notes, "diversity of perspectives" and the bridging algorithm | Status reached by agreement across contributors who usually disagree, rather than by majority | Bears on A-D1: whether community voting alone may outweigh the AI under 40/35/15/10 |
| todo | Discourse `newuser` rate limit settings, meta.discourse.org | The per-account caps that do the spam work a character minimum is being asked to do | Found while filing `2018-atwood-discourse-trust-levels.md` |
| todo | Atwood (2013), "Civilized Discourse Construction Kit", Coding Horror, February 2013 | The founding argument for the whole Discourse design, including reading as the unit of trust | Split out of the seed row after the domain in the seed turned out wrong |
| todo | Custom SMTP providers for Supabase Auth: deliverability, domain warmup, monthly cost | P0-4 cannot ship magic links without one. The choice has a price and belongs in front of the treasurer | Found while filing `2026-supabase-auth-email-limits.md` |

## Added in sprint 2: the craft half

*Sprint 1 read entirely about behaviour and filed nothing on colour, space, type or layout. The
charter names mobile, five nav items and copy a busy adult can read once, and the tier palette is the
platform's signature visual element. This half of the tree starts here.*

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | W3C, WCAG 2.2 Understanding SC 1.4.1 Use of Color and SC 1.4.11 Non-text Contrast | The two normative criteria that govern the seven tier system, the topology bar and every badge | `2023-w3c-wcag22-colour-criteria.md` |
| filed | Somers, "Visual Contrast of Text Subgroup Whitepaper", W3C Silver wiki | Why the WCAG 2.x number is least reliable exactly where Stance and Breach sit | `2021-somers-apca-contrast-whitepaper.md`. Explicitly not a W3C recommendation. Direction sound, thresholds contested |
| filed | Healey (1996), "Choosing effective colours for data visualization", IEEE Vis | How a categorical palette should be chosen: colour distance, linear separation and colour category, all controlled | `1996-healey-effective-colours.md`. Citation verified against Crossref; read from the author's summary page, not the IEEE full text |
| filed | Wagemans et al. (2012), "A century of Gestalt psychology in visual perception: I", Psychological Bulletin | Proximity is the grouping cue that fires first. It is the mechanism by which spacing carries meaning | `2012-wagemans-gestalt-grouping.md` |
| filed | Dyson and Haselgrove (2001), line length and reading from screen, IJHCS 54 | 55 characters per line beat 100 on comprehension. Bears on the article measure in `apps/web` | `2001-dyson-haselgrove-line-length.md`. Paywalled; finding read from secondary summaries, citation verified against Crossref |
| filed | Own measurement: the seven tier palette | Six measured failures against WCAG, CIEDE2000 and CVD simulation | `2026-dialecta-tier-palette-audit.md`, reproducible via `tier-palette-audit.py` |
| filed | Own measurement: space and scale in the token set | No spacing token, no type scale, no measure. 29 font sizes, 17 paddings, 14 line heights in their place | `2026-dialecta-space-and-scale-audit.md` |
| todo | Machado, Oliveira and Fernandes (2009), "A physiologically-based model for simulation of color vision deficiency", IEEE TVCG | The CVD matrices the palette audit runs on. Read the primary before defending the simulated numbers | Used in `tier-palette-audit.py` at severity 1.0. Citation not yet verified |
| todo | Brewer, ColorBrewer and the qualitative palette method | The working method for a categorical palette that survives CVD and print. The nearest thing to a recipe for D-11 | |
| todo | Material Design 3 and the Apple HIG on type scales and spacing grids | Two shipped systems that solve D-15. Read for the shape of the scale, never for the look | |
| todo | Nielsen Norman Group, research on icon comprehension without labels | D-13 proposes carrying tier icons into topology segments. An icon nobody can read is not a second channel | |
| todo | WCAG 2.2 SC 1.4.10 Reflow and SC 1.4.4 Resize Text | The normative half of the Responsive Foundations debt the charter says is mine to keep raising | |
| todo | The `ch` unit and the measure: how the design spec's own `50ch` / `52ch` / `64ch` rules were chosen | The spec already knows about `ch` and `apps/web` does not. Find out which rule was deliberate | Found while filing `2001-dyson-haselgrove-line-length.md` |
| todo | Tufte, data-ink ratio, applied to the topology bar | The topology bar is a data visualisation and has never been read as one | |

## Added in sprint 3: repositories

*Scanned 2026-09-19 via `gh`. The best finds were Dan's own repos, not external ones. Generic
keyword searches for paper grain, noise texture and colour-blind-safe palettes returned nothing
above noise, which is recorded as a dead end rather than retried.*

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| filed | `dpenn1000/trinity-platform`, `Tools/APEX/docs/` design system | The spacing scale, the direction rule and the fill-versus-ink law, already written by Dan | `2026-trinity-apex-design-system.md`. Private repo. Take the laws, never the palette |
| filed | Radix Colors, the twelve step scale and its contrast guarantee | A scale is a set of promises between its own steps. The idea that makes D-19 possible | `2026-radix-colors-scale-roles.md` |
| filed | GitHub scan: tokens, colour science, accessibility engines, font stacks | Nine verified repos with stars, licences and push dates | `2026-external-design-repos-scan.md` |
| todo | `dpenn1000/dialecta-api`, `api/article/` | Five endpoints this repo lacks, one of them a formatting assistant in Editorial Voice | Read `aesthetic-suggest.js` only. Raised as exchange 2026-09-19-005 |
| todo | `dpenn1000/trinity-platform`, `Tools/APEX/assets/apex-design.css` | The grain, the float shadow stack and the convex control treatment, as shipped CSS | Read the intent doc, not the CSS. The technique is the transferable part |
| todo | `dpenn1000/trinity-platform`, `Tools/APEX/docs/DESIGN-ROLLOUT.md` | How a design system was rolled across an existing product without stopping it | Directly relevant if the spacing and type scales are accepted |
| todo | `dpenn1000/penningtonmediagroup`, `img/dialecta/` and `assets/styles.css` | A Dialecta logo and a stylesheet living outside both Dialecta repos | Check it against `design/logos/` before anyone reconstructs anything |
| todo | W3C Design Tokens Community Group specification | The standard shape for spacing and type tokens, before Dialecta invents a private one | `design-tokens/community-group`, 2,126 stars |
| todo | `Evercoder/culori` or `gka/chroma.js` | Would replace the hand-rolled CIEDE2000 in `tier-palette-audit.py` if the audit moves into CI | Weigh against the script currently having zero dependencies |
| todo | `dequelabs/axe-core` or `pa11y/pa11y` | The rendered-page half of D-18. Catches what a token file cannot, such as opacity on dimmed filter buttons | MPL-2.0 and LGPL-3.0 respectively |
| todo | `system-fonts/modern-font-stacks`, CC0 | What Dialecta's four webfaces fall back to before they load, classified by typeface style | Bears on whether the page feels native in the first 200ms |

## Added in sprint 4: making the generative mode possible

*Scanned 2026-09-20, after Dan asked for this seat to work in both modes on request. These are
chosen for what they let the seat DO, not for what they teach it. Verified via the GitHub API at
the time of scanning.*

| State | Lead | Why it matters here | Note |
| --- | --- | --- | --- |
| todo | `microsoft/playwright`, Apache-2.0, 96,417 stars | The single highest-value addition. Real screenshots headlessly, breakpoint testing at 380px, and visual regression against the design spec. Turns "look at it" from a session-only act into something CI repeats | This repo has no visual testing of any kind: `devDependencies` is empty and nothing references playwright, puppeteer, percy or chromatic. Pairs with D-18, which currently proposes only a token-level contrast check |
| todo | `uswds/uswds`, 7,198 stars | A public-sector design system with a published spacing and type token set and accessibility as a floor rather than a trade. The closest worked example of what D-15, D-20 and D-25 are asking for | Licence reads NOASSERTION; check terms before copying anything, though the value here is the shape rather than the values |
| todo | `carbon-design-system/carbon`, Apache-2.0, 9,471 stars | The same, from IBM, with an explicit type scale and an 8px grid. Read alongside USWDS so the shape is drawn from two systems rather than one | |
| todo | `tabler/tabler-icons`, MIT, 21,740 stars | Over 6,100 icons under a clean MIT licence. Dialecta has seven bespoke tier icons and no general UI set, and the charter names iconography as this seat's | `lucide-icons/lucide` is the alternative at 24,628 stars, but its licence reads NOASSERTION where Tabler's is plainly MIT |
| todo | `adobe-fonts/source-serif`, OFL-1.1, 2,377 stars | Dialecta already uses Source Serif 4 as `--font-reading`. The upstream carries the optical sizes, which bear directly on D-16 and the measure | Also the licence that decides whether the face can be self-hosted rather than pulled from Google Fonts |
| todo | `rough-stuff/rough`, MIT, 21,190 stars | Hand-drawn, sketchy graphics. Flagged as a lead to check against the aesthetic, not as a recommendation | Likely wrong for Dialecta. Parchment, letterpress and wood frame are refined organic; sketchy is a different thing. Read it to rule it out deliberately rather than by omission |

**Dead end, recorded twice.** Keyword searches for paper grain, `feTurbulence` texture, noise
overlays and organic pattern libraries returned nothing above noise on both 2026-09-19 and
2026-09-20. There is no credible off-the-shelf repository for the aesthetic Dialecta and Trinity
share. The only reference implementation is the one in `2026-trinity-apex-design-system.md`, and
that is Dan's own. Stop searching for it.
