/**
 * dialecta-discourse-layer.jsx
 *
 * The Discourse Layer feed: topology bar, control bar (filter + sort),
 * comment cards with contrast strips, malleability counters, edit/delete
 * controls, and the (deferred) nomination panel.
 *
 * Modernized from the canonical 693-line OneDrive prototype
 * (Fundamentals/dialecta-discourse-layer.jsx) for the current Dialecta
 * design system: paper-grain cream cards with wood-edge frames, brass
 * accents, mobile-aware from day one.
 *
 * v1 SCOPE:
 *   ✓ Topology bar (tier-distribution strip with click-filter)
 *   ✓ Control bar (filter chips + Quality / Newest sort)
 *   ✓ Comment cards: header, body, footer, tier badges, contrast strip,
 *     Breach variant (0.65 opacity + suppression notice), malleable
 *     state with live countdown
 *   ✓ Edit / Delete on own comments during malleable window
 *     (calls PATCH/DELETE /api/comment/:id)
 *   ✓ Optimistic prepend of newly-posted comments
 *   ✓ Reply threading (one level; replies render indented under parent)
 *   ✓ Nomination panel (Stage 3 community reclassification — three-input
 *     final tier model. Backed by tier_nominations table from migration
 *     025 + POST /api/comment/[id]/nominate.)
 *
 * DEFERRED:
 *   ⏳ Most-discussed sort (depends on nomination + reply counts)
 *   ⏳ Withdraw nomination (DELETE endpoint — for v1 you can only revise)
 *   ⏳ Author-Stage-2.5-before-flip wait window for nomination resolution
 *
 * Props:
 *   articleId            string         from post.hbs data-post-id
 *   viewerMember         { uuid, ... } | null   logged-in member or null
 *   articleClaims        string[] | null         optional, for re-classify on edit
 *   optimisticComments   shaped[]               comments posted in this session
 *                                               that may not yet appear in the
 *                                               feed read; prepended client-side
 *                                               and dedup'd against the API list
 *   refreshTick          number                 bump to force a refetch
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import TierBadge, { TIERS, TIER_BY_KEY, TierIcon } from './dialecta-tier-badge.jsx';
import NominationPanel from './dialecta-nomination-panel.jsx';

// ─── Sort modes ──────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { key: 'quality', label: 'Quality' },
  { key: 'newest',  label: 'Newest' },
  // Most discussed deferred — depends on votes + replies which are not in v1.
];

// Tier rank for Quality sort (Forum first, Breach last).
const TIER_RANK = Object.fromEntries(TIERS.map(t => [t.key, t.rank]));

// ─── Time helpers ────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const wks = Math.floor(days / 7);
  return `${wks}w ago`;
}

function malleableCountdown(hardenedIso) {
  if (!hardenedIso) return null;
  const remaining = new Date(hardenedIso).getTime() - Date.now();
  if (remaining <= 0) return null;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  return { mins, secs, remaining, pct: Math.max(0, Math.min(100, (remaining / (60 * 60 * 1000)) * 100)) };
}

// Style for inline @mention links in rendered comment bodies. Keep close
// to body color so the mention reads as part of the sentence; brass on
// hover signals interactivity without shouting.
const MENTION_STYLE = {
  color: 'var(--brass-mid, #b8862e)',
  textDecoration: 'none',
  fontWeight: 500,
  borderBottom: '1px dotted var(--brass-pale, rgba(184,134,46,0.4))',
};

/**
 * Split a comment body into text + mention link segments. Each mention
 * is matched by its `@<handle>` token (post-migration 029) with a
 * fallback to `@<display_name>` for older comments authored before the
 * handle column existed. Sort by token length DESC so longer tokens win
 * over shorter prefixes (e.g. `@daniel-pennington` before `@daniel`).
 * Link target stays at `/profile/?id=<member_id>` for now; Phase 1.2
 * will swap to `/contributor/<handle>` once the SSR route ships.
 */
