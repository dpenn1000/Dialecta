'use client';

/**
 * The spine's one client module: open/close for Reflect and Declare, the
 * two auto-opens, and the localStorage seen-flags. Owns no data (it never
 * imports a Supabase client) and wraps server-rendered markup, the same
 * shape apps/web/CLAUDE.md already names twice for this class of thing
 * (the shell's nav/drawer, nav-client.tsx; the comment feed, feed.tsx).
 * This is the third recorded exception the port plan names
 * (team/architect/architecture/2026-09-21-delta-mechanic-port.md, "Server
 * components and islands").
 *
 * Ported behavior, from the inline <script> in _theme/post.hbs:893-1174:
 *   - Click on a Reflect/Declare spine segment opens the matching overlay
 *     (:938-945); the other segments keep their default anchor-jump.
 *   - Scrim, close button, or anything carrying data-overlay-close
 *     dismisses (:952-958) and marks a localStorage seen-flag so the
 *     auto-open does not repeat (:885-886, :917-919).
 *   - Escape dismisses whichever overlay is open (:959-961).
 *   - Declare auto-opens once, when #post-content-end-sentinel is 50%
 *     visible (:995-1010).
 *   - Reflect auto-opens once, 1.5s after load, if the reader has not
 *     scrolled past 200px (:979-994) and a member-gated overlay exists to
 *     open; in this pass `reflectOverlay` is always null (see spine.tsx),
 *     so this path is wired but never fires yet.
 *
 * What changed from the source: live reparents the overlay elements to
 * document.body by hand with a comment explaining the z-index stacking
 * bug this works around (:895-903). Here a React portal
 * (react-dom's createPortal) does the same job without depending on
 * every ancestor's CSS never creating a stacking context. Escape/Tab
 * focus handling and the inert-while-closed treatment mirror
 * components/shell/nav-client.tsx's NavDrawer exactly, rather than
 * inventing a second pattern for the same class of problem.
 */
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { strings } from '@/strings';

type Stage = 'reflect' | 'declare';

const s = strings.articleSpine;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function seenKey(stage: Stage, articleId: string): string {
  return `dialecta-${stage}-seen-${articleId}`;
}

function readSeen(stage: Stage, articleId: string): boolean {
  try {
    return window.localStorage.getItem(seenKey(stage, articleId)) !== null;
  } catch {
    return false;
  }
}

function markSeen(stage: Stage, articleId: string): void {
  try {
    window.localStorage.setItem(seenKey(stage, articleId), '1');
  } catch {
    // Private window or blocked storage: the auto-open may repeat next
    // visit. Not fatal, the reader can still dismiss it manually.
  }
}

interface OverlayShellProps {
  stage: Stage;
  open: boolean;
  wide?: boolean;
  titleId: string;
  onDismiss: (event: MouseEvent<HTMLDivElement>) => void;
  contentRef: (el: HTMLDivElement | null) => void;
  closeButtonRef: (el: HTMLButtonElement | null) => void;
  children: ReactNode;
}

