"""
A fingerprint with no radar chart under it.

The premise: stop computing six numbers and drawing a shape from them. Replay the
ledger and put one mark on the page per comment. Angle is which pillar the
comment moved, radius is when, colour is the territory, and the form of the mark
is the tier. The silhouette is then the outer level set of what the marks
deposit, so nobody draws it and nothing interpolates between spokes.

Three things fall out of that and none of them are patches.

  No notch. A weak pillar deposits little, and the envelope over that sector is
  held up by its neighbours' tails rather than pulled to a floor. Absence reads
  as a narrow place instead of a bite.

  No trade-off penalty. The record stops editorialising. A person who writes
  broadly already shows as dispersed; subtracting radius from their Acuity
  because they are also broad is a score's move, not a record's.

  A Breach subtracts. Universal Rule 1 says it earns nothing on any axis, so it
  deposits nothing. It takes density out of the field at its own date, which
  leaves a void that later work grows around without ever closing. No oxblood,
  no hue, nothing to collide with politics_governance.

Resonance is the gap between the last marks and the line: work that others
carried casts a shape larger than the marks that made it.

Run: python council/designer/research/ledger_render.py
"""

import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts"))
sys.path.insert(0, HERE)

import gallery_probe as G  # noqa: E402
from palette_check import FIXED as TOPICS  # noqa: E402

AXES = G.AXES
BG, INK, MUTED = G.BG, G.INK, G.MUTED

# Sector spread is wider than the 60 degrees a sector owns, so neighbours
# overlap. The overlap is the anti-notch: a pillar with no history still sits
# inside its neighbours' tails.
SECTOR = 60.0
SPREAD = 88.0

# TIER, as the form of one mark. Nothing here is a colour.
#   sigma      how far it reaches into the field
#   weight     how much density it lays down; Breach is negative
#   dot        drawn radius in px at S=640
#   form       how the mark is drawn
TIERS = {
    "forum":  dict(sigma=15, weight=1.00, dot=3.4, form="round"),
    "spark":  dict(sigma=15, weight=1.20, dot=3.8, form="core"),
    "echo":   dict(sigma=16, weight=0.42, dot=2.9, form="hollow"),
    "fog":    dict(sigma=27, weight=0.50, dot=4.6, form="diffuse"),
    "heat":   dict(sigma=15, weight=1.00, dot=3.2, form="radial"),
    "stance": dict(sigma=15, weight=1.00, dot=3.2, form="tangent"),
    "breach": dict(sigma=30, weight=-2.10, dot=0.0, form="void"),
}

# How many comments a life on the platform runs to before the disc stops
# growing. Radius is tenure rather than volume, so a prolific month reads as a
# dense band instead of as age.
CAREER_YEARS = 4.0
LEDGER_SCALE = 3   # the gallery profiles summarise; real ledgers are longer


def halton(i, base=2):
    f, r = 1.0, 0.0
    while i > 0:
        f /= base
        r += f * (i % base)
        i //= base
    return r


def synth_ledger(profile, heat_bias=0.0):
    """
    One ordered list of events for the whole person, from the per-axis summaries
    the gallery profiles carry. Real data would arrive this way already; this
    turns the summaries back into the sequence they came from.

    `heat_bias` of -1 puts Heat and Stance early in the life, +1 puts them late.
    """
    per_axis = {}
    for ai, a in enumerate(AXES):
        spec = profile["axes"][a]
        tiers = []
        for tier, n in spec["mix"].items():
            tiers += [tier] * (n * LEDGER_SCALE)
        n_ev = len(tiers)
        if n_ev == 0:
            per_axis[a] = []
            continue

        def key(j_t):
            j, t = j_t
            base = (math.sin((j * 12.9898 + ai * 78.233) * 43.7) + 1) / 2
            if t in ("heat", "stance"):
                return base * 0.45 + (0.5 + heat_bias * 0.5) * 0.55
            return base
        tiers = [t for _, t in sorted(enumerate(tiers), key=key)]

        phases = spec["phases"]
        span = sum(n for _, n in phases) or 1
        topics, acc = [], 0.0
        for topic, n in phases:
            acc += n / span * n_ev
            while len(topics) < round(acc):
                topics.append(topic)
        while len(topics) < n_ev:
            topics.append(phases[-1][0] if phases else None)

        per_axis[a] = [(topics[j], tiers[j]) for j in range(n_ev)]

    # Merge the six streams into one chronology by proportional interleave, so a
    # territory a person worked in shows as a band at one radius across every
    # sector rather than at a different radius in each.
    total = sum(len(v) for v in per_axis.values())
    heads = {a: 0 for a in AXES}
    events = []
    for _ in range(total):
        best, best_frac = None, 2.0
        for a in AXES:
            n = len(per_axis[a])
            if heads[a] >= n:
                continue
            frac = (heads[a] + 0.5) / n
            if frac < best_frac:
                best, best_frac = a, frac
        topic, tier = per_axis[best][heads[best]]
        events.append((best, topic, tier, heads[best], len(per_axis[best])))
        heads[best] += 1
    return events


