# The multi-phase path to a launched, profitable Dialecta

*Framed by the convener 2026-09-20 for the full advisory bench. Protocol:
`.claude/skills/dialecta-council/SKILL.md`, amended today for six seats. Chaired by `decider`.*

## Question

**What are the phases between today and a Dialecta that is launched, good, and paying for itself,
in what order, and what has to be true at the end of each one before the next may start?**

Dan's words: "I need to make sure everything is working, the Next.JS build is complete, there are
many cards in the site that are not fully wired. We need to get the platform seamless, beautiful,
simple, exciting, engaging, and actually fully functioning before we start launching."

## The convener's own plan is entered as a position to attack

`docs/plans/launch.md` proposes six phases. **It was written by the convener alone, and the
convener holds no mandate.** It is in this debate as a position to be contested, not as the frame
the seats argue inside. A seat that agrees with it should say why on its own evidence. A seat that
thinks its phase boundaries are wrong should say so directly.

Its six: stop the bleeding, build the thing, make it good, fill it, tell people, charge.

## Measured, not estimated. All on 2026-09-20

| | |
| --- | --- |
| `apps/web` | **315 lines** of TypeScript, 6 pages, 1 component folder |
| Recovered production API it replaces | **52 handlers** across 20 areas |
| Published comments | **0**. All 3 sit at `pending_review` |
| `auth.users` / `auth.identities` | **0** and **0**. Nobody has ever signed in |
| Whole database | about **91 rows** |
| Visitors, all time | **269**, of which 194 direct, 54 from Facebook |
| Real people | **6**, of whom 3 arm's length, **0 paying** |
| Monthly floor | **$78**, covered by 19 annual memberships at $50 |

## Constraints already decided, which you argue inside rather than against

1. **The site is finished before anyone is invited to it.** Dan, today: a messy site changing
   under their feet could lose people, and one or two weeks of building is worth trading for a
   better launch. He also said his hunch is that this route reaches profitability *faster*.
2. **Adopt the live Supabase schema**, plus a UNIQUE constraint on `axis_scores`. Squash is the
   convener's recommendation and `migrator` is testing whether it actually works.
3. **Ghost is being retired entirely.** Any mechanism that routes through the Ghost Admin API is
   dead, including the recovered peer-gifting flow.
4. **Advertising as a revenue source is vetoed** on the MetaFilter evidence. Advertising as an
   acquisition cost is a separate live question and is `circulation`'s.
5. **Dialecta is operated from Arizona.** Ninth Circuit, not Second.

## What the seats should not re-derive

Read these before writing. They are filed and they are yours or a colleague's:

- `docs/plans/launch.md`, the position under attack.
- `docs/plans/phases-and-missions.md`, M1 in particular, which now carries the claim-token
  requirement and the live comment-spoofing hole.
- `council/circulation/research/2026-dialecta-funnel-correction.md`. **The 17,000-visitor figure
  is retired.** It was measured on a site with nothing published. There is no corrected number.
- `council/treasurer/positions/monetization.md` and the Underwriter handoff
  `exchange/open/2026-09-20-convener-01-handoff-underwriter-tier-recovered.md`.
- `council/security/positions/nextjs-rebuild.md`.
- `council/legal/positions/2026-09-20-tier-label-first-party-speech.md`.
- `council/designer/positions.md`, D-24 through D-26, contrast and spacing.
- `philosopher` P-9: **any price, not its size, switches a member from social to market norms.**

## The three questions inside the question

Answer whichever your mandate reaches. Do not answer all three unless all three are yours.

**One. Is "a week or two" survivable?** 315 lines against 52 handlers. This is entered as a
question to be tested with evidence, not a budget to plan inside. If it is wrong, say so and say
what the real shape is. `builder`, `reviewer` and `spec-reader` own this; the advisory seats own
what it costs them if it is wrong.

**Two. What does "finished" actually mean, and who decides it is?** Dan's list is seamless,
beautiful, simple, exciting, engaging, fully functioning. That is six words and no test. A phase
boundary nobody can check is not a boundary.

**Three. What must be true before the first stranger arrives?** Not what would be nice. What
would make an arrival a wasted shot, given Dan's own judgement that a first impression happens
once.

## Positions

