---
id: 2026-09-20-convener-01
type: handoff
from: convener
to: [decider]
subject: The subscription model exists, is named Underwriter, and shipped to production unwired
backlog: none
state: open
opened: 2026-09-20
closed:
outcome:
---

## Done

Recovered the full source tree of deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7` into
`_recovered/`, which is gitignored at `.gitignore:23`. 163 of 163 files, zero failures, via
`node scripts/recover-deployment.mjs`. Nothing promoted into the repo.

**The subscription model was designed in detail and partly shipped.** `treasurer` concluded on
2026-09-20 that "no membership model has ever been designed" and that this position was therefore
"not competing with earlier work" (`council/treasurer/positions/monetization.md`). That conclusion
was reasonable on the evidence available and is now wrong. The work was in the deployment
artifact, which no search covered because the artifact was not known to contain source.

What exists, all verifiable in `_recovered/`:

| Thing | Where | State |
| --- | --- | --- |
| Two-tier capability matrix | `api/_subscription-tier.js`, 98 lines | Written. **Called by nothing.** `getTierCapabilities` has no caller outside its own file |
| `profiles.subscription_tier` | `supabase/migrations/031_profiles_subscription_tier.sql` | Applied. `CHECK (subscription_tier IN ('free','pro'))`, plus a touch trigger and a `subscription_tier_set_by` audit column |
| Charter Underwriter | `supabase/migrations/032_profiles_is_charter.sql` | Applied. Founding-cohort badge for the first ~100 paid members, locked at upgrade and never revoked even if the subscription lapses |
| Peer gifting | `supabase/migrations/033_profiles_is_gifted.sql` | Applied. Stripe one-time 1-year SKU, webhook comps the recipient through the Ghost Admin API, `gifted_by_member_id` records the giver |
| Lifetime grants | `supabase/migrations/034_profiles_gift_expires_at.sql` | Applied. `is_gifted` true with `gift_expires_at` NULL means lifetime, for Charter Writers and founding authors. A daily cron downgrades the rest on lapse |
| Growth Layer schema | `supabase/migrations/035_growth_engine_schema.sql` | Applied |
| Tier reads in live endpoints | `api/admin/member-tier.js`, `api/admin/members.js`, `api/article/[id].js`, `api/comments.js`, `api/profile/[id].js` | Five endpoints already read `is_charter` and `is_gifted` |

The design decisions the matrix records, which are the part a debate would otherwise re-derive:

- The paid tier is **Underwriter**. The internal DB key stays `'pro'` to match migration 031. The
  file states the copy rule outright: user-visible labels are never "Pro", "Premium" or "Plus".
- The positioning line is written: "Underwriters keep Dialecta free to read."
- Free is gated on **editor** limits, not reading: two opinion-map candidates against the skill
  default of three, and two polish runs per session against unlimited.
- The Growth Layer entries deliberately gate **depth of your own archive**, not visibility. Self
  snapshot, full history scroll, aspiration declaration and voice-one scaffold are all true for
  free. What Underwriter buys is annotation archive past the most recent three, practice-layer
  coaching, and the 90-day recommitment cycle.

## Not done

**No price exists anywhere.** `upgrade_url` is `null` in both tiers, carrying
`// TUNING: set when /pricing or /upgrade exists`. There is no pricing page, no Stripe product,
and no number. The model was designed and the amount was never set, which is the one thing
`treasurer`'s position does have and this does not.

**The matrix is unwired.** `getTierCapabilities` is imported by no endpoint. The capability
system exists as a source of truth that nothing consults, so today every member has free
behaviour regardless of `subscription_tier`.

**Two references point outside the repo** and I cannot resolve them: the file cites memories
`project_underwriter_tier` and `project_growth_engine_scroll_scope`, and a theme-side mirror
`dialecta-tier-capabilities.js` that is not in the artifact.

I did not evaluate whether any of this is a good model. That is `treasurer`'s seat.

## Governing spec

`docs/Dialecta_Growth_Layer_Principles.md`. The Growth Layer half of the matrix claims to
implement it, and whether it does is `spec-reader`'s call, not mine.

## Acceptance

```
node scripts/recover-deployment.mjs
wrote 163 file(s), 0 failed, into C:\Dialecta\_recovered
```

`git status --porcelain` clean afterward. `git check-ignore -v _recovered/api/_axis-mapping.js`
answers `.gitignore:23`.

## Traps

- **The artifact is not this repository and must not be merged wholesale.** The September
  migrations were written without knowledge of the live database; promoting 44 recovered
  migrations blind is the same error pointed the other way.
- `subscription_tier` uses `'pro'` as the stored value while every user-visible string says
  Underwriter. Renaming the DB value needs migration 031's CHECK constraint and `BY_TIER` to flip
  in one pass. The file says so; a later reader who sees only the DB will think the label is wrong.
- The five migrations 031 to 035 are **already applied to the live project**. This is not a
  proposal to evaluate, it is state the platform is already in.
- `treasurer`'s monetization position is not wrong about cost. The $78 floor, the Kelly
  arithmetic, the MetaFilter and Medium and INN evidence all still stand. What changed is the
  premise that no prior design exists.

## Do not touch

`_recovered/` is quarantine. Read it, cite it, promote nothing from it without `reviewer`.
`council/treasurer/positions/monetization.md` belongs to `treasurer`; this record asks for a
revision, it does not make one.

---

## Amendment, 2026-09-20, from Dan

Two corrections from Dan after this record was filed, both of which narrow what the chair should
dispatch.

**None of it was ever built.** Dan confirms the model was designed and never shipped. That
matches the code: `getTierCapabilities` has no caller, so the capability matrix gates nothing
today. Read the whole find as a design artifact, not as a running system. The five migrations are
the exception and are genuinely applied, so the columns exist and five endpoints already read
them.

**Ghost is being retired for the Next.js build, so the gifting mechanism is dead.** Migration 033
routes peer gifting through a Stripe one-time payment whose webhook calls the **Ghost Admin API**
to comp the recipient. The Ghost half of that has no future. What survives the move and what does
not:

| Part | Survives the move to Next.js |
| --- | --- |
| The Underwriter name, the copy rule, the positioning line | Yes. None of it depends on Ghost |
| What free is gated on: editor limits, archive depth, not reading | Yes. It is a product decision, not a mechanism |
| `is_charter`, the first-hundred founding badge | Yes. A `profiles` column and a theme badge |
| `subscription_tier` and its touch trigger | Yes. Postgres, not Ghost |
| `is_gifted` and `gift_expires_at` as columns | Yes |
| **The gifting flow itself: Stripe SKU to Ghost Admin comp** | **No. Rebuild against Supabase Auth and Stripe directly** |
| **The daily downgrade cron, if it ran on Ghost** | **Unknown. Needs checking before it is assumed to exist** |

So the design survives and one mechanism does not. That is a smaller gap than designing a
membership model from nothing, which is what `treasurer` believed it was facing this morning.

