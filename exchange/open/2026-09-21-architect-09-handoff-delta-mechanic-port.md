---
id: 2026-09-21-architect-09
type: handoff
from: architect
to: [convener]
subject: Delta mechanic port plan: the spine and Declare modal, buildable before Cutover
backlog: none
state: open
opened: 2026-09-21
closed:
outcome:
---

## Done

Filed `team/architect/architecture/2026-09-21-delta-mechanic-port.md`: the port plan for designer's
finding 3 (`council/designer/research/2026-09-21-live-vs-localhost/REPORT.md:128` to `149`), the
reading-stage spine and the Declare opinion-mapping modal.

The headline: live built Stage A and Stage C of the six-stage spec as capture only (tap-and-commit
on a map, member-gated on Reflect, written to `opinion_map_positions` via the service role) and
never built Stage D through F, the comparison, the reveal, the public choice, or Reviser detection,
anywhere, live or local. Porting live restores what a reader sees today; it does not build the
mechanic the spec describes, and this plan does not try to.

No seventh island: the placement UI is the existing "opinion maps" island
(`docs/plans/build-plan.md:50`); the spine and overlay chrome is a third recorded exception in the
shape `apps/web/CLAUDE.md:9` already names twice. `opinion_map_positions` has no INSERT or UPDATE
policy today under RLS, by original design (writes went through the service role), which the port
is not allowed to copy (`supabase/CLAUDE.md:9`); the plan specs one `security definer` function as
the sole writer, and finds `current_profile_id()` already shipped this morning
(`supabase/migrations/20260921053807_articles_author_write_policy.sql`), ahead of the rebuild map's
own sequencing, so the write path does not have to wait on Dan's app-wide identity ruling
(`council/log/2026-09-21-identity-forming-and-the-runner.md`, question 1) to start. The backlog
already reserves this work, `docs/plans/backlog.md:96` to `98` (D-1, D-2, D-3), but all three rows
cite a stale spec file, the wrong table name, and undersell what live has while
overclaiming Stage D. The plan gives a 6 to 7 step build order, each step with its own acceptance
test, and six decisions for Dan.

## Not done

The implementation. Migrator/builder work: `components/opinion-map/`, `components/article-spine/`,
`components/article-declaration/`, the one-table `opinion_map_positions` re-key migration, the new
`security definer` function and its grants, and the resequenced backlog rows. None of it exists yet;
this is a plan.

Six decisions, each recommended in the plan's own last section, none ruled here: whether a seventh
island is needed (recommend no), whether to re-key `opinion_map_positions` ahead of the app-wide
identity ADR (recommend yes, on its own migration), whether the port lands before Cutover or waits
for Phase D as currently sequenced (recommend before), whether to correct backlog rows D-1 to D-3 in
the same change, whether reading back a committed placement across reloads is in scope now or a
later betterment (recommend later), and whether Stage D through F gets its own plan once this port
and the identity re-key land (recommend yes, later).

Stage D through F themselves: not planned here at all. They need a stable person key to count
Reviser qualifications "across at least 2 different articles"
(`docs/Dialecta_Delta_Mechanic_Spec.md:175`), so they wait on the identity ADR in a way this port's
read side and, per the plan, its write side do not.

## Governing spec

`docs/Dialecta_Delta_Mechanic_Spec.md`, v1.0, in full, against
`council/designer/research/2026-09-21-live-vs-localhost/REPORT.md:128` to `149`. Extends, does not
replace, `team/architect/architecture/2026-09-21-rebuild-map.md`.

## Acceptance

`python scripts/voice_check.py --strict team/architect/architecture/2026-09-21-delta-mechanic-port.md`:
0 hard violations, 12 soft (all "X, not Y" contrasts the voice guide's own exception covers: each
names a real alternative a reader would otherwise assume, not padding). Every claim in the plan
carries a file and line, or a query run live against project `mguulnibvzusfvyuowwh` this session; the
plan's own build order carries the acceptance test for each step once someone builds it.

## Traps

- `_theme/assets/js/post.js` looks like the spine's script, but it is an unrelated esbuild bundle;
  the spine and overlay logic is inline in `_theme/post.hbs:893` to `1174`. Read that, not the
  bundle.
- `opinion_map_self_read`, the one RLS policy on `opinion_map_positions`, looks like a working
  self-read guard. It compares `reader_id` against the JWT `sub`, which is `auth.users.id` under
  today's Supabase Auth, not the Ghost member id stored in `reader_id`. It has always
  returned zero rows for a real session; nothing calls it today, so this has cost nothing yet.
- The rebuild map (`team/architect/architecture/2026-09-21-rebuild-map.md:47`) describes
  `current_profile_id()` as something the identity re-key step will create. It already exists,
  shipped today for `articles`. Check live before assuming a function from that map is still
  unbuilt.
- Table grants on `opinion_map_positions` give `anon` and `authenticated` full INSERT and DELETE at
  the grant level. RLS still refuses both, since no policy admits either command. Do not read the
  grant alone as the verdict; `pg_policies` is.
- This looked unbacklogged at first read of `docs/plans/build-plan.md`'s phase table, but
  `docs/plans/backlog.md:96` to `98` already carries D-1 through D-3: stale, not missing.

## Do not touch

Everything named in the plan (`apps/web/src/components/*`, the `opinion_map_positions` migration,
`docs/plans/backlog.md`, `docs/decisions/`) is a proposal. This seat wrote only
`team/architect/architecture/2026-09-21-delta-mechanic-port.md` and this record, ran no git command,
and changed nothing in `apps/`, `supabase/`, or `docs/`.
