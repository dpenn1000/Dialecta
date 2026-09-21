# Morning audit, 2026-09-21

*Written overnight by the convener for Dan. Start here. Everything below is committed, and the whole
night's work is on GitHub as `backup/2026-09-21-overnight`. `main` was deliberately not pushed; see
section 6.*

---

## Today's build

Committed and on `backup/2026-09-21-overnight`; `main` is still not pushed.

| Landed | Commits |
| --- | --- |
| Your login is linked to your profile (2.1). Publishing should work for you now, and your first publish tests 2.3's policy; commenting still needs 2.4 | `feebae9`, `3f60786` |
| The five article photos moved off Ghost into the `article-media` bucket, and the article page shows them | `a975857`, `3f60786`, `85f056d` |
| Long pages paint to the bottom again (designer regression 1) | `cca039f` |
| Live's right-hand rail on every page but `/write` (regression 2) | `e8f6e7f` |
| The reading spine, the author's declaration and the opinion maps, read-only (regression 3, steps 1 to 4) | `58a3ebe` plan, `25e4959` |
| Comment times read like live's, and the featured photo slot (regressions 6 and 4) | `2b30710` |
| Profiles gain live's Growth tab (regression 5) | `aa68e19` |
| The rest of live's article page: tier badges, a real comment count, the author bio and the share row | `09f506b`, `4509414` |
| Breach comment text is withheld by the database: `comment_bodies()`, both readers switched to it, then `body` and `mentions` revoked from the public key and signed-in users (`security-01`) | `9cd4094`, `62c5752`, `20260921160005` |
| `opinion_map_positions` keyed by profile and article, with live's writer untouched (Declare step 5) | `fca062b` |

**Open from today:**

- **Comments can open.** The Breach-body lock is in. What commenting still needs is 2.4, the admin
  key in `apps/web`'s own env file.
- **Declare's placement step** is being built now, on the table change you approved.
- **A second live leak of comment text, yours to fix on production.** `_recovered-next/lib/get-comment.js`,
  behind the comment share-card image, prints any pending or published comment's text with no tier
  check, on the service key. Nothing is Breach today. It goes with section 0's fix, if that app still
  serves share cards.
- **Before cutover:** copy the three profile avatars and the site's logo, icon and two home photos
  off Ghost the same way; redirect `/content/images/*` to the bucket so old links still resolve;
  and don't rerun `scripts/import-ghost.mjs` as it stands, since it would write Ghost's photo URLs
  back over ours.
- **"Joined" on profiles is hidden.** No join date is stored, and a login's own date would be months
  late for anyone from Ghost. The fix is `profiles.joined_at`, backfilled from Ghost's members.
- **For `designer` to confirm:** the Pact parchment lost its 9px soft inner ring in the paint fix;
  the content column is 1180px where live's is 1280px; the spine keeps two breakpoints (720px,
  1199px) outside the app's set.
- **Live's share previews, yours to edit in Ghost Admin** (`convener-07`). Three articles' excerpts
  end mid-sentence with an ellipsis, and the Far Shore one runs the subtitle into the opening
  paragraphs. It is a data edit on three posts with candidate lines ready, not a deploy. The
  card type stays `summary_large_image` until cutover; Ghost sends its own tag and the theme
  can't remove it. `scripts/check-live-share-tags.py` reads live before and after.
- **`/login` shows a claim token in its address bar** (`?next=/claim?token=...`) until the form is
  sent, and an analytics page view there would carry it. Scrub it the way `/claim` does before claim
  links go to the other 13 members.

---

## 0. First: the live comments API gives out private data

**Production `/api/comments` returns, to anyone who asks, every comment's private commenter message,
its classifier internals and its author's member id, which is the Phase 0 credential.** Confirmed
without calling production: `_recovered/api/comments.js` is byte-identical to the file production
serves (SHA-1 `b5db0ff3...` against deployment `dpl_HPsX...`, which carries `dialecta.vercel.app`).
Sized from the database with counts only: 3 comments, all published; 3 private commenter messages;
2 claim texts; 2 members' ids. Hidden Breach text and pending comments are not exposed today only
because none exist yet; the first one is.

