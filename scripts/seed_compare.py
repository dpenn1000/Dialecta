"""
The three ring-seed schemes rendered as actual fingerprints.

Run: python scripts/seed_compare.py
"""
import math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from turbulence_lab import AXES, BG, INK, MUTED, RING_C, build_rings, font

MAXR, CELL, PAD = 120, 276, 18
TEAL = (46, 116, 120)
PROFILE = {"acuity": 20, "calibration": 13, "magnanimity": 16, "discourse": 9, "consistency": 19, "reach": 14}
MODES = [("Linear seed", "k * 11.7 + 3.3, as built", "linear"),
         ("Hashed seed", "every ring independent", "hashed"),
         ("Random walk", "neighbours correlated, no drift", "walk")]
COLS = [("Calm", 0.05), ("Some heat", 0.35), ("Turbulent", 0.75)]

f_t, f_h, f_c = font(16, True), font(13, True), font(11)
W = 176 + len(COLS) * (CELL + PAD)
H = 74 + len(MODES) * (CELL + 20)
im = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(im)
d.text((PAD, 14), "Ring seed, three ways, on one contributor", font=f_t, fill=INK)
d.text((PAD, 38), "Same axis history and same turbulence in every column. Only the per-ring phase differs.", font=f_c, fill=MUTED)
for j, (lab, _) in enumerate(COLS):
    x = 176 + j * (CELL + PAD)
    d.text((x + (CELL - d.textlength(lab, font=f_h)) / 2, 58), lab, font=f_h, fill=MUTED)

y = 78
for rlab, rnote, mode in MODES:
    d.text((PAD, y + CELL // 2 - 18), rlab, font=f_h, fill=INK)
    d.text((PAD, y + CELL // 2 + 2), rnote, font=f_c, fill=MUTED)
    for j, (_, turb) in enumerate(COLS):
        cx, cy = 176 + j * (CELL + PAD) + CELL // 2, y + CELL // 2
        d.ellipse([cx - MAXR, cy - MAXR, cx + MAXR, cy + MAXR], outline=RING_C)
        rings = build_rings(PROFILE, {a: turb for a in AXES}, {a: 1 - turb * 0.7 for a in AXES},
                            MAXR, "symmetric", mode)
        n = len(rings)
        for k, pts in enumerate(rings):
            fade = 0.38 + 0.62 * (1 - k / max(1, n - 1))
            col = tuple(int(c + (BG[q] - c) * (1 - fade)) for q, c in enumerate(TEAL))
            d.polygon([(cx + px, cy + py) for px, py in pts], outline=col)
        d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(184, 134, 46))
    y += CELL + 20

out = os.path.join(os.path.dirname(__file__), "..", "docs", "fingerprint-examples", "SEED-COMPARE.png")
im.save(out, optimize=True); print("wrote", os.path.normpath(out), im.size)
