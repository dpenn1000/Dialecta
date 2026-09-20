/**
 * dialecta-profile-order.jsx
 *
 * Steward Order surfaces for the profile page:
 *   - OrderBadge: ornament + italic label, the public "wear it proudly" badge
 *   - OrderPatternCard: the AI-proposes / author-confirms negotiation card
 *
 * Backend endpoints:
 *   POST /api/article/classify-order  → fetch or refresh a proposal
 *   POST /api/profile/order           → commit the author's chosen Order
 *
 * The author always wins the public claim. The card shows the AI proposal,
 * an optional alternative, and a "Choose differently" affordance to pick
 * any of the 40 canonical Orders. After commit, the card hides until the
 * next classification window opens.
 *
 * The Satirist is the only declared Order — present in the picker but
 * never proposed by the AI. (Enforced at endpoint level too.)
 */

import { useState, useEffect } from 'react';

// ─── Design tokens ─────────────────────────────────────────────────────────

const T = {
  fontDisplay: "'Cormorant Garamond', Georgia, serif",
  fontMono:    "'DM Mono', 'Courier New', monospace",
  fontReading: "'Source Serif 4', 'Georgia', serif",
  fontBody:    "'DM Sans', system-ui, sans-serif",

  bgPrimary:   '#f7f2e8',
  bgWhite:     '#ffffff',
  bgCard:      '#fbf6ea',
  paperGrain:  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.045'/%3E%3C/svg%3E\")",

  textPrimary:  '#2c2620',
  textBody:     '#454547',
  textTertiary: '#8c8780',
  borderLight:  '#e0dbd2',

  amber:       '#b8862e',
  amberLight:  '#d4a84a',
  brassDeep:   '#7a5008',
};

// ─── Canonical Order taxonomy ─────────────────────────────────────────────
// Mirrors api/_stewards-skill.js + api/profile/order.js. Adding an Order
// requires updating all three. The Satirist appears in the picker because
// declared self-identification is allowed; AI never proposes it.

