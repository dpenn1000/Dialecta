'use client';

/**
 * The discourse island: the composer above the feed, sharing reply and
 * just-posted state. The recovered DialectaCommentsRoot in
 * _recovered-next/lib/theme/post-page-mount.jsx, adapted.
 *
 * Kept: a signed-out visitor reads the feed with a sign-in note where the
 * composer would be, and Reply is hidden for anyone who cannot comment. A
 * posted comment is prepended at once, then the server's list settles it.
 *
 * Changed: the recovered root built a member object out of Ghost data
 * attributes on the mount node and handed it down as identity. Here the
 * server resolved the viewer before this rendered (./data.ts), and the only
 * identity this island holds is the display name it shows. "Settles" is
 * router.refresh() rather than a refetch on a two-second timer: the server
 * component reads again with the same session and RLS, and the refreshed
 * props also carry the viewer's own reading for the composer's reflection.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState } from 'react';
import { loginHref } from '@/lib/return-path';
import { strings } from '@/strings';
import { DiscourseFeed } from './feed';
import { PrivateDraft } from './private-draft';
import type { ComposerArticle, DiscourseComment, DiscourseData, OwnReading, ReplyTarget, ViewerState } from './types';

const s = strings.discourse;

/** The recovered reply banner's excerpt length. */
const EXCERPT_CHARS = 120;

function accessText(viewer: ViewerState): string {
  switch (viewer.kind) {
    case 'signed-out':
      return s.access.signedOut;
    case 'no-email':
      return s.access.noEmail;
    case 'no-profile':
      return s.access.noProfile;
    case 'incomplete':
      return s.access.incomplete;
    case 'unavailable':
    case 'ready':
      return s.access.unavailable;
  }
}

/**
 * Signing in from here comes back to this article, at the conversation:
 * the #dialecta-comments section below, where the composer will then be.
 */
function AccessNote({ viewer, articleSlug }: { viewer: ViewerState; articleSlug: string }) {
  return (
    <div className="dialecta-paper dialecta-wood-frame dd-access">
      <p>{accessText(viewer)}</p>
      {viewer.kind === 'signed-out' ? (
        <p>
          <Link
            className="dd-btn dd-btn--primary"
            href={loginHref(`/articles/${encodeURIComponent(articleSlug)}#dialecta-comments`)}
          >
            {s.access.signIn}
          </Link>
        </p>
      ) : null}
    </div>
  );
}

export interface DiscourseRootProps {
  article: ComposerArticle;
  data: DiscourseData;
  /** Development only: the composer runs its stages without an account and sends nothing. */
  preview: boolean;
}

export function DiscourseRoot({ article, data, preview }: DiscourseRootProps) {
  const router = useRouter();
  const composeRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<ReplyTarget | null>(null);
  const [justPosted, setJustPosted] = useState<DiscourseComment[]>([]);

  const canCompose = data.viewer.kind === 'ready' || preview;
  const viewerName = data.viewer.kind === 'ready' ? data.viewer.name : s.card.you;

  // The server's list wins wherever it already has the comment.
  const comments = useMemo(() => {
    const known = new Set(data.comments.map((c) => c.id));
    return [...data.comments, ...justPosted.filter((c) => !known.has(c.id))];
  }, [data.comments, justPosted]);

  const readings = useMemo<Record<string, OwnReading>>(
    () => Object.fromEntries(data.ownReadings.map((r) => [r.commentId, r])),
    [data.ownReadings],
  );

  const handleReply = useCallback((c: DiscourseComment) => {
    const body = c.body ?? '';
    const excerpt = body.length > EXCERPT_CHARS ? `${body.slice(0, EXCERPT_CHARS).trim()}…` : body;
    setReplyTo({ id: c.id, authorName: c.authorName || s.card.anonymous, excerpt });
    composeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handlePosted = useCallback(
    (c: DiscourseComment) => {
      setJustPosted((prev) => [c, ...prev]);
      setReplyTo(null);
      if (!preview) router.refresh();
    },
    [preview, router],
  );

  return (
    <section id="dialecta-comments" className="dd-root" aria-labelledby="dialecta-conversation">
      <div className="dd-transition">
        <h2 id="dialecta-conversation" className="dd-kicker">
          {s.kicker}
        </h2>
      </div>

      <div ref={composeRef} className="dd-compose">
        {canCompose ? (
          <PrivateDraft
            article={article}
            viewerName={viewerName}
            preview={preview}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onPosted={handlePosted}
            readings={readings}
          />
        ) : (
          <AccessNote viewer={data.viewer} articleSlug={article.slug} />
        )}
      </div>

      <DiscourseFeed
        comments={comments}
        unavailable={data.unavailable}
        diagnostic={data.diagnostic}
        renderedAt={data.renderedAt}
        onReply={canCompose ? handleReply : null}
      />
    </section>
  );
}
