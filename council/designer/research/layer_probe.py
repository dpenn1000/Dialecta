"""
Which layer is the colour blob.

Renders Dolores Vance (the most mature profile in the gallery) four ways:
rings alone, rings plus the centre glow, rings plus the resonance halo, and the
full stack as `scripts/profile_gallery.py` ships it. Prints the arithmetic
underneath each layer so the answer is a number rather than an impression.

Run: python council/designer/research/layer_probe.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))

from PIL import Image, ImageDraw, ImageFilter  # noqa: E402

import gallery_probe as G  # noqa: E402
from turbulence_lab import font  # noqa: E402

CELL, MAXR, SUP = 340, 122, 2


def render(profile, salt, halo=True, centre=True, label=""):
    S = CELL * SUP
    layer = Image.new("RGB", (S, S), G.BG)
    d = ImageDraw.Draw(layer)
    cx = cy = S // 2
    rings, dominant, _ = G.build(profile, MAXR * SUP, salt)
    halo_rgb = G.hex_rgb(G.TOPICS.get(dominant or "", ("#b8862e", "#6a4a10"))[0])
    res = profile["resonance"]

    if halo and res > 0:
        rc = res**0.7
        glow = Image.new("L", (S, S), 0)
        ImageDraw.Draw(glow).polygon([(cx + p[0], cy + p[1]) for p in rings[0]], fill=int(70 + rc * 150))
        glow = glow.filter(ImageFilter.GaussianBlur((8 + rc * 22) * SUP * 0.55))
        tint = Image.new("RGB", (S, S), halo_rgb)
        layer = Image.composite(tint, layer, glow.point(lambda v: int(v * (0.25 + rc * 0.6))))
        d = ImageDraw.Draw(layer)

    if centre:
        gl = Image.new("L", (S, S), 0)
        r = MAXR * SUP * 0.5
        ImageDraw.Draw(gl).ellipse([cx - r, cy - r, cx + r, cy + r], fill=48)
        gl = gl.filter(ImageFilter.GaussianBlur(26 * SUP * 0.5))
        layer = Image.composite(Image.new("RGB", (S, S), G.hex_rgb("#f5e8d0")), layer, gl)
        d = ImageDraw.Draw(layer)

    for t in range(0, 360, 4):
        a0, a1 = math.radians(t), math.radians(t + 2)
        d.line([cx + math.cos(a0) * MAXR * SUP, cy + math.sin(a0) * MAXR * SUP,
                cx + math.cos(a1) * MAXR * SUP, cy + math.sin(a1) * MAXR * SUP],
               fill=G.RING_C, width=SUP)

    n = len(rings)
    for k in range(n - 1, -1, -1):
        pts = rings[k]
        if k == 0:
            opacity, base_w, use_deep = 0.95, 1.6, True
        elif k <= 2:
            opacity, base_w, use_deep = 0.78 - (k - 1) * 0.08, 1.2, False
        else:
            interior = (k - 3) / max(1, n - 4)
            opacity, base_w, use_deep = max(0.22, 0.55 - interior * 0.30), 1.25, False
        for j in range(len(pts)):
            x0, y0, c0, deep0, st0, _ = pts[j]
            x1, y1, _, _, st1, _ = pts[(j + 1) % len(pts)]
            col = deep0 if use_deep else c0
            w = max(1, round(base_w * (0.55 + (st0 + st1) / 2 * 0.90) * SUP))
            d.line([cx + x0, cy + y0, cx + x1, cy + y1], fill=G.mix(G.BG, col, opacity), width=w)

    d.ellipse([cx - 4 * SUP, cy - 4 * SUP, cx + 4 * SUP, cy + 4 * SUP], fill=G.hex_rgb("#b8862e"))
    return layer.resize((CELL, CELL), Image.LANCZOS)


def arithmetic(profile):
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in G.AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in G.AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in G.AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    extent = {a: prog[a] ** G.POW * tradeoff(a) * MAXR for a in G.AXES}
    max_grad = max(min(grad[a], 22) for a in G.AXES)
    n_rings = max(4, round(max_grad * 1.15 + 4))
    clearance = MAXR * 0.08
    print(f"  ring count                {n_rings}  (max graduations {max_grad})")
    for a in G.AXES:
        run = extent[a] - clearance
        pur, turb, _ = met[a]
        noise_peak = 1.15 * ((1 - pur) * 4 + 1.8) * 1.4
        wave_peak = 1.6 * turb * 9 * 1.0 * (0.4 + min(grad[a] / 22, 1) * 2.1)
        print(f"  {a:<13} extent {extent[a]:5.1f}px  spacing {run / (n_rings - 1):4.2f}px"
              f"  noise +-{noise_peak:4.2f}px  wave +-{wave_peak:5.2f}px"
              f"  purity {pur:.2f} turb {turb:.2f}")
    res = profile["resonance"]
    rc = res**0.7
    print(f"  halo    mask alpha {int(70 + rc * 150)}/255, composite x{0.25 + rc * 0.6:.2f}"
          f"  => peak tint {(70 + rc * 150) / 255 * (0.25 + rc * 0.6):.2f} of full hue")
    print(f"          blur sigma {(8 + rc * 22) * SUP * 0.55 / SUP:.1f}px at final scale")
    print(f"  centre  mask alpha 48/255 => {48 / 255 * 1.0:.2f} of #f5e8d0 over r={MAXR * 0.5:.0f}px")


if __name__ == "__main__":
    prof = G.PROFILES[5]
    print(f"{prof['name']}, {prof['arch']}")
    arithmetic(prof)

    variants = [("rings only", False, False), ("+ centre glow", False, True),
                ("+ resonance halo", True, False), ("full stack, as shipped", True, True)]
    PAD = 20
    W = PAD + len(variants) * (CELL + PAD)
    sheet = Image.new("RGB", (W, CELL + 92), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Dolores Vance, layer by layer", font=font(19, True), fill=G.INK)
    d.text((PAD, 44), "Same rings in all four. The only difference is which flood layers sit under them.",
           font=font(11), fill=G.MUTED)
    for i, (lab, h, c) in enumerate(variants):
        x = PAD + i * (CELL + PAD)
        sheet.paste(render(prof, salt=5 * 7919 + 13, halo=h, centre=c), (x, 68))
        d.text((x, CELL + 74), lab, font=font(11, True), fill=G.INK)
    out = os.path.join(HERE, "LAYER-PROBE.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
