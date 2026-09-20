/**
 * dialecta-opinion-map-placement.jsx
 *
 * Reader-side placement layer for opinion maps. The Delta Mechanic.
 *
 * Two surfaces:
 *
 *   <ArticlePreReadMap postId memberUuid />
 *     Mounts at the top of an article (post.hbs #dialecta-pre-read-map),
 *     after the byline and before the body. Renders the article's first
 *     opinion map in interactive mode. Asks "where do you start?" before
 *     the reader engages the article. Captures pre_read placement.
 *
 *     Author position is HIDDEN on pre-read so the reader's starting
 *     point is not biased by knowing where the author landed.
 *
 *   usePlacement(postId, memberUuid, mapIndex, stage, mapType)
 *     A small hook that holds the placement state and calls the
 *     /api/opinion-map/place endpoint when the reader taps. Returns
 *     [placement, place, busy, error]. Used by both the pre-read mount
 *     and the post-read maps inside ArticleDeclaration.
 */

import { useState, useCallback, useEffect } from 'react';
import { CartesianMap, TernaryMap, BinaryMap } from './dialecta-opinion-map.jsx';

// ─── Resolve API base ──────────────────────────────────────────────────────

function apiBase() {
  if (typeof window !== 'undefined' && window.__DIALECTA_API_URL__) {
    return window.__DIALECTA_API_URL__.replace(/\/$/, '');
  }
  return '';
}

// ─── Placement hook ────────────────────────────────────────────────────────

export function usePlacement({ postId, memberUuid, mapIndex, stage, mapType }) {
  // Two-stage model: tap on the map stages a `pending` placement locally;
  // the explicit `commit()` call persists it to the API. This lets a reader
  // tap, see where they landed, tap again to adjust, and only commit when
  // they're sure. Once committed, `pending` clears and `committed` carries
  // the saved position. Tapping again after commit re-stages pending so
  // they can adjust and re-commit (overwriting the API record on success).
  const [committed, setCommitted] = useState(null);
  const [pending,   setPending]   = useState(null);
  const [busy,      setBusy]      = useState(false);
  const [error,     setError]     = useState(null);

  // Tap handler: stage a placement locally. No network call.
  const place = useCallback((coordinates) => {
    setPending(coordinates);
    setError(null);
  }, []);

  // Persist the staged pending placement to the API.
  const commit = useCallback(async () => {
    if (!pending) return;
    if (!postId || !memberUuid) {
      setError('Sign in to place yourself');
      return;
    }
    if (!mapType) {
      setError('Map type missing');
      return;
    }
    setBusy(true);
    setError(null);
    const coords = pending;
    try {
      const resp = await fetch(`${apiBase()}/api/opinion-map/place`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ghost_post_id: postId,
          member_uuid:   memberUuid,
          map_index:     mapIndex,
          stage,
          map_type:      mapType,
          coordinates:   coords,
        }),
      });
      if (!resp.ok) {
        const detail = await resp.text();
        console.error('placement save failed:', resp.status, detail);
        setError('Could not save your placement');
        // Pending stays so the reader can retry. Committed is unchanged.
      } else {
        setCommitted(coords);
        setPending(null);
      }
    } catch (err) {
      console.error('placement save exception:', err);
      setError('Could not save your placement');
    } finally {
      setBusy(false);
    }
  }, [pending, postId, memberUuid, mapIndex, stage, mapType]);

  const reset = useCallback(() => {
    setCommitted(null);
    setPending(null);
    setError(null);
  }, []);

  // The marker shown on the map: pending takes priority over committed
  // so a re-tap after commit immediately reflects the new tap location.
  const placement   = pending || committed;
  const isPending   = !!pending;
  const isCommitted = !!committed && !pending;

  return { placement, isPending, isCommitted, place, commit, reset, busy, error };
}

