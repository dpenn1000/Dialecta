import React, { useState, useMemo, useId } from "react";
import { TOPICS } from './topics.js';

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
// Axis names follow the canonical Six Pillars of Intellectual Character (v1.1
// Contributor Identity spec). Renamed in engine v2.0.0:
//   specificity → acuity     (precision and claimability of points)
//   charity     → magnanimity (faithful representation of opposing views)
//   originality → reach       (breadth across distinct topic areas)
const AXES = [
  { key: "acuity",      label: "Acuity",      pair: "Substance",
    color: "#d49415", colorDeep: "#7a5008", angle: 0,
    meaning: "How precise and claimable the contributor's points tend to be." },
  { key: "calibration", label: "Calibration", pair: "Intellectual Honesty",
    color: "#2674d4", colorDeep: "#143e7a", angle: 60,
    meaning: "How well the contributor's confidence matches the strength of their evidence." },
  { key: "magnanimity", label: "Magnanimity", pair: "Intellectual Honesty",
    color: "#3aa564", colorDeep: "#1a5a32", angle: 120,
    meaning: "How faithfully the contributor represents views they disagree with before engaging with them." },
  { key: "discourse",   label: "Discourse",   pair: "Engagement",
    color: "#dc5418", colorDeep: "#7c2808", angle: 180,
    meaning: "How often the contributor engages in sustained back-and-forth rather than hit-and-run." },
  { key: "consistency", label: "Consistency", pair: "Engagement",
    color: "#b8429a", colorDeep: "#5e1c50", angle: 240,
    meaning: "How regularly the contributor shows up over time." },
  { key: "reach",       label: "Reach",       pair: "Substance",
    color: "#a8a020", colorDeep: "#5a5408", angle: 300,
    meaning: "How many distinct topic areas the contributor has engaged across." },
];

// ─── The fingerprint generator (engine v2.0.0) ────────────────────────────
// data: { acuity: { graduations: int 0-20, purity: 0-1 }, ... }
// Six axes per the Contributor Identity v1.1 spec:
//   acuity, calibration, magnanimity, discourse, consistency, reach
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
  // SVG has padding around the geometry to fit axis labels without overflow.
  // `size` is the inner geometry size (the fingerprint's visual extent);
  // the SVG element renders larger by LABEL_MARGIN on each side when
  // labels are shown, so axis labels live inside the SVG bounding box and
  // never bleed past the parent container at narrow widths.
  // 2026-04-29: tightened 36 → 22 so the pillar labels (ACUITY,
  // CALIBRATION, etc.) sit closer to the fingerprint rather than
  // floating in dead space at the corners. Visual reads as a single
  // glyph instead of a fingerprint with text-stamps far away.
  const LABEL_MARGIN = showLabels ? 22 : 0;
  const totalSize = size + LABEL_MARGIN * 2;
  const cx = totalSize / 2;
  const cy = totalSize / 2;
  const maxR = size * 0.42;       // outermost reach of any ring (geometry coords)

  const fp = (() => {
  // ─── PARAMETERS ─────────────────────────────────────────────────────────
  const N_PERIMETER = 96;     // points sampled around each ring (16 per axis pair)
  const RADIUS_POWER = 0.85;  // closer to 1 = more dramatic asymmetry between strong and weak axes
  const MIN_AXIS_RADIUS_FACTOR = 0.04; // weakest axis still has tiny radius
  const TRADEOFF_PENALTY = 0.20; // 20% reduction when both competing axes are high

  // ─── TRADE-OFF PAIRS ────────────────────────────────────────────────────
  // Certain pillars compete for the same cognitive budget — a contributor
  // cannot simultaneously max out both members of a pair. When two competing
  // pillars are both high, each one's displayed radius is reduced. This makes
  // circles structurally impossible and forces every fingerprint into a real
  // shape.
  //
  // Per Contributor Identity v1.1 ("The Trade-Offs Are Intentional"):
  //   - DEPTH ↔ BREADTH:  Acuity competes with Reach
  //   - VOLUME ↔ CARE:    Discourse competes with Calibration AND Magnanimity
  //
  // Consistency's early-tenure trade-off against the quality pillars is a
  // phase-of-life observation, not a permanent geometric constraint, and is
  // intentionally not encoded here.
  const TRADEOFF_PAIRS = [
    ["acuity", "reach"],
    ["discourse", "calibration"],
    ["discourse", "magnanimity"],
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
      // A contributor with calm Acuity but turbulent Discourse will
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
      // of 0.5 — so turbulence on Acuity no longer leaks into Reach.
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
    <svg width={totalSize} height={totalSize} viewBox={`0 0 ${totalSize} ${totalSize}`}
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


// ─── Data builder ──────────────────────────────────────────────────────────
export function emptyFingerprint() {
  const data = {};
  for (const a of AXES) {
    data[a.key] = {
      graduations: 0,
      tierMix: { forum: 0, spark: 0, echo: 0, fog: 0, heat: 0, stance: 0 },
      topicPhases: [],
    };
  }
  return data;
}

export { Fingerprint, AXES, TIERS, T };