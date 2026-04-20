/**
 * dialecta-profile-data.js
 *
 * Client-side data layer for the profile page.
 *
 * Exports:
 *   useProfileData(ghostMemberId)  — React hook, loads profile + stats
 *   updateProfile(ghostMemberId, fields)  — PATCH editable fields
 *   mergeProfileWithGhost(apiData, ghostMember) — shape data for the component
 *
 * Usage in the profile component mount script:
 *
 *   import { useProfileData, mergeProfileWithGhost } from './dialecta-profile-data.js';
 *
 *   function ProfilePage({ ghostMember }) {
 *     const { data, loading, error, reload } = useProfileData(ghostMember.id);
 *     if (loading) return <LoadingState />;
 *     const user = mergeProfileWithGhost(data, ghostMember);
 *     return <DialectaProfileBody user={user} onSave={reload} />;
 *   }
 *
 * The API base URL is read from the DIALECTA_API_URL environment variable
 * at build time (Vercel injects this as NEXT_PUBLIC_DIALECTA_API_URL if
 * using Next.js, or you can hard-code it for the Ghost/bundle build).
 *
 * For the Ghost bundle, set window.__DIALECTA_API_URL__ in the theme layout:
 *   <script>window.__DIALECTA_API_URL__ = "https://your-vercel-app.vercel.app";</script>
 */

import { useState, useEffect, useCallback } from 'react';

// ─── Resolve API base ─────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  // Vite / Next.js build-time injection
  if (typeof process !== 'undefined' && process.env.DIALECTA_API_URL) {
    return process.env.DIALECTA_API_URL.replace(/\/$/, '');
  }
  return '';
}

// ─── Fetch helpers ────────────────────────────────────────────────────────

async function fetchProfile(memberId) {
  const res = await fetch(`${apiBase()}/api/profile/${memberId}`);
  if (!res.ok) throw new Error(`Profile fetch failed: ${res.status}`);
  return res.json();
}

/**
 * updateProfile — PATCH editable profile fields.
 *
 * @param {string} memberId  — Ghost member UUID
 * @param {{ display_name?, bio?, avatar_url?, location? }} fields
 * @returns {Promise<{ profile: object }>}
 */
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

// ─── React hook ──────────────────────────────────────────────────────────

/**
 * useProfileData
 *
 * @param {string|null} ghostMemberId
 * @returns {{ data: object|null, loading: boolean, error: string|null, reload: () => void }}
 */
export function useProfileData(ghostMemberId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    if (!ghostMemberId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProfile(ghostMemberId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [ghostMemberId]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}

// ─── Shape merger ─────────────────────────────────────────────────────────

/**
 * mergeProfileWithGhost
 *
 * Takes the API response (Supabase data) and the Ghost member object
 * (from window.Ghost.member or the data-user attribute) and produces the
 * USER shape the profile component expects.
 *
 * Ghost member shape (from Ghost Members API / data-user attribute):
 * { id, name, email, avatar_image, created_at, location, subscribed }
 *
 * Supabase API response: { profile, axisScores, archetype, stats }
 *
 * @param {object|null} apiData   — from useProfileData
 * @param {object}      ghost     — from Ghost theme / data-user attribute
 * @returns {object}              — USER prop for DialectaProfileBody
 */
export function mergeProfileWithGhost(apiData, ghost) {
  const profile    = apiData?.profile    ?? {};
  const axisScores = apiData?.axisScores ?? null;
  const archetype  = apiData?.archetype  ?? null;
  const stats      = apiData?.stats      ?? {};

  // Display name: Supabase profile overrides Ghost name (Ghost name is the
  // canonical identity; Supabase display_name is the member's preferred
  // platform handle if they want something different).
  const displayName = profile.display_name || ghost.name || 'Anonymous';
  const handle      = '@' + (ghost.email ?? '').split('@')[0];

  // Avatar: Supabase avatar_url overrides Ghost avatar_image
  const avatarUrl   = profile.avatar_url || ghost.avatar_image || null;

  // Initials fallback for the avatar placeholder
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  // Joined date from Ghost
  const joined = ghost.created_at
    ? new Date(ghost.created_at).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric',
      })
    : '';

  // Six Pillars axis values — default to 0 when not yet computed
  const axes = {
    acuity:      axisScores?.acuity      ?? 0,
    calibration: axisScores?.calibration ?? 0,
    magnanimity: axisScores?.magnanimity ?? 0,
    discourse:   axisScores?.discourse   ?? 0,
    consistency: axisScores?.consistency ?? 0,
    reach:       axisScores?.reach       ?? 0,
  };

  return {
    name:     displayName,
    handle,
    initials,
    avatarUrl,
    bio:      profile.bio      ?? ghost.bio      ?? '',
    location: profile.location ?? ghost.location ?? '',
    joined,

    // Archetype
    archetype: archetype
      ? { id: archetype.id, label: archetype.label, note: archetype.note }
      : null,

    // Fingerprint axes — these feed the SVG renderer directly
    axes,

    // Stats
    totals: {
      comments:       stats.totalComments    ?? 0,
      articlesEngaged: stats.articlesEngaged ?? 0,
      nominatedUp:    stats.nominatedUp      ?? 0,
      nominatedDown:  stats.nominatedDown    ?? 0,
    },

    tierCounts: stats.tierCounts ?? {},
    forumPct:   stats.forumPct   ?? 0,

    // Pass through the raw ghost_member_id so the edit panel can call
    // updateProfile without needing to extract it from elsewhere.
    ghostMemberId: ghost.id,

    // Whether this member is an author (Ghost role check happens server-side
    // or is passed in the data-user attribute by the Ghost helper).
    isAuthor: ghost.is_author ?? false,

    // Placeholder connection counts — replace when votes table is wired up
    connections: {
      readers:         0,
      sources:         0,
      correspondents:  0,
      sparringPartners: 0,
    },
    sparringPartners: [],
    authorStats: ghost.is_author
      ? { articles: 0, totalReads: 0 }
      : null,
    recentArticles: [],
  };
}