*Six briefs, verbatim and unedited, in the order they landed. Each was written by its own
author, never by the chair, which is what the amended protocol requires. Full positions are at the
paths above; read one only if you intend to engage it.*

### builder

"A week or two" does not survive contact with the code. My estimate: 6 to 10 weeks of
focused work, not 1 to 2. Strongest evidence: the whole current app, all 315 lines of it,
is smaller than one recovered file. `profile/[id].js` alone is 1,880 lines and multiplexes
eleven operations behind a single path via `req.method` and an `id` sentinel. The 52 figure
also undercounts: 38 are real routes, 14 are shared helpers, and the 38 route files average
289 lines each, roughly ten times denser than anything built so far. Auth, sanitization, and
moderation, the pieces every write path depends on, exist in neither codebase yet.

---

### security

The single control that must exist before the first stranger arrives is closing
`profiles.ghost_member_id` as a public credential, because it is the one path reachable today with
no signup, no session, and no phase boundary standing in front of it. `api/comment.js` takes
`member_uuid` from the request body and checks only that it is a non-empty string, line 123, then
matches it against a column `anon` can already read, since `profiles_select` runs `USING (true)`.
The database publishes its own proof of identity. A matched post runs on the service key, so RLS
never sees it, and immediately writes `axis_events` against a named person's fingerprint. That is
live now, not at launch.

---

### designer

Dan's six words split into two kinds of claim, checked as one. Four, fully functioning, seamless,
simple, beautiful, are checkable now: a spec section, a breakpoint, a nav count, a contrast
ratio. Two, exciting and engaging, describe a relationship with a stranger who doesn't exist yet,
and Dialecta has never instrumented it. A boundary built from six adjectives can't fire before the
arrival it protects, since only that arrival proves the last two. Strongest evidence: D-2's silent
disabled button and D-13's identical Stance and Breach colour are what an unchecked "seamless" and
"beautiful" already let through. Split the six into a pre-arrival gate and a post-arrival target,
or say plainly it can't be checked.

---

### treasurer

Dan's hunch holds, but only on one condition the launch plan doesn't yet state: the floor is too small to be a reason to rush, so the numbers side with him, provided Phase 4 (publishing, audience-building) runs now rather than after Phase 3. A week or two of extra build time costs roughly $20 to $40 in incremental floor spend, small enough for the whole debate to round to zero, against a first impression on a visitor pool this platform cannot afford to reacquire: no capital to front, no channel left but Dan's own hours, and the warm list already spent. Sequenced with Phase 4, slow is cheap. Sequenced after it, fast is not free either.

No phase before six earns a dollar, and only one phase event moves the floor at all.

| Phases | Floor effect |
| --- | --- |
| 1, 3, 4, 5 | $78/mo flat, or higher once Pennington Media Group's Supabase bill is found and added |
| 2, at Ghost cutover | $15.65/mo off, about a fifth of the floor. Can't land before Phase 2 ships a working replacement |
| 6 | First dollar in |

Resend doesn't move with any of it. It was headed for cancellation, $240 a year for two delivered emails; it's now the SMTP relay magic-link sign-in needs past member fourteen, corrected today. That lever is gone regardless of order, and the floor sits at $78 to $110 a month through every phase but the last.

Dan's hunch clears on that condition alone: Phase 4 has to run now, parallel to the build, not after Phase 3 as the order implies. The convener's own math agrees with this seat's: software is bounded, an audience is not, and it is the one input to profitability this budget cannot buy. Publishing after polish costs the weeks twice, once in the floor and once in a calendar Phase 5 cannot start until Phase 4 has something to tell people about. Run them together and the floor stops deciding speed. The audience clock does, and it should already be running.

On Underwriter: decide the price now, charge later. Setting the number costs nothing, an entry in a config file where `upgrade_url` currently sits null. It's already overdue: Vercel's Hobby plan is non-commercial only, and stops being legal the moment a membership exists, not the moment one is billed. Waiting for Phase 6 to decide also leaves Phase 3's UI (the Charter badge, "Underwriters keep Dialecta free to read") built against a number nobody has chosen, and leaves the peer-gifting rebuild against Supabase and Stripe unscoped all the way to Phase 6 with nothing forcing that wait. None of this requires showing a member a price early. Deciding and charging are two different events; the phase order as written collapses them into one, at the end.