// ─── InteractiveMap: a single map with placement state, no card wrapper ──
// Used inside ArticleDeclaration's post-read render so each map gets its
// own placement state without double-wrapping. When memberUuid is null
// (anonymous reader), the engine renders read-only (author marker still
// visible if showAuthorPosition is true).

export function InteractiveMap({
  map,
  postId,
  memberUuid,
  mapIndex,
  stage,
  showAuthorPosition,
}) {
  const {
    placement, isPending, isCommitted,
    place, commit, reset, busy, error,
  } = usePlacement({
    postId,
    memberUuid,
    mapIndex,
    stage,
    mapType: map?.type,
  });

  const ap = showAuthorPosition ? (map?.author_position || null) : null;
  const canPlace = !!memberUuid;

  if (!map || !map.type) return null;

  const sharedProps = {
    placement,
    authorPosition: ap,
    onPlace: canPlace ? place : null,
  };

  let engine = null;
  if (map.type === 'ternary') {
    engine = (
      <TernaryMap
        poles={map.poles}
        topic={map.topic}
        {...sharedProps}
      />
    );
  } else if (map.type === 'cartesian') {
    engine = <CartesianMap axes={map.axes} {...sharedProps} />;
  } else if (map.type === 'binary') {
    engine = (
      <BinaryMap
        topic={map.topic}
        axis_a={map.axis_a}
        axis_b={map.axis_b}
        {...sharedProps}
      />
    );
  }

  return (
    <div>
      {engine}
      {canPlace && (
        <PlacementButtonRow
          isPending={isPending}
          isCommitted={isCommitted}
          placement={placement}
          busy={busy}
          onCommit={commit}
          onReset={reset}
        />
      )}
      {error && <PlacementError message={error} />}
    </div>
  );
}

// ─── Shared placement button row ───────────────────────────────────────────
// Tap the map → pending state, "Tap again to move" hint + brass Commit
// button. Click Commit → API call → committed state, calm "Re-place" link.
// Used by both InteractiveMap (inline) and PlacementCard (card-wrapped).

function PlacementButtonRow({ isPending, isCommitted, placement, busy, onCommit, onReset }) {
  const T = {
    fontMono:    "var(--font-mono, 'DM Mono', monospace)",
    fontReading: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
    tertiary:    'var(--tertiary, #8c8780)',
    secondary:   'var(--secondary, #5a5248)',
    brassMid:    'var(--brass-mid, #b8862e)',
    brassDeep:   'var(--brass-deep, #6a4a18)',
    brassWarm:   'var(--brass-warm, #d4a84a)',
  };

  // No tap yet: instructional copy.
  if (!placement && !busy) {
    return (
      <div style={{
        marginTop: 14, textAlign: 'center',
        fontFamily: T.fontReading,
        fontStyle: 'italic',
        fontSize: 13.5,
        color: T.secondary,
      }}>
        Tap anywhere on the map to place yourself.
      </div>
    );
  }

  // Tap registered, not yet committed: prompt to re-place freely + Commit.
  if (isPending) {
    return (
      <div style={{ marginTop: 14, textAlign: 'center' }}>
        <div style={{
          fontFamily: T.fontReading, fontStyle: 'italic',
          fontSize: 13.5, color: T.secondary, marginBottom: 10,
        }}>
          Tap again to move it. Commit when you're ready.
        </div>
        <button
          type="button"
          onClick={onCommit}
          disabled={busy}
          style={{
            background: `linear-gradient(180deg, ${T.brassWarm}, ${T.brassMid})`,
            border: `1px solid ${T.brassMid}`,
            padding: '9px 22px',
            fontFamily: T.fontMono, fontSize: 10.5,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#fffdf8', cursor: busy ? 'default' : 'pointer',
            borderRadius: 100, fontWeight: 600,
            boxShadow: '0 1px 0 rgba(255,255,255,0.4) inset, 0 2px 6px rgba(74,40,16,0.20)',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Committing…' : 'Commit position'}
        </button>
      </div>
    );
  }

  // Committed: calm Re-place link.
  if (isCommitted) {
    return (
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            background: 'transparent', border: `1px solid ${T.tertiary}`,
            padding: '6px 14px',
            fontFamily: T.fontMono, fontSize: 10.5,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: T.secondary, cursor: 'pointer',
            borderRadius: 100,
          }}
        >
          Re-place
        </button>
      </div>
    );
  }

  return null;
}

