# The road to launch

*Written 2026-09-20 by the convener, from measurement rather than estimate. Companion to
`docs/plans/phases-and-missions.md`, which covers readying the Council and the four missions. This
one covers getting to a site worth visiting and then to one that pays for itself. Vocabulary:
`docs/GLOSSARY.md`.*

## Six numbers, all measured today

| | | What it means |
| --- | --- | --- |
| `apps/web` | **315 lines** of TypeScript, 6 pages, 1 component folder | The Next.js build has barely started |
| Recovered production API | **52 handlers** across 20 areas | What a working Dialecta actually needs |
| Published comments | **0** | All 3 comments sit at `pending_review`. No reader has ever seen discourse on this site |
| `auth.users` | **0** | Nobody has ever signed in |
| Visitors, all time | **269**, 6 real people, 0 paying | |
| Monthly floor | **$78**, or 19 annual memberships at $50 | `council/treasurer/positions/monetization.md` |

**The gap between 315 lines and 52 handlers is the plan.** Everything else is downstream of it.

## One number nobody should trust

The funnel says 269 visitors produced 6 real people, so roughly 17,000 visitors would produce 19
memberships. **That was measured on a site with nothing published on it.** It is not the
conversion rate of Dialecta. It is the conversion rate of an empty page, and it is the single
worst input in any forecast anyone has made here, including mine.

Treat it as a floor, not an estimate, and **re-measure it the first week there is something to
read.** Every phase below that depends on funnel arithmetic is provisional until then.

---

## Phase 1: Stop the bleeding

*Days. Nothing else should start first.*

| Item | Owner |
| --- | --- |
| Close the comment spoofing hole in the deployed API. Anyone can post as any member; the text is unpublished but `axis_events` and notifications fire on the service key regardless | `builder`, gated by `reviewer` |
| Ratify adopting the live schema. Every later phase writes to that database | **Dan** |
| Fix the three-value enum stored as a boolean, which silently loses "partially" | `migrator` |
| Grant-revoke migration, shipped with any new write policy rather than after it | `migrator` |

**Done when** a forged comment cannot reach `axis_events`, and `supabase/migrations/` describes
the database.

## Phase 2: Build the thing

*The long pole, and the honest one. This is M1 plus M4.*

315 lines against 52 handlers. The recovered production source is the specification nobody wrote:
it is quarantined in `_recovered/`, it works, and it is the only description of what the platform
does that is not aspirational. Read it, promote deliberately, never wholesale.

| Item | Owner |
| --- | --- |
| Auth, with the claim token before the provider decision | `builder`, `security`, `reviewer` |
| The article surface: submit, classify, publish, polish, amend | `builder` |
| The comment surface: submit, classify, the card, the Contrast Strip | `builder` |
| The profile and fingerprint surface | `builder` |
| Notifications and the digest | `builder` |
| Axis mapping, which needs a signature change rather than a retune | `builder`, `reviewer` |
| Conformance against the specs, and the four places citing a Stage 2.5 that exists nowhere | `spec-reader` |

**Done when** a stranger can read an article, sign in, comment, get classified, and see their own
fingerprint, on `apps/web`, without a single path writing a row it did not authenticate.

## Phase 3: Make it good

*M3. Needs Phase 2, because you cannot review what does not exist.*

`designer` already holds computed findings waiting on this: the Heat text token has to flip
direction entirely rather than darken, the spacing scale is proposed at 8/16/24/48, and the
comment card's four groups are separated by nothing but ad-hoc margin. None of that needs
re-deriving; it needs applying and then a full pass on everything Phase 2 built.

**Done when** every page has a verdict and a ranked change list, and each change is either built
or recorded as a decision not to.

## Phase 4: Fill it

*Can start now. Does not wait for Phases 1 to 3, and should not.*

This is the phase most likely to be deferred and least able to afford it, because an audience
takes longer to build than software and nothing else can start it.

