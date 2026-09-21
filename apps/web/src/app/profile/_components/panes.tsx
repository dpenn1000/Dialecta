/**
 * The four tab panes, server-rendered and passed into ProfileTabs as props.
 * Ported from the tab content in dialecta-profile.jsx.
 *
 * What changed from the recovered panes, each for a reason the data forces:
 *   - The stat tiles read Comments, Graduations, Articles, Readers. The
 *     recovered "Forum density" needs each comment's tier, which lives in
 *     classifications and is closed to the public key; its "Comments" read a
 *     field the merge never set, so it always showed 0.
 *   - The "Classified Comments" placeholder is now the contributor's recent
 *     published comments, without tiers, for the same reason.
 *   - The Articles pane drops "Discussion Quality Generated" and read counts:
 *     nothing records either. The recovered pane rendered a hardcoded mock
 *     list for every author.
 *   - No section edit buttons: the editors they opened are not ported.
 */
import Link from 'next/link';
import { topicLabel } from '@/lib/topics';
import { strings } from '@/strings';
import type { Connections } from '../_lib/data';
import type { ArticleRow, CommentRow, ProfileRow } from '../_lib/rows';
import { shortDate } from '../_lib/view';
import { EmptyState, FieldNotes, Shelf, TierBadge } from './bits';
import styles from './profile.module.css';

const S = strings.profile;

