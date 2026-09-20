/**
 * notifications-page-mount.jsx
 *
 * Entry bundle for the Notifications page (page-notifications.hbs).
 * Mounts the full notifications history at #dialecta-notifications-page-root.
 * The header bell + drawer (BellWithDrawer) is sitewide and lives in
 * shell.js — this entry covers only the dedicated /notifications/ page.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import DialectaNotificationsPage from './dialecta-notifications-page.jsx';

function mountAll() {
  const root = document.getElementById('dialecta-notifications-page-root');
  if (!root) return;

  const memberUuid = root.dataset.memberUuid || '';
  createRoot(root).render(
    <DialectaNotificationsPage memberUuid={memberUuid} />
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
