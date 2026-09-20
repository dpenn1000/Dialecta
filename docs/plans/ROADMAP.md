# Roadmap, as of the evening of 2026-09-20

*Supersedes the phase order in `docs/plans/launch.md`, which the Council contested and which the
day's findings have overtaken. Written by the convener. **The phases are the Council's; the
numbers in them are measured; two of the estimates are known to be wrong and are marked so.***

## What changed today, in one table

| Yesterday's belief | Measured today |
| --- | --- |
| The subscription model was never designed | **Underwriter exists.** Capability matrix, five applied migrations, unpriced and unwired |
| The axis mapping needed writing | It existed in production. Now ported, all six axes, 54 tests |
| The Pact is a placeholder | **1,854-line template**, live, eight sections, signed by 3 |
| The Ghost theme is lost | **Exported.** 42 files, every template |
| The front end must be written | **76,674 lines recovered** from a fourth Vercel project |
| Articles live in Supabase | `articles` is a classification sidecar keyed on `ghost_post_id` |
| The funnel is 269 to 6, so 17,000 visitors | **Retired.** Measured on a site with zero published comments |
| 315 lines against 38 routes, so 6 to 10 weeks | **Re-running.** The estimate did not know a started App Router migration existed |

---

## Phase 0: done today

Closed rather than planned.

- **The live identity-spoofing chain.** `anon` can no longer read `profiles.ghost_member_id`.
  The database no longer publishes its own proof of identity.
- **The stored XSS.** `articles/[slug]` sanitizes before render.
- **Axis mapping.** All six axes to spec, Universal Rule 1 enforced as a cross-cutting guard,
  54 tests against 7.
- **Auth foundation.** Supabase SSR wiring, `middleware.ts` at the correct path for 15.5.25, the
  claim token, `/login` with magic link and Google.
- **The three comments are published.** Dialecta has visible discourse for the first time.
- **The recovered trees are committed**, so none of this has to be found again.

## Phase 1: read what was recovered

*Running now. Not a debate, because nobody has read it.*

| Seat | Reading |
| --- | --- |
| `builder` | Re-running both estimates against the recovered source |
| `security` | How many of 51 components depend on Ghost's session injection |
| `designer` | Which design system is authoritative, spec or the live 3,286-line stylesheet |
| `circulation` | Four OG routes, comment cards, moments, quote pages |

**Done when** each has filed findings and `builder` has a number that knows about the recovered
code.

## Phase 2: the fork, debated

*Needs Phase 1. This is the decision the recovery forces and it cannot be argued from ignorance.*

**Port or rewrite.** 76,674 lines that work, five months old, carrying Ghost assumptions that are
dying, against a clean build that is 315 lines in. Every seat has a stake and none can answer it
alone.

The subordinate questions, each already owned:

- Which design system is authoritative.
- Whether `contributor/[handle]`, moments and `quote/[slug]` are surfaces the rebuild owes or work
  abandoned for a reason.
- Where article content lives once Ghost is gone, since no table holds it.
- `stage` against `delta_of`, which `migrator` established is a product question about the Delta
  mechanic rather than a schema one.

## Phase 3: build

*Order depends on Phase 2. What is already established, regardless of which way it goes:*

- The comment write path needs a real Supabase session, because Ghost's `{{@member.uuid}}`
  injection dies with Ghost. `builder` and `security` reached this independently.
- The claim token lands before P0-6 runs.
- A spend cap on `/api/classify` before comments open, since every write fires a priced call.
- The write-identity fix ships in the same commit as the promotion pipeline, never after.
- Analytics before cutover. Tinybird's vanish with Ghost and the first cohort would go uncounted.

## Phase 4: the Pact

*Can start now. Does not wait for Phase 2.*

Dan has scoped it: three jobs, buy-in, legal concerns, self-selection, with links rather than
training. Four seats reviewed it and produced work that is ready to act on.

- Two sentences in it are **false**, not incomplete: § IV promises every decision is contestable,
  and § VI promises pattern-tracking is private.
- **Nothing in this codebase carries enforceable terms.** No acceptable use, no content licence,
  no liability limit, no governing law.
- The signing ceremony does not run in `apps/web`. 3 of 14 signed is that, not conversion.
- The visibility choice goes in § VIII, reusing the Path A / Path B pattern that shipped and that
  one profile actually used.
- An em dash sits on the commit button, at the moment of signature.

## Phase 5: content and audience

*Uncontested by any seat: runs in parallel with the build, not after it.*

`treasurer` priced it: extra build weeks cost $20 to $40, a burned first impression costs a
visitor pool with no capital behind it. Slow is cheap, sequenced with this. Fast is not free
without it.

`circulation` holds the binding precondition, that the comments a stranger finds are alive, and
the re-measurement gate that replaces the retired funnel number.

## Phase 6: charge

*Needs Phase 5. `treasurer` moved one thing earlier: decide the Underwriter price in Phase 2,
because deciding a number is free and both Vercel's Hobby licence and the gifting rebuild depend
on one existing.*

`philosopher`'s constraint holds: any price, not its size, switches a member from social to market
norms. The wall keeping payment status out of the classifier, the vote weight and the nomination
panel has no phase number yet and should have one.

---

## What is still Dan's

| | |
| --- | --- |
| The ink tokens and the spacing scale | Computed and waiting. Blocked behind which design system is authoritative |
| The Ghost theme question | Answered, and it produced the largest find of the day |
| `stage` against `delta_of` | A product decision about the Delta mechanic |
| The Underwriter price | Free to decide, and other things depend on a number existing |
| Whether `write` is gated | Published, live, 7 visitors, a 39-line React mount |

## What nobody has looked at

Two of the four Vercel projects. `subscription-command-center` and `committee-api` have never been
opened, and two of the other four held things this project spent months without.
