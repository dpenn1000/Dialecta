/**
 * dialecta-community-contributors.jsx
 *
 * Contributors directory — a tab of the Community page. Replaces the
 * inline ContributorsList that previously lived in index.jsx (the inline
 * version had only a free-text search; this file adds the full filter +
 * sort + view-mode kit the Community page should ship with on day one).
 *
 * Discovery surfaces (Three-surface model, memory: project_three_surface_model):
 *   - Profile = identity layer (one contributor in depth)
 *   - Author View = breadth-of-work for one contributor (separate file)
 *   - Contributors directory = breadth-across-people (this file)
 *
 * Filters offered:
 *   - Free-text search (name / bio / location / archetype / order)
 *   - Archetype chips (Skeptic, Synthesizer, Advocate, Builder, etc.)
 *   - Steward Order chips (Essayist, Aphorist, ...) — derived from data
 *   - View mode (All / Following / New voices) — signed-in viewers only
 *   - Sort (Alphabetical / Archetype / Recently joined)
 *
 * Card affordances:
 *   - Avatar, name, archetype label, Order chip, bio
 *   - "View their writing →" link → /community/?author=<id>
 *   - Follow / Following toggle
 *
 * Data:
 *   - GET /api/profile/_list  (canonical contributors directory)
 *   - GET /api/profile/<viewer>  (viewer's follow graph, signed-in only,
 *     used for the Following / New voices toggle)
 *
 * Future filters and tools waiting for data infrastructure (TUNING):
 *   - "Most followed" sort — needs follower counts on _list
 *   - "Most active" sort — needs comment / article counts on _list
 *   - Topic filter — needs per-contributor topic affinity
 *   - "Has writing" toggle — needs article counts on _list
 *   - Sparring partners view — `sparring_partners` data already exists,
 *     could surface as a fourth view mode
 */

import { useEffect, useMemo, useState } from 'react';

function apiBase() {
  if (typeof window === 'undefined') return '';
  const url = window.__DIALECTA_API_URL__;
  return url ? String(url).replace(/\/$/, '') : '';
}

function computeInitials(name) {
  if (!name) return '?';
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?';
}

// Canonical archetype labels, matching api/profile/[id].js ARCHETYPE_NOTES.
// We render the label on the chip; the slug is the filter key.
const ARCHETYPE_CHIPS = [
  { key: 'skeptic',       label: 'Skeptic' },
  { key: 'synthesizer',   label: 'Synthesizer' },
  { key: 'advocate',      label: 'Advocate' },
  { key: 'builder',       label: 'Builder' },
  { key: 'empiricist',    label: 'Empiricist' },
  { key: 'contextualist', label: 'Contextualist' },
  { key: 'illuminator',   label: 'Illuminator' },
  { key: 'reviser',       label: 'Reviser' },
];

const VIEW_MODES = [
  { key: 'all',       label: 'All contributors' },
  { key: 'following', label: 'Following' },
  { key: 'new',       label: 'Find new voices' },
];

const SORT_OPTIONS = [
  { key: 'name',      label: 'A → Z' },
  { key: 'archetype', label: 'By archetype' },
];

// ─── Avatar chip ─────────────────────────────────────────────────────────

function AvatarChip({ name, color, secondaryColor, avatarUrl, size = 48 }) {
  const initials = computeInitials(name);
  return (
    <div
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: '50%',
        background: avatarUrl
          ? `url(${avatarUrl}) center/cover`
          : `linear-gradient(135deg, ${color || '#7a7068'} 0%, ${secondaryColor || color || '#7a7068'} 100%)`,
        color: '#fbf6ea',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: Math.round(size * 0.42),
        fontWeight: 500,
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12), 0 1px 0 rgba(74,40,16,0.08)',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {!avatarUrl && initials}
    </div>
  );
}

// ─── Follow button ───────────────────────────────────────────────────────

