/**
 * editor-page-mount.jsx
 *
 * Entry bundle for the Write page (page-write.hbs). Mounts the article
 * composer at #dialecta-editor-root. Editor weight is significant; this
 * keeps that weight off every other page.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import DialectaEditor from './dialecta-editor.jsx';

function mountAll() {
  const editorRoot = document.getElementById('dialecta-editor-root');
  if (!editorRoot) return;

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
