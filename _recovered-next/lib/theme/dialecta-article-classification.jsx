/**
 * dialecta-article-classification.jsx
 *
 * The article-side classification surface. Two mountable React components:
 *
 *   <ArticleTierBadge postId={...} />       → mounts on #dialecta-tier-badge
 *     The 3-tier readout in the article meta bar: author-declared,
 *     engine-suggested, final (community-voted, identical to engine until
 *     nominations land in Phase 2.5).
 *
 *   <ArticleDeclaration postId={...} />     → mounts on #dialecta-declaration
 *     The "what this article claims" block + the "How the engine read this"
 *     expandable disclosure. Per the Article Editorial Template, AI
 *     analysis is disclosed alongside the published article, never used to
 *     gate publication.
 *
 * Both components share a single fetch via useArticleData. Each mount
 * fetches independently (small data, infrequent), so we don't need a
 * shared context for v1.
 *
 * Data source: GET /api/article/<post-id>. Returns:
 *   { ghost_post, dialecta: { declared_tier, ai_suggested_tier, final_tier,
 *                             declaration: { core_claim, scope_boundary,
 *                                            strongest_objection,
 *                                            opinion_axes },
 *                             ai_analysis: { tier_reason, alignment_note,
 *                                            author_message,
 *                                            core_claim_detected,
 *                                            flagged_passages, axis_suggestions,
 *                                            specificity_score, etc. } },
 *     author }
 *
 * Legacy articles (Maya's, Daniel's solar piece) have dialecta=null. Both
 * components return null in that case so legacy articles render their
 * Ghost-native body with no Dialecta chrome — the same fallback pattern
 * the byline override uses.
 */

import { useState, useEffect } from 'react';
import TierBadge, { TIER_BY_KEY, TierIcon } from './dialecta-tier-badge.jsx';
import { CartesianMap, TernaryMap, BinaryMap } from './dialecta-opinion-map.jsx';
import { InteractiveMap } from './dialecta-opinion-map-placement.jsx';

// ─── Resolve API base ──────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

// ─── Shared data hook ─────────────────────────────────────────────────────

function useArticleData(postId) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!postId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${apiBase()}/api/article/${encodeURIComponent(postId)}`);
        if (!res.ok) throw new Error(`Article fetch failed: ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Article fetch failed');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [postId]);

  return { data, loading, error };
}

// ─── Design tokens ────────────────────────────────────────────────────────

const T = {
  fontDisplay: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
  fontMono:    "var(--font-mono, 'DM Mono', 'Courier New', monospace)",
  fontReading: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
  fontBody:    "var(--font-body, 'DM Sans', system-ui, sans-serif)",
  ink:         'var(--ink, #1c1814)',
  textBody:    'var(--text-prose, #3a342c)',
  secondary:   'var(--secondary, #5a5248)',
  tertiary:    'var(--tertiary, #8c8780)',
  paperBright: 'var(--paper-bright, #fefaea)',
  brassWarm:   'var(--brass-warm, #b8862e)',
  brassMid:    'var(--brass-mid, #b8862e)',
  brassDeep:   'var(--brass-deep, #6a4a18)',
  brassPale:   'var(--brass-pale, #e5cf95)',
  brassBright: 'var(--brass-bright, #d4a84a)',
  woodEdge:    'var(--wood-edge, rgba(154, 92, 40, 0.22))',
};

// ─── Tier Badge (3-tier readout) ──────────────────────────────────────────
// Renders 3 labeled chips: Author Declared / Engine Read / Final. When all
// three match (the common case until nominations land), the consensus is
// visually obvious because the chips are the same color. When they differ,
// the contrast tells the reader something happened — the engine read it
// differently, or the community shifted it.

function TierColumn({ label, tierKey, emphasis }) {
  const tier = tierKey ? TIER_BY_KEY[tierKey] : null;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 5,
      flex: '0 1 auto',
    }}>
      <div style={{
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: emphasis ? T.brassMid : T.tertiary,
      }}>
        {label}
      </div>
      {tier ? (
        <TierBadge tierKey={tierKey} size="sm" />
      ) : (
        <span style={{
          fontFamily: T.fontMono,
          fontSize: 10,
          color: T.tertiary,
          fontStyle: 'italic',
        }}>
          —
        </span>
      )}
    </div>
  );
}

