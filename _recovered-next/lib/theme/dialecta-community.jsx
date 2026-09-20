/**
 * dialecta-community.jsx
 *
 * Top-level shell for the Community page. Owns the tab state, URL state,
 * and hero header; dispatches to one of three view modes:
 *
 *   - Feed         — the dopamine-for-good feed (4 content types)
 *   - Contributors — directory with filters / sort / view toggles
 *   - Author View  — single contributor's writing + Forum-tier voice,
 *                    auto-activates when ?author=<member_id> is present
 *
 * URL state contract:
 *   /community/                      → Feed (or Contributors for cold-start)
 *   /community/?tab=contributors     → Contributors
 *   /community/?tab=feed             → Feed
 *   /community/?author=<member_id>   → Author View (ignores tab)
 *
 * Tab default: when no tab param is set, signed-in viewers default to
 * Feed (the active discovery surface), signed-out land on Contributors
 * (which is more browseable without a network).
 *
 * Three-surface model (memory: project_three_surface_model):
 *   - Article comments (post.hbs) = depth on this argument
 *   - Profile page                = identity layer + private mirror
 *   - Community page              = social feed, contributors, author breadth
 *
 * The profile page is a living, breathing identity surface (Fingerprint,
 * archetype, relationships, Declared shelf) but is NOT a feed. All the
 * dynamic finding / sorting / engaging tools live on this page.
 */

import { useEffect, useState, useCallback } from 'react';
import DialectaCommunityFeed         from './dialecta-community-feed.jsx';
import DialectaCommunityContributors from './dialecta-community-contributors.jsx';
import DialectaCommunityAuthor       from './dialecta-community-author.jsx';

// ─── URL state helpers ───────────────────────────────────────────────────

function readUrlState() {
  if (typeof window === 'undefined') return { author: null, tab: null };
  const params = new URLSearchParams(window.location.search);
  return {
    author: params.get('author'),
    tab:    params.get('tab'),
  };
}

function pushUrlState({ author, tab }) {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (author) params.set('author', author); else params.delete('author');
  if (tab)    params.set('tab', tab);       else params.delete('tab');
  const qs = params.toString();
  const newUrl = window.location.pathname + (qs ? '?' + qs : '');
  window.history.pushState({}, '', newUrl);
}

// ─── Hero header (matches About / Guidebook hero pattern) ───────────────

function CommunityHero({ subtitle }) {
  const heroBrass = "linear-gradient(95deg, #d4a84a 0%, #ecb438 22%, #f5dfa0 50%, #ecb438 78%, #d4a84a 100%)";
  const heroBrassShadow = "drop-shadow(0 1px 1px rgba(0,0,0,0.45)) drop-shadow(0 2px 0 rgba(28,24,20,0.30))";
  const brassClipStyle = {
    background: heroBrass,
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    backgroundClip: 'text', filter: heroBrassShadow,
  };

  return (
    <div style={{ marginBottom: 'clamp(14px, 2vw, 22px)', position: 'relative' }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 11, letterSpacing: '0.28em',
        textTransform: 'uppercase', marginBottom: 8,
        display: 'inline-block', fontWeight: 500, ...brassClipStyle,
      }}>The Community</div>
      <h1 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(2rem, 5vw + 0.5rem, 3.6rem)',
        fontWeight: 500,
        color: '#1c1814',
        margin: 0, marginBottom: 10,
        lineHeight: 1.05, letterSpacing: '-0.01em',
      }}>
        Where the <em style={{ fontStyle: 'italic', fontWeight: 400, ...brassClipStyle }}>discourse</em> lives
      </h1>
      <p style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: 'clamp(0.95rem, 0.5vw + 0.85rem, 1.1rem)',
        color: '#5a5248', fontStyle: 'italic', lineHeight: 1.7,
        maxWidth: '60ch', margin: 0,
      }}>{subtitle}</p>
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────────────────

