/**
 * fingerprint-page-mount.jsx
 *
 * Entry bundle for the Fingerprint page (page-fingerprint.hbs). Mounts:
 *
 *   - HeroCarousel        (#fp-hero-root)   — three seed contributors
 *   - Static fingerprints ([data-fp-axes])  — explainer figures
 *
 * The Fingerprint engine is heavy; restricting it to this template
 * keeps article-reader pages lean. Per project memory: never mount more
 * than two live Fingerprint components on a single page; the carousel
 * here keeps to one live instance and switches data by key.
 */

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Fingerprint } from './dialecta-fingerprint-engine.jsx';

// ── Hooks + helpers ──────────────────────────────────────────────────────

const HERO_SEED_IDS = ['seed:maya', 'seed:wen', 'seed:anselm'];

function axisScoresToFingerprintData(axisScores) {
  const sc = axisScores ?? {};
  return {
    acuity:      { graduations: sc.acuity      ?? 0, tierMix: {}, topicPhases: [] },
    calibration: { graduations: sc.calibration ?? 0, tierMix: {}, topicPhases: [] },
    magnanimity: { graduations: sc.magnanimity ?? 0, tierMix: {}, topicPhases: [] },
    discourse:   { graduations: sc.discourse   ?? 0, tierMix: {}, topicPhases: [] },
    consistency: { graduations: sc.consistency ?? 0, tierMix: {}, topicPhases: [] },
    reach:       { graduations: sc.reach       ?? 0, tierMix: {}, topicPhases: [] },
  };
}

function useIsDesktop(query = '(min-width: 1100px)') {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia(query).matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const handler = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) {
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
    mq.addListener(handler);
    return () => mq.removeListener(handler);
  }, [query]);
  return isDesktop;
}