**A second live route belongs in the same deploy.** `legal` found that production
`/api/article/upload-image` accepts image uploads from anyone who names a member id, and member ids
are public, so the check proves nothing; a live upload route also brings the federal reporting duty
for child sexual abuse material with it (`exchange/open/2026-09-21-legal-02`).

Fixing either is a production change, so both wait for you. **`security` has the fix ready**, in
`council/security/hotfix-2026-09-21-api-comments/README.md`, with the commands and the rollback:

- **Now, recommended:** two Vercel firewall rules, one per route. No build, works on any plan,
  undone in one command. The cost is visible: every article's comments section shows an error and
  uploads fail until the next step.
- **Then, if you want comments back before the cutover:** deploy the narrowed `comments.js` and the
  disabled `upload-image.js` from a clean copy of the recovered tree, under four conditions the
  README lists. Tests pass 20 of 20, and 17 of them fail against the deployed originals. The tree
  now reproduces production byte for byte (160 of 160 files); two had lost their line endings when
  committed, one of them the classifier's prompt file, and that is fixed.
- **Check the Vercel plan first.** On Hobby the rebuild is refused outright: 38 functions against a
  limit of 12, and an hourly cron.
- **Check Settings, Deployment Protection.** At least 43 older production builds are still live at
  their own `*.vercel.app` addresses with the old handlers, and promoting a new deployment does not
  touch them. Standard Protection closes those and leaves `dialecta.vercel.app` public.

## 0A. The fingerprint Council's answer

Readable at profile size with a key, and false about heat. Blind readers matched marks to people
19 of 21 times against 3 by chance, and 5 of 21 at byline size. Every single-mark reader described
a heated person, including Father Anselm, who has no Heat at all; the organic wobble is what the
legend teaches as heat. The Council recommends marks stay visible only to their owner until a test
with real people passes ($137 small, $411 full), and fixing what the database records first.
Seven decisions are yours, in the log's closing section "For Dan, in the morning":
`council/log/2026-09-20-fingerprint-legibility-and-model.md`. On your live renders: what you liked
is lightness, which either colour choice can keep.

## 0B. The terms beside the Pact, drafted

You asked for them tonight, and `legal` wrote four: terms of service, a privacy notice, membership
terms with the separate renewal consent California requires, and a cover note, all in
`council/legal/drafts/`. Every value nobody has decided is bracketed. The seat is not a lawyer, and
the cover note ranks what a lawyer should review before anyone pays.

Three decisions come first:

1. **Who the operator legally is**: the name, whether there is an LLC, a street address, and a
   contact email someone reads. The copyright agent filing publishes that street address, so filing
   as yourself publishes your home address, and each legal entity files separately.
2. **The founding price**: the price (2.6), what triggers the rise (2.5), and whether the lock has
   an exit with notice and a refund.
3. **What closing an account does to someone's record.** `legal` leans towards taking down the
   profile and fingerprint and keeping the permanent comments under the person's name.

And one question only you can answer: **which Claude plan and training setting govern the sessions
that read the database.** Tonight's sessions read production personal data, including members'
email addresses, and the privacy notice either names the terms that govern that or the access
narrows until the sentence is untrue.

What the terms cannot truthfully say yet: nobody can accept them, because the Pact's commit button
records nothing and sign-in shows no terms; a membership buys no working feature in the new app; and
seven Pact lines contradict them, each with a proposed fix in `exchange/open/2026-09-21-legal-01`.

---

## 1. What you can open this morning

The dev server is at **`http://localhost:3050`**, in its own minimised console window titled
"Dialecta dev server (port 3050)". If it is not running, `npm -w apps/web run dev -- --port 3050`
from `C:\Dialecta`.

Every page sits inside the ported header, drawer and footer.

