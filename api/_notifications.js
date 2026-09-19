/**
 * api/_notifications.js
 *
 * Notification helper layer. Centralizes:
 *   - the canonical NOTIFICATION_TYPES list
 *   - the default prefs shape (DEFAULT_PREFS) and merge logic (resolvePrefs)
 *   - createNotification(): used by other endpoints to write a row
 *   - getOrCreatePrefs(): lazy-create on first read
 *
 * createNotification respects the recipient's prefs at write time:
 *   - if channels[type].inapp === false, we skip the write entirely
 *     (in-app notifications the user disabled don't accrue)
 *   - if channels[type].email === false (or email_enabled === false), we
 *     still write the row but mark email_status = 'skipped' so the digest
 *     worker won't pick it up
 *
 * Other endpoints call this from the same Vercel function context; we don't
 * cross HTTP boundaries internally. Pass in a Supabase client so we share
 * the calling endpoint's instance (already has SUPABASE_SERVICE_KEY context).
 */

export const NOTIFICATION_TYPES = [
  'comment_on_article',
  'reply_to_comment',
  'mention',
  'new_follower',
  'follow_new_article',
  'editorial',
];

export const DEFAULT_PREFS = {
  email_enabled: true,
  // TUNING: default digest hour (0-23, in user's local timezone). Surface
  // in the future tuning engine alongside other per-user delivery cadence
  // controls.
  digest_hour: 9,
  timezone: 'America/New_York',
  channels: {
    comment_on_article:  { inapp: true, email: true  },
    reply_to_comment:    { inapp: true, email: true  },
    mention:             { inapp: true, email: true  },
    new_follower:        { inapp: true, email: false },
    follow_new_article:  { inapp: true, email: false },
    editorial:           { inapp: true, email: true  },
  },
};

/**
 * Merge stored prefs over defaults so partially-populated rows still resolve
 * to a complete shape. New trigger types added to DEFAULT_PREFS automatically
 * appear with default channel settings until the user opens the settings UI.
 */
export function resolvePrefs(stored) {
  const base = JSON.parse(JSON.stringify(DEFAULT_PREFS));
  if (!stored || typeof stored !== 'object') return base;
  return {
    email_enabled: typeof stored.email_enabled === 'boolean' ? stored.email_enabled : base.email_enabled,
    digest_hour:   Number.isInteger(stored.digest_hour) && stored.digest_hour >= 0 && stored.digest_hour <= 23
                     ? stored.digest_hour
                     : base.digest_hour,
    timezone:      typeof stored.timezone === 'string' && stored.timezone.trim().length > 0
                     ? stored.timezone
                     : base.timezone,
    channels: NOTIFICATION_TYPES.reduce((acc, t) => {
      const storedChan = (stored.channels && stored.channels[t]) || {};
      acc[t] = {
        inapp: typeof storedChan.inapp === 'boolean' ? storedChan.inapp : base.channels[t].inapp,
        email: typeof storedChan.email === 'boolean' ? storedChan.email : base.channels[t].email,
      };
      return acc;
    }, {}),
  };
}

/**
 * Fetch (or lazy-create) the prefs row for a member.
 * Returns { member_id, email_address, prefs (resolved), last_digest_at, _existed }.
 */
export async function getOrCreatePrefs(supabase, memberId, emailHint) {
  if (!memberId) throw new Error('getOrCreatePrefs: memberId is required');

  const { data: existing, error: fetchErr } = await supabase
    .from('notification_prefs')
    .select('member_id, email_address, prefs, last_digest_at')
    .eq('member_id', memberId)
    .maybeSingle();
  if (fetchErr) throw fetchErr;

  if (existing) {
    return {
      member_id:      existing.member_id,
      email_address:  existing.email_address || emailHint || null,
      prefs:          resolvePrefs(existing.prefs),
      last_digest_at: existing.last_digest_at,
      _existed:       true,
    };
  }

  const { error: insertErr } = await supabase
    .from('notification_prefs')
    .upsert(
      { member_id: memberId, email_address: emailHint || null, prefs: {} },
      { onConflict: 'member_id', ignoreDuplicates: true }
    );
  if (insertErr) throw insertErr;

  return {
    member_id:      memberId,
    email_address:  emailHint || null,
    prefs:          resolvePrefs({}),
    last_digest_at: null,
    _existed:       false,
  };
}

/**
 * Write a notification, respecting the recipient's prefs.
 *
 * Returns { written: boolean, id: uuid | null, skipped_reason: string | null }.
 * Callers don't need to act on the return value; it's surfaced for
 * observability and tests.
 *
 * Idempotency: NOT enforced here. Callers (e.g., the comment endpoint) should
 * not re-call createNotification for the same logical event. The article
 * fan-out for follow_new_article writes one row per follower in a single
 * pass; the caller is responsible for not running the fan-out twice.
 */
export async function createNotification(supabase, {
  recipient_member_id,
  actor_member_id = null,
  type,
  target_type = null,
  target_id = null,
  target_url = null,
  payload = {},
}) {
  if (!recipient_member_id) {
    throw new Error('createNotification: recipient_member_id is required');
  }
  if (!NOTIFICATION_TYPES.includes(type)) {
    throw new Error("createNotification: unknown type '" + type + "'");
  }
  if (recipient_member_id === actor_member_id) {
    return { written: false, id: null, skipped_reason: 'self_actor' };
  }

  const { prefs } = await getOrCreatePrefs(supabase, recipient_member_id);
  const channelPrefs = prefs.channels[type] || { inapp: true, email: false };

  if (!channelPrefs.inapp) {
    return { written: false, id: null, skipped_reason: 'inapp_disabled' };
  }

  const email_status = (channelPrefs.email && prefs.email_enabled) ? 'pending' : 'skipped';

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      recipient_member_id,
      actor_member_id,
      type,
      target_type,
      target_id,
      target_url,
      payload,
      email_status,
    })
    .select('id')
    .single();
  if (error) throw error;

  return { written: true, id: data.id, skipped_reason: null };
}