function renderBodyWithMentions(body, mentions) {
  if (!body) return body;
  if (!Array.isArray(mentions) || mentions.length === 0) return body;

  function tokenFor(m) {
    return m && (m.handle || m.display_name) ? (m.handle || m.display_name) : null;
  }

  let segments = [{ type: 'text', value: body }];
  const sorted = [...mentions]
    .filter((m) => m && m.member_id && tokenFor(m))
    .sort((a, b) => tokenFor(b).length - tokenFor(a).length);

  for (const m of sorted) {
    const tokenText = tokenFor(m);
    const token = '@' + tokenText;
    const next = [];
    for (const seg of segments) {
      if (seg.type !== 'text') { next.push(seg); continue; }
      const text = seg.value;
      let cursor = 0;
      let idx = text.indexOf(token, cursor);
      while (idx !== -1) {
        if (idx > cursor) next.push({ type: 'text', value: text.slice(cursor, idx) });
        next.push({
          type:         'mention',
          member_id:    m.member_id,
          handle:       m.handle || null,
          display_name: m.display_name || tokenText,
          token:        tokenText,
        });
        cursor = idx + token.length;
        idx = text.indexOf(token, cursor);
      }
      if (cursor < text.length) next.push({ type: 'text', value: text.slice(cursor) });
    }
    segments = next;
  }

  return segments.map((s, i) => {
    if (s.type === 'mention') {
      return (
        <a
          key={i}
          href={'/profile/?id=' + encodeURIComponent(s.member_id)}
          style={MENTION_STYLE}
          title={s.display_name}
        >
          @{s.token}
        </a>
      );
    }
    return s.value;
  });
}

