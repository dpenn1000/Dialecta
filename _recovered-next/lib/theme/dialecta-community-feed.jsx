/**
 * dialecta-community-feed.jsx
 *
 * The Community feed — the dopamine-for-good engine.
 *
 * Renders a single mixed stream of four content types per
 * Dialecta_Social_UX_Architecture.md:
 *
 *   1. Article          — Hot+Relevant. Forum-tier-weighted score.
 *      That single architectural decision encodes the platform's values
 *      into what climbs the feed (memory: project_three_surface_model).
 *   2. Thread Spotlight — curated 2-3 comment exchanges where a position
 *      got refined / a counterargument got acknowledged. The platform's
 *      "primary viral unit" per the spec.
 *   3. Identity Event   — milestones and shifts the contributor would
 *      want surfaced (archetype shift, Sparring Partner recognition,
 *      first Forum-tier comment, Fingerprint pillar milestone, aspiration
 *      declared, recommitment, etc.). Risk 3: surface milestones, NEVER
 *      activity volume. Recognition vs. surveillance.
 *   4. Opinion Map Topology Change — when aggregate community opinion on
 *      a Cartesian or ternary plot shifts meaningfully after a thread.
 *      v1: empty array (computation deferred to v1.5).
 *
 * Data:
 *   GET /api/profile/_feed?viewer=<ghost_member_id>&limit=N
 *
 * The endpoint already exists, returns the four types tagged. This file
 * is the render layer + the filter / sort / view-mode kit.
 *
 * Cuts (sub-tabs within Feed):
 *   - Global       — everyone (default for cold-start viewers)
 *   - Following    — items where the subject is in the viewer's source
 *                    graph. Default for viewers with sources.
 *
 * Filters:
 *   - Content type chips (Articles / Spotlights / Identity / Topology)
 *   - Topic chips (12 canonical TOPICS) — surfaces only when at least one
 *     article on the current page carries a recognised topic.
 *
 * Sort:
 *   - Hot (server-side ranking; what the API returns by default)
 *   - Newest (client-side reorder by published_at / created_at)
 *
 * Constraints honored (per feed-architecture handoff):
 *   - No algorithmic amplification beyond the documented Forum-weighted
 *     Hot ranking.
 *   - No comment composition on the feed (friction stays where it is).
 *   - Tier badges visible everywhere on Article + Spotlight cards.
 *   - Identity Events surface milestones, never raw activity counts.
 *
 * Future surfaces (TUNING):
 *   - Time window slicing (24h / week / month / all) — needs `since=`
 *     query support on _feed.
 *   - "Mute / hide" off-ramp on each card — Risk 4 in the architecture
 *     doc; ships in Phase 2.5.
 *   - Most-discussed sort — depends on votes + threading.
 *   - Personalized topic affinity — needs viewer's read history.
 */

import { useEffect, useMemo, useState } from 'react';
import TierBadge, { TIER_BY_KEY } from './dialecta-tier-badge.jsx';
import { TOPICS, TOPIC_LIST } from './topics.js';

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

function relativeDate(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const day = 86400 * 1000;
  if (diff < 60 * 1000)        return 'just now';
  if (diff < 60 * 60 * 1000)   return Math.floor(diff / 60000) + 'm ago';
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + 'h ago';
  if (diff < 7 * day)          return Math.floor(diff / day) + 'd ago';
  if (diff < 30 * day)         return Math.floor(diff / (7 * day)) + 'w ago';
  if (diff < 365 * day)        return Math.floor(diff / (30 * day)) + 'mo ago';
  return Math.floor(diff / (365 * day)) + 'y ago';
}

// ─── Subject avatar (matches profile chip styling) ──────────────────────

function SubjectAvatar({ subject, size = 36 }) {
  if (!subject) return null;
  return (
    <div
      style={{
        width: size, height: size, flexShrink: 0,
        borderRadius: '50%',
        background: subject.avatar_url
          ? `url(${subject.avatar_url}) center/cover`
          : `linear-gradient(135deg, ${subject.color || '#7a7068'} 0%, ${subject.secondaryColor || subject.color || '#7a7068'} 100%)`,
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
      {!subject.avatar_url && computeInitials(subject.display_name)}
    </div>
  );
}

// ─── Card frame ─────────────────────────────────────────────────────────

function CardFrame({ children, href, eyebrow, eyebrowColor, accent }) {
  const Element = href ? 'a' : 'div';
  return (
    <Element
      href={href || undefined}
      className={href ? 'dialecta-paper dialecta-wood-frame' : 'dialecta-paper'}
      style={{
        display: 'block',
        padding: 'clamp(16px, 2.4vw, 24px)',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
        border: href ? undefined : '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
        position: 'relative',
        ...(accent ? { borderTop: `3px solid ${accent}` } : {}),
      }}
    >
      {eyebrow && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9, letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: eyebrowColor || '#7a7068',
          marginBottom: 10,
        }}>{eyebrow}</div>
      )}
      {children}
    </Element>
  );
}

