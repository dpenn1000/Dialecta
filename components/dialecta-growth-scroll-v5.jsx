import { useState, useMemo, useId, useEffect, memo } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// FINGERPRINT ENGINE — v1.0.0 (inline from dialecta-fingerprint-engine.jsx)
// ═══════════════════════════════════════════════════════════════════════════

const ENGINE_VERSION = "1.0.0";

// ─── CANONICAL AXIS DEFINITIONS ─────────────────────────────────────────────
// Read-only. Changing any of these is a breaking change and requires a
// major version bump. The `color` and `colorDeep` values are fallbacks used
// only when topicPhases history is missing; active ring rendering uses
// topic colors from FINGERPRINT_TOPICS instead.
const FINGERPRINT_AXES = Object.freeze([
  { key: "specificity", label: "Specificity", pair: "Substance",
    color: "#d49415", colorDeep: "#7a5008", angle: 0,
    meaning: "Average claim level across your comments. The depth dimension." },
  { key: "calibration", label: "Calibration", pair: "Intellectual Honesty",
    color: "#2674d4", colorDeep: "#143e7a", angle: 60,
    meaning: "How closely your self-declared tier matches the community's view." },
  { key: "charity",     label: "Charity",     pair: "Intellectual Honesty",
    color: "#3aa564", colorDeep: "#1a5a32", angle: 120,
    meaning: "How often you engage with the strongest version of an opposing view before disagreeing." },
  { key: "discourse",   label: "Discourse",   pair: "Engagement",
    color: "#dc5418", colorDeep: "#7c2808", angle: 180,
    meaning: "How often you engage in back-and-forth rather than hit-and-run." },
  { key: "consistency", label: "Consistency", pair: "Engagement",
    color: "#b8429a", colorDeep: "#5e1c50", angle: 240,
    meaning: "Showing up over time. Streak, regularity, persistence." },
  { key: "originality", label: "Originality", pair: "Substance",
    color: "#a8a020", colorDeep: "#5a5408", angle: 300,
    meaning: "Whether you introduce new framings or respond to existing ones. The novelty dimension." },
]);

// ─── CANONICAL TOPIC PALETTE ────────────────────────────────────────────────
// Ring colors come from topic history, not axis identity. Each topic has a
// color and a deeper variant. Adding topics is not a breaking change; changing
// existing topic colors is a minor version bump.
const FINGERPRINT_TOPICS = Object.freeze({
  renewable_energy:  { label: "Renewable Energy",  color: "#3d7a28", colorDeep: "#1e4412" },
  mental_health:     { label: "Mental Health",     color: "#4a6590", colorDeep: "#223553" },
  music:             { label: "Music",             color: "#6a3a9a", colorDeep: "#351848" },
  economics:         { label: "Economics",         color: "#c4871a", colorDeep: "#704608" },
  humanity:          { label: "Humanity & Society",color: "#9a4218", colorDeep: "#501e08" },
  political_science: { label: "Political Science", color: "#a01f1f", colorDeep: "#500808" },
  psychology:        { label: "Psychology",        color: "#2a7480", colorDeep: "#124048" },
  acoustics:         { label: "Acoustics",         color: "#5c6a78", colorDeep: "#2e3640" },
  theology:          { label: "Theology",          color: "#c47014", colorDeep: "#683808" },
});

// ─── THEME PRESETS ──────────────────────────────────────────────────────────
// The SVG is transparent — the consumer controls the surface. These tokens
// only color structural elements: guide lines, center glow, center dot,
// and axis labels.
const FINGERPRINT_THEMES = Object.freeze({
  light: {
    guideStroke:     "#e8e0d0",
    centerGlow:      "#b8862e",
    centerDot:       "#b8862e",
    labelColor:      "#5a5248",
    labelFontFamily: "'Cinzel', serif",
  },
  dark: {
    guideStroke:     "#3a342c",
    centerGlow:      "#d4a84a",
    centerDot:       "#d4a84a",
    labelColor:      "#b8ae9e",
    labelFontFamily: "'Cinzel', serif",
  },
});

