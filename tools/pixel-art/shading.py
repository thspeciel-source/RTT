"""
Optional directional shading pass: nudges pixels on the upper-left edge of
each color region toward that palette category's `highlight`, and pixels
on the lower-right edge toward `shadow` — one step each way, matching
STYLE.md's "one shadow step, one highlight step, upper-left light" rule.

This is heuristic (edge-direction based), not true surface-normal shading.
Best used on AI-sourced concepts that came back flat-shaded; skip it for
assets where the source image already has directional lighting baked in
(check visually — see tools/pixel-art/validation.py + the review step in
Phase 12 of the pipeline doc).
"""
from palette import load_palette, flat_colors, rgb_to_hex, hex_to_rgb


def _category_for_color(rgb, palette):
    """Which category's `base`/`shadow`/`highlight` set does this color belong to, if any?"""
    for category, groups in palette.items():
        for group, hexval in groups.items():
            if hex_to_rgb(hexval) == tuple(rgb):
                return category, group
    return None, None


def apply_directional_shading(img, palette=None):
    palette = palette or load_palette()
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    edits = []

    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            category, group = _category_for_color((r, g, b), palette)
            if not category or group not in ("base",):
                continue  # only step base-colored fills; leave existing accents alone

            up = px[x, y - 1] if y > 0 else (0, 0, 0, 0)
            left = px[x - 1, y] if x > 0 else (0, 0, 0, 0)
            down = px[x, y + 1] if y < h - 1 else (0, 0, 0, 0)
            right = px[x + 1, y] if x < w - 1 else (0, 0, 0, 0)

            on_upper_left_edge = up[3] == 0 or left[3] == 0
            on_lower_right_edge = down[3] == 0 or right[3] == 0

            groups = palette[category]
            if on_upper_left_edge and not on_lower_right_edge and "highlight" in groups:
                edits.append((x, y, hex_to_rgb(groups["highlight"]) + (a,)))
            elif on_lower_right_edge and not on_upper_left_edge and "shadow" in groups:
                edits.append((x, y, hex_to_rgb(groups["shadow"]) + (a,)))

    for x, y, color in edits:
        px[x, y] = color

    return img
