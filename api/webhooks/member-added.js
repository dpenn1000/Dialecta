/**
 * api/webhooks/member-added.js
 *
 * Ghost webhook receiver for member.added events. Proactively creates
 * a Supabase profile row the moment a Ghost member signs up — instead
 * of waiting for them to visit a page that triggers a fetch (which
 * left some members orphaned in Ghost-only state until their first
 * Dialecta visit).
 *
 * Auth model: shared-secret via URL query param. Set MEMBER_WEBHOOK_SECRET
 * in Vercel env, then register the webhook in Ghost admin with the URL:
 *   https://dialecta.vercel.app/api/webhooks/member-added?secret=<value>
 * Ghost will POST to that exact URL on member.added events. The secret
 * is the URL itself — keep it long and random (32+ chars).
 *
 * Why URL-secret instead of HMAC: simplicity. Ghost's HMAC signing is
 * the more rigorous path (X-Ghost-Signature header) but requires
 * disabling Vercel's bodyParser to verify against the raw bytes. For
 * member-name sync (low-stakes data, idempotent on the receiving side),
 * URL-secret is sufficient and ships in 50 lines instead of 100.
 *
 * Idempotency: the upsert uses `ignoreDuplicates: true`, so if a
 * profile row already exists (e.g., the user's first visit lazy-created
 * one), this webhook is a no-op. The self-heal branch in
 * /api/profile/[id].js handles backfilling incomplete existing rows.
 *
 * POST body shape (Ghost member.added payload):
 *   {
 *     member: {
 *       current: {
 *         id:           string,  // 24-hex ObjectID (legacy)
 *         uuid:         string,  // UUID v4 — what we key on
 *         name:         string,  // may be null if signup form left blank
 *         email:        string,
 *         avatar_image: string,  // may be a d=blank gravatar
 *         ...
 *       },
 *       previous: {}             // empty for added events
 *     }
 *   }
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Shared-secret check. Constant-time compare so timing-attacks can't
  // inch the secret out a character at a time.
  const expected = process.env.MEMBER_WEBHOOK_SECRET;
  if (!expected) {
    return res.status(500).json({
      error: 'Webhook secret not configured (MEMBER_WEBHOOK_SECRET env var missing)',
    });
  }
  const provided = typeof req.query.secret === 'string' ? req.query.secret : '';
  if (!constantTimeEquals(provided, expected)) {
    return res.status(401).json({ error: 'Invalid secret' });
  }

  // Extract member from Ghost's payload shape.
  const member =
    (req.body && req.body.member && req.body.member.current) ||
    (req.body && req.body.member) ||
    null;
  if (!member || !member.uuid) {
    return res.status(400).json({
      error: 'Payload must include member.current.uuid (Ghost member.added shape)',
    });
  }

  // Build display_name with fallback chain: Ghost name → email local-part.
  const trimmedName = typeof member.name === 'string' ? member.name.trim() : '';
  const display_name =
    trimmedName ||
    (typeof member.email === 'string' && member.email.includes('@')
      ? member.email.slice(0, member.email.indexOf('@'))
      : null);

  // Skip d=blank gravatars — they're transparent placeholders, not photos.
  // The merge layer in dialecta-profile-data.js does the runtime fallback
  // to ghost.avatar_image for own-profile views regardless.
  let avatar_url = null;
  if (
    typeof member.avatar_image === 'string' &&
    member.avatar_image &&
    !member.avatar_image.includes('d=blank')
  ) {
    avatar_url = member.avatar_image;
  }

  try {
    // Idempotent insert. If a row with this ghost_member_id already
    // exists (e.g., the user's first visit lazy-created one before the
    // webhook fired), ignoreDuplicates makes this a no-op. The
    // self-heal branch in /api/profile/[id].js backfills nulls on
    // subsequent fetches anyway, so no data is lost either way.
    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          ghost_member_id: member.uuid,
          display_name,
          avatar_url,
        },
        { onConflict: 'ghost_member_id', ignoreDuplicates: true }
      );
    if (error) throw error;

    return res.status(200).json({
      synced: true,
      ghost_member_id: member.uuid,
      display_name,
      avatar_set: !!avatar_url,
    });
  } catch (e) {
    console.error('Member webhook sync failed:', e);
    return res.status(500).json({
      error: 'Sync failed',
      detail: e.message,
    });
  }
}

function constantTimeEquals(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