// ─── Article card (Hot + Relevant) ──────────────────────────────────────

function ArticleCard({ item }) {
  const tier = TIER_BY_KEY[item.final_tier || item.declared_tier];
  const topicSlug = item.primary_tag?.slug;
  const topic = topicSlug && TOPICS[topicSlug] ? { slug: topicSlug, ...TOPICS[topicSlug] } : null;

  return (
    <CardFrame
      href={item.url}
      eyebrow={item.hot_score > 0 ? 'Trending · Forum-engaged' : 'Recent article'}
      eyebrowColor={item.hot_score > 0 ? '#b8862e' : '#7a7068'}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
        gap: 10, marginBottom: 10,
      }}>
        {topic && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, letterSpacing: '0.16em',
            textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: 3,
            background: topic.color, color: '#fbf6ea',
          }}>{topic.label}</span>
        )}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: '#7a7068',
        }}>{relativeDate(item.published_at)}</span>
        {tier && (
          <span style={{ marginLeft: 'auto' }}>
            <TierBadge tierKey={tier.key} size="sm" />
          </span>
        )}
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.25rem, 1.5vw + 0.55rem, 1.55rem)',
        fontWeight: 500,
        color: '#1c1814',
        margin: '0 0 12px 0',
        lineHeight: 1.18,
        letterSpacing: '-0.005em',
      }}>{item.title}</h3>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flexWrap: 'wrap',
        paddingTop: 10,
        borderTop: '1px dashed rgba(154,92,40,0.18)',
      }}>
        {item.author && (
          // Author name + avatar is its own click target that goes to
          // the contributor's profile rather than the article. Rendered
          // as a <button> because the parent CardFrame is an <a> — nested
          // anchors are invalid HTML, but a button inside an anchor is
          // fine, and we navigate programmatically with preventDefault +
          // stopPropagation so the article-link click is suppressed.
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (item.author.member_id) {
                window.location.href = '/profile/?id=' + encodeURIComponent(item.author.member_id);
              }
            }}
            aria-label={`Visit ${item.author.display_name}'s profile`}
            style={{
              all: 'unset',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              borderRadius: 4,
              padding: '2px 6px 2px 2px',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,168,74,0.10)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <SubjectAvatar subject={item.author} size={28} />
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: '1rem', color: '#3a342c',
            }}>{item.author.display_name}</span>
          </button>
        )}
        {item.comment_count > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, color: '#7a7068',
            letterSpacing: '0.06em',
          }}>{item.comment_count} {item.comment_count === 1 ? 'comment' : 'comments'}</span>
        )}
      </div>
    </CardFrame>
  );
}

// ─── Identity event card ────────────────────────────────────────────────
// Each event type rendered with a tailored eyebrow + headline. Falls back
// to a generic shape for any new event type that lands before this file
// is updated to handle it. The display_payload is precomputed at write
// time on the API side, so we read its fields directly when present.

