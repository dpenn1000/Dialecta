/**
 * dialecta-private-draft.jsx
 *
 * The Private Draft engine: the comment compose ritual.
 *
 * Nine stages, mirroring the canonical s11 Private Draft Mode prototype
 * (Private Draft Mode/dialecta-s11-private-draft-mode.jsx in OneDrive),
 * modernized for the current Dialecta design system: paper-grain cream
 * cards, wood-edge frames, brass accents. Mobile-aware from day one.
 *
 *   COMPOSE     write the draft. Min 8 words to advance.
 *   CONSENT     60-min malleability briefing.
 *   REFLECTING  8s wait while /api/classify runs. ReflectionBar shows.
 *   REFLECTION  four-slot card: claim found, strength, shape, suggested tier.
 *               12s lock before "Continue" activates (sit with this).
 *   DECLARE     tier grid for self-declaration. AI suggestion ringed pale.
 *   STAGE25     three-way choice: Accept / Amend / Respond-for-Record.
 *   RESPOND     400-char textarea for reasoned disagreement.
 *   FINAL       60-min briefing before publish.
 *   POSTED      live malleable card with countdown, edit/delete buttons.
 *
 * Real wait values per spec (audit-confirmed):
 *   Reflection wait:  8 seconds
 *   Stage 2.5 lock:   12 seconds
 *   Malleability:     60 minutes
 *
 * API integration:
 *   Stage REFLECTING → POST /api/classify (body + article_claims) → analysis
 *   Stage POSTED     → POST /api/comment  (member_uuid + body + self_declared)
 *                      Endpoint re-classifies server-side; the canonical
 *                      classification is the one stored, not the one the
 *                      user saw at Stage 1.
 *
 * Borderline handling: when /api/classify returns borderline_flag=true, the
 * Reflection card shows a Growth Frame coaching prompt naming the
 * alternative read ("close to Forum, one move would push it"). The flag
 * never surfaces as a public label on the posted card.
 *
 * Props:
 *   article    { id, slug, title, claims? }   from post.hbs data-* attrs
 *   member     { uuid, name, email }          from {{@member}} via post.hbs
 *   onPosted   (comment) => void              fires when a comment lands so
 *                                              the parent (Discourse Layer
 *                                              feed) can prepend it.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import ReflectionBar from './dialecta-reflection-bar.jsx';
import TierBadge, { TIERS, TIER_BY_KEY } from './dialecta-tier-badge.jsx';
import MentionsPicker from './dialecta-mentions-picker.jsx';

// ─── Stage constants ─────────────────────────────────────────────────────
const STAGES = {
  COMPOSE:    'compose',
  CONSENT:    'consent',
  REFLECTING: 'reflecting',
  REFLECTION: 'reflection',
  DECLARE:    'declare',
  STAGE25:    'stage25',
  RESPOND:    'respond',
  FINAL:      'final',
  POSTED:     'posted',
};

// ─── Real wait architecture (audit-confirmed) ────────────────────────────
const WAIT_REFLECTION_MS = 8000;
const WAIT_STAGE25_MS    = 12000;
const MALLEABILITY_MS    = 60 * 60 * 1000;

// ─── Compose validation ──────────────────────────────────────────────────
const MIN_DRAFT_WORDS    = 8;
const RESPONSE_NOTE_MIN  = 20;
const RESPONSE_NOTE_MAX  = 400;

// ─── Reflection wait phases ──────────────────────────────────────────────
// Module-level const per ReflectionBar's fuse-on-init contract: passing a
// stable reference is required, otherwise the bar restarts on parent rerender.
const REFLECTION_PHASES = [
  { at: 0,    main: 'The engine is reading your draft', sub: 'Looking for the claim inside it.' },
  { at: 2800, main: 'Considering specificity and shape', sub: 'How clear is the proposition?' },
  { at: 5600, main: 'Weighing the engagement',           sub: 'Are you in the article, or near it?' },
];

// ─── API base URL helper ─────────────────────────────────────────────────
// The theme is served by Ghost (Magic Pages) but the API runs on Vercel.
// Mirrors the pattern in index.jsx and dialecta-discourse-layer.jsx:
// reads the canonical base from window.__DIALECTA_API_URL__ (set in
// default.hbs) and falls back to relative for local dev.
function apiBase() {
  if (typeof window === 'undefined') return '';
  const url = window.__DIALECTA_API_URL__;
  return url ? String(url).replace(/\/$/, '') : '';
}

// ─── Reasons (Stage 2.5 Respond-for-Record + nomination panel) ───────────
// Verbatim from Article Editorial Template + Discourse Layer UX spec.
// Reading through these is itself a brief lesson in what the platform values.
export const RESPONSE_REASONS = [
  { key: 'specific_claim',  label: 'Contains a specific, well-supported claim' },
  { key: 'engages_content', label: 'Engages directly with the article or a prior comment' },
  { key: 'new_idea',        label: 'Introduces a genuinely new idea' },
  { key: 'emotional_only',  label: 'Makes a strong emotional argument without a supporting claim' },
  { key: 'group_signal',    label: 'Uses language that signals group membership over argument' },
  { key: 'unclear',         label: "Is unclear: I can't identify the core position" },
  { key: 'other',           label: 'Other' },
];

// ─── Word count helper ───────────────────────────────────────────────────
function wordCount(s) {
  return (s || '').trim().split(/\s+/).filter(Boolean).length;
}

// ─── Section label (DM Mono small caps eyebrow) ──────────────────────────
function SectionLabel({ children, color = 'var(--brass-mid)', mb = 10 }) {
  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      marginBottom: mb,
      fontWeight: 400,
    }}>{children}</div>
  );
}

// ─── Stage rail (brass dots on wood-edge rail) ───────────────────────────
function StageRail({ stage }) {
  const steps = [
    { key: 'draft',    label: 'Draft',        active: [STAGES.COMPOSE, STAGES.CONSENT].includes(stage) },
    { key: 'reflect',  label: 'Reflection',   active: [STAGES.REFLECTING, STAGES.REFLECTION].includes(stage) },
    { key: 'declare',  label: 'Self-declare', active: stage === STAGES.DECLARE },
    { key: 'stage25',  label: 'Stage 2.5',    active: [STAGES.STAGE25, STAGES.RESPOND, STAGES.FINAL].includes(stage) },
    { key: 'posted',   label: 'Posted',       active: stage === STAGES.POSTED },
  ];
  const passedIdx = steps.findIndex(s => s.active);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      padding: '10px clamp(12px, 3vw, 20px)',
      borderBottom: '1px solid var(--wood-edge)',
      background: 'rgba(154, 92, 40, 0.04)',
      overflowX: 'auto',
    }}>
      {steps.map((s, i) => {
        const passed = i < passedIdx;
        const active = s.active;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: active
                ? 'var(--brass-bright)'
                : passed
                  ? 'var(--brass-mid)'
                  : 'rgba(154, 92, 40, 0.28)',
              boxShadow: active
                ? '0 0 0 2px rgba(245, 223, 160, 0.45)'
                : 'none',
              transition: 'all 0.3s ease',
            }} />
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: active ? 'var(--ink)' : passed ? 'var(--secondary)' : 'var(--tertiary)',
              fontWeight: active ? 500 : 400,
            }}>{s.label}</span>
            {i < steps.length - 1 && (
              <span style={{
                width: 14,
                height: 1,
                background: 'var(--wood-edge)',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Compose stage ───────────────────────────────────────────────────────
function ComposeStage({ article, draft, setDraft, mentions, setMentions, error, onContinue, onCancel }) {
  const wc = wordCount(draft);
  const canAdvance = wc >= MIN_DRAFT_WORDS;

  // ─── Mention picker state ──────────────────────────────────────────────
  // mentionState: null OR { query: 'dani', tokenStart: 12 }
  // tokenStart is the index of the '@' character in `draft`.
  const [mentionState, setMentionState]       = useState(null);
  const [mentionResults, setMentionResults]   = useState([]);
  const [mentionLoading, setMentionLoading]   = useState(false);
  const [mentionActiveIdx, setMentionActiveIdx] = useState(0);

  const textareaRef = useRef(null);
  const debounceRef = useRef(null);
  // Monotonic request id so out-of-order autocomplete responses don't clobber
  // the most recent results.
  const fetchIdRef  = useRef(0);

  // Detect an in-progress @-token immediately before the caret. Returns
  // { query, tokenStart } when the caret sits inside an @-token, else null.
  // The token must be preceded by whitespace or the start of the body so
  // we don't fire on email addresses (alice@example.com) or mid-word @s.
  // Allowed chars match the handle format (a-z, 0-9, _, -); case-insensitive
  // capture so users typing @Daniel still match handle "daniel-pennington".
  function detectMentionToken(text, caret) {
    const slice = text.slice(0, caret);
    const m = slice.match(/(?:^|\s)@([a-z0-9_-]*)$/i);
    if (!m) return null;
    const query = m[1];
    const tokenStart = caret - query.length - 1;
    return { query, tokenStart };
  }

  function pruneStaleMentions(nextDraft, currentMentions) {
    if (!currentMentions || currentMentions.length === 0) return currentMentions;
    return currentMentions.filter((m) => {
      // Look for the handle's @-token first (post-1.0); fall back to
      // display_name for any legacy mention objects without a handle.
      const tag = '@' + (m.handle || m.display_name);
      return nextDraft.includes(tag);
    });
  }

  function handleChange(e) {
    const nextDraft = e.target.value;
    const caret = e.target.selectionStart || 0;
    setDraft(nextDraft);
    setMentions((prev) => pruneStaleMentions(nextDraft, prev));

    const tok = detectMentionToken(nextDraft, caret);
    setMentionState(tok);
    setMentionActiveIdx(0);

    clearTimeout(debounceRef.current);
    if (tok) {
      debounceRef.current = setTimeout(() => searchMembers(tok.query), 180);
    } else {
      setMentionResults([]);
    }
  }

  async function searchMembers(query) {
    if (!query || query.length === 0) {
      setMentionResults([]);
      return;
    }
    setMentionLoading(true);
    const reqId = ++fetchIdRef.current;
    try {
      const resp = await fetch(`${apiBase()}/api/profile/_list?q=${encodeURIComponent(query)}`);
      if (reqId !== fetchIdRef.current) return;
      const data = await resp.json();
      setMentionResults(Array.isArray(data?.contributors) ? data.contributors : []);
    } catch (_) {
      if (reqId !== fetchIdRef.current) return;
      setMentionResults([]);
    } finally {
      if (reqId === fetchIdRef.current) setMentionLoading(false);
    }
  }

  function handleSelectMention(member) {
    if (!mentionState || !member) return;
    const { tokenStart, query } = mentionState;
    const before = draft.slice(0, tokenStart);
    const afterIdx = tokenStart + 1 + query.length;
    const after = draft.slice(afterIdx);
    // Insert the canonical handle token (lowercase, no spaces); fall back
    // to display_name only if the result has no handle (edge case for
    // pre-1.0 profile rows).
    const tokenText  = member.handle || member.display_name;
    const insertText = '@' + tokenText + ' ';
    const nextDraft = before + insertText + after;
    setDraft(nextDraft);
    setMentions((prev) => {
      if (prev.some((m) => m.member_id === member.ghost_member_id)) {
        return pruneStaleMentions(nextDraft, prev);
      }
      const next = [...prev, {
        member_id:    member.ghost_member_id,
        handle:       member.handle || null,
        display_name: member.display_name,
      }];
      return pruneStaleMentions(nextDraft, next);
    });
    setMentionState(null);
    setMentionResults([]);

    // Restore focus + put caret right after the inserted token + space.
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        const newCaret = before.length + insertText.length;
        ta.focus();
        try { ta.setSelectionRange(newCaret, newCaret); } catch (_) { /* old IE etc */ }
      }
    });
  }

  function handleKeyDown(e) {
    // When the picker is open and has results, intercept nav keys.
    if (mentionState && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionActiveIdx((i) => Math.min(i + 1, mentionResults.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionActiveIdx((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectMention(mentionResults[mentionActiveIdx]);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(mentionResults[mentionActiveIdx]);
        return;
      }
    }
    if (mentionState && e.key === 'Escape') {
      e.preventDefault();
      setMentionState(null);
      setMentionResults([]);
    }
  }

  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      {/* Article stub */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--paper)',
        border: '1px solid var(--wood-edge)',
        borderRadius: 6,
        marginBottom: 18,
      }}>
        <SectionLabel mb={4}>Responding to</SectionLabel>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(15px, 1.4vw + 10px, 18px)',
          fontWeight: 500,
          color: 'var(--ink)',
          lineHeight: 1.2,
        }}>{article.title}</div>
      </div>

      {/* Compose paper inside wood frame */}
      <SectionLabel>Your comment · private draft</SectionLabel>
      <div className="dialecta-paper dialecta-wood-frame" style={{
        padding: '20px 22px',
      }}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Write what you actually think, the way you actually think it. Type @ to mention a contributor."
          rows={6}
          style={{
            width: '100%',
            minHeight: 180,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            background: 'transparent',
            fontFamily: 'var(--font-reading)',
            fontSize: 'clamp(15px, 1vw + 10px, 17px)',
            lineHeight: 1.7,
            color: 'var(--body)',
          }}
        />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid var(--wood-edge)',
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--tertiary)',
            letterSpacing: '0.06em',
          }}>
            {wc} {wc === 1 ? 'word' : 'words'}
            {mentions && mentions.length > 0 && ` · ${mentions.length} mention${mentions.length === 1 ? '' : 's'}`}
            {' · saved locally'}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--tertiary)',
            letterSpacing: '0.06em',
            fontStyle: 'italic',
          }}>
            no one sees this yet
          </span>
        </div>
      </div>

      {/* Mention picker. Renders directly under the textarea wrapper so
          there's no caret-positioning math to maintain. Visible only while
          the caret sits inside an in-progress @-token. */}
      {mentionState && (
        <MentionsPicker
          query={mentionState.query}
          results={mentionResults}
          loading={mentionLoading}
          activeIdx={mentionActiveIdx}
          onSelect={handleSelectMention}
        />
      )}

      {error && (
        <div style={{
          marginTop: 14,
          padding: '10px 14px',
          background: '#fff0e8',
          border: '1px solid #c46028',
          borderLeft: '3px solid #7C2C08',
          borderRadius: 4,
          fontFamily: 'var(--font-reading)',
          fontSize: 13,
          color: '#7C2C08',
        }}>
          <div>{typeof error === 'object' && error !== null ? error.message : error}</div>
          {typeof error === 'object' && error !== null && error.action && (
            <a href={error.action.url} style={{
              display: 'inline-block',
              marginTop: 8,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#7C2C08',
              textDecoration: 'none',
              padding: '5px 11px',
              background: 'rgba(124,44,8,0.1)',
              borderRadius: 3,
              border: '1px solid #c46028',
            }}>{error.action.label} →</a>
          )}
        </div>
      )}

      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--tertiary)',
        lineHeight: 1.6,
        margin: '16px 4px',
      }}>
        When you're ready, the engine will read what you've written and describe what it's doing. Not judge it. You'll see what it found before anyone else does.
      </p>

      <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
        <button onClick={onCancel} style={btnOutline}>Cancel</button>
        <button
          onClick={onContinue}
          disabled={!canAdvance}
          style={{
            ...btnPrimary,
            flex: 1,
            minWidth: 180,
            opacity: canAdvance ? 1 : 0.4,
            cursor: canAdvance ? 'pointer' : 'not-allowed',
          }}
        >
          {canAdvance ? 'Reflect →' : `${MIN_DRAFT_WORDS - wc} more ${MIN_DRAFT_WORDS - wc === 1 ? 'word' : 'words'} to reflect`}
        </button>
      </div>
    </div>
  );
}