def tenure_radius(years, S):
    """
    How far out this person's most recent comment sits. Saturating, so a veteran
    keeps growing and nobody arrives at an edge. Nothing about volume: a
    prolific month packs marks more densely into the same band.
    """
    t = max(0.0, years) / CAREER_YEARS
    return S * 0.075 + S * 0.335 * (t / (1 + t ** 3) ** (1 / 3.0)) ** 0.55


def place(events, S, years=1.0):
    """Give every event a pixel position. Angle is pillar, radius is date."""
    cx = cy = S / 2
    r0, rmax = S * 0.022, tenure_radius(years, S)
    n = len(events)
    counts = {a: 0 for a in AXES}
    out = []
    for gi, (axis, topic, tier, _, _) in enumerate(events):
        ai = AXES.index(axis)
        k = counts[axis]
        counts[axis] += 1
        # Low discrepancy inside the sector: even coverage, no visible grid.
        ang = ai * SECTOR + (halton(k + 1, 2) - 0.5) * SPREAD - 90.0
        t = (gi + 0.5) / max(1, n)
        # Between linear (true to a steady rate, crowds the centre) and sqrt
        # (even visual density, hollows the centre out). 0.75 keeps the middle
        # filled without stretching the early years.
        rad = r0 + t ** 0.75 * (rmax - r0)
        rad += (halton(gi + 3, 3) - 0.5) * (rmax - r0) * 0.07
        th = math.radians(ang)
        out.append(dict(axis=axis, topic=topic, tier=tier, gi=gi,
                        x=cx + math.cos(th) * rad, y=cy + math.sin(th) * rad,
                        r=rad, th=th))
    return out


def density(marks, S, scale=1.0):
    """Accumulate every mark's kernel. Breach subtracts."""
    D = np.zeros((S, S), dtype=np.float32)
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    for m in marks:
        t = TIERS[m["tier"]]
        sig = t["sigma"] * scale
        lo_x, hi_x = int(max(0, m["x"] - 3 * sig)), int(min(S, m["x"] + 3 * sig + 1))
        lo_y, hi_y = int(max(0, m["y"] - 3 * sig)), int(min(S, m["y"] + 3 * sig + 1))
        if lo_x >= hi_x or lo_y >= hi_y:
            continue
        dx = xs[lo_y:hi_y, lo_x:hi_x] - m["x"]
        dy = ys[lo_y:hi_y, lo_x:hi_x] - m["y"]
        D[lo_y:hi_y, lo_x:hi_x] += t["weight"] * np.exp(-(dx * dx + dy * dy) / (2 * sig * sig))
    return D