function OverlayShell({ stage, open, wide, titleId, onDismiss, contentRef, closeButtonRef, children }: OverlayShellProps) {
  return (
    <div
      className="post-overlay"
      data-overlay={stage}
      data-open={open}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      inert={!open}
      onClick={onDismiss}
    >
      <div className="post-overlay-scrim" data-overlay-close />
      <div ref={contentRef} className={wide ? 'post-overlay-content post-overlay-content--wide' : 'post-overlay-content'}>
        <button ref={closeButtonRef} type="button" className="post-overlay-close" data-overlay-close aria-label={s.declare.close}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export interface SpineClientProps {
  articleId: string;
  nav: ReactNode;
  declareOverlay: ReactNode;
  declareTitleId: string;
  /**
   * Null in this pass: Reflect's overlay is member-gated on live and its
   * placement content is step 6. The Reflect segment stays in the nav
   * (see spine.tsx), but with no overlay to open, matching what a
   * signed-out reader sees on live today.
   */
  reflectOverlay?: ReactNode | null;
  reflectTitleId?: string;
}

export function SpineClient({
  articleId,
  nav,
  declareOverlay,
  declareTitleId,
  reflectOverlay = null,
  reflectTitleId = 'post-overlay-reflect-title',
}: SpineClientProps) {
  const [mounted, setMounted] = useState(false);
  const [openStage, setOpenStage] = useState<Stage | null>(null);
  const declareContentRef = useRef<HTMLDivElement | null>(null);
  const declareCloseRef = useRef<HTMLButtonElement | null>(null);
  const reflectContentRef = useRef<HTMLDivElement | null>(null);
  const reflectCloseRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    setOpenStage((current) => {
      if (current) markSeen(current, articleId);
      return null;
    });
  }, [articleId]);

  const open = useCallback(
    (stage: Stage) => {
      if (stage === 'reflect' && !reflectOverlay) return; // no overlay to open, matches live for a signed-out reader
      setOpenStage(stage);
    },
    [reflectOverlay],
  );

  const handleNavClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>('[data-stage="reflect"], [data-stage="declare"]');
      if (!target) return; // Read, Discourse, Bio, Share keep their default anchor-jump.
      const stage = target.dataset.stage as Stage;
      event.preventDefault();
      open(stage);
    },
    [open],
  );

  const handleOverlayClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if ((event.target as HTMLElement).closest('[data-overlay-close]')) close();
    },
    [close],
  );

  // Escape and a light focus trap while any overlay is open, and a scroll
  // lock on <html>. Same shape as NavDrawer's own effect in nav-client.tsx.
  useEffect(() => {
    if (!openStage) return;
    const root = document.documentElement;
    root.classList.add('dialecta-overlay-open');
    const activeContent = openStage === 'declare' ? declareContentRef.current : reflectContentRef.current;
    const activeClose = openStage === 'declare' ? declareCloseRef.current : reflectCloseRef.current;
    const focusTimer = setTimeout(() => activeClose?.focus(), 60);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !activeContent) return;
      const focusable = activeContent.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      root.classList.remove('dialecta-overlay-open');
    };
  }, [openStage, close]);

  // Auto-open Declare once the reader reaches the end of the body, unless
  // already seen or another overlay is already open. One-shot per mount,
  // matching live's own disconnect-after-first-fire observer.
  useEffect(() => {
    if (readSeen('declare', articleId)) return;
    const sentinel = document.getElementById('post-content-end-sentinel');
    if (!sentinel || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (readSeen('declare', articleId)) return;
        setOpenStage((current) => current ?? 'declare');
        observer.disconnect();
      },
      { threshold: 0.5 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [articleId]);

  // Auto-open Reflect 1.5s after load, once per article, unless the
  // reader has already scrolled past 200px. Wired for when step 6 gives
  // Reflect an overlay to open; a no-op today since reflectOverlay is null.
  useEffect(() => {
    if (!reflectOverlay || readSeen('reflect', articleId)) return;
    const timer = setTimeout(() => {
      if (window.scrollY > 200) return;
      setOpenStage((current) => current ?? 'reflect');
    }, 1500);
    return () => clearTimeout(timer);
  }, [articleId, reflectOverlay]);

  return (
    <>
      <div onClick={handleNavClick}>{nav}</div>
      {mounted
        ? createPortal(
            <>
              {reflectOverlay ? (
                <OverlayShell
                  stage="reflect"
                  open={openStage === 'reflect'}
                  titleId={reflectTitleId}
                  onDismiss={handleOverlayClick}
                  contentRef={(el) => {
                    reflectContentRef.current = el;
                  }}
                  closeButtonRef={(el) => {
                    reflectCloseRef.current = el;
                  }}
                >
                  {reflectOverlay}
                </OverlayShell>
              ) : null}
              <OverlayShell
                stage="declare"
                open={openStage === 'declare'}
                wide
                titleId={declareTitleId}
                onDismiss={handleOverlayClick}
                contentRef={(el) => {
                  declareContentRef.current = el;
                }}
                closeButtonRef={(el) => {
                  declareCloseRef.current = el;
                }}
              >
                {declareOverlay}
              </OverlayShell>
            </>,
            document.body,
          )
        : null}
    </>
  );
}
