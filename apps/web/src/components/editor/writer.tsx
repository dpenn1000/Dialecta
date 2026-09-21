'use client';

/**
 * The writer: the article editor island named in apps/web/CLAUDE.md.
 *
 * Ported from DialectaEditor, the default export of
 * _recovered-next/lib/theme/dialecta-editor.jsx (lines 4436-4727): the stage
 * machine, the 10-second localStorage autosave, restore-on-mount with a
 * discard link, scroll-to-top on every stage change, and the stage router.
 *
 * Identity. The recovered component took memberUuid, memberEmail and
 * memberName as props, read by editor-page-mount.jsx from data attributes that
 * page-write.hbs filled from Ghost's {{@member}}, and threaded memberUuid into
 * three request bodies. None of that survives. The server page resolves the
 * session through getClaims() and hands this island a display name and two
 * booleans, for display only; the publish route resolves the author again, on
 * its own, from the verified session. Nothing this component sends can name an
 * author. memberEmail and memberName were never read by the recovered file at
 * all (the structural read found both dead).
 *
 * Also gone: the viewer-tier fetch (4449-4466), which asked
 * /api/profile/<memberUuid> for subscription_tier to gate polish runs. Polish
 * is not in this build, and tier gating waits on a server-side mirror
 * (Council, "tier-capabilities.js").
 */
import './writer.css';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { loginHref } from '@/lib/return-path';
import { strings } from '@/strings';
import { StageRail } from './stage-rail';
import { ComposeStage, ConsentStage, DeclareStage } from './stages-draft';
import {
  FinalStage,
  PostedStage,
  ReflectingStage,
  ReflectionStage,
  RespondStage,
  Stage25Stage,
} from './stages-publish';
import {
  AUTOSAVE_INTERVAL_MS,
  AUTOSAVE_KEY,
  INITIAL_STATE,
  S,
  mergeRestored,
  type Stage,
  type WriterState,
} from './writer-state';

export interface WriterProps {
  /** The signed-in author's display name, for the byline. Display only. */
  authorName: string | null;
  signedIn: boolean;
  /** Whether the session resolves to a contributor profile. Display only. */
  profileLinked: boolean;
  /** An existing article of the author's, when editing one. */
  initialArticle: WriterState | null;
}

function storageKey(articleId: string | null): string {
  return articleId ? `${AUTOSAVE_KEY}:${articleId}` : AUTOSAVE_KEY;
}

