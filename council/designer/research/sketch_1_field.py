"""Sketch 1. Seven contributors, drawn from the ledger instead of from six numbers."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import final_gallery as F, gallery_probe as G, ledger_render as L  # noqa
from turbulence_lab import font  # noqa

BIAS = {"Dolores Vance": -0.9, "Marcus Aurel": 0.25, "Ivy Chen": 0.4}

if __name__ == "__main__":
    profs = list(G.PROFILES) + [F.MONO]
    CELL, PAD, COLS, S = 330, 24, 4, 640
    rows = (len(profs) + COLS - 1) // COLS
    sheet = Image.new("RGB", (PAD + COLS*(CELL+PAD), 80 + rows*(CELL+96)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "One mark per comment", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "Angle is the pillar the comment moved, radius is when, colour is the territory, "
           "form is the tier. Nobody drew the outline.", font=font(11), fill=G.MUTED)
    for i, p in enumerate(profs):
        x, y = PAD + (i % COLS)*(CELL+PAD), 80 + (i // COLS)*(CELL+96)
        img, marks = L.render(L.with_years(p), S, BIAS.get(p["name"], 0.0))
        sheet.paste(img.resize((CELL, CELL), Image.LANCZOS), (x, y))
        d.text((x, y+CELL+6), p["arch"], font=font(11, True), fill=(150,110,40))
        d.text((x, y+CELL+22), f"{p['name']}", font=font(15, True), fill=G.INK)
        d.text((x, y+CELL+44), f"{len(marks)} comments, {L.YEARS.get(p[chr(34)+'name'+chr(34)] if False else p['name'],1.0)}y", font=font(11), fill=G.MUTED)
    out = os.path.join(HERE, "SKETCH-1-THE-FIELD.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
