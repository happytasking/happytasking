"""Trim the new brand exports to their ink bounds and install them under public/brand."""

import os
from PIL import Image

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "brand-source")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "web/public/brand")


def trim(im: Image.Image, threshold: int = 12) -> Image.Image:
    """Crop to visible ink, ignoring the near-transparent halo the exports carry."""
    im = im.convert("RGBA")
    alpha = im.getchannel("A").point(lambda v: 255 if v > threshold else 0)
    bbox = alpha.getbbox()
    return im.crop(bbox) if bbox else im


def save(im: Image.Image, name: str, max_edge: int | None = None):
    out = im
    if max_edge and max(out.size) > max_edge:
        scale = max_edge / max(out.size)
        out = out.resize(
            (max(1, round(out.size[0] * scale)), max(1, round(out.size[1] * scale))),
            Image.LANCZOS,
        )
    path = os.path.join(OUT, name)
    out.save(path, optimize=True)
    kb = os.path.getsize(path) / 1024
    print(f"  {name:26} {out.size[0]:>5}x{out.size[1]:<5} {kb:7.1f} KB  ratio={out.size[0]/out.size[1]:.2f}")


def to_height(im: Image.Image, h: int) -> Image.Image:
    w = round(im.size[0] * h / im.size[1])
    return im.resize((w, h), Image.LANCZOS)


# 1 — app mark, padded back to a true square so it never renders off-centre
mark = trim(Image.open(f"{SRC}/1.png"))
side = max(mark.size)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.paste(mark, ((side - mark.size[0]) // 2, (side - mark.size[1]) // 2), mark)
print("mark:")
save(square, "logo-mark.png", 512)  # logo-mark.png is itself the 512 master
for px in (32, 64, 128, 180, 192):
    save(square.resize((px, px), Image.LANCZOS), f"logo-mark-{px}.png")

# 2 — icon + wordmark
print("lockup:")
lockup = trim(Image.open(f"{SRC}/2.png"))
save(lockup, "logo-lockup.png", 1200)
for h in (40, 48, 64, 96):
    save(to_height(lockup, h), f"logo-lockup-{h}.png")

# 3 — full lockup with tagline
print("full:")
full = trim(Image.open(f"{SRC}/3.png"))
save(full, "logo-full.png", 1400)
for h in (48, 64, 96, 128):
    save(to_height(full, h), f"logo-full-{h}.png")

# 4/5 — wordmark and tagline used separately in the header
print("wordmark + tagline:")
save(trim(Image.open(f"{SRC}/4.png")), "logo-wordmark.png", 1200)
tagline = trim(Image.open(f"{SRC}/5.png"))
save(tagline, "logo-tagline.png", 1200)
for h in (12, 16, 24):
    save(to_height(tagline, h), f"logo-tagline-{h}.png")

# 6 — monochrome marks
print("monochrome:")
save(trim(Image.open(f"{SRC}/6a.png")), "logo-mark-navy.png", 512)
save(trim(Image.open(f"{SRC}/6b.png")), "logo-mark-white.png", 512)

# 7 — social cards normalised to the 1200x630 OG box. JPEG, not PNG: these are
# full-bleed gradients with no transparency, where PNG costs ~8x the bytes.
print("social:")
for src, name in (("7b", "og-image.jpg"), ("7a", "og-wide.jpg")):
    im = Image.open(f"{SRC}/{src}.png").convert("RGB").resize((1200, 630), Image.LANCZOS)
    path = os.path.join(OUT, name)
    im.save(path, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"  {name:26} 1200x630   {os.path.getsize(path)/1024:7.1f} KB")
