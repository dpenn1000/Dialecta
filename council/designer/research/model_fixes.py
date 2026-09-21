"""
Two things the frame asked me to test before I claim them: whether the heat
false positive goes away under a fix, and whether the carousel's luminosity
survives once hue carries territory instead of axis.

Part 1. The base noise floor is a FIXED PIXEL BUDGET, unscaled by the ring's
own radius. ceiling.py's own "CAN YOU SEE HEAT" table and when_is_heat.py both
independently show what that does: toward the core, where every ring shrinks,
the same fixed-pixel wobble becomes a larger and larger fraction of a smaller
and smaller ring, so the interior reads as rougher than the rim on EVERY
fingerprint, heat or none. Fix: scale the noise amplitude by the ring's own
local radius, so noise/radius holds roughly flat instead of ballooning toward
the centre. One line. Re-run the same roughness-vs-turbulence measurement
ceiling.py already used, under both settings.

Part 2. SPECIFIED (ramp 0.60, flat opacity 0.84) reads far darker than the
live carousel's measured OKLab L 0.725, and it is the condition that scored
worse than shipped in the reading test (17/21 against 19/21). Sweep ramp and
opacity, find a setting that keeps the interior visible (the reason the ramp
was proposed) without abandoning the light read, and render it against
shipped and SPECIFIED on the three people the reading test actually confused:
Marcus Aurel, Tom Reilly, Dolores Vance.

Run: python council/designer/research/model_fixes.py
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import numpy as np  # noqa: E402
from PIL import Image, ImageDraw  # noqa: E402

import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
import ring_layer_tuning as T  # noqa: E402
from palette_and_spacing import srgb_to_oklch  # noqa: E402
from palette_check import FIXED  # noqa: E402
from turbulence_lab import AXES, font, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402

MAXR = 118.0
PROFILES = list(G.PROFILES) + [F.MONO]

# ---------------------------------------------------------------------------
# Part 1: the noise floor, ratio-capped instead of pixel-fixed.
# ---------------------------------------------------------------------------


def boundary(profile, salt, ratio_fix, max_r=MAXR, n=720):
    """
    Ring 0, the silhouette, as ceiling.py has it: this is a depth=0 (rim) pass
    only, never the core. A ratio fix scaled against the WHOLE CANVAS (max_r)
    would discount a small or new contributor's rim noise along with their
    core, which is the wrong target: Ivy Chen's true turbulence is 0.214,
    second highest of the seven, and her rim is small only because she is new,
    not because any of it is old. The fix scales against that AXIS'S OWN
    extent instead, so at depth=0 the ratio is exactly 1.0 for everyone: full
    texture at the rim regardless of how far that rim has grown. The core is
    where the ratio falls, because the core is where depth genuinely
    increases, which is the per-ring test below, not this one.
    """
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    ext = {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in AXES}
    phase = ring_seed_for(0, "walk", salt)
    rot = ring_rotation(0, "walk", salt)
    out = []
    for p in range(n):
        theta = p / n * 2 * math.pi
        deg = math.degrees(theta)
        i = int(deg // 60) % 6
        a0, a1 = AXES[i], AXES[(i + 1) % 6]
        blend = G.smoothstep((deg - i * 60) / 60)
        e0 = max_r * 0.04 if grad[a0] == 0 else ext[a0]
        e1 = max_r * 0.04 if grad[a1] == 0 else ext[a1]
        r = e0 * (1 - blend) + e1 * blend  # depth=0, so r == the blended extent itself
        pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
        w0, w1 = (1 - blend) ** G.FALLOFF, blend ** G.FALLOFF
        turb = met[a0][1] * w0 + met[a1][1] * w1
        mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
        base_amp = ((1 - pur) * 4 + 1.8) * 1.4  # depth=0 factor, matches ceiling.py exactly
        if ratio_fix:
            base_amp *= max(r, 1e-6) / max(r, 1e-6)  # == 1.0 at depth 0, kept explicit for clarity
        r_noisy = r + perimeter_noise(theta + rot, phase) * base_amp
        r_noisy += turbulence_wave(theta + rot, phase, turb) * 9 * 1.0 * (0.4 + min(mat / 22, 1) * 2.1)
        out.append((deg, r_noisy))
    return out


def roughness_table(ratio_fix):
    rows = []
    for i, prof in enumerate(PROFILES):
        salt = i * 7919 + 13
        b = boundary(prof, salt, ratio_fix)
        n = len(b)
        sm = [sum(b[(j + k) % n][1] for k in range(-15, 16)) / 31 for j in range(n)]
        rough = sum(abs(b[j][1] - sm[j]) for j in range(n)) / n
        mixes = {}
        for a in AXES:
            for t, v in prof["axes"][a]["mix"].items():
                mixes[t] = mixes.get(t, 0) + v
        total = sum(mixes.values())
        turb = (mixes.get("heat", 0) + mixes.get("stance", 0)) / total
        rows.append((prof["name"], turb, rough))
    return rows


def per_ring_noise_over_r(profile, salt, ratio_fix, max_r=MAXR):
    """Mirrors when_is_heat.py's own table, at the core and the rim, both settings."""
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    ext = {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}
    max_grad = max(min(grad[a], 22) for a in AXES)
    n = max(4, round(max_grad * 1.15 + 4))
    clear = max_r * 0.08
    out = []
    for k in (0, n - 1):
        depth = k / max(1, n - 1)
        ph, rot = ring_seed_for(k, "walk", salt), ring_rotation(k, "walk", salt)
        rs, bs, hs = [], [], []
        for p in range(360):
            th = math.radians(p)
            i = int(p // 60) % 6
            a0, a1 = AXES[i], AXES[(i + 1) % 6]
            bl = G.smoothstep((p - i * 60) / 60)
            e0 = max_r * 0.04 if grad[a0] == 0 else ext[a0]
            e1 = max_r * 0.04 if grad[a1] == 0 else ext[a1]
            r0 = lambda a: max_r * 0.04 if grad[a] == 0 else ext[a] * (1 - depth) + clear * depth
            r = r0(a0) * (1 - bl) + r0(a1) * bl
            e_local = e0 * (1 - bl) + e1 * bl  # this axis's OWN rim extent, not the canvas max
            pur = met[a0][0] * (1 - bl) + met[a1][0] * bl
            w0, w1 = (1 - bl) ** G.FALLOFF, bl ** G.FALLOFF
            turb = met[a0][1] * w0 + met[a1][1] * w1
            mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
            amp = ((1 - pur) * 4 + 1.8) * (1 + (1 - depth) * 0.4)
            if ratio_fix:
                amp *= max(r, 1e-6) / max(e_local, 1e-6)
            b = perimeter_noise(th + rot, ph) * amp
            t = turbulence_wave(th + rot, ph, turb) * 9 * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1)
            rs.append(r)
            bs.append(b)
            hs.append(t)
        rms = lambda v: (sum(x * x for x in v) / len(v)) ** 0.5
        out.append((k, depth, sum(rs) / len(rs), rms(bs), rms(hs)))
    return out