const EVENT_PRESENTATION = {
  archetype_shift: {
    eyebrow: 'Archetype shift',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} is moving toward ${p.toLabel || 'a new pattern'}.`,
  },
  fingerprint_milestone: {
    eyebrow: 'Fingerprint milestone',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'}'s ${p.pillar || 'pillar'} crossed ${p.threshold ?? 'a milestone'}.`,
  },
  sparring_partner_recognized: {
    eyebrow: 'Sparring Partners',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} & ${p.partner_name || 'someone'} are sparring partners now.`,
  },
  sparring_partner_archetype_shift: {
    eyebrow: 'Sparring archetype shift',
    headline: (p, s) => `${s?.display_name ?? 'A sparring partner'} is shifting toward ${p.toLabel || 'a new pattern'}.`,
  },
  aspiration_declared: {
    eyebrow: 'Aspiration declared',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} declared: "${p.aspiration || '...'}"`,
  },
  recommitment: {
    eyebrow: 'Recommitment',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} recommitted to ${p.aspiration || 'an aspiration'}.`,
  },
  first_forum_comment: {
    eyebrow: 'First Forum-tier',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} just earned their first Forum-tier comment.`,
  },
  new_reader: {
    eyebrow: 'New Reader',
    headline: (p, s) => `${p.reader_name || 'Someone new'} is now reading ${s?.display_name ?? 'this contributor'}.`,
  },
  correspondent_established: {
    eyebrow: 'Correspondents',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} & ${p.partner_name || 'someone'} are correspondents.`,
  },
  source_milestone: {
    eyebrow: 'Source milestone',
    headline: (p, s) => `${s?.display_name ?? 'A Source'} reached ${p.milestone || 'a milestone'}.`,
  },
  delta_acknowledged_published: {
    eyebrow: 'Delta acknowledged',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} published a Delta acknowledgement.`,
  },
};

function IdentityEventCard({ item }) {
  const presentation = EVENT_PRESENTATION[item.event_type] || {
    eyebrow: 'Event',
    headline: (p, s) => `${s?.display_name ?? 'A contributor'} · ${item.event_type.replace(/_/g, ' ')}`,
  };
  const headline = presentation.headline(item.display_payload || {}, item.subject);
  const inNetwork = item.relationship_to_viewer === 'source';

  return (
    <CardFrame
      eyebrow={presentation.eyebrow + (inNetwork ? ' · in your network' : '')}
      eyebrowColor={inNetwork ? '#b8862e' : '#7a7068'}
      accent={inNetwork ? 'var(--brass-mid, #b8862e)' : null}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        flexWrap: 'wrap',
      }}>
        <SubjectAvatar subject={item.subject} size={42} />
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.1rem, 1.2vw + 0.55rem, 1.35rem)',
            fontStyle: 'italic',
            color: '#1c1814',
            lineHeight: 1.35,
            margin: 0,
            letterSpacing: '-0.003em',
          }}>{headline}</p>
          {item.display_payload?.subline && (
            <p style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontSize: '0.95rem',
              color: '#3a342c',
              margin: '6px 0 0 0',
              lineHeight: 1.55,
            }}>{item.display_payload.subline}</p>
          )}
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, color: '#7a7068',
            marginTop: 8, letterSpacing: '0.06em',
          }}>{relativeDate(item.created_at)}</div>
        </div>
      </div>
    </CardFrame>
  );
}

// ─── Thread spotlight card ──────────────────────────────────────────────
// The spec calls Thread Spotlights the platform's "primary viral unit" —
// 2-3-comment exchanges where something interesting happened, both
// Forum-rated, with a "join this thread" entry point. Until the curation
// generator ships, the rendered shape is a graceful placeholder reading
// from display_payload (precomputed by the future generator).

function ThreadSpotlightCard({ item }) {
  const exchange = item.display_payload?.exchange || [];
  const articleTitle = item.display_payload?.article_title;
  const articleUrl   = item.display_payload?.article_url;

  return (
    <CardFrame
      href={articleUrl || undefined}
      eyebrow="Thread Spotlight · Forum × Forum"
      eyebrowColor="#b8862e"
      accent="var(--brass-bright, #d4a84a)"
    >
      {articleTitle && (
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '1.05rem',
          color: '#3a342c',
          margin: '0 0 12px 0',
        }}>On {articleTitle}</p>
      )}

      {exchange.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {exchange.slice(0, 3).map((c, i) => (
            <div
              key={i}
              style={{
                padding: '10px 14px',
                borderLeft: `3px solid ${i === 0 ? '#d4a84a' : '#9a5c28'}`,
                background: 'rgba(254,250,234,0.6)',
                borderRadius: 4,
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: '0.95rem',
                  color: '#3a342c',
                }}>{c.author_name || 'Contributor'}</span>
                <TierBadge tierKey={c.tier || 'forum'} size="sm" />
              </div>
              <p style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontSize: '0.95rem',
                color: '#1c1814',
                lineHeight: 1.55,
                margin: 0,
              }}>{c.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: 'italic',
          color: '#7a7068',
          margin: '0 0 6px 0',
        }}>{item.display_payload?.headline || 'A Forum-tier exchange worth re-reading.'}</p>
      )}

      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, color: '#b8862e',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        marginTop: 12,
      }}>Join the thread →</div>
    </CardFrame>
  );
}

