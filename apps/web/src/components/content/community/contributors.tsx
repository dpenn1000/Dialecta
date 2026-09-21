/**
 * The Contributors directory: _recovered-next/lib/theme/
 * dialecta-community-contributors.jsx, adapted (Council verdict, "auth
 * rewritten"). Server component.
 *
 * What survives: the search, the collapsible filter rail, the archetype and
 * Order chips (each shown only when two or more options exist, as live), the
 * A to Z and archetype sorts, the count, and the card: avatar, name, author
 * mark, archetype and Order chips, bio, "View their writing".
 *
 * What changed, and why:
 *  - The filtering ran in the browser over a fetched list. It runs here, from
 *    the query string (q, archetype, order, sort), so it works without script.
 *    The search submits instead of filtering per keystroke.
 *  - The Follow button and the Following / Find new voices views are gone. Both
 *    wrote through the legacy API on a body-supplied Ghost id, the forgeable
 *    identity security ruled out, and `follows` has no write policy to rewrite
 *    them against. They come back with a session-scoped follow.
 *  - No follower count, and no archetype-sort default: philosopher's two cuts.
 *    Archetype sorting stays an option, not the default, as live.
 *  - The Order chip read "The The Essayist" live: order_label already carries
 *    "The". strings.content.community.contributors.orderChip adds it only when
 *    the label lacks it.
 *  - Names link to /profile/<profiles.id>, the profile builder's route, where
 *    they linked to /profile/?id=<Ghost member id>.
 */
import Link from 'next/link';
import { ARCHETYPES } from '@dialecta/core';
import { strings } from '@/strings';
import type { Contributor } from './data';
import { Avatar, ChipStrip, communityHref, type Chip } from './parts';
import s from './community.module.css';

export interface ContributorFilters {
  q: string;
  archetype: string | null;
  order: string | null;
  sort: 'name' | 'archetype';
}