# ---------------------------------------------------------------------------
# Part 2: luminosity under territory hue, sweeping ramp and opacity.
# ---------------------------------------------------------------------------


def _oklab_vec(arr):
    """Vectorised sRGB (0-255, HxWx3) to OKLab. Same formula as live_palette.py's oklab()."""
    c = arr.astype(np.float64) / 255.0
    lin = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    r, g, b = lin[..., 0], lin[..., 1], lin[..., 2]
    l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, np.hypot(A, B)


def median_L(img, chroma_min=0.08):
    """
    Median OKLab lightness of the STROKE pixels only, matching live_palette.py's
    own methodology (C >= 0.08) exactly, so the number is comparable to its
    0.725 on the live carousel. A plain distance-from-background threshold
    over-counts the pale halo wash, which is numerous and nearly background-
    coloured, and swamps the much rarer, much more saturated ring strokes it
    was supposed to be measuring: an earlier pass at this, thresholding on RGB
    distance alone, returned ~0.92 for every ramp and opacity setting tried,
    which is the halo's lightness, not the rings'.
    """
    arr = np.array(img.convert("RGB"))
    L, C = _oklab_vec(arr)
    mask = C >= chroma_min
    vals = L[mask]
    if vals.size == 0:
        return float("nan"), 0
    return float(np.median(vals)), int(vals.size)


