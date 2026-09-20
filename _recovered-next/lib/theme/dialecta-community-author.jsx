/**
 * dialecta-community-author.jsx
 *
 * Author View — a mode of the Community page activated by ?author=<member_id>.
 *
 * Renders, for one contributor:
 *   1. Header card: avatar, italic Cormorant name, bio, archetype + Order
 *      chips, Follow / Following toggle (signed-in viewers), and a
 *      "Visit full profile" link back to the identity surface.
 *   2. Their Writing — every article they've authored, newest first,
 *      brass-on-paper cards with topic chip + tier badge + excerpt.
 *      Filterable by topic + tier; the unfiltered default shows everything.
 *   3. Their Voice in the Conversation — up to ten Forum-tier comments
 *      they've posted, each linked to the parent article.
 *
 * Three-surface model (memory: project_three_surface_model):
 *   - The profile page is the IDENTITY surface (Fingerprint, archetype,
 *     relationships). It does NOT show this contributor's article list.
 *   - The Author View IS where "what this writer has made" lives, on the
 *     Community page so the breadth-of-work browse mode sits alongside
 *     the platform's other discovery surfaces (Feed, Contributors).
 *
 * Data: GET /api/profile/_author?member_id=<id> returns the bundle
 * (profile + articles + Forum comments). Single round-trip.
 *
 * Empty state: contributors with no articles get a soft paper card
 * inviting the viewer to follow so they're notified when something ships.
 * Critical for newly invited members who haven't published yet.
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

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
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

// ─── Avatar chip — gradient by dominant pillar (matches _list / _feed) ───

function AvatarChip({ name, color, secondaryColor, avatarUrl, size = 56 }) {
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
        letterSpacing: '0.02em',
        boxShadow: 'inset 0 0 0 2px rgba(255,255,255,0.12), 0 1px 0 rgba(74,40,16,0.08)',
        userSelect: 'none',
      }}
      aria-hidden="true"
    >
      {!avatarUrl && initials}
    </div>
  );
}

// ─── Follow / Following button (server-confirmed; mirrors ContributorsList) ─

function FollowButton({ targetGhostId, viewerGhostId, initialFollowing }) {
  const [following, setFollowing] = useState(!!initialFollowing);
  const [busy, setBusy] = useState(false);

  if (!viewerGhostId || viewerGhostId === targetGhostId) return null;

  async function toggle() {
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
    } catch (err) {
      // Revert on failure.
      setFollowing(!next);
      console.warn('Follow toggle failed:', err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        background:    following ? '#b8862e' : 'transparent',
        border:        '1.5px solid #b8862e',
        borderRadius:  6,
        padding:       '7px 16px',
        fontFamily:    "'DM Mono', monospace",
        fontSize:      10,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color:         following ? '#fbf6ea' : '#b8862e',
        cursor:        busy ? 'wait' : 'pointer',
        opacity:       busy ? 0.6 : 1,
        flexShrink:    0,
        transition:    'all 0.15s',
      }}
    >
      {busy ? '…' : following ? 'Following ✓' : '+ Follow'}
    </button>
  );
}

// ─── Article card on the writing list ───────────────────────────────────

function WritingCard({ article }) {
  const tier = TIER_BY_KEY[article.final_tier || article.declared_tier];
  const topicSlug = article.primary_tag?.slug;
  const topic = topicSlug && TOPICS[topicSlug] ? { slug: topicSlug, ...TOPICS[topicSlug] } : null;

  return (
    <a
      href={article.url}
      className="dialecta-paper dialecta-wood-frame"
      style={{
        display: 'block',
        padding: 'clamp(18px, 2.5vw, 26px)',
        borderRadius: 8,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'baseline', flexWrap: 'wrap',
        gap: 10, marginBottom: 10,
      }}>
        {topic && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, letterSpacing: '0.18em',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: 3,
            background: topic.color, color: '#fbf6ea',
          }}>{topic.label}</span>
        )}
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: '#7a7068',
          letterSpacing: '0.06em',
        }}>{formatDate(article.published_at)}</span>
        {tier && (
          <span style={{ marginLeft: 'auto' }}>
            <TierBadge tierKey={tier.key} size="sm" />
          </span>
        )}
      </div>

      <h3 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.3rem, 1.6vw + 0.6rem, 1.7rem)',
        fontWeight: 500,
        color: '#1c1814',
        margin: '0 0 8px 0',
        lineHeight: 1.18,
        letterSpacing: '-0.005em',
      }}>{article.title}</h3>

      {article.excerpt && (
        <p style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontSize: 'clamp(0.94rem, 0.4vw + 0.85rem, 1.05rem)',
          color: '#3a342c',
          lineHeight: 1.55,
          margin: 0,
        }}>{article.excerpt}</p>
      )}
    </a>
  );
}

// ─── Forum-tier comment card ────────────────────────────────────────────

function KeyCommentCard({ comment }) {
  return (
    <a
      href={comment.article?.url || '#'}
      className="dialecta-paper"
      style={{
        display: 'block',
        padding: 'clamp(16px, 2.2vw, 22px)',
        borderRadius: 6,
        border: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 10, flexWrap: 'wrap',
      }}>
        <TierBadge tierKey="forum" size="sm" />
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, color: '#7a7068',
          letterSpacing: '0.06em',
        }}>{relativeDate(comment.created_at)}</span>
      </div>

      <p style={{
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontSize: 'clamp(0.95rem, 0.4vw + 0.86rem, 1.05rem)',
        color: '#1c1814',
        lineHeight: 1.6,
        margin: '0 0 14px 0',
        // Truncate visually long comments to keep cards tidy. Full body is
        // available by clicking through to the parent article.
        display: '-webkit-box',
        WebkitLineClamp: 5, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{comment.body}</p>

      {comment.article && (
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 6,
          paddingTop: 12,
          borderTop: '1px dashed rgba(154,92,40,0.18)',
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 9, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#7a7068',
          }}>On →</span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1.02rem',
            color: '#3a342c',
          }}>{comment.article.title}</span>
        </div>
      )}
    </a>
  );
}

// ─── Section header ─────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, count }) {
  return (
    <div style={{ marginBottom: 'clamp(16px, 2vw, 22px)' }}>
      <div style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: 'var(--brass-mid, #b8862e)',
        marginBottom: 6,
      }}>{eyebrow}</div>
      <h2 style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 'clamp(1.4rem, 1.6vw + 0.7rem, 1.9rem)',
        fontWeight: 500,
        color: '#1c1814',
        margin: 0,
        lineHeight: 1.15,
      }}>
        {title}
        {typeof count === 'number' && (
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12, fontWeight: 400,
            color: '#7a7068', marginLeft: 12,
            letterSpacing: '0.05em',
          }}>{count}</span>
        )}
      </h2>
    </div>
  );
}

// ─── Filter chip strip (topics + tiers) ─────────────────────────────────

function ChipStrip({ items, activeKey, onChange, allLabel = 'All' }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      marginBottom: 'clamp(16px, 2vw, 22px)',
    }}>
      <button
        type="button"
        onClick={() => onChange(null)}
        style={{
          fontFamily:    "'DM Mono', monospace",
          fontSize:      10,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding:       '5px 11px',
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
              fontSize:      10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding:       '5px 11px',
              border:        active
                ? `1.5px solid ${item.color || '#b8862e'}`
                : '1px solid rgba(154,92,40,0.22)',
              borderRadius:  4,
              background:    active ? (item.color || '#b8862e') : 'transparent',
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

// ─── Header card ────────────────────────────────────────────────────────

function AuthorHeader({ profile, viewerGhostId, isFollowing }) {
  return (
    <section
      className="dialecta-paper dialecta-wood-frame"
      style={{
        padding: 'clamp(22px, 3vw, 36px)',
        borderRadius: 10,
        marginBottom: 'clamp(28px, 4vw, 44px)',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        gap: 'clamp(16px, 2.5vw, 24px)',
        flexWrap: 'wrap',
      }}>
        <AvatarChip
          name={profile.display_name}
          color={profile.color}
          secondaryColor={profile.secondaryColor}
          avatarUrl={profile.avatar_url}
          size={84}
        />

        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(1.9rem, 3vw + 0.6rem, 2.8rem)',
            fontWeight: 500,
            color: '#1c1814',
            margin: '0 0 6px 0',
            lineHeight: 1.05,
            letterSpacing: '-0.005em',
          }}>{profile.display_name || 'Anonymous Contributor'}</h1>

          {(profile.archetype || profile.order) && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8,
              marginBottom: 12,
            }}>
              {profile.archetype && (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: 'rgba(184,134,46,0.12)',
                  border: '1px solid rgba(184,134,46,0.32)',
                  color: '#6a4f1c',
                }}>{profile.archetype.label}</span>
              )}
              {profile.order && (
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10, letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: 'rgba(154,92,40,0.10)',
                  border: '1px solid rgba(154,92,40,0.30)',
                  color: '#5a3818',
                }}>The {profile.order.label}</span>
              )}
            </div>
          )}

          {profile.bio && (
            <p style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(0.98rem, 0.4vw + 0.88rem, 1.1rem)',
              color: '#3a342c',
              lineHeight: 1.55,
              margin: '0 0 16px 0',
              maxWidth: '60ch',
            }}>{profile.bio}</p>
          )}

          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            flexWrap: 'wrap',
          }}>
            <a
              href={`/profile/?id=${encodeURIComponent(profile.ghost_member_id)}`}
              style={{
                fontFamily:    "'DM Mono', monospace",
                fontSize:      10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color:         '#b8862e',
                textDecoration: 'none',
                borderBottom:  '1px solid rgba(184,134,46,0.4)',
                paddingBottom: 1,
              }}
            >Visit full profile →</a>

            <FollowButton
              targetGhostId={profile.ghost_member_id}
              viewerGhostId={viewerGhostId}
              initialFollowing={isFollowing}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Main component ─────────────────────────────────────────────────────

export default function DialectaCommunityAuthor({ memberId, viewerGhostId, onBack }) {
  const [bundle, setBundle] = useState(null);
  const [error,  setError]  = useState(null);

  // Filters apply to the writing list. v1 ships topic + tier filters; the
  // unfiltered default shows everything. The Forum-only "key comments"
  // section is server-filtered and does not get its own client filter.
  const [topicFilter, setTopicFilter] = useState(null);
  const [tierFilter,  setTierFilter]  = useState(null);

  useEffect(() => {
    setBundle(null);
    setError(null);
    if (!memberId) return;
    fetch(`${apiBase()}/api/profile/_author?member_id=${encodeURIComponent(memberId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then((json) => setBundle(json))
      .catch((err) => setError(err.message));
  }, [memberId]);

  const filteredArticles = useMemo(() => {
    if (!bundle?.articles) return [];
    return bundle.articles.filter((a) => {
      if (topicFilter && a.primary_tag?.slug !== topicFilter) return false;
      if (tierFilter && (a.final_tier || a.declared_tier) !== tierFilter) return false;
      return true;
    });
  }, [bundle, topicFilter, tierFilter]);

  // Topic chips show only the topics this contributor has actually
  // written about — no point offering a filter that returns zero.
  const topicChips = useMemo(() => {
    if (!bundle?.articles) return [];
    const slugs = new Set();
    for (const a of bundle.articles) {
      if (a.primary_tag?.slug && TOPICS[a.primary_tag.slug]) {
        slugs.add(a.primary_tag.slug);
      }
    }
    return TOPIC_LIST
      .filter((t) => slugs.has(t.slug))
      .map((t) => ({ key: t.slug, label: t.label, color: t.color }));
  }, [bundle]);

  const tierChips = useMemo(() => {
    if (!bundle?.articles) return [];
    const keys = new Set();
    for (const a of bundle.articles) {
      const k = a.final_tier || a.declared_tier;
      if (k) keys.add(k);
    }
    return Array.from(keys).map((k) => ({
      key: k,
      label: TIER_BY_KEY[k]?.short || k,
      color: TIER_BY_KEY[k]?.border,
    }));
  }, [bundle]);

  if (error) {
    return (
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 32px)',
      }}>
        <p style={{
          fontFamily: "'DM Mono', monospace", fontSize: 12,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: '#b8372e',
        }}>Could not load this contributor: {error}</p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              marginTop: 16,
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#b8862e', background: 'transparent',
              border: 'none', cursor: 'pointer',
            }}
          >← Back to Community</button>
        )}
      </div>
    );
  }

  if (!bundle) {
    return (
      <div style={{
        maxWidth: 880, margin: '0 auto',
        padding: 'clamp(40px, 6vw, 80px) clamp(20px, 4vw, 32px)',
        fontFamily: "'DM Mono', monospace", fontSize: 11,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#7a7068',
      }}>Loading contributor…</div>
    );
  }

  const hasArticles = (bundle.articles?.length ?? 0) > 0;
  const hasComments = (bundle.keyComments?.length ?? 0) > 0;

  return (
    <div style={{
      maxWidth: 880, margin: '0 auto',
      padding: 'clamp(20px, 4vw, 56px) clamp(20px, 4vw, 32px) clamp(60px, 8vw, 120px)',
    }}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            marginBottom: 'clamp(20px, 3vw, 32px)',
            fontFamily: "'DM Mono', monospace",
            fontSize: 10, letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#b8862e', background: 'transparent',
            border: 'none', padding: 0, cursor: 'pointer',
          }}
        >← Back to Community</button>
      )}

      <AuthorHeader
        profile={bundle.profile}
        viewerGhostId={viewerGhostId}
      />

      <section style={{ marginBottom: 'clamp(40px, 5vw, 64px)' }}>
        <SectionHeader
          eyebrow="Their Writing"
          title={hasArticles ? 'Articles' : 'No articles yet'}
          count={hasArticles ? bundle.articles.length : undefined}
        />

        {hasArticles && (topicChips.length > 1 || tierChips.length > 1) && (
          <div style={{ marginBottom: 6 }}>
            {topicChips.length > 1 && (
              <ChipStrip
                items={topicChips}
                activeKey={topicFilter}
                onChange={setTopicFilter}
                allLabel="All topics"
              />
            )}
            {tierChips.length > 1 && (
              <ChipStrip
                items={tierChips}
                activeKey={tierFilter}
                onChange={setTierFilter}
                allLabel="All tiers"
              />
            )}
          </div>
        )}

        {hasArticles ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredArticles.map((a) => (
              <WritingCard key={a.ghost_post_id} article={a} />
            ))}
            {filteredArticles.length === 0 && (
              <p style={{
                fontFamily: "'Source Serif 4', Georgia, serif",
                fontStyle: 'italic',
                color: '#7a7068', padding: '12px 0',
              }}>No articles match those filters.</p>
            )}
          </div>
        ) : (
          <div
            className="dialecta-paper"
            style={{
              padding: 'clamp(24px, 3vw, 36px)',
              borderRadius: 8,
              border: '1px dashed rgba(154,92,40,0.30)',
              textAlign: 'center',
            }}
          >
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1.05rem, 0.5vw + 0.95rem, 1.2rem)',
              color: '#3a342c',
              lineHeight: 1.5,
              margin: '0 auto 14px',
              maxWidth: '46ch',
            }}>
              {bundle.profile.display_name || 'This contributor'} hasn't published yet.
              {viewerGhostId && viewerGhostId !== bundle.profile.ghost_member_id &&
                ' Follow to see their writing the moment it ships.'}
            </p>
            {viewerGhostId && viewerGhostId !== bundle.profile.ghost_member_id && (
              <FollowButton
                targetGhostId={bundle.profile.ghost_member_id}
                viewerGhostId={viewerGhostId}
              />
            )}
          </div>
        )}
      </section>

      {hasComments && (
        <section>
          <SectionHeader
            eyebrow="Their Voice in the Conversation"
            title="Forum-tier Contributions"
            count={bundle.keyComments.length}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bundle.keyComments.map((c) => (
              <KeyCommentCard key={c.id} comment={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
