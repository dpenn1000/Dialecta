import { useState, useEffect } from "react";
import { DialectaProfileBody as DesktopProfileBody } from "./dialecta-profile.jsx";
import { DialectaProfileBody as MobileProfileBody } from "./dialecta-profile-mobile.jsx";

// ═══════════════════════════════════════════════════════════════════════════
// DIALECTA PROFILE — RESPONSIVE WRAPPER
// ─────────────────────────────────────────────────────────────────────────
// Picks the appropriate profile body (desktop or mobile) based on viewport
// width, and re-mounts when the viewport crosses the breakpoint.
//
// THRESHOLD RATIONALE
// ─────────────────────────────────────────────────────────────────────────
// The desktop hero card uses a 2-column grid: minmax(0, 1fr) | 380px right
// column, with 36px card padding each side and 32px column gap. The page
// container has 32px padding each side and a max-width of 1060.
//
// Working backwards from the geometry:
//
//   left column width = viewport − 32 − 32 − 36 − 36 − 32 − 380
//                     = viewport − 548
//
// The photo (128px) + gap (22px) + identity column inside the left column
// needs the identity column to be at least ~320px wide to fit "Daniel
// Pennington" at 2.6rem on one line. That puts the minimum left column at
// 128 + 22 + 320 = 470, which corresponds to a viewport of about 1018.
//
// 1024 is the conventional breakpoint sitting just above the collision
// threshold. Below 1024, the desktop hero starts to feel cramped: the name
// wraps, the bio narrows toward an uncomfortable line length, and the badges
// row may wrap awkwardly. At and above 1024 the layout has breathing room.
//
// If you tune the desktop hero further, recalculate this number and update
// the constant.
// ═══════════════════════════════════════════════════════════════════════════

const DESKTOP_MIN_WIDTH = 1024; // px

// Match-media query, kept as a string so it can be reused for SSR safety.
const DESKTOP_QUERY = `(min-width: ${DESKTOP_MIN_WIDTH}px)`;

// Read the current viewport state safely (returns true on the server so the
// initial render is desktop and won't flash if hydration runs on a wide
// viewport). Server-side environments will see this on first render; the
// useEffect below will correct on the client if needed.
function getInitialIsDesktop() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_QUERY).matches;
}

export default function DialectaProfileResponsive(props) {
  const [isDesktop, setIsDesktop] = useState(getInitialIsDesktop);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(DESKTOP_QUERY);
    const handler = (e) => setIsDesktop(e.matches);

    // Modern browsers
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
      // Sync once in case the matchMedia state moved between initial state
      // resolution and effect attachment (rare but possible during fast
      // resizes or hydration).
      setIsDesktop(mq.matches);
      return () => mq.removeEventListener("change", handler);
    }

    // Safari < 14 / older browsers fall back to the deprecated API.
    mq.addListener(handler);
    setIsDesktop(mq.matches);
    return () => mq.removeListener(handler);
  }, []);

  return isDesktop
    ? <DesktopProfileBody {...props} />
    : <MobileProfileBody {...props} />;
}

// Named export with the same name, in case Ghost integration prefers it.
export { DialectaProfileResponsive };

// Re-export the threshold so the Ghost theme or any consumer can read it
// (for instance, to gate analytics events or to inform a fallback message).
export { DESKTOP_MIN_WIDTH };

// ─────────────────────────────────────────────────────────────────────────
// USAGE NOTES
// ─────────────────────────────────────────────────────────────────────────
// Mount this wrapper instead of either of the two body components directly:
//
//   import { createRoot } from "react-dom/client";
//   import DialectaProfileResponsive from "./dialecta-profile-responsive.jsx";
//
//   const root = document.getElementById("dialecta-profile-root");
//   const user = JSON.parse(root.dataset.user);
//   createRoot(root).render(<DialectaProfileResponsive user={user} />);
//
// CAVEAT: STATE RESET ON CROSSOVER
// When the viewport crosses 1024 in either direction, the desktop body and
// mobile body are different React component trees. React will unmount the
// outgoing tree and mount the incoming one, which means any local state
// (active tab, aspirational selection, archetype selector visibility) is
// reset. For most users this is a non-issue because viewport crossings
// during active interaction are rare. If you ever need state to persist
// across the crossover, lift the relevant state out of the body components
// into this wrapper and pass it down as props.
//
// ASYNC LOADING (optional)
// If bundle size becomes a concern, you can replace the static imports
// above with React.lazy + Suspense so each body is loaded only when its
// breakpoint matches. This trades a one-time fetch on first crossover for
// a smaller initial bundle. For Ghost integration this is probably not
// worth it — both bodies share most dependencies (React, the Fingerprint
// engine) and the marginal saving is small.
