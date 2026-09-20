/**
 * dev-admin-mount.jsx
 *
 * Mount entry for /dev-admin/. Reads the Ghost member uuid from the
 * page-dev-admin.hbs root div and renders DialectaDevAdmin. The component
 * itself fetches /api/profile/<uuid> to get the caller's roles and effective
 * capabilities and gates each section accordingly.
 *
 * Visitors with no signed-in member see a sign-in prompt instead of the
 * dashboard. Members without any admin role see a NoAccess message.
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { DialectaDevAdmin } from './dialecta-dev-admin.jsx';

const rootEl = document.getElementById('dialecta-dev-admin-root');

if (rootEl) {
  const memberUuid = rootEl.getAttribute('data-member-uuid') || '';
  const memberName = rootEl.getAttribute('data-member-name') || '';

  if (memberUuid) {
    createRoot(rootEl).render(
      <DialectaDevAdmin memberUuid={memberUuid} memberName={memberName} />
    );
  } else {
    rootEl.innerHTML =
      '<div style="padding:60px 24px;text-align:center;font-family:\'Cormorant Garamond\',Georgia,serif;font-style:italic;font-size:1.2rem;color:#8c8780;">' +
      'Please <a href="#/portal/signin" data-portal="signin" style="color:#a87b2c;">sign in</a> to access the admin dashboard.' +
      '</div>';
  }
}
