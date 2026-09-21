/**
 * Small server-rendered pieces of the profile, ported from the sub-components
 * at the top of dialecta-profile.jsx and from OrderBadge in
 * dialecta-profile-order.jsx. None of them holds state.
 */
import type { CSSProperties } from 'react';
import { tierName, type Tier } from '@dialecta/core';
import { strings } from '@/strings';
import type { FieldNote, Influence } from '../_lib/rows';
import { hashedColor, type OrderDisplay } from '../_lib/view';
import styles from './profile.module.css';

const S = strings.profile;

/** A tier chip in the tier's own tokens. The recovered TierBadge, sm size. */
export function TierBadge({ tier }: { tier: Tier }) {
  const style: CSSProperties = {
    background: `linear-gradient(180deg, var(--tier-${tier}-top), var(--tier-${tier}-bot))`,
    border: `1px solid var(--tier-${tier}-border)`,
    color: `var(--tier-${tier}-text)`,
  };
  return (
    <span className={styles.tierBadge} style={style}>
      {tierName(tier)}
    </span>
  );
}

/**
 * The profile photo in its gold ring, or initials when there is none.
 * A plain <img>: avatar_url points at Ghost, Gravatar and Supabase Storage,
 * and next/image would need every one of them listed in next.config.ts,
 * which this page does not own.
 */
export function Avatar({ url, initials, name }: { url: string | null; initials: string; name: string }) {
  return (
    <div className={styles.avatar}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote hosts are not configured for next/image; see the comment above
        <img className={styles.avatarImage} src={url} alt={name} />
      ) : (
        <div className={styles.avatarInitials} aria-hidden="true">
          {initials}
        </div>
      )}
    </div>
  );
}

/**
 * Per-face scale so the nine signature faces render at a similar height.
 * Mirrors PROFILE_SIG_SCALES in the recovered profile. Also the allow-list:
 * a stored font outside it falls back to the Pact's default face rather than
 * reaching a stylesheet URL.
 */
const SIGNATURE_SCALES: Readonly<Record<string, number>> = {
  'Mrs Saint Delafield': 1,
  Cherish: 0.85,
  'Give You Glory': 1.4,
  Hurricane: 0.95,
  'Love Light': 1,
  'Nothing You Could Do': 1.1,
  'Oooh Baby': 0.78,
  Qwigley: 1.45,
  WindSong: 1,
};

const DEFAULT_SIGNATURE_FONT = 'Mrs Saint Delafield';

/**
 * The Pact signature under the name, in the face the contributor chose. The
 * layout loads the four house families only, so the one signature face this
 * profile needs is loaded here; React hoists the stylesheet into <head>.
 */
export function Signature({ name, font }: { name: string; font: string | null }) {
  const face = font && font in SIGNATURE_SCALES ? font : DEFAULT_SIGNATURE_FONT;
  const href = `https://fonts.googleapis.com/css2?family=${face.replace(/ /g, '+')}&display=swap`;
  const style = {
    fontFamily: `"${face}", cursive`,
    '--signature-scale': String(SIGNATURE_SCALES[face] ?? 1),
  } as CSSProperties;
  return (
    <>
      <link rel="stylesheet" href={href} precedence="default" />
      <p className={styles.signature} style={style}>
        {name}
      </p>
    </>
  );
}

/** The Order in its hero layout: ornament and name, family underneath. Ink on paper, per designer D-27. */
export function OrderHero({ order }: { order: OrderDisplay }) {
  return (
    <span className={styles.orderStack}>
      <span className={styles.orderLine}>
        {order.ornament ? (
          <span className={styles.orderOrnament} aria-hidden="true">
            {order.ornament}
          </span>
        ) : null}
        <span className={styles.orderName}>{order.label}</span>
      </span>
      {order.family ? (
        <span className={`${styles.orderFamily} ${order.ornament ? styles.orderFamilyIndented : ''}`}>
          {order.family}
        </span>
      ) : null}
    </span>
  );
}

/** The non-author fallback in the same slot: "Contributor", "Member". */
export function MemberHero() {
  return (
    <span className={styles.orderStack}>
      <span className={styles.orderName}>{S.contributor}</span>
      <span className={styles.orderFamily}>{S.member}</span>
    </span>
  );
}

/** One book on the shelf: its cover when there is one, a coloured spine otherwise. */
function Spine({ book }: { book: Influence }) {
  if (book.coverUrl) {
    return (
      <div className={`${styles.spine} ${styles.spineCover}`} title={book.title}>
        {/* eslint-disable-next-line @next/next/no-img-element -- covers are uploaded to the live Ghost site; see Avatar */}
        <img src={book.coverUrl} alt={book.title} loading="lazy" />
      </div>
    );
  }
  const color = hashedColor(book.title);
  return (
    <div
      className={styles.spine}
      style={{ background: `linear-gradient(180deg, ${color}, color-mix(in srgb, ${color} 87%, transparent))` }}
      title={book.title}
    >
      <span className={styles.spineTitle}>{book.title}</span>
    </div>
  );
}

export function Shelf({ books }: { books: readonly Influence[] }) {
  return (
    <>
      <div className={styles.shelf}>
        {books.map((b, i) => (
          <Spine key={`${b.title}-${i}`} book={b} />
        ))}
      </div>
      <ul className={styles.bookList}>
        {books.map((b, i) => (
          <li key={`${b.title}-${i}`} className={styles.book}>
            <span className={styles.bookDot} style={{ background: hashedColor(b.title) }} aria-hidden="true" />
            <div>
              <p className={styles.bookTitle}>
                {b.title}
                {b.author ? <span className={styles.bookAuthor}>{S.influences.byAuthor(b.author)}</span> : null}
              </p>
              {b.note ? <p className={styles.bookNote}>{b.note}</p> : null}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Field Notes: a photo with its caption, or a coloured tile when a row has only a caption. */
export function FieldNotes({ notes }: { notes: readonly FieldNote[] }) {
  return (
    <div className={styles.notes}>
      {notes.map((n, i) => {
        const fallback = hashedColor(n.caption ?? String(i));
        return (
          <div
            key={`${n.url ?? n.caption ?? ''}-${i}`}
            className={styles.note}
            style={
              n.url ? undefined : { background: `radial-gradient(circle at 30% 40%, ${fallback}, var(--bg-dark))` }
            }
          >
            {n.url ? (
              // eslint-disable-next-line @next/next/no-img-element -- see Avatar
              <img src={n.url} alt={n.caption ?? ''} loading="lazy" />
            ) : null}
            {n.caption ? <p className={styles.noteCaption}>{n.caption}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

/** The owner's dashed prompt box, or the visitor's quiet line. */
export function EmptyState({ own, ownLines, visitor }: { own: boolean; ownLines: readonly string[]; visitor: string }) {
  if (own) {
    return (
      <div className={styles.promptBox}>
        <p>
          {ownLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < ownLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </div>
    );
  }
  return <p className={styles.quiet}>{visitor}</p>;
}
