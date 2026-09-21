-- comments: the two reads the discourse layer makes of classifications, as functions that answer
-- only for comments the caller could already read. apps/web/src/components/discourse/data.ts
-- runs both on the service role today, from a public page's read path, and rule 2 of the
-- architect's rebuild map keeps that key to pipeline code
-- (team/architect/architecture/2026-09-21-rebuild-map.md). With these the read runs on the
-- visitor's own session. Designed and applied by the security seat on the convener's brief,
-- 2026-09-21.
--
-- Measured in pg_catalog before writing:
--   * classifications: anon and authenticated hold arwdDxtm at table level. Its one policy,
--     classifications_service_only, is SELECT to public USING (false), and no write policy
--     exists, so RLS alone closes it to both client roles. This migration leaves that as it is.
--   * idx_classifications_comment is UNIQUE on comment_id, so a comment has one row today.
--     classified_at and ai_suggested_tier are NOT NULL.
--   * The SELECT policies on comments, from pg_policies:
--       "Published comments are publicly readable"   to public          status = 'published'
--       "members select their own comments"          to authenticated   member_id = current_ghost_member_id()
--     Permissive policies OR together: anon reads published rows, and authenticated reads
--     published rows plus its own rows at any status.
--   * postgres owns these functions and has BYPASSRLS, so no policy on either table applies
--     inside them. Visibility is written into each body.
--
-- WHY NOT A POLICY ON CLASSIFICATIONS. A permissive SELECT policy reading
-- exists (select 1 from public.comments c where c.id = comment_id) would follow the comments
-- policies by itself, since a policy subquery runs under the caller's own RLS. It would also
-- open every column of every such row, because both client roles hold table SELECT:
-- claim_text, commenter_message and tribal_example would read for any comment the caller can
-- see. And it would override classifications_service_only, which the analytics page probes as a
-- deny. These functions leave the table as closed as it is and return fixed columns.
--
-- THE PRICE. Each body restates the comments SELECT predicate above, as live on 2026-09-21. A
-- change to the SELECT policies on public.comments has to change both functions in the same
-- migration, or a function answers for a comment the policies no longer show. Re-keying
-- identity to profiles.id, step 2 of the rebuild map, will be that change.
--
-- WHO EXECUTES WHAT
--   comment_tiers(uuid[])         anon and authenticated. The public half: what every card
--                                 shows. Tiers on published comments are shown to every reader
--                                 by design, and without them the feed withholds every body as
--                                 unread, so anon needs it. It returns nothing a card does not
--                                 already show to that reader.
--   own_comment_readings(uuid[])  authenticated only. The caller's own reading, for comments
--                                 the caller wrote. anon owns no comment.
-- Both return the newest classification per comment, under the column names of TIER_COLUMNS and
-- READING_COLUMNS in data.ts. tribal_markers, tribal_example, opposing_view_engaged and
-- resolved_at are returned by neither and stay pipeline only.
--
-- Not closed here: comments.body on a Breach comment is still readable with the public key. The
-- reason and the follow-up are in exchange/open/2026-09-21-security-01.
--
-- Function rules, from tonight's measured mistakes: SECURITY DEFINER, search_path '' with every
-- name qualified, EXECUTE revoked from PUBLIC and from anon by name before any grant, measured
-- afterwards. Plain CREATE, so a concurrent definition fails this migration instead of being
-- overwritten.

create function public.comment_tiers(comment_ids uuid[])
returns table (
  comment_id uuid,
  ai_suggested_tier public.tier,
  self_declared_tier public.tier,
  final_tier public.tier,
  specificity_score integer,
  classified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (cl.comment_id)
    cl.comment_id,
    cl.ai_suggested_tier,
    cl.self_declared_tier,
    cl.final_tier,
    cl.specificity_score,
    cl.classified_at
  from public.comments c
  join public.classifications cl on cl.comment_id = c.id
  where c.id = any (comment_ids)
    and (
      c.status = 'published'::public.comment_status
      or c.member_id = (select public.current_ghost_member_id())
    )
  order by cl.comment_id, cl.classified_at desc, cl.id desc;
$$;

comment on function public.comment_tiers(uuid[]) is
  'The public half of each comment''s newest classification (ai_suggested_tier, self_declared_tier, final_tier, specificity_score, classified_at), for the ids given whose comment the caller could already read: published, or the caller''s own through current_ghost_member_id(). An id the caller cannot read returns no row. Restates the SELECT policies on public.comments as of 2026-09-21; change it with them.';

create function public.own_comment_readings(comment_ids uuid[])
returns table (
  comment_id uuid,
  claim_text text,
  strength text,
  commenter_message text,
  specificity_score integer,
  emotion public.emotion_level,
  article_engagement public.article_engagement_level,
  borderline_flag boolean,
  borderline_other_tier public.tier,
  classified_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (cl.comment_id)
    cl.comment_id,
    cl.claim_text,
    cl.strength,
    cl.commenter_message,
    cl.specificity_score,
    cl.emotion,
    cl.article_engagement,
    cl.borderline_flag,
    cl.borderline_other_tier,
    cl.classified_at
  from public.comments c
  join public.classifications cl on cl.comment_id = c.id
  where c.id = any (comment_ids)
    and c.member_id = (select public.current_ghost_member_id())
  order by cl.comment_id, cl.classified_at desc, cl.id desc;
$$;

comment on function public.own_comment_readings(uuid[]) is
  'The caller''s private reading of their own comments (claim_text, strength, commenter_message, specificity_score, emotion, article_engagement, borderline_flag, borderline_other_tier, classified_at), newest classification per comment, for the ids given whose comments.member_id is current_ghost_member_id(). No row for a signed-out or unclaimed session, and none for another member''s comment. Ownership is the predicate of the policy "members select their own comments"; change it with that policy.';

-- A new function in public is executable by PUBLIC, the PostgreSQL default, and by anon,
-- authenticated and service_role through default privileges (pg_default_acl). PUBLIC and anon
-- are revoked by name, each in its own statement, and each client role's EXECUTE then comes from
-- the grant below rather than from a default. service_role keeps its default grant: it has
-- BYPASSRLS and table SELECT on both tables, so these give it nothing it does not already hold.
revoke execute on function public.comment_tiers(uuid[]) from public;
revoke execute on function public.comment_tiers(uuid[]) from anon;
revoke execute on function public.comment_tiers(uuid[]) from authenticated;
grant execute on function public.comment_tiers(uuid[]) to anon;
grant execute on function public.comment_tiers(uuid[]) to authenticated;

revoke execute on function public.own_comment_readings(uuid[]) from public;
revoke execute on function public.own_comment_readings(uuid[]) from anon;
revoke execute on function public.own_comment_readings(uuid[]) from authenticated;
grant execute on function public.own_comment_readings(uuid[]) to authenticated;

notify pgrst, 'reload schema';
