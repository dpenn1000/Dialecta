-- Dialecta foundation schema.
--
-- Source of truth: docs/Dialecta_Data_Architecture.md (v1.2), "The Nine Core
-- Data Entities" and "The Compute Pipelines". Field names follow that document;
-- where it leaves a type open, this file picks the simplest one.
--
-- Identity Types rule (Data Architecture v1.2, "Identity Types"): Ghost member
-- and post ids are opaque text, never uuid. They are kept on profiles and
-- articles as legacy, nullable, unique text columns so Phase 1 rows can be
-- joined back to Ghost. Everything Dialecta owns keys on uuid.
--
-- Ledger rule: axis_events is append-only. There are no update or delete
-- policies on it, and axis_scores is always a replay of the ledger
-- (packages/core/src/axis-mapping.ts, replayAxisScores), never incremental.
--
-- Locked names (root CLAUDE.md): tiers forum, spark, echo, fog, heat, stance,
-- breach; axes acuity, reach, calibration, magnanimity, discourse, consistency.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.tier as enum ('forum', 'spark', 'echo', 'fog', 'heat', 'stance', 'breach');

create type public.axis as enum ('acuity', 'reach', 'calibration', 'magnanimity', 'discourse', 'consistency');

-- ---------------------------------------------------------------------------
-- updated_at trigger
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

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  ghost_member_id text unique,          -- legacy Ghost id, text on purpose
  display_name text not null default '',
  bio text not null default '',
  avatar_url text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "profiles are public to read"
  on public.profiles for select
  using (true);

create policy "users insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "users update their own profile"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  author_id uuid references public.profiles (user_id) on delete set null,
  ghost_post_id text unique,            -- legacy Ghost id, text on purpose
  key_claims jsonb not null default '[]'::jsonb,   -- Article Editorial Template: author-declared claims
  map_config jsonb,                     -- opinion map axes/poles for this article, null until set
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index articles_published_at_idx on public.articles (published_at desc);

alter table public.articles enable row level security;

create policy "published articles are public to read"
  on public.articles for select
  using (published_at is not null or auth.uid() = author_id);

create policy "authors insert their own articles"
  on public.articles for insert
  with check (auth.uid() = author_id);

create policy "authors update their own articles"
  on public.articles for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  author_id uuid not null references public.profiles (user_id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (length(body) > 0),
  status text not null default 'draft'
    check (status in ('draft', 'pending_review', 'published', 'suppressed')),
  final_tier public.tier,
  created_at timestamptz not null default now(),
  published_at timestamptz,
  hardened_at timestamptz               -- when the tier stopped accepting reclassification
);

create index comments_article_idx on public.comments (article_id, status, created_at);
create index comments_author_idx on public.comments (author_id, created_at);
create index comments_parent_idx on public.comments (parent_id);

alter table public.comments enable row level security;

-- Suppressed (Breach) comments stay readable: they are hidden from the default
-- view by the app, with the reason shown, never deleted.
create policy "published and suppressed comments are public to read"
  on public.comments for select
  using (status in ('published', 'suppressed') or auth.uid() = author_id);

create policy "users insert their own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "users update their own comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ---------------------------------------------------------------------------
-- classifications
-- ---------------------------------------------------------------------------

create table public.classifications (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null unique references public.comments (id) on delete cascade,
  -- Stage A analysis
  claim_text text not null,
  specificity int not null check (specificity between 0 and 3),
  emotion text not null check (emotion in ('low', 'medium', 'high')),
  tribal_markers boolean not null default false,
  tribal_example text,
  article_engagement text not null check (article_engagement in ('specific', 'general')),
  opposing_view_engaged boolean not null default false,
  -- Stage B tier assignment
  ai_suggested_tier public.tier not null,
  self_declared_tier public.tier,
  borderline_flag boolean not null default false,
  borderline_other_tier public.tier,
  commenter_message text not null,
  -- provenance
  model text not null,
  prompt_version text not null,
  classified_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.classifications enable row level security;

create policy "classifications follow their comment"
  on public.classifications for select
  using (
    exists (
      select 1 from public.comments c
      where c.id = classifications.comment_id
        and (c.status in ('published', 'suppressed') or c.author_id = auth.uid())
    )
  );

-- Inserts and updates come from the classification pipeline using the service
-- role, which bypasses RLS. Contributors only change self_declared_tier, and
-- that goes through a server action so the resolution runs with it.

-- ---------------------------------------------------------------------------
-- comment_votes
-- ---------------------------------------------------------------------------

create table public.comment_votes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments (id) on delete cascade,
  voter_id uuid not null references public.profiles (user_id) on delete cascade,
  vote_type text not null check (vote_type in ('upvote', 'downvote', 'nominate_up', 'nominate_down')),
  target_tier public.tier,              -- for nominations: the tier proposed
  reason text,
  note text check (note is null or length(note) <= 140),
  created_at timestamptz not null default now(),
  unique (comment_id, voter_id, vote_type)
);

