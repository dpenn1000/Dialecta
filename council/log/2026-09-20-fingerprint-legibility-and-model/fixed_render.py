"""
The single-mark test again, with designer's two noise fixes and nothing else changed.

Identical to the shipped condition (`gallery_probe.render_one`, same palette, same
halo, same ring layer, same salts) except for one line: the base noise amplitude.

  shipped:  amp = ((1 - pur) * 4 + 1.8) * depth_mult
  fixed:    amp = (0.4 + turb * 6.0) * depth_mult * (r / e_local)

The first factor is designer's rim fix (`council/designer/research/rim_floor_fix.py`):
the floor follows the same turbulence the heat wave reads instead of purity. The
last is its core fix (`model_fixes.py`): amplitude scaled by the ring's radius over
that axis's own rim extent, exactly 1.0 at the rim. Designer's rebuttal says the two
compose and neither alone reaches both rings.

Writes seven FIXED-<tag>.png marks under fresh random names and key-fixed.json.
"""

import json
import math
import os
import random
import string
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(HERE, "..", "..", "designer", "research"))
sys.path.insert(0, HERE)

from PIL import Image  # noqa: E402

import gallery_probe as G  # noqa: E402
import sheets as S  # noqa: E402
from turbulence_lab import AXES, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402


def fixed_build(profile, max_r, salt):
    """`gallery_probe.build`, line for line, with the noise amplitude replaced."""
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    extent = {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}
    per_ring = {}
    for a in AXES:
        flat = []
        for topic, n in ax[a]["phases"]:
            flat += [topic] * n
        per_ring[a] = flat

    max_grad = max(min(grad[a], G.HORIZON) for a in AXES)
    n_rings = max(4, round(max_grad * 1.15 + 4))
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
            a0, a1 = AXES[i], AXES[(i + 1) % 6]
            blend = G.smoothstep((deg - i * 60) / 60)

            def ring_r(a):
                return max_r * 0.04 if grad[a] == 0 else extent[a] * (1 - depth) + clearance * depth

            def rim_r(a):
                return max_r * 0.04 if grad[a] == 0 else extent[a]

            r = ring_r(a0) * (1 - blend) + ring_r(a1) * blend
            e_local = rim_r(a0) * (1 - blend) + rim_r(a1) * blend
            pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
            w0, w1 = (1 - blend) ** G.FALLOFF, blend ** G.FALLOFF
            turb = met[a0][1] * w0 + met[a1][1] * w1
            mat = min(grad[a0], G.HORIZON) * w0 + min(grad[a1], G.HORIZON) * w1

            amp = (0.4 + turb * 6.0) * (1 + (1 - depth) * 0.4) * (max(r, 1e-6) / max(e_local, 1e-6))
            r += perimeter_noise(theta + rot, phase) * amp
            r += (turbulence_wave(theta + rot, phase, turb)
                  * 9 * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1))

            def topic_at(a):
                flat = per_ring[a]
                if not flat:
                    return None
                return flat[max(0, min(len(flat) - 1, min(grad[a], G.HORIZON) - 1 - k))]

            cb = G.sharp_blend((deg - i * 60) / 60)
            ca = G.TOPICS.get(topic_at(a0) or "", ("#8a8278", "#5a5248"))
            cbb = G.TOPICS.get(topic_at(a1) or "", ("#8a8278", "#5a5248"))
            col = G.desaturate(G.mix(G.hex_rgb(ca[0]), G.hex_rgb(cbb[0]), cb), pur)
            deep = G.desaturate(G.mix(G.hex_rgb(ca[1]), G.hex_rgb(cbb[1]), cb), pur)
            clar = met[a0][2] * (1 - blend) + met[a1][2] * blend
            strength = (min(grad[a0], G.HORIZON) / G.HORIZON * (1 - blend)
                        + min(grad[a1], G.HORIZON) / G.HORIZON * blend)
            pts.append((math.cos(theta - math.pi / 2) * r, math.sin(theta - math.pi / 2) * r,
                        col, deep, strength, clar))
        rings.append(pts)

    counts = {}
    for a in AXES:
        for topic, n in ax[a]["phases"]:
            counts[topic] = counts.get(topic, 0) + n
    dominant = max(counts, key=counts.get) if counts else None
    return rings, dominant, extent


if __name__ == "__main__":
    shipped_build = G.build
    G.TOPICS = S.SHIPPED_PALETTE
    rng = random.Random(24601)
    key = {}
    for idx, prof in enumerate(S.PROFILES):
        tag = "".join(rng.choice(string.ascii_lowercase) for _ in range(6))
        G.build = fixed_build
        img = G.render_one(prof, idx * 7919 + 13)[0].resize((S.CELL, S.CELL), Image.LANCZOS)
        G.build = shipped_build
        img.save(os.path.join(HERE, f"FIXED-{tag}.png"), optimize=True)
        key[tag] = prof["name"]
    with open(os.path.join(HERE, "key-fixed.json"), "w") as f:
        json.dump(key, f, indent=2)
    print(json.dumps(key, indent=2))
