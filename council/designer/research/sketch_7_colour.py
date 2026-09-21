"""
Sketch 7. Where the colour goes.

Three schemes on the same records. Territory on hue is what the engine shipped
and what I proposed. Axis on hue is Dan's original intent. Axis on hue with
territory on lightness is the third option, where a change of territory shows as
a band without the palette having to carry twelve categories.

Also measures how far apart twenty-four people's marks are from each other under
each scheme, at the size they sit beside a comment, in normal vision and under
deuteranopia. Distinctiveness between PEOPLE is what a scheme costs or buys.
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
import numpy as np  # noqa
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
import sketch_3_wall as W  # noqa
from sketch_6_cvd import simulate  # noqa
from turbulence_lab import font  # noqa

MODES = [("territory on hue", "territory"), ("axis on hue", "axis"),
         ("axis on hue, territory on lightness", "axis+era")]
STORY = [(2, "Wen Zhao, science then philosophy"), (5, "Dolores Vance, three eras"),
         (3, "Priya Raman, five at once")]


def oklab_img(img):
    a = np.asarray(img).astype(np.float64) / 255.0
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                  [0.2119034982, 0.6806995451, 0.1073969566],
                  [0.0883024619, 0.2817188376, 0.6299787005]])
    lms = np.cbrt(a @ m.T)
    n = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                  [1.9779984951, -2.4285922050, 0.4505937099],
                  [0.0259040371, 0.7827717662, -0.8086757660]])
    return lms @ n.T


def distinctiveness(imgs):
    v = [oklab_img(i).reshape(-1) for i in imgs]
    ds = [float(np.sqrt(np.mean((v[i] - v[j]) ** 2))) for i in range(len(v)) for j in range(i + 1, len(v))]
    return min(ds), float(np.mean(ds))


if __name__ == "__main__":
    profs = [W.make(i) for i in range(24)]
    print(f"{'scheme':<38} {'normal min':>11} {'normal mean':>12} {'deuter min':>11} {'deuter mean':>12}")
    metrics = {}
    for lab, mode in MODES:
        L.COLOUR_MODE = mode
        imgs = [L.field_render(p, 512, p["bias"], px=26) for p in profs]
        sims = [simulate(i, "deuteranopia") for i in imgs]
        a, b = distinctiveness(imgs)
        c, d = distinctiveness(sims)
        metrics[mode] = (a, b, c, d)
        print(f"{lab:<38} {a:11.4f} {b:12.4f} {c:11.4f} {d:12.4f}")

    CELL, PAD, SM = 250, 28, 26
    sheet = Image.new("RGB", (PAD * 2 + 3 * (CELL + 24), 128 + 3 * (CELL + 96)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "Where the colour goes", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "Same three records in every row. Only what hue encodes changes. The strip under "
           "each row is twelve other people at 26px, then the same twelve under deuteranopia.",
           font=font(11), fill=G.MUTED)
    y = 88
    for lab, mode in MODES:
        L.COLOUR_MODE = mode
        d.text((PAD, y), lab, font=font(13, True), fill=G.INK)
        for j, (idx, cap) in enumerate(STORY):
            x = PAD + j * (CELL + 24)
            sheet.paste(L.field_render(G.PROFILES[idx], 640,
                                       {2: 0.0, 5: -0.9, 3: 0.0}[idx], px=CELL, dots=True), (x, y + 20))
            d.text((x, y + CELL + 26), cap, font=font(10), fill=G.MUTED)
        strip = Image.new("RGB", (12 * 34, 30), G.BG)
        for i, p in enumerate(profs[:12]):
            strip.paste(L.field_render(p, 512, p["bias"], px=SM), (i * 34 + 4, 2))
        sheet.paste(strip, (PAD, y + CELL + 42))
        sheet.paste(simulate(strip, "deuteranopia"), (PAD + 12 * 34 + 24, y + CELL + 42))
        d.text((PAD, y + CELL + 76), "twelve people", font=font(9), fill=G.MUTED)
        d.text((PAD + 12 * 34 + 24, y + CELL + 76), "the same twelve, deuteranopia", font=font(9), fill=G.MUTED)
        y += CELL + 96
    out = os.path.join(HERE, "SKETCH-7-COLOUR.png")
    sheet.save(out, optimize=True); print("\nwrote", os.path.normpath(out), sheet.size)