| Page | State |
| --- | --- |
| `/` | The live front page, ported: five real articles from Supabase, then the join card for anyone signed out |
| `/articles` | The live "Every Article" index |
| `/articles/on-the-far-shore-of-fear` | An article on the paper sheet, then **the conversation**: its two real comments with their tiers (Echo, Forum), the topology filter, sorts, and the composer. Reply and posting need a signed-in, claimed profile (2.1). `?composer=preview` walks every composer stage without sending anything |
| `/pact` | All eight sections on the parchment, the tier-reading exercise working without script, and the signature and font picker. Signing is disabled and says so |
| `/guidebook`, `/community`, `/about`, `/stewards` | Ported from their live templates. Community lacks archetypes and feed names until the identity work (section 4) |
| `/profile/dpenn1000` | Your profile: signature, Order, articles, book covers. The fingerprint says it could not be read, because it needs the service key on this machine (2.4) |
| `/profile/fingerprint-lab` | **The fingerprint on real data**: three demo profiles' real `axis_scores` rows, plus Newborn and Early. `?example=wen-zhao&size=760` draws one large. Development only |
| `/fingerprint` | **The explainer page, every figure drawn by the new engine.** Compared side by side against the live page you liked, same data, same size: `docs/fingerprint-examples/live-vs-new/`, starting with `compare-archetypes-1.png`. Silhouette, halo and colour track the live renders closely; the rings run concentric where live's swirl, which is the spiral you asked to lose |
| `/write` | The publishing engine: nine stages from blank page to publish. Publishing needs 2.1 |
| `/analytics` | Platform analytics with real numbers, every card naming the decision it changes. Open under `next dev`, gated in production |
| `/login` | Magic link and Google. Every sign-in link now brings you back to the page you clicked it on |


**It is a prototype, as you asked.** Nothing here is deployed, and nothing can be until the cutover.

---

## 2. Yours, and each one unblocks something

Ranked by what they unblock. The first three are between you and publishing an article.

