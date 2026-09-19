# dialecta.org site review
*8 September 2026. Structure, navigation, and a prose check against Editorial Voice v1.2.*

> **Provenance note (2026-09-19).** This copy was restored on the laptop from the session transcript, because the original lives only in the uncommitted `docs/` tree on studio-pc. Reconcile against that original before committing; the companion `docs/reviews/site-snapshot-2026-09-08/` text snapshots are not on this machine.

Method: crawled every URL in the sitemap (12 pages, 5 posts), read the public text of each, opened the JS-rendered pages (Community, Quotes, Write, Dev-Admin) in a browser, and ran `scripts/voice_check.py` (the regex-decidable subset of the voice guide) on all of it. Judgement-level findings come from reading, not the script. Text snapshots are in `docs/reviews/site-snapshot-2026-09-08/`.

## What the site is today

| URL | What it is | Words | Reads as |
|---|---|---|---|
| `/` | Article feed, five posts, a CTA card at the bottom | 356 | A blog index with no orientation |
| `/about/` | Manifesto in four numbered sections plus a founder's note | 732 | The best page on the site |
| `/guidebook/` | Philosophy, seven tiers with examples, engine stages, weights, the full classification standard, claim levels 0-3, four opinion-map tools, governance form | 2,193 | A spec pasted onto a page |
| `/pact/` | Eight sections (§ I to § VIII), tier list, process, wait timers, patterns, three-comment quiz, commitment | 1,223 | A second guidebook with a signature line |
| `/stewards/` | Cadence modifiers, nine Orders, ~30 writer types each with a "Tell", the Satirist's Charter | 2,536 | A taxonomy document |
| `/fingerprint/` | Explainer for the Thinking Fingerprint with archetypes and texture | 899 | A design showcase for a feature visitors can't use yet |
| `/community/` | 14 contributor cards | | Half real people, half seeded personas |
| `/articles/` | Feed, same five posts | | Duplicate of `/` |
| `/write/` | Sign-in wall | | Fine |
| `/profile/` | Sign-in wall | | Fine |
| `/quotes/` | 70 quotes with raw tag slugs (`PILLAR-REACH`, `ACHEBE-MASK-DANCING`), page title "quotes" | | An internal tool left public |
| `/dev-admin/` | Sign-in wall, page title "Dev-Admin" | | Should not be in the sitemap |

Five substantive pages carry 7,600 words of platform explanation before a visitor has read a single article or written a comment. The same seven-tier list appears on three of them (Guidebook, Pact, and implicitly Fingerprint), the engine stages on two, the founding argument on four.

## Structural suggestions

**Give the home page a front door.** Right now a first visitor lands on five article cards and a "CREATE ACCOUNT" card at the bottom. Nothing says what Dialecta is until they open the hamburger. One short band above the feed does the job: the line "Ideas are the protagonist" (already on the site), one sentence on what happens to a comment here, and two links: Read the Pact, How it works. The rest of the page stays the feed.

**Collapse the three explainer pages into one reading path.** Today the Pact, the Guidebook, and the Fingerprint page each restate the thesis, the tiers, and the engine, at different lengths and slightly different wording (the Pact says Breach is "suppressed from default view"; the Guidebook says "posting is blocked pending review"; both are on the site now). A visitor can't tell which is authoritative. Proposed split:

