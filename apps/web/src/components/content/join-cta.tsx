/**
 * The join card that closes the visitor feed: index.hbs's .feed-join-cta.
 * Ghost's portal links (#/portal/signup, #/portal/signin) become /login, which
 * signs a new reader up and an existing one in through the same two doors.
 */
import Link from 'next/link';
import { strings } from '@/strings';
import s from './feed.module.css';

export function JoinCta() {
  const t = strings.content.front.joinCta;
  return (
    <div className={s.join}>
      <p className={s.joinLabel}>{t.label}</p>
      <p className={s.joinSub}>{t.sub}</p>
      <Link href="/login" className={s.joinBtn}>
        {t.createAccount}
      </Link>
      <Link href="/login" className={s.joinSignin}>
        {t.signIn}
      </Link>
    </div>
  );
}
