"""
Sketch 6. The wall under colour vision deficiency.

Brettel/Vienot-style LMS projection for deuteranopia, protanopia and tritanopia,
applied to the same twenty-four marks. Colour carries territory, so the question
is what a reader who cannot separate two territories still has left. Size is
tenure and the internal figure is the six pillars, and neither is a hue.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
import numpy as np  # noqa
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
import sketch_3_wall as W  # noqa
from turbulence_lab import font  # noqa

RGB2LMS = np.array([[17.8824, 43.5161, 4.11935],
                    [3.45565, 27.1554, 3.86714],
                    [0.0299566, 0.184309, 1.46709]])
LMS2RGB = np.linalg.inv(RGB2LMS)
SIMS = {
    "deuteranopia": np.array([[1, 0, 0], [0.49421, 0, 1.24827], [0, 0, 1]]),
    "protanopia":   np.array([[0, 2.02344, -2.52581], [0, 1, 0], [0, 0, 1]]),
    "tritanopia":   np.array([[1, 0, 0], [0, 1, 0], [-0.395913, 0.801109, 0]]),
}


def simulate(img, kind):
    a = np.asarray(img).astype(np.float32) / 255.0
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4) * 255.0
    lms = a @ RGB2LMS.T
    out = (lms @ SIMS[kind].T) @ LMS2RGB.T / 255.0
    out = np.clip(out, 0, 1)
    out = np.where(out <= 0.0031308, out * 12.92, 1.055 * out ** (1 / 2.4) - 0.055)
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8))


if __name__ == "__main__":
    profs = [W.make(i) for i in range(24)]
    PX, PAD = 52, 30
    strip = Image.new("RGB", (PAD * 2 + 12 * (PX + 18), PX + 20), G.BG)
    for i, p in enumerate(profs[:12]):
        strip.paste(L.field_render(p, 640, p["bias"], px=PX), (PAD + i * (PX + 18), 10))
    kinds = ["normal"] + list(SIMS)
    sheet = Image.new("RGB", (strip.width, 86 + len(kinds) * (PX + 46)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Twelve marks, four kinds of eye", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Territory is the only channel carried by hue. Tenure is size and the pillars "
           "are the internal figure, and neither of those is a colour.", font=font(11), fill=G.MUTED)
    for j, k in enumerate(kinds):
        y = 82 + j * (PX + 46)
        d.text((PAD, y), k, font=font(11, True), fill=G.INK)
        sheet.paste(strip if k == "normal" else simulate(strip, k), (0, y + 8))
    out = os.path.join(HERE, "SKETCH-6-CVD.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