// ─── Consent stage (60-min malleability briefing) ────────────────────────
function ConsentStage({ onContinue, onBack }) {
  return (
    <div style={{
      padding: 'clamp(28px, 5vw, 48px) clamp(16px, 4vw, 28px)',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      <div className="dialecta-paper dialecta-wood-frame" style={{
        padding: 'clamp(20px, 3vw, 28px) clamp(20px, 3vw, 28px) clamp(20px, 3vw, 24px)',
      }}>
        <SectionLabel>Before the engine reads your draft</SectionLabel>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(20px, 2vw + 10px, 26px)',
          fontWeight: 500,
          color: 'var(--ink)',
          lineHeight: 1.15,
          marginBottom: 14,
        }}>
          Once posted, your comment is{' '}
          <em className="dialecta-brass" style={{ display: 'inline-block' }}>
            yours permanently.
          </em>
        </h2>
        <div style={{
          height: 2,
          width: 40,
          background: 'var(--brass-mid)',
          marginBottom: 18,
        }} />
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.7,
          color: 'var(--body)',
          marginBottom: 14,
        }}>
          After you post, you have <strong>60 minutes</strong> of free revision. During that hour you can edit, rewrite, or delete what you've written.
        </p>
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.7,
          color: 'var(--body)',
          marginBottom: 20,
        }}>
          After 60 minutes, the comment hardens. It becomes part of the public record. Public refinement of your thinking is treated here as a strength.
        </p>
        <div style={{
          padding: 14,
          background: 'rgba(245, 223, 160, 0.18)',
          borderLeft: '2px solid var(--brass-mid)',
          borderRadius: 4,
          marginBottom: 22,
        }}>
          <SectionLabel mb={4}>The principle</SectionLabel>
          <div style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--body)',
            fontStyle: 'italic',
          }}>
            Slowness is a feature. The wait is not friction: it is ritual. The moment your post becomes permanent is designed to feel earned.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={btnOutline}>Back to draft</button>
          <button onClick={onContinue} style={{ ...btnPrimary, flex: 1, minWidth: 180 }}>
            I understand. Reflect.
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reflecting stage (8s wait, ReflectionBar shows) ─────────────────────
function ReflectingStage({ analysisReady }) {
  return (
    <ReflectionBar
      phases={REFLECTION_PHASES}
      durationMs={WAIT_REFLECTION_MS}
      ready={analysisReady}
      size="comment"
      eyebrow="Stage 1 · Reading"
      readyLabel="Ready"
      readingLabel="Reading"
      holdMessage="The reading has arrived. Sitting with it before showing you."
    />
  );
}

