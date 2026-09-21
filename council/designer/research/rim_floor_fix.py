"""
Rebuttal check, not a new ruling: does the ratio-cap from model_fixes.py reach
the rim false positives (Father Anselm, Wen Zhao), or only the core one
(Priya Raman)?

The convener's own table shows floor > heat at the rim for all seven people,
and the ratio-cap is exactly 1.0 at the rim by construction (model_fixes.py's
own per_ring_noise_over_r, `amp *= r/e_local`, which is 1.0 when depth=0). So
the ratio-cap cannot touch this by definition; it was built for a different
bug, the core ballooning, and it fixes that bug only.

This checks why the rim floor is high regardless of turbulence: the "b" term
in when_is_heat.py's per_ring is `perimeter_noise(...) * ((1-pur)*4 + 1.8) *
depth_mult`. `pur` is forum-share (gallery_probe.metrics), not turbulence.
The +1.8 is an unconditional floor: even a contributor who is 100% forum
(pur=1, so (1-pur)*4=0) still gets amp 1.8 * depth_mult. Turbulence never
enters this term at all; it only drives the separate heat wave.

Fix tested here: keep a small irreducible constant, for "never a clean
curve", and make the rest of the amplitude scale with the SAME turb value
the heat wave already reads, instead of with purity. Nothing about ring
geometry changes; this is one line, same shape as the ratio-cap.

  current:  amp = ((1 - pur) * 4 + 1.8) * depth_mult
  proposed: amp = (0.4 + turb * 6.0)    * depth_mult

Run: python council/designer/research/rim_floor_fix.py
"""
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
from turbulence_lab import AXES, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402

MAXR = 122.0


def rim_row(prof, salt, floor_fix):
    ax = prof["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    ext = {a: (prog[a] ** G.POW * tradeoff(a) * MAXR if grad[a] else 0.0) for a in AXES}
    depth = 0.0  # ring 0, the rim
    ph, rot = ring_seed_for(0, "walk", salt), ring_rotation(0, "walk", salt)
    rs, bs, hs = [], [], []
    for p in range(360):
        th = math.radians(p)
        i = int(p // 60) % 6
        a0, a1 = AXES[i], AXES[(i + 1) % 6]
        bl = G.smoothstep((p - i * 60) / 60)
        r0 = lambda a: MAXR * 0.04 if grad[a] == 0 else ext[a]
        r = r0(a0) * (1 - bl) + r0(a1) * bl
        pur = met[a0][0] * (1 - bl) + met[a1][0] * bl
        w0, w1 = (1 - bl) ** G.FALLOFF, bl ** G.FALLOFF
        turb = met[a0][1] * w0 + met[a1][1] * w1
        mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
        depth_mult = 1 + (1 - depth) * 0.4
        if floor_fix:
            amp = (0.4 + turb * 6.0) * depth_mult
        else:
            amp = ((1 - pur) * 4 + 1.8) * depth_mult
        b = perimeter_noise(th + rot, ph) * amp
        t = turbulence_wave(th + rot, ph, turb) * 9 * (0.3 + (1 - depth) * 0.7) * (0.4 + min(mat / 22, 1) * 2.1)
        rs.append(r)
        bs.append(b)
        hs.append(t)
    rms = lambda v: (sum(x * x for x in v) / len(v)) ** 0.5
    return sum(rs) / len(rs), rms(hs), rms(bs)


if __name__ == "__main__":
    print("AT THE RIM, current floor vs. turbulence-gated floor. RMS in pixels.")
    print(f"{'':16} {'turb':>6} {'heat':>7} {'floor cur':>10} {'floor fix':>10} "
          f"{'heat/cur':>9} {'heat/fix':>9}")
    for i, p in enumerate(list(G.PROFILES) + [F.MONO]):
        salt = i * 7919 + 13
        mixes = {}
        for a in AXES:
            for tt, v in p["axes"][a]["mix"].items():
                mixes[tt] = mixes.get(tt, 0) + v
        turb = (mixes.get("heat", 0) + mixes.get("stance", 0)) / sum(mixes.values())
        _, heat_cur, floor_cur = rim_row(p, salt, False)
        _, heat_fix, floor_fix = rim_row(p, salt, True)
        assert abs(heat_cur - heat_fix) < 1e-9, "heat term must be untouched by the floor fix"
        print(f"{p['name']:16} {turb:>6.3f} {heat_cur:>7.2f} {floor_cur:>10.2f} {floor_fix:>10.2f} "
              f"{heat_cur/floor_cur:>9.2f} {heat_cur/floor_fix:>9.2f}")