export function Contributors({ contributors, filters }: { contributors: Contributor[]; filters: ContributorFilters }) {
  const t = strings.content.community.contributors;

  const hrefWith = (change: Partial<Record<keyof ContributorFilters, string | null>>) => {
    const next = { ...filters, ...change };
    return communityHref({
      tab: 'contributors',
      q: next.q || null,
      archetype: next.archetype,
      order: next.order,
      sort: next.sort === 'archetype' ? 'archetype' : null,
    });
  };

  // Chips come from the data, so no chip ever returns zero contributors (live).
  const orderChips: Chip[] = Array.from(
    new Map(contributors.flatMap((c) => (c.order ? [[c.order.id, t.orderChip(c.order.label)] as const] : []))),
    ([key, label]) => ({ key, label }),
  ).sort((a, b) => a.label.localeCompare(b.label));

  const present = new Set(contributors.map((c) => c.archetype?.id).filter(Boolean));
  const archetypeChips: Chip[] = ARCHETYPES.filter((a) => present.has(a.id)).map((a) => ({ key: a.id, label: a.name }));

  const q = filters.q.trim().toLowerCase();
  let list = contributors.filter((c) => {
    if (filters.archetype && c.archetype?.id !== filters.archetype) return false;
    if (filters.order && c.order?.id !== filters.order) return false;
    if (q) {
      const fields = [c.displayName, c.bio, c.location, c.archetype?.label, c.order?.label]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!fields.includes(q)) return false;
    }
    return true;
  });
  list =
    filters.sort === 'archetype'
      ? [...list].sort((a, b) => {
          const al = a.archetype?.label ?? 'zzz';
          const bl = b.archetype?.label ?? 'zzz';
          return al !== bl ? al.localeCompare(bl) : byName(a, b);
        })
      : [...list].sort(byName);

  const filterCount = (filters.archetype ? 1 : 0) + (filters.order ? 1 : 0) + (filters.sort !== 'name' ? 1 : 0);

  return (
    <div>
      <form className={s.searchRow} action="/community" method="get" role="search">
        <input type="hidden" name="tab" value="contributors" />
        {filters.archetype ? <input type="hidden" name="archetype" value={filters.archetype} /> : null}
        {filters.order ? <input type="hidden" name="order" value={filters.order} /> : null}
        {filters.sort === 'archetype' ? <input type="hidden" name="sort" value="archetype" /> : null}
        <input
          type="search"
          name="q"
          className={s.search}
          defaultValue={filters.q}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchLabel}
        />
        <button type="submit" className={s.searchBtn}>
          {t.search}
        </button>
      </form>

      <details className={s.filters} open={filterCount > 0}>
        <summary className={s.filtersToggle}>
          {t.filters}
          {filterCount > 0 ? <span className={s.filterCount}>{filterCount}</span> : null}
        </summary>
        <div className={`${s.filterRail} dialecta-paper`}>
          {archetypeChips.length > 1 ? (
            <div className={s.filterRow}>
              <span className={s.filterLabel}>{t.archetype}</span>
              <ChipStrip
                label={t.archetype}
                allLabel={t.any}
                items={archetypeChips}
                active={filters.archetype}
                hrefFor={(key) => hrefWith({ archetype: key })}
              />
            </div>
          ) : null}
          {orderChips.length > 1 ? (
            <div className={s.filterRow}>
              <span className={s.filterLabel}>{t.order}</span>
              <ChipStrip
                label={t.order}
                allLabel={t.any}
                items={orderChips}
                active={filters.order}
                hrefFor={(key) => hrefWith({ order: key })}
              />
            </div>
          ) : null}
          <div className={s.filterRow}>
            <span className={s.filterLabel}>{t.sort}</span>
            <ChipStrip
              label={t.sort}
              allLabel={t.sortName}
              items={[{ key: 'archetype', label: t.sortArchetype }]}
              active={filters.sort === 'archetype' ? 'archetype' : null}
              hrefFor={(key) => hrefWith({ sort: key === 'archetype' ? 'archetype' : 'name' })}
            />
          </div>
          {filterCount > 0 ? (
            <Link href={communityHref({ tab: 'contributors', q: filters.q || null })} className={s.clearFilters}>
              {t.clear}
            </Link>
          ) : null}
        </div>
      </details>

      {list.length === 0 ? (
        <p className={s.empty}>{q || filters.archetype || filters.order ? t.noMatch : t.none}</p>
      ) : (
        <>
          <div className={s.count}>{t.count(list.length)}</div>
          <ul className={s.list}>
            {list.map((c) => (
              <li key={c.id}>
                <ContributorCard contributor={c} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/** A to Z, with nameless profiles last, as the live SQL's `nullsFirst: false` put them. */
function byName(a: Contributor, b: Contributor): number {
  if (!a.displayName || !b.displayName) return a.displayName ? -1 : b.displayName ? 1 : 0;
  return a.displayName.localeCompare(b.displayName);
}

function ContributorCard({ contributor: c }: { contributor: Contributor }) {
  const t = strings.content.community.contributors;
  const archetype = c.archetype;
  return (
    <div className={`${s.contributor} dialecta-paper`}>
      <Avatar name={c.displayName} url={c.avatarUrl} size={48} />
      <div className={s.contributorBody}>
        <div className={s.nameRow}>
          <Link href={`/profile/${c.id}`} className={s.name}>
            {c.displayName ?? t.anonymous}
          </Link>
          {c.isAuthor ? <span className={s.authorMark}>{t.author}</span> : null}
        </div>
        {archetype || c.order ? (
          <div className={s.badges}>
            {archetype ? <span className={s.archetypeChip}>{archetype.label}</span> : null}
            {c.order ? <span className={s.orderChip}>{t.orderChip(c.order.label)}</span> : null}
          </div>
        ) : null}
        {c.bio ? <p className={s.bio}>{c.bio}</p> : null}
        <Link href={communityHref({ author: c.id })} className={s.cardLink}>
          {t.viewWriting}
        </Link>
      </div>
    </div>
  );
}
