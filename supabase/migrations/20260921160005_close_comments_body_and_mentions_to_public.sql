-- Recorded as 20260921160005 by apply_migration, 2026-09-21, from the security seat's draft
-- council/security/2026-09-21-breach-body-migrations/20260921184500_close_comments_body_and_mentions_to_public.sql,
-- applied after both reader switches landed (62c5752).
--
-- DO NOT APPLY BEFORE BOTH READER SWITCHES LAND. This is the third of three steps
-- (exchange/open/2026-09-21-security-01, "the order is fixed"): comment_bodies() first
-- (20260921183000_comment_bodies_breach_withheld.sql), then apps/web/src/components/discourse/data.ts
-- and apps/web/src/app/profile/_lib/data.ts + rows.ts stop selecting comments.body and
-- comments.mentions directly, then this. Applied out of order, this returns 42501 to both readers:
-- the discourse feed on every article page falls to its "unavailable" state
-- (apps/web/src/components/discourse/data.ts loadDiscourse's catch block), and the profile page's
-- recent-comments section fails closed to empty (apps/web/src/app/profile/_lib/data.ts loadKeyed,
-- comments.error branch). Both pages still return 200, so an HTTP status check alone would not
-- catch the break; read the page content.
--
-- comments.body and comments.mentions returned real comment text and @-mention payloads to the
-- public anon key and to authenticated, for every comment either role could already see the row
-- for, Breach-tier included. Both readers now read these two columns through
-- public.comment_bodies(uuid[]) instead of the column grant below.
--
-- Same mechanic as 20260921044120_close_comments_member_email_to_public.sql, which this migration
-- narrows further: Postgres has no column-level REVOKE that overrides a table grant, so this
-- revokes SELECT on the whole table again and grants it back per column, every column except
-- member_email (closed already), body and mentions (closed here). The column set anon and
-- authenticated keep, unchanged in count and order from the 044120 grant minus body and mentions:
-- id, member_id, member_name, article_id, article_slug, article_title, status, created_at,
-- published_at, delta_acknowledged, hardened_at, parent_id. Twelve columns, measured against
-- information_schema.columns for public.comments on 2026-09-21: fifteen columns total, minus
-- member_email, body, mentions.
--
-- comments.member_id and comments.mentions[].member_id are unchanged by this migration and stay
-- public: that is the credential and bridge-value finding at 2026-09-21-convener-05 and
-- council/security/hotfix-2026-09-21-api-comments/README.md ("What this does not close"), a
-- different column and a different fix, not reopened here.

revoke select on public.comments from anon, authenticated;

grant select (
  id, member_id, member_name, article_id, article_slug, article_title,
  status, created_at, published_at, delta_acknowledged, hardened_at, parent_id
) on public.comments to anon, authenticated;

notify pgrst, 'reload schema';
