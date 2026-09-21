"""
When does the ring model say the heat happened?

tierMix is one aggregate per axis. It has no time in it. So the only thing that
decides WHERE in the mark heat appears is the recency weight in waveAmplitude,
0.3 at the core to 1.0 at the rim, which is the same for every contributor.

This measures, ring by ring on Dolores Vance, three things in the render:
  the turbulence wave, in pixels and as a share of that ring's radius
  the base noise every mark carries, in pixels and as a share of radius
If the core reads as "old heat" it has to be coming from somewhere, and this
says where.
"""
import math, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "scripts"))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "designer", "research"))
import gallery_probe as G
import final_gallery as F
from turbulence_lab import AXES, perimeter_noise, ring_rotation, ring_seed_for, turbulence_wave

MAXR = 122.0

def per_ring(prof, salt):
    ax = prof["axes"]
    grad = {a: ax[a]["grad"] for a in AXES}
    met = {a: G.metrics(ax[a]["mix"]) for a in AXES}
    prog = {a: G.horizon_progress(grad[a]) for a in AXES}
    def tradeoff(k):
        if prog[k] == 0: return 1.0
        pen = sum(prog[p]*prog[k]*G.PEN for a, b in G.PAIRS for p in ([b] if a == k else [a] if b == k else []))
        return 1 - min(pen, G.PENCAP)
    ext = {a: (prog[a]**G.POW*tradeoff(a)*MAXR if grad[a] else 0.0) for a in AXES}
    max_grad = max(min(grad[a], 22) for a in AXES)
    n = max(4, round(max_grad*1.15+4))
    clear = MAXR*0.08
    out = []
    for k in range(n):
        depth = k/max(1, n-1)
        ph = ring_seed_for(k, "walk", salt); rot = ring_rotation(k, "walk", salt)
        tw, bn, rr = [], [], []
        for p in range(360):
            th = math.radians(p); deg = p; i = int(deg//60) % 6
            a0, a1 = AXES[i], AXES[(i+1) % 6]
            bl = G.smoothstep((deg - i*60)/60)
            r0 = lambda a: MAXR*0.04 if grad[a] == 0 else ext[a]*(1-depth)+clear*depth
            r = r0(a0)*(1-bl)+r0(a1)*bl
            pur = met[a0][0]*(1-bl)+met[a1][0]*bl
            w0, w1 = (1-bl)**G.FALLOFF, bl**G.FALLOFF
            turb = met[a0][1]*w0+met[a1][1]*w1
            mat = min(grad[a0], 22)*w0+min(grad[a1], 22)*w1
            b = perimeter_noise(th+rot, ph)*(((1-pur)*4+1.8)*(1+(1-depth)*0.4))
            t = turbulence_wave(th+rot, ph, turb)*9*(0.3+(1-depth)*0.7)*(0.4+min(mat/22, 1)*2.1)
            tw.append(t); bn.append(b); rr.append(r)
        rms = lambda v: (sum(x*x for x in v)/len(v))**0.5
        mr = sum(rr)/len(rr)
        out.append((k, depth, mr, rms(tw), rms(bn)))
    return out

prof = next(p for p in G.PROFILES if p["name"] == "Dolores Vance")
idx = [p["name"] for p in G.PROFILES].index("Dolores Vance")
rows = per_ring(prof, idx*7919+13)
print("Dolores Vance, shipped ring model. depth 0 is the rim (most recent), 1 the core (oldest).")
print(f"{'ring':>4} {'depth':>6} {'radius':>7} {'heat px':>8} {'heat/r':>7} {'noise px':>9} {'noise/r':>8}")
for k, d, r, t, b in rows:
    if k % 3 == 0 or k == len(rows)-1:
        print(f"{k:>4} {d:>6.2f} {r:>7.1f} {t:>8.2f} {100*t/r:>6.1f}% {b:>9.2f} {100*b/r:>7.1f}%")
print()
anselm = next(p for p in G.PROFILES if p["name"] == "Father Anselm")
ia = [p["name"] for p in G.PROFILES].index("Father Anselm")
ra = per_ring(anselm, ia*7919+13)
print("Father Anselm, zero Heat and zero Stance anywhere in his record.")
print(f"{'ring':>4} {'depth':>6} {'radius':>7} {'heat px':>8} {'noise px':>9} {'noise/r':>8}")
for k, d, r, t, b in ra:
    if k % 4 == 0 or k == len(ra)-1:
        print(f"{k:>4} {d:>6.2f} {r:>7.1f} {t:>8.2f} {b:>9.2f} {100*b/r:>7.1f}%")

print("\nAT THE RIM, where five of the seven single-mark notes placed the heat ('lately'):")
print("the heat term against the noise floor every mark carries, ring 0, RMS in pixels.")
print(f"{'':16} {'turbulence':>10} {'heat px':>8} {'floor px':>9} {'heat/floor':>11}")
import final_gallery as F
for i, p in enumerate(list(G.PROFILES) + [F.MONO]):
    k, d, r, t, b = per_ring(p, i * 7919 + 13)[0]
    mixes = {}
    for a in AXES:
        for tt, v in p["axes"][a]["mix"].items():
            mixes[tt] = mixes.get(tt, 0) + v
    turb = (mixes.get("heat", 0) + mixes.get("stance", 0)) / sum(mixes.values())
    print(f"{p['name']:16} {turb:>10.3f} {t:>8.2f} {b:>9.2f} {t / b:>11.2f}")