const ORDERS = Object.freeze([
  // Essayistic
  { id: 'essayist',     label: 'The Essayist',     family: 'essayistic', familyLabel: 'Essayistic',     ornament: '❦',  essence: 'Thinks in essays the way other people think in conversations.' },
  { id: 'aphorist',     label: 'The Aphorist',     family: 'essayistic', familyLabel: 'Essayistic',     ornament: '✦',  essence: 'Compresses. Where others need a thousand words, this writer needs forty.' },
  { id: 'memoirist',    label: 'The Memoirist',    family: 'essayistic', familyLabel: 'Essayistic',     ornament: '✥',  essence: 'Mines personal experience for what it can teach beyond itself.' },
  { id: 'diarist',      label: 'The Diarist',      family: 'essayistic', familyLabel: 'Essayistic',     ornament: '❧',  essence: 'Writes in real time, in installments, thinking out loud.' },
  { id: 'blogger',      label: 'The Blogger',      family: 'essayistic', familyLabel: 'Essayistic',     ornament: '✜',  essence: 'The honest, frequent, personal-voice writer who built the open web.' },

  // Argumentative
  { id: 'pamphleteer',  label: 'The Pamphleteer',  family: 'argumentative', familyLabel: 'Argumentative', ornament: '❖', essence: 'Writes to move you. Argument-forward, unafraid of a position.' },
  { id: 'polemicist',   label: 'The Polemicist',   family: 'argumentative', familyLabel: 'Argumentative', ornament: '❂', essence: 'Sharper cousin of the Pamphleteer. Names opponents.' },
  { id: 'dialectician', label: 'The Dialectician', family: 'argumentative', familyLabel: 'Argumentative', ornament: '✺', essence: 'Thinks by staging the argument on the page itself.' },
  { id: 'provocateur',  label: 'The Provocateur',  family: 'argumentative', familyLabel: 'Argumentative', ornament: '✤', essence: 'Asks the question nobody wanted asked, in good faith.' },

  // Synthetic
  { id: 'cartographer', label: 'The Cartographer', family: 'synthetic', familyLabel: 'Synthetic', ornament: '✧', essence: 'Maps the intellectual terrain of a topic.' },
  { id: 'anthologist',  label: 'The Anthologist',  family: 'synthetic', familyLabel: 'Synthetic', ornament: '❀', essence: 'Curates and connects. Surfaces work, threads it together.' },
  { id: 'translator',   label: 'The Translator',   family: 'synthetic', familyLabel: 'Synthetic', ornament: '✠', essence: 'Moves ideas across languages, traditions, or disciplines.' },
  { id: 'theorist',     label: 'The Theorist',     family: 'synthetic', familyLabel: 'Synthetic', ornament: '✪', essence: 'Builds frameworks. Architecture for asking better questions.' },

  // Scholarly
  { id: 'philologist',  label: 'The Philologist',  family: 'scholarly', familyLabel: 'Scholarly', ornament: '✦', essence: 'Deep reader. Goes to the primary text.' },
  { id: 'lexicographer',label: 'The Lexicographer',family: 'scholarly', familyLabel: 'Scholarly', ornament: '✜', essence: 'Obsessed with definitions.' },
  { id: 'historian',    label: 'The Historian',    family: 'scholarly', familyLabel: 'Scholarly', ornament: '❦', essence: 'Long view. Connects today’s question to its centuries-long version.' },
  { id: 'empiricist',   label: 'The Empiricist',   family: 'scholarly', familyLabel: 'Scholarly', ornament: '✤', essence: 'Data-forward, with humility about what evidence can show.' },

  // Narrative
  { id: 'fabulist',     label: 'The Fabulist',     family: 'narrative', familyLabel: 'Narrative', ornament: '✿', essence: 'Teaches through story. Parables, scenes, characters.' },
  { id: 'playwright',   label: 'The Playwright',   family: 'narrative', familyLabel: 'Narrative', ornament: '✥', essence: 'Thinks in scenes and voices.' },
  { id: 'screenwriter', label: 'The Screenwriter', family: 'narrative', familyLabel: 'Narrative', ornament: '❂', essence: 'Visual thinker. Pieces move like shots.' },
  { id: 'biographer',   label: 'The Biographer',   family: 'narrative', familyLabel: 'Narrative', ornament: '❀', essence: 'Writes lives. Idea by attending to one person closely.' },

  // Practitioner
  { id: 'clinician',    label: 'The Clinician',    family: 'practitioner', familyLabel: 'Practitioner', ornament: '✚', essence: 'Writes from practice. Authority grounded in the work.' },
  { id: 'diagnostician',label: 'The Diagnostician',family: 'practitioner', familyLabel: 'Practitioner', ornament: '✦', essence: 'Sharper, analytical cousin of the Clinician.' },
  { id: 'naturalist',   label: 'The Naturalist',   family: 'practitioner', familyLabel: 'Practitioner', ornament: '❧', essence: 'Patient observer. Field-notes voice.' },

  // Journalistic
  { id: 'correspondent',label: 'The Correspondent',family: 'journalistic', familyLabel: 'Journalistic', ornament: '✠', essence: 'Field writer. Earned authority through presence.' },
  { id: 'annalist',     label: 'The Annalist',     family: 'journalistic', familyLabel: 'Journalistic', ornament: '❖', essence: 'Chronicler. Records what happened, in order, with fidelity.' },
  { id: 'reportorial',  label: 'The Reportorial',  family: 'journalistic', familyLabel: 'Journalistic', ornament: '✜', essence: 'Old-school journalist instincts. Sources named, claims checked.' },
  { id: 'critic',       label: 'The Critic',       family: 'journalistic', familyLabel: 'Journalistic', ornament: '✺', essence: 'Reads other work carefully and writes about it with authority.' },
  { id: 'marginalia',   label: 'The Marginalia',   family: 'journalistic', familyLabel: 'Journalistic', ornament: '✥', essence: 'Writes in response. The platform’s connective tissue.' },

  // Pedagogical
  { id: 'glossator',    label: 'The Glossator',    family: 'pedagogical', familyLabel: 'Pedagogical', ornament: '❦', essence: 'Patient line-by-line gloss. Makes hard texts walkable.' },

  // Speculative
  { id: 'futurist',     label: 'The Futurist',     family: 'speculative', familyLabel: 'Speculative', ornament: '✪', essence: 'Disciplined speculation with assumptions made visible.' },

  // Declared
  { id: 'satirist',     label: 'The Satirist',     family: 'declared', familyLabel: 'Declared', ornament: '✦', essence: 'The platform’s only declared Order. Self-declared, never assigned.' },
]);

const ORDER_BY_ID = Object.freeze(
  Object.fromEntries(ORDERS.map(o => [o.id, o]))
);

const ORDERS_BY_FAMILY = (function () {
  const grouped = {};
  for (const o of ORDERS) {
    if (!grouped[o.family]) grouped[o.family] = { label: o.familyLabel, orders: [] };
    grouped[o.family].orders.push(o);
  }
  return Object.freeze(grouped);
})();

