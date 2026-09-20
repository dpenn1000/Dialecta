/**
 * dialecta-handle-setup.jsx
 *
 * Forced handle confirmation modal. Mounts sitewide via shell.jsx and
 * blocks all interaction with the page until the signed-in member has a
 * user-confirmed handle (profiles.handle_set_by_user = true).
 *
 * Triggered when:
 *   - Member is signed in (window.__DIALECTA_MEMBER_UUID__ set)
 *   - Their profile row's handle_set_by_user is false
 *
 * Once confirmed, sessionStorage caches the result so we don't refetch
 * on every page navigation within the session. The "next-login" pattern
 * works because sessionStorage is per-browser-session.
 *
 * Failure modes are deliberately permissive: if the gate's fetch fails
 * (network glitch, API down), the modal stays hidden so the member is
 * never locked out by an infrastructure hiccup. The DB trigger remains
 * the authoritative gate against invalid handles.
 */

import React, { useState, useEffect } from 'react';

import { updateProfile } from './dialecta-profile-data.js';
import { HandleField, HANDLE_REGEX } from './dialecta-profile-edit.jsx';

// ── Helpers ──────────────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

const SESSION_KEY_PREFIX = 'dialecta_handle_confirmed_';

// ── Design tokens ────────────────────────────────────────────────────────

const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', 'Georgia', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",

  bgPaper:   '#fefcf5',
  bgOverlay: 'rgba(28, 24, 20, 0.65)',

  textPrimary:  '#2c2620',
  textBody:     '#3a342c',
  textTertiary: '#8c8780',
  borderLight:  '#e0dbd2',
  brassDeep:    '#7a4a10',
  brassMid:     '#b8862e',
  brassWarm:    '#d4a84a',
};

// ── Modal ────────────────────────────────────────────────────────────────

function HandleSetupModal({ ghostMemberId, currentHandle, onConfirm }) {
  const [value, setValue] = useState(currentHandle || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  function handleChange(e) {
    setValue(e.target.value);
  }

  const handleNorm = (value || '').toLowerCase().trim();
  const isValidLocal = handleNorm.length >= 5
    && handleNorm.length <= 24
    && HANDLE_REGEX.test(handleNorm);

  async function handleConfirm() {
    if (!isValidLocal || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Always send handle so the server flips handle_set_by_user to true,
      // even when the value is unchanged from the auto-generated default.
      const result = await updateProfile(ghostMemberId, { handle: handleNorm });
      onConfirm(result?.profile ?? result);
    } catch (err) {
      setSubmitError(err?.message ?? 'Save failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Lock background scroll while the modal is open.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: T.bgOverlay,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialecta-handle-setup-title"
        style={{
          background: T.bgPaper,
          borderRadius: 12,
          padding: '36px 40px 32px',
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 12px 48px rgba(28, 24, 20, 0.32)',
          textAlign: 'left',
        }}>
        {/* Decorative glyph */}
        <div style={{
          textAlign: 'center',
          fontFamily: T.fontDisplay,
          fontSize: 22,
          color: T.brassMid,
          marginBottom: 12,
          letterSpacing: '0.4em',
        }}>
          ⁂
        </div>

        {/* Title */}
        <h2
          id="dialecta-handle-setup-title"
          style={{
            fontFamily: T.fontDisplay,
            fontSize: 32,
            fontWeight: 500,
            fontStyle: 'italic',
            color: T.brassDeep,
            margin: '0 0 16px',
            textAlign: 'center',
            letterSpacing: '0.01em',
          }}>
          Choose your handle
        </h2>

        {/* Body */}
        <p style={{
          fontFamily: T.fontReading,
          fontSize: 14,
          fontStyle: 'italic',
          color: T.textBody,
          lineHeight: 1.65,
          margin: '0 0 24px',
          textAlign: 'center',
        }}>
          Your handle is how others find you on Dialecta. It appears in
          mentions, on your profile URL, and anywhere your contributions
          are shared.
        </p>

        {/* Field */}
        <HandleField
          value={value}
          onChange={handleChange}
          currentHandle={null}
          ghostMemberId={ghostMemberId}
        />

        {/* Soft note about future change */}
        <p style={{
          fontFamily: T.fontReading,
          fontSize: 11,
          fontStyle: 'italic',
          color: T.textTertiary,
          marginTop: 4,
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          You can change your handle later from profile settings. Old links
          redirect for a year.
        </p>

        {/* Submit error */}
        {submitError && (
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 12,
            color: '#b8372e',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            {submitError}
          </p>
        )}

        {/* Confirm */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 8,
        }}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValidLocal || submitting}
            style={{
              background: (!isValidLocal || submitting) ? T.textTertiary : T.textPrimary,
              border: 'none',
              borderRadius: 4,
              padding: '11px 36px',
              fontFamily: T.fontDisplay,
              fontSize: 16,
              fontWeight: 500,
              fontStyle: 'italic',
              letterSpacing: '0.04em',
              color: T.bgPaper,
              cursor: (!isValidLocal || submitting) ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}>
            {submitting ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Gate ─────────────────────────────────────────────────────────────────

export function HandleSetupGate() {
  const memberUuid =
    (typeof window !== 'undefined' && window.__DIALECTA_MEMBER_UUID__) || null;
  const [needsSetup, setNeedsSetup] = useState(null); // null=loading, false=no, true=yes
  const [profileSnapshot, setProfileSnapshot] = useState(null);

  useEffect(() => {
    if (!memberUuid) {
      setNeedsSetup(false);
      return;
    }

    // Per-session cache: once confirmed, don't refetch on page navs.
    try {
      const cached = sessionStorage.getItem(SESSION_KEY_PREFIX + memberUuid);
      if (cached === 'true') {
        setNeedsSetup(false);
        return;
      }
    } catch { /* storage may be unavailable; ignore */ }

    const controller = new AbortController();
    fetch(apiBase() + '/api/profile/' + encodeURIComponent(memberUuid), {
      signal: controller.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          setNeedsSetup(false);
          return;
        }
        if (data.handle_set_by_user) {
          try {
            sessionStorage.setItem(SESSION_KEY_PREFIX + memberUuid, 'true');
          } catch { /* ignore */ }
          setNeedsSetup(false);
        } else {
          setProfileSnapshot(data);
          setNeedsSetup(true);
        }
      })
      .catch((err) => {
        if (err && err.name === 'AbortError') return;
        // Fail-safe: never lock the user out on a network glitch.
        setNeedsSetup(false);
      });

    return () => controller.abort();
  }, [memberUuid]);

  if (!needsSetup || !memberUuid || !profileSnapshot) return null;

  return (
    <HandleSetupModal
      ghostMemberId={memberUuid}
      currentHandle={profileSnapshot.handle}
      onConfirm={() => {
        try {
          sessionStorage.setItem(SESSION_KEY_PREFIX + memberUuid, 'true');
        } catch { /* ignore */ }
        setNeedsSetup(false);
      }}
    />
  );
}

export default HandleSetupGate;
