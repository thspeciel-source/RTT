"""
Downscales a high-resolution concept image to the target native pixel-art
canvas. This is deliberately NOT a single naive resize — see crop_to_bbox +
downscale_to_grid below, used together by process.py.
"""
from PIL import Image


def crop_to_bbox(img, bbox, padding=1):
    """Crop to the subject's bounding box (from silhouette.largest_component_bbox) with a little breathing room."""
    w, h = img.size
    x0, y0, x1, y1 = bbox
    x0 = max(0, x0 - padding)
    y0 = max(0, y0 - padding)
    x1 = min(w, x1 + padding)
    y1 = min(h, y1 + padding)
    return img.crop((x0, y0, x1, y1))


def downscale_to_grid(img, target_w, target_h, fit="contain"):
    """
    Downscales using an area/box filter (averages neighborhoods rather than
    nearest-neighbor) so the intermediate downscale doesn't alias badly —
    this is the step that turns "a lot of detail" into "a deliberate pixel
    grid" instead of a naive shrink. Output canvas is exactly target_w x
    target_h; the source is scaled to fit inside it and centered.
    """
    img = img.convert("RGBA")
    src_w, src_h = img.size
    scale = min(target_w / src_w, target_h / src_h) if fit == "contain" else max(target_w / src_w, target_h / src_h)
    new_w = max(1, round(src_w * scale))
    new_h = max(1, round(src_h * scale))
    resized = img.resize((new_w, new_h), Image.BOX if scale < 1 else Image.NEAREST)

    canvas = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    offset = ((target_w - new_w) // 2, (target_h - new_h) - 1 if fit == "contain" else 0)
    offset = (max(0, offset[0]), max(0, min(target_h - new_h, offset[1])))
    canvas.alpha_composite(resized, offset)
    return canvas


def upscale_pixelated(img, factor):
    """Integer nearest-neighbor upscale for previewing at display size."""
    w, h = img.size
    return img.resize((w * factor, h * factor), Image.NEAREST)