export function ArticleTierBadge({ postId }) {
  const { data, loading } = useArticleData(postId);
  if (loading) return null;
  const dialecta = data?.dialecta;
  if (!dialecta) return null;

  const declared = dialecta.declared_tier;
  const ai       = dialecta.ai_suggested_tier;
  const final    = dialecta.final_tier;

  return (
    <div style={{
      display: 'flex',
      gap: 'clamp(18px, 4vw, 32px)',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: '14px 0 8px',
      flexWrap: 'wrap',
    }}>
      <TierColumn label="Author Declared" tierKey={declared} />
      <div style={{
        alignSelf: 'center',
        marginTop: 14,
        color: T.brassPale,
        fontFamily: T.fontMono,
        fontSize: 11,
      }}>·</div>
      <TierColumn label="Engine Read" tierKey={ai} />
      <div style={{
        alignSelf: 'center',
        marginTop: 14,
        color: T.brassPale,
        fontFamily: T.fontMono,
        fontSize: 11,
      }}>·</div>
      <TierColumn label="Final" tierKey={final} emphasis />
    </div>
  );
}

// ─── Declaration + AI Disclosure ──────────────────────────────────────────
// Two-tier disclosure:
//   1. Always-visible declaration block: core_claim + scope_boundary +
//      strongest_objection. The author's commitment to the reader.
//   2. Expandable "How the engine read this" section: tier_reason,
//      alignment_note, flagged_passages, axis_suggestions. Per the
//      Editorial Template: AI analysis is disclosed alongside, never used
//      to gate publication.

function DeclarationField({ label, value }) {
  if (!value || (typeof value === 'string' && !value.trim())) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: T.brassMid,
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: T.fontReading,
        fontSize: 14,
        lineHeight: 1.55,
        color: T.textBody,
      }}>
        {value}
      </div>
    </div>
  );
}

function OpinionAxis({ axis }) {
  return (
    <div style={{
      padding: '8px 0',
      borderBottom: `1px dashed ${T.woodEdge}`,
      fontFamily: T.fontReading,
      fontSize: 13,
      lineHeight: 1.5,
      color: T.textBody,
    }}>
      <div style={{
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: T.brassMid,
        marginBottom: 4,
      }}>
        {axis.topic}
      </div>
      <div>
        <em style={{ color: T.ink }}>{axis.axis_a}</em>
        <span style={{ color: T.tertiary, margin: '0 8px' }}>vs.</span>
        <em style={{ color: T.ink }}>{axis.axis_b}</em>
      </div>
    </div>
  );
}

function FlaggedPassage({ passage }) {
  const tier = passage.tier_pull ? TIER_BY_KEY[passage.tier_pull] : null;
  return (
    <div style={{
      padding: '12px 14px',
      marginBottom: 10,
      background: 'rgba(255, 253, 248, 0.55)',
      border: `1px solid ${T.woodEdge}`,
      borderLeft: tier ? `3px solid ${tier.border}` : `3px solid ${T.brassPale}`,
      borderRadius: 4,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        fontFamily: T.fontMono,
        fontSize: 9,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: T.tertiary,
      }}>
        {tier && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color: tier.border,
          }}>
            <TierIcon tierKey={passage.tier_pull} size={10} />
            <span>Reads as {tier.short}</span>
          </span>
        )}
      </div>
      <blockquote style={{
        margin: '0 0 10px',
        padding: 0,
        fontFamily: T.fontReading,
        fontStyle: 'italic',
        fontSize: 13,
        lineHeight: 1.55,
        color: T.ink,
        borderLeft: 'none',
      }}>
        “{passage.passage}”
      </blockquote>
      <div style={{
        fontFamily: T.fontReading,
        fontSize: 12,
        lineHeight: 1.5,
        color: T.textBody,
      }}>
        {passage.why}
      </div>
    </div>
  );
}