// ─── Fetch hook ──────────────────────────────────────────────────────────
function useArticleComments({ articleId, viewer, refreshTick }) {
  const [comments, setComments] = useState(null);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;
    setError(null);
    const params = new URLSearchParams({ article_id: articleId });
    if (viewer) params.set('viewer', viewer);
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    fetch(`${base}/api/comments?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (cancelled) return;
        setComments(data.comments || []);
      })
      .catch(err => {
        if (cancelled) return;
        setError(err.message);
        setComments([]);
      });
    return () => { cancelled = true; };
  }, [articleId, viewer, refreshTick]);

  return { comments, error };
}

// ─── Topology bar ────────────────────────────────────────────────────────
// The topology bar IS the filter UI for the discourse layer (decision
// 2026-04-29). Three pieces when populated:
//   1. Header line: "The shape of this conversation · N comments" + Guidebook link
//   2. Proportional colored strip: each tier sized by count, click-to-filter
//   3. Legend chips: per-tier (icon + name + count), the primary click-to-filter target
// Empty state replaces all three with a focused panel explaining the
// classification model and pointing to the Guidebook.
//
// There is no separate filter-chip strip in the ControlBar. The topology
// bar's legend chips do that work, with the proportional strip as a
// visual companion. ControlBar only carries the active-filter indicator
// (when a tier is selected) and the Sort dropdown.
function TopologyBar({ comments, activeFilter, onFilter }) {
  const counts = useMemo(() => {
    const c = {};
    for (const t of TIERS) c[t.key] = 0;
    for (const cm of comments) {
      const tier = cm.classification?.final_tier || cm.classification?.ai_suggested_tier;
      if (tier && c[tier] !== undefined) c[tier]++;
    }
    return c;
  }, [comments]);

  const total = TIERS.reduce((acc, t) => acc + (counts[t.key] || 0), 0);

  if (total === 0) {
    return (
      <div style={{
        padding: 'clamp(18px, 3vw, 26px) clamp(14px, 3vw, 20px)',
        background: 'rgba(154, 92, 40, 0.04)',
        borderBottom: '1px solid var(--wood-edge)',
        textAlign: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--tertiary)',
          marginBottom: 12,
        }}>
          The conversation hasn't started yet
        </div>
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--secondary)',
          margin: '0 auto 14px',
          maxWidth: 520,
        }}>
          Comments here are classified by depth and care, not by who wrote them. The shape of the conversation will appear above as comments arrive.
        </p>
        <a
          href="/guidebook/#tiers"
          target="_blank"
          rel="noopener"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid, #b8862e)',
            textDecoration: 'none',
          }}
        >
          What do these mean? →
        </a>
      </div>
    );
  }

  return (
    <div style={{
      padding: 'clamp(14px, 2vw, 20px) clamp(14px, 3vw, 20px) 12px',
      background: 'rgba(154, 92, 40, 0.04)',
      borderBottom: '1px solid var(--wood-edge)',
    }}>
      {/* Header line: shape title + Guidebook link, baseline-aligned. */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 8,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--brass-mid)',
        }}>
          The shape of this conversation · {total} {total === 1 ? 'comment' : 'comments'}
        </div>
        <a
          href="/guidebook/#tiers"
          target="_blank"
          rel="noopener"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid, #b8862e)',
            textDecoration: 'none',
          }}
        >
          What do these mean? →
        </a>
      </div>

      {/* Proportional colored strip. Click any segment to filter. Tiers
          with zero count don't render (no zero-width slivers). Active
          filter de-saturates everything except the selected tier. */}
      <div style={{
        display: 'flex',
        height: 14,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid var(--wood-edge)',
        boxShadow: 'inset 0 1px 2px rgba(28,24,20,0.08)',
        marginBottom: 10,
      }}>
        {TIERS.map(t => {
          const n = counts[t.key];
          if (!n) return null;
          const pct = (n / total) * 100;
          const dimmed = activeFilter !== 'all' && activeFilter !== t.key;
          return (
            <button
              key={t.key}
              onClick={() => onFilter(activeFilter === t.key ? 'all' : t.key)}
              title={`${t.name}: ${n}`}
              aria-label={`Filter to ${t.name}: ${n} ${n === 1 ? 'comment' : 'comments'}`}
              style={{
                flex: pct,
                background: `linear-gradient(180deg, ${t.top}, ${t.bot})`,
                border: 'none',
                borderRight: '1px solid rgba(28,24,20,0.10)',
                cursor: 'pointer',
                opacity: dimmed ? 0.32 : 1,
                transition: 'opacity 0.18s ease',
              }}
            />
          );
        })}
      </div>

      {/* Legend chips = the primary click-to-filter target. Each tier
          present in the conversation renders as a clickable chip with
          icon + name + count. Active chip gets a brass-bright inset ring
          and full saturation; inactive chips dim when a different tier
          is selected. Hover/long-press shows the tier's `meaning` via
          the title attribute. */}
      <div style={{
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {TIERS.map(t => {
          const n = counts[t.key];
          if (!n) return null;
          const isActive = activeFilter === t.key;
          const dimmed = activeFilter !== 'all' && !isActive;
          return (
            <button
              key={t.key}
              onClick={() => onFilter(isActive ? 'all' : t.key)}
              title={t.meaning}
              aria-pressed={isActive}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '5px 10px 5px 8px',
                borderRadius: 4,
                background: `linear-gradient(180deg, ${t.top}, ${t.bot})`,
                color: t.text,
                border: `1px solid ${t.border}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                opacity: dimmed ? 0.42 : 1,
                boxShadow: isActive
                  ? '0 1px 3px rgba(28,24,20,0.18), inset 0 0 0 1px var(--brass-bright, #d4a84a)'
                  : 'none',
                transition: 'opacity 0.15s ease, box-shadow 0.15s ease',
                appearance: 'none',
                font: 'inherit',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <TierIcon tierKey={t.key} size={11} />
              <span>{t.short}</span>
              <span style={{ marginLeft: 2, opacity: 0.7 }}>· {n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Control bar (active-filter indicator + sort) ────────────────────────
// Sticky below the two-bar nav. Filtering happens in the topology bar
// above (segment click or legend-chip click). This bar persists as the
// reader scrolls so the current filter state and sort choice stay in
// reach without scrolling back up.
//
// When a tier filter is active: shows a small "Showing only [Tier] · Show
// all" indicator on the left and the Sort dropdown on the right.
// When no filter is active: just the Sort dropdown, right-aligned.
function ControlBar({ activeFilter, onFilter, sort, onSort }) {
  const activeTier = activeFilter !== 'all' ? TIER_BY_KEY[activeFilter] : null;
  return (
    <div style={{
      position: 'sticky',
      top: 'var(--nav-height, 86px)',
      zIndex: 10,
      padding: '8px clamp(14px, 3vw, 20px)',
      background: 'linear-gradient(to bottom, #eceae4 0%, #d8d4cc 48%, #eceae4 100%)',
      borderTop: '1px solid rgba(255,255,255,0.4)',
      borderBottom: '1px solid var(--wood-edge)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      {activeTier && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flex: '1 1 auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--secondary)',
        }}>
          <span>Showing only</span>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 8px 3px 7px',
            borderRadius: 4,
            background: `linear-gradient(180deg, ${activeTier.top}, ${activeTier.bot})`,
            color: activeTier.text,
            border: `1px solid ${activeTier.border}`,
          }}>
            <TierIcon tierKey={activeTier.key} size={10} />
            <span>{activeTier.short}</span>
          </span>
          <button
            onClick={() => onFilter('all')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--brass-mid, #b8862e)',
              background: 'transparent',
              border: 'none',
              padding: '2px 6px',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: 2,
              appearance: 'none',
              font: 'inherit',
            }}
          >
            Show all
          </button>
        </div>
      )}

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        marginLeft: activeTier ? 0 : 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--secondary)',
      }}>
        Sort
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.04em',
            color: 'var(--ink)',
            background: 'var(--paper)',
            border: '1px solid var(--wood-edge)',
            borderRadius: 4,
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          {SORT_OPTIONS.map(s => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}

// ─── Comment card ────────────────────────────────────────────────────────
function CommentCard({ comment, viewerMember, onEdit, onDelete, onReply, onNominationSubmitted, indented = false }) {
  const cls = comment.classification || {};
  const aiTier   = cls.ai_suggested_tier;
  const selfTier = cls.self_declared_tier || aiTier;
  const finalTier = cls.final_tier || selfTier || aiTier;
  const tierForVisual = TIER_BY_KEY[finalTier];

  const isBreach = finalTier === 'breach';
  const isOwn = !!comment.is_own;
  const malleable = comment.malleable;

  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!malleable) return;
    const i = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(i);
  }, [malleable]);

  const cd = malleable ? malleableCountdown(comment.hardened_at) : null;
  const stillMalleable = !!cd;

  const initials = useMemo(() => {
    const parts = (comment.author?.name || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return '?';
  }, [comment.author?.name]);

  return (
    <article
      className="dialecta-paper dialecta-wood-frame"
      style={{
        padding: 'clamp(16px, 2vw + 8px, 22px)',
        marginBottom: 14,
        marginLeft: indented ? 'clamp(20px, 4vw, 36px)' : 0,
        borderLeft: indented ? '2px solid var(--brass-pale, rgba(184,134,46,0.28))' : undefined,
        opacity: isBreach ? 0.65 : 1,
        position: 'relative',
        boxShadow: stillMalleable
          ? '0 0 0 2px rgba(236, 180, 56, 0.28), 0 2px 8px rgba(28,24,20,0.06), 0 1px 3px rgba(28,24,20,0.04)'
          : undefined,
      }}
    >
      {indented && (
        <div style={{
          position: 'absolute',
          top: 14,
          left: -10,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--brass-mid, #b8862e)',
          background: 'var(--paper, #f7f2e8)',
          padding: '2px 6px',
        }}>
          ↳ Reply
        </div>
      )}
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 14,
        paddingBottom: 14,
        borderBottom: '1px solid var(--wood-edge)',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Avatar initials chip */}
          <span aria-hidden="true" style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brass-warm), var(--brass-mid))',
            color: 'var(--cream)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: 13,
            fontWeight: 500,
            flexShrink: 0,
          }}>{initials}</span>

          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--ink)',
              lineHeight: 1.2,
            }}>
              {comment.author?.name || 'Anonymous'}
              {isOwn && (
                <span style={{
                  marginLeft: 8,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 8,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--brass-mid)',
                  verticalAlign: 'middle',
                }}>You</span>
              )}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--tertiary)',
              letterSpacing: '0.08em',
              marginTop: 2,
            }}>{relativeTime(comment.created_at)}</div>
          </div>
        </div>

        {/* Tier badges (right side) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {aiTier && selfTier && aiTier !== selfTier ? (
            <>
              <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 7,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--brass-mid)',
                }}>AI</span>
                <TierBadge tierKey={aiTier} size="sm" />
              </span>
              <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 10,
                  color: 'var(--tertiary)',
                }}>self-declared</span>
                <TierBadge tierKey={selfTier} size="sm" />
              </span>
            </>
          ) : (
            <TierBadge tierKey={finalTier} size="sm" />
          )}

          {/* Malleable countdown plaque */}
          {stillMalleable && (
            <span style={{
              padding: '4px 8px',
              background: 'var(--ink)',
              color: 'var(--brass-bright)',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {String(cd.mins).padStart(2, '0')}:{String(cd.secs).padStart(2, '0')}
            </span>
          )}
        </div>
      </header>

      {/* Body */}
      {isBreach ? (
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(13px, 1vw + 7px, 14px)',
          lineHeight: 1.7,
          color: 'var(--secondary)',
          fontStyle: 'italic',
          margin: 0,
        }}>
          Content suppressed: targets a person, not an idea. Visible here with explanation per platform transparency policy.
        </p>
      ) : (
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.75,
          color: 'var(--body)',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}>{renderBodyWithMentions(comment.body, comment.mentions)}</p>
      )}

      {/* Contrast strip */}
      {aiTier && selfTier && aiTier !== selfTier && !isBreach && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: 'rgba(245, 223, 160, 0.16)',
          borderLeft: '2px solid var(--brass-mid)',
          borderRadius: '0 4px 4px 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid)',
            marginBottom: 4,
          }}>Engine voice</div>
          <p style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 12,
            lineHeight: 1.55,
            color: 'var(--secondary)',
            margin: 0,
            fontStyle: 'italic',
          }}>
            Commenter declared <strong style={{ fontStyle: 'normal' }}>{TIER_BY_KEY[selfTier]?.name}</strong>. Engine read <strong style={{ fontStyle: 'normal' }}>{TIER_BY_KEY[aiTier]?.name}</strong>. Community voting will settle it.
          </p>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        marginTop: 14,
        paddingTop: 12,
        borderTop: '1px solid var(--wood-edge)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Specificity dots */}
          {!isBreach && cls.specificity_score != null && (
            <span style={{
              display: 'inline-flex',
              gap: 3,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  border: `1px solid ${i < cls.specificity_score ? 'var(--brass-mid)' : 'var(--wood-edge)'}`,
                  background: i < cls.specificity_score ? 'var(--brass-warm)' : 'transparent',
                }} />
              ))}
              <span style={{
                marginLeft: 6,
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--tertiary)',
                letterSpacing: '0.06em',
              }}>specificity {cls.specificity_score}/3</span>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {/* Reply (only on top-level comments, never on replies themselves,
              never on Breach, hidden for signed-out viewers because the
              composer is gated). One level of threading by design: replies
              are leaves; if you want to respond to a reply, reply to its
              parent and the conversation stays readable. */}
          {onReply && !indented && !isBreach && (
            <button onClick={() => onReply(comment)} style={btnMicro}>Reply</button>
          )}
          {/* Edit / Delete (own + malleable only) */}
          {isOwn && stillMalleable && !isBreach && (
            <>
              {onEdit && (
                <button onClick={() => onEdit(comment)} style={btnMicro}>Edit</button>
              )}
              {onDelete && (
                <button onClick={() => onDelete(comment)} style={btnMicroDanger}>Delete</button>
              )}
            </>
          )}
        </div>
      </footer>

      {/* Malleability progress bar (own + malleable only) */}
      {isOwn && stillMalleable && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            height: 3,
            background: 'rgba(154, 92, 40, 0.18)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${cd.pct}%`,
              background: 'linear-gradient(to right, var(--brass-warm), var(--brass-bright))',
              transition: 'width 1s linear',
            }} />
          </div>
        </div>
      )}

      {/* Nomination panel — community reclassification surface. Renders
          its own gating: hidden for signed-out viewers, own comments, and
          Breach-tier comments. Submitting bumps the parent feed's local
          refresh tick so any final_tier shift is picked up immediately. */}
      <NominationPanel
        comment={comment}
        viewerMember={viewerMember}
        onSubmitted={onNominationSubmitted}
      />
    </article>
  );
}

