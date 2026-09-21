-- identity-columns.sql
-- Every column that names a person, its type, and the foreign key behind it.
--
-- Why this exists: on 2026-09-21 a person was keyed three ways. Ghost member ids
-- as text in 18 referencing columns on 16 tables, 4 of them covered by a foreign
-- key; profile uuids in 6 columns and auth user uuids in 2, all covered.
--
-- Blind spot, by construction: the name pattern. Columns called follower_id,
-- reader_id, created_by and the like are missed. reader_id on
-- opinion_map_positions was found by its values, not its name. Widen the
-- pattern when a new naming shows up, and say so in the note that uses it.

with idcols as (
  select c.relname as table_name, a.attname as column_name,
         format_type(a.atttypid, a.atttypmod) as data_type, a.attnum, c.oid as relid
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r'
    and a.attnum > 0 and not a.attisdropped
    and a.attname ~ '(^|_)(member|user|author|profile|reader|follower|followee)_id$'
)
select i.table_name, i.column_name, i.data_type,
       coalesce((select string_agg(rc.relname || '(' || ra.attname || ')', ', ')
                 from pg_constraint con
                 join pg_class rc on rc.oid = con.confrelid
                 join pg_attribute ra on ra.attrelid = con.confrelid and ra.attnum = con.confkey[1]
                 where con.contype = 'f' and con.conrelid = i.relid
                   and i.attnum = any(con.conkey)), 'NO FOREIGN KEY') as references_target
from idcols i
order by (i.data_type = 'text') desc, i.table_name, i.column_name;
