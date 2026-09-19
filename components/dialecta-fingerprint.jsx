import { useState, useEffect, useMemo, useId } from "react";

const DIALECTA_LOGO = ""; // logo blob scrubbed � see /Logos/ for source

/* ───────────────────────────────────────────────────────────────────────────
   DIALECTA — THINKING FINGERPRINT
   ───────────────────────────────────────────────────────────────────────────
   A six-axis identity artifact that grows with a contributor's history.

   AXES (three pairs from the platform philosophy):
     SUBSTANCE          : Specificity, Originality
     INTELLECTUAL HONESTY: Calibration, Charity
     ENGAGEMENT         : Discourse, Consistency

   CORE MODEL
   - Each axis owns a petal that blooms outward from a shared center.
   - Petals grow ring-by-ring as the contributor accumulates "graduations"
     on that axis. A petal with 0 graduations is just a seed point. A petal
     with 18+ graduations is a fully-formed bloom of layered curves.
   - The HYBRID TRACE model: the outermost 3 rings of any petal are rendered
     brighter and more distinct (recent activity). Older rings blend into the
     petal body at lower opacity (history mass).
   - The SECOND MATRIX: each petal's texture is subtly modulated by the
     ratio of higher-tier to lower-tier comments behind that axis. A petal
     built from mostly-Forum comments renders as smooth, confident curves.
     A petal built from a struggle through Heat and Spark on the way to
     Forum renders with more visible perturbation in its rings.
   ─────────────────────────────────────────────────────────────────────── */

// ─── Design tokens (Dialecta spec) ────────────────────────────────────────
const T = {
  bgPrimary:    "#f7f2e8",
  bgSecondary:  "#efe8da",
  bgTertiary:   "#e8dfce",
  bgWhite:      "#fffdf8",
  bgDark:       "#1c1814",
  bgDarkElev:   "#28231a",
  // Page background gradient stops (v1.2 spec — warm stone grays, not deep ink)
  bgStoneLight: "#a8a398",
  bgStoneDark:  "#8c8780",
  // Sub-nav metallic rail (v1.2 spec)
  bgRailLight:  "#eceae4",
  bgRailDark:   "#d8d4cc",
  textPrimary:  "#1c1814",
  textBody:     "#3a342c",
  textSecondary:"#5a5248",
  textTertiary: "#7a7068",
  textMuted:    "#9a8e80",
  textOnDark:   "#f0ebe0",
  textOnDark2:  "#b8ae9e",
  gold:         "#b8862e",
  goldBright:   "#d4a84a",
  goldMuted:    "#a07828",
  goldPale:     "#f5e8d0",
  amber:        "#b8732a",
  terra:        "#8c4a2f",
  borderLight:  "#e8e0d0",
  borderMedium: "#d8ceb8",
  borderDark:   "#c8bca4",
  borderRule:   "#b8732a",
  fontDisplay:  "'Cormorant Garamond', 'Times New Roman', serif",
  fontBody:     "'DM Sans', system-ui, sans-serif",
  fontReading:  "'Source Serif 4', Georgia, serif",
  fontMono:     "'DM Mono', 'Courier New', monospace",
};

// ─── Tier definitions (brightness ladder: lighter = higher quality) ──────
const TIERS = {
  forum:  { name: "The Forum",   short: "Forum",   gradTop: "#FEFBF0", gradBot: "#F8F0D8", border: "#E8D080", text: "#6A5410" },
  spark:  { name: "The Spark",   short: "Spark",   gradTop: "#FCF0D8", gradBot: "#F4D098", border: "#D89438", text: "#6A3C08" },
  echo:   { name: "The Echo",    short: "Echo",    gradTop: "#EAF0E0", gradBot: "#C8D8B0", border: "#708848", text: "#38440C" },
  fog:    { name: "The Fog",     short: "Fog",     gradTop: "#DCE0E4", gradBot: "#B0B8C4", border: "#687488", text: "#2C3848" },
  heat:   { name: "The Heat",    short: "Heat",    gradTop: "#E89868", gradBot: "#C46028", border: "#7C2C08", text: "#FCEAD8" },
  stance: { name: "The Stance",  short: "Stance",  gradTop: "#A8483C", gradBot: "#783028", border: "#401818", text: "#F4D8D0" },
  breach: { name: "Breach",      short: "Breach",  gradTop: "#6A1818", gradBot: "#380808", border: "#200404", text: "#F0C8C8" },
};

// ─── Axes definition ──────────────────────────────────────────────────────
// Each axis has:
//   key      — internal id
//   label    — display name
//   pair     — which philosophical pair it belongs to
//   color    — fallback hue (used for seed dots, legends, and as fallback when
//              topic history is missing; NOT used for active ring rendering
//              since rings now color by topic history instead)
//   colorDeep— darker fallback version
//   angle    — degrees on the wheel (0 = top, going clockwise)
//   meaning  — one-line philosophy for the legend
const AXES = [
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
];

// ─── Topic palette ────────────────────────────────────────────────────────
// Topics are the subject-matter categories a contributor can write about on
// Dialecta. Each topic has a canonical color used to render the rings of any
// petal that earned graduations from comments on that topic. The palette is
// designed to feel cohesive within Dialecta's warm, slightly-desaturated
// visual language.
const TOPICS = {
  renewable_energy: { label: "Renewable Energy", color: "#3d7a28", colorDeep: "#1e4412" },
  mental_health:    { label: "Mental Health",    color: "#4a6590", colorDeep: "#223553" },
  music:            { label: "Music",             color: "#6a3a9a", colorDeep: "#351848" },
  economics:        { label: "Economics",         color: "#c4871a", colorDeep: "#704608" },
  humanity:         { label: "Humanity & Society",color: "#9a4218", colorDeep: "#501e08" },
  political_science:{ label: "Political Science", color: "#a01f1f", colorDeep: "#500808" },
  psychology:       { label: "Psychology",        color: "#2a7480", colorDeep: "#124048" },
  acoustics:        { label: "Acoustics",         color: "#5c6a78", colorDeep: "#2e3640" },
  theology:         { label: "Theology",          color: "#c47014", colorDeep: "#683808" },
};