// ─── Topology change card ───────────────────────────────────────────────

function TopologyCard({ item }) {
  return (
    <CardFrame
      eyebrow="Opinion Topology"
      eyebrowColor="#3a3888"
      accent="#3a3888"
    >
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: 'italic',
        fontSize: '1.1rem',
        color: '#1c1814',
        margin: '0 0 8px 0',
        lineHeight: 1.35,
      }}>{item.display_payload?.headline || 'Community opinion shifted on this thread.'}</p>
      {item.display_payload?.subline && (
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: '0.95rem',
          color: '#3a342c',
          lineHeight: 1.55,
          margin: 0,
        }}>{item.display_payload.subline}</p>
      )}
    </CardFrame>
  );
}

// ─── Filter chip strip (shared layout) ──────────────────────────────────

function ChipStrip({ items, activeKey, onChange, allLabel = 'All' }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 6,
    }}>
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 9, letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '4px 10px',
          border: activeKey == null
            ? '1.5px solid #b8862e'
            : '1px solid rgba(154,92,40,0.22)',
          borderRadius: 4,
          background: activeKey == null ? '#b8862e' : 'transparent',
          color: activeKey == null ? '#fbf6ea' : '#3a342c',
          cursor: 'pointer',
        }}
      >{allLabel}</button>
      {items.map((it) => {
        const active = activeKey === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(active ? null : it.key)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '4px 10px',
              border: active
                ? `1.5px solid ${it.color || '#b8862e'}`
                : '1px solid rgba(154,92,40,0.22)',
              borderRadius: 4,
              background: active ? (it.color || '#b8862e') : 'transparent',
              color: active ? '#fbf6ea' : '#3a342c',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >{it.label}</button>
        );
      })}
    </div>
  );
}

const TYPE_CHIPS = [
  { key: 'article',   label: 'Articles' },
  { key: 'spotlight', label: 'Spotlights', color: '#d4a84a' },
  { key: 'identity',  label: 'Identity Events' },
  { key: 'topology',  label: 'Opinion Map', color: '#3a3888' },
];

const SORT_CHIPS = [
  { key: 'hot',    label: 'Hot' },
  { key: 'newest', label: 'Newest' },
];

// ─── Main component ──────────────────────────────────────────────────────