| Page | Job | Target length |
|---|---|---|
| About | Why it exists. The manifesto, as is, trimmed to the four sections. | 500 words |
| Pact | What you agree to. The commitment text, the seven tiers in one line each, the quiz, the signature. Cut § II (why this exists: that's About), § V (timers), § VI (patterns). | 400 words plus the quiz |
| Guidebook | How it works, for people who want the mechanics. Keep the tier examples, the three engine stages, and the claim levels 0-3. Move the classification standard (Steps 1-5, the ASCII rules) to a linked "Classification standard" reference page, or into the repo, since it's the operator prompt, not reader material. Move the four opinion-map tools to a section that appears when the feature ships. | 900 words |
| Fingerprint, Stewards | Feature pages. Link from the Guidebook, drop from the primary nav until a visitor can use them. | as is, one screen shorter each |

Nav after that: Articles, Community, About, The Pact, Guidebook. Five items, and a reader knows which one to open.

**The Stewards page is the largest and the least reader-facing.** Nine Orders, thirty-odd writer types, each with a paragraph and a "Tell". It reads as the internal taxonomy the platform uses to badge writers, published in full. Two options: cut it to the nine Orders with one line each and a link to the full taxonomy, or keep it whole under a "Reference" heading, off the main nav. A visitor who arrives at "Cadence: the rhythm of contribution" as the first heading has no idea what they're looking at (the page opens on the modifier before the Orders).

**Publish only what works.** The Guidebook describes ternary plots, radar charts, barycentric multi-pole maps, the delta mechanic, and a governance proposal form, and says which ones are "Phase 2". The Pact quotes wait timers to the second. A professional site describes the features that exist. Move future features to a short "What's coming" section or leave them in the docs. Same for the Fingerprint page's "Three Contributors" section: those are seeded personas.

**Fix what looks like a mistake before touching any prose.** These are visible to every visitor and cost the site more credibility than any sentence:

| Where | What | Fix |
|---|---|---|
| Every article card | "2 min read min read" | Theme template repeats the suffix |
| `/articles/` cards | Byline shows Daniel Pennington on Kathryn's and Rylie's posts while the excerpt says "By Kathryn Pennington" | Ghost author assignment, or the card reads the wrong field |
| `/community/` | "THE THE ESSAYIST", "THE THE MEMOIRIST", "THE THE PAMPHLETEER" | Title prefix concatenated twice |
| `/community/` | Father Anselm Okafor, Maya Reiss, Wen Zhao appear as members with invented histories ("Eighteen months on Dialecta, about seventy comments"; the site is five months old), and Maya Reiss has a published article | Retire the seed personas from the public listing or label them as examples |
| `/quotes/` | Public page, title "quotes", raw tag slugs, "BROWSING AS VISITOR" | Noindex and remove from nav, or design it as a real Quote Library page |
| `/dev-admin/` | Public URL in the sitemap | Set the Ghost page to private or noindex |
| Site-wide banner | "Dialecta is in active development. Tell us what you see." | Fine for now; remove when the cleanup lands, or it reads as permanent |
| `/pact/` header | "Dialecta MMXXVI" appears twice, then "§ I", then "§ III" (no § II) | Section numbering |

## Prose check

Hard rules are the ones a regex can decide: em dashes, en dashes, `--`, stacked exclamation points. Everything else is a reader's call and is reported below by page.

### Hard-rule results

| Page | Words | Em dash | En dash | `--` | Note |
|---|---|---|---|---|---|
| Home | 356 | 0 | 0 | 0 | |
| About | 732 | 0 | 0 | 0 | Clean |
| Guidebook | 2,193 | 0 | 3 | 0 | "Level 1–2", "5–7", "0–10": hyphens |
| Pact | 1,223 | 0 | 1 | 0 | "§ II–VIII" footer |
| Stewards | 2,536 | 2 | 0 | 0 | Practitioner Order, Declared Order |
| Fingerprint | 899 | 0 | 0 | 0 | Clean |
| Community | 263 | 2 | 0 | 0 | Both in seeded persona bios |
| Articles (5 posts) | 7,223 | 13 | 0 | 32 | Author prose; see note below |

The platform copy is nearly clean on the hard rules. Someone already did a dash pass. The articles are a different matter: "On the Far Shore of Fear" has 32 `--` pauses and "The Moment You Stop Waiting" has 10 em dashes. Whether the Editorial Voice applies to author prose is a decision for you. The Article Editorial Template says the platform doesn't shape an author's voice, and I'd hold to that for other writers; your own two pieces are yours to bring in line.

### Reader-level findings

**About.** The strongest writing on the site and the closest to the guide already. Two things. "Excellence as invitation, never as gatekeeping" and "not as a compromise of its standards but as the fullest expression of them" are the antithesis pattern the guide flags: the second half already sits inside the first. And the pull-quote attribution "From the Stewards session, the mission statement beneath the mission statement" is process narration; a visitor doesn't know what a Stewards session is. Attribute it to Dialecta or drop the attribution.

**Guidebook.** The page's problem is scope, not sentences, but the sentence-level pattern is the same one throughout the site: pairs of contrasting clauses where one would do. Eleven "X, not Y" constructions in 2,200 words ("discouraged not by censorship but by classification", "observed, not judged", "to protect discourse, not to punish people", "Transparency is the feature, not a disclaimer", "The AI is a mirror, not a gatekeeper"). Each is fine alone. Together they become the page's rhythm, and the rhythm reads as the platform reassuring itself. Keep the two or three that carry a real alternative a reader would otherwise assume (mirror, not gatekeeper earns its place) and cut the rest. Eight intensifiers ("genuinely interesting", "what they actually think", "nobody really understands"): the guide's rule is to trade the adjective for its evidence, and "genuinely" is the tell that the sentence knows it's thin. "Self-declaration isn't just metadata. It's a commitment" is the fake reveal. The sample engine message on this page still says "This reads as The Heat: it expresses strong feeling but doesn't identify a specific claim to support or challenge. Want to add one before posting? Or post as-is." That's three sentences and a question; v1.2 caps it at two plus the door. The Heat reference message in the voice doc is the replacement.

**Pact.** Same pattern, denser: nine antithesis pairs in 1,200 words ("Not terms and conditions. Not rules imposed from above.", "not to judge it but to describe", "disclosed, not hidden", "not friction. They are ritual", "not a score, not a judgment"). Section VI, "This platform is trying to grow you", promises private pattern tracking that the guide's speaker table says the platform may not promise ("outcomes"). The four named patterns (Emotional Frontloading, Tribal Reflex, Certainty Performance, False Binary) are a good idea, but this is the signing page, and they're a second lecture before the signature. The commitment paragraph itself ("I am here to engage with ideas, not to signal my team...") is the one piece of prose that should survive untouched; it's the contract. "It's the system working exactly as designed" is a strong line and earns its place. "The waits are disclosed, not hidden. They are not friction. They are ritual." is the conviction drumbeat, three short assertions where the middle one carries nothing.

**Stewards.** Nine intensifiers, five antithesis pairs, two em dashes. The writing inside each Order is vivid and specific ("Pieces shorter than the comments they generate", "Feels like a letter from a smart friend") and mostly passes the guide's own test: each Tell tells the reader something. The problem is volume and order, covered above.

**Fingerprint.** Reads well, and it is the one page written almost entirely in the observational register the voice doc asks for ("Magnanimity sits shorter than its neighbors because she is sharper than she is generous"). Two notes: "That's the point." after "some petals bloom faster than others" is the label opener; delete it. And every archetype is "she", which is a deliberate choice and reads fine, but "The Skeptic ... The halo reads cool steel: she works in philosophy" describes a seeded persona as if she were a member, the same problem as the Community page.

**Community.** The seeded bios ("Ten months on Dialecta, about ninety comments") state facts about people who don't exist on a five-month-old site. Real bios are fine; Kathryn's and Rylie's read as people. The "VIEW THEIR WRITING →" link under "Anonymous" and under members with no writing goes to an empty list.

**Home.** The CTA card copy, "Join the conversation. Classify arguments, map your position, track how your thinking evolves." lists three features, two of which (opinion maps, delta tracking) aren't live. One true sentence beats three aspirational ones: "Write a comment and see how it reads."

### What the check can't see

The voice doc's biggest rules are judgement calls, and the site's real drift is against those, not the dash rules: the meta move (pages that describe the platform describing itself), directive prose in the explainer pages ("Be specific. Name the problem, propose the change, say why it matters."), and generic-truth over-validation ("Transparency is the feature, not a disclaimer", true of any platform that says it). The antithesis count is the measurable proxy. Bring it down and the pages get shorter on their own.

## Suggested order

1. Fix the eight visible bugs in the table above. Half a day in the theme and Ghost admin.
2. Decide the seed-persona question (retire or label). It affects Community, Fingerprint, one article, and the Pact quiz.
3. Restructure: home band, nav to five items, Pact cut to its job, Guidebook trimmed, Stewards and Fingerprint off primary nav.
4. Prose pass on About, Pact, Guidebook in that order, against v1.2. Run `python scripts/voice_check.py` on the extracted text before publishing; the hard rules should be zero and the antithesis count under three per page.
5. Update the engine message in `api/classify.js` and the sample on the Guidebook to the v1.2 reference messages, as one commit.

Not touched here: the signed-in experience (composer, profile, comment flow), which needs an account and a real comment to review.