function resolveTheme(theme) {
  if (typeof theme === "string") return FINGERPRINT_THEMES[theme] || FINGERPRINT_THEMES.light;
  if (theme && typeof theme === "object") return { ...FINGERPRINT_THEMES.light, ...theme };
  return FINGERPRINT_THEMES.light;
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══ FINGERPRINT ENGINE START — v1.0.0 — DO NOT EDIT INLINE ═══
// ═══ Source of truth: dialecta-fingerprint-engine.jsx                     ═══
// ═══ Sync this block from the source whenever the version bumps.          ═══
// ═══════════════════════════════════════════════════════════════════════════

function Fingerprint({
  data,
  size = 360,
  theme = "light",
  showLabels = true,
  showAxisLines = true,
  showGuideRing = true,
  animateAxis = null,
  resonance = 0,
  className = "",
  style = {},
  ariaLabel = "Thinking Fingerprint",
}) {
  const t = resolveTheme(theme);
  const uid = useId().replace(/:/g, "");
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;

  const fp = useMemo(() => {
    const N_PERIMETER = 96;
    const RADIUS_POWER = 0.85;
    const MIN_AXIS_RADIUS_FACTOR = 0.04;
    const TRADEOFF_PENALTY = 0.20;

    // Trade-off pairs: axes that compete for the same cognitive budget.
    //   DEPTH vs NOVELTY: Specificity vs Originality
    //   SOLO vs SOCIAL:   Specificity vs Discourse
    //   VOLUME vs CARE:   Discourse vs Calibration and Charity
    const TRADEOFF_PAIRS = [
      ["specificity", "originality"],
      ["specificity", "discourse"],
      ["discourse", "calibration"],
      ["discourse", "charity"],
    ];

    const maxGrad = FINGERPRINT_AXES.reduce(
      (m, a) => Math.max(m, Math.min(data?.[a.key]?.graduations || 0, 22)), 0
    );

    const totalGrad = FINGERPRINT_AXES.reduce(
      (s, a) => s + Math.min(data?.[a.key]?.graduations || 0, 22), 0
    );
    const spineFactor = Math.min(totalGrad / 60, 1);
    const spineCx = cx;
    const spineCy = cy - (1 - spineFactor) * maxR * 0.18;

    // Derive three behaviors per axis from tierMix:
    //   purity     = forum / total
    //   turbulence = (heat + stance) / total
    //   clarity    = forum / (forum + echo + fog)
    // Legacy fallback supports old { graduations, purity } datasets.
    function deriveAxisMetrics(axisKey) {
      const ax = data?.[axisKey];
      if (!ax || (ax.graduations || 0) === 0) {
        return { purity: 1, turbulence: 0, clarity: 1, total: 0 };
      }
      let mix = ax.tierMix;
      if (!mix) {
        const purity = ax.purity ?? 0.8;
        const grad = ax.graduations;
        mix = {
          forum:  Math.round(grad * purity),
          spark:  Math.round(grad * (1 - purity) * 0.4),
          echo:   Math.round(grad * (1 - purity) * 0.15),
          fog:    Math.round(grad * (1 - purity) * 0.10),
          heat:   Math.round(grad * (1 - purity) * 0.25),
          stance: Math.round(grad * (1 - purity) * 0.10),
        };
      }
      const total = (mix.forum || 0) + (mix.spark || 0) + (mix.echo || 0)
                  + (mix.fog || 0) + (mix.heat || 0) + (mix.stance || 0);
      if (total === 0) return { purity: 1, turbulence: 0, clarity: 1, total: 0 };
      const purity     = (mix.forum || 0) / total;
      const turbulence = ((mix.heat || 0) + (mix.stance || 0)) / total;
      const clarityDenom = (mix.forum || 0) + (mix.echo || 0) + (mix.fog || 0);
      const clarity    = clarityDenom > 0 ? (mix.forum || 0) / clarityDenom : 1;
      return { purity, turbulence, clarity, total };
    }

    const axisMetrics = FINGERPRINT_AXES.map(a => deriveAxisMetrics(a.key));

    // Topic history per axis: flatten topicPhases into a per-ring array so
    // we can look up which topic was active when any given ring was earned.
    const axisTopicPerRing = FINGERPRINT_AXES.map(a => {
      const ax = data?.[a.key];
      if (!ax || !ax.topicPhases) return null;
      const flat = [];
      for (const phase of ax.topicPhases) {
        for (let i = 0; i < phase.count; i++) flat.push(phase.topic);
      }
      return flat;
    });

    function topicColor(topicKey, deep = false) {
      if (!topicKey) return deep ? "#5a5248" : "#8a8278";
      const tt = FINGERPRINT_TOPICS[topicKey];
      if (!tt) return deep ? "#5a5248" : "#8a8278";
      return deep ? tt.colorDeep : tt.color;
    }

    // Trade-off factor: how much an axis's radius is reduced by its
    // competing partners. Only bites when both axes are strong.
    function tradeoffFactor(axisKey) {
      const grad = Math.min(data?.[axisKey]?.graduations || 0, 22);
      if (grad === 0) return 1;
      let totalPenalty = 0;
      for (const [a, b] of TRADEOFF_PAIRS) {
        let partnerKey = null;
        if (a === axisKey) partnerKey = b;
        else if (b === axisKey) partnerKey = a;
        if (!partnerKey) continue;
        const partnerGrad = Math.min(data?.[partnerKey]?.graduations || 0, 22);
        const partnerStrength = partnerGrad / 22;
        const myStrength = grad / 22;
        totalPenalty += partnerStrength * myStrength * TRADEOFF_PENALTY;
      }
      totalPenalty = Math.min(totalPenalty, TRADEOFF_PENALTY * 1.5);
      return 1 - totalPenalty;
    }

    const axisMaxRadius = FINGERPRINT_AXES.map(a => {
      const grad = Math.min(data?.[a.key]?.graduations || 0, 22);
      if (grad === 0) return 0;
      const tt = grad / 22;
      const baseRadius = maxR * Math.pow(tt, RADIUS_POWER);
      return baseRadius * tradeoffFactor(a.key);
    });

    const axisRingCount = FINGERPRINT_AXES.map(
      a => Math.min(data?.[a.key]?.graduations || 0, 22)
    );

    function topicAtRing(axisIdx, k) {
      const flat = axisTopicPerRing[axisIdx];
      if (!flat || flat.length === 0) return null;
      const axisGrad = axisRingCount[axisIdx];
      // Ring k=0 is outermost (newest). Flat array is chronological
      // [oldest, ..., newest]. Map k to (axisGrad - 1 - k).
      const idx = Math.max(0, Math.min(flat.length - 1, axisGrad - 1 - k));
      return flat[idx];
    }

    // Seed state: no graduations anywhere.
    if (maxGrad === 0) {
      return {
        rings: [],
        seedDots: FINGERPRINT_AXES.map(a => {
          const angleRad = (a.angle - 90) * Math.PI / 180;
          const r = maxR * 0.10;
          return {
            x: spineCx + Math.cos(angleRad) * r,
            y: spineCy + Math.sin(angleRad) * r,
            color: a.color,
          };
        }),
        spineCx,
        spineCy,
        haloColor: "#b8862e",
        haloColorDeep: "#6a4a10",
        innerColor: "#b8862e",
        silhouettePath: null,
      };
    }

    // Perimeter angle → adjacent axis pair and interpolation factor.
    const axisAngles = FINGERPRINT_AXES.map(a => (a.angle * Math.PI / 180));
    function findAxisInterp(theta) {
      let th = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      for (let i = 0; i < FINGERPRINT_AXES.length; i++) {
        const aA = axisAngles[i];
        const aB = axisAngles[(i + 1) % FINGERPRINT_AXES.length];
        if (aB > aA) {
          if (th >= aA && th < aB) {
            const span = aB - aA;
            const local = (th - aA) / span;
            return { idxA: i, idxB: (i + 1) % FINGERPRINT_AXES.length, factor: local };
          }
        } else {
          if (th >= aA || th < aB) {
            const span = (Math.PI * 2 - aA) + aB;
            const local = (th >= aA ? (th - aA) : (Math.PI * 2 - aA + th)) / span;
            return { idxA: i, idxB: (i + 1) % FINGERPRINT_AXES.length, factor: local };
          }
        }
      }
      return { idxA: 0, idxB: 1, factor: 0 };
    }

    function smoothstep(x) { return x * x * (3 - 2 * x); }
    function sharpBlend(x) {
      const s = smoothstep(x);
      return smoothstep(s);
    }

    function perimeterNoise(theta, ringSeed) {
      const s1 = Math.sin(theta * 7.3 + ringSeed * 1.7) * 0.5;
      const s2 = Math.sin(theta * 13.1 + ringSeed * 3.3 + 1.4) * 0.3;
      const s3 = Math.sin(theta * 21.7 + ringSeed * 5.9 + 2.7) * 0.2;
      const s4 = Math.sin(theta * 4.1 + ringSeed * 0.7) * 0.15;
      return s1 + s2 + s3 + s4;
    }

    function turbulenceWave(theta, ringSeed, turbulence) {
      if (turbulence < 0.01) return 0;
      const freq = 3 + turbulence * 8;
      const w1 = Math.sin(theta * freq + ringSeed * 0.4) * 0.7;
      const w2 = Math.sin(theta * (freq * 1.8) + ringSeed * 0.9 + 1.1) * 0.4;
      const w3 = Math.sin(theta * (freq * 0.5) + ringSeed * 0.2 + 2.3) * 0.5;
      return (w1 + w2 + w3) * turbulence;
    }

    function blendColors(hexA, hexB, tt) {
      const a = parseInt(hexA.slice(1), 16);
      const b = parseInt(hexB.slice(1), 16);
      const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
      const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
      const r = Math.round(ar + (br - ar) * tt);
      const g = Math.round(ag + (bg - ag) * tt);
      const bl = Math.round(ab + (bb - ab) * tt);
      return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
    }

    const ringCount = Math.max(4, Math.round(maxGrad * 1.15 + 4));

    const rings = [];
    for (let k = 0; k < ringCount; k++) {
      const ringDepth = k / (ringCount - 1);
      const ringSeed = k * 11.7 + 3.3;

      const points = [];
      for (let p = 0; p < N_PERIMETER; p++) {
        const theta = (p / N_PERIMETER) * Math.PI * 2;
        const interp = findAxisInterp(theta);

        function ringRadiusOnAxis(idx) {
          const grad = axisRingCount[idx];
          const axisMax = axisMaxRadius[idx];
          if (grad === 0) return maxR * MIN_AXIS_RADIUS_FACTOR;
          const globalDepth = k / Math.max(1, ringCount - 1);
          const centerClearance = maxR * 0.08;
          return axisMax * (1 - globalDepth) + centerClearance * globalDepth;
        }

        const rA = ringRadiusOnAxis(interp.idxA);
        const rB = ringRadiusOnAxis(interp.idxB);
        const blend = smoothstep(interp.factor);
        let radius = rA * (1 - blend) + rB * blend;

        const mA = axisMetrics[interp.idxA];
        const mB = axisMetrics[interp.idxB];
        const localPurity = mA.purity * (1 - blend) + mB.purity * blend;
        const localClarity = mA.clarity * (1 - blend) + mB.clarity * blend;

        // Sharpened axis-local weighting so each axis's influence stays
        // concentrated near its own angle instead of bleeding halfway into
        // its calm neighbor. A midpoint between two axes gets ~0.177 weight
        // from each side instead of 0.5.
        const FALLOFF = 2.5;
        const wA = Math.pow(1 - blend, FALLOFF);
        const wB = Math.pow(blend, FALLOFF);
        const localTurbulence = mA.turbulence * wA + mB.turbulence * wB;

        const gA = axisRingCount[interp.idxA];
        const gB = axisRingCount[interp.idxB];
        const localMaturity = gA * wA + gB * wB;

        const baseNoiseAmp = ((1 - localPurity) * 4 + 1.8) * (1 + (1 - ringDepth) * 0.4);
        const baseNoise = perimeterNoise(theta, ringSeed) * baseNoiseAmp;

        // Wave amplitude scales with recency (outer = more) and maturity
        // (mature axis = more dramatic). Newborn fingerprints stay subtle
        // even when turbulent; mature fingerprints show dramatic waves.
        const recencyMultiplier = 0.3 + (1 - ringDepth) * 0.7;
        const maturityMultiplier = 0.4 + Math.min(localMaturity / 22, 1) * 2.1;
        const waveAmp = 9 * recencyMultiplier * maturityMultiplier;
        const wave = turbulenceWave(theta, ringSeed, localTurbulence) * waveAmp;

        radius += baseNoise + wave;

        const x = spineCx + Math.cos(theta - Math.PI / 2) * radius;
        const y = spineCy + Math.sin(theta - Math.PI / 2) * radius;

        // Ring color comes from topic history at this ring index.
        const colorBlend = sharpBlend(interp.factor);
        const topicA = topicAtRing(interp.idxA, k);
        const topicB = topicAtRing(interp.idxB, k);
        const axisA = FINGERPRINT_AXES[interp.idxA];
        const axisB = FINGERPRINT_AXES[interp.idxB];
        const colorA     = topicA ? topicColor(topicA, false) : axisA.color;
        const colorDeepA = topicA ? topicColor(topicA, true)  : axisA.colorDeep;
        const colorB     = topicB ? topicColor(topicB, false) : axisB.color;
        const colorDeepB = topicB ? topicColor(topicB, true)  : axisB.colorDeep;
        const color     = blendColors(colorA,     colorB,     colorBlend);
        const colorDeep = blendColors(colorDeepA, colorDeepB, colorBlend);

        const gradAN = axisRingCount[interp.idxA] / 22;
        const gradBN = axisRingCount[interp.idxB] / 22;
        const localStrength = gradAN * (1 - blend) + gradBN * blend;

        points.push({ x, y, color, colorDeep, localStrength, localClarity });
      }

      // Closed Catmull-Rom path.
      let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
      for (let p = 0; p < N_PERIMETER; p++) {
        const p0 = points[(p - 1 + N_PERIMETER) % N_PERIMETER];
        const p1 = points[p];
        const p2 = points[(p + 1) % N_PERIMETER];
        const p3 = points[(p + 2) % N_PERIMETER];
        const c1x = p1.x + (p2.x - p0.x) / 6;
        const c1y = p1.y + (p2.y - p0.y) / 6;
        const c2x = p2.x - (p3.x - p1.x) / 6;
        const c2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      d += " Z";

      let category, opacity, strokeWidth;
      if (k === 0) {
        category = "silhouette";
        opacity = 0.95;
        strokeWidth = 1.6;
      } else if (k <= 2) {
        category = "outer";
        opacity = 0.78 - (k - 1) * 0.08;
        strokeWidth = 1.2;
      } else {
        category = "interior";
        const interiorDepth = (k - 3) / Math.max(1, ringCount - 4);
        opacity = Math.max(0.22, 0.55 - interiorDepth * 0.30);
        strokeWidth = 1.25;
      }

      rings.push({
        ringK: k,
        d,
        points,
        category,
        opacity,
        strokeWidth,
        isNew: k === 0 && animateAxis !== null,
      });
    }

    rings.reverse();

    // ─── HALO COMPUTATION ──────────────────────────────────────────────────
    // Dominant topic across all axes drives the halo color.
    let dominantTopic = null;
    {
      const topicCounts = {};
      for (const a of FINGERPRINT_AXES) {
        const ax = data?.[a.key];
        if (!ax || !ax.topicPhases) continue;
        for (const phase of ax.topicPhases) {
          topicCounts[phase.topic] = (topicCounts[phase.topic] || 0) + phase.count;
        }
      }
      let maxCount = 0;
      for (const [topic, count] of Object.entries(topicCounts)) {
        if (count > maxCount) { maxCount = count; dominantTopic = topic; }
      }
    }
    const haloColor = dominantTopic ? topicColor(dominantTopic, false) : "#b8862e";
    const haloColorDeep = dominantTopic ? topicColor(dominantTopic, true) : "#6a4a10";

    // Inner bleed color: topic color tinted by aggregate tier mix. High Fog
    // shifts toward murky gray; high Heat toward warm orange; high Stance
    // toward deep red. Forum-heavy contributors keep pure topic color.
    let innerColor = haloColor;
    {
      const totals = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 };
      let total = 0;
      for (const a of FINGERPRINT_AXES) {
        const ax = data?.[a.key];
        if (!ax || !ax.tierMix) continue;
        for (const k of Object.keys(totals)) {
          totals[k] += ax.tierMix[k] || 0;
          total    += ax.tierMix[k] || 0;
        }
      }
      if (total > 0) {
        const fogRatio    = totals.fog    / total;
        const heatRatio   = totals.heat   / total;
        const stanceRatio = totals.stance / total;
        let c = haloColor;
        if (fogRatio > 0)    c = blendColors(c, "#8a8680", Math.min(1, fogRatio * 2.2));
        if (heatRatio > 0)   c = blendColors(c, "#c45818", Math.min(1, heatRatio * 2.8));
        if (stanceRatio > 0) c = blendColors(c, "#6a1010", Math.min(1, stanceRatio * 3.2));
        innerColor = c;
      }
    }

    const silhouettePath = (() => {
      const silhouette = rings.find(r => r.ringK === 0);
      return silhouette ? silhouette.d : null;
    })();

    return { rings, seedDots: [], spineCx, spineCy,
             haloColor, haloColorDeep, innerColor, silhouettePath };
  }, [data, size, animateAxis, cx, cy, maxR]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: "block", overflow: "visible", ...style }}
      role="img"
      aria-label={ariaLabel}
    >
      <defs>
        <radialGradient id={`fp-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={t.centerGlow} stopOpacity="0.18" />
          <stop offset="100%" stopColor={t.centerGlow} stopOpacity="0" />
        </radialGradient>
        <filter id={`fp-crisp-${uid}`}>
          <feGaussianBlur stdDeviation="0.25" />
        </filter>
        <filter id={`fp-soft-${uid}`}>
          <feGaussianBlur stdDeviation="0.55" />
        </filter>
        <filter id={`fp-diffuse-${uid}`}>
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>

      {showGuideRing && (
        <circle cx={cx} cy={cy} r={maxR} fill="none"
                stroke={t.guideStroke} strokeWidth="0.5"
                strokeDasharray="2 4" opacity="0.5" />
      )}

      <circle cx={fp.spineCx} cy={fp.spineCy} r={maxR * 0.5}
              fill={`url(#fp-glow-${uid})`} />

      {showAxisLines && FINGERPRINT_AXES.map(a => {
        const rad = (a.angle - 90) * Math.PI / 180;
        const x2 = fp.spineCx + Math.cos(rad) * maxR;
        const y2 = fp.spineCy + Math.sin(rad) * maxR;
        return (
          <line key={a.key} x1={fp.spineCx} y1={fp.spineCy} x2={x2} y2={y2}
                stroke={t.guideStroke} strokeWidth="0.5" opacity="0.4" />
        );
      })}

      {fp.seedDots.map((dot, i) => (
        <circle key={`seed-${i}`} cx={dot.x} cy={dot.y} r={3}
                fill={dot.color} opacity="0.55" />
      ))}

      {/* Resonance halo: topic-colored glow following the silhouette.
          Three outer blur layers throw light outward; a clipped inner
          stroke layer bleeds light inward. Throw distance, opacity, and
          blur all scale with resonance. */}
      {resonance > 0 && fp.silhouettePath && (() => {
        const rCurve = Math.pow(resonance, 0.7);
        const baseW = 1.5 + rCurve * 8;
        const baseOp = 0.15 + rCurve * 0.7;
        const blurNear = 3 + rCurve * 10;
        const blurFar = 8 + rCurve * 22;
        const clipId = `fp-silhouette-clip-${uid}`;
        return (
          <g style={{ pointerEvents: "none" }}>
            <defs>
              <filter id={`fp-halo-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={blurNear} />
              </filter>
              <filter id={`fp-halo-glow-wide-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={blurFar} />
              </filter>
              <clipPath id={clipId}>
                <path d={fp.silhouettePath} />
              </clipPath>
            </defs>

            {/* Outer throw */}
            <path d={fp.silhouettePath} fill="none"
                  stroke={fp.haloColor} strokeWidth={baseW * 3.5}
                  opacity={baseOp * 0.22}
                  filter={`url(#fp-halo-glow-wide-${uid})`} />
            <path d={fp.silhouettePath} fill="none"
                  stroke={fp.haloColor} strokeWidth={baseW * 2}
                  opacity={baseOp * 0.5}
                  filter={`url(#fp-halo-glow-${uid})`} />
            <path d={fp.silhouettePath} fill="none"
                  stroke={fp.haloColorDeep} strokeWidth={baseW * 0.9}
                  opacity={baseOp * 0.9}
                  filter={`url(#fp-halo-glow-${uid})`} />

            {/* Inner bleed, clipped to silhouette */}
            <g clipPath={`url(#${clipId})`}>
              <path d={fp.silhouettePath} fill="none"
                    stroke={fp.innerColor} strokeWidth={baseW * 6}
                    opacity={baseOp * 0.35}
                    filter={`url(#fp-halo-glow-${uid})`} />
              <path d={fp.silhouettePath} fill="none"
                    stroke={fp.innerColor} strokeWidth={baseW * 3}
                    opacity={baseOp * 0.5}
                    filter={`url(#fp-halo-glow-${uid})`} />
            </g>
          </g>
        );
      })()}

      {fp.rings.map((ring) => (
        <g key={`ring-${ring.ringK}`}>
          {ring.points.map((pt, j) => {
            const next = ring.points[(j + 1) % ring.points.length];
            const color = ring.category === "silhouette" ? pt.colorDeep : pt.color;
            const avgStrength = (pt.localStrength + next.localStrength) / 2;
            const widthScale = 0.55 + avgStrength * 0.90;
            const sw = ring.strokeWidth * widthScale;
            const avgClarity = (pt.localClarity + next.localClarity) / 2;
            const filterSuffix = avgClarity > 0.75 ? "crisp"
                               : avgClarity > 0.45 ? "soft"
                               : "diffuse";
            return (
              <line
                key={`r${ring.ringK}-p${j}`}
                x1={pt.x} y1={pt.y}
                x2={next.x} y2={next.y}
                stroke={color}
                strokeWidth={sw}
                strokeLinecap="round"
                opacity={ring.opacity}
                filter={`url(#fp-${filterSuffix}-${uid})`}
                style={ring.isNew ? {
                  animation: `fp-grow-${uid} 1.4s cubic-bezier(0.4, 0, 0.2, 1) both`,
                } : undefined}
              />
            );
          })}
        </g>
      ))}

      <circle cx={fp.spineCx} cy={fp.spineCy} r={3} fill={t.centerDot} opacity="0.85" />
      <circle cx={fp.spineCx} cy={fp.spineCy} r={5} fill="none"
              stroke={t.centerDot} strokeWidth="0.5" opacity="0.4" />

      {showLabels && FINGERPRINT_AXES.map(a => {
        const rad = (a.angle - 90) * Math.PI / 180;
        const labelR = maxR + 28;
        const x = cx + Math.cos(rad) * labelR;
        const y = cy + Math.sin(rad) * labelR;
        return (
          <text key={a.key} x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={t.labelFontFamily}
                fontSize="10"
                letterSpacing="0.1em"
                fill={t.labelColor}
                style={{ textTransform: "uppercase" }}>
            {a.label}
          </text>
        );
      })}

      <style>{`
        @keyframes fp-grow-${uid} {
          0%   { opacity: 0; stroke-width: 0.4; }
          50%  { opacity: 1; stroke-width: 2.4; }
          100% { opacity: 0.92; stroke-width: 1.6; }
        }
      `}</style>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ═══ FINGERPRINT ENGINE END — v1.0.0 ═══


// ═══════════════════════════════════════════════════════════════════════════
// GROWTH SCROLL
// ═══════════════════════════════════════════════════════════════════════════

const PAPER    = "#ede0c4";
const PH       = 650;   // panel height
const DH       = 30;    // deckle height
const TITLE_W  = 270;
const SEED_W   = 310;
const ENTRY_W  = 400;
const TOTAL_W  = 2260;  // TITLE_W + SEED_W + ENTRY_W*4 + 80

// ─── SNAPSHOT DATA ────────────────────────────────────────────────────────
const SNAPSHOTS = [
  {
    id:"day1", event:"First Entry", shortDate:"1 SEP 2024", date:"1 September 2024",
    isSeed:true,
    annotation:"A first entry. One contribution — consistency, and nothing more. The form has not yet taken shape. This is the beginning of the record.",
    data:{
      specificity: { graduations:0, tierMix:{forum:0,spark:0,echo:0,fog:0,heat:0,stance:0}, topicPhases:[] },
      calibration:  { graduations:0, tierMix:{forum:0,spark:0,echo:0,fog:0,heat:0,stance:0}, topicPhases:[] },
      charity:      { graduations:0, tierMix:{forum:0,spark:0,echo:0,fog:0,heat:0,stance:0}, topicPhases:[] },
      discourse:    { graduations:0, tierMix:{forum:0,spark:0,echo:0,fog:0,heat:0,stance:0}, topicPhases:[] },
      consistency:  { graduations:1, tierMix:{forum:0,spark:1,echo:0,fog:0,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:1}] },
      originality:  { graduations:0, tierMix:{forum:0,spark:0,echo:0,fog:0,heat:0,stance:0}, topicPhases:[] },
    },
  },
  {
    id:"declaration", event:"Declaration", shortDate:"14 OCT 2024", date:"14 October 2024",
    isSeed:false,
    annotation:"Consistency and Discourse are the first axes to register clearly. The form is sparse, leaning toward engagement over depth. Acuity and Charity have barely surfaced.",
    data:{
      specificity: { graduations:2,  tierMix:{forum:0,spark:1,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:2}] },
      calibration:  { graduations:3,  tierMix:{forum:1,spark:1,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:3}] },
      charity:      { graduations:1,  tierMix:{forum:0,spark:0,echo:0,fog:1,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:1}] },
      discourse:    { graduations:4,  tierMix:{forum:1,spark:1,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:4}] },
      consistency:  { graduations:5,  tierMix:{forum:1,spark:2,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:5}] },
      originality:  { graduations:1,  tierMix:{forum:0,spark:0,echo:0,fog:1,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:1}] },
    },
  },
  {
    id:"recommitment", event:"Recommitment", shortDate:"9 JAN 2025", date:"9 January 2025",
    isSeed:false,
    annotation:"Consistency holds its lead, but Acuity has made a clear claim alongside it. Charity is beginning to register for the first time. The shape is fuller now.",
    data:{
      specificity: { graduations:7,  tierMix:{forum:2,spark:3,echo:0,fog:0,heat:2,stance:0}, topicPhases:[{topic:"mental_health",count:4},{topic:"economics",count:3}] },
      calibration:  { graduations:5,  tierMix:{forum:2,spark:2,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:3},{topic:"economics",count:2}] },
      charity:      { graduations:3,  tierMix:{forum:1,spark:1,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:2},{topic:"economics",count:1}] },
      discourse:    { graduations:6,  tierMix:{forum:2,spark:2,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:4},{topic:"economics",count:2}] },
      consistency:  { graduations:8,  tierMix:{forum:3,spark:3,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:5},{topic:"economics",count:3}] },
      originality:  { graduations:2,  tierMix:{forum:0,spark:1,echo:0,fog:1,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:1},{topic:"economics",count:1}] },
    },
  },
  {
    id:"archetype", event:"Archetype Shift", shortDate:"3 APR 2025", date:"3 April 2025",
    isSeed:false,
    annotation:"A significant acceleration. Acuity and Charity have both grown sharply. All six axes now carry visible weight. The characteristic shape of this contributor is becoming legible.",
    data:{
      specificity: { graduations:13, tierMix:{forum:6,spark:4,echo:1,fog:0,heat:2,stance:0}, topicPhases:[{topic:"mental_health",count:5},{topic:"economics",count:5},{topic:"political_science",count:3}] },
      calibration:  { graduations:8,  tierMix:{forum:4,spark:3,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:3},{topic:"economics",count:3},{topic:"political_science",count:2}] },
      charity:      { graduations:9,  tierMix:{forum:5,spark:2,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:4},{topic:"economics",count:3},{topic:"political_science",count:2}] },
      discourse:    { graduations:7,  tierMix:{forum:4,spark:2,echo:1,fog:0,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:3},{topic:"economics",count:2},{topic:"political_science",count:2}] },
      consistency:  { graduations:11, tierMix:{forum:6,spark:3,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:5},{topic:"economics",count:4},{topic:"political_science",count:2}] },
      originality:  { graduations:4,  tierMix:{forum:2,spark:1,echo:0,fog:1,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:2},{topic:"economics",count:1},{topic:"political_science",count:1}] },
    },
  },
  {
    id:"current", event:"Present", shortDate:"16 APR 2026", date:"16 April 2026",
    isSeed:false,
    annotation:"Acuity and Charity are the defining poles. The form has reached a mature asymmetry — depth and charitable engagement are this contributor's signature. The record is open.",
    data:{
      specificity: { graduations:18, tierMix:{forum:10,spark:5,echo:1,fog:0,heat:2,stance:0}, topicPhases:[{topic:"mental_health",count:5},{topic:"economics",count:6},{topic:"political_science",count:4},{topic:"renewable_energy",count:3}] },
      calibration:  { graduations:11, tierMix:{forum:7,spark:3,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:3},{topic:"economics",count:4},{topic:"political_science",count:2},{topic:"renewable_energy",count:2}] },
      charity:      { graduations:16, tierMix:{forum:10,spark:4,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:5},{topic:"economics",count:5},{topic:"political_science",count:3},{topic:"renewable_energy",count:3}] },
      discourse:    { graduations:9,  tierMix:{forum:6,spark:2,echo:1,fog:0,heat:0,stance:0}, topicPhases:[{topic:"mental_health",count:3},{topic:"economics",count:3},{topic:"political_science",count:2},{topic:"renewable_energy",count:1}] },
      consistency:  { graduations:14, tierMix:{forum:9,spark:3,echo:1,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:4},{topic:"economics",count:5},{topic:"political_science",count:3},{topic:"renewable_energy",count:2}] },
      originality:  { graduations:7,  tierMix:{forum:4,spark:2,echo:0,fog:0,heat:1,stance:0}, topicPhases:[{topic:"mental_health",count:2},{topic:"economics",count:2},{topic:"political_science",count:2},{topic:"renewable_energy",count:1}] },
    },
  },
];

