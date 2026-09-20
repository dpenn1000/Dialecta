-- Dialecta baseline schema, adopted from live.
--
-- Decision: exchange/closed/2026-09-19-001-advice-supabase-schema-collision.md, closed
-- 2026-09-20 by decider, option 1 (adopt live) paired with option 2 (branch for
-- staging). This file replaces both the two September migrations (moved to
-- supabase/migrations/_archived_2026-09-19/, not deleted) and, once
-- team/migrator/knowledge/2026-schema-squash-runbook.md Part 3 runs, the 20-entry
-- remote migration history from the old dialecta-api repo. Full reasoning for why a
-- single hand-authored file rather than a generated one: the runbook above.
--
-- SOURCES, in order of trust:
--   1. supabase/types.ts, generated from the live project mguulnibvzusfvyuowwh
--      (Pennington Media Group org) on 2026-09-19. Reliable for table names, column
--      names, nullability, enum membership, declared foreign keys.
--   2. team/migrator/knowledge/2026-live-rls-surface.md, measured against live with
--      scripts/check-env.mjs --rls (read-only, counts only) on 2026-09-19. Reliable
--      for which of 15 tables are open or closed to the anonymous key.
--   3. team/migrator/knowledge/2026-live-schema-diff.md and
--      docs/Dialecta_Data_Architecture.md, for intent where the first two are silent.
--
-- WHAT THIS FILE DOES NOT CLAIM TO KNOW. types.ts cannot show RLS policy text, check
-- constraint expressions, index definitions, trigger definitions, or exact column
-- defaults beyond what "optional in Insert" implies. Every column where this file
-- guesses rather than reads is marked inline with "-- LIVE UNVERIFIED:". Before this
-- file is repaired into the remote history as canonical
-- (2026-schema-squash-runbook.md Part 3), run that runbook's Part 1 Step 9
-- (`supabase migration fetch --linked`) and diff its real SQL against every marked
-- line below. Where they disagree, the fetched SQL is right; fix this file forward
-- with a new migration rather than editing this one, per house rule.
--
-- NOT COVERED BY THIS FILE: storage.buckets (the September migration's
-- `article-media` bucket; schema dumps exclude storage/DML by design, verify
-- separately whether live already has it), cron jobs, vault secrets, and the RLS
-- state of any table not named in 2026-live-rls-surface.md's 15-table measurement
-- (everything below except the six confirmed-open and nine confirmed-closed tables
-- named in that note defaults to RLS-enabled-with-no-select-policy, i.e. closed,
-- which is the safe default and matches nothing being disproven, not a measurement).
--
-- WRITE POLICIES: this file adds NO insert, update, or delete policy anywhere, on
-- purpose. practices.md's 2026-09-20 row (from the security seat's B2 finding) found
-- that live is safe today only because it combines open table-level grants with zero
-- write policies; adding an owner-writes-own-row policy without a paired column-grant
-- revoke makes the self-tier-escalation path live-exploitable. That fix is already
-- queued in team/migrator/brief.md's "Next three", items 1 and 2, and stays there
-- rather than being freelanced here. Zero write policies added here cannot
-- reintroduce that hole.
--
-- IDENTITY MODEL: nine of the tables below key on a bare `member_id text` (or
-- `member_a`/`member_b`/`primary_member_id`/etc.) with no foreign key to `profiles`
-- at all, confirmed directly from types.ts's Relationships arrays (empty on every
-- one of them). Where a member reference DOES carry a declared foreign key
-- (aspirations, fp_snapshots, self_descriptions), it targets `profiles.ghost_member_id`
-- (text), never `profiles.id` (uuid). This is Phase 1 of the Identity Types section
-- in the spec, not Phase 2; see practices.md, "Note on the fourth row", and
-- 2026-postgresql-column-type-remap.md for the expand-contract path off of it. Do not
-- "fix" these to uuid in this file; that is a populated-column remap, not a baseline.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (the 9 true Postgres enum types live actually has, exact value lists from
-- supabase/types.ts's own Constants block, which is exhaustive)
-- ---------------------------------------------------------------------------

create type public.tier as enum ('forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach');
create type public.axis as enum ('acuity', 'reach', 'calibration', 'magnanimity', 'discourse', 'consistency');
create type public.archetype_confidence as enum ('forming', 'emerging', 'established');
create type public.archetype_id as enum ('advocate', 'builder', 'contextualist', 'empiricist', 'illuminator', 'reviser', 'skeptic', 'synthesizer');
create type public.article_engagement_level as enum ('specific', 'general');
create type public.comment_status as enum ('pending_review', 'published', 'suppressed');
create type public.emotion_level as enum ('low', 'medium', 'high');
create type public.fp_snapshot_reason as enum ('first_entry', 'aspiration_declaration', 'recommitment', 'archetype_shift', 'pillar_milestone');
create type public.opposing_view_level as enum ('yes', 'partially', 'no');
create type public.polish_level_enum as enum ('light', 'standard', 'editorial', 'custom');

-- Every other column below that reads as a closed set in the spec (articles.status,
-- aspirations.status, feed_events.event_type, opinion_map_positions.stage and
-- .map_type, tier_nominations.target_tier and .reason_key, notifications.type, and
-- others) is plain `text` live, per types.ts showing `string` rather than a
-- `Database["public"]["Enums"][...]` reference for every one of them. Check
-- constraints are one of the things types.ts cannot show
-- (2026-supabase-type-generation-drift.md), so none is invented here; each such
-- column is marked LIVE UNVERIFIED at its definition with the candidate value list
-- where the spec or diff note supplies one.

-- ---------------------------------------------------------------------------
-- Trigger functions
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_last_updated()
returns trigger
language plpgsql
as $$
begin
  new.last_updated = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key default gen_random_uuid(),  -- LIVE UNVERIFIED: whether this references auth.users(id). 0 rows in auth.users as of 2026-09-20 (Dan's own count), so no FK is added here rather than guessed.
  ghost_member_id text not null unique,
  display_name text,
  bio text,
  avatar_url text,
  location text,
  handle text,
  handle_set_at timestamptz,
  handle_set_by_user boolean not null default false,
  is_admin boolean not null default false,
  is_author boolean not null default false,
  is_charter boolean not null default false,
  is_seed boolean not null default false,
  is_quote_admin boolean not null default false,
  is_gifted boolean not null default false,
  gifted_by_member_id text,
  gift_expires_at timestamptz,
  subscription_tier text not null default 'free',  -- LIVE UNVERIFIED: default value guessed
  subscription_tier_set_by text,
  subscription_tier_updated_at timestamptz,
  pact_agreed_at timestamptz,
  pact_path text,
  pact_signed_name text,
  pact_version text,
  signature_font text not null default 'default',  -- LIVE UNVERIFIED: default value guessed; CHANGELOG says nine hand-script faces, actual default name unknown
  order_id text,
  order_family text,
  order_label text,
  order_assigned_at timestamptz,
  order_negotiation_log jsonb not null default '[]'::jsonb,
  order_pending_proposal jsonb,
  field_notes jsonb not null default '[]'::jsonb,  -- LIVE UNVERIFIED: array-vs-object shape guessed
  influences jsonb not null default '[]'::jsonb,  -- LIVE UNVERIFIED: shape guessed
  mind_changes jsonb not null default '[]'::jsonb,  -- LIVE UNVERIFIED: shape guessed
  wrestling_with text,
  resonance integer not null default 0,
  aspirational_archetype text,
  current_aspiration_id uuid,  -- FK to aspirations(id) added after aspirations exists, below: the two tables are mutually referential
  polish_preferences jsonb,
  last_order_classified_count integer not null default 0,
  updated_at timestamptz default now()  -- nullable live, per types.ts; trigger still maintained below
  -- No created_at column. Confirmed absent live (2026-live-schema-diff.md, "profiles").
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md. Known defect, not fixed here on
-- purpose: every column is included, including is_admin and subscription_tier. The
-- fix is column grants or a public-profile view; it is queued in brief.md's "Next
-- three", item 1, and belongs to that migration, not this one.
create policy "profiles are public to read"
  on public.profiles for select
  using (true);

-- ---------------------------------------------------------------------------
-- admin_capabilities, admin_roles, admin_role_capabilities, admin_audit_log
-- ---------------------------------------------------------------------------

create table public.admin_capabilities (
  id text primary key,  -- natural key (required in Insert, no default): a short capability name
  display_name text not null,
  description text,
  domain text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_capabilities enable row level security;
-- RLS state unmeasured (outside 2026-live-rls-surface.md's 15-table scope). Left
-- closed by default: no select policy.

create table public.admin_roles (
  id text primary key,  -- natural key, same pattern as admin_capabilities
  display_name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.admin_roles enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 4 rows visible).

create table public.admin_role_capabilities (
  role_id text not null references public.admin_roles (id) on delete cascade,
  capability_id text not null references public.admin_capabilities (id) on delete cascade,
  primary key (role_id, capability_id)
);

alter table public.admin_role_capabilities enable row level security;
-- RLS state unmeasured. Left closed by default.

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  actor_id uuid references public.profiles (id) on delete set null,
  target_id uuid references public.profiles (id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_audit_log_actor_idx on public.admin_audit_log (actor_id, created_at desc);

alter table public.admin_audit_log enable row level security;
-- RLS state unmeasured. Left closed by default: an audit log should not be anon-readable regardless.

-- ---------------------------------------------------------------------------
-- profile_admin_capability_grants, profile_admin_roles
-- ---------------------------------------------------------------------------

create table public.profile_admin_capability_grants (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  capability_id text not null references public.admin_capabilities (id) on delete cascade,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz,
  note text,
  primary key (profile_id, capability_id)
);

alter table public.profile_admin_capability_grants enable row level security;
-- RLS state unmeasured. Left closed by default.

create table public.profile_admin_roles (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role_id text not null references public.admin_roles (id) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz,
  note text,
  primary key (profile_id, role_id)
);

alter table public.profile_admin_roles enable row level security;
-- RLS state unmeasured. Left closed by default.

-- ---------------------------------------------------------------------------
-- reserved_handles, handle_history
-- ---------------------------------------------------------------------------

create table public.reserved_handles (
  handle text primary key,
  reason text,
  added_by uuid references public.profiles (id) on delete set null,
  added_at timestamptz not null default now()
);

alter table public.reserved_handles enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 89 rows visible).

create table public.handle_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  old_handle text not null,
  new_handle text not null,
  changed_at timestamptz not null default now(),
  released_at timestamptz
);

create index handle_history_profile_idx on public.handle_history (profile_id, changed_at desc);

alter table public.handle_history enable row level security;
-- RLS state unmeasured. Left closed by default.

-- ---------------------------------------------------------------------------
-- notification_prefs, notifications
-- ---------------------------------------------------------------------------

create table public.notification_prefs (
  member_id text primary key,
  email_address text,
  prefs jsonb not null default '{}'::jsonb,
  last_digest_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_prefs_set_updated_at
  before update on public.notification_prefs
  for each row execute function public.set_updated_at();

alter table public.notification_prefs enable row level security;
-- RLS state unmeasured. Left closed by default.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_member_id text not null,
  actor_member_id text,
  type text not null,
  target_type text,
  target_id uuid,
  target_url text,
  payload jsonb not null default '{}'::jsonb,
  is_read boolean not null default false,
  read_at timestamptz,
  email_status text not null default 'pending',  -- LIVE UNVERIFIED: default and candidate value list guessed
  email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_member_id, created_at desc);

alter table public.notifications enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 6 rows visible).

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  ghost_post_id text not null unique,  -- not null live: articles cannot exist without Ghost, unlike the archived September design
  author_member_id text not null,
  original_html text,
  status text not null default 'draft',  -- LIVE UNVERIFIED: candidate list draft/declared/published/archived, per the archived September migration's own check; not confirmed against live
  ai_analysis jsonb not null default '{}'::jsonb,
  ai_suggested_tier public.tier,
  declared_tier public.tier,
  final_tier public.tier,
  declaration jsonb not null default '{}'::jsonb,
  stage_2_5_choice text,
  author_note text,
  wait_until timestamptz,
  polish_level public.polish_level_enum not null default 'standard',  -- LIVE UNVERIFIED: default guessed
  polish_options jsonb,
  polish_change_log jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- No slug, title, body_json, body_html, published_at, key_claims, or map_config.
  -- Confirmed absent live (2026-live-schema-diff.md, "articles"): this table is not
  -- the native-Supabase-content shape the archived September migration assumed.
);

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.articles enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md.
create policy "articles are public to read"
  on public.articles for select
  using (true);

-- ---------------------------------------------------------------------------
-- opinion_map_overrides, opinion_map_positions
-- ---------------------------------------------------------------------------

create table public.opinion_map_overrides (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  ghost_post_id text not null,
  ai_recommendation jsonb not null,
  final_approved jsonb not null,
  editor_note text,
  created_at timestamptz not null default now()
);

alter table public.opinion_map_overrides enable row level security;
-- RLS state unmeasured. Left closed by default.

create table public.opinion_map_positions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null,  -- LIVE UNVERIFIED: no foreign key declared in types.ts despite the name; left unconstrained rather than guessed, matching this database's general no-FK-on-member-facing-tables pattern
  reader_id text not null,  -- LIVE UNVERIFIED: type and FK both uncertain. No relationship declared. Modeled as text for consistency with every other member-reference column in this schema; could be uuid against profiles.id instead, per the spec's naming. Confirm via migration fetch before trusting.
  map_type text not null,  -- LIVE UNVERIFIED: candidate list cartesian/ternary per spec entity 12
  map_index integer not null default 0,
  coordinates jsonb not null,
  stage text not null,  -- LIVE UNVERIFIED: candidate list pre_read/post_read per spec entity 12. This IS a true value on live (types.ts shows the column exists, matching the spec and NOT the archived September migration's delta_of substitute); only its exact check-constraint text is unverified.
  recorded_at timestamptz not null default now()
);

create index opinion_map_positions_article_idx on public.opinion_map_positions (article_id, recorded_at);

alter table public.opinion_map_positions enable row level security;
-- RLS state unmeasured. Left closed by default: individual placements are private by
-- design per the spec ("Pre-read coordinates persist indefinitely... accessible only
-- to the reader"), so closed-by-default is very likely correct even though
-- unmeasured, and a policy scoped to the placing reader is a write-policy-shaped
-- decision (needs to know how reader_id resolves to auth.uid()) deliberately left
-- for the same follow-up that resolves reader_id's own type above.

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null,  -- LIVE UNVERIFIED: no foreign key declared in types.ts despite the name; left unconstrained
  article_slug text not null,
  article_title text not null,
  parent_id uuid references public.comments (id) on delete cascade,
  member_id text not null,
  member_name text not null,
  member_email text not null,
  body text not null,
  status public.comment_status not null default 'pending_review',
  final_tier public.tier,
  delta_acknowledged boolean not null default false,
  mentions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  hardened_at timestamptz not null default (now() + interval '1 hour')
);

create index comments_article_idx on public.comments (article_id, status, created_at);
create index comments_member_idx on public.comments (member_id, created_at);
create index comments_parent_idx on public.comments (parent_id);

alter table public.comments enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 3 rows visible). This is a
-- known functional gap, not a choice made here: backlog A-5 (the public comment
-- thread) renders empty for logged-out visitors under this. Fixing it is a write to
-- read policy text this session has not verified and is out of this file's scope;
-- see the runbook's Part 1 Step 9 before writing that policy.

