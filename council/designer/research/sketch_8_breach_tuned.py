"""
Sketch 8. One bad day, retuned.

Dan, on the first version: "it looks like one bad day takes over the entire
centre with a massive glow for years. There needs to be more nuance."

Top row is that version: an additive subtraction that drove the field negative
and cut a moat around the core. Middle is the same Breach on the new curve, which
thins rather than removes. Bottom is five over eighteen months, which is the case
the design has to keep telling apart from one bad day.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
from turbulence_lab import font  # noqa

STEPS = [(0.5, "6 months"), (1.0, "1 year"), (2.5, "2 years 6 months"), (5.0, "5 years")]

if __name__ == "__main__":
    prof = L.with_years(G.PROFILES[5])
    L.COLOUR_MODE = "territory"
    CELL, PAD = 206, 30
    sheet = Image.new("RGB", (PAD*2 + 4*(CELL+22), 124 + 3*(CELL+60)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "One bad day, and a pattern of them", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "A Breach now thins the record instead of cutting it, at the width the record was on "
           "the day, by a depth that falls from 62% to a 7% hairline.", font=font(11), fill=G.MUTED)
    d.text((PAD, 70), "62% on the day, 40% at three months, 27% at six, 14% at one year, 8% at two, "
           "7% from then on. Five compound to 30%.", font=font(11), fill=(150, 110, 40))

    rows = [("the version Dan saw: subtraction, so the field went negative and the core detached", "old", (0.42,)),
            ("one Breach at month five, on the curve", "new", (0.42,)),
            ("five Breaches over eighteen months", "new", (0.42, 0.7, 0.95, 1.3, 1.75))]
    y = 100
    for lab, kind, br in rows:
        for i, (yr, cap) in enumerate(STEPS):
            x = PAD + i * (CELL + 22)
            if kind == "old":
                up = yr / prof["years"]
                img = L.field_render_breach(prof, 640, -0.9, px=CELL, breaches=(0.09,), upto=up)
            else:
                img = L.render_at(prof, 640, -0.9, px=CELL, breaches=br, years=yr)
            sheet.paste(img, (x, y))
            if lab.startswith("five"):
                d.text((x, y + CELL + 32), cap, font=font(11, True), fill=G.INK)
        d.text((PAD, y + CELL + 10), lab, font=font(12, True), fill=(150, 110, 40))
        y += CELL + 60
    out = os.path.join(HERE, "SKETCH-8-BREACH-TUNED.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
