import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { Fingerprint } from './dialecta-fingerprint-engine';
import DialectaProfileResponsive from './dialecta-profile.jsx';
import { useProfileData, mergeProfileWithGhost } from './dialecta-profile-data.js';
import { EditProfilePanel } from './dialecta-profile-edit.jsx';
import { SettingsDrawer } from './dialecta-profile-settings.jsx';
import DialectaEditor from './dialecta-editor.jsx';
import DialectaPrivateDraft from './dialecta-private-draft.jsx';
import DialectaDiscourseLayer from './dialecta-discourse-layer.jsx';
import { ArticleTierBadge, ArticleDeclaration } from './dialecta-article-classification.jsx';
import { ArticlePreReadMap } from './dialecta-opinion-map-placement.jsx';
import AdminRepolishMount from './dialecta-admin-repolish.jsx';
import DialectaSidebar, {
  DialectaSidebarMobileTOC,
  DialectaSidebarMobileQuote,
} from './dialecta-sidebar.jsx';
import DialectaCommunity from './dialecta-community.jsx';
import BellWithDrawer from './dialecta-notifications-bell.jsx';
import DialectaNotificationsPage from './dialecta-notifications-page.jsx';
import SignupInvite from './dialecta-signup-invite.jsx';
// ── PROFILE LIVE FEED FETCH ─────────────────────────────────────────────
// The Profile page Live Feed pulls a single mixed array of items from
// /api/profile/_feed. Items carry { type: 'article'|'identity'|'spotlight'
// |'topology', ... }, server-shaped for direct render via LiveFeedItem.
//
// `viewer` enables relationship-tagging on items (subjects in the
// viewer's follow graph come back tagged relationship='source'). Empty
// viewer = cold-start = the same global-public stream.
//
// This replaced an earlier Ghost Content API fetch that was wrong on
// authorship — Ghost-side authorship is the house staff user for every
// Dialecta-submitted article, so real bylines have to come from the
// Dialecta articles + profiles tables joined server-side.
function useProfileFeed({ viewer, limit = 20 }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    const params = new URLSearchParams();
    if (viewer) params.set('viewer', viewer);
    params.set('limit', String(limit));
    fetch(`${base}/api/profile/_feed?${params.toString()}`)
      .then(r => {
        if (!r.ok) throw new Error(`Feed ${r.status}`);
        return r.json();
      })
      .then(json => setItems(json.items || []))
      .catch(err => console.error('[Dialecta] Feed fetch failed:', err))
      .finally(() => setLoading(false));
  }, [viewer, limit]);

  return { items, loading };
}

// ── Responsive hook ──────────────────────────────────────────────────────
// Mirrors the same hook in dialecta-profile.jsx and dialecta-editor.jsx.
// Same canonical 1100px lg breakpoint. Local copy here keeps index.jsx
// self-contained — extracting to a shared module is fine future work.
function useIsDesktop(query = "(min-width: 1100px)") {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [query]);
  return isDesktop;
}

// ── HERO CAROUSEL — three seed contributors fetched from the API ─────────
// All per-profile data (display name, archetype label, fingerprint shape,
// resonance, bio) flows from /api/profile/:id. The only thing hardcoded is
// the list of three seed IDs we want to feature on the fingerprint page.
const HERO_SEED_IDS = ['seed:maya', 'seed:wen', 'seed:anselm'];

// Wrap the API's flat axisScores ({ acuity: 14, ... }) into the per-axis
// object shape the Fingerprint engine consumes. Engine v2.0.0 uses canonical
// v1.1 pillar names — no translation layer. tierMix/topicPhases stay empty
// until the axis_events ledger is wired in; petals render at correct height
// without inner texture.
function axisScoresToFingerprintData(axisScores) {
  const sc = axisScores ?? {};
  return {
    acuity:      { graduations: sc.acuity      ?? 0, tierMix: {}, topicPhases: [] },
    calibration: { graduations: sc.calibration ?? 0, tierMix: {}, topicPhases: [] },
    magnanimity: { graduations: sc.magnanimity ?? 0, tierMix: {}, topicPhases: [] },
    discourse:   { graduations: sc.discourse   ?? 0, tierMix: {}, topicPhases: [] },
    consistency: { graduations: sc.consistency ?? 0, tierMix: {}, topicPhases: [] },
    reach:       { graduations: sc.reach       ?? 0, tierMix: {}, topicPhases: [] },
  };
}