export function EngagementPane({
  commentCount,
  graduations,
  articleCount,
  connections,
  comments,
}: {
  commentCount: number | null;
  graduations: number | null;
  articleCount: number;
  connections: Connections | null;
  comments: readonly CommentRow[];
}) {
  const stats: Array<{ label: string; value: number | null }> = [
    { label: S.stats.comments, value: commentCount },
    { label: S.stats.graduations, value: graduations },
    { label: S.stats.articles, value: articleCount },
    { label: S.stats.readers, value: connections?.readers ?? null },
  ];
  const tiers = connections
    ? [
        { ...S.connections.readers, count: connections.readers },
        { ...S.connections.sources, count: connections.sources },
        { ...S.connections.correspondents, count: connections.correspondents },
        { ...S.connections.sparring, count: connections.sparringPartners },
      ]
    : [];

  return (
    <div>
      <div className={styles.stats}>
        {stats
          .filter((s): s is { label: string; value: number } => s.value !== null)
          .map((s) => (
            <div key={s.label} className={`${styles.brassCard} ${styles.stat}`}>
              <p className={styles.statLabel}>{s.label}</p>
              <p className={styles.statValue}>{s.value.toLocaleString('en-US')}</p>
            </div>
          ))}
      </div>

      {connections ? (
        <section className={`${styles.brassCard} ${styles.panel}`} aria-labelledby="profile-connections">
          <h2 id="profile-connections" className={styles.eyebrow}>
            {S.connections.heading}
          </h2>
          <div className={styles.connections}>
            {tiers.map((c) => (
              <div key={c.label} className={styles.connection}>
                <div className={styles.connectionTop}>
                  <span className={styles.connectionCount}>{c.count}</span>
                  <span className={styles.connectionLabel}>{c.label}</span>
                </div>
                <p className={styles.connectionDesc}>{c.desc}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Hidden when the member key could not be resolved: an empty list would
          then claim "no comments" about comments nobody could read. */}
      {commentCount === null ? null : (
        <section
          className={`${styles.brassCard} ${styles.panel} ${comments.length === 0 ? styles.centered : ''}`}
          aria-labelledby="profile-comments"
        >
          <h2 id="profile-comments" className={styles.eyebrow}>
            {S.comments.heading}
          </h2>
          {comments.length === 0 ? (
            <p className={styles.quiet}>{S.comments.empty}</p>
          ) : (
            <ul className={styles.commentList}>
              {comments.map((c) => (
                <li key={c.id} className={styles.commentItem}>
                  <p className={styles.commentOn}>
                    {c.articleSlug ? (
                      <Link href={`/articles/${c.articleSlug}`}>{S.comments.on(c.articleTitle ?? c.articleSlug)}</Link>
                    ) : c.articleTitle ? (
                      S.comments.on(c.articleTitle)
                    ) : null}
                    {c.publishedAt ? <span> · {shortDate(c.publishedAt)}</span> : null}
                  </p>
                  <p className={styles.commentBody}>{c.body}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export function AboutPane({ profile, isOwn }: { profile: ProfileRow; isOwn: boolean }) {
  const A = S.about;
  return (
    <section className={`${styles.brassCard} ${styles.about}`} aria-labelledby="profile-about">
      <h2 id="profile-about" className={styles.sectionHeading}>
        {A.heading}
      </h2>
      <p className={`${styles.aboutBio} ${profile.bio ? '' : styles.aboutBioEmpty}`}>
        {profile.bio ?? (isOwn ? A.noBioOwn : A.noBio)}
      </p>

      {profile.wrestlingWith || isOwn ? (
        <div className={styles.aboutBlock}>
          <h3 className={styles.eyebrow} style={{ marginBottom: 8 }}>
            {A.wrestlingHeading}
          </h3>
          {profile.wrestlingWith ? (
            <p className={styles.wrestling}>{profile.wrestlingWith}</p>
          ) : (
            <p className={styles.quiet}>{A.wrestlingPrompt}</p>
          )}
        </div>
      ) : null}

      {profile.mindChanges.length > 0 || isOwn ? (
        <div className={styles.aboutBlock}>
          <h3 className={styles.eyebrow}>{A.mindHeading}</h3>
          {profile.mindChanges.length > 0 ? (
            <div className={styles.mindList}>
              {profile.mindChanges.map((m, i) => (
                <div key={i} className={styles.mind}>
                  <div className={styles.mindRow}>
                    <span className={styles.mindKey}>{A.from}</span>
                    <span style={{ fontStyle: 'italic' }}>{m.from}</span>
                  </div>
                  <div className={styles.mindRow}>
                    <span className={`${styles.mindKey} ${styles.mindKeyTo}`}>{A.to}</span>
                    <span style={{ fontWeight: 500 }}>{m.to}</span>
                  </div>
                  {m.why ? <p className={styles.mindWhy}>{m.why}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.quiet}>{A.mindPrompt}</p>
          )}
        </div>
      ) : null}

      <hr className={styles.rule} />

      <h3 className={styles.eyebrow}>{A.tiersHeading}</h3>
      <div className={styles.tierList}>
        {A.tiers.map((t) => (
          <div key={t.label}>
            <p className={styles.tierName}>{t.label}</p>
            <p className={styles.tierDesc}>{t.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function InfluencesPane({ profile, isOwn }: { profile: ProfileRow; isOwn: boolean }) {
  const I = S.influences;
  const F = S.fieldNotes;
  return (
    <div>
      <section className={`${styles.paperCard} ${styles.shelfCard}`} aria-labelledby="profile-influences">
        <div className={styles.shelfHead}>
          <p className={styles.eyebrow} style={{ marginBottom: 6 }}>
            {I.eyebrow}
          </p>
          <h2 id="profile-influences" className={styles.sectionHeading}>
            {I.heading}
          </h2>
        </div>
        {profile.influences.length > 0 ? (
          <Shelf books={profile.influences} />
        ) : (
          <EmptyState own={isOwn} ownLines={I.emptyOwn} visitor={I.empty} />
        )}
      </section>

      <section className={`${styles.paperCard} ${styles.shelfCard}`} aria-labelledby="profile-field-notes">
        <p className={styles.eyebrow} style={{ marginBottom: 6 }}>
          {F.eyebrow}
        </p>
        <h2 id="profile-field-notes" className={styles.sectionHeading}>
          {F.heading}
        </h2>
        <p className={styles.notesSub}>{F.sub}</p>
        {profile.fieldNotes.length > 0 ? (
          <FieldNotes notes={profile.fieldNotes} />
        ) : (
          <EmptyState own={isOwn} ownLines={F.emptyOwn} visitor={F.empty} />
        )}
      </section>
    </div>
  );
}

export function ArticlesPane({ articles }: { articles: readonly ArticleRow[] }) {
  return (
    <ul className={styles.articleList} aria-label={S.articles.heading}>
      {articles.map((a) => {
        const topic = topicLabel(a.topic);
        const date = shortDate(a.publishedAt);
        return (
          <li key={a.id} className={`${styles.paperCard} ${styles.articleCard}`}>
            <h3 className={styles.articleTitle}>
              <Link href={`/articles/${a.slug}`}>{a.title ?? S.articles.untitled}</Link>
            </h3>
            <div className={styles.articleMeta}>
              {date ? <span>{date}</span> : null}
              {topic ? <span className={styles.topicChip}>{topic}</span> : null}
              {a.finalTier ? <TierBadge tier={a.finalTier} /> : null}
            </div>
            {a.excerpt ? <p className={styles.articleExcerpt}>{a.excerpt}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
