"""
The corrected palette rendered at the specified settings, against the current one.

Run: python council/designer/research/palette_check.py
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
from PIL import Image, ImageDraw  # noqa: E402
import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from turbulence_lab import font  # noqa: E402

FIXED = {
    "politics_governance": ("#ad302c", "#521212"), "law_justice": ("#a43f00", "#4d1b00"),
    "history": ("#8d5400", "#412600"), "economics": ("#766200", "#362c00"),
    "environment_energy": ("#4c7100", "#213300"), "health_medicine": ("#227454", "#093525"),
    "psychology_behavior": ("#236e7e", "#0b323a"), "science_technology": ("#0066ad", "#00304a"),
    "philosophy_ethics": ("#5658ab", "#262750"), "arts_humanities": ("#7747a8", "#3a1d4d"),
    "theology_spirituality": ("#8d3d93", "#411945"), "society_culture": ("#9d3a68", "#491930"),
}
SPEC = T.variant(**{**F.SPEC, "halo_tint": 0.60})

if __name__ == "__main__":
    picks = [(3, G.PROFILES[3]), (5, G.PROFILES[5]), (2, G.PROFILES[2]), (6, F.MONO)]
    CELL, PAD = T.CELL, 20
    sheet = Image.new("RGB", (PAD + len(picks) * (CELL + PAD), 76 + 2 * (CELL + 44)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Topic palette, current against respaced", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Specified render settings in all eight. Top row is the palette as it stands.",
           font=font(11), fill=G.MUTED)
    real = dict(G.TOPICS)
    for r, pal in enumerate([real, FIXED]):
        y = 76 + r * (CELL + 44)
        G.TOPICS = pal
        for c, (idx, prof) in enumerate(picks):
            x = PAD + c * (CELL + PAD)
            sheet.paste(T.render(prof, idx * 7919 + 13, SPEC), (x, y))
            d.text((x, y + CELL + 6), f"{prof['name']}, {'respaced' if r else 'current'}",
                   font=font(11, True), fill=G.INK)
    G.TOPICS = real
    out = os.path.join(HERE, "PALETTE-CHECK.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
