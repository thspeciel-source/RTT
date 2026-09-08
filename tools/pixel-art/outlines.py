"""
Optional silhouette-edge darkening. STYLE.md calls for NO full outline on
character sprites (the shipped art doesn't have one and reads fine) — this
is here for asset categories that do want it (small icons/bubbles read
better with a full edge, per assets/specs). Off unless explicitly enabled.
"""
from palette import hex_to_rgb


def apply_edge_outline(img, outline_hex, categories_only=None):
    """
    Darkens every opaque pixel that touches a transparent neighbor to
    outline_hex. Use sparingly — this is a full silhouette outline, which
    STYLE.md reserves for icons/bubbles, not characters.
    """
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    outline_rgb = hex_to_rgb(outline_hex)

    edge_pixels = []
    for y in range(h):
        for x in range(w):
            if px[x, y][3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if not (0 <= nx < w and 0 <= ny < h) or px[nx, ny][3] == 0:
                    edge_pixels.append((x, y))
                    break

    for x, y in edge_pixels:
        px[x, y] = outline_rgb + (255,)

    return img
