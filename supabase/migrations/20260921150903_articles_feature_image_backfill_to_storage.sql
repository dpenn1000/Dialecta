-- Points the five legacy articles at their featured photos' copies in the
-- article-media bucket, uploaded and hash-verified on 2026-09-21 with
-- scripts/migrate-article-images.mjs (Dan ran the upload). Each URL is built
-- from the stored object's own name, so it cannot drift from what is there,
-- and the check aborts the whole migration unless all five rows point at an
-- object that exists.
-- Rollback: update public.articles set feature_image = null where
--   ghost_post_id in ('69eff72be5eec200010d5310', '69efc475e5eec200010d5299',
--   '69d5c5c083cd72000193f0cd', '69f2937b4e51770001fb5218', '69f2594b4e51770001fb51d7');

update public.articles a
set feature_image = 'https://mguulnibvzusfvyuowwh.supabase.co/storage/v1/object/public/article-media/' || o.name
from (values
  ('69eff72be5eec200010d5310', 'content/images/2026/04/v855sq14%'),
  ('69efc475e5eec200010d5299', 'content/images/2026/04/ChatGPT-Image-Apr-27--2026--04_20_31-PM_o.png'),
  ('69d5c5c083cd72000193f0cd', 'content/images/2026/04/9315c5f3-932a-4ee2-b802-5e5eacdf31f1_o.png'),
  ('69f2937b4e51770001fb5218', 'content/images/2026/04/3f252122-0cf9-45cf-82e4-f3a34b454df4_o.png'),
  ('69f2594b4e51770001fb51d7', 'content/images/2026/04/RyRy_o.png')
) as m(ghost_post_id, object_pattern)
join storage.objects o on o.bucket_id = 'article-media' and o.name like m.object_pattern
where a.ghost_post_id = m.ghost_post_id;

do $check$
declare n int;
begin
  select count(*) into n
  from public.articles a
  join storage.objects o
    on o.bucket_id = 'article-media'
   and a.feature_image = 'https://mguulnibvzusfvyuowwh.supabase.co/storage/v1/object/public/article-media/' || o.name
  where a.ghost_post_id in ('69eff72be5eec200010d5310', '69efc475e5eec200010d5299',
    '69d5c5c083cd72000193f0cd', '69f2937b4e51770001fb5218', '69f2594b4e51770001fb51d7');
  if n <> 5 then
    raise exception 'feature_image backfill: expected 5 rows pointing at stored objects, got %', n;
  end if;
end
$check$;
