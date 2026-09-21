# Morning audit, 2026-09-21

*Written overnight by the convener for Dan. Start here. Everything below is committed, and the whole
night's work is on GitHub as `backup/2026-09-21-overnight`. `main` was deliberately not pushed; see
section 6.*

---

## 1. What you can open this morning

The dev server is at **`http://localhost:3050`**, in its own minimised console window titled
"Dialecta dev server (port 3050)". If it is not running, `npm -w apps/web run dev -- --port 3050`
from `C:\Dialecta`.

| Page | State |
| --- | --- |
| `/` | **Five real articles from Supabase, not Ghost.** Real titles, real authors, real excerpts |
| `/articles/<slug>` | Each renders on the paper sheet with the drop cap from `post.hbs`. A missing slug is a real 404 |
| `/write` | **The publishing engine.** Nine stages from blank page to publish, on the same paper as the reader sees. Publishing itself stops at three named preconditions, section 2 |
| `/analytics` | Platform analytics with real numbers, every card naming the decision it changes. Open under `next dev`, gated in production |
| `/login` | Magic link and Google |

All 20 routes return 200 or the correct redirect. None 500.

**It is a prototype, as you asked.** The type is loaded site-wide now, so pages look different from
yesterday, and most pages still have no layout beyond the paper and the fonts.

---

## 2. Yours, and each one unblocks something

Ranked by what they unblock. The first three are between you and publishing an article.