// ─── DECKLE PATH GENERATORS ───────────────────────────────────────────────
function deckleTop(W, H, seed) {
  const step = 12, count = Math.ceil(W / step) + 2;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = Math.min(i * step, W);
    const t = x / W;
    const y = H * 0.55
      + Math.sin(t*29.3 + seed)       * 5.2
      + Math.sin(t*61.7 + seed*1.7)   * 3.0
      + Math.sin(t*113  + seed*2.9)   * 1.6
      + Math.sin(t*197  + seed*4.1)   * 0.8
      + Math.sin(t*347  + seed*6.3)   * 0.4;
    pts.push([+x.toFixed(1), +y.toFixed(1)]);
  }
  let d = `M 0 0 L ${W} 0 L ${W} ${pts[pts.length-1][1]}`;
  for (let i = pts.length-2; i >= 0; i--) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  return d + ` L 0 ${pts[0][1]} Z`;
}

function deckleBottom(W, H, seed) {
  const step = 12, count = Math.ceil(W / step) + 2;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = Math.min(i * step, W);
    const t = x / W;
    const y = H * 0.45
      + Math.sin(t*37.1 + seed)       * 5.2
      + Math.sin(t*73.3 + seed*1.9)   * 2.8
      + Math.sin(t*127  + seed*3.1)   * 1.5
      + Math.sin(t*211  + seed*4.7)   * 0.7
      + Math.sin(t*379  + seed*7.1)   * 0.4;
    pts.push([+x.toFixed(1), +y.toFixed(1)]);
  }
  let d = `M 0 ${H} L ${W} ${H} L ${W} ${pts[pts.length-1][1]}`;
  for (let i = pts.length-2; i >= 0; i--) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  return d + ` L 0 ${pts[0][1]} Z`;
}

