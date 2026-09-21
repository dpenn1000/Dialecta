"""
Replicates the fingerprint's line-perturbation system outside the browser.

Ported by hand from `_recovered-next/lib/theme/dialecta-fingerprint-engine.jsx`
lines 386 to 518, so the numbers below are the engine's, not an approximation of
them. Built to answer one question from Dan on 2026-09-20: what actually makes
the lines jagged rather than smooth, and can it be reproduced.

Two independent systems add pixels to every sampled radius:

  base organic noise   four sines (7.3, 13.1, 21.7, 4.1), always on, amplitude
                       driven by (1 - purity) and by how far out the ring sits

  turbulence wave      three sines whose FREQUENCY is itself driven by
                       turbulence (3 calm to 11 chaotic), amplitude driven by
                       turbulence, recency and maturity together

Each ring carries its own seed, so adjacent rings wiggle out of step. That is
what produces the woven texture rather than a set of clean nested outlines.

Run: python scripts/turbulence_lab.py
"""

import math
import os

from PIL import Image, ImageDraw, ImageFont

AXES = ["acuity", "calibration", "magnanimity", "discourse", "consistency", "reach"]
N_PERIMETER = 96
GRAD_HORIZON = 22
RADIUS_POWER = 0.85
MIN_AXIS_RADIUS_FACTOR = 0.04
FALLOFF = 2.5


def smoothstep(t):
    return t * t * (3 - 2 * t)


def perimeter_noise(theta, ring_seed):
    """Multi-octave wobble. Present on every fingerprint, at every purity."""
    return (
        math.sin(theta * 7.3 + ring_seed * 1.7) * 0.5
        + math.sin(theta * 13.1 + ring_seed * 3.3 + 1.4) * 0.3
        + math.sin(theta * 21.7 + ring_seed * 5.9 + 2.7) * 0.2
        + math.sin(theta * 4.1 + ring_seed * 0.7) * 0.15
    )


def turbulence_wave(theta, ring_seed, turbulence, mode="symmetric"):
    """
    The Heat and Stance signature. Frequency climbs with turbulence, which is
    why a turbulent region reads as choppy rather than merely wavy.

    `mode` exists for ADR-004. "symmetric" is the engine as it stands, where a
    wave pushes the boundary out and in equally. "outward" is designer's
    proposal for the Breach residual: the same wave rectified so it only ever
    pushes outward, which reads as a spike against a swell without spending a
    second channel.
    """
    if turbulence < 0.01:
        return 0.0
    freq = 3 + turbulence * 8
    w = (
        math.sin(theta * freq + ring_seed * 0.4) * 0.7
        + math.sin(theta * (freq * 1.8) + ring_seed * 0.9 + 1.1) * 0.4
        + math.sin(theta * (freq * 0.5) + ring_seed * 0.2 + 2.3) * 0.5
    )
    if mode == "outward":
        w = abs(w)
    return w * turbulence