// ─── Reflection stage (the four-slot card) ───────────────────────────────
function ReflectionStage({ analysis, onContinue, locked, lockSecondsLeft }) {
  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <SectionLabel>Stage 1 · The Reflection</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(22px, 2vw + 12px, 28px)',
        fontWeight: 500,
        color: 'var(--ink)',
        lineHeight: 1.12,
        marginBottom: 6,
      }}>
        Here's what the engine{' '}
        <em className="dialecta-brass" style={{ display: 'inline-block' }}>
          noticed.
        </em>
      </h2>
      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 13,
        color: 'var(--secondary)',
        fontStyle: 'italic',
        marginBottom: 20,
        lineHeight: 1.6,
      }}>
        Not a verdict. A description. You'll decide what to do with it.
      </p>

      {/* The four slots, stacked. Each is a distinct sub-section within
          the same paper-and-wood card. Internal hairlines are wood-edge. */}
      <div className="dialecta-paper dialecta-wood-frame" style={{ padding: 0, marginBottom: 16 }}>

        {/* Slot 1 — The claim we found */}
        <div style={{ padding: 'clamp(16px, 2vw + 8px, 22px)', borderBottom: '1px solid var(--wood-edge)' }}>
          <SectionLabel color="var(--brass-warm)">The claim we found</SectionLabel>
          <p style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 'clamp(14px, 1vw + 8px, 15px)',
            lineHeight: 1.65,
            color: 'var(--body)',
            margin: 0,
          }}>
            {analysis.claim_text
              ? <>"{analysis.claim_text}"</>
              : <em style={{ color: 'var(--tertiary)' }}>The engine couldn't identify a specific claim. That's information too.</em>
            }
          </p>
        </div>

        {/* Slot 2 — What this does well (Growth Frame) */}
        {analysis.strength && (
          <div style={{ padding: 'clamp(16px, 2vw + 8px, 22px)', borderBottom: '1px solid var(--wood-edge)' }}>
            <SectionLabel color="var(--brass-warm)">What this does well</SectionLabel>
            <p style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--body)',
              margin: 0,
            }}>{analysis.strength}</p>
          </div>
        )}

        {/* Slot 3 — The shape of it (commenter_message + structured metadata) */}
        <div style={{ padding: 'clamp(16px, 2vw + 8px, 22px)', borderBottom: '1px solid var(--wood-edge)' }}>
          <SectionLabel color="var(--brass-mid)">The shape of it</SectionLabel>
          <p style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 14,
            lineHeight: 1.65,
            color: 'var(--body)',
            margin: '0 0 12px',
          }}>{analysis.commenter_message}</p>
          <div style={{
            display: 'flex',
            gap: 'clamp(10px, 2vw, 16px)',
            flexWrap: 'wrap',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--tertiary)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            <span>SPECIFICITY · {analysis.specificity}/3</span>
            {analysis.emotion && <span>EMOTION · {String(analysis.emotion).toUpperCase()}</span>}
            {analysis.article_engagement && <span>ENGAGEMENT · {String(analysis.article_engagement).toUpperCase()}</span>}
          </div>
        </div>

        {/* Slot 4 — Suggested tier */}
        <div style={{ padding: 'clamp(16px, 2vw + 8px, 22px)' }}>
          <SectionLabel color="var(--brass-mid)">Suggested tier</SectionLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <TierBadge tierKey={analysis.ai_suggested_tier} size="lg" suggested />
            {analysis.borderline_flag && analysis.borderline_other_tier && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                color: 'var(--tertiary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                close to{' '}
                <em style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 12,
                  color: 'var(--brass-warm)',
                  textTransform: 'none',
                  letterSpacing: 0,
                }}>
                  {TIER_BY_KEY[analysis.borderline_other_tier]?.name || analysis.borderline_other_tier}
                </em>
                {' · one specific move would push it'}
              </span>
            )}
          </div>
        </div>
      </div>

      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 13,
        lineHeight: 1.65,
        color: 'var(--secondary)',
        fontStyle: 'italic',
        margin: '18px 4px 14px',
      }}>
        You can accept this read, suggest a different tier, or amend what you wrote. None of these choices are wrong.
      </p>

      {locked ? (
        <button disabled style={{
          ...btnPrimary,
          width: '100%',
          opacity: 0.45,
          cursor: 'not-allowed',
        }}>
          Continue in {lockSecondsLeft}s · sit with this
        </button>
      ) : (
        <button onClick={onContinue} style={{ ...btnPrimary, width: '100%' }}>
          Continue → self-declare
        </button>
      )}
    </div>
  );
}

