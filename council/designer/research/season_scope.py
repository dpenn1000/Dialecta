"""
How far one season's colour should spread.

Dan: "I don't want an entire axis to be one color. Each tick along an axis
represents a post or 'season'... The colors should follow that season within the
tree rings... and possibly graduate out from there, but not envelop the entire
section or center."

Two things are conflated in what he is looking at, and they separate cleanly.

  THE DATA. `profile_gallery.py` gives each axis two or three coarse
  `topicPhases` blocks. Real history is one graduation per comment and a
  contributor alternates. `realistic_history` models that with drifting eras, so
  the same person can be rendered both ways and the difference measured.

  THE ENGINE. `sharpBlend` is `smoothstep(smoothstep(t))`, and one axis holds
  90% or more of the colour from 0 to 17 degrees and from 43 to 60 of every 60
  degree sector. That is a property of the blend and not of the data: ONE
  comment paints a sixth of the ring however finely the history is interleaved,
  because the ring model stores exactly one topic per axis per ring.

The fix inside the ring model is to stop granting angular extent and start
earning it: a tick's arc is proportional to the comments behind it.

Run: python council/designer/research/season_scope.py
"""
import math, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import gallery_probe as G  # noqa: E402
import ledger_render as L  # noqa: E402
from palette_check import FIXED as TOPICS  # noqa: E402

AXES = G.AXES
MIN_ARC_PX = 6.0   # arc length below which a tick stops reading as a colour


def smoothstep(t):
    return t * t * (3 - 2 * t)


def sharp_blend(t):
    return smoothstep(smoothstep(t))


def hold_span(blend, thresh=0.9, n=2000):
    """Degrees of a 60 degree sector where one side holds `thresh` of the colour."""
    lo = hi = None
    for i in range(n + 1):
        t = i / n
        v = blend(t)
        if v <= 1 - thresh and lo is None:
            pass
        if v > 1 - thresh and lo is None:
            lo = t
        if v >= thresh and hi is None:
            hi = t
    return lo * 60, hi * 60


def realistic_history(n, topics, seed=1, era_overlap=0.34, stray=0.10):
    """
    One topic per comment, with eras that overlap instead of switching cleanly.

    A contributor moving from science to philosophy writes both for a while and
    keeps going back. `era_overlap` is how wide each era's influence is as a
    fraction of the life, `stray` is how often a comment lands outside every
    live era.
    """
    rng = np.random.default_rng(seed)
    k = len(topics)
    centres = [(i + 0.5) / k for i in range(k)]
    out = []
    for j in range(n):
        t = (j + 0.5) / n
        w = np.array([math.exp(-((t - c) ** 2) / (2 * era_overlap ** 2)) for c in centres])
        w = w / w.sum()
        if rng.random() < stray:
            out.append(topics[int(rng.integers(k))])
        else:
            out.append(topics[int(rng.choice(k, p=w))])
    return out


def runs(seq):
    out, cur, n = [], seq[0], 1
    for x in seq[1:]:
        if x == cur:
            n += 1
        else:
            out.append((cur, n))
            cur, n = x, 1
    out.append((cur, n))
    return out


def ring_colours_current(per_axis_ring_topic, n_deg=360):
    """The engine's ring: one topic per axis, sharpBlend between neighbours."""
    cols = []
    for d in range(n_deg):
        deg = d * 360 / n_deg
        i = int(deg // 60) % 6
        t = (deg - i * 60) / 60
        a, b = per_axis_ring_topic[i], per_axis_ring_topic[(i + 1) % 6]
        ca = np.array(G.hex_rgb(TOPICS.get(a, ("#8a8278",))[0]), float)
        cb = np.array(G.hex_rgb(TOPICS.get(b, ("#8a8278",))[0]), float)
        cols.append(ca + (cb - ca) * sharp_blend(t))
    return np.array(cols)


def pure_arcs(cols, thresh=14.0):
    """
    Longest run of degrees whose colour is within `thresh` (RGB euclidean) of a
    single palette entry. This is "how much of the ring is painted one season".
    """
    pal = {k: np.array(G.hex_rgb(v[0]), float) for k, v in TOPICS.items()}
    lab = []
    for c in cols:
        best, bd = None, 1e9
        for k, p in pal.items():
            d = float(np.linalg.norm(c - p))
            if d < bd:
                best, bd = k, d
        lab.append(best if bd <= thresh else None)
    n = len(lab)
    best = 0
    for start in range(n):
        if lab[start] is None or (lab[start - 1] == lab[start]):
            continue
        run = 1
        while run < n and lab[(start + run) % n] == lab[start]:
            run += 1
        best = max(best, run)
    if best == 0 and lab[0] is not None and all(x == lab[0] for x in lab):
        best = n
    pure = sum(1 for x in lab if x is not None)
    return best * 360 / n, pure * 360 / n, len({x for x in lab if x})


if __name__ == "__main__":
    lo, hi = hold_span(sharp_blend)
    print("THE BLEND")
    print(f"  sharpBlend: axis A holds 90% from 0.0 to {lo:.1f} degrees, "
          f"B from {hi:.1f} to 60.0, transition {hi - lo:.1f} degrees")
    for name, fn in [("linear", lambda t: t), ("smoothstep", smoothstep), ("sharpBlend", sharp_blend)]:
        a, b = hold_span(fn)
        print(f"  {name:<12} pure span per axis {a * 2:5.1f} degrees, transition {b - a:5.1f}")

    print("\nTHE DATA, Wen Zhao's acuity axis, 21 graduations")
    coarse = ["science_technology"] * 12 + ["philosophy_ethics"] * 9
    real = realistic_history(21, ["science_technology", "philosophy_ethics"], seed=4)
    for lab, h in [("coarse blocks, as the demo data has it", coarse), ("interleaved, as production would", real)]:
        r = runs(h)
        print(f"  {lab:<40} {len(r):2} runs, mean run {np.mean([n for _, n in r]):.1f}, "
              f"longest {max(n for _, n in r)}")

    print("\nTHE RING, six axes at one ring, longest single-season arc")
    print(f"{'data':<34} {'distinct hues':>14} {'longest arc':>13} {'painted pure':>14}")
    rng = np.random.default_rng(9)
    for lab, regime in [("coarse blocks", "coarse"), ("interleaved per comment", "real")]:
        longest, pure, hues = [], [], []
        for trial in range(200):
            if regime == "coarse":
                # Few territories, long blocks: neighbouring axes usually agree.
                pool = ["science_technology", "philosophy_ethics", "psychology_behavior"]
                per_axis = [pool[min(2, int(rng.random() * 1.6))] for _ in range(6)]
            else:
                pool = ["science_technology", "philosophy_ethics", "psychology_behavior"]
                per_axis = [pool[int(rng.integers(3))] for _ in range(6)]
            a, b, c = pure_arcs(ring_colours_current(per_axis))
            longest.append(a); pure.append(b); hues.append(c)
        print(f"{lab:<34} {np.mean(hues):14.2f} {np.mean(longest):12.1f}d {np.mean(pure):13.1f}d")
    print("\nOne comment owns a sixth of the ring in both regimes. Interleaving changes")
    print("how many seasons appear on a ring, and not how much of it any one of them paints.")