def envelope(D, S, resonance, n_ang=720, smooth=16, rmax=None):
    """
    Outermost crossing of the density threshold, per angle, smoothed circularly.

    The threshold falls with resonance, so a contributor others carried gets a
    line further out than their own marks reach.
    """
    cx = cy = S / 2
    lim = (rmax or S * 0.405) * 1.14
    # Threshold relative to the field this person actually laid down, so a
    # newcomer with fourteen marks gets a line and not a scatter.
    peak = float(np.percentile(D[D > 0], 92)) if (D > 0).any() else 1.0
    thr = peak * (0.40 - resonance * 0.22)
    rs = np.zeros(n_ang, dtype=np.float32)
    steps = np.arange(S * 0.035, lim, 1.0, dtype=np.float32)
    for i in range(n_ang):
        a = i / n_ang * 2 * math.pi
        xs = np.clip((cx + np.cos(a) * steps).astype(int), 0, S - 1)
        ys = np.clip((cy + np.sin(a) * steps).astype(int), 0, S - 1)
        v = D[ys, xs]
        hit = np.nonzero(v > thr)[0]
        rs[i] = steps[hit[-1]] if len(hit) else steps[0]
    # Circular gaussian smoothing, so the line is continuous in its first
    # derivative and a sparse sector reads as a narrow place, not a cusp.
    k = np.exp(-np.arange(-3 * smooth, 3 * smooth + 1) ** 2 / (2.0 * smooth * smooth))
    k /= k.sum()
    return np.convolve(np.tile(rs, 3), k, mode="same")[n_ang:2 * n_ang]


def bg_of(ink_only):
    return (255, 255, 255) if ink_only else BG


def draw_mark(d, m, S, colour, scale=1.0, ink_only=False):
    t = TIERS[m["tier"]]
    r = t["dot"] * (S / 640.0) * scale
    x, y, th = m["x"], m["y"], m["th"]
    c = INK if ink_only else colour
    if t["form"] == "void":
        return
    if t["form"] == "round":
        d.ellipse([x - r, y - r, x + r, y + r], fill=c)
    elif t["form"] == "core":
        d.ellipse([x - r * 1.5, y - r * 1.5, x + r * 1.5, y + r * 1.5],
                  outline=c, width=max(1, int(r * 0.45)))
        d.ellipse([x - r * 0.5, y - r * 0.5, x + r * 0.5, y + r * 0.5], fill=c)
    elif t["form"] == "hollow":
        d.ellipse([x - r, y - r, x + r, y + r], outline=c, width=max(1, int(r * 0.5)))
    elif t["form"] == "diffuse":
        # Fog spreads and has no centre. It reads as a smudge because that is
        # what it did to the conversation.
        for i, ring in enumerate((1.45, 1.05, 0.68)):
            rr = r * ring
            f = G.mix(bg_of(ink_only), c, 0.24 + i * 0.16)
            d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=f)
    elif t["form"] == "radial":
        L = r * 3.4
        d.line([x - math.cos(th) * L, y - math.sin(th) * L,
                x + math.cos(th) * L, y + math.sin(th) * L], fill=c, width=max(1, int(r * 0.8)))
    elif t["form"] == "tangent":
        L = r * 2.6
        px, py = -math.sin(th), math.cos(th)
        d.line([x - px * L, y - py * L, x + px * L, y + py * L], fill=c, width=max(1, int(r * 1.0)))


def render(profile, S=640, heat_bias=0.0, ink_only=False, show_marks=True,
           show_envelope=True, upto=1.0, line_w=1.6, bg=None):
    events = synth_ledger(profile, heat_bias)
    years = profile.get("years", 1.0)
    if upto < 1.0:
        events = events[: max(1, int(len(events) * upto))]
        years = years * upto
    marks = place(events, S, years)
    img = Image.new("RGB", (S, S), bg or BG)
    d = ImageDraw.Draw(img)

    if show_envelope:
        D = density(marks, S)
        rs = envelope(D, S, 0.0 if ink_only else profile.get("resonance", 0.0),
                      smooth=max(22, int(40 - len(marks) * 0.05)),
                      rmax=tenure_radius(years, S))
        cx = cy = S / 2
        pts = [(cx + math.cos(i / len(rs) * 2 * math.pi) * rs[i],
                cy + math.sin(i / len(rs) * 2 * math.pi) * rs[i]) for i in range(len(rs))]
        d.line(pts + [pts[0]], fill=INK, width=max(1, int(line_w * S / 640)))

    if show_marks:
        for m in marks:
            base, deep = TOPICS.get(m["topic"] or "", ("#8a8278", "#5a5248"))
            # Old marks sit deeper, which is what a cut surface looks like.
            depth = 1.0 - m["r"] / max(1.0, tenure_radius(years, S))
            col = G.mix(G.hex_rgb(base), G.hex_rgb(deep), depth * 0.55)
            draw_mark(d, m, S, col, ink_only=ink_only)
    return img, marks


