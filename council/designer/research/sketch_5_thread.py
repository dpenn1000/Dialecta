"""
Sketch 5. The mark as the way you reach a person.

A thread, with each contributor's record beside what they said. The strip at the
top is who is in the argument. Nobody has a tier badge, an avatar or a follower
count. You learn people the way you learn handwriting.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "..", "..", "scripts")); sys.path.insert(0, HERE)
from PIL import Image, ImageDraw  # noqa
import gallery_probe as G, ledger_render as L  # noqa
import sketch_3_wall as W  # noqa
from turbulence_lab import font  # noqa

THREAD = [
    (3,  "Dunne", "The 2019 figure everybody quotes is a projection, not a measurement. The\n"
                  "measured number landed 40% lower and nobody reissued the headline."),
    (10, "Kowal", "Taking that as read: does the projection method itself hold up, or was the\n"
                  "40% gap a one-off in a series that is otherwise sound?"),
    (19, "Trevelyan", "Steelmanning Dunne first. If the projection is structurally optimistic then\n"
                      "every downstream cost estimate inherits it, which is the real claim here."),
    (7,  "Halloran", "It held in 2014 and 2016. Two hits and one miss is not a structural fault,\n"
                     "and I would want the 2021 series before calling it one."),
    (14, "Quill", "This is the fourth thread this month making the same point about the same\n"
                  "figure. What is new in it."),
]

if __name__ == "__main__":
    profs = {i: W.make(i) for i, *_ in [(p[0],) for p in THREAD]}
    PAD, ROW, MARK = 34, 104, 40
    W_ = 900
    sheet = Image.new("RGB", (W_, 200 + len(THREAD) * ROW), G.BG)
    d = ImageDraw.Draw(sheet)
    d.text((PAD, 20), "Who is in this argument", font=font(20, True), fill=G.INK)
    d.text((PAD, 48), "Five records, and what each of them said. No badge, no avatar, no count.",
           font=font(11), fill=G.MUTED)

    x = PAD
    for idx, name, _ in THREAD:
        p = profs[idx]
        sheet.paste(L.field_render(p, 640, p["bias"], px=52), (x, 76))
        d.text((x, 132), name, font=font(10, True), fill=G.MUTED)
        x += 74
    d.line([PAD, 164, W_ - PAD, 164], fill=(220, 214, 200), width=1)

    y = 186
    for idx, name, text in THREAD:
        p = profs[idx]
        sheet.paste(L.field_render(p, 640, p["bias"], px=MARK), (PAD, y + 4))
        d.text((PAD + MARK + 18, y), name, font=font(13, True), fill=G.INK)
        d.text((PAD + MARK + 18 + d.textlength(name, font=font(13, True)) + 10, y + 3),
               f"{p['years']}y", font=font(10), fill=G.MUTED)
        for li, line in enumerate(text.split("\n")):
            d.text((PAD + MARK + 18, y + 22 + li * 17), line, font=font(12), fill=(58, 52, 46))
        y += ROW
        d.line([PAD + MARK + 18, y - 22, W_ - PAD, y - 22], fill=(232, 227, 214), width=1)
    out = os.path.join(HERE, "SKETCH-5-THE-THREAD.png")
    sheet.save(out, optimize=True); print("wrote", os.path.normpath(out), sheet.size)
