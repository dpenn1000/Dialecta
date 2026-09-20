/**
 * dialecta-nomination-panel.jsx
 *
 * The community reclassification surface. Renders inline at the bottom of
 * each non-Breach comment card. One member's structured judgment that this
 * comment belongs in a different tier than the engine assigned. Implements
 * Stage 3 of Dialecta_Discourse_Layer_UX.md (lines 177-258) and the third
 * leg of the three-input final-tier model from
 * Dialecta_Article_Editorial_Template.md (lines 109-117).
 *
 * Three states:
 *   1. Closed (default)        — small trigger row: "Nominate for
 *                                 reclassification →" + count chip if any
 *   2. Composing               — 3-step inline panel (tier + reason + note)
 *   3. Submitted / receipt     — terra-bar strip showing what the viewer
 *                                 nominated. Click to revise.
 *
 * If the viewer has already nominated this comment (passed in via
 * `nominations.viewer_nomination`), the panel renders in receipt mode by
 * default. Click to revise.
 *
 * Visual register:
 *   - Brass + paper for the composing state (engine voice)
 *   - Terra left bar for the receipt (community action) — distinguishes
 *     it from the brass contrast strip on the comment card itself
 *   - Breach selection triggers a dark warning panel before submit
 *
 * Props:
 *   comment       — comment shape from /api/comments
 *   viewerMember  — { uuid, ... } | null
 *   onSubmitted   — (resolution) => void; called after a successful POST
 *                   so the parent feed can refresh and pick up any
 *                   final_tier shift
 */

import { useMemo, useState } from 'react';
import { TIERS, TIER_BY_KEY, TierIcon } from './dialecta-tier-badge.jsx';
import { RESPONSE_REASONS } from './dialecta-private-draft.jsx';

// ─── API base helper ─────────────────────────────────────────────────────
function apiBase() {
  if (typeof window === 'undefined') return '';
  const url = window.__DIALECTA_API_URL__;
  return url ? String(url).replace(/\/$/, '') : '';
}

// Tiers in spec order: the six discourse tiers above the Pact-violation
// divider, then Breach below it. Matches the Discourse Layer UX spec
// (lines 199-205).
const NON_BREACH_TIERS = TIERS.filter(t => t.key !== 'breach');
const BREACH_TIER      = TIER_BY_KEY['breach'];

const NOTE_MAX = 140;

// ─── Trigger row (closed state) ──────────────────────────────────────────
function TriggerRow({ total, onOpen, viewerNomination }) {
  return (
    <div style={{
      marginTop: 10,
      paddingTop: 10,
      borderTop: '1px dashed var(--wood-edge)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <button
        onClick={onOpen}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: viewerNomination
            ? 'var(--terra, #8c4a2f)'
            : 'var(--brass-mid, #b8862e)',
          background: 'transparent',
          border: 'none',
          padding: '2px 0',
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 3,
          textDecorationThickness: 1,
          appearance: 'none',
          font: 'inherit',
        }}
      >
        {viewerNomination ? 'Your nomination →' : 'Nominate for reclassification →'}
      </button>
      {total > 0 && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.08em',
          color: 'var(--secondary)',
        }}>
          {total} {total === 1 ? 'nomination' : 'nominations'}
        </span>
      )}
    </div>
  );
}

// ─── Receipt strip (after submission, or when viewer has prior nomination) ──
function ReceiptStrip({ viewerNomination, total, onRevise }) {
  const tier = TIER_BY_KEY[viewerNomination.target_tier];
  const reason = RESPONSE_REASONS.find(r => r.key === viewerNomination.reason_key);
  return (
    <div style={{
      marginTop: 10,
      padding: '12px 14px 12px 14px',
      borderLeft: '3px solid var(--terra, #8c4a2f)',
      background: 'rgba(140, 74, 47, 0.05)',
      borderRadius: '0 4px 4px 0',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 6,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--terra, #8c4a2f)',
        }}>
          You nominated
        </div>
        {total > 1 && (
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            color: 'var(--tertiary)',
          }}>
            {total} total
          </div>
        )}
      </div>
      <div style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: reason ? 6 : 0,
      }}>
        {tier && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px 3px 7px',
            borderRadius: 4,
            background: `linear-gradient(180deg, ${tier.top}, ${tier.bot})`,
            color: tier.text,
            border: `1px solid ${tier.border}`,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            <TierIcon tierKey={tier.key} size={11} />
            <span>{tier.short}</span>
          </span>
        )}
        {reason && (
          <span style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 12,
            color: 'var(--secondary)',
            fontStyle: 'italic',
            lineHeight: 1.45,
          }}>
            "{reason.label}"
          </span>
        )}
      </div>
      {viewerNomination.note && (
        <p style={{
          margin: '6px 0 0',
          fontFamily: 'var(--font-reading)',
          fontSize: 12,
          lineHeight: 1.5,
          color: 'var(--body)',
        }}>
          {viewerNomination.note}
        </p>
      )}
      <button
        onClick={onRevise}
        style={{
          marginTop: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: 'var(--brass-mid, #b8862e)',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        Revise
      </button>
    </div>
  );
}

