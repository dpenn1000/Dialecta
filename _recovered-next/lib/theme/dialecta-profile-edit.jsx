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
 *         handle:       user.handleSlug ?? '',
 *         bio:          user.bio,
 *         avatar_url:   user.avatarUrl  ?? '',
 *         location:     user.location   ?? '',
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

import React, { useState, useRef, useEffect } from 'react';
import { updateProfile } from './dialecta-profile-data.js';

// ─── Upload helper ────────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

const AVATAR_MAX_BYTES    = 3 * 1024 * 1024;
const AVATAR_MIME_ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function uploadAvatar(file, ghostMemberId) {
  if (!AVATAR_MIME_ALLOWED.has(file.type)) {
    throw new Error('Only JPEG, PNG, or WebP images are accepted.');
  }
  if (file.size > AVATAR_MAX_BYTES) {
    throw new Error('Image is larger than 3 MB. Please pick a smaller file.');
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the selected file.'));
    r.readAsDataURL(file);
  });
  const base64 = String(dataUrl).split(',')[1] || '';
  const res = await fetch(`${apiBase()}/api/article/upload-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename:    file.name,
      mime_type:   file.type,
      data:        base64,
      member_uuid: ghostMemberId,
      purpose:     'avatar',          // skips the is_author gate
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Upload failed: ${res.status}`);
  }
  const json = await res.json();
  if (!json?.url) throw new Error('Upload returned no URL.');
  return json.url;
}

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

