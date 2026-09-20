# The repo's 13 tables against the live schema and the spec

**Sources read:** `supabase/migrations/20260919000000_foundation.sql` and
`20260919000100_articles_native.sql` (the repo), `supabase/types.ts` (generated from
live project `mguulnibvzusfvyuowwh` on 2026-09-19), and
`docs/Dialecta_Data_Architecture.md` v1.2 (the spec). Compiled 2026-09-19.

**What this is:** the comparison the decision in
`exchange/open/2026-09-19-001-advice-supabase-schema-collision.md` needs. It is not
a migration and it does not pick one of the three options.

## What this evidence can and cannot support

From `2026-supabase-type-generation-drift.md`: `supabase/types.ts` reliably shows
table names, column names, nullability, enum membership and declared foreign keys.
It **cannot** show RLS policies, check constraints, indexes, or column types beyond
the TypeScript collapse, and `text` and `uuid` both generate as `string`.

So: every live column name and nullability claim below is verified. Every claim
about a live column's Postgres type is an inference and is marked as one. Live RLS
and live check constraints are unknown, and no row here asserts anything about them.

## Summary

| # | Repo table | Live counterpart | Verdict |
| --- | --- | --- | --- |
| 1 | `profiles` | `profiles` | Differs. Different identity model, about 30 extra live columns |
| 2 | `articles` | `articles` | Differs fundamentally. Live is Ghost-keyed and carries classification |
| 3 | `comments` | `comments` | Differs. Live requires four not-null columns the repo lacks |
| 4 | `classifications` | `classifications` | Differs. Two renames, and the repo contradicts the spec on one field |
| 5 | `comment_votes` | `tier_nominations` | Renamed, and live is narrower: nominations only, no votes |
| 6 | `axis_events` | `axis_events` | Differs. **Live has no `delta` column** |
| 7 | `axis_scores` | `axis_scores` | Differs. Different key, different accumulator |
| 8 | `archetypes` | `archetypes` | Differs. `confidence` is a decimal in the repo and an enum live |
| 9 | `fp_snapshots` | `fp_snapshots` | Differs. Three column renames and an enum mismatch |
| 10 | `aspirations` | `aspirations` | Differs. **Live has no `visibility`**, which the spec requires |
| 11 | `recommitments` | none | Absent live |
| 12 | `feed_events` | `feed_events` | Differs. The repo's check constraint is missing five spec values |
| 13 | `opinion_positions` | `opinion_map_positions` | Renamed. **The repo drops `stage`**; live matches the spec |

Two further findings sit outside the 13 and are under "What the repo omits" below.

## The one structural fact under all of it

Live keys every child table on `member_id` and declares **no foreign key from any
child table to `profiles`**, and live `profiles.ghost_member_id` is not null. The
repo keys on `user_id uuid references auth.users(id)` and on `contributor_id uuid
references profiles(user_id)`, with `ghost_member_id` nullable.

That is Phase 1 against Phase 2 in the spec's Identity Types section: live is the
Ghost-era shape, the repo is the post-cutover shape. Nine of the thirteen rows below
are downstream of this one choice. Whether live `member_id` is actually `text`
cannot be read from `types.ts` and needs a `db pull`.

## Table by table

### 1. profiles

| | Repo | Live | Spec |
| --- | --- | --- | --- |
| Key | `user_id uuid` to `auth.users` | `id`, no auth FK declared | Identity Types |
| Ghost id | `ghost_member_id` nullable, unique | `ghost_member_id` **not null** | `text` in Phase 1 |
| Timestamps | `created_at`, `updated_at` | `updated_at` only | n/a |

The repo has `display_name` and `bio` not null with empty-string defaults; live has
both nullable. Both have `avatar_url` and `location`.

Live adds roughly 30 columns with no repo and no spec counterpart, in five groups:
handles (`handle`, `handle_set_at`, `handle_set_by_user`), the Pact
(`pact_agreed_at`, `pact_path`, `pact_signed_name`, `pact_version`,
`signature_font`), Order (`order_id`, `order_family`, `order_label`,
`order_assigned_at`, `order_negotiation_log`, `order_pending_proposal`), admin and
subscription flags (`is_admin`, `is_author`, `is_charter`, `is_seed`,
`is_quote_admin`, `is_gifted`, `gifted_by_member_id`, `gift_expires_at`,
`subscription_tier` and its two audit columns), and self-description (`field_notes`,
`influences`, `mind_changes`, `wrestling_with`, `resonance`,
`aspirational_archetype`, `current_aspiration_id`, `polish_preferences`,
`last_order_classified_count`).

