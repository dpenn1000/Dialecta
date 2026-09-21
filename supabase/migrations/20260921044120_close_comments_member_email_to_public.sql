-- comments.member_email returned real email addresses to the public anon key.
-- Found by the analytics session and verified by making the request a visitor's
-- browser makes: three rows, three addresses. Authorised by Dan, 2026-09-21.
--
-- The table ACL read {anon=arwdDxtm, authenticated=arwdDxtm, ...}, measured in
-- pg_catalog because information_schema showed no grants at all. Postgres has no
-- column-level REVOKE that overrides a table grant, so this revokes the SELECT bit
-- only and grants SELECT back per column, every column except member_email.
--
-- Verified after: member_email returns permission denied to a visitor, published
-- comments still read, the front page, an article page, /write and /analytics all
-- return 200, and the comment route reads back only id and status.
--
-- comments.member_id is deliberately left alone. It is the ghost_member_id
-- credential finding, held by security, recorded at 2026-09-21-convener-05.

revoke select on public.comments from anon, authenticated;

grant select (
  id, member_id, member_name, article_id, article_slug, article_title, body,
  status, created_at, published_at, delta_acknowledged, hardened_at, parent_id,
  mentions
) on public.comments to anon, authenticated;

notify pgrst, 'reload schema';