Philosopher's P-9 is right and doesn't move this recommendation: a price switches norms by existing, not by its size, so there's no smaller-fee escape route and none is proposed here. What answers P-9 is structure, and the Underwriter design already has it, independently of this debate: free gates editor depth, never reading, commenting, or classification. Deciding the number early doesn't touch that wall. Exposing it before Phase 6 would, and that stays out.

The 17,000-visitor figure doesn't survive its own measurement: it came from a site with nothing published, and every number downstream of it, this seat's own included, inherits that flaw. What's missing is a funnel measured with content live. It cannot exist before Phase 4 publishes something, so the sooner Phase 4 runs, the sooner that number does too.

---

### circulation

The binding precondition for a first stranger isn't a content backlog, a second channel, or a
corrected funnel number. It's that the comments they find are alive. Every one of Dialecta's 269
recorded visitors, and every reader who clicks a shared article next, arrives at a site where zero
comments have ever been published; all three that exist sit at `pending_review`. A shared
article's whole promise is arguing worth reading. Right now the arguing isn't there to find. That
gap is measured, not guessed, and it turns an arrival into a wasted shot before anything else gets
the chance to.

### The funnel number

We retired 17,000 and correctly didn't invent a replacement. What to plan against instead isn't a
number, it's a test: a rate is trustworthy once real discourse is visible and genuinely cold
traffic, not direct or personal-network, has landed on it. Neither condition holds today. Both
converge after Phase 4 makes discourse visible and Facebook has run a month against it. That's
where re-measurement happens, early Phase 5, not before. Until then, plan against the
dormant-baseline number instead: at roughly five visitors a week, Dialecta gains about one member
every two years, the cost of waiting, not a forecast.

### The second channel

Facebook is 100 percent of non-direct arrivals, 54 of 269 visitors: MetaFilter's own concentration
failure, repeated. It doesn't need a second channel to launch. HN and Reddit are single-shot,
better triggered by a genuine reader than by Dan's own account, so the first channel proves out
first. What must be true: a second channel exists before Facebook is trusted as the plan, before
Phase 6 opens, not before Phase 4 or 5. One move costs nothing and doesn't wait on a stranger at
all: email the ten idle, already-paid-for Resend subscribers, reactivation rather than acquisition,
but a second line already owned.

### Instrumentation

Ghost's native analytics produced every number in this debate. Ghost is being fully retired, and a
direct check of `apps/web` found no analytics anywhere in it. Nothing is named to replace it. It
has to land inside Phase 2, the same phase that ships article, comment and auth, the exact moment
a stranger becomes able to do anything worth counting. Ship it later and the single most valuable
cohort in the plan, the first strangers on a working site, leaves unmeasured. That data can't be
recreated once the moment passes. Plausible is a real, license-clear candidate, already researched;
self-host or Cloud is treasurer's call.

### Backlog or cadence

Cadence over backlog, on this seat's evidence, though neither is the deciding axis. The share is
the unit, not the site: one article meets one reader in one post. A backlog of ten unpublished
pieces tests nothing; publishing the first piece Phase 4 can support starts the only diagnostic
that shows which piece a channel actually carries. Stratechery, Substack and Defector sit `todo`,
unfiled: no outside evidence either way. What is filed: the comments problem above outweighs
article count for whether an arrival converts. A tenth unpublished draft fixes nothing a stranger
sees. Three visible comments under the first one does.

### The correction

X's Card documentation isn't paywalled. Checked live today: `developer.x.com`'s Cards page now
redirects to a generic landing page, and the `docs.x.com` equivalent 404s. Gone, not gated. The
recommendation doesn't change: prefer `twitter:card=summary` over the large-image format, since a
spec nobody can read argues for the conservative option either way. What's still uncorroborated is
the headline-stripping claim itself: one commentator plus 2023-2024 press, with no live doc left
to check it against.

---

### philosopher

A phase plan is a sequence of decisions about what the platform does to a person, not just to a
codebase, and this plan's six "done when" tests never check that. The clearest proof: Phase 2's
own done-when is a stranger seeing their fingerprint, which means the public Archetype ships
before Phase 5 ever invites anyone, and P-11 already established that the Archetype has no
contest mechanism at all, not even the weaker version community re-review gives a comment. Order
in this plan protects the codebase. It does not protect the first person the codebase gets wrong.


