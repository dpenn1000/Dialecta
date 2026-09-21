"""
The spiral, shown in the coordinates that make it obvious.

Unrolls the ring texture: x is angle around the perimeter, y is ring index from
outermost down. In this space a pattern that does not rotate makes VERTICAL
stripes, and a pattern rotating a constant amount per ring makes SLANTED ones.
The slope is the rotation rate, and a slant is a spiral.

Run: python scripts/spiral_unroll.py
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
from turbulence_lab import OCTAVES, font, ring_seed_for

RINGS, WIDE, TALL, PAD = 26, 300, 150, 18
BG, INK, MUTED = (247, 242, 232), (28, 24, 20), (122, 112, 104)
SEED_STEP = 11.7


def rot_per_ring(f, c):
    per, period = (SEED_STEP * c) / f, 2 * math.pi / f
    eff = per % period
    return math.degrees(eff - period if eff > period / 2 else eff)


def field(only, seed_mode):
    im = Image.new("RGB", (WIDE, TALL))
    px = im.load()
    for yy in range(TALL):
        k = yy * RINGS / TALL
        seed = ring_seed_for(k, seed_mode)
        for xx in range(WIDE):
            theta = xx / WIDE * 2 * math.pi
            v = 0.0
            for i, (f, c, k0, amp) in enumerate(OCTAVES):
                if only is None or i == only:
                    v += math.sin(theta * f + seed * c + k0) * amp
            n = max(0.0, min(1.0, (v / 1.15 + 1) / 2))
            px[xx, yy] = (int(46 + (247 - 46) * n), int(116 + (242 - 116) * n), int(120 + (232 - 120) * n))
    return im


cols = [(i, f"theta x {f}", f"{rot_per_ring(f, c):+.1f} deg/ring") for i, (f, c, _, _) in enumerate(OCTAVES)]
cols.append((None, "all four", "as rendered"))
rows = [("Linear seed", "k * 11.7 + 3.3", "linear"), ("Hashed seed", "decorrelated", "hashed")]

f_t, f_h, f_c, f_s = font(16, True), font(13, True), font(11), font(11, True)
W = 150 + len(cols) * (WIDE + PAD)
H = 78 + len(rows) * (TALL + 46)
sheet = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(sheet)
d.text((PAD, 14), "The same texture unrolled: x is angle, y is ring index. A slant is a spiral.", font=f_t, fill=INK)
d.text((PAD, 38), "Vertical stripes mean the pattern holds still from ring to ring. Slanted ones mean it rotates.", font=f_c, fill=MUTED)

for j, (_, lab, _) in enumerate(cols):
    x = 150 + j * (WIDE + PAD)
    d.text((x + (WIDE - d.textlength(lab, font=f_h)) / 2, 58), lab, font=f_h, fill=MUTED)

y = 80
for rlab, rnote, seed_mode in rows:
    d.text((PAD, y + TALL // 2 - 16), rlab, font=f_h, fill=INK)
    d.text((PAD, y + TALL // 2 + 3), rnote, font=f_c, fill=MUTED)
    for j, (only, _, note) in enumerate(cols):
        x = 150 + j * (WIDE + PAD)
        sheet.paste(field(only, seed_mode), (x, y))
        d.rectangle([x, y, x + WIDE - 1, y + TALL - 1], outline=(214, 206, 188))
        if seed_mode == "linear" and only is not None:
            hot = abs(float(note.split()[0])) > 20
            d.text((x + (WIDE - d.textlength(note, font=f_s)) / 2, y + TALL + 7), note, font=f_s,
                   fill=(150, 60, 40) if hot else MUTED)
    y += TALL + 46

out = os.path.join(os.path.dirname(__file__), "..", "docs", "fingerprint-examples", "SPIRAL-UNROLLED.png")
sheet.save(out, optimize=True)
print("wrote", os.path.normpath(out), sheet.size)
