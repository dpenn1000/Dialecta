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
 * Discourse's meta is the one real count from
 * components/article-spine/discourse-count.ts, computed once by the page
 * and passed down as discourseCount so the byline chip
 * (components/discourse-chip) can show the same number without a second
 * read. Live prints a fixed "12 voices" on every article (post.hbs calls
 * it a placeholder twice); a number that is the same everywhere is made-up
 * data, which the port-or-rewrite ruling keeps out, so a null count (the
 * read failed) renders no meta at all rather than a wrong one.
 *
 * Read and Bio are plain anchor-jump segments; Bio points at
 * #post-author-bio, an author bio block (components/author-bio), rendered
 * as of 2026-09-21. Share points at #post-share, an end-of-article share
 * row (components/article-share), also rendered as of 2026-09-21, but the
 * segment itself stays a plain anchor jump: its native-share/popover
 * behavior and its /api/share/track call are a different, unstarted
 * feature, not part of this plan.
 */
import { Fragment } from 'react';
import { ArticleDeclaration, ArticleReflectPlacement } from '@/components/article-declaration/declaration';
import { readShellMember } from '@/components/shell/member';
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

function SpineNav({ discourseMeta }: { discourseMeta: string | null }) {
  return (
    <nav className="post-spine" aria-label={s.navLabel}>
      {SEGMENTS.map((seg, i) => {
        const meta = seg.stage === 'discourse' ? discourseMeta : seg.meta;
        return (
          <Fragment key={seg.stage}>
            <a className="post-spine-segment" href={seg.href} data-stage={seg.stage} data-state={seg.state}>
              <SegmentMark state={seg.state} />
              <span className="post-spine-label">{seg.label}</span>
              {meta ? <span className="post-spine-meta">{meta}</span> : null}
            </a>
            {i < SEGMENTS.length - 1 ? <span className="post-spine-rule" aria-hidden="true" /> : null}
          </Fragment>
        );
      })}
    </nav>
  );
}

const DECLARE_TITLE_ID = 'post-overlay-declare-title';
const REFLECT_TITLE_ID = 'post-overlay-reflect-title';

/**
 * canPlace: resolved once here (readShellMember(), the same "signed in
 * with a claimed profile" check the header and drawer already use), then
 * threaded to both overlays, so Reflect's whole overlay and Declare's
 * placement islands answer from one read instead of two that could
 * disagree with each other mid-request. Step 6 of the architect's port
 * plan: Reflect is members only, matching live's {{#if @member}}
 * (_theme/post.hbs:806) exactly, so a signed-out or unclaimed reader gets
 * reflectOverlay={null}, the same "nothing to open" shape steps 1 to 4
 * already wired (spine-client.tsx's open() bails when reflectOverlay is
 * absent). Declare's read-only maps stay open to everyone; only the
 * placement island beside each one is gated (declaration.tsx).
 */
export async function ArticleSpine({ articleId, discourseCount }: { articleId: string; discourseCount: number | null }) {
  const member = await readShellMember();
  const canPlace = member !== null;

  return (
    <SpineClient
      articleId={articleId}
      declareTitleId={DECLARE_TITLE_ID}
      reflectTitleId={REFLECT_TITLE_ID}
      nav={<SpineNav discourseMeta={s.discourseMeta(discourseCount)} />}
      reflectOverlay={
        canPlace ? (
          <>
            <div className="post-overlay-kicker">{s.reflect.kicker}</div>
            <h2 id={REFLECT_TITLE_ID} className="post-overlay-title">
              {s.reflect.titlePlain} <em>{s.reflect.titleEm}</em>
            </h2>
            <p className="post-overlay-body">{s.reflect.body}</p>
            <ArticleReflectPlacement articleId={articleId} />
            <div className="post-overlay-actions">
              <button type="button" className="post-overlay-skip" data-overlay-close>
                {s.reflect.skip}
              </button>
            </div>
          </>
        ) : null
      }
      declareOverlay={
        <>
          <div className="post-overlay-kicker">{s.declare.kicker}</div>
          <h2 id={DECLARE_TITLE_ID} className="post-overlay-title">
            <em>{s.declare.titleEm}</em> {s.declare.titleRest}
          </h2>
          <ArticleDeclaration articleId={articleId} canPlace={canPlace} />
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
