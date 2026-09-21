"""
Isolates the spiral in the fingerprint's ring texture.

The engine seeds each ring with `ringSeed = k * 11.7 + 3.3` and comments that
this exists "so adjacent rings wiggle differently". The seed is used as a PHASE
on every sine, and a phase offset on a function of theta is an angular rotation
of that harmonic. A seed that advances linearly in k rotates every ring by a
constant angle from the one inside it, which is how you construct a spiral, not
how you decorrelate.

Columns isolate each octave. Rows compare the linear seed against a hashed one.

Run: python scripts/spiral_probe.py
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from turbulence_lab import AXES, BG, INK, MUTED, RING_C, OCTAVES, build_rings, font

MAXR, CELL, PAD = 118, 272, 16
GRAD = {a: 20 for a in AXES}
CALM = {a: 0.0 for a in AXES}
PURE = {a: 1.0 for a in AXES}
SEED_STEP = 11.7


def rot_per_ring(f, c):
    per, period = (SEED_STEP * c) / f, 2 * math.pi / f
    eff = per % period
    if eff > period / 2:
        eff -= period
    return math.degrees(eff)


cols = [(i, f"theta x {f}", f"{rot_per_ring(f, c):+.1f} deg/ring") for i, (f, c, _, _) in enumerate(OCTAVES)]
cols.append((None, "all four", "as rendered"))
rows = [("Linear seed", "k * 11.7 + 3.3, as built", "linear"), ("Hashed seed", "no linear step between rings", "hashed")]

f_t, f_h, f_c, f_s = font(16, True), font(13, True), font(11), font(11, True)
W = 168 + len(cols) * (CELL + PAD)
H = 74 + len(rows) * (CELL + 40)
im = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(im)
d.text((PAD, 14), "The spiral: a linear ring seed used as a phase rotates every ring by a constant angle", font=f_t, fill=INK)
d.text((PAD, 38), "Turbulence is zero in every cell. This is base organic noise alone.", font=f_c, fill=MUTED)

for j, (_, lab, note) in enumerate(cols):
    x = 168 + j * (CELL + PAD)
    d.text((x + (CELL - d.textlength(lab, font=f_h)) / 2, 58), lab, font=f_h, fill=MUTED)

y = 80
for rlab, rnote, seed_mode in rows:
    d.text((PAD, y + CELL // 2 - 18), rlab, font=f_h, fill=INK)
    d.text((PAD, y + CELL // 2 + 1), rnote, font=f_c, fill=MUTED)
    for j, (only, _, note) in enumerate(cols):
        cx, cy = 168 + j * (CELL + PAD) + CELL // 2, y + CELL // 2
        d.ellipse([cx - MAXR, cy - MAXR, cx + MAXR, cy + MAXR], outline=RING_C)
        rings = build_rings(GRAD, CALM, PURE, MAXR, "symmetric", seed_mode, only)
        n = len(rings)
        for k, pts in enumerate(rings):
            fade = 0.4 + 0.6 * (1 - k / max(1, n - 1))
            col = tuple(int(c + (BG[q] - c) * (1 - fade)) for q, c in enumerate((46, 116, 120)))
            d.polygon([(cx + px, cy + py) for px, py in pts], outline=col)
        d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(184, 134, 46))
        if seed_mode == "linear" and only is not None:
            d.text((cx - d.textlength(note, font=f_s) / 2, cy + MAXR + 8), note, font=f_s,
                   fill=(150, 60, 40) if abs(float(note.split()[0])) > 20 else MUTED)
    y += CELL + 40

out = os.path.join(os.path.dirname(__file__), "..", "docs", "fingerprint-examples", "SPIRAL-PROBE.png")
im.save(out, optimize=True)
print("wrote", os.path.normpath(out), im.size)