Live `current_aspiration_id` to `aspirations.id` is the only declared FK on the
table.

### 2. articles

The largest divergence of the thirteen. These are not the same table.

Repo: `id uuid`, `slug`, `title`, `author_id uuid` to profiles, `ghost_post_id`
nullable, `key_claims`, `map_config`, `published_at`, `created_at`, plus the eight
columns added by `20260919000100_articles_native.sql` (`body_json`, `body_html`,
`status`, `declared_claims`, `suggested_axes`, `amend_until`, `excerpt`, `topic`).

Live: `id`, `ghost_post_id` **not null**, `author_member_id`, `original_html`,
`status`, `created_at`, `updated_at`, plus a classification block with no repo
counterpart (`ai_analysis`, `ai_suggested_tier`, `declared_tier`, `final_tier`,
`declaration`, `stage_2_5_choice`, `author_note`, `wait_until`) and a polish block
(`polish_level`, `polish_options`, `polish_change_log`).

Live has no `slug`, no `title`, no `body_json`, no `body_html`, no `published_at`.

The repo's second migration opens with "Articles are native to Supabase from day
one. Ghost is out." Live articles cannot exist without Ghost, because
`ghost_post_id` is not null. Live also runs articles through a classification flow
like the one for comments, which the repo does not model and which backlog A-D3
lists as an open question for Dan, "whether articles get a pre-publish AI reflection
like comments do". The live answer to A-D3 looks like yes, and already shipped.

### 3. comments

Repo and spec agree on the core. Live differs in three ways.

**Live requires four columns the repo does not have**, all not null with no default
per the `Insert` block in `types.ts`: `article_slug`, `article_title`,
`member_email`, `member_name`. They are denormalized copies of Ghost data. Any
insert written against the repo's shape fails against live.

**The repo is missing `delta_acknowledged`**, which the spec lists in entity 1 and
live has. The spec added it in v1.1 for the Delta Mechanic. This is a repo omission
of a spec field rather than a live divergence.

**`final_tier` sits on the repo's `comments`.** The spec puts it on
`classifications` (entity 2) and live agrees with the spec. The repo's
`classifications` has `ai_suggested_tier` and `self_declared_tier` but no
`final_tier`, so the repo moved the field. Nothing in the repo records why.

Also: live `hardened_at` is not null, matching `011_comment_malleability.sql` in the
handoffs; the repo's is nullable. Live `status` has no `draft` value, per
`2026-postgresql-enum-evolution.md`. Live adds `mentions jsonb`.

### 4. classifications

**The repo contradicts the spec, and live follows it.** The spec says
`opposing_view_engaged | enum | yes / partially / no`. Live has exactly that, the
enum `opposing_view_level`. The repo declares `opposing_view_engaged boolean not
null default false`, which cannot represent "partially" and silently folds it into
one of the other two answers. This is the clearest case in the diff of the repo
losing information the spec asks for.

Renames: spec and repo `specificity`, live `specificity_score`. And `final_tier`,
which the repo moved to `comments` as noted above.

Repo-only: `model` and `prompt_version`. No spec line for either, and live does not
have them. Backlog A-2 requires them, "writes `classifications` with `model` and
`prompt_version`", so a migration adding them is needed under any of the three
options. This is the one repo addition in the diff that is clearly right and clearly
not yet live.

Live-only: `strength`, nullable text, no spec line.

Live nullability is looser throughout: `claim_text`, `emotion`, `article_engagement`,
`specificity_score` and `opposing_view_engaged` are all nullable live and all not
null in the repo.

### 5. comment_votes against tier_nominations

A rename, and a narrowing. Live `tier_nominations` holds `comment_id`, `member_id`,
`target_tier`, `reason_key`, `note`, `created_at`, `updated_at`.

**Live has no `vote_type`, and therefore no plain upvote or downvote.** The spec's
entity 9 defines `vote_type` as an enum of four values: `upvote`, `downvote`,
`nominate_up`, `nominate_down`. Live implements only the nomination half, where a
nomination carries a target tier and a reason key. No live table anywhere stores a
plain up or down vote.

Live `reason_key` matches backlog A-7's "nomination panel with seven reasons and
140-char note", so the seven reasons are a live concept. The repo has free-text
`reason` plus `note` with a 140-character check.

The live table comment quoted in the handoff calls this "the third leg of the
three-input final tier model", which matches the locked 40/35/15/10 weighting in
root `CLAUDE.md`. Whether dropping upvote and downvote was deliberate is not
recorded anywhere in the repo.

### 6. axis_events

