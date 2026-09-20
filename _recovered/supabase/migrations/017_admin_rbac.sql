-- ============================================================================
-- 017_admin_rbac.sql
-- ----------------------------------------------------------------------------
-- Normalized role-based access control for platform admin operations.
--
-- Replaces the boolean-flag-per-domain pattern (is_admin, is_quote_admin) with
-- a proper RBAC layer:
--
--   admin_roles                       named roles, system or custom
--   admin_capabilities                atomic permissions
--   admin_role_capabilities           many-to-many: role -> capabilities
--   profile_admin_roles               many-to-many: profile -> roles
--   profile_admin_capability_grants   per-profile overrides (additive or revoke)
--   admin_audit_log                   tamper-evident trail of permission changes
--   profile_effective_capabilities    view: union of role caps + overrides
--
-- Why now: at scale, boolean flags can't answer "who can do X", lack audit
-- history, can't carry time-limited grants, and force a painful rewrite when
-- a role hierarchy becomes necessary. This migration is the structural
-- investment that prevents a rewrite later.
--
-- Backwards compatibility: existing flags (profiles.is_admin,
-- profiles.is_quote_admin, profiles.is_author) remain untouched. Existing API
-- endpoints (/api/article/repolish, /api/quotes admin paths) continue to read
-- those flags and keep working. The new RBAC layer is additive.
--
-- Phase 2 (later, separate migrations): API endpoints refactor to call
-- hasCapability() against the RBAC layer; flags become role-grant side
-- effects; eventually flags are dropped.
--
-- Idempotent: every statement uses IF NOT EXISTS / IF EXISTS / ON CONFLICT.
-- Safe to re-run.
-- ============================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────────────
-- 1. admin_roles - named roles
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_roles (
  id           text         PRIMARY KEY,
  display_name text         NOT NULL,
  description  text,
  is_system    boolean      NOT NULL DEFAULT false,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE admin_roles IS
  'Named admin roles. Roles are data, not enum constants. Addable by Publishers in the admin UI without schema changes. is_system=true marks the four founding roles (publisher/editor/curator/reviewer) as protected from deletion.';

INSERT INTO admin_roles (id, display_name, description, is_system) VALUES
  ('publisher', 'Publisher', 'Top of the masthead. Full reach across all admin domains. Manages other admins.', true),
  ('editor',    'Editor',    'Article and content admin. Repolish, reclassify, archive articles. Light member visibility.', true),
  ('curator',   'Curator',   'Quote library curation. Adds, edits, archives quotes; reviews member submissions.', true),
  ('reviewer',  'Reviewer',  'Feedback triage. Reads, prioritizes, and manages submissions in the feedback queue.', true)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. admin_capabilities - atomic permissions
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_capabilities (
  id           text         PRIMARY KEY,
  domain       text         NOT NULL,
  display_name text         NOT NULL,
  description  text,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_capabilities_domain ON admin_capabilities (domain);

COMMENT ON TABLE admin_capabilities IS
  'Atomic permissions checked by API endpoints via hasCapability(). New permissions are added by inserting rows here and into admin_role_capabilities. No schema or code changes required.';

INSERT INTO admin_capabilities (id, domain, display_name, description) VALUES
  ('feedback.triage',       'feedback', 'Triage feedback',           'Read the feedback queue and set type/priority/status.'),
  ('feedback.manage',       'feedback', 'Manage feedback',           'Assign feedback to owners, decline with reasons, archive resolved items.'),
  ('articles.repolish',     'articles', 'Re-polish articles',        'Re-run the polish engine on existing articles with custom settings.'),
  ('articles.reclassify',   'articles', 'Reclassify articles',       'Override AI tier classification on submitted articles.'),
  ('articles.archive',      'articles', 'Archive articles',          'Soft-delete published articles.'),
  ('quotes.curate',         'quotes',   'Curate the quote library',  'Create, edit, archive quotes; review member-submitted drafts.'),
  ('members.view',          'members',  'View member list',          'Read the member directory with profile metadata.'),
  ('members.manage_roles',  'members',  'Manage admin roles',        'Grant or revoke admin roles on profiles.'),
  ('tuning.read',           'tuning',   'Read tuning parameters',    'View the platform TUNING knob audit dashboard.'),
  ('tuning.write',          'tuning',   'Write tuning parameters',   'Adjust platform TUNING knobs.')
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. admin_role_capabilities - role to capability mapping
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_role_capabilities (
  role_id        text         REFERENCES admin_roles(id) ON DELETE CASCADE,
  capability_id  text         REFERENCES admin_capabilities(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, capability_id)
);

COMMENT ON TABLE admin_role_capabilities IS
  'Defines which capabilities each role grants. Editing a row here changes the effective permissions of every profile holding that role. Audit-logged on change.';

-- Publisher: every current capability
INSERT INTO admin_role_capabilities (role_id, capability_id)
SELECT 'publisher', id FROM admin_capabilities
ON CONFLICT DO NOTHING;

-- Editor: article admin + member visibility
INSERT INTO admin_role_capabilities (role_id, capability_id) VALUES
  ('editor', 'articles.repolish'),
  ('editor', 'articles.reclassify'),
  ('editor', 'articles.archive'),
  ('editor', 'members.view')
ON CONFLICT DO NOTHING;

-- Curator: quote library
INSERT INTO admin_role_capabilities (role_id, capability_id) VALUES
  ('curator', 'quotes.curate')
ON CONFLICT DO NOTHING;

-- Reviewer: feedback queue
INSERT INTO admin_role_capabilities (role_id, capability_id) VALUES
  ('reviewer', 'feedback.triage'),
  ('reviewer', 'feedback.manage')
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. profile_admin_roles - profile to role assignments
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_admin_roles (
  profile_id   uuid         REFERENCES profiles(id) ON DELETE CASCADE,
  role_id      text         REFERENCES admin_roles(id),
  granted_at   timestamptz  NOT NULL DEFAULT now(),
  granted_by   uuid         REFERENCES profiles(id),
  expires_at   timestamptz,
  note         text,
  PRIMARY KEY (profile_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_admin_roles_role ON profile_admin_roles (role_id);
-- Note: profile_id lookups are served by the PRIMARY KEY (profile_id, role_id)
-- as the leading column. The expiry filter happens at query time in the
-- profile_effective_capabilities view, where now() is fine (only index
-- predicates require IMMUTABLE functions).

COMMENT ON TABLE profile_admin_roles IS
  'Which profiles hold which roles. A profile can hold multiple roles; effective capabilities are the union of all current roles plus per-profile overrides.';
COMMENT ON COLUMN profile_admin_roles.expires_at IS
  'Optional expiry for time-limited grants (contractor access, incident response). NULL = permanent until revoked. Capabilities derive only from roles where expires_at IS NULL OR expires_at > now().';
COMMENT ON COLUMN profile_admin_roles.granted_by IS
  'The profile id that granted this role. NULL for system actions (migration bootstrap).';

-- ────────────────────────────────────────────────────────────────────────────
-- 5. profile_admin_capability_grants - per-profile overrides
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profile_admin_capability_grants (
  profile_id     uuid         REFERENCES profiles(id) ON DELETE CASCADE,
  capability_id  text         REFERENCES admin_capabilities(id),
  granted        boolean      NOT NULL,
  granted_at     timestamptz  NOT NULL DEFAULT now(),
  granted_by     uuid         REFERENCES profiles(id),
  expires_at     timestamptz,
  note           text,
  PRIMARY KEY (profile_id, capability_id)
);

COMMENT ON TABLE profile_admin_capability_grants IS
  'Per-profile capability overrides. granted=true grants a capability not in any of the profile''s roles. granted=false revokes a capability that one of the profile''s roles would otherwise grant. Used for edge cases (temporary access without a full role grant). Most profiles have no rows here.';

-- ────────────────────────────────────────────────────────────────────────────
-- 6. admin_audit_log - every permission-related action
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid         REFERENCES profiles(id),
  target_id   uuid         REFERENCES profiles(id),
  action      text         NOT NULL,
  details     jsonb        NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor  ON admin_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON admin_audit_log (target_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON admin_audit_log (action,    created_at DESC);

COMMENT ON TABLE admin_audit_log IS
  'Append-only audit trail of every admin permission change. Actions: role_granted, role_revoked, role_expired, capability_overridden, capability_override_removed, role_capability_changed, bootstrap. details jsonb carries action-specific context.';
COMMENT ON COLUMN admin_audit_log.actor_id IS
  'Profile id that performed the action. NULL for system actions (migration bootstrap, scheduled expiry).';

-- ────────────────────────────────────────────────────────────────────────────
-- 7. profile_effective_capabilities - view that materializes the union
-- ────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW profile_effective_capabilities
WITH (security_invoker = true) AS
WITH role_caps AS (
  SELECT
    par.profile_id,
    arc.capability_id
  FROM profile_admin_roles par
  JOIN admin_role_capabilities arc ON arc.role_id = par.role_id
  WHERE par.expires_at IS NULL OR par.expires_at > now()
),
override_grants AS (
  SELECT
    profile_id,
    capability_id
  FROM profile_admin_capability_grants
  WHERE granted = true
    AND (expires_at IS NULL OR expires_at > now())
),
override_revokes AS (
  SELECT
    profile_id,
    capability_id
  FROM profile_admin_capability_grants
  WHERE granted = false
    AND (expires_at IS NULL OR expires_at > now())
)
SELECT DISTINCT
  p.profile_id,
  p.capability_id
FROM (
  SELECT * FROM role_caps
  UNION
  SELECT * FROM override_grants
) p
WHERE NOT EXISTS (
  SELECT 1 FROM override_revokes r
  WHERE r.profile_id = p.profile_id AND r.capability_id = p.capability_id
);

COMMENT ON VIEW profile_effective_capabilities IS
  'Union of (role-derived capabilities) + (additive per-profile grants), minus (per-profile revokes). Excludes expired grants and overrides. Read this view to answer "what can profile X do right now."';

-- ────────────────────────────────────────────────────────────────────────────
-- 8. Bootstrap - Daniel becomes the founding Publisher
-- ────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  daniel_id uuid;
BEGIN
  SELECT id INTO daniel_id FROM profiles
   WHERE display_name ILIKE 'daniel%' LIMIT 1;

  IF daniel_id IS NULL THEN
    RAISE NOTICE 'No Daniel profile found; skipping bootstrap. Manually grant Publisher role after the profile exists.';
  ELSE
    INSERT INTO profile_admin_roles (profile_id, role_id, granted_by, note)
    VALUES (
      daniel_id,
      'publisher',
      NULL,
      'Founding Publisher; bootstrapped via migration 017_admin_rbac.'
    )
    ON CONFLICT (profile_id, role_id) DO NOTHING;

    INSERT INTO admin_audit_log (actor_id, target_id, action, details)
    VALUES (
      NULL,
      daniel_id,
      'role_granted',
      jsonb_build_object(
        'role_id',         'publisher',
        'reason',          'bootstrap via 017_admin_rbac migration',
        'auto_bootstrap',  true,
        'migration',       '017_admin_rbac.sql'
      )
    );
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- 9. Row-Level Security
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE admin_roles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_capabilities               ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_role_capabilities          ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_admin_roles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_admin_capability_grants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log                  ENABLE ROW LEVEL SECURITY;

-- All access goes through the API service role, which bypasses RLS by design.
-- Any future client-side reads (e.g., own role display in profile) will get
-- explicit SELECT policies added when the surface is built.

COMMIT;

-- ============================================================================
-- After apply:
--   1. Daniel is bootstrapped as Publisher automatically. Verify via:
--        SELECT par.*, ar.display_name
--        FROM profile_admin_roles par
--        JOIN admin_roles ar ON ar.id = par.role_id
--        WHERE par.profile_id = (
--          SELECT id FROM profiles WHERE display_name ILIKE 'daniel%' LIMIT 1
--        );
--
--   2. Effective capabilities check (expect 10 rows for Daniel):
--        SELECT * FROM profile_effective_capabilities
--         WHERE profile_id = (
--           SELECT id FROM profiles WHERE display_name ILIKE 'daniel%' LIMIT 1
--         );
--
--   3. Add new capabilities later by INSERT into admin_capabilities +
--      admin_role_capabilities. No schema or code changes.
--
--   4. Phase 2 (subsequent migrations / API refactors): retire
--      profiles.is_admin / is_quote_admin flags after API endpoints have
--      migrated to hasCapability() checks.
-- ============================================================================
