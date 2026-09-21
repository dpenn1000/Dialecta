'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loginHref } from '@/lib/return-path';

/**
 * The header's Sign in link, pointing back at the page it sits on. The header
 * is a server component and has no pathname to read, so this one link is a
 * client component; loginHref() runs safeReturnPath, so nothing it builds can
 * leave the site.
 */
export function SignInLink({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname();
  return (
    <Link href={loginHref(pathname ?? '/')} className={className}>
      {children}
    </Link>
  );
}
