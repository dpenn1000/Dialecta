# Ghost member export, 2026-09-20: the first real measurement in this tree

**Source:** `dialecta.ghost.members.2026-09-20.csv`, Ghost member export supplied by Dan on 2026-09-20. Ten records. **Aggregated here deliberately: no names, addresses or member ids are copied into this repo.** The export is personal data belonging to six real people who did not consent to appearing in a git history, and this advisor will not put it there. Read the file at source if the detail is needed.

## Summary

Every figure below is counted from the export rather than estimated. This is the first measured number in the treasurer's research tree.

| Field | What the export says |
| --- | --- |
| Total member records | **10** |
| `stripe_customer_id` | **Empty on all 10** |
| `tiers` | Empty on all 10 |
| `complimentary_plan` | Empty on all 10 |
| `deleted_at` | Empty on all 10 |
| `subscribed_to_emails` | `true` on all 10 |
| `labels` | Empty on all 10 |
| `created_at` range | 2026-04-19 to 2026-05-06, a **17-day window** |
| Sign-ups since 2026-05-06 | **Zero, across 137 days** |

Composition of the ten:

| Who | Count |
| --- | --- |
| Dan's own account | 1 |
| Plus-addressed aliases of Dan's own address, one carrying an obvious joke name | **3** |
| Other real people sharing Dan's surname | 3 |
| Other real people, no shared surname | 3 |
| **Real people other than Dan** | **6** |

Zero paying members is confirmed at source, and confirmed more strongly than "no revenue was recorded". **No Stripe customer has ever been created for any member.** There is no lapsed subscription, no failed payment, no cancelled plan. The payment relationship has never existed.

The 17-day window is the other finding. Every sign-up Dialecta has ever had arrived between 19 April and 6 May 2026, and nothing has arrived in the four and a half months since.

## Implies for Dialecta

- **The reactivation pool is 6 people, not 14.** `CLAUDE.md` says 14 Ghost members and reports 14 rows in `profiles`. This export has 10, and 4 of those are Dan or Dan's own test aliases. The acquisition position in `../positions/acquisition-cost.md` leaned on a 14-person list as the highest-yield channel available. That was too generous by more than half, and it is corrected there.
- **The personal network channel is not untapped. It is the channel that produced these six.** The position listed "personal and family network" as a fresh source worth 3 to 8 members. The export shows that channel already ran, in April, and returned six people in seventeen days before going quiet. Counting it again would be counting the same people twice.
- **Three of the six share Dan's surname, and that distinction is the most important one in this file.** A family member who pays $50 is telling Dan they love him. That is worth having and it is not evidence that the platform works. The metric that carries information is **arm's-length members**, meaning people who are not related to Dan and not doing him a favour. There are currently three candidates and zero conversions.
- **Backlog P0-6 is specified against a number that does not match this export, and would import phantom contributors.** The row reads "one-time script that matches the 14 Ghost members to `profiles.ghost_member_id`". Run as written against this export it creates contributor identities for three test aliases and counts Dan as a member of his own platform. Those identities would then accumulate `axis_events`, `axis_scores` and fingerprint data, polluting the contributor set that the Project Brief's Tier 3 names as the eventual moat. Posted as `exchange/open/2026-09-20-004`.
- The 137-day gap is the cost of dormancy stated as a number. It is also the baseline: any sign-up after today is the first organic acquisition Dialecta has ever recorded, and it should be marked as such rather than absorbed into a total.
- Nobody has unsubscribed and nobody has been deleted. Six people opted in and stayed opted in through four and a half months of silence. That is a small fact and a genuinely encouraging one.

*Filed 2026-09-20*