function PlacementError({ message }) {
  return (
    <div style={{
      marginTop: 10, textAlign: 'center',
      fontFamily: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
      fontStyle: 'italic',
      fontSize: 13, color: '#a32020',
    }}>
      {message}
    </div>
  );
}

// ─── Inline placement card (one map, interactive) ─────────────────────────

export function PlacementCard({
  map,
  postId,
  memberUuid,
  mapIndex,
  stage,
  showAuthorPosition,
  prompt,
  postPlacementText,
  committedCloseLabel,  // optional: when set + isCommitted, renders a
                        // brass-gradient primary close button after the
                        // post-placement text. Carries data-overlay-close
                        // so the overlay's existing close handler picks
                        // it up. Used by the pre-read mount to surface a
                        // clean "Begin reading →" exit after commit.
}) {
  const {
    placement, isPending, isCommitted,
    place, commit, reset, busy, error,
  } = usePlacement({
    postId,
    memberUuid,
    mapIndex,
    stage,
    mapType: map?.type,
  });

  // Notify the overlay shell when commit state changes so it can adjust
  // its chrome (hide the Skip For Now actions row, hide the skip-and-read
  // link). The event is delegated; the listener in post.hbs filters by
  // stage and updates the matching overlay's class. Re-fires on reset so
  // chrome restores when the reader hits Re-place.
  useEffect(() => {
    document.dispatchEvent(new CustomEvent(
      isCommitted ? 'dialecta:placement-committed' : 'dialecta:placement-uncommitted',
      { detail: { stage } }
    ));
  }, [isCommitted, stage]);

  // Author position visibility: per editorial direction, on pre-read this
  // is hidden so the reader's starting placement is not biased. On
  // post-read it is shown for comparison.
  const ap = showAuthorPosition ? (map?.author_position || null) : null;

  if (!map || !map.type) return null;

  const renderMap = () => {
    const sharedProps = {
      placement,
      authorPosition: ap,
      onPlace: place,
    };
    if (map.type === 'ternary') {
      return (
        <TernaryMap
          poles={map.poles}
          topic={map.topic}
          {...sharedProps}
        />
      );
    }
    if (map.type === 'cartesian') {
      return (
        <CartesianMap
          axes={map.axes}
          {...sharedProps}
        />
      );
    }
    if (map.type === 'binary') {
      return (
        <BinaryMap
          topic={map.topic}
          axis_a={map.axis_a}
          axis_b={map.axis_b}
          {...sharedProps}
        />
      );
    }
    return null;
  };

  const T = {
    fontMono:    "var(--font-mono, 'DM Mono', monospace)",
    fontDisplay: "var(--font-display, 'Cormorant Garamond', Georgia, serif)",
    fontReading: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
    ink:         'var(--ink, #1c1814)',
    paperBright: 'var(--paper-bright, #fefaea)',
    brassMid:    'var(--brass-mid, #b8862e)',
    brassDeep:   'var(--brass-deep, #6a4a18)',
    brassPale:   'var(--brass-pale, #f5dfa0)',
    woodEdge:    'var(--wood-edge, rgba(154, 92, 40, 0.22))',
    tertiary:    'var(--tertiary, #8c8780)',
    secondary:   'var(--secondary, #5a5248)',
    textBody:    'var(--text-prose, #3a342c)',
  };

  return (
    <div style={{
      padding: 'clamp(24px, 4vw, 36px) clamp(20px, 3vw, 32px)',
      background: T.paperBright,
      border: `1px solid ${T.brassPale}`,
      borderRadius: 4,
    }}>
      {prompt && (
        <div style={{
          marginBottom: 24,
          textAlign: 'center',
        }}>
          <div style={{
            fontFamily: T.fontMono, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: T.brassMid,
            marginBottom: 8,
          }}>
            {prompt.eyebrow || 'Where do you start?'}
          </div>
          {prompt.headline && (
            <div style={{
              fontFamily: T.fontDisplay,
              fontStyle: 'italic',
              fontSize: 'clamp(1.4rem, 2.6vw + 0.3rem, 1.85rem)',
              fontWeight: 500,
              color: T.ink,
              lineHeight: 1.25,
              marginBottom: 10,
            }}>
              {prompt.headline}
            </div>
          )}
          {prompt.body && (
            <div style={{
              fontFamily: T.fontReading,
              fontSize: 14.5,
              lineHeight: 1.65,
              color: T.textBody,
              maxWidth: 520,
              margin: '0 auto',
            }}>
              {prompt.body}
            </div>
          )}
        </div>
      )}

      {renderMap()}

      <PlacementButtonRow
        isPending={isPending}
        isCommitted={isCommitted}
        placement={placement}
        busy={busy}
        onCommit={commit}
        onReset={reset}
      />

      {/* Post-placement editorial copy ("Got it. Read the piece...")
          shows only after the position is COMMITTED, not while still
          pending. The pending state already carries its own prompt
          inside the button row ("Tap again to move it..."). */}
      {isCommitted && postPlacementText && (
        <div style={{
          marginTop: 14,
          textAlign: 'center',
          fontFamily: T.fontReading,
          fontStyle: 'italic',
          fontSize: 14,
          color: T.textBody,
          lineHeight: 1.55,
        }}>
          {postPlacementText}
        </div>
      )}

      {/* Primary close action after commit. Caller passes
          committedCloseLabel ("Begin reading →" for pre-read) and the
          button carries data-overlay-close so the overlay's existing
          close handler dismisses it. Brass-gradient match to the Commit
          button so the affirmative path reads as one continuous gesture
          (commit → done). */}
      {isCommitted && committedCloseLabel && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button
            type="button"
            data-overlay-close=""
            style={{
              background:    `linear-gradient(180deg, ${T.brassMid}, ${T.brassDeep})`,
              border:        `1px solid ${T.brassDeep}`,
              padding:       '10px 26px',
              fontFamily:    T.fontMono,
              fontSize:      10.5,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color:         '#fffdf8',
              cursor:        'pointer',
              borderRadius:  100,
              fontWeight:    600,
              boxShadow:
                '0 1px 0 rgba(255,255,255,0.40) inset,' +
                '0 2px 6px rgba(74,40,16,0.22)',
            }}
          >
            {committedCloseLabel}
          </button>
        </div>
      )}

      {error && <PlacementError message={error} />}
    </div>
  );
}

