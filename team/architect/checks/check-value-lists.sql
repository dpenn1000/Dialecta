-- check-value-lists.sql
-- Every CHECK constraint in public that carries a value list, in a stable order.
--
-- Why this exists: generated types see these columns as plain text, so a value
-- list held in a CHECK is invisible to TypeScript. On 2026-09-21 there were 20 on
-- 11 tables. One restates an enum (tier_nominations.target_tier against the tier
-- enum) and one carries two spellings for one channel (share_events.channel,
-- 'x' and 'twitter').
--
-- Use: commit the output as a snapshot next to this file and diff each run
-- against it. A changed line is a changed domain.

select c.relname                         as table_name,
       con.conname                       as constraint_name,
       pg_get_constraintdef(con.oid)     as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and con.contype = 'c'
  and pg_get_constraintdef(con.oid) ~* '(ANY \(ARRAY\[| IN \()'
order by c.relname, con.conname;