| | Decision | What it unblocks | Cost |
| --- | --- | --- | --- |
| ~~2.1~~ | ~~Link your login to your profile~~ **Done 2026-09-21.** You claimed `dpenn1000` through the new `/claim` page, the first call `claim_profile()` has had | Publishing and `/analytics` as yourself; commenting also needs 2.4 | Done |
| ~~2.2~~ | ~~Retire the Ghost id~~ **Done overnight.** `articles.ghost_post_id` is nullable, migration `20260921052443`, so a native article can now be saved. You had said the implementation is being fully rebuilt, which settled what I had framed as the Ghost-retirement decision | Native articles | Done |
| ~~2.3~~ | ~~An author write policy on `articles`~~ **Done overnight by `security`.** Migration `20260921053807`: an author can write their own article and never its tier. Table-level insert and update were revoked, then granted back for exactly the columns the publish route writes; both author ids are pinned to the caller, keyed on `profiles.id` as the architect directed; and `published_at` must fall within five minutes of now, so nobody can date an article ahead and hold the top of the front page | Publishing | Done. It matches nobody until 2.1, so your first real publish is its test |
| **2.4** | **Check that `apps/web`'s own env file defines `SUPABASE_SERVICE_ROLE_KEY`.** The name split is deliberate, not a mismatch: `apps/web/.env.example` uses `SUPABASE_SERVICE_ROLE_KEY` and says not to reintroduce the old name, while the root uses `SUPABASE_SERVICE_KEY` for the legacy `api/` and `scripts/`. **Next.js loads env files from the app's own directory, so the root `.env` does not enter into it.** While you are there, `apps/web/.env.example` is missing two names the code reads: `ANALYTICS_ADMIN_UIDS` and `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | The comment pipeline, and on this machine most of what the prototype shows: without the key, `/api/comment` stores a comment and then fails with a 500 at the classification insert, and every profile says its fingerprint could not be read. Tiers no longer need it: they read through database functions `security` added overnight | A minute. *Corrected by the architect seat: this row first pointed you at the root `.env`, which was the wrong file* |
| ~~2.8~~ | ~~The architect seat's name~~ **Decided by you: `architect`.** No rename needed | | Done |
| **2.9** | **Authorise the architect seat's read-only database connector, once.** You told me to give it review access to every platform, and it has it now: a Supabase connector that is read-only on Supabase's side is in `C:\Dialecta\.mcp.json` as `supabase-dialecta-ro`, and the seat's grant names read tools only across Supabase, Vercel, GitHub, the browser and the notes index. **The one step left is yours**: the next time a Claude session opens in `C:\Dialecta` it will ask to enable the project server and then send you through Supabase's sign-in, once | Every sweep the seat runs | The OAuth click. What each grant covers, and what is deliberately withheld, is in `.claude/agents/architect.md`, "Your access" |
| **2.10** | **Two identity decisions, now each a yes or no.** `decider` chaired the debate overnight, and the log's closing section spells out each with the spec lines you would edit. **First, the person key:** every reference to a person becomes `profiles.id`, the one key all 14 legacy profiles already have, so claiming a profile changes one row and moves no references; `profiles.user_id` only links a login. It lands as a new ADR superseding ADR-002 in part. **Second, "forming":** it means no archetype exists yet, nothing is stored until the confidence clears a threshold, and it never joins the enum. April's coherence audit had already said so and migration 007 removed it; the spec was never patched. Both are recommendations; no seat argued for `user_id` | Most of what comes after the prototype: every policy and port that reads a person, B-1 and B-2 | Two answers. `council/log/2026-09-21-identity-forming-and-the-runner.md` |
| **2.11** | **Whether a revision resets an article's tier, through `decider`.** A classified article keeps its tier through any rewrite, so an author can replace the whole body of an article classified Forum and keep Forum for words the classifier never read. No policy closes it without blocking every revision. The fix is reclassifying on revision, and whether that resets the tier is a spec decision. Found by `security` while writing 2.3 | Tiers on articles meaning what they say | A ruling, then a small build |
| **2.12** | **Heat and Stance badge ink, in the design spec.** The spec's Heat text measures 1.96:1 on its own fill against a 4.5:1 floor, and Stance's 4.26:1. Designer's D-24 replacements, `#1D0A02` and `#F9EAE6`, reach 4.61:1 and 4.91:1 at their worst stops (recomputed tonight). The spec is locked, so decider sent this to you on 2026-09-20, and nothing records an answer. The discourse layer carries the fix in its own CSS; the writer's badge and the analytics chips read the spec and still fail | Readable Heat and Stance badges everywhere: one `npm run tokens` carries it, and the discourse override comes out | Two values, yes or no |
| **2.13** | **Two sentences in the Pact that `philosopher` ruled false.** Section IV: "Every stage is transparent. Every decision is contestable.", repeated in its stage III as "The system is always contestable." Section VI says the private profile tracks patterns "not as a score, not as a judgment". The new `/pact` ports both as written, each with a comment pointing at the ruling, because the copy is yours. The Pact is also the consent instrument `legal` builds on, so its terms drafting will say what these sentences cost | A Pact that is true when someone signs it | A rewrite of two sentences |
| **2.14** | **An article published under a seeded persona.** "On Doubt and Devotion: When Faith Pauses" is published under Maya Reiss, one of the three seeded personas, on the live site and on the new front page. The personas themselves are off Community tonight, because backlog B-5 already ruled "real members only ... no seeded personas"; the article is yours to keep, relabel or unpublish | The front page and the article index | A decision, then one line |
| **2.5** | **The price rise trigger.** The membership page raises the price on the hundredth member; `legal` and `philosopher` ruled to publish a date. `legal` has since moved to a third option: the first hundred or the date, whichever comes first, the only trigger where the people holding the founding price and the people with the Charter badge are the same group | The membership page. `exchange/open/2026-09-21-convener-04` | A sentence |
| **2.6** | **The Underwriter price itself**, $50 against $100. Both seats support the ladder | The gifting rebuild and the Vercel licence | Free to decide |
| **2.7** | **The fingerprint's seven decisions**, colour by subject or by pillar among them. The Council has answered (section 0A), and its log's closing section lists all seven | The fingerprint | After you read the log |

---

## 2A. The architecture, and how tonight's build fits it

You told the architect seat to architect. It filed a rebuild map:
`team/architect/architecture/2026-09-21-rebuild-map.md`, merged into the working line. **Read its
build order before anything else in this report,** because it changes what "the next step" means.

Its headline: **build the spine before porting more surfaces.** Three pieces, in order: a migration
history that reproduces live (`db pull`, then `migration repair`, then every change branch-first);
identity keyed on `profiles.id` and `articles.id` everywhere, with Ghost ids as attributes only; and
`lib/data` as the only code that touches Supabase, typed from regenerated types. Its own line:
"Nothing parallelises safely before step 2."