-- ---------------------------------------------------------------------------
-- classifications
-- ---------------------------------------------------------------------------

create table public.classifications (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  -- Not unique live, unlike the archived September migration's `unique` on this
  -- column. A comment can be reclassified (community re-review, backlog A-8), and
  -- each attempt keeps its own row: see exchange/open/2026-09-19-002-advice-migration-spec-deviations.md's
  -- 2026-09-20 appendix on item 5, final_tier placement.
  claim_text text,
  specificity_score integer,  -- LIVE UNVERIFIED: check (0 and 3) not confirmed live, though spec and the archived repo migration both agree on that range
  emotion public.emotion_level,
  tribal_markers boolean not null default false,
  tribal_example text,
  article_engagement public.article_engagement_level,
  opposing_view_engaged public.opposing_view_level,  -- THE FIX: a true 3-value enum live, not the archived migration's boolean. See report; no separate migration needed, adopting live carries this for free.
  ai_suggested_tier public.tier not null,
  self_declared_tier public.tier,
  borderline_flag boolean not null default false,
  borderline_other_tier public.tier,
  commenter_message text not null,
  final_tier public.tier,  -- On classifications live, matching the spec (entity 2) and not the archived migration's placement on comments. See exchange 2026-09-19-002's 2026-09-20 appendix, item 5.
  strength text,  -- Live-only, no spec line (2026-live-schema-diff.md)
  classified_at timestamptz not null default now(),
  resolved_at timestamptz
  -- No model or prompt_version columns. Confirmed absent live; required by backlog
  -- A-2, queued in brief.md's "Next three", item 4, not added here.
);

