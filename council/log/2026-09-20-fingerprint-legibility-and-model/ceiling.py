"""
The decode ceiling: can the datum be recovered from the rendered mark at all?

Nothing filed so far measures this. `designer` measured whether two people are
DISTINGUISHABLE. This asks the other question: does the boundary the viewer sees
still carry the axis ordering that produced it, and if not, which stage lost it.

Three stages, measured separately so the loss can be attributed:

  graduations -> extent      the trade-off penalty, deliberate
  extent      -> boundary    the texture, accidental
  boundary    -> reader      not measured here; this only sets the ceiling

Reported as pairwise ordering agreement, because that is a reader's actual task:
"which pillar of this person's six is stronger." 7 profiles x 15 pairs = 105.
"""

import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))

import final_gallery as F  # noqa: E402
import gallery_probe as G  # noqa: E402
from turbulence_lab import AXES, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave  # noqa: E402

MAXR = 118.0
PROFILES = list(G.PROFILES) + [F.MONO]


def extents(profile, max_r=MAXR):
    ax = profile["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}

    def tradeoff(k):
        if prog[k] == 0:
            return 1.0
        pen = sum(prog[p] * prog[k] * G.PEN
                  for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)

    return grad, {a: (prog[a] ** G.POW * tradeoff(a) * max_r if grad[a] else 0.0) for a in AXES}


def boundary(profile, salt, max_r=MAXR, n=720):
    """Ring 0, the silhouette, in polar form. Identical under both ring-layer specs."""
    ax = profile["axes"]
    grad, ext = extents(profile, max_r)
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
        r = (max_r * 0.04 if grad[a0] == 0 else ext[a0]) * (1 - blend) \
            + (max_r * 0.04 if grad[a1] == 0 else ext[a1]) * blend
        pur = met[a0][0] * (1 - blend) + met[a1][0] * blend
        w0, w1 = (1 - blend) ** G.FALLOFF, blend ** G.FALLOFF
        turb = met[a0][1] * w0 + met[a1][1] * w1
        mat = min(grad[a0], 22) * w0 + min(grad[a1], 22) * w1
        r += perimeter_noise(theta + rot, phase) * (((1 - pur) * 4 + 1.8) * 1.4)
        r += turbulence_wave(theta + rot, phase, turb) * 9 * 1.0 * (0.4 + min(mat / 22, 1) * 2.1)
        out.append((deg, r))
    return out


def at(b, deg):
    n = len(b)
    return b[int(round(deg / 360 * n)) % n][1]


def lobe(b, deg, half=25.0):
    """What a reader sees: the mean radius over the lobe, not one sample."""
    n = len(b)
    step = 360.0 / n
    k = int(half / step)
    c = int(round(deg / step))
    return sum(b[(c + j) % n][1] for j in range(-k, k + 1)) / (2 * k + 1)


def pairs_kept(values, truth):
    kept = ties = 0
    for i in range(6):
        for j in range(i + 1, 6):
            a, b = AXES[i], AXES[j]
            if truth[a] == truth[b]:
                ties += 1
                continue
            if (values[a] - values[b]) * (truth[a] - truth[b]) > 0:
                kept += 1
    return kept, 15 - ties


if __name__ == "__main__":
    rows = []
    tot = {"ext": [0, 0], "pt": [0, 0], "lb": [0, 0]}
    print(f"{'contributor':16} {'grad->extent':>13} {'->point':>9} {'->lobe':>8}   worst reversal")
    for i, prof in enumerate(PROFILES):
        salt = i * 7919 + 13
        grad, ext = extents(prof)
        b = boundary(prof, salt)
        pt = {a: at(b, i2 * 60) for i2, a in enumerate(AXES)}
        lb = {a: lobe(b, i2 * 60) for i2, a in enumerate(AXES)}
        ke, ne = pairs_kept(ext, grad)
        kp, np_ = pairs_kept(pt, grad)
        kl, nl = pairs_kept(lb, grad)
        for k, (kk, nn) in (("ext", (ke, ne)), ("pt", (kp, np_)), ("lb", (kl, nl))):
            tot[k][0] += kk
            tot[k][1] += nn
        worst = ""
        gap = 0
        for x in range(6):
            for y in range(x + 1, 6):
                a, c = AXES[x], AXES[y]
                if grad[a] == grad[c]:
                    continue
                if (lb[a] - lb[c]) * (grad[a] - grad[c]) < 0:
                    d = abs(grad[a] - grad[c])
                    if d > gap:
                        gap, worst = d, f"{a} {grad[a]} reads below {c} {grad[c]}"
        rows.append((prof["name"], grad, ext, pt, lb))
        print(f"{prof['name']:16} {ke:>6}/{ne:<6} {kp:>4}/{np_:<4} {kl:>3}/{nl:<4}   {worst}")
    print()
    for k, label in (("ext", "graduations -> extent (trade-off penalty only)"),
                     ("pt", "graduations -> boundary, sampled at the axis angle"),
                     ("lb", "graduations -> boundary, averaged over the lobe")):
        k0, n0 = tot[k]
        print(f"{label:52} {k0}/{n0} = {100*k0/n0:.1f}%")
    print("\nchance on a pairwise ordering question is 50.0%\n")

    print("HOW BIG A DIFFERENCE SURVIVES: reversals by graduation gap, lobe reading")
    buckets = {}
    for _, grad, _, _, lb in rows:
        for x in range(6):
            for y in range(x + 1, 6):
                a, c = AXES[x], AXES[y]
                d = abs(grad[a] - grad[c])
                if d == 0:
                    continue
                ok = (lb[a] - lb[c]) * (grad[a] - grad[c]) > 0
                bu = "1-2" if d <= 2 else "3-5" if d <= 5 else "6-9" if d <= 9 else "10+"
                t = buckets.setdefault(bu, [0, 0])
                t[0] += ok
                t[1] += 1
    for bu in ("1-2", "3-5", "6-9", "10+"):
        if bu in buckets:
            k0, n0 = buckets[bu]
            print(f"  gap {bu:>4} graduations: {k0}/{n0} read correctly = {100*k0/n0:.0f}%")

    print("\nSIGNAL AGAINST NOISE, per axis instance (pixels at a 118px horizon)")
    sig = []
    noi = []
    for i, prof in enumerate(PROFILES):
        salt = i * 7919 + 13
        grad, ext = extents(prof)
        b = boundary(prof, salt)
        for i2, a in enumerate(AXES):
            noi.append(abs(lobe(b, i2 * 60) - ext[a]))
        vals = sorted(ext.values())
        sig += [vals[j + 1] - vals[j] for j in range(5)]
    sig.sort()
    noi.sort()
    med = lambda v: v[len(v) // 2]
    print(f"  median gap between two ADJACENT axes of one person: {med(sig):.1f}px")
    print(f"  median displacement the texture adds to a lobe:     {med(noi):.1f}px")
    print(f"  90th percentile displacement:                       {noi[int(len(noi)*0.9)]:.1f}px")

    print("\nACROSS PEOPLE, not within one: 42 axis instances pooled")
    xs, ys = [], []
    for i, prof in enumerate(PROFILES):
        salt = i * 7919 + 13
        grad, ext = extents(prof)
        b = boundary(prof, salt)
        for i2, a in enumerate(AXES):
            xs.append(grad[a])
            ys.append(lobe(b, i2 * 60))
    kept = n = 0
    for i in range(len(xs)):
        for j in range(i + 1, len(xs)):
            if xs[i] == xs[j]:
                continue
            n += 1
            kept += (ys[i] - ys[j]) * (xs[i] - xs[j]) > 0
    print(f"  pairwise ordering across all 42: {kept}/{n} = {100*kept/n:.1f}%")

    print("\nWHAT A MISREGISTERED READER GETS: the reader has no tick marks and")
    print("must place the six angles by eye. Ordering kept when every lobe is read")
    print("at an angle offset by this much:")
    for off in (0, 5, 10, 15, 20, 25, 30):
        k0 = n0 = 0
        for i, prof in enumerate(PROFILES):
            salt = i * 7919 + 13
            grad, _ = extents(prof)
            b = boundary(prof, salt)
            lb = {a: lobe(b, i2 * 60 + off) for i2, a in enumerate(AXES)}
            kk, nn = pairs_kept(lb, grad)
            k0 += kk
            n0 += nn
        print(f"  off by {off:>2} degrees: {k0}/{n0} = {100*k0/n0:.1f}%")

    print("\nCAN YOU SEE HEAT? boundary roughness against true turbulence.")
    print("Roughness = mean |r - smoothed r| over the silhouette, 15-degree smoothing.")
    tr, ro = [], []
    for i, prof in enumerate(PROFILES):
        salt = i * 7919 + 13
        b = boundary(prof, salt)
        n = len(b)
        sm = [sum(b[(j + k) % n][1] for k in range(-15, 16)) / 31 for j in range(n)]
        rough = sum(abs(b[j][1] - sm[j]) for j in range(n)) / n
        mixes = {}
        for a in AXES:
            for t, v in prof["axes"][a]["mix"].items():
                mixes[t] = mixes.get(t, 0) + v
        total = sum(mixes.values())
        turb = (mixes.get("heat", 0) + mixes.get("stance", 0)) / total
        tr.append(turb)
        ro.append(rough)
        print(f"  {prof['name']:16} true turbulence {turb:.3f}   rendered roughness {rough:.2f}px")
    order_t = sorted(range(7), key=lambda i: tr[i])
    order_r = sorted(range(7), key=lambda i: ro[i])
    print(f"  ranked by turbulence: {[PROFILES[i]['name'] for i in order_t]}")
    print(f"  ranked by roughness:  {[PROFILES[i]['name'] for i in order_r]}")
