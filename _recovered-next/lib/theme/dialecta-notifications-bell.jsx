/**
 * dialecta-notifications-bell.jsx
 *
 * Header bell + slide-in drawer. Mounts into the nav-member-area in
 * default.hbs via #dialecta-notifications-bell-root. Reads member uuid
 * from data-member-uuid; renders nothing for signed-out visitors.
 *
 * The bell shows an unread count badge. Click opens a 360px wide drawer
 * (matches SettingsDrawer width) listing the last 30 notifications. The
 * drawer offers a "Mark all read" action and a footer link to the full
 * /notifications/ page.
 *
 * Refresh cadence: every 60s while the tab is foregrounded. Surface in
 * the future tuning engine.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchNotifications,
  markRead,
  markAllRead,
  timeAgo,
  describeNotification,
} from './dialecta-notifications-data.js';

const T = {
  bgPrimary:   '#f7f2e8',
  bgSecondary: '#efe8da',
  bgWhite:     '#ffffff',
  textPrimary: '#1c1814',
  textSecondary:'#5a5248',
  textTertiary:'#7a7068',
  borderLight: '#e8e0d0',
  borderMedium:'#d8ceb8',
  amber:       '#b8862e',
  goldPale:    '#f5e8d0',
  fontDisplay: "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
};

// TUNING: bell+drawer refresh cadence (ms). Surface in future tuning engine.
const REFRESH_MS = 60000;

function Bell({ count, onClick }) {
  const showBadge = count > 0;
  return (
    <button
      onClick={onClick}
      aria-label={showBadge ? `${count} unread notifications` : 'Notifications'}
      style={{
        position: 'relative',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 8px',
        color: T.textSecondary,
        display: 'inline-flex',
        alignItems: 'center',
      }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </svg>
      {showBadge && (
        <span style={{
          position: 'absolute',
          top: 2, right: 2,
          minWidth: 16, height: 16,
          padding: '0 4px',
          borderRadius: 8,
          background: T.amber,
          color: T.bgPrimary,
          fontFamily: T.fontMono,
          fontSize: 9,
          fontWeight: 600,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(28,24,20,0.25)',
        }}>{count > 99 ? '99+' : count}</span>
      )}
    </button>
  );
}

function NotificationItem({ notif, onMarkRead }) {
  const [hovered, setHovered] = useState(false);
  const description = describeNotification(notif);
  const excerpt = notif.payload?.comment_excerpt || '';
  const url = notif.target_url || '/';

  function handleClick() {
    if (!notif.is_read) onMarkRead(notif.id);
  }

  return (
    <a
      href={url}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        padding: '12px 14px',
        background: hovered ? T.bgSecondary : (notif.is_read ? 'transparent' : T.goldPale),
        borderLeft: notif.is_read ? '2px solid transparent' : `2px solid ${T.amber}`,
        borderRadius: 4,
        textDecoration: 'none',
        color: 'inherit',
        marginBottom: 6,
        transition: 'background 0.12s',
      }}>
      <div style={{
        fontFamily: T.fontReading, fontSize: 13.5, lineHeight: 1.5,
        color: T.textPrimary,
      }}>
        {description}
      </div>
      {excerpt && (
        <div style={{
          marginTop: 4,
          fontFamily: T.fontReading, fontSize: 12, fontStyle: 'italic',
          color: T.textTertiary, lineHeight: 1.5,
        }}>
          "{excerpt}"
        </div>
      )}
      <div style={{
        marginTop: 6,
        fontFamily: T.fontMono, fontSize: 9,
        color: T.textTertiary, letterSpacing: '0.06em', textTransform: 'uppercase',
      }}>
        {timeAgo(notif.created_at)}
      </div>
    </a>
  );
}

function Drawer({ memberUuid, onClose, onCountChange }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  // Push the drawer down so it doesn't sit under the under-construction
  // banner (`.dialecta-build-strip`). Re-measures on window resize so the
  // offset stays correct across breakpoints (the strip wraps to two lines
  // on narrow viewports). Returns 0 if the strip isn't in the DOM, so the
  // drawer still pins to the top once the banner is retired.
  const [stripOffset, setStripOffset] = useState(0);

  useEffect(() => {
    function measureStrip() {
      const strip = document.querySelector('.dialecta-build-strip');
      if (!strip) { setStripOffset(0); return; }
      const rect = strip.getBoundingClientRect();
      setStripOffset(Math.max(0, rect.bottom));
    }
    measureStrip();
    window.addEventListener('resize', measureStrip);
    return () => window.removeEventListener('resize', measureStrip);
  }, []);

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  function handleClose() {
    setVisible(false);
    setTimeout(onClose, 240);
  }

  async function refresh() {
    try {
      const json = await fetchNotifications({ memberUuid, limit: 30 });
      setItems(json.notifications || []);
      setUnread(json.unread_count || 0);
      if (onCountChange) onCountChange(json.unread_count || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberUuid]);

  async function handleMarkRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => {
      const next = Math.max(0, u - 1);
      if (onCountChange) onCountChange(next);
      return next;
    });
    try {
      await markRead({ memberUuid, id });
    } catch (e) {
      console.warn('markRead failed:', e);
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    if (onCountChange) onCountChange(0);
    try {
      await markAllRead({ memberUuid });
    } catch (e) {
      console.warn('markAllRead failed:', e);
    }
  }

  return (
    <>
      <style>{`
        @keyframes notif-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(28,24,20,0.50)',
          backdropFilter: 'blur(3px)',
          animation: 'notif-backdrop-in 0.22s ease',
        }}
      />

      <div style={{
        position: 'fixed', top: stripOffset, right: 0, bottom: 0,
        zIndex: 301,
        width: 360, maxWidth: '100vw',
        background: T.bgPrimary,
        borderLeft: `1px solid ${T.borderMedium}`,
        boxShadow: '-12px 0 40px rgba(28,24,20,0.18)',
        display: 'flex', flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.24s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        <div style={{
          padding: '20px 24px 14px',
          borderBottom: `1px solid ${T.borderLight}`,
          background: `linear-gradient(to bottom, ${T.goldPale}, ${T.bgPrimary})`,
          display: 'flex', alignItems: 'baseline', gap: 12,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: T.fontDisplay, fontSize: '1.4rem', fontWeight: 500,
              color: T.textPrimary, fontStyle: 'italic', lineHeight: 1.1,
            }}>
              Notifications
            </div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: T.amber, marginTop: 4,
            }}>
              {unread > 0 ? `${unread} unread` : 'All caught up'}
            </div>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 6,
              color: T.textTertiary, fontSize: 22, lineHeight: 1,
            }}>×</button>
        </div>

        {unread > 0 && (
          <div style={{
            padding: '10px 20px',
            borderBottom: `1px solid ${T.borderLight}`,
            display: 'flex', justifyContent: 'flex-end',
          }}>
            <button
              onClick={handleMarkAll}
              style={{
                background: 'transparent',
                border: `1px solid ${T.borderLight}`,
                borderRadius: 4,
                padding: '5px 12px',
                fontFamily: T.fontMono, fontSize: 9,
                letterSpacing: '0.10em', textTransform: 'uppercase',
                color: T.textSecondary, cursor: 'pointer',
              }}>
              Mark all read
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
          {loading ? (
            <div style={{
              padding: 40, textAlign: 'center',
              fontFamily: T.fontMono, fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.textTertiary,
            }}>Loading…</div>
          ) : error ? (
            <div style={{
              padding: 40, textAlign: 'center',
              fontFamily: T.fontBody, fontSize: 13, color: '#b8372e',
            }}>
              Could not load notifications.
              <div style={{ marginTop: 4, fontSize: 11, color: T.textTertiary }}>{error}</div>
            </div>
          ) : items.length === 0 ? (
            <div style={{
              padding: '40px 24px', textAlign: 'center',
              fontFamily: T.fontReading, fontSize: 14, fontStyle: 'italic',
              color: T.textTertiary, lineHeight: 1.6,
            }}>
              Nothing yet.
              <div style={{
                marginTop: 8, fontFamily: T.fontMono, fontSize: 9,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: T.textTertiary, fontStyle: 'normal',
              }}>
                Replies, mentions, and follows will appear here
              </div>
            </div>
          ) : (
            items.map((n) => (
              <NotificationItem key={n.id} notif={n} onMarkRead={handleMarkRead} />
            ))
          )}
        </div>

        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${T.borderLight}`,
          textAlign: 'center',
        }}>
          <a
            href="/notifications/"
            style={{
              fontFamily: T.fontMono, fontSize: 9,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              color: T.amber, textDecoration: 'none',
            }}>
            View all →
          </a>
        </div>
      </div>
    </>
  );
}

export default function BellWithDrawer({ memberUuid }) {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  const refreshCount = useCallback(async () => {
    if (!memberUuid) return;
    try {
      const json = await fetchNotifications({ memberUuid, limit: 1 });
      setCount(json.unread_count || 0);
    } catch (e) {
      console.warn('Bell unread fetch failed:', e);
    }
  }, [memberUuid]);

  useEffect(() => {
    refreshCount();
    const tick = setInterval(() => {
      if (document.visibilityState === 'visible') refreshCount();
    }, REFRESH_MS);
    return () => clearInterval(tick);
  }, [refreshCount]);

  if (!memberUuid) return null;

  return (
    <>
      <Bell count={count} onClick={() => setOpen(true)} />
      {open && (
        <Drawer
          memberUuid={memberUuid}
          onClose={() => setOpen(false)}
          onCountChange={setCount}
        />
      )}
    </>
  );
}
