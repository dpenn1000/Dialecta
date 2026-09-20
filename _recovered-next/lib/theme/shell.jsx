/**
 * shell.jsx
 *
 * The sitewide React entry point. Loaded on every page via default.hbs.
 * Mounts only the chrome that appears on every template:
 *
 *   - SignupInvite          (#dialecta-signup-invite-root)
 *   - BellWithDrawer        ([data-dialecta-bell])
 *   - DialectaSidebar       (#dialecta-sidebar — sitewide rail)
 *   - UniversalSettings     (synthesized host div — opens SettingsDrawer
 *                            from any page when [data-settings-link] is
 *                            clicked, replacing the previous reload-on-
 *                            arrival pattern)
 *
 * Per-template mounts (article reader, home profile, editor, community,
 * notifications page, fingerprint page) live in their own entry bundles
 * loaded only by the templates that need them. This keeps the sitewide
 * payload small for the SEO-landing pages (post.hbs, page-articles.hbs,
 * static pages).
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import SignupInvite from './dialecta-signup-invite.jsx';
import BellWithDrawer from './dialecta-notifications-bell.jsx';
import DialectaSidebar from './dialecta-sidebar.jsx';
import { SettingsDrawer } from './dialecta-profile-settings.jsx';
import { EditProfilePanel } from './dialecta-profile-edit.jsx';
import { useProfileData, mergeProfileWithGhost } from './dialecta-profile-data.js';
import { HandleSetupGate } from './dialecta-handle-setup.jsx';

// ── Universal Settings Drawer ────────────────────────────────────────────
// Listens at the document level for clicks on any [data-settings-link]
// element. Previously, the mobile drawer's Settings link navigated to
// /profile/?settings=open and the React tree had to remount before the
// drawer could open — a visible "page reload then drawer" flash.
//
// Now the drawer is wired into the sitewide shell. Clicking Settings from
// any page opens it in place. The legacy ?settings=open URL still works
// for backwards compatibility (handled in dialecta-profile-mount.jsx) but
// no longer requires a navigation.
//
// Visitor case: if no member UUID is present, the click handler does
// nothing and the link's default href takes the visitor to /profile/
// where the sign-in nudge renders.

function closeNavDrawer() {
  const drawer = document.getElementById('nav-drawer');
  const scrim  = document.querySelector('.nav-drawer-scrim');
  const toggle = document.querySelector('.nav-drawer-toggle');
  if (drawer)  { drawer.classList.remove('open');  drawer.setAttribute('aria-hidden', 'true'); }
  if (scrim)   { scrim.classList.remove('open');   scrim.setAttribute('aria-hidden', 'true'); }
  if (toggle)  { toggle.classList.remove('open');  toggle.setAttribute('aria-expanded', 'false'); }
  document.documentElement.classList.remove('drawer-open');
}

function UniversalSettingsBody({ memberUuid, memberEmail, onClose }) {
  const { data, loading, error, reload } = useProfileData(memberUuid, null);
  const [editing, setEditing] = useState(false);

  if (loading) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(28,24,20,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, fontFamily: "'DM Mono', monospace", fontSize: 11,
        letterSpacing: '0.12em', textTransform: 'uppercase', color: '#fffdf8',
      }}>Loading settings...</div>
    );
  }
  if (error || !data) return null;

  const ghostStub = {
    id:           memberUuid,
    name:         data.display_name || '',
    email:        memberEmail || '',
    avatar_image: data.avatar_url   || '',
    created_at:   '',
    is_author:    !!data.is_author,
  };
  const user = mergeProfileWithGhost(data, ghostStub, true);

  return (
    <>
      <SettingsDrawer
        user={user}
        memberUuid={memberUuid}
        memberEmail={memberEmail || ''}
        onClose={onClose}
        onEditProfile={() => setEditing(true)}
        onOpenArchetype={() => {
          onClose();
          // Archetype selector lives inside the profile page; route there.
          window.location.href = '/profile/?archetype=open';
        }}
      />
      {editing && (
        <EditProfilePanel
          ghostMemberId={memberUuid}
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

function UniversalSettings() {
  const [open, setOpen] = useState(false);
  const memberUuid  = (typeof window !== 'undefined' && window.__DIALECTA_MEMBER_UUID__)  || null;
  const memberEmail = (typeof window !== 'undefined' && window.__DIALECTA_MEMBER_EMAIL__) || '';

  useEffect(() => {
    function onClick(e) {
      const link = e.target && e.target.closest && e.target.closest('[data-settings-link]');
      if (!link) return;
      if (!memberUuid) return; // visitor — let the link navigate
      e.preventDefault();
      closeNavDrawer();
      // Prefer the on-page opener when it's defined (set by home-page-mount
      // when a profile is mounted on the current page). That route reuses
      // already-loaded profile state and avoids a second fetch. Fall back
      // to the universal in-shell drawer on every other template.
      if (typeof window.__dialectaOpenSettings === 'function') {
        window.__dialectaOpenSettings();
      } else {
        setOpen(true);
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [memberUuid]);

  if (!open || !memberUuid) return null;
  return (
    <UniversalSettingsBody
      memberUuid={memberUuid}
      memberEmail={memberEmail}
      onClose={() => setOpen(false)}
    />
  );
}

// ── Mount ────────────────────────────────────────────────────────────────

function mountAll() {
  // Sign-up invite (guest-only modal). The wrapper bails when
  // data-is-member="true".
  const inviteRoot = document.getElementById('dialecta-signup-invite-root');
  if (inviteRoot) {
    const isMember = inviteRoot.dataset.isMember === 'true';
    createRoot(inviteRoot).render(<SignupInvite isMember={isMember} />);
  }

  // Notifications bell (header). Mounts only when the member is signed in
  // (data-member-uuid set on the bell host).
  document.querySelectorAll('[data-dialecta-bell]').forEach((el) => {
    const memberUuid = el.dataset.memberUuid || '';
    if (memberUuid) {
      createRoot(el).render(<BellWithDrawer memberUuid={memberUuid} />);
    }
  });

  // Sitewide rail sidebar. The component decides what to render based on
  // route + data-* attributes (post-context vs static page). Mobile
  // renders nothing (component returns null below the lg breakpoint).
  const sidebarRoot = document.getElementById('dialecta-sidebar');
  if (sidebarRoot) {
    const articleId      = sidebarRoot.dataset.postId       || '';
    const articleSlug    = sidebarRoot.dataset.postSlug     || '';
    const authorMemberId = sidebarRoot.dataset.authorId     || '';
    const authorName     = sidebarRoot.dataset.authorName   || '';
    const primaryTagSlug = (sidebarRoot.dataset.primaryTagSlug || '').replace(/-\d+$/, '');
    const primaryTagName = sidebarRoot.dataset.primaryTagName || '';
    let articleClaims = null;
    try {
      const raw = sidebarRoot.dataset.articleClaims;
      if (raw && raw.trim()) articleClaims = JSON.parse(raw);
    } catch { /* quiet */ }

    createRoot(sidebarRoot).render(
      <DialectaSidebar
        articleId={articleId}
        articleSlug={articleSlug}
        authorMemberId={authorMemberId}
        authorName={authorName}
        primaryTagSlug={primaryTagSlug}
        primaryTagName={primaryTagName}
        articleClaims={articleClaims}
      />
    );
  }

  // Universal Settings drawer. Synthesize a host element so the drawer
  // can render anywhere in the body without needing a Handlebars-side
  // mount div on every template.
  const settingsHost = document.createElement('div');
  settingsHost.id = 'dialecta-universal-settings-host';
  document.body.appendChild(settingsHost);
  createRoot(settingsHost).render(<UniversalSettings />);

  // Forced handle setup. Synthesize a host so the modal can block all
  // interaction across templates without per-template mount changes.
  // The gate decides whether to render the modal based on the member's
  // handle_set_by_user flag; renders nothing for guests or already-
  // confirmed members.
  const handleSetupHost = document.createElement('div');
  handleSetupHost.id = 'dialecta-handle-setup-host';
  document.body.appendChild(handleSetupHost);
  createRoot(handleSetupHost).render(<HandleSetupGate />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
