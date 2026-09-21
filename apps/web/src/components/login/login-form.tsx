'use client';

/**
 * The only client island on /login. Everything else on the page (heading,
 * tagline, the error notice for an expired callback) is a server component;
 * this exists only because a form needs useActionState, which needs state,
 * which needs the client.
 *
 * Both forms carry `returnTo`, the page to come back to, as a hidden field.
 * The page checked it already; the actions check it again before storing it,
 * because a form field is whatever the browser sends.
 */
import { useActionState } from 'react';
import { sendMagicLink, signInWithGoogle, type MagicLinkState } from '@/app/login/actions';
import { strings } from '@/strings';

const initialState: MagicLinkState = { status: 'idle' };

export function LoginForm({ returnTo }: { returnTo: string }) {
  const [state, formAction, isPending] = useActionState(sendMagicLink, initialState);

  if (state.status === 'sent') {
    return <p className="notice">{strings.login.magicLinkSent(state.email ?? '')}</p>;
  }

  return (
    <div>
      {state.status === 'error' ? <p className="notice">{strings.login.magicLinkFailed}</p> : null}

      {/* The hidden fields go last: globals.css spaces each child of a form
          after the first, and a hidden field first would push the label down. */}
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
        <input type="hidden" name="next" value={returnTo} />
      </form>

      <form action={signInWithGoogle}>
        <button type="submit">{strings.login.continueWithGoogle}</button>
        <input type="hidden" name="next" value={returnTo} />
      </form>
    </div>
  );
}
