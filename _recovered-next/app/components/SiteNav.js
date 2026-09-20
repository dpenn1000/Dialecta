/**
 * SiteNav — chrome for SSR pages on library.dialecta.org.
 *
 * Mirrors the theme's nav (default.hbs) closely enough to feel like the
 * same site. Uses the same CSS classes (.site-nav, .nav-logo-bar,
 * .nav-sub-bar, .dialecta-build-strip, etc.) which are loaded globally
 * via theme/style.css in app/layout.js.
 *
 * Differences from theme's nav, by design:
 *   - No member-aware bits (bell, Write CTA, avatar, member name) since
 *     this surface is for crawlers + external arrivals, not authenticated
 *     in-app navigation.
 *   - All nav links point back at the apex (dialecta.org). The subdomain
 *     is a SEO surface; users navigating into the rest of the site go
 *     back to the apex naturally.
 *   - Ghost's {{navigation}} helper is replaced with a hardcoded
 *     canonical 7-item list (Articles, Community, Stewards, The Pact,
 *     The Living Fingerprint, Guidebook, About). Mirrors the theme's
 *     Ghost-admin nav config exactly; if that config ever changes,
 *     update here too.
 *   - Sub-nav icons (the SVG glyphs visible on dialecta.org) are
 *     deferred to a Phase 3-polish followup. They live in default.hbs's
 *     icon sprite and would need to be ported into a shared component
 *     here.
 *
 * Logo: served from Ghost (@site.logo), URL hardcoded for now. The
 * cross-origin dependency is acceptable in trade for visual fidelity:
 * a stub text wordmark made share-landing pages feel like a different
 * site, breaking the trust contract for external arrivals from social.
 */

const APEX_URL = 'https://dialecta.org';

// Ghost-served brand logo. URL discovered via fetching dialecta.org
// directly. Stable as long as the publication's logo asset isn't
// re-uploaded under a different filename in Ghost admin.
const LOGO_URL = 'https://www.dialecta.org/content/images/2026/04/Dialecta---Hero-Logo---PNG.png';

const NAV_LINKS = [
  { label: 'Articles',              href: APEX_URL + '/articles/'    },
  { label: 'Community',             href: APEX_URL + '/community/'   },
  { label: 'Stewards',              href: APEX_URL + '/stewards/'    },
  { label: 'The Pact',              href: APEX_URL + '/pact/'        },
  { label: 'The Living Fingerprint', href: APEX_URL + '/fingerprint/' },
  { label: 'Guidebook',             href: APEX_URL + '/guidebook/'   },
  { label: 'About',                 href: APEX_URL + '/about/'       },
];

export default function SiteNav() {
  return (
    <>
      {/* Build-strip banner. Visible above the nav on every SSR page. */}
      <div className="dialecta-build-strip" role="status" aria-live="polite">
        <span className="dialecta-build-strip-mark" aria-hidden="true">⁂</span>
        <span className="dialecta-build-strip-text">
          <span className="dialecta-brass dialecta-build-strip-name">Dialecta</span>{' '}
          is in active development.{' '}
          <a href={APEX_URL + '/about/'}>Tell us what you see.</a>
        </span>
        <span className="dialecta-build-strip-mark" aria-hidden="true">⁂</span>
      </div>

      <nav className="site-nav">
        <div className="nav-logo-bar">
          <div className="nav-logo-inner">
            <a href={APEX_URL} style={{ display: 'inline-flex', alignItems: 'center' }} aria-label="Dialecta">
              <img
                src={LOGO_URL}
                alt="Dialecta"
                style={{ height: 40, width: 'auto', display: 'block' }}
              />
            </a>
            <div className="nav-member-area">
              <a href={APEX_URL + '/#/portal/signin'} className="nav-signin-link">Sign in</a>
              <a href={APEX_URL + '/#/portal/signup'} className="nav-join-link">Join</a>
            </div>
          </div>
        </div>
        <div className="nav-sub-bar">
          <div className="nav-sub-inner">
            <ul style={{ display: 'flex', gap: 24, listStyle: 'none', margin: 0, padding: 0 }}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