// ─── API helpers ──────────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

export async function classifyOrder(memberUuid, { force = false } = {}) {
  const res = await fetch(`${apiBase()}/api/article/classify-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_uuid: memberUuid, force }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Classification failed: ${res.status}`);
  }
  return res.json();
}

export async function commitOrder(memberUuid, order, authorResponse) {
  // POSTs to /api/profile/[member_uuid] — order commit logic was consolidated
  // into [id].js to stay under the Vercel Hobby 12-function ceiling.
  // The member_uuid is in the URL path; the body carries the chosen Order.
  const res = await fetch(`${apiBase()}/api/profile/${encodeURIComponent(memberUuid)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id: order.id,
      order_label: order.label,
      order_family: order.family,
      author_response: authorResponse,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Commit failed: ${res.status}`);
  }
  return res.json();
}

// ─── OrderBadge — public-facing display ───────────────────────────────────

/**
 * @param {object} props
 * @param {string} props.orderId        canonical slug
 * @param {string} [props.orderLabel]   display name; falls back to ORDER_BY_ID lookup
 * @param {string} [props.size]         'sm' | 'md' | 'lg'  (defaults to 'md')
 * @param {boolean} [props.showFamily]  whether to render the Family label after a thin dot
 */
// OrderBadge layouts:
//   "inline" (default) — single row [ornament] [italic name] · [family caps]
//                        Used in feed cards, comment headers, anywhere the
//                        Order needs to be a quiet glance.
//   "hero"             — stacked. First row: [ornament] [italic name] with
//                        the .dialecta-brass utility on the name so it
//                        renders in the brass gradient. Second row: family
//                        in mono caps under the name. Used on the profile
//                        right column above the Thinking Fingerprint to
//                        give the Order its own visual weight.
export function OrderBadge({ orderId, orderLabel, size = 'md', showFamily = false, layout = 'inline' }) {
  const order = ORDER_BY_ID[orderId];
  if (!order) return null;
  const label = orderLabel || order.label;

  const sizes = {
    sm: { ornament: 14, label: 13, family: 9, gap: 6 },
    md: { ornament: 18, label: 16, family: 10, gap: 8 },
    lg: { ornament: 24, label: 22, family: 11, gap: 10 },
  };
  const s = sizes[size] || sizes.md;

  if (layout === 'hero') {
    return (
      <span style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 4,
        fontFamily: T.fontDisplay,
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: s.gap,
        }}>
          <span style={{
            fontSize: s.ornament,
            color: T.amber,
            lineHeight: 1,
            position: 'relative',
            top: 1,
          }}>
            {order.ornament}
          </span>
          <span
            className="dialecta-brass"
            style={{
              fontSize: s.label,
              fontWeight: 500,
              letterSpacing: '0.005em',
              lineHeight: 1.05,
            }}>
            {label}
          </span>
        </span>
        {showFamily && (
          <span style={{
            fontFamily: T.fontMono,
            fontSize: s.family,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: T.textTertiary,
            // Indent under the name, accounting for the ornament + gap so
            // the family aligns with the start of the italic label above.
            paddingLeft: s.ornament + s.gap,
          }}>
            {order.familyLabel}
          </span>
        )}
      </span>
    );
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: s.gap,
      fontFamily: T.fontDisplay,
    }}>
      <span style={{
        fontSize: s.ornament,
        color: T.amber,
        lineHeight: 1,
        position: 'relative',
        top: 1,
      }}>
        {order.ornament}
      </span>
      <span style={{
        fontSize: s.label,
        fontStyle: 'italic',
        fontWeight: 500,
        color: T.textPrimary,
        letterSpacing: '0.005em',
      }}>
        {label}
      </span>
      {showFamily && (
        <>
          <span style={{ color: T.textTertiary, fontSize: s.family, position: 'relative', top: -2 }}>·</span>
          <span style={{
            fontFamily: T.fontMono,
            fontSize: s.family,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: T.textTertiary,
          }}>
            {order.familyLabel}
          </span>
        </>
      )}
    </span>
  );
}

// ─── OrderPicker — full 40-Order grid grouped by Family ──────────────────