create index comment_votes_comment_idx on public.comment_votes (comment_id, vote_type);

alter table public.comment_votes enable row level security;

create policy "votes are public to read"
  on public.comment_votes for select
  using (true);

create policy "users cast their own votes"
  on public.comment_votes for insert
  with check (auth.uid() = voter_id);

create policy "users change their own votes"
  on public.comment_votes for update
  using (auth.uid() = voter_id)
  with check (auth.uid() = voter_id);

create policy "users withdraw their own votes"
  on public.comment_votes for delete
  using (auth.uid() = voter_id);

-- ---------------------------------------------------------------------------
-- axis_events (append-only ledger) and axis_scores (replayed)
-- ---------------------------------------------------------------------------

create table public.axis_events (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.profiles (user_id) on delete cascade,
  comment_id uuid not null references public.comments (id) on delete cascade,
  classification_id uuid not null references public.classifications (id) on delete cascade,
  axis public.axis not null,
  delta numeric not null,
  tier_at_contribution public.tier not null,
  created_at timestamptz not null default now()
);

create index axis_events_contributor_idx on public.axis_events (contributor_id, axis, created_at);

alter table public.axis_events enable row level security;

-- Append-only: select for the owner and the public, insert by the pipeline
-- (service role). No update or delete policy exists, on purpose.
create policy "axis events are public to read"
  on public.axis_events for select
  using (true);

create table public.axis_scores (
  contributor_id uuid not null references public.profiles (user_id) on delete cascade,
  axis public.axis not null,
  graduation_count int not null default 0 check (graduation_count between 0 and 22),
  raw_total numeric not null default 0,
  tier_mix jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (contributor_id, axis)
);

create trigger axis_scores_set_updated_at
  before update on public.axis_scores
  for each row execute function public.set_updated_at();

alter table public.axis_scores enable row level security;

create policy "axis scores are public to read"
  on public.axis_scores for select
  using (true);

-- ---------------------------------------------------------------------------
-- archetypes
-- ---------------------------------------------------------------------------

create table public.archetypes (
  contributor_id uuid primary key references public.profiles (user_id) on delete cascade,
  assigned text not null default 'forming'
    check (assigned in ('skeptic', 'synthesizer', 'advocate', 'builder', 'empiricist',
                        'contextualist', 'illuminator', 'reviser', 'forming')),
  axis_pattern jsonb not null default '{}'::jsonb,
  confidence numeric not null default 0 check (confidence between 0 and 1),
  assigned_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb
);

alter table public.archetypes enable row level security;

create policy "archetypes are public to read"
  on public.archetypes for select
  using (true);

-- ---------------------------------------------------------------------------
-- fp_snapshots
-- ---------------------------------------------------------------------------

create table public.fp_snapshots (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.profiles (user_id) on delete cascade,
  snapshot_at timestamptz not null default now(),
  reason text not null
    check (reason in ('aspiration_declaration', 'recommitment', 'archetype_shift', 'milestone', 'manual')),
  axis_scores jsonb not null             -- full copy of the six axis_scores rows at snapshot time
);

create index fp_snapshots_contributor_idx on public.fp_snapshots (contributor_id, snapshot_at desc);

alter table public.fp_snapshots enable row level security;

create policy "snapshots are readable by their owner"
  on public.fp_snapshots for select
  using (auth.uid() = contributor_id);

-- ---------------------------------------------------------------------------
-- aspirations and recommitments
-- ---------------------------------------------------------------------------

