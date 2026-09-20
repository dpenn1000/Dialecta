-- Recovered verbatim, not reconstructed, from supabase_migrations.schema_migrations'
-- own `statements` column (read-only SQL against the live project, migrator seat,
-- 2026-09-20). This version was applied directly to the live project earlier the same
-- day by the convener through the Supabase MCP's apply_migration and had no local file
-- until now; adding it is the second half of the migrator's task today, so the repo
-- matches the database. Everything from here down is the original migration, unedited.

-- Close the identity-spoofing chain at the grant layer.
--
-- api/comment.js accepts member_uuid from the request body and matches it against
-- profiles.ghost_member_id. profiles_select runs USING (true) and anon held table SELECT, so the
-- database was publishing the exact value that endpoint treats as proof of identity. security
-- named it: the database publishes its own proof of identity.
--
-- Postgres has no column-level REVOKE that overrides a table grant, so the table grant goes and
-- the other 39 columns are re-granted explicitly. service_role and postgres are untouched and
-- bypass grants regardless, which is why nothing breaks: all 27 recovered handlers that read this
-- column use SUPABASE_SERVICE_KEY, verified before running this, and apps/web never reads it.
--
-- gifted_by_member_id closes with it. It is the same kind of value, a Ghost member identifier.

revoke select on public.profiles from anon, authenticated;

grant select (
  id, display_name, bio, avatar_url, location, updated_at, is_seed, resonance, is_author,
  is_quote_admin, order_id, order_label, order_family, order_assigned_at,
  last_order_classified_count, order_pending_proposal, order_negotiation_log, pact_agreed_at,
  pact_version, pact_path, pact_signed_name, influences, field_notes, mind_changes,
  wrestling_with, polish_preferences, is_admin, signature_font, aspirational_archetype, handle,
  handle_set_at, handle_set_by_user, subscription_tier, subscription_tier_updated_at,
  subscription_tier_set_by, is_charter, is_gifted, gift_expires_at, current_aspiration_id
) on public.profiles to anon, authenticated;
