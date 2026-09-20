/**
 * dialecta-admin-resetup-maps.jsx
 *
 * Admin-only "Re-setup opinion maps" UI for post.hbs. Mirrors the pattern
 * of dialecta-admin-repolish.jsx: floating button, admin-gated visibility,
 * modal with the work and a save action.
 *
 * The modal does the same thing the editor's FINAL stage does for new
 * submissions: calls /api/article/classify with the article's text +
 * declaration, renders OpinionMapCandidatePicker against the returned
 * candidate_maps, and lets the admin pick one. On pick, calls
 * /api/article/admin-resetup-maps to commit the chosen map back to the
 * article's declaration.opinion_maps + ai_analysis. Reload to verify.
 *
 * Mount: post.hbs renders <div id="dialecta-admin-resetup-maps" data-...>;
 * post-page-mount.jsx mounts this component into it. Auth check happens
 * client-side: component fetches /api/profile/{member_id} on mount,
 * shows the button only if profile.is_admin === true.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import OpinionMapCandidatePicker from './dialecta-opinion-map-picker.jsx';
import ReflectionBar from './dialecta-reflection-bar';

// Admin re-setup phase content. Sized for the typical Opus 4.7 + adaptive
// thinking wall time (~30-100s for short-to-medium articles; longer ones
// extend past the bar fill, which then holds in the Ready state until the
// classify call returns and the modal transitions to the picker phase).
const ADMIN_RESETUP_PHASES = [
  { at: 0,     main: 'Re-reading the article.',
               sub:  'Loading the body and the original declaration.' },
  { at: 8000,  main: 'Finding the question your article puts to readers.',
               sub:  'What stance is a reader being asked to take by the end?' },
  { at: 22000, main: 'Naming the positions a real person could hold.',
               sub:  'Generating four candidate framings of the debate.' },
  { at: 38000, main: 'Ranking the candidates by fit.',
               sub:  'The engine is sorting framings by confidence.' },
  { at: 50000, main: 'Letting the moment land.',
               sub:  'The candidates are nearly ready for your selection.' },
];

const ADMIN_RESETUP_DURATION_MS = 55_000;

const T = {
  cream:        '#f7f2e8',
  bgCard:       '#fffdf8',
  ink:          '#1c1814',
  inkSoft:      '#2c2620',
  textBody:     '#454547',
  textTertiary: '#7a7068',
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

function htmlToPlaintext(html) {
  return (html || '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export default function AdminResetupMapsMount({ ghostPostId, ghostPostSlug, memberId }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen]       = useState(false);

  const apiBase = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
    ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
    : '';

  useEffect(() => {
    if (!memberId) return;
    let cancelled = false;
    fetch(`${apiBase}/api/profile/${encodeURIComponent(memberId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        if (data?.profile?.is_admin) setIsAdmin(true);
        else if (data?.is_admin) setIsAdmin(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [memberId, apiBase]);

  if (!isAdmin) return null;

  return (
    <>
      <FloatingResetupButton onClick={() => setOpen(true)} />
      {open && (
        <ResetupMapsModal
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

function FloatingResetupButton({ onClick }) {
  const [hover, setHover] = useState(false);
  // Stack ABOVE the existing Re-parse button (which sits at bottom: 24).
  // Vertical gap of ~52 keeps both visible without crowding.
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'fixed',
        right: 24, bottom: 76,
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
      aria-label="Re-setup opinion maps (admin)">
      Re-setup Maps
    </button>
  );
}

function ResetupMapsModal(props) {
  // Render the modal into document.body via createPortal. This escapes the
  // .site-main stacking context (z-index:1) which would otherwise trap our
  // z-index:10000 below the navigation bar. Same effect as the project's
  // existing post-overlay reparent script but native to React.
  if (typeof document === 'undefined') return null;
  return createPortal(<ResetupMapsModalInner {...props} />, document.body);
}

function ResetupMapsModalInner({ ghostPostId, ghostPostSlug, memberId, apiBase, onClose }) {
  // phase: 'loading' | 'picker' | 'saving' | 'success' | 'error'
  const [phase, setPhase]                 = useState('loading');
  const [analysis, setAnalysis]           = useState(null);
  const [error, setError]                 = useState(null);
  const [savedMap, setSavedMap]           = useState(null);

  // Streaming-loading state. Populated by SSE events from
  // /api/article/classify-stream as the model thinks and emits candidates.
  const [streamPhase, setStreamPhase]           = useState('starting');
  const [thinkingLog, setThinkingLog]           = useState([]);   // array of strings
  const [streamingCandidates, setStreamingCands] = useState([]);  // array of candidate objects (preview)

  useEffect(() => {
    let cancelled = false;
    const ctrl = new AbortController();

    (async () => {
      try {
        // Get article body + declaration.
        const articleResp = await fetch(`${apiBase}/api/article/${encodeURIComponent(ghostPostId)}`, {
          signal: ctrl.signal,
        });
        if (!articleResp.ok) {
          throw new Error(`Failed to load article (${articleResp.status})`);
        }
        const articleData = await articleResp.json();

        const ghostPost = articleData.ghost_post || {};
        const dialecta  = articleData.dialecta || {};
        const article_text = ghostPost.plaintext
          ? ghostPost.plaintext.trim()
          : htmlToPlaintext(ghostPost.html || '');

        if (article_text.length < 200) {
          throw new Error('Article body is too short to re-classify');
        }
        if (!dialecta.declaration?.core_claim) {
          throw new Error('Article has no declaration; cannot re-classify');
        }

        // Call the streaming classifier. Listens for SSE events and
        // populates thinkingLog + streamingCandidates incrementally;
        // the final 'result' event sets `analysis` and transitions
        // phase → 'picker'.
        const resp = await fetch(`${apiBase}/api/article/classify-stream`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          signal:  ctrl.signal,
          body:    JSON.stringify({
            article_text,
            declaration:   dialecta.declaration,
            declared_tier: dialecta.declared_tier || 'forum',
          }),
        });
        if (!resp.ok) {
          const text = await resp.text().catch(() => '');
          throw new Error(`Classify failed (${resp.status}): ${text.slice(0, 200)}`);
        }

        const reader  = resp.body.getReader();
        const decoder = new TextDecoder();
        let leftover = '';

        // SSE consumer loop. Splits on the \n\n event delimiter, parses
        // each event block into { event, data }, dispatches to state.
        while (true) {
          if (cancelled) { ctrl.abort(); break; }
          const { value, done } = await reader.read();
          if (done) break;
          leftover += decoder.decode(value, { stream: true });
          const blocks = leftover.split('\n\n');
          leftover = blocks.pop();  // last partial
          for (const block of blocks) {
            if (!block.trim()) continue;
            let evt = 'message';
            let dataStr = '';
            for (const line of block.split('\n')) {
              if (line.startsWith('event: ')) evt = line.slice(7).trim();
              else if (line.startsWith('data: ')) dataStr += line.slice(6);
            }
            if (!dataStr) continue;
            let data;
            try { data = JSON.parse(dataStr); } catch { continue; }

            if (evt === 'phase') {
              setStreamPhase(data.phase || 'unknown');
            } else if (evt === 'thinking' && typeof data.text === 'string') {
              setThinkingLog((prev) => [...prev, data.text]);
            } else if (evt === 'candidate' && data.candidate) {
              setStreamingCands((prev) => [...prev, data.candidate]);
            } else if (evt === 'result' && data.analysis) {
              if (!cancelled) {
                setAnalysis(data.analysis);
                setPhase('picker');
              }
            } else if (evt === 'error') {
              throw new Error(data.error || data.detail || 'Stream error');
            }
          }
        }
      } catch (err) {
        if (cancelled || err.name === 'AbortError') return;
        setError(err.message);
        setPhase('error');
      }
    })();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [ghostPostId, apiBase]);

  const onPick = useCallback(async (chosenMaps) => {
    // Picker contract (v2.4): onPick receives an array of 0-2 normalized
    // maps. Empty array means "build my own" (admin context: no-op, just
    // close the modal — blank-build belongs in the editor).
    if (!Array.isArray(chosenMaps) || chosenMaps.length === 0) {
      onClose();
      return;
    }
    setPhase('saving');
    setError(null);
    try {
      const saveResp = await fetch(`${apiBase}/api/article/admin-resetup-maps`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ghost_post_id:         ghostPostId,
          member_uuid:           memberId,
          selected_opinion_maps: chosenMaps,
          ai_analysis:           analysis,
        }),
      });
      if (!saveResp.ok) {
        const data = await saveResp.json().catch(() => ({}));
        throw new Error(data.error || `Save failed (${saveResp.status})`);
      }
      setSavedMap(chosenMaps);
      setPhase('success');
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  }, [analysis, apiBase, ghostPostId, memberId, onClose]);

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
          maxWidth: 720, width: '100%',
          maxHeight: '90vh', overflowY: 'auto',
          padding: '28px 32px 32px',
          boxShadow: T.shadowLg,
        }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, marginBottom: 18,
        }}>
          <div>
            <div style={{
              fontFamily: T.fontMono, fontSize: 10, fontWeight: 500,
              letterSpacing: '0.22em', textTransform: 'uppercase',
              color: T.amber, marginBottom: 8,
            }}>
              Admin · Re-setup opinion maps
            </div>
            <div style={{
              fontFamily: T.fontDisplay, fontStyle: 'italic',
              fontSize: '1.7rem', fontWeight: 400,
              color: T.inkSoft, lineHeight: 1.2,
            }}>
              Re-classify and pick a new framing
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
            disabled={phase === 'loading' || phase === 'saving'}
            style={{
              background: 'transparent', border: 'none',
              padding: 4,
              cursor: (phase === 'loading' || phase === 'saving') ? 'not-allowed' : 'pointer',
              fontSize: 22, color: T.textTertiary, lineHeight: 1,
            }}
            aria-label="Close">
            ×
          </button>
        </div>

        {phase === 'loading' && (
          <LoadingState
            streamPhase={streamPhase}
            thinkingLog={thinkingLog}
            streamingCandidates={streamingCandidates}
            ready={analysis !== null}
          />
        )}

        {phase === 'picker' && analysis && (
          <>
            <div style={{
              fontFamily: T.fontReading, fontStyle: 'italic',
              fontSize: 13.5, color: T.textBody,
              lineHeight: 1.65, marginBottom: 16,
            }}>
              The article was re-classified against the latest opinion-mapper skill. Pick the framing you want to commit. The chosen framing will replace the article's <em>declaration.opinion_maps</em> and the full <em>ai_analysis</em> will be stored alongside.
            </div>
            <OpinionMapCandidatePicker
              candidates={analysis.candidate_maps || []}
              onPick={onPick}
              allowBuildMyOwn={false}
              headline="Pick the framing to commit to this article."
              subhead="The engine has marked its top pick. Click 'Use this framing' on whichever you want saved as the article's reader-facing map."
            />
          </>
        )}

        {phase === 'saving' && <SavingState />}

        {phase === 'success' && savedMap && (
          <SuccessState savedMap={savedMap} />
        )}

        {phase === 'error' && (
          <ErrorState error={error} onRetry={() => {
            setError(null);
            setPhase('loading');
            // Re-trigger the effect by remounting via a key on the modal
            // would be cleaner; for the smoke-test surface, asking the admin
            // to close + reopen is fine.
          }} onClose={onClose} />
        )}
      </div>
    </div>
  );
}

function LoadingState({ ready, streamPhase, thinkingLog, streamingCandidates }) {
  // Phase-derived eyebrow text for the bar. Falls back to "Re-classifying"
  // until the stream surfaces a meaningful phase.
  const eyebrowFor = (sp) => {
    switch (sp) {
      case 'thinking':              return 'Engine is reasoning';
      case 'writing-output':        return 'Writing the analysis';
      case 'candidates-streaming':  return 'Candidates appearing';
      case 'candidates-complete':   return 'All candidates in';
      case 'complete':              return 'Ready';
      default:                      return 'Re-classifying';
    }
  };

  return (
    <div style={{ padding: '12px 0 0' }}>
      <ReflectionBar
        phases={ADMIN_RESETUP_PHASES}
        durationMs={ADMIN_RESETUP_DURATION_MS}
        ready={ready}
        size="article"
        eyebrow={eyebrowFor(streamPhase)}
        readingLabel="Reading"
        readyLabel="Ready"
        holdMessage="The candidates are ready. Bringing them to the picker."
      />

      <StreamFeed
        thinkingLog={thinkingLog}
        streamingCandidates={streamingCandidates}
      />
    </div>
  );
}

function StreamFeed({ thinkingLog, streamingCandidates }) {
  const hasThinking   = Array.isArray(thinkingLog) && thinkingLog.length > 0;
  const hasCandidates = Array.isArray(streamingCandidates) && streamingCandidates.length > 0;
  if (!hasThinking && !hasCandidates) return null;

  // Auto-scroll the thinking feed to the bottom as new chunks arrive.
  const thinkingRef = useRef(null);
  useEffect(() => {
    if (thinkingRef.current) {
      thinkingRef.current.scrollTop = thinkingRef.current.scrollHeight;
    }
  }, [thinkingLog]);

  return (
    <div style={{ marginTop: 24 }}>
      {hasCandidates && (
        <div style={{
          marginBottom: 16,
          padding: '12px 14px',
          background: 'rgba(212,168,74,0.06)',
          border: `1px solid rgba(212,168,74,0.22)`,
          borderRadius: 5,
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: T.amber,
            marginBottom: 8,
          }}>
            Candidates identified ({streamingCandidates.length})
          </div>
          {streamingCandidates.map((c, i) => {
            const topic = c?.topic
              || (c?.type === 'cartesian' && c.axes?.[0]?.topic)
              || '(no topic)';
            const conf = typeof c?.confidence === 'number'
              ? ` · ${Math.round(c.confidence * 100)}%`
              : '';
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: 8,
                padding: '4px 0',
                borderTop: i === 0 ? 'none' : `1px dashed rgba(180,175,165,0.32)`,
              }}>
                <span style={{
                  fontFamily: T.fontMono, fontSize: 9, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: T.amber,
                  flexShrink: 0,
                }}>
                  {c?.type || '?'}{conf}
                </span>
                <span style={{
                  fontFamily: T.fontDisplay, fontStyle: 'italic',
                  fontSize: 14, color: T.inkSoft,
                }}>
                  {topic}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasThinking && (
        <div>
          <div style={{
            fontFamily: T.fontMono, fontSize: 9.5, letterSpacing: '0.20em',
            textTransform: 'uppercase', color: T.textTertiary,
            marginBottom: 6,
          }}>
            Engine reasoning
          </div>
          <div
            ref={thinkingRef}
            style={{
              maxHeight: 140,
              overflowY: 'auto',
              padding: '10px 14px',
              background: T.cream,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 4,
              fontFamily: T.fontReading,
              fontSize: 12.5,
              lineHeight: 1.55,
              color: T.textBody,
              fontStyle: 'italic',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
            {thinkingLog.join('')}
          </div>
        </div>
      )}
    </div>
  );
}

function SavingState() {
  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      fontFamily: T.fontReading,
      color: T.textTertiary,
    }}>
      <div style={{
        fontFamily: T.fontMono, fontSize: 10, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: T.amber,
        marginBottom: 14,
      }}>
        Saving
      </div>
      <div style={{
        fontFamily: T.fontDisplay, fontStyle: 'italic',
        fontSize: 18, color: T.inkSoft, lineHeight: 1.4,
      }}>
        Committing the chosen framing to the article.
      </div>
    </div>
  );
}

function SuccessState({ savedMap }) {
  const savedMaps = Array.isArray(savedMap) ? savedMap : (savedMap ? [savedMap] : []);
  const summaries = savedMaps.map((m) =>
    m?.topic || (m?.type === 'cartesian' && m.axes?.[0]?.topic) || '(no topic)'
  );
  return (
    <div>
      <div style={{
        fontFamily: T.fontReading, fontSize: 14, color: T.textBody,
        lineHeight: 1.65, marginBottom: 14,
      }}>
        Saved. The article's opinion {savedMaps.length === 1 ? 'map is' : 'maps are'} now:
        <ul style={{ margin: '8px 0 0', paddingLeft: 22 }}>
          {summaries.map((s, i) => (
            <li key={i} style={{ fontStyle: 'italic', marginBottom: 3 }}>{s}</li>
          ))}
        </ul>
      </div>
      <div style={{
        padding: '12px 14px',
        background: T.cream,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 4,
        marginBottom: 18,
        fontFamily: T.fontReading, fontSize: 12.5, color: T.textTertiary,
        lineHeight: 1.5, fontStyle: 'italic',
      }}>
        Reload the page to see the new map render in the Reflect overlay.
      </div>
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
  );
}

function ErrorState({ error, onRetry, onClose }) {
  return (
    <div>
      <div style={{
        marginBottom: 18, padding: '12px 16px',
        background: T.goldPale,
        borderLeft: `2px solid #8c4a2f`,
        borderRadius: '0 3px 3px 0',
        fontFamily: T.fontReading, fontStyle: 'italic',
        fontSize: 13, color: T.textBody, lineHeight: 1.55,
      }}>
        Re-setup failed: {error || 'Unknown error'}
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'transparent',
            border: `1px solid ${T.borderMedium}`,
            borderRadius: 3,
            padding: '8px 18px',
            fontFamily: T.fontUI, fontSize: 13,
            color: T.textBody,
            cursor: 'pointer',
          }}>
          Close
        </button>
      </div>
    </div>
  );
}