def build_rings(axis_grad, axis_turb, axis_purity, max_r, mode="symmetric"):
    """Returns a list of rings, each a list of (x, y), outermost first."""
    max_grad = max(min(g, GRAD_HORIZON) for g in axis_grad.values())
    ring_count = max(4, round(max_grad * 1.15 + 4))
    center_clearance = max_r * 0.08

    axis_max = {}
    for a in AXES:
        g = min(axis_grad[a], GRAD_HORIZON)
        axis_max[a] = max_r * (g / GRAD_HORIZON) ** RADIUS_POWER if g else 0.0

    rings = []
    for k in range(ring_count):
        depth = k / max(1, ring_count - 1)
        ring_seed = k * 11.7 + 3.3
        pts = []
        for p in range(N_PERIMETER):
            theta = (p / N_PERIMETER) * math.pi * 2
            deg = math.degrees(theta)
            i = int(deg // 60) % 6
            a0, a1 = AXES[i], AXES[(i + 1) % 6]
            blend = smoothstep((deg - i * 60) / 60)

            def ring_radius(axis):
                if axis_grad[axis] == 0:
                    return max_r * MIN_AXIS_RADIUS_FACTOR
                return axis_max[axis] * (1 - depth) + center_clearance * depth

            radius = ring_radius(a0) * (1 - blend) + ring_radius(a1) * blend

            local_purity = axis_purity[a0] * (1 - blend) + axis_purity[a1] * blend
            w0, w1 = (1 - blend) ** FALLOFF, blend**FALLOFF
            local_turb = axis_turb[a0] * w0 + axis_turb[a1] * w1
            local_mat = min(axis_grad[a0], GRAD_HORIZON) * w0 + min(axis_grad[a1], GRAD_HORIZON) * w1

            base_amp = ((1 - local_purity) * 4 + 1.8) * (1 + (1 - depth) * 0.4)
            radius += perimeter_noise(theta, ring_seed) * base_amp

            recency = 0.3 + (1 - depth) * 0.7
            maturity = 0.4 + min(local_mat / 22, 1) * 2.1
            radius += turbulence_wave(theta, ring_seed, local_turb, mode) * 9 * recency * maturity

            pts.append((math.cos(theta - math.pi / 2) * radius, math.sin(theta - math.pi / 2) * radius))
        rings.append(pts)
    return rings


BG, INK, MUTED, RING_C = (247, 242, 232), (28, 24, 20), (122, 112, 104), (214, 206, 188)


def font(sz, bold=False):
    for p in (
        r"C:\Windows\Fonts\georgiab.ttf" if bold else r"C:\Windows\Fonts\georgia.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ):
        if os.path.exists(p):
            return ImageFont.truetype(p, sz)
    return ImageFont.load_default()


def draw_cell(d, cx, cy, max_r, grad, turb, purity, mode, colour):
    d.ellipse([cx - max_r, cy - max_r, cx + max_r, cy + max_r], outline=RING_C)
    rings = build_rings(grad, turb, purity, max_r, mode)
    n = len(rings)
    for k, pts in enumerate(rings):
        fade = 0.35 + 0.65 * (1 - k / max(1, n - 1))
        col = tuple(int(c + (BG[j] - c) * (1 - fade)) for j, c in enumerate(colour))
        d.polygon([(cx + x, cy + y) for x, y in pts], outline=col)
    d.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(184, 134, 46))


def sheet(path, title, rows, cols, cell=250, max_r=95):
    pad = 18
    f_t, f_h, f_c = font(15, True), font(13, True), font(11)
    w = 150 + len(cols) * (cell + pad)
    h = 54 + len(rows) * (cell + 34)
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    d.text((pad, 14), title, font=f_t, fill=INK)
    for j, (clabel, _) in enumerate(cols):
        x = 150 + j * (cell + pad)
        d.text((x + (cell - d.textlength(clabel, font=f_h)) / 2, 40), clabel, font=f_h, fill=MUTED)
    y = 62
    for rlabel, rnote, build in rows:
        d.text((pad, y + cell // 2 - 16), rlabel, font=f_h, fill=INK)
        d.text((pad, y + cell // 2 + 2), rnote, font=f_c, fill=MUTED)
        for j, (_, cfg) in enumerate(cols):
            cx = 150 + j * (cell + pad) + cell // 2
            grad, turb, purity, mode, colour = build(cfg)
            draw_cell(d, cx, y + cell // 2, max_r, grad, turb, purity, mode, colour)
        y += cell + 34
    im.save(path, optimize=True)
    print("wrote", path, im.size)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "docs", "fingerprint-examples")
    uniform = lambda v: {a: v for a in AXES}
    TEAL, RUST = (46, 116, 120), (140, 40, 40)

    cols = [(f"turbulence {t:.2f}", t) for t in (0.0, 0.25, 0.5, 0.75, 1.0)]

    sheet(
        os.path.join(out, "TURBULENCE-LAB.png"),
        "What makes the line jagged: turbulence = (heat + stance) / total, on one axis set",
        [
            (
                "Mature",
                "20 graduations",
                lambda t: (uniform(20), uniform(t), uniform(1 - t * 0.8), "symmetric", TEAL),
            ),
            (
                "Emerging",
                "10 graduations",
                lambda t: (uniform(10), uniform(t), uniform(1 - t * 0.8), "symmetric", TEAL),
            ),
            (
                "Early",
                "4 graduations",
                lambda t: (uniform(4), uniform(t), uniform(1 - t * 0.8), "symmetric", TEAL),
            ),
        ],
        cols,
    )

    breach = {**uniform(18), "discourse": 18}
    sheet(
        os.path.join(out, "BREACH-SIGNATURE.png"),
        "ADR-004 item 4: a rectified wave spikes outward where heat and stance swell both ways",
        [
            (
                "Heat and Stance",
                "symmetric wave, as built",
                lambda t: (breach, {**uniform(0.15), "discourse": t}, uniform(0.6), "symmetric", TEAL),
            ),
            (
                "Breach residual",
                "same wave, rectified",
                lambda t: (breach, {**uniform(0.15), "discourse": t}, uniform(0.6), "outward", RUST),
            ),
        ],
        [(f"discourse turbulence {t:.2f}", t) for t in (0.0, 0.3, 0.6, 0.9)],
    )
