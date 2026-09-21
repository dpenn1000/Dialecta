/**
 * The join card that closes the visitor feed: index.hbs's .feed-join-cta.
 * Ghost's portal links (#/portal/signup, #/portal/signin) become /login, which
 * signs a new reader up and an existing one in through the same two doors.
 */
import Link from 'next/link';
import { loginHref } from '@/lib/return-path';
import { strings } from '@/strings';
import s from './feed.module.css';

/** `returnTo` is the page a reader comes back to after signing in: the one this card sits on. */
export function JoinCta({ returnTo = '/' }: { returnTo?: string } = {}) {
  const t = strings.content.front.joinCta;
  const href = loginHref(returnTo);
  return (
    <div className={s.join}>
      <p className={s.joinLabel}>{t.label}</p>
      <p className={s.joinSub}>{t.sub}</p>
      <Link href={href} className={s.joinBtn}>
        {t.createAccount}
      </Link>
      <Link href={href} className={s.joinSignin}>
        {t.signIn}
      </Link>
    </div>
  );
}
