/**
 * dialecta-quotes-mount.jsx
 *
 * Ghost injection entry point for the Quote Library page.
 *
 * Mount target in page-quotes.hbs:
 *   <div id="dialecta-quotes-root"
 *        data-member-id="{{@member.uuid}}"
 *        data-member-name="{{@member.name}}"
 *        data-member-email="{{@member.email}}"></div>
 *
 * The mount reads member identity from data attributes (empty when the
 * visitor is not signed in) and passes them to QuotesApp. The app handles
 * three auth tiers internally: visitor (read-only browse), member (browse
 * + suggest), admin (full CRUD plus admin management).
 */

import { createRoot } from 'react-dom/client';
import { QuotesApp } from './dialecta-quotes-app.jsx';

const rootEl = document.getElementById('dialecta-quotes-root');

if (rootEl) {
  const memberId   = rootEl.dataset.memberId   || null;
  const memberName = rootEl.dataset.memberName || null;
  // memberEmail is read-only here for future use (e.g. notification prefs);
  // not currently needed by the app logic.

  createRoot(rootEl).render(
    <QuotesApp memberId={memberId} memberName={memberName} />
  );
}
