"""The ledger's small-size answer, the field, at the same 64px as SHEET-SMALL."""
import json, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw
import sheets as S
import gallery_probe as G
import ledger_render as L
from turbulence_lab import font

HERE = os.path.dirname(os.path.abspath(__file__))
order = list(range(7)); random.Random(31337).shuffle(order)
PX, PAD = 64, 22
sheet = Image.new("RGB", (PAD + 7 * (PX + PAD), 30 + PX + 44), G.BG)
d = ImageDraw.Draw(sheet)
key = {}
for slot, idx in enumerate(order):
    p = S.PROFILES[idx]
    img = L.field_render(p, 640, S.BIAS.get(p["name"], 0.0), px=PX)
    x = PAD + slot * (PX + PAD)
    sheet.paste(img, (x, 30))
    d.text((x + PX // 2 - 6, 30 + PX + 8), S.LETTERS[slot], font=font(18, True), fill=G.INK)
    key[S.LETTERS[slot]] = p["name"]
sheet.save(os.path.join(HERE, "SHEET-SMALL-FIELD.png"), optimize=True)
print(json.dumps(key, indent=2))