// ─── Pre-read mount ────────────────────────────────────────────────────────

export function ArticlePreReadMap({ postId, memberUuid }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [skipped, setSkipped] = useState(false);

  // Fetch article on mount to get the first map.
  useFetchArticle(postId, setData, setLoading);

  if (loading) return null;
  if (!data?.dialecta?.declaration) return null;

  // Skipped state: render a calm "skipped, but here's a way back" view
  // instead of returning null. Without this, the overlay still shows its
  // chrome (kicker / title / body / Skip For Now button) but no content
  // and no path back to the map. The Reconsider button below restores
  // the map view.
  if (skipped) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '20px 0 4px',
      }}>
        <div style={{
          fontFamily: "var(--font-reading, 'Source Serif 4', Georgia, serif)",
          fontStyle: 'italic',
          fontSize: 14,
          lineHeight: 1.55,
          color: 'var(--secondary, #5a5248)',
          marginBottom: 16,
          maxWidth: 440,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Skipped. You can return to the pre-read at any time via the
          Reflect segment of the spine, or reconsider it now.
        </div>
        <button
          type="button"
          onClick={() => setSkipped(false)}
          style={{
            background: 'transparent',
            border: '1px solid var(--brass-mid, #b8862e)',
            padding: '9px 22px',
            fontFamily: "var(--font-mono, 'DM Mono', monospace)",
            fontSize: 10.5,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--brass-deep, #6a4a18)',
            cursor: 'pointer',
            borderRadius: 100,
            fontWeight: 600,
          }}
        >
          Reconsider →
        </button>
      </div>
    );
  }

  const decl = data.dialecta.declaration;
  const maps = Array.isArray(decl.opinion_maps) ? decl.opinion_maps : [];
  if (maps.length === 0) return null;

  // Pre-read uses only the FIRST map. A second map (if present) is
  // captured at the post-read stage only.
  const firstMap = maps[0];
  if (!firstMap || !firstMap.type) return null;

  // Member-only feature for now. Anonymous readers see no pre-read prompt.
  if (!memberUuid) return null;

  // Build a per-type prompt blurb so the reader knows what they are
  // placing themselves on without having read the article yet.
  const prompt = buildPreReadPrompt(firstMap);

  const T = {
    fontMono: "var(--font-mono, 'DM Mono', monospace)",
    tertiary: 'var(--tertiary, #8c8780)',
  };

  return (
    <div style={{ marginTop: 24, marginBottom: 24 }}>
      <PlacementCard
        map={firstMap}
        postId={postId}
        memberUuid={memberUuid}
        mapIndex={0}
        stage="pre_read"
        showAuthorPosition={false}
        prompt={prompt}
        postPlacementText="Got it. Read the piece, we'll check back at the end."
        committedCloseLabel="Begin reading →"
      />
      <div className="dialecta-skip-read-link" style={{ textAlign: 'center', marginTop: 8 }}>
        <button
          type="button"
          onClick={() => setSkipped(true)}
          style={{
            background: 'transparent', border: 'none',
            fontFamily: T.fontMono,
            fontSize: 10,
            letterSpacing: '0.1em',
            color: T.tertiary,
            cursor: 'pointer',
            padding: '4px 8px',
            textDecoration: 'underline',
            textDecorationColor: 'rgba(140,135,128,0.4)',
          }}
        >
          skip and read
        </button>
      </div>
    </div>
  );
}

