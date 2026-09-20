/**
 * dialecta-admin-repolish.jsx
 *
 * Admin-only re-polish UI for post.hbs. A floating button visible only to
 * members whose Supabase profile has is_admin=true. Click opens a modal
 * with the same Light / Standard / Editorial choice as the editor's
 * FINAL stage. Submitting calls /api/article/repolish, which always
 * operates on articles.original_html (the author's submitted version)
 * so re-polish is non-destructive and idempotent.
 *
 * Mount: post.hbs renders <div id="dialecta-admin-repolish" data-...>;
 * index.jsx mounts this component into it. Auth check happens
 * client-side: component fetches /api/profile/{member_id} on mount,
 * shows the button only if profile.is_admin === true.
 */

import { useState, useEffect, useCallback } from 'react';

const POLISH_LEVELS = [
  {
    key: 'light',
    label: 'Light',
    tagline: 'Punctuation cleanup only',
    detail: 'Hygiene + structure recognition. Em-dashes become commas/parens. Smart quotes. Section titles tagged correctly. Sources section formatted. Layout cruft stripped. The author\'s prose is otherwise untouched.',
  },
  {
    key: 'standard',
    label: 'Standard',
    tagline: 'Light + recognize section breaks',
    detail: 'Everything in Light, plus conservative thematic-break insertion (the brass ⁂ rule) at clear argument pivots. No content extraction.',
  },
  {
    key: 'editorial',
    label: 'Editorial',
    tagline: 'Standard + active rhythm tools',
    detail: 'Everything in Standard, plus pullquote extraction, list conversions for parallel paragraphs, and emphasis additions on load-bearing phrases.',
  },
  {
    key: 'custom',
    label: 'Custom',
    tagline: 'Pick individual features',
    detail: 'Choose exactly which structural features to apply. Hygiene (em-dash policy, smart quotes, layout cleanup, sources, pseudo-headers) always applies regardless.',
  },
];

const CUSTOM_FEATURES = [
  { key: 'thematic_breaks_conservative', label: 'Thematic breaks at clear pivots',     hint: 'Insert ⁂ rule only at obvious argument turns.' },
  { key: 'thematic_breaks_aggressive',   label: 'Thematic breaks throughout',          hint: 'More frequent ⁂ rules at any pivot.' },
  { key: 'pullquotes',                   label: 'Pullquote extraction',                hint: 'Lift key sentences as standalone blockquotes.' },
  { key: 'list_conversions',             label: 'Convert parallel paragraphs to lists', hint: 'Three or more parallel-structured paragraphs become a <ul>.' },
  { key: 'emphasis_additions',           label: 'Add emphasis to load-bearing phrases', hint: 'Bold or italicize a few key phrases.' },
];

const T = {
  cream:        '#f7f2e8',
  bgCard:       '#fffdf8',
  ink:          '#1c1814',
  inkSoft:      '#2c2620',
  textBody:     '#454547',
  textTertiary: '#7a7068',
  gold:         '#d4a84a',
  amber:        '#b8862e',
  goldPale:     '#f5e8d0',
  borderLight:  'rgba(180,175,165,0.28)',
  borderMedium: '#d8ceb8',
  fontDisplay:  "'Cormorant Garamond', 'Times New Roman', serif",
  fontReading:  "'Source Serif 4', Georgia, serif",
  fontUI:       "'DM Sans', system-ui, sans-serif",
  fontMono:     "'DM Mono', 'Courier New', monospace",
  fast:         '0.18s',
  ease:         'cubic-bezier(0.4, 0, 0.2, 1)',
  shadowMd:     '0 2px 12px rgba(28,24,20,0.07), 0 0 0 0.5px rgba(28,24,20,0.04)',
  shadowLg:     '0 8px 32px rgba(28,24,20,0.18), 0 0 0 0.5px rgba(28,24,20,0.04)',
};