def small(profile, px, heat_bias=0.0, bg=None):
    """The glance. Envelope only, rendered large and resampled."""
    S = 640
    img, _ = render(profile, S, heat_bias, show_marks=False,
                    line_w=2.2 * (24.0 / px) ** 0.62, bg=bg)
    return img.resize((px, px), Image.LANCZOS)


# Tenure, which sets how far out the newest marks sit.
YEARS = {"Ivy Chen": 0.06, "Marcus Aurel": 0.58, "Wen Zhao": 1.0, "Priya Raman": 2.0,
         "Father Anselm": 3.0, "Dolores Vance": 5.0, "Tom Reilly": 2.0}


def with_years(p):
    return {**p, "years": YEARS.get(p["name"], 1.0)}


def colour_field(marks, S):
    """
    Density, and the weighted-average territory colour at every pixel.

    Returns (D, C) where C is an S x S x 3 float array already divided through,
    so an era of one territory reads as a band of that colour and a month spent
    in two reads as the blend of them.
    """
    D = np.zeros((S, S), dtype=np.float32)
    C = np.zeros((S, S, 3), dtype=np.float32)
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    for m in marks:
        t = TIERS[m["tier"]]
        sig = t["sigma"]
        lo_x, hi_x = int(max(0, m["x"] - 3 * sig)), int(min(S, m["x"] + 3 * sig + 1))
        lo_y, hi_y = int(max(0, m["y"] - 3 * sig)), int(min(S, m["y"] + 3 * sig + 1))
        if lo_x >= hi_x or lo_y >= hi_y:
            continue
        dx = xs[lo_y:hi_y, lo_x:hi_x] - m["x"]
        dy = ys[lo_y:hi_y, lo_x:hi_x] - m["y"]
        k = np.exp(-(dx * dx + dy * dy) / (2 * sig * sig))
        D[lo_y:hi_y, lo_x:hi_x] += t["weight"] * k
        if t["weight"] > 0:
            base, deep = TOPICS.get(m["topic"] or "", ("#8a8278", "#5a5248"))
            depth = 1.0 - m["r"] / max(1.0, S * 0.41)
            col = np.array(G.mix(G.hex_rgb(base), G.hex_rgb(deep), depth * 0.55), dtype=np.float32)
            C[lo_y:hi_y, lo_x:hi_x] += (t["weight"] * k)[..., None] * col
    safe = np.maximum(D, 1e-5)[..., None]
    return D, C / safe


def outline_of(D, S, resonance, marks, years):
    rs = envelope(D, S, resonance, smooth=max(22, int(40 - len(marks) * 0.05)),
                  rmax=tenure_radius(years, S))
    cx = cy = S / 2
    n = len(rs)
    return [(cx + math.cos(i / n * 2 * math.pi) * rs[i],
             cy + math.sin(i / n * 2 * math.pi) * rs[i]) for i in range(n)]