| Item | Owner |
| --- | --- |
| Dan publishes. Cadence matters more than volume | **Dan** |
| Recruit contributing authors. Three arm's-length writers beats thirty followers | **Dan**, with `circulation` once it exists |
| Decide what a Dialecta article is, so a recruited author knows what they are agreeing to | `voice-editor`, `philosopher` |
| Publish the three comments that exist, or decide they should not be | **Dan** |

**Done when** there is a month of published work a stranger would read, and at least one author
who is not Dan.

## Phase 5: Tell people

*Needs Phase 4. Advertising into an empty site converts nobody and teaches you nothing.*

Dan's own instinct is the strategy: **articles shared onto other platforms, not adverts pointing
at a homepage.** A shared article carries its own proof. An advert asks a stranger to take the
site on trust, which is the one thing a new publication cannot ask for.

| Item | Owner |
| --- | --- |
| Where Dialecta's readers already are, and what reaches them | `circulation` |
| Whether paid acquisition is worth anything at this scale, with arithmetic | `circulation`, contested by `treasurer` |
| Whether growth tactics corrupt what the platform rewards | `philosopher`, and this is a real debate rather than a formality |
| **Re-measure the funnel on a site with content** | `circulation` |

**Done when** the funnel has been measured twice on a real site and the second number is
trustworthy.

## Phase 6: Charge

*Needs Phase 5. M2's decision, then the build.*

The model already exists and has never been wired: `Underwriter`, with a Charter badge for the
first hundred, peer gifting and lifetime grants, all in `_recovered/api/_subscription-tier.js`
and migrations 031 to 035. It has no price and `getTierCapabilities` has no caller.

One finding constrains this phase before it starts. `philosopher` filed it today with a source:
**any price, not its size, switches a member from social norms to market norms** (Heyman and
Ariely 2004). A voluntary membership does not escape that by being small. The control is a wall
keeping payment status out of the classifier, the vote weight and the nomination panel, which
`designer` has already committed to funding.

**Done when** 19 people pay, or the model is honestly declared wrong and replaced.

---

## What this says about time

No date, because two things are unknown and both are load-bearing: how long Phase 2 takes against
a 315-line starting point, and what the funnel does once there is something to read.

What can be said: **Phases 4 and 5 are the long ones, not Phase 2.** Software is bounded work with
a known shape. An audience is not, and it is the only input to profitability that cannot be
bought at this budget. That is the argument for starting Phase 4 today rather than when the build
is ready, and it is the same argument the treasurer's arithmetic already makes from the other end.

## The seat nobody holds

`treasurer` owns what it costs. `designer` owns whether they come back. **Nobody owns whether
anyone arrives.** That is the acquisition gap, and acquisition is the binding constraint on
profitability by the treasurer's own numbers.

**Proposed seat: `circulation`.** The newspaper word for the department that gets the publication
into readers' hands and grows readership, which is exactly the job, and it avoids importing
marketing vocabulary the glossary rules out. It owns distribution, audience growth, the share
surface, paid acquisition when it is worth anything, and the funnel measurement nobody has ever
taken honestly.

**The cost, stated rather than buried.** The composition log measured debate cost at roughly N
squared position reads, and warned that past about five advisory seats the chair's 700-word
synthesis cap starts dropping arguments to fit, which is leaving seats out moved downstream where
nobody sees it happen. The advisory bench is at five. A sixth is not free, and the honest answer
is that the chair's digest rule has to land with it rather than after it.

**Where it stops.** `treasurer` owns advertising as a revenue source and has vetoed it on the
MetaFilter evidence. `circulation` owns advertising as an acquisition cost, which is a different
question with a different answer. `designer` owns the surface a visitor lands on; `circulation`
owns how they got there. `philosopher` will contest it on whether growth tactics corrupt what the
platform rewards, and that contest is the reason to have the seat rather than a reason not to.