export default function Writer({ authorName, signedIn, profileLinked, initialArticle }: WriterProps) {
  const [stage, setStage] = useState<Stage>(S.COMPOSE);
  const [state, setState] = useState<WriterState>(initialArticle ?? INITIAL_STATE);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [restored, setRestored] = useState(false);
  const [postedSlug, setPostedSlug] = useState<string | null>(null);
  // Bumped whenever the body is replaced from outside the editor (a restore,
  // a reset), so the prose editor remounts and reads its initial content again.
  const [editorKey, setEditorKey] = useState(0);

  const key = storageKey(initialArticle?.article_id ?? null);

  // Restore an auto-saved draft on mount. An article being edited starts from
  // the stored row instead; its own autosave key keeps it apart from a new
  // draft in progress.
  useEffect(() => {
    if (initialArticle) return;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      const record = parsed && typeof parsed === 'object' ? (parsed as { state?: unknown; savedAt?: unknown }) : null;
      const merged = mergeRestored(record?.state);
      if (merged && (merged.title.trim() || merged.body_html.trim())) {
        setState(merged);
        setSavedAt(typeof record?.savedAt === 'number' ? record.savedAt : null);
        setRestored(true);
        setEditorKey((k) => k + 1);
      }
    } catch (err) {
      console.warn('Failed to restore auto-saved draft:', err);
    }
  }, [initialArticle, key]);

  // Scroll to the top on every stage change, instantly (line 4471: without it
  // a new stage opened at the old scroll position, far down the page).
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [stage]);

  // Autosave every 10 seconds, read through refs so the interval is created
  // once. Skipped after publishing, and while both title and body are empty,
  // so a fresh load never overwrites a stored draft with nothing.
  const stateRef = useRef(state);
  const stageRef = useRef(stage);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  const saveNow = useCallback(() => {
    if (stageRef.current === S.POSTED) return;
    const current = stateRef.current;
    if (!current.title.trim() && !current.body_html.trim()) return;
    try {
      const ts = Date.now();
      localStorage.setItem(key, JSON.stringify({ state: current, savedAt: ts }));
      setSavedAt(ts);
    } catch (err) {
      console.warn('Auto-save failed:', err);
    }
  }, [key]);

  useEffect(() => {
    const id = setInterval(saveNow, AUTOSAVE_INTERVAL_MS);
    // New: also save when the tab is hidden or closed, so the last ten
    // seconds of writing are not the ones lost.
    const onHide = () => saveNow();
    window.addEventListener('pagehide', onHide);
    return () => {
      clearInterval(id);
      window.removeEventListener('pagehide', onHide);
    };
  }, [saveNow]);

  const clearDraft = () => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  };

  const reset = () => {
    clearDraft();
    setState(INITIAL_STATE);
    setSavedAt(null);
    setRestored(false);
    setPostedSlug(null);
    setEditorKey((k) => k + 1);
    setStage(S.COMPOSE);
  };

  let stageNode: ReactNode = null;
  switch (stage) {
    case S.COMPOSE:
      stageNode = (
        <ComposeStage
          key={editorKey}
          state={state}
          setState={setState}
          savedAt={savedAt}
          authorName={authorName}
          initialBody={state.body_json ?? (state.body_html || null)}
          onContinue={() => {
            saveNow();
            setStage(S.CONSENT);
          }}
        />
      );
      break;
    case S.CONSENT:
      stageNode = <ConsentStage onContinue={() => setStage(S.DECLARE)} onBack={() => setStage(S.COMPOSE)} />;
      break;
    case S.DECLARE:
      stageNode = (
        <DeclareStage
          state={state}
          setState={setState}
          onContinue={() => setStage(S.REFLECTING)}
          onBack={() => setStage(S.CONSENT)}
        />
      );
      break;
    case S.REFLECTING:
      stageNode = <ReflectingStage onComplete={() => setStage(S.REFLECTION)} />;
      break;
    case S.REFLECTION:
      stageNode = (
        <ReflectionStage state={state} onContinue={() => setStage(S.STAGE25)} onBack={() => setStage(S.DECLARE)} />
      );
      break;
    case S.STAGE25:
      stageNode = (
        <Stage25Stage
          onAmend={() => {
            setState((s) => ({ ...s, stage_2_5_choice: 'amend', author_note: '' }));
            setStage(S.COMPOSE);
          }}
          onRespond={() => {
            setState((s) => ({ ...s, stage_2_5_choice: 'respond' }));
            setStage(S.RESPOND);
          }}
          onAsIs={() => {
            setState((s) => ({ ...s, stage_2_5_choice: 'as_is', author_note: '' }));
            setStage(S.FINAL);
          }}
          onBack={() => setStage(S.REFLECTION)}
        />
      );
      break;
    case S.RESPOND:
      stageNode = (
        <RespondStage
          state={state}
          setState={setState}
          onContinue={() => setStage(S.FINAL)}
          onBack={() => setStage(S.STAGE25)}
        />
      );
      break;
    case S.FINAL:
      stageNode = (
        <FinalStage
          state={state}
          onPublished={({ id, slug }) => {
            // Committed: the stored draft would only restore stale content.
            clearDraft();
            setSavedAt(null);
            setRestored(false);
            setState((s) => ({ ...s, article_id: id, slug }));
            setPostedSlug(slug);
            setStage(S.POSTED);
          }}
          onBack={() => setStage(state.stage_2_5_choice === 'respond' ? S.RESPOND : S.STAGE25)}
        />
      );
      break;
    case S.POSTED:
      stageNode = (
        <PostedStage
          state={state}
          slug={postedSlug}
          // After a revision the page is still keyed to that article (its
          // autosave key, the "Editing" line), so a fresh piece starts from a
          // fresh /write rather than from an in-place reset.
          onWriteAnother={initialArticle ? () => window.location.assign('/write') : reset}
        />
      );
      break;
  }

  const precondition = !signedIn ? (
    <>
      {strings.writer.signedOut}{' '}
      {/* Back to the writer after signing in. The draft is in localStorage, so it is still here. */}
      <Link href={loginHref('/write')} style={{ color: 'var(--brass-deep)' }}>
        {strings.writer.signIn}
      </Link>
    </>
  ) : !profileLinked ? (
    strings.writer.noProfile
  ) : null;

  // The recovered editor drew its own "Dialecta" wordmark at the left of this
  // bar, linking home. The site header directly above it now carries both, so
  // the bar holds only the line saying whose draft this is, and is not drawn
  // when there is no one to name.
  const writingLine = initialArticle
    ? strings.writer.editing(initialArticle.title)
    : authorName
      ? strings.writer.writingAs(authorName)
      : null;

  return (
    <div className="dw-root">
      {writingLine ? (
        <header className="dw-topbar">
          <span>{writingLine}</span>
        </header>
      ) : null}

      {precondition && stage !== S.POSTED ? (
        <div className="dw-precondition dialecta-paper" role="note">
          {precondition}
        </div>
      ) : null}

      <StageRail stage={stage} />

      {restored && stage === S.COMPOSE && savedAt ? (
        <div
          className="dw-quiet"
          style={{ maxWidth: 760, margin: '24px auto 0', padding: '0 24px', textAlign: 'center', fontSize: 13 }}
        >
          {strings.writer.restored}{' '}
          <button
            type="button"
            className="dw-link-button"
            onClick={() => {
              if (window.confirm(strings.writer.discardConfirm)) reset();
            }}
          >
            {strings.writer.discard}
          </button>
        </div>
      ) : null}

      {stageNode}

      <footer className="dw-footer">
        <Link href="/pact">{strings.writer.pact}</Link>
      </footer>
    </div>
  );
}
