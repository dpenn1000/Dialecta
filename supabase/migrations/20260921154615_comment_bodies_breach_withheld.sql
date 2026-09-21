-- Recorded as 20260921154615 by apply_migration, 2026-09-21, from the security seat's draft
-- council/security/2026-09-21-breach-body-migrations/20260921183000_comment_bodies_breach_withheld.sql.
--
-- comments.body and comments.mentions, released through a function instead of a column grant, for
-- every comment the caller could already read whose newest classification is not Breach. Finishes
-- the follow-up promised in exchange/open/2026-09-21-security-01: the third and last function the
-- discourse layer needs before comments.body and comments.mentions can leave the anon and
-- authenticated column grants. Designed on the convener's brief, 2026-09-21.
--
-- THE TWO DECISIONS THIS FUNCTION MAKES, both matching the app as measured in
-- apps/web/src/components/discourse/data.ts toComment() today:
--   * No classification yet: withheld, the same as the app's 'unread' state. The cross join lateral
--     below is an inner join in effect, since its subquery returns zero rows for a comment with no
--     classifications row, and a comment the lateral drops is a comment this function returns
--     nothing for. It does not distinguish "never classified" from "id not in the read set" to the
--     caller, which matches toComment(): a tierless comment shows no body regardless of the reason.
--   * Suppressed: withheld unconditionally, even from the comment's own author. Matches
--     toComment()'s status === 'suppressed' branch, which is checked before isOwn and before tier.
--
-- NOT DECIDED HERE, left open as toComment() already leaves them: whether an author should see
-- their own Breach text (this function says no, same as the card), and whether specificity_score on
-- a Breach comment should also be withheld. Both are still legal's, per 2026-09-21-security-01.
--
-- Measured in pg_catalog before writing, 2026-09-21:
--   * comments holds 15 columns; anon and authenticated hold column SELECT on every one except
--     member_email (closed by 20260921044120). body and mentions are still open on both roles at
--     the table's own ACL; this migration adds the function and does not touch that grant. The
--     revoke is a separate migration
--     (20260921184500_close_comments_body_and_mentions_to_public.sql), applied only after both
--     readers below stop selecting these columns directly (exchange/open/2026-09-21-security-01,
--     "the order is fixed").
--   * The SELECT policies on comments are unchanged since 20260921063139: "Published comments are
--     publicly readable" (public, status = 'published') and "members select their own comments"
--     (authenticated, member_id = current_ghost_member_id()). This function restates that OR, the
--     same as comment_tiers and own_comment_readings, because postgres owns this function and has
--     BYPASSRLS, so no policy on comments or classifications applies inside it.
--   * classifications.final_tier is nullable; ai_suggested_tier is not, idx_classifications_comment
--     is UNIQUE on comment_id. coalesce(final_tier, ai_suggested_tier) is toTier()'s own fallback:
--     packages/core resolveFinalTier(), called with only an AI tier and a self-declared tier (no
--     community votes, no Stage 2.5, neither of which this function or the app's own fallback call
--     ever has at read time), always returns aiTier: weight 0.4 beats self's weight 0.15 in every
--     case that two-signal sum can produce, and an argmax tie goes to the AI tier by construction
--     (packages/core/src/resolution.ts, read, not assumed). Dry run against the 3 live comments,
--     this function's own SELECT without the CREATE wrapper: 3 rows back, tiers echo/forum/forum,
--     matching 2026-09-21-security-01's own measurement.
--
-- THE PRICE, the same shape as 20260921063139's: this restates both the comments SELECT predicate
-- and the tier-resolution fallback. A change to either, the two policies or the locked
-- 40/35/15/10 weighting, has to change this function in the same migration, or it answers for a
-- comment, or a tier, the rest of the platform no longer agrees on.
--
-- WHO EXECUTES IT: anon and authenticated, both. Every card on the discourse feed that is not
-- withheld shows its body to every reader, signed in or not, so anon needs it for the feed to
-- render at all. authenticated needs the same for the same cards, plus its own pending-review rows
-- once classified (suppressed still comes back withheld regardless of ownership; see above).
--
-- Function rules, the same as 20260921063139: SECURITY DEFINER, STABLE, search_path '' with every
-- name qualified, EXECUTE revoked from PUBLIC and from anon and authenticated by name before any
-- grant, measured afterwards. Plain CREATE, so a concurrent definition fails this migration instead
-- of being overwritten.

create function public.comment_bodies(comment_ids uuid[])
returns table (
  comment_id uuid,
  body text,
  mentions jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id as comment_id, c.body, c.mentions
  from public.comments c
  cross join lateral (
    select coalesce(x.final_tier, x.ai_suggested_tier) as effective
    from public.classifications x
    where x.comment_id = c.id
    order by x.classified_at desc, x.id desc
    limit 1
  ) t
  where c.id = any (comment_ids)
    and (
      c.status = 'published'::public.comment_status
      or c.member_id = (select public.current_ghost_member_id())
    )
    and c.status <> 'suppressed'::public.comment_status
    and t.effective <> 'breach'::public.tier;
$$;

comment on function public.comment_bodies(uuid[]) is
  'comments.body and comments.mentions, for the ids given whose comment the caller could already read (published, or the caller''s own through current_ghost_member_id()) and whose newest classification exists, is not Breach, and whose comment is not suppressed. An id failing any of those returns no row: no classification, suppressed, and Breach all read the same as "no body" to the caller, matching toComment() in apps/web/src/components/discourse/data.ts. Restates the SELECT policies on public.comments and the AI-wins fallback in packages/core/src/resolution.ts as of 2026-09-21; change it when either changes.';

revoke execute on function public.comment_bodies(uuid[]) from public;
revoke execute on function public.comment_bodies(uuid[]) from anon;
revoke execute on function public.comment_bodies(uuid[]) from authenticated;
grant execute on function public.comment_bodies(uuid[]) to anon;
grant execute on function public.comment_bodies(uuid[]) to authenticated;

notify pgrst, 'reload schema';
