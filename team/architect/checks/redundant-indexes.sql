-- redundant-indexes.sql
-- Non-unique indexes whose columns another index on the same table already covers,
-- either identically or as its leading prefix.
--
-- Why this exists: on 2026-09-21, 9 redundant indexes in public, 3 of them exact
-- duplicates of a unique index (archetypes.idx_archetypes_member,
-- articles.idx_articles_ghost_post_id, quotes.idx_quotes_quote_id). The Supabase
-- advisors reported none of them. Each costs a write on every insert and update and
-- buys nothing a B-tree on the covering index does not already give.
--
-- Read the output: "identical columns" is safe to drop. "leading prefix of" is safe to
-- drop unless a query plan shows the narrower index chosen for a reason; at this
-- database's row counts, it is not. Only the same access method, predicate and
-- expressions count as covering.

with idx as (
  select ix.indrelid, c.relname as table_name, i.relname as index_name,
         ix.indisunique, ix.indisprimary, ix.indkey::text as cols,
         coalesce(pg_get_expr(ix.indpred, ix.indrelid), '')   as pred,
         coalesce(pg_get_expr(ix.indexprs, ix.indrelid), '')  as exprs,
         am.amname
  from pg_index ix
  join pg_class i on i.oid = ix.indexrelid
  join pg_class c on c.oid = ix.indrelid
  join pg_namespace n on n.oid = c.relnamespace
  join pg_am am on am.oid = i.relam
  where n.nspname = 'public'
)
select a.table_name,
       a.index_name as redundant_index,
       b.index_name as covered_by,
       case when a.cols = b.cols then 'identical columns' else 'leading prefix of' end as relation
from idx a
join idx b
  on a.indrelid = b.indrelid and a.index_name <> b.index_name
 and a.amname = b.amname and a.pred = b.pred and a.exprs = b.exprs
 and not a.indisunique and not a.indisprimary
 and (b.cols = a.cols or b.cols like a.cols || ' %')
order by a.table_name, a.index_name;
