"""
Gate before any asset is considered finished. An asset that fails this
does not go into assets/approved/ (and never into src/assets/).
"""
import os
import re
from PIL import Image

from palette import load_palette, flat_colors

NAME_PATTERN = re.compile(r"^[a-z][a-z0-9_]*\.png$")


def validate(img_path, expected_w, expected_h, palette=None, categories=None):
    """Returns (ok: bool, problems: list[str])."""
    problems = []

    if not os.path.isfile(img_path):
        return False, [f"file does not exist: {img_path}"]

    filename = os.path.basename(img_path)
    if not NAME_PATTERN.match(filename):
        problems.append(f"naming: '{filename}' should be lowercase_snake_case.png")

    try:
        img = Image.open(img_path)
        img.load()
    except Exception as e:
        return False, [f"not a valid PNG: {e}"]

    if img.mode != "RGBA":
        problems.append(f"color mode: expected RGBA, got {img.mode} (needs an alpha channel)")
        img = img.convert("RGBA")

    if img.size != (expected_w, expected_h):
        problems.append(f"dimensions: expected {expected_w}x{expected_h}, got {img.size[0]}x{img.size[1]}")

    px = img.load()
    w, h = img.size
    alpha_values = set()
    seen_colors = set()
    for y in range(h):
        for x in range(min(w, expected_w)):
            if x >= w or y >= h:
                continue
            r, g, b, a = px[x, y]
            alpha_values.add(a)
            if a > 0:
                seen_colors.add((r, g, b))

    non_binary_alpha = alpha_values - {0, 255}
    if non_binary_alpha:
        problems.append(
            f"alpha not binary: found {len(non_binary_alpha)} intermediate alpha value(s) "
            f"(anti-aliased/soft edges) — run silhouette.binarize_alpha()"
        )

    if palette is not None:
        allowed = {rgb for _, _, rgb in flat_colors(palette if not categories else {k: v for k, v in palette.items() if k in categories})}
        off_palette = seen_colors - allowed
        if off_palette:
            sample = ", ".join(f"#{r:02x}{g:02x}{b:02x}" for r, g, b in list(off_palette)[:5])
            problems.append(f"palette compliance: {len(off_palette)} off-palette color(s), e.g. {sample}")

    if not seen_colors:
        problems.append("image is fully transparent — nothing drawn")

    return (len(problems) == 0), problems


def validate_and_report(img_path, expected_w, expected_h, palette=None, categories=None):
    ok, problems = validate(img_path, expected_w, expected_h, palette, categories)
    label = "PASS" if ok else "FAIL"
    print(f"[{label}] {img_path}")
    for p in problems:
        print(f"   - {p}")
    return ok
