/**
 * The reading-stage spine: the six-segment nav plus the Reflect and
 * Declare overlay shells. Server component, static per article; all
 * interactivity is delegated to spine-client.tsx.
 *
 * Ported from _theme/post.hbs:14-73 (the nav) and :806-874 (the overlay
 * shells), CSS from :1024-1046 and :1136-1166 (see spine.css for the
 * full citation). Step 2 of the architect's port plan
 * (team/architect/architecture/2026-09-21-delta-mechanic-port.md, build
 * order #2).
 *
 * data-state is a hardcoded literal on every segment, matching live
 * exactly: post.hbs's own header comment admits Read's "active" state
 * is not yet scroll-driven ("Future stages will wire scroll-progress for
 * Read"), so hardcoding it here is a faithful port, not a shortcut.
 * Discourse's meta stays empty. Live prints a fixed "12 voices" on every
 * article (post.hbs calls it a placeholder twice), and a number that is
 * the same everywhere is made-up data, which the port-or-rewrite ruling
 * keeps out. The real count from components/discourse/data.ts is a small
 * follow-up.
 *
 * Read, Discourse, Bio and Share are plain anchor-jump segments; Bio and
 * Share point at ids this app does not render yet (#post-author-bio, an
 * author bio block; #post-share, an end-of-article share row), so those
 * two are present for the six-segment layout but inert until that
 * content exists, same treatment as Reflect's overlay below. Share's
 * native-share/popover behavior and its /api/share/track call are a
 * different, unstarted feature, not part of this plan.
 */
import { Fragment } from 'react';
import { ArticleDeclaration } from '@/components/article-declaration/declaration';
import { strings } from '@/strings';
import { SpineClient } from './spine-client';
import './spine.css';

const s = strings.articleSpine;

const SEGMENTS = [
  { stage: 'reflect', href: '#dialecta-pre-read-map', state: 'pending', ...s.segments.reflect },
  { stage: 'read', href: '#post-content', state: 'active', ...s.segments.read },
  { stage: 'declare', href: '#dialecta-declaration', state: 'pending', ...s.segments.declare },
  { stage: 'discourse', href: '#dialecta-comments', state: 'pending', ...s.segments.discourse },
  { stage: 'bio', href: '#post-author-bio', state: 'pending', ...s.segments.bio },
  { stage: 'share', href: '#post-share', state: 'pending', ...s.segments.share },
] as const;

function SegmentMark({ state }: { state: string }) {
  return (
    <span className="post-spine-mark" aria-hidden="true">
      {state === 'active' ? '◉' : '○'}
    </span>
  );
}

function SpineNav() {
  return (
    <nav className="post-spine" aria-label={s.navLabel}>
      {SEGMENTS.map((seg, i) => (
        <Fragment key={seg.stage}>
          <a className="post-spine-segment" href={seg.href} data-stage={seg.stage} data-state={seg.state}>
            <SegmentMark state={seg.state} />
            <span className="post-spine-label">{seg.label}</span>
            {seg.meta ? <span className="post-spine-meta">{seg.meta}</span> : null}
          </a>
          {i < SEGMENTS.length - 1 ? <span className="post-spine-rule" aria-hidden="true" /> : null}
        </Fragment>
      ))}
    </nav>
  );
}

const DECLARE_TITLE_ID = 'post-overlay-declare-title';

export function ArticleSpine({ articleId }: { articleId: string }) {
  return (
    <SpineClient
      articleId={articleId}
      declareTitleId={DECLARE_TITLE_ID}
      nav={<SpineNav />}
      declareOverlay={
        <>
          <div className="post-overlay-kicker">{s.declare.kicker}</div>
          <h2 id={DECLARE_TITLE_ID} className="post-overlay-title">
            <em>{s.declare.titleEm}</em> {s.declare.titleRest}
          </h2>
          <ArticleDeclaration articleId={articleId} />
          <div className="post-overlay-actions">
            <button type="button" className="post-overlay-skip" data-overlay-close>
              {s.declare.close}
            </button>
          </div>
        </>
      }
    />
  );
}
