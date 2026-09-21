"""
Sketch 3. Twenty-four people, at the size a mark sits beside a comment.

If the fingerprint is how you navigate to a person, this is the surface. Same
twenty-four at 26px, at 52px, and three of them opened up. The question is
whether you could learn these the way you learn handwriting.
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
from turbulence_lab import font  # noqa

TOPIC_KEYS = list(L.TOPICS.keys())
NAMES = ["Abbott", "Boye", "Calder", "Dunne", "Ekwueme", "Farrar", "Gethin", "Halloran",
         "Iyer", "Jessop", "Kowal", "Lindqvist", "Mbeki", "Novak", "Okonjo", "Prentice",
         "Quill", "Rasmussen", "Sarto", "Trevelyan", "Ursu", "Vance", "Whitlock", "Yusuf"]
SHAPES = ["arguer", "listener", "builder", "specialist", "drifter", "steady"]
TEMPERS = ["clean", "heated", "foggy", "echoing", "held"]


def rnd(seed):
    x = seed
    while True:
        x = (1103515245 * x + 12345) % 2147483648
        yield x / 2147483648


def make(i):
    r = rnd(i * 7919 + 101)
    shape, temper = SHAPES[i % len(SHAPES)], TEMPERS[(i * 3 + i // 6) % len(TEMPERS)]
    years = round(0.15 + next(r) ** 2 * 5.5, 2)
    n_top = 1 + int(next(r) * 3.4)
    start = int(next(r) * 12)
    topics = [TOPIC_KEYS[(start + j * (1 + int(next(r) * 4))) % 12] for j in range(n_top)]
    lean = {
        "arguer":     dict(acuity=.6, calibration=.4, magnanimity=.25, discourse=1.0, consistency=.8, reach=.4),
        "listener":   dict(acuity=.5, calibration=.8, magnanimity=1.0, discourse=.5, consistency=.7, reach=.5),
        "builder":    dict(acuity=1.0, calibration=.8, magnanimity=.5, discourse=.4, consistency=.9, reach=.3),
        "specialist": dict(acuity=1.0, calibration=.9, magnanimity=.4, discourse=.6, consistency=.6, reach=.15),
        "drifter":    dict(acuity=.35, calibration=.45, magnanimity=.5, discourse=.4, consistency=.35, reach=1.0),
        "steady":     dict(acuity=.7, calibration=.7, magnanimity=.7, discourse=.7, consistency=1.0, reach=.6),
    }[shape]
    mixes = {
        "clean":   dict(forum=.80, spark=.16, echo=.02, fog=.02),
        "heated":  dict(forum=.48, spark=.12, heat=.27, stance=.13),
        "foggy":   dict(forum=.45, spark=.06, fog=.33, echo=.16),
        "echoing": dict(forum=.46, spark=.05, echo=.42, fog=.07),
        "held":    dict(forum=.55, spark=.10, stance=.28, heat=.07),
    }[temper]
    axes, scale = {}, 0.45 + years / 5.5 * 0.9
    for a in G.AXES:
        g = max(1, int(round(lean[a] * 22 * scale * (0.75 + next(r) * 0.5))))
        per = [(t, max(1, int(round(g / n_top)))) for t in topics]
        mix = {k: max(1, int(round(v * g))) for k, v in mixes.items()}
        axes[a] = {"grad": g, "phases": per, "mix": mix}
    return {"name": NAMES[i], "arch": shape, "years": years,
            "resonance": round(0.1 + next(r) * 0.85, 2), "axes": axes,
            "bias": -0.8 if temper == "heated" and next(r) > 0.5 else 0.0}


if __name__ == "__main__":
    profs = [make(i) for i in range(24)]
    PAD, GAP = 30, 22
    small_px, mid_px = 26, 52
    W = 1180
    sheet = Image.new("RGB", (W, 780), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Twenty-four people", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "The same twenty-four at the size a mark sits beside a comment, then at twice it, "
           "then three of them opened up.", font=font(11), fill=G.MUTED)

    y = 88
    d.text((PAD, y), "26px, the row", font=font(11, True), fill=G.INK)
    for i, p in enumerate(profs):
        x = PAD + i * (small_px + 14)
        sheet.paste(L.field_render(p, 640, p["bias"], px=small_px), (x, y + 18))
    y += 18 + small_px + 26
    d.text((PAD, y), "52px, the hover", font=font(11, True), fill=G.INK)
    for i, p in enumerate(profs):
        col, row = i % 12, i // 12
        x = PAD + col * (mid_px + 18)
        sheet.paste(L.field_render(p, 640, p["bias"], px=mid_px), (x, y + 18 + row * (mid_px + 30)))
        d.text((x, y + 18 + row * (mid_px + 30) + mid_px + 4), p["name"][:9], font=font(9), fill=G.MUTED)
    y += 18 + 2 * (mid_px + 30) + 16
    d.text((PAD, y), "230px, the profile", font=font(11, True), fill=G.INK)
    for j, i in enumerate((3, 10, 19)):
        p = profs[i]
        x = PAD + j * 260
        sheet.paste(L.field_render(p, 640, p["bias"], px=230, dots=True), (x, y + 18))
        d.text((x, y + 256), f"{p['name']}, {p['arch']}, {p['years']}y", font=font(11, True), fill=G.INK)
    out = os.path.join(HERE, "SKETCH-3-THE-WALL.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