alter table public.classifications enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 3 rows visible).

-- ---------------------------------------------------------------------------
-- axis_events (ledger) and axis_scores
-- ---------------------------------------------------------------------------

create table public.axis_events (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  comment_id uuid references public.comments (id) on delete cascade,
  classification_id uuid references public.classifications (id) on delete cascade,
  article_id uuid,  -- LIVE UNVERIFIED: no foreign key declared
  axis public.axis not null,
  tier public.tier not null,
  source text not null default 'comment',  -- LIVE UNVERIFIED: default guessed; comment_id and classification_id both nullable live, which this repo's diff note reads as room for axis events to originate somewhere other than a comment
  topic text,
  created_at timestamptz not null default now()
  -- No delta column. Confirmed absent live (2026-live-schema-diff.md, "axis_events"):
  -- this ledger counts typed events rather than summing weighted deltas, a different
  -- model from the spec and the archived repo migration. Do not add a delta column
  -- to this table without a migration that also explains how the 27 existing rows
  -- backfill one; see 2026-event-sourcing-ledger-replay.md.
);

create index axis_events_member_idx on public.axis_events (member_id, axis, created_at);

alter table public.axis_events enable row level security;

-- Append-only ledger rule (supabase/CLAUDE.md, mandate): select only, no update or
-- delete policy, on purpose. Measured open to anon for select:
-- 2026-live-rls-surface.md.
create policy "axis events are public to read"
  on public.axis_events for select
  using (true);

