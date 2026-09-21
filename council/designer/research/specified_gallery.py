"""
Every setting in this position, applied together, on all seven profiles.

Run: python council/designer/research/specified_gallery.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
from PIL import Image, ImageDraw  # noqa: E402
import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
import palette_check as P  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from turbulence_lab import font  # noqa: E402

SPEC = T.variant(rings=14, opacity=0.84, stroke=1.15, ramp=0.60, boundary_w=1.75,
                 boundary=True, halo_peak=0.40, halo_throw=42.0, halo_tint=0.60)

if __name__ == "__main__":
    profiles = list(G.PROFILES) + [F.MONO]
    CELL, PAD, COLS = T.CELL, 24, 4
    rows = (len(profiles) + COLS - 1) // COLS
    CW, CH = CELL + PAD, CELL + 96
    sheet = Image.new("RGB", (PAD + COLS * CW, 78 + rows * CH), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "Every change together", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "Exterior halo at 0.40 peak and 60% toward neutral, 14 rings resampled across the "
           "history, flat opacity and stroke, radial value ramp, era boundaries, respaced palette.",
           font=font(11), fill=G.MUTED)
    G.TOPICS = P.FIXED
    for i, prof in enumerate(profiles):
        col, row = i % COLS, i // COLS
        x, y = PAD + col * CW, 78 + row * CH
        sheet.paste(T.render(prof, i * 7919 + 13, SPEC), (x, y))
        d.text((x, y + CELL + 6), prof["arch"], font=font(11, True), fill=(150, 110, 40))
        d.text((x, y + CELL + 22), prof["name"], font=font(15, True), fill=G.INK)
        words, line, ly = prof["note"].split(), "", y + CELL + 44
        for w in words:
            if d.textlength((line + " " + w).strip(), font=font(11)) > CELL - 4:
                d.text((x, ly), line, font=font(11), fill=G.MUTED); line, ly = w, ly + 14
            else:
                line = (line + " " + w).strip()
        d.text((x, ly), line, font=font(11), fill=G.MUTED)
    out = os.path.join(HERE, "SPECIFIED-GALLERY.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
