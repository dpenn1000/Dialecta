"""
The ring model with a season's colour scoped to the season.

Three colour regimes on identical geometry, so only the scoping changes.

  current   one topic per axis per ring, sharpBlend between neighbours. One
            comment paints a sixth of the ring whatever the history looks like.
  subtick   the axis's 60 degrees are divided among the comments that fall in
            that ring's slice, in proportion. Angular extent is earned.
  scoped    subtick, plus radial bleed outward and a blank core.

min_arc is a level of detail rather than a constant. An arc shorter than about
six pixels of perimeter stops reading as a colour, so ticks merge by nearest
neighbour in time until every arc clears it. At a small size that collapses back
toward one arc per sector, which is correct at a small size.

Run: python council/designer/research/ring_seasons.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import gallery_probe as G  # noqa: E402
import ledger_render as L  # noqa: E402
from palette_check import FIXED as TOPICS  # noqa: E402
from season_scope import realistic_history, runs, sharp_blend  # noqa: E402
from turbulence_lab import perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402

AXES = G.AXES
N_DEG = 720
N_RINGS = 14

BLEED = 0.28       # how much of a ring's colour carries outward into the next
CORE_SCOPED = 0.13  # blank centre, as a fraction of the mark radius
CORE_CURRENT = 0.08
EDGE_DEG = 1.6     # antialiasing at an arc boundary, and no more than that
MIN_ARC_PX = 6.0   # perimeter below which an arc stops reading as a colour


def axis_histories(profile, seed=3, scale=3, realistic=True):
    """Per-axis, per-comment topic and tier, oldest first."""
    out = {}
    for ai, a in enumerate(AXES):
        spec = profile["axes"][a]
        tiers = []
        for t, n in spec["mix"].items():
            tiers += [t] * (n * scale)
        n_ev = max(1, len(tiers))
        topics = [t for t, _ in spec["phases"]] or [None]
        if realistic:
            hist = realistic_history(n_ev, topics, seed=seed * 17 + ai)
        else:
            hist, span, acc = [], sum(n for _, n in spec["phases"]) or 1, 0.0
            for t, n in spec["phases"]:
                acc += n / span * n_ev
                while len(hist) < round(acc):
                    hist.append(t)
            while len(hist) < n_ev:
                hist.append(topics[-1])
        out[a] = list(zip(hist, (tiers + ["forum"] * n_ev)[:n_ev]))
    return out


def cell_arcs(slice_topics, min_arc, span=60.0):
    """
    Divide one axis's `span` degrees among the comments in this ring's slice.

    Consecutive comments on the same topic merge first, which is why a real run
    earns a wide arc and a single comment never does. Then the narrowest arc
    folds into its smaller neighbour until every arc clears `min_arc`.
    """
    if not slice_topics:
        return [(None, 0.0, span)]
    rs = [[t, n] for t, n in runs(slice_topics)]
    guard = 0
    while len(rs) > 1 and guard < 64:
        guard += 1
        total = sum(n for _, n in rs)
        i = min(range(len(rs)), key=lambda j: rs[j][1])
        if span * rs[i][1] / total >= min_arc:
            break
        left = rs[i - 1][1] if i > 0 else None
        right = rs[i + 1][1] if i + 1 < len(rs) else None
        j = i - 1 if right is None or (left is not None and left <= right) else i + 1
        rs[j][1] += rs[i][1]
        rs.pop(i)
        # Neighbours may now share a topic, so collapse again.
        merged, k = [], 0
        while k < len(rs):
            t, n = rs[k]
            while k + 1 < len(rs) and rs[k + 1][0] == t:
                n += rs[k + 1][1]
                k += 1
            merged.append([t, n])
            k += 1
        rs = merged
    total = sum(n for _, n in rs)
    out, at = [], 0.0
    for t, n in rs:
        w = span * n / total
        out.append((t, at, at + w))
        at += w
    return out


def colour_of(topic, depth, ramp=0.55):
    base, deep = TOPICS.get(topic or "", ("#8a8278", "#5a5248"))
    return np.array(G.mix(G.hex_rgb(base), G.hex_rgb(deep), depth * ramp), dtype=float)


def _arc_weight(deg, lo, hi):
    a0, a1 = lo % 360, hi % 360
    inside = (a0 <= deg < a1) if a0 < a1 else (deg >= a0 or deg < a1)
    edge = min(abs(((deg - a0 + 180) % 360) - 180), abs(((deg - a1 + 180) % 360) - 180))
    if edge < EDGE_DEG:
        return 0.5 + (0.5 if inside else -0.5) * (edge / EDGE_DEG)
    return 1.0 if inside else 0.0


def ring_colour_row(mode, per_axis_slices, depth, min_arc):
    """N_DEG colours for one ring."""
    cols = np.zeros((N_DEG, 3))
    if mode == "current":
        tops = [s[len(s) // 2][0] if s else None for s in per_axis_slices]
        for d in range(N_DEG):
            deg = d * 360 / N_DEG
            i = int(deg // 60) % 6
            t = (deg - i * 60) / 60
            ca, cb = colour_of(tops[i], depth), colour_of(tops[(i + 1) % 6], depth)
            cols[d] = ca + (cb - ca) * sharp_blend(t)
        return cols

    arcs = []
    for i, s in enumerate(per_axis_slices):
        for t, lo, hi in cell_arcs([x[0] for x in s], min_arc):
            arcs.append((colour_of(t, depth), i * 60 - 30 + lo, i * 60 - 30 + hi))
    for d in range(N_DEG):
        deg = (d * 360 / N_DEG) % 360
        acc, wsum = np.zeros(3), 0.0
        for col, lo, hi in arcs:
            w = _arc_weight(deg, lo, hi)
            if w > 0:
                acc += col * w
                wsum += w
        cols[d] = acc / wsum if wsum else colour_of(None, depth)
    return cols


def build(profile, mode, S=640, salt=13, realistic=True, heat_seed=3):
    p = L.with_years(profile) if "years" not in profile else profile
    hist = axis_histories(p, seed=heat_seed, realistic=realistic)
    grad = {a: p["axes"][a]["grad"] for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}
    met = {a: G.metrics(p["axes"][a]["mix"]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[q] * prog[k] * G.PEN
                  for a, b in G.PAIRS for q in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    max_r = S * 0.40
    extent = {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}
    core = max_r * (CORE_SCOPED if mode == "scoped" else CORE_CURRENT)
    min_arc = max(2.5, 360.0 * MIN_ARC_PX / (2 * math.pi * max_r))

    rings, rows = [], []
    for k in range(N_RINGS):
        depth = k / (N_RINGS - 1)
        slices = []
        for a in AXES:
            h = hist[a]
            lo = int(len(h) * (1 - (k + 1) / N_RINGS))
            hi = int(len(h) * (1 - k / N_RINGS))
            slices.append(h[lo:max(hi, lo + 1)])
        rows.append(ring_colour_row(mode, slices, depth, min_arc))

        phase, rot = ring_seed_for(k, "walk", salt), ring_rotation(k, "walk", salt)
        pts = []
        for d in range(N_DEG):
            deg = d * 360 / N_DEG
            th = math.radians(deg)
            i = int(deg // 60) % 6
            a0, a1 = AXES[i], AXES[(i + 1) % 6]
            bl = G.smoothstep((deg - i * 60) / 60)
            r0 = max_r * 0.04 if grad[a0] == 0 else extent[a0] * (1 - depth) + core * depth
            r1 = max_r * 0.04 if grad[a1] == 0 else extent[a1] * (1 - depth) + core * depth
            r = r0 * (1 - bl) + r1 * bl
            pur = met[a0][0] * (1 - bl) + met[a1][0] * bl
            w0, w1 = (1 - bl) ** G.FALLOFF, bl ** G.FALLOFF
            turb = met[a0][1] * w0 + met[a1][1] * w1
            mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
            r += perimeter_noise(th + rot, phase) * (((1 - pur) * 4 + 1.8) * (1 + (1 - depth) * 0.4))
            r += (turbulence_wave(th + rot, phase, turb) * 9
                  * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1))
            pts.append((math.cos(th - math.pi / 2) * r, math.sin(th - math.pi / 2) * r))
        rings.append(pts)

    if mode == "scoped":
        # Radial bleed. A season tints what came after it and falls away. Only
        # outward, because outward is later and two adjacent rings on one axis
        # are the same pillar at adjacent moments, which is a real relationship.
        out = [None] * N_RINGS
        out[-1] = rows[-1]
        for k in range(N_RINGS - 2, -1, -1):
            out[k] = rows[k] * (1 - BLEED) + out[k + 1] * BLEED
        rows = out
    return rings, rows, max_r


def render(profile, mode, S=640, px=None, salt=13, realistic=True, heat_seed=3):
    """`px` is the size this will be SEEN at; stroke widths are set for that."""
    rings, rows, _ = build(profile, mode, S, salt, realistic, heat_seed)
    img = Image.new("RGB", (S, S), G.BG)
    d = ImageDraw.Draw(img)
    cx = cy = S / 2
    sup = S / float(px or S)
    for k in range(len(rings) - 1, -1, -1):
        pts, cols = rings[k], rows[k]
        w = max(1, int(round((1.6 if k == 0 else 1.2) * sup)))
        op = 0.95 if k == 0 else 0.84
        for j in range(N_DEG):
            x0, y0 = pts[j]
            x1, y1 = pts[(j + 1) % N_DEG]
            c = tuple(int(max(0, min(255, v))) for v in cols[j])
            d.line([cx + x0, cy + y0, cx + x1, cy + y1], fill=G.mix(G.BG, c, op), width=w)
    return img.resize((px, px), Image.LANCZOS) if px else img


def longest_pure_arc(rows, thresh=14.0):
    """Average over rings of the longest contiguous run of one palette colour."""
    pal = np.array([G.hex_rgb(v[0]) for v in TOPICS.values()], dtype=float)
    out = []
    for row in rows:
        d = np.linalg.norm(row[:, None, :] - pal[None, :, :], axis=2)
        idx = d.argmin(axis=1)
        lab = np.where(d.min(axis=1) <= thresh, idx, -1)
        best, n = 0, len(lab)
        for s in range(n):
            if lab[s] < 0 or lab[s - 1] == lab[s]:
                continue
            run = 1
            while run < n and lab[(s + run) % n] == lab[s]:
                run += 1
            best = max(best, run)
        if best == 0 and lab[0] >= 0 and (lab == lab[0]).all():
            best = n
        out.append(best * 360 / n)
    return float(np.mean(out))


if __name__ == "__main__":
    import gallery_probe as GP
    print(f"{'contributor':<16} {'regime':<10} {'longest single-season arc, averaged over rings':>48}")
    for prof in (GP.PROFILES[2], GP.PROFILES[5], GP.PROFILES[3]):
        for mode in ("current", "subtick", "scoped"):
            for real in (False, True) if mode == "current" else (True,):
                _, rows, _ = build(prof, mode, 640, realistic=real)
                lab = mode + ("" if mode != "current" else (", interleaved" if real else ", coarse"))
                print(f"{prof['name']:<16} {lab:<24} {longest_pure_arc(rows):38.1f} degrees")