create table public.axis_scores (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  axis public.axis not null,
  comment_count integer not null default 0,
  graduation_count integer not null default 0 check (graduation_count between 0 and 22),
  tier_mix jsonb not null default '{}'::jsonb,
  topic_history jsonb not null default '[]'::jsonb,  -- LIVE UNVERIFIED: shape guessed
  last_updated timestamptz not null default now()
  -- No raw_total column and no (member_id, axis) uniqueness yet. Confirmed: id is
  -- the only key live carries today. The missing uniqueness is exactly what
  -- 20260920000100_axis_scores_contributor_axis_unique.sql adds next.
);

create trigger axis_scores_set_last_updated
  before update on public.axis_scores
  for each row execute function public.set_last_updated();

alter table public.axis_scores enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md.
create policy "axis scores are public to read"
  on public.axis_scores for select
  using (true);

-- ---------------------------------------------------------------------------
-- archetypes
-- ---------------------------------------------------------------------------

create table public.archetypes (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  archetype_id public.archetype_id not null,
  archetype_label text not null default '',  -- LIVE UNVERIFIED: default guessed
  confidence public.archetype_confidence not null default 'forming',
  axis_pattern jsonb,
  history jsonb not null default '[]'::jsonb,
  assigned_at timestamptz not null default now(),
  last_updated timestamptz not null default now()
  -- Confidence is an enum live (forming/emerging/established), not the spec's and
  -- the archived migration's 0-to-1 decimal. The "forming" state that the spec puts
  -- in the archetype value list itself, live puts in this separate confidence enum
  -- instead: see 2026-live-schema-diff.md, "archetypes".
);

