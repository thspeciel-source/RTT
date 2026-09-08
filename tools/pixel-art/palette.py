"""
Loads pixel-style/palette.json and quantizes images to it.

Nothing in this pipeline lets a diffusion model's raw output colors
survive into an approved asset — every non-transparent pixel gets
snapped to the nearest master-palette entry.
"""
import json
import os

PALETTE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "pixel-style", "palette.json")


def load_palette(path=PALETTE_PATH):
    with open(path) as f:
        data = json.load(f)
    return {k: v for k, v in data.items() if not k.startswith("_")}


def flat_colors(palette=None):
    """Returns [(category, group, (r,g,b)), ...] for every palette entry."""
    palette = palette or load_palette()
    out = []
    for category, groups in palette.items():
        for group, hexval in groups.items():
            out.append((category, group, hex_to_rgb(hexval)))
    return out


def hex_to_rgb(hexval):
    hexval = hexval.lstrip("#")
    return tuple(int(hexval[i : i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb[:3])


def nearest_palette_color(rgb, palette_colors):
    """Euclidean-nearest color in RGB space. Good enough at this palette size."""
    r, g, b = rgb[:3]
    best = None
    best_dist = None
    for category, group, (pr, pg, pb) in palette_colors:
        d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        if best_dist is None or d < best_dist:
            best_dist = d
            best = (pr, pg, pb)
    return best


def quantize_image(img, categories=None, palette=None):
    """
    Snaps every non-transparent pixel to its nearest color among the given
    palette categories (or the whole palette if none specified). Alpha is
    preserved as-is here — run silhouette.binarize_alpha() separately.
    """
    palette = palette or load_palette()
    if categories:
        palette = {k: v for k, v in palette.items() if k in categories}
    colors = flat_colors(palette)

    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    cache = {}
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            key = (r, g, b)
            if key not in cache:
                cache[key] = nearest_palette_color(key, colors)
            nr, ng, nb = cache[key]
            px[x, y] = (nr, ng, nb, a)
    return img


if __name__ == "__main__":
    p = load_palette()
    print(f"Loaded {len(p)} categories, {len(flat_colors(p))} total colors.")