create table public.aspirations (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.profiles (user_id) on delete cascade,
  statement text not null,               -- verbatim, never modified by the platform
  reason text,                           -- verbatim
  target_archetype text
    check (target_archetype is null or target_archetype in
      ('skeptic', 'synthesizer', 'advocate', 'builder', 'empiricist', 'contextualist', 'illuminator', 'reviser')),
  axis_commitments jsonb not null default '[]'::jsonb,   -- ranked array of axis names, minimum one
  declaration_snapshot_id uuid references public.fp_snapshots (id) on delete set null,
  declared_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 days'),
  status text not null default 'active' check (status in ('active', 'expired', 'archived')),
  visibility text not null default 'private' check (visibility in ('public', 'private')),
  research_consent boolean,              -- null = not yet asked
  research_consent_at timestamptz
);

create index aspirations_contributor_idx on public.aspirations (contributor_id, status);

alter table public.aspirations enable row level security;

create policy "public aspirations are public, private ones are the owner's"
  on public.aspirations for select
  using (visibility = 'public' or auth.uid() = contributor_id);

create policy "users declare their own aspirations"
  on public.aspirations for insert
  with check (auth.uid() = contributor_id);

create policy "users update their own aspirations"
  on public.aspirations for update
  using (auth.uid() = contributor_id)
  with check (auth.uid() = contributor_id);

create table public.recommitments (
  id uuid primary key default gen_random_uuid(),
  aspiration_id uuid not null references public.aspirations (id) on delete cascade,
  action text not null check (action in ('reaffirm', 'revise', 'archive')),
  new_statement text,
  new_reason text,
  snapshot_id uuid references public.fp_snapshots (id) on delete set null,
  recommitted_at timestamptz not null default now()
);

alter table public.recommitments enable row level security;

create policy "recommitments follow their aspiration"
  on public.recommitments for select
  using (
    exists (
      select 1 from public.aspirations a
      where a.id = recommitments.aspiration_id
        and (a.visibility = 'public' or a.contributor_id = auth.uid())
    )
  );

create policy "users recommit to their own aspirations"
  on public.recommitments for insert
  with check (
    exists (
      select 1 from public.aspirations a
      where a.id = recommitments.aspiration_id and a.contributor_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- feed_events
-- ---------------------------------------------------------------------------

create table public.feed_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null
    check (event_type in ('archetype_shift', 'fingerprint_milestone', 'sparring_partner_recognized',
                          'aspiration_declared', 'recommitment', 'first_forum_comment', 'forum_thread_spotlight')),
  primary_contributor_id uuid not null references public.profiles (user_id) on delete cascade,
  secondary_contributor_id uuid references public.profiles (user_id) on delete set null,
  reference_id uuid,                     -- comment_id, aspiration_id, etc.
  display_payload jsonb not null default '{}'::jsonb,   -- precomputed card data
  visibility text not null default 'public' check (visibility in ('public', 'followers')),
  created_at timestamptz not null default now()
);

create index feed_events_created_idx on public.feed_events (created_at desc);
create index feed_events_contributor_idx on public.feed_events (primary_contributor_id, created_at desc);

alter table public.feed_events enable row level security;

-- Followers are not modelled yet, so "followers" visibility is owner-only for now.
create policy "public feed events are public to read"
  on public.feed_events for select
  using (visibility = 'public' or auth.uid() = primary_contributor_id);

-- ---------------------------------------------------------------------------
-- opinion_positions
-- ---------------------------------------------------------------------------

create table public.opinion_positions (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  map_type text not null check (map_type in ('cartesian', 'ternary', 'radar', 'barycentric')),
  position jsonb not null,               -- shape depends on map_type; see articles.map_config
  placed_at timestamptz not null default now(),
  delta_of uuid references public.opinion_positions (id) on delete set null   -- the earlier placement this revises
);

create index opinion_positions_article_idx on public.opinion_positions (article_id, placed_at);

alter table public.opinion_positions enable row level security;

-- Aggregates (the heat map) are built server side; individual positions are the owner's.
create policy "positions are readable by their owner"
  on public.opinion_positions for select
  using (auth.uid() = user_id);

create policy "users place their own positions"
  on public.opinion_positions for insert
  with check (auth.uid() = user_id);
