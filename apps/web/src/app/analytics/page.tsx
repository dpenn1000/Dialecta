/**
 * Platform analytics: what is happening inside Dialecta, for Dan.
 * Web traffic is Plausible's (lib/analytics.ts) and is not repeated here.
 *
 * Layers: _lib/gate.ts decides who may see it, _lib/load.ts runs every query
 * through the anon client, _lib/derive.ts turns rows into figures with no I/O,
 * and this file only lays them out. Spec: team/builder/2026-09-20-analytics-spec.md.
 */
import type { Metadata } from 'next';
import { pillarName, tierName } from '@dialecta/core';
import { strings } from '@/strings';
import { Decision, Metric, PanelNotes, Section, StatusPill, TierBar, Unreadable, WeekStrip } from './_components/parts';
import { MEASURED_AT, type Verdict } from './_lib/access-map';
import { ARRIVALS_SHOWN, LIVE_WINDOW_DAYS, WEEKS, buildView, type Freshness, type View } from './_lib/derive';
import { cx, formatCount, formatDate, formatList, formatRatio, formatShare, formatStamp } from './_lib/format';
import { requireAnalyticsAccess, type Access } from './_lib/gate';
import { isSupabaseConfigured, loadAnalytics } from './_lib/load';
import styles from './analytics.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: strings.analytics.title,
  robots: { index: false, follow: false },
};

const copy = strings.analytics;

export default async function AnalyticsPage() {
  const access = await requireAnalyticsAccess();

  if (!isSupabaseConfigured()) {
    return (
      <main className={styles.root}>
        <Header access={access} readAt={null} />
        <p className="notice">{copy.notConfigured}</p>
      </main>
    );
  }

  const raw = await loadAnalytics();
  const view = buildView(raw, Date.now());

  return (
    <main className={styles.root}>
      <Header access={access} readAt={view.now} />
      <Activity view={view} />
      <Contribution view={view} />
      <Membership view={view} />
      <Discourse view={view} />
      <Engine view={view} />
      <Closed view={view} />
      <Faults view={view} />
    </main>
  );
}

function Header({ access, readAt }: { access: Access; readAt: number | null }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{copy.title}</h1>
      {readAt !== null ? <p className={styles.provenance}>{copy.readAt(formatStamp(readAt))}</p> : null}
      {access.mode === 'development' ? (
        <p className={styles.gateOpen} role="note">
          {copy.gate.development}
        </p>
      ) : (
        <p className={styles.provenance}>{copy.gate.admin(access.uid)}</p>
      )}
    </header>
  );
}

function freshLine(f: Freshness): { date: string; ago: string; tone: 'live' | 'stopped' | 'quiet' | 'alarm'; status: string } {
  if (f.kind === 'failed') return { date: '', ago: f.failure.message, tone: 'alarm', status: f.failure.code ?? '' };
  if (f.kind === 'none') return { date: copy.activity.none, ago: '', tone: 'quiet', status: copy.activity.none };
  return {
    date: formatDate(f.at),
    ago: copy.activity.ago(f.days),
    tone: f.live ? 'live' : 'stopped',
    status: f.live ? copy.activity.live : copy.activity.stopped,
  };
}

function Activity({ view }: { view: View }) {
  const a = view.activity;
  const items = [
    { key: 'comment', label: copy.activity.comment, f: a.comment },
    { key: 'article', label: copy.activity.article, f: a.article },
    { key: 'follow', label: copy.activity.follow, f: a.follow },
    { key: 'engine', label: copy.activity.engine, f: a.engine },
  ] as const;
  return (
    <Section id="activity" title={copy.sections.activity}>
      {a.allStoppedSince ? (
        <p className={styles.headline}>
          {copy.activity.newest(formatDate(a.allStoppedSince.at), copy.activity.ago(a.allStoppedSince.days))}
        </p>
      ) : null}
      <ul className={styles.fresh}>
        {items.map(({ key, label, f }) => {
          const line = freshLine(f);
          return (
            <li key={key} className={styles.freshItem}>
              <span className={styles.label}>{label}</span>
              <span className={styles.freshDate}>{line.date}</span>
              <span className={styles.sub}>{line.ago}</span>
              <StatusPill tone={line.tone}>{line.status}</StatusPill>
            </li>
          );
        })}
      </ul>
      <Decision decision={copy.activity.decision} method={copy.activity.method(LIVE_WINDOW_DAYS)} />
    </Section>
  );
}