function Field({ label, name, value, onChange, multiline, placeholder, hint, maxLength, hintColor }) {
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

  // Character counter for fields with maxLength. Color shifts as the
  // user approaches the limit so the constraint feels live, not a
  // surprise at submit time. Brass-warm at >=85%, brass-deep at full.
  const showCounter = typeof maxLength === 'number' && maxLength > 0;
  const len = (value || '').length;
  const pct = showCounter ? len / maxLength : 0;
  const counterColor = pct >= 1 ? '#7a4a10'
    : pct >= 0.85 ? T.amber
    : T.textTertiary;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 6,
      }}>
        <label style={{
          display: 'block',
          fontFamily: T.fontMono,
          fontSize: 9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: T.amber,
        }}>
          {label}
        </label>
        {showCounter && (
          <span style={{
            fontFamily: T.fontMono,
            fontSize: 10,
            letterSpacing: '0.04em',
            color: counterColor,
            transition: 'color 0.18s',
          }}>
            {len} / {maxLength}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          maxLength={maxLength}
          style={baseStyle}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          style={baseStyle}
        />
      )}
      {hint && (
        <p style={{
          fontFamily: T.fontReading,
          fontSize: 11,
          fontStyle: 'italic',
          color: hintColor || T.textTertiary,
          marginTop: 4,
          lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Handle field (with debounced availability check) ─────────────────────

export const HANDLE_REGEX = /^[a-z0-9]([a-z0-9]|[_-][a-z0-9])*$/;

const HANDLE_REASON_MESSAGES = {
  too_short:      '5 character minimum.',
  too_long:       '24 character maximum.',
  invalid_format: 'Lowercase letters, numbers, and a single - or _ between alphanumerics only.',
  reserved:       'This handle is reserved.',
  taken:          'Already taken.',
  cooldown:       'Recently used. Try another for now.',
};

export function HandleField({ value, onChange, currentHandle, ghostMemberId }) {
  const [status, setStatus] = useState('idle');
  const [reasons, setReasons] = useState([]);

  useEffect(() => {
    const normalized = (value || '').toLowerCase().trim();

    // Same as current handle: nothing to validate.
    if (normalized === (currentHandle || '').toLowerCase()) {
      setStatus('idle');
      setReasons([]);
      return;
    }

    // Empty: idle (don't yell at the user as they delete to retype).
    if (normalized.length === 0) {
      setStatus('idle');
      setReasons([]);
      return;
    }

    // Local format checks first; no API call needed for these.
    const localReasons = [];
    if (normalized.length < 5) localReasons.push('too_short');
    if (normalized.length > 24) localReasons.push('too_long');
    if (!HANDLE_REGEX.test(normalized)) localReasons.push('invalid_format');
    if (localReasons.length > 0) {
      setStatus('invalid');
      setReasons(localReasons);
      return;
    }

    // Format passed. Hit the API after a short debounce.
    setStatus('checking');
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const url = apiBase()
          + '/api/profile/_check_handle?handle=' + encodeURIComponent(normalized)
          + (ghostMemberId ? '&exclude=' + encodeURIComponent(ghostMemberId) : '');
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error('Network error');
        const json = await res.json();
        if (json.available) {
          setStatus('available');
          setReasons([]);
        } else {
          setStatus('unavailable');
          setReasons(json.reasons || []);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        // Network glitch: fall back to idle so the save flow can still
        // try. The DB trigger is the authoritative gate.
        setStatus('idle');
        setReasons([]);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, currentHandle, ghostMemberId]);

  let hint = '5-24 lowercase chars; letters, numbers, and a single - or _ between them.';
  let hintColor;
  if (status === 'checking') {
    hint = 'Checking availability...';
  } else if (status === 'available') {
    hint = 'Available.';
    hintColor = '#3aa564';
  } else if (status === 'invalid' || status === 'unavailable') {
    hint = HANDLE_REASON_MESSAGES[reasons[0]] || 'Not available.';
    hintColor = '#b8372e';
  }

  return (
    <Field
      label="Handle"
      name="handle"
      value={value}
      onChange={onChange}
      placeholder="your-handle"
      hint={hint}
      hintColor={hintColor}
      maxLength={24}
    />
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
 * @param {{ display_name: string, handle: string, bio: string, avatar_url: string, location: string }} props.initial
 * @param {(updatedProfile: object) => void} props.onSave
 * @param {() => void} props.onCancel
 * @param {string} [props.initials]  — fallback for avatar preview
 */
export function EditProfilePanel({ ghostMemberId, initial, onSave, onCancel, initials = 'DP' }) {
  const [fields, setFields] = useState({
    display_name: initial.display_name ?? '',
    handle:       initial.handle       ?? '',
    bio:          initial.bio          ?? '',
    avatar_url:   initial.avatar_url   ?? '',
    location:     initial.location     ?? '',
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState(null);
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
  }

  async function handleFile(file) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadAvatar(file, ghostMemberId);
      setFields(prev => ({ ...prev, avatar_url: url }));
    } catch (err) {
      setUploadError(err.message ?? 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      // Build payload. Drop handle if blank, fails local format check, or
      // unchanged from initial. This keeps an inadvertent save from
      // flipping handle_set_by_user when the user's only intention was a
      // bio edit and they never touched the handle field.
      const payload = { ...fields };
      const handleNorm = (fields.handle || '').toLowerCase().trim();
      const initialNorm = (initial.handle || '').toLowerCase();
      const handleValid = handleNorm.length >= 5 && handleNorm.length <= 24
        && HANDLE_REGEX.test(handleNorm);
      if (!handleValid || handleNorm === initialNorm) {
        delete payload.handle;
      } else {
        payload.handle = handleNorm;
      }

      const result = await updateProfile(ghostMemberId, payload);
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

        {/* Avatar preview + upload + URL input */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
          <AvatarPreview url={fields.avatar_url} initials={initials} />
          <div style={{ flex: 1 }}>
            {/* Upload-from-device control. The hidden input is triggered by
                the visible button so we can style it freely. The input is
                reset (ref.value = '') after each upload so re-selecting
                the same file fires onChange again. */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => !uploading && fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', marginBottom: 10,
                background: uploading ? T.borderLight : T.bgWhite,
                border: `1px solid ${T.borderLight}`, borderRadius: 4,
                fontFamily: T.fontMono, fontSize: 10,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                color: T.textPrimary,
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}>
              {uploading ? 'Uploading…' : 'Upload from device'}
            </button>
            {uploadError && (
              <p style={{
                fontFamily: T.fontBody, fontSize: 11, color: '#b8372e',
                margin: '0 0 10px',
              }}>
                {uploadError}
              </p>
            )}
            <Field
              label="Or paste an image URL"
              name="avatar_url"
              value={fields.avatar_url}
              onChange={handleChange}
              placeholder="https://..."
              hint="JPEG, PNG, or WebP up to 3 MB. Square images work best."
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

        <HandleField
          value={fields.handle}
          onChange={handleChange}
          currentHandle={initial.handle}
          ghostMemberId={ghostMemberId}
        />

        <Field
          label="Bio"
          name="bio"
          value={fields.bio}
          onChange={handleChange}
          multiline
          maxLength={280}
          placeholder="A short description of who you are and what you think about."
          hint="Shown on your profile below your name. Plain text only. 280 characters max — keep it tight."
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
