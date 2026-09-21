"""
Sketch 10. The scoped ring model against the ledger model.

Same three records, the same per-comment history under both, at the three sizes
that matter. Plus the same longest-single-season-arc measurement run on the
ledger field, so the two models are compared on one number rather than on taste.

Run: python council/designer/research/sketch_10_ring_vs_ledger.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import gallery_probe as G  # noqa: E402
import ledger_render as L  # noqa: E402
import ring_seasons as R  # noqa: E402
from palette_check import FIXED as TOPICS  # noqa: E402
from turbulence_lab import font  # noqa: E402

PICKS = [(2, "Wen Zhao"), (5, "Dolores Vance"), (3, "Priya Raman")]
BIAS = {5: -0.9}


def ledger_rows(profile, S=512, bias=0.0, n_rings=14):
    """
    Sample the ledger field's colour around circles at the same radii the ring
    model draws, so the same metric can be run on it.
    """
    p = L.with_years(profile)
    ev = L.synth_ledger(p, bias)
    marks = L.place(ev, S, p["years"])
    D, C = L.colour_field(marks, S)
    cx = cy = S / 2
    rmax = L.tenure_radius(p["years"], S)
    rows = []
    for k in range(n_rings):
        rad = rmax * (1 - k / n_rings) * 0.92 + S * 0.03
        row = np.zeros((R.N_DEG, 3))
        for d in range(R.N_DEG):
            a = d / R.N_DEG * 2 * math.pi
            x = int(np.clip(cx + math.cos(a) * rad, 0, S - 1))
            y = int(np.clip(cy + math.sin(a) * rad, 0, S - 1))
            row[d] = C[y, x] if D[y, x] > 0.05 else np.array(G.BG, dtype=float)
        rows.append(row)
    return rows


if __name__ == "__main__":
    print(f"{'contributor':<16} {'model':<34} {'longest single-season arc':>26}")
    tot = {}
    for idx, name in PICKS:
        prof = G.PROFILES[idx]
        for lab, rows in [
            ("ring, current blend, coarse data", R.build(prof, "current", 640, realistic=False)[1]),
            ("ring, current blend, per-comment", R.build(prof, "current", 640, realistic=True)[1]),
            ("ring, extent earned per tick", R.build(prof, "subtick", 640, realistic=True)[1]),
            ("ledger, one mark per comment", ledger_rows(prof, bias=BIAS.get(idx, 0.0))),
        ]:
            v = R.longest_pure_arc(rows)
            tot.setdefault(lab, []).append(v)
            print(f"{name:<16} {lab:<34} {v:20.1f} degrees")
    print(f"\n{'':<16} {'mean of the three':<34}")
    for lab, vs in tot.items():
        print(f"{'':<16} {lab:<34} {np.mean(vs):20.1f} degrees")

    SIZES = [(232, "232px, the profile"), (64, "64px"), (26, "26px, the row")]
    PAD = 30
    W = PAD * 2 + 3 * (232 + 24)
    sheet = Image.new("RGB", (W, 120 + 2 * (232 + 108)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "The scoped ring against the ledger", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "The same per-comment history under both. The ring model earns its arcs and still "
                      "divides a fixed sector; the ledger has no sector to divide.",
           font=font(11), fill=G.MUTED)
    y = 88
    for row_lab, kind in [("ring model, extent earned per tick", "ring"), ("ledger model", "ledger")]:
        for c, (idx, name) in enumerate(PICKS):
            x = PAD + c * (232 + 24)
            prof = G.PROFILES[idx]
            if kind == "ring":
                big = R.render(prof, "subtick", 560, px=232, realistic=True)
                small = [R.render(prof, "subtick", 560, px=s, realistic=True) for s, _ in SIZES[1:]]
            else:
                L.COLOUR_MODE = "territory"
                big = L.field_render(prof, 560, BIAS.get(idx, 0.0), px=232)
                small = [L.field_render(prof, 560, BIAS.get(idx, 0.0), px=s) for s, _ in SIZES[1:]]
            sheet.paste(big.resize((232, 232), Image.LANCZOS), (x, y))
            sheet.paste(small[0], (x, y + 240))
            sheet.paste(small[1], (x + 78, y + 259))
            if y == 88:
                d.text((x, y - 14), name, font=font(11, True), fill=(150, 110, 40))
            d.text((x, y + 310), "64px        26px", font=font(9), fill=G.MUTED)
        d.text((PAD, y + 326), row_lab, font=font(13, True), fill=G.INK)
        y += 232 + 108
    out = os.path.join(HERE, "SKETCH-10-RING-VS-LEDGER.png")
    sheet.save(out, optimize=True)
    print("\nwrote", os.path.normpath(out), sheet.size)
