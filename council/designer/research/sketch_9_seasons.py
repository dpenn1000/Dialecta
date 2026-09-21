"""
Sketch 9. How far one season's colour spreads.

Row 1 is what Dan is looking at: the engine's blend on the coarse demo data.
Row 2 is the same engine on a per-comment history of the kind production would
produce, which is how much of the problem is the test data. Row 3 earns the
angular extent instead of granting it. Row 4 adds the radial bleed and the
blank core.

Run: python council/designer/research/sketch_9_seasons.py
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

from PIL import Image, ImageDraw  # noqa: E402

import gallery_probe as G  # noqa: E402
import ring_seasons as R  # noqa: E402
from turbulence_lab import font  # noqa: E402

PICKS = [(2, "Wen Zhao"), (5, "Dolores Vance"), (3, "Priya Raman")]
ROWS = [
    ("current blend, coarse demo data", "current", False),
    ("current blend, per-comment history", "current", True),
    ("extent earned per tick", "subtick", True),
    ("earned, plus radial bleed and a blank core", "scoped", True),
]

if __name__ == "__main__":
    CELL, SMALL, PAD, S = 232, 46, 30, 560
    W = PAD * 2 + 3 * (CELL + 20) + 150
    sheet = Image.new("RGB", (W, 108 + len(ROWS) * (CELL + 40)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "How far one season spreads", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "Same three records, same geometry, same palette. Only the angular scope of one "
                      "comment's colour changes.", font=font(11), fill=G.MUTED)
    d.text((PAD, 70), "Longest single-season arc, averaged over rings: 84 degrees, then 52, then 26.",
           font=font(11), fill=(150, 110, 40))

    y = 96
    for lab, mode, real in ROWS:
        for c, (idx, name) in enumerate(PICKS):
            x = PAD + c * (CELL + 20)
            img = R.render(G.PROFILES[idx], mode, S, px=CELL, realistic=real)
            sheet.paste(img.resize((CELL, CELL), Image.LANCZOS), (x, y))
            if y == 96:
                d.text((x, y - 14), name, font=font(11, True), fill=(150, 110, 40))
        x = PAD + 3 * (CELL + 20)
        small = R.render(G.PROFILES[5], mode, S, px=SMALL, realistic=real)
        sheet.paste(small, (x, y + 10))
        sheet.paste(R.render(G.PROFILES[5], mode, S, px=24, realistic=real), (x + SMALL + 14, y + 21))
        d.text((x, y + SMALL + 20), "46px", font=font(9), fill=G.MUTED)
        d.text((x + SMALL + 14, y + SMALL + 20), "24px", font=font(9), fill=G.MUTED)
        d.text((PAD, y + CELL + 8), lab, font=font(12, True), fill=G.INK)
        y += CELL + 40

    out = os.path.join(HERE, "SKETCH-9-SEASONS.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
