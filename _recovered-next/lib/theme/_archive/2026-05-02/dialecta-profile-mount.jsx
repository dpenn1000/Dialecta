/**
 * dialecta-profile-mount.jsx
 *
 * Ghost injection entry point for the profile page.
 * Replaces the mock-data-only mount from the previous session.
 *
 * Mount target in profile.hbs:
 *   <div id="dialecta-profile-root" data-user='{{member-profile-json}}'></div>
 *   <script src="{{asset "built/dialecta-profile.js"}}" defer></script>
 *
 * The data-user attribute is populated by the Ghost Handlebars helper
 * (see dialecta-profile-ghost-integration.md). It provides the Ghost member
 * shape: { id, name, email, avatar_image, created_at, location, is_author }.
 *
 * This script:
 * 1. Reads ghost member from data-user
 * 2. Fetches live data from /api/profile/:id (axis scores, archetype, stats)
 * 3. Merges into the USER shape the profile component expects
 * 4. Renders with edit mode available when viewing own profile
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import DialectaProfileResponsive from './dialecta-profile.jsx';
import { EditProfilePanel }    from './dialecta-profile-edit.jsx';
import { SettingsDrawer }      from './dialecta-profile-settings.jsx';
import { useProfileData, mergeProfileWithGhost } from './dialecta-profile-data.js';

// ─── Loading skeleton ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: '#8c8780',
    }}>
      Loading profile...
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
      fontSize: 13,
      color: '#b8372e',
    }}>
      Failed to load profile data: {message}
    </div>
  );
}

// ─── Root wrapper ─────────────────────────────────────────────────────────

function ProfileRoot({ ghostMember }) {
  // Pass identity hints so a first-time visit lazy-creates with a usable
  // display_name. Without these the new row lands NULL and the next
  // comment-compose attempt hits the profile-incomplete gate.
  const { data, loading, error, reload } = useProfileData(ghostMember.id, {
    name:   ghostMember.name,
    avatar: ghostMember.avatar_image,
    email:  ghostMember.email,
  });
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Lifted up from DialectaProfile so the SettingsDrawer (rendered as a
  // sibling) can open the same Aspirational-Archetype modal that the
  // on-profile "+ Set aspiration" pill opens.
  const [showArchetype, setShowArchetype] = useState(false);

  useEffect(() => {
    window.__dialectaOpenSettings = () => setShowSettings(true);
    const btn = document.getElementById('dialecta-settings-btn');
    const prevDisplay = btn?.style.display;
    if (btn) btn.style.display = 'block';

    // ?settings=open URL param auto-opens the settings drawer on arrival.
    // Used by the mobile drawer's "Settings" link, which navigates here from
    // any page. Cleans the param from the URL after consuming it so a refresh
    // doesn't re-trigger.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('settings') === 'open') {
        setShowSettings(true);
        url.searchParams.delete('settings');
        const cleaned = url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash;
        window.history.replaceState({}, '', cleaned);
      }
    } catch { /* malformed URL — ignore */ }

    return () => {
      // intentionally not deleted on remount
      if (btn) btn.style.display = prevDisplay ?? '';
    };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error)   return <ErrorState message={error} />;

  const user = mergeProfileWithGhost(data, ghostMember);

  // "Own profile" detection: compare ghostMember.id against the currently
  // authenticated member exposed by Ghost Portal (window.Ghost?.member?.id).
  // If the IDs match, show the Edit button.
  const currentMemberId = window.Ghost?.member?.id ?? ghostMember.id;
  const isOwnProfile    = currentMemberId === ghostMember.id;

  // Inject the Edit Profile button into the user shape so the profile
  // component can render it without needing to know about edit mode.
  // The profile component renders props.editControl if provided.
  const editControl = isOwnProfile ? (
    <button
      onClick={() => setEditing(true)}
      style={{
        background:    'transparent',
        border:        '1px solid #e0dbd2',
        borderRadius:  4,
        padding:       '5px 14px',
        fontFamily:    "'DM Mono', monospace",
        fontSize:      9,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color:         '#8c8780',
        cursor:        'pointer',
      }}>
      Edit Profile
    </button>
  ) : null;

  return (
    <>
      <DialectaProfileResponsive
        user={user}
        editControl={editControl}
        onEdit={() => setEditing(true)}
        isOwnProfile={isOwnProfile}
        onProfileChange={reload}
        withChrome={false}
        showArchetypeSelector={showArchetype}
        onOpenArchetypeSelector={() => setShowArchetype(true)}
        onCloseArchetypeSelector={() => setShowArchetype(false)}
      />

      {editing && (
        <EditProfilePanel
          ghostMemberId={ghostMember.id}
          initial={{
            display_name: user.name,
            bio:          user.bio          ?? '',
            avatar_url:   user.avatarUrl    ?? '',
            location:     user.location     ?? '',
          }}
          initials={user.initials}
          onSave={() => {
            setEditing(false);
            reload(); // re-fetch live data after save
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      {showSettings && (
        <SettingsDrawer
          user={user}
          memberUuid={ghostMember.id}
          memberEmail={ghostMember.email}
          onClose={() => setShowSettings(false)}
          onEditProfile={() => { setShowSettings(false); setEditing(true); }}
          onOpenArchetype={() => { setShowSettings(false); setShowArchetype(true); }}
        />
      )}
    </>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────

const rootEl = document.getElementById('dialecta-profile-root');

if (rootEl) {
  let ghostMember;
  try {
    ghostMember = JSON.parse(rootEl.dataset.user ?? '{}');
  } catch {
    ghostMember = {};
  }

  if (ghostMember.id) {
    createRoot(rootEl).render(<ProfileRoot ghostMember={ghostMember} />);
  } else {
    // No member ID — either not logged in or helper returned empty object.
    rootEl.innerHTML = '<p style="padding:40px;font-family:sans-serif;color:#8c8780;">Please sign in to view your profile.</p>';
  }
}
