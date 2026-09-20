-- Recovered verbatim, not reconstructed, from supabase_migrations.schema_migrations'
-- own `statements` column (read-only SQL against the live project, migrator seat,
-- 2026-09-20). This version was applied directly to the live project earlier the same
-- day by the convener through the Supabase MCP's apply_migration and had no local file
-- until now; adding it is the second half of the migrator's task today, so the repo
-- matches the database. Everything from here down is the original migration, unedited.
--
-- This one is DML, not DDL: a data change, not a schema change. It is still recorded as
-- a migration because supabase_migrations.schema_migrations tracks it that way, and this
-- file exists so the local history matches the remote one exactly.

-- Publish the three comments that have sat at pending_review since April 2026.
--
-- circulation established that the binding precondition for any first arrival is that the
-- comments are alive: every one of Dialecta's 269 visitors so far landed on a site where zero
-- comments had ever been published. security confirmed this is safe, because it is a status
-- change on rows that already exist rather than a trip through the exploitable create path.
--
-- Reversible in one statement: set status back to 'pending_review' and published_at to null.

update public.comments
set status = 'published',
    published_at = coalesce(published_at, now())
where status = 'pending_review';
