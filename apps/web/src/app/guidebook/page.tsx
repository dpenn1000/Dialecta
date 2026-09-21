import type { Metadata } from 'next';
import { Rich } from '@/components/content/rich';
import { TierCoin } from '@/components/content/guidebook/tier-coins';
import leaf from '@/components/content/leaf.module.css';
import g from '@/components/content/guidebook/guidebook.module.css';
import { strings } from '@/strings';

export const metadata: Metadata = {
  title: strings.content.guidebook.title,
  description: strings.content.guidebook.description,
};

/**
 * The Living Guidebook: _theme/page-guidebook.hbs, six numbered leaves under
 * the Reference hero. Static, so it renders at build time.
 *
 * The proposal form in § 06 had no handler live (the template carries no
 * script and no action) and no table exists to hold a proposal, so it renders
 * disabled with one line saying nothing is sent. That line is new copy.
 */
export default function GuidebookPage() {
  const t = strings.content.guidebook;

  return (
    <main className={leaf.main}>
      <div className={leaf.column}>
        <header className={leaf.hero}>
          <div className={leaf.heroEyebrow}>{t.eyebrow}</div>
          <h1 className={leaf.heroTitle}>
            <Rich text={t.heading} />
          </h1>
          <p className={leaf.heroLede}>{t.lede}</p>
          <span className={leaf.asterism} aria-hidden="true">
            ✦ ✦ ✦
          </span>
        </header>

        {/* 01 Philosophy */}
        <section className={leaf.leaf} id="philosophy" aria-labelledby="gb-philosophy">
          <div className={leaf.leafLabel}>{t.philosophy.label}</div>
          <h2 id="gb-philosophy" className={leaf.leafTitle}>
            {t.philosophy.title}
          </h2>
          <p className={leaf.leafDesc}>{t.philosophy.desc}</p>
          {t.philosophy.prose.map((para, i) => (
            <p key={para.slice(0, 32)} className={i === 0 ? g.prose : `${g.prose} ${g.proseGap}`}>
              <Rich text={para} />
            </p>
          ))}
          <ul className={g.rulesList}>
            {t.philosophy.rules.map((rule) => (
              <li key={rule}>
                <span className={g.ruleBullet} aria-hidden="true" />
                {rule}
              </li>
            ))}
          </ul>
        </section>

        {/* 02 Tiers */}
        <section className={leaf.leaf} id="tiers" aria-labelledby="gb-tiers">
          <div className={leaf.leafLabel}>{t.tiers.label}</div>
          <h2 id="gb-tiers" className={leaf.leafTitle}>
            {t.tiers.title}
          </h2>
          <p className={leaf.leafDesc}>{t.tiers.desc}</p>
          <div className={g.tierGrid}>
            {t.tiers.cards.map((card) => (
              <article key={card.key} className={`${g.tierCard} ${g[card.key] ?? ''}`}>
                <div className={g.tierCardHeader}>
                  <div className={g.tierIconWrap}>
                    <TierCoin tier={card.key} />
                  </div>
                  <div>
                    <h3 className={g.tierName}>{card.name}</h3>
                    <div className={g.tierZone}>{card.zone}</div>
                  </div>
                </div>
                <div className={g.tierCardBody}>
                  <p className={g.tierDesc}>{card.desc}</p>
                  <div className={g.tierExampleLabel}>{card.exampleLabel}</div>
                  <div className={g.tierExample}>{card.example}</div>
                </div>
              </article>
            ))}
          </div>
          <div className={g.callout} style={{ marginTop: 28 }}>
            <p className={g.prose}>
              <Rich text={t.tiers.ladder} />
            </p>
          </div>
        </section>

        {/* 03 Engine */}
        <section className={leaf.leaf} id="engine" aria-labelledby="gb-engine">
          <div className={leaf.leafLabel}>{t.engine.label}</div>
          <h2 id="gb-engine" className={leaf.leafTitle}>
            {t.engine.title}
          </h2>
          <p className={leaf.leafDesc}>{t.engine.desc}</p>
          <ol className={g.stageList}>
            {t.engine.stages.map((stage) => (
              <li key={stage.num} className={g.stage}>
                <div className={g.stageHeader}>
                  <div className={g.stageNumber} aria-hidden="true">
                    {stage.num}
                  </div>
                  <h3 className={g.stageName}>{stage.name}</h3>
                </div>
                <p className={g.stageDesc}>{stage.desc}</p>
                {stage.note ? <p className={g.stageNote}>{stage.note}</p> : null}
              </li>
            ))}
          </ol>

          <h3 className={g.readsHeading}>{t.engine.readsHeading}</h3>
          <div className={g.promptBox}>
            <div className={g.promptLabel}>{t.engine.promptLabel}</div>
            <pre>{t.engine.prompt}</pre>
          </div>

          <div className={g.callout}>
            <p className={g.prose}>
              <Rich text={t.engine.tone} />
            </p>
          </div>
        </section>

        {/* 04 Claim threshold */}
        <section className={leaf.leaf} id="claim" aria-labelledby="gb-claim">
          <div className={leaf.leafLabel}>{t.claim.label}</div>
          <h2 id="gb-claim" className={leaf.leafTitle}>
            {t.claim.title}
          </h2>
          <p className={leaf.leafDesc}>{t.claim.desc}</p>
          <div className={g.claimGrid}>
            {t.claim.levels.map((level) => (
              <div key={level.level} className={g.claimCard}>
                <div className={g.claimLevel}>{level.level}</div>
                <h3 className={g.claimName}>{level.name}</h3>
                <p className={g.claimDesc}>{level.desc}</p>
                <div className={g.claimEg}>{level.example}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 05 Opinion maps */}
        <section className={leaf.leaf} id="mapping" aria-labelledby="gb-mapping">
          <div className={leaf.leafLabel}>{t.mapping.label}</div>
          <h2 id="gb-mapping" className={leaf.leafTitle}>
            {t.mapping.title}
          </h2>
          <p className={leaf.leafDesc}>{t.mapping.desc}</p>
          <div className={g.mapGrid}>
            {t.mapping.maps.map((map) => (
              <div key={map.title} className={g.mapCard}>
                <div className={g.mapBadge}>{map.badge}</div>
                <h3 className={g.mapTitle}>{map.title}</h3>
                <p className={g.mapDesc}>{map.desc}</p>
                <div className={g.mapExample}>
                  <Rich text={map.example} />
                </div>
              </div>
            ))}
          </div>
          <div className={g.callout}>
            <p className={g.prose}>
              <Rich text={t.mapping.delta} />
            </p>
          </div>
        </section>

        {/* 06 Governance */}
        <section className={leaf.leaf} id="governance" aria-labelledby="gb-governance">
          <div className={leaf.leafLabel}>{t.governance.label}</div>
          <h2 id="gb-governance" className={leaf.leafTitle}>
            {t.governance.title}
          </h2>
          <p className={leaf.leafDesc}>{t.governance.desc}</p>
          <p className={g.prose}>{t.governance.prose}</p>

          <div className={g.submitBox} style={{ marginTop: 20 }}>
            <h3 className={g.submitTitle}>{t.governance.formTitle}</h3>
            <p className={g.submitDesc}>{t.governance.formDesc}</p>
            {t.governance.fields.map((field) => (
              <div key={field.id} className={g.submitField}>
                <label htmlFor={`gb-${field.id}`}>{field.label}</label>
                {field.multiline ? (
                  <textarea id={`gb-${field.id}`} placeholder={field.placeholder} disabled />
                ) : (
                  <input id={`gb-${field.id}`} type="text" placeholder={field.placeholder} disabled />
                )}
              </div>
            ))}
            <button type="button" className={g.submitBtn} disabled aria-describedby="gb-seam">
              {t.governance.submit}
            </button>
            <p id="gb-seam" className={g.seam}>
              {t.governance.seam}
            </p>
          </div>

          <p className={`${g.prose} ${g.afterForm}`}>{t.governance.stewards}</p>
        </section>
      </div>
    </main>
  );
}