## Rebuttals

## Chair roll-call

**builder** carried its central claim: "a week or two" does not survive contact with the code,
6 to 10 weeks for a full rebuild, on the evidence that the entire current app (315 lines) is
smaller than one recovered file (`profile/[id].js`, 1,880 lines, eleven operations behind one
path), and that the 38 real recovered routes average 289 lines each against nothing built so far.
Unsoftened, uncontested by any other seat on the number itself. Builder's second claim, that the
read-only front page and article view is "the honest minimum" if forced into a one-to-two-week
budget, was **conceded** in its own rebuttal after circulation showed it wastes every arrival the
same way it wasted the first 269; builder called it plainly "not a smaller Dialecta, a different
product." In its place builder's rebuttal **carried** a new, unopposed claim: a roughly
three-week vertical slice, one article page, one comment-write path, one `classify.js` call, one
rendered card, moderated by hand through Supabase Studio rather than a built queue, beats both the
full rebuild and the hollow cut on cost as well as coherence. Builder also **carried** the claim
that security's identity fix sits inside that slice as the same task, not an addition, which is
why the slice cannot be cut thinner to hit budget. Builder's closing concession to philosopher,
that one working thread does not let a stranger see classification "reflect rather than gatekeep"
across enough cases to trust the platform's claim, stands **unresolved**: no seat, including
philosopher, names the volume that would.

**security** carried the debate's sharpest priority claim: the one control that must exist before
any stranger arrives is closing `profiles.ghost_member_id` as a public credential, since
`api/comment.js` accepts a body-supplied `member_uuid`, checks only that it is non-empty, and
matches it against a column `anon` can already read because `profiles_select` runs `USING (true)`,
live today, reachable by nobody's phase boundary. Uncontested. Security's initial placement of
that fix "ahead of phase one" was **retracted** in its own rebuttal in favor of the fix riding
inside the comment-write feature itself, alongside an hours-scale stopgap (revoke the
`anon`/`authenticated` SELECT grant) available immediately and a new, additive one-to-two-day
spend cap on `/api/classify`. That retracted-and-relanded position **converged independently**
with builder's own rebuttal, neither seat having read the other's before landing there. Security
also **carried**, unopposed, the standing rule that any phase-exit claim about a security property
must name how it was checked, a live query or a test, never a doc or a field name, after three
separate traps the same day where a source's own account of itself (Next.js's docs,
`information_schema.role_table_grants`, `identity_data.email_verified`) was trusted over what it
actually did. Security's answer to philosopher's Archetype visibility default, that it is real
but **not currently enforceable**, a migration against a live session that does not yet exist
since `auth.users` is empty, stands as a correction philosopher did not get a further round to
answer; the underlying placement in Phase 2 is **unresolved**, not refuted.

**designer** carried, unopposed, the debate's answer to the framing's own second question: split
Dan's six words into four checkable now as a per-page verdict (fully functioning, seamless,
simple, beautiful) and two that cannot be checked before a stranger exists to prove them (exciting,
engaging), on the evidence of two defects an unchecked "seamless" and "beautiful" already let
through, the composer's silently disabled button (D-2) and the Stance/Breach colour collision that
fails under every tested form of colour blindness (D-13). Designer also carried its correction of
the convener's own plan: right that a full design verdict wastes itself on 315 lines, wrong to
push the ink-token and spacing decisions into Phase 3, since they need only Dan's sign-off, not a
built page, and building blind against them is what produced the comment card's own ad hoc margin.
Designer's claim that the share card is the real front door, cached by Facebook the moment it
renders and unpatchable after, and needs the same token and tier-ink contract as the site before
first render, was carried and converges directly with circulation's own channel-concentration
finding.

**treasurer** carried its central conditional: Dan's hunch that slow is safe holds, but only if
Phase 4 runs now, parallel to the build, rather than after Phase 3 as the plan's order implies,
since a week or two of extra build time costs only $20 to $40 in incremental floor spend against a
visitor pool the platform cannot afford to reacquire. No seat opposed the condition; circulation's
own cadence argument reinforces it. Treasurer's recommendation to decide the Underwriter price
now, free, a config-file entry, while still charging only at Phase 6, was carried unopposed on its
own mechanics, including the finding that Vercel's Hobby plan turns non-compliant the moment a
membership exists rather than the moment one is billed. Treasurer's use of philosopher's P-9 to
argue that deciding a number in private does not itself flip the social-to-market norm switch was
**carried on the narrow point** (nothing is shown to a member early); it leaves philosopher's
separate, broader doubt about Phase 6 itself untouched and **unresolved** (see philosopher,
below). Treasurer's retirement of the 17,000-visitor figure was carried and matches circulation's
independent retirement of the same number.

