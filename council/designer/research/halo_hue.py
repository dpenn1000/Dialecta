"""
The halo's hue is `dominantTopic`. So is most of the rings'. Two of the seven
channels take the same input, and the halo covers the larger area, so on a
one-territory contributor it doubles the single-hue field.

Three treatments. Ring colour is identical in all nine tiles.

Run: python council/designer/research/halo_hue.py
"""

import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))

from PIL import Image, ImageDraw  # noqa: E402

import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from turbulence_lab import font  # noqa: E402

if __name__ == "__main__":
    cases = [("halo on dominant topic", 0.0), ("halo 60% toward neutral", 0.60),
             ("halo fully neutral", 1.0)]
    picks = [(6, F.MONO), (4, G.PROFILES[4]), (5, G.PROFILES[5])]
    CELL, PAD = T.CELL, 20
    sheet = Image.new("RGB", (PAD + len(cases) * (CELL + PAD), 76 + len(picks) * (CELL + 44)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Halo hue, three treatments", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Ring colour is identical in all nine. Only the halo's hue changes.",
           font=font(11), fill=G.MUTED)
    for r, (idx, prof) in enumerate(picks):
        y = 76 + r * (CELL + 44)
        d.text((PAD, y - 14), prof["name"], font=font(11, True), fill=(150, 110, 40))
        for c, (lab, tint) in enumerate(cases):
            x = PAD + c * (CELL + PAD)
            sheet.paste(T.render(prof, idx * 7919 + 13, T.variant(**{**F.SPEC, "halo_tint": tint})), (x, y))
            d.text((x, y + CELL + 6), lab, font=font(11, True), fill=G.INK)
    out = os.path.join(HERE, "HALO-HUE.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
