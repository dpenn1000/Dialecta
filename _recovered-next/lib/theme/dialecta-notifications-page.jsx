/**
 * dialecta-notifications-page.jsx
 *
 * Full notifications history at /notifications/. Mounts into
 * #dialecta-notifications-page-root from page-notifications.hbs.
 * Paginated via the `before` cursor on /api/notifications.
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
  bgWhite:     '#fffdf8',
  textPrimary: '#1c1814',
  textSecondary:'#5a5248',
  textTertiary:'#7a7068',
  borderLight: '#e8e0d0',
  amber:       '#b8862e',
  goldPale:    '#f5e8d0',
  fontDisplay: "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",
  fontReading: "'Source Serif 4', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
};

function PageRow({ notif, onMarkRead }) {
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
        padding: '18px 20px',
        background: hovered ? T.bgSecondary : (notif.is_read ? T.bgWhite : T.goldPale),
        borderLeft: notif.is_read ? '3px solid transparent' : `3px solid ${T.amber}`,
        borderBottom: `1px solid ${T.borderLight}`,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background 0.12s',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <div style={{
          fontFamily: T.fontReading, fontSize: 15, lineHeight: 1.5,
          color: T.textPrimary, flex: 1, minWidth: 0,
        }}>
          {description}
        </div>
        <div style={{
          fontFamily: T.fontMono, fontSize: 9,
          color: T.textTertiary, letterSpacing: '0.06em', textTransform: 'uppercase',
          flexShrink: 0,
        }}>
          {timeAgo(notif.created_at)}
        </div>
      </div>
      {excerpt && (
        <div style={{
          marginTop: 8,
          fontFamily: T.fontReading, fontSize: 13, fontStyle: 'italic',
          color: T.textSecondary, lineHeight: 1.6,
        }}>
          "{excerpt}"
        </div>
      )}
    </a>
  );
}

export default function DialectaNotificationsPage({ memberUuid }) {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState(null);

  const initialLoad = useCallback(async () => {
    try {
      const json = await fetchNotifications({ memberUuid, limit: 50 });
      setItems(json.notifications || []);
      setUnread(json.unread_count || 0);
      setHasMore(!!json.has_more);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [memberUuid]);

  useEffect(() => {
    if (memberUuid) initialLoad();
  }, [memberUuid, initialLoad]);

  async function loadMore() {
    if (loadingMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const last = items[items.length - 1];
      const json = await fetchNotifications({
        memberUuid,
        limit: 50,
        before: last.created_at,
      });
      setItems((prev) => [...prev, ...(json.notifications || [])]);
      setHasMore(!!json.has_more);
    } catch (e) {
      console.warn('loadMore failed:', e);
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleMarkRead(id) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await markRead({ memberUuid, id });
    } catch (e) {
      console.warn('markRead failed:', e);
    }
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
    try {
      await markAllRead({ memberUuid });
    } catch (e) {
      console.warn('markAllRead failed:', e);
    }
  }

  if (!memberUuid) {
    return (
      <div style={{
        padding: '80px 24px', textAlign: 'center',
        fontFamily: T.fontBody, color: T.textTertiary,
      }}>
        Please <a href="/signin/" style={{ color: T.amber }}>sign in</a> to view your notifications.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 60px' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 16, marginBottom: 24,
        paddingBottom: 16, borderBottom: `2px solid ${T.amber}`,
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: T.fontDisplay, fontSize: '2.4rem', fontWeight: 500,
            fontStyle: 'italic', color: T.textPrimary, letterSpacing: '0.01em',
          }}>
            Notifications
          </h1>
          <div style={{
            marginTop: 4,
            fontFamily: T.fontMono, fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: unread > 0 ? T.amber : T.textTertiary,
          }}>
            {unread > 0 ? `${unread} unread` : 'All caught up'}
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAll}
            style={{
              background: 'transparent',
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
              padding: '7px 16px',
              fontFamily: T.fontMono, fontSize: 10,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: T.textSecondary, cursor: 'pointer',
            }}>
            Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: T.fontMono, fontSize: 11,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: T.textTertiary,
        }}>Loading…</div>
      ) : error ? (
        <div style={{
          padding: 60, textAlign: 'center',
          fontFamily: T.fontBody, fontSize: 13, color: '#b8372e',
        }}>
          Could not load notifications.
          <div style={{ marginTop: 4, fontSize: 11, color: T.textTertiary }}>{error}</div>
        </div>
      ) : items.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          fontFamily: T.fontReading, fontSize: 16, fontStyle: 'italic',
          color: T.textTertiary, lineHeight: 1.7,
        }}>
          Nothing here yet.
          <div style={{
            marginTop: 12, fontFamily: T.fontMono, fontSize: 10,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: T.textTertiary, fontStyle: 'normal',
          }}>
            Replies, mentions, and follows will appear here as they happen.
          </div>
        </div>
      ) : (
        <>
          <div style={{
            background: T.bgWhite,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 6,
            overflow: 'hidden',
          }}>
            {items.map((n) => (
              <PageRow key={n.id} notif={n} onMarkRead={handleMarkRead} />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 4,
                  padding: '9px 20px',
                  fontFamily: T.fontMono, fontSize: 10,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: T.textSecondary, cursor: loadingMore ? 'wait' : 'pointer',
                }}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
