-- permissive-deny-policies.sql
-- Row security policies that look like controls and cannot act as one.
--
-- Why this exists: handle_history_no_writes is FOR ALL, PERMISSIVE, USING
-- (false) WITH CHECK (false). PostgreSQL combines permissive policies with OR
-- (docs, "Row Security Policies"), so a false branch adds no access and removes
-- none. Writes on that table are refused by default deny, not by the policy.
-- A later permissive grant would open them and this policy would not stop it.
-- The fix is to drop it, or recreate it AS RESTRICTIVE.
--
-- Second pattern in the same file: a policy that reads auth.uid(), auth.jwt()
-- or current_setting() without a subselect wrap, re-evaluated per row. The
-- advisor's auth_rls_initplan lint covers this too; kept here so one file
-- lists every policy worth a second look.

select schemaname, tablename, policyname, cmd, permissive, roles,
       qual, with_check,
       case
         when permissive = 'PERMISSIVE'
              and coalesce(qual, 'false') ~* '^\(?\s*false\s*\)?$'
              and coalesce(with_check, 'false') ~* '^\(?\s*false\s*\)?$'
           then 'permissive false: denies nothing'
         when coalesce(qual, '') ~* '(auth\.(uid|jwt|role)\(\)|current_setting\()'
              and coalesce(qual, '') !~* '\(\s*select\s+(auth\.|current_setting)'
           then 'per-row auth call: wrap in a subselect'
       end as finding
from pg_policies
where schemaname = 'public'
  and (
        (permissive = 'PERMISSIVE'
         and coalesce(qual, 'false') ~* '^\(?\s*false\s*\)?$'
         and coalesce(with_check, 'false') ~* '^\(?\s*false\s*\)?$')
     or (coalesce(qual, '') ~* '(auth\.(uid|jwt|role)\(\)|current_setting\()'
         and coalesce(qual, '') !~* '\(\s*select\s+(auth\.|current_setting)')
      )
order by finding, tablename, policyname;
