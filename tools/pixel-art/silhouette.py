"""
Alpha cleanup: turns a soft/anti-aliased alpha channel (typical of any
diffusion-generated or background-removed source image) into the hard
binary alpha pixel art requires, and isolates the main subject.
"""
from PIL import Image

ALPHA_THRESHOLD = 128


def binarize_alpha(img, threshold=ALPHA_THRESHOLD):
    """Every pixel becomes fully opaque or fully transparent. No feathered edges."""
    img = img.convert("RGBA")
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 255) if a >= threshold else (0, 0, 0, 0)
    return img


def row_widths(img):
    """[(y, xmin, xmax, width), ...] for every row in the image's own bounding box."""
    img = img.convert("RGBA")
    bbox = img.getbbox()
    if not bbox:
        return []
    px = img.load()
    w = img.width
    out = []
    for y in range(bbox[1], bbox[3]):
        xs = [x for x in range(bbox[0], bbox[2]) if px[x, y][3] > 0]
        if xs:
            out.append((y, min(xs), max(xs), max(xs) - min(xs) + 1))
        else:
            out.append((y, None, None, 0))
    return out


def find_neck_row(img, search_fraction=0.55):
    """
    Per-image head/shoulder boundary detection — NOT a fixed crop box.
    A standing character with a hat has a characteristic width profile:
    hat brim (wide) -> head (narrower) -> shoulders (wide again, and
    staying wide). The neck is the local-minimum-width row between the
    hat-brim peak and the shoulder rise. Only searches the top
    `search_fraction` of the figure so it can't wander down into the
    waist/legs, which can be just as narrow as the neck.

    Returns the absolute y-coordinate of the detected neck row, or None
    if the profile doesn't look like a hatted standing figure (caller
    should fall back to a manual/fixed crop in that case).
    """
    rows = row_widths(img)
    if len(rows) < 10:
        return None

    n = len(rows)
    search_end = int(n * search_fraction)
    widths = [w for _, _, _, w in rows]

    hat_peak_idx = max(range(min(search_end, n)), key=lambda i: widths[i])

    zone = widths[hat_peak_idx:search_end]
    if not zone:
        return None
    min_idx_in_zone = min(range(len(zone)), key=lambda i: zone[i])
    neck_idx = hat_peak_idx + min_idx_in_zone

    return rows[neck_idx][0]


def largest_component_bbox(img):
    """
    Bounding box of the largest connected opaque region, via flood fill.
    Use this to isolate the subject before removing background scraps a
    matting step left behind.
    """
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    visited = [[False] * w for _ in range(h)]
    best_size = 0
    best_bbox = None

    for sy in range(h):
        for sx in range(w):
            if visited[sy][sx] or px[sx, sy][3] == 0:
                continue
            stack = [(sx, sy)]
            visited[sy][sx] = True
            min_x = max_x = sx
            min_y = max_y = sy
            size = 0
            while stack:
                x, y = stack.pop()
                size += 1
                min_x, max_x = min(min_x, x), max(max_x, x)
                min_y, max_y = min(min_y, y), max(max_y, y)
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and px[nx, ny][3] > 0:
                        visited[ny][nx] = True
                        stack.append((nx, ny))
            if size > best_size:
                best_size = size
                best_bbox = (min_x, min_y, max_x + 1, max_y + 1)

    return best_bbox


def remove_speckles(img, min_component_size=3):
    """Deletes tiny isolated opaque blobs (matting noise, stray pixels)."""
    img = img.convert("RGBA")
    w, h = img.size
    px = img.load()
    visited = [[False] * w for _ in range(h)]

    for sy in range(h):
        for sx in range(w):
            if visited[sy][sx] or px[sx, sy][3] == 0:
                continue
            stack = [(sx, sy)]
            visited[sy][sx] = True
            component = [(sx, sy)]
            while stack:
                x, y = stack.pop()
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and px[nx, ny][3] > 0:
                        visited[ny][nx] = True
                        stack.append((nx, ny))
                        component.append((nx, ny))
            if len(component) < min_component_size:
                for x, y in component:
                    px[x, y] = (0, 0, 0, 0)

    return img
