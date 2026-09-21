"""
The specified settings, applied to the whole gallery plus two worst cases.

Worst case one: a contributor who has only ever written in one territory, which
is Dan's structural point. Worst case two: the same contributor on
politics_governance, whose ring colour is measurably the Breach badge's own hue.

Also prints the redundancy measurement behind cutting the stroke-weight channel.

Run: python council/designer/research/final_gallery.py
"""

import copy
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))

from PIL import Image, ImageChops, ImageDraw, ImageFilter  # noqa: E402

import gallery_probe as G  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from turbulence_lab import font  # noqa: E402

SPEC = T.variant(rings=14, opacity=0.84, stroke=1.15, ramp=0.60,
                 boundary_w=1.75, boundary=True, halo_peak=0.40, halo_throw=42.0)

MONO = {
    "name": "Tom Reilly", "arch": "ONE TERRITORY", "age": "2 years", "resonance": 0.66,
    "note": "Has only ever written about one thing. Hue cannot tell his story, so nothing but shape, "
            "value and texture can.",
    "axes": {
        "acuity": {"grad": 17, "phases": [("politics_governance", 17)], "mix": {"forum": 14, "spark": 3}},
        "calibration": {"grad": 12, "phases": [("politics_governance", 12)], "mix": {"forum": 9, "spark": 2, "fog": 1}},
        "magnanimity": {"grad": 7, "phases": [("politics_governance", 7)], "mix": {"forum": 4, "echo": 2, "heat": 1}},
        "discourse": {"grad": 19, "phases": [("politics_governance", 19)], "mix": {"forum": 11, "spark": 3, "heat": 4, "stance": 1}},
        "consistency": {"grad": 20, "phases": [("politics_governance", 20)], "mix": {"forum": 18, "spark": 2}},
        "reach": {"grad": 3, "phases": [("politics_governance", 3)], "mix": {"forum": 3}},
    },
}


def redundancy():
    """Stroke weight and petal extent are both monotone in graduations at that angle."""
    pairs = []
    for prof in G.PROFILES + [MONO]:
        ax = prof["axes"]
        grad = {a: ax[a]["grad"] for a in G.AXES}
        prog = {a: G.horizon_progress(grad[a]) for a in G.AXES}

        def tradeoff(k):
            if prog[k] == 0:
                return 1.0
            pen = sum(prog[p] * prog[k] * G.PEN
                      for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
            return 1 - min(pen, G.PENCAP)

        for a in G.AXES:
            pairs.append((min(grad[a], 22) / 22, prog[a] ** G.POW * tradeoff(a)))

    def rank(xs):
        order = sorted(range(len(xs)), key=lambda i: xs[i])
        r = [0.0] * len(xs)
        for pos, i in enumerate(order):
            r[i] = pos
        return r

    rx, ry = rank([p[0] for p in pairs]), rank([p[1] for p in pairs])
    n = len(pairs)
    mx, my = sum(rx) / n, sum(ry) / n
    num = sum((rx[i] - mx) * (ry[i] - my) for i in range(n))
    den = math.sqrt(sum((rx[i] - mx) ** 2 for i in range(n)) * sum((ry[i] - my) ** 2 for i in range(n)))
    print(f"STROKE WEIGHT vs PETAL EXTENT across {n} axis instances")
    print(f"  Spearman rank correlation  {num / den:.4f}")
    print("  Both are monotone functions of graduations at that angle. The only thing that")
    print("  separates them is the trade-off factor, which spans 0.70 to 1.00.")
    print("  FINGERPRINT.md lists them as two of seven channels 'none of them sharing'.")


def separation():
    print("\nRING SEPARATION at the specified settings, Dolores Vance")
    print("  14 rings, worst measured gap 3.18px at a 122px radius (palette_and_spacing.py)")
    print(f"  flat stroke {SPEC['stroke']}px, so half-widths sum to {SPEC['stroke']:.2f}px")
    print(f"  clear ground at the worst point on the perimeter: {3.18 - SPEC['stroke']:.2f}px")
    print("  engine as shipped: 29 rings, worst gap 0.21px, strokes up to 1.81px, so they merge")


if __name__ == "__main__":
    redundancy()
    separation()

    profiles = list(G.PROFILES) + [MONO]
    CELL, PAD = T.CELL, 22
    COLS = 4
    rows = (len(profiles) * 2 + COLS - 1) // COLS
    CW, CH = CELL + PAD, CELL + 92
    sheet = Image.new("RGB", (PAD + COLS * CW, 76 + rows * CH), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Before and after, every contributor", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Left of each pair is the engine as it ships. Right is the specified settings: "
                      "exterior halo, 14 rings, flat opacity, value ramp, era boundaries.",
           font=font(11), fill=G.MUTED)

    legacy = T.variant(legacy=True, halo_peak=0.62, halo_throw=30.0)
    cells = []
    for i, prof in enumerate(profiles):
        salt = i * 7919 + 13
        cells.append((f"{prof['name']}, as shipped", T.render(prof, salt, T.variant(
            legacy=True, halo_peak=0.62, halo_throw=30.0)), True))
        cells.append((f"{prof['name']}, specified", T.render(prof, salt, SPEC), False))

    # `legacy=True` still routes the halo through the exterior mask in
    # ring_layer_tuning, so re-render the shipped column with the real thing.
    import legibility_variants as L
    for i, prof in enumerate(profiles):
        cells[i * 2] = (cells[i * 2][0], L.render(prof, i * 7919 + 13, v=0), True)

    for i, (lab, img, is_old) in enumerate(cells):
        col, row = i % COLS, i // COLS
        x, y = PAD + col * CW, 76 + row * CH
        sheet.paste(img.resize((CELL, CELL), Image.LANCZOS), (x, y))
        d.text((x, y + CELL + 8), lab, font=font(11, True), fill=(150, 110, 40) if is_old else G.INK)

    out = os.path.join(HERE, "FINAL-GALLERY.png")
    sheet.save(out, optimize=True)
    print("\nwrote", os.path.normpath(out), sheet.size)
