/**
 * community-page-mount.jsx
 *
 * Entry bundle for the Community page (page-community.hbs). Mounts the
 * Feed / Contributors / Author View shell at #dialecta-community-root.
 * data-viewer-uuid is empty-string for signed-out visitors; the
 * component hides Follow buttons + "Following" view mode in that case.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import DialectaCommunity from './dialecta-community.jsx';

function mountAll() {
  const communityRoot = document.getElementById('dialecta-community-root');
  if (!communityRoot) return;

  const viewerGhostId = communityRoot.dataset.viewerUuid || '';
  createRoot(communityRoot).render(
    <DialectaCommunity viewerGhostId={viewerGhostId} />
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