// ─── Composing panel (3 steps, inline) ───────────────────────────────────
function ComposingPanel({ comment, viewerNomination, busy, error, onSubmit, onCancel }) {
  const cls = comment.classification || {};
  const aiTier = cls.ai_suggested_tier;
  const currentFinal = cls.final_tier || cls.self_declared_tier || aiTier;

  const [targetTier, setTargetTier] = useState(viewerNomination?.target_tier || null);
  const [reasonKey,  setReasonKey]  = useState(viewerNomination?.reason_key  || null);
  const [note,       setNote]       = useState(viewerNomination?.note || '');

  const canSubmit = !!targetTier && !!reasonKey && !busy;
  const isBreachSelected = targetTier === 'breach';

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      target_tier: targetTier,
      reason_key:  reasonKey,
      note:        note.trim() || null,
    });
  }

  return (
    <div style={{
      marginTop: 10,
      padding: 'clamp(14px, 2vw, 18px)',
      background: 'rgba(154, 92, 40, 0.04)',
      border: '1px solid var(--wood-edge)',
      borderRadius: 4,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 10,
        marginBottom: 12,
        flexWrap: 'wrap',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--terra, #8c4a2f)',
        }}>
          {viewerNomination ? 'Revise your nomination' : 'Nominate for reclassification'}
        </div>
        <button
          onClick={onCancel}
          disabled={busy}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--tertiary)',
            background: 'transparent',
            border: 'none',
            padding: 0,
            cursor: busy ? 'wait' : 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Cancel
        </button>
      </div>

      {/* Step 1 — Tier picker */}
      <SectionLabel n="1" text="Suggest a tier" />
      <p style={{
        margin: '0 0 10px',
        fontFamily: 'var(--font-reading)',
        fontSize: 12,
        lineHeight: 1.55,
        color: 'var(--secondary)',
        fontStyle: 'italic',
      }}>
        The engine read this as <strong style={{ fontStyle: 'normal' }}>{TIER_BY_KEY[currentFinal]?.name || currentFinal}</strong>. Where do you think it belongs?
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 14,
      }}>
        {NON_BREACH_TIERS.map(t => (
          <TierChoiceChip
            key={t.key}
            tier={t}
            selected={targetTier === t.key}
            onSelect={() => setTargetTier(t.key)}
            disabled={busy}
          />
        ))}
      </div>

      {/* Pact violation divider + Breach option */}
      <div style={{
        position: 'relative',
        textAlign: 'center',
        margin: '0 0 10px',
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(to right, transparent, var(--terra, #8c4a2f), transparent)',
        }} />
        <span style={{
          position: 'relative',
          padding: '0 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          letterSpacing: '0.20em',
          textTransform: 'uppercase',
          color: 'var(--terra, #8c4a2f)',
          background: 'rgba(154, 92, 40, 0.04)',
        }}>
          Pact violation
        </span>
      </div>
      <div style={{
        display: 'flex',
        marginBottom: 14,
      }}>
        <TierChoiceChip
          tier={BREACH_TIER}
          selected={targetTier === 'breach'}
          onSelect={() => setTargetTier('breach')}
          disabled={busy}
        />
      </div>

      {/* Breach warning panel (only when Breach selected) */}
      {isBreachSelected && (
        <div style={{
          marginBottom: 14,
          padding: 14,
          background: '#380808',
          color: '#f5dfa0',
          borderLeft: '3px solid var(--terra, #8c4a2f)',
          borderRadius: '0 4px 4px 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--brass-pale, #f5dfa0)',
            marginBottom: 8,
          }}>
            Before you nominate Breach
          </div>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-reading)',
            fontSize: 13,
            lineHeight: 1.55,
          }}>
            A Breach nomination signals a personal attack, not a disagreement. If enough readers agree, the comment will be suppressed with a visible explanation. The original commenter will see the nominations and reasons. This is a serious, considered action — not a tool for ending arguments.
          </p>
        </div>
      )}

      {/* Step 2 — Reason picker */}
      <SectionLabel n="2" text="Why?" />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 14,
      }}>
        {RESPONSE_REASONS.map(r => (
          <ReasonRow
            key={r.key}
            reason={r}
            selected={reasonKey === r.key}
            onSelect={() => setReasonKey(r.key)}
            disabled={busy}
          />
        ))}
      </div>

      {/* Step 3 — Optional note */}
      <SectionLabel n="3" text="Add a note" optional />
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, NOTE_MAX))}
        rows={2}
        placeholder="Optional. 140 characters."
        disabled={busy}
        style={{
          width: '100%',
          minHeight: 56,
          marginTop: 4,
          padding: '8px 10px',
          fontFamily: 'var(--font-reading)',
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--body)',
          background: 'var(--paper, #fbf6ea)',
          border: '1px solid var(--wood-edge)',
          borderRadius: 4,
          outline: 'none',
          resize: 'vertical',
        }}
      />
      <div style={{
        marginTop: 4,
        display: 'flex',
        justifyContent: 'flex-end',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--tertiary)',
      }}>
        {note.length} / {NOTE_MAX}
      </div>

      {error && (
        <p style={{
          marginTop: 8,
          fontFamily: 'var(--font-reading)',
          fontSize: 12,
          color: '#7C2C08',
        }}>{error}</p>
      )}

      {/* Submit */}
      <div style={{
        marginTop: 12,
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            padding: '8px 18px',
            background: canSubmit ? 'var(--ink)' : 'rgba(28,24,20,0.3)',
            color: 'var(--cream)',
            border: 'none',
            borderRadius: 4,
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.04em',
            cursor: canSubmit ? 'pointer' : (busy ? 'wait' : 'not-allowed'),
            appearance: 'none',
          }}
        >
          {busy ? 'Submitting…' : (viewerNomination ? 'Update nomination' : 'Submit nomination')}
        </button>
      </div>
    </div>
  );
}

