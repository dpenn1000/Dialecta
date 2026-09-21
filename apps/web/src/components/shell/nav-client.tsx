'use client';

/**
 * The shell's one client module: the primary nav's current-page state and the
 * editorial drawer. Both need the browser. The root layout persists across
 * client navigations, so the current link has to come from usePathname()
 * rather than from a server render, and the drawer holds open state.
 *
 * Ported from _theme/default.hbs: the drawer markup ("EDITORIAL DRAWER (Model
 * B mobile nav)") and its toggle script (open and close on the toggle, the
 * scrim, Escape and a link tap; html.drawer-open locks page scroll). What
 * changed: the drawer is inert while closed, so its links are out of the tab
 * order and the accessibility tree; focus moves into it on open, stays inside
 * it while open, and returns to the toggle on close; it closes itself when the
 * route changes, which a Ghost page never needed because every link was a full
 * reload. The member panel drops Account (Ghost Portal), the Steward Order line
 * (the Order taxonomy is held, council/log/2026-09-20-port-or-rewrite.md) and
 * the admin shortcuts (dev-admin was dropped in the same ruling).
 *
 * Labels arrive as props from the server header. This module never imports
 * strings.ts, which would put every label on the site into every page's
 * client bundle.
 */
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { signOut } from './actions';
import logo from './dialecta-logo.png';
import { CloseIcon, MenuIcon, NavIcon } from './icons';
import type { ShellMember } from './member';
import type { ShellNavItem } from './nav-items';

/** The asterism (U+2042) that divides the drawer's links from its member panel. */
const ASTERISM = '⁂';

/** Articles owns `/` and every article under it; the rest own their own subtree. */
function isCurrent(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname.startsWith('/articles');
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PrimaryNav({ items }: { items: readonly ShellNavItem[] }) {
  const pathname = usePathname();
  return (
    <ul className="nav-sub-list">
      {items.map((item) => {
        const current = isCurrent(pathname, item.href);
        return (
          <li key={item.href}>
            <Link href={item.href} className="nav-sub-link" aria-current={current ? 'page' : undefined}>
              <NavIcon name={item.icon} size={14} className="nav-sub-icon" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export interface DrawerLabels {
  open: string;
  close: string;
  drawer: string;
  primary: string;
  subtitle: string;
  write: string;
  signIn: string;
  signOut: string;
  signedIn: string;
  siteName: string;
}

interface NavDrawerProps {
  items: readonly ShellNavItem[];
  member: ShellMember | null;
  labels: DrawerLabels;
}

const DRAWER_ID = 'site-drawer';
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function NavDrawer({ items, member, labels }: NavDrawerProps) {
  const pathname = usePathname();
  // The drawer is open for the path it was opened on. A navigation changes the
  // path, so it reads as closed on the next render without an effect to reset it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpenOn(null), []);
  const closeAndReturn = useCallback(() => {
    setOpenOn(null);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('drawer-open');
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAndReturn();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => {
      root.classList.remove('drawer-open');
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeAndReturn]);

  const state = open ? 'open' : 'closed';

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        className="nav-drawer-toggle"
        data-state={state}
        aria-expanded={open}
        aria-controls={DRAWER_ID}
        aria-label={open ? labels.close : labels.open}
        onClick={() => (open ? close() : setOpenOn(pathname))}
      >
        <MenuIcon size={20} />
      </button>

      <div className="nav-drawer-scrim" data-state={state} aria-hidden="true" onClick={closeAndReturn} />

      <div
        ref={panelRef}
        id={DRAWER_ID}
        className="nav-drawer"
        data-state={state}
        role="dialog"
        aria-modal="true"
        aria-label={labels.drawer}
        inert={!open}
      >
        <div className="nav-drawer-header">
          <Link href="/" className="nav-drawer-logo-link" onClick={close}>
            <Image src={logo} alt={labels.siteName} className="nav-drawer-logo" unoptimized />
          </Link>
          <span className="nav-drawer-subtitle">{labels.subtitle}</span>
          <button
            ref={closeRef}
            type="button"
            className="nav-drawer-close"
            aria-label={labels.close}
            onClick={closeAndReturn}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <nav aria-label={labels.primary}>
          <ul className="nav-drawer-links">
            {items.map((item) => {
              const current = isCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={current ? 'page' : undefined} onClick={close}>
                    <NavIcon name={item.icon} size={22} className="nav-drawer-icon" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="nav-drawer-divider" aria-hidden="true">
          {ASTERISM}
        </div>

        <div className="nav-drawer-member">
          {member ? (
            <>
              <div className="nav-drawer-avatar" aria-hidden="true">
                {member.initials}
              </div>
              {member.href ? (
                <Link href={member.href} className="nav-drawer-membername" onClick={close}>
                  {member.name ?? labels.signedIn}
                </Link>
              ) : (
                <div className="nav-drawer-membername">{member.name ?? labels.signedIn}</div>
              )}
            </>
          ) : null}
          <div className="nav-drawer-memberlinks">
            <Link href="/write" className="nav-drawer-pill" onClick={close}>
              {labels.write}
            </Link>
            {member ? (
              <form action={signOut}>
                <button type="submit" className="nav-drawer-pill nav-drawer-pill--leave">
                  {labels.signOut}
                </button>
              </form>
            ) : (
              <Link href="/login" className="nav-drawer-pill" onClick={close}>
                {labels.signIn}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