export default function AdminRepolishMount({ ghostPostId, ghostPostSlug, memberId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen]       = useState(false);

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  // Auth check on mount: fetch the member's profile, surface button only
  // if is_admin is true. Silent if no member or non-admin (most readers).
  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    fetch(`${apiBase}/api/profile/${encodeURIComponent(memberId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        if (data?.profile?.is_admin) setIsAdmin(true);
        else if (data?.is_admin) setIsAdmin(true);  // tolerant of either response shape
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [memberId, apiBase]);

  if (!isAdmin) return null;

  return (
    <>
      <FloatingAdminButton onClick={() => setOpen(true)} />
      {open && (
        <RepolishModal
          ghostPostId={ghostPostId}
          ghostPostSlug={ghostPostSlug}
          memberId={memberId}
          apiBase={apiBase}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function FloatingAdminButton({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        right: 24, bottom: 24,
        zIndex: 9999,
        padding: '10px 18px',
        background: hover ? T.amber : T.bgCard,
        border: `1px solid ${T.amber}`,
        borderRadius: 24,
        cursor: 'pointer',
        fontFamily: T.fontMono,
        fontSize: 11, fontWeight: 500,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: hover ? T.bgCard : T.amber,
        boxShadow: T.shadowMd,
        transition: `all ${T.fast} ${T.ease}`,
      }}
      aria-label="Re-parse article (admin)">
      Re-parse
    </button>
  );
}

function RepolishModal({ ghostPostId, ghostPostSlug, memberId, apiBase, onClose }) {
  const [level, setLevel]                 = useState('light');
  const [customOptions, setCustomOptions] = useState({});
  const [phase, setPhase]                 = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [error, setError]                 = useState(null);
  const [result, setResult]               = useState(null);

  const toggleFeature = (key) => {
    setCustomOptions(prev => ({ ...prev, [key]: !prev[key] }));
    if (level !== 'custom') setLevel('custom');
  };

  const submit = useCallback(async () => {
    setPhase('submitting');
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/article/repolish`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ghost_post_id:  ghostPostId,
          polish_level:   level,
          polish_options: level === 'custom' ? customOptions : null,
          member_uuid:    memberId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `${res.status}: re-parse failed`);
      }
      setResult(data);
      setPhase('success');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [ghostPostId, level, customOptions, memberId, apiBase]);

  const submitting = phase === 'submitting';
  const succeeded  = phase === 'success';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(28,24,20,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.bgCard,
          borderRadius: 6,
          maxWidth: 560, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 32px 32px',
          boxShadow: T.shadowLg,
        }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18 }}>
          <div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.amber, marginBottom: 8,
            }}>
              Admin · Re-parse
            </div>
            <div style={{
              fontFamily: T.fontDisplay, fontStyle: 'italic',
              fontSize: '1.7rem', fontWeight: 400,
              color: T.inkSoft, lineHeight: 1.2,
            }}>
              Re-parse this article
            </div>
            {ghostPostSlug && (
              <div style={{
                fontFamily: T.fontMono, fontSize: 10,
                color: T.textTertiary, marginTop: 6,
                letterSpacing: '0.04em',
              }}>
                {ghostPostSlug}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none',
              padding: 4, cursor: 'pointer',
              fontSize: 22, color: T.textTertiary, lineHeight: 1,
            }}
            aria-label="Close">
            ×
          </button>
        </div>

        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 13.5, color: T.textBody,
          lineHeight: 1.65, marginBottom: 20,
        }}>
          Re-parse always operates on the author's saved <em>original_html</em>, never on the currently-published version. Changing levels and re-running is non-destructive — running Light then Editorial then Light again returns the article to a clean Light state.
        </div>

        {!succeeded ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
              {POLISH_LEVELS.map(l => {
                const selected = level === l.key;
                return (
                  <button
                    key={l.key}
                    type="button"
                    disabled={submitting}
                    onClick={() => setLevel(l.key)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '12px 16px',
                      background: selected ? T.goldPale : 'transparent',
                      border: `1px solid ${selected ? T.amber : T.borderLight}`,
                      borderRadius: 4,
                      textAlign: 'left',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1,
                      transition: `all ${T.fast} ${T.ease}`,
                      boxShadow: selected ? `0 0 0 1px ${T.amber}` : 'none',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%',
                      border: `1.5px solid ${selected ? T.amber : T.borderMedium}`,
                      background: selected ? T.amber : 'transparent',
                      flexShrink: 0, marginTop: 2,
                      position: 'relative',
                    }}>
                      {selected && (
                        <div style={{
                          position: 'absolute', top: '50%', left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: 6, height: 6, borderRadius: '50%',
                          background: T.bgCard,
                        }}/>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: T.fontDisplay, fontSize: '1.05rem', fontWeight: 500,
                        color: T.ink, lineHeight: 1.2, marginBottom: 3,
                      }}>
                        {l.label}
                        <span style={{
                          marginLeft: 10,
                          fontFamily: T.fontReading, fontStyle: 'italic', fontWeight: 400,
                          fontSize: 12.5, color: T.textTertiary,
                        }}>
                          {l.tagline}
                        </span>
                      </div>
                      {selected && (
                        <div style={{
                          fontFamily: T.fontReading, fontSize: 12.5,
                          color: T.textBody, lineHeight: 1.55,
                        }}>
                          {l.detail}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {level === 'custom' && (
              <div style={{
                marginBottom: 22,
                padding: '14px 16px',
                background: T.cream,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 4,
              }}>
                <div style={{
                  fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.18em',
                  textTransform: 'uppercase', color: T.textTertiary, marginBottom: 10,
                }}>
                  Optional features
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CUSTOM_FEATURES.map(f => {
                    const on = !!customOptions[f.key];
                    return (
                      <label
                        key={f.key}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: 10,
                          padding: '6px 8px',
                          cursor: submitting ? 'not-allowed' : 'pointer',
                          opacity: submitting ? 0.6 : 1,
                          borderRadius: 3,
                        }}>
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={submitting}
                          onChange={() => toggleFeature(f.key)}
                          style={{
                            marginTop: 4, marginLeft: 0,
                            accentColor: T.amber,
                            cursor: submitting ? 'not-allowed' : 'pointer',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
                            color: T.ink, lineHeight: 1.3,
                          }}>
                            {f.label}
                          </div>
                          <div style={{
                            fontFamily: T.fontReading, fontStyle: 'italic',
                            fontSize: 12, color: T.textTertiary, lineHeight: 1.45,
                            marginTop: 1,
                          }}>
                            {f.hint}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {phase === 'error' && error && (
              <div style={{
                marginBottom: 18, padding: '10px 14px',
                background: T.goldPale,
                borderLeft: `2px solid #8c4a2f`,
                borderRadius: '0 3px 3px 0',
                fontFamily: T.fontReading, fontStyle: 'italic',
                fontSize: 12.5, color: T.textBody, lineHeight: 1.5,
              }}>
                Re-parse failed: {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                style={{
                  background: 'transparent',
                  border: `1px solid ${T.borderMedium}`,
                  borderRadius: 3,
                  padding: '8px 18px',
                  fontFamily: T.fontUI, fontSize: 13,
                  color: T.textBody,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                style={{
                  background: T.amber,
                  color: T.bgCard,
                  border: 'none',
                  borderRadius: 3,
                  padding: '8px 22px',
                  fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
                  cursor: submitting ? 'wait' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}>
                {submitting ? 'Re-parsing…' : 'Re-parse with these settings'}
              </button>
            </div>
          </>
        ) : (
          <div>
            <div style={{
              fontFamily: T.fontReading, fontSize: 14, color: T.textBody,
              lineHeight: 1.65, marginBottom: 14,
            }}>
              Re-parse complete. The article was re-polished at <strong>{result.polish_level}</strong>. {result.bytes_after} bytes (was {result.bytes_before}).
            </div>
            {result.polish_change_log && result.polish_change_log.length > 0 && (
              <div style={{
                padding: '12px 14px',
                background: T.cream,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 4,
                marginBottom: 18,
              }}>
                <div style={{
                  fontFamily: T.fontMono, fontSize: 9.5,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: T.textTertiary, marginBottom: 8,
                }}>
                  Changes
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {result.polish_change_log.map((c, i) => (
                    <li key={i} style={{
                      fontFamily: T.fontReading, fontSize: 13,
                      color: T.textBody, lineHeight: 1.55, marginBottom: 4,
                    }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={{
                  background: T.amber,
                  color: T.bgCard,
                  border: 'none',
                  borderRadius: 3,
                  padding: '8px 22px',
                  fontFamily: T.fontUI, fontSize: 13, fontWeight: 500,
                  cursor: 'pointer',
                }}>
                Reload to see result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