function TabBar({ activeKey, onChange }) {
  const tabs = [
    { key: 'feed',         label: 'Feed' },
    { key: 'contributors', label: 'Contributors' },
  ];

  return (
    <div
      role="tablist"
      style={{
        display: 'flex', gap: 0,
        borderBottom: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
        marginBottom: 'clamp(14px, 2vw, 22px)',
        // Horizontal scroll on narrow viewports keeps tabs intact;
        // padding at the right preserves the underline length.
        overflowX: 'auto', WebkitOverflowScrolling: 'touch',
      }}
    >
      {tabs.map((t) => {
        const active = activeKey === t.key;
        return (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.key)}
            style={{
              fontFamily:    "'DM Mono', monospace",
              fontSize:      11,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              padding:       '12px 22px',
              border:        'none',
              borderBottom:  active
                ? '2px solid var(--brass-mid, #b8862e)'
                : '2px solid transparent',
              background:    'transparent',
              color:         active ? '#1c1814' : '#7a7068',
              cursor:        'pointer',
              marginBottom:  -1,
              whiteSpace:    'nowrap',
              transition:    'color 0.15s, border-color 0.15s',
            }}
          >{t.label}</button>
        );
      })}
    </div>
  );
}

// ─── Top-level shell ────────────────────────────────────────────────────

export default function DialectaCommunity({ viewerGhostId }) {
  const initial = typeof window !== 'undefined' ? readUrlState() : { author: null, tab: null };

  const [authorId, setAuthorId] = useState(initial.author);
  // Tab default: signed-in → feed, signed-out → contributors. URL param wins.
  const [tab, setTab] = useState(
    initial.tab === 'feed' || initial.tab === 'contributors'
      ? initial.tab
      : (viewerGhostId ? 'feed' : 'contributors')
  );

  // Browser back/forward should swap views without a full reload.
  useEffect(() => {
    function onPop() {
      const s = readUrlState();
      setAuthorId(s.author);
      if (s.tab === 'feed' || s.tab === 'contributors') setTab(s.tab);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const openAuthor = useCallback((memberId) => {
    setAuthorId(memberId);
    pushUrlState({ author: memberId, tab: null });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const closeAuthor = useCallback(() => {
    setAuthorId(null);
    pushUrlState({ author: null, tab: tab });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab]);

  const switchTab = useCallback((nextTab) => {
    setTab(nextTab);
    pushUrlState({ author: null, tab: nextTab });
  }, []);

  // ── Author View takes over when ?author= is set ────────────────────────
  if (authorId) {
    return (
      <div style={{
        maxWidth: 920, margin: '0 auto',
        padding: 'clamp(10px, 2vw, 28px) clamp(20px, 4vw, 32px) clamp(48px, 6vw, 96px)',
      }}>
        <DialectaCommunityAuthor
          memberId={authorId}
          viewerGhostId={viewerGhostId}
          onBack={closeAuthor}
        />
      </div>
    );
  }

  // ── Default: Hero + Tabs + active-tab body ─────────────────────────────
  const subtitle = tab === 'contributors'
    ? 'Every member with a Dialecta profile. Search, filter by archetype or Steward Order, and find the voices you want to follow.'
    : 'Articles climbing on Forum-tier engagement, threads worth rereading, and the people quietly raising the level. Curated, never algorithmically amplified.';

  return (
    <div style={{
      maxWidth: 920, margin: '0 auto',
      padding: 'clamp(10px, 2vw, 32px) clamp(20px, 4vw, 32px) clamp(48px, 6vw, 96px)',
    }}>
      <CommunityHero subtitle={subtitle} />

      <TabBar activeKey={tab} onChange={switchTab} />

      {tab === 'feed' && (
        <DialectaCommunityFeed viewerGhostId={viewerGhostId} />
      )}
      {tab === 'contributors' && (
        <DialectaCommunityContributors
          viewerGhostId={viewerGhostId}
          onOpenAuthor={openAuthor}
        />
      )}
    </div>
  );
}