create trigger archetypes_set_last_updated
  before update on public.archetypes
  for each row execute function public.set_last_updated();

alter table public.archetypes enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md.
create policy "archetypes are public to read"
  on public.archetypes for select
  using (true);

-- ---------------------------------------------------------------------------
-- tier_nominations
-- ---------------------------------------------------------------------------

create table public.tier_nominations (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  member_id text not null,
  target_tier text not null,  -- LIVE UNVERIFIED: plain text live, not the public.tier enum. Confirmed from types.ts showing `string`, not an Enums reference, unlike every classifications.*_tier column. Worth a second look once migration fetch confirms whether this is deliberate.
  reason_key text not null,  -- LIVE UNVERIFIED: candidate list is the "seven reasons" backlog A-7 describes
  note text check (note is null or length(note) <= 140),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- No vote_type, no plain upvote/downvote. This table implements only the
  -- nomination half of the archived migration's comment_votes; see
  -- 2026-live-schema-diff.md, "comment_votes against tier_nominations".
);

create index tier_nominations_comment_idx on public.tier_nominations (comment_id);

create trigger tier_nominations_set_updated_at
  before update on public.tier_nominations
  for each row execute function public.set_updated_at();

alter table public.tier_nominations enable row level security;
-- RLS state unmeasured (outside 2026-live-rls-surface.md's 15-table scope).

-- ---------------------------------------------------------------------------
-- feed_events, follows, sparring_partners
-- ---------------------------------------------------------------------------

create table public.feed_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,  -- LIVE UNVERIFIED: unconstrained live on purpose per 2026-live-schema-diff.md ("Live sidesteps the question by leaving event_type as unconstrained text"), so no check is added here either, matching rather than guessing
  primary_member_id text not null,
  secondary_member_id text,
  reference_id uuid,  -- polymorphic (comment_id, aspiration_id, etc.): no single foreign key applies
  display_payload jsonb not null default '{}'::jsonb,
  visibility text not null default 'public',  -- LIVE UNVERIFIED: candidate list public/followers per spec
  created_at timestamptz not null default now()
);