export function ArticleDeclaration({ postId, memberUuid }) {
  const { data, loading } = useArticleData(postId);
  const [expanded, setExpanded] = useState(false);

  if (loading) return null;
  const dialecta = data?.dialecta;
  if (!dialecta) return null;

  const declaration = dialecta.declaration || {};
  const ai          = dialecta.ai_analysis || {};
  const hasAi       = Object.keys(ai).length > 0;

  return (
    <section style={{
      margin: 'clamp(18px, 3vw, 28px) 0 clamp(28px, 5vw, 40px)',
      padding: 'clamp(18px, 3vw, 24px) clamp(18px, 3vw, 26px)',
      background: T.paperBright,
      border: `1px solid ${T.brassPale}`,
      borderRadius: 4,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 14,
      }}>
        <div style={{
          fontFamily: T.fontMono,
          fontSize: 9,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: T.brassMid,
        }}>
          What this article claims
        </div>
      </div>

      <DeclarationField label="Core Claim"          value={declaration.core_claim} />
      <DeclarationField label="Scope Boundary"      value={declaration.scope_boundary} />
      <DeclarationField label="Strongest Objection" value={declaration.strongest_objection} />

      {(() => {
        // Prefer the new declaration.opinion_maps shape. Fall back to the
        // legacy declaration.opinion_axes + declaration.author_position for
        // articles classified before the multi-map rebuild.
        let maps = Array.isArray(declaration.opinion_maps)
          ? declaration.opinion_maps
          : null;

        if (!maps && Array.isArray(declaration.opinion_axes) && declaration.opinion_axes.length > 0) {
          const axes = declaration.opinion_axes;
          const ap   = declaration.author_position || null;
          if (axes.length === 1 && axes[0]?.type === 'ternary') {
            maps = [{
              type: 'ternary',
              topic: axes[0].topic,
              poles: axes[0].poles,
              author_position: ap && typeof ap.a === 'number' ? ap : null,
            }];
          } else if (axes.length === 2 && axes.every((a) => !a?.type || a.type === 'cartesian')) {
            maps = [{
              type: 'cartesian',
              axes,
              author_position: ap && typeof ap.x === 'number' ? ap : null,
            }];
          }
        }

        if (!maps || maps.length === 0) return null;

        const renderMap = (m, key) => {
          // Validate the shape; bail to null for malformed entries so the
          // engine can render the rest cleanly.
          const ternaryOk = m?.type === 'ternary'
            && typeof m.topic === 'string' && m.topic.trim()
            && Array.isArray(m.poles) && m.poles.length === 3
            && m.poles.every((p) => typeof p === 'string' && p.trim());
          const cartesianOk = m?.type === 'cartesian'
            && Array.isArray(m.axes) && m.axes.length === 2
            && m.axes.every((a) =>
              a && typeof a === 'object'
              && typeof a.axis_a === 'string' && a.axis_a.trim()
              && typeof a.axis_b === 'string' && a.axis_b.trim());
          const binaryOk = m?.type === 'binary'
            && typeof m.topic === 'string' && m.topic.trim()
            && typeof m.axis_a === 'string' && m.axis_a.trim()
            && typeof m.axis_b === 'string' && m.axis_b.trim();
          if (!ternaryOk && !cartesianOk && !binaryOk) return null;

          // Render via InteractiveMap so authenticated readers can place
          // themselves at the post-read stage. Anonymous readers see the
          // map read-only with the author marker visible.
          return (
            <InteractiveMap
              key={key}
              map={m}
              postId={postId}
              memberUuid={memberUuid}
              mapIndex={key}
              stage="post_read"
              showAuthorPosition={true}
            />
          );
        };

        const rendered = maps.map((m, i) => renderMap(m, i)).filter(Boolean);
        if (rendered.length === 0) return null;

        const anyAuthorMarker = maps.some((m) => m?.author_position != null);

        return (
          <div style={{ marginTop: 36 }}>
            <div style={{
              textAlign: 'center',
              marginBottom: 28,
              paddingBottom: 18,
              borderBottom: `1px solid ${T.woodEdge}`,
            }}>
              <div style={{
                fontFamily: T.fontMono,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: T.brassMid,
                marginBottom: 6,
              }}>
                {rendered.length === 1 ? 'The opinion map' : 'The opinion maps'}
              </div>
              <div style={{
                fontFamily: T.fontReading,
                fontStyle: 'italic',
                fontSize: 14,
                lineHeight: 1.55,
                color: T.secondary,
                maxWidth: 480,
                margin: '0 auto',
              }}>
                {rendered.length === 1
                  ? 'Where the argument splits. Tap the map to place yourself.'
                  : 'Two debates this article opens. Tap each map to place yourself.'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
              {rendered}
            </div>
            {anyAuthorMarker && (
              <div style={{
                marginTop: 24,
                display: 'flex',
                justifyContent: 'center',
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  background: 'rgba(184, 134, 46, 0.08)',
                  border: `1px solid ${T.brassPale}`,
                  borderRadius: 100,
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'var(--brass-mid, #b8862e)',
                    border: '2px solid var(--paper-bright, #fefaea)',
                    boxShadow: '0 0 0 1px var(--brass-deep, #6a4a18)',
                  }} />
                  <span style={{
                    fontFamily: T.fontMono,
                    fontSize: 10.5,
                    fontWeight: 500,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: T.brassDeep,
                  }}>
                    Where the author lands
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {hasAi && (
        <>
          <div style={{
            margin: '24px 0 0',
            paddingTop: 18,
            borderTop: `1px solid ${T.woodEdge}`,
          }}>
            <button
              onClick={() => setExpanded(v => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '4px 0',
                cursor: 'pointer',
                fontFamily: T.fontMono,
                fontSize: 10,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: T.brassMid,
                appearance: 'none',
                font: 'inherit',
                textAlign: 'left',
              }}
              aria-expanded={expanded}
            >
              <span style={{
                display: 'inline-block',
                transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: 12,
                lineHeight: 1,
              }}>
                ▸
              </span>
              <span>How the engine read this</span>
              {!expanded && ai.ai_suggested_tier && (
                <span style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  color: TIER_BY_KEY[ai.ai_suggested_tier]?.border || T.tertiary,
                  fontSize: 9,
                }}>
                  <TierIcon tierKey={ai.ai_suggested_tier} size={10} />
                  <span>{TIER_BY_KEY[ai.ai_suggested_tier]?.short || ai.ai_suggested_tier}</span>
                </span>
              )}
            </button>
          </div>

          {expanded && (
            <div style={{ marginTop: 18 }}>
              {ai.tier_reason && (
                <DeclarationField label="Tier Reasoning" value={ai.tier_reason} />
              )}
              {ai.alignment_note && (
                <DeclarationField label="Alignment with Author's Declaration" value={ai.alignment_note} />
              )}
              {ai.core_claim_detected && ai.core_claim_detected !== declaration.core_claim && (
                <DeclarationField label="Core Claim the Engine Detected" value={ai.core_claim_detected} />
              )}
              {ai.opposing_view_note && (
                <DeclarationField label="On Opposing-View Engagement" value={ai.opposing_view_note} />
              )}
              {ai.author_message && (
                <DeclarationField label="Note to the Author" value={ai.author_message} />
              )}

              {Array.isArray(ai.flagged_passages) && ai.flagged_passages.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontFamily: T.fontMono,
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: T.brassMid,
                    marginBottom: 10,
                  }}>
                    Passages the Engine Marked
                  </div>
                  {ai.flagged_passages.map((p, i) => (
                    <FlaggedPassage key={i} passage={p} />
                  ))}
                </div>
              )}

              {Array.isArray(ai.tensions) && ai.tensions.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontFamily: T.fontMono,
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: T.brassMid,
                    marginBottom: 10,
                  }}>
                    Tensions the Engine Found
                  </div>
                  {ai.tensions.map((t, i) => (
                    <div key={i} style={{
                      padding: '8px 0',
                      borderBottom: `1px dashed ${T.woodEdge}`,
                    }}>
                      <div style={{
                        fontFamily: T.fontMono,
                        fontSize: 9,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: T.brassMid,
                        marginBottom: 4,
                      }}>
                        {t.name}
                      </div>
                      <div style={{
                        fontFamily: T.fontReading,
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: T.textBody,
                      }}>
                        {t.description}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {ai.recommended_map && ai.recommended_map.type && (
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontFamily: T.fontMono,
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: T.brassMid,
                    marginBottom: 6,
                  }}>
                    Recommended Map: {ai.recommended_map.type}
                  </div>
                  {ai.recommended_map.rationale && (
                    <div style={{
                      fontFamily: T.fontReading,
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: T.textBody,
                    }}>
                      {ai.recommended_map.rationale}
                    </div>
                  )}
                </div>
              )}

              {/* Backward-compat: old articles have axis_suggestions but no tensions/recommended_map. */}
              {Array.isArray(ai.axis_suggestions) && ai.axis_suggestions.length > 0
               && !Array.isArray(ai.tensions) && (
                <div style={{ marginTop: 18 }}>
                  <div style={{
                    fontFamily: T.fontMono,
                    fontSize: 9,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: T.brassMid,
                    marginBottom: 8,
                  }}>
                    Opinion Axes the Engine Proposes
                  </div>
                  {ai.axis_suggestions.map((axis, i) => (
                    <OpinionAxis key={i} axis={axis} />
                  ))}
                </div>
              )}

              <p style={{
                marginTop: 18,
                fontFamily: T.fontReading,
                fontStyle: 'italic',
                fontSize: 12,
                color: T.tertiary,
                lineHeight: 1.5,
              }}>
                The engine's reading is disclosed alongside the article, never used to gate publication. The author's voice is the published one.
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
