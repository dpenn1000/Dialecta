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
| **2.4** | **Check one env variable name.** `apps/web/src/lib/supabase/service.ts:30` reads `SUPABASE_SERVICE_ROLE_KEY`; the root `.env` may call it `SUPABASE_SERVICE_KEY`. If they differ, every comment's classification insert fails | The comment pipeline | A minute. No session could read your env files, which is the guard working |
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
| **Backup branch, not `main`.** You authorised it | You | Section 6 |
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

**Pushing `main` deploys to production.** Two Vercel projects are git-linked to this repo:
`committee-api` builds `main` straight to production, and `dialecta`, your live production API,
builds from this repo too. Its builds currently fail, which is the only reason production has not
been replaced. That is why the night's work went to a backup branch.

**Building in place breaks the dev server.** `npm run build` writes to the same `.next` folder the
dev server is serving from, and it took every route to 500 twice tonight. Stop the server first, or
build from a copy.

**The platform has been quiet since May 1.** 143 days with no new comment, article or follow. 89% of
all fingerprint data belongs to three demo profiles, and no code in the repository writes
`axis_events`, so nothing a real contributor does feeds the fingerprint yet.

**No Supabase client in `apps/web` is type-checked against the schema.** `supabase/types.ts` is
imported by nothing, so a query naming a column that does not exist compiles. That one missing type
parameter is behind two separate failures tonight. Now that the article columns exist it can be
wired, and it is the architect seat's.

---

## 7. What went wrong overnight, plainly

- I read the front page's error as a missing foreign key, changed production on it, and reverted it
  within the hour. A stale build cache was also failing every route at the time.
- I recorded a function revoke as closed without re-measuring it. It was not.
- I misquoted a migration inside quotation marks in `SUBSCRIPTION-MODEL.md`: "cannot pay themselves"
  for "didn't pay themselves", hardship for honour. Corrected, and the correction is visible.
- I briefed the writer as the editor component. You meant the whole Ghost replacement.

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
