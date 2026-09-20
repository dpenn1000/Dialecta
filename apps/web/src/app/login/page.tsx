import { LoginForm } from '@/components/login/login-form';
import { strings } from '@/strings';

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <main>
      <h1>{strings.login.heading}</h1>
      <p>{strings.login.tagline}</p>
      {error === 'auth' ? <p className="notice">{strings.login.signInFailed}</p> : null}
      <LoginForm />
    </main>
  );
}
