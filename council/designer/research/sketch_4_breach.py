"""
Sketch 4. One bad day, four years later.

A Breach earns nothing on any pillar, so it has no sector and no colour. It has
a date. In this geometry a date with no pillar is a circle, and what it does is
subtract: the record thins all the way round at that radius.

Top row is Dolores Vance without one. Bottom is the same person with a Breach at
month five, seen at five months, one year, two and a half years and five. The
void stays exactly where it happened and never closes. The record grows past it.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
from turbulence_lab import font  # noqa

if __name__ == "__main__":
    prof = L.with_years(G.PROFILES[5])
    STEPS = [(0.09, "5 months in"), (0.20, "1 year"), (0.50, "2 years 6 months"), (1.0, "5 years")]
    CELL, PAD = 240, 28
    sheet = Image.new("RGB", (PAD*2 + 4*(CELL+24), 2*(CELL+64) + 110), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "One bad day, five years later", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Top: the record with no Breach in it. Bottom: the same person, one Breach at month "
           "five. It subtracts rather than marks, so nothing is coloured and nothing is added.",
           font=font(11), fill=G.MUTED)
    for row, breaches in enumerate([(), (0.09,)]):
        y = 84 + row * (CELL + 64)
        for i, (upto, lab) in enumerate(STEPS):
            x = PAD + i * (CELL + 24)
            sheet.paste(L.field_render_breach(prof, 640, -0.9, px=CELL, breaches=breaches, upto=upto), (x, y))
            if row == 1:
                d.text((x, y + CELL + 8), lab, font=font(11, True), fill=G.INK)
        d.text((PAD + 4*(CELL+24) - 10, y + CELL//2), "", font=font(11), fill=G.MUTED)
    d.text((PAD, 84 + CELL + 26), "no Breach", font=font(12, True), fill=(150,110,40))
    d.text((PAD, 84 + 2*(CELL+64) + 10), "one Breach at month five", font=font(12, True), fill=(150,110,40))
    out = os.path.join(HERE, "SKETCH-4-THE-BREACH.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
