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


# Frequencies are INTEGERS so the field closes around the perimeter.
# The engine uses 7.3, 13.1, 21.7 and 4.1, none of them whole, so noise(0) and
# noise(2*pi) disagree and every ring carries a step at theta = 0. Measured on
# the engine's own numbers: up to 1.118 of a +-1.15 range, about 6.5px at a
# mature amplitude. A closed loop cannot have a discontinuity in it, and the
# nearest integers keep the character while removing the seam entirely
# (worst gap after: 6.6e-14).
OCTAVES = ((7, 1.7, 0.0, 0.5), (13, 3.3, 1.4, 0.3), (22, 5.9, 2.7, 0.2), (4, 0.7, 0.0, 0.15))


def perimeter_noise(theta, ring_seed, only=None):
    """
    Multi-octave wobble. Present on every fingerprint, at every purity.

    `only` restricts the sum to one octave index, for isolating which term
    produces the spiral.
    """
    total = 0.0
    for i, (f, c, k0, amp) in enumerate(OCTAVES):
        if only is not None and i != only:
            continue
        total += math.sin(theta * f + ring_seed * c + k0) * amp
    return total


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
    # The frequency has to be a whole number so the wave closes around the
    # perimeter, and it also has to vary smoothly, because turbulence is a
    # per-point quantity: rounding it alone turns the frequency into a step
    # function of theta and puts a fresh seam wherever it steps. So evaluate
    # at the two bracketing integers and blend. A blend of two closed waves is
    # closed, and the frequency still rises continuously with turbulence.
    fr = 3 + turbulence * 8
    lo = math.floor(fr)
    frac = fr - lo

    def at(f):
        f = max(1, int(f))
        return (
            math.sin(theta * f + ring_seed * 0.4) * 0.7
            + math.sin(theta * max(1, round(f * 1.8)) + ring_seed * 0.9 + 1.1) * 0.4
            + math.sin(theta * max(1, round(f * 0.5)) + ring_seed * 0.2 + 2.3) * 0.5
        )

    w = at(lo) * (1 - frac) + at(lo + 1) * frac
    if mode == "outward":
        w = abs(w)
    return w * turbulence


WALK_STEP = 0.07  # radians of ANGLE per ring, about 4 degrees


def _hash01(k, salt=0.0):
    """Deterministic pseudo-random in [0, 1). Same contributor, same texture."""
    return (math.sin(k * 127.1 + salt * 311.7 + 74.7) * 43758.5453) % 1.0


def ring_rotation(k, seed_mode, salt=0.0, step=None):
    """
    The angle this ring's whole noise field is turned by, in radians.

    This is the correction to a first attempt that walked the PHASE instead.
    Phase enters each octave multiplied by its own coefficient (1.7, 3.3, 5.9,
    0.7), so a phase step of 2.6 rad moved the finest octave by 15 rad, several
    whole periods, and the walk degenerated into a hash. Dan, looking at the
    render: hashed and walked "don't look that different". They were not.

    Rotating theta itself turns every octave together by the same angle, which
    is what a coherent material does, and puts the step in units that mean
    something: WALK_STEP is degrees of turn between neighbouring rings.
    """
    s = WALK_STEP if step is None else step
    if seed_mode == "linear":
        return 0.0
    if seed_mode == "hashed":
        return _hash01(k, salt) * 2 * math.pi
    rot, i = 0.0, 0
    while i < int(k):
        i += 1
        rot += (_hash01(i, salt) * 2 - 1) * s
    frac = k - int(k)
    if frac:
        rot += (_hash01(int(k) + 1, salt) * 2 - 1) * s * frac
    return rot


def ring_seed_for(k, seed_mode, salt=0.0, step=None):
    """
    Three ways to seed a ring's phase, only one of which is organic.

    `linear` is the engine as built: `k * 11.7 + 3.3`. Its comment says this
    exists "so adjacent rings wiggle differently", but the seed is used as a
    PHASE, and a phase offset on a function of theta is an angular rotation.
    A seed advancing by a constant rotates every ring by a constant angle from
    the one inside it, which constructs a spiral instead of decorrelating.

    `hashed` removes the spiral by making every ring independent. It also
    removes what makes the texture read as a material: real ridges run
    alongside their neighbours, and independent rings read as static.

    `walk` is the one to ship. The phase takes a small random step per ring
    rather than a fixed one, so neighbouring rings stay close (ridges that
    follow each other) while the accumulated rotation wanders instead of
    marching (no spiral). Deterministic in `salt`, so a contributor's
    fingerprint is the same every render, which the whole identity claim
    depends on.
    """
    if seed_mode == "hashed":
        return _hash01(k, salt) * 2 * math.pi
    if seed_mode == "walk":
        # The field is one material, so the phase is fixed. Ring-to-ring
        # variation is the small ROTATION in ring_rotation, plus this light
        # jitter so neighbours are alike without being identical.
        return _hash01(0, salt) * 2 * math.pi + (_hash01(k, salt + 1) * 2 - 1) * 0.18
    return k * 11.7 + 3.3


def build_rings(axis_grad, axis_turb, axis_purity, max_r, mode="symmetric", seed_mode="linear", only=None):
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
        ring_seed = ring_seed_for(k, seed_mode)
        ring_rot = ring_rotation(k, seed_mode)
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
            radius += perimeter_noise(theta + ring_rot, ring_seed, only) * base_amp

            recency = 0.3 + (1 - depth) * 0.7
            maturity = 0.4 + min(local_mat / 22, 1) * 2.1
            radius += turbulence_wave(theta + ring_rot, ring_seed, local_turb, mode) * 9 * recency * maturity

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
