# Search for the prior subscription model plan: where it is not

> **ANSWERED 2026-09-20.** Found at `C:\Users\dan\Downloads\subscription-dashboard`, deployed as the Vercel project `subscription-command-center`. It tracks the 44 subscriptions Dan **pays**, not a model for what Dialecta would **charge**. Dan separately confirmed no tiers are configured in the Ghost console. See `2026-subscription-command-center.md`. The search below stands as the record of where it was not, and of a miss: the Vercel project appeared in a `list_projects` result this advisor had already read on the same day and did not register.

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
| ~~**Ghost Admin, Settings, Tiers**~~ | Requires the admin session; this advisor could not check it directly. **Closed 2026-09-20 by Dan directly, in Mission Zero.** No tiers were ever configured, and Dialecta is leaving Ghost entirely. Do not reopen this check in a future sprint; there is no admin session to read and no tier to find |
| The other 30 artifacts | Titles are Trinity Solar and APEX work (comp scorecards, pro forma, funded kW, direct pay). Not read, because reading 30 artifacts on a naming hunch is not proportionate. Reopen if Dan names one |
| Gmail | The connector's authorisation was invalidated and returns an error. Needs reconnecting from connector settings |

## Implies for Dialecta

- **The 2026-09-19 claim was under-evidenced and the conclusion has now survived a real search.** Nothing changes in `../positions/monetization.md`, but the confidence behind "no ADR and no backlog row" is now earned rather than assumed.
- **Ghost Tiers is the one cheap check left and it should happen before the council argues monetization.** If tiers are already configured with prices, the standing position's recommendation of a $50 annual membership is arguing against a decision Dan already made, and this advisor would need to know that before the debate rather than after.
- If the plan turns out to live only in a claude.ai conversation, that is worth recording as a process finding rather than a lost file. Work that exists only in chat history is work the repo cannot act on, and the council structure exists precisely to stop that.
- Drive holding nothing Dialecta at all is itself useful. It removes an entire search surface for every future session.

*Filed 2026-09-20*

## Closed 2026-09-20: it was never written

Dan asked whether it is lost. It is not lost, and the stronger statement is available.

Every memory store on the machine was searched:

| Store | Files | Dialecta content |
| --- | --- | --- |
| `claude-memory` repo, **all of git history across every commit** | all revisions | `project_personal_web_properties.md` and three `MEMORY.md` variants. Nothing else, ever |
| `memory.prejunction-backup` | 48 | The same file, **byte-identical** to the git copy, and **zero files git history does not already hold** |
| The Dialecta project's own memory directory under `.claude/projects` | 0 | Empty, created 2026-09-19 |
| The local-git-dir project's memory directory under `.claude/projects` | 6 | None |

`sync-claude-memory.ps1` explains the deletion and removes the worry. It runs `git add -A` against `C:\Users\dan\claude-memory` itself, so that folder **is** the memory store rather than a copy of one. When something removed the file on 2026-09-12 the sync faithfully committed the removal, and git history kept every prior version. The recovery at `f7cc960` is proof the safety net works.

**The closing argument is the content, not the search.** The single memory node that references `[[subscription-dashboard]]` calls it "the broader cost-cutting context" and, in the same file, rules Dialecta out of that effort in the strongest terms available: "Exclude it entirely from any hosting/cost-cutting migration calculus."

So a Dialecta subscription model was never inside that work. The effort Dan remembers was real, substantial and expense-side, with Dialecta deliberately fenced off from it. **Nothing needs recovering. The monetization work is ahead of this project rather than behind it.**

One correction for Dan, separate from Dialecta: he sees no Memory panel under Settings, Capabilities because his memory is not claude.ai memory. It is file-based, it lives in `C:\Users\dan\claude-memory`, it is committed by `sync-claude-memory.ps1` and pushed to `github.com/dpenn1000/claude-memory`. **The advice about a legacy memory export with five days left does not apply to this setup, and there is no deadline to meet.**

## Corrected 2026-09-20, Mission Zero: the plan was found, and not by this search

"Nothing needs recovering" above was wrong. `convener` recovered the full source of a live Vercel
deployment into `_recovered/` and found a complete two-tier design, Underwriter, with five
migrations already applied to the live database
(`exchange/open/2026-09-20-convener-01-handoff-underwriter-tier-recovered.md`). It sat in none of
the places this search covered: not `docs/`, not the backlog, not an ADR, not OneDrive, not
Drive, not a claude.ai artifact, not Ghost Tiers, not any memory store. It sat inside a deployed
build artifact, which no search here treated as a place source code could live because it wasn't
known to hold any.

That is the actual miss, sharper than the `list_projects` near-miss recorded above. **A deployment
is a search surface.** The standing conclusion that no membership model was ever designed is
withdrawn; see `../positions/monetization.md` for what replaces it. Everything else this note
found still holds: Drive is empty of Dialecta material, Ghost Tiers was never configured, and the
work is not sitting unread in a claude.ai conversation. It was sitting in the one place shaped
like code that nobody had reason yet to read as code.
