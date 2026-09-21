'use client';

/**
 * Copy link and the native share sheet: the two #post-share buttons that
 * need the browser (clipboard, navigator.share), split out from
 * share-row.tsx so the five platform links stay plain server-rendered <a>
 * tags. A recorded client-island exception (apps/web/CLAUDE.md, "Client
 * islands" bullet): owns no data and no Supabase import, same as the
 * other three recorded there.
 *
 * navigator.share's presence can only be checked in the browser, so it
 * starts false, matching the server's own render, and flips after mount;
 * checking it during the initial render would throw on the server, where
 * navigator does not exist. Live hides the same button on the same
 * condition, from an inline script.
 */
import { useEffect, useState } from 'react';
import { strings } from '@/strings';

const s = strings.articleShare;

export function ShareActions({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator.share === 'function');
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // No Clipboard API on this browser. Live falls back to a hidden
      // textarea plus execCommand('copy'); every browser current enough
      // to run this app's JS at all has the Clipboard API, so that
      // fallback has nothing left to catch here.
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch {
      // The reader dismissed the sheet, or the call failed. Either way
      // there is nothing to show; live swallows this the same way.
    }
  }

  return (
    <>
      <button
        type="button"
        className={copied ? 'post-share-btn copied' : 'post-share-btn'}
        onClick={handleCopy}
        aria-label={s.copyLink}
      >
        <span className="post-share-glyph" aria-hidden="true">
          ⛓
        </span>
        <span className="post-share-label">{s.copyLink}</span>
      </button>
      {canNativeShare ? (
        <button
          type="button"
          className="post-share-btn post-share-native-btn"
          onClick={handleNativeShare}
          aria-label={s.nativeShareLabel}
        >
          <span className="post-share-glyph post-share-glyph-svg" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="2.5" />
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="19" r="2.5" />
              <line x1="8.2" y1="13.4" x2="15.8" y2="17.6" />
              <line x1="15.8" y1="6.4" x2="8.2" y2="10.6" />
            </svg>
          </span>
          <span className="post-share-label">{s.share}</span>
        </button>
      ) : null}
    </>
  );
}