function Contribution({ view }: { view: View }) {
  const c = view.comments;
  const ar = view.articles;
  const t = copy.contribution;
  return (
    <Section id="contribution" title={copy.sections.contribution}>
      <div className={styles.grid}>
        {c.ok ? (
          <>
            <Metric label={t.comments.label} value={formatCount(c.value.total)} decision={t.comments.decision} method={t.comments.method} />
            <Metric
              label={t.commenters.label}
              value={formatCount(c.value.commenters)}
              sub={c.value.topShare !== null ? t.commenters.sub(formatShare(c.value.topShare)) : undefined}
              decision={t.commenters.decision}
              method={t.commenters.method}
            />
            <Metric label={t.replies.label} value={formatCount(c.value.replies)} decision={t.replies.decision} method={t.replies.method} />
          </>
        ) : (
          <Unreadable label={t.comments.label} failure={c.failure} />
        )}
        {ar.ok ? (
          <Metric
            label={t.articles.label}
            value={formatCount(ar.value.total)}
            sub={t.articles.sub(ar.value.authors, ar.value.fixtureArticles)}
            decision={t.articles.decision}
            method={t.articles.method}
          >
            <PanelNotes panel={ar} />
          </Metric>
        ) : (
          <Unreadable label={t.articles.label} failure={ar.failure} />
        )}
        {c.ok ? (
          <>
            <Metric
              wide
              label={t.arrivals.label}
              value={formatCount(c.value.weeks.reduce((sum, w) => sum + w.count, 0))}
              sub={t.arrivals.sub(WEEKS)}
              decision={t.arrivals.decision}
              method={t.arrivals.method(WEEKS)}
            >
              <WeekStrip weeks={c.value.weeks} max={c.value.weekMax} label={t.arrivals.label} />
            </Metric>
            <Metric
              wide
              label={t.first.label}
              value={formatCount(c.value.commenters)}
              decision={t.first.decision}
              method={t.first.method(ARRIVALS_SHOWN)}
            >
              {c.value.arrivals.length === 0 ? (
                <p className={styles.sub}>{t.first.empty}</p>
              ) : (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th scope="col">{t.first.name}</th>
                        <th scope="col">{t.first.firstComment}</th>
                        <th scope="col" className={styles.num}>
                          {t.first.count}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Index keys: Arrival carries no member id, on purpose. See derive.ts. */}
                      {c.value.arrivals.map((r, i) => (
                        <tr key={i}>
                          <td>{r.name || <span className={styles.muted}>{t.first.unnamed}</span>}</td>
                          <td>{formatDate(r.first)}</td>
                          <td className={styles.num}>{formatCount(r.count)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {c.value.arrivalsMore > 0 ? <p className={styles.sub}>{t.first.more(c.value.arrivalsMore)}</p> : null}
                </div>
              )}
              <PanelNotes panel={c} />
            </Metric>
          </>
        ) : null}
      </div>
    </Section>
  );
}

function Membership({ view }: { view: View }) {
  const m = view.membership;
  const t = copy.membership;
  if (!m.ok) {
    return (
      <Section id="membership" title={copy.sections.membership}>
        <Unreadable label={t.underwriters.label} failure={m.failure} />
      </Section>
    );
  }
  const v = m.value;
  return (
    <Section id="membership" title={copy.sections.membership}>
      <p className={styles.lede}>{t.base(v.profiles, v.fixtureProfiles)}</p>
      <div className={styles.grid}>
        <Metric
          label={t.underwriters.label}
          value={formatCount(v.underwriters)}
          sub={t.underwriters.sub(v.profiles)}
          decision={t.underwriters.decision}
          method={t.underwriters.method}
        >
          <p className={styles.note}>
            {t.underwriters.setBy(v.underwritersBy.system, v.underwritersBy.member, v.underwritersBy.unset)}
          </p>
        </Metric>
        <Metric
          label={t.cohorts.label}
          value={formatCount(v.charterWriters + v.charterUnderwriters + v.giftedWithExpiry)}
          decision={t.cohorts.decision}
          method={t.cohorts.method}
        >
          <dl className={styles.split}>
            <dt>{t.cohorts.charterWriters}</dt>
            <dd>{formatCount(v.charterWriters)}</dd>
            <dt>{t.cohorts.charterUnderwriters}</dt>
            <dd>{formatCount(v.charterUnderwriters)}</dd>
            <dt>{t.cohorts.foundingVoices}</dt>
            <dd>{formatCount(v.giftedWithExpiry)}</dd>
          </dl>
          {v.undocumentedGifts > 0 ? <p className={styles.alarm}>{t.cohorts.undocumented(v.undocumentedGifts)}</p> : null}
        </Metric>
        <Metric
          label={t.pact.label}
          value={copy.ofTotal(formatCount(v.signedPact), formatCount(v.profiles))}
          sub={v.signedPact > 0 ? t.pact.sub(v.signedAuthors) : undefined}
          decision={t.pact.decision}
          method={t.pact.method}
        />
      </div>
      <PanelNotes panel={m} />
    </Section>
  );
}

function Discourse({ view }: { view: View }) {
  const e = view.engine;
  const ar = view.articles;
  const d = copy.discourse;
  return (
    <Section id="discourse" title={copy.sections.discourse}>
      <div className={styles.grid}>
        {e.ok ? (
          <>
            <Metric wide label={d.live.label} value={formatCount(e.value.liveUnits)} decision={d.live.decision} method={d.live.method}>
              <TierBar mix={e.value.liveMix} units={e.value.liveUnits} label={d.live.label} />
              {e.value.absentLive.length > 0 && e.value.liveUnits > 0 ? (
                <p className={styles.note}>{d.absent(formatList(e.value.absentLive.map(tierName)))}</p>
              ) : null}
            </Metric>
            <Metric
              wide
              label={d.fixture.label}
              value={formatCount(e.value.fixtureUnits)}
              decision={d.fixture.decision}
              method={d.fixture.method}
            >
              <TierBar mix={e.value.fixtureMix} units={e.value.fixtureUnits} label={d.fixture.label} muted />
            </Metric>
            <Metric
              label={d.texture.label}
              value={
                e.value.texture ? (
                  <span className={styles.pair}>
                    <span>
                      <span className={styles.pairLabel}>{d.texture.turbulence}</span> {formatRatio(e.value.texture.turbulence)}
                    </span>
                    <span>
                      <span className={styles.pairLabel}>{d.texture.clarity}</span> {formatRatio(e.value.texture.clarity)}
                    </span>
                  </span>
                ) : (
                  d.texture.none
                )
              }
              decision={d.texture.decision}
              method={d.texture.method}
            />
          </>
        ) : (
          <Unreadable label={d.live.label} failure={e.failure} />
        )}
        {ar.ok ? (
          <Metric label={d.articles.label} value={formatCount(ar.value.total)} decision={d.articles.decision} method={d.articles.method}>
            {ar.value.total === 0 ? (
              <p className={styles.sub}>{d.articles.empty}</p>
            ) : (
              <TierBar mix={ar.value.tiers} units={ar.value.total - ar.value.unresolved} label={d.articles.label} />
            )}
            {ar.value.unresolved > 0 ? <p className={styles.note}>{d.articles.unresolved(ar.value.unresolved)}</p> : null}
          </Metric>
        ) : null}
      </div>
    </Section>
  );
}

function Engine({ view }: { view: View }) {
  const e = view.engine;
  const g = copy.engine;
  const comments = view.comments.ok ? view.comments.value.total : null;
  if (!e.ok) {
    return (
      <Section id="engine" title={copy.sections.engine}>
        <Unreadable label={g.events.label} failure={e.failure} />
      </Section>
    );
  }
  const v = e.value;
  const gradTotal = v.graduationsLive + v.graduationsFixture;
  const members = view.membership.ok ? view.membership.value : null;
  return (
    <Section id="engine" title={copy.sections.engine}>
      <p className={styles.lede}>
        {g.fixtures.carry(v.liveContributors, v.fixtureContributors)}{' '}
        {v.fixtures.disagree === 0 ? g.fixtures.agree(v.fixtures.byPrefix) : g.fixtures.disagree(v.fixtures.disagree)}
        {members ? ` ${g.fixtures.profiles(members.fixtureProfiles)}` : null}
      </p>
      <details className={styles.method}>
        <summary>{copy.method}</summary>
        <p>{g.fixtures.method}</p>
      </details>
      <div className={styles.grid}>
        <Metric
          label={g.events.label}
          value={formatCount(v.events)}
          sub={comments !== null ? g.events.sub(comments) : undefined}
          decision={g.events.decision}
          method={g.events.method}
        />
        <Metric
          label={g.graduations.label}
          value={formatCount(v.graduationsLive)}
          sub={gradTotal > 0 ? g.graduations.sub(v.graduationsFixture, formatShare(v.graduationsFixture / gradTotal)) : undefined}
          decision={g.graduations.decision}
          method={g.graduations.method}
        />
        <Metric
          label={g.topics.label}
          value={copy.ofTotal(formatCount(v.topicRows), formatCount(v.liveRows))}
          sub={g.topics.sub(formatList(v.topicAxes.map(pillarName)))}
          decision={g.topics.decision}
          method={g.topics.method}
        />
        <Metric
          label={g.archetypes.label}
          value={copy.ofTotal(formatCount(v.liveWithArchetype), formatCount(v.liveContributors))}
          decision={g.archetypes.decision}
          method={g.archetypes.method}
        />
        {members ? (
          <Metric
            label={g.coverage.label}
            value={copy.ofTotal(formatCount(v.liveContributors), formatCount(members.profiles))}
            decision={g.coverage.decision}
            method={g.coverage.method}
          />
        ) : null}
      </div>
      {v.unknownTierKeys.length > 0 ? (
        <p className={styles.alarm}>{copy.unknownTierKeys(v.unknownTierKeys.join(', '))}</p>
      ) : null}
      <PanelNotes panel={e} />
    </Section>
  );
}

function verdictLine(v: Verdict): { tone: 'quiet' | 'alarm'; text: string } {
  if (v.kind === 'holds') return { tone: 'quiet', text: copy.closed.holds };
  if (v.kind === 'opened') return { tone: 'alarm', text: copy.closed.opened(v.rows) };
  return { tone: 'alarm', text: copy.closed.changed(v.detail) };
}

function Closed({ view }: { view: View }) {
  const reason = { columns: copy.closed.columns, policyFalse: copy.closed.policyFalse, serviceOnly: copy.closed.serviceOnly };
  return (
    <Section id="closed" title={copy.sections.closed}>
      <p className={styles.lede}>{copy.closed.lede}</p>
      <p className={styles.provenance}>{copy.closed.measured(MEASURED_AT)}</p>
      <ul className={styles.closedList}>
        {view.closed.map(({ entry, verdict }) => {
          const line = verdictLine(verdict);
          return (
            <li key={entry.table} className={cx(styles.closedItem, line.tone === 'alarm' && styles.closedAlarm)}>
              <div className={styles.closedHead}>
                <code className={styles.code}>{entry.table}</code>
                <StatusPill tone={line.tone}>{line.text}</StatusPill>
              </div>
              <p className={styles.closedAnswers}>{copy.closed.answers[entry.table]}</p>
              <p className={styles.sub}>{reason[entry.closure]}</p>
              <p className={styles.policy}>{entry.detail}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function Faults({ view }: { view: View }) {
  const f = copy.faults;
  const e = view.engine;
  const c = view.comments;
  const members = view.membership.ok ? view.membership.value : null;
  const classifications = view.closed.find((x) => x.entry.table === 'classifications');

  const unreadable = (what: string) => copy.notReadHere(what);
  const engineFresh = view.activity.engine;

  const faults: { key: string; title: string; cause: string; now: string; present: boolean; fix: string }[] = [
    {
      key: 'initialise',
      title: f.initialise.title,
      cause: f.initialise.cause,
      now: e.ok
        ? [
            members ? f.initialise.nowProfiles(Math.max(0, members.profiles - e.value.liveContributors), members.profiles) : null,
            f.initialise.now(e.value.liveContributors - e.value.liveWithArchetype, e.value.liveContributors),
          ]
            .filter(Boolean)
            .join(' ')
        : unreadable('axis_scores'),
      present: e.ok
        ? e.value.liveWithArchetype < e.value.liveContributors || (members !== null && members.profiles > e.value.liveContributors)
        : true,
      fix: f.initialise.fix,
    },
    {
      key: 'ledger',
      title: f.ledger.title,
      cause: f.ledger.cause,
      now:
        engineFresh.kind === 'at'
          ? f.ledger.now(copy.activity.ago(engineFresh.days))
          : engineFresh.kind === 'none'
            ? f.ledger.now(copy.activity.none)
            : unreadable('axis_scores'),
      present: !(engineFresh.kind === 'at' && engineFresh.live),
      fix: f.ledger.fix,
    },
    {
      key: 'classifications',
      title: f.classifications.title,
      cause: f.classifications.cause,
      now: f.classifications.now,
      present: classifications ? classifications.verdict.kind === 'holds' : true,
      fix: f.classifications.fix,
    },
    {
      key: 'publishedAt',
      title: f.publishedAt.title,
      cause: f.publishedAt.cause,
      now: c.ok ? f.publishedAt.now(c.value.total, c.value.distinctPublishedAt) : unreadable('comments'),
      present: c.ok ? c.value.maxSharingPublishedAt > 1 : true,
      fix: f.publishedAt.fix,
    },
    {
      key: 'commentCount',
      title: f.commentCount.title,
      cause: f.commentCount.cause,
      now: e.ok && c.ok ? f.commentCount.now(e.value.events, c.value.total) : unreadable('axis_scores'),
      present: e.ok && c.ok ? e.value.events !== c.value.total : true,
      fix: f.commentCount.fix,
    },
  ];

  return (
    <Section id="faults" title={copy.sections.faults}>
      <p className={styles.provenance}>{f.measured(MEASURED_AT)}</p>
      <ol className={styles.faultList}>
        {faults.map((x) => (
          <li key={x.key} className={cx(styles.fault, !x.present && styles.muted)}>
            <h3 className={styles.faultTitle}>{x.title}</h3>
            <dl className={styles.faultBody}>
              <dt>{f.cause}</dt>
              <dd>{x.cause}</dd>
              <dt>{f.now}</dt>
              <dd className={x.present ? styles.faultNow : undefined}>{x.present ? x.now : `${x.now} ${f.cleared}`}</dd>
              <dt>{f.fix}</dt>
              <dd>{x.fix}</dd>
            </dl>
          </li>
        ))}
      </ol>
    </Section>
  );
}
