"""
The reading test: unlabelled marks, lettered, shuffled.

Builds three sheets from the seven gallery contributors.

  SHEET-SHIPPED.png     the ring layer exactly as `scripts/profile_gallery.py` renders it
  SHEET-SPECIFIED.png   designer's legibility ruling applied, same geometry underneath
  SHEET-LEDGER.png      designer's one-mark-per-comment render

Each uses its own shuffle, so a reader who sees two of them learns nothing from
the first. The key is written to key.json and is shown to no reader.
"""

import json
import os
import random
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))

from PIL import Image, ImageDraw  # noqa: E402

import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
import ledger_render as L  # noqa: E402
import palette_check as P  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from turbulence_lab import font  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
PROFILES = list(G.PROFILES) + [F.MONO]
LETTERS = "ABCDEFG"
CELL, PAD, COLS = 330, 26, 4

SPECIFIED = T.variant(rings=14, opacity=0.84, stroke=1.15, ramp=0.60, boundary_w=1.75,
                      boundary=True, halo_peak=0.40, halo_throw=42.0, halo_tint=0.60)
BIAS = {"Dolores Vance": -0.9, "Marcus Aurel": 0.25, "Ivy Chen": 0.4}


def sheet(name, seed, draw_one):
    order = list(range(len(PROFILES)))
    random.Random(seed).shuffle(order)
    rows = (len(order) + COLS - 1) // COLS
    CW, CH = CELL + PAD, CELL + 46
    img = Image.new("RGB", (PAD + COLS * CW, 30 + rows * CH), G.BG)
    d = ImageDraw.Draw(img)
    for slot, idx in enumerate(order):
        col, row = slot % COLS, slot // COLS
        x, y = PAD + col * CW, 30 + row * CH
        img.paste(draw_one(PROFILES[idx], idx * 7919 + 13), (x, y))
        d.text((x + CELL // 2 - 8, y + CELL + 8), LETTERS[slot], font=font(26, True), fill=G.INK)
    out = os.path.join(HERE, name)
    img.save(out, optimize=True)
    return out, {LETTERS[s]: PROFILES[i]["name"] for s, i in enumerate(order)}


def shipped(prof, salt):
    G.TOPICS = SHIPPED_PALETTE
    return G.render_one(prof, salt)[0].resize((CELL, CELL), Image.LANCZOS)


def specified(prof, salt):
    G.TOPICS = P.FIXED
    return T.render(prof, salt, SPECIFIED)


def ledger(prof, salt):
    return L.render(L.with_years(prof), 640, BIAS.get(prof["name"], 0.0))[0].resize(
        (CELL, CELL), Image.LANCZOS)


SHIPPED_PALETTE = dict(G.TOPICS)

if __name__ == "__main__":
    keys = {}
    for name, seed, fn in (("SHEET-SHIPPED.png", 20260921, shipped),
                           ("SHEET-SPECIFIED.png", 77712, specified),
                           ("SHEET-LEDGER.png", 4410331, ledger)):
        p, k = sheet(name, seed, fn)
        keys[name.split("-")[1].split(".")[0].lower()] = k
        print("wrote", p)
    with open(os.path.join(HERE, "key.json"), "w") as f:
        json.dump(keys, f, indent=2)
    print(json.dumps(keys, indent=2))
