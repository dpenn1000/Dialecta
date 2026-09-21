"""
Two measurements the fingerprint rulings depend on.

1. The twelve topic colours in OKLCH: where they crowd, what lightness range
   they occupy, and which region of the space is genuinely empty (which is the
   only honest place to put a Breach residual).

2. Whether adjacent rings actually cross. Ring spacing and noise amplitude in
   isolation say they must; adjacent rings are correlated by design, so the
   differential is what settles it.

Run: python council/designer/research/palette_and_spacing.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))

import gallery_probe as G  # noqa: E402
from turbulence_lab import perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402


def srgb_to_oklch(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in rgb)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    C = math.hypot(a, bb)
    H = math.degrees(math.atan2(bb, a)) % 360
    return L, C, H


def relative_luminance(rgb):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    r, g, b = (lin(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(a, b):
    la, lb = relative_luminance(a), relative_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def palette_audit():
    print("TOPIC PALETTE IN OKLCH, sorted by hue")
    print(f"{'topic':<24} {'base':<9} {'L':>5} {'C':>5} {'H':>6}   {'deep':<9} {'L':>5} {'C':>5} "
          f"{'dL':>6}  {'vs BG':>6}")
    rows = []
    for name, (base, deep) in G.TOPICS.items():
        Lb, Cb, Hb = srgb_to_oklch(G.hex_rgb(base))
        Ld, Cd, Hd = srgb_to_oklch(G.hex_rgb(deep))
        rows.append((Hb, name, base, Lb, Cb, deep, Ld, Cd, Ld - Lb, contrast(G.hex_rgb(base), G.BG)))
    rows.sort()
    for Hb, name, base, Lb, Cb, deep, Ld, Cd, dL, cr in rows:
        print(f"{name:<24} {base:<9} {Lb:5.3f} {Cb:5.3f} {Hb:6.1f}   {deep:<9} {Ld:5.3f} {Cd:5.3f} "
              f"{dL:+6.3f}  {cr:5.2f}:1")

    print("\nHUE GAPS around the wheel (adjacent pairs, degrees)")
    hs = [(r[0], r[1]) for r in rows]
    gaps = []
    for i in range(len(hs)):
        h0, n0 = hs[i]
        h1, n1 = hs[(i + 1) % len(hs)]
        gap = (h1 - h0) % 360
        gaps.append((gap, n0, n1))
    even = 360 / len(hs)
    for gap, n0, n1 in gaps:
        flag = "  CROWDED" if gap < even * 0.5 else ("  GAP" if gap > even * 2 else "")
        print(f"  {n0:<24} -> {n1:<24} {gap:6.1f}   (even spacing would be {even:.1f}){flag}")

    Ls = sorted(srgb_to_oklch(G.hex_rgb(b))[0] for b, _ in G.TOPICS.values())
    Cs = sorted(srgb_to_oklch(G.hex_rgb(b))[1] for b, _ in G.TOPICS.values())
    print(f"\nBASE lightness L: {Ls[0]:.3f} to {Ls[-1]:.3f}, spread {Ls[-1] - Ls[0]:.3f}")
    print(f"BASE chroma    C: {Cs[0]:.3f} to {Cs[-1]:.3f}, spread {Cs[-1] - Cs[0]:.3f}")
    print(f"Background {G.BG} sits at L={srgb_to_oklch(G.BG)[0]:.3f} C={srgb_to_oklch(G.BG)[1]:.3f}")
    print("Every topic colour is chromatic. Nothing in the palette is neutral.")

    print("\nTHE RED NEIGHBOURHOOD (everything that already reads warm-red)")
    for label, hexv in [("politics_governance base", "#9e2020"), ("law_justice base", "#b04020"),
                        ("Stance badge", "#A8483C"), ("Stance badge deep", "#783028"),
                        ("Stance halo tint", "#6a1010"), ("Breach badge", "#6A1818"),
                        ("Breach badge deep", "#380808"), ("politics deep", "#501010"),
                        ("law_justice deep", "#5a1e0a")]:
        L, C, H = srgb_to_oklch(G.hex_rgb(hexv))
        print(f"  {label:<26} {hexv:<9} L={L:.3f} C={C:.3f} H={H:6.1f}")


def spacing_audit(profile_index=5):
    prof = G.PROFILES[profile_index]
    print(f"\n\nRING SEPARATION, {prof['name']}")
    max_r = 122.0
    ax = prof["axes"]
    grad = {a: ax[a]["grad"] for a in G.AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in G.AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in G.AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    extent = {a: prog[a] ** G.POW * tradeoff(a) * max_r for a in G.AXES}
    max_grad = max(min(grad[a], 22) for a in G.AXES)
    salt = profile_index * 7919 + 13
    clearance = max_r * 0.08

    def radii(n_rings, noise_gain=1.0, wave_gain=1.0):
        out = []
        for k in range(n_rings):
            depth = k / max(1, n_rings - 1)
            phase = ring_seed_for(k, "walk", salt)
            rot = ring_rotation(k, "walk", salt)
            row = []
            for p in range(360):
                theta = p / 360 * 2 * math.pi
                deg = math.degrees(theta)
                i = int(deg // 60) % 6
                a0, a1 = G.AXES[i], G.AXES[(i + 1) % 6]
                blend = G.smoothstep((deg - i * 60) / 60)
                rr = lambda a: max_r * 0.04 if grad[a] == 0 else extent[a] * (1 - depth) + clearance * depth
                r = rr(a0) * (1 - blend) + rr(a1) * blend
                pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
                w0, w1 = (1 - blend) ** G.FALLOFF, blend**G.FALLOFF
                turb = met[a0][1] * w0 + met[a1][1] * w1
                mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
                r += noise_gain * perimeter_noise(theta + rot, phase) * (((1 - pur) * 4 + 1.8) * (1 + (1 - depth) * 0.4))
                r += wave_gain * (turbulence_wave(theta + rot, phase, turb) * 9
                                  * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1))
                row.append(r)
            out.append(row)
        return out

    print(f"{'rings':>6} {'nominal':>8} {'worst gap':>10} {'crossings':>10} {'% of perimeter crossed':>23}")
    for n_rings in (29, 22, 18, 14, 12, 10, 8):
        rs = radii(n_rings)
        nominal = (max(extent.values()) - clearance) / (n_rings - 1)
        worst, crossed, total = 1e9, 0, 0
        for k in range(n_rings - 1):
            for p in range(360):
                gap = rs[k][p] - rs[k + 1][p]
                worst = min(worst, gap)
                total += 1
                if gap < 1.5:
                    crossed += 1
        print(f"{n_rings:6} {nominal:7.2f}px {worst:9.2f}px {crossed:10} {crossed / total * 100:22.1f}%")

    print("\nSame count, with the perturbation held to the gap it has to live in:")
    for label, ng, wg in [("as shipped", 1.0, 1.0), ("noise x0.5", 0.5, 1.0),
                          ("wave x0.5", 1.0, 0.5), ("both x0.5", 0.5, 0.5)]:
        for n_rings in (14, 12):
            rs = radii(n_rings, ng, wg)
            worst, crossed, total = 1e9, 0, 0
            for k in range(n_rings - 1):
                for p in range(360):
                    gap = rs[k][p] - rs[k + 1][p]
                    worst = min(worst, gap)
                    total += 1
                    if gap < 1.5:
                        crossed += 1
            print(f"  {label:<12} {n_rings:2} rings  worst {worst:6.2f}px  crossed {crossed / total * 100:5.1f}%")


if __name__ == "__main__":
    palette_audit()
    spacing_audit()