| | Decision | What it unblocks | Cost |
| --- | --- | --- | --- |
| **2.1** | **Link your login to your profile.** Sign in once at `/login`, then a claim token has to be issued for your profile and redeemed. `claim_profile()` exists and works; nothing has ever called it | Publishing, commenting as yourself, and opening `/analytics` in production | Ten minutes with a session that can write |
| **2.2** | **Retire the Ghost id.** `articles.ghost_post_id` is `NOT NULL`, so an article that never lived in Ghost cannot be saved. `alter table public.articles alter column ghost_post_id drop not null;` | Native articles | One line. It is the Ghost-retirement decision in miniature, which is why nobody made it for you |
| **2.3** | **An author insert policy on `articles`.** Drafted by `builder` and deliberately not applied: it keys on `current_ghost_member_id()` plus `is_author`, and matches nobody until 2.1 is done | Publishing | Apply after 2.1 |
| **2.4** | **Check that `apps/web`'s own env file defines `SUPABASE_SERVICE_ROLE_KEY`.** The name split is deliberate, not a mismatch: `apps/web/.env.example` uses `SUPABASE_SERVICE_ROLE_KEY` and says not to reintroduce the old name, while the root uses `SUPABASE_SERVICE_KEY` for the legacy `api/` and `scripts/`. **Next.js loads env files from the app's own directory, so the root `.env` does not enter into it.** While you are there, `apps/web/.env.example` is missing two names the code reads: `ANALYTICS_ADMIN_UIDS` and `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | The comment pipeline | A minute. *Corrected by the architect seat: this row first pointed you at the root `.env`, which was the wrong file* |
| ~~2.8~~ | ~~The architect seat's name~~ **Decided by you: `architect`.** No rename needed | | Done |
| **2.9** | **Authorise the architect seat's read-only database connector, once.** You told me to give it review access to every platform, and it has it now: a Supabase connector that is read-only on Supabase's side is in `C:\Dialecta\.mcp.json` as `supabase-dialecta-ro`, and the seat's grant names read tools only across Supabase, Vercel, GitHub, the browser and the notes index. **The one step left is yours**: the next time a Claude session opens in `C:\Dialecta` it will ask to enable the project server and then send you through Supabase's sign-in, once | Every sweep the seat runs | The OAuth click. What each grant covers, and what is deliberately withheld, is in `.claude/agents/architect.md`, "Your access" |
| **2.10** | **Two identity decisions that block the most, both through `decider`** since each amends a spec or an ADR-level choice. First: a person is keyed three ways and an article two, 14 of 18 Ghost-keyed person columns have no foreign key, and `opinion_map_self_read` compares Ghost ids to the JWT subject, so no Supabase Auth reader can see their own rows (`architect-05`). Second: "forming" is an archetype in the spec and `packages/core` and a confidence level on live (`architect-03`) | Most of what comes after the prototype | A debate each |
| **2.5** | **The price rise trigger.** The membership page raises the price on the hundredth member; `legal` and `philosopher` ruled to publish a date. A third option nobody has argued: first hundred or one year, whichever comes first | The membership page. `exchange/open/2026-09-21-convener-04` | A sentence |
| **2.6** | **The Underwriter price itself**, $50 against $100. Both seats support the ladder | The gifting rebuild and the Vercel licence | Free to decide |
| **2.7** | **Colour: rings by axis or by territory.** Pending the fingerprint debate, section 5 | The fingerprint | After you read the debate |

---

## 3. Decided overnight with the team, so you can overrule

| What | Decided by | Where |
| --- | --- | --- |
| **Port the recovered front end, file by file.** 46 adapt, 16 drop, 10 rewritten, 3 as-is. Your position entered as yours | Full Council | `council/log/2026-09-20-port-or-rewrite.md` |
| **Charter badge:** grant `is_charter` unconditionally at checkout as today, and add a second marker for underwriters who also published, conferred after the writing and announced nowhere. The article requirement you asked about is legal only until payment goes live, and backfires psychologically if announced | `legal`, `philosopher` | `council/log/2026-09-20-charter-badge-and-price-ladder.md` |
| **Price ladder:** publish the date. The hold clause ships either way | `legal`, `philosopher` | same |
| **Closed the email leak.** You authorised it | You | Section 4 |
| **Backup branch, not `main`.** You authorised it, on a reason that turned out false; see section 6 | You | Section 6 |
| **Article schema, additive only**, identity left on `author_member_id`. `author_profile_id` added so readers can see author names without reopening the column `security` closed | `builder` | Three migrations, `20260921040353` onward |
| **Fingerprint engine changes**, all tested in `packages/core`: the ring is a soft horizon rather than a clamp, the ring phase walks rather than marching so the spiral is gone, the noise field closes so the seam at zero degrees is gone, and purity finally drives saturation, which the engine and the live page both promised and neither did | `designer`, convener | `docs/FINGERPRINT.md` |
| **Four stages of the recovered editor left out of `/write`**: polish-and-read, opinion-map inputs, the AI hint and topic buttons, feature photo upload. Not on the path from blank page to published article | `builder` | `apps/web/src/components/editor/README.md` |

---

## 4. Security, measured rather than assumed

**Closed tonight and verified by request, not by reading grants:**

- `comments.member_email` returned your and Kathryn's email addresses to anyone holding the public
  key. It now returns permission denied. Published comments still read, and every page still renders.
- `anon` could execute four database functions it should not. All four closed. One of them I had
  recorded as closed when it was not; the architect seat caught it from the function's access list.
- `profiles.ghost_member_id` closed on 2026-09-20.

**Still open, deliberately:**

- **The Phase 0 credential is still public elsewhere.** The member id closed on `profiles` carries a
  public read grant in 17 other columns across 16 tables. How many actually return rows depends on
  each table's policies; `comments.member_id` and `articles.author_member_id` certainly do, and the
  legacy API that trusts those values is still your production API. `security` holds this under your
  no-half-measures rule. `exchange/open/2026-09-21-convener-05`.
- Three trigger functions still hold public execute. Revoking should be safe and was not tested
  against production overnight.

---

## 5. Still running

- **The fingerprint Council**, with every seat, framed on your six properties. It was also given
  your live renders and the reading that those rings are running the axis fallback palette, which
  would mean the page you like is doing rings-by-axis and halo-by-territory at once. Its log will
  have a section called `For Dan, in the morning`.
- **The architect seat's top-to-bottom review**, in your own session "engineerL architect seat
  handoff". It has been given everything found tonight so it starts from what is fixed.

---

## 6. Things worth knowing before you touch anything

**Pushing `main` does not deploy to production, and I told you it did.** `vercel.json` on `main`
sets `git.deploymentEnabled: false`, which landed 2026-09-20. The evidence it works is in Vercel's
own record: every production deploy from `main` since then is CANCELED, and the three pushes of the
backup branch tonight triggered no deployment on any project. I read the deployment list without
reading `vercel.json`, saw git-linked projects building, and concluded a push would deploy. It
would not. You chose the backup branch partly on that reason; the backup did its job regardless,
and pushing `main` remains your call.

**What is true, and is the real risk.** Branches cut from before 2026-09-20 still carry the old
config and do build: the designer's `claude/jolly-dijkstra-03d6e7` built previews tonight, one of
them against `dialecta`, your live API project, which failed and so replaced nothing. And
`CLAUDE.md` records that P0-3 must flip `deploymentEnabled` back on before `apps/web` gets previews.
**The day that flag flips, pushes to `main` start building production again.** That is the moment
to be careful, not tonight.

**Building in place breaks the dev server.** `npm run build` writes to the same `.next` folder the
dev server is serving from, and it took every route to 500 twice tonight. Stop the server first, or
build from a copy.

**The platform has been quiet since May 1.** 143 days with no new comment, article or follow. 89% of
all fingerprint data belongs to three demo profiles, and no code in the repository writes
`axis_events`, so nothing a real contributor does feeds the fingerprint yet.

**No Supabase client in `apps/web` is type-checked against the schema.** `supabase/types.ts` is
imported by nothing, so a query naming a column that does not exist compiles. That one missing type
parameter is behind two separate failures tonight.

**It cannot simply be wired yet, because the type file is two days stale.** It was generated
2026-09-19 and knows nothing about tonight: no `slug`, `title`, `excerpt`, `published_at`,
`body_html` or `author_profile_id` on `articles`, no `profiles.user_id`, no `profile_claim_tokens`.
Verified by searching it. Wiring it today would type the app against the old schema. The order,
set by the architect seat: regenerate with `npm run types`, then wire the four clients
(`lib/supabase/client.ts:15`, `middleware.ts:31`, `server.ts:21`, `service.ts:34`), then fix what
`tsc` surfaces. The seat has a calibrated `ast-grep` rule that finds exactly those four and nothing
else, which serves as the acceptance test. `builder` implements.

**`apps/web` has no tests at all**, and classification rows carry no prompt version although
`packages/core/CLAUDE.md` requires one (`architect-06`, `-07`).

---

## 7. What went wrong overnight, plainly

- I read the front page's error as a missing foreign key, changed production on it, and reverted it
  within the hour. A stale build cache was also failing every route at the time.
- I recorded a function revoke as closed without re-measuring it. It was not.
- I misquoted a migration inside quotation marks in `SUBSCRIPTION-MODEL.md`: "cannot pay themselves"
  for "didn't pay themselves", hardship for honour. Corrected, and the correction is visible.
- I briefed the writer as the editor component. You meant the whole Ghost replacement.
- **I told every agent tonight that the database connector's `execute_sql` is read-only. It is not;
  it runs anything.** No agent wrote through it as far as the record shows, since each used
  `apply_migration` for writes, but the safety assumption every brief rested on was false. This is
  part of why 2.9 matters.
- **I named three migration files with timestamps I made up** rather than the versions the database
  recorded. The CLI compares by timestamp alone, so all three looked like pending migrations and a
  `db push` would have tried to run them again. Renamed to their live versions, and the email-fix
  file now carries the `notify pgrst` line that live actually ran. The wider drift from before
  tonight, including three live migrations with no file anywhere on disk, is `migrator`'s, and the
  architect seat has the full reconciliation (`architect-04`).

Each was caught by a seat or by measuring, and each is corrected in the file where it happened.

---

## 8. Where everything is

| | |
| --- | --- |
| Every open item, measured | `docs/OPEN-ITEMS.md` |
| The fingerprint system | `docs/FINGERPRINT.md` |
| The subscription model | `docs/SUBSCRIPTION-MODEL.md` |
| The architect seat | `docs/handoffs/ARCHITECT-THREAD.md` |
| The membership page | `council/designer/research/membership-prototype.html` |
| The analytics spec | `team/builder/2026-09-20-analytics-spec.md` |
| Every seat and its training | `docs/COUNCIL.md` |
| Open records | `exchange/open/` |
