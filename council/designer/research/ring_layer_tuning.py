"""
Round two. The exterior halo is settled, so everything here is the ring layer.

Round one showed two things. Masking the halo to the exterior is the whole
difference between a coloured mass and a drawn object. And the engine's opacity
ramp, which fades interior rings to 0.22, fades out the oldest history, which is
the part of the story a viewer most needs to see.

Run: python council/designer/research/ring_layer_tuning.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))

from PIL import Image, ImageChops, ImageDraw, ImageFilter  # noqa: E402

import gallery_probe as G  # noqa: E402
from turbulence_lab import font, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402

CELL, MAXR, SUP = 330, 118, 2

SPEC = {
    "rings": 14,          # fixed budget, resampled across the whole history
    "opacity": 0.84,      # flat, not ramped
    "stroke": 1.15,       # flat, not scaled by localStrength
    "ramp": 0.45,         # how far toward colorDeep the core goes
    "boundary_w": 1.75,   # era boundary stroke multiplier
    "boundary": True,
    "halo_peak": 0.62,    # exterior glow peak, fraction of full topic hue
    "halo_throw": 30.0,   # blur sigma at 1x, at full resonance
    "halo_tint": 0.0,     # how far the halo hue is pulled toward the warm neutral
    "legacy": False,
}


def variant(**kw):
    s = dict(SPEC)
    s.update(kw)
    return s


def ring_count(max_grad, budget):
    return max(3, min(budget, round(max_grad * 0.6) + 2))


def build(profile, max_r, salt, s):
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

    extent = {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in G.AXES}
    per_ring = {}
    for a in G.AXES:
        flat = []
        for topic, n in ax[a]["phases"]:
            flat += [topic] * n
        per_ring[a] = flat

    max_grad = max(min(grad[a], 22) for a in G.AXES)
    n_rings = max(4, round(max_grad * 1.15 + 4)) if s["legacy"] else ring_count(max_grad, s["rings"])
    clearance = max_r * 0.08
    rings = []
    for k in range(n_rings):
        depth = k / max(1, n_rings - 1)
        phase = ring_seed_for(k, "walk", salt)
        rot = ring_rotation(k, "walk", salt)
        pts = []
        for p in range(G.N_PERIM):
            theta = p / G.N_PERIM * 2 * math.pi
            deg = math.degrees(theta)
            i = int(deg // 60) % 6
            a0, a1 = G.AXES[i], G.AXES[(i + 1) % 6]
            blend = G.smoothstep((deg - i * 60) / 60)

            def ring_r(a):
                return max_r * 0.04 if grad[a] == 0 else extent[a] * (1 - depth) + clearance * depth

            r = ring_r(a0) * (1 - blend) + ring_r(a1) * blend
            pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
            w0, w1 = (1 - blend) ** G.FALLOFF, blend**G.FALLOFF
            turb = met[a0][1] * w0 + met[a1][1] * w1
            mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
            r += perimeter_noise(theta + rot, phase) * (((1 - pur) * 4 + 1.8) * (1 + (1 - depth) * 0.4))
            r += (turbulence_wave(theta + rot, phase, turb) * 9
                  * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1))

            def topic_at(a):
                flat = per_ring[a]
                if not flat:
                    return None
                if s["legacy"]:
                    return flat[max(0, min(len(flat) - 1, min(grad[a], 22) - 1 - k))]
                return flat[max(0, min(len(flat) - 1, round((1 - depth) * (len(flat) - 1))))]

            cb = G.sharp_blend((deg - i * 60) / 60)
            ca = G.TOPICS.get(topic_at(a0) or "", ("#8a8278", "#5a5248"))
            cbb = G.TOPICS.get(topic_at(a1) or "", ("#8a8278", "#5a5248"))
            base = G.desaturate(G.mix(G.hex_rgb(ca[0]), G.hex_rgb(cbb[0]), cb), pur)
            deep = G.desaturate(G.mix(G.hex_rgb(ca[1]), G.hex_rgb(cbb[1]), cb), pur)
            col = base if s["legacy"] else G.mix(base, deep, depth * s["ramp"])
            strength = (min(grad[a0], 22) / 22 * (1 - blend) + min(grad[a1], 22) / 22 * blend)
            pts.append((math.cos(theta - math.pi / 2) * r, math.sin(theta - math.pi / 2) * r,
                        col, deep, strength, topic_at(a0)))
        rings.append(pts)

    counts = {}
    for a in G.AXES:
        for topic, n in ax[a]["phases"]:
            counts[topic] = counts.get(topic, 0) + n
    return rings, (max(counts, key=counts.get) if counts else None)


def render(profile, salt, s):
    S = CELL * SUP
    layer = Image.new("RGB", (S, S), G.BG)
    cx = cy = S // 2
    rings, dominant = build(profile, MAXR * SUP, salt, s)
    halo_rgb = G.hex_rgb(G.TOPICS.get(dominant or "", ("#b8862e", "#6a4a10"))[0])
    if s.get("halo_tint"):
        halo_rgb = G.mix(halo_rgb, G.hex_rgb("#c8b89e"), s["halo_tint"])
    res = profile["resonance"]
    poly = [(cx + p[0], cy + p[1]) for p in rings[0]]

    if res > 0:
        rc = res**0.7
        solid = Image.new("L", (S, S), 0)
        ImageDraw.Draw(solid).polygon(poly, fill=255)
        glow = solid.filter(ImageFilter.GaussianBlur(s["halo_throw"] * rc * SUP))
        peak = s["halo_peak"] * rc
        layer = Image.composite(Image.new("RGB", (S, S), halo_rgb), layer,
                                ImageChops.subtract(glow, solid).point(lambda t: int(min(255, t * peak * 2.4))))

    d = ImageDraw.Draw(layer)
    for t in range(0, 360, 4):
        a0, a1 = math.radians(t), math.radians(t + 2)
        d.line([cx + math.cos(a0) * MAXR * SUP, cy + math.sin(a0) * MAXR * SUP,
                cx + math.cos(a1) * MAXR * SUP, cy + math.sin(a1) * MAXR * SUP],
               fill=G.RING_C, width=SUP)

    n = len(rings)
    for k in range(n - 1, -1, -1):
        pts = rings[k]
        boundary = (s["boundary"] and not s["legacy"] and 0 < k < n - 1
                    and any(pts[j][5] != rings[k + 1][j][5] for j in range(len(pts))))
        if s["legacy"]:
            if k == 0:
                opacity, base_w, use_deep = 0.95, 1.6, True
            elif k <= 2:
                opacity, base_w, use_deep = 0.78 - (k - 1) * 0.08, 1.2, False
            else:
                interior = (k - 3) / max(1, n - 4)
                opacity, base_w, use_deep = max(0.22, 0.55 - interior * 0.30), 1.25, False
        else:
            use_deep = k == 0
            opacity = 0.95 if k == 0 else s["opacity"]
            base_w = 1.6 if k == 0 else (s["stroke"] * s["boundary_w"] if boundary else s["stroke"])
        for j in range(len(pts)):
            x0, y0, c0, deep0, st0, _ = pts[j]
            x1, y1, _, _, st1, _ = pts[(j + 1) % len(pts)]
            col = deep0 if (use_deep or boundary) else c0
            w = (max(1, round(base_w * (0.55 + (st0 + st1) / 2 * 0.90) * SUP)) if s["legacy"]
                 else max(1, round(base_w * SUP)))
            d.line([cx + x0, cy + y0, cx + x1, cy + y1], fill=G.mix(G.BG, col, opacity), width=w)

    d.ellipse([cx - 3 * SUP, cy - 3 * SUP, cx + 3 * SUP, cy + 3 * SUP], fill=G.hex_rgb("#b8862e"))
    return layer.resize((CELL, CELL), Image.LANCZOS)


COLUMNS = [
    ("A  halo fixed only", variant(legacy=True, halo_peak=0.62, halo_throw=30.0)),
    ("B  18 rings, flat opacity", variant(rings=18, stroke=1.0, boundary=False)),
    ("C  14 rings, flat opacity", variant(boundary=False)),
    ("D  C + era boundaries", variant()),
    ("E  D, ramp 0.70", variant(ramp=0.70)),
]

if __name__ == "__main__":
    picks = [(1, "Marcus Aurel, one territory"), (5, "Dolores Vance, three eras"),
             (0, "Ivy Chen, three weeks")]
    PAD = 18
    W = PAD + len(COLUMNS) * (CELL + PAD)
    H = 78 + len(picks) * (CELL + 46)
    sheet = Image.new("RGB", (W, H), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "Ring layer, five settings", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Exterior halo in all five. Column A keeps the engine's ring layer; B to E replace it.",
           font=font(11), fill=G.MUTED)
    for r, (idx, cap) in enumerate(picks):
        y = 78 + r * (CELL + 46)
        d.text((PAD, y - 14), cap, font=font(11, True), fill=(150, 110, 40))
        for c, (lab, s) in enumerate(COLUMNS):
            x = PAD + c * (CELL + PAD)
            sheet.paste(render(G.PROFILES[idx], salt=idx * 7919 + 13, s=s), (x, y))
            d.text((x, y + CELL + 6), lab, font=font(11, True), fill=G.INK)
    out = os.path.join(HERE, "RING-LAYER-TUNING.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
    for idx, _ in picks:
        mg = max(min(G.PROFILES[idx]["axes"][a]["grad"], 22) for a in G.AXES)
        print(f"  {G.PROFILES[idx]['name']:<16} max grad {mg:2}  engine {max(4, round(mg * 1.15 + 4)):2} rings"
              f"   budget 18 -> {ring_count(mg, 18):2}   budget 14 -> {ring_count(mg, 14):2}")
