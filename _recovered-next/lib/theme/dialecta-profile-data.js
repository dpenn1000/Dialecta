'use client';

/**
 * dialecta-profile-data.js
 *
 * Client-side data layer for the profile page.
 *
 * Exports:
 *   useProfileData(ghostMemberId)  — React hook, loads profile + stats
 *   updateProfile(ghostMemberId, fields)  — PATCH editable fields
 *   setFollow(targetId, viewerId, follow) — POST follow/unfollow
 *   mergeProfileWithGhost(apiData, ghostMember) — re-exported from -pure.js
 *   EMPTY_AXIS, ARCHETYPE_LABELS — re-exported from -pure.js
 *
 * Pure shape-merging logic (mergeProfileWithGhost + label tables) lives
 * in dialecta-profile-data-pure.js so Next.js Server Components can
 * import it without pulling in React hooks. This file marks itself
 * `'use client'` for the same reason — useProfileData uses hooks and
 * is therefore client-only.
 */

import { useState, useEffect, useCallback } from 'react';

// Re-export the pure shape merger + label tables so theme consumers
// keep their existing single-file import path. Implementations live in
// the sibling -pure.js file so server-side imports skip the hook code
// entirely.
export {
  mergeProfileWithGhost,
  EMPTY_AXIS,
  ARCHETYPE_LABELS,
} from './dialecta-profile-data-pure.js';

// ─── Resolve API base ─────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  if (typeof process !== 'undefined' && process.env.DIALECTA_API_URL) {
    return process.env.DIALECTA_API_URL.replace(/\/$/, '');
  }
  return '';
}

// ─── Fetch helpers ────────────────────────────────────────────────────────

// Optional `hints` (name, avatar, email) are forwarded as query params and
// consumed by /api/profile/[id] when it lazy-creates a missing row on first
// fetch. Hints are passed only for own-profile views; cross-profile views
// omit them so we never seed someone else's row with the viewer's identity.
// Email enables the lazy-create fallback chain when a Ghost member signed up
// without setting a name: API derives display_name from email's local-part.
async function fetchProfile(memberId, hints) {
  const params = new URLSearchParams();
  if (hints?.name)   params.set('name', hints.name);
  if (hints?.avatar) params.set('avatar', hints.avatar);
  if (hints?.email)  params.set('email', hints.email);
  const query = params.toString();
  const url   = `${apiBase()}/api/profile/${memberId}${query ? '?' + query : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

export async function updateProfile(memberId, fields) {
  const res = await fetch(`${apiBase()}/api/profile/${memberId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Update failed: ${res.status}`);
  }
  return res.json();
}

// Follow / unfollow. The path id is the followee; viewerMemberId is the
// follower. The /api/profile/[id] POST handler discriminates on _action.
// Idempotent: follow on existing edge is a no-op, unfollow on missing
// edge is a no-op.
export async function setFollow(targetMemberId, viewerMemberId, follow) {
  const res = await fetch(`${apiBase()}/api/profile/${encodeURIComponent(targetMemberId)}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      _action:          follow ? 'follow' : 'unfollow',
      viewer_member_id: viewerMemberId,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? (follow ? 'Follow failed' : 'Unfollow failed'));
  }
  return res.json();
}

// ─── React hook ──────────────────────────────────────────────────────────

// hints is a plain object { name, avatar } that the caller passes only for
// own-profile views. Decomposed into individual primitives so the
// useCallback dep array stays stable without object-identity churn.
export function useProfileData(ghostMemberId, hints) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const hintName   = hints?.name;
  const hintAvatar = hints?.avatar;
  const hintEmail  = hints?.email;

  const load = useCallback(async () => {
    if (!ghostMemberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfile(ghostMemberId, { name: hintName, avatar: hintAvatar, email: hintEmail });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ghostMemberId, hintName, hintAvatar, hintEmail]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
