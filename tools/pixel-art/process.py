#!/usr/bin/env python3
"""
Orchestrates the full deterministic pipeline:

  source image (AI-generated concept, any resolution)
    -> isolate subject (largest opaque component + crop)
    -> downscale to the target native pixel canvas
    -> quantize to pixel-style/palette.json
    -> despeckle color noise
    -> binarize alpha (hard edges, no anti-aliasing)
    -> remove tiny stray opaque specks
    -> [optional] directional shading pass
    -> [optional] silhouette-edge outline
    -> save to assets/generated/<asset_id>_v###.png
    -> validate
    -> print a report

Usage:
  python3 tools/pixel-art/process.py \\
      --input assets/_incoming/blacksmith/source.png \\
      --asset-id blacksmith_body \\
      --width 24 --height 40 \\
      --categories skin,hair,cloth_vest,leather \\
      --shading on --outline off

  # extracting just the head out of a full-character generation:
  python3 tools/pixel-art/process.py \\
      --input assets/_incoming/face_angry/source.png \\
      --asset-id face_angry --width 24 --height 40 \\
      --categories skin,hair,ui --crop-box 38,10,90,70
"""
import argparse
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from PIL import Image

import silhouette
import resize
import palette as palette_mod
import cleanup
import shading as shading_mod
import outlines
import validation

REPO_ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
GENERATED_DIR = os.path.join(REPO_ROOT, "assets", "generated")


def next_version_path(asset_id, out_dir=GENERATED_DIR):
    os.makedirs(out_dir, exist_ok=True)
    existing = [f for f in os.listdir(out_dir) if f.startswith(f"{asset_id}_v") and f.endswith(".png")]
    versions = []
    for f in existing:
        try:
            versions.append(int(f[len(asset_id) + 2 : -4]))
        except ValueError:
            continue
    next_v = (max(versions) + 1) if versions else 1
    return os.path.join(out_dir, f"{asset_id}_v{next_v:03d}.png"), next_v


def run_pipeline(input_path, asset_id, width, height, categories=None, shading="off", outline="off", outline_category=None, crop_box=None):
    img = Image.open(input_path).convert("RGBA")

    img = silhouette.binarize_alpha(img)
    if crop_box:
        # Extracting one region (head, arms) out of a full-character
        # generation — use the exact box, not auto-detection (which would
        # just find the whole character, the biggest connected shape).
        img = resize.crop_fixed_box(img, crop_box)
    else:
        bbox = silhouette.largest_component_bbox(img)
        if bbox:
            img = resize.crop_to_bbox(img, bbox)

    img = resize.downscale_to_grid(img, width, height)
    img = silhouette.binarize_alpha(img)  # downscale can reintroduce soft edges

    pal = palette_mod.load_palette()
    img = palette_mod.quantize_image(img, categories=categories, palette=pal)
    img = cleanup.despeckle_colors(img, passes=2)
    img = silhouette.remove_speckles(img, min_component_size=2)

    if shading == "on":
        img = shading_mod.apply_directional_shading(img, palette=pal)
        img = palette_mod.quantize_image(img, categories=categories, palette=pal)  # re-snap after shading edit

    if outline == "on":
        cat = outline_category or (categories[0] if categories else "hair")
        outline_hex = pal[cat]["outline"]
        img = outlines.apply_edge_outline(img, outline_hex)

    out_path, version = next_version_path(asset_id)
    img.save(out_path)
    return out_path, version, pal, categories


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--input", required=True, help="Path to the source concept image (any resolution)")
    ap.add_argument("--asset-id", required=True, help="lowercase_snake_case id, e.g. blacksmith_body")
    ap.add_argument("--width", type=int, required=True)
    ap.add_argument("--height", type=int, required=True)
    ap.add_argument("--categories", default="", help="Comma-separated palette categories this asset is allowed to use, e.g. skin,hair,cloth_vest")
    ap.add_argument("--shading", choices=["on", "off"], default="off")
    ap.add_argument("--outline", choices=["on", "off"], default="off")
    ap.add_argument("--outline-category", default=None, help="Which palette category's outline color to use (defaults to first --categories entry)")
    ap.add_argument("--crop-box", default=None, help="x0,y0,x1,y1 — extract this exact region instead of auto-detecting the subject. Use this when the input is a full-character generation and you only want the head or arms out of it.")
    args = ap.parse_args()

    categories = [c.strip() for c in args.categories.split(",") if c.strip()] or None
    crop_box = tuple(int(v) for v in args.crop_box.split(",")) if args.crop_box else None

    out_path, version, pal, categories = run_pipeline(
        args.input, args.asset_id, args.width, args.height,
        categories=categories, shading=args.shading, outline=args.outline,
        outline_category=args.outline_category, crop_box=crop_box
    )

    print(f"Wrote {out_path} (v{version:03d})")
    ok = validation.validate_and_report(out_path, args.width, args.height, palette=pal, categories=categories)
    if not ok:
        print("\nNOT approved — fix the issues above (or re-run with different flags) before promoting to assets/approved/.")
        sys.exit(1)
    else:
        print("\nValidation passed. Review the image, then manually copy it to assets/approved/ (and into src/assets/... when ready to ship) once you're happy with it.")


if __name__ == "__main__":
    main()
