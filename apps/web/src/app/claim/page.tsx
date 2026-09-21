import type { Metadata } from 'next';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/articles';
import { isSignedIn } from '@/components/content/session';
import { loginHref } from '@/lib/return-path';
import { strings } from '@/strings';
import { claimProfile } from './actions';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: strings.claim.pageTitle,
  robots: { index: false, follow: false },
};

interface ClaimPageProps {
  searchParams: Promise<{ token?: string | string[]; error?: string | string[] }>;
}

/**
 * Scrubs the token out of the address bar the moment the browser has it, so
 * neither browser history nor Plausible's automatic pageview
 * (apps/web/CLAUDE.md, "Analytics") ever reports it. A plain inline
 * <script>, not a client component or a useEffect: this is part of the
 * server-rendered HTML stream, so it runs synchronously in document order,
 * ahead of both hydration and the root layout's Plausible <Script
 * defer strategy="afterInteractive">, which sits later in the same document
 * (after the footer) and cannot execute before the document has finished
 * parsing regardless. Static and uninterpolated, the token itself never
 * appears in the script text, only already in the URL the browser already has.
 */
function ScrubTokenFromAddressBar() {
  return <script dangerouslySetInnerHTML={{ __html: "try{window.history.replaceState(null,'','/claim');}catch(e){}" }} />;
}

/**
 * /claim: where a legacy member links their sign in to their existing
 * profile and its comments (docs/MORNING-AUDIT-2026-09-21.md item 2.1;
 * supabase/migrations/20260921004417_profile_claim_tokens.sql).
 *
 * The token rides in the query string (?token=...), not a path segment.
 * Every other single-value page parameter in this app does the same
 * (loginHref's own ?next=, /write's ?article=), a query string keeps the
 * route itself constant at /claim no matter which token arrives (a path
 * segment would give every issued link its own route, the wrong shape for a
 * secret that is never a resource address the way a profile handle is), and
 * safeReturnPath already carries a query string through the sign-in round
 * trip unchanged: its own test suite proves this for /write?article=<uuid>,
 * and no change was needed to prove it for this route too (see the builder
 * report for the live round trip it was checked against).
 *
 * The token is only checked for presence here. Whether it actually works is
 * claim_profile's call alone, made in actions.ts on the POST and never here
 * on the GET: see actions.ts for why the redeem has to wait for the button.
 */
export default async function ClaimPage({ searchParams }: ClaimPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <main>
        <p className="notice">{strings.notices.supabaseNotConfigured}</p>
      </main>
    );
  }

  const params = await searchParams;
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;
  const token = typeof tokenParam === 'string' && tokenParam.trim() ? tokenParam.trim() : null;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;

  // actions.ts redirects every claim_profile failure here, with the token
  // already dropped from the URL. Checked ahead of the missing-token
  // message below so a failed attempt reads as a failure, not as a link
  // that never carried a code.
  if (errorParam === '1') {
    return (
      <main>
        <h1>{strings.claim.heading}</h1>
        <p className="notice">{strings.claim.failed}</p>
      </main>
    );
  }

  if (!token) {
    return (
      <main>
        <h1>{strings.claim.heading}</h1>
        <p className="notice">{strings.claim.missingCode}</p>
      </main>
    );
  }

  const signedIn = await isSignedIn();

  if (!signedIn) {
    const returnTo = `/claim?token=${encodeURIComponent(token)}`;
    return (
      <main>
        <ScrubTokenFromAddressBar />
        <h1>{strings.claim.heading}</h1>
        <p>{strings.claim.signInPrompt}</p>
        <Link href={loginHref(returnTo)}>{strings.claim.signInCta}</Link>
      </main>
    );
  }

  return (
    <main>
      <ScrubTokenFromAddressBar />
      <h1>{strings.claim.heading}</h1>
      <p>{strings.claim.explain}</p>
      <form action={claimProfile}>
        <input type="hidden" name="token" value={token} />
        <button type="submit">{strings.claim.submitCta}</button>
      </form>
    </main>
  );
}
