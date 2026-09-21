/**
 * The analytics page's building blocks. Server components only: nothing here
 * needs state or the browser, so the page ships no JavaScript of its own.
 * Charts are inline SVG so bar sizes live in attributes rather than inline
 * styles, and every colour is a token from styles/tokens.css.
 */
import type { ReactNode } from 'react';
import { TIER_IDS, tierName, type Tier } from '@dialecta/core';
import { strings } from '@/strings';
import { SHARE_FLOOR, WEEKS, type Panel, type Quality, type Week } from '../_lib/derive';
import type { Failure } from '../_lib/measure';
import { cx, formatCount, formatShare, formatShortDate } from '../_lib/format';
import styles from '../analytics.module.css';

const copy = strings.analytics;

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-labelledby={id}>
      <h2 id={id} className={styles.sectionTitle}>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Decision({ decision, method }: { decision: string; method: string }) {
  return (
    <>
      <p className={styles.decision}>
        <span className={styles.decisionLabel}>{copy.decides}</span> {decision}
      </p>
      <details className={styles.method}>
        <summary>{copy.method}</summary>
        <p>{method}</p>
      </details>
    </>
  );
}

interface MetricProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode | undefined;
  decision: string;
  method: string;
  wide?: boolean | undefined;
  children?: ReactNode | undefined;
}

export function Metric({ label, value, sub, decision, method, wide, children }: MetricProps) {
  return (
    <article className={cx(styles.card, wide && styles.wide)}>
      <h3 className={styles.label}>{label}</h3>
      <p className={styles.value}>{value}</p>
      {sub ? <p className={styles.sub}>{sub}</p> : null}
      {children}
      <Decision decision={decision} method={method} />
    </article>
  );
}

/** A card whose inputs could not be read. Says which, and what the database said. */
export function Unreadable({ label, failure }: { label: string; failure: Failure }) {
  return (
    <article className={cx(styles.card, styles.wide)}>
      <h3 className={styles.label}>{label}</h3>
      <p className={styles.alarm}>{copy.failed(label, failure.code ? `${failure.code}, ${failure.message}` : failure.message)}</p>
    </article>
  );
}

/** Rows that failed their shape check, and reads that hit the row ceiling. Renders nothing when both are clean. */
export function QualityNotes({ quality }: { quality: Quality }) {
  if (quality.rejected === 0 && quality.truncated === null) return null;
  return (
    <div className={styles.qualityNotes}>
      {quality.rejected > 0 ? <p className={styles.alarm}>{copy.rejected(quality.rejected)}</p> : null}
      {quality.truncated ? (
        <p className={styles.alarm}>{copy.truncated(quality.truncated.read, quality.truncated.total)}</p>
      ) : null}
    </div>
  );
}

export function PanelNotes<T>({ panel }: { panel: Panel<T> }) {
  return panel.ok ? <QualityNotes quality={panel.quality} /> : null;
}

export function TierChip({ tier, children }: { tier: Tier; children?: ReactNode | undefined }) {
  return (
    <span className={cx(styles.chip, styles[`chip_${tier}`])}>
      {tierName(tier)}
      {children}
    </span>
  );
}

/**
 * A 100% stacked bar of tier counts, in canonical tier order. Shares are
 * shown only at SHARE_FLOOR units or more; below that the legend carries
 * counts alone, because one item moves a share of a small total too far.
 */
export function TierBar({
  mix,
  units,
  muted,
  label,
}: {
  mix: Record<Tier, number>;
  units: number;
  muted?: boolean | undefined;
  label: string;
}) {
  if (units === 0) return <p className={styles.sub}>{copy.discourse.empty}</p>;
  const present = TIER_IDS.filter((t) => mix[t] > 0);
  const showShares = units >= SHARE_FLOOR;
  const summary = present.map((t) => `${tierName(t)} ${mix[t]}`).join(', ');
  let offset = 0;
  return (
    <div className={cx(styles.tierWrap, muted && styles.muted)}>
      <svg
        className={styles.tierBar}
        viewBox={`0 0 ${units} 1`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: ${summary}`}
      >
        {present.map((t) => {
          const x = offset;
          offset += mix[t];
          return <rect key={t} x={x} y={0} width={mix[t]} height={1} className={styles[`seg_${t}`]} />;
        })}
      </svg>
      <ul className={styles.legend}>
        {present.map((t) => (
          <li key={t}>
            <TierChip tier={t} />
            <span className={styles.legendCount}>
              {formatCount(mix[t])}
              {showShares ? <span className={styles.legendShare}> {formatShare(mix[t] / units)}</span> : null}
            </span>
          </li>
        ))}
      </ul>
      {showShares ? null : <p className={styles.note}>{copy.discourse.counts(SHARE_FLOOR)}</p>}
    </div>
  );
}

/** Weekly counts as bars on a fixed 26-week axis. Empty weeks draw a baseline, so a stop reads as a stop. */
export function WeekStrip({ weeks, max, label }: { weeks: readonly Week[]; max: number; label: string }) {
  const first = weeks[0];
  const last = weeks[weeks.length - 1];
  if (!first || !last) return null;
  const nonEmpty = weeks.filter((w) => w.count > 0);
  const summary =
    nonEmpty.length === 0
      ? copy.contribution.arrivals.empty(WEEKS)
      : nonEmpty.map((w) => `${formatShortDate(w.start)}: ${w.count}`).join(', ');
  const H = 40;
  return (
    <div className={styles.weeksWrap}>
      <svg
        className={styles.weeks}
        viewBox={`0 0 ${weeks.length * 10} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label}: ${summary}`}
      >
        {weeks.map((w, i) => {
          const h = max > 0 ? Math.max(2, (w.count / max) * (H - 2)) : 0;
          return (
            <g key={w.start}>
              <rect x={i * 10 + 1} y={H - 1} width={8} height={1} className={styles.weekBase} />
              {w.count > 0 ? (
                <rect x={i * 10 + 1} y={H - h} width={8} height={h} className={styles.weekBar}>
                  <title>{`${formatShortDate(w.start)}: ${w.count}`}</title>
                </rect>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className={styles.weeksAxis}>
        <span>{copy.contribution.arrivals.range(formatShortDate(first.start), formatShortDate(last.start))}</span>
        <span>{max > 0 ? copy.contribution.arrivals.scale(max) : copy.contribution.arrivals.empty(WEEKS)}</span>
      </div>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: 'live' | 'stopped' | 'quiet' | 'alarm'; children: ReactNode }) {
  return <span className={cx(styles.pill, styles[`pill_${tone}`])}>{children}</span>;
}
