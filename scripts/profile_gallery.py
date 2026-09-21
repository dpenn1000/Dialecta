"""
Six contributors, six ages, rendered with every channel the engine has.

Topic-coloured rings laid down outward in time, the resonance halo coloured by
dominant territory, the centre glow, the potential ring, per-axis turbulence and
purity, and the ported random-walk ring phase that replaces the spiral.

Geometry follows `packages/core/src/fingerprint-geometry.ts` (soft horizon, no
clamp) and texture follows `packages/core/src/fingerprint-texture.ts` (walked
phase). Palette and layer structure follow the recovered engine.

Run: python scripts/profile_gallery.py
"""

import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFilter
from turbulence_lab import (AXES, BG, INK, MUTED, RING_C, font, perimeter_noise,
                            ring_rotation, ring_seed_for, turbulence_wave)

HORIZON, SOFT, POW = 22, 8, 0.85
PEN, PENCAP = 0.20, 0.30
PAIRS = [("acuity", "reach"), ("discourse", "calibration"), ("discourse", "magnanimity")]
N_PERIM, FALLOFF = 168, 2.5

TOPICS = {
    "politics_governance": ("#9e2020", "#501010"),
    "law_justice": ("#b04020", "#5a1e0a"),
    "history": ("#9a5818", "#4e2c08"),
    "economics": ("#b87a18", "#5c3c08"),
    "environment_energy": ("#3a7a24", "#1c3c12"),
    "health_medicine": ("#287858", "#123c2c"),
    "psychology_behavior": ("#267080", "#123840"),
    "science_technology": ("#2650a0", "#123050"),
    "philosophy_ethics": ("#3a3888", "#1c1c44"),
    "arts_humanities": ("#6a3a9a", "#351848"),
    "theology_spirituality": ("#7a2a80", "#3c1440"),
    "society_culture": ("#8a2858", "#44142c"),
}


def hex_rgb(h):
    return tuple(int(h[i : i + 2], 16) for i in (1, 3, 5))


def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def desaturate(rgb, purity):
    """
    Pull a colour toward its own grey as purity falls.

    The engine computes `localPurity` and uses it in exactly one place, the base
    noise amplitude at line 500. Its own comment at line 175 says purity "drives
    base color saturation" and the live page says "Purity drives color
    saturation". Neither is true in the implementation: colour comes from
    topicColor(), which never sees purity. This is that channel, built.

    It matters for legibility rather than fidelity. Without it every ring of a
    single-territory contributor renders at the palette's full strength and the
    shape reads as one saturated mass.
    """
    k = 0.30 + max(0.0, min(1.0, purity)) * 0.70
    grey = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
    return tuple(round(grey + (c - grey) * k) for c in rgb)


def smoothstep(t):
    return t * t * (3 - 2 * t)


def sharp_blend(t):
    return smoothstep(smoothstep(t))


def horizon_progress(raw):
    if raw <= 0:
        return 0.0
    t = raw / HORIZON
    p = t / (1 + t**SOFT) ** (1 / SOFT) if t < 1 else math.exp(-math.log1p(t**-SOFT) / SOFT)
    return min(p, 1 - 2.220446049250313e-16)


def metrics(mixd):
    total = sum(mixd.values())
    if total == 0:
        return 1.0, 0.0, 1.0
    purity = mixd.get("forum", 0) / total
    turb = (mixd.get("heat", 0) + mixd.get("stance", 0)) / total
    den = mixd.get("forum", 0) + mixd.get("echo", 0) + mixd.get("fog", 0)
    return purity, turb, (mixd.get("forum", 0) / den if den else 1.0)