**circulation** carried the debate's binding precondition: the gate before any stranger arrives is
not a content backlog, a second channel, or a corrected funnel number, it is that the comments
they find are alive, since all 269 recorded visitors and every reader who follows a share link
have met a site where zero comments have ever published. This is what turned builder's read-only
cut from a live option into a conceded failure. Circulation's proposal to plan against a
dormant-baseline number, about one member every two years at roughly five visitors a week, rather
than inventing a replacement for the retired 17,000 figure, was carried unopposed, as was its
timing claim that real re-measurement cannot happen before Phase 4 publishes and a month of
Facebook traffic runs against it, early Phase 5. Its finding that Facebook is 100 percent of
non-direct arrivals and does not need a second channel to launch, only before Facebook is trusted
as the whole plan, before Phase 6, was carried, with the free, immediate move of reactivating ten
idle, already-paid Resend subscribers unopposed. Its claim that analytics has to land inside Phase
2, the same phase that ships article, comment, and auth, or the single most valuable cohort in the
plan goes unmeasured and unrecoverable, was carried unopposed; the hosting choice, self-host
versus Plausible Cloud, was explicitly handed to treasurer and remains **unresolved**. Its
cadence-over-backlog preference was carried as its own call, explicitly flagged as not the
deciding axis. Its correction that X's Card documentation is gone rather than paywalled was a
minor self-correction that changes no other seat's position.

**philosopher** carried its structural critique that the plan's six done-when tests check the
codebase and never the person on the other end of it, proven by Phase 2's own done-when shipping a
stranger's fingerprint, and with it the public Archetype, before Phase 5 ever invites anyone, with
no contest mechanism at all, not even the weaker version community re-review gives a single
comment. The specific fix, a visibility default of self-visible-only until an aggregate-level
contest path exists, was found real but **not yet enforceable** by security's rebuttal (a
migration against a session that does not exist), leaving the placement **unresolved** rather than
refuted. Philosopher's reading of P-9, that a price flips social to market norms by existing
regardless of size or timing, and that the real fix is a payment-classifier wall with no phase
number, asked for a Phase 1 slot; **no other seat addressed this claim**, so it stands filed and
**unresolved**. Its doubt that deferring the live charge to Phase 6 last, after Phases 4 and 5
spend months building unpaid norms, is obviously the lower-risk order, was raised directly against
the plan's own assumption and against treasurer's Phase-6 recommendation; treasurer did not engage
it, so it is **unresolved**, not lost. Its demand to publish the three pending comments or decide
on the record why not, before Phase 5 sends strangers to look at nothing, was carried and
converges with circulation's own comments-alive precondition. Its standing constraint that no tier
badge or fingerprint-derived descriptor appear on any share card, regardless of what legal
concludes, was filed and unopposed, though no other seat's share-card work explicitly cross-checked
it, so treat it as carried but not independently verified.

**legal** is silent. It filed four positions dated the same day (`consent-at-the-moment`,
`consent-waiver-and-the-pact`, `ctdpa-sensitive-data`, `tier-label-first-party-speech`), none of
them this question, and nothing under this debate's slug. Its absence leaves unanswered whether
the public Archetype that philosopher flags as Phase 2's own done-when creates defamation or
privacy exposure once anyone but its subject can see it: legal's own standing tier-label analysis,
cited in passing by philosopher, ranks exposure as rising "as the surface moves from comment level
toward person level," and the Archetype is exactly that surface, a durable public characterization
of a named person rather than a verdict on one comment. It also leaves unanswered whether the
Underwriter badge and Charter language treasurer wants priced now needs terms taken by affirmative
act at signup rather than a footer link, and whether media liability insurance, which legal's
standing position calls the correct mitigation and recommends pricing before launch, has been
priced against anything in this specific plan at all.