// useFetchArticle is a tiny hook for fetching /api/article/{id}. Inlined
// here to keep this file self-contained and not depend on the article-
// classification module's internal hook.
function useFetchArticle(postId, setData, setLoading) {
  useEffect(() => {
    if (!postId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${apiBase()}/api/article/${encodeURIComponent(postId)}`);
        if (!resp.ok) throw new Error(`article fetch ${resp.status}`);
        const json = await resp.json();
        if (!cancelled) setData(json);
      } catch (err) {
        console.error('article fetch failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [postId]);
}

function buildPreReadPrompt(map) {
  const headlineByType = {
    ternary:   `Three ways of seeing this. Where do you weight yourself?`,
    cartesian: `Two questions in play. Where do you stand on each?`,
    binary:    `One spectrum. Where do you start?`,
  };
  const headline = headlineByType[map.type] || 'Where do you start?';

  let body;
  if (map.type === 'ternary') {
    const topic = map.topic ? `On the question of "${map.topic.toLowerCase()},"` : 'On the question this article addresses,';
    body = `${topic} pick a position by tapping anywhere in the triangle. The three corners represent competing positions; your tap weights how much each one fits you. You can re-place after reading.`;
  } else if (map.type === 'cartesian') {
    body = 'Two independent questions. Tap once on the plane to mark where you stand on both at once. You can re-place after reading.';
  } else if (map.type === 'binary') {
    body = 'A continuum between two positions. Tap anywhere along the line; the middle is a real position, not a fence. You can re-place after reading.';
  }

  return {
    eyebrow:  'Before you read',
    headline,
    body,
  };
}
