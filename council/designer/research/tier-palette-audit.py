"""Audit the Dialecta seven-tier palette: WCAG contrast, CIEDE2000 separation,
and CVD simulation. Token values read from apps/web/src/styles/tokens.css."""
import itertools, math

TIERS = {
    "Forum":  dict(top="FEFBF0", bot="F8F0D8", border="E8D080", text="6A5410"),
    "Spark":  dict(top="FCF0D8", bot="F4D098", border="D89438", text="6A3C08"),
    "Echo":   dict(top="EAF0E0", bot="C8D8B0", border="708848", text="38440C"),
    "Fog":    dict(top="DCE0E4", bot="B0B8C4", border="687488", text="2C3848"),
    "Heat":   dict(top="E89868", bot="C46028", border="7C2C08", text="FCEAD8"),
    "Stance": dict(top="A8483C", bot="783028", border="401818", text="F4D8D0"),
    "Breach": dict(top="6A1818", bot="380808", border="200404", text="F0C8C8"),
}
PAGE = "F7F2E8"   # --bg-primary
WHITE = "FFFDF8"  # --bg-white


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def lum(h):
    r, g, b = (lin(c) for c in rgb(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(a, b):
    la, lb = lum(a), lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def to_lab(h):
    r, g, b = (lin(c) for c in rgb(h))
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 1.00000
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 216 / 24389 else (841 / 108) * t + 4 / 29
    fx, fy, fz = f(x), f(y), f(z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def ciede2000(h1, h2):
    L1, a1, b1 = to_lab(h1)
    L2, a2, b2 = to_lab(h2)
    C1, C2 = math.hypot(a1, b1), math.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - math.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7))) if Cb > 0 else 0
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = math.hypot(a1p, b1), math.hypot(a2p, b2)
    h1p = math.degrees(math.atan2(b1, a1p)) % 360 if (a1p or b1) else 0
    h2p = math.degrees(math.atan2(b2, a2p)) % 360 if (a2p or b2) else 0
    dLp, dCp = L2 - L1, C2p - C1p
    if C1p * C2p == 0:
        dhp = 0
    elif abs(h2p - h1p) <= 180:
        dhp = h2p - h1p
    else:
        dhp = h2p - h1p - 360 if h2p > h1p else h2p - h1p + 360
    dHp = 2 * math.sqrt(C1p * C2p) * math.sin(math.radians(dhp) / 2)
    Lbp, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    if C1p * C2p == 0:
        hbp = h1p + h2p
    elif abs(h1p - h2p) <= 180:
        hbp = (h1p + h2p) / 2
    else:
        hbp = (h1p + h2p + 360) / 2 if (h1p + h2p) < 360 else (h1p + h2p - 360) / 2
    T = (1 - 0.17 * math.cos(math.radians(hbp - 30)) + 0.24 * math.cos(math.radians(2 * hbp))
         + 0.32 * math.cos(math.radians(3 * hbp + 6)) - 0.20 * math.cos(math.radians(4 * hbp - 63)))
    dth = 30 * math.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * math.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7)) if Cbp > 0 else 0
    Sl = 1 + (0.015 * (Lbp - 50) ** 2) / math.sqrt(20 + (Lbp - 50) ** 2)
    Sc, Sh = 1 + 0.045 * Cbp, 1 + 0.015 * Cbp * T
    Rt = -math.sin(math.radians(2 * dth)) * Rc
    return math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2
                     + Rt * (dCp / Sc) * (dHp / Sh))


# Machado, Oliveira & Fernandes (2009) severity-1.0 CVD matrices.
CVD = {
    "protanopia":   ((0.152286, 1.052583, -0.204868), (0.114503, 0.786281, 0.099216), (-0.003882, -0.048116, 1.051998)),
    "deuteranopia": ((0.367322, 0.860646, -0.227968), (0.280085, 0.672501, 0.047413), (-0.011820, 0.042940, 0.968881)),
    "tritanopia":   ((1.255528, -0.076749, -0.178779), (-0.078411, 0.930809, 0.147602), (0.004733, 0.691367, 0.303900)),
}


def simulate(h, kind):
    r, g, b = (lin(c) for c in rgb(h))
    m = CVD[kind]
    out = []
    for row in m:
        v = row[0] * r + row[1] * g + row[2] * b
        v = max(0.0, min(1.0, v))
        v = 12.92 * v if v <= 0.0031308 else 1.055 * v ** (1 / 2.4) - 0.055
        out.append(f"{round(v * 255):02X}")
    return "".join(out)


def grade(r, large=False):
    need_aa, need_aaa = (3.0, 4.5) if large else (4.5, 7.0)
    if r >= need_aaa: return "AAA"
    if r >= need_aa:  return "AA "
    return "FAIL"


print("=" * 78)
print("1. BADGE LABEL: tier text on its own gradient (top stop and bottom stop)")
print("   WCAG 1.4.3 needs 4.5:1 for body text, 3:1 at 18.66px+ bold / 24px+.")
print("=" * 78)
print(f"{'Tier':8} {'on top':>8} {'grade':>6} {'on bot':>8} {'grade':>6}   worst")
for name, t in TIERS.items():
    rt, rb = ratio(t["text"], t["top"]), ratio(t["text"], t["bot"])
    worst = min(rt, rb)
    flag = "  <-- fails body text" if worst < 4.5 else ""
    print(f"{name:8} {rt:8.2f} {grade(rt):>6} {rb:8.2f} {grade(rb):>6}   {worst:.2f}{flag}")

print()
print("=" * 78)
print("2. TOPOLOGY BAR: can the seven segments be told apart?")
print("   Border colors carry segment identity. CIEDE2000 dE < 10 reads as")
print("   'same colour, slightly different' at small sizes.")
print("=" * 78)
pairs = []
for a, b in itertools.combinations(TIERS, 2):
    d = ciede2000(TIERS[a]["border"], TIERS[b]["border"])
    pairs.append((d, a, b))
pairs.sort()
for d, a, b in pairs[:8]:
    mark = "  <-- too close" if d < 15 else ""
    print(f"  dE {d:6.2f}   {a:8} vs {b:8}{mark}")
print(f"  ... {len(pairs)} pairs total, closest {pairs[0][0]:.2f}, median {pairs[len(pairs)//2][0]:.2f}")

print()
print("=" * 78)
print("3. COLOUR VISION DEFICIENCY: the same seven, simulated")
print("   ~8% of men have red-green CVD. Tier identity must not rest on hue.")
print("=" * 78)
for kind in CVD:
    sim = {n: simulate(t["border"], kind) for n, t in TIERS.items()}
    worst = sorted(((ciede2000(sim[a], sim[b]), a, b)
                    for a, b in itertools.combinations(TIERS, 2)))[:3]
    print(f"\n  {kind}:")
    for d, a, b in worst:
        mark = "  <-- indistinguishable" if d < 10 else ("  <-- close" if d < 15 else "")
        print(f"    dE {d:6.2f}   {a:8} vs {b:8}{mark}")

print()
print("=" * 78)
print("4. SEGMENT AGAINST THE PAGE: does a thin segment read at all?")
print("   Non-text contrast (WCAG 1.4.11) needs 3:1 against what adjoins it.")
print("=" * 78)
for name, t in TIERS.items():
    rp = ratio(t["border"], PAGE)
    rw = ratio(t["border"], WHITE)
    flag = "  <-- under 3:1 on the card surface" if rw < 3.0 else ""
    print(f"  {name:8} vs page {rp:5.2f}   vs card {rw:5.2f}{flag}")
