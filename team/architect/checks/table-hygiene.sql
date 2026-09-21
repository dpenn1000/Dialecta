-- table-hygiene.sql
-- One row per table in public: size, row security, keys, type hygiene,
-- foreign keys without a leading index, and documentation.
--
-- Why this exists: the organization and hygiene baseline in
-- team/architect/knowledge/2026-live-schema-hygiene-census.md. On 2026-09-21:
-- 0 timestamp-without-tz, 0 varchar/char, 0 json columns; RLS on all 31 tables;
-- 12 foreign keys without a leading index (the advisor's unindexed_foreign_keys
-- lint also said 12, table by table); 6 core tables without a table comment.
--
-- live_rows comes from pg_stat_user_tables, an estimate maintained by the
-- statistics collector. Use count(*) when a decision turns on the exact number.

with t as (
  select c.oid, c.relname, c.relrowsecurity as rls, c.relforcerowsecurity as rls_forced,
         coalesce(s.n_live_tup, 0) as live_rows,
         obj_description(c.oid, 'pg_class') is not null as has_table_comment
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_stat_user_tables s on s.relid = c.oid
  where n.nspname = 'public' and c.relkind in ('r', 'p')
),
pk as (
  select con.conrelid,
         string_agg(a.attname || ':' || format_type(a.atttypid, a.atttypmod), ',') as pk_cols
  from pg_constraint con
  join pg_attribute a on a.attrelid = con.conrelid and a.attnum = any(con.conkey)
  where con.contype = 'p'
  group by con.conrelid
),
pol as (select polrelid, count(*) as policies from pg_policy group by polrelid),
cols as (
  select a.attrelid,
         count(*) filter (where a.atttypid = 'timestamp'::regtype)                   as ts_without_tz,
         count(*) filter (where a.atttypid in ('varchar'::regtype, 'bpchar'::regtype)) as varchar_or_char,
         count(*) filter (where a.atttypid = 'json'::regtype)                        as json_not_jsonb,
         count(*) filter (where col_description(a.attrelid, a.attnum) is null)       as cols_without_comment,
         count(*)                                                                    as total_cols
  from pg_attribute a
  where a.attnum > 0 and not a.attisdropped
  group by a.attrelid
),
fk as (
  select con.conrelid,
         count(*) as fks,
         count(*) filter (where not exists (
           select 1 from pg_index i
           where i.indrelid = con.conrelid
             and (i.indkey::int2[])[0:array_length(con.conkey, 1) - 1] @> con.conkey
             and (i.indkey::int2[])[0:array_length(con.conkey, 1) - 1] <@ con.conkey)) as fks_without_leading_index
  from pg_constraint con
  where con.contype = 'f'
  group by con.conrelid
)
select t.relname                                 as table_name,
       t.live_rows,
       t.rls, t.rls_forced,
       coalesce(pol.policies, 0)                 as policies,
       coalesce(pk.pk_cols, 'NONE')              as primary_key,
       coalesce(fk.fks, 0)                       as foreign_keys,
       coalesce(fk.fks_without_leading_index, 0) as fks_unindexed,
       cols.ts_without_tz, cols.varchar_or_char, cols.json_not_jsonb,
       t.has_table_comment,
       cols.cols_without_comment, cols.total_cols
from t
left join pk   on pk.conrelid = t.oid
left join pol  on pol.polrelid = t.oid
left join cols on cols.attrelid = t.oid
left join fk   on fk.conrelid = t.oid
order by t.relname;
