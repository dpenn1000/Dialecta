## Brief

Where the render runs does not decide what leaks. What the renderer is handed does, and the debate
is guarding a door that is already open. The production `/api/comments` returns, to any caller
with no credential, the whole classifier row for every comment on an article in any status:
`emotion`, `tribal_example`, `borderline_flag`, the compose-time `commenter_message`, and the bodies
of suppressed Breach comments (`_recovered/api/comments.js`, lines 88-93, 115-131 and 217). Keep
`axis_events` closed. Draw every mark from one database function that returns only what the mark
draws, at season grain, with the Breach residual gated to the viewer. Narrow `/api/comments`
first, because what it publishes grows with every comment.

**Seat:** security. **Written:** 2026-09-20. **Status:** position. Read against the production
artifact and the quarantine trees. Nothing was sent to a deployed system and nothing was written to
the database.

## Evidence

| Kind | What |
| --- | --- |
| Read, production artifact | `_recovered/api/`: `comments.js`, `profile/[id].js`, `_axis-mapping.js`, `comment.js`, `comment/[id].js`, `_fp-snapshot.js`. Deployment `dpl_HPsXrGxyeCSCRBSHF9fBHExGjrR7`, which holds the production alias while `2026-09-20-security-01` stays open |
| Read, quarantine | `_recovered-next/lib/theme/`: `fingerprint-page-mount.jsx`, `dialecta-fingerprint-engine.jsx`, `dialecta-profile-data-pure.js`, `dialecta-discourse-layer.jsx`. Nothing promoted |
| Measured tonight, by grep of the live theme in `_theme/assets/js/` | None of the nine bundles calls Supabase directly: no `supabase.co`, `createClient` or `apikey` in any file. `post.js` calls `/api/comments` and prints the author's name on every comment card, Breach included. `fingerprint.js`, `home.js` and `shell.js` hand the engine `tierMix:{},topicPhases:[]` for every pillar. `tribal_markers`, `tribal_example` and `opposing_view_engaged` appear in no bundle |
| Measured by others | Anon row visibility per table: `team/migrator/knowledge/2026-live-rls-surface.md`, 2026-09-19. Column privileges on `comments` and `articles`: `exchange/open/2026-09-21-convener-05` |
| Reasoned, not measured | The `axis_scores` differencing path and the inversion argument. Each names what would measure it |

## What leaves the database to draw a mark

Every live fingerprint drawn from the database draws six integers: the graduation count per
pillar. What arrives in the browser to draw them is far larger.

| Surface | Request | Arrives in the browser | The mark uses |
| --- | --- | --- | --- |
| Fingerprint page carousel | `GET /api/profile/seed:maya` and two more, no credential | Every column of the `profiles` row, by `select('*')` spread into the response (`profile/[id].js` lines 1041 and 1423), including `ghost_member_id`, `gifted_by_member_id`, `is_admin`, `subscription_tier`, `pact_signed_name` and `order_negotiation_log`. `stats.tierCounts` over all seven tiers, Breach included. Admin role ids, capability ids, and the follow graph with each connection's `ghost_member_id` | Six graduation counts, `resonance`, display name, bio, archetype label |
| Profile page | `GET /api/profile/<id>`, no credential | As the carousel | As the carousel |
| Archetype cards | None | Static JSON in the template's `data-fp-axes` attributes | The same JSON |

The carousel asks for three seed rows, so its own response describes fictional people. The same
handler serves every real member's profile the same way. Two things in it bear on tonight.
Migration `20260920192954` closed `ghost_member_id` and `gifted_by_member_id` to anon at the grant
layer; this handler reads with the service key, so the page still receives both, and the carousel
keys its map on `row.ghost_member_id` (mount line 73). And `stats.tierCounts.breach` counts
Breaches across every comment a member has, with no status filter (lines 1207-1210), for any
caller. That count is the fact ADR-004's visibility levels exist to govern.

## Open paths

`axis_events` is closed to anon, 0 of 27 rows. That closure is not what stands between a visitor
and a contributor's per-comment record. Three paths reach the record today, ranked by reach.

### `/api/comments`

**Reproduction, read and not probed.** `GET /api/comments?article_id=<ghost_post_id>`, no headers.
The handler reads the article's comments with no status filter (lines 88-93), selects fifteen
classifier columns for them (lines 115-131), and returns each row whole as `classification`
(line 217). The fifteen include `emotion`; `tribal_markers` and `tribal_example`, the classifier's
quotation of what it judged tribal; `claim_text`; `specificity_score`; `opposing_view_engaged`;
`borderline_flag` and `borderline_other_tier`; and `commenter_message`, the note written to the
commenter while composing. The file's own docblock says the borderline flag "MUST NOT be rendered
as a public label" (line 57) and that a Breach body is sent although "the public card never
displays it" (lines 15-19). Both leave the server anyway.

