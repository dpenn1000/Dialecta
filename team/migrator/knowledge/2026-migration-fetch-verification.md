# The 34 LIVE UNVERIFIED markers, checked against real applied SQL

**Source:** `supabase_migrations.schema_migrations`, project `mguulnibvzusfvyuowwh`
(Dialecta), read directly with read-only SQL through the Supabase MCP (`execute_sql`,
which is read-only for this project; no write tool was used or available this session).
This is the same table the CLI's `supabase migration fetch --linked` reads, and its
`statements` column holds the verbatim SQL of every migration Postgres has actually
run, not a name or a guess. Read 2026-09-20, migrator seat, the session after the one
that wrote `20260920000000_baseline_live_schema.sql` and
`2026-schema-squash-runbook.md`.

**What this is:** the verification those two files both call for and neither could do,
because neither session had a way to read the live history table. This one does, so it
answers, for each of the baseline's 34 `-- LIVE UNVERIFIED:` markers, either what the
real value is or why the recorded SQL does not reach it.

## The 22 rows, not 20

The convener confirmed live applied two more migrations earlier today, through the
Supabase MCP's `apply_migration`, which this session does not have access to. Counting
those, the table now holds 22 rows. The 20 recorded before today:

| Version | Name |
| --- | --- |
| 20260429222558 | axis_events |
| 20260429222635 | classifications_strength |
| 20260429223033 | axis_events_article_source |
| 20260430010303 | polish_v2_levels |
| 20260501030623 | tier_nominations |
| 20260502000642 | 026_signature_font |
| 20260502000907 | 026b_signature_font_default_fix |
| 20260502035134 | aspirational_archetype |
| 20260502161725 | 028_pre_launch_security_hardening |
| 20260502161837 | 028b_pin_search_path_post_replace |
| 20260502184334 | profiles_handle |
| 20260502184509 | profiles_handle_security_hardening |
| 20260503050315 | share_events |
| 20260503051119 | share_events_channel_expand |
| 20260504131944 | profiles_subscription_tier |
| 20260504131947 | profiles_is_charter |
| 20260504224631 | celebration_events |
| 20260505010345 | profiles_is_gifted |
| 20260506170239 | profiles_gift_expires_at |
| 20260507011113 | 035_growth_engine_schema |

Plus today's two: `20260920192954 close_ghost_member_id_as_public_credential` and
`20260920193044 publish_the_three_existing_comments`, now written to
`supabase/migrations/` as their own files (task instruction; see those files' own
headers for provenance).