function FollowButton({ targetGhostId, viewerGhostId, initialFollowing, onChange }) {
  const [following, setFollowing] = useState(!!initialFollowing);
  const [busy, setBusy] = useState(false);

  // Keep in sync if parent recomputes (view-mode toggle re-derives followingSet).
  useEffect(() => { setFollowing(!!initialFollowing); }, [initialFollowing]);

  if (!viewerGhostId || viewerGhostId === targetGhostId) return null;

  async function toggle(e) {
    e.preventDefault(); e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    try {
      const res = await fetch(`${apiBase()}/api/profile/${encodeURIComponent(targetGhostId)}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          _action:          next ? 'follow' : 'unfollow',
          viewer_member_id: viewerGhostId,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      if (onChange) onChange(targetGhostId, next);
    } catch (err) {
      setFollowing(!next);
      console.warn('Follow toggle failed:', err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      style={{
        background:    following ? '#b8862e' : 'transparent',
        border:        '1.5px solid #b8862e',
        borderRadius:  6,
        padding:       '6px 14px',
        fontFamily:    "'DM Mono', monospace",
        fontSize:      9, letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color:         following ? '#fbf6ea' : '#b8862e',
        cursor:        busy ? 'wait' : 'pointer',
        opacity:       busy ? 0.6 : 1, flexShrink: 0,
        transition:    'all 0.15s',
      }}
    >
      {busy ? '…' : following ? 'Following ✓' : '+ Follow'}
    </button>
  );
}

// ─── Contributor card ────────────────────────────────────────────────────

function ContributorCard({ contributor, viewerGhostId, isFollowing, onFollowChange, onOpenAuthor }) {
  const isOwn = viewerGhostId && contributor.ghost_member_id === viewerGhostId;

  return (
    <div
      className="dialecta-paper"
      style={{
        display: 'flex', alignItems: 'flex-start',
        gap: 'clamp(12px, 1.8vw, 18px)',
        padding: 'clamp(14px, 2vw, 20px)',
        borderRadius: 8,
        border: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
        boxShadow: '0 1px 0 rgba(74,40,16,0.04)',
        flexWrap: 'wrap',
      }}
    >
      <AvatarChip
        name={contributor.display_name}
        color={contributor.color}
        secondaryColor={contributor.secondaryColor}
        avatarUrl={contributor.avatar_url}
      />

      <div style={{ flex: '1 1 240px', minWidth: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
          gap: 10, marginBottom: 4,
        }}>
          <a
            href={`/profile/?id=${encodeURIComponent(contributor.ghost_member_id)}`}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1.15rem, 1.2vw + 0.7rem, 1.35rem)',
              fontWeight: 500,
              color: '#1c1814',
              textDecoration: 'none',
            }}
          >{contributor.display_name || 'Anonymous'}</a>
          {contributor.is_author && (
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 8, letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#b8862e',
            }}>· author</span>
          )}
        </div>

        {(contributor.archetype || contributor.order) && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 6,
            marginBottom: 8,
          }}>
            {contributor.archetype && (
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 3,
                background: 'rgba(184,134,46,0.12)',
                border: '1px solid rgba(184,134,46,0.30)',
                color: '#6a4f1c',
              }}>{contributor.archetype.label}</span>
            )}
            {contributor.order && (
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 3,
                background: 'rgba(154,92,40,0.10)',
                border: '1px solid rgba(154,92,40,0.30)',
                color: '#5a3818',
              }}>The {contributor.order.label}</span>
            )}
          </div>
        )}

        {contributor.bio && (
          <p style={{
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 'clamp(0.92rem, 0.3vw + 0.84rem, 1rem)',
            color: '#3a342c',
            lineHeight: 1.5,
            margin: '0 0 8px 0',
          }}>{contributor.bio}</p>
        )}

        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          flexWrap: 'wrap', marginTop: 6,
        }}>
          <button
            type="button"
            onClick={() => onOpenAuthor(contributor.ghost_member_id)}
            style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color:         '#b8862e',
              background:    'transparent',
              border:        'none',
              padding:       0,
              cursor:        'pointer',
              borderBottom:  '1px solid rgba(184,134,46,0.4)',
              paddingBottom: 1,
            }}
          >View their writing →</button>
        </div>
      </div>

      {!isOwn && (
        <div style={{ alignSelf: 'flex-start' }}>
          <FollowButton
            targetGhostId={contributor.ghost_member_id}
            viewerGhostId={viewerGhostId}
            initialFollowing={isFollowing}
            onChange={onFollowChange}
          />
        </div>
      )}
    </div>
  );
}

// ─── Filter/sort bar ─────────────────────────────────────────────────────

function FilterChipRow({ items, activeKey, onChange, allLabel }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6,
    }}>
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:      9,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding:       '4px 10px',
          border:        activeKey == null
            ? '1.5px solid #b8862e'
            : '1px solid rgba(154,92,40,0.22)',
          borderRadius:  4,
          background:    activeKey == null ? '#b8862e' : 'transparent',
          color:         activeKey == null ? '#fbf6ea' : '#3a342c',
          cursor:        'pointer',
        }}
      >{allLabel}</button>
      {items.map((item) => {
        const active = activeKey === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(active ? null : item.key)}
            style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding:       '4px 10px',
              border:        active
                ? '1.5px solid #b8862e'
                : '1px solid rgba(154,92,40,0.22)',
              borderRadius:  4,
              background:    active ? '#b8862e' : 'transparent',
              color:         active ? '#fbf6ea' : '#3a342c',
              cursor:        'pointer',
              whiteSpace:    'nowrap',
            }}
          >{item.label}</button>
        );
      })}
    </div>
  );
}

function FilterRow({ label, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start',
      gap: 12, flexWrap: 'wrap',
      paddingBottom: 6,
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 9, letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: '#7a7068',
        paddingTop: 5,
        flexShrink: 0,
        minWidth: 60,
      }}>{label}</span>
      <div style={{ flex: '1 1 auto' }}>{children}</div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────

export default function DialectaCommunityContributors({ viewerGhostId, onOpenAuthor }) {
  const [contributors, setContributors] = useState(null);
  const [error,        setError]        = useState(null);
  const [followingSet, setFollowingSet] = useState(new Set());

  // Filters
  const [query,            setQuery]            = useState('');
  const [archetypeFilter,  setArchetypeFilter]  = useState(null);
  const [orderFilter,      setOrderFilter]      = useState(null);
  const [viewMode,         setViewMode]         = useState('all');
  const [sortKey,          setSortKey]          = useState('name');
  const [showFilters,      setShowFilters]      = useState(false);

  // Fetch contributors directory.
  useEffect(() => {
    fetch(`${apiBase()}/api/profile/_list`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((json) => setContributors(json.contributors || []))
      .catch((err) => setError(err.message));
  }, []);

  // Fetch viewer's follow graph (sources + correspondents = everyone they
  // follow). Skipped for signed-out viewers; the Following / New-voices
  // toggles are also hidden in that case.
  useEffect(() => {
    if (!viewerGhostId) { setFollowingSet(new Set()); return; }
    fetch(`${apiBase()}/api/profile/${encodeURIComponent(viewerGhostId)}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((profile) => {
        const ids = new Set();
        for (const s of profile.sources || [])        ids.add(s.member_id);
        for (const c of profile.correspondents || []) ids.add(c.member_id);
        setFollowingSet(ids);
      })
      .catch((err) => console.warn('Follow graph fetch failed:', err.message));
  }, [viewerGhostId]);

  function handleFollowChange(memberId, nowFollowing) {
    setFollowingSet((prev) => {
      const next = new Set(prev);
      if (nowFollowing) next.add(memberId); else next.delete(memberId);
      return next;
    });
  }

  // Order chips derived from the live data so we never offer an Order with
  // zero contributors.
  const orderChips = useMemo(() => {
    if (!contributors) return [];
    const seen = new Map();
    for (const c of contributors) {
      if (c.order?.id && !seen.has(c.order.id)) {
        seen.set(c.order.id, c.order.label);
      }
    }
    return Array.from(seen, ([key, label]) => ({ key, label: `The ${label}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [contributors]);

  // Same for archetype chips — only show ones with at least one contributor.
  const archetypeChips = useMemo(() => {
    if (!contributors) return [];
    const seen = new Set();
    for (const c of contributors) {
      if (c.archetype?.id) seen.add(c.archetype.id);
    }
    return ARCHETYPE_CHIPS.filter((a) => seen.has(a.key));
  }, [contributors]);

  const filtered = useMemo(() => {
    if (!contributors) return null;
    const q = query.trim().toLowerCase();

    let list = contributors.filter((c) => {
      // View mode filter (signed-in only). 'new' = exclude both followed
      // contributors and the viewer themselves.
      if (viewMode === 'following') {
        if (!viewerGhostId) return true;
        return followingSet.has(c.ghost_member_id);
      }
      if (viewMode === 'new') {
        if (!viewerGhostId) return true;
        if (c.ghost_member_id === viewerGhostId) return false;
        return !followingSet.has(c.ghost_member_id);
      }

      return true;
    });

    if (archetypeFilter) {
      list = list.filter((c) => c.archetype?.id === archetypeFilter);
    }
    if (orderFilter) {
      list = list.filter((c) => c.order?.id === orderFilter);
    }
    if (q) {
      list = list.filter((c) => {
        const fields = [
          c.display_name, c.bio, c.location,
          c.archetype?.label, c.order?.label,
        ].filter(Boolean).join(' ').toLowerCase();
        return fields.includes(q);
      });
    }

    // Sort.
    if (sortKey === 'archetype') {
      list = [...list].sort((a, b) => {
        const al = a.archetype?.label || 'zzz';
        const bl = b.archetype?.label || 'zzz';
        if (al !== bl) return al.localeCompare(bl);
        return (a.display_name || '').localeCompare(b.display_name || '');
      });
    } else {
      list = [...list].sort((a, b) =>
        (a.display_name || '').localeCompare(b.display_name || '')
      );
    }

    return list;
  }, [contributors, query, archetypeFilter, orderFilter, viewMode, sortKey, followingSet, viewerGhostId]);

  const filterCount =
    (archetypeFilter ? 1 : 0) +
    (orderFilter ? 1 : 0) +
    (viewMode !== 'all' ? 1 : 0) +
    (sortKey !== 'name' ? 1 : 0);

  const T = {
    bgPaper:     '#fbf6ea',
    borderLight: '#e0dbd2',
    textPrimary: '#1c1814',
    textBody:    '#3a342c',
    textTertiary:'#7a7068',
  };

  return (
    <div>
      {/* Search + filter toggle */}
      <div style={{
        display: 'flex', gap: 10, marginBottom: 14,
        flexWrap: 'wrap',
      }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, bio, archetype, or Order…"
          style={{
            flex: '1 1 280px', minWidth: 0, boxSizing: 'border-box',
            padding: '11px 16px',
            fontFamily: "'Source Serif 4', Georgia, serif",
            fontSize: 15,
            backgroundColor: T.bgPaper,
            border: `1px solid ${T.borderLight}`, borderRadius: 6,
            color: T.textPrimary,
          }}
        />
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          style={{
            fontFamily:    "'DM Mono', monospace",
            fontSize:      10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            padding:       '11px 18px',
            border:        '1px solid rgba(154,92,40,0.30)',
            borderRadius:  6,
            background:    showFilters ? '#b8862e' : 'transparent',
            color:         showFilters ? '#fbf6ea' : '#5a3818',
            cursor:        'pointer',
            flexShrink:    0,
          }}
        >
          Filters {filterCount > 0 && (
            <span style={{
              marginLeft: 6, padding: '1px 6px',
              borderRadius: 3,
              background: showFilters ? 'rgba(255,255,255,0.18)' : 'rgba(184,134,46,0.18)',
              color: showFilters ? '#fbf6ea' : '#b8862e',
            }}>{filterCount}</span>
          )}
        </button>
      </div>

      {/* Filter rail (collapsible) */}
      {showFilters && (
        <div
          className="dialecta-paper"
          style={{
            padding: 'clamp(14px, 2vw, 20px)',
            borderRadius: 8,
            border: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
            marginBottom: 18,
            display: 'flex', flexDirection: 'column', gap: 14,
          }}
        >
          {viewerGhostId && (
            <FilterRow label="View">
              <FilterChipRow
                items={VIEW_MODES.filter((v) => v.key !== 'all')}
                activeKey={viewMode === 'all' ? null : viewMode}
                onChange={(k) => setViewMode(k || 'all')}
                allLabel="All"
              />
            </FilterRow>
          )}
          {archetypeChips.length > 1 && (
            <FilterRow label="Archetype">
              <FilterChipRow
                items={archetypeChips}
                activeKey={archetypeFilter}
                onChange={setArchetypeFilter}
                allLabel="Any"
              />
            </FilterRow>
          )}
          {orderChips.length > 1 && (
            <FilterRow label="Order">
              <FilterChipRow
                items={orderChips}
                activeKey={orderFilter}
                onChange={setOrderFilter}
                allLabel="Any"
              />
            </FilterRow>
          )}
          <FilterRow label="Sort">
            <FilterChipRow
              items={SORT_OPTIONS.filter((s) => s.key !== 'name')}
              activeKey={sortKey === 'name' ? null : sortKey}
              onChange={(k) => setSortKey(k || 'name')}
              allLabel="A → Z"
            />
          </FilterRow>
          {filterCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setArchetypeFilter(null); setOrderFilter(null);
                setViewMode('all'); setSortKey('name');
              }}
              style={{
                alignSelf: 'flex-start',
                fontFamily:    "'DM Mono', monospace",
                fontSize:      9,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         '#b8372e',
                background:    'transparent',
                border:        'none',
                padding:       0,
                cursor:        'pointer',
              }}
            >Clear all filters</button>
          )}
        </div>
      )}

      {error && (
        <p style={{ color: '#b8372e', fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          Could not load contributors: {error}
        </p>
      )}
      {contributors === null && !error && (
        <p style={{
          color: T.textTertiary, fontFamily: "'DM Mono', monospace",
          fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>Loading contributors…</p>
      )}
      {filtered && filtered.length === 0 && (
        <p style={{
          color: T.textTertiary, fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: 'italic', fontSize: 14, padding: '20px 0',
        }}>
          {viewMode === 'following'
            ? "You're not following anyone yet. Switch the view back to All to discover contributors."
            : viewMode === 'new'
              ? "You're following everyone here. Switch back to All to revisit any of them."
              : (query || archetypeFilter || orderFilter)
                ? 'No contributors match those filters.'
                : 'No contributors yet.'}
        </p>
      )}
      {filtered && filtered.length > 0 && (
        <>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#7a7068', marginBottom: 10,
          }}>
            {filtered.length} {filtered.length === 1 ? 'contributor' : 'contributors'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((c) => (
              <ContributorCard
                key={c.ghost_member_id}
                contributor={c}
                viewerGhostId={viewerGhostId}
                isFollowing={followingSet.has(c.ghost_member_id)}
                onFollowChange={handleFollowChange}
                onOpenAuthor={onOpenAuthor}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
