/**
 * dialecta-profile-data-pure.js
 *
 * Pure-logic part of the profile data layer: shape-merging + canonical
 * label tables. No React hooks, no fetch, no browser globals. Server-
 * importable from Next.js Server Components without `'use client'`.
 *
 * The companion file `dialecta-profile-data.js` owns the client-side
 * hooks (useProfileData) and fetch helpers (fetchProfile, updateProfile,
 * setFollow). It re-exports the contents of THIS file so theme
 * consumers keep a single import path.
 *
 * Edit this file ONLY in the theme repo (this location is the canonical
 * source of truth). The `dialecta-next` project copies it at build time
 * via `scripts/sync-theme.js`; direct edits to that copy are overwritten
 * on the next sync.
 */

// ─── Constants ────────────────────────────────────────────────────────────

export const EMPTY_AXIS = { graduations: 0, tierMix: {}, topicPhases: [] };

// Aspirational-archetype label lookup. Mirrors the canonical ARCHETYPES
// list in dialecta-profile.jsx (kept duplicated to avoid a component
// import from the data layer). When a new archetype is added to that
// list, mirror it here.
export const ARCHETYPE_LABELS = {
  skeptic:       'The Skeptic',
  synthesizer:   'The Synthesizer',
  advocate:      'The Advocate',
  builder:       'The Builder',
  empiricist:    'The Empiricist',
  contextualist: 'The Contextualist',
  illuminator:   'The Illuminator',
  reviser:       'The Reviser',
};

// ─── Shape merger ─────────────────────────────────────────────────────────