**The recorded history is incomplete, confirmed rather than assumed.** The earliest row
is 2026-04-29. `2026-live-migration-history.md` already flagged this from handoff prose
("`000_baseline_documentation` back-fill authoritative DDL via Supabase CLI `db pull`
someday... never run"); this session confirms it directly: nothing in the 20 rows
`CREATE TABLE`s `articles`, `profiles`, `comments`, `classifications`, `axis_scores`,
`archetypes`, `feed_events`, `follows`, `sparring_partners`, `opinion_map_positions`,
`opinion_map_overrides`, `quotes`, `admin_capabilities`, `admin_roles`,
`admin_role_capabilities`, `admin_audit_log`, `profile_admin_capability_grants`,
`profile_admin_roles`, `notification_prefs`, `notifications`, `reserved_handles`, or
`sparring_partners`. All of them exist live regardless (`articles` has 5 rows, per the
task brief), so they were created before 2026-04-29 by migrations Postgres has no
memory of. **This does not overturn the decision to hand-author a baseline rather than
generate one; it is the same finding that decision was already made under, now with a
harder edge.**

A small, immaterial discrepancy worth naming rather than silently absorbing: summing
`length()` over each of the 20 historical rows' `statements` array gives 41,530
characters, not the 43,834 the convener's first look reported. The gap is almost
certainly counting method (raw `statements::text`, with Postgres array-literal quoting
and escaping, versus summing each unnested element's own length), not missing rows;
the 20-row count and every name and version above were cross-checked independently
against `team/migrator/brief.md`'s "20 applied migrations" and match exactly. Not
chased further because nothing downstream depends on the exact byte count.

## What resolved (7 of 34) and what stayed marked

| Marker (table.column) | Baseline guess | Real value | Migration |
| --- | --- | --- | --- |
| `profiles.subscription_tier` default | `'free'` | Confirmed `'free'`, plus a `CHECK (subscription_tier IN ('free','pro'))` the baseline had not marked at all | 20260504131944 |
| `profiles.signature_font` default | `'default'` | Wrong. Real value `'Mrs Saint Delafield'`, itself a same-day fix of a first, also-wrong default (`'Pinyon Script'`, from a stale comment) | 20260502000642, corrected by 20260502000907 |
| `axis_events.article_id` type | `uuid`, no FK | Wrong in a way the marker didn't anticipate: real type is `text`, not `uuid` (matches `articles.ghost_post_id`, itself Ghost-keyed text). No FK was correctly guessed | 20260429223033 |
| `axis_events.source` default | `'comment'` | Confirmed, plus a discriminator `CHECK` constraint the baseline had not marked at all | 20260429223033 |
| `tier_nominations.target_tier` | plain text, deliberateness unconfirmed | Confirmed deliberate: plain text with a 7-value `CHECK`, a "shadow enum" rather than a reference to `public.tier` | 20260501030623 |
| `tier_nominations.reason_key` | candidate list unconfirmed | Confirmed exact 7 values: `specific_claim, engages_content, new_idea, emotional_only, group_signal, unclear, other` | 20260501030623 |
| `aspirations.status` default | `'active'`, candidate list `active/expired/archived` | Default confirmed; candidate list wrong. Real list `active/archived/recommitted/lapsed`, no `'expired'` | 20260507011113 |

**One upgraded without becoming a full confirmation:** `archetypes.archetype_label`
default was guessed `''`. No `DEFAULT` clause was recovered (`archetypes` predates the
recorded window), but the one function that creates an archetypes row
(`initialise_contributor_axes`, rewritten by 20260502161725) always inserts
`archetype_label = 'Pattern Still Forming'`. The baseline now carries that value and
stays marked, because a value one writer supplies is not the same evidence as a
recovered column default, and the file's own rule is not to convert a guess into an
assertion just because a better guess is available. See "A live bug" below for the
column beside it in the same INSERT.

**The other 24 markers are untouched, each for a checked reason, not an assumption:**
their table is never `CREATE TABLE`d or `ALTER TABLE`d for the marked column anywhere
in the 22 rows. `profiles.id`'s FK, `profiles.field_notes` / `.influences` /
`.mind_changes` shapes, `notifications.email_status`, `articles.status` and
`.polish_level`, all four `opinion_map_positions` markers, `comments.article_id`,
`classifications.specificity_score`, `axis_scores.topic_history`,
`feed_events.event_type` and `.visibility`, `follows.follower_id`, all four `quotes`
markers, and all three `feedback_items` defaults: none of these columns are touched by
any of the 22 recorded migrations. `classifications` is the one near-miss, touched by
20260429222635, which adds an unrelated column (`strength`) and never reaches
`specificity_score`.

## Three findings beyond the 34 markers

The file never marked these as guesses, so migration fetch settling them is not a
"marker resolved," but they are corrections to what shipped, found by the same pass.

**1. `axis_events`' select policy was wrong, in the dangerous direction.** The baseline
had `create policy "axis events are public to read" ... using (true)`, citing
`2026-live-rls-surface.md` as "measured open." That document's own table lists
`axis_events` at 0 of 27 rows visible to anon: closed, not open, in the same document
the baseline cited. Migration 20260502161725 confirms closed with an explicit
`axis_events_service_only ... for select using (false)` policy. The `using (true)`
language matches `axis_scores` and `archetypes`, both genuinely open per the same
document, and reads like it was copied from one of those onto `axis_events` by
mistake. Fixed in the baseline; this is the one finding worth flagging above the rest,
since an axis ledger open to anonymous read is the kind of gap that is easy to ship and
expensive to notice later.

**2. `handle_history` was missing two real policies.** The baseline had RLS enabled
with no policy at all (its own "left closed by default" hedge). Migration 20260502184334
(`profiles_handle`) shows live actually has `handle_history_authenticated_read ... for
select to authenticated using (true)` and `handle_history_no_writes ... for all using
(false) with check (false)`. The missing SELECT policy in particular would have
silently broken the SSR `/contributor/<handle>` redirect fallback this table exists
for, per its own `COMMENT ON TABLE`. Fixed in the baseline.

**3. `axis_scores` already has `UNIQUE (member_id, axis)`.** Named
`axis_scores_member_axis_unique`, added 2026-04-29 by migration 20260429222558 (the
same one that creates `axis_events`), guarded `IF NOT EXISTS` against `pg_constraint`.
This is the finding with the largest downstream effect: both the baseline's own note
("no (member_id, axis) uniqueness yet... `20260920000100` adds it next") and the
exchange record behind that companion migration
(`2026-09-19-002`, item 6) assumed this uniqueness was missing, because `types.ts`
cannot show unique constraints and neither the diff nor the RLS-surface passes could
either. Dan's decision on item 6 ("one row per member per axis, enforced") is not
wrong; it is already true, just not by the mechanism anyone on record expected. The
baseline now carries the real constraint under its real name;
`20260920000100_axis_scores_contributor_axis_unique.sql` is archived, not landed. Full
reasoning: the baseline's own inline note where the constraint now lives, and the
runbook's "Updated 2026-09-20" section.

## A live bug, flagged and not fixed: `archetype_id` may not be a valid write

Migration 20260502161725's rewrite of `initialise_contributor_axes(p_member_id)` ends:

```sql
INSERT INTO public.archetypes (member_id, archetype_id, archetype_label)
VALUES (p_member_id, 'forming', 'Pattern Still Forming')
ON CONFLICT (member_id) DO NOTHING;
```

`archetype_id` is typed `public.archetype_id`, an 8-value enum (`advocate`, `builder`,
`contextualist`, `empiricist`, `illuminator`, `reviser`, `skeptic`, `synthesizer`),
confirmed from `supabase/types.ts`'s own Constants block, high-confidence per
`practices.md`. `'forming'` is not one of those eight; it is a value of the *other*
enum on this table, `archetype_confidence`. Postgres resolves an unquoted-context
string literal against the target column's declared type, so this INSERT, if it is
ever actually executed (a brand-new member getting their first `axis_scores` and
`archetypes` rows initialized), should raise `invalid input value for enum
archetype_id: "forming"` rather than succeed.

This is inference from static SQL text, not from having run it, so it is reported at
that confidence and no higher: it is possible a later, unrecorded change patched the
function body (none of the 22 recorded migrations touch
`initialise_contributor_axes` again after 20260502161725), or that some call path
around it behaves differently than read here. It was not chased further because
confirming or fixing a live function body is outside a read-only SQL session's reach
and outside this task's scope (baseline verification, not live remediation). Whether
new-member initialization is currently broken, and since when, is worth someone
actually calling the function or reading `api/` for where it is invoked.

## Implies for

`20260920000000_baseline_live_schema.sql` (every fix above is already applied there,
each citing this document and its migration version inline).
`2026-schema-squash-runbook.md` Part 3 and Part 4 (the real 20-version list, the
3-version repair instead of 1, `20260920000100`'s supersession). Practice: a baseline
adopted from live and a companion migration recommended from an exchange record are
both only as good as what `types.ts` can show; `migration fetch`'s real SQL is a
strictly better source wherever the history reaches, and checking it before repair
lands is now demonstrated to change conclusions, not just add confidence.