**Live has no `delta` column.** The spec's entity 3 defines `delta` as
"Contribution to this axis from this comment. Quality-gated", with Breach
contributing a negative delta. The repo has `delta numeric not null`. Live has
`member_id`, `axis`, `tier`, `comment_id` (nullable), `classification_id`
(nullable), `article_id`, `source`, `topic`, `created_at`, and no delta.

This is the deepest modelling divergence in the diff. The repo and the spec describe
a ledger of weighted deltas that replays into a sum. Live describes a ledger of
typed events that gets counted. The two produce different numbers from the same
comments, and the gap is not a rename or a missing column that can simply be added:
the 27 live `axis_events` rows carry no delta and no way to recover one except by
rerunning classification against the original comments.

Supporting evidence that live counts rather than sums: live `axis_scores` has
`comment_count` and `graduation_count` and **no `raw_total`**, while the repo's
`axis_scores` has `raw_total numeric`.

Renames: spec and repo `tier_at_contribution`, live `tier`; spec and repo
`contributor_id`, live `member_id`. Live-only: `article_id`, `source`, `topic`. Live
`comment_id` and `classification_id` are both nullable, which alongside `source`
suggests events can originate somewhere other than a comment.

The repo's append-only rule (no update or delete policy) cannot be checked against
live from `types.ts`.

### 7. axis_scores

| | Repo | Live | Spec |
| --- | --- | --- | --- |
| Key | composite `(contributor_id, axis)`, no `id` | `id` present | `id` primary key |
| Accumulator | `raw_total numeric` | `comment_count` | neither |
| Graduations | `graduation_count`, check 0 to 22 | `graduation_count` | `graduation_count` |
| Timestamp | `updated_at` | `last_updated` | `last_updated` |
| Live extra | | `topic_history jsonb` | |

The repo dropping `id` for a composite key is a deviation from the spec that is
defensible on its merits and is still undocumented. `updated_at` against
`last_updated` is a rename away from the spec, made so the shared
`set_updated_at()` trigger applies. Live keeps the spec's name.

`tier_mix` agrees across all three.

### 8. archetypes

**`confidence` is a different kind of thing on each side.** The spec says "decimal,
0 to 1", with low confidence triggering a "pattern still forming" state. The repo
matches the spec: `numeric check (confidence between 0 and 1)`. Live has an enum
`archetype_confidence` of `forming`, `emerging`, `established`.

So the forming state lives in a different column on each side. Spec and repo put
`forming` in the archetype value list, making nine values. Live's `archetype_id`
enum carries only the eight real archetypes and expresses forming through
`confidence`. The live design separates which archetype from how sure, which is
arguably cleaner and is definitely not what the spec says.

The archetype column itself has three names: spec `assigned_archetype`, repo
`assigned`, live `archetype_id`. Live adds `archetype_label` and `last_updated`. The
repo drops the spec's `id` in favour of `contributor_id` as primary key, the same
deviation as `axis_scores`.

### 9. fp_snapshots

Three renames and an enum mismatch.

| Spec | Repo | Live |
| --- | --- | --- |
| `snapshot_at` | `snapshot_at` | `captured_at` |
| `axis_scores jsonb` | `axis_scores jsonb` | `fingerprint_data jsonb` |
| `contributor_id` | `contributor_id` | `member_id` |

Enum, per `2026-postgresql-enum-evolution.md`: repo `milestone` against live
`pillar_milestone`, repo-only `manual`, live-only `first_entry`.

Live adds `annotation`, `annotation_generated_at`, `archetype_at_capture`,
`aspiration_at_capture`, `png_url` and `created_at`. The `png_url` column implies
rendered fingerprint images are stored somewhere, which nothing in the repo or the
backlog mentions.

### 10. aspirations

**Live has no `visibility` column.** The spec requires it in entity 7,
`visibility | enum | public / private`, and the Growth Engine pipeline branches on
it twice: "If visibility = public, write a feed_events record". The repo has it.
Live does not, so live cannot make that branch, and either the live feed writes
those events unconditionally or it does not write them.

**Live `research_consent` is not null.** The spec is explicit that null means not
yet asked, and pairs the field with `research_consent_at`. Live has neither the null
state nor the timestamp, so "not yet asked" has nowhere to live. The repo gets this
right. This one is a live defect against the spec rather than a repo defect.

Rename: spec and repo `declaration_snapshot_id`, live
`declaration_fingerprint_id`. Live `reason` is not null where spec and repo allow
null. Live adds `coaching_consent`, `created_at`, `updated_at`.

### 11. recommitments