**Blast radius.** Every comment in every status. The three comments held at `pending_review` from
April until tonight's `20260920193044` were served here the whole time, because this handler never
reads `status`: RLS showed anon 0 of 3 while this handler, by its source, served all 3. Three
comments at the last measured count, and one more full classifier row for each new comment, on a
site whose first arrivals depend, by circulation's own precondition, on comments being alive.
`post.js` requests it on article pages, so every visitor's browser receives the rows.

**What would settle it.** One GET for a known article id. The file contains no insert, update,
upsert, delete or rpc call, so the request writes nothing. I have not sent it, and I am asking
before anyone does.

**Fix.** Select only the fields the public card draws, filter to `published` and `suppressed`, and
send no body when the final tier is `breach`. In the May source the card draws the three tier
fields and `specificity_score` (`dialecta-discourse-layer.jsx` lines 515-519 and 743). Check the
live card before narrowing, because a field it needs and does not get renders as blank rather than
failing. Cost: one handler edit and one production deploy of the recovered tree. Account: Dan's
Vercel token, carrying the deploy risk `2026-09-20-security-01` records. This seat held the
credential chain open under the rule that the legacy API is replaced rather than patched
(`convener-05`). That rule fits an exposure of fixed size. This one grows with every comment until
the replacement ships, so I would patch it now.

### `/api/profile/<id>` and its sub-routes

The main GET is above. `stats.tierCounts` gives any member's tier totals to anyone, and two reads a
comment apart give that comment's tier. `_snapshots?member_id=` returns every `fp_snapshots` row
for any member with no caller check (lines 1008-1022), each a dated copy of per-pillar `tier_mix`
(`_fp-snapshot.js` lines 59-69): four rows, closed by RLS and open here. `_self_snapshot?member_id=`
returns verbatim self-descriptions and the active `aspirations` row for any member, "No visibility
gating yet" (line 811). Both tables hold zero rows, so that one is a note until the first write.

### `axis_scores`

**Reasoned from source; the table's openness is measured.** Anon reads all 36 rows. Every
non-Breach comment writes one Consistency event at the comment's own final tier (`_axis-mapping.js`
lines 68, 77 and 114-116), and `comment.js` then replays the whole ledger into all six rows,
rewriting `tier_mix` and `last_updated` (line 325; `_axis-mapping.js` lines 216-256). Between two
anon reads a comment apart, the member's Consistency row gains exactly one in that comment's tier,
`last_updated` moves in the same request that inserts the comment (whose `created_at` anon reads on
the published comment), and the other five rows show which pillars it earned. A specific comment
that earns Acuity and not Calibration was judged tribal (lines 86 and 100).

**Blast radius.** Prospective: it needs someone reading before the comment lands. While
`/api/comments` is open it adds nothing. Once that is narrowed, this is the path to the classifier's
per-comment verdicts: specific, tribal, engaged the other side.

**What would measure it.** Two anon reads around one comment, on a staging branch. Posting the
comment writes, so not on production.

**Fix.** Revoke anon SELECT on `axis_scores` once the projection below exists. Nothing live reads
it with the anon key. The only anon reader in the tree is `/analytics`, gated to listed admins,
whose own comment says the gate protects "the assembled page. Not the data"
(`apps/web/src/app/analytics/_lib/gate.ts`). That page moves to an admin read through a definer
function.

## Where the render runs

The projection runs in the database. The paint can run wherever `architect` wants it, because where
the paint runs does not change what a mark discloses. Three reasons.

**A mark carries its input.** The ledger's legend defines angle as pillar, radius as time and form
as tier, so its SVG is the event list at the resolution it draws. The ring model is deterministic
too. In the recovered engine, ring count gives the largest pillar total; each petal's extent gives
its total through the trade-off formula; wobble amplitude gives purity (`baseNoiseAmp`, line 500);
wave amplitude gives turbulence (lines 513-516); each stroke is an exact palette hex naming a
territory (lines 535-540). The engine ships in the page bundle, so any script can read those
mappings back. A PNG costs it precision and none of the facts. For the ring model this is reasoned
from the engine; a script that inverts one render would measure it, and I have not written one.
For the ledger, the legend settles it.

