/**
 * The site header: the live theme's two-bar nav, ported from _theme/default.hbs
 * (<nav class="site-nav">) and the NAV rules in _theme/assets/css/style.css.
 *
 *   brand bar  the cream-to-ink logo bar: logo left; Write, the sign in state
 *              and the drawer toggle right, on the ink half, which is the only
 *              place in the header brass may letter (designer D-27)
 *   sub-bar    the metallic strip: the seven destinations with their brass
 *              icons at lg and up; below lg the links move into the drawer and
 *              the strip carries the decorative asterism instead
 *
 * A server component. The member state is read here, from the verified
 * session (./member.ts), and handed to the drawer as data.
 *
 * Differences from the live nav, by decision rather than omission:
 * - In the page flow, not position: fixed. The live nav was fixed under a 33px
 *   build banner, and every page padded itself by --nav-height to clear it.
 *   Here pages stack under the header and --nav-height is 0 (see
 *   styles/dialecta-surfaces.css), so a ported sticky element that offsets by
 *   it sticks at the top edge instead of 86px below it.
 * - No build banner and no feedback modal. The port ruling dropped the banner
 *   (council/log/2026-09-20-port-or-rewrite.md, layout.js row) and the modal
 *   posted to an /api/feedback route apps/web does not have.
 * - No Join. Sign in is /login, which signs up and signs in through the same
 *   magic link, so a second button would name the same door twice.
 * - Write shows to visitors too: /write drafts for anyone and gates only the
 *   publish call (see app/write/page.tsx).
 * - No notifications bell yet; its island is ruled adapted and not yet ported.
 */
import Image from 'next/image';
import Link from 'next/link';
import { strings } from '@/strings';
import logo from './dialecta-logo.png';
import { StripCurveIcon } from './icons';
import { readShellMember } from './member';
import { NavDrawer, PrimaryNav, type DrawerLabels } from './nav-client';
import { navItems } from './nav-items';
import { SignInLink } from './sign-in-link';

export async function SiteHeader() {
  const member = await readShellMember();
  const items = navItems();
  const s = strings.shell;

  const drawerLabels: DrawerLabels = {
    open: s.openMenu,
    close: s.closeMenu,
    drawer: s.drawerLabel,
    primary: s.primaryNavLabel,
    subtitle: s.drawerSubtitle,
    write: s.write,
    signIn: s.signIn,
    signOut: s.signOut,
    signedIn: s.signedIn,
    siteName: strings.site.name,
  };

  const memberChip = member ? (
    <>
      <span className="nav-member-initials" aria-hidden="true">
        {member.initials}
      </span>
      <span className="nav-member-name">{member.name ?? s.signedIn}</span>
    </>
  ) : null;

  return (
    <header className="site-nav">
      <div className="nav-logo-bar">
        <div className="nav-logo-inner">
          <Link href="/" className="nav-logo-link">
            <Image src={logo} alt={strings.site.name} className="nav-logo" priority unoptimized />
          </Link>

          <div className="nav-member-area">
            <Link href="/write" className="nav-write-link">
              {s.write}
            </Link>
            {member ? (
              member.href ? (
                <Link href={member.href} className="nav-member-link">
                  {memberChip}
                </Link>
              ) : (
                <span className="nav-member-link">{memberChip}</span>
              )
            ) : (
              <SignInLink className="nav-signin-link">{s.signIn}</SignInLink>
            )}
            <NavDrawer items={items} member={member} labels={drawerLabels} />
          </div>
        </div>
      </div>

      <div className="nav-sub-bar">
        <nav className="nav-sub-inner" aria-label={s.primaryNavLabel}>
          <PrimaryNav items={items} />
        </nav>
        <div className="nav-asterism-strip" aria-hidden="true">
          <span className="nav-asterism-swipe" />
          <StripCurveIcon size={22} className="nav-asterism-mark" />
          <span className="nav-asterism-swipe" />
        </div>
      </div>
    </header>
  );
}
