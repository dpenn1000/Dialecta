/**
 * post-page-mount.jsx
 *
 * Entry bundle for the article-reader page (post.hbs). Mounts:
 *
 *   - DialectaCommentsRoot   (#dialecta-comments)   — Private Draft compose
 *                                                     + Discourse Layer feed
 *   - ArticleTierBadge       (#dialecta-tier-badge) — 3-tier readout
 *   - ArticleDeclaration     (#dialecta-declaration)— author claims + engine read
 *   - ArticlePreReadMap      (#dialecta-pre-read-map) — opinion placement
 *   - AdminRepolishMount     (#dialecta-admin-repolish) — admin floating button
 *   - MobileTOC              (#dialecta-toc-mobile) — mobile inline TOC
 *   - MobileQuote            (#dialecta-quote-mobile) — mobile inline quote
 *
 * The sitewide chrome (signup invite, bell, sidebar, universal settings)
 * is mounted by shell.js, which is also loaded on this template via
 * default.hbs. Article-reader-only mounts live here so search-landing
 * traffic doesn't pay the editor / community / admin bundle tax.
 */

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

import DialectaPrivateDraft from './dialecta-private-draft.jsx';
import DialectaDiscourseLayer from './dialecta-discourse-layer.jsx';
import {
  ArticleTierBadge,
  ArticleDeclaration,
} from './dialecta-article-classification.jsx';
import { ArticlePreReadMap } from './dialecta-opinion-map-placement.jsx';
import AdminRepolishMount     from './dialecta-admin-repolish.jsx';
import AdminResetupMapsMount  from './dialecta-admin-resetup-maps.jsx';
import {
  DialectaSidebarMobileTOC,
  DialectaSidebarMobileQuote,
} from './dialecta-sidebar.jsx';

// ── Comments wrapper ─────────────────────────────────────────────────────
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
    if (typeof document !== 'undefined') {
      const root = document.getElementById('dialecta-comments');
      if (root && typeof root.scrollIntoView === 'function') {
        root.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handlePosted = (postedShape) => {
    setOptimistic((prev) => [{
      id:           postedShape.comment_id || `optim-${Date.now()}`,
      body:         postedShape.body,
      created_at:   postedShape.published_at || new Date().toISOString(),
      hardened_at:  new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      published_at: postedShape.published_at,
      malleable:    true,
      parent_id:    postedShape.parent_id || null,
      author:       { name: member?.name, member_id: member?.uuid },
      is_own:       true,
      classification: {
        ai_suggested_tier:  postedShape.ai_suggested_tier,
        self_declared_tier: postedShape.self_declared_tier,
        final_tier:         postedShape.final_tier
                              || postedShape.self_declared_tier
                              || postedShape.ai_suggested_tier,
        commenter_message:  postedShape.commenter_message,
      },
    }, ...prev]);
    setReplyTo(null);
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

// ── Mounts ───────────────────────────────────────────────────────────────

function mountAll() {
  // Comments / Discourse Layer
  const commentsRoot = document.getElementById('dialecta-comments');
  if (commentsRoot) {
    const article = {
      id:          commentsRoot.dataset.postId         || '',
      slug:        commentsRoot.dataset.postSlug       || '',
      title:       commentsRoot.dataset.postTitle      || '',
      primary_tag: commentsRoot.dataset.postPrimaryTag || '',
      claims:      null,
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

  // Tier badge — 3-tier classification readout.
  const tierBadgeRoot = document.getElementById('dialecta-tier-badge');
  if (tierBadgeRoot) {
    const postId = tierBadgeRoot.dataset.postId || '';
    if (postId) {
      createRoot(tierBadgeRoot).render(<ArticleTierBadge postId={postId} />);
    }
  }


  // Author declaration + engine read.
  const declarationRoot = document.getElementById('dialecta-declaration');
  if (declarationRoot) {
    const postId     = declarationRoot.dataset.postId     || '';
    const memberUuid = declarationRoot.dataset.memberUuid || '';
    if (postId) {
      createRoot(declarationRoot).render(
        <ArticleDeclaration postId={postId} memberUuid={memberUuid || null} />
      );
    }
  }

  // Pre-read opinion-map placement (authenticated readers only).
  const preReadRoot = document.getElementById('dialecta-pre-read-map');
  if (preReadRoot) {
    const postId     = preReadRoot.dataset.postId     || '';
    const memberUuid = preReadRoot.dataset.memberUuid || '';
    if (postId && memberUuid) {
      createRoot(preReadRoot).render(
        <ArticlePreReadMap postId={postId} memberUuid={memberUuid} />
      );
    }
  }

  // Admin re-polish floating button (silent for non-admins).
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

  // Admin re-setup-opinion-maps floating button (silent for non-admins).
  // Stacked above Re-parse via fixed positioning in the component itself.
  const adminResetupMapsRoot = document.getElementById('dialecta-admin-resetup-maps');
  if (adminResetupMapsRoot) {
    const postId   = adminResetupMapsRoot.dataset.postId   || '';
    const postSlug = adminResetupMapsRoot.dataset.postSlug || '';
    const memberId = adminResetupMapsRoot.dataset.memberId || '';
    if (postId && memberId) {
      createRoot(adminResetupMapsRoot).render(
        <AdminResetupMapsMount
          ghostPostId={postId}
          ghostPostSlug={postSlug}
          memberId={memberId}
        />
      );
    }
  }

  // Mobile inline TOC (hidden on desktop via CSS).
  const mobileTocRoot = document.getElementById('dialecta-toc-mobile');
  if (mobileTocRoot) {
    createRoot(mobileTocRoot).render(<DialectaSidebarMobileTOC />);
  }

  // Mobile inline Quote (hidden on desktop via CSS).
  const mobileQuoteRoot = document.getElementById('dialecta-quote-mobile');
  if (mobileQuoteRoot) {
    createRoot(mobileQuoteRoot).render(<DialectaSidebarMobileQuote />);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
