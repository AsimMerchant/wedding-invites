#!/usr/bin/env python3
"""Generate the-tale/assets/img/og-card-reception.png — the WhatsApp/social
preview card for the reception-only invite, matching og-card.png's design.

Run from anywhere: python3 planning/make-og-reception.py
Requires Pillow (reads the vendored woff2 fonts directly)."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = ROOT / "the-tale/assets/fonts"
IMG = ROOT / "the-tale/assets/img"

W, H, SS = 1200, 630, 2  # final size, supersample factor
BG = (238, 241, 234)     # #eef1ea paper
INK = (36, 64, 107)      # #24406b navy
GOLD = (160, 127, 62)    # #a07f3e antique gold


def over(ink, alpha):
    return tuple(round(a * alpha + b * (1 - alpha)) for a, b in zip(ink, BG))


def font(name, px):
    return ImageFont.truetype(str(FONTS / name), round(px * SS))


def tracked(draw, text, f, tracking, cx, baseline, fill, fit_width=None):
    """Letter-spaced text, centered on cx (all coords at 1x scale).
    fit_width overrides tracking so the line spans exactly that width."""
    widths = [f.getlength(ch) / SS for ch in text]
    if fit_width:
        tracking = (fit_width - sum(widths)) / (len(text) - 1)
    total = sum(widths) + tracking * (len(text) - 1)
    x = cx - total / 2
    for ch, w in zip(text, widths):
        draw.text((x * SS, baseline * SS), ch, font=f, fill=fill, anchor="ls")
        x += w + tracking


im = Image.new("RGB", (W * SS, H * SS), BG)
d = ImageDraw.Draw(im)

# double gold frame
d.rectangle([21 * SS, 21 * SS, (W - 21) * SS, (H - 21) * SS], outline=over(GOLD, .60), width=2 * SS)
d.rectangle([30 * SS, 30 * SS, (W - 30) * SS, (H - 30) * SS], outline=over(GOLD, .30), width=1 * SS)

# crest, content scaled to 140px tall like the original card
crest = Image.open(IMG / "crest.png").convert("RGBA")
crest = crest.crop(crest.getbbox())
ch = 140 * SS
cw = round(crest.width * ch / crest.height)
crest = crest.resize((cw, ch), Image.LANCZOS)
im.paste(crest, ((W * SS - cw) // 2, 76 * SS), crest)

marcellus = "marcellus-400.woff2"
tracked(d, "BISMILLAH IR RAHMAN IR RAHIM", font(marcellus, 21), 7.4, 600, 248, over(INK, .68), fit_width=470)

# script names — sized to span ~860px like the original
names = "Asim weds Femina"
size = 110
f = font("pinyonscript-400.woff2", size)
while f.getlength(names) / SS < 860:
    size += 2
    f = font("pinyonscript-400.woff2", size)
bbox = f.getbbox(names, anchor="ls")
d.text((600 * SS, (272 - bbox[1] / SS) * SS), names, font=f, fill=GOLD, anchor="ms")

tracked(d, "RECEPTION · 7 DECEMBER 2026", font(marcellus, 32), 9.6, 600, 440, INK)
tracked(d, "8 PM · FAROHAR FARMS · SURAT", font(marcellus, 19), 7.6, 600, 478, over(INK, .72))
tracked(d, "Two souls with but a single thought, two hearts that beat as one.",
        font("cormorantgaramond-400-italic.woff2", 23), 0.4, 600, 519, over(INK, .55), fit_width=520)
tracked(d, "#THETALEOFFANDA", font(marcellus, 16), 5.6, 600, 552, over(GOLD, .70))

out = IMG / "og-card-reception.png"
im.resize((W, H), Image.LANCZOS).save(out)
print("wrote", out)