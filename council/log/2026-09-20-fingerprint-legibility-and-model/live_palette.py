"""
What is the live page actually colouring, and with what?

Three questions, each answered from pixels rather than from a look.

1. live-1 to live-3, the contributor carousel: do the rings carry the six AXIS
   hues at their own bearings (the engine's fallback), and what is the halo?
2. live-4, the archetype cards: do the rings vary by bearing (axis) or by
   radius (topic history, laid down in time)?
3. Why the live marks read luminous: lightness and chroma of what is on screen
   against the topic palette and against designer's respaced palette.

Centres are the gold seed dot, located by eye on each image and confirmed by
sampling its colour.
"""

import math
import os

from PIL import Image

AXIS = [("acuity", "#d49415", 0), ("calibration", "#2674d4", 60), ("magnanimity", "#3aa564", 120),
        ("discourse", "#dc5418", 180), ("consistency", "#b8429a", 240), ("reach", "#a8a020", 300)]
TOPIC = {
    "politics_governance": "#9e2020", "law_justice": "#b04020", "history": "#9a5818",
    "economics": "#b87a18", "environment_energy": "#3a7a24", "health_medicine": "#287858",
    "psychology_behavior": "#267080", "science_technology": "#2650a0",
    "philosophy_ethics": "#3a3888", "arts_humanities": "#6a3a9a",
    "theology_spirituality": "#7a2a80", "society_culture": "#8a2858",
}
RESPACED = ["#ad302c", "#a43f00", "#8d5400", "#766200", "#4c7100", "#227454",
            "#236e7e", "#0066ad", "#5658ab", "#7747a8", "#8d3d93", "#9d3a68"]
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "docs", "fingerprint-examples", "live-page")


def rgb(h):
    return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))


def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def oklab(c):
    r, g, b = (lin(x) for x in c)
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    return (0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s)


def lch(c):
    L, a, b = oklab(c)
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


def circ_mean(hs, ws=None):
    ws = ws or [1] * len(hs)
    x = sum(w * math.cos(math.radians(h)) for h, w in zip(hs, ws))
    y = sum(w * math.sin(math.radians(h)) for h, w in zip(hs, ws))
    return math.degrees(math.atan2(y, x)) % 360


def hdist(a, b):
    return abs((a - b + 180) % 360 - 180)


def ring_hues_on_bearing(px, cx, cy, deg, r0, r1, min_c=0.05):
    th = math.radians(deg)
    dx, dy = math.sin(th), -math.cos(th)
    hs, ws = [], []
    for r in range(int(r0), int(r1)):
        L, C, H = lch(px[int(cx + dx * r), int(cy + dy * r)])
        if C >= min_c:
            hs.append(H)
            ws.append(C)
    return hs, ws


def silhouette_radius(px, cx, cy, deg, rmax):
    """Outermost pixel on the bearing that is darker than the cream ground by a clear margin."""
    th = math.radians(deg)
    dx, dy = math.sin(th), -math.cos(th)
    last = 0
    for r in range(10, int(rmax)):
        L, C, H = lch(px[int(cx + dx * r), int(cy + dy * r)])
        if L < 0.62 and C > 0.03:
            last = r
    return last


def carousel(name, cx, cy, rmax):
    im = Image.open(os.path.join(BASE, name)).convert("RGB")
    px = im.load()
    print(f"\n{name}, centre ({cx},{cy})")
    print(f"  {'bearing':>12} {'edge px':>8} {'ring hue':>9} {'own axis hue':>13} {'nearest axis':>20} {'nearest topic':>26}")
    hits = 0
    ringL, ringC = [], []
    for ax, hexv, deg in AXIS:
        edge = silhouette_radius(px, cx, cy, deg, rmax)
        hs, ws = ring_hues_on_bearing(px, cx, cy, deg, edge * 0.45, edge * 0.97)
        if len(hs) < 5:
            print(f"  {ax:>12} {edge:>8}  too few coloured samples")
            continue
        mh = circ_mean(hs, ws)
        own = lch(rgb(hexv))[2]
        na = min(AXIS, key=lambda t: hdist(lch(rgb(t[1]))[2], mh))
        nt = min(TOPIC.items(), key=lambda t: hdist(lch(rgb(t[1]))[2], mh))
        hits += na[0] == ax
        print(f"  {ax:>12} {edge:>8} {mh:>9.1f} {own:>13.1f} "
              f"{na[0] + ' (' + format(hdist(lch(rgb(na[1]))[2], mh), '.0f') + ')':>20} "
              f"{nt[0] + ' (' + format(hdist(lch(rgb(nt[1]))[2], mh), '.0f') + ')':>26}")
        # the strongest stroke colours on this bearing, for the luminance question
        th = math.radians(deg)
        dx, dy = math.sin(th), -math.cos(th)
        for r in range(int(edge * 0.45), int(edge * 0.97)):
            L, C, H = lch(px[int(cx + dx * r), int(cy + dy * r)])
            if C >= 0.08:
                ringL.append(L)
                ringC.append(C)
    # the halo: an annulus just outside the silhouette, on all six bearings and between
    hh, hw, hL = [], [], []
    for d in range(0, 360, 5):
        edge = silhouette_radius(px, cx, cy, d, rmax)
        if edge == 0:
            continue
        th = math.radians(d)
        dx, dy = math.sin(th), -math.cos(th)
        for r in range(int(edge + 8), int(edge + 40)):
            x, y = int(cx + dx * r), int(cy + dy * r)
            if not (0 <= x < im.size[0] and 0 <= y < im.size[1]):
                continue
            L, C, H = lch(px[x, y])
            if C > 0.012:
                hh.append(H)
                hw.append(C)
                hL.append(L)
    halo = circ_mean(hh, hw) if hh else float("nan")
    print(f"  ring hues at their own axis: {hits} of 6")
    if hh:
        print(f"  halo: hue {halo:.1f}, mean chroma {sum(hw)/len(hw):.3f}, mean L {sum(hL)/len(hL):.3f}")
    return ringL, ringC, halo