// ─── PAPER TEXTURE ────────────────────────────────────────────────────────
function PaperTexture({ width }) {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
      <svg width={width} height="100%" xmlns="http://www.w3.org/2000/svg"
        style={{position:"absolute",top:0,left:0}}>
        <defs>
          {/* Fine surface grain */}
          <filter id="ptg" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.68 0.52" numOctaves="4" seed="19" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0.08"/>
          </filter>
          {/* Horizontal fiber striations */}
          <filter id="pts" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.00 0.034" numOctaves="3" seed="7" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0.04"/>
          </filter>
          {/* Cross-grain fibers */}
          <filter id="ptc" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.038 0.00" numOctaves="2" seed="31" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0.04"/>
          </filter>
          {/* Coarse foxing / age spots */}
          <filter id="ptfox" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="turbulence" baseFrequency="0.12 0.09" numOctaves="3" seed="41"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.38  0 0 0 0 0.24  0 0 0 0 0.06  0 0 0 0.7 0"/>
          </filter>
          {/* Large organic blotch layer */}
          <filter id="ptblot" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.014" numOctaves="4" seed="77"/>
            <feColorMatrix type="saturate" values="0.15"/>
          </filter>
          {/* Vignette radial gradient */}
          <radialGradient id="ptvig" cx="50%" cy="50%" r="72%">
            <stop offset="0%"   stopColor="transparent"/>
            <stop offset="100%" stopColor="rgba(50,28,8,0.22)"/>
          </radialGradient>
        </defs>

        {/* Grain layers */}
        <rect width="100%" height="100%" filter="url(#ptg)"   fill="#a08050" style={{mixBlendMode:"multiply",opacity:0.24}}/>
        <rect width="100%" height="100%" filter="url(#pts)"   fill="#987848" style={{mixBlendMode:"multiply",opacity:0.14}}/>
        <rect width="100%" height="100%" filter="url(#ptc)"   fill="#a08858" style={{mixBlendMode:"multiply",opacity:0.09}}/>
        {/* Foxing age spots */}
        <rect width="100%" height="100%" filter="url(#ptfox)"  fill="#8a6030" style={{mixBlendMode:"multiply",opacity:0.11}}/>
        {/* Large organic blotches */}
        <rect width="100%" height="100%" filter="url(#ptblot)" fill="#7a5020" style={{mixBlendMode:"multiply",opacity:0.07}}/>
        {/* Edge vignette */}
        <rect width="100%" height="100%" fill="url(#ptvig)"/>

        {/* Deterministic ink smudge patches */}
        <ellipse cx="12%"  cy="28%" rx="4.5%" ry="2.8%" fill="#7a5828" opacity="0.045"/>
        <ellipse cx="67%"  cy="71%" rx="3.8%" ry="2.2%" fill="#6a4a20" opacity="0.040"/>
        <ellipse cx="88%"  cy="18%" rx="2.5%" ry="4.2%" fill="#7a5828" opacity="0.035"/>
        <ellipse cx="38%"  cy="88%" rx="5.2%" ry="1.8%" fill="#6a4a20" opacity="0.038"/>
        <ellipse cx="52%"  cy="44%" rx="1.8%" ry="1.2%" fill="#8a6030" opacity="0.030"/>
      </svg>
    </div>
  );
}