// ─── The fingerprint generator ────────────────────────────────────────────
// data: { specificity: { graduations: int 0-20, purity: 0-1 }, ... }
// graduations = how many rings this petal has earned
// purity = ratio of high-tier (Forum/Spark) to low-tier (Heat/Stance) behind it
//          purity 1.0 = smooth confident curves
//          purity 0.0 = perturbed wavy curves
function Fingerprint({
  data,
  size = 360,
  showLabels = true,
  showAxisLines = true,
  newRingAxis = null, // when set, animates the outer ring of that axis
  resonance = 0,      // 0..1 — how much the contributor's voice lands in the community
}) {
  // Unique instance ID used as a suffix on every SVG <defs> element (filters,
  // clipPaths). Multiple Fingerprint instances on the same page previously
  // collided because their defs IDs were keyed only on `size`, so two
  // instances rendering at size 200 both generated `fp-silhouette-clip-200`
  // and the browser resolved url(#...) references to whichever one rendered
  // first — meaning later fingerprints got CLIPPED to an earlier fingerprint's
  // silhouette. Visible as "ghost stamps" of other contributors' shapes
  // bleeding out of the current one. useId gives each instance a guaranteed-
  // unique suffix so every clipPath and filter is per-instance.
  const uid = useId().replace(/:/g, "");
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.42;       // outermost reach of any ring

  const fp = (() => {
  // ─── PARAMETERS ─────────────────────────────────────────────────────────
  const N_PERIMETER = 96;     // points sampled around each ring (16 per axis pair)
  const RADIUS_POWER = 0.85;  // closer to 1 = more dramatic asymmetry between strong and weak axes
  const MIN_AXIS_RADIUS_FACTOR = 0.04; // weakest axis still has tiny radius
  const TRADEOFF_PENALTY = 0.20; // 20% reduction when both competing axes are high

  // ─── TRADE-OFF PAIRS ────────────────────────────────────────────────────
  // Certain axes compete for the same cognitive budget — a contributor cannot
  // simultaneously max out both members of a pair. When two competing axes
  // are both high, each one's displayed radius is reduced. This makes circles
  // structurally impossible and forces every fingerprint into a real shape.
  //
  // - DEPTH ↔ NOVELTY: Specificity competes with Originality
  // - SOLO ↔ SOCIAL:    Specificity competes with Discourse
  // - VOLUME ↔ CARE:    Discourse competes with Calibration AND Charity
  const TRADEOFF_PAIRS = [
    ["specificity", "originality"],
    ["specificity", "discourse"],
    ["discourse", "calibration"],
    ["discourse", "charity"],
  ];

  // Find the maximum graduations across all axes
  const maxGrad = AXES.reduce(
    (m, a) => Math.max(m, Math.min(data?.[a.key]?.graduations || 0, 22)), 0
  );

  // Total contribution count drives the spine offset
  const totalGrad = AXES.reduce(
    (s, a) => s + Math.min(data?.[a.key]?.graduations || 0, 22), 0
  );
  const spineFactor = Math.min(totalGrad / 60, 1);
  const spineCx = cx;
  const spineCy = cy - (1 - spineFactor) * maxR * 0.18;

  // ─── PER-AXIS DERIVED METRICS FROM TIERMIX ──────────────────────────────
  // Each axis can carry either a legacy { graduations, purity } pair OR a
  // rich { graduations, tierMix } object. tierMix contains the count of
  // comments at each tier on that axis, e.g.:
  //   { forum: 12, spark: 4, echo: 1, fog: 0, heat: 2, stance: 0 }
  // From this we derive three behaviors that drive different visual properties:
  //   purity      = forum / total       — drives base color saturation
  //   turbulence  = (heat + stance) / total — drives wave amplitude & frequency
  //   clarity     = forum / (forum + echo + fog) — drives line crispness
  // If only the legacy purity number is present, we synthesize a tierMix
  // that matches it so old datasets keep working.
  function deriveAxisMetrics(axisKey) {
    const ax = data?.[axisKey];
    if (!ax || (ax.graduations || 0) === 0) {
      return { purity: 1, turbulence: 0, clarity: 1, total: 0 };
    }
    let mix = ax.tierMix;
    if (!mix) {
      // Legacy fallback: synthesize a tierMix from the purity number
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

  // Compute metrics for every axis up front
  const axisMetrics = AXES.map(a => deriveAxisMetrics(a.key));

  // ─── TOPIC HISTORY PER AXIS ────────────────────────────────────────────
  // For each axis, expand the topicPhases array (chunks of rings per topic)
  // into a flat per-ring array, so we can quickly look up which topic was
  // active when any given ring was earned. Topic colors flow innermost
  // (oldest) to outermost (newest) to encode the contributor's history of
  // topic focus as a visible gradient within each petal.
  //
  // Shape: axisTopicPerRing[axisIdx] = [topicKey, topicKey, ...] with length
  // equal to the graduation count on that axis.
  //
  // Fallback: if an axis has no topicPhases defined, every ring defaults to
  // the axis's fallback color via the null topic marker.
  const axisTopicPerRing = AXES.map(a => {
    const ax = data?.[a.key];
    if (!ax || !ax.topicPhases) return null;
    const flat = [];
    for (const phase of ax.topicPhases) {
      for (let i = 0; i < phase.count; i++) flat.push(phase.topic);
    }
    return flat;
  });

  // Given an axis index and a ring index k (0 = outermost, ringCount-1 = innermost
  // from the rendering loop's perspective — but note the rings are iterated with
  // k=0 at the OUTERMOST edge of the petal, so k=0 is the NEWEST ring and higher k
  // is OLDER). We want inner rings to show old topics and outer rings to show new
  // topics — so we index the flat array with (graduations - 1 - k) so k=0 gives
  // the last topic (newest) and higher k gives earlier topics.
  function topicAtRing(axisIdx, k) {
    const flat = axisTopicPerRing[axisIdx];
    if (!flat || flat.length === 0) return null;
    const axisGrad = axisRingCount[axisIdx];
    // Ring k=0 is the outermost (newest); the highest k is innermost (oldest).
    // The flat array is chronological [oldest, ..., newest], so newest is at the
    // END of the array. Map ring k to position (axisGrad - 1 - k) in the array.
    const idx = Math.max(0, Math.min(flat.length - 1, axisGrad - 1 - k));
    return flat[idx];
  }

  // Look up a topic's color, or return a neutral fallback gray.
  function topicColor(topicKey, deep = false) {
    if (!topicKey) return deep ? "#5a5248" : "#8a8278"; // neutral fallback
    const t = TOPICS[topicKey];
    if (!t) return deep ? "#5a5248" : "#8a8278";
    return deep ? t.colorDeep : t.color;
  }

  // Average purity across populated axes — kept for backward compat where used
  const populatedAxes = AXES.filter(a => (data?.[a.key]?.graduations || 0) > 0);
  const avgPurity = populatedAxes.length > 0
    ? populatedAxes.reduce((s, a, i) => {
        const idx = AXES.findIndex(x => x.key === a.key);
        return s + axisMetrics[idx].purity;
      }, 0) / populatedAxes.length
    : 0.8;

  // ─── COMPUTE TRADE-OFF FACTORS ──────────────────────────────────────────
  // For each axis, calculate how much its displayed radius should be reduced
  // based on its competing partners. The penalty grows with the partner's
  // raw graduation count, capped at TRADEOFF_PENALTY total.
  // Formula: penalty = sum over partners of (partner_grad/22) * TRADEOFF_PENALTY
  //          but capped at TRADEOFF_PENALTY * 1.5 (so multiple competing
  //          partners can compound but not destroy the axis)
  function tradeoffFactor(axisKey) {
    const grad = Math.min(data?.[axisKey]?.graduations || 0, 22);
    if (grad === 0) return 1; // no penalty for empty axes
    let totalPenalty = 0;
    for (const [a, b] of TRADEOFF_PAIRS) {
      let partnerKey = null;
      if (a === axisKey) partnerKey = b;
      else if (b === axisKey) partnerKey = a;
      if (!partnerKey) continue;
      const partnerGrad = Math.min(data?.[partnerKey]?.graduations || 0, 22);
      // Both axes need to be reasonably populated for the trade-off to bite
      // (a partner with grad=2 doesn't penalize you much)
      const partnerStrength = partnerGrad / 22;
      const myStrength = grad / 22;
      // Penalty is proportional to how strong BOTH are
      totalPenalty += partnerStrength * myStrength * TRADEOFF_PENALTY;
    }
    // Cap the total penalty so an axis can't be destroyed entirely
    totalPenalty = Math.min(totalPenalty, TRADEOFF_PENALTY * 1.5);
    return 1 - totalPenalty;
  }

  // ─── PER-AXIS MAX RADIUS ────────────────────────────────────────────────
  // Each axis has a maximum reach based on its graduation count, scaled by
  // a power curve and reduced by trade-off penalties from competing axes
  const axisMaxRadius = AXES.map(a => {
    const grad = Math.min(data?.[a.key]?.graduations || 0, 22);
    if (grad === 0) return 0;
    const t = grad / 22;
    const baseRadius = maxR * Math.pow(t, RADIUS_POWER);
    return baseRadius * tradeoffFactor(a.key);
  });

  // Each axis has a "ring count" — how many rings actually exist on this axis
  // Strong axes have more rings, weak axes have fewer
  const axisRingCount = AXES.map(a => Math.min(data?.[a.key]?.graduations || 0, 22));

  // ─── SEED STATE ─────────────────────────────────────────────────────────
  if (maxGrad === 0) {
    return {
      rings: [],
      seedDots: AXES.map(a => {
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
      maxR,
    };
  }

  // ─── INTERPOLATION HELPERS ──────────────────────────────────────────────
  // For any angle theta around the perimeter, compute:
  //   - the interpolated radius (based on the two nearest axis radii at this ring)
  //   - the interpolated color (blend of the two nearest axes' colors)
  //   - whether this point is "alive" at the current ring level
  //
  // Angle is normalized to 0..2pi where 0 = axis 0 (top, going clockwise via -90)

  // Convert axis index → its angle in 0..2pi space (measured clockwise from top)
  const axisAngles = AXES.map(a => (a.angle * Math.PI / 180));

  // Given a perimeter angle theta in 0..2pi, find the two adjacent axes
  // and the interpolation factor t between them (0 = axisA, 1 = axisB)
  function findAxisInterp(theta) {
    // Normalize theta to 0..2pi
    let t = ((theta % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    // Find the axis pair where axisA.angle <= t < axisB.angle
    for (let i = 0; i < AXES.length; i++) {
      const aA = axisAngles[i];
      const aB = axisAngles[(i + 1) % AXES.length];
      // Handle wrap-around between last axis and first
      let span;
      let local;
      if (aB > aA) {
        if (t >= aA && t < aB) {
          span = aB - aA;
          local = (t - aA) / span;
          return { idxA: i, idxB: (i + 1) % AXES.length, factor: local };
        }
      } else {
        // wraps around
        if (t >= aA || t < aB) {
          span = (Math.PI * 2 - aA) + aB;
          local = (t >= aA ? (t - aA) : (Math.PI * 2 - aA + t)) / span;
          return { idxA: i, idxB: (i + 1) % AXES.length, factor: local };
        }
      }
    }
    return { idxA: 0, idxB: 1, factor: 0 };
  }

  // Smooth interpolation curve — softer than linear, peaks at the axis points
  function smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  // Sharper blend curve for COLOR ONLY — holds each axis color across most
  // of its perimeter span and only blends rapidly at the very midpoint.
  // Result: pure color bands with crisp transitions, not muddy rainbows.
  function sharpBlend(t) {
    // Apply smoothstep twice for an even sharper S-curve
    const s = smoothstep(t);
    return smoothstep(s);
  }

  // Multi-octave noise — produces rich organic wiggle along the perimeter
  function perimeterNoise(theta, ringSeed) {
    const s1 = Math.sin(theta * 7.3 + ringSeed * 1.7) * 0.5;
    const s2 = Math.sin(theta * 13.1 + ringSeed * 3.3 + 1.4) * 0.3;
    const s3 = Math.sin(theta * 21.7 + ringSeed * 5.9 + 2.7) * 0.2;
    const s4 = Math.sin(theta * 4.1 + ringSeed * 0.7) * 0.15;
    return s1 + s2 + s3 + s4; // ~ -1.15 .. 1.15
  }

  // Turbulence wave — a separate, slower-moving wave system that produces
  // visible wave patterns in regions of the fingerprint that come from
  // turbulent tier history (Heat + Stance comments). Calm regions get
  // none of this; turbulent regions get a strong contribution.
  // The wave frequency varies with turbulence level: low turbulence = slow
  // gentle swells; high turbulence = fast choppy waves.
  function turbulenceWave(theta, ringSeed, turbulence) {
    if (turbulence < 0.01) return 0;
    // Frequency scales with turbulence: 3 (calm) to 11 (chaotic)
    const freq = 3 + turbulence * 8;
    const w1 = Math.sin(theta * freq + ringSeed * 0.4) * 0.7;
    const w2 = Math.sin(theta * (freq * 1.8) + ringSeed * 0.9 + 1.1) * 0.4;
    const w3 = Math.sin(theta * (freq * 0.5) + ringSeed * 0.2 + 2.3) * 0.5;
    return (w1 + w2 + w3) * turbulence; // amplitude scales with turbulence
  }

  // Hex string color blending
  function blendColors(hexA, hexB, t) {
    const a = parseInt(hexA.slice(1), 16);
    const b = parseInt(hexB.slice(1), 16);
    const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
    const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;
    const r = Math.round(ar + (br - ar) * t);
    const g = Math.round(ag + (bg - ag) * t);
    const bl = Math.round(ab + (bb - ab) * t);
    return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`;
  }

  // ─── BUILD RINGS ────────────────────────────────────────────────────────
  // Total ring count: scaled with maxGrad, but with a baseline so even small
  // fingerprints have visible texture. Max graduations of 22 → ~26 rings.
  const ringCount = Math.max(4, Math.round(maxGrad * 1.15 + 4));

  const rings = [];
  for (let k = 0; k < ringCount; k++) {
    // ringDepth: 0 = outermost, 1 = innermost (closer to center)
    const ringDepth = k / (ringCount - 1);

    // Each ring has its own noise seed so adjacent rings wiggle differently
    const ringSeed = k * 11.7 + 3.3;

    // Build a closed path by sampling N_PERIMETER points around the loop
    const points = [];
    for (let p = 0; p < N_PERIMETER; p++) {
      const theta = (p / N_PERIMETER) * Math.PI * 2;
      const interp = findAxisInterp(theta);

      // For each of the two adjacent axes, find this ring's radius on that axis.
      // CRITICAL: every axis uses the SAME global ring depth, so all rings
      // descend toward the center together. This eliminates the phantom
      // inner silhouette that appeared when axes descended at different rates.
      // A center clearance keeps the innermost ring a comfortable distance
      // from the spine point so the descent doesn't bunch up.
      function ringRadiusOnAxis(idx) {
        const grad = axisRingCount[idx];
        const axisMax = axisMaxRadius[idx];
        if (grad === 0) return maxR * MIN_AXIS_RADIUS_FACTOR;
        // Global depth: 0 = outermost, 1 = innermost
        const globalDepth = k / Math.max(1, ringCount - 1);
        // Center clearance — innermost ring sits at 8% of maxR, not at the point
        const centerClearance = maxR * 0.08;
        // Linear descent from axisMax (outermost) to centerClearance (innermost)
        return axisMax * (1 - globalDepth) + centerClearance * globalDepth;
      }

      const rA = ringRadiusOnAxis(interp.idxA);
      const rB = ringRadiusOnAxis(interp.idxB);

      // Smooth interpolation between the two axis radii
      const blend = smoothstep(interp.factor);
      let radius = rA * (1 - blend) + rB * blend;

      // ─── PER-POINT TIER METRICS ─────────────────────────────────────────
      // Interpolate the two adjacent axes' tier-derived metrics so wave
      // behavior is LOCAL to the region of the fingerprint, not global.
      // A contributor with calm Specificity but turbulent Discourse will
      // see calm waters at the top and choppy waves at the bottom.
      const mA = axisMetrics[interp.idxA];
      const mB = axisMetrics[interp.idxB];
      const localPurity     = mA.purity     * (1 - blend) + mB.purity     * blend;
      const localClarity    = mA.clarity    * (1 - blend) + mB.clarity    * blend;

      // Sharpened axis-local weighting for turbulence and maturity.
      // Linear crossfade (1-blend, blend) would let a highly-turbulent axis
      // bleed halfway into its calm neighbor. We sharpen the falloff so each
      // axis's influence stays concentrated near its own angle and drops off
      // rapidly toward the midpoint between neighbors. A point right at the
      // midpoint (blend=0.5) gets only ~0.177 weight from each side instead
      // of 0.5 — so turbulence on Specificity no longer leaks into Originality.
      const FALLOFF = 2.5;
      const wA = Math.pow(1 - blend, FALLOFF);
      const wB = Math.pow(blend,     FALLOFF);
      const localTurbulence = mA.turbulence * wA + mB.turbulence * wB;

      // Local maturity — how many graduations does the axis (or axes)
      // influencing this point have? Same sharpened falloff. This lets the
      // wave amplitude scale up dramatically as contributors become mature,
      // so a Newborn with high turbulence still shows only subtle waves but
      // a Mature contributor with the same turbulence shows dramatic ones.
      const gA = axisRingCount[interp.idxA];
      const gB = axisRingCount[interp.idxB];
      const localMaturity = gA * wA + gB * wB; // 0 .. ~22

      // Base organic noise — small constant wobble everywhere, plus a bit
      // more on lower-purity regions and outer rings (recent activity)
      const baseNoiseAmp = ((1 - localPurity) * 4 + 1.8) * (1 + (1 - ringDepth) * 0.4);
      const baseNoise = perimeterNoise(theta, ringSeed) * baseNoiseAmp;

      // Turbulence wave — visible waves in turbulent regions, calm elsewhere.
      // Amplitude now scales with TWO things:
      //   1. Recency — outer rings get full turbulence, inner rings settled
      //      (recencyMultiplier: 0.3 innermost → 1.0 outermost)
      //   2. Maturity — a mature axis (high graduation count) produces a
      //      much larger amplitude range than a newborn axis. maturityMultiplier
      //      climbs from 0.4 (0 graduations) to 2.5 (22 graduations).
      //      This makes turbulence feel like real lived history on mature
      //      fingerprints and keeps newborn fingerprints from looking dramatic
      //      before they've earned it.
      const recencyMultiplier = 0.3 + (1 - ringDepth) * 0.7;
      const maturityMultiplier = 0.4 + Math.min(localMaturity / 22, 1) * 2.1;
      const waveAmp = 9 * recencyMultiplier * maturityMultiplier;
      const wave = turbulenceWave(theta, ringSeed, localTurbulence) * waveAmp;

      radius += baseNoise + wave;

      // Position in absolute coordinates
      const x = spineCx + Math.cos(theta - Math.PI / 2) * radius;
      const y = spineCy + Math.sin(theta - Math.PI / 2) * radius;

      // Color at this point — uses topic history per ring instead of axis identity.
      // Each axis knows which topic was active at each ring in its history. We
      // look up the topic at this specific ring index for each of the two
      // adjacent axes, then blend the two topic colors using the sharp blend
      // curve so the topic transitions at axis boundaries are crisp.
      const colorBlend = sharpBlend(interp.factor);
      const topicA = topicAtRing(interp.idxA, k);
      const topicB = topicAtRing(interp.idxB, k);
      // Fallback to axis-identity color if topic history is missing
      const axisA = AXES[interp.idxA];
      const axisB = AXES[interp.idxB];
      const colorA     = topicA ? topicColor(topicA, false) : axisA.color;
      const colorDeepA = topicA ? topicColor(topicA, true)  : axisA.colorDeep;
      const colorB     = topicB ? topicColor(topicB, false) : axisB.color;
      const colorDeepB = topicB ? topicColor(topicB, true)  : axisB.colorDeep;
      const color     = blendColors(colorA,     colorB,     colorBlend);
      const colorDeep = blendColors(colorDeepA, colorDeepB, colorBlend);

      // localStrength: how "earned" is this point's position?
      // Interpolate the two adjacent axes' graduation counts (0..22 normalized).
      // Stronger axes produce thicker lines at their crossings — the fingerprint
      // visibly thickens where the contributor has put more energy, like a
      // physical fingerprint with heavier ridges where pressure was applied.
      const gradA = axisRingCount[interp.idxA] / 22;
      const gradB = axisRingCount[interp.idxB] / 22;
      const localStrength = gradA * (1 - blend) + gradB * blend; // 0..1

      points.push({ x, y, color, colorDeep, localStrength, localClarity, localTurbulence });
    }

    // Build the closed SVG path through all perimeter points using Catmull-Rom
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

    // Categorize: silhouette (k=0), outer band (k=1,2), interior (k≥3)
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
      // Interior fades toward center but stays visible enough to read color
      const interiorDepth = (k - 3) / Math.max(1, ringCount - 4);
      opacity = Math.max(0.22, 0.55 - interiorDepth * 0.30);
      strokeWidth = 1.25;
    }

    // Use a representative color: the average color of the outermost arc on
    // this ring's brightest axis. For the silhouette specifically, render
    // each segment with its own gradient so the color wraps around the loop.
    rings.push({
      ringK: k,
      d,
      points, // keep points for per-segment color rendering on the silhouette
      category,
      opacity,
      strokeWidth,
      isNew: k === 0 && newRingAxis !== null,
    });
  }

  // Reverse so interior rings draw first (deep), silhouette draws last (top)
  rings.reverse();

  // ─── HALO COMPUTATION ────────────────────────────────────────────────────
  // The resonance halo needs two things that aren't in the ring data itself:
  // (1) a dominant topic color, derived from the contributor's total writing
  // across all axes, and (2) a smoothed silhouette path that averages out the
  // petal-level asymmetry for a softer, more flowing halo shape.

  // (1) Dominant topic: sum graduations per topic across all axes, pick winner
  let dominantTopic = null;
  {
    const topicCounts = {};
    for (const a of AXES) {
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

  // (1b) Tier-flavored inner color: the inner bleed (which fills the
  // silhouette interior) gets tinted by the contributor's aggregate tier
  // mix across all axes. This lets the inner glow carry a second signal
  // beyond topic: the "flavor" of how the contributor earned their rings.
  //   - High Forum ratio → brighten, stay true to the topic color
  //   - High Fog ratio → shift toward murky gray (the flavor of vagueness)
  //   - High Heat ratio → shift toward warm orange (the flavor of anger)
  //   - High Stance ratio → shift toward deep red (the flavor of tribalism)
  // Each shift is proportional to that tier's ratio of total graduations.
  let innerColor = haloColor;
  {
    const totals = { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 };
    let total = 0;
    for (const a of AXES) {
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
      // Blend the topic color toward each flavor hue by its ratio. Stance
      // and Heat have non-linear weights because they feel distinctive at
      // lower ratios than Fog does — a little Heat goes a long way visually.
      let c = haloColor;
      if (fogRatio > 0)    c = blendColors(c, "#8a8680", Math.min(1, fogRatio * 2.2));
      if (heatRatio > 0)   c = blendColors(c, "#c45818", Math.min(1, heatRatio * 2.8));
      if (stanceRatio > 0) c = blendColors(c, "#6a1010", Math.min(1, stanceRatio * 3.2));
      innerColor = c;
    }
  }

  // (2) Halo path: use the raw silhouette path directly — no smoothing, no
  // averaging. The halo should follow the fingerprint shape exactly and only
  // differ in its blur and stroke width. Previous smoothing approaches (moving
  // average, running-max valley fill) both introduced visible drift between
  // the silhouette and the halo which read as an empty gap.
  const silhouettePath = (() => {
    const silhouette = rings.find(r => r.ringK === 0);
    return silhouette ? silhouette.d : null;
  })();

  return { rings, seedDots: [], spineCx, spineCy, maxR, ringCount,
           haloColor, haloColorDeep, innerColor, silhouettePath };
  })();

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
         style={{ display: "block", overflow: "visible" }}>
      <defs>
        <radialGradient id={`fp-center-glow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b8862e" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#b8862e" stopOpacity="0" />
        </radialGradient>
        {/* Crispness ladder — line segments pick a blur filter based on
            local clarity. Crisp = clean tier history. Diffuse = messy.
            These are suffixed per instance to prevent id collisions across
            multiple Fingerprint components on the same page. */}
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

      {/* Faint guide circle — the "potential" ring */}
      <circle cx={cx} cy={cy} r={maxR} fill="none"
              stroke={T.borderLight} strokeWidth="0.5"
              strokeDasharray="2 4" opacity="0.5" />

      {/* Center glow */}
      <circle cx={fp.spineCx} cy={fp.spineCy} r={maxR * 0.5}
              fill={`url(#fp-center-glow-${uid})`} />

      {/* Axis tick lines (very faint) */}
      {showAxisLines && AXES.map(a => {
        const rad = (a.angle - 90) * Math.PI / 180;
        const x2 = fp.spineCx + Math.cos(rad) * maxR;
        const y2 = fp.spineCy + Math.sin(rad) * maxR;
        return (
          <line key={a.key} x1={fp.spineCx} y1={fp.spineCy} x2={x2} y2={y2}
                stroke={T.borderLight} strokeWidth="0.5" opacity="0.4" />
        );
      })}

      {/* SEED DOTS — for newborn fingerprints */}
      {fp.seedDots.map((dot, i) => (
        <circle key={`seed-${i}`} cx={dot.x} cy={dot.y} r={3}
                fill={dot.color} opacity="0.55" />
      ))}

      {/* Resonance glow — a topic-colored light field that follows the
          fingerprint silhouette exactly. Three outer blur layers throw light
          outward from the silhouette edge, and a clipped inner stroke layer
          bleeds light inward from the edge. Together they produce a continuous
          glow centered on the silhouette boundary, so the fingerprint reads as
          a luminous object rather than a shape with a separate cloud nearby.
          Throw distance, opacity, and blur all scale with resonance so the
          difference between low and high reception is visually dramatic. */}
      {resonance > 0 && fp.silhouettePath && (() => {
        // Compress low resonance, expand high resonance so the range feels
        // wider than linear. resonance^0.7 gives more separation at low values.
        const rCurve = Math.pow(resonance, 0.7);
        const baseW   = 1.5 + rCurve * 8;
        const baseOp  = 0.15 + rCurve * 0.7;
        const blurNear = 3 + rCurve * 10;
        const blurFar  = 8 + rCurve * 22;
        const clipId   = `fp-silhouette-clip-${uid}`;
        return (
          <g style={{ pointerEvents: "none" }}>
            <defs>
              <filter id={`fp-halo-glow-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation={blurNear} />
              </filter>
              <filter id={`fp-halo-glow-wide-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={blurFar} />
              </filter>
              {/* ClipPath keeps the inner glow stroke contained within the
                  silhouette boundary — without this, the inward stroke would
                  extend outward beyond the silhouette and merge with the halo. */}
              <clipPath id={clipId}>
                <path d={fp.silhouettePath} />
              </clipPath>
            </defs>

            {/* ── OUTER THROW — glow extending outward from the silhouette ── */}
            {/* Widest, softest outer bleed */}
            <path
              d={fp.silhouettePath}
              fill="none"
              stroke={fp.haloColor}
              strokeWidth={baseW * 3.5}
              opacity={baseOp * 0.22}
              filter={`url(#fp-halo-glow-wide-${uid})`}
            />
            {/* Medium throw */}
            <path
              d={fp.silhouettePath}
              fill="none"
              stroke={fp.haloColor}
              strokeWidth={baseW * 2}
              opacity={baseOp * 0.5}
              filter={`url(#fp-halo-glow-${uid})`}
            />
            {/* Tight saturated edge */}
            <path
              d={fp.silhouettePath}
              fill="none"
              stroke={fp.haloColorDeep}
              strokeWidth={baseW * 0.9}
              opacity={baseOp * 0.9}
              filter={`url(#fp-halo-glow-${uid})`}
            />

            {/* ── INNER BLEED — glow extending inward from the silhouette,
                clipped to stay inside the fingerprint. Uses the tier-flavored
                inner color: the topic color tinted by the contributor's
                aggregate tier mix. A clean Forum contributor's interior reads
                in pure topic color; a Fog-heavy contributor's reads murky
                gray-tinted; a Heat/Stance contributor's reads warm-toward-red. ── */}
            <g clipPath={`url(#${clipId})`}>
              <path
                d={fp.silhouettePath}
                fill="none"
                stroke={fp.innerColor}
                strokeWidth={baseW * 6}
                opacity={baseOp * 0.35}
                filter={`url(#fp-halo-glow-${uid})`}
              />
              <path
                d={fp.silhouettePath}
                fill="none"
                stroke={fp.innerColor}
                strokeWidth={baseW * 3}
                opacity={baseOp * 0.5}
                filter={`url(#fp-halo-glow-${uid})`}
              />
            </g>
          </g>
        );
      })()}

      {/* RINGS — every ring rendered as 96 colored sub-segments so the
           per-axis hue carries through every line, with smooth blending
           between adjacent axes. Stroke width varies along the perimeter
           with axis strength: lines thicken on strong axes (where the
           contributor has put more energy) and taper to delicate threads
           on weak axes — like a real fingerprint's ridges. */}
      {fp.rings.map((ring) => (
        <g key={`ring-${ring.ringK}`}>
          {ring.points.map((pt, j) => {
            const next = ring.points[(j + 1) % ring.points.length];
            // Silhouette uses deep color tones; outer band and interior use base colors
            const color = ring.category === "silhouette" ? pt.colorDeep : pt.color;
            // Variable stroke width: average the two endpoints' localStrength
            // and scale the base width by 0.55 (weak) to 1.45 (strong)
            const avgStrength = (pt.localStrength + next.localStrength) / 2;
            const widthScale = 0.55 + avgStrength * 0.90;
            const sw = ring.strokeWidth * widthScale;
            // Clarity-based blur — high clarity = crisp; low clarity = diffuse
            // Messy regions render slightly out of focus
            const avgClarity = (pt.localClarity + next.localClarity) / 2;
            const filterId = avgClarity > 0.75 ? `fp-crisp-${uid}`
                           : avgClarity > 0.45 ? `fp-soft-${uid}`
                           : `fp-diffuse-${uid}`;
            return (
              <line
                key={`r${ring.ringK}-p${j}`}
                x1={pt.x} y1={pt.y}
                x2={next.x} y2={next.y}
                stroke={color}
                strokeWidth={sw}
                strokeLinecap="round"
                opacity={ring.opacity}
                filter={`url(#${filterId})`}
                style={ring.isNew ? {
                  animation: "fp-grow 1.4s cubic-bezier(0.4, 0, 0.2, 1) both",
                } : undefined}
              />
            );
          })}
        </g>
      ))}

      {/* Center anchor dot — sits at the spine center */}
      <circle cx={fp.spineCx} cy={fp.spineCy} r={3} fill={T.gold} opacity="0.85" />
      <circle cx={fp.spineCx} cy={fp.spineCy} r={5} fill="none"
              stroke={T.gold} strokeWidth="0.5" opacity="0.4" />

      {/* Axis labels */}
      {showLabels && AXES.map(a => {
        const rad = (a.angle - 90) * Math.PI / 180;
        const labelR = maxR + 28;
        const x = cx + Math.cos(rad) * labelR;
        const y = cy + Math.sin(rad) * labelR;
        return (
          <text key={a.key} x={x} y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily={T.fontMono}
                fontSize="10"
                letterSpacing="0.1em"
                fill={T.textSecondary}
                style={{ textTransform: "uppercase" }}>
            {a.label}
          </text>
        );
      })}

      <style>{`
        @keyframes fp-grow {
          0%   { opacity: 0; stroke-width: 0.4; }
          50%  { opacity: 1; stroke-width: 2.4; }
          100% { opacity: 0.92; stroke-width: 1.6; }
        }
      `}</style>
    </svg>
  );
}

// ─── Demo data builders ───────────────────────────────────────────────────
// Each axis carries a tierMix object: the actual count of comments at each
// tier on that axis. The generator derives purity, turbulence, and clarity
// from this — these in turn drive radius, wave amplitude, wave frequency,
// stroke thickness, color saturation, and line crispness.
//
// tierMix shape: { forum, spark, echo, fog, heat, stance }
//   forum  = highest tier (counts toward purity & clarity)
//   spark  = developing claims (neutral)
//   echo   = restating (counts against clarity)
//   fog    = unclear (counts against clarity)
//   heat   = emotional without claim (counts toward turbulence)
//   stance = tribal/rhetorical (counts toward turbulence — strongest signal)
// Stages of Growth — ONE contributor over time. Same person, same character,
// increasingly developed. Arrives curious about her own mental health,
// gradually broadens into clinical psychology, eventually engages with the
// philosophical questions that psychology opens up (humanity). Her early
// Discourse rings carry emotional Heat from venting posts; her mature rings
// are calmer but the old Heat still lives in her Discourse core. Each stage
// uses the full engine (topicPhases driving ring colors, resonance driving
// halos, tierMix driving turbulence and inner bleed).
const STAGE_DATA = {
  newborn: {
    label: "Newborn",
    sublabel: "0 comments",
    description: "Six seed points marking the potential of who you could become. The center holds.",
    resonance: 0,
    data: {
      specificity: { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
      calibration: { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
      charity:     { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
      discourse:   { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
      consistency: { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
      originality: { graduations: 0, tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 }, topicPhases: [] },
    }
  },
  early: {
    label: "Early",
    sublabel: "~5 comments",
    description: "First petals appear. A young reader arrives writing about her own experience with anxiety. Her first posts are emotional and unformed — more venting than claiming. Her Discourse axis already carries Heat from those raw first comments. The fingerprint is small and tilted toward the bottom: she's speaking before she's thinking.",
    resonance: 0.06,
    data: {
      specificity: {
        graduations: 3,
        tierMix: { forum: 1, spark: 2, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 3 },
        ],
      },
      calibration: {
        graduations: 2,
        tierMix: { forum: 0, spark: 2, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 2 },
        ],
      },
      charity: {
        graduations: 1,
        tierMix: { forum: 0, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 1 },
        ],
      },
      discourse: {
        graduations: 2,
        tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 2, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 2 },
        ],
      },
      consistency: {
        graduations: 1,
        tierMix: { forum: 0, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 1 },
        ],
      },
      originality: {
        graduations: 1,
        tierMix: { forum: 0, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 1 },
        ],
      },
    }
  },
  emerging: {
    label: "Emerging",
    sublabel: "~50 comments",
    description: "A character begins to show. She's been reading and learning — her mental-health experience is still the foundation, but psychology is appearing in her recent rings. Her Discourse axis still carries the old Heat in its inner rings, but the outer rings are calming down. Calibration is growing — she's learning to update her positions publicly rather than dig in. A few Fog patches mark the places where she's reaching beyond what she fully understands.",
    resonance: 0.38,
    data: {
      specificity: {
        graduations: 11,
        tierMix: { forum: 6, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 5 },
          { topic: "mental_health", count: 3 },
          { topic: "psychology",    count: 3 },
        ],
      },
      calibration: {
        graduations: 9,
        tierMix: { forum: 4, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 4 },
          { topic: "mental_health", count: 2 },
          { topic: "psychology",    count: 3 },
        ],
      },
      charity: {
        graduations: 6,
        tierMix: { forum: 3, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 3 },
          { topic: "psychology",    count: 3 },
        ],
      },
      discourse: {
        graduations: 8,
        tierMix: { forum: 3, spark: 2, echo: 0, fog: 1, heat: 2, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 5 },
          { topic: "psychology",    count: 3 },
        ],
      },
      consistency: {
        graduations: 10,
        tierMix: { forum: 5, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 5 },
          { topic: "mental_health", count: 2 },
          { topic: "psychology",    count: 3 },
        ],
      },
      originality: {
        graduations: 5,
        tierMix: { forum: 2, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 2 },
          { topic: "psychology",    count: 3 },
        ],
      },
    }
  },
  mature: {
    label: "Mature",
    sublabel: "200+ comments",
    description: "A fully-formed identity. Her innermost rings are blue — her early writing about her own anxiety is still part of her foundation. Her middle rings are teal — the clinical psychology she spent the most time writing about. Her outer rings are warm brown — she's currently engaging with the philosophical questions that psychology opens up. Her Discourse petal still carries a small Heat core, the learning scar of someone who arrived writing from feeling and figured out how to reason. Psychology is her dominant territory now, and her halo reads teal.",
    resonance: 0.71,
    data: {
      specificity: {
        graduations: 19,
        tierMix: { forum: 14, spark: 3, echo: 2, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 4 },
          { topic: "psychology",    count: 5 },
          { topic: "psychology",    count: 5 },
          { topic: "humanity",      count: 5 },
        ],
      },
      calibration: {
        graduations: 17,
        tierMix: { forum: 13, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 3 },
          { topic: "psychology",    count: 5 },
          { topic: "psychology",    count: 5 },
          { topic: "humanity",      count: 4 },
        ],
      },
      charity: {
        graduations: 14,
        tierMix: { forum: 11, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 3 },
          { topic: "psychology",    count: 4 },
          { topic: "psychology",    count: 4 },
          { topic: "humanity",      count: 3 },
        ],
      },
      discourse: {
        // Small Heat core in the innermost rings — her early emotional posts
        graduations: 13,
        tierMix: { forum: 8, spark: 2, echo: 1, fog: 0, heat: 2, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 4 },
          { topic: "psychology",    count: 4 },
          { topic: "psychology",    count: 3 },
          { topic: "humanity",      count: 2 },
        ],
      },
      consistency: {
        graduations: 18,
        tierMix: { forum: 14, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 4 },
          { topic: "psychology",    count: 5 },
          { topic: "psychology",    count: 5 },
          { topic: "humanity",      count: 4 },
        ],
      },
      originality: {
        graduations: 11,
        tierMix: { forum: 6, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health", count: 2 },
          { topic: "psychology",    count: 3 },
          { topic: "humanity",      count: 6 },
        ],
      },
    }
  },
};