if __name__ == "__main__":
    print("=" * 78)
    print("PART 1: heat false positive, ratio-capped noise vs fixed-pixel noise")
    print("=" * 78)
    print("\nAt the core and the rim: does noise/radius stay flat, or balloon?")
    print(f"{'contributor':16} {'ring':>5} {'depth':>6} {'r':>6}  "
          f"{'noise/r cur':>12} {'noise/r fix':>12} {'heat/r':>8}")
    for name in ("Father Anselm", "Dolores Vance", "Marcus Aurel"):
        prof = next(p for p in PROFILES if p["name"] == name)
        idx = [p["name"] for p in PROFILES].index(name)
        salt = idx * 7919 + 13
        cur = per_ring_noise_over_r(prof, salt, False)
        fix = per_ring_noise_over_r(prof, salt, True)
        for (k, d, r, b, h), (_, _, _, bf, _) in zip(cur, fix):
            print(f"{name:16} {k:>5} {d:>6.2f} {r:>6.1f}  {100*b/r:>10.1f}%  {100*bf/r:>10.1f}%  {100*h/r:>6.1f}%")

    print("\nCAN YOU SEE HEAT, current (fixed-pixel noise, ceiling.py's own numbers)")
    cur = roughness_table(False)
    for n, t, r in cur:
        print(f"  {n:16} true turbulence {t:.3f}   rendered roughness {r:.2f}px")
    order_t = sorted(range(len(cur)), key=lambda i: cur[i][1])
    order_r = sorted(range(len(cur)), key=lambda i: cur[i][2])
    print(f"  ranked by turbulence: {[cur[i][0] for i in order_t]}")
    print(f"  ranked by roughness:  {[cur[i][0] for i in order_r]}")
    tau = sum(1 for a in range(len(cur)) for b in range(a + 1, len(cur))
              if (cur[a][1] - cur[b][1]) * (cur[a][2] - cur[b][2]) > 0)
    npairs = len(cur) * (len(cur) - 1) // 2
    print(f"  pairwise agreement between the two rankings: {tau}/{npairs}")

    print("\nCAN YOU SEE HEAT, ratio-capped noise")
    fix = roughness_table(True)
    for n, t, r in fix:
        print(f"  {n:16} true turbulence {t:.3f}   rendered roughness {r:.2f}px")
    order_t = sorted(range(len(fix)), key=lambda i: fix[i][1])
    order_r = sorted(range(len(fix)), key=lambda i: fix[i][2])
    print(f"  ranked by turbulence: {[fix[i][0] for i in order_t]}")
    print(f"  ranked by roughness:  {[fix[i][0] for i in order_r]}")
    tau = sum(1 for a in range(len(fix)) for b in range(a + 1, len(fix))
              if (fix[a][1] - fix[b][1]) * (fix[a][2] - fix[b][2]) > 0)
    print(f"  pairwise agreement between the two rankings: {tau}/{npairs}")
    print(f"  roughness range, current:      {min(r for _,_,r in cur):.2f} to {max(r for _,_,r in cur):.2f}px"
          f"  (ratio {max(r for _,_,r in cur)/min(r for _,_,r in cur):.2f}x)")
    print(f"  roughness range, ratio-capped: {min(r for _,_,r in fix):.2f} to {max(r for _,_,r in fix):.2f}px"
          f"  (ratio {max(r for _,_,r in fix)/min(r for _,_,r in fix):.2f}x)")

    print("\n" + "=" * 78)
    print("PART 2: luminosity under territory hue, ramp x opacity sweep")
    print("=" * 78)
    SHIPPED_PALETTE = dict(G.TOPICS)
    G.TOPICS = FIXED
    picks = [("Marcus Aurel", 1), ("Dolores Vance", 5), ("Father Anselm", 4)]
    print("\ntarget: live carousel median L 0.725 (live_palette.py). shipped topic palette median L 0.507.")
    print(f"{'ramp':>6} {'opacity':>8}  " + "  ".join(f"{n:>14}" for n, _ in picks) + "   mean")
    for ramp in (0.0, 0.15, 0.30, 0.45, 0.60):
        for opacity in (0.60, 0.72, 0.84):
            spec = T.variant(rings=14, opacity=opacity, stroke=1.15, ramp=ramp, boundary_w=1.75,
                             boundary=True, halo_peak=0.40, halo_throw=42.0, halo_tint=0.60)
            Ls = []
            for name, idx in picks:
                prof = next(p for p in G.PROFILES if p["name"] == name)
                img = T.render(prof, idx * 7919 + 13, spec)
                L, npx = median_L(img)
                Ls.append(L)
            print(f"{ramp:>6.2f} {opacity:>8.2f}  " + "  ".join(f"{v:>14.3f}" for v in Ls)
                  + f"   {sum(Ls)/len(Ls):.3f}")

    print("\nshipped (own palette), same three people, for comparison")
    G.TOPICS = SHIPPED_PALETTE
    for name, idx in picks:
        prof = next(p for p in G.PROFILES if p["name"] == name)
        img, _ = G.render_one(prof, idx * 7919 + 13)
        L, npx = median_L(img)
        print(f"  {name:16} median L {L:.3f}")

    # -----------------------------------------------------------------------
    # Render the comparison sheet: shipped / SPECIFIED / candidate, on the
    # three people the reading test actually confused with each other.
    # -----------------------------------------------------------------------
    CANDIDATE = T.variant(rings=14, opacity=0.72, stroke=1.15, ramp=0.18, boundary_w=1.6,
                          boundary=True, halo_peak=0.40, halo_throw=42.0, halo_tint=0.60)
    SPECIFIED = T.variant(rings=14, opacity=0.84, stroke=1.15, ramp=0.60, boundary_w=1.75,
                          boundary=True, halo_peak=0.40, halo_throw=42.0, halo_tint=0.60)
    trio = [("Marcus Aurel", 1, None), ("Dolores Vance", 5, None), ("Tom Reilly", 6, F.MONO)]
    CELL, PAD = T.CELL, 20
    sheet = Image.new("RGB", (PAD + 3 * (CELL + PAD), 90 + 3 * (CELL + 46)), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 18), "The three the reading test confused: shipped / SPECIFIED / candidate", font=font(18, True), fill=G.INK)
    d.text((PAD, 44), "Candidate: ramp 0.18, opacity 0.72, boundary_w 1.6, territory hue, respaced palette.",
           font=font(11), fill=G.MUTED)
    rows = [("shipped (own palette)", None), ("SPECIFIED", SPECIFIED), ("candidate", CANDIDATE)]
    for r, (label, spec) in enumerate(rows):
        y = 90 + r * (CELL + 46)
        G.TOPICS = SHIPPED_PALETTE if spec is None else FIXED
        for c, (name, idx, prof_override) in enumerate(trio):
            x = PAD + c * (CELL + PAD)
            prof = prof_override or next(p for p in G.PROFILES if p["name"] == name)
            salt = idx * 7919 + 13
            img = G.render_one(prof, salt)[0] if spec is None else T.render(prof, salt, spec)
            sheet.paste(img, (x, y))
            d.text((x, y + CELL + 6), f"{prof['name']}, {label}", font=font(11, True), fill=G.INK)
    G.TOPICS = SHIPPED_PALETTE
    out = os.path.join(HERE, "MODEL-FIXES-TRIO.png")
    sheet.save(out, optimize=True)
    print("\nwrote", os.path.normpath(out))