function useHeroProfiles() {
  const [profiles, setProfiles] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    Promise.all(
      HERO_SEED_IDS.map(id =>
        fetch(`${base}/api/profile/${id}`).then(r => {
          if (!r.ok) throw new Error(`${id}: ${r.status}`);
          return r.json();
        })
      )
    )
      .then(rows => {
        const byId = {};
        for (const row of rows) byId[row.ghost_member_id] = row;
        setProfiles(byId);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { profiles, loading, error };
}

function HeroCarousel() {
  const { profiles, loading, error } = useHeroProfiles();
  const [active, setActive] = useState(HERO_SEED_IDS[0]);
  const isDesktop = useIsDesktop();
  const T = {
    bgWhite:'#fffdf8', borderLight:'#e8e0d0', fontMono:"'DM Mono',monospace",
    fontDisplay:"'Cormorant Garamond',serif", fontReading:"'Source Serif 4',Georgia,serif",
    fontBody:"'DM Sans',sans-serif", amber:'#b8862e', gold:'#d4a84a',
    textPrimary:'#1c1814', textSecondary:'#5a5248', textTertiary:'#7a7068', goldPale:'#f5e8d0',
  };

  if (loading) {
    return (
      <div style={{background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:'48px 40px',textAlign:'center',fontFamily:T.fontMono,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary}}>
        Loading contributors…
      </div>
    );
  }

  if (error || !profiles) {
    return (
      <div style={{background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:'48px 40px',textAlign:'center',fontFamily:T.fontBody,fontSize:13,color:'#b8372e'}}>
        Could not load contributor data. Try refreshing.
      </div>
    );
  }

  const profile          = profiles[active];
  const fingerprintData  = axisScoresToFingerprintData(profile.axisScores);
  const archetypeLabel   = profile.archetype?.label ?? 'Pattern Still Forming';

  return (
    <div style={{
      background: T.bgWhite,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 12,
      padding: 'clamp(28px, 4vw, 48px) clamp(20px, 4vw, 40px)',
      boxShadow: '0 4px 24px rgba(28,24,20,0.05)',
      // 2026-04-29 stacked redesign: was a 1fr + 260px desktop grid that
      // overflowed the (sidebar-shrunk) page cell. Now always single
      // column. The "Three Contributors" picker sits ABOVE the
      // fingerprint so the editorial flow is: read what the section is →
      // pick a contributor → see their fingerprint as the visual payoff.
      // Mirrors the mobile column-reverse intent at every viewport.
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(24px, 3vw, 36px)',
      alignItems: 'stretch',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <div style={{background:`linear-gradient(135deg,${T.goldPale} 0%,${T.bgWhite} 75%)`,border:`1px solid ${T.gold}`,borderLeft:`4px solid ${T.amber}`,borderRadius:'0 10px 10px 0',padding:'24px 22px'}}>
        <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:T.amber,marginBottom:10}}>Three Contributors</div>
        <h3 style={{fontFamily:T.fontDisplay,fontSize:'1.4rem',fontWeight:500,color:T.textPrimary,marginBottom:10,fontStyle:'italic'}}>Compare</h3>
        <p style={{fontFamily:T.fontReading,fontSize:'0.85rem',lineHeight:1.6,color:T.textSecondary,marginBottom:16,fontStyle:'italic'}}>Three mature contributors with dramatically different engagement patterns. The same six pillars produce radically different shapes depending on how each person actually behaves.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {HERO_SEED_IDS.map(id => {
            const p = profiles[id];
            const isActive = active === id;
            const label = p.archetype?.label ?? 'Pattern Still Forming';
            // Whole card toggles the fingerprint preview. Profile navigation
            // is intentionally absent here — discovery flow is "see the
            // shape, then go to /community/?author= or /profile/?id= from
            // a richer surface." Clicking a name on the carousel SHOULD
            // re-render the carousel, not navigate away from the page.
            return (
              <div key={id} onClick={() => setActive(id)} role="button" tabIndex={0} style={{display:'block',padding:'12px 14px',background:isActive?T.bgWhite:'transparent',border:`1px solid ${isActive?T.amber:'rgba(184,115,42,0.25)'}`,borderRadius:6,cursor:'pointer',textAlign:'left',boxShadow:isActive?'0 2px 8px rgba(184,115,42,0.15)':'none',transition:'all 0.15s'}}>
                <div style={{fontFamily:T.fontDisplay,fontSize:'1rem',fontWeight:500,fontStyle:'italic',color:isActive?T.textPrimary:'#5a5248',lineHeight:1.2,marginBottom:3}}>
                  {p.display_name}
                </div>
                <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.06em',textTransform:'uppercase',color:isActive?T.amber:T.textTertiary}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* Fingerprint visual — the payoff. Shows the currently picked
          contributor's shape at full size, with their bio underneath.
          Was previously the LEFT column in a 1fr+260 grid; now sits
          under the picker as the next visual beat. */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24,paddingTop:'clamp(8px, 1vw, 16px)'}}>
        <Fingerprint
          key={active}
          data={fingerprintData}
          /* Mobile size 200 → SVG 272px wide (engine adds 36px label
             margin per side). Fits a 380px content area on Samsung
             S23 Ultra and any narrower phone with room to spare. The
             previous Math.min(380, 320) forced a 320px geometry =
             392px SVG, which overflowed the carousel column on
             phones. */
          size={isDesktop ? 380 : 200}
          resonance={profile.resonance ?? 0}
        />
        <div style={{maxWidth:520,borderTop:`1px solid ${T.borderLight}`,paddingTop:20,textAlign:'center'}}>
          <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:T.amber,marginBottom:6}}>About</div>
          <p style={{fontFamily:T.fontReading,fontSize:'0.95rem',lineHeight:1.65,color:T.textSecondary,margin:0,fontStyle:'italic'}}>{profile.bio}</p>
        </div>
      </div>
    </div>
  );
}

// ── PROFILE ROOT ────────────────────────────────────────────────────────
// Renders the profile page for a single contributor. Three viewing modes:
//   1. Own profile  — viewer is logged in and the targetMemberId matches their
//                     Ghost UUID. Edit button + settings hamburger are shown.
//   2. Other member — viewer is logged in but viewing someone else's profile
//                     via /profile/?id=<member_id>. No edit / settings.
//   3. Public visit — viewer is not logged in but is viewing a profile via
//                     /profile/?id=<member_id>. Same surface as (2). Per the
//                     "see into the party, sign up to get in" design, public
//                     visitors see public-facing fields with no interactions.
function ProfileRoot({ targetMemberId, isOwnProfile, viewerGhost }) {
  // Pass identity hints only on own-profile views so the API can seed the
  // lazy-created row with display_name and avatar_url. Cross-profile views
  // pass nothing; we never want to write the viewer's identity into someone
  // else's row.
  const ownHints = isOwnProfile
    ? { name: viewerGhost.name, avatar: viewerGhost.avatar_image }
    : null;
  const { data, loading, error, reload } = useProfileData(targetMemberId, ownHints);
  const { items: liveFeedItems } = useProfileFeed({ viewer: viewerGhost.id, limit: 20 });
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // Aspirational-archetype modal state lives at the parent so the
  // SettingsDrawer (rendered as a sibling to DialectaProfile) can open
  // the same modal the on-profile "+ Set aspiration" pill opens.
  const [showArchetype, setShowArchetype] = useState(false);

  // Settings drawer + hamburger reveal are owner-only.
  if (isOwnProfile) {
    window.__dialectaOpenSettings = () => setShowSettings(true);
  }

  useEffect(() => {
    if (!isOwnProfile) return;
    const btn = document.getElementById('dialecta-settings-btn');
    if (btn) btn.style.display = 'block';

    // ?settings=open URL param auto-opens the settings drawer on arrival.
    // The mobile hamburger drawer's "Settings" link navigates here as
    // /profile/?settings=open from any page. We consume the param,
    // open the drawer, and strip it from the URL so a manual refresh
    // doesn't reopen the drawer unexpectedly.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('settings') === 'open') {
        setShowSettings(true);
        url.searchParams.delete('settings');
        const cleaned = url.pathname
          + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '')
          + url.hash;
        window.history.replaceState({}, '', cleaned);
      }
    } catch { /* malformed URL — ignore */ }

    return () => { if (btn) btn.style.display = 'none'; };
  }, [isOwnProfile]);

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'DM Mono', monospace",
        fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase',
        color: '#8c8780',
      }}>
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 13, color: '#b8372e',
      }}>
        Could not load profile data.
      </div>
    );
  }

  // When viewing someone else, the viewer's Ghost session is irrelevant to
  // the displayed identity. Synthesize a stub so mergeProfileWithGhost has
  // the shape it expects; everything visible comes from the API response.
  const displayedGhost = isOwnProfile ? viewerGhost : {
    id:           targetMemberId,
    name:         '',
    email:        '',
    avatar_image: '',
    created_at:   '',
    is_author:    false,
  };

  const user = mergeProfileWithGhost(data, displayedGhost, isOwnProfile);

  const editControl = isOwnProfile ? (
    <button
      onClick={() => setEditing(true)}
      style={{
        background: 'transparent', border: '1px solid #e0dbd2',
        borderRadius: 4, padding: '5px 14px',
        fontFamily: "'DM Mono', monospace", fontSize: 9,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: '#8c8780', cursor: 'pointer',
      }}>
      Edit Profile
    </button>
  ) : null;

  return (
    <>
      <DialectaProfileResponsive
        user={user}
        viewerGhostId={viewerGhost.id}
        withChrome={false}
        editControl={editControl}
        isOwnProfile={isOwnProfile}
        onEdit={() => setEditing(true)}
        showSettings={showSettings}
        onCloseSettings={() => setShowSettings(false)}
        showArchetypeSelector={showArchetype}
        onOpenArchetypeSelector={() => setShowArchetype(true)}
        onCloseArchetypeSelector={() => setShowArchetype(false)}
        liveFeedItems={liveFeedItems}
        onProfileChange={reload}
      />
      {isOwnProfile && showSettings && (
        <SettingsDrawer
          user={user}
          memberUuid={targetMemberId}
          memberEmail={viewerGhost.email}
          onClose={() => setShowSettings(false)}
          onEditProfile={() => { setShowSettings(false); setEditing(true); }}
          onOpenArchetype={() => { setShowSettings(false); setShowArchetype(true); }}
        />
      )}
      {isOwnProfile && editing && (
        <EditProfilePanel
          ghostMemberId={targetMemberId}
          initial={{
            display_name: user.name,
            bio:          user.bio       ?? '',
            avatar_url:   user.avatarUrl ?? '',
            location:     user.location  ?? '',
          }}
          initials={user.initials}
          onSave={() => { setEditing(false); reload(); }}
          onCancel={() => setEditing(false)}
        />
      )}
    </>
  );
}

