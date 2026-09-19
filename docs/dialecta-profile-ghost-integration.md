# Dialecta Profile — Ghost Integration Notes

These notes cover everything needed to mount the rebuilt profile components into a Ghost theme. They are scoped to the launch architecture: Ghost owns the shell, React handles the profile body. There is no SPA, no client-side router, no separate Node server.

---

## Files delivered in this pass

| File | Purpose |
|---|---|
| `dialecta-profile.jsx` | Desktop profile. Default export `DialectaProfile` (full chrome, mock USER), named export `DialectaProfileBody` (bare body, accepts `user` prop). |
| `dialecta-profile-mobile.jsx` | Mobile profile. Same dual-export structure. |
| `dialecta-profile-responsive.jsx` | Responsive wrapper. Mounts the correct body based on viewport width (threshold: 1024px) and re-renders when the viewport crosses the breakpoint. This is what Ghost should mount. |
| `dialecta-profile-ghost-integration.md` | This document. |

Both JSX files now use the new Fingerprint engine v2 with `topicPhases`, the canonical v1.3 page background, the two-bar nav (collapsed to hamburger on mobile), the user avatar dropdown, and Palette A gold throughout. The desktop default export still renders standalone for artifact previews so you can keep iterating on the design without touching Ghost.

---

## Architecture

The mount pattern is **Ghost theme + React islands**. Ghost is the source of truth for routing, auth, members, and the shell. React is the source of truth for the profile body. The two communicate through a single JSON blob serialized into a `data-` attribute on the mount root.

```
Browser
  └─ Ghost theme HTML (Handlebars)
       ├─ <header> with Dialecta nav partial    ← Ghost owns this
       ├─ <div id="dialecta-profile-root"        ← Ghost emits this
       │       data-user='{...}'>
       │     <ProfileBody>                       ← React mounts here
       │       ...
       │     </ProfileBody>
       │  </div>
       └─ <footer>                               ← Ghost owns this
```

The React bundle is loaded as a regular `<script>` tag, finds the root element by ID, parses the `data-user` attribute, and mounts `<DialectaProfileBody user={user} />`. No hydration, no SSR. If JS fails to load, Ghost can render a fallback "view your profile" link.

---

## Ghost theme files to create

You will need to create or modify the following files in your Ghost theme directory (typically `content/themes/dialecta/`):

### 1. `partials/site-nav.hbs` — the Dialecta nav partial

This is the two-bar nav (52px logo bar + 34px metallic sub-nav) implemented in Handlebars + inline CSS, so every page in the theme can include it. Mirror the styling from the desktop JSX exactly. The five canonical items are:

- Articles → `/`
- Community → `/community/`
- Stewards → `/stewards/`
- About → `/about/`
- The Pact → `/pact/`

The user avatar dropdown lives in the right side of the logo bar. When a member is logged in, render the avatar with the member's profile photo. When logged out, render a "Sign in" link instead.

You can keep the existing React `UserAvatarDropdown` component as the design reference but reimplement it as a small Handlebars + vanilla-JS toggle. There's no benefit to mounting React just for the dropdown.

### 2. `profile.hbs` — the profile route

Ghost serves this when a member visits `/profile/`. Minimal contents:

```handlebars
{{!< default}}
{{#unless @member}}
  <p>Please <a href="/signin/">sign in</a> to view your profile.</p>
{{else}}
  <div id="dialecta-profile-root"
       data-user='{{member-profile-json}}'></div>
  <script src="{{asset "built/dialecta-profile.js"}}" defer></script>
{{/unless}}
```

The `{{member-profile-json}}` helper does the field mapping (see below). The script tag loads the compiled React bundle.

### 3. `lib/helpers/member-profile-json.js` — the field mapper

Ghost's Members API returns a `member` object with fields like `name`, `email`, `created_at`, and `profile_image`. The React profile component expects a richer shape. This helper bridges them.

Register the helper in your theme's helpers directory:

```javascript
// helpers/member-profile-json.js
module.exports = function memberProfileJson() {
  const m = this.member || {};
  // Note: fields not in Ghost's Members API (archetype, fingerprint, etc.)
  // need to come from your own backend, either via a custom endpoint
  // or by extending Ghost with custom data fields. For launch, you can
  // start with placeholder data and wire up the real backend in a later
  // pass.
  const profile = {
    name: m.name || 'Anonymous',
    handle: '@' + (m.email || '').split('@')[0],
    avatar: (m.name || 'A').slice(0, 2).toUpperCase(),
    joined: new Date(m.created_at).toLocaleDateString('en-US',
                       { month: 'long', year: 'numeric' }),
    location: m.location || '',
    bio: m.bio || '',
    isAuthor: m.role === 'author',
    // Placeholder. Replace with real lookup against your fingerprint
    // service once it exists.
    archetype: { id: 'skeptic', label: 'The Skeptic',
                 note: 'Assigned by the platform.' },
    aspirational: null,
    resonance: 0,
    fingerprint: {
      specificity: { graduations: 0, tierMix: {}, topicPhases: [] },
      calibration: { graduations: 0, tierMix: {}, topicPhases: [] },
      charity:     { graduations: 0, tierMix: {}, topicPhases: [] },
      discourse:   { graduations: 0, tierMix: {}, topicPhases: [] },
      consistency: { graduations: 0, tierMix: {}, topicPhases: [] },
      originality: { graduations: 0, tierMix: {}, topicPhases: [] },
    },
    totals: { comments: 0, articlesEngaged: 0,
              nominatedUp: 0, nominatedDown: 0 },
    tierBreakdown: { forum: 0, spark: 0, echo: 0, fog: 0,
                     heat: 0, stance: 0, breach: 0 },
    sparringPartners: [],
    influences: [],
    fieldNotes: [],
  };
  return new Handlebars.SafeString(
    JSON.stringify(profile).replace(/'/g, '&#39;')
  );
};
```

The single-quote escape is important: the JSON is going inside a `data-user='...'` attribute that uses single quotes, so any apostrophes in member names or bios would otherwise break the HTML.

### 4. `assets/built/dialecta-profile.js` — the React bundle

This is the compiled output of a small bootstrap file that mounts the responsive wrapper. The wrapper picks the desktop or mobile body based on viewport width and re-renders when the viewport crosses the breakpoint.

```javascript
// src/profile-bootstrap.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import DialectaProfileResponsive from './dialecta-profile-responsive.jsx';

const root = document.getElementById('dialecta-profile-root');
if (root) {
  const user = JSON.parse(root.dataset.user);
  createRoot(root).render(<DialectaProfileResponsive user={user} />);
}
```

The responsive wrapper lives in `dialecta-profile-responsive.jsx` and is delivered alongside the two body files. It imports both `DialectaProfileBody` exports, subscribes to a `matchMedia` listener at `(min-width: 1024px)`, and renders the appropriate body. When the viewport crosses the threshold, the wrapper unmounts the outgoing body and mounts the incoming one.

**Why 1024.** The desktop hero card has a fixed 380px right column, 36px card padding, 32px column gap, and the page container has 32px padding. Working backwards from the geometry, the left column equals viewport minus 548. The photo (128) plus gap (22) plus the identity column needs at least about 320 to fit "Daniel Pennington" at 2.6rem on one line, which puts the minimum left column at 470, corresponding to a viewport of about 1018. 1024 is the conventional value sitting just above the collision threshold. Below 1024 the desktop hero starts feeling cramped and the wrapper switches to mobile. The threshold lives in a single constant at the top of the wrapper file so it can be retuned if the hero card layout changes.

**State reset caveat.** When the viewport crosses 1024 in either direction, the desktop and mobile bodies are different React component trees. React unmounts the outgoing tree and mounts the incoming one, so any local state (active tab, aspirational selection, archetype selector visibility) is reset. For most users this is a non-issue because viewport crossings mid-interaction are rare. If state persistence ever becomes important, lift the relevant state into the wrapper and pass it down as props.

Build with whatever bundler you prefer (esbuild is the smallest, Vite is the most ergonomic). You will need React 18+ for the `useId` hook the new Fingerprint engine uses.

---

## What `withChrome={false}` does

When you mount via `DialectaProfileBody`, the component internally calls `<DialectaProfile withChrome={false} />`. This suppresses:

- The outer `min-height: 100vh` and the page background gradient (Ghost's body owns these)
- The `<link>` tag that loads Google Fonts (Ghost's `default.hbs` should load them in the `<head>`)
- The fixed paper grain overlay (Ghost can render this as a body-level CSS pseudo-element if you want it)
- The entire sticky two-bar nav block (Ghost serves this as the partial above)

What remains: the maxWidth content container with the hero card, the new Fingerprint, the tier breakdown, the live feed, the field notes, the influences, and the archetype selector modal. These are the bits that genuinely benefit from React's interactivity.

---

## Fonts

Move this `<link>` tag from the React component into your theme's `default.hbs` `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

In production you should self-host the fonts to avoid the Google Fonts third-party request. The four families used are Cormorant Garamond, DM Sans, Source Serif 4, and DM Mono.

---

## CSS variables for the Handlebars partial

The React components use the `T` token object internally. For the Handlebars nav partial and any other theme CSS you write, expose the same values as CSS variables on `:root`:

```css
:root {
  --dialecta-bg-primary: #f7f2e8;
  --dialecta-bg-secondary: #efe8da;
  --dialecta-bg-white: #fffdf8;
  --dialecta-bg-dark: #1c1814;
  --dialecta-bg-stone-light: #a8a398;
  --dialecta-bg-stone-dark: #8c8780;
  --dialecta-text-primary: #1c1814;
  --dialecta-text-body: #3a342c;
  --dialecta-text-secondary: #5a5248;
  --dialecta-gold: #b8862e;
  --dialecta-gold-bright: #d4a84a;
  --dialecta-amber: #b8732a;
  --dialecta-border-light: #e8e0d0;
  --dialecta-border-medium: #d8ceb8;
}

body {
  background: linear-gradient(135deg,
    var(--dialecta-bg-stone-light) 0px,
    var(--dialecta-bg-stone-dark) 175px,
    var(--dialecta-bg-primary) 775px,
    var(--dialecta-bg-primary) 100%);
  color: var(--dialecta-text-body);
  font-family: 'DM Sans', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## Open items, not resolved in this pass

These are real divergences that surfaced during the rebuild and need your call before launch.

### 1. Desktop and mobile are out of sync on archetypes

- Desktop ARCHETYPES has eight entries ending in **Diplomat, Builder, Empiricist, Contextualist, Illuminator, Oracle**.
- Mobile ARCHETYPES has eight entries ending in **Advocate** (replaces Diplomat) and **Reviser** (replaces Oracle).
- Desktop USER has `archetype: diplomat`, `aspirational: oracle`.
- Mobile USER has `archetype: builder`, `aspirational: advocate`.

This is the Steelman → Advocate decision (still flagged "no decision reached yet" in the project memory) plus The Reviser archetype from Growth Layer Principles v1.0. Both landed silently in mobile but never propagated to desktop.

Three options:
- **A.** Sync desktop forward to mobile (formally accept Advocate + Reviser, update desktop ARCHETYPES, USER, and the four other documented references from earlier sessions).
- **B.** Sync mobile back to desktop (revert mobile to Diplomat + Oracle until Steelman/Advocate is formally decided).
- **C.** Leave as-is and resolve in its own dedicated session. This is the most honest option given that the decision was explicitly deferred.

### 2. Design Spec v1.3 doc is out of sync with the canonical Palette A decision

The spec doc itself still shows the brighter Palette B values (`#d4a84a` / `#e8a830`) for the gold tokens. The canonical decision (locked this session) is Palette A (`#b8862e` / `#d4a84a`). The two profile JSX files now use Palette A correctly. The spec doc needs a future update so it stops contradicting the code.

### 3. Responsive Foundations session still pending

Both profile files are now responsive in the loose sense (one is desktop, one is mobile, the bootstrap picks at runtime). They are not responsive in the rigorous sense — there's no shared breakpoint system, no fluid type scale, no container queries. The Responsive Foundations session is logged in the Project Index and is the proper place to resolve this. For launch, the runtime-pick approach is acceptable.

### 4. Member backend for fingerprint data

The `member-profile-json` helper above returns an empty fingerprint as a placeholder. The real fingerprint data needs to come from your classification engine, not from Ghost. You'll need either:

- A custom Ghost endpoint that proxies to your fingerprint service, or
- A separate fetch from the React component once mounted (replace the `data-user` pattern with a `data-member-id` pattern and have the component call your API).

The second option is cleaner long-term but requires a real backend. The first option works immediately but couples Ghost to your engine.

---

## Suggested next pass

In rough priority order:

1. Decide on the desktop/mobile archetype divergence (option A, B, or C above).
2. Resync the v1.3 design spec doc to Palette A.
3. Wire up a minimal Ghost theme with the partials and helper above. Mock fingerprint data is fine for this step.
4. Run the bundler and prove the React bundle mounts cleanly inside Ghost with the dual export.
5. Build the real fingerprint backend endpoint and replace the placeholder data.
6. Open the Responsive Foundations session.