// ─── Declare stage (tier grid for self-declaration) ──────────────────────
function DeclareStage({ analysis, declaredTier, setDeclaredTier, onContinue, onBack }) {
  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <SectionLabel>Stage 2 · Self-declaration</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 2vw + 10px, 26px)',
        fontWeight: 500,
        color: 'var(--ink)',
        lineHeight: 1.15,
        marginBottom: 10,
      }}>
        Which tier do{' '}
        <em className="dialecta-brass" style={{ display: 'inline-block' }}>you</em>
        {' '}think this is?
      </h2>
      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--secondary)',
        marginBottom: 20,
      }}>
        The engine's suggestion is ringed in pale brass. Your selection is visible on your comment. If the community later reclassifies you, the contrast between what you said and how you were read is public information. That's the point.
      </p>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 22,
      }}>
        {TIERS.map(t => (
          <TierBadge
            key={t.key}
            tierKey={t.key}
            size="md"
            selected={declaredTier === t.key}
            suggested={analysis.ai_suggested_tier === t.key && declaredTier !== t.key}
            onClick={() => setDeclaredTier(t.key)}
          />
        ))}
      </div>

      {declaredTier && (
        <div style={{
          padding: 14,
          background: 'rgba(245, 223, 160, 0.16)',
          borderLeft: '2px solid var(--brass-warm)',
          borderRadius: 4,
          marginBottom: 22,
        }}>
          <SectionLabel color="var(--brass-warm)" mb={4}>{TIER_BY_KEY[declaredTier].name}</SectionLabel>
          <div style={{
            fontFamily: 'var(--font-reading)',
            fontSize: 13,
            color: 'var(--body)',
            lineHeight: 1.6,
            fontStyle: 'italic',
          }}>{TIER_BY_KEY[declaredTier].meaning}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={btnOutline}>Back</button>
        <button
          onClick={onContinue}
          disabled={!declaredTier}
          style={{
            ...btnPrimary,
            flex: 1,
            minWidth: 180,
            opacity: declaredTier ? 1 : 0.4,
            cursor: declaredTier ? 'pointer' : 'not-allowed',
          }}
        >Continue →</button>
      </div>
    </div>
  );
}