def card(im, cx, cy, rmax, label):
    px = im.load()
    print(f"\n  {label}, centre ({cx},{cy})")
    by_bearing = []
    for deg in range(0, 360, 30):
        edge = silhouette_radius(px, cx, cy, deg, rmax)
        hs, ws = ring_hues_on_bearing(px, cx, cy, deg, edge * 0.45, edge * 0.70, 0.04)
        if len(hs) >= 4:
            by_bearing.append((deg, circ_mean(hs, ws)))
    spread = max(hdist(a[1], b[1]) for a in by_bearing for b in by_bearing) if by_bearing else 0
    core, rim = [], []
    for deg in range(0, 360, 10):
        edge = silhouette_radius(px, cx, cy, deg, rmax)
        a, aw = ring_hues_on_bearing(px, cx, cy, deg, edge * 0.20, edge * 0.45, 0.04)
        b, bw = ring_hues_on_bearing(px, cx, cy, deg, edge * 0.80, edge * 0.98, 0.04)
        core += list(zip(a, aw))
        rim += list(zip(b, bw))
    ch = circ_mean([h for h, _ in core], [w for _, w in core]) if core else float("nan")
    rh = circ_mean([h for h, _ in rim], [w for _, w in rim]) if rim else float("nan")
    print(f"    hue spread across 12 bearings at mid radius: {spread:.0f} degrees")
    print(f"    core hue {ch:.0f}, rim hue {rh:.0f}, core to rim {hdist(ch, rh):.0f} degrees")
    return spread, hdist(ch, rh)


if __name__ == "__main__":
    allL, allC = [], []
    halos = []
    for name, cx, cy, rmax in (("live-1.webp", 630, 579, 420), ("live-2.webp", 695, 622, 420),
                               ("live-3.webp", 628, 605, 420)):
        L, C, h = carousel(name, cx, cy, rmax)
        allL += L
        allC += C
        halos.append(h)
    print(f"\nhalo hue on the three carousel marks: {[round(h) for h in halos]}  "
          f"(gold seed #b8862e is {lch(rgb('#b8862e'))[2]:.0f}); spread {max(hdist(a, b) for a in halos for b in halos):.0f}")

    print("\nLUMINANCE: why the live marks read light")
    allL.sort()
    allC.sort()
    print(f"  live carousel strokes, chroma >= 0.08: median L {allL[len(allL)//2]:.3f}, median C {allC[len(allC)//2]:.3f}")
    for label, pal in (("six axis hues", [h for _, h, _ in AXIS]), ("topic palette, shipped", list(TOPIC.values())),
                       ("topic palette, respaced", RESPACED)):
        Ls = sorted(lch(rgb(h))[0] for h in pal)
        Cs = sorted(lch(rgb(h))[1] for h in pal)
        print(f"  {label:>24}: median L {Ls[len(Ls)//2]:.3f}, median C {Cs[len(Cs)//2]:.3f}")

    print("\nlive-4, the archetype cards")
    im = Image.open(os.path.join(BASE, "live-4.webp")).convert("RGB")
    for label, cx, cy in (("Empiricist", 413, 272), ("Contextualist", 1447, 272),
                          ("Illuminator", 413, 1543), ("Reviser", 1447, 1543)):
        card(im, cx, cy, 240, label)