// ─── Step label (Brass mono "1 ·" eyebrow) ───────────────────────────────
function SectionLabel({ n, text, optional }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--brass-mid, #b8862e)',
      marginBottom: 6,
    }}>
      <span style={{ marginRight: 6 }}>{n} ·</span>{text}
      {optional && (
        <span style={{
          marginLeft: 6,
          color: 'var(--tertiary)',
          fontWeight: 400,
        }}>(optional)</span>
      )}
    </div>
  );
}

// ─── Tier choice chip ────────────────────────────────────────────────────
function TierChoiceChip({ tier, selected, onSelect, disabled }) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      title={tier.meaning}
      aria-pressed={selected}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 11px 5px 9px',
        borderRadius: 4,
        background: `linear-gradient(180deg, ${tier.top}, ${tier.bot})`,
        color: tier.text,
        border: `1px solid ${tier.border}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: selected
          ? '0 1px 3px rgba(28,24,20,0.18), inset 0 0 0 1px var(--brass-bright, #d4a84a)'
          : 'none',
        transition: 'box-shadow 0.15s ease',
        appearance: 'none',
        font: 'inherit',
        whiteSpace: 'nowrap',
      }}
    >
      <TierIcon tierKey={tier.key} size={11} />
      <span>{tier.short}</span>
    </button>
  );
}

// ─── Reason row (radio-like) ─────────────────────────────────────────────
function ReasonRow({ reason, selected, onSelect, disabled }) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        background: selected ? 'rgba(245, 223, 160, 0.20)' : 'transparent',
        border: `1px solid ${selected ? 'var(--brass-mid, #b8862e)' : 'var(--wood-edge)'}`,
        borderRadius: 4,
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        appearance: 'none',
        font: 'inherit',
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <span style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        border: `2px solid ${selected ? 'var(--brass-bright, #ecb438)' : 'var(--wood-edge)'}`,
        background: selected ? 'var(--brass-warm, #d4a84a)' : 'transparent',
        flexShrink: 0,
        transition: 'all 0.12s ease',
      }} />
      <span style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 13,
        lineHeight: 1.4,
        color: selected ? 'var(--ink)' : 'var(--body)',
      }}>
        {reason.label}
      </span>
    </button>
  );
}

// ─── Main exported component ─────────────────────────────────────────────
export default function NominationPanel({ comment, viewerMember, onSubmitted }) {
  const noms = comment.nominations || { total: 0, tallies: {}, viewer_nomination: null };
  const viewerNomination = noms.viewer_nomination;
  // Start in receipt mode if viewer already nominated; closed otherwise.
  const [mode, setMode] = useState(viewerNomination ? 'receipt' : 'closed');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Hide the panel entirely for signed-out viewers, own comments, and
  // Breach-tier comments. Per Discourse_Layer_UX.md line 181: "The
  // nomination control appears in every comment footer (except Breach,
  // which cannot be escalated further)." Disagreement with a Breach call
  // is an admin appeal path, not a community re-vote.
  if (!viewerMember?.uuid) return null;
  if (comment.is_own) return null;
  const finalTier = comment.classification?.final_tier
                  || comment.classification?.self_declared_tier
                  || comment.classification?.ai_suggested_tier;
  if (finalTier === 'breach') return null;

  async function handleSubmit({ target_tier, reason_key, note }) {
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch(`${apiBase()}/api/comment/${comment.id}/nominate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_uuid: viewerMember.uuid,
          target_tier,
          reason_key,
          note,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Nomination failed');
      setMode('receipt');
      if (onSubmitted) onSubmitted(data.resolution);
    } catch (err) {
      setError(err.message || 'Nomination failed.');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'closed') {
    return (
      <TriggerRow
        total={noms.total}
        viewerNomination={viewerNomination}
        onOpen={() => setMode('composing')}
      />
    );
  }

  if (mode === 'receipt' && viewerNomination) {
    return (
      <ReceiptStrip
        viewerNomination={viewerNomination}
        total={noms.total}
        onRevise={() => setMode('composing')}
      />
    );
  }

  return (
    <ComposingPanel
      comment={comment}
      viewerNomination={viewerNomination}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
      onCancel={() => setMode(viewerNomination ? 'receipt' : 'closed')}
    />
  );
}
