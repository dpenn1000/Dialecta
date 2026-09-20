/**
 * dialecta-signup-invite.jsx
 *
 * Brass+paper sign-up invitation modal for unregistered visitors.
 *
 * Trigger logic (v1):
 *   - Auto-show 45s after first page load if not dismissed in the last
 *     24 hours (localStorage-backed suppression).
 *   - Always show on logo click (delegated to a global click handler so we
 *     intercept the link before navigation; explicit user gesture beats
 *     the suppression window).
 *   - Imperative window.__dialectaShowSignupInvite() also opens it; useful
 *     for any future entry points (e.g. a "Why join?" link in the under-
 *     construction banner).
 *
 * Mount: only renders for guests. The mount div in default.hbs carries
 * data-is-member="true|false"; the wrapper bails immediately when true.
 *
 * Style notes:
 *   - Cream paper inside wood-edge frame, brass accents, Cormorant italic
 *     display heading. Matches the editorial register of the rest of the
 *     site.
 *   - Backdrop blurs and dims; click closes (counts as dismiss).
 *   - Escape closes (counts as dismiss).
 *   - "Not yet" link suppresses for 24 hours.
 *   - "Join Dialecta" + "Sign in" use Ghost Portal hash routes.
 *
 * Tuning knobs (surface in the future tuning engine):
 *   - AUTO_SHOW_DELAY_MS: 45000 (time on page before auto-show)
 *   - SUPPRESS_HOURS:     24    (dismiss cooldown)
 */

import React, { useState, useEffect } from 'react';

const AUTO_SHOW_DELAY_MS = 45000;
const SUPPRESS_HOURS = 24;
const SUPPRESS_KEY = 'dialecta-signup-invite-dismissed-at';

const T = {
  bgPrimary:    '#f7f2e8',
  bgWhite:      '#ffffff',
  bgSecondary:  '#efe8da',
  textPrimary:  '#1c1814',
  textBody:     '#3a342c',
  textSecondary:'#5a5248',
  textTertiary: '#7a7068',
  borderLight:  '#e8e0d0',
  borderMedium: '#d8ceb8',
  amber:        '#b8862e',
  goldPale:     '#f5e8d0',
  fontDisplay:  "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:     "'DM Sans', system-ui, sans-serif",
  fontReading:  "'Source Serif 4', Georgia, serif",
  fontMono:     "'DM Mono', 'Courier New', monospace",
};

function isSuppressed() {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    const raw = window.localStorage.getItem(SUPPRESS_KEY);
    if (!raw) return false;
    const at = parseInt(raw, 10);
    if (Number.isNaN(at)) return false;
    const ageMs = Date.now() - at;
    return ageMs < SUPPRESS_HOURS * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markDismissed() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SUPPRESS_KEY, String(Date.now()));
  } catch { /* private mode etc */ }
}

