-- enum-labels.sql
-- Every enum in public with its labels in sort order.
--
-- Why this exists: packages/core restates five live enums by hand (TIER_IDS,
-- ARCHETYPE_IDS, Emotion, ArticleEngagement, OpposingViewEngagement), and nothing
-- checks that they agree. It also carries FORMING, which the spec calls an
-- archetype and the archetype_id enum does not contain.
--
-- Compare with Constants.public.Enums in supabase/types.ts (generated) and with
-- the unions in packages/core/src. On 2026-09-21 all ten matched Constants.
-- A standing test in packages/core against Constants is the durable form;
-- this query is the catalog side of it, for when types.ts may be stale.

select t.typname                                             as enum_name,
       count(*)                                              as labels,
       string_agg(e.enumlabel, ',' order by e.enumsortorder) as labels_in_order
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
group by t.typname
order by t.typname;
