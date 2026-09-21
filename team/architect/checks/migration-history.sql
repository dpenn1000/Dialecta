-- migration-history.sql
-- The live migration history, with a content hash, for comparison with
-- supabase/migrations/ by version AND by content.
--
-- Why this exists: on 2026-09-21 two of 31 live migrations had a tracked file
-- under the version live recorded. Three files carried a different version from
-- the one apply_migration stamped, three live migrations had no file anywhere,
-- and the unapplied baseline sat in the folder the CLI reads as pending. The
-- Supabase CLI compares "only the timestamps", so a renamed file reads as a new
-- migration. See team/architect/knowledge/2026-migration-history-against-live.md.
--
-- How to compare, per row:
--   1. A file named <version>_*.sql exists under supabase/migrations/.
--   2. md5_sql_only equals the same hash of the file: strip "--" comments, strip
--      all whitespace, lowercase, md5. A byte-level mismatch alone is usually
--      comments; a mismatch here is a real difference in what ran.
-- Then the reverse: every file whose version is absent here is pending to the CLI.

select version,
       name,
       md5(array_to_string(statements, ''))                                  as md5_bytes,
       md5(lower(regexp_replace(regexp_replace(array_to_string(statements, ''),
             '--[^\n]*', '', 'g'), '\s+', '', 'g')))                         as md5_sql_only,
       length(array_to_string(statements, ''))                               as chars
from supabase_migrations.schema_migrations
order by version;
