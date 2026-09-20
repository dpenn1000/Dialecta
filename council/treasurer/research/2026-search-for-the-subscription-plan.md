# Search for the prior subscription model plan: where it is not

**Source:** Exhaustive search run 2026-09-20 after Dan said a subscription model plan exists and that significant effort went into it. A negative result, recorded so the next session does not repeat the search.

## Why this note exists

On 2026-09-19 this advisor stated there were no subscription plans anywhere in the project. That claim rested on a single grep of `docs/` limited to `*.md` and `*.txt`, which was not enough evidence for a statement that flat. Dan pushed back. The search below is what should have been run the first time.

## Searched, not found

| Where | How | Result |
| --- | --- | --- |
| Full repo, every file type | `grep -rniE` on monetize, subscription, membership tier, pricing, paid tier, premium, patron, revenue model, business model, founding member | Only this advisor's own sprint-1 files, the Project Brief's open question, and the Ghost line in Data Architecture |
| `docs/plans/backlog.md`, all 47 rows | Read in full | No payment, billing or membership row in any phase |
| `docs/decisions/` | Read | No ADR on monetization |
| OneDrive concept archive, every folder | Listed all files, then grepped all text-searchable ones | Nothing. `Marketing/` holds only social images and two Python build scripts. `Fundamentals/Progress & Forecasts/dialecta-dashboard.jsx` is a project tracker, not a financial model |
| Google Drive | Two queries: Dialecta plus monetization terms, and title contains Dialecta | **Empty both times.** No Dialecta material in Drive at all |
| Claude artifacts, all 31 | Listed. Read `Dialecta Build Plan` (2026-09-19) in full through the Claude Docs connector | The Build Plan is a rebuild and architecture plan. Its only money content is the treasurer charter line in the council table |
| Live site | `sitemap-pages.xml` (12 pages), homepage, `/stewards/` | No pricing or membership page. Homepage offers "Create account" with no price. Stewards are invited writers, not a paid tier |
| Ghost member export | Counted | `tiers` and `complimentary_plan` empty on all 10 records |

## Not searched, and why

| Where | Why not |
| --- | --- |
| **claude.ai conversation history**, including the "Dialecta Platform Development" project named in `CLAUDE.md` | No tool reaches it. If the work happened in a chat rather than in an artifact, this is where it is and it is invisible from here |
| **Ghost Admin, Settings, Tiers** | Requires the admin session. **Highest-probability location not yet checked.** The member export's `tiers` column being empty means no member is subscribed to a tier, which is not the same as no tier being configured. A tier can exist with a name and a price and nobody on it |
| The other 30 artifacts | Titles are Trinity Solar and APEX work (comp scorecards, pro forma, funded kW, direct pay). Not read, because reading 30 artifacts on a naming hunch is not proportionate. Reopen if Dan names one |
| Gmail | The connector's authorisation was invalidated and returns an error. Needs reconnecting from connector settings |

## Implies for Dialecta

- **The 2026-09-19 claim was under-evidenced and the conclusion has now survived a real search.** Nothing changes in `../positions/monetization.md`, but the confidence behind "no ADR and no backlog row" is now earned rather than assumed.
- **Ghost Tiers is the one cheap check left and it should happen before the council argues monetization.** If tiers are already configured with prices, the standing position's recommendation of a $50 annual membership is arguing against a decision Dan already made, and this advisor would need to know that before the debate rather than after.
- If the plan turns out to live only in a claude.ai conversation, that is worth recording as a process finding rather than a lost file. Work that exists only in chat history is work the repo cannot act on, and the council structure exists precisely to stop that.
- Drive holding nothing Dialecta at all is itself useful. It removes an entire search surface for every future session.

*Filed 2026-09-20*