// Hero profile selector — three realistic Dialecta contributors with
// distinct personalities, topic histories, and reception patterns. Each one
// has graduations per axis, a tier history, a topicPhases chronology
// (oldest first) driving the ring colors, and a resonance score driving the
// outer halo.
const HERO_PROFILES = {
  maya: {
    label: "Maya Reiss",
    sublabel: "The Careful Reader",
    description: "Retired librarian, 18 months on Dialecta, about 70 comments. Writes weekly and carefully, mostly about theology with strong secondary interests in mental health and psychology. Updates her positions publicly when the evidence shifts. Her fingerprint is modest in size but very clean on her signature axes — Calibration and Charity carry the weight. The Discourse petal is small because she reads more than she replies. Moderate resonance: thoughtful readers notice her, but she doesn't engage enough to accumulate the strong social signal of a daily poster.",
    resonance: 0.58,
    data: {
      specificity: {
        graduations: 14,
        tierMix: { forum: 10, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 5 },
          { topic: "mental_health", count: 4 },
          { topic: "theology",      count: 3 },
          { topic: "psychology",    count: 2 },
        ],
      },
      calibration: {
        graduations: 17,
        tierMix: { forum: 13, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 6 },
          { topic: "mental_health", count: 5 },
          { topic: "theology",      count: 3 },
          { topic: "psychology",    count: 3 },
        ],
      },
      charity: {
        graduations: 15,
        tierMix: { forum: 12, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 5 },
          { topic: "mental_health", count: 4 },
          { topic: "theology",      count: 4 },
          { topic: "psychology",    count: 2 },
        ],
      },
      discourse: {
        graduations: 5,
        tierMix: { forum: 2, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 3 },
          { topic: "mental_health", count: 2 },
        ],
      },
      consistency: {
        graduations: 11,
        tierMix: { forum: 7, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 4 },
          { topic: "mental_health", count: 3 },
          { topic: "theology",      count: 2 },
          { topic: "psychology",    count: 2 },
        ],
      },
      originality: {
        graduations: 9,
        tierMix: { forum: 4, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 3 },
          { topic: "mental_health", count: 3 },
          { topic: "psychology",    count: 3 },
        ],
      },
    },
  },
  wen: {
    label: "Wen Zhao",
    sublabel: "The Engaged Enthusiast",
    description: "Software engineer, 34, six months on Dialecta and almost daily. Arrived politically fired up and learned the hard way — his early Discourse rings carry visible Heat and Stance from political fights that have since calmed. These days he writes mostly about music theory, acoustics, and the cross-domain patterns he sees as an engineer. His inner rings are red with the old political heat; his outer rings are purple with his current music interests. Moderate and rising resonance: the community has started to notice him maturing.",
    resonance: 0.54,
    data: {
      specificity: {
        graduations: 9,
        tierMix: { forum: 5, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "music",             count: 4 },
          { topic: "acoustics",         count: 3 },
        ],
      },
      calibration: {
        graduations: 9,
        tierMix: { forum: 4, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "music",             count: 4 },
          { topic: "humanity",          count: 3 },
        ],
      },
      charity: {
        graduations: 10,
        tierMix: { forum: 5, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 3 },
          { topic: "music",             count: 4 },
          { topic: "humanity",          count: 3 },
        ],
      },
      discourse: {
        // Signature axis — the Heat/Stance lives in the inner (oldest) rings,
        // the outer rings are calmer. Visible learning history.
        graduations: 17,
        tierMix: { forum: 6, spark: 3, echo: 1, fog: 0, heat: 5, stance: 2 },
        topicPhases: [
          { topic: "political_science", count: 5 },
          { topic: "political_science", count: 3 },
          { topic: "music",             count: 4 },
          { topic: "music",             count: 3 },
          { topic: "humanity",          count: 2 },
        ],
      },
      consistency: {
        graduations: 19,
        tierMix: { forum: 13, spark: 4, echo: 2, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 3 },
          { topic: "music",             count: 5 },
          { topic: "acoustics",         count: 4 },
          { topic: "humanity",          count: 3 },
          { topic: "music",             count: 4 },
        ],
      },
      originality: {
        // Wen's signature strength — sees cross-domain patterns
        graduations: 16,
        tierMix: { forum: 9, spark: 5, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "music",             count: 5 },
          { topic: "acoustics",         count: 4 },
          { topic: "humanity",          count: 2 },
          { topic: "music",             count: 3 },
        ],
      },
    },
  },
  anselm: {
    label: "Father Anselm Okafor",
    sublabel: "The Domain Specialist",
    description: "Catholic priest and theology teacher, 68, ten months on Dialecta and about 90 comments. Almost everything he writes is theology — the small blue inflections in his Calibration and Discourse come from pastoral conversations where psychology and mental health touch his work. Deep Forum-tier specificity, academically-trained charity toward opposing positions, a small Heat streak on Discourse when doctrine is challenged. Very low Originality — he works within the tradition rather than inventing new framings, and he wouldn't have it any other way. Resonance within his domain is strong but not stratospheric; he's read carefully by a smaller circle.",
    resonance: 0.65,
    data: {
      specificity: {
        graduations: 19,
        tierMix: { forum: 15, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology", count: 7 },
          { topic: "theology", count: 6 },
          { topic: "theology", count: 6 },
        ],
      },
      calibration: {
        graduations: 11,
        tierMix: { forum: 7, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 4 },
          { topic: "psychology",    count: 2 },
          { topic: "theology",      count: 3 },
          { topic: "mental_health", count: 2 },
        ],
      },
      charity: {
        graduations: 15,
        tierMix: { forum: 11, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 5 },
          { topic: "theology",      count: 4 },
          { topic: "mental_health", count: 2 },
          { topic: "theology",      count: 4 },
        ],
      },
      discourse: {
        // Small Heat history from doctrine defense, mostly Forum otherwise
        graduations: 13,
        tierMix: { forum: 8, spark: 2, echo: 0, fog: 1, heat: 2, stance: 0 },
        topicPhases: [
          { topic: "theology",      count: 5 },
          { topic: "theology",      count: 4 },
          { topic: "mental_health", count: 2 },
          { topic: "theology",      count: 2 },
        ],
      },
      consistency: {
        graduations: 12,
        tierMix: { forum: 8, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology", count: 4 },
          { topic: "theology", count: 4 },
          { topic: "theology", count: 4 },
        ],
      },
      originality: {
        // Intentionally very low — theologians prize fidelity over novelty
        graduations: 4,
        tierMix: { forum: 3, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "theology", count: 2 },
          { topic: "theology", count: 2 },
        ],
      },
    },
  },
};

