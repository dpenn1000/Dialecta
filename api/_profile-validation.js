/**
 * api/_profile-validation.js
 *
 * Shared validation helper for endpoints that consume profile fields.
 *
 * Pattern: any endpoint that looks up a profile by member_uuid and writes
 * any NOT NULL column from a profile-derived field is vulnerable to
 * partial-profile failures (e.g., display_name === NULL → 500 on insert).
 * This helper standardizes the validation + error shape.
 *
 * Usage:
 *   import { requireCompleteProfile } from './_profile-validation.js';
 *
 *   const { data: profile, error } = await supabase.from('profiles')
 *     .select('ghost_member_id, display_name')
 *     .eq('ghost_member_id', member_uuid).maybeSingle();
 *   if (error) throw error;
 *
 *   const incomplete = requireCompleteProfile(profile, ['display_name']);
 *   if (incomplete) {
 *     return res.status(incomplete.status).json(incomplete.body);
 *   }
 *
 * The returned `body.action` is the canonical handoff to the client UI
 * for rendering a CTA button instead of a generic "submission failed"
 * message. The Discourse Layer + article editor read this field.
 */

const PROFILE_SETUP_URL = '/profile/';

/**
 * @param {object|null} profile The Supabase profiles row, or null if no row exists.
 * @param {string[]} requiredFields Profile field names that must be non-empty strings.
 * @returns {null | { status: number, body: object }} null when valid, otherwise an
 *   error response payload to return verbatim to the client.
 */
export function requireCompleteProfile(profile, requiredFields = ['display_name']) {
  if (!profile) {
    return {
      status: 403,
      body: {
        error: 'Profile not found',
        detail: 'No Dialecta profile exists for this member. Visit your profile to create it.',
        action: { label: 'Set up profile', url: PROFILE_SETUP_URL },
      },
    };
  }

  const missing = requiredFields.filter((f) => {
    const v = profile[f];
    return v === null || v === undefined || (typeof v === 'string' && v.trim() === '');
  });

  if (missing.length === 0) return null;

  const fieldList = missing.join(', ');
  return {
    status: 400,
    body: {
      error: 'Profile setup incomplete',
      detail:
        missing.length === 1
          ? `Add a ${fieldList} on your profile before continuing.`
          : `Add the following on your profile before continuing: ${fieldList}.`,
      missing,
      action: { label: 'Set up profile', url: PROFILE_SETUP_URL },
    },
  };
}
