"""
Post-quantization cleanup: removes single-pixel color noise (a pixel whose
color disagrees with all 4 of its opaque neighbors) and simplifies detail
that's too small to read at target resolution.
"""
from collections import Counter


def despeckle_colors(img, passes=1):
    """
    If a pixel's color matches none of its opaque orthogonal neighbors,
    replace it with the majority neighbor color. Cleans up quantization
    noise without touching intentional 1px accents (which agree with at
    least one neighbor by construction in hand-authored/AI-cleaned art).
    """
    img = img.convert("RGBA")
    w, h = img.size

    for _ in range(passes):
        px = img.load()
        edits = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                neighbor_colors = []
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h:
                        npx = px[nx, ny]
                        if npx[3] > 0:
                            neighbor_colors.append(npx[:3])
                if not neighbor_colors:
                    continue
                if (r, g, b) not in neighbor_colors:
                    majority = Counter(neighbor_colors).most_common(1)[0][0]
                    edits.append((x, y, majority + (a,)))
        for x, y, color in edits:
            px[x, y] = color

    return img


def simplify_tiny_regions(img, min_region_px=2):
    """Thin wrapper documenting intent — delegate actual component removal
    to silhouette.remove_speckles(), which already does this for opaque
    blobs smaller than min_region_px."""
    from silhouette import remove_speckles

    return remove_speckles(img, min_component_size=min_region_px)