// ─── Edit overlay (inline textarea on a malleable own comment) ───────────
function EditOverlay({ comment, onCancel, onSubmit }) {
  const [body, setBody] = useState(comment.body || '');
  // Mentions inherit from the original comment so the renderer keeps the
  // @display_name spans linked. We auto-prune any mention whose
  // @display_name is no longer in the body (e.g. user deleted the @ token
  // while editing). Adding NEW mentions during edit is not supported in v1
  // — the picker UI lives only in the COMPOSE stage; the edit overlay
  // doesn't have it. If a writer wants to add new @s during edit, they
  // type @ inline and the free-text fallback parser on the API picks it
  // up (server-side mention notification still fires for unambiguous
  // matches). Structured-mentions-on-edit is a v2 polish item.
  const [mentions, setMentions] = useState(
    Array.isArray(comment.mentions) ? comment.mentions : []
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  function handleBodyChange(e) {
    const next = e.target.value;
    setBody(next);
    setMentions((prev) => prev.filter((m) => next.includes('@' + m.display_name)));
  }

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      await onSubmit(body, mentions);
    } catch (err) {
      setError(err.message || 'Edit failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="dialecta-paper dialecta-wood-frame" style={{
      padding: 'clamp(16px, 2vw + 8px, 22px)',
      marginBottom: 14,
      boxShadow: '0 0 0 2px rgba(236, 180, 56, 0.36), 0 2px 12px rgba(28,24,20,0.08)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'var(--brass-bright)',
        marginBottom: 10,
      }}>Editing · re-classifies on save</div>
      <textarea
        value={body}
        onChange={handleBodyChange}
        rows={5}
        style={{
          width: '100%',
          minHeight: 120,
          border: '1px solid var(--wood-edge)',
          borderRadius: 4,
          outline: 'none',
          resize: 'vertical',
          background: 'var(--paper)',
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.7,
          color: 'var(--body)',
          padding: 12,
        }}
      />
      {error && (
        <p style={{
          marginTop: 10,
          fontFamily: 'var(--font-reading)',
          fontSize: 13,
          color: '#7C2C08',
        }}>{error}</p>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button onClick={onCancel} disabled={busy} style={btnOutline}>Cancel</button>
        <button
          onClick={handleSave}
          disabled={busy || body.trim().length === 0}
          style={{
            ...btnPrimary,
            opacity: busy || body.trim().length === 0 ? 0.5 : 1,
            cursor: busy ? 'wait' : (body.trim().length === 0 ? 'not-allowed' : 'pointer'),
          }}
        >{busy ? 'Saving…' : 'Save'}</button>
      </div>
    </div>
  );
}

// ─── Main feed ───────────────────────────────────────────────────────────
export default function DialectaDiscourseLayer({
  articleId,
  viewerMember = null,
  articleClaims = null,
  optimisticComments = [],
  refreshTick = 0,
  onReply = null,
}) {
  const viewer = viewerMember?.uuid || '';
  // localTick refetches the feed after a nomination submit so any
  // final_tier shift + tally update is picked up immediately. Combined
  // with the parent's refreshTick prop (used for "I just posted a new
  // comment, please show it" path).
  const [localTick, setLocalTick] = useState(0);
  const handleNominationSubmitted = useCallback(() => {
    setLocalTick(t => t + 1);
  }, []);

  const { comments: fetched, error } = useArticleComments({
    articleId,
    viewer,
    refreshTick: refreshTick + localTick,
  });

  const [filter, setFilter] = useState('all');
  const [sort, setSort]     = useState('quality');
  const [editingId, setEditingId] = useState(null);
  const [localOverrides, setLocalOverrides] = useState({});

  // Combined comment list: optimistic prepend + fetched, deduped by id.
  const all = useMemo(() => {
    if (!fetched) return null;
    const seen = new Set();
    const out = [];
    for (const c of [...optimisticComments, ...fetched]) {
      if (!c?.id) continue;
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      // Apply local edit overrides if any.
      out.push(localOverrides[c.id] ? { ...c, ...localOverrides[c.id] } : c);
    }
    return out;
  }, [fetched, optimisticComments, localOverrides]);

  // Group replies by their parent so the render loop can interleave them
  // under their top-level parent. Replies always render in chronological
  // order within a thread, regardless of the global sort. Filter applies
  // to top-level comments only; once a parent is visible, all its replies
  // come along so threads stay coherent.
  const repliesByParent = useMemo(() => {
    const map = new Map();
    if (!all) return map;
    for (const c of all) {
      if (c.parent_id) {
        if (!map.has(c.parent_id)) map.set(c.parent_id, []);
        map.get(c.parent_id).push(c);
      }
    }
    for (const [, replies] of map) {
      replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
    return map;
  }, [all]);

  // Filter + sort. Top-level only; replies follow their parent.
  const display = useMemo(() => {
    if (!all) return null;
    const topLevel = all.filter(c => !c.parent_id);
    const filtered = filter === 'all'
      ? topLevel
      : topLevel.filter(c => {
          const t = c.classification?.final_tier || c.classification?.ai_suggested_tier;
          return t === filter;
        });
    const sorted = [...filtered];
    if (sort === 'quality') {
      sorted.sort((a, b) => {
        const ta = a.classification?.final_tier || a.classification?.ai_suggested_tier || 'fog';
        const tb = b.classification?.final_tier || b.classification?.ai_suggested_tier || 'fog';
        const ra = TIER_RANK[ta] ?? 99;
        const rb = TIER_RANK[tb] ?? 99;
        if (ra !== rb) return ra - rb;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return sorted;
  }, [all, filter, sort]);

  // ─── Edit / delete handlers ─────────────────────────────────────────────
  const handleEditSubmit = useCallback(async (commentId, newBody, newMentions) => {
    if (!viewerMember?.uuid) throw new Error('Not signed in');
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    const resp = await fetch(`${base}/api/comment/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_uuid: viewerMember.uuid,
        body: newBody,
        article_claims: articleClaims,
        mentions: Array.isArray(newMentions) ? newMentions : [],
      }),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Edit failed');
    setLocalOverrides(prev => ({
      ...prev,
      [commentId]: {
        body: data.body,
        mentions: Array.isArray(data.mentions) ? data.mentions : [],
        hardened_at: data.hardened_at,
        malleable: data.malleable,
        classification: {
          ...((all || []).find(c => c.id === commentId)?.classification || {}),
          ...data.classification,
        },
      },
    }));
    setEditingId(null);
  }, [viewerMember, articleClaims, all]);

  const handleDelete = useCallback(async (comment) => {
    if (!viewerMember?.uuid) return;
    if (typeof window !== 'undefined' && !window.confirm(
      'Delete this comment? While the malleability window is open, deletion is allowed and the comment is removed entirely.'
    )) return;
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    try {
      const resp = await fetch(`${base}/api/comment/${comment.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_uuid: viewerMember.uuid }),
      });
      if (!resp.ok && resp.status !== 204) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `Delete failed (${resp.status})`);
      }
      // Soft remove from view immediately.
      setLocalOverrides(prev => ({ ...prev, [comment.id]: { __deleted: true } }));
    } catch (err) {
      if (typeof window !== 'undefined') window.alert('Delete failed: ' + err.message);
    }
  }, [viewerMember]);

  // ─── Render ─────────────────────────────────────────────────────────────
  if (fetched === null) {
    return (
      <div style={{
        padding: 'clamp(40px, 6vw, 60px) clamp(16px, 4vw, 28px)',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--tertiary)',
      }}>
        Loading the conversation…
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <TopologyBar
        comments={all || []}
        activeFilter={filter}
        onFilter={setFilter}
      />
      {/* ControlBar (active-filter indicator + Sort) only renders when
          there are comments to filter or sort. With zero comments, the
          topology bar's empty-state panel carries everything. */}
      {(all || []).length > 0 && (
        <ControlBar
          activeFilter={filter}
          onFilter={setFilter}
          sort={sort}
          onSort={setSort}
        />
      )}

      <div style={{
        padding: 'clamp(16px, 3vw, 24px) clamp(14px, 3vw, 20px) clamp(40px, 6vw, 60px)',
      }}>
        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fff0e8',
            border: '1px solid #c46028',
            borderLeft: '3px solid #7C2C08',
            borderRadius: 4,
            fontFamily: 'var(--font-reading)',
            fontSize: 13,
            color: '#7C2C08',
            marginBottom: 16,
          }}>
            Could not load comments: {error}
          </div>
        )}

        {/* Empty-state in the feed area only fires when a tier filter is
            active and matched zero comments. The all=0 case is handled by
            the topology bar's empty-state panel above; we don't duplicate
            it here. */}
        {display && display.length === 0 && filter !== 'all' && (
          <div style={{
            padding: 'clamp(40px, 6vw, 60px) 20px',
            textAlign: 'center',
            fontFamily: 'var(--font-reading)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--tertiary)',
          }}>
            No {TIER_BY_KEY[filter]?.name || filter} comments yet.
          </div>
        )}

        {display && display.flatMap(c => {
          if (localOverrides[c.id]?.__deleted) return [];
          const nodes = [];
          if (editingId === c.id) {
            nodes.push(
              <EditOverlay
                key={c.id}
                comment={c}
                onCancel={() => setEditingId(null)}
                onSubmit={(newBody, newMentions) => handleEditSubmit(c.id, newBody, newMentions)}
              />
            );
          } else {
            nodes.push(
              <CommentCard
                key={c.id}
                comment={c}
                viewerMember={viewerMember}
                onEdit={c.is_own ? () => setEditingId(c.id) : null}
                onDelete={c.is_own ? () => handleDelete(c) : null}
                onReply={onReply}
                onNominationSubmitted={handleNominationSubmitted}
              />
            );
          }
          // Render replies (chronological, indented) under this top-level
          // comment. A deleted reply (local soft-delete) drops out the
          // same way top-level deletions do.
          const replies = repliesByParent.get(c.id) || [];
          for (const r of replies) {
            if (localOverrides[r.id]?.__deleted) continue;
            if (editingId === r.id) {
              nodes.push(
                <EditOverlay
                  key={r.id}
                  comment={r}
                  onCancel={() => setEditingId(null)}
                  onSubmit={(newBody, newMentions) => handleEditSubmit(r.id, newBody, newMentions)}
                />
              );
            } else {
              nodes.push(
                <CommentCard
                  key={r.id}
                  comment={r}
                  viewerMember={viewerMember}
                  onEdit={r.is_own ? () => setEditingId(r.id) : null}
                  onDelete={r.is_own ? () => handleDelete(r) : null}
                  onNominationSubmitted={handleNominationSubmitted}
                  indented
                />
              );
            }
          }
          return nodes;
        })}
      </div>
    </div>
  );
}

// ─── Shared button styles ────────────────────────────────────────────────
const btnPrimary = {
  padding: '10px 22px',
  background: 'var(--ink)',
  color: 'var(--cream)',
  border: 'none',
  borderRadius: 4,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  appearance: 'none',
};

const btnOutline = {
  padding: '10px 18px',
  background: 'transparent',
  color: 'var(--ink)',
  border: '1px solid var(--ink)',
  borderRadius: 4,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  appearance: 'none',
};

const btnMicro = {
  padding: '4px 10px',
  background: 'var(--paper)',
  color: 'var(--secondary)',
  border: '1px solid var(--wood-edge)',
  borderRadius: 3,
  fontFamily: "'DM Mono', monospace",
  fontSize: 10,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  appearance: 'none',
  font: 'inherit',
  transition: 'all 0.15s',
};

const btnMicroDanger = {
  ...btnMicro,
  color: '#7C2C08',
  borderColor: 'rgba(124, 44, 8, 0.32)',
};