// ─── Stage 2.5 (the three-way choice) ────────────────────────────────────
function Stage25Stage({ analysis, declaredTier, onAccept, onAmend, onRespond, onBack }) {
  const agrees = declaredTier === analysis.ai_suggested_tier;

  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 760,
      margin: '0 auto',
    }}>
      <SectionLabel>Stage 2.5 · The choice</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 2vw + 10px, 26px)',
        fontWeight: 500,
        color: 'var(--ink)',
        lineHeight: 1.15,
        marginBottom: 8,
      }}>
        {agrees ? (
          <>Your read and the engine's <em className="dialecta-brass" style={{ display: 'inline-block' }}>agree.</em></>
        ) : (
          <>Your read and the engine's <em className="dialecta-brass" style={{ display: 'inline-block' }}>don't match.</em></>
        )}
      </h2>
      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--secondary)',
        marginBottom: 4,
      }}>
        {agrees ? (
          <>You both see this as <strong>{TIER_BY_KEY[analysis.ai_suggested_tier].name}</strong>. You can post as-is, or still amend if you want to develop it further.</>
        ) : (
          <>You declared <strong>{TIER_BY_KEY[declaredTier].name}</strong>. The engine read this as <strong>{TIER_BY_KEY[analysis.ai_suggested_tier].name}</strong>. Neither of you is wrong yet — and how you respond is part of the record.</>
        )}
      </p>
      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 13,
        color: 'var(--secondary)',
        fontStyle: 'italic',
        margin: '14px 0 22px',
      }}>
        None of these choices are wrong. They're different ways of being honest.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
        gap: 12,
        marginBottom: 22,
      }}>
        <ChoiceCard
          option="A"
          title="Accept & post"
          body={agrees
            ? "You and the engine agree. Post as-is. Your comment enters the conversation now."
            : "You've heard the engine's read and you're choosing to stand where you stood. Post as-is with both tiers visible."
          }
          onClick={onAccept}
        />
        <ChoiceCard
          option="B"
          title="Amend"
          body="Revise your draft. The engine will re-read the new version. The fact that you revised is itself visible, and worth something here."
          onClick={onAmend}
        />
        {!agrees && (
          <ChoiceCard
            option="C"
            title="Respond for the record"
            body="Don't change the draft. Write a short note about why you read it differently. Reasoned disagreement nudges the tier slightly."
            onClick={onRespond}
          />
        )}
      </div>

      <button onClick={onBack} style={btnOutline}>Back</button>
    </div>
  );
}

function ChoiceCard({ option, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className="dialecta-paper dialecta-wood-frame"
      style={{
        textAlign: 'left',
        padding: '18px 20px',
        cursor: 'pointer',
        font: 'inherit',
        appearance: 'none',
        display: 'block',
      }}
    >
      <SectionLabel color="var(--brass-warm)">Option {option}</SectionLabel>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 19,
        fontWeight: 500,
        color: 'var(--ink)',
        marginBottom: 8,
        lineHeight: 1.2,
      }}>{title}</div>
      <div style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--secondary)',
      }}>{body}</div>
    </button>
  );
}

// ─── Respond-for-Record stage ────────────────────────────────────────────
function RespondStage({ analysis, declaredTier, responseNote, setResponseNote, onContinue, onBack }) {
  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 680,
      margin: '0 auto',
    }}>
      <SectionLabel>Stage 2.5 · Respond for the record</SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 2vw + 10px, 26px)',
        fontWeight: 500,
        color: 'var(--ink)',
        lineHeight: 1.15,
        marginBottom: 14,
      }}>
        In your own words,{' '}
        <em className="dialecta-brass" style={{ display: 'inline-block' }}>why?</em>
      </h2>
      <p style={{
        fontFamily: 'var(--font-reading)',
        fontSize: 14,
        lineHeight: 1.65,
        color: 'var(--secondary)',
        marginBottom: 18,
      }}>
        A reasoned disagreement gets attached to your comment and visible to readers. It carries real weight in the final classification. Keep it short. Say what you meant and why you think it's <strong>{TIER_BY_KEY[declaredTier]?.name}</strong>.
      </p>

      <div className="dialecta-paper dialecta-wood-frame" style={{
        padding: 18,
        marginBottom: 18,
      }}>
        <textarea
          value={responseNote}
          onChange={(e) => setResponseNote(e.target.value.slice(0, RESPONSE_NOTE_MAX))}
          placeholder={`I know this reads as ${TIER_BY_KEY[analysis.ai_suggested_tier]?.name}, but…`}
          rows={5}
          style={{
            width: '100%',
            minHeight: 120,
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            background: 'transparent',
            fontFamily: 'var(--font-reading)',
            fontSize: 'clamp(14px, 1vw + 8px, 15px)',
            lineHeight: 1.7,
            color: 'var(--body)',
          }}
        />
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid var(--wood-edge)',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--tertiary)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          <span>{responseNote.length} / {RESPONSE_NOTE_MAX} characters</span>
          <span>visible on your comment</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={btnOutline}>Back</button>
        <button
          onClick={onContinue}
          disabled={responseNote.trim().length < RESPONSE_NOTE_MIN}
          style={{
            ...btnPrimary,
            flex: 1,
            minWidth: 180,
            opacity: responseNote.trim().length < RESPONSE_NOTE_MIN ? 0.4 : 1,
            cursor: responseNote.trim().length < RESPONSE_NOTE_MIN ? 'not-allowed' : 'pointer',
          }}
        >Continue → post</button>
      </div>
    </div>
  );
}

// ─── Final stage (60-min briefing before publishing) ─────────────────────
function FinalStage({ onPost, onBack, posting }) {
  return (
    <div style={{
      padding: 'clamp(28px, 5vw, 48px) clamp(16px, 4vw, 28px)',
      maxWidth: 560,
      margin: '0 auto',
    }}>
      <div className="dialecta-paper dialecta-wood-frame" style={{
        padding: 'clamp(20px, 3vw, 28px)',
      }}>
        <SectionLabel color="var(--brass-bright)">One more thing</SectionLabel>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 2vw + 12px, 28px)',
          fontWeight: 500,
          color: 'var(--ink)',
          lineHeight: 1.15,
          marginBottom: 14,
        }}>
          You have{' '}
          <em className="dialecta-brass" style={{ display: 'inline-block' }}>60 minutes</em>
          {' '}once this goes live.
        </h2>
        <div style={{ height: 2, width: 40, background: 'var(--brass-bright)', marginBottom: 18 }} />
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.7,
          color: 'var(--body)',
          marginBottom: 14,
        }}>
          Your comment will appear in the feed now. For the next hour, you can edit, rewrite, or delete it freely. The counter is visible on the comment itself so you always know where you stand.
        </p>
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.7,
          color: 'var(--secondary)',
          marginBottom: 22,
          fontStyle: 'italic',
        }}>
          When the hour is up, the comment hardens. It becomes part of the permanent record.
        </p>
        <button
          onClick={onPost}
          disabled={posting}
          style={{
            ...btnPrimary,
            width: '100%',
            opacity: posting ? 0.6 : 1,
            cursor: posting ? 'wait' : 'pointer',
          }}
        >
          {posting ? 'Posting…' : 'Post'}
        </button>
        <button
          onClick={onBack}
          disabled={posting}
          style={{
            ...btnOutline,
            marginTop: 10,
            width: '100%',
          }}
        >Back</button>
      </div>
    </div>
  );
}

