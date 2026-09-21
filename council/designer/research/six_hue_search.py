"""
Can six categories survive colour vision deficiency, and what does it cost.

Searches OKLCH for six colours maximising the WORST pairwise separation across
normal vision and all three dichromacies at once, because a categorical palette
is decided by its closest pair. Run free, and run anchored so each colour stays
in the hue family the engine already uses.

Run: python council/designer/research/six_hue_search.py
"""
import math, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
import numpy as np  # noqa
import gallery_probe as G  # noqa
from axis_hue_audit import AXIS_HUE, dE, sim_rgb  # noqa
from palette_and_spacing import contrast, srgb_to_oklch  # noqa
from palette_respace import oklch_to_srgb  # noqa
from sketch_6_cvd import SIMS  # noqa

VIEWS = ["normal"] + list(SIMS)
AXES = ["acuity", "calibration", "magnanimity", "discourse", "consistency", "reach"]
MIN_CONTRAST = 3.6


def in_gamut(L, C, H):
    rgb = oklch_to_srgb(L, C, H)
    L2, C2, H2 = srgb_to_oklch(rgb)
    return abs(L2 - L) < 0.006 and abs(C2 - C) < 0.006 and rgb


def candidates():
    out = []
    for H in range(0, 360, 4):
        for L in [x / 100 for x in range(36, 73, 3)]:
            best = None
            for C in [x / 1000 for x in range(200, 30, -5)]:
                rgb = in_gamut(L, C, float(H))
                if rgb:
                    best = rgb
                    break
            if best and contrast(best, G.BG) >= MIN_CONTRAST:
                out.append((best, L, float(H)))
    return out


def score(sel):
    worst = 9.9
    for v in VIEWS:
        cols = [c if v == "normal" else sim_rgb(c, v) for c, _, _ in sel]
        for i in range(len(cols)):
            for j in range(i + 1, len(cols)):
                worst = min(worst, dE(cols[i], cols[j]))
    return worst


def search(pool, anchors=None, iters=26000, seed=7):
    rng = random.Random(seed)
    if anchors:
        pool_by_axis = []
        for a in AXES:
            h0 = srgb_to_oklch(G.hex_rgb(AXIS_HUE[a]))[2]
            pool_by_axis.append([c for c in pool if abs(((c[2] - h0 + 180) % 360) - 180) <= anchors])
        sel = [rng.choice(p) for p in pool_by_axis]
    else:
        pool_by_axis = [pool] * 6
        sel = rng.sample(pool, 6)
    best, bs = list(sel), score(sel)
    for _ in range(iters):
        i = rng.randrange(6)
        trial = list(best)
        trial[i] = rng.choice(pool_by_axis[i])
        s = score(trial)
        if s > bs:
            best, bs = trial, s
    return best, bs


def report(name, sel, sc):
    print(f"\n{name}   worst pair across all four views: {sc:.4f}")
    for a, (rgb, L, H) in zip(AXES, sel):
        hexv = "#%02x%02x%02x" % rgb
        print(f"  {a:<13} {hexv}  L {L:.2f}  H {H:5.1f}  vs page {contrast(rgb, G.BG):5.2f}:1"
              f"   was {AXIS_HUE[a]}")
    for v in VIEWS:
        cols = [c if v == "normal" else sim_rgb(c, v) for c, _, _ in sel]
        ds = [(dE(cols[i], cols[j]), AXES[i], AXES[j])
              for i in range(6) for j in range(i + 1, 6)]
        m = min(ds)
        print(f"  {v:<13} closest {m[0]:.4f}  ({m[1]} / {m[2]})")
    print("  python literal")
    for a, (rgb, _, _) in zip(AXES, sel):
        print(f'    "{a}": "#%02x%02x%02x",' % rgb)


if __name__ == "__main__":
    pool = candidates()
    print(f"{len(pool)} candidate colours in sRGB at >= {MIN_CONTRAST}:1 against the page")

    cur = [(G.hex_rgb(AXIS_HUE[a]), 0, 0) for a in AXES]
    print(f"\nthe engine's six, scored the same way: {score(cur):.4f}")

    sel_a, sc_a = search(pool, anchors=46)
    report("ANCHORED, each colour stays within 46 degrees of its current hue", sel_a, sc_a)

    sel_f, sc_f = search(pool, anchors=None)
    report("FREE", sel_f, sc_f)

    print(f"\n\nWORST PAIR, the number that decides a categorical palette")
    print(f"  twelve territories, respaced   0.0018   (deuteranopia)")
    print(f"  six axes, as the engine has them {score(cur):.4f}")
    print(f"  six axes, anchored rebuild      {sc_a:.4f}")
    print(f"  six axes, free rebuild          {sc_f:.4f}")