export default function DialectaCommunityFeed({ viewerGhostId }) {
  const [feed,         setFeed]         = useState(null);
  const [error,        setError]        = useState(null);
  const [cut,          setCut]          = useState(null); // null = decided post-fetch by viewer_has_network
  const [typeFilter,   setTypeFilter]   = useState(null);
  const [topicFilter,  setTopicFilter]  = useState(null);
  const [sortKey,      setSortKey]      = useState('hot');

  useEffect(() => {
    setFeed(null); setError(null);
    const params = new URLSearchParams();
    if (viewerGhostId) params.set('viewer', viewerGhostId);
    params.set('limit', '40');
    fetch(`${apiBase()}/api/profile/_feed?${params.toString()}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((json) => {
        setFeed(json);
        // Default cut decided once on first load. Viewers with sources
        // see Following first; cold-start sees Global. Manual override
        // sticks until next page reload.
        if (cut == null) {
          setCut(json.viewer_has_network ? 'following' : 'global');
        }
      })
      .catch((err) => setError(err.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewerGhostId]);

  const items = feed?.items || [];

  // Topic chips derived from the feed itself — only chips that have at
  // least one matching article are surfaced.
  const topicChips = useMemo(() => {
    const slugs = new Set();
    for (const it of items) {
      if (it.type === 'article' && it.primary_tag?.slug && TOPICS[it.primary_tag.slug]) {
        slugs.add(it.primary_tag.slug);
      }
    }
    return TOPIC_LIST
      .filter((t) => slugs.has(t.slug))
      .map((t) => ({ key: t.slug, label: t.label, color: t.color }));
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];

    // Cut: 'following' keeps Identity Events tagged 'source' AND all
    // articles authored by anyone the viewer follows. Articles without
    // a relationship tag fall through; this is intentional v1 — once
    // articles carry an `author_in_network` flag, this will tighten.
    if (cut === 'following' && viewerGhostId) {
      list = list.filter((it) => {
        if (it.type === 'identity' || it.type === 'spotlight') {
          return it.relationship_to_viewer === 'source';
        }
        // Articles: keep all in v1; precise filter waits for follow-tag on articles.
        return true;
      });
    }

    if (typeFilter) {
      list = list.filter((it) => it.type === typeFilter);
    }
    if (topicFilter) {
      list = list.filter((it) => {
        if (it.type !== 'article') return true;
        return it.primary_tag?.slug === topicFilter;
      });
    }
    if (sortKey === 'newest') {
      list.sort((a, b) => {
        const at = a.published_at || a.created_at || '';
        const bt = b.published_at || b.created_at || '';
        return bt.localeCompare(at);
      });
    }
    // 'hot' = the order the API returned, which is already
    // hot_score-sorted for articles and recency for events. We do not
    // re-sort there.

    return list;
  }, [items, cut, typeFilter, topicFilter, sortKey, viewerGhostId]);

  if (error) {
    return (
      <p style={{
        fontFamily: "'DM Mono', monospace", fontSize: 12,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#b8372e', padding: '20px 0',
      }}>Could not load feed: {error}</p>
    );
  }

  if (!feed) {
    return (
      <p style={{
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#7a7068', padding: '20px 0',
      }}>Loading feed…</p>
    );
  }

  return (
    <div>
      {/* Cut sub-tabs (only when the viewer has a network) */}
      {viewerGhostId && feed.viewer_has_network && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 14,
        }}>
          {[
            { key: 'following', label: 'Following' },
            { key: 'global',    label: 'Global' },
          ].map((c) => {
            const active = cut === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCut(c.key)}
                style={{
                  fontFamily:    "'DM Mono', monospace",
                  fontSize:      11, letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding:       '8px 16px',
                  border:        active ? '1.5px solid #b8862e' : '1px solid rgba(154,92,40,0.22)',
                  borderRadius:  6,
                  background:    active ? '#b8862e' : 'transparent',
                  color:         active ? '#fbf6ea' : '#3a342c',
                  cursor:        'pointer',
                }}
              >{c.label}</button>
            );
          })}
        </div>
      )}

      {/* Content type + topic + sort filters */}
      <div
        className="dialecta-paper"
        style={{
          padding: 'clamp(12px, 1.8vw, 18px)',
          borderRadius: 8,
          border: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
          marginBottom: 18,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        <ChipStrip
          items={TYPE_CHIPS}
          activeKey={typeFilter}
          onChange={setTypeFilter}
          allLabel="All types"
        />
        {topicChips.length > 1 && (
          <ChipStrip
            items={topicChips}
            activeKey={topicFilter}
            onChange={setTopicFilter}
            allLabel="All topics"
          />
        )}
        <ChipStrip
          items={SORT_CHIPS.filter((s) => s.key !== 'hot')}
          activeKey={sortKey === 'hot' ? null : sortKey}
          onChange={(k) => setSortKey(k || 'hot')}
          allLabel="Hot"
        />
      </div>

      {filtered.length === 0 ? (
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: 'italic',
          color: '#7a7068',
          padding: '24px 0',
        }}>
          {cut === 'following'
            ? 'Nothing from your network yet. Switch to Global to see what the wider community is doing.'
            : (typeFilter || topicFilter)
              ? 'No items match those filters.'
              : 'The feed is quiet right now. Check back soon.'}
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((item) => {
            switch (item.type) {
              case 'article':
                return <ArticleCard key={item.ghost_post_id} item={item} />;
              case 'identity':
                return <IdentityEventCard key={`id-${item.event_id}`} item={item} />;
              case 'spotlight':
                return <ThreadSpotlightCard key={`sp-${item.event_id}`} item={item} />;
              case 'topology':
                return <TopologyCard key={`top-${item.event_id || Math.random()}`} item={item} />;
              default:
                return null;
            }
          })}
        </div>
      )}

      {/* Quiet, honest "still building" note when the non-Article content
          types haven't hit the feed yet. This is platform's "not all
          features ship at once" disclosure, not a marketing line. */}
      {items.every((i) => i.type === 'article') && (
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '0.92rem',
          color: '#7a7068',
          textAlign: 'center',
          marginTop: 'clamp(28px, 4vw, 40px)',
          maxWidth: '50ch',
          marginLeft: 'auto', marginRight: 'auto',
          lineHeight: 1.5,
        }}>
          Thread spotlights, identity events, and opinion-map shifts will appear here as the community grows.
        </p>
      )}
    </div>
  );
}
