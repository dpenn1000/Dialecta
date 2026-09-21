-- "On the Far Shore of Fear" showed two engine readings: the tier column and final tier said
-- Forum (set at publication, 2026-04-27) while the stored reading said Spark (a re-run on
-- 2026-05-03 that rewrote ai_analysis and never touched the column). Dan chose Spark on
-- 2026-09-21 (Council review of the opinion maps and the overlay, item 11): it is the tier he
-- declared, and the engine's later reading agrees. The article gets rewritten and re-run under
-- the versioned path later, which will supersede this.
-- Prior values, for rollback: ai_suggested_tier = 'forum', final_tier = 'forum'.

do $fix$
declare n int;
begin
  update public.articles
     set ai_suggested_tier = 'spark', final_tier = 'spark'
   where slug = 'on-the-far-shore-of-fear'
     and ai_suggested_tier = 'forum'
     and final_tier = 'forum'
     and declared_tier = 'spark'
     and ai_analysis->>'ai_suggested_tier' = 'spark';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'expected to settle exactly one article, changed %', n;
  end if;
end
$fix$;