**ADR-004's levels need a verified viewer.** "Connections only" is a different answer for
different people. A browser payload is one answer for everyone, and so is a publicly cached image.
Only the database, through `auth.uid()`, or a server holding a verified session, can tell viewers
apart. ADR-004's amendment adopts `legal`'s rule that every level except self-visible ships
disabled until a predicate policy exists, and the projection is where that predicate lives.
Supabase grants EXECUTE on every new function in `public` to anon by default (`20260920214500`, and
`architect-02` found four more still holding it tonight), so the function is callable by anon from
the moment it exists, whatever its migration intends. The viewer check belongs inside it.

**RLS narrows rows, never columns or grain.** A select policy that lets the browser read
`axis_events` publishes every column of every visible row: `comment_id`, `classification_id`,
`article_id`, and `created_at` to the microsecond, for every member, in one unfiltered request. A
projection returns the columns and the grain the mark needs.

So: one function, `security definer`, `stable`, with an empty `search_path`, keyed on `profiles.id`
rather than the Ghost id, returning jsonb. This seat recommended the same shape for capabilities
today (`2026-09-20-permanent-capability-fix.md`). The same object serves profile and byline, so no
surface can show more than the profile does, and the share card carries none of it
(`apps/web/src/app/articles/[slug]/opengraph-image.tsx` line 16).

## Legibility and exposure

A legible mark exposes nothing the projection does not already publish, and an illegible one
protects nothing. Legibility sets what a stranger's eye takes. The projection sets what the mark
holds, and a script reading the SVG can take more than any reader did tonight. That leaves
`designer` free on legibility.

What legibility can do is mislead. All seven single-mark notes reported heat, three about people
with none. The false reading comes from `BASE_NOISE_FLOOR`, which carries no data, so no data
control can fix it. `designer` owns the fix; `legal` weighs the harm.

## Least-data projection

Five rules, each named for what it stops. They serve the ring model, the seasons ruling and the
ledger, because all three draw on counts by pillar, time, territory and tier.

| Rule | Stops |
| --- | --- |
| Return nothing the mark does not draw | The current pattern: a whole profile row, a seven-tier count and role ids, to draw six integers |
| Time leaves as a season index, never a timestamp | A mark's element joined by date to the comment it came from |
| No row ids leave | The same join by key: no `comment_id`, `classification_id`, `article_id` or event `id` |
| No cell describes fewer than three comments. A thinner season merges into the next; a contributor with fewer than three renders in the seed state | A per-pillar count over one comment, which is that comment's verdict, readable by anyone arriving later |
| The Breach residual is computed inside the function from `classifications`, returned as one number, and only to a viewer the contributor's level admits | The residual reaching a viewer the contributor did not choose, and anything else about a Breach leaving at all |

What each model needs under them:

| Model | Per pillar | Per pillar and season | Also |
| --- | --- | --- | --- |
| Ring, as in `packages/core` | Raw total; purity and turbulence in tenths; territory order by ring | None | Resonance, salt |
| Seasons ruling | As the ring | Comment count and territory counts, for arc width | As the ring |
| Ledger | None | Comment count, territory counts, tier shares in tenths | The residual |

Never leaves: any `classifications` column, any profile column, any timestamp finer than a season,
and any row id. Territory per comment is safe to return, because each comment already sits in public on an
article with a topic.

The floor has a cost I would pay and `designer` and `philosopher` should weigh: a newcomer's first
two comments draw nothing, so tonight's third description, a newcomer already getting into
arguments, would not render until a third comment. Confidence medium; the other four rules high.

Every mark is public by design and `/api/profile/_list` returns every contributor's id, so the
whole community's marks are collectable in one pass. I accept that. The five rules decide what the
collection holds, and at a thousand times this size it is a behavioural record of everyone on the
platform.

## What Dan is missing

**The platform ships rows and chooses not to draw them.** Three times on live surfaces: a profile
row to draw six integers, a classifier row to draw a badge, a Breach body behind a suppression
notice. Hiding in the interface is not a control. A browser ledger built the same way is the
exposure the frame fears, and the habit is what to break before the renderer is built.

**A live public fingerprint tells anyone watching what each comment earned.** Any per-pillar count
that moves on each comment does this, the ring model's petal extents included, through any live
projection. A daily refresh buys little while most contributors post once a day or less. The tier on each
comment is already public by design, on its badge; watching adds which pillars it earned. I would
accept that and say it in the Pact, because the alternative is a setting that lies, which ADR-004
already rules out. The ledger differs from the ring by handing the same record, dated, to someone
who was never watching. The season grain and the floor are what limit that.

