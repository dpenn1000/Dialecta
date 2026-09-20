/**
 * dialecta-share.jsx
 *
 * Ambient share component. Drop wherever something is shareable:
 *
 *   <DialectaShare
 *     url={absoluteUrl}
 *     title={shareTitle}
 *     description={shareDescription}
 *     surfaceType="profile"
 *     surfaceId={user.handleSlug}
 *     memberUuid={viewerUuid}      // optional; logged-out shares allowed
 *   />
 *
 * Renders a small brass-tinted "Share" button. Clicking opens a popover
 * with six channels: copy link, X (formerly Twitter), Facebook, LinkedIn,
 * email, and (mobile only) native navigator.share. Each click POSTs to
 * /api/share/track in parallel with opening the share window so the
 * share_events log is fire-and-forget.
 *
 * Outside-click and Escape close the popover. Focus and aria-expanded
 * are wired for keyboard / screen-reader users.
 */

import React, { useEffect, useRef, useState } from 'react';

// ── Helpers ──────────────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

function trackShare({ surfaceType, surfaceId, channel, memberUuid }) {
  // Fire-and-forget. Failures shouldn't block the user from sharing.
  try {
    fetch(apiBase() + '/api/share/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        surface_type: surfaceType,
        surface_id:   surfaceId,
        channel,
        member_uuid:  memberUuid || null,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch (_) { /* swallow */ }
}

function openShareWindow(url) {
  // Centered popup-style window for the social network share dialogs.
  const w = 600;
  const h = 540;
  const left = typeof window !== 'undefined' ? Math.max(0, (window.innerWidth - w) / 2) : 0;
  const top  = typeof window !== 'undefined' ? Math.max(0, (window.innerHeight - h) / 2) : 0;
  window.open(
    url,
    'dialecta-share',
    `noopener,noreferrer,width=${w},height=${h},left=${left},top=${top}`
  );
}

// ── Design tokens ────────────────────────────────────────────────────────

const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",

  bgPaper:      '#fefcf5',
  bgPaperBright: '#fffdf8',
  bgHover:      '#f5efe2',

  textPrimary:  '#2c2620',
  textBody:     '#3a342c',
  textTertiary: '#8c8780',
  borderLight:  '#e0dbd2',
  brassDeep:    '#7a4a10',
  brassMid:     '#b8862e',
  brassPale:    '#f5dfa0',
  success:      '#3aa564',
};

// ── Icon ─────────────────────────────────────────────────────────────────

function ShareIcon({ size = 14 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Channel rows ─────────────────────────────────────────────────────────

function ChannelRow({ label, sublabel, onClick, role = 'menuitem' }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      role={role}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
        width: '100%',
        padding: '10px 14px',
        background: hover ? T.bgHover : 'transparent',
        border: 'none',
        borderRadius: 0,
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: T.fontBody,
        fontSize: 13,
        color: T.textPrimary,
        transition: 'background 0.12s',
      }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {sublabel && (
        <span style={{
          fontFamily: T.fontMono,
          fontSize: 9,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: T.textTertiary,
        }}>
          {sublabel}
        </span>
      )}
    </button>
  );
}

// ── Main component ───────────────────────────────────────────────────────

export default function DialectaShare({
  url,
  title,
  description,
  surfaceType,
  surfaceId,
  memberUuid,
  variant = 'inline',          // 'inline' (button + label) or 'icon' (icon only)
  align = 'right',             // 'right' or 'left' (popover anchor side)
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hover, setHover] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Outside-click + Escape close.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setOpen(false);
        if (buttonRef.current) buttonRef.current.focus();
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const trackProps = { surfaceType, surfaceId, memberUuid };

  function handleCopy() {
    trackShare({ ...trackProps, channel: 'link' });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url).then(
        () => {
          setCopied(true);
          setTimeout(() => {
            setCopied(false);
            setOpen(false);
          }, 1400);
        },
        () => { /* clipboard denied; leave popover open */ }
      );
    }
  }

  function handleTwitter() {
    trackShare({ ...trackProps, channel: 'x' });
    const text = title || '';
    openShareWindow(
      'https://x.com/intent/tweet?url=' + encodeURIComponent(url)
        + '&text=' + encodeURIComponent(text)
    );
    setOpen(false);
  }

  function handleFacebook() {
    trackShare({ ...trackProps, channel: 'facebook' });
    openShareWindow(
      'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url)
    );
    setOpen(false);
  }

  function handleLinkedIn() {
    trackShare({ ...trackProps, channel: 'linkedin' });
    openShareWindow(
      'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url)
    );
    setOpen(false);
  }

  function handleEmail() {
    trackShare({ ...trackProps, channel: 'email' });
    const subject = title || 'From Dialecta';
    const body = (description ? description + '\n\n' : '') + url;
    window.location.href = 'mailto:?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);
    setOpen(false);
  }

  async function handleNative() {
    trackShare({ ...trackProps, channel: 'native' });
    try {
      await navigator.share({ url, title, text: description });
    } catch (_) { /* user canceled or share failed */ }
    setOpen(false);
  }

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  // Brass-flared icon variant: round button with the canonical brass
  // gradient (deep → bright → deep), cream icon on top, polished-metal
  // inner highlight + drop shadow. Hover deepens the lift.
  const buttonStyle = variant === 'icon' ? {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    background:
      'linear-gradient(180deg, ' +
      T.brassPale + ' 0%, ' +
      '#ecb438 30%, ' +
      T.brassMid + ' 65%, ' +
      T.brassDeep + ' 100%)',
    border: '1px solid ' + T.brassDeep,
    borderRadius: '50%',
    color: '#fffefa',
    cursor: 'pointer',
    padding: 0,
    boxShadow: hover
      ? 'inset 0 1px 0 rgba(255,255,255,0.55), ' +
        'inset 0 -1px 0 rgba(0,0,0,0.28), ' +
        '0 4px 10px rgba(140,74,47,0.42), ' +
        '0 1px 0 rgba(255,255,255,0.7)'
      : 'inset 0 1px 0 rgba(255,255,255,0.45), ' +
        'inset 0 -1px 0 rgba(0,0,0,0.22), ' +
        '0 1px 4px rgba(140,74,47,0.30), ' +
        '0 1px 0 rgba(255,255,255,0.6)',
    transform: hover ? 'translateY(-1px)' : 'translateY(0)',
    transition: 'transform 140ms cubic-bezier(0.4,0,0.2,1), box-shadow 140ms cubic-bezier(0.4,0,0.2,1)',
  } : {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: 'transparent',
    border: '1px solid ' + T.borderLight,
    borderRadius: 4,
    padding: '6px 14px',
    fontFamily: T.fontMono,
    fontSize: 9,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: T.textTertiary,
    cursor: 'pointer',
    transition: 'border-color 0.15s, color 0.15s',
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Share"
        title="Share"
        style={buttonStyle}>
        <ShareIcon size={variant === 'icon' ? 16 : 12} />
        {variant !== 'icon' && <span>Share</span>}
      </button>

      {open && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            [align]: 0,
            zIndex: 50,
            minWidth: 200,
            background: T.bgPaperBright,
            border: '1px solid ' + T.borderLight,
            borderRadius: 6,
            boxShadow: '0 8px 28px rgba(28, 24, 20, 0.16)',
            padding: '6px 0',
            overflow: 'hidden',
          }}>
          <ChannelRow
            label={copied ? 'Copied' : 'Copy link'}
            sublabel={copied ? null : 'to clipboard'}
            onClick={handleCopy}
          />
          <div style={{ height: 1, background: T.borderLight, margin: '4px 0' }} />
          <ChannelRow label="X / Twitter"      onClick={handleTwitter} />
          <ChannelRow label="Facebook"          onClick={handleFacebook} />
          <ChannelRow label="LinkedIn"          onClick={handleLinkedIn} />
          <ChannelRow label="Email"             onClick={handleEmail} />
          {hasNativeShare && (
            <ChannelRow label="More" sublabel="device share sheet" onClick={handleNative} />
          )}
        </div>
      )}
    </div>
  );
}
