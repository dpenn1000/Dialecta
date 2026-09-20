'use client';

/**
 * MomentShareButtons — client-side share row for the celebration page.
 *
 * Three actions:
 *   1. Share on X (opens Twitter intent in new tab)
 *   2. Share on Facebook (opens FB sharer in new tab)
 *   3. Copy link to clipboard (with Copied! confirmation flash)
 *
 * The page itself is server-rendered; this small island handles the
 * stateful copy-confirmation. Twitter and Facebook buttons are simple
 * <a target="_blank"> and would work even without hydration.
 */

import { useState, useCallback } from 'react';

const T = {
  paper:     '#fefcf5',
  brassDeep: '#7a4a10',
  brassMid:  '#b8862e',
  brassWarm: '#d4a84a',
};

export default function MomentShareButtons({ url, shareText, onPhoto = false }) {
  const [copied, setCopied] = useState(false);

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }, [url]);

  const twitterUrl  = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(url);
  const facebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);

  // On photo (dark curtain) the buttons need light borders and light
  // text so they don't disappear into the background.
  const baseStyle = {
    appearance:    'none',
    cursor:        'pointer',
    fontFamily:    "var(--font-dm-mono), ui-monospace, monospace",
    fontSize:      12,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color:         onPhoto ? '#f5dfa0' : T.brassDeep,
    background:    'transparent',
    border:        onPhoto ? '1px solid rgba(245,223,160,0.6)' : `1px solid ${T.brassMid}`,
    borderRadius:  2,
    padding:       '14px 22px',
    textDecoration: 'none',
    display:        'inline-flex',
    alignItems:     'center',
    justifyContent: 'center',
    transition:     'background 160ms ease, color 160ms ease',
  };

  return (
    <div style={{
      display:        'flex',
      flexWrap:       'wrap',
      gap:            10,
      justifyContent: 'center',
      alignItems:     'center',
      marginBottom:   28,
    }}>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={baseStyle}>
        Share on X
      </a>
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" style={baseStyle}>
        Share on Facebook
      </a>
      <button type="button" onClick={onCopy} style={baseStyle}>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  );
}
