"""
Does the mark only ever grow?

Dan: "like a real fingerprint it grows with you but can never be changed."
The trade-off penalty makes an axis's extent a function of its PARTNERS'
history too, so earning on one pillar can pull another one in. This measures
how often and how far, using the shipped geometry (packages/core, soft horizon,
TRADEOFF_PENALTY 0.2, cap 0.3) at a 118px horizon.
"""
import os
import sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))
import gallery_probe as G
import final_gallery as F
from turbulence_lab import AXES

MAXR = 118.0
PROFILES = list(G.PROFILES) + [F.MONO]

def extents(grad):
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}
    def tf(k):
        if prog[k] == 0: return 1.0
        pen = sum(prog[p]*prog[k]*G.PEN for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)
    return {a: (prog[a]**G.POW*tf(a)*MAXR if grad[a] else 0.0) for a in AXES}, {a: tf(a) for a in AXES}

print("TRADE-OFF FACTOR per axis, as the gallery renders them (1.00 = nothing taken)")
print(f"{'':16}" + "".join(f"{a[:5]:>7}" for a in AXES))
for p in PROFILES:
    g = {a: p["axes"][a]["grad"] for a in AXES}
    _, tf = extents(g)
    print(f"{p['name']:16}" + "".join(f"{tf[a]:>7.2f}" for a in AXES))

print("\nONE MORE MONTH OF GOOD WORK: add 5 graduations to one pillar, and see what")
print("happens to the others. Every shrink below is a petal that retreats while the")
print("person did nothing but earn.")
shrinks = []
for p in PROFILES:
    g = {a: p["axes"][a]["grad"] for a in AXES}
    base, _ = extents(g)
    for a in AXES:
        g2 = dict(g); g2[a] += 5
        after, _ = extents(g2)
        for b in AXES:
            if b == a: continue
            d = after[b] - base[b]
            if d < -0.25:
                shrinks.append((d, p["name"], a, b, base[b], after[b]))
shrinks.sort()
for d, n, a, b, x, y in shrinks[:12]:
    print(f"  {n:16} earns +5 {a:12} -> {b:12} retreats {x:6.1f} -> {y:6.1f}px ({d:+.1f})")
print(f"\n  {len(shrinks)} of {len(PROFILES)*30} possible (earn, other-axis) pairs retreat by more than a quarter pixel")

print("\nDISCOURSE, the most taxed pillar: its extent with and without the penalty")
for p in PROFILES:
    g = {a: p["axes"][a]["grad"] for a in AXES}
    e, tf = extents(g)
    raw = G.horizon_progress(g["discourse"])**G.POW*MAXR if g["discourse"] else 0
    rank_with = sorted(AXES, key=lambda a: -e[a]).index("discourse") + 1
    rank_true = sorted(AXES, key=lambda a: -g[a]).index("discourse") + 1
    print(f"  {p['name']:16} discourse {g['discourse']:>2} grads: {raw:5.1f}px earned, {e['discourse']:5.1f}px drawn,"
          f" rank {rank_true} of 6 by record, {rank_with} of 6 as drawn")