function Modal({ onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') handleDismiss();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDismiss() {
    markDismissed();
    setVisible(false);
    setTimeout(onClose, 200);
  }

  return (
    <>
      <style>{`
        @keyframes invite-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes invite-card-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={handleDismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(28,24,20,0.55)',
          backdropFilter: 'blur(4px)',
          animation: 'invite-backdrop-in 0.22s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}>
        <div
          onClick={(e) => e.stopPropagation()}
          className="dialecta-paper dialecta-wood-frame"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 480,
            padding: 'clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px) clamp(24px, 4vw, 32px)',
            background: T.bgPrimary,
            border: `1px solid ${T.borderMedium}`,
            borderRadius: 8,
            boxShadow: '0 24px 60px rgba(28,24,20,0.32), 0 0 0 1px rgba(184,134,46,0.18)',
            animation: 'invite-card-in 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          }}>

          {/* Close X */}
          <button
            onClick={handleDismiss}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 12, right: 14,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              color: T.textTertiary,
              fontSize: 22,
              lineHeight: 1,
            }}>×</button>

          {/* Asterism mark */}
          <div style={{
            textAlign: 'center',
            fontSize: 20,
            color: T.amber,
            letterSpacing: '0.4em',
            marginBottom: 14,
          }}>⁂</div>

          {/* Headline */}
          <h2 style={{
            margin: '0 0 8px',
            textAlign: 'center',
            fontFamily: T.fontDisplay,
            fontStyle: 'italic',
            fontWeight: 500,
            fontSize: 'clamp(26px, 3vw + 14px, 34px)',
            color: T.textPrimary,
            lineHeight: 1.15,
            letterSpacing: '0.01em',
          }}>
            An invitation to stay
          </h2>

          {/* Subhead */}
          <p style={{
            margin: '0 auto 24px',
            maxWidth: 360,
            textAlign: 'center',
            fontFamily: T.fontReading,
            fontSize: 14,
            lineHeight: 1.6,
            color: T.textSecondary,
            fontStyle: 'italic',
          }}>
            Dialecta is for people who'd rather be clear than be loud. Everything here is designed to reward how you actually think.
          </p>

          {/* Benefits */}
          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {[
              'Build a fingerprint that reflects how you reason',
              'Comment in a system that values depth, not identity',
              'Find contributors who change their minds in public',
            ].map((line, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12,
                padding: '8px 12px',
                background: T.bgSecondary,
                borderLeft: `2px solid ${T.amber}`,
                borderRadius: '0 4px 4px 0',
              }}>
                <span style={{
                  color: T.amber,
                  fontFamily: T.fontDisplay,
                  fontSize: 16,
                  fontStyle: 'italic',
                  flexShrink: 0,
                  lineHeight: 1,
                }}>✦</span>
                <span style={{
                  fontFamily: T.fontReading,
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: T.textBody,
                }}>{line}</span>
              </li>
            ))}
          </ul>

          {/* Primary CTA */}
          <a
            href="#/portal/signup"
            data-portal="signup"
            onClick={handleDismiss}
            style={{
              display: 'block',
              width: '100%',
              padding: '12px 22px',
              background: T.textPrimary,
              color: T.bgPrimary,
              border: 'none',
              borderRadius: 4,
              fontFamily: T.fontDisplay,
              fontStyle: 'italic',
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: '0.02em',
              textAlign: 'center',
              textDecoration: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(28,24,20,0.18)',
            }}>
            Join Dialecta
          </a>

          {/* Secondary actions */}
          <div style={{
            marginTop: 14,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            fontFamily: T.fontMono,
            fontSize: 10,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: T.textTertiary,
          }}>
            <a
              href="#/portal/signin"
              data-portal="signin"
              onClick={handleDismiss}
              style={{
                color: T.amber,
                textDecoration: 'none',
              }}>
              Already a member? Sign in
            </a>
            <button
              onClick={handleDismiss}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                letterSpacing: 'inherit',
                textTransform: 'inherit',
                color: T.textTertiary,
                padding: '4px 0',
              }}>
              Not yet
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function SignupInvite({ isMember }) {
  const [open, setOpen] = useState(false);

  // Bail entirely for signed-in members. The component still mounts
  // (cheap), but it never shows UI or attaches listeners.
  useEffect(() => {
    if (isMember) return;

    // Auto-show after AUTO_SHOW_DELAY_MS unless suppressed.
    let timerId = null;
    if (!isSuppressed()) {
      timerId = window.setTimeout(() => setOpen(true), AUTO_SHOW_DELAY_MS);
    }

    // Logo click interception. Delegated handler on document so we don't
    // depend on the logo element existing at mount time. Matches the
    // anchor inside .nav-logo-inner (the brand link in default.hbs).
    function handleLogoClick(e) {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const link = target.closest('.nav-logo-inner > a');
      if (!link) return;
      e.preventDefault();
      setOpen(true);
    }
    document.addEventListener('click', handleLogoClick, true);

    // Imperative entry point for any future "Why join?" affordances.
    window.__dialectaShowSignupInvite = () => setOpen(true);

    return () => {
      if (timerId) window.clearTimeout(timerId);
      document.removeEventListener('click', handleLogoClick, true);
      try { delete window.__dialectaShowSignupInvite; } catch {/* readonly env */}
    };
  }, [isMember]);

  if (isMember) return null;
  if (!open) return null;
  return <Modal onClose={() => setOpen(false)} />;
}