// `isOwnProfile` controls whether ghost-session data is allowed as a fallback
// for displayed-user fields. On own-profile views, ghost IS the displayed user
// (viewer = displayed), so falling back to ghost.name / ghost.bio / etc.
// preserves identity when the Supabase row is empty (e.g., right after lazy-
// create). On cross-profile views, ghost is either a synthesized stub or the
// viewer's session, neither of which describes the displayed user. Falling
// back there would print the viewer's name onto someone else's profile. The
// fix the other thread flagged.
export function mergeProfileWithGhost(apiData, ghost, isOwnProfile = false) {
  const profile    = apiData            ?? {};
  const axisScores = apiData?.axisScores ?? null;
  const archetype  = apiData?.archetype  ?? null;
  const stats      = apiData?.stats      ?? {};

  const displayName =
    profile.display_name
    || (isOwnProfile ? ghost.name : null)
    || 'Anonymous';

  // Handle priority: profiles.handle (canonical, migration 029) → email
  // localpart (own-profile fallback for any row missing a handle) → seed:*
  // slug → empty. profileHandle is the raw slug; `handle` is the display
  // string with the @ prefix.
  const profileHandle = profile.handle ?? '';
  const handle = profileHandle
    ? '@' + profileHandle
    : (isOwnProfile && ghost.email
        ? '@' + ghost.email.split('@')[0]
        : (profile.ghost_member_id?.startsWith('seed:')
            ? '@' + profile.ghost_member_id.slice(5)
            : ''));

  const rawAvatar =
    profile.avatar_url
    || (isOwnProfile ? ghost.avatar_image : null)
    || null;
  const avatarUrl = (rawAvatar && rawAvatar.includes('d=blank')) ? null : rawAvatar;

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const joined =
    isOwnProfile && ghost.created_at
      ? new Date(ghost.created_at).toLocaleDateString('en-US', {
          month: 'long', year: 'numeric',
        })
      : '';

  // Wrap the API's flat axisScores ({ acuity: 14, ... }) into the per-axis
  // object shape the Fingerprint engine consumes ({ acuity: { graduations,
  // tierMix, topicPhases }, ... }). Keys are canonical v1.1 pillar names —
  // engine v2.0.0 dropped the legacy translation layer.
  // tierMix and topicPhases require an axis_events query — not yet fetched.
  // All rings render as seed state (smooth, no inner texture) until that
  // pipeline is in place.
  const fingerprint = {
    acuity:      axisScores ? { graduations: axisScores.acuity      ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
    calibration: axisScores ? { graduations: axisScores.calibration ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
    magnanimity: axisScores ? { graduations: axisScores.magnanimity ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
    discourse:   axisScores ? { graduations: axisScores.discourse   ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
    consistency: axisScores ? { graduations: axisScores.consistency ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
    reach:       axisScores ? { graduations: axisScores.reach       ?? 0, tierMix: {}, topicPhases: [] } : EMPTY_AXIS,
  };

  return {
    name:     displayName,
    handle,
    handleSlug: profileHandle,
    initials,
    avatar:   initials,       // legacy fallback used in a few component spots
    avatarUrl,
    bio:      profile.bio      ?? (isOwnProfile ? ghost.bio      : null) ?? '',
    location: profile.location ?? (isOwnProfile ? ghost.location : null) ?? '',
    joined,

    archetype: archetype
      ? { id: archetype.id, label: archetype.label, note: archetype.note }
      : { id: 'forming', label: 'Pattern Still Forming', note: 'Assigned by the platform based on your engagement patterns.' },

    // Aspirational archetype: contributor's declared growth target.
    // Persisted on profiles.aspirational_archetype (migration 027).
    // Label is duplicated from the ARCHETYPES list in dialecta-profile.jsx
    // rather than imported, to keep this data layer free of component
    // dependencies. Stays in sync with the eight-archetype canon.
    aspirational: profile.aspirational_archetype
      ? {
          id:    profile.aspirational_archetype,
          label: ARCHETYPE_LABELS[profile.aspirational_archetype] || null,
        }
      : null,
    resonance:    profile.resonance ?? 0,

    // Onboarding signal: show the WelcomeCard until the member has set
    // BOTH display_name and bio in Supabase. Display_name proves they
    // opened the edit panel and saved; bio proves they wrote something
    // about themselves (the only field readers actually see). Avatar is
    // covered by Gravatar fallback so we don't gate on that — they can
    // upload a custom one any time without re-triggering the card.
    welcomeNeeded: isOwnProfile && (!apiData?.display_name || !apiData?.bio),
    isAuthorAccount: !!profile.is_author,

    // Steward Order: writer-type taxonomy. Author always wins the public
    // claim; null until first commit. orderPendingProposal carries the
    // most-recent classifier output awaiting confirmation.
    order: profile.order_id
      ? { id: profile.order_id, label: profile.order_label, family: profile.order_family }
      : null,
    orderPendingProposal: profile.order_pending_proposal ?? null,

    fingerprint,

    totals: {
      comments:        stats.totalComments   ?? 0,
      articlesEngaged: stats.articlesEngaged ?? 0,
      nominatedUp:     stats.nominatedUp     ?? 0,
      nominatedDown:   stats.nominatedDown   ?? 0,
    },

    tierCounts:    stats.tierCounts ?? {},
    tierBreakdown: stats.tierCounts ?? {},
    forumPct:      stats.forumPct   ?? 0,

    ghostMemberId: ghost.id,
    isAuthor:      ghost.is_author ?? false,

    connections: apiData?.connections ?? {
      readers:          0,
      sources:          0,
      correspondents:   0,
      sparringPartners: 0,
    },
    readers:          apiData?.readers          ?? [],
    sources:          apiData?.sources          ?? [],
    correspondents:   apiData?.correspondents   ?? [],
    sparringPartners: apiData?.sparringPartners ?? [],

    authorStats: ghost.is_author
      ? { articles: 0, totalReads: 0, discussionQuality: 0 }
      : null,

    // Identity sections (migration 015). All four fields default to empty
    // shapes when a profile hasn't populated them yet, so the component
    // never has to null-check before mapping.
    //   influences      jsonb[] of { title, author, note, cover_url, source }
    //   field_notes     jsonb[] of { url, caption }, capped at 4 in the UI
    //   mind_changes    jsonb[] of { from, to, why }, capped at 3 in the UI
    //   wrestling_with  text — single open question, ~280 chars in the UI
    influences:    Array.isArray(profile.influences)   ? profile.influences   : [],
    fieldNotes:    Array.isArray(profile.field_notes)  ? profile.field_notes  : [],
    mindChanges:   Array.isArray(profile.mind_changes) ? profile.mind_changes : [],
    wrestlingWith: profile.wrestling_with ?? '',

    recentArticles: [],

    // Pact signature: rendered as a hand-script line under the display
    // name. Empty until they sign at /pact/. signature_font defaults to
    // Mrs Saint Delafield via the migration so legacy rows render
    // consistently with the original Pact page visual.
    pact_signed_name: profile.pact_signed_name ?? null,
    signature_font:   profile.signature_font   ?? 'Mrs Saint Delafield',
  };
}
