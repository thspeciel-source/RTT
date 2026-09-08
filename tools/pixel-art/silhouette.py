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