**Tonight's builders ran the other way, and that was deliberate.** Four were porting surfaces when the
map arrived. I did not stop them, because you asked for a prototype to react to, and a reaction is far
cheaper before the spine is built than after it; the fingerprint colour conversation proved that. The
cost is that every ported surface will be re-landed onto the spine. To keep that cost mechanical, the
two builders reading the database were told to keep every query for their surface in one server-only
file, imported only by server components, so each file moves into `lib/data` whole rather than being
hunted down query by query.

So read what you see this morning as **the prototype**, and the map as **the plan for the real build**.
They are not in conflict, and the second is not started.

Three of its six decisions went to `decider` overnight: the downstream runner is ruled (ADR-005, section 3),
and the identity key and "forming" are yours as two yes-or-no answers (2.10). One is yours alone:
staging, since it is a plan and cost choice.

**Two conflicts in `CLAUDE.md` itself, both yours, neither changed by me:**

- **Line 35 tells every agent session to end with `node scripts/land.mjs`, which pushes to `main`.**
  That is a seat landing its own work on its own, which is what your rule from last night says should
  not happen. Tonight's builders were told not to run git, so nothing broke. A future session
  following `CLAUDE.md` would do it. Either `land.mjs` becomes the convener's tool, or your rule gets
  an exception for a seat's own folder, and the two lines should agree.
  **The architect's recommendation:** change `land.mjs`'s default to push the seat's own branch and print
  the merge request, and keep the direct push to `main` behind an explicit flag only the convener uses.
  The script's fence and gates stay; only its destination changes, so the tooling enforces your rule
  instead of contradicting it. Governance rather than production safety, since a push to `main` does
  not deploy, so there is no urgency.
- **Line 68 is a locked decision that `design/dialecta-design-spec.html` is canonical.** The port
  ruling found `style.css` authoritative, you said the Ghost version is what was settled for the live
  build, and every builder tonight worked from `style.css`. A session reading line 68 could "fix" all
  of it back to the spec. It is marked "do not re-open without Dan asking", so it is yours to re-open.
  **The architect's recommendation:** whichever you pick, generate `tokens.css` from exactly one source.
  The generator (`npm run tokens`) and its drift check (`npm run tokens -- --check`) already exist. Name
  the one source, make the other an output or retire it, and run the check in CI so the two can never
  diverge silently again. `designer` should own which source; the single-source rule is the architect's.

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
| **The header scrolls with the page instead of staying fixed.** A fixed header would cover the writer's sticky stage bar. Everything else about the two-bar nav, its icons and the drawer is ported from live | `builder` | `apps/web/src/components/shell/`, commit `18ccd76` |
| **One Sign in link and no Join button**, because the magic link does both. Write shows to visitors, since anyone can draft | `builder` | same |
| **The downstream runner, ADR-005**: `after()` in the action that resolves a comment, plus a nightly Vercel Cron job that reconciles and replays. No queue and no database triggers until the nightly run passes half its time limit or finds lost work on two nights in seven; both numbers go on `/analytics`, and they are yours | `decider` | `docs/decisions/ADR-005-downstream-runner.md` |
| **The fingerprint's halo scales with the figure's size**, by size / 400. At 400, the reference size, the render is pixel-identical to before; below it the old fixed-pixel halo covered most of the shape. Compare `docs/fingerprint-examples/live-vs-new/halo-scaled-mature.png` | `builder` | commit `d4819f8` |
| **The content pages add no client component.** Every filter, tab and step of the Pact's tier exercise is a plain link, so all of it works without script. Where the live Pact and its prototype differ, the live template won, since it is what the three members signed | `builder` | commit `95bac6c` |
| **The comment feed is a client island**, so its filter and sort stay instant as in the original. The architect's list names six islands and not this one; filter and sort can become plain links instead | `builder` | `apps/web/src/components/discourse/`, commit `1cb785a` |
| **"Forum density" is now "Graduations"** on the profile, because each comment's tier sits in a table the public key cannot read. And one addition to the fingerprint beyond the recovered engine: a Newborn's potential ring draws darker. One value (`guide.newbornOpacity`) turns it off | `builder` | `apps/web/src/app/profile/`, commit `84c1fd4` |
| **The site is light-only for now**, and the coloured avatar made from a member's top two axes is deferred, because it needs a database read on every page | `builder` | same |

