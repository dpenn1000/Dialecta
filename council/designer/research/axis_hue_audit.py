"""
Six axis hues against twelve territory hues, in OKLCH and under dichromacy.

Dan's original intent puts colour on the axis. The shipped engine and my ledger
proposal both put it on the territory. Six categories is a different problem
from twelve, and the question is whether the axis palette as it stands can carry
the job, not whether six could in principle.

Run: python council/designer/research/axis_hue_audit.py
"""
import math, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
import numpy as np  # noqa
import gallery_probe as G  # noqa
from palette_and_spacing import srgb_to_oklch, contrast  # noqa
from palette_check import FIXED as TOPICS  # noqa
from sketch_6_cvd import RGB2LMS, LMS2RGB, SIMS  # noqa

# The engine's own axis table, FINGERPRINT.md "fallback hue" column.
AXIS_HUE = {
    "acuity": "#d49415", "calibration": "#2674d4", "magnanimity": "#3aa564",
    "discourse": "#dc5418", "consistency": "#b8429a", "reach": "#a8a020",
}


def sim_rgb(rgb, kind):
    a = np.array(rgb, dtype=np.float32) / 255.0
    a = np.where(a <= 0.04045, a / 12.92, ((a + 0.055) / 1.055) ** 2.4) * 255.0
    out = ((a @ RGB2LMS.T) @ SIMS[kind].T) @ LMS2RGB.T / 255.0
    out = np.clip(out, 0, 1)
    out = np.where(out <= 0.0031308, out * 12.92, 1.055 * out ** (1 / 2.4) - 0.055)
    return tuple(int(round(v * 255)) for v in np.clip(out, 0, 1))


def oklab(rgb):
    L, C, H = srgb_to_oklch(rgb)
    return np.array([L, C * math.cos(math.radians(H)), C * math.sin(math.radians(H))])


def dE(a, b):
    """Euclidean in OKLab, with lightness weighted down so hue separation leads."""
    d = oklab(a) - oklab(b)
    return float(math.sqrt((d[0] * 0.5) ** 2 + d[1] ** 2 + d[2] ** 2))


def audit(name, palette):
    keys = list(palette)
    print(f"\n{name}  ({len(keys)} categories)")
    rows = []
    for k in keys:
        hexv = palette[k] if isinstance(palette[k], str) else palette[k][0]
        L, C, H = srgb_to_oklch(G.hex_rgb(hexv))
        rows.append((H, k, hexv, L, C))
    rows.sort()
    for H, k, hexv, L, C in rows:
        print(f"  {k:<24} {hexv}  L {L:.3f}  C {C:.3f}  H {H:6.1f}  vs page {contrast(G.hex_rgb(hexv), G.BG):5.2f}:1")
    gaps = [((rows[(i + 1) % len(rows)][0] - r[0]) % 360) for i, r in enumerate(rows)]
    print(f"  hue gaps: smallest {min(gaps):.1f}, largest {max(gaps):.1f}, even would be {360/len(rows):.1f}")

    out = {}
    for kind in ["normal"] + list(SIMS):
        cols = [G.hex_rgb(r[2]) if kind == "normal" else sim_rgb(G.hex_rgb(r[2]), kind) for r in rows]
        ds = [dE(cols[i], cols[j]) for i in range(len(cols)) for j in range(i + 1, len(cols))]
        worst = min(range(len(ds)), key=lambda x: ds[x])
        pairs = [(rows[i][1], rows[j][1]) for i in range(len(cols)) for j in range(i + 1, len(cols))]
        out[kind] = (min(ds), float(np.mean(ds)), pairs[worst])
        print(f"  {kind:<13} closest pair {min(ds):.4f}  mean {np.mean(ds):.4f}   "
              f"({pairs[worst][0]} / {pairs[worst][1]})")
    return out


if __name__ == "__main__":
    a = audit("AXIS HUES, the engine's own table", AXIS_HUE)
    t = audit("TERRITORY HUES, respaced in my legibility ruling", TOPICS)
    print("\n\nTHE COMPARISON THAT MATTERS")
    print(f"{'':<14} {'axis (6)':>12} {'territory (12)':>16}   {'axis advantage':>15}")
    for kind in ["normal"] + list(SIMS):
        print(f"  {kind:<12} {a[kind][0]:12.4f} {t[kind][0]:16.4f}   {a[kind][0]/t[kind][0]:14.2f}x")
    print("\nClosest pair is what decides a categorical palette: one collision makes two")
    print("categories one category, whatever the rest of the set scores.")
