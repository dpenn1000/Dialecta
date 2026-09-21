import Link from 'next/link';
import { strings } from '@/strings';

/**
 * The site-wide 404: any address no route answers, and any notFound() a route
 * without its own not-found.tsx calls. Without this file Next renders its
 * built-in page, which sits outside the paper sheet. A bare <main> is the
 * sheet (globals.css), inside the shell's header and footer like every page.
 * The article and profile routes keep their own.
 */
export default function NotFound() {
  const t = strings.notFoundPage;
  return (
    <main>
      <h1>{t.heading}</h1>
      <p>{t.body}</p>
      <p>
        <Link href="/">{t.home}</Link>
      </p>
    </main>
  );
}