// ── COMMUNITY ───────────────────────────────────────────────────────────
// All Community-page rendering lives in ./dialecta-community.jsx (top
// shell + tabs + URL state) which delegates to:
//   - dialecta-community-feed.jsx         (Feed tab — 4 content types)
//   - dialecta-community-contributors.jsx (Contributors tab — filters)
//   - dialecta-community-author.jsx       (Author View, ?author=<id>)
//
// Mount block is below; everything else moved out of this file.

// ── COMMENTS / DISCOURSE WRAPPER ────────────────────────────────────────
// Owns the optimistic-comments state shared between the Private Draft
// (write side) and the Discourse Layer feed (read side). When Private
// Draft posts a comment, we prepend it locally for instant feedback and
// bump a refresh tick so the feed re-fetches and settles to the
// authoritative server-side list.
//
// Signed-out visitors get the feed in read-only mode with a sign-in
// nudge in place of the compose surface. The Pact requires authenticated
// identity for participation, but reading is always public.
function DialectaCommentsRoot({ article, member }) {
  const [optimistic, setOptimistic] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);
  // Reply mode state. When non-null, the next comment posted from the
  // composer is a reply to replyTo.id and the composer renders a
  // "Replying to X" banner. Cleared after a successful post or when the
  // user clicks Cancel reply.
  const [replyTo, setReplyTo] = useState(null);

  const handleReply = (parentComment) => {
    if (!parentComment) return;
    const body = parentComment.body || '';
    const excerpt = body.length > 120 ? body.slice(0, 120).trim() + '…' : body;
    setReplyTo({
      id:          parentComment.id,
      author_name: parentComment.author?.name || 'A contributor',
      excerpt,
    });
    // Scroll the composer into view so the writer doesn't have to hunt.
    if (typeof document !== 'undefined') {
      const root = document.getElementById('dialecta-comments');
      if (root && typeof root.scrollIntoView === 'function') {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePosted = (postedShape) => {
    // Reshape the Private Draft onPosted payload into the feed-card shape.
    setOptimistic((prev) => [{
      id: postedShape.comment_id || `optim-${Date.now()}`,
      body: postedShape.body,
      created_at: postedShape.published_at || new Date().toISOString(),
      hardened_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      published_at: postedShape.published_at,
      malleable: true,
      parent_id: postedShape.parent_id || null,
      author: { name: member?.name, member_id: member?.uuid },
      is_own: true,
      classification: {
        ai_suggested_tier: postedShape.ai_suggested_tier,
        self_declared_tier: postedShape.self_declared_tier,
        final_tier: postedShape.final_tier || postedShape.self_declared_tier || postedShape.ai_suggested_tier,
        commenter_message: postedShape.commenter_message,
      },
    }, ...prev]);
    // Reply mode is one-shot: clear after a successful post so the next
    // composer session starts top-level by default.
    setReplyTo(null);
    // Bump a tick so the feed refetches in ~2s. Optimistic dedup happens
    // in the feed by comment id.
    setTimeout(() => setRefreshTick((t) => t + 1), 2000);
  };

  const canCompose = !!(member && member.uuid && member.email);

  return (
    <>
      {canCompose ? (
        <DialectaPrivateDraft
          article={article}
          member={member}
          onPosted={handlePosted}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />
      ) : (
        <div style={{
          padding: 'clamp(24px, 4vw, 40px) clamp(16px, 4vw, 28px)',
          textAlign: 'center',
          fontFamily: "'DM Sans', sans-serif",
          color: '#8c8780',
          borderBottom: '1px solid var(--wood-edge, rgba(154,92,40,0.22))',
        }}>
          <a href="/signin/" style={{ color: '#b8862e' }}>Sign in</a>
          {' '}to join the conversation.
        </div>
      )}
      <DialectaDiscourseLayer
        articleId={article.id}
        viewerMember={member}
        articleClaims={article.claims}
        optimisticComments={optimistic}
        refreshTick={refreshTick}
        onReply={canCompose ? handleReply : null}
      />
    </>
  );
}

// ── ALL MOUNTS ──────────────────────────────────────────────────────────
function mountAll() {

  // No-op root (keeps Ghost happy)
  const appRoot = document.getElementById('dialecta-root');
  if (appRoot) {
    createRoot(appRoot).render(
      <div id="dialecta-root-ready" style={{display:'none'}} />
    );
  }

  // Profile page — three rendering paths depending on URL ?id= and auth state.
  const profileRoot = document.getElementById('dialecta-profile-root');
  if (profileRoot) {
    const viewerGhost = {
      id:           profileRoot.dataset.memberId      || '',
      name:         profileRoot.dataset.memberName    || 'Anonymous',
      email:        profileRoot.dataset.memberEmail   || '',
      avatar_image: profileRoot.dataset.memberAvatar  || '',
      created_at:   profileRoot.dataset.memberCreated || '',
      is_author:    false,
    };

    const params         = new URLSearchParams(window.location.search);
    const viewingId      = params.get('id');
    const targetMemberId = viewingId || viewerGhost.id;

    if (!targetMemberId) {
      // No ?id= and no Ghost session — nothing to render. Sign-in nudge.
      profileRoot.innerHTML =
        '<p style="padding:80px 40px;text-align:center;font-family:\'DM Sans\',sans-serif;color:#8c8780;">' +
        'Please <a href="/signin/" style="color:#b8862e;">sign in</a> to view your profile, or visit the ' +
        '<a href="/fingerprint/" style="color:#b8862e;">contributors page</a> to see example profiles.' +
        '</p>';
    } else {
      const isOwnProfile = !!viewerGhost.id && viewerGhost.id === targetMemberId;
      createRoot(profileRoot).render(
        <ProfileRoot
          targetMemberId={targetMemberId}
          isOwnProfile={isOwnProfile}
          viewerGhost={viewerGhost}
        />
      );
    }
  }

  // Community page — Feed / Contributors / Author View. Mount target is
  // rendered by page-community.hbs when Ghost serves /community/.
  // data-viewer-uuid is empty-string for signed-out visitors; the
  // component hides Follow buttons + "Following" view mode in that case.
  const communityRoot = document.getElementById('dialecta-community-root');
  if (communityRoot) {
    const viewerGhostId = communityRoot.dataset.viewerUuid || '';
    createRoot(communityRoot).render(<DialectaCommunity viewerGhostId={viewerGhostId} />);
  }

  // Write page — the article submission editor.
  const editorRoot = document.getElementById('dialecta-editor-root');
  if (editorRoot) {
    const memberUuid  = editorRoot.dataset.memberUuid  || '';
    const memberEmail = editorRoot.dataset.memberEmail || '';
    const memberName  = editorRoot.dataset.memberName  || '';

    if (memberUuid) {
      createRoot(editorRoot).render(
        <DialectaEditor
          memberUuid={memberUuid}
          memberEmail={memberEmail}
          memberName={memberName}
        />
      );
    } else {
      editorRoot.innerHTML =
        '<p style="padding:80px 40px;text-align:center;font-family:\'DM Sans\',sans-serif;color:#8c8780;">' +
        'Please <a href="/signin/" style="color:#b8862e;">sign in</a> to access the editor.' +
        '</p>';
    }
  }

  // ── COMMENTS / DISCOURSE LAYER ────────────────────────────────────────
  // Mounted on each post page via post.hbs. Renders the Private Draft
  // engine (compose ritual) and the Discourse Layer feed (cards, topology,
  // filter, sort, edit/delete) as siblings. When Private Draft posts a
  // comment, it's prepended optimistically into the feed without a page
  // reload, then the feed re-fetches to settle.
  //
  // Signed-out visitors see the feed read-only with a sign-in CTA where
  // the compose would be.
  const commentsRoot = document.getElementById('dialecta-comments');
  if (commentsRoot) {
    const article = {
      id:          commentsRoot.dataset.postId         || '',
      slug:        commentsRoot.dataset.postSlug       || '',
      title:       commentsRoot.dataset.postTitle      || '',
      primary_tag: commentsRoot.dataset.postPrimaryTag || '',
      // article_claims wiring is a Phase 1B follow-up. /api/classify
      // accepts null and the prompt handles missing claims gracefully;
      // classification quality improves once authors submit claims at
      // article publish time.
      claims: null,
    };
    const member = commentsRoot.dataset.memberUuid ? {
      uuid:  commentsRoot.dataset.memberUuid,
      name:  commentsRoot.dataset.memberName  || '',
      email: commentsRoot.dataset.memberEmail || '',
    } : null;

    createRoot(commentsRoot).render(
      <DialectaCommentsRoot article={article} member={member} />
    );
  }

  // ── ARTICLE-SIDE CLASSIFICATION SURFACE ───────────────────────────────
  // Two mounts on post.hbs that surface the platform's classification of
  // the article itself (the same engine that classifies comments, applied
  // to the article at submit time):
  //   #dialecta-tier-badge   → the 3-tier readout (Author / Engine / Final)
  //   #dialecta-declaration  → "What this article claims" + an expandable
  //                            "How the engine read this" disclosure
  // Legacy articles (no Supabase row) render nothing — both components
  // return null when /api/article/<id> has dialecta=null.
  const tierBadgeRoot = document.getElementById('dialecta-tier-badge');
  if (tierBadgeRoot) {
    const postId = tierBadgeRoot.dataset.postId || '';
    if (postId) {
      createRoot(tierBadgeRoot).render(<ArticleTierBadge postId={postId} />);
    }
  }

  const declarationRoot = document.getElementById('dialecta-declaration');
  if (declarationRoot) {
    const postId     = declarationRoot.dataset.postId    || '';
    const memberUuid = declarationRoot.dataset.memberUuid || '';
    if (postId) {
      createRoot(declarationRoot).render(
        <ArticleDeclaration postId={postId} memberUuid={memberUuid || null} />,
      );
    }
  }

  // ── PRE-READ OPINION MAP ──────────────────────────────────────────────
  // Top-of-article placement prompt. Renders the article's first opinion
  // map in interactive mode so an authenticated reader can declare their
  // starting position before engaging the body. Anonymous readers see
  // nothing here; the component returns null when memberUuid is missing.
  const preReadRoot = document.getElementById('dialecta-pre-read-map');
  if (preReadRoot) {
    const postId     = preReadRoot.dataset.postId    || '';
    const memberUuid = preReadRoot.dataset.memberUuid || '';
    if (postId && memberUuid) {
      createRoot(preReadRoot).render(
        <ArticlePreReadMap postId={postId} memberUuid={memberUuid} />,
      );
    }
  }

  // ── ADMIN RE-POLISH BUTTON ─────────────────────────────────────────────
  // Floating admin-only button on post.hbs. Renders nothing for non-admin
  // members (silent gate). The component fetches /api/profile/{member_id}
  // on mount and only shows the button if profile.is_admin === true.
  const adminRepolishRoot = document.getElementById('dialecta-admin-repolish');
  if (adminRepolishRoot) {
    const postId   = adminRepolishRoot.dataset.postId   || '';
    const postSlug = adminRepolishRoot.dataset.postSlug || '';
    const memberId = adminRepolishRoot.dataset.memberId || '';
    if (postId && memberId) {
      createRoot(adminRepolishRoot).render(
        <AdminRepolishMount
          ghostPostId={postId}
          ghostPostSlug={postSlug}
          memberId={memberId}
        />
      );
    }
  }

  // ── POST-PAGE SIDEBAR ─────────────────────────────────────────────────
  // The live sidebar that companions the article on desktop. Reads its
  // context from data-* attributes on the mount div (set in post.hbs from
  // Ghost variables). On mobile the .post-sidebar wrapper is hidden via
  // CSS and two inline mounts (mobile-toc, mobile-quote) below surface the
  // pieces that still belong inside the reading flow.
  const sidebarRoot = document.getElementById('dialecta-sidebar');
  if (sidebarRoot) {
    const articleId        = sidebarRoot.dataset.postId       || '';
    const articleSlug      = sidebarRoot.dataset.postSlug     || '';
    const authorMemberId   = sidebarRoot.dataset.authorId     || '';
    const authorName       = sidebarRoot.dataset.authorName   || '';
    const primaryTagSlug   = (sidebarRoot.dataset.primaryTagSlug || '').replace(/-\d+$/, '');
    const primaryTagName   = sidebarRoot.dataset.primaryTagName || '';
    // articleClaims comes through as a JSON-encoded attribute when the
    // editor's Declare stage is wired through to the article record.
    // Until then, parse defensively and treat empty / missing as null.
    let articleClaims = null;
    try {
      const raw = sidebarRoot.dataset.articleClaims;
      if (raw && raw.trim()) articleClaims = JSON.parse(raw);
    } catch (e) { /* quiet */ }

    createRoot(sidebarRoot).render(
      <DialectaSidebar
        articleId={articleId}
        articleSlug={articleSlug}
        authorMemberId={authorMemberId}
        authorName={authorName}
        primaryTagSlug={primaryTagSlug}
        primaryTagName={primaryTagName}
        articleClaims={articleClaims}
      />
    );
  }

  // Mobile inline TOC: a <details> at the top of .post-content. Hidden on
  // desktop via CSS; the desktop sidebar's TOC card carries the same data.
  const mobileTocRoot = document.getElementById('dialecta-toc-mobile');
  if (mobileTocRoot) {
    createRoot(mobileTocRoot).render(<DialectaSidebarMobileTOC />);
  }

  // Mobile inline Quote: at the end of .post-content, just before the
  // discourse-transition divider. Reads as a closing thought.
  const mobileQuoteRoot = document.getElementById('dialecta-quote-mobile');
  if (mobileQuoteRoot) {
    createRoot(mobileQuoteRoot).render(<DialectaSidebarMobileQuote />);
  }

  // ── SIGN-UP INVITE (guest-only modal) ─────────────────────────────────
  // Brass+paper invitation. Auto-shows after a grace period on first visit
  // for unregistered visitors; also intercepts logo clicks for guests.
  // The component is a no-op when data-is-member="true".
  const inviteRoot = document.getElementById('dialecta-signup-invite-root');
  if (inviteRoot) {
    const isMember = inviteRoot.dataset.isMember === 'true';
    createRoot(inviteRoot).render(<SignupInvite isMember={isMember} />);
  }

  // ── NOTIFICATIONS BELL (header) ───────────────────────────────────────
  // Sits in the nav-member-area, between the Write link and the member
  // link. Mounted only when the member is signed in (data-member-uuid is
  // set). Renders a bell icon + unread badge; click opens a slide-in
  // drawer with the last 30 notifications. The same component handles
  // both the bell and its drawer.
  document.querySelectorAll('[data-dialecta-bell]').forEach((el) => {
    const memberUuid = el.dataset.memberUuid || '';
    if (memberUuid) {
      createRoot(el).render(<BellWithDrawer memberUuid={memberUuid} />);
    }
  });

  // ── NOTIFICATIONS PAGE (/notifications/) ──────────────────────────────
  const notificationsPageRoot = document.getElementById('dialecta-notifications-page-root');
  if (notificationsPageRoot) {
    const memberUuid = notificationsPageRoot.dataset.memberUuid || '';
    createRoot(notificationsPageRoot).render(
      <DialectaNotificationsPage memberUuid={memberUuid} />
    );
  }

  // Fingerprint page — hero carousel
  const heroRoot = document.getElementById('fp-hero-root');
  if (heroRoot) {
    createRoot(heroRoot).render(<HeroCarousel />);
  }

  // Fingerprint page — static instances
  document.querySelectorAll('[data-fp-axes]').forEach(el => {
    try {
      const data      = JSON.parse(el.dataset.fpAxes);
      const size      = parseInt(el.dataset.fpSize)        || 180;
      const resonance = parseFloat(el.dataset.fpResonance) || 0;
      const labels    = el.dataset.fpLabels !== 'false';
      const lines     = el.dataset.fpLines  !== 'false';
      createRoot(el).render(
        <Fingerprint
          data={data}
          size={size}
          resonance={resonance}
          showLabels={labels}
          showAxisLines={lines}
        />
      );
    } catch(e) {
      console.error('[Dialecta] FP mount error:', e);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
