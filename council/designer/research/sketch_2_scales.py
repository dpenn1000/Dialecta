"""
Sketch 2. The two ends where identity marks die, and the one in the middle.

24px is the row beside a comment. 240px is the profile. The print version is one
colour with no grey ramp beyond what a halftone holds. Same record in all of them.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
from turbulence_lab import font  # noqa

BIAS = {"Dolores Vance": -0.9, "Marcus Aurel": 0.25, "Ivy Chen": 0.4}
SIZES = [24, 40, 64, 112, 208]

if __name__ == "__main__":
    prof = G.PROFILES[5]
    b = BIAS[prof["name"]]
    PAD = 28
    W = PAD * 2 + sum(s + 26 for s in SIZES) + 360
    sheet = Image.new("RGB", (W, 88 + 4 * (SIZES[-1] + 24) + 20), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Dolores Vance at every size", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Outline alone, field, field with the events drawn, and the print version. "
           "The outline is the only thing that survives on its own, and it does not survive far.",
           font=font(11), fill=G.MUTED)

    rows = [
        ("outline alone", dict(dots=False, ink=False, only_outline=True)),
        ("the field", dict(dots=False, ink=False, only_outline=False)),
        ("field and events", dict(dots=True, ink=False, only_outline=False)),
        ("one colour, for print", dict(dots=True, ink=True, only_outline=False)),
    ]
    y = 88
    for lab, kw in rows:
        x = PAD
        for s in SIZES:
            if kw["only_outline"]:
                img = L.small(L.with_years(prof), s, b, bg=(255, 255, 255) if kw["ink"] else None)
            else:
                img = L.field_render(prof, 640, b, px=s, ink=kw["ink"], dots=kw["dots"])
            sheet.paste(img, (x, y + (SIZES[-1] - s) // 2))
            if lab == rows[0][0]:
                d.text((x, y - 16), f"{s}px", font=font(10), fill=G.MUTED)
            x += s + 26
        d.text((x + 10, y + SIZES[-1] // 2 - 6), lab, font=font(13, True), fill=G.INK)
        y += SIZES[-1] + 24
    out = os.path.join(HERE, "SKETCH-2-SCALES.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