---

## 4. Security, measured rather than assumed

**Closed tonight and verified by request, not by reading grants:**

- `comments.member_email` returned your and Kathryn's email addresses to anyone holding the public
  key. It now returns permission denied. Published comments still read, and every page still renders.
- `anon` could execute four database functions it should not. All four closed. One of them I had
  recorded as closed when it was not; the architect seat caught it from the function's access list.
- `profiles.ghost_member_id` closed on 2026-09-20.
- Self-tiering on `articles`: an author can no longer write `final_tier` or `ai_suggested_tier` on
  their own row, closed by column privilege rather than a check (2.3).
- The new app's page paths no longer read tiers on the service role. Two database functions return a
  comment's public tier to anyone who can read the comment, and its private reading only to its
  author (`20260921063139`). Measured: anon runs the first and not the second, PUBLIC holds neither.
- A Breach comment's words could have shown in full on its author's profile. The profile and the
  thread now share one rule for when a body may show.

**Still open, deliberately:**

- **The Phase 0 credential is still public elsewhere.** The member id closed on `profiles` carries a
  public read grant in 17 other columns across 16 tables. How many actually return rows depends on
  each table's policies; `comments.member_id` and `articles.author_member_id` certainly do, and the
  legacy API that trusts those values is still your production API. `security` holds this under your
  no-half-measures rule. `exchange/open/2026-09-21-convener-05`.
- Three trigger functions still hold public execute. Revoking should be safe and was not tested
  against production overnight.
- A classified article keeps its tier through a rewrite (2.11).
- ~~Breach bodies are withheld by the new app's server, not yet by the database~~ **Closed
  2026-09-21.** `comment_bodies()` releases text only for classified, unsuppressed, non-Breach
  comments, and the public key and signed-in users lost SELECT on `comments.body` and
  `comments.mentions`. Live's legacy API reads with the service role and still returns both;
  that is section 0's fix.
- Community cannot show archetypes, pillar colours or who did what in the feed, because anon cannot
  read the Ghost member id those rows are keyed on. A public profile view, or identity keyed on
  `profiles.id` (the architect's step 2), lights them up without reopening the credential.
- `articles.author_profile_id`, added tonight so readers can see author names, sits beside
  `articles.author_member_id`, so the public key can now map any author's profile straight to the
  Phase 0 credential. Measured by the profile builder with `has_column_privilege`; it is the same
  exposure as the first bullet above, and `security` holds it there.
- The architecture map's single `alter default privileges ... from public` would repeat tonight's
  half-revoke on every future function, because Supabase's defaults also grant `anon` by name. It
  takes a second statement for `anon`. `security`'s finding, filed to the architect.
- `articles` has no live trigger keeping `updated_at` current, so an amended article keeps its
  insert time there. `security`'s finding, for `migrator`.

---

## 5. Still running, and what finished overnight

**Still running:**

- **The architect seat's top-to-bottom review**, in your own session "engineerL architect seat
  handoff". Its rebuild map is in, section 2A.

**Finished, and where each one landed:**

| Work | Result |
| --- | --- |
| The fingerprint Council | Section 0A, and seven decisions in its log |
| `decider` on identity, "forming" and the runner | ADR-005 ruled (section 3), two yes-or-no answers for you (2.10) |
| `legal` on the terms beside the Pact | Section 0B, and four drafts in `council/legal/drafts/` |
| `security` | The production fix, prepared (section 0); tier reads without the service key (section 4) |
| Six builders | The site in section 1: shell, discourse layer, profiles, content pages, `/fingerprint` and the gaps, and the fingerprints drawn on the server with a halo that scales |

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

**Known gaps in the new app, each found by the builder that hit it:**

- `/api/comment` treats a plain comment as HTML, so anything after a `<` was lost. The composer
  escapes before posting and the feed decodes for display, so text survives the round trip; the fix
  is the route storing text as text, in the architect's step 5. The route also does not check that
  the article it names exists.
- Nothing moves a new comment off pending review, so only its author sees it. Stage 2.5 and
  publishing are not built.
- The feed is a client island the architect's list does not name (section 3).
- Signing the Pact records nothing, and no sign-up screen shows the terms, so nobody can accept them
  yet (section 0B).
- Every visitor sees a profile's fingerprint. The Council recommends owner-only until the human
  study passes (section 0A).
- `/fingerprint` is heavy. Its figures are now drawn on the server, which cut its main-thread
  blocking from 451 ms to 123 ms in a production build, but its HTML grew from 4.35 MB to 5.12 MB,
  since Next sends a server component's output twice, and it still carries about 35,000 nodes.
  Serving its fixed figures as cached SVG images would cut all three, and needs one decision: how
  the token colours reach an image.
- On `/fingerprint`, the Early figure's copy ("Discourse already carries Heat") does not describe its
  data, which has Discourse at 0 and no Heat; Mature's colour words no longer match the twelve-topic
  palette; and the demo carousel has no topic history, so "the topics they wrote about" shows
  nothing. Each is a fixture or a line of your copy.
- `current_profile_id()` and `current_member_is_author()` sit in `public`, so any signed-in session
  can call them as endpoints. Each returns only the caller's own answer, so nothing leaks, but
  `security`'s rule keeps policy helpers out of the exposed schema (`decider`'s finding).

