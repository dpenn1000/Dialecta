/**
 * dialecta-profile-edit.jsx
 *
 * EditProfilePanel — inline edit mode for name, bio, avatar URL, and location.
 * Designed to overlay the profile header in the same design language as the
 * existing profile component (v1.3 tokens, DM Sans, Source Serif 4, amber).
 *
 * Usage:
 *   import { EditProfilePanel } from './dialecta-profile-edit.jsx';
 *
 *   // Inside the profile component, add the button + panel:
 *   const [editing, setEditing] = useState(false);
 *   ...
 *   {editing && (
 *     <EditProfilePanel
 *       ghostMemberId={user.ghostMemberId}
 *       initial={{
 *         display_name: user.name,
 *         bio:          user.bio,
 *         avatar_url:   user.avatarUrl ?? '',
 *         location:     user.location  ?? '',
 *       }}
 *       onSave={(updated) => {
 *         // updated is the profiles row returned by the PATCH endpoint
 *         setEditing(false);
 *         onSave?.(); // triggers useProfileData reload in the parent
 *       }}
 *       onCancel={() => setEditing(false)}
 *     />
 *   )}
 *
 * Where to add the "Edit Profile" button in dialecta-profile.jsx:
 * In the header zone, next to the handle / joined line, add:
 *
 *   {isOwnProfile && (
 *     <button
 *       onClick={() => setEditing(true)}
 *       style={{
 *         background: 'transparent',
 *         border: `1px solid ${T.borderLight}`,
 *         borderRadius: 4,
 *         padding: '5px 14px',
 *         fontFamily: T.fontMono,
 *         fontSize: 9,
 *         letterSpacing: '0.10em',
 *         textTransform: 'uppercase',
 *         color: T.textTertiary,
 *         cursor: 'pointer',
 *       }}>
 *       Edit Profile
 *     </button>
 *   )}
 */

import React, { useState } from 'react';
import { updateProfile } from './dialecta-profile-data.js';

// ─── Design tokens (mirrors v1.3 spec) ───────────────────────────────────

const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', 'Georgia', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",

  bgPrimary:   '#f7f2e8',
  bgWhite:     '#ffffff',
  bgOverlay:   'rgba(28, 24, 20, 0.55)',

  textPrimary:   '#2c2620',
  textBody:      '#454547',
  textTertiary:  '#8c8780',
  borderLight:   '#e0dbd2',

  amber: '#b8862e',
  amberLight: '#d4a84a',
};

// ─── Field component ──────────────────────────────────────────────────────

function Field({ label, name, value, onChange, multiline, placeholder, hint }) {
  const baseStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: T.bgWhite,
    border: `1px solid ${T.borderLight}`,
    borderRadius: 6,
    padding: '9px 12px',
    fontFamily: T.fontBody,
    fontSize: 13,
    color: T.textBody,
    outline: 'none',
    resize: multiline ? 'vertical' : 'none',
    lineHeight: 1.5,
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block',
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: T.amber,
        marginBottom: 6,
      }}>
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          style={baseStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={baseStyle}
        />
      )}
      {hint && (
        <p style={{
          fontFamily: T.fontReading,
          fontSize: 11,
          fontStyle: 'italic',
          color: T.textTertiary,
          marginTop: 4,
          lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Avatar preview ───────────────────────────────────────────────────────

function AvatarPreview({ url, initials }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      overflow: 'hidden',
      border: `2px solid ${T.borderLight}`,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: T.bgWhite,
      fontFamily: T.fontDisplay,
      fontSize: 26,
      fontWeight: 500,
      color: T.amber,
    }}>
      {url && !imgError ? (
        <img
          src={url}
          alt="Avatar preview"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initials
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

/**
 * @param {object} props
 * @param {string} props.ghostMemberId
 * @param {{ display_name: string, bio: string, avatar_url: string, location: string }} props.initial
 * @param {(updatedProfile: object) => void} props.onSave
 * @param {() => void} props.onCancel
 * @param {string} [props.initials]  — fallback for avatar preview
 */
export function EditProfilePanel({ ghostMemberId, initial, onSave, onCancel, initials = 'DP' }) {
  const [fields, setFields] = useState({
    display_name: initial.display_name ?? '',
    bio:          initial.bio          ?? '',
    avatar_url:   initial.avatar_url   ?? '',
    location:     initial.location     ?? '',
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const result = await updateProfile(ghostMemberId, fields);
      onSave(result.profile);
    } catch (err) {
      setSaveError(err.message ?? 'Save failed. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    // Overlay
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: T.bgOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {/* Panel */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: T.bgPrimary,
          borderRadius: 12,
          padding: '32px 36px',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(28,24,20,0.22)',
        }}>
        {/* Header */}
        <div style={{
          fontFamily: T.fontDisplay,
          fontSize: 22,
          fontWeight: 500,
          color: T.textPrimary,
          marginBottom: 6,
        }}>
          Edit Profile
        </div>
        <p style={{
          fontFamily: T.fontReading,
          fontSize: 12,
          fontStyle: 'italic',
          color: T.textTertiary,
          marginBottom: 28,
          lineHeight: 1.6,
        }}>
          Changes apply to your Dialecta profile. Your Ghost account name remains separate.
        </p>

        {/* Avatar preview + URL input */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
          <AvatarPreview url={fields.avatar_url} initials={initials} />
          <div style={{ flex: 1 }}>
            <Field
              label="Avatar URL"
              name="avatar_url"
              value={fields.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
              hint="Link to a public image. Square images work best."
            />
          </div>
        </div>

        <Field
          label="Display Name"
          name="display_name"
          value={fields.display_name}
          onChange={handleChange}
          placeholder="Your name as shown on Dialecta"
        />

        <Field
          label="Bio"
          name="bio"
          value={fields.bio}
          onChange={handleChange}
          multiline
          placeholder="A short description of who you are and what you think about."
          hint="Shown on your profile below your name. Plain text only."
        />

        <Field
          label="Location"
          name="location"
          value={fields.location}
          onChange={handleChange}
          placeholder="City, Country — or wherever you call home"
        />

        {/* Error state */}
        {saveError && (
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 12,
            color: '#b8372e',
            marginBottom: 16,
          }}>
            {saveError}
          </p>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          marginTop: 8,
        }}>
          <button
            onClick={onCancel}
            disabled={saving}
            style={{
              background: 'transparent',
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
              padding: '9px 20px',
              fontFamily: T.fontMono,
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: T.textTertiary,
              cursor: 'pointer',
            }}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: saving ? T.textTertiary : T.textPrimary,
              border: 'none',
              borderRadius: 4,
              padding: '9px 24px',
              fontFamily: T.fontDisplay,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: '0.03em',
              color: T.bgPrimary,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
