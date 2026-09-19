import { useMemo, useId } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DIALECTA — THINKING FINGERPRINT ENGINE
   ═══════════════════════════════════════════════════════════════════════════
   Version: 1.0.0
   Status:  Canonical source of truth. Listed in Project Index under
            Contributor Identity Layer.

   This file is pure library code. It has no default export and does not
   render as a standalone artifact. Consumers import the named exports:

     import {
       Fingerprint,
       FINGERPRINT_AXES,
       FINGERPRINT_TOPICS,
       FINGERPRINT_THEMES,
       emptyFingerprint,
       ENGINE_VERSION,
     } from "./dialecta-fingerprint-engine";

   The showcase page lives in `dialecta-fingerprint.jsx` (separate file).
   To preview the engine visually, consume it from that showcase.

   The ENGINE block below is bracketed by grep-able markers so a sync pass
   can find it mechanically and replace it in consumer files. Edit here,
   then sync the block into consumers (profile, profile-mobile, showcase).

   ─── PUBLIC API (locked at v1.0.0) ─────────────────────────────────────────
   <Fingerprint
     data={FingerprintData}         required
     size={number}                  default 360
     theme={"light"|"dark"|object}  default "light"
     showLabels={boolean}           default true
     showAxisLines={boolean}        default true
     showGuideRing={boolean}        default true
     animateAxis={string|null}      default null
     resonance={number}             default 0, range 0..1
     className={string}             default ""
     style={object}                 default {}
     ariaLabel={string}             default "Thinking Fingerprint"
   />

   ─── INPUTS ────────────────────────────────────────────────────────────────

   data: FingerprintData — required. Shape:
     {
       specificity: AxisData,
       calibration: AxisData,
       charity:     AxisData,
       discourse:   AxisData,
       consistency: AxisData,
       originality: AxisData,
     }

   AxisData:
     {
       graduations: number,              // 0 to 22, petal length
       tierMix: {                        // count of comments at each tier
         forum: number,
         spark: number,
         echo: number,
         fog: number,
         heat: number,
         stance: number,
       },
       topicPhases: [                    // chronological, oldest first
         { topic: string, count: number },
         ...
       ],
     }

   The engine derives three metrics from tierMix per axis:
     purity     = forum / total              drives color saturation
     turbulence = (heat + stance) / total    drives wave amplitude and frequency
     clarity    = forum / (forum+echo+fog)   drives line crispness

   topicPhases is a chronological list of topic focus periods on that axis.
   Each phase says "I earned N rings on this axis while writing about topic T."
   Rings are colored by which topic was active when earned, so inner rings
   show old topic history and outer rings show recent topic history.

   resonance: number 0..1 — optional. How much the contributor's voice lands
   in the community. Drives the halo render: higher resonance = brighter,
   wider, more saturated halo extending outward from the silhouette.
   Resonance 0 disables the halo entirely.

   ─── OUTPUT ────────────────────────────────────────────────────────────────
   A single <svg> element. Pure render, no state, no callbacks.

   ─── PHILOSOPHY ────────────────────────────────────────────────────────────
   A six-axis identity artifact that grows with a contributor's history.

   AXES (three pairs from the platform philosophy):
     SUBSTANCE           : Specificity, Originality
     INTELLECTUAL HONESTY: Calibration, Charity
     ENGAGEMENT          : Discourse, Consistency

   CORE MODEL
   - Each axis owns a petal that blooms outward from a shared center.
   - Petals grow ring-by-ring as the contributor accumulates graduations.
   - Ring colors come from TOPIC HISTORY, not axis identity. Inner rings
     carry the topics the contributor wrote about when they started;
     outer rings carry their recent topic focus.
   - The SECOND MATRIX: each region's texture is modulated by the ratio of
     higher-tier to lower-tier comments behind that region. Calm regions
     come from Forum-heavy history; turbulent regions come from Heat and
     Stance history.
   - The HALO: when resonance > 0, a topic-colored light field follows the
     silhouette. The outer glow uses the dominant topic color. The inner
     bleed uses a tier-flavored variant of that color (tinted by the
     contributor's aggregate tier mix).
   ═══════════════════════════════════════════════════════════════════════════ */

export const ENGINE_VERSION = "1.0.0";

// ─── CANONICAL AXIS DEFINITIONS ─────────────────────────────────────────────
// Read-only. Changing any of these is a breaking change and requires a
// major version bump. The `color` and `colorDeep` values are fallbacks used
// only when topicPhases history is missing; active ring rendering uses
// topic colors from FINGERPRINT_TOPICS instead.
export const FINGERPRINT_AXES = Object.freeze([
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
export const FINGERPRINT_TOPICS = Object.freeze({
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
export const FINGERPRINT_THEMES = Object.freeze({
  light: {
    guideStroke:     "#e8e0d0",
    centerGlow:      "#b8862e",
    centerDot:       "#b8862e",
    labelColor:      "#5a5248",
    labelFontFamily: "'DM Mono', 'Courier New', monospace",
  },
  dark: {
    guideStroke:     "#3a342c",
    centerGlow:      "#d4a84a",
    centerDot:       "#d4a84a",
    labelColor:      "#b8ae9e",
    labelFontFamily: "'DM Mono', 'Courier New', monospace",
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

export function Fingerprint({
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

// ─── DATA BUILDERS ──────────────────────────────────────────────────────────

export function emptyFingerprint() {
  const data = {};
  for (const a of FINGERPRINT_AXES) {
    data[a.key] = {
      graduations: 0,
      tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 },
      topicPhases: [],
    };
  }
  return data;
}