---

## 7. What went wrong overnight, plainly

- I read the front page's error as a missing foreign key, changed production on it, and reverted it
  within the hour. A stale build cache was also failing every route at the time.
- I recorded a function revoke as closed without re-measuring it. It was not.
- I misquoted a migration inside quotation marks in `SUBSCRIPTION-MODEL.md`: "cannot pay themselves"
  for "didn't pay themselves", hardship for honour. Corrected, and the correction is visible.
- I briefed the writer as the editor component. You meant the whole Ghost replacement.
- **I passed on a correction without measuring it.** The architect seat said the database
  connector's `execute_sql` runs any statement, and I wrote that into this report and into the
  seat's access table. The security seat reported the opposite, and one read settled it:
  `execute_sql` connects as `supabase_read_only_user`, a member of `pg_read_all_data` and
  `pg_monitor` only, with both read-only settings on and write privilege on none of the 31 public
  tables. So the briefs were right the first time. The connector's own description says a
  destructive statement "may require the user to confirm", which makes read-only how it behaves
  rather than a guarantee, so nothing should send it a write. Every write tonight went through
  `apply_migration`.
- **I named five migration files with timestamps I made up** rather than the versions the database
  recorded, and I fixed only three of them the first time. The CLI compares by timestamp alone, so each
  looked like a pending migration and a `db push` would have tried to run it again. All five now carry
  their live versions and the SQL live actually ran. Three more migrations from tonight, mine and the
  architect's, had no file at all; they are restored byte for byte from the history table. Measured
  after: 15 of 17 September migrations match live, `security`'s tier-read migration included, and
  nothing reads as pending. The two that differ,
  `041504` and `043008`, are data fixes edited after they ran so a fresh replay would pass, and the ruling
  on them is `migrator`'s, along with the twenty April and May migrations that have no file (`architect-04`).

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
| The live and local sites compared, six regressions ranked | `council/designer/research/2026-09-21-live-vs-localhost/REPORT.md` |
| The analytics spec | `team/builder/2026-09-20-analytics-spec.md` |
| Every seat and its training | `docs/COUNCIL.md` |
| The production fix for `/api/comments` and uploads | `council/security/hotfix-2026-09-21-api-comments/README.md` |
| The terms, privacy notice and membership terms | `council/legal/drafts/` |
| The fingerprint Council | `council/log/2026-09-20-fingerprint-legibility-and-model.md` |
| Live against new fingerprints | `docs/fingerprint-examples/live-vs-new/` |
| Identity, "forming" and the runner | `council/log/2026-09-21-identity-forming-and-the-runner.md`, `docs/decisions/ADR-005-downstream-runner.md` |
| The rebuild map | `team/architect/architecture/2026-09-21-rebuild-map.md` |
| Open records | `exchange/open/` |
