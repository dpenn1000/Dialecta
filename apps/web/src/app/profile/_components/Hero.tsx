/**
 * The hero card: identity on the left, the Order and the Thinking Fingerprint
 * on the right. Ported from the HERO IDENTITY SECTION of dialecta-profile.jsx.
 * A server component, and so is the fingerprint inside it, which hydrates
 * nothing; the archetype controls are the only island.
 *
 * Left out, each because what it called does not exist in apps/web: the
 * settings drawer the name opened, the Share and Edit controls, the Follow
 * button (its PATCH trusted a member id from the client), the Welcome card
 * and the Order negotiation card.
 *
 * "Joined" is back (2026-09-21): profiles still has no created_at, but live's
 * own version never read one either, it reads the Ghost member session's
 * created_at, gated to the viewer's own profile (page-profile.hbs, home.js).
 * data.ts's joinedAt is that same gate under Supabase Auth: the viewer's own
 * auth.users.created_at, read only once this profile is already known to be
 * theirs. Null for every profile but the viewer's own, same as live.
 */
import Link from 'next/link';
import { ARCHETYPE_IDS, fingerprintSalt } from '@dialecta/core';
import { Fingerprint } from '@/components/fingerprint';
import { strings } from '@/strings';
import type { ProfilePageData } from '../_lib/data';
import { displayName, fingerprintCaption, fingerprintLabel, initialsOf, joinedDate, orderDisplay } from '../_lib/view';
import { ArchetypeControls, type ArchetypeCopy, type ArchetypeControlsCopy } from './ArchetypeControls';
import { Avatar, MemberHero, OrderHero, Signature } from './bits';
import styles from './profile.module.css';

const S = strings.profile;

/** Geometry size of the hero fingerprint. The frame is this plus 22px a side. Recovered desktop value. */
const FINGERPRINT_SIZE = 296;

const ARCHETYPE_COPY: ArchetypeCopy[] = ARCHETYPE_IDS.map((id) => ({
  id,
  ...S.archetypes[id],
  toward: S.archetypeModal.toward(S.archetypes[id].label),
}));

const M = S.archetypeModal;
const CONTROLS_COPY: ArchetypeControlsCopy = {
  platformChip: S.platformChip,
  formingLabel: S.formingLabel,
  aspiringTo: S.aspiringTo,
  setAspiration: S.setAspiration,
  open: M.open,
  eyebrowOwn: M.eyebrowOwn,
  eyebrow: M.eyebrow,
  heading: M.heading,
  introOwn: M.introOwn,
  intro: M.intro,
  assignedOwn: M.assignedOwn,
  assigned: M.assigned,
  locked: M.locked,
  hint: M.hint,
  clear: M.clear,
  done: M.done,
  close: M.close,
  notSaved: M.notSaved,
};

export function Hero({ data, dev }: { data: ProfilePageData; dev: boolean }) {
  const p = data.profile;
  const name = displayName(p.displayName);
  const initials = initialsOf(p.displayName);
  const order = orderDisplay(p.order);
  const readable = data.fingerprintStatus === 'ok';
  const hasWriting = data.articles.length > 0;
  const meta = p.location;
  const joined = joinedDate(data.joinedAt);

  return (
    <section className={`${styles.brassCard} ${styles.hero}`} aria-label={name}>
      <div className={styles.identity}>
        <div className={styles.identityRow}>
          <Avatar url={p.avatarUrl} initials={initials} name={name} />
          <div className={styles.identityCol}>
            <h1 className={styles.name}>{name}</h1>
            {p.pactSignedName ? <Signature name={p.pactSignedName} font={p.signatureFont} /> : null}
            <ArchetypeControls
              assigned={data.archetype?.id ?? null}
              aspirational={p.aspirational}
              archetypes={ARCHETYPE_COPY}
              isOwn={data.isOwnProfile}
              copy={CONTROLS_COPY}
            />
          </div>
        </div>

        <div className={`${styles.brassCard} ${styles.contributorCard}`}>
          <div className={styles.orderGhost} aria-hidden="true">
            {order?.ornament ?? S.orderFallbackOrnament}
          </div>
          <div className={styles.orderDisk} aria-hidden="true">
            {order?.ornament ?? S.orderFallbackOrnament}
          </div>
          <div className={styles.cardBody}>
            <p className={styles.cardHandle}>{p.handle ? S.handle(p.handle) : name}</p>
            {joined || meta ? (
              <p className={styles.cardMeta}>
                {joined ? S.joined(joined) : null}
                {joined && meta ? ' · ' : null}
                {meta}
              </p>
            ) : null}
          </div>
        </div>

        {p.bio ? <p className={styles.bio}>{p.bio}</p> : null}

        {hasWriting ? (
          <div className={styles.actions}>
            <Link href={`/profile/${p.id}?tab=articles#profile-tabs`} className={styles.outlineLink}>
              {data.isOwnProfile ? S.seeWriting.own : S.seeWriting.other} →
            </Link>
          </div>
        ) : null}
      </div>

      <div className={styles.rightCol}>
        {order || !p.isAuthor ? (
          <div className={styles.orderHero}>{order ? <OrderHero order={order} /> : <MemberHero />}</div>
        ) : null}

        <div className={styles.fpHead}>
          <h2 className={styles.fpTitle}>{S.fingerprintTitle}</h2>
          <div className={styles.fpRule} aria-hidden="true" />
          <p className={styles.fpCaption}>{fingerprintCaption(data.fingerprint, readable)}</p>
        </div>

        <div className={styles.fpFrame}>
          <Fingerprint
            data={data.fingerprint}
            size={FINGERPRINT_SIZE}
            resonance={p.resonance}
            salt={fingerprintSalt(p.id)}
            label={fingerprintLabel(name, data.fingerprint)}
          />
        </div>

        {dev && data.fingerprintStatus === 'no-service-key' ? <p className={styles.devNote}>{S.devUnlinked}</p> : null}
        {dev && data.fingerprintStatus === 'lookup-failed' ? (
          <p className={styles.devNote}>{S.devLookupFailed}</p>
        ) : null}
      </div>
    </section>
  );
}