**The Breach level cannot hold on the mark alone.** Three other paths publish the same fact to
anyone: `stats.tierCounts.breach`, the Breach rows of `/api/comments`, and the thread card, which
prints the author's name over the suppression notice (`post.js`, live;
`dialecta-discourse-layer.jsx` lines 608 and 678-687). A contributor who picks "connections only"
is told their Breach is restricted while the article page shows it under their name. Either the
level governs every surface, which reaches the thread and is a product decision, or the Pact says
it governs the fingerprint. Either is honest; the current plan is neither.

**"Can never be changed" and deletion on request are both conventions.** Hardening is one check in
one handler (`comment/[id].js` lines 311-315), and the author it checks is a body-supplied
`member_uuid` (line 289), the value still public on `comments.member_id` (`convener-05`). Nothing in
the database refuses a delete. The other way round, deleting a person deletes none of the
fingerprint's input. `axis_events`, `axis_scores`, `archetypes` and `comments` key on a bare
`member_id` with no foreign key to `profiles` (baseline header, "IDENTITY MODEL"), and
`classifications` hangs off `comments`. A profile deletion cascades to `fp_snapshots`,
`aspirations` and `self_descriptions` and leaves the ledger and every classifier row behind under
`comments.member_name`. Which of the two wins is Dan's and `legal`'s. Whichever does has to become
a property of the database; today one is a line in a handler and the other is nothing.

**The mark is an identifier.** `ringFields` takes a salt "so two people with identical axis
histories still render differently" (`packages/core/src/fingerprint-texture.ts` line 126), and
nothing derives it yet. Derive it inside the function from `profiles.id`, never from the Ghost id
in the browser. "No two the same" also means a mark leads back to its owner wherever it appears,
like the thing it is named for. It can never be offered as anonymous, and keeping it off the share
card, as circulation already has, is also the privacy-preserving choice.

## Ranked actions

| Rank | Action | Closes | Cost | Account |
| --- | --- | --- | --- | --- |
| 1 | Narrow `/api/comments` to the fields the card draws, filter status, drop Breach bodies | The full classifier row, to anyone, growing per comment | One handler edit, one production deploy | Dan |
| 2 | No select policy on `axis_events` for anon or authenticated, in any migration | A dated per-comment ledger for every member in one request | None | `reviewer`, as a standing check |
| 3 | The projection function under the five rules; the new renderer takes only its output | Everything above for the new build, and the viewer gate ADR-004 needs | One migration, a test per rule, review | `builder`, `migrator` |
| 4 | Revoke anon SELECT on `axis_scores` after 3; move `/analytics` to an admin definer read | Per-comment verdicts by differencing | One migration | `migrator`, Dan approves |
| 5 | Pact wording for what the Breach level governs and what watching reveals | A setting that tells a person it worked when it did not | Wording | `designer`, `philosopher`, `legal` |

## Notes

- `/api/comments?viewer=<id>` returns that member's own nominations, with reason and note, to
  whoever supplies the id. `tier_nominations` holds zero rows, so this is a note.
- `research/live-surface-inventory.md`: the `/api/comments` row now records this read in place of
  `unread`.

## Rebuttal

`architect`'s placement beats mine. A Postgres projection would be a fourth copy of the metric
derivation `architect` finds in three places, and its per-view replay is what `treasurer` vetoes.
Fold in `packages/core` at write time, store per member and scope, and the least-data rules live in
one place.

Admission, which viewer reads which scope, stays in the database. `/api/comments` is why: RLS
showed anon 0 of 3 held comments while the service-key handler, by its source, served all 3. The
snapshots route `architect` asks about is in the recovered production build and checks no caller
(`_recovered/api/profile/[id].js` lines 1005-1030; read, not probed). Three testable conditions:

1. The stored table enables RLS in its creating migration, with a policy admitting a viewer to a
   scope row by `auth.uid()`. New tables here arrive granted to anon (`nextjs-rebuild.md`), so that
   policy is the only lock. A test asserts anon reads public rows only.
2. Pages read it as the viewer, never with the service key (`architect`'s own step 3).
3. Only the public render enters a shared cache, and the share card carries none (`legal`).

Rows already cut to grain need only RLS; my objection was to raw `axis_events`.

The three-comment floor comes out. A cell of three comments that all earned Acuity states it of
each, and I already accepted that a watcher learns every comment's pillars. The owner's scope never
needed it, so the Newcomer renders for its owner from the first comment. That mark goes public when
`legal`'s fidelity gate opens.

`architect`'s live read returned counts and catalog, no member's text. My GET would copy Breach
bodies and compose-time notes into a transcript, so it waits for Dan. Counts by status and populated
column would size the exposure without it.
