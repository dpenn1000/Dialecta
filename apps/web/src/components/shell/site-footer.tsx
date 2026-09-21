/**
 * The site footer. default.hbs has none: the live site closed each page with
 * that page's own footer, and three pages had one. This composes the shared
 * version from those three rather than inventing a fourth vocabulary:
 *
 *   the mark    page-pact.hbs .footer-mark: Cormorant, caps, 0.22em tracking,
 *               in terra (the fingerprint footer's --amber mark would be brass
 *               lettering on paper, which designer D-27 rules out)
 *   the note    page-pact.hbs .footer-note, verbatim, in reading italic
 *   the rule    page-fingerprint.hbs .fp-footer's brass top rule, as a hairline
 *   the links   the primary nav again, for a reader who scrolled to the end
 *
 * The surface is cream paper with the paper grain, so the footer reads the same
 * wherever the fixed body gradient happens to be under it.
 */
import Link from 'next/link';
import { strings } from '@/strings';
import { navItems } from './nav-items';

/** The asterism (U+2042), the house ornament. */
const ASTERISM = '⁂';

export function SiteFooter() {
  const items = navItems();
  const s = strings.shell;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-ornament" aria-hidden="true">
          {ASTERISM}
        </div>
        <p className="site-footer-mark">{strings.site.name}</p>
        <p className="site-footer-note">{s.footerNote}</p>
        <nav aria-label={s.footerNavLabel}>
          <ul className="site-footer-links">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/write">{s.write}</Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
