"""
Respacing the twelve topic hues without changing what any of them is.

Three pairs sit inside 18 degrees of each other and one 67 degree arc is empty.
Each colour is moved toward an even 30 degree grid, holding its OKLCH lightness
and chroma exactly and capping how far any one hue may travel, so nothing
changes family. Prints the current and proposed hex for both the base and the
deep partner.

Run: python council/designer/research/palette_respace.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import gallery_probe as G  # noqa: E402
from palette_and_spacing import srgb_to_oklch  # noqa: E402

MAX_TRAVEL = 22.0  # degrees any one hue may move, so nothing changes family


def oklch_to_srgb(L, C, H):
    a, b = C * math.cos(math.radians(H)), C * math.sin(math.radians(H))
    l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
    m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
    s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def enc(c):
        c = max(0.0, min(1.0, c))
        c = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
        return max(0, min(255, round(c * 255)))

    return enc(r), enc(g), enc(bb)


def hexs(rgb):
    return "#%02x%02x%02x" % rgb


if __name__ == "__main__":
    rows = []
    for name, (base, deep) in G.TOPICS.items():
        Lb, Cb, Hb = srgb_to_oklch(G.hex_rgb(base))
        Ld, Cd, Hd = srgb_to_oklch(G.hex_rgb(deep))
        rows.append([Hb, name, base, deep, Lb, Cb, Ld, Cd, Hd])
    rows.sort()

    # Anchor the even grid on the current circular mean, so the set as a whole
    # does not rotate.
    xs = sum(math.cos(math.radians(r[0])) for r in rows)
    ys = sum(math.sin(math.radians(r[0])) for r in rows)
    anchor = math.degrees(math.atan2(ys, xs)) % 360
    start = rows[0][0]
    offset = (start - anchor) % 30

    print(f"{'topic':<24} {'H now':>6} {'H new':>6} {'move':>6}   {'base now':<9} {'base new':<9} "
          f"{'deep now':<9} {'deep new':<9}")
    new = {}
    for i, (Hb, name, base, deep, Lb, Cb, Ld, Cd, Hd) in enumerate(rows):
        target = (anchor + offset + i * 30) % 360
        delta = (target - Hb + 180) % 360 - 180
        delta = max(-MAX_TRAVEL, min(MAX_TRAVEL, delta))
        Hn = (Hb + delta) % 360
        nb, nd = hexs(oklch_to_srgb(Lb, Cb, Hn)), hexs(oklch_to_srgb(Ld, Cd, (Hd + delta) % 360))
        new[name] = (Hn, nb, nd)
        print(f"{name:<24} {Hb:6.1f} {Hn:6.1f} {delta:+6.1f}   {base:<9} {nb:<9} {deep:<9} {nd:<9}")

    print("\nGAPS, now against proposed")
    order = [r[1] for r in rows]
    for i, n0 in enumerate(order):
        n1 = order[(i + 1) % len(order)]
        h0, h1 = dict((r[1], r[0]) for r in rows)[n0], dict((r[1], r[0]) for r in rows)[n1]
        g_now = (h1 - h0) % 360
        g_new = (new[n1][0] - new[n0][0]) % 360
        flag = "  CROWDED" if g_new < 15 else ""
        print(f"  {n0:<24} -> {n1:<24} {g_now:6.1f} -> {g_new:6.1f}{flag}")

    gaps_now = sorted((( [r[0] for r in rows][(i + 1) % 12] - r[0]) % 360) for i, r in enumerate(rows))
    gaps_new = sorted(((new[order[(i + 1) % 12]][0] - new[n][0]) % 360) for i, n in enumerate(order))
    print(f"\nsmallest gap  {gaps_now[0]:.1f} -> {gaps_new[0]:.1f}")
    print(f"largest gap   {gaps_now[-1]:.1f} -> {gaps_new[-1]:.1f}")

    print("\nPython literal for profile_gallery.py TOPICS")
    for name in G.TOPICS:
        print(f'    "{name}": ("{new[name][1]}", "{new[name][2]}"),')
