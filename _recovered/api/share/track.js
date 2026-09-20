/**
 * api/share/track.js
 *
 * POST endpoint that records a single share event into the share_events
 * table (migration 030). Fire-and-forget from the client side: the
 * <DialectaShare> component invokes this in parallel with opening the
 * share window so a failed track never blocks the user's share.
 *
 * Body:
 *   {
 *     surface_type: 'profile' | 'article' | 'comment' | 'quote' | 'celebration',
 *     surface_id:   string,    // handle, post_id, comment_id, quote_id, event_id
 *     channel:      'link' | 'twitter' | 'facebook' | 'linkedin' | 'email' | 'native',
 *     member_uuid:  string | null,  // optional; logged-out shares allowed
 *   }
 *
 * Returns { ok: true } on success, validation errors on bad input. The
 * DB CHECK constraints also enforce the enums; we validate here so a
 * typo from the client gets a clean 400 instead of a generic 500.
 */

import { createClient } from '@supabase/supabase-js';
import { applyCors } from '../_cors.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const ALLOWED_SURFACE_TYPES = new Set([
  'profile', 'article', 'comment', 'quote', 'celebration',
]);
const ALLOWED_CHANNELS = new Set([
  'link', 'x', 'twitter', 'facebook', 'linkedin', 'reddit', 'email', 'native',
]);

export default async function handler(req, res) {
  if (applyCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const surface_type = typeof body.surface_type === 'string' ? body.surface_type.trim() : '';
  const surface_id   = typeof body.surface_id   === 'string' ? body.surface_id.trim()   : '';
  const channel      = typeof body.channel      === 'string' ? body.channel.trim()      : '';
  const member_uuid  = typeof body.member_uuid  === 'string' && body.member_uuid.trim()
                       ? body.member_uuid.trim() : null;

  if (!ALLOWED_SURFACE_TYPES.has(surface_type)) {
    return res.status(400).json({ error: 'invalid surface_type' });
  }
  if (!surface_id) {
    return res.status(400).json({ error: 'surface_id is required' });
  }
  if (surface_id.length > 256) {
    return res.status(400).json({ error: 'surface_id too long' });
  }
  if (!ALLOWED_CHANNELS.has(channel)) {
    return res.status(400).json({ error: 'invalid channel' });
  }

  try {
    const { error } = await supabase
      .from('share_events')
      .insert({
        member_id:    member_uuid,
        surface_type,
        surface_id,
        channel,
      });
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('share/track error:', err);
    return res.status(500).json({
      error: 'Failed to record share event',
      detail: err.message,
    });
  }
}
