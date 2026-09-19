-- ============================================================================
-- 020_feedback_screenshots_bucket.sql
-- ----------------------------------------------------------------------------
-- Storage bucket for user-uploaded screenshots attached to feedback
-- submissions via the under-construction banner modal. Public-read so admins
-- viewing the queue at /dev-admin/?tab=feedback can render the thumbnails
-- without minting signed URLs. Uploads happen exclusively through the
-- /api/feedback POST handler, which holds the service-role key and applies
-- size + mime validation before writing.
--
-- 5MB size cap and image-only mime allowlist enforced at the bucket level
-- as belt-and-suspenders against a misbehaving client. /api/feedback also
-- enforces these client-side and re-validates server-side, so we have three
-- layers of protection (client form, API endpoint, storage bucket).
--
-- Note: bucket created on the public schema's storage namespace. Filename
-- pattern in the API is `feedback-<timestamp>-<random>.<ext>` so URLs are
-- non-guessable even though the bucket is public-read.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feedback-screenshots',
  'feedback-screenshots',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
