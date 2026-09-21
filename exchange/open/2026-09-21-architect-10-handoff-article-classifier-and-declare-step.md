---
id: 2026-09-21-architect-10
type: handoff
from: architect
to: [convener, builder, migrator, decider]
subject: The article classifier gets a route in apps/web, and the author gets control of the map and the mark
backlog: A-10, A-11, A-12
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Filed `team/architect/architecture/2026-09-21-article-classifier-and-declare-step.md`: the plan for
Dan's decisions on `council/log/2026-09-21-opinion-maps-and-the-declaration.md`, items 1, 2, 4, 5,
7, 8, 9 and 10.

**The deploy target, recommended:** a route handler at
`apps/web/src/app/api/article/classify/route.ts`, on the `apps/web` Vercel project backlog P0-3
already specifies (`docs/plans/backlog.md:37`), with the skill text and the validator promoted into
`packages/core` and the Anthropic call in `apps/web/src/lib/classify-article.ts`. The comment path
is the pattern and it already runs: `apps/web/src/lib/classify.ts` plus
`src/app/api/comment/route.ts:122` (session gate), `:153` (rate limit before the priced call),
`:177` (classify). The caller is already drawn: `components/editor/publish-client.ts:81` returns
null and its own comment names what it waits on. A server action is refused because it has no route
segment and so cannot carry its own `maxDuration`, and because SSE needs a route.
Synchronous, `maxDuration = 240`, which `_recovered/vercel.json` proves this account reaches today;
measured latency is 30 to 180 seconds (`_recovered/skills/opinion-mapper/TUNING_QUEUE.md:114`) and
the editor's 55 second ritual bar (`writer-state.ts:151`) becomes a floor, never a ceiling.

The plan also specifies the promotion list file by file, the author-controlled declare step
(tensions, then candidates, then edit, then the author's own mark), the `author_position_source`
field, the `save_article()` contract, the six engine changes with the ten proofs a fresh smoke run
must produce, and a twelve step build order with an acceptance test, an owner and a dependency on
each.

**Five measured facts no seat had named**, each with its query or file:

1. **`classifications` carries neither `model` nor `prompt_version`.** The brief assumed it does.
   Eighteen columns read live; neither is among them. This is architect-07's open item
   (`exchange/open/2026-09-21-architect-07...:16-21`) and the article path needs the same two on
   `articles`, plus a skill version.
2. **The editor caps a map topic at 28 characters; the engine's contract is 15 to 60, and six of
   the seven live topics run 29 to 44.** `dialecta-editor.jsx:1337` against `SKILL.md:211` and
   `classify.js:122`. Port `MapEditor` as written and an author cannot retype the engine's own
   topic on six of seven published maps. One `MAP_LIMITS` in `packages/core`, three readers.
3. **`admin_audit_log` cannot hold an article version.** `admin_audit_log_target_id_fkey` is a
   foreign key to `profiles(id)`. The plan specs `article_reading_versions` instead.
4. **Two of the nine reader placements are already orphaned**: cartesian rows at `map_index 0` on
   Knowledge Without Borders, recorded 2026-05-02 and 2026-05-03, against a declaration whose map 0
   is a ternary today. Philosopher found this from the other side
   (`positions/...:150`); this is the row level confirmation. Far Shore's one binary placement
   becomes the third unless the retirement carries a rule.
5. **Four em dashes sit in author entered declaration data, not one**: Far Shore's Strongest
   Objection, which the Council named, and all three fields of The Moment You Stop Waiting.

One correction to a document: root `CLAUDE.md:91` still lists `Write Layer/Articles/*.txt` among
the cloud-only files to check. All five are on disk at
`C:\Users\dan\OneDrive\Websites\Dialecta\Write Layer\Articles\`, and none is in the repository,
which is why the smoke run cannot be reproduced by anyone else today.

## Not done

The implementation, all of it. Nothing was promoted out of quarantine, no migration was written, no
file in `apps/`, `packages/`, `supabase/` or `docs/` was touched, and no git command was run. This
seat wrote the plan and this record.

Ten decisions, each recommended in the plan's last section, none ruled here. The three that most
need an answer before work starts: the deploy target (Dan, item 1), committing the five calibration
articles to the repository (Dan, since they are his unpublished essays and nothing can test a prompt
change without them), and Far Shore's one reading (Dan, item 11, still open).

## Governing spec

`council/log/2026-09-21-opinion-maps-and-the-declaration.md`, the Chair's synthesis and Dan's
decisions. `docs/Dialecta_Article_Editorial_Template.md` for the declaration questions, including
Question 5 (`:65`), the author-seeded axes that never reached the build. `docs/RECOVERED.md` for the
promotion rule. Extends, does not replace,
`team/architect/architecture/2026-09-21-rebuild-map.md` and
`team/architect/architecture/2026-09-21-delta-mechanic-port.md`.

## Acceptance

`python scripts/voice_check.py --strict team/architect/architecture/2026-09-21-article-classifier-and-declare-step.md`:
0 hard violations, 9 soft after a cleanup pass (seven "X, not Y" contrasts where Y is a real
alternative a reader would otherwise assume, one quoted live map topic, one table cell). Every claim
carries a file and line, or a query run read-only this session against project
`mguulnibvzusfvyuowwh`, confirmed as Dialecta by its own table list before the first query. The
build order carries the acceptance test for each of its twelve steps.

## Traps

- **`classifications` does not carry `model` or `prompt_version`.** Several documents in this repo
  read as though it does (`docs/plans/build-plan.md:48`, `backlog.md:50`, and the brief that
  commissioned this plan). Check the live column list before building on it.
- **`admin_audit_log.target_id` is FK'd to `profiles(id)`.** It is the obvious home for a logged
  prior version and it will reject an article id.
- **`AXIS_LIMITS.topic.max = 28` in the recovered editor** looks like a harmless constant. It holds
  half the engine's own contract and would refuse six of the seven maps the platform has published.
- **`_recovered/vercel.json` ships the skill twice**: `includeFiles: "skills/**"` on both classify
  routes, and the generated `api/_skills/opinion-mapper.js` that `classify.js:62` actually imports.
  Only the second is read. Do not carry both patterns forward.
- **`SKILL.md` contradicts itself.** Line 287 says the file deliberately holds no pole-label
  examples; lines 88 to 103 are a list of ten, three of which shipped verbatim into live poles.
  Deleting the list, which the Council already ordered, is also what makes line 287 true.
- **`smoke-classify.mjs:14` points at `https://dialecta.vercel.app`**, the legacy production
  deployment. Running it as-is tests the May build, not the new route.
- Far Shore's two readings are not a one-field fix in either direction. Overwriting the JSON leaves
  prose that argues the other tier; overwriting the column requires recomputing `final_tier`, which
  resolves to spark under the locked weighting. The plan recommends a versioned re-run instead.

## Do not touch

Everything the plan names is a proposal: `apps/web/src/components/editor/*`,
`apps/web/src/app/api/article/*`, `packages/core/src/*`, the `article_reading_versions` and
`articles_one_engine_reading` migrations, `docs/plans/backlog.md`, and the five articles under
`Write Layer/Articles/`. `_recovered/`, `_recovered-next/` and `_theme/` were read and cited, never
edited. The convener commits, or dispatches the seat that should.
