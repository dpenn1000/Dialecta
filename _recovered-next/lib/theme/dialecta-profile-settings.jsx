/**
 * dialecta-profile-settings.jsx
 *
 * SettingsDrawer — slides in from the right when the contributor clicks
 * their own name on their profile page. Contains:
 *   - Edit Profile (name, bio, avatar, location)
 *   - Display preferences (placeholder for future)
 *   - Account section (placeholder for future)
 *
 * The drawer sits outside the normal document flow (fixed position) so it
 * works regardless of scroll position. Clicking the backdrop closes it.
 *
 * Usage in dialecta-profile.jsx:
 *
 *   import { SettingsDrawer } from './dialecta-profile-settings.jsx';
 *   import { EditProfilePanel } from './dialecta-profile-edit.jsx';
 *
 *   // 1. Add state at the top of DialectaProfile:
 *   const [showSettings, setShowSettings] = useState(false);
 *   const [editing, setEditing] = useState(false);
 *
 *   // 2. Wrap the contributor name in a button:
 *   <button onClick={() => setShowSettings(true)} style={nameButtonStyle}>
 *     {u.name}
 *   </button>
 *
 *   // 3. Render the drawer + edit panel at the bottom of the return:
 *   {showSettings && (
 *     <SettingsDrawer
 *       user={u}
 *       onEditProfile={() => { setShowSettings(false); setEditing(true); }}
 *       onClose={() => setShowSettings(false)}
 *     />
 *   )}
 *   {editing && (
 *     <EditProfilePanel
 *       ghostMemberId={u.ghostMemberId}
 *       initial={{ display_name: u.name, bio: u.bio ?? '', avatar_url: u.avatarUrl ?? '', location: u.location ?? '' }}
 *       initials={u.initials}
 *       onSave={() => setEditing(false)}
 *       onCancel={() => setEditing(false)}
 *     />
 *   )}
 */

import React, { useState, useEffect } from 'react';
import NotificationsSettingsPanel from './dialecta-notifications-settings.jsx';

const T = {
  bgPrimary:   '#f7f2e8',
  bgWhite:     '#ffffff',
  bgSecondary: '#efe8da',
  bgDark:      '#1c1814',
  textPrimary: '#1c1814',
  textBody:    '#3a342c',
  textSecondary:'#5a5248',
  textTertiary:'#7a7068',
  borderLight: '#e8e0d0',
  borderMedium:'#d8ceb8',
  amber:       '#b8862e',
  gold:        '#d4a84a',
  goldPale:    '#f5e8d0',
  fontDisplay: "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
};

// ─── Section header inside the drawer ────────────────────────────────────

