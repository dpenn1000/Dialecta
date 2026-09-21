"""
Five renders of the same two contributors, one change at a time.

V0  as shipped
V1  halo masked to the exterior, centre glow gone
V2  V1 plus 14 rings instead of 29, history resampled across them
V3  V2 plus the radial value ramp and a constant stroke
V4  V3 plus era boundaries marked

Marcus Aurel is the red case: one territory, politics, and the profile Dan
looked at when he said "giant color blob". Dolores Vance is the three-era case.

Run: python council/designer/research/legibility_variants.py
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


def ring_count_new(max_grad):
    return max(3, min(14, round(max_grad * 0.6) + 2))


def build(profile, max_r, salt, v):
    """v is the variant index. Everything keyed off it is a change under review."""
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
    n_rings = max(4, round(max_grad * 1.15 + 4)) if v < 2 else ring_count_new(max_grad)
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
                if v < 2:
                    return flat[max(0, min(len(flat) - 1, min(grad[a], 22) - 1 - k))]
                # Rings resample the whole history, so band width is share of history.
                pos = (1 - depth) * (len(flat) - 1)
                return flat[max(0, min(len(flat) - 1, round(pos)))]

            cb = G.sharp_blend((deg - i * 60) / 60)
            ca = G.TOPICS.get(topic_at(a0) or "", ("#8a8278", "#5a5248"))
            cbb = G.TOPICS.get(topic_at(a1) or "", ("#8a8278", "#5a5248"))
            base = G.desaturate(G.mix(G.hex_rgb(ca[0]), G.hex_rgb(cbb[0]), cb), pur)
            deep = G.desaturate(G.mix(G.hex_rgb(ca[1]), G.hex_rgb(cbb[1]), cb), pur)
            if v >= 3:
                # THE RADIAL VALUE RAMP. Oldest material is deepest. `depth` is 0
                # at the rim and 1 at the core, so this darkens inward.
                col = G.mix(base, deep, depth**0.8)
            else:
                col = base
            clar = met[a0][2] * (1 - blend) + met[a1][2] * blend
            strength = (min(grad[a0], 22) / 22 * (1 - blend) + min(grad[a1], 22) / 22 * blend)
            pts.append((math.cos(theta - math.pi / 2) * r, math.sin(theta - math.pi / 2) * r,
                        col, deep, strength, clar, topic_at(a0)))
        rings.append(pts)

    counts = {}
    for a in G.AXES:
        for topic, n in ax[a]["phases"]:
            counts[topic] = counts.get(topic, 0) + n
    dominant = max(counts, key=counts.get) if counts else None
    return rings, dominant


def render(profile, salt, v):
    S = CELL * SUP
    layer = Image.new("RGB", (S, S), G.BG)
    cx = cy = S // 2
    rings, dominant = build(profile, MAXR * SUP, salt, v)
    halo_rgb = G.hex_rgb(G.TOPICS.get(dominant or "", ("#b8862e", "#6a4a10"))[0])
    res = profile["resonance"]
    poly = [(cx + p[0], cy + p[1]) for p in rings[0]]

    if res > 0:
        rc = res**0.7
        solid = Image.new("L", (S, S), 0)
        ImageDraw.Draw(solid).polygon(poly, fill=255)
        if v == 0:
            glow = Image.new("L", (S, S), 0)
            ImageDraw.Draw(glow).polygon(poly, fill=int(70 + rc * 150))
            glow = glow.filter(ImageFilter.GaussianBlur((8 + rc * 22) * SUP * 0.55))
            mask = glow.point(lambda t: int(t * (0.25 + rc * 0.6)))
        else:
            # THE FIX. A blurred filled polygon is a fill with soft edges, not a
            # glow. Subtracting the silhouette leaves only what is thrown past
            # the boundary, which is what resonance means: what the work casts
            # outward, not a wash over the work.
            glow = solid.filter(ImageFilter.GaussianBlur((10 + rc * 26) * SUP * 0.55))
            mask = ImageChops.subtract(glow, solid).point(lambda t: int(min(255, t * (0.55 + rc * 0.75))))
        layer = Image.composite(Image.new("RGB", (S, S), halo_rgb), layer, mask)

    if v == 0:
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
        boundary = False
        if v >= 4 and 0 < k < n - 1:
            boundary = any(pts[j][6] != rings[k + 1][j][6] for j in range(len(pts)))
        if v < 3:
            if k == 0:
                opacity, base_w, use_deep = 0.95, 1.6, True
            elif k <= 2:
                opacity, base_w, use_deep = 0.78 - (k - 1) * 0.08, 1.2, False
            else:
                interior = (k - 3) / max(1, n - 4)
                opacity, base_w, use_deep = max(0.22, 0.55 - interior * 0.30), 1.25, False
        else:
            # Opacity no longer ramps. The value ramp carries depth now, and the
            # old opacity ramp was dissolving the core it is supposed to anchor.
            use_deep = k == 0
            opacity = 0.95 if k == 0 else (1.0 if boundary else 0.80)
            base_w = 1.7 if k == 0 else (1.5 if boundary else 1.0)
        for j in range(len(pts)):
            x0, y0, c0, deep0, st0, _, _ = pts[j]
            x1, y1, _, _, st1, _, _ = pts[(j + 1) % len(pts)]
            col = deep0 if use_deep else c0
            if v >= 3 and boundary:
                col = deep0
            if v < 3:
                w = max(1, round(base_w * (0.55 + (st0 + st1) / 2 * 0.90) * SUP))
            else:
                w = max(1, round(base_w * SUP))
            d.line([cx + x0, cy + y0, cx + x1, cy + y1], fill=G.mix(G.BG, col, opacity), width=w)

    d.ellipse([cx - 3 * SUP, cy - 3 * SUP, cx + 3 * SUP, cy + 3 * SUP], fill=G.hex_rgb("#b8862e"))
    return layer.resize((CELL, CELL), Image.LANCZOS)


LABELS = ["V0  as shipped", "V1  halo outside only, no centre wash",
          "V2  + 14 rings, history resampled", "V3  + value ramp, flat stroke",
          "V4  + era boundaries marked"]

if __name__ == "__main__":
    picks = [(1, "Marcus Aurel, one territory, politics"), (5, "Dolores Vance, three eras")]
    PAD = 18
    W = PAD + 5 * (CELL + PAD)
    H = 78 + len(picks) * (CELL + 46)
    sheet = Image.new("RGB", (W, H), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "One change at a time", font=font(20, True), fill=G.INK)
    d.text((PAD, 46), "Same data in every tile. Each column adds one change to the column on its left.",
           font=font(11), fill=G.MUTED)
    for r, (idx, cap) in enumerate(picks):
        y = 78 + r * (CELL + 46)
        d.text((PAD, y - 14), cap, font=font(11, True), fill=(150, 110, 40))
        for v in range(5):
            x = PAD + v * (CELL + PAD)
            sheet.paste(render(G.PROFILES[idx], salt=idx * 7919 + 13, v=v), (x, y))
            d.text((x, y + CELL + 6), LABELS[v], font=font(11, True), fill=G.INK)
    out = os.path.join(HERE, "LEGIBILITY-VARIANTS.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
    for idx, _ in picks:
        mg = max(min(G.PROFILES[idx]["axes"][a]["grad"], 22) for a in G.AXES)
        print(f"  {G.PROFILES[idx]['name']:<16} max grad {mg:2}  "
              f"rings {max(4, round(mg * 1.15 + 4))} -> {ring_count_new(mg)}")