// ─── DECKLE EDGES ─────────────────────────────────────────────────────────
// Dark fill overlays the top/bottom of the paper strip with an irregular edge,
// so the dark background appears to eat into the paper rather than sit outside it.

function darkEdgeTop(W, H) {
  const mid = H * 0.62;
  const step = 11, count = Math.ceil(W / step) + 2;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = Math.min(i * step, W);
    const t = x / W;
    const y = mid
      + Math.sin(t*29.3 + 3.7)  * 6.8
      + Math.sin(t*61.7 + 6.3)  * 3.8
      + Math.sin(t*113  + 8.7)  * 2.0
      + Math.sin(t*197  + 15.4) * 1.0
      + Math.sin(t*347  + 22.1) * 0.5;
    pts.push([+x.toFixed(1), +y.toFixed(1)]);
  }
  let d = `M 0 0 L ${W} 0 L ${W} ${pts[pts.length-1][1]}`;
  for (let i = pts.length-2; i >= 0; i--) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  return d + ` L 0 ${pts[0][1]} Z`;
}

function darkEdgeBottom(W, H) {
  const mid = H * 0.38;
  const step = 11, count = Math.ceil(W / step) + 2;
  const pts = [];
  for (let i = 0; i < count; i++) {
    const x = Math.min(i * step, W);
    const t = x / W;
    const y = mid
      + Math.sin(t*37.1 + 8.2)  * 6.8
      + Math.sin(t*73.3 + 15.6) * 3.5
      + Math.sin(t*127  + 19.3) * 1.8
      + Math.sin(t*211  + 28.7) * 0.9
      + Math.sin(t*379  + 41.2) * 0.5;
    pts.push([+x.toFixed(1), +y.toFixed(1)]);
  }
  let d = `M 0 ${H} L ${W} ${H} L ${W} ${pts[pts.length-1][1]}`;
  for (let i = pts.length-2; i >= 0; i--) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  return d + ` L 0 ${pts[0][1]} Z`;
}