// Archetype example fingerprints — demonstrate how different intellectual
// personalities produce distinct shapes from the same six axes
// Four archetypes that emerge from trade-off geometry and engagement patterns.
// Each one runs the full engine with topicPhases driving ring colors,
// resonance driving halos, and tierMix driving turbulence and inner bleed.
// These are not users — they're geometric profiles that reveal what the
// fingerprint system can say about intellectual character.
const ARCHETYPE_DATA = {
  specialist: {
    label: "The Specialist",
    description: "All-in on one dimension. Specificity reaches the rim with near-pristine tier history — almost every comment a Forum-tier claim. Discourse and Originality barely register. The shape is unmistakably tall and the strong side runs perfectly calm. This archetype is a theoretical acoustician — someone who works almost entirely inside one domain, writing with extreme precision about wave physics, room resonance, and signal behavior. Almost monochromatic slate, because nothing else gets her attention.",
    resonance: 0.62,
    data: {
      specificity: {
        graduations: 21,
        tierMix: { forum: 18, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 8 },
          { topic: "acoustics", count: 7 },
          { topic: "acoustics", count: 6 },
        ],
      },
      calibration: {
        graduations: 9,
        tierMix: { forum: 6, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 4 },
          { topic: "acoustics", count: 5 },
        ],
      },
      charity: {
        graduations: 7,
        tierMix: { forum: 4, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 3 },
          { topic: "acoustics", count: 4 },
        ],
      },
      discourse: {
        graduations: 3,
        tierMix: { forum: 1, spark: 1, echo: 0, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 3 },
        ],
      },
      consistency: {
        graduations: 11,
        tierMix: { forum: 8, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 5 },
          { topic: "acoustics", count: 6 },
        ],
      },
      originality: {
        graduations: 3,
        tierMix: { forum: 2, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "acoustics", count: 3 },
        ],
      },
    }
  },
  generalist: {
    label: "The Generalist",
    description: "Balanced across every axis at moderate values. Trade-offs activate everywhere, pulling each petal slightly inward. Mostly clean tier history, with Discourse showing the wave texture of recent engagement. This archetype is a curious cross-domain reader who ranges through the cool side of intellectual life — mental health, music theory, clinical psychology, and renewable-energy systems. Inner rings and outer rings carry different hues because she rotates between domains. Mental health dominates only narrowly; her halo reads blue but the texture is rainbow.",
    resonance: 0.52,
    data: {
      specificity: {
        graduations: 12,
        tierMix: { forum: 7, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 4 },
          { topic: "music",            count: 3 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
      calibration: {
        graduations: 12,
        tierMix: { forum: 7, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 4 },
          { topic: "music",            count: 3 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
      charity: {
        graduations: 11,
        tierMix: { forum: 7, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 3 },
          { topic: "music",            count: 3 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
      discourse: {
        graduations: 12,
        tierMix: { forum: 5, spark: 4, echo: 1, fog: 0, heat: 2, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 4 },
          { topic: "music",            count: 3 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
      consistency: {
        graduations: 13,
        tierMix: { forum: 8, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 4 },
          { topic: "music",            count: 4 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
      originality: {
        graduations: 11,
        tierMix: { forum: 5, spark: 3, echo: 2, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "mental_health",    count: 3 },
          { topic: "music",            count: 3 },
          { topic: "psychology",       count: 3 },
          { topic: "renewable_energy", count: 2 },
        ],
      },
    }
  },
  advocate: {
    label: "The Advocate",
    description: "Steelmans opposing views. Heavy Calibration and Charity, heavy Discourse. The contributor others want to argue with because she treats their arguments better than they do. The Discourse axis carries visible wave texture — high-volume engagement with hard positions leaves a wake of Spark and Heat behind it before calming. Topic focus: political science and economics, the domains where steelmanning is most needed. Her halo reads political-red because that's where most of her engagement lives.",
    resonance: 0.74,
    data: {
      specificity: {
        graduations: 9,
        tierMix: { forum: 5, spark: 3, echo: 0, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 5 },
          { topic: "economics",         count: 4 },
        ],
      },
      calibration: {
        graduations: 19,
        tierMix: { forum: 15, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 6 },
          { topic: "political_science", count: 5 },
          { topic: "economics",         count: 4 },
          { topic: "economics",         count: 4 },
        ],
      },
      charity: {
        graduations: 20,
        tierMix: { forum: 17, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 6 },
          { topic: "political_science", count: 5 },
          { topic: "economics",         count: 5 },
          { topic: "economics",         count: 4 },
        ],
      },
      discourse: {
        graduations: 17,
        tierMix: { forum: 7, spark: 4, echo: 1, fog: 0, heat: 4, stance: 1 },
        topicPhases: [
          { topic: "political_science", count: 6 },
          { topic: "political_science", count: 5 },
          { topic: "economics",         count: 3 },
          { topic: "economics",         count: 3 },
        ],
      },
      consistency: {
        graduations: 13,
        tierMix: { forum: 8, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 4 },
          { topic: "political_science", count: 3 },
          { topic: "economics",         count: 3 },
          { topic: "economics",         count: 3 },
        ],
      },
      originality: {
        graduations: 7,
        tierMix: { forum: 3, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 3 },
          { topic: "economics",         count: 4 },
        ],
      },
    }
  },
  reviser: {
    label: "The Reviser",
    description: "Publicly updates her positions when shown evidence. Her signature is extraordinarily high Calibration — the axis that measures willingness to revise. Her tier history is unusually clean because the process of public updating protects her from Fog and Heat. Modest Originality — she refines rather than invents. This archetype is an energy analyst whose views have evolved across her time on the platform: early skepticism about renewable scaling, revised in light of evidence, evolved further as the picture filled in. Her halo reads green because renewable energy is where she spends most of her words now.",
    resonance: 0.78,
    data: {
      specificity: {
        graduations: 13,
        tierMix: { forum: 9, spark: 3, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "economics",         count: 3 },
          { topic: "renewable_energy",  count: 4 },
          { topic: "renewable_energy",  count: 4 },
        ],
      },
      calibration: {
        graduations: 21,
        tierMix: { forum: 18, spark: 2, echo: 1, fog: 0, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 3 },
          { topic: "economics",         count: 5 },
          { topic: "renewable_energy",  count: 7 },
          { topic: "renewable_energy",  count: 6 },
        ],
      },
      charity: {
        graduations: 15,
        tierMix: { forum: 11, spark: 2, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "economics",         count: 4 },
          { topic: "renewable_energy",  count: 5 },
          { topic: "renewable_energy",  count: 4 },
        ],
      },
      discourse: {
        graduations: 11,
        tierMix: { forum: 6, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "economics",         count: 3 },
          { topic: "renewable_energy",  count: 3 },
          { topic: "renewable_energy",  count: 3 },
        ],
      },
      consistency: {
        graduations: 14,
        tierMix: { forum: 9, spark: 3, echo: 1, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "political_science", count: 2 },
          { topic: "economics",         count: 4 },
          { topic: "renewable_energy",  count: 4 },
          { topic: "renewable_energy",  count: 4 },
        ],
      },
      originality: {
        graduations: 5,
        tierMix: { forum: 2, spark: 2, echo: 0, fog: 1, heat: 0, stance: 0 },
        topicPhases: [
          { topic: "economics",        count: 2 },
          { topic: "renewable_energy", count: 3 },
        ],
      },
    }
  },
};

