/**
 * home-page-mount.jsx
 *
 * Entry bundle for the member-aware home (index.hbs). Mounts a single
 * target — #dialecta-profile-root — when the visitor is a signed-in
 * member, rendering their canonical profile (fingerprint, axes, live
 * feed, archetype, Steward Order, connections) at /. Visitors land on
 * the article-feed grid in index.hbs which is plain HTML and needs no
 * JS beyond the sitewide chrome in shell.js.
 *
 * This bundle also handles the /profile/?id=<other-member> cross-profile
 * browse case from index.hbs (when a signed-in viewer wants to look at
 * someone else's profile via the home route). The dedicated /profile/
 * route uses its own profile-mount.jsx with the simpler own-only flow.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import DialectaProfileResponsive from './dialecta-profile.jsx';
import { EditProfilePanel } from './dialecta-profile-edit.jsx';
import { SettingsDrawer } from './dialecta-profile-settings.jsx';
import { useProfileData, mergeProfileWithGhost } from './dialecta-profile-data.js';
import DialectaShare from './dialecta-share.jsx';

// ── Profile Live Feed ────────────────────────────────────────────────────
// Pulls a single mixed-type array of items from /api/profile/_feed.
// `viewer` enables relationship-tagging on items (subjects in the
// viewer's follow graph come back tagged relationship='source'). Empty
// viewer = cold-start = the same global-public stream.
function useProfileFeed({ viewer, limit = 20 }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    const params = new URLSearchParams();
    if (viewer) params.set('viewer', viewer);
    params.set('limit', String(limit));
    fetch(`${base}/api/profile/_feed?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`Feed ${r.status}`);
        return r.json();
      })
      .then(json => setItems(json.items || []))
      .catch(err => console.error('[Dialecta] Feed fetch failed:', err))
      .finally(() => setLoading(false));
  }, [viewer, limit]);

  return { items, loading };
}

// ── Profile root ─────────────────────────────────────────────────────────
// Three rendering modes:
//   1. Own profile  — viewer signed in, targetMemberId === viewer.id.
//                     Edit + settings hamburger surfaced.
//   2. Other member — viewer signed in, viewing someone else via ?id=.
//                     No edit / settings.
//   3. Public visit — viewer not signed in, viewing via ?id=. Same surface
//                     as (2). Public-facing fields with no interactions.
function ProfileRoot({ targetMemberId, isOwnProfile, viewerGhost }) {
  const ownHints = isOwnProfile
    ? { name: viewerGhost.name, avatar: viewerGhost.avatar_image }
    : null;
  const { data, loading, error, reload } = useProfileData(targetMemberId, ownHints);
  const { items: liveFeedItems } = useProfileFeed({ viewer: viewerGhost.id, limit: 20 });
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showArchetype, setShowArchetype] = useState(false);

  if (isOwnProfile) {
    window.__dialectaOpenSettings = () => setShowSettings(true);
  }

  useEffect(() => {
    if (!isOwnProfile) return;
    const btn = document.getElementById('dialecta-settings-btn');
    if (btn) btn.style.display = 'block';

    // ?settings=open URL param auto-opens the settings drawer on arrival.
    // Kept for backwards compatibility with bookmarked URLs / outside
    // links; the universal Settings handler in shell.js now handles the
    // common in-page case without a navigation.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('settings') === 'open') {
        setShowSettings(true);
        url.searchParams.delete('settings');
        const cleaned = url.pathname
          + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '')
          + url.hash;
        window.history.replaceState({}, '', cleaned);
      }
    } catch { /* malformed URL — ignore */ }

    return () => { if (btn) btn.style.display = 'none'; };
  }, [isOwnProfile]);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'DM Mono', monospace",
        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#8c8780',
      }}>Loading profile...</div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 13, color: '#b8372e',
      }}>Could not load profile data.</div>
    );
  }

  const displayedGhost = isOwnProfile ? viewerGhost : {
    id:           targetMemberId,
    name:         '',
    email:        '',
    avatar_image: '',
    created_at:   '',
    is_author:    false,
  };

  const user = mergeProfileWithGhost(data, displayedGhost, isOwnProfile);

  // Profile share URL stays on /profile/?id=<uuid> until Cloudflare path
  // routing makes /contributor/<handle> reachable at dialecta.org. After
  // that, change this one line to use user.handleSlug.
  const profileShareUrl = 'https://dialecta.org/profile/?id=' + encodeURIComponent(targetMemberId);

  // Hero-corner controls. The Edit Profile pill was removed 2026-05-03;
  // own-profile editing is reached via inline elements (clickable display
  // name, bio, etc.) which fire the onEdit callback. Share stays as a
  // brass-flared icon button (see DialectaShare variant="icon").
  const editControl = (
    <DialectaShare
      url={profileShareUrl}
      title={(user.name || 'Contributor') + ' on Dialecta'}
      description={user.bio || ''}
      surfaceType="profile"
      surfaceId={user.handleSlug || targetMemberId}
      memberUuid={viewerGhost.id || null}
      variant="icon"
    />
  );

  return (
    <>
      <DialectaProfileResponsive
        user={user}
        viewerGhostId={viewerGhost.id}
        withChrome={false}
        editControl={editControl}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditing(true)}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        showArchetypeSelector={showArchetype}
        onOpenArchetypeSelector={() => setShowArchetype(true)}
        onCloseArchetypeSelector={() => setShowArchetype(false)}
        liveFeedItems={liveFeedItems}
        onProfileChange={reload}
      />
      {isOwnProfile && showSettings && (
        <SettingsDrawer
          user={user}
          memberUuid={targetMemberId}
          memberEmail={viewerGhost.email}
          onClose={() => setShowSettings(false)}
          onEditProfile={() => { setShowSettings(false); setEditing(true); }}
          onOpenArchetype={() => { setShowSettings(false); setShowArchetype(true); }}
        />
      )}
      {isOwnProfile && editing && (
        <EditProfilePanel
          ghostMemberId={targetMemberId}
          initial={{
            display_name: user.name,
            handle:       user.handleSlug ?? '',
            bio:          user.bio        ?? '',
            avatar_url:   user.avatarUrl  ?? '',
            location:     user.location   ?? '',
          }}
          initials={user.initials}
          onSave={() => { setEditing(false); reload(); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}

// ── Mount ────────────────────────────────────────────────────────────────

function mountAll() {
  const profileRoot = document.getElementById('dialecta-profile-root');
  if (!profileRoot) return;

  const viewerGhost = {
    id:           profileRoot.dataset.memberId      || '',
    name:         profileRoot.dataset.memberName    || 'Anonymous',
    email:        profileRoot.dataset.memberEmail   || '',
    avatar_image: profileRoot.dataset.memberAvatar  || '',
    created_at:   profileRoot.dataset.memberCreated || '',
    is_author:    false,
  };

  const params         = new URLSearchParams(window.location.search);
  const viewingId      = params.get('id');
  const targetMemberId = viewingId || viewerGhost.id;

  if (!targetMemberId) {
    profileRoot.innerHTML =
      '<p style="padding:80px 40px;text-align:center;font-family:\'DM Sans\',sans-serif;color:#8c8780;">' +
      'Please <a href="/signin/" style="color:#b8862e;">sign in</a> to view your profile, or visit the ' +
      '<a href="/fingerprint/" style="color:#b8862e;">contributors page</a> to see example profiles.' +
      '</p>';
    return;
  }

  const isOwnProfile = !!viewerGhost.id && viewerGhost.id === targetMemberId;
  createRoot(profileRoot).render(
    <ProfileRoot
      targetMemberId={targetMemberId}
      isOwnProfile={isOwnProfile}
      viewerGhost={viewerGhost}
    />
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