function DrawerSection({ label, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.amber,
        paddingBottom: 8, marginBottom: 12,
        borderBottom: `1px solid ${T.borderLight}`,
        fontWeight: 500,
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Clickable row inside the drawer ─────────────────────────────────────

function DrawerRow({ icon, label, sublabel, onClick, disabled, chevron = true }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        width: '100%', padding: '11px 14px',
        background: hovered && !disabled ? T.bgSecondary : 'transparent',
        border: 'none', borderRadius: 6,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textAlign: 'left',
        transition: 'background 0.12s',
      }}>
      <span style={{
        width: 32, height: 32, borderRadius: 6,
        background: T.bgSecondary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
        border: `1px solid ${T.borderLight}`,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
          color: T.textPrimary, lineHeight: 1.2,
        }}>{label}</div>
        {sublabel && (
          <div style={{
            fontFamily: T.fontReading, fontSize: 11, fontStyle: 'italic',
            color: T.textTertiary, marginTop: 2, lineHeight: 1.4,
          }}>{sublabel}</div>
        )}
      </div>
      {chevron && !disabled && (
        <span style={{ color: T.textTertiary, fontSize: 16 }}>›</span>
      )}
      {disabled && (
        <span style={{
          fontFamily: T.fontMono, fontSize: 8, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: T.textTertiary,
          border: `1px solid ${T.borderLight}`, borderRadius: 3,
          padding: '2px 6px',
        }}>Soon</span>
      )}
    </button>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {object} props.user         — the merged USER shape
 * @param {() => void} props.onEditProfile — opens the edit panel
 * @param {() => void} props.onClose  — closes the drawer
 */
export function SettingsDrawer({ user, memberUuid, memberEmail, onEditProfile, onOpenArchetype, onClose }) {
  // Animate in
  const [visible, setVisible] = useState(false);
  // Subview routing: 'root' shows the main settings list; 'notifications'
  // shows the notifications matrix inline. Keeping it inside the drawer
  // (vs. opening a second drawer over the top) avoids stacked surfaces and
  // keeps the back affordance contained.
  const [view, setView] = useState('root');
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 240);
  }

  return (
    <>
      <style>{`
        @keyframes drawer-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(28,24,20,0.50)',
          backdropFilter: 'blur(3px)',
          animation: 'drawer-backdrop-in 0.22s ease',
        }}
      />

      {/* Drawer panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        zIndex: 301,
        width: 360,
        background: T.bgPrimary,
        borderLeft: `1px solid ${T.borderMedium}`,
        boxShadow: '-12px 0 40px rgba(28,24,20,0.18)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: `1px solid ${T.borderLight}`,
          background: `linear-gradient(to bottom, ${T.goldPale}, ${T.bgPrimary})`,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* Avatar */}
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: `linear-gradient(135deg, #b8732a, #d4a84a)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 500,
            color: T.bgWhite, flexShrink: 0,
            boxShadow: '0 2px 8px rgba(184,115,42,0.25)',
          }}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name}
                   style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : user.initials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: '1.3rem', fontWeight: 600,
              color: T.textPrimary, lineHeight: 1.1,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user.name}
            </div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 10, color: T.textTertiary,
              letterSpacing: '0.04em', marginTop: 2,
            }}>
              {user.handle}
            </div>
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 6, borderRadius: 4,
              color: T.textTertiary, fontSize: 20, lineHeight: 1,
              flexShrink: 0,
            }}>
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 20px', flex: 1 }}>

          {view === 'notifications' ? (
            <NotificationsSettingsPanel
              memberUuid={memberUuid || user?.ghostMemberId || user?.member_id || user?.ghost_member_id || ''}
              memberEmail={memberEmail || user?.email || ''}
              onBack={() => setView('root')}
            />
          ) : view === 'signature' ? (
            <SignaturePanel
              memberUuid={memberUuid || user?.ghostMemberId || ''}
              user={user}
              onBack={() => setView('root')}
            />
          ) : (
          <>
          <DrawerSection label="Profile">
            <DrawerRow
              icon="✎"
              label="Edit Profile"
              sublabel="Name, bio, avatar, location"
              onClick={onEditProfile}
            />
            <DrawerRow
              icon="✍"
              label="Signature"
              sublabel={user.pact_signed_name
                ? 'Your hand: ' + (user.signature_font || 'Mrs Saint Delafield')
                : 'Sign the Pact to set your signature'}
              onClick={() => setView('signature')}
              disabled={!user.pact_signed_name}
            />
            <DrawerRow
              icon="◐"
              label="Aspirational Archetype"
              sublabel={user.aspirational
                ? 'Aspiring to ' + (user.aspirational.label || user.aspirational.id)
                : 'Set a growth target for your fingerprint'}
              onClick={onOpenArchetype}
            />
          </DrawerSection>

          <DrawerSection label="Preferences">
            <DrawerRow
              icon="🌙"
              label="Appearance"
              sublabel="Light, dark, or system"
              onClick={() => {}}
              disabled
            />
            <DrawerRow
              icon="🔔"
              label="Notifications"
              sublabel="In-app + opt-in email digest"
              onClick={() => setView('notifications')}
            />
          </DrawerSection>

          <DrawerSection label="Account">
            <DrawerRow
              icon="✉"
              label="Email & Subscription"
              sublabel={user.handle.replace('@', '') + ' · Member'}
              onClick={() => {
                // Ghost's member portal handles email change, password
                // reset, and subscription management. Same href the
                // desktop nav's Account link uses (default.hbs:223).
                window.location.hash = '#/portal/account';
              }}
            />
            <DrawerRow
              icon="↗"
              label="Sign Out"
              sublabel=""
              onClick={() => {
                // Member portal signout. The previous URL (/ghost/#/signout)
                // was the Ghost Admin signout — wrong scope, didn't clear
                // the member session cookie. /members/api/session DELETE is
                // the canonical member-signout endpoint; on success we
                // hard-reload to land on the signed-out / index render.
                fetch('/members/api/session', { method: 'DELETE', credentials: 'same-origin' })
                  .catch(() => {})
                  .finally(() => { window.location.href = '/'; });
              }}
              chevron={false}
            />
          </DrawerSection>
          </>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${T.borderLight}`,
          fontFamily: T.fontMono, fontSize: 9,
          color: T.textTertiary, letterSpacing: '0.1em',
          textTransform: 'uppercase', textAlign: 'center',
        }}>
          Dialecta · Ideas are the protagonist
        </div>
      </div>
    </>
  );
}

// ─── Signature panel (font picker) ─────────────────────────────────────────
//
// Lets a contributor change their signature font after the Pact. Reads the
// current font from user.signature_font (default Mrs Saint Delafield) and
// the signed name from user.pact_signed_name. PATCH /api/profile/<uuid>
// with { signature_font } to persist. The allowlist is mirrored from
// api/_signature-fonts.js — keep them in sync when adding fonts.

const SIGNATURE_FONTS = [
  'Mrs Saint Delafield',
  'Cherish',
  'Give You Glory',
  'Hurricane',
  'Love Light',
  'Nothing You Could Do',
  'Oooh Baby',
  'Qwigley',
  'WindSong',
];

// Per-font scale to keep visual heights similar across the 9 cursive
// faces. Mirror these values with the page-pact.hbs picker (CSS rules
// + SIGNATURE_FONT_SCALES JS map). 1.0 = Mrs Saint Delafield baseline.
const SIGNATURE_FONT_SCALES = {
  'Mrs Saint Delafield':  1.00,
  'Cherish':              0.85,
  'Give You Glory':       1.40,
  'Hurricane':            0.95,
  'Love Light':           1.00,
  'Nothing You Could Do': 1.10,
  'Oooh Baby':            0.78,
  'Qwigley':              1.45,
  'WindSong':             1.00,
};

function SignaturePanel({ memberUuid, user, onBack }) {
  const initialFont = user.signature_font || 'Mrs Saint Delafield';
  const [selected, setSelected] = useState(initialFont);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [savedAt, setSavedAt]   = useState(null);

  const signedName = user.pact_signed_name || user.name || 'Your name';
  const dirty = selected !== initialFont;

  const handleSave = async () => {
    if (!dirty || !memberUuid) return;
    setSaving(true);
    setError(null);
    try {
      const apiBase = (window.__DIALECTA_API_URL__ || '').replace(/\/$/, '');
      const res = await fetch(apiBase + '/api/profile/' + encodeURIComponent(memberUuid), {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ signature_font: selected }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'HTTP ' + res.status);
      }
      // Mutate the user prop in place so the drawer header + the row
      // sublabel update without a full reload. The profile page itself
      // re-renders next visit.
      if (user) user.signature_font = selected;
      setSavedAt(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Back row */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '6px 0', marginBottom: 14,
          fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: T.amber,
        }}>
        ← Back
      </button>

      <h3 style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: '1.4rem', fontWeight: 500,
        margin: '0 0 4px', color: T.textPrimary,
      }}>
        Your signature
      </h3>
      <p style={{
        fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
        color: T.textTertiary, margin: '0 0 18px', lineHeight: 1.55,
      }}>
        Pick the hand your signature wears across the platform. Shows on
        your profile and at the close of articles you author.
      </p>

      {/* Live preview. The font-size is the baseline (2.2rem) multiplied
          by the per-font scale so each face renders at a similar height. */}
      <div style={{
        padding: '20px 16px',
        background: T.bgWhite,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 6,
        textAlign: 'center',
        marginBottom: 18,
        minHeight: 84,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: '"' + selected + '", cursive',
          fontSize: `calc(2.2rem * ${SIGNATURE_FONT_SCALES[selected] || 1})`,
          color: '#7a4a14',
          lineHeight: 1.1,
          letterSpacing: '0.01em',
        }}>
          {signedName}
        </span>
      </div>

      {/* Font chips. Each chip's font-size is normalized via the same
          per-font scale so the picker reads as a balanced row. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
        {SIGNATURE_FONTS.map((font) => {
          const active = font === selected;
          const scale  = SIGNATURE_FONT_SCALES[font] || 1;
          return (
            <button
              key={font}
              type="button"
              onClick={() => setSelected(font)}
              style={{
                fontFamily: '"' + font + '", cursive',
                fontSize: `calc(1.05rem * ${scale})`,
                lineHeight: 1,
                padding: '8px 14px',
                border: active
                  ? `1px solid ${T.gold}`
                  : `1px solid ${T.borderLight}`,
                background: active ? T.goldPale : T.bgWhite,
                color: active ? '#6a4a18' : 'rgba(60,44,28,0.78)',
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}>
              {signedName.length > 18 ? signedName.slice(0, 18) + '…' : signedName}
            </button>
          );
        })}
      </div>

      {/* Save row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          style={{
            fontFamily: T.fontMono, fontSize: 11, letterSpacing: '0.12em',
            textTransform: 'uppercase', fontWeight: 600,
            color: '#fcf6e8',
            background: dirty
              ? 'linear-gradient(95deg, #d4a84a 0%, #ecb438 22%, #f5dfa0 50%, #ecb438 78%, #d4a84a 100%)'
              : T.bgSecondary,
            border: `1px solid ${dirty ? '#7a4a14' : T.borderMedium}`,
            borderRadius: 4,
            padding: '10px 22px',
            cursor: dirty && !saving ? 'pointer' : 'not-allowed',
            opacity: dirty && !saving ? 1 : 0.55,
            textShadow: dirty ? '0 1px 0 rgba(120,80,30,0.30)' : 'none',
          }}>
          {saving ? 'Saving…' : 'Save signature'}
        </button>
        {savedAt && !dirty && (
          <span style={{
            fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.10em',
            color: '#1f6a3a', textTransform: 'uppercase',
          }}>
            ✓ Saved
          </span>
        )}
        {error && (
          <span style={{
            fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
            color: '#8c2a14',
          }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