create index feed_events_created_idx on public.feed_events (created_at desc);
create index feed_events_member_idx on public.feed_events (primary_member_id, created_at desc);

alter table public.feed_events enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md.
create policy "feed events are public to read"
  on public.feed_events for select
  using (true);

create table public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id text not null,  -- LIVE UNVERIFIED: type and FK both uncertain, same as opinion_map_positions.reader_id above. No relationship declared.
  followee_id text not null,
  created_at timestamptz not null default now(),
  unique (follower_id, followee_id)
);

alter table public.follows enable row level security;

-- Measured open to anon: 2026-live-rls-surface.md.
create policy "follows are public to read"
  on public.follows for select
  using (true);

create table public.sparring_partners (
  id uuid primary key default gen_random_uuid(),
  member_a text not null,
  member_b text not null,
  article_count integer not null default 0,
  recognized_at timestamptz not null default now(),
  last_engagement_at timestamptz not null default now(),
  visibility_a boolean not null default false,
  visibility_b boolean not null default false
);

alter table public.sparring_partners enable row level security;
-- RLS state unmeasured. Left closed by default: the spec calls this "the only
-- relationship type with per-relationship visibility opt-out", which is a row-level
-- policy question (matching visibility_a / visibility_b) this file does not have
-- evidence to write correctly, so it is left closed rather than guessed open.

-- ---------------------------------------------------------------------------
-- quotes
-- ---------------------------------------------------------------------------

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_id text not null unique,
  text text not null,
  author text,
  source text,
  year integer,
  tags text[] not null default '{}',
  status text not null default 'draft',  -- LIVE UNVERIFIED: candidate guess 'published' is what the select policy below filters on
  created_by uuid references public.profiles (id) on delete set null,  -- LIVE UNVERIFIED: no relationship declared in types.ts; added here as the only plausible target and flagged rather than left as a bare uuid
  updated_by uuid references public.profiles (id) on delete set null,  -- LIVE UNVERIFIED: same as created_by
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;

-- Measured filtered, not open, not closed: 2026-live-rls-surface.md ("quotes
-- filtered to 70 of 72"). LIVE UNVERIFIED: the exact predicate. This guesses
-- status = 'published' because a status column exists and 2 of 72 rows are held
-- back, which is consistent with a small number of drafts; confirm against
-- migration fetch before trusting.
create policy "published quotes are public to read"
  on public.quotes for select
  using (status = 'published');

-- ---------------------------------------------------------------------------
-- self_descriptions
-- ---------------------------------------------------------------------------

create table public.self_descriptions (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.profiles (ghost_member_id) on delete cascade,
  prompt_id text not null,
  statement_verbatim text not null,
  recorded_at timestamptz not null default now()
);

create index self_descriptions_member_idx on public.self_descriptions (member_id, recorded_at desc);

alter table public.self_descriptions enable row level security;
-- RLS state unmeasured. Left closed by default.

-- ---------------------------------------------------------------------------
-- share_events, celebration_events, feedback_items
-- ---------------------------------------------------------------------------

create table public.share_events (
  id uuid primary key default gen_random_uuid(),
  member_id text,
  surface_type text not null,
  surface_id text not null,
  channel text not null,
  created_at timestamptz not null default now()
);

alter table public.share_events enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 7 rows visible).

