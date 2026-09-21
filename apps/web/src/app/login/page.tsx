import { safeReturnPath } from '@dialecta/core';
import { LoginForm } from '@/components/login/login-form';
import { strings } from '@/strings';

interface LoginPageProps {
  searchParams: Promise<{ error?: string; next?: string | string[] }>;
}

/**
 * `?next=` is the page to come back to once signed in, as lib/return-path.ts's
 * loginHref builds it. It is checked here only so the form never carries a
 * hostile value; the server actions and the callback check it again, and are
 * what the redirect actually trusts.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, next } = await searchParams;
  const returnTo = safeReturnPath(Array.isArray(next) ? next[0] : next);

  return (
    <main>
      <h1>{strings.login.heading}</h1>
      <p>{strings.login.tagline}</p>
      {error === 'auth' ? <p className="notice">{strings.login.signInFailed}</p> : null}
      <LoginForm returnTo={returnTo} />
    </main>
  );
}
