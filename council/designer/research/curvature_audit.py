"""
Is the notch gone, or does it just look gone.

Signed curvature of the closed boundary, k = (r^2 + 2r'^2 - r r'') / (r^2 + r'^2)^1.5.
Negative is concave: the boundary turning into the shape. Reported against the
radius, so the number is scale free and comparable between the radar engine and
the ledger render.

  -1/R    a circle of the shape's own size, turning the wrong way. A deep bite.
   0      flat
  +1/R    a circle. Everything convex.

Run: python council/designer/research/curvature_audit.py
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
import numpy as np  # noqa
import final_gallery as F, gallery_probe as G, ledger_render as L  # noqa
import ring_layer_tuning as T  # noqa
import sketch_3_wall as W  # noqa

BIAS = {"Dolores Vance": -0.9, "Marcus Aurel": 0.25, "Ivy Chen": 0.4}


def stats(r, label):
    r = np.asarray(r, dtype=np.float64)
    n = len(r)
    d = 2 * math.pi / n
    r1 = (np.roll(r, -1) - np.roll(r, 1)) / (2 * d)
    r2 = (np.roll(r, -1) - 2 * r + np.roll(r, 1)) / (d * d)
    k = (r * r + 2 * r1 * r1 - r * r2) / (r * r + r1 * r1) ** 1.5
    R = r.mean()
    kn = k * R                       # scale free: +1 is a circle of this size
    concave = float((kn < 0).mean())
    return dict(label=label, worst=float(kn.min()), concave_frac=concave, R=R)


def radar_boundary(profile, S=640):
    """The current engine's outermost ring, sampled as a radius profile."""
    rings, _ = T.build(L.with_years(profile), S * 0.41, 7919, T.variant(**F.SPEC))
    pts = rings[0]
    rs, th = [], []
    for x, y, *_ in pts:
        rs.append(math.hypot(x, y))
        th.append(math.atan2(y, x))
    order = np.argsort(th)
    return np.array(rs)[order]


def ledger_boundary(profile, bias=0.0, S=512):
    p = L.with_years(profile) if "years" not in profile else profile
    ev = L.synth_ledger(p, bias)
    marks = L.place(ev, S, p["years"])
    D = L.density(marks, S)
    return L.envelope(D, S, p.get("resonance", 0.0),
                      smooth=max(22, int(40 - len(marks) * 0.05)),
                      rmax=L.tenure_radius(p["years"], S))


if __name__ == "__main__":
    print("RADAR ENGINE, the seven gallery profiles at the specified settings")
    rad = [stats(radar_boundary(p), p["name"]) for p in list(G.PROFILES) + [F.MONO]]
    for s in rad:
        print(f"  {s['label']:<16} worst kR {s['worst']:+7.2f}   concave over {s['concave_frac']*100:5.1f}% of the boundary")

    print("\nLEDGER RENDER, the same seven")
    led = [stats(ledger_boundary(p, BIAS.get(p["name"], 0.0)), p["name"]) for p in list(G.PROFILES) + [F.MONO]]
    for s in led:
        print(f"  {s['label']:<16} worst kR {s['worst']:+7.2f}   concave over {s['concave_frac']*100:5.1f}% of the boundary")

    print("\nLEDGER RENDER, twenty-four generated contributors")
    gen = [stats(ledger_boundary(p, p["bias"]), p["name"]) for p in (W.make(i) for i in range(24))]
    worst = min(gen, key=lambda s: s["worst"])
    print(f"  worst of the twenty-four: {worst['label']} at kR {worst['worst']:+.2f}")
    print(f"  mean worst kR {np.mean([s['worst'] for s in gen]):+.2f}, "
          f"mean concave fraction {np.mean([s['concave_frac'] for s in gen])*100:.1f}%")

    allled = led + gen
    print(f"\n{len(allled)} contributors on the ledger render")
    print(f"  worst kR anywhere       {min(s['worst'] for s in allled):+.2f}")
    print(f"  how many below kR -1.0  {sum(1 for s in allled if s['worst'] < -1.0)}")
    print(f"{len(rad)} on the radar engine")
    print(f"  worst kR anywhere       {min(s['worst'] for s in rad):+.2f}")
    print(f"  how many below kR -1.0  {sum(1 for s in rad if s['worst'] < -1.0)}")


def lowpass(r, frac=0.035):
    """
    Same angular smoothing on both, so the comparison is of the SHAPE rather
    than of the texture. The radar boundary carries base noise and the
    turbulence wave in the same array; the ledger envelope is already smoothed.
    Without this the radar number is mostly its own texture.
    """
    r = np.asarray(r, dtype=np.float64)
    n = len(r)
    sig = max(2.0, n * frac)
    k = np.exp(-np.arange(-3 * sig, 3 * sig + 1) ** 2 / (2 * sig * sig))
    k /= k.sum()
    return np.convolve(np.tile(r, 3), k, mode="same")[n:2 * n]


def resample(r, n=720):
    x = np.linspace(0, 1, len(r), endpoint=False)
    return np.interp(np.linspace(0, 1, n, endpoint=False), x, np.asarray(r, dtype=np.float64))


if __name__ == "__main__":
    print("\n\nTHE SAME BOUNDARIES, both low-passed at the same angular width")
    print("This is the shape argument with the texture taken out of both sides.\n")
    print(f"{'contributor':<16} {'radar kR':>10} {'radar concave':>15}   {'ledger kR':>10} {'ledger concave':>15}")
    profs = list(G.PROFILES) + [F.MONO]
    rows = []
    for p in profs:
        a = stats(lowpass(resample(radar_boundary(p))), p["name"])
        b = stats(lowpass(resample(ledger_boundary(p, BIAS.get(p["name"], 0.0)))), p["name"])
        rows.append((a, b))
        print(f"{p['name']:<16} {a['worst']:+10.2f} {a['concave_frac']*100:14.1f}%   "
              f"{b['worst']:+10.2f} {b['concave_frac']*100:14.1f}%")
    gen = [stats(lowpass(resample(ledger_boundary(p, p["bias"])))) if False else
           stats(lowpass(resample(ledger_boundary(p, p["bias"]))), p["name"])
           for p in (W.make(i) for i in range(24))]
    print(f"\ntwenty-four generated, ledger render: worst kR {min(s['worst'] for s in gen):+.2f}, "
          f"mean worst {np.mean([s['worst'] for s in gen]):+.2f}, "
          f"mean concave {np.mean([s['concave_frac'] for s in gen])*100:.1f}%")
    print(f"\nradar, seven:  worst kR {min(a['worst'] for a, _ in rows):+.2f}, "
          f"mean concave {np.mean([a['concave_frac'] for a, _ in rows])*100:.1f}%")
    print(f"ledger, seven: worst kR {min(b['worst'] for _, b in rows):+.2f}, "
          f"mean concave {np.mean([b['concave_frac'] for _, b in rows])*100:.1f}%")
