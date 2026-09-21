import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Rich } from '@/components/content/rich';
import { first } from '@/components/content/format';
import s from '@/components/content/stewards/stewards.module.css';
import mastheadLogo from '@/components/content/stewards/stewards-masthead-logo.png';
import { strings } from '@/strings';

export const metadata: Metadata = {
  title: strings.content.stewards.title,
  description: strings.content.stewards.description,
  // Each family view is ?family=; the page is one page.
  alternates: { canonical: '/stewards' },
};

interface StewardsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * The Stewards: _theme/page-stewards.hbs. The masthead, the six cadences, the
 * ten families of Orders behind a chip picker, the note on the Satirist, the
 * doorway and the page's own closing note.
 *
 * The picker is server-rendered: ?family=<key> picks the view, and the index
 * is the default, as live. The live page kept the choice in a #hash through
 * script; a shared /stewards/#argumentative link lands on the index here.
 *
 * The masthead logo is the live page's own embedded PNG (1568x393), saved
 * beside the page byte for byte rather than redrawn.
 */
export default async function StewardsPage({ searchParams }: StewardsPageProps) {
  const params = await searchParams;
  const t = strings.content.stewards;
  const wanted = first(params.family);
  const active = t.families.find((f) => f.key === wanted) ?? null;

  return (
    <main className={s.main}>
      <div className={s.page}>
        <header className={s.masthead}>
          <div className={s.mastheadEyebrow}>{t.eyebrow}</div>
          {/* One heading, "The Stewards of Dialecta": the prefix and the logo's alt. */}
          <h1 className={s.mastheadTitle}>
            <span className={s.mastheadPrefix}>{t.prefix}</span>
            <Image
              src={mastheadLogo}
              alt={t.logoAlt}
              className={s.mastheadLogo}
              priority
              sizes="(max-width: 600px) 256px, 336px"
            />
          </h1>
          <div className={s.mastheadPair}>
            {t.pair.map((line) => (
              <div key={line} className={s.mastheadPairLine}>
                {line}
              </div>
            ))}
          </div>
          <div className={s.opening}>
            <p>
              <span className={s.lede}>{t.openingLead}</span>
              {t.openingRest}
            </p>
            <p>{t.opening}</p>
          </div>
        </header>

        <section className={s.section} id="cadence" aria-labelledby="stewards-cadence">
          <div className={s.headerCard}>
            <div className={s.sectionEyebrow}>{t.cadence.eyebrow}</div>
            <h2 id="stewards-cadence" className={s.sectionTitle}>
              {t.cadence.title}
            </h2>
            <p className={s.sectionLede}>{t.cadence.lede}</p>
          </div>
          <ul className={s.cadenceGrid}>
            {t.cadence.items.map((c) => (
              <li key={c.key} className={s.cadence}>
                <div className={s.cadenceName}>{c.name}</div>
                <div className={s.cadenceDesc}>{c.desc}</div>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.section} id="orders" aria-labelledby="stewards-orders">
          <div className={s.headerCard}>
            <div className={s.sectionEyebrow}>{t.orders.eyebrow}</div>
            <h2 id="stewards-orders" className={s.sectionTitle}>
              {t.orders.title}
            </h2>
            <p className={s.sectionLede}>{t.orders.lede}</p>
          </div>

          <div className={s.shell}>
            <nav className={s.chipsBar} aria-label={t.orders.navAria}>
              <ul className={s.chips}>
                <li>
                  <Link
                    href="/stewards"
                    scroll={false}
                    className={`${s.chip} ${s.chipIndex}`}
                    aria-current={active ? undefined : 'true'}
                  >
                    {t.orders.index}
                  </Link>
                </li>
                {t.families.map((f) => (
                  <li key={f.key} className={`${s.family} ${s[f.key] ?? ''}`}>
                    <Link
                      href={`/stewards?family=${f.key}`}
                      scroll={false}
                      className={s.chip}
                      aria-current={active?.key === f.key ? 'true' : undefined}
                    >
                      {f.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {active ? (
              <div className={`${s.family} ${s[active.key] ?? ''}`}>
                <div className={s.familySticky}>
                  <span className={s.familyLabel}>{t.orders.familyLabel}</span>
                  <h3 className={s.familyName}>{active.name}</h3>
                  <p className={s.familyDescription}>{active.description}</p>
                </div>
                <ul className={s.orderGrid}>
                  {active.orders.map((order) => (
                    <li key={order.name}>
                      <article className={order.declared ? `${s.orderCard} ${s.orderCardDeclared}` : s.orderCard}>
                        <div className={s.ornament} aria-hidden="true">
                          {order.ornament}
                        </div>
                        <h4 className={s.orderName}>{order.name}</h4>
                        <p className={s.essence}>{order.essence}</p>
                        <p className={s.definition}>
                          <Rich text={order.definition} />
                        </p>
                        <p className={s.tell}>
                          <span className={s.tellLabel}>{order.tellLabel}</span>{' '}
                          <em>
                            <Rich text={order.tell} />
                          </em>
                        </p>
                      </article>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <div className={s.indexIntro}>
                  <p>{t.orders.indexIntro}</p>
                </div>
                <ul className={s.indexList}>
                  {t.families.map((f) => (
                    <li key={f.key} className={`${s.family} ${s[f.key] ?? ''}`}>
                      <Link href={`/stewards?family=${f.key}`} scroll={false} className={s.indexItem}>
                        <span className={s.indexName}>{f.name}</span>
                        <span className={s.indexTagline}>{f.tagline}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className={s.section} id="satirist" aria-labelledby="stewards-satirist">
          <div className={s.sectionEyebrow}>{t.satirist.eyebrow}</div>
          <h2 id="stewards-satirist" className={s.sectionTitle}>
            {t.satirist.title}
          </h2>
          <p className={s.sectionLede}>{t.satirist.lede}</p>
        </section>

        <section className={s.doorway} id="doorway" aria-labelledby="stewards-doorway">
          <div className={s.doorwayEyebrow}>{t.doorway.eyebrow}</div>
          <h2 id="stewards-doorway" className={s.doorwayTitle}>
            <Rich text={t.doorway.title} />
          </h2>
          <div className={s.doorwayMotto}>{t.doorway.motto}</div>
          <div className={s.doorwayBody}>
            {t.doorway.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </section>

        <div className={s.closing}>
          <p>{t.footerNote}</p>
          <div className={s.closingMeta}>{t.footerMeta}</div>
        </div>
      </div>
    </main>
  );
}