def field_render(profile, S=640, heat_bias=0.0, px=None, ink=False, dots=False,
                 upto=1.0, bg=None, outline=True):
    """
    The mark at any size. One code path: the field is the identity, dots are the
    study level, the outline is what survives when nothing else does.
    """
    p = with_years(profile) if "years" not in profile else profile
    ev = synth_ledger(p, heat_bias)
    years = p["years"]
    if upto < 1.0:
        ev = ev[: max(1, int(len(ev) * upto))]
        years = years * upto
    marks = place(ev, S, years)
    D, C = colour_field(marks, S)
    poly = outline_of(D, S, 0.0 if ink else p.get("resonance", 0.0), marks, years)

    shape = Image.new("L", (S, S), 0)
    ImageDraw.Draw(shape).polygon(poly, fill=255)
    d = np.clip(D, 0, None)
    hi = np.percentile(d[d > 0], 96) if (d > 0).any() else 1.0
    a = np.clip(d / max(1e-6, hi), 0, 1) ** 0.62
    alpha = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S / 110))
    alpha = Image.composite(alpha, Image.new("L", (S, S), 0), shape)

    back = bg or ((255, 255, 255) if ink else BG)
    img = Image.new("RGB", (S, S), back)
    if ink:
        paint = Image.new("RGB", (S, S), (26, 22, 18))
    else:
        paint = Image.fromarray(np.clip(C, 0, 255).astype(np.uint8))
    img = Image.composite(paint, img, alpha.point(lambda v: int(v * 0.90)))

    dr = ImageDraw.Draw(img)
    if outline:
        dr.line(poly + [poly[0]], fill=INK, width=max(2, int(S / 300)))
    if dots:
        for m in marks:
            base, deep = TOPICS.get(m["topic"] or "", ("#8a8278", "#5a5248"))
            depth = 1.0 - m["r"] / max(1.0, tenure_radius(years, S))
            draw_mark(dr, m, S, G.mix(G.hex_rgb(base), G.hex_rgb(deep), depth * 0.75), ink_only=ink)
    return img.resize((px, px), Image.LANCZOS) if px else img


def breach_rings(D, S, years, fractions, weight=-1.5, sigma=None):
    """
    A Breach earns nothing on any pillar (Universal Rule 1), so it has no sector
    and cannot be a point. It belongs to a date and to nothing else, which in
    this geometry is a full circle.

    It subtracts. The field is thinned all the way round at that radius, leaving
    a void the later record grows outward from and never closes. Nothing is
    added, nothing is coloured, and nothing collides with a territory that
    happens to be red.
    """
    cx = cy = S / 2
    rmax, r0 = tenure_radius(years, S), S * 0.022
    sig = sigma or S * 0.021
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    rr = np.hypot(xs - cx, ys - cy)
    for f in fractions:
        rad = r0 + f ** 0.75 * (rmax - r0)
        D += weight * np.exp(-((rr - rad) ** 2) / (2 * sig * sig))
    return D


def field_render_breach(profile, S=640, heat_bias=0.0, px=None, breaches=(), upto=1.0,
                        dots=False, ink=False):
    p = with_years(profile) if "years" not in profile else profile
    ev = synth_ledger(p, heat_bias)
    years = p["years"]
    if upto < 1.0:
        ev = ev[: max(1, int(len(ev) * upto))]
        years = years * upto
    marks = place(ev, S, years)
    D, C = colour_field(marks, S)
    # A breach that happened before this moment sits at the fraction of THIS
    # record it fell at, so it stays where it happened as the disc grows.
    live = [b / max(1e-6, upto) for b in breaches if b <= upto]
    if live:
        D = breach_rings(D, S, years, live)
    poly = outline_of(D, S, p.get("resonance", 0.0), marks, years)
    shape = Image.new("L", (S, S), 0)
    ImageDraw.Draw(shape).polygon(poly, fill=255)
    d = np.clip(D, 0, None)
    hi = np.percentile(d[d > 0], 96) if (d > 0).any() else 1.0
    a = np.clip(d / max(1e-6, hi), 0, 1) ** 0.62
    alpha = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(S / 110))
    alpha = Image.composite(alpha, Image.new("L", (S, S), 0), shape)
    img = Image.new("RGB", (S, S), (255, 255, 255) if ink else BG)
    paint = Image.new("RGB", (S, S), (26, 22, 18)) if ink else Image.fromarray(np.clip(C, 0, 255).astype(np.uint8))
    img = Image.composite(paint, img, alpha.point(lambda v: int(v * 0.90)))
    dr = ImageDraw.Draw(img)
    dr.line(poly + [poly[0]], fill=INK, width=max(2, int(S / 300)))
    if dots:
        for m in marks:
            base, deep = TOPICS.get(m["topic"] or "", ("#8a8278", "#5a5248"))
            depth = 1.0 - m["r"] / max(1.0, tenure_radius(years, S))
            draw_mark(dr, m, S, G.mix(G.hex_rgb(base), G.hex_rgb(deep), depth * 0.75), ink_only=ink)
    return img.resize((px, px), Image.LANCZOS) if px else img
