-- ============================================================================
-- 029_profiles_handle.sql
-- ----------------------------------------------------------------------------
-- Adds canonical handle to profiles, plus history table for SEO redirects
-- and reserved-handles registry for impersonation/path-collision protection.
--
-- Enables:
--   • @mentions resolved by handle (Phase 1.1)
--   • /contributor/<handle> SEO route (Phase 1.2)
--   • Share architecture profile links (Phase 1.3)
--
-- Format rules (DB-enforced):
--   • Length 5-24 (longer floor reflects platform's "meaningful" register)
--   • Lowercase alphanumeric + dash/underscore between alphanumeric runs only
--   • Cannot start or end with dash/underscore; no consecutive specials
--   • Case-insensitive uniqueness; reserved words blocked; cooldown enforced
--
-- Backfill: existing NULL handles get auto-generated from slugified
-- display_name; handle_set_by_user=false flags them for the forced setup
-- modal on next login.
--
-- Idempotent.
-- ============================================================================

BEGIN;

-- Trigram indexes need pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. reserved_handles - admin-extendable blocklist
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS reserved_handles (
  handle      text          PRIMARY KEY,
  reason      text,
  added_by    uuid          REFERENCES profiles(id),
  added_at    timestamptz   NOT NULL DEFAULT now()
);

ALTER TABLE reserved_handles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reserved_handles_service_only ON reserved_handles;
CREATE POLICY reserved_handles_service_only ON reserved_handles
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE reserved_handles IS
  'Blocked handles. Service-role only at policy level; admins extend via authenticated API. Seed = system paths + brand + impersonation. Entries shorter than the current min length (5) are kept as defense-in-depth in case the floor is lowered later.';

INSERT INTO reserved_handles (handle, reason) VALUES
  -- System paths (URL collision)
  ('admin','system path'),('api','system path'),('library','system path'),
  ('contributor','system path'),('contributors','system path'),
  ('quotes','system path'),('quote','system path'),
  ('articles','system path'),('article','system path'),
  ('profile','system path'),('profiles','system path'),
  ('write','system path'),('dev-admin','system path'),
  ('pact','system path'),('guidebook','system path'),
  ('stewards','system path'),('about','system path'),
  ('post','system path'),('posts','system path'),
  ('page','system path'),('pages','system path'),
  ('members','system path'),('member','system path'),
  ('signin','system path'),('sign-in','system path'),
  ('signup','system path'),('sign-up','system path'),
  ('login','system path'),('log-in','system path'),
  ('logout','system path'),('log-out','system path'),
  ('dashboard','system path'),('settings','system path'),
  ('search','system path'),('tag','system path'),('tags','system path'),
  ('author','system path'),('authors','system path'),
  ('feed','system path'),('rss','system path'),
  ('sitemap','system path'),('robots','system path'),
  ('home','system path'),('index','system path'),
  -- Subdomains
  ('app','reserved subdomain'),('www','reserved subdomain'),
  ('mail','reserved subdomain'),('email','reserved subdomain'),
  ('smtp','reserved subdomain'),('ftp','reserved subdomain'),
  ('ns','reserved subdomain'),('ns1','reserved subdomain'),('ns2','reserved subdomain'),
  -- Brand
  ('dialecta','brand'),('dialecta-team','brand'),('dialecta-official','brand'),
  ('support','brand role'),('staff','brand role'),
  ('help','brand role'),('info','brand role'),('contact','brand role'),
  ('official','brand role'),('team','brand role'),
  ('founder','brand role'),('founders','brand role'),
  -- Impersonation
  ('mod','impersonation'),('mods','impersonation'),
  ('moderator','impersonation'),('moderators','impersonation'),
  ('anonymous','system identifier'),('null','system identifier'),
  ('undefined','system identifier'),('me','system identifier'),
  ('you','system identifier'),('everyone','system identifier'),
  ('here','system identifier'),('channel','system identifier'),
  ('all','system identifier'),('system','system identifier'),
  ('root','system identifier'),
  ('anthropic','third party'),('claude','third party'),
  ('deleted','state marker'),('removed','state marker'),
  ('banned','state marker'),('invalid','state marker'),
  ('default','state marker'),('test','state marker'),('demo','state marker')
ON CONFLICT (handle) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. handle_history - 301 redirects + cooldown reservation
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS handle_history (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid          NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  old_handle    text          NOT NULL,
  new_handle    text          NOT NULL,
  changed_at    timestamptz   NOT NULL DEFAULT now(),
  released_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_handle_history_old
  ON handle_history (lower(old_handle));
CREATE INDEX IF NOT EXISTS idx_handle_history_profile
  ON handle_history (profile_id, changed_at DESC);

ALTER TABLE handle_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS handle_history_authenticated_read ON handle_history;
CREATE POLICY handle_history_authenticated_read ON handle_history
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS handle_history_no_writes ON handle_history;
CREATE POLICY handle_history_no_writes ON handle_history
  FOR ALL USING (false) WITH CHECK (false);

COMMENT ON TABLE handle_history IS
  'Handle change audit. SSR /contributor/<X> falls back here when X is not a current handle: 301 redirects to current if released_at is null or future. Default null = forever reserved. Application convention: set released_at = now() + 1 year on voluntary handle change.';

-- ────────────────────────────────────────────────────────────────────────────
-- 3. profiles.handle column + format constraint
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS handle              text,
  ADD COLUMN IF NOT EXISTS handle_set_at       timestamptz,
  ADD COLUMN IF NOT EXISTS handle_set_by_user  boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.handle IS
  'Canonical lowercase handle. Drives @mentions and /contributor/<handle> URL. 5-24 chars, [a-z0-9_-] with single specials between alphanumeric runs only. Length floor of 5 reflects the platform''s meaningful register.';

COMMENT ON COLUMN profiles.handle_set_by_user IS
  'False = system-generated during backfill or signup. True = user has explicitly chosen or confirmed. Forced setup modal targets the false rows on next login.';

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_handle_format;
ALTER TABLE profiles ADD CONSTRAINT profiles_handle_format CHECK (
  handle IS NULL OR (
    length(handle) >= 5
    AND length(handle) <= 24
    AND handle ~ '^[a-z0-9]([a-z0-9]|[_-][a-z0-9])*$'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_handle_lower_unique
  ON profiles (lower(handle))
  WHERE handle IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_handle_trgm
  ON profiles USING gin (lower(handle) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS profiles_display_name_trgm
  ON profiles USING gin (lower(display_name) gin_trgm_ops);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Reserved + cooldown enforcement trigger
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.check_handle_not_reserved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.handle IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.handle IS DISTINCT FROM OLD.handle) THEN
    -- Reserved words
    IF EXISTS (
      SELECT 1 FROM public.reserved_handles
      WHERE lower(handle) = lower(NEW.handle)
    ) THEN
      RAISE EXCEPTION 'Handle "%" is reserved.', NEW.handle USING ERRCODE = 'P0001';
    END IF;

    -- Cooldown: another user's recently-changed handle still in reservation
    IF EXISTS (
      SELECT 1 FROM public.handle_history
      WHERE lower(old_handle) = lower(NEW.handle)
        AND profile_id != NEW.id
        AND (released_at IS NULL OR released_at > now())
    ) THEN
      RAISE EXCEPTION 'Handle "%" was recently used by another contributor and is in cooldown.', NEW.handle USING ERRCODE = 'P0001';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_handle_check ON profiles;
CREATE TRIGGER profiles_handle_check
  BEFORE INSERT OR UPDATE OF handle ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_handle_not_reserved();

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Backfill existing users (handle_set_by_user = false)
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  rec record;
  base_handle text;
  candidate text;
  suffix int;
BEGIN
  FOR rec IN SELECT id, display_name FROM profiles WHERE handle IS NULL LOOP
    -- Slugify: lowercase, collapse non-alphanumerics to single dash, trim ends
    base_handle := substring(
      regexp_replace(
        regexp_replace(
          lower(coalesce(rec.display_name, '')),
          '[^a-z0-9]+', '-', 'g'
        ),
        '(^-+|-+$)', '', 'g'
      ),
      1, 24
    );

    -- Empty after slugify → fallback to first 8 chars of profile id (alphanumeric)
    IF base_handle = '' THEN
      base_handle := 'member-' || substring(replace(rec.id::text, '-', ''), 1, 6);
    END IF;

    -- Ensure min length 5 (pad with zeros, still alphanumeric)
    IF length(base_handle) < 5 THEN
      base_handle := base_handle || repeat('0', 5 - length(base_handle));
    END IF;

    -- Find first available candidate (not taken, not reserved)
    candidate := base_handle;
    suffix := 0;
    WHILE EXISTS (
      SELECT 1 FROM profiles
      WHERE lower(handle) = lower(candidate) AND id != rec.id
    ) OR EXISTS (
      SELECT 1 FROM reserved_handles
      WHERE lower(handle) = lower(candidate)
    ) LOOP
      suffix := suffix + 1;
      candidate := substring(base_handle, 1, 24 - length(suffix::text) - 1) || '-' || suffix;
    END LOOP;

    UPDATE profiles
       SET handle = candidate,
           handle_set_at = now(),
           handle_set_by_user = false
     WHERE id = rec.id;
  END LOOP;
END $$;

COMMIT;