def build(profile, max_r, salt):
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    met = {a: metrics(ax[a]["mix"]) for a in AXES}
    prog = {a: horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * PEN for a, b in PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, PENCAP)

    extent = {a: (prog[a] ** POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}
    per_ring = {}
    for a in AXES:
        flat = []
        for topic, n in ax[a]["phases"]:
            flat += [topic] * n
        per_ring[a] = flat

    max_grad = max(min(grad[a], HORIZON) for a in AXES)
    n_rings = max(4, round(max_grad * 1.15 + 4))
    clearance = max_r * 0.08
    rings = []
    for k in range(n_rings):
        depth = k / max(1, n_rings - 1)
        phase = ring_seed_for(k, "walk", salt)
        rot = ring_rotation(k, "walk", salt)
        pts = []
        for p in range(N_PERIM):
            theta = p / N_PERIM * 2 * math.pi
            deg = math.degrees(theta)
            i = int(deg // 60) % 6
            a0, a1 = AXES[i], AXES[(i + 1) % 6]
            blend = smoothstep((deg - i * 60) / 60)

            def ring_r(a):
                return max_r * 0.04 if grad[a] == 0 else extent[a] * (1 - depth) + clearance * depth

            r = ring_r(a0) * (1 - blend) + ring_r(a1) * blend
            pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
            w0, w1 = (1 - blend) ** FALLOFF, blend**FALLOFF
            turb = met[a0][1] * w0 + met[a1][1] * w1
            mat = min(grad[a0], HORIZON) * w0 + min(grad[a1], HORIZON) * w1

            r += perimeter_noise(theta + rot, phase) * (((1 - pur) * 4 + 1.8) * (1 + (1 - depth) * 0.4))
            r += (turbulence_wave(theta + rot, phase, turb)
                  * 9 * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1))

            def topic_at(a):
                flat = per_ring[a]
                if not flat:
                    return None
                return flat[max(0, min(len(flat) - 1, min(grad[a], HORIZON) - 1 - k))]

            cb = sharp_blend((deg - i * 60) / 60)
            ca = TOPICS.get(topic_at(a0) or "", ("#8a8278", "#5a5248"))
            cbb = TOPICS.get(topic_at(a1) or "", ("#8a8278", "#5a5248"))
            col = desaturate(mix(hex_rgb(ca[0]), hex_rgb(cbb[0]), cb), pur)
            deep = desaturate(mix(hex_rgb(ca[1]), hex_rgb(cbb[1]), cb), pur)
            clar = met[a0][2] * (1 - blend) + met[a1][2] * blend
            strength = (min(grad[a0], HORIZON) / HORIZON * (1 - blend)
                        + min(grad[a1], HORIZON) / HORIZON * blend)
            pts.append((math.cos(theta - math.pi / 2) * r, math.sin(theta - math.pi / 2) * r,
                        col, deep, strength, clar))
        rings.append(pts)

    counts = {}
    for a in AXES:
        for topic, n in ax[a]["phases"]:
            counts[topic] = counts.get(topic, 0) + n
    dominant = max(counts, key=counts.get) if counts else None
    return rings, dominant, extent


CELL, PAD, MAXR = 340, 26, 122
SUP = 2  # supersample, for the halo and the fine lines


def render_one(profile, salt):
    S = CELL * SUP
    layer = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(layer)
    cx = cy = S // 2
    rings, dominant, _ = build(profile, MAXR * SUP, salt)
    halo_hex = TOPICS.get(dominant or "", ("#b8862e", "#6a4a10"))
    halo_rgb = hex_rgb(halo_hex[0])
    res = profile["resonance"]

    # Resonance halo: the silhouette, thrown outward and blurred, opacity and
    # blur both on resonance ** 0.7 so low reception separates from high.
    if res > 0:
        rc = res**0.7
        glow = Image.new("L", (S, S), 0)
        gd = ImageDraw.Draw(glow)
        gd.polygon([(cx + pt[0], cy + pt[1]) for pt in rings[0]], fill=int(70 + rc * 150))
        glow = glow.filter(ImageFilter.GaussianBlur((8 + rc * 22) * SUP * 0.55))
        tint = Image.new("RGB", (S, S), halo_rgb)
        layer = Image.composite(tint, layer, glow.point(lambda v: int(v * (0.25 + rc * 0.6))))
        d = ImageDraw.Draw(layer)

    # Centre glow
    gl = Image.new("L", (S, S), 0)
    ImageDraw.Draw(gl).ellipse([cx - MAXR * SUP * 0.5, cy - MAXR * SUP * 0.5, cx + MAXR * SUP * 0.5, cy + MAXR * SUP * 0.5], fill=48)
    gl = gl.filter(ImageFilter.GaussianBlur(26 * SUP * 0.5))
    layer = Image.composite(Image.new("RGB", (S, S), hex_rgb("#f5e8d0")), layer, gl)
    d = ImageDraw.Draw(layer)

    # Potential ring
    for t in range(0, 360, 4):
        a0, a1 = math.radians(t), math.radians(t + 2)
        d.line(
            [cx + math.cos(a0) * MAXR * SUP, cy + math.sin(a0) * MAXR * SUP,
             cx + math.cos(a1) * MAXR * SUP, cy + math.sin(a1) * MAXR * SUP],
            fill=RING_C, width=SUP,
        )

    # The engine's own bands, which my first pass flattened into one ramp and
    # which is most of why the shape read as a blob: one strong silhouette in
    # DEEP colour, two medium rings, and an interior that fades to 0.22.
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
            x0, y0, c0, deep0, st0, cl0 = pts[j]
            x1, y1, _, _, st1, _ = pts[(j + 1) % len(pts)]
            col = deep0 if use_deep else c0
            w = max(1, round(base_w * (0.55 + (st0 + st1) / 2 * 0.90) * SUP))
            d.line([cx + x0, cy + y0, cx + x1, cy + y1], fill=mix(BG, col, opacity), width=w)

    d.ellipse([cx - 4 * SUP, cy - 4 * SUP, cx + 4 * SUP, cy + 4 * SUP], fill=hex_rgb("#b8862e"))
    return layer.resize((CELL, CELL), Image.LANCZOS), dominant


PROFILES = [
    {
        "name": "Ivy Chen", "arch": "THE NEWCOMER", "age": "3 weeks", "resonance": 0.08,
        "note": "Six weeks of reading, three of writing. One territory, and the Discourse petal already carries Heat.",
        "axes": {
            "acuity": {"grad": 3, "phases": [("psychology_behavior", 3)], "mix": {"forum": 2, "spark": 1}},
            "calibration": {"grad": 2, "phases": [("psychology_behavior", 2)], "mix": {"forum": 1, "echo": 1}},
            "magnanimity": {"grad": 1, "phases": [("psychology_behavior", 1)], "mix": {"spark": 1}},
            "discourse": {"grad": 4, "phases": [("psychology_behavior", 4)], "mix": {"forum": 1, "heat": 3}},
            "consistency": {"grad": 3, "phases": [("psychology_behavior", 3)], "mix": {"forum": 2, "spark": 1}},
            "reach": {"grad": 1, "phases": [("psychology_behavior", 1)], "mix": {"forum": 1}},
        },
    },
    {
        "name": "Marcus Aurel", "arch": "THE FIREBRAND", "age": "7 months", "resonance": 0.55,
        "note": "Argues constantly and well, concedes almost nothing. Heat and Stance right through the Discourse petal.",
        "axes": {
            "acuity": {"grad": 14, "phases": [("economics", 6), ("politics_governance", 8)], "mix": {"forum": 9, "spark": 4, "heat": 1}},
            "calibration": {"grad": 5, "phases": [("politics_governance", 5)], "mix": {"forum": 2, "fog": 1, "stance": 2}},
            "magnanimity": {"grad": 3, "phases": [("politics_governance", 3)], "mix": {"heat": 2, "stance": 1}},
            "discourse": {"grad": 21, "phases": [("economics", 5), ("politics_governance", 16)], "mix": {"forum": 6, "spark": 3, "heat": 8, "stance": 4}},
            "consistency": {"grad": 18, "phases": [("economics", 5), ("politics_governance", 13)], "mix": {"forum": 12, "spark": 6}},
            "reach": {"grad": 7, "phases": [("economics", 4), ("politics_governance", 3)], "mix": {"forum": 5, "spark": 2}},
        },
    },
    {
        "name": "Wen Zhao", "arch": "THE SKEPTIC", "age": "1 year", "resonance": 0.62,
        "note": "Precise and calibrated, narrow on purpose. Started in science, moved to the philosophy underneath it.",
        "axes": {
            "acuity": {"grad": 21, "phases": [("science_technology", 12), ("philosophy_ethics", 9)], "mix": {"forum": 19, "spark": 2}},
            "calibration": {"grad": 19, "phases": [("science_technology", 11), ("philosophy_ethics", 8)], "mix": {"forum": 17, "spark": 2}},
            "magnanimity": {"grad": 8, "phases": [("science_technology", 5), ("philosophy_ethics", 3)], "mix": {"forum": 5, "echo": 2, "heat": 1}},
            "discourse": {"grad": 11, "phases": [("science_technology", 6), ("philosophy_ethics", 5)], "mix": {"forum": 8, "spark": 2, "heat": 1}},
            "consistency": {"grad": 15, "phases": [("science_technology", 9), ("philosophy_ethics", 6)], "mix": {"forum": 13, "spark": 2}},
            "reach": {"grad": 6, "phases": [("science_technology", 3), ("philosophy_ethics", 3)], "mix": {"forum": 5, "spark": 1}},
        },
    },
    {
        "name": "Priya Raman", "arch": "THE GENERALIST", "age": "2 years", "resonance": 0.7,
        "note": "Five territories and counting. Broad rather than deep, and the Acuity petal pays for the Reach.",
        "axes": {
            "acuity": {"grad": 9, "phases": [("history", 3), ("economics", 3), ("society_culture", 3)], "mix": {"forum": 5, "spark": 3, "echo": 1}},
            "calibration": {"grad": 13, "phases": [("history", 4), ("arts_humanities", 4), ("society_culture", 5)], "mix": {"forum": 10, "spark": 3}},
            "magnanimity": {"grad": 16, "phases": [("history", 5), ("arts_humanities", 5), ("society_culture", 6)], "mix": {"forum": 14, "spark": 2}},
            "discourse": {"grad": 12, "phases": [("economics", 4), ("society_culture", 8)], "mix": {"forum": 8, "spark": 3, "heat": 1}},
            "consistency": {"grad": 17, "phases": [("history", 5), ("arts_humanities", 6), ("society_culture", 6)], "mix": {"forum": 14, "spark": 3}},
            "reach": {"grad": 22, "phases": [("history", 4), ("economics", 4), ("arts_humanities", 5), ("environment_energy", 4), ("society_culture", 5)], "mix": {"forum": 18, "spark": 4}},
        },
    },
    {
        "name": "Father Anselm", "arch": "THE STEADY HAND", "age": "3 years", "resonance": 0.84,
        "note": "Shows up every week and represents the other side better than the other side does. Nothing turbulent anywhere.",
        "axes": {
            "acuity": {"grad": 13, "phases": [("theology_spirituality", 7), ("philosophy_ethics", 6)], "mix": {"forum": 11, "spark": 2}},
            "calibration": {"grad": 18, "phases": [("theology_spirituality", 9), ("philosophy_ethics", 9)], "mix": {"forum": 17, "spark": 1}},
            "magnanimity": {"grad": 22, "phases": [("theology_spirituality", 10), ("philosophy_ethics", 12)], "mix": {"forum": 21, "spark": 1}},
            "discourse": {"grad": 15, "phases": [("theology_spirituality", 8), ("philosophy_ethics", 7)], "mix": {"forum": 14, "spark": 1}},
            "consistency": {"grad": 22, "phases": [("theology_spirituality", 11), ("philosophy_ethics", 11)], "mix": {"forum": 22}},
            "reach": {"grad": 10, "phases": [("theology_spirituality", 5), ("philosophy_ethics", 5)], "mix": {"forum": 9, "spark": 1}},
        },
    },
    {
        "name": "Dolores Vance", "arch": "THE REVISER", "age": "5 years", "resonance": 0.93,
        "note": "Arrived angry and learned. The Heat sits in the oldest rings at the centre, and the outer rings run clean.",
        "axes": {
            "acuity": {"grad": 22, "phases": [("politics_governance", 6), ("law_justice", 7), ("philosophy_ethics", 9)], "mix": {"forum": 18, "spark": 2, "heat": 2}},
            "calibration": {"grad": 20, "phases": [("politics_governance", 5), ("law_justice", 7), ("philosophy_ethics", 8)], "mix": {"forum": 16, "spark": 2, "heat": 2}},
            "magnanimity": {"grad": 19, "phases": [("law_justice", 8), ("philosophy_ethics", 11)], "mix": {"forum": 15, "spark": 2, "stance": 2}},
            "discourse": {"grad": 22, "phases": [("politics_governance", 8), ("law_justice", 6), ("philosophy_ethics", 8)], "mix": {"forum": 13, "spark": 3, "heat": 4, "stance": 2}},
            "consistency": {"grad": 22, "phases": [("politics_governance", 6), ("law_justice", 7), ("philosophy_ethics", 9)], "mix": {"forum": 20, "spark": 2}},
            "reach": {"grad": 14, "phases": [("politics_governance", 4), ("law_justice", 4), ("philosophy_ethics", 6)], "mix": {"forum": 12, "spark": 2}},
        },
    },
]

if __name__ == "__main__":
    f_t, f_n, f_a, f_ag, f_c = font(19, True), font(17, True), font(11, True), font(11), font(11)
    COLS = 3
    rows = (len(PROFILES) + COLS - 1) // COLS
    CW, CH = CELL + PAD, CELL + 96
    W = PAD + COLS * CW
    H = 74 + rows * CH
    sheet = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "Six contributors, six ages, every channel on", font=f_t, fill=INK)
    d.text((PAD, 46), "Ring colour is topic history, oldest at the centre. Halo is resonance, coloured by dominant territory. "
                      "Walked ring phase, no spiral.", font=f_c, fill=MUTED)

    for i, prof in enumerate(PROFILES):
        col, row = i % COLS, i // COLS
        x, y = PAD + col * CW, 74 + row * CH
        img, dominant = render_one(prof, salt=i * 7919 + 13)
        sheet.paste(img, (x, y))
        ty = y + CELL + 4
        d.text((x, ty), prof["arch"], font=f_a, fill=(150, 110, 40))
        d.text((x, ty + 16), prof["name"], font=f_n, fill=INK)
        ax = d.textlength(prof["name"], font=f_n)
        d.text((x + ax + 8, ty + 19), prof["age"], font=f_ag, fill=MUTED)
        words, line, ly = prof["note"].split(), "", ty + 38
        for w in words:
            trial = (line + " " + w).strip()
            if d.textlength(trial, font=f_c) > CELL - 4:
                d.text((x, ly), line, font=f_c, fill=MUTED)
                line, ly = w, ly + 14
            else:
                line = trial
        d.text((x, ly), line, font=f_c, fill=MUTED)

    out = os.path.join(os.path.dirname(__file__), "..", "docs", "fingerprint-examples", "PROFILE-GALLERY.png")
    sheet.save(out, optimize=True)
    print("wrote", os.path.normpath(out), sheet.size)
