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

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import { DialectaProfileBody } from './dialecta-profile-responsive.jsx';
import { EditProfilePanel }    from './dialecta-profile-edit.jsx';
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
  const { data, loading, error, reload } = useProfileData(ghostMember.id);
  const [editing, setEditing] = useState(false);

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
      <DialectaProfileBody user={user} editControl={editControl} />

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