No live counterpart. The spec defines it in prose under entity 7 rather than as its
own numbered entity, and the repo implements that prose faithfully: `aspiration_id`,
`action` (reaffirm, revise, archive), `new_statement`, `new_reason`, `snapshot_id`,
`recommitted_at`.

Live's `fp_snapshot_reason` enum includes `recommitment`, so live can snapshot for a
recommitment without storing the recommitment record itself.

This is the only one of the thirteen where the repo adds something live lacks and
the spec clearly asks for it.

### 12. feed_events

Naming follows the identity split: repo `primary_contributor_id` and
`secondary_contributor_id`, live `primary_member_id` and `secondary_member_id`.

**The repo's `event_type` check constraint is missing five values the spec
requires.** Spec v1.1 expanded the list to twelve. The repo's check has seven and
omits `sparring_partner_archetype_shift`, `new_reader`, `correspondent_established`,
`source_milestone` and `delta_acknowledged_published`. The v1.1 changelog at the foot
of the spec names all five as additions. Live sidesteps the question by leaving
`event_type` as unconstrained text.

`visibility` is public or followers in spec and repo. The repo's own comment says
"Followers are not modelled yet, so followers visibility is owner-only for now",
which is true of the repo and false of live, where a `follows` table exists.

### 13. opinion_positions against opinion_map_positions

**Live matches the spec and the repo does not.** This is the only table where that
holds, and it reverses the pattern everywhere else.

| Spec (entity 12) | Live | Repo |
| --- | --- | --- |
| `reader_id` | `reader_id` | `user_id` |
| `coordinates jsonb` | `coordinates` | `position jsonb` |
| `recorded_at` | `recorded_at` | `placed_at` |
| `stage`, pre_read / post_read | `stage` | **absent** |
| `map_type`, cartesian / ternary | `map_type` | `map_type` plus radar, barycentric |

**The repo drops `stage`.** The spec says this table "Captures both the Stage A
pre-read snapshot and the Stage C post-read snapshot of the Delta mechanic flow",
and that one record set serves both the Opinion Maps aggregate and the Delta
mechanic's movement vector. Without `stage` there is no pre-read against post-read
distinction. The repo substitutes `delta_of`, a self-reference to "the earlier
placement this revises", which is a different model: a chain of revisions rather
than a labelled pair. Backlog D-3 is written against the repo's model, "Delta
mechanic: before/after placement, `delta_of`", so the backlog has already absorbed
the divergence from the spec.

The repo adds `radar` and `barycentric` to `map_type` with no spec line. Live adds
`map_index`, which matches `024_opinion_map_positions_multi.sql` in the handoffs:
more than one map per article.

## What the repo omits

**Two numbered spec entities are missing from `supabase/migrations/` and present
live.**

- **`follows`**, spec entity 10. Live has it with exactly the spec's four columns:
  `id`, `follower_id`, `followee_id`, `created_at`. The spec makes it the basis of
  three of the four relationship types.
- **`sparring_partners`**, spec entity 11. Live has all seven spec columns, with
  `contributor_a` and `contributor_b` renamed to `member_a` and `member_b`:
  `article_count`, `recognized_at`, `visibility_a`, `visibility_b`,
  `last_engagement_at`.

Both entered the spec in v1.1 and both shipped live in `001_v1_1_schema.sql` per
`docs/handoffs/dialecta-coherence-audit.md`. The repo's foundation migration
mentions neither, and its `feed_events` comment asserts followers are not modelled
yet.

**Eighteen further live tables have no spec entity and no repo counterpart.** They
are listed in the handoff and are outside this diff, whose scope is the 13 tables
the repo creates.

## The pattern, stated plainly

The repo's two migrations are not a subset of live, not a superset, and not a clean
successor.

On nine of thirteen tables the repo is the Phase 2 identity shape and live is Phase
1. On `opinion_positions`, on `feed_events.event_type` and on
`classifications.opposing_view_engaged`, the repo diverges from the spec in ways
live does not. On `aspirations.visibility`, `aspirations.research_consent` and
`comments.delta_acknowledged`, live diverges from the spec in ways the repo does
not. On `axis_events.delta` the repo and the spec agree with each other and live
implements a different model.

Both sides are partial implementations of the same spec, diverging in different
places. That is what two authors working from the same documents without seeing each
other's work would produce, which is the reading
`exchange/open/2026-09-19-001` asks Dan to confirm or deny.

## Implies for

Exchange records 2026-09-19-001 and 2026-09-19-002. Backlog P0-2 through P0-7, A-2,
A-7, A-D3, D-1, D-3. Practice: check the live shape before writing a migration
against a spec entity.