// ─── Main page ────────────────────────────────────────────────────────────
export default function DialectaFingerprint() {
  const [animKey, setAnimKey] = useState(0);
  const [animAxis, setAnimAxis] = useState(null);
  const [heroProfile, setHeroProfile] = useState("maya");
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport size for responsive layout decisions that can't be
  // expressed with CSS media queries alone (specifically: the fingerprint
  // size prop, which affects internal geometry and can't just be CSS-scaled)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener("change", update) : mq.addListener(update);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", update) : mq.removeListener(update);
    };
  }, []);

  // Cycle through axes to demo the new-ring animation
  function triggerGrowth(axisKey) {
    setAnimAxis(axisKey);
    setAnimKey(k => k + 1);
    setTimeout(() => setAnimAxis(null), 1500);
  }

  const heroData = HERO_PROFILES[heroProfile].data;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${T.bgStoneLight} 0px, ${T.bgStoneDark} 175px, ${T.bgPrimary} 775px, ${T.bgPrimary} 100%)`,
      color: T.textBody,
      fontFamily: T.fontBody,
      WebkitFontSmoothing: "antialiased",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />

      {/* Mobile responsive layout — media queries for elements that need
          layout changes (grids collapsing, paddings shrinking, fingerprint
          banner stacks). Uses class hooks on target elements so React inline
          styles can still own everything else. */}
      <style>{`
        @media (max-width: 720px) {
          .fp-main-content {
            padding: 32px 16px 32px !important;
          }
          .fp-hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
            padding: 32px 20px !important;
          }
          .fp-hero-fingerprint-wrap {
            max-width: 100% !important;
          }
          .fp-hero-fingerprint-wrap svg {
            max-width: 100%;
            height: auto;
          }
          .fp-hero-caption {
            max-width: 100% !important;
          }
          .fp-axis-pair-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          .fp-axis-pair-container {
            padding: 20px 22px !important;
          }
          .fp-stage-banner {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 16px !important;
            padding: 20px 22px !important;
          }
          .fp-stage-banner-text {
            text-align: center !important;
          }
          .fp-archetype-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .fp-archetype-card {
            grid-template-columns: 1fr !important;
            justify-items: center !important;
            text-align: center !important;
            padding: 24px 22px !important;
          }
          .fp-ladder-container {
            padding: 24px 20px !important;
          }
          .fp-ladder-row {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
            padding: 16px 0 !important;
          }
          .fp-section-title {
            font-size: 1.8rem !important;
          }
          .fp-nav-primary {
            padding: 0 16px 0 12px !important;
          }
          .fp-nav-primary-logo {
            height: 32px !important;
          }
          .fp-nav-sub {
            padding: 0 16px 0 12px !important;
          }
          .fp-nav-sub a {
            font-size: 0.72rem !important;
            padding: 0 10px !important;
          }
          .fp-hero-profile-selector {
            border-left-width: 0 !important;
            border-top: 4px solid var(--amber, #e8a830);
            border-radius: 10px 10px 0 0 !important;
          }
        }
      `}</style>

      {/* Subtle paper grain */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.035'/%3E%3C/svg%3E")`,
      }} />

      {/* ─── PRIMARY NAV BAR — v1.2 two-bar system: logo bar (52px) ─── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 101,
        background: "linear-gradient(135deg, #f7f2e8 0%, #1c1814 65%, #1c1814 100%)",
        borderBottom: "1px solid rgba(184,115,42,0.22)",
        height: 52,
        display: "flex", alignItems: "center",
      }}>
        <div className="fp-nav-primary" style={{
          width: "100%", maxWidth: 1060, margin: "0 auto",
          padding: "0 32px 0 20px",
          display: "flex", alignItems: "center",
        }}>
          <a href="/" style={{ display: "block", textDecoration: "none" }}>
            <img className="fp-nav-primary-logo" src={DIALECTA_LOGO} alt="Dialecta" style={{
              height: 40,
              width: "auto",
              display: "block",
              mixBlendMode: "multiply",
            }} />
          </a>
        </div>
      </div>

      {/* ─── SUB-NAV — v1.2 metallic rail with highlight hairlines (34px) ─── */}
      <div style={{
        position: "sticky", top: 52, zIndex: 100, height: 34,
        background: `linear-gradient(to bottom, ${T.bgRailLight} 0%, ${T.bgRailDark} 48%, ${T.bgRailLight} 100%)`,
        display: "flex", alignItems: "center",
      }}>
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Top highlight hairline */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: 0, height: 1,
          background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.92) 8%, rgba(255,255,255,0.96) 50%, rgba(255,255,255,0.92) 92%, transparent 100%)",
          pointerEvents: "none",
        }} />
        {/* Bottom highlight hairline */}
        <div style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: 1,
          background: "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.92) 8%, rgba(255,255,255,0.96) 50%, rgba(255,255,255,0.92) 92%, transparent 100%)",
          pointerEvents: "none",
        }} />
        <div className="fp-nav-sub" style={{
          width: "100%", maxWidth: 1060, margin: "0 auto",
          padding: "0 32px 0 20px",
          display: "flex", alignItems: "center",
          position: "relative", zIndex: 1, height: "100%",
          overflowX: "auto",
        }}>
          <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
            {[
              { label: "The Forum",  href: "/forum" },
              { label: "Articles",   href: "/articles" },
              { label: "Library",    href: "/library", active: true },
              { label: "The Pact",   href: "/pact" },
            ].map((link, i, arr) => (
              <a key={link.label} href={link.href} style={{
                fontFamily: T.fontBody,
                fontSize: "0.82rem",
                fontWeight: link.active ? 500 : 400,
                letterSpacing: "0.01em",
                color: "#1c1814",
                textDecoration: "none",
                padding: i === 0 ? "0 13px 0 2px" : "0 13px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                borderRight: i < arr.length - 1 ? "1px solid rgba(180,175,165,0.28)" : "none",
                background: link.active ? "rgba(255,255,255,0.35)" : "transparent",
                transition: "background 0.15s, color 0.15s",
              }}>{link.label}</a>
            ))}
          </div>
        </div>
        </div>
      </div>

      <div className="fp-main-content" style={{ maxWidth: 1080, margin: "0 auto", padding: "64px 32px", position: "relative", zIndex: 1 }}>

        {/* ─── Header ─── */}
        <div style={{ marginBottom: 64 }}>
          <div style={{
            fontFamily: T.fontMono,
            fontSize: 12,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            fontWeight: 500,
            marginBottom: 14,
            background: "linear-gradient(to right, #ecb438 0%, #f5dfa0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 1px 3px rgba(28,24,20,0.5))",
            display: "inline-block",
          }}>
            Dialecta · Identity Element
          </div>
          <h1 style={{
            fontFamily: T.fontDisplay,
            fontSize: "clamp(2.8rem, 6.5vw, 5.2rem)",
            fontWeight: 600,
            color: T.textPrimary,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            marginBottom: 16,
            maxWidth: "14ch",
          }}>
            The Thinking <em style={{
              background: "linear-gradient(to right, #ecb438 0%, #f5dfa0 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 1px 6px rgba(28,24,20,0.45)) drop-shadow(0 2px 12px rgba(28,24,20,0.2))",
              fontWeight: 300,
              fontStyle: "italic",
            }}>Fingerprint</em>
          </h1>
          <p style={{
            fontFamily: T.fontReading,
            fontSize: "1.2rem",
            lineHeight: 1.6,
            color: "#2c2620",
            fontWeight: 300,
            fontStyle: "italic",
            maxWidth: "50ch",
          }}>
            An identity artifact that grows with you. No two contributors produce the same shape — and they shouldn't.
          </p>
          <div style={{ height: 2, background: T.borderRule, width: 60, marginTop: 24 }} />
        </div>

        {/* ─── Hero Fingerprint ─── */}
        <div className="fp-hero-grid" style={{
          background: T.bgWhite,
          border: `1px solid ${T.borderLight}`,
          borderRadius: 12,
          padding: "56px 40px",
          marginBottom: 48,
          boxShadow: "0 4px 24px rgba(28,24,20,0.05)",
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 48,
          alignItems: "start",
        }}>
          <div className="fp-hero-fingerprint-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }} key={animKey + heroProfile}>
            <Fingerprint
              data={heroData}
              size={isMobile ? 300 : 420}
              newRingAxis={animAxis}
              resonance={HERO_PROFILES[heroProfile].resonance || 0}
            />
            <div className="fp-hero-caption" style={{
              maxWidth: 420,
              borderTop: `1px solid ${T.borderLight}`,
              paddingTop: 20,
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.18em",
                textTransform: "uppercase", color: T.amber, marginBottom: 6,
                fontWeight: 500,
              }}>
                Reading the shape
              </div>
              <p style={{
                fontFamily: T.fontReading, fontSize: "0.92rem", lineHeight: 1.65,
                color: T.textSecondary, margin: 0, fontStyle: "italic",
              }}>
                {HERO_PROFILES[heroProfile].description}
              </p>

              {/* Reading key — teaches the user how to interpret the visual
                  vocabulary of the fingerprint. Closes the gap between "this
                  is pretty" and "I understand what I'm seeing." */}
              <div style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: `1px dotted ${T.borderLight}`,
                textAlign: "left",
              }}>
                <div style={{
                  fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.18em",
                  textTransform: "uppercase", color: T.amber, marginBottom: 10,
                  fontWeight: 500, textAlign: "center",
                }}>
                  How to read it
                </div>
                <ul style={{
                  fontFamily: T.fontReading, fontSize: "0.82rem", lineHeight: 1.55,
                  color: T.textSecondary, margin: 0, padding: 0, listStyle: "none",
                }}>
                  <li style={{ marginBottom: 7, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: T.amber, fontWeight: 600 }}>·</span>
                    <strong style={{ color: T.textPrimary, fontWeight: 500 }}>Petals</strong> are the six axes of intellectual character. Longer petal = more comments earned on that axis.
                  </li>
                  <li style={{ marginBottom: 7, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: T.amber, fontWeight: 600 }}>·</span>
                    <strong style={{ color: T.textPrimary, fontWeight: 500 }}>Inner rings</strong> are her oldest history. <strong style={{ color: T.textPrimary, fontWeight: 500 }}>Outer rings</strong> are her most recent. Ring colors show which topic she was writing about at the time.
                  </li>
                  <li style={{ marginBottom: 7, paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: T.amber, fontWeight: 600 }}>·</span>
                    <strong style={{ color: T.textPrimary, fontWeight: 500 }}>Wave texture</strong> in the rings comes from Heat and Stance — the marks of fights and tribal moments. Calm rings come from Forum-tier history.
                  </li>
                  <li style={{ paddingLeft: 14, position: "relative" }}>
                    <span style={{ position: "absolute", left: 0, color: T.amber, fontWeight: 600 }}>·</span>
                    <strong style={{ color: T.textPrimary, fontWeight: 500 }}>The halo</strong> is community reception. Its color comes from her dominant topic; its brightness comes from how much her voice lands in the community.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="fp-hero-profile-selector" style={{
            background: `linear-gradient(135deg, ${T.goldPale} 0%, ${T.bgWhite} 75%)`,
            border: `1px solid ${T.gold}`,
            borderLeft: `4px solid ${T.amber}`,
            borderRadius: "0 10px 10px 0",
            padding: "24px 26px",
          }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.18em",
              textTransform: "uppercase", color: T.amber, marginBottom: 10,
              fontWeight: 500,
            }}>
              Three Contributors
            </div>
            <h3 style={{
              fontFamily: T.fontDisplay, fontSize: "1.5rem", fontWeight: 500,
              color: T.textPrimary, marginBottom: 12, lineHeight: 1.2,
              fontStyle: "italic",
            }}>
              Compare
            </h3>
            <p style={{
              fontFamily: T.fontReading, fontSize: "0.88rem", lineHeight: 1.6,
              color: T.textSecondary, marginBottom: 18, fontStyle: "italic",
            }}>
              Three mature contributors with dramatically different engagement patterns. The same six axes produce radically different shapes and textures depending on how each person actually behaved.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(HERO_PROFILES).map(([key, profile]) => {
                const isActive = heroProfile === key;
                return (
                  <button key={key} onClick={() => setHeroProfile(key)} style={{
                    display: "block",
                    padding: "12px 14px",
                    background: isActive ? T.bgWhite : "transparent",
                    border: `1px solid ${isActive ? T.amber : "rgba(184,115,42,0.25)"}`,
                    borderRadius: 6,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                    boxShadow: isActive ? "0 2px 8px rgba(184,115,42,0.15)" : "none",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,253,248,0.6)";
                      e.currentTarget.style.borderColor = T.gold;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "rgba(184,115,42,0.25)";
                    }
                  }}>
                    <div style={{
                      fontFamily: T.fontDisplay,
                      fontSize: "1rem",
                      fontWeight: 500,
                      fontStyle: "italic",
                      color: isActive ? T.textPrimary : T.textBody,
                      lineHeight: 1.2,
                      marginBottom: 3,
                    }}>
                      {profile.label}
                    </div>
                    <div style={{
                      fontFamily: T.fontMono,
                      fontSize: 9,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: isActive ? T.amber : T.textTertiary,
                    }}>
                      {profile.sublabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── The Six Axes Legend ─── */}
        <div style={{ marginBottom: 80 }}>
          <SectionLabel num="01" />
          <SectionTitle>The Six Axes</SectionTitle>
          <SectionDesc>
            The fingerprint draws from three philosophical pairs — what you produce, how you reason, and how you show up. Together they form a portrait of intellectual character.
          </SectionDesc>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {["Substance", "Intellectual Honesty", "Engagement"].map(pair => {
              const pairAxes = AXES.filter(a => a.pair === pair);
              return (
                <div key={pair} className="fp-axis-pair-container" style={{
                  background: T.bgWhite,
                  border: `1px solid ${T.borderLight}`,
                  borderLeft: `3px solid ${T.amber}`,
                  borderRadius: "0 8px 8px 0",
                  padding: "22px 28px",
                }}>
                  <div style={{
                    fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: T.amber, marginBottom: 18,
                  }}>
                    {pair}
                  </div>
                  <div className="fp-axis-pair-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 36,
                  }}>
                    {pairAxes.map(a => (
                      <div key={a.key}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: a.color }} />
                          <span style={{
                            fontFamily: T.fontDisplay, fontSize: "1.15rem", fontWeight: 500,
                            color: T.textPrimary,
                          }}>{a.label}</span>
                        </div>
                        <p style={{
                          fontFamily: T.fontReading, fontSize: "0.88rem", lineHeight: 1.6,
                          color: T.textSecondary, marginLeft: 18, margin: "0 0 0 18px",
                        }}>{a.meaning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── The Brightness Ladder — tier system ─── */}
        <div style={{ marginBottom: 80 }}>
          <SectionLabel num="02" />
          <SectionTitle>The Brightness Ladder</SectionTitle>
          <SectionDesc>
            Every comment on Dialecta lands in a tier. The platform's classification engine — a hybrid of AI analysis, contributor self-declaration, and community voting — sorts each contribution into one of seven tiers. Lighter badges mean higher-quality discourse. Darker badges mean the comment is still visible but suppressed from default view. Your fingerprint is built from which tiers you've earned on each axis. A petal grown mostly from <em>Forum</em> comments renders as a smooth, confident bloom. A petal earned through a struggle of <em>Heat</em> and <em>Stance</em> before reaching <em>Forum</em> carries visible perturbation in its rings. The texture remembers how the shape was earned.
          </SectionDesc>

          <div className="fp-ladder-container" style={{
            marginTop: 32,
            background: T.bgWhite,
            border: `1px solid ${T.borderLight}`,
            borderRadius: 12,
            padding: "32px 36px",
            boxShadow: "0 2px 12px rgba(28,24,20,0.04)",
          }}>
            {/* Seven tiers as a descending brightness ladder */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { key: "forum",  meaning: "Constructive, specific, fact-referenced. The highest quality of engagement. A fingerprint built from Forum grows confident and calm." },
                { key: "spark",  meaning: "A genuinely interesting seed of an idea that deserves expansion. Forum-adjacent. Still contributes cleanly to fingerprint growth." },
                { key: "echo",   meaning: "Restates without adding. Not harmful, not propulsive. Contributes modestly to axis graduations." },
                { key: "fog",    meaning: "Vague or disconnected. The reader can't tell what the contributor believes. Dampens the axis without damaging it." },
                { key: "heat",   meaning: "Passionate but without specificity. Generates visible turbulence in the fingerprint's rings." },
                { key: "stance", meaning: "Tribal framing or coded signaling over engagement with the idea. Adds perturbation and reduces clarity." },
                { key: "breach", meaning: "Name-calling, slander, targeted attacks. Suppressed from default view. Does not contribute to the fingerprint." },
              ].map(({ key, meaning }, idx) => (
                <div key={key} className="fp-ladder-row" style={{
                  display: "grid",
                  gridTemplateColumns: "160px 1fr",
                  gap: 28,
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: idx < 6 ? `1px solid ${T.borderLight}` : "none",
                }}>
                  <div>
                    <TierBadge tierKey={key} size="lg" />
                  </div>
                  <p style={{
                    fontFamily: T.fontReading,
                    fontSize: "0.9rem",
                    lineHeight: 1.6,
                    color: T.textSecondary,
                    margin: 0,
                    fontStyle: "italic",
                  }}>
                    {meaning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial framing under the ladder */}
          <div style={{
            marginTop: 24,
            background: `linear-gradient(135deg, ${T.goldPale} 0%, ${T.bgWhite} 75%)`,
            border: `1px solid ${T.gold}`,
            borderLeft: `4px solid ${T.amber}`,
            borderRadius: "0 10px 10px 0",
            padding: "20px 26px",
          }}>
            <div style={{
              fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.18em",
              textTransform: "uppercase", color: T.amber, marginBottom: 6,
              fontWeight: 500,
            }}>
              From tiers to shape
            </div>
            <p style={{
              fontFamily: T.fontReading, fontSize: "0.95rem", lineHeight: 1.7,
              color: T.textBody, fontStyle: "italic", margin: 0,
            }}>
              A single comment's tier placement affects the axis it lands on. Forum and Spark grow the axis cleanly. Echo and Fog grow it weakly. Heat and Stance still grow it — effort still counts — but leave visible marks in the ring texture. Breach doesn't count at all. Your fingerprint is the accumulated record of thousands of these small placements, rendered all at once.
            </p>
          </div>
        </div>

        {/* ─── Stages of Growth ─── */}
        <div style={{ marginBottom: 80 }}>
          <SectionLabel num="03" />
          <SectionTitle>Stages of Growth</SectionTitle>
          <SectionDesc>
            A fingerprint grows ring by ring. The same contributor seen at four moments in their life on the platform. Each axis develops independently — some petals will bloom faster than others. That's the point.
          </SectionDesc>

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
            {Object.entries(STAGE_DATA).map(([key, stage]) => (
              <div key={key} className="fp-stage-banner" style={{
                background: T.bgWhite,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 10,
                padding: "24px 32px",
                display: "flex",
                alignItems: "center",
                gap: 32,
                boxShadow: "0 2px 12px rgba(28,24,20,0.04)",
              }}>
                {/* Fingerprint on the left */}
                <div style={{ flexShrink: 0 }}>
                  <Fingerprint data={stage.data} size={180} showLabels={false} showAxisLines={false} resonance={stage.resonance || 0} />
                </div>
                {/* Text on the right, vertically centered */}
                <div className="fp-stage-banner-text" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: T.amber, marginBottom: 6,
                  }}>
                    {stage.sublabel}
                  </div>
                  <h4 style={{
                    fontFamily: T.fontDisplay, fontSize: "1.6rem", fontWeight: 500,
                    color: T.textPrimary, marginBottom: 10, lineHeight: 1.1,
                    fontStyle: "italic",
                  }}>{stage.label}</h4>
                  <p style={{
                    fontFamily: T.fontReading, fontSize: "0.95rem", lineHeight: 1.65,
                    color: T.textSecondary, margin: 0,
                    maxWidth: 640,
                  }}>{stage.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── How to Read a Fingerprint ─── */}
        <div style={{ marginBottom: 80 }}>
          <SectionLabel num="04" />
          <SectionTitle>How to Read a Fingerprint</SectionTitle>
          <SectionDesc>
            Certain axes compete for the same cognitive budget — Specificity trades against Originality and Discourse, and Discourse trades against Calibration and Charity. A contributor cannot max everything at once. The trade-offs make a true circle structurally impossible and force every fingerprint into a real shape. Here are four archetypes that emerge naturally from how contributors resolve those trade-offs.
          </SectionDesc>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))", gap: 24, marginTop: 32 }}>
            {Object.entries(ARCHETYPE_DATA).map(([key, arch]) => (
              <div key={key} className="fp-archetype-card" style={{
                background: T.bgWhite,
                border: `1px solid ${T.borderLight}`,
                borderRadius: 10,
                padding: "28px 28px",
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 24,
                alignItems: "center",
                boxShadow: "0 2px 12px rgba(28,24,20,0.04)",
              }}>
                <Fingerprint data={arch.data} size={200} showLabels={false} showAxisLines={false} resonance={arch.resonance || 0} />
                <div>
                  <div style={{
                    fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em",
                    textTransform: "uppercase", color: T.amber, marginBottom: 6,
                  }}>
                    Archetype
                  </div>
                  <h4 style={{
                    fontFamily: T.fontDisplay, fontSize: "1.5rem", fontWeight: 500,
                    color: T.textPrimary, marginBottom: 10, fontStyle: "italic",
                  }}>{arch.label}</h4>
                  <p style={{
                    fontFamily: T.fontReading, fontSize: "0.9rem", lineHeight: 1.65,
                    color: T.textSecondary,
                  }}>{arch.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Reading the Texture ─── */}
        <div style={{ marginBottom: 80 }}>
          <SectionLabel num="05" />
          <SectionTitle>Reading the Texture</SectionTitle>
          <SectionDesc>
            Two contributors can have identical graduation counts and still produce wildly different fingerprints. The shape comes from <em>what</em> was earned. The texture comes from <em>how</em> it was earned. Each axis tracks a full tier history — Forum, Spark, Echo, Fog, Heat, Stance — and the fingerprint surfaces three things from it: <em>purity</em> drives color saturation, <em>turbulence</em> generates visible wave patterns in the rings, and <em>clarity</em> modulates how crisp the lines render. A pristine climb produces calm waters and crisp edges. A messy climb produces visible wave activity and slightly diffuse lines. The texture remembers.
          </SectionDesc>

          <div className="fp-archetype-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 32 }}>
            <div style={{
              background: T.bgWhite,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 10,
              padding: "32px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
              boxShadow: "0 2px 12px rgba(28,24,20,0.04)",
            }}>
              <Fingerprint
                data={{
                  specificity: {
                    graduations: 14,
                    tierMix: { forum: 13, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 5 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 6 },
                    ],
                  },
                  calibration: {
                    graduations: 12,
                    tierMix: { forum: 11, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 5 },
                    ],
                  },
                  charity: {
                    graduations: 11,
                    tierMix: { forum: 10, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 4 },
                    ],
                  },
                  discourse: {
                    graduations: 13,
                    tierMix: { forum: 12, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 6 },
                    ],
                  },
                  consistency: {
                    graduations: 12,
                    tierMix: { forum: 11, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 5 },
                    ],
                  },
                  originality: {
                    graduations: 11,
                    tierMix: { forum: 10, spark: 1, echo: 0, fog: 0, heat: 0, stance: 0 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 4 },
                    ],
                  },
                }}
                size={240}
                showLabels={false}
                showAxisLines={false}
                resonance={0.72}
              />
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em",
                textTransform: "uppercase", color: T.amber, marginTop: 18, marginBottom: 4,
              }}>Calm Waters</div>
              <h4 style={{
                fontFamily: T.fontDisplay, fontSize: "1.25rem", fontWeight: 500,
                color: T.textPrimary, marginBottom: 8, fontStyle: "italic",
              }}>The Confident Path</h4>
              <p style={{
                fontFamily: T.fontReading, fontSize: "0.85rem", lineHeight: 1.6,
                color: T.textSecondary, textAlign: "center", maxWidth: 280,
              }}>A clinical psychologist who came up through a clean academic path. Her primary territory is psychology, with a middle period writing about music and the neuroscience of listening — visible as a band of purple in her middle rings. Pristine tier history across every axis. Lines render crisp and the rings sit smooth.</p>
            </div>

            <div style={{
              background: T.bgWhite,
              border: `1px solid ${T.borderLight}`,
              borderRadius: 10,
              padding: "32px 24px",
              display: "flex", flexDirection: "column", alignItems: "center",
              boxShadow: "0 2px 12px rgba(28,24,20,0.04)",
            }}>
              <Fingerprint
                data={{
                  specificity: {
                    graduations: 14,
                    tierMix: { forum: 4, spark: 3, echo: 2, fog: 1, heat: 3, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 5 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 6 },
                    ],
                  },
                  calibration: {
                    graduations: 12,
                    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 2, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 5 },
                    ],
                  },
                  charity: {
                    graduations: 11,
                    tierMix: { forum: 3, spark: 2, echo: 2, fog: 1, heat: 2, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 4 },
                    ],
                  },
                  discourse: {
                    graduations: 13,
                    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 3, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 6 },
                    ],
                  },
                  consistency: {
                    graduations: 12,
                    tierMix: { forum: 3, spark: 3, echo: 2, fog: 1, heat: 2, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 5 },
                    ],
                  },
                  originality: {
                    graduations: 11,
                    tierMix: { forum: 3, spark: 2, echo: 2, fog: 1, heat: 2, stance: 1 },
                    topicPhases: [
                      { topic: "psychology", count: 4 },
                      { topic: "music",      count: 3 },
                      { topic: "psychology", count: 4 },
                    ],
                  },
                }}
                size={240}
                showLabels={false}
                showAxisLines={false}
                resonance={0.72}
              />
              <div style={{
                fontFamily: T.fontMono, fontSize: 9, letterSpacing: "0.15em",
                textTransform: "uppercase", color: T.amber, marginTop: 18, marginBottom: 4,
              }}>Turbulent Waters</div>
              <h4 style={{
                fontFamily: T.fontDisplay, fontSize: "1.25rem", fontWeight: 500,
                color: T.textPrimary, marginBottom: 8, fontStyle: "italic",
              }}>The Climbed Path</h4>
              <p style={{
                fontFamily: T.fontReading, fontSize: "0.85rem", lineHeight: 1.6,
                color: T.textSecondary, textAlign: "center", maxWidth: 280,
              }}>Same field, same final graduations, same purple middle-period interest in music — but this clinician came up through messier conversations. Heat, Stance, and Fog scattered through her history. Visible wave activity ripples through the rings, and the lines render slightly diffuse where Fog dominated. The texture remembers the climb.</p>
            </div>
          </div>
        </div>

        {/* ─── Footer ─── */}
        <div style={{
          borderTop: `2px solid ${T.amber}`,
          paddingTop: 32, marginTop: 48, textAlign: "center",
        }}>
          <p style={{
            fontFamily: T.fontDisplay, fontSize: "1rem", letterSpacing: "0.2em",
            color: T.amber, marginBottom: 6,
          }}>Dialecta</p>
          <p style={{
            fontFamily: T.fontMono, fontSize: 9, color: T.textSecondary,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>Thinking Fingerprint · v1 · April 2026</p>
          <p style={{
            fontFamily: T.fontReading, fontStyle: "italic", fontSize: "0.85rem",
            color: T.textTertiary, marginTop: 12,
          }}>Ideas are the protagonist.</p>
        </div>

      </div>
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────
// ─── Tier icon paths — canonical SVG geometry from the design spec ─────
// Each entry knows how its shape should be filled/stroked. Some tiers are
// outlined shapes (Forum, Echo, Breach), others are filled silhouettes
// (Spark, Fog, Heat, Stance). currentColor means the icon inherits the
// badge's text color automatically.
const TIER_ICONS = {
  forum: {
    fill: "none",
    strokeWidth: 2,
    paths: (
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7 L12 3 L21 7" />
        <line x1="2" y1="7.5" x2="22" y2="7.5" strokeWidth="2.2" />
        <line x1="6" y1="9" x2="6" y2="19" />
        <line x1="12" y1="9" x2="12" y2="19" />
        <line x1="18" y1="9" x2="18" y2="19" />
        <line x1="3" y1="20" x2="21" y2="20" strokeWidth="2.2" />
      </g>
    ),
  },
  spark: {
    fill: "currentColor",
    strokeWidth: 0.5,
    paths: (
      <path strokeLinejoin="round" d="M13 2 L4 14 L11 14 L10 22 L20 9 L13 9 Z" />
    ),
  },
  echo: {
    fill: "none",
    strokeWidth: 2.4,
    paths: (
      <g strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12 a8 8 0 0 1 14 -5" />
        <path d="M18 3 L18 7 L14 7" />
        <path d="M20 12 a8 8 0 0 1 -14 5" />
        <path d="M6 21 L6 17 L10 17" />
      </g>
    ),
  },
  fog: {
    fill: "currentColor",
    strokeWidth: 0.5,
    paths: (
      <path strokeLinejoin="round" d="M6.5 18 C 3.5 18, 2 16, 2 13.5 C 2 11, 4 9.5, 6 9.8 C 6.5 6.5, 9 5, 11.5 5 C 14.5 5, 16.5 7, 17 9.5 C 19.5 9.5, 22 11, 22 14 C 22 16.5, 20 18, 17.5 18 Z" />
    ),
  },
  heat: {
    fill: "currentColor",
    strokeWidth: 0.5,
    paths: (
      <path strokeLinejoin="round" d="M12 2 C 10 6, 7 8, 7 13 C 7 17.5, 9.5 21, 12.5 21 C 16 21, 18 17.8, 17.8 14.5 C 17.6 12, 15.8 10, 14 9 C 14.5 11, 13.5 12, 12.5 11.5 C 12 9, 13 6, 12 2 Z" />
    ),
  },
  stance: {
    fill: "currentColor",
    strokeWidth: 0.5,
    paths: (
      <g strokeLinejoin="round" strokeLinecap="round">
        <line x1="6" y1="3" x2="6" y2="21" strokeWidth="2.8" />
        <path d="M6 4 L18 8 L6 12 Z" />
        <line x1="3" y1="21" x2="9" y2="21" strokeWidth="2.8" />
      </g>
    ),
  },
  breach: {
    fill: "none",
    strokeWidth: 2.4,
    paths: (
      <g strokeLinejoin="round" strokeLinecap="round">
        <path d="M9 7 a3 3 0 0 0 -3 3 v2 a3 3 0 0 0 3 3 h1" />
        <path d="M15 17 a3 3 0 0 0 3 -3 v-2 a3 3 0 0 0 -3 -3 h-1" />
        <line x1="3" y1="3" x2="21" y2="21" strokeWidth="3" />
      </g>
    ),
  },
};

// TierBadge — renders a canonical badge pill with gradient + border + icon + label.
// size can be "sm", "md" (default), or "lg".
function TierBadge({ tierKey, size = "md" }) {
  const tier = TIERS[tierKey];
  const icon = TIER_ICONS[tierKey];
  const dims = {
    sm: { padX: 8,  padY: 3, fontSize: "0.6rem",  iconSize: 10, gap: 4 },
    md: { padX: 12, padY: 5, fontSize: "0.7rem",  iconSize: 12, gap: 5 },
    lg: { padX: 16, padY: 7, fontSize: "0.8rem",  iconSize: 14, gap: 8 },
  }[size];
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: dims.gap,
      padding: `${dims.padY}px ${dims.padX}px`,
      borderRadius: size === "lg" ? 6 : 4,
      fontFamily: T.fontMono,
      fontSize: dims.fontSize,
      fontWeight: 500,
      letterSpacing: "0.04em",
      lineHeight: 1,
      whiteSpace: "nowrap",
      background: `linear-gradient(180deg, ${tier.gradTop}, ${tier.gradBot})`,
      border: `1px solid ${tier.border}`,
      color: tier.text,
      boxShadow: "0 1px 2px rgba(28,24,20,0.12), inset 0 1px 0 rgba(255,255,255,0.3)",
    }}>
      <svg
        width={dims.iconSize}
        height={dims.iconSize}
        viewBox="0 0 24 24"
        fill={icon.fill}
        stroke="currentColor"
        strokeWidth={icon.strokeWidth}
      >
        {icon.paths}
      </svg>
      {tier.name}
    </span>
  );
}

function SectionLabel({ num }) {
  return (
    <div style={{
      fontFamily: T.fontMono, fontSize: 10, letterSpacing: "0.2em",
      textTransform: "uppercase", color: T.amber, marginBottom: 6,
    }}>Section {num}</div>
  );
}
function SectionTitle({ children }) {
  return (
    <h2 className="fp-section-title" style={{
      fontFamily: T.fontDisplay, fontSize: "2rem", fontWeight: 600,
      color: T.textPrimary, marginBottom: 10, lineHeight: 1.15,
    }}>{children}</h2>
  );
}
function SectionDesc({ children }) {
  return (
    <p style={{
      fontFamily: T.fontReading, fontSize: "0.95rem", lineHeight: 1.75,
      color: T.textSecondary, fontWeight: 400, maxWidth: 720,
    }}>{children}</p>
  );
}