create table public.celebration_events (
  id uuid primary key default gen_random_uuid(),
  member_id text not null,
  event_type text not null,
  context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  modal_dismissed_at timestamptz,
  shared_at timestamptz,
  created_at timestamptz not null default now()
);

create index celebration_events_member_idx on public.celebration_events (member_id, created_at desc);

alter table public.celebration_events enable row level security;
-- RLS state unmeasured. Left closed by default.

create table public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'bug',  -- LIVE UNVERIFIED: default guessed
  title text,
  body text not null,
  priority text not null default 'normal',  -- LIVE UNVERIFIED: default guessed
  status text not null default 'open',  -- LIVE UNVERIFIED: default guessed
  status_changed_at timestamptz not null default now(),
  status_changed_by uuid references public.profiles (id) on delete set null,
  reporter_member_id text,
  reporter_display_name text,
  reporter_email text,
  owner_profile_id uuid references public.profiles (id) on delete set null,
  acknowledged_at timestamptz,
  acknowledged_by uuid references public.profiles (id) on delete set null,
  captured_metadata jsonb not null default '{}'::jsonb,
  triage_note text,
  submitted_at timestamptz not null default now()
);

alter table public.feedback_items enable row level security;
-- RLS state unmeasured. Left closed by default.

-- ---------------------------------------------------------------------------
-- fp_snapshots
-- ---------------------------------------------------------------------------

create table public.fp_snapshots (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.profiles (ghost_member_id) on delete cascade,
  reason public.fp_snapshot_reason not null,
  fingerprint_data jsonb not null,
  archetype_at_capture text,
  aspiration_at_capture jsonb,
  annotation text,
  annotation_generated_at timestamptz,
  png_url text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index fp_snapshots_member_idx on public.fp_snapshots (member_id, captured_at desc);

alter table public.fp_snapshots enable row level security;
-- Measured closed to anon: 2026-live-rls-surface.md (0 of 4 rows visible).

-- ---------------------------------------------------------------------------
-- aspirations
-- ---------------------------------------------------------------------------

create table public.aspirations (
  id uuid primary key default gen_random_uuid(),
  member_id text not null references public.profiles (ghost_member_id) on delete cascade,
  statement text not null,          -- verbatim, never modified by the platform (supabase/CLAUDE.md)
  reason text not null,
  target_archetype text,
  axis_commitments jsonb not null default '[]'::jsonb,
  declaration_fingerprint_id uuid references public.fp_snapshots (id) on delete set null,
  declared_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  status text not null default 'active',  -- LIVE UNVERIFIED: candidate list active/expired/archived per the archived September migration
  coaching_consent boolean not null default false,
  research_consent boolean not null default false,  -- Live's own gap against the spec, not fixed here: the spec wants null = "not yet asked" plus a research_consent_at timestamp; live has neither. Queued in brief.md's "Next three", item 4.
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  -- No visibility column. Confirmed absent live (2026-live-schema-diff.md,
  -- "aspirations"): the Growth Engine's public/private feed_events branch cannot run
  -- against this table as it stands. Also queued in brief.md's "Next three", item 4.
);

create index aspirations_member_idx on public.aspirations (member_id, status);

create trigger aspirations_set_updated_at
  before update on public.aspirations
  for each row execute function public.set_updated_at();

alter table public.aspirations enable row level security;
-- RLS state unmeasured (outside 2026-live-rls-surface.md's 15-table scope). Left
-- closed by default, which the spec's own private-by-default framing supports even
-- without a direct measurement.

-- ---------------------------------------------------------------------------
-- Deferred foreign key: profiles.current_aspiration_id -> aspirations.id
-- profiles and aspirations are mutually referential (aspirations.member_id also
-- points back at profiles.ghost_member_id, added above), so this one direction has
-- to wait until both tables exist.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add constraint profiles_current_aspiration_id_fkey
  foreign key (current_aspiration_id) references public.aspirations (id) on delete set null;
