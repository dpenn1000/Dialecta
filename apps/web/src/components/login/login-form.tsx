'use client';

/**
 * The only client island on /login. Everything else on the page (heading,
 * tagline, the error notice for an expired callback) is a server component;
 * this exists only because a form needs useActionState, which needs state,
 * which needs the client.
 */
import { useActionState } from 'react';
import { sendMagicLink, signInWithGoogle, type MagicLinkState } from '@/app/login/actions';
import { strings } from '@/strings';

const initialState: MagicLinkState = { status: 'idle' };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.status === 'sent') {
    return <p className="notice">{strings.login.magicLinkSent(state.email ?? '')}</p>;
  }

  return (
    <div>
      {state.status === 'error' ? <p className="notice">{strings.login.magicLinkFailed}</p> : null}

      <form action={formAction}>
        <label htmlFor="email">{strings.login.emailLabel}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={strings.login.emailPlaceholder}
          defaultValue={state.email ?? ''}
        />
        <button type="submit" disabled={isPending}>
          {isPending ? strings.login.sending : strings.login.sendLink}
        </button>
      </form>

      <form action={signInWithGoogle}>
        <button type="submit">{strings.login.continueWithGoogle}</button>
      </form>
    </div>
  );
}
