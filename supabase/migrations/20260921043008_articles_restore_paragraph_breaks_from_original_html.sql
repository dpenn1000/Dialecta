-- Restore the paragraph breaks of "The Moment You Stop Waiting for Your Life to Start".
--
-- 20260921041504 wrote this article's body as one 2,754-character paragraph. That
-- matched the live Ghost page, which also rendered it as one paragraph, so the crawl
-- was faithful. The breaks were lost earlier, when the piece was submitted:
-- articles.original_html holds a single <p> in which each original paragraph
-- boundary survives as a sentence end glued to the next capital with no space
-- ("That's who I am.So at 44"). There are exactly ten, each at a natural paragraph
-- opening, and this puts a break at each one: eleven paragraphs.
--
-- Only breaks are inserted. The words are the published text from the crawl,
-- unchanged: rejoining these paragraphs with single spaces reproduces the previous
-- body_html text byte for byte (asserted when this file was generated).
--
-- Guarded: it replaces the body only if it is still exactly what 041504 wrote
-- (md5 6d6223d8d33ac6cb97c7a8011a5a88b2), and raises otherwise rather than overwrite someone's edit.
-- Touches only body_html, a column added tonight. Reversible the same way as the
-- backfill: scripts/import-ghost.mjs upserts on ghost_post_id.
--
-- Edited after apply: the early return for a missing row was added so the file
-- replays on an empty database (supabase db reset). Live ran without it; the row
-- existed there, so the path live took is unchanged. The UPDATE is unchanged.

do $fix$
declare n int;
begin
  -- An empty database (supabase db reset) has no Ghost-era rows: nothing to restore.
  if not exists (select 1 from public.articles where ghost_post_id = '69f2937b4e51770001fb5218') then
    raise notice 'paragraph restore: article not present, nothing to do';
    return;
  end if;
  update public.articles
     set body_html = $dlx$<p>I am not a spontaneous person. I follow the calendar. I live by structure and schedules. I don't miss things. I check the school folder, make the lunch, pack the snack, and make sure the water bottle came home at the end of the day so it's ready again in the morning. I confirm, double-check, stay ahead. That's who I am.</p>
<p>So at 44, when I quit my job, we pulled our 12-year-old out of school, and as a family left for six weeks—Thailand, the Philippines, and a version of life with no routine, no structure, no clear plan—it didn't make sense on paper. But it made sense somewhere else.</p>
<p>I'm a wife, a mom, a psychiatric nurse, and a breast cancer survivor. I've spent years doing what needed to be done—showing up, holding it together, taking care of everyone else. And somewhere along the way, life became something I was managing more than actually living. I thought maybe what I needed was distance—a reset, a chance to step outside of my life long enough to see it clearly.</p>
<p>And it worked. Everything felt lighter, slower, more intentional. I wasn't rushing through my day—I was in it. Fully present in a way that felt unfamiliar, but also right. When it was time to come home, I wasn't ready. I was sad to leave—not because my life back home was wrong, but because something about how I was living over there felt better. More connected. More awake.</p>
<p>So I had to ask myself a different question. Not how do I stay there? but why did that feel so good, and how do I bring that into my real life? Because the truth is, it wasn't just the place. It was the way I was showing up—less rushed, less distracted, more present, more willing to be where I was.</p>
<p>That realization changed something. Maybe the goal isn't to find a place where life feels better. Maybe the goal is to build a life where you feel that way, no matter where you are.</p>
<p>We came home without a grand epiphany. No lightning bolt. No perfectly mapped-out plan. Just a quieter kind of clarity that's harder to ignore. I don't want to go back to autopilot. I don't want to keep waiting for "someday" to feel that alive again.</p>
<p>So we made another decision that doesn't fully make sense on paper—we're moving across the country. Not to chase a feeling, but to honor what we learned from it.</p>
<p>Surviving cancer changes your relationship with time. Being a wife and a mother shows you how easy it is to put yourself last and call it responsibility. At some point, you realize no one is coming to tell you it's time. You decide.</p>
<p>And maybe that's what being exactly where you're supposed to be really means—not that everything is figured out, but that you're finally paying attention to what makes you feel alive and choosing not to ignore it.</p>
<p>Because once you've felt that, you can't unknow it.</p>$dlx$
   where ghost_post_id = '69f2937b4e51770001fb5218'
     and author_member_id = '64c6e1f4-512f-4982-bbdc-7885b5e30449'
     and md5(body_html) = '6d6223d8d33ac6cb97c7a8011a5a88b2';
  get diagnostics n = row_count;
  if n <> 1 then
    raise exception 'paragraph restore: expected to update 1 row, updated %', n;
  end if;
end
$fix$;