// ─── Posted stage (live malleable card with countdown) ───────────────────
function PostedStage({ comment, draft, declaredTier, analysis, responseNote, onReset, onEdit, onDelete }) {
  const hardenedAt = useMemo(() => {
    if (comment?.hardened_at) return new Date(comment.hardened_at).getTime();
    return Date.now() + MALLEABILITY_MS;
  }, [comment?.hardened_at]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const remaining = Math.max(0, hardenedAt - now);
  const malleable = remaining > 0;
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pct = Math.max(0, Math.min(100, (remaining / MALLEABILITY_MS) * 100));

  return (
    <div style={{
      padding: 'clamp(20px, 4vw, 32px) clamp(16px, 4vw, 28px) 28px',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <SectionLabel>
        Stage 3 · Posted{malleable && ' · malleable for 60 minutes'}
      </SectionLabel>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 2vw + 10px, 24px)',
        fontWeight: 500,
        color: 'var(--ink)',
        lineHeight: 1.2,
        marginBottom: 20,
      }}>
        Your comment is{' '}
        <em className="dialecta-brass" style={{ display: 'inline-block' }}>in the conversation.</em>
      </h2>

      {/* The live card */}
      <div className="dialecta-paper dialecta-wood-frame" style={{
        padding: 'clamp(18px, 2vw + 10px, 22px)',
        boxShadow: malleable
          ? '0 0 0 2px rgba(236, 180, 56, 0.30), 0 4px 16px rgba(28,24,20,0.08), 0 1px 4px rgba(28,24,20,0.06)'
          : undefined,
        marginBottom: 16,
      }}>
        {/* Header row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 14,
          paddingBottom: 14,
          borderBottom: '1px solid var(--wood-edge)',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--ink)',
            }}>You</div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--tertiary)',
              letterSpacing: '0.08em',
              marginTop: 2,
            }}>JUST NOW{malleable ? ' · STILL MALLEABLE' : ' · POSTED'}</div>
          </div>
          {malleable && (
            <div style={{
              padding: '6px 10px',
              background: 'var(--ink)',
              color: 'var(--brass-bright)',
              borderRadius: 4,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Body */}
        <p style={{
          fontFamily: 'var(--font-reading)',
          fontSize: 'clamp(14px, 1vw + 8px, 15px)',
          lineHeight: 1.75,
          color: 'var(--body)',
          marginBottom: 16,
          whiteSpace: 'pre-wrap',
        }}>{draft}</p>

        {/* Tier row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'flex-end',
          paddingTop: 14,
          borderTop: '1px solid var(--wood-edge)',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--tertiary)',
              letterSpacing: '0.1em',
              marginBottom: 4,
              textTransform: 'uppercase',
            }}>Engine read</div>
            <TierBadge tierKey={analysis.ai_suggested_tier} size="sm" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 8,
              color: 'var(--tertiary)',
              letterSpacing: '0.1em',
              marginBottom: 4,
              textTransform: 'uppercase',
            }}>Self-declared</div>
            <TierBadge tierKey={declaredTier} size="sm" />
          </div>
          {declaredTier !== analysis.ai_suggested_tier && (
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--brass-mid)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginLeft: 'auto',
              fontStyle: 'italic',
            }}>Contrast visible · community can weigh in</div>
          )}
        </div>

        {/* On-the-record note */}
        {responseNote && (
          <div style={{
            marginTop: 14,
            padding: '14px 16px',
            background: 'rgba(245, 223, 160, 0.16)',
            borderLeft: '2px solid var(--brass-warm)',
            borderRadius: 4,
          }}>
            <SectionLabel color="var(--brass-warm)" mb={6}>On the record · author's note</SectionLabel>
            <p style={{
              fontFamily: 'var(--font-reading)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--body)',
              fontStyle: 'italic',
              margin: 0,
            }}>"{responseNote}"</p>
          </div>
        )}

        {/* Malleability progress bar */}
        {malleable && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              height: 3,
              background: 'rgba(154, 92, 40, 0.18)',
              borderRadius: 2,
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: 'linear-gradient(to right, var(--brass-warm), var(--brass-bright))',
                transition: 'width 1s linear',
              }} />
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--tertiary)',
              letterSpacing: '0.06em',
              flexWrap: 'wrap',
              gap: 6,
            }}>
              <span>edit · rewrite · delete</span>
              <span>hardens when the bar empties</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons (only during malleable window) */}
      {malleable && (onEdit || onDelete) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {onEdit && <button onClick={onEdit} style={btnOutline}>Edit</button>}
          {onDelete && <button onClick={onDelete} style={btnOutline}>Delete</button>}
        </div>
      )}

      <button onClick={onReset} style={{ ...btnPrimary, width: '100%' }}>
        Write another comment
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────────────────
export default function DialectaPrivateDraft({ article, member, onPosted, replyTo = null, onCancelReply = null }) {
  const [stage, setStage]                 = useState(STAGES.COMPOSE);
  const [draft, setDraft]                 = useState('');
  // Structured @-mentions captured by the composer. Each entry is
  // { member_id, display_name }. The composer's mention picker writes here;
  // submitFinal sends this list to /api/comment so the server fires
  // mention notifications by member_id rather than parsing the body.
  const [mentions, setMentions]           = useState([]);
  const [analysis, setAnalysis]           = useState(null);
  const [declaredTier, setDeclaredTier]   = useState(null);
  const [stage25Choice, setStage25Choice] = useState(null);
  const [responseNote, setResponseNote]   = useState('');
  const [postedComment, setPostedComment] = useState(null);
  const [error, setError]                 = useState(null);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [reflectionLockS, setReflectionLockS] = useState(0);
  const [posting, setPosting]             = useState(false);
  // 'unknown' | 'complete' | 'incomplete'. Surfaces a soft banner above
  // COMPOSE when the viewer's profile lacks a display_name, so they aren't
  // surprised by a 400 at submission. Stays 'unknown' on lookup failure
  // so we don't false-alarm on transient network issues.
  const [profileStatus, setProfileStatus] = useState('unknown');

  const reflectStartRef = useRef(0);

  // ─── Profile completeness pre-flight ────────────────────────────────────
  // Path C-lite endpoints (api/comment, api/article/submit) require a
  // non-empty display_name. The api/_profile-validation helper returns a
  // 400 with an actionable error, but pre-empting it spares the user from
  // composing a draft that's going to fail. Best-effort lookup; errors
  // leave status='unknown' and the banner stays hidden.
  useEffect(() => {
    if (!member?.uuid) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${apiBase()}/api/profile/${encodeURIComponent(member.uuid)}`);
        if (!resp.ok) { if (!cancelled) setProfileStatus('unknown'); return; }
        const data = await resp.json();
        if (cancelled) return;
        const name = data?.display_name;
        const incomplete = !name || (typeof name === 'string' && name.trim() === '');
        setProfileStatus(incomplete ? 'incomplete' : 'complete');
      } catch (_) {
        if (!cancelled) setProfileStatus('unknown');
      }
    })();
    return () => { cancelled = true; };
  }, [member?.uuid]);

  // ─── Stage 1: kick off classification on entry to REFLECTING ────────────
  useEffect(() => {
    if (stage !== STAGES.REFLECTING) return;
    setAnalysisReady(false);
    setError(null);
    reflectStartRef.current = Date.now();
    let cancelled = false;

    (async () => {
      try {
        const resp = await fetch(`${apiBase()}/api/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: draft,
            article_id: article.id,
            article_claims: article.claims || null,
          }),
        });
        const data = await resp.json();
        if (cancelled) return;
        if (!resp.ok) throw new Error(data.error || 'Classification failed');
        setAnalysis(data);
        // Wait until the reflection bar finishes its 8s minimum before
        // advancing — the wait IS the ritual. If the API came back faster,
        // hold; if slower, transition as soon as it arrives.
        const elapsed = Date.now() - reflectStartRef.current;
        const remaining = Math.max(0, WAIT_REFLECTION_MS - elapsed);
        setTimeout(() => {
          if (cancelled) return;
          setAnalysisReady(true);
          setStage(STAGES.REFLECTION);
        }, remaining);
      } catch (err) {
        if (cancelled) return;
        setError(err.message || 'Something went wrong reading your draft.');
        setStage(STAGES.COMPOSE);
      }
    })();

    return () => { cancelled = true; };
  }, [stage, draft, article.id, article.claims]);

  // ─── Stage 1.5: 12s reflection lock countdown ────────────────────────────
  useEffect(() => {
    if (stage !== STAGES.REFLECTION) return;
    setReflectionLockS(Math.ceil(WAIT_STAGE25_MS / 1000));
    const i = setInterval(() => {
      setReflectionLockS((s) => {
        if (s <= 1) { clearInterval(i); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(i);
  }, [stage]);

  // ─── Final post: write to /api/comment ──────────────────────────────────
  async function submitFinal() {
    setPosting(true);
    setError(null);
    try {
      const resp = await fetch(`${apiBase()}/api/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_uuid: member.uuid,
          member_email: member.email,
          article_id: article.id,
          article_slug: article.slug,
          article_title: article.title,
          article_primary_tag: article.primary_tag || null,
          body: draft,
          self_declared_tier: declaredTier,
          // parent_id makes this a reply to another comment when set.
          // Null = top-level comment. Backend (api/comment.js) accepts
          // either; the reply_to_comment notification fires when present.
          parent_id: replyTo?.id || null,
          // Structured mentions list. Always sent (even empty) so the API
          // uses the structured path and skips the conservative free-text
          // fallback parser. Composer guarantees this array stays in sync
          // with @display_name spans actually present in the body.
          mentions,
          // response_note will be threaded through once the schema and
          // api/comment.js endpoint accept it. For v1 it is held in
          // client state and rendered locally on the posted card; the
          // server-side persistence is a follow-up.
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        // Preserve the structured action payload (e.g., from
        // api/_profile-validation) so the UI can render a CTA button
        // instead of a dead-end error message.
        const e = new Error(data.detail || data.error || 'Comment submission failed');
        e.action = data.action || null;
        throw e;
      }
      setPostedComment(data);
      setStage(STAGES.POSTED);
      if (typeof onPosted === 'function') {
        onPosted({
          ...data,
          body: draft,
          self_declared_tier: declaredTier,
          ai_suggested_tier: analysis.ai_suggested_tier,
          author_name: member.name,
          published_at: new Date().toISOString(),
          response_note: stage25Choice === 'respond' ? responseNote : null,
          parent_id: replyTo?.id || null,
        });
      }
    } catch (err) {
      setError({
        message: err.message || 'Could not post the comment.',
        action: err.action || null,
      });
    } finally {
      setPosting(false);
    }
  }

  function reset() {
    setStage(STAGES.COMPOSE);
    setDraft('');
    setMentions([]);
    setAnalysis(null);
    setDeclaredTier(null);
    setStage25Choice(null);
    setResponseNote('');
    setPostedComment(null);
    setError(null);
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  let stageNode;
  switch (stage) {
    case STAGES.COMPOSE:
      stageNode = profileStatus === 'incomplete' ? (
        // Hard block: when display_name is missing, compose is replaced
        // by a setup gate. Soft banners didn't stop drafting; users would
        // compose, advance, then hit a 400 at submit. Better to block
        // here so the next step is unambiguous: finish setup, come back.
        // 'unknown' (lookup failed / network) does NOT block — fail open
        // so a transient API hiccup doesn't strand a complete profile.
        <div style={{
          padding: 'clamp(28px, 5vw, 48px) clamp(20px, 4vw, 32px)',
          background: 'var(--paper-bright, #fefaea)',
          border: '1px solid var(--brass-pale, #e5cf95)',
          borderLeft: '3px solid var(--brass-warm, #b8862e)',
          borderRadius: 4,
          textAlign: 'center',
          fontFamily: 'var(--font-reading)',
          fontSize: 14,
          color: 'var(--ink, #1c1814)',
          lineHeight: 1.55,
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid, #b8862e)',
            marginBottom: 12,
          }}>
            One step before you join the conversation
          </div>
          <p style={{ margin: '0 auto 18px', maxWidth: 460 }}>
            Set up your profile first. Your display name appears on every comment you post here, so we need that before you can publish one.
          </p>
          <a href="/profile/" style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid, #b8862e)',
            textDecoration: 'none',
            padding: '10px 18px',
            background: 'rgba(184,134,46,0.10)',
            borderRadius: 4,
            border: '1px solid var(--brass-pale, #e5cf95)',
          }}>Set up profile →</a>
        </div>
      ) : (
        <ComposeStage
          article={article}
          draft={draft}
          setDraft={setDraft}
          mentions={mentions}
          setMentions={setMentions}
          error={error}
          onContinue={() => setStage(STAGES.CONSENT)}
          onCancel={reset}
        />
      );
      break;
    case STAGES.CONSENT:
      stageNode = (
        <ConsentStage
          onContinue={() => setStage(STAGES.REFLECTING)}
          onBack={() => setStage(STAGES.COMPOSE)}
        />
      );
      break;
    case STAGES.REFLECTING:
      stageNode = <ReflectingStage analysisReady={analysisReady} />;
      break;
    case STAGES.REFLECTION:
      stageNode = (
        <ReflectionStage
          analysis={analysis}
          locked={reflectionLockS > 0}
          lockSecondsLeft={reflectionLockS}
          onContinue={() => {
            setDeclaredTier(analysis.ai_suggested_tier);
            setStage(STAGES.DECLARE);
          }}
        />
      );
      break;
    case STAGES.DECLARE:
      stageNode = (
        <DeclareStage
          analysis={analysis}
          declaredTier={declaredTier}
          setDeclaredTier={setDeclaredTier}
          onContinue={() => setStage(STAGES.STAGE25)}
          onBack={() => setStage(STAGES.REFLECTION)}
        />
      );
      break;
    case STAGES.STAGE25:
      stageNode = (
        <Stage25Stage
          analysis={analysis}
          declaredTier={declaredTier}
          onAccept={() => { setStage25Choice('accept'); setStage(STAGES.FINAL); }}
          onAmend={() => {
            setStage25Choice('amend');
            // Send back to compose so the user can revise. The new draft
            // will trigger a fresh classification on next Reflect.
            setStage(STAGES.COMPOSE);
          }}
          onRespond={() => { setStage25Choice('respond'); setStage(STAGES.RESPOND); }}
          onBack={() => setStage(STAGES.DECLARE)}
        />
      );
      break;
    case STAGES.RESPOND:
      stageNode = (
        <RespondStage
          analysis={analysis}
          declaredTier={declaredTier}
          responseNote={responseNote}
          setResponseNote={setResponseNote}
          onContinue={() => setStage(STAGES.FINAL)}
          onBack={() => setStage(STAGES.STAGE25)}
        />
      );
      break;
    case STAGES.FINAL:
      stageNode = (
        <FinalStage
          posting={posting}
          onPost={submitFinal}
          onBack={() => setStage(stage25Choice === 'respond' ? STAGES.RESPOND : STAGES.STAGE25)}
        />
      );
      break;
    case STAGES.POSTED:
      stageNode = (
        <PostedStage
          comment={postedComment}
          draft={draft}
          declaredTier={declaredTier}
          analysis={analysis}
          responseNote={stage25Choice === 'respond' ? responseNote : ''}
          onReset={reset}
          // Edit / delete handlers wire to the PATCH/DELETE endpoints once
          // those land. For v1 the buttons are present visually during the
          // malleable window but no-op until the endpoints exist.
          onEdit={null}
          onDelete={null}
        />
      );
      break;
    default:
      stageNode = null;
  }

  return (
    <div style={{ background: 'transparent' }}>
      {/* Reply context banner. Renders across all stages when replyTo is set
          so the writer keeps the parent comment in view through the
          ritual. Brass-pale gradient + wood edge match the rest of the
          discourse layer's editorial register. Cancel link clears reply
          mode and returns the composer to top-level posting. */}
      {replyTo && stage !== STAGES.POSTED && (
        <div style={{
          padding: '10px clamp(16px, 4vw, 28px)',
          background: 'linear-gradient(to bottom, rgba(245,232,208,0.6), rgba(247,242,232,0.4))',
          borderBottom: '1px solid var(--wood-edge)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--brass-mid, #b8862e)',
            flexShrink: 0,
          }}>
            Replying to {replyTo.author_name || 'a contributor'}
          </div>
          {replyTo.excerpt && (
            <div style={{
              flex: '1 1 auto',
              fontFamily: 'var(--font-reading)',
              fontSize: 12,
              fontStyle: 'italic',
              color: 'var(--secondary, #5a544c)',
              lineHeight: 1.5,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              "{replyTo.excerpt}"
            </div>
          )}
          {onCancelReply && (
            <button
              onClick={onCancelReply}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: 'var(--tertiary, #7a7068)',
                flexShrink: 0,
              }}>
              Cancel reply
            </button>
          )}
        </div>
      )}
      {stage !== STAGES.COMPOSE && stage !== STAGES.POSTED && <StageRail stage={stage} />}
      {error && stage !== STAGES.COMPOSE && (
        <div style={{
          padding: '10px clamp(16px, 4vw, 28px)',
          background: '#fff0e8',
          borderBottom: '1px solid #c46028',
          fontFamily: 'var(--font-reading)',
          fontSize: 13,
          color: '#7C2C08',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          <span style={{ flex: '1 1 auto' }}>
            {typeof error === 'object' && error !== null ? error.message : error}
          </span>
          {typeof error === 'object' && error !== null && error.action && (
            <a href={error.action.url} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#7C2C08',
              textDecoration: 'none',
              padding: '5px 11px',
              background: 'rgba(124,44,8,0.1)',
              borderRadius: 3,
              border: '1px solid #c46028',
              flexShrink: 0,
            }}>{error.action.label} →</a>
          )}
        </div>
      )}
      {stageNode}
    </div>
  );
}

// ─── Shared button styles ────────────────────────────────────────────────
const btnPrimary = {
  padding: '12px 26px',
  background: 'var(--ink)',
  color: 'var(--cream)',
  border: 'none',
  borderRadius: 4,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 16,
  fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  appearance: 'none',
};

const btnOutline = {
  padding: '12px 20px',
  background: 'transparent',
  color: 'var(--ink)',
  border: '1px solid var(--ink)',
  borderRadius: 4,
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 15,
  fontWeight: 500,
  letterSpacing: '0.03em',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  appearance: 'none',
};
