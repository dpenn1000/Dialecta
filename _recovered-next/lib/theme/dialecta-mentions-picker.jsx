/**
 * dialecta-mentions-picker.jsx
 *
 * Autocomplete dropdown for @mentions in the comment composer. Renders
 * below the parent textarea (not floating near the caret) for v1 to
 * avoid the textarea-caret-positioning headaches that contenteditable
 * solves but at higher implementation cost. Trade: less Twitter-like,
 * more reliable across mobile keyboards and browser quirks.
 *
 * Owned state: none. The parent (ComposeStage in dialecta-private-draft)
 * controls visibility, query, results, loading, and active index. This
 * component is a pure render + click handler.
 *
 * Props:
 *   query       string                 the current @-token text (without @)
 *   results     [{ ghost_member_id, display_name, color, secondaryColor,
 *                  archetype, ... }]   matches from /api/profile/_list?q=
 *   loading     boolean                fetch in flight
 *   activeIdx   number                 keyboard-highlighted index for Enter
 *   onSelect    (member) => void       called when user clicks or hits Enter
 */

import React from 'react';

const T = {
  bgPrimary:    '#f7f2e8',
  bgSecondary:  '#efe8da',
  bgWhite:      '#ffffff',
  textPrimary:  '#1c1814',
  textSecondary:'#5a5248',
  textTertiary: '#7a7068',
  borderLight:  '#e8e0d0',
  borderMedium: '#d8ceb8',
  amber:        '#b8862e',
  fontBody:     "'DM Sans', system-ui, sans-serif",
  fontMono:     "'DM Mono', 'Courier New', monospace",
  fontReading:  "'Source Serif 4', Georgia, serif",
};

function initialsFor(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '?';
}

export default function MentionsPicker({ query, results, loading, activeIdx, onSelect }) {
  const showEmpty = !loading && results.length === 0;

  return (
    <div style={{
      marginTop: -1,
      border: `1px solid ${T.borderMedium}`,
      borderTop: 'none',
      borderRadius: '0 0 4px 4px',
      background: T.bgWhite,
      maxHeight: 280,
      overflowY: 'auto',
      boxShadow: '0 6px 18px rgba(28,24,20,0.12)',
    }}>
      <div style={{
        padding: '8px 12px',
        borderBottom: `1px solid ${T.borderLight}`,
        background: T.bgSecondary,
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: T.textTertiary,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ color: T.amber }}>@{query}</span>
        {loading && <span style={{ fontStyle: 'italic', color: T.textTertiary, textTransform: 'none', letterSpacing: 0 }}>searching…</span>}
        <span style={{ marginLeft: 'auto', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: T.textTertiary }}>
          ↑↓ to move · Enter to pick · Esc to cancel
        </span>
      </div>

      {showEmpty ? (
        <div style={{
          padding: '14px 12px',
          fontFamily: T.fontReading,
          fontSize: 13,
          fontStyle: 'italic',
          color: T.textTertiary,
          textAlign: 'center',
        }}>
          No contributors match @{query}
        </div>
      ) : (
        results.map((m, i) => {
          const isActive = i === activeIdx;
          const color = m.color || T.amber;
          const secondaryColor = m.secondaryColor || color;
          return (
            <button
              key={m.ghost_member_id}
              type="button"
              onMouseDown={(e) => {
                // Prevent textarea blur before onClick fires.
                e.preventDefault();
              }}
              onClick={() => onSelect(m)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '10px 12px',
                background: isActive ? T.bgSecondary : 'transparent',
                border: 'none',
                borderBottom: i < results.length - 1 ? `1px solid ${T.borderLight}` : 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: 'inherit',
              }}>
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: `linear-gradient(135deg, ${color}, ${secondaryColor})`,
                color: T.bgPrimary,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: T.fontMono,
                fontSize: 10, fontWeight: 600,
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {m.avatar_url ? (
                  <img
                    src={m.avatar_url}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : initialsFor(m.display_name)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Handle is the canonical anchor (gets inserted as the
                    @-token); display_name + archetype sit underneath as
                    secondary identification. Falls back to display_name
                    if a result lacks a handle (edge-case profile rows
                    pre-migration 029). */}
                <div style={{
                  fontFamily: T.fontBody,
                  fontSize: 13,
                  fontWeight: 500,
                  color: T.textPrimary,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  @{m.handle || m.display_name}
                </div>
                <div style={{
                  fontFamily: T.fontMono,
                  fontSize: 9,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: T.textTertiary,
                  marginTop: 2,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {m.display_name}{m.archetype?.label ? ' · ' + m.archetype.label : ''}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
