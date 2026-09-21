'use client';

/**
 * The tab bar and whichever pane is chosen. The panes are rendered on the
 * server and arrive here as props, so they never join the client bundle;
 * this island holds one piece of state, the active key.
 *
 * Ported from the tab bar in dialecta-profile.jsx. The recovered default was
 * Engagement, "because the profile is meant to feel alive on first read", and
 * it still is. The initial tab can also come from ?tab=, which is how
 * "See their writing" lands on Articles.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './profile.module.css';

export interface TabSpec {
  key: string;
  label: string;
  content: ReactNode;
}

export function ProfileTabs({ tabs, initial, label }: { tabs: TabSpec[]; initial: string; label: string }) {
  const first = tabs[0]?.key ?? '';
  const [active, setActive] = useState(tabs.some((t) => t.key === initial) ? initial : first);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];
  const bar = useRef<HTMLDivElement | null>(null);

  // On a narrow screen the bar scrolls sideways. Keep the chosen tab in view,
  // which matters when ?tab=articles opens on the last one.
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!bar.current || !el) return;
    const left = el.offsetLeft - (bar.current.clientWidth - el.offsetWidth) / 2;
    bar.current.scrollLeft = Math.max(0, left);
  }, [active]);

  return (
    <div id="profile-tabs">
      <div ref={bar} className={styles.tabBar} role="tablist" aria-label={label}>
        {tabs.map((tab) => {
          const selected = tab.key === current?.key;
          return (
            <button
              key={tab.key}
              id={`profile-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`profile-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ''}`}
              onClick={() => setActive(tab.key)}
              onKeyDown={(e) => {
                if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
                const i = tabs.findIndex((t) => t.key === tab.key);
                const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
                if (!next) return;
                setActive(next.key);
                document.getElementById(`profile-tab-${next.key}`)?.focus();
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {current ? (
        <div id={`profile-panel-${current.key}`} role="tabpanel" aria-labelledby={`profile-tab-${current.key}`}>
          {current.content}
        </div>
      ) : null}
    </div>
  );
}