function useHeroProfiles() {
  const [profiles, setProfiles] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const base = (typeof window !== 'undefined' && window.__DIALECTA_API_URL__)
      ? window.__DIALECTA_API_URL__.replace(/\/$/, '')
      : '';
    Promise.all(
      HERO_SEED_IDS.map(id =>
        fetch(`${base}/api/profile/${id}`).then(r => {
          if (!r.ok) throw new Error(`${id}: ${r.status}`);
          return r.json();
        })
      )
    )
      .then(rows => {
        const byId = {};
        for (const row of rows) byId[row.ghost_member_id] = row;
        setProfiles(byId);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { profiles, loading, error };
}

// ── Hero carousel ────────────────────────────────────────────────────────

function HeroCarousel() {
  const { profiles, loading, error } = useHeroProfiles();
  const [active, setActive] = useState(HERO_SEED_IDS[0]);
  const isDesktop = useIsDesktop();
  const T = {
    bgWhite:'#fffdf8', borderLight:'#e8e0d0', fontMono:"'DM Mono',monospace",
    fontDisplay:"'Cormorant Garamond',serif", fontReading:"'Source Serif 4',Georgia,serif",
    fontBody:"'DM Sans',sans-serif", amber:'#b8862e', gold:'#d4a84a',
    textPrimary:'#1c1814', textSecondary:'#5a5248', textTertiary:'#7a7068', goldPale:'#f5e8d0',
  };

  if (loading) {
    return (
      <div style={{background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:'48px 40px',textAlign:'center',fontFamily:T.fontMono,fontSize:11,letterSpacing:'0.12em',textTransform:'uppercase',color:T.textTertiary}}>
        Loading contributors…
      </div>
    );
  }

  if (error || !profiles) {
    return (
      <div style={{background:T.bgWhite,border:`1px solid ${T.borderLight}`,borderRadius:12,padding:'48px 40px',textAlign:'center',fontFamily:T.fontBody,fontSize:13,color:'#b8372e'}}>
        Could not load contributor data. Try refreshing.
      </div>
    );
  }

  const profile         = profiles[active];
  const fingerprintData = axisScoresToFingerprintData(profile.axisScores);

  return (
    <div style={{
      background: T.bgWhite,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 12,
      padding: 'clamp(28px, 4vw, 48px) clamp(20px, 4vw, 40px)',
      boxShadow: '0 4px 24px rgba(28,24,20,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(24px, 3vw, 36px)',
      alignItems: 'stretch',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      <div style={{background:`linear-gradient(135deg,${T.goldPale} 0%,${T.bgWhite} 75%)`,border:`1px solid ${T.gold}`,borderLeft:`4px solid ${T.amber}`,borderRadius:'0 10px 10px 0',padding:'24px 22px'}}>
        <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:T.amber,marginBottom:10}}>Three Contributors</div>
        <h3 style={{fontFamily:T.fontDisplay,fontSize:'1.4rem',fontWeight:500,color:T.textPrimary,marginBottom:10,fontStyle:'italic'}}>Compare</h3>
        <p style={{fontFamily:T.fontReading,fontSize:'0.85rem',lineHeight:1.6,color:T.textSecondary,marginBottom:16,fontStyle:'italic'}}>Three mature contributors with dramatically different engagement patterns. The same six pillars produce radically different shapes depending on how each person actually behaves.</p>
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {HERO_SEED_IDS.map(id => {
            const p = profiles[id];
            const isActive = active === id;
            const label = p.archetype?.label ?? 'Pattern Still Forming';
            return (
              <div key={id} onClick={() => setActive(id)} role="button" tabIndex={0} style={{display:'block',padding:'12px 14px',background:isActive?T.bgWhite:'transparent',border:`1px solid ${isActive?T.amber:'rgba(184,115,42,0.25)'}`,borderRadius:6,cursor:'pointer',textAlign:'left',boxShadow:isActive?'0 2px 8px rgba(184,115,42,0.15)':'none',transition:'all 0.15s'}}>
                <div style={{fontFamily:T.fontDisplay,fontSize:'1rem',fontWeight:500,fontStyle:'italic',color:isActive?T.textPrimary:'#5a5248',lineHeight:1.2,marginBottom:3}}>
                  {p.display_name}
                </div>
                <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.06em',textTransform:'uppercase',color:isActive?T.amber:T.textTertiary}}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:24,paddingTop:'clamp(8px, 1vw, 16px)'}}>
        <Fingerprint
          key={active}
          data={fingerprintData}
          size={isDesktop ? 380 : 200}
          resonance={profile.resonance ?? 0}
        />
        <div style={{maxWidth:520,borderTop:`1px solid ${T.borderLight}`,paddingTop:20,textAlign:'center'}}>
          <div style={{fontFamily:T.fontMono,fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:T.amber,marginBottom:6}}>About</div>
          <p style={{fontFamily:T.fontReading,fontSize:'0.95rem',lineHeight:1.65,color:T.textSecondary,margin:0,fontStyle:'italic'}}>{profile.bio}</p>
        </div>
      </div>
    </div>
  );
}

// ── Mounts ───────────────────────────────────────────────────────────────

function mountAll() {
  const heroRoot = document.getElementById('fp-hero-root');
  if (heroRoot) {
    createRoot(heroRoot).render(<HeroCarousel />);
  }

  document.querySelectorAll('[data-fp-axes]').forEach(el => {
    try {
      const data      = JSON.parse(el.dataset.fpAxes);
      const size      = parseInt(el.dataset.fpSize)        || 180;
      const resonance = parseFloat(el.dataset.fpResonance) || 0;
      const labels    = el.dataset.fpLabels !== 'false';
      const lines     = el.dataset.fpLines  !== 'false';
      createRoot(el).render(
        <Fingerprint
          data={data}
          size={size}
          resonance={resonance}
          showLabels={labels}
          showAxisLines={lines}
        />
      );
    } catch (e) {
      console.error('[Dialecta] FP mount error:', e);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAll);
} else {
  mountAll();
}
