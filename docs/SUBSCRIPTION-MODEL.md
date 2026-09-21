# The subscription model

*Assembled 2026-09-21 from `_recovered/api/_subscription-tier.js`, migrations 031 to 035, and the
live database. It exists, it is more complete than anyone remembered, and it has never been wired.*

**Live today:** 14 profiles, 1 on `pro`, 13 on `free`, 1 carrying the Charter flag, 0 gifted. No
payment integration anywhere. `getTierCapabilities` has no caller. `upgrade_url` is `null` in both
tiers with the note `TUNING: set when /pricing or /upgrade exists`.

---

## Two tiers, and one of them is never called Pro

| | Internal key | Label |
| --- | --- | --- |
| Free | `free` | Free |
| **Underwriter** | `pro` | **Underwriter** |

The internal key stays `pro` to match `profiles.subscription_tier` from migration 031. The API and
the database can flip together in a coordinated pass later. The display label is Underwriter.

**Copy rule, written into the source:** never "Pro", "Premium" or "Plus" on any user-visible
surface.

`subscription_tier` is `text` with a CHECK rather than an enum, deliberately, so a named higher
tier can be added by relaxing a constraint instead of altering an enum. It currently allows exactly
`free` and `pro`, and the migration names `pro_plus` and `foundational` as the kind of thing that
could follow.

## What the money actually buys

The pitch is in the source, on the free tier's upgrade blurb:

> Underwriters keep Dialecta free to read. Iterate polish without limit. See more of the framings
> the engine considered.

That is patronage first and access second, and the matrix backs it up: **the free tier keeps every
identity surface.** The paid gates are depth, coaching and the cycle.

| Capability | Free | Underwriter |
| --- | --- | --- |
| Opinion-map candidates | 2 | Unlimited, skill default of 3 applies |
| Polish runs per session | 2 | Unlimited |
| Self-snapshot visible | Yes | Yes |
| Full history scroll | Yes | Yes |
| Aspiration declaration | Yes | Yes |
| Voice One scaffold | Yes | Yes |
| Snapshot annotations, recent | 3 | Unlimited |
| Snapshot annotations, full archive | No | Yes |
| Practice Layer coaching | No | Yes |
| 90-day recommitment prompts | No | Yes |

The first two rows are live capabilities with a consumer. **The eight Growth Layer rows are
scaffolding that lands as no-ops** until the Self-Snapshot Engine and History Scroll ship. They
become the canonical gate for archive depth, coaching and the 90-day cycle on that day.

## The three founding cohorts

All three compose from three independent columns, so a person can be in more than one.

| Cohort | Who | `is_charter` | `is_gifted` | `gift_expires_at` | What they get |
| --- | --- | --- | --- | --- | --- |
| **Charter Writers** | First 25 published authors | true | true | `NULL` | Lifetime comp |
| **Charter Underwriters** | First 100 paying members | true | false | n/a | Paid recurring at a locked founding price |
| **Founding Voices** | First 50 active commenters | false | true | `now() + 1 year` | One year comp |

`gift_expires_at IS NULL` while `is_gifted` is true means lifetime. A set value means the gift
lapses then.

**The Charter badge is permanent.** Set at upgrade time and never revoked, even if the subscription
lapses, which is why it is a separate column from the tier rather than derived from it. The theme
renders it as a faint brass ring around the Underwriter dot.

## Peer gifting

`is_gifted` plus `gifted_by_member_id` records that another member bought a year for this one. The
migration's own words on why it is separate from the tier: it is for someone who "cannot pay
themselves but is honored by a peer's gift, which is a different thing."

## What has to exist before anyone can pay

| | State |
| --- | --- |
| A price | **Does not exist.** This is the decision |
| A pricing or upgrade page | Does not exist. `upgrade_url` is `null` in both tiers |
| Payment integration | Does not exist. The migration anticipates "a future payment webhook" setting `subscription_tier_set_by` to `'system'` |
| A caller for `getTierCapabilities` | Does not exist on either side |
| The Growth Layer engine | Deferred. Eight of the ten capability rows are inert without it |

## The constraint that binds this before it starts

`philosopher` filed it with a source: **any price, not its size, switches a member from social
norms to market norms** (Heyman and Ariely, 2004). A voluntary membership does not escape that by
being small.

The control it asks for is a wall keeping payment status out of the classifier, the vote weight and
the nomination panel. `designer` has committed to funding that wall. It has no phase number yet.

## The price decision itself

$50 a year against $100, and nothing in this repository carries demand data either way. What the
structure says about it:

- **The locked founding price is a real mechanic**, not a marketing line. The first 100 keep
  whatever number is chosen, permanently. Choosing low is therefore a permanent commitment to a
  hundred people rather than a launch promotion.
- **The pitch is patronage.** "Underwriters keep Dialecta free to read" prices access to a
  conscience rather than to a feature, which historically tolerates a higher number than a feature
  ladder does, and which makes the thin free-tier gating a feature rather than a weakness.
- **Eight of the ten paid capabilities do not exist yet.** Charging $100 for two editor limits
  being lifted is a different proposition from charging $100 once the Growth Layer ships.

The sequencing consequence: a number has to exist for the Vercel licence and the gifting rebuild,
and it does not have to be charged on the day it is set.
