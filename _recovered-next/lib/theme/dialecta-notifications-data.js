/**
 * dialecta-notifications-data.js
 *
 * Shared constants + fetch helpers for the notification surfaces.
 * Three components consume this:
 *   - dialecta-notifications-bell.jsx (bell + drawer in nav)
 *   - dialecta-notifications-page.jsx (full /notifications/ page)
 *   - dialecta-notifications-settings.jsx (settings matrix in profile drawer)
 *
 * The API base is read from window.__DIALECTA_API_URL__ same as the rest
 * of the bundle. Empty default = same origin (Vercel routes through Ghost).
 */

export const NOTIFICATION_TYPES = [
  'comment_on_article',
  'reply_to_comment',
  'mention',
  'new_follower',
  'follow_new_article',
  'editorial',
];

export const TYPE_LABELS = {
  comment_on_article: 'Comments on your articles',
  reply_to_comment:   'Replies to your comments',
  mention:            'Mentions',
  new_follower:       'New followers',
  follow_new_article: 'Articles from people you follow',
  editorial:          'Editorial notes',
};

// Concise labels used inside the settings matrix (sit in narrow rows).
export const TYPE_LABELS_SHORT = {
  comment_on_article: 'Comment on your article',
  reply_to_comment:   'Reply to your comment',
  mention:            'You are mentioned',
  new_follower:       'New follower',
  follow_new_article: 'Article from someone you follow',
  editorial:          'Editorial note',
};

function apiBase() {
  if (typeof window === 'undefined') return '';
  const override = window.__DIALECTA_API_URL__;
  if (override) return override.replace(/\/$/, '');
  return '';
}

async function jsonFetch(path, init = {}) {
  const url = apiBase() + path;
  const resp = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  let body;
  try { body = await resp.json(); } catch { body = null; }
  if (!resp.ok) {
    const err = new Error(body?.error || `${resp.status} ${resp.statusText}`);
    err.detail = body?.detail || null;
    err.status = resp.status;
    throw err;
  }
  return body;
}

export function fetchNotifications({ memberUuid, limit = 30, before = null }) {
  const params = new URLSearchParams({ member_uuid: memberUuid, limit: String(limit) });
  if (before) params.set('before', before);
  return jsonFetch(`/api/notifications?${params.toString()}`);
}

export function markRead({ memberUuid, id }) {
  return jsonFetch(`/api/notifications/${encodeURIComponent(id)}`, {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid, _action: 'mark_read' }),
  });
}

export function markAllRead({ memberUuid }) {
  return jsonFetch(`/api/notifications`, {
    method: 'POST',
    body: JSON.stringify({ member_uuid: memberUuid, _action: 'mark_all_read' }),
  });
}

export function fetchPrefs({ memberUuid, emailHint }) {
  const params = new URLSearchParams({ member_uuid: memberUuid });
  if (emailHint) params.set('email_hint', emailHint);
  return jsonFetch(`/api/notifications/prefs?${params.toString()}`);
}

export function savePrefs({ memberUuid, prefs, emailAddress }) {
  return jsonFetch(`/api/notifications/prefs`, {
    method: 'PATCH',
    body: JSON.stringify({
      member_uuid: memberUuid,
      prefs,
      ...(emailAddress ? { email_address: emailAddress } : {}),
    }),
  });
}

/**
 * Convert a created_at ISO string into a relative time-ago label.
 * Output examples: "just now", "3 min ago", "2 hr ago", "3 days ago",
 * "Apr 17". Used in the bell drawer + notifications page for visual
 * scanability without exposing exact timestamps.
 */
export function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hr ago`;
  if (diffSec < 7 * 86400) return `${Math.floor(diffSec / 86400)} days ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * One-line plain-text description of a notification, given the row.
 * Mirrors the digest email's renderItem logic but emits plain strings.
 */
export function describeNotification(notif) {
  const p = notif.payload || {};
  const actorName = p.actor_name || 'A contributor';
  const articleTitle = p.article_title || '';
  switch (notif.type) {
    case 'comment_on_article':
      return articleTitle
        ? `${actorName} commented on your article "${articleTitle}"`
        : `${actorName} commented on your article`;
    case 'reply_to_comment':
      return articleTitle
        ? `${actorName} replied to your comment on "${articleTitle}"`
        : `${actorName} replied to your comment`;
    case 'mention':
      return `${actorName} mentioned you in a comment`;
    case 'new_follower':
      return `${actorName} started following you`;
    case 'follow_new_article':
      return articleTitle
        ? `${actorName} published "${articleTitle}"`
        : `${actorName} published a new article`;
    case 'editorial':
      return p.message || 'An editorial note on your work';
    default:
      return `${actorName} interacted with you`;
  }
}
