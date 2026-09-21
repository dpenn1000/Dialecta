"""
Two more conditions for the reading test.

SINGLES: each contributor's mark alone, under a random file name, so a reader
sees one person with nothing to compare against. That is Dan's sentence taken
literally: look at A fingerprint and get a feel for this person. The seven-way
matching task lets a reader eliminate; this one does not.

SMALL: the same seven, shuffled again, at 64px, roughly where a mark sits on a
share card or beside a byline.
"""

import json
import os
import random
import string
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PIL import Image, ImageDraw  # noqa: E402

import sheets as S  # noqa: E402
import gallery_probe as G  # noqa: E402
from turbulence_lab import font  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))

if __name__ == "__main__":
    rng = random.Random(90210)
    key = {}
    for idx, prof in enumerate(S.PROFILES):
        tag = "".join(rng.choice(string.ascii_lowercase) for _ in range(6))
        img = S.shipped(prof, idx * 7919 + 13)
        img.save(os.path.join(HERE, f"MARK-{tag}.png"), optimize=True)
        key[tag] = prof["name"]
    order = list(range(len(S.PROFILES)))
    random.Random(55501).shuffle(order)
    PX, PAD = 64, 22
    sheet = Image.new("RGB", (PAD + 7 * (PX + PAD), 30 + PX + 44), G.BG)
    d = ImageDraw.Draw(sheet)
    small = {}
    for slot, idx in enumerate(order):
        x = PAD + slot * (PX + PAD)
        big = S.shipped(S.PROFILES[idx], idx * 7919 + 13)
        sheet.paste(big.resize((PX, PX), Image.LANCZOS), (x, 30))
        d.text((x + PX // 2 - 6, 30 + PX + 8), S.LETTERS[slot], font=font(18, True), fill=G.INK)
        small[S.LETTERS[slot]] = S.PROFILES[idx]["name"]
    sheet.save(os.path.join(HERE, "SHEET-SMALL.png"), optimize=True)
    with open(os.path.join(HERE, "key-singles.json"), "w") as f:
        json.dump({"singles": key, "small": small}, f, indent=2)
    print(json.dumps({"singles": key, "small": small}, indent=2))