function OrderPicker({ onPick, onCancel }) {
  return (
    <div style={{
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 6,
      padding: '20px 22px',
      maxHeight: '60vh',
      overflowY: 'auto',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 16,
      }}>
        <span style={{
          fontFamily: T.fontMono,
          fontSize: 10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: T.amber,
        }}>
          Choose your Order
        </span>
        <button
          onClick={onCancel}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: T.fontMono,
            fontSize: 10,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: T.textTertiary,
            cursor: 'pointer',
          }}>
          Back
        </button>
      </div>
      {Object.entries(ORDERS_BY_FAMILY).map(([fam, group]) => (
        <div key={fam} style={{ marginBottom: 18 }}>
          <div style={{
            fontFamily: T.fontMono,
            fontSize: 9,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: T.textTertiary,
            marginBottom: 6,
          }}>
            {group.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {group.orders.map((o) => (
              <button
                key={o.id}
                onClick={() => onPick(o)}
                style={{
                  background: T.bgWhite,
                  border: `1px solid ${T.borderLight}`,
                  borderRadius: 4,
                  padding: '8px 12px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 8,
                  transition: 'border-color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.amber;
                  e.currentTarget.style.background = T.bgPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.borderLight;
                  e.currentTarget.style.background = T.bgWhite;
                }}>
                <span style={{ fontFamily: T.fontDisplay, fontSize: 16, color: T.amber }}>
                  {o.ornament}
                </span>
                <span style={{
                  fontFamily: T.fontDisplay,
                  fontSize: 14,
                  fontStyle: 'italic',
                  color: T.textPrimary,
                }}>
                  {o.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── OrderPatternCard — the negotiation surface ──────────────────────────

/**
 * Self-contained card mounted on the author's own profile. Auto-fires the
 * classifier when conditions are met. Shows the proposal. Lets the author
 * accept, pick the alternative, choose differently, or dismiss.
 *
 * @param {object} props
 * @param {string} props.ghostMemberId  required
 * @param {object} [props.initialProposal]  pending_proposal already on the profile (skips initial fetch if provided)
 * @param {string} [props.initialOrderId]   currently committed order_id, if any (suppresses card if no proposal and order is set)
 * @param {() => void} [props.onCommit]   called after a successful commit; parent should refetch profile
 * @param {() => void} [props.onDismiss]  called when the author dismisses the card
 */
export function OrderPatternCard({
  ghostMemberId,
  initialProposal,
  initialOrderId,
  onCommit,
  onDismiss,
}) {
  const [proposal, setProposal] = useState(initialProposal || null);
  const [classificationReason, setReason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [picking, setPicking] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [classificationDue, setClassificationDue] = useState(Boolean(initialProposal));

  // On mount, ping the classifier endpoint. If a fresh proposal comes back,
  // use it. If the trigger says "not yet due" and no proposal exists, hide
  // the card silently. If "no_articles", also hide.
  useEffect(() => {
    if (!ghostMemberId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const r = await classifyOrder(ghostMemberId);
        if (cancelled) return;
        if (r.classification_due) {
          setProposal(r.pending_proposal);
          setReason(r.reason);
          setClassificationDue(true);
        } else if (r.pending_proposal) {
          setProposal(r.pending_proposal);
          setReason(r.reason);
          setClassificationDue(true);
        } else {
          setClassificationDue(false);
        }
      } catch (err) {
        if (!cancelled) setError(err.message ?? 'Could not check Order classification.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghostMemberId]);

  // If there's a committed Order and no pending proposal and no classification
  // due, the card has nothing to do. Render nothing.
  if (!classificationDue && !loading && !error && !proposal) return null;
  if (initialOrderId && !proposal && !classificationDue && !loading) return null;

  async function handleCommit(orderObj, response) {
    setCommitting(true);
    setError(null);
    try {
      await commitOrder(ghostMemberId, orderObj, response);
      onCommit?.();
    } catch (err) {
      setError(err.message ?? 'Commit failed.');
    } finally {
      setCommitting(false);
    }
  }

  // ---- Loading state ----
  if (loading && !proposal) {
    return (
      <CardShell>
        <CardHeader />
        <p style={paragraphStyle}>
          Reading your published work to suggest a Steward Order. This takes a moment.
        </p>
      </CardShell>
    );
  }

  // ---- Error state ----
  if (error && !proposal) {
    return (
      <CardShell>
        <CardHeader />
        <p style={{ ...paragraphStyle, color: '#b8372e' }}>{error}</p>
        {onDismiss && <DismissButton onClick={onDismiss} />}
      </CardShell>
    );
  }

  // ---- Main state: proposal in hand ----
  if (!proposal) return null;

  const proposed = ORDER_BY_ID[proposal.proposed_order_id];
  const alternative = proposal.alternative_order_id
    ? ORDER_BY_ID[proposal.alternative_order_id]
    : null;

  // Picker mode: full grid
  if (picking) {
    return (
      <CardShell>
        <CardHeader />
        <OrderPicker
          onPick={(o) => handleCommit(o, 'chose_differently')}
          onCancel={() => setPicking(false)}
        />
      </CardShell>
    );
  }

  return (
    <CardShell>
      <CardHeader />

      <p style={paragraphStyle}>
        Based on your <em>{proposal.article_count}</em> {proposal.article_count === 1 ? 'piece' : 'pieces'} so far,
        your work reads most like{' '}
        <strong style={{ color: T.textPrimary, fontWeight: 600 }}>
          <OrderBadge orderId={proposal.proposed_order_id} size="md" />
        </strong>
        {alternative && (
          <>
            {' '}— with <OrderBadge orderId={proposal.alternative_order_id} size="md" /> as a close second.
          </>
        )}
      </p>

      <p style={{
        ...paragraphStyle,
        fontStyle: 'italic',
        color: T.textBody,
        borderLeft: `2px solid ${T.amber}`,
        paddingLeft: 14,
        margin: '14px 0 18px 0',
      }}>
        {proposal.rationale}
      </p>

      {error && (
        <p style={{ ...paragraphStyle, color: '#b8372e', marginBottom: 12 }}>{error}</p>
      )}

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 18,
      }}>
        <button
          onClick={() => proposed && handleCommit(proposed, 'accepted')}
          disabled={committing || !proposed}
          style={primaryButtonStyle(committing)}>
          {committing ? 'Saving…' : `Accept ${proposal.proposed_order_label}`}
        </button>
        {alternative && (
          <button
            onClick={() => handleCommit(alternative, 'picked_alternative')}
            disabled={committing}
            style={secondaryButtonStyle(committing)}>
            Pick {proposal.alternative_order_label}
          </button>
        )}
        <button
          onClick={() => setPicking(true)}
          disabled={committing}
          style={secondaryButtonStyle(committing)}>
          Choose differently
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            disabled={committing}
            style={tertiaryButtonStyle(committing)}>
            Not now
          </button>
        )}
      </div>

      <p style={{
        fontFamily: T.fontReading,
        fontStyle: 'italic',
        fontSize: 11,
        color: T.textTertiary,
        marginTop: 16,
        lineHeight: 1.5,
      }}>
        You always have the final say. Whatever you confirm here is what readers see.
      </p>
    </CardShell>
  );
}

// ─── Card shell + small primitives ────────────────────────────────────────

function CardShell({ children }) {
  return (
    <div style={{
      backgroundColor: T.bgCard, backgroundImage: T.paperGrain,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 8,
      padding: '24px 28px',
      boxShadow: '0 2px 12px rgba(28,24,20,0.04)',
      marginBottom: 24,
    }}>
      {children}
    </div>
  );
}

function CardHeader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: 12,
      marginBottom: 12,
    }}>
      <span style={{
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: T.amber,
      }}>
        Pattern Update
      </span>
      <span style={{
        fontFamily: T.fontDisplay,
        fontStyle: 'italic',
        fontSize: 14,
        color: T.textTertiary,
      }}>
        Your Steward Order
      </span>
    </div>
  );
}

function DismissButton({ onClick }) {
  return (
    <button onClick={onClick} style={tertiaryButtonStyle(false)}>
      Dismiss
    </button>
  );
}

const paragraphStyle = {
  fontFamily: T.fontReading,
  fontSize: 14,
  lineHeight: 1.6,
  color: T.textBody,
  margin: '0 0 8px 0',
};

function primaryButtonStyle(disabled) {
  return {
    background: disabled ? T.textTertiary : T.textPrimary,
    border: 'none',
    borderRadius: 4,
    padding: '10px 18px',
    fontFamily: T.fontDisplay,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: '0.02em',
    color: T.bgPrimary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 0.15s',
  };
}

function secondaryButtonStyle(disabled) {
  return {
    background: 'transparent',
    border: `1px solid ${T.borderLight}`,
    borderRadius: 4,
    padding: '10px 18px',
    fontFamily: T.fontDisplay,
    fontSize: 14,
    fontWeight: 400,
    color: T.textPrimary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s',
  };
}

function tertiaryButtonStyle(disabled) {
  return {
    background: 'transparent',
    border: 'none',
    padding: '10px 14px',
    fontFamily: T.fontMono,
    fontSize: 10,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: T.textTertiary,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}

export { ORDERS, ORDER_BY_ID, ORDERS_BY_FAMILY };