## Chair synthesis

### The phase plan the debate produced

The six labels survive unopposed. What launch.md got wrong sits inside them: strict linear
sequencing (treasurer), design decisions parked in Phase 3 that need only Dan, not a built page
(designer), a Phase 2 done-when that ships the Archetype with no gate or contest path
(philosopher), and two silences no seat let stand: a live credential hole with no phase in front
of it, and no instrumentation named anywhere (security, circulation).

| Phase | Entry | Done-test |
|---|---|---|
| 1, stop the bleeding | Now | Revoke `anon`/`authenticated` SELECT on `profiles.ghost_member_id`. Hours. Checkable as a grant, not a promise. |
| 2, build the thing | Phase 1 landed | Ghost cutover complete (floor drops $15.65/mo); article, comment-write and auth ship together; the comment path carries a session-verified identity fix and a `/api/classify` spend cap as the same task; analytics lands here, before a stranger can do anything worth counting; the ink-token fix lands the moment the badge is coded; Archetype defaults to self-visible pending a session-keyed migration nobody has written yet. |
| 3, make it good | Phase 2 shipped a real write path | Designer's per-page verdict on four of Dan's six words: every write path authenticated, no silent controls, no 380px overflow, zero token drift, 4.5:1 contrast everywhere. The one done-test in the plan that is fully checkable today. |
| 4, fill it | Now, parallel to 2 and 3, not after | One piece published; ten idle Resend subscribers reactivated, free. Cannot check: a real funnel rate. The 17,000 figure is dead; nothing replaces it until Phase 4 has published and a month of Facebook traffic has run against it. |
| 5, tell people | Contested; see the fork below | Comments alive, not `pending_review`; Phase 3's verdict passed; a second channel proven before Facebook is trusted as the plan. Cannot check: how much discourse a stranger needs to see before trusting the platform's core claim rather than one lucky thread. Nobody names the number. |
| 6, charge | Underwriter price decided now, free | First dollar in. Cannot check: whether landing the live charge last, after Phases 4 and 5 spend months on unpaid norms, is actually the lower-risk order the plan assumes. |

### Where the seats converged

Two convergences arrived from opposite mandates. Builder, reasoning from what a forced two-week
budget could build, first called the read-only cut "the honest minimum." Circulation, reasoning
from what a shared article owes its reader, showed that a site with zero published comments
wastes every arrival the same way it wasted the first 269. Builder conceded outright: not a
smaller Dialecta, a different product.

Separately, builder and security each dropped their own first framing of the comment-spoofing
hole as something standing in front of the build. Security's brief placed it "ahead of phase
one"; its rebuttal retracted that for a fix riding inside the comment-write feature itself.
Builder's rebuttal landed in the same place independently: the session-verified caller replacing
the body-supplied `member_uuid` is already the estimate's biggest line, not an addition to it.

### Where the disagreement is real

Three threads, unresolved. The fork: circulation's alive-comments precondition can be met by
builder's three-week vertical slice or by the full rebuild that alone satisfies designer's
complete verdict site-wide, and nobody adjudicates which one actually gates Phase 5. Second,
philosopher's volume objection survives builder's own concession: one working thread doesn't let
a stranger watch classification reflect rather than gatekeep across enough cases to trust it, and
no seat names the volume that would. Third, philosopher doubts Phase 6 is safer than an earlier
charge, given months of unpaid norms built first; treasurer keeps Phase 6 regardless, and neither
engages the other.

### The options

| Option | Costs now | Costs later | Forecloses |
|---|---|---|---|
| Vertical slice, ~3 weeks | Narrowest build; hand-moderation stands in for a queue | Philosopher's volume problem stays open; a widening pass is still owed before "finished" | A sooner Phase 5, on one path only, not designer's full site-wide verdict |
| Full rebuild, 6 to 10 weeks | Builder's number, unsoftened, against Dan's own week-or-two hunch | Treasurer's $20 to $40 in floor, immaterial | Speed. Nothing else the debate found |
| Read-only cut, 1 to 2 weeks | Cheapest | Wastes the arrival, by builder's own concession | Ruled out by the seat that proposed it |

Phase 4 running now, not after Phase 3, is not itself contested by any seat; treasurer names it
and nobody opposes it. The live fork is between the top two rows.

## Outcome