// These sit at top:0 / bottom:0 of the paper strip and fill the dark ink
// color, creating the illusion that the dark background eats into the paper.
function DeckleTop() {
  const EDH = 42;
  const path = useMemo(() => darkEdgeTop(TOTAL_W, EDH), []);
  const edge = useMemo(() => {
    // Just the irregular line for the thin paper-edge highlight
    const mid = EDH * 0.62, step = 11, count = Math.ceil(1440/step)+2;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const x = Math.min(i*step,TOTAL_W), t = x/TOTAL_W;
      pts.push([+x.toFixed(1), +(mid+Math.sin(t*29.3+3.7)*6.8+Math.sin(t*61.7+6.3)*3.8+Math.sin(t*113+8.7)*2.0+Math.sin(t*197+15.4)*1.0).toFixed(1)]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    pts.slice(1).forEach(([x,y]) => { d += ` L ${x} ${y}`; });
    return d;
  }, []);
  return (
    <div style={{position:"absolute",top:0,left:0,width:TOTAL_W,height:EDH,zIndex:15,pointerEvents:"none"}}>
      <svg width={TOTAL_W} height={EDH} viewBox={`0 0 ${TOTAL_W} ${EDH}`}
        preserveAspectRatio="none" style={{display:"block"}}>
        <defs>
          <filter id="dkl-shadow-t">
            <feGaussianBlur stdDeviation="1.8"/>
          </filter>
        </defs>
        {/* Soft shadow along the torn edge */}
        <path d={edge} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4"
          filter="url(#dkl-shadow-t)" strokeLinejoin="round"/>
        {/* Dark fill from top down to irregular edge */}
        <path d={path} fill="#1c1814"/>
        {/* Hairline paper edge highlight */}
        <path d={edge} fill="none" stroke="rgba(220,195,155,0.22)" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

function DeckleBottom() {
  const EDH = 42;
  const path = useMemo(() => darkEdgeBottom(TOTAL_W, EDH), []);
  const edge = useMemo(() => {
    const mid = EDH * 0.38, step = 11, count = Math.ceil(1440/step)+2;
    const pts = [];
    for (let i = 0; i < count; i++) {
      const x = Math.min(i*step,TOTAL_W), t = x/TOTAL_W;
      pts.push([+x.toFixed(1), +(mid+Math.sin(t*37.1+8.2)*6.8+Math.sin(t*73.3+15.6)*3.5+Math.sin(t*127+19.3)*1.8+Math.sin(t*211+28.7)*0.9).toFixed(1)]);
    }
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    pts.slice(1).forEach(([x,y]) => { d += ` L ${x} ${y}`; });
    return d;
  }, []);
  return (
    <div style={{position:"absolute",bottom:0,left:0,width:TOTAL_W,height:EDH,zIndex:15,pointerEvents:"none"}}>
      <svg width={TOTAL_W} height={EDH} viewBox={`0 0 ${TOTAL_W} ${EDH}`}
        preserveAspectRatio="none" style={{display:"block"}}>
        <defs>
          <filter id="dkl-shadow-b">
            <feGaussianBlur stdDeviation="1.8"/>
          </filter>
        </defs>
        <path d={edge} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="4"
          filter="url(#dkl-shadow-b)" strokeLinejoin="round"/>
        <path d={path} fill="#1c1814"/>
        <path d={edge} fill="none" stroke="rgba(220,195,155,0.22)" strokeWidth="0.8"/>
      </svg>
    </div>
  );
}

// ─── TITLE PANEL ──────────────────────────────────────────────────────────
const TitlePanel = memo(function TitlePanel() {
  return (
    <div style={{
      width:TITLE_W, height:PH, flexShrink:0,
      display:"flex", flexDirection:"column", justifyContent:"flex-start",
      padding:"76px 32px 28px 44px",
      borderRight:"1px solid rgba(150,118,72,0.20)",
    }}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:9.5,letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(55,38,18,0.72)",marginBottom:12}}>
        Contributor Record
      </div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2.0rem",fontWeight:600,color:"#1c1814",lineHeight:1.1,marginBottom:10}}>
        The Growth<br/>Record
      </div>
      <p style={{fontFamily:"'IM Fell English',serif",fontStyle:"italic",fontSize:"1.0rem",fontWeight:400,color:"rgba(65,48,28,0.72)",lineHeight:1.72,margin:0,maxWidth:210}}>
        A chronological account of this contributor's intellectual fingerprint,
        from its earliest form to the present.
      </p>
      <div style={{marginTop:38,fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:"0.10em",color:"rgba(120,92,50,0.32)",textTransform:"uppercase"}}>
        Scroll →
      </div>
    </div>
  );
});

// ─── AXIS LEGEND ──────────────────────────────────────────────────────────
// ─── WARM PENCIL COLOR OVERRIDES ──────────────────────────────────────────
// Muted, warm-toned versions of canonical axis colors for text rendering.
// Reads like colored pencil on aged paper rather than bright marker.
const PENCIL = {
  specificity: "#8a6010",   // deep ochre
  calibration:  "#284e88",  // slate indigo
  charity:      "#286840",  // forest sage
  discourse:    "#922e0c",  // deep terracotta
  consistency:  "#6e2460",  // dark mauve
  originality:  "#5c5c10",  // deep olive
};

function AxisLegend({ data }) {
  return (
    <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px",justifyContent:"center",marginTop:8,maxWidth:340}}>
      {FINGERPRINT_AXES.map(a => {
        const g = data[a.key]?.graduations || 0;
        return (
          <span key={a.key} style={{
            fontFamily:"'Cormorant Garamond',serif",
            fontStyle:"italic",
            fontSize:14,
            fontWeight: g > 0 ? 500 : 300,
            color: g > 0 ? (PENCIL[a.key] || a.color) : "rgba(140,110,70,0.20)",
            opacity: g > 0 ? 0.95 : 0.40,
            letterSpacing:"0.01em",
          }}>
            {a.label} {g}
          </span>
        );
      })}
    </div>
  );
}

// ─── ENTRY PANEL (memo = won't re-render on scroll) ──────────────────────
const EntryPanel = memo(function EntryPanel({ snap, prevSnap, index }) {
  const pw = snap.isSeed ? SEED_W : ENTRY_W;

  const deltas = useMemo(() => {
    if (!prevSnap) return [];
    return FINGERPRINT_AXES
      .map(a => ({ a, d: (snap.data[a.key]?.graduations||0) - (prevSnap.data[a.key]?.graduations||0) }))
      .filter(x => x.d > 0)
      .sort((a, b) => b.d - a.d);
  }, [snap.id]);

  return (
    <div style={{
      width:pw, height:PH, flexShrink:0,
      display:"flex", flexDirection:"column", justifyContent:"flex-start",
      padding:"76px 30px 28px", position:"relative",
      overflowY:"hidden",
    }}>
      {index > 0 && (
        <div style={{position:"absolute",left:0,top:"8%",bottom:"8%",width:1,
          background:"linear-gradient(to bottom,transparent,rgba(148,118,68,0.10) 30%,rgba(148,118,68,0.10) 70%,transparent)",
          pointerEvents:"none"}}/>
      )}

      {/* Date + event */}
      <div style={{marginBottom:10}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:11.5,letterSpacing:"0.06em",textTransform:"uppercase",color:"rgba(38,24,8,0.85)"}}>
          {snap.shortDate}
        </div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:"0.04em",textTransform:"uppercase",color:"rgba(80,55,22,0.78)",marginTop:5}}>
          {snap.event}
        </div>
      </div>

      {/* Fingerprint */}
      <div style={{display:"flex",justifyContent:"center"}}>
        <Fingerprint
          data={snap.data}
          size={snap.isSeed ? 162 : 176}
          theme="light"
          showLabels={false}
          showAxisLines={true}
          showGuideRing={true}
          resonance={0}
        />
      </div>

      <AxisLegend data={snap.data}/>

      {/* Annotation */}
      <p style={{
        fontFamily:"'IM Fell English',serif",fontStyle:"italic",
        fontSize:"1.05rem",fontWeight:400,lineHeight:1.75,
        color:"rgba(40,28,14,0.76)",margin:"10px 0 0",maxWidth:340,
      }}>
        {snap.annotation}
      </p>

      {/* Delta — "Since last" on own line, deltas on next line */}
      {deltas.length > 0 && (
        <div style={{marginTop:10,paddingTop:8,borderTop:"1px solid rgba(148,118,68,0.16)"}}>
          <div style={{
            fontFamily:"'Cinzel',serif",fontSize:9,
            letterSpacing:"0.06em",textTransform:"uppercase",
            color:"rgba(44,28,10,0.72)",marginBottom:6,fontWeight:500,
          }}>
            Since last
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:"3px 10px"}}>
            {deltas.map(({a,d}) => (
              <span key={a.key} style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontStyle:"italic",
                fontSize:14, fontWeight:500,
                letterSpacing:"0.01em",
                color: PENCIL[a.key] || a.color, opacity:1.0,
              }}>
                {a.label} +{d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

// ─── ROOT ─────────────────────────────────────────────────────────────────
export default function GrowthScroll() {
  useEffect(() => {
    const l = document.createElement("link");
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Cinzel:wght@400;500;600&family=IM+Fell+English:ital@0;1&display=swap";
    document.head.appendChild(l);
    // Force dark background at document level so iframe bg is correct
    const prevBg  = document.body.style.background;
    const prevM   = document.body.style.margin;
    const prevP   = document.body.style.padding;
    const prevD   = document.body.style.display;
    const prevAI  = document.body.style.alignItems;
    const prevMH  = document.body.style.minHeight;
    document.body.style.background  = "#1c1814";
    document.body.style.margin      = "0";
    document.body.style.padding     = "36px 0";
    document.body.style.boxSizing   = "border-box";
    document.body.style.display     = "flex";
    document.body.style.alignItems  = "center";
    document.body.style.minHeight   = "100vh";
    return () => {
      try { document.head.removeChild(l); } catch {}
      document.body.style.background  = prevBg;
      document.body.style.margin      = prevM;
      document.body.style.padding     = prevP;
      document.body.style.display     = prevD;
      document.body.style.alignItems  = prevAI;
      document.body.style.minHeight   = prevMH;
    };
  }, []);

  return (
    <div style={{
      width:"100%",
      fontFamily:"'Cormorant Garamond',serif",
      WebkitFontSmoothing:"antialiased",
    }}>
      <div style={{
        width:"100%", height:PH,
        background:PAPER,
        position:"relative",
      }}>
        {/* Horizontal scroll */}
        <div style={{
          position:"absolute", inset:0,
          overflowX:"auto", overflowY:"hidden",
          WebkitOverflowScrolling:"touch",
        }}>
          <div style={{
            position:"relative",
            display:"flex",
            alignItems:"center",
            width:TOTAL_W, height:PH,
            willChange:"contents",
          }}>
            <PaperTexture width={TOTAL_W}/>
            {/* Deckle edges inside scroll so they travel with the paper */}
            <DeckleTop/>
            <DeckleBottom/>

            <TitlePanel/>
            {SNAPSHOTS.map((snap, i) => (
              <EntryPanel
                key={snap.id}
                snap={snap}
                prevSnap={i > 0 ? SNAPSHOTS[i-1] : null}
                index={i}
              />
            ))}
            <div style={{width:80,flexShrink:0}}/>
          </div>
        </div>
      </div>
    </div>
  );
}
